"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("content")!;

export default function ContentTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName={workspace.name}
      tasks={getWorkspaceTasksByDepartment("Content")}
      accentColor={workspace.accentColor}
    />
  );
}
