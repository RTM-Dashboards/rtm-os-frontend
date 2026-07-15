"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { recurringContracts, revenueSummary } from "@/lib/billing/action-center-data";
import type { RecurringContract } from "@/lib/billing/action-center-data";

const workspace = getWorkspace("billing")!;

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

function contractStatusVariant(s: string): BadgeVariant {
  switch (s) {
    case "Active":          return "success";
    case "At Risk":         return "error";
    case "Pending Renewal": return "warning";
    case "Paused":          return "neutral";
    case "Cancelled":       return "error";
    default:                return "neutral";
  }
}

function PreviewBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      Preview — Target State
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap border-b"
      style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "#F9FAFB" }}>
      {children}
    </th>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td className="px-3 py-2.5 text-sm whitespace-nowrap border-b"
      style={{ color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}>
      {children}
    </td>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, variant, onDismiss }: { message: string; variant: "success" | "info" | "warning" | "error"; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3200); return () => clearTimeout(t); }, [onDismiss]);
  const colors = {
    success: { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46" },
    info:    { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E3A8A" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E" },
    error:   { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" },
  }[variant];
  return (
    <div className="fixed top-4 right-4 z-[100] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-xl"
      style={{ background: colors.bg, borderColor: colors.border, color: colors.color, minWidth: 280 }}>
      <span className="text-sm font-semibold flex-1">{message}</span>
      <button onClick={onDismiss} className="text-base leading-none opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

// ─── Contract Detail Drawer ───────────────────────────────────────────────────

function ContractDetailDrawer({ contract, onClose }: { contract: RecurringContract | null; onClose: () => void }) {
  if (!contract) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white z-50 overflow-y-auto shadow-2xl flex flex-col"
        style={{ border: "1px solid var(--rtm-border)" }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-start justify-between z-10"
          style={{ borderColor: "var(--rtm-border-light)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: workspace.accentColor }}>Contract Detail</p>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{contract.contractName}</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{contract.client}</p>
          </div>
          <button onClick={onClose} className="text-xl leading-none mt-1" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <StatusBadge variant={contractStatusVariant(contract.status)} label={contract.status} size="sm" />
            {contract.autoRenew && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>
                Auto-Renew On
              </span>
            )}
          </div>

          {/* Contract fields */}
          <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Contract Information</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Client",           value: contract.client },
                { label: "Contract Name",    value: contract.contractName },
                { label: "Term",             value: contract.contractTerm },
                { label: "Start Date",       value: contract.contractStart },
                { label: "End Date",         value: contract.contractEnd },
                { label: "Notice Period",    value: contract.noticePeriod },
                { label: "Auto Renew",       value: contract.autoRenew ? "Yes" : "No" },
                { label: "Assigned AM",      value: contract.assignedAM },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                  <p className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue */}
          <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Revenue</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Monthly Revenue</p>
                <p className="text-xl font-bold" style={{ color: "#059669" }}>${contract.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Annual Value</p>
                <p className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>${contract.annualValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Services Included</p>
            <div className="flex flex-wrap gap-2">
              {contract.servicesIncluded.split(",").map((s) => (
                <span key={s.trim()} className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                  style={{ background: "#EFF6FF", color: "#1B4FD8", borderColor: "#BFDBFE" }}>
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Renew Confirmation Modal ─────────────────────────────────────────────────

function RenewModal({ contract, onClose, onConfirm }: {
  contract: RecurringContract;
  onClose: () => void;
  onConfirm: (id: string, newEnd: string, newTerm: string) => void;
}) {
  // Compute proposed new end date (add the contract term from the current end)
  const termMonths = contract.contractTerm.includes("24") ? 24 : contract.contractTerm.includes("6") ? 6 : 12;
  const currentEnd = new Date(contract.contractEnd);
  currentEnd.setMonth(currentEnd.getMonth() + termMonths);
  const proposedEnd = currentEnd.toISOString().slice(0, 10);
  const [newEnd, setNewEnd] = useState(proposedEnd);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ border: "1px solid var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>Renew Contract</p>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{contract.client}</h2>
          </div>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-lg border p-4 space-y-2 text-sm" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
            <p><span className="font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Contract:</span> {contract.contractName}</p>
            <p><span className="font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Current End:</span> {contract.contractEnd}</p>
            <p><span className="font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Term:</span> {contract.contractTerm}</p>
            <p><span className="font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Monthly Revenue:</span> <span className="font-bold" style={{ color: "#059669" }}>${contract.monthlyRevenue.toLocaleString()}</span></p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>New End Date</label>
            <input
              type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
            />
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Proposed renewal extends by {contract.contractTerm}</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 text-sm font-semibold py-2 rounded-lg border"
              style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Cancel</button>
            <button
              onClick={() => { onConfirm(contract.id, newEnd, contract.contractTerm); onClose(); }}
              className="flex-1 text-sm font-semibold py-2 rounded-lg text-white"
              style={{ background: "#059669" }}
            >
              Confirm Renewal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Revenue bar chart ────────────────────────────────────────────────────────

function RevenueBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <span>{label}</span>
        <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>${value.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#EFF6FF" }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: "#1B4FD8" }} />
      </div>
    </div>
  );
}

// ─── Three-dot menu ───────────────────────────────────────────────────────────

interface MenuAction { label: string; onClick: () => void; separator?: boolean; danger?: boolean; primary?: boolean; }

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
      <button onClick={() => setOpen((v) => !v)}
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
        <div className="absolute right-0 z-50 min-w-[200px] rounded-lg shadow-xl py-1"
          style={{ top: "calc(100% + 4px)", background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          {actions.map((action, i) => (
            <React.Fragment key={i}>
              {action.separator && i > 0 && <div className="my-1 mx-3 border-t" style={{ borderColor: "var(--rtm-border-light)" }} />}
              <button className="w-full text-left px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: action.danger ? "#DC2626" : action.primary ? "var(--rtm-blue)" : "var(--rtm-text-primary)", background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = action.danger ? "#FEF2F2" : "var(--rtm-bg)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecurringRevenuePage() {
  const [contracts, setContracts] = useState<RecurringContract[]>(recurringContracts);
  const [viewContract, setViewContract] = useState<RecurringContract | null>(null);
  const [renewTarget, setRenewTarget] = useState<RecurringContract | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "info" | "warning" | "error" } | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("All");

  function showToast(message: string, variant: "success" | "info" | "warning" | "error" = "success") {
    setToast({ message, variant });
  }

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 14)]);
  }

  function handleRenewConfirm(id: string, newEnd: string, term: string) {
    const c = contracts.find((x) => x.id === id);
    setContracts((prev) => prev.map((x) => x.id === id ? { ...x, contractEnd: newEnd, status: "Active" as const } : x));
    log(`Renewed: ${c?.client} → new end ${newEnd}`);
    showToast(`Contract renewed for ${c?.client} — new end: ${newEnd}`, "success");
  }

  const statuses = ["All", "Active", "Pending Renewal", "At Risk", "Paused", "Cancelled"];
  const filtered = filter === "All" ? contracts : contracts.filter((c) => c.status === filter);

  const active = contracts.filter((c) => c.status === "Active");
  const pendingRenewal = contracts.filter((c) => c.status === "Pending Renewal");
  const atRisk = contracts.filter((c) => c.status === "At Risk");
  const totalMRR = active.reduce((s, c) => s + c.monthlyRevenue, 0);
  const maxMonthlyRevenue = Math.max(...revenueSummary.monthlyRevenue.map((m) => m.revenue));
  const maxDeptRevenue = Math.max(...revenueSummary.revenueByDepartment.map((d) => d.revenue));
  const maxServiceRevenue = Math.max(...revenueSummary.revenueByService.map((s) => s.revenue));

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}

      {/* Contract Detail Drawer */}
      <ContractDetailDrawer contract={viewContract} onClose={() => setViewContract(null)} />

      {/* Renew Modal */}
      {renewTarget && (
        <RenewModal contract={renewTarget} onClose={() => setRenewTarget(null)} onConfirm={handleRenewConfirm} />
      )}

      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name} / Recurring Revenue
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Recurring Revenue</h1>
          <PreviewBadge />
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          MRR, ARR, active contracts, upcoming renewals, at-risk revenue, and projected revenue.
        </p>
      </div>

      {/* ── Stripe Subscription Billing (groundwork — not yet live) ──────────────
           FUTURE LIVE INTEGRATION HOOK (Recurring Revenue):
           When Stripe is connected at launch:
             - Each RecurringContract row maps to a Stripe Subscription object
               (stripe.subscriptions.create / retrieve / cancel)
             - stripeSubscriptionId on MASTER_CLIENTS links to the recurring billing contract
             - "Connect to Stripe" action: creates Stripe Customer + Subscription,
               sets stripeCustomerId + stripeSubscriptionId + stripeSyncStatus: "Connected"
             - Webhook events (customer.subscription.updated, invoice.payment_succeeded,
               invoice.payment_failed) update contract status in real time
             - This section should display live subscription status fetched from Stripe
           ────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border p-5" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Stripe "S" icon */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#6772E5" }}>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M5.15 4.42c0-.42.34-.58.9-.58.8 0 1.82.24 2.62.67V2.74A6.96 6.96 0 005.9 2.25c-1.85 0-3.09.97-3.09 2.59 0 2.53 3.48 2.12 3.48 3.21 0 .5-.43.66-.97.66-.84 0-1.9-.35-2.74-.82v1.8c.93.4 1.87.57 2.74.57 1.88 0 3.18-.93 3.18-2.57C8.5 5.09 5.15 5.57 5.15 4.42z" fill="white"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "#0F172A" }}>Stripe Subscription Billing</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                Recurring contracts will sync to Stripe Subscriptions at launch. All clients currently show "Not Connected."
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}>
              Coming at launch
            </span>
            <div className="relative group">
              <button
                disabled
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-not-allowed opacity-60"
                style={{ background: "#F8FAFC", borderColor: "#CBD5E1", color: "#64748B" }}
              >
                Connect to Stripe
              </button>
              <div
                className="absolute bottom-full right-0 mb-1.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ whiteSpace: "nowrap" }}
              >
                <div className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg"
                  style={{ background: "#1E293B", color: "#F8FAFC", border: "1px solid #334155" }}>
                  Not yet available — coming at launch
                  <div className="absolute top-full right-3 border-4 border-transparent"
                    style={{ borderTopColor: "#1E293B" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t flex items-center gap-4 flex-wrap" style={{ borderColor: "#E2E8F0" }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#94A3B8" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#CBD5E1" }} />
            Stripe Customers: Not Connected
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#94A3B8" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#CBD5E1" }} />
            Active Subscriptions: 0 synced
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#94A3B8" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#CBD5E1" }} />
            Webhook: Not configured
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="MRR"                value={`$${totalMRR.toLocaleString()}`}         trend="up"     trendValue="11.2%" iconBg="#ECFDF5" iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>} />
        <KpiCard title="ARR"                value={`$${(totalMRR * 12 / 1000).toFixed(0)}k`} trend="up"    trendValue="11.2%" iconBg="#EFF6FF" iconColor="#1B4FD8"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>} />
        <KpiCard title="Active Contracts"   value={String(active.length)}                    trend="up"    trendValue="2"     iconBg="#F0F9FF" iconColor="#0891B2"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>} />
        <KpiCard title="Upcoming Renewals"  value={String(pendingRenewal.length)}             trend="neutral" trendValue=""   iconBg="#FFFBEB" iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>} />
        <KpiCard title="Revenue At Risk"    value={`$${revenueSummary.revenueAtRisk.toLocaleString()}`} trend="up" trendValue="$1,800" iconBg="#FEF2F2" iconColor="#DC2626"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>} />
        <KpiCard title="At-Risk Contracts"  value={String(atRisk.length)}                    trend="neutral" trendValue="" iconBg="#FEF2F2" iconColor="#DC2626"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>} />
        <KpiCard title="New Revenue"        value={`$${revenueSummary.newRevenue.toLocaleString()}`}    trend="up" trendValue="$2,100" iconBg="#F5F3FF" iconColor="#7C3AED"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4"/></svg>} />
        <KpiCard title="Projected Revenue"  value={`$${revenueSummary.projectedRevenue.toLocaleString()}`} trend="up" trendValue="8.0%" iconBg="#ECFDF5" iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>} />
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionWrapper title="Monthly Revenue Trend" description="Last 6 months">
          <div className="space-y-3">
            {revenueSummary.monthlyRevenue.map((m) => <RevenueBar key={m.month} label={m.month} value={m.revenue} max={maxMonthlyRevenue} />)}
          </div>
        </SectionWrapper>
        <SectionWrapper title="Revenue By Department" description="Current month">
          <div className="space-y-3">
            {revenueSummary.revenueByDepartment.map((d) => <RevenueBar key={d.department} label={d.department} value={d.revenue} max={maxDeptRevenue} />)}
          </div>
        </SectionWrapper>
        <SectionWrapper title="Revenue By Service" description="Current month">
          <div className="space-y-3">
            {revenueSummary.revenueByService.map((s) => <RevenueBar key={s.service} label={s.service} value={s.revenue} max={maxServiceRevenue} />)}
          </div>
        </SectionWrapper>
      </div>

      {/* Pending Renewal Alert */}
      {pendingRenewal.length > 0 && (
        <div className="rounded-xl border p-5 space-y-3" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
          <span className="text-sm font-bold" style={{ color: "#D97706" }}>
            {pendingRenewal.length} Contract{pendingRenewal.length > 1 ? "s" : ""} Pending Renewal
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingRenewal.map((c) => (
              <div key={c.id} className="rounded-lg border p-3 space-y-2" style={{ background: "#fff", borderColor: "#FDE68A" }}>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</span>
                  <StatusBadge variant="warning" label="Pending Renewal" size="sm" />
                </div>
                <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.contractName}</p>
                <div className="text-xs space-y-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  <div>Ends: {c.contractEnd}</div>
                  <div>MRR: <span className="font-bold text-[#059669]">${c.monthlyRevenue.toLocaleString()}</span></div>
                  <div>Notice: {c.noticePeriod}</div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setRenewTarget(c)} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: "#059669" }}>
                    Renew
                  </button>
                  <button onClick={() => setViewContract(c)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "#fff" }}>
                    View Contract
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* At Risk Alert */}
      {atRisk.length > 0 && (
        <div className="rounded-xl border p-5 space-y-3" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <span className="text-sm font-bold" style={{ color: "#DC2626" }}>
            {atRisk.length} Contract{atRisk.length > 1 ? "s" : ""} At Risk
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {atRisk.map((c) => (
              <div key={c.id} className="rounded-lg border p-3 space-y-2" style={{ background: "#fff", borderColor: "#FECACA" }}>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</span>
                  <StatusBadge variant="error" label="At Risk" size="sm" />
                </div>
                <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.contractName}</p>
                <div className="text-xs space-y-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  <div>MRR At Risk: <span className="font-bold text-[#DC2626]">${c.monthlyRevenue.toLocaleString()}</span></div>
                  <div>Ends: {c.contractEnd}</div>
                  <div>AM: {c.assignedAM}</div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { log(`Flagged for review: ${c.client}`); showToast(`${c.client} flagged for review`, "warning"); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}>
                    Flag For Review
                  </button>
                  <button onClick={() => setViewContract(c)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "#fff" }}>
                    View Contract
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Contracts Table */}
      <SectionWrapper
        title="All Recurring Contracts"
        description={`${filtered.length} contracts`}
        actions={
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
                style={filter === s
                  ? { background: "#059669", color: "#fff", borderColor: "#059669" }
                  : { background: "#fff", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }
                }
              >
                {s}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th><Th>Contract Name</Th><Th>Term</Th><Th>Start</Th><Th>End</Th>
                <Th>Monthly Revenue</Th><Th>Annual Value</Th><Th>Notice</Th><Th>Auto Renew</Th>
                <Th>Status</Th><Th>AM</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors"
                  style={{ background: c.status === "At Risk" ? "#FFF7F7" : "var(--rtm-bg)" }}>
                  <Td><span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</span></Td>
                  <Td muted>{c.contractName}</Td>
                  <Td muted>{c.contractTerm}</Td>
                  <Td muted>{c.contractStart}</Td>
                  <Td muted>{c.contractEnd}</Td>
                  <Td><span className="font-bold text-[#059669]">${c.monthlyRevenue.toLocaleString()}</span></Td>
                  <Td muted>${c.annualValue.toLocaleString()}</Td>
                  <Td muted>{c.noticePeriod}</Td>
                  <Td muted>{c.autoRenew ? "✓" : "—"}</Td>
                  <Td><StatusBadge variant={contractStatusVariant(c.status)} label={c.status} size="sm" /></Td>
                  <Td muted>{c.assignedAM}</Td>
                  <Td>
                    <div className="flex gap-1.5">
                      <button onClick={() => setViewContract(c)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                        style={{ background: "#fff", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}>
                        View Contract
                      </button>
                      <button onClick={() => setRenewTarget(c)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                        style={{ background: "#059669" }}>
                        Renew
                      </button>
                      <ContextMenu actions={[
                        { label: "View Contract", primary: true, onClick: () => setViewContract(c) },
                        { label: "Renew Contract", onClick: () => setRenewTarget(c) },
                        { separator: true, label: "Flag At Risk", danger: true, onClick: () => {
                          setContracts((prev) => prev.map((x) => x.id === c.id ? { ...x, status: "At Risk" as const } : x));
                          showToast(`${c.client} flagged as At Risk`, "warning");
                          log(`Flagged At Risk: ${c.client}`);
                        }},
                        { label: "Add Note", onClick: () => { log(`Note added: ${c.client}`); showToast(`Note added for ${c.client}`, "info"); } },
                      ]} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* Action Log */}
      {actionLog.length > 0 && (
        <SectionWrapper title="Action Log" description="Recent revenue actions">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {actionLog.map((entry, i) => (
              <p key={i} className="text-xs font-mono" style={{ color: "var(--rtm-text-secondary)" }}>{entry}</p>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Footer */}
      <div className="flex gap-2">
        <Link href="/billing" className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/revenue" className="rtm-btn-primary text-sm">Revenue Dashboard →</Link>
        <Link href="/billing/activation" className="rtm-btn-secondary text-sm">Activation →</Link>
      </div>
    </div>
  );
}
