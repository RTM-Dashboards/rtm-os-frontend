"use client";

import { WorkspaceTeamMembersPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { localServiceAdsMembers } from "@/lib/workspace-people";

const workspace = getWorkspace("local-service-ads")!;

export default function TeamMembersPage() {
  return (
    <WorkspaceTeamMembersPage
      workspace={workspace}
      members={localServiceAdsMembers}
      rolesRoute="/local-service-ads/roles"
      profileRoute="/local-service-ads/profile"
    />
  );
}
