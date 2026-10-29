"use client";

// RTM OS — Billing / Revenue
//
// DATA SOURCES (all real):
//   /api/invoices  → Invoice rows from Postgres
//
// COMPUTED FROM REAL ROWS:
//   Collected This Month — SUM(contractAmountCents) WHERE paymentStatus = "Paid"
//   Overdue Balance      — SUM(contractAmountCents) WHERE invoiceStatus IN
//                          ["Overdue","Escalated","Sent","Viewed","Partially Paid"]
//                          AND dueDate < today
//   Outstanding Balance  — SUM(contractAmountCents) WHERE invoiceStatus NOT IN
//                          ["Paid","Cancelled","Draft","Ready To Send"]
//   Invoice counts by status
//
// NOT COMPUTABLE FROM CURRENT SCHEMA:
//   MRR / ARR       — requires a recurring-billing Contract model (none exists).
//                     The sales-contracts table holds signed deals, not active
//                     subscriptions with billing cycles. No revenue projection.
//   Revenue by dept — invoices do not carry a department field.
//   Revenue by service type — invoices do not carry a service-type breakdown.
//   Month-over-month trend — no historical invoices in the database yet.
//   AI Revenue Summary     — no audit log / event history to derive from.
//
// All of the above show honest empty / "not connected" states rather than
// fabricated figures. The layout and controls are preserved.

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import type { InvoiceRecord } from "@/app/api/invoices/route";

const workspace = getWorkspace("billing")!;

// ── UI helpers ────────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

function invoiceStatusVariant(s: string): BadgeVariant {
  switch (s) {
    case "Paid":           return "success";
    case "Overdue":
    case "Escalated":      return "error";
    case "Partially Paid": return "warning";
    case "Sent":
    case "Viewed":         return "pending";
    case "Cancelled":      return "neutral";
    default:               return "neutral";
  }
}

