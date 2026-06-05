"use client";

import { WorkspaceTeamMembersPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { paidAdvertisingMembers } from "@/lib/workspace-people";

const workspace = getWorkspace("paid-advertising")!;

export default function TeamMembersPage() {
  return (
    <WorkspaceTeamMembersPage
      workspace={workspace}
      members={paidAdvertisingMembers}
      rolesRoute="/paid-advertising/roles"
      profileRoute="/paid-advertising/profile"
    />
  );
}
