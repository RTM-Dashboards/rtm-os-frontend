"use client";

/**
 * Billing Tasks — wired to Postgres /api/tasks (Billing department).
 * Replaced engine mock-data.ts seed with real task records.
 * Keeps the WorkspaceTaskPage layout intact.
 */

import { useEffect, useState } from "react";
import WorkspaceTaskPage, {
  type WorkspaceTask,
} from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspace } from "@/lib/workspaces";
import type { TaskListItem } from "@/app/api/tasks/route";

const workspace = getWorkspace("billing")!;

function mapToWorkspaceTask(t: TaskListItem): WorkspaceTask {
  const statusMap: Record<string, WorkspaceTask["status"]> = {
    open:           "Pending",
    in_progress:    "In Progress",
    done:           "Done",
    skipped:        "Done",
    pending_prereq: "Pending",
  };

  const priorityMap: Record<string, WorkspaceTask["priority"]> = {
    Urgent:  "Critical",
    High:    "High",
    Medium:  "Medium",
    Low:     "Low",
    Backlog: "Low",
  };

  return {
    id:         t.id,
    title:      t.label,
    client:     t.clientId ?? "",
    project:    t.projectName ?? "",
    department: t.department ?? "Billing",
    service:    t.department ?? "Billing",
    source:     "Task Blueprint",
    assignee:   t.ownerName ?? "Unassigned",
    priority:   priorityMap[t.priority ?? ""] ?? "Medium",
    dueDate:    t.dueDate ?? t.waitingOnLabel ?? "—",
    status:     statusMap[t.status] ?? "Pending",
    blocker:    t.waitingOnLabel ?? null,
  };
}

export default function BillingTasksPage() {
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks?department=Billing")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { tasks: TaskListItem[] } | null) => {
        if (d?.tasks) setTasks(d.tasks.map(mapToWorkspaceTask));
      })
      .catch(() => {/* non-fatal — empty state shows */})
      .finally(() => setLoading(false));
  }, []);

  return (
    <WorkspaceTaskPage
      workspaceName={workspace.name}
      tasks={tasks}
      accentColor={workspace.accentColor}
    />
  );
}
