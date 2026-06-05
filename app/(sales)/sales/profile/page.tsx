"use client";

import { WorkspaceProfilePage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { salesProfile } from "@/lib/workspace-people";

const workspace = getWorkspace("sales")!;

export default function SalesProfilePage() {
  return (
    <WorkspaceProfilePage
      workspace={workspace}
      profile={salesProfile}
      teamRoute="/sales/team-members"
      rolesRoute="/sales/roles"
    />
  );
}
