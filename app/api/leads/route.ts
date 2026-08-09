// RTM OS — Leads API Route
//
// Persistence layer: previously data/leads.json (fs.readFileSync/writeFileSync).
// Now backed by PostgreSQL via Prisma (Supabase in production).
//
// The external API contract is UNCHANGED — same request/response shapes.
// No frontend code needs to change.
//
// The leads-status overlay (data/leads-status.json → lead_statuses table via
// /api/leads-status) is retained unchanged for persisting field-level mutations
// driven by the UI. The two stores have distinct roles:
//   leads table        → canonical lead records (created here by webhook or
//                         manual Add Lead; never stripped away)
//   lead_statuses table → field overrides / GHL sync state written by UI
//                         actions and by /api/ghl/sync-lead
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
import { prisma } from "@/lib/db/prisma";
import type { Lead as PrismaLead } from "@prisma/client";

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
  // GHL intake metadata
  ghlOrigin?: boolean;
  ghlLastSyncedAt?: string;
  ghlSyncError?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── DB → LeadRecord mapper ────────────────────────────────────────────────────
// Converts a Prisma Lead row into the LeadRecord shape the frontend expects.
// All optional nullable fields are coerced: null → undefined (no null in API output).

function toLeadRecord(row: PrismaLead): LeadRecord {
  return {
    id: row.id,
    name: row.name,
    businessName: row.businessName,
    industry: row.industry,
    website: row.website,
    email: row.email,
    phone: row.phone,
    location: row.location,
    ghlContactId: row.ghlContactId,
    ghlAssignedUser: row.ghlAssignedUser,
    ghlSource: row.ghlSource,
    ghlCreatedDate: row.ghlCreatedDate,
    ghlLastActivityDate: row.ghlLastActivityDate,
    ghlContactTags: row.ghlContactTags,
    ghlContactStatus: row.ghlContactStatus,
    ghlSyncStatus: row.ghlSyncStatus,
    leadSource: row.leadSource,
    assignedRep: row.assignedRep,
    stage: row.stage,
    discoveryScheduled: row.discoveryScheduled,
    discoveryDate: row.discoveryDate,
    discoveryNotes: row.discoveryNotes,
    businessGoals: row.businessGoals,
    painPoints: row.painPoints,
    requestedServices: row.requestedServices,
    budget: row.budget,
    authority: row.authority,
    need: row.need,
    timeline: row.timeline,
    estimatedValue: row.estimatedValue,
    affiliateName: row.affiliateName,
    createdDate: row.createdDate,
    lastActivity: row.lastActivity,
    notes: row.notes,
    // Optional
    ...(row.disqualified ? { disqualified: row.disqualified } : {}),
    ...(row.disqualifiedReason ? { disqualifiedReason: row.disqualifiedReason } : {}),
    ...(row.ghlOrigin ? { ghlOrigin: row.ghlOrigin } : {}),
    ...(row.ghlLastSyncedAt ? { ghlLastSyncedAt: row.ghlLastSyncedAt } : {}),
    ...(row.ghlSyncError ? { ghlSyncError: row.ghlSyncError } : {}),
    ...(row.createdAt ? { createdAt: row.createdAt } : {}),
    ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}),
  };
}

