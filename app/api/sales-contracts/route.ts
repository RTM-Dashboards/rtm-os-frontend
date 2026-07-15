// RTM OS — Sales Contracts API Route
//
// Persistence layer: reads/writes data/sales-contracts.json (project root).
//
// Each contract record is linked to the originating proposalId and carries all
// client/service/pricing data needed to populate ContractBuilderShell and the
// Request Invoice handoff flow.
//
// Follows the exact same file-backed pattern as:
//   - data/sales-proposals.json  → /api/sales-proposals
//   - data/sales-handoffs.json   → /api/sales-handoffs
//
// GET   /api/sales-contracts                   → { records: SalesContractRecord[] }
// GET   /api/sales-contracts?id=<id>           → { record: SalesContractRecord } | 404
// GET   /api/sales-contracts?proposalId=<id>   → { record: SalesContractRecord } | 404
// POST  /api/sales-contracts                   → body: SalesContractRecord
//                                                → { record: SalesContractRecord }
//                                                (upsert by id)
// PATCH /api/sales-contracts                   → body: { id, ...partialFields }
//                                                → { record: SalesContractRecord } | 404

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
  /** Originating proposal id (from data/sales-proposals.json) */
  proposalId: string;
  status: SalesContractStatus;
  /** Display name: may be businessName or contactName depending on what's available */
  clientName: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  assignedRep: string;
  /** Service names approved in the proposal, e.g. ["GBP Optimization", "Local SEO Management"] */
  services: string[];
  /** Human-readable investment summary for ContractBuilderShell context */
  investmentSummary: string;
  /** Human-readable monthly total, e.g. "$2,400/mo" */
  monthlyValue: string;
  /** Human-readable term length, e.g. "12 months" */
  termLength: string;
  /** Payment term key, e.g. "net-30" */
  paymentTerm: string;
  /** ISO string or null */
  signedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContractsFile {
  records: SalesContractRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "sales-contracts.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): SalesContractRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ContractsFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: SalesContractRecord[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const records = readRecords();

  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const record = records.find((r) => r.id === id);
    if (!record)
      return NextResponse.json({ error: "contract not found" }, { status: 404 });
    return NextResponse.json({ record });
  }

  const proposalId = req.nextUrl.searchParams.get("proposalId");
  if (proposalId) {
    const record = records.find((r) => r.proposalId === proposalId);
    if (!record)
      return NextResponse.json({ error: "contract not found" }, { status: 404 });
    return NextResponse.json({ record });
  }

  return NextResponse.json({ records });
}

// ── POST — upsert a contract record ───────────────────────────────────────────
// Upsert by id. Merges incoming data on top of existing record when present.

export async function POST(req: NextRequest): Promise<NextResponse> {
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
  const records = readRecords();
  const existingIdx = records.findIndex((r) => r.id === incoming.id);

  let record: SalesContractRecord;
  if (existingIdx >= 0) {
    record = {
      ...records[existingIdx],
      ...incoming,
      updatedAt: now,
    };
    records[existingIdx] = record;
  } else {
    record = {
      id: incoming.id,
      contractNumber: incoming.contractNumber ?? incoming.id,
      proposalId: incoming.proposalId ?? "",
      status: incoming.status ?? "draft",
      clientName: incoming.clientName ?? "",
      businessName: incoming.businessName ?? "",
      contactName: incoming.contactName ?? "",
      contactEmail: incoming.contactEmail ?? "",
      contactPhone: incoming.contactPhone ?? "",
      assignedRep: incoming.assignedRep ?? "",
      services: incoming.services ?? [],
      investmentSummary: incoming.investmentSummary ?? "",
      monthlyValue: incoming.monthlyValue ?? "",
      termLength: incoming.termLength ?? "12 months",
      paymentTerm: incoming.paymentTerm ?? "net-30",
      signedDate: incoming.signedDate ?? null,
      createdAt: now,
      updatedAt: now,
      ...incoming,
    };
    records.push(record);
  }

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — partial update ────────────────────────────────────────────────────
// Merges supplied fields onto the existing record.
// Required: body.id (string).

export async function PATCH(req: NextRequest): Promise<NextResponse> {
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

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === patch.id);

  if (idx < 0) {
    return NextResponse.json(
      { error: `No record found with id: ${patch.id}` },
      { status: 404 }
    );
  }

  const merged: SalesContractRecord = {
    ...records[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  records[idx] = merged;

  try {
    writeRecords(records);
    return NextResponse.json({ record: merged });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
