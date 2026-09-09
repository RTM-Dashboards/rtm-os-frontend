// RTM OS — Sales Proposals API Route
//
// Persistence layer: reads/writes the `proposals` table in Postgres via Prisma.
// Previously backed by data/sales-proposals.json (fs.readFileSync/writeFileSync),
// which is read-only in Vercel's serverless environment and silently discarded
// every production write. That file is left in place as a record but is no
// longer read.
//
// GET   /api/sales-proposals           → { records: SalesProposalRecord[] }
// POST  /api/sales-proposals           → body: SalesProposalRecord
//                                        → { record: SalesProposalRecord }
//                                        (upsert by id; merges on top of existing)
// PATCH /api/sales-proposals           → body: { id, ...partialFields }
//                                        → { record: SalesProposalRecord }
//                                        (partial update — merges supplied fields)
//
// A failed write returns { error: string } with HTTP 500.
// It NEVER returns { record } on failure — the original silent-failure
// shape is not reproduced.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SalesProposalRecord {
  id: string;                          // == wizardId
  status: "draft" | "in-progress" | "sent" | "accepted" | "rejected" | "complete";
  opportunityId: string | null;
  leadId: string | null;
  currentStep: number;
  completedSteps: number[];
  clientInfo: {
    name: string;
    businessName: string;
    industry: string;
    location: string;
    website: string;
    leadSource: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    notes: string;
  };
  selectedGoals: string[];
  auditMode: string | null;
  selectedAuditId: string | null;
  auditResult: unknown;
  approvedRecommendations: string[];
  approvedRecommendationServiceNames: string[];
  lineItems: unknown[];
  discountPercentage: number;
  discount: unknown;
  budgetResult: unknown;
  proposalDocument: unknown;
  intakeRecord: unknown;
  aiAuditResult: unknown;
  preselectedAuditId: string | null;
  preselectedAuditType: string | null;
  lastSavedAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Allow arbitrary extra wizard fields
  [key: string]: unknown;
}

// ── DB row ↔ SalesProposalRecord conversion ───────────────────────────────────
//
// The Prisma row stores extra wizard fields (e.g. wizardId, linkedOpportunityId)
// in `extraFields` Json. When reading we spread them back so callers see the
// same flat shape they always have.

type ProposalRow = Prisma.ProposalGetPayload<Record<string, never>>;

