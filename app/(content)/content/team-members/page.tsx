"use client";

import { WorkspaceTeamMembersPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { contentMembers } from "@/lib/workspace-people";

const workspace = getWorkspace("content")!;

export default function TeamMembersPage() {
  return (
    <WorkspaceTeamMembersPage
      workspace={workspace}
      members={contentMembers}
      rolesRoute="/content/roles"profileRoute="/content/profile"/>
  );
}
