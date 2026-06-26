import React from "react";
import type {
  HealthScore,
  CampaignStatus,
  DeliverableStatus,
  EscalationStatus,
  BlockerStatus,
  OnboardingStatus,
  Priority,
} from "@/lib/account-management/types";

type BadgeVariant =
  | HealthScore
  | CampaignStatus
  | DeliverableStatus
  | EscalationStatus
  | BlockerStatus
  | OnboardingStatus
  | Priority;

const variantStyles: Record<string, React.CSSProperties> = {
  // Health
  Healthy:           { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" },
  "Needs Attention": { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },
  "At-Risk":         { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },
  Critical:          { background: "#FEF2F2", color: "#991B1B", borderColor: "#FECACA" },

  // Campaign
  Active:           { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" },
  Paused:           { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" },
  "Pending Launch": { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
  Completed:        { background: "#F0F9FF", color: "#0369A1", borderColor: "#BAE6FD" },
  Cancelled:        { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" },

  // Deliverable
  "In Progress": { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
  Overdue:       { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" },
  "Not Started": { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" },
  Blocked:       { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" },

  // Escalation
  Open:      { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" },
  Resolved:  { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" },
  Escalated: { background: "#FEF2F2", color: "#991B1B", borderColor: "#FECACA" },

  // Blocker
  "In Review":      { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },
  "Awaiting Client":{ background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },

  // Onboarding
  Stalled:          { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },
  "Awaiting Assets":{ background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },

  // Priority
  Low:    { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" },
  Medium: { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
  High:   { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },
  // Critical already handled above
};

const defaultStyle: React.CSSProperties = { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };

interface StatusBadgeProps {
  value: BadgeVariant | string;
  size?: "sm" | "md";
}

export function StatusBadge({ value, size = "sm" }: StatusBadgeProps) {
  const style = variantStyles[value] ?? defaultStyle;
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium whitespace-nowrap ${sizeClass}`}
      style={style}
    >
      {value}
    </span>
  );
}
