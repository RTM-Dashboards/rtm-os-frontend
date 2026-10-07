"use client";

// =============================================================================
// Department Activation
// Route: /tasks/department-activation
//
// ADMIN-WIDE view of real department task workloads for activated client
// projects. Data source: Postgres via /api/projects/scoped (project list +
// task counts) and /api/projects/detail (per-project task detail).
//
// VISIBILITY RULES (enforced by the API, not by this page):
//   Executives and SystemAdmins see everything.
//   AM Manager sees all projects and all tasks.
//   AM Member sees projects where they are the assignedAM, all tasks.
//   Everyone else: projects where they own >= 1 task; only their dept's tasks.
//   monthlyValueCents is absent from the API for non-AM / non-Executive callers.
//
// REMOVED FROM MOCK VERSION:
//   - ENGINE_STORE / MASTER_CLIENTS imports (no Postgres equivalent).
//   - "Blueprint Tasks" sub-grouping (source field does not exist in Postgres tasks).
//   - activatedAt / activationStatus per department (not stored in Postgres).
//   - Blueprint task count KPI (no source field in Postgres tasks).
//   - Unassigned count KPI (removed rather than faked).
//
// EMPTY STATE:
//   Projects and tasks are empty right now. The page will show
//   "No activated client projects yet" -- honest and correct.
// =============================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { ScopedProjectListItem } from "@/app/api/projects/scoped/route";
import type { ScopedProjectDetail, ScopedTask, ScopedCategory } from "@/app/api/projects/detail/route";

// ---------------------------------------------------------------------------
// Derived types
// ---------------------------------------------------------------------------

