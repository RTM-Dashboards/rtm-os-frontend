"use client";

import { WorkspaceTeamMembersPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { reportingMembers } from "@/lib/workspace-people";

const workspace = getWorkspace("reporting")!;

export default function TeamMembersPage() {
  return (
    <WorkspaceTeamMembersPage
      workspace={workspace}
      members={reportingMembers}
      rolesRoute="/reporting/roles"profileRoute="/reporting/profile"/>
  );
}
