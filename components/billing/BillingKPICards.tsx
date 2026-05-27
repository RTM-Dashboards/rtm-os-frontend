"use client";

import type { BillingKPIs } from "@/lib/billing/types";

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

// Dollar sign icon
const IconRevenue = () => (
  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Clock icon
const IconClock = () => (
  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Alert icon
const IconAlert = () => (
  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

// Refresh icon
const IconRefresh = () => (
  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Check circle icon
const IconCheck = () => (
  <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  accentColor: string;
}

function KPIItem({ title, value, subtitle, trend, trendValue, icon, accentColor }: KPIItemProps) {
  const trendColorClass =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
      : trend === "down"
        ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
        : "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800";

  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${accentColor} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
      {trendValue && trend && (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trendColorClass}`}>
            {trendArrow} {trendValue}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">vs last month</span>
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
      <KPIItem
        title="Monthly Recurring Revenue"
        value={formatCurrency(kpis.mrr)}
        trend="up"
        trendValue={`+${kpis.mrrTrend}%`}
        icon={<IconRevenue />}
        accentColor="bg-emerald-100 dark:bg-emerald-900/30"
      />
      <KPIItem
        title="Outstanding Invoices"
        value={formatCurrency(kpis.outstandingInvoices)}
        subtitle={`${kpis.outstandingCount} invoices`}
        trend="neutral"
        icon={<IconClock />}
        accentColor="bg-amber-100 dark:bg-amber-900/30"
      />
      <KPIItem
        title="Overdue Accounts"
        value={formatCurrency(kpis.overdueAccounts)}
        subtitle={`${kpis.overdueCount} accounts`}
        trend="down"
        trendValue="Needs attention"
        icon={<IconAlert />}
        accentColor="bg-red-100 dark:bg-red-900/30"
      />
      <KPIItem
        title="Upcoming Renewals"
        value={formatCurrency(kpis.upcomingRenewals)}
        subtitle={`${kpis.renewalCount} in 90 days`}
        trend="neutral"
        icon={<IconRefresh />}
        accentColor="bg-blue-100 dark:bg-blue-900/30"
      />
      <KPIItem
        title="Collected This Month"
        value={formatCurrency(kpis.collectedThisMonth)}
        trend="up"
        trendValue={`+${kpis.collectedTrend}%`}
        icon={<IconCheck />}
        accentColor="bg-violet-100 dark:bg-violet-900/30"
      />
    </div>
  );
}
