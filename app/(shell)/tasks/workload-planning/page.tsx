"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Task, DepartmentName } from "@/lib/engine/types";

// =============================================================================
// Department Throughput Overview
// Route: /tasks/workload-planning
// Task Operations workspace
// Data: hydrated from real engine store via /api/engine?resource=tasks
// =============================================================================

const DEPT_META: Record<string, { color: string; bg: string; border: string }> = {
  "SEO":                { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  "GBP":                { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  "Paid Advertising":   { color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
  "PPC":                { color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
  "Meta Ads":           { color: "#7C3AED", bg: "#FAF5FF", border: "#DDD6FE" },
  "Reporting":          { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  "Web Development":    { color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  "Design":             { color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3" },
  "Creative":           { color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3" },
  "Account Management": { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "Billing":            { color: "#475569", bg: "#F8FAFC", border: "#CBD5E1" },
  "Content":            { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  "AI Automation":      { color: "#7C3AED", bg: "#FAF5FF", border: "#DDD6FE" },
  "IT & Security":      { color: "#475569", bg: "#F8FAFC", border: "#CBD5E1" },
};

const DEFAULT_META = { color: "#64748B", bg: "#F8FAFC", border: "#CBD5E1" };

// Department-to-route mapping for "View Tasks" deep-links
const DEPT_TASK_ROUTES: Partial<Record<DepartmentName, string>> = {
  "SEO":                "/projects/tasks?department=SEO",
  "GBP":                "/projects/tasks?department=GBP",
  "PPC":                "/projects/tasks?department=PPC",
  "Meta Ads":           "/projects/tasks?department=Meta+Ads",
  "Reporting":          "/projects/tasks?department=Reporting",
  "Web Development":    "/projects/tasks?department=Web+Development",
  "Design":             "/projects/tasks?department=Design",
  "Content":            "/projects/tasks?department=Content",
  "Account Management": "/projects/tasks?department=Account+Management",
  "Billing":            "/projects/tasks?department=Billing",
  "AI Automation":      "/projects/tasks?department=AI+Automation",
};

// -- SLA helper: approximate from overdue ratio --------------------------------
function estimateSLA(open: number, overdue: number): number {
  if (open === 0) return 100;
  return Math.round(((open - overdue) / open) * 100);
}

// -- SLABar -------------------------------------------------------------------
function SLABar({ compliance, color }: { compliance: number; color?: string }) {
  const barColor =
    compliance < 80 ? "#DC2626" : compliance < 90 ? "#D97706" : color ?? "#059669";
  return (
    <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "#E5E7EB" }}>
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${compliance}%`, background: barColor }}
      />
    </div>
  );
}

// -- DeptRow data shape -------------------------------------------------------
interface DeptRow {
  dept: string;
  openTasks: number;
  overdueTasks: number;
  /** Tasks attention-flagged via "Flag Overdue" (flaggedOverdue=true). NOT status:Blocked. */
  flaggedTasks: number;
  slaCompliance: number;
  color: string;
  bg: string;
  border: string;
  taskRoute: string;
}

// -- Flag-overdue action ------------------------------------------------------
// Sends a PATCH to set flaggedOverdue=true on overdue tasks.
// Does NOT touch task.status — "overdue" and "blocked" are distinct concepts.
// "Overdue" = behind schedule. "Blocked" = something is actively preventing progress.
async function flagOverdueForDept(deptName: string, allTasks: Task[]): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const now   = new Date().toISOString();
  // Target overdue tasks that are not yet flagged (idempotent — skip already-flagged).
  const overdue = allTasks.filter(
    (t) =>
      t.department === deptName &&
      t.status !== "Completed" &&
      t.status !== "Cancelled" &&
      t.dueDate < today &&
      !t.flaggedOverdue,
  );
  let patched = 0;
  for (const task of overdue) {
    try {
      await fetch(`/api/engine?resource=tasks&id=${encodeURIComponent(task.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Only the dedicated attention flag is set — task.status is intentionally NOT touched.
        body: JSON.stringify({
          flaggedOverdue:   true,
          flaggedOverdueAt: now,
          updatedAt:        now,
        }),
      });
      patched++;
    } catch {
      // best-effort
    }
  }
  return patched;
}

// =============================================================================
// Page
// =============================================================================

export default function DepartmentThroughputPage() {
  const [allTasks, setAllTasks]       = useState<Task[]>([]);
  const [loading, setLoading]         = useState(true);
  const [flagging, setFlagging]       = useState<string | null>(null); // dept being flagged
  const [flagResult, setFlagResult]   = useState<{ dept: string; count: number } | null>(null);

  // -- Fetch tasks from real engine store -------------------------------------
  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/engine?resource=tasks");
      if (res.ok) {
        const data = (await res.json()) as { tasks: Task[] };
        setAllTasks(data.tasks);
      }
    } catch {
      // leave empty — will show zeros
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  // -- Derive per-department stats --------------------------------------------
  const today = new Date().toISOString().split("T")[0];

  const deptMap = new Map<string, { open: number; overdue: number; flagged: number }>();
  for (const task of allTasks) {
    const dept = task.department as string;
    if (!deptMap.has(dept)) deptMap.set(dept, { open: 0, overdue: 0, flagged: 0 });
    const entry = deptMap.get(dept)!;
    if (task.status !== "Completed" && task.status !== "Cancelled") {
      entry.open++;
      if (task.dueDate < today) entry.overdue++;
    }
    if (task.flaggedOverdue) entry.flagged++;
  }

  const deptRows: DeptRow[] = Array.from(deptMap.entries())
    .map(([dept, { open, overdue, flagged }]) => {
      const meta = DEPT_META[dept] ?? DEFAULT_META;
      const route =
        DEPT_TASK_ROUTES[dept as DepartmentName] ??
        `/projects/tasks?department=${encodeURIComponent(dept)}`;
      return {
        dept,
        openTasks: open,
        overdueTasks: overdue,
        flaggedTasks: flagged,
        slaCompliance: estimateSLA(open, overdue),
        ...meta,
        taskRoute: route,
      };
    })
    .sort((a, b) => b.openTasks - a.openTasks);

  const totalOpen    = deptRows.reduce((s, d) => s + d.openTasks, 0);
  const totalOverdue = deptRows.reduce((s, d) => s + d.overdueTasks, 0);
  const avgSLA       = deptRows.length
    ? Math.round(deptRows.reduce((s, d) => s + d.slaCompliance, 0) / deptRows.length)
    : 100;
  const atRiskDepts  = deptRows.filter((d) => d.slaCompliance < 85).length;

  // -- Flag-overdue handler --------------------------------------------------
  const handleFlagOverdue = async (deptName: string) => {
    setFlagging(deptName);
    setFlagResult(null);
    const count = await flagOverdueForDept(deptName, allTasks);
    setFlagging(null);
    setFlagResult({ dept: deptName, count });
    // Re-fetch so counts update
    await loadTasks();
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>
              Task Operations
            </p>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>›</span>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
              Department Throughput
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Department Throughput Overview
          </h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--rtm-text-secondary)" }}>
            Live task counts, overdue tasks, and SLA compliance per department — sourced from the engine store.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/tasks/templates"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}
          >
            View Templates
          </Link>
          <Link
            href="/projects/tasks"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            View All Tasks →
          </Link>
        </div>
      </div>

      {/* Flag result banner */}
      {flagResult && (
        <div
          className="flex items-center justify-between px-5 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: flagResult.count > 0 ? "#FFFBEB" : "#ECFDF5",
            border: `1px solid ${flagResult.count > 0 ? "#FDE68A" : "#A7F3D0"}`,
            color: flagResult.count > 0 ? "#B45309" : "#065F46",
          }}
        >
          <span>
            {flagResult.count > 0
              ? `⚑ ${flagResult.count} overdue task${flagResult.count > 1 ? "s" : ""} in ${flagResult.dept} flagged for attention.`
              : `✓ No un-flagged overdue tasks in ${flagResult.dept}.`}
          </span>
          <button
            onClick={() => setFlagResult(null)}
            className="text-xs font-bold ml-4 opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Open Tasks",      value: loading ? "…" : totalOpen,    color: "var(--rtm-blue)" },
          { label: "Total Overdue Tasks",   value: loading ? "…" : totalOverdue, color: totalOverdue > 0 ? "#DC2626" : "#059669" },
          { label: "Depts Below 85% SLA",  value: loading ? "…" : atRiskDepts,  color: atRiskDepts > 0 ? "#DC2626" : "#059669" },
          { label: "Avg. SLA Compliance",  value: loading ? "…" : `${avgSLA}%`, color: "#7C3AED" },
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

      {/* Department breakdown — SLA bars */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
          <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
            SLA Compliance by Department
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Computed from live engine task data. SLA = (open − overdue) / open.
          </p>
        </div>
        <div className="p-5 space-y-4">
          {loading && (
            <p className="text-sm text-center py-4" style={{ color: "var(--rtm-text-muted)" }}>Loading tasks…</p>
          )}
          {!loading && deptRows.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: "var(--rtm-text-muted)" }}>No active tasks found in the engine store.</p>
          )}
          {deptRows.map((dept) => {
            const slaColor =
              dept.slaCompliance < 80 ? "#DC2626" :
              dept.slaCompliance < 90 ? "#D97706" : "#059669";
            const hasOverdue = dept.overdueTasks > 0;
            const hasFlagged = dept.flaggedTasks > 0;
            // Only show "Flag Overdue" when there are un-flagged overdue tasks remaining.
            const unflaggedOverdue = dept.overdueTasks > 0;
            return (
              <div key={dept.dept}>
                <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: dept.bg, color: dept.color, border: `1px solid ${dept.border}` }}
                    >
                      {dept.dept}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                      {dept.openTasks} open
                    </span>
                    {hasOverdue && (
                      <span className="text-xs font-semibold" style={{ color: "#DC2626" }}>
                        {dept.overdueTasks} overdue
                      </span>
                    )}
                    {/* Attention-flagged badge — distinct from Blocked status */}
                    {hasFlagged && (
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}
                        title={`${dept.flaggedTasks} task(s) flagged for attention (overdue, not blocked)`}
                      >
                        ⚑ {dept.flaggedTasks} flagged
                      </span>
                    )}
                    <span className="text-xs font-black" style={{ color: slaColor }}>
                      {dept.slaCompliance}% SLA
                    </span>
                    {/* Quick action: flag un-flagged overdue tasks for attention */}
                    {unflaggedOverdue && (
                      <button
                        onClick={() => void handleFlagOverdue(dept.dept)}
                        disabled={flagging === dept.dept}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded border disabled:opacity-50"
                        style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA", cursor: "pointer" }}
                        title={`Flag ${dept.overdueTasks} overdue task(s) in ${dept.dept} for attention`}
                      >
                        {flagging === dept.dept ? "Flagging…" : "⚑ Flag Overdue"}
                      </button>
                    )}
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
              {/* Attention-flag indicator on card — amber, not red/blocked */}
              {dept.flaggedTasks > 0 && (
                <div className="text-[10px] mt-0.5 font-semibold" style={{ color: "#B45309" }}>
                  ⚑ {dept.flaggedTasks} flagged
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-xl p-5" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <div className="flex items-start gap-3">
          <div>
            <div className="font-bold text-sm mb-1" style={{ color: "#1D4ED8" }}>Live Engine Data</div>
            <p className="text-xs" style={{ color: "#1E40AF" }}>
              Task counts, overdue figures, and SLA estimates are read directly from the engine store.
              Use <strong>Flag Overdue</strong> to mark a department&apos;s past-due tasks for attention —
              this sets a dedicated <em>flaggedOverdue</em> field and does <strong>not</strong> change
              task status. Genuinely blocked tasks (e.g. waiting on a dependency or client) must be
              set to <strong>Blocked</strong> status manually.
              Use <strong>View Tasks →</strong> to open the full task view for deeper edits.
            </p>
            <div className="flex gap-2 mt-3">
              <Link
                href="/tasks/templates"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: "#1D4ED8", color: "#fff" }}
              >
                Manage Templates →
              </Link>
              <Link
                href="/tasks/activation-rules"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                style={{ borderColor: "#BFDBFE", color: "#1D4ED8" }}
              >
                Activation Rules
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
