"use client";

import React, { useState } from "react";
import {
  PORTFOLIO_CLIENTS,
  RENEWAL_RECORDS,
  EXPANSION_OPPORTUNITIES,
  DEPARTMENT_STATUS,
  type HealthStatus,
} from "@/lib/account-management/am-client-success-data";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return `$${n.toLocaleString()}`;
}

function healthStatusBadge(status: HealthStatus): string {
  const map: Record<HealthStatus, string> = {
    Healthy: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Monitor: "bg-amber-100 text-amber-700 border-amber-200",
    "At Risk": "bg-orange-100 text-orange-700 border-orange-200",
    Critical: "bg-red-100 text-red-700 border-red-200",
  };
  return map[status] ?? "bg-slate-100 text-slate-500";
}

function renewalRiskBadge(risk: string): string {
  const map: Record<string, string> = {
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    High: "bg-orange-100 text-orange-700 border-orange-200",
    Critical: "bg-red-100 text-red-700 border-red-200",
  };
  return map[risk] ?? "bg-slate-100 text-slate-500";
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-slate-100 px-5 py-4">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  color = "text-slate-800",
  bgColor = "bg-white",
  borderColor = "border-slate-200",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bgColor?: string;
  borderColor?: string;
}) {
  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-5 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Derived data ──────────────────────────────────────────────────────────────

const totalMrr = PORTFOLIO_CLIENTS.reduce((a, c) => a + c.mrr, 0);
const totalArr = PORTFOLIO_CLIENTS.reduce((a, c) => a + c.arr, 0);
const activeClients = PORTFOLIO_CLIENTS.filter((c) => c.status === "Active").length;
const revenueAtRiskClients = PORTFOLIO_CLIENTS.filter(
  (c) =>
    c.healthStatus === "At Risk" ||
    c.healthStatus === "Critical" ||
    c.status === "Cancellation Requested"
);
const revenueAtRisk = revenueAtRiskClients.reduce((a, c) => a + c.mrr, 0);
const largestAccounts = [...PORTFOLIO_CLIENTS].sort((a, b) => b.mrr - a.mrr).slice(0, 8);
const accountsAtRisk = PORTFOLIO_CLIENTS.filter(
  (c) => c.healthStatus === "At Risk" || c.healthStatus === "Critical"
);
const expansionPipeline = EXPANSION_OPPORTUNITIES.filter(
  (o) => o.status !== "Declined"
).reduce((a, o) => a + o.estimatedRevenue, 0);
const closedWonRevenue = EXPANSION_OPPORTUNITIES.filter(
  (o) => o.status === "Closed Won"
).reduce((a, o) => a + o.estimatedRevenue, 0);

export default function ExecutivePage() {
  const [activeSection, setActiveSection] = useState<string>("overview");

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "largest", label: "Largest Accounts" },
    { id: "atrisk", label: "Accounts At Risk" },
    { id: "renewals", label: "Renewal Forecast" },
    { id: "revenue-risk", label: "Revenue At Risk" },
    { id: "expansion", label: "Expansion Forecast" },
    { id: "departments", label: "Department Issues" },
    { id: "ai", label: "AI Summary" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Executive Account View</h1>
        <p className="text-sm text-slate-500 mt-1">
          High-level portfolio overview for leadership — revenue, risk, renewals, and expansion.
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total MRR"
          value={fmt(totalMrr)}
          sub="monthly recurring revenue"
          color="text-blue-700"
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
        />
        <KpiCard
          label="Total ARR"
          value={fmt(totalArr)}
          sub="annual recurring revenue"
          color="text-indigo-700"
          bgColor="bg-indigo-50"
          borderColor="border-indigo-200"
        />
        <KpiCard
          label="Active Clients"
          value={activeClients}
          sub={`of ${PORTFOLIO_CLIENTS.length} total`}
          color="text-emerald-700"
          bgColor="bg-emerald-50"
          borderColor="border-emerald-200"
        />
        <KpiCard
          label="Revenue At Risk"
          value={fmt(revenueAtRisk)}
          sub={`${revenueAtRiskClients.length} clients`}
          color="text-red-700"
          bgColor="bg-red-50"
          borderColor="border-red-200"
        />
      </div>

      {/* Section nav */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`rounded-t-lg border border-b-0 px-3 py-2 text-xs font-semibold transition-colors ${
              activeSection === s.id
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeSection === "overview" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Portfolio", value: PORTFOLIO_CLIENTS.length, sub: "clients", color: "text-slate-800" },
            { label: "Healthy", value: PORTFOLIO_CLIENTS.filter((c) => c.healthStatus === "Healthy").length, sub: "health status", color: "text-emerald-700" },
            { label: "Monitor", value: PORTFOLIO_CLIENTS.filter((c) => c.healthStatus === "Monitor").length, sub: "health status", color: "text-amber-700" },
            { label: "At Risk", value: PORTFOLIO_CLIENTS.filter((c) => c.healthStatus === "At Risk").length, sub: "health status", color: "text-orange-700" },
            { label: "Critical", value: PORTFOLIO_CLIENTS.filter((c) => c.healthStatus === "Critical").length, sub: "health status", color: "text-red-700" },
            { label: "Renewals (90 days)", value: RENEWAL_RECORDS.filter((r) => r.daysRemaining <= 90).length, sub: "upcoming", color: "text-blue-700" },
            { label: "Expansion Pipeline", value: fmt(expansionPipeline), sub: "est. monthly revenue", color: "text-teal-700" },
            { label: "Dept. Escalations", value: DEPARTMENT_STATUS.reduce((a, d) => a + d.escalations, 0), sub: "open", color: "text-orange-700" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
              <p className={`mt-1.5 text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Largest Accounts */}
      {activeSection === "largest" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <SectionHeader title="Largest Accounts by MRR" subtitle="Top 8 accounts by monthly recurring revenue" />
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">#</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Client</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Account Manager</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Services</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">MRR</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">ARR</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {largestAccounts.map((c, i) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-400 font-semibold">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.industry}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.accountManager}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.services.map((s) => (
                        <span key={s} className="inline-block rounded-md bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">{fmt(c.mrr)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmt(c.arr)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${healthStatusBadge(c.healthStatus)}`}>
                      {c.healthStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Accounts At Risk */}
      {activeSection === "atrisk" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <SectionHeader
            title="Accounts At Risk"
            subtitle={`${accountsAtRisk.length} clients with At Risk or Critical health status`}
          />
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Client</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Account Manager</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Health Score</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Health Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Renewal Date</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">MRR</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {accountsAtRisk.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.location}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.accountManager}</td>
                  <td className="px-4 py-3">
                    <span className={`text-lg font-bold ${c.healthScore >= 60 ? "text-amber-600" : "text-red-600"}`}>{c.healthScore}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${healthStatusBadge(c.healthStatus)}`}>
                      {c.healthStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{c.renewalDate}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{fmt(c.mrr)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      c.status === "Cancellation Requested"
                        ? "bg-red-100 text-red-700 border-red-200"
                        : "bg-orange-100 text-orange-700 border-orange-200"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Renewal Forecast */}
      {activeSection === "renewals" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <SectionHeader
            title="Renewal Forecast"
            subtitle="Upcoming renewals sorted by days remaining"
          />
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Client</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Renewal Window</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Days Remaining</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Renewal Risk</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Owner</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">MRR</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Contract Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...RENEWAL_RECORDS].sort((a, b) => a.daysRemaining - b.daysRemaining).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{r.client}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.renewalWindow}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${r.daysRemaining <= 30 ? "text-red-600" : r.daysRemaining <= 60 ? "text-amber-600" : "text-slate-700"}`}>
                      {r.daysRemaining}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${renewalRiskBadge(r.renewalRisk)}`}>
                      {r.renewalRisk}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      r.renewalStatus === "At Risk"
                        ? "bg-orange-100 text-orange-700 border-orange-200"
                        : r.renewalStatus === "In Progress"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : r.renewalStatus === "Renewed"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}>
                      {r.renewalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{r.assignedOwner}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(r.mrr)}</td>
                  <td className="px-4 py-3 text-right text-slate-600 text-xs">{r.contractValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Revenue At Risk */}
      {activeSection === "revenue-risk" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-base font-bold text-red-800">
              {fmt(revenueAtRisk)}/mo — {revenueAtRiskClients.length} clients at risk
            </p>
            <p className="text-xs text-red-600 mt-1">
              Accounts with At Risk / Critical health status or active cancellation requests
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Client</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Account Manager</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Health</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Renewal</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">MRR At Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {revenueAtRiskClients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-700">{c.accountManager}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${healthStatusBadge(c.healthStatus)}`}>
                        {c.healthStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{c.status}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{c.renewalDate}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{fmt(c.mrr)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-red-200 bg-red-50">
                  <td colSpan={5} className="px-4 py-3 font-bold text-red-700">Total Revenue At Risk</td>
                  <td className="px-4 py-3 text-right font-bold text-red-700">{fmt(revenueAtRisk)}/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expansion Forecast */}
      {activeSection === "expansion" && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-500">Total Pipeline</p>
              <p className="text-2xl font-bold text-teal-700 mt-1">{fmt(expansionPipeline)}/mo</p>
              <p className="text-xs text-teal-500 mt-0.5">Excluding declined opportunities</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">Closed Won</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{fmt(closedWonRevenue)}/mo</p>
              <p className="text-xs text-emerald-500 mt-0.5">Revenue already confirmed</p>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Opportunities</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{EXPANSION_OPPORTUNITIES.filter((o) => o.status !== "Declined").length}</p>
              <p className="text-xs text-indigo-500 mt-0.5">Active in pipeline</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
            <SectionHeader title="Expansion Opportunities Pipeline" />
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Client</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Opportunity</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Confidence</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Est. Revenue / mo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {EXPANSION_OPPORTUNITIES.filter((o) => o.status !== "Declined").map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{o.client}</td>
                    <td className="px-4 py-3 text-slate-700">{o.opportunity}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        o.status === "Closed Won"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : o.status === "In Negotiation"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : o.status === "Proposed"
                          ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${o.confidenceScore >= 80 ? "text-emerald-600" : o.confidenceScore >= 60 ? "text-amber-600" : "text-red-600"}`}>
                        {o.confidenceScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">${o.estimatedRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Department Issues */}
      {activeSection === "departments" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <SectionHeader title="Department Issues" subtitle="Open tasks, blocked work, and escalations by department" />
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Department</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Open Tasks</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Blocked</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Escalations</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Upcoming Deliverables</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Dependencies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DEPARTMENT_STATUS.map((dept) => (
                <tr key={dept.department} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{dept.department}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{dept.openTasks}</td>
                  <td className="px-4 py-3 text-center">
                    {dept.blockedWork > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        {dept.blockedWork}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {dept.escalations > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                        {dept.escalations}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ul className="space-y-0.5">
                      {dept.upcomingDeliverables.map((d) => (
                        <li key={d} className="text-xs text-slate-600">• {d}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">
                    {dept.dependencies.length > 0 ? (
                      <ul className="space-y-0.5">
                        {dept.dependencies.map((d) => (
                          <li key={d} className="text-xs text-amber-700">⚠ {d}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-slate-300">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Executive Summary */}
      {activeSection === "ai" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <div>
                <h2 className="text-lg font-bold">AI Executive Summary</h2>
                <p className="text-blue-200 text-xs">Generated analysis across all {PORTFOLIO_CLIENTS.length} clients</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: "📊",
                  title: "Portfolio Overview",
                  text: `The portfolio contains ${PORTFOLIO_CLIENTS.length} clients generating ${fmt(totalMrr)}/mo (${fmt(totalArr)}/yr ARR). ${PORTFOLIO_CLIENTS.filter(c => c.healthStatus === "Healthy").length} clients are healthy, while ${PORTFOLIO_CLIENTS.filter(c => c.healthStatus === "At Risk" || c.healthStatus === "Critical").length} require immediate intervention.`,
                },
                {
                  icon: "⚠️",
                  title: "Current Risks",
                  text: `${revenueAtRiskClients.length} accounts represent ${fmt(revenueAtRisk)}/mo in at-risk revenue. Lakeview Dental (renewal June 30, payment overdue) and Harbor View Realty (CRM stalled, VP escalation) are the most critical. Peak Performance HVAC has had no contact in 25 days with 2 overdue reports.`,
                },
                {
                  icon: "📅",
                  title: "Upcoming Deadlines",
                  text: `${RENEWAL_RECORDS.filter(r => r.daysRemaining <= 30).length} renewals due within 30 days. Lakeview Dental and Harbor View Realty renewals are critical-risk. Pinnacle HVAC renewal is low-risk with expansion interest. Keystone Law Group renewal is in progress.`,
                },
                {
                  icon: "💰",
                  title: "Renewal Opportunities",
                  text: `${RENEWAL_RECORDS.length} renewals tracked. ${RENEWAL_RECORDS.filter(r => r.renewalRisk === "Low").length} are low-risk. Total renewal ARR at stake this quarter: ${fmt(RENEWAL_RECORDS.reduce((a, r) => a + r.mrr, 0) * 12)}. Recommend prioritizing Pinnacle HVAC with an expansion add-on proposal to increase ARR.`,
                },
                {
                  icon: "📈",
                  title: "Expansion Opportunities",
                  text: `${fmt(expansionPipeline)}/mo in expansion pipeline identified. LinkedIn Ads for CloudPath Tech (${fmt(2400)}/mo) is already closed. Pinnacle HVAC GBP upgrade (${fmt(1200)}/mo) is in negotiation with 95% confidence. NorthStar Dental multi-location expansion (${fmt(3800)}/mo) is high-priority.`,
                },
                {
                  icon: "✅",
                  title: "Recommended Executive Actions",
                  text: "1) Escalate Lakeview Dental to leadership immediately — June 30 deadline. 2) VP call for Harbor View Realty CRM dispute. 3) Contact Peak Performance HVAC today. 4) Close Pinnacle HVAC expansion proposal. 5) Review department-wide blocked work in Paid Ads and Design (3 blocked each).",
                },
              ].map(({ icon, title, text }) => (
                <div key={title} className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
                  <p className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                    <span>{icon}</span>{title}
                  </p>
                  <p className="text-sm text-blue-100 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
