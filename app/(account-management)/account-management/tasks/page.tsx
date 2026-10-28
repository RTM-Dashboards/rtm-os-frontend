"use client";

/**
 * AM Tasks — wired to Postgres /api/tasks (Account Management department).
 * Replaced engine mock-data.ts (Jessica Reyes / Marcus Webb / Priya Nair) with
 * real task records. Keeps the WorkspaceTaskPage layout intact.
 */

import { useEffect, useState } from "react";
import WorkspaceTaskPage, {
  type WorkspaceTask,
} from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspace } from "@/lib/workspaces";
import type { TaskListItem } from "@/app/api/tasks/route";

const workspace = getWorkspace("account-management")!;

function mapToWorkspaceTask(t: TaskListItem): WorkspaceTask {
  // Map Postgres statuses → WorkspaceTaskStatus labels
  const statusMap: Record<string, WorkspaceTask["status"]> = {
    open:           "Pending",
    in_progress:    "In Progress",
    done:           "Done",
    skipped:        "Done",
    pending_prereq: "Pending",
  };

  // Map Postgres priority string → WorkspaceTaskPriority
  const priorityMap: Record<string, WorkspaceTask["priority"]> = {
    Urgent:   "Critical",
    High:     "High",
    Medium:   "Medium",
    Low:      "Low",
    Backlog:  "Low",
  };

  return {
    id:          t.id,
    title:       t.label,
    client:      t.clientId ?? "",
    project:     t.projectName ?? "",
    department:  t.department ?? "Account Management",
    service:     t.department ?? "Account Management",
    source:      "Task Blueprint",
    assignee:    t.ownerName ?? "Unassigned",
    priority:    priorityMap[t.priority ?? ""] ?? "Medium",
    dueDate:     t.dueDate ?? t.waitingOnLabel ?? "—",
    status:      statusMap[t.status] ?? "Pending",
    blocker:     t.waitingOnLabel ?? null,
  };
}

export default function AccountManagementTasksPage() {
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks?department=Account+Management")
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
