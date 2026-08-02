// RTM OS — GHL Lead Stage Sync API Route
//
// POST /api/ghl/sync-lead-stage
//
// Called automatically whenever a Lead's stage changes (Move Stage, Disqualify,
// Discovery Complete) — not as a separate manual action.
//
// What this does:
//   1. Validates the lead has a real (non-mock) GHL Contact ID.
//   2. Reads the Contact's CURRENT tags from GHL (source of truth).
//   3. Removes all rtm-stage-* tags from that live set except the one being set.
//   4. Adds the new rtm-stage-<stage> tag if not already present.
//   5. Writes the resulting tag list back to Lead.ghlContactTags (mirror re-sync).
//   6. Records `ghlLastStagePushedAt` on the LeadStatus row (loop prevention).
//
// The RTM-side stage change always succeeds first; this sync is fire-and-log.
// If the GHL API call fails, the RTM stage is already saved and we log the
// error but do NOT block or roll back the user's action.
//
// Body:
//   {
//     leadId:       string   — RTM lead ID
//     ghlContactId: string   — real GHL Contact ID (not a mock "GHL-CON-*")
//     stage:        string   — new RTM stage value
//     previousTags?: string[] — unused by this route; kept for client compat
//   }
//
// Response:
//   { ok: true, addedTag: string, removedTags: string[] }
//   { ok: false, error: string, errorCode: string }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  addContactTags,
  removeContactTags,
  getContact,
  searchContact,
  ghlCredentialsConfigured,
  GhlConfigError,
  GhlApiError,
} from "@/lib/ghl/client";
import {
  stageToTag,
  existingRtmStageTags,
} from "@/lib/ghl/stage-tags";

// ── Input type ────────────────────────────────────────────────────────────────

interface SyncLeadStageInput {
  leadId: string;
  ghlContactId: string;
  stage: string;
  previousTags?: string[];
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!ghlCredentialsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "GHL credentials not configured. Set GHL_PRIVATE_INTEGRATION_TOKEN and GHL_LOCATION_ID.",
        errorCode: "GHL_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON", errorCode: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const input = body as Partial<SyncLeadStageInput>;

  if (!input?.leadId) {
    return NextResponse.json(
      { ok: false, error: "leadId is required", errorCode: "MISSING_LEAD_ID" },
      { status: 400 }
    );
  }
  if (!input.stage) {
    return NextResponse.json(
      { ok: false, error: "stage is required", errorCode: "MISSING_STAGE" },
      { status: 400 }
    );
  }

  // Resolve the real GHL Contact ID.
  //
  // The caller (pushStageToGhl on the Leads page) sends the ID it knows about:
  //   lead.ghlContactIdReal ?? lead.ghlContactId
  //
  // For webhook-created leads (ghlOrigin=true), the real GHL Contact ID is
  // stored in Lead.ghlContactId on the Lead table (written by the webhook
  // handler at creation time).  However, the front-end Lead object only
  // receives this field as ghlContactId (the static seed/webhook value) or
  // ghlContactIdReal (the LeadStatus overlay written by /api/ghl/sync-lead).
  //
  // When neither the client-supplied ID nor the LeadStatus overlay is a real
  // ID, fall back to reading Lead.ghlContactId directly from the DB.  This
  // covers the webhook-created-lead case where the ID never propagated to the
  // client's runtime state (e.g. the lead was created before the page was last
  // loaded, or the LeadStatus overlay was never written).

  let ghlContactId = input.ghlContactId ?? "";
  const isRealId = (id: string) =>
    id && id !== "—" && !id.startsWith("GHL-CON-");

  if (!isRealId(ghlContactId)) {
    // Client didn't supply a real ID — attempt DB fallback.
    // Check LeadStatus.ghlContactId first (written by /api/ghl/sync-lead),
    // then Lead.ghlContactId (written by the webhook handler at create time).
    try {
      const statusRow = await prisma.leadStatus.findUnique({
        where: { leadId: input.leadId },
        select: { ghlContactId: true },
      });
      if (statusRow?.ghlContactId && isRealId(statusRow.ghlContactId)) {
        ghlContactId = statusRow.ghlContactId;
      } else {
        const leadRow = await prisma.lead.findUnique({
          where: { id: input.leadId },
          select: { ghlContactId: true },
        });
        if (leadRow?.ghlContactId && isRealId(leadRow.ghlContactId)) {
          ghlContactId = leadRow.ghlContactId;
        }
      }
    } catch (dbLookupErr) {
      console.warn(
        `[GHL Stage Sync] DB fallback lookup failed for lead ${input.leadId}:`,
        dbLookupErr
      );
    }
  }

