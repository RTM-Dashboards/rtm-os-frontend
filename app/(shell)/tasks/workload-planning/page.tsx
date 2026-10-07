"use client";

// =============================================================================
// Workload Planning (Department Throughput Overview)
// Route: /tasks/workload-planning
//
// Shows open tasks, overdue tasks, and SLA compliance per department.
// Data source: Postgres via /api/projects/scoped + /api/projects/detail.
//
// VISIBILITY RULES (enforced by the API, not by this page):
//   Executives and SystemAdmins see everything.
//   AM Manager sees all projects and all tasks.
//   AM Member sees projects where they are the assignedAM, all tasks.
//   Everyone else: projects where they own >= 1 task; only their dept's tasks.
//
// REMOVED FROM MOCK VERSION:
//   - "Flag Overdue" button and flaggedOverdue field.
//     Reason: flaggedOverdue is not a field in Postgres tasks. Adding a schema
//     field is out of scope for this run. The old implementation wrote to
//     engine-store.json which silently failed on Vercel. Dropped entirely.
//   - ENGINE_STORE / MASTER_CLIENTS (no Postgres equivalent).
//   - Milestone counts (not in Postgres).
//
// KEPT / DERIVED from real Postgres data:
//   - Open task count: status IN ('open','in_progress').
//   - Overdue task count: isOverdue from /api/projects/detail (dueDate < today AND not done).
//   - Blocked task count: isBlocked from /api/projects/detail (task_dependencies).
//   - SLA approximation: (open - overdue) / open * 100 -- honest estimate.
//
// EMPTY STATE:
//   Projects and tasks are empty right now. All counts will be 0.
// =============================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { ScopedProjectListItem } from "@/app/api/projects/scoped/route";
import type { ScopedProjectDetail, ScopedTask } from "@/app/api/projects/detail/route";

// ---------------------------------------------------------------------------
// Dept style
// ---------------------------------------------------------------------------

