"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge, DetailDrawer } from "@/components/ui";
import type { DrawerTab } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import {
  MASTER_CLIENTS,
  computeHealth,
  computePriority,
} from "@/lib/mock/master-clients";
import type { MasterClient } from "@/lib/mock/master-clients";
import { upsertMasterClient, fetchMasterClients } from "@/lib/mock/master-clients-api";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";

import type { WorkspaceTask } from "@/components/workspace";

const workspace = getWorkspace("billing")!;

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceStatus =
  | "Draft"
  | "Ready To Send"
  | "Sent"
  | "Viewed"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Cancelled"
  | "Escalated";

type PaymentStatus = "Unpaid" | "Partial" | "Paid" | "Failed" | "N/A";
type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

interface InvoiceRow {
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
  archived?: boolean;
  /** Set when invoice was generated from a Sales Handoff row — links back to that row */
  salesHandoffId?: string;
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
  /** Invoice number generated from this row, if any */
  generatedInvoiceNumber?: string;
}

// ─── Initial invoice data ─────────────────────────────────────────────────────

const INITIAL_INVOICES: InvoiceRow[] = [
  { id: "1",  client: "Apex Roofing",         invoiceNumber: "INV-0051", contractValue: "$31,200", setupFee: "$800",   monthlyValue: "$2,400", invoiceStatus: "Sent",           paymentStatus: "Unpaid",  dueDate: "Jun 15", billingOwner: "Lisa P." },
  { id: "2",  client: "Pacific Dental",       invoiceNumber: "INV-0050", contractValue: "$22,800", setupFee: "$500",   monthlyValue: "$3,800", invoiceStatus: "Paid",           paymentStatus: "Paid",    dueDate: "Jun 10", billingOwner: "Sarah K." },
  { id: "3",  client: "Sunbelt HVAC",         invoiceNumber: "INV-0048", contractValue: "$7,200",  setupFee: "$0",     monthlyValue: "$1,200", invoiceStatus: "Partially Paid", paymentStatus: "Partial", dueDate: "Jun 12", billingOwner: "Lisa P." },
  { id: "4",  client: "Harbor Auto Group",    invoiceNumber: "INV-0047", contractValue: "$60,000", setupFee: "$1,500", monthlyValue: "$5,000", invoiceStatus: "Paid",           paymentStatus: "Paid",    dueDate: "Jun 07", billingOwner: "Sarah K." },
  { id: "5",  client: "Metro Dental",         invoiceNumber: "INV-0055", contractValue: "$21,600", setupFee: "$400",   monthlyValue: "$1,800", invoiceStatus: "Draft",          paymentStatus: "N/A",     dueDate: "Jun 16", billingOwner: "Lisa P." },
  { id: "6",  client: "Blue Ridge Plumbing",  invoiceNumber: "INV-0053", contractValue: "$2,400",  setupFee: "$0",     monthlyValue: "$800",   invoiceStatus: "Paid",           paymentStatus: "Paid",    dueDate: "Jun 08", billingOwner: "Sarah K." },
  { id: "7",  client: "Green Valley Pools",   invoiceNumber: "INV-0042", contractValue: "$13,200", setupFee: "$600",   monthlyValue: "$2,200", invoiceStatus: "Overdue",        paymentStatus: "Unpaid",  dueDate: "May 20", billingOwner: "Lisa P." },
  { id: "8",  client: "Skyline Landscaping",  invoiceNumber: "INV-0049", contractValue: "$18,000", setupFee: "$300",   monthlyValue: "$1,500", invoiceStatus: "Sent",           paymentStatus: "Unpaid",  dueDate: "Jun 18", billingOwner: "Sarah K." },
  { id: "9",  client: "Cornerstone Flooring", invoiceNumber: "INV-0039", contractValue: "$38,400", setupFee: "$2,000", monthlyValue: "$3,200", invoiceStatus: "Overdue",        paymentStatus: "Unpaid",  dueDate: "May 01", billingOwner: "Lisa P." },
  { id: "10", client: "Summit Pest Control",  invoiceNumber: "INV-0044", contractValue: "$13,200", setupFee: "$300",   monthlyValue: "$1,100", invoiceStatus: "Partially Paid", paymentStatus: "Partial", dueDate: "Jun 25", billingOwner: "Sarah K." },
  { id: "11", client: "Ironclad Fitness",     invoiceNumber: "INV-0060", contractValue: "$9,600",  setupFee: "$800",   monthlyValue: "$800",   invoiceStatus: "Ready To Send",  paymentStatus: "N/A",     dueDate: "Jun 22", billingOwner: "Lisa P." },
  { id: "12", client: "Crestview Dentistry",  invoiceNumber: "INV-0061", contractValue: "$16,800", setupFee: "$1,000", monthlyValue: "$1,400", invoiceStatus: "Viewed",         paymentStatus: "Unpaid",  dueDate: "Jun 20", billingOwner: "Sarah K." },
];

