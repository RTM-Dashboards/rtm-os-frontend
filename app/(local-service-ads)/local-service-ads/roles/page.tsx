"use client";

import { WorkspaceRolesPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { localServiceAdsRoles, localServiceAdsPermissions } from "@/lib/workspace-people";

const workspace = getWorkspace("local-service-ads")!;

export default function RolesPage() {
  return (
    <WorkspaceRolesPage
      workspace={workspace}
      roles={localServiceAdsRoles}
      permissionAreas={localServiceAdsPermissions}
      teamRoute="/local-service-ads/team-members"
      profileRoute="/local-service-ads/profile"
    />
  );
}
