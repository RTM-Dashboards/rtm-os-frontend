"use client";

/**
 * AM Onboarding Queue — unified entry queue + intake form center
 *
 * DATA SOURCES
 * ─────────────
 * lib/mock/master-clients.ts          ← cleared client queue (Queue tab)
 * lib/mock/am-onboarding-store.ts     ← per-record + per-field state (Records tab)
 * lib/mock/am-onboarding-field-schema.ts ← field definitions
 * lib/mock/am-projects-store.ts       ← project creation / lookup
 *
 * TABS
 * ─────
 * "Queue"   — shows cleared=true clients not yet Active. This is the AM
 *             workflow entry point. KPI summary for the whole cleared pipeline.
 *             CORRECTED FLOW ORDER:
 *               1. "Activate Project" (primary)  → creates project + task list
 *               2. "Start Onboarding" (unlocked after project exists) → opens intake form
 *               3. Kickoff call tracked inside the onboarding detail view
 *
 * "Records" — shows all created onboarding intake records. Click "Open Form"
 *             to drill into the collaborative per-field form.
 *
 * Cleared = Billing-owned read-only flag. Explanation banner shown on Queue tab.
 */

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MASTER_CLIENTS,
  computeHealth,
  markOnboardingRecordCreated,
  markActivationTasksCreated,
} from "@/lib/mock/master-clients";
import type {
  MasterClient,
  ActivationStatus,
  HealthStatus,
} from "@/lib/mock/master-clients";
import {
  getAllOnboardingRecords,
  getOnboardingRecordByClientId,
  createOnboardingRecord,
  getOnboardingStatusMeta,
  getFieldAssignmentSummary,
  updateOnboardingRecord,
} from "@/lib/mock/am-onboarding-store";
import type {
  OnboardingIntakeStatus,
  SalesPrefillData,
} from "@/lib/mock/am-onboarding-store";
import {
  createProject,
  getProjectByClientId,
} from "@/lib/mock/am-projects-store";
import { MOCK_INTAKE_RECORDS } from "@/lib/sales/intake-config";
import { KpiCard, StatusBadge } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";

// ─── Formatting helpers ────────────────────────────────────────────────────────

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Badge variant helpers ─────────────────────────────────────────────────────

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

function healthVariant(h: HealthStatus): StatusVariant {
  switch (h) {
    case "Excellent": return "healthy";
    case "Good":      return "info";
    case "At Risk":   return "at-risk";
    case "Critical":  return "critical";
    default:          return "neutral";
  }
}

// ─── Sales intake prefill helpers (ported from cleared-clients) ───────────────

function findMatchedIntakeRecord(clientName: string) {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  const target = normalize(clientName);
  return MOCK_INTAKE_RECORDS.find((r) => {
    const candidate = normalize(r.businessName);
    return (
      target.includes(candidate) ||
      candidate.includes(target) ||
      target.split(" ").slice(0, 2).join(" ") ===
        candidate.split(" ").slice(0, 2).join(" ")
    );
  });
}

function buildSalesPrefill(client: MasterClient): SalesPrefillData {
  const intake = findMatchedIntakeRecord(client.clientName);
  return {
    clientName: client.clientName,
    email: client.email,
    industry: client.industry,
    salesOwner: client.salesOwner,
    referralSource: client.referralSource,
    affiliateName: client.affiliateName,
    activeServices: client.activeServices,
    monthlyValue: client.monthlyValue,
    primaryContact: intake?.primaryContact,
    phone: intake?.phone,
    website: intake?.website,
    location: intake?.location,
    businessSize: intake?.businessSize,
    intakeSource: intake?.intakeSource,
    selectedGoals: intake?.selectedGoals,
    discoveryNotes:
      typeof intake?.answers?.discoveryNotes === "string"
        ? intake.answers.discoveryNotes
        : undefined,
  };
}

// ─── Queue tab: cleared clients (entry queue) ─────────────────────────────────

const QUEUE_ACTIVATION_STATUSES: ActivationStatus[] = [
  "AM Assignment Needed",
  "Ready for Onboarding",
  "Onboarding Pending",
  "Department Activation Pending",
];

/** Clients cleared by Billing and not yet fully Active */
function getClearedQueueClients(): MasterClient[] {
  return MASTER_CLIENTS.filter(
    (c) =>
      c.cleared === true &&
      c.activationStatus !== "Active"
  );
}

// ─── Queue row ────────────────────────────────────────────────────────────────

