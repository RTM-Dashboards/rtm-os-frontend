"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("paid-advertising")!;

export default function MetaAdsTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="Meta Ads"
      tasks={getWorkspaceTasksByDepartment("Meta Ads")}
      accentColor={workspace.accentColor}
    />
  );
}
