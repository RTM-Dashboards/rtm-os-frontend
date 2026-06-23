import type { TaskPriority } from "@/lib/tasks/types";

interface Props {
  priority: TaskPriority;
  size?: "sm"| "md";
  iconOnly?: boolean;
}

const CONFIG: Record<TaskPriority, { label: string; dot: string; color: string; bg: string; border: string }> = {
  Low:      { label: "Low",      dot: "#94A3B8", color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0"},
  Medium:   { label: "Medium",   dot: "#F59E0B", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
  High:     { label: "High",     dot: "#EF4444", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
  Critical: { label: "Critical", dot: "#7C3AED", color: "#7C3AED", bg: "#FAF5FF", border: "#DDD6FE"},
};

export default function PriorityBadge({ priority, size = "md", iconOnly = false }: Props) {
  const c = CONFIG[priority];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border whitespace-nowrap ${
        size === "sm"? "px-1.5 py-0.5 text-[11px]": "px-2 py-0.5 text-xs"}`}
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
      title={priority}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: c.dot }} />
      {!iconOnly && <span>{c.label}</span>}
    </span>
  );
}
