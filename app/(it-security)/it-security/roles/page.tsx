"use client";

import { WorkspaceRolesPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { itSecurityRoles, itSecurityPermissions } from "@/lib/workspace-people";

const workspace = getWorkspace("it-security")!;

export default function RolesPage() {
  return (
    <WorkspaceRolesPage
      workspace={workspace}
      roles={itSecurityRoles}
      permissionAreas={itSecurityPermissions}
      teamRoute="/it-security/team-members"profileRoute="/it-security/profile"/>
  );
}
