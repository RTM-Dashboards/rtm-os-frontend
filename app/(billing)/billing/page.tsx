"use client";

// RTM OS — Billing Dashboard
//
// Every figure on this page comes from a real data source.
// Figures without a real source have been removed or labelled honestly.
//
// REAL SOURCES (all via /api/invoices → Postgres):
//   Outstanding Balance  — SUM(contractAmountCents) where invoiceStatus
//                          NOT IN Paid, Cancelled
//   Collected Revenue    — SUM(contractAmountCents) where paymentStatus = Paid
//   Overdue Invoices     — count returned by /api/invoices?overdue=true
//   Activation Ready     — count from /api/clients + /api/businesses (isActivationReady)
//
// NOT SHOWN (no source in current schema):
//   MRR / ARR            — requires recurring Contract model (does not exist)
//   Revenue Forecast     — requires contract projections (do not exist)
//   AI Billing Summary   — requires real event history (no audit log)
//   Activity Timeline    — requires real event history (no audit log)

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { fetchAMClients, type BusinessClient } from "@/lib/account-management/am-client-data";
import type { InvoiceRecord } from "@/app/api/invoices/route";

const workspace = getWorkspace("billing")!;

// ── Badge helpers ─────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

function overdueStatusVariant(invoiceStatus: string): BadgeVariant {
  switch (invoiceStatus) {
    case "Overdue":        return "error";
    case "Escalated":      return "error";
    case "Partially Paid": return "warning";
    case "Sent":           return "pending";
    case "Viewed":         return "info";
    default:               return "neutral";
  }
}

// ── Activation-ready predicate (mirrors the one in AM) ────────────────────────
//
// isActivationReady: invoice paid + payment confirmed + not yet cleared to AM.
// Business records only exist once an invoice has been marked Paid via
// MarkPaidFlowModal, so no Business can be a Lead or Proposal Sent.

function isActivationReady(b: BusinessClient): boolean {
  if (b.cleared) return false;
  const inv = b.invoiceStatus?.toLowerCase() ?? "";
  const pay = b.paymentStatus?.toLowerCase() ?? "";
  return (inv === "paid" || inv === "cleared") && pay === "paid";
}

// ── Currency formatter ────────────────────────────────────────────────────────

function formatCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function daysOverdueFromISO(dueDateISO: string): number {
  const due = new Date(dueDateISO).getTime();
  const now  = Date.now();
  return Math.max(0, Math.floor((now - due) / 86_400_000));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-bold uppercase tracking-widest mb-4"
      style={{ color: "var(--rtm-text-muted)" }}
    >
      {children}
    </h2>
  );
}

