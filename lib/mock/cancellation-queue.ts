// ─── lib/mock/cancellation-queue.ts ──────────────────────────────────────────
//
// Cross-workspace AM → Billing cancellation signal store.
//
// Pattern mirrors pendingSalesTasks / addPendingSalesTask in workspace-tasks.ts.
// Intentionally mutable — this is the interim cross-workspace signal mechanism.
// TODO: replace with real database persistence when the backend is wired.
//
// OWNERSHIP
//   Writer : AM Cancellations page  (addPendingCancellationRequest)
//   Reader : Billing Cancellations page  (pendingCancellationRequests)
//
// ─────────────────────────────────────────────────────────────────────────────

// Exact locked 11-category reason list — do not change without product sign-off.
export type CancellationRequestReason =
  | "Not Performing"
  | "Moving In-house"
  | "Unpaid Invoice"
  | "Pricing/Financial Hardship"
  | "Communication Issue"
  | "Bankruptcy"
  | "Business Acquisition"
  | "Acquired By Private Equity"
  | "Changing Provider (New Company Name)"
  | "Closing Business"
  | "Pending Client Confirmation";

export const CANCELLATION_REASONS: CancellationRequestReason[] = [
  "Not Performing",
  "Moving In-house",
  "Unpaid Invoice",
  "Pricing/Financial Hardship",
  "Communication Issue",
  "Bankruptcy",
  "Business Acquisition",
  "Acquired By Private Equity",
  "Changing Provider (New Company Name)",
  "Closing Business",
  "Pending Client Confirmation",
];

// Billing-side status — Billing writes this; AM reads it (never writes it).
export type BillingCancellationStatus =
  | "Cancellation Requested"
  | "Billing Review"
  | "Final Invoice Needed"
  | "Pending Balance"
  | "Approved for Offboarding"
  | "Offboarding Triggered"
  | "Billing Hold"
  | "Billing Closed"
  | "Cancelled";

export interface PendingCancellationRequest {
  id: string;
  client: string;
  reason: CancellationRequestReason;
  notes: string;
  amOwner: string;
  requestedDate: string; // "Jun 20, 2025" display format
  requestedBy: "AM";
  // Billing-owned — starts at "Cancellation Requested"; Billing updates it.
  billingStatus: BillingCancellationStatus;
  // MRR impact — populated from MASTER_CLIENTS lookup when available.
  mrrImpact: string; // e.g. "-$2,400"
  // Carries through to Offboarding when Billing triggers "Notify AM".
  billingOwner: string;
  amOwnerNotified: boolean;
}

// ── Module-level mutable queue ────────────────────────────────────────────────
// Billing Cancellations page reads this on mount to merge with its own records.

export const pendingCancellationRequests: PendingCancellationRequest[] = [];

let _nextId = 1;

export function addPendingCancellationRequest(
  req: Omit<PendingCancellationRequest, "id" | "billingStatus" | "requestedBy" | "amOwnerNotified">
): PendingCancellationRequest {
  const record: PendingCancellationRequest = {
    ...req,
    id: `am-cr-${_nextId++}`,
    requestedBy: "AM",
    billingStatus: "Cancellation Requested",
    amOwnerNotified: false,
  };
  pendingCancellationRequests.push(record);
  return record;
}

// Billing calls this to update the status of an AM-initiated request.
// AM reads the updated status from the shared array (read-only from AM's side).
export function updatePendingCancellationStatus(
  id: string,
  status: BillingCancellationStatus
): void {
  const rec = pendingCancellationRequests.find((r) => r.id === id);
  if (rec) rec.billingStatus = status;
}
