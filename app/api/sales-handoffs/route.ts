// RTM OS — Sales Handoffs API Route
//
// Persistence layer: Postgres via Prisma (SalesHandoff model).
// Replaced the file-backed data/sales-handoffs.json implementation.
// data/sales-handoffs.json remains on disk as a reference; nothing reads it.
//
// CONTRACT IS UNCHANGED from the file-backed version — every caller in
// lib/sales/sales-handoffs-api.ts continues to work with zero changes:
//
// GET  /api/sales-handoffs                    → { handoffs: HandoffRecord[] }
// GET  /api/sales-handoffs?id=<id>            → { handoff: HandoffRecord } | 404
// GET  /api/sales-handoffs?contractId=<id>    → { handoff: HandoffRecord } | 404
// POST /api/sales-handoffs                    → body: HandoffRecord → { handoff }
//                                               (upsert: insert or replace by id)
// PATCH /api/sales-handoffs?id=<id>           → body: Partial<HandoffRecord>
//                                               → { handoff } | 404
//
// Callers verified before this rewrite:
//   lib/sales/sales-handoffs-api.ts          — fetchSalesHandoffs, fetchSalesHandoff,
//                                              fetchSalesHandoffByContract, upsertSalesHandoff,
//                                              patchSalesHandoff, submitHandoffToBilling,
//                                              markHandoffProcessed
//   app/(sales)/sales/handoffs/page.tsx      — via submitHandoffToBilling()
//   app/(sales)/sales/contracts/page.tsx     — via upsertSalesHandoff()
//   app/(billing)/billing/activation/page.tsx — via fetchSalesHandoffs(), markHandoffProcessed()

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { parseBillingFields } from "@/lib/billing/handoff-summary-parser";

// ── Types (inline — matches the interface in lib/sales/handoff-engine.ts) ─────

interface HandoffChecklistEntry {
  id: string;
  label: string;
  status: string;
  completedAt?: string;
  completedBy?: string;
  blockedBy?: string[];
}

export interface HandoffRecord {
  id: string;
  handoffNumber: string;
  clientName: string;
  contractNumber: string;
  contractId: string;
  preparedBy: string;
  createdAt: string;
  status: string;
  checklist: HandoffChecklistEntry[];
  summaryFields: Record<string, string>;
  completionPercentage: number;
  readyToSubmit: boolean;
  submittedAt?: string;
  receivedBy?: string;
  submittedToBilling?: boolean;
  submittedToBillingAt?: string;
  processed?: boolean;
  processedAt?: string;
  processedClientId?: string;
  domain?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contractAmountCents?: number | null;
  // Typed billing columns returned alongside the record
  monthlyValueCents?: number | null;
  setupFeeCents?: number | null;
  paymentTerms?: string | null;
  termLengthMonths?: number | null;
}

// ── DB row ↔ HandoffRecord ─────────────────────────────────────────────────────

type HandoffRow = Prisma.SalesHandoffGetPayload<Record<string, never>>;

