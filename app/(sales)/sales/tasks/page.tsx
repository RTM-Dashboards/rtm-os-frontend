"use client";

import React, { useState, useEffect } from "react";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { pendingSalesTasks } from "@/lib/engine/pending-sales-tasks";
import type { WorkspaceTask, WorkspaceTaskStatus, WorkspaceTaskPriority } from "@/components/workspace/WorkspaceTaskPage";
import { useWidgetPreferences } from "@/components/sales/widgets/useWidgetPreferences";
import { CustomizeViewModal } from "@/components/sales/widgets/CustomizeViewModal";

// ─── Locale-independent date helper (avoids hydration mismatch) ──────────────
function formatDateOffset(hours: number): string {
  const d = new Date(Date.now() + hours * 3600 * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Role mock (no toggle buttons in production) ─────────────────────────────
// In production this comes from auth context.
type SalesUserRole = "Department Head" | "Manager" | "Specialist" | "Coordinator";
const CURRENT_ROLE: SalesUserRole = "Manager" as SalesUserRole;
const CAN_SEE_GLOBAL = CURRENT_ROLE === "Department Head" || CURRENT_ROLE === "Manager";

// ─── Status / Priority helpers ────────────────────────────────────────────────
const STATUS_META: Record<WorkspaceTaskStatus, { bg: string; color: string; border: string }> = {
  "Pending":     { bg: "#F3F4F6", color: "#6B7280", border: "#D1D5DB" },
  "In Progress": { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  "In Review":   { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  "Blocked":     { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  "Done":        { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
};

const PRIORITY_META: Record<WorkspaceTaskPriority, { color: string }> = {
  "Low":      { color: "#6B7280" },
  "Medium":   { color: "#D97706" },
  "High":     { color: "#DC2626" },
  "Critical": { color: "#7C3AED" },
};

const STATUSES: WorkspaceTaskStatus[] = ["Pending", "In Progress", "In Review", "Blocked", "Done"];

// ─── Empty create-task form ───────────────────────────────────────────────────
const EMPTY_FORM = {
  title: "",
  client: "",
  assignee: "",
  dueDate: "",
  priority: "High" as WorkspaceTaskPriority,
  status: "Pending" as WorkspaceTaskStatus,
  project: "",
  service: "",
  notes: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalesTasksPage() {
  const AUDIT_REVIEW_TASKS: WorkspaceTask[] = [
    {
      id: "ar-1",
      title: "Review SEO audit findings — Coastal Wellness Spa",
      client: "Coastal Wellness Spa",
      project: "Hybrid Audit HYB-2025-3391",
      department: "SEO",
      service: "SEO",
      source: "Manual Task" as WorkspaceTask["source"],
      assignee: "Alex K.",
      priority: "High" as WorkspaceTask["priority"],
      status: "In Progress" as WorkspaceTask["status"],
      dueDate: formatDateOffset(4),
      blocker: null,
    },
    {
      id: "ar-2",
      title: "Complete GBP manual audit scorecard — Harbor Auto Group",
      client: "Harbor Auto Group",
      project: "Manual Audit AUD-2025-1842",
      department: "GBP",
      service: "Google Business Profile",
      source: "Manual Task" as WorkspaceTask["source"],
      assignee: "Marcus T.",
      priority: "High" as WorkspaceTask["priority"],
      status: "Pending" as WorkspaceTask["status"],
      dueDate: formatDateOffset(18),
      blocker: null,
    },
    {
      id: "ar-3",
      title: "Review Paid Advertising AI findings — Metro Dental Group",
      client: "Metro Dental Group",
      project: "Hybrid Audit HYB-2025-4102",
      department: "Paid Advertising",
      service: "PPC / Google Ads",
      source: "Manual Task" as WorkspaceTask["source"],
      assignee: "Casey R.",
      priority: "Critical" as WorkspaceTask["priority"],
      status: "Blocked" as WorkspaceTask["status"],
      dueDate: formatDateOffset(-6),
      blocker: "Overdue — SLA deadline passed",
    },
  ];
  const [tasks, setTasks] = useState<WorkspaceTask[]>(() => [...getWorkspaceTasksByDepartment("Sales"), ...AUDIT_REVIEW_TASKS, ...pendingSalesTasks]);

  // Drain any cross-department tasks that were pushed into pendingSalesTasks
  // after this component first mounted (e.g. from Billing Invoices page).
  useEffect(() => {
    if (pendingSalesTasks.length === 0) return;
    setTasks(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newOnes = pendingSalesTasks.filter(t => !existingIds.has(t.id));
      return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<WorkspaceTaskStatus | "All">("All");
  const [filterPriority, setFilterPriority] = useState<WorkspaceTaskPriority | "All">("All");
  const [filterClient, setFilterClient] = useState("All");
  const [filterAssignee, setFilterAssignee] = useState("All");

  // Drawer state
  const [drawerTask, setDrawerTask] = useState<WorkspaceTask | null>(null);
  const [drawerTab, setDrawerTab] = useState<"overview" | "notes" | "activity" | "related">("overview");

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState("");

  // Three-dot action menu state
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Widget preferences
  const [showCustomize, setShowCustomize] = useState(false);
  const { widgetOrder, isVisible } = useWidgetPreferences("tasks");

  // Unique clients / assignees for dropdowns
  const clients   = Array.from(new Set(tasks.map(t => t.client))).sort();
  const assignees = Array.from(new Set(tasks.map(t => t.assignee))).sort();

  const filtered = tasks.filter(t => {
    if (filterStatus   !== "All" && t.status   !== filterStatus)   return false;
    if (filterPriority !== "All" && t.priority  !== filterPriority) return false;
    if (filterClient   !== "All" && t.client    !== filterClient)   return false;
    if (filterAssignee !== "All" && t.assignee  !== filterAssignee) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.client.toLowerCase().includes(q) ||
        (t.project ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI counts
  const kpis = {
    total:      tasks.length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    inReview:   tasks.filter(t => t.status === "In Review").length,
    blocked:    tasks.filter(t => t.status === "Blocked").length,
    done:       tasks.filter(t => t.status === "Done").length,
  };

  function handleCreate() {
    if (!form.title.trim())    { setFormError("Task name is required."); return; }
    if (!form.client.trim())   { setFormError("Client is required."); return; }
    if (!form.assignee.trim()) { setFormError("Assignee is required."); return; }
    if (!form.dueDate.trim())  { setFormError("Due date is required."); return; }

    const newTask: WorkspaceTask = {
      id: `task-${Date.now()}`,
      title:    form.title,
      client:   form.client,
      project:  form.project || "",
      service:  form.service || "",
      assignee: form.assignee,
      dueDate:  form.dueDate,
      priority: form.priority,
      status:   form.status,
      source:   "Manual Task",
      department: "Sales",
    };
    setTasks(prev => [newTask, ...prev]);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setShowCreate(false);
  }

  function handleMarkComplete(taskId: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "Done" as WorkspaceTaskStatus } : t));
    setOpenMenu(null);
  }

  function handleStatusChange(taskId: string, status: WorkspaceTaskStatus) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    setOpenMenu(null);
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>Sales</p>
          <h1 className="text-2xl font-medium tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Tasks</h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            Your Sales workspace tasks.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => { setForm({ ...EMPTY_FORM }); setFormError(""); setShowCreate(true); }}
            className="text-sm font-semibold px-4 py-2 rounded-lg border"
            style={{ background: "#059669", color: "#fff", borderColor: "#059669" }}>
            New Task
          </button>
          <button
            onClick={() => setShowCustomize(true)}
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
            style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
            Customize View
          </button>
          {CAN_SEE_GLOBAL && (
            <a href="/projects/tasks"
              className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
              style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}>
              Open Global Tasks
            </a>
          )}
        </div>
      </div>

      {/* KPI Bar */}
      {showCustomize && (
        <CustomizeViewModal pageId="tasks" onClose={() => setShowCustomize(false)} />
      )}
      {(() => {
        // Map widget id -> KPI card definition (values unchanged)
        const kpiDefs: Record<string, { label: string; value: number; meta?: { bg: string; color: string; border: string } }> = {
          "tasks-total":       { label: "Total Tasks",  value: kpis.total },
          "tasks-in-progress": { label: "In Progress",  value: kpis.inProgress, meta: STATUS_META["In Progress"] },
          "tasks-in-review":   { label: "In Review",    value: kpis.inReview,   meta: STATUS_META["In Review"] },
          "tasks-blocked":     { label: "Blocked",      value: kpis.blocked,    meta: STATUS_META["Blocked"] },
          "tasks-done":        { label: "Done",         value: kpis.done,       meta: STATUS_META["Done"] },
        };
        const visibleDefs = widgetOrder
          .filter((id) => isVisible(id) && kpiDefs[id])
          .map((id) => ({ id, ...kpiDefs[id] }));
        if (visibleDefs.length === 0) return null;
        return (
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${visibleDefs.length}, minmax(0, 1fr))` }}>
            {visibleDefs.map(({ id, label, value, meta }) => (
              <div key={id}
                className="rounded-xl border p-4 text-center"
                style={{ background: meta?.bg ?? "var(--rtm-surface)", borderColor: meta?.border ?? "var(--rtm-border)" }}>
                <p className="text-2xl font-bold" style={{ color: meta?.color ?? "var(--rtm-text-primary)" }}>{value}</p>
                <p className="text-xs font-semibold mt-1" style={{ color: meta?.color ?? "var(--rtm-text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="text-sm px-3 py-2 rounded-lg border outline-none flex-1"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", minWidth: 200 }}
        />
        {/* Client */}
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg border outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
          <option value="All">All Clients</option>
          {clients.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {/* Assignee */}
        <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg border outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
          <option value="All">All Assignees</option>
          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        {/* Status */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as WorkspaceTaskStatus | "All")}
          className="text-sm px-3 py-2 rounded-lg border outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {/* Priority */}
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as WorkspaceTaskPriority | "All")}
          className="text-sm px-3 py-2 rounded-lg border outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
          <option value="All">All Priorities</option>
          {(["High","Medium","Low","Critical"] as WorkspaceTaskPriority[]).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(search || filterStatus !== "All" || filterPriority !== "All" || filterClient !== "All" || filterAssignee !== "All") && (
          <button onClick={() => { setSearch(""); setFilterStatus("All"); setFilterPriority("All"); setFilterClient("All"); setFilterAssignee("All"); }}
            className="text-xs px-3 py-2 rounded-lg font-semibold"
            style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Task Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
                {["Task", "Client", "Project", "Service", "Assignee", "Due Date", "Priority", "Status", "Source", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, i) => {
                const sm = STATUS_META[task.status];
                const pm = PRIORITY_META[task.priority];
                return (
                  <tr key={task.id}
                    className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                    style={{ borderBottom: "1px solid var(--rtm-border)", background: i % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-bg)" }}
                    onClick={() => { setDrawerTask(task); setDrawerTab("overview"); }}>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-semibold text-xs truncate" style={{ color: "var(--rtm-text-primary)" }}>{task.title}</p>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{task.client}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{task.project || "—"}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{task.service || "—"}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{task.assignee}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{task.dueDate ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold" style={{ color: pm.color }}>{task.priority}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ background: sm.bg, color: sm.color, borderColor: sm.border }}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{task.source}</td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                          className="text-xs px-2 py-1 rounded font-semibold border"
                          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}>
                          ...
                        </button>
                        {openMenu === task.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-lg z-10"
                            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                            <button onClick={() => { setDrawerTask(task); setDrawerTab("overview"); setOpenMenu(null); }}
                              className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50">View Details</button>
                            <button onClick={() => handleMarkComplete(task.id)}
                              className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50">Mark Complete</button>
                            <div className="border-t" style={{ borderColor: "var(--rtm-border)" }}>
                              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Update Status</p>
                              {STATUSES.map(s => (
                                <button key={s} onClick={() => handleStatusChange(task.id, s)}
                                  className="block w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50">
                                  {s}
                                </button>
                              ))}
                            </div>
                            <div className="border-t" style={{ borderColor: "var(--rtm-border)" }}>
                              <button className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50">Reassign</button>
                              <button className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50">Add Note</button>
                              <button className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-b-lg">Set Due Date</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    No tasks match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source of truth note */}
      <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        Tasks are scoped to the Sales workspace. Task creation and ownership is managed through the Global Projects and Tasks module.
      </p>

      {/* Task Detail Drawer */}
      {drawerTask && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerTask(null)} />
          <div className="w-[560px] h-full flex flex-col shadow-2xl overflow-hidden"
            style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)" }}>
            {/* Drawer Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{ background: STATUS_META[drawerTask.status].bg, color: STATUS_META[drawerTask.status].color, borderColor: STATUS_META[drawerTask.status].border }}>
                    {drawerTask.status}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: PRIORITY_META[drawerTask.priority].color }}>
                    {drawerTask.priority}
                  </span>
                </div>
                <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>{drawerTask.title}</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{drawerTask.client}</p>
              </div>
              <button onClick={() => setDrawerTask(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-lg flex-shrink-0 ml-4"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>x</button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex gap-0 border-b flex-shrink-0 overflow-x-auto"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
              {(["overview","notes","activity","related"] as const).map(tab => (
                <button key={tab} onClick={() => setDrawerTab(tab)}
                  className="px-4 py-3 text-xs font-semibold whitespace-nowrap capitalize transition-colors border-b-2"
                  style={{
                    borderBottomColor: drawerTab === tab ? "#059669" : "transparent",
                    color: drawerTab === tab ? "#059669" : "var(--rtm-text-muted)",
                  }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {drawerTab === "overview" && (
                <div className="space-y-3">
                  {[
                    ["Client",    drawerTask.client],
                    ["Project",   drawerTask.project || "—"],
                    ["Service",   drawerTask.service || "—"],
                    ["Assignee",  drawerTask.assignee],
                    ["Due Date",  drawerTask.dueDate ?? "—"],
                    ["Priority",  drawerTask.priority],
                    ["Status",    drawerTask.status],
                    ["Source",    drawerTask.source],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-3">
                      <span className="text-xs font-semibold w-20 flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
                      <span className="text-xs" style={{ color: "var(--rtm-text-primary)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
              {drawerTab === "notes" && (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No notes yet.</p>
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                    style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}>
                    Add Note
                  </button>
                </div>
              )}
              {drawerTab === "activity" && (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No activity recorded.</p>
                </div>
              )}
              {drawerTab === "related" && (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    This task is linked to the Sales workflow. Navigate to the relevant workflow stage:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Proposals",       href: "/sales/proposals"    },
                      { label: "Audits",          href: "/sales/audits"       },
                      { label: "Follow Ups",      href: "/sales/followups"    },
                      { label: "Pipeline",        href: "/sales/pipeline"     },
                    ].map(link => (
                      <a key={link.label} href={link.href}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"
                        style={{ background: "var(--rtm-surface)", color: "#059669", borderColor: "#A7F3D0" }}>
                        {link.label} →
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <div className="flex gap-2">
                <button onClick={() => handleMarkComplete(drawerTask.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                  style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>
                  Mark Complete
                </button>
                <button onClick={() => { setDrawerTask(null); }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                  style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}>
                  Close
                </button>
              </div>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}>
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
            <div className="px-6 py-5 border-b" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
              <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>New Task</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formError && (
                <p className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: "#FEF2F2", color: "#DC2626" }}>{formError}</p>
              )}
              {[
                { label: "Task Name *",   key: "title",    type: "text",   required: true  },
                { label: "Client *",      key: "client",   type: "text",   required: true  },
                { label: "Assignee *",    key: "assignee", type: "text",   required: true  },
                { label: "Due Date *",    key: "dueDate",  type: "date",   required: true  },
                { label: "Project",       key: "project",  type: "text",   required: false },
                { label: "Service",       key: "service",  type: "text",   required: false },
              ].map(({ label, key, type }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{label}</label>
                  <input type={type}
                    value={form[key as keyof typeof form] as string}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="text-sm px-3 py-2 rounded-lg border outline-none"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Priority *</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as WorkspaceTaskPriority }))}
                    className="text-sm px-3 py-2 rounded-lg border outline-none"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
                    {(["High","Medium","Low","Critical"] as WorkspaceTaskPriority[]).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as WorkspaceTaskStatus }))}
                    className="text-sm px-3 py-2 rounded-lg border outline-none"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Notes</label>
                <textarea rows={3} value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="text-sm px-3 py-2 rounded-lg border outline-none resize-none"
                  style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
              <button onClick={() => setShowCreate(false)}
                className="text-sm font-semibold px-4 py-2 rounded-lg border"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}>
                Cancel
              </button>
              <button onClick={handleCreate}
                className="text-sm font-semibold px-4 py-2 rounded-lg border"
                style={{ background: "#059669", color: "#fff", borderColor: "#059669" }}>
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
