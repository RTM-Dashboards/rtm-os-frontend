"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("paid-advertising")!;

export default function GoogleAdsTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="Google Ads"
      tasks={getWorkspaceTasksByDepartment("PPC")}
      accentColor={workspace.accentColor}
    />
  );
}
