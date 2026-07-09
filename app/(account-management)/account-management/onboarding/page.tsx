"use client";

/**
 * AM Onboarding Queue — v3
 *
 * DATA SOURCES
 * ─────────────
 * lib/engine/mock-data.ts             ← ENGINE_STORE — tasks (onboarding task status)
 * lib/mock/master-clients.ts          ← cleared client queue
 * lib/mock/am-onboarding-store.ts     ← per-record + per-field state (Records tab)
 *
 * ARCHITECTURE (post-refactor)
 * ──────────────────────────────
 * Onboarding is task #1 in every project's task list. It is automatically
 * created when a project is activated via the Project Activation Center wizard.
 *
 * KPI cards and row status are driven by the engine Onboarding task's
 * completion status (linkedOnboardingId field), NOT by a separate parallel
 * tracking mechanism.
 *
 * FLOW (single-step, from this Queue)
 *   1. Client cleared by Billing → appears here.
 *   2. AM activates project (→ Projects page wizard) → project created,
 *      Onboarding task #1 auto-created, onboarding record auto-created.
 *   3. AM opens onboarding task → routed to /onboarding/[recordId] form.
 *   4. AM fills fields, kickoff, completes → task status auto-syncs to Completed.
 *
 * TABS
 *   "Queue"   — cleared clients, task-driven onboarding status KPIs.
 *   "Records" — all created onboarding intake records.
 *
 * Cleared = Billing-owned read-only flag.
 */

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ENGINE_STORE } from "@/lib/engine/mock-data";
import type { Project, Task } from "@/lib/engine/types";
import {
  MASTER_CLIENTS,
  computeHealth,
} from "@/lib/mock/master-clients";
import type { MasterClient, ActivationStatus, HealthStatus } from "@/lib/mock/master-clients";
import {
  getAllOnboardingRecords,
  getOnboardingStatusMeta,
  getFieldAssignmentSummary,
} from "@/lib/mock/am-onboarding-store";
import type { AMOnboardingRecord, OnboardingIntakeStatus } from "@/lib/mock/am-onboarding-store";
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

// ─── Engine helpers: resolve onboarding task for a client ─────────────────────

/**
 * Finds the Onboarding task (task #1, has linkedOnboardingId) for a given
 * clientId by looking up the client's project in the provided data arrays.
 * Falls back to ENGINE_STORE for server-side compatibility.
 */
function getOnboardingTaskForClient(
  clientId: string,
  projects?: Project[],
  tasks?: Task[]
): Task | undefined {
  const projectsList = projects ?? ENGINE_STORE.projects;
  const tasksList = tasks ?? ENGINE_STORE.tasks;
  const project = projectsList.find((p) => p.clientId === clientId);
  if (!project) return undefined;
  return tasksList.find(
    (t) => t.projectId === project.id && !!t.linkedOnboardingId
  );
}

/**
 * Returns the project for a clientId from the provided data array.
 */
function getProjectForClient(clientId: string, projects?: Project[]) {
  const projectsList = projects ?? ENGINE_STORE.projects;
  return projectsList.find((p) => p.clientId === clientId);
}

// ─── Onboarding task status helpers ───────────────────────────────────────────

type OnboardingTaskStatus =
  | "no-project"        // no engine project exists
  | "not-started"       // task exists, status = Open
  | "in-progress"       // task exists, status = In Progress / Waiting / Review
  | "blocked"           // task exists, status = Blocked
  | "complete";         // task exists, status = Completed

function getOnboardingTaskStatus(
  clientId: string,
  projects?: Project[],
  tasks?: Task[]
): OnboardingTaskStatus {
  const task = getOnboardingTaskForClient(clientId, projects, tasks);
  if (!task) return "no-project";
  switch (task.status) {
    case "Completed":   return "complete";
    case "Blocked":     return "blocked";
    case "Open":        return "not-started";
    default:            return "in-progress"; // In Progress, Waiting, Review
  }
}

