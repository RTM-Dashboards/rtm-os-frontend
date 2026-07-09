"use client";

/**
 * Billing Client Portfolio
 *
 * DATA SOURCE: Reads from the single master client list (lib/mock/master-clients.ts).
 *   Same 20 clients shown on the Admin /clients page.
 *
 * SCOPE: Billing owns and may edit ONLY:
 *   - billingStatus, invoiceStatus, paymentStatus
 *   - cancellationStatus, upgradeDowngradeStatus
 *   - cleared  (single clearance action — once set, client leaves this activation view)
 *   - activeServices     (subscriptions = billing records)
 *   - billingOwner
 *
 * READ-ONLY (displayed, never edited from here):
 *   - clientHealth, priority  (computed from status fields — see computeHealth/computePriority)
 *   - assignedAM, activationStatus, onboardingStatus, renewalStatus (AM-owned, future module)
 *   - salesStatus, salesOwner (Sales-owned)
 *
 * REMOVED vs old page:
 *   - Cross Module Visibility panel (belongs on master /clients page only)
 *   - Full lifecycle timeline (belongs on master /clients page only)
 *   - "Approve Activation" separate button (merged into single Clearance action)
 *   - "Send To Account Management" as separate button (Clearance IS the handoff signal)
 *   - "Create Renewal Billing Task" (not a billing-owned action per scope table)
 *   - AM Status, Onboarding Status, Renewal Status editable columns
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { MASTER_CLIENTS, computeHealth, computePriority } from "@/lib/mock/master-clients";
import { patchMasterClient, upsertMasterClient, fetchMasterClients } from "@/lib/mock/master-clients-api";
import type {
  MasterClient,
  BillingStatus,
  InvoiceStatus,
  PaymentStatus,
  CancellationStatus,
  UpgradeDowngradeStatus,
  HealthStatus,
  Priority,
} from "@/lib/mock/master-clients";

const workspace = getWorkspace("billing")!;

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

// ─── Badge variant helpers ────────────────────────────────────────────────────

function billingStatusVariant(s: BillingStatus): BadgeVariant {
  switch (s) {
    case "Paid":    return "success";
    case "Cleared": return "success";
    case "Overdue": return "error";
    case "Closed":  return "neutral";
    case "Pending": return "warning";
    default:        return "neutral";
  }
}

function invoiceStatusVariant(s: InvoiceStatus): BadgeVariant {
  if (s === "Paid") return "success";
  if (s.startsWith("Overdue")) return "error";
  if (s === "Sent — Awaiting Payment") return "warning";
  if (s === "Draft") return "neutral";
  if (s === "Final invoice issued") return "info";
  return "neutral";
}

function paymentStatusVariant(s: PaymentStatus): BadgeVariant {
  if (s === "Paid" || s === "Confirmed") return "success";
  if (s === "Overdue") return "error";
  if (s === "Partial") return "warning";
  if (s === "Unpaid") return "warning";
  return "neutral";
}

function cancellationStatusVariant(s: CancellationStatus): BadgeVariant {
  if (s === "None") return "success";
  if (s === "Requested") return "error";
  if (s === "In Review") return "warning";
  if (s === "Approved") return "error";
  if (s === "Cancelled") return "neutral";
  return "neutral";
}

function healthVariant(h: HealthStatus): BadgeVariant {
  switch (h) {
    case "Excellent": return "success";
    case "Good":      return "info";
    case "At Risk":   return "warning";
    case "Critical":  return "error";
    default:          return "neutral";
  }
}

function priorityVariant(p: Priority): BadgeVariant {
  switch (p) {
    case "High":   return "error";
    case "Medium": return "warning";
    case "Low":    return "neutral";
    default:       return "neutral";
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

// ─── Context menu (three-dot) ─────────────────────────────────────────────────

interface MenuAction {
  label: string;
  onClick: () => void;
  separator?: boolean;
  danger?: boolean;
  primary?: boolean;
  disabled?: boolean;
}

function ContextMenu({ actions }: { actions: MenuAction[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
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
        <div
          className="absolute right-0 z-50 min-w-[220px] rounded-lg shadow-xl py-1"
          style={{ top: "calc(100% + 4px)", background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
        >
          {actions.map((action, i) => (
            <React.Fragment key={i}>
              {action.separator && i > 0 && (
                <div className="my-1 mx-3 border-t" style={{ borderColor: "var(--rtm-border-light)" }} />
              )}
              <button
                disabled={action.disabled}
                className="w-full text-left px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40"
                style={{ color: action.danger ? "#DC2626" : action.primary ? "var(--rtm-blue)" : "var(--rtm-text-primary)", background: "transparent" }}
                onMouseEnter={(e) => { if (!action.disabled) (e.currentTarget as HTMLButtonElement).style.background = action.danger ? "#FEF2F2" : "var(--rtm-bg)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
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

// ─── Add Client Modal ─────────────────────────────────────────────────────────

function AddClientModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (client: MasterClient) => void;
}) {
  const [form, setForm] = useState({
    clientName: "", email: "", industry: "",
    monthlyValue: "", billingOwner: "Lisa P.",
    activeServices: "",
  });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName.trim()) { setError("Client name is required."); return; }
    const slug = form.clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const services = form.activeServices ? form.activeServices.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const mv = parseInt(form.monthlyValue) || 0;
    const newClient: MasterClient = {
      id: `mc-new-${Date.now()}`,
      slug,
      clientName: form.clientName.trim(),
      email: form.email.trim(),
      industry: form.industry.trim() || "Unknown",
      avatarColor: "#6366f1",
      salesStatus: "Closed Won",
      salesOwner: "",
      billingStatus: "Pending",
      invoiceStatus: "Draft",
      paymentStatus: "Unpaid",
      cancellationStatus: "None",
      upgradeDowngradeStatus: "None",
      cleared: false,
      activeServices: services,
      monthlyValue: mv,
      billingOwner: form.billingOwner,
      assignedAM: "Unassigned",
      activationStatus: "Not Started",
      onboardingStatus: "Not Started",
      renewalDate: "—",
      renewalStatus: "N/A",
      // Computed on render — set defaults here consistent with Pending billing
      clientHealth: "Good",
      priority: "Medium",
      currentStatus: "Invoice Sent",
      workflowStatus: "Not Started",
      lastActivity: new Date().toISOString().slice(0, 10),
      nextRequiredAction: "Generate and send invoice",
      notes: "",
      activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: false, onboardingRecordCreated: false, activationTasksCreated: false, kickoffNeeded: true, kickoffCallCompleted: false },
      recentEvents: [{ date: new Date().toISOString().slice(0, 10), actor: form.billingOwner, action: "Client record created by Billing" }],
    };
    onAdd(newClient);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" style={{ border: "1px solid var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>Billing</p>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Add Client — Manual Entry</h2>
          </div>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          {[
            { label: "Client Name *", key: "clientName", placeholder: "Acme Corp", type: "text" },
            { label: "Email", key: "email", placeholder: "billing@client.com", type: "email" },
            { label: "Industry", key: "industry", placeholder: "Home Services – HVAC", type: "text" },
            { label: "Monthly Value ($)", key: "monthlyValue", placeholder: "2400", type: "number" },
            { label: "Active Services (comma-separated)", key: "activeServices", placeholder: "SEO / GBP, Google Ads", type: "text" },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
              />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Billing Owner</label>
            <select
              value={form.billingOwner}
              onChange={(e) => setForm((f) => ({ ...f, billingOwner: e.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
            >
              <option>Lisa P.</option>
              <option>Sarah K.</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 text-sm font-semibold py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
              Cancel
            </button>
            <button type="submit" className="flex-1 text-sm font-semibold py-2 rounded-lg text-white" style={{ background: "var(--rtm-blue)" }}>
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Update Invoice/Payment Status Modal ─────────────────────────────────────

function UpdateStatusModal({ client, onClose, onUpdate }: {
  client: MasterClient;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<MasterClient>) => void;
}) {
  const [billing, setBilling] = useState<BillingStatus>(client.billingStatus);
  const [invoice, setInvoice] = useState<InvoiceStatus>(client.invoiceStatus);
  const [payment, setPayment] = useState<PaymentStatus>(client.paymentStatus);
  const [cancellation, setCancellation] = useState<CancellationStatus>(client.cancellationStatus);
  const [updown, setUpdown] = useState<UpgradeDowngradeStatus>(client.upgradeDowngradeStatus);

  const billingOptions: BillingStatus[] = ["Pending", "Paid", "Overdue", "Cleared", "Closed"];
  const invoiceOptions: InvoiceStatus[] = ["Not Issued", "Draft", "Sent — Awaiting Payment", "Overdue 15d", "Overdue 30d", "Final invoice issued", "Paid"];
  const paymentOptions: PaymentStatus[] = ["Unpaid", "Partial", "Paid", "Overdue", "Confirmed", "N/A"];
  const cancellationOptions: CancellationStatus[] = ["None", "Requested", "In Review", "Approved", "Cancelled"];
  const updownOptions: UpgradeDowngradeStatus[] = ["None", "Upgrade Requested", "Downgrade Requested", "Approved", "Completed"];

  function handleSave() {
    const patch: Partial<MasterClient> = { billingStatus: billing, invoiceStatus: invoice, paymentStatus: payment, cancellationStatus: cancellation, upgradeDowngradeStatus: updown };
    // Re-compute health and priority from updated fields
    patch.clientHealth = computeHealth({ billingStatus: billing, paymentStatus: payment, cancellationStatus: cancellation, activationStatus: client.activationStatus });
    patch.priority = computePriority(patch.clientHealth, billing);
    onUpdate(client.id, patch);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ border: "1px solid var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>Update Billing Fields</p>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{client.clientName}</h2>
          </div>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs rounded-lg p-3 font-medium" style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }}>
            Only Billing-owned fields are editable here. Client Health and Priority are computed automatically and cannot be set manually.
          </p>
          {[
            { label: "Billing Status", value: billing, setter: setBilling as (v: string) => void, options: billingOptions },
            { label: "Invoice Status", value: invoice, setter: setInvoice as (v: string) => void, options: invoiceOptions },
            { label: "Payment Status", value: payment, setter: setPayment as (v: string) => void, options: paymentOptions },
            { label: "Cancellation Status", value: cancellation, setter: setCancellation as (v: string) => void, options: cancellationOptions },
            { label: "Upgrade/Downgrade Status", value: updown, setter: setUpdown as (v: string) => void, options: updownOptions },
          ].map(({ label, value, setter, options }) => (
            <div key={label} className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</label>
              <select
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none"
                style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
              >
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 text-sm font-semibold py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 text-sm font-semibold py-2 rounded-lg text-white" style={{ background: "var(--rtm-blue)" }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingClientPortfolioPage() {
  // State initialized from seed, hydrated from file-backed API on mount
  const [clients, setClients] = useState<MasterClient[]>(MASTER_CLIENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<MasterClient | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMasterClients().then((live) => setClients(live)).catch(() => {/* keep seed */});
  }, []);

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  function handleUpdate(id: string, patch: Partial<MasterClient>) {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c));
    // Persist to file-backed API
    void patchMasterClient(id, patch).catch(() => {});
    log(`Updated billing fields for ${clients.find((c) => c.id === id)?.clientName ?? id}`);
  }

  function handleAdd(newClient: MasterClient) {
    setClients((prev) => [...prev, newClient]);
    // Persist to file-backed API
    void upsertMasterClient(newClient).catch(() => {});
    log(`Added new client: ${newClient.clientName}`);
  }

  function handleClearance(id: string) {
    setClients((prev) => prev.map((c) =>
      c.id === id ? { ...c, cleared: true, billingStatus: "Cleared" as BillingStatus } : c
    ));
    // Persist to file-backed API
    void patchMasterClient(id, { cleared: true, billingStatus: "Cleared" }).catch(() => {});
    const name = clients.find((c) => c.id === id)?.clientName ?? id;
    log(`✅ Cleared ${name} — signaled ready for Account Management. Client removed from activation view.`);
  }

  // Clients eligible for Billing's activation view:
  // invoice cleared (billingStatus Cleared/Paid) but NOT yet granted clearance
  const pendingClearance = clients.filter(
    (c) => (c.billingStatus === "Cleared" || (c.billingStatus === "Paid" && c.paymentStatus === "Paid")) &&
           !c.cleared &&
           c.currentStatus !== "Lead" && c.currentStatus !== "Proposal Sent"
  );

  const filtered = search.trim()
    ? clients.filter((c) =>
        c.clientName.toLowerCase().includes(search.toLowerCase()) ||
        c.billingOwner.toLowerCase().includes(search.toLowerCase()) ||
        c.industry.toLowerCase().includes(search.toLowerCase())
      )
    : clients;

  // KPIs — Billing-scoped
  const kpi = {
    total:              clients.length,
    paid:               clients.filter((c) => c.billingStatus === "Paid" || c.billingStatus === "Cleared").length,
    overdue:            clients.filter((c) => c.billingStatus === "Overdue").length,
    cancellations:      clients.filter((c) => c.cancellationStatus === "Requested" || c.cancellationStatus === "In Review").length,
    pendingClearance:  pendingClearance.length,
    atRisk:             clients.filter((c) => c.clientHealth === "At Risk" || c.clientHealth === "Critical").length,
  };

  return (
    <div className="space-y-8">
      {/* Modals */}
      {showAddModal && (
        <AddClientModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
      )}
      {updateTarget && (
        <UpdateStatusModal client={updateTarget} onClose={() => setUpdateTarget(null)} onUpdate={handleUpdate} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Client Portfolio</h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Billing view of the master client list. Shows Billing-owned fields only. Health and Priority are computed automatically.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Client (Manual)
          </button>
          <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)", maxWidth: 240, textAlign: "right" }}>
            For clients outside the standard Sales handoff flow.
          </p>
        </div>
      </div>

      {/* Data-source notice */}
      <div className="rounded-lg border px-4 py-3 flex items-start gap-3" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
        <svg width="16" height="16" className="flex-shrink-0 mt-0.5" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm" style={{ color: "#065F46" }}>
          <span className="font-bold">Single data source.</span>{" "}
          This page reads from the same master client list as Admin › Clients ({clients.length} records).
          Billing fields updated here are immediately reflected across the system.
          Client Health and Priority are computed automatically — they cannot be manually edited anywhere.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard title="Total Clients"        value={String(kpi.total)}           accentColor="#1B4FD8"  iconBg="#EFF6FF" />
        <KpiCard title="Paid / Cleared"       value={String(kpi.paid)}            accentColor="#059669"  iconBg="#ECFDF5" />
        <KpiCard title="Overdue"              value={String(kpi.overdue)}         accentColor="#DC2626"  iconBg="#FEF2F2" />
        <KpiCard title="Cancellation Issues"  value={String(kpi.cancellations)}   accentColor="#DC2626"  iconBg="#FEF2F2" />
        <KpiCard title="Pending Clearance"   value={String(kpi.pendingClearance)} accentColor="#D97706" iconBg="#FFFBEB" />
        <KpiCard title="At Risk / Critical"   value={String(kpi.atRisk)}          accentColor="#D97706"  iconBg="#FFFBEB" />
      </div>

      {/* Pending Clearance Alert */}
      {pendingClearance.length > 0 && (
        <div className="rounded-xl border p-5 space-y-3" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" fill="none" stroke="#D97706" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold" style={{ color: "#92400E" }}>
              {pendingClearance.length} client{pendingClearance.length > 1 ? "s" : ""} with invoice cleared — awaiting Billing clearance
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingClearance.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ background: "#fff", borderColor: "#FDE68A" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.clientName}</span>
                <button
                  onClick={() => handleClearance(c.id)}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                  style={{ background: "#059669" }}
                >
                  Clearance →
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: "#92400E" }}>
            Granting clearance signals Account Management to begin their workflow. The client will no longer appear in this alert once cleared.
          </p>
        </div>
      )}

      {/* Client Portfolio Table */}
      <SectionWrapper
        title="Client Portfolio"
        description={`${filtered.length} of ${clients.length} clients — reading from master client data source`}
        actions={
          <input
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border focus:outline-none"
            style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)", width: 200 }}
          />
        }
      >
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Billing Status</Th>
                <Th>Invoice Status</Th>
                <Th>Payment Status</Th>
                <Th>Cancellation</Th>
                <Th>Upgrade/Downgrade</Th>
                <Th>Active Services</Th>
                {/* Health and Priority: read-only computed columns */}
                <Th>Health ⟨computed⟩</Th>
                <Th>Priority ⟨computed⟩</Th>
                <Th>Cleared?</Th>
                <Th>Billing Owner</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const isExpanded = expanded === client.id;
                // Recompute health/priority live for display
                const health = computeHealth(client);
                const priority = computePriority(health, client.billingStatus);
                return (
                  <React.Fragment key={client.id}>
                    <tr
                      className="transition-colors cursor-pointer"
                      style={{ background: isExpanded ? "var(--rtm-bg-alt, #F9FAFB)" : "var(--rtm-bg)" }}
                      onClick={() => setExpanded(isExpanded ? null : client.id)}
                    >
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: client.avatarColor }}>
                            {client.clientName.charAt(0)}
                          </div>
                          <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{client.clientName}</span>
                        </div>
                      </Td>
                      <Td><StatusBadge variant={billingStatusVariant(client.billingStatus)} label={client.billingStatus} size="sm" /></Td>
                      <Td><StatusBadge variant={invoiceStatusVariant(client.invoiceStatus)} label={client.invoiceStatus} size="sm" /></Td>
                      <Td><StatusBadge variant={paymentStatusVariant(client.paymentStatus)} label={client.paymentStatus} size="sm" /></Td>
                      <Td>
                        {client.cancellationStatus === "None"
                          ? <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>None</span>
                          : <StatusBadge variant={cancellationStatusVariant(client.cancellationStatus)} label={client.cancellationStatus} size="sm" />
                        }
                      </Td>
                      <Td muted>{client.upgradeDowngradeStatus}</Td>
                      <Td>
                        {client.activeServices.length === 0
                          ? <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                          : <span className="text-xs">{client.activeServices.slice(0, 2).join(", ")}{client.activeServices.length > 2 ? ` +${client.activeServices.length - 2}` : ""}</span>
                        }
                      </Td>
                      {/* Computed — read-only, no edit control */}
                      <Td><StatusBadge variant={healthVariant(health)} label={health} size="sm" /></Td>
                      <Td><StatusBadge variant={priorityVariant(priority)} label={priority} size="sm" /></Td>
                      <Td>
                        {client.cleared
                          ? <span className="text-xs font-semibold" style={{ color: "#059669" }}>✓ Yes</span>
                          : <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No</span>
                        }
                      </Td>
                      <Td muted>{client.billingOwner}</Td>
                      <Td>
                        <ContextMenu actions={[
                          {
                            label: "Update Billing Fields",
                            primary: true,
                            onClick: () => { setUpdateTarget(client); setExpanded(null); },
                          },
                          {
                            label: client.cleared ? "Already Cleared" : "Clearance →",
                            disabled: client.cleared || (client.billingStatus !== "Cleared" && client.billingStatus !== "Paid"),
                            primary: !client.cleared,
                            onClick: () => handleClearance(client.id),
                          },
                          { separator: true, label: "Start Cancellation Process", danger: true, onClick: () => { handleUpdate(client.id, { cancellationStatus: "Requested" }); } },
                          { label: "Record Upgrade Request", onClick: () => { handleUpdate(client.id, { upgradeDowngradeStatus: "Upgrade Requested" }); } },
                          { label: "Record Downgrade Request", onClick: () => { handleUpdate(client.id, { upgradeDowngradeStatus: "Downgrade Requested" }); } },
                          { separator: true, label: "Add to Invoice Queue", onClick: () => log(`Queued invoice for ${client.clientName}`) },
                        ]} />
                      </Td>
                    </tr>

                    {/* Expanded client detail — Billing-scoped only */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={12} style={{ borderBottom: "2px solid var(--rtm-border-light)" }}>
                          <div className="px-4 py-4 space-y-4" style={{ background: "#F8FAFF" }}>
                            {/* Billing Summary */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {[
                                { label: "Monthly Value", value: client.monthlyValue > 0 ? `$${client.monthlyValue.toLocaleString()}/mo` : "—" },
                                { label: "Active Services", value: client.activeServices.length > 0 ? client.activeServices.join(", ") : "None" },
                                { label: "Billing Owner", value: client.billingOwner },
                                { label: "Cleared for AM", value: client.cleared ? "Yes — handed off" : "No — pending" },
                              ].map(({ label, value }) => (
                                <div key={label} className="space-y-0.5">
                                  <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
                                </div>
                              ))}
                            </div>

                            {/* Computed fields notice */}
                            <div className="rounded-lg border px-3 py-2 flex gap-2" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                              <p className="text-xs" style={{ color: "#92400E" }}>
                                <span className="font-bold">Health:</span> {health} &nbsp;|&nbsp;
                                <span className="font-bold">Priority:</span> {priority} &nbsp;—&nbsp;
                                Both computed from Billing Status ({client.billingStatus}), Payment Status ({client.paymentStatus}), and Cancellation Status ({client.cancellationStatus}). Not manually editable.
                              </p>
                            </div>

                            {/* Current stage reference (single line) */}
                            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                              <span className="font-semibold">Current Stage:</span> {client.currentStatus}
                              &nbsp;·&nbsp;
                              <span className="font-semibold">Next Action:</span> {client.nextRequiredAction}
                            </p>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => { setUpdateTarget(client); setExpanded(null); }}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                                style={{ background: "var(--rtm-blue)" }}
                              >
                                Update Billing Fields
                              </button>
                              {!client.cleared && (
                                <button
                                  onClick={() => handleClearance(client.id)}
                                  disabled={client.billingStatus !== "Cleared" && client.billingStatus !== "Paid"}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
                                  style={{ background: "#059669" }}
                                >
                                  Clearance →
                                </button>
                              )}
                              <button
                                onClick={() => { setExpanded(null); }}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                                style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
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

      {/* Footer */}
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/invoices" className="rtm-btn-secondary text-sm">Invoices →</Link>
        <Link href={workspace.tasksRoute} className="rtm-btn-primary text-sm">Tasks →</Link>
      </div>
    </div>
  );
}
