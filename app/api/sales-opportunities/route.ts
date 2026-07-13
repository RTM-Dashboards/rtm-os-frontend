// RTM OS — Sales Opportunities API Route
//
// Persistence layer: reads/writes data/sales-opportunities.json (project root).
//
// Stores OpportunityRecord objects created via the "Create Opportunity" flow
// on the Leads page. The existing 40-item MOCK_OPPORTUNITY_RECORDS array in
// the Pipeline page is NOT touched here — this file only holds NEW records
// created through the Leads → Opportunity flow so they bridge both pages
// without requiring a full data-layer unification.
//
// Follows the same file-backed API pattern as:
//   - data/dept-report-status.json
//   - data/pending-sales-tasks.json
//
// GET  /api/sales-opportunities    → { records: OpportunityRecord[] }
// POST /api/sales-opportunities    → body: OpportunityRecord
//                                    → { record: OpportunityRecord }
//                                    (dedup by id; last-write-wins on duplicate id)

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