  // Tier 4: email lookup via GHL API (reuses the single searchContact path)
  // Only attempted when all three DB tiers returned empty/placeholder IDs.
  if (!isRealId(ghlContactId)) {
    try {
      const leadRow = await prisma.lead.findUnique({
        where: { id: input.leadId },
        select: { email: true },
      });
      const email = leadRow?.email?.trim();
      if (email) {
        const found = await searchContact(email);
        if (found?.id && isRealId(found.id)) {
          ghlContactId = found.id;
          console.log(
            `[GHL Stage Sync] Tier-4 email lookup resolved lead ${input.leadId} ` +
            `to GHL Contact ID "${ghlContactId}" (email: "${email}") — writing back.`
          );
          // Write resolved ID back to both tables so the next call short-circuits.
          // NEVER clobber user-edited RTM fields — only set GHL metadata.
          try {
            await prisma.lead.update({
              where: { id: input.leadId },
              data: { ghlContactId },
            });
            await prisma.leadStatus.upsert({
              where: { leadId: input.leadId },
              update: { ghlContactId },
              create: { leadId: input.leadId, ghlContactId, updatedAt: new Date().toISOString() },
            });
          } catch (writeBackErr) {
            // Write-back failure is non-fatal; we already have the ID in memory.
            console.warn(
              `[GHL Stage Sync] Tier-4 write-back failed for lead ${input.leadId}:`,
              writeBackErr
            );
          }
        } else {
          console.warn(
            `[GHL Stage Sync] Tier-4 email lookup returned no match for ` +
            `lead ${input.leadId} (email: "${email}").`
          );
        }
      }
    } catch (tier4Err) {
      console.warn(
        `[GHL Stage Sync] Tier-4 email lookup threw for lead ${input.leadId}:`,
        tier4Err
      );
    }
  }

  const hasRealContactId = isRealId(ghlContactId);

