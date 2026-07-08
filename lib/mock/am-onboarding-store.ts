// ─────────────────────────────────────────────────────────────────────────────
// lib/mock/am-onboarding-store.ts
//
// AM-local onboarding intake records.
// Each record is linked to MASTER_CLIENTS via clientId.
//
// COLLABORATIVE FORM MODEL (Phase 4+)
// ─────────────────────────────────────
// Every field in the onboarding form has its own FieldAssignment entry that
// tracks:
//   - whether the AM has filled it in ("am-filled")
//   - whether it's been sent to the client for completion ("pending-client")
//   - whether the client has responded ("client-responded")
//   - the current value (string | string[] | boolean)
//
// Field definitions live in lib/mock/am-onboarding-field-schema.ts.
// The form renders FROM that schema — no hardcoded field JSX.
//
// MIGRATION NOTE
// ───────────────
// Records created before this model are initialized with FieldAssignments
// derived from the old amSection / pendingClientFields blobs on first access.
// The old SalesPrefillData type is retained as-is (read-only Sales/Billing data).
//
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

/**
 * Per-field assignment status in the collaborative form.
 *
 * "unset"            — AM hasn't made a decision about this field yet
 * "am-filling"       — AM is filling this in directly
 * "am-filled"        — AM has filled in a value
 * "pending-client"   — AM has marked this field for the client to complete
 * "client-responded" — Client has provided a value (simulated)
 */
export type FieldStatus =
  | "unset"
  | "am-filling"
  | "am-filled"
  | "pending-client"
  | "client-responded";

// ── Core data types ───────────────────────────────────────────────────────────

export interface SalesPrefillData {
  // From MASTER_CLIENTS / Sales intake (read-only at record creation)
  clientName: string;
  email: string;
  industry: string;
  salesOwner: string;
  referralSource?: string;
  affiliateName?: string;
  activeServices: string[];   // billing source of truth
  monthlyValue: number;
  // From Sales intake record (if matched by businessName)
  primaryContact?: string;
  phone?: string;
  website?: string;
  location?: string;
  businessSize?: string;
  intakeSource?: string;
  selectedGoals?: string[];
  discoveryNotes?: string;
}

/**
 * A per-field assignment entry in the collaborative form.
 *
 * Every field from ONBOARDING_FIELD_SCHEMA has one entry here, keyed by field id.
 * AM either fills the field in ("am-filled") or marks it for client input
 * ("pending-client"). The value is stored here regardless of who filled it.
 */
export interface FieldAssignment {
  fieldId: string;
  status: FieldStatus;
  /** Stored value — string for most types, string[] for multiselect, boolean string "true"/"false" for checkbox */
  value: string;
  /** ISO timestamp of last status change */
  assignedAt: string;
  /** ISO timestamp when "pending-client" was set (for display) */
  sentToClientAt?: string;
  /** ISO timestamp when client responded (simulated) */
  clientRespondedAt?: string;
}

export interface AMOnboardingRecord {
  id: string;
  clientId: string;              // references MASTER_CLIENTS.id
  status: OnboardingIntakeStatus;
  salesPrefill: SalesPrefillData;

  /**
   * Per-field assignments — the heart of the collaborative form.
   * Key: field id from ONBOARDING_FIELD_SCHEMA
   * Value: FieldAssignment
   *
   * Initialized on record creation from the field schema's defaultAssignee,
   * pre-populating values from salesPrefill where a salesPrefillKey is defined.
   */
  fieldAssignments: Record<string, FieldAssignment>;

  createdAt: string;
  updatedAt: string;
  projectId: string | null;      // linked AMProject id once created
}

// ── Legacy types (kept for backward compat) ───────────────────────────────────
// These are no longer the source of truth for field values, but some callers
// may still reference AMSectionData / ClientPendingField for display purposes.
// They are derived from fieldAssignments on demand via getLegacyAMSection().

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

// ── Module-level store ─────────────────────────────────────────────────────────

