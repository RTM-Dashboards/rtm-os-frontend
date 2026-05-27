"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { seoTasks } from "@/lib/mock/workspace-tasks";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

export default function SeoTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="SEO"
      tasks={seoTasks}
      accentColor={workspace.accentColor}
    />
  );
}
