// RTM OS — Sales Affiliates API Route
//
// Persistence layer: reads/writes data/sales-affiliates.json (project root).
//
// This is the single source of truth for the Affiliates page roster.
//
// Follows the same file-backed API pattern as:
//   - data/sales-contracts.json  → /api/sales-contracts
//   - data/sales-proposals.json  → /api/sales-proposals
//
// GET   /api/sales-affiliates           → { records: AffiliateRecord[] }
// GET   /api/sales-affiliates?id=<id>   → { record: AffiliateRecord } | 404
// POST  /api/sales-affiliates           → body: AffiliateRecord (upsert by id)
//                                          → { record: AffiliateRecord }
// PATCH /api/sales-affiliates           → body: { id, ...partialFields }
//                                          → { record: AffiliateRecord }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ──────────────────────────────────────────────────────────────────────

export type AffiliateType =
  | "Client Referral"
  | "Strategic Partner"
  | "Agency Partner"
  | "Influencer"
  | "Employee"
  | "Vendor";

export type AffiliateStatus = "Active" | "Pending" | "Suspended" | "Archived";

export type PortalStatus = "Invited" | "Active" | "Disabled" | "Pending Setup";

export type CommissionModel =
  | "Flat Fee"
  | "Percentage"
  | "Tiered"
  | "Custom";

export interface AffiliateRecord {
  id: string;
  name: string;
  company: string;
  type: AffiliateType;
  status: AffiliateStatus;
  contactName: string;
  email: string;
  phone: string;
  joinDate: string;
  portalStatus: PortalStatus;
  referralCode: string;
  referralLink: string;
  assignedManager: string;
  commissionModel: CommissionModel;
  commissionRate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface AffiliatesFile {
  records: AffiliateRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "sales-affiliates.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): AffiliateRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AffiliatesFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: AffiliateRecord[]): void {
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
      return NextResponse.json({ error: "affiliate not found" }, { status: 404 });
    return NextResponse.json({ record });
  }

  return NextResponse.json({ records });
}

// ── POST — upsert an affiliate record ─────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as Partial<AffiliateRecord>;
  if (!incoming || typeof incoming.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const records = readRecords();
  const existingIdx = records.findIndex((r) => r.id === incoming.id);

  let record: AffiliateRecord;
  if (existingIdx >= 0) {
    record = { ...records[existingIdx], ...incoming, updatedAt: now };
    records[existingIdx] = record;
  } else {
    record = {
      id: incoming.id,
      name: incoming.name ?? "",
      company: incoming.company ?? incoming.name ?? "",
      type: incoming.type ?? "Client Referral",
      status: incoming.status ?? "Pending",
      contactName: incoming.contactName ?? incoming.name ?? "",
      email: incoming.email ?? "",
      phone: incoming.phone ?? "",
      joinDate: incoming.joinDate ?? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      portalStatus: incoming.portalStatus ?? "Pending Setup",
      referralCode: incoming.referralCode ?? "",
      referralLink: incoming.referralLink ?? "",
      assignedManager: incoming.assignedManager ?? "—",
      commissionModel: incoming.commissionModel ?? "Percentage",
      commissionRate: incoming.commissionRate ?? "",
      notes: incoming.notes ?? "",
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

  const patch = body as Partial<AffiliateRecord> & { id: string };
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

  const merged: AffiliateRecord = {
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
