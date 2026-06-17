"use client";

import type { TaskCollaboration } from "@/lib/collaboration/types";
import { Avatar, ApprovalBadge, DepStatusBadge, relativeTime, PriorityDot } from "../CollabUtils";

interface Props {
  tasks: TaskCollaboration[];
}

// Department Head View — see task health, blockers, approvals, latest activity
// without opening every individual task

export default function DepartmentHeadView({ tasks }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>Department Head View</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
          Task health, blockers, approval bottlenecks, and collaboration history — across all projects.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "🔴", label: "Blocked Tasks", value: tasks.filter((t) => t.dependencies.some((d) => d.status === "Blocked")).length, danger: true },
          { icon: "⏳", label: "Pending Approvals", value: tasks.reduce((s, t) => s + t.approvals.filter((a) => a.status === "Pending Approval" || a.status === "Pending Review").length, 0), warn: true },
          { icon: "💬", label: "Open Comments", value: tasks.reduce((s, t) => s + t.comments.filter((c) => !c.resolved).length, 0), warn: false },
          { icon: "📎", label: "Total Attachments", value: tasks.reduce((s, t) => s + t.attachments.filter((a) => a.status === "Active").length, 0), warn: false },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4 text-center"
            style={{
              background: "var(--rtm-surface)",
              border: `1px solid ${kpi.danger ? "#FECACA" : kpi.warn ? "#FDE68A" : "var(--rtm-border)"}`,
            }}
          >
            <p className="text-2xl font-bold" style={{ color: kpi.danger ? "#DC2626" : kpi.warn ? "#D97706" : "var(--rtm-text-primary)" }}>
              {kpi.value}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {kpi.icon} {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Per-task cards */}
      {tasks.map((task) => {
        const pendingAppr = task.approvals.filter((a) => a.status === "Pending Approval" || a.status === "Pending Review");
        const blockedDeps = task.dependencies.filter((d) => d.status === "Blocked" || d.status === "Escalated");
        const latestActivity = [...task.activity].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const latestComment = [...task.comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        const internalCount = task.internalNotes.length;

        const isHealthy = blockedDeps.length === 0 && pendingAppr.length === 0;

        return (
          <div
            key={task.taskId}
            className="rounded-xl p-5"
            style={{
              background: "var(--rtm-surface)",
              border: `1px solid ${blockedDeps.length > 0 ? "#FECACA" : pendingAppr.length > 0 ? "#FDE68A" : "var(--rtm-border)"}`,
            }}
          >
            {/* Task header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  {task.projectName}
                </p>
                <h3 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{task.taskName}</h3>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{
                  background: isHealthy ? "#D1FAE5" : blockedDeps.length > 0 ? "#FEE2E2" : "#FEF3C7",
                  color: isHealthy ? "#065F46" : blockedDeps.length > 0 ? "#991B1B" : "#92400E",
                }}
              >
                {isHealthy ? "✓ Healthy" : blockedDeps.length > 0 ? "🚫 Blocked" : "⏳ Attention"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Blockers */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>Dependencies</p>
                {task.dependencies.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>None</p>
                ) : (
                  <div className="space-y-1.5">
                    {task.dependencies.map((d) => (
                      <div key={d.id} className="flex items-center justify-between gap-2">
                        <span className="text-xs truncate" style={{ color: "var(--rtm-text-secondary)" }}>{d.name}</span>
                        <DepStatusBadge status={d.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Approvals */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>Approvals</p>
                {task.approvals.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>None</p>
                ) : (
                  <div className="space-y-1.5">
                    {task.approvals.map((a) => (
                      <div key={a.id} className="flex items-center justify-between gap-2">
                        <span className="text-xs truncate" style={{ color: "var(--rtm-text-secondary)" }}>{a.stepName}</span>
                        <ApprovalBadge status={a.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Latest Comment */}
              {latestComment && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>Latest Comment</p>
                  <div className="flex items-start gap-2">
                    <Avatar initials={latestComment.authorInitials} color={latestComment.authorColor} size="xs" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{latestComment.authorName}</span>
                        <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{relativeTime(latestComment.createdAt)}</span>
                      </div>
                      <p className="text-xs line-clamp-2" style={{ color: "var(--rtm-text-secondary)" }}>{latestComment.body}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Activity */}
              {latestActivity && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>Latest Activity</p>
                  <div className="flex items-center gap-2">
                    <Avatar initials={latestActivity.userInitials} color={latestActivity.userColor} size="xs" />
                    <div>
                      <span className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>{latestActivity.userName} </span>
                      <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{latestActivity.eventType}</span>
                      <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{relativeTime(latestActivity.timestamp)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Internal notes count */}
            {internalCount > 0 && (
              <div
                className="mt-4 pt-4 flex items-center gap-2 text-xs"
                style={{ borderTop: "1px solid var(--rtm-border-light)", color: "#92400E" }}
              >
                <span>🔒</span>
                <span>{internalCount} internal {internalCount === 1 ? "note" : "notes"} on this task</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