function onboardingStatusBadgeStyle(s: OnboardingTaskStatus): {
  bg: string; color: string; border: string; label: string;
} {
  switch (s) {
    case "complete":
      return { bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7", label: "✓ Onboarding Complete" };
    case "in-progress":
      return { bg: "#DBEAFE", color: "#1E40AF", border: "#93C5FD", label: "In Progress" };
    case "blocked":
      return { bg: "#FEE2E2", color: "#991B1B", border: "#FCA5A5", label: "Blocked" };
    case "not-started":
      return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1", label: "Not Started" };
    case "no-project":
      return { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D", label: "No Project Yet" };
  }
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

// ─── Queue tab: cleared clients (entry queue) ─────────────────────────────────

const QUEUE_ACTIVATION_STATUSES: ActivationStatus[] = [
  "AM Assignment Needed",
  "Ready for Onboarding",
  "Onboarding Pending",
  "Department Activation Pending",
];

/** Clients cleared by Billing and not yet fully Active */
function getClearedQueueClients(clients?: MasterClient[]): MasterClient[] {
  const clientsList = clients ?? MASTER_CLIENTS;
  return clientsList.filter(
    (c) => c.cleared === true && c.activationStatus !== "Active"
  );
}

// ─── Queue row ────────────────────────────────────────────────────────────────

function QueueClientRow({
  client,
  obRecord,
  onOpenRecord,
  liveProjects,
  liveTasks,
}: {
  client: MasterClient;
  obRecord: AMOnboardingRecord | undefined;
  onOpenRecord: (recordId: string) => void;
  liveProjects: Project[];
  liveTasks: Task[];
}) {
  const health   = computeHealth(client);
  const project  = getProjectForClient(client.id, liveProjects);
  const obTask   = getOnboardingTaskForClient(client.id, liveProjects, liveTasks);
  const taskStatus = getOnboardingTaskStatus(client.id, liveProjects, liveTasks);
  const badge    = onboardingStatusBadgeStyle(taskStatus);

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

      {/* Project */}
      <td className="px-4 py-3 whitespace-nowrap">
        {project ? (
          <div>
            <p className="text-xs font-semibold text-emerald-700">✓ Activated</p>
            <p className="text-[10px] text-slate-400 max-w-[140px] truncate">{project.name}</p>
          </div>
        ) : (
          <span className="text-xs text-amber-600 font-semibold">Not activated</span>
        )}
      </td>

      {/* Onboarding Task Status (engine-driven) */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
          style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}
        >
          {badge.label}
        </span>
        {obTask && (
          <p className="text-[10px] text-slate-400 mt-0.5">
            Due: {obTask.dueDate ? fmt(obTask.dueDate) : "—"}
          </p>
        )}
      </td>

      {/* Action */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          {!project ? (
            // No project: send AM to Projects page with this client pre-selected
            // so the 2-step wizard auto-opens for the specific client clicked.
            <Link
              href={`/account-management/projects?activateClientId=${client.id}`}
              className="rounded-lg bg-blue-600 border border-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors text-center"
            >
              Activate Project →
            </Link>
          ) : obRecord ? (
            // Project + record exist: open onboarding form directly
            <button
              onClick={() => onOpenRecord(obRecord.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                taskStatus === "complete"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {taskStatus === "complete" ? "View Onboarding" : "Open Onboarding Form →"}
            </button>
          ) : (
            // Project exists but record not yet created (edge: pre-wizard seed state)
            <Link
              href="/account-management/projects"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-center"
            >
              View Project →
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Queue tab ─────────────────────────────────────────────────────────────────

function QueueTab({
  allRecords,
  onOpenRecord,
  liveProjects,
  liveTasks,
  liveClients,
}: {
  allRecords: AMOnboardingRecord[];
  onOpenRecord: (recordId: string) => void;
  liveProjects: Project[];
  liveTasks: Task[];
  liveClients: MasterClient[];
}) {
  const [search, setSearch] = useState("");
  const [activationFilter, setActivationFilter] = useState<ActivationStatus | "All">("All");
  const [amFilter, setAmFilter] = useState("All");
  const [taskStatusFilter, setTaskStatusFilter] = useState<OnboardingTaskStatus | "All">("All");

  const CLEARED_CLIENTS = getClearedQueueClients(liveClients);

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
    const matchesTaskStatus =
      taskStatusFilter === "All" || getOnboardingTaskStatus(c.id, liveProjects, liveTasks) === taskStatusFilter;
    return matchesSearch && matchesActivation && matchesAM && matchesTaskStatus;
  });

  // ── Task-driven KPIs ───────────────────────────────────────────────────────
  const total = CLEARED_CLIENTS.length;

  // "No project" = not yet activated
  const noProject = CLEARED_CLIENTS.filter(
    (c) => getOnboardingTaskStatus(c.id, liveProjects, liveTasks) === "no-project"
  ).length;

  // Onboarding in progress = task exists and is In Progress / Waiting / not complete
  const onboardingInProgress = CLEARED_CLIENTS.filter(
    (c) => getOnboardingTaskStatus(c.id, liveProjects, liveTasks) === "in-progress"
  ).length;

  // Onboarding blocked
  const onboardingBlocked = CLEARED_CLIENTS.filter(
    (c) => getOnboardingTaskStatus(c.id, liveProjects, liveTasks) === "blocked"
  ).length;

  // Onboarding complete = task marked Completed
  const onboardingComplete = CLEARED_CLIENTS.filter(
    (c) => getOnboardingTaskStatus(c.id, liveProjects, liveTasks) === "complete"
  ).length;

  // Needs AM assignment (pre-project, AM not yet assigned)
  const needsAssignment = CLEARED_CLIENTS.filter(
    (c) => c.activationStatus === "AM Assignment Needed"
  ).length;

  // Cleared MRR
  const totalMrr = CLEARED_CLIENTS.reduce((sum, c) => sum + c.monthlyValue, 0);

  return (
    <div className="space-y-5">
      {/* Cleared flag explanation */}
      <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
        <span className="text-xs font-semibold text-emerald-800">
          Cleared = Billing has confirmed payment, activated services, and handed off to AM.
          Activating a project automatically creates the Onboarding task and intake form.
        </span>
      </div>

      {/* KPI row — task-driven */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Cleared (Not Active)"    value={String(total)} />
        <KpiCard
          title="Needs AM Assignment"
          value={String(needsAssignment)}
          risk={needsAssignment > 0 ? "at-risk" : "healthy"}
        />
        <KpiCard
          title="No Project Yet"
          value={String(noProject)}
          risk={noProject > 0 ? "at-risk" : "healthy"}
        />
        <KpiCard title="Onboarding In Progress"  value={String(onboardingInProgress)} />
        <KpiCard
          title="Onboarding Blocked"
          value={String(onboardingBlocked)}
          risk={onboardingBlocked > 0 ? "critical" : "healthy"}
        />
        <KpiCard title="Onboarding Complete"     value={String(onboardingComplete)} />
      </div>

      {/* Cleared MRR strip */}
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex items-center gap-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cleared MRR</span>
        <span className="text-xl font-bold text-slate-900">${totalMrr.toLocaleString()}</span>
        <span className="text-xs text-slate-400 italic">Billing-owned, read-only</span>
      </div>

      {/* Flow explainer */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Flow:</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
          1 · Activate Project (wizard)
        </span>
        <span className="text-blue-300 text-sm">→</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          2 · Onboarding Task #1 auto-created
        </span>
        <span className="text-blue-300 text-sm">→</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          3 · AM opens form → fills fields + kickoff
        </span>
        <span className="text-blue-300 text-sm">→</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
          Onboarding Complete
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
          value={taskStatusFilter}
          onChange={(e) => setTaskStatusFilter(e.target.value as OnboardingTaskStatus | "All")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="All">All Onboarding Statuses</option>
          <option value="no-project">No Project Yet</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="complete">Complete</option>
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
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned AM</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Health</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Project</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Onboarding Task</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((client) => (
                <QueueClientRow
                  key={client.id}
                  client={client}
                  obRecord={allRecords.find((r) => r.clientId === client.id)}
                  onOpenRecord={onOpenRecord}
                  liveProjects={liveProjects}
                  liveTasks={liveTasks}
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
              Active Services, MRR, and Cleared flag are Billing-owned — read-only
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Onboarding status badge (for Records tab) ─────────────────────────────────

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

// ─── Progress bar (for Records tab) ───────────────────────────────────────────

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

function RecordsTab({ allRecords, onOpenRecord }: { allRecords: AMOnboardingRecord[]; onOpenRecord: (recordId: string) => void }) {
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

  const records = allRecords;
  const total = records.length;
  const amInProgress   = records.filter((r) => r.status === "AM In Progress").length;
  const sentToClient   = records.filter((r) => r.status === "Sent to Client").length;
  const readyForKickoff = records.filter((r) => r.status === "Ready for Kickoff").length;
  const complete       = records.filter((r) => r.status === "Complete").length;
  const hasProject     = records.filter((r) => r.projectId !== null).length;

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
          Onboarding records are created automatically when you activate a project for a cleared
          client via the{" "}
          <Link href="/account-management/projects" className="text-blue-600 underline">
            Project Activation Center
          </Link>
          .
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
              const sum    = getFieldAssignmentSummary(record);
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
                      <span className="text-xs font-medium text-emerald-600">✓ Linked</span>
                    ) : (
                      <span className="text-xs text-slate-300 italic">Not linked</span>
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
  const [allRecords, setAllRecords] = useState<AMOnboardingRecord[]>([]);
  const [liveProjects, setLiveProjects] = useState<Project[]>(() => ENGINE_STORE.projects);
  const [liveTasks,    setLiveTasks]    = useState<Task[]>(() => ENGINE_STORE.tasks);
  const [liveClients,  setLiveClients]  = useState<MasterClient[]>(() => MASTER_CLIENTS);

  const loadRecords = useCallback(async () => {
    const records = await getAllOnboardingRecords();
    setAllRecords(records);
  }, []);

  const loadEngineData = useCallback(async () => {
    try {
      const [projectsRes, tasksRes, clientsRes] = await Promise.all([
        fetch("/api/engine?resource=projects"),
        fetch("/api/engine?resource=tasks"),
        fetch("/api/master-clients"),
      ]);
      if (projectsRes.ok) {
        const d = await projectsRes.json() as { projects: Project[] };
        setLiveProjects(d.projects);
      }
      if (tasksRes.ok) {
        const d = await tasksRes.json() as { tasks: Task[] };
        setLiveTasks(d.tasks);
      }
      if (clientsRes.ok) {
        const d = await clientsRes.json() as { clients: MasterClient[] };
        setLiveClients(d.clients);
      }
    } catch {
      // Keep using seed data on fetch failure — non-fatal
    }
  }, []);

  useEffect(() => {
    void loadRecords();
    void loadEngineData();
  }, [loadRecords, loadEngineData]);

  function handleOpenRecord(recordId: string) {
    router.push(`/account-management/onboarding/${recordId}`);
  }

  const recordCount = allRecords.length;
  const queueCount  = getClearedQueueClients(liveClients).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Onboarding Queue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Cleared clients awaiting project activation and onboarding. Status is driven by each
          client's Onboarding task (task #1 in their project), not a separate tracking system.
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
          allRecords={allRecords}
          onOpenRecord={handleOpenRecord}
          liveProjects={liveProjects}
          liveTasks={liveTasks}
          liveClients={liveClients}
        />
      ) : (
        <RecordsTab allRecords={allRecords} onOpenRecord={handleOpenRecord} />
      )}
    </div>
  );
}
