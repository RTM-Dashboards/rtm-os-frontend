"use client";

import React, { useState, useMemo } from "react";
import {
  CANCELLATION_REQUESTS,
  getOpenRequests,
  getSavedClients,
  getCancelledClients,
  getRevenueAtRisk,
  getARRAtRisk,
  getCancelledRevenue,
  getRetentionSuccessRate,
  getPendingSaveAttempts,
  getReasonBreakdown,
  type CancellationRequest,
  type CancellationStatus,
  type CancellationReason,
  type RiskLevel,
  type RetentionStrategy,
  type SaveAttemptStep,
} from "@/lib/account-management/cancellations-data";

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

function riskStyle(level: RiskLevel) {
  switch (level) {
    case "Low":      return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Medium":   return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "High":     return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Critical": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
  }
}

function statusStyle(status: CancellationStatus) {
  switch (status) {
    case "Request Received":           return { bg: "#F8FAFC", color: "#64748B", border: "#CBD5E1" };
    case "Under Review":               return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "Retention Attempt":          return { bg: "#F0FFFE", color: "#0F766E", border: "#99F6E4" };
    case "Executive Review":           return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Cancellation Approved":      return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Cancellation Withdrawn":     return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Converted To Downgrade":     return { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" };
    case "Converted To Renewal":       return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Converted To Change Request":return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "Moved To Offboarding":       return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
  }
}

function retentionStatusStyle(status: string) {
  switch (status) {
    case "Not Started":      return { bg: "#F8FAFC", color: "#64748B", border: "#CBD5E1" };
    case "In Progress":      return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "Client Contacted": return { bg: "#F0FFFE", color: "#0F766E", border: "#99F6E4" };
    case "Decision Pending": return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Saved":            return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Lost":             return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    default:                 return { bg: "#F8FAFC", color: "#64748B", border: "#CBD5E1" };
  }
}

function strategyStyle(strategy: RetentionStrategy) {
  switch (strategy) {
    case "Budget Adjustment":     return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Service Reduction":     return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Service Realignment":   return { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" };
    case "Temporary Pause":       return { bg: "#F0FFFE", color: "#0F766E", border: "#99F6E4" };
    case "Additional Support":    return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "Executive Escalation":  return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Custom Retention Plan": return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
  }
}

function reasonStyle(reason: CancellationReason) {
  switch (reason) {
    case "Budget":            return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Performance":       return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Service Quality":   return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Communication":     return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "Internal Staffing": return { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" };
    case "Business Closure":  return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
    case "Competitor":        return { bg: "#FFF7ED", color: "#9A3412", border: "#FED7AA" };
    case "No Longer Needed":  return { bg: "#F0FFFE", color: "#0F766E", border: "#99F6E4" };
    default:                  return { bg: "#F8FAFC", color: "#64748B", border: "#CBD5E1" };
  }
}

const SAVE_ATTEMPT_STEPS: (SaveAttemptStep | string)[] = [
  "Cancellation Request",
  "AM Review",
  "Retention Plan",
  "Client Discussion",
  "Decision",
  "Saved",
  "Cancelled",
];

// ══════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════════════

function Badge({
  label,
  bg,
  color,
  border,
  dot,
}: {
  label: string;
  bg: string;
  color: string;
  border: string;
  dot?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border whitespace-nowrap"
      style={{ background: bg, color, borderColor: border }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: dot }}
        />
      )}
      {label}
    </span>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const s = riskStyle(level);
  const dot =
    level === "Critical"
      ? "#DC2626"
      : level === "High"
      ? "#EA580C"
      : level === "Medium"
      ? "#D97706"
      : "#059669";
  return <Badge label={level} bg={s.bg} color={s.color} border={s.border} dot={dot} />;
}

function StatusBadge({ status }: { status: CancellationStatus }) {
  const s = statusStyle(status);
  return <Badge label={status} bg={s.bg} color={s.color} border={s.border} />;
}

function RetentionStatusBadge({ status }: { status: string }) {
  const s = retentionStatusStyle(status);
  return <Badge label={status} bg={s.bg} color={s.color} border={s.border} />;
}

function ReasonBadge({ reason }: { reason: CancellationReason }) {
  const s = reasonStyle(reason);
  return <Badge label={reason} bg={s.bg} color={s.color} border={s.border} />;
}

