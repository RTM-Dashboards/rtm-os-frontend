"use client";

/**
 * AM Client Portfolio
 *
 * DATA SOURCE: /api/clients + /api/businesses (Postgres via Prisma).
 * One row per Business (domain). A client with multiple domains has one row per domain.
 * No mock data. No fallback. An empty table means zero real records exist.
 *
 * SCOPE — AM-owned fields (read + write from this page):
 *   assignedAM, activationStatus, onboardingStatus, renewalDate, renewalStatus,
 *   kickoffCompleted, kickoffDate, assignedAt
 *
 * READ-ONLY (displayed, never edited from here):
 *   activeServices, monthlyValue  — Billing-owned
 *   invoiceStatus, paymentStatus  — Billing-owned
 *   cleared                       — Billing-owned
 *
 * ROLE SCOPING:
 *   - Department Head: all businesses (default), AM filter for individual drill-down.
 *   - Account Manager: filtered to businesses where assignedAM === SARAH.
 */

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, StatusBadge } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";
import { RoleToggle } from "@/components/am-role-toggle";
import { type AMRole, SARAH, AM_NAMES } from "@/lib/account-management/role-data";
import {
  fetchAMClients,
  assignAM as apiAssignAM,
  type BusinessClient,
} from "@/lib/account-management/am-client-data";
import { needsAssignment as clientNeedsAssignment } from "@/lib/account-management/needs-assignment";

// ─── Badge variant helpers ────────────────────────────────────────────────────

type BadgeVariant = StatusVariant;

function activationStatusVariant(s: string): BadgeVariant {
  switch (s) {
    case "active":    return "active";
    case "pending":   return "pending";
    case "inactive":  return "neutral";
    case "suspended": return "error";
    default:          return "neutral";
  }
}

function onboardingStatusVariant(s: string): BadgeVariant {
  switch (s) {
    case "complete":     return "completed";
    case "in_progress":  return "review";
    case "not_started":  return "neutral";
    default:             return "neutral";
  }
}

function renewalStatusVariant(s: string): BadgeVariant {
  switch (s) {
    case "ok":       return "active";
    case "upcoming": return "warning";
    case "overdue":  return "error";
    case "cancelled": return "cancelled";
    default:         return "neutral";
  }
}

// Derive a simple health label from payment / activation state.
function deriveHealth(c: BusinessClient): { label: string; variant: BadgeVariant } {
  if (c.paymentStatus === "failed") return { label: "At Risk", variant: "at-risk" };
  if (c.activationStatus === "suspended") return { label: "At Risk", variant: "at-risk" };
  if (c.activationStatus === "active") return { label: "Good", variant: "info" };
  if (c.cleared) return { label: "Onboarding", variant: "pending" };
  return { label: "Pending", variant: "neutral" };
}

// ─── Client Detail Drawer ─────────────────────────────────────────────────────

interface ClientDetailDrawerProps {
  client: BusinessClient;
  role: AMRole;
  onClose: () => void;
  onAssigned: () => void;
}

