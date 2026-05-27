"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { accountManagementTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("account-management")!;

export default function AccountManagementTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName={workspace.name}
      tasks={accountManagementTasks}
      accentColor={workspace.accentColor}
    />
  );
}
