"use client";

import { WorkspaceRolesPage } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { billingRoles, billingPermissions } from "@/lib/workspace-people";

const workspace = getWorkspace("billing")!;

export default function BillingRolesPage() {
  return (
    <WorkspaceRolesPage
      workspace={workspace}
      roles={billingRoles}
      permissionAreas={billingPermissions}
      teamRoute="/billing/team-members"profileRoute="/billing/profile"/>
  );
}
