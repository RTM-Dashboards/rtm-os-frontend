// RTM OS — Call Intelligence Notes API Route
//
// Persistence layer: reads/writes data/call-intelligence-notes.json
//
// Per-client summary notes written by reps on the Call Intelligence page.
// Keyed by clientId (slugified client name). Real data — not AI-generated.
//
// GET  /api/call-intelligence-notes?clientId=<id>
//        → { clientId, note, updatedAt } or { clientId, note: "", updatedAt: null }
//
// GET  /api/call-intelligence-notes  (no clientId)
//        → { notes: Record<string, { note: string; updatedAt: string }> }
//
// PUT  /api/call-intelligence-notes?clientId=<id>
//        body: { note: string }
//        → { clientId, note, updatedAt }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NoteEntry {
  note: string;
  updatedAt: string;
}

interface NotesStoreFile {
  notes: Record<string, NoteEntry>;
}

// ── File path ─────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "call-intelligence-notes.json");

// ── File I/O ──────────────────────────────────────────────────────────────────

function readStore(): NotesStoreFile {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<NotesStoreFile>;
    return { notes: parsed.notes ?? {} };
  } catch {
    return { notes: {} };
  }
}

function writeStore(store: NotesStoreFile): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const clientId = req.nextUrl.searchParams.get("clientId");
  const store = readStore();

  if (!clientId) {
    // Return all notes
    return NextResponse.json({ notes: store.notes });
  }

  const entry = store.notes[clientId];
  if (!entry) {
    return NextResponse.json({ clientId, note: "", updatedAt: null });
  }
  return NextResponse.json({ clientId, note: entry.note, updatedAt: entry.updatedAt });
}

// ── PUT ───────────────────────────────────────────────────────────────────────

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId query param required" }, { status: 400 });
  }

  let body: { note?: unknown };
  try {
    body = (await req.json()) as { note?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.note !== "string") {
    return NextResponse.json({ error: "note (string) required in body" }, { status: 400 });
  }

  const store = readStore();
  const updatedAt = new Date().toISOString();
  store.notes[clientId] = { note: body.note, updatedAt };
  writeStore(store);

  return NextResponse.json({ clientId, note: body.note, updatedAt });
}
