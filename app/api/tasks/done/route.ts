// RTM OS — Mark Task Done API
//
// PATCH /api/tasks/done?id=<taskId>
//
// Sets task status to "done". Auth enforced here.
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

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ROLE_RANK } from "@/lib/auth/vocab";

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

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
