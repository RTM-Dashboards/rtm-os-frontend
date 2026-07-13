"use client";

/**
 * AM Client Portfolio
 *
 * DATA SOURCE: data/master-clients.json via /api/master-clients (fetched on mount).
 *   MASTER_CLIENTS static import is used only as the SSR seed; the live file-backed
 *   API is fetched immediately on mount so that any state changes made elsewhere in
 *   the app (AM wizard, onboarding completion, billing clearance, etc.) are reflected
 *   after a normal page navigation — no manual workaround required.
 *
 * ROLE SCOPING: reuses the same AMRole type and RoleToggle component as the AM Dashboard.
 *   - Department Head view: all clients (default), AM filter dropdown for individual-AM drill-down.
 *   - Account Manager view: filtered to clients where assignedAM === SARAH
 *     (canonical identity from role-data.ts — currently "Sarah K.").
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
 */

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MASTER_CLIENTS,
  computeHealth,
  computePriority,
  computeNextAction,
} from "@/lib/mock/master-clients";
import type {
  MasterClient,
  ActivationStatus,
  HealthStatus,
  Priority,
  ComputedNextAction,
} from "@/lib/mock/master-clients";
import { patchMasterClient } from "@/lib/mock/master-clients-api";
import { needsAssignment as clientNeedsAssignment } from "@/lib/account-management/needs-assignment";
import {
  getOnboardingRecordByClientId,
  getFieldAssignmentSummary,
} from "@/lib/mock/am-onboarding-store";
import { KpiCard, StatusBadge } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";
import { RoleToggle } from "@/components/am-role-toggle";
import { type AMRole, SARAH, AM_NAMES } from "@/lib/account-management/role-data";

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

