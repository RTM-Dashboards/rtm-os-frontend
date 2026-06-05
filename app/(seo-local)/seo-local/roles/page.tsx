"use client";

import { WorkspaceRolesPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { seoLocalRoles, seoLocalPermissions } from "@/lib/workspace-people";

const workspace = getWorkspace("seo-local")!;

export default function RolesPage() {
  return (
    <WorkspaceRolesPage
      workspace={workspace}
      roles={seoLocalRoles}
      permissionAreas={seoLocalPermissions}
      teamRoute="/seo-local/team-members"
      profileRoute="/seo-local/profile"
    />
  );
}
