"use client";

import { WorkspaceTeamMembersPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { webDevDesignMembers } from "@/lib/workspace-people";

const workspace = getWorkspace("web-development-design")!;

export default function TeamMembersPage() {
  return (
    <WorkspaceTeamMembersPage
      workspace={workspace}
      members={webDevDesignMembers}
      rolesRoute="/web-development-design/roles"
      profileRoute="/web-development-design/profile"
    />
  );
}
