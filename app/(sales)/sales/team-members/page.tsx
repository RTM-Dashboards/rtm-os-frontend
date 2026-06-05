"use client";

import { WorkspaceTeamMembersPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { salesMembers } from "@/lib/workspace-people";

const workspace = getWorkspace("sales")!;

export default function SalesTeamMembersPage() {
  return (
    <WorkspaceTeamMembersPage
      workspace={workspace}
      members={salesMembers}
      rolesRoute="/sales/roles"
      profileRoute="/sales/profile"
    />
  );
}
