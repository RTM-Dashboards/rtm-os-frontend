"use client";

import React, { useState, useMemo } from "react";
import {
  RENEWALS,
  getRenewalsByDaysWindow,
  getAtRiskRenewals,
  getActiveRenewals,
  computeRevenueSummary,
  type RenewalRecord,
  type RenewalStatus,
  type RenewalRisk,
  type RenewalStrategy,
} from "@/lib/account-management/renewals-data";

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

function fmt$(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(Math.abs(n) / 1_000).toFixed(0)}K`;
  return `$${Math.abs(n)}`;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#059669";
  if (score >= 60) return "#D97706";
  if (score >= 40) return "#EA580C";
  return "#DC2626";
}

function riskStyle(risk: RenewalRisk) {
  switch (risk) {
    case "Low Risk":      return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Moderate Risk": return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "High Risk":     return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Critical":      return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
  }
}

function statusStyle(status: RenewalStatus) {
  switch (status) {
    case "Not Started":         return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
    case "Planning":            return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "Review Scheduled":    return { bg: "#F0FFFE", color: "#0F766E", border: "#99F6E4" };
    case "Proposal In Progress":return { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" };
    case "Negotiation":         return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Pending Signature":   return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Renewed":             return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Lost":                return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Cancelled":           return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
  }
}

function strategyStyle(strategy: RenewalStrategy) {
  switch (strategy) {
    case "Renew As-Is":                       return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Renew With Upgrade":                return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "Renew With Budget Adjustment":      return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Renew With Service Changes":        return { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" };
    case "Retention Plan Required":           return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Executive Intervention Required":   return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
  }
}

function sentimentStyle(s: RenewalRecord["callSentiment"]) {
  switch (s) {
    case "Positive": return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Neutral":  return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
    case "Negative": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Mixed":    return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
  }
}

function daysUrgencyColor(days: number): string {
  if (days <= 0) return "#DC2626";
  if (days <= 14) return "#DC2626";
  if (days <= 30) return "#EA580C";
  if (days <= 60) return "#D97706";
  return "#64748B";
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════════════

function Badge({ label, bg, color, border, dot }: { label: string; bg: string; color: string; border: string; dot?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border whitespace-nowrap"
      style={{ background: bg, color, borderColor: border }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />}
      {label}
    </span>
  );
}

function RiskBadge({ risk }: { risk: RenewalRisk }) {
  const s = riskStyle(risk);
  const dot = risk === "Critical" ? "#DC2626" : risk === "High Risk" ? "#EA580C" : risk === "Moderate Risk" ? "#D97706" : "#059669";
  return <Badge label={risk} bg={s.bg} color={s.color} border={s.border} dot={dot} />;
}

function StatusBadge({ status }: { status: RenewalStatus }) {
  const s = statusStyle(status);
  return <Badge label={status} bg={s.bg} color={s.color} border={s.border} />;
}

function StrategyBadge({ strategy }: { strategy: RenewalStrategy }) {
  const s = strategyStyle(strategy);
  return <Badge label={strategy} bg={s.bg} color={s.color} border={s.border} />;
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const c = scoreColor(score);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-bold" style={{ color: c }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${score}%`, background: c }} />
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold" style={{ color: accent ?? "#0F172A" }}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc, accentColor = "#1B4FD8" }: { eyebrow?: string; title: string; desc?: string; accentColor?: string }) {
  return (
    <div className="border-b border-slate-100 px-6 py-4">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>{eyebrow}</p>}
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: RENEWALS DASHBOARD — KPI CARDS
// ══════════════════════════════════════════════════════════════════════════════

