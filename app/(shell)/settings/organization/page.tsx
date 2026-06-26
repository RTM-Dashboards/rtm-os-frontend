"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function CompanyProfilePage() {
  return (
    <ConfigPlaceholder
      title="Company Profile"
      breadcrumb={["Organization", "Company Profile"]}
      description="Core identity and configuration for the RTM OS platform instance."
      purpose="Defines the agency name, domain, timezone, branding, and operating defaults. Used across all workspaces, reports, and client-facing outputs."
      status="partial"
      fields={[
        { key: "agency_name",       type: "text",     label: "Agency Name",        description: "Legal or trading name of the agency." },
        { key: "primary_domain",    type: "text",     label: "Primary Domain",     description: "e.g. realtimemarketing.com" },
        { key: "support_email",     type: "text",     label: "Support Email",      description: "Default reply-to for system communications." },
        { key: "timezone",          type: "select",   label: "Time Zone",          description: "Operating timezone for scheduling and reporting." },
        { key: "billing_cycle",     type: "select",   label: "Default Billing Cycle" },
        { key: "plan_tier",         type: "select",   label: "Platform Plan",      description: "Enterprise, Professional, or Starter." },
        { key: "logo_url",          type: "text",     label: "Logo URL",           description: "Used in reports, proposals, and client-facing pages." },
        { key: "address",           type: "textarea", label: "Business Address" },
        { key: "phone",             type: "text",     label: "Primary Phone" },
        { key: "default_currency",  type: "select",   label: "Default Currency" },
      ]}
      consumedBy={["All Workspaces", "Reports", "Proposals", "Contracts"]}
      relatedSections={[
        { label: "Departments",       href: "/settings/departments" },
        { label: "Users",             href: "/settings/users" },
        { label: "Roles & Permissions", href: "/settings/roles" },
      ]}
    />
  );
}
