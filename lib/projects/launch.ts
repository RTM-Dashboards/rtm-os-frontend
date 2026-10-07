// RTM OS — Project Launch
//
// Called when Billing clears a business to Account Management.
// Creates one project per domain, categories per service sold, and setup tasks
// from each service's task list template (falling back to deliverableGroups if
// no template exists).
//
// WHAT THIS RUN DOES:
//   - Creates the project, categories, and setup tasks.
//   - Assigns the AM with the fewest open tasks among Account Management users
//     marked isMain=true. Ties broken by name (alphabetical, first wins).
//   - Routes each task to the member of the task's own department with the
//     fewest open tasks (all tasks, not just this project). Ties broken by name
//     (alphabetical, first wins — deterministic, no random).
//   - A department with no active members leaves the task unassigned; the launch
//     still succeeds. LaunchResult.emptyDepartments lists affected departments.
//   - Returns a LaunchResult describing what was created or why it was skipped.
//
//   DEPENDENCIES (Batch One + Two):
//   - Template tasks carry offsetFrom: "launch" | "prereq" and prereqIds.
//   - prereqIds: stable localId strings of prerequisite tasks within the same
//     template. Reordering tasks never changes which task a dep points at.
//   - Tasks with offsetFrom="launch" get a due date immediately (as before).
//   - Tasks with offsetFrom="prereq" get no due date at launch; the cascade
//     in /api/tasks/done fills the date when the last prerequisite closes.
//   - task_dependencies rows are inserted for each valid prereqId. A localId
//     that is not in the template is silently skipped (the task still launches;
//     the launch does not fail because a template was misconfigured).
//   - Legacy prereqIndices (Batch One format) are still accepted here as a
//     safety net; they are translated to localIds using flat-list position.
//
// WHAT THIS RUN DOES NOT DO:
//   - Recurring tasks are NOT generated. The template records whether a task
//     group is "setup" or "recurring"; only setup groups are processed here.
//   - AM workload counts open tasks in the tasks table. Tasks from this launch
//     count toward the next launch, not the current one (computed before insert).
//
// DOUBLE-LAUNCH PREVENTION:
//   A project for a businessId is only created if none exists. The check is a
//   findFirst on businessId before any write. If a project already exists,
//   LaunchResult.skipped is true and nothing is written.
//
// PARTIAL FAILURE:
//   The launch is not wrapped in a database transaction (Prisma 5's interactive
//   transactions are available but this avoids the complexity for now).
//   If the project is created and a category or task insert fails, the result
//   reports the partial state: projectId is set, categoriesCreated counts what
//   succeeded, errors lists what failed. A project with no categories is better
//   surfaced than hidden — the caller should log the result.

import { prisma } from "@/lib/db/prisma";
import { addBusinessDays } from "@/lib/dates";

// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * Options for the import path (existing client, no handoff).
 *
 * When supplied, launchProject uses these instead of looking up a SalesHandoff:
 *   - lineItems: service line items to create categories for.
 *   - assignedAMId: AM user id chosen on the import form (not by workload).
 *   - skipSetupTasks: true — import path creates ONLY recurring tasks.
 *
 * When omitted, launchProject behaves exactly as before (Billing clearance path).
 */
export interface LaunchImportOptions {
  lineItems: Array<{ serviceId: string; label: string; department: string }>;
  assignedAMId: string;
  assignedAMName: string;
  skipSetupTasks: true;
}

export interface LaunchResult {
  /** businessId the launch ran for */
  businessId: string;
  /** true if a project already existed and nothing was written */
  skipped: boolean;
  /** existing or newly created project id */
  projectId: string | null;
  /** Account Management User.id assigned, or null if none eligible */
  assignedAMId: string | null;
  /** name of assigned AM, for reporting */
  assignedAMName: string | null;
  /** true when no Main AM was available */
  noEligibleAM: boolean;
  /** number of categories created */
  categoriesCreated: number;
  /** number of tasks created across all categories */
  tasksCreated: number;
  /** number of recurring tasks created (subset of tasksCreated) */
  recurringTasksCreated: number;
  /** departments for which no active member exists; tasks left unassigned */
  emptyDepartments: string[];
  /** any per-category or per-task errors that occurred */
  errors: string[];
}

// ── BudgetLineItem (subset we need) ──────────────────────────────────────────