function ClientDetailDrawer({ client, role, onClose, onAssigned }: ClientDetailDrawerProps) {
  const isHead = role === "head";

  // needsAssignment: no AM set and billing cleared — this business needs an AM.
  const needsAssign = !client.assignedAM && client.cleared;

  const [selectedAM, setSelectedAM] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const handleAssign = useCallback(async () => {
    if (!selectedAM) return;
    setAssigning(true);
    setAssignError(null);
    try {
      // TODO: automatic workload-based AM assignment with manager override is the
      // intended future behaviour. It is blocked on the User model gaining populated
      // department and role fields so that workload can be computed per-AM and the
      // assigning manager can be verified. Until that lands, assignedAM is manual.
      await apiAssignAM(client.id, selectedAM);
      setAssignSuccess(true);
      onAssigned();
    } catch (e) {
      setAssignError(e instanceof Error ? e.message : "Assignment failed. Please try again.");
    } finally {
      setAssigning(false);
    }
  }, [client.id, selectedAM, onAssigned]);

  const health = deriveHealth(client);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              Client Portfolio — Detail
            </span>
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: "#6366f1" }}
              >
                {client.clientName.slice(0, 2).toUpperCase()}
              </span>
              <h2 className="text-xl font-bold text-gray-900">{client.clientName}</h2>
            </div>
            <p className="text-xs text-gray-500 ml-10">{client.domain}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1 ml-10">
              <StatusBadge variant={activationStatusVariant(client.activationStatus)} label={client.activationStatus} size="sm" />
              <StatusBadge variant={health.variant} label={`Health: ${health.label}`} size="sm" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-1 text-gray-400 hover:text-gray-700 text-xl font-bold leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── Assign AM action (Head mode, unassigned businesses only) ── */}
          {isHead && needsAssign && !assignSuccess && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">
                🔔 AM Assignment Required
              </p>
              <p className="text-xs text-amber-700 mb-3">
                This business has no Account Manager assigned. Billing has cleared the client —
                select an AM to begin the onboarding workflow.
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={selectedAM}
                  onChange={(e) => setSelectedAM(e.target.value)}
                  className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  disabled={assigning}
                >
                  <option value="">Select Account Manager…</option>
                  {AM_NAMES.map((am) => (
                    <option key={am} value={am}>{am}</option>
                  ))}
                </select>
                <button
                  onClick={() => void handleAssign()}
                  disabled={!selectedAM || assigning}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {assigning ? "Assigning…" : "Assign AM"}
                </button>
              </div>
              {assignError && (
                <p className="text-xs text-red-600 mt-2 font-medium">{assignError}</p>
              )}
            </div>
          )}

          {/* Assignment success */}
          {assignSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">
                ✓ AM Assigned Successfully
              </p>
              <p className="text-xs text-emerald-700">
                <strong>{selectedAM}</strong> has been assigned to {client.clientName} ({client.domain}).
                Status updated to <strong>pending</strong>. The change is saved to the database.
              </p>
            </div>
          )}

          {/* ── Core fields ── */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Domain", client.domain],
              ["Assigned AM", assignSuccess ? selectedAM : (client.assignedAM || "Unassigned")],
              ["Email", client.email || "—"],
              ["Phone", client.phone || "—"],
              ["Monthly Value", client.monthlyValue > 0 ? `$${client.monthlyValue.toLocaleString()}/mo` : "—"],
              ["Cleared by Billing", client.cleared ? "Yes — Cleared" : "Not Cleared"],
              ["Onboarding Status", client.onboardingStatus],
              ["Kickoff Complete", client.kickoffCompleted ? `Yes${client.kickoffDate ? ` (${client.kickoffDate})` : ""}` : "Not yet"],
              ["Renewal Date", client.renewalDate ?? "—"],
              ["Renewal Status", client.renewalStatus],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <span className="text-xs text-gray-400 uppercase tracking-wide">{k}</span>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* ── Active Services (Billing-owned, read-only) ── */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Active Services{" "}
              <span className="font-normal normal-case text-gray-400">(Billing-owned — read-only)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {client.activeServices.length > 0 ? (
                client.activeServices.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">No services confirmed yet</span>
              )}
            </div>
          </div>

          {/* ── Delivery Checklist ── */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Delivery Checklist
            </p>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              {(
                [
                  ["Payment Confirmed (Billing)", client.paymentStatus === "confirmed"],
                  ["Cleared by Billing", client.cleared],
                  ["AM Assigned", assignSuccess ? true : !!client.assignedAM],
                  ["Kickoff Complete", client.kickoffCompleted],
                  ["Onboarding Complete", client.onboardingStatus === "complete"],
                ] as [string, boolean][]
              ).map(([label, done]) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-600">{label}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {done ? "✓ Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-2 flex-wrap shrink-0">
          {client.cleared && !client.onboardingStatus.includes("complete") && (
            <Link
              href="/account-management/onboarding"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Onboarding →
            </Link>
          )}
          {(client.renewalStatus === "upcoming" || client.renewalStatus === "overdue") && (
            <Link
              href="/account-management/renewals"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-violet-600 text-white hover:bg-violet-700"
            >
              Renewals →
            </Link>
          )}
          {client.activationStatus === "active" && (
            <Link
              href="/account-management/client-health"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Client Health →
            </Link>
          )}
          <Link
            href="/account-management/communications"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Communications →
          </Link>
          {isHead && needsAssign && (
            <Link
              href="/account-management/assignments"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Assignments →
            </Link>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

interface ClientRowProps {
  client: BusinessClient;
  showAMColumn: boolean;
  onOpen: () => void;
}

function ClientRow({ client, showAMColumn, onOpen }: ClientRowProps) {
  const health = deriveHealth(client);

  return (
    <tr
      className="hover:bg-slate-50 transition-colors cursor-pointer"
      onClick={onOpen}
    >
      {/* Client name + domain */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: "#6366f1" }}
          >
            {client.clientName.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-blue-700 hover:underline whitespace-nowrap">
              {client.clientName}
            </p>
            <p className="text-[11px] text-slate-400">{client.domain}</p>
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

      {/* Assigned AM — Head mode only */}
      {showAMColumn && (
        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
          {client.assignedAM ? (
            client.assignedAM
          ) : (
            <span className="text-amber-600 font-semibold text-xs">Unassigned</span>
          )}
        </td>
      )}

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
        <StatusBadge variant={health.variant} label={health.label} size="sm" />
      </td>

      {/* Renewal */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <StatusBadge
            variant={renewalStatusVariant(client.renewalStatus)}
            label={client.renewalStatus}
            size="sm"
          />
          {client.renewalDate && (
            <span className="text-[10px] text-slate-400">{client.renewalDate}</span>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Filter state types ───────────────────────────────────────────────────────

type ClearedFilter = "All" | "Cleared" | "Not Cleared";

// ─── Page component ───────────────────────────────────────────────────────────

export default function AMClientPortfolioPage() {
  const [role, setRole] = useState<AMRole>("head");
  const [businesses, setBusinesses] = useState<BusinessClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refreshClients = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchAMClients();
      setBusinesses(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load businesses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refreshClients(); }, [refreshClients]);

  const [selectedClient, setSelectedClient] = useState<BusinessClient | null>(null);

  // ── Filter state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [activationFilter, setActivationFilter] = useState<string>("All");
  const [clearedFilter, setClearedFilter] = useState<ClearedFilter>("All");
  const [amFilter, setAmFilter] = useState<string>("All");

  // ── Role-scoped base set ─────────────────────────────────────────────────
  const roleClients: BusinessClient[] =
    role === "am"
      ? businesses.filter((c) => c.assignedAM === SARAH)
      : businesses;

  // Derive unique AM names for the filter dropdown
  const amNames = Array.from(
    new Set(businesses.map((c) => c.assignedAM).filter(Boolean))
  ).sort();

  // Apply filters
  const filtered = roleClients.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.clientName.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.assignedAM.toLowerCase().includes(q) ||
      c.activeServices.some((s) => s.toLowerCase().includes(q)) ||
      c.activationStatus.toLowerCase().includes(q);

    const matchesActivation =
      activationFilter === "All" || c.activationStatus === activationFilter;

    const matchesAM = role === "am" || amFilter === "All" || c.assignedAM === amFilter;

    const matchesCleared =
      clearedFilter === "All" ||
      (clearedFilter === "Cleared" && c.cleared) ||
      (clearedFilter === "Not Cleared" && !c.cleared);

    return matchesSearch && matchesActivation && matchesAM && matchesCleared;
  });

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const total = roleClients.length;
  const activeCount = roleClients.filter((c) => c.activationStatus === "active").length;
  const onboardingCount = roleClients.filter((c) => c.activationStatus === "pending").length;
  const needsAssignmentCount = roleClients.filter((c) => !c.assignedAM && c.cleared).length;
  const totalMrr = roleClients.reduce((sum, c) => sum + c.monthlyValue, 0);

  const isAM = role === "am";
  const pageTitle = isAM ? "My Clients" : "Client Portfolio";
  const pageSubtitle = isAM
    ? `Viewing as ${SARAH} — showing only your assigned businesses (${total}). Billing-owned fields are read-only.`
    : "All businesses from the real Client and Business records. AM-owned fields are editable. Billing-owned fields (services, MRR, cleared) are read-only.";

  // Derive unique activation statuses from live data for filter
  const activationStatuses = Array.from(new Set(businesses.map((c) => c.activationStatus))).sort();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">{pageSubtitle}</p>
      </div>

      {/* Role toggle */}
      <RoleToggle role={role} onRoleChange={(r) => {
        setRole(r);
        if (r === "am") setAmFilter("All");
      }} />

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard title="Total Businesses" value={String(total)} />
        <KpiCard title="Active"           value={String(activeCount)} />
        <KpiCard title="In Onboarding"   value={String(onboardingCount)} />
        {role === "head" && (
          <KpiCard title="Needs AM Assignment" value={String(needsAssignmentCount)}
            risk={needsAssignmentCount > 0 ? "at-risk" : "healthy"} />
        )}
        <KpiCard title="Active MRR" value={`$${totalMrr.toLocaleString()}`} />
      </div>

      {/* Loading / error */}
      {loading && (
        <div className="rounded-xl border p-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)" }}>
          Loading businesses…
        </div>
      )}

      {fetchError && !loading && (
        <div className="rounded-xl border p-6 text-sm" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}>
          <strong>Failed to load businesses:</strong> {fetchError}
        </div>
      )}

      {/* Empty state — zero real records */}
      {!loading && !fetchError && businesses.length === 0 && (
        <div className="rounded-xl border p-12 text-center space-y-3" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: "#EFF6FF" }}>
            <svg width="24" height="24" fill="none" stroke="#1B4FD8" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>No businesses yet</p>
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Businesses appear here once Billing confirms a payment and creates the Client and Business records.
            When a client&apos;s invoice is marked Paid in Billing, their business will appear here for AM assignment and onboarding.
          </p>
        </div>
      )}

      {/* Filters + table — only shown when there are records */}
      {!loading && !fetchError && businesses.length > 0 && (
        <>
          {/* Search + filters */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search by name, domain, AM, service…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[220px] max-w-sm rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            <select
              value={activationFilter}
              onChange={(e) => setActivationFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="All">All Statuses</option>
              {activationStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={clearedFilter}
              onChange={(e) => setClearedFilter(e.target.value as ClearedFilter)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="All">All (Cleared + Not Cleared)</option>
              <option value="Cleared">Cleared by Billing</option>
              <option value="Not Cleared">Not Yet Cleared</option>
            </select>

            {role === "head" && (
              <select
                value={amFilter}
                onChange={(e) => setAmFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="All">All AMs</option>
                <option value="">Unassigned</option>
                {amNames.map((am) => (
                  <option key={am} value={am}>{am}</option>
                ))}
              </select>
            )}

            <span className="text-sm text-slate-400 whitespace-nowrap">{filtered.length} businesses</span>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Business / Domain</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Cleared</th>
                  {role === "head" && (
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned AM</th>
                  )}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Activation Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Onboarding</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Active Services</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">MRR</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Health</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Renewal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((client) => (
                  <ClientRow
                    key={client.id}
                    client={client}
                    showAMColumn={role === "head"}
                    onOpen={() => setSelectedClient(client)}
                  />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={role === "head" ? 9 : 8} className="px-4 py-10 text-center text-sm text-slate-400">
                      {isAM
                        ? `No businesses are currently assigned to ${SARAH}.`
                        : "No businesses match the current filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {isAM
                  ? `Showing ${filtered.length} of ${total} businesses assigned to you`
                  : `Showing ${filtered.length} of ${businesses.length} total businesses`}
              </span>
              <span className="text-xs text-slate-400 italic">
                Active Services, MRR, and Cleared are Billing-owned — read-only.
              </span>
            </div>
          </div>
        </>
      )}

      {/* Client detail drawer */}
      {selectedClient && (
        <ClientDetailDrawer
          client={selectedClient}
          role={role}
          onClose={() => setSelectedClient(null)}
          onAssigned={() => { void refreshClients(); }}
        />
      )}
    </div>
  );
}
