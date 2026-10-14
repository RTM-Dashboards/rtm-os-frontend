// RTM OS — Manual Recurring Task Generation Trigger
//
// POST /api/projects/generate-recurring
// Body: { projectId: string }
//
// Authenticated route. Runs the recurring task engine for one project and
// returns the generation result. Useful for:
//   - Manual trigger by staff when a blueprint is updated.
//   - Testing that the engine works correctly.
//   - Recovery after the engine was paused or skipped.
//
// This route is deliberately synchronous (awaits the engine) so the caller
// gets the full result including generated count, skipped count, and errors.
//
// Access gates (both must pass):
//   1. Manager rank or above (ROLE_RANK >= 2). Members are excluded.
//   2. Project access using the same rules as GET /api/projects/detail:
//        SystemAdmin/Executive/AM Manager → any project.
//        AM Member → must be the assignedAM on the project.
//        Others (non-AM Manager+) → must own ≥1 task in the project.
//
// Idempotent: calling this route multiple times for the same project on the
// same day produces no duplicate rows (occurrence_key UNIQUE constraint).

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ROLE_RANK } from "@/lib/auth/vocab";
import { generateRecurringTasks } from "@/lib/projects/recurring";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: authStatus ?? 401 });
  }

  // Gate 1: Manager rank or above.
  // ROLE_RANK: Member=1, Manager=2, Executive=3, SystemAdmin=4.
  const rank        = ROLE_RANK[user!.role as keyof typeof ROLE_RANK] ?? 0;
  const managerRank = ROLE_RANK["Manager"];
  const executiveRank = ROLE_RANK["Executive"];
  if (rank < managerRank) {
    return NextResponse.json({ error: "Forbidden: Manager rank or above required." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId } = body as { projectId?: string };
  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json(
      { error: "Body must include projectId (string)" },
      { status: 400 },
    );
  }

  try {
    // Gate 2: Verify the project exists and the caller can access it.
    // Same rule as GET /api/projects/detail.
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (rank < executiveRank) {
      const dept     = user!.department;
      const userId   = user!.id;
      const isAMDept = dept === "Account Management";
      const isAMManager = isAMDept && rank >= managerRank;

      if (!isAMManager && !isAMDept) {
        // Non-AM: must own ≥1 task in this project.
        const cats = await prisma.projectCategory.findMany({
          where:  { projectId: project.id },
          select: { id: true },
        });
        const catIdList = cats.map((c) => c.id);
        const owned = catIdList.length
          ? await prisma.task.count({ where: { categoryId: { in: catIdList }, ownerId: userId } })
          : 0;
        if (owned === 0) {
          return NextResponse.json({ error: "Access denied." }, { status: 403 });
        }
      } else if (isAMDept && !isAMManager) {
        // AM Member — but Members are already blocked by Gate 1 (rank < managerRank),
        // so this branch is unreachable. Guarded defensively.
        if (project.assignedAM !== userId) {
          return NextResponse.json({ error: "Access denied." }, { status: 403 });
        }
      }
      // AM Manager passes through.
    }
    // Executive / SystemAdmin pass through.

    const result = await generateRecurringTasks(projectId);
    console.log(
      `[recurring:manual] project=${projectId} caller=${user!.id} ran=${result.ran}` +
      ` generated=${result.generated} skippedDuplicate=${result.skippedDuplicate}` +
      ` errors=${result.errors.length}`,
    );
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
