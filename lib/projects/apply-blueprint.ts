// RTM OS — applyBlueprintToProject
//
// Extracted service-blueprint logic from launchProject.  Applies one
// task-list blueprint (by templateId) to an existing project, creating
// a ProjectCategory and its setup + recurring tasks.
//
// IDEMPOTENCY:
//   Recurring tasks carry an occurrence_key with a partial unique index
//   (see prisma/schema.prisma and recurring engine notes). Applying the
//   same blueprint twice for recurring tasks is blocked at the DB level.
//
//   Setup tasks (isSetup=true) have no occurrence_key; they use a
//   per-project label+categoryId guard instead. Before inserting each
//   setup task we check whether a task with the same label already exists
//   in a category for this project that was created from the same blueprint
//   (matched by serviceId). If a row with that label+categoryId exists we
//   skip it. The key cannot collide across projects because categoryId is
//   project-scoped (each ProjectCategory.projectId is unique per service).
//
// QUERY BATCHING (Task 3):
//   pickOwner accepts a pre-fetched WorkloadCache so the caller can load
//   all workload counts once before the task loop.  launchProject and the
//   new apply-blueprint route both use buildWorkloadCache before looping.

import { prisma } from "@/lib/db/prisma";
import { addOffsetDays } from "@/lib/dates";
import { notifyTaskAssigned } from "@/lib/notifications/send";
import { makeId as makePrprereqId } from "@/lib/projects/blueprint-prerequisites";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ApplyBlueprintOptions {
  /** Project id to attach tasks to. */
  projectId: string;
  /** task_list_templates.id to apply. */
  templateId: string;
  /**
   * Date to use as "launch date" for offsetFrom="launch" tasks.
   * Defaults to today.
   */
  applyDate?: Date;
  /**
   * When true, skip setup tasks and only create recurring tasks.
   * Mirrors the import-path behaviour.
   */
  skipSetupTasks?: boolean;
  /**
   * Pre-fetched workload cache (Task 3 batch optimisation).
   * If omitted, a fresh local cache is used for this call.
   */
  workloadCache?: WorkloadCache;
  /**
   * Project name used for task-assigned notifications.
   * If omitted, fetched from the project row.
   */
  projectName?: string;
}

export interface ApplyBlueprintResult {
  /** true if the template was not found */
  templateNotFound: boolean;
  /** id of the ProjectCategory created (null if template not found) */
  categoryId: string | null;
  /** number of tasks created */
  tasksCreated: number;
  /** number of recurring tasks created (subset of tasksCreated) */
  recurringTasksCreated: number;
  /** number of setup tasks skipped as duplicates */
  tasksSkippedDuplicate: number;
  /** departments with no active member; tasks left unassigned */
  emptyDepartments: string[];
  /** per-task errors (non-fatal) */
  errors: string[];
  /**
   * When a declared prerequisite blueprint is also on this project, the
   * dependent category's tasks are created as pending_prereq and a binding
   * is recorded here. Empty when no prerequisite bound.
   */
  listPrereqBound: boolean;
  /** id of the prerequisite ProjectCategory that must finish first (or null) */
  prereqCategoryId: string | null;
}

// ── WorkloadCache (Task 3) ────────────────────────────────────────────────────
//
// Map: department → winner user id (null if no active member).
// Built once before the task loop; pickOwner reads from it.

export type WorkloadCache = Map<string, string | null>;

/**
 * Fetch open-task counts for all active users, grouped by department.
 * Returns a WorkloadCache that pickOwner reads instead of querying per task.
 *
 * Query count before Task 3: 1 + N (one findMany users per dept + one count
 * per member) = 1 + members_in_dept per department call, repeated per task.
 * For 20 tasks across 4 departments with avg 3 members each: ~20 * (1+3) = 80
 * queries.
 *
 * Query count after Task 3 (this function + pickOwner):
 *   2 queries total: one user findMany (all depts), one task count groupBy.
 * pickOwner then reads from the Map — zero additional queries per task.
 * For 20 tasks: 2 queries regardless.
 */
