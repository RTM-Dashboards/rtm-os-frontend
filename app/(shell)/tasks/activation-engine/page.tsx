"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ENGINE_STORE } from "@/lib/engine/mock-data";
import type { Project, Task, DepartmentName } from "@/lib/engine/types";
import { MASTER_CLIENTS } from "@/lib/mock/master-clients";
import type { MasterClient } from "@/lib/mock/master-clients";

// =============================================================================
// Global Activation Engine
// Route: /tasks/activation-engine
//
// ADMIN-WIDE VIEW of the real activation pipeline sourced from:
//   - MASTER_CLIENTS  → cleared clients awaiting activation (no engine project yet)
//   - ENGINE_STORE    → activated projects / tasks / department breakdowns
//
// AM's 2-step wizard (/account-management/account-management/projects) remains
// the SOLE activation mechanism. This page is a read-only observatory + CTA to
// the wizard. No "Run Activation" button exists here.
// =============================================================================

// ---------------------------------------------------------------------------
// Real-data derivation helpers
// ---------------------------------------------------------------------------

/** Clients that billing has cleared but who have no engine project yet. */
function getClearedAwaitingActivation(
  clients: MasterClient[],
  projects: Project[]
): MasterClient[] {
  const activatedClientIds = new Set(
    projects.filter((p) => p.clientId).map((p) => p.clientId!)
  );
  return clients.filter((c) => c.cleared && !activatedClientIds.has(c.id));
}

/** Engine projects tied to a real MASTER_CLIENTS record (clientId is set). */
function getActivatedProjects(projects: Project[]): Project[] {
  return projects.filter((p) => p.clientId && p.clientId !== "");
}

/** Tasks belonging to real client projects (non-queue, non-department-container). */
function getClientProjectTasks(projects: Project[], tasks: Task[]): Task[] {
  const clientProjectIds = new Set(
    projects.filter((p) => p.clientId && p.clientId !== "").map((p) => p.id)
  );
  return tasks.filter((t) => clientProjectIds.has(t.projectId));
}

