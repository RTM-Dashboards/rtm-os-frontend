// RTM OS — Scoped Projects List API
//
// GET /api/projects/scoped
//
// Returns the projects the caller is allowed to see, with task counts.
// Auth is enforced here — not in the UI.
//
// ── WHO SEES WHICH PROJECTS ────────────────────────────────────────────────────
//   SystemAdmin / Executive          → all projects
//   Account Management Manager      → all projects
//   Account Management Member        → projects where they are the assignedAM
//   Everyone else (any dept Member   → projects where they own ≥ 1 task
//   or Manager not in AM)
//
// ── MONEY FIELD ───────────────────────────────────────────────────────────────
//   monthlyValueCents from Business is included ONLY for:
//     Account Management (any role) | Executive | SystemAdmin
//   It is OMITTED from the response for all other callers.
//   Not nulled, not zeroed — the key is absent.
//
// ── SCOPING EXPRESSED AS ──────────────────────────────────────────────────────
//   1. Resolve role rank and department.
//   2. Build a Prisma WHERE clause based on the three buckets above.
//   3. For money: after the query, strip the field before serialisation when
//      the caller does not qualify.
//
// This scoping logic is reusable for department dashboards: repeat step 1–2
// against the tasks table instead of the projects table.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ROLE_RANK } from "@/lib/auth/vocab";
import type { Prisma } from "@prisma/client";

// ── Money-visible predicate ────────────────────────────────────────────────────
function canSeeMoney(role: string, department: string | null): boolean {
  const rank = ROLE_RANK[role as keyof typeof ROLE_RANK] ?? 0;
  if (rank >= ROLE_RANK["Executive"]) return true;
  if (department === "Account Management") return true;
  return false;
}

// ── List record shape ─────────────────────────────────────────────────────────
export interface ScopedProjectListItem {
  id: string;
  businessId: string;
  name: string;
  status: string;
  assignedAM: string;
  assignedAMName: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  // Business fields
  domain: string;
  displayName: string;
  clientId: string;
  // Task counts
  openTaskCount: number;
  doneTaskCount: number;
  // Money — absent when caller cannot see it
  monthlyValueCents?: number;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const rank = ROLE_RANK[user!.role] ?? 0;
  const executiveRank = ROLE_RANK["Executive"];
  const managerRank = ROLE_RANK["Manager"];
  const dept = user!.department;
  const userId = user!.id;

  try {
    // ── Build WHERE predicate ────────────────────────────────────────────────
    let projectWhere: Prisma.ProjectWhereInput;

    if (rank >= executiveRank) {
      // SystemAdmin / Executive — all projects
      projectWhere = {};
    } else if (dept === "Account Management" && rank >= managerRank) {
      // AM Manager (Melissa) — all projects
      projectWhere = {};
    } else if (dept === "Account Management") {
      // AM Member — only projects where they are the assigned AM
      projectWhere = { assignedAM: userId };
    } else {
      // Everyone else — projects where they own at least one task
      const ownedTaskCategoryIds = await prisma.task.findMany({
        where: { ownerId: userId },
        select: { categoryId: true },
      });
      const catIds = [...new Set(ownedTaskCategoryIds.map((t) => t.categoryId))];
      if (catIds.length === 0) {
        return NextResponse.json({ records: [] });
      }
      const cats = await prisma.projectCategory.findMany({
        where: { id: { in: catIds } },
        select: { projectId: true },
      });
      const projIds = [...new Set(cats.map((c) => c.projectId))];
      if (projIds.length === 0) {
        return NextResponse.json({ records: [] });
      }
      projectWhere = { id: { in: projIds } };
    }

    // ── Fetch projects ────────────────────────────────────────────────────────
    const projects = await prisma.project.findMany({
      where: projectWhere,
      orderBy: { createdAt: "asc" },
    });

    if (projects.length === 0) {
      return NextResponse.json({ records: [] });
    }

    // ── Fetch businesses for all projects ────────────────────────────────────
    const businessIds = [...new Set(projects.map((p) => p.businessId))];
    const businesses = await prisma.business.findMany({
      where: { id: { in: businessIds } },
      select: {
        id: true,
        domain: true,
        displayName: true,
        clientId: true,
        monthlyValueCents: true,
      },
    });
    const bizMap = new Map(businesses.map((b) => [b.id, b]));

    // ── Fetch all AM user names for assignedAM resolution ───────────────────
    const amUserIds = [...new Set(projects.map((p) => p.assignedAM).filter(Boolean))];
    const amUsers = amUserIds.length
      ? await prisma.user.findMany({
          where: { id: { in: amUserIds } },
          select: { id: true, name: true },
        })
      : [];
    const amNameMap = new Map(amUsers.map((u) => [u.id, u.name]));

    // ── Fetch task counts per project ─────────────────────────────────────────
    // Get all categories for these projects, then count tasks.
    const projIds = projects.map((p) => p.id);
    const categories = await prisma.projectCategory.findMany({
      where: { projectId: { in: projIds } },
      select: { id: true, projectId: true },
    });
    const catIds = categories.map((c) => c.id);

    const [openTasks, doneTasks] = await Promise.all([
      catIds.length
        ? prisma.task.groupBy({
            by: ["categoryId"],
            where: { categoryId: { in: catIds }, status: { in: ["open", "in_progress"] } },
            _count: { id: true },
          })
        : Promise.resolve([]),
      catIds.length
        ? prisma.task.groupBy({
            by: ["categoryId"],
            where: { categoryId: { in: catIds }, status: "done" },
            _count: { id: true },
          })
        : Promise.resolve([]),
    ]);

    // Map categoryId → projectId for count roll-up
    const catToProj = new Map(categories.map((c) => [c.id, c.projectId]));

    const openCountByProj = new Map<string, number>();
    const doneCountByProj = new Map<string, number>();
    for (const row of openTasks) {
      const pId = catToProj.get(row.categoryId);
      if (pId) openCountByProj.set(pId, (openCountByProj.get(pId) ?? 0) + row._count.id);
    }
    for (const row of doneTasks) {
      const pId = catToProj.get(row.categoryId);
      if (pId) doneCountByProj.set(pId, (doneCountByProj.get(pId) ?? 0) + row._count.id);
    }

    // ── Assemble response ─────────────────────────────────────────────────────
    const showMoney = canSeeMoney(user!.role, dept);

    const records: ScopedProjectListItem[] = projects.map((p) => {
      const biz = bizMap.get(p.businessId);
      const item: ScopedProjectListItem = {
        id: p.id,
        businessId: p.businessId,
        name: p.name,
        status: p.status,
        assignedAM: p.assignedAM,
        assignedAMName: amNameMap.get(p.assignedAM) ?? null,
        startDate: p.startDate ?? null,
        endDate: p.endDate ?? null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        domain: biz?.domain ?? "",
        displayName: biz?.displayName ?? p.name,
        clientId: biz?.clientId ?? "",
        openTaskCount: openCountByProj.get(p.id) ?? 0,
        doneTaskCount: doneCountByProj.get(p.id) ?? 0,
      };
      if (showMoney) {
        item.monthlyValueCents = biz?.monthlyValueCents ?? 0;
      }
      return item;
    });

    return NextResponse.json({ records });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
