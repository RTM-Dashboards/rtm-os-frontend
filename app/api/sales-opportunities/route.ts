// RTM OS — Sales Opportunities API Route
//
// Persistence layer: previously data/sales-opportunities.json (fs.readFileSync/writeFileSync).
// Now backed by PostgreSQL via Prisma (Supabase in production).
//
// The external API contract is UNCHANGED — same request/response shapes.
// No frontend code needs to change.
//
// This is the single source of truth for the Pipeline page's Opportunities
// sub-tab. Records are seeded via scripts/seed-db.ts and created live through
// the Leads → "Create Opportunity" flow.
//
// GET   /api/sales-opportunities           → { records: OpportunityRecord[] }
// POST  /api/sales-opportunities           → body: OpportunityRecord
//                                            → { record: OpportunityRecord }
//                                            (upsert by id; last-write-wins)
// PATCH /api/sales-opportunities           → body: { id, ...partialFields }
//                                            → { record: OpportunityRecord }
//                                            (partial update — merges fields)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import type { Opportunity as PrismaOpportunity } from "@prisma/client";

// ── Type (mirrors OpportunityRecord in lib/sales/types.ts) ───────────────────
// Inline to keep this server-only route free of client imports.
// The [key: string]: unknown index signature matches the original and handles
// all extra fields from CreateOpportunityModal without breaking.

interface OpportunityRecord {
  id: string;
  opportunityNumber: string;
  leadId: string | null;
  clientName: string;
  businessName: string;
  tradeType: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  leadSource: string;
  assignedRep: string;
  stage: string;
  priority: string;
  estimatedMonthlyValue: number;
  expectedCloseDate: string;
  serviceInterest: string[];
  discoveryNotes: string;
  ghlContactId: string;
  ghlSynced: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended optional scalars
  industry?: string | null;
  website?: string | null;
  primaryContact?: string | null;
  email?: string | null;
  phone?: string | null;
  affiliateSource?: string | null;
  estimatedValue?: number | null;
  monthlyValue?: number | null;
  contractLength?: string | null;
  probability?: number | null;
  daysInStage?: number | null;
  nextAction?: string | null;
  closingMonth?: string | null;
  opportunityScore?: number | null;
  forecastMonth?: string | null;
  forecastQuarter?: string | null;
  activeWizardId?: string | null;
  intakeRecord?: unknown;
  // JSON sub-objects
  ghl?: unknown;
  audit?: unknown;
  proposal?: unknown;
  handoff?: unknown;
  affiliate?: unknown;
  communicationLog?: unknown;
  // JSON array fields
  followUps?: unknown;
  tasks?: unknown;
  notifications?: unknown;
  workflowEvents?: unknown;
  recentActivities?: unknown;
  notes?: unknown;
  nextSteps?: unknown;
  [key: string]: unknown;
}

// ── Json null helper ─────────────────────────────────────────────────────────
// Prisma nullable Json columns require Prisma.JsonNull (not JS null) for update.
// For creates, undefined means "use the column default" which is also acceptable.

function asJsonOrNull(val: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (val === null || val === undefined) return Prisma.JsonNull;
  return val as Prisma.InputJsonValue;
}

// ── DB → OpportunityRecord mapper ─────────────────────────────────────────────
// Maps a Prisma Opportunity row to the OpportunityRecord shape the frontend expects.
// Json columns are returned as-is (Prisma returns them as JsonValue).

