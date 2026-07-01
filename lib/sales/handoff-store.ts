// RTM OS — Shared Handoff Store
// Module-level singleton list shared by contracts/page.tsx and handoffs/page.tsx.
// No React, no UI. Pure mutable module state + pure accessor functions.

import { buildHandoffRecord, generateHandoffNumber } from "./handoff-engine";
import type { HandoffRecord } from "./handoff-engine";

// ─── Pre-seeded mock handoff records ─────────────────────────────────────────
// Migrated from the original single-record handoffs page.
// Summit Landscaping / HOF-2026-6844 must be the first entry.

const SUMMIT_SUMMARY: Record<string, string> = {
  "client-name": "Summit Landscaping",
  "contract-number": "CTR-2025-0041",
  "services-sold": "SEO, Google Business Profile, Reporting",
  "monthly-recurring-revenue": "$2,400/mo",
  "setup-fees": "$0",
  "payment-terms": "Net 15",
  "term-length": "12 months",
  "departments": "SEO Team, GBP Team, Analytics",
};

function mkSeededRecord(
  handoffNumber: string,
  clientName: string,
  contractNumber: string,
  contractId: string,
  preparedBy: string,
  summaryFields: Record<string, string>,
  completedItemIds: string[],
  createdAt: string
): HandoffRecord {
  const record = buildHandoffRecord(clientName, contractNumber, contractId, preparedBy, summaryFields);
  // Stable handoff number and createdAt for seeded records
  const seeded: HandoffRecord = { ...record, handoffNumber, createdAt };
  // Mark specified checklist items as complete
  const checklist = seeded.checklist.map((item) =>
    completedItemIds.includes(item.id)
      ? { ...item, status: "complete" as const, completedAt: createdAt }
      : item
  );
  const completedRequired = checklist.filter(
    (e) => e.status === "complete"
  ).length;
  const totalItems = checklist.length;
  const completionPercentage = Math.round((completedRequired / totalItems) * 100);
  const readyToSubmit = checklist.every((e) =>
    e.status === "complete" || e.status === "not-applicable"
  );
  return { ...seeded, checklist, completionPercentage, readyToSubmit };
}

const _handoffs: HandoffRecord[] = [
  // Summit Landscaping — migrated from original handoffs page, in-progress state
  mkSeededRecord(
    "HOF-2026-6844",
    "Summit Landscaping",
    "CTR-2025-0041",
    "ctr-0041",
    "Jake Monroe",
    SUMMIT_SUMMARY,
    ["contract-signed", "payment-terms-confirmed", "services-verified"],
    "2025-06-01T09:00:00Z"
  ),
  // Metro Dental Group — recently started, barely any items done
  mkSeededRecord(
    "HOF-2026-6845",
    "Metro Dental Group",
    "CTR-2025-0042",
    "ctr-0042",
    "Jordan M.",
    {
      "client-name": "Metro Dental Group",
      "contract-number": "CTR-2025-0042",
      "services-sold": "SEO, GBP, PPC, Reporting",
      "monthly-recurring-revenue": "$4,500/mo",
      "setup-fees": "$500",
      "payment-terms": "Net 30",
      "term-length": "12 months",
      "departments": "SEO Team, PPC Team, GBP Team, Analytics",
    },
    ["contract-signed"],
    "2025-06-05T10:30:00Z"
  ),
  // Coastal Wellness Spa — fully complete
  mkSeededRecord(
    "HOF-2026-6840",
    "Coastal Wellness Spa",
    "CTR-2025-0043",
    "ctr-0043",
    "Sarah K.",
    {
      "client-name": "Coastal Wellness Spa",
      "contract-number": "CTR-2025-0043",
      "services-sold": "Meta Ads, SEO, Creative",
      "monthly-recurring-revenue": "$3,800/mo",
      "setup-fees": "$0",
      "payment-terms": "Net 15",
      "term-length": "12 months",
      "assigned-am": "Dana L.",
      "departments": "Meta Ads Team, SEO Team, Creative Team",
    },
    [
      "contract-signed",
      "invoice-created",
      "payment-terms-confirmed",
      "services-verified",
      "am-assigned",
      "departments-notified",
      "activation-record-created",
      "billing-team-notified",
    ],
    "2025-06-08T08:00:00Z"
  ),
];

// ─── Store API ────────────────────────────────────────────────────────────────

export function getAllHandoffs(): HandoffRecord[] {
  return _handoffs;
}

export function getHandoffById(id: string): HandoffRecord | undefined {
  return _handoffs.find((h) => h.id === id);
}

export function getHandoffByHandoffNumber(handoffNumber: string): HandoffRecord | undefined {
  return _handoffs.find((h) => h.handoffNumber === handoffNumber);
}

export function getHandoffByContractId(contractId: string): HandoffRecord | undefined {
  return _handoffs.find((h) => h.contractId === contractId);
}

/**
 * Creates a new handoff for the given contract data and adds it to the store.
 * If a handoff already exists for this contractId, returns the existing one.
 */
export function getOrCreateHandoffForContract(
  contractId: string,
  clientName: string,
  contractNumber: string,
  preparedBy: string,
  summaryFields: Record<string, string>
): HandoffRecord {
  const existing = getHandoffByContractId(contractId);
  if (existing) return existing;

  const record = buildHandoffRecord(clientName, contractNumber, contractId, preparedBy, summaryFields);
  _handoffs.push(record);
  return record;
}

/**
 * Replaces a handoff record in the store (for updates from the detail view).
 */
export function updateHandoffInStore(updated: HandoffRecord): void {
  const idx = _handoffs.findIndex((h) => h.id === updated.id);
  if (idx !== -1) {
    _handoffs[idx] = updated;
  }
}

/**
 * Derives a display status label from a HandoffRecord's checklist completion.
 */
export type HandoffListStatus = "Not Started" | "In Progress" | "Submitted" | "Complete";

export function getHandoffListStatus(record: HandoffRecord): HandoffListStatus {
  if (record.status === "completed" || record.completionPercentage === 100) return "Complete";
  if (record.status === "submitted" || record.status === "received") return "Submitted";
  const completed = record.checklist.filter((e) => e.status === "complete").length;
  if (completed > 0) return "In Progress";
  return "Not Started";
}
