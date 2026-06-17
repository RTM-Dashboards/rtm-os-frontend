"use client";

import type { AICollaborationSummary, AISummaryItem } from "@/lib/collaboration/types";
import { formatDateTime } from "./CollabUtils";

// ─────────────────────────────────────────────────────────────────────────────
// RTM OS — AI Collaboration Summary Panel
// Surfaces latest updates, blockers, approvals, escalations, actions, health
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  summary: AICollaborationSummary;
  taskName: string;
  projectName: string;
}

const CATEGORY_CONFIG = {
  update:     { icon: "📋", label: "Latest Update",       bg: "#EFF6FF", color: "#1D4ED8" },
  blocker:    { icon: "🚫", label: "Blocker",             bg: "#FEF2F2", color: "#991B1B" },
  approval:   { icon: "⏳", label: "Approval",            bg: "#FFFBEB", color: "#92400E" },
  escalation: { icon: "⚡", label: "Escalation",          bg: "#FEF2F2", color: "#DC2626" },
  action:     { icon: "🎯", label: "Recommended Action",  bg: "#F0FDF4", color: "#065F46" },
  health:     { icon: "❤️", label: "Health Note",         bg: "#F8FAFC", color: "#475569" },
};

const URGENCY_INDICATOR = {
  info:     { dot: "#059669", label: "Info" },
  warn:     { dot: "#D97706", label: "Warning" },
  critical: { dot: "#DC2626", label: "Critical" },
};

function SummaryRow({ item }: { item: AISummaryItem }) {
  const catCfg = CATEGORY_CONFIG[item.category];
  const urgencyCfg = URGENCY_INDICATOR[item.urgency];
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
      <span className="text-base flex-shrink-0 mt-0.5">{catCfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
          {item.text}
        </p>
      </div>
      <span
        className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
        style={{ background: urgencyCfg.dot }}
        title={urgencyCfg.label}
      />
    </div>
  );
}

function SummarySection({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: AISummaryItem[];
  emptyText: string;
}) {
  if (!items.length) {
    return (
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--rtm-text-muted)" }}>
          {title}
        </p>
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{emptyText}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>
        {title}
      </p>
      <div>
        {items.map((item, i) => (
          <SummaryRow key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function AISummaryPanel({ summary, taskName, projectName }: Props) {
  const hasCritical =
    summary.currentBlockers.some((i) => i.urgency === "critical") ||
    summary.pendingApprovals.some((i) => i.urgency === "critical") ||
    summary.recentEscalations.some((i) => i.urgency === "critical");

  const healthNote = summary.projectHealthNotes[0];
  const isRed = healthNote?.text.includes("RED");
  const isGreen = healthNote?.text.includes("GREEN");

  const healthColor = isRed ? "#DC2626" : isGreen ? "#059669" : "#D97706";
  const healthBg = isRed ? "#FEF2F2" : isGreen ? "#ECFDF5" : "#FFFBEB";
  const healthBorder = isRed ? "#FECACA" : isGreen ? "#A7F3D0" : "#FDE68A";
  const healthIcon = isRed ? "🔴" : isGreen ? "🟢" : "🟡";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-4"
        style={{ background: "linear-gradient(135deg, #1B4FD8 0%, #3B82F6 100%)", color: "#fff" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <p className="text-sm font-bold">AI Collaboration Summary</p>
            <p className="text-[11px] opacity-80">{taskName} · {projectName}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] opacity-70">Generated</p>
          <p className="text-[11px] font-semibold">{formatDateTime(summary.generatedAt)}</p>
        </div>
      </div>

      {/* Critical Alert Bar */}
      {hasCritical && (
        <div
          className="flex items-center gap-2 px-5 py-2.5"
          style={{ background: "#DC2626", color: "#fff" }}
        >
          <span className="text-sm">🚨</span>
          <p className="text-xs font-bold">CRITICAL — Immediate action required. See blockers, approvals, and escalations below.</p>
        </div>
      )}

      {/* Health Status */}
      {healthNote && (
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ background: healthBg, borderBottom: `1px solid ${healthBorder}` }}
        >
          <span className="text-xl">{healthIcon}</span>
          <p className="text-xs font-semibold leading-snug" style={{ color: healthColor }}>
            {healthNote.text}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="px-5 py-4 space-y-5">
        <SummarySection
          title="📋 Latest Updates"
          items={summary.latestUpdates}
          emptyText="No recent updates."
        />
        <SummarySection
          title="🚫 Current Blockers"
          items={summary.currentBlockers}
          emptyText="No current blockers."
        />
        <SummarySection
          title="⏳ Pending Approvals"
          items={summary.pendingApprovals}
          emptyText="No pending approvals."
        />
        <SummarySection
          title="⚡ Recent Escalations"
          items={summary.recentEscalations}
          emptyText="No recent escalations."
        />
        <SummarySection
          title="🎯 Recommended Actions"
          items={summary.recommendedActions}
          emptyText="No recommended actions."
        />
        {summary.projectHealthNotes.length > 1 && (
          <SummarySection
            title="❤️ Project Health Notes"
            items={summary.projectHealthNotes.slice(1)}
            emptyText=""
          />
        )}
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-4 px-5 py-2.5 text-[10px]"
        style={{ background: "var(--rtm-bg)", borderTop: "1px solid var(--rtm-border)" }}
      >
        <span className="font-bold" style={{ color: "var(--rtm-text-muted)" }}>Urgency:</span>
        {(Object.entries(URGENCY_INDICATOR) as [string, typeof URGENCY_INDICATOR[keyof typeof URGENCY_INDICATOR]][]).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1" style={{ color: "var(--rtm-text-muted)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
            {cfg.label}
          </span>
        ))}
        <span className="ml-auto italic" style={{ color: "var(--rtm-text-muted)" }}>
          AI-generated summary — verify before acting
        </span>
      </div>
    </div>
  );
}
