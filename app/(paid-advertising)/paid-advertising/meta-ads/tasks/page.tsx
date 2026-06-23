"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { metaAdsTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("paid-advertising")!;

export default function MetaAdsTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="Meta Ads"tasks={metaAdsTasks}
      accentColor={workspace.accentColor}
    />
  );
}
