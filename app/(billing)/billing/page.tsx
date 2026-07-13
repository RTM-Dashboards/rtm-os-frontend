"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import {
  invoices,
  recurringContracts,
  collections,
  revenueSummary,
  aiBillingSummary,
  activityTimeline,
} from "@/lib/billing/action-center-data";
import type { CollectionStatus } from "@/lib/billing/action-center-data";
import { MASTER_CLIENTS } from "@/lib/mock/master-clients";

const workspace = getWorkspace("billing")!;

// ── Badge helpers ─────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

function collectionStatusVariant(s: CollectionStatus): BadgeVariant {
  switch (s) {
    case "Resolved":             return "success";
    case "Escalated":            return "error";
    case "Payment Arrangement":  return "warning";
    case "Contacted":            return "info";
    case "Reminder Sent":        return "pending";
    default:                     return "neutral";
  }
}

// ── KPI computations ──────────────────────────────────────────────────────────

const outstanding       = invoices.filter((i) => i.status !== "Paid" && i.status !== "Cancelled" && i.status !== "Refunded");
const overdue           = invoices.filter((i) => i.status === "Overdue");
const pendingCollection = collections.filter((c) => c.collectionStatus !== "Resolved");
// Activation Ready: same predicate as /billing/activation — invoice-cleared but not yet cleared for AM.
// Replaces activationQueue mock count; aligns Dashboard KPI with the real activation page.
const activationReadyClients = MASTER_CLIENTS.filter(
  (c) =>
    (c.billingStatus === "Cleared" || (c.billingStatus === "Paid" && c.paymentStatus === "Paid")) &&
    !c.cleared &&
    c.currentStatus !== "Lead" &&
    c.currentStatus !== "Proposal Sent"
);
const collectedThisMonth = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0);
const outstandingBalance = outstanding.reduce((sum, i) => sum + i.amount, 0);