function rowToRecord(row: HandoffRow): HandoffRecord {
  return {
    id:                   row.id,
    handoffNumber:        row.handoffNumber,
    clientName:           row.clientName,
    contractNumber:       row.contractNumber,
    contractId:           row.contractId,
    preparedBy:           row.preparedBy,
    createdAt:            row.createdAt,
    status:               row.status,
    checklist:            row.checklist as unknown as HandoffChecklistEntry[],
    summaryFields:        row.summaryFields as Record<string, string>,
    completionPercentage: row.completionPercentage,
    readyToSubmit:        row.readyToSubmit,
    submittedAt:          row.submittedAt ?? undefined,
    receivedBy:           row.receivedBy ?? undefined,
    submittedToBilling:   row.submittedToBilling,
    submittedToBillingAt: row.submittedToBillingAt ?? undefined,
    processed:            row.processed,
    processedAt:          row.processedAt ?? undefined,
    processedClientId:    row.processedClientId ?? undefined,
    domain:               row.domain ?? null,
    contactName:          row.contactName ?? null,
    contactEmail:         row.contactEmail ?? null,
    contactPhone:         row.contactPhone ?? null,
    contractAmountCents:  row.contractAmountCents ?? null,
    monthlyValueCents:    row.monthlyValueCents ?? null,
    setupFeeCents:        row.setupFeeCents ?? null,
    paymentTerms:         row.paymentTerms ?? null,
    termLengthMonths:     row.termLengthMonths ?? null,
  };
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  if (id) {
    try {
      const row = await prisma.salesHandoff.findUnique({ where: { id } });
      if (!row) return NextResponse.json({ error: "handoff not found" }, { status: 404 });
      return NextResponse.json({ handoff: rowToRecord(row) });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  const contractId = searchParams.get("contractId");
  if (contractId) {
    try {
      const row = await prisma.salesHandoff.findFirst({ where: { contractId } });
      if (!row) return NextResponse.json({ error: "handoff not found" }, { status: 404 });
      return NextResponse.json({ handoff: rowToRecord(row) });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // List all
  try {
    const rows = await prisma.salesHandoff.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ handoffs: rows.map(rowToRecord) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST — upsert a handoff record ────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = body as HandoffRecord;
  if (!record?.id || typeof record.id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const billing = parseBillingFields(record.summaryFields);

  const data = {
    handoffNumber:        record.handoffNumber        ?? "",
    clientName:           record.clientName           ?? "",
    contractNumber:       record.contractNumber       ?? "",
    contractId:           record.contractId           ?? "",
    preparedBy:           record.preparedBy           ?? "",
    createdAt:            record.createdAt            ?? "",
    status:               record.status               ?? "not-started",
    checklist:            (record.checklist           ?? []) as unknown as Prisma.InputJsonValue,
    summaryFields:        (record.summaryFields       ?? {}) as Prisma.InputJsonValue,
    completionPercentage: record.completionPercentage ?? 0,
    readyToSubmit:        record.readyToSubmit        ?? false,
    submittedAt:          record.submittedAt          ?? null,
    receivedBy:           record.receivedBy           ?? null,
    submittedToBilling:   record.submittedToBilling   ?? false,
    submittedToBillingAt: record.submittedToBillingAt ?? null,
    processed:            record.processed            ?? false,
    processedAt:          record.processedAt          ?? null,
    processedClientId:    record.processedClientId    ?? null,
    // Typed billing columns
    monthlyValueCents:    billing.monthlyValueCents,
    setupFeeCents:        billing.setupFeeCents,
    paymentTerms:         billing.paymentTerms,
    termLengthMonths:     billing.termLengthMonths,
    // Contact and domain fields
    domain:               record.domain               ?? null,
    contactName:          record.contactName          ?? null,
    contactEmail:         record.contactEmail         ?? null,
    contactPhone:         record.contactPhone         ?? null,
    // contractAmountCents: prefer the typed field from the record (computed at creation
    // from monthly * termMonths + setup); fall back to the summaryFields parse of
    // "contract-amount" when the record doesn't carry it directly.
    contractAmountCents:  record.contractAmountCents  ?? billing.contractAmountCents ?? null,
  };

  try {
    const existing = await prisma.salesHandoff.findUnique({ where: { id: record.id } });
    let row: HandoffRow;
    if (!existing) {
      row = await prisma.salesHandoff.create({ data: { id: record.id, ...data } });
    } else {
      row = await prisma.salesHandoff.update({ where: { id: record.id }, data });
    }
    return NextResponse.json({ handoff: rowToRecord(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — partial update a handoff record ───────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch = body as Partial<HandoffRecord>;

  try {
    const existing = await prisma.salesHandoff.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "handoff not found" }, { status: 404 });
    }

    // Build a partial update — only fields present in the patch are written.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};

    if (patch.handoffNumber        !== undefined) data.handoffNumber        = patch.handoffNumber;
    if (patch.clientName           !== undefined) data.clientName           = patch.clientName;
    if (patch.contractNumber       !== undefined) data.contractNumber       = patch.contractNumber;
    if (patch.contractId           !== undefined) data.contractId           = patch.contractId;
    if (patch.preparedBy           !== undefined) data.preparedBy           = patch.preparedBy;
    if (patch.createdAt            !== undefined) data.createdAt            = patch.createdAt;
    if (patch.status               !== undefined) data.status               = patch.status;
    if (patch.checklist            !== undefined) data.checklist            = patch.checklist as unknown as Prisma.InputJsonValue;
    if (patch.completionPercentage !== undefined) data.completionPercentage = patch.completionPercentage;
    if (patch.readyToSubmit        !== undefined) data.readyToSubmit        = patch.readyToSubmit;
    if (patch.submittedAt          !== undefined) data.submittedAt          = patch.submittedAt;
    if (patch.receivedBy           !== undefined) data.receivedBy           = patch.receivedBy;
    if (patch.submittedToBilling   !== undefined) data.submittedToBilling   = patch.submittedToBilling;
    if (patch.submittedToBillingAt !== undefined) data.submittedToBillingAt = patch.submittedToBillingAt;
    if (patch.processed            !== undefined) data.processed            = patch.processed;
    if (patch.processedAt          !== undefined) data.processedAt          = patch.processedAt;
    if (patch.processedClientId    !== undefined) data.processedClientId    = patch.processedClientId;
    if (patch.domain               !== undefined) data.domain               = patch.domain;
    if (patch.contactName          !== undefined) data.contactName          = patch.contactName;
    if (patch.contactEmail         !== undefined) data.contactEmail         = patch.contactEmail;
    if (patch.contactPhone         !== undefined) data.contactPhone         = patch.contactPhone;
    if (patch.contractAmountCents  !== undefined) data.contractAmountCents  = patch.contractAmountCents;

    // When summaryFields is patched, re-parse the billing columns from the
    // merged summaryFields (existing + patch) so they stay in sync.
    if (patch.summaryFields !== undefined) {
      data.summaryFields = patch.summaryFields as Prisma.InputJsonValue;
      const mergedFields = {
        ...(existing.summaryFields as Record<string, string>),
        ...patch.summaryFields,
      };
      const billing = parseBillingFields(mergedFields);
      data.monthlyValueCents = billing.monthlyValueCents;
      data.setupFeeCents     = billing.setupFeeCents;
      data.paymentTerms      = billing.paymentTerms;
      data.termLengthMonths  = billing.termLengthMonths;
    }

    const row = await prisma.salesHandoff.update({ where: { id }, data });
    return NextResponse.json({ handoff: rowToRecord(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
