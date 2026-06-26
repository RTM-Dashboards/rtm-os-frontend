"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function AddIntegrationPage() {
  return (
    <ConfigPlaceholder
      title="Add Integration"
      breadcrumb={["Integrations", "Add Integration"]}
      description="Connect a new data provider, tool, or service to the RTM OS platform."
      purpose="Add Integration is the setup wizard for connecting new external services. Users select from Provider Templates or configure a custom connection. Once connected, integrations become available as data sources for KPI Definitions, Audit Templates, and Dashboard widgets."
      status="partial"
      fields={[
        { key: "provider_id",     type: "select",   label: "Provider",           description: "Select from available provider templates." },
        { key: "display_name",    type: "text",     label: "Connection Name",    description: "Friendly name for this connection." },
        { key: "auth_method",     type: "select",   label: "Authentication",     description: "OAuth, API Key, Service Account, or Manual." },
        { key: "scope",           type: "multiselect", label: "Permission Scope" },
        { key: "department_ids",  type: "multiselect", label: "Available To Departments" },
        { key: "client_ids",      type: "multiselect", label: "Client Associations", description: "Clients this connection is associated with." },
        { key: "is_active",       type: "toggle",   label: "Active After Setup" },
      ]}
      consumedBy={["Integration Hub", "KPI Definitions", "Audit Templates", "Dashboard Builder"]}
      relatedSections={[
        { label: "Integration Hub",    href: "/settings/integrations" },
        { label: "Provider Templates", href: "/settings/integrations/providers" },
        { label: "Webhooks",           href: "/settings/integrations/webhooks" },
        { label: "API Connections",    href: "/settings/integrations/api" },
      ]}
    />
  );
}
