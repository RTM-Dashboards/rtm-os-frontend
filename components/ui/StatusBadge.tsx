// RTM OS — Standard Status Badge
// Covers all system statuses with consistent visual language.

export type StatusVariant =
  // Semantic legacy (kept for compat)
  | "success" | "warning" | "error" | "info" | "neutral" | "pending"
  // Named statuses — primary set
  | "active" | "inactive" | "draft" | "review" | "approved"
  | "completed" | "archived" | "cancelled"
  // Health / risk
  | "healthy" | "monitor" | "at-risk" | "critical" | "escalated"
  // Work states
  | "blocked" | "overdue";

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  size?: "sm" | "md";
}

type VariantStyle = { bg: string; color: string; dot: string; border: string };

const variantMap: Record<StatusVariant, VariantStyle> = {
  // ── Semantic ──────────────────────────────────────────────────────────────
  success:   { bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  warning:   { bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B", border: "#FDE68A" },
  error:     { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", border: "#FECACA" },
  info:      { bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", dot: "var(--rtm-blue-mid)", border: "var(--rtm-blue-light)" },
  neutral:   { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
  pending:   { bg: "#EFF6FF", color: "#3B82F6", dot: "#6366F1", border: "#BFDBFE" },

  // ── Named work statuses ───────────────────────────────────────────────────
  active:    { bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  inactive:  { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
  draft:     { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
  review:    { bg: "#EFF6FF", color: "#3B82F6", dot: "#6366F1", border: "#BFDBFE" },
  approved:  { bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  completed: { bg: "#F0F9FF", color: "#0369A1", dot: "#0EA5E9", border: "#BAE6FD" },
  archived:  { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
  cancelled: { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", border: "#FECACA" },

  // ── Health / risk ─────────────────────────────────────────────────────────
  healthy:   { bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  monitor:   { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", border: "#BFDBFE" },
  "at-risk": { bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B", border: "#FDE68A" },
  critical:  { bg: "#FEF2F2", color: "#991B1B", dot: "#DC2626", border: "#FECACA" },
  escalated: { bg: "#FEF2F2", color: "#991B1B", dot: "#DC2626", border: "#FECACA" },

  // ── Work states ───────────────────────────────────────────────────────────
  blocked:   { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", border: "#FECACA" },
  overdue:   { bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B", border: "#FDE68A" },
};

// Default label per named status (used when label prop is omitted)
const defaultLabel: Partial<Record<StatusVariant, string>> = {
  active:    "Active",
  inactive:  "Inactive",
  draft:     "Draft",
  review:    "In Review",
  approved:  "Approved",
  completed: "Completed",
  archived:  "Archived",
  cancelled: "Cancelled",
  "at-risk": "At Risk",
  healthy:   "Healthy",
  monitor:   "Monitor",
  critical:  "Critical",
  escalated: "Escalated",
  blocked:   "Blocked",
  overdue:   "Overdue",
  pending:   "Pending",
  success:   "Success",
  warning:   "Warning",
  error:     "Error",
  info:      "Info",
  neutral:   "Neutral",
};

export default function StatusBadge({ variant, label, size = "md" }: StatusBadgeProps) {
  const s = variantMap[variant];
  const displayLabel = label ?? defaultLabel[variant] ?? variant;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {displayLabel}
    </span>
  );
}
