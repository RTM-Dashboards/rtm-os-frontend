import type { Task } from "@/lib/tasks/types";

interface Props {
  tasks: Task[];
}

export default function TaskKPIBar({ tasks }: Props) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "Done").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const blocked = tasks.filter((t) => t.status === "Blocked"|| t.blockers.length > 0).length;
  const overdue = tasks.filter(
    (t) => t.dueDate && t.status !== "Done"&& new Date(t.dueDate) < new Date()
  ).length;

  const stats = [
    { label: "Total Tasks",  value: total,      color: "var(--rtm-blue)",  bg: "var(--rtm-blue-xlight)"},
    { label: "In Progress",  value: inProgress, color: "#3B82F6",          bg: "#EFF6FF"},
    { label: "Blocked",      value: blocked,    color: "#DC2626",          bg: "#FEF2F2"},
    { label: "Overdue",      value: overdue,    color: "#D97706",          bg: "#FFFBEB"},
    { label: "Completed",    value: done,       color: "#059669",          bg: "#ECFDF5"},
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rtm-card px-4 py-3 flex flex-col gap-1">
          <span className="text-2xl font-extrabold"style={{ color: s.color }}>{s.value}</span>
          <span className="text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