export async function buildWorkloadCache(
  departments: string[],
): Promise<WorkloadCache> {
  const cache: WorkloadCache = new Map();
  if (departments.length === 0) return cache;

  // Fetch all active members across relevant departments in one query.
  const members = await prisma.user.findMany({
    where:   { department: { in: departments }, status: "active" },
    select:  { id: true, name: true, department: true },
    orderBy: { name: "asc" },
  });

  if (members.length === 0) {
    for (const dept of departments) cache.set(dept, null);
    return cache;
  }

  // Fetch open-task counts for all relevant members in one groupBy.
  const memberIds = members.map((m) => m.id);
  const taskCounts = await prisma.task.groupBy({
    by:    ["ownerId"],
    where: { ownerId: { in: memberIds }, status: { in: ["open", "in_progress"] } },
    _count: { id: true },
  });
  const countMap = new Map(taskCounts.map((r) => [r.ownerId ?? "", r._count.id]));

  // Group members by department; pick the winner per dept.
  const byDept = new Map<string, Array<{ id: string; name: string }>>();
  for (const m of members) {
    const dept = m.department ?? "";
    const arr  = byDept.get(dept) ?? [];
    arr.push(m);
    byDept.set(dept, arr);
  }

  for (const dept of departments) {
    const deptMembers = byDept.get(dept);
    if (!deptMembers || deptMembers.length === 0) {
      cache.set(dept, null);
      continue;
    }
    // Sort by count asc; name order (already asc from DB) breaks ties.
    const ranked = deptMembers
      .map((m) => ({ id: m.id, count: countMap.get(m.id) ?? 0 }))
      .sort((a, b) => a.count - b.count);
    cache.set(dept, ranked[0].id);
  }

  return cache;
}

/**
 * Read owner from cache (already resolved by buildWorkloadCache).
 * Never issues a database query.
 */
