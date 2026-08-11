// RTM OS — GHL Opportunity Sync API Route
//
// POST /api/ghl/sync-opportunity
//
// Persistence layer: previously data/sales-opportunities.json (fs.readFileSync/writeFileSync).
// Now backed by PostgreSQL via Prisma (Supabase in production).
//
// The external API contract is UNCHANGED — same request/response shapes.
// No frontend code needs to change.
//
// Syncs a single RTM Pipeline Opportunity to a GHL Opportunity.
// - If ghlOpportunityId is present, updates the existing GHL Opportunity;
//   otherwise creates a new one.
// - Writes the real GHL Opportunity ID, stage name, monetary value, status,
//   and sync state back into the opportunities table.
//
// Body:
//   {
//     opportunityId:      string
//     businessName:       string
//     estimatedMonthlyValue?: number
//     stage?:             string
//     leadSource?:        string
//     assignedRep?:       string
//     ghlOpportunityId?:  string
//     ghlContactId?:      string
//     ghlPipelineId?:     string
//     ghlStageId?:        string
//   }
//
// CREDENTIALS:
//   Reads from process.env.GHL_PRIVATE_INTEGRATION_TOKEN + GHL_LOCATION_ID

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  createOpportunity,
  updateOpportunity,
  listPipelines,
  ghlCredentialsConfigured,
  GhlConfigError,
  GhlApiError,
} from "@/lib/ghl/client";
import type { KanbanGhlFields } from "@/lib/sales/types";
import { Prisma } from "@prisma/client";

// ── DB helper: upsert opportunity GHL status ──────────────────────────────────

async function upsertOppGhlStatus(
  opportunityId: string,
  ghlPatch: Partial<KanbanGhlFields> & { ghlSyncError?: string },
  /** When true, sets the flat ghlSynced column to true on success.
   *  When false (failure path), leaves ghlSynced unchanged — it must
   *  not be clobbered to false if a prior sync succeeded. */
  markSynced?: boolean
): Promise<void> {
  const row = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!row) return; // record not found — nothing to patch

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingGhl = ((row.ghl ?? {}) as any);
  const updatedGhl = {
    ...existingGhl,
    ...ghlPatch,
  } as Prisma.InputJsonValue;

  // Only touch GHL metadata fields. stage, clientName, and all user-edited
  // fields are intentionally absent from this update.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataUpdate: Record<string, any> = { ghl: updatedGhl, updatedAt: new Date().toISOString() };
  if (markSynced === true) {
    dataUpdate.ghlSynced = true;
  }

  await prisma.opportunity.update({
    where: { id: opportunityId },
    data:  dataUpdate,
  });
}

// ── RTM Stage → GHL Stage name mapping ───────────────────────────────────────
//
// This map exists as an explicit translation layer even though the current
// GHL test pipeline ("RTM OS TEST (do not use)") uses the same stage names as
// RTM. Reasons to keep it explicit rather than falling through directly:
//
//   1. A future production pipeline may use different stage names (e.g. the
//      existing "Sales Management" pipeline uses "Closed Won" / "Closed Lost"
//      but also has different intermediate names). Keeping the map means a
//      pipeline swap requires only updating this map, not the route logic.
//
//   2. It makes every expected RTM stage an explicit, auditable contract.
//      If a new RTM stage is added but not mapped, it fails loudly (see the
//      strict lookup below) rather than silently going to the wrong column.
//
// Rules:
//   - Every key is an RTM stage name exactly as stored in the DB.
//   - Every value is the corresponding GHL stage name in the configured
//     pipeline (GHL_OPPORTUNITY_PIPELINE_ID).
//   - "Lead", "Discovery", "Qualified", and "New Opportunity" are NOT mapped
//     here — they were removed from the Pipeline module. The Lead module owns
//     those stages. An Opportunity is created only after a lead is Qualified,
//     so the Pipeline starts at "Sales Intake".
//   - "Closed Won" and "Closed Lost" are real GHL stage names in this
//     pipeline. The GHL opportunity STATUS (open/won/lost) is set separately
//     via the ghlStatus calculation below — the two are complementary.
//
const RTM_TO_GHL_STAGE: Record<string, string> = {
  "Sales Intake":     "Sales Intake",
  "Audit Requested":  "Audit Requested",
  "Audit In Progress":"Audit In Progress",
  "Proposal Draft":   "Proposal Draft",
  "Proposal Sent":    "Proposal Sent",
  "Negotiation":      "Negotiation",
  "Verbal Approval":  "Verbal Approval",
  "Proposal Approved":"Proposal Approved",
  "Sales Handoff":    "Sales Handoff",
  "Closed Won":       "Closed Won",
  "Closed Lost":      "Closed Lost",
};

