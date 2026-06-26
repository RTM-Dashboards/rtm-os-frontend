"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import WorkspaceTaskDrawer from "./WorkspaceTaskDrawer";
import type { WorkspaceUserContext, WorkspaceUserRole } from "./WorkspaceTaskDrawer";

// ─────────────────────────────────────────────────────────────────────────────
// WorkspaceTaskPage
//
// Shared filtered task view component used by all workspace task pages.
// Source of truth: Global Projects & Tasks module.
// Renders a workspace-scoped view — not a standalone task system.
//
// Props:
//   workspaceName  — workspace label used in the page header
//   tasks          — workspace-filtered task records
//   accentColor    — optional accent color for workspace chip
//   userRole       — mock role for permission-aware UI (defaults to department-member)
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export type WorkspaceTaskStatus = "Pending" | "In Progress" | "In Review" | "Blocked" | "Done";
export type WorkspaceTaskPriority = "Low" | "Medium" | "High" | "Critical";
export type WorkspaceTaskSource = "Task Blueprint" | "Workflow Automation" | "Manual Task";

export interface WorkspaceTask {
  id: string;
  title: string;
  client: string;
  project: string;
  department: string;
  service: string;
  source: WorkspaceTaskSource;
  blueprintSource?: string;
  workflowSource?: string;
  assignee: string;
  priority: WorkspaceTaskPriority;
  dueDate: string;
  status: WorkspaceTaskStatus;
  blocker?: string | null;
  // legacy compat — optional aliases
  owner?: string;
  due?: string;
}

