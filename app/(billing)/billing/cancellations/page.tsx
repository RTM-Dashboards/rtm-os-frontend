"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";
import {
  type PendingCancellationRequest,
} from "@/lib/mock/cancellation-queue";


const workspace = getWorkspace("billing")!;

//  Types

type BadgeVariant = "success"| "error"| "warning"| "info"| "neutral"| "pending";

type CancellationStatus =
  | "Cancellation Requested"| "Billing Review"| "Final Invoice Needed"| "Pending Balance"| "Approved for Offboarding"| "Offboarding Triggered"| "Billing Hold"| "Billing Closed"| "Cancelled";

type FinalInvoiceStatus = "Not Required"| "Needed"| "Created"| "Sent"| "Paid"| "Overdue";
type OffboardingStatus  = "Not Started"| "Pending"| "Triggered"| "In Progress"| "Complete";
type BillingDecision    =
  | "Continue Billing Until End Date"| "Stop Billing Immediately"| "Create Final Invoice"| "Apply Refund"| "Write Off Balance"| "Escalate to AM";
type FinalBillingStatus = "Closed - Paid"| "Closed - Written Off"| "Closed - Refunded"| "Closed - Escalated";
type InvoiceType        = "Final Invoice"| "Prorated Invoice"| "Cancellation Fee"| "Outstanding Balance";

interface CancellationRecord {
  id: string;
  client: string;
  cancellationStatus: CancellationStatus;
  requestedDate: string;
  requestedBy: string;
  amOwner: string;
  billingOwner: string;
  mrrImpact: string;
  contractEndDate: string;
  outstandingBalance: string;
  finalInvoiceStatus: FinalInvoiceStatus;
  offboardingStatus: OffboardingStatus;
  priority: "Critical"| "High"| "Medium"| "Low";
  nextBillingAction: string;
  // billing impact panel
  currentPlan: string;
  monthlyValue: string;
  remainingContractValue: string;
  refundRequired: boolean;
  proratedAmount: string;
  paymentMethodStatus: string;
  billingDecision: BillingDecision;
  // events
  recentEvents: { date: string; event: string; by: string }[];
}

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
  | { kind: "review";    record: CancellationRecord }
  | { kind: "invoice";   record: CancellationRecord }
  | { kind: "hold";      record: CancellationRecord }
  | { kind: "offboard";  record: CancellationRecord }
  | { kind: "close";     record: CancellationRecord }
  | null;

//  Mock Data

