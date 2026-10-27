// RTM OS — Apply Project Template to Existing Project
//
// POST /api/projects/apply-template
//   Body: { projectId: string; templateId: string; applyDate?: string }
//   → { results: ApplyTemplateResult }
//   → { error: string } on bad input / not found
//
// Applies every blueprint in a project template to an existing project, in
// position order.  Each blueprint is applied through the existing
// applyBlueprintToProject function — no logic is duplicated here.
//
// IDEMPOTENCY:
//   Inherits from applyBlueprintToProject: applying the same template twice
//   adds no duplicate categories and no duplicate tasks.  Each blueprint's
//   own idempotency guards (occurrence_key + label/blueprint_task_id) apply.
//
// PARTIAL FAILURE:
//   If N blueprints apply and M fail, the response includes per-blueprint
//   results for ALL blueprints with a succeeded/failed flag.  The HTTP status
//   is 207 Multi-Status when at least one blueprint fails and at least one
//   succeeds, 500 when all fail, 200 when all succeed.
//
// WORKLOAD CACHE:
//   buildWorkloadCache is called ONCE across all blueprints in the template,
//   so a six-blueprint template fires exactly 2 workload queries total
//   (one user findMany + one task groupBy), not 2 × 6.
//
// AUTH GUARD:
//   Matches POST /api/projects/apply-blueprint:
//   requireDepartment(user, "Account Management", "Member")
//   (passes Executive and SystemAdmin via condition A in requireDepartment).
//   Source: app/api/projects/apply-blueprint/route.ts
//   Department string sourced from VALID_DEPARTMENTS[0] === "Account Management".

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireDepartment } from "@/lib/auth";
import { VALID_DEPARTMENTS } from "@/lib/auth/vocab";
import { prisma } from "@/lib/db/prisma";
import { applyBlueprintToProject, buildWorkloadCache } from "@/lib/projects/apply-blueprint";
import type { ApplyBlueprintResult } from "@/lib/projects/apply-blueprint";

const ACCOUNT_MANAGEMENT_DEPT = VALID_DEPARTMENTS[0]; // "Account Management"

export interface BlueprintApplyOutcome {
  blueprintId:   string;
  blueprintName: string;
  position:      number;
  succeeded:     boolean;
  /** Present on success */
  result?:       ApplyBlueprintResult;
  /** Present on failure */
  error?:        string;
}

export interface ApplyTemplateResult {
  templateId:   string;
  templateName: string;
  projectId:    string;
  /** Per-blueprint outcome, ordered by position. */
  outcomes:     BlueprintApplyOutcome[];
  /** Count of blueprints that succeeded. */
  succeeded:    number;
  /** Count of blueprints that failed. */
  failed:       number;
}

// ── Template group shape (mirrors apply-blueprint.ts) ────────────────────────
interface TemplateGroupLike { tasks?: Array<{ department?: string }> }

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });

  const deptGate = requireDepartment(user!, ACCOUNT_MANAGEMENT_DEPT, "Member");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

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

  // ── Validate project ──────────────────────────────────────────────────────
  const project = await prisma.project.findUnique({
    where:  { id: projectId },
    select: { id: true, name: true },
  });
  if (!project) {
    return NextResponse.json({ error: `Project not found: ${projectId}` }, { status: 404 });
  }

  // ── Validate template and load its blueprints ─────────────────────────────
  const template = await prisma.projectTemplate.findUnique({
    where:   { id: templateId },
    include: {
      blueprints: {
        orderBy: { position: "asc" },
        include: {
          blueprint: {
            select: { id: true, name: true, groups: true },
          },
        },
      },
    },
  });
  if (!template) {
    return NextResponse.json({ error: `Template not found: ${templateId}` }, { status: 404 });
  }

  if (template.blueprints.length === 0) {
    return NextResponse.json(
      { error: "This template has no blueprints and cannot be applied." },
      { status: 422 },
    );
  }

  // ── Parse optional apply date ─────────────────────────────────────────────
  let applyDate: Date | undefined;
  if (applyDateStr && typeof applyDateStr === "string") {
    const parsed = new Date(applyDateStr);
    if (!isNaN(parsed.getTime())) applyDate = parsed;
  }

  // ── Build workload cache ONCE across all blueprints ───────────────────────
  //
  // Collect every department referenced by every blueprint in this template,
  // then call buildWorkloadCache once.  This means exactly 2 queries total for
  // workload resolution across the entire template application (one user
  // findMany + one task groupBy), regardless of how many blueprints or tasks
  // are in the template.
  const allDepts = new Set<string>();
  for (const slot of template.blueprints) {
    const groups = Array.isArray(slot.blueprint.groups)
      ? (slot.blueprint.groups as unknown as TemplateGroupLike[])
      : [];
    for (const g of groups) {
      for (const t of g.tasks ?? []) {
        if (t.department) allDepts.add(t.department);
      }
    }
  }
  const workloadCache = await buildWorkloadCache([...allDepts]);

  // ── Apply each blueprint in order ─────────────────────────────────────────
  const outcomes: BlueprintApplyOutcome[] = [];

  for (const slot of template.blueprints) {
    const blueprintId   = slot.blueprintId;
    const blueprintName = slot.blueprint.name || blueprintId;

    try {
      const result = await applyBlueprintToProject({
        projectId,
        templateId:    blueprintId,
        applyDate,
        workloadCache,
        projectName:   project.name,
      });

      if (result.templateNotFound) {
        // Blueprint was deleted since the template was saved.
        outcomes.push({
          blueprintId,
          blueprintName,
          position:  slot.position,
          succeeded: false,
          error:     `Blueprint not found: ${blueprintId}`,
        });
      } else {
        outcomes.push({
          blueprintId,
          blueprintName,
          position:  slot.position,
          succeeded: true,
          result,
        });
      }
    } catch (err) {
      outcomes.push({
        blueprintId,
        blueprintName,
        position:  slot.position,
        succeeded: false,
        error:     err instanceof Error ? err.message : String(err),
      });
    }
  }

  const succeededCount = outcomes.filter((o) => o.succeeded).length;
  const failedCount    = outcomes.filter((o) => !o.succeeded).length;

  const applyResult: ApplyTemplateResult = {
    templateId:   template.id,
    templateName: template.name,
    projectId,
    outcomes,
    succeeded:    succeededCount,
    failed:       failedCount,
  };

  // HTTP status:
  //   200 — all blueprints succeeded
  //   207 — partial success (at least one succeeded, at least one failed)
  //   500 — all blueprints failed
  const httpStatus =
    failedCount === 0           ? 200 :
    succeededCount === 0        ? 500 : 207;

  return NextResponse.json({ results: applyResult }, { status: httpStatus });
}
