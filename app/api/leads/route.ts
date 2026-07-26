// RTM OS — Leads API Route
//
// Persistence layer: reads/writes data/leads.json (project root).
//
// This is the canonical store for ALL lead records.  The static array that
// previously lived in the Leads page component has been migrated here so that:
//   - New leads arriving via GHL webhook (ContactCreate) can be genuinely
//     created as RTM Lead records.
//   - All existing in-page actions (Edit Lead, Assign Rep, Move Stage, etc.)
//     continue to work by merging lead-status overrides on top of these base
//     records at page load time, exactly as before.
//
// The leads-status overlay (data/leads-status.json + /api/leads-status) is
// retained unchanged for persisting field-level mutations driven by the UI.
// The two stores have distinct roles:
//   data/leads.json       → canonical lead records (created here by webhook or
//                            manual Add Lead; never stripped away)
//   data/leads-status.json → field overrides / GHL sync state written by UI
//                            actions and by /api/ghl/sync-lead
//
// GET  /api/leads           → { records: LeadRecord[] }
// POST /api/leads           → body: LeadRecord (full or partial)
//                             Creates a new record or updates existing by id.
//                             → { record: LeadRecord; created: boolean }
//
// Duplicate safety for GHL-originated leads:
//   POST checks ghlContactId first, then email as fallback.
//   If a match is found the record is UPDATED rather than duplicated.

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LeadRecord {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  ghlContactId: string;
  ghlAssignedUser: string;
  ghlSource: string;
  ghlCreatedDate: string;
  ghlLastActivityDate: string;
  ghlContactTags: string[];
  ghlContactStatus: string;
  ghlSyncStatus: string;
  leadSource: string;
  assignedRep: string;
  stage: string;
  opportunityReadiness: string;
  discoveryScheduled: boolean;
  discoveryDate: string;
  discoveryNotes: string;
  businessGoals: string[];
  painPoints: string[];
  requestedServices: string[];
  budget: string;
  authority: string;
  need: string;
  timeline: string;
  estimatedValue: number;
  affiliateName: string;
  createdDate: string;
  lastActivity: string;
  notes: string;
  // Optional fields
  disqualified?: boolean;
  disqualifiedReason?: string;
  // GHL intake metadata — set when lead originates from GHL webhook
  ghlOrigin?: boolean;        // true when created by a GHL ContactCreate webhook
  ghlLastSyncedAt?: string;   // ISO-8601 timestamp of last GHL sync
  ghlSyncError?: string;
  createdAt?: string;         // ISO-8601; set on creation
  updatedAt?: string;         // ISO-8601; set on every write
}

interface LeadsFile {
  records: LeadRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "leads.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): LeadRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as LeadsFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: LeadRecord[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const records = readRecords();
  return NextResponse.json({ records });
}

// ── POST ───────────────────────────────────────────────────────────────────────
//
// Creates or upserts a lead record.
// Deduplication order:
//   1. id — exact ID match
//   2. ghlContactId — if provided and not a placeholder ("—", "GHL-CON-*")
//   3. email — case-insensitive match (only if ghlContactId dedup did not apply)
//
// Returns { record, created: boolean }

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as Partial<LeadRecord>;
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Body must be a lead record object" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const records = readRecords();

  // ── Deduplication ────────────────────────────────────────────────────────────

  let existingIdx = -1;

  // 1. By id
  if (typeof payload.id === "string" && payload.id) {
    existingIdx = records.findIndex((r) => r.id === payload.id);
  }

  // 2. By real ghlContactId (skip mock/placeholder values)
  if (
    existingIdx === -1 &&
    typeof payload.ghlContactId === "string" &&
    payload.ghlContactId &&
    payload.ghlContactId !== "—" &&
    !payload.ghlContactId.startsWith("GHL-CON-")
  ) {
    existingIdx = records.findIndex(
      (r) =>
        r.ghlContactId === payload.ghlContactId ||
        // also check ghlContactId stored in the lead's own ghlLastSyncedAt-adjacent
        // fields (future-proofing: some records may store real ID in ghlContactId)
        false
    );
  }

  // 3. By email (case-insensitive)
  if (
    existingIdx === -1 &&
    typeof payload.email === "string" &&
    payload.email
  ) {
    const emailLower = payload.email.toLowerCase();
    existingIdx = records.findIndex(
      (r) => typeof r.email === "string" && r.email.toLowerCase() === emailLower
    );
  }

  const created = existingIdx === -1;

  let record: LeadRecord;
  if (!created && existingIdx >= 0) {
    // UPDATE: merge new fields on top of existing record
    record = {
      ...records[existingIdx],
      ...payload,
      id: records[existingIdx].id, // never overwrite the canonical id
      createdAt: records[existingIdx].createdAt ?? now,
      updatedAt: now,
    };
    records[existingIdx] = record;
  } else {
    // CREATE: fill required defaults for any missing fields
    record = {
      id: payload.id ?? `LGHL${Date.now()}`,
      name: payload.name ?? "",
      businessName: payload.businessName ?? "",
      industry: payload.industry ?? "Home Services",
      website: payload.website ?? "",
      email: payload.email ?? "",
      phone: payload.phone ?? "",
      location: payload.location ?? "",
      ghlContactId: payload.ghlContactId ?? "—",
      ghlAssignedUser: payload.ghlAssignedUser ?? "",
      ghlSource: payload.ghlSource ?? "",
      ghlCreatedDate: payload.ghlCreatedDate ?? now.split("T")[0],
      ghlLastActivityDate: payload.ghlLastActivityDate ?? now.split("T")[0],
      ghlContactTags: payload.ghlContactTags ?? [],
      ghlContactStatus: payload.ghlContactStatus ?? "New",
      ghlSyncStatus: payload.ghlSyncStatus ?? "Pending Sync",
      leadSource: payload.leadSource ?? payload.ghlSource ?? "Direct",
      assignedRep: payload.assignedRep ?? "",
      stage: payload.stage ?? "New Lead",
      opportunityReadiness: payload.opportunityReadiness ?? "Not Ready",
      discoveryScheduled: payload.discoveryScheduled ?? false,
      discoveryDate: payload.discoveryDate ?? "",
      discoveryNotes: payload.discoveryNotes ?? "",
      businessGoals: payload.businessGoals ?? [],
      painPoints: payload.painPoints ?? [],
      requestedServices: payload.requestedServices ?? [],
      budget: payload.budget ?? "Unknown",
      authority: payload.authority ?? "Unknown",
      need: payload.need ?? "Low",
      timeline: payload.timeline ?? "6+ months",
      estimatedValue: payload.estimatedValue ?? 0,
      affiliateName: payload.affiliateName ?? "—",
      createdDate: payload.createdDate ?? now.split("T")[0],
      lastActivity: payload.lastActivity ?? "Just now",
      notes: payload.notes ?? "",
      ...(payload.disqualified !== undefined ? { disqualified: payload.disqualified } : {}),
      ...(payload.disqualifiedReason ? { disqualifiedReason: payload.disqualifiedReason } : {}),
      ...(payload.ghlOrigin ? { ghlOrigin: payload.ghlOrigin } : {}),
      ...(payload.ghlLastSyncedAt ? { ghlLastSyncedAt: payload.ghlLastSyncedAt } : {}),
      ...(payload.ghlSyncError ? { ghlSyncError: payload.ghlSyncError } : {}),
      createdAt: now,
      updatedAt: now,
    };
    records.unshift(record); // newest first
  }

  try {
    writeRecords(records);
    return NextResponse.json({ record, created });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
