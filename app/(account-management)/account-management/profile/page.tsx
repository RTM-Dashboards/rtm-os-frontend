"use client";

import { WorkspaceProfilePage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { accountManagementProfile } from "@/lib/workspace-people";

const workspace = getWorkspace("account-management")!;

export default function ProfilePage() {
  return (
    <WorkspaceProfilePage
      workspace={workspace}
      profile={accountManagementProfile}
      teamRoute="/account-management/team-members"
      rolesRoute="/account-management/roles"
    />
  );
}
