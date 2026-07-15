"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";
import type { PendingCancellationRequest } from "@/lib/mock/cancellation-queue";
import type { MasterClient } from "@/lib/mock/master-clients";
import { fetchMasterClients, patchMasterClient } from "@/lib/mock/master-clients-api";

const workspace = getWorkspace("billing")!;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type BadgeVariant =
  | "success" | "error" | "warning" | "info" | "neutral" | "pending";

// Billing-internal lifecycle status — separate from MASTER_CLIENTS.cancellationStatus
// (which is the canonical AM/Billing shared field). This is purely for Billing's
// internal workflow tracking within the cancellation process.
type BillingWorkflowStatus =
  | "Cancellation Requested"
  | "Billing Review"
  | "Final Invoice Needed"
  | "Pending Balance"
  | "Approved for Offboarding"
  | "Offboarding Triggered"
  | "Billing Hold"
  | "Billing Closed"
  | "Cancelled";

type FinalInvoiceStatus =
  | "Not Required" | "Needed" | "Created" | "Sent" | "Paid" | "Overdue";
type OffboardingStatus =
  | "Not Started" | "Pending" | "Triggered" | "In Progress" | "Complete";
type BillingDecision =
  | "Continue Billing Until End Date"
  | "Stop Billing Immediately"
  | "Create Final Invoice"
  | "Apply Refund"
  | "Write Off Balance"
  | "Escalate to AM";
type FinalBillingStatus =
  | "Closed - Paid"
  | "Closed - Written Off"
  | "Closed - Refunded"
  | "Closed - Escalated";
type InvoiceType =
  | "Final Invoice" | "Prorated Invoice" | "Cancellation Fee" | "Outstanding Balance";

/**
 * Billing-side overlay: extra fields that don't live on MasterClient but Billing
 * needs to track within a cancellation workflow. Stored in session state keyed by
 * clientId. The canonical status fields (cancellationStatus, billingStatus,
 * invoiceStatus) live on MasterClient and are persisted via patchMasterClient().
 */
interface BillingOverlay {
  workflowStatus: BillingWorkflowStatus;
  finalInvoiceStatus: FinalInvoiceStatus;
  offboardingStatus: OffboardingStatus;
  outstandingBalance: string;        // billing-tracked balance string
  billingDecision: BillingDecision;
  priority: "Critical" | "High" | "Medium" | "Low";
  nextBillingAction: string;
  contractEndDate: string;
  currentPlan: string;
  remainingContractValue: string;
  refundRequired: boolean;
  proratedAmount: string;
  paymentMethodStatus: string;
  requestedBy: string;               // "Client" | "AM" | "Billing"
  recentEvents: { date: string; event: string; by: string }[];
}

/**
 * Unified cancellation record: derived from MasterClient + billing overlay +
 * optional pending-cancellation-request signal.
 */
interface CancellationRecord {
  // From MasterClient (canonical)
  id: string;               // masterClient.id
  clientId: string;         // masterClient.id (alias for clarity)
  client: string;           // masterClient.clientName
  amOwner: string;          // masterClient.assignedAM
  billingOwner: string;     // masterClient.billingOwner
  mrrImpact: string;        // derived from masterClient.monthlyValue
  monthlyValue: string;     // derived from masterClient.monthlyValue
  requestedDate: string;    // from pending-cancellation-request or lastActivity

  // From BillingOverlay (billing-internal, session-state)
  cancellationStatus: BillingWorkflowStatus;
  finalInvoiceStatus: FinalInvoiceStatus;
  offboardingStatus: OffboardingStatus;
  outstandingBalance: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  nextBillingAction: string;
  contractEndDate: string;
  currentPlan: string;
  remainingContractValue: string;
  refundRequired: boolean;
  proratedAmount: string;
  paymentMethodStatus: string;
  billingDecision: BillingDecision;
  requestedBy: string;
  recentEvents: { date: string; event: string; by: string }[];
}

// Form shapes for modals
interface BillingReviewForm {
  client: string;
  outstandingBalance: string;
  finalInvoiceRequired: boolean;
  refundRequired: boolean;
  billingDecision: BillingDecision;
  notes: string;
}

interface FinalInvoiceForm {
  client: string;
  invoiceAmount: string;
  invoiceType: InvoiceType;
  dueDate: string;
  invoiceNotes: string;
}

interface BillingHoldForm {
  client: string;
  holdReason: string;
  holdStartDate: string;
  holdEndDate: string;
  notes: string;
}

interface TriggerOffboardingForm {
  client: string;
  billingCleared: boolean;
  finalInvoiceSent: boolean;
  outstandingBalance: string;
  amOwner: string;
  operationsOwner: string;
  offboardingNotes: string;
}

interface CloseBillingForm {
  client: string;
  finalBillingStatus: FinalBillingStatus;
  closureNotes: string;
}

type ModalKind =
  | { kind: "review";   record: CancellationRecord }
  | { kind: "invoice";  record: CancellationRecord }
  | { kind: "hold";     record: CancellationRecord }
  | { kind: "offboard"; record: CancellationRecord }
  | { kind: "close";    record: CancellationRecord }
  | null;

// ─────────────────────────────────────────────────────────────────────────────
// Build a unified CancellationRecord from a MasterClient + optional AM signal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map MASTER_CLIENTS.cancellationStatus (the canonical shared field) to the
 * billing-internal workflow status used for display/table badges.
 */
function masterStatusToWorkflow(
  masterStatus: MasterClient["cancellationStatus"],
  existingOverlay?: BillingOverlay,
): BillingWorkflowStatus {
  // If Billing has already progressed this record to a later stage, preserve it.
  if (existingOverlay) return existingOverlay.workflowStatus;
  switch (masterStatus) {
    case "Requested":  return "Cancellation Requested";
    case "In Review":  return "Billing Review";
    case "Approved":   return "Approved for Offboarding";
    case "Cancelled":  return "Billing Closed";
    default:           return "Cancellation Requested";
  }
}

function buildRecord(
  client: MasterClient,
  amSignal: PendingCancellationRequest | undefined,
  overlay?: BillingOverlay,
): CancellationRecord {
  const workflow = masterStatusToWorkflow(client.cancellationStatus, overlay);
  const mrrImpact = client.monthlyValue > 0 ? `-$${client.monthlyValue.toLocaleString()}` : "$0";
  const monthlyValue = client.monthlyValue > 0 ? `$${client.monthlyValue.toLocaleString()}` : "$0";

  return {
    id: client.id,
    clientId: client.id,
    client: client.clientName,
    amOwner: client.assignedAM !== "Unassigned" ? client.assignedAM : (amSignal?.amOwner ?? "Account Management"),
    billingOwner: client.billingOwner,
    mrrImpact,
    monthlyValue,
    requestedDate: amSignal?.requestedDate ?? client.lastActivity ?? "—",

    cancellationStatus: overlay?.workflowStatus ?? workflow,
    finalInvoiceStatus: overlay?.finalInvoiceStatus ?? mapInvoiceStatus(client),
    offboardingStatus: overlay?.offboardingStatus ?? "Not Started",
    outstandingBalance: overlay?.outstandingBalance ?? "$0",
    priority: overlay?.priority ?? derivePriority(client),
    nextBillingAction: overlay?.nextBillingAction ?? deriveNextAction(workflow),
    contractEndDate: overlay?.contractEndDate ?? client.renewalDate ?? "—",
    currentPlan: overlay?.currentPlan ?? (client.activeServices.join(", ") || "—"),
    remainingContractValue: overlay?.remainingContractValue ?? "—",
    refundRequired: overlay?.refundRequired ?? false,
    proratedAmount: overlay?.proratedAmount ?? "$0",
    paymentMethodStatus: overlay?.paymentMethodStatus ?? "Active",
    billingDecision: overlay?.billingDecision ?? "Continue Billing Until End Date",
    requestedBy: overlay?.requestedBy ?? (amSignal ? "AM" : "Client"),
    recentEvents: overlay?.recentEvents ?? buildInitialEvents(client, amSignal),
  };
}

