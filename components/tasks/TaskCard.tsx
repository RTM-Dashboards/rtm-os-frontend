"use client";

import type { Task } from "@/lib/tasks/types";
import TaskStatusBadge from "./TaskStatusBadge";
import PriorityBadge from "./PriorityBadge";
import UserAvatarStack from "./UserAvatarStack";

interface Props {
  task: Task;
  onClick?: (task: Task) => void;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(dueDate?: string, status?: string): boolean {
  if (!dueDate || status === "Done") return false;
  return new Date(dueDate) < new Date();
}

export default function TaskCard({ task, onClick }: Props) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      className="rtm-card p-3.5 cursor-pointer hover:shadow-md transition-shadow group"
      style={{
        borderLeft: task.blockers.length > 0 ? "3px solid #EF4444" : undefined,
      }}
      onClick={() => onClick?.(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(task)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className="text-sm font-semibold leading-snug group-hover:text-[var(--rtm-blue)] transition-colors line-clamp-2"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          {task.title}
        </p>
        <PriorityBadge priority={task.priority} size="sm" iconOnly />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <TaskStatusBadge status={task.status} size="sm" />
        {task.blockers.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
            style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}>
            Blocked
          </span>
        )}
      </div>

      {/* Department tag */}
      <div className="mb-3">
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)" }}
        >
          {task.department}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <UserAvatarStack users={task.assignees} size="sm" />
        {task.dueDate && (
          <span
            className="text-[11px] font-medium"
            style={{ color: overdue ? "#DC2626" : "var(--rtm-text-muted)" }}
          >
            {overdue ? "! " : ""}Due {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
