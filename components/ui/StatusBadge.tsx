export type StatusVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "pending";

interface StatusBadgeProps {
  variant: StatusVariant;
  label: string;
  size?: "sm" | "md";
}

const variantMap: Record<StatusVariant, { bg: string; color: string; dot: string; border: string }> = {
  success: { bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
  warning: { bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B", border: "#FDE68A" },
  error:   { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", border: "#FECACA" },
  info:    { bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", dot: "var(--rtm-blue-mid)", border: "var(--rtm-blue-light)" },
  neutral: { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
  pending: { bg: "#EFF6FF", color: "#3B82F6", dot: "#6366F1", border: "#BFDBFE" },
};

export default function StatusBadge({ variant, label, size = "md" }: StatusBadgeProps) {
  const s = variantMap[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: s.dot }}
      />
      {label}
    </span>
  );
}
