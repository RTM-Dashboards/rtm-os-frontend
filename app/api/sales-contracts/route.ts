// RTM OS — Sales Contracts API Route
//
// Persistence layer: Postgres via Prisma (Contract model).
// Replaces the file-backed data/sales-contracts.json implementation.
// data/sales-contracts.json remains on disk as a dead artifact (zero records).
//
// CONTRACT IS UNCHANGED from the file-backed version — every caller in
// lib/sales/contracts-store.ts continues to work with zero changes:
//
// GET   /api/sales-contracts                   → { records: SalesContractRecord[] }
// GET   /api/sales-contracts?id=<id>           → { record: SalesContractRecord } | 404
// GET   /api/sales-contracts?proposalId=<id>   → { record: SalesContractRecord } | 404
// POST  /api/sales-contracts                   → body: SalesContractRecord
//                                                → { record: SalesContractRecord }
//                                                (upsert by id)
// PATCH /api/sales-contracts                   → body: { id, ...partialFields }
//                                                → { record: SalesContractRecord } | 404
//
// Auth: authenticated users only (no minimum role).
//   - Creating/updating a contract is normal Sales rep work.
//   - Sales Members, Managers, and Executives all need this capability.
//   - Matches the auth posture of proposals (no gate) while still requiring
//     a real session (blocks unauthenticated writes to the DB).
//
// Contract numbering: contractNumber is DB-UNIQUE (enforced by Postgres).
//   generateContractNumber() in contracts-store.ts is deterministic from
//   proposalId, so the same proposal always produces the same contractNumber.
//   The upsert is by id; two concurrent POSTs for the same proposal produce
//   the same id+contractNumber, so the second wins via upsert (harmless).
//
// paymentTerms storage: both the display key (paymentTerm, e.g. "net-30") and
//   the typed label (paymentTerms, e.g. "Net 30") are stored. The typed column
//   matches what SalesHandoff.paymentTerms carries, making the contract the
//   authoritative source. buildContractFromProposal defaults paymentTerm to
//   "net-30"; the route derives paymentTerms from it on every write.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import type { BudgetLineItem } from "@/lib/sales/budget-engine";

// ── Types ──────────────────────────────────────────────────────────────────────

export type SalesContractStatus =
  | "draft"
  | "sent"
  | "signed"
  | "expired"
  | "cancelled";

export interface SalesContractRecord {
  /** Unique identifier — also doubles as the display contractNumber */
  id: string;
  contractNumber: string;
  /** Originating proposal id */
  proposalId: string;
  status: SalesContractStatus;
  /** Display name: may be businessName or contactName depending on what's available */
  clientName: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  assignedRep: string;
  /** Service names approved in the proposal */
  services: string[];
  /** Human-readable investment summary for ContractBuilderShell context */
  investmentSummary: string;
  /** Human-readable monthly total, e.g. "$2,400/mo" */
  monthlyValue: string;
  /** Human-readable term length, e.g. "12 months" */
  termLength: string;
  /** Payment term key, e.g. "net-30" */
  paymentTerm: string;
  /** Typed term length in months. Null for month-to-month or unknown. */
  termLengthMonths: number | null;
  /** Typed payment terms label, e.g. "Net 30". Stored; not derived at query time. */
  paymentTerms: string | null;
  /** Normalised domain (no scheme, no www, no trailing slash, lowercased). */
  domain: string | null;
  /** Raw setup fee in dollars (from budgetResult.totalSetup). Null when unknown. */
  setupFee: number | null;
  /** Total contract value in cents: (monthly * termMonths) + setup. Null when either is unknown. */
  contractAmountCents: number | null;
  /**
   * Agreed per-service line items from the originating proposal's BudgetLineItem[].
   * Empty array for contracts created from proposals without line items.
   */
  lineItems: BudgetLineItem[];
  /** ISO string or null */
  signedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Term length parser ─────────────────────────────────────────────────────────
// Derives a typed integer from the display string (e.g. "12 months" → 12).
// Returns null for "Month-to-Month" or anything without a leading integer.

function parseTermLengthMonths(termLength: string | undefined | null): number | null {
  if (!termLength || termLength === "Month-to-Month") return null;
  const match = termLength.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// ── Payment term label deriver ────────────────────────────────────────────────
// Converts the key stored in paymentTerm to the typed label stored in paymentTerms.
// Mirrors the logic used in RequestInvoiceButton to populate the handoff summaryField.

function derivePaymentTermsLabel(paymentTerm: string | undefined | null): string {
  switch (paymentTerm) {
    case "net-15":        return "Net 15";
    case "net-45":        return "Net 45";
    case "upon-receipt":  return "Due Upon Receipt";
    default:              return "Net 30"; // net-30 or any unknown key
  }
}

// ── Row → record ───────────────────────────────────────────────────────────────
// Converts a Prisma Contract row to the SalesContractRecord shape callers expect.

function rowToRecord(row: {
  id: string;
  contractNumber: string;
  proposalId: string;
  status: string;
  clientName: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  assignedRep: string;
  services: string[];
  investmentSummary: string;
  monthlyValue: string;
  termLength: string;
  paymentTerm: string;
  termLengthMonths: number | null;
  paymentTerms: string | null;
  domain: string | null;
  setupFee: number | null;
  contractAmountCents: number | null;
  lineItems: unknown;
  signedDate: string | null;
  createdAt: string;
  updatedAt: string;
}): SalesContractRecord {
  return {
    id:                  row.id,
    contractNumber:      row.contractNumber,
    proposalId:          row.proposalId,
    status:              row.status as SalesContractStatus,
    clientName:          row.clientName,
    businessName:        row.businessName,
    contactName:         row.contactName,
    contactEmail:        row.contactEmail,
    contactPhone:        row.contactPhone,
    assignedRep:         row.assignedRep,
    services:            row.services,
    investmentSummary:   row.investmentSummary,
    monthlyValue:        row.monthlyValue,
    termLength:          row.termLength,
    paymentTerm:         row.paymentTerm,
    termLengthMonths:    row.termLengthMonths,
    paymentTerms:        row.paymentTerms,
    domain:              row.domain,
    setupFee:            row.setupFee,
    contractAmountCents: row.contractAmountCents,
    lineItems:           Array.isArray(row.lineItems) ? (row.lineItems as BudgetLineItem[]) : [],
    signedDate:          row.signedDate,
    createdAt:           row.createdAt,
    updatedAt:           row.updatedAt,
  };
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });
  void user; // authenticated; no minimum role check

  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const row = await prisma.contract.findUnique({ where: { id } });
    if (!row)
      return NextResponse.json({ error: "contract not found" }, { status: 404 });
    return NextResponse.json({ record: rowToRecord(row) });
  }

  const proposalId = req.nextUrl.searchParams.get("proposalId");
  if (proposalId) {
    const row = await prisma.contract.findFirst({ where: { proposalId } });
    if (!row)
      return NextResponse.json({ error: "contract not found" }, { status: 404 });
    return NextResponse.json({ record: rowToRecord(row) });
  }

  const rows = await prisma.contract.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ records: rows.map(rowToRecord) });
}

