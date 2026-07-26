// RTM OS — GHL Opportunity Sync API Route
//
// POST /api/ghl/sync-opportunity
//
// Syncs a single RTM Pipeline Opportunity to a GHL Opportunity.
// - If the opportunity's lead already has a GHL Contact ID (in the
//   sales-opportunities store), links the GHL Opportunity to that Contact,
//   preserving the Lead-to-Opportunity linkage from the real sales flow.
// - If ghlOpportunityId is present on the record, updates the existing
//   GHL Opportunity; otherwise creates a new one.
// - Writes the real GHL Opportunity ID, stage name, monetary value, status,
//   and sync state back into data/sales-opportunities.json.
//
// Body:
//   {
//     opportunityId:      string   — RTM opportunity record id
//     businessName:       string   — used as GHL opportunity name
//     estimatedMonthlyValue: number
//     stage:              string   — RTM stage name (mapped to GHL stage)
//     leadSource?:        string
//     assignedRep?:       string
//     // GHL linkage — pass if already known
//     ghlOpportunityId?:  string   — existing GHL opportunity ID to update
//     ghlContactId?:      string   — GHL contact to link (from Lead sync)
//     ghlPipelineId?:     string   — GHL pipeline to place the opportunity in
//     ghlStageId?:        string   — override: specific GHL stage ID to set
//   }
//
// Response (success):
//   {
//     ok: true
//     ghlOpportunityId: string
//     created: boolean
//     opportunity: GhlOpportunity
//   }
//
// Response (error):
//   { ok: false; error: string; errorCode: string }
//
// CREDENTIALS:
//   Reads from process.env.GHL_PRIVATE_INTEGRATION_TOKEN + GHL_LOCATION_ID
//   Never exposed to the client.

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  createOpportunity,
  updateOpportunity,
  listPipelines,
  ghlCredentialsConfigured,
  GhlConfigError,
  GhlApiError,
} from "@/lib/ghl/client";
import type { KanbanGhlFields } from "@/lib/sales/types";

// ── Sales opportunities file helpers ─────────────────────────────────────────

interface OpportunityRecord {
  id: string;
  [key: string]: unknown;
}

interface OpportunitiesFile {
  records: OpportunityRecord[];
}

const OPPS_FILE = path.join(process.cwd(), "data", "sales-opportunities.json");

function readOpps(): OpportunityRecord[] {
  try {
    const raw = fs.readFileSync(OPPS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as OpportunitiesFile;
    return Array.isArray(parsed.records) ? parsed.records : [];
  } catch {
    return [];
  }
}

function writeOpps(records: OpportunityRecord[]): void {
  const dir = path.dirname(OPPS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OPPS_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

function upsertOppGhlStatus(
  opportunityId: string,
  ghlPatch: Partial<KanbanGhlFields> & { ghlSyncError?: string }
): void {
  const records = readOpps();
  const idx = records.findIndex((r) => r.id === opportunityId);
  if (idx < 0) return; // record not found — nothing to patch

  const existing = records[idx];
  const existingGhl = (existing.ghl ?? {}) as Partial<KanbanGhlFields>;

  records[idx] = {
    ...existing,
    ghl: {
      ...existingGhl,
      ...ghlPatch,
    },
    updatedAt: new Date().toISOString(),
  };

  writeOpps(records);
}

// ── RTM Stage → GHL Stage name mapping ──────────────────────────────────────
// This is a best-effort mapping. If the GHL pipeline has different stage names,
// the user can override by passing ghlStageId directly.

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
    // Resolve pipeline: use provided ID, or fall back to the first pipeline in the account
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

      pipelineId = pipeline.id;
      resolvedPipelineName = pipeline.name;

      // Map RTM stage to GHL stage name → find matching stage ID
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

    const oppName = input.businessName;
    const monetaryValue = input.estimatedMonthlyValue ?? 0;

    // Determine GHL opportunity status from RTM stage
    const rtmStage = input.stage ?? "";
    const ghlStatus: "open" | "won" | "lost" | "abandoned" =
      rtmStage.includes("Won") || rtmStage.includes("Approved") || rtmStage.includes("Handoff")
        ? "won"
        : rtmStage.includes("Lost")
        ? "lost"
        : "open";

    // Guard: skip mock contact IDs — only pass real GHL contact IDs
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
      // Update existing GHL Opportunity
      opportunity = await updateOpportunity(input.ghlOpportunityId, {
        name: oppName,
        monetaryValue,
        pipelineStageId: resolvedStageId,
        status: ghlStatus,
      });
      ghlOppId = input.ghlOpportunityId;
      created = false;
    } else {
      // Create new GHL Opportunity
      opportunity = await createOpportunity({
        pipelineId,
        locationId,
        name: oppName,
        pipelineStageId: resolvedStageId,
        status: ghlStatus,
        contactId,
        monetaryValue,
        source: input.leadSource,
      });
      ghlOppId = opportunity.id;
      created = true;
    }

    // Resolve stage name from the opportunity response
    const ghlStageName: string =
      opportunity.pipelineStageName ??
      (input.stage ? RTM_TO_GHL_STAGE[input.stage] ?? input.stage : "Unknown");

    const now = new Date().toISOString();

    // Write back real GHL data into sales-opportunities.json
    upsertOppGhlStatus(input.opportunityId, {
      ghlOpportunityId: ghlOppId,
      ghlContactId: contactId ?? (opportunity.contactId ?? ""),
      ghlPipelineId: pipelineId,
      ghlPipelineName: resolvedPipelineName || opportunity.pipelineId || pipelineId,
      ghlStageId: resolvedStageId ?? "",
      ghlStageName,
      ghlAssignedUserId: opportunity.assignedTo ?? "",
      ghlAssignedUserName: input.assignedRep ?? "",
      ghlOpportunityStatus: ghlStatus,
      ghlMonetaryValue: monetaryValue,
      ghlSource: input.leadSource ?? "",
      ghlCreatedAt: opportunity.createdAt ?? now,
      ghlUpdatedAt: now,
      ghlLastActivityAt: now,
      ghlSyncStatus: "Synced",
      ghlSyncError: "",
    });

    return NextResponse.json({
      ok: true,
      ghlOpportunityId: ghlOppId,
      created,
      opportunity,
    });
  } catch (err) {
    const isConfig = err instanceof GhlConfigError;
    const isApi = err instanceof GhlApiError;

    const message = err instanceof Error ? err.message : "Unknown error";
    const errorCode = isConfig ? "GHL_NOT_CONFIGURED" : isApi ? "GHL_API_ERROR" : "UNKNOWN";

    // Write error state back to the record
    upsertOppGhlStatus(input.opportunityId!, {
      ghlSyncStatus: "Sync Failed",
      ghlSyncError: message,
      ghlUpdatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { ok: false, error: message, errorCode },
      { status: isApi ? (err as GhlApiError).status >= 500 ? 502 : 400 : 503 }
    );
  }
}
