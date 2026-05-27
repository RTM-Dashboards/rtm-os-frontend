"use client";

import { StatusBadge, SectionWrapper } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";
import type { CrossDeptTask, CrossDeptTaskStatus } from "@/lib/am-data";

interface Props {
  tasks: CrossDeptTask[];
}

function taskStatusVariant(s: CrossDeptTaskStatus): StatusVariant {
  switch (s) {
    case "On Track":  return "success";
    case "At Risk":   return "warning";
    case "Overdue":   return "error";
    case "Blocked":   return "error";
    case "Complete":  return "neutral";
  }
}

export default function CrossDeptTaskTable({ tasks }: Props) {
  const overdue  = tasks.filter((t) => t.status === "Overdue").length;
  const blocked  = tasks.filter((t) => t.status === "Blocked").length;
  const onTrack  = tasks.filter((t) => t.status === "On Track").length;

  return (
    <SectionWrapper
      title="Cross-Department Task Oversight"
      description="Tasks with cross-team dependencies requiring AM coordination"
      actions={
        <div className="flex items-center gap-3 text-xs">
          {overdue > 0 && (
            <span className="font-semibold" style={{ color: "#DC2626" }}>
              {overdue} overdue
            </span>
          )}
          {blocked > 0 && (
            <span className="font-semibold" style={{ color: "#D97706" }}>
              {blocked} blocked
            </span>
          )}
          <span style={{ color: "#059669" }}>{onTrack} on track</span>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
              {["Client", "Task", "Owner Dept", "Depends On", "Assigned To", "Due", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
              >
                <td className="px-3 py-3 whitespace-nowrap text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                  {task.clientName}
                </td>
                <td className="px-3 py-3 min-w-[180px]">
                  <p className="text-xs font-medium" style={{ color: "var(--rtm-text-secondary)" }}>
                    {task.taskName}
                  </p>
                  {task.blockerNote && (
                    <p className="text-[11px] mt-0.5 italic" style={{ color: "#D97706" }}>
                      ⚠ {task.blockerNote}
                    </p>
                  )}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  {task.ownerDept}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  {task.dependsOn}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  {task.assignedTo}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  {task.dueDate}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <StatusBadge variant={taskStatusVariant(task.status)} label={task.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
