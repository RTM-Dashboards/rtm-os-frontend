"use client";

import type { Task } from "@/lib/tasks/types";
import TaskStatusBadge from "./TaskStatusBadge";
import PriorityBadge from "./PriorityBadge";
import UserAvatarStack from "./UserAvatarStack";

interface Props {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function isOverdue(dueDate?: string, status?: string): boolean {
  if (!dueDate || status === "Done") return false;
  return new Date(dueDate) < new Date();
}

export default function TaskTable({ tasks, onTaskClick }: Props) {
  if (tasks.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-xl"
        style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
      >
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--rtm-text-muted)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm font-medium" style={{ color: "var(--rtm-text-muted)" }}>No tasks match your filters</p>
      </div>
    );
  }

  return (
    <div className="rtm-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--rtm-border)", background: "var(--rtm-bg)" }}>
              {["Task", "Status", "Priority", "Department", "Assignees", "Start", "Due", "Blockers"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--rtm-text-muted)", whiteSpace: "nowrap" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => {
              const overdue = isOverdue(task.dueDate, task.status);
              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: "1px solid var(--rtm-border-light)",
                    background: i % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-bg)",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-blue-xlight)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-bg)")}
                >
                  {/* Task title */}
                  <td className="px-4 py-3 min-w-[200px] max-w-[320px]">
                    <div className="flex items-start gap-2">
                      {task.blockers.length > 0 && (
                        <span className="flex-shrink-0 mt-0.5 text-[10px] font-bold px-1 rounded" style={{background:"#FEE2E2",color:"#DC2626"}} title="Has blockers">BLK</span>
                      )}
                      <span className="font-medium leading-snug" style={{ color: "var(--rtm-text-primary)" }}>
                        {task.title}
                      </span>
                    </div>
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <TaskStatusBadge status={task.status} size="sm" />
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PriorityBadge priority={task.priority} size="sm" />
                  </td>

                  {/* Department */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-medium" style={{ color: "var(--rtm-text-secondary)" }}>
                      {task.department}
                    </span>
                  </td>

                  {/* Assignees */}
                  <td className="px-4 py-3">
                    <UserAvatarStack users={task.assignees} size="sm" max={3} />
                  </td>

                  {/* Start date */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                      {formatDate(task.startDate)}
                    </span>
                  </td>

                  {/* Due date */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-medium" style={{ color: overdue ? "#DC2626" : "var(--rtm-text-muted)" }}>
                      {overdue && "! "}{formatDate(task.dueDate)}
                    </span>
                  </td>

                  {/* Blockers */}
                  <td className="px-4 py-3 text-center">
                    {task.blockers.length > 0 ? (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ background: "#FEF2F2", color: "#DC2626" }}>
                        {task.blockers.length}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
