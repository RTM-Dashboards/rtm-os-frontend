"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge, DetailDrawer } from "@/components/ui";
import type { DrawerTab } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";

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
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const invoiceQueue: InvoiceQueueRow[] = [
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

const salesHandoffRows: SalesHandoffRow[] = [
  { id: "s1", client: "Coastal Eye Care",      salesOwner: "Jake R.",   proposal: "PRO-0112", contractStatus: "Signed",    servicesSold: "SEO, PPC, Web",        billingIntakeStatus: "Complete",    invoiceCreationStatus: "Invoice Generated" },
  { id: "s2", client: "Mesa Auto Repair",      salesOwner: "Tina W.",   proposal: "PRO-0109", contractStatus: "Signed",    servicesSold: "Local SEO, GMB",       billingIntakeStatus: "In Progress",  invoiceCreationStatus: "Pending" },
  { id: "s3", client: "Lakeview Orthodontics", salesOwner: "Chris M.",  proposal: "PRO-0117", contractStatus: "Pending",   servicesSold: "Social, Content",      billingIntakeStatus: "Incomplete",  invoiceCreationStatus: "Blocked" },
  { id: "s4", client: "Summit HVAC",           salesOwner: "Jake R.",   proposal: "PRO-0121", contractStatus: "Signed",    servicesSold: "PPC, Web Redesign",    billingIntakeStatus: "Complete",    invoiceCreationStatus: "Invoice Generated" },
  { id: "s5", client: "Heritage Dental",       salesOwner: "Tina W.",   proposal: "PRO-0124", contractStatus: "Countered", servicesSold: "SEO, Email Campaigns", billingIntakeStatus: "Incomplete",  invoiceCreationStatus: "On Hold" },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

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

/** Returns the single highest-priority contextual action for a given invoice status */
function getPrimaryAction(status: InvoiceStatus): string {
  switch (status) {
    case "Draft":          return "Send Invoice";
    case "Ready To Send":  return "Send Invoice";
    case "Viewed":         return "Send Reminder";
    case "Partially Paid": return "Record Payment";
    case "Overdue":        return "Escalate Collections";
    case "Paid":           return "Send To Activation Queue";
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

// ─── Three-dot context menu ───────────────────────────────────────────────────

interface MenuAction {
  label: string;
  onClick: () => void;
  separator?: boolean;
  danger?: boolean;
  primary?: boolean;
}

function ContextMenu({ actions }: { actions: MenuAction[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, close]);

  return (
    <div ref={ref} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors"
        style={{
          color: "var(--rtm-text-muted)",
          background: open ? "var(--rtm-border-light)" : "transparent",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-border-light)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        aria-label="Row actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 min-w-[220px] rounded-lg shadow-xl py-1"
          style={{
            top: "calc(100% + 4px)",
            background: "var(--rtm-surface)",
            border: "1px solid var(--rtm-border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
          role="menu"
        >
          {actions.map((action, i) => (
            <React.Fragment key={i}>
              {action.separator && i > 0 && (
                <div className="my-1 mx-3 border-t" style={{ borderColor: "var(--rtm-border-light)" }} />
              )}
              <button
                role="menuitem"
                className="w-full text-left px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  color: action.danger
                    ? "#DC2626"
                    : action.primary
                    ? "var(--rtm-blue)"
                    : "var(--rtm-text-primary)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = action.danger
                    ? "#FEF2F2"
                    : "var(--rtm-bg)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
                onClick={() => { action.onClick(); close(); }}
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

function InvoiceDetailDrawer({
  invoice,
  onClose,
}: {
  invoice: InvoiceQueueRow | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (invoice) setActiveTab("overview");
  }, [invoice?.id]);

  if (!invoice) return null;

  const tabs: DrawerTab[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Invoice Number",  value: invoice.invoiceNumber },
              { label: "Client",          value: invoice.client },
              { label: "Contract Value",  value: invoice.contractValue },
              { label: "Setup Fee",       value: invoice.setupFee },
              { label: "Monthly Value",   value: invoice.monthlyValue },
              { label: "Due Date",        value: invoice.dueDate },
              { label: "Billing Owner",   value: invoice.billingOwner },
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

          <div className="rounded-lg border p-4 space-y-2" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Connected To</p>
            <div className="flex flex-wrap gap-2">
              {["Client Profile", "Sales Proposal", "Sales Handoff", "Contract", "Invoice History", "Billing Tasks", "Activation Queue", "Global Projects"].map((link) => (
                <span key={link} className="text-xs px-2.5 py-1 rounded-md font-medium border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                  {link}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "payments",
      label: "Payments",
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
      id: "client",
      label: "Client",
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--rtm-border-light)" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Client Profile</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Client Name",     value: invoice.client },
                { label: "Account Manager", value: invoice.billingOwner },
                { label: "Client Since",    value: "Jan 2023" },
                { label: "Lifetime Value",  value: "$84,000" },
                { label: "Active Services", value: "SEO, PPC, Web" },
                { label: "Account Health",  value: "Monitor" },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                  <p className="text-sm" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "contract",
      label: "Contract",
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--rtm-border-light)" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Contract Details</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Contract Value",  value: invoice.contractValue },
                { label: "Monthly Value",   value: invoice.monthlyValue },
                { label: "Setup Fee",       value: invoice.setupFee },
                { label: "Term",            value: "12 Months" },
                { label: "Start Date",      value: "Jul 1, 2025" },
                { label: "Renewal Date",    value: "Jul 1, 2026" },
                { label: "Contract Status", value: "Active" },
                { label: "Sales Owner",     value: "Jake R." },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                  <p className="text-sm" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      badge: 2,
      content: (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Internal Notes</p>
          {[
            { author: "Lisa P.", time: "Jun 12 · 9:14 AM",  text: "Client confirmed they received the invoice. Awaiting payment from accounting." },
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
          <button
            className="w-full text-xs font-semibold py-2 rounded-lg border transition-colors"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-surface)" }}
          >
            Add Internal Note
          </button>
        </div>
      ),
    },
    {
      id: "timeline",
      label: "Timeline",
      content: (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Activity Timeline</p>
          <div className="space-y-0">
            {[
              { date: "Jun 12", label: "Invoice Viewed",         detail: "Client opened invoice link",           color: "#3B82F6" },
              { date: "Jun 10", label: "Invoice Sent",           detail: `Sent to ${invoice.client} billing`,    color: "#1B4FD8" },
              { date: "Jun 09", label: "Invoice Generated",      detail: `${invoice.invoiceNumber} created`,     color: "#6B7280" },
              { date: "Jun 07", label: "Contract Signed",        detail: "Sales handoff completed",              color: "#059669" },
              { date: "Jun 05", label: "Sales Handoff Received", detail: "Billing intake initiated",             color: "#D97706" },
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
  const [drawerInvoice, setDrawerInvoice] = useState<InvoiceQueueRow | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const bulkRef = useRef<HTMLDivElement>(null);

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  // Close bulk menu on outside click
  useEffect(() => {
    if (!bulkOpen) return;
    function handler(e: MouseEvent) {
      if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) setBulkOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bulkOpen]);

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

  function getInvoiceMenuActions(inv: InvoiceQueueRow): MenuAction[] {
    const base: MenuAction[] = [
      { label: "View Invoice",   onClick: () => { setDrawerInvoice(inv); log(`Viewing ${inv.invoiceNumber}`); }, primary: true },
      { label: "Edit Invoice",   onClick: () => log(`Editing ${inv.invoiceNumber}`) },
      { label: "Send Invoice",   onClick: () => log(`Sent ${inv.invoiceNumber} to ${inv.client}`) },
      { separator: true, label: "Mark as Paid",    onClick: () => log(`Marked ${inv.invoiceNumber} as Paid`) },
      { label: "Record Payment", onClick: () => log(`Recording payment for ${inv.invoiceNumber}`) },
      { label: "Send Payment Reminder", onClick: () => log(`Reminder sent for ${inv.invoiceNumber}`) },
      { separator: true, label: "Escalate to Collections", onClick: () => log(`Escalated ${inv.invoiceNumber} to Collections`), danger: true },
      { label: "Create Billing Task",   onClick: () => log(`Billing task created for ${inv.invoiceNumber}`) },
      { label: "Add Internal Note",     onClick: () => log(`Note added to ${inv.invoiceNumber}`) },
      { separator: true, label: "Archive Invoice", onClick: () => log(`Archived ${inv.invoiceNumber}`) },
    ];

    // Inject status-aware primary action at top
    const primary = getPrimaryAction(inv.invoiceStatus);
    if (primary !== "View Invoice") {
      base.unshift({
        label: `${primary} (Recommended)`,
        primary: true,
        onClick: () => log(`${primary}: ${inv.invoiceNumber}`),
      });
    }

    return base;
  }

  function getSalesHandoffMenuActions(row: SalesHandoffRow): MenuAction[] {
    return [
      { label: "Review Sales Handoff",           primary: true, onClick: () => log(`Reviewing sales handoff: ${row.client}`) },
      { label: "Generate Invoice From Contract",  onClick: () => log(`Generating invoice from contract: ${row.client} — ${row.proposal}`) },
      { separator: true, label: "Request Missing Sales Information", onClick: () => log(`Requested missing info for ${row.client}`) },
      { label: "Return To Sales",                 onClick: () => log(`Returned ${row.client} to Sales`) },
      { separator: true, label: "Create Billing Task", onClick: () => log(`Billing task created for ${row.client}`) },
      { label: "Add Internal Note",               onClick: () => log(`Note added for ${row.client}`) },
    ];
  }

  return (
    <div className="space-y-10">

      {/* ── Invoice Detail Drawer ── */}
      <InvoiceDetailDrawer invoice={drawerInvoice} onClose={() => setDrawerInvoice(null)} />

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
            {workspace.name}
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Invoice Action Center
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Generate, send, record payments, and manage all invoice actions.
          </p>
        </div>

        {/* Page-level actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-bg)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-surface)"; }}
            onClick={() => log("Exporting invoice data")}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>

          {/* Bulk Actions dropdown */}
          <div ref={bulkRef} className="relative">
            <button
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-bg)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-surface)"; }}
              onClick={() => setBulkOpen((v) => !v)}
            >
              Bulk Actions
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {bulkOpen && (
              <div
                className="absolute right-0 z-50 min-w-[200px] rounded-lg shadow-xl py-1"
                style={{ top: "calc(100% + 4px)", background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
              >
                {[
                  "Send All Ready Invoices",
                  "Mark Selected as Paid",
                  "Send Bulk Reminders",
                  "Bulk Escalate to Collections",
                  "Export Selected",
                  "Archive Selected",
                ].map((label, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-4 py-2 text-sm font-medium transition-colors"
                    style={{ color: "var(--rtm-text-primary)", background: "transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-bg)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    onClick={() => { log(`Bulk action: ${label}`); setBulkOpen(false); }}
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
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            onClick={() => log("Creating new invoice")}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
          </button>
        </div>
      </div>

      {/* ── KPI Dashboard ── */}
      <section aria-labelledby="invoice-action-dashboard-heading">
        <h2 id="invoice-action-dashboard-heading" className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--rtm-text-muted)" }}>
          Invoice Action Dashboard
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          <KpiCard title="Draft"          value={String(kpi.draft)}         iconBg="#F4F7FF" accentColor="#6B7280" />
          <KpiCard title="Ready To Send"  value={String(kpi.readyToSend)}   iconBg="#FFF7ED" accentColor="#D97706" />
          <KpiCard title="Sent"           value={String(kpi.sent)}          iconBg="#EFF6FF" accentColor="#1B4FD8" />
          <KpiCard title="Viewed"         value={String(kpi.viewed)}        iconBg="#F0FDF4" accentColor="#059669" />
          <KpiCard title="Partially Paid" value={String(kpi.partiallyPaid)} iconBg="#FFFBEB" accentColor="#D97706" />
          <KpiCard title="Paid"           value={String(kpi.paid)}          iconBg="#ECFDF5" accentColor="#059669" />
          <KpiCard title="Overdue"        value={String(kpi.overdue)}       iconBg="#FEF2F2" accentColor="#DC2626" />
          <KpiCard title="Failed"         value={String(kpi.failed)}        iconBg="#FDF4FF" accentColor="#9333EA" />
        </div>
      </section>

      {/* ── Invoice Queue ── */}
      <SectionWrapper title="Invoice Queue" description="Click an invoice number to open the detail drawer. Use the row actions menu for operational actions.">
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
            <span key={s.label} className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
              {s.label}
            </span>
          ))}
        </div>

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
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {invoiceQueue.map((inv) => (
                <tr
                  key={inv.id}
                  className="transition-colors"
                  style={{ background: "var(--rtm-bg)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg-alt, #F9FAFB)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg)"; }}
                >
                  <Td>
                    <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{inv.client}</span>
                  </Td>
                  <Td>
                    <button
                      className="font-mono text-xs font-semibold underline underline-offset-2 transition-colors"
                      style={{ color: "var(--rtm-blue)", background: "transparent", border: "none", cursor: "pointer" }}
                      onClick={() => setDrawerInvoice(inv)}
                    >
                      {inv.invoiceNumber}
                    </button>
                  </Td>
                  <Td><span className="font-semibold">{inv.contractValue}</span></Td>
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
                  <Td>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-md border"
                      style={{
                        background: inv.invoiceStatus === "Overdue" ? "#FEF2F2" : inv.invoiceStatus === "Paid" ? "#ECFDF5" : "var(--rtm-bg)",
                        color: inv.invoiceStatus === "Overdue" ? "#DC2626" : inv.invoiceStatus === "Paid" ? "#059669" : "var(--rtm-text-secondary)",
                        borderColor: inv.invoiceStatus === "Overdue" ? "#FECACA" : inv.invoiceStatus === "Paid" ? "#A7F3D0" : "var(--rtm-border-light)",
                      }}
                    >
                      {getPrimaryAction(inv.invoiceStatus)}
                    </span>
                  </Td>
                  <Td>
                    <ContextMenu actions={getInvoiceMenuActions(inv)} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Action Log ── */}
      {actionLog.length > 0 && (
        <section aria-label="Action Log">
          <div className="rounded-lg border p-4" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Action Log</p>
            <div className="space-y-1">
              {actionLog.map((entry, i) => (
                <p key={i} className="text-xs font-mono" style={{ color: "var(--rtm-text-secondary)" }}>{entry}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Task Management Banner ── */}
      <TaskAccessCard
        context="Billing / Invoices"
        variant="banner"
        counters={{ open: 8, overdue: 3, dueToday: 5, completed: 22 }}
        createLabel="Create Billing Task"
        examples={["Invoice Follow-Up", "Collection Call", "Payment Review", "Billing Dispute"]}
      />

      {/* ── Sales Handoff Invoice Creation ── */}
      <section aria-labelledby="sales-handoff-heading">
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
                  <Th>Billing Intake</Th>
                  <Th>Invoice Creation</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {salesHandoffRows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors"
                    style={{ background: "var(--rtm-bg)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg-alt, #F9FAFB)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg)"; }}
                  >
                    <Td>
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{row.client}</span>
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
                      <ContextMenu actions={getSalesHandoffMenuActions(row)} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Invoice to Activation Trigger ── */}
      <section aria-labelledby="invoice-to-activation-trigger-heading">
        <div className="rounded-xl border p-6 space-y-5" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
          <div>
            <p id="invoice-to-activation-trigger-heading" className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>
              Invoice To Activation Trigger
            </p>
            <p className="text-sm" style={{ color: "#065F46" }}>
              When an invoice is marked Paid and payment is confirmed, the activation review is triggered
              automatically — pushing the client into the onboarding and activation pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Invoice Paid",                    color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
              { label: "Payment Confirmed",               color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
              { label: "Activation Review",               color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
              { label: "Ready For Client Activation",     color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
              { label: "Push To Billing Activation Center", color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD" },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ background: step.bg, color: step.color, borderColor: step.border }}>
                  {step.label}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-sm font-bold" style={{ color: "#6B7280" }}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>
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
