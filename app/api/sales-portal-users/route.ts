// RTM OS — Sales Portal Users API Route
//
// Persistence layer: reads/writes data/sales-portal-users.json (project root).
//
// Portal user records track access state (status, role, last login) for each
// affiliate partner portal user. This is access-state tracking only — not
// actual authentication.
//
// GET   /api/sales-portal-users                      → { records: PortalUserRecord[] }
// GET   /api/sales-portal-users?affiliateId=<id>     → { records: PortalUserRecord[] }
// GET   /api/sales-portal-users?id=<id>              → { record: PortalUserRecord } | 404
// POST  /api/sales-portal-users                      → body: PortalUserRecord (upsert by id)
// PATCH /api/sales-portal-users                      → body: { id, ...partialFields }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ──────────────────────────────────────────────────────────────────────

export type PortalUserStatus = "Active" | "Disabled" | "Invited" | "Pending";

export interface PortalUserRecord {
  id: string;
  affiliateId: string;
  portalUser: string;
  email: string;
  lastLogin: string;
  status: PortalUserStatus;
  role: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface PortalUsersFile {
  records: PortalUserRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "sales-portal-users.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): PortalUserRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as PortalUsersFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: PortalUserRecord[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const records = readRecords();

  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const record = records.find((r) => r.id === id);
    if (!record)
      return NextResponse.json({ error: "portal user not found" }, { status: 404 });
    return NextResponse.json({ record });
  }

  const affiliateId = req.nextUrl.searchParams.get("affiliateId");
  if (affiliateId) {
    return NextResponse.json({ records: records.filter((r) => r.affiliateId === affiliateId) });
  }

  return NextResponse.json({ records });
}

// ── POST — upsert a portal user record ────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as Partial<PortalUserRecord>;
  if (!incoming || typeof incoming.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const records = readRecords();
  const existingIdx = records.findIndex((r) => r.id === incoming.id);

  let record: PortalUserRecord;
  if (existingIdx >= 0) {
    record = { ...records[existingIdx], ...incoming, updatedAt: now };
    records[existingIdx] = record;
  } else {
    record = {
      id: incoming.id,
      affiliateId: incoming.affiliateId ?? "",
      portalUser: incoming.portalUser ?? "",
      email: incoming.email ?? "",
      lastLogin: incoming.lastLogin ?? "—",
      status: incoming.status ?? "Invited",
      role: incoming.role ?? "Affiliate Member",
      createdAt: now,
      updatedAt: now,
      ...incoming,
    };
    records.unshift(record);
  }

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — partial update ────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch = body as Partial<PortalUserRecord> & { id: string };
  if (!patch || typeof patch.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === patch.id);

  if (idx < 0) {
    return NextResponse.json(
      { error: `No record found with id: ${patch.id}` },
      { status: 404 }
    );
  }

  const merged: PortalUserRecord = {
    ...records[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  records[idx] = merged;

  try {
    writeRecords(records);
    return NextResponse.json({ record: merged });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
