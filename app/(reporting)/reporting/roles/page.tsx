"use client";

import { WorkspaceRolesPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { reportingRoles, reportingPermissions } from "@/lib/workspace-people";

const workspace = getWorkspace("reporting")!;

export default function RolesPage() {
  return (
    <WorkspaceRolesPage
      workspace={workspace}
      roles={reportingRoles}
      permissionAreas={reportingPermissions}
      teamRoute="/reporting/team-members"
      profileRoute="/reporting/profile"
    />
  );
}
