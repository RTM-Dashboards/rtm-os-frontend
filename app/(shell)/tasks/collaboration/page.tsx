"use client";

import { useState } from "react";
import TaskDetailDrawer from "@/components/collaboration/TaskDetailDrawer";
import DepartmentHeadView from "@/components/collaboration/views/DepartmentHeadView";
import AccountManagerView from "@/components/collaboration/views/AccountManagerView";
import ExecutiveView from "@/components/collaboration/views/ExecutiveView";
import ProjectDashboardPanel from "@/components/collaboration/ProjectDashboardPanel";
import AISummaryPanel from "@/components/collaboration/AISummaryPanel";
import { COLLABORATION_DATA } from "@/lib/collaboration/mock-data";
import type { TaskCollaboration } from "@/lib/collaboration/types";

// 
// RTM OS — Task Collaboration Hub
// Route: /tasks/collaboration
// 

type ViewMode = "overview"| "dashboard"| "ai-summary"| "dept-head"| "account-manager"| "executive";
type TaskStatusUI = "In Progress"| "Open"| "Waiting"| "Blocked"| "Review"| "Completed";
type TaskPriorityUI = "Low"| "Medium"| "High"| "Urgent";

interface TaskSummaryItem {
  collab: TaskCollaboration;
  status: TaskStatusUI;
  priority: TaskPriorityUI;
}

// Pair mock collab data with display metadata
const TASK_SUMMARIES: TaskSummaryItem[] = [
  { collab: COLLABORATION_DATA[0], status: "In Progress", priority: "High"},
  { collab: COLLABORATION_DATA[1], status: "Blocked",     priority: "Urgent"},
  { collab: COLLABORATION_DATA[2], status: "Completed",   priority: "High"},
];

const VIEW_LABELS: Record<ViewMode, { label: string; icon?: string }> = {
  "overview":         { label: "Task List",         icon: ""},
  "dashboard":        { label: "Dashboard",         icon: ""},
  "ai-summary":       { label: "AI Summary",        icon: ""},
  "dept-head":        { label: "Department Head",   icon: ""},
  "account-manager":  { label: "Account Manager",   icon: ""},
  "executive":        { label: "Executive",         icon: ""},
};

const STATUS_COLORS: Record<TaskStatusUI, { bg: string; color: string }> = {
  "In Progress": { bg: "#DBEAFE", color: "#1E40AF"},
  "Open":        { bg: "#F3F4F6", color: "#374151"},
  "Waiting":     { bg: "#FEF3C7", color: "#92400E"},
  "Blocked":     { bg: "#FEE2E2", color: "#991B1B"},
  "Review":      { bg: "#F3E8FF", color: "#6B21A8"},
  "Completed":   { bg: "#D1FAE5", color: "#065F46"},
};

const PRIORITY_COLORS: Record<TaskPriorityUI, string> = {
  Low:    "#6B7280",
  Medium: "#D97706",
  High:   "#DC2626",
  Urgent: "#7C2D12",
};

