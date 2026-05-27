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

const variantStyles: Record<string, string> = {
  // Health
  Healthy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Needs Attention": "bg-amber-100 text-amber-700 border-amber-200",
  "At-Risk": "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-red-100 text-red-700 border-red-200",

  // Campaign
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Paused: "bg-slate-100 text-slate-600 border-slate-200",
  "Pending Launch": "bg-blue-100 text-blue-700 border-blue-200",
  Completed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",

  // Deliverable
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Overdue: "bg-red-100 text-red-700 border-red-200",
  "Not Started": "bg-slate-100 text-slate-600 border-slate-200",
  Blocked: "bg-orange-100 text-orange-700 border-orange-200",

  // Escalation
  Open: "bg-red-100 text-red-700 border-red-200",
  Resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Escalated: "bg-purple-100 text-purple-700 border-purple-200",

  // Blocker
  "In Review": "bg-amber-100 text-amber-700 border-amber-200",
  "Awaiting Client": "bg-orange-100 text-orange-700 border-orange-200",

  // Onboarding
  Stalled: "bg-orange-100 text-orange-700 border-orange-200",
  "Awaiting Assets": "bg-amber-100 text-amber-700 border-amber-200",

  // Priority
  Low: "bg-slate-100 text-slate-600 border-slate-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  High: "bg-amber-100 text-amber-700 border-amber-200",
  // Critical already handled above
};

interface StatusBadgeProps {
  value: BadgeVariant | string;
  size?: "sm" | "md";
}

export function StatusBadge({ value, size = "sm" }: StatusBadgeProps) {
  const style = variantStyles[value] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium whitespace-nowrap ${sizeClass} ${style}`}
    >
      {value}
    </span>
  );
}
