"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("local-service-ads")!;

export default function LsaTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName={workspace.name}
      tasks={getWorkspaceTasksByDepartment("LSA")}
      accentColor={workspace.accentColor}
    />
  );
}
