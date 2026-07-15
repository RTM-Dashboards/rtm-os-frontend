// RTM OS — Collections Status API Route
//
// Persistence layer: reads/writes data/collections-status.json.
//
// Mirrors the renewal-status pattern exactly. Stores lightweight collections-
// specific state keyed by clientId so actions survive page refreshes without a
// full backend. Canonical client data stays in data/master-clients.json; only
// collections workflow state (status, notes, contact log entries, payment plan
// details, follow-up dates) is persisted here.
//
// GET  /api/collections-status        → { records: CollectionsStatusRecord[] }
// POST /api/collections-status        → body: { clientId, action, ...fields }
//                                       → { record: CollectionsStatusRecord }
//                                       (server assigns/overwrites updatedAt)
//
// Supported action values:
//   "send-reminder"     → status → "Reminder Sent"
//   "log-contact"       → status → "Contacted", appends contactLog entry
//   "payment-plan"      → status → "Payment Arrangement", sets paymentPlanDetails
//   "escalate"          → status → "Escalated"
//   "resolve"           → status → "Resolved"

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CollectionsAction =
  | "send-reminder"
  | "log-contact"
  | "payment-plan"
  | "escalate"
  | "resolve";

export type CollectionStatus =
  | "Pending"
  | "Reminder Sent"
  | "Contacted"
  | "Payment Arrangement"
  | "Escalated"
  | "Resolved";

export interface ContactLogEntry {
  timestamp: string; // ISO-8601
  note: string;
}

export interface CollectionsStatusRecord {
  clientId: string;
  collectionStatus: CollectionStatus;
  notes: string;
  contactLog: ContactLogEntry[];
  paymentPlanDetails: string;
  lastContactDate: string; // YYYY-MM-DD or ""
  nextFollowUp: string; // YYYY-MM-DD or ""
  updatedAt: string; // ISO-8601
}

interface StatusFile {
  records: CollectionsStatusRecord[];
}

// ── File path ─────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "collections-status.json");

// ── File I/O ──────────────────────────────────────────────────────────────────

function readRecords(): CollectionsStatusRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StatusFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: CollectionsStatusRecord[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

function blankRecord(clientId: string): CollectionsStatusRecord {
  return {
    clientId,
    collectionStatus: "Pending",
    notes: "",
    contactLog: [],
    paymentPlanDetails: "",
    lastContactDate: "",
    nextFollowUp: "",
    updatedAt: new Date().toISOString(),
  };
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
    action?: unknown;
    note?: unknown;
    paymentPlanDetails?: unknown;
    nextFollowUp?: unknown;
  };

  if (!payload || typeof payload.clientId !== "string") {
    return NextResponse.json(
      { error: "Body must include clientId (string)" },
      { status: 400 }
    );
  }

  const validActions: CollectionsAction[] = [
    "send-reminder",
    "log-contact",
    "payment-plan",
    "escalate",
    "resolve",
  ];

  if (
    typeof payload.action !== "string" ||
    !validActions.includes(payload.action as CollectionsAction)
  ) {
    return NextResponse.json(
      { error: `action must be one of: ${validActions.join(", ")}` },
      { status: 400 }
    );
  }

  const action = payload.action as CollectionsAction;
  const clientId = payload.clientId as string;
  const now = new Date();
  const nowIso = now.toISOString();
  const todayDate = now.toISOString().slice(0, 10);

  const records = readRecords();
  const existing = records.findIndex((r) => r.clientId === clientId);
  const base: CollectionsStatusRecord =
    existing >= 0 ? { ...records[existing] } : blankRecord(clientId);

  // Apply the action
  switch (action) {
    case "send-reminder":
      base.collectionStatus = "Reminder Sent";
      base.lastContactDate = todayDate;
      // Default next follow-up to 7 days out if not set
      if (!base.nextFollowUp) {
        const nf = new Date(now);
        nf.setDate(nf.getDate() + 7);
        base.nextFollowUp = nf.toISOString().slice(0, 10);
      }
      break;

    case "log-contact": {
      base.collectionStatus = "Contacted";
      base.lastContactDate = todayDate;
      const note =
        typeof payload.note === "string" && payload.note.trim()
          ? payload.note.trim()
          : "Contact logged.";
      base.contactLog = [
        ...(base.contactLog ?? []),
        { timestamp: nowIso, note },
      ];
      if (typeof payload.nextFollowUp === "string" && payload.nextFollowUp) {
        base.nextFollowUp = payload.nextFollowUp;
      }
      break;
    }

    case "payment-plan":
      base.collectionStatus = "Payment Arrangement";
      base.lastContactDate = todayDate;
      if (
        typeof payload.paymentPlanDetails === "string" &&
        payload.paymentPlanDetails.trim()
      ) {
        base.paymentPlanDetails = payload.paymentPlanDetails.trim();
      }
      if (typeof payload.nextFollowUp === "string" && payload.nextFollowUp) {
        base.nextFollowUp = payload.nextFollowUp;
      }
      break;

    case "escalate":
      base.collectionStatus = "Escalated";
      base.lastContactDate = todayDate;
      if (typeof payload.note === "string" && payload.note.trim()) {
        base.notes = payload.note.trim();
      }
      break;

    case "resolve":
      base.collectionStatus = "Resolved";
      base.lastContactDate = todayDate;
      if (typeof payload.note === "string" && payload.note.trim()) {
        base.notes = payload.note.trim();
      }
      break;
  }

  base.updatedAt = nowIso;

  if (existing >= 0) {
    records[existing] = base;
  } else {
    records.push(base);
  }

  try {
    writeRecords(records);
    return NextResponse.json({ record: base });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
