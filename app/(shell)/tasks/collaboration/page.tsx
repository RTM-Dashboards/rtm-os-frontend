"use client";

import { useState, useEffect, useCallback } from "react";
import TaskDetailDrawer from "@/components/collaboration/TaskDetailDrawer";
import DepartmentHeadView from "@/components/collaboration/views/DepartmentHeadView";
import AccountManagerView from "@/components/collaboration/views/AccountManagerView";
import ExecutiveView from "@/components/collaboration/views/ExecutiveView";
import ProjectDashboardPanel from "@/components/collaboration/ProjectDashboardPanel";
import AISummaryPanel from "@/components/collaboration/AISummaryPanel";
import { COLLABORATION_DATA } from "@/lib/collaboration/mock-data";
import type { TaskCollaboration, TaskComment, InternalNote, ClientNote, TaskWatcher } from "@/lib/collaboration/types";

//
// RTM OS — Task Collaboration Hub
// Route: /tasks/collaboration
//

type ViewMode = "overview" | "dashboard" | "ai-summary" | "dept-head" | "account-manager" | "executive";

interface TaskSummaryItem {
  collab: TaskCollaboration;
  engineTask: null;
  // status and priority are not defaulted — no Postgres row for these tasks.
  // The drawer receives undefined for both; it renders nothing for absent values.
}

// Collaboration tasks have no Postgres task row: status and priority are unknown.
// No defaults are invented. The drawer omits status/priority badges when absent.
function buildSummaries(): TaskSummaryItem[] {
  return COLLABORATION_DATA.map((collab) => ({
    collab,
    engineTask: null,
  }));
}

const VIEW_LABELS: Record<ViewMode, { label: string; icon?: string }> = {
  "overview":         { label: "Task List",        icon: "" },
  "dashboard":        { label: "Dashboard",        icon: "" },
  "ai-summary":       { label: "AI Summary",       icon: "" },
  "dept-head":        { label: "Department Head",  icon: "" },
  "account-manager":  { label: "Account Manager",  icon: "" },
  "executive":        { label: "Executive",        icon: "" },
};

