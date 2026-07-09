// RTM OS — Master Clients API Route
//
// Persistence layer: reads/writes data/master-clients.json (project root).
//
// Replaces unreliable in-memory MASTER_CLIENTS module singleton. All cross-route-
// group reads and writes go through this single file-backed API so that
// (billing), (account-management), (shell), and every other route group always
// sees the same live data, regardless of Next.js / Turbopack module-chunking.
//
// GET  /api/master-clients                   → { clients: MasterClient[] }
// GET  /api/master-clients?id=<id>           → { client: MasterClient } | 404
// POST /api/master-clients                   → body: MasterClient  → { client }
//                                              (upsert: insert or replace by id)
// PATCH /api/master-clients?id=<id>          → body: Partial<MasterClient>
//                                              → { client } | 404

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "master-clients.json");

// ── File I/O ──────────────────────────────────────────────────────────────────

interface ClientFile {
  clients: Record<string, unknown>[];
}

function readClients(): Record<string, unknown>[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<ClientFile>;
    return parsed.clients ?? [];
  } catch {
    return [];
  }
}

function writeClients(clients: Record<string, unknown>[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ clients }, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const clients = readClients();
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const client = clients.find((c) => c.id === id);
    if (!client) return NextResponse.json({ error: "client not found" }, { status: 404 });
    return NextResponse.json({ client });
  }

  return NextResponse.json({ clients });
}

// ── POST — upsert a client record ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const clients = readClients();
  const idx = clients.findIndex((c) => c.id === body.id);
  if (idx === -1) {
    clients.push(body);
  } else {
    clients[idx] = body;
  }

  writeClients(clients);
  return NextResponse.json({ client: body });
}

// ── PATCH — partial update a client record ────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  const patch = (await req.json()) as Record<string, unknown>;
  const clients = readClients();
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "client not found" }, { status: 404 });

  // Deep merge for nested objects like activationChecklist
  const existing = clients[idx] as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...existing };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof existing[key] === "object" &&
      existing[key] !== null &&
      !Array.isArray(existing[key])
    ) {
      // Deep merge objects (e.g. activationChecklist)
      merged[key] = { ...(existing[key] as Record<string, unknown>), ...(value as Record<string, unknown>) };
    } else {
      merged[key] = value;
    }
  }

  clients[idx] = merged;
  writeClients(clients);
  return NextResponse.json({ client: merged });
}