const INITIAL_HANDOFF_ROWS: SalesHandoffRow[] = [
  { id: "s1", client: "Coastal Eye Care",      salesOwner: "Jake R.",  proposal: "PRO-0112", contractStatus: "Signed",    servicesSold: "SEO, PPC, Web",        billingIntakeStatus: "Complete",    invoiceCreationStatus: "Invoice Generated", generatedInvoiceNumber: "INV-0062" },
  { id: "s2", client: "Mesa Auto Repair",      salesOwner: "Tina W.",  proposal: "PRO-0109", contractStatus: "Signed",    servicesSold: "Local SEO, GMB",       billingIntakeStatus: "In Progress",  invoiceCreationStatus: "Pending" },
  { id: "s3", client: "Lakeview Orthodontics", salesOwner: "Chris M.", proposal: "PRO-0117", contractStatus: "Pending",   servicesSold: "Social, Content",      billingIntakeStatus: "Incomplete",  invoiceCreationStatus: "Blocked" },
  { id: "s4", client: "Summit HVAC",           salesOwner: "Jake R.",  proposal: "PRO-0121", contractStatus: "Signed",    servicesSold: "PPC, Web Redesign",    billingIntakeStatus: "Complete",    invoiceCreationStatus: "Invoice Generated", generatedInvoiceNumber: "INV-0063" },
  { id: "s5", client: "Heritage Dental",       salesOwner: "Tina W.",  proposal: "PRO-0124", contractStatus: "Countered", servicesSold: "SEO, Email Campaigns", billingIntakeStatus: "Incomplete",  invoiceCreationStatus: "On Hold" },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

function invoiceStatusVariant(s: InvoiceStatus): BadgeVariant {
  switch (s) {
    case "Paid":           return "success";
    case "Overdue":        return "error";
    case "Escalated":      return "error";
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
  if (s === "Complete")     return "success";
  if (s === "In Progress")  return "warning";
  if (s === "Incomplete")   return "error";
  if (s === "Info Requested") return "info";
  return "neutral";
}

function invoiceCreationVariant(s: string): BadgeVariant {
  if (s === "Invoice Generated") return "success";
  if (s === "Pending")           return "warning";
  if (s === "Blocked")           return "error";
  if (s === "On Hold")           return "neutral";
  return "neutral";
}

function getPrimaryAction(status: InvoiceStatus): string {
  switch (status) {
    case "Draft":          return "Send Invoice";
    case "Ready To Send":  return "Send Invoice";
    case "Viewed":         return "Send Reminder";
    case "Partially Paid": return "Record Payment";
    case "Overdue":        return "Escalate Collections";
    case "Paid":           return "Send To Activation Queue";
    case "Escalated":      return "View Invoice";
    default:               return "View Invoice";
  }
}

// ─── Table primitives ─────────────────────────────────────────────────────────

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

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, variant, onDismiss }: { message: string; variant: "success" | "info" | "warning" | "error"; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
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
      style={{ background: colors.bg, borderColor: colors.border, color: colors.color, minWidth: 280 }}
    >
      <span className="text-sm font-semibold flex-1">{message}</span>
      <button onClick={onDismiss} className="text-base leading-none opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────

function RecordPaymentModal({ invoice, onClose, onSave }: {
  invoice: InvoiceRow;
  onClose: () => void;
  onSave: (id: string, amount: string, method: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("ACH Transfer");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount.trim() || isNaN(Number(amount))) { setError("Enter a valid amount."); return; }
    onSave(invoice.id, amount, method);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ border: "1px solid var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>Record Payment</p>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{invoice.invoiceNumber} — {invoice.client}</h2>
          </div>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Amount Received ($)</label>
            <input
              type="number" step="0.01" placeholder="e.g. 2400.00" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Payment Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
            >
              {["ACH Transfer", "Credit Card", "Check", "Wire Transfer", "Cash"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="rounded-lg border p-3 text-xs" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-muted)" }}>
            Invoice total: <strong>{invoice.contractValue}</strong> · Current status: <strong>{invoice.paymentStatus}</strong>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 text-sm font-semibold py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Cancel</button>
            <button type="submit" className="flex-1 text-sm font-semibold py-2 rounded-lg text-white" style={{ background: "var(--rtm-blue)" }}>Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Create Invoice Modal ─────────────────────────────────────────────────────

function CreateInvoiceModal({ onClose, onSave, nextNumber, prefill }: {
  onClose: () => void;
  onSave: (invoice: InvoiceRow, handoffId?: string) => void;
  nextNumber: number;
  prefill?: { client: string; contractValue?: string; monthlyValue?: string; handoffId?: string };
}) {
  const [form, setForm] = useState({
    client: prefill?.client ?? "",
    contractValue: prefill?.contractValue ?? "",
    setupFee: "0",
    monthlyValue: prefill?.monthlyValue ?? "",
    dueDate: "",
    billingOwner: "Lisa P.",
  });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client.trim()) { setError("Client name is required."); return; }
    if (!form.contractValue.trim()) { setError("Contract value is required."); return; }
    if (!form.dueDate.trim()) { setError("Due date is required."); return; }
    const newInvoice: InvoiceRow = {
      id: `new-${Date.now()}`,
      client: form.client.trim(),
      invoiceNumber: `INV-${String(nextNumber).padStart(4, "0")}`,
      contractValue: form.contractValue.startsWith("$") ? form.contractValue : `$${form.contractValue}`,
      setupFee: form.setupFee ? (form.setupFee.startsWith("$") ? form.setupFee : `$${form.setupFee}`) : "$0",
      monthlyValue: form.monthlyValue ? (form.monthlyValue.startsWith("$") ? form.monthlyValue : `$${form.monthlyValue}`) : "$0",
      invoiceStatus: "Draft",
      paymentStatus: "N/A",
      dueDate: form.dueDate,
      billingOwner: form.billingOwner,
      salesHandoffId: prefill?.handoffId,
    };
    onSave(newInvoice, prefill?.handoffId);
    onClose();
  }

  const isFromHandoff = !!prefill?.handoffId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" style={{ border: "1px solid var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>
              {isFromHandoff ? "Generate Invoice from Sales Handoff" : "Billing"}
            </p>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {isFromHandoff ? `Invoice for ${prefill?.client}` : `Create Invoice — INV-${String(nextNumber).padStart(4, "0")}`}
            </h2>
          </div>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>
        {isFromHandoff && (
          <div className="mx-6 mt-4 rounded-lg border px-4 py-2 text-xs" style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1E3A8A" }}>
            Pre-filled from Sales Handoff data. Confirm contract value and due date before generating.
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          {[
            { label: "Client Name *",       key: "client",        placeholder: "Apex Roofing",  type: "text" },
            { label: "Contract Value *",     key: "contractValue", placeholder: "$31,200",       type: "text" },
            { label: "Setup Fee",            key: "setupFee",      placeholder: "$800",          type: "text" },
            { label: "Monthly Value",        key: "monthlyValue",  placeholder: "$2,600",        type: "text" },
            { label: "Due Date *",           key: "dueDate",       placeholder: "Jun 30",        type: "text" },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</label>
              <input
                type={type} placeholder={placeholder}
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
              />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Billing Owner</label>
            <select value={form.billingOwner} onChange={(e) => setForm((f) => ({ ...f, billingOwner: e.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
            >
              <option>Lisa P.</option>
              <option>Sarah K.</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 text-sm font-semibold py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Cancel</button>
            <button type="submit" className="flex-1 text-sm font-semibold py-2 rounded-lg text-white" style={{ background: "var(--rtm-blue)" }}>
              {isFromHandoff ? "Generate Invoice" : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sales Handoff Review Drawer ──────────────────────────────────────────────

function HandoffReviewDrawer({ row, onClose, linkedInvoice }: {
  row: SalesHandoffRow | null;
  onClose: () => void;
  linkedInvoice?: InvoiceRow;
}) {
  const [activeTab, setActiveTab] = useState("details");
  useEffect(() => { if (row) setActiveTab("details"); }, [row?.id]);
  if (!row) return null;

  const tabs: DrawerTab[] = [
    {
      id: "details",
      label: "Handoff Details",
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Client",           value: row.client },
              { label: "Sales Owner",      value: row.salesOwner },
              { label: "Proposal #",       value: row.proposal },
              { label: "Contract Status",  value: row.contractStatus },
              { label: "Services Sold",    value: row.servicesSold },
              { label: "Billing Intake",   value: row.billingIntakeStatus },
              { label: "Invoice Creation", value: row.invoiceCreationStatus },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                <p className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
              </div>
            ))}
            {row.generatedInvoiceNumber && (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Generated Invoice</p>
                <p className="text-sm font-semibold font-mono" style={{ color: "var(--rtm-blue)" }}>{row.generatedInvoiceNumber}</p>
              </div>
            )}
          </div>
          <div className="rounded-lg border px-4 py-3 text-sm space-y-1" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)" }}>
            <p className="font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Services Detail</p>
            <p>{row.servicesSold}</p>
          </div>
        </div>
      ),
    },
    {
      id: "invoice",
      label: "Linked Invoice",
      badge: linkedInvoice ? 1 : 0,
      content: (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Invoice Status</p>
          {linkedInvoice ? (
            <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--rtm-border-light)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{linkedInvoice.invoiceNumber}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{linkedInvoice.client} · Due {linkedInvoice.dueDate}</p>
                </div>
                <StatusBadge variant={invoiceStatusVariant(linkedInvoice.invoiceStatus)} label={linkedInvoice.invoiceStatus} size="sm" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Contract Value</p>
                  <p className="font-bold" style={{ color: "var(--rtm-text-primary)" }}>{linkedInvoice.contractValue}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Payment Status</p>
                  <StatusBadge variant={paymentStatusVariant(linkedInvoice.paymentStatus)} label={linkedInvoice.paymentStatus} size="sm" />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-6 text-center" style={{ borderColor: "var(--rtm-border-light)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>No invoice generated yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>Use "Generate Invoice" to create an invoice from this handoff.</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "timeline",
      label: "Timeline",
      content: (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Handoff Timeline</p>
          <div className="space-y-0">
            {[
              { date: "Today",   label: "Billing Review",      detail: "Handoff reviewed in Invoice Action Center", color: "#3B82F6" },
              { date: "Recent",  label: "Sales Handoff Sent",  detail: `${row.salesOwner} completed the handoff`,   color: "#059669" },
              { date: "Earlier", label: "Contract Signed",     detail: `${row.proposal} signed`,                    color: "#D97706" },
              { date: "Earlier", label: "Deal Closed Won",     detail: "Opportunity moved to Closed Won",           color: "#6B7280" },
            ].map((event, i) => (
              <div key={i} className="flex gap-3 pb-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: event.color }} />
                  {i < 3 && <div className="w-px flex-1 mt-1" style={{ background: "var(--rtm-border-light)" }} />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{event.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{event.detail} · {event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <DetailDrawer
      open={!!row}
      onClose={onClose}
      title={`${row.client} — Sales Handoff`}
      subtitle={`${row.proposal} · ${row.salesOwner}`}
      statusBadge={<StatusBadge variant={contractStatusVariant(row.contractStatus)} label={row.contractStatus} size="sm" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      width="lg"
    />
  );
}

// ─── Context menu (three-dot) ─────────────────────────────────────────────────

interface MenuAction { label: string; onClick: () => void; separator?: boolean; danger?: boolean; primary?: boolean; disabled?: boolean; }

function ContextMenu({ actions }: { actions: MenuAction[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const hc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const hk = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", hc);
    document.addEventListener("keydown", hk);
    return () => { document.removeEventListener("mousedown", hc); document.removeEventListener("keydown", hk); };
  }, [open, close]);

  return (
    <div ref={ref} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors"
        style={{ color: "var(--rtm-text-muted)", background: open ? "var(--rtm-border-light)" : "transparent", border: "1px solid transparent" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-border-light)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        aria-label="Row actions"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 z-50 min-w-[240px] rounded-lg shadow-xl py-1"
          style={{ top: "calc(100% + 4px)", background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          {actions.map((action, i) => (
            <React.Fragment key={i}>
              {action.separator && i > 0 && <div className="my-1 mx-3 border-t" style={{ borderColor: "var(--rtm-border-light)" }} />}
              <button
                className="w-full text-left px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: action.danger ? "#DC2626" : action.primary ? "var(--rtm-blue)" : "var(--rtm-text-primary)", background: "transparent" }}
                onMouseEnter={(e) => { if (!action.disabled) (e.currentTarget as HTMLButtonElement).style.background = action.danger ? "#FEF2F2" : "var(--rtm-bg)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                disabled={action.disabled}
                onClick={() => { if (!action.disabled) { action.onClick(); close(); } }}
              >
                {action.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Invoice Detail Drawer ────────────────────────────────────────────────────

function InvoiceDetailDrawer({ invoice, onClose }: { invoice: InvoiceRow | null; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  useEffect(() => { if (invoice) setActiveTab("overview"); }, [invoice?.id]);
  if (!invoice) return null;

  const tabs: DrawerTab[] = [
    {
      id: "overview", label: "Overview",
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Invoice Number", value: invoice.invoiceNumber },
              { label: "Client",         value: invoice.client },
              { label: "Contract Value", value: invoice.contractValue },
              { label: "Setup Fee",      value: invoice.setupFee },
              { label: "Monthly Value",  value: invoice.monthlyValue },
              { label: "Due Date",       value: invoice.dueDate },
              { label: "Billing Owner",  value: invoice.billingOwner },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                <p className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
              </div>
            ))}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Invoice Status</p>
              <StatusBadge variant={invoiceStatusVariant(invoice.invoiceStatus)} label={invoice.invoiceStatus} size="sm" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Payment Status</p>
              <StatusBadge variant={paymentStatusVariant(invoice.paymentStatus)} label={invoice.paymentStatus} size="sm" />
            </div>
          </div>
          {invoice.salesHandoffId && (
            <div className="rounded-lg border px-4 py-2 text-xs" style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1E3A8A" }}>
              Generated from Sales Handoff — auto-client creation triggers on payment.
            </div>
          )}
        </div>
      ),
    },
    {
      id: "payments", label: "Payments",
      badge: invoice.paymentStatus === "Partial" ? 1 : invoice.paymentStatus === "Paid" ? 1 : 0,
      content: (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Payment History</p>
          {invoice.paymentStatus === "Paid" ? (
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>Full Payment Received</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>ACH Transfer · Ref: REF-990021</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: "#059669" }}>{invoice.contractValue}</p>
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{invoice.dueDate}</p>
                </div>
              </div>
            </div>
          ) : invoice.paymentStatus === "Partial" ? (
            <div className="space-y-2">
              <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>Partial Payment Received</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Credit Card · Ref: REF-990045</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "#D97706" }}>$600.00</p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Jun 05</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: "#FDE68A", background: "#FFFBEB" }}>
                <p className="text-xs font-semibold" style={{ color: "#D97706" }}>Balance remaining — payment plan in place</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-4 text-center" style={{ borderColor: "var(--rtm-border-light)" }}>
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No payments recorded yet.</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "notes", label: "Notes", badge: 2,
      content: (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Internal Notes</p>
          {[
            { author: "Lisa P.",  time: "Jun 12 · 9:14 AM", text: "Client confirmed they received the invoice. Awaiting payment from accounting." },
            { author: "Sarah K.", time: "Jun 10 · 2:30 PM", text: "Follow-up call scheduled for June 17. Client mentioned potential delay due to quarter-end close." },
          ].map((note, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{note.author}</p>
                <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{note.time}</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{note.text}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "timeline", label: "Timeline",
      content: (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Activity Timeline</p>
          <div className="space-y-0">
            {[
              { date: "Jun 12", label: "Invoice Viewed",         detail: "Client opened invoice link",       color: "#3B82F6" },
              { date: "Jun 10", label: "Invoice Sent",           detail: `Sent to ${invoice.client} billing`, color: "#1B4FD8" },
              { date: "Jun 09", label: "Invoice Generated",      detail: `${invoice.invoiceNumber} created`,  color: "#6B7280" },
              { date: "Jun 07", label: "Contract Signed",        detail: "Sales handoff completed",           color: "#059669" },
              { date: "Jun 05", label: "Sales Handoff Received", detail: "Billing intake initiated",          color: "#D97706" },
            ].map((event, i) => (
              <div key={i} className="flex gap-3 pb-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: event.color }} />
                  {i < 4 && <div className="w-px flex-1 mt-1" style={{ background: "var(--rtm-border-light)" }} />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{event.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{event.detail} · {event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <DetailDrawer
      open={!!invoice}
      onClose={onClose}
      title={`${invoice.invoiceNumber} — ${invoice.client}`}
      subtitle={`Due ${invoice.dueDate} · ${invoice.billingOwner}`}
      statusBadge={<StatusBadge variant={invoiceStatusVariant(invoice.invoiceStatus)} label={invoice.invoiceStatus} size="sm" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      width="lg"
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>(INITIAL_INVOICES);
  const [handoffRows, setHandoffRows] = useState<SalesHandoffRow[]>(INITIAL_HANDOFF_ROWS);
  const [masterClients, setMasterClients] = useState<MasterClient[]>(MASTER_CLIENTS);

  // Hydrate from file-backed API on mount for cross-route-group reliability
  useEffect(() => {
    fetchMasterClients().then((live) => setMasterClients(live)).catch(() => {/* keep seed */});
  }, []);
  const [billingTaskList, setBillingTaskList] = useState<WorkspaceTask[]>(() => getWorkspaceTasksByDepartment("Billing"));
  const [drawerInvoice, setDrawerInvoice] = useState<InvoiceRow | null>(null);
  const [handoffDrawerRow, setHandoffDrawerRow] = useState<SalesHandoffRow | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<InvoiceRow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPrefill, setCreatePrefill] = useState<{ client: string; contractValue?: string; monthlyValue?: string; handoffId?: string } | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "info" | "warning" | "error" } | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const bulkRef = useRef<HTMLDivElement>(null);

  function showToast(message: string, variant: "success" | "info" | "warning" | "error" = "success") {
    setToast({ message, variant });
  }

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  // ─── Auto-create/update client in master list when invoice is paid ──────────
  async function autoCreateClientFromInvoice(inv: InvoiceRow) {
    const clientName = inv.client;
    const existing = masterClients.find(
      (c) => c.clientName.toLowerCase() === clientName.toLowerCase() ||
             c.clientName.toLowerCase().includes(clientName.toLowerCase())
    );

    const activeServices = (() => {
      // If from a handoff, parse servicesSold; otherwise leave empty
      const handoffRow = inv.salesHandoffId
        ? handoffRows.find((r) => r.id === inv.salesHandoffId)
        : undefined;
      if (handoffRow) {
        return handoffRow.servicesSold.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return existing?.activeServices ?? [];
    })();

    const monthlyNum = (() => {
      const raw = inv.monthlyValue.replace(/[$,]/g, "");
      return parseInt(raw) || 0;
    })();

    if (existing) {
      // Update billing-owned fields only
      const updatedFields = {
        billingStatus: "Cleared" as const,
        invoiceStatus: "Paid" as const,
        paymentStatus: "Paid" as const,
        activeServices: activeServices.length > 0 ? activeServices : existing.activeServices,
        billingOwner: inv.billingOwner,
        monthlyValue: monthlyNum > 0 ? monthlyNum : existing.monthlyValue,
        clientHealth: computeHealth({ billingStatus: "Cleared", paymentStatus: "Paid", cancellationStatus: existing.cancellationStatus, activationStatus: existing.activationStatus }),
        priority: computePriority(computeHealth({ billingStatus: "Cleared", paymentStatus: "Paid", cancellationStatus: existing.cancellationStatus, activationStatus: existing.activationStatus }), "Cleared"),
      };
      setMasterClients((prev) => prev.map((c) =>
        c.id === existing.id ? { ...c, ...updatedFields } : c
      ));
      // Persist to file-backed API (cross-route-group reliable)
      await upsertMasterClient({ ...existing, ...updatedFields }).catch(() => {});
      log(`✅ Master client updated: ${clientName} — billing fields synced from paid invoice`);
      showToast(`${clientName} client record updated in master list`, "success");
    } else {
      // Create new client record
      const slug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const handoffRow = inv.salesHandoffId ? handoffRows.find((r) => r.id === inv.salesHandoffId) : undefined;
      const newClient: MasterClient = {
        id: `mc-auto-${Date.now()}`,
        slug,
        clientName,
        email: "",
        industry: "Unknown",
        avatarColor: "#6366f1",
        salesStatus: "Closed Won",
        salesOwner: handoffRow?.salesOwner ?? "",
        billingStatus: "Cleared",
        invoiceStatus: "Paid",
        paymentStatus: "Paid",
        cancellationStatus: "None",
        upgradeDowngradeStatus: "None",
        cleared: false,
        activeServices,
        monthlyValue: monthlyNum,
        billingOwner: inv.billingOwner,
        // AM-owned — leave at defaults
        assignedAM: "Unassigned",
        activationStatus: "AM Assignment Needed",
        onboardingStatus: "Not Started",
        renewalDate: "—",
        renewalStatus: "N/A",
        // Computed
        clientHealth: "Good",
        priority: "High",
        currentStatus: "Invoice Paid",
        workflowStatus: "In Progress",
        lastActivity: new Date().toISOString().slice(0, 10),
        nextRequiredAction: "Invoice paid — awaiting Billing clearance for AM handoff",
        notes: `Auto-created from Sales Handoff invoice ${inv.invoiceNumber}`,
        activationChecklist: {
          invoicePaid: true,
          billingCleared: true,
          contractConfirmed: true,
          servicesConfirmed: activeServices.length > 0,
          clientContactVerified: false,
          amAssigned: false,
          onboardingRecordCreated: false,
          activationTasksCreated: false,
          kickoffNeeded: true,
          kickoffCallCompleted: false,
        },
        recentEvents: [
          { date: new Date().toISOString().slice(0, 10), actor: inv.billingOwner, action: `Client auto-created — invoice ${inv.invoiceNumber} marked paid` },
        ],
      };
      setMasterClients((prev) => [...prev, newClient]);
      // Persist to file-backed API (cross-route-group reliable)
      await upsertMasterClient(newClient).catch(() => {});
      log(`✅ New client auto-created: ${clientName} — added to master client list`);
      showToast(`${clientName} automatically created in master client list`, "success");
    }
  }

  function updateStatus(id: string, invoiceStatus: InvoiceStatus, paymentStatus: PaymentStatus, msg: string, toastVariant: "success" | "info" | "warning" | "error" = "success") {
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, invoiceStatus, paymentStatus } : inv));
    log(msg);
    showToast(msg, toastVariant);
    setDrawerInvoice((prev) => prev?.id === id ? { ...prev, invoiceStatus, paymentStatus } : prev);
  }

  function archiveInvoice(id: string) {
    const inv = invoices.find((i) => i.id === id);
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, archived: true } : i));
    log(`Archived ${inv?.invoiceNumber}`);
    showToast(`${inv?.invoiceNumber} archived`, "info");
    if (drawerInvoice?.id === id) setDrawerInvoice(null);
  }

  function handleRecordPayment(id: string, amount: string, method: string) {
    const inv = invoices.find((i) => i.id === id)!;
    const contractNum = parseFloat((inv.contractValue ?? "$0").replace(/[$,]/g, "")) || 0;
    const amountNum = parseFloat(amount);
    const isPaid = contractNum > 0 && amountNum >= contractNum;
    const newInvoiceStatus: InvoiceStatus = isPaid ? "Paid" : "Partially Paid";
    const newPaymentStatus: PaymentStatus = isPaid ? "Paid" : "Partial";
    updateStatus(id, newInvoiceStatus, newPaymentStatus,
      `Payment recorded: $${amountNum.toFixed(2)} via ${method} for ${inv.invoiceNumber}`, "success");

    // Auto-create/update client when fully paid
    if (isPaid) {
      const updatedInv: InvoiceRow = { ...inv, invoiceStatus: "Paid", paymentStatus: "Paid" };
      void autoCreateClientFromInvoice(updatedInv);
    }
  }

  function handleMarkAsPaid(id: string) {
    const inv = invoices.find((i) => i.id === id)!;
    updateStatus(id, "Paid", "Paid", `${inv.invoiceNumber} marked as Paid`, "success");
    const updatedInv: InvoiceRow = { ...inv, invoiceStatus: "Paid", paymentStatus: "Paid" };
    void autoCreateClientFromInvoice(updatedInv);
  }

  function handleCreateInvoice(inv: InvoiceRow, handoffId?: string) {
    setInvoices((prev) => [inv, ...prev]);
    log(`Created ${inv.invoiceNumber} for ${inv.client}`);
    showToast(`${inv.invoiceNumber} created for ${inv.client}`, "success");

    // If from handoff, update that row's status
    if (handoffId) {
      setHandoffRows((prev) => prev.map((r) =>
        r.id === handoffId
          ? { ...r, invoiceCreationStatus: "Invoice Generated", generatedInvoiceNumber: inv.invoiceNumber }
          : r
      ));
    }
    setCreatePrefill(undefined);
  }

  // ─── Sales Handoff actions ─────────────────────────────────────────────────

  function handleRequestMissingInfo(row: SalesHandoffRow) {
    // 1. Existing: update local billing intake status
    setHandoffRows((prev) => prev.map((r) =>
      r.id === row.id ? { ...r, billingIntakeStatus: "Info Requested" } : r
    ));

    // 2. New: create a real task on the Sales workspace's Tasks page,
    //    assigned to the Sales Owner from this handoff row.
    const today = new Date();
    const dueDate = `${today.toLocaleString("en-US", { month: "short" })} ${today.getDate() + 3}`;
    const salesTask: WorkspaceTask = {
      id: `billing-info-req-${row.id}-${Date.now()}`,
      title: `Missing sales info needed for ${row.client} — requested by Billing`,
      client: row.client,
      project: `${row.proposal} — Sales Handoff`,
      department: "Sales",
      service: "Sales",
      source: "Manual Task",
      assignee: row.salesOwner,
      priority: "High",
      status: "Pending",
      dueDate,
      blocker: null,
    };
    // POST to file-backed API — cross-route-group reliable.
    fetch("/api/pending-sales-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(salesTask),
    }).catch((err) => console.error("[Billing Invoices] Failed to persist sales task:", err));

    log(`Info request sent to Sales for ${row.client} — task assigned to ${row.salesOwner}`);
    showToast(`Missing info requested from ${row.salesOwner} for ${row.client} — task created on Sales Tasks`, "info");
  }

  function handleCreateBillingTask(row: SalesHandoffRow) {
    const newTask: WorkspaceTask = {
      id: `bi-handoff-${Date.now()}`,
      title: `Sales Handoff Review — ${row.client}`,
      client: row.client,
      project: "Billing — Sales Handoff",
      department: "Billing",
      service: "Billing",
      source: "Manual Task",
      assignee: "Lisa P.",
      priority: "High",
      status: "Pending",
      dueDate: "Jun 30",
      blocker: null,
    };
    setBillingTaskList((prev) => [newTask, ...prev]);
    log(`Billing task created for ${row.client} — visible on /billing/tasks`);
    showToast(`Billing task created for ${row.client}`, "success");
  }

  function handleGenerateInvoiceFromHandoff(row: SalesHandoffRow) {
    if (row.invoiceCreationStatus === "Invoice Generated") {
      showToast(`Invoice already generated for ${row.client}`, "info");
      return;
    }
    setCreatePrefill({
      client: row.client,
      handoffId: row.id,
    });
    setShowCreateModal(true);
  }

  const nextInvoiceNumber = Math.max(...invoices.map((i) => parseInt(i.invoiceNumber.replace("INV-", "")) || 0)) + 1;

  useEffect(() => {
    if (!bulkOpen) return;
    const handler = (e: MouseEvent) => {
      if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) setBulkOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bulkOpen]);

  const visibleInvoices = invoices.filter((i) => !i.archived);

  const kpi = {
    draft:         visibleInvoices.filter((i) => i.invoiceStatus === "Draft").length,
    readyToSend:   visibleInvoices.filter((i) => i.invoiceStatus === "Ready To Send").length,
    sent:          visibleInvoices.filter((i) => i.invoiceStatus === "Sent").length,
    viewed:        visibleInvoices.filter((i) => i.invoiceStatus === "Viewed").length,
    partiallyPaid: visibleInvoices.filter((i) => i.invoiceStatus === "Partially Paid").length,
    paid:          visibleInvoices.filter((i) => i.invoiceStatus === "Paid").length,
    overdue:       visibleInvoices.filter((i) => i.invoiceStatus === "Overdue").length,
    escalated:     visibleInvoices.filter((i) => i.invoiceStatus === "Escalated").length,
  };

  function getInvoiceMenuActions(inv: InvoiceRow): MenuAction[] {
    return [
      {
        label: "View Invoice",
        primary: true,
        onClick: () => { setDrawerInvoice(inv); log(`Viewing ${inv.invoiceNumber}`); },
      },
      {
        label: "Send Invoice",
        onClick: () => updateStatus(inv.id, "Sent", "Unpaid", `Invoice ${inv.invoiceNumber} sent to ${inv.client}`, "info"),
      },
      {
        label: "Send Reminder",
        onClick: () => { log(`Reminder sent for ${inv.invoiceNumber}`); showToast(`Reminder sent to ${inv.client}`, "info"); },
      },
      { separator: true, label: "Record Payment", onClick: () => setPaymentTarget(inv) },
      {
        label: "Mark as Paid",
        onClick: () => handleMarkAsPaid(inv.id),
      },
      { separator: true, label: "Send To Activation Queue", onClick: () => {
          if (inv.paymentStatus === "Paid" || inv.invoiceStatus === "Paid") {
            log(`${inv.client} sent to Activation Queue — clearance pending`);
            showToast(`${inv.client} added to Activation Queue`, "success");
          } else {
            showToast(`${inv.invoiceNumber} must be Paid before sending to Activation`, "warning");
          }
        },
      },
      {
        label: "Escalate to Collections",
        danger: true,
        onClick: () => updateStatus(inv.id, "Escalated", inv.paymentStatus, `${inv.invoiceNumber} escalated to Collections`, "error"),
      },
      { separator: true, label: "Archive Invoice", danger: true, onClick: () => archiveInvoice(inv.id) },
    ];
  }

  function getPrimaryActionButton(inv: InvoiceRow) {
    const action = getPrimaryAction(inv.invoiceStatus);
    const handleClick = () => {
      switch (action) {
        case "View Invoice":          setDrawerInvoice(inv); break;
        case "Send Invoice":          updateStatus(inv.id, "Sent", "Unpaid", `Invoice ${inv.invoiceNumber} sent to ${inv.client}`, "info"); break;
        case "Send Reminder":         log(`Reminder sent for ${inv.invoiceNumber}`); showToast(`Reminder sent to ${inv.client}`, "info"); break;
        case "Record Payment":        setPaymentTarget(inv); break;
        case "Escalate Collections":  updateStatus(inv.id, "Escalated", inv.paymentStatus, `${inv.invoiceNumber} escalated to Collections`, "error"); break;
        case "Send To Activation Queue":
          if (inv.paymentStatus === "Paid" || inv.invoiceStatus === "Paid") {
            log(`${inv.client} sent to Activation Queue`);
            showToast(`${inv.client} added to Activation Queue`, "success");
          } else {
            showToast(`Invoice must be Paid first`, "warning");
          }
          break;
      }
    };

    const isPrimary = action !== "View Invoice";
    return (
      <button
        onClick={handleClick}
        className="text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors"
        style={{
          background: isPrimary
            ? (inv.invoiceStatus === "Overdue" ? "#FEF2F2" : inv.invoiceStatus === "Paid" ? "#ECFDF5" : "var(--rtm-bg)")
            : "var(--rtm-bg)",
          color: isPrimary
            ? (inv.invoiceStatus === "Overdue" ? "#DC2626" : inv.invoiceStatus === "Paid" ? "#059669" : "var(--rtm-text-secondary)")
            : "var(--rtm-text-secondary)",
          borderColor: isPrimary
            ? (inv.invoiceStatus === "Overdue" ? "#FECACA" : inv.invoiceStatus === "Paid" ? "#A7F3D0" : "var(--rtm-border-light)")
            : "var(--rtm-border-light)",
          cursor: "pointer",
        }}
      >
        {action}
      </button>
    );
  }

  function getSalesHandoffMenuActions(row: SalesHandoffRow): MenuAction[] {
    const invoiceAlreadyGenerated = row.invoiceCreationStatus === "Invoice Generated";
    return [
      {
        label: "Review Sales Handoff",
        primary: true,
        onClick: () => {
          setHandoffDrawerRow(row);
          log(`Reviewing handoff for ${row.client}`);
        },
      },
      {
        label: invoiceAlreadyGenerated ? `Invoice Generated (${row.generatedInvoiceNumber ?? ""})` : "Generate Invoice",
        disabled: invoiceAlreadyGenerated,
        onClick: () => handleGenerateInvoiceFromHandoff(row),
      },
      {
        separator: true,
        label: "Request Missing Sales Information",
        onClick: () => handleRequestMissingInfo(row),
      },
      {
        label: "Create Billing Task",
        onClick: () => handleCreateBillingTask(row),
      },
      {
        separator: true,
        label: "Return To Sales",
        danger: true,
        onClick: () => {
          setHandoffRows((prev) => prev.map((r) =>
            r.id === row.id ? { ...r, billingIntakeStatus: "Returned to Sales", invoiceCreationStatus: "On Hold" } : r
          ));
          log(`${row.client} returned to Sales`);
          showToast(`${row.client} returned to Sales team`, "warning");
        },
      },
    ];
  }

  // Find linked invoice for handoff drawer
  const handoffLinkedInvoice = handoffDrawerRow
    ? invoices.find((inv) => inv.salesHandoffId === handoffDrawerRow.id || inv.invoiceNumber === handoffDrawerRow.generatedInvoiceNumber)
    : undefined;

  return (
    <div className="space-y-10">
      {/* Toast */}
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}

      {/* Modals */}
      {paymentTarget && (
        <RecordPaymentModal
          invoice={paymentTarget}
          onClose={() => setPaymentTarget(null)}
          onSave={handleRecordPayment}
        />
      )}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => { setShowCreateModal(false); setCreatePrefill(undefined); }}
          onSave={handleCreateInvoice}
          nextNumber={nextInvoiceNumber}
          prefill={createPrefill}
        />
      )}

      {/* Invoice Detail Drawer */}
      <InvoiceDetailDrawer invoice={drawerInvoice} onClose={() => setDrawerInvoice(null)} />

      {/* Sales Handoff Review Drawer */}
      <HandoffReviewDrawer
        row={handoffDrawerRow}
        onClose={() => setHandoffDrawerRow(null)}
        linkedInvoice={handoffLinkedInvoice}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Invoice Action Center</h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Generate, send, record payments, and manage all invoice actions.</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            onClick={() => { log("Exporting invoice data"); showToast("Invoice data exported", "info"); }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>

          <div ref={bulkRef} className="relative">
            <button
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
              onClick={() => setBulkOpen((v) => !v)}
            >
              Bulk Actions
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {bulkOpen && (
              <div className="absolute right-0 z-50 min-w-[200px] rounded-lg shadow-xl py-1"
                style={{ top: "calc(100% + 4px)", background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                {["Send All Ready Invoices", "Mark Selected as Paid", "Send Bulk Reminders", "Bulk Escalate to Collections", "Export Selected"].map((label, i) => (
                  <button key={i} className="w-full text-left px-4 py-2 text-sm font-medium"
                    style={{ color: "var(--rtm-text-primary)", background: "transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-bg)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    onClick={() => { log(`Bulk: ${label}`); showToast(`Bulk action: ${label}`, "info"); setBulkOpen(false); }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            style={{ background: "var(--rtm-blue)", color: "#fff", border: "none" }}
            onClick={() => { setCreatePrefill(undefined); setShowCreateModal(true); }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
          </button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--rtm-text-muted)" }}>Invoice Action Dashboard</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          <KpiCard title="Draft"          value={String(kpi.draft)}         iconBg="#F4F7FF" accentColor="#6B7280" />
          <KpiCard title="Ready To Send"  value={String(kpi.readyToSend)}   iconBg="#FFF7ED" accentColor="#D97706" />
          <KpiCard title="Sent"           value={String(kpi.sent)}          iconBg="#EFF6FF" accentColor="#1B4FD8" />
          <KpiCard title="Viewed"         value={String(kpi.viewed)}        iconBg="#F0FDF4" accentColor="#059669" />
          <KpiCard title="Partially Paid" value={String(kpi.partiallyPaid)} iconBg="#FFFBEB" accentColor="#D97706" />
          <KpiCard title="Paid"           value={String(kpi.paid)}          iconBg="#ECFDF5" accentColor="#059669" />
          <KpiCard title="Overdue"        value={String(kpi.overdue)}       iconBg="#FEF2F2" accentColor="#DC2626" />
          <KpiCard title="Escalated"      value={String(kpi.escalated)}     iconBg="#FDF4FF" accentColor="#9333EA" />
        </div>
      </section>

      {/* Invoice Queue */}
      <SectionWrapper
        title={`Invoice Queue (${visibleInvoices.length})`}
        description="Click an invoice number to open the detail drawer. Priority Action buttons are live. Use ⋮ for full action menu."
      >
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
                <Th>Priority Action</Th>
                <Th>⋮</Th>
              </tr>
            </thead>
            <tbody>
              {visibleInvoices.map((inv) => (
                <tr key={inv.id} className="transition-colors" style={{ background: "var(--rtm-bg)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg-alt, #F9FAFB)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg)"; }}
                >
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{inv.client}</span>
                      {inv.salesHandoffId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide" style={{ background: "#EFF6FF", color: "#1B4FD8" }}>Handoff</span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <button
                      className="font-mono text-xs font-semibold underline underline-offset-2"
                      style={{ color: "var(--rtm-blue)", background: "transparent", border: "none", cursor: "pointer" }}
                      onClick={() => setDrawerInvoice(inv)}
                    >
                      {inv.invoiceNumber}
                    </button>
                  </Td>
                  <Td><span className="font-semibold">{inv.contractValue}</span></Td>
                  <Td muted>{inv.setupFee}</Td>
                  <Td muted>{inv.monthlyValue}</Td>
                  <Td><StatusBadge variant={invoiceStatusVariant(inv.invoiceStatus)} label={inv.invoiceStatus} size="sm" /></Td>
                  <Td><StatusBadge variant={paymentStatusVariant(inv.paymentStatus)} label={inv.paymentStatus} size="sm" /></Td>
                  <Td muted>{inv.dueDate}</Td>
                  <Td muted>{inv.billingOwner}</Td>
                  <Td>{getPrimaryActionButton(inv)}</Td>
                  <Td><ContextMenu actions={getInvoiceMenuActions(inv)} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* Action Log */}
      {actionLog.length > 0 && (
        <div className="rounded-lg border p-4" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Action Log</p>
          <div className="space-y-1">
            {actionLog.map((entry, i) => (
              <p key={i} className="text-xs font-mono" style={{ color: "var(--rtm-text-secondary)" }}>{entry}</p>
            ))}
          </div>
        </div>
      )}

      {/* Sales Handoff Invoice Creation */}
      <SectionWrapper
        title="Sales Handoff Invoice Creation"
        description="Bridge from Sales Closed Won deals to Billing. Use ⋮ to review handoffs, generate invoices, request info, or create tasks. Marking a generated invoice Paid auto-creates the client in the master list."
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
                <Th>Billing Intake</Th>
                <Th>Invoice Creation</Th>
                <Th>⋮</Th>
              </tr>
            </thead>
            <tbody>
              {handoffRows.map((row) => (
                <tr key={row.id} className="transition-colors" style={{ background: "var(--rtm-bg)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg-alt, #F9FAFB)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg)"; }}
                >
                  <Td><span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{row.client}</span></Td>
                  <Td muted>{row.salesOwner}</Td>
                  <Td muted>{row.proposal}</Td>
                  <Td><StatusBadge variant={contractStatusVariant(row.contractStatus)} label={row.contractStatus} size="sm" /></Td>
                  <Td muted>{row.servicesSold}</Td>
                  <Td><StatusBadge variant={intakeStatusVariant(row.billingIntakeStatus)} label={row.billingIntakeStatus} size="sm" /></Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge variant={invoiceCreationVariant(row.invoiceCreationStatus)} label={row.invoiceCreationStatus} size="sm" />
                      {row.generatedInvoiceNumber && (
                        <span className="text-[10px] font-mono font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{row.generatedInvoiceNumber}</span>
                      )}
                    </div>
                  </Td>
                  <Td><ContextMenu actions={getSalesHandoffMenuActions(row)} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--rtm-text-muted)" }}>
          Auto-client creation: when a handoff-originated invoice is marked Paid, the client is automatically added to or updated in the master client list with Billing-owned fields populated.
        </p>
      </SectionWrapper>

      {/* Auto-created clients notice */}
      {masterClients.length > MASTER_CLIENTS.length && (
        <div className="rounded-xl border p-4 space-y-2" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
          <p className="text-sm font-bold" style={{ color: "#065F46" }}>
            ✅ {masterClients.length - MASTER_CLIENTS.length} client{masterClients.length - MASTER_CLIENTS.length > 1 ? "s" : ""} auto-created this session
          </p>
          <p className="text-xs" style={{ color: "#065F46" }}>
            These clients were automatically added to the master client list when their invoices were marked Paid.
            They are visible on Billing › Client Portfolio and Admin › Clients.
          </p>
          {masterClients.slice(MASTER_CLIENTS.length).map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#065F46" }}>
              <span className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-white text-[10px]" style={{ background: c.avatarColor }}>{c.clientName.charAt(0)}</span>
              {c.clientName} — {c.activeServices.join(", ") || "Services TBD"} · {c.billingOwner}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/activation" className="rtm-btn-primary text-sm">Activation →</Link>
        <Link href={workspace.tasksRoute} className="rtm-btn-secondary text-sm">Tasks →</Link>
      </div>
    </div>
  );
}