export default function CollaborationPage() {
  const [viewMode, setViewMode]     = useState<ViewMode>("overview");
  const [drawerTask, setDrawerTask] = useState<TaskSummaryItem | null>(null);

  // Live collab counts — keyed by taskId — updated whenever the drawer reports changes.
  // Allows task-card Metric rows to reflect real persisted counts without a full page refresh.
  type LiveCollabCounts = {
    comments:      number;
    internalNotes: number;
    clientNotes:   number;
    watchers:      number; // watching only
  };
  const [liveCollabMap, setLiveCollabMap] = useState<Record<string, LiveCollabCounts>>({});

  const handleCollabChange = useCallback(
    (
      taskId: string,
      updated: { comments: TaskComment[]; internalNotes: InternalNote[]; clientNotes: ClientNote[]; watchers: TaskWatcher[] }
    ) => {
      setLiveCollabMap((prev) => ({
        ...prev,
        [taskId]: {
          comments:      updated.comments.length,
          internalNotes: updated.internalNotes.length,
          clientNotes:   updated.clientNotes.length,
          watchers:      updated.watchers.filter((w) => w.watching).length,
        },
      }));
    },
    []
  );

  const taskSummaries = buildSummaries();
  const loadingTasks = false;
  // Blocked count from collab dependencies (no engine backing)
  const blockedEngineCount = 0;

  // Unread notifications — from collab sidecar (local model only, not persisted)
  const allNotifCount = COLLABORATION_DATA.reduce(
    (s, t) => s + t.notifications.filter((n) => !n.read).length,
    0,
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--rtm-bg)" }}>
      {/* Page Header */}
      <div
        className="px-8 py-6 sticky top-0 z-20"
        style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
                Task Collaboration Hub
              </h1>
            </div>
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
              Comments · Notes · Approvals · Attachments · Activity · Escalations · AI Summary
            </p>
          </div>

          {/* Alert pills — only show concepts with real backing data */}
          <div className="flex items-center gap-2 flex-wrap">
            {blockedEngineCount > 0 && (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                style={{ background: "#DC2626" }}
              >
                🚫 {blockedEngineCount} Blocked
              </span>
            )}
            {/* Pending Approvals, Escalations, Unread: no persisted backing model yet.
                Showing illustrative collab-sidecar unread count only. */}
            {allNotifCount > 0 && (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                title="Illustrative count from collab sidecar — not persisted"
                style={{ background: "#1B4FD8" }}
              >
                🔔 {allNotifCount} Unread
              </span>
            )}
            {loadingTasks && (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}
              >
                Syncing…
              </span>
            )}
          </div>
        </div>

        {/* View Switcher */}
        <div
          className="flex items-center gap-1 mt-4 p-1 rounded-xl w-fit"
          style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
        >
          {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => {
            const { label, icon } = VIEW_LABELS[mode];
            const isActive = viewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: isActive ? "var(--rtm-surface)" : "transparent",
                  color: isActive ? "var(--rtm-blue)" : "var(--rtm-text-secondary)",
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 max-w-5xl mx-auto">
        {viewMode === "overview" && (
          <div className="space-y-4">
            {/* AI Summary — rendered first */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>
                AI Collaboration Summary
              </p>
              {COLLABORATION_DATA.map((collab) => (
                <AISummaryPanel
                  key={collab.taskId}
                  summary={collab.aiSummary}
                  taskName={collab.taskName}
                  projectName={collab.projectName}
                />
              ))}
            </div>

            {/* Task list */}
            <p className="text-xs font-bold uppercase tracking-wider pt-2" style={{ color: "var(--rtm-text-muted)" }}>
              All Tracked Tasks ({taskSummaries.length}) — Click a task to open the Collaboration Drawer
            </p>

            {taskSummaries.map((item) => {
              const { collab } = item;
              const blockedDeps = collab.dependencies.filter((d) => d.status === "Blocked").length;
              const unreadN = collab.notifications.filter((n) => !n.read).length;
              // Use live counts if the drawer has reported changes for this task
              const live = liveCollabMap[collab.taskId];

              return (
                <button
                  key={collab.taskId}
                  className="w-full text-left rounded-2xl p-5 transition-all"
                  style={{
                    background: "var(--rtm-surface)",
                    border: `1px solid ${blockedDeps > 0 ? "#FECACA" : "var(--rtm-border)"}`,
                    cursor: "pointer",
                  }}
                  onClick={() => setDrawerTask(item)}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(27,79,216,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  {/* Row 1 — Title */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                        {collab.projectName}
                      </p>
                      <h3 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                        {collab.taskName}
                      </h3>

                    </div>
                    {/* Status and priority badges removed: no Postgres row for these tasks,
                        so no real status or priority to display. */}
                  </div>

                  {/* Row 2 — Metrics (live counts win when available) */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Metric value={live?.comments      ?? collab.comments.length}                       label="comments" />
                    <Metric value={live?.internalNotes ?? collab.internalNotes.length}                  label="int. notes" />
                    <Metric value={live?.clientNotes   ?? collab.clientNotes.length}                    label="client notes" />
                    <Metric value={collab.attachments.length}                                           label="files" />
                    <Metric value={live?.watchers      ?? collab.watchers.filter((w) => w.watching).length} label="watchers" />
                    <Metric value={collab.approvals.length}                                             label="approvals" />
                    <Metric value={collab.dependencies.length}                                         label="deps" />
                    <Metric value={collab.activity.length}                                             label="events" />
                    <Metric value={collab.escalations.length}                                          label="escalations" />
                  </div>

                  {/* Row 3 — Alert badges */}
                  {(blockedDeps > 0 || unreadN > 0) && (
                    <div
                      className="flex flex-wrap items-center gap-2 mt-3 pt-3"
                      style={{ borderTop: "1px solid var(--rtm-border-light)" }}
                    >
                      {blockedDeps > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: "#DC2626" }}>
                          🚫 {blockedDeps} blocked dep{blockedDeps > 1 ? "s" : ""}
                        </span>
                      )}
                      {unreadN > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: "#1B4FD8" }}>
                          🔔 {unreadN} unread
                        </span>
                      )}
                      <span className="ml-auto text-[11px] font-semibold" style={{ color: "var(--rtm-blue)" }}>
                        Open Drawer →
                      </span>
                    </div>
                  )}

                  {!(blockedDeps > 0 || unreadN > 0) && (
                    <div className="flex justify-end mt-2">
                      <span className="text-[11px] font-semibold" style={{ color: "var(--rtm-blue)" }}>
                        Open Drawer →
                      </span>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Drawer tabs legend */}
            <div
              className="p-5 rounded-2xl"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
                Collaboration Drawer Tabs
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { icon: "📋", tab: "Overview",       desc: "Health, alerts, quick view" },
                  { icon: "💬", tab: "Comments",       desc: "Threaded replies, @mentions" },
                  { icon: "🔒", tab: "Internal Notes", desc: "Team-only, priority flags" },
                  { icon: "📞", tab: "Client Notes",   desc: "AM communication log" },
                  { icon: "📎", tab: "Attachments",    desc: "Reports, contracts, assets" },
                  { icon: "📅", tab: "Activity",       desc: "Full event timeline" },
                  { icon: "✅", tab: "Approvals",      desc: "Workflow approvals" },
                  { icon: "🔗", tab: "Dependencies",   desc: "Blockers & waits" },
                  { icon: "👁️", tab: "Watchers",       desc: "Who's subscribed" },
                  { icon: "🚨", tab: "Escalations",    desc: "Escalation history" },
                  { icon: "🤖", tab: "AI Summary",     desc: "AI-generated summary" },
                ].map((t) => (
                  <div key={t.tab} className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{t.icon}</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{t.tab}</p>
                      <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === "dashboard" && <ProjectDashboardPanel tasks={COLLABORATION_DATA} />}
        {viewMode === "ai-summary" && (
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
        {viewMode === "dept-head"       && <DepartmentHeadView  tasks={COLLABORATION_DATA} />}
        {viewMode === "account-manager" && <AccountManagerView  tasks={COLLABORATION_DATA} />}
        {viewMode === "executive"       && <ExecutiveView       tasks={COLLABORATION_DATA} />}
      </div>

      {/* Task Detail Drawer */}
      {drawerTask && (
        <TaskDetailDrawer
          collab={drawerTask.collab}
          engineTask={drawerTask.engineTask}
          // taskStatus and taskPriority omitted — no real Postgres row for these tasks
          onClose={() => setDrawerTask(null)}
          onCollabChange={(updated) => handleCollabChange(drawerTask.collab.taskId, updated)}
        />
      )}
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
      <span className="font-bold" style={{ color: "var(--rtm-text-primary)" }}>{value}</span>
      <span>{label}</span>
    </span>
  );
}
