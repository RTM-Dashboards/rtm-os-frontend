"use client";

import { WorkspaceRolesPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { salesRoles, salesPermissions } from "@/lib/workspace-people";

const workspace = getWorkspace("sales")!;

export default function SalesRolesPage() {
  return (
    <WorkspaceRolesPage
      workspace={workspace}
      roles={salesRoles}
      permissionAreas={salesPermissions}
      teamRoute="/sales/team-members"profileRoute="/sales/profile"/>
  );
}
