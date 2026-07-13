// RTM OS — Department Report Status API Route
//
// Persistence layer: reads/writes data/dept-report-status.json (project root).
//
// Stores lightweight status overrides keyed by reportId. The full mock report
// content stays in lib/reporting/mock-data.ts; only the user-driven status
// transitions and their timestamps are persisted here so they survive page
// refreshes without a full backend.
//
// GET  /api/dept-report-status              → { records: DeptReportStatusRecord[] }
// POST /api/dept-report-status              → body: { reportId: string; status: string }
//                                             → { record: DeptReportStatusRecord }
//                                             (server assigns/overwrites updatedAt)

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types (inline — server-only route, do not import from client modules) ─────

export interface DeptReportStatusRecord {
  reportId: string;
  status: string;
  updatedAt: string; // ISO-8601
}

interface StatusFile {
  records: DeptReportStatusRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(
  process.cwd(),
  "data",
  "dept-report-status.json"
);

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): DeptReportStatusRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StatusFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: DeptReportStatusRecord[]): void {
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

  const payload = body as { reportId?: unknown; status?: unknown };
  if (
    !payload ||
    typeof payload.reportId !== "string" ||
    typeof payload.status !== "string"
  ) {
    return NextResponse.json(
      { error: "Body must include reportId (string) and status (string)" },
      { status: 400 }
    );
  }

  const records = readRecords();

  // Upsert — one record per reportId.
  const existing = records.findIndex((r) => r.reportId === payload.reportId);
  const record: DeptReportStatusRecord = {
    reportId: payload.reportId as string,
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
