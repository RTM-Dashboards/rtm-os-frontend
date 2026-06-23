"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { yelpTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

export default function YelpTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="Yelp"tasks={yelpTasks}
      accentColor={workspace.accentColor}
    />
  );
}
