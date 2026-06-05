"use client";

import { WorkspaceTeamMembersPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { accountManagementMembers } from "@/lib/workspace-people";

const workspace = getWorkspace("account-management")!;

export default function TeamMembersPage() {
  return (
    <WorkspaceTeamMembersPage
      workspace={workspace}
      members={accountManagementMembers}
      rolesRoute="/account-management/roles"
      profileRoute="/account-management/profile"
    />
  );
}
