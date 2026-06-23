"use client";

import type { TaskCollaboration } from "@/lib/collaboration/types";
import { Avatar, ApprovalBadge, DepStatusBadge, relativeTime } from "./CollabUtils";

// ─────────────────────────────────────────────────────────────────────────────
// RTM OS — Project Dashboard Enhancement Panel
// Recent Activity Feed · Recent Comments · Open Approvals · Blocked Tasks
// Escalation Queue · Department Updates · AI Health Overview
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  tasks: TaskCollaboration[];
}

export default function ProjectDashboardPanel({ tasks }: Props) {
  const allActivity = tasks
    .flatMap((t) => t.activity.map((ev) => ({ ...ev, taskName: t.taskName, projectName: t.projectName })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const allComments = tasks
    .flatMap((t) => t.comments.map((c) => ({ ...c, taskName: t.taskName, projectName: t.projectName })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const openApprovals = tasks.flatMap((t) =>
    t.approvals
      .filter((a) => a.status === "Pending Approval"|| a.status === "Pending Review"|| a.status === "Needs Revision")
      .map((a) => ({ ...a, taskName: t.taskName, projectName: t.projectName })),
  );

  const blockedTasks = tasks.filter((t) =>
    t.dependencies.some((d) => d.status === "Blocked"|| d.status === "Escalated"),
  );

  const openEscalations = tasks.flatMap((t) =>
    t.escalations
      .filter((e) => e.status === "Open"|| e.status === "In Progress")
      .map((e) => ({ ...e, taskName: t.taskName, projectName: t.projectName })),
  );

  const deptUpdates = tasks.flatMap((t) =>
    t.internalNotes
      .filter((n) => n.priority === "Urgent"|| n.priority === "High")
      .map((n) => ({ ...n, taskName: t.taskName, projectName: t.projectName })),
  );

  return (
    <div className="space-y-5">
      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { icon: "", label: "Activity Events", value: tasks.reduce((s, t) => s + t.activity.length, 0), color: "#1D4ED8", bg: "#EFF6FF"},
          { icon: "C", label: "Comments", value: tasks.reduce((s, t) => s + t.comments.length, 0), color: "#7C3AED", bg: "#F5F3FF"},
          { icon: "⏳", label: "Open Approvals", value: openApprovals.length, color: "#D97706", bg: "#FFFBEB"},
          { icon: "BLK", label: "Blocked Tasks", value: blockedTasks.length, color: "#DC2626", bg: "#FEF2F2"},
          { icon: "!", label: "Escalations", value: openEscalations.length, color: "#DC2626", bg: "#FEF2F2"},
          { icon: "N", label: "High-Priority Notes", value: deptUpdates.length, color: "#92400E", bg: "#FFFBEB"},
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4 text-center"style={{ background: kpi.bg, border: `1px solid ${kpi.bg === "#FEF2F2"? "#FECACA": "var(--rtm-border)"}` }}
          >
            <p className="text-2xl font-bold"style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-[10px] mt-0.5 leading-snug"style={{ color: "var(--rtm-text-muted)"}}>{kpi.icon} {kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* ── Recent Activity Feed ── */}
        <DashSection title="Recent Activity Feed"count={allActivity.length}>
          <div className="space-y-0">
            {allActivity.map((ev, idx) => (
              <div
                key={ev.id}
                className="flex items-start gap-3 py-2.5"style={{ borderBottom: idx < allActivity.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}
              >
                <Avatar initials={ev.userInitials} color={ev.userColor} size="xs"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{ev.userName}</span>
                    <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{ev.eventType.toLowerCase()}</span>
                  </div>
                  <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
                    {ev.taskName} · {relativeTime(ev.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DashSection>

        {/* ── Recent Comments ── */}
        <DashSection title="Recent Comments"count={allComments.length}>
          <div className="space-y-3">
            {allComments.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <Avatar initials={c.authorInitials} color={c.authorColor} size="xs"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.authorName}</span>
                    {c.pinned && <span className="text-[9px] px-1.5 py-0 rounded font-bold"style={{ background: "#FEF3C7", color: "#92400E"}}></span>}
                    {c.resolved && <span className="text-[9px] px-1.5 py-0 rounded font-bold"style={{ background: "#D1FAE5", color: "#065F46"}}></span>}
                  </div>
                  <p className="text-xs line-clamp-2"style={{ color: "var(--rtm-text-secondary)"}}>{c.body}</p>
                  <p className="text-[10px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                    {c.taskName} · {relativeTime(c.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {!allComments.length && <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>No comments yet.</p>}
          </div>
        </DashSection>

        {/* ── Open Approvals ── */}
        <DashSection title="⏳ Open Approvals"count={openApprovals.length} alertColor={openApprovals.length > 0 ? "#D97706": undefined}>
          {!openApprovals.length ? (
            <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>No pending approvals. </p>
          ) : (
            <div className="space-y-2">
              {openApprovals.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg"style={{ background: "#FFFBEB", border: "1px solid #FDE68A"}}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate"style={{ color: "var(--rtm-text-primary)"}}>{a.stepName}</p>
                    <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{a.taskName}</p>
                    <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>Approver: {a.approver}</p>
                  </div>
                  <ApprovalBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </DashSection>

        {/* ── Blocked Tasks ── */}
        <DashSection title="Blocked Tasks"count={blockedTasks.length} alertColor={blockedTasks.length > 0 ? "#DC2626": undefined}>
          {!blockedTasks.length ? (
            <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>No blocked tasks. </p>
          ) : (
            <div className="space-y-2">
              {blockedTasks.map((t) => {
                const blockedDeps = t.dependencies.filter((d) => d.status === "Blocked"|| d.status === "Escalated");
                return (
                  <div
                    key={t.taskId}
                    className="p-2.5 rounded-lg"style={{ background: "#FEF2F2", border: "1px solid #FECACA"}}
                  >
                    <p className="text-xs font-semibold mb-1"style={{ color: "#991B1B"}}>{t.taskName}</p>
                    <p className="text-[10px] mb-1.5"style={{ color: "#DC2626"}}>{t.projectName}</p>
                    <div className="flex flex-wrap gap-1">
                      {blockedDeps.map((d) => (
                        <div key={d.id} className="flex items-center gap-1">
                          <DepStatusBadge status={d.status} />
                          <span className="text-[10px]"style={{ color: "#991B1B"}}>{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashSection>

        {/* ── Escalation Queue ── */}
        <DashSection title="Escalation Queue"count={openEscalations.length} alertColor={openEscalations.length > 0 ? "#DC2626": undefined}>
          {!openEscalations.length ? (
            <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>No active escalations. </p>
          ) : (
            <div className="space-y-2">
              {openEscalations.map((e) => (
                <div
                  key={e.id}
                  className="p-2.5 rounded-lg"style={{ background: "#FEF2F2", border: "1px solid #FECACA"}}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold"style={{ color: "#991B1B"}}>{e.level}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"style={{ background: e.status === "Open"? "#FEE2E2": "#DBEAFE", color: e.status === "Open"? "#991B1B": "#1E40AF"}}
                    >
                      {e.status}
                    </span>
                  </div>
                  <p className="text-[10px] mb-0.5"style={{ color: "#DC2626"}}>Trigger: {e.trigger}</p>
                  <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
                    {e.taskName} · {e.assignedUser}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DashSection>

        {/* ── Department Updates ── */}
        <DashSection title="Department Updates"count={deptUpdates.length} alertColor={deptUpdates.some(n => n.priority === "Urgent") ? "#D97706": undefined}>
          {!deptUpdates.length ? (
            <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>No high-priority internal notes.</p>
          ) : (
            <div className="space-y-2">
              {deptUpdates.map((n) => (
                <div
                  key={n.id}
                  className="p-2.5 rounded-lg"style={{ background: "#FFFBEB", border: "1px solid #FDE68A"}}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Avatar initials={n.authorInitials} color={n.authorColor} size="xs"/>
                      <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{n.authorName}</span>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white"style={{ background: n.priority === "Urgent"? "#DC2626": "#D97706"}}
                    >
                      {n.priority}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-2 mb-0.5"style={{ color: "var(--rtm-text-secondary)"}}>{n.body}</p>
                  <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
                    {n.department} · {n.taskName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DashSection>
      </div>
    </div>
  );
}

function DashSection({
  title,
  count,
  alertColor,
  children,
}: {
  title: string;
  count: number;
  alertColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4"style={{
        background: "var(--rtm-surface)",
        border: `1px solid ${alertColor ? (alertColor === "#DC2626"? "#FECACA": "#FDE68A") : "var(--rtm-border)"}`,
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs font-bold uppercase tracking-wider"style={{ color: alertColor ?? "var(--rtm-text-muted)"}}>
          {title}
        </p>
        {count > 0 && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold"style={{ background: alertColor ? "#FEE2E2": "var(--rtm-bg)", color: alertColor ?? "var(--rtm-text-muted)"}}
          >
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
