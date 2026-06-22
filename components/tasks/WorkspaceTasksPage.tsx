"use client";

import { useState, useMemo } from "react";
import type { WorkspaceTask, WorkspaceTaskStatus, WorkspaceTaskPriority } from "@/lib/tasks/workspace-mock-data";

// ── KPI card colours ─────────────────────────────────────────────────────
const STATUS_COLOR: Record<WorkspaceTaskStatus, string> = {
  "Pending":     "#6B7280",
  "In Progress": "#3B82F6",
  "In Review":   "#8B5CF6",
  "Blocked":     "#DC2626",
  "Done":        "#059669",
};

const PRIORITY_COLOR: Record<WorkspaceTaskPriority, { bg: string; text: string }> = {
  Low:      { bg: "#F0FDF4", text: "#16A34A" },
  Medium:   { bg: "#EFF6FF", text: "#2563EB" },
  High:     { bg: "#FFF7ED", text: "#D97706" },
  Critical: { bg: "#FEF2F2", text: "#DC2626" },
};

// ── Helpers ───────────────────────────────────────────────────────────────
function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function isOverdue(dueDate: string, status: WorkspaceTaskStatus): boolean {
  return status !== "Done" && new Date(dueDate) < new Date();
}

// ── Sub-components ────────────────────────────────────────────────────────
function KPICard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div
      className="rtm-card flex flex-col gap-1 px-5 py-4"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <span className="text-3xl font-extrabold" style={{ color }}>{value}</span>
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--rtm-text-secondary)" }}>
        {label}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: WorkspaceTaskStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: `${color}18`, color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: WorkspaceTaskPriority }) {
  const { bg, text } = PRIORITY_COLOR[priority];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-bold"
      style={{ background: bg, color: text }}
    >
      {priority}
    </span>
  );
}

