// RTM OS — Sales Billing Handoff Engine
// Pure functions only. No React. No UI imports.
// Consumes HANDOFF_CHECKLIST and HANDOFF_SUMMARY_FIELDS from handoff-config.ts.

import {
  HANDOFF_CHECKLIST,
  HandoffChecklistItemId,
  HandoffChecklistItemStatus,
  HandoffActivationStatus,
} from "./handoff-config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HandoffChecklistEntry {
  id: HandoffChecklistItemId;
  label: string;
  status: HandoffChecklistItemStatus;
  completedAt?: string;
  completedBy?: string;
  blockedBy?: HandoffChecklistItemId[];
}

export interface HandoffRecord {
  id: string;
  handoffNumber: string;
  clientName: string;
  contractNumber: string;
  contractId: string;
  preparedBy: string;
  createdAt: string;
  status: HandoffActivationStatus;
  checklist: HandoffChecklistEntry[];
  summaryFields: Record<string, string>;
  completionPercentage: number;
  readyToSubmit: boolean;
  submittedAt?: string;
  receivedBy?: string;
}

// ─── Handoff Number Generator ─────────────────────────────────────────────────

export function generateHandoffNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return `HOF-${year}-${seq}`;
}

// ─── Build Handoff Record ─────────────────────────────────────────────────────

export function buildHandoffRecord(
  clientName: string,
  contractNumber: string,
  contractId: string,
  preparedBy: string,
  initialSummaryFields?: Record<string, string>
): HandoffRecord {
  const summaryFields: Record<string, string> = initialSummaryFields ?? {};

  // Build checklist entries from config (in order)
  const sorted = [...HANDOFF_CHECKLIST].sort((a, b) => a.order - b.order);

  const checklist: HandoffChecklistEntry[] = sorted.map((item) => {
    let status: HandoffChecklistItemStatus = "pending";

    // Auto-complete items where data is present and autoCompletable is true
    if (item.autoCompletable) {
      if (item.id === "payment-terms-confirmed" && summaryFields["payment-terms"]) {
        status = "complete";
      } else if (item.id === "services-verified" && summaryFields["services-sold"]) {
        status = "complete";
      }
    }

    return {
      id: item.id,
      label: item.label,
      status,
      completedAt:
        status === "complete" ? new Date().toISOString() : undefined,
      blockedBy: item.blockedBy,
    };
  });

  const completionPercentage = computeHandoffCompletion(checklist);
  const readyToSubmit = computeReadyToSubmit(checklist);

  return {
    id: crypto.randomUUID(),
    handoffNumber: generateHandoffNumber(),
    clientName,
    contractNumber,
    contractId,
    preparedBy,
    createdAt: new Date().toISOString(),
    status: "not-started",
    checklist,
    summaryFields,
    completionPercentage,
    readyToSubmit,
  };
}

// ─── Update Checklist Item ────────────────────────────────────────────────────

export function updateChecklistItem(
  record: HandoffRecord,
  itemId: HandoffChecklistItemId,
  status: HandoffChecklistItemStatus,
  completedBy?: string
): HandoffRecord {
  const updatedChecklist = record.checklist.map((entry) => {
    if (entry.id !== itemId) return entry;
    return {
      ...entry,
      status,
      completedAt: status === "complete" ? new Date().toISOString() : entry.completedAt,
      completedBy: status === "complete" ? (completedBy ?? entry.completedBy) : entry.completedBy,
    };
  });

  const completionPercentage = computeHandoffCompletion(updatedChecklist);
  const readyToSubmit = computeReadyToSubmit(updatedChecklist);
  const newStatus = computeHandoffStatus(updatedChecklist, record.submittedAt, record.receivedBy);

  return {
    ...record,
    checklist: updatedChecklist,
    completionPercentage,
    readyToSubmit,
    status: newStatus,
  };
}

// ─── Update Summary Field ─────────────────────────────────────────────────────

export function updateSummaryField(
  record: HandoffRecord,
  fieldId: string,
  value: string
): HandoffRecord {
  return {
    ...record,
    summaryFields: {
      ...record.summaryFields,
      [fieldId]: value,
    },
  };
}

// ─── Compute Completion Percentage ───────────────────────────────────────────

export function computeHandoffCompletion(checklist: HandoffChecklistEntry[]): number {
  const requiredItems = HANDOFF_CHECKLIST.filter((item) => item.required);
  if (requiredItems.length === 0) return 0;

  const completedRequired = requiredItems.filter((item) => {
    const entry = checklist.find((e) => e.id === item.id);
    return entry?.status === "complete";
  });

  return Math.round((completedRequired.length / requiredItems.length) * 100);
}

// ─── Compute Ready to Submit ──────────────────────────────────────────────────

export function computeReadyToSubmit(checklist: HandoffChecklistEntry[]): boolean {
  const requiredItems = HANDOFF_CHECKLIST.filter((item) => item.required);
  return requiredItems.every((item) => {
    const entry = checklist.find((e) => e.id === item.id);
    return entry?.status === "complete";
  });
}

// ─── Compute Handoff Status ───────────────────────────────────────────────────

export function computeHandoffStatus(
  checklist: HandoffChecklistEntry[],
  submittedAt?: string,
  receivedBy?: string
): HandoffActivationStatus {
  if (receivedBy) return "received";
  if (submittedAt) return "submitted";

  const completedCount = checklist.filter((e) => e.status === "complete").length;
  const requiredItems = HANDOFF_CHECKLIST.filter((item) => item.required);
  const allRequiredComplete = requiredItems.every((item) => {
    const entry = checklist.find((e) => e.id === item.id);
    return entry?.status === "complete";
  });

  if (allRequiredComplete) return "ready";
  if (completedCount > 0) return "in-progress";
  return "not-started";
}

// ─── Is Item Blocked ─────────────────────────────────────────────────────────

export function isItemBlocked(
  item: HandoffChecklistEntry,
  allItems: HandoffChecklistEntry[]
): boolean {
  if (!item.blockedBy || item.blockedBy.length === 0) return false;
  return item.blockedBy.some((depId) => {
    const dep = allItems.find((e) => e.id === depId);
    return !dep || dep.status !== "complete";
  });
}
