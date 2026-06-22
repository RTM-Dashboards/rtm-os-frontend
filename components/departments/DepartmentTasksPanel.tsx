"use client";

// ── Department Tasks Panel ────────────────────────────────────────────────────
// Displays assigned tasks, task blueprints, overdue, and upcoming tasks.

import { SectionWrapper, StatusBadge } from "@/components/ui";

type TaskStatus = "open" | "in-progress" | "overdue" | "completed" | "blocked";
type TaskPriority = "critical" | "high" | "medium" | "low";

interface DepartmentTask {
  id: string;
  title: string;
  client: string;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  blueprint?: string;
  dueDate: string;
}

const MOCK_TASKS: DepartmentTask[] = [
  { id: "t-1", title: "Monthly deliverable — Apex Roofing",   client: "Apex Roofing",   assignee: "Alex R.",   status: "in-progress", priority: "high",     blueprint: "Monthly Delivery",    dueDate: "Jun 7"  },
  { id: "t-2", title: "Technical SEO audit — Pacific Dental", client: "Pacific Dental", assignee: "Chris D.",  status: "open",        priority: "medium",   blueprint: "Technical SEO Audit", dueDate: "Jun 10" },
  { id: "t-3", title: "Monthly report — Summit Landscaping",  client: "Summit",         assignee: "Jordan M.", status: "overdue",     priority: "critical", blueprint: "Monthly Delivery",    dueDate: "May 30" },
  { id: "t-4", title: "GBP optimization — Harbor Auto",       client: "Harbor Auto",    assignee: "Lisa P.",   status: "in-progress", priority: "medium",   blueprint: undefined,             dueDate: "Jun 12" },
  { id: "t-5", title: "Campaign setup — Metro Dental",        client: "Metro Dental",   assignee: "Mike T.",   status: "blocked",     priority: "high",     blueprint: "Campaign Launch",     dueDate: "Jun 9"  },
];

const STATUS_MAP: Record<TaskStatus, { variant: "success" | "warning" | "error" | "info" | "pending" | "neutral"; label: string }> = {
  open:        { variant: "neutral", label: "Open"        },
  "in-progress":{ variant: "info",   label: "In Progress" },
  overdue:     { variant: "error",   label: "Overdue"     },
  completed:   { variant: "success", label: "Completed"   },
  blocked:     { variant: "warning", label: "Blocked"     },
};

const PRIORITY_STYLE: Record<TaskPriority, { color: string; bg: string }> = {
  critical: { color: "#DC2626", bg: "#FEF2F2" },
  high:     { color: "#D97706", bg: "#FFFBEB" },
  medium:   { color: "#2563EB", bg: "#EFF6FF" },
  low:      { color: "#64748B", bg: "#F8FAFC" },
};

interface Props {
  accentColor: string;
  disabled?: boolean;
}

export default function DepartmentTasksPanel({ accentColor, disabled }: Props) {
  if (disabled) {
    return (
      <SectionWrapper title="Tasks" description="Assigned tasks and task blueprints">
        <div
          className="rounded-lg border p-6 text-center text-sm"
          style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-muted)", background: "var(--rtm-bg)" }}
        >
          Tasks module is disabled for this department.
        </div>
      </SectionWrapper>
    );
  }

  const overdue  = MOCK_TASKS.filter((t) => t.status === "overdue");
  const upcoming = MOCK_TASKS.filter((t) => t.status === "open" || t.status === "in-progress");

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            { label: "Assigned Tasks",  value: MOCK_TASKS.length,                              color: accentColor,  bg: `${accentColor}12` },
            { label: "In Progress",     value: MOCK_TASKS.filter((t) => t.status === "in-progress").length, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Overdue",         value: overdue.length,                                 color: "#DC2626",    bg: "#FEF2F2"    },
            { label: "Upcoming",        value: upcoming.length,                                color: "#D97706",    bg: "#FFFBEB"    },
          ] as { label: string; value: number; color: string; bg: string }[]
        ).map((s) => (
          <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: s.bg, borderColor: "var(--rtm-border-light)" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tasks table */}
      <SectionWrapper
        title="Task Queue"
        description="All assigned tasks"
        noPadding
        actions={
          <a className="text-xs font-medium hover:underline" href="#" style={{ color: accentColor }}>
            View all tasks
          </a>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                {["Task", "Client", "Assignee", "Priority", "Status", "Blueprint", "Due"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_TASKS.map((task) => {
                const st = STATUS_MAP[task.status];
                const pr = PRIORITY_STYLE[task.priority];
                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/50 transition-colors"
                    style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
                  >
                    <td className="py-2.5 px-3 font-semibold" style={{ color: "var(--rtm-text-primary)", maxWidth: "240px" }}>
                      <span className="line-clamp-1">{task.title}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                      {task.client}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                      {task.assignee}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                        style={{ background: pr.bg, color: pr.color }}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge variant={st.variant} label={st.label} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>
                      {task.blueprint ?? "—"}
                    </td>
                    <td
                      className="py-2.5 px-3 whitespace-nowrap font-medium"
                      style={{ color: task.status === "overdue" ? "#DC2626" : "var(--rtm-text-secondary)" }}
                    >
                      {task.dueDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionWrapper>
    </div>
  );
}