const _records: AMOnboardingRecord[] = [];

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
    Draft: {
      color: "#64748B",
      bg: "#F8FAFC",
      border: "#E2E8F0",
      dot: "#94A3B8",
    },
    "AM In Progress": {
      color: "#2563EB",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      dot: "#3B82F6",
    },
    "Sent to Client": {
      color: "#B45309",
      bg: "#FFFBEB",
      border: "#FDE68A",
      dot: "#F59E0B",
    },
    "Client Responded": {
      color: "#0891B2",
      bg: "#ECFEFF",
      border: "#A5F3FC",
      dot: "#06B6D4",
    },
    "Ready for Kickoff": {
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      dot: "#10B981",
    },
    Complete: {
      color: "#065F46",
      bg: "#ECFDF5",
      border: "#6EE7B7",
      dot: "#34D399",
    },
  };
  return map[status];
}

// ── FieldAssignment initializer ───────────────────────────────────────────────

/**
 * Reads a value from salesPrefill for the given field definition, if a
 * salesPrefillKey mapping is defined on the field.
 */
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

/**
 * Builds the initial fieldAssignments map for a new record.
 * - Fields with defaultAssignee "am" that have a Sales prefill value start as
 *   "am-filled" (AM has the data from Sales handoff).
 * - Fields with defaultAssignee "am" without a prefill value start as "unset".
 * - Fields with defaultAssignee "client" start as "pending-client".
 */
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
      // defaultAssignee === "am"
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

// ── Store API ──────────────────────────────────────────────────────────────────

export function getAllOnboardingRecords(): AMOnboardingRecord[] {
  return _records;
}

export function getOnboardingRecordById(
  id: string
): AMOnboardingRecord | undefined {
  return _records.find((r) => r.id === id);
}

export function getOnboardingRecordByClientId(
  clientId: string
): AMOnboardingRecord | undefined {
  return _records.find((r) => r.clientId === clientId);
}

let _idCounter = 1;
function generateId(): string {
  return `onb-${Date.now()}-${_idCounter++}`;
}

/**
 * Creates a new onboarding record for the given client.
 * If one already exists for this clientId, returns the existing record.
 * Field assignments are initialized from the schema + salesPrefill data.
 */
export function createOnboardingRecord(
  clientId: string,
  salesPrefill: SalesPrefillData,
  assignedAM: string
): AMOnboardingRecord {
  const existing = getOnboardingRecordByClientId(clientId);
  if (existing) return existing;

  const now = new Date().toISOString();

  // Build field assignments from schema + prefill
  const fieldAssignments = buildInitialFieldAssignments(salesPrefill);

  // If an assignedAM was passed in, seed the assignedAM field
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
    salesPrefill,
    fieldAssignments,
    createdAt: now,
    updatedAt: now,
    projectId: null,
  };

  _records.push(record);
  return record;
}

/**
 * Replaces a record in the store.
 */
export function updateOnboardingRecord(updated: AMOnboardingRecord): void {
  const idx = _records.findIndex((r) => r.id === updated.id);
  if (idx !== -1) {
    _records[idx] = { ...updated, updatedAt: new Date().toISOString() };
  }
}

/**
 * Updates a single field assignment for a record.
 * Also recomputes overall record status.
 */
export function setFieldAssignment(
  recordId: string,
  fieldId: string,
  patch: Partial<FieldAssignment>
): void {
  const idx = _records.findIndex((r) => r.id === recordId);
  if (idx === -1) return;

  const record = _records[idx];
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
  _records[idx] = {
    ...record,
    fieldAssignments: newAssignments,
    status: deriveRecordStatus(record.status, newAssignments),
    updatedAt: now,
  };
}

/**
 * Marks a field as "am-filling" — AM has clicked "Fill it in" but hasn't
 * saved a value yet.
 */
export function setFieldAmFilling(recordId: string, fieldId: string): void {
  setFieldAssignment(recordId, fieldId, { status: "am-filling" });
}

/**
 * Saves a value for a field (AM-filled).
 */
export function saveFieldValue(
  recordId: string,
  fieldId: string,
  value: string
): void {
  setFieldAssignment(recordId, fieldId, {
    status: "am-filled",
    value,
  });
}

/**
 * Marks a field as "pending-client" (send to client).
 * Clears any draft AM value.
 */
