// RTM OS — Lead Stage Rename API Route
//
// POST /api/lead-stages/rename
//
// Renames a lead stage. In order:
//   1. Validate: old exists, new is non-empty, new is not already taken.
//   2. Update the lead_stages config row + migrate leads.stage and
//      lead_statuses.stage in one atomic transaction. If either fails the
//      config change does not stand (Prisma rolls back the whole transaction).
//   3. After a successful DB rename, retag affected GHL contacts:
//        - remove the old rtm-stage-* tag
//        - add the new one
//      A retag failure does NOT roll back the rename. Each failure is
//      collected and returned individually so Fe can fix those contacts by hand.
//   4. Return a full result: DB migration counts + retag outcome.
//
// GHL contacts are found from RTM's own leads table — only leads with a real
// (non-mock) ghlContactId are retagged. GHL contacts with no RTM lead row are
// outside the scope of this route (they are unreachable without a GHL-side
// tag search endpoint, which the client does not expose).
//
// Retag concurrency: SEQUENTIAL (one contact at a time) to avoid GHL rate
// limits. GHL enforces per-location rate limits; parallel requests for N
// contacts would spike usage and risk 429s. Sequential is safe for any
// realistic lead count.
//
// Body:
//   { oldName: string; newName: string }
//
// Response 200:
//   {
//     ok: true;
//     leadsUpdated: number;
//     leadStatusesUpdated: number;
//     retag: {
//       retagged: number;
//       failures: Array<{ leadId: string; ghlContactId: string; error: string }>;
//     };
//   }
//
// Response 400 / 404 / 409 / 500:
//   { ok: false; error: string; errorCode: string }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  addContactTags,
  removeContactTags,
  getContact,
  ghlCredentialsConfigured,
} from "@/lib/ghl/client";
import { stageToTag, existingRtmStageTags } from "@/lib/ghl/stage-tags";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RetagFailure {
  leadId: string;
  ghlContactId: string;
  error: string;
}

// ── Retag a single contact (non-throwing) ─────────────────────────────────────

