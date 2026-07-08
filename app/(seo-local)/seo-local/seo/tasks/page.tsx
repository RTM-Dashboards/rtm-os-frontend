"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

export default function SeoTasksPage() {
  return (
    <WorkspaceTaskPage
      workspaceName="SEO"
      tasks={getWorkspaceTasksByDepartment("SEO")}
      accentColor={workspace.accentColor}
    />
  );
}