// ── Color maps ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<WorkspaceTaskStatus, { bg: string; text: string; dot: string }> = {
  Pending:      { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  "In Progress":{ bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  "In Review":  { bg: "#ede9fe", text: "#6d28d9", dot: "#8b5cf6" },
  Blocked:      { bg: "#fee2e2", text: "#b91c1c", dot: "#dc2626" },
  Done:         { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
};

const PRIORITY_COLOR: Record<WorkspaceTaskPriority, { bg: string; text: string }> = {
  Low:      { bg: "#f1f5f9", text: "#64748b" },
  Medium:   { bg: "#ede9fe", text: "#6d28d9" },
  High:     { bg: "#fef3c7", text: "#d97706" },
  Critical: { bg: "#fee2e2", text: "#dc2626" },
};

// Source badge abbreviations
const SOURCE_ABBR: Record<WorkspaceTaskSource, { label: string; title: string; bg: string; text: string }> = {
  "Task Blueprint":     { label: "BP",     title: "Task Blueprint",     bg: "#ede9fe", text: "#5b21b6" },
  "Workflow Automation":{ label: "WF",     title: "Workflow Automation", bg: "#dbeafe", text: "#1d4ed8" },
  "Manual Task":        { label: "Manual", title: "Manual Task",         bg: "#f1f5f9", text: "#475569" },
};

// ── Role helper ───────────────────────────────────────────────────────────────

function buildUserCtx(role: WorkspaceUserRole, workspaceName: string): WorkspaceUserContext {
  const hasProjectAccess = role === "manager" || role === "executive";
  return {
    role,
    name: role === "department-member" ? "Team Member"
        : role === "department-lead"   ? "Department Lead"
        : role === "manager"           ? "Operations Manager"
        : "Executive",
    department: workspaceName,
    hasProjectAccess,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WorkspaceTaskStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
        background: c.bg, color: c.text, whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: WorkspaceTaskPriority }) {
  const c = PRIORITY_COLOR[priority];
  return (
    <span
      style={{
        padding: "2px 7px", borderRadius: 20, fontSize: 11, fontWeight: 600,
        background: c.bg, color: c.text, whiteSpace: "nowrap",
      }}
    >
      {priority}
    </span>
  );
}

function SourceBadge({ source }: { source: WorkspaceTaskSource }) {
  const s = SOURCE_ABBR[source];
  return (
    <span
      title={s.title}
      style={{
        padding: "2px 7px", borderRadius: 10, fontSize: 11, fontWeight: 600,
        background: s.bg, color: s.text, whiteSpace: "nowrap", cursor: "default",
      }}
    >
      {s.label}
    </span>
  );
}

// ── Three-dot row actions menu ────────────────────────────────────────────────

interface ActionsMenuProps {
  task: WorkspaceTask;
  userCtx: WorkspaceUserContext;
  onAction: (action: string, taskId: string) => void;
}

function ActionsMenu({ task, userCtx, onAction }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Build menu items based on role permissions
  const menuItems = useMemo(() => {
    const items: { id: string; label: string; danger?: boolean }[] = [
      { id: "open-task",      label: "Open Task"      },
      { id: "update-status",  label: "Update Status"  },
      { id: "add-note",       label: "Add Note"        },
      { id: "mark-blocked",   label: "Mark Blocked",   danger: true },
      { id: "request-review", label: "Request Review"  },
    ];
    // Escalate requires Department Lead or higher
    if (userCtx.role !== "department-member") {
      items.push({ id: "escalate", label: "Escalate", danger: true });
    }
    // Open Project only if user has project access
    if (userCtx.hasProjectAccess) {
      items.push({ id: "open-project", label: "Open Project" });
    }
    return items;
  }, [userCtx]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        title="Actions"
        style={{
          width: 28, height: 28, borderRadius: 6, border: "1px solid var(--rtm-border, #e2e8f0)",
          background: open ? "var(--rtm-bg, #f8fafc)" : "transparent",
          color: "var(--rtm-text-muted, #94a3b8)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, lineHeight: 1,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-bg, #f8fafc)")}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        ···
      </button>
      {open && (
        <div
          style={{
            position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 200,
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            minWidth: 160, overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => { onAction(item.id, task.id); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 14px", fontSize: 12, fontWeight: 500,
                background: "transparent",
                color: item.danger ? "#dc2626" : "var(--rtm-text-primary, #1e293b)",
                border: "none", cursor: "pointer",
                borderTop: idx > 0 && (item.id === "escalate" || item.id === "open-project") ? "1px solid #f1f5f9" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

interface Filters {
  project: string;
  client: string;
  assignee: string;
  status: string;
  priority: string;
}

const selStyle: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid var(--rtm-border, #e2e8f0)",
  borderRadius: 7,
  fontSize: 12,
  background: "var(--rtm-bg, #fff)",
  color: "var(--rtm-text-primary, #1e293b)",
  cursor: "pointer",
  outline: "none",
};

function FilterBar({
  filters,
  onChange,
  projects,
  clients,
  assignees,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  projects: string[];
  clients: string[];
  assignees: string[];
}) {
  const hasActive =
    filters.project || filters.client || filters.assignee ||
    filters.status !== "All" || filters.priority !== "All";

  return (
    <div
      style={{
        background: "var(--rtm-surface, #fff)",
        border: "1px solid var(--rtm-border, #e2e8f0)",
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--rtm-text-primary, #1e293b)" }}>
          Filters
        </span>
        <span style={{ fontSize: 11, color: "var(--rtm-text-muted, #94a3b8)" }}>
          Scoped to this workspace — source: Global Projects &amp; Tasks
        </span>
        {hasActive && (
          <button
            onClick={() => onChange({ project: "", client: "", assignee: "", status: "All", priority: "All" })}
            style={{
              marginLeft: "auto", padding: "2px 9px", borderRadius: 6,
              border: "1px solid var(--rtm-border, #e2e8f0)",
              background: "var(--rtm-bg, #f8fafc)",
              color: "var(--rtm-text-muted, #64748b)",
              fontSize: 11, cursor: "pointer", fontWeight: 600,
            }}
          >
            Clear All
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <select style={selStyle} value={filters.project} onChange={e => onChange({ ...filters, project: e.target.value })}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p}>{p}</option>)}
        </select>
        <select style={selStyle} value={filters.client} onChange={e => onChange({ ...filters, client: e.target.value })}>
          <option value="">All Clients</option>
          {clients.map(c => <option key={c}>{c}</option>)}
        </select>
        <select style={selStyle} value={filters.assignee} onChange={e => onChange({ ...filters, assignee: e.target.value })}>
          <option value="">All Assignees</option>
          {assignees.map(a => <option key={a}>{a}</option>)}
        </select>
        <select style={selStyle} value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })}>
          <option value="All">All Statuses</option>
          {(["Pending", "In Progress", "In Review", "Blocked", "Done"] as WorkspaceTaskStatus[]).map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select style={selStyle} value={filters.priority} onChange={e => onChange({ ...filters, priority: e.target.value })}>
          <option value="All">All Priorities</option>
          {(["Critical", "High", "Medium", "Low"] as WorkspaceTaskPriority[]).map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Role switcher (dev/demo helper) ──────────────────────────────────────────

const ROLE_OPTIONS: { value: WorkspaceUserRole; label: string }[] = [
  { value: "department-member", label: "Department Member" },
  { value: "department-lead",   label: "Department Lead"   },
  { value: "manager",           label: "Manager / Operations" },
  { value: "executive",         label: "Executive"           },
];

// ── Main component ────────────────────────────────────────────────────────────

interface WorkspaceTaskPageProps {
  workspaceName: string;
  tasks: WorkspaceTask[];
  accentColor?: string;
  /** Mock role — defaults to department-member. Adjust per workspace config. */
  userRole?: WorkspaceUserRole;
}

export default function WorkspaceTaskPage({
  workspaceName,
  tasks: initialTasks,
  accentColor = "var(--rtm-blue, #1B4FD8)",
  userRole: initialRole = "department-member",
}: WorkspaceTaskPageProps) {
  const [filters, setFilters] = useState<Filters>({
    project: "", client: "", assignee: "", status: "All", priority: "All",
  });
  const [toast, setToast] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<WorkspaceTask[]>(initialTasks);

  // Role switcher (mock — demo/dev only)
  const [mockRole, setMockRole] = useState<WorkspaceUserRole>(initialRole);
  const userCtx = useMemo(() => buildUserCtx(mockRole, workspaceName), [mockRole, workspaceName]);

  const activeTask = useMemo(
    () => tasks.find(t => t.id === activeTaskId) ?? null,
    [tasks, activeTaskId],
  );

  const fireToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  function handleStatusUpdate(taskId: string, status: WorkspaceTaskStatus) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  }

  function handleAction(action: string, taskId: string) {
    const task = tasks.find(t => t.id === taskId);
    const name = task?.title ?? taskId;
    switch (action) {
      case "open-task":
        setActiveTaskId(taskId);
        break;
      case "open-project":
        fireToast(`Opening project for: ${name}`);
        break;
      case "update-status":
        setActiveTaskId(taskId);
        fireToast(`Open task drawer to update status: ${name}`);
        break;
      case "add-note":
        setActiveTaskId(taskId);
        fireToast(`Open Notes tab in drawer for: ${name}`);
        break;
      case "mark-blocked":
        handleStatusUpdate(taskId, "Blocked");
        fireToast(`Marked blocked: ${name}`);
        break;
      case "request-review":
        handleStatusUpdate(taskId, "In Review");
        fireToast(`Review requested: ${name}`);
        break;
      case "escalate":
        fireToast(`Escalated: ${name}`);
        break;
    }
  }

  const projects  = useMemo(() => [...new Set(tasks.map(t => t.project))], [tasks]);
  const clients   = useMemo(() => [...new Set(tasks.map(t => t.client))], [tasks]);
  const assignees = useMemo(() => [...new Set(tasks.map(t => t.assignee ?? t.owner ?? ""))].filter(Boolean), [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filters.project  && t.project  !== filters.project)  return false;
      if (filters.client   && t.client   !== filters.client)   return false;
      const taskAssignee = t.assignee ?? t.owner ?? "";
      if (filters.assignee && taskAssignee !== filters.assignee) return false;
      if (filters.status   !== "All" && t.status   !== filters.status)   return false;
      if (filters.priority !== "All" && t.priority !== filters.priority) return false;
      return true;
    });
  }, [tasks, filters]);

  // KPIs
  const total      = tasks.length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const inReview   = tasks.filter(t => t.status === "In Review").length;
  const blocked    = tasks.filter(t => t.status === "Blocked").length;
  const done       = tasks.filter(t => t.status === "Done").length;

  const cardStyle: React.CSSProperties = {
    background: "var(--rtm-surface, #fff)",
    border: "1px solid var(--rtm-border, #e2e8f0)",
    borderRadius: 8,
    padding: "12px 14px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  };

  const COLS = [
    "Task", "Client", "Project", "Department", "Service",
    "Assignee", "Due Date", "Priority", "Status", "Source", "Actions",
  ];

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: "var(--rtm-text-primary, #1e293b)" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 2000,
          background: "#1e293b", color: "#fff", padding: "9px 16px",
          borderRadius: 7, fontSize: 12, fontWeight: 600,
          boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
        }}>
          {toast}
        </div>
      )}

      {/* Task Detail Drawer */}
      {activeTask && (
        <WorkspaceTaskDrawer
          task={activeTask}
          userCtx={userCtx}
          onClose={() => setActiveTaskId(null)}
          onStatusUpdate={handleStatusUpdate}
          onToast={fireToast}
        />
      )}

      <div className="space-y-5">

        {/* ── Header ── */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            {workspaceName}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--rtm-text-primary, #1e293b)" }}>
            {workspaceName} Task View
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary, #475569)" }}>
            Filtered task view from the global project and task system.
          </p>
        </div>

        {/* ── Role switcher (mock demo) ── */}
        <div style={{
          ...cardStyle, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--rtm-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Mock Role
          </span>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {ROLE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setMockRole(opt.value)}
                style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  cursor: "pointer",
                  background: mockRole === opt.value ? "#1B4FD8" : "var(--rtm-bg, #f8fafc)",
                  color: mockRole === opt.value ? "#fff" : "var(--rtm-text-secondary, #475569)",
                  border: `1px solid ${mockRole === opt.value ? "#1B4FD8" : "var(--rtm-border, #e2e8f0)"}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 11, color: "var(--rtm-text-muted, #94a3b8)", marginLeft: 4 }}>
            {userCtx.hasProjectAccess ? "Project access: ON" : "Project access: OFF — project name shown as context only"}
          </span>
        </div>

        {/* ── Source banner ── */}
        <div
          style={{
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: 7,
            padding: "12px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
              textTransform: "uppercase", color: "#0369a1", marginBottom: 3,
            }}>
              Powered by Projects &amp; Tasks
            </div>
            <div style={{ fontSize: 12, color: "#0c4a6e", lineHeight: 1.5 }}>
              Filtered view scoped to the <strong>{workspaceName}</strong> workspace. All task creation, ownership,
              blueprints, and lifecycle management originate from the{" "}
              <a href="/projects/tasks" style={{ color: "#0369a1", fontWeight: 700 }}>
                Global Projects &amp; Tasks
              </a>{" "}module.
            </div>
          </div>
          <a
            href="/projects/tasks"
            style={{
              flexShrink: 0, padding: "5px 12px", borderRadius: 6,
              background: "#0369a1", color: "#fff", fontSize: 11, fontWeight: 700,
              textDecoration: "none", whiteSpace: "nowrap", alignSelf: "center",
            }}
          >
            Open Global Tasks
          </a>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
          {[
            { label: "Total Tasks",   value: total,      color: accentColor },
            { label: "In Progress",   value: inProgress, color: "#3b82f6"   },
            { label: "In Review",     value: inReview,   color: "#8b5cf6"   },
            { label: "Blocked",       value: blocked,    color: "#dc2626"   },
            { label: "Done",          value: done,       color: "#16a34a"   },
          ].map(k => (
            <div key={k.label} style={{ ...cardStyle, borderLeft: `3px solid ${k.color}` }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--rtm-text-secondary, #475569)", marginTop: 3 }}>
                {k.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          projects={projects}
          clients={clients}
          assignees={assignees}
        />

        {/* ── Table header meta ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
              {workspaceName} Tasks
            </h2>
            <p style={{ fontSize: 12, color: "var(--rtm-text-muted, #94a3b8)", margin: "1px 0 0" }}>
              {filtered.length} task{filtered.length !== 1 ? "s" : ""} — filtered from Global Projects &amp; Tasks
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {userCtx.hasProjectAccess && (
              <a
                href="/projects"
                style={{
                  padding: "5px 12px", borderRadius: 6,
                  border: "1px solid var(--rtm-border, #e2e8f0)",
                  background: "var(--rtm-bg, #f8fafc)",
                  color: "var(--rtm-text-secondary, #475569)",
                  fontSize: 11, fontWeight: 600, textDecoration: "none",
                }}
              >
                Open Projects
              </a>
            )}
            <a
              href="/projects/tasks"
              style={{
                padding: "5px 12px", borderRadius: 6,
                background: "#1e293b", color: "#fff",
                fontSize: 11, fontWeight: 600, textDecoration: "none",
              }}
            >
              Global Tasks
            </a>
          </div>
        </div>

        {/* ── Task table ── */}
        {filtered.length === 0 ? (
          <div
            style={{
              ...cardStyle,
              padding: "32px 24px", textAlign: "center",
              color: "var(--rtm-text-muted, #94a3b8)", fontSize: 13,
            }}
          >
            No tasks match the selected filters.
          </div>
        ) : (
          <div style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 1200 }}>
              <thead>
                <tr
                  style={{
                    background: "var(--rtm-bg, #f8fafc)",
                    borderBottom: "2px solid var(--rtm-border, #e2e8f0)",
                  }}
                >
                  {COLS.map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "9px 12px", textAlign: "left",
                        fontSize: 10, fontWeight: 700, color: "var(--rtm-text-muted, #64748b)",
                        letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((task, i) => {
                  const assignee = task.assignee ?? task.owner ?? "—";
                  const due      = task.dueDate ?? task.due ?? "—";
                  const isBlocked = task.status === "Blocked";
                  const rowBg = isBlocked
                    ? "#fff8f8"
                    : i % 2 === 0
                      ? "var(--rtm-surface, #fff)"
                      : "var(--rtm-bg, #f8fafc)";

                  return (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom: "1px solid var(--rtm-border-light, #f1f5f9)",
                        background: rowBg,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-xlight, #eff6ff)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
                    >
                      {/* Task — clickable name opens drawer */}
                      <td style={{ padding: "8px 12px", minWidth: 180, maxWidth: 260 }}>
                        <button
                          onClick={() => setActiveTaskId(task.id)}
                          style={{
                            background: "none", border: "none", padding: 0, cursor: "pointer",
                            fontWeight: 600, color: "var(--rtm-blue, #1d4ed8)", fontSize: 12,
                            textAlign: "left", textDecoration: "none",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          {task.title}
                        </button>
                        <div style={{ fontSize: 10, color: "var(--rtm-text-muted, #94a3b8)", fontFamily: "monospace", marginTop: 1 }}>
                          {task.id}
                        </div>
                      </td>

                      {/* Client */}
                      <td style={{ padding: "8px 12px", whiteSpace: "nowrap", fontWeight: 500, color: "var(--rtm-text-secondary, #475569)", fontSize: 12 }}>
                        {task.client}
                      </td>

                      {/* Project — permission-aware */}
                      <td style={{ padding: "8px 12px", maxWidth: 180 }}>
                        {userCtx.hasProjectAccess ? (
                          <a
                            href="/projects"
                            style={{
                              color: "var(--rtm-blue, #1d4ed8)", fontSize: 11,
                              textDecoration: "none", fontWeight: 500,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                          >
                            {task.project}
                          </a>
                        ) : (
                          <span style={{ color: "var(--rtm-text-secondary, #475569)", fontSize: 11 }}>
                            {task.project}
                          </span>
                        )}
                      </td>

                      {/* Department */}
                      <td style={{ padding: "8px 12px", whiteSpace: "nowrap", color: "var(--rtm-text-secondary, #475569)", fontSize: 12 }}>
                        {task.department}
                      </td>

                      {/* Service */}
                      <td style={{ padding: "8px 12px", whiteSpace: "nowrap", fontSize: 12, color: "var(--rtm-text-secondary, #475569)" }}>
                        {task.service}
                      </td>

                      {/* Assignee */}
                      <td style={{ padding: "8px 12px", whiteSpace: "nowrap", color: "var(--rtm-text-secondary, #475569)", fontSize: 12 }}>
                        {assignee}
                      </td>

                      {/* Due Date */}
                      <td style={{ padding: "8px 12px", whiteSpace: "nowrap", color: "var(--rtm-text-muted, #64748b)", fontSize: 11 }}>
                        {due}
                      </td>

                      {/* Priority */}
                      <td style={{ padding: "8px 12px" }}>
                        <PriorityBadge priority={task.priority} />
                      </td>

                      {/* Status */}
                      <td style={{ padding: "8px 12px" }}>
                        <StatusBadge status={task.status} />
                      </td>

                      {/* Source */}
                      <td style={{ padding: "8px 12px" }}>
                        <SourceBadge source={task.source} />
                      </td>

                      {/* Actions — three-dot menu only */}
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <ActionsMenu task={task} userCtx={userCtx} onAction={handleAction} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Table footer */}
            <div
              style={{
                padding: "8px 12px", borderTop: "1px solid var(--rtm-border, #e2e8f0)",
                background: "var(--rtm-bg, #f8fafc)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 11, color: "var(--rtm-text-muted, #94a3b8)" }}>
                Showing {filtered.length} of {total} tasks
              </span>
              {blocked > 0 && (
                <span
                  style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 7px",
                    borderRadius: 10, background: "#fee2e2", color: "#dc2626",
                  }}
                >
                  {blocked} blocked
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div
          style={{
            padding: "10px 14px",
            background: "var(--rtm-bg, #f8fafc)",
            border: "1px solid var(--rtm-border, #e2e8f0)",
            borderRadius: 7, fontSize: 12,
            color: "var(--rtm-text-muted, #64748b)", lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "var(--rtm-text-primary, #1e293b)" }}>Source of truth:</strong>{" "}
          All tasks displayed here originate from the{" "}
          <a href="/projects/tasks" style={{ color: "#0369a1", fontWeight: 600 }}>
            Global Projects &amp; Tasks
          </a>{" "}
          module. This view applies {workspaceName} workspace filters only.
        </div>

      </div>
    </div>
  );
}