function QueueClientRow({
  client,
  onActivateProject,
  onStartOnboarding,
  onOpenRecord,
}: {
  client: MasterClient;
  onActivateProject: (client: MasterClient) => void;
  onStartOnboarding: (client: MasterClient) => void;
  onOpenRecord: (recordId: string) => void;
}) {
  const health = computeHealth(client);
  const existingProject = getProjectByClientId(client.id);
  const existingRecord = getOnboardingRecordByClientId(client.id);

  const projectExists = !!existingProject || client.activationChecklist.activationTasksCreated;
  const recordExists = !!existingRecord || client.activationChecklist.onboardingRecordCreated;

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      {/* Client */}
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

      {/* Active Services */}
      <td className="px-4 py-3">
        {client.activeServices.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {client.activeServices.slice(0, 3).map((s) => (
              <span
                key={s}
                className="inline-block rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
              >
                {s}
              </span>
            ))}
            {client.activeServices.length > 3 && (
              <span className="text-[10px] text-slate-400">+{client.activeServices.length - 3}</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Pending setup</span>
        )}
      </td>

      {/* MRR */}
      <td className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">
        {client.monthlyValue > 0 ? `$${client.monthlyValue.toLocaleString()}` : "—"}
      </td>

      {/* Activation Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge
          variant={activationStatusVariant(client.activationStatus)}
          label={client.activationStatus}
          size="sm"
        />
      </td>

      {/* Assigned AM */}
      <td className="px-4 py-3 text-slate-700 whitespace-nowrap text-sm">
        {client.assignedAM === "Unassigned" ? (
          <span className="text-slate-400 italic text-xs">Unassigned</span>
        ) : (
          client.assignedAM
        )}
      </td>

      {/* Health */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge variant={healthVariant(health)} label={health} size="sm" />
      </td>

      {/* Flow Steps */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {/* Step 1: Activate Project */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
              projectExists
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
          >
            {projectExists ? "✓" : "1"} Project
          </span>
          <span className="text-slate-300 text-xs">→</span>
          {/* Step 2: Start Onboarding */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
              recordExists
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : projectExists
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-slate-50 border-slate-200 text-slate-300"
            }`}
          >
            {recordExists ? "✓" : "2"} Intake
          </span>
          <span className="text-slate-300 text-xs">→</span>
          {/* Step 3: Kickoff */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
              client.activationChecklist.kickoffCallCompleted
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : recordExists && client.activationChecklist.kickoffNeeded
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : recordExists && !client.activationChecklist.kickoffNeeded
                ? "bg-slate-50 border-slate-200 text-slate-400"
                : "bg-slate-50 border-slate-200 text-slate-300"
            }`}
          >
            {client.activationChecklist.kickoffCallCompleted
              ? "✓"
              : !client.activationChecklist.kickoffNeeded
              ? "—"
              : "3"}{" "}
            Kickoff
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {!projectExists ? (
            // STEP 1: Primary action — Activate Project
            <button
              onClick={() => onActivateProject(client)}
              className="rounded-lg bg-blue-600 border border-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Activate Project
            </button>
          ) : !recordExists ? (
            // STEP 2: Primary action — Start Onboarding (project exists)
            <button
              onClick={() => onStartOnboarding(client)}
              className="rounded-lg bg-blue-600 border border-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Start Onboarding
            </button>
          ) : (
            // Both exist — open onboarding record (includes kickoff)
            <button
              onClick={() => existingRecord && onOpenRecord(existingRecord.id)}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              {client.activationChecklist.kickoffCallCompleted ||
              !client.activationChecklist.kickoffNeeded
                ? "View Onboarding"
                : "Continue / Kickoff"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Queue tab (cleared clients entry queue) ──────────────────────────────────

function QueueTab({
  onStartOnboarding,
  onOpenRecord,
}: {
  onStartOnboarding: (client: MasterClient) => void;
  onOpenRecord: (recordId: string) => void;
}) {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activationFilter, setActivationFilter] = useState<ActivationStatus | "All">("All");
  const [amFilter, setAmFilter] = useState("All");

  const CLEARED_CLIENTS = getClearedQueueClients();

  const amNames = Array.from(
    new Set(CLEARED_CLIENTS.map((c) => c.assignedAM).filter((am) => am !== "Unassigned"))
  ).sort();

  const filtered = CLEARED_CLIENTS.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.clientName.toLowerCase().includes(q) ||
      c.assignedAM.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.activationStatus.toLowerCase().includes(q) ||
      c.activeServices.some((s) => s.toLowerCase().includes(q));
    const matchesActivation =
      activationFilter === "All" || c.activationStatus === activationFilter;
    const matchesAM = amFilter === "All" || c.assignedAM === amFilter;
    return matchesSearch && matchesActivation && matchesAM;
  });

  // KPIs — over all cleared queue clients, not just filtered
  const total = CLEARED_CLIENTS.length;
  const needsAssignment = CLEARED_CLIENTS.filter(
    (c) => c.activationStatus === "AM Assignment Needed"
  ).length;
  const readyForOnboarding = CLEARED_CLIENTS.filter(
    (c) => c.activationStatus === "Ready for Onboarding"
  ).length;
  const onboardingInProgress = CLEARED_CLIENTS.filter(
    (c) =>
      c.activationStatus === "Onboarding Pending" ||
      c.activationStatus === "Department Activation Pending"
  ).length;
  const totalMrr = CLEARED_CLIENTS.reduce((sum, c) => sum + c.monthlyValue, 0);
  const projectsCreated = CLEARED_CLIENTS.filter(
    (c) => c.activationChecklist.activationTasksCreated
  ).length;

  function handleActivateProject(client: MasterClient) {
    const salesPrefill = buildSalesPrefill(client);
    const services =
      client.activeServices.length > 0 ? client.activeServices : ["General Onboarding"];

    createProject(
      client.id,
      client.clientName,
      client.assignedAM !== "Unassigned" ? client.assignedAM : "",
      services,
      null
    );
    markActivationTasksCreated(client.id);
    refresh();
  }

  return (
    <div className="space-y-5">
      {/* Cleared flag explanation */}
      <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
        <span className="text-xs font-semibold text-emerald-800">
          Cleared = Billing has confirmed payment, activated services, and handed off to AM.
          This flag is set by Billing and is read-only from the AM side.
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Cleared (Not Active)" value={String(total)} />
        <KpiCard
          title="Needs AM Assignment"
          value={String(needsAssignment)}
          risk={needsAssignment > 0 ? "at-risk" : "healthy"}
        />
        <KpiCard
          title="Ready for Onboarding"
          value={String(readyForOnboarding)}
          risk={readyForOnboarding > 0 ? "at-risk" : "healthy"}
        />
        <KpiCard title="Onboarding In Progress" value={String(onboardingInProgress)} />
        <KpiCard title="Projects Activated"     value={String(projectsCreated)} />
        <KpiCard title="Cleared MRR"            value={`$${totalMrr.toLocaleString()}`} />
      </div>

      {/* Flow order explainer */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Flow:</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
          1 · Activate Project
        </span>
        <span className="text-blue-300 text-sm">→</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          2 · Start Onboarding
        </span>
        <span className="text-blue-300 text-sm">→</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          3 · Kickoff Call
        </span>
        <span className="text-blue-300 text-sm">→</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
          Active
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search clients, AM, industry, services…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] max-w-sm rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <select
          value={activationFilter}
          onChange={(e) => setActivationFilter(e.target.value as ActivationStatus | "All")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="All">All Activation Statuses</option>
          {QUEUE_ACTIVATION_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
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
        {(["All", ...QUEUE_ACTIVATION_STATUSES] as (ActivationStatus | "All")[]).map((s) => {
          const count =
            s === "All"
              ? CLEARED_CLIENTS.length
              : CLEARED_CLIENTS.filter((c) => c.activationStatus === s).length;
          return (
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
                <span className="ml-1 text-[10px] text-slate-400">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {total === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-6 py-16 text-center">
          <div className="text-slate-300 text-5xl mb-4">✅</div>
          <h2 className="text-lg font-bold text-slate-700 mb-1">No clients in the queue</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            All cleared clients are Active, or no clients have been cleared by Billing yet.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Client</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Active Services</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">MRR</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Activation Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned AM</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Health</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Flow Steps</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((client) => (
                <QueueClientRow
                  key={client.id}
                  client={client}
                  onActivateProject={handleActivateProject}
                  onStartOnboarding={onStartOnboarding}
                  onOpenRecord={onOpenRecord}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                    No clients match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {filtered.length} of {total} cleared (non-active) clients
            </span>
            <span className="text-xs text-slate-400 italic">
              Active Services, MRR, Billing Owner, and Cleared flag are Billing-owned — read-only
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Onboarding status badges ──────────────────────────────────────────────────

function OnboardingStatusBadge({ status }: { status: OnboardingIntakeStatus }) {
  const meta = getOnboardingStatusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border whitespace-nowrap"
      style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
      {status}
    </span>
  );
}

// ─── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ─── Records tab (existing onboarding records) ─────────────────────────────────

function RecordsTab({
  onOpenRecord,
}: {
  onOpenRecord: (recordId: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<OnboardingIntakeStatus | "All">("All");
  const [search, setSearch] = useState("");

  const ALL_STATUSES: OnboardingIntakeStatus[] = [
    "Draft",
    "AM In Progress",
    "Sent to Client",
    "Client Responded",
    "Ready for Kickoff",
    "Complete",
  ];

  const records = getAllOnboardingRecords();
  const total = records.length;
  const amInProgress = records.filter((r) => r.status === "AM In Progress").length;
  const sentToClient = records.filter((r) => r.status === "Sent to Client").length;
  const readyForKickoff = records.filter((r) => r.status === "Ready for Kickoff").length;
  const complete = records.filter((r) => r.status === "Complete").length;
  const hasProject = records.filter((r) => r.projectId !== null).length;

  const filtered = records.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const amName = r.fieldAssignments["assignedAM"]?.value ?? "";
      if (
        !r.salesPrefill.clientName.toLowerCase().includes(q) &&
        !amName.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  if (total === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-6 py-16 text-center">
        <div className="text-slate-300 text-5xl mb-4">🗂️</div>
        <h2 className="text-lg font-bold text-slate-700 mb-1">No onboarding records yet</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Onboarding records are created when you click{" "}
          <strong className="text-slate-600">"Start Onboarding"</strong> on a cleared client in
          the <strong className="text-slate-600">Queue tab</strong> above. Activate a project
          first, then start onboarding.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Total Records"      value={String(total)} />
        <KpiCard title="AM In Progress"     value={String(amInProgress)} />
        <KpiCard title="Sent to Client"     value={String(sentToClient)} />
        <KpiCard title="Ready for Kickoff"  value={String(readyForKickoff)} />
        <KpiCard title="Complete"           value={String(complete)} />
        <KpiCard title="Has Project"        value={String(hasProject)} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search clients or AM…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] max-w-xs rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OnboardingIntakeStatus | "All")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="All">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm text-slate-400">{filtered.length} records</span>
      </div>

      {/* Records table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Services</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned AM</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Project</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((record) => {
              const sum = getFieldAssignmentSummary(record);
              const amName = record.fieldAssignments["assignedAM"]?.value ?? "";
              return (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{record.salesPrefill.clientName}</p>
                    <p className="text-[11px] text-slate-400">{record.salesPrefill.industry}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {record.salesPrefill.activeServices.slice(0, 3).map((s) => (
                        <span key={s} className="inline-block rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{s}</span>
                      ))}
                      {record.salesPrefill.activeServices.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{record.salesPrefill.activeServices.length - 3}</span>
                      )}
                      {record.salesPrefill.activeServices.length === 0 && (
                        <span className="text-xs italic text-slate-300">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{amName || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="min-w-[80px]">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs text-slate-700 font-medium">
                          {sum.amFilled + sum.clientResponded}/{sum.totalFields}
                        </span>
                        {sum.pendingClient > 0 && (
                          <span className="text-[10px] font-semibold text-amber-600">{sum.pendingClient} pending</span>
                        )}
                      </div>
                      <ProgressBar value={sum.amFilled + sum.clientResponded} max={sum.totalFields} color="#10B981" />
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <OnboardingStatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {record.projectId ? (
                      <span className="text-xs font-medium text-emerald-600">✓ Created</span>
                    ) : (
                      <span className="text-xs text-slate-300 italic">Not created</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmt(record.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onOpenRecord(record.id)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      Open Form
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                  No onboarding records match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function OnboardingQueuePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"queue" | "records">("queue");

  function handleStartOnboarding(client: MasterClient) {
    const salesPrefill = buildSalesPrefill(client);
    const record = createOnboardingRecord(
      client.id,
      salesPrefill,
      client.assignedAM !== "Unassigned" ? client.assignedAM : ""
    );
    markOnboardingRecordCreated(client.id);

    // Link project to record if project exists and record has no projectId
    const project = getProjectByClientId(client.id);
    if (project && !record.projectId) {
      updateOnboardingRecord({ ...record, projectId: project.id });
    }

    router.push(`/account-management/onboarding/${record.id}`);
  }

  function handleOpenRecord(recordId: string) {
    router.push(`/account-management/onboarding/${recordId}`);
  }

  const recordCount = getAllOnboardingRecords().length;
  const queueCount = getClearedQueueClients().length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Onboarding Queue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Entry queue for cleared clients — activate projects, start onboarding intake forms,
          and track kickoff calls. Existing onboarding records are in the Records tab.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "queue"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Queue
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {queueCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("records")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "records"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Onboarding Records
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {recordCount}
          </span>
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "queue" ? (
        <QueueTab
          onStartOnboarding={handleStartOnboarding}
          onOpenRecord={handleOpenRecord}
        />
      ) : (
        <RecordsTab onOpenRecord={handleOpenRecord} />
      )}
    </div>
  );
}
