import type { LaunchStatus } from "@/types/activation";

interface Props {
  status: LaunchStatus;
  size?: "sm" | "md";
}

type StyleDef = { bg: string; color: string; dot: string; border: string };

const LAUNCH_STATUS_STYLES: Record<LaunchStatus, StyleDef> = {
  "Upcoming":   { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", border: "#BFDBFE" },
  "Launching":  { bg: "#EEF2FF", color: "#3730A3", dot: "#6366F1", border: "#C7D2FE" },
  "Blocked":    { bg: "#FEF2F2", color: "#991B1B", dot: "#EF4444", border: "#FECACA" },
  "Delayed":    { bg: "#FFFBEB", color: "#92400E", dot: "#F59E0B", border: "#FDE68A" },
  "Onboarding": { bg: "#F5F3FF", color: "#5B21B6", dot: "#8B5CF6", border: "#DDD6FE" },
  "Active":     { bg: "#ECFDF5", color: "#065F46", dot: "#10B981", border: "#A7F3D0" },
};

export default function LaunchStatusBadge({ status, size = "md" }: Props) {
  const s = LAUNCH_STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {status}
    </span>
  );
}
