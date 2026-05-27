"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { billingTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

export default function BillingTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName={workspace.name}
      tasks={billingTasks}
      accentColor={workspace.accentColor}
    />
  );
}
