"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { salesTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("sales")!;

export default function SalesTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName={workspace.name}
      tasks={salesTasks}
      accentColor={workspace.accentColor}
    />
  );
}
