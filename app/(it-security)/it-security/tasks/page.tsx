"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("it-security")!;

export default function ItSecurityTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName={workspace.name}
      tasks={getWorkspaceTasksByDepartment("IT & Security")}
      accentColor={workspace.accentColor}
    />
  );
}
