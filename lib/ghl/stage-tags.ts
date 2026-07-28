// RTM OS — GHL Stage-Tag Sync Utilities
//
// RTM Lead stages are Contact-level concepts (there is no GHL Opportunity
// until "Create Opportunity" is clicked in RTM).  GHL has no native
// Contact-level stage field, so we represent the RTM stage as a Contact tag
// following the convention:
//
//   rtm-stage-<normalized-stage>
//
// Normalization: lowercase, spaces/slashes → hyphens.
//
// Examples:
//   "New Lead"             → rtm-stage-new-lead
//   "Contact Attempted"    → rtm-stage-contact-attempted
//   "Contacted"            → rtm-stage-contacted
//   "Discovery Scheduled"  → rtm-stage-discovery-scheduled
//   "Discovery Complete"   → rtm-stage-discovery-complete
//   "Qualified"            → rtm-stage-qualified
//   "Disqualified"         → rtm-stage-disqualified
//
// ── Loop Prevention ──────────────────────────────────────────────────────────
//
// RTM → GHL: when a stage changes, we push the new rtm-stage-* tag to GHL.
// GHL → RTM: when a Contact webhook arrives, we check for an rtm-stage-* tag
//             and update RTM's stage accordingly.
//
// Without loop prevention: RTM stage change → push tag → GHL fires webhook →
//   webhook updates RTM stage → (no-op loop or bounce).
//
// Prevention:
//   1. Timestamp guard: when we push a tag from RTM, we record
//      `ghlLastStagePushedAt` (ISO timestamp) on the LeadStatus row.
//      Incoming webhooks skip the stage update if `ghlLastStagePushedAt`
//      is within the last LOOP_GUARD_WINDOW_MS (30 seconds).
//      GHL webhook delivery is typically < 5 s, so 30 s comfortably covers
//      any realistic delivery latency while blocking our own echo.
//
//   2. No-op guard: if the stage derived from the incoming webhook's
//      rtm-stage-* tags already equals RTM's current stage, skip the update
//      regardless of timing.  This is a cheap secondary safety net.
//
// Together these two guards eliminate all echo loop scenarios.

// ── Constants ─────────────────────────────────────────────────────────────────

export const RTM_STAGE_TAG_PREFIX = "rtm-stage-";

// After pushing a tag to GHL, ignore any incoming webhook stage echoes for
// this many milliseconds (30 seconds).
export const LOOP_GUARD_WINDOW_MS = 30_000;

// ── Canonical RTM Lead stages ─────────────────────────────────────────────────
// Matches LEAD_STAGES in sales/leads/page.tsx.  Kept in sync manually;
// these are the only values that will ever appear as rtm-stage-* tags.

export type RtmLeadStage =
  | "New Lead"
  | "Contact Attempted"
  | "Contacted"
  | "Discovery Scheduled"
  | "Discovery Complete"
  | "Qualified"
  | "Disqualified";

export const ALL_RTM_STAGES: RtmLeadStage[] = [
  "New Lead",
  "Contact Attempted",
  "Contacted",
  "Discovery Scheduled",
  "Discovery Complete",
  "Qualified",
  "Disqualified",
];

// ── Stage ↔ tag conversion ─────────────────────────────────────────────────────

/**
 * Convert a RTM stage name to its GHL Contact tag.
 * e.g. "Discovery Complete" → "rtm-stage-discovery-complete"
 */
export function stageToTag(stage: string): string {
  return RTM_STAGE_TAG_PREFIX + stage.toLowerCase().replace(/[\s/]+/g, "-");
}

/**
 * Convert a GHL rtm-stage-* tag back to the RTM stage name, or null if the
 * tag doesn't match any known stage.
 */
export function tagToStage(tag: string): RtmLeadStage | null {
  if (!tag.startsWith(RTM_STAGE_TAG_PREFIX)) return null;
  const suffix = tag.slice(RTM_STAGE_TAG_PREFIX.length);
  // Match against all known stages (normalized)
  for (const stage of ALL_RTM_STAGES) {
    if (stageToTag(stage) === tag) return stage;
  }
  // Unknown rtm-stage-* tag — ignore
  void suffix;
  return null;
}

/**
 * Given a list of GHL Contact tags, extract the first valid RTM stage.
 * Returns null if no rtm-stage-* tag is present or recognized.
 */
export function stageFromTags(tags: string[]): RtmLeadStage | null {
  for (const tag of tags) {
    const stage = tagToStage(tag);
    if (stage !== null) return stage;
  }
  return null;
}

/**
 * Given the full current tag array of a GHL Contact, return the subset of
 * tags that are rtm-stage-* tags (there should only ever be one, but guard
 * against duplicates left by earlier bugs).
 */
export function existingRtmStageTags(tags: string[]): string[] {
  return tags.filter((t) => t.startsWith(RTM_STAGE_TAG_PREFIX));
}

// ── Loop-prevention decision ───────────────────────────────────────────────────

/**
 * Returns true if an incoming GHL webhook stage update should be SKIPPED
 * because it is almost certainly an echo of RTM's own recent outbound push.
 *
 * @param ghlLastStagePushedAt  ISO timestamp from LeadStatus.ghlLastStagePushedAt
 *                              (null if we've never pushed a stage tag for this lead)
 * @param incomingStage         The RTM stage derived from the webhook's rtm-stage-* tags
 * @param currentStage          RTM's current stage for this lead
 */
export function shouldSkipInboundStageUpdate(
  ghlLastStagePushedAt: string | null | undefined,
  incomingStage: RtmLeadStage,
  currentStage: string
): boolean {
  // Guard 2: no-op — incoming stage is the same as current; nothing to do.
  if (incomingStage === currentStage) return true;

  // Guard 1: timestamp — within loop guard window of our own last push.
  if (ghlLastStagePushedAt) {
    const pushedMs = new Date(ghlLastStagePushedAt).getTime();
    if (!Number.isNaN(pushedMs)) {
      const ageMs = Date.now() - pushedMs;
      if (ageMs >= 0 && ageMs < LOOP_GUARD_WINDOW_MS) return true;
    }
  }

  return false;
}
