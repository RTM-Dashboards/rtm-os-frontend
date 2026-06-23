"use client";

import type { Task, TaskStatus } from "@/lib/tasks/types";
import TaskCard from "./TaskCard";

const COLUMNS: { status: TaskStatus; label: string; accent: string }[] = [
  { status: "Pending",     label: "Pending",     accent: "#94A3B8"},
  { status: "In Progress", label: "In Progress", accent: "#3B82F6"},
  { status: "In Review",   label: "In Review",   accent: "#8B5CF6"},
  { status: "Blocked",     label: "Blocked",     accent: "#EF4444"},
  { status: "Done",        label: "Done",        accent: "#10B981"},
];

interface Props {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function KanbanBoard({ tasks, onTaskClick }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]"style={{ alignItems: "flex-start"}}>
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="flex-shrink-0 flex flex-col rounded-xl overflow-hidden"style={{
              width: "280px",
              minWidth: "260px",
              background: "var(--rtm-bg)",
              border: "1px solid var(--rtm-border)",
            }}
          >
            {/* Column header */}
            <div
              className="px-4 py-3 flex items-center justify-between"style={{
                borderBottom: `2px solid ${col.accent}`,
                background: "var(--rtm-surface)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"style={{ background: col.accent }} />
                <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                  {col.label}
                </span>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"style={{ background: col.accent + "22", color: col.accent }}
              >
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2.5 p-3 flex-1">
              {colTasks.length === 0 ? (
                <div
                  className="flex items-center justify-center h-20 rounded-lg text-sm"style={{ border: "1.5px dashed var(--rtm-border)", color: "var(--rtm-text-muted)"}}
                >
                  No tasks
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
