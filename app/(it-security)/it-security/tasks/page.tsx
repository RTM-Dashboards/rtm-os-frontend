"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { itSecurityTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("it-security")!;

export default function ItSecurityTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName={workspace.name}
      tasks={itSecurityTasks}
      accentColor={workspace.accentColor}
    />
  );
}
