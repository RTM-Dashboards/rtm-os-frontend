// RTM OS — Expansion Opportunity Status API Route
//
// Persistence layer: reads/writes data/expansion-opportunity-status.json.
//
// Mirrors the dept-report-status pattern exactly. Stores lightweight status
// overrides keyed by opportunityId so status changes survive page refreshes
// without a full backend. The full mock opportunity data stays in
// lib/account-management/am-client-success-data.ts; only the user-driven
// status transitions and their timestamps are persisted here.
//
// GET  /api/expansion-opportunity-status    → { records: ExpansionOpportunityStatusRecord[] }
// POST /api/expansion-opportunity-status    → body: { opportunityId: string; status: string }
//                                             → { record: ExpansionOpportunityStatusRecord }
//                                             (server assigns/overwrites updatedAt)

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types (inline — server-only route) ───────────────────────────────────────

export interface ExpansionOpportunityStatusRecord {
  opportunityId: string;
  status: string;
  updatedAt: string; // ISO-8601
}

interface StatusFile {
  records: ExpansionOpportunityStatusRecord[];
}

// ── File path ─────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(
  process.cwd(),
  "data",
  "expansion-opportunity-status.json"
);

// ── File I/O ──────────────────────────────────────────────────────────────────

function readRecords(): ExpansionOpportunityStatusRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StatusFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: ExpansionOpportunityStatusRecord[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const records = readRecords();
  return NextResponse.json({ records });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { opportunityId?: unknown; status?: unknown };
  if (
    !payload ||
    typeof payload.opportunityId !== "string" ||
    typeof payload.status !== "string"
  ) {
    return NextResponse.json(
      {
        error:
          "Body must include opportunityId (string) and status (string)",
      },
      { status: 400 }
    );
  }

  const records = readRecords();

  // Upsert — one record per opportunityId.
  const existing = records.findIndex(
    (r) => r.opportunityId === payload.opportunityId
  );
  const record: ExpansionOpportunityStatusRecord = {
    opportunityId: payload.opportunityId as string,
    status: payload.status as string,
    updatedAt: new Date().toISOString(),
  };

  if (existing >= 0) {
    records[existing] = record;
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
