"use client";

import { WorkspaceProfilePage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { itSecurityProfile } from "@/lib/workspace-people";

const workspace = getWorkspace("it-security")!;

export default function ProfilePage() {
  return (
    <WorkspaceProfilePage
      workspace={workspace}
      profile={itSecurityProfile}
      teamRoute="/it-security/team-members"rolesRoute="/it-security/roles"/>
  );
}