  if (!hasRealContactId) {
    // Not yet synced to GHL — nothing to push; not an error.
    // Fix 3a: write sync status so the skip is visible in the UI.
    const skipReason = "No real GHL Contact ID — lead has not been synced to GHL yet.";
    try {
      await prisma.leadStatus.upsert({
        where: { leadId: input.leadId },
        update: {
          ghlSyncStatus: "Not Synced",
          ghlSyncError: skipReason,
          updatedAt: new Date().toISOString(),
        },
        create: {
          leadId: input.leadId,
          ghlSyncStatus: "Not Synced",
          ghlSyncError: skipReason,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (skipWriteErr) {
      console.warn(
        `[GHL Stage Sync] Failed to write skip status for lead ${input.leadId}:`,
        skipWriteErr
      );
    }
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: skipReason,
    });
  }

  const newTag = stageToTag(input.stage);
  const now = new Date().toISOString();

  // ── Step 1: Read current tags from GHL (source of truth) ─────────────────
  //
  // RTM's local mirror (lead.ghlContactTags) is unreliable — it goes stale
  // when a webhook omits the tags field, when tags are edited directly in the
  // GHL UI, or when any sync is missed.  The confirmed production bug was:
  // mirror = [] (wiped by a tagless webhook), so tagsToRemove was [] and
  // removeContactTags was never called while addContactTags still ran,
  // causing tags to accumulate across stage moves.
  //
  // Fix: read live tags from GHL before every stage push.  This costs one
  // extra GET per stage move and in exchange is immune to a stale mirror.
  // It also self-heals accumulated tags — any duplicate rtm-stage-* tags
  // already on the contact are removed on the next stage change.
  //
  // Fail-soft: if the GET fails we do NOT fall back to mirror-based removal
  // (that is the bug we are fixing).  Instead we write ghlSyncError and
  // return a skipped/failed shape so the UI surfaces it.  The RTM-side stage
  // change has already been saved by the caller before this route is invoked,
  // so a failed tag sync never reverts or blocks the user's action.

  let currentGhlTags: string[];
  try {
    const contact = await getContact(ghlContactId);
    currentGhlTags = Array.isArray(contact.tags) ? contact.tags : [];
  } catch (readErr) {
    const readErrMsg =
      readErr instanceof Error ? readErr.message : "Unknown error reading GHL contact";
    const detail = `GHL contact read failed before tag reconciliation: ${readErrMsg}`;
    console.error(
      `[GHL Stage Sync] Lead ${input.leadId}: ${detail}`
    );
    // Write the error so the UI surfaces it; do NOT revert the RTM stage.
    try {
      await prisma.leadStatus.upsert({
        where: { leadId: input.leadId },
        update:  { ghlSyncStatus: "Sync Failed", ghlSyncError: detail, updatedAt: now },
        create:  { leadId: input.leadId, ghlContactId, ghlSyncStatus: "Sync Failed", ghlSyncError: detail, updatedAt: now },
      });
    } catch (dbErr) {
      console.error("[GHL Stage Sync] Failed to write read-error state to DB:", dbErr);
    }
    return NextResponse.json(
      { ok: false, error: detail, errorCode: "GHL_READ_FAILED" },
      { status: 502 }
    );
  }

  // ── Step 2: Reconcile rtm-stage-* tags ───────────────────────────────────
  //
  // From the live GHL tag list:
  //   - Remove every rtm-stage-* tag that is NOT the tag we are setting.
  //   - Add the new tag only if it is not already present.
  //
  // This is additive-safe: non-rtm-stage-* tags (e.g. "Landscaping",
  // "Google Ads") are completely untouched.

  const tagsToRemove = existingRtmStageTags(currentGhlTags).filter(
    (t) => t !== newTag
  );
  const alreadyHasNewTag = currentGhlTags.includes(newTag);

  try {
    // Step 3: Remove stale rtm-stage-* tags (if any)
    if (tagsToRemove.length > 0) {
      await removeContactTags(ghlContactId, tagsToRemove);
    }

    // Step 4: Add the new rtm-stage-* tag (skip if already present)
    if (!alreadyHasNewTag) {
      await addContactTags(ghlContactId, [newTag]);
    }

    // Step 5: Rebuild the expected post-reconciliation tag list and write it
    // back to Lead.ghlContactTags so the RTM mirror re-syncs.  Without this
    // the mirror keeps drifting and the next stage push would face the same
    // stale-mirror problem.
    const reconciledTags = [
      ...currentGhlTags.filter(
        (t) => !tagsToRemove.includes(t)
      ),
      ...(alreadyHasNewTag ? [] : [newTag]),
    ];
    await prisma.lead.update({
      where: { id: input.leadId },
      data:  { ghlContactTags: reconciledTags, updatedAt: now },
    });

    // Step 6: Record the push timestamp for loop prevention
    await prisma.leadStatus.upsert({
      where: { leadId: input.leadId },
      update: {
        ghlLastStagePushedAt: now,
        ghlSyncStatus: "Synced",
        ghlSyncError: "",
        updatedAt: now,
      },
      create: {
        leadId: input.leadId,
        ghlContactId,
        ghlLastStagePushedAt: now,
        ghlSyncStatus: "Synced",
        ghlSyncError: "",
        updatedAt: now,
      },
    });

    console.log(
      `[GHL Stage Sync] Lead ${input.leadId} → stage "${input.stage}" → tag "${newTag}" ` +
        `(removed: ${tagsToRemove.join(", ") || "none"}, ` +
        `alreadyPresent: ${alreadyHasNewTag}, mirrorUpdated: true)`
    );

    return NextResponse.json({
      ok: true,
      addedTag: newTag,
      removedTags: tagsToRemove,
    });
  } catch (err) {
    const isConfig = err instanceof GhlConfigError;
    const isApi = err instanceof GhlApiError;
    const message = err instanceof Error ? err.message : "Unknown error";
    const errorCode = isConfig
      ? "GHL_NOT_CONFIGURED"
      : isApi
        ? "GHL_API_ERROR"
        : "UNKNOWN";

    // Write sync failure back to lead_statuses (non-blocking — best effort)
    try {
      await prisma.leadStatus.upsert({
        where: { leadId: input.leadId! },
        update: {
          ghlSyncStatus: "Sync Failed",
          ghlSyncError: message,
          updatedAt: now,
        },
        create: {
          leadId: input.leadId!,
          ghlSyncStatus: "Sync Failed",
          ghlSyncError: message,
          updatedAt: now,
        },
      });
    } catch (dbErr) {
      console.error("[GHL Stage Sync] Failed to write error state to DB:", dbErr);
    }

    console.error(
      `[GHL Stage Sync] Failed for lead ${input.leadId} stage "${input.stage}":`,
      message
    );

    return NextResponse.json(
      { ok: false, error: message, errorCode },
      {
        status: isApi
          ? (err as GhlApiError).status >= 500
            ? 502
            : 400
          : 503,
      }
    );
  }
}
