// RTM OS — Onboarding Records API Route
//
// Persistence layer: reads/writes data/onboarding-records.json (project root).
//
// This is the file-backed persistence layer for AM onboarding records,
// replacing the unreliable in-memory module singleton that caused cross-route-
// group desync between the AM detail view and the client-facing portal view
// (two separate Next.js route groups share this single file-backed API instead).
//
// GET  /api/onboarding-records                   → { records: AMOnboardingRecord[] }
// GET  /api/onboarding-records?id=<id>           → { record: AMOnboardingRecord } | 404
// GET  /api/onboarding-records?clientId=<cid>    → { record: AMOnboardingRecord } | 404
// POST /api/onboarding-records                   → body: AMOnboardingRecord  → { record }
//                                                  (upsert: insert or replace by id)
// PATCH /api/onboarding-records?id=<id>          → body: Partial<AMOnboardingRecord>
//                                                  → { record } | 404
// DELETE /api/onboarding-records?id=<id>         → { ok: true } | 404

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types (inline to avoid importing from a client-only store module) ─────────

export type OnboardingIntakeStatus =
  | "Draft"
  | "AM In Progress"
  | "Sent to Client"
  | "Client Responded"
  | "Ready for Kickoff"
  | "Complete";

export type FieldStatus =
  | "unset"
  | "am-filling"
  | "am-filled"
  | "pending-client"
  | "client-responded";

export interface FieldAssignment {
  fieldId: string;
  status: FieldStatus;
  value: string;
  assignedAt: string;
  sentToClientAt?: string;
  clientRespondedAt?: string;
}

export interface SalesPrefillData {
  clientName: string;
  email: string;
  industry: string;
  salesOwner: string;
  referralSource?: string;
  affiliateName?: string;
  activeServices: string[];
  monthlyValue: number;
  primaryContact?: string;
  phone?: string;
  website?: string;
  location?: string;
  businessSize?: string;
  intakeSource?: string;
  selectedGoals?: string[];
  discoveryNotes?: string;
}

export interface AMOnboardingRecord {
  id: string;
  clientId: string;
  status: OnboardingIntakeStatus;
  salesPrefill: SalesPrefillData;
  fieldAssignments: Record<string, FieldAssignment>;
  createdAt: string;
  updatedAt: string;
  projectId: string | null;
}

interface RecordFile {
  records: AMOnboardingRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "onboarding-records.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): AMOnboardingRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as RecordFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: AMOnboardingRecord[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const clientId = searchParams.get("clientId");

  const records = readRecords();

  if (id) {
    const record = records.find((r) => r.id === id);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ record });
  }

  if (clientId) {
    const record = records.find((r) => r.clientId === clientId);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ record });
  }

  return NextResponse.json({ records });
}

// ── POST (upsert by id) ────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as AMOnboardingRecord;
  if (!incoming || typeof incoming.id !== "string" || typeof incoming.clientId !== "string") {
    return NextResponse.json({ error: "Body must be an AMOnboardingRecord with id and clientId" }, { status: 400 });
  }

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === incoming.id);
  const now = new Date().toISOString();
  const record: AMOnboardingRecord = { ...incoming, updatedAt: now };

  if (idx !== -1) {
    records[idx] = record;
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

// ── PATCH (partial update by id) ───────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "?id= required for PATCH" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const patch = body as Partial<AMOnboardingRecord>;
  const record: AMOnboardingRecord = {
    ...records[idx],
    ...patch,
    id: records[idx].id,           // never overwrite id
    clientId: records[idx].clientId, // never overwrite clientId
    updatedAt: now,
  };

  records[idx] = record;

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── DELETE (remove by id) ──────────────────────────────────────────────────────

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "?id= required for DELETE" }, { status: 400 });
  }

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  records.splice(idx, 1);

  try {
    writeRecords(records);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
