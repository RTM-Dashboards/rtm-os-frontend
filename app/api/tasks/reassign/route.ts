// RTM OS — Task Reassign API
//
// PATCH /api/tasks/reassign?id=<taskId>
//   Body: { ownerId: string }
//   → { id, ownerId, ownerName, updatedAt }
//   → { error } on bad input / not found / permission denied
//
// Changes a task's ownerId.  Status is not touched.
//
// ── Auth guard ────────────────────────────────────────────────────────────────
// Matched from app/api/tasks/done/route.ts (the nearest neighbour task route):
//   The task's owner                                 → can reassign their own task
//   A Manager of the task's own department           → can reassign within dept
//   Executive or SystemAdmin                         → can reassign any task
//
// Nobody else.  A Manager of a DIFFERENT department cannot reassign.
// A Member who does not own the task cannot reassign.
//
// ── Department filter on the new owner picker ─────────────────────────────────
// The GET endpoint below lists candidate users.  We return ALL active users,
// not filtered to a single department.
//
// Rationale: the surrounding code in /api/tasks/done (pickOwner) routes tasks
// to the department specified on the task's template row.  But reassignment is
// a deliberate human override — Account Management sometimes moves a task to a
// specific person regardless of department.  Teamwork's reassign picker shows
// all project members, not only the task's department.  We match that behaviour.
// The caller (UI) can filter client-side if desired.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ROLE_RANK, VALID_DEPARTMENTS, requireDept } from "@/lib/auth/vocab";

// Account Management department string, resolved by name from VALID_DEPARTMENTS.
// requireDept() throws at module load if the name is ever removed from the array.
const ACCOUNT_MANAGEMENT_DEPT = requireDept("Account Management");

// ── GET — list reassignable users ─────────────────────────────────────────────
// Returns all active users the caller may assign to.
// Used by the reassign picker in the UI.

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus ?? 401 });

  try {
    const users = await prisma.user.findMany({
      where:   { status: "active" },
      select:  { id: true, name: true, department: true, role: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — reassign task ──────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("id");
  if (!taskId) {
    return NextResponse.json({ error: "Query param id is required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { ownerId: newOwnerId } = body as { ownerId?: string };
  if (!newOwnerId || typeof newOwnerId !== "string") {
    return NextResponse.json({ error: "Body must include ownerId (string)" }, { status: 400 });
  }

  const rank = ROLE_RANK[user!.role] ?? 0;
  const executiveRank = ROLE_RANK["Executive"];
  const managerRank   = ROLE_RANK["Manager"];

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // ── Permission check ───────────────────────────────────────────────────────
    // Original three checks (unchanged — mirrors /api/tasks/done):
    const isOwner = task.ownerId === user!.id;
    const isDeptManager =
      rank >= managerRank &&
      rank < executiveRank &&
      task.department !== null &&
      user!.department === task.department;
    const isSupervisor = rank >= executiveRank;

    // FIX 4: Account Management addition.
    // An active member of Account Management can reassign any task regardless
    // of that task's department.  Covers the main case of an AM moving a
    // delivery task between operations people, where the AM's Manager rank is
    // for a different department so isDeptManager would be false.
    // "active" status is already guaranteed by getSessionUser.
    const isAccountManager = user!.department === ACCOUNT_MANAGEMENT_DEPT;

    // Final condition:
    //   isOwner || isDeptManager || isSupervisor || isAccountManager
    if (!isOwner && !isDeptManager && !isSupervisor && !isAccountManager) {
      return NextResponse.json(
        { error: "You do not have permission to reassign this task." },
        { status: 403 },
      );
    }

    // Validate the target user exists and is active.
    const newOwner = await prisma.user.findUnique({
      where:  { id: newOwnerId },
      select: { id: true, name: true, status: true },
    });
    if (!newOwner) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }
    if (newOwner.status !== "active") {
      return NextResponse.json(
        { error: "Cannot assign to an inactive user" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const updated = await prisma.task.update({
      where: { id: taskId },
      data:  { ownerId: newOwnerId, updatedAt: now },
    });

    return NextResponse.json({
      id:        updated.id,
      ownerId:   updated.ownerId,
      ownerName: newOwner.name,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
