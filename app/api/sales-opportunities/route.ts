// RTM OS — Sales Opportunities API Route
//
// Persistence layer: reads/writes data/sales-opportunities.json (project root).
//
// This is the single source of truth for the Pipeline page's Opportunities
// sub-tab. Records are seeded via scripts/seed-opportunities.mjs and
// created live through the Leads → "Create Opportunity" flow.
//
// Follows the same file-backed API pattern as:
//   - data/dept-report-status.json
//   - data/pending-sales-tasks.json
//
// GET   /api/sales-opportunities           → { records: OpportunityRecord[] }
// POST  /api/sales-opportunities           → body: OpportunityRecord
//                                            → { record: OpportunityRecord }
//                                            (upsert by id; last-write-wins)
// PATCH /api/sales-opportunities           → body: { id, ...partialFields }
//                                            → { record: OpportunityRecord }
//                                            (partial update — merges fields)

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Type (mirrors OpportunityRecord in lib/sales/types.ts) ───────────────────
// Inline to keep this server-only route free of client imports.

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
  // Allow extra fields from CreateOpportunityModal without breaking
  [key: string]: unknown;
}

interface OpportunitiesFile {
  records: OpportunityRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "sales-opportunities.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): OpportunityRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as OpportunitiesFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: OpportunityRecord[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const records = readRecords();
  return NextResponse.json({ records });
}

// ── POST ───────────────────────────────────────────────────────────────────────

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

  const records = readRecords();

  // Upsert by id — last write wins (supports re-creation from same lead).
  const existingIdx = records.findIndex((r) => r.id === record.id);
  if (existingIdx >= 0) {
    records[existingIdx] = { ...records[existingIdx], ...record, updatedAt: new Date().toISOString() };
  } else {
    records.push({ ...record, createdAt: record.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() });
  }

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH ──────────────────────────────────────────────────────────────────────
// Partial update: merges supplied fields onto the existing record.
// Required: body.id (string). All other fields are optional and merged.
// Used by Pipeline page to persist stage transitions and communication log
// entries without requiring the caller to resend the full record.

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

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === patch.id);

  if (idx < 0) {
    return NextResponse.json(
      { error: `No record found with id: ${patch.id}` },
      { status: 404 }
    );
  }

  // Deep-merge communicationLog.entries if provided so the caller can pass
  // only the new entry array without losing the rest of the record.
  const existing = records[idx];
  const merged: OpportunityRecord = {
    ...existing,
    ...patch,
    // Always advance updatedAt
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
