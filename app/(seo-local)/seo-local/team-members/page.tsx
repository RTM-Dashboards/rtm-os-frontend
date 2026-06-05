"use client";

import { WorkspaceTeamMembersPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { seoLocalMembers } from "@/lib/workspace-people";

const workspace = getWorkspace("seo-local")!;

export default function TeamMembersPage() {
  return (
    <WorkspaceTeamMembersPage
      workspace={workspace}
      members={seoLocalMembers}
      rolesRoute="/seo-local/roles"
      profileRoute="/seo-local/profile"
    />
  );
}
