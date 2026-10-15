"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { ScopedProjectListItem } from "@/app/api/projects/scoped/route";
import type { TaskListItem } from "@/app/api/tasks/route";

// =============================================================================
// RTM OS — Global Projects & Tasks Engine
// Route: /projects
// Data source: Postgres via /api/projects/scoped and /api/tasks
// =============================================================================

// ---------------------------------------------------------------------------
// Shared small components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const CFG: Record<string, { bg: string; color: string; border: string; dot: string }> = {
    "active":    { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6" },
    "planned":   { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", dot: "#CBD5E1" },
    "on_hold":   { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA", dot: "#F97316" },
    "complete":  { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981" },
    "cancelled": { bg: "#F8FAFC", color: "#94A3B8", border: "#E4E8F0", dot: "#CBD5E1" },
  };
  const c = CFG[status] ?? CFG["planned"];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#1B4FD8","#059669","#7C3AED","#D97706","#DC2626","#0891B2","#BE185D"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold flex-shrink-0"
      style={{ background: bg }}
    >
      {initials}
    </span>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1.5"
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>
        {label}
      </span>
      <span className="text-3xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
        {value}
      </span>
      {sub && <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{sub}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row actions menu
// ---------------------------------------------------------------------------

function RowActions({ project, basePath }: { project: ScopedProjectListItem; basePath: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        style={{ color: "#94A3B8" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-8 z-50 w-44 rounded-xl shadow-xl bg-white py-1.5"
            style={{ border: "1px solid var(--rtm-border)" }}
          >
            {[
              { label: "View Project", href: `${basePath}/${project.id}` },
              { label: "View Tasks",   href: `${basePath}/${project.id}#tasks` },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                onClick={() => setOpen(false)}
                className="block px-3.5 py-2 text-sm hover:bg-gray-50"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type ViewMode = "projects" | "tasks";

export default function GlobalProjectsPage({ basePath = "/projects" }: { basePath?: string } = {}) {
  const [view, setView] = useState<ViewMode>("projects");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [projects, setProjects] = useState<ScopedProjectListItem[]>([]);
  const [tasks, setTasks]       = useState<TaskListItem[]>([]);
  const [loading, setLoading]   = useState(true);

  const [taskSearch, setTaskSearch]           = useState("");
  const [taskDeptFilter, setTaskDeptFilter]   = useState("All");
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");

  useEffect(() => {
    Promise.all([
      fetch("/api/projects/scoped").then((r) => r.ok ? r.json() : { records: [] }),
      fetch("/api/tasks").then((r) => r.ok ? r.json() : { tasks: [] }),
    ]).then(([pd, td]) => {
      setProjects((pd as { records: ScopedProjectListItem[] }).records ?? []);
      setTasks((td as { tasks: TaskListItem[] }).tasks ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = {
    total:    projects.length,
    active:   projects.filter((p) => p.status === "active").length,
    onHold:   projects.filter((p) => p.status === "on_hold").length,
    complete: projects.filter((p) => p.status === "complete").length,
    totalTasks: tasks.length,
    openTasks:  tasks.filter((t) => t.status === "open" || t.status === "in_progress").length,
    doneTasks:  tasks.filter((t) => t.status === "done").length,
  };

  const allStatuses = ["All", "active", "planned", "on_hold", "complete", "cancelled"];
  const allTaskStatuses = ["All", "open", "in_progress", "done", "skipped"];
  const allDepts = Array.from(new Set(tasks.map((t) => t.department).filter(Boolean))).sort() as string[];

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.displayName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [projects, statusFilter, search]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (taskDeptFilter !== "All" && t.department !== taskDeptFilter) return false;
      if (taskStatusFilter !== "All" && t.status !== taskStatusFilter) return false;
      if (taskSearch && !t.label.toLowerCase().includes(taskSearch.toLowerCase())) return false;
      return true;
    });
  }, [tasks, taskDeptFilter, taskStatusFilter, taskSearch]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* ── PAGE HEADER ── */}
      <div
        className="px-6 pt-6 pb-4"
        style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}
      >
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
                Projects &amp; Tasks
              </h1>
              <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                Live data from Postgres. Projects are created when Billing clears a client.
              </p>
            </div>
          </div>

          {/* View tabs */}
          <div className="flex gap-1">
            {([["projects","Projects"], ["tasks","All Tasks"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className="px-4 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  color: view === id ? "var(--rtm-blue)" : "var(--rtm-text-secondary)",
                  borderBottom: view === id ? "2px solid var(--rtm-blue)" : "2px solid transparent",
                  background: "transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 px-6 py-5 max-w-[1600px] mx-auto w-full">

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
          <KpiCard label="Total Projects"   value={kpis.total}      sub="All projects" />
          <KpiCard label="Active"           value={kpis.active}     sub="In progress" />
          <KpiCard label="On Hold"          value={kpis.onHold}     sub="Paused" />
          <KpiCard label="Complete"         value={kpis.complete}   sub="Delivered" />
          <KpiCard label="Total Tasks"      value={kpis.totalTasks} sub="Across all projects" />
          <KpiCard label="Open Tasks"       value={kpis.openTasks}  sub="Active work" />
          <KpiCard label="Done Tasks"       value={kpis.doneTasks}  sub="Completed" />
        </div>

        {/* ── PROJECTS VIEW ── */}
        {view === "projects" && (
          <div className="flex flex-col gap-4">
            <div
              className="flex flex-wrap gap-3 items-center p-4 rounded-xl"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              <div className="flex-1 min-w-[200px] relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg px-2 py-1.5 text-xs border outline-none"
                  style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
                >
                  {allStatuses.map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>
                {filteredProjects.length} of {projects.length}
              </span>
            </div>

            {/* Table */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              {loading ? (
                <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                  Loading…
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-base font-semibold mb-2" style={{ color: "var(--rtm-text-primary)" }}>
                    No projects yet
                  </p>
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    Projects are created automatically when Billing confirms payment and clears a client.
                    Work begins in the proposal, is approved in the contract, and launches here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead>
                      <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                        {["Project","Domain","Account Manager","Open Tasks","Done Tasks","Start Date","Status","Actions"].map((col) => (
                          <th
                            key={col}
                            className="px-3 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                            style={{ color: "var(--rtm-text-secondary)" }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((p, i) => (
                        <tr
                          key={p.id}
                          className="hover:bg-blue-50/30 transition-colors"
                          style={{ borderBottom: i < filteredProjects.length - 1 ? "1px solid var(--rtm-border-light)" : "none" }}
                        >
                          <td className="px-3 py-3 max-w-[220px]">
                            <Link
                              href={`${basePath}/${p.id}`}
                              className="font-semibold hover:underline text-sm"
                              style={{ color: "var(--rtm-blue)" }}
                            >
                              {p.name}
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                            {p.domain}
                          </td>
                          <td className="px-3 py-3">
                            {p.assignedAMName ? (
                              <div className="flex items-center gap-1.5">
                                <Avatar name={p.assignedAMName} />
                                <span className="text-xs">{p.assignedAMName}</span>
                              </div>
                            ) : (
                              <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Unassigned</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                              {p.openTaskCount}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                              {p.doneTaskCount}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                            {p.startDate ?? "—"}
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="px-3 py-3">
                            <RowActions project={p} basePath={basePath} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProjects.length === 0 && (
                    <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                      No projects match your filters.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ALL TASKS VIEW ── */}
        {view === "tasks" && (
          <div className="flex flex-col gap-4">
            <div
              className="flex flex-wrap gap-3 items-center p-4 rounded-xl"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              <div className="flex-1 min-w-[200px] relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  placeholder="Search tasks…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>Department:</span>
                <select
                  value={taskDeptFilter}
                  onChange={(e) => setTaskDeptFilter(e.target.value)}
                  className="rounded-lg px-2 py-1.5 text-xs border outline-none"
                  style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
                >
                  <option>All</option>
                  {allDepts.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>Status:</span>
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="rounded-lg px-2 py-1.5 text-xs border outline-none"
                  style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
                >
                  {allTaskStatuses.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>
                {filteredTasks.length} of {tasks.length} tasks
              </span>
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              {loading ? (
                <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading…</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-base font-semibold mb-2" style={{ color: "var(--rtm-text-primary)" }}>No tasks yet</p>
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    Tasks are generated when a project launches. Projects are created when Billing clears a client.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead>
                      <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                        {["Task","Project","Department","Owner","Priority","Status","Due Date"].map((col) => (
                          <th
                            key={col}
                            className="px-3 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                            style={{ color: "var(--rtm-text-secondary)" }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((t, i) => {
                        const STATUS_CFG: Record<string, { bg: string; color: string; dot: string }> = {
                          "open":        { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
                          "in_progress": { bg: "#FEF9C3", color: "#A16207", dot: "#EAB308" },
                          "done":        { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
                          "skipped":     { bg: "#F8FAFC", color: "#94A3B8", dot: "#CBD5E1" },
                        };
                        const sc = STATUS_CFG[t.status] ?? STATUS_CFG["open"];
                        return (
                          <tr
                            key={t.id}
                            className="hover:bg-blue-50/30 transition-colors"
                            style={{ borderBottom: i < filteredTasks.length - 1 ? "1px solid var(--rtm-border-light)" : "none" }}
                          >
                            <td className="px-3 py-3 max-w-[200px]">
                              <Link
                                href={`${basePath}/${t.projectId}#tasks`}
                                className="font-semibold text-sm hover:underline"
                                style={{ color: "var(--rtm-blue)" }}
                              >
                                {t.label}
                              </Link>
                            </td>
                            <td className="px-3 py-3">
                              <Link
                                href={`${basePath}/${t.projectId}`}
                                className="text-xs hover:underline"
                                style={{ color: "var(--rtm-text-secondary)" }}
                              >
                                {t.projectName}
                              </Link>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                              >
                                {t.department ?? "—"}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              {t.ownerName ? (
                                <div className="flex items-center gap-1.5">
                                  <Avatar name={t.ownerName} />
                                  <span className="text-xs">{t.ownerName}</span>
                                </div>
                              ) : (
                                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Unassigned</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                              {t.priority ?? "—"}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                style={{ background: sc.bg, color: sc.color }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                                {t.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                              {t.dueDate ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredTasks.length === 0 && (
                    <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                      No tasks match your filters.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
