"use client";

import type { BillingKPIs } from "@/lib/billing/types";

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

const IconRevenue = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#059669" }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconClock = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#B45309" }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconAlert = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#DC2626" }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);
const IconRefresh = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--rtm-blue)" }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#7C3AED" }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface KPIItemProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function KPIItem({ title, value, subtitle, trend, trendValue, icon, iconBg }: KPIItemProps) {
  const trendStyle =
    trend === "up"
      ? { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" }
      : trend === "down"
        ? { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" }
        : { bg: "var(--rtm-bg)", color: "var(--rtm-text-muted)", border: "var(--rtm-border)" };

  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide truncate" style={{ color: "var(--rtm-text-muted)" }}>
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>{subtitle}</p>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      {trendValue && trend && (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border"
            style={{ background: trendStyle.bg, color: trendStyle.color, borderColor: trendStyle.border }}
          >
            {trendArrow} {trendValue}
          </span>
          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>vs last month</span>
        </div>
      )}
    </div>
  );
}

interface Props {
  kpis: BillingKPIs;
}

export default function BillingKPICards({ kpis }: Props) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
      <KPIItem title="Monthly Recurring Revenue" value={formatCurrency(kpis.mrr)} trend="up"  trendValue={`+${kpis.mrrTrend}%`}         icon={<IconRevenue />} iconBg="#ECFDF5" />
      <KPIItem title="Outstanding Invoices"       value={formatCurrency(kpis.outstandingInvoices)} subtitle={`${kpis.outstandingCount} invoices`}       trend="neutral"                                icon={<IconClock />}   iconBg="#FFFBEB" />
      <KPIItem title="Overdue Accounts"           value={formatCurrency(kpis.overdueAccounts)}     subtitle={`${kpis.overdueCount} accounts`}            trend="down"  trendValue="Needs attention"      icon={<IconAlert />}   iconBg="#FEF2F2" />
      <KPIItem title="Upcoming Renewals"          value={formatCurrency(kpis.upcomingRenewals)}    subtitle={`${kpis.renewalCount} in 90 days`}          trend="neutral"                                icon={<IconRefresh />} iconBg="var(--rtm-blue-light)" />
      <KPIItem title="Collected This Month"       value={formatCurrency(kpis.collectedThisMonth)}  trend="up"  trendValue={`+${kpis.collectedTrend}%`}   icon={<IconCheck />}   iconBg="#F5F3FF" />
    </div>
  );
}
