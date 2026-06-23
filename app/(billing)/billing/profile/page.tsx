"use client";

import { WorkspaceProfilePage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { billingProfile } from "@/lib/workspace-people";

const workspace = getWorkspace("billing")!;

export default function BillingProfilePage() {
  return (
    <WorkspaceProfilePage
      workspace={workspace}
      profile={billingProfile}
      teamRoute="/billing/team-members"rolesRoute="/billing/roles"/>
  );
}
