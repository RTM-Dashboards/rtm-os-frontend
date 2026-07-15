// RTM OS — Sales Referral Links API Route
//
// Persistence layer: reads/writes data/sales-referral-links.json (project root).
//
// Each record is a trackable referral URL for an affiliate partner, with
// click/lead/qualified/won/revenue metrics.
//
// GET   /api/sales-referral-links                      → { records: ReferralLinkRecord[] }
// GET   /api/sales-referral-links?affiliateId=<id>     → { records: ReferralLinkRecord[] }
// GET   /api/sales-referral-links?id=<id>              → { record: ReferralLinkRecord } | 404
// POST  /api/sales-referral-links                      → body: ReferralLinkRecord (upsert by id)
// PATCH /api/sales-referral-links                      → body: { id, ...partialFields }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ReferralLinkRecord {
  id: string;
  affiliateId: string;
  referralCode: string;
  referralUrl: string;
  createdDate: string;
  clicks: number;
  leads: number;
  qualified: number;
  won: number;
  revenue: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface ReferralLinksFile {
  records: ReferralLinkRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "sales-referral-links.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): ReferralLinkRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ReferralLinksFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: ReferralLinkRecord[]): void {
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
      return NextResponse.json({ error: "referral link not found" }, { status: 404 });
    return NextResponse.json({ record });
  }

  const affiliateId = req.nextUrl.searchParams.get("affiliateId");
  if (affiliateId) {
    return NextResponse.json({ records: records.filter((r) => r.affiliateId === affiliateId) });
  }

  return NextResponse.json({ records });
}

// ── POST — upsert a referral link record ──────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as Partial<ReferralLinkRecord>;
  if (!incoming || typeof incoming.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const records = readRecords();
  const existingIdx = records.findIndex((r) => r.id === incoming.id);

  let record: ReferralLinkRecord;
  if (existingIdx >= 0) {
    record = { ...records[existingIdx], ...incoming, updatedAt: now };
    records[existingIdx] = record;
  } else {
    record = {
      id: incoming.id,
      affiliateId: incoming.affiliateId ?? "",
      referralCode: incoming.referralCode ?? "",
      referralUrl: incoming.referralUrl ?? "",
      createdDate: incoming.createdDate ?? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      clicks: incoming.clicks ?? 0,
      leads: incoming.leads ?? 0,
      qualified: incoming.qualified ?? 0,
      won: incoming.won ?? 0,
      revenue: incoming.revenue ?? "$0",
      active: incoming.active ?? true,
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

  const patch = body as Partial<ReferralLinkRecord> & { id: string };
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

  const merged: ReferralLinkRecord = {
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
