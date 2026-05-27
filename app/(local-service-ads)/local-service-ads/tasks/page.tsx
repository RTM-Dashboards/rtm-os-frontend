"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { localServiceAdsTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("local-service-ads")!;

export default function LsaTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName={workspace.name}
      tasks={localServiceAdsTasks}
      accentColor={workspace.accentColor}
    />
  );
}
