"use client";

import React, { useState } from "react";
import { MOCK_CHANGE_REQUESTS } from "@/lib/change-requests/mock-data";
import type {
  ChangeRequest,
  ChangeRequestStatus,
  ChangeRequestType,
} from "@/lib/change-requests/types";

// ─────────────────────────────────────────────────────────────────────────────
// Badge helpers
// ─────────────────────────────────────────────────────────────────────────────

function statusBadge(status: ChangeRequestStatus): string {
  const map: Record<ChangeRequestStatus, string> = {
    Draft: "bg-slate-100 text-slate-500 border-slate-200",
    Submitted: "bg-blue-100 text-blue-700 border-blue-200",
    "Under Review": "bg-amber-100 text-amber-700 border-amber-200",
    "Pending Approval": "bg-violet-100 text-violet-700 border-violet-200",
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
    Implemented: "bg-teal-100 text-teal-700 border-teal-200",
    Cancelled: "bg-slate-200 text-slate-500 border-slate-300",
  };
  return map[status];
}

function typeBadge(type: ChangeRequestType): string {
  const map: Record<ChangeRequestType, string> = {
    "Budget Reallocation": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Service Upgrade": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Service Downgrade": "bg-orange-100 text-orange-700 border-orange-200",
    "Service Addition": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "Service Removal": "bg-red-100 text-red-700 border-red-200",
    Pause: "bg-slate-200 text-slate-600 border-slate-300",
    Reactivation: "bg-teal-100 text-teal-700 border-teal-200",
    "Contract Amendment": "bg-violet-100 text-violet-700 border-violet-200",
    "Custom Scope Change": "bg-amber-100 text-amber-700 border-amber-200",
  };
  return map[type];
}

function revenueColor(impact: number): string {
  if (impact > 0) return "text-emerald-700 font-bold";
  if (impact < 0) return "text-red-700 font-bold";
  return "text-slate-500";
}