// ── Input type ────────────────────────────────────────────────────────────────

interface SyncOpportunityInput {
  opportunityId: string;
  businessName: string;
  estimatedMonthlyValue?: number;
  stage?: string;
  leadSource?: string;
  assignedRep?: string;
  ghlOpportunityId?: string;
  ghlContactId?: string;
  ghlPipelineId?: string;
  ghlStageId?: string;
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!ghlCredentialsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "GHL credentials not configured. Set GHL_PRIVATE_INTEGRATION_TOKEN and GHL_LOCATION_ID in environment variables.",
        errorCode: "GHL_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON", errorCode: "INVALID_JSON" }, { status: 400 });
  }

  const input = body as Partial<SyncOpportunityInput>;
  if (!input?.opportunityId) {
    return NextResponse.json(
      { ok: false, error: "opportunityId is required", errorCode: "MISSING_OPP_ID" },
      { status: 400 }
    );
  }
  if (!input.businessName) {
    return NextResponse.json(
      { ok: false, error: "businessName is required", errorCode: "MISSING_BUSINESS_NAME" },
      { status: 400 }
    );
  }

  const locationId = process.env.GHL_LOCATION_ID!;

  try {
    // ── Pipeline resolution ──────────────────────────────────────────────────────────
    // Priority: (1) ghlPipelineId from request body, (2) GHL_OPPORTUNITY_PIPELINE_ID env,
    // (3) loud failure — no silent fallback to whichever pipeline happens to be first.
    let pipelineId: string =
      input.ghlPipelineId ||
      process.env.GHL_OPPORTUNITY_PIPELINE_ID ||
      "";

    if (!pipelineId) {
      throw new Error(
        "Pipeline not configured: supply ghlPipelineId in the request body or set " +
        "GHL_OPPORTUNITY_PIPELINE_ID in environment variables."
      );
    }

    let resolvedPipelineName = "";
    let resolvedStageId = input.ghlStageId;

    if (!resolvedStageId) {
      // We need stage details — fetch the pipeline list and locate the configured pipeline.
      const pipelines = await listPipelines();

      const pipeline = pipelines.find((p) => p.id === pipelineId);
      if (!pipeline) {
        throw new Error(
          `Pipeline id "${pipelineId}" was not found in the GHL location. ` +
          `Check GHL_OPPORTUNITY_PIPELINE_ID (or the ghlPipelineId in the request body). ` +
          `Available pipeline ids: ${pipelines.map((p) => `${p.id} (${p.name})`).join(", ") || "none"}.`
        );
      }

      pipelineId           = pipeline.id;
      resolvedPipelineName = pipeline.name;

      if (input.stage) {
        // Look up the RTM stage in the explicit translation map.
        // The map is an auditable contract: every known RTM stage is listed.
        // An unmapped stage is a CONFIGURATION ERROR — fail loudly rather than
        // silently landing the opportunity in the wrong column.
        if (!(input.stage in RTM_TO_GHL_STAGE)) {
          throw new Error(
            `RTM stage "${input.stage}" is not in RTM_TO_GHL_STAGE. ` +
            `Add a mapping entry in app/api/ghl/sync-opportunity/route.ts before syncing.`
          );
        }

        const targetGhlStageName = RTM_TO_GHL_STAGE[input.stage];
        const matchedStage = pipeline.stages.find(
          (s) => s.name.toLowerCase() === targetGhlStageName.toLowerCase()
        );

        if (!matchedStage) {
          throw new Error(
            `RTM stage "${input.stage}" maps to GHL stage name "${targetGhlStageName}" ` +
            `but that stage does not exist in pipeline "${pipeline.name}" (${pipeline.id}). ` +
            `Existing stages: ${pipeline.stages.map((s) => `"${s.name}"`).join(", ") || "none"}.`
          );
        }

        resolvedStageId = matchedStage.id;
      }
      // If no stage was supplied, resolvedStageId stays undefined — GHL will
      // place the opportunity in the pipeline default. That is acceptable for
      // the GhlSyncIssuesPanel caller which does not know the current stage.
    }

    const oppName      = input.businessName;
    const monetaryValue = input.estimatedMonthlyValue ?? 0;

    const rtmStage = input.stage ?? "";
    const ghlStatus: "open" | "won" | "lost" | "abandoned" =
      rtmStage.includes("Won") || rtmStage.includes("Approved") || rtmStage.includes("Handoff")
        ? "won"
        : rtmStage.includes("Lost")
        ? "lost"
        : "open";

    // Guard: skip mock contact IDs
    const contactId =
      input.ghlContactId &&
      !input.ghlContactId.startsWith("GHL-CON-") &&
      input.ghlContactId !== "—"
        ? input.ghlContactId
        : undefined;

    let ghlOppId: string;
    let created: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let opportunity: any;

    if (
      input.ghlOpportunityId &&
      !input.ghlOpportunityId.startsWith("ghl-opp-")
    ) {
      opportunity = await updateOpportunity(input.ghlOpportunityId, {
        name:            oppName,
        monetaryValue,
        pipelineStageId: resolvedStageId,
        status:          ghlStatus,
      });
      ghlOppId = input.ghlOpportunityId;
      created  = false;
    } else {
      opportunity = await createOpportunity({
        pipelineId,
        locationId,
        name:            oppName,
        pipelineStageId: resolvedStageId,
        status:          ghlStatus,
        contactId,
        monetaryValue,
        source:          input.leadSource,
      });
      ghlOppId = opportunity.id;
      created  = true;
    }

    // The map values are now real GHL stage names, so RTM_TO_GHL_STAGE[input.stage]
    // is the correct display name. Fall back to input.stage itself if somehow absent.
    const ghlStageName: string =
      opportunity.pipelineStageName ??
      (input.stage ? (RTM_TO_GHL_STAGE[input.stage] ?? input.stage) : "Unknown");

    const now = new Date().toISOString();

    // markSynced=true sets the flat ghlSynced column so the card renders
    // "GHL: Synced" after a successful write. Only GHL metadata fields are
    // touched; stage, clientName, and user-edited fields are untouched.
    await upsertOppGhlStatus(input.opportunityId, {
      ghlOpportunityId:     ghlOppId,
      ghlContactId:         contactId ?? (opportunity.contactId ?? ""),
      ghlPipelineId:        pipelineId,
      ghlPipelineName:      resolvedPipelineName || opportunity.pipelineId || pipelineId,
      ghlStageId:           resolvedStageId ?? "",
      ghlStageName,
      ghlAssignedUserId:    opportunity.assignedTo ?? "",
      ghlAssignedUserName:  input.assignedRep ?? "",
      ghlOpportunityStatus: ghlStatus,
      ghlMonetaryValue:     monetaryValue,
      ghlSource:            input.leadSource ?? "",
      ghlCreatedAt:         opportunity.createdAt ?? now,
      ghlUpdatedAt:         now,
      ghlLastActivityAt:    now,
      ghlSyncStatus:        "Synced",
      ghlSyncError:         "",
    }, true);

    return NextResponse.json({ ok: true, ghlOpportunityId: ghlOppId, created, opportunity });
  } catch (err) {
    const isConfig = err instanceof GhlConfigError;
    const isApi    = err instanceof GhlApiError;
    const message  = err instanceof Error ? err.message : "Unknown error";
    const errorCode = isConfig ? "GHL_NOT_CONFIGURED" : isApi ? "GHL_API_ERROR" : "UNKNOWN";

    await upsertOppGhlStatus(input.opportunityId!, {
      ghlSyncStatus: "Sync Failed",
      ghlSyncError:  message,
      ghlUpdatedAt:  new Date().toISOString(),
    });

    return NextResponse.json(
      { ok: false, error: message, errorCode },
      { status: isApi ? (err as GhlApiError).status >= 500 ? 502 : 400 : 503 }
    );
  }
}
