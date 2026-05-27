"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { googleAdsTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("paid-advertising")!;

export default function GoogleAdsTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="Google Ads"
      tasks={googleAdsTasks}
      accentColor={workspace.accentColor}
    />
  );
}
