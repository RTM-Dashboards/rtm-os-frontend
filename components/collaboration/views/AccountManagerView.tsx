"use client";

import type { TaskCollaboration } from "@/lib/collaboration/types";
import { Avatar, ApprovalBadge, relativeTime } from "../CollabUtils";

interface Props {
  tasks: TaskCollaboration[];
}

// AM View — latest updates, client notes, internal notes, approvals, upcoming risks

export default function AccountManagerView({ tasks }: Props) {
  const allClientNotes = tasks.flatMap((t) => t.clientNotes.map((n) => ({ ...n, taskName: t.taskName, projectName: t.projectName })));
  const allUnread = tasks.flatMap((t) => t.notifications.filter((n) => !n.read).map((n) => ({ ...n, taskName: t.taskName })));
  const allPendingApprovals = tasks.flatMap((t) =>
    t.approvals
      .filter((a) => a.status === "Pending Approval" || a.status === "Pending Review")
      .map((a) => ({ ...a, taskName: t.taskName, projectName: t.projectName })),
  );
  const allInternalUrgent = tasks.flatMap((t) =>
    t.internalNotes
      .filter((n) => n.priority === "Urgent" || n.priority === "High")
      .map((n) => ({ ...n, taskName: t.taskName, projectName: t.projectName })),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>Account Manager View</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
          Client communication history, notes, approvals, and upcoming risks — all in one place.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "C", label: "Client Notes", value: allClientNotes.length },
          { icon: "", label: "Pending Approvals", value: allPendingApprovals.length, warn: true },
          { icon: "", label: "Unread Alerts", value: allUnread.length, danger: allUnread.length > 0 },
          { icon: "N", label: "High Priority Internal", value: allInternalUrgent.length, warn: allInternalUrgent.length > 0 },
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
            <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{kpi.icon} {kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Unread Notifications */}
      {allUnread.length > 0 && (
        <section>
          <SectionHeader>Unread Notifications</SectionHeader>
          <div className="space-y-2">
            {allUnread.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: "#EBF0FD", border: "1px solid #BFDBFE" }}
              >
                
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: "#1B4FD8" }}>{n.message}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#5A6A85" }}>
                    {n.taskName} · {relativeTime(n.timestamp)}
                  </p>
                </div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "#1B4FD8", color: "#fff" }}
                >
                  {n.type}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Approvals */}
      {allPendingApprovals.length > 0 && (
        <section>
          <SectionHeader>⏳ Pending Approvals Requiring AM Action</SectionHeader>
          <div className="space-y-2">
            {allPendingApprovals.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl"
                style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
              >
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{a.stepName}</p>
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{a.taskName} · {a.projectName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ApprovalBadge status={a.status} />
                  <div className="flex items-center gap-1">
                    <button
                      className="text-[11px] px-2 py-1 rounded font-semibold"
                      style={{ background: "#D1FAE5", color: "#065F46" }}
                    >
                      Approve
                    </button>
                    <button
                      className="text-[11px] px-2 py-1 rounded font-semibold"
                      style={{ background: "#FEE2E2", color: "#991B1B" }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Client Notes — all */}
      {allClientNotes.length > 0 && (
        <section>
          <SectionHeader>Client Communication History</SectionHeader>
          <div className="space-y-3">
            {[...allClientNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((n) => (
              <div
                key={n.id}
                className="rounded-xl p-4"
                style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar initials={n.authorInitials} color={n.authorColor} size="xs" />
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{n.authorName}</p>
                      <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{n.taskName} · {n.projectName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: "#DBEAFE", color: "#1E40AF" }}
                    >
                      {n.source}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{relativeTime(n.createdAt)}</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{n.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Internal High Priority */}
      {allInternalUrgent.length > 0 && (
        <section>
          <SectionHeader>High-Priority Internal Notes</SectionHeader>
          <div className="space-y-3">
            {allInternalUrgent.map((n) => (
              <div
                key={n.id}
                className="rounded-xl p-4"
                style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar initials={n.authorInitials} color={n.authorColor} size="xs" />
                    <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{n.authorName}</p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ background: n.priority === "Urgent" ? "#DC2626" : "#D97706" }}
                  >
                    {n.priority}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-1" style={{ color: "var(--rtm-text-secondary)" }}>{n.body}</p>
                <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{n.taskName} · {n.projectName}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Per-project health */}
      <section>
        <SectionHeader>Project Health Summary</SectionHeader>
        <div className="space-y-3">
          {tasks.map((t) => {
            const isBlocked = t.dependencies.some((d) => d.status === "Blocked");
            const hasPendingAppr = t.approvals.some((a) => a.status === "Pending Approval" || a.status === "Pending Review");
            return (
              <div
                key={t.taskId}
                className="flex items-center justify-between gap-3 p-4 rounded-xl"
                style={{
                  background: "var(--rtm-surface)",
                  border: `1px solid ${isBlocked ? "#FECACA" : hasPendingAppr ? "#FDE68A" : "var(--rtm-border)"}`,
                }}
              >
                <div>
                  <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{t.taskName}</p>
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{t.projectName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {t.comments.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "#EBF0FD", color: "#1B4FD8" }}>
                      {t.comments.length}
                    </span>
                  )}
                  {t.approvals.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#92400E" }}>
                      {t.approvals.length}
                    </span>
                  )}
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: isBlocked ? "#FEE2E2" : hasPendingAppr ? "#FEF3C7" : "#D1FAE5",
                      color: isBlocked ? "#991B1B" : hasPendingAppr ? "#92400E" : "#065F46",
                    }}
                  >
                    {isBlocked ? "Blocked" : hasPendingAppr ? "Approval" : "OK"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
      {children}
    </h3>
  );
}
