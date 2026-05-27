"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { contentTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("content")!;

export default function ContentTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName={workspace.name}
      tasks={contentTasks}
      accentColor={workspace.accentColor}
    />
  );
}
