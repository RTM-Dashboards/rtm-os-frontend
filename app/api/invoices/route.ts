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
// C1 — AUTHORITY RULE
// Invoice is the authoritative source for billing state. The Business fields
// invoiceStatus, paymentStatus, invoiceAmountCents, and monthlyValueCents are
// a CACHED SUMMARY of the most recent Invoice for that Business. They are
// written only by syncBusinessCachedSummary(), called after every POST and
// PATCH that touches a businessId. Nothing else may write those Business fields.
//
// C5 — ORPHAN GUARD
// POST validates that the supplied businessId exists before creating the invoice.
// No Prisma FK constraint is added (matching codebase pattern).
//
// C3-5 — SERVER-SIDE TIMESTAMPS
// sentAt is set server-side when invoiceStatus transitions to "Sent".
// paidAt is set server-side when paymentStatus transitions to "Paid".
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
import { getSessionUser, requireRole } from "@/lib/auth";

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

// ── C1: Cached-summary sync ───────────────────────────────────────────────────

/**
 * syncBusinessCachedSummary — THE ONLY place that writes Business billing fields.
 *
 * After any Invoice create or status change, call this with the businessId.
 * It finds the most recent Invoice for that business (by createdAt desc) and
 * writes invoiceStatus, paymentStatus, invoiceAmountCents, monthlyValueCents,
 * and billingStatus back to the Business row so pages that only need a quick
 * status can read from Business without joining Invoice.
 *
 * billingStatus mapping (Business vocabulary: "Pending" | "Paid" | "Overdue" |
 *   "Cleared" | "Closed"):
 *   - Invoice Paid + paymentStatus Paid  → "Paid"    (clears activation gate)
 *   - Invoice Overdue or Escalated        → "Overdue"
 *   - Invoice Cancelled                   → "Closed"
 *   - Everything else                     → "Pending"
 *   - No invoice                          → "Pending"
 *
 * Hold interaction: the Cancellations page sets billingStatus to "Pending" via
 * a direct patchBusiness() call (billing hold) and to "Closed" via Close
 * Billing. This sync will overwrite "Pending" (hold) if a subsequent invoice
 * action resolves to a different status — that is correct behaviour, because a
 * newly paid invoice supersedes the hold. "Closed" set by Close Billing will
 * be re-written to "Closed" again by Cancelled invoice, or to another value if
 * an active invoice exists, which is the correct state after a re-open.
 * There is no separate hold field on Business, so the sync cannot distinguish
 * a hold-set "Pending" from a default "Pending"; preserving it unconditionally
 * would block paid invoices from clearing the activation gate.
 *
 * If the business row does not exist (e.g. pre-linking draft invoice) the call
 * is a silent no-op — the caller already validated existence at create time.
 *
 * This is intentionally best-effort: if it fails, the Invoice record is still
 * the authoritative source and the Business cache will be updated on the next
 * successful PATCH.
 */
