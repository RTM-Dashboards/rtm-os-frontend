// ─────────────────────────────────────────────────────────────────────────────
// lib/mock/am-onboarding-store.ts
//
// AM onboarding intake records — FILE-BACKED persistence via API route.
//
// All reads and writes go through /api/onboarding-records so that both the
// AM route group ((account-management)) and the client-facing route group
// ((client-portal)) always see the same live data, regardless of Next.js /
// Turbopack module-chunking behavior in dev mode.
//
// IMPORTANT: All store functions are now async. Callers must await them.
//
// TYPE EXPORTS: All types are re-exported here for backward compat so that
// page components that import from this module continue to work.
//
// PURE HELPERS: getOnboardingStatusMeta, getFieldStatusMeta, getFieldAssignmentSummary,
// getPendingClientFields, getLegacyAMSection, deriveRecordStatus — these remain
// synchronous and take record objects as arguments (no I/O).
// ─────────────────────────────────────────────────────────────────────────────

import {
  ONBOARDING_FIELD_SCHEMA,
  type AMOnboardingFieldDef,
} from "./am-onboarding-field-schema";

// ── Status / lifecycle types ──────────────────────────────────────────────────

export type OnboardingIntakeStatus =
  | "Draft"
  | "AM In Progress"
  | "Sent to Client"
  | "Client Responded"
  | "Ready for Kickoff"
  | "Complete";

export type FieldStatus =
  | "unset"
  | "am-filling"
  | "am-filled"
  | "pending-client"
  | "client-responded";

// ── Core data types ───────────────────────────────────────────────────────────

export interface SalesPrefillData {
  clientName: string;
  email: string;
  industry: string;
  salesOwner: string;
  referralSource?: string;
  affiliateName?: string;
  activeServices: string[];
  monthlyValue: number;
  primaryContact?: string;
  phone?: string;
  website?: string;
  location?: string;
  businessSize?: string;
  intakeSource?: string;
  selectedGoals?: string[];
  discoveryNotes?: string;
}

export interface FieldAssignment {
  fieldId: string;
  status: FieldStatus;
  value: string;
  assignedAt: string;
  sentToClientAt?: string;
  clientRespondedAt?: string;
}

export interface AMOnboardingRecord {
  id: string;
  clientId: string;
  status: OnboardingIntakeStatus;
  /** When set by AM, auto-derivation is bypassed; null = auto-derived. */
  statusOverride: OnboardingIntakeStatus | null;
  salesPrefill: SalesPrefillData;
  fieldAssignments: Record<string, FieldAssignment>;
  createdAt: string;
  updatedAt: string;
  projectId: string | null;
}

// ── Legacy types (kept for backward compat) ───────────────────────────────────

export interface AMSectionData {
  assignedAM: string;
  kickoffCallDate: string;
  preferredContactMethod: string;
  onboardingNotes: string;
  serviceStartTargetDate: string;
  specialInstructions: string;
  accessCredentialsReceived: boolean;
  contractTermMonths: string;
  internalPriority: "High" | "Medium" | "Low";
}

export interface ClientPendingField {
  fieldKey: string;
  label: string;
  description: string;
}

// ── API base URL ──────────────────────────────────────────────────────────────
// Works in browser (relative) and in Node SSR contexts (absolute via env).

function apiBase(): string {
  if (typeof window !== "undefined") {
    return "";  // browser: relative URL
  }
  // Server-side: use NEXT_PUBLIC_APP_URL or fall back to localhost
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// ── Internal fetch helpers ────────────────────────────────────────────────────

async function apiFetch(url: string, opts?: RequestInit): Promise<Response> {
  return fetch(`${apiBase()}${url}`, {
    ...opts,
    // Disable Next.js caching so we always get fresh data from the file
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(opts?.headers ?? {}) },
  });
}

// ── Status display helpers ─────────────────────────────────────────────────────

export interface OnboardingStatusMeta {
  color: string;
  bg: string;
  border: string;
  dot: string;
}

