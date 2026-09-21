// RTM OS — Invoices API Route
//
// Persistence layer: Postgres via Prisma (Invoice model).
//
// GET  /api/invoices                            → { invoices: InvoiceRecord[] }
// GET  /api/invoices?id=<id>                    → { invoice: InvoiceRecord } | 404
// GET  /api/invoices?businessId=<id>            → { invoices: InvoiceRecord[] }
// GET  /api/invoices?clientId=<id>              → { invoices: InvoiceRecord[] }
// GET  /api/invoices?invoiceStatus=<s>          → { invoices: InvoiceRecord[] }
// GET  /api/invoices?paymentStatus=<s>          → { invoices: InvoiceRecord[] }
// GET  /api/invoices?overdue=true               → { invoices: InvoiceRecord[] }
//      (overdue = dueDate < now() AND invoiceStatus IN
//       ["Sent", "Viewed", "Partially Paid", "Overdue"])
//      Excludes Draft, Ready To Send, Paid, Cancelled, Escalated.
//      paymentStatus is NOT used in this predicate (Draft invoices were
//      never sent; they cannot be overdue regardless of dueDate).
//      Filters may be combined (all active simultaneously via AND).
//
// POST /api/invoices                            → body: InvoiceRecord (id required,
//                                                 invoiceNumber ignored — server-generated)
//                                               → { invoice: InvoiceRecord }
//
// PATCH /api/invoices?id=<id>                   → body: Partial<InvoiceRecord>
//                                               → { invoice: InvoiceRecord } | 404
//
// Conventions (matching all other routes):
//   - Prisma singleton: import { prisma } from "@/lib/db/prisma"
//   - findUnique then branch to create/update — no upsert()
//   - Errors: { error: String(err) } with HTTP status
//   - No Zod. No auth checks. No new PrismaClient().
//   - invoiceNumber is ALWAYS server-generated; client-supplied value is ignored.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { allocateInvoiceNumber } from "@/lib/billing/invoice-number";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InvoiceRecord {
  id:                  string;
  invoiceNumber:       string;
  businessId:          string;
  clientId:            string;
  salesHandoffId:      string | null;
  contractAmountCents: number;
  setupFeeCents:       number;
  monthlyValueCents:   number;
  invoiceStatus:       string;
  paymentStatus:       string;
  // ISO-8601 strings on the wire; DateTime in Postgres
  dueDate:             string;
  sentAt:              string | null;
  paidAt:              string | null;
  createdAt:           string;
  updatedAt:           string;
  billingOwner:        string;
  archived:            boolean;
}

// ── DB row ↔ InvoiceRecord conversion ────────────────────────────────────────

type InvoiceRow = Prisma.InvoiceGetPayload<Record<string, never>>;

