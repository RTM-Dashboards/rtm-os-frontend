"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { gbpTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

export default function GbpTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="GBP"
      tasks={gbpTasks}
      accentColor={workspace.accentColor}
    />
  );
}