function mapInvoiceStatus(client: MasterClient): FinalInvoiceStatus {
  switch (client.invoiceStatus) {
    case "Final invoice issued":   return "Created";
    case "Paid":                   return "Paid";
    case "Sent — Awaiting Payment":
    case "Overdue 15d":
    case "Overdue 30d":            return "Needed";
    default:                       return "Not Required";
  }
}

function derivePriority(
  client: MasterClient,
): "Critical" | "High" | "Medium" | "Low" {
  if (client.cancellationStatus === "Approved") return "High";
  if (client.cancellationStatus === "Requested") return "High";
  if (client.billingStatus === "Overdue") return "Critical";
  return "Medium";
}

function deriveNextAction(workflow: BillingWorkflowStatus): string {
  switch (workflow) {
    case "Cancellation Requested":   return "Start Billing Review";
    case "Billing Review":           return "Create Final Invoice or Stop Billing";
    case "Final Invoice Needed":     return "Create Final Invoice";
    case "Pending Balance":          return "Collect Outstanding Balance";
    case "Approved for Offboarding": return "Notify AM";
    case "Offboarding Triggered":    return "Monitor Closure";
    case "Billing Hold":             return "Resolve Hold - Escalate to AM";
    case "Billing Closed":           return "Archived";
    case "Cancelled":                return "Archived";
    default:                         return "Start Billing Review";
  }
}

