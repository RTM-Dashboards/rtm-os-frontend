import { SectionWrapper, StatusBadge, DataTable } from "@/components/ui";
import type { Column } from "@/components/ui";

export interface WorkspaceTask extends Record<string, unknown> {
  id: string;
  title: string;
  client: string;
  assignee: string;
  priority: "high"| "medium"| "low";
  status: "open"| "in-progress"| "done"| "blocked";
  due: string;
}

interface WorkspaceTaskPageProps {
  workspaceName: string;
  tasks: WorkspaceTask[];
  accentColor?: string;
}

const priorityVariant = (p: string) => {
  if (p === "high")   return "warning"as const;
  if (p === "medium") return "warning"as const;
  return               "info"as const;
};

const statusVariant = (s: string) => {
  if (s === "done")        return "success"as const;
  if (s === "in-progress") return "info"as const;
  if (s === "blocked")     return "warning"as const;
  return                          "neutral"as const;
};

const statusLabel: Record<string, string> = {
  "open":        "Open",
  "in-progress": "In Progress",
  "done":        "Done",
  "blocked":     "Blocked",
};

const columns: Column<WorkspaceTask>[] = [
  { key: "title",    header: "Task"},
  { key: "client",   header: "Client",   width: "160px"},
  { key: "assignee", header: "Assignee", width: "130px"},
  { key: "due",      header: "Due",      width: "110px"},
  {
    key: "priority",
    header: "Priority",
    width: "100px",
    render: (v) => <StatusBadge variant={priorityVariant(String(v))} label={String(v).charAt(0).toUpperCase() + String(v).slice(1)} size="sm"/>,
  },
  {
    key: "status",
    header: "Status",
    width: "130px",
    render: (v) => <StatusBadge variant={statusVariant(String(v))} label={statusLabel[String(v)] ?? String(v)} size="sm"/>,
  },
];

export default function WorkspaceTaskPage({ workspaceName, tasks, accentColor }: WorkspaceTaskPageProps) {
  const open       = tasks.filter((t) => t.status === "open").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const done       = tasks.filter((t) => t.status === "done").length;
  const blocked    = tasks.filter((t) => t.status === "blocked").length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: accentColor ?? "var(--rtm-blue)"}}
        >
          {workspaceName}
        </p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
          Tasks
        </h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
          All active tasks for {workspaceName}.
        </p>
      </div>

      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Open",        value: open,       bg: "#EFF6FF", color: "#2563EB"},
          { label: "In Progress", value: inProgress, bg: "#FFFBEB", color: "#D97706"},
          { label: "Done",        value: done,       bg: "#ECFDF5", color: "#059669"},
          { label: "Blocked",     value: blocked,    bg: "#FEF2F2", color: "#DC2626"},
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-4"style={{ background: s.bg, borderColor: `${s.color}20` }}
          >
            <p className="text-3xl font-bold"style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold mt-1"style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <SectionWrapper title={`${workspaceName} Tasks`} description={`${tasks.length} total tasks`}>
        <DataTable columns={columns} data={tasks} />
      </SectionWrapper>
    </div>
  );
}
