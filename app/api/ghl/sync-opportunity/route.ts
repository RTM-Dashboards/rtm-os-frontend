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
  ghlPatch: Partial<KanbanGhlFields> & { ghlSyncError?: string }
): Promise<void> {
  const row = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!row) return; // record not found — nothing to patch

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingGhl = ((row.ghl ?? {}) as any);
  const updatedGhl = {
    ...existingGhl,
    ...ghlPatch,
  } as Prisma.InputJsonValue;

  await prisma.opportunity.update({
    where:  { id: opportunityId },
    data:   { ghl: updatedGhl, updatedAt: new Date().toISOString() },
  });
}

// ── RTM Stage → GHL Stage name mapping ───────────────────────────────────────

const RTM_TO_GHL_STAGE: Record<string, string> = {
  "Lead":             "New Lead",
  "Discovery":        "Appointment Booked",
  "Qualified":        "Qualified",
  "Audit Requested":  "Audit Requested",
  "Audit In Progress":"Audit Requested",
  "Proposal Draft":   "Proposal Sent",
  "Proposal Sent":    "Proposal Sent",
  "Negotiation":      "Negotiation",
  "Verbal Approval":  "Won",
  "Proposal Approved":"Won",
  "Sales Handoff":    "Won",
  "Closed Won":       "Won",
  "Closed Lost":      "Lost",
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
    let pipelineId = input.ghlPipelineId;
    let resolvedPipelineName = "";
    let resolvedStageId = input.ghlStageId;

    if (!pipelineId || !resolvedStageId) {
      const pipelines = await listPipelines();
      if (pipelines.length === 0) {
        throw new Error("No GHL pipelines found in this location. Create a pipeline in GHL first.");
      }

      const pipeline = pipelineId
        ? pipelines.find((p) => p.id === pipelineId) ?? pipelines[0]
        : pipelines[0];

      pipelineId          = pipeline.id;
      resolvedPipelineName = pipeline.name;

      if (!resolvedStageId && input.stage) {
        const targetGhlStageName = RTM_TO_GHL_STAGE[input.stage] ?? input.stage;
        const matchedStage = pipeline.stages.find(
          (s) => s.name.toLowerCase() === targetGhlStageName.toLowerCase()
        );
        resolvedStageId = matchedStage?.id ?? pipeline.stages[0]?.id;
      }

      if (!resolvedStageId && pipeline.stages.length > 0) {
        resolvedStageId = pipeline.stages[0].id;
      }
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

    const ghlStageName: string =
      opportunity.pipelineStageName ??
      (input.stage ? RTM_TO_GHL_STAGE[input.stage] ?? input.stage : "Unknown");

    const now = new Date().toISOString();

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
    });

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
