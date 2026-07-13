// RTM OS — Reassignment Events API Route
//
// Persistence layer: reads/writes data/reassignment-events.json.
//
// GET  /api/reassignment-events               → { events: ReassignmentEvent[] }
// POST /api/reassignment-events               → body: ReassignmentEvent → { event }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ReassignmentEvent {
  id: string;
  clientId: string;
  clientName: string;
  from: string;
  to: string;
  date: string; // ISO timestamp
  reason: string;
  handoffNote?: string;
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "reassignment-events.json");

// ── File I/O ──────────────────────────────────────────────────────────────────

interface EventFile {
  events: ReassignmentEvent[];
}

function readEvents(): ReassignmentEvent[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<EventFile>;
    return parsed.events ?? [];
  } catch {
    return [];
  }
}

function writeEvents(events: ReassignmentEvent[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ events }, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  const events = readEvents();
  return NextResponse.json({ events });
}

// ── POST — append a new reassignment event ────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<ReassignmentEvent>;
  if (!body.clientId || !body.from || !body.to) {
    return NextResponse.json({ error: "clientId, from, and to are required" }, { status: 400 });
  }

  const event: ReassignmentEvent = {
    id: `re-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    clientId: body.clientId,
    clientName: body.clientName ?? "",
    from: body.from,
    to: body.to,
    date: body.date ?? new Date().toISOString(),
    reason: body.reason ?? "",
    handoffNote: body.handoffNote,
  };

  const events = readEvents();
  events.unshift(event); // newest first
  writeEvents(events);

  return NextResponse.json({ event }, { status: 201 });
}
