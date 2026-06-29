// RTM OS — Sales Billing Handoff Configuration
// Configuration-driven. Zero business literals in UI components.
// All handoff checklist definitions, status values, required fields,
// and notification rules live here only.

// ─── Checklist Item IDs ───────────────────────────────────────────────────────

export type HandoffChecklistItemId =
  | "contract-signed"
  | "invoice-created"
  | "payment-terms-confirmed"
  | "services-verified"
  | "am-assigned"
  | "departments-notified"
  | "activation-record-created"
  | "billing-team-notified";

// ─── Handoff Status ───────────────────────────────────────────────────────────

export type HandoffActivationStatus =
  | "not-started"
  | "in-progress"
  | "ready"
  | "submitted"
  | "received"
  | "completed";

// ─── Checklist Item Status ────────────────────────────────────────────────────

export type HandoffChecklistItemStatus =
  | "pending"
  | "complete"
  | "blocked"
  | "not-applicable";

// ─── Checklist Item Definition ────────────────────────────────────────────────

export interface HandoffChecklistItemDef {
  id: HandoffChecklistItemId;
  label: string;
  description: string;
  required: boolean;
  autoCompletable: boolean;
  order: number;
  blockedBy?: HandoffChecklistItemId[];
}

// ─── Checklist ────────────────────────────────────────────────────────────────

export const HANDOFF_CHECKLIST: HandoffChecklistItemDef[] = [
  {
    id: "contract-signed",
    label: "Contract Signed",
    description: "Confirm the client has signed the contract.",
    required: true,
    autoCompletable: false,
    order: 1,
  },
  {
    id: "invoice-created",
    label: "Invoice Created",
    description: "Billing team creates the setup and first-month invoice.",
    required: true,
    autoCompletable: false,
    order: 2,
    blockedBy: ["contract-signed"],
  },
  {
    id: "payment-terms-confirmed",
    label: "Payment Terms Confirmed",
    description: "Payment terms from contract are confirmed in billing system.",
    required: true,
    autoCompletable: true,
    order: 3,
    blockedBy: ["contract-signed"],
  },
  {
    id: "services-verified",
    label: "Services Verified",
    description:
      "All services from the contract scope are verified against the billing record.",
    required: true,
    autoCompletable: true,
    order: 4,
    blockedBy: ["contract-signed"],
  },
  {
    id: "am-assigned",
    label: "Account Manager Assigned",
    description: "Account Manager is assigned to the client before activation.",
    required: true,
    autoCompletable: false,
    order: 5,
    blockedBy: ["contract-signed"],
  },
  {
    id: "departments-notified",
    label: "Departments Notified",
    description: "All fulfillment departments are notified of the incoming client.",
    required: true,
    autoCompletable: false,
    order: 6,
    blockedBy: ["am-assigned"],
  },
  {
    id: "activation-record-created",
    label: "Activation Record Created",
    description: "A formal activation record is created in the Billing workspace.",
    required: true,
    autoCompletable: false,
    order: 7,
    blockedBy: ["invoice-created", "am-assigned"],
  },
  {
    id: "billing-team-notified",
    label: "Billing Team Notified",
    description: "Billing team receives the completed handoff package.",
    required: true,
    autoCompletable: false,
    order: 8,
    blockedBy: ["activation-record-created"],
  },
];

// ─── Status Display Labels ────────────────────────────────────────────────────

export const HANDOFF_STATUS_LABELS: Record<HandoffActivationStatus, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  "ready": "Ready to Submit",
  "submitted": "Submitted",
  "received": "Received by Billing",
  "completed": "Completed",
};

// ─── Status Semantic Colors (tokens only) ─────────────────────────────────────

export const HANDOFF_STATUS_COLORS: Record<
  HandoffActivationStatus,
  { bg: string; color: string; border: string }
> = {
  "not-started": {
    bg: "#F8FAFC",
    color: "#64748B",
    border: "#E2E8F0",
  },
  "in-progress": {
    bg: "#EFF6FF",
    color: "#3B82F6",
    border: "#BFDBFE",
  },
  "ready": {
    bg: "#ECFDF5",
    color: "#059669",
    border: "#A7F3D0",
  },
  "submitted": {
    bg: "#F0F9FF",
    color: "#0369A1",
    border: "#BAE6FD",
  },
  "received": {
    bg: "#FFFBEB",
    color: "#B45309",
    border: "#FDE68A",
  },
  "completed": {
    bg: "#ECFDF5",
    color: "#065F46",
    border: "#6EE7B7",
  },
};

// ─── Summary Field Definition ─────────────────────────────────────────────────

export type HandoffSummaryFieldSource = "contract" | "budget" | "manual";

export interface HandoffSummaryFieldDef {
  id: string;
  label: string;
  description: string;
  required: boolean;
  source: HandoffSummaryFieldSource;
}

// ─── Summary Fields ───────────────────────────────────────────────────────────

export const HANDOFF_SUMMARY_FIELDS: HandoffSummaryFieldDef[] = [
  {
    id: "client-name",
    label: "Client Name",
    description: "Full legal name of the client.",
    required: true,
    source: "contract",
  },
  {
    id: "contract-number",
    label: "Contract Number",
    description: "Unique contract reference number.",
    required: true,
    source: "contract",
  },
  {
    id: "services-sold",
    label: "Services Sold",
    description: "All services included in the signed contract.",
    required: true,
    source: "contract",
  },
  {
    id: "monthly-recurring-revenue",
    label: "Monthly Recurring Revenue",
    description: "Total monthly recurring revenue from the contract.",
    required: true,
    source: "budget",
  },
  {
    id: "setup-fees",
    label: "Setup Fees",
    description: "Total one-time setup fees from the approved budget.",
    required: true,
    source: "budget",
  },
  {
    id: "payment-terms",
    label: "Payment Terms",
    description: "Agreed payment terms (e.g. Net 15, Net 30).",
    required: true,
    source: "contract",
  },
  {
    id: "term-length",
    label: "Term Length",
    description: "Contract duration in months.",
    required: true,
    source: "contract",
  },
  {
    id: "assigned-am",
    label: "Assigned Account Manager",
    description: "Account Manager assigned to this client.",
    required: true,
    source: "manual",
  },
  {
    id: "departments",
    label: "Fulfillment Departments",
    description: "All departments required to deliver the contracted services.",
    required: true,
    source: "contract",
  },
  {
    id: "special-instructions",
    label: "Special Instructions",
    description: "Any special instructions or notes for the Billing team.",
    required: false,
    source: "manual",
  },
];
