"use client";

import { SectionWrapper } from "@/components/ui";
import BillingKPICards from "@/components/billing/BillingKPICards";
import ActiveCampaignsTable from "@/components/billing/ActiveCampaignsTable";
import InvoiceTrackingTable from "@/components/billing/InvoiceTrackingTable";
import OverdueAccountsTable from "@/components/billing/OverdueAccountsTable";
import RenewalQueueTable from "@/components/billing/RenewalQueueTable";
import {
  billingKPIs,
  activeCampaigns,
  invoices,
  overdueAccounts,
  renewalQueue,
} from "@/lib/billing/mock-data";

// ─── Revenue Trend Sparkline (server-renderable SVG) ─────────────────────────

const MRR_TREND = [78, 80, 82, 79, 83, 85, 86, 88, 87, 91, 93, 94.8];

function RevenueSparkline() {
  const max = Math.max(...MRR_TREND);
  const min = Math.min(...MRR_TREND);
  const w = 480;
  const h = 80;
  const pad = 4;
  const pts = MRR_TREND.map((v, i) => {
    const x = pad + (i / (MRR_TREND.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / (max - min)) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`${pad},${h} ${pts} ${w - pad},${h}`}
        fill="url(#mrrGrad)"
      />
    </svg>
  );
}

// ─── Summary bar (quick stats strip) ─────────────────────────────────────────

function SummaryStrip() {
  const activeCampaignCount = activeCampaigns.filter((c) => c.campaignStatus === "active").length;
  const overdueCount = overdueAccounts.length;
  const pendingInvoiceCount = invoices.filter((i) => i.status === "pending").length;
  const renewalCount = renewalQueue.filter((r) => r.status === "at_risk").length;

  const items = [
    { label: "Active Campaigns", value: activeCampaignCount, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Overdue Accounts", value: overdueCount, color: "text-red-600 dark:text-red-400" },
    { label: "Pending Invoices", value: pendingInvoiceCount, color: "text-amber-600 dark:text-amber-400" },
    { label: "At-Risk Renewals", value: renewalCount, color: "text-orange-600 dark:text-orange-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <span className={`text-2xl font-bold ${item.color}`}>{item.value}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingDashboard() {
  const overdueTotal = overdueAccounts.reduce((sum, a) => sum + (a.amount as number), 0);
  const atRiskRenewalValue = renewalQueue
    .filter((r) => r.status === "at_risk")
    .reduce((sum, r) => sum + (r.contractValue as number), 0);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Departments</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Billing Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Active campaigns, revenue tracking, invoices, overdue accounts &amp; renewals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-2 rounded-lg bg-[var(--rtm-blue)] hover:bg-[var(--rtm-blue-dark)] text-white text-sm font-semibold transition-colors">
            + Send Invoice
          </button>
        </div>
      </div>

      {/* ── Alert Banner ── */}
      {(overdueTotal > 0 || atRiskRenewalValue > 0) && (
        <div className="space-y-2">
          {overdueTotal > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-3">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                  {overdueAccounts.length} account{overdueAccounts.length !== 1 ? "s" : ""} overdue — ${overdueTotal.toLocaleString()} at risk
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  Review the Overdue Accounts table and escalate critical cases.
                </p>
              </div>
              <button className="text-xs font-semibold text-red-700 dark:text-red-300 hover:underline flex-shrink-0">
                Collect
              </button>
            </div>
          )}
          {atRiskRenewalValue > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 px-4 py-3">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {renewalQueue.filter((r) => r.status === "at_risk").length} renewal{renewalQueue.filter((r) => r.status === "at_risk").length !== 1 ? "s" : ""} at risk — ${atRiskRenewalValue.toLocaleString()} contract value
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  Proactively engage at-risk clients before renewal date.
                </p>
              </div>
              <button className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline flex-shrink-0">
                Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <BillingKPICards kpis={billingKPIs} />

      {/* ── Summary Strip ── */}
      <SummaryStrip />

      {/* ── Revenue Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper
          title="MRR Growth"
          description="Last 12 months — May 2024"
          className="lg:col-span-2"
        >
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">$94,800</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                ↑ +11.2% from last month
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">ARR</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">$1.14M</p>
            </div>
          </div>
          <RevenueSparkline />
          <div className="mt-3 flex gap-2 text-xs text-slate-400">
            {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Revenue by AM" description="This month">
          <ul className="space-y-3">
            {[
              { name: "Maria Santos", revenue: 38200, pct: 82, color: "bg-[var(--rtm-blue)]" },
              { name: "Jordan Lee", revenue: 29700, pct: 64, color: "bg-blue-500" },
              { name: "Chris Park", revenue: 26900, pct: 58, color: "bg-violet-500" },
            ].map((am) => (
              <li key={am.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{am.name}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">${am.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${am.color}`}
                    style={{ width: `${am.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionWrapper>
      </div>

      {/* ── Active Campaigns ── */}
      <SectionWrapper
        title="Active Campaigns"
        description={`${activeCampaigns.length} total campaigns`}
        noPadding
        actions={
          <button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline">
            Export
          </button>
        }
      >
        <div className="p-4">
          <ActiveCampaignsTable data={activeCampaigns} />
        </div>
      </SectionWrapper>

      {/* ── Invoice Tracking + Overdue (side by side on xl) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionWrapper
          title="Invoice Tracking"
          description={`${invoices.length} invoices`}
          noPadding
          actions={
            <button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline">
              View all
            </button>
          }
        >
          <div className="p-4">
            <InvoiceTrackingTable data={invoices} />
          </div>
        </SectionWrapper>

        <SectionWrapper
          title="Overdue Accounts"
          description={`${overdueAccounts.length} accounts — $${overdueTotal.toLocaleString()} total`}
          noPadding
          actions={
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Action Required
            </span>
          }
        >
          <div className="p-4">
            <OverdueAccountsTable data={overdueAccounts} />
          </div>
        </SectionWrapper>
      </div>

      {/* ── Renewal Queue ── */}
      <SectionWrapper
        title="Renewal Queue"
        description={`${renewalQueue.length} upcoming renewals`}
        noPadding
        actions={
          <button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline">
            Export
          </button>
        }
      >
        <div className="p-4">
          <RenewalQueueTable data={renewalQueue} />
        </div>
      </SectionWrapper>

      {/* ── Quick Actions ── */}
      <SectionWrapper title="Quick Actions">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Send Invoice", desc: "Bill a client", icon: "💳", color: "bg-[var(--rtm-blue-xlight)] text-[var(--rtm-blue)]" },
            { label: "Apply Credit", desc: "Issue credit/refund", icon: "↩️", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
            { label: "New Subscription", desc: "Add tier upgrade", icon: "⬆️", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
            { label: "Revenue Report", desc: "Export MRR data", icon: "📊", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all text-left"
            >
              <span className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center text-lg flex-shrink-0`}>
                {action.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{action.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