const mockCancellations: CancellationRecord[] = [
  {
    id: "cr1",
    client: "Green Valley Pools",
    cancellationStatus: "Cancellation Requested",
    requestedDate: "Jun 18, 2025",
    requestedBy: "Client",
    amOwner: "Rachel T.",
    billingOwner: "Lisa P.",
    mrrImpact: "-$2,200",
    contractEndDate: "Jul 31, 2025",
    outstandingBalance: "$0",
    finalInvoiceStatus: "Not Required",
    offboardingStatus: "Not Started",
    priority: "High",
    nextBillingAction: "Start Billing Review",
    currentPlan: "SEO + Meta Ads",
    monthlyValue: "$2,200",
    remainingContractValue: "$4,400",
    refundRequired: false,
    proratedAmount: "$0",
    paymentMethodStatus: "Active",
    billingDecision: "Continue Billing Until End Date",
    recentEvents: [
      { date: "Jun 18", event: "Cancellation Requested", by: "Client"},
    ],
  },
  {
    id: "cr2",
    client: "Metro Dental",
    cancellationStatus: "Final Invoice Needed",
    requestedDate: "Jun 10, 2025",
    requestedBy: "Client",
    amOwner: "Jordan M.",
    billingOwner: "Sarah K.",
    mrrImpact: "-$1,800",
    contractEndDate: "Jun 30, 2025",
    outstandingBalance: "$0",
    finalInvoiceStatus: "Needed",
    offboardingStatus: "Pending",
    priority: "Critical",
    nextBillingAction: "Create Final Invoice",
    currentPlan: "Full Service",
    monthlyValue: "$1,800",
    remainingContractValue: "$1,800",
    refundRequired: false,
    proratedAmount: "$0",
    paymentMethodStatus: "Active",
    billingDecision: "Create Final Invoice",
    recentEvents: [
      { date: "Jun 10", event: "Cancellation Requested", by: "Client"},
      { date: "Jun 12", event: "Billing Review Started", by: "Sarah K."},
    ],
  },
  {
    id: "cr3",
    client: "Cornerstone Flooring",
    cancellationStatus: "Pending Balance",
    requestedDate: "May 28, 2025",
    requestedBy: "Billing",
    amOwner: "Amanda B.",
    billingOwner: "Lisa P.",
    mrrImpact: "-$3,200",
    contractEndDate: "Jun 15, 2025",
    outstandingBalance: "$6,400",
    finalInvoiceStatus: "Overdue",
    offboardingStatus: "Pending",
    priority: "Critical",
    nextBillingAction: "Collect Outstanding Balance",
    currentPlan: "Enterprise Package",
    monthlyValue: "$3,200",
    remainingContractValue: "$0",
    refundRequired: false,
    proratedAmount: "$0",
    paymentMethodStatus: "Failed",
    billingDecision: "Escalate to AM",
    recentEvents: [
      { date: "May 28", event: "Cancellation Requested", by: "Billing"},
      { date: "May 30", event: "Billing Review Started", by: "Lisa P."},
      { date: "Jun 01", event: "Final Invoice Created", by: "Lisa P."},
      { date: "Jun 15", event: "Balance Cleared - Partial", by: "System"},
    ],
  },
  {
    id: "cr4",
    client: "Harbor Auto Group",
    cancellationStatus: "Approved for Offboarding",
    requestedDate: "Jun 05, 2025",
    requestedBy: "AM",
    amOwner: "Derek S.",
    billingOwner: "Sarah K.",
    mrrImpact: "-$400",
    contractEndDate: "Jun 30, 2025",
    outstandingBalance: "$0",
    finalInvoiceStatus: "Paid",
    offboardingStatus: "Pending",
    priority: "Medium",
    nextBillingAction: "Notify AM",
    currentPlan: "LSA Only",
    monthlyValue: "$400",
    remainingContractValue: "$0",
    refundRequired: false,
    proratedAmount: "$0",
    paymentMethodStatus: "Active",
    billingDecision: "Stop Billing Immediately",
    recentEvents: [
      { date: "Jun 05", event: "Cancellation Requested", by: "AM"},
      { date: "Jun 07", event: "Billing Review Started", by: "Sarah K."},
      { date: "Jun 10", event: "Final Invoice Created", by: "Sarah K."},
      { date: "Jun 15", event: "Balance Cleared", by: "System"},
    ],
  },
  {
    id: "cr5",
    client: "Sunbelt HVAC",
    cancellationStatus: "Offboarding Triggered",
    requestedDate: "May 15, 2025",
    requestedBy: "Client",
    amOwner: "Rachel T.",
    billingOwner: "Lisa P.",
    mrrImpact: "-$1,500",
    contractEndDate: "May 31, 2025",
    outstandingBalance: "$0",
    finalInvoiceStatus: "Paid",
    offboardingStatus: "Triggered",
    priority: "Medium",
    nextBillingAction: "Monitor Closure",
    currentPlan: "SEO + Reporting",
    monthlyValue: "$1,500",
    remainingContractValue: "$0",
    refundRequired: false,
    proratedAmount: "$0",
    paymentMethodStatus: "Active",
    billingDecision: "Stop Billing Immediately",
    recentEvents: [
      { date: "May 15", event: "Cancellation Requested", by: "Client"},
      { date: "May 17", event: "Billing Review Started", by: "Lisa P."},
      { date: "May 20", event: "Final Invoice Created", by: "Lisa P."},
      { date: "May 25", event: "Balance Cleared", by: "System"},
      { date: "May 28", event: "Offboarding Triggered", by: "Lisa P."},
    ],
  },
  {
    id: "cr6",
    client: "Blue Ridge Plumbing",
    cancellationStatus: "Billing Hold",
    requestedDate: "Jun 12, 2025",
    requestedBy: "Client",
    amOwner: "Jordan M.",
    billingOwner: "Sarah K.",
    mrrImpact: "-$800",
    contractEndDate: "Jul 31, 2025",
    outstandingBalance: "$800",
    finalInvoiceStatus: "Not Required",
    offboardingStatus: "Not Started",
    priority: "High",
    nextBillingAction: "Resolve Hold - Escalate to AM",
    currentPlan: "Local SEO",
    monthlyValue: "$800",
    remainingContractValue: "$1,600",
    refundRequired: false,
    proratedAmount: "$0",
    paymentMethodStatus: "On Hold",
    billingDecision: "Escalate to AM",
    recentEvents: [
      { date: "Jun 12", event: "Cancellation Requested", by: "Client"},
      { date: "Jun 13", event: "Billing Hold Placed", by: "Sarah K."},
    ],
  },
  {
    id: "cr7",
    client: "Pacific Dental",
    cancellationStatus: "Billing Closed",
    requestedDate: "Apr 01, 2025",
    requestedBy: "Client",
    amOwner: "Derek S.",
    billingOwner: "Lisa P.",
    mrrImpact: "-$3,800",
    contractEndDate: "Apr 30, 2025",
    outstandingBalance: "$0",
    finalInvoiceStatus: "Paid",
    offboardingStatus: "Complete",
    priority: "Low",
    nextBillingAction: "Archived",
    currentPlan: "Full Service",
    monthlyValue: "$3,800",
    remainingContractValue: "$0",
    refundRequired: false,
    proratedAmount: "$0",
    paymentMethodStatus: "Closed",
    billingDecision: "Stop Billing Immediately",
    recentEvents: [
      { date: "Apr 01", event: "Cancellation Requested", by: "Client"},
      { date: "Apr 03", event: "Billing Review Started", by: "Lisa P."},
      { date: "Apr 07", event: "Final Invoice Created", by: "Lisa P."},
      { date: "Apr 15", event: "Balance Cleared", by: "System"},
      { date: "Apr 20", event: "Offboarding Triggered", by: "Lisa P."},
      { date: "Apr 30", event: "Billing Closed", by: "Lisa P."},
    ],
  },
  {
    id: "cr8",
    client: "Skyline Landscaping",
    cancellationStatus: "Billing Closed",
    requestedDate: "Mar 15, 2025",
    requestedBy: "Billing",
    amOwner: "Amanda B.",
    billingOwner: "Sarah K.",
    mrrImpact: "-$1,500",
    contractEndDate: "Mar 31, 2025",
    outstandingBalance: "$0",
    finalInvoiceStatus: "Not Required",
    offboardingStatus: "Complete",
    priority: "Low",
    nextBillingAction: "Archived",
    currentPlan: "PPC + Content",
    monthlyValue: "$1,500",
    remainingContractValue: "$0",
    refundRequired: false,
    proratedAmount: "$0",
    paymentMethodStatus: "Closed",
    billingDecision: "Write Off Balance",
    recentEvents: [
      { date: "Mar 15", event: "Cancellation Requested", by: "Billing"},
      { date: "Mar 18", event: "Billing Review Started", by: "Sarah K."},
      { date: "Mar 22", event: "Balance Cleared", by: "Sarah K."},
      { date: "Mar 31", event: "Billing Closed", by: "Sarah K."},
    ],
  },
];

