"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("web-development-design")!;

export default function DesignTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="Design"
      tasks={getWorkspaceTasksByDepartment("Design")}
      accentColor={workspace.accentColor}
    />
  );
}
