// RTM OS — Sales Referrals API Route
//
// Persistence layer: reads/writes data/sales-referrals.json (project root).
//
// Referral records are standalone tracked submissions from affiliates.
// Each record links back to an affiliateId (from sales-affiliates.json) and
// optionally to an opportunityId (from sales-opportunities.json) when the
// referral progressed to a formal opportunity.
//
// GET   /api/sales-referrals                      → { records: ReferralRecord[] }
// GET   /api/sales-referrals?affiliateId=<id>     → { records: ReferralRecord[] }
// GET   /api/sales-referrals?id=<id>              → { record: ReferralRecord } | 404
// POST  /api/sales-referrals                      → body: ReferralRecord (upsert by id)
// PATCH /api/sales-referrals                      → body: { id, ...partialFields }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ReferralPipelineStage =
  | "Lead"
  | "Qualified"
  | "Audit"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Lost";

export interface ReferralRecord {
  id: string;
  affiliateId: string;
  affiliateName: string;
  referralCode: string;
  referral: string;
  submissionDate: string;
  status: ReferralPipelineStage;
  assignedRep: string;
  pipelineStage: ReferralPipelineStage;
  dealValue: string;
  commission: string;
  /** null when no formal opportunity created yet */
  opportunityId: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface ReferralsFile {
  records: ReferralRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "sales-referrals.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): ReferralRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ReferralsFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: ReferralRecord[]): void {
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
      return NextResponse.json({ error: "referral not found" }, { status: 404 });
    return NextResponse.json({ record });
  }

  const affiliateId = req.nextUrl.searchParams.get("affiliateId");
  if (affiliateId) {
    return NextResponse.json({ records: records.filter((r) => r.affiliateId === affiliateId) });
  }

  return NextResponse.json({ records });
}

// ── POST — upsert a referral record ───────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as Partial<ReferralRecord>;
  if (!incoming || typeof incoming.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const records = readRecords();
  const existingIdx = records.findIndex((r) => r.id === incoming.id);

  let record: ReferralRecord;
  if (existingIdx >= 0) {
    record = { ...records[existingIdx], ...incoming, updatedAt: now };
    records[existingIdx] = record;
  } else {
    record = {
      id: incoming.id,
      affiliateId: incoming.affiliateId ?? "",
      affiliateName: incoming.affiliateName ?? "",
      referralCode: incoming.referralCode ?? "",
      referral: incoming.referral ?? "",
      submissionDate: incoming.submissionDate ?? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: incoming.status ?? "Lead",
      assignedRep: incoming.assignedRep ?? "—",
      pipelineStage: incoming.pipelineStage ?? "Lead",
      dealValue: incoming.dealValue ?? "TBD",
      commission: incoming.commission ?? "TBD",
      opportunityId: incoming.opportunityId ?? null,
      createdAt: now,
      updatedAt: now,
      ...incoming,
    };
    records.unshift(record);
  }

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — partial update ────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch = body as Partial<ReferralRecord> & { id: string };
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

  const merged: ReferralRecord = {
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
