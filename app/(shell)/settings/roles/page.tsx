"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function RolesPage() {
  return (
    <ConfigPlaceholder
      title="Roles & Permissions"
      breadcrumb={["Organization", "Roles & Permissions"]}
      description="Define role types, permission scopes, and access levels across all platform modules."
      purpose="Roles are the access control layer for all platform functionality. Each user is assigned a role. Roles define what sections, actions, and data a user can view, create, edit, or approve."
      status="partial"
      fields={[
        { key: "role_name",         type: "text",        label: "Role Name" },
        { key: "role_type",         type: "select",      label: "Role Type",           description: "System or Custom." },
        { key: "department_scope",  type: "multiselect", label: "Department Scope",    description: "Which departments this role applies to." },
        { key: "module_permissions", type: "multiselect", label: "Module Permissions", description: "Per-module access levels: None, View, Create, Edit, Delete, Approve, Admin." },
        { key: "is_executive",      type: "toggle",      label: "Executive Access",    description: "Grants visibility into Executive Command Center." },
        { key: "status",            type: "select",      label: "Status",              description: "Active, Inactive, or Restricted." },
        { key: "description",       type: "textarea",    label: "Description" },
      ]}
      consumedBy={["All Workspaces", "Users", "Audit Logs", "Executive Command Center"]}
      relatedSections={[
        { label: "Users",       href: "/settings/users" },
        { label: "Departments", href: "/settings/departments" },
      ]}
    />
  );
}