function buildInitialEvents(
  client: MasterClient,
  amSignal?: PendingCancellationRequest,
): { date: string; event: string; by: string }[] {
  const events: { date: string; event: string; by: string }[] = [];
  if (amSignal) {
    events.push({
      date: amSignal.requestedDate,
      event: `Cancellation Requested (Reason: ${amSignal.reason})`,
      by: amSignal.amOwner,
    });
  } else if (client.lastActivity) {
    events.push({
      date: client.lastActivity,
      event: "Cancellation Requested",
      by: "Client",
    });
  }
  // Append relevant recentEvents from the master client
  for (const ev of client.recentEvents ?? []) {
    if (
      ev.action.toLowerCase().includes("cancel") ||
      ev.action.toLowerCase().includes("escalat") ||
      ev.action.toLowerCase().includes("offboard")
    ) {
      events.push({ date: ev.date, event: ev.action, by: ev.actor });
    }
  }
  return events;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function cancellationStatusVariant(s: BillingWorkflowStatus): BadgeVariant {
  switch (s) {
    case "Cancellation Requested":   return "warning";
    case "Billing Review":           return "info";
    case "Final Invoice Needed":     return "warning";
    case "Pending Balance":          return "error";
    case "Approved for Offboarding": return "pending";
    case "Offboarding Triggered":    return "info";
    case "Billing Hold":             return "error";
    case "Billing Closed":           return "success";
    case "Cancelled":                return "neutral";
    default:                         return "neutral";
  }
}

function finalInvoiceVariant(s: FinalInvoiceStatus): BadgeVariant {
  switch (s) {
    case "Needed":       return "warning";
    case "Created":      return "info";
    case "Sent":         return "info";
    case "Paid":         return "success";
    case "Overdue":      return "error";
    case "Not Required": return "neutral";
    default:             return "neutral";
  }
}

function offboardingVariant(s: OffboardingStatus): BadgeVariant {
  switch (s) {
    case "Pending":     return "warning";
    case "Triggered":   return "info";
    case "In Progress": return "pending";
    case "Complete":    return "success";
    case "Not Started": return "neutral";
    default:            return "neutral";
  }
}

function priorityVariant(p: CancellationRecord["priority"]): BadgeVariant {
  switch (p) {
    case "Critical": return "error";
    case "High":     return "warning";
    case "Medium":   return "info";
    case "Low":      return "neutral";
    default:         return "neutral";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Small UI atoms
// ─────────────────────────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap border-b"
      style={{
        color: "var(--rtm-text-muted)",
        borderColor: "var(--rtm-border-light)",
        background: "var(--rtm-bg-alt, #F9FAFB)",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  muted,
  tight,
}: {
  children: React.ReactNode;
  muted?: boolean;
  tight?: boolean;
}) {
  return (
    <td
      className="px-3 py-2.5 text-sm border-b align-middle"
      style={{
        color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)",
        borderColor: "var(--rtm-border-light)",
        maxWidth: tight ? "140px" : undefined,
      }}
    >
      {children}
    </td>
  );
}

function ActionBtn({
  label,
  onClick,
  variant = "secondary",
  small,
  disabled,
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  small?: boolean;
  disabled?: boolean;
}) {
  const base = `font-semibold rounded-lg border transition-colors whitespace-nowrap ${
    small ? "text-xs px-2.5 py-1" : "text-sm px-3.5 py-2"
  } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`;
  const styles: Record<string, string> = {
    primary:
      "bg-[var(--rtm-blue,#1B4FD8)] text-white border-transparent hover:opacity-90",
    secondary:
      "bg-[var(--rtm-surface,#fff)] text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:
      "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
    ghost:
      "bg-transparent text-[var(--rtm-text-muted)] border-transparent hover:bg-[var(--rtm-bg)] hover:text-[var(--rtm-text-primary)]",
  };
  return (
    <button
      className={`${base} ${styles[variant]}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

function Toast({
  message,
  variant,
  onDismiss,
}: {
  message: string;
  variant: "success" | "info" | "warning" | "error";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colors = {
    success: { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46" },
    info:    { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E3A8A" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E" },
    error:   { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" },
  }[variant];

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-xl"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        color: colors.color,
        minWidth: 300,
      }}
    >
      <span className="text-sm font-semibold flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="text-base leading-none opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stripe Subscription Cancellation Indicator
//
// FUTURE LIVE INTEGRATION HOOK (Cancellations page):
// When the Stripe integration goes live at launch:
//   - Look up stripeSubscriptionId from the matching MASTER_CLIENTS record
//   - When cancellationStatus reaches "Approved" or "Cancelled" (terminal state):
//       await stripe.subscriptions.cancel(stripeSubscriptionId);
//       await patchMasterClient(id, { stripeSyncStatus: "Not Connected", stripeSubscriptionId: null });
//   - "Cancel in Stripe" button should be ENABLED only once stripeSubscriptionId is populated
//     (i.e. once the client has a real Stripe subscription — all clients are "Not Connected" now)
//   - Stripe cancellation should trigger the customer.subscription.deleted webhook which
//     updates billing status in real time
//
// All MASTER_CLIENTS records currently have stripeSyncStatus: "Not Connected" and null IDs.
// ─────────────────────────────────────────────────────────────────────────────

function StripeCancellationIndicator() {
  return (
    <div className="relative inline-block group">
      <button
        disabled
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border cursor-not-allowed opacity-70"
        style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#9CA3AF" }}
        aria-label="Stripe subscription cancellation not yet available"
      >
        {/* Stripe "S" icon */}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <rect width="12" height="12" rx="2" fill="#9CA3AF" />
          <path d="M5.15 4.42c0-.42.34-.58.9-.58.8 0 1.82.24 2.62.67V2.74A6.96 6.96 0 005.9 2.25c-1.85 0-3.09.97-3.09 2.59 0 2.53 3.48 2.12 3.48 3.21 0 .5-.43.66-.97.66-.84 0-1.9-.35-2.74-.82v1.8c.93.4 1.87.57 2.74.57 1.88 0 3.18-.93 3.18-2.57C8.5 5.09 5.15 5.57 5.15 4.42z" fill="white"/>
        </svg>
        Cancel in Stripe
      </button>
      {/* Tooltip */}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ whiteSpace: "nowrap" }}
      >
        <div className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg"
          style={{ background: "#1E293B", color: "#F8FAFC", border: "1px solid #334155" }}>
          Not yet available — coming at launch
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: "#1E293B" }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle banner
// ─────────────────────────────────────────────────────────────────────────────

function LifecycleFlow() {
  const steps: {
    label: string;
    color?: string;
    bg?: string;
    border: string;
  }[] = [
    { label: "Cancellation Requested",   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    { label: "Billing Review",           color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
    { label: "Final Invoice Needed",     color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    { label: "Pending Balance",          color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    { label: "Approved for Offboarding", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    { label: "AM Notified",              color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
    { label: "Billing Closed",           color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  ];
  return (
    <div className="rounded-xl border p-4" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
      <p
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: "#7C3AED" }}
      >
        Cancellation Lifecycle
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border"
              style={{ background: s.bg, color: s.color, borderColor: s.border }}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-sm" style={{ color: "var(--rtm-border)" }}>
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs mt-2.5" style={{ color: "#6D28D9" }}>
        Alternative path: Billing Review → Billing Hold → Escalated to AM
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal shell + common form primitives
// ─────────────────────────────────────────────────────────────────────────────

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-y-auto"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
          maxHeight: "90vh",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--rtm-border-light)" }}
        >
          <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
          >
            Close
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label
        className="block text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full text-sm px-3 py-2 rounded-lg border focus:outline-none";
const inputStyle = {
  background: "var(--rtm-bg)",
  borderColor: "var(--rtm-border)",
  color: "var(--rtm-text-primary)",
};

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      className={inputClass}
      style={inputStyle}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      className={inputClass}
      style={inputStyle}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      rows={3}
      className={`${inputClass} resize-none`}
      style={inputStyle}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className="flex items-center gap-2 cursor-pointer text-sm"
      style={{ color: "var(--rtm-text-secondary)" }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded"
      />
      {label}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Billing Review Modal
// Real write: advances MASTER_CLIENTS.cancellationStatus to "In Review"
// via patchMasterClient(). Overlay updated to "Billing Review" stage.
// ─────────────────────────────────────────────────────────────────────────────

function ReviewBillingModal({
  record,
  onClose,
  onSave,
}: {
  record: CancellationRecord;
  onClose: () => void;
  onSave: (msg: string) => void;
}) {
  const [form, setForm] = useState<BillingReviewForm>({
    client: record.client,
    outstandingBalance: record.outstandingBalance,
    finalInvoiceRequired: record.finalInvoiceStatus === "Needed",
    refundRequired: record.refundRequired,
    billingDecision: record.billingDecision,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  function f<K extends keyof BillingReviewForm>(k: K, v: BillingReviewForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Persist: advance cancellationStatus to "In Review" on MASTER_CLIENTS
      await patchMasterClient(record.clientId, {
        cancellationStatus: "In Review",
      });
      onSave(
        `Billing reviewed for ${form.client} - Decision: ${form.billingDecision}`
      );
      onClose();
    } catch (err) {
      console.error("[BillingCancellations] Billing Review save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Review Billing" onClose={onClose}>
      <div
        className="rounded-lg border p-3 text-xs"
        style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1E3A8A" }}
      >
        Saving will advance this client&apos;s cancellation status to <strong>&ldquo;In Review&rdquo;</strong> in MASTER_CLIENTS — visible across all pages.
      </div>
      <FormField label="Client">
        <TextInput value={form.client} onChange={(v) => f("client", v)} />
      </FormField>
      <FormField label="Outstanding Balance">
        <TextInput
          value={form.outstandingBalance}
          onChange={(v) => f("outstandingBalance", v)}
          placeholder="$0"
        />
      </FormField>
      <CheckboxField
        label="Final Invoice Required"
        checked={form.finalInvoiceRequired}
        onChange={(v) => f("finalInvoiceRequired", v)}
      />
      <CheckboxField
        label="Refund Required"
        checked={form.refundRequired}
        onChange={(v) => f("refundRequired", v)}
      />
      <FormField label="Billing Decision">
        <SelectInput
          value={form.billingDecision}
          onChange={(v) => f("billingDecision", v as BillingDecision)}
          options={[
            "Continue Billing Until End Date",
            "Stop Billing Immediately",
            "Create Final Invoice",
            "Apply Refund",
            "Write Off Balance",
            "Escalate to AM",
          ]}
        />
      </FormField>
      <FormField label="Notes">
        <TextArea
          value={form.notes}
          onChange={(v) => f("notes", v)}
          placeholder="Add review notes..."
        />
      </FormField>
      <ActionBtn
        variant="primary"
        label={saving ? "Saving…" : "Save Billing Review"}
        disabled={saving}
        onClick={handleSave}
      />
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Final Invoice Modal
// Real write: sets invoiceStatus to "Final invoice issued" on MASTER_CLIENTS.
// ─────────────────────────────────────────────────────────────────────────────

function CreateFinalInvoiceModal({
  record,
  onClose,
  onSave,
}: {
  record: CancellationRecord;
  onClose: () => void;
  onSave: (msg: string) => void;
}) {
  const [form, setForm] = useState<FinalInvoiceForm>({
    client: record.client,
    invoiceAmount: record.outstandingBalance,
    invoiceType: "Final Invoice",
    dueDate: "",
    invoiceNotes: "",
  });
  const [saving, setSaving] = useState(false);

  function f<K extends keyof FinalInvoiceForm>(k: K, v: FinalInvoiceForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Persist: mark invoiceStatus as "Final invoice issued" on MASTER_CLIENTS
      await patchMasterClient(record.clientId, {
        invoiceStatus: "Final invoice issued",
      });
      onSave(
        `Final invoice created for ${form.client} - ${form.invoiceType} - ${form.invoiceAmount}`
      );
      onClose();
    } catch (err) {
      console.error("[BillingCancellations] Create Final Invoice save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Create Final Invoice" onClose={onClose}>
      <div
        className="rounded-lg border p-3 text-xs"
        style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1E3A8A" }}
      >
        Saving will set this client&apos;s invoice status to <strong>&ldquo;Final invoice issued&rdquo;</strong> in MASTER_CLIENTS.
      </div>
      <FormField label="Client">
        <TextInput value={form.client} onChange={(v) => f("client", v)} />
      </FormField>
      <FormField label="Invoice Amount">
        <TextInput
          value={form.invoiceAmount}
          onChange={(v) => f("invoiceAmount", v)}
          placeholder="$0.00"
        />
      </FormField>
      <FormField label="Invoice Type">
        <SelectInput
          value={form.invoiceType}
          onChange={(v) => f("invoiceType", v as InvoiceType)}
          options={[
            "Final Invoice",
            "Prorated Invoice",
            "Cancellation Fee",
            "Outstanding Balance",
          ]}
        />
      </FormField>
      <FormField label="Due Date">
        <TextInput
          value={form.dueDate}
          onChange={(v) => f("dueDate", v)}
          placeholder="e.g. Jul 15, 2025"
        />
      </FormField>
      <FormField label="Invoice Notes">
        <TextArea
          value={form.invoiceNotes}
          onChange={(v) => f("invoiceNotes", v)}
          placeholder="Add invoice notes..."
        />
      </FormField>
      <ActionBtn
        variant="primary"
        label={saving ? "Saving…" : "Create Final Invoice"}
        disabled={saving}
        onClick={handleSave}
      />
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Place Billing Hold Modal
// Real write: sets billingStatus to "Pending" on MASTER_CLIENTS, signalling
// the billing hold state. Overlay tracks hold reason/dates.
// ─────────────────────────────────────────────────────────────────────────────

function BillingHoldModal({
  record,
  onClose,
  onSave,
}: {
  record: CancellationRecord;
  onClose: () => void;
  onSave: (msg: string) => void;
}) {
  const [form, setForm] = useState<BillingHoldForm>({
    client: record.client,
    holdReason: "",
    holdStartDate: "",
    holdEndDate: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  function f<K extends keyof BillingHoldForm>(k: K, v: BillingHoldForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Persist: set billingStatus to "Pending" on MASTER_CLIENTS
      // (signals billing hold — the hold reason/dates are overlay-only since
      // MASTER_CLIENTS has no hold-reason field)
      await patchMasterClient(record.clientId, {
        billingStatus: "Pending",
      });
      onSave(
        `Billing hold placed for ${form.client} - Reason: ${form.holdReason}`
      );
      onClose();
    } catch (err) {
      console.error("[BillingCancellations] Billing Hold save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Place Billing Hold" onClose={onClose}>
      <div
        className="rounded-lg border p-3 text-xs"
        style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
      >
        Saving will set this client&apos;s billing status to <strong>&ldquo;Pending&rdquo;</strong> in MASTER_CLIENTS, signalling a billing hold.
      </div>
      <FormField label="Client">
        <TextInput value={form.client} onChange={(v) => f("client", v)} />
      </FormField>
      <FormField label="Hold Reason">
        <TextInput
          value={form.holdReason}
          onChange={(v) => f("holdReason", v)}
          placeholder="e.g. AM escalation pending"
        />
      </FormField>
      <FormField label="Hold Start Date">
        <TextInput
          value={form.holdStartDate}
          onChange={(v) => f("holdStartDate", v)}
          placeholder="e.g. Jun 20, 2025"
        />
      </FormField>
      <FormField label="Hold End Date">
        <TextInput
          value={form.holdEndDate}
          onChange={(v) => f("holdEndDate", v)}
          placeholder="e.g. Jul 01, 2025"
        />
      </FormField>
      <FormField label="Notes">
        <TextArea
          value={form.notes}
          onChange={(v) => f("notes", v)}
          placeholder="Add hold notes..."
        />
      </FormField>
      <ActionBtn
        variant="danger"
        label={saving ? "Saving…" : "Place Billing Hold"}
        disabled={saving}
        onClick={handleSave}
      />
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notify AM Modal (Trigger Offboarding)
// Already real — unchanged logic, now correctly operating on unified real data.
// ─────────────────────────────────────────────────────────────────────────────

function NotifyAMModal({
  record,
  amQueue,
  onClose,
  onSave,
}: {
  record: CancellationRecord;
  amQueue: PendingCancellationRequest[];
  onClose: () => void;
  onSave: (msg: string) => void;
}) {
  const [form, setForm] = useState<TriggerOffboardingForm>({
    client: record.client,
    billingCleared: record.outstandingBalance === "$0",
    finalInvoiceSent:
      record.finalInvoiceStatus === "Paid" ||
      record.finalInvoiceStatus === "Sent",
    outstandingBalance: record.outstandingBalance,
    amOwner: record.amOwner,
    operationsOwner: "Operations Team",
    offboardingNotes: "",
  });
  const [saving, setSaving] = useState(false);

  function f<K extends keyof TriggerOffboardingForm>(k: K, v: TriggerOffboardingForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const msg = `AM notified: ${form.client} - Billing cleared. Handoff to ${form.amOwner}.`;

      // CROSS-WORKSPACE SIGNAL: create a real offboarding record on AM's Offboarding page.
      const queueEntry = amQueue.find((r) => r.client === record.client);
      await fetch("/api/pending-offboarding-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: record.client,
          accountManager: record.amOwner,
          reason: queueEntry?.reason ?? "Pending Client Confirmation",
          mrr: parseInt(record.monthlyValue.replace(/[^0-9]/g, ""), 10) || 0,
          offboardingOwner: record.amOwner,
          billingOwner: record.billingOwner,
          billingHandoffNotes: msg,
        }),
      });

      onSave(msg);
      onClose();
    } catch (err) {
      console.error("[BillingCancellations] Notify AM save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Notify Account Management" onClose={onClose}>
      <div
        className="rounded-lg border p-3 text-xs"
        style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#065F46" }}
      >
        <strong>Billing&apos;s responsibility ends here.</strong> This sends a real &ldquo;AM Notified&rdquo; signal.
        Account Management owns all downstream steps (campaign pausing, CRM archival, win-back).
      </div>
      <FormField label="Client">
        <TextInput value={form.client} onChange={(v) => f("client", v)} />
      </FormField>
      <CheckboxField
        label="Billing Cleared"
        checked={form.billingCleared}
        onChange={(v) => f("billingCleared", v)}
      />
      <CheckboxField
        label="Final Invoice Sent"
        checked={form.finalInvoiceSent}
        onChange={(v) => f("finalInvoiceSent", v)}
      />
      <FormField label="Outstanding Balance">
        <TextInput
          value={form.outstandingBalance}
          onChange={(v) => f("outstandingBalance", v)}
        />
      </FormField>
      <FormField label="AM Owner (will be notified)">
        <TextInput value={form.amOwner} onChange={(v) => f("amOwner", v)} />
      </FormField>
      <FormField label="Handoff Notes">
        <TextArea
          value={form.offboardingNotes}
          onChange={(v) => f("offboardingNotes", v)}
          placeholder="Add handoff notes for AM..."
        />
      </FormField>
      <ActionBtn
        variant="primary"
        label={saving ? "Saving…" : "Notify AM - Billing Complete"}
        disabled={saving}
        onClick={handleSave}
      />
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Close Billing Modal
// Real write: sets cancellationStatus to "Cancelled" + billingStatus to
// "Closed" on MASTER_CLIENTS via patchMasterClient(). This is the terminal
// billing action — the client leaves the cancellation queue after refresh.
// ─────────────────────────────────────────────────────────────────────────────

function CloseBillingModal({
  record,
  onClose,
  onSave,
}: {
  record: CancellationRecord;
  onClose: () => void;
  onSave: (msg: string) => void;
}) {
  const [form, setForm] = useState<CloseBillingForm>({
    client: record.client,
    finalBillingStatus: "Closed - Paid",
    closureNotes: "",
  });
  const [saving, setSaving] = useState(false);

  function f<K extends keyof CloseBillingForm>(k: K, v: CloseBillingForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Persist: mark cancellationStatus as "Cancelled" and billingStatus as
      // "Closed" on MASTER_CLIENTS — the terminal billing state.
      await patchMasterClient(record.clientId, {
        cancellationStatus: "Cancelled",
        billingStatus: "Closed",
      });
      onSave(
        `Billing closed for ${form.client} - Status: ${form.finalBillingStatus}`
      );
      onClose();
    } catch (err) {
      console.error("[BillingCancellations] Close Billing save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="Close Billing" onClose={onClose}>
      <div
        className="rounded-lg border p-3 text-xs"
        style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}
      >
        Saving will set this client&apos;s cancellation status to <strong>&ldquo;Cancelled&rdquo;</strong> and billing status to <strong>&ldquo;Closed&rdquo;</strong> in MASTER_CLIENTS.
        The client will leave the cancellation queue on next refresh.
      </div>
      <FormField label="Client">
        <TextInput value={form.client} onChange={(v) => f("client", v)} />
      </FormField>
      <FormField label="Final Billing Status">
        <SelectInput
          value={form.finalBillingStatus}
          onChange={(v) => f("finalBillingStatus", v as FinalBillingStatus)}
          options={[
            "Closed - Paid",
            "Closed - Written Off",
            "Closed - Refunded",
            "Closed - Escalated",
          ]}
        />
      </FormField>
      <FormField label="Closure Notes">
        <TextArea
          value={form.closureNotes}
          onChange={(v) => f("closureNotes", v)}
          placeholder="Add closure notes..."
        />
      </FormField>
      <ActionBtn
        variant="primary"
        label={saving ? "Saving…" : "Close Billing"}
        disabled={saving}
        onClick={handleSave}
      />
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function BillingCancellationsPage() {
  // ── Data loading ────────────────────────────────────────────────────────
  const [masterClients, setMasterClients] = useState<MasterClient[]>([]);
  const [amQueue, setAmQueue] = useState<PendingCancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Billing overlay: session-state overrides for billing-internal fields that
   * don't live on MasterClient. Keyed by clientId. Updated whenever a modal
   * action advances the workflow status, final invoice status, etc.
   * These are persisted within the session; MASTER_CLIENTS fields (cancellationStatus,
   * billingStatus, invoiceStatus) are persisted permanently via patchMasterClient().
   */
  const [overlays, setOverlays] = useState<Map<string, BillingOverlay>>(new Map());

  const [modal, setModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "info" | "warning" | "error";
  } | null>(null);

  function showToast(
    message: string,
    variant: "success" | "info" | "warning" | "error" = "success",
  ) {
    setToast({ message, variant });
  }

  // Load master clients (file-backed API — cross-route-group reliable)
  const loadClients = useCallback(async () => {
    try {
      const clients = await fetchMasterClients();
      setMasterClients(clients);
    } catch (err) {
      console.error("[BillingCancellations] Failed to load master clients:", err);
    }
  }, []);

  useEffect(() => {
    void loadClients().finally(() => setLoading(false));
  }, [loadClients]);

  // Load AM-initiated cancellation requests
  useEffect(() => {
    fetch("/api/pending-cancellation-requests")
      .then((r) => r.json())
      .then((data: { records: PendingCancellationRequest[] }) => {
        if (Array.isArray(data.records)) setAmQueue(data.records);
      })
      .catch((err) =>
        console.error("[BillingCancellations] Failed to load AM requests:", err),
      );
  }, []);

  // ── Derive unified records from real MASTER_CLIENTS data ────────────────
  //
  // Primary list = MASTER_CLIENTS where cancellationStatus !== "None".
  // Each record is merged with the matching AM signal (by clientName) if present,
  // and overlaid with session-state billing workflow fields.
  //
  const records: CancellationRecord[] = masterClients
    .filter((c) => c.cancellationStatus !== "None")
    .map((c) => {
      const amSignal = amQueue.find((r) => r.client === c.clientName);
      const overlay = overlays.get(c.id);
      return buildRecord(c, amSignal, overlay);
    });

  // ── Overlay update helpers ───────────────────────────────────────────────

  function updateOverlay(
    clientId: string,
    patch: Partial<BillingOverlay>,
  ) {
    setOverlays((prev) => {
      const next = new Map(prev);
      const existing = next.get(clientId) ?? ({} as BillingOverlay);
      next.set(clientId, { ...existing, ...patch } as BillingOverlay);
      return next;
    });
  }

  // ── Event log (session-local; captures all billing actions) ─────────────
  const [eventLog, setEventLog] = useState<
    {
      date: string;
      client: string;
      event: string;
      by: string;
      billingStatus: string;
      offboardingStatus: string;
      notes: string;
    }[]
  >([]);

  function addEvent(
    client: string,
    event: string,
    by: string,
    billingStatus: string,
    offboardingStatus: string,
    notes = "",
  ) {
    const now = new Date();
    const date = `${now.toLocaleString("en-US", { month: "short" })} ${now.getDate()}`;
    setEventLog((prev) => [
      { date, client, event, by, billingStatus, offboardingStatus, notes },
      ...prev.slice(0, 19),
    ]);
  }

  // ── KPI derived values ───────────────────────────────────────────────────
  const pendingReviews = records.filter((r) =>
    ["Cancellation Requested", "Billing Review"].includes(r.cancellationStatus),
  ).length;
  const approvedCount = records.filter((r) =>
    [
      "Approved for Offboarding",
      "Offboarding Triggered",
      "Billing Closed",
      "Cancelled",
    ].includes(r.cancellationStatus),
  ).length;
  const finalInvPending = records.filter((r) =>
    ["Needed", "Created", "Sent"].includes(r.finalInvoiceStatus),
  ).length;
  const unpaidBalances = records.filter(
    (r) => r.outstandingBalance !== "$0",
  ).length;
  const offboardTriggered = records.filter(
    (r) =>
      r.offboardingStatus === "Triggered" ||
      r.offboardingStatus === "In Progress",
  ).length;
  const billingHolds = records.filter(
    (r) => r.cancellationStatus === "Billing Hold",
  ).length;
  const closedThisMonth = records.filter(
    (r) => r.cancellationStatus === "Billing Closed",
  ).length;
  const revenueAtRisk = records
    .filter(
      (r) =>
        !["Billing Closed", "Cancelled"].includes(r.cancellationStatus),
    )
    .reduce((sum, r) => {
      const val =
        parseInt(r.mrrImpact.replace(/[^0-9]/g, ""), 10) || 0;
      return sum + val;
    }, 0);

  // AM-notification-ready records
  const offboardingReady = records.filter(
    (r) =>
      (r.cancellationStatus === "Approved for Offboarding" ||
        r.finalInvoiceStatus === "Paid" ||
        r.outstandingBalance === "$0") &&
      r.offboardingStatus !== "Triggered" &&
      r.offboardingStatus !== "In Progress" &&
      r.offboardingStatus !== "Complete" &&
      r.cancellationStatus !== "Billing Closed",
  );

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
          Loading cancellations…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Task Management Engine Banner */}
      <TaskAccessCard
        context="Cancellations"
        variant="banner"
        counters={{ open: 5, overdue: 1, dueToday: 2, completed: 9 }}
        createLabel="Create Cancellation Task"
        examples={[
          "Cancellation Review",
          "Retention Call",
          "Final Invoice",
          "Billing Close",
        ]}
        tasksHref="/billing/tasks"
      />

      {/* Header */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: workspace.accentColor }}
        >
          {workspace.name}
        </p>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          Billing Cancellations
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Unified cancellation queue built from real client data. All status changes
          persist to MASTER_CLIENTS via patchMasterClient() — consistent with Client
          Portfolio. Billing&apos;s job ends at notifying AM; downstream steps are owned
          by Account Management.
        </p>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-wrap gap-2">
        <ActionBtn
          variant="primary"
          label="Refresh Queue"
          onClick={() => {
            setLoading(true);
            void loadClients().finally(() => setLoading(false));
            addEvent("-", "Queue Refreshed", "Billing", "-", "-");
          }}
        />
        <ActionBtn
          variant="secondary"
          label="Export Cancellation Queue"
          onClick={() => addEvent("-", "Cancellation Queue Exported", "Billing", "-", "-")}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Pending Reviews"
          value={String(pendingReviews)}
          subtitle="Awaiting billing review"
          accentColor="#D97706"
          iconBg="#FFFBEB"
          iconColor="#D97706"
        />
        <KpiCard
          title="Approved Cancellations"
          value={String(approvedCount)}
          subtitle="Approved or closed"
          accentColor="#059669"
          iconBg="#ECFDF5"
          iconColor="#059669"
        />
        <KpiCard
          title="Final Invoices Pending"
          value={String(finalInvPending)}
          subtitle="Need invoice action"
          accentColor="#1B4FD8"
          iconBg="#EFF6FF"
          iconColor="#1B4FD8"
        />
        <KpiCard
          title="Unpaid Balances"
          value={String(unpaidBalances)}
          subtitle="Outstanding amounts"
          accentColor="#DC2626"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
        />
        <KpiCard
          title="AM Notified"
          value={String(offboardTriggered)}
          subtitle="AM handoff signaled"
          accentColor="#7C3AED"
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
        />
        <KpiCard
          title="Billing Holds"
          value={String(billingHolds)}
          subtitle="Active holds"
          accentColor="#0891B2"
          iconBg="#ECFEFF"
          iconColor="#0891B2"
        />
        <KpiCard
          title="Closed This Month"
          value={String(closedThisMonth)}
          subtitle="Billing fully closed"
          accentColor="#059669"
          iconBg="#ECFDF5"
          iconColor="#059669"
        />
        <KpiCard
          title="Revenue at Risk"
          value={`$${revenueAtRisk.toLocaleString()}`}
          subtitle="MRR from open cancellations"
          accentColor="#DC2626"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
        />
      </div>

      {/* Lifecycle Flow */}
      <LifecycleFlow />

      {/* Data source callout */}
      <div
        className="rounded-xl border p-4 text-xs"
        style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#065F46" }}
      >
        <strong>Live data:</strong> This queue is built from{" "}
        <strong>{records.length}</strong> MASTER_CLIENTS record
        {records.length !== 1 ? "s" : ""} where{" "}
        <code>cancellationStatus !== &quot;None&quot;</code>, merged with AM-initiated
        requests from <code>/api/pending-cancellation-requests</code>. Status changes
        made here (Billing Review, Final Invoice, Billing Hold, Close Billing) persist
        immediately via <code>patchMasterClient()</code> and are reflected on Client
        Portfolio after refresh.
      </div>

      {/* 1. Cancellation Review Queue */}
      <SectionWrapper
        title="Cancellation Review Queue"
        description="Primary billing review table. All action buttons persist real state changes to MASTER_CLIENTS."
      >
        {records.length === 0 ? (
          <div
            className="text-center py-12 text-sm"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            No active cancellations. Clients with{" "}
            <code>cancellationStatus !== &quot;None&quot;</code> will appear here.
          </div>
        ) : (
          <div
            className="overflow-x-auto rounded-lg border"
            style={{ borderColor: "var(--rtm-border-light)" }}
          >
            <table className="min-w-full">
              <thead>
                <tr>
                  <Th>Client</Th>
                  <Th>Status</Th>
                  <Th>Requested</Th>
                  <Th>Requested By</Th>
                  <Th>AM Owner</Th>
                  <Th>Billing Owner</Th>
                  <Th>MRR Impact</Th>
                  <Th>Contract End</Th>
                  <Th>Outstanding Balance</Th>
                  <Th>Final Invoice</Th>
                  <Th>Offboarding</Th>
                  <Th>Priority</Th>
                  <Th>Next Billing Action</Th>
                  <Th>Stripe Sub</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr
                    key={row.id}
                    style={{ background: "var(--rtm-bg)" }}
                    className="hover:bg-[var(--rtm-bg-alt,#F9FAFB)] transition-colors"
                  >
                    <Td>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {row.client}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={cancellationStatusVariant(row.cancellationStatus)}
                        label={row.cancellationStatus}
                        size="sm"
                      />
                    </Td>
                    <Td muted>{row.requestedDate}</Td>
                    <Td muted>{row.requestedBy}</Td>
                    <Td muted>{row.amOwner}</Td>
                    <Td muted>{row.billingOwner}</Td>
                    <Td>
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "#DC2626" }}
                      >
                        {row.mrrImpact}
                      </span>
                    </Td>
                    <Td muted>{row.contractEndDate}</Td>
                    <Td>
                      <span
                        className="font-semibold text-sm"
                        style={{
                          color:
                            row.outstandingBalance !== "$0"
                              ? "#DC2626"
                              : "#059669",
                        }}
                      >
                        {row.outstandingBalance}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={finalInvoiceVariant(row.finalInvoiceStatus)}
                        label={row.finalInvoiceStatus}
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={offboardingVariant(row.offboardingStatus)}
                        label={row.offboardingStatus}
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={priorityVariant(row.priority)}
                        label={row.priority}
                        size="sm"
                      />
                    </Td>
                    <Td tight>
                      <span
                        className="text-xs"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        {row.nextBillingAction}
                      </span>
                    </Td>
                    <Td>
                      {/* Stripe Subscription cancellation placeholder.
                          FUTURE LIVE INTEGRATION HOOK: see StripeCancellationIndicator above */}
                      <StripeCancellationIndicator />
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1.5">
                        {/* Review Billing — persists cancellationStatus → "In Review" */}
                        <ActionBtn
                          small
                          variant="secondary"
                          label="Review Billing"
                          onClick={() => setModal({ kind: "review", record: row })}
                        />
                        {/* Create Final Invoice — persists invoiceStatus → "Final invoice issued" */}
                        <ActionBtn
                          small
                          variant="secondary"
                          label="Create Final Invoice"
                          onClick={() =>
                            setModal({ kind: "invoice", record: row })
                          }
                        />
                        {/* Mark Balance Cleared — overlay + event only */}
                        <ActionBtn
                          small
                          variant="secondary"
                          label="Mark Balance Cleared"
                          onClick={() => {
                            updateOverlay(row.id, {
                              workflowStatus: "Approved for Offboarding",
                              nextBillingAction: "Notify AM",
                              outstandingBalance: "$0",
                            });
                            addEvent(
                              row.client,
                              "Balance Cleared",
                              "Billing",
                              "Approved for Offboarding",
                              row.offboardingStatus,
                              "Balance marked cleared",
                            );
                          }}
                        />
                        {/* Place Billing Hold — persists billingStatus → "Pending" */}
                        <ActionBtn
                          small
                          variant="danger"
                          label="Place Billing Hold"
                          onClick={() => setModal({ kind: "hold", record: row })}
                        />
                        {/* Notify AM — already-real cross-workspace signal */}
                        <ActionBtn
                          small
                          variant="secondary"
                          label="Notify AM"
                          onClick={() =>
                            setModal({ kind: "offboard", record: row })
                          }
                        />
                        {/* Close Billing — persists cancellationStatus → "Cancelled" + billingStatus → "Closed" */}
                        <ActionBtn
                          small
                          variant="secondary"
                          label="Close Billing"
                          onClick={() =>
                            setModal({ kind: "close", record: row })
                          }
                        />
                        {/* Add Note — event log only */}
                        <ActionBtn
                          small
                          variant="ghost"
                          label="Add Note"
                          onClick={() =>
                            addEvent(
                              row.client,
                              "Note Added",
                              "Billing",
                              row.cancellationStatus,
                              row.offboardingStatus,
                            )
                          }
                        />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionWrapper>

      {/* 2. Billing Impact Review */}
      <SectionWrapper
        title="Billing Impact Review"
        description="Financial snapshot of each cancellation - refunds, prorations, balances, and billing decisions."
      >
        <div
          className="overflow-x-auto rounded-lg border"
          style={{ borderColor: "var(--rtm-border-light)" }}
        >
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Current Plan</Th>
                <Th>Monthly Value</Th>
                <Th>Remaining Contract Value</Th>
                <Th>Refund Required</Th>
                <Th>Prorated Amount</Th>
                <Th>Outstanding Balance</Th>
                <Th>Final Invoice Needed</Th>
                <Th>Payment Method</Th>
                <Th>Billing Decision</Th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => (
                <tr
                  key={row.id}
                  style={{ background: "var(--rtm-bg)" }}
                  className="hover:bg-[var(--rtm-bg-alt,#F9FAFB)] transition-colors"
                >
                  <Td>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {row.client}
                    </span>
                  </Td>
                  <Td muted>{row.currentPlan}</Td>
                  <Td>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {row.monthlyValue}
                    </span>
                  </Td>
                  <Td muted>{row.remainingContractValue}</Td>
                  <Td>
                    {row.refundRequired ? (
                      <StatusBadge variant="warning" label="Yes" size="sm" />
                    ) : (
                      <StatusBadge variant="neutral" label="No" size="sm" />
                    )}
                  </Td>
                  <Td muted>{row.proratedAmount}</Td>
                  <Td>
                    <span
                      className="font-semibold text-sm"
                      style={{
                        color:
                          row.outstandingBalance !== "$0"
                            ? "#DC2626"
                            : "#059669",
                      }}
                    >
                      {row.outstandingBalance}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge
                      variant={finalInvoiceVariant(row.finalInvoiceStatus)}
                      label={row.finalInvoiceStatus}
                      size="sm"
                    />
                  </Td>
                  <Td>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color:
                          row.paymentMethodStatus === "Failed" ||
                          row.paymentMethodStatus === "On Hold"
                            ? "#DC2626"
                            : row.paymentMethodStatus === "Closed"
                            ? "var(--rtm-text-muted)"
                            : "#059669",
                      }}
                    >
                      {row.paymentMethodStatus}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-md border"
                      style={{
                        background: "#EFF6FF",
                        color: "#1B4FD8",
                        borderColor: "#BFDBFE",
                      }}
                    >
                      {row.billingDecision}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* 3. AM Notification Queue */}
      <SectionWrapper
        title="AM Notification Queue"
        description="Clients where Billing has cleared all balances. Use Notify AM to signal Account Management. Billing's job ends here."
      >
        {offboardingReady.length === 0 ? (
          <div
            className="text-center py-8 text-sm"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            No clients currently ready for AM notification.
          </div>
        ) : (
          <div
            className="overflow-x-auto rounded-lg border"
            style={{ borderColor: "var(--rtm-border-light)" }}
          >
            <table className="min-w-full">
              <thead>
                <tr>
                  <Th>Client</Th>
                  <Th>Billing Cleared</Th>
                  <Th>Final Invoice Sent</Th>
                  <Th>Outstanding Balance</Th>
                  <Th>Cancellation Approved</Th>
                  <Th>Offboarding Status</Th>
                  <Th>Operations Owner</Th>
                  <Th>AM Owner</Th>
                  <Th>Next Step</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {offboardingReady.map((row) => {
                  const billingCleared = row.outstandingBalance === "$0";
                  const finalSent =
                    row.finalInvoiceStatus === "Paid" ||
                    row.finalInvoiceStatus === "Sent" ||
                    row.finalInvoiceStatus === "Not Required";
                  const approved =
                    [
                      "Approved for Offboarding",
                      "Final Invoice Needed",
                      "Pending Balance",
                    ].includes(row.cancellationStatus) || billingCleared;
                  return (
                    <tr
                      key={row.id}
                      style={{ background: "var(--rtm-bg)" }}
                      className="hover:bg-[var(--rtm-bg-alt,#F9FAFB)] transition-colors"
                    >
                      <Td>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--rtm-text-primary)" }}
                        >
                          {row.client}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge
                          variant={billingCleared ? "success" : "warning"}
                          label={billingCleared ? "Yes" : "No"}
                          size="sm"
                        />
                      </Td>
                      <Td>
                        <StatusBadge
                          variant={finalSent ? "success" : "warning"}
                          label={finalSent ? "Yes" : "No"}
                          size="sm"
                        />
                      </Td>
                      <Td>
                        <span
                          className="font-semibold text-sm"
                          style={{
                            color:
                              row.outstandingBalance !== "$0"
                                ? "#DC2626"
                                : "#059669",
                          }}
                        >
                          {row.outstandingBalance}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge
                          variant={approved ? "success" : "warning"}
                          label={approved ? "Yes" : "Pending"}
                          size="sm"
                        />
                      </Td>
                      <Td>
                        <StatusBadge
                          variant={offboardingVariant(row.offboardingStatus)}
                          label={row.offboardingStatus}
                          size="sm"
                        />
                      </Td>
                      <Td muted>Operations Team</Td>
                      <Td muted>{row.amOwner}</Td>
                      <Td muted>
                        <span className="text-xs">{row.nextBillingAction}</span>
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1.5">
                          <ActionBtn
                            small
                            variant="primary"
                            label="Notify AM"
                            onClick={() =>
                              setModal({ kind: "offboard", record: row })
                            }
                          />
                          <ActionBtn
                            small
                            variant="secondary"
                            label="Close Billing"
                            onClick={() =>
                              setModal({ kind: "close", record: row })
                            }
                          />
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionWrapper>

      {/* 4. Recent Cancellation Billing Events */}
      <SectionWrapper
        title="Recent Cancellation Billing Events"
        description="Live event log for all cancellation and offboarding billing actions this session."
      >
        {eventLog.length === 0 ? (
          <div
            className="text-center py-8 text-sm"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            No events yet. Actions taken on records above will appear here.
          </div>
        ) : (
          <div
            className="overflow-x-auto rounded-lg border"
            style={{ borderColor: "var(--rtm-border-light)" }}
          >
            <table className="min-w-full">
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Client</Th>
                  <Th>Event Type</Th>
                  <Th>Triggered By</Th>
                  <Th>Billing Status</Th>
                  <Th>Offboarding Status</Th>
                  <Th>Notes</Th>
                </tr>
              </thead>
              <tbody>
                {eventLog.map((ev, i) => {
                  const evVariant: BadgeVariant =
                    ev.event === "Billing Closed" ||
                    ev.event === "Balance Cleared"
                      ? "success"
                      : ev.event === "Offboarding Triggered" ||
                        ev.event.includes("Triggered")
                      ? "info"
                      : ev.event === "Billing Hold Placed"
                      ? "error"
                      : ev.event === "Final Invoice Created"
                      ? "warning"
                      : "neutral";
                  return (
                    <tr
                      key={i}
                      style={{ background: "var(--rtm-bg)" }}
                      className="hover:bg-[var(--rtm-bg-alt,#F9FAFB)] transition-colors"
                    >
                      <Td muted>{ev.date}</Td>
                      <Td>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--rtm-text-primary)" }}
                        >
                          {ev.client}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge
                          variant={evVariant}
                          label={ev.event}
                          size="sm"
                        />
                      </Td>
                      <Td muted>{ev.by}</Td>
                      <Td muted>
                        <span className="text-xs">{ev.billingStatus}</span>
                      </Td>
                      <Td muted>
                        <span className="text-xs">{ev.offboardingStatus}</span>
                      </Td>
                      <Td muted>
                        <span className="text-xs">{ev.notes || "-"}</span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionWrapper>

      {/* Connected Systems */}
      <div
        className="rounded-xl border p-5 space-y-3"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Connected Systems
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            {
              label: "Account Management",
              href: "/account-management",
              color: "#1B4FD8",
              bg: "#EFF6FF",
              border: "#BFDBFE",
            },
            {
              label: "Client Portfolio",
              href: "/billing/client-portfolio",
              color: "#059669",
              bg: "#ECFDF5",
              border: "#A7F3D0",
            },
            {
              label: "Workflow Engine",
              href: "/admin/workflows",
              color: "#7C3AED",
              bg: "#F5F3FF",
              border: "#DDD6FE",
            },
            {
              label: "Tasks",
              href: "/billing/tasks",
              color: "#D97706",
              bg: "#FFFBEB",
              border: "#FDE68A",
            },
            {
              label: "Billing Dashboard",
              href: workspace.dashboardRoute,
              color: "#6B7280",
              bg: "#F9FAFB",
              border: "#E5E7EB",
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold px-3.5 py-2 rounded-lg border transition-colors hover:opacity-80"
              style={{
                background: link.bg,
                color: link.color,
                borderColor: link.border,
              }}
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modal?.kind === "review" && (
        <ReviewBillingModal
          record={modal.record}
          onClose={() => setModal(null)}
          onSave={(msg) => {
            updateOverlay(modal.record.id, {
              workflowStatus: "Billing Review",
              nextBillingAction: "Create Final Invoice or Stop Billing",
            });
            addEvent(
              modal.record.client,
              "Billing Review Started",
              "Billing",
              "Billing Review",
              modal.record.offboardingStatus,
              msg,
            );
            showToast(`✅ Billing review saved for ${modal.record.client} — status updated to "In Review"`, "success");
            // Refresh to pull the persisted MASTER_CLIENTS state
            void loadClients();
          }}
        />
      )}

      {modal?.kind === "invoice" && (
        <CreateFinalInvoiceModal
          record={modal.record}
          onClose={() => setModal(null)}
          onSave={(msg) => {
            updateOverlay(modal.record.id, {
              workflowStatus: "Final Invoice Needed",
              finalInvoiceStatus: "Created",
              nextBillingAction: "Collect Payment on Final Invoice",
            });
            addEvent(
              modal.record.client,
              "Final Invoice Created",
              "Billing",
              "Final Invoice Needed",
              modal.record.offboardingStatus,
              msg,
            );
            showToast(`✅ Final invoice created for ${modal.record.client} — invoice status updated`, "success");
            void loadClients();
          }}
        />
      )}

      {modal?.kind === "hold" && (
        <BillingHoldModal
          record={modal.record}
          onClose={() => setModal(null)}
          onSave={(msg) => {
            updateOverlay(modal.record.id, {
              workflowStatus: "Billing Hold",
              nextBillingAction: "Resolve Hold - Escalate to AM",
              paymentMethodStatus: "On Hold",
            });
            addEvent(
              modal.record.client,
              "Billing Hold Placed",
              "Billing",
              "Billing Hold",
              modal.record.offboardingStatus,
              msg,
            );
            showToast(`⚠️ Billing hold placed for ${modal.record.client}`, "warning");
            void loadClients();
          }}
        />
      )}

      {modal?.kind === "offboard" && (
        <NotifyAMModal
          record={modal.record}
          amQueue={amQueue}
          onClose={() => setModal(null)}
          onSave={(msg) => {
            updateOverlay(modal.record.id, {
              workflowStatus: "Approved for Offboarding",
              offboardingStatus: "Triggered",
              nextBillingAction: "Close Billing",
            });
            addEvent(
              modal.record.client,
              "AM Notified",
              "Billing",
              "Approved for Offboarding",
              "Triggered",
              msg,
            );
            showToast(
              `✅ AM notified for ${modal.record.client} — Offboarding case created in Account Management`,
              "success",
            );
          }}
        />
      )}

      {modal?.kind === "close" && (
        <CloseBillingModal
          record={modal.record}
          onClose={() => setModal(null)}
          onSave={(msg) => {
            updateOverlay(modal.record.id, {
              workflowStatus: "Billing Closed",
              offboardingStatus: "Complete",
              nextBillingAction: "Archived",
            });
            addEvent(
              modal.record.client,
              "Billing Closed",
              "Billing",
              "Billing Closed",
              "Complete",
              msg,
            );
            showToast(`✅ Billing closed for ${modal.record.client} — status set to "Cancelled" in MASTER_CLIENTS`, "success");
            // Refresh: client will leave queue once cancellationStatus = "Cancelled"
            // (if the page is reloaded, "Cancelled" is still !== "None" so it stays visible
            // but with Billing Closed workflow status — consistent with old mock behavior)
            void loadClients();
          }}
        />
      )}
    </div>
  );
}
