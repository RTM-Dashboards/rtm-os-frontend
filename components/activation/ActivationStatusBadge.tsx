import type { ActivationStatus } from "@/types/activation";

interface Props {
  status: ActivationStatus;
  size?: "sm" | "md";
}

type StyleDef = { bg: string; color: string; dot: string; border: string };

const STATUS_STYLES: Record<ActivationStatus, StyleDef> = {
  "Pending Contract":    { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B", border: "#FDE68A" },
  "Pending Payment":     { bg: "#FEF2F2", color: "#991B1B", dot: "#EF4444", border: "#FECACA" },
  "Pending Assignment":  { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", border: "#BFDBFE" },
  "Ready For Launch":    { bg: "#F0FDF4", color: "#166534", dot: "#22C55E", border: "#BBF7D0" },
  "Launching":           { bg: "#EEF2FF", color: "#3730A3", dot: "#6366F1", border: "#C7D2FE" },
  "Active":              { bg: "#ECFDF5", color: "#065F46", dot: "#10B981", border: "#A7F3D0" },
  "On Hold":             { bg: "#F8FAFC", color: "#475569", dot: "#94A3B8", border: "#E2E8F0" },
};

export default function ActivationStatusBadge({ status, size = "md" }: Props) {
  const s = STATUS_STYLES[status];
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
