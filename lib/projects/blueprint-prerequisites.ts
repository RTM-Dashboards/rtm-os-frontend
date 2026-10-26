// RTM OS — Blueprint Prerequisite Helpers
//
// Shared logic for the blueprint prerequisite declaration feature.
//
// RULES (product-owner decisions, not revisitable):
//   1. The prerequisite is declared on the blueprint (task_list_templates).
//   2. At apply time, a prerequisite binds only if both blueprints exist on
//      the same project.  An unbound prerequisite changes nothing.
//   3. When a list unblocks, task due dates are recomputed from the date the
//      prerequisite finished, honouring dueDateOffsetExcludeWeekends.
//
// ── Cycle detection ──────────────────────────────────────────────────────────
// detectCycle(graph, startId, newPrereqId) walks the prerequisite graph from
// newPrereqId backwards.  If it can reach startId through existing
// prerequisite links, a cycle would result from adding the edge
// startId → newPrereqId.
//
// ── Recurring-blueprint guard ─────────────────────────────────────────────────
// A blueprint is recurring when ANY of its tasks groups has kind="recurring"
// AND at least one recurring task has intervalDays > 0.  A recurring list
// never completes, so anything waiting on it waits forever.
//
// The schema field `recurrenceRule` exists but is unused (reserved).  The
// determination is made from the groups JSONB column which is the live source.

import { prisma } from "@/lib/db/prisma";
import { addOffsetDays } from "@/lib/dates";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PrerequisiteEdge {
  blueprintId:    string;
  prerequisiteId: string;
}

// ── isBlueprintRecurring ──────────────────────────────────────────────────────
//
// Returns true when the blueprint has at least one recurring task group with
// at least one task that has a positive intervalDays.
//
// This is the authoritative definition of "recurring" for the prerequisite
// guard.  A blueprint with ONLY setup tasks is not recurring even if its
// recurrenceRule column is set (that field is reserved / unused).

interface GroupLike {
  kind?: string;
  tasks?: Array<{ intervalDays?: number }>;
}

export function isBlueprintRecurring(groups: unknown): boolean {
  if (!Array.isArray(groups)) return false;
  for (const g of groups as GroupLike[]) {
    if (g.kind !== "recurring") continue;
    if (!Array.isArray(g.tasks)) continue;
    for (const t of g.tasks) {
      if (typeof t.intervalDays === "number" && t.intervalDays > 0) return true;
    }
  }
  return false;
}

// ── detectCycle ────────────────────────────────────────────────────────────────
//
// Determines whether adding the edge (blueprintId → newPrereqId) would create
// a cycle in the prerequisite graph.
//
// Algorithm: starting from newPrereqId, walk all EXISTING prerequisite edges
// depth-first.  If we reach blueprintId, a cycle would result from adding
// this edge.
//
// The caller passes in all existing edges so we can perform this check without
// additional DB queries.
//
// Returns true if a cycle would be created (refuse the save).

export function detectCycle(
  allEdges: PrerequisiteEdge[],
  blueprintId:   string,
  newPrereqId:   string,
): boolean {
  // Build adjacency: for each blueprint, which prerequisites does it have?
  // Direction: prereqOf[X] = set of blueprints that X must finish before.
  // We need the REVERSE direction for the cycle check: given newPrereqId,
  // can we reach blueprintId by following ITS prerequisites?
  //
  // prereqsOf[X] = all blueprints that X is a prerequisite of (i.e. X must
  // finish before those blueprints start).
  // We want: from newPrereqId, following "is prerequisite of" edges, can we
  // reach blueprintId?  No — we want: from newPrereqId, following "has
  // prerequisite" edges, can we reach blueprintId?
  //
  // Specifically: a cycle A→B→C→A would appear if, when adding A→B,
  // following B's prerequisites (B→C, C→A) leads back to A.
  //
  // So: from newPrereqId, follow "blueprintId has prerequisite" edges.
  // If we reach blueprintId (the source node), it's a cycle.

  const prereqMap = new Map<string, Set<string>>(); // blueprint → its prerequisites
  for (const e of allEdges) {
    if (!prereqMap.has(e.blueprintId)) prereqMap.set(e.blueprintId, new Set());
    prereqMap.get(e.blueprintId)!.add(e.prerequisiteId);
  }

  // DFS from newPrereqId following prerequisite chains.
  const visited = new Set<string>();
  const stack   = [newPrereqId];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node === blueprintId) return true; // cycle found
    if (visited.has(node)) continue;
    visited.add(node);
    for (const dep of prereqMap.get(node) ?? []) {
      stack.push(dep);
    }
  }
  return false;
}

// ── getExistingEdges ──────────────────────────────────────────────────────────
//
// Load all existing prerequisite edges from the DB.
// Used by the API route before validating a new edge.

export async function getExistingEdges(): Promise<PrerequisiteEdge[]> {
  const rows = await prisma.blueprintPrerequisite.findMany({
    select: { blueprintId: true, prerequisiteId: true },
  });
  return rows;
}

