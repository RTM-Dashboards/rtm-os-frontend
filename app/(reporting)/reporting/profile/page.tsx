"use client";

import { WorkspaceProfilePage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { reportingProfile } from "@/lib/workspace-people";

const workspace = getWorkspace("reporting")!;

export default function ProfilePage() {
  return (
    <WorkspaceProfilePage
      workspace={workspace}
      profile={reportingProfile}
      teamRoute="/reporting/team-members"rolesRoute="/reporting/roles"/>
  );
}
