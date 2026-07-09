// =============================================================================
// RTM OS — Master Clients API Client
// lib/mock/master-clients-api.ts
//
// File-backed, cross-route-group reliable helpers for reading and mutating
// MASTER_CLIENTS. All functions go through /api/master-clients (backed by
// data/master-clients.json) instead of the in-memory MASTER_CLIENTS singleton.
//
// Async counterparts to the synchronous mutation helpers in master-clients.ts.
// Page components that need cross-route-group reliable data should use these.
// =============================================================================

import type { MasterClient } from "./master-clients";

// ── Base fetch helper ──────────────────────────────────────────────────────────

async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MasterClients API ${options?.method ?? "GET"} ${url} → ${res.status}: ${text}`);
  }
  return res;
}

// ── Read helpers ───────────────────────────────────────────────────────────────

/** Fetch all master clients from the file-backed API. */
export async function fetchMasterClients(): Promise<MasterClient[]> {
  const res = await apiFetch("/api/master-clients");
  const data = (await res.json()) as { clients: MasterClient[] };
  return data.clients;
}

/** Fetch a single master client by id. Returns null if not found. */
export async function fetchMasterClient(id: string): Promise<MasterClient | null> {
  try {
    const res = await apiFetch(`/api/master-clients?id=${encodeURIComponent(id)}`);
    const data = (await res.json()) as { client: MasterClient };
    return data.client;
  } catch {
    return null;
  }
}

// ── Write helpers ──────────────────────────────────────────────────────────────

/**
 * Upserts a full client record (insert or replace by id).
 * Used when Billing creates a new client from an invoice.
 */
export async function upsertMasterClient(client: MasterClient): Promise<MasterClient> {
  const res = await apiFetch("/api/master-clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });
  const data = (await res.json()) as { client: MasterClient };
  return data.client;
}

/**
 * Partially updates a client record. Deep-merges nested objects (activationChecklist).
 */
export async function patchMasterClient(
  id: string,
  patch: Partial<MasterClient>
): Promise<MasterClient> {
  const res = await apiFetch(`/api/master-clients?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as { client: MasterClient };
  return data.client;
}

// ── AM activation mutation helpers (async, API-backed) ────────────────────────

/**
 * Step 1: Marks activationTasksCreated = true.
 * Advances activationStatus to "Onboarding Pending".
 * API-backed counterpart to markActivationTasksCreated() in master-clients.ts.
 */
export async function apiMarkActivationTasksCreated(clientId: string): Promise<void> {
  // We patch the activationChecklist.activationTasksCreated flag plus the status fields.
  // The API does deep-merge of nested objects, so we can send the nested update.
  await patchMasterClient(clientId, {
    activationChecklist: {
      activationTasksCreated: true,
    } as MasterClient["activationChecklist"],
    activationStatus: "Onboarding Pending",
    currentStatus: "Onboarding Pending",
  });
}

/**
 * Step 2: Marks onboardingRecordCreated = true.
 * Status stays "Onboarding Pending".
 * API-backed counterpart to markOnboardingRecordCreated() in master-clients.ts.
 */
export async function apiMarkOnboardingRecordCreated(clientId: string): Promise<void> {
  await patchMasterClient(clientId, {
    activationChecklist: {
      onboardingRecordCreated: true,
    } as MasterClient["activationChecklist"],
    onboardingStatus: "In Progress",
  });
}

/**
 * Step 3: Marks kickoffCallCompleted = true and advances status to
 * "Department Activation Pending" (when activationTasksCreated + onboardingRecordCreated are also true).
 * API-backed counterpart to markKickoffComplete() in master-clients.ts.
 *
 * Note: The server does not re-check the other checklist flags (it just applies the patch).
 * Callers should only invoke this after the prior two steps are complete, matching the existing logic.
 */
export async function apiMarkKickoffComplete(
  clientId: string,
  _kickoffDate?: string
): Promise<void> {
  await patchMasterClient(clientId, {
    activationChecklist: {
      kickoffCallCompleted: true,
    } as MasterClient["activationChecklist"],
    activationStatus: "Department Activation Pending",
    currentStatus: "Department Activation Pending",
  });
}

/**
 * Marks a client as cleared by Billing (cleared: true, billingStatus: "Cleared").
 * API-backed so AM pages immediately see the cleared state.
 */
export async function apiMarkCleared(clientId: string): Promise<void> {
  await patchMasterClient(clientId, {
    cleared: true,
    billingStatus: "Cleared",
  });
}
