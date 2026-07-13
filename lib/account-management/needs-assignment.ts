/**
 * lib/account-management/needs-assignment.ts
 *
 * SINGLE SOURCE OF TRUTH for the "needs AM assignment" predicate.
 *
 * A client needs AM assignment when Billing has cleared them and the AM
 * module has not yet assigned an Account Manager — indicated by
 * activationStatus === "AM Assignment Needed".
 *
 * Using this shared function on both Account Assignments and Client Portfolio
 * guarantees the two KPI counts are always in sync and can never drift.
 *
 * WHY activationStatus only (not assignedAM === "Unassigned"):
 *   assignedAM === "Unassigned" also captures un-cleared leads and prospects
 *   that are still in Sales/Billing pipelines and not yet ready for AM action.
 *   activationStatus === "AM Assignment Needed" is Billing's explicit handoff
 *   signal: it means cleared, paid, and ready for an AM to be assigned.
 */

import type { MasterClient } from "@/lib/mock/master-clients";

/**
 * Returns true when the client is ready for (and still needs) AM assignment.
 *
 * Used by:
 *   - Account Assignments  → HeadView KPI "Needs Assignment" count
 *   - Client Portfolio     → KPI "Needs Assignment" count + drawer "Assign AM" panel
 */
export function needsAssignment(client: Pick<MasterClient, "activationStatus">): boolean {
  return client.activationStatus === "AM Assignment Needed";
}