/** Group tasks by department for the department workload summary. */
function groupByDepartment(tasks: Task[]): Map<DepartmentName, Task[]> {
  const map = new Map<DepartmentName, Task[]>();
  for (const t of tasks) {
    const bucket = map.get(t.department) ?? [];
    bucket.push(t);
    map.set(t.department, bucket);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

function healthColor(h: string) {
  switch (h) {
    case "Green":  return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    case "Yellow": return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Red":    return { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
    default:       return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

function statusColor(s: string) {
  switch (s) {
    case "Completed":     return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    case "In Progress":   return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
    case "Pending Client":return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Blocked":       return { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
    default:              return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

function billingStatusColor(c: MasterClient) {
  if (c.billingStatus === "Overdue" || c.paymentStatus === "Overdue")
    return { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
  if (c.billingStatus === "Cleared" || c.billingStatus === "Paid")
    return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
  return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
}

const DEPT_COLORS: Record<string, string> = {
  SEO:                "bg-emerald-50 text-emerald-700 border-emerald-200",
  GBP:                "bg-blue-50 text-blue-700 border-blue-200",
  PPC:                "bg-violet-50 text-violet-700 border-violet-200",
  "Meta Ads":         "bg-indigo-50 text-indigo-700 border-indigo-200",
  LSA:                "bg-amber-50 text-amber-700 border-amber-200",
  Reporting:          "bg-gray-50 text-gray-700 border-gray-200",
  "Web Development":  "bg-cyan-50 text-cyan-700 border-cyan-200",
  Design:             "bg-pink-50 text-pink-700 border-pink-200",
  "Account Management": "bg-teal-50 text-teal-700 border-teal-200",
  Content:            "bg-lime-50 text-lime-700 border-lime-200",
};

function DeptBadge({ dept }: { dept: string }) {
  const cls = DEPT_COLORS[dept] ?? "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {dept}
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  highlight?: "blue" | "green" | "red" | "amber";
}) {
  const colorMap = {
    blue:  "text-blue-700",
    green: "text-emerald-600",
    red:   "text-red-600",
    amber: "text-amber-600",
  };
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: "var(--rtm-text-secondary)" }}
      >
        {label}
      </span>
      <span
        className={`text-2xl font-black ${highlight ? colorMap[highlight] : ""}`}
        style={!highlight ? { color: "var(--rtm-text-primary)" } : undefined}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cleared-Client Detail Drawer
// ---------------------------------------------------------------------------

function ClearedClientDrawer({
  client,
  onClose,
}: {
  client: MasterClient;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-200 bg-gray-50"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              Cleared Client — Awaiting Activation
            </span>
            <h2 className="text-xl font-bold text-gray-900">{client.clientName}</h2>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                style={billingStatusColor(client)}
              >
                Billing: {client.billingStatus}
              </span>
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
              >
                {client.activationStatus}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-1 text-gray-400 hover:text-gray-700 text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Key fields */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Industry", client.industry],
              ["Assigned AM", client.assignedAM],
              ["Billing Owner", client.billingOwner],
              ["Monthly Value", `$${client.monthlyValue.toLocaleString()}/mo`],
              ["Payment Status", client.paymentStatus],
              ["Invoice Status", client.invoiceStatus],
              ["Onboarding Status", client.onboardingStatus],
              ["Last Activity", client.lastActivity],
            ].map(([k, v]) => (
              <div
                key={k}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <span className="text-xs text-gray-400 uppercase tracking-wide">{k}</span>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Active services */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Contracted Services
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

          {/* Activation checklist */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Activation Checklist
            </p>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              {Object.entries({
                "Invoice Paid":          client.activationChecklist.invoicePaid,
                "Billing Cleared":       client.activationChecklist.billingCleared,
                "Contract Confirmed":    client.activationChecklist.contractConfirmed,
                "Services Confirmed":    client.activationChecklist.servicesConfirmed,
                "Contact Verified":      client.activationChecklist.clientContactVerified,
                "AM Assigned":           client.activationChecklist.amAssigned,
                "Activation Tasks Created": client.activationChecklist.activationTasksCreated,
                "Onboarding Record":     client.activationChecklist.onboardingRecordCreated,
              }).map(([label, done]) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-600">{label}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      done
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {done ? "✓ Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">
                Notes
              </p>
              <p className="text-sm text-amber-900">{client.notes}</p>
            </div>
          )}

          {/* Next required action */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
              Next Required Action
            </p>
            <p className="text-sm font-medium text-blue-800">{client.nextRequiredAction}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-2 flex-wrap shrink-0">
          <Link
            href="/account-management/account-management/projects"
            className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Activate via AM Wizard →
          </Link>
          <Link
            href={`/clients/${client.slug}`}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            View Client →
          </Link>
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

// ---------------------------------------------------------------------------
// Activated Project Detail Drawer
// ---------------------------------------------------------------------------

function ProjectDrawer({
  project,
  tasks,
  masterClient,
  onClose,
}: {
  project: Project;
  tasks: Task[];
  masterClient: MasterClient | undefined;
  onClose: () => void;
}) {
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const openTasks      = projectTasks.filter((t) => t.status === "Open" || t.status === "In Progress");
  const blockedTasks   = projectTasks.filter((t) => t.status === "Blocked");
  const completedTasks = projectTasks.filter((t) => t.status === "Completed");

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              Activated Project
            </span>
            <h2 className="text-lg font-bold text-gray-900">{project.name}</h2>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                style={statusColor(project.status)}
              >
                {project.status}
              </span>
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                style={healthColor(project.health)}
              >
                Health: {project.health}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-1 text-gray-400 hover:text-gray-700 text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Summary grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ["AM", project.accountManager],
              ["Owner", project.owner],
              ["Launch Date", project.launchDate],
              ["Priority", project.priority],
              ["Total Tasks", projectTasks.length.toString()],
              ["Open", openTasks.length.toString()],
              ["Blocked", blockedTasks.length.toString()],
              ["Completed", completedTasks.length.toString()],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <span className="text-xs text-gray-400 uppercase tracking-wide">{k}</span>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Departments */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Departments
            </p>
            <div className="flex flex-wrap gap-2">
              {project.departments.map((d) => (
                <DeptBadge key={d.department} dept={d.department} />
              ))}
            </div>
          </div>

          {/* Master client data */}
          {masterClient && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-100">
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-xs text-gray-500">Monthly Value</span>
                <span className="text-xs font-semibold text-gray-800">
                  ${masterClient.monthlyValue.toLocaleString()}/mo
                </span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-xs text-gray-500">Active Services</span>
                <span className="text-xs font-semibold text-gray-800">
                  {masterClient.activeServices.join(", ") || "—"}
                </span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-xs text-gray-500">Client Health</span>
                <span className="text-xs font-semibold text-gray-800">
                  {masterClient.clientHealth}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          {project.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-blue-900">{project.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-2 flex-wrap shrink-0">
          <Link
            href={`/projects/${project.id}`}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Manage Project →
          </Link>
          {masterClient && (
            <Link
              href={`/clients/${masterClient.slug}`}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              View Client →
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

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ActivationEnginePage() {
  const [selectedCleared, setSelectedCleared] = useState<MasterClient | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");

  // Live data — initialized from in-memory seed, hydrated from file-backed API on mount
  const [liveProjects, setLiveProjects] = useState<Project[]>(() => ENGINE_STORE.projects);
  const [liveTasks,    setLiveTasks]    = useState<Task[]>(() => ENGINE_STORE.tasks);
  const [liveClients,  setLiveClients]  = useState<MasterClient[]>(() => MASTER_CLIENTS);

  const refreshData = useCallback(async () => {
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

  useEffect(() => { void refreshData(); }, [refreshData]);

  // ── Derive all data from real sources ────────────────────────────────────

  const { clearedAwaiting, activatedProjects, clientTasks, deptBreakdown, kpis } =
    useMemo(() => {
      const allProjects = liveProjects;
      const allTasks    = liveTasks;
      const allClients  = liveClients;

      const clearedAwaiting  = getClearedAwaitingActivation(allClients, allProjects);
      const activatedProjects = getActivatedProjects(allProjects);
      const clientTasks      = getClientProjectTasks(allProjects, allTasks);
      const deptBreakdown    = groupByDepartment(clientTasks);

      const blockedClients = allClients.filter(
        (c) =>
          c.cleared &&
          (c.billingStatus === "Overdue" || c.paymentStatus === "Overdue")
      );

      const kpis = {
        readyForActivation:    clearedAwaiting.length,
        activatedProjects:     activatedProjects.length,
        totalClientTasks:      clientTasks.length,
        openTasks:             clientTasks.filter((t) => t.status === "Open" || t.status === "In Progress").length,
        blockedTasks:          clientTasks.filter((t) => t.status === "Blocked").length,
        completedTasks:        clientTasks.filter((t) => t.status === "Completed").length,
        deptsActive:           deptBreakdown.size,
        billingBlocked:        blockedClients.length,
      };

      return { clearedAwaiting, activatedProjects, clientTasks, deptBreakdown, kpis };
    }, [liveProjects, liveTasks, liveClients]);

  // ── Filtered views ────────────────────────────────────────────────────────

  const filteredCleared = useMemo(
    () =>
      search.trim()
        ? clearedAwaiting.filter((c) =>
            c.clientName.toLowerCase().includes(search.toLowerCase())
          )
        : clearedAwaiting,
    [clearedAwaiting, search]
  );

  const filteredProjects = useMemo(
    () =>
      search.trim()
        ? activatedProjects.filter((p) =>
            p.client.toLowerCase().includes(search.toLowerCase()) ||
            p.name.toLowerCase().includes(search.toLowerCase())
          )
        : activatedProjects,
    [activatedProjects, search]
  );

  const selectedProjectMC = selectedProject?.clientId
    ? liveClients.find((c) => c.id === selectedProject.clientId)
    : undefined;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--rtm-blue)" }}
            >
              Projects &amp; Tasks
            </p>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>›</span>
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Activation Engine
            </p>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Activation Engine
          </h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--rtm-text-secondary)" }}>
            Admin-wide view of the real activation pipeline. Cleared clients awaiting activation
            are derived from MASTER_CLIENTS; activated projects and task breakdowns come from the
            engine. Activation is performed by AM via the{" "}
            <Link
              href="/account-management/account-management/projects"
              className="font-semibold underline"
              style={{ color: "var(--rtm-blue)" }}
            >
              Projects wizard
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Link
            href="/account-management/account-management/projects"
            className="px-4 py-2 text-sm font-bold rounded-lg text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            Activate via AM Wizard →
          </Link>
          <Link
            href="/tasks/activation-rules"
            className="px-4 py-2 text-sm font-semibold rounded-lg border"
            style={{
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
              background: "var(--rtm-surface)",
            }}
          >
            Activation Rules
          </Link>
          <Link
            href="/tasks/templates"
            className="px-4 py-2 text-sm font-semibold rounded-lg border"
            style={{
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
              background: "var(--rtm-surface)",
            }}
          >
            Task Templates
          </Link>
        </div>
      </div>

      {/* ── Flow indicator ── */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-center gap-2"
        style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE" }}
      >
        {[
          "Billing Clears Client",
          "AM Runs Wizard",
          "Engine Project Created",
          "Tasks Generated",
          "Depts Activated",
          "Onboarding Handoff",
        ].map((step, i, arr) => (
          <span key={step} className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white"
              style={{ color: "#1E40AF", border: "1px solid #BFDBFE" }}
            >
              {step}
            </span>
            {i < arr.length - 1 && (
              <span className="font-black" style={{ color: "#93C5FD" }}>
                →
              </span>
            )}
          </span>
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard
          label="Ready for Activation"
          value={kpis.readyForActivation}
          sub="cleared, no project yet"
          highlight="blue"
        />
        <KpiCard
          label="Activated Projects"
          value={kpis.activatedProjects}
          sub="engine projects w/ clientId"
          highlight="green"
        />
        <KpiCard
          label="Total Client Tasks"
          value={kpis.totalClientTasks}
          sub="across all client projects"
        />
        <KpiCard
          label="Open / In Progress"
          value={kpis.openTasks}
          sub="tasks in flight"
          highlight="blue"
        />
        <KpiCard
          label="Blocked Tasks"
          value={kpis.blockedTasks}
          sub="need attention"
          highlight={kpis.blockedTasks > 0 ? "red" : undefined}
        />
        <KpiCard
          label="Completed Tasks"
          value={kpis.completedTasks}
          sub="finished"
          highlight="green"
        />
        <KpiCard
          label="Depts Active"
          value={kpis.deptsActive}
          sub="departments with tasks"
        />
        <KpiCard
          label="Billing Blocked"
          value={kpis.billingBlocked}
          sub="cleared + overdue billing"
          highlight={kpis.billingBlocked > 0 ? "amber" : undefined}
        />
      </div>

      {/* ── Search ── */}
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
      >
        <input
          type="text"
          placeholder="Search clients or projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm rounded-lg outline-none"
          style={{
            border: "1px solid var(--rtm-border)",
            background: "var(--rtm-bg)",
            color: "var(--rtm-text-primary)",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs font-semibold"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Section A: Cleared Clients Awaiting Activation ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--rtm-border)" }}
        >
          <div>
            <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
              Cleared Clients — Awaiting Activation
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              MASTER_CLIENTS where{" "}
              <code className="bg-gray-100 px-1 rounded text-[10px]">cleared = true</code> and no
              engine project exists yet. Activate via AM wizard.
            </p>
          </div>
          <Link
            href="/account-management/account-management/projects"
            className="px-3 py-1.5 text-xs font-bold rounded-lg text-white flex-none"
            style={{ background: "var(--rtm-blue)" }}
          >
            Go to AM Wizard →
          </Link>
        </div>

        {filteredCleared.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
              {search ? "No cleared clients match your search." : "All cleared clients have been activated."}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
              {!search && "New cleared clients will appear here once billing marks them as cleared."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "2px solid var(--rtm-border)",
                }}
              >
                <tr>
                  {[
                    "Client",
                    "Industry",
                    "Assigned AM",
                    "Active Services",
                    "Monthly Value",
                    "Billing Status",
                    "Activation Status",
                    "Next Action",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--rtm-text-secondary)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCleared.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/20 transition-colors"
                    style={{
                      borderBottom:
                        idx < filteredCleared.length - 1
                          ? "1px solid var(--rtm-border-light)"
                          : undefined,
                    }}
                  >
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCleared(c)}
                        className="font-semibold hover:underline text-left"
                        style={{ color: "var(--rtm-blue)" }}
                      >
                        {c.clientName}
                      </button>
                    </td>
                    <td
                      className="px-4 py-3 text-xs whitespace-nowrap"
                      style={{ color: "var(--rtm-text-secondary)" }}
                    >
                      {c.industry}
                    </td>
                    <td
                      className="px-4 py-3 text-xs whitespace-nowrap"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {c.assignedAM}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {c.activeServices.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                        {c.activeServices.length > 3 && (
                          <span
                            className="text-[10px]"
                            style={{ color: "var(--rtm-text-muted)" }}
                          >
                            +{c.activeServices.length - 3}
                          </span>
                        )}
                        {c.activeServices.length === 0 && (
                          <span
                            className="text-[10px]"
                            style={{ color: "var(--rtm-text-muted)" }}
                          >
                            None confirmed
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-xs font-semibold whitespace-nowrap"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      ${c.monthlyValue.toLocaleString()}/mo
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                        style={billingStatusColor(c)}
                      >
                        {c.billingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                        style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                      >
                        {c.activationStatus}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 max-w-[200px] text-xs"
                      style={{ color: "var(--rtm-text-secondary)" }}
                    >
                      {c.nextRequiredAction}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => setSelectedCleared(c)}
                          className="text-[11px] font-semibold hover:underline whitespace-nowrap"
                          style={{ color: "var(--rtm-blue)" }}
                        >
                          View
                        </button>
                        <Link
                          href="/account-management/account-management/projects"
                          className="text-[11px] font-semibold hover:underline whitespace-nowrap"
                          style={{ color: "#059669" }}
                        >
                          Activate →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section B: Activated Projects ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--rtm-border)" }}
        >
          <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
            Activated Projects
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Engine projects linked to MASTER_CLIENTS records (
            <code className="bg-gray-100 px-1 rounded text-[10px]">clientId</code> is set). Created
            by AM wizard.
          </p>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
              {search
                ? "No activated projects match your search."
                : "No activated projects yet. Use the AM wizard to activate a cleared client."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "2px solid var(--rtm-border)",
                }}
              >
                <tr>
                  {[
                    "Project",
                    "Client",
                    "AM",
                    "Departments",
                    "Status",
                    "Health",
                    "Tasks",
                    "Launch Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--rtm-text-secondary)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p, idx) => {
                  const projectTaskCount = clientTasks.filter((t) => t.projectId === p.id).length;
                  const mc = liveClients.find((c) => c.id === p.clientId);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/20 transition-colors"
                      style={{
                        borderBottom:
                          idx < filteredProjects.length - 1
                            ? "1px solid var(--rtm-border-light)"
                            : undefined,
                      }}
                    >
                      <td className="px-4 py-3 font-semibold whitespace-nowrap max-w-[220px]">
                        <button
                          onClick={() => setSelectedProject(p)}
                          className="font-semibold hover:underline text-left text-sm line-clamp-2"
                          style={{ color: "var(--rtm-blue)" }}
                        >
                          {p.name}
                        </button>
                      </td>
                      <td
                        className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {p.client}
                      </td>
                      <td
                        className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {p.accountManager}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {p.departments.slice(0, 3).map((d) => (
                            <DeptBadge key={d.department} dept={d.department} />
                          ))}
                          {p.departments.length > 3 && (
                            <span
                              className="text-[10px]"
                              style={{ color: "var(--rtm-text-muted)" }}
                            >
                              +{p.departments.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                          style={statusColor(p.status)}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                          style={healthColor(p.health)}
                        >
                          {p.health}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-xs font-semibold"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {projectTaskCount}
                      </td>
                      <td
                        className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {p.launchDate}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => setSelectedProject(p)}
                            className="text-[11px] font-semibold hover:underline whitespace-nowrap"
                            style={{ color: "var(--rtm-blue)" }}
                          >
                            View
                          </button>
                          <Link
                            href={`/projects/${p.id}`}
                            className="text-[11px] font-semibold hover:underline whitespace-nowrap"
                            style={{ color: "#059669" }}
                          >
                            Manage →
                          </Link>
                          {mc && (
                            <Link
                              href="/account-management/account-management/onboarding"
                              className="text-[11px] font-semibold hover:underline whitespace-nowrap"
                              style={{ color: "#7C3AED" }}
                            >
                              Onboarding →
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section C: Department Workload Summary ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--rtm-border)" }}
        >
          <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
            Department Workload — Client Projects
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Real engine tasks grouped by department, scoped to client projects (
            <code className="bg-gray-100 px-1 rounded text-[10px]">clientId</code> set). Excludes
            department queue containers.
          </p>
        </div>

        {deptBreakdown.size === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
              No client project tasks yet. Activate a client via the AM wizard to generate tasks.
            </p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from(deptBreakdown.entries()).map(([dept, tasks]) => {
              const open      = tasks.filter((t) => t.status === "Open" || t.status === "In Progress").length;
              const blocked   = tasks.filter((t) => t.status === "Blocked").length;
              const completed = tasks.filter((t) => t.status === "Completed").length;
              const cls = DEPT_COLORS[dept] ?? "bg-gray-50 border-gray-200 text-gray-700";
              return (
                <div
                  key={dept}
                  className={`rounded-xl border p-4 flex flex-col gap-3 ${cls}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{dept}</span>
                    <span className="text-xs font-semibold bg-white/70 px-2 py-0.5 rounded-full">
                      {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                    <div className="bg-white/60 rounded px-2 py-1 text-center">
                      <div className="text-base font-black">{open}</div>
                      <div className="opacity-70">Open</div>
                    </div>
                    <div
                      className={`bg-white/60 rounded px-2 py-1 text-center ${
                        blocked > 0 ? "ring-1 ring-red-400" : ""
                      }`}
                    >
                      <div
                        className={`text-base font-black ${blocked > 0 ? "text-red-600" : ""}`}
                      >
                        {blocked}
                      </div>
                      <div className="opacity-70">Blocked</div>
                    </div>
                    <div className="bg-white/60 rounded px-2 py-1 text-center">
                      <div className="text-base font-black text-emerald-600">{completed}</div>
                      <div className="opacity-70">Done</div>
                    </div>
                  </div>
                  <Link
                    href="/tasks/department-activation"
                    className="text-[11px] font-semibold hover:underline self-start opacity-80"
                  >
                    View in Dept Activation →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Detail Drawers ── */}
      {selectedCleared && (
        <ClearedClientDrawer
          client={selectedCleared}
          onClose={() => setSelectedCleared(null)}
        />
      )}
      {selectedProject && (
        <ProjectDrawer
          project={selectedProject}
          tasks={clientTasks}
          masterClient={selectedProjectMC}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
