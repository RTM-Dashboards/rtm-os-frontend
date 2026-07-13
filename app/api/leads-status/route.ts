// RTM OS — Leads Status API Route
//
// Persistence layer: reads/writes data/leads-status.json (project root).
//
// Stores lightweight lead state overrides keyed by leadId. The full 30-lead
// mock array stays in the Leads page component; only user-driven mutations
// (stage, assignedRep, discoveryScheduled/Date/Notes, notes, disqualified,
// disqualifiedReason, name, businessName, industry, leadSource) are persisted
// here so they survive page refreshes without a full backend.
//
// Follows the exact same upsert-by-id pattern as:
//   - data/dept-report-status.json  (dept report status overrides)
//   - data/expansion-opportunity-status.json  (expansion opp status overrides)
//
// GET  /api/leads-status           → { records: LeadStatusRecord[] }
// POST /api/leads-status           → body: { leadId: string; [fields] }
//                                    → { record: LeadStatusRecord }
//                                    (server assigns/overwrites updatedAt; merges fields)

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LeadStatusRecord {
  leadId: string;
  // Overridable fields — all optional; only set fields are merged into the lead.
  stage?: string;
  assignedRep?: string;
  discoveryScheduled?: boolean;
  discoveryDate?: string;
  discoveryNotes?: string;
  notes?: string;          // single free-text note field (appended in client)
  disqualified?: boolean;
  disqualifiedReason?: string;
  // Editable core fields
  name?: string;
  businessName?: string;
  industry?: string;
  leadSource?: string;
  // Audit trail
  updatedAt: string;       // ISO-8601, server-assigned
}

interface StatusFile {
  records: LeadStatusRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "leads-status.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): LeadStatusRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StatusFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: LeadStatusRecord[]): void {
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

  const payload = body as Record<string, unknown>;
  if (!payload || typeof payload.leadId !== "string") {
    return NextResponse.json(
      { error: "Body must include leadId (string)" },
      { status: 400 }
    );
  }

  const records = readRecords();

  // Upsert: merge incoming fields on top of existing record (if any).
  const existingIdx = records.findIndex((r) => r.leadId === payload.leadId);
  const existing = existingIdx >= 0 ? records[existingIdx] : { leadId: payload.leadId as string, updatedAt: "" };

  const record: LeadStatusRecord = {
    ...existing,
    ...(typeof payload.stage              === "string"  ? { stage: payload.stage }                             : {}),
    ...(typeof payload.assignedRep        === "string"  ? { assignedRep: payload.assignedRep }                 : {}),
    ...(typeof payload.discoveryScheduled === "boolean" ? { discoveryScheduled: payload.discoveryScheduled }   : {}),
    ...(typeof payload.discoveryDate      === "string"  ? { discoveryDate: payload.discoveryDate }             : {}),
    ...(typeof payload.discoveryNotes     === "string"  ? { discoveryNotes: payload.discoveryNotes }           : {}),
    ...(typeof payload.notes              === "string"  ? { notes: payload.notes }                             : {}),
    ...(typeof payload.disqualified       === "boolean" ? { disqualified: payload.disqualified }               : {}),
    ...(typeof payload.disqualifiedReason === "string"  ? { disqualifiedReason: payload.disqualifiedReason }   : {}),
    ...(typeof payload.name              === "string"   ? { name: payload.name }                               : {}),
    ...(typeof payload.businessName      === "string"   ? { businessName: payload.businessName }               : {}),
    ...(typeof payload.industry          === "string"   ? { industry: payload.industry }                       : {}),
    ...(typeof payload.leadSource        === "string"   ? { leadSource: payload.leadSource }                   : {}),
    leadId: payload.leadId as string,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    records[existingIdx] = record;
  } else {
    records.push(record);
  }

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
