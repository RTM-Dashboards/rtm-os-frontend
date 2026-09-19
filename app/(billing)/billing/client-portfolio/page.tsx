"use client";

/**
 * Billing Client Portfolio
 *
 * DATA SOURCE: Reads from /api/clients and /api/businesses via fetchAMClients().
 * No mock data. No fallback. An empty table means zero real records exist.
 *
 * One row per Business (domain). A client with three domains has three rows.
 * Billing is per-Business — invoiceStatus, paymentStatus, cleared, and
 * activeServices all live on Business.
 *
 * SCOPE: Billing may write:
 *   - invoiceStatus, paymentStatus, activeServices (via patchBusiness)
 *   - cleared — single clearance action that signals AM to begin their workflow
 *
 * NOT TRACKED PER-BUSINESS (no equivalent field, controls disabled):
 *   - billingStatus (MasterClient aggregated enum — replaced by invoiceStatus + paymentStatus)
 *   - cancellationStatus — not on Business schema
 *   - upgradeDowngradeStatus — not on Business schema
 *   - billingOwner — not on Business schema
 *   - industry — not on Client or Business schema
 *
 * READ-ONLY (displayed, never edited from here):
 *   - clientHealth, priority — computed from invoiceStatus + paymentStatus + activationStatus
 *   - assignedAM, activationStatus, onboardingStatus — AM-owned
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { computeHealth, computePriority } from "@/lib/mock/master-clients";
import {
  fetchAMClients,
  patchBusiness,
  type BusinessClient,
} from "@/lib/account-management/am-client-data";
import { SERVICE_PRESETS } from "@/lib/billing/service-utils";
import type {
  HealthStatus,
  Priority,
} from "@/lib/mock/master-clients";

const workspace = getWorkspace("billing")!;

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

// ── Map BusinessClient billing fields to computeHealth-compatible input ───────
//
// computeHealth expects { billingStatus, paymentStatus, cancellationStatus, activationStatus }.
// Business has invoiceStatus and paymentStatus (different enum values) but not billingStatus
// or cancellationStatus. We map to the closest equivalent:
//   invoiceStatus "overdue" → billingStatus "Overdue"
//   invoiceStatus "paid"    → billingStatus "Paid"
//   invoiceStatus "cleared" → billingStatus "Cleared"
//   other                   → billingStatus "Pending"
//   cancellationStatus      → always "None" (no cancellation concept on Business)
//   activationStatus        → pass through (same concept, different casing)

function toHealthInput(b: BusinessClient): Parameters<typeof computeHealth>[0] {
  const inv = b.invoiceStatus?.toLowerCase() ?? "";
  const pay = b.paymentStatus?.toLowerCase() ?? "";

  let billingStatus: "Paid" | "Cleared" | "Overdue" | "Pending" | "Closed" = "Pending";
  if (inv === "paid") billingStatus = "Paid";
  else if (inv === "cleared") billingStatus = "Cleared";
  else if (inv === "overdue") billingStatus = "Overdue";
  else if (inv === "closed") billingStatus = "Closed";

  let paymentStatus: "Paid" | "Overdue" | "Unpaid" | "Partial" | "Confirmed" | "N/A" = "Unpaid";
  if (pay === "paid" || pay === "confirmed") paymentStatus = "Paid";
  else if (pay === "overdue") paymentStatus = "Overdue";
  else if (pay === "partial") paymentStatus = "Partial";
  else if (pay === "n/a") paymentStatus = "N/A";

  // activationStatus on BusinessClient uses lowercase ("inactive", "pending", "active").
  // computeHealth expects an ActivationStatus value (no "Pending" in that union).
  // Map: active → Active, pending → AM Assignment Needed (assigned but not yet active),
  //       inactive/anything else → Not Started.
  const act = b.activationStatus ?? "";
  const activationStatus: import("@/lib/mock/master-clients").ActivationStatus =
    act === "active" ? "Active" :
    act === "pending" ? "AM Assignment Needed" :
    "Not Started";

  return {
    billingStatus,
    paymentStatus,
    cancellationStatus: "None",
    activationStatus,
  };
}

// ── Derive a stable avatar color from a business id string ───────────────────

const AVATAR_COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

function avatarColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ── Whether a Business is eligible for the clearance alert ───────────────────
//
// Original predicate (against MasterClient):
//   billingStatus === "Cleared" || (billingStatus === "Paid" && paymentStatus === "Paid")
//   AND !cleared
//   AND currentStatus !== "Lead" && currentStatus !== "Proposal Sent"
//
// Business equivalent:
//   invoiceStatus "paid" or "cleared", paymentStatus "paid" or "confirmed"
//   AND !cleared
//   Business records only exist once an invoice has been marked Paid — they were
//   created via MarkPaidFlowModal, so there is no "Lead"/"Proposal Sent" equivalent.
//   Every Business in the database has already passed the invoice-paid gate.

function isClearanceReady(b: BusinessClient): boolean {
  if (b.cleared) return false;
  const inv = b.invoiceStatus?.toLowerCase() ?? "";
  const pay = b.paymentStatus?.toLowerCase() ?? "";
  return (inv === "paid" || inv === "cleared") && (pay === "paid" || pay === "confirmed");
}

// ─── Badge variant helpers ────────────────────────────────────────────────────

function invoiceStatusVariant(s: string): BadgeVariant {
  const l = s?.toLowerCase() ?? "";
  if (l === "paid") return "success";
  if (l.startsWith("overdue")) return "error";
  if (l === "sent" || l === "sent — awaiting payment") return "warning";
  if (l === "draft") return "neutral";
  if (l === "final invoice issued") return "info";
  return "neutral";
}

function paymentStatusVariant(s: string): BadgeVariant {
  const l = s?.toLowerCase() ?? "";
  if (l === "paid" || l === "confirmed") return "success";
  if (l === "overdue") return "error";
  if (l === "partial") return "warning";
  if (l === "unpaid") return "warning";
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

// ─── Update Invoice/Payment/Services Modal ────────────────────────────────────
//
// Editable fields: invoiceStatus, paymentStatus, activeServices.
// These three have equivalents on Business and are wired to patchBusiness.
//
// NOT EDITABLE (no Business field):
//   - billingStatus (MasterClient-specific aggregated enum — removed)
//   - cancellationStatus — not on Business schema (disabled with reason)
//   - upgradeDowngradeStatus — not on Business schema (disabled with reason)
//   - billingOwner — not on Business schema (removed)

type InvoiceStatusOption =
  | "not_issued" | "draft" | "sent" | "overdue" | "paid" | "cancelled";

type PaymentStatusOption =
  | "unpaid" | "partial" | "paid" | "confirmed" | "overdue" | "n/a";

function UpdateStatusModal({ biz, onClose, onUpdate }: {
  biz: BusinessClient;
  onClose: () => void;
  onUpdate: (id: string, patch: { invoiceStatus?: string; paymentStatus?: string; activeServices?: string[] }) => void;
}) {
  const [invoice, setInvoice] = useState<InvoiceStatusOption>(
    (biz.invoiceStatus?.toLowerCase() ?? "not_issued") as InvoiceStatusOption,
  );
  const [payment, setPayment] = useState<PaymentStatusOption>(
    (biz.paymentStatus?.toLowerCase() ?? "unpaid") as PaymentStatusOption,
  );
  const [services, setServices] = useState<string[]>(biz.activeServices ?? []);
  const [serviceInput, setServiceInput] = useState("");

  const invoiceOptions: InvoiceStatusOption[] = [
    "not_issued", "draft", "sent", "overdue", "paid", "cancelled",
  ];
  const paymentOptions: PaymentStatusOption[] = [
    "unpaid", "partial", "paid", "confirmed", "overdue", "n/a",
  ];

  function addService(name: string) {
    const trimmed = name.trim();
    if (!trimmed || services.includes(trimmed)) return;
    setServices((prev) => [...prev, trimmed]);
    setServiceInput("");
  }

  function removeService(name: string) {
    setServices((prev) => prev.filter((s) => s !== name));
  }

  function handleServiceInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addService(serviceInput);
    }
  }

  function handleSave() {
    onUpdate(biz.id, {
      invoiceStatus: invoice,
      paymentStatus: payment,
      activeServices: services,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto" style={{ border: "1px solid var(--rtm-border)", maxHeight: "90vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>Update Billing Fields</p>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{biz.displayName || biz.domain}</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{biz.domain} · {biz.clientName}</p>
          </div>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs rounded-lg p-3 font-medium" style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }}>
            Billing-owned fields on this Business. Client Health and Priority are computed automatically and cannot be set manually.
          </p>
          {[
            { label: "Invoice Status", value: invoice, setter: setInvoice as (v: string) => void, options: invoiceOptions },
            { label: "Payment Status", value: payment, setter: setPayment as (v: string) => void, options: paymentOptions },
          ].map(({ label, value, setter, options }) => (
            <div key={label} className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</label>
              <select
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none"
                style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
              >
                {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          ))}

          {/* Disabled fields — no Business schema equivalent */}
          <div className="rounded-lg border px-4 py-3 space-y-1" style={{ background: "#F9FAFB", borderColor: "var(--rtm-border-light)" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Not tracked per business</p>
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              <span className="font-semibold">Cancellation status</span> and <span className="font-semibold">upgrade/downgrade status</span> are not stored on the Business record.
              These were fields on the mock client data that have no equivalent in the production schema.
              If you need to track a cancellation, contact your system administrator.
            </p>
          </div>

          {/* Active Services Editor */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
              Active Services
            </label>
            <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
              Saved to the Business record via PATCH /api/businesses.
            </p>
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
              {services.length === 0 && (
                <span className="text-xs italic" style={{ color: "var(--rtm-text-muted)" }}>No active services — add below</span>
              )}
              {services.map((svc) => (
                <span
                  key={svc}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border"
                  style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1B4FD8" }}
                >
                  {svc}
                  <button
                    type="button"
                    onClick={() => removeService(svc)}
                    className="ml-0.5 text-blue-400 hover:text-red-500 transition-colors leading-none"
                    aria-label={`Remove ${svc}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {SERVICE_PRESETS.filter((p) => !services.includes(p)).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addService(preset)}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors"
                  style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-surface)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-bg-alt, #F9FAFB)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-surface)"; }}
                >
                  + {preset}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Custom service name, press Enter to add…"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={handleServiceInputKeyDown}
                className="flex-1 text-sm px-3 py-1.5 rounded-lg border focus:outline-none"
                style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
              />
              <button
                type="button"
                onClick={() => addService(serviceInput)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                style={{ background: "var(--rtm-blue)" }}
              >
                Add
              </button>
            </div>
          </div>

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
  const [businesses, setBusinesses] = useState<BusinessClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updateTarget, setUpdateTarget] = useState<BusinessClient | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const refreshBusinesses = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchAMClients();
      setBusinesses(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load client records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refreshBusinesses(); }, [refreshBusinesses]);

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  async function handleUpdate(
    id: string,
    patch: { invoiceStatus?: string; paymentStatus?: string; activeServices?: string[] },
  ) {
    // Optimistic local update
    setBusinesses((prev) =>
      prev.map((b) => b.id === id ? { ...b, ...patch } : b),
    );
    const name = businesses.find((b) => b.id === id)?.displayName ?? id;
    log(`Updated billing fields for ${name}`);
    try {
      await patchBusiness(id, patch);
    } catch (err) {
      // Revert on failure
      await refreshBusinesses();
      log(`⚠️ Save failed for ${name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleClearance(id: string) {
    const name = businesses.find((b) => b.id === id)?.displayName ?? id;
    // Optimistic
    setBusinesses((prev) =>
      prev.map((b) => b.id === id ? { ...b, cleared: true } : b),
    );
    log(`✅ Cleared ${name} — signaled ready for Account Management.`);
    try {
      await patchBusiness(id, { cleared: true });
    } catch (err) {
      await refreshBusinesses();
      log(`⚠️ Clearance failed for ${name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Businesses eligible for Billing's activation view:
  // invoice cleared (invoiceStatus paid/cleared, paymentStatus paid/confirmed)
  // but NOT yet granted clearance
  const pendingClearance = businesses.filter(isClearanceReady);

  const filtered = search.trim()
    ? businesses.filter((b) =>
        b.clientName.toLowerCase().includes(search.toLowerCase()) ||
        b.domain.toLowerCase().includes(search.toLowerCase()) ||
        (b.assignedAM ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : businesses;

  // KPIs — Billing-scoped
  const kpi = {
    total:    businesses.length,
    paid:     businesses.filter((b) => {
      const inv = b.invoiceStatus?.toLowerCase() ?? "";
      return inv === "paid" || inv === "cleared";
    }).length,
    overdue:  businesses.filter((b) => {
      const inv = b.invoiceStatus?.toLowerCase() ?? "";
      const pay = b.paymentStatus?.toLowerCase() ?? "";
      return inv === "overdue" || pay === "overdue";
    }).length,
    cleared:  businesses.filter((b) => b.cleared).length,
    pendingClearance: pendingClearance.length,
    atRisk:   businesses.filter((b) => {
      const h = computeHealth(toHealthInput(b));
      return h === "At Risk" || h === "Critical";
    }).length,
  };

  return (
    <div className="space-y-8">
      {/* Update Modal */}
      {updateTarget && (
        <UpdateStatusModal
          biz={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Client Portfolio</h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Billing view of all client businesses. One row per business domain. Health and Priority are computed automatically.
          </p>
        </div>
        {/* Add Client (Manual) is disabled — clients are created via invoice payment */}
        <div className="flex flex-col items-end gap-1">
          <div className="relative inline-block group">
            <button
              disabled
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border opacity-40 cursor-not-allowed"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Client (Manual)
            </button>
            {/* Tooltip */}
            <div
              className="absolute right-0 bottom-full mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ whiteSpace: "nowrap" }}
            >
              <div className="rounded-lg px-3 py-2 text-xs font-medium shadow-lg max-w-xs whitespace-normal"
                style={{ background: "#1E293B", color: "#F8FAFC", border: "1px solid #334155" }}>
                Clients and Businesses are created automatically when an invoice is
                marked Paid in the Invoices page. Manual entry is no longer available.
                <div className="absolute top-full right-4 border-4 border-transparent"
                  style={{ borderTopColor: "#1E293B" }} />
              </div>
            </div>
          </div>
          <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)", maxWidth: 260, textAlign: "right" }}>
            Clients are created from the Invoices page when payment is confirmed.
          </p>
        </div>
      </div>

      {/* Data-source notice */}
      <div className="rounded-lg border px-4 py-3 flex items-start gap-3" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
        <svg width="16" height="16" className="flex-shrink-0 mt-0.5" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm" style={{ color: "#065F46" }}>
          <span className="font-bold">Live data.</span>{" "}
          Reading from Postgres — /api/clients and /api/businesses.
          One row per business domain. A client with multiple domains appears once per domain.
          Billing fields updated here are saved immediately.
          Client Health and Priority are computed from invoice and payment status — not manually editable.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard title="Total Businesses"    value={String(kpi.total)}            accentColor="#1B4FD8"  iconBg="#EFF6FF" />
        <KpiCard title="Paid / Cleared"      value={String(kpi.paid)}             accentColor="#059669"  iconBg="#ECFDF5" />
        <KpiCard title="Overdue"             value={String(kpi.overdue)}          accentColor="#DC2626"  iconBg="#FEF2F2" />
        <KpiCard title="Cleared for AM"      value={String(kpi.cleared)}          accentColor="#059669"  iconBg="#ECFDF5" />
        <KpiCard title="Pending Clearance"   value={String(kpi.pendingClearance)} accentColor="#D97706"  iconBg="#FFFBEB" />
        <KpiCard title="At Risk / Critical"  value={String(kpi.atRisk)}           accentColor="#D97706"  iconBg="#FFFBEB" />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="rounded-xl border p-12 text-center" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading client portfolio…</p>
        </div>
      )}

      {/* Error state */}
      {fetchError && !loading && (
        <div className="rounded-xl border p-8 text-center space-y-2" style={{ borderColor: "#FECACA", background: "#FEF2F2" }}>
          <p className="text-sm font-semibold" style={{ color: "#991B1B" }}>
            <strong>Failed to load client portfolio:</strong> {fetchError}
          </p>
          <button
            onClick={() => void refreshBusinesses()}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
            style={{ background: "#DC2626" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && businesses.length === 0 && (
        <div className="rounded-xl border p-12 text-center space-y-3" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: "#EFF6FF" }}>
            <svg width="24" height="24" fill="none" stroke="#1B4FD8" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>No client businesses yet</p>
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            This page shows businesses created when Billing marks an invoice as Paid.
            Go to <strong>Invoices</strong>, mark an invoice Paid, and complete the Client &amp; Business creation flow.
            Once a business is created, it will appear here for billing management and clearance.
          </p>
          <Link href="/billing/invoices" className="inline-block text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: "var(--rtm-blue)" }}>
            Go to Invoices →
          </Link>
        </div>
      )}

      {/* Pending Clearance Alert */}
      {!loading && !fetchError && pendingClearance.length > 0 && (
        <div className="rounded-xl border p-5 space-y-3" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" fill="none" stroke="#D97706" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold" style={{ color: "#92400E" }}>
              {pendingClearance.length} business{pendingClearance.length > 1 ? "es" : ""} with invoice paid — awaiting Billing clearance
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingClearance.map((b) => (
              <div key={b.id} className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ background: "#fff", borderColor: "#FDE68A" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{b.displayName || b.domain}</span>
                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>({b.clientName})</span>
                <button
                  onClick={() => void handleClearance(b.id)}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                  style={{ background: "#059669" }}
                >
                  Clearance →
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: "#92400E" }}>
            Granting clearance signals Account Management to begin their workflow. The business will no longer appear in this alert once cleared.
          </p>
        </div>
      )}

      {/* Client Portfolio Table */}
      {!loading && !fetchError && businesses.length > 0 && (
        <SectionWrapper
          title="Client Portfolio"
          description={`${filtered.length} of ${businesses.length} businesses — live from Postgres`}
          actions={
            <input
              type="text"
              placeholder="Search by name, domain, AM…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border focus:outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)", width: 220 }}
            />
          }
        >
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
            <table className="min-w-full">
              <thead>
                <tr>
                  <Th>Business / Client</Th>
                  <Th>Domain</Th>
                  <Th>Invoice Status</Th>
                  <Th>Payment Status</Th>
                  <Th>Active Services</Th>
                  <Th>Health ⟨computed⟩</Th>
                  <Th>Priority ⟨computed⟩</Th>
                  <Th>Cleared?</Th>
                  <Th>Assigned AM</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((biz) => {
                  const isExpanded = expanded === biz.id;
                  const healthInput = toHealthInput(biz);
                  const health = computeHealth(healthInput);
                  const priority = computePriority(health, healthInput.billingStatus);
                  const color = avatarColor(biz.id);
                  return (
                    <React.Fragment key={biz.id}>
                      <tr
                        className="transition-colors cursor-pointer"
                        style={{ background: isExpanded ? "var(--rtm-bg-alt, #F9FAFB)" : "var(--rtm-bg)" }}
                        onClick={() => setExpanded(isExpanded ? null : biz.id)}
                      >
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: color }}>
                              {(biz.clientName || biz.domain).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold block" style={{ color: "var(--rtm-text-primary)" }}>{biz.displayName || biz.domain}</span>
                              <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{biz.clientName}</span>
                            </div>
                          </div>
                        </Td>
                        <Td muted><span className="font-mono text-xs">{biz.domain}</span></Td>
                        <Td>
                          <StatusBadge variant={invoiceStatusVariant(biz.invoiceStatus ?? "")} label={biz.invoiceStatus ?? "—"} size="sm" />
                        </Td>
                        <Td>
                          <StatusBadge variant={paymentStatusVariant(biz.paymentStatus ?? "")} label={biz.paymentStatus ?? "—"} size="sm" />
                        </Td>
                        <Td>
                          {(biz.activeServices?.length ?? 0) === 0
                            ? <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                            : <span className="text-xs">{biz.activeServices.slice(0, 2).join(", ")}{biz.activeServices.length > 2 ? ` +${biz.activeServices.length - 2}` : ""}</span>
                          }
                        </Td>
                        <Td><StatusBadge variant={healthVariant(health)} label={health} size="sm" /></Td>
                        <Td><StatusBadge variant={priorityVariant(priority)} label={priority} size="sm" /></Td>
                        <Td>
                          {biz.cleared
                            ? <span className="text-xs font-semibold" style={{ color: "#059669" }}>✓ Yes</span>
                            : <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No</span>
                          }
                        </Td>
                        <Td muted>{biz.assignedAM || "—"}</Td>
                        <Td>
                          <ContextMenu actions={[
                            {
                              label: "Update Billing Fields",
                              primary: true,
                              onClick: () => { setUpdateTarget(biz); setExpanded(null); },
                            },
                            {
                              label: biz.cleared ? "Already Cleared" : "Clearance →",
                              disabled: biz.cleared || !isClearanceReady(biz),
                              primary: !biz.cleared,
                              onClick: () => { void handleClearance(biz.id); },
                            },
                            {
                              separator: true,
                              label: "Add to Invoice Queue",
                              onClick: () => log(`Queued invoice for ${biz.displayName || biz.domain}`),
                            },
                          ]} />
                        </Td>
                      </tr>

                      {/* Expanded detail — Billing-scoped only */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} style={{ borderBottom: "2px solid var(--rtm-border-light)" }}>
                            <div className="px-4 py-4 space-y-4" style={{ background: "#F8FAFF" }}>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                  { label: "Monthly Value", value: biz.monthlyValue > 0 ? `$${biz.monthlyValue.toLocaleString()}/mo` : "—" },
                                  { label: "Active Services", value: (biz.activeServices?.length ?? 0) > 0 ? biz.activeServices.join(", ") : "None" },
                                  { label: "Assigned AM", value: biz.assignedAM || "Unassigned" },
                                  { label: "Cleared for AM", value: biz.cleared ? "Yes — handed off" : "No — pending" },
                                ].map(({ label, value }) => (
                                  <div key={label} className="space-y-0.5">
                                    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                                    <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="rounded-lg border px-3 py-2 flex gap-2" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                                <p className="text-xs" style={{ color: "#92400E" }}>
                                  <span className="font-bold">Health:</span> {computeHealth(toHealthInput(biz))} &nbsp;|&nbsp;
                                  <span className="font-bold">Priority:</span> {computePriority(computeHealth(toHealthInput(biz)), toHealthInput(biz).billingStatus)} &nbsp;—&nbsp;
                                  Computed from invoice status ({biz.invoiceStatus ?? "—"}) and payment status ({biz.paymentStatus ?? "—"}). Not manually editable.
                                </p>
                              </div>

                              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                                <span className="font-semibold">Activation Status:</span> {biz.activationStatus || "—"}
                                &nbsp;·&nbsp;
                                <span className="font-semibold">Onboarding Status:</span> {biz.onboardingStatus || "—"}
                                &nbsp;·&nbsp;
                                <span className="font-semibold">Domain:</span> {biz.domain}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => { setUpdateTarget(biz); setExpanded(null); }}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                                  style={{ background: "var(--rtm-blue)" }}
                                >
                                  Update Billing Fields
                                </button>
                                {!biz.cleared && (
                                  <button
                                    onClick={() => { void handleClearance(biz.id); }}
                                    disabled={!isClearanceReady(biz)}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
                                    style={{ background: "#059669" }}
                                  >
                                    Clearance →
                                  </button>
                                )}
                                <button
                                  onClick={() => setExpanded(null)}
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

                {filtered.length === 0 && businesses.length > 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                      No businesses match the search. Clear the search to see all {businesses.length} records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

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
