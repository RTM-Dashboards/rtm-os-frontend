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
//   DEPENDENCIES (Batch One):
//   - Template tasks carry offsetFrom: "launch" | "prereq" and prereqIndices.
//   - prereqIndices: the zero-based indices of prerequisite tasks within the
//     flattened ordered setup-task list of the same template.
//   - Tasks with offsetFrom="launch" get a due date immediately (as before).
//   - Tasks with offsetFrom="prereq" get no due date at launch; the cascade
//     in /api/tasks/done fills the date when the last prerequisite closes.
//   - task_dependencies rows are inserted for each valid prereqIndex. A
//     prereqIndex that is out of range is silently skipped (the task still
//     launches; the launch does not fail because a template was misconfigured).
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

// ── Types ──────────────────────────────────────────────────────────────────────

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
// prereqIndices: zero-based indices into the flattened ordered setup-task list
//   of this same template. For example, if the setup tasks are [A, B, C] and
//   C waits on B (index 1), then C.prereqIndices = [1].
//   An index that is out of range is silently ignored; the task still launches.
//   This means a template referring to a nonexistent prerequisite simply
//   creates the task with no dependency row — it behaves as an ordinary task.

interface TemplateTaskDef {
  label: string;
  department: string;
  offsetDays: number;
  offsetFrom?: "launch" | "prereq"; // default "launch"
  prereqIndices?: number[];          // indices into the flat setup-task list
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

export async function launchProject(businessId: string): Promise<LaunchResult> {
  const now = new Date().toISOString();
  const launchDate = new Date();

  const result: LaunchResult = {
    businessId,
    skipped:            false,
    projectId:          null,
    assignedAMId:       null,
    assignedAMName:     null,
    noEligibleAM:       false,
    categoriesCreated:  0,
    tasksCreated:       0,
    emptyDepartments:   [],
    errors:             [],
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
  // Primary: SalesHandoff.lineItems where processedClientId = business.clientId.
  // The handoff is matched by clientId (set when Billing processed it).
  // If multiple handoffs match (edge case), merge their lineItems deduped by serviceId.
  let lineItems: LineItem[] = [];

  if (business.clientId) {
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
  // Among Account Management users with isMain=true, pick the one with the
  // fewest open tasks (status='open' or 'in_progress'). Ties broken by name
  // alphabetically (first in sort order wins — deterministic).
  // THIS LOGIC IS UNCHANGED FROM THE PREVIOUS RUN.
  const mainAMs = await prisma.user.findMany({
    where: {
      department: "Account Management",
      isMain:     true,
      status:     "active",
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  let assignedAMId: string | null = null;
  let assignedAMName: string | null = null;

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

  result.assignedAMId   = assignedAMId;
  result.assignedAMName = assignedAMName;

  // ── 5. Create the project ─────────────────────────────────────────────────
  const projectId = makeId("proj");
  const project = await prisma.project.create({
    data: {
      id:         projectId,
      businessId: business.id,
      name:       business.displayName || business.domain,
      status:     "planned",
      assignedAM: assignedAMId ?? "",
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
        label: string;
        department: string;
        offsetDays: number;
        offsetFrom: "launch" | "prereq";
        prereqIndices: number[];
      }

      const flatTasks: FlatTask[] = [];

      if (template) {
        const groups = Array.isArray(template.groups)
          ? (template.groups as unknown as TemplateGroup[])
          : [];
        for (const group of groups) {
          if (group.kind === "setup" && Array.isArray(group.tasks)) {
            for (const t of group.tasks) {
              flatTasks.push({
                label:         t.label,
                department:    t.department ?? "",
                offsetDays:    t.offsetDays ?? 0,
                offsetFrom:    t.offsetFrom ?? "launch",
                prereqIndices: t.prereqIndices ?? [],
              });
            }
          }
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
                label: bullet,
                department: categoryDept,
                offsetDays: 0,
                offsetFrom: "launch",
                prereqIndices: [],
              });
            }
          }
        }
      }
      // If neither template nor deliverableGroups has content, flatTasks stays []
      // and the category is empty — correct per spec.

      // ── Create tasks, tracking their db ids by flat index ─────────────────
      // We insert all tasks first, then insert dependency rows. This avoids
      // any ordering constraint on which task must exist first.

      const createdTaskIds: (string | null)[] = [];

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
        const hasPrerequsites = taskDef.offsetFrom === "prereq";
        const dueDate = hasPrerequsites ? null : addDays(launchDate, taskDef.offsetDays);

        try {
          const taskId = makeId("task");
          await prisma.task.create({
            data: {
              id:         taskId,
              categoryId,
              label:      taskDef.label,
              status:     "open",
              ownerId,
              department: dept || null,
              dueDate,
              offsetFrom: taskDef.offsetFrom,
              offsetDays: taskDef.offsetDays,
              isSetup:    true,
              createdAt:  now,
              updatedAt:  now,
            },
          });
          createdTaskIds.push(taskId);
          result.tasksCreated++;
        } catch (err) {
          result.errors.push(
            `Task "${taskDef.label}": ${err instanceof Error ? err.message : String(err)}`
          );
          // Push null so index alignment is preserved for dep-row insertion.
          createdTaskIds.push(null);
        }
      }

      // ── Insert dependency rows ────────────────────────────────────────────
      // For each task with prereqIndices, insert one task_dependencies row per
      // valid index. An out-of-range index is silently skipped — the task
      // behaves as if it has no dependency on that missing prerequisite.
      // A null createdTaskId (failed task insert above) is also skipped.

      const depNow = new Date().toISOString();
      for (let i = 0; i < flatTasks.length; i++) {
        const taskDef = flatTasks[i];
        const taskId  = createdTaskIds[i];
        if (!taskId) continue;
        if (!taskDef.prereqIndices || taskDef.prereqIndices.length === 0) continue;

        for (const prereqIdx of taskDef.prereqIndices) {
          if (prereqIdx < 0 || prereqIdx >= createdTaskIds.length) {
            // Out-of-range: silently skip. Template misconfiguration does not
            // break the launch; the task is created as an unrestricted task.
            continue;
          }
          const prereqTaskId = createdTaskIds[prereqIdx];
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
              `Dependency ${String(prereqIdx)}→${i} for task "${taskDef.label}": ` +
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
