"use client";

import { WorkspaceRolesPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import {
  accountManagementRoles,
  accountManagementPermissions,
} from "@/lib/workspace-people";

const workspace = getWorkspace("account-management")!;

export default function RolesPage() {
  return (
    <WorkspaceRolesPage
      workspace={workspace}
      roles={accountManagementRoles}
      permissionAreas={accountManagementPermissions}
      teamRoute="/account-management/team-members"profileRoute="/account-management/profile"/>
  );
}
