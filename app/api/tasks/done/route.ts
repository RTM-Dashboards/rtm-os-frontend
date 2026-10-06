// RTM OS — Mark Task Done API
//
// PATCH /api/tasks/done?id=<taskId>
//
// Sets task status to "done" and runs the dependency cascade.
//
// ── WHO CAN MARK A TASK DONE ──────────────────────────────────────────────────
//   The task's owner (ownerId === caller's userId)
//   A Manager of the task's own department
//   Executive or SystemAdmin
//
//   Nobody else. A Manager of a DIFFERENT department cannot mark it done.
//   A Member who does not own the task cannot mark it done.
//
// ── NO REASSIGNMENT ───────────────────────────────────────────────────────────
//   This route only changes status. ownerId is not touched.
//
// ── CASCADE ───────────────────────────────────────────────────────────────────
//   After marking a task done, runCascade() walks every task that depends on
//   the just-closed task, and then their dependents, and so on (BFS).
//
//   A dependent whose prerequisites are ALL done gets a due date:
//     lastPrereqClosedAt + offsetDays
//   where lastPrereqClosedAt is the latest updatedAt among all its prerequisites.
//
//   A dependent still waiting on at least one open/in_progress prereq stays
//   without a due date.
//
//   Cycle protection: a visited set tracks every task id processed in this
//   cascade run. If we encounter a task we have already visited, we stop that
//   branch. Because tasks are only inserted into the queue when their prereqs
//   are checked, and we never re-enqueue a visited node, the BFS terminates
//   even if the dependency graph somehow contains a cycle.
//
//   Partial failure: if updating a specific dependent task fails (e.g. a DB
//   error), the cascade logs it and continues to the next dependent. Tasks
//   downstream of the failed update may not receive their dates. The failure is
//   NOT surfaced to the HTTP caller — the primary PATCH (marking done) already
//   succeeded; cascade errors are an internal concern. In a future run we can
//   add a repair queue or retry mechanism.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ROLE_RANK } from "@/lib/auth/vocab";

// ── addDays helper (ISO-8601 date string) ─────────────────────────────────────

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Cascade ───────────────────────────────────────────────────────────────────
//
// runCascade(closedTaskId):
//   1. Find every task that has closedTaskId as a prerequisite.
//   2. For each such dependent:
//      a. Load all ITS prerequisites.
//      b. If all are done → compute due date from the latest closedAt + offsetDays,
//         then update the dependent task's dueDate.
//      c. Enqueue the dependent for its own downstream cascade step.
//   3. Repeat until the queue is empty.
//
// The visited set prevents re-processing and infinite loops.

async function runCascade(closedTaskId: string): Promise<void> {
  const queue: string[] = [closedTaskId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // Find every task that lists currentId as a prerequisite.
    const unlockCandidates = await prisma.taskDependency.findMany({
      where:  { requiresTaskId: currentId },
      select: { taskId: true },
    });

    for (const { taskId: dependentId } of unlockCandidates) {
      if (visited.has(dependentId)) continue; // cycle guard

      // Load the dependent task.
      const dependent = await prisma.task.findUnique({ where: { id: dependentId } });
      if (!dependent) continue;
      if (dependent.status === "done") continue; // already done; nothing to update

      // Load ALL prerequisites for this dependent.
      const allPrereqs = await prisma.taskDependency.findMany({
        where:  { taskId: dependentId },
        select: { requiresTaskId: true },
      });

      if (allPrereqs.length === 0) {
        // No prereqs recorded → nothing to cascade here (shouldn't happen if
        // we got here via a dep edge, but guard it).
        queue.push(dependentId);
        continue;
      }

      // Load the actual prerequisite tasks.
      const prereqIds = allPrereqs.map((p) => p.requiresTaskId);
      const prereqTasks = await prisma.task.findMany({
        where:  { id: { in: prereqIds } },
        select: { id: true, status: true, updatedAt: true },
      });

      const allDone = prereqTasks.every((p) => p.status === "done");

      if (!allDone) {
        // Still waiting on other prereqs. No date change; do not enqueue
        // downstream (the final prereq's cascade will handle it).
        continue;
      }

      // All prerequisites are done. Find the latest close date among them.
      // updatedAt is an ISO-8601 string; lexicographic max works for ISO dates.
      const latestClosedAt = prereqTasks.reduce<string>((latest, p) => {
        return p.updatedAt > latest ? p.updatedAt : latest;
      }, prereqTasks[0].updatedAt);

      // Compute the new due date: latestClosedAt (date part) + offsetDays.
      const closedDate = latestClosedAt.slice(0, 10); // "YYYY-MM-DD"
      const newDueDate = dependent.offsetDays > 0
        ? addDays(closedDate, dependent.offsetDays)
        : closedDate;

      const now = new Date().toISOString();
      try {
        await prisma.task.update({
          where: { id: dependentId },
          data:  { dueDate: newDueDate, updatedAt: now },
        });
      } catch {
        // Non-fatal: log to console; cascade continues for other dependents.
        // The failure is intentionally not surfaced to the HTTP caller — the
        // primary mark-done succeeded. A future run can add a repair queue.
        console.error(`[cascade] failed to update task ${dependentId} due date`);
        continue;
      }

      // Enqueue this dependent so ITS dependents are also recalculated.
      queue.push(dependentId);
    }
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("id");
  if (!taskId) {
    return NextResponse.json({ error: "Query param id is required" }, { status: 400 });
  }

  const rank = ROLE_RANK[user!.role] ?? 0;
  const executiveRank = ROLE_RANK["Executive"];
  const managerRank = ROLE_RANK["Manager"];

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // ── Permission check ──────────────────────────────────────────────────────
    const isOwner = task.ownerId === user!.id;
    const isDeptManager =
      rank >= managerRank &&
      rank < executiveRank &&
      task.department !== null &&
      user!.department === task.department;
    const isSupervisor = rank >= executiveRank;

    if (!isOwner && !isDeptManager && !isSupervisor) {
      return NextResponse.json(
        { error: "You do not have permission to mark this task done." },
        { status: 403 }
      );
    }

    if (task.status === "done") {
      return NextResponse.json({ error: "Task is already done." }, { status: 400 });
    }

    // ── Update ────────────────────────────────────────────────────────────────
    const now = new Date().toISOString();
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status: "done", updatedAt: now },
    });

    // ── Cascade ───────────────────────────────────────────────────────────────
    // Run after the primary update. Fire-and-forget pattern: cascade failures
    // do not roll back or affect the HTTP response for the mark-done action.
    // The cascade is awaited so the HTTP response reflects a complete state, but
    // individual sub-task update failures are swallowed inside runCascade.
    await runCascade(taskId);

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
