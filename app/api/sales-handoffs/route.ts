// RTM OS — Sales Handoffs API Route
//
// Persistence layer: reads/writes data/sales-handoffs.json (project root).
//
// Replaces the unreliable in-memory lib/sales/handoff-store.ts singleton.
// All cross-route-group reads and writes go through this file-backed API so
// that (sales) and (billing) route groups always see the same live data,
// regardless of Next.js / Turbopack module-chunking.
//
// GET  /api/sales-handoffs                    → { handoffs: HandoffRecord[] }
// GET  /api/sales-handoffs?id=<id>            → { handoff: HandoffRecord } | 404
// GET  /api/sales-handoffs?contractId=<id>    → { handoff: HandoffRecord } | 404
// POST /api/sales-handoffs                    → body: HandoffRecord → { handoff }
//                                               (upsert: insert or replace by id)
// PATCH /api/sales-handoffs?id=<id>           → body: Partial<HandoffRecord>
//                                               → { handoff } | 404

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types (inline — avoid importing client-side modules in server route) ───────

interface HandoffChecklistEntry {
  id: string;
  label: string;
  status: string;
  completedAt?: string;
  completedBy?: string;
  blockedBy?: string[];
}

export interface HandoffRecord {
  id: string;
  handoffNumber: string;
  clientName: string;
  contractNumber: string;
  contractId: string;
  preparedBy: string;
  createdAt: string;
  status: string;
  checklist: HandoffChecklistEntry[];
  summaryFields: Record<string, string>;
  completionPercentage: number;
  readyToSubmit: boolean;
  submittedAt?: string;
  receivedBy?: string;
  submittedToBilling?: boolean;
  submittedToBillingAt?: string;
  processed?: boolean;
  processedAt?: string;
  processedClientId?: string;
}

interface HandoffFile {
  handoffs: HandoffRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "sales-handoffs.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readHandoffs(): HandoffRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<HandoffFile>;
    return parsed.handoffs ?? [];
  } catch {
    return [];
  }
}

function writeHandoffs(handoffs: HandoffRecord[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ handoffs }, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const handoffs = readHandoffs();

  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const handoff = handoffs.find((h) => h.id === id);
    if (!handoff) return NextResponse.json({ error: "handoff not found" }, { status: 404 });
    return NextResponse.json({ handoff });
  }

  const contractId = req.nextUrl.searchParams.get("contractId");
  if (contractId) {
    const handoff = handoffs.find((h) => h.contractId === contractId);
    if (!handoff) return NextResponse.json({ error: "handoff not found" }, { status: 404 });
    return NextResponse.json({ handoff });
  }

  return NextResponse.json({ handoffs });
}

// ── POST — upsert a handoff record ────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = body as HandoffRecord;
  if (!record?.id || typeof record.id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const handoffs = readHandoffs();
  const idx = handoffs.findIndex((h) => h.id === record.id);
  if (idx === -1) {
    handoffs.push(record);
  } else {
    handoffs[idx] = record;
  }

  try {
    writeHandoffs(handoffs);
    return NextResponse.json({ handoff: record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — partial update a handoff record ───────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch = body as Partial<HandoffRecord>;
  const handoffs = readHandoffs();
  const idx = handoffs.findIndex((h) => h.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "handoff not found" }, { status: 404 });
  }

  const updated: HandoffRecord = { ...handoffs[idx], ...patch };
  handoffs[idx] = updated;

  try {
    writeHandoffs(handoffs);
    return NextResponse.json({ handoff: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