function toOpportunityRecord(row: PrismaOpportunity): OpportunityRecord {
  return {
    id: row.id,
    opportunityNumber: row.opportunityNumber,
    leadId: row.leadId ?? null,
    clientName: row.clientName,
    businessName: row.businessName,
    tradeType: row.tradeType,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    leadSource: row.leadSource,
    assignedRep: row.assignedRep,
    stage: row.stage,
    priority: row.priority,
    estimatedMonthlyValue: row.estimatedMonthlyValue,
    expectedCloseDate: row.expectedCloseDate,
    serviceInterest: row.serviceInterest,
    discoveryNotes: row.discoveryNotes,
    ghlContactId: row.ghlContactId,
    ghlSynced: row.ghlSynced,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    // Optional scalars — include only when non-null
    ...(row.industry !== null ? { industry: row.industry } : {}),
    ...(row.website !== null ? { website: row.website } : {}),
    ...(row.primaryContact !== null ? { primaryContact: row.primaryContact } : {}),
    ...(row.email !== null ? { email: row.email } : {}),
    ...(row.phone !== null ? { phone: row.phone } : {}),
    ...(row.affiliateSource !== null ? { affiliateSource: row.affiliateSource } : {}),
    ...(row.estimatedValue !== null ? { estimatedValue: row.estimatedValue } : {}),
    ...(row.monthlyValue !== null ? { monthlyValue: row.monthlyValue } : {}),
    ...(row.contractLength !== null ? { contractLength: row.contractLength } : {}),
    ...(row.probability !== null ? { probability: row.probability } : {}),
    ...(row.daysInStage !== null ? { daysInStage: row.daysInStage } : {}),
    ...(row.nextAction !== null ? { nextAction: row.nextAction } : {}),
    ...(row.closingMonth !== null ? { closingMonth: row.closingMonth } : {}),
    ...(row.opportunityScore !== null ? { opportunityScore: row.opportunityScore } : {}),
    ...(row.forecastMonth !== null ? { forecastMonth: row.forecastMonth } : {}),
    ...(row.forecastQuarter !== null ? { forecastQuarter: row.forecastQuarter } : {}),
    ...(row.activeWizardId !== null ? { activeWizardId: row.activeWizardId } : {}),
    ...(row.intakeRecord !== null ? { intakeRecord: row.intakeRecord } : {}),
    // JSON sub-objects
    ...(row.ghl !== null ? { ghl: row.ghl } : {}),
    ...(row.audit !== null ? { audit: row.audit } : {}),
    ...(row.proposal !== null ? { proposal: row.proposal } : {}),
    ...(row.handoff !== null ? { handoff: row.handoff } : {}),
    ...(row.affiliate !== null ? { affiliate: row.affiliate } : {}),
    ...(row.communicationLog !== null ? { communicationLog: row.communicationLog } : { communicationLog: { opportunityId: row.id, entries: [] } }),
    // JSON array fields
    ...(row.followUps !== null ? { followUps: row.followUps } : {}),
    ...(row.tasks !== null ? { tasks: row.tasks } : {}),
    ...(row.notifications !== null ? { notifications: row.notifications } : {}),
    ...(row.workflowEvents !== null ? { workflowEvents: row.workflowEvents } : {}),
    ...(row.recentActivities !== null ? { recentActivities: row.recentActivities } : {}),
    ...(row.notes !== null ? { notes: row.notes } : {}),
    ...(row.nextSteps !== null ? { nextSteps: row.nextSteps } : {}),
  };
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await prisma.opportunity.findMany({
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
    });
    const records: OpportunityRecord[] = rows.map(toOpportunityRecord);
    return NextResponse.json({ records });
  } catch (err) {
    console.error("[sales-opportunities GET] DB error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST ───────────────────────────────────────────────────────────────────────
// Upsert by id — last write wins (supports re-creation from same lead).

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = body as OpportunityRecord;
  if (!record || typeof record.id !== "string") {
    return NextResponse.json(
      { error: "Body must be an OpportunityRecord with id (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  try {
    const row = await prisma.opportunity.upsert({
      where: { id: record.id },
      update: {
        ...buildUpdateData(record),
        updatedAt: now,
      },
      create: {
        ...buildCreateData(record, now),
      },
    });

    return NextResponse.json({ record: toOpportunityRecord(row) });
  } catch (err) {
    console.error("[sales-opportunities POST] DB error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH ──────────────────────────────────────────────────────────────────────
// Partial update: merges supplied fields onto the existing record.
// Required: body.id (string). All other fields are optional and merged.

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch = body as Partial<OpportunityRecord> & { id: string };
  if (!patch || typeof patch.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  try {
    // Verify the record exists
    const existing = await prisma.opportunity.findUnique({ where: { id: patch.id } });
    if (!existing) {
      return NextResponse.json(
        { error: `No record found with id: ${patch.id}` },
        { status: 404 }
      );
    }

    // Build partial update data from provided patch fields only
    const updateData = buildUpdateData(patch);

    const row = await prisma.opportunity.update({
      where: { id: patch.id },
      data: {
        ...updateData,
        updatedAt: now,
      },
    });

    return NextResponse.json({ record: toOpportunityRecord(row) });
  } catch (err) {
    console.error("[sales-opportunities PATCH] DB error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build the data object for a Prisma create operation.
 * Fills in defaults for all required fields.
 */
function buildCreateData(
  record: OpportunityRecord,
  now: string
): Parameters<typeof prisma.opportunity.create>[0]["data"] {
  return {
    id: record.id,
    opportunityNumber: record.opportunityNumber ?? "",
    leadId: record.leadId ?? null,
    clientName: record.clientName ?? "",
    businessName: record.businessName ?? "",
    tradeType: record.tradeType ?? "",
    contactName: record.contactName ?? "",
    contactPhone: record.contactPhone ?? "",
    contactEmail: record.contactEmail ?? "",
    leadSource: record.leadSource ?? "",
    assignedRep: record.assignedRep ?? "",
    stage: record.stage ?? "",
    priority: record.priority ?? "",
    estimatedMonthlyValue: Number(record.estimatedMonthlyValue ?? 0),
    expectedCloseDate: record.expectedCloseDate ?? "",
    serviceInterest: Array.isArray(record.serviceInterest) ? record.serviceInterest : [],
    discoveryNotes: record.discoveryNotes ?? "",
    ghlContactId: record.ghlContactId ?? "",
    ghlSynced: Boolean(record.ghlSynced ?? false),
    industry: record.industry ?? null,
    website: record.website ?? null,
    primaryContact: record.primaryContact ?? null,
    email: record.email ?? null,
    phone: record.phone ?? null,
    affiliateSource: record.affiliateSource ?? null,
    estimatedValue: record.estimatedValue !== undefined ? Number(record.estimatedValue) : null,
    monthlyValue: record.monthlyValue !== undefined ? Number(record.monthlyValue) : null,
    contractLength: record.contractLength ?? null,
    probability: record.probability !== undefined ? Number(record.probability) : null,
    daysInStage: record.daysInStage !== undefined ? Number(record.daysInStage) : null,
    nextAction: record.nextAction ?? null,
    closingMonth: record.closingMonth ?? null,
    opportunityScore: record.opportunityScore !== undefined ? Number(record.opportunityScore) : null,
    forecastMonth: record.forecastMonth ?? null,
    forecastQuarter: record.forecastQuarter ?? null,
    activeWizardId: record.activeWizardId ?? null,
    intakeRecord: asJsonOrNull(record.intakeRecord),
    ghl: asJsonOrNull(record.ghl),
    audit: asJsonOrNull(record.audit),
    proposal: asJsonOrNull(record.proposal),
    handoff: asJsonOrNull(record.handoff),
    affiliate: asJsonOrNull(record.affiliate),
    communicationLog: asJsonOrNull(record.communicationLog),
    followUps: asJsonOrNull(record.followUps),
    tasks: asJsonOrNull(record.tasks),
    notifications: asJsonOrNull(record.notifications),
    workflowEvents: asJsonOrNull(record.workflowEvents),
    recentActivities: asJsonOrNull(record.recentActivities),
    notes: asJsonOrNull(record.notes),
    nextSteps: asJsonOrNull(record.nextSteps),
    createdAt: record.createdAt ?? now,
    updatedAt: record.updatedAt ?? now,
  };
}

/**
 * Build the data object for a Prisma update/patch operation.
 * Only includes fields that are explicitly provided in the input.
 */
function buildUpdateData(
  record: Partial<OpportunityRecord>
): Parameters<typeof prisma.opportunity.update>[0]["data"] {
  const data: Record<string, unknown> = {};

  if (record.opportunityNumber !== undefined) data.opportunityNumber = record.opportunityNumber;
  if ("leadId" in record) data.leadId = record.leadId ?? null;
  if (record.clientName !== undefined) data.clientName = record.clientName;
  if (record.businessName !== undefined) data.businessName = record.businessName;
  if (record.tradeType !== undefined) data.tradeType = record.tradeType;
  if (record.contactName !== undefined) data.contactName = record.contactName;
  if (record.contactPhone !== undefined) data.contactPhone = record.contactPhone;
  if (record.contactEmail !== undefined) data.contactEmail = record.contactEmail;
  if (record.leadSource !== undefined) data.leadSource = record.leadSource;
  if (record.assignedRep !== undefined) data.assignedRep = record.assignedRep;
  if (record.stage !== undefined) data.stage = record.stage;
  if (record.priority !== undefined) data.priority = record.priority;
  if (record.estimatedMonthlyValue !== undefined) data.estimatedMonthlyValue = Number(record.estimatedMonthlyValue);
  if (record.expectedCloseDate !== undefined) data.expectedCloseDate = record.expectedCloseDate;
  if (record.serviceInterest !== undefined) data.serviceInterest = Array.isArray(record.serviceInterest) ? record.serviceInterest : [];
  if (record.discoveryNotes !== undefined) data.discoveryNotes = record.discoveryNotes;
  if (record.ghlContactId !== undefined) data.ghlContactId = record.ghlContactId;
  if (record.ghlSynced !== undefined) data.ghlSynced = Boolean(record.ghlSynced);
  if ("industry" in record) data.industry = record.industry ?? null;
  if ("website" in record) data.website = record.website ?? null;
  if ("primaryContact" in record) data.primaryContact = record.primaryContact ?? null;
  if ("email" in record) data.email = record.email ?? null;
  if ("phone" in record) data.phone = record.phone ?? null;
  if ("affiliateSource" in record) data.affiliateSource = record.affiliateSource ?? null;
  if ("estimatedValue" in record) data.estimatedValue = record.estimatedValue !== null && record.estimatedValue !== undefined ? Number(record.estimatedValue) : null;
  if ("monthlyValue" in record) data.monthlyValue = record.monthlyValue !== null && record.monthlyValue !== undefined ? Number(record.monthlyValue) : null;
  if ("contractLength" in record) data.contractLength = record.contractLength ?? null;
  if ("probability" in record) data.probability = record.probability !== null && record.probability !== undefined ? Number(record.probability) : null;
  if ("daysInStage" in record) data.daysInStage = record.daysInStage !== null && record.daysInStage !== undefined ? Number(record.daysInStage) : null;
  if ("nextAction" in record) data.nextAction = record.nextAction ?? null;
  if ("closingMonth" in record) data.closingMonth = record.closingMonth ?? null;
  if ("opportunityScore" in record) data.opportunityScore = record.opportunityScore !== null && record.opportunityScore !== undefined ? Number(record.opportunityScore) : null;
  if ("forecastMonth" in record) data.forecastMonth = record.forecastMonth ?? null;
  if ("forecastQuarter" in record) data.forecastQuarter = record.forecastQuarter ?? null;
  if ("activeWizardId" in record) data.activeWizardId = record.activeWizardId ?? null;
  if ("intakeRecord" in record) data.intakeRecord = asJsonOrNull(record.intakeRecord);
  if ("ghl" in record) data.ghl = asJsonOrNull(record.ghl);
  if ("audit" in record) data.audit = asJsonOrNull(record.audit);
  if ("proposal" in record) data.proposal = asJsonOrNull(record.proposal);
  if ("handoff" in record) data.handoff = asJsonOrNull(record.handoff);
  if ("affiliate" in record) data.affiliate = asJsonOrNull(record.affiliate);
  if ("communicationLog" in record) data.communicationLog = asJsonOrNull(record.communicationLog);
  if ("followUps" in record) data.followUps = asJsonOrNull(record.followUps);
  if ("tasks" in record) data.tasks = asJsonOrNull(record.tasks);
  if ("notifications" in record) data.notifications = asJsonOrNull(record.notifications);
  if ("workflowEvents" in record) data.workflowEvents = asJsonOrNull(record.workflowEvents);
  if ("recentActivities" in record) data.recentActivities = asJsonOrNull(record.recentActivities);
  if ("notes" in record) data.notes = asJsonOrNull(record.notes);
  if ("nextSteps" in record) data.nextSteps = asJsonOrNull(record.nextSteps);

  return data;
}
