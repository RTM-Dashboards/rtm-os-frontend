// RTM OS — Renewal Status API Route
//
// Persistence layer: reads/writes data/renewal-status.json.
//
// Mirrors the expansion-opportunity-status pattern exactly. Stores lightweight
// renewal-decision overrides keyed by clientId so decisions survive page
// refreshes without a full backend. The canonical client data stays in
// lib/mock/master-clients.ts; only the AM-driven decision, notes, and
// timestamps are persisted here.
//
// GET  /api/renewal-status    → { records: RenewalStatusRecord[] }
// POST /api/renewal-status    → body: { clientId: string; decision: string; notes?: string }
//                               → { record: RenewalStatusRecord }
//                               (server assigns/overwrites updatedAt)

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types (inline — server-only route) ───────────────────────────────────────

export type RenewalDecision =
  | "Pending"
  | "Renew"
  | "Renew with Changes"
  | "Decline";

export interface RenewalStatusRecord {
  clientId: string;
  decision: RenewalDecision;
  notes: string;
  updatedAt: string; // ISO-8601
}

interface StatusFile {
  records: RenewalStatusRecord[];
}

// ── File path ─────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "renewal-status.json");

// ── File I/O ──────────────────────────────────────────────────────────────────

function readRecords(): RenewalStatusRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StatusFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: RenewalStatusRecord[]): void {
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

  const payload = body as {
    clientId?: unknown;
    decision?: unknown;
    notes?: unknown;
  };

  if (
    !payload ||
    typeof payload.clientId !== "string" ||
    typeof payload.decision !== "string"
  ) {
    return NextResponse.json(
      { error: "Body must include clientId (string) and decision (string)" },
      { status: 400 }
    );
  }

  const validDecisions: RenewalDecision[] = [
    "Pending",
    "Renew",
    "Renew with Changes",
    "Decline",
  ];
  if (!validDecisions.includes(payload.decision as RenewalDecision)) {
    return NextResponse.json(
      {
        error: `decision must be one of: ${validDecisions.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const records = readRecords();

  const record: RenewalStatusRecord = {
    clientId: payload.clientId as string,
    decision: payload.decision as RenewalDecision,
    notes: typeof payload.notes === "string" ? payload.notes : "",
    updatedAt: new Date().toISOString(),
  };

  // Upsert — one record per clientId.
  const existing = records.findIndex((r) => r.clientId === record.clientId);
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
