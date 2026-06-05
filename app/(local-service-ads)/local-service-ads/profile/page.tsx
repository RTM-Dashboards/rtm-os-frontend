"use client";

import { WorkspaceProfilePage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { localServiceAdsProfile } from "@/lib/workspace-people";

const workspace = getWorkspace("local-service-ads")!;

export default function ProfilePage() {
  return (
    <WorkspaceProfilePage
      workspace={workspace}
      profile={localServiceAdsProfile}
      teamRoute="/local-service-ads/team-members"
      rolesRoute="/local-service-ads/roles"
    />
  );
}
