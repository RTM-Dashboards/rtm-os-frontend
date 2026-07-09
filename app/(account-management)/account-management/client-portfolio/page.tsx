"use client";

/**
 * AM Client Portfolio
 *
 * DATA SOURCE: lib/mock/master-clients.ts (MASTER_CLIENTS — 20 clients)
 *   Same source as Billing's Client Portfolio and Admin's Clients page.
 *
 * SCOPE — AM reads/displays only. AM-owned fields:
 *   assignedAM, activationStatus, onboardingStatus, renewalDate, renewalStatus
 *
 * READ-ONLY (never editable from this page):
 *   clientHealth, priority         — computed fields
 *   activeServices, monthlyValue   — Billing-owned
 *   billingOwner                   — Billing-owned
 *   cleared, billingStatus, etc.   — Billing-owned
 *   salesStatus, salesOwner        — Sales-owned
 *
 * FIELD GAP NOTE (Phase 1):
 *   The old PORTFOLIO_CLIENTS mock had primaryContact, location, projectCount,
 *   healthScore (numeric), and startDate — none of these exist on MASTER_CLIENTS.
 *   These fields are dropped in this migration; no data is fabricated to fill them.
 *   They can be added to MASTER_CLIENTS in a later phase if needed.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MASTER_CLIENTS, computeHealth, computePriority } from "@/lib/mock/master-clients";
import type { MasterClient, ActivationStatus, HealthStatus, Priority } from "@/lib/mock/master-clients";
import { KpiCard, StatusBadge } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";

// ─── Badge variant helpers ────────────────────────────────────────────────────

function activationStatusVariant(s: ActivationStatus): StatusVariant {
  switch (s) {
    case "Active":                        return "active";
    case "Ready for Onboarding":          return "approved";
    case "AM Assignment Needed":          return "warning";
    case "Onboarding Pending":            return "pending";
    case "Department Activation Pending": return "review";
    case "Not Started":                   return "neutral";
    default:                              return "neutral";
  }
}

function onboardingStatusVariant(s: string): StatusVariant {
  switch (s) {
    case "Completed":    return "completed";
    case "In Progress":  return "review";
    case "Pending":      return "pending";
    case "Not Started":  return "neutral";
    default:             return "neutral";
  }
}

function healthVariant(h: HealthStatus): StatusVariant {
  switch (h) {
    case "Excellent": return "healthy";
    case "Good":      return "info";
    case "At Risk":   return "at-risk";
    case "Critical":  return "critical";
    default:          return "neutral";
  }
}

function priorityVariant(p: Priority): StatusVariant {
  switch (p) {
    case "High":   return "error";
    case "Medium": return "warning";
    case "Low":    return "success";
    default:       return "neutral";
  }
}

function renewalStatusVariant(s: string): StatusVariant {
  switch (s) {
    case "Active":            return "active";
    case "Schedule Pending":  return "warning";
    case "At Risk":           return "at-risk";
    case "Cancelled":         return "cancelled";
    default:                  return "neutral";
  }
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

type ClearedFilter = "All" | "Cleared" | "Not Cleared";

const ACTIVATION_STATUSES: ActivationStatus[] = [
  "Active",
  "Ready for Onboarding",
  "AM Assignment Needed",
  "Onboarding Pending",
  "Department Activation Pending",
  "Not Started",
];

const HEALTH_STATUSES: HealthStatus[] = ["Excellent", "Good", "At Risk", "Critical"];

// ─── Page component ───────────────────────────────────────────────────────────

export default function AMClientPortfolioPage() {
  const [search, setSearch] = useState("");
  const [activationFilter, setActivationFilter] = useState<ActivationStatus | "All">("All");
  const [healthFilter, setHealthFilter] = useState<HealthStatus | "All">("All");
  const [amFilter, setAmFilter] = useState<string>("All");
  const [clearedFilter, setClearedFilter] = useState<ClearedFilter>("All");
  const [liveClients, setLiveClients] = useState<MasterClient[]>(MASTER_CLIENTS);

  useEffect(() => {
    fetch("/api/master-clients").then((r) => r.ok ? r.json() : null).then((d: { clients: MasterClient[] } | null) => {
      if (d?.clients) setLiveClients(d.clients);
    }).catch(() => {/* keep seed */});
  }, []);

  // Derive all unique AM names for filter
  const amNames = Array.from(
    new Set(liveClients.map((c) => c.assignedAM).filter((am) => am !== "Unassigned"))
  ).sort();

  // Apply filters
  const filtered = liveClients.filter((c) => {
    const health = computeHealth(c);
    const q = search.toLowerCase();

    const matchesSearch =
      !q ||
      c.clientName.toLowerCase().includes(q) ||
      c.assignedAM.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.activeServices.some((s) => s.toLowerCase().includes(q)) ||
      c.activationStatus.toLowerCase().includes(q);

    const matchesActivation =
      activationFilter === "All" || c.activationStatus === activationFilter;

    const matchesHealth = healthFilter === "All" || health === healthFilter;

    const matchesAM = amFilter === "All" || c.assignedAM === amFilter;
    const matchesCleared =
      clearedFilter === "All" ||
      (clearedFilter === "Cleared" && c.cleared === true) ||
      (clearedFilter === "Not Cleared" && c.cleared === false);

    return matchesSearch && matchesActivation && matchesHealth && matchesAM && matchesCleared;
  });

  // KPIs
  const total = liveClients.length;
  const activeCount = liveClients.filter((c) => c.activationStatus === "Active").length;
  const onboardingCount = liveClients.filter(
    (c) =>
      c.activationStatus === "Onboarding Pending" ||
      c.activationStatus === "Department Activation Pending" ||
      c.activationStatus === "Ready for Onboarding"
  ).length;
  const needsAssignment = liveClients.filter(
    (c) => c.activationStatus === "AM Assignment Needed"
  ).length;
  const atRiskCount = liveClients.filter(
    (c) => computeHealth(c) === "At Risk" || computeHealth(c) === "Critical"
  ).length;
  const totalMrr = liveClients.filter((c) => c.monthlyValue > 0).reduce(
    (sum, c) => sum + c.monthlyValue,
    0
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Client Portfolio</h1>
        <p className="text-sm text-slate-500 mt-1">
          All 20 clients from the shared master client list — AM status, onboarding progress,
          renewals, and health. Billing-owned fields (services, MRR, billing status) are read-only.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Total Clients"    value={String(total)} />
        <KpiCard title="Active"           value={String(activeCount)} />
        <KpiCard title="In Onboarding"    value={String(onboardingCount)} />
        <KpiCard title="Needs Assignment" value={String(needsAssignment)}
          risk={needsAssignment > 0 ? "at-risk" : "healthy"} />
        <KpiCard title="At Risk / Critical" value={String(atRiskCount)}
          risk={atRiskCount > 0 ? "at-risk" : "healthy"} />
        <KpiCard title="Active MRR"       value={`$${totalMrr.toLocaleString()}`} />
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search clients, AM, industry, services…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] max-w-sm rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        {/* Activation Status filter */}
        <select
          value={activationFilter}
          onChange={(e) => setActivationFilter(e.target.value as ActivationStatus | "All")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="All">All Statuses</option>
          {ACTIVATION_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Health filter */}
        <select
          value={healthFilter}
          onChange={(e) => setHealthFilter(e.target.value as HealthStatus | "All")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="All">All Health</option>
          {HEALTH_STATUSES.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        {/* Cleared filter */}
        <select
          value={clearedFilter}
          onChange={(e) => setClearedFilter(e.target.value as ClearedFilter)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="All">All (Cleared + Not Cleared)</option>
          <option value="Cleared">Cleared by Billing</option>
          <option value="Not Cleared">Not Yet Cleared</option>
        </select>

        {/* AM filter */}
        <select
          value={amFilter}
          onChange={(e) => setAmFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="All">All AMs</option>
          <option value="Unassigned">Unassigned</option>
          {amNames.map((am) => (
            <option key={am} value={am}>{am}</option>
          ))}
        </select>

        <span className="text-sm text-slate-400 whitespace-nowrap">{filtered.length} clients</span>
      </div>

      {/* Activation status tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {(["All", ...ACTIVATION_STATUSES] as (ActivationStatus | "All")[]).map((s) => (
          <button
            key={s}
            onClick={() => setActivationFilter(s)}
            className={`rounded-t-lg border border-b-0 px-3 py-2 text-xs font-semibold transition-colors ${
              activationFilter === s
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {s}
            {s !== "All" && (
              <span className="ml-1 text-[10px] text-slate-400">
                ({liveClients.filter((c) => c.activationStatus === s).length})
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
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Cleared</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned AM</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Activation Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Onboarding</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Active Services</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">MRR</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Health</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Renewal</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Billing Owner</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Next Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-sm text-slate-400">
                  No clients match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Showing {filtered.length} of {total} clients
          </span>
          <span className="text-xs text-slate-400 italic">
            Active Services, MRR, Billing Owner, and Cleared flag are Billing-owned — read-only.
            Cleared = Billing has confirmed payment, activated services, and handed off to AM.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function ClientRow({ client }: { client: MasterClient }) {
  const health = computeHealth(client);
  const priority = computePriority(health, client.billingStatus);

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      {/* Client name + industry */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: client.avatarColor }}
          >
            {client.clientName.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-slate-900 whitespace-nowrap">{client.clientName}</p>
            <p className="text-[11px] text-slate-400">{client.industry}</p>
          </div>
        </div>
      </td>

      {/* Cleared — Billing-owned, read-only */}
      <td className="px-4 py-3 whitespace-nowrap">
        {client.cleared ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            Cleared
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
            Not Cleared
          </span>
        )}
      </td>

      {/* Assigned AM */}
      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
        {client.assignedAM === "Unassigned" ? (
          <span className="text-slate-400 italic text-xs">Unassigned</span>
        ) : (
          client.assignedAM
        )}
      </td>

      {/* Activation Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge
          variant={activationStatusVariant(client.activationStatus)}
          label={client.activationStatus}
          size="sm"
        />
      </td>

      {/* Onboarding Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge
          variant={onboardingStatusVariant(client.onboardingStatus)}
          label={client.onboardingStatus}
          size="sm"
        />
      </td>

      {/* Active Services — read-only, billing-owned */}
      <td className="px-4 py-3">
        {client.activeServices.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {client.activeServices.map((s) => (
              <span
                key={s}
                className="inline-block rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
              >
                {s}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">No services yet</span>
        )}
      </td>

      {/* MRR — read-only, billing-owned */}
      <td className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">
        {client.monthlyValue > 0 ? `$${client.monthlyValue.toLocaleString()}` : "—"}
      </td>

      {/* Health */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge
          variant={healthVariant(health)}
          label={health}
          size="sm"
        />
      </td>

      {/* Priority */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge
          variant={priorityVariant(priority)}
          label={priority}
          size="sm"
        />
      </td>

      {/* Renewal */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <StatusBadge
            variant={renewalStatusVariant(client.renewalStatus)}
            label={client.renewalStatus}
            size="sm"
          />
          {client.renewalDate && client.renewalDate !== "—" && (
            <span className="text-[10px] text-slate-400">{client.renewalDate}</span>
          )}
        </div>
      </td>

      {/* Billing Owner — read-only */}
      <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-sm">
        {client.billingOwner}
      </td>

      {/* Next Required Action */}
      <td className="px-4 py-3 text-xs text-slate-500 max-w-[180px]">
        {client.nextRequiredAction || "—"}
      </td>
    </tr>
  );
}
