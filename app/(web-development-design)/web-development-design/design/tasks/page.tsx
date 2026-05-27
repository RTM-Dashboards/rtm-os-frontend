"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { designTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("web-development-design")!;

export default function DesignTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="Design"
      tasks={designTasks}
      accentColor={workspace.accentColor}
    />
  );
}
