"use client";

import { useState } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const kpiData = [
  { label: "Renewals Due In 90 Days", value: "24", sub: "clients", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { label: "Renewals Due In 60 Days", value: "16", sub: "clients", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { label: "Renewals Due In 30 Days", value: "9", sub: "clients", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { label: "Renewals This Month", value: "5", sub: "due now", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  { label: "Renewal Revenue", value: "$1.24M", sub: "at stake", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { label: "Upsell Revenue", value: "$318K", sub: "pipeline", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { label: "Retention Rate", value: "91.4%", sub: "trailing 12mo", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
  { label: "Churn Risk Clients", value: "7", sub: "flagged", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
];

const pipelineStages = [
  { stage: "90 Days", clients: 24, revenue: "$620K", color: "bg-blue-500", light: "bg-blue-50 border-blue-200" },
  { stage: "60 Days", clients: 16, revenue: "$298K", color: "bg-amber-500", light: "bg-amber-50 border-amber-200" },
  { stage: "30 Days", clients: 9, revenue: "$187K", color: "bg-orange-500", light: "bg-orange-50 border-orange-200" },
  { stage: "Negotiation", clients: 6, revenue: "$134K", color: "bg-purple-500", light: "bg-purple-50 border-purple-200" },
  { stage: "Renewed", clients: 38, revenue: "$980K", color: "bg-emerald-500", light: "bg-emerald-50 border-emerald-200" },
  { stage: "Lost", clients: 4, revenue: "$76K", color: "bg-red-500", light: "bg-red-50 border-red-200" },
];

const renewalRows = [
  { client: "Apex Digital", am: "Sarah Chen", contractValue: "$48,000", services: "SEO, PPC", renewalDate: "Jul 5, 2025", daysRemaining: 28, probability: 92, healthScore: 88, status: "On Track" },
  { client: "BrightScale Agency", am: "Marcus Lee", contractValue: "$32,500", services: "SEO, Content", renewalDate: "Jul 12, 2025", daysRemaining: 35, probability: 74, healthScore: 65, status: "At Risk" },
  { client: "CloudPath Solutions", am: "Priya Nair", contractValue: "$61,200", services: "PPC, GBP, Reporting", renewalDate: "Jul 28, 2025", daysRemaining: 51, probability: 88, healthScore: 91, status: "On Track" },
  { client: "DeltaForge Inc", am: "Jordan Wells", contractValue: "$22,800", services: "SEO", renewalDate: "Aug 3, 2025", daysRemaining: 57, probability: 55, healthScore: 48, status: "High Risk" },
  { client: "EdgeMark Media", am: "Sarah Chen", contractValue: "$39,000", services: "PPC, Social", renewalDate: "Aug 14, 2025", daysRemaining: 68, probability: 81, healthScore: 79, status: "On Track" },
  { client: "Frontier Brands", am: "Marcus Lee", contractValue: "$54,600", services: "SEO, PPC, Content", renewalDate: "Aug 22, 2025", daysRemaining: 76, probability: 96, healthScore: 94, status: "Renewing" },
  { client: "GrowthLab Co", am: "Priya Nair", contractValue: "$18,400", services: "GBP", renewalDate: "Sep 1, 2025", daysRemaining: 86, probability: 62, healthScore: 57, status: "At Risk" },
  { client: "HorizonTech", am: "Jordan Wells", contractValue: "$76,000", services: "SEO, PPC, Reporting", renewalDate: "Sep 10, 2025", daysRemaining: 95, probability: 90, healthScore: 87, status: "On Track" },
];

const upsellRows = [
  { client: "Apex Digital", currentServices: "SEO, PPC", recommended: "GBP + Content Marketing", reason: "SEO client with no local presence or content strategy", expectedRevenue: "$750/mo", confidence: 88, priority: "High", assignedAM: "Sarah Chen", nextAction: "Schedule upsell call" },
  { client: "CloudPath Solutions", currentServices: "PPC, GBP", recommended: "Landing Pages + Call Tracking", reason: "Meta Ads client needs dedicated landing pages to improve conversion", expectedRevenue: "$1,100/mo", confidence: 76, priority: "Medium", assignedAM: "Priya Nair", nextAction: "Send landing page proposal" },
  { client: "Frontier Brands", currentServices: "LSA", recommended: "GBP + Review Management", reason: "LSA client missing GMB presence and review generation strategy", expectedRevenue: "$600/mo", confidence: 91, priority: "High", assignedAM: "Marcus Lee", nextAction: "Present GBP package" },
  { client: "HorizonTech", currentServices: "Google Ads", recommended: "Reporting + Conversion Tracking", reason: "Google Ads client lacks attribution and reporting visibility", expectedRevenue: "$400/mo", confidence: 82, priority: "Medium", assignedAM: "Jordan Wells", nextAction: "Demo reporting dashboard" },
  { client: "EdgeMark Media", currentServices: "Meta Ads, Social", recommended: "Landing Pages + Call Tracking", reason: "Meta Ads traffic has no dedicated conversion path", expectedRevenue: "$1,500/mo", confidence: 69, priority: "Medium", assignedAM: "Sarah Chen", nextAction: "Share landing page case study" },
  { client: "GrowthLab Co", currentServices: "GBP", recommended: "GBP + Review Management", reason: "Client has GBP but no review generation or response management", expectedRevenue: "$700/mo", confidence: 57, priority: "Low", assignedAM: "Priya Nair", nextAction: "Add to review drip campaign" },
  { client: "BrightScale Agency", currentServices: "SEO, Content", recommended: "GBP + Content", reason: "SEO client with no GBP optimization limiting local pack visibility", expectedRevenue: "$800/mo", confidence: 73, priority: "Medium", assignedAM: "Marcus Lee", nextAction: "Audit GBP profile" },
  { client: "DeltaForge Inc", currentServices: "SEO", recommended: "GBP + Content Marketing", reason: "Underperforming SEO client — GBP and content would accelerate results", expectedRevenue: "$950/mo", confidence: 44, priority: "Low", assignedAM: "Jordan Wells", nextAction: "Hold health review first" },
];

const revenueForecast = [
  { label: "Monthly Renewal Forecast", value: "$124,500", growth: "+8.2%", note: "vs prior month", color: "text-emerald-600", icon: "📅" },
  { label: "Quarterly Renewal Forecast", value: "$368,200", growth: "+11.4%", note: "vs prior quarter", color: "text-blue-600", icon: "📆" },
  { label: "Annual Renewal Forecast", value: "$1.42M", growth: "+14.7%", note: "vs prior year", color: "text-violet-600", icon: "📊" },
  { label: "Upsell Forecast", value: "$318,000", growth: "+22.1%", note: "pipeline total", color: "text-amber-600", icon: "🚀" },
  { label: "Revenue At Risk", value: "$76,400", growth: "-5.3%", note: "churn risk clients", color: "text-red-600", icon: "⚠️" },
  { label: "Expected Expansion Revenue", value: "$212,800", growth: "+18.6%", note: "upsell + upgrades", color: "text-sky-600", icon: "📈" },
];

const aiInsights = [
  {
    icon: "🚀",
    type: "Opportunity",
    client: "Frontier Brands",
    insight: "Client is highly engaged — 98% task approval rate over last 90 days. Strong candidate for annual contract upgrade.",
    action: "Recommend Annual Contract",
    priority: "High",
    color: "border-emerald-300 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: "📈",
    type: "Upsell Signal",
    client: "CloudPath Solutions",
    insight: "Performance improving: +34% lead volume MoM. Client ready to expand into Content Marketing to support pipeline.",
    action: "Recommend Adding Content",
    priority: "High",
    color: "border-blue-300 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    icon: "📋",
    type: "Contract Upgrade",
    client: "Apex Digital",
    insight: "Month-to-month for 18 months. Historically sticky. Recommend locking into annual for predictability and discount incentive.",
    action: "Recommend Annual Contract",
    priority: "Medium",
    color: "border-sky-300 bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
  },
  {
    icon: "🗺️",
    type: "Upsell Signal",
    client: "HorizonTech",
    insight: "Client has 12 locations but no GBP management. Significant local visibility gap identified. High ROI upsell potential.",
    action: "Recommend Adding GBP",
    priority: "Medium",
    color: "border-violet-300 bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    icon: "📊",
    type: "Upsell Signal",
    client: "BrightScale Agency",
    insight: "Client reviews reports manually. Automated reporting add-on would reduce AM overhead and increase perceived value.",
    action: "Recommend Adding Reporting",
    priority: "Low",
    color: "border-amber-300 bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    icon: "⚠️",
    type: "Renewal Risk",
    client: "DeltaForge Inc",
    insight: "Renewal risk detected: Health score dropped from 72 to 48 over 60 days. No recent touchpoint logged. Immediate outreach needed.",
    action: "Escalate Risk",
    priority: "Critical",
    color: "border-red-300 bg-red-50",
    badge: "bg-red-100 text-red-700",
  },
  {
    icon: "📉",
    type: "Churn Signal",
    client: "GrowthLab Co",
    insight: "Declining performance 3 months before renewal. CTR down 18%, conversions down 22%. Client sentiment trending negative.",
    action: "Schedule Renewal Meeting",
    priority: "High",
    color: "border-rose-300 bg-rose-50",
    badge: "bg-rose-100 text-rose-700",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, string> = {
    "On Track": "bg-emerald-100 text-emerald-700",
    "At Risk": "bg-amber-100 text-amber-700",
    "High Risk": "bg-red-100 text-red-700",
    Renewing: "bg-blue-100 text-blue-700",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-slate-100 text-slate-600",
    Critical: "bg-rose-100 text-rose-800 font-bold",
  };
  return map[priority] ?? "bg-slate-100 text-slate-600";
}

function scoreBar(value: number, danger = false) {
  const color = danger
    ? value < 60
      ? "bg-red-400"
      : value < 75
      ? "bg-amber-400"
      : "bg-emerald-400"
    : value >= 80
    ? "bg-emerald-400"
    : value >= 60
    ? "bg-amber-400"
    : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-600">{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RenewalsPage() {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [renewalSearch, setRenewalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  const filteredRenewals = renewalRows.filter((r) => {
    const matchSearch =
      r.client.toLowerCase().includes(renewalSearch.toLowerCase()) ||
      r.am.toLowerCase().includes(renewalSearch.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <main className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg">
          ✅ {toast}
        </div>
      )}

      {/* Page Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Renewals &amp; Upsells</h1>
        <p className="text-sm text-slate-500">
          Track renewals, retention, contract forecasting, upsell opportunities, and recurring revenue growth.
        </p>
      </div>

      {/* ── 1. Renewal KPI Dashboard ─────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Renewal KPI Dashboard
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {kpiData.map((k) => (
            <div
              key={k.label}
              className={`rounded-xl border ${k.border} ${k.bg} p-4 flex flex-col gap-1`}
            >
              <span className={`text-2xl font-bold ${k.color}`}>{k.value}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {k.sub}
              </span>
              <span className="text-xs text-slate-600 leading-tight">{k.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Renewal Pipeline ──────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Renewal Pipeline
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {pipelineStages.map((s) => (
            <button
              key={s.stage}
              onClick={() =>
                setActiveStage(activeStage === s.stage ? null : s.stage)
              }
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                activeStage === s.stage
                  ? `${s.light} shadow-md scale-105`
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className={`mb-2 h-1 w-full rounded-full ${s.color}`} />
              <p className="text-sm font-semibold text-slate-800">{s.stage}</p>
              <p className="text-xl font-bold text-slate-900">{s.clients}</p>
              <p className="text-xs text-slate-500">clients</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{s.revenue}</p>
            </button>
          ))}
        </div>
        {activeStage && (
          <p className="mt-2 text-xs text-slate-500">
            Showing stage: <strong>{activeStage}</strong> — click again to clear filter.
          </p>
        )}
      </section>

      {/* ── 3. Renewal Table ─────────────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Renewal Table
          </h2>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search client or AM…"
              value={renewalSearch}
              onChange={(e) => setRenewalSearch(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {["All", "On Track", "At Risk", "High Risk", "Renewing"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                {[
                  "Client",
                  "Account Manager",
                  "Contract Value",
                  "Current Services",
                  "Renewal Date",
                  "Days Remaining",
                  "Renewal Probability",
                  "Health Score",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRenewals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-slate-400">
                    No results found.
                  </td>
                </tr>
              ) : (
                filteredRenewals.map((r) => (
                  <tr
                    key={r.client}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {r.client}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {r.am}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700 whitespace-nowrap">
                      {r.contractValue}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {r.services}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {r.renewalDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          r.daysRemaining <= 30
                            ? "text-red-600"
                            : r.daysRemaining <= 60
                            ? "text-amber-600"
                            : "text-slate-700"
                        }`}
                      >
                        {r.daysRemaining}d
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {scoreBar(r.probability)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {scoreBar(r.healthScore, true)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(r.status)}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 4. Upsell Opportunity Center ─────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Upsell Opportunity Center
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                {[
                  "Client",
                  "Current Services",
                  "Recommended Service",
                  "Reason",
                  "Expected Monthly Revenue",
                  "Confidence Score",
                  "Priority",
                  "Assigned AM",
                  "Next Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {upsellRows.map((u) => (
                <tr
                  key={`${u.client}-${u.recommended}`}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                    {u.client}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {u.currentServices}
                  </td>
                  <td className="px-4 py-3 text-violet-700 font-medium whitespace-nowrap">
                    {u.recommended}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[220px]">
                    <span className="block leading-snug">{u.reason}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-700 whitespace-nowrap">
                    {u.expectedRevenue}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {scoreBar(u.confidence)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityBadge(u.priority)}`}
                    >
                      {u.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {u.assignedAM}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => showToast(`Next action: ${u.nextAction} — ${u.client}`)}
                      className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors"
                    >
                      {u.nextAction}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. Revenue Forecast ───────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Revenue Forecast
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {revenueForecast.map((f) => (
            <div
              key={f.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-base">{f.icon}</span>
                <p className="text-xs text-slate-500 leading-snug">{f.label}</p>
              </div>
              <p className={`text-2xl font-bold ${f.color}`}>{f.value}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`text-xs font-semibold ${f.growth.startsWith("-") ? "text-red-500" : "text-emerald-600"}`}>
                  {f.growth}
                </span>
                <span className="text-xs text-slate-400">{f.note}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. AI Renewal Insights ────────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            AI Renewal Insights
          </h2>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
            AI-Powered
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {aiInsights.map((ins) => (
            <div
              key={`${ins.client}-${ins.type}`}
              className={`rounded-xl border-2 p-4 ${ins.color}`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ins.icon}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {ins.type}
                    </p>
                    <p className="text-sm font-semibold text-slate-800">{ins.client}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ins.badge}`}
                >
                  {ins.priority}
                </span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-slate-600">{ins.insight}</p>
              <button
                onClick={() => showToast(`Action queued: ${ins.action} for ${ins.client}`)}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              >
                {ins.action}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Renewal Action Center ─────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Renewal Action Center
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs text-slate-500">
            Select an action to initiate a renewal workflow for the selected client.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Start Renewal", style: "bg-blue-600 text-white hover:bg-blue-700", icon: "▶️" },
              { label: "Schedule Renewal Meeting", style: "bg-violet-600 text-white hover:bg-violet-700", icon: "📅" },
              { label: "Create Upsell Opportunity", style: "bg-emerald-600 text-white hover:bg-emerald-700", icon: "🚀" },
              { label: "Generate Renewal Summary", style: "bg-amber-600 text-white hover:bg-amber-700", icon: "📋" },
              { label: "Send Proposal", style: "bg-sky-600 text-white hover:bg-sky-700", icon: "📤" },
              { label: "Mark Renewed", style: "bg-green-600 text-white hover:bg-green-700", icon: "✅" },
              { label: "Escalate Risk", style: "bg-red-600 text-white hover:bg-red-700", icon: "⚠️" },
              { label: "Open Client Health", style: "bg-slate-700 text-white hover:bg-slate-800", icon: "❤️" },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => showToast(`${btn.label} initiated.`)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors shadow-sm ${btn.style}`}
              >
                <span>{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
