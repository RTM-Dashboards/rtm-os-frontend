// RTM OS — Add Hand-Made Task to Project Category
//
// POST /api/projects/tasks
//   Body: {
//     categoryId: string;       // which category to add the task to
//     label: string;            // task name (required, non-empty)
//     description?: string;     // what this task involves
//     department?: string;      // one of VALID_DEPARTMENTS; required for owner routing
//     assigneeUserId?: string;  // specific person; if omitted, routes by department
//     dueDate?: string;         // ISO date string "YYYY-MM-DD"; optional
//     priority?: string;        // "Urgent"|"High"|"Medium"|"Low"
//     estimatedHours?: number;  // decimal hours
//     parentTaskId?: string;    // if set, this task is a subtask of the given task
//   }
//
// ── Subtask rules ──────────────────────────────────────────────────────────────
//   - parentTaskId must exist and belong to the same category (enforced here)
//   - parentTaskId's parent must be NULL (one level of nesting only)
//   - A subtask cannot be its own ancestor (self-cycle refused)
//   - Deleting a parent cascades to its subtasks (DB ON DELETE CASCADE)
//   → { task: { id, label, status, ownerId, ownerName, department, dueDate,
//               priority, estimatedHours, description, createdAt, updatedAt,
//               isAdHoc } }
//   → { error: string } on bad input / not found / permission denied
//
// ── Auth guard ────────────────────────────────────────────────────────────────
// Matched from app/api/projects/apply-blueprint/route.ts:
//   Account Management department (any active member, i.e. "Member" threshold),
//   which also passes Executive and SystemAdmin via requireDepartment condition A.
//
//   "Member" here means: any role rank ≥ Member within Account Management,
//   i.e. the minimum bar is simply being an active Account Management person.
//   requireDepartment is the same call used by apply-blueprint.
//
// ── Hand-made task identity ───────────────────────────────────────────────────
//   is_ad_hoc = true   (distinguishes from blueprint/recurring tasks)
//   blueprint_task_id  = NULL
//   blueprint_template_id = NULL
//   occurrence_key     = NULL
//
//   These three NULLs ensure:
//   - applyBlueprintToProject: label-match guard skips is_ad_hoc rows; the
//     blueprintTaskId guard never fires (NULL can't be in the set).
//   - generateRecurringTasks: queries on blueprintTemplateId = <id>; NULL rows
//     are never returned.
//   - createNextOccurrence (mark-done path): only called when isRecurring=true;
//     hand-made tasks default is_recurring=false.
//
// ── Owner routing ─────────────────────────────────────────────────────────────
//   If assigneeUserId is supplied and the person is active, they are assigned
//   directly. If they are inactive or missing, the route returns 400 — the
//   caller must pick a valid person or leave assigneeUserId unset.
//
//   If assigneeUserId is omitted and department is set, pickOwner via
//   buildWorkloadCache routes to the least-loaded active member of that dept.
//   Identical to how apply-blueprint routes new blueprint tasks.
//
//   If no assignee and no department (or no active member in that dept), the
//   task is created with ownerId = null (unassigned). This is valid; the AM
//   can reassign later via /api/tasks/reassign.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireDepartment } from "@/lib/auth";
import { VALID_DEPARTMENTS, requireDept } from "@/lib/auth/vocab";
import { prisma } from "@/lib/db/prisma";
import { buildWorkloadCache, pickOwner } from "@/lib/projects/apply-blueprint";

