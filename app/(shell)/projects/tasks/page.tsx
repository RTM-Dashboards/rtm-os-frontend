"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  getAllTasks,
  getProjects,
  getDepartmentTaskKPIs,
  DEPARTMENT_WORKSPACE_FILTERS,
  type Project,
  type Task,
  type DepartmentName,
  type TaskStatus,
  type TaskPriority,
  type TaskSource,
} from "@/lib/engine";

// =============================================================================
// RTM OS — Global Tasks View
// Route: /projects/tasks
// All tasks from the engine, filterable by department.
// Department pages consume this via filter — they do NOT own tasks.
// =============================================================================

const TS_CFG: Record<TaskStatus, { bg: string; color: string; dot: string }> = {
  "Open":       { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  "In Progress":{ bg: "#FEF9C3", color: "#A16207", dot: "#EAB308" },
  "Waiting":    { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8" },
  "Review":     { bg: "#FAF5FF", color: "#6D28D9", dot: "#8B5CF6" },
  "Blocked":    { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
  "Completed":  { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
  "Cancelled":  { bg: "#F8FAFC", color: "#94A3B8", dot: "#CBD5E1" },
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  Low: "#64748B", Medium: "#D97706", High: "#DC2626", Urgent: "#7C3AED",
};

function TsBadge({ status }: { status: TaskStatus }) {
  const c = TS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color }}>
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
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold flex-shrink-0"
      style={{ background: bg }}>{initials}</span>
  );
}

function RowActions({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        style={{ color: "#94A3B8" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-40 rounded-xl shadow-xl bg-white py-1.5"
            style={{ border: "1px solid var(--rtm-border)" }}>
            {[
              { label: "View Task",    href: `/projects/tasks/${task.id}` },
              { label: "View Project", href: `/projects/${task.projectId}` },
            ].map((a) => (
              <Link key={a.label} href={a.href} onClick={() => setOpen(false)}
                className="block px-3.5 py-2 text-sm hover:bg-gray-50"
                style={{ color: "var(--rtm-text-primary)" }}>
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

export default function GlobalTasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>(() => getAllTasks());
  const [projects, setProjects] = useState<Project[]>(() => getProjects());

  useEffect(() => {
    Promise.all([
      fetch("/api/engine?resource=tasks").then((r) => r.ok ? r.json() : null),
      fetch("/api/engine?resource=projects").then((r) => r.ok ? r.json() : null),
    ]).then(([td, pd]) => {
      if (td?.tasks) setAllTasks(td.tasks as Task[]);
      if (pd?.projects) setProjects(pd.projects as Project[]);
    }).catch(() => {});
  }, []);

  const [deptFilter, setDeptFilter]     = useState<DepartmentName | "All">("All");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [sourceFilter, setSourceFilter] = useState<TaskSource | "All">("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [search, setSearch] = useState("");

  const departments: (DepartmentName | "All")[] = [
    "All",
    "Account Management","Sales","Billing","SEO","GBP","PPC","Meta Ads","LSA",
    "Reporting","Web Development","Design","Content","AI Automation","IT & Security",
  ];
  const statuses: (TaskStatus | "All")[] = ["All","Open","In Progress","Waiting","Review","Blocked","Completed","Cancelled"];
  const sources: (TaskSource | "All")[]  = ["All","Task Blueprint","Workflow Automation","Manual","Recurring"];
  const projectOptions = ["All", ...projects.map((p) => p.name)];

  const filtered = useMemo(() => {
    return allTasks.filter((t) => {
      if (deptFilter   !== "All" && t.department !== deptFilter)   return false;
      if (statusFilter !== "All" && t.status !== statusFilter)     return false;
      if (sourceFilter !== "All" && t.source !== sourceFilter)     return false;
      if (projectFilter !== "All" && t.projectName !== projectFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.clientName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allTasks, deptFilter, statusFilter, sourceFilter, projectFilter, search]);

  // KPI for active dept filter
  const deptKpis = deptFilter !== "All" ? getDepartmentTaskKPIs(deptFilter) : null;

  // Group by department for quick view
  const byDept = useMemo(() => {
    return filtered.reduce<Record<string, Task[]>>((acc, t) => {
      acc[t.department] = acc[t.department] ?? [];
      acc[t.department].push(t);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* HEADER */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            <Link href="/projects" className="hover:underline" style={{ color: "var(--rtm-blue)" }}>Global Projects</Link>
            <span>/</span>
            <span>Global Tasks</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: "var(--rtm-text-primary)" }}>Global Tasks</h1>
              <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                All tasks from the engine. Department pages filter this view by Department — they do not own tasks.
              </p>
            </div>
          </div>

          {/* Department workspace filter legend */}
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>
              Department Workspace Filters — click to filter this view
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDeptFilter("All")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors"
                style={{
                  background: deptFilter === "All" ? "var(--rtm-blue)" : "var(--rtm-bg)",
                  color: deptFilter === "All" ? "white" : "var(--rtm-text-secondary)",
                  borderColor: deptFilter === "All" ? "var(--rtm-blue)" : "var(--rtm-border)",
                }}
              >
                All Departments
              </button>
              {DEPARTMENT_WORKSPACE_FILTERS.map((f) => (
                <button
                  key={f.department}
                  onClick={() => setDeptFilter(f.department)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors"
                  style={{
                    background: deptFilter === f.department ? "var(--rtm-blue)" : "var(--rtm-bg)",
                    color: deptFilter === f.department ? "white" : "var(--rtm-text-secondary)",
                    borderColor: deptFilter === f.department ? "var(--rtm-blue)" : "var(--rtm-border)",
                  }}
                >
                  {f.department}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-6 py-5 max-w-[1600px] mx-auto w-full">

        {/* Dept KPI strip — shown when dept filter is active */}
        {deptKpis && deptFilter !== "All" && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5 p-4 rounded-xl"
            style={{ background: "var(--rtm-surface)", border: "1px solid #BFDBFE" }}>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Total</p>
              <p className="text-2xl font-black" style={{ color: "var(--rtm-blue)" }}>{deptKpis.total}</p>
            </div>
            {[
              { label: "Open",       value: deptKpis.open,       color: "#1D4ED8" },
              { label: "In Progress",value: deptKpis.inProgress, color: "#A16207" },
              { label: "Review",     value: deptKpis.review,     color: "#6D28D9" },
              { label: "Blocked",    value: deptKpis.blocked,    color: "#DC2626" },
              { label: "Completed",  value: deptKpis.completed,  color: "#059669" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>{m.label}</p>
                <p className="text-2xl font-black" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl mb-4"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--rtm-text-muted)" }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks or clients..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }} />
          </div>
          {[
            { label: "Status",  value: statusFilter,  values: statuses,      set: setStatusFilter  as (v: string) => void },
            { label: "Source",  value: sourceFilter,  values: sources,       set: setSourceFilter  as (v: string) => void },
            { label: "Project", value: projectFilter, values: projectOptions, set: setProjectFilter },
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

        {/* Table */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1200px]">
              <thead>
                <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                  {["Task","Project","Client","Department","Service","Assignee","Source","Type","Priority","Status","Due Date","Deps","Actions"].map((col) => (
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
                      <Link href={`/projects/tasks/${t.id}`}
                        className="font-semibold text-sm hover:underline"
                        style={{ color: "var(--rtm-blue)" }}>
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/projects/${t.projectId}`}
                        className="text-xs hover:underline"
                        style={{ color: "var(--rtm-text-secondary)" }}>
                        {t.projectName}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{t.clientName}</td>
                    <td className="px-3 py-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                        {t.department}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>{t.service}</td>
                    <td className="px-3 py-3">
                      {t.assignedUserName
                        ? <div className="flex items-center gap-1.5"><Avatar name={t.assignedUserName} /><span className="text-xs">{t.assignedUserName}</span></div>
                        : <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[11px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: "#FAF5FF", color: "#7C3AED" }}>
                        {t.source}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{t.type}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-bold" style={{ color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                    </td>
                    <td className="px-3 py-3"><TsBadge status={t.status} /></td>
                    <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{t.dueDate}</td>
                    <td className="px-3 py-3">
                      {t.dependencies.length > 0
                        ? <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "#FEF2F2", color: "#DC2626" }}>{t.dependencies.length}</span>
                        : <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>}
                    </td>
                    <td className="px-3 py-3"><RowActions task={t} /></td>
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
        </div>

        {/* Department filter guide */}
        <div className="rounded-xl p-5 mt-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <p className="text-xs font-black uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-secondary)" }}>
            Department Workspace Connections
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {DEPARTMENT_WORKSPACE_FILTERS.map((f) => {
              const count = allTasks.filter((t) => t.department === f.department).length;
              return (
                <div key={f.department}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{f.label}</p>
                    <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                      Filter: Department = {f.department}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: "#EFF6FF", color: "var(--rtm-blue)" }}>
                      {count} tasks
                    </span>
                    <Link href={f.route}
                      className="text-[11px] px-2 py-1 rounded-lg font-semibold border hover:bg-gray-50"
                      style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                      Go
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
