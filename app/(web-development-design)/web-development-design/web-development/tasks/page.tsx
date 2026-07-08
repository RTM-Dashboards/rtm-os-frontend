"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("web-development-design")!;

export default function WebDevTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="Web Development"
      tasks={getWorkspaceTasksByDepartment("Web Development")}
      accentColor={workspace.accentColor}
    />
  );
}
