"use client";

import { WorkspaceProfilePage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { seoLocalProfile } from "@/lib/workspace-people";

const workspace = getWorkspace("seo-local")!;

export default function ProfilePage() {
  return (
    <WorkspaceProfilePage
      workspace={workspace}
      profile={seoLocalProfile}
      teamRoute="/seo-local/team-members"
      rolesRoute="/seo-local/roles"
    />
  );
}