async function retagContact(
  leadId: string,
  ghlContactId: string,
  oldTag: string,
  newTag: string
): Promise<RetagFailure | null> {
  try {
    // Read live tags from GHL (source of truth — mirrors go stale).
    const contact = await getContact(ghlContactId);
    const currentTags = Array.isArray(contact.tags) ? contact.tags : [];

    // Remove ALL existing rtm-stage-* tags that are not the new tag.
    // This also catches any accumulated duplicates from earlier bugs.
    const toRemove = existingRtmStageTags(currentTags).filter((t) => t !== newTag);
    if (toRemove.length > 0) {
      await removeContactTags(ghlContactId, toRemove);
    }

    // Add the new tag only if not already present.
    if (!currentTags.includes(newTag)) {
      await addContactTags(ghlContactId, [newTag]);
    }

    return null; // success
  } catch (err) {
    return {
      leadId,
      ghlContactId,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON", errorCode: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const payload = body as { oldName?: unknown; newName?: unknown };

  // ── C1: Validate ────────────────────────────────────────────────────────────

  if (typeof payload.oldName !== "string" || !payload.oldName.trim()) {
    return NextResponse.json(
      { ok: false, error: "oldName is required and must be a non-empty string", errorCode: "INVALID_OLD_NAME" },
      { status: 400 }
    );
  }
  if (typeof payload.newName !== "string" || !payload.newName.trim()) {
    return NextResponse.json(
      { ok: false, error: "newName is required and must be a non-empty string", errorCode: "INVALID_NEW_NAME" },
      { status: 400 }
    );
  }

  const oldName = payload.oldName.trim();
  const newName = payload.newName.trim();

  if (oldName === newName) {
    return NextResponse.json(
      { ok: false, error: "oldName and newName are the same — nothing to rename", errorCode: "SAME_NAME" },
      { status: 400 }
    );
  }

  try {
    // Check old stage exists
    const oldStage = await prisma.leadStage.findFirst({ where: { name: oldName } });
    if (!oldStage) {
      return NextResponse.json(
        {
          ok: false,
          error: `Lead stage "${oldName}" does not exist in the config table`,
          errorCode: "OLD_STAGE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Check new name is not already taken
    const conflict = await prisma.leadStage.findFirst({ where: { name: newName } });
    if (conflict) {
      return NextResponse.json(
        {
          ok: false,
          error: `Lead stage "${newName}" already exists — choose a different name`,
          errorCode: "NEW_NAME_CONFLICT",
        },
        { status: 409 }
      );
    }

    // ── C2 + C3: Update config and migrate records in one transaction ────────
    // Prisma interactive transaction — if either updateMany throws, Prisma
    // rolls back the leadStage.update automatically. The config change cannot
    // stand without the record migration succeeding.
    const now = new Date().toISOString();

    let leadsUpdated = 0;
    let leadStatusesUpdated = 0;

    await prisma.$transaction(async (tx) => {
      // C2: update the config row
      await tx.leadStage.update({
        where: { id: oldStage.id },
        data: { name: newName, updatedAt: now },
      });

      // C3: migrate leads.stage
      const leadsResult = await tx.lead.updateMany({
        where: { stage: oldName },
        data: { stage: newName, updatedAt: now },
      });
      leadsUpdated = leadsResult.count;

      // C3: migrate lead_statuses.stage — both tables must move together.
      // Updated in the same transaction so they can never diverge from a rename.
      const leadStatusesResult = await tx.leadStatus.updateMany({
        where: { stage: oldName },
        data: { stage: newName, updatedAt: now },
      });
      leadStatusesUpdated = leadStatusesResult.count;
    });

    // ── D1–D3: GHL retag (Decision 2) ────────────────────────────────────────
    // The DB rename is complete. Now retag affected GHL contacts.
    // Failures do NOT roll back the rename — collect and report them.
    //
    // "Affected contacts" = leads whose stage is now newName AND that have a
    // real (non-mock) ghlContactId. We read from leads.ghlContactId; the
    // lead_statuses overlay ghlContactId (from sync-lead) takes priority.
    // Since leads.stage is already updated, we query for newName.

    const retagFailures: RetagFailure[] = [];
    let retagged = 0;

    if (ghlCredentialsConfigured()) {
      const oldTag = stageToTag(oldName);
      const newTag = stageToTag(newName);

      // Find leads that were just renamed (stage = newName now).
      // Join with lead_statuses to prefer the overlay ghlContactId.
      const affectedLeads = await prisma.lead.findMany({
        where: { stage: newName },
        select: { id: true, ghlContactId: true },
      });

      // Also check lead_statuses for ghlContactId overrides.
      const affectedLeadIds = affectedLeads.map((l) => l.id);
      const statusOverrides = await prisma.leadStatus.findMany({
        where: { leadId: { in: affectedLeadIds }, ghlContactId: { not: null } },
        select: { leadId: true, ghlContactId: true },
      });
      const overrideMap = new Map<string, string>(
        statusOverrides
          .filter((s): s is { leadId: string; ghlContactId: string } => s.ghlContactId !== null)
          .map((s) => [s.leadId, s.ghlContactId])
      );

      // D5: process contacts sequentially to stay within GHL rate limits.
      for (const lead of affectedLeads) {
        // Resolve real contact ID: overlay takes priority over the static field.
        const resolvedId = overrideMap.get(lead.id) ?? lead.ghlContactId;

        // Skip mock/placeholder IDs — these leads have no GHL contact yet.
        if (
          !resolvedId ||
          resolvedId === "—" ||
          resolvedId.startsWith("GHL-CON-")
        ) {
          continue;
        }

        // D2: retag; failure is non-fatal.
        const failure = await retagContact(lead.id, resolvedId, oldTag, newTag);
        if (failure) {
          retagFailures.push(failure);
        } else {
          retagged++;
        }
      }
    }
    // If GHL credentials are not configured, retag is silently skipped.
    // The rename still succeeds; retag.retagged = 0, retag.failures = [].

    // ── C4: Report what changed ──────────────────────────────────────────────
    return NextResponse.json({
      ok: true,
      leadsUpdated,
      leadStatusesUpdated,
      retag: {
        retagged,
        failures: retagFailures,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), errorCode: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
