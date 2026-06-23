"use client";

import { WorkspaceTeamMembersPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { billingMembers } from "@/lib/workspace-people";

const workspace = getWorkspace("billing")!;

export default function BillingTeamMembersPage() {
  return (
    <WorkspaceTeamMembersPage
      workspace={workspace}
      members={billingMembers}
      rolesRoute="/billing/roles"profileRoute="/billing/profile"/>
  );
}
