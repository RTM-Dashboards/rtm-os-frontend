"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { TaskListItem } from "@/app/api/tasks/route";

// =============================================================================
// RTM OS — Global Tasks View
// Route: /projects/tasks
// Data source: Postgres via /api/tasks
// =============================================================================

const STATUS_CFG: Record<string, { bg: string; color: string; dot: string; label?: string }> = {
  "open":           { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  "in_progress":    { bg: "#FEF9C3", color: "#A16207", dot: "#EAB308" },
  "done":           { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
  "skipped":        { bg: "#F8FAFC", color: "#94A3B8", dot: "#CBD5E1" },
  "pending_prereq": { bg: "#FDF4FF", color: "#7C3AED", dot: "#A855F7", label: "Pending" },
};

function TaskStatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG["open"];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {c.label ?? status}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#1B4FD8","#059669","#7C3AED","#D97706","#DC2626","#0891B2","#BE185D"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold flex-shrink-0"
      style={{ background: bg }}>{initials}</span>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function GlobalTasksPage() {
  const [allTasks, setAllTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading]   = useState(true);

  const [deptFilter,   setDeptFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.ok ? r.json() : { tasks: [] })
      .then((d: { tasks: TaskListItem[] }) => setAllTasks(d.tasks ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allDepts    = Array.from(new Set(allTasks.map((t) => t.department).filter(Boolean))).sort() as string[];
  const allStatuses = ["All", "open", "in_progress", "done", "skipped", "pending_prereq"];
  const allProjects = Array.from(new Set(allTasks.map((t) => t.projectName).filter(Boolean))).sort();

  const filtered = useMemo(() => {
    return allTasks.filter((t) => {
      if (deptFilter    !== "All" && t.department  !== deptFilter)    return false;
      if (statusFilter  !== "All" && t.status      !== statusFilter)  return false;
      if (projectFilter !== "All" && t.projectName !== projectFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.label.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allTasks, deptFilter, statusFilter, projectFilter, search]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* HEADER */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            <Link href="/projects" className="hover:underline" style={{ color: "var(--rtm-blue)" }}>Projects</Link>
            <span>/</span>
            <span>All Tasks</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: "var(--rtm-text-primary)" }}>All Tasks</h1>
              <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                Live task data from Postgres. Tasks are generated when a project launches.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-6 py-5 max-w-[1600px] mx-auto w-full">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl mb-4"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--rtm-text-muted)" }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…"
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }} />
          </div>
          {[
            { label: "Department", value: deptFilter,    values: ["All", ...allDepts],    set: setDeptFilter },
            { label: "Status",     value: statusFilter,  values: allStatuses,             set: setStatusFilter },
            { label: "Project",    value: projectFilter, values: ["All", ...allProjects], set: setProjectFilter },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>{f.label}:</span>
              <select value={f.value} onChange={(e) => f.set(e.target.value)}
                className="rounded-lg px-2 py-1.5 text-xs border outline-none"
                style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                {f.values.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
          ))}
          <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>
            {filtered.length} of {allTasks.length} tasks
          </span>
        </div>

        {/* Table or empty state */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          {loading ? (
            <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading…</div>
          ) : allTasks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-base font-semibold mb-2" style={{ color: "var(--rtm-text-primary)" }}>No tasks yet</p>
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                Tasks are generated automatically when a project launches.
                Projects are created when Billing confirms payment and clears a client through the proposal.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead>
                  <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                    {["Task","Project","Department","Owner","Priority","Status","Due Date"].map((col) => (
                      <th key={col} className="px-3 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                        style={{ color: "var(--rtm-text-secondary)" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors"
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--rtm-border-light)" : "none" }}>
                      <td className="px-3 py-3 max-w-[200px]">
                        <Link href={`/projects/${t.projectId}#tasks`}
                          className="font-semibold text-sm hover:underline"
                          style={{ color: "var(--rtm-blue)" }}>
                          {t.label}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <Link href={`/projects/${t.projectId}`}
                          className="text-xs hover:underline"
                          style={{ color: "var(--rtm-text-secondary)" }}>
                          {t.projectName}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                          {t.department ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {t.ownerName
                          ? <div className="flex items-center gap-1.5"><Avatar name={t.ownerName} /><span className="text-xs">{t.ownerName}</span></div>
                          : <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Unassigned</span>}
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                        {t.priority ?? "—"}
                      </td>
                      <td className="px-3 py-3"><TaskStatusBadge status={t.status} /></td>
                      <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                        {t.dueDate
                          ? t.dueDate
                          : t.waitingOnLabel
                            ? <span style={{ color: "var(--rtm-text-muted)", fontStyle: "italic" }}>After {t.waitingOnLabel}</span>
                            : "—"
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                  No tasks match your filters.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
