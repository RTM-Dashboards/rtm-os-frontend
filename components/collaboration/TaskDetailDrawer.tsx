"use client";

import { useState, useEffect } from "react";
import type { TaskCollaboration, TaskComment, InternalNote, ClientNote, TaskWatcher } from "@/lib/collaboration/types";
import type { Task } from "@/lib/engine/types";
import OverviewTab from "./tabs/OverviewTab";
import CommentsTab from "./tabs/CommentsTab";
import InternalNotesTab from "./tabs/InternalNotesTab";
import ClientNotesTab from "./tabs/ClientNotesTab";
import AttachmentsTab from "./tabs/AttachmentsTab";
import WatchersTab from "./tabs/WatchersTab";
import ApprovalsTab from "./tabs/ApprovalsTab";
import ActivityTimelineTab from "./tabs/ActivityTimelineTab";
import DependenciesTab from "./tabs/DependenciesTab";
import EscalationsTab from "./tabs/EscalationsTab";
import AISummaryPanel from "./AISummaryPanel";

// ─────────────────────────────────────────────────────────────────────────────
// RTM OS — Task Detail Drawer
// Full collaboration hub: 11 tabs covering every collaboration surface
// ─────────────────────────────────────────────────────────────────────────────

type TabId =
  | "overview" | "comments" | "internal-notes" | "client-notes" | "attachments"
  | "activity" | "approvals" | "dependencies" | "watchers" | "escalations" | "ai-summary";

interface Tab {
  id: TabId;
  label: string;
  badge?: number;
}

interface Props {
  collab: TaskCollaboration;
  /** Live engine Task record linked via engineTaskId — used for real status/priority/dependencies */
  engineTask: Task | null;
  taskStatus?: string;
  taskPriority?: string;
  onClose: () => void;
  /**
   * Called whenever comments/notes/watchers change inside the drawer so
   * the parent page can update its task-card counters.
   */
  onCollabChange?: (updated: {
    comments:      TaskComment[];
    internalNotes: InternalNote[];
    clientNotes:   ClientNote[];
    watchers:      TaskWatcher[];
  }) => void;
}