export function markFieldPendingClient(
  recordId: string,
  fieldId: string
): void {
  const idx = _records.findIndex((r) => r.id === recordId);
  if (idx === -1) return;
  const now = new Date().toISOString();
  setFieldAssignment(recordId, fieldId, {
    status: "pending-client",
    sentToClientAt: now,
  });
}

/**
 * Simulates a client responding to a field (for demo/testing).
 */
export function simulateClientResponse(
  recordId: string,
  fieldId: string,
  value: string
): void {
  const now = new Date().toISOString();
  setFieldAssignment(recordId, fieldId, {
    status: "client-responded",
    value,
    clientRespondedAt: now,
  });
}

// ── Record status derivation ───────────────────────────────────────────────────

/**
 * Derives an overall record status from field assignment states.
 * Does not downgrade an already-advanced status (e.g. won't go back to Draft).
 */
function deriveRecordStatus(
  current: OnboardingIntakeStatus,
  assignments: Record<string, FieldAssignment>
): OnboardingIntakeStatus {
  const values = Object.values(assignments);

  const hasPendingClient = values.some((a) => a.status === "pending-client");
  const hasClientResponded = values.some(
    (a) => a.status === "client-responded"
  );
  const allResolved = values.every(
    (a) =>
      a.status === "am-filled" ||
      a.status === "client-responded" ||
      a.status === "unset" // unset/optional fields don't block
  );

  // Don't downgrade statuses set by explicit AM actions
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

// ── Derived summary helpers ───────────────────────────────────────────────────

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
    clientResponded: values.filter((a) => a.status === "client-responded")
      .length,
    unset: values.filter((a) => a.status === "unset").length,
  };
}

/**
 * Returns all field assignments with status "pending-client".
 */
export function getPendingClientFields(
  record: AMOnboardingRecord
): FieldAssignment[] {
  return Object.values(record.fieldAssignments).filter(
    (a) => a.status === "pending-client"
  );
}

// ── Legacy compat: markSentToClient ───────────────────────────────────────────
// Retained for any callers that haven't been updated yet.
// Marks ALL pending-client fields as having been sent.

export function markSentToClient(id: string): void {
  const idx = _records.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const now = new Date().toISOString();
  const record = _records[idx];
  const updated = { ...record.fieldAssignments };
  for (const key of Object.keys(updated)) {
    if (updated[key].status === "pending-client") {
      updated[key] = { ...updated[key], sentToClientAt: now };
    }
  }
  _records[idx] = {
    ...record,
    fieldAssignments: updated,
    status: "Sent to Client",
    updatedAt: now,
  };
}

// ── Legacy compat: getLegacyAMSection ─────────────────────────────────────────
// Derives an AMSectionData-shaped object from fieldAssignments for any code
// that still reads the old flat amSection shape. Remove once fully migrated.

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

// ── Status display helper ─────────────────────────────────────────────────────

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
    unset: {
      label: "Not set",
      color: "#94A3B8",
      bg: "#F8FAFC",
      border: "#E2E8F0",
      dot: "#CBD5E1",
    },
    "am-filling": {
      label: "AM editing",
      color: "#2563EB",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      dot: "#3B82F6",
    },
    "am-filled": {
      label: "AM filled",
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      dot: "#10B981",
    },
    "pending-client": {
      label: "Awaiting client",
      color: "#B45309",
      bg: "#FFFBEB",
      border: "#FDE68A",
      dot: "#F59E0B",
    },
    "client-responded": {
      label: "Client responded",
      color: "#0891B2",
      bg: "#ECFEFF",
      border: "#A5F3FC",
      dot: "#06B6D4",
    },
  };
  return map[status];
}

// ── Seed data ─────────────────────────────────────────────────────────────────
// Pre-seed onboarding records for clients whose master-clients.ts record
// already has onboardingRecordCreated:true. Without a real record object in
// this store, QueueClientRow renders the "View Onboarding" button but its
// onClick guard (existingRecord && ...) silently no-ops because
// getOnboardingRecordByClientId() returns undefined.
//
// IDs match the stable project seed IDs in am-projects-store.ts.
// Field assignments are seeded with the known AM-filled values from the
// Sales/Billing handoff data; fields requiring client input are left as
// "pending-client" (the default for defaultAssignee:"client" fields).