interface LineItem {
  serviceId: string;
  label: string;
  department: string;
}

// ── Template task shape ───────────────────────────────────────────────────────
//
// offsetFrom: "launch"  → due date = launchDate + offsetDays (default, existing behaviour)
//             "prereq"  → due date = lastPrereqCloseDate + offsetDays
//                         (no date at launch; cascade fills it later)
//
// prereqIds: stable localId strings of prerequisite tasks within the same template.
//   A localId that is not in the template is silently ignored; the task still
//   launches. This means a template with a stale prereqId (e.g. after a task
//   was removed) creates the task with no dependency row — it behaves as an
//   ordinary task.
//
//   Legacy prereqIndices are also supported here for safety; they are translated
//   using flat-list position.

interface TemplateTaskDef {
  label: string;
  department: string;
  offsetDays: number;
  offsetFrom?: "launch" | "prereq";  // default "launch"
  /** Stable local ids of prerequisite tasks (Batch Two format). */
  prereqIds?: string[];
  /** Legacy index-based prerequisites (Batch One format). Still accepted. */
  prereqIndices?: number[];
  /** Stable id unique within the template. */
  localId?: string;
  /**
   * Recurring tasks only. How many days after completion the next
   * occurrence should be scheduled. Zero/absent = no recurrence.
   */
  intervalDays?: number;
}

interface TemplateGroup {
  kind: "setup" | "recurring";
  heading: string;
  tasks: TemplateTaskDef[];
}

// ── DeliverableGroup (catalogue fallback) ─────────────────────────────────────

