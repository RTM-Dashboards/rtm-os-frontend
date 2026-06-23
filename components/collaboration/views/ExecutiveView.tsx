"use client";

import type { TaskCollaboration } from "@/lib/collaboration/types";
import { ApprovalBadge, DepStatusBadge, relativeTime } from "../CollabUtils";

interface Props {
  tasks: TaskCollaboration[];
}

// Executive View — project status, blocked tasks, approval bottlenecks,
// department delays, escalations, risk indicators

export default function ExecutiveView({ tasks }: Props) {
  const allBlocked = tasks.filter((t) => t.dependencies.some((d) => d.status === "Blocked"|| d.status === "Escalated"));
  const allEscalated = tasks.filter((t) => t.dependencies.some((d) => d.status === "Escalated"));
  const allPendingAppr = tasks.flatMap((t) =>
    t.approvals
      .filter((a) => a.status === "Pending Approval"|| a.status === "Pending Review")
      .map((a) => ({ ...a, taskName: t.taskName, projectName: t.projectName })),
  );
  const allNotifs = tasks.flatMap((t) => t.notifications.filter((n) => !n.read));
  const totalAttach = tasks.reduce((s, t) => s + t.attachments.length, 0);

  const riskLevel = allBlocked.length > 1 || allEscalated.length > 0 ? "High": allBlocked.length === 1 ? "Medium": "Low";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold"style={{ color: "var(--rtm-text-primary)"}}>Executive View</h2>
        <p className="text-sm mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>
          Project-level blockers, approval bottlenecks, escalations, and risk indicators.
        </p>
      </div>

      {/* Overall risk */}
      <div
        className="flex items-center justify-between p-5 rounded-xl"style={{
          background: riskLevel === "High"? "#FEF2F2": riskLevel === "Medium"? "#FFFBEB": "#F0FDF4",
          border: `1px solid ${riskLevel === "High"? "#FECACA": riskLevel === "Medium"? "#FDE68A": "#BBF7D0"}`,
        }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wider"style={{ color: "var(--rtm-text-muted)"}}>Overall Portfolio Risk</p>
          <p
            className="text-3xl font-black mt-1"style={{ color: riskLevel === "High"? "#DC2626": riskLevel === "Medium"? "#D97706": "#059669"}}
          >
            {riskLevel === "High"? "HIGH": riskLevel === "Medium"? "MEDIUM": "LOW"}
          </p>
          <p className="text-xs mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
            {allBlocked.length} blocked · {allEscalated.length} escalated · {allPendingAppr.length} pending approvals
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>Tasks monitored</p>
          <p className="text-2xl font-bold"style={{ color: "var(--rtm-text-primary)"}}>{tasks.length}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "BLK", label: "Blocked Tasks", value: allBlocked.length, danger: allBlocked.length > 0 },
          { icon: "!", label: "Escalated", value: allEscalated.length, danger: allEscalated.length > 0 },
          { icon: "⏳", label: "Approval Bottlenecks", value: allPendingAppr.length, warn: allPendingAppr.length > 0 },
          { icon: "", label: "Unread Alerts", value: allNotifs.length, warn: allNotifs.length > 0 },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4 text-center"style={{
              background: "var(--rtm-surface)",
              border: `1px solid ${kpi.danger ? "#FECACA": kpi.warn ? "#FDE68A": "var(--rtm-border)"}`,
            }}
          >
            <p className="text-2xl font-bold"style={{ color: kpi.danger ? "#DC2626": kpi.warn ? "#D97706": "var(--rtm-text-primary)"}}>
              {kpi.value}
            </p>
            <p className="text-[11px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{kpi.icon} {kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Blocked Tasks */}
      {allBlocked.length > 0 && (
        <section>
          <SectionHeader>Blocked Tasks</SectionHeader>
          <div className="space-y-3">
            {allBlocked.map((t) => {
              const blockedDeps = t.dependencies.filter((d) => d.status === "Blocked"|| d.status === "Escalated");
              return (
                <div
                  key={t.taskId}
                  className="rounded-xl p-4"style={{ background: "#FEF2F2", border: "1px solid #FECACA"}}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-xs font-bold"style={{ color: "#991B1B"}}>{t.taskName}</p>
                      <p className="text-[10px]"style={{ color: "#DC2626"}}>{t.projectName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"style={{ background: "#DC2626", color: "#fff"}}>
                      Blocked
                    </span>
                  </div>
                  <div className="space-y-1">
                    {blockedDeps.map((d) => (
                      <div key={d.id} className="flex items-center gap-2">
                        <DepStatusBadge status={d.status} />
                        <span className="text-xs"style={{ color: "#991B1B"}}>{d.name}</span>
                        {d.blockerReason && (
                          <span className="text-[10px]"style={{ color: "#DC2626"}}>— {d.blockerReason}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {t.internalNotes.filter((n) => n.priority === "Urgent").map((n) => (
                    <div key={n.id} className="mt-2 p-2 rounded text-xs"style={{ background: "#FEE2E2", color: "#991B1B"}}>
                      {n.body}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Approval Bottlenecks */}
      {allPendingAppr.length > 0 && (
        <section>
          <SectionHeader>⏳ Approval Bottlenecks</SectionHeader>
          <div className="space-y-2">
            {allPendingAppr.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl"style={{ background: "var(--rtm-surface)", border: "1px solid #FDE68A"}}
              >
                <div>
                  <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{a.stepName}</p>
                  <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{a.taskName} · {a.projectName}</p>
                  <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>Approver: {a.approver}</p>
                </div>
                <ApprovalBadge status={a.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Department Risk per task */}
      <section>
        <SectionHeader>Department & Project Status</SectionHeader>
        <div className="space-y-2">
          {tasks.map((t) => {
            const blocked = t.dependencies.some((d) => d.status === "Blocked");
            const escalated = t.dependencies.some((d) => d.status === "Escalated");
            const pendAppr = t.approvals.filter((a) => a.status === "Pending Approval"|| a.status === "Pending Review").length;
            const risk = escalated ? "Critical": blocked ? "High": pendAppr > 0 ? "Medium": "Low";
            const riskColors: Record<string, { bg: string; color: string; label: string }> = {
              Critical: { bg: "#7C2D12", color: "#fff", label: "Critical"},
              High:     { bg: "#FEE2E2", color: "#991B1B", label: "High"},
              Medium:   { bg: "#FEF3C7", color: "#92400E", label: "Medium"},
              Low:      { bg: "#D1FAE5", color: "#065F46", label: "Low"},
            };
            const rc = riskColors[risk];
            return (
              <div
                key={t.taskId}
                className="flex items-center justify-between gap-3 p-3 rounded-xl"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
              >
                <div>
                  <p className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{t.taskName}</p>
                  <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{t.projectName}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
                    {t.comments.length} · {t.attachments.length} · {t.approvals.length}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"style={{ background: rc.bg, color: rc.color }}
                  >
                    {rc.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Escalation Alerts */}
      {allNotifs.filter((n) => n.type === "Project Escalated"|| n.type === "Dependency Blocked").length > 0 && (
        <section>
          <SectionHeader>Escalation Alerts</SectionHeader>
          <div className="space-y-2">
            {allNotifs.filter((n) => n.type === "Project Escalated"|| n.type === "Dependency Blocked").map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 p-3 rounded-xl"style={{ background: "#FEF2F2", border: "1px solid #FECACA"}}
              >
                
                <div>
                  <p className="text-xs font-semibold"style={{ color: "#DC2626"}}>{n.message}</p>
                  <p className="text-[10px]"style={{ color: "#991B1B"}}>{n.taskName} · {relativeTime(n.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>
      {children}
    </h3>
  );
}
