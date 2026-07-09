"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ENGINE_STORE } from "@/lib/engine/mock-data";
import type { Task, Project, DepartmentName } from "@/lib/engine/types";
import { MASTER_CLIENTS } from "@/lib/mock/master-clients";
import type { MasterClient } from "@/lib/mock/master-clients";

// =============================================================================
// Department Activation
// Route: /tasks/department-activation
//
// ADMIN-WIDE VIEW of real department task workloads for activated client
// projects, sourced entirely from ENGINE_STORE + MASTER_CLIENTS.
//
// Data derivation:
//   - "Client projects"  → ENGINE_STORE.projects where clientId is set
//   - "Dept queue"       → ENGINE_STORE.tasks grouped by department,
//                          scoped to those client projects
//   - "Blueprint tasks"  → same ENGINE_STORE.tasks where source = "Task Blueprint"
//
// AM's 2-step wizard (/account-management/account-management/projects) is the
// sole activation mechanism. This page reflects its outputs.
// =============================================================================

// ---------------------------------------------------------------------------
// Real-data helpers
// ---------------------------------------------------------------------------

/** Projects that were created for a real MASTER_CLIENTS client. */
function getClientProjects(projects: Project[]): Project[] {
  return projects.filter(
    (p) =>
      p.clientId &&
      p.clientId !== "" &&
      // Exclude department queue containers (their ids all start with proj-wt-)
      !p.id.startsWith("proj-wt-")
  );
}

/** Tasks belonging to real client projects (non-queue containers). */
function getClientTasks(clientProjects: Project[], tasks: Task[]): Task[] {
  const ids = new Set(clientProjects.map((p) => p.id));
  return tasks.filter((t) => ids.has(t.projectId));
}

