"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { webDevTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("web-development-design")!;

export default function WebDevTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="Web Development"
      tasks={webDevTasks}
      accentColor={workspace.accentColor}
    />
  );
}
