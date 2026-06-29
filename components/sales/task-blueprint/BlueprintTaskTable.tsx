"use client";

import {
  BLUEPRINT_TASK_STATUS_COLORS,
  BLUEPRINT_TASK_STATUS_LABELS,
  BLUEPRINT_TASK_TYPE_LABELS,
  BLUEPRINT_PRIORITY_COLORS,
  type GeneratedTask,
} from "@/lib/sales/blueprint-config";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlueprintTaskTableProps {
  tasks: GeneratedTask[];
  assignments: Record<string, string>;
  onAssign: (taskId: string, assignedTo: string) => void;
}

// ─── Badge Component ──────────────────────────────────────────────────────────

function Badge({
  label,
  colors,
}: {
  label: string;
  colors: { bg: string; color: string; border: string };
}) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
      style={{
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
      }}
    >
      {label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlueprintTaskTable({
  tasks,
  assignments,
  onAssign,
}: BlueprintTaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div
        className="py-8 text-center text-sm"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        No tasks in this blueprint.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[800px]">
        <thead
          style={{
            background: "var(--rtm-bg)",
            borderBottom: "2px solid var(--rtm-border)",
          }}
        >
          <tr>
            {[
              "Task Name",
              "Type",
              "Priority",
              "Est. Hours",
              "Due Date",
              "Assigned To",
              "Recurring",
              "Status",
            ].map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-wide whitespace-nowrap"
                style={{ color: "var(--rtm-text-secondary)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, idx) => {
            const priorityColors = BLUEPRINT_PRIORITY_COLORS[task.priority];
            const statusColors = BLUEPRINT_TASK_STATUS_COLORS[task.status];
            const currentAssignment = assignments[task.id] ?? task.assignedTo ?? "";

            return (
              <tr
                key={task.id}
                style={{
                  borderBottom:
                    idx < tasks.length - 1
                      ? "1px solid var(--rtm-border-light)"
                      : undefined,
                  background:
                    task.priority === "critical"
                      ? "rgba(254,242,242,0.3)"
                      : undefined,
                }}
              >
                {/* Task Name */}
                <td className="px-3 py-2.5">
                  <div
                    className="font-semibold text-sm"
                    style={{ color: "var(--rtm-text-primary)" }}
                  >
                    {task.name}
                  </div>
                  {task.description && (
                    <div
                      className="text-xs mt-0.5 max-w-[260px] truncate"
                      style={{ color: "var(--rtm-text-muted)" }}
                      title={task.description}
                    >
                      {task.description}
                    </div>
                  )}
                </td>

                {/* Type */}
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
                    style={{
                      background: "var(--rtm-bg)",
                      color: "var(--rtm-text-secondary)",
                      border: "1px solid var(--rtm-border)",
                    }}
                  >
                    {BLUEPRINT_TASK_TYPE_LABELS[task.type]}
                  </span>
                </td>

                {/* Priority */}
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <Badge
                    label={
                      task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)
                    }
                    colors={priorityColors}
                  />
                </td>

                {/* Est Hours */}
                <td
                  className="px-3 py-2.5 whitespace-nowrap font-semibold text-sm"
                  style={{ color: "var(--rtm-text-primary)" }}
                >
                  {task.estimatedHours}h
                </td>

                {/* Due Date */}
                <td
                  className="px-3 py-2.5 whitespace-nowrap text-sm"
                  style={{ color: "var(--rtm-text-secondary)" }}
                >
                  {task.dueDate}
                </td>

                {/* Assigned To */}
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <input
                    type="text"
                    value={currentAssignment}
                    placeholder={task.assignedRole}
                    onChange={(e) => onAssign(task.id, e.target.value)}
                    className="w-36 px-2 py-1 rounded text-xs outline-none"
                    style={{
                      background: "var(--rtm-bg)",
                      border: `1px solid ${
                        currentAssignment
                          ? "var(--rtm-blue)"
                          : "var(--rtm-border)"
                      }`,
                      color: "var(--rtm-text-primary)",
                    }}
                  />
                </td>

                {/* Recurring */}
                <td
                  className="px-3 py-2.5 whitespace-nowrap text-sm"
                  style={{
                    color: task.recurring
                      ? "var(--rtm-blue)"
                      : "var(--rtm-text-muted)",
                  }}
                >
                  {task.recurring
                    ? `Yes${task.recurringInterval ? ` / ${task.recurringInterval}` : ""}`
                    : "No"}
                </td>

                {/* Status */}
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <Badge
                    label={BLUEPRINT_TASK_STATUS_LABELS[task.status]}
                    colors={statusColors}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