// ── makeId ────────────────────────────────────────────────────────────────────

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── checkListFinished ─────────────────────────────────────────────────────────
//
// Returns true when every task in a category (by categoryId) is in a terminal
// state.  Cancelled-equivalent states are treated as finished because they
// represent deliberate non-completion that should not block dependent work
// indefinitely.
//
// TERMINAL STATES (treated as finished for unblocking purposes):
//   "done"    — task was completed normally.
//   "skipped" — task was deliberately skipped by a manager or executive.
//               The spec comment at Task.status says "done" | "skipped" are
//               terminal in useDeptTaskStats.ts; we follow the same rule here.
//               A skipped task is not work that remains to be done, so the
//               dependent list should not wait for it.
//
// NON-TERMINAL (dependent list keeps waiting):
//   "open"           — not yet started.
//   "in_progress"    — in progress.
//   "pending_prereq" — itself blocked (this can happen if a list has internal
//                      task-level dependencies using offsetFrom="prereq").
//
// If the category has no tasks at all, it is NOT treated as finished (nothing
// has been done).

export async function checkListFinished(categoryId: string): Promise<boolean> {
  const tasks = await prisma.task.findMany({
    where:  { categoryId },
    select: { status: true },
  });
  if (tasks.length === 0) return false;
  return tasks.every((t) => t.status === "done" || t.status === "skipped");
}

// ── getLatestFinishDate ───────────────────────────────────────────────────────
//
// Returns the latest updatedAt among all tasks in the category.
// "Latest" is determined by lexicographic comparison of ISO-8601 strings
// which is correct because they are zero-padded.
// Used as the anchor for recomputing due dates when a list unblocks.

export async function getLatestFinishDate(categoryId: string): Promise<string> {
  const tasks = await prisma.task.findMany({
    where:  { categoryId },
    select: { updatedAt: true },
  });
  if (tasks.length === 0) return new Date().toISOString().slice(0, 10);
  const latest = tasks.reduce<string>((acc, t) => t.updatedAt > acc ? t.updatedAt : acc, tasks[0].updatedAt);
  return latest.slice(0, 10); // "YYYY-MM-DD"
}

// ── unblockedTasksForCategory ──────────────────────────────────────────────────
//
// When a list unblocks:
//   1. Set all its pending_prereq tasks to "open".
//   2. Recompute due dates from completionDateStr + offsetDays,
//      honouring the template's dueDateOffsetExcludeWeekends flag.
//
// Uses the existing buildWorkloadCache pattern — does NOT re-assign owners;
// ownership was set at apply time.  Only status and dueDate change.
//
// Returns the number of tasks unblocked.

export async function unblockCategoryTasks(
  categoryId:       string,
  completionDateStr: string,  // YYYY-MM-DD anchor for due-date recompute
  excludeWeekends:   boolean,
): Promise<number> {
  const tasks = await prisma.task.findMany({
    where:  { categoryId, status: "pending_prereq" },
    select: { id: true, offsetDays: true },
  });
  if (tasks.length === 0) return 0;

  const now = new Date().toISOString();
  let count = 0;
  for (const t of tasks) {
    const newDueDate = addOffsetDays(completionDateStr, t.offsetDays, excludeWeekends);
    try {
      await prisma.task.update({
        where: { id: t.id },
        data:  { status: "open", dueDate: newDueDate, updatedAt: now },
      });
      count++;
    } catch (err) {
      console.error(`[unblock] failed to unblock task ${t.id}:`, err);
    }
  }
  return count;
}

// ── tryUnblockDependentLists ──────────────────────────────────────────────────
//
// Called from the done-task route after a task is marked done.
// Checks whether the task's category now has all tasks finished.
// If so, finds all active bindings waiting on this category and unblocks them.
//
// Uses buildWorkloadCache for the template's excludeWeekends flag, loaded
// from the category's template (via ProjectCategory.serviceId → TaskListTemplate).
//
// This is the list-level equivalent of runCascade (task-level cascade).
// It belongs in the done route because that is where task-level unblocking
// already lives; list-level unblocking follows the same trigger.

export async function tryUnblockDependentLists(categoryId: string): Promise<void> {
  // Is this category's list now finished?
  const finished = await checkListFinished(categoryId);
  if (!finished) return;

  // Find all bindings where this category is the prerequisite.
  const bindings = await prisma.projectListPrereqBinding.findMany({
    where:  { prereqCategoryId: categoryId, unblockedAt: null },
    select: { id: true, depCategoryId: true, depBlueprintId: true },
  });
  if (bindings.length === 0) return;

  const completionDate = await getLatestFinishDate(categoryId);
  const now = new Date().toISOString();

  for (const binding of bindings) {
    // Load the dependent blueprint's excludeWeekends flag.
    const tmpl = await prisma.taskListTemplate.findUnique({
      where:  { id: binding.depBlueprintId },
      select: { dueDateOffsetExcludeWeekends: true },
    });
    const excludeWeekends = tmpl?.dueDateOffsetExcludeWeekends ?? false;

    const unblocked = await unblockCategoryTasks(
      binding.depCategoryId,
      completionDate,
      excludeWeekends,
    );

    // Mark the binding as unblocked.
    try {
      await prisma.projectListPrereqBinding.update({
        where: { id: binding.id },
        data:  { unblockedAt: now },
      });
      console.log(
        `[list-unblock] binding ${binding.id}: category ${binding.depCategoryId} unblocked` +
        ` (${unblocked} tasks) from prereq ${categoryId} finished on ${completionDate}`,
      );
    } catch (err) {
      console.error(`[list-unblock] failed to update binding ${binding.id}:`, err);
    }
  }
}