function BlockerFlag({ blocker }: { blocker: string | null }) {
  if (!blocker) {
    return <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>;
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold"
      style={{ color: "#DC2626" }}
      title={blocker}
    >
      <span className="max-w-[180px] truncate">{blocker}</span>
    </span>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────
type Filters = { search: string; status: string; priority: string };

function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  return (
    <div className="rtm-card flex flex-wrap gap-3 px-4 py-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "var(--rtm-text-muted)" }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35m0 0A7 7 0 1110.5 3.5a7 7 0 016.15 13.15z" />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks, clients, services…"
          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border focus:outline-none"
          style={{
            background: "var(--rtm-bg)",
            border: "1px solid var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        />
      </div>

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="text-sm py-1.5 px-3 rounded-lg border focus:outline-none"
        style={{
          background: "var(--rtm-bg)",
          border: "1px solid var(--rtm-border)",
          color: "var(--rtm-text-primary)",
        }}
      >
        {["All", "Pending", "In Progress", "In Review", "Blocked", "Done"].map((s) => (
          <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
        ))}
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className="text-sm py-1.5 px-3 rounded-lg border focus:outline-none"
        style={{
          background: "var(--rtm-bg)",
          border: "1px solid var(--rtm-border)",
          color: "var(--rtm-text-primary)",
        }}
      >
        {["All", "Low", "Medium", "High", "Critical"].map((p) => (
          <option key={p} value={p}>{p === "All" ? "All Priorities" : p}</option>
        ))}
      </select>

      {/* Clear */}
      {(filters.search || filters.status !== "All" || filters.priority !== "All") && (
        <button
          onClick={() => onChange({ search: "", status: "All", priority: "All" })}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
interface WorkspaceTasksPageProps {
  /** Display name shown in the header, e.g. "SEO · SEO & Local" */
  workspace: string;
  /** Short department label shown in the breadcrumb chip */
  department: string;
  /** Icon emoji or char for the header */
  icon?: string;
  /** Accent colour for the department chip */
  accentColor?: string;
  tasks: WorkspaceTask[];
}

export default function WorkspaceTasksPage({
  workspace,
  department,
  icon = "",
  accentColor = "var(--rtm-blue)",
  tasks,
}: WorkspaceTasksPageProps) {
  const [filters, setFilters] = useState<Filters>({ search: "", status: "All", priority: "All" });

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.status   !== "All" && t.status   !== filters.status)   return false;
      if (filters.priority !== "All" && t.priority !== filters.priority) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.client.toLowerCase().includes(q) &&
          !t.service.toLowerCase().includes(q) &&
          !t.owner.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  // KPI values
  const total      = filtered.length;
  const inProgress = filtered.filter((t) => t.status === "In Progress").length;
  const inReview   = filtered.filter((t) => t.status === "In Review").length;
  const blocked    = filtered.filter((t) => t.status === "Blocked" || t.blocker).length;
  const done       = filtered.filter((t) => t.status === "Done").length;
  const overdue    = filtered.filter((t) => isOverdue(t.dueDate, t.status)).length;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
            style={{ background: `${accentColor}18` }}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: `${accentColor}18`, color: accentColor }}
              >
                {department}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
              {workspace} Tasks
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
              {total} task{total !== 1 ? "s" : ""} · {blocked} blocked · {overdue} overdue
            </p>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="Total"       value={tasks.length} color="var(--rtm-blue)"  bg="var(--rtm-blue-xlight)" />
        <KPICard label="In Progress" value={inProgress}   color="#3B82F6"          bg="#EFF6FF" />
        <KPICard label="In Review"   value={inReview}     color="#8B5CF6"          bg="#F5F3FF" />
        <KPICard label="Blocked"     value={blocked}      color="#DC2626"          bg="#FEF2F2" />
        <KPICard label="Overdue"     value={overdue}      color="#D97706"          bg="#FFFBEB" />
        <KPICard label="Done"        value={done}         color="#059669"          bg="#ECFDF5" />
      </div>

      {/* ── Filters ── */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* ── Task Table ── */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
        >
          <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ color: "var(--rtm-text-muted)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm font-medium" style={{ color: "var(--rtm-text-muted)" }}>
            No tasks match your filters
          </p>
        </div>
      ) : (
        <div className="rtm-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--rtm-border)", background: "var(--rtm-bg)" }}>
                  {[
                    "Task",
                    "Client",
                    "Service",
                    "Owner",
                    "Priority",
                    "Due Date",
                    "Status",
                    "Blocker",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                      style={{ color: "var(--rtm-text-muted)", whiteSpace: "nowrap" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((task, i) => {
                  const overduRow = isOverdue(task.dueDate, task.status);
                  const rowBg = i % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-bg)";
                  return (
                    <tr
                      key={task.id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid var(--rtm-border-light)", background: rowBg }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-blue-xlight)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = rowBg)}
                    >
                      {/* Task title */}
                      <td className="px-4 py-3 min-w-[200px] max-w-[280px]">
                        <span className="font-semibold leading-snug" style={{ color: "var(--rtm-text-primary)" }}>
                          {task.title}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium" style={{ color: "var(--rtm-text-secondary)" }}>
                          {task.client}
                        </span>
                      </td>

                      {/* Service */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                        >
                          {task.service}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: accentColor }}
                          >
                            {task.owner.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                            {task.owner}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} />
                      </td>

                      {/* Due date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="text-xs font-medium"
                          style={{ color: overduRow ? "#DC2626" : "var(--rtm-text-muted)" }}
                        >
                          {overduRow && "! "}{fmt(task.dueDate)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={task.status} />
                      </td>

                      {/* Blocker */}
                      <td className="px-4 py-3 max-w-[220px]">
                        <BlockerFlag blocker={task.blocker} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div
            className="px-4 py-2 border-t flex items-center justify-between"
            style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
          >
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Showing {filtered.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </span>
            {blocked > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#FEF2F2", color: "#DC2626" }}>
                {blocked} blocked
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