//  Helpers

function cancellationStatusVariant(s: CancellationStatus): BadgeVariant {
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap border-b"style={{
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
      className="px-3 py-2.5 text-sm border-b align-middle"style={{
        color: muted ? "var(--rtm-text-muted)": "var(--rtm-text-secondary)",
        borderColor: "var(--rtm-border-light)",
        maxWidth: tight ? "140px": undefined,
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
}: {
  label: string;
  onClick: () => void;
  variant?: "primary"| "secondary"| "danger"| "ghost";
  small?: boolean;
}) {
  const base = `font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${small ? "text-xs px-2.5 py-1": "text-sm px-3.5 py-2"}`;
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
    <button className={`${base} ${styles[variant]}`} onClick={onClick}>
      {label}
    </button>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────────────

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

function LifecycleFlow() {
  const steps: { label: string; color?: string; bg?: string; border: string }[] = [
    { label: "Cancellation Requested",   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
    { label: "Billing Review",           color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE"},
    { label: "Final Invoice Needed",     color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
    { label: "Pending Balance",          color: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
    { label: "Approved for Offboarding", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE"},
    { label: "AM Notified",              color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
    { label: "Billing Closed",           color: "#059669", bg: "#ECFDF5", border: "#A7F3D0"},
  ];
  return (
    <div
      className="rounded-xl border p-4"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest mb-3"style={{ color: "#7C3AED"}}
      >
        Cancellation Lifecycle
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border"style={{ background: s.bg, color: s.color, borderColor: s.border }}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-sm"style={{ color: "var(--rtm-border)"}}>
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs mt-2.5"style={{ color: "#6D28D9"}}>
        Alternative path: Billing Review → Billing Hold → Escalated to AM
      </p>
    </div>
  );
}

//  Modal Shell

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
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-y-auto"style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
          maxHeight: "90vh",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"style={{ borderColor: "var(--rtm-border-light)"}}
        >
          <h2
            className="text-base font-bold"style={{ color: "var(--rtm-text-primary)"}}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{
              color: "var(--rtm-text-muted)",
              borderColor: "var(--rtm-border)",
            }}
          >
             Close
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label
        className="block text-xs font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full text-sm px-3 py-2 rounded-lg border focus:outline-none";
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
      type="text"className={inputClass}
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
    <label className="flex items-center gap-2 cursor-pointer text-sm"style={{ color: "var(--rtm-text-secondary)"}}>
      <input
        type="checkbox"checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded"/>
      {label}
    </label>
  );
}

//  Review Billing Modal

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

  function f<K extends keyof BillingReviewForm>(k: K, v: BillingReviewForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  return (
    <ModalShell title="Review Billing"onClose={onClose}>
      <FormField label="Client">
        <TextInput value={form.client} onChange={(v) => f("client", v)} />
      </FormField>
      <FormField label="Outstanding Balance">
        <TextInput
          value={form.outstandingBalance}
          onChange={(v) => f("outstandingBalance", v)}
          placeholder="$0"/>
      </FormField>
      <CheckboxField
        label="Final Invoice Required"checked={form.finalInvoiceRequired}
        onChange={(v) => f("finalInvoiceRequired", v)}
      />
      <CheckboxField
        label="Refund Required"checked={form.refundRequired}
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
          placeholder="Add review notes..."/>
      </FormField>
      <ActionBtn
        variant="primary"label="Save Billing Review"onClick={() => {
          onSave(
            `Billing reviewed for ${form.client} - Decision: ${form.billingDecision}`
          );
          onClose();
        }}
      />
    </ModalShell>
  );
}

//  Create Final Invoice Modal

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

  function f<K extends keyof FinalInvoiceForm>(k: K, v: FinalInvoiceForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  return (
    <ModalShell title="Create Final Invoice"onClose={onClose}>
      <FormField label="Client">
        <TextInput value={form.client} onChange={(v) => f("client", v)} />
      </FormField>
      <FormField label="Invoice Amount">
        <TextInput
          value={form.invoiceAmount}
          onChange={(v) => f("invoiceAmount", v)}
          placeholder="$0.00"/>
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
          placeholder="e.g. Jul 15, 2025"/>
      </FormField>
      <FormField label="Invoice Notes">
        <TextArea
          value={form.invoiceNotes}
          onChange={(v) => f("invoiceNotes", v)}
          placeholder="Add invoice notes..."/>
      </FormField>
      <ActionBtn
        variant="primary"label="Create Final Invoice"onClick={() => {
          onSave(
            `Final invoice created for ${form.client} - ${form.invoiceType} - ${form.invoiceAmount}`
          );
          onClose();
        }}
      />
    </ModalShell>
  );
}

//  Place Billing Hold Modal

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

  function f<K extends keyof BillingHoldForm>(k: K, v: BillingHoldForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  return (
    <ModalShell title="Place Billing Hold"onClose={onClose}>
      <FormField label="Client">
        <TextInput value={form.client} onChange={(v) => f("client", v)} />
      </FormField>
      <FormField label="Hold Reason">
        <TextInput
          value={form.holdReason}
          onChange={(v) => f("holdReason", v)}
          placeholder="e.g. AM escalation pending"/>
      </FormField>
      <FormField label="Hold Start Date">
        <TextInput
          value={form.holdStartDate}
          onChange={(v) => f("holdStartDate", v)}
          placeholder="e.g. Jun 20, 2025"/>
      </FormField>
      <FormField label="Hold End Date">
        <TextInput
          value={form.holdEndDate}
          onChange={(v) => f("holdEndDate", v)}
          placeholder="e.g. Jul 01, 2025"/>
      </FormField>
      <FormField label="Notes">
        <TextArea
          value={form.notes}
          onChange={(v) => f("notes", v)}
          placeholder="Add hold notes..."/>
      </FormField>
      <ActionBtn
        variant="danger"label="Place Billing Hold"onClick={() => {
          onSave(`Billing hold placed for ${form.client} - Reason: ${form.holdReason}`);
          onClose();
        }}
      />
    </ModalShell>
  );
}

//  Notify AM Modal (replaces Trigger Offboarding)

function NotifyAMModal({
  record,
  onClose,
  onSave,
}: {
  record: CancellationRecord;
  onClose: () => void;
  onSave: (msg: string) => void;
}) {
  const [form, setForm] = useState<TriggerOffboardingForm>({
    client: record.client,
    billingCleared: record.outstandingBalance === "$0",
    finalInvoiceSent: record.finalInvoiceStatus === "Paid" || record.finalInvoiceStatus === "Sent",
    outstandingBalance: record.outstandingBalance,
    amOwner: record.amOwner,
    operationsOwner: "Operations Team",
    offboardingNotes: "",
  });

  function f<K extends keyof TriggerOffboardingForm>(k: K, v: TriggerOffboardingForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  return (
    <ModalShell title="Notify Account Management" onClose={onClose}>
      <div
        className="rounded-lg border p-3 text-xs"
        style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#065F46" }}
      >
        <strong>Billing's responsibility ends here.</strong> This sends a mock "AM Notified" signal.
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
          placeholder="Add handoff notes for AM..." />
      </FormField>
      <ActionBtn
        variant="primary"
        label="Notify AM - Billing Complete"
        onClick={() => {
          onSave(
            `AM notified: ${form.client} - Billing cleared. Handoff to ${form.amOwner}.`
          );
          onClose();
        }}
      />
    </ModalShell>
  );
}

//  Close Billing Modal

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

  function f<K extends keyof CloseBillingForm>(k: K, v: CloseBillingForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  return (
    <ModalShell title="Close Billing"onClose={onClose}>
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
          placeholder="Add closure notes..."/>
      </FormField>
      <ActionBtn
        variant="primary"label="Close Billing"onClick={() => {
          onSave(`Billing closed for ${form.client} - Status: ${form.finalBillingStatus}`);
          onClose();
        }}
      />
    </ModalShell>
  );
}

//  Page

// Convert an AM-initiated cancellation queue entry into Billing's CancellationRecord shape.
function amRequestToRecord(req: PendingCancellationRequest): CancellationRecord {
  return {
    id: req.id,
    client: req.client,
    cancellationStatus: "Cancellation Requested",
    requestedDate: req.requestedDate,
    requestedBy: "AM",
    amOwner: req.amOwner,
    billingOwner: req.billingOwner || "Billing Team",
    mrrImpact: req.mrrImpact,
    contractEndDate: "-",
    outstandingBalance: "$0",
    finalInvoiceStatus: "Not Required",
    offboardingStatus: "Not Started",
    priority: "Medium",
    nextBillingAction: "Start Billing Review",
    currentPlan: "-",
    monthlyValue: req.mrrImpact.replace("-", ""),
    remainingContractValue: "-",
    refundRequired: false,
    proratedAmount: "$0",
    paymentMethodStatus: "Active",
    billingDecision: "Continue Billing Until End Date",
    recentEvents: [
      { date: req.requestedDate, event: `Cancellation Requested (Reason: ${req.reason})`, by: req.amOwner },
    ],
  };
}

export default function BillingCancellationsPage() {
  // records: Billing's own mock records merged with AM-initiated requests from the API.
  const [records, setRecords] = useState<CancellationRecord[]>([...mockCancellations]);
  // amQueue: raw AM-initiated requests fetched from the file-backed API (used for
  // reason look-up when triggering offboarding).
  const [amQueue, setAmQueue] = useState<PendingCancellationRequest[]>([]);
  const [modal, setModal]     = useState<ModalKind>(null);
  const [toast, setToast]     = useState<{ message: string; variant: "success" | "info" | "warning" | "error" } | null>(null);

  function showToast(message: string, variant: "success" | "info" | "warning" | "error" = "success") {
    setToast({ message, variant });
  }

  // Fetch AM-initiated requests from the file-backed API on mount — cross-route-group reliable.
  useEffect(() => {
    fetch("/api/pending-cancellation-requests")
      .then((r) => r.json())
      .then((data: { records: PendingCancellationRequest[] }) => {
        if (!Array.isArray(data.records)) return;
        setAmQueue(data.records);
        setRecords((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const newOnes = data.records
            .filter((r) => !existingIds.has(r.id))
            .map(amRequestToRecord);
          return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
        });
      })
      .catch((err) => console.error("[Billing Cancellations] Failed to load AM requests:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [eventLog, setEventLog] = useState<
    { date: string; client: string; event: string; by: string; billingStatus: string; offboardingStatus: string; notes: string }[]
  >([
    { date: "Jun 18", client: "Green Valley Pools",  event: "Cancellation Requested",  by: "Client",    billingStatus: "Cancellation Requested",  offboardingStatus: "Not Started", notes: "Client contacted via email"},
    { date: "Jun 13", client: "Blue Ridge Plumbing", event: "Billing Hold Placed",     by: "Sarah K.",  billingStatus: "Billing Hold",            offboardingStatus: "Not Started", notes: "AM escalation pending"},
    { date: "Jun 12", client: "Blue Ridge Plumbing", event: "Cancellation Requested",  by: "Client",    billingStatus: "Cancellation Requested",  offboardingStatus: "Not Started", notes: ""},
    { date: "Jun 10", client: "Metro Dental",         event: "Cancellation Requested",  by: "Client",    billingStatus: "Cancellation Requested",  offboardingStatus: "Not Started", notes: "Moved to competitor"},
    { date: "Jun 07", client: "Harbor Auto Group",    event: "Billing Review Started",  by: "Sarah K.",  billingStatus: "Billing Review",          offboardingStatus: "Not Started", notes: ""},
    { date: "Jun 05", client: "Harbor Auto Group",    event: "Cancellation Requested",  by: "AM",        billingStatus: "Cancellation Requested",  offboardingStatus: "Not Started", notes: ""},
    { date: "May 28", client: "Sunbelt HVAC",         event: "Offboarding Triggered",   by: "Lisa P.",   billingStatus: "Offboarding Triggered",   offboardingStatus: "Triggered",   notes: "All billing cleared"},
    { date: "Apr 30", client: "Pacific Dental",       event: "Billing Closed",          by: "Lisa P.",   billingStatus: "Billing Closed",          offboardingStatus: "Complete",    notes: "Closed - Paid"},
  ]);

  function addEvent(client: string, event: string, by: string, billingStatus: string, offboardingStatus: string, notes = "") {
    const now = new Date();
    const date = `${now.toLocaleString("en-US", { month: "short"})} ${now.getDate()}`;
    setEventLog((prev) => [{ date, client, event, by, billingStatus, offboardingStatus, notes }, ...prev.slice(0, 19)]);
  }

  function updateRecordStatus(id: string, status: CancellationStatus, nextBillingAction: string, offboardingStatus?: OffboardingStatus) {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, cancellationStatus: status, nextBillingAction, ...(offboardingStatus ? { offboardingStatus } : {}) }
          : r
      )
    );
  }

  // KPI derived values
  const pendingReviews    = records.filter((r) => ["Cancellation Requested", "Billing Review"].includes(r.cancellationStatus)).length;
  const approvedCount     = records.filter((r) => ["Approved for Offboarding", "Offboarding Triggered", "Billing Closed", "Cancelled"].includes(r.cancellationStatus)).length;
  const finalInvPending   = records.filter((r) => ["Needed", "Created", "Sent"].includes(r.finalInvoiceStatus)).length;
  const unpaidBalances    = records.filter((r) => r.outstandingBalance !== "$0").length;
  const offboardTriggered = records.filter((r) => r.offboardingStatus === "Triggered"|| r.offboardingStatus === "In Progress").length;
  const billingHolds      = records.filter((r) => r.cancellationStatus === "Billing Hold").length;
  const closedThisMonth   = records.filter((r) => r.cancellationStatus === "Billing Closed").length;
  const revenueAtRisk     = records
    .filter((r) => !["Billing Closed", "Cancelled"].includes(r.cancellationStatus))
    .reduce((sum, r) => {
      const val = parseInt(r.mrrImpact.replace(/[^0-9]/g, ""), 10) || 0;
      return sum + val;
    }, 0);

  // Offboarding-ready records
  const offboardingReady = records.filter(
    (r) =>
      (r.cancellationStatus === "Approved for Offboarding"||
        r.finalInvoiceStatus === "Paid"||
        r.outstandingBalance === "$0") &&
      r.offboardingStatus !== "Triggered"&&
      r.offboardingStatus !== "In Progress"&&
      r.offboardingStatus !== "Complete"&&
      r.cancellationStatus !== "Billing Closed");

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

      {/*  Task Management Engine Banner  */}
      <TaskAccessCard
        context="Cancellations" variant="banner" counters={{ open: 5, overdue: 1, dueToday: 2, completed: 9 }}
        createLabel="Create Cancellation Task" examples={["Cancellation Review", "Retention Call", "Final Invoice", "Billing Close"]}
        tasksHref="/billing/tasks"
      />

      {/*  Header  */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}
        >
          {workspace.name}
        </p>
        <h1
          className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}
        >
          Billing Cancellations
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Manage cancellation billing impact, final invoice status, and account closure. Billing's job ends at notifying AM - downstream steps are owned by Account Management.
        </p>
      </div>

      {/*  Top Action Bar  */}
      <div className="flex flex-wrap gap-2">
        <ActionBtn variant="primary"label="+ New Cancellation Review"onClick={() => addEvent("-", "New Cancellation Review Started", "Billing", "Cancellation Requested", "Not Started")} />
        <ActionBtn variant="secondary"label="Export Cancellation Queue"onClick={() => addEvent("-", "Cancellation Queue Exported", "Billing", "-", "-")} />
        <ActionBtn variant="secondary" label="Sync Billing Status" onClick={() => addEvent("-", "Billing Status Synced", "System", "-", "-")} />
      </div>

      {/*  KPI Cards  */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Pending Reviews"value={String(pendingReviews)}
          subtitle="Awaiting billing review"accentColor="#D97706"iconBg="#FFFBEB"iconColor="#D97706"
        />
        <KpiCard
          title="Approved Cancellations"value={String(approvedCount)}
          subtitle="Approved or closed"accentColor="#059669"iconBg="#ECFDF5"iconColor="#059669"
        />
        <KpiCard
          title="Final Invoices Pending"value={String(finalInvPending)}
          subtitle="Need invoice action"accentColor="#1B4FD8"iconBg="#EFF6FF"iconColor="#1B4FD8"
        />
        <KpiCard
          title="Unpaid Balances"value={String(unpaidBalances)}
          subtitle="Outstanding amounts"accentColor="#DC2626"iconBg="#FEF2F2"iconColor="#DC2626"
        />
        <KpiCard
          title="AM Notified" value={String(offboardTriggered)}
          subtitle="AM handoff signaled" accentColor="#7C3AED" iconBg="#F5F3FF" iconColor="#7C3AED"
        />
        <KpiCard
          title="Billing Holds"value={String(billingHolds)}
          subtitle="Active holds"accentColor="#0891B2"iconBg="#ECFEFF"iconColor="#0891B2"
        />
        <KpiCard
          title="Closed This Month"value={String(closedThisMonth)}
          subtitle="Billing fully closed"accentColor="#059669"iconBg="#ECFDF5"iconColor="#059669"
        />
        <KpiCard
          title="Revenue at Risk"value={`$${revenueAtRisk.toLocaleString()}`}
          subtitle="MRR from open cancellations"accentColor="#DC2626"iconBg="#FEF2F2"iconColor="#DC2626"
        />
      </div>

      {/*  Lifecycle Flow  */}
      <LifecycleFlow />

      {/*  */}
      {/*  1. Cancellation Review Queue  */}
      {/*  */}
      <SectionWrapper
        title="Cancellation Review Queue"description="Primary billing review table. Take action on each cancellation record.">
        <div
          className="overflow-x-auto rounded-lg border"style={{ borderColor: "var(--rtm-border-light)"}}
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
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => (
                <tr
                  key={row.id}
                  style={{ background: "var(--rtm-bg)"}}
                  className="hover:bg-[var(--rtm-bg-alt,#F9FAFB)] transition-colors">
                  <Td>
                    <span
                      className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}
                    >
                      {row.client}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge
                      variant={cancellationStatusVariant(row.cancellationStatus)}
                      label={row.cancellationStatus}
                      size="sm"/>
                  </Td>
                  <Td muted>{row.requestedDate}</Td>
                  <Td muted>{row.requestedBy}</Td>
                  <Td muted>{row.amOwner}</Td>
                  <Td muted>{row.billingOwner}</Td>
                  <Td>
                    <span
                      className="font-semibold text-sm"style={{ color: "#DC2626"}}
                    >
                      {row.mrrImpact}
                    </span>
                  </Td>
                  <Td muted>{row.contractEndDate}</Td>
                  <Td>
                    <span
                      className="font-semibold text-sm"style={{ color: row.outstandingBalance !== "$0"? "#DC2626": "#059669"}}
                    >
                      {row.outstandingBalance}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge
                      variant={finalInvoiceVariant(row.finalInvoiceStatus)}
                      label={row.finalInvoiceStatus}
                      size="sm"/>
                  </Td>
                  <Td>
                    <StatusBadge
                      variant={offboardingVariant(row.offboardingStatus)}
                      label={row.offboardingStatus}
                      size="sm"/>
                  </Td>
                  <Td>
                    <StatusBadge
                      variant={priorityVariant(row.priority)}
                      label={row.priority}
                      size="sm"/>
                  </Td>
                  <Td tight>
                    <span
                      className="text-xs"style={{ color: "var(--rtm-text-muted)"}}
                    >
                      {row.nextBillingAction}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      <ActionBtn
                        small
                        variant="secondary"label="Review Billing"onClick={() => setModal({ kind: "review", record: row })}
                      />
                      <ActionBtn
                        small
                        variant="secondary"label="Create Final Invoice"onClick={() => setModal({ kind: "invoice", record: row })}
                      />
                      <ActionBtn
                        small
                        variant="secondary"label="Mark Balance Cleared"onClick={() => {
                          updateRecordStatus(row.id, "Approved for Offboarding", "Notify AM");
                          addEvent(row.client, "Balance Cleared", "Billing", "Approved for Offboarding", row.offboardingStatus, "Balance marked cleared");
                        }}
                      />
                      <ActionBtn
                        small
                        variant="danger"label="Place Billing Hold"onClick={() => setModal({ kind: "hold", record: row })}
                      />
                      <ActionBtn
                        small
                        variant="secondary" label="Notify AM" onClick={() => setModal({ kind: "offboard", record: row })}
                      />
                      <ActionBtn
                        small
                        variant="secondary"label="Close Billing"onClick={() => setModal({ kind: "close", record: row })}
                      />
                      <ActionBtn
                        small
                        variant="ghost"label="Add Note"onClick={() => addEvent(row.client, "Note Added", "Billing", row.cancellationStatus, row.offboardingStatus)}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/*  */}
      {/*  2. Billing Impact Review  */}
      {/*  */}
      <SectionWrapper
        title="Billing Impact Review"description="Financial snapshot of each cancellation - refunds, prorations, balances, and billing decisions.">
        <div
          className="overflow-x-auto rounded-lg border"style={{ borderColor: "var(--rtm-border-light)"}}
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
                  style={{ background: "var(--rtm-bg)"}}
                  className="hover:bg-[var(--rtm-bg-alt,#F9FAFB)] transition-colors">
                  <Td>
                    <span
                      className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}
                    >
                      {row.client}
                    </span>
                  </Td>
                  <Td muted>{row.currentPlan}</Td>
                  <Td>
                    <span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                      {row.monthlyValue}
                    </span>
                  </Td>
                  <Td muted>{row.remainingContractValue}</Td>
                  <Td>
                    {row.refundRequired ? (
                      <StatusBadge variant="warning"label="Yes"size="sm"/>
                    ) : (
                      <StatusBadge variant="neutral"label="No"size="sm"/>
                    )}
                  </Td>
                  <Td muted>{row.proratedAmount}</Td>
                  <Td>
                    <span
                      className="font-semibold text-sm"style={{ color: row.outstandingBalance !== "$0"? "#DC2626": "#059669"}}
                    >
                      {row.outstandingBalance}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge
                      variant={finalInvoiceVariant(row.finalInvoiceStatus)}
                      label={row.finalInvoiceStatus}
                      size="sm"/>
                  </Td>
                  <Td>
                    <span
                      className="text-xs font-medium"style={{
                        color: row.paymentMethodStatus === "Failed"|| row.paymentMethodStatus === "On Hold"? "#DC2626": row.paymentMethodStatus === "Closed"? "var(--rtm-text-muted)": "#059669",
                      }}
                    >
                      {row.paymentMethodStatus}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-md border"style={{
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

      {/*  3. AM Notification Queue  */}
      <SectionWrapper
        title="AM Notification Queue"
        description="Clients where Billing has cleared all balances. Use Notify AM to signal Account Management. Billing's job ends here.">
        {offboardingReady.length === 0 ? (
          <div
            className="text-center py-8 text-sm"style={{ color: "var(--rtm-text-muted)"}}
          >
            No clients currently ready for AM notification.
          </div>
        ) : (
          <div
            className="overflow-x-auto rounded-lg border"style={{ borderColor: "var(--rtm-border-light)"}}
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
                  const finalSent      = row.finalInvoiceStatus === "Paid"|| row.finalInvoiceStatus === "Sent"|| row.finalInvoiceStatus === "Not Required";
                  const approved       = ["Approved for Offboarding", "Final Invoice Needed", "Pending Balance"].includes(row.cancellationStatus) || billingCleared;
                  return (
                    <tr
                      key={row.id}
                      style={{ background: "var(--rtm-bg)"}}
                      className="hover:bg-[var(--rtm-bg-alt,#F9FAFB)] transition-colors">
                      <Td>
                        <span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                          {row.client}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge variant={billingCleared ? "success": "warning"} label={billingCleared ? "Yes": "No"} size="sm"/>
                      </Td>
                      <Td>
                        <StatusBadge variant={finalSent ? "success": "warning"} label={finalSent ? "Yes": "No"} size="sm"/>
                      </Td>
                      <Td>
                        <span className="font-semibold text-sm"style={{ color: row.outstandingBalance !== "$0"? "#DC2626": "#059669"}}>
                          {row.outstandingBalance}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge variant={approved ? "success": "warning"} label={approved ? "Yes": "Pending"} size="sm"/>
                      </Td>
                      <Td>
                        <StatusBadge variant={offboardingVariant(row.offboardingStatus)} label={row.offboardingStatus} size="sm"/>
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
                            onClick={() => setModal({ kind: "offboard", record: row })}
                          />
                          <ActionBtn
                            small
                            variant="secondary"
                            label="Close Billing"
                            onClick={() => setModal({ kind: "close", record: row })}
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

      {/*  */}
      {/*  4. Recent Cancellation Billing Events  */}
      {/*  */}
      <SectionWrapper
        title="Recent Cancellation Billing Events"description="Live event log for all cancellation and offboarding billing actions.">
        <div
          className="overflow-x-auto rounded-lg border"style={{ borderColor: "var(--rtm-border-light)"}}
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
                  ev.event === "Billing Closed"|| ev.event === "Balance Cleared"? "success": ev.event === "Offboarding Triggered"|| ev.event.includes("Triggered")
                    ? "info": ev.event === "Billing Hold Placed"? "error": ev.event === "Final Invoice Created"? "warning": "neutral";

                return (
                  <tr
                    key={i}
                    style={{ background: "var(--rtm-bg)"}}
                    className="hover:bg-[var(--rtm-bg-alt,#F9FAFB)] transition-colors">
                    <Td muted>{ev.date}</Td>
                    <Td>
                      <span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                        {ev.client}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge variant={evVariant} label={ev.event} size="sm"/>
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
      </SectionWrapper>

      {/*  Route-Ready Navigation Links  */}
      <div
        className="rounded-xl border p-5 space-y-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}
        >
          Connected Systems
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Account Management", href: "/account-management", color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
            { label: "Client Portfolio",   href: "/billing/client-portfolio", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
            { label: "Workflow Engine",    href: "/admin/workflows",    color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
            { label: "Tasks",             href: "/billing/tasks",      color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
            { label: "Billing Dashboard", href: workspace.dashboardRoute, color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold px-3.5 py-2 rounded-lg border transition-colors hover:opacity-80"style={{ background: link.bg, color: link.color, borderColor: link.border }}
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </div>

      {/*  Modals  */}
      {modal?.kind === "review"&& (
        <ReviewBillingModal
          record={modal.record}
          onClose={() => setModal(null)}
          onSave={(msg) => {
            addEvent(modal.record.client, "Billing Review Started", "Billing", "Billing Review", modal.record.offboardingStatus, msg);
            updateRecordStatus(modal.record.id, "Billing Review", "Create Final Invoice or Stop Billing");
          }}
        />
      )}
      {modal?.kind === "invoice"&& (
        <CreateFinalInvoiceModal
          record={modal.record}
          onClose={() => setModal(null)}
          onSave={(msg) => {
            addEvent(modal.record.client, "Final Invoice Created", "Billing", "Final Invoice Needed", modal.record.offboardingStatus, msg);
            updateRecordStatus(modal.record.id, "Final Invoice Needed", "Collect Payment on Final Invoice");
          }}
        />
      )}
      {modal?.kind === "hold"&& (
        <BillingHoldModal
          record={modal.record}
          onClose={() => setModal(null)}
          onSave={(msg) => {
            addEvent(modal.record.client, "Billing Hold Placed", "Billing", "Billing Hold", modal.record.offboardingStatus, msg);
            updateRecordStatus(modal.record.id, "Billing Hold", "Resolve Hold - Escalate to AM");
          }}
        />
      )}
      {modal?.kind === "offboard" && (
        <NotifyAMModal
          record={modal.record}
          onClose={() => setModal(null)}
          onSave={(msg) => {
            // Update Billing's local record state.
            addEvent(modal.record.client, "AM Notified", "Billing", "Approved for Offboarding", "Triggered", msg);
            updateRecordStatus(modal.record.id, "Approved for Offboarding", "Close Billing", "Triggered");

            // CROSS-WORKSPACE SIGNAL: create a real offboarding record on AM's Offboarding page.
            // Looks up the cancellation reason from the AM-initiated queue if available,
            // otherwise defaults to the first locked category.
            const queueEntry = amQueue.find(
              (r) => r.client === modal.record.client
            );
            // POST to file-backed API — cross-route-group reliable.
            fetch("/api/pending-offboarding-records", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                client: modal.record.client,
                accountManager: modal.record.amOwner,
                reason: queueEntry?.reason ?? "Pending Client Confirmation",
                mrr: parseInt(modal.record.monthlyValue.replace(/[^0-9]/g, ""), 10) || 0,
                offboardingOwner: modal.record.amOwner,
                billingOwner: modal.record.billingOwner,
                billingHandoffNotes: msg,
              }),
            }).catch((err) => console.error("[Billing Cancellations] Failed to create offboarding record:", err));

            showToast(`✅ AM notified for ${modal.record.client} — Offboarding case created in Account Management`, "success");
          }}
        />
      )}
      {modal?.kind === "close"&& (
        <CloseBillingModal
          record={modal.record}
          onClose={() => setModal(null)}
          onSave={(msg) => {
            addEvent(modal.record.client, "Billing Closed", "Billing", "Billing Closed", "Complete", msg);
            updateRecordStatus(modal.record.id, "Billing Closed", "Archived", "Complete");
          }}
        />
      )}
    </div>
  );
}
