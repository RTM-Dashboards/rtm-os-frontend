"use client";

import { WorkspaceRolesPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { paidAdvertisingRoles, paidAdvertisingPermissions } from "@/lib/workspace-people";

const workspace = getWorkspace("paid-advertising")!;

export default function RolesPage() {
  return (
    <WorkspaceRolesPage
      workspace={workspace}
      roles={paidAdvertisingRoles}
      permissionAreas={paidAdvertisingPermissions}
      teamRoute="/paid-advertising/team-members"profileRoute="/paid-advertising/profile"/>
  );
}
