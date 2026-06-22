"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { invoices, recurringContracts, revenueSummary, aiBillingSummary } from "@/lib/billing-mock-data";

const workspace = getWorkspace("billing")!;

// ── Revenue Bar ───────────────────────────────────────────────────────────────

function RevenueBar({ label, value, max, color, showValue = true }: { label: string; value: number; max: number; color: string; showValue?: boolean }) {
  const pct = Math.max(3, Math.round((value / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <span className="font-medium">{label}</span>
        {showValue && <span className="font-bold" style={{ color: "var(--rtm-text-primary)" }}>${value.toLocaleString()}</span>}
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: `${color}20` }}>
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}CC, ${color})` }}
        />
      </div>
    </div>
  );
}

// ── Revenue Tile ──────────────────────────────────────────────────────────────

function RevTile({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div
      className="flex flex-col gap-1 px-5 py-4 rounded-xl border"
      style={{ background: `${color}10`, borderColor: `${color}30` }}
    >
      <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      {sub && <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{sub}</span>}
    </div>
  );
}

// ── Computations ──────────────────────────────────────────────────────────────

const paidInvoices = invoices.filter((i) => i.status === "Paid");
const overdueInvoices = invoices.filter((i) => i.status === "Overdue");
const mrr = recurringContracts.filter((c) => c.status === "Active").reduce((s, c) => s + c.monthlyRevenue, 0);
const arr = mrr * 12;
const q2Revenue = revenueSummary.monthlyRevenue.slice(3).reduce((s, m) => s + m.revenue, 0);
const annualRevenueProjected = revenueSummary.monthlyRevenue.reduce((s, m) => s + m.revenue, 0) * 2; // rough annualization
const maxMonthly = Math.max(...revenueSummary.monthlyRevenue.map((m) => m.revenue));
const maxDept = Math.max(...revenueSummary.revenueByDepartment.map((d) => d.revenue));
const maxService = Math.max(...revenueSummary.revenueByService.map((s) => s.revenue));
const maxClient = 60000; // Harbor Auto Group is max

// Revenue by client (top 8)
const revenueByClient = [
  { client: "Harbor Auto Group",    revenue: 60000 },
  { client: "Horizon Dental Group", revenue: 50400 },
  { client: "Pacific Dental",       revenue: 45600 },
  { client: "Metro Law Group",      revenue: 42000 },
  { client: "Lakeside Auto",        revenue: 31200 },
  { client: "Green Valley Pools",   revenue: 26400 },
  { client: "City Chiropractic",    revenue: 21600 },
  { client: "Pacific Eye Center",   revenue: 28800 },
];

const deptColors: Record<string, string> = {
  "SEO": "#1B4FD8",
  "PPC / Google Ads": "#059669",
  "Social Media": "#7C3AED",
  "Web Dev": "#0891B2",
  "Content": "#D97706",
  "Multi-Channel": "#DC2626",
};

const serviceColors: Record<string, string> = {
  "Monthly Recurring": "#059669",
  "Setup Fees": "#1B4FD8",
  "Quarterly": "#7C3AED",
  "Annual": "#0891B2",
  "One-Time": "#D97706",
  "Upsell": "#DC2626",
};

export default function RevenueDashboardPage() {
  const [aiOpen, setAiOpen] = useState(false);
  const [period, setPeriod] = useState<"Monthly" | "Quarterly" | "Annual">("Monthly");

  const periodRevenue = period === "Monthly" ? mrr : period === "Quarterly" ? q2Revenue : annualRevenueProjected;
  const periodLabel = period === "Monthly" ? "MRR" : period === "Quarterly" ? "Q2 Revenue" : "Annual (Projected)";

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
          Monthly, quarterly, and annual revenue — by department, service, and client.
        </p>
      </div>

      {/* Period Toggle */}
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

      {/* Top KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title={periodLabel}
          value={`$${periodRevenue.toLocaleString()}`}
          trend="up"
          trendValue="11.2%"
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <KpiCard
          title="ARR"
          value={`$${(arr / 1000).toFixed(0)}k`}
          trend="up"
          trendValue="11.2%"
          iconBg="#EFF6FF"
          iconColor="#1B4FD8"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <KpiCard
          title="Collected This Month"
          value={`$${paidInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}`}
          trend="up"
          trendValue="9.3%"
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          title="Revenue At Risk"
          value={`$${revenueSummary.revenueAtRisk.toLocaleString()}`}
          trend="up"
          trendValue="$1,800"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
      </div>

      {/* Revenue Summary Tiles */}
      <SectionWrapper title="Revenue Breakdown" description="Key revenue components for the current period">
        <div className="flex flex-wrap gap-3">
          <RevTile label="Recurring Revenue"  value={`$${revenueSummary.mrr.toLocaleString()}`}              color="#059669" sub="Active contracts" />
          <RevTile label="Setup Fees"          value="$8,200"                                                  color="#1B4FD8" sub="New client setup" />
          <RevTile label="Quarterly Invoices"  value="$11,700"                                                 color="#7C3AED" sub="Q2 billing" />
          <RevTile label="Annual Contracts"    value="$60,000"                                                  color="#0891B2" sub="Harbor Auto Group" />
          <RevTile label="One-Time Projects"   value="$8,500"                                                   color="#D97706" sub="Web builds" />
          <RevTile label="Upsells"             value="$7,700"                                                   color="#DC2626" sub="Expansion revenue" />
          <RevTile label="Outstanding"         value={`$${overdueInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}`} color="#DC2626" sub="Overdue invoices" />
          <RevTile label="Expansion Revenue"   value={`$${revenueSummary.expansionRevenue.toLocaleString()}`}  color="#059669" sub="Upsell + upgrades" />
        </div>
      </SectionWrapper>

      {/* Revenue Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Monthly Revenue Trend */}
        <SectionWrapper title="Monthly Revenue" description="6-month trend">
          <div className="space-y-3">
            {revenueSummary.monthlyRevenue.map((m) => (
              <RevenueBar key={m.month} label={m.month} value={m.revenue} max={maxMonthly} color="#059669" />
            ))}
            <div className="pt-2 flex justify-between text-xs" style={{ color: "var(--rtm-text-muted)", borderTop: "1px solid var(--rtm-border-light)" }}>
              <span>6-Month Total</span>
              <span className="font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                ${revenueSummary.monthlyRevenue.reduce((s, m) => s + m.revenue, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </SectionWrapper>

        {/* Revenue By Department */}
        <SectionWrapper title="Revenue By Department" description="Current month contribution">
          <div className="space-y-3">
            {revenueSummary.revenueByDepartment.map((d) => (
              <RevenueBar key={d.department} label={d.department} value={d.revenue} max={maxDept} color={deptColors[d.department] ?? "#1B4FD8"} />
            ))}
            <div className="pt-2 flex justify-between text-xs" style={{ color: "var(--rtm-text-muted)", borderTop: "1px solid var(--rtm-border-light)" }}>
              <span>Total</span>
              <span className="font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                ${revenueSummary.revenueByDepartment.reduce((s, d) => s + d.revenue, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </SectionWrapper>

        {/* Revenue By Service */}
        <SectionWrapper title="Revenue By Service" description="Current month by invoice type">
          <div className="space-y-3">
            {revenueSummary.revenueByService.map((s) => (
              <RevenueBar key={s.service} label={s.service} value={s.revenue} max={maxService} color={serviceColors[s.service] ?? "#7C3AED"} />
            ))}
          </div>
        </SectionWrapper>

        {/* Revenue By Client */}
        <SectionWrapper title="Revenue By Client" description="Top 8 clients by annual contract value">
          <div className="space-y-3">
            {revenueByClient.map((c) => (
              <RevenueBar key={c.client} label={c.client} value={c.revenue} max={maxClient} color="#0891B2" />
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* Quarterly Revenue Summary */}
      <SectionWrapper title="Quarterly Revenue" description="Q1 / Q2 revenue breakdown">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Q1 Revenue",   value: revenueSummary.monthlyRevenue.slice(0, 3).reduce((s, m) => s + m.revenue, 0), color: "#1B4FD8" },
            { label: "Q2 Revenue",   value: q2Revenue, color: "#059669" },
            { label: "Q3 Projected", value: Math.round(revenueSummary.projectedRevenue * 1.05), color: "#7C3AED" },
            { label: "Q4 Projected", value: Math.round(revenueSummary.projectedRevenue * 1.10), color: "#D97706" },
          ].map((q) => (
            <div
              key={q.label}
              className="rounded-xl border p-4 text-center space-y-1"
              style={{ background: `${q.color}10`, borderColor: `${q.color}30` }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>{q.label}</p>
              <p className="text-2xl font-bold" style={{ color: q.color }}>${q.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* AI Revenue Summary */}
      <section>
        <div
          className="rounded-xl border p-5 space-y-4"
          style={{ background: "linear-gradient(135deg, #ECFDF5 0%, #EFF6FF 100%)", borderColor: "#A7F3D0" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#059669" }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: "#065F46" }}>AI Revenue Summary</h2>
                <p className="text-xs" style={{ color: "#059669" }}>Risks, opportunities, and recommended revenue actions</p>
              </div>
            </div>
            <button
              onClick={() => setAiOpen((v) => !v)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
              style={{ color: "#059669", borderColor: "#A7F3D0", background: "#fff" }}
            >
              {aiOpen ? "Collapse" : "Expand"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Revenue Risks",          items: aiBillingSummary.revenueRisks,         color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
              { label: "Upcoming Renewals",      items: aiBillingSummary.upcomingRenewals,     color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
              { label: "Revenue Opportunities",  items: aiBillingSummary.revenueOpportunities, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
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
                {(aiOpen ? section.items : section.items.slice(0, 2)).map((item, i) => (
                  <p key={i} className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
                    • {item}
                  </p>
                ))}
                {!aiOpen && section.items.length > 2 && (
                  <p className="text-xs font-semibold" style={{ color: section.color }}>+{section.items.length - 2} more</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Billing Holds */}
      <SectionWrapper title="Billing Holds" description="Active billing holds by reason">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {[
            { reason: "Payment Issues",    count: 3, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
            { reason: "Missing Contract",  count: 1, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
            { reason: "Missing Approval",  count: 2, color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
            { reason: "Client Hold",       count: 1, color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD" },
            { reason: "Internal Hold",     count: 1, color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
          ].map((h) => (
            <div
              key={h.reason}
              className="rounded-xl border p-4 text-center space-y-2"
              style={{ background: h.bg, borderColor: h.border }}
            >
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold mx-auto"
                style={{ background: h.color + "20", color: h.color }}
              >
                {h.reason.split(" ")[0].slice(0, 2).toUpperCase()}
              </span>
              <p className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>{h.reason}</p>
              <p className="text-3xl font-bold" style={{ color: h.color }}>{h.count}</p>
              <StatusBadge
                variant={h.count > 0 ? (h.color === "#DC2626" ? "error" : "warning") : "success"}
                label={h.count > 0 ? "Active" : "Clear"}
                size="sm"
              />
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Footer */}
      <div className="flex gap-2">
        <Link href="/billing" className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/recurring-revenue" className="rtm-btn-secondary text-sm">Recurring Revenue →</Link>
        <Link href="/billing/collections" className="rtm-btn-primary text-sm">Collections →</Link>
      </div>
    </div>
  );
}
