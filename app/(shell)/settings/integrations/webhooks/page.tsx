"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function WebhooksPage() {
  return (
    <ConfigPlaceholder
      title="Webhooks"
      breadcrumb={["Integrations", "Webhooks"]}
      description="Outbound and inbound webhook configurations for real-time data delivery to and from external services."
      purpose="Webhooks enable real-time event delivery between RTM OS and external systems. Outbound webhooks push platform events (task created, client health changed, invoice paid) to external URLs. Inbound webhooks receive events from providers and trigger platform actions."
      status="planned"
      fields={[
        { key: "webhook_name",    type: "text",        label: "Webhook Name" },
        { key: "direction",       type: "select",      label: "Direction",         description: "Outbound or Inbound." },
        { key: "url",             type: "text",        label: "Endpoint URL",      description: "For outbound: target URL. For inbound: your receiving endpoint." },
        { key: "events",          type: "multiselect", label: "Events",            description: "Which events trigger this webhook." },
        { key: "auth_header",     type: "text",        label: "Auth Header",       description: "Secret or token included in webhook requests." },
        { key: "retry_policy",    type: "select",      label: "Retry Policy",      description: "None, Retry 3x, or Retry With Backoff." },
        { key: "payload_format",  type: "select",      label: "Payload Format",    description: "JSON, Form Data." },
        { key: "is_active",       type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Automation Rules", "Notification Rules", "External Services"]}
      relatedSections={[
        { label: "Integration Hub",  href: "/settings/integrations" },
        { label: "API Connections",  href: "/settings/integrations/api" },
        { label: "Automation Rules", href: "/settings/automation-rules" },
      ]}
    />
  );
}