/** Group tasks by department. */
function groupByDept(tasks: Task[]): Map<DepartmentName, Task[]> {
  const map = new Map<DepartmentName, Task[]>();
  for (const t of tasks) {
    const bucket = map.get(t.department) ?? [];
    bucket.push(t);
    map.set(t.department, bucket);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

const DEPT_COLORS: Record<string, { bg: string; color: string; border: string; ring: string }> = {
  SEO:                { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", ring: "ring-blue-200" },
  GBP:                { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", ring: "ring-emerald-200" },
  PPC:                { bg: "#FAF5FF", color: "#7C3AED", border: "#DDD6FE", ring: "ring-violet-200" },
  "Meta Ads":         { bg: "#F0F9FF", color: "#0369A1", border: "#BAE6FD", ring: "ring-sky-200" },
  LSA:                { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", ring: "ring-amber-200" },
  Reporting:          { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1", ring: "ring-slate-200" },
  "Web Development":  { bg: "#ECFEFF", color: "#0891B2", border: "#A5F3FC", ring: "ring-cyan-200" },
  Design:             { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3", ring: "ring-rose-200" },
  "Account Management": { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", ring: "ring-green-200" },
  Content:            { bg: "#FAFAF5", color: "#65A30D", border: "#D9F99D", ring: "ring-lime-200" },
};

const DEFAULT_DEPT_STYLE = {
  bg: "#F8FAFC",
  color: "#475569",
  border: "#CBD5E1",
  ring: "ring-slate-200",
};

function DeptBadge({ dept }: { dept: string }) {
  const c = DEPT_COLORS[dept] ?? DEFAULT_DEPT_STYLE;
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {dept}
    </span>
  );
}

function taskStatusStyle(status: string) {
  switch (status) {
    case "Completed":    return { background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" };
    case "In Progress":  return { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" };
    case "Open":         return { background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" };
    case "Blocked":      return { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" };
    case "Waiting":      return { background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" };
    case "Review":       return { background: "#FAF5FF", color: "#7C3AED", border: "1px solid #DDD6FE" };
    case "Cancelled":    return { background: "#F1F5F9", color: "#94A3B8", border: "1px solid #E2E8F0" };
    default:             return { background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" };
  }
}

function priorityStyle(priority: string) {
  switch (priority) {
    case "Urgent": return { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" };
    case "High":   return { background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" };
    case "Medium": return { background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" };
    case "Low":    return { background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" };
    default:       return { background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" };
  }
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      <div className={`text-2xl font-black ${color ?? ""}`} style={!color ? { color: "var(--rtm-text-primary)" } : undefined}>
        {value}
      </div>
      <div
        className="mt-1 text-[11px] font-semibold leading-tight"
        style={{ color: "var(--rtm-text-secondary)" }}
      >
        {label}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Detail Drawer
// ---------------------------------------------------------------------------

function TaskDrawer({
  task,
  project,
  clients,
  onClose,
}: {
  task: Task;
  project: Project | undefined;
  clients: MasterClient[];
  onClose: () => void;
}) {
  const mc = project?.clientId
    ? clients.find((c) => c.id === project.clientId)
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              Task Detail
            </span>
            <h2 className="text-lg font-bold text-gray-900">{task.title}</h2>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <DeptBadge dept={task.department} />
              <span
                className="inline-flex items-center rounded-full text-xs font-semibold px-2 py-0.5"
                style={taskStatusStyle(task.status)}
              >
                {task.status}
              </span>
              <span
                className="inline-flex items-center rounded-full text-xs font-semibold px-2 py-0.5"
                style={priorityStyle(task.priority)}
              >
                {task.priority}
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

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Client", task.clientName],
              ["Project", task.projectName],
              ["Service", task.service],
              ["Source", task.source],
              ["Assigned To", task.assignedUserName ?? "Unassigned"],
              ["Due Date", task.dueDate],
              ["Est. Hours", task.estimatedHours?.toString() ?? "—"],
              ["Type", task.type],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <span className="text-xs text-gray-400 uppercase tracking-wide">{k}</span>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {task.description && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
                Description
              </p>
              <p className="text-sm text-blue-900">{task.description}</p>
            </div>
          )}

          {mc && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-100">
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-xs text-gray-500">Monthly Value</span>
                <span className="text-xs font-semibold">${mc.monthlyValue.toLocaleString()}/mo</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-xs text-gray-500">Client Health</span>
                <span className="text-xs font-semibold">{mc.clientHealth}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span className="text-xs text-gray-500">AM</span>
                <span className="text-xs font-semibold">{mc.assignedAM}</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-2 flex-wrap shrink-0">
          {project && (
            <Link
              href={`/projects/${project.id}`}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Manage Project →
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
// Department Section — queue + blueprint tasks for one department
// ---------------------------------------------------------------------------

function DepartmentSection({
  dept,
  tasks,
  projects,
  search,
  onSelectTask,
}: {
  dept: DepartmentName;
  tasks: Task[];
  projects: Project[];
  search: string;
  onSelectTask: (t: Task) => void;
}) {
  const c = DEPT_COLORS[dept] ?? DEFAULT_DEPT_STYLE;

  const filtered = search.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.clientName.toLowerCase().includes(search.toLowerCase())
      )
    : tasks;

  const blueprintTasks  = filtered.filter((t) => t.source === "Task Blueprint");
  const otherTasks      = filtered.filter((t) => t.source !== "Task Blueprint");

  const open      = filtered.filter((t) => t.status === "Open" || t.status === "In Progress").length;
  const blocked   = filtered.filter((t) => t.status === "Blocked").length;
  const completed = filtered.filter((t) => t.status === "Completed").length;

  if (filtered.length === 0) return null;

  const projectById = new Map(projects.map((p) => [p.id, p]));

  const renderTaskRow = (t: Task, idx: number, arr: Task[]) => (
    <tr
      key={t.id}
      className="hover:bg-blue-50/20 cursor-pointer transition-colors"
      style={{
        borderBottom: idx < arr.length - 1 ? "1px solid var(--rtm-border-light)" : undefined,
      }}
      onClick={() => onSelectTask(t)}
    >
      <td className="px-4 py-2.5">
        <div className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>
          {t.title}
        </div>
        {t.description && (
          <div
            className="text-[10px] mt-0.5 line-clamp-1"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {t.description}
          </div>
        )}
      </td>
      <td
        className="px-4 py-2.5 text-xs whitespace-nowrap"
        style={{ color: "var(--rtm-text-secondary)" }}
      >
        {t.clientName}
      </td>
      <td className="px-4 py-2.5 whitespace-nowrap">
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}
        >
          {t.service}
        </span>
      </td>
      <td className="px-4 py-2.5 whitespace-nowrap">
        <span
          className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold"
          style={priorityStyle(t.priority)}
        >
          {t.priority}
        </span>
      </td>
      <td
        className="px-4 py-2.5 text-xs whitespace-nowrap"
        style={{ color: "var(--rtm-text-secondary)" }}
      >
        {t.dueDate}
      </td>
      <td
        className="px-4 py-2.5 text-xs whitespace-nowrap"
        style={{
          color: t.assignedUserName ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)",
        }}
      >
        {t.assignedUserName ?? "Unassigned"}
      </td>
      <td className="px-4 py-2.5 whitespace-nowrap">
        <span
          className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold"
          style={taskStatusStyle(t.status)}
        >
          {t.status}
        </span>
      </td>
      <td className="px-4 py-2.5 whitespace-nowrap">
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px]"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", border: "1px solid var(--rtm-border)" }}
        >
          {t.source}
        </span>
      </td>
    </tr>
  );

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      {/* Department header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--rtm-border)", background: c.bg }}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm" style={{ color: c.color }}>
            {dept}
          </span>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: "white", color: c.color, border: `1px solid ${c.border}` }}
          >
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold" style={{ color: c.color }}>
          <span>{open} open</span>
          {blocked > 0 && (
            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              {blocked} blocked
            </span>
          )}
          <span className="text-emerald-700">{completed} done</span>
        </div>
      </div>

      {/* ── Blueprint Tasks ── */}
      {blueprintTasks.length > 0 && (
        <>
          <div
            className="px-5 py-2 text-[11px] font-bold uppercase tracking-wide"
            style={{
              color: "var(--rtm-text-secondary)",
              background: "var(--rtm-bg)",
              borderBottom: "1px solid var(--rtm-border-light)",
            }}
          >
            Blueprint-Activated Tasks ({blueprintTasks.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "2px solid var(--rtm-border)",
                }}
              >
                <tr>
                  {["Task", "Client", "Service", "Priority", "Due Date", "Assigned To", "Status", "Source"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-left text-[11px] font-black uppercase tracking-wide whitespace-nowrap"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {blueprintTasks.map((t, idx) => renderTaskRow(t, idx, blueprintTasks))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Other Tasks ── */}
      {otherTasks.length > 0 && (
        <>
          <div
            className="px-5 py-2 text-[11px] font-bold uppercase tracking-wide"
            style={{
              color: "var(--rtm-text-secondary)",
              background: "var(--rtm-bg)",
              borderTop: blueprintTasks.length > 0 ? "1px solid var(--rtm-border)" : undefined,
              borderBottom: "1px solid var(--rtm-border-light)",
            }}
          >
            Other Tasks ({otherTasks.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "2px solid var(--rtm-border)",
                }}
              >
                <tr>
                  {["Task", "Client", "Service", "Priority", "Due Date", "Assigned To", "Status", "Source"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-left text-[11px] font-black uppercase tracking-wide whitespace-nowrap"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {otherTasks.map((t, idx) => renderTaskRow(t, idx, otherTasks))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Empty for search */}
      {filtered.length === 0 && (
        <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
          No tasks match your search in this department.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DepartmentActivationPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<DepartmentName | "All">("All");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  // ── Derive real data ──────────────────────────────────────────────────────

  const { clientProjects, clientTasks, deptBreakdown, kpis } = useMemo(() => {
    const clientProjects = getClientProjects(liveProjects);
    const clientTasks    = getClientTasks(clientProjects, liveTasks);
    const deptBreakdown  = groupByDept(clientTasks);

    const kpis = {
      clientProjects:   clientProjects.length,
      totalTasks:       clientTasks.length,
      blueprintTasks:   clientTasks.filter((t) => t.source === "Task Blueprint").length,
      openTasks:        clientTasks.filter((t) => t.status === "Open" || t.status === "In Progress").length,
      blockedTasks:     clientTasks.filter((t) => t.status === "Blocked").length,
      completedTasks:   clientTasks.filter((t) => t.status === "Completed").length,
      deptsActive:      deptBreakdown.size,
      unassigned:       clientTasks.filter((t) => !t.assignedUserName || t.assignedUserName === "Unassigned").length,
    };

    return { clientProjects, clientTasks, deptBreakdown, kpis };
  }, [liveProjects, liveTasks]);

  const allDepts = useMemo<DepartmentName[]>(
    () => Array.from(deptBreakdown.keys()),
    [deptBreakdown]
  );

  // Filter department breakdown for display
  const displayBreakdown = useMemo<Map<DepartmentName, Task[]>>(() => {
    if (deptFilter === "All") return deptBreakdown;
    const filtered = deptBreakdown.get(deptFilter as DepartmentName);
    return filtered ? new Map([[deptFilter as DepartmentName, filtered]]) : new Map();
  }, [deptBreakdown, deptFilter]);

  const selectedTaskProject = selectedTask
    ? clientProjects.find((p) => p.id === selectedTask.projectId)
    : undefined;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
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
              Department Activation
            </p>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Department Activation
          </h1>
          <p
            className="mt-1 text-sm max-w-xl"
            style={{ color: "var(--rtm-text-secondary)" }}
          >
            Real engine tasks for activated client projects, grouped by department. Blueprint-activated
            and manually created tasks are shown separately. Activate clients via the{" "}
            <Link
              href="/account-management/account-management/projects"
              className="font-semibold underline"
              style={{ color: "var(--rtm-blue)" }}
            >
              AM Projects wizard
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/account-management/account-management/projects"
            className="px-4 py-2 text-sm font-bold rounded-lg text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            Activate via AM Wizard →
          </Link>
          <Link
            href="/tasks/activation-engine"
            className="px-4 py-2 text-sm font-semibold rounded-lg border"
            style={{
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
              background: "var(--rtm-surface)",
            }}
          >
            Activation Engine
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

      {/* ── Flow breadcrumb ── */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-center gap-2"
        style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE" }}
      >
        {[
          "AM Wizard Activates Client",
          "Engine Project Created",
          "Blueprints Applied",
          "Tasks Generated",
          "Dept Assignment",
          "Delivery Begins",
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard label="Client Projects" value={kpis.clientProjects} color="text-blue-700" />
        <KpiCard label="Total Tasks"     value={kpis.totalTasks}     color="text-slate-700" />
        <KpiCard label="Blueprint Tasks" value={kpis.blueprintTasks} color="text-violet-600" />
        <KpiCard label="Open / In Progress" value={kpis.openTasks}   color="text-blue-700" />
        <KpiCard
          label="Blocked"
          value={kpis.blockedTasks}
          color={kpis.blockedTasks > 0 ? "text-red-600" : "text-slate-400"}
        />
        <KpiCard label="Completed"     value={kpis.completedTasks}   color="text-emerald-600" />
        <KpiCard label="Depts Active"  value={kpis.deptsActive}      color="text-teal-700" />
        <KpiCard
          label="Unassigned"
          value={kpis.unassigned}
          color={kpis.unassigned > 0 ? "text-amber-600" : "text-slate-400"}
        />
      </div>

      {/* ── Filters ── */}
      <div
        className="rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center"
        style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
      >
        <input
          type="text"
          placeholder="Search tasks or clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{
            background: "var(--rtm-bg)",
            border: "1px solid var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        />
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value as DepartmentName | "All")}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{
            background: "var(--rtm-bg)",
            border: "1px solid var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        >
          <option value="All">All Departments</option>
          {allDepts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {(search || deptFilter !== "All") && (
          <button
            onClick={() => {
              setSearch("");
              setDeptFilter("All");
            }}
            className="text-xs font-semibold"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Clear filters
          </button>
        )}
        <span
          className="ml-auto text-xs font-semibold"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          {kpis.clientProjects} client project{kpis.clientProjects !== 1 ? "s" : ""} ·{" "}
          {kpis.totalTasks} tasks across {kpis.deptsActive} department
          {kpis.deptsActive !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Department Sections ── */}
      {displayBreakdown.size === 0 ? (
        <div
          className="rounded-xl px-5 py-16 text-center"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
        >
          <p className="text-base font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
            {clientProjects.length === 0
              ? "No activated client projects yet."
              : "No tasks match the current filters."}
          </p>
          {clientProjects.length === 0 && (
            <div className="mt-4">
              <Link
                href="/account-management/account-management/projects"
                className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg text-white"
                style={{ background: "var(--rtm-blue)" }}
              >
                Activate a Client via AM Wizard →
              </Link>
            </div>
          )}
        </div>
      ) : (
        Array.from(displayBreakdown.entries()).map(([dept, tasks]) => (
          <DepartmentSection
            key={dept}
            dept={dept}
            tasks={tasks}
            projects={clientProjects}
            search={search}
            onSelectTask={setSelectedTask}
          />
        ))
      )}

      {/* ── Client Projects Summary ── */}
      {clientProjects.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--rtm-border)" }}
          >
            <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
              Activated Client Projects
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Engine projects with a MASTER_CLIENTS{" "}
              <code className="bg-gray-100 px-1 rounded text-[10px]">clientId</code> — created by
              the AM wizard.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "2px solid var(--rtm-border)",
                }}
              >
                <tr>
                  {["Project", "Client", "AM", "Status", "Health", "Tasks", "Departments"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {clientProjects.map((p, idx) => {
                  const projectTaskCount = clientTasks.filter((t) => t.projectId === p.id).length;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/20"
                      style={{
                        borderBottom:
                          idx < clientProjects.length - 1
                            ? "1px solid var(--rtm-border-light)"
                            : undefined,
                      }}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/projects/${p.id}`}
                          className="font-semibold hover:underline text-sm"
                          style={{ color: "var(--rtm-blue)" }}
                        >
                          {p.name}
                        </Link>
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
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                          style={{
                            background:
                              p.status === "In Progress"
                                ? "#EFF6FF"
                                : p.status === "Completed"
                                ? "#ECFDF5"
                                : "#F8FAFC",
                            color:
                              p.status === "In Progress"
                                ? "#1D4ED8"
                                : p.status === "Completed"
                                ? "#059669"
                                : "#64748B",
                            borderColor:
                              p.status === "In Progress"
                                ? "#BFDBFE"
                                : p.status === "Completed"
                                ? "#A7F3D0"
                                : "#E2E8F0",
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                          style={{
                            background:
                              p.health === "Green"
                                ? "#ECFDF5"
                                : p.health === "Yellow"
                                ? "#FFFBEB"
                                : "#FEF2F2",
                            color:
                              p.health === "Green"
                                ? "#059669"
                                : p.health === "Yellow"
                                ? "#B45309"
                                : "#DC2626",
                            borderColor:
                              p.health === "Green"
                                ? "#A7F3D0"
                                : p.health === "Yellow"
                                ? "#FDE68A"
                                : "#FECACA",
                          }}
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
                      <td className="px-4 py-3">
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Footer note ── */}
      <div
        className="rounded-xl px-5 py-4 text-xs"
        style={{
          background: "var(--rtm-bg)",
          border: "1px solid var(--rtm-border)",
          color: "var(--rtm-text-muted)",
        }}
      >
        All tasks shown here are real engine records created via the AM activation wizard.
        Task lifecycle and ownership management is handled through{" "}
        <Link
          href="/tasks"
          className="font-semibold hover:underline"
          style={{ color: "var(--rtm-blue)" }}
        >
          Global Tasks
        </Link>
        . To activate a new client, use the{" "}
        <Link
          href="/account-management/account-management/projects"
          className="font-semibold hover:underline"
          style={{ color: "var(--rtm-blue)" }}
        >
          AM Projects wizard
        </Link>
        .
      </div>

      {/* ── Task Detail Drawer ── */}
      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          project={selectedTaskProject}
          clients={liveClients}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
