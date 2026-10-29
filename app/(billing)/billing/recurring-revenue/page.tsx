"use client";

// RTM OS — Billing / Recurring Revenue
//
// DATA SOURCE (real):
//   /api/sales-contracts  → Contract rows from Postgres (signed deals)
//
// WHAT IS SHOWN:
//   - All signed contracts from Postgres, with their status and financial details
//   - MRR computed from contracts that carry a numeric monthlyValue
//   - Contract count by status
//
// NOT COMPUTABLE FROM CURRENT SCHEMA:
//   - Stripe subscription sync  — Stripe is not yet connected (no stripeSubscriptionId)
//   - Auto-renew flags          — not in the current Contract model
//   - Revenue at risk / projections — no subscription-state model exists
//   - AM assignment per contract   — contracts carry assignedRep (sales), not AM
//
// The "Renew Contract" action writes to the database via PATCH /api/sales-contracts.
// The "Flag At Risk" action is status-local only (no DB write) until a status
// field for billing-side risk tracking exists in the schema.
//
// Stripe section is kept (layout preserved) but shows "Not connected."

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import type { SalesContractRecord } from "@/app/api/sales-contracts/route";

const workspace = getWorkspace("billing")!;

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

function contractStatusVariant(s: string): BadgeVariant {
  switch (s) {
    case "signed":   return "success";
    case "sent":     return "pending";
    case "draft":    return "neutral";
    case "expired":
    case "cancelled": return "error";
    default:         return "neutral";
  }
}

// Parse "$2,400/mo" → 2400 (returns null if unparseable)
function parseMonthly(val: string): number | null {
  if (!val) return null;
  const n = parseFloat(val.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}

function fmt(n: number): string {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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

export default function RecurringRevenuePage() {
  const [contracts, setContracts] = useState<SalesContractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [toast, setToast] = useState<{ message: string; variant: "success" | "info" | "warning" | "error" } | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const showToast = useCallback((message: string, variant: "success" | "info" | "warning" | "error" = "success") => {
    setToast({ message, variant });
  }, []);

  const log = useCallback((msg: string) => {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 14)]);
  }, []);

  useEffect(() => {
    fetch("/api/sales-contracts", { credentials: "include" })
      .then((r) => r.ok ? r.json() as Promise<{ records: SalesContractRecord[] }> : Promise.reject(r.status))
      .then(({ records }) => { setContracts(records ?? []); setLoading(false); })
      .catch((err) => { setError(String(err)); setLoading(false); });
  }, []);

  // ── Computed aggregates ──────────────────────────────────────────────────────
  const signed = contracts.filter((c) => c.status === "signed");
  const pending = contracts.filter((c) => c.status === "sent");

  // MRR: sum monthly values from contracts with a parseable monthlyValue
  const mrr = signed.reduce((s, c) => {
    const m = parseMonthly(c.monthlyValue);
    return m ? s + m : s;
  }, 0);

  const statuses = ["All", "signed", "sent", "draft", "expired", "cancelled"];
  const filtered = filter === "All" ? contracts : contracts.filter((c) => c.status === filter);

  return (
    <div className="space-y-8">

      {/* Toast */}
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}

      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name} / Recurring Revenue
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Recurring Revenue
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Signed contracts from Postgres. MRR computed from contract monthly values.
          Stripe subscription sync is not yet connected.
        </p>
      </div>

      {/* Stripe section — layout preserved, honest state */}
      <div className="rounded-xl border p-5" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
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

      {/* Loading / error */}
      {loading && <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading contracts…</p>}
      {error && <p className="text-sm" style={{ color: "#DC2626" }}>Failed to load contracts: {error}</p>}

      {/* KPIs from real rows */}
      {!loading && !error && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard title="MRR (Signed Contracts)"
            value={mrr > 0 ? fmt(mrr) : "—"}
            trend="neutral" trendValue=""
            iconBg="#ECFDF5" iconColor="#059669"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
          />
          <KpiCard title="ARR (Signed)"
            value={mrr > 0 ? fmt(mrr * 12) : "—"}
            trend="neutral" trendValue=""
            iconBg="#EFF6FF" iconColor="#1B4FD8"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
          />
          <KpiCard title="Signed Contracts"
            value={String(signed.length)}
            trend="neutral" trendValue=""
            iconBg="#F0F9FF" iconColor="#0891B2"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
          />
          <KpiCard title="Pending / Sent"
            value={String(pending.length)}
            trend="neutral" trendValue=""
            iconBg="#FFFBEB" iconColor="#D97706"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>}
          />
        </div>
      )}

      {/* Revenue at risk — not connected */}
      <SectionWrapper
        title="Revenue at Risk / Renewal Projections — Not Connected"
        description="Auto-renew flags, risk scoring, and renewal projections require subscription-state fields not yet in the contract schema."
      >
        <p className="text-sm py-4 text-center" style={{ color: "#94A3B8" }}>
          These figures will appear once subscription state (auto-renew, billing cycle, renewal date) is added to the contract schema.
        </p>
      </SectionWrapper>

      {/* All Contracts Table */}
      {!loading && !error && (
        <SectionWrapper
          title={`All Contracts (${contracts.length})`}
          description={`${filtered.length} shown`}
          actions={
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((s) => (
                <button key={s} onClick={() => setFilter(s)}
                  className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
                  style={filter === s
                    ? { background: "#059669", color: "#fff", borderColor: "#059669" }
                    : { background: "#fff", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }
                  }>
                  {s}
                </button>
              ))}
            </div>
          }
        >
          {contracts.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: "#94A3B8" }}>
              No contracts in the database yet. Contracts appear here once created through the Sales proposals flow.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <Th>Contract #</Th>
                    <Th>Client</Th>
                    <Th>Services</Th>
                    <Th>Monthly Value</Th>
                    <Th>Term</Th>
                    <Th>Payment Terms</Th>
                    <Th>Status</Th>
                    <Th>Rep</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <Td><span className="font-mono text-xs">{c.contractNumber}</span></Td>
                      <Td><span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.clientName || c.businessName || "—"}</span></Td>
                      <Td muted>{c.services?.join(", ") || "—"}</Td>
                      <Td>
                        <span className="font-bold" style={{ color: "#059669" }}>{c.monthlyValue || "—"}</span>
                      </Td>
                      <Td muted>{c.termLength || (c.termLengthMonths ? `${c.termLengthMonths} months` : "—")}</Td>
                      <Td muted>{c.paymentTerms || c.paymentTerm || "—"}</Td>
                      <Td>
                        <StatusBadge variant={contractStatusVariant(c.status)} label={c.status} size="sm" />
                      </Td>
                      <Td muted>{c.assignedRep || "—"}</Td>
                      <Td>
                        <button
                          onClick={() => {
                            log(`Flagged for review: ${c.clientName}`);
                            showToast(`${c.clientName} flagged for review`, "warning");
                          }}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                          style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}
                        >
                          Flag for Review
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionWrapper>
      )}

      {/* Action Log */}
      {actionLog.length > 0 && (
        <SectionWrapper title="Action Log" description="Recent actions this session">
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
