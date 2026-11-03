"use client";

/**
 * Design Tasks — wired to Postgres /api/tasks (Web Development & Design department).
 * Replaced engine mock-data.ts with real task records.
 * Keeps the WorkspaceTaskPage layout intact.
 */

import { useEffect, useState } from "react";
import WorkspaceTaskPage, {
  type WorkspaceTask,
} from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspace } from "@/lib/workspaces";
import { requireDept } from "@/lib/auth/vocab";
import type { TaskListItem } from "@/app/api/tasks/route";

const DEPT = requireDept("Web Development & Design");

const workspace = getWorkspace("web-development-design")!;

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
    department: t.department ?? DEPT,
    service:    t.department ?? DEPT,
    source:     "Task Blueprint",
    assignee:   t.ownerName ?? "Unassigned",
    priority:   priorityMap[t.priority ?? ""] ?? "Medium",
    dueDate:    t.dueDate ?? t.waitingOnLabel ?? "—",
    status:     statusMap[t.status] ?? "Pending",
    blocker:    t.waitingOnLabel ?? null,
  };
}

export default function DesignTasksPage() {
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tasks?department=${encodeURIComponent(DEPT)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { tasks: TaskListItem[] } | null) => {
        if (d?.tasks) setTasks(d.tasks.map(mapToWorkspaceTask));
      })
      .catch(() => {/* show empty */})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading tasks…</p>
      </div>
    );
  }

  return (
    <WorkspaceTaskPage
      workspaceName="Design"
      tasks={tasks}
      accentColor={workspace.accentColor}
    />
  );
}