export default function CollaborationPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [drawerTask, setDrawerTask] = useState<TaskSummaryItem | null>(null);

  const allNotifCount = COLLABORATION_DATA.reduce((s, t) => s + t.notifications.filter((n) => !n.read).length, 0);
  const allBlockedCount = COLLABORATION_DATA.reduce(
    (s, t) => s + t.dependencies.filter((d) => d.status === "Blocked"|| d.status === "Escalated").length,
    0,
  );
  const pendingApprCount = COLLABORATION_DATA.reduce(
    (s, t) => s + t.approvals.filter((a) => a.status === "Pending Approval"|| a.status === "Pending Review").length,
    0,
  );
  const openEscCount = COLLABORATION_DATA.reduce(
    (s, t) => s + t.escalations.filter((e) => e.status === "Open"|| e.status === "In Progress").length,
    0,
  );

  return (
    <div className="min-h-screen"style={{ background: "var(--rtm-bg)"}}>
      {/*  Page Header  */}
      <div
        className="px-8 py-6 sticky top-0 z-20"style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)"}}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              
              <h1 className="text-xl font-black"style={{ color: "var(--rtm-text-primary)"}}>
                Task Collaboration Hub
              </h1>
            </div>
            <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>
              Comments · Notes · Approvals · Attachments · Activity · Escalations · AI Summary
            </p>
          </div>

          {/* Alert pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {allBlockedCount > 0 && (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold text-white"style={{ background: "#DC2626"}}
              >
                 {allBlockedCount} Blocked
              </span>
            )}
            {pendingApprCount > 0 && (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold"style={{ background: "#FEF3C7", color: "#92400E"}}
              >
                ⏳ {pendingApprCount} Pending Approval{pendingApprCount > 1 ? "s": ""}
              </span>
            )}
            {openEscCount > 0 && (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold text-white"style={{ background: "#7C2D12"}}
              >
                 {openEscCount} Escalation{openEscCount > 1 ? "s": ""}
              </span>
            )}
            {allNotifCount > 0 && (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold text-white"style={{ background: "#1B4FD8"}}
              >
                 {allNotifCount} Unread
              </span>
            )}
          </div>
        </div>

        {/*  View Switcher  */}
        <div className="flex items-center gap-1 mt-4 p-1 rounded-xl w-fit"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
          {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => {
            const { label, icon } = VIEW_LABELS[mode];
            const isActive = viewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"style={{
                  background: isActive ? "var(--rtm-surface)": "transparent",
                  color: isActive ? "var(--rtm-blue)": "var(--rtm-text-secondary)",
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)": "none",
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/*  Content  */}
      <div className="px-8 py-6 max-w-5xl mx-auto">
        {/*  Overview: Task list  */}
        {viewMode === "overview"&& (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider"style={{ color: "var(--rtm-text-muted)"}}>
              All Tracked Tasks ({TASK_SUMMARIES.length}) — Click a task to open the Collaboration Drawer
            </p>

            {TASK_SUMMARIES.map((item) => {
              const { collab, status, priority } = item;
              const pendAppr = collab.approvals.filter((a) => a.status === "Pending Approval"|| a.status === "Pending Review").length;
              const blockedDeps = collab.dependencies.filter((d) => d.status === "Blocked").length;
              const unreadN = collab.notifications.filter((n) => !n.read).length;
              const openEsc = collab.escalations.filter((e) => e.status === "Open"|| e.status === "In Progress").length;
              const sc = STATUS_COLORS[status];

              return (
                <button
                  key={collab.taskId}
                  className="w-full text-left rounded-2xl p-5 transition-all"style={{
                    background: "var(--rtm-surface)",
                    border: `1px solid ${blockedDeps > 0 ? "#FECACA": pendAppr > 0 ? "#FDE68A": "var(--rtm-border)"}`,
                    cursor: "pointer",
                  }}
                  onClick={() => setDrawerTask(item)}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(27,79,216,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  {/* Row 1 — Title */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                        {collab.projectName}
                      </p>
                      <h3 className="text-base font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                        {collab.taskName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"style={{ background: sc.bg, color: sc.color }}
                      >
                        {status}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"style={{ background: PRIORITY_COLORS[priority] }}
                      >
                        {priority}
                      </span>
                    </div>
                  </div>

                  {/* Row 2 — Metrics */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Metric value={collab.comments.length} label="comments"/>
                    <Metric value={collab.internalNotes.length} label="int. notes"/>
                    <Metric value={collab.clientNotes.length} label="client notes"/>
                    <Metric value={collab.attachments.length} label="files"/>
                    <Metric value={collab.watchers.filter((w) => w.watching).length} label="watchers"/>
                    <Metric value={collab.approvals.length} label="approvals"/>
                    <Metric value={collab.dependencies.length} label="deps"/>
                    <Metric value={collab.activity.length} label="events"/>
                    <Metric value={collab.escalations.length} label="escalations"/>
                  </div>

                  {/* Row 3 — Alert badges */}
                  {(blockedDeps > 0 || pendAppr > 0 || unreadN > 0 || openEsc > 0) && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3"style={{ borderTop: "1px solid var(--rtm-border-light)"}}>
                      {blockedDeps > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white"style={{ background: "#DC2626"}}>
                           {blockedDeps} blocked dep{blockedDeps > 1 ? "s": ""}
                        </span>
                      )}
                      {pendAppr > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold"style={{ background: "#FEF3C7", color: "#92400E"}}>
                          ⏳ {pendAppr} pending approval{pendAppr > 1 ? "s": ""}
                        </span>
                      )}
                      {unreadN > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white"style={{ background: "#1B4FD8"}}>
                           {unreadN} unread
                        </span>
                      )}
                      {openEsc > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white"style={{ background: "#DC2626"}}>
                           {openEsc} escalation{openEsc > 1 ? "s": ""}
                        </span>
                      )}
                      <span className="ml-auto text-[11px] font-semibold"style={{ color: "var(--rtm-blue)"}}>
                        Open Drawer →
                      </span>
                    </div>
                  )}

                  {!(blockedDeps > 0 || pendAppr > 0 || unreadN > 0 || openEsc > 0) && (
                    <div className="flex justify-end mt-2">
                      <span className="text-[11px] font-semibold"style={{ color: "var(--rtm-blue)"}}>
                        Open Drawer →
                      </span>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Legend */}
            <div
              className="p-5 rounded-2xl"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>
                Collaboration Drawer Tabs
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { icon: "", tab: "Overview", desc: "Health, alerts, quick view"},
                  { icon: "", tab: "Comments", desc: "Threaded replies, @mentions"},
                  { icon: "", tab: "Internal Notes", desc: "Team-only, priority flags"},
                  { icon: "", tab: "Client Notes", desc: "AM communication log"},
                  { icon: "", tab: "Attachments", desc: "Reports, contracts, assets"},
                  { icon: "", tab: "Activity", desc: "Full event timeline"},
                  { icon: "", tab: "Approvals", desc: "Workflow approvals"},
                  { icon: "", tab: "Dependencies", desc: "Blockers & waits"},
                  { icon: "", tab: "Watchers", desc: "Who's subscribed"},
                  { icon: "", tab: "Escalations", desc: "Escalation history"},
                  { icon: "", tab: "AI Summary", desc: "AI-generated summary"},
                ].map((t) => (
                  <div key={t.tab} className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{t.icon}</span>
                    <div>
                      <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{t.tab}</p>
                      <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === "dashboard"&& <ProjectDashboardPanel tasks={COLLABORATION_DATA} />}
        {viewMode === "ai-summary"&& (
          <div className="space-y-6">
            {COLLABORATION_DATA.map((collab) => (
              <AISummaryPanel
                key={collab.taskId}
                summary={collab.aiSummary}
                taskName={collab.taskName}
                projectName={collab.projectName}
              />
            ))}
          </div>
        )}
        {viewMode === "dept-head"&& <DepartmentHeadView   tasks={COLLABORATION_DATA} />}
        {viewMode === "account-manager"&& <AccountManagerView    tasks={COLLABORATION_DATA} />}
        {viewMode === "executive"&& <ExecutiveView         tasks={COLLABORATION_DATA} />}
      </div>

      {/*  Task Detail Drawer  */}
      {drawerTask && (
        <TaskDetailDrawer
          collab={drawerTask.collab}
          taskStatus={drawerTask.status}
          taskPriority={drawerTask.priority}
          onClose={() => setDrawerTask(null)}
        />
      )}
    </div>
  );
}

function Metric({ icon, value, label }: { icon?: string; value: number; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>
      <span>{icon}</span>
      <span className="font-bold"style={{ color: "var(--rtm-text-primary)"}}>{value}</span>
      <span>{label}</span>
    </span>
  );
}
