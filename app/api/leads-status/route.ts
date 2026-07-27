// RTM OS — Leads Status API Route
//
// Persistence layer: previously data/leads-status.json (fs.readFileSync/writeFileSync).
// Now backed by PostgreSQL via Prisma (Supabase in production).
//
// The external API contract is UNCHANGED — same request/response shapes.
// No frontend code needs to change.
//
// Stores lightweight lead state overrides keyed by leadId. The canonical lead
// record lives in the leads table (/api/leads). Only user-driven mutations
// (stage, assignedRep, discoveryScheduled/Date/Notes, notes, disqualified,
// disqualifiedReason, name, businessName, industry, leadSource) and GHL sync
// state are persisted here so they survive page refreshes.
//
// GET  /api/leads-status           → { records: LeadStatusRecord[] }
// POST /api/leads-status           → body: { leadId: string; [fields] }
//                                    → { record: LeadStatusRecord }
//                                    (server assigns/overwrites updatedAt; merges fields)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { LeadStatus as PrismaLeadStatus } from "@prisma/client";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LeadStatusRecord {
  leadId: string;
  stage?: string;
  assignedRep?: string;
  discoveryScheduled?: boolean;
  discoveryDate?: string;
  discoveryNotes?: string;
  notes?: string;
  disqualified?: boolean;
  disqualifiedReason?: string;
  name?: string;
  businessName?: string;
  industry?: string;
  leadSource?: string;
  ghlContactId?: string;
  ghlSyncStatus?: string;
  ghlSyncError?: string;
  ghlLastSyncedAt?: string;
  updatedAt: string;
}

// ── DB → LeadStatusRecord mapper ──────────────────────────────────────────────
// Converts null → undefined so the API response matches the original JSON shape.

function toLeadStatusRecord(row: PrismaLeadStatus): LeadStatusRecord {
  return {
    leadId: row.leadId,
    updatedAt: row.updatedAt,
    ...(row.stage !== null ? { stage: row.stage } : {}),
    ...(row.assignedRep !== null ? { assignedRep: row.assignedRep } : {}),
    ...(row.discoveryScheduled !== null ? { discoveryScheduled: row.discoveryScheduled } : {}),
    ...(row.discoveryDate !== null ? { discoveryDate: row.discoveryDate } : {}),
    ...(row.discoveryNotes !== null ? { discoveryNotes: row.discoveryNotes } : {}),
    ...(row.notes !== null ? { notes: row.notes } : {}),
    ...(row.disqualified !== null ? { disqualified: row.disqualified } : {}),
    ...(row.disqualifiedReason !== null ? { disqualifiedReason: row.disqualifiedReason } : {}),
    ...(row.name !== null ? { name: row.name } : {}),
    ...(row.businessName !== null ? { businessName: row.businessName } : {}),
    ...(row.industry !== null ? { industry: row.industry } : {}),
    ...(row.leadSource !== null ? { leadSource: row.leadSource } : {}),
    ...(row.ghlContactId !== null ? { ghlContactId: row.ghlContactId } : {}),
    ...(row.ghlSyncStatus !== null ? { ghlSyncStatus: row.ghlSyncStatus } : {}),
    ...(row.ghlSyncError !== null ? { ghlSyncError: row.ghlSyncError } : {}),
    ...(row.ghlLastSyncedAt !== null ? { ghlLastSyncedAt: row.ghlLastSyncedAt } : {}),
  };
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await prisma.leadStatus.findMany({
      orderBy: { updatedAt: "desc" },
    });
    const records: LeadStatusRecord[] = rows.map(toLeadStatusRecord);
    return NextResponse.json({ records });
  } catch (err) {
    console.error("[leads-status GET] DB error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST ───────────────────────────────────────────────────────────────────────
// Upsert: merge incoming fields on top of existing record (if any).

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  if (!payload || typeof payload.leadId !== "string") {
    return NextResponse.json(
      { error: "Body must include leadId (string)" },
      { status: 400 }
    );
  }

  const leadId = payload.leadId as string;
  const now = new Date().toISOString();

  // Build only the fields that are explicitly provided in the payload.
  // This preserves the original merge-on-top-of-existing semantics.
  const updateData: Partial<Omit<PrismaLeadStatus, "leadId">> = {
    updatedAt: now,
    ...(typeof payload.stage              === "string"  ? { stage: payload.stage }                             : {}),
    ...(typeof payload.assignedRep        === "string"  ? { assignedRep: payload.assignedRep }                 : {}),
    ...(typeof payload.discoveryScheduled === "boolean" ? { discoveryScheduled: payload.discoveryScheduled }   : {}),
    ...(typeof payload.discoveryDate      === "string"  ? { discoveryDate: payload.discoveryDate }             : {}),
    ...(typeof payload.discoveryNotes     === "string"  ? { discoveryNotes: payload.discoveryNotes }           : {}),
    ...(typeof payload.notes              === "string"  ? { notes: payload.notes }                             : {}),
    ...(typeof payload.disqualified       === "boolean" ? { disqualified: payload.disqualified }               : {}),
    ...(typeof payload.disqualifiedReason === "string"  ? { disqualifiedReason: payload.disqualifiedReason }   : {}),
    ...(typeof payload.name              === "string"   ? { name: payload.name }                               : {}),
    ...(typeof payload.businessName      === "string"   ? { businessName: payload.businessName }               : {}),
    ...(typeof payload.industry          === "string"   ? { industry: payload.industry }                       : {}),
    ...(typeof payload.leadSource        === "string"   ? { leadSource: payload.leadSource }                   : {}),
    ...(typeof payload.ghlContactId      === "string"   ? { ghlContactId: payload.ghlContactId }               : {}),
    ...(typeof payload.ghlSyncStatus     === "string"   ? { ghlSyncStatus: payload.ghlSyncStatus }             : {}),
    ...(typeof payload.ghlSyncError      === "string"   ? { ghlSyncError: payload.ghlSyncError }               : {}),
    ...(typeof payload.ghlLastSyncedAt   === "string"   ? { ghlLastSyncedAt: payload.ghlLastSyncedAt }         : {}),
  };

  try {
    const row = await prisma.leadStatus.upsert({
      where: { leadId },
      update: updateData,
      create: {
        leadId,
        ...updateData,
      },
    });

    const record = toLeadStatusRecord(row);
    return NextResponse.json({ record });
  } catch (err) {
    console.error("[leads-status POST] DB error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