async function syncBusinessCachedSummary(businessId: string): Promise<void> {
  if (!businessId) return;

  // Find the most recent invoice for this business
  const latest = await prisma.invoice.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    // No invoices for this business — reset to defaults
    await prisma.business.updateMany({
      where: { id: businessId },
      data: {
        invoiceStatus:      "none",
        paymentStatus:      "none",
        invoiceAmountCents: 0,
        monthlyValueCents:  0,
        billingStatus:      "Pending",
      },
    });
    return;
  }

  // Map Invoice status vocabulary to Business cached-summary vocabulary.
  // Business uses lowercase shorthand; Invoice uses title-case display values.
  const invoiceStatusMap: Record<string, string> = {
    "Draft":          "pending",
    "Ready To Send":  "pending",
    "Sent":           "sent",
    "Viewed":         "sent",
    "Partially Paid": "paid",   // partially paid counts as in-flight
    "Paid":           "paid",
    "Overdue":        "overdue",
    "Cancelled":      "cancelled",
    "Escalated":      "overdue",
  };
  const paymentStatusMap: Record<string, string> = {
    "N/A":     "none",
    "Unpaid":  "awaiting",
    "Partial": "awaiting",
    // Write "Paid" (title-case) so the Activation gate (b.paymentStatus === "Paid")
    // passes correctly. All readers now expect this exact casing — the old
    // "confirmed" hardcode has been removed from every reader and writer.
    "Paid":    "Paid",
    "Failed":  "failed",
  };

  // Derive billingStatus for the Business from the authoritative Invoice fields.
  // Vocabulary: "Pending" | "Paid" | "Overdue" | "Cleared" | "Closed"
  // "Cleared" is only ever written by the Activation page (markCleared); this
  // sync never writes it — a paid invoice sets "Paid", not "Cleared".
  let billingStatus = "Pending";
  if (latest.invoiceStatus === "Paid" && latest.paymentStatus === "Paid") {
    billingStatus = "Paid";
  } else if (latest.invoiceStatus === "Overdue" || latest.invoiceStatus === "Escalated") {
    billingStatus = "Overdue";
  } else if (latest.invoiceStatus === "Cancelled") {
    billingStatus = "Closed";
  }

  const mappedInvoiceStatus = invoiceStatusMap[latest.invoiceStatus] ?? "pending";
  const mappedPaymentStatus = paymentStatusMap[latest.paymentStatus] ?? "none";

  await prisma.business.updateMany({
    where: { id: businessId },
    data: {
      invoiceStatus:      mappedInvoiceStatus,
      paymentStatus:      mappedPaymentStatus,
      invoiceAmountCents: latest.contractAmountCents,
      monthlyValueCents:  latest.monthlyValueCents,
      billingStatus,
    },
  });
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  // A4: require an active user of any role (Member or above).
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });
  void user; // authenticated; no minimum role check for GET

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
  // A4: require Manager or SystemAdmin.
  const { user: postUser, error: postAuthError, status: postAuthStatus } = await getSessionUser(req);
  if (postAuthError) return NextResponse.json({ error: postAuthError }, { status: postAuthStatus! });
  const postRoleGate = requireRole(postUser!, "Manager");
  if (postRoleGate) return NextResponse.json({ error: postRoleGate.error }, { status: postRoleGate.status });

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

  // C5 — ORPHAN GUARD: verify the business exists before creating an invoice.
  // Plain column, no FK constraint — matches codebase pattern.
  try {
    const business = await prisma.business.findUnique({ where: { id: record.businessId } });
    if (!business) {
      return NextResponse.json(
        { error: `Business not found: no business with id "${record.businessId}" exists. Create the business first.` },
        { status: 422 }
      );
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
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

    // C1 — sync cached summary on the Business after creating the invoice
    let syncFailed = false;
    await syncBusinessCachedSummary(record.businessId!).catch((err: unknown) => {
      // Best-effort — the invoice write has committed; log at error level so
      // drift is visible, and surface it in the response so callers can alert.
      syncFailed = true;
      console.error(
        "[invoices POST] syncBusinessCachedSummary failed — businessId:",
        record.businessId,
        "invoiceId:",
        row.id,
        "error:",
        err,
      );
    });

    return NextResponse.json(
      { invoice: rowToRecord(row), ...(syncFailed ? { syncFailed: true } : {}) },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — partial update by ?id= ───────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  // A4: require Manager or SystemAdmin.
  const { user: patchUser, error: patchAuthError, status: patchAuthStatus } = await getSessionUser(req);
  if (patchAuthError) return NextResponse.json({ error: patchAuthError }, { status: patchAuthStatus! });
  const patchRoleGate = requireRole(patchUser!, "Manager");
  if (patchRoleGate) return NextResponse.json({ error: patchRoleGate.error }, { status: patchRoleGate.status });

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
    if (patch.archived            !== undefined) data.archived            = patch.archived;
    if (patch.billingOwner        !== undefined) data.billingOwner        = patch.billingOwner;
    if (patch.dueDate             !== undefined) data.dueDate             = new Date(patch.dueDate);

    // C3-5 — invoiceStatus: set sentAt server-side when transitioning to "Sent"
    if (patch.invoiceStatus !== undefined) {
      data.invoiceStatus = patch.invoiceStatus;
      // Set sentAt when the invoice becomes Sent (and sentAt is not already set)
      if (patch.invoiceStatus === "Sent" && !existing.sentAt) {
        data.sentAt = new Date();
      }
    }

    // C3-5 — paymentStatus: set paidAt server-side when transitioning to "Paid"
    if (patch.paymentStatus !== undefined) {
      data.paymentStatus = patch.paymentStatus;
      // Set paidAt when payment is confirmed (and paidAt is not already set)
      if (patch.paymentStatus === "Paid" && !existing.paidAt) {
        data.paidAt = new Date();
      }
    }

    // Allow explicit sentAt/paidAt override if the caller supplies them
    // (but server-side auto-set above takes priority when not supplied).
    if (patch.sentAt !== undefined && data.sentAt === undefined) {
      data.sentAt = patch.sentAt ? new Date(patch.sentAt) : null;
    }
    if (patch.paidAt !== undefined && data.paidAt === undefined) {
      data.paidAt = patch.paidAt ? new Date(patch.paidAt) : null;
    }

    const row = await prisma.invoice.update({ where: { id }, data });

    // C1 — sync cached summary on the Business after status change.
    // Use the updated businessId if it was patched, else the existing one.
    const bizId = (patch.businessId !== undefined ? patch.businessId : existing.businessId) ?? "";
    let syncFailed = false;
    if (bizId) {
      await syncBusinessCachedSummary(bizId).catch((err: unknown) => {
        // Best-effort — the invoice write has committed; log at error level so
        // drift is visible, and surface it in the response so callers can alert.
        syncFailed = true;
        console.error(
          "[invoices PATCH] syncBusinessCachedSummary failed — businessId:",
          bizId,
          "invoiceId:",
          id,
          "error:",
          err,
        );
      });
    }

    return NextResponse.json({ invoice: rowToRecord(row), ...(syncFailed ? { syncFailed: true } : {}) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
