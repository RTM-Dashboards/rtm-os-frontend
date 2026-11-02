// RTM OS — Reassignment Events API Route
//
// Persistence layer: Postgres table `reassignment_events`.
// Migrated from data/reassignment-events.json (fs.writeFileSync) which was
// silently discarded on every Vercel deploy.
//
// External shape is unchanged:
//   GET  /api/reassignment-events → { events: ReassignmentEvent[] }
//   POST /api/reassignment-events → body: ReassignmentEvent → { event } 201
//
// Auth guard: getSessionUser — matches the original file-backed route.
//
// Note: client_id is stored in the `client_id` column (snake_case in DB).
// The JSON response uses clientId (camelCase) to match the original shape.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ReassignmentEvent {
  id: string;
  clientId: string;
  clientName: string;
  from: string;
  to: string;
  date: string;
  reason: string;
  handoffNote?: string;
}

// ── DB row type ───────────────────────────────────────────────────────────────

interface EventRow {
  id: string;
  client_id: string;
  clientName: string;
  from: string;
  to: string;
  date: string;
  reason: string;
  handoffNote: string | null;
  createdAt: string;
}

function rowToEvent(row: EventRow): ReassignmentEvent {
  return {
    id:          row.id,
    clientId:    row.client_id,
    clientName:  row.clientName,
    from:        row.from,
    to:          row.to,
    date:        row.date,
    reason:      row.reason,
    handoffNote: row.handoffNote ?? undefined,
  };
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  // Newest first — matches original unshift() behaviour
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT * FROM reassignment_events ORDER BY date DESC, "createdAt" DESC`
  );
  return NextResponse.json({ events: rows.map(rowToEvent) });
}

// ── POST — append a new reassignment event ────────────────────────────────────

export async function POST(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const body = (await req.json()) as Partial<ReassignmentEvent>;
  if (!body.clientId || !body.from || !body.to) {
    return NextResponse.json({ error: "clientId, from, and to are required" }, { status: 400 });
  }

  const id   = `re-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now  = new Date().toISOString();
  const date = body.date ?? now;

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO reassignment_events
         (id, client_id, "clientName", "from", "to", date, reason, "handoffNote", "createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      id,
      body.clientId,
      body.clientName ?? "",
      body.from,
      body.to,
      date,
      body.reason ?? "",
      body.handoffNote ?? null,
      now
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("foreign key")) {
      return NextResponse.json({ error: "clientId does not reference a known business" }, { status: 400 });
    }
    throw e;
  }

  const event: ReassignmentEvent = {
    id,
    clientId:   body.clientId,
    clientName: body.clientName ?? "",
    from:       body.from,
    to:         body.to,
    date,
    reason:     body.reason ?? "",
    handoffNote: body.handoffNote,
  };

  return NextResponse.json({ event }, { status: 201 });
}