interface DeliverableGroup {
  heading: string;
  bullets: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Calendar addDays retained for non-task-offset uses (e.g. project end-date
// estimates).  Task due-date offsets use addBusinessDays from lib/dates.ts.
function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// ── Workload router ────────────────────────────────────────────────────────────
//
// Given a department name, return the id of the active member with the fewest
// open/in_progress tasks. Ties broken alphabetically by name (first in sort
// order wins — deterministic).
//
// Returns null when no active member exists in that department.
//
// The per-department member list and task counts are cached in the ownerCache
// map so repeated calls for the same department (common within a launch) do
// not re-query. The cache is local to the launch call; each launch starts fresh.

async function pickOwner(
  department: string,
  ownerCache: Map<string, string | null>,
): Promise<string | null> {
  if (ownerCache.has(department)) {
    return ownerCache.get(department) ?? null;
  }

  const members = await prisma.user.findMany({
    where: { department, status: "active" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (members.length === 0) {
    ownerCache.set(department, null);
    return null;
  }

  const taskCounts = await Promise.all(
    members.map(async (m) => {
      const count = await prisma.task.count({
        where: {
          ownerId: m.id,
          status:  { in: ["open", "in_progress"] },
        },
      });
      return { m, count };
    }),
  );

  // Sort ascending by count; name order (already sorted above) breaks ties.
  taskCounts.sort((a, b) => a.count - b.count);
  const winner = taskCounts[0].m.id;
  ownerCache.set(department, winner);
  return winner;
}

// ── Main launch function ───────────────────────────────────────────────────────

export async function launchProject(
  businessId: string,
  importOptions?: LaunchImportOptions,
): Promise<LaunchResult> {
  const now = new Date().toISOString();
  const launchDate = new Date();

  const result: LaunchResult = {
    businessId,
    skipped:              false,
    projectId:            null,
    assignedAMId:         null,
    assignedAMName:       null,
    noEligibleAM:         false,
    categoriesCreated:    0,
    tasksCreated:         0,
    recurringTasksCreated: 0,
    emptyDepartments:     [],
    errors:               [],
  };

  // Per-launch cache so we query each department at most once.
  const ownerCache = new Map<string, string | null>();

  // ── 1. Double-launch guard ─────────────────────────────────────────────────
  const existingProject = await prisma.project.findFirst({
    where: { businessId },
  });
  if (existingProject) {
    result.skipped   = true;
    result.projectId = existingProject.id;
    return result;
  }

  // ── 2. Load the business ──────────────────────────────────────────────────
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });
  if (!business) {
    result.errors.push(`Business not found: ${businessId}`);
    return result;
  }

  // ── 3. Resolve services sold ──────────────────────────────────────────────
  // Import path: lineItems are supplied directly (no handoff lookup).
  // Standard path: look up the SalesHandoff by processedClientId.
  let lineItems: LineItem[] = [];

  if (importOptions) {
    // Import path — use the caller-supplied line items directly.
    lineItems = importOptions.lineItems;
  } else if (business.clientId) {
    // Standard Billing-clearance path — look up the processed handoff.
    const handoffs = await prisma.salesHandoff.findMany({
      where: { processedClientId: business.clientId },
      select: { lineItems: true },
    });

    const seen = new Set<string>();
    for (const handoff of handoffs) {
      const items = Array.isArray(handoff.lineItems)
        ? (handoff.lineItems as unknown as LineItem[])
        : [];
      for (const item of items) {
        if (item.serviceId && !seen.has(item.serviceId)) {
          seen.add(item.serviceId);
          lineItems.push(item);
        }
      }
    }
  }

  // ── 4. Assign AM to the project ───────────────────────────────────────────
  // Import path: AM is chosen on the form — not by workload.
  // Standard path: pick the Main AM with the fewest open tasks.
  let assignedAMId: string | null = null;
  let assignedAMName: string | null = null;

  if (importOptions) {
    // Import path — use the caller-supplied AM directly.
    assignedAMId   = importOptions.assignedAMId;
    assignedAMName = importOptions.assignedAMName;
    if (!assignedAMId) {
      result.noEligibleAM = true;
    }
  } else {
    // Standard Billing-clearance path — pick by workload.
    const mainAMs = await prisma.user.findMany({
      where: {
        department: "Account Management",
        isMain:     true,
        status:     "active",
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    if (mainAMs.length === 0) {
      result.noEligibleAM = true;
    } else {
      const taskCounts = await Promise.all(
        mainAMs.map(async (am) => {
          const count = await prisma.task.count({
            where: {
              ownerId: am.id,
              status:  { in: ["open", "in_progress"] },
            },
          });
          return { am, count };
        })
      );

      taskCounts.sort((a, b) => a.count - b.count);
      const winner = taskCounts[0];
      assignedAMId   = winner.am.id;
      assignedAMName = winner.am.name;
    }
  }

  result.assignedAMId   = assignedAMId;
  result.assignedAMName = assignedAMName;

  // ── 5. Create the project ─────────────────────────────────────────────────
  // startDate = today. endDate = from the handoff's termLengthMonths (standard path)
  // or null for the import path (no handoff; client is already month-to-month).
  const projectStartDate = launchDate.toISOString().slice(0, 10);
  let projectEndDate: string | null = null;

  if (!importOptions && business.clientId) {
    // Standard Billing-clearance path: derive endDate from the processed handoff.
    const handoff = await prisma.salesHandoff.findFirst({
      where: { processedClientId: business.clientId },
      select: { termLengthMonths: true },
      orderBy: { processedAt: "desc" },
    });
    if (handoff?.termLengthMonths && handoff.termLengthMonths > 0) {
      const endD = new Date(launchDate);
      endD.setMonth(endD.getMonth() + handoff.termLengthMonths);
      projectEndDate = endD.toISOString().slice(0, 10);
    }
  }
  // Import path: endDate stays null. The client is already on a running
  // engagement; there is no handoff term to reference.

  const projectId = makeId("proj");
  const project = await prisma.project.create({
    data: {
      id:         projectId,
      businessId: business.id,
      name:       business.displayName || business.domain,
      status:     "active",
      assignedAM: assignedAMId ?? "",
      startDate:  projectStartDate,
      endDate:    projectEndDate,
      createdAt:  now,
      updatedAt:  now,
    },
  });

  result.projectId = project.id;

  // ── 6. Create categories and tasks ────────────────────────────────────────
  for (const item of lineItems) {
    // Resolve department label from catalogue (for the category row).
    let categoryDept = item.department ?? "";
    let catalogLabel = item.label ?? item.serviceId;

    try {
      const catalogItem = await prisma.serviceCatalogItem.findUnique({
        where: { id: item.serviceId },
        select: { department: true, label: true, deliverableGroups: true },
      });
      if (catalogItem) {
        categoryDept = catalogItem.department || categoryDept;
        catalogLabel = catalogItem.label      || catalogLabel;
      }

      // Create the category. department here is the category-level label;
      // individual tasks have their own department from the template.
      const categoryId = makeId("cat");
      await prisma.projectCategory.create({
        data: {
          id:           categoryId,
          projectId:    project.id,
          serviceId:    item.serviceId,
          serviceLabel: catalogLabel,
          department:   categoryDept,
          createdAt:    now,
        },
      });
      result.categoriesCreated++;

      // Resolve task list template for this service.
      const template = await prisma.taskListTemplate.findFirst({
        where: { serviceId: item.serviceId },
      });

      // ── Flatten setup tasks from template ──────────────────────────────────
      // We build a flat ordered list of all setup tasks across all setup groups.
      // Template prerequisite indices refer to positions in THIS flat list.

      interface FlatTask {
        localId: string;       // stable local id (empty string for fallback tasks)
        label: string;
        department: string;
        offsetDays: number;
        offsetFrom: "launch" | "prereq";
        /** Resolved to localId strings (may include legacy index translations). */
        prereqLocalIds: string[];
        /** True when this task came from a recurring group. */
        isRecurring: boolean;
        /**
         * Days after completion to schedule next occurrence.
         * Only meaningful when isRecurring=true and > 0.
         */
        intervalDays: number;
      }

      const flatTasks: FlatTask[] = [];

      if (template) {
        const groups = Array.isArray(template.groups)
          ? (template.groups as unknown as TemplateGroup[])
          : [];

        // Collect setup AND recurring tasks in flat order.
        // We keep them separate by group kind so we can set isRecurring correctly.
        // Legacy index translation: indices are relative to the setup group only
        // (recurring tasks cannot have prerequisites, so indices only matter for setup).
        const setupRaw: TemplateTaskDef[] = [];
        const recurringRaw: TemplateTaskDef[] = [];
        for (const group of groups) {
          if (!Array.isArray(group.tasks)) continue;
          if (group.kind === "setup") {
            for (const t of group.tasks) setupRaw.push(t);
          } else if (group.kind === "recurring") {
            for (const t of group.tasks) recurringRaw.push(t);
          }
        }

        // Build localId→position map for legacy index translation (setup only).
        const localIdByIndex = setupRaw.map((t) => t.localId ?? "");

        // Process setup tasks (with dependency support).
        // Import path: skip setup tasks — existing clients already have their
        // setup work done. Only recurring tasks are created on import.
        const processSetup = !importOptions?.skipSetupTasks;
        for (const t of (processSetup ? setupRaw : [])) {
          const prereqLocalIds: string[] = [];
          const seen = new Set<string>();

          for (const id of t.prereqIds ?? []) {
            if (id && !seen.has(id)) { prereqLocalIds.push(id); seen.add(id); }
          }
          for (const idx of t.prereqIndices ?? []) {
            const id = localIdByIndex[idx] ?? "";
            if (id && !seen.has(id)) { prereqLocalIds.push(id); seen.add(id); }
          }

          flatTasks.push({
            localId:       t.localId ?? "",
            label:         t.label,
            department:    t.department ?? "",
            offsetDays:    t.offsetDays ?? 0,
            offsetFrom:    t.offsetFrom ?? "launch",
            prereqLocalIds,
            isRecurring:   false,
            intervalDays:  0,
          });
        }

        // Process recurring tasks (no dependencies; intervalDays required).
        for (const t of recurringRaw) {
          const interval = typeof t.intervalDays === "number" && t.intervalDays > 0
            ? t.intervalDays
            : 0;
          // Skip recurring tasks with no interval — they cannot recur and are
          // not useful as plain one-off tasks either. Log and skip.
          if (interval === 0) {
            result.errors.push(
              `Recurring task "${t.label}" has no interval and was skipped (set a repeat interval in the task list editor)`
            );
            continue;
          }

          flatTasks.push({
            localId:       t.localId ?? "",
            label:         t.label,
            department:    t.department ?? "",
            offsetDays:    t.offsetDays ?? 0,
            offsetFrom:    "launch",   // recurring tasks always offset from launch
            prereqLocalIds: [],
            isRecurring:   true,
            intervalDays:  interval,
          });
        }
      } else if (catalogItem) {
        // Fall back to deliverableGroups bullets as tasks.
        // No per-task department in this fallback; use the category's department.
        // Fallback tasks never have prerequisites — no template means no deps.
        const deliverableGroups = Array.isArray(catalogItem.deliverableGroups)
          ? (catalogItem.deliverableGroups as unknown as DeliverableGroup[])
          : [];
        for (const group of deliverableGroups) {
          if (Array.isArray(group.bullets)) {
            for (const bullet of group.bullets) {
              flatTasks.push({
                localId:      "",
                label:        bullet,
                department:   categoryDept,
                offsetDays:   0,
                offsetFrom:   "launch",
                prereqLocalIds: [],
                isRecurring:  false,
                intervalDays: 0,
              });
            }
          }
        }
      }
      // If neither template nor deliverableGroups has content, flatTasks stays []
      // and the category is empty — correct per spec.

      // ── Create tasks, tracking their db ids by localId ────────────────────
      // We insert all tasks first (building a localId→dbTaskId map), then
      // insert dependency rows. This avoids ordering constraints and makes
      // reordering safe: deps reference stable localIds, not positions.

      // Map: template localId → created db task id (null if insert failed).
      const taskIdByLocalId = new Map<string, string | null>();

      for (const taskDef of flatTasks) {
        const dept = taskDef.department.trim();
        let ownerId: string | null = null;

        if (dept) {
          ownerId = await pickOwner(dept, ownerCache);
          if (ownerId === null && !result.emptyDepartments.includes(dept)) {
            result.emptyDepartments.push(dept);
          }
        }

        // A task with offsetFrom="prereq" gets no due date at launch.
        // A task with offsetFrom="launch" gets offsetDays from launchDate.
        // Recurring tasks always use offsetFrom="launch" at first occurrence.
        const hasPrerequisites = taskDef.offsetFrom === "prereq";
        const launchDateStr = launchDate.toISOString().slice(0, 10);
        const dueDate = hasPrerequisites ? null : addBusinessDays(launchDateStr, taskDef.offsetDays);

        try {
          const taskId = makeId("task");
          await prisma.task.create({
            data: {
              id:                     taskId,
              categoryId,
              label:                  taskDef.label,
              status:                 "open",
              ownerId,
              department:             dept || null,
              dueDate,
              offsetFrom:             taskDef.offsetFrom,
              offsetDays:             taskDef.offsetDays,
              isSetup:                !taskDef.isRecurring,
              isRecurring:            taskDef.isRecurring,
              recurrenceIntervalDays: taskDef.intervalDays,
              createdAt:              now,
              updatedAt:              now,
            },
          });
          if (taskDef.localId) taskIdByLocalId.set(taskDef.localId, taskId);
          result.tasksCreated++;
          if (taskDef.isRecurring) result.recurringTasksCreated++;
        } catch (err) {
          result.errors.push(
            `Task "${taskDef.label}": ${err instanceof Error ? err.message : String(err)}`
          );
          if (taskDef.localId) taskIdByLocalId.set(taskDef.localId, null);
        }
      }

      // ── Insert dependency rows ────────────────────────────────────────────
      // For each task with prereqLocalIds, insert one task_dependencies row per
      // valid localId. A localId not found in the map (stale reference after a
      // task was removed) is silently skipped — the task behaves as unrestricted.
      // A null db task id (failed task insert above) is also skipped.

      const depNow = new Date().toISOString();
      for (const taskDef of flatTasks) {
        if (!taskDef.localId) continue;
        const taskId = taskIdByLocalId.get(taskDef.localId);
        if (!taskId) continue;
        if (!taskDef.prereqLocalIds || taskDef.prereqLocalIds.length === 0) continue;

        for (const prereqLocalId of taskDef.prereqLocalIds) {
          if (!taskIdByLocalId.has(prereqLocalId)) {
            // Dangling ref (task removed from template): silently skip.
            continue;
          }
          const prereqTaskId = taskIdByLocalId.get(prereqLocalId);
          if (!prereqTaskId) continue; // prereq task failed to create; skip

          try {
            await prisma.taskDependency.create({
              data: {
                id:             makeId("dep"),
                taskId,
                requiresTaskId: prereqTaskId,
                createdAt:      depNow,
              },
            });
          } catch (err) {
            // Dep insert failure is non-fatal. The task exists; it just won't
            // be blocked properly. Report it.
            result.errors.push(
              `Dependency "${prereqLocalId}"→"${taskDef.localId}" for task "${taskDef.label}": ` +
              (err instanceof Error ? err.message : String(err))
            );
          }
        }
      }
    } catch (err) {
      result.errors.push(
        `Service ${item.serviceId}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return result;
}
