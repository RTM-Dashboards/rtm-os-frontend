// RTM OS — GHL Lead Stage Sync API Route
//
// POST /api/ghl/sync-lead-stage
//
// Called automatically whenever a Lead's stage changes (Move Stage, Disqualify,
// Discovery Complete) — not as a separate manual action.
//
// What this does:
//   1. Validates the lead has a real (non-mock) GHL Contact ID.
//   2. Removes any existing rtm-stage-* tags from the GHL Contact.
//   3. Adds the new rtm-stage-<stage> tag.
//   4. Records `ghlLastStagePushedAt` on the LeadStatus row (loop prevention).
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
//     previousTags?: string[] — current GHL contact tags (to identify old rtm-stage-*)
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

  // Guard: skip if no real GHL Contact ID
  const ghlContactId = input.ghlContactId ?? "";
  const hasRealContactId =
    ghlContactId &&
    ghlContactId !== "—" &&
    !ghlContactId.startsWith("GHL-CON-");

  if (!hasRealContactId) {
    // Not yet synced to GHL — nothing to push; not an error.
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "No real GHL Contact ID — lead has not been synced to GHL yet.",
    });
  }

  const newTag = stageToTag(input.stage);
  const tagsToRemove = existingRtmStageTags(input.previousTags ?? []).filter(
    (t) => t !== newTag
  );

  const now = new Date().toISOString();

  try {
    // Step 1: Remove old rtm-stage-* tags (if any)
    if (tagsToRemove.length > 0) {
      await removeContactTags(ghlContactId, tagsToRemove);
    }

    // Step 2: Add the new rtm-stage-* tag
    await addContactTags(ghlContactId, [newTag]);

    // Step 3: Record the push timestamp for loop prevention
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
        `(removed: ${tagsToRemove.join(", ") || "none"})`
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
