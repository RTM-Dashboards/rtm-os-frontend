"use client";

import { useState } from "react";
import type { Deliverable, Task } from "@/lib/tasks/types";
import TaskStatusBadge from "./TaskStatusBadge";
import PriorityBadge from "./PriorityBadge";
import UserAvatarStack from "./UserAvatarStack";

interface Props {
  deliverable: Deliverable;
  onTaskClick?: (task: Task) => void;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function taskProgress(tasks: Task[]): number {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((t) => t.status === "Done").length / tasks.length) * 100);
}

export default function DeliverableCard({ deliverable, onTaskClick }: Props) {
  const [expanded, setExpanded] = useState(true);
  const progress = taskProgress(deliverable.tasks);
  const hasBlockers = deliverable.blockers.length > 0 || deliverable.tasks.some((t) => t.blockers.length > 0);

  return (
    <div
      className="rtm-card overflow-hidden"
      style={{ borderLeft: hasBlockers ? "3px solid #EF4444" : undefined }}
    >
      {/* Deliverable header */}
      <div
        className="px-5 py-4 cursor-pointer"
        style={{ borderBottom: expanded ? "1px solid var(--rtm-border-light)" : "none" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start gap-3">
          {/* Expand toggle */}
          <button
            className="mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-transform"
            style={{
              background: "var(--rtm-blue-light)",
              color: "var(--rtm-blue)",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
            aria-label="Toggle"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                {deliverable.title}
              </h3>
              <TaskStatusBadge status={deliverable.status} size="sm" />
              <PriorityBadge priority={deliverable.priority} size="sm" />
              {hasBlockers && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                  🚫 Blocked
                </span>
              )}
            </div>

            {deliverable.description && (
              <p className="text-sm mb-2 line-clamp-1" style={{ color: "var(--rtm-text-secondary)" }}>
                {deliverable.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)" }}>
                {deliverable.department}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Owner:</span>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: deliverable.owner.avatarColor }}
                  title={deliverable.owner.name}
                >
                  {deliverable.owner.initials}
                </span>
                <span className="text-xs font-medium" style={{ color: "var(--rtm-text-secondary)" }}>
                  {deliverable.owner.name}
                </span>
              </div>
              {deliverable.assignees.length > 0 && (
                <UserAvatarStack users={deliverable.assignees} size="sm" max={4} />
              )}
              {deliverable.dueDate && (
                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  Due {formatDate(deliverable.dueDate)}
                </span>
              )}
            </div>
          </div>

          {/* Progress + task count */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1 min-w-[80px]">
            <span className="text-xs font-bold" style={{ color: progress === 100 ? "#059669" : "var(--rtm-blue)" }}>
              {progress}%
            </span>
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--rtm-border)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: progress === 100 ? "#10B981" : "var(--rtm-blue)",
                }}
              />
            </div>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
              {deliverable.tasks.filter((t) => t.status === "Done").length}/{deliverable.tasks.length} tasks
            </span>
          </div>
        </div>
      </div>

      {/* Deliverable blocker notes */}
      {expanded && deliverable.blockers.length > 0 && (
        <div className="px-5 py-3" style={{ background: "#FEF2F2", borderBottom: "1px solid #FECACA" }}>
          {deliverable.blockers.map((b) => (
            <p key={b.id} className="text-xs font-medium" style={{ color: "#DC2626" }}>
              🚫 {b.description}
            </p>
          ))}
        </div>
      )}

      {/* Internal notes */}
      {expanded && deliverable.notes.length > 0 && (
        <div className="px-5 py-3 space-y-1.5" style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)" }}>
          {deliverable.notes.map((note) => (
            <div key={note.id} className="flex gap-2 text-xs">
              <span className="font-semibold" style={{ color: "var(--rtm-blue)" }}>{note.authorName}:</span>
              <span style={{ color: "var(--rtm-text-secondary)" }}>{note.body}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tasks sub-list */}
      {expanded && deliverable.tasks.length > 0 && (
        <div className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
          {deliverable.tasks.map((task) => {
            const overdue = task.dueDate && task.status !== "Done" && new Date(task.dueDate) < new Date();
            return (
              <div
                key={task.id}
                className="px-5 py-3 flex flex-wrap items-center gap-3 cursor-pointer transition-colors"
                style={{ paddingLeft: "52px" }}
                onClick={() => onTaskClick?.(task)}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--rtm-blue-xlight)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                {/* Status dot */}
                <TaskStatusBadge status={task.status} size="sm" />
                <PriorityBadge priority={task.priority} size="sm" iconOnly />

                <span className="flex-1 min-w-0 text-sm font-medium leading-snug truncate"
                  style={{ color: "var(--rtm-text-primary)" }}>
                  {task.blockers.length > 0 && <span className="mr-1">🚫</span>}
                  {task.title}
                </span>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs hidden sm:block" style={{ color: "var(--rtm-text-muted)" }}>
                    {task.department}
                  </span>
                  <UserAvatarStack users={task.assignees} size="sm" max={2} />
                  {task.dueDate && (
                    <span
                      className="text-xs whitespace-nowrap"
                      style={{ color: overdue ? "#DC2626" : "var(--rtm-text-muted)" }}
                    >
                      {overdue ? "⚠ " : ""}Due {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