export default function TaskDetailDrawer({
  collab,
  engineTask,
  taskStatus,
  taskPriority,
  onClose,
  onCollabChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // ── Live state for the four persisted tabs ───────────────────────────────
  // Seeded from the collab sidecar; kept in sync with API calls made inside tabs.
  // On every mount/collab change we also fetch fresh persisted data so a page
  // refresh reflects writes from a previous session.

  const [comments,      setComments]      = useState<TaskComment[]>(collab.comments);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>(collab.internalNotes);
  const [clientNotes,   setClientNotes]   = useState<ClientNote[]>(collab.clientNotes);
  const [watchers,      setWatchers]      = useState<TaskWatcher[]>(collab.watchers);

  // Fetch persisted data (merges on top of mock seed, so real writes always win)
  useEffect(() => {
    const taskId = collab.taskId;
    if (!taskId) return;
    fetch(`/api/collaboration?taskId=${encodeURIComponent(taskId)}`)
      .then((r) => r.ok ? r.json() as Promise<{
        comments:      TaskComment[];
        internalNotes: InternalNote[];
        clientNotes:   ClientNote[];
        watchers:      TaskWatcher[];
      }> : null)
      .then((data) => {
        if (!data) return;
        // Merge: persisted records take precedence over mock seed (by id),
        // then append any mock records not yet in the persisted store.
        if (data.comments.length > 0) {
          setComments((prev) => {
            const persisted = new Set(data.comments.map((c) => c.id));
            const merged = [...data.comments, ...prev.filter((c) => !persisted.has(c.id))];
            return merged;
          });
        }
        if (data.internalNotes.length > 0) {
          setInternalNotes((prev) => {
            const persisted = new Set(data.internalNotes.map((n) => n.id));
            return [...data.internalNotes, ...prev.filter((n) => !persisted.has(n.id))];
          });
        }
        if (data.clientNotes.length > 0) {
          setClientNotes((prev) => {
            const persisted = new Set(data.clientNotes.map((n) => n.id));
            return [...data.clientNotes, ...prev.filter((n) => !persisted.has(n.id))];
          });
        }
        if (data.watchers.length > 0) {
          setWatchers((prev) => {
            const persisted = new Set(data.watchers.map((w) => w.id));
            return [...data.watchers, ...prev.filter((w) => !persisted.has(w.id))];
          });
        }
      })
      .catch(() => { /* keep seed on failure */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collab.taskId]);

  // Notify parent of count changes
  useEffect(() => {
    onCollabChange?.({ comments, internalNotes, clientNotes, watchers });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments, internalNotes, clientNotes, watchers]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const pendingApprovals = collab.approvals.filter(
    (a) => a.status === "Pending Approval" || a.status === "Pending Review",
  ).length;
  const blocked = collab.dependencies.filter(
    (d) => d.status === "Blocked" || d.status === "Escalated",
  ).length;
  const unread = collab.notifications.filter((n) => !n.read).length;
  const openEscalations = collab.escalations.filter(
    (e) => e.status === "Open" || e.status === "In Progress",
  ).length;

  // Real engine dependencies count (may differ from collab sidecar)
  const realDepCount = engineTask?.dependencies?.length ?? 0;
  const depBadge = realDepCount > 0 ? realDepCount : blocked > 0 ? blocked : undefined;

  const TABS: Tab[] = [
    { id: "overview",       label: "Overview",       badge: unread > 0 ? unread : undefined },
    { id: "comments",       label: "Comments",       badge: comments.length || undefined },
    { id: "internal-notes", label: "Internal Notes", badge: internalNotes.length || undefined },
    { id: "client-notes",   label: "Client Notes",   badge: clientNotes.length || undefined },
    { id: "attachments",    label: "Attachments",    badge: collab.attachments.length || undefined },
    { id: "activity",       label: "Activity",       badge: collab.activity.length || undefined },
    { id: "approvals",      label: "Approvals",      badge: pendingApprovals > 0 ? pendingApprovals : undefined },
    { id: "dependencies",   label: "Dependencies",   badge: depBadge },
    { id: "watchers",       label: "Watchers",       badge: watchers.filter((w) => w.watching).length || undefined },
    { id: "escalations",    label: "Escalations",    badge: openEscalations > 0 ? openEscalations : collab.escalations.length || undefined },
    { id: "ai-summary",     label: "AI Summary" },
  ];

  const statusColors: Record<string, { bg: string; color: string }> = {
    "In Progress": { bg: "#DBEAFE", color: "#1E40AF" },
    Open:          { bg: "#F3F4F6", color: "#374151" },
    Waiting:       { bg: "#FEF3C7", color: "#92400E" },
    Blocked:       { bg: "#FEE2E2", color: "#991B1B" },
    Review:        { bg: "#F3E8FF", color: "#6B21A8" },
    Completed:     { bg: "#D1FAE5", color: "#065F46" },
    Cancelled:     { bg: "#F3F4F6", color: "#6B7280" },
  };

  const priorityColors: Record<string, string> = {
    Low:    "#6B7280",
    Medium: "#D97706",
    High:   "#DC2626",
    Urgent: "#7C2D12",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(14,32,85,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Drawer panel */}
      <div
        className="w-full max-w-3xl h-full flex flex-col shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-bg)" }}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 px-6 py-4"
          style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                {collab.projectName}
              </p>
              <h2 className="text-lg font-bold leading-snug" style={{ color: "var(--rtm-text-primary)" }}>
                {collab.taskName}
              </h2>
              {engineTask && (
                <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  {engineTask.clientName} · {engineTask.department} · Due {engineTask.dueDate}
                  {engineTask.assignedUserName ? ` · Assigned: ${engineTask.assignedUserName}` : ""}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {taskStatus && (() => {
                  const sc = statusColors[taskStatus] ?? { bg: "#F3F4F6", color: "#374151" };
                  return (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {taskStatus}
                    </span>
                  );
                })()}
                {taskPriority && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ background: priorityColors[taskPriority] ?? "#6B7280" }}
                  >
                    {taskPriority}
                  </span>
                )}
                {collab.notifications.filter((n) => !n.read).length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: "#DC2626" }}>
                    {collab.notifications.filter((n) => !n.read).length} Unread
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg flex-shrink-0 transition-colors"
              style={{ color: "var(--rtm-text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-xlight)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label="Close drawer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div
          className="flex-shrink-0 overflow-x-auto"
          style={{ background: "var(--rtm-surface)", borderBottom: "2px solid var(--rtm-border)" }}
        >
          <div className="flex items-center min-w-max px-4">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap"
                  style={{
                    color: isActive ? "var(--rtm-blue)" : "var(--rtm-text-secondary)",
                    borderBottom: isActive ? "2px solid var(--rtm-blue)" : "2px solid transparent",
                    marginBottom: "-2px",
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className="ml-1 px-1.5 py-0 rounded-full text-[10px] font-bold"
                      style={{
                        background: isActive ? "var(--rtm-blue)" : "var(--rtm-border)",
                        color: isActive ? "#fff" : "var(--rtm-text-secondary)",
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "overview"       && <OverviewTab collab={collab} />}
          {activeTab === "comments"       && (
            <CommentsTab
              taskId={collab.taskId}
              comments={comments}
              onCommentsChange={setComments}
            />
          )}
          {activeTab === "internal-notes" && (
            <InternalNotesTab
              taskId={collab.taskId}
              notes={internalNotes}
              onNotesChange={setInternalNotes}
            />
          )}
          {activeTab === "client-notes"   && (
            <ClientNotesTab
              taskId={collab.taskId}
              notes={clientNotes}
              onNotesChange={setClientNotes}
            />
          )}
          {activeTab === "attachments"    && <AttachmentsTab attachments={collab.attachments} />}
          {activeTab === "activity"       && <ActivityTimelineTab activity={collab.activity} />}
          {activeTab === "approvals"      && <ApprovalsTab approvals={collab.approvals} />}
          {activeTab === "dependencies"   && (
            <DependenciesTab
              dependencies={collab.dependencies}
              engineDependencies={engineTask?.dependencies ?? []}
            />
          )}
          {activeTab === "watchers"     && (
            <WatchersTab
              taskId={collab.taskId}
              watchers={watchers}
              onWatchersChange={setWatchers}
            />
          )}
          {activeTab === "escalations"  && <EscalationsTab escalations={collab.escalations} />}
          {activeTab === "ai-summary"   && (
            <AISummaryPanel
              summary={collab.aiSummary}
              taskName={collab.taskName}
              projectName={collab.projectName}
            />
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="flex-shrink-0 px-6 py-3 flex items-center justify-between"
          style={{ background: "var(--rtm-surface)", borderTop: "1px solid var(--rtm-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {collab.activity.length} events · {comments.length} comments · {collab.attachments.length} files · {collab.escalations.length} escalation{collab.escalations.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            {/* Footer buttons — not yet functional */}
            <button
              disabled
              title="Not yet available"
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors opacity-40 cursor-not-allowed"
              style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
            >
              Copy Link
            </button>
            <button
              disabled
              title="Not yet available"
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white opacity-40 cursor-not-allowed"
              style={{ background: "var(--rtm-blue)" }}
            >
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
