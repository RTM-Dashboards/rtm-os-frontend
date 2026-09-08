// RTM OS — Opportunity (Pipeline) Stage Rename API Route
//
// POST /api/pipeline-stages/rename
//
// Renames an opportunity stage. In order:
//   1. Validate: old exists, new is non-empty, new is not already taken.
//   2. Validate against live GHL pipeline (Decision 1): if the rename would
//      leave RTM and GHL out of step, REFUSE with a message naming what must
//      change in GHL first. Never push to GHL.
//   3. Update the pipeline_stages config row.
//   4. Migrate opportunities.stage in the same transaction.
//   5. Return counts of records migrated.
//
// If the record migration fails, the config change does not stand.
// Approach: Prisma interactive transaction — any throw rolls back all writes.
//
// Body:
//   { oldName: string; newName: string }
//
// Response 200:
//   { ok: true; opportunitiesUpdated: number }
//
// Response 400 / 404 / 409 / 422 / 500:
//   { ok: false; error: string; errorCode: string }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  listPipelines,
  ghlCredentialsConfigured,
  GhlConfigError,
  GhlApiError,
} from "@/lib/ghl/client";

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON", errorCode: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const payload = body as { oldName?: unknown; newName?: unknown };

  // ── C1: Validate inputs ──────────────────────────────────────────────────────

  if (typeof payload.oldName !== "string" || !payload.oldName.trim()) {
    return NextResponse.json(
      { ok: false, error: "oldName is required and must be a non-empty string", errorCode: "INVALID_OLD_NAME" },
      { status: 400 }
    );
  }
  if (typeof payload.newName !== "string" || !payload.newName.trim()) {
    return NextResponse.json(
      { ok: false, error: "newName is required and must be a non-empty string", errorCode: "INVALID_NEW_NAME" },
      { status: 400 }
    );
  }

  const oldName = payload.oldName.trim();
  const newName = payload.newName.trim();

  if (oldName === newName) {
    return NextResponse.json(
      { ok: false, error: "oldName and newName are the same — nothing to rename", errorCode: "SAME_NAME" },
      { status: 400 }
    );
  }

  try {
    // Check old stage exists in config table
    const oldStage = await prisma.pipelineStage.findFirst({ where: { name: oldName } });
    if (!oldStage) {
      return NextResponse.json(
        { ok: false, error: `Opportunity stage "${oldName}" does not exist in the config table`, errorCode: "OLD_STAGE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Check new name is not already taken
    const conflict = await prisma.pipelineStage.findFirst({ where: { name: newName } });
    if (conflict) {
      return NextResponse.json(
        { ok: false, error: `Opportunity stage "${newName}" already exists — choose a different name`, errorCode: "NEW_NAME_CONFLICT" },
        { status: 409 }
      );
    }

    // ── C1 (Decision 1): Validate against live GHL pipeline ────────────────────
    // Read the live GHL pipeline and check whether the old stage name exists there.
    // If it does, a rename in RTM would leave RTM and GHL out of step.
    // Refuse the save with a clear message naming what must change in GHL first.
    // NEVER write to GHL here — only read.
    if (ghlCredentialsConfigured()) {
      const pipelineId = process.env.GHL_OPPORTUNITY_PIPELINE_ID;
      if (pipelineId) {
        try {
          const pipelines = await listPipelines();
          const pipeline = pipelines.find((p) => p.id === pipelineId);

          if (pipeline) {
            // Check whether the old RTM stage name matches any GHL stage name
            const ghlStageMatch = pipeline.stages.find(
              (s) => s.name.toLowerCase() === oldName.toLowerCase()
            );

            if (ghlStageMatch) {
              // The old stage name exists in GHL. A rename in RTM without a
              // matching rename in GHL would leave the two systems mismatched.
              return NextResponse.json(
                {
                  ok: false,
                  error:
                    `Cannot rename RTM stage "${oldName}" to "${newName}" because GHL pipeline ` +
                    `"${pipeline.name}" still has a stage named "${ghlStageMatch.name}" ` +
                    `(id: ${ghlStageMatch.id}). ` +
                    `Rename or remove that stage in GHL first, then retry this rename in RTM.`,
                  errorCode: "GHL_STAGE_MISMATCH",
                  ghlPipelineName: pipeline.name,
                  ghlPipelineId: pipeline.id,
                  ghlStageName: ghlStageMatch.name,
                  ghlStageId: ghlStageMatch.id,
                },
                { status: 422 }
              );
            }
            // The old name does not appear in GHL — safe to rename in RTM.
          }
          // If the configured pipeline is not found in GHL, allow the rename
          // (GHL may be misconfigured, but that is a separate problem).
        } catch (ghlErr) {
          // GHL API error during the validation read.
          // Refuse the rename rather than proceeding blind — a partial state
          // (RTM renamed, GHL unknown) is worse than a refused rename.
          const isApi = ghlErr instanceof GhlApiError;
          const isConfig = ghlErr instanceof GhlConfigError;
          const msg = ghlErr instanceof Error ? ghlErr.message : "Unknown GHL error";
          return NextResponse.json(
            {
              ok: false,
              error:
                `Could not validate against the live GHL pipeline: ${msg}. ` +
                `Fix the GHL connection and retry.`,
              errorCode: isConfig ? "GHL_NOT_CONFIGURED" : isApi ? "GHL_API_ERROR" : "GHL_READ_ERROR",
            },
            { status: 502 }
          );
        }
      }
      // If GHL_OPPORTUNITY_PIPELINE_ID is not set, skip the GHL check.
      // The rename proceeds — the operator has not configured a pipeline to validate against.
    }
    // If GHL credentials are not configured, skip the GHL check entirely.

    // ── C2 + C3: Update config and migrate records in one transaction ──────────
    // Atomic: if opportunities.stage update fails, the config change is rolled back.
    const now = new Date().toISOString();
    let opportunitiesUpdated = 0;

    await prisma.$transaction(async (tx) => {
      // C2: update the config row
      await tx.pipelineStage.update({
        where: { id: oldStage.id },
        data: { name: newName, updatedAt: now },
      });

      // C3: migrate opportunity records
      const oppResult = await tx.opportunity.updateMany({
        where: { stage: oldName },
        data: { stage: newName, updatedAt: now },
      });
      opportunitiesUpdated = oppResult.count;
    });

    // ── C4: Report what changed ────────────────────────────────────────────────
    return NextResponse.json({
      ok: true,
      opportunitiesUpdated,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), errorCode: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