// requireDept() throws at module load if "Account Management" is ever removed
// from VALID_DEPARTMENTS — same guard pattern as apply-blueprint/route.ts.
const ACCOUNT_MANAGEMENT_DEPT = requireDept("Account Management");

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });

  // Matches app/api/projects/apply-blueprint/route.ts exactly:
  //   requireDepartment(user!, ACCOUNT_MANAGEMENT_DEPT, "Member")
  const deptGate = requireDepartment(user!, ACCOUNT_MANAGEMENT_DEPT, "Member");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    categoryId,
    label,
    description,
    department,
    assigneeUserId,
    dueDate,
    priority,
    estimatedHours,
    parentTaskId,
  } = body as {
    categoryId?:     string;
    label?:          string;
    description?:    string;
    department?:     string;
    assigneeUserId?: string;
    dueDate?:        string;
    priority?:       string;
    estimatedHours?: number;
    parentTaskId?:   string;
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!categoryId || typeof categoryId !== "string") {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }
  if (!label || typeof label !== "string" || !label.trim()) {
    return NextResponse.json({ error: "label is required and must be non-empty" }, { status: 400 });
  }
  const trimmedLabel = label.trim();

  if (department !== undefined && typeof department !== "string") {
    return NextResponse.json({ error: "department must be a string" }, { status: 400 });
  }
  if (department && !(VALID_DEPARTMENTS as readonly string[]).includes(department)) {
    return NextResponse.json(
      { error: `department "${department}" is not a valid department` },
      { status: 400 },
    );
  }

  if (dueDate !== undefined) {
    if (typeof dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return NextResponse.json(
        { error: "dueDate must be an ISO date string (YYYY-MM-DD)" },
        { status: 400 },
      );
    }
  }

  const VALID_PRIORITIES = ["Urgent", "High", "Medium", "Low"];
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    return NextResponse.json(
      { error: `priority must be one of: ${VALID_PRIORITIES.join(", ")}` },
      { status: 400 },
    );
  }

  if (estimatedHours !== undefined && (typeof estimatedHours !== "number" || estimatedHours < 0)) {
    return NextResponse.json(
      { error: "estimatedHours must be a non-negative number" },
      { status: 400 },
    );
  }

  // ── Verify category exists and resolve projectId ───────────────────────────
  const category = await prisma.projectCategory.findUnique({
    where:  { id: categoryId },
    select: { id: true, projectId: true },
  });
  if (!category) {
    return NextResponse.json({ error: `Category not found: ${categoryId}` }, { status: 404 });
  }

  // ── Resolve and validate parent task ──────────────────────────────────────
  if (parentTaskId) {
    const parent = await prisma.task.findUnique({
      where:  { id: parentTaskId },
      select: { id: true, categoryId: true, parentTaskId: true },
    });
    if (!parent) {
      return NextResponse.json({ error: `parentTaskId not found: ${parentTaskId}` }, { status: 404 });
    }
    // Same category required — enforces same project implicitly.
    if (parent.categoryId !== category.id) {
      return NextResponse.json(
        { error: "A subtask must belong to the same category as its parent task" },
        { status: 400 },
      );
    }
    // One level only: parent must not itself be a subtask.
    if (parent.parentTaskId !== null) {
      return NextResponse.json(
        { error: "Subtasks cannot themselves have subtasks (maximum one level of nesting)" },
        { status: 400 },
      );
    }
  }

  // ── Resolve owner ──────────────────────────────────────────────────────────
  let ownerId: string | null = null;
  let ownerName: string | null = null;

  if (assigneeUserId) {
    // Validate the named person is active.
    const namedUser = await prisma.user.findUnique({
      where:  { id: assigneeUserId },
      select: { id: true, name: true, status: true },
    });
    if (!namedUser) {
      return NextResponse.json({ error: "assigneeUserId: user not found" }, { status: 400 });
    }
    if (namedUser.status !== "active") {
      return NextResponse.json(
        { error: "assigneeUserId: user is not active" },
        { status: 400 },
      );
    }
    ownerId    = namedUser.id;
    ownerName  = namedUser.name;
  } else if (department) {
    // Route by department via buildWorkloadCache — same as apply-blueprint.
    const cache = await buildWorkloadCache([department]);
    const routed = pickOwner(department, cache);
    if (routed) {
      ownerId = routed;
      const ownerUser = await prisma.user.findUnique({
        where:  { id: routed },
        select: { name: true },
      });
      ownerName = ownerUser?.name ?? null;
    }
    // If no active member in that dept, ownerId stays null — valid state.
  }
  // If neither assigneeUserId nor department, ownerId stays null (unassigned).

  // ── Insert task ────────────────────────────────────────────────────────────
  const now    = new Date().toISOString();
  const taskId = makeId("task");

  const task = await prisma.task.create({
    data: {
      id:                     taskId,
      categoryId:             category.id,
      label:                  trimmedLabel,
      status:                 "open",
      ownerId:                ownerId ?? undefined,
      department:             department || null,
      dueDate:                dueDate   || null,
      offsetFrom:             "launch",
      offsetDays:             0,
      isSetup:                true,
      isRecurring:            false,
      recurrenceIntervalDays: 0,
      // ── Hand-made task identity ────────────────────────────────────────────
      // All three NULL so apply-blueprint and recurring engine leave it alone.
      blueprintTaskId:        null,
      blueprintTemplateId:    null,
      occurrenceKey:          null,
      blueprintAssigneeId:    null,
      // is_ad_hoc = true: excludes this row from apply-blueprint's label-match
      // guard and makes it identifiable in the UI.
      isAdHoc:                true,
      // parentTaskId: null for top-level tasks, or the parent task id for subtasks.
      parentTaskId:           parentTaskId || null,
      // Optional fields from body.
      priority:               priority       || null,
      estimatedHours:         estimatedHours !== undefined ? estimatedHours : null,
      description:            description    || null,
      onboardingRecordId:     null,
      ownerRole:              null,
      createdAt:              now,
      updatedAt:              now,
    },
  });

  return NextResponse.json({
    task: {
      id:             task.id,
      label:          task.label,
      status:         task.status,
      ownerId:        task.ownerId,
      ownerName,
      department:     task.department,
      dueDate:        task.dueDate,
      priority:       task.priority,
      estimatedHours: task.estimatedHours !== null ? Number(task.estimatedHours) : null,
      description:    task.description,
      isAdHoc:        task.isAdHoc,
      parentTaskId:   task.parentTaskId ?? null,
      createdAt:      task.createdAt,
      updatedAt:      task.updatedAt,
    },
  });
}
