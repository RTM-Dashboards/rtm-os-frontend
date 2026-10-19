// RTM OS — Apply Blueprint to Existing Project
//
// POST /api/projects/apply-blueprint
//   Body: { projectId: string; templateId: string; applyDate?: string }
//   → { result: ApplyBlueprintResult }
//   → { error: string } on bad input / not found
//
// Applies one task-list blueprint (by templateId) to an existing project,
// creating a new ProjectCategory and its setup + recurring tasks.
//
// Idempotent: re-applying the same blueprint to the same project skips tasks
// that already exist (setup tasks by label+category, recurring tasks by
// occurrence_key partial unique index).
//
// ── Auth guard ────────────────────────────────────────────────────────────────
// FIX 3: Applying a blueprint creates dated work across other departments and
// is an Account Management action.  This requires the Account Management
// department (any active member of that department), which also passes
// Executive and SystemAdmin via requireDepartment's condition A.
//
// Department string sourced from VALID_DEPARTMENTS in lib/auth/vocab.ts:
//   "Account Management"

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireDepartment } from "@/lib/auth";
import { VALID_DEPARTMENTS } from "@/lib/auth/vocab";
import { prisma } from "@/lib/db/prisma";
import { applyBlueprintToProject, buildWorkloadCache } from "@/lib/projects/apply-blueprint";

// The canonical department string, read directly from VALID_DEPARTMENTS.
// VALID_DEPARTMENTS[0] === "Account Management" per lib/auth/vocab.ts.
const ACCOUNT_MANAGEMENT_DEPT = VALID_DEPARTMENTS[0]; // "Account Management"

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });

  // FIX 3: Require Account Management department (Member or above within that
  // department), OR Executive / SystemAdmin (via requireDepartment condition A).
  const deptGate = requireDepartment(user!, ACCOUNT_MANAGEMENT_DEPT, "Member");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // templateId accepts either the PK (task_list_templates.id, e.g. "tlt-bp001")
  // or the serviceId (which equals the BlueprintApiRecord.id from /api/task-blueprints).
  const { projectId, templateId, applyDate: applyDateStr } =
    body as { projectId?: string; templateId?: string; applyDate?: string };

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json(
      { error: "Body must include projectId (string)" },
      { status: 400 },
    );
  }
  if (!templateId || typeof templateId !== "string") {
    return NextResponse.json(
      { error: "Body must include templateId (string)" },
      { status: 400 },
    );
  }

  // Validate the project exists.
  const project = await prisma.project.findUnique({
    where:  { id: projectId },
    select: { id: true, name: true },
  });
  if (!project) {
    return NextResponse.json({ error: `Project not found: ${projectId}` }, { status: 404 });
  }

  // Resolve template: try PK first, then serviceId.
  let template = await prisma.taskListTemplate.findUnique({
    where:  { id: templateId },
    select: { id: true, groups: true },
  });
  if (!template) {
    template = await prisma.taskListTemplate.findFirst({
      where:  { serviceId: templateId },
      select: { id: true, groups: true },
    });
  }
  if (!template) {
    return NextResponse.json({ error: `Template not found: ${templateId}` }, { status: 404 });
  }

  // Parse optional apply date (ISO date string, e.g. "2026-11-01").
  let applyDate: Date | undefined;
  if (applyDateStr && typeof applyDateStr === "string") {
    const parsed = new Date(applyDateStr);
    if (!isNaN(parsed.getTime())) applyDate = parsed;
  }

  // Build the workload cache for all departments referenced in the template.
  interface TemplateGroupLike { tasks?: Array<{ department?: string }> }
  const groups = Array.isArray(template.groups)
    ? (template.groups as unknown as TemplateGroupLike[])
    : [];
  const depts = [...new Set(
    groups.flatMap((g) => (g.tasks ?? []).map((t) => t.department ?? "").filter(Boolean)),
  )];
  const workloadCache = await buildWorkloadCache(depts);

  try {
    const result = await applyBlueprintToProject({
      projectId,
      templateId,
      applyDate,
      workloadCache,
      projectName: project.name,
    });
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
