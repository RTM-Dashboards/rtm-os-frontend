"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function ApiConnectionsPage() {
  return (
    <ConfigPlaceholder
      title="API Connections"
      breadcrumb={["Integrations", "API Connections"]}
      description="Manage API keys, tokens, and custom API endpoint configurations."
      purpose="API Connections stores and manages authentication credentials for all connected services. Keys are stored securely and referenced by integration configurations. No API keys should be hardcoded in workspace code — they must be managed here."
      status="planned"
      fields={[
        { key: "connection_name",   type: "text",        label: "Connection Name" },
        { key: "provider",          type: "select",      label: "Provider" },
        { key: "auth_type",         type: "select",      label: "Auth Type",          description: "API Key, Bearer Token, OAuth Access Token, Service Account." },
        { key: "credential_ref",    type: "text",        label: "Credential Reference", description: "Vault reference or masked key identifier (never stored in plaintext)." },
        { key: "environment",       type: "select",      label: "Environment",        description: "Production, Staging, or Development." },
        { key: "scope",             type: "multiselect", label: "Permission Scope" },
        { key: "expires_at",        type: "text",        label: "Expiration Date" },
        { key: "is_active",         type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Integration Hub", "KPI Definitions", "Automation Rules", "Dashboard Builder"]}
      relatedSections={[
        { label: "Integration Hub",    href: "/settings/integrations" },
        { label: "Provider Templates", href: "/settings/integrations/providers" },
        { label: "Webhooks",           href: "/settings/integrations/webhooks" },
      ]}
    />
  );
}