const DEPT_META: Record<string, { color: string; bg: string; border: string }> = {
  SEO:                { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  GBP:                { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  PPC:                { color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
  "Meta Ads":         { color: "#7C3AED", bg: "#FAF5FF", border: "#DDD6FE" },
  Reporting:          { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  "Web Development":  { color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  Design:             { color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3" },
  "Account Management": { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  Billing:            { color: "#475569", bg: "#F8FAFC", border: "#CBD5E1" },
  Content:            { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
};

const DEFAULT_META = { color: "#64748B", bg: "#F8FAFC", border: "#CBD5E1" };

function deptMeta(dept: string) {
  return DEPT_META[dept] ?? DEFAULT_META;
}

// ---------------------------------------------------------------------------
// SLA helpers
// ---------------------------------------------------------------------------

function estimateSLA(open: number, overdue: number): number {
  if (open === 0) return 100;
  return Math.round(((open - overdue) / open) * 100);
}

function SLABar({ compliance, color }: { compliance: number; color?: string }) {
  const barColor = compliance < 80 ? "#DC2626" : compliance < 90 ? "#D97706" : color ?? "#059669";
  return (
    <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "#E5E7EB" }}>
      <div className="h-2 rounded-full transition-all" style={{ width: `${compliance}%`, background: barColor }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-department stats
// ---------------------------------------------------------------------------

interface DeptRow {
  dept: string;
  openTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  slaCompliance: number;
  color: string;
  bg: string;
  border: string;
  taskRoute: string;
}

const DEPT_TASK_ROUTES: Record<string, string> = {
  SEO:                "/projects/tasks?department=SEO",
  GBP:                "/projects/tasks?department=GBP",
  PPC:                "/projects/tasks?department=PPC",
  "Meta Ads":         "/projects/tasks?department=Meta+Ads",
  Reporting:          "/projects/tasks?department=Reporting",
  "Web Development":  "/projects/tasks?department=Web+Development",
  Design:             "/projects/tasks?department=Design",
  Content:            "/projects/tasks?department=Content",
  "Account Management": "/projects/tasks?department=Account+Management",
  Billing:            "/projects/tasks?department=Billing",
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function WorkloadPlanningPage() {
  const [projects, setProjects]               = useState<ScopedProjectListItem[]>([]);
  const [details, setDetails]                 = useState<ScopedProjectDetail[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingDetails, setLoadingDetails]   = useState(false);
  const [loadError, setLoadError]             = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoadingProjects(true);
    setLoadError(null);
    setProjects([]);
    setDetails([]);

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
    const detailList: ScopedProjectDetail[] = [];
    await Promise.all(
      projectList.map(async (p) => {
        try {
          const res = await fetch(`/api/projects/detail?id=${encodeURIComponent(p.id)}`);
          if (res.ok) {
            const data = (await res.json()) as { record?: ScopedProjectDetail };
            if (data.record) detailList.push(data.record);
          }
        } catch {
          // best-effort
        }
      })
    );
    setDetails(detailList);
    setLoadingDetails(false);
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // ---------------------------------------------------------------------------
  // Derive per-department stats
  // ---------------------------------------------------------------------------
  const { deptRows, totalOpen, totalOverdue, totalBlocked, avgSLA } = useMemo(() => {
    const allTasks: Array<ScopedTask & { categoryDept: string }> = [];
    for (const detail of details) {
      for (const cat of detail.categories) {
        for (const task of cat.tasks) {
          allTasks.push({ ...task, categoryDept: cat.department });
        }
      }
    }

    const deptMap = new Map<string, { open: number; overdue: number; blocked: number }>();
    for (const task of allTasks) {
      const dept = task.department ?? task.categoryDept ?? "Other";
      if (!deptMap.has(dept)) deptMap.set(dept, { open: 0, overdue: 0, blocked: 0 });
      const entry = deptMap.get(dept)!;
      if (task.status !== "done") {
        entry.open++;
        if (task.isOverdue) entry.overdue++;
      }
      if (task.isBlocked) entry.blocked++;
    }

    const deptRows: DeptRow[] = Array.from(deptMap.entries())
      .map(([dept, { open, overdue, blocked }]) => {
        const meta = deptMeta(dept);
        const route = DEPT_TASK_ROUTES[dept] ?? `/projects/tasks?department=${encodeURIComponent(dept)}`;
        return {
          dept,
          openTasks:     open,
          overdueTasks:  overdue,
          blockedTasks:  blocked,
          slaCompliance: estimateSLA(open, overdue),
          ...meta,
          taskRoute: route,
        };
      })
      .sort((a, b) => b.openTasks - a.openTasks);

    const totalOpen    = deptRows.reduce((s, d) => s + d.openTasks, 0);
    const totalOverdue = deptRows.reduce((s, d) => s + d.overdueTasks, 0);
    const totalBlocked = deptRows.reduce((s, d) => s + d.blockedTasks, 0);
    const avgSLA       = deptRows.length
      ? Math.round(deptRows.reduce((s, d) => s + d.slaCompliance, 0) / deptRows.length)
      : 100;

    return { deptRows, totalOpen, totalOverdue, totalBlocked, avgSLA };
  }, [details]);

  const loading = loadingProjects || loadingDetails;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>
              Projects &amp; Tasks
            </p>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>›</span>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
              Workload Planning
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Workload Planning
          </h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--rtm-text-secondary)" }}>
            Live task counts, overdue tasks, and SLA compliance per department — sourced from
            Postgres, scoped to what you are permitted to see.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void loadAll()}
            className="px-4 py-2 text-sm font-semibold rounded-lg border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}
          >
            ↻ Refresh
          </button>
          <Link
            href="/projects/tasks"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            View All Tasks →
          </Link>
        </div>
      </div>

      {/* Error */}
      {loadError && (
        <div className="rounded-xl px-5 py-4 text-sm font-semibold text-red-700" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
          {loadError}{" "}
          <button onClick={() => void loadAll()} className="underline font-bold ml-2">Retry</button>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Open Tasks",    value: loading ? "…" : totalOpen,    color: "var(--rtm-blue)" },
          { label: "Total Overdue Tasks", value: loading ? "…" : totalOverdue, color: totalOverdue > 0 ? "#DC2626" : "#059669" },
          { label: "Total Blocked Tasks", value: loading ? "…" : totalBlocked, color: totalBlocked > 0 ? "#DC2626" : "#059669" },
          { label: "Avg. SLA Compliance", value: loading ? "…" : `${avgSLA}%`, color: "#7C3AED" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4 text-center"
            style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
          >
            <div className="text-3xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: "var(--rtm-text-secondary)" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* SLA breakdown */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
          <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
            SLA Compliance by Department
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Sourced from Postgres task data. SLA = (open − overdue) / open. Overdue = past due date and not done. Blocked = unmet task dependency.
          </p>
        </div>
        <div className="p-5 space-y-4">
          {loading && (
            <p className="text-sm text-center py-4" style={{ color: "var(--rtm-text-muted)" }}>
              {loadingProjects ? "Loading projects…" : `Loading tasks for ${projects.length} project${projects.length !== 1 ? "s" : ""}…`}
            </p>
          )}
          {!loading && deptRows.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: "var(--rtm-text-muted)" }}>
              {projects.length === 0
                ? "No projects yet. Activate a client via the AM wizard to generate tasks."
                : "No open tasks found across your projects."}
            </p>
          )}
          {deptRows.map((dept) => {
            const slaColor = dept.slaCompliance < 80 ? "#DC2626" : dept.slaCompliance < 90 ? "#D97706" : "#059669";
            return (
              <div key={dept.dept}>
                <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: dept.bg, color: dept.color, border: `1px solid ${dept.border}` }}
                  >
                    {dept.dept}
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                      {dept.openTasks} open
                    </span>
                    {dept.overdueTasks > 0 && (
                      <span className="text-xs font-semibold" style={{ color: "#DC2626" }}>
                        {dept.overdueTasks} overdue
                      </span>
                    )}
                    {dept.blockedTasks > 0 && (
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
                      >
                        {dept.blockedTasks} blocked
                      </span>
                    )}
                    <span className="text-xs font-black" style={{ color: slaColor }}>
                      {dept.slaCompliance}% SLA
                    </span>
                    <Link
                      href={dept.taskRoute}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded border"
                      style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                      title={`Open full task view for ${dept.dept}`}
                    >
                      View Tasks →
                    </Link>
                  </div>
                </div>
                <SLABar compliance={dept.slaCompliance} color={dept.color} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Department cards */}
      {!loading && deptRows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {deptRows.map((dept) => (
            <Link
              key={dept.dept}
              href={dept.taskRoute}
              className="rounded-xl p-4 text-center block hover:opacity-90 transition-opacity"
              style={{ background: dept.bg, border: `1px solid ${dept.border}` }}
              title={`View tasks for ${dept.dept}`}
            >
              <div className="text-2xl font-black" style={{ color: dept.color }}>{dept.openTasks}</div>
              <div className="text-[10px] font-bold" style={{ color: dept.color }}>open tasks</div>
              <div className="text-[10px] mt-1.5 font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{dept.dept}</div>
              <div className="text-[10px] mt-0.5" style={{ color: dept.color }}>{dept.slaCompliance}% SLA</div>
              {dept.overdueTasks > 0 && (
                <div className="text-[10px] mt-1 font-bold" style={{ color: "#DC2626" }}>{dept.overdueTasks} overdue</div>
              )}
              {dept.blockedTasks > 0 && (
                <div className="text-[10px] mt-0.5 font-semibold" style={{ color: "#DC2626" }}>{dept.blockedTasks} blocked</div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Empty -- no projects */}
      {!loading && !loadError && projects.length === 0 && (
        <div className="rounded-xl px-5 py-16 text-center" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <p className="text-base font-semibold" style={{ color: "var(--rtm-text-muted)" }}>No projects yet.</p>
          <p className="text-xs mt-2 max-w-sm mx-auto" style={{ color: "var(--rtm-text-muted)" }}>
            Task workload data will appear here once Account Management activates client projects. Account Management is importing real clients today.
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

      {/* Info banner */}
      <div className="rounded-xl p-5" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <div className="font-bold text-sm mb-1" style={{ color: "#1D4ED8" }}>Live Postgres Data</div>
        <p className="text-xs" style={{ color: "#1E40AF" }}>
          Task counts, overdue figures, and SLA estimates are derived from real Postgres records.
          SLA compliance is approximated as <em>(open − overdue) / open</em>. Overdue means past
          due date and not done. Blocked means an unmet task dependency. Use{" "}
          <strong>View Tasks →</strong> to open the full task view for deeper management.
        </p>
        <div className="flex gap-2 mt-3">
          <Link
            href="/tasks/department-activation"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: "#1D4ED8", color: "#fff" }}
          >
            Department Activation →
          </Link>
          <Link
            href="/tasks/activation-engine"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: "#BFDBFE", color: "#1D4ED8" }}
          >
            Activation Engine
          </Link>
        </div>
      </div>
    </div>
  );
}