function rowToRecord(row: ProposalRow): SalesProposalRecord {
  const extra = (row.extraFields ?? {}) as Record<string, unknown>;
  return {
    // Spread extra fields first so named columns always win on collision
    ...extra,
    id: row.id,
    status: row.status as SalesProposalRecord["status"],
    opportunityId: row.opportunityId ?? null,
    leadId: row.leadId ?? null,
    currentStep: row.currentStep,
    completedSteps: row.completedSteps,
    clientInfo: (row.clientInfo ?? null) as SalesProposalRecord["clientInfo"],
    selectedGoals: row.selectedGoals,
    auditMode: row.auditMode ?? null,
    selectedAuditId: row.selectedAuditId ?? null,
    auditResult: row.auditResult ?? null,
    approvedRecommendations: row.approvedRecommendations,
    approvedRecommendationServiceNames: row.approvedRecommendationServiceNames,
    lineItems: (row.lineItems ?? []) as unknown[],
    discountPercentage: row.discountPercentage,
    discount: row.discount ?? null,
    budgetResult: row.budgetResult ?? null,
    proposalDocument: row.proposalDocument ?? null,
    intakeRecord: row.intakeRecord ?? null,
    aiAuditResult: row.aiAuditResult ?? null,
    preselectedAuditId: row.preselectedAuditId ?? null,
    preselectedAuditType: row.preselectedAuditType ?? null,
    lastSavedAt: row.lastSavedAt ?? null,
    sentAt: row.sentAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// Separate known column fields from arbitrary extras in an incoming body.
// The extras go into `extraFields` Json so nothing is lost.
const KNOWN_COLUMNS = new Set([
  "id", "status", "opportunityId", "leadId", "currentStep", "completedSteps",
  "clientInfo", "selectedGoals", "auditMode", "selectedAuditId", "auditResult",
  "approvedRecommendations", "approvedRecommendationServiceNames", "lineItems",
  "discountPercentage", "discount", "budgetResult", "proposalDocument",
  "intakeRecord", "aiAuditResult", "preselectedAuditId", "preselectedAuditType",
  "lastSavedAt", "sentAt", "createdAt", "updatedAt",
]);

function extractExtras(incoming: Record<string, unknown>): Record<string, unknown> {
  const extras: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(incoming)) {
    if (!KNOWN_COLUMNS.has(k)) {
      extras[k] = v;
    }
  }
  return extras;
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await prisma.proposal.findMany({
      orderBy: { createdAt: "asc" },
    });
    const records = rows.map(rowToRecord);
    return NextResponse.json({ records });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST ───────────────────────────────────────────────────────────────────────
// Upsert by id. Merges incoming data on top of existing record when present.
// Caller should send the full wizard state or a complete proposal record.

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as Partial<SalesProposalRecord>;
  if (!incoming || typeof incoming.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const extras = extractExtras(incoming as Record<string, unknown>);

  try {
    // Read existing row so we can merge (same behaviour as the old file-based upsert)
    const existing = await prisma.proposal.findUnique({ where: { id: incoming.id } });

    let row: ProposalRow;

    if (existing) {
      // Merge existing extraFields with new extras
      const mergedExtras = {
        ...((existing.extraFields ?? {}) as Record<string, unknown>),
        ...extras,
      };

      row = await prisma.proposal.update({
        where: { id: incoming.id },
        data: {
          status:      incoming.status      ?? existing.status,
          opportunityId: incoming.opportunityId !== undefined ? incoming.opportunityId : existing.opportunityId,
          leadId:      incoming.leadId      !== undefined ? incoming.leadId : existing.leadId,
          currentStep: incoming.currentStep ?? existing.currentStep,
          completedSteps: incoming.completedSteps ?? existing.completedSteps,
          clientInfo:  incoming.clientInfo  !== undefined ? (incoming.clientInfo as Prisma.InputJsonValue) : existing.clientInfo ?? Prisma.JsonNull,
          selectedGoals: incoming.selectedGoals ?? existing.selectedGoals,
          auditMode:   incoming.auditMode   !== undefined ? incoming.auditMode : existing.auditMode,
          selectedAuditId: incoming.selectedAuditId !== undefined ? incoming.selectedAuditId : existing.selectedAuditId,
          auditResult: incoming.auditResult !== undefined ? (incoming.auditResult as Prisma.InputJsonValue ?? Prisma.JsonNull) : existing.auditResult ?? Prisma.JsonNull,
          approvedRecommendations: incoming.approvedRecommendations ?? existing.approvedRecommendations,
          approvedRecommendationServiceNames: incoming.approvedRecommendationServiceNames ?? existing.approvedRecommendationServiceNames,
          lineItems:   incoming.lineItems   !== undefined ? (incoming.lineItems as Prisma.InputJsonValue ?? Prisma.JsonNull) : existing.lineItems ?? Prisma.JsonNull,
          discountPercentage: incoming.discountPercentage ?? existing.discountPercentage,
          discount:    incoming.discount    !== undefined ? (incoming.discount as Prisma.InputJsonValue ?? Prisma.JsonNull) : existing.discount ?? Prisma.JsonNull,
          budgetResult: incoming.budgetResult !== undefined ? (incoming.budgetResult as Prisma.InputJsonValue ?? Prisma.JsonNull) : existing.budgetResult ?? Prisma.JsonNull,
          proposalDocument: incoming.proposalDocument !== undefined ? (incoming.proposalDocument as Prisma.InputJsonValue ?? Prisma.JsonNull) : existing.proposalDocument ?? Prisma.JsonNull,
          intakeRecord: incoming.intakeRecord !== undefined ? (incoming.intakeRecord as Prisma.InputJsonValue ?? Prisma.JsonNull) : existing.intakeRecord ?? Prisma.JsonNull,
          aiAuditResult: incoming.aiAuditResult !== undefined ? (incoming.aiAuditResult as Prisma.InputJsonValue ?? Prisma.JsonNull) : existing.aiAuditResult ?? Prisma.JsonNull,
          preselectedAuditId: incoming.preselectedAuditId !== undefined ? incoming.preselectedAuditId : existing.preselectedAuditId,
          preselectedAuditType: incoming.preselectedAuditType !== undefined ? incoming.preselectedAuditType : existing.preselectedAuditType,
          lastSavedAt: incoming.lastSavedAt !== undefined ? incoming.lastSavedAt : existing.lastSavedAt,
          sentAt:      incoming.sentAt      !== undefined ? incoming.sentAt : existing.sentAt,
          extraFields: Object.keys(mergedExtras).length > 0 ? (mergedExtras as Prisma.InputJsonValue) : Prisma.JsonNull,
          updatedAt:   now,
        },
      });
    } else {
      row = await prisma.proposal.create({
        data: {
          id: incoming.id,
          status: incoming.status ?? "draft",
          opportunityId: incoming.opportunityId ?? null,
          leadId: incoming.leadId ?? null,
          currentStep: incoming.currentStep ?? 1,
          completedSteps: incoming.completedSteps ?? [],
          clientInfo: incoming.clientInfo
            ? (incoming.clientInfo as Prisma.InputJsonValue)
            : {
                name: "", businessName: "", industry: "", location: "",
                website: "", leadSource: "", contactName: "", contactEmail: "",
                contactPhone: "", notes: "",
              },
          selectedGoals: incoming.selectedGoals ?? [],
          auditMode: incoming.auditMode ?? null,
          selectedAuditId: incoming.selectedAuditId ?? null,
          auditResult: incoming.auditResult != null ? (incoming.auditResult as Prisma.InputJsonValue) : Prisma.JsonNull,
          approvedRecommendations: incoming.approvedRecommendations ?? [],
          approvedRecommendationServiceNames: incoming.approvedRecommendationServiceNames ?? [],
          lineItems: incoming.lineItems != null ? (incoming.lineItems as Prisma.InputJsonValue) : [],
          discountPercentage: incoming.discountPercentage ?? 0,
          discount: incoming.discount != null
            ? (incoming.discount as Prisma.InputJsonValue)
            : { type: "none", value: 0, label: "", authorizationNote: "" },
          budgetResult: incoming.budgetResult != null ? (incoming.budgetResult as Prisma.InputJsonValue) : Prisma.JsonNull,
          proposalDocument: incoming.proposalDocument != null ? (incoming.proposalDocument as Prisma.InputJsonValue) : Prisma.JsonNull,
          intakeRecord: incoming.intakeRecord != null ? (incoming.intakeRecord as Prisma.InputJsonValue) : Prisma.JsonNull,
          aiAuditResult: incoming.aiAuditResult != null ? (incoming.aiAuditResult as Prisma.InputJsonValue) : Prisma.JsonNull,
          preselectedAuditId: incoming.preselectedAuditId ?? null,
          preselectedAuditType: incoming.preselectedAuditType ?? null,
          lastSavedAt: incoming.lastSavedAt ?? null,
          sentAt: incoming.sentAt ?? null,
          extraFields: Object.keys(extras).length > 0 ? (extras as Prisma.InputJsonValue) : Prisma.JsonNull,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    return NextResponse.json({ record: rowToRecord(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH ──────────────────────────────────────────────────────────────────────
// Partial update: merges supplied fields onto the existing record.
// Required: body.id (string). All other fields are optional.
// Used for status transitions (Send Proposal → "sent") and lastSavedAt updates.

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch = body as Partial<SalesProposalRecord> & { id: string };
  if (!patch || typeof patch.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.proposal.findUnique({ where: { id: patch.id } });
    if (!existing) {
      return NextResponse.json(
        { error: `No record found with id: ${patch.id}` },
        { status: 404 }
      );
    }

    const extras = extractExtras(patch as Record<string, unknown>);
    const mergedExtras = {
      ...((existing.extraFields ?? {}) as Record<string, unknown>),
      ...extras,
    };

    const row = await prisma.proposal.update({
      where: { id: patch.id },
      data: {
        ...(patch.status      !== undefined && { status: patch.status }),
        ...(patch.opportunityId !== undefined && { opportunityId: patch.opportunityId }),
        ...(patch.leadId      !== undefined && { leadId: patch.leadId }),
        ...(patch.currentStep !== undefined && { currentStep: patch.currentStep }),
        ...(patch.completedSteps !== undefined && { completedSteps: patch.completedSteps }),
        ...(patch.clientInfo  !== undefined && { clientInfo: patch.clientInfo as Prisma.InputJsonValue }),
        ...(patch.selectedGoals !== undefined && { selectedGoals: patch.selectedGoals }),
        ...(patch.auditMode   !== undefined && { auditMode: patch.auditMode }),
        ...(patch.selectedAuditId !== undefined && { selectedAuditId: patch.selectedAuditId }),
        ...(patch.auditResult !== undefined && { auditResult: (patch.auditResult as Prisma.InputJsonValue) ?? Prisma.JsonNull }),
        ...(patch.approvedRecommendations !== undefined && { approvedRecommendations: patch.approvedRecommendations }),
        ...(patch.approvedRecommendationServiceNames !== undefined && { approvedRecommendationServiceNames: patch.approvedRecommendationServiceNames }),
        ...(patch.lineItems   !== undefined && { lineItems: (patch.lineItems as Prisma.InputJsonValue) ?? Prisma.JsonNull }),
        ...(patch.discountPercentage !== undefined && { discountPercentage: patch.discountPercentage }),
        ...(patch.discount    !== undefined && { discount: (patch.discount as Prisma.InputJsonValue) ?? Prisma.JsonNull }),
        ...(patch.budgetResult !== undefined && { budgetResult: (patch.budgetResult as Prisma.InputJsonValue) ?? Prisma.JsonNull }),
        ...(patch.proposalDocument !== undefined && { proposalDocument: (patch.proposalDocument as Prisma.InputJsonValue) ?? Prisma.JsonNull }),
        ...(patch.intakeRecord !== undefined && { intakeRecord: (patch.intakeRecord as Prisma.InputJsonValue) ?? Prisma.JsonNull }),
        ...(patch.aiAuditResult !== undefined && { aiAuditResult: (patch.aiAuditResult as Prisma.InputJsonValue) ?? Prisma.JsonNull }),
        ...(patch.preselectedAuditId !== undefined && { preselectedAuditId: patch.preselectedAuditId }),
        ...(patch.preselectedAuditType !== undefined && { preselectedAuditType: patch.preselectedAuditType }),
        ...(patch.lastSavedAt !== undefined && { lastSavedAt: patch.lastSavedAt }),
        ...(patch.sentAt      !== undefined && { sentAt: patch.sentAt }),
        ...(Object.keys(mergedExtras).length > 0 && { extraFields: mergedExtras as Prisma.InputJsonValue }),
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ record: rowToRecord(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
