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
//
// DUAL-WRITE
// ----------
// The POST handler writes the eleven user-driven fields to BOTH lead_statuses
// and leads so that /api/leads consumers (e.g. the Sales Dashboard) always see
// current values without needing a separate overlay fetch.
//
// The four GHL sync fields (ghlContactId, ghlSyncStatus, ghlSyncError,
// ghlLastSyncedAt) are intentionally NOT dual-written. Here is why:
//
//   leads.ghlContactId        — set at webhook ingest; the original GHL ID from
//                               the moment the contact first arrived in RTM.
//   lead_statuses.ghlContactId — set by /api/ghl/sync-lead after a full
//                               round-trip sync; may differ if GHL merged or
//                               updated the contact after initial creation.
//
//   The UI reads:  lead.ghlContactIdReal ?? lead.ghlContactId
//   where ghlContactIdReal comes from the overlay and ghlContactId from the
//   leads row.  The leads row is a deliberate fallback for contacts that have
//   not yet been synced.  Dual-writing would collapse that distinction and
//   destroy the fallback, making it impossible to distinguish "not yet synced"
//   from "synced and the ID is unchanged".
//
//   The same reasoning applies to ghlSyncStatus / ghlSyncError / ghlLastSyncedAt:
//   the overlay holds UI-sync state; the leads row holds webhook-ingest state.
//   They are different facts and must remain separate.
//
// TRANSACTION DECISION
// --------------------
// The two writes (leadStatus upsert + lead updateMany) are NOT wrapped in a
// Prisma transaction.  Rationale:
//
//   1. The overlay (lead_statuses) is the authoritative source for UI-driven
//      changes.  If the leads mirror write fails, the overlay is still correct
//      and applyOverride on the Leads page will surface the right value; no
//      data is lost.
//
//   2. A transaction would cause the entire request to fail — and return a 500
//      to the user — if the leads row is transiently unavailable or missing.
//      That is a worse outcome than a temporarily stale mirror.
//
//   3. The leads row does not exist for some valid overlay states (the overlay
//      has no FK constraint).  updateMany handles that as zero affected rows;
//      a transaction wrapping update would throw P2025 instead.
//
//   The explicit contract: if the leads mirror write fails, the overlay write
//   has already succeeded.  The failure is logged so it is never silent.  The
//   next successful write (or the Phase C backfill) will bring the mirror back
//   into sync.

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
// Then mirror the same eleven user-driven fields to the leads row (dual-write).

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
  // IMPORTANT: absent field !== empty value. Never treat a missing key as a
  // blank — this codebase has already had a data-loss incident from that
  // mistake. The typeof guards here are the enforcement mechanism.
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
    // GHL sync fields — overlay-only, not dual-written. See file header for full
    // reasoning. Short version: ghlContactId in leads is the webhook-ingest value
    // (a deliberate fallback); in lead_statuses it is the post-sync confirmed value.
    // Dual-writing would collapse that distinction and destroy the fallback.
    ...(typeof payload.ghlContactId      === "string"   ? { ghlContactId: payload.ghlContactId }               : {}),
    ...(typeof payload.ghlSyncStatus     === "string"   ? { ghlSyncStatus: payload.ghlSyncStatus }             : {}),
    ...(typeof payload.ghlSyncError      === "string"   ? { ghlSyncError: payload.ghlSyncError }               : {}),
    ...(typeof payload.ghlLastSyncedAt   === "string"   ? { ghlLastSyncedAt: payload.ghlLastSyncedAt }         : {}),
  };

  // ── Overlay write (primary) ────────────────────────────────────────────────
  let row: PrismaLeadStatus;
  try {
    row = await prisma.leadStatus.upsert({
      where: { leadId },
      update: updateData,
      create: {
        leadId,
        ...updateData,
      },
    });
  } catch (err) {
    console.error("[leads-status POST] DB error on overlay write:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  // ── Leads mirror write (dual-write) ───────────────────────────────────────
  // Mirrors only the eleven user-driven fields to the leads row so that
  // /api/leads consumers see current values without an overlay fetch.
  //
  // Uses updateMany so a missing leads row (zero affected rows) is silent.
  // The overlay write above has already succeeded at this point, so the
  // response to the client is not affected by the mirror outcome.
  //
  // GHL sync fields are intentionally excluded. See file header.
  const leadsData: Record<string, unknown> = { updatedAt: now };
  if (typeof payload.stage              === "string")  leadsData.stage              = payload.stage;
  if (typeof payload.assignedRep        === "string")  leadsData.assignedRep        = payload.assignedRep;
  if (typeof payload.discoveryScheduled === "boolean") leadsData.discoveryScheduled = payload.discoveryScheduled;
  if (typeof payload.discoveryDate      === "string")  leadsData.discoveryDate      = payload.discoveryDate;
  if (typeof payload.discoveryNotes     === "string")  leadsData.discoveryNotes     = payload.discoveryNotes;
  if (typeof payload.notes              === "string")  leadsData.notes              = payload.notes;
  if (typeof payload.disqualified       === "boolean") leadsData.disqualified       = payload.disqualified;
  if (typeof payload.disqualifiedReason === "string")  leadsData.disqualifiedReason = payload.disqualifiedReason;
  if (typeof payload.name               === "string")  leadsData.name               = payload.name;
  if (typeof payload.businessName       === "string")  leadsData.businessName       = payload.businessName;
  if (typeof payload.industry           === "string")  leadsData.industry           = payload.industry;
  if (typeof payload.leadSource         === "string")  leadsData.leadSource         = payload.leadSource;

  // Only issue the update if at least one user-driven field was supplied.
  // updatedAt alone is not worth a round-trip.
  const hasDualWriteFields = Object.keys(leadsData).length > 1;
  if (hasDualWriteFields) {
    try {
      const result = await prisma.lead.updateMany({
        where: { id: leadId },
        data: leadsData,
      });
      if (result.count === 0) {
        console.warn(
          `[leads-status POST] Dual-write: no leads row found for leadId="${leadId}". ` +
          "Overlay write succeeded; leads mirror skipped. " +
          "This is expected only for overlays created before the lead row exists."
        );
      }
    } catch (err) {
      // The overlay write succeeded. Log and continue — do not fail the request.
      // The next successful write or a backfill will bring leads back in sync.
      console.error(
        `[leads-status POST] Dual-write: leads mirror write failed for leadId="${leadId}". ` +
        "Overlay write succeeded. leads row may be temporarily stale.",
        err
      );
    }
  }

  const record = toLeadStatusRecord(row);
  return NextResponse.json({ record });
}
