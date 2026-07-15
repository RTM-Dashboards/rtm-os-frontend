// RTM OS — Reports API Route
//
// Persistence: reads/writes data/reports.json
//
// Full CRUD for report records. Each record holds the unified status model
// (status, qaStatus, deptReviewStatus, amStatus, deliveryStatus) so that
// a single PATCH call to updateReportStatus(reportId, updates) drives status
// transitions consistently across all 6 in-scope reporting surfaces.
//
// GET   /api/reports                → { records: ReportRecord[] }
// POST  /api/reports                → body: ReportRecord (without reportId/timestamps)
//                                    → { record: ReportRecord }
// PATCH /api/reports                → body: { reportId: string; updates: Partial<ReportRecord> }
//                                    → { record: ReportRecord }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportRecord {
  reportId: string;
  clientId: string;
  clientName: string;
  reportName: string;
  reportType: string;
  period: string;
  ownerId: string;
  amId: string;
  dueDate: string;
  deliveryMethod: string;
  priority: "High" | "Normal" | "Low";
  // Main pipeline status
  status: string;
  // Sub-status fields
  qaStatus: string;
  deptReviewStatus: string;
  amStatus: string;
  deliveryStatus: string;
  // Generation fields
  progressPct: number;
  draftReady: boolean;
  aiStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportsFile {
  records: ReportRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "reports.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): ReportRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ReportsFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: ReportRecord[]): void {
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

  const payload = body as Partial<ReportRecord>;
  if (!payload || typeof payload.clientId !== "string" || typeof payload.reportName !== "string") {
    return NextResponse.json(
      { error: "Body must include at minimum clientId (string) and reportName (string)" },
      { status: 400 }
    );
  }

  const records = readRecords();
  const newId = `rep-${String(Date.now()).slice(-6)}`;
  const now = new Date().toISOString();

  const record: ReportRecord = {
    reportId: newId,
    clientId: payload.clientId,
    clientName: payload.clientName ?? "",
    reportName: payload.reportName,
    reportType: payload.reportType ?? "Client Report",
    period: payload.period ?? "",
    ownerId: payload.ownerId ?? "",
    amId: payload.amId ?? "",
    dueDate: payload.dueDate ?? "",
    deliveryMethod: payload.deliveryMethod ?? "Email",
    priority: payload.priority ?? "Normal",
    status: payload.status ?? "Not Started",
    qaStatus: payload.qaStatus ?? "Pending QA",
    deptReviewStatus: payload.deptReviewStatus ?? "Pending Assignment",
    amStatus: payload.amStatus ?? "Pending AM Review",
    deliveryStatus: payload.deliveryStatus ?? "Not Ready",
    progressPct: payload.progressPct ?? 0,
    draftReady: payload.draftReady ?? false,
    aiStatus: payload.aiStatus ?? "Pending",
    createdAt: now,
    updatedAt: now,
  };

  records.push(record);

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH ──────────────────────────────────────────────────────────────────────
// Shared updateReportStatus mechanism — pass any subset of ReportRecord fields.

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { reportId?: unknown; updates?: unknown };
  if (
    !payload ||
    typeof payload.reportId !== "string" ||
    !payload.updates ||
    typeof payload.updates !== "object" ||
    Array.isArray(payload.updates)
  ) {
    return NextResponse.json(
      { error: "Body must include reportId (string) and updates (object)" },
      { status: 400 }
    );
  }

  const records = readRecords();
  const idx = records.findIndex((r) => r.reportId === payload.reportId);

  if (idx < 0) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const updates = payload.updates as Partial<ReportRecord>;
  records[idx] = {
    ...records[idx],
    ...updates,
    reportId: records[idx].reportId, // never overwrite PK
    createdAt: records[idx].createdAt, // never overwrite creation time
    updatedAt: new Date().toISOString(),
  };

  try {
    writeRecords(records);
    return NextResponse.json({ record: records[idx] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
