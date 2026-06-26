"use client";

import React, { useState } from "react";
import {
  PORTFOLIO_CLIENTS,
  type PortfolioClient,
  type ClientStatus,
  type HealthStatus,
  type RenewalStatus,
} from "@/lib/account-management/am-client-success-data";

// ── Badge helpers ─────────────────────────────────────────────────────────────

function statusBadgeStyle(status: ClientStatus): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    Active:                 { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" },
    Onboarding:             { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
    Expansion:              { background: "#F0F9FF", color: "#0369A1", borderColor: "#BAE6FD" },
    Renewal:                { background: "#EFF6FF", color: "#3B82F6", borderColor: "#BFDBFE" },
    "At Risk":              { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },
    "Cancellation Requested":{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" },
    Offboarding:            { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" },
    Archived:               { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" },
    Prospect:               { background: "#EFF6FF", color: "#3B82F6", borderColor: "#BFDBFE" },
  };
  return map[status] ?? { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
}

function renewalBadgeStyle(status: RenewalStatus): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    "Not Started": { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" },
    "In Progress": { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
    Renewed:       { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" },
    "At Risk":     { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },
    Declined:      { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" },
  };
  return map[status] ?? { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
}

function healthColor(score: number): string {
  if (score >= 80) return "#059669";
  if (score >= 60) return "#B45309";
  return "#DC2626";
}

function healthStatusBadgeStyle(status: HealthStatus): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    Healthy:   { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" },
    Monitor:   { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
    "At Risk": { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },
    Critical:  { background: "#FEF2F2", color: "#991B1B", borderColor: "#FECACA" },
  };
  return map[status] ?? { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
}

function fmt(n: number, prefix = "$"): string {
  return `${prefix}${n.toLocaleString()}`;
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
      <p className="mt-1.5 text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{sub}</p>}
    </div>
  );
}

// ── All client statuses for filter tabs ──────────────────────────────────────

const ALL_STATUSES: ClientStatus[] = [
  "Active",
  "Onboarding",
  "Expansion",
  "Renewal",
  "At Risk",
  "Cancellation Requested",
  "Offboarding",
  "Archived",
  "Prospect",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClientPortfolioPage() {
  const [activeStatus, setActiveStatus] = useState<ClientStatus | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = PORTFOLIO_CLIENTS.filter((c) => {
    const matchesStatus = activeStatus === "All"|| c.status === activeStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.accountManager.toLowerCase().includes(q) ||
      c.primaryContact.toLowerCase().includes(q) ||
      c.services.some((s) => s.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  // KPIs
  const total = PORTFOLIO_CLIENTS.length;
  const active = PORTFOLIO_CLIENTS.filter((c) => c.status === "Active").length;
  const atRisk = PORTFOLIO_CLIENTS.filter((c) => c.healthStatus === "At Risk").length;
  const critical = PORTFOLIO_CLIENTS.filter((c) => c.healthStatus === "Critical").length;
  const avgHealth = Math.round(
    PORTFOLIO_CLIENTS.reduce((a, c) => a + c.healthScore, 0) / total
  );
  const totalMrr = PORTFOLIO_CLIENTS.reduce((a, c) => a + c.mrr, 0);
  const totalArr = PORTFOLIO_CLIENTS.reduce((a, c) => a + c.arr, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Client Portfolio</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete view of all clients — health, renewals, revenue, and account status.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard label="Total Clients"value={total} />
        <KpiCard label="Active" value={active} />
        <KpiCard label="At Risk" value={atRisk} />
        <KpiCard label="Critical" value={critical} />
        <KpiCard label="Avg Health Score" value={`${avgHealth}%`} />
        <KpiCard label="Total MRR" value={fmt(totalMrr)} />
        <KpiCard label="Total ARR" value={fmt(totalArr)} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"placeholder="Search clients, managers, services…"value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
        <span className="text-sm text-slate-400">{filtered.length} clients</span>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {(["All", ...ALL_STATUSES] as (ClientStatus | "All")[]).map((s) => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`rounded-t-lg border border-b-0 px-3 py-2 text-xs font-semibold transition-colors ${
              activeStatus === s
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10": "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {s}
            {s !== "All"&& (
              <span className="ml-1 text-[10px] text-slate-400">
                ({PORTFOLIO_CLIENTS.filter((c) => c.status === s).length})
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
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Primary Contact</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Account Manager</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Services</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Projects</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Health</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Renewal</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">MRR</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">ARR</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-sm text-slate-400">
                  No clients match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-400">
          Showing {filtered.length} of {total} clients
        </div>
      </div>
    </div>
  );
}

function ClientRow({ client }: { client: PortfolioClient }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-semibold text-slate-900">{client.name}</p>
          <p className="text-xs text-slate-400">{client.industry} · {client.location}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-700">{client.primaryContact}</td>
      <td className="px-4 py-3 text-slate-700">{client.accountManager}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {client.services.map((s) => (
            <span
              key={s}
              className="inline-block rounded-md bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
              {s}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-center text-slate-700">{client.projectCount}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: healthColor(client.healthScore) }}>
            {client.healthScore}
          </span>
          <span
            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold"
            style={healthStatusBadgeStyle(client.healthStatus)}
          >
            {client.healthStatus}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold"
          style={renewalBadgeStyle(client.renewalStatus)}
        >
          {client.renewalStatus}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(client.mrr)}</td>
      <td className="px-4 py-3 text-right text-slate-600">{fmt(client.arr)}</td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold"
          style={statusBadgeStyle(client.status)}
        >
          {client.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <button className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
          View
        </button>
      </td>
    </tr>
  );
}