(function seedOnboardingRecords() {
  const mc004Fields: Record<string, FieldAssignment> = {
    assignedAM:             { fieldId: "assignedAM",             status: "am-filled",      value: "Alex R.",                          assignedAt: "2025-05-08T00:00:00.000Z" },
    clientName:             { fieldId: "clientName",             status: "am-filled",      value: "Blue Ridge Plumbing Co.",           assignedAt: "2025-05-08T00:00:00.000Z" },
    clientEmail:            { fieldId: "clientEmail",            status: "am-filled",      value: "tom@blueridgeplumbing.com",         assignedAt: "2025-05-08T00:00:00.000Z" },
    industry:               { fieldId: "industry",               status: "am-filled",      value: "Home Services – Plumbing",          assignedAt: "2025-05-08T00:00:00.000Z" },
    activeServices:         { fieldId: "activeServices",         status: "am-filled",      value: "SEO / GBP, Website Build",         assignedAt: "2025-05-08T00:00:00.000Z" },
    monthlyValue:           { fieldId: "monthlyValue",           status: "am-filled",      value: "1500",                            assignedAt: "2025-05-08T00:00:00.000Z" },
    preferredContactMethod: { fieldId: "preferredContactMethod", status: "am-filled",      value: "Email",                           assignedAt: "2025-05-08T00:00:00.000Z" },
    internalPriority:       { fieldId: "internalPriority",       status: "am-filled",      value: "Medium",                          assignedAt: "2025-05-08T00:00:00.000Z" },
    contractTermMonths:     { fieldId: "contractTermMonths",     status: "am-filled",      value: "12",                              assignedAt: "2025-05-08T00:00:00.000Z" },
    accessCredentialsReceived: { fieldId: "accessCredentialsReceived", status: "am-filled", value: "true",                          assignedAt: "2025-05-08T00:00:00.000Z" },
    onboardingNotes:        { fieldId: "onboardingNotes",        status: "am-filled",      value: "All access received on kickoff call. Website wireframes in progress.", assignedAt: "2025-05-08T00:00:00.000Z" },
    primaryContact:         { fieldId: "primaryContact",         status: "pending-client", value: "", assignedAt: "2025-05-08T00:00:00.000Z", sentToClientAt: "2025-05-08T00:00:00.000Z" },
    phone:                  { fieldId: "phone",                  status: "pending-client", value: "", assignedAt: "2025-05-08T00:00:00.000Z", sentToClientAt: "2025-05-08T00:00:00.000Z" },
    website:                { fieldId: "website",                status: "pending-client", value: "", assignedAt: "2025-05-08T00:00:00.000Z", sentToClientAt: "2025-05-08T00:00:00.000Z" },
    businessSize:           { fieldId: "businessSize",           status: "pending-client", value: "", assignedAt: "2026-07-09T00:00:00.000Z", sentToClientAt: "2026-07-09T00:00:00.000Z" },
    serviceStartTargetDate: { fieldId: "serviceStartTargetDate", status: "unset",          value: "", assignedAt: "2025-05-08T00:00:00.000Z" },
    specialInstructions:    { fieldId: "specialInstructions",    status: "unset",          value: "", assignedAt: "2025-05-08T00:00:00.000Z" },
    kickoffCallDate:        { fieldId: "kickoffCallDate",         status: "am-filled",      value: "2025-05-08",                      assignedAt: "2025-05-08T00:00:00.000Z" },
  };

  const mc011Fields: Record<string, FieldAssignment> = {
    assignedAM:             { fieldId: "assignedAM",             status: "am-filled",      value: "Alex R.",                          assignedAt: "2025-05-20T00:00:00.000Z" },
    clientName:             { fieldId: "clientName",             status: "am-filled",      value: "Ridgeline Construction LLC",        assignedAt: "2025-05-20T00:00:00.000Z" },
    clientEmail:            { fieldId: "clientEmail",            status: "am-filled",      value: "tony@ridgelineconstruction.com",   assignedAt: "2025-05-20T00:00:00.000Z" },
    industry:               { fieldId: "industry",               status: "am-filled",      value: "Construction",                    assignedAt: "2025-05-20T00:00:00.000Z" },
    activeServices:         { fieldId: "activeServices",         status: "am-filled",      value: "SEO / GBP",                       assignedAt: "2025-05-20T00:00:00.000Z" },
    monthlyValue:           { fieldId: "monthlyValue",           status: "am-filled",      value: "2800",                            assignedAt: "2025-05-20T00:00:00.000Z" },
    preferredContactMethod: { fieldId: "preferredContactMethod", status: "am-filled",      value: "Email",                           assignedAt: "2025-05-20T00:00:00.000Z" },
    internalPriority:       { fieldId: "internalPriority",       status: "am-filled",      value: "Medium",                          assignedAt: "2025-05-20T00:00:00.000Z" },
    contractTermMonths:     { fieldId: "contractTermMonths",     status: "am-filled",      value: "12",                              assignedAt: "2025-05-20T00:00:00.000Z" },
    accessCredentialsReceived: { fieldId: "accessCredentialsReceived", status: "am-filled", value: "false",                         assignedAt: "2025-05-20T00:00:00.000Z" },
    onboardingNotes:        { fieldId: "onboardingNotes",        status: "am-filled",      value: "Tasks assigned to SEO team. Waiting on client to share GBP access credentials.", assignedAt: "2025-05-20T00:00:00.000Z" },
    primaryContact:         { fieldId: "primaryContact",         status: "pending-client", value: "", assignedAt: "2025-05-20T00:00:00.000Z", sentToClientAt: "2025-05-20T00:00:00.000Z" },
    phone:                  { fieldId: "phone",                  status: "pending-client", value: "", assignedAt: "2025-05-20T00:00:00.000Z", sentToClientAt: "2025-05-20T00:00:00.000Z" },
    website:                { fieldId: "website",                status: "pending-client", value: "", assignedAt: "2025-05-20T00:00:00.000Z", sentToClientAt: "2025-05-20T00:00:00.000Z" },
    serviceStartTargetDate: { fieldId: "serviceStartTargetDate", status: "unset",          value: "", assignedAt: "2025-05-20T00:00:00.000Z" },
    specialInstructions:    { fieldId: "specialInstructions",    status: "unset",          value: "", assignedAt: "2025-05-20T00:00:00.000Z" },
    kickoffCallDate:        { fieldId: "kickoffCallDate",         status: "unset",          value: "", assignedAt: "2025-05-20T00:00:00.000Z" },
  };

  const seed: AMOnboardingRecord[] = [
    {
      id: "onb-seed-mc004",
      clientId: "mc004",
      status: "Ready for Kickoff",
      salesPrefill: {
        clientName:     "Blue Ridge Plumbing Co.",
        email:          "tom@blueridgeplumbing.com",
        industry:       "Home Services – Plumbing",
        salesOwner:     "Jake R.",
        activeServices: ["SEO / GBP", "Website Build"],
        monthlyValue:   1500,
      },
      fieldAssignments: mc004Fields,
      createdAt: "2025-05-08T00:00:00.000Z",
      updatedAt: "2025-05-28T00:00:00.000Z",
      projectId: "proj-am-mc004",
    },
    {
      id: "onb-seed-mc011",
      clientId: "mc011",
      status: "Sent to Client",
      salesPrefill: {
        clientName:     "Ridgeline Construction LLC",
        email:          "tony@ridgelineconstruction.com",
        industry:       "Construction",
        salesOwner:     "Marco T.",
        activeServices: ["SEO / GBP"],
        monthlyValue:   2800,
      },
      fieldAssignments: mc011Fields,
      createdAt: "2025-05-20T00:00:00.000Z",
      updatedAt: "2025-05-27T00:00:00.000Z",
      projectId: "proj-am-mc011",
    },
  ];

  for (const record of seed) {
    if (!_records.find((r) => r.clientId === record.clientId)) {
      _records.push(record);
    }
  }
})();
