"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { reportingTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("reporting")!;

export default function ReportingTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName={workspace.name}
      tasks={reportingTasks}
      accentColor={workspace.accentColor}
    />
  );
}
