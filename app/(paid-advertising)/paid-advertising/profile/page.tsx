"use client";

import { WorkspaceProfilePage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { paidAdvertisingProfile } from "@/lib/workspace-people";

const workspace = getWorkspace("paid-advertising")!;

export default function ProfilePage() {
  return (
    <WorkspaceProfilePage
      workspace={workspace}
      profile={paidAdvertisingProfile}
      teamRoute="/paid-advertising/team-members"rolesRoute="/paid-advertising/roles"/>
  );
}
