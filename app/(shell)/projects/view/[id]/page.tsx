"use client";

// RTM OS — Project Detail View (DB-backed, department-scoped)
//
// Route: /projects/view/[id]
//
// TASK VISIBILITY:
//   Account Management (any role) → every task in the project
//   Executive / SystemAdmin       → every task
//   Everyone else                 → only tasks in their own department
//   (All categories shown for context regardless of role.)
//
// CONTRACT VALUE (MRR):
//   Shown only for Account Management and Executives/SystemAdmins.
//   The API omits the field entirely for others — not hidden in CSS.
//
// MARK DONE:
//   Owner of the task, Manager of the task's department, Executive, SystemAdmin.
//   Button hidden when the caller cannot mark the task done (server still enforces).

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ScopedProjectDetail, ScopedTask, BlockedByEntry } from "@/app/api/projects/detail/route";

// ── Badge helpers ─────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "warning" | "info" | "neutral" | "error" | "overdue" | "blocked";

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  success: { background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" },
  warning: { background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" },
  info:    { background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" },
  neutral: { background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0" },
  error:   { background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" },
  overdue:  { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" },
  blocked:  { background: "#FFF7ED", color: "#9A3412", border: "1px solid #FED7AA" },
};

function Badge({ variant, label }: { variant: BadgeVariant; label: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={BADGE_STYLES[variant]}>
      {label}
    </span>
  );
}

function projectStatusVariant(s: string): BadgeVariant {
  switch (s) {
    case "active":    return "success";
    case "planned":   return "info";
    case "on_hold":   return "warning";
    case "complete":  return "neutral";
    case "cancelled": return "error";
    default:          return "neutral";
  }
}

function taskStatusVariant(s: string, overdue: boolean, blocked: boolean, waiting: boolean): BadgeVariant {
  if (blocked || waiting) return "blocked";
  if (overdue) return "overdue";
  switch (s) {
    case "done":        return "success";
    case "in_progress": return "info";
    case "open":        return "neutral";
    default:            return "neutral";
  }
}

function taskStatusLabel(s: string, overdue: boolean, blocked: boolean, waiting: boolean): string {
  if (blocked) return "Blocked";
  if (waiting) return "Waiting";
  if (overdue) return "Overdue";
  switch (s) {
    case "done":        return "Done";
    case "in_progress": return "In Progress";
    case "open":        return "Open";
    default:            return s;
  }
}

// ── Money ─────────────────────────────────────────────────────────────────────

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

// ── Date formatter ────────────────────────────────────────────────────────────

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Task row ──────────────────────────────────────────────────────────────────

// ── BlockedBy pill list ───────────────────────────────────────────────────────
// Shows what a blocked task is waiting on: label + department.
// Intentionally shown even when the prereq is in another department.
function BlockedByList({ entries }: { entries: BlockedByEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="mt-1 space-y-0.5">
      {entries.map((e, i) => (
        <div key={i} className="text-[10px] flex items-center gap-1" style={{ color: "#9A3412" }}>
          <span style={{ opacity: 0.6 }}>⏳</span>
          <span className="font-semibold">{e.label}</span>
          {e.department && (
            <span style={{ opacity: 0.7 }}>({e.department})</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TaskRow({
  task,
  onMarkDone,
  markingDone,
}: {
  task: ScopedTask;
  onMarkDone: (id: string) => void;
  markingDone: boolean;
}) {
  const isDone    = task.status === "done";
  // Waiting: blocked + no due date yet (date not set because prereqs unmet)
  const isWaiting = !isDone && task.isBlocked && !task.dueDate;

  // Row background: done=green tint, blocked/waiting=orange tint, else default
  const rowBg = isDone ? "#F0FDF4" : (task.isBlocked ? "#FFF7ED" : "var(--rtm-bg)");
  const rowBgHover = isDone ? "#F0FDF4" : (task.isBlocked ? "#FFEDD5" : "var(--rtm-bg-alt, #F9FAFB)");

  return (
    <tr
      style={{ background: rowBg, opacity: isDone ? 0.8 : 1 }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = rowBgHover; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = rowBg; }}
    >
      <td className="px-3 py-2.5 text-sm border-b" style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)" }}>
        <span className={isDone ? "line-through opacity-60" : ""}>{task.label}</span>
        {/* Blocked: show what this task is waiting on */}
        {task.isBlocked && <BlockedByList entries={task.blockedBy} />}
        {task.description && (
          <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)", fontStyle: "italic" }}>{task.description}</div>
        )}
      </td>
      <td className="px-3 py-2.5 text-xs border-b whitespace-nowrap" style={{ borderColor: "var(--rtm-border-light)" }}>
        {task.priority ? (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 9999,
            background: task.priority === "Urgent" ? "#FEE2E2" : task.priority === "High" ? "#FEF2F2" : task.priority === "Medium" ? "#FFFBEB" : "#F8FAFC",
            color:      task.priority === "Urgent" ? "#991B1B" : task.priority === "High" ? "#DC2626" : task.priority === "Medium" ? "#D97706" : "#94A3B8",
          }}>{task.priority}</span>
        ) : "—"}
      </td>
      <td className="px-3 py-2.5 text-xs border-b whitespace-nowrap" style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-muted)" }}>
        {task.department ?? "—"}
      </td>
      <td className="px-3 py-2.5 text-xs border-b whitespace-nowrap" style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-muted)" }}>
        {task.ownerName ?? "Unassigned"}
      </td>
      <td className="px-3 py-2.5 text-xs border-b whitespace-nowrap" style={{ borderColor: "var(--rtm-border-light)", color: task.isOverdue ? "#DC2626" : "var(--rtm-text-muted)" }}>
        {task.dueDate
          ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : (isWaiting ? <em style={{ color: "#9A3412" }}>Waiting…</em> : "—")}
        {task.isOverdue && " ⚠"}
      </td>
      <td className="px-3 py-2.5 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
        <Badge
          variant={taskStatusVariant(task.status, task.isOverdue, task.isBlocked, isWaiting)}
          label={taskStatusLabel(task.status, task.isOverdue, task.isBlocked, isWaiting)}
        />
      </td>
      <td className="px-3 py-2.5 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
        {!isDone && (
          <button
            onClick={() => onMarkDone(task.id)}
            disabled={markingDone}
            className="text-xs font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap"
            style={{
              background: markingDone ? "var(--rtm-bg)" : "#F0FDF4",
              borderColor: "#A7F3D0",
              color: "#065F46",
              cursor: markingDone ? "not-allowed" : "pointer",
              opacity: markingDone ? 0.5 : 1,
            }}
          >
            ✓ Done
          </button>
        )}
        {isDone && (
          <span className="text-xs font-semibold" style={{ color: "#059669" }}>✓ Completed</span>
        )}
      </td>
    </tr>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [project, setProject] = useState<ScopedProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingDone, setMarkingDone] = useState<string | null>(null);
  const [doneError, setDoneError] = useState<string | null>(null);
  const [doneSuccess, setDoneSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/detail?id=${encodeURIComponent(projectId)}`);
      const data = await res.json() as { record?: ScopedProjectDetail; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
      setProject(data.record ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  const handleMarkDone = useCallback(async (taskId: string) => {
    setMarkingDone(taskId);
    setDoneError(null);
    setDoneSuccess(null);
    try {
      const res = await fetch(`/api/tasks/done?id=${encodeURIComponent(taskId)}`, { method: "PATCH" });
      const data = await res.json() as { status?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
      setDoneSuccess(`Task marked done.`);
      // Refresh to get updated counts + status
      await load();
    } catch (err) {
      setDoneError(err instanceof Error ? err.message : String(err));
    } finally {
      setMarkingDone(null);
    }
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
        Loading project…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="rounded-xl border px-6 py-6" style={{ borderColor: "#FECACA", background: "#FEF2F2" }}>
          <p className="text-sm font-bold" style={{ color: "#991B1B" }}>Could not load project</p>
          <p className="text-xs mt-1" style={{ color: "#991B1B" }}>{error}</p>
        </div>
        <Link href="/projects/view" className="text-sm text-blue-600 hover:underline">← Back to projects</Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Project not found.</p>
        <Link href="/projects/view" className="text-sm text-blue-600 hover:underline">← Back to projects</Link>
      </div>
    );
  }

  const totalTasks = project.categories.reduce((s, c) => s + c.tasks.length, 0);
  const openTasks = project.categories.reduce((s, c) => s + c.tasks.filter((t) => t.status !== "done").length, 0);
  const doneTasks = totalTasks - openTasks;
  const overdueTasks = project.categories.reduce((s, c) => s + c.tasks.filter((t) => t.isOverdue).length, 0);
  const hasCategories = project.categories.length > 0;
  const hasAnyTasks = totalTasks > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div>
        <Link href="/projects/view" className="text-xs font-semibold hover:underline" style={{ color: "var(--rtm-blue)" }}>
          ← Projects
        </Link>
      </div>

      {/* Project header */}
      <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-surface)" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-blue)" }}>
              Project
            </p>
            <h1 className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {project.displayName || project.name}
            </h1>
            {project.domain && (
              <p className="text-xs font-mono mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{project.domain}</p>
            )}
          </div>
          <Badge variant={projectStatusVariant(project.status)} label={
            project.status === "active" ? "Active"
            : project.status === "planned" ? "Planned"
            : project.status === "on_hold" ? "On Hold"
            : project.status === "complete" ? "Complete"
            : project.status === "cancelled" ? "Cancelled"
            : project.status
          } />
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Account Manager</p>
            <p className="text-sm font-medium mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>
              {project.assignedAMName ?? "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Start Date</p>
            <p className="text-sm font-medium mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{fmtDate(project.startDate)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>End Date</p>
            <p className="text-sm font-medium mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{fmtDate(project.endDate)}</p>
          </div>
          {project.monthlyValueCents !== undefined && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Monthly Value</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>
                {money(project.monthlyValueCents)}/mo
              </p>
            </div>
          )}
        </div>

        {/* Task summary */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Tasks:</span>
            <span className="font-bold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{totalTasks} total</span>
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>·</span>
            <span className="font-bold text-sm" style={{ color: "#065F46" }}>{doneTasks} done</span>
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>·</span>
            <span className="font-bold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{openTasks} open</span>
            {overdueTasks > 0 && (
              <>
                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>·</span>
                <span className="font-bold text-sm" style={{ color: "#DC2626" }}>{overdueTasks} overdue ⚠</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feedback */}
      {doneSuccess && (
        <div className="rounded-xl border px-4 py-3 text-sm font-semibold"
          style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#065F46" }}>
          {doneSuccess}
        </div>
      )}
      {doneError && (
        <div className="rounded-xl border px-4 py-3 text-sm font-semibold"
          style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}>
          {doneError}
        </div>
      )}

      {/* Empty states */}
      {!hasCategories && (
        <div className="rounded-xl border px-6 py-12 text-center"
          style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-surface)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>No categories yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            This project was launched but has no service categories. The catalogue may still be loading.
          </p>
        </div>
      )}

      {hasCategories && !hasAnyTasks && (
        <div className="rounded-xl border px-6 py-8 text-center"
          style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-surface)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>No tasks visible to you</p>
          <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            Categories exist but no tasks have been assigned to your department yet.
          </p>
        </div>
      )}

      {/* Categories and tasks */}
      {project.categories.map((cat) => (
        <div key={cat.id} className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border-light)" }}>
          {/* Category header */}
          <div className="px-5 py-3 border-b flex items-center justify-between"
            style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-alt, #F9FAFB)" }}>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                {cat.serviceLabel}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                {cat.department || "No department"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                {cat.tasks.filter((t) => t.status === "done").length}/{cat.tasks.length} done
              </span>
            </div>
          </div>

          {/* Tasks table */}
          {cat.tasks.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                No tasks in your view for this category.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {["Task", "Priority", "Department", "Owner", "Due Date", "Status", "Action"].map((h) => (
                      <th key={h}
                        className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"
                        style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-alt, #F9FAFB)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cat.tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onMarkDone={handleMarkDone}
                      markingDone={markingDone === task.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
