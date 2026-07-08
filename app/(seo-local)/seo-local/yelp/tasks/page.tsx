"use client";

import WorkspaceTaskPage from "@/components/workspace/WorkspaceTaskPage";
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

export default function YelpTasksPage() {
  // Yelp tasks are stored under the SEO department with service="Yelp"
  // getWorkspaceTasksByDepartment("SEO") returns all SEO tasks including Yelp.
  // Filter to only Yelp service tasks for this workspace view.
  const yelpTasks = getWorkspaceTasksByDepartment("SEO").filter(
    (t) => t.service === "Yelp"
  );
  return (
    <WorkspaceTaskPage
      workspaceName="Yelp"
      tasks={yelpTasks}
      accentColor={workspace.accentColor}
    />
  );
}
