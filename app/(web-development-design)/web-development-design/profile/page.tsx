"use client";

import { WorkspaceProfilePage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { webDevDesignProfile } from "@/lib/workspace-people";

const workspace = getWorkspace("web-development-design")!;

export default function ProfilePage() {
  return (
    <WorkspaceProfilePage
      workspace={workspace}
      profile={webDevDesignProfile}
      teamRoute="/web-development-design/team-members"
      rolesRoute="/web-development-design/roles"
    />
  );
}