function StrategyBadge({ strategy }: { strategy: RetentionStrategy }) {
  const s = strategyStyle(strategy);
  return <Badge label={strategy} bg={s.bg} color={s.color} border={s.border} />;
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const c = scoreColor(score);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-bold" style={{ color: c }}>
          {score}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: c }}
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
  bg = "bg-white",
  borderColor = "border-slate-200",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  bg?: string;
  borderColor?: string;
}) {
  return (
    <div className={`rounded-xl border ${borderColor} ${bg} p-5 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold" style={{ color: accent ?? "#0F172A" }}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
  accentColor = "#1B4FD8",
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  accentColor?: string;
}) {
  return (
    <div className="border-b border-slate-100 px-6 py-4">
      {eyebrow && (
        <p
          className="text-xs font-bold uppercase tracking-widest mb-0.5"
          style={{ color: accentColor }}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: CANCELLATIONS DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function CancellationsDashboard() {
  const open = getOpenRequests();
  const saved = getSavedClients();
  const cancelled = getCancelledClients();
  const mrrAtRisk = getRevenueAtRisk();
  const pendingSave = getPendingSaveAttempts();
  const successRate = getRetentionSuccessRate();
  const cancelledRevenue = getCancelledRevenue();
  const reasonBreakdown = getReasonBreakdown();

  const topReasons = Object.entries(reasonBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          label="Open Cancellation Requests"
          value={open.length}
          sub="active cases"
          accent="#1D4ED8"
          borderColor="border-blue-200"
          bg="bg-blue-50"
        />
        <KpiCard
          label="Revenue At Risk"
          value={fmt$(mrrAtRisk)}
          sub="monthly recurring"
          accent="#DC2626"
          borderColor="border-red-200"
          bg="bg-red-50"
        />
        <KpiCard
          label="Retention Success Rate"
          value={`${successRate}%`}
          sub="saved vs total decided"
          accent="#059669"
          borderColor="border-emerald-200"
          bg="bg-emerald-50"
        />
        <KpiCard
          label="Clients Saved"
          value={saved.length}
          sub="cancellations withdrawn"
          accent="#0F766E"
        />
        <KpiCard
          label="Pending Save Attempts"
          value={pendingSave.length}
          sub="active retention work"
          accent="#B45309"
          borderColor="border-amber-200"
          bg="bg-amber-50"
        />
        <KpiCard
          label="Cancelled Revenue"
          value={fmt$(cancelledRevenue)}
          sub="monthly — confirmed lost"
          accent="#475569"
          borderColor="border-slate-300"
          bg="bg-slate-50"
        />
      </div>

      {/* Revenue At Risk Alert */}
      {mrrAtRisk > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">
                {fmt$(mrrAtRisk)}/mo in revenue is at risk from {open.length} open cancellation{open.length !== 1 ? "s" : ""}.
                {fmt$(getARRAtRisk())}/yr total ARR exposure.
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {open.filter((r) => r.riskLevel === "Critical" || r.riskLevel === "High").length} accounts rated High or Critical risk require immediate retention action.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout: reason breakdown + status summary */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Cancellation Reason Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            eyebrow="Reason Analysis"
            title="Top Cancellation Reasons"
            desc="Distribution by primary cancellation driver."
          />
          <div className="p-5 space-y-3">
            {topReasons.map(([reason, count]) => {
              const pct = Math.round((count / CANCELLATION_REQUESTS.length) * 100);
              const s = reasonStyle(reason as CancellationReason);
              return (
                <div key={reason} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">{reason}</span>
                    <span className="text-xs font-bold" style={{ color: s.color }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Summary */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            eyebrow="Status Overview"
            title="Pipeline Status"
            desc="Cancellation requests by current stage."
          />
          <div className="p-5 space-y-2">
            {(
              [
                "Request Received",
                "Under Review",
                "Retention Attempt",
                "Executive Review",
                "Cancellation Approved",
                "Cancellation Withdrawn",
                "Converted To Change Request",
                "Moved To Offboarding",
              ] as CancellationStatus[]
            ).map((status) => {
              const count = CANCELLATION_REQUESTS.filter((r) => r.status === status).length;
              if (count === 0) return null;
              const s = statusStyle(status);
              return (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-lg border px-4 py-2.5"
                  style={{ background: s.bg, borderColor: s.border }}
                >
                  <span className="text-sm font-semibold" style={{ color: s.color }}>
                    {status}
                  </span>
                  <span
                    className="text-sm font-bold rounded-full px-2.5 py-0.5 border"
                    style={{ background: s.bg, color: s.color, borderColor: s.border }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: CANCELLATION TABLE
// ══════════════════════════════════════════════════════════════════════════════

function CancellationTable({ onSelect }: { onSelect: (r: CancellationRequest) => void }) {
  const [statusFilter, setStatusFilter] = useState<CancellationStatus | "All">("All");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      CANCELLATION_REQUESTS.filter((r) => {
        if (statusFilter !== "All" && r.status !== statusFilter) return false;
        if (riskFilter !== "All" && r.riskLevel !== riskFilter) return false;
        if (
          search &&
          !r.client.toLowerCase().includes(search.toLowerCase()) &&
          !r.accountManager.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [statusFilter, riskFilter, search]
  );

  const ALL_STATUSES: (CancellationStatus | "All")[] = [
    "All",
    "Request Received",
    "Under Review",
    "Retention Attempt",
    "Executive Review",
    "Cancellation Approved",
    "Cancellation Withdrawn",
    "Converted To Change Request",
    "Moved To Offboarding",
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        eyebrow="Cancellation Pipeline"
        title="Cancellation Requests"
        desc="All cancellation requests with risk level, retention status, and revenue exposure."
      />

      {/* Filters */}
      <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <input
          placeholder="Search client or AM..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-56 outline-none focus:ring-2 focus:ring-blue-100"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CancellationStatus | "All")}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : s}
            </option>
          ))}
        </select>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "All")}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none"
        >
          {(["All", "Low", "Medium", "High", "Critical"] as const).map((r) => (
            <option key={r} value={r}>
              {r === "All" ? "All Risk Levels" : r}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} of {CANCELLATION_REQUESTS.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Client",
                "Account Manager",
                "MRR",
                "ARR",
                "Reason",
                "Health Score",
                "Retention Status",
                "Revenue At Risk",
                "Status",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                onClick={() => onSelect(r)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="font-semibold text-slate-900">{r.client}</p>
                  <p className="text-xs text-slate-400">{r.requestDate}</p>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.accountManager}</td>
                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                  ${r.mrr.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                  ${r.arr.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ReasonBadge reason={r.reason} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${r.healthScore}%`,
                          background: scoreColor(r.healthScore),
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: scoreColor(r.healthScore) }}
                    >
                      {r.healthScore}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <RetentionStatusBadge status={r.retentionStatus} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold" style={{ color: "#DC2626" }}>
                  {fmt$(r.arr)}/yr
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(r);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  No cancellation requests match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: RETENTION CENTER
// ══════════════════════════════════════════════════════════════════════════════

function RetentionCenter({ onSelect }: { onSelect: (r: CancellationRequest) => void }) {
  const withPlans = CANCELLATION_REQUESTS.filter((r) => r.retentionPlan !== null);

  const STRATEGY_DEFINITIONS: {
    strategy: RetentionStrategy;
    desc: string;
    trigger: string;
  }[] = [
    {
      strategy: "Budget Adjustment",
      desc: "Reduce price or scope to align with client budget constraints while preserving the relationship.",
      trigger: "Client cites cost as the primary cancellation reason.",
    },
    {
      strategy: "Service Reduction",
      desc: "Downgrade to a smaller service package, removing non-essential services to hit a lower price point.",
      trigger: "Client wants to continue but cannot sustain full scope.",
    },
    {
      strategy: "Service Realignment",
      desc: "Restructure the service mix to better match evolving client goals and market conditions.",
      trigger: "Performance concern or misalignment between services delivered and client needs.",
    },
    {
      strategy: "Temporary Pause",
      desc: "Suspend all or most services temporarily at a nominal maintenance fee. Preserve relationship for reactivation.",
      trigger: "Business slowdown, funding gap, or seasonal budget freeze.",
    },
    {
      strategy: "Additional Support",
      desc: "Assign dedicated resources, increase communication cadence, and resolve open issues to repair trust.",
      trigger: "Communication breakdown, onboarding failure, or service quality concern.",
    },
    {
      strategy: "Executive Escalation",
      desc: "Engage director or executive leadership directly. Present performance audit and structured remediation plan.",
      trigger: "Critical health score, multiple escalations, or high-value account at risk.",
    },
    {
      strategy: "Custom Retention Plan",
      desc: "Bespoke combination of strategies tailored to the specific client situation.",
      trigger: "Complex or non-standard cancellation driver requiring a custom approach.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Active Retention Plans */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          eyebrow="Retention Center"
          title="Active Retention Plans"
          desc="All clients with a formal retention plan in place."
          accentColor="#059669"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Client",
                  "Reason",
                  "Risk Level",
                  "Revenue At Risk",
                  "Assigned Owner",
                  "Retention Plan",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withPlans.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => onSelect(r)}
                >
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    {r.client}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ReasonBadge reason={r.reason} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RiskBadge level={r.riskLevel} />
                  </td>
                  <td
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                    style={{ color: "#DC2626" }}
                  >
                    {fmt$(r.arr)}/yr
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {r.retentionPlan!.assignedOwner}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StrategyBadge strategy={r.retentionPlan!.strategy} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RetentionStatusBadge status={r.retentionPlan!.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(r);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-6 py-2.5 text-xs text-slate-400">
          {withPlans.length} clients with active retention plans
        </div>
      </section>

      {/* Retention Strategy Matrix */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          eyebrow="Strategy Matrix"
          title="Retention Strategies"
          desc="Available strategies and their optimal deployment conditions."
          accentColor="#059669"
        />
        <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STRATEGY_DEFINITIONS.map(({ strategy, desc, trigger }) => {
            const s = strategyStyle(strategy);
            const usageCount = CANCELLATION_REQUESTS.filter(
              (r) => r.retentionPlan?.strategy === strategy
            ).length;
            return (
              <div
                key={strategy}
                className="rounded-xl border p-4 space-y-2"
                style={{ background: s.bg, borderColor: s.border }}
              >
                <div className="flex items-start justify-between gap-2">
                  <StrategyBadge strategy={strategy} />
                  {usageCount > 0 && (
                    <span
                      className="text-[10px] font-bold rounded-full px-2 py-0.5 border"
                      style={{ background: s.bg, color: s.color, borderColor: s.border }}
                    >
                      {usageCount} active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                <p className="text-[10px] text-slate-400">
                  <span className="font-bold">Trigger: </span>
                  {trigger}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: CLIENT RISK PROFILE
// ══════════════════════════════════════════════════════════════════════════════

function ClientRiskProfilePanel({ record }: { record: CancellationRequest }) {
  const rp = record.riskProfile;

  const healthDimensions = [
    { label: "Health Score", value: rp.healthScore },
    { label: "Project Health", value: rp.projectHealth },
    { label: "Billing Health", value: rp.billingHealth },
    { label: "Communication Health", value: rp.communicationHealth },
    { label: "Reporting Health", value: rp.reportingHealth },
  ];

  const metricItems = [
    {
      label: "Open Escalations",
      value: rp.openEscalations,
      accent: rp.openEscalations > 2 ? "#DC2626" : rp.openEscalations > 0 ? "#EA580C" : "#059669",
    },
    {
      label: "Renewal Risk",
      valueEl: <RiskBadge level={rp.renewalRisk} />,
    },
    {
      label: "Expansion Potential",
      value: rp.expansionPotential,
      accent:
        rp.expansionPotential === "High"
          ? "#059669"
          : rp.expansionPotential === "None"
          ? "#94A3B8"
          : "#1D4ED8",
    },
    {
      label: "Industry",
      value: record.industry,
    },
    {
      label: "Client Since",
      value: record.clientSince,
    },
    {
      label: "Services Active",
      value: record.services.length,
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        eyebrow="Client Risk Profile"
        title={`Risk Profile — ${record.client}`}
        desc="Health dimensions, escalations, and renewal indicators."
        accentColor="#EA580C"
      />
      <div className="p-6 space-y-6">
        {/* Header badges */}
        <div className="flex flex-wrap gap-3">
          <RiskBadge level={record.riskLevel} />
          <StatusBadge status={record.status} />
          <RetentionStatusBadge status={record.retentionStatus} />
        </div>

        {/* Services */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Active Services
          </p>
          <div className="flex flex-wrap gap-2">
            {record.services.map((s) => (
              <span
                key={s}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Health score bars */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Health Dimensions
          </p>
          <div className="space-y-2.5">
            {healthDimensions.map(({ label, value }) => (
              <ScoreBar key={label} score={value} label={label} />
            ))}
          </div>
        </div>

        {/* Metric grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0 divide-y divide-slate-100 sm:divide-y-0">
          {metricItems.map(({ label, value, accent, valueEl }) => (
            <div
              key={label}
              className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
            >
              <span className="text-xs text-slate-500">{label}</span>
              {valueEl ?? (
                <span className="text-xs font-semibold" style={{ color: accent ?? "#0F172A" }}>
                  {value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: SAVE ATTEMPT WORKFLOW
// ══════════════════════════════════════════════════════════════════════════════

function SaveAttemptWorkflow({ record }: { record: CancellationRequest }) {
  const completedSteps = record.activityTimeline.map((e) => e.step);

  const isSaved =
    record.retentionStatus === "Saved" ||
    record.status === "Cancellation Withdrawn" ||
    record.status === "Converted To Change Request" ||
    record.status === "Converted To Renewal";

  const isCancelled =
    record.retentionStatus === "Lost" ||
    record.status === "Cancellation Approved" ||
    record.status === "Moved To Offboarding";

  const stepsToShow = isSaved
    ? ["Cancellation Request", "AM Review", "Retention Plan", "Client Discussion", "Decision", "Saved"]
    : isCancelled
    ? ["Cancellation Request", "AM Review", "Retention Plan", "Client Discussion", "Decision", "Cancelled"]
    : ["Cancellation Request", "AM Review", "Retention Plan", "Client Discussion", "Decision"];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        eyebrow="Save Attempt Workflow"
        title={`Save Attempt — ${record.client}`}
        desc="Step-by-step cancellation response and retention workflow."
        accentColor="#0F766E"
      />
      <div className="p-6">
        {/* Step flow */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
          {stepsToShow.map((step, idx) => {
            const isComplete = completedSteps.includes(step);
            const isCurrent =
              !isComplete &&
              (idx === 0 || completedSteps.includes(stepsToShow[idx - 1]));
            const isFinalSaved = step === "Saved" && isSaved;
            const isFinalCancelled = step === "Cancelled" && isCancelled;

            const bgColor = isFinalSaved
              ? "#059669"
              : isFinalCancelled
              ? "#DC2626"
              : isComplete
              ? "#1D4ED8"
              : isCurrent
              ? "#B45309"
              : "#E2E8F0";

            const textColor = isComplete || isCurrent || isFinalSaved || isFinalCancelled
              ? "#FFFFFF"
              : "#94A3B8";

            return (
              <React.Fragment key={step}>
                <div
                  className="rounded-xl px-4 py-3 min-w-[120px] text-center"
                  style={{ background: bgColor }}
                >
                  <p
                    className="text-[11px] font-bold leading-tight"
                    style={{ color: textColor }}
                  >
                    {step}
                  </p>
                  {(isComplete || isCurrent) && (
                    <p
                      className="text-[9px] mt-0.5 font-semibold opacity-80"
                      style={{ color: textColor }}
                    >
                      {isComplete ? "Complete" : "Active"}
                    </p>
                  )}
                </div>
                {idx < stepsToShow.length - 1 && (
                  <div className="hidden sm:block text-slate-300 font-bold text-lg">
                    {"\u2192"}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current retention plan */}
        {record.retentionPlan && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <StrategyBadge strategy={record.retentionPlan.strategy} />
              <RetentionStatusBadge status={record.retentionPlan.status} />
            </div>
            <p className="text-sm text-slate-700">{record.retentionPlan.description}</p>
            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wide">Owner</span>
                <p className="font-semibold text-slate-700 mt-0.5">{record.retentionPlan.assignedOwner}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wide">Created</span>
                <p className="font-semibold text-slate-700 mt-0.5">{record.retentionPlan.createdDate}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wide">Target Date</span>
                <p className="font-semibold text-slate-700 mt-0.5">{record.retentionPlan.targetDate}</p>
              </div>
            </div>
            {record.retentionPlan.notes && (
              <p className="text-xs text-slate-500 italic border-t border-slate-200 pt-2">
                {record.retentionPlan.notes}
              </p>
            )}
          </div>
        )}

        {!record.retentionPlan && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-sm font-semibold text-amber-700">
              No retention plan has been created for this account.
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              AM review and retention plan creation are the immediate next steps.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: AI RETENTION ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════

function AIRetentionAnalysis({ record }: { record: CancellationRequest }) {
  const ai = record.aiInsight;

  const riskColor =
    ai.cancellationRisk >= 80
      ? "#DC2626"
      : ai.cancellationRisk >= 60
      ? "#EA580C"
      : ai.cancellationRisk >= 40
      ? "#D97706"
      : "#059669";

  const probColor = scoreColor(ai.retentionProbability);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        eyebrow="AI Retention Analysis"
        title={`Retention Analysis — ${record.client}`}
        desc="Signal-driven cancellation risk assessment and retention recommendations."
        accentColor="#6D28D9"
      />
      <div className="p-6 space-y-5">
        {/* Dual probability hero */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border p-5 flex items-center gap-5" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
            <div
              className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 flex-shrink-0 bg-white"
              style={{ borderColor: riskColor }}
            >
              <span className="text-3xl font-extrabold" style={{ color: riskColor }}>
                {ai.cancellationRisk}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">
                Cancel Risk
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Cancellation Risk</p>
              <p className="text-xs text-slate-500 mt-1">
                {ai.cancellationRisk >= 80
                  ? "Critical — immediate executive intervention required."
                  : ai.cancellationRisk >= 60
                  ? "High — active retention effort needed this week."
                  : ai.cancellationRisk >= 40
                  ? "Moderate — retention plan in motion."
                  : "Low — monitor and maintain communication."}
              </p>
            </div>
          </div>

          <div className="rounded-xl border p-5 flex items-center gap-5" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
            <div
              className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 flex-shrink-0 bg-white"
              style={{ borderColor: probColor }}
            >
              <span className="text-3xl font-extrabold" style={{ color: probColor }}>
                {ai.retentionProbability}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">
                Save Prob.
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Retention Probability</p>
              <p className="text-xs text-slate-500 mt-1">
                {ai.retentionProbability >= 70
                  ? "Strong — execute retention plan promptly."
                  : ai.retentionProbability >= 50
                  ? "Moderate — follow the recommended strategy closely."
                  : ai.retentionProbability >= 30
                  ? "Low — consider executive involvement."
                  : "Very low — prepare for clean offboarding."}
              </p>
            </div>
          </div>
        </div>

        {/* Reason analysis */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
            Reason Analysis
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{ai.reasonAnalysis}</p>
        </div>

        {/* Revenue impact */}
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">
            Revenue Impact
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{ai.revenueImpact}</p>
        </div>

        {/* Recommended strategy */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Recommended Strategy
          </p>
          <StrategyBadge strategy={ai.recommendedStrategy} />
        </div>

        {/* Grid: risk factors + suggested actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-red-100 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-red-500">Risk Factors</p>
            <ul className="space-y-1.5">
              {ai.riskFactors.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                  <span className="text-xs text-slate-600 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-blue-100 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500">
              Suggested Actions
            </p>
            <ul className="space-y-1.5">
              {ai.suggestedActions.map((a, i) => (
                <li key={a} className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-blue-400 mt-0.5 flex-shrink-0 w-4">
                    {i + 1}.
                  </span>
                  <span className="text-xs text-slate-600 leading-relaxed">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: REVENUE AT RISK
// ══════════════════════════════════════════════════════════════════════════════

function RevenueAtRisk() {
  const open = getOpenRequests();
  const saved = getSavedClients();
  const cancelled = getCancelledClients();

  const mrrAtRisk = getRevenueAtRisk();
  const arrAtRisk = getARRAtRisk();
  const cancelledMRR = getCancelledRevenue();
  const cancelledARR = cancelled.reduce((s, r) => s + r.arr, 0);

  const savedMRR = saved.reduce((s, r) => s + r.mrr, 0);
  const savedARR = saved.reduce((s, r) => s + r.arr, 0);

  // Department impact by industry
  const industryMap: Record<string, { clients: number; mrrAtRisk: number }> = {};
  for (const r of open) {
    if (!industryMap[r.industry]) industryMap[r.industry] = { clients: 0, mrrAtRisk: 0 };
    industryMap[r.industry].clients += 1;
    industryMap[r.industry].mrrAtRisk += r.mrr;
  }
  const industryRows = Object.entries(industryMap).sort((a, b) => b[1].mrrAtRisk - a[1].mrrAtRisk);

  // Portfolio impact
  const totalPortfolioMRR = CANCELLATION_REQUESTS.reduce((s, r) => s + r.mrr, 0);
  const portfolioImpactPct = totalPortfolioMRR > 0
    ? Math.round((mrrAtRisk / totalPortfolioMRR) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="MRR At Risk"
          value={fmt$(mrrAtRisk)}
          sub="open cancellations"
          accent="#DC2626"
          borderColor="border-red-200"
          bg="bg-red-50"
        />
        <KpiCard
          label="ARR At Risk"
          value={fmt$(arrAtRisk)}
          sub="annualized exposure"
          accent="#DC2626"
          borderColor="border-red-200"
          bg="bg-red-50"
        />
        <KpiCard
          label="Saved Revenue (MRR)"
          value={fmt$(savedMRR)}
          sub="retained this cycle"
          accent="#059669"
          borderColor="border-emerald-200"
          bg="bg-emerald-50"
        />
        <KpiCard
          label="Saved Revenue (ARR)"
          value={fmt$(savedARR)}
          sub="annualized retained"
          accent="#059669"
          borderColor="border-emerald-200"
          bg="bg-emerald-50"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Revenue exposure by client */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            eyebrow="Revenue At Risk"
            title="At-Risk Revenue by Client"
            desc="Open cancellations ranked by ARR exposure."
            accentColor="#DC2626"
          />
          <div className="p-5 space-y-2.5">
            {open
              .sort((a, b) => b.arr - a.arr)
              .map((r) => {
                const pct = arrAtRisk > 0 ? Math.round((r.arr / arrAtRisk) * 100) : 0;
                const s = riskStyle(r.riskLevel);
                return (
                  <div key={r.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{r.client}</span>
                        <Badge label={r.riskLevel} bg={s.bg} color={s.color} border={s.border} />
                      </div>
                      <span className="text-xs font-bold text-red-600">
                        {fmt$(r.arr)}/yr ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${pct}%`, background: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Industry impact */}
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              eyebrow="Industry Impact"
              title="Revenue At Risk by Industry"
              desc="Cancellation exposure grouped by client industry."
              accentColor="#EA580C"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Industry", "Clients", "MRR At Risk"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {industryRows.map(([industry, { clients, mrrAtRisk: mrr }]) => (
                    <tr key={industry} className="border-t border-slate-100">
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{industry}</td>
                      <td className="px-4 py-2.5 text-slate-600">{clients}</td>
                      <td className="px-4 py-2.5 font-semibold text-red-600">
                        {fmt$(mrr)}/mo
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Portfolio impact summary */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              eyebrow="Portfolio Impact"
              title="Client Portfolio Impact"
              desc="Cancellation exposure as a percentage of total portfolio."
            />
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Portfolio MRR At Risk</span>
                <span className="text-sm font-bold text-red-600">{portfolioImpactPct}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-red-500"
                  style={{ width: `${portfolioImpactPct}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">At Risk</p>
                  <p className="text-lg font-bold text-red-600 mt-0.5">{fmt$(mrrAtRisk)}</p>
                  <p className="text-[10px] text-slate-400">MRR</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Lost</p>
                  <p className="text-lg font-bold text-slate-600 mt-0.5">{fmt$(cancelledMRR)}</p>
                  <p className="text-[10px] text-slate-400">MRR</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Saved</p>
                  <p className="text-lg font-bold text-emerald-600 mt-0.5">{fmt$(savedMRR)}</p>
                  <p className="text-[10px] text-slate-400">MRR</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: EXECUTIVE RETENTION DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function ExecutiveRetentionDashboard() {
  const open = getOpenRequests();
  const saved = getSavedClients();
  const cancelled = getCancelledClients();
  const mrrAtRisk = getRevenueAtRisk();
  const arrAtRisk = getARRAtRisk();
  const saveRate = getRetentionSuccessRate();
  const cancelledRevenue = getCancelledRevenue();
  const reasonBreakdown = getReasonBreakdown();

  const criticalClients = CANCELLATION_REQUESTS.filter(
    (r) => r.riskLevel === "Critical" && r.retentionStatus !== "Saved" && r.retentionStatus !== "Lost"
  );

  const retentionTrend = [
    { month: "Feb", requests: 2, saved: 2, rate: 100 },
    { month: "Mar", requests: 3, saved: 2, rate: 67 },
    { month: "Apr", requests: 4, saved: 3, rate: 75 },
    { month: "May", requests: 5, saved: 2, rate: 40 },
    { month: "Jun", requests: 12, saved: 3, rate: 25 },
  ];

  return (
    <div className="space-y-6">
      {/* Executive KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-400">Revenue At Risk</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{fmt$(arrAtRisk)}</p>
          <p className="text-xs text-slate-400 mt-0.5">ARR — open cancellations</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Save Rate</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{saveRate}%</p>
          <p className="text-xs text-slate-400 mt-0.5">{saved.length} saved of {saved.length + cancelled.length} decided</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cancelled Revenue</p>
          <p className="text-2xl font-extrabold text-slate-600 mt-1">{fmt$(cancelledRevenue)}/mo</p>
          <p className="text-xs text-slate-400 mt-0.5">{cancelled.length} confirmed losses</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Open Cases</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{open.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">active cancellation requests</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top cancellation reasons */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            eyebrow="Reason Analysis"
            title="Top Cancellation Reasons"
            desc="Volume breakdown by primary cancellation driver."
            accentColor="#1D4ED8"
          />
          <div className="p-5 space-y-3">
            {Object.entries(reasonBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([reason, count]) => {
                const pct = Math.round((count / CANCELLATION_REQUESTS.length) * 100);
                const s = reasonStyle(reason as CancellationReason);
                return (
                  <div key={reason} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">{reason}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: s.color }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${pct}%`, background: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Retention trend */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            eyebrow="Retention Trends"
            title="Monthly Retention Performance"
            desc="Cancellation volume and save rate over the past 5 months."
            accentColor="#059669"
          />
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Month", "Requests", "Saved", "Save Rate"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-slate-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {retentionTrend.map((row) => (
                    <tr key={row.month} className="border-t border-slate-100">
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{row.month}</td>
                      <td className="px-4 py-2.5 text-slate-600">{row.requests}</td>
                      <td className="px-4 py-2.5 text-emerald-600 font-semibold">{row.saved}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${row.rate}%`,
                                background: scoreColor(row.rate),
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-bold"
                            style={{ color: scoreColor(row.rate) }}
                          >
                            {row.rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Critical at-risk clients */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          eyebrow="At-Risk Clients"
          title="Critical At-Risk Accounts"
          desc="Clients rated Critical risk requiring immediate executive attention."
          accentColor="#DC2626"
        />
        {criticalClients.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {criticalClients.map((r) => {
              const s = riskStyle(r.riskLevel);
              return (
                <div
                  key={r.id}
                  className="rounded-xl border p-4 space-y-3"
                  style={{ background: s.bg, borderColor: s.border }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{r.client}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.accountManager}</p>
                    </div>
                    <RiskBadge level={r.riskLevel} />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ARR At Risk</span>
                      <span className="font-bold text-red-600">{fmt$(r.arr)}/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cancel Risk</span>
                      <span className="font-bold" style={{ color: riskStyle(r.riskLevel).color }}>
                        {r.aiInsight.cancellationRisk}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Save Probability</span>
                      <span
                        className="font-bold"
                        style={{ color: scoreColor(r.aiInsight.retentionProbability) }}
                      >
                        {r.aiInsight.retentionProbability}%
                      </span>
                    </div>
                  </div>
                  <ReasonBadge reason={r.reason} />
                  <StatusBadge status={r.status} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-slate-400">
            No critical-risk clients currently active.
          </div>
        )}
      </section>

      {/* Saved + cancelled summary */}
      <div className="grid sm:grid-cols-2 gap-5">
        <section className="rounded-xl border border-emerald-200 bg-white shadow-sm">
          <SectionHeader
            eyebrow="Clients Saved"
            title="Saved Clients"
            desc="Cancellations successfully reversed this cycle."
            accentColor="#059669"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Client", "Reason", "ARR Saved", "Strategy"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {saved.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{r.client}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <ReasonBadge reason={r.reason} />
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-600">
                      {fmt$(r.arr)}/yr
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {r.retentionPlan && (
                        <StrategyBadge strategy={r.retentionPlan.strategy} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            eyebrow="Confirmed Losses"
            title="Cancelled Clients"
            desc="Cancellations confirmed and moved to offboarding."
            accentColor="#475569"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Client", "Reason", "ARR Lost", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cancelled.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{r.client}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <ReasonBadge reason={r.reason} />
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-500">
                      {fmt$(r.arr)}/yr
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: ACTIVITY TIMELINE
// ══════════════════════════════════════════════════════════════════════════════

function ActivityTimeline({ record }: { record: CancellationRequest }) {
  const stepColor = (step: string) => {
    if (step === "Saved") return "#059669";
    if (step === "Cancelled") return "#DC2626";
    if (step === "Executive Review" || step === "Escalated") return "#EA580C";
    if (step === "Retention Plan") return "#6D28D9";
    if (step === "Client Discussion") return "#0F766E";
    if (step === "AM Review") return "#1D4ED8";
    if (step === "Cancellation Request") return "#D97706";
    return "#64748B";
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        eyebrow="Activity Timeline"
        title={`Activity Timeline — ${record.client}`}
        desc="Chronological history of all cancellation and retention events."
      />
      <div className="p-6">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />

          <div className="space-y-6">
            {record.activityTimeline.map((event, idx) => {
              const color = stepColor(event.step);
              const isLast = idx === record.activityTimeline.length - 1;
              return (
                <div key={`${event.date}-${idx}`} className="relative flex gap-5">
                  {/* Dot */}
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm"
                    style={{ background: color }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>

                  {/* Content */}
                  <div className={`flex-1 rounded-xl border p-4 ${isLast ? "" : ""}`}
                    style={{ borderColor: color + "40", background: color + "08" }}>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <p
                          className="text-xs font-bold uppercase tracking-widest"
                          style={{ color }}
                        >
                          {event.step}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{event.date}</p>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{event.actor}</span>
                    </div>
                    <p className="text-sm text-slate-700">{event.description}</p>
                    {event.outcome && (
                      <div className="mt-2 inline-flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: color }}
                        />
                        <p className="text-xs font-semibold" style={{ color }}>
                          {event.outcome}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT DETAIL PANEL
// ══════════════════════════════════════════════════════════════════════════════

type DetailTab =
  | "risk-profile"
  | "save-workflow"
  | "ai-analysis"
  | "timeline";

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: "risk-profile",  label: "Risk Profile" },
  { id: "save-workflow", label: "Save Attempt" },
  { id: "ai-analysis",  label: "AI Analysis" },
  { id: "timeline",     label: "Activity Timeline" },
];

function ClientDetailPanel({
  record,
  onClose,
}: {
  record: CancellationRequest;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>("risk-profile");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Cancellation Detail
          </p>
          <h2 className="text-xl font-bold text-slate-900">{record.client}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <RiskBadge level={record.riskLevel} />
            <StatusBadge status={record.status} />
            <RetentionStatusBadge status={record.retentionStatus} />
            <ReasonBadge reason={record.reason} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">MRR At Risk</p>
          <p className="text-lg font-extrabold text-red-600 mt-0.5">${record.mrr.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">ARR At Risk</p>
          <p className="text-lg font-extrabold text-red-600 mt-0.5">${record.arr.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Cancel Risk</p>
          <p
            className="text-lg font-extrabold mt-0.5"
            style={{
              color:
                record.aiInsight.cancellationRisk >= 80
                  ? "#DC2626"
                  : record.aiInsight.cancellationRisk >= 60
                  ? "#EA580C"
                  : "#D97706",
            }}
          >
            {record.aiInsight.cancellationRisk}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Save Probability
          </p>
          <p
            className="text-lg font-extrabold mt-0.5"
            style={{ color: scoreColor(record.aiInsight.retentionProbability) }}
          >
            {record.aiInsight.retentionProbability}%
          </p>
        </div>
      </div>

      {/* Reason detail */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
          Cancellation Reason
        </p>
        <p className="text-sm text-slate-700">{record.reasonDetail}</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {DETAIL_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg border border-b-0 px-4 py-2 text-xs font-semibold transition-colors ${
              tab === t.id
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "risk-profile" && <ClientRiskProfilePanel record={record} />}
        {tab === "save-workflow" && <SaveAttemptWorkflow record={record} />}
        {tab === "ai-analysis" && <AIRetentionAnalysis record={record} />}
        {tab === "timeline" && <ActivityTimeline record={record} />}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN TABS
// ══════════════════════════════════════════════════════════════════════════════

type MainTab =
  | "dashboard"
  | "cancellations"
  | "retention"
  | "revenue"
  | "executive";

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: "dashboard",     label: "Dashboard" },
  { id: "cancellations", label: "Cancellations" },
  { id: "retention",     label: "Retention Center" },
  { id: "revenue",       label: "Revenue At Risk" },
  { id: "executive",     label: "Executive Dashboard" },
];

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function CancellationsPage() {
  const [mainTab, setMainTab] = useState<MainTab>("dashboard");
  const [selectedRecord, setSelectedRecord] = useState<CancellationRequest | null>(null);

  const mrrAtRisk = getRevenueAtRisk();
  const arrAtRisk = getARRAtRisk();
  const saveRate = getRetentionSuccessRate();

  const handleSelect = (r: CancellationRequest) => {
    setSelectedRecord(r);
  };

  const handleBack = () => {
    setSelectedRecord(null);
  };

  // Detail view
  if (selectedRecord) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Account Management
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Cancellations & Retention</h1>
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
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Account Management
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Cancellations & Retention</h1>
          <p className="text-sm text-slate-500 mt-1">
            Retention engine — prevent cancellations, save clients, and protect revenue.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
              ARR At Risk
            </p>
            <p className="text-lg font-extrabold text-red-600 mt-0.5">{fmt$(arrAtRisk)}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              MRR At Risk
            </p>
            <p className="text-lg font-extrabold text-amber-600 mt-0.5">{fmt$(mrrAtRisk)}/mo</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Save Rate
            </p>
            <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{saveRate}%</p>
          </div>
        </div>
      </div>

      {/* Main tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {MAIN_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setMainTab(t.id)}
            className={`rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-semibold transition-colors ${
              mainTab === t.id
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {mainTab === "dashboard" && <CancellationsDashboard />}
        {mainTab === "cancellations" && <CancellationTable onSelect={handleSelect} />}
        {mainTab === "retention" && <RetentionCenter onSelect={handleSelect} />}
        {mainTab === "revenue" && <RevenueAtRisk />}
        {mainTab === "executive" && <ExecutiveRetentionDashboard />}
      </div>
    </div>
  );
}
