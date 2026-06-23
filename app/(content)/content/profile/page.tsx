"use client";

import { WorkspaceProfilePage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { contentProfile } from "@/lib/workspace-people";

const workspace = getWorkspace("content")!;

export default function ProfilePage() {
  return (
    <WorkspaceProfilePage
      workspace={workspace}
      profile={contentProfile}
      teamRoute="/content/team-members"rolesRoute="/content/roles"/>
  );
}
