"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function UsersPage() {
  return (
    <ConfigPlaceholder
      title="Users"
      breadcrumb={["Organization", "Users"]}
      description="User accounts, status, and role assignments across the platform."
      purpose="Defines who can access the platform and what they can do. User records are the anchor for role assignment, department membership, task ownership, and audit trails."
      status="partial"
      fields={[
        { key: "display_name",    type: "text",     label: "Display Name" },
        { key: "email",           type: "text",     label: "Email Address" },
        { key: "role_id",         type: "select",   label: "Role",               description: "Assigned role from Roles & Permissions." },
        { key: "department_ids",  type: "multiselect", label: "Departments",     description: "Departments this user belongs to." },
        { key: "status",          type: "select",   label: "Account Status",     description: "Active, Inactive, or Pending." },
        { key: "two_fa_required", type: "toggle",   label: "Require 2FA" },
        { key: "invited_at",      type: "text",     label: "Invitation Date" },
        { key: "last_login",      type: "text",     label: "Last Login" },
      ]}
      consumedBy={["All Workspaces", "Task Assignment", "Audit Logs", "Notifications"]}
      relatedSections={[
        { label: "Roles & Permissions", href: "/settings/roles" },
        { label: "Departments",         href: "/settings/departments" },
      ]}
    />
  );
}
