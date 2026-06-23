"use client";

import { useState, useEffect } from "react";
import type { TaskCollaboration } from "@/lib/collaboration/types";
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
// Full collaboration hub: 9 tabs covering every collaboration surface
// ─────────────────────────────────────────────────────────────────────────────

type TabId =
  | "overview"| "comments"| "internal-notes"| "client-notes"| "attachments"| "activity"| "approvals"| "dependencies"| "watchers"| "escalations"| "ai-summary";

interface Tab {
  id: TabId;
  label: string;
  badge?: number;
}

interface Props {
  collab: TaskCollaboration;
  taskStatus?: string;
  taskPriority?: string;
  onClose: () => void;
}

export default function TaskDetailDrawer({ collab, taskStatus, taskPriority, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const pendingApprovals = collab.approvals.filter(
    (a) => a.status === "Pending Approval"|| a.status === "Pending Review",
  ).length;
  const blocked = collab.dependencies.filter(
    (d) => d.status === "Blocked"|| d.status === "Escalated",
  ).length;
  const unread = collab.notifications.filter((n) => !n.read).length;
  const openEscalations = collab.escalations.filter(
    (e) => e.status === "Open"|| e.status === "In Progress",
  ).length;

  const TABS: Tab[] = [
    { id: "overview",       label: "Overview",       badge: unread > 0 ? unread : undefined },
    { id: "comments",       label: "Comments",       badge: collab.comments.length || undefined },
    { id: "internal-notes", label: "Internal Notes", badge: collab.internalNotes.length || undefined },
    { id: "client-notes",   label: "Client Notes",   badge: collab.clientNotes.length || undefined },
    { id: "attachments",    label: "Attachments",    badge: collab.attachments.length || undefined },
    { id: "activity",       label: "Activity",       badge: collab.activity.length || undefined },
    { id: "approvals",      label: "Approvals",      badge: pendingApprovals > 0 ? pendingApprovals : undefined },
    { id: "dependencies",   label: "Dependencies",   badge: blocked > 0 ? blocked : undefined },
    { id: "watchers",       label: "Watchers",       badge: collab.watchers.filter((w) => w.watching).length || undefined },
    { id: "escalations",    label: "Escalations",    badge: openEscalations > 0 ? openEscalations : collab.escalations.length || undefined },
    { id: "ai-summary",     label: "AI Summary"},
  ];

  const statusColors: Record<string, { bg: string; color: string }> = {
    "In Progress": { bg: "#DBEAFE", color: "#1E40AF"},
    Open:          { bg: "#F3F4F6", color: "#374151"},
    Waiting:       { bg: "#FEF3C7", color: "#92400E"},
    Blocked:       { bg: "#FEE2E2", color: "#991B1B"},
    Review:        { bg: "#F3E8FF", color: "#6B21A8"},
    Completed:     { bg: "#D1FAE5", color: "#065F46"},
    Cancelled:     { bg: "#F3F4F6", color: "#6B7280"},
  };

  const priorityColors: Record<string, string> = {
    Low: "#6B7280",
    Medium: "#D97706",
    High: "#DC2626",
    Urgent: "#7C2D12",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"style={{ background: "rgba(14,32,85,0.45)", backdropFilter: "blur(4px)"}}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Drawer panel */}
      <div
        className="w-full max-w-3xl h-full flex flex-col shadow-2xl overflow-hidden"style={{ background: "var(--rtm-bg)"}}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 px-6 py-4"style={{
            background: "var(--rtm-surface)",
            borderBottom: "1px solid var(--rtm-border)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1"style={{ color: "var(--rtm-text-muted)"}}>
                {collab.projectName}
              </p>
              <h2 className="text-lg font-bold leading-snug"style={{ color: "var(--rtm-text-primary)"}}>
                {collab.taskName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {taskStatus && (() => {
                  const sc = statusColors[taskStatus] ?? { bg: "#F3F4F6", color: "#374151"};
                  return (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"style={{ background: sc.bg, color: sc.color }}
                    >
                      {taskStatus}
                    </span>
                  );
                })()}
                {taskPriority && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"style={{ background: priorityColors[taskPriority] ?? "#6B7280"}}
                  >
                    {taskPriority}
                  </span>
                )}
                {collab.notifications.filter((n) => !n.read).length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"style={{ background: "#DC2626"}}>
                    {collab.notifications.filter((n) => !n.read).length} Unread
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg flex-shrink-0 transition-colors"style={{ color: "var(--rtm-text-secondary)"}}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-xlight)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label="Close drawer">
              <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div
          className="flex-shrink-0 overflow-x-auto"style={{
            background: "var(--rtm-surface)",
            borderBottom: "2px solid var(--rtm-border)",
          }}
        >
          <div className="flex items-center min-w-max px-4">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap"style={{
                    color: isActive ? "var(--rtm-blue)": "var(--rtm-text-secondary)",
                    borderBottom: isActive ? "2px solid var(--rtm-blue)": "2px solid transparent",
                    marginBottom: "-2px",
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className="ml-1 px-1.5 py-0 rounded-full text-[10px] font-bold"style={{
                        background: isActive ? "var(--rtm-blue)": "var(--rtm-border)",
                        color: isActive ? "#fff": "var(--rtm-text-secondary)",
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
          {activeTab === "overview"&& <OverviewTab collab={collab} />}
          {activeTab === "comments"&& <CommentsTab comments={collab.comments} />}
          {activeTab === "internal-notes"&& <InternalNotesTab notes={collab.internalNotes} />}
          {activeTab === "client-notes"&& <ClientNotesTab notes={collab.clientNotes} />}
          {activeTab === "attachments"&& <AttachmentsTab attachments={collab.attachments} />}
          {activeTab === "activity"&& <ActivityTimelineTab activity={collab.activity} />}
          {activeTab === "approvals"&& <ApprovalsTab approvals={collab.approvals} />}
          {activeTab === "dependencies"&& <DependenciesTab dependencies={collab.dependencies} />}
          {activeTab === "watchers"&& <WatchersTab watchers={collab.watchers} />}
          {activeTab === "escalations"&& <EscalationsTab escalations={collab.escalations} />}
          {activeTab === "ai-summary"&& <AISummaryPanel summary={collab.aiSummary} taskName={collab.taskName} projectName={collab.projectName} />}
        </div>

        {/* ── Footer ── */}
        <div
          className="flex-shrink-0 px-6 py-3 flex items-center justify-between"style={{ background: "var(--rtm-surface)", borderTop: "1px solid var(--rtm-border)"}}
        >
          <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            {collab.activity.length} events · {collab.comments.length} comments · {collab.attachments.length} files · {collab.escalations.length} escalation{collab.escalations.length !== 1 ? "s": ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
            >
              Copy Link
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"style={{ background: "var(--rtm-blue)"}}
            >
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
