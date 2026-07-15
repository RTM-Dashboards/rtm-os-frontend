// RTM OS — Sales Proposals API Route
//
// Persistence layer: reads/writes data/sales-proposals.json (project root).
//
// Stores proposal wizard state + completed/sent proposals in a single store.
// Records are identified by id (== wizardId). Status field distinguishes
// drafts from sent/accepted/rejected proposals.
//
// Follows the exact same file-backed pattern as:
//   - data/sales-opportunities.json
//   - data/leads-status.json
//   - data/dept-report-status.json
//
// GET   /api/sales-proposals           → { records: SalesProposalRecord[] }
// POST  /api/sales-proposals           → body: SalesProposalRecord
//                                        → { record: SalesProposalRecord }
//                                        (upsert by id; merges on top of existing)
// PATCH /api/sales-proposals           → body: { id, ...partialFields }
//                                        → { record: SalesProposalRecord }
//                                        (partial update — merges supplied fields)

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

interface ProposalsFile {
  records: SalesProposalRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "sales-proposals.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): SalesProposalRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ProposalsFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: SalesProposalRecord[]): void {
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
  const records = readRecords();
  const existingIdx = records.findIndex((r) => r.id === incoming.id);

  let record: SalesProposalRecord;
  if (existingIdx >= 0) {
    record = {
      ...records[existingIdx],
      ...incoming,
      updatedAt: now,
    };
    records[existingIdx] = record;
  } else {
    record = {
      // Safe defaults for fields that may not be present in early draft saves
      id: incoming.id,  // already validated as string above
      status: "draft",
      opportunityId: null,
      leadId: null,
      currentStep: 1,
      completedSteps: [],
      clientInfo: {
        name: "",
        businessName: "",
        industry: "",
        location: "",
        website: "",
        leadSource: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        notes: "",
      },
      selectedGoals: [],
      auditMode: null,
      selectedAuditId: null,
      auditResult: null,
      approvedRecommendations: [],
      approvedRecommendationServiceNames: [],
      lineItems: [],
      discountPercentage: 0,
      discount: { type: "none", value: 0, label: "", authorizationNote: "" },
      budgetResult: null,
      proposalDocument: null,
      intakeRecord: null,
      aiAuditResult: null,
      preselectedAuditId: null,
      preselectedAuditType: null,
      lastSavedAt: null,
      sentAt: null,
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

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === patch.id);

  if (idx < 0) {
    return NextResponse.json(
      { error: `No record found with id: ${patch.id}` },
      { status: 404 }
    );
  }

  const merged: SalesProposalRecord = {
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
