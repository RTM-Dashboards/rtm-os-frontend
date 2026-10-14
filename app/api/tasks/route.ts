// RTM OS — Tasks List API Route
//
// GET /api/tasks
//   Returns all Postgres tasks the caller may see, enriched with project and
//   category context.
//
// ── Auth ──────────────────────────────────────────────────────────────────────
//   Requires a valid session.
//   Scoping mirrors /api/projects/detail:
//     SystemAdmin / Executive / Account Management → all tasks
//     All others → only tasks in their own department
//
// ── Query params ──────────────────────────────────────────────────────────────
//   ?projectId=<id>    filter by project id
//   ?department=<name> filter by department name
//   ?status=<s>        filter by status (open|in_progress|done|skipped)
//   ?onboardingRecordId=<id>  filter by onboarding record link
//
// ── Response ──────────────────────────────────────────────────────────────────
//   { tasks: TaskListItem[] }

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ROLE_RANK } from "@/lib/auth/vocab";

function canSeeAll(role: string, department: string | null): boolean {
  const rank = ROLE_RANK[role as keyof typeof ROLE_RANK] ?? 0;
  if (rank >= ROLE_RANK["Executive"]) return true;
  if (department === "Account Management") return true;
  return false;
}

export interface TaskListItem {
  id: string;
  categoryId: string;
  projectId: string;
  projectName: string;
  businessId: string;
  clientId: string;
  label: string;
  department: string | null;
  ownerId: string | null;
  ownerName: string | null;
  dueDate: string | null;
  /**
   * When dueDate is null and this task waits on a prerequisite, this is the
   * label of the first unmet prerequisite task (e.g. "Technical SEO Audit").
   * Null when dueDate is set or when there is no prerequisite.
   */
  waitingOnLabel: string | null;
  status: string;
  isSetup: boolean;
  isRecurring: boolean;
  priority: string | null;
  estimatedHours: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus ?? 401 });

  const sp = new URL(req.url).searchParams;
  const filterProjectId          = sp.get("projectId");
  const filterDepartment         = sp.get("department");
  const filterStatus             = sp.get("status");
  const filterOnboardingRecordId = sp.get("onboardingRecordId");

  const dept = user?.department ?? null;
  const seeAll = canSeeAll(user!.role, dept);

  try {
    // Build task where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taskWhere: Record<string, any> = {};
    if (!seeAll && dept) taskWhere.department = dept;
    if (filterDepartment)         taskWhere.department         = filterDepartment;
    if (filterStatus)             taskWhere.status             = filterStatus;
    if (filterOnboardingRecordId) taskWhere.onboardingRecordId = filterOnboardingRecordId;

    // If filtering by projectId, resolve categoryIds first
    if (filterProjectId) {
      const cats = await prisma.projectCategory.findMany({
        where: { projectId: filterProjectId },
        select: { id: true },
      });
      taskWhere.categoryId = { in: cats.map((c) => c.id) };
    }

    const tasks = await prisma.task.findMany({
      where: taskWhere,
      orderBy: { createdAt: "asc" },
    });

    if (tasks.length === 0) {
      return NextResponse.json({ tasks: [] });
    }

    // Resolve categories → projects → businesses
    const catIds = [...new Set(tasks.map((t) => t.categoryId))];
    const categories = await prisma.projectCategory.findMany({
      where: { id: { in: catIds } },
      select: { id: true, projectId: true },
    });
    const catToProject = new Map(categories.map((c) => [c.id, c.projectId]));

    const projIds = [...new Set(categories.map((c) => c.projectId))];
    const projects = await prisma.project.findMany({
      where: { id: { in: projIds } },
      select: { id: true, businessId: true, name: true },
    });
    const projMap = new Map(projects.map((p) => [p.id, p]));

    const bizIds = [...new Set(projects.map((p) => p.businessId))];
    const businesses = await prisma.business.findMany({
      where: { id: { in: bizIds } },
      select: { id: true, clientId: true },
    });
    const bizMap = new Map(businesses.map((b) => [b.id, b]));

    // Resolve owner names
    const ownerIds = [...new Set(tasks.map((t) => t.ownerId).filter(Boolean))] as string[];
    const owners = ownerIds.length
      ? await prisma.user.findMany({
          where: { id: { in: ownerIds } },
          select: { id: true, name: true },
        })
      : [];
    const ownerMap = new Map(owners.map((u) => [u.id, u.name]));

    // Resolve waitingOnLabel: for tasks with no due date, find the label of
    // the first unmet prerequisite so the UI can show "After <prereq>" instead
    // of an empty date cell.
    const nodateTasks = tasks.filter((t) => !t.dueDate && t.status !== "done");
    let waitingOnMap = new Map<string, string>(); // taskId → prereq label
    if (nodateTasks.length > 0) {
      const nodateIds = nodateTasks.map((t) => t.id);
      const deps = await prisma.taskDependency.findMany({
        where: { taskId: { in: nodateIds } },
        select: { taskId: true, requiresTaskId: true },
      });
      if (deps.length > 0) {
        // Only load prereqs that exist in the current visible task set or in DB.
        const prereqIds = [...new Set(deps.map((d) => d.requiresTaskId))];
        const prereqTasks = await prisma.task.findMany({
          where: { id: { in: prereqIds }, status: { not: "done" } },
          select: { id: true, label: true },
        });
        const prereqLabelMap = new Map(prereqTasks.map((p) => [p.id, p.label]));
        // For each no-date task, pick the first unmet prereq label.
        const seen = new Set<string>();
        for (const dep of deps) {
          if (seen.has(dep.taskId)) continue; // already have one for this task
          const prereqLabel = prereqLabelMap.get(dep.requiresTaskId);
          if (prereqLabel) {
            waitingOnMap.set(dep.taskId, prereqLabel);
            seen.add(dep.taskId);
          }
        }
      }
    }
    const result: TaskListItem[] = tasks.map((t) => {
      const projId = catToProject.get(t.categoryId) ?? "";
      const proj   = projMap.get(projId);
      const biz    = proj ? bizMap.get(proj.businessId) : undefined;
      return {
        id:             t.id,
        categoryId:     t.categoryId,
        projectId:      projId,
        projectName:    proj?.name ?? "",
        businessId:     proj?.businessId ?? "",
        clientId:       biz?.clientId ?? "",
        label:          t.label,
        department:     t.department ?? null,
        ownerId:        t.ownerId ?? null,
        ownerName:      t.ownerId ? (ownerMap.get(t.ownerId) ?? null) : null,
        dueDate:        t.dueDate ?? null,
        waitingOnLabel: !t.dueDate && t.status !== "done"
                          ? (waitingOnMap.get(t.id) ?? null)
                          : null,
        status:         t.status,
        isSetup:        t.isSetup,
        isRecurring:    t.isRecurring,
        priority:       t.priority ?? null,
        estimatedHours: t.estimatedHours !== null ? Number(t.estimatedHours) : null,
        description:    t.description ?? null,
        createdAt:      t.createdAt,
        updatedAt:      t.updatedAt,
      };
    });

    return NextResponse.json({ tasks: result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