// ─── Computed Next Action hook ──────────────────────────────────────────────────────
//
// useClientNextAction: React hook that resolves the computed next action for a
// single client, fetching the onboarding record when needed to get the
// incomplete-field count. Starts synchronously (no flicker) then refines.
//
function useClientNextAction(client: MasterClient): ComputedNextAction {
  const health = computeHealth(client);

  const buildInputs = (incompleteOnboardingFields?: number) => ({
    cleared: client.cleared,
    assignedAM: client.assignedAM,
    cancellationStatus: client.cancellationStatus,
    activationStatus: client.activationStatus,
    activationChecklist: client.activationChecklist,
    clientHealth: health,
    renewalDate: client.renewalDate,
    incompleteOnboardingFields,
  });

  const [result, setResult] = useState<ComputedNextAction>(() =>
    computeNextAction(buildInputs())
  );

  useEffect(() => {
    let cancelled = false;

    // Only fetch the onboarding record when the client is in an onboarding
    // phase where incomplete fields matter (rules 5/6).
    const needsRecord =
      client.activationChecklist.activationTasksCreated &&
      client.activationStatus !== "Active" &&
      client.activationStatus !== "Department Activation Pending";

    if (!needsRecord) {
      setResult(computeNextAction(buildInputs()));
      return;
    }

    getOnboardingRecordByClientId(client.id).then((record) => {
      if (cancelled) return;
      let incompleteOnboardingFields: number | undefined;
      if (record) {
        const summary = getFieldAssignmentSummary(record);
        incompleteOnboardingFields = summary.unset + summary.pendingClient;
      }
      setResult(computeNextAction(buildInputs(incompleteOnboardingFields)));
    });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    client.id,
    client.cleared,
    client.assignedAM,
    client.cancellationStatus,
    client.activationStatus,
    client.renewalDate,
    client.activationChecklist.activationTasksCreated,
    client.activationChecklist.kickoffNeeded,
    client.activationChecklist.kickoffCallCompleted,
    client.billingStatus,
    client.paymentStatus,
  ]);

  return result;
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

// Statuses shown in AM view — excludes "AM Assignment Needed" because a scoped AM
// will never have unassigned clients in their list.
const AM_ACTIVATION_STATUSES: ActivationStatus[] = ACTIVATION_STATUSES.filter(
  (s) => s !== "AM Assignment Needed"
);

const HEALTH_STATUSES: HealthStatus[] = ["Excellent", "Good", "At Risk", "Critical"];

// ─── Client Detail Drawer ─────────────────────────────────────────────────────

interface ClientDetailDrawerProps {
  client: MasterClient;
  role: AMRole;
  onClose: () => void;
  onAssigned: () => void; // callback to refresh live clients after AM assignment
}

function ClientDetailDrawer({ client, role, onClose, onAssigned }: ClientDetailDrawerProps) {
  const health = computeHealth(client);
  const priority = computePriority(health, client.billingStatus);
  const isHead = role === "head";
  // Uses the shared predicate — same condition as Account Assignments' KPI so counts always match.
  const needsAssignment = clientNeedsAssignment(client);

  // AM assignment state (Head mode only, for unassigned clients)
  const [selectedAM, setSelectedAM] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const handleAssign = useCallback(async () => {
    if (!selectedAM) return;
    setAssigning(true);
    setAssignError(null);
    try {
      await patchMasterClient(client.id, {
        assignedAM: selectedAM,
        activationStatus: "Ready for Onboarding",
        currentStatus: "Ready for Onboarding",
        activationChecklist: {
          ...client.activationChecklist,
          amAssigned: true,
        },
      });
      setAssignSuccess(true);
      onAssigned();
    } catch (e) {
      setAssignError(e instanceof Error ? e.message : "Assignment failed. Please try again.");
    } finally {
      setAssigning(false);
    }
  }, [client, selectedAM, onAssigned]);

  const nextAction = useClientNextAction(client);

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
                style={{ background: client.avatarColor }}
              >
                {client.clientName.slice(0, 2).toUpperCase()}
              </span>
              <h2 className="text-xl font-bold text-gray-900">{client.clientName}</h2>
            </div>
            <p className="text-xs text-gray-500 ml-10">{client.industry}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1 ml-10">
              <StatusBadge variant={activationStatusVariant(client.activationStatus)} label={client.activationStatus} size="sm" />
              <StatusBadge variant={healthVariant(health)} label={`Health: ${health}`} size="sm" />
              <StatusBadge variant={priorityVariant(priority)} label={`Priority: ${priority}`} size="sm" />
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

          {/* ── Assign AM action (Head mode, unassigned clients only) ── */}
          {isHead && needsAssignment && !assignSuccess && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">
                🔔 AM Assignment Required
              </p>
              <p className="text-xs text-amber-700 mb-3">
                This client has no Account Manager assigned. Select an AM below to assign them.
                The assignment is persisted immediately and the client will move to{" "}
                <strong>Ready for Onboarding</strong> status.
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
                  onClick={handleAssign}
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

          {/* Assignment success confirmation */}
          {assignSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">
                ✓ AM Assigned Successfully
              </p>
              <p className="text-xs text-emerald-700">
                <strong>{selectedAM}</strong> has been assigned to {client.clientName}.
                Status updated to <strong>Ready for Onboarding</strong>. The client will
                no longer appear in the &ldquo;AM Assignment Needed&rdquo; list on refresh.
              </p>
            </div>
          )}

          {/* ── Core client fields ── */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Assigned AM", assignSuccess ? selectedAM : client.assignedAM],
              ["Billing Owner", client.billingOwner],
              ["Monthly Value", `$${client.monthlyValue.toLocaleString()}/mo`],
              ["Cleared by Billing", client.cleared ? "Yes — Cleared" : "Not Cleared"],
              ["Onboarding Status", client.onboardingStatus],
              ["Renewal Date", client.renewalDate !== "—" ? client.renewalDate : "—"],
              ["Renewal Status", client.renewalStatus],
              ["Last Activity", client.lastActivity],
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

          {/* ── Activation Checklist ── */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Activation Checklist
            </p>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              {(
                [
                  ["Invoice Paid",              client.activationChecklist.invoicePaid],
                  ["Billing Cleared",           client.activationChecklist.billingCleared],
                  ["Contract Confirmed",        client.activationChecklist.contractConfirmed],
                  ["Services Confirmed",        client.activationChecklist.servicesConfirmed],
                  ["Contact Verified",          client.activationChecklist.clientContactVerified],
                  ["AM Assigned",               assignSuccess ? true : client.activationChecklist.amAssigned],
                  ["Activation Tasks Created",  client.activationChecklist.activationTasksCreated],
                  ["Onboarding Record",         client.activationChecklist.onboardingRecordCreated],
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

          {/* ── Notes ── */}
          {client.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-amber-900">{client.notes}</p>
            </div>
          )}

          {/* ── Next Required Action (computed) ── */}
          <div className={`rounded-lg p-4 border ${nextAction.href ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"}`}>
            <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${nextAction.href ? "text-blue-800" : "text-slate-600"}`}>
              Next Required Action
              <span className="ml-1 font-normal normal-case text-[10px] opacity-60">(computed)</span>
            </p>
            {nextAction.href ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-blue-800">{nextAction.text}</p>
                <Link
                  href={nextAction.href}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Go →
                </Link>
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-700">{nextAction.text}</p>
            )}
          </div>
        </div>

        {/* Footer — links to real detail pages */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-2 flex-wrap shrink-0">
          {(client.activationStatus === "Onboarding Pending" ||
            client.activationStatus === "Department Activation Pending" ||
            client.activationStatus === "Ready for Onboarding") && (
            <Link
              href="/account-management/onboarding"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Onboarding →
            </Link>
          )}
          {(client.renewalStatus === "Schedule Pending" || client.renewalStatus === "At Risk") && (
            <Link
              href="/account-management/renewals"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-violet-600 text-white hover:bg-violet-700"
            >
              Renewals →
            </Link>
          )}
          {client.activationStatus === "Active" && (
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
          {isHead && needsAssignment && (
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

// ─── Page component ───────────────────────────────────────────────────────────

export default function AMClientPortfolioPage() {
  // ── Role state (reuses AM Dashboard mechanism) ─────────────────────────────
  const [role, setRole] = useState<AMRole>("head");

  // ── Live data (hydrated from file-backed API on mount) ─────────────────────
  const [liveClients, setLiveClients] = useState<MasterClient[]>(MASTER_CLIENTS);

  const refreshClients = useCallback(() => {
    fetch("/api/master-clients")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { clients: MasterClient[] } | null) => {
        if (d?.clients) setLiveClients(d.clients);
      })
      .catch(() => {/* keep seed */});
  }, []);

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  // ── Selected client for detail drawer ────────────────────────────────────
  const [selectedClient, setSelectedClient] = useState<MasterClient | null>(null);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [activationFilter, setActivationFilter] = useState<ActivationStatus | "All">("All");
  const [healthFilter, setHealthFilter] = useState<HealthStatus | "All">("All");
  const [amFilter, setAmFilter] = useState<string>("All");
  const [clearedFilter, setClearedFilter] = useState<ClearedFilter>("All");

  // ── Role-scoped base set ───────────────────────────────────────────────────
  const roleClients: MasterClient[] =
    role === "am"
      ? liveClients.filter((c) => c.assignedAM === SARAH)
      : liveClients;

  // Derive all unique AM names for filter (from full live list, always)
  const amNames = Array.from(
    new Set(liveClients.map((c) => c.assignedAM).filter((am) => am !== "Unassigned"))
  ).sort();

  // Status list: in AM mode, exclude "AM Assignment Needed" (AM never sees unassigned clients)
  const visibleStatuses = role === "am" ? AM_ACTIVATION_STATUSES : ACTIVATION_STATUSES;

  // Apply search + field filters on top of the role-scoped set
  const filtered = roleClients.filter((c) => {
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

    const matchesAM = role === "am" || amFilter === "All" || c.assignedAM === amFilter;

    const matchesCleared =
      clearedFilter === "All" ||
      (clearedFilter === "Cleared" && c.cleared === true) ||
      (clearedFilter === "Not Cleared" && c.cleared === false);

    return matchesSearch && matchesActivation && matchesHealth && matchesAM && matchesCleared;
  });

  // ── KPIs: computed from the role-scoped set ────────────────────────────────
  const kpiBase = roleClients;
  const total = kpiBase.length;
  const activeCount = kpiBase.filter((c) => c.activationStatus === "Active").length;
  const onboardingCount = kpiBase.filter(
    (c) =>
      c.activationStatus === "Onboarding Pending" ||
      c.activationStatus === "Department Activation Pending" ||
      c.activationStatus === "Ready for Onboarding"
  ).length;
  // Shared predicate — same condition as Account Assignments' KPI so counts always match.
  const needsAssignmentCount = kpiBase.filter(clientNeedsAssignment).length;
  const atRiskCount = kpiBase.filter(
    (c) => computeHealth(c) === "At Risk" || computeHealth(c) === "Critical"
  ).length;
  const totalMrr = kpiBase
    .filter((c) => c.monthlyValue > 0)
    .reduce((sum, c) => sum + c.monthlyValue, 0);

  // ── Page copy (role-aware) ────────────────────────────────────────────────
  const isAM = role === "am";
  const pageTitle = isAM ? "My Clients" : "Client Portfolio";
  const pageSubtitle = isAM
    ? `Viewing as ${SARAH} — showing only your assigned clients (${total} client${total !== 1 ? "s" : ""}). Billing-owned fields are read-only.`
    : `All clients from the shared master list — AM status, onboarding progress, renewals, and health. Billing-owned fields (services, MRR, billing status) are read-only.`;

  // When activation filter is set to "AM Assignment Needed" but role switches to AM,
  // clear it to avoid a stranded filter showing 0 results.
  const safeActivationFilter =
    isAM && activationFilter === "AM Assignment Needed" ? "All" : activationFilter;

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
        if (r === "am") {
          setAmFilter("All");
          // Clear "AM Assignment Needed" filter if it's active and we're switching to AM
          if (activationFilter === "AM Assignment Needed") setActivationFilter("All");
        }
      }} />

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Total Clients"    value={String(total)} />
        <KpiCard title="Active"           value={String(activeCount)} />
        <KpiCard title="In Onboarding"    value={String(onboardingCount)} />
        {/* "Needs Assignment" KPI only shown in Head mode — AMs never have unassigned clients */}
        {role === "head" && (
          <KpiCard title="Needs Assignment" value={String(needsAssignmentCount)}
            risk={needsAssignmentCount > 0 ? "at-risk" : "healthy"} />
        )}
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

        {/* Activation Status filter — "AM Assignment Needed" hidden in AM mode */}
        <select
          value={safeActivationFilter}
          onChange={(e) => setActivationFilter(e.target.value as ActivationStatus | "All")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="All">All Statuses</option>
          {visibleStatuses.map((s) => (
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

        {/* AM filter — Head mode only */}
        {role === "head" && (
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
        )}

        <span className="text-sm text-slate-400 whitespace-nowrap">{filtered.length} clients</span>
      </div>

      {/* Activation status tab bar — "AM Assignment Needed" hidden in AM mode */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {(["All", ...visibleStatuses] as (ActivationStatus | "All")[]).map((s) => (
          <button
            key={s}
            onClick={() => setActivationFilter(s)}
            className={`rounded-t-lg border border-b-0 px-3 py-2 text-xs font-semibold transition-colors ${
              safeActivationFilter === s
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {s}
            {s !== "All" && (
              <span className="ml-1 text-[10px] text-slate-400">
                ({roleClients.filter((c) => c.activationStatus === s).length})
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
              {role === "head" && (
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned AM</th>
              )}
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
              <ClientRow
                key={client.id}
                client={client}
                showAMColumn={role === "head"}
                onOpen={() => setSelectedClient(client)}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={role === "head" ? 12 : 11} className="px-4 py-10 text-center text-sm text-slate-400">
                  {isAM
                    ? `No clients are currently assigned to ${SARAH}.`
                    : "No clients match the current filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isAM
              ? `Showing ${filtered.length} of ${total} clients assigned to you`
              : `Showing ${filtered.length} of ${liveClients.length} total clients`}
          </span>
          <span className="text-xs text-slate-400 italic">
            Active Services, MRR, Billing Owner, and Cleared flag are Billing-owned — read-only.
            Cleared = Billing has confirmed payment, activated services, and handed off to AM.
          </span>
        </div>
      </div>

      {/* Client detail drawer */}
      {selectedClient && (
        <ClientDetailDrawer
          client={selectedClient}
          role={role}
          onClose={() => setSelectedClient(null)}
          onAssigned={() => {
            refreshClients();
          }}
        />
      )}
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

interface ClientRowProps {
  client: MasterClient;
  showAMColumn: boolean;
  onOpen: () => void;
}

function ClientRow({ client, showAMColumn, onOpen }: ClientRowProps) {
  const health = computeHealth(client);
  const priority = computePriority(health, client.billingStatus);
  const nextAction = useClientNextAction(client);

  return (
    <tr
      className="hover:bg-slate-50 transition-colors cursor-pointer"
      onClick={onOpen}
    >
      {/* Client name + industry — clicking anywhere on row opens drawer */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: client.avatarColor }}
          >
            {client.clientName.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-blue-700 hover:underline whitespace-nowrap">
              {client.clientName}
            </p>
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

      {/* Assigned AM — Head mode only */}
      {showAMColumn && (
        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
          {client.assignedAM === "Unassigned" ? (
            <span className="text-amber-600 font-semibold text-xs">Unassigned</span>
          ) : (
            client.assignedAM
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

      {/* Next Action (computed) */}
      <td
        className="px-4 py-3 text-xs text-slate-500 max-w-[200px]"
        onClick={(e) => {
          // Prevent row click from re-opening drawer when clicking a nav link
          if ((e.target as HTMLElement).tagName === "A") e.stopPropagation();
        }}
      >
        {nextAction.href ? (
          <Link
            href={nextAction.href}
            className="text-blue-600 hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {nextAction.text}
          </Link>
        ) : (
          <span className="text-slate-500">{nextAction.text}</span>
        )}
      </td>
    </tr>
  );
}
