"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

export default function GbpTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="GBP"
      tasks={getWorkspaceTasksByDepartment("GBP")}
      accentColor={workspace.accentColor}
    />
  );
}
