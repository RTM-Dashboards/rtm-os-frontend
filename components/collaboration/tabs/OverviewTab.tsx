"use client";

import type { TaskCollaboration } from "@/lib/collaboration/types";
import { Avatar, ApprovalBadge, DepStatusBadge, formatDate, relativeTime } from "../CollabUtils";

interface Props {
  collab: TaskCollaboration;
}

export default function OverviewTab({ collab }: Props) {
  const { comments, internalNotes, clientNotes, attachments, watchers, approvals, activity, dependencies, notifications } = collab;

  const blocked = dependencies.filter((d) => d.status === "Blocked"|| d.status === "Escalated");
  const pendingApprovals = approvals.filter((a) => a.status === "Pending Approval"|| a.status === "Pending Review");
  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-5">
      {/* Alert banner — blocked */}
      {blocked.length > 0 && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"style={{ background: "#FEF2F2", border: "1px solid #FECACA"}}
        >
          
          <div>
            <p className="text-sm font-bold"style={{ color: "#DC2626"}}>
              {blocked.length} Blocking {blocked.length === 1 ? "Dependency": "Dependencies"}
            </p>
            <ul className="mt-1 space-y-1">
              {blocked.map((d) => (
                <li key={d.id} className="text-xs"style={{ color: "#991B1B"}}>
                  · {d.name}: {d.blockerReason ?? d.status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Pending approvals */}
      {pendingApprovals.length > 0 && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"style={{ background: "#FFFBEB", border: "1px solid #FDE68A"}}
        >
          <span className="text-xl">⏳</span>
          <div>
            <p className="text-sm font-bold"style={{ color: "#92400E"}}>
              {pendingApprovals.length} Approval{pendingApprovals.length > 1 ? "s": ""} Awaiting Action
            </p>
            <ul className="mt-1 space-y-1">
              {pendingApprovals.map((a) => (
                <li key={a.id} className="text-xs flex items-center gap-2"style={{ color: "#78350F"}}>
                  · {a.stepName} — <ApprovalBadge status={a.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "C", label: "Comments", value: comments.length, tab: "comments"},
          { icon: "A", label: "Attachments", value: attachments.length, tab: "attachments"},
          { icon: "", label: "Approvals", value: approvals.length, tab: "approvals"},
          { icon: "W", label: "Watchers", value: watchers.filter((w) => w.watching).length, tab: "watchers"},
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 text-center"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <p className="text-2xl font-bold"style={{ color: "var(--rtm-text-primary)"}}>{stat.value}</p>
            <p className="text-[11px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{stat.icon} {stat.label}</p>
          </div>
        ))}
      </div>

      {/* Latest Comments */}
      {comments.length > 0 && (
        <Section title="Latest Comments">
          {comments.slice(0, 2).map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar initials={c.authorInitials} color={c.authorColor} size="xs"/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.authorName}</span>
                  <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{relativeTime(c.createdAt)}</span>
                </div>
                <p className="text-xs truncate"style={{ color: "var(--rtm-text-secondary)"}}>{c.body}</p>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Approvals status */}
      {approvals.length > 0 && (
        <Section title="Approvals">
          <div className="space-y-2">
            {approvals.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2">
                <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{a.stepName}</span>
                <ApprovalBadge status={a.status} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <Section title="Dependencies">
          <div className="space-y-2">
            {dependencies.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>{d.name}</span>
                  {d.dueDate && <span className="ml-2 text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>Due {formatDate(d.dueDate)}</span>}
                </div>
                <DepStatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Watchers */}
      {watchers.filter((w) => w.watching).length > 0 && (
        <Section title="Watchers">
          <div className="flex flex-wrap gap-2">
            {watchers.filter((w) => w.watching).map((w) => (
              <div key={w.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <Avatar initials={w.initials} color={w.avatarColor} size="xs"/>
                <span className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>{w.name}</span>
                <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>({w.role})</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Latest Activity */}
      {activity.length > 0 && (
        <Section title="Recent Activity">
          <div className="space-y-2">
            {[...activity].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 4).map((ev) => (
              <div key={ev.id} className="flex items-center gap-2">
                <Avatar initials={ev.userInitials} color={ev.userColor} size="xs"/>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>{ev.userName} </span>
                  <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{ev.eventType.toLowerCase()}</span>
                </div>
                <span className="text-[10px] flex-shrink-0"style={{ color: "var(--rtm-text-muted)"}}>{relativeTime(ev.timestamp)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Unread notifications */}
      {unreadNotifs.length > 0 && (
        <Section title="Notifications">
          <div className="space-y-2">
            {unreadNotifs.map((n) => (
              <div key={n.id} className="flex items-start gap-2 p-2 rounded-lg"style={{ background: "#d0e8f5"}}>
                
                <div>
                  <p className="text-xs font-medium"style={{ color: "#1d709f"}}>{n.message}</p>
                  <p className="text-[10px]"style={{ color: "#5A6A85"}}>{relativeTime(n.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Internal notes count */}
      {internalNotes.length > 0 && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-xs"style={{ background: "#FEF9C3", border: "1px solid #FDE68A", color: "#92400E"}}
        >
          
          <span>{internalNotes.length} internal note{internalNotes.length > 1 ? "s": ""} · {clientNotes.length} client note{clientNotes.length > 1 ? "s": ""}</span>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>{title}</p>
      {children}
    </div>
  );
}