interface DeptTaskRow {
  task: ScopedTask;
  category: ScopedCategory;
  project: ScopedProjectListItem;
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

const DEPT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  SEO:                { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  GBP:                { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  PPC:                { bg: "#FAF5FF", color: "#7C3AED", border: "#DDD6FE" },
  "Meta Ads":         { bg: "#F0F9FF", color: "#0369A1", border: "#BAE6FD" },
  LSA:                { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  Reporting:          { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1" },
  "Web Development":  { bg: "#ECFEFF", color: "#0891B2", border: "#A5F3FC" },
  Design:             { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3" },
  "Account Management": { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  Content:            { bg: "#FAFAF5", color: "#65A30D", border: "#D9F99D" },
};

const DEFAULT_DEPT_STYLE = { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1" };

function deptStyle(dept: string) {
  return DEPT_COLORS[dept] ?? DEFAULT_DEPT_STYLE;
}

function DeptBadge({ dept }: { dept: string }) {
  const c = deptStyle(dept);
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {dept}
    </span>
  );
}

function taskStatusStyle(status: string): React.CSSProperties {
  switch (status) {
    case "done":        return { background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" };
    case "in_progress": return { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" };
    case "open":        return { background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" };
    default:            return { background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" };
  }
}

function taskStatusLabel(status: string): string {
  switch (status) {
    case "done":        return "Done";
    case "in_progress": return "In Progress";
    case "open":        return "Open";
    default:            return status;
  }
}

function priorityStyle(priority: string | null): React.CSSProperties {
  switch (priority) {
    case "urgent": return { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" };
    case "high":   return { background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" };
    case "medium": return { background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" };
    case "low":    return { background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" };
    default:       return { background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" };
  }
}

function KpiCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      <div
        className={`text-2xl font-black ${color ?? ""}`}
        style={!color ? { color: "var(--rtm-text-primary)" } : undefined}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] font-semibold leading-tight" style={{ color: "var(--rtm-text-secondary)" }}>
        {label}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Department Section
// ---------------------------------------------------------------------------

function DepartmentSection({
  dept,
  rows,
  search,
}: {
  dept: string;
  rows: DeptTaskRow[];
  search: string;
}) {
  const c = deptStyle(dept);

  const filtered = search.trim()
    ? rows.filter(
        (r) =>
          r.task.label.toLowerCase().includes(search.toLowerCase()) ||
          r.project.displayName.toLowerCase().includes(search.toLowerCase()) ||
          r.project.name.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  if (filtered.length === 0) return null;

  const open      = filtered.filter((r) => r.task.status === "open" || r.task.status === "in_progress").length;
  const blocked   = filtered.filter((r) => r.task.isBlocked).length;
  const completed = filtered.filter((r) => r.task.status === "done").length;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--rtm-border)", background: c.bg }}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm" style={{ color: c.color }}>{dept}</span>
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
            <tr>
              {["Task", "Project / Client", "Service", "Priority", "Due Date", "Assigned To", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-[11px] font-black uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-secondary)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr
                key={r.task.id}
                className="hover:bg-blue-50/20 transition-colors"
                style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--rtm-border-light)" : undefined }}
              >
                <td className="px-4 py-2.5">
                  <div className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>
                    {r.task.label}
                  </div>
                  {r.task.isBlocked && (
                    <div className="text-[10px] mt-0.5 font-semibold text-red-600">
                      Blocked by: {r.task.blockedBy.map((b) => b.label).join(", ")}
                    </div>
                  )}
                  {r.task.description && !r.task.isBlocked && (
                    <div className="text-[10px] mt-0.5 line-clamp-1" style={{ color: "var(--rtm-text-muted)" }}>
                      {r.task.description}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  <div className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {r.project.displayName || r.project.name}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
                    {r.category.serviceLabel}
                  </div>
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}
                  >
                    {r.category.serviceLabel}
                  </span>
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  {r.task.priority && (
                    <span
                      className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold"
                      style={priorityStyle(r.task.priority)}
                    >
                      {r.task.priority.charAt(0).toUpperCase() + r.task.priority.slice(1)}
                    </span>
                  )}
                </td>
                <td
                  className="px-4 py-2.5 text-xs whitespace-nowrap"
                  style={{ color: r.task.isOverdue ? "#DC2626" : "var(--rtm-text-secondary)", fontWeight: r.task.isOverdue ? 600 : undefined }}
                >
                  {r.task.dueDate
                    ? new Date(r.task.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—"}
                  {r.task.isOverdue && " ⚑"}
                </td>
                <td
                  className="px-4 py-2.5 text-xs whitespace-nowrap"
                  style={{ color: r.task.ownerName ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)" }}
                >
                  {r.task.ownerName ?? "Unassigned"}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span
                    className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold"
                    style={
                      r.task.isBlocked
                        ? { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }
                        : taskStatusStyle(r.task.status)
                    }
                  >
                    {r.task.isBlocked ? "Blocked" : taskStatusLabel(r.task.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DepartmentActivationPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [projects, setProjects] = useState<ScopedProjectListItem[]>([]);
  const [details, setDetails] = useState<Map<string, ScopedProjectDetail>>(new Map());
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoadingProjects(true);
    setLoadError(null);
    setProjects([]);
    setDetails(new Map());

    let projectList: ScopedProjectListItem[] = [];
    try {
      const res = await fetch("/api/projects/scoped");
      const data = (await res.json()) as { records?: ScopedProjectListItem[]; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
      projectList = data.records ?? [];
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
      setLoadingProjects(false);
      return;
    }
    setProjects(projectList);
    setLoadingProjects(false);

    if (projectList.length === 0) return;

    setLoadingDetails(true);
    const detailMap = new Map<string, ScopedProjectDetail>();
    await Promise.all(
      projectList.map(async (p) => {
        try {
          const res = await fetch(`/api/projects/detail?id=${encodeURIComponent(p.id)}`);
          if (res.ok) {
            const data = (await res.json()) as { record?: ScopedProjectDetail };
            if (data.record) detailMap.set(p.id, data.record);
          }
        } catch {
          // best-effort
        }
      })
    );
    setDetails(new Map(detailMap));
    setLoadingDetails(false);
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const { deptRows, allDepts, kpis } = useMemo(() => {
    const rows: DeptTaskRow[] = [];
    for (const [projId, detail] of details.entries()) {
      const project = projects.find((p) => p.id === projId);
      if (!project) continue;
      for (const cat of detail.categories) {
        for (const task of cat.tasks) {
          rows.push({ task, category: cat, project });
        }
      }
    }

    const byDept = new Map<string, DeptTaskRow[]>();
    for (const r of rows) {
      const dept = r.category.department ?? "Other";
      const arr = byDept.get(dept) ?? [];
      arr.push(r);
      byDept.set(dept, arr);
    }

    const allDepts = Array.from(byDept.keys()).sort();

    const kpis = {
      clientProjects: projects.length,
      totalTasks:     rows.length,
      open:           rows.filter((r) => r.task.status === "open" || r.task.status === "in_progress").length,
      blocked:        rows.filter((r) => r.task.isBlocked).length,
      done:           rows.filter((r) => r.task.status === "done").length,
      overdue:        rows.filter((r) => r.task.isOverdue).length,
      deptsActive:    byDept.size,
    };

    return { deptRows: byDept, allDepts, kpis };
  }, [projects, details]);

  const displayDepts = deptFilter === "All" ? allDepts : allDepts.filter((d) => d === deptFilter);
  const loading = loadingProjects || loadingDetails;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>
              Projects &amp; Tasks
            </p>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>›</span>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
              Department Activation
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Department Activation
          </h1>
          <p className="mt-1 text-sm max-w-xl" style={{ color: "var(--rtm-text-secondary)" }}>
            Real tasks for activated client projects, grouped by department. Data is read from
            Postgres and scoped to what you are permitted to see. Activate clients via the{" "}
            <Link href="/account-management/projects" className="font-semibold underline" style={{ color: "var(--rtm-blue)" }}>
              AM Projects wizard
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void loadAll()}
            className="px-4 py-2 text-sm font-semibold rounded-lg border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}
          >
            ↻ Refresh
          </button>
          <Link
            href="/account-management/projects"
            className="px-4 py-2 text-sm font-bold rounded-lg text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            Activate via AM Wizard →
          </Link>
          <Link
            href="/tasks/activation-engine"
            className="px-4 py-2 text-sm font-semibold rounded-lg border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}
          >
            Activation Engine
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard label="Client Projects"     value={loading ? "…" : kpis.clientProjects} color="text-blue-700" />
        <KpiCard label="Total Tasks"         value={loading ? "…" : kpis.totalTasks}     color="text-slate-700" />
        <KpiCard label="Open / In Progress" value={loading ? "…" : kpis.open}           color="text-blue-700" />
        <KpiCard label="Blocked"             value={loading ? "…" : kpis.blocked}        color={kpis.blocked > 0 ? "text-red-600" : "text-slate-400"} />
        <KpiCard label="Done"               value={loading ? "…" : kpis.done}           color="text-emerald-600" />
        <KpiCard label="Overdue"             value={loading ? "…" : kpis.overdue}        color={kpis.overdue > 0 ? "text-amber-600" : "text-slate-400"} />
        <KpiCard label="Depts Active"        value={loading ? "…" : kpis.deptsActive}    color="text-teal-700" />
      </div>

      {/* Filters */}
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
          style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)" }}
        />
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)" }}
        >
          <option value="All">All Departments</option>
          {allDepts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {(search || deptFilter !== "All") && (
          <button
            onClick={() => { setSearch(""); setDeptFilter("All"); }}
            className="text-xs font-semibold"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
          {kpis.clientProjects} project{kpis.clientProjects !== 1 ? "s" : ""} · {kpis.totalTasks} task{kpis.totalTasks !== 1 ? "s" : ""} across {kpis.deptsActive} dept{kpis.deptsActive !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Error */}
      {loadError && (
        <div className="rounded-xl px-5 py-4 text-sm font-semibold text-red-700" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
          {loadError}{" "}
          <button onClick={() => void loadAll()} className="underline font-bold ml-2">Retry</button>
        </div>
      )}

      {/* Loading */}
      {loadingProjects && !loadError && (
        <div className="rounded-xl px-5 py-16 text-center" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading…</p>
        </div>
      )}

      {!loadingProjects && loadingDetails && projects.length > 0 && (
        <div className="rounded-xl px-5 py-4 text-xs text-center" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
          Loading task detail for {projects.length} project{projects.length !== 1 ? "s" : ""}…
        </div>
      )}

      {/* Empty — no projects */}
      {!loadingProjects && !loadError && projects.length === 0 && (
        <div className="rounded-xl px-5 py-16 text-center" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <p className="text-base font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
            No activated client projects yet.
          </p>
          <p className="text-xs mt-2 max-w-sm mx-auto" style={{ color: "var(--rtm-text-muted)" }}>
            Projects will appear here once Account Management activates a client. Account Management is importing real clients today.
          </p>
          <div className="mt-5">
            <Link
              href="/account-management/projects"
              className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg text-white"
              style={{ background: "var(--rtm-blue)" }}
            >
              Activate a Client via AM Wizard →
            </Link>
          </div>
        </div>
      )}

      {/* Empty — projects exist but no tasks */}
      {!loadingProjects && !loadingDetails && !loadError && projects.length > 0 && kpis.totalTasks === 0 && (
        <div className="rounded-xl px-5 py-16 text-center" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <p className="text-base font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
            No tasks found across {projects.length} project{projects.length !== 1 ? "s" : ""}.
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--rtm-text-muted)" }}>
            Tasks will appear here once they are created via the activation wizard.
          </p>
        </div>
      )}

      {/* Department sections */}
      {!loadingProjects && !loadError && kpis.totalTasks > 0 &&
        displayDepts.map((dept) => {
          const rows = deptRows.get(dept) ?? [];
          return <DepartmentSection key={dept} dept={dept} rows={rows} search={search} />;
        })}

      {/* Client Projects Summary */}
      {!loadingProjects && !loadError && projects.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
            <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>Client Projects</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>All projects visible to you — scoped from Postgres.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                <tr>
                  {["Project / Client", "AM", "Status", "Open Tasks", "Done Tasks"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-blue-50/20" style={{ borderBottom: idx < projects.length - 1 ? "1px solid var(--rtm-border-light)" : undefined }}>
                    <td className="px-4 py-3">
                      <Link href={`/projects/${p.id}`} className="font-semibold hover:underline text-sm" style={{ color: "var(--rtm-blue)" }}>
                        {p.displayName || p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{p.assignedAMName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                        style={p.status === "active" ? { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" } : p.status === "planned" ? { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" } : { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" }}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{p.openTaskCount}</td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: "#059669" }}>{p.doneTaskCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="rounded-xl px-5 py-4 text-xs" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
        All tasks shown are real records from Postgres scoped to your visibility level. Task
        lifecycle and ownership management is handled through{" "}
        <Link href="/tasks" className="font-semibold hover:underline" style={{ color: "var(--rtm-blue)" }}>Global Tasks</Link>
        . To activate a new client, use the{" "}
        <Link href="/account-management/projects" className="font-semibold hover:underline" style={{ color: "var(--rtm-blue)" }}>AM Projects wizard</Link>
        .
      </div>
    </div>
  );
}