// ── GET ────────────────────────────────────────────────────────────────────────
// Returns all leads ordered newest-first (by createdAt desc, id desc).

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await prisma.lead.findMany({
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
    });
    const records: LeadRecord[] = rows.map(toLeadRecord);
    return NextResponse.json({ records });
  } catch (err) {
    console.error("[leads GET] DB error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
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

  try {
    // ── Deduplication ─────────────────────────────────────────────────────────

    let existing: PrismaLead | null = null;

    // 1. By id
    if (typeof payload.id === "string" && payload.id) {
      existing = await prisma.lead.findUnique({ where: { id: payload.id } });
    }

    // 2. By real ghlContactId (skip mock/placeholder values)
    if (
      !existing &&
      typeof payload.ghlContactId === "string" &&
      payload.ghlContactId &&
      payload.ghlContactId !== "—" &&
      !payload.ghlContactId.startsWith("GHL-CON-")
    ) {
      existing = await prisma.lead.findFirst({
        where: { ghlContactId: payload.ghlContactId },
      });
    }

    // 3. By email (case-insensitive)
    if (
      !existing &&
      typeof payload.email === "string" &&
      payload.email
    ) {
      existing = await prisma.lead.findFirst({
        where: {
          email: {
            equals: payload.email,
            mode: "insensitive",
          },
        },
      });
    }

    const created = existing === null;

    let row: PrismaLead;

    if (!created && existing) {
      // UPDATE: merge new fields on top of existing record
      row = await prisma.lead.update({
        where: { id: existing.id },
        data: {
          // Merge all provided payload fields; never overwrite canonical id
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.businessName !== undefined ? { businessName: payload.businessName } : {}),
          ...(payload.industry !== undefined ? { industry: payload.industry } : {}),
          ...(payload.website !== undefined ? { website: payload.website } : {}),
          ...(payload.email !== undefined ? { email: payload.email } : {}),
          ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
          ...(payload.location !== undefined ? { location: payload.location } : {}),
          ...(payload.ghlContactId !== undefined ? { ghlContactId: payload.ghlContactId } : {}),
          ...(payload.ghlAssignedUser !== undefined ? { ghlAssignedUser: payload.ghlAssignedUser } : {}),
          ...(payload.ghlSource !== undefined ? { ghlSource: payload.ghlSource } : {}),
          ...(payload.ghlCreatedDate !== undefined ? { ghlCreatedDate: payload.ghlCreatedDate } : {}),
          ...(payload.ghlLastActivityDate !== undefined ? { ghlLastActivityDate: payload.ghlLastActivityDate } : {}),
          ...(payload.ghlContactTags !== undefined ? { ghlContactTags: payload.ghlContactTags } : {}),
          ...(payload.ghlContactStatus !== undefined ? { ghlContactStatus: payload.ghlContactStatus } : {}),
          ...(payload.ghlSyncStatus !== undefined ? { ghlSyncStatus: payload.ghlSyncStatus } : {}),
          ...(payload.ghlOrigin !== undefined ? { ghlOrigin: payload.ghlOrigin } : {}),
          ...(payload.ghlLastSyncedAt !== undefined ? { ghlLastSyncedAt: payload.ghlLastSyncedAt } : {}),
          ...(payload.ghlSyncError !== undefined ? { ghlSyncError: payload.ghlSyncError } : {}),
          ...(payload.leadSource !== undefined ? { leadSource: payload.leadSource } : {}),
          ...(payload.assignedRep !== undefined ? { assignedRep: payload.assignedRep } : {}),
          ...(payload.stage !== undefined ? { stage: payload.stage } : {}),
          ...(payload.discoveryScheduled !== undefined ? { discoveryScheduled: payload.discoveryScheduled } : {}),
          ...(payload.discoveryDate !== undefined ? { discoveryDate: payload.discoveryDate } : {}),
          ...(payload.discoveryNotes !== undefined ? { discoveryNotes: payload.discoveryNotes } : {}),
          ...(payload.businessGoals !== undefined ? { businessGoals: payload.businessGoals } : {}),
          ...(payload.painPoints !== undefined ? { painPoints: payload.painPoints } : {}),
          ...(payload.requestedServices !== undefined ? { requestedServices: payload.requestedServices } : {}),
          ...(payload.budget !== undefined ? { budget: payload.budget } : {}),
          ...(payload.authority !== undefined ? { authority: payload.authority } : {}),
          ...(payload.need !== undefined ? { need: payload.need } : {}),
          ...(payload.timeline !== undefined ? { timeline: payload.timeline } : {}),
          ...(payload.estimatedValue !== undefined ? { estimatedValue: payload.estimatedValue } : {}),
          ...(payload.affiliateName !== undefined ? { affiliateName: payload.affiliateName } : {}),
          ...(payload.createdDate !== undefined ? { createdDate: payload.createdDate } : {}),
          ...(payload.lastActivity !== undefined ? { lastActivity: payload.lastActivity } : {}),
          ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
          ...(payload.disqualified !== undefined ? { disqualified: payload.disqualified } : {}),
          ...(payload.disqualifiedReason !== undefined ? { disqualifiedReason: payload.disqualifiedReason } : {}),
          updatedAt: now,
        },
      });
    } else {
      // CREATE: fill required defaults for any missing fields
      const newId = payload.id ?? `LGHL${Date.now()}`;
      row = await prisma.lead.create({
        data: {
          id: newId,
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
          ghlOrigin: payload.ghlOrigin ?? false,
          ghlLastSyncedAt: payload.ghlLastSyncedAt ?? null,
          ghlSyncError: payload.ghlSyncError ?? null,
          leadSource: payload.leadSource ?? payload.ghlSource ?? "Direct",
          assignedRep: payload.assignedRep ?? "",
          stage: payload.stage ?? "New Lead",
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
          disqualified: payload.disqualified ?? false,
          disqualifiedReason: payload.disqualifiedReason ?? null,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    const record = toLeadRecord(row);
    return NextResponse.json({ record, created });
  } catch (err) {
    console.error("[leads POST] DB error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
