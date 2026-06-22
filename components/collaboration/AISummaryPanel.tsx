"use client";

import type { AICollaborationSummary, AISummaryItem } from "@/lib/collaboration/types";
import { formatDateTime } from "./CollabUtils";

// ─────────────────────────────────────────────────────────────────────────────
// RTM OS — AI Collaboration Summary Panel
// Surfaces latest updates, blockers, approvals, escalations, actions, health.
// Enterprise-styled: no emoji icons, consistent visual language.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  summary: AICollaborationSummary;
  taskName: string;
  projectName: string;
}

// ── Section heading icons (inline SVG) ────────────────────────────────────────

const UpdateIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const BlockerIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);
const ApprovalIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const EscalationIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const ActionIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const HealthIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const AIBrainIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);
const CriticalIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// ── Category config ───────────────────────────────────────────────────────────

type Category = "update" | "blocker" | "approval" | "escalation" | "action" | "health";

const CATEGORY_CONFIG: Record<Category, { icon: React.ReactNode; label: string; bg: string; color: string }> = {
  update:     { icon: <UpdateIcon />,     label: "Latest Update",       bg: "#EFF6FF", color: "#1D4ED8" },
  blocker:    { icon: <BlockerIcon />,    label: "Blocker",             bg: "#FEF2F2", color: "#991B1B" },
  approval:   { icon: <ApprovalIcon />,   label: "Approval",            bg: "#FFFBEB", color: "#92400E" },
  escalation: { icon: <EscalationIcon />, label: "Escalation",          bg: "#FEF2F2", color: "#DC2626" },
  action:     { icon: <ActionIcon />,     label: "Recommended Action",  bg: "#F0FDF4", color: "#065F46" },
  health:     { icon: <HealthIcon />,     label: "Health Note",         bg: "#F8FAFC", color: "#475569" },
};

const URGENCY_DOT: Record<string, string> = {
  info:     "#059669",
  warn:     "#D97706",
  critical: "#DC2626",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryRow({ item }: { item: AISummaryItem }) {
  const catCfg = CATEGORY_CONFIG[item.category as Category];
  const dot = URGENCY_DOT[item.urgency] ?? URGENCY_DOT.info;

  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
      <span
        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: catCfg?.bg ?? "#F8FAFC", color: catCfg?.color ?? "#475569" }}
      >
        {catCfg?.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
          {item.text}
        </p>
      </div>
      <span
        className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
        style={{ background: dot }}
        title={item.urgency}
      />
    </div>
  );
}

function SummarySection({
  title,
  icon,
  items,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: AISummaryItem[];
  emptyText: string;
}) {
  if (!items.length) {
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <span style={{ color: "var(--rtm-text-muted)" }}>{icon}</span>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>
            {title}
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{emptyText}</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color: "var(--rtm-text-muted)" }}>{icon}</span>
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>
          {title}
        </p>
      </div>
      <div>
        {items.map((item, i) => (
          <SummaryRow key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AISummaryPanel({ summary, taskName, projectName }: Props) {
  const hasCritical =
    summary.currentBlockers.some((i) => i.urgency === "critical") ||
    summary.pendingApprovals.some((i) => i.urgency === "critical") ||
    summary.recentEscalations.some((i) => i.urgency === "critical");

  const healthNote = summary.projectHealthNotes[0];
  const isRed    = healthNote?.text.includes("RED");
  const isGreen  = healthNote?.text.includes("GREEN");

  const healthColor  = isRed ? "#DC2626" : isGreen ? "#059669" : "#D97706";
  const healthBg     = isRed ? "#FEF2F2" : isGreen ? "#ECFDF5" : "#FFFBEB";
  const healthBorder = isRed ? "#FECACA" : isGreen ? "#A7F3D0" : "#FDE68A";
  const healthDot    = isRed ? "#DC2626" : isGreen ? "#10B981" : "#F59E0B";

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-4"
        style={{ background: "linear-gradient(135deg, #1B4FD8 0%, #3B82F6 100%)", color: "#fff" }}
      >
        <div className="flex items-center gap-2">
          <AIBrainIcon />
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
          <CriticalIcon />
          <p className="text-xs font-bold">CRITICAL — Immediate action required. Review blockers, approvals, and escalations below.</p>
        </div>
      )}

      {/* Health Status */}
      {healthNote && (
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ background: healthBg, borderBottom: `1px solid ${healthBorder}` }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: healthDot }} />
          <p className="text-xs font-semibold leading-snug" style={{ color: healthColor }}>
            {healthNote.text}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="px-5 py-4 space-y-5">
        <SummarySection
          title="Latest Updates"
          icon={<UpdateIcon />}
          items={summary.latestUpdates}
          emptyText="No recent updates."
        />
        <SummarySection
          title="Current Blockers"
          icon={<BlockerIcon />}
          items={summary.currentBlockers}
          emptyText="No current blockers."
        />
        <SummarySection
          title="Pending Approvals"
          icon={<ApprovalIcon />}
          items={summary.pendingApprovals}
          emptyText="No pending approvals."
        />
        <SummarySection
          title="Recent Escalations"
          icon={<EscalationIcon />}
          items={summary.recentEscalations}
          emptyText="No recent escalations."
        />
        <SummarySection
          title="Recommended Actions"
          icon={<ActionIcon />}
          items={summary.recommendedActions}
          emptyText="No recommended actions."
        />
        {summary.projectHealthNotes.length > 1 && (
          <SummarySection
            title="Project Health Notes"
            icon={<HealthIcon />}
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
        {[
          { dot: "#059669", label: "Info" },
          { dot: "#D97706", label: "Warning" },
          { dot: "#DC2626", label: "Critical" },
        ].map((u) => (
          <span key={u.label} className="flex items-center gap-1" style={{ color: "var(--rtm-text-muted)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: u.dot }} />
            {u.label}
          </span>
        ))}
        <span className="ml-auto italic" style={{ color: "var(--rtm-text-muted)" }}>
          AI-generated — verify before acting
        </span>
      </div>
    </div>
  );
}