function RenewalsDashboard() {
  const rev = computeRevenueSummary();
  const due90 = getRenewalsByDaysWindow(90).length;
  const due60 = getRenewalsByDaysWindow(60).length;
  const due30 = getRenewalsByDaysWindow(30).length;
  const atRisk = getAtRiskRenewals();
  const total = RENEWALS.length;
  const renewed = RENEWALS.filter((r) => r.status === "Renewed").length;
  const winRate = Math.round((renewed / total) * 100);

  return (
    <div className="space-y-5">
      {/* Upcoming Renewals Row */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Upcoming Renewals</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <KpiCard label="Renewals Due — 90 Days" value={due90} sub="contracts expiring within 90 days" accent="#1D4ED8" />
          <KpiCard label="Renewals Due — 60 Days" value={due60} sub="contracts expiring within 60 days" accent="#D97706" />
          <KpiCard label="Renewals Due — 30 Days" value={due30} sub="contracts expiring within 30 days" accent="#DC2626" />
        </div>
      </div>

      {/* Revenue Row */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Revenue</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="Renewal Revenue (ARR)" value={fmt$(rev.total)} sub="total renewal portfolio" accent="#059669" />
          <KpiCard label="Revenue At Risk" value={fmt$(rev.atRisk)} sub="high risk + critical accounts" accent="#DC2626" />
          <KpiCard label="Renewal Forecast" value={fmt$(rev.forecast)} sub="probability-weighted forecast" accent="#0F766E" />
          <KpiCard label="Revenue Lost / Cancelled" value={fmt$(rev.lost)} sub="lost or cancelled this cycle" accent="#475569" />
        </div>
      </div>

      {/* At-Risk Summary Row */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Risk Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="At-Risk Renewals" value={atRisk.length} sub="high risk or critical" accent="#EA580C" />
          <KpiCard label="Win Rate" value={`${winRate}%`} sub="renewed vs total" accent="#059669" />
          <KpiCard label="Total Renewals" value={total} sub="all tracked renewals" />
          <KpiCard label="Renewed This Cycle" value={renewed} sub="completed renewals" accent="#0F766E" />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: RENEWAL TABLE
// ══════════════════════════════════════════════════════════════════════════════

const ALL_STATUSES: (RenewalStatus | "All")[] = [
  "All", "Not Started", "Planning", "Review Scheduled", "Proposal In Progress",
  "Negotiation", "Pending Signature", "Renewed", "Lost", "Cancelled",
];
const ALL_RISKS: (RenewalRisk | "All")[] = ["All", "Low Risk", "Moderate Risk", "High Risk", "Critical"];

function RenewalTable({ onSelect }: { onSelect: (r: RenewalRecord) => void }) {
  const [statusFilter, setStatusFilter] = useState<RenewalStatus | "All">("All");
  const [riskFilter, setRiskFilter] = useState<RenewalRisk | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => RENEWALS.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (riskFilter !== "All" && r.risk !== riskFilter) return false;
    if (search && !r.client.toLowerCase().includes(search.toLowerCase()) &&
        !r.accountManager.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [statusFilter, riskFilter, search]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Renewal Portfolio" title="Renewal Table" desc="All contracts with score, risk, strategy, and status." />

      <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <input
          placeholder="Search client or AM..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-56 outline-none focus:ring-2 focus:ring-blue-100"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RenewalStatus | "All")}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none">
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
        </select>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as RenewalRisk | "All")}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none">
          {ALL_RISKS.map((r) => <option key={r} value={r}>{r === "All" ? "All Risk Levels" : r}</option>)}
        </select>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} of {RENEWALS.length} renewals</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Client", "Account Manager", "Contract", "MRR", "ARR", "Renewal Date", "Score", "Risk", "Strategy", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => onSelect(r)}>
                <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{r.client}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.accountManager}</td>
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{r.contract}</td>
                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">${r.mrr.toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">${r.arr.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-semibold" style={{ color: daysUrgencyColor(r.daysUntilRenewal) }}>
                    {r.renewalDate}
                    {r.daysUntilRenewal > 0 && <span className="ml-1 text-[10px]">({r.daysUntilRenewal}d)</span>}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full" style={{ width: `${r.score.overall}%`, background: scoreColor(r.score.overall) }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: scoreColor(r.score.overall) }}>{r.score.overall}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap"><RiskBadge risk={r.risk} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><StrategyBadge strategy={r.strategy} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    onClick={(e) => { e.stopPropagation(); onSelect(r); }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-slate-400">No renewals match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: RENEWAL SCORE MODEL
// ══════════════════════════════════════════════════════════════════════════════

const SCORE_FACTORS = [
  { key: "clientHealth",        label: "Client Health",        weight: "25%", desc: "Overall client health score aggregated from all signals" },
  { key: "projectHealth",       label: "Project Health",       weight: "20%", desc: "Milestone completion, task health, blockers, deliverables" },
  { key: "communicationHealth", label: "Communication Health", weight: "20%", desc: "Recency, frequency, responsiveness, open concerns" },
  { key: "billingHealth",       label: "Billing Health",       weight: "15%", desc: "Outstanding invoices, overdue days, billing holds" },
  { key: "callIntelligence",    label: "Call Intelligence",    weight: "10%", desc: "Call sentiment trends, renewal signals, complaint patterns" },
  { key: "reportingHealth",     label: "Reporting Health",     weight: "5%",  desc: "Report delivery rate, client review status, feedback" },
  { key: "clientEngagement",    label: "Client Engagement",    weight: "5%",  desc: "Meeting participation, portal activity, response rate" },
] as const;

function RenewalScoreModel({ record }: { record: RenewalRecord }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Score Model" title="Renewal Score Model" desc="0–100 composite score weighted across seven signal categories." />
      <div className="p-6 space-y-5">

        {/* Score Gauge */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border p-6 min-w-[140px]"
            style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
            <span className="text-5xl font-extrabold" style={{ color: scoreColor(record.score.overall) }}>{record.score.overall}</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-1">Renewal Score</span>
          </div>
          <div className="flex-1 space-y-2">
            {SCORE_FACTORS.map((f) => (
              <ScoreBar key={f.key} score={record.score[f.key]} label={`${f.label} (${f.weight})`} />
            ))}
          </div>
        </div>

        {/* Factor Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Signal", "Weight", "Score", "Description"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCORE_FACTORS.map((f) => {
                const score = record.score[f.key];
                const c = scoreColor(score);
                return (
                  <tr key={f.key} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{f.label}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{f.weight}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                        style={{ color: c, background: c + "18", borderColor: c + "40" }}>{score}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{f.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: CLIENT RENEWAL PROFILE
// ══════════════════════════════════════════════════════════════════════════════

function ClientRenewalProfile({ record }: { record: RenewalRecord }) {
  const dataItems = [
    { label: "Client", value: record.client },
    { label: "Account Manager", value: record.accountManager },
    { label: "Contract", value: record.contract },
    { label: "Industry", value: record.industry },
    { label: "Client Since", value: record.clientSince },
    { label: "MRR", value: `$${record.mrr.toLocaleString()}/mo` },
    { label: "ARR", value: `$${record.arr.toLocaleString()}/yr` },
    { label: "Renewal Date", value: record.renewalDate },
    { label: "Renewal History", value: `${record.renewalHistory} prior renewal${record.renewalHistory !== 1 ? "s" : ""}` },
    { label: "Open Issues", value: record.openIssues, accent: record.openIssues > 0 ? "#DC2626" : undefined },
    { label: "Open Escalations", value: record.openEscalations, accent: record.openEscalations > 0 ? "#DC2626" : undefined },
    { label: "Recent Change Requests", value: record.recentChangeRequests, accent: record.recentChangeRequests > 2 ? "#D97706" : undefined },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Client Profile" title="Client Renewal Profile" />
      <div className="p-6 space-y-5">
        {/* Header summary */}
        <div className="flex flex-wrap gap-3">
          <RiskBadge risk={record.risk} />
          <StatusBadge status={record.status} />
          <StrategyBadge strategy={record.strategy} />
        </div>

        {/* Current services */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Current Services</p>
          <div className="flex flex-wrap gap-2">
            {record.services.map((s) => (
              <span key={s} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700">{s}</span>
            ))}
          </div>
        </div>

        {/* Data grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0 divide-y sm:divide-y-0">
          {dataItems.map(({ label, value, accent }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-xs font-semibold" style={{ color: accent ?? "#0F172A" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Signal badges */}
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: "Call Sentiment", value: record.callSentiment, s: sentimentStyle(record.callSentiment) },
          ].map(({ label, value, s }) => (
            <div key={label} className="rounded-xl border p-3" style={{ background: s.bg, borderColor: s.border }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: s.color }}>{label}</p>
              <p className="text-sm font-bold" style={{ color: s.color }}>{value}</p>
            </div>
          ))}
          <div className="rounded-xl border p-3" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">Project Status</p>
            <p className="text-sm font-bold text-slate-700">{record.projectStatus}</p>
          </div>
          <div className="rounded-xl border p-3" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">Reporting Status</p>
            <p className="text-sm font-bold text-slate-700">{record.reportingStatus}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: RENEWAL STRATEGY CENTER
// ══════════════════════════════════════════════════════════════════════════════

const STRATEGY_DEFINITIONS: { strategy: RenewalStrategy; desc: string; trigger: string }[] = [
  { strategy: "Renew As-Is",                      desc: "No changes to scope, pricing, or terms. High-health client, clean record.", trigger: "Score ≥ 80, Low Risk, no open issues" },
  { strategy: "Renew With Upgrade",               desc: "Present expansion services or upgraded tier. Strong relationship and growth signals.", trigger: "Score ≥ 75, upsell signals identified, positive sentiment" },
  { strategy: "Renew With Budget Adjustment",     desc: "Adjust pricing or scope to accommodate client budget constraints.", trigger: "Score 60–79, budget pressure, moderate risk" },
  { strategy: "Renew With Service Changes",       desc: "Restructure services to better align with evolving client goals.", trigger: "Misalignment signals, multiple change requests" },
  { strategy: "Retention Plan Required",          desc: "Client at risk. Proactive intervention with retention offer and AM escalation.", trigger: "Score 40–59, High Risk, open escalations" },
  { strategy: "Executive Intervention Required",  desc: "Critical account. Immediate executive engagement and retention offer.", trigger: "Score < 40, Critical Risk, multiple escalations" },
];

function RenewalStrategyCenter({ record }: { record: RenewalRecord }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Strategy Center" title="Renewal Strategy Center" desc="Recommended strategy based on account signals and renewal score." accentColor="#059669" />
      <div className="p-6 space-y-5">

        {/* Active strategy highlight */}
        {(() => {
          const s = strategyStyle(record.strategy);
          return (
            <div className="rounded-xl border p-5" style={{ background: s.bg, borderColor: s.border }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: s.color }}>Recommended Strategy for {record.client}</p>
              <p className="text-xl font-bold mb-2" style={{ color: s.color }}>{record.strategy}</p>
              <p className="text-sm text-slate-600">Renewal Probability: <span className="font-bold" style={{ color: s.color }}>{record.renewalProbability}%</span></p>
            </div>
          );
        })()}

        {/* Strategy Matrix */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STRATEGY_DEFINITIONS.map(({ strategy, desc, trigger }) => {
            const s = strategyStyle(strategy);
            const isActive = strategy === record.strategy;
            return (
              <div key={strategy} className="rounded-xl border p-4 transition-all"
                style={{
                  background: isActive ? s.bg : "#F8FAFC",
                  borderColor: isActive ? s.border : "#E2E8F0",
                  boxShadow: isActive ? `0 0 0 2px ${s.border}` : undefined
                }}>
                <Badge label={strategy} bg={s.bg} color={s.color} border={s.border} />
                {isActive && <span className="ml-2 text-[10px] font-bold uppercase text-slate-500">Active</span>}
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{desc}</p>
                <p className="mt-1.5 text-[10px] text-slate-400"><span className="font-bold">Trigger:</span> {trigger}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: RENEWAL TIMELINE
// ══════════════════════════════════════════════════════════════════════════════

const TIMELINE_MILESTONES = [
  { label: "90 Days Before",    color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", tasks: ["Auto-create renewal project", "Assign Account Manager", "Send renewal intro to client", "Begin performance review"] },
  { label: "60 Days Before",    color: "#0F766E", bg: "#F0FFFE", border: "#99F6E4", tasks: ["Complete performance summary", "Identify upgrade opportunities", "Prepare renewal proposal", "60-day reminder sent"] },
  { label: "30 Days Before",    color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", tasks: ["Review with client", "Present proposal or upgrade", "30-day critical reminder", "Engage Sales if applicable"] },
  { label: "Proposal Sent",     color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE", tasks: ["Proposal delivered to client", "Track open/engagement", "Follow up within 5 business days"] },
  { label: "Negotiation",       color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", tasks: ["Address client concerns", "Adjust terms if needed", "Sales support if required", "Document all changes"] },
  { label: "Contract Signed",   color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", tasks: ["Confirm contract executed", "Brief AM on new terms", "Notify Billing"] },
  { label: "Renewal Completed", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", tasks: ["Update billing schedule", "Confirm services active", "Record renewal outcome", "Schedule Q1 review"] },
] as const;

function RenewalTimeline({ record }: { record: RenewalRecord }) {
  // Determine active milestone based on status
  const statusToMilestone: Partial<Record<RenewalStatus, number>> = {
    "Not Started": 0, "Planning": 0, "Review Scheduled": 1,
    "Proposal In Progress": 2, "Negotiation": 3, "Pending Signature": 4,
    "Renewed": 6, "Lost": 6, "Cancelled": 6,
  };
  const activeIdx = statusToMilestone[record.status] ?? 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Timeline" title="Renewal Timeline" desc="Milestone-based lifecycle from 90 days out through completion." />
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {TIMELINE_MILESTONES.map((m, i) => {
            const isActive = i === activeIdx;
            const isPast = i < activeIdx;
            return (
              <div key={m.label} className="rounded-xl border p-3 space-y-2 transition-all"
                style={{
                  background: isActive ? m.bg : isPast ? "#F8FAFC" : "#FFFFFF",
                  borderColor: isActive ? m.border : "#E2E8F0",
                  boxShadow: isActive ? `0 0 0 2px ${m.border}` : undefined,
                  opacity: isPast ? 0.7 : 1,
                }}>
                <div className="rounded-lg px-2 py-1.5 text-center"
                  style={{ background: isActive ? m.color : isPast ? "#94A3B8" : "#E2E8F0" }}>
                  <p className="text-[10px] font-bold text-white leading-tight">{m.label}</p>
                </div>
                <div className="space-y-1">
                  {m.tasks.map((t) => (
                    <div key={t} className="flex items-start gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                        style={{ background: isActive ? m.color : isPast ? "#10B981" : "#CBD5E1" }} />
                      <p className="text-[10px] text-slate-600 leading-tight">{t}</p>
                    </div>
                  ))}
                </div>
                {isActive && (
                  <div className="rounded-full px-2 py-0.5 text-center" style={{ background: m.color }}>
                    <p className="text-[10px] font-bold text-white">Current Stage</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: RENEWAL REVIEW CENTER
// ══════════════════════════════════════════════════════════════════════════════

function RenewalReviewCenter({ record }: { record: RenewalRecord }) {
  const reviewCategories = [
    {
      title: "Performance Summary",
      color: "#1D4ED8",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      items: [
        { label: "Renewal Score", value: `${record.score.overall} / 100` },
        { label: "Renewal Probability", value: `${record.renewalProbability}%` },
        { label: "Risk Level", valueEl: <RiskBadge risk={record.risk} /> },
        { label: "Strategy", valueEl: <StrategyBadge strategy={record.strategy} /> },
      ],
    },
    {
      title: "Client Health Summary",
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      items: [
        { label: "Client Health Score", value: `${record.score.clientHealth}` },
        { label: "Open Issues", value: record.openIssues },
        { label: "Open Escalations", value: record.openEscalations },
        { label: "Recent Change Requests", value: record.recentChangeRequests },
      ],
    },
    {
      title: "Communications Summary",
      color: "#0F766E",
      bg: "#F0FFFE",
      border: "#99F6E4",
      items: [
        { label: "Communication Score", value: `${record.score.communicationHealth}` },
        { label: "Days Since Last Contact", value: record.lastContactDays },
        { label: "Call Sentiment", valueEl: <Badge label={record.callSentiment} {...sentimentStyle(record.callSentiment)} /> },
        { label: "Engagement Score", value: `${record.score.clientEngagement}` },
      ],
    },
    {
      title: "Call Intelligence Summary",
      color: "#6D28D9",
      bg: "#F5F3FF",
      border: "#DDD6FE",
      items: [
        { label: "Call Intelligence Score", value: `${record.score.callIntelligence}` },
        { label: "Sentiment Trend", value: record.callSentiment },
        { label: "Renewal Signals Detected", value: record.riskFactors.length > 0 ? "Risk signals present" : "No risk signals" },
        { label: "Recommended Actions", value: `${record.recommendedActions.length} actions` },
      ],
    },
    {
      title: "Reporting Summary",
      color: "#B45309",
      bg: "#FFFBEB",
      border: "#FDE68A",
      items: [
        { label: "Reporting Score", value: `${record.score.reportingHealth}` },
        { label: "Reporting Status", value: record.reportingStatus },
        { label: "Contract", value: record.contract },
        { label: "Client Since", value: record.clientSince },
      ],
    },
    {
      title: "Billing Summary",
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA",
      items: [
        { label: "Billing Health Score", value: `${record.score.billingHealth}` },
        { label: "Open Invoices", value: record.openInvoices },
        { label: "MRR", value: `$${record.mrr.toLocaleString()}/mo` },
        { label: "ARR", value: `$${record.arr.toLocaleString()}/yr` },
      ],
    },
    {
      title: "Project Summary",
      color: "#EA580C",
      bg: "#FFF7ED",
      border: "#FED7AA",
      items: [
        { label: "Project Health Score", value: `${record.score.projectHealth}` },
        { label: "Project Status", value: record.projectStatus },
        { label: "Delayed Deliverables", value: record.delayedDeliverables },
        { label: "Services Active", value: record.services.length },
      ],
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Review Center" title="Renewal Review Center" desc="Cross-signal summary drawn from all department inputs." accentColor="#6D28D9" />
      <div className="p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviewCategories.map((cat) => (
            <div key={cat.title} className="rounded-xl border p-4 space-y-3" style={{ background: cat.bg, borderColor: cat.border }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: cat.color }}>{cat.title}</p>
              <div className="space-y-2">
                {cat.items.map(({ label, value, valueEl }) => (
                  <div key={label} className="flex items-center justify-between gap-2 py-1 border-b border-white/60 last:border-0">
                    <span className="text-xs text-slate-500">{label}</span>
                    {valueEl ?? <span className="text-xs font-semibold text-slate-800">{value}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: AI RENEWAL INSIGHTS
// ══════════════════════════════════════════════════════════════════════════════

function AIRenewalInsights({ record }: { record: RenewalRecord }) {
  const insightPanels = [
    {
      title: "Renewal Probability",
      value: `${record.renewalProbability}%`,
      color: scoreColor(record.renewalProbability),
      icon: "Probability",
      desc: record.renewalProbability >= 80
        ? "Strong renewal likelihood based on health, billing, and engagement signals."
        : record.renewalProbability >= 60
        ? "Moderate likelihood. Address risk factors to improve outcome."
        : "Below-average renewal probability. Immediate intervention recommended.",
    },
    {
      title: "Risk Factors",
      color: "#DC2626",
      icon: "Risk",
      list: record.riskFactors.length > 0 ? record.riskFactors : ["No active risk factors identified"],
    },
    {
      title: "Growth Opportunities",
      color: "#059669",
      icon: "Growth",
      list: record.growthOpportunities.length > 0 ? record.growthOpportunities : ["No immediate expansion signals — retain at current scope"],
    },
    {
      title: "Client Concerns",
      color: "#D97706",
      icon: "Concerns",
      list: record.clientConcerns.length > 0 ? record.clientConcerns : ["No client concerns flagged in current signals"],
    },
    {
      title: "Recommended Actions",
      color: "#1D4ED8",
      icon: "Actions",
      list: record.recommendedActions,
    },
    {
      title: "Suggested Services",
      color: "#6D28D9",
      icon: "Services",
      list: record.suggestedServices.length > 0 ? record.suggestedServices : ["No service additions suggested — renew current scope"],
    },
    {
      title: "Suggested Contract Terms",
      color: "#0F766E",
      icon: "Terms",
      list: record.suggestedTerms.length > 0 ? record.suggestedTerms : ["N/A — Account lost or cancelled"],
    },
  ] as const;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="AI Renewal Insights" title="AI Renewal Insights" desc="Signal-driven analysis and recommended actions for this renewal." accentColor="#6D28D9" />
      <div className="p-6 space-y-4">

        {/* Probability hero */}
        <div className="flex items-center gap-5 rounded-xl border p-5 bg-slate-50 border-slate-200">
          <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 flex-shrink-0"
            style={{ borderColor: scoreColor(record.renewalProbability), background: "#fff" }}>
            <span className="text-3xl font-extrabold" style={{ color: scoreColor(record.renewalProbability) }}>{record.renewalProbability}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">Probability</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Renewal Probability — {record.client}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-lg">
              {record.renewalProbability >= 80
                ? "Strong renewal likelihood based on health, billing, and engagement signals. Recommend proactive renewal conversation."
                : record.renewalProbability >= 60
                ? "Moderate likelihood. Address identified risk factors and present tailored renewal proposal to strengthen outcome."
                : "Below-average renewal probability. Immediate intervention recommended. Escalate to senior AM and leadership review."}
            </p>
          </div>
        </div>

        {/* Insight grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insightPanels.slice(1).map((panel) => (
            <div key={panel.title} className="rounded-xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: panel.color }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: panel.color }}>{panel.title}</p>
              </div>
              <ul className="space-y-1.5">
                {"list" in panel && panel.list.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-slate-300 mt-0.5 flex-shrink-0">—</span>
                    <span className="text-xs text-slate-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: RENEWAL PROPOSAL PREVIEW
// ══════════════════════════════════════════════════════════════════════════════

function RenewalProposalPreview({ record }: { record: RenewalRecord }) {
  const diffPositive = record.revenueDifference > 0;
  const diffZero = record.revenueDifference === 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Proposal Preview" title="Renewal Proposal Preview" desc="Comparison of current and recommended packages with expected impact." accentColor="#059669" />
      <div className="p-6 space-y-5">

        {/* Package comparison */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Package</p>
            <p className="text-base font-bold text-slate-800">{record.currentPackage}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">MRR</span>
                <span className="font-bold text-slate-800">${record.mrr.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">ARR</span>
                <span className="font-bold text-slate-800">${record.arr.toLocaleString()}/yr</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Recommended Package</p>
            <p className="text-base font-bold text-slate-800">{record.recommendedPackage}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">New MRR</span>
                <span className="font-bold text-slate-800">${(record.mrr + record.revenueDifference / 12).toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">New ARR</span>
                <span className="font-bold text-slate-800">${(record.arr + record.revenueDifference).toLocaleString()}/yr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue difference */}
        <div className="rounded-xl border p-4 flex items-center justify-between gap-4"
          style={{
            background: diffZero ? "#F8FAFC" : diffPositive ? "#ECFDF5" : "#FEF2F2",
            borderColor: diffZero ? "#E2E8F0" : diffPositive ? "#A7F3D0" : "#FECACA",
          }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Revenue Difference</p>
            <p className="text-2xl font-extrabold mt-0.5"
              style={{ color: diffZero ? "#64748B" : diffPositive ? "#059669" : "#DC2626" }}>
              {diffZero ? "No Change" : `${diffPositive ? "+" : "-"}${fmt$(Math.abs(record.revenueDifference))}/yr`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Contract Terms</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{record.contractTerms}</p>
          </div>
        </div>

        {/* Service changes */}
        {record.serviceChanges.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Service Changes</p>
            <div className="flex flex-wrap gap-2">
              {record.serviceChanges.map((sc) => (
                <span key={sc} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-0.5 text-xs font-semibold text-violet-700">{sc}</span>
              ))}
            </div>
          </div>
        )}

        {/* Expected impact */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Expected Impact</p>
          <p className="text-sm text-slate-700">{record.expectedImpact}</p>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: AT-RISK ACCOUNTS
// ══════════════════════════════════════════════════════════════════════════════

function AtRiskAccounts() {
  const atRisk = getAtRiskRenewals().sort((a, b) => a.score.overall - b.score.overall);

  const interventionStatus = (r: RenewalRecord) => {
    if (r.status === "Negotiation") return { label: "In Negotiation", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" };
    if (r.status === "Planning") return { label: "Planning", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" };
    if (r.status === "Review Scheduled") return { label: "Review Scheduled", color: "#0F766E", bg: "#F0FFFE", border: "#99F6E4" };
    if (r.status === "Lost" || r.status === "Cancelled") return { label: "Lost/Cancelled", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" };
    return { label: "Not Started", color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" };
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="At-Risk Accounts" title="At-Risk Accounts" desc="High Risk and Critical accounts requiring immediate attention." accentColor="#DC2626" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Client", "Risk Level", "Reason", "Health Score", "Revenue At Risk", "Assigned Owner", "Intervention Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {atRisk.map((r) => {
              const intv = interventionStatus(r);
              const primaryReason = r.riskFactors[0] ?? "Multiple risk signals";
              return (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{r.client}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><RiskBadge risk={r.risk} /></td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-[220px]">{primaryReason}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-bold" style={{ color: scoreColor(r.score.overall) }}>{r.score.overall}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: "#DC2626" }}>{fmt$(r.arr)}/yr</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.accountManager}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge label={intv.label} bg={intv.bg} color={intv.color} border={intv.border} />
                  </td>
                </tr>
              );
            })}
            {atRisk.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No at-risk accounts.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">{atRisk.length} at-risk accounts</p>
        <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>
          Total Revenue At Risk: {fmt$(atRisk.reduce((s, r) => s + r.arr, 0))}/yr
        </p>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: EXECUTIVE RENEWALS DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function ExecutiveRenewalsDashboard() {
  const rev = computeRevenueSummary();
  const atRisk = getAtRiskRenewals();
  const active = getActiveRenewals();

  const largestAccounts = [...active]
    .sort((a, b) => b.arr - a.arr)
    .slice(0, 5);

  const retentionOpportunities = active
    .filter((r) => r.strategy === "Renew With Upgrade" || r.strategy === "Renew With Service Changes")
    .slice(0, 5);

  const deptIssues = [
    { dept: "Account Management", issue: "2 accounts with AM turnover impact", impact: "High", affected: atRisk.filter((r) => r.riskFactors.some((f) => f.toLowerCase().includes("am"))).length },
    { dept: "Operations / Delivery", issue: "Delayed deliverables across 6 accounts", impact: "Moderate", affected: active.filter((r) => r.delayedDeliverables > 0).length },
    { dept: "Billing", issue: "Open invoices flagged in 4 renewal accounts", impact: "Moderate", affected: active.filter((r) => r.openInvoices > 0).length },
    { dept: "Communications", issue: "Communication health below 50 in 3 accounts", impact: "High", affected: active.filter((r) => r.score.communicationHealth < 50).length },
    { dept: "Reporting", issue: "Reports overdue for 2 at-risk accounts", impact: "Low", affected: active.filter((r) => r.reportingStatus === "Overdue").length },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Executive Dashboard" title="Executive Renewals Dashboard" desc="Portfolio-level view for leadership and executive teams." accentColor="#1D4ED8" />
      <div className="p-6 space-y-6">

        {/* Revenue KPIs */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Revenue Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Revenue At Risk</p>
              <p className="text-2xl font-extrabold mt-1" style={{ color: "#DC2626" }}>{fmt$(rev.atRisk)}</p>
              <p className="text-xs text-slate-400 mt-0.5">per year</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Renewal Forecast</p>
              <p className="text-2xl font-extrabold mt-1" style={{ color: "#059669" }}>{fmt$(rev.forecast)}</p>
              <p className="text-xs text-slate-400 mt-0.5">probability-weighted</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Revenue Renewed</p>
              <p className="text-2xl font-extrabold mt-1" style={{ color: "#0F766E" }}>{fmt$(rev.renewed)}</p>
              <p className="text-xs text-slate-400 mt-0.5">confirmed this cycle</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Revenue Lost</p>
              <p className="text-2xl font-extrabold mt-1" style={{ color: "#475569" }}>{fmt$(rev.lost)}</p>
              <p className="text-xs text-slate-400 mt-0.5">lost or cancelled</p>
            </div>
          </div>
        </div>

        {/* Largest accounts up for renewal */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Largest Accounts Up For Renewal</p>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Client", "ARR", "Score", "Risk", "Status", "AM"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {largestAccounts.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">{r.client}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 whitespace-nowrap">{fmt$(r.arr)}/yr</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="text-xs font-bold" style={{ color: scoreColor(r.score.overall) }}>{r.score.overall}</span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><RiskBadge risk={r.risk} /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{r.accountManager}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* At-Risk summary */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">At-Risk Clients</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {atRisk.slice(0, 6).map((r) => {
              const s = riskStyle(r.risk);
              return (
                <div key={r.id} className="rounded-xl border p-4 flex items-center justify-between gap-4"
                  style={{ background: s.bg, borderColor: s.border }}>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{r.client}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.accountManager} · {r.renewalDate}</p>
                    <p className="text-xs text-slate-600 mt-1">{r.riskFactors[0] ?? "Multiple risk signals"}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <RiskBadge risk={r.risk} />
                    <p className="text-sm font-bold mt-1.5" style={{ color: "#DC2626" }}>{fmt$(r.arr)}/yr</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Retention opportunities */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Retention Opportunities</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {retentionOpportunities.map((r) => (
              <div key={r.id} className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-2">
                <p className="text-sm font-bold text-slate-900">{r.client}</p>
                <StrategyBadge strategy={r.strategy} />
                <p className="text-xs text-slate-600 mt-1">{r.growthOpportunities[0] ?? "Service restructure opportunity"}</p>
                <p className="text-xs font-semibold text-blue-700">+{fmt$(Math.abs(r.revenueDifference))}/yr potential</p>
              </div>
            ))}
          </div>
        </div>

        {/* Department issues */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Department Issues Affecting Renewals</p>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Department", "Issue", "Impact", "Accounts Affected"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptIssues.map((d) => (
                  <tr key={d.dept} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{d.dept}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{d.issue}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 border ${
                        d.impact === "High" ? "bg-red-50 text-red-700 border-red-200" :
                        d.impact === "Moderate" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>{d.impact}</span>
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-700 whitespace-nowrap">{d.affected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT DETAIL DRAWER
// ══════════════════════════════════════════════════════════════════════════════

type DetailTab = "profile" | "score" | "strategy" | "timeline" | "review" | "ai" | "proposal";

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: "profile",  label: "Profile" },
  { id: "score",    label: "Score Model" },
  { id: "strategy", label: "Strategy" },
  { id: "timeline", label: "Timeline" },
  { id: "review",   label: "Review Center" },
  { id: "ai",       label: "AI Insights" },
  { id: "proposal", label: "Proposal" },
];

function ClientDetailPanel({ record, onClose }: { record: RenewalRecord; onClose: () => void }) {
  const [tab, setTab] = useState<DetailTab>("profile");

  return (
    <div className="space-y-4">
      {/* Panel header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Client Detail</p>
          <h2 className="text-xl font-bold text-slate-900">{record.client}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <RiskBadge risk={record.risk} />
            <StatusBadge status={record.status} />
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">
          Back to Table
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {DETAIL_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-t-lg border border-b-0 px-4 py-2 text-xs font-semibold transition-colors ${
              tab === t.id
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "profile"  && <ClientRenewalProfile record={record} />}
        {tab === "score"    && <RenewalScoreModel record={record} />}
        {tab === "strategy" && <RenewalStrategyCenter record={record} />}
        {tab === "timeline" && <RenewalTimeline record={record} />}
        {tab === "review"   && <RenewalReviewCenter record={record} />}
        {tab === "ai"       && <AIRenewalInsights record={record} />}
        {tab === "proposal" && <RenewalProposalPreview record={record} />}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TOP-LEVEL TABS
// ══════════════════════════════════════════════════════════════════════════════

type MainTab = "dashboard" | "table" | "at-risk" | "executive";

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: "dashboard",  label: "Dashboard" },
  { id: "table",      label: "Renewal Table" },
  { id: "at-risk",    label: "At-Risk Accounts" },
  { id: "executive",  label: "Executive Dashboard" },
];

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function RenewalsPage() {
  const [mainTab, setMainTab] = useState<MainTab>("dashboard");
  const [selectedRecord, setSelectedRecord] = useState<RenewalRecord | null>(null);

  const rev = computeRevenueSummary();

  const handleSelect = (r: RenewalRecord) => {
    setSelectedRecord(r);
  };

  const handleBack = () => {
    setSelectedRecord(null);
  };

  // If a record is selected, show the detail panel
  if (selectedRecord) {
    return (
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
          <h1 className="text-2xl font-bold text-slate-900">Renewals</h1>
        </div>
        <ClientDetailPanel record={selectedRecord} onClose={handleBack} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
          <h1 className="text-2xl font-bold text-slate-900">Renewals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Revenue retention engine — signal-driven renewal management across all client accounts.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center shadow-sm">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Portfolio ARR</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{fmt$(rev.total)}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#DC2626" }}>At Risk</p>
            <p className="text-lg font-extrabold mt-0.5" style={{ color: "#DC2626" }}>{fmt$(rev.atRisk)}</p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#059669" }}>Forecast</p>
            <p className="text-lg font-extrabold mt-0.5" style={{ color: "#059669" }}>{fmt$(rev.forecast)}</p>
          </div>
        </div>
      </div>

      {/* Main tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {MAIN_TABS.map((t) => (
          <button key={t.id} onClick={() => setMainTab(t.id)}
            className={`rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-semibold transition-colors ${
              mainTab === t.id
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {mainTab === "dashboard"  && <RenewalsDashboard />}
        {mainTab === "table"      && <RenewalTable onSelect={handleSelect} />}
        {mainTab === "at-risk"    && <AtRiskAccounts />}
        {mainTab === "executive"  && <ExecutiveRenewalsDashboard />}
      </div>
    </div>
  );
}