// ── POST — upsert a contract record ───────────────────────────────────────────
// Upsert by id. On conflict (same id), replaces the record and updates updatedAt.
// paymentTerms and termLengthMonths are derived from the incoming display fields
// on every write so the typed columns are always in sync.

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });
  void user;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as Partial<SalesContractRecord>;
  if (!incoming || typeof incoming.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  // Derive typed columns from display fields (always fresh on write)
  const termLengthMonths = parseTermLengthMonths(incoming.termLength);
  const paymentTerms     = derivePaymentTermsLabel(incoming.paymentTerm);

  const data = {
    contractNumber:      incoming.contractNumber      ?? incoming.id,
    proposalId:          incoming.proposalId          ?? "",
    status:              incoming.status              ?? "draft",
    clientName:          incoming.clientName          ?? "",
    businessName:        incoming.businessName        ?? "",
    contactName:         incoming.contactName         ?? "",
    contactEmail:        incoming.contactEmail        ?? "",
    contactPhone:        incoming.contactPhone        ?? "",
    assignedRep:         incoming.assignedRep         ?? "",
    services:            incoming.services            ?? [],
    investmentSummary:   incoming.investmentSummary   ?? "",
    monthlyValue:        incoming.monthlyValue        ?? "",
    termLength:          incoming.termLength          ?? "12 months",
    paymentTerm:         incoming.paymentTerm         ?? "net-30",
    termLengthMonths,
    paymentTerms,
    domain:              incoming.domain              ?? null,
    setupFee:            incoming.setupFee            ?? null,
    contractAmountCents: incoming.contractAmountCents ?? null,
    lineItems:           (Array.isArray(incoming.lineItems) ? incoming.lineItems : []) as unknown as Prisma.InputJsonValue,
    signedDate:          incoming.signedDate          ?? null,
    updatedAt:           now,
  };

  try {
    const row = await prisma.contract.upsert({
      where:  { id: incoming.id },
      create: { id: incoming.id, createdAt: now, ...data },
      update: data,
    });
    return NextResponse.json({ record: rowToRecord(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — partial update ─────────────────────────────────────────────────────
// Merges supplied fields onto the existing record.
// Required: body.id (string).
// Re-derives termLengthMonths and paymentTerms whenever the corresponding
// display field is patched (absent = keep existing typed value).

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });
  void user;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch = body as Partial<SalesContractRecord> & { id: string };
  if (!patch || typeof patch.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const existing = await prisma.contract.findUnique({ where: { id: patch.id } });
  if (!existing) {
    return NextResponse.json(
      { error: `No record found with id: ${patch.id}` },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();

  // Only re-derive typed columns when the source display field is in the patch
  const termLengthMonths = patch.termLength !== undefined
    ? parseTermLengthMonths(patch.termLength)
    : existing.termLengthMonths;
  const paymentTerms = patch.paymentTerm !== undefined
    ? derivePaymentTermsLabel(patch.paymentTerm)
    : existing.paymentTerms;

  const updateData: Record<string, unknown> = { updatedAt: now, termLengthMonths, paymentTerms };

  // Copy every non-id patch field into the update object
  const skipKeys = new Set(["id", "createdAt", "termLengthMonths", "paymentTerms"]);
  for (const [k, v] of Object.entries(patch)) {
    if (!skipKeys.has(k) && v !== undefined) {
      updateData[k] = v;
    }
  }

  try {
    const row = await prisma.contract.update({
      where: { id: patch.id },
      data:  updateData,
    });
    return NextResponse.json({ record: rowToRecord(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
