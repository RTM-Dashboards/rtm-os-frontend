import type { TaskStatus } from "@/lib/tasks/types";

interface Props {
  status: TaskStatus;
  size?: "sm" | "md";
}

const CONFIG: Record<TaskStatus, { bg: string; color: string; dot: string; border: string }> = {
  Pending:      { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8", border: "#E2E8F0" },
  "In Progress":{ bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", border: "#BFDBFE" },
  "In Review":  { bg: "#FAF5FF", color: "#6D28D9", dot: "#8B5CF6", border: "#DDD6FE" },
  Blocked:      { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444", border: "#FECACA" },
  Done:         { bg: "#ECFDF5", color: "#059669", dot: "#10B981", border: "#A7F3D0" },
};

export default function TaskStatusBadge({ status, size = "md" }: Props) {
  const s = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border whitespace-nowrap ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {status}
    </span>
  );
}
