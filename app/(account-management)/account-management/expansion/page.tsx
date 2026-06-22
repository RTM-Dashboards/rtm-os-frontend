"use client";

import React, { useState } from "react";
import {
  EXPANSION_OPPORTUNITIES,
  type ExpansionOpportunity,
  type ExpansionStatus,
} from "@/lib/account-management/am-client-success-data";

// ── Badge helpers ─────────────────────────────────────────────────────────────

function statusBadge(status: ExpansionStatus): string {
  const map: Record<ExpansionStatus, string> = {
    Identified: "bg-blue-100 text-blue-700 border-blue-200",
    Proposed: "bg-indigo-100 text-indigo-700 border-indigo-200",
    "In Negotiation": "bg-amber-100 text-amber-700 border-amber-200",
    "Closed Won": "bg-emerald-100 text-emerald-700 border-emerald-200",
    Declined: "bg-red-100 text-red-700 border-red-200",
  };
  return map[status] ?? "bg-slate-100 text-slate-500 border-slate-200";
}

function confidenceColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-400";
}

function confidenceTextColor(score: number): string {
  if (score >= 80) return "text-emerald-700";
  if (score >= 60) return "text-amber-700";
  return "text-red-700";
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color = "text-slate-800",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const ALL_STATUSES: ExpansionStatus[] = [
  "Identified",
  "Proposed",
  "In Negotiation",
  "Closed Won",
  "Declined",
];

export default function ExpansionPage() {
  const [activeStatus, setActiveStatus] = useState<ExpansionStatus | "All">("All");

  const filtered = EXPANSION_OPPORTUNITIES.filter(
    (o) => activeStatus === "All" || o.status === activeStatus
  );

  // KPIs
  const total = EXPANSION_OPPORTUNITIES.length;
  const closedWon = EXPANSION_OPPORTUNITIES.filter((o) => o.status === "Closed Won").length;
  const inNeg = EXPANSION_OPPORTUNITIES.filter((o) => o.status === "In Negotiation").length;
  const proposed = EXPANSION_OPPORTUNITIES.filter((o) => o.status === "Proposed").length;
  const identified = EXPANSION_OPPORTUNITIES.filter((o) => o.status === "Identified").length;
  const declined = EXPANSION_OPPORTUNITIES.filter((o) => o.status === "Declined").length;
  const totalRevPipeline = EXPANSION_OPPORTUNITIES.filter(
    (o) => o.status !== "Declined"
  ).reduce((a, o) => a + o.estimatedRevenue, 0);

  // Pipeline by status for summary
  const pipelineByStatus = ALL_STATUSES.map((s) => ({
    status: s,
    count: EXPANSION_OPPORTUNITIES.filter((o) => o.status === s).length,
    revenue: EXPANSION_OPPORTUNITIES.filter((o) => o.status === s).reduce(
      (a, o) => a + o.estimatedRevenue,
      0
    ),
  }));

  // Top by confidence
  const topByConfidence = [...EXPANSION_OPPORTUNITIES]
    .filter((o) => o.status !== "Declined")
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Expansion Opportunities</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track upsell and expansion opportunities across the client portfolio.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard label="Total" value={total} />
        <KpiCard label="Closed Won" value={closedWon} color="text-emerald-600" />
        <KpiCard label="In Negotiation" value={inNeg} color="text-amber-600" />
        <KpiCard label="Proposed" value={proposed} color="text-indigo-600" />
        <KpiCard label="Identified" value={identified} color="text-blue-600" />
        <KpiCard label="Declined" value={declined} color="text-red-600" />
        <KpiCard
          label="Pipeline / mo"
          value={`$${totalRevPipeline.toLocaleString()}`}
          sub="excl. declined"
          color="text-teal-700"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {(["All", ...ALL_STATUSES] as (ExpansionStatus | "All")[]).map((s) => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`rounded-t-lg border border-b-0 px-3 py-2 text-xs font-semibold transition-colors ${
              activeStatus === s
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {s}
            {s !== "All" && (
              <span className="ml-1 text-[10px] text-slate-400">
                ({EXPANSION_OPPORTUNITIES.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Client</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Opportunity</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Recommended Services</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Est. Revenue / mo</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Confidence</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Owner</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((opp) => (
              <OpportunityRow key={opp.id} opp={opp} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                  No opportunities match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-400">
          Showing {filtered.length} of {total} opportunities
        </div>
      </div>

      {/* Pipeline Summary + Top Opportunities */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pipeline by status */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-800">Revenue Pipeline by Status</h2>
            <p className="text-xs text-slate-400 mt-0.5">Estimated monthly recurring revenue per stage</p>
          </div>
          <div className="p-5 space-y-3">
            {pipelineByStatus.map(({ status, count, revenue }) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusBadge(status)}`}
                  >
                    {status}
                  </span>
                  <span className="text-xs text-slate-400">{count} opp{count !== 1 ? "s" : ""}</span>
                </div>
                <span className={`text-sm font-bold ${revenue > 0 ? "text-emerald-700" : "text-slate-400"}`}>
                  {revenue > 0 ? `$${revenue.toLocaleString()}/mo` : "—"}
                </span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Total Pipeline</span>
              <span className="text-base font-bold text-teal-700">${totalRevPipeline.toLocaleString()}/mo</span>
            </div>
          </div>
        </div>

        {/* Top by confidence */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-800">Top Opportunities by Confidence</h2>
            <p className="text-xs text-slate-400 mt-0.5">Highest-probability expansion deals to prioritize</p>
          </div>
          <div className="p-5 space-y-3">
            {topByConfidence.map((opp, i) => (
              <div key={opp.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500 flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{opp.client}</p>
                  <p className="text-xs text-slate-400 truncate">{opp.opportunity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${confidenceTextColor(opp.confidenceScore)}`}>
                    {opp.confidenceScore}%
                  </p>
                  <p className="text-xs text-slate-400">${opp.estimatedRevenue.toLocaleString()}/mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OpportunityRow({ opp }: { opp: ExpansionOpportunity }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 font-semibold text-slate-900">{opp.client}</td>
      <td className="px-4 py-3 text-slate-700 max-w-[180px]">{opp.opportunity}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {opp.recommendedServices.map((s) => (
            <span
              key={s}
              className="inline-block rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700"
            >
              {s}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="font-bold text-emerald-700">${opp.estimatedRevenue.toLocaleString()}</span>
        <span className="text-xs text-slate-400">/mo</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${confidenceColor(opp.confidenceScore)}`}
              style={{ width: `${opp.confidenceScore}%` }}
            />
          </div>
          <span className={`text-xs font-semibold ${confidenceTextColor(opp.confidenceScore)}`}>
            {opp.confidenceScore}%
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusBadge(opp.status)}`}
        >
          {opp.status}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-700">{opp.assignedOwner}</td>
      <td className="px-4 py-3 text-xs text-slate-500 italic max-w-[200px]">{opp.notes}</td>
    </tr>
  );
}
