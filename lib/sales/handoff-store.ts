// RTM OS — Shared Handoff Store
//
// Previously a module-level in-memory singleton (same unreliable pattern that
// caused cross-route-group desync for onboarding-records, pending-cancellation-
// requests, pending-offboarding-records, pending-sales-tasks, and the engine/
// master-clients stores). Now file-backed via /api/sales-handoffs, which reads
// and writes data/sales-handoffs.json.
//
// Seed data lives in data/sales-handoffs.json, not here.
//
// SYNC HELPERS (used by components that still need a synchronous local list):
//   getAllHandoffs()            → returns the last-fetched snapshot (may be empty on first render)
//   hydrateHandoffs(records)   → call after fetchSalesHandoffs() resolves; updates the snapshot
//
// ASYNC HELPERS (always use these for mutations):
//   getOrCreateHandoffForContract()  → checks API; creates + persists if missing
//   updateHandoffInStore()           → persists via PATCH API + updates local snapshot

import { buildHandoffRecord } from "./handoff-engine";
import type { HandoffRecord } from "./handoff-engine";
import {
  fetchSalesHandoffs,
  fetchSalesHandoffByContract,
  upsertSalesHandoff,
  patchSalesHandoff,
} from "./sales-handoffs-api";

// ─── Local snapshot (populated by components on mount via hydrateHandoffs) ────

let _snapshot: HandoffRecord[] = [];

/** Update the local in-process snapshot. Call after fetchSalesHandoffs() resolves. */
export function hydrateHandoffs(records: HandoffRecord[]): void {
  _snapshot = records;
}

/** Returns the last-fetched snapshot. Empty on first render before hydration. */
export function getAllHandoffs(): HandoffRecord[] {
  return _snapshot;
}

export function getHandoffById(id: string): HandoffRecord | undefined {
  return _snapshot.find((h) => h.id === id);
}

export function getHandoffByHandoffNumber(
  handoffNumber: string
): HandoffRecord | undefined {
  return _snapshot.find((h) => h.handoffNumber === handoffNumber);
}

export function getHandoffByContractId(
  contractId: string
): HandoffRecord | undefined {
  return _snapshot.find((h) => h.contractId === contractId);
}

// ─── Async store API ──────────────────────────────────────────────────────────

/**
 * Fetches all handoffs from the file-backed API and refreshes the local snapshot.
 * Components should call this on mount (replaces the old synchronous getAllHandoffs seed).
 */
export async function loadHandoffs(): Promise<HandoffRecord[]> {
  const records = await fetchSalesHandoffs();
  _snapshot = records;
  return records;
}

/**
 * Creates a new handoff for the given contract data and persists it via API.
 * If a handoff already exists for this contractId (checked in API + snapshot),
 * returns the existing one.
 */
export async function getOrCreateHandoffForContract(
  contractId: string,
  clientName: string,
  contractNumber: string,
  preparedBy: string,
  summaryFields: Record<string, string>
): Promise<HandoffRecord> {
  // Check snapshot first (fast path)
  const existingInSnapshot = _snapshot.find((h) => h.contractId === contractId);
  if (existingInSnapshot) return existingInSnapshot;

  // Check API (cross-route source of truth)
  const existingInApi = await fetchSalesHandoffByContract(contractId);
  if (existingInApi) {
    // Update snapshot
    const idx = _snapshot.findIndex((h) => h.id === existingInApi.id);
    if (idx === -1) _snapshot.push(existingInApi);
    else _snapshot[idx] = existingInApi;
    return existingInApi;
  }

  // Create new record
  const record = buildHandoffRecord(
    clientName,
    contractNumber,
    contractId,
    preparedBy,
    summaryFields
  );
  const persisted = await upsertSalesHandoff(record);

  _snapshot.push(persisted);
  return persisted;
}

/**
 * Persists an updated HandoffRecord via PATCH API and refreshes the local snapshot.
 * Used by the handoff detail view after checklist/summary field changes.
 */
export async function updateHandoffInStore(updated: HandoffRecord): Promise<void> {
  // Optimistic local update
  const idx = _snapshot.findIndex((h) => h.id === updated.id);
  if (idx !== -1) {
    _snapshot[idx] = updated;
  } else {
    _snapshot.push(updated);
  }
  // Persist
  await patchSalesHandoff(updated.id, updated);
}

// ─── Display status helper ────────────────────────────────────────────────────

export type HandoffListStatus = "Not Started" | "In Progress" | "Submitted" | "Complete";

export function getHandoffListStatus(record: HandoffRecord): HandoffListStatus {
  if (record.status === "completed" || record.completionPercentage === 100)
    return "Complete";
  if (record.status === "submitted" || record.status === "received") return "Submitted";
  const completed = record.checklist.filter((e) => e.status === "complete").length;
  if (completed > 0) return "In Progress";
  return "Not Started";
}