function SummaryLinkCard({
  title,
  href,
  accent,
  bg,
  border,
  stats,
  description,
}: {
  title: string;
  href: string;
  accent: string;
  bg: string;
  border: string;
  stats: Array<{ label: string; value: string | number }>;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border p-5 flex flex-col gap-3 transition-all hover:shadow-sm hover:-translate-y-0.5"
      style={{ background: bg, borderColor: border, textDecoration: "none" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: accent }}>{title}</span>
        <span className="text-xs font-semibold" style={{ color: accent }}>View →</span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
        {description}
      </p>
      {stats.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1" style={{ borderTop: `1px solid ${border}` }}>
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5">
              <span
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {s.label}
              </span>
              <span className="text-base font-bold" style={{ color: accent }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}

// ── Fetch state type ──────────────────────────────────────────────────────────

type LoadState = "loading" | "loaded" | "error";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BillingDashboard() {
  // ── Invoice data (real, from Postgres) ───────────────────────────────────
  const [allInvoices,     setAllInvoices]     = useState<InvoiceRecord[]>([]);
  const [overdueInvoices, setOverdueInvoices] = useState<InvoiceRecord[]>([]);
  const [invoiceState,    setInvoiceState]    = useState<LoadState>("loading");
  const [invoiceError,    setInvoiceError]    = useState<string | null>(null);

  // ── Activation-ready count (real, from Postgres) ─────────────────────────
  const [activationReadyCount, setActivationReadyCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setInvoiceState("loading");
      setInvoiceError(null);

      try {
        // Fetch all invoices and overdue invoices in parallel.
        const [allRes, overdueRes] = await Promise.all([
          fetch("/api/invoices"),
          fetch("/api/invoices?overdue=true"),
        ]);

        if (!allRes.ok) {
          const err = (await allRes.json()) as { error?: string };
          throw new Error(err.error ?? `HTTP ${allRes.status}`);
        }
        if (!overdueRes.ok) {
          const err = (await overdueRes.json()) as { error?: string };
          throw new Error(err.error ?? `HTTP ${overdueRes.status}`);
        }

        const allData     = (await allRes.json())     as { invoices: InvoiceRecord[] };
        const overdueData = (await overdueRes.json()) as { invoices: InvoiceRecord[] };

        if (!cancelled) {
          setAllInvoices(allData.invoices     ?? []);
          setOverdueInvoices(overdueData.invoices ?? []);
          setInvoiceState("loaded");
        }
      } catch (err) {
        if (!cancelled) {
          setInvoiceError(String(err));
          setInvoiceState("error");
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    fetchAMClients()
      .then((businesses) => {
        setActivationReadyCount(businesses.filter(isActivationReady).length);
      })
      .catch(() => {
        // On error, keep at 0 — do not show stale or fabricated data.
        setActivationReadyCount(0);
      });
  }, []);

  // ── Derived KPIs (computed from real invoice data) ────────────────────────

  // Outstanding Balance: SUM(contractAmountCents) where invoiceStatus NOT IN Paid, Cancelled
  const outstandingBalanceCents = allInvoices
    .filter((i) => i.invoiceStatus !== "Paid" && i.invoiceStatus !== "Cancelled")
    .reduce((sum, i) => sum + i.contractAmountCents, 0);

  // Collected Revenue: SUM(contractAmountCents) where paymentStatus = Paid
  const collectedRevenueCents = allInvoices
    .filter((i) => i.paymentStatus === "Paid")
    .reduce((sum, i) => sum + i.contractAmountCents, 0);

  // Overdue: count from the ?overdue=true fetch (same rule as Collections page)
  const overdueCount = overdueInvoices.length;

  // Paid invoice count (for Invoices link card)
  const paidCount = allInvoices.filter((i) => i.paymentStatus === "Paid").length;

  // ── Loading / error UI helpers ────────────────────────────────────────────

  const kpiValue = (cents: number) =>
    invoiceState === "loading"
      ? "—"
      : invoiceState === "error"
        ? "Error"
        : formatCents(cents);

  const kpiCount = (n: number) =>
    invoiceState === "loading"
      ? "—"
      : invoiceState === "error"
        ? "Error"
        : String(n);

  // ── Empty-state messaging ─────────────────────────────────────────────────
  //
  // With no invoices yet, every figure correctly reads zero. The dashboard
  // is not broken — it is waiting for the first invoice to be created.

  const showEmptyNotice = invoiceState === "loaded" && allInvoices.length === 0;

  return (
    <div className="space-y-8">

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
          Billing Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Invoice management, collections, and activation readiness.
        </p>
      </div>

      {/* Fetch error banner */}
      {invoiceState === "error" && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#DC2626" }}
        >
          <span className="font-semibold">Could not load invoice data.</span>{" "}
          {invoiceError}
        </div>
      )}

      {/* Empty-state notice */}
      {showEmptyNotice && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ background: "#F0F9FF", borderColor: "#BAE6FD", color: "#0891B2" }}
        >
          No invoices have been created yet. All figures below are zero — that
          is the correct state. Create a client, a business, and an invoice to
          see real numbers here.
        </div>
      )}

      {/* KPI Cards */}
      <section>
        <SectionHeading>Key Billing Metrics</SectionHeading>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Outstanding Balance — real: SUM(contractAmountCents) where not Paid/Cancelled */}
          <KpiCard
            title="Outstanding Balance"
            value={kpiValue(outstandingBalanceCents)}
            iconBg="#FEF2F2"
            iconColor="#DC2626"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            }
          />

          {/* Collected Revenue — real: SUM(contractAmountCents) where paymentStatus = Paid */}
          <KpiCard
            title="Collected Revenue"
            value={kpiValue(collectedRevenueCents)}
            iconBg="#ECFDF5"
            iconColor="#059669"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
          />

          {/* Overdue Invoices — real: /api/invoices?overdue=true count */}
          <KpiCard
            title="Overdue Invoices"
            value={kpiCount(overdueCount)}
            iconBg="#FEF2F2"
            iconColor="#DC2626"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            }
          />

          {/* Activation Ready — real: businesses filtered by isActivationReady */}
          <KpiCard
            title="Activation Ready"
            value={String(activationReadyCount)}
            iconBg="#F0F9FF"
            iconColor="#0891B2"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7"/>
              </svg>
            }
          />

        </div>
      </section>

      {/* Section summary cards — links to full pages */}
      <section>
        <SectionHeading>Billing Operations</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <SummaryLinkCard
            title="Invoices"
            href="/billing/invoices"
            accent="#1B4FD8"
            bg="#EFF6FF"
            border="#BFDBFE"
            description="Generate, send, and record payments for all client invoices."
            stats={
              invoiceState === "loaded"
                ? [
                    { label: "Outstanding", value: formatCents(outstandingBalanceCents) },
                    { label: "Overdue",     value: overdueCount },
                    { label: "Paid",        value: paidCount },
                  ]
                : []
            }
          />

          <SummaryLinkCard
            title="Recurring Revenue"
            href="/billing/recurring-revenue"
            accent="#059669"
            bg="#ECFDF5"
            border="#A7F3D0"
            description="Track MRR, ARR, and active contracts. Requires recurring contract tracking, which is not yet available."
            stats={[]}
          />

          <SummaryLinkCard
            title="Collections"
            href="/billing/collections"
            accent="#DC2626"
            bg="#FEF2F2"
            border="#FECACA"
            description="Overdue accounts, collection statuses, and follow-up actions."
            stats={
              invoiceState === "loaded"
                ? [{ label: "Overdue", value: overdueCount }]
                : []
            }
          />

          <SummaryLinkCard
            title="Activation Queue"
            href="/billing/activation-queue"
            accent="#7C3AED"
            bg="#F5F3FF"
            border="#DDD6FE"
            description="Clients cleared through billing ready for activation and onboarding."
            stats={[{ label: "Ready", value: activationReadyCount }]}
          />

          <SummaryLinkCard
            title="Revenue"
            href="/billing/revenue"
            accent="#D97706"
            bg="#FFFBEB"
            border="#FDE68A"
            description="Revenue reporting by department and service. Requires recurring contract tracking and department tagging on invoices, which are not yet available."
            stats={[]}
          />

          <SummaryLinkCard
            title="Active Services"
            href="/billing/active-services"
            accent="#0891B2"
            bg="#F0F9FF"
            border="#BAE6FD"
            description="All current client service subscriptions and their billing status."
            stats={[]}
          />

        </div>
      </section>

      {/* Overdue Accounts — real data from /api/invoices?overdue=true */}
      <SectionWrapper
        title="Overdue Accounts"
        description="Invoices past their due date that have been sent to clients"
        actions={
          <Link
            href="/billing/collections"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:opacity-80"
            style={{ color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2" }}
          >
            All Collections →
          </Link>
        }
      >
        {invoiceState === "loading" && (
          <p className="text-sm py-4 text-center" style={{ color: "var(--rtm-text-muted)" }}>
            Loading…
          </p>
        )}

        {invoiceState === "error" && (
          <p className="text-sm py-4" style={{ color: "#DC2626" }}>
            Could not load overdue invoices.
          </p>
        )}

        {invoiceState === "loaded" && overdueInvoices.length === 0 && (
          <p className="text-sm py-4 text-center" style={{ color: "var(--rtm-text-muted)" }}>
            No overdue invoices. Check back here once invoices have been sent to clients.
          </p>
        )}

        {invoiceState === "loaded" && overdueInvoices.length > 0 && (
          <div className="space-y-2">
            {overdueInvoices.slice(0, 5).map((inv) => {
              const days = daysOverdueFromISO(inv.dueDate);
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
                  style={{
                    background:   days >= 30 ? "#FEF2F2" : "var(--rtm-bg)",
                    borderColor:  days >= 30 ? "#FECACA" : "var(--rtm-border-light)",
                  }}
                >
                  <div className="min-w-0">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className="ml-3 text-xs"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {inv.billingOwner || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold text-[#DC2626]">
                      {formatCents(inv.contractAmountCents)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                      {days}d overdue
                    </span>
                    <StatusBadge
                      variant={overdueStatusVariant(inv.invoiceStatus)}
                      label={inv.invoiceStatus}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
            {overdueInvoices.length > 5 && (
              <p className="text-xs pt-1 text-center" style={{ color: "var(--rtm-text-muted)" }}>
                +{overdueInvoices.length - 5} more — see{" "}
                <Link href="/billing/collections" style={{ color: "#DC2626" }}>
                  Collections
                </Link>
              </p>
            )}
          </div>
        )}
      </SectionWrapper>

    </div>
  );
}
