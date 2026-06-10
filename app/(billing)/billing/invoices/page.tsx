"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";

const workspace = getWorkspace("billing")!;

// ── Types ─────────────────────────────────────────────────────────────────────

type InvoiceStatus =
  | "Draft"
  | "Ready To Send"
  | "Sent"
  | "Viewed"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Cancelled";

type PaymentStatus = "Unpaid" | "Partial" | "Paid" | "Failed" | "N/A";
type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

interface InvoiceQueueRow {
  id: string;
  client: string;
  invoiceNumber: string;
  contractValue: string;
  setupFee: string;
  monthlyValue: string;
  invoiceStatus: InvoiceStatus;
  paymentStatus: PaymentStatus;
  dueDate: string;
  billingOwner: string;
  nextAction: string;
}

interface SalesHandoffRow {
  id: string;
  client: string;
  salesOwner: string;
  proposal: string;
  contractStatus: string;
  servicesSold: string;
  billingIntakeStatus: string;
  invoiceCreationStatus: string;
  nextAction: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const invoiceQueue: InvoiceQueueRow[] = [
  { id: "1",  client: "Apex Roofing",         invoiceNumber: "INV-0051", contractValue: "$31,200", setupFee: "$800",   monthlyValue: "$2,400", invoiceStatus: "Sent",           paymentStatus: "Unpaid",  dueDate: "Jun 15", billingOwner: "Lisa P.",  nextAction: "Follow Up On Payment" },
  { id: "2",  client: "Pacific Dental",       invoiceNumber: "INV-0050", contractValue: "$22,800", setupFee: "$500",   monthlyValue: "$3,800", invoiceStatus: "Paid",           paymentStatus: "Paid",    dueDate: "Jun 10", billingOwner: "Sarah K.", nextAction: "Archive" },
  { id: "3",  client: "Sunbelt HVAC",         invoiceNumber: "INV-0048", contractValue: "$7,200",  setupFee: "$0",     monthlyValue: "$1,200", invoiceStatus: "Partially Paid", paymentStatus: "Partial", dueDate: "Jun 12", billingOwner: "Lisa P.",  nextAction: "Collect Remaining Balance" },
  { id: "4",  client: "Harbor Auto Group",    invoiceNumber: "INV-0047", contractValue: "$60,000", setupFee: "$1,500", monthlyValue: "$5,000", invoiceStatus: "Paid",           paymentStatus: "Paid",    dueDate: "Jun 07", billingOwner: "Sarah K.", nextAction: "Archive" },
  { id: "5",  client: "Metro Dental",         invoiceNumber: "INV-0055", contractValue: "$21,600", setupFee: "$400",   monthlyValue: "$1,800", invoiceStatus: "Draft",          paymentStatus: "N/A",     dueDate: "Jun 16", billingOwner: "Lisa P.",  nextAction: "Generate Invoice" },
  { id: "6",  client: "Blue Ridge Plumbing",  invoiceNumber: "INV-0053", contractValue: "$2,400",  setupFee: "$0",     monthlyValue: "$800",   invoiceStatus: "Paid",           paymentStatus: "Paid",    dueDate: "Jun 08", billingOwner: "Sarah K.", nextAction: "Archive" },
  { id: "7",  client: "Green Valley Pools",   invoiceNumber: "INV-0042", contractValue: "$13,200", setupFee: "$600",   monthlyValue: "$2,200", invoiceStatus: "Overdue",        paymentStatus: "Unpaid",  dueDate: "May 20", billingOwner: "Lisa P.",  nextAction: "Send Payment Reminder" },
  { id: "8",  client: "Skyline Landscaping",  invoiceNumber: "INV-0049", contractValue: "$18,000", setupFee: "$300",   monthlyValue: "$1,500", invoiceStatus: "Sent",           paymentStatus: "Unpaid",  dueDate: "Jun 18", billingOwner: "Sarah K.", nextAction: "Follow Up" },
  { id: "9",  client: "Cornerstone Flooring", invoiceNumber: "INV-0039", contractValue: "$38,400", setupFee: "$2,000", monthlyValue: "$3,200", invoiceStatus: "Overdue",        paymentStatus: "Unpaid",  dueDate: "May 01", billingOwner: "Lisa P.",  nextAction: "Escalate Collections" },
  { id: "10", client: "Summit Pest Control",  invoiceNumber: "INV-0044", contractValue: "$13,200", setupFee: "$300",   monthlyValue: "$1,100", invoiceStatus: "Partially Paid", paymentStatus: "Partial", dueDate: "Jun 25", billingOwner: "Sarah K.", nextAction: "Confirm Payment Plan" },
  { id: "11", client: "Ironclad Fitness",     invoiceNumber: "INV-0060", contractValue: "$9,600",  setupFee: "$800",   monthlyValue: "$800",   invoiceStatus: "Ready To Send",  paymentStatus: "N/A",     dueDate: "Jun 22", billingOwner: "Lisa P.",  nextAction: "Send Invoice" },
  { id: "12", client: "Crestview Dentistry",  invoiceNumber: "INV-0061", contractValue: "$16,800", setupFee: "$1,000", monthlyValue: "$1,400", invoiceStatus: "Viewed",         paymentStatus: "Unpaid",  dueDate: "Jun 20", billingOwner: "Sarah K.", nextAction: "Record Payment When Received" },
];

const salesHandoffRows: SalesHandoffRow[] = [
  { id: "s1", client: "Coastal Eye Care",      salesOwner: "Jake R.",   proposal: "PRO-0112", contractStatus: "Signed",    servicesSold: "SEO, PPC, Web",       billingIntakeStatus: "Complete",   invoiceCreationStatus: "Invoice Generated", nextAction: "Send Invoice" },
  { id: "s2", client: "Mesa Auto Repair",      salesOwner: "Tina W.",   proposal: "PRO-0109", contractStatus: "Signed",    servicesSold: "Local SEO, GMB",      billingIntakeStatus: "In Progress", invoiceCreationStatus: "Pending",          nextAction: "Generate Invoice From Contract" },
  { id: "s3", client: "Lakeview Orthodontics", salesOwner: "Chris M.",  proposal: "PRO-0117", contractStatus: "Pending",   servicesSold: "Social, Content",     billingIntakeStatus: "Incomplete", invoiceCreationStatus: "Blocked",          nextAction: "Request Missing Sales Info" },
  { id: "s4", client: "Summit HVAC",           salesOwner: "Jake R.",   proposal: "PRO-0121", contractStatus: "Signed",    servicesSold: "PPC, Web Redesign",   billingIntakeStatus: "Complete",   invoiceCreationStatus: "Invoice Generated", nextAction: "Review Sales Handoff" },
  { id: "s5", client: "Heritage Dental",       salesOwner: "Tina W.",   proposal: "PRO-0124", contractStatus: "Countered", servicesSold: "SEO, Email Campaigns",billingIntakeStatus: "Incomplete", invoiceCreationStatus: "On Hold",          nextAction: "Request Missing Sales Info" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function invoiceStatusVariant(s: InvoiceStatus): BadgeVariant {
  switch (s) {
    case "Paid":           return "success";
    case "Overdue":        return "error";
    case "Partially Paid": return "warning";
    case "Sent":
    case "Viewed":         return "info";
    case "Ready To Send":  return "warning";
    case "Draft":          return "neutral";
    case "Cancelled":      return "error";
    default:               return "neutral";
  }
}

function paymentStatusVariant(s: PaymentStatus): BadgeVariant {
  switch (s) {
    case "Paid":    return "success";
    case "Failed":  return "error";
    case "Partial": return "warning";
    case "Unpaid":  return "warning";
    default:        return "neutral";
  }
}

function contractStatusVariant(s: string): BadgeVariant {
  if (s === "Signed")    return "success";
  if (s === "Pending")   return "warning";
  if (s === "Countered") return "info";
  return "neutral";
}

function intakeStatusVariant(s: string): BadgeVariant {
  if (s === "Complete")    return "success";
  if (s === "In Progress") return "warning";
  if (s === "Incomplete")  return "error";
  return "neutral";
}

function invoiceCreationVariant(s: string): BadgeVariant {
  if (s === "Invoice Generated") return "success";
  if (s === "Pending")           return "warning";
  if (s === "Blocked")           return "error";
  if (s === "On Hold")           return "neutral";
  return "neutral";
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"
      style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-alt, #F9FAFB)" }}
    >
      {children}
    </th>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td
      className="px-3 py-2.5 text-sm whitespace-nowrap border-b"
      style={{ color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}
    >
      {children}
    </td>
  );
}

function ActionBtn({
  label,
  onClick,
  variant = "secondary",
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}) {
  const base = "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer";
  const styles: Record<string, string> = {
    primary:   "bg-[var(--rtm-blue,#1B4FD8)] text-white border-transparent hover:opacity-90",
    secondary: "bg-[var(--rtm-surface,#fff)] text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:    "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
  };
  return (
    <button className={`${base} ${styles[variant]}`} onClick={onClick}>
      {label}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingInvoicesPage() {
  const [selected, setSelected] = useState<InvoiceQueueRow | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);

  // Payment recording state
  const [paymentDate, setPaymentDate] = useState("2025-06-10");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ACH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [billingNote, setBillingNote] = useState("");
  const [confirmationStatus, setConfirmationStatus] = useState<"Pending" | "Confirmed">("Pending");

  // Activation note state
  const [activationNote, setActivationNote] = useState("");

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  const contractAmt = parseFloat((selected?.contractValue ?? "$0").replace(/[^0-9.]/g, "")) || 0;
  const paidAmt = parseFloat(amountPaid.replace(/[^0-9.]/g, "")) || 0;
  const remaining = contractAmt - paidAmt;

  // KPI counts
  const kpi = {
    draft:         invoiceQueue.filter((i) => i.invoiceStatus === "Draft").length,
    readyToSend:   invoiceQueue.filter((i) => i.invoiceStatus === "Ready To Send").length,
    sent:          invoiceQueue.filter((i) => i.invoiceStatus === "Sent").length,
    viewed:        invoiceQueue.filter((i) => i.invoiceStatus === "Viewed").length,
    partiallyPaid: invoiceQueue.filter((i) => i.invoiceStatus === "Partially Paid").length,
    paid:          invoiceQueue.filter((i) => i.invoiceStatus === "Paid").length,
    overdue:       invoiceQueue.filter((i) => i.invoiceStatus === "Overdue").length,
    failed:        invoiceQueue.filter((i) => i.paymentStatus === "Failed").length,
  };

  return (
    <div className="space-y-10">

      {/* ── Header ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Invoice Action Center
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Generate, send, record payments, and manage all invoice actions. Operational invoice management for Billing.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          Invoice Action Dashboard
          ════════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="invoice-action-dashboard-heading">
        <h2
          id="invoice-action-dashboard-heading"
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          {/* Invoice Action Dashboard */}
          Invoice Action Dashboard
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          <KpiCard title="Draft Invoices"         value={String(kpi.draft)}         iconBg="#F4F7FF" accentColor="#6B7280" />
          <KpiCard title="Ready To Send"          value={String(kpi.readyToSend)}   iconBg="#FFF7ED" accentColor="#D97706" />
          <KpiCard title="Invoices Sent"          value={String(kpi.sent)}          iconBg="#EFF6FF" accentColor="#1B4FD8" />
          <KpiCard title="Invoices Viewed"        value={String(kpi.viewed)}        iconBg="#F0FDF4" accentColor="#059669" />
          <KpiCard title="Partially Paid"         value={String(kpi.partiallyPaid)} iconBg="#FFFBEB" accentColor="#D97706" />
          <KpiCard title="Paid Invoices"          value={String(kpi.paid)}          iconBg="#ECFDF5" accentColor="#059669" />
          <KpiCard title="Overdue Invoices"       value={String(kpi.overdue)}       iconBg="#FEF2F2" accentColor="#DC2626" />
          <KpiCard title="Failed Payments"        value={String(kpi.failed)}        iconBg="#FDF4FF" accentColor="#9333EA" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          Invoice Queue + Invoice Action Panel
          ════════════════════════════════════════════════════════════════════════ */}
      <SectionWrapper
        title="Invoice Queue"
        description="Select an invoice row to open the Invoice Action Panel below"
      >
        {/* Status legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: "Draft",          bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
            { label: "Ready To Send",  bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
            { label: "Sent",           bg: "#EFF6FF", color: "#1B4FD8", border: "#BFDBFE" },
            { label: "Viewed",         bg: "#F0F9FF", color: "#0891B2", border: "#BAE6FD" },
            { label: "Partially Paid", bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
            { label: "Paid",           bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
            { label: "Overdue",        bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
            { label: "Cancelled",      bg: "#F3F4F6", color: "#374151", border: "#D1D5DB" },
          ].map((s) => (
            <span
              key={s.label}
              className="text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ background: s.bg, color: s.color, borderColor: s.border }}
            >
              {s.label}
            </span>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Invoice #</Th>
                <Th>Contract Value</Th>
                <Th>Setup Fee</Th>
                <Th>Monthly Value</Th>
                <Th>Invoice Status</Th>
                <Th>Payment Status</Th>
                <Th>Due Date</Th>
                <Th>Billing Owner</Th>
                <Th>Next Action</Th>
              </tr>
            </thead>
            <tbody>
              {invoiceQueue.map((inv) => {
                const isSelected = selected?.id === inv.id;
                return (
                  <tr
                    key={inv.id}
                    onClick={() => {
                      setSelected(isSelected ? null : inv);
                      setAmountPaid("");
                      setReferenceNumber("");
                      setBillingNote("");
                      setConfirmationStatus("Pending");
                    }}
                    className="cursor-pointer transition-colors"
                    style={{ background: isSelected ? "#EFF6FF" : "var(--rtm-bg)" }}
                  >
                    <Td>
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                        {inv.client}
                      </span>
                    </Td>
                    <Td muted>{inv.invoiceNumber}</Td>
                    <Td>
                      <span className="font-semibold">{inv.contractValue}</span>
                    </Td>
                    <Td muted>{inv.setupFee}</Td>
                    <Td muted>{inv.monthlyValue}</Td>
                    <Td>
                      <StatusBadge variant={invoiceStatusVariant(inv.invoiceStatus)} label={inv.invoiceStatus} size="sm" />
                    </Td>
                    <Td>
                      <StatusBadge variant={paymentStatusVariant(inv.paymentStatus)} label={inv.paymentStatus} size="sm" />
                    </Td>
                    <Td muted>{inv.dueDate}</Td>
                    <Td muted>{inv.billingOwner}</Td>
                    <Td muted>{inv.nextAction}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ════════════════════════════════════════════════════════════════════════
          Invoice Action Panel (contextual — shown when a row is selected)
          ════════════════════════════════════════════════════════════════════════ */}
      {selected && (
        <section aria-labelledby="invoice-action-panel-heading">
          <div className="rounded-xl border p-6 space-y-6" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>

            {/* Panel header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="invoice-action-panel-heading"
                  className="text-base font-bold"
                  style={{ color: "var(--rtm-text-primary)" }}
                >
                  {/* Invoice Action Panel */}
                  Invoice Action Panel — {selected.client}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  {selected.invoiceNumber} · Due {selected.dueDate} · {selected.invoiceStatus}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
              >
                ✕ Close
              </button>
            </div>

            {/* Invoice action buttons */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>
                Invoice Actions
              </p>
              <div className="flex flex-wrap gap-2">
                <ActionBtn variant="primary"   label="Generate Invoice"      onClick={() => log(`Generated invoice for ${selected.client}`)} />
                <ActionBtn variant="secondary" label="Preview Invoice"       onClick={() => log(`Previewing ${selected.invoiceNumber}`)} />
                <ActionBtn variant="primary"   label="Send Invoice"          onClick={() => log(`Sent ${selected.invoiceNumber} to ${selected.client}`)} />
                <ActionBtn variant="secondary" label="Resend Invoice"        onClick={() => log(`Resent ${selected.invoiceNumber}`)} />
                <ActionBtn variant="secondary" label="Mark As Sent"         onClick={() => log(`Marked ${selected.invoiceNumber} as Sent`)} />
                <ActionBtn variant="primary"   label="Record Payment"        onClick={() => log(`Recording payment for ${selected.invoiceNumber}`)} />
                <ActionBtn variant="secondary" label="Mark As Paid"         onClick={() => log(`Marked ${selected.invoiceNumber} as Paid`)} />
                <ActionBtn variant="secondary" label="Mark As Partially Paid" onClick={() => log(`Marked ${selected.invoiceNumber} as Partially Paid`)} />
                <ActionBtn variant="secondary" label="Send Payment Reminder" onClick={() => log(`Payment reminder sent for ${selected.invoiceNumber}`)} />
                <ActionBtn variant="danger"    label="Cancel Invoice"        onClick={() => log(`Cancelled ${selected.invoiceNumber}`)} />
                <ActionBtn variant="secondary" label="Add Billing Note"      onClick={() => log(`Billing note added to ${selected.invoiceNumber}`)} />
              </div>
            </div>

            {/* ── Payment Recording Workflow ── */}
            <div
              className="rounded-lg border p-5 space-y-4"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
                {/* Payment Recording Workflow */}
                Payment Recording Workflow
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Payment Date</span>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Amount Paid</span>
                  <input
                    type="text"
                    placeholder="e.g. 2400"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Payment Method</span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                  >
                    {["ACH", "Wire Transfer", "Credit Card", "Check", "Stripe", "PayPal"].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Reference Number</span>
                  <input
                    type="text"
                    placeholder="e.g. REF-001234"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Remaining Balance</span>
                  <div
                    className="text-sm px-3 py-1.5 rounded-lg border font-bold"
                    style={{
                      background: "var(--rtm-bg)",
                      borderColor: "var(--rtm-border-light)",
                      color: paidAmt > 0 ? (remaining > 0 ? "#DC2626" : "#059669") : "var(--rtm-text-muted)",
                    }}
                  >
                    {paidAmt > 0 ? `$${remaining.toLocaleString()}` : "—"}
                  </div>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Confirmation Status</span>
                  <div className="flex gap-2 mt-1">
                    {(["Pending", "Confirmed"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setConfirmationStatus(s)}
                        className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
                        style={
                          confirmationStatus === s
                            ? {
                                background:  s === "Confirmed" ? "#ECFDF5" : "#FFF7ED",
                                color:       s === "Confirmed" ? "#059669" : "#D97706",
                                borderColor: s === "Confirmed" ? "#A7F3D0" : "#FDE68A",
                              }
                            : { background: "var(--rtm-surface)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Billing Notes</span>
                <textarea
                  rows={2}
                  placeholder="Add notes about this payment…"
                  value={billingNote}
                  onChange={(e) => setBillingNote(e.target.value)}
                  className="text-sm px-3 py-2 rounded-lg border resize-none"
                  style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <ActionBtn
                  variant="primary"
                  label="Save Payment"
                  onClick={() => log(`Payment saved: ${selected.invoiceNumber} — ${paymentMethod} ${amountPaid}`)}
                />
                <ActionBtn
                  variant="secondary"
                  label="Confirm Payment"
                  onClick={() => { setConfirmationStatus("Confirmed"); log(`Payment confirmed: ${selected.invoiceNumber}`); }}
                />
                <ActionBtn
                  variant="secondary"
                  label="Trigger Activation Review"
                  onClick={() => log(`Activation review triggered for ${selected.client}`)}
                />
              </div>
            </div>

            {/* Action log */}
            {actionLog.length > 0 && (
              <div className="rounded-lg border p-3" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>
                  Action Log
                </p>
                <div className="space-y-1">

      {/* ── Task Management Engine Banner ── */}
      <TaskAccessCard
        context="Billing / Invoices"
        variant="banner"
        counters={{ open: 8, overdue: 3, dueToday: 5, completed: 22 }}
        createLabel="Create Billing Task"
        examples={["Invoice Follow-Up", "Collection Call", "Payment Review", "Billing Dispute"]}
      />
                  {actionLog.map((entry, i) => (
                    <p key={i} className="text-xs font-mono" style={{ color: "var(--rtm-text-secondary)" }}>
                      {entry}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          Sales Handoff Invoice Creation
          ════════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="sales-handoff-invoice-creation-heading">
        <SectionWrapper
          title="Sales Handoff Invoice Creation"
          description="Invoices generated from Sales Closed Won deals. Review handoff data and create invoices directly from signed contracts."
        >
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
            <table className="min-w-full">
              <thead>
                <tr>
                  <Th>Client</Th>
                  <Th>Sales Owner</Th>
                  <Th>Proposal</Th>
                  <Th>Contract Status</Th>
                  <Th>Services Sold</Th>
                  <Th>Billing Intake Status</Th>
                  <Th>Invoice Creation Status</Th>
                  <Th>Next Action</Th>
                </tr>
              </thead>
              <tbody>
                {salesHandoffRows.map((row) => (
                  <tr key={row.id} className="transition-colors" style={{ background: "var(--rtm-bg)" }}>
                    <Td>
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                        {row.client}
                      </span>
                    </Td>
                    <Td muted>{row.salesOwner}</Td>
                    <Td muted>{row.proposal}</Td>
                    <Td>
                      <StatusBadge variant={contractStatusVariant(row.contractStatus)} label={row.contractStatus} size="sm" />
                    </Td>
                    <Td muted>{row.servicesSold}</Td>
                    <Td>
                      <StatusBadge variant={intakeStatusVariant(row.billingIntakeStatus)} label={row.billingIntakeStatus} size="sm" />
                    </Td>
                    <Td>
                      <StatusBadge variant={invoiceCreationVariant(row.invoiceCreationStatus)} label={row.invoiceCreationStatus} size="sm" />
                    </Td>
                    <Td>
                      <div className="flex gap-1.5 flex-wrap">
                        <ActionBtn variant="secondary" label="Review Sales Handoff"          onClick={() => log(`Reviewing sales handoff: ${row.client}`)} />
                        <ActionBtn variant="primary"   label="Generate Invoice From Contract" onClick={() => log(`Generating invoice from contract: ${row.client} — ${row.proposal}`)} />
                        <ActionBtn variant="secondary" label="Request Missing Sales Info"     onClick={() => log(`Requested missing info for ${row.client}`)} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          Invoice To Activation Trigger
          ════════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="invoice-to-activation-trigger-heading">
        <div className="rounded-xl border p-6 space-y-5" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>

          <div>
            <p
              id="invoice-to-activation-trigger-heading"
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "#059669" }}
            >
              {/* Invoice To Activation Trigger */}
              Invoice To Activation Trigger
            </p>
            <p className="text-sm" style={{ color: "#065F46" }}>
              When an invoice is marked Paid and payment is confirmed, the activation review is triggered
              automatically — pushing the client into the onboarding and activation pipeline.
            </p>
          </div>

          {/* Trigger flow steps */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Invoice Paid",                  color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
              { label: "Payment Confirmed",             color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
              { label: "Activation Review",             color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
              { label: "Ready For Client Activation",   color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
              { label: "Push To Billing Activation Center", color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD" },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <span
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                  style={{ background: step.bg, color: step.color, borderColor: step.border }}
                >
                  {step.label}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-sm font-bold" style={{ color: "#6B7280" }}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Activation actions */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#065F46" }}>
              Activation Actions
            </p>
            <div className="flex flex-wrap gap-2">
              <ActionBtn variant="primary"   label="Start Activation Review"        onClick={() => log("Activation review started")} />
              <ActionBtn variant="primary"   label="Approve Activation"             onClick={() => log("Activation approved")} />
              <ActionBtn variant="secondary" label="Send To Client Activation Center" onClick={() => log("Pushed to Client Activation Center")} />
              <ActionBtn variant="secondary" label="Add Activation Note"            onClick={() => log("Activation note added")} />
            </div>
          </div>

          {/* Activation note field */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold" style={{ color: "#065F46" }}>Activation Note</span>
            <textarea
              rows={2}
              placeholder="Add a note for the activation team…"
              value={activationNote}
              onChange={(e) => setActivationNote(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border resize-none"
              style={{ background: "#fff", borderColor: "#A7F3D0", color: "var(--rtm-text-primary)" }}
            />
          </label>
        </div>
      </section>

      {/* ── Footer nav ── */}
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          ← Dashboard
        </Link>
        <Link href="/billing/activation" className="rtm-btn-primary text-sm inline-flex items-center gap-1">
          Activation →
        </Link>
        <Link href={workspace.tasksRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          Tasks →
        </Link>
      </div>
    </div>
  );
}
