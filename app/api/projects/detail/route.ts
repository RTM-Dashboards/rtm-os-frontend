// RTM OS — Scoped Project Detail API
//
// GET /api/projects/detail?id=<projectId>
//
// Returns one project with its categories and the tasks the caller may see.
// Auth is enforced in the API — not just in the UI.
//
// ── WHO SEES WHICH TASKS ──────────────────────────────────────────────────────
//   SystemAdmin / Executive          → every task
//   Account Management (any role)   → every task (owns the client relationship)
//   Everyone else                   → only tasks in their own department
//
// ── MONEY FIELD ───────────────────────────────────────────────────────────────
//   monthlyValueCents is included ONLY for:
//     Account Management (any role) | Executive | SystemAdmin
//   Omitted entirely for all others. Not nulled, not zeroed.
//
// ── PROJECT ACCESS GATE ───────────────────────────────────────────────────────
//   Before returning detail, confirm the caller can see this project using the
//   same rule as the scoped list:
//     SystemAdmin/Executive/AM Manager    → any project
//     AM Member                          → must be the assignedAM
//     Others                             → must own ≥ 1 task in this project
//
// ── TASK FILTERING ────────────────────────────────────────────────────────────
//   Categories: all categories are always returned for context.
//   Tasks: filtered per department rules above.
//   Within each category, tasks array holds only what the caller can see.

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

// ── Response shapes ────────────────────────────────────────────────────────────

export interface ScopedTask {
  id: string;
  label: string;
  department: string | null;
  ownerId: string | null;
  ownerName: string | null;
  dueDate: string | null;
  status: string;
  isSetup: boolean;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
}

export interface ScopedCategory {
  id: string;
  serviceId: string;
  serviceLabel: string;
  department: string;
  createdAt: string;
  tasks: ScopedTask[];
}

export interface ScopedProjectDetail {
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
  // Money — absent when caller cannot see it
  monthlyValueCents?: number;
  // Categories with scoped tasks
  categories: ScopedCategory[];
}

// ── Overdue helper ────────────────────────────────────────────────────────────
function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate) return false;
  if (status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  return due < today;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("id");
  if (!projectId) {
    return NextResponse.json({ error: "Query param id is required" }, { status: 400 });
  }

  const rank = ROLE_RANK[user!.role] ?? 0;
  const executiveRank = ROLE_RANK["Executive"];
  const managerRank = ROLE_RANK["Manager"];
  const dept = user!.department;
  const userId = user!.id;

  try {
    // ── Fetch the project ─────────────────────────────────────────────────────
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // ── Access gate ───────────────────────────────────────────────────────────
    // Same rules as the scoped list.
    if (rank < executiveRank) {
      const isAMManager = dept === "Account Management" && rank >= managerRank;
      const isAMMember = dept === "Account Management";
      if (!isAMManager && !isAMMember) {
        // Non-AM: must own ≥ 1 task in this project
        const cats = await prisma.projectCategory.findMany({
          where: { projectId: project.id },
          select: { id: true },
        });
        const catIdList = cats.map((c) => c.id);
        const owned = catIdList.length
          ? await prisma.task.count({ where: { categoryId: { in: catIdList }, ownerId: userId } })
          : 0;
        if (owned === 0) {
          return NextResponse.json({ error: "Access denied." }, { status: 403 });
        }
      } else if (isAMMember && !isAMManager) {
        // AM Member: must be the assignedAM
        if (project.assignedAM !== userId) {
          return NextResponse.json({ error: "Access denied." }, { status: 403 });
        }
      }
      // AM Manager passes through
    }
    // Executive / SystemAdmin pass through

    // ── Fetch business ────────────────────────────────────────────────────────
    const business = await prisma.business.findUnique({
      where: { id: project.businessId },
      select: { id: true, domain: true, displayName: true, clientId: true, monthlyValueCents: true },
    });

    // ── Fetch assigned AM name ────────────────────────────────────────────────
    const amUser = project.assignedAM
      ? await prisma.user.findUnique({ where: { id: project.assignedAM }, select: { name: true } })
      : null;

    // ── Fetch categories ──────────────────────────────────────────────────────
    const categories = await prisma.projectCategory.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "asc" },
    });

    // ── Fetch tasks ───────────────────────────────────────────────────────────
    const catIdList = categories.map((c) => c.id);

    // Task filter: who sees what
    const canSeeAllTasks =
      rank >= executiveRank || dept === "Account Management";

    const taskWhere: Prisma.TaskWhereInput = catIdList.length
      ? {
          categoryId: { in: catIdList },
          ...(canSeeAllTasks ? {} : { department: dept ?? "__none__" }),
        }
      : { id: "never" }; // no categories → no tasks

    const tasks = catIdList.length
      ? await prisma.task.findMany({
          where: taskWhere,
          orderBy: { createdAt: "asc" },
        })
      : [];

    // ── Resolve owner names ───────────────────────────────────────────────────
    const ownerIds = [...new Set(tasks.map((t) => t.ownerId).filter((id): id is string => !!id))];
    const owners = ownerIds.length
      ? await prisma.user.findMany({ where: { id: { in: ownerIds } }, select: { id: true, name: true } })
      : [];
    const ownerMap = new Map(owners.map((u) => [u.id, u.name]));

    // ── Assemble per-category task lists ──────────────────────────────────────
    const tasksByCat = new Map<string, typeof tasks>();
    for (const t of tasks) {
      const arr = tasksByCat.get(t.categoryId) ?? [];
      arr.push(t);
      tasksByCat.set(t.categoryId, arr);
    }

    const scopedCategories: ScopedCategory[] = categories.map((cat) => ({
      id: cat.id,
      serviceId: cat.serviceId,
      serviceLabel: cat.serviceLabel,
      department: cat.department,
      createdAt: cat.createdAt,
      tasks: (tasksByCat.get(cat.id) ?? []).map((t) => ({
        id: t.id,
        label: t.label,
        department: t.department ?? null,
        ownerId: t.ownerId ?? null,
        ownerName: t.ownerId ? (ownerMap.get(t.ownerId) ?? null) : null,
        dueDate: t.dueDate ?? null,
        status: t.status,
        isSetup: t.isSetup,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        isOverdue: isOverdue(t.dueDate ?? null, t.status),
      })),
    }));

    // ── Assemble the final response ────────────────────────────────────────────
    const showMoney = canSeeMoney(user!.role, dept);

    const detail: ScopedProjectDetail = {
      id: project.id,
      businessId: project.businessId,
      name: project.name,
      status: project.status,
      assignedAM: project.assignedAM,
      assignedAMName: amUser?.name ?? null,
      startDate: project.startDate ?? null,
      endDate: project.endDate ?? null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      domain: business?.domain ?? "",
      displayName: business?.displayName ?? project.name,
      clientId: business?.clientId ?? "",
      categories: scopedCategories,
    };

    if (showMoney) {
      detail.monthlyValueCents = business?.monthlyValueCents ?? 0;
    }

    return NextResponse.json({ record: detail });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
