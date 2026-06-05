"use client";

import { WorkspaceRolesPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { contentRoles, contentPermissions } from "@/lib/workspace-people";

const workspace = getWorkspace("content")!;

export default function RolesPage() {
  return (
    <WorkspaceRolesPage
      workspace={workspace}
      roles={contentRoles}
      permissionAreas={contentPermissions}
      teamRoute="/content/team-members"
      profileRoute="/content/profile"
    />
  );
}
