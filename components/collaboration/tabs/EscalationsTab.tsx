"use client";

import type { EscalationRecord, EscalationLevel, EscalationStatus, EscalationTrigger } from "@/lib/collaboration/types";
import { Avatar, formatDateTime, EmptyTab } from "../CollabUtils";

interface Props {
  escalations: EscalationRecord[];
}

const LEVEL_CONFIG: Record<EscalationLevel, { bg: string; color: string; border: string; icon: string }> = {
  "L1 - Team":            { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", icon: "👥" },
  "L2 - Department Head": { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A", icon: "🏢" },
  "L3 - Account Manager": { bg: "#F3E8FF", color: "#6B21A8", border: "#DDD6FE", icon: "🤝" },
  "L4 - Executive":       { bg: "#FEE2E2", color: "#991B1B", border: "#FECACA", icon: "⚡" },
  "L5 - VP / Director":   { bg: "#7C2D12", color: "#fff",    border: "#B91C1C", icon: "🔴" },
};

const STATUS_CONFIG: Record<EscalationStatus, { bg: string; color: string }> = {
  "Open":               { bg: "#FEE2E2", color: "#991B1B" },
  "In Progress":        { bg: "#DBEAFE", color: "#1E40AF" },
  "Resolved":           { bg: "#D1FAE5", color: "#065F46" },
  "Escalated Further":  { bg: "#F3E8FF", color: "#6B21A8" },
  "Closed":             { bg: "#F3F4F6", color: "#6B7280" },
};

const TRIGGER_ICONS: Record<EscalationTrigger, string> = {
  "Task Overdue":            "⏰",
  "Dependency Blocked":      "🚫",
  "Client Access Missing":   "🔑",
  "Payment Overdue":         "💰",
  "Client At Risk":          "⚠️",
  "Approval Bottleneck":     "⏳",
  "Performance Issue":       "📉",
  "Missed SLA":              "📋",
  "Cross-Department Delay":  "🔗",
  "Manual Escalation":       "🖐️",
};

function EscalationLevelBadge({ level }: { level: EscalationLevel }) {
  const cfg = LEVEL_CONFIG[level];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      {cfg.icon} {level}
    </span>
  );
}

function EscalationStatusBadge({ status }: { status: EscalationStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status}
    </span>
  );
}

export default function EscalationsTab({ escalations }: Props) {
  if (!escalations.length) {
    return <EmptyTab icon="⚡" message="No escalations recorded for this task." />;
  }

  const open = escalations.filter((e) => e.status === "Open" || e.status === "In Progress" || e.status === "Escalated Further");
  const resolved = escalations.filter((e) => e.status === "Resolved" || e.status === "Closed");

  return (
    <div className="space-y-6">
      {/* Banner for open escalations */}
      {open.length > 0 && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
        >
          <span className="text-xl flex-shrink-0">⚡</span>
          <div>
            <p className="text-sm font-bold" style={{ color: "#DC2626" }}>
              {open.length} Active Escalation{open.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#991B1B" }}>
              These escalations require immediate attention. Review assigned teams and take action.
            </p>
          </div>
        </div>
      )}

      {/* Open Escalations */}
      {open.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "#DC2626" }}>
            <span>⚡</span> Active Escalations ({open.length})
          </p>
          <div className="space-y-3">
            {open.map((esc) => <EscalationCard key={esc.id} esc={esc} />)}
          </div>
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "#059669" }}>
            <span>✓</span> Resolved Escalations ({resolved.length})
          </p>
          <div className="space-y-3 opacity-75">
            {resolved.map((esc) => <EscalationCard key={esc.id} esc={esc} />)}
          </div>
        </div>
      )}

      {/* Escalation Info */}
      <div
        className="p-4 rounded-xl text-xs leading-relaxed"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
      >
        <p className="font-semibold mb-2" style={{ color: "var(--rtm-text-primary)" }}>📊 Escalation Levels</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.entries(LEVEL_CONFIG) as [EscalationLevel, typeof LEVEL_CONFIG[EscalationLevel]][]).map(([level, cfg]) => (
            <div key={level} className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                {cfg.icon}
              </span>
              <span style={{ color: "var(--rtm-text-secondary)" }}>{level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EscalationCard({ esc }: { esc: EscalationRecord }) {
  const levelCfg = LEVEL_CONFIG[esc.level];
  const isResolved = esc.status === "Resolved" || esc.status === "Closed";

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--rtm-surface)",
        border: `1px solid ${isResolved ? "var(--rtm-border)" : levelCfg.border}`,
        boxShadow: isResolved ? "none" : `0 0 0 1px ${levelCfg.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <EscalationLevelBadge level={esc.level} />
          <EscalationStatusBadge status={esc.status} />
        </div>
        <span className="text-[11px] flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>
          {formatDateTime(esc.createdAt)}
        </span>
      </div>

      {/* Trigger */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{TRIGGER_ICONS[esc.trigger]}</span>
        <div>
          <p className="text-xs font-bold" style={{ color: "var(--rtm-text-muted)" }}>Trigger</p>
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{esc.trigger}</p>
        </div>
      </div>

      {/* Assigned */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Team</p>
          <p className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>{esc.assignedTeam}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Role</p>
          <p className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>{esc.assignedRole}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Assigned User</p>
          <div className="flex items-center gap-1.5">
            <Avatar initials={esc.assignedUserInitials} color={esc.assignedUserColor} size="xs" />
            <p className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>{esc.assignedUser.split(" ")[0]}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {esc.notes && (
        <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--rtm-text-secondary)" }}>
          📝 {esc.notes}
        </p>
      )}

      {/* Resolution */}
      {isResolved && esc.resolvedAt && (
        <div
          className="flex items-center gap-2 p-2 rounded-lg text-xs"
          style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46" }}
        >
          <span>✓</span>
          <span>
            Resolved by <strong>{esc.resolvedBy ?? "—"}</strong> on {formatDateTime(esc.resolvedAt)}
          </span>
        </div>
      )}

      {/* Actions for open escalations */}
      {!isResolved && (
        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--rtm-border-light)" }}>
          <button
            className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
            style={{ background: "#059669" }}
          >
            Mark Resolved
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
            style={{ background: "#DC2626" }}
          >
            Escalate Further
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
          >
            Reassign
          </button>
        </div>
      )}
    </div>
  );
}
