"use client";

import { WorkspaceRolesPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { webDevDesignRoles, webDevDesignPermissions } from "@/lib/workspace-people";

const workspace = getWorkspace("web-development-design")!;

export default function RolesPage() {
  return (
    <WorkspaceRolesPage
      workspace={workspace}
      roles={webDevDesignRoles}
      permissionAreas={webDevDesignPermissions}
      teamRoute="/web-development-design/team-members"profileRoute="/web-development-design/profile"/>
  );
}