function rowToRecord(row: InvoiceRow): InvoiceRecord {
  return {
    id:                  row.id,
    invoiceNumber:       row.invoiceNumber,
    businessId:          row.businessId,
    clientId:            row.clientId,
    salesHandoffId:      row.salesHandoffId ?? null,
    contractAmountCents: row.contractAmountCents,
    setupFeeCents:       row.setupFeeCents,
    monthlyValueCents:   row.monthlyValueCents,
    invoiceStatus:       row.invoiceStatus,
    paymentStatus:       row.paymentStatus,
    dueDate:             row.dueDate.toISOString(),
    sentAt:              row.sentAt?.toISOString()    ?? null,
    paidAt:              row.paidAt?.toISOString()    ?? null,
    createdAt:           row.createdAt.toISOString(),
    updatedAt:           row.updatedAt.toISOString(),
    billingOwner:        row.billingOwner,
    archived:            row.archived,
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  if (id) {
    try {
      const row = await prisma.invoice.findUnique({ where: { id } });
      if (!row) return NextResponse.json({ error: `No invoice found with id: ${id}` }, { status: 404 });
      return NextResponse.json({ invoice: rowToRecord(row) });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // Build a combined WHERE clause from all supplied filters.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  const businessId    = searchParams.get("businessId");
  const clientId      = searchParams.get("clientId");
  const invoiceStatus = searchParams.get("invoiceStatus");
  const paymentStatus = searchParams.get("paymentStatus");
  const overdue       = searchParams.get("overdue");

  if (businessId)    where.businessId    = businessId;
  if (clientId)      where.clientId      = clientId;
  if (invoiceStatus) where.invoiceStatus = invoiceStatus;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  if (overdue === "true") {
    where.dueDate = { lt: new Date() };
    // Only invoices that were actually sent to the client can be overdue.
    // Draft and Ready To Send were never sent; Paid/Cancelled/Escalated are
    // closed. The statuses below are the only ones where an unpaid sent
    // invoice can become overdue.
    where.invoiceStatus = {
      in: ["Sent", "Viewed", "Partially Paid", "Overdue"],
    };
  }

  try {
    const rows = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ invoices: rows.map(rowToRecord) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST — create one invoice (server-generates invoiceNumber) ────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = body as Partial<InvoiceRecord>;

  if (!record?.id || typeof record.id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  if (!record.businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }
  if (!record.clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }
  if (record.contractAmountCents === undefined || record.contractAmountCents === null) {
    return NextResponse.json({ error: "contractAmountCents required" }, { status: 400 });
  }
  if (!record.dueDate) {
    return NextResponse.json({ error: "dueDate required" }, { status: 400 });
  }

  try {
    const existing = await prisma.invoice.findUnique({ where: { id: record.id } });

    if (existing) {
      return NextResponse.json(
        { error: `Invoice with id ${record.id} already exists` },
        { status: 409 }
      );
    }

    // Allocate invoiceNumber inside a transaction with a SELECT FOR UPDATE lock.
    // This guarantees no two concurrent requests generate the same number.
    const row = await prisma.$transaction(async (tx) => {
      const invoiceNumber = await allocateInvoiceNumber(tx);

      return tx.invoice.create({
        data: {
          id:                  record.id!,
          invoiceNumber,                          // server-generated; ignore any client-supplied value
          businessId:          record.businessId!,
          clientId:            record.clientId!,
          salesHandoffId:      record.salesHandoffId ?? null,
          contractAmountCents: record.contractAmountCents!,
          setupFeeCents:       record.setupFeeCents       ?? 0,
          monthlyValueCents:   record.monthlyValueCents   ?? 0,
          invoiceStatus:       record.invoiceStatus       ?? "Draft",
          paymentStatus:       record.paymentStatus       ?? "N/A",
          dueDate:             new Date(record.dueDate!),
          sentAt:              record.sentAt  ? new Date(record.sentAt)  : null,
          paidAt:              record.paidAt  ? new Date(record.paidAt)  : null,
          billingOwner:        record.billingOwner        ?? "",
          archived:            record.archived            ?? false,
        },
      });
    });

    return NextResponse.json({ invoice: rowToRecord(row) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — partial update by ?id= ───────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Query param id is required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch = body as Partial<InvoiceRecord>;

  try {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: `No invoice found with id: ${id}` }, { status: 404 });
    }

    // Build a partial update — only keys present in the patch body are written.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};

    // invoiceNumber is never patched — server-generated only.
    if (patch.businessId          !== undefined) data.businessId          = patch.businessId;
    if (patch.clientId            !== undefined) data.clientId            = patch.clientId;
    if (patch.salesHandoffId      !== undefined) data.salesHandoffId      = patch.salesHandoffId;
    if (patch.contractAmountCents !== undefined) data.contractAmountCents = patch.contractAmountCents;
    if (patch.setupFeeCents       !== undefined) data.setupFeeCents       = patch.setupFeeCents;
    if (patch.monthlyValueCents   !== undefined) data.monthlyValueCents   = patch.monthlyValueCents;
    if (patch.invoiceStatus       !== undefined) data.invoiceStatus       = patch.invoiceStatus;
    if (patch.paymentStatus       !== undefined) data.paymentStatus       = patch.paymentStatus;
    if (patch.dueDate             !== undefined) data.dueDate             = new Date(patch.dueDate);
    if (patch.sentAt              !== undefined) data.sentAt              = patch.sentAt ? new Date(patch.sentAt) : null;
    if (patch.paidAt              !== undefined) data.paidAt              = patch.paidAt ? new Date(patch.paidAt) : null;
    if (patch.billingOwner        !== undefined) data.billingOwner        = patch.billingOwner;
    if (patch.archived            !== undefined) data.archived            = patch.archived;

    const row = await prisma.invoice.update({ where: { id }, data });
    return NextResponse.json({ invoice: rowToRecord(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
