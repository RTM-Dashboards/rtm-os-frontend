// =============================================================================
// RTM OS — Sales Handoffs API Client
// lib/sales/sales-handoffs-api.ts
//
// File-backed, cross-route-group reliable helpers for reading and mutating
// sales handoff records. All functions go through /api/sales-handoffs
// (backed by data/sales-handoffs.json) instead of the in-memory singleton.
//
// Used by:
//   - app/(sales)/sales/handoffs/page.tsx         (Sales creates + submits)
//   - app/(sales)/sales/contracts/page.tsx        (Sales creates via Request Invoice)
//   - app/(billing)/billing/activation/page.tsx   (Billing sees + processes)
// =============================================================================

import type { HandoffRecord } from "./handoff-engine";

// ── Base fetch helper ──────────────────────────────────────────────────────────

async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `SalesHandoffs API ${options?.method ?? "GET"} ${url} → ${res.status}: ${text}`
    );
  }
  return res;
}

// ── Read helpers ───────────────────────────────────────────────────────────────

/** Fetch all handoff records from the file-backed API. */
export async function fetchSalesHandoffs(): Promise<HandoffRecord[]> {
  const res = await apiFetch("/api/sales-handoffs");
  const data = (await res.json()) as { handoffs: HandoffRecord[] };
  return data.handoffs;
}

/** Fetch a single handoff by id. Returns null if not found. */
export async function fetchSalesHandoff(id: string): Promise<HandoffRecord | null> {
  try {
    const res = await apiFetch(`/api/sales-handoffs?id=${encodeURIComponent(id)}`);
    const data = (await res.json()) as { handoff: HandoffRecord };
    return data.handoff;
  } catch {
    return null;
  }
}

/** Fetch a handoff by contractId. Returns null if not found. */
export async function fetchSalesHandoffByContract(
  contractId: string
): Promise<HandoffRecord | null> {
  try {
    const res = await apiFetch(
      `/api/sales-handoffs?contractId=${encodeURIComponent(contractId)}`
    );
    const data = (await res.json()) as { handoff: HandoffRecord };
    return data.handoff;
  } catch {
    return null;
  }
}

// ── Write helpers ──────────────────────────────────────────────────────────────

/**
 * Upserts a full handoff record (insert or replace by id).
 * Used when Sales creates a new handoff from a signed contract.
 */
export async function upsertSalesHandoff(
  handoff: HandoffRecord
): Promise<HandoffRecord> {
  const res = await apiFetch("/api/sales-handoffs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(handoff),
  });
  const data = (await res.json()) as { handoff: HandoffRecord };
  return data.handoff;
}

/**
 * Partially updates a handoff record.
 * Used for checklist updates, submittedToBilling flag, processed flag, etc.
 */
export async function patchSalesHandoff(
  id: string,
  patch: Partial<HandoffRecord>
): Promise<HandoffRecord> {
  const res = await apiFetch(`/api/sales-handoffs?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as { handoff: HandoffRecord };
  return data.handoff;
}

/**
 * Marks a handoff as submitted to Billing.
 * Sales calls this when clicking "Submit to Billing Team".
 */
export async function submitHandoffToBilling(id: string): Promise<HandoffRecord> {
  return patchSalesHandoff(id, {
    submittedToBilling: true,
    submittedToBillingAt: new Date().toISOString(),
    status: "submitted",
  });
}

/**
 * Marks a handoff as processed by Billing, storing the resulting clientId.
 * Billing calls this after creating the MASTER_CLIENTS record.
 */
export async function markHandoffProcessed(
  id: string,
  clientId: string
): Promise<HandoffRecord> {
  return patchSalesHandoff(id, {
    processed: true,
    processedAt: new Date().toISOString(),
    processedClientId: clientId,
    status: "received",
  });
}