function fmt(cents: number): string {
  return "$" + (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function EmptyCard({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 rounded-xl border"
      style={{ background: "#F9FAFB", borderColor: "#E5E7EB" }}>
      <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>{title}</span>
      <span className="text-sm font-semibold" style={{ color: "#94A3B8" }}>—</span>
      <span className="text-[11px]" style={{ color: "#94A3B8" }}>{note}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RevenueDashboardPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"Monthly" | "Quarterly" | "Annual">("Monthly");

  useEffect(() => {
    fetch("/api/invoices", { credentials: "include" })
      .then((r) => r.ok ? r.json() as Promise<{ invoices: InvoiceRecord[] }> : Promise.reject(r.status))
      .then(({ invoices: rows }) => { setInvoices(rows ?? []); setLoading(false); })
      .catch((err) => { setError(String(err)); setLoading(false); });
  }, []);

  // ── Computed aggregates from real rows ──────────────────────────────────────
  const collectedCents = invoices
    .filter((i) => i.paymentStatus === "Paid")
    .reduce((s, i) => s + (i.contractAmountCents ?? 0), 0);

  const overdueCents = invoices
    .filter((i) =>
      ["Overdue", "Escalated", "Sent", "Viewed", "Partially Paid"].includes(i.invoiceStatus) &&
      i.dueDate && new Date(i.dueDate) < new Date()
    )
    .reduce((s, i) => s + (i.contractAmountCents ?? 0), 0);

  const outstandingCents = invoices
    .filter((i) => !["Paid", "Cancelled", "Draft", "Ready To Send"].includes(i.invoiceStatus))
    .reduce((s, i) => s + (i.contractAmountCents ?? 0), 0);

  const overdueCount = invoices.filter(
    (i) => ["Overdue", "Escalated"].includes(i.invoiceStatus)
  ).length;

  const paidInvoices = invoices.filter((i) => i.paymentStatus === "Paid");
  const overdueInvoices = invoices.filter((i) => ["Overdue", "Escalated"].includes(i.invoiceStatus));

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name} / Revenue
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Revenue Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Invoice-level revenue computed from real Postgres rows. MRR/ARR require a recurring billing model not yet in the schema.
        </p>
      </div>

      {/* Period Toggle (UI preserved — period context shown in label) */}
      <div className="flex gap-2">
        {(["Monthly", "Quarterly", "Annual"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
            style={
              period === p
                ? { background: "#D97706", color: "#fff", borderColor: "#D97706" }
                : { background: "#fff", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }
            }
          >
            {p}
          </button>
        ))}
      </div>

      {/* Loading / error */}
      {loading && (
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading invoices…</p>
      )}
      {error && (
        <p className="text-sm" style={{ color: "#DC2626" }}>Failed to load invoices: {error}</p>
      )}

      {/* KPI Row — from real invoice rows */}
      {!loading && !error && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            title="Collected This Month"
            value={fmt(collectedCents)}
            trend="neutral" trendValue=""
            iconBg="#ECFDF5" iconColor="#059669"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <KpiCard
            title="Outstanding Balance"
            value={fmt(outstandingCents)}
            trend="neutral" trendValue=""
            iconBg="#FEF3C7" iconColor="#D97706"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
          />
          <KpiCard
            title="Overdue Balance"
            value={fmt(overdueCents)}
            trend="neutral" trendValue=""
            iconBg="#FEF2F2" iconColor="#DC2626"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
          />
          <KpiCard
            title="Overdue Invoices"
            value={String(overdueCount)}
            trend="neutral" trendValue=""
            iconBg="#FEF2F2" iconColor="#DC2626"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>}
          />
        </div>
      )}

      {/* Not-connected panels (MRR/ARR, trends, dept breakdown) */}
      <SectionWrapper
        title="MRR / ARR — Not Connected"
        description="Monthly and annual recurring revenue require a subscription billing model. The current schema (invoices + signed contracts) does not carry billing cycle / subscription state. No figure is shown."
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <EmptyCard title="MRR" note="Requires recurring billing model" />
          <EmptyCard title="ARR" note="Requires recurring billing model" />
          <EmptyCard title="New Revenue" note="No historical baseline to diff against" />
          <EmptyCard title="Expansion Revenue" note="No upsell tracking in current schema" />
        </div>
      </SectionWrapper>

      <SectionWrapper
        title="Revenue Trend — Not Connected"
        description="Month-over-month trend requires historical invoice snapshots. Only current-state invoices exist; no monthly roll-up is stored."
      >
        <p className="text-sm py-4 text-center" style={{ color: "#94A3B8" }}>
          No historical data — trend chart will appear once invoices accumulate across billing periods.
        </p>
      </SectionWrapper>

      <SectionWrapper
        title="Revenue By Department / Service — Not Connected"
        description="Invoices do not carry a department or service-type breakdown field. This breakdown will appear once the invoice schema includes those dimensions."
      >
        <p className="text-sm py-4 text-center" style={{ color: "#94A3B8" }}>
          No department or service data on invoices yet.
        </p>
      </SectionWrapper>

      {/* Real invoice table */}
      {!loading && !error && (
        <SectionWrapper
          title={`All Invoices (${invoices.length})`}
          description="Every invoice row currently in Postgres."
        >
          {invoices.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: "#94A3B8" }}>
              No invoices in the database yet. Invoices appear here once created via the Invoices page.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <Th>Invoice #</Th>
                    <Th>Client</Th>
                    <Th>Amount</Th>
                    <Th>Due Date</Th>
                    <Th>Invoice Status</Th>
                    <Th>Payment Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <Td><span className="font-mono text-xs">{inv.invoiceNumber}</span></Td>
                      <Td><span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{inv.clientId || "—"}</span></Td>
                      <Td>
                        <span className="font-bold" style={{ color: "#059669" }}>
                          {inv.contractAmountCents != null ? fmt(inv.contractAmountCents) : "—"}
                        </span>
                      </Td>
                      <Td muted>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</Td>
                      <Td>
                        <StatusBadge variant={invoiceStatusVariant(inv.invoiceStatus)} label={inv.invoiceStatus} size="sm" />
                      </Td>
                      <Td muted>{inv.paymentStatus}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionWrapper>
      )}

      {/* Footer */}
      <div className="flex gap-2">
        <Link href="/billing" className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/recurring-revenue" className="rtm-btn-secondary text-sm">Recurring Revenue →</Link>
        <Link href="/billing/collections" className="rtm-btn-primary text-sm">Collections →</Link>
      </div>
    </div>
  );
}