function formatRevenue(impact: number): string {
  if (impact === 0) return "—";
  const sign = impact > 0 ? "+": "";
  return `${sign}$${Math.abs(impact).toLocaleString()}/mo`;
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Cards
// ─────────────────────────────────────────────────────────────────────────────

function KPICards() {
  const open = MOCK_CHANGE_REQUESTS.filter((r) =>
    ["Submitted", "Under Review", "Pending Approval"].includes(r.status)
  ).length;
  const pendingReview = MOCK_CHANGE_REQUESTS.filter(
    (r) => r.status === "Under Review").length;
  const pendingApproval = MOCK_CHANGE_REQUESTS.filter(
    (r) => r.status === "Pending Approval").length;
  const approved = MOCK_CHANGE_REQUESTS.filter(
    (r) => r.status === "Approved"|| r.status === "Implemented").length;
  const rejected = MOCK_CHANGE_REQUESTS.filter(
    (r) => r.status === "Rejected").length;

  const revenueIncrease = MOCK_CHANGE_REQUESTS.filter(
    (r) => r.revenueImpact > 0
  ).reduce((s, r) => s + r.revenueImpact, 0);

  const revenueReduction = MOCK_CHANGE_REQUESTS.filter(
    (r) => r.revenueImpact < 0
  ).reduce((s, r) => s + r.revenueImpact, 0);

  const projectsImpacted = new Set(
    MOCK_CHANGE_REQUESTS.flatMap((r) => r.projectsImpacted)
  ).size;

  const cards = [
    {
      label: "Open Requests",
      value: open,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Pending Review",
      value: pendingReview,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label: "Pending Approval",
      value: pendingApproval,
      color: "text-violet-700",
      bg: "bg-violet-50",
      border: "border-violet-200",
    },
    {
      label: "Approved",
      value: approved,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label: "Rejected",
      value: rejected,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    {
      label: "Revenue Increase",
      value: `+$${(revenueIncrease / 1000).toFixed(1)}K/mo`,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label: "Revenue Reduction",
      value: `-$${(Math.abs(revenueReduction) / 1000).toFixed(1)}K/mo`,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    {
      label: "Projects Impacted",
      value: projectsImpacted,
      color: "text-slate-700",
      bg: "bg-slate-50",
      border: "border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map(({ label, value, color, bg, border }) => (
        <div
          key={label}
          className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {label}
          </p>
          <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Change Request Table
// ─────────────────────────────────────────────────────────────────────────────

interface TableProps {
  onSelect: (cr: ChangeRequest) => void;
  selectedId: string | null;
}

function ChangeRequestTable({ onSelect, selectedId }: TableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const statuses: ChangeRequestStatus[] = [
    "Draft",
    "Submitted",
    "Under Review",
    "Pending Approval",
    "Approved",
    "Rejected",
    "Implemented",
    "Cancelled",
  ];
  const types: ChangeRequestType[] = [
    "Budget Reallocation",
    "Service Upgrade",
    "Service Downgrade",
    "Service Addition",
    "Service Removal",
    "Pause",
    "Reactivation",
    "Contract Amendment",
    "Custom Scope Change",
  ];

  const filtered = MOCK_CHANGE_REQUESTS.filter((r) => {
    if (statusFilter !== "All"&& r.status !== statusFilter) return false;
    if (typeFilter !== "All"&& r.requestType !== typeFilter) return false;
    if (
      search &&
      !r.client.toLowerCase().includes(search.toLowerCase()) &&
      !r.id.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Change Requests
          </h2>
          <p className="text-sm text-slate-500">
            All client scope change requests across all types and statuses.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client or ID..."className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All Types</option>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Request ID",
                "Client",
                "Project",
                "Request Type",
                "Requested By",
                "Revenue Impact",
                "Departments Impacted",
                "Status",
                "Submitted",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className={`border-t border-slate-100 cursor-pointer transition-colors ${
                  selectedId === r.id
                    ? "bg-blue-50": "hover:bg-slate-50"}`}
                onClick={() => onSelect(r)}
              >
                <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700 whitespace-nowrap">
                  {r.id}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                  {r.client}
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap max-w-[140px] truncate">
                  {r.project}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeBadge(r.requestType)}`}
                  >
                    {r.requestType}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {r.requestedBy}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap ${revenueColor(r.revenueImpact)}`}
                >
                  {formatRevenue(r.revenueImpact)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {r.departmentsImpacted.slice(0, 2).map((d) => (
                      <span
                        key={d}
                        className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {d}
                      </span>
                    ))}
                    {r.departmentsImpacted.length > 2 && (
                      <span className="text-[10px] text-slate-400">
                        +{r.departmentsImpacted.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge(r.status)}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                  {r.submittedDate}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(r);
                    }}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-slate-400">
                  No change requests match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          {filtered.length} of {MOCK_CHANGE_REQUESTS.length} requests shown
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Client Context Panel
// ─────────────────────────────────────────────────────────────────────────────

function ClientContextPanel({ cr }: { cr: ChangeRequest }) {
  function healthColor(s: string) {
    const m: Record<string, string> = {
      Healthy: "text-emerald-700 bg-emerald-50 border-emerald-200",
      "Needs Attention": "text-amber-700 bg-amber-50 border-amber-200",
      "At-Risk": "text-orange-700 bg-orange-50 border-orange-200",
      Critical: "text-red-700 bg-red-50 border-red-200",
    };
    return m[s] ?? "text-slate-500 bg-slate-50 border-slate-200";
  }

  function riskColor(r: string) {
    const m: Record<string, string> = {
      Low: "text-emerald-700 bg-emerald-50 border-emerald-200",
      Medium: "text-amber-700 bg-amber-50 border-amber-200",
      High: "text-orange-700 bg-orange-50 border-orange-200",
      Critical: "text-red-700 bg-red-50 border-red-200",
    };
    return m[r] ?? "text-slate-500 bg-slate-50 border-slate-200";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
          Client Context
        </p>
        <h3 className="text-sm font-bold text-slate-900">{cr.client}</h3>
      </div>
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Health Score
            </p>
            <p className="text-xl font-bold text-slate-800 mt-1">
              {cr.clientHealthScore}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              MRR
            </p>
            <p className="text-xl font-bold text-emerald-700 mt-1">
              ${cr.clientMRR.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Health Status</span>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${healthColor(cr.clientHealthStatus)}`}
            >
              {cr.clientHealthStatus}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Renewal Risk</span>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskColor(cr.renewalRisk)}`}
            >
              {cr.renewalRisk}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Expansion</span>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskColor(cr.expansionOpportunity)}`}
            >
              {cr.expansionOpportunity}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">ARR</span>
            <span className="text-xs font-bold text-slate-700">
              ${cr.clientARR.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Open Escalations</span>
            <span
              className={`text-xs font-bold ${cr.openEscalations > 0 ? "text-red-600": "text-slate-500"}`}
            >
              {cr.openEscalations}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Open Projects</span>
            <span className="text-xs font-bold text-slate-700">
              {cr.openProjects}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Last Comms</span>
            <span className="text-xs text-slate-500">
              {cr.lastCommunication}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">
            AI Client Summary
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            {cr.aiClientSummary}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Impact Analysis
// ─────────────────────────────────────────────────────────────────────────────

function ImpactAnalysis({ cr }: { cr: ChangeRequest }) {
  const impactItems = [
    {
      label: "Revenue Impact",
      value: formatRevenue(cr.revenueImpact),
      color: cr.revenueImpact > 0 ? "text-emerald-700": cr.revenueImpact < 0 ? "text-red-700": "text-slate-500",
    },
    {
      label: "Department Impact",
      value: cr.departmentsImpacted.join(", "),
      color: "text-slate-700",
    },
    {
      label: "Projects Impacted",
      value: cr.projectsImpacted.join(", "),
      color: "text-slate-700",
    },
    {
      label: "Tasks Added",
      value: cr.tasksAdded > 0 ? `+${cr.tasksAdded}` : "—",
      color: cr.tasksAdded > 0 ? "text-emerald-700": "text-slate-500",
    },
    {
      label: "Tasks Removed",
      value: cr.tasksRemoved > 0 ? `-${cr.tasksRemoved}` : "—",
      color: cr.tasksRemoved > 0 ? "text-red-700": "text-slate-500",
    },
    {
      label: "Milestones Affected",
      value: cr.milestonesAffected > 0 ? cr.milestonesAffected : "—",
      color: "text-slate-700",
    },
    {
      label: "Contract Amendment",
      value: cr.contractAmendmentRequired ? "Required": "Not Required",
      color: cr.contractAmendmentRequired ? "text-amber-700": "text-slate-500",
    },
    {
      label: "Billing Approval",
      value: cr.billingApprovalStatus,
      color:
        cr.billingApprovalStatus === "Approved"? "text-emerald-700": cr.billingApprovalStatus === "Rejected"? "text-red-700": "text-amber-700",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
          Impact Analysis
        </p>
        <h3 className="text-sm font-bold text-slate-900">Impact Analysis</h3>
      </div>
      <div className="p-5 space-y-2">
        {impactItems.map(({ label, value, color }) => (
          <div key={label} className="flex items-start justify-between gap-2">
            <span className="text-xs text-slate-500 shrink-0">{label}</span>
            <span className={`text-xs font-semibold text-right ${color}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Type-Specific Detail Cards
// ─────────────────────────────────────────────────────────────────────────────

function TypeSpecificCard({ cr }: { cr: ChangeRequest }) {
  if (cr.requestType === "Budget Reallocation"&& cr.budgetLines) {
    return (
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 shadow-sm">
        <div className="border-b border-indigo-100 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
            Budget Reallocation
          </p>
          <h3 className="text-sm font-bold text-slate-900">
            Budget Breakdown
          </h3>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400">
                  <th className="text-left py-1 font-bold uppercase tracking-widest">
                    Service
                  </th>
                  <th className="text-right py-1 font-bold uppercase tracking-widest">
                    Current
                  </th>
                  <th className="text-right py-1 font-bold uppercase tracking-widest">
                    Proposed
                  </th>
                  <th className="text-right py-1 font-bold uppercase tracking-widest">
                    Diff
                  </th>
                </tr>
              </thead>
              <tbody>
                {cr.budgetLines.map((line) => (
                  <tr
                    key={line.service}
                    className="border-t border-indigo-100">
                    <td className="py-2 font-semibold text-slate-700">
                      {line.service}
                    </td>
                    <td className="py-2 text-right text-slate-600">
                      ${line.currentBudget.toLocaleString()}
                    </td>
                    <td className="py-2 text-right text-slate-600">
                      ${line.proposedBudget.toLocaleString()}
                    </td>
                    <td
                      className={`py-2 text-right font-bold ${line.difference > 0 ? "text-emerald-700": "text-red-700"}`}
                    >
                      {line.difference > 0 ? "+": ""}$
                      {line.difference.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (
    cr.requestType === "Service Addition"||
    cr.requestType === "Service Removal") {
    const isAddition = cr.requestType === "Service Addition";
    return (
      <div
        className={`rounded-2xl border shadow-sm ${isAddition ? "border-cyan-200 bg-cyan-50": "border-red-200 bg-red-50"}`}
      >
        <div
          className={`border-b px-5 py-3 ${isAddition ? "border-cyan-100": "border-red-100"}`}
        >
          <p
            className={`text-[10px] font-bold uppercase tracking-widest ${isAddition ? "text-cyan-600": "text-red-600"}`}
          >
            {cr.requestType}
          </p>
          <h3 className="text-sm font-bold text-slate-900">
            Service Details
          </h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">
              {isAddition ? "Service Added": "Service Removed"}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {isAddition ? cr.serviceAdded : cr.serviceRemoved}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Revenue Impact</span>
            <span
              className={`text-xs font-bold ${isAddition ? "text-emerald-700": "text-red-700"}`}
            >
              {formatRevenue(cr.revenueImpact)}
            </span>
          </div>
          {(cr.newDeliverables || cr.removedDeliverables) && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                {isAddition ? "New Deliverables": "Removed Deliverables"}
              </p>
              <div className="flex flex-wrap gap-1">
                {(isAddition ? cr.newDeliverables : cr.removedDeliverables)?.map(
                  (d) => (
                    <span
                      key={d}
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${isAddition ? "border-cyan-200 bg-white text-cyan-700": "border-red-200 bg-white text-red-700"}`}
                    >
                      {d}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Contract Amendment</span>
            <span
              className={`text-xs font-bold ${cr.contractAmendmentRequired ? "text-amber-700": "text-slate-500"}`}
            >
              {cr.contractAmendmentRequired ? "Required": "Not Required"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (
    cr.requestType === "Service Upgrade"||
    cr.requestType === "Service Downgrade") {
    const isUpgrade = cr.requestType === "Service Upgrade";
    return (
      <div
        className={`rounded-2xl border shadow-sm ${isUpgrade ? "border-emerald-200 bg-emerald-50": "border-orange-200 bg-orange-50"}`}
      >
        <div
          className={`border-b px-5 py-3 ${isUpgrade ? "border-emerald-100": "border-orange-100"}`}
        >
          <p
            className={`text-[10px] font-bold uppercase tracking-widest ${isUpgrade ? "text-emerald-600": "text-orange-600"}`}
          >
            {cr.requestType}
          </p>
          <h3 className="text-sm font-bold text-slate-900">Package Change</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Current Package
              </p>
              <p className="text-xs font-semibold text-slate-700">
                {cr.currentPackage}
              </p>
            </div>
            <div
              className={`rounded-xl border p-3 ${isUpgrade ? "border-emerald-200 bg-emerald-100": "border-orange-200 bg-orange-100"}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                New Package
              </p>
              <p className="text-xs font-semibold text-slate-700">
                {cr.newPackage}
              </p>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Revenue Impact</span>
            <span
              className={`text-xs font-bold ${isUpgrade ? "text-emerald-700": "text-red-700"}`}
            >
              {formatRevenue(cr.revenueImpact)}
            </span>
          </div>
          {(cr.newDeliverables || cr.removedDeliverables) && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                {isUpgrade ? "New Deliverables": "Removed Deliverables"}
              </p>
              <div className="flex flex-wrap gap-1">
                {(isUpgrade ? cr.newDeliverables : cr.removedDeliverables)?.map(
                  (d) => (
                    <span
                      key={d}
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${isUpgrade ? "border-emerald-200 bg-white text-emerald-700": "border-orange-200 bg-white text-orange-700"}`}
                    >
                      {d}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
          {cr.additionalDepartments && cr.additionalDepartments.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Additional Departments
              </p>
              <div className="flex flex-wrap gap-1">
                {cr.additionalDepartments.map((d) => (
                  <span
                    key={d}
                    className="inline-flex rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (cr.requestType === "Pause"|| cr.requestType === "Reactivation") {
    const isPause = cr.requestType === "Pause";
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {cr.requestType}
          </p>
          <h3 className="text-sm font-bold text-slate-900">
            {isPause ? "Pause Details": "Reactivation Details"}
          </h3>
        </div>
        <div className="p-5 space-y-2">
          {isPause && (
            <>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Pause Start</span>
                <span className="text-xs font-bold text-slate-700">
                  {cr.pauseStartDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Pause End</span>
                <span className="text-xs font-bold text-slate-700">
                  {cr.pauseEndDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Reason</span>
                <span className="text-xs text-slate-600 text-right max-w-[180px]">
                  {cr.pauseReason}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Billing Impact</span>
            <span className="text-xs font-bold text-red-700">
              {formatRevenue(cr.revenueImpact)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Departments Affected</span>
            <span className="text-xs text-slate-600">
              {cr.departmentsImpacted.join(", ")}
            </span>
          </div>
          {cr.reactivationPlan && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 mt-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">
                Reactivation Plan
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                {cr.reactivationPlan}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (cr.requestType === "Contract Amendment") {
    return (
      <div className="rounded-2xl border border-violet-200 bg-violet-50 shadow-sm">
        <div className="border-b border-violet-100 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
            Contract Amendment
          </p>
          <h3 className="text-sm font-bold text-slate-900">
            Contract Details
          </h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Current Contract
            </p>
            <p className="text-xs text-slate-700">{cr.currentContract}</p>
          </div>
          <div className="rounded-xl border border-violet-200 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1">
              Proposed Contract
            </p>
            <p className="text-xs text-slate-700">{cr.proposedContract}</p>
          </div>
          {cr.effectiveDate && (
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Effective Date</span>
              <span className="text-xs font-bold text-slate-700">
                {cr.effectiveDate}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Revenue Change</span>
            <span className={`text-xs font-bold ${revenueColor(cr.revenueImpact)}`}>
              {formatRevenue(cr.revenueImpact)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Approval Status</span>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge(cr.status)}`}
            >
              {cr.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Custom Scope Change
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
      <div className="border-b border-amber-100 px-5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
          Custom Scope Change
        </p>
        <h3 className="text-sm font-bold text-slate-900">Scope Details</h3>
      </div>
      <div className="p-5 space-y-2">
        <p className="text-xs text-slate-700 leading-relaxed">{cr.description}</p>
        <div className="flex justify-between pt-1">
          <span className="text-xs text-slate-500">Revenue Impact</span>
          <span className={`text-xs font-bold ${revenueColor(cr.revenueImpact)}`}>
            {formatRevenue(cr.revenueImpact)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Departments</span>
          <span className="text-xs text-slate-600">
            {cr.departmentsImpacted.join(", ")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Tasks Added</span>
          <span className="text-xs font-bold text-emerald-700">
            +{cr.tasksAdded}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Billing Impact
// ─────────────────────────────────────────────────────────────────────────────

function BillingImpact({ cr }: { cr: ChangeRequest }) {
  const items = [
    {
      label: "MRR Change",
      value: formatRevenue(cr.mrrChange),
      color: revenueColor(cr.mrrChange),
    },
    {
      label: "ARR Change",
      value:
        cr.arrChange !== 0
          ? `${cr.arrChange > 0 ? "+": ""}$${Math.abs(cr.arrChange).toLocaleString()}/yr`
          : "—",
      color: revenueColor(cr.arrChange),
    },
    {
      label: "One-Time Fees",
      value: cr.oneTimeFees > 0 ? `$${cr.oneTimeFees.toLocaleString()}` : "—",
      color: "text-slate-700",
    },
    {
      label: "Credits",
      value: cr.credits > 0 ? `$${cr.credits.toLocaleString()}` : "—",
      color: "text-emerald-700",
    },
    {
      label: "Adjustments",
      value:
        cr.adjustments !== 0
          ? `${cr.adjustments > 0 ? "+": ""}$${Math.abs(cr.adjustments).toLocaleString()}`
          : "—",
      color: revenueColor(cr.adjustments),
    },
    {
      label: "Billing Approval",
      value: cr.billingApprovalStatus,
      color:
        cr.billingApprovalStatus === "Approved"? "text-emerald-700": cr.billingApprovalStatus === "Rejected"? "text-red-700": "text-amber-700",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
          Billing Impact
        </p>
        <h3 className="text-sm font-bold text-slate-900">Billing Impact</h3>
      </div>
      <div className="p-5 space-y-2">
        {items.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{label}</span>
            <span className={`text-xs font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Project Impact
// ─────────────────────────────────────────────────────────────────────────────

function ProjectImpact({ cr }: { cr: ChangeRequest }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">
          Project Impact
        </p>
        <h3 className="text-sm font-bold text-slate-900">Project Impact</h3>
      </div>
      <div className="p-5 space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Projects Affected
          </p>
          <div className="flex flex-wrap gap-1">
            {cr.projectsImpacted.map((p) => (
              <span
                key={p}
                className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-700">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Tasks Added
            </p>
            <p
              className={`text-lg font-bold mt-1 ${cr.tasksAdded > 0 ? "text-emerald-700": "text-slate-400"}`}
            >
              {cr.tasksAdded > 0 ? `+${cr.tasksAdded}` : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Tasks Removed
            </p>
            <p
              className={`text-lg font-bold mt-1 ${cr.tasksRemoved > 0 ? "text-red-700": "text-slate-400"}`}
            >
              {cr.tasksRemoved > 0 ? `-${cr.tasksRemoved}` : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Milestones
            </p>
            <p className="text-lg font-bold mt-1 text-slate-700">
              {cr.milestonesAffected > 0 ? cr.milestonesAffected : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Departments
            </p>
            <p className="text-lg font-bold mt-1 text-slate-700">
              {cr.departmentsImpacted.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Approval Workflow
// ─────────────────────────────────────────────────────────────────────────────

function ApprovalWorkflow({ cr }: { cr: ChangeRequest }) {
  function approvalBadge(status: string) {
    const m: Record<string, string> = {
      Pending: "bg-slate-100 text-slate-500 border-slate-200",
      "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
      Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
      "Not Required": "bg-slate-50 text-slate-400 border-slate-100",
    };
    return m[status] ?? "bg-slate-100 text-slate-500 border-slate-200";
  }

  function stepDot(status: string) {
    if (status === "Approved") return "bg-emerald-500";
    if (status === "Rejected") return "bg-red-500";
    if (status === "In Progress") return "bg-amber-500";
    return "bg-slate-300";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
          Approval Workflow
        </p>
        <h3 className="text-base font-bold text-slate-900">
          Approval Workflow
        </h3>
      </div>
      <div className="p-5">
        <div className="space-y-4">
          {cr.approvalWorkflow.map((step, i) => (
            <div key={step.stage} className="flex gap-4">
              {/* Dot + line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full mt-0.5 ${stepDot(step.status)}`}
                />
                {i < cr.approvalWorkflow.length - 1 && (
                  <div className="w-px flex-1 bg-slate-200 mt-1"/>
                )}
              </div>
              {/* Content */}
              <div className="pb-4 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {step.stage}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {step.assignee}
                    </p>
                    {step.completedDate && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {step.completedDate}
                      </p>
                    )}
                    {step.notes && (
                      <p className="text-[11px] text-slate-600 mt-1 italic">
                        {step.notes}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${approvalBadge(step.status)}`}
                  >
                    {step.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation Center
// ─────────────────────────────────────────────────────────────────────────────

function ImplementationCenter({ cr }: { cr: ChangeRequest }) {
  function implBadge(status: string) {
    const m: Record<string, string> = {
      Pending: "bg-slate-100 text-slate-500 border-slate-200",
      "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
      Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      "Not Required": "bg-slate-50 text-slate-400 border-slate-100",
    };
    return m[status] ?? "bg-slate-100 text-slate-500 border-slate-200";
  }

  function implDot(status: string) {
    if (status === "Completed") return "bg-emerald-500";
    if (status === "In Progress") return "bg-amber-500";
    if (status === "Not Required") return "bg-slate-200";
    return "bg-slate-300";
  }

  const overallBadge = {
    "Not Started": "bg-slate-100 text-slate-500 border-slate-200",
    "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
    Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  }[cr.implementationStatus];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
            Implementation Center
          </p>
          <h3 className="text-base font-bold text-slate-900">
            Implementation Center
          </h3>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${overallBadge}`}
        >
          {cr.implementationStatus}
        </span>
      </div>
      <div className="p-5 space-y-3">
        {cr.implementationItems.map((item) => (
          <div
            key={item.area}
            className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${implDot(item.status)}`}
              />
              <span className="text-sm text-slate-700">{item.area}</span>
            </div>
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${implBadge(item.status)}`}
            >
              {item.status}
            </span>
          </div>
        ))}
        {cr.implementationCompletedDate && (
          <div className="rounded-xl border border-teal-100 bg-teal-50 p-3 mt-2">
            <p className="text-xs font-semibold text-teal-700">
              Completed: {cr.implementationCompletedDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Change Analysis
// ─────────────────────────────────────────────────────────────────────────────

function AIChangeAnalysis({ cr }: { cr: ChangeRequest }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 shadow-sm">
      <div className="border-b border-blue-100 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
          AI Change Analysis
        </p>
        <h3 className="text-base font-bold text-slate-900">
          AI Change Analysis
        </h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="rounded-xl border border-blue-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-2">
            Impact Assessment
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            {cr.aiImpactAssessment}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
            Risk Assessment
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            {cr.aiRiskAssessment}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">
            Recommended Actions
          </p>
          <ul className="space-y-1">
            {cr.aiRecommendedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="text-emerald-500 font-bold mt-0.5">
                  {i + 1}.
                </span>
                {action}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-violet-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-2">
            Implementation Plan
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            {cr.aiImplementationPlan}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity Timeline
// ─────────────────────────────────────────────────────────────────────────────

function ActivityTimeline({ cr }: { cr: ChangeRequest }) {
  const eventColors: Record<string, string> = {
    "Request Created": "bg-blue-500",
    "Request Created (Draft)": "bg-slate-400",
    "Review Started": "bg-amber-500",
    "Department Approval": "bg-indigo-500",
    "Approval Requested": "bg-violet-500",
    "Billing Approval Requested": "bg-violet-500",
    "Billing Approval": "bg-violet-500",
    "Final Approval": "bg-emerald-500",
    "Executive Approval": "bg-teal-500",
    "Billing Updated": "bg-emerald-600",
    "Contract Updated": "bg-violet-600",
    "Projects Updated": "bg-cyan-500",
    "Request Implemented": "bg-teal-600",
    "Request Rejected": "bg-red-500",
  };

  function dotColor(event: string): string {
    for (const [key, color] of Object.entries(eventColors)) {
      if (event.includes(key)) return color;
    }
    return "bg-slate-400";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Activity
        </p>
        <h3 className="text-base font-bold text-slate-900">
          Activity Timeline
        </h3>
      </div>
      <div className="p-5">
        <div className="space-y-4">
          {cr.activityTimeline.map((evt, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1 ${dotColor(evt.event)}`}
                />
                {i < cr.activityTimeline.length - 1 && (
                  <div className="w-px flex-1 bg-slate-200 mt-1"/>
                )}
              </div>
              <div className="pb-4 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {evt.event}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {evt.actor} · {evt.date}
                </p>
                {evt.note && (
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    {evt.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail Panel (right side when a CR is selected)
// ─────────────────────────────────────────────────────────────────────────────

type DetailTab =
  | "overview"| "impact"| "billing"| "projects"| "approval"| "implementation"| "ai"| "timeline";

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: "overview", label: "Overview"},
  { id: "impact", label: "Impact Analysis"},
  { id: "billing", label: "Billing Impact"},
  { id: "projects", label: "Project Impact"},
  { id: "approval", label: "Approval Workflow"},
  { id: "implementation", label: "Implementation"},
  { id: "ai", label: "AI Analysis"},
  { id: "timeline", label: "Timeline"},
];

function DetailPanel({ cr }: { cr: ChangeRequest }) {
  const [tab, setTab] = useState<DetailTab>("overview");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-bold text-blue-600">{cr.id}</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {cr.client}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{cr.project}</p>
            <p className="text-xs text-slate-400 mt-1">
              Assigned AM: {cr.assignedAM} · Submitted: {cr.submittedDate}
              {cr.effectiveDate && ` · Effective: ${cr.effectiveDate}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-start">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${typeBadge(cr.requestType)}`}
            >
              {cr.requestType}
            </span>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusBadge(cr.status)}`}
            >
              {cr.status}
            </span>
            {cr.revenueImpact !== 0 && (
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${cr.revenueImpact > 0 ? "bg-emerald-100 border-emerald-200 text-emerald-700": "bg-red-100 border-red-200 text-red-700"}`}
              >
                {formatRevenue(cr.revenueImpact)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-0 bg-white rounded-t-xl border border-b-0 px-4 pt-3">
        {DETAIL_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg border border-b-0 px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === t.id
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10": "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {tab === "overview"&& (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Description
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {cr.description}
                </p>
              </div>
              <TypeSpecificCard cr={cr} />
            </>
          )}
          {tab === "impact"&& <ImpactAnalysis cr={cr} />}
          {tab === "billing"&& <BillingImpact cr={cr} />}
          {tab === "projects"&& <ProjectImpact cr={cr} />}
          {tab === "approval"&& <ApprovalWorkflow cr={cr} />}
          {tab === "implementation"&& <ImplementationCenter cr={cr} />}
          {tab === "ai"&& <AIChangeAnalysis cr={cr} />}
          {tab === "timeline"&& <ActivityTimeline cr={cr} />}
        </div>

        {/* Side panels */}
        <div className="space-y-4">
          <ClientContextPanel cr={cr} />
          {tab === "overview"&& (
            <>
              <ImpactAnalysis cr={cr} />
              <BillingImpact cr={cr} />
            </>
          )}
          {tab === "impact"&& (
            <>
              <TypeSpecificCard cr={cr} />
              <BillingImpact cr={cr} />
            </>
          )}
          {tab === "billing"&& (
            <>
              <TypeSpecificCard cr={cr} />
            </>
          )}
          {tab === "projects"&& (
            <>
              <ImpactAnalysis cr={cr} />
            </>
          )}
          {tab === "approval"&& (
            <>
              <ImplementationCenter cr={cr} />
            </>
          )}
          {tab === "implementation"&& (
            <>
              <ApprovalWorkflow cr={cr} />
            </>
          )}
          {tab === "ai"&& (
            <>
              <ImpactAnalysis cr={cr} />
            </>
          )}
          {tab === "timeline"&& (
            <>
              <ImplementationCenter cr={cr} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

type PageTab = "dashboard"| "detail";

export default function ChangeRequestsPage() {
  const [selectedCR, setSelectedCR] = useState<ChangeRequest | null>(null);
  const [pageTab, setPageTab] = useState<PageTab>("dashboard");

  function handleSelect(cr: ChangeRequest) {
    setSelectedCR(cr);
    setPageTab("detail");
  }

  function handleBack() {
    setPageTab("dashboard");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Account Management
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            Change Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Central management layer for all client scope changes — budget
            reallocations, service upgrades, downgrades, additions, removals,
            pauses, reactivations, contract amendments, and custom scope
            changes.
          </p>
        </div>
        {pageTab === "detail"&& (
          <button
            onClick={handleBack}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap shadow-sm">
            Back to Dashboard
          </button>
        )}
      </div>

      {pageTab === "dashboard"&& (
        <>
          <KPICards />
          <ChangeRequestTable
            onSelect={handleSelect}
            selectedId={selectedCR?.id ?? null}
          />
        </>
      )}

      {pageTab === "detail"&& selectedCR && (
        <DetailPanel cr={selectedCR} />
      )}
    </div>
  );
}