export function getOnboardingStatusMeta(
  status: OnboardingIntakeStatus
): OnboardingStatusMeta {
  const map: Record<OnboardingIntakeStatus, OnboardingStatusMeta> = {
    Draft: { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0", dot: "#94A3B8" },
    "AM In Progress": { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6" },
    "Sent to Client": { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" },
    "Client Responded": { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", dot: "#06B6D4" },
    "Ready for Kickoff": { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", dot: "#10B981" },
    Complete: { color: "#065F46", bg: "#ECFDF5", border: "#6EE7B7", dot: "#34D399" },
  };
  return map[status];
}

// ── FieldAssignment initializer ───────────────────────────────────────────────

function getSalesPrefillValue(
  field: AMOnboardingFieldDef,
  salesPrefill: SalesPrefillData
): string {
  if (!field.salesPrefillKey) return "";
  const raw = salesPrefill[field.salesPrefillKey];
  if (raw === undefined || raw === null) return "";
  if (Array.isArray(raw)) return raw.join(", ");
  if (typeof raw === "number") return raw > 0 ? String(raw) : "";
  return String(raw);
}

function buildInitialFieldAssignments(
  salesPrefill: SalesPrefillData
): Record<string, FieldAssignment> {
  const now = new Date().toISOString();
  const result: Record<string, FieldAssignment> = {};

  for (const field of ONBOARDING_FIELD_SCHEMA) {
    const prefillValue = getSalesPrefillValue(field, salesPrefill);

    if (field.defaultAssignee === "client") {
      result[field.id] = {
        fieldId: field.id,
        status: "pending-client",
        value: "",
        assignedAt: now,
        sentToClientAt: undefined,
      };
    } else {
      const hasPrefill = prefillValue.length > 0;
      result[field.id] = {
        fieldId: field.id,
        status: hasPrefill ? "am-filled" : "unset",
        value: prefillValue,
        assignedAt: now,
      };
    }
  }

  return result;
}

// ── ID generation ─────────────────────────────────────────────────────────────

let _idCounter = 1;
function generateId(): string {
  return `onb-${Date.now()}-${_idCounter++}`;
}

// ── Record status derivation (pure) ───────────────────────────────────────────

export function deriveRecordStatus(
  current: OnboardingIntakeStatus,
  assignments: Record<string, FieldAssignment>,
  statusOverride?: OnboardingIntakeStatus | null
): OnboardingIntakeStatus {
  // Manual override beats auto-derivation entirely.
  if (statusOverride != null) return statusOverride;

  const values = Object.values(assignments);

  const hasPendingClient = values.some((a) => a.status === "pending-client");
  const hasClientResponded = values.some((a) => a.status === "client-responded");
  const allResolved = values.every(
    (a) =>
      a.status === "am-filled" ||
      a.status === "client-responded" ||
      a.status === "unset"
  );

  if (current === "Ready for Kickoff" || current === "Complete") return current;

  if (allResolved && !hasPendingClient) {
    if (current === "Client Responded" || current === "Sent to Client") {
      return "Ready for Kickoff";
    }
  }
  if (hasClientResponded && hasPendingClient) return "Client Responded";
  if (hasPendingClient) return "Sent to Client";
  return current;
}

// ── Async store API ───────────────────────────────────────────────────────────

export async function getAllOnboardingRecords(): Promise<AMOnboardingRecord[]> {
  const res = await apiFetch("/api/onboarding-records");
  if (!res.ok) return [];
  const data = (await res.json()) as { records: AMOnboardingRecord[] };
  return data.records ?? [];
}

export async function getOnboardingRecordById(
  id: string
): Promise<AMOnboardingRecord | undefined> {
  const res = await apiFetch(`/api/onboarding-records?id=${encodeURIComponent(id)}`);
  if (!res.ok) return undefined;
  const data = (await res.json()) as { record: AMOnboardingRecord };
  return data.record;
}

export async function getOnboardingRecordByClientId(
  clientId: string
): Promise<AMOnboardingRecord | undefined> {
  const res = await apiFetch(
    `/api/onboarding-records?clientId=${encodeURIComponent(clientId)}`
  );
  if (!res.ok) return undefined;
  const data = (await res.json()) as { record: AMOnboardingRecord };
  return data.record;
}

/**
 * Creates a new onboarding record for the given client.
 * If one already exists for this clientId, returns the existing record.
 */
export async function createOnboardingRecord(
  clientId: string,
  salesPrefill: SalesPrefillData,
  assignedAM: string
): Promise<AMOnboardingRecord> {
  // Check for existing
  const existing = await getOnboardingRecordByClientId(clientId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const fieldAssignments = buildInitialFieldAssignments(salesPrefill);

  if (assignedAM) {
    fieldAssignments["assignedAM"] = {
      fieldId: "assignedAM",
      status: "am-filled",
      value: assignedAM,
      assignedAt: now,
    };
  }

  const record: AMOnboardingRecord = {
    id: generateId(),
    clientId,
    status: "AM In Progress",
    statusOverride: null,
    salesPrefill,
    fieldAssignments,
    createdAt: now,
    updatedAt: now,
    projectId: null,
  };

  const res = await apiFetch("/api/onboarding-records", {
    method: "POST",
    body: JSON.stringify(record),
  });

  if (!res.ok) {
    throw new Error(`Failed to create onboarding record: ${await res.text()}`);
  }

  const data = (await res.json()) as { record: AMOnboardingRecord };
  return data.record;
}

/**
 * Replaces a record in the store (full upsert).
 */
export async function updateOnboardingRecord(
  updated: AMOnboardingRecord
): Promise<void> {
  await apiFetch("/api/onboarding-records", {
    method: "POST",
    body: JSON.stringify(updated),
  });
}

/**
 * Updates a single field assignment for a record.
 * Fetches the current record, applies the patch, derives new status, persists.
 */
export async function setFieldAssignment(
  recordId: string,
  fieldId: string,
  patch: Partial<FieldAssignment>
): Promise<AMOnboardingRecord | undefined> {
  const record = await getOnboardingRecordById(recordId);
  if (!record) return undefined;

  const existing = record.fieldAssignments[fieldId] ?? {
    fieldId,
    status: "unset" as FieldStatus,
    value: "",
    assignedAt: new Date().toISOString(),
  };

  const now = new Date().toISOString();
  const updated: FieldAssignment = {
    ...existing,
    ...patch,
    fieldId,
    assignedAt: now,
  };

  if (patch.status === "pending-client" && !updated.sentToClientAt) {
    updated.sentToClientAt = now;
  }

  const newAssignments = { ...record.fieldAssignments, [fieldId]: updated };
  const newRecord: AMOnboardingRecord = {
    ...record,
    fieldAssignments: newAssignments,
    status: deriveRecordStatus(record.status, newAssignments, record.statusOverride),
    updatedAt: now,
  };

  await apiFetch("/api/onboarding-records", {
    method: "POST",
    body: JSON.stringify(newRecord),
  });

  return newRecord;
}

export async function setFieldAmFilling(
  recordId: string,
  fieldId: string
): Promise<AMOnboardingRecord | undefined> {
  return setFieldAssignment(recordId, fieldId, { status: "am-filling" });
}

export async function saveFieldValue(
  recordId: string,
  fieldId: string,
  value: string
): Promise<AMOnboardingRecord | undefined> {
  return setFieldAssignment(recordId, fieldId, { status: "am-filled", value });
}

export async function markFieldPendingClient(
  recordId: string,
  fieldId: string
): Promise<AMOnboardingRecord | undefined> {
  const now = new Date().toISOString();
  return setFieldAssignment(recordId, fieldId, {
    status: "pending-client",
    sentToClientAt: now,
  });
}

export async function simulateClientResponse(
  recordId: string,
  fieldId: string,
  value: string
): Promise<AMOnboardingRecord | undefined> {
  const now = new Date().toISOString();
  return setFieldAssignment(recordId, fieldId, {
    status: "client-responded",
    value,
    clientRespondedAt: now,
  });
}

/**
 * Sets (or clears) a manual status override for a record.
 * When override is null, auto-derivation resumes on the next field mutation.
 */
export async function setStatusOverride(
  recordId: string,
  override: OnboardingIntakeStatus | null
): Promise<AMOnboardingRecord | undefined> {
  const record = await getOnboardingRecordById(recordId);
  if (!record) return undefined;

  const now = new Date().toISOString();
  // Recompute auto-derived status now (used only if clearing override)
  const autoStatus = deriveRecordStatus(record.status, record.fieldAssignments, null);
  const newRecord: AMOnboardingRecord = {
    ...record,
    statusOverride: override,
    // Use the override if set, otherwise revert to freshly-derived auto status
    status: override ?? autoStatus,
    updatedAt: now,
  };

  await apiFetch("/api/onboarding-records", {
    method: "POST",
    body: JSON.stringify(newRecord),
  });

  return newRecord;
}

/**
 * Bulk-transitions every field still in "unset" status to "pending-client".
 * Fields already in am-filled, am-filling, pending-client, or client-responded
 * are untouched. Returns the number of fields that were transitioned.
 */
export async function bulkMarkUnsetPendingClient(
  recordId: string
): Promise<{ transitionedCount: number }> {
  const record = await getOnboardingRecordById(recordId);
  if (!record) return { transitionedCount: 0 };

  const now = new Date().toISOString();
  const updated = { ...record.fieldAssignments };
  let count = 0;

  for (const key of Object.keys(updated)) {
    if (updated[key].status === "unset") {
      updated[key] = {
        ...updated[key],
        status: "pending-client",
        sentToClientAt: now,
        assignedAt: now,
      };
      count++;
    }
  }

  if (count === 0) return { transitionedCount: 0 };

  const newRecord: AMOnboardingRecord = {
    ...record,
    fieldAssignments: updated,
    status: deriveRecordStatus(record.status, updated, record.statusOverride),
    updatedAt: now,
  };

  await apiFetch("/api/onboarding-records", {
    method: "POST",
    body: JSON.stringify(newRecord),
  });

  return { transitionedCount: count };
}

/**
 * Marks an onboarding record as complete/closed.
 * Sets status = "Complete" and statusOverride = "Complete" so the status is
 * pinned and not re-derived by future field mutations.
 * Does NOT force any field transitions — field state is persisted as-is.
 */
export async function completeOnboardingRecord(
  recordId: string
): Promise<AMOnboardingRecord | undefined> {
  const record = await getOnboardingRecordById(recordId);
  if (!record) return undefined;

  const now = new Date().toISOString();
  const newRecord: AMOnboardingRecord = {
    ...record,
    status: "Complete",
    statusOverride: "Complete",
    updatedAt: now,
  };

  await apiFetch("/api/onboarding-records", {
    method: "POST",
    body: JSON.stringify(newRecord),
  });

  return newRecord;
}

export async function markSentToClient(id: string): Promise<void> {
  const record = await getOnboardingRecordById(id);
  if (!record) return;

  const now = new Date().toISOString();
  const updated = { ...record.fieldAssignments };
  for (const key of Object.keys(updated)) {
    if (updated[key].status === "pending-client") {
      updated[key] = { ...updated[key], sentToClientAt: now };
    }
  }

  const newRecord: AMOnboardingRecord = {
    ...record,
    fieldAssignments: updated,
    status: "Sent to Client",
    updatedAt: now,
  };

  await apiFetch("/api/onboarding-records", {
    method: "POST",
    body: JSON.stringify(newRecord),
  });
}

// ── Derived summary helpers (pure — no I/O) ───────────────────────────────────

export interface FieldAssignmentSummary {
  totalFields: number;
  amFilled: number;
  pendingClient: number;
  clientResponded: number;
  unset: number;
}

export function getFieldAssignmentSummary(
  record: AMOnboardingRecord
): FieldAssignmentSummary {
  const values = Object.values(record.fieldAssignments);
  return {
    totalFields: values.length,
    amFilled: values.filter(
      (a) => a.status === "am-filled" || a.status === "am-filling"
    ).length,
    pendingClient: values.filter((a) => a.status === "pending-client").length,
    clientResponded: values.filter((a) => a.status === "client-responded").length,
    unset: values.filter((a) => a.status === "unset").length,
  };
}

export function getPendingClientFields(
  record: AMOnboardingRecord
): FieldAssignment[] {
  return Object.values(record.fieldAssignments).filter(
    (a) => a.status === "pending-client"
  );
}

// ── Legacy compat: getLegacyAMSection (pure) ──────────────────────────────────

export function getLegacyAMSection(record: AMOnboardingRecord): AMSectionData {
  const get = (id: string) => record.fieldAssignments[id]?.value ?? "";
  return {
    assignedAM: get("assignedAM"),
    kickoffCallDate: get("kickoffCallDate"),
    preferredContactMethod: get("preferredContactMethod") || "Email",
    onboardingNotes: get("onboardingNotes"),
    serviceStartTargetDate: get("serviceStartTargetDate"),
    specialInstructions: get("specialInstructions"),
    accessCredentialsReceived: get("accessCredentialsReceived") === "true",
    contractTermMonths: get("contractTermMonths") || "12",
    internalPriority:
      (get("internalPriority") as "High" | "Medium" | "Low") || "Medium",
  };
}

// ── Field status display helper (pure) ───────────────────────────────────────

export function getFieldStatusMeta(status: FieldStatus): {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
} {
  const map: Record<
    FieldStatus,
    { label: string; color: string; bg: string; border: string; dot: string }
  > = {
    unset: { label: "Not set", color: "#94A3B8", bg: "#F8FAFC", border: "#E2E8F0", dot: "#CBD5E1" },
    "am-filling": { label: "AM editing", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6" },
    "am-filled": { label: "AM filled", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", dot: "#10B981" },
    "pending-client": { label: "Awaiting client", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" },
    "client-responded": { label: "Client responded", color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", dot: "#06B6D4" },
  };
  return map[status];
}