// ── Sub-components ────────────────────────────────────────────────────────────

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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--rtm-text-muted)" }}>
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
      <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{description}</p>
      <div className="flex flex-wrap gap-3 pt-1" style={{ borderTop: `1px solid ${border}` }}>
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</span>
            <span className="text-base font-bold" style={{ color: accent }}>{s.value}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BillingDashboard() {
  const [aiExpanded, setAiExpanded] = useState(false);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Billing Dashboard
          </h1>
          <PreviewBadge />
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Billing action layer — invoice management, recurring revenue, collections, activation readiness, and revenue tracking.
        </p>
      </div>

      {/* KPI Cards */}
      <section>
        <SectionHeading>Key Billing Metrics</SectionHeading>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            title="Outstanding Invoices"
            value={`$${outstandingBalance.toLocaleString()}`}
            trend="down" trendValue="$4,200"
            iconBg="#FEF2F2" iconColor="#DC2626"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
          />
          <KpiCard
            title="Collected Revenue"
            value={`$${collectedThisMonth.toLocaleString()}`}
            trend="up" trendValue="9.3%"
            iconBg="#ECFDF5" iconColor="#059669"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <KpiCard
            title="MRR"
            value={`$${revenueSummary.mrr.toLocaleString()}`}
            trend="up" trendValue="11.2%"
            iconBg="#EFF6FF" iconColor="#1B4FD8"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
          />
          <KpiCard
            title="ARR"
            value={`$${(revenueSummary.arr / 1000).toFixed(0)}k`}
            trend="up" trendValue="11.2%"
            iconBg="#F5F3FF" iconColor="#7C3AED"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
          />
          <KpiCard
            title="Activation Ready"
            value={String(activationReadyClients.length)}
            trend="up" trendValue="3"
            iconBg="#F0F9FF" iconColor="#0891B2"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7"/></svg>}
          />
          <KpiCard
            title="Overdue Invoices"
            value={String(overdue.length)}
            trend="up" trendValue="1"
            iconBg="#FEF2F2" iconColor="#DC2626"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
          />
          <KpiCard
            title="Pending Collections"
            value={String(pendingCollection.length)}
            trend="up" trendValue="1"
            iconBg="#FFFBEB" iconColor="#D97706"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
          />
          <KpiCard
            title="Revenue Forecast"
            value={`$${revenueSummary.projectedRevenue.toLocaleString()}`}
            trend="up" trendValue="8.0%"
            iconBg="#ECFDF5" iconColor="#059669"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>}
          />
        </div>
      </section>

      {/* Section summary cards — links to full pages, no duplicate tables */}
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
            stats={[
              { label: "Outstanding", value: `$${outstandingBalance.toLocaleString()}` },
              { label: "Overdue", value: overdue.length },
              { label: "Paid", value: invoices.filter((i) => i.status === "Paid").length },
            ]}
          />
          <SummaryLinkCard
            title="Recurring Revenue"
            href="/billing/recurring-revenue"
            accent="#059669"
            bg="#ECFDF5"
            border="#A7F3D0"
            description="MRR, ARR, active contracts, renewals, and at-risk accounts."
            stats={[
              { label: "MRR", value: `$${revenueSummary.mrr.toLocaleString()}` },
              { label: "ARR", value: `$${(revenueSummary.arr / 1000).toFixed(0)}k` },
              { label: "Active", value: recurringContracts.filter((c) => c.status === "Active").length },
            ]}
          />
          <SummaryLinkCard
            title="Collections"
            href="/billing/collections"
            accent="#DC2626"
            bg="#FEF2F2"
            border="#FECACA"
            description="Overdue accounts, collection statuses, and follow-up actions."
            stats={[
              { label: "Pending", value: pendingCollection.length },
              { label: "Escalated", value: collections.filter((c) => c.collectionStatus === "Escalated").length },
            ]}
          />
          <SummaryLinkCard
            title="Activation Queue"
            href="/billing/activation-queue"
            accent="#7C3AED"
            bg="#F5F3FF"
            border="#DDD6FE"
            description="Clients cleared through billing ready for activation and onboarding."
            stats={[
              { label: "Ready", value: activationReadyClients.length },
            ]}
          />
          <SummaryLinkCard
            title="Revenue"
            href="/billing/revenue"
            accent="#D97706"
            bg="#FFFBEB"
            border="#FDE68A"
            description="Monthly, quarterly, and annual revenue by department and service."
            stats={[
              { label: "Projected", value: `$${revenueSummary.projectedRevenue.toLocaleString()}` },
              { label: "At Risk", value: `$${revenueSummary.revenueAtRisk.toLocaleString()}` },
            ]}
          />
          <SummaryLinkCard
            title="Active Services"
            href="/billing/active-services"
            accent="#0891B2"
            bg="#F0F9FF"
            border="#BAE6FD"
            description="All current client service subscriptions and their billing status."
            stats={[
              { label: "Active", value: 4 },
              { label: "At Risk", value: 1 },
            ]}
          />
        </div>
      </section>

      {/* Collections — top overdue accounts (compact, links to full page) */}
      <SectionWrapper
        title="Overdue Accounts"
        description="Top overdue accounts requiring follow-up"
        actions={
          <Link href="/billing/collections" className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:opacity-80" style={{ color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2" }}>
            All Collections →
          </Link>
        }
      >
        <div className="space-y-2">
          {collections.filter((c) => c.collectionStatus !== "Resolved").slice(0, 4).map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
              style={{
                background: c.daysOverdue >= 30 ? "#FEF2F2" : "var(--rtm-bg)",
                borderColor: c.daysOverdue >= 30 ? "#FECACA" : "var(--rtm-border-light)",
              }}
            >
              <div className="min-w-0">
                <span className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</span>
                <span className="ml-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-bold text-[#DC2626]">${c.outstandingAmount.toLocaleString()}</span>
                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.daysOverdue > 0 ? `${c.daysOverdue}d overdue` : "Not yet due"}</span>
                <StatusBadge variant={collectionStatusVariant(c.collectionStatus)} label={c.collectionStatus} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* AI Billing Summary */}
      <section>
        <SectionHeading>AI Billing Summary</SectionHeading>
        <div
          className="rounded-xl border p-6 space-y-5"
          style={{ background: "linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)", borderColor: "#DDD6FE" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#7C3AED" }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: "#4C1D95" }}>AI Billing Summary</h2>
                <p className="text-xs" style={{ color: "#6D28D9" }}>Revenue risks, opportunities, and recommended actions</p>
              </div>
            </div>
            <button
              onClick={() => setAiExpanded((v) => !v)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
              style={{ color: "#7C3AED", borderColor: "#DDD6FE", background: "#fff" }}
            >
              {aiExpanded ? "Collapse" : "Expand"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Revenue Risks",           items: aiBillingSummary.revenueRisks,           color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
              { label: "Outstanding Collections", items: aiBillingSummary.outstandingCollections, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
              { label: "Upcoming Renewals",       items: aiBillingSummary.upcomingRenewals,       color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD" },
              { label: "Revenue Opportunities",   items: aiBillingSummary.revenueOpportunities,   color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
              { label: "Activation Bottlenecks",  items: aiBillingSummary.activationBottlenecks,  color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
              { label: "Recommended Actions",     items: aiBillingSummary.recommendedActions,     color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
            ].map((section) => (
              <div
                key={section.label}
                className="rounded-xl border p-4 space-y-2"
                style={{ background: section.bg, borderColor: section.border }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
                    style={{ background: section.color + "20", color: section.color }}
                  >
                    {section.label.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: section.color }}>{section.label}</span>
                </div>
                {(aiExpanded ? section.items : section.items.slice(0, 2)).map((item, i) => (
                  <p key={i} className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
                    • {item}
                  </p>
                ))}
                {!aiExpanded && section.items.length > 2 && (
                  <p className="text-xs font-semibold" style={{ color: section.color }}>+{section.items.length - 2} more</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activity Timeline */}
      <SectionWrapper title="Activity Timeline" description="Recent billing events and actions">
        <div className="space-y-3">
          {activityTimeline.map((evt) => {
            const colors: Record<string, { color?: string; bg?: string }> = {
              "Invoice Created":     { color: "#1B4FD8", bg: "#EFF6FF" },
              "Invoice Sent":        { color: "#0891B2", bg: "#F0F9FF" },
              "Invoice Paid":        { color: "#059669", bg: "#ECFDF5" },
              "Invoice Overdue":     { color: "#DC2626", bg: "#FEF2F2" },
              "Collection Updated":  { color: "#D97706", bg: "#FFFBEB" },
              "Activation Approved": { color: "#7C3AED", bg: "#F5F3FF" },
              "Project Activated":   { color: "#059669", bg: "#ECFDF5" },
            };
            const c = colors[evt.type] ?? { color: "#6B7280", bg: "#F9FAFB" };
            const typeAbbr = evt.type.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div
                key={evt.id}
                className="flex items-start gap-4 rounded-xl border p-4"
                style={{ background: c.bg, borderColor: `${c.color}30` }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: c.color + "20", color: c.color }}
                >
                  {typeAbbr}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold" style={{ color: c.color }}>{evt.type}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{evt.client}</span>
                    {evt.invoiceNumber && <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{evt.invoiceNumber}</span>}
                    {evt.amount && <span className="text-xs font-semibold" style={{ color: c.color }}>${evt.amount.toLocaleString()}</span>}
                  </div>
                  <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{evt.description}</p>
                  <div className="flex gap-3 mt-1 text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
                    <span>{evt.timestamp}</span>
                    <span>by {evt.actor}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

    </div>
  );
}
