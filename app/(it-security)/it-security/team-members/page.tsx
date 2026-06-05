"use client";

import { WorkspaceTeamMembersPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { itSecurityMembers } from "@/lib/workspace-people";

const workspace = getWorkspace("it-security")!;

export default function TeamMembersPage() {
  return (
    <WorkspaceTeamMembersPage
      workspace={workspace}
      members={itSecurityMembers}
      rolesRoute="/it-security/roles"
      profileRoute="/it-security/profile"
    />
  );
}