export function pickOwner(
  department: string,
  cache: WorkloadCache,
): string | null {
  return cache.get(department) ?? null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Template task shapes (mirrored from launch.ts) ────────────────────────────

interface TemplateTaskDef {
  label: string;
  department: string;
  offsetDays: number;
  offsetFrom?: "launch" | "prereq";
  prereqIds?: string[];
  prereqIndices?: number[];
  localId?: string;
  intervalDays?: number;
  ownerRole?: string;
  // Named assignee (Task 2): user.id selected in the blueprint editor.
  // When present and the user is active, the task is assigned directly
  // to this person instead of running department workload routing.
  assigneeUserId?: string;
  estimatedHours?: number;
  priority?: string;
  description?: string;
}

interface TemplateGroup {
  kind: "setup" | "recurring";
  heading: string;
  tasks: TemplateTaskDef[];
}

interface FlatTask {
  localId: string;
  label: string;
  department: string;
  offsetDays: number;
  offsetFrom: "launch" | "prereq";
  prereqLocalIds: string[];
  isRecurring: boolean;
  intervalDays: number;
  ownerRole: string | null;
  // Named assignee (Task 2): user.id from the blueprint task definition.
  assigneeUserId: string | null;
  estimatedHours: number | null;
  priority: string | null;
  description: string | null;
}

// ── Main exported function ────────────────────────────────────────────────────

/**
 * Apply one blueprint to an existing project.
 *
 * Creates one ProjectCategory and the setup + recurring tasks from the
 * template. Uses `applyDate` (defaulting to today) as the launch anchor
 * for due-date offset calculations — identical to how launchProject computes
 * them so a list applied later produces the same dates it would have produced
 * at launch for the same template's dueDateOffsetExcludeWeekends flag.
 *
 * Safe to call multiple times with the same templateId+projectId:
 * - Recurring tasks: blocked by the partial unique index on occurrence_key.
 * - Setup tasks: skipped when a task with the same label already exists in a
 *   category of this project that was created from the same serviceId.
 */
export async function applyBlueprintToProject(
  opts: ApplyBlueprintOptions,
): Promise<ApplyBlueprintResult> {
  const {
    projectId,
    templateId,
    applyDate = new Date(),
    skipSetupTasks = false,
  } = opts;

  const result: ApplyBlueprintResult = {
    templateNotFound:      false,
    categoryId:            null,
    tasksCreated:          0,
    recurringTasksCreated: 0,
    tasksSkippedDuplicate: 0,
    emptyDepartments:      [],
    errors:                [],
    listPrereqBound:       false,
    prereqCategoryId:      null,
  };

  const now         = new Date().toISOString();
  const applyDateStr = applyDate.toISOString().slice(0, 10);

  // ── 1. Load template ──────────────────────────────────────────────────────
  const template = await prisma.taskListTemplate.findUnique({
    where: { id: templateId },
  });
  if (!template) {
    result.templateNotFound = true;
    return result;
  }

  // ── 2. Load project name if not supplied ──────────────────────────────────
  let projectName = opts.projectName;
  if (!projectName) {
    const proj = await prisma.project.findUnique({
      where:  { id: projectId },
      select: { name: true },
    });
    projectName = proj?.name ?? projectId;
  }

  // ── 3. Flatten tasks from the template ────────────────────────────────────
  const groups = Array.isArray(template.groups)
    ? (template.groups as unknown as TemplateGroup[])
    : [];

  const setupRaw:     TemplateTaskDef[] = [];
  const recurringRaw: TemplateTaskDef[] = [];
  for (const g of groups) {
    if (!Array.isArray(g.tasks)) continue;
    if (g.kind === "setup")     for (const t of g.tasks) setupRaw.push(t);
    else if (g.kind === "recurring") for (const t of g.tasks) recurringRaw.push(t);
  }

  const localIdByIndex = setupRaw.map((t) => t.localId ?? "");
  const flatTasks: FlatTask[] = [];

  // Setup tasks (skipped on import path).
  if (!skipSetupTasks) {
    for (const t of setupRaw) {
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
        localId:        t.localId ?? "",
        label:          t.label,
        department:     t.department ?? "",
        offsetDays:     t.offsetDays ?? 0,
        offsetFrom:     t.offsetFrom ?? "launch",
        prereqLocalIds,
        isRecurring:    false,
        intervalDays:   0,
        ownerRole:      t.ownerRole      ?? null,
        assigneeUserId: typeof t.assigneeUserId === "string" && t.assigneeUserId ? t.assigneeUserId : null,
        estimatedHours: typeof t.estimatedHours === "number" ? t.estimatedHours : null,
        priority:       t.priority       ?? null,
        description:    t.description    ?? null,
      });
    }
  }

  // Recurring tasks.
  for (const t of recurringRaw) {
    const interval = typeof t.intervalDays === "number" && t.intervalDays > 0
      ? t.intervalDays : 0;
    if (interval === 0) {
      result.errors.push(
        `Recurring task "${t.label}" has no interval and was skipped`,
      );
      continue;
    }
    flatTasks.push({
      localId:        t.localId ?? "",
      label:          t.label,
      department:     t.department ?? "",
      offsetDays:     t.offsetDays ?? 0,
      offsetFrom:     "launch",
      prereqLocalIds: [],
      isRecurring:    true,
      intervalDays:   interval,
      ownerRole:      t.ownerRole      ?? null,
      assigneeUserId: typeof t.assigneeUserId === "string" && t.assigneeUserId ? t.assigneeUserId : null,
      estimatedHours: typeof t.estimatedHours === "number" ? t.estimatedHours : null,
      priority:       t.priority       ?? null,
      description:    t.description    ?? null,
    });
  }

  // ── 4. Build workload cache ───────────────────────────────────────────────
  // Use pre-supplied cache if provided; otherwise build a local one.
  const departments = [...new Set(flatTasks.map((t) => t.department).filter(Boolean))];
  const workloadCache: WorkloadCache =
    opts.workloadCache ?? await buildWorkloadCache(departments);

  // ── 5. Resolve or reuse the ProjectCategory ──────────────────────────────
  //
  // FIX 1: One service means one category per project.  Before creating a new
  // category, look for an existing one on this project for the same serviceId.
  // If one is found, reuse it; if not, create one as before.  This ensures a
  // second apply of the same blueprint leaves no empty orphan category.
  //
  // Resolve catalogue label/dept (needed for create path only, but harmless).
  let serviceLabel = template.name || template.serviceId;
  let categoryDept = template.department || "";
  try {
    const catalogItem = await prisma.serviceCatalogItem.findUnique({
      where:  { id: template.serviceId },
      select: { label: true, department: true },
    });
    if (catalogItem) {
      if (catalogItem.label)      serviceLabel = catalogItem.label;
      if (catalogItem.department) categoryDept = catalogItem.department;
    }
  } catch {
    // catalogue lookup is best-effort; proceed with template defaults
  }

  // Look for an existing category for this project + serviceId.
  const existingCatForService = await prisma.projectCategory.findFirst({
    where:  { projectId, serviceId: template.serviceId },
    select: { id: true },
  });

  let categoryId: string;
  if (existingCatForService) {
    // Reuse the existing category — no new row created.
    categoryId = existingCatForService.id;
  } else {
    // First application: create a new category.
    categoryId = makeId("cat");
    await prisma.projectCategory.create({
      data: {
        id:           categoryId,
        projectId,
        serviceId:    template.serviceId,
        serviceLabel,
        department:   categoryDept,
        createdAt:    now,
      },
    });
  }
  result.categoryId = categoryId;

  // ── 5b. List-level prerequisite binding ──────────────────────────────────
  //
  // Check whether any declared prerequisite blueprint is also applied to this
  // project. If so, this list's tasks will be created as "pending_prereq" and
  // a binding is recorded in project_list_prereq_bindings.
  //
  // A prerequisite only binds when:
  //   (a) the blueprint declares it via blueprint_prerequisites, AND
  //   (b) the prerequisite blueprint has a ProjectCategory on this project.
  //
  // An unbound prerequisite (the client did not buy the prerequisite service)
  // changes nothing: the list behaves as it does today.

  // Look up the internal PK for this template.
  const internalTemplateId = template.id;

  // Load any declared prerequisite blueprint ids for this blueprint.
  const declaredPrereqs = await prisma.blueprintPrerequisite.findMany({
    where:  { blueprintId: internalTemplateId },
    select: { prerequisiteId: true },
  });

  let boundPrereqCategoryId: string | null = null;
  let boundPrereqBlueprintId: string | null = null;

  if (declaredPrereqs.length > 0) {
    // Check whether an existing binding already covers this dep→project pair.
    const existingBinding = await prisma.projectListPrereqBinding.findFirst({
      where: { projectId, depCategoryId: categoryId, unblockedAt: null },
      select: { id: true, prereqCategoryId: true },
    });

    if (!existingBinding) {
      // Find a prerequisite blueprint that is already on this project.
      for (const { prerequisiteId } of declaredPrereqs) {
        // A blueprint's categories can be identified by looking at categories
        // whose blueprintTemplateId matches (for tasks created by apply-blueprint)
        // or by serviceId matching (for categories created at launch).
        // The most reliable way: find a ProjectCategory on this project where
        // any task has blueprintTemplateId = prerequisiteId, OR where the
        // category's serviceId matches the blueprint's serviceId.
        const prereqTemplate = await prisma.taskListTemplate.findUnique({
          where:  { id: prerequisiteId },
          select: { id: true, serviceId: true },
        });
        if (!prereqTemplate) continue;

        // Find a category on this project for the prerequisite blueprint.
        // Match by serviceId (covers both launch and apply-blueprint paths).
        const prereqCat = await prisma.projectCategory.findFirst({
          where: { projectId, serviceId: prereqTemplate.serviceId },
          select: { id: true },
        });

        if (prereqCat) {
          boundPrereqCategoryId  = prereqCat.id;
          boundPrereqBlueprintId = prerequisiteId;
          break; // first found wins; multiple prereqs all bind independently
        }
      }
    }
  }

  // If bound: record the binding. Tasks will be created as "pending_prereq".
  const isPendingPrereq = boundPrereqCategoryId !== null;
  if (isPendingPrereq && boundPrereqCategoryId && boundPrereqBlueprintId) {
    try {
      await prisma.projectListPrereqBinding.upsert({
        where:  { projectId_depCategoryId_prereqCategoryId: {
          projectId,
          depCategoryId:    categoryId,
          prereqCategoryId: boundPrereqCategoryId,
        }},
        update: {},
        create: {
          id:                makePrprereqId("plpb"),
          projectId,
          depCategoryId:     categoryId,
          prereqCategoryId:  boundPrereqCategoryId,
          depBlueprintId:    internalTemplateId,
          prereqBlueprintId: boundPrereqBlueprintId,
          unblockedAt:       null,
          createdAt:         now,
        },
      });
      result.listPrereqBound  = true;
      result.prereqCategoryId = boundPrereqCategoryId;
    } catch (err) {
      // Non-fatal: binding creation failing should not block task creation.
      // Without the binding the tasks would be open (worse), but task creation
      // still proceeds as pending_prereq since isPendingPrereq is true.
      result.errors.push(
        `Failed to record list prerequisite binding: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  // ── 6. Idempotency: find existing tasks in this project for this serviceId ─
  //
  // FIX 2: Key the guard on blueprint_task_id when the existing task has one,
  // and fall back to label when blueprint_task_id is NULL.
  //
  // Why the fallback is essential: tasks created before the blueprint_task_id
  // column was populated have it NULL.  Matching only on blueprint_task_id
  // would miss those rows and duplicate every task on an older project.  The
  // fallback means pre-column tasks are still recognised by label.
  //
  // Why renaming a blueprint task still works: if the task was stored with
  // blueprint_task_id set, we match on that id regardless of the current
  // label, so a renamed task is recognised as the same task and skipped.
  //
  // Collect all tasks from every category of this project that shares the
  // same serviceId (there is now at most one such category, but the query is
  // correct for any count).
  const allCatsForService = await prisma.projectCategory.findMany({
    where:  { projectId, serviceId: template.serviceId },
    select: { id: true },
  });
  const allCatIds = allCatsForService.map((c) => c.id);

  // existingByBlueprintId: blueprint_task_id → true  (for tasks that have one)
  // existingByLabel:        label             → true  (for tasks with NULL id)
  const existingByBlueprintId = new Set<string>();
  const existingByLabel       = new Set<string>();
  if (allCatIds.length > 0) {
    const existing = await prisma.task.findMany({
      where:  { categoryId: { in: allCatIds } },
      select: { label: true, blueprintTaskId: true },
    });
    for (const e of existing) {
      if (e.blueprintTaskId) {
        existingByBlueprintId.add(e.blueprintTaskId);
      } else {
        existingByLabel.add(e.label);
      }
    }
  }

  // ── 7. Insert tasks ───────────────────────────────────────────────────────
  const taskIdByLocalId = new Map<string, string | null>();

  for (const taskDef of flatTasks) {
    // Idempotency: skip setup tasks that already exist on this project.
    //
    // FIX 2 matching logic:
    //   if the taskDef has a localId AND that localId appears in existingByBlueprintId
    //     → skip (matched on blueprint_task_id)
    //   else if the taskDef's label appears in existingByLabel
    //     → skip (label fallback for tasks with NULL blueprint_task_id)
    //
    // This means:
    //   - Renamed tasks with a stored blueprint_task_id are still recognised.
    //   - Pre-column tasks (blueprint_task_id NULL) are recognised by label.
    if (!taskDef.isRecurring) {
      const matchedById    = taskDef.localId ? existingByBlueprintId.has(taskDef.localId) : false;
      const matchedByLabel = existingByLabel.has(taskDef.label);
      if (matchedById || matchedByLabel) {
        result.tasksSkippedDuplicate++;
        if (taskDef.localId) taskIdByLocalId.set(taskDef.localId, null);
        continue;
      }
    }

    const dept = taskDef.department.trim();

    // ── Resolve owner (Task 3) ────────────────────────────────────────────────
    // If the blueprint task names an assignee, try to use them directly.
    // If that person is inactive/missing, fall back to department routing
    // and record the fallback so the project can show it.
    let ownerId: string | null = null;
    let resolvedBlueprintAssigneeId: string | null = null;

    if (taskDef.assigneeUserId) {
      // Validate that the named person exists and is active.
      const namedUser = await prisma.user.findFirst({
        where:  { id: taskDef.assigneeUserId, status: "active" },
        select: { id: true },
      });
      if (namedUser) {
        // Named person is active — assign directly.
        ownerId = namedUser.id;
        resolvedBlueprintAssigneeId = namedUser.id;
      } else {
        // Named person is inactive or missing — fall back to department routing.
        // Record the fallback so the apply result reports it.
        result.errors.push(
          `Task "${taskDef.label}": blueprint names assignee ${taskDef.assigneeUserId} who is ` +
          `inactive or not found; fell back to department routing for "${dept || "(no dept)"}"`,
        );
        ownerId = dept ? pickOwner(dept, workloadCache) : null;
      }
    } else {
      // No named assignee — use department routing as before.
      ownerId = dept ? pickOwner(dept, workloadCache) : null;
    }

    if (dept && ownerId === null && !result.emptyDepartments.includes(dept)) {
      result.emptyDepartments.push(dept);
    }

    const hasPrereqs = taskDef.offsetFrom === "prereq";
    const dueDate    = hasPrereqs
      ? null
      : addOffsetDays(applyDateStr, taskDef.offsetDays, template.dueDateOffsetExcludeWeekends);

    // occurrence_key for recurring tasks — same format as launchProject.
    const occurrenceKey =
      taskDef.isRecurring && taskDef.localId && dueDate
        ? `${template.id}:${taskDef.localId}:${categoryId}:${dueDate}`
        : null;

    // If an identical occurrence_key exists, skip (recurring idempotency).
    if (occurrenceKey) {
      const collision = await prisma.task.findFirst({
        where:  { occurrenceKey },
        select: { id: true },
      });
      if (collision) {
        result.tasksSkippedDuplicate++;
        if (taskDef.localId) taskIdByLocalId.set(taskDef.localId, null);
        continue;
      }
    }

    try {
      const taskId = makeId("task");
      await prisma.task.create({
        data: {
          id:                     taskId,
          categoryId,
          label:                  taskDef.label,
          // When a list-level prerequisite is bound, tasks are created as
          // "pending_prereq" so they are visible but not workable. Their due
          // dates are provisional and will be recomputed when the prereq finishes.
          // Recurring tasks are not affected by list-level prerequisites because
          // a recurring list that is a prerequisite would never complete.
          status:                 isPendingPrereq ? "pending_prereq" : "open",
          ownerId,
          department:             dept || null,
          // Due dates are provisional when pending_prereq: they will be recomputed
          // from the completion date of the prerequisite list. We keep the
          // computed date as a placeholder so the UI can show it is provisional,
          // but it WILL change (that is the whole point).
          dueDate,
          offsetFrom:             taskDef.offsetFrom,
          offsetDays:             taskDef.offsetDays,
          isSetup:                !taskDef.isRecurring,
          isRecurring:            taskDef.isRecurring,
          recurrenceIntervalDays: taskDef.intervalDays,
          // Store blueprintTaskId for ALL tasks (setup and recurring) so the
          // Fix 2 guard can match on it in future re-applies.
          blueprintTaskId:        taskDef.localId || null,
          blueprintTemplateId:    taskDef.isRecurring ? template.id : null,
          occurrenceKey,
          ownerRole:              taskDef.ownerRole,
          // blueprintAssigneeId: the verified active user.id at apply-time.
          // NULL if no named assignee, or if the named person was inactive
          // (in which case department routing was used and logged above).
          blueprintAssigneeId:    resolvedBlueprintAssigneeId,
          estimatedHours:         taskDef.estimatedHours,
          priority:               taskDef.priority,
          description:            taskDef.description,
          onboardingRecordId:     null,
          createdAt:              now,
          updatedAt:              now,
        },
      });
      if (taskDef.localId) taskIdByLocalId.set(taskDef.localId, taskId);
      result.tasksCreated++;
      if (taskDef.isRecurring) result.recurringTasksCreated++;

      if (ownerId && !taskDef.isRecurring) {
        notifyTaskAssigned({
          ownerId,
          taskId,
          taskLabel:   taskDef.label,
          projectId,
          projectName: projectName ?? projectId,
        }).catch(() => { /* swallowed */ });
      }
    } catch (err) {
      result.errors.push(
        `Task "${taskDef.label}": ${err instanceof Error ? err.message : String(err)}`,
      );
      if (taskDef.localId) taskIdByLocalId.set(taskDef.localId, null);
    }
  }

  // ── 8. Insert dependency rows ─────────────────────────────────────────────
  const depNow = new Date().toISOString();
  for (const taskDef of flatTasks) {
    if (!taskDef.localId) continue;
    const taskId = taskIdByLocalId.get(taskDef.localId);
    if (!taskId) continue;
    if (!taskDef.prereqLocalIds || taskDef.prereqLocalIds.length === 0) continue;

    for (const prereqLocalId of taskDef.prereqLocalIds) {
      if (!taskIdByLocalId.has(prereqLocalId)) continue;
      const prereqTaskId = taskIdByLocalId.get(prereqLocalId);
      if (!prereqTaskId) continue;

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
        result.errors.push(
          `Dependency "${prereqLocalId}"→"${taskDef.localId}": ` +
          (err instanceof Error ? err.message : String(err)),
        );
      }
    }
  }

  return result;
}
