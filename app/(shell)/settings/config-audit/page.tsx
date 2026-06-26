"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function ConfigAuditPage() {
  return (
    <ConfigPlaceholder
      title="Configuration Audit"
      breadcrumb={["System", "Configuration Audit"]}
      description="Audit trail of all configuration changes made to the platform."
      purpose="Configuration Audit maintains a tamper-evident log of every change made to platform settings: who changed what, when, what the previous value was, and what it became. This supports compliance, debugging, and rollback decisions."
      status="planned"
      fields={[
        { key: "changed_at",     type: "text",   label: "Changed At" },
        { key: "actor",          type: "text",   label: "Changed By" },
        { key: "section",        type: "select", label: "Configuration Section" },
        { key: "field_key",      type: "text",   label: "Field" },
        { key: "previous_value", type: "textarea", label: "Previous Value" },
        { key: "new_value",      type: "textarea", label: "New Value" },
        { key: "ip_address",     type: "text",   label: "IP Address" },
        { key: "session_id",     type: "text",   label: "Session ID" },
      ]}
      consumedBy={["System Admins", "Compliance Review"]}
      relatedSections={[
        { label: "System Health",  href: "/settings/system-health" },
        { label: "Logs",           href: "/settings/logs" },
        { label: "Issue Monitor",  href: "/settings/issue-monitor" },
      ]}
    />
  );
}
