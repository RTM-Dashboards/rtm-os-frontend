"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function NotificationRulesPage() {
  return (
    <ConfigPlaceholder
      title="Notification Rules"
      breadcrumb={["Notifications & Escalations", "Notification Rules"]}
      description="Rules governing when, to whom, and through which channel platform notifications are delivered."
      purpose="Notification Rules are the platform's delivery routing engine. They define what events trigger notifications, which users or roles receive them, and which channels (Email, Slack, SMS, In-app) deliver them. No notification logic should be hardcoded in workspace code — all notification behavior is defined here."
      status="planned"
      fields={[
        { key: "rule_name",         type: "text",        label: "Rule Name" },
        { key: "trigger_event",     type: "select",      label: "Trigger Event",     description: "Task Overdue, Lead Assigned, Client Health Drop, Invoice Due, etc." },
        { key: "recipient_roles",   type: "multiselect", label: "Recipient Roles",   description: "Which roles receive this notification." },
        { key: "recipient_users",   type: "multiselect", label: "Specific Users",    description: "Additional specific recipients." },
        { key: "channels",          type: "multiselect", label: "Delivery Channels", description: "Email, Slack, SMS, In-App." },
        { key: "message_template",  type: "textarea",    label: "Message Template",  description: "Notification body with variable placeholders." },
        { key: "condition",         type: "textarea",    label: "Condition",         description: "Optional additional filter condition." },
        { key: "frequency_cap",     type: "select",      label: "Frequency Cap",     description: "Immediately, Max Once Per Hour, Max Once Per Day." },
        { key: "is_active",         type: "toggle",      label: "Active" },
      ]}
      consumedBy={["All Workspaces", "Automation Rules"]}
      relatedSections={[
        { label: "Escalation Rules", href: "/settings/escalation-rules" },
        { label: "Automation Rules", href: "/settings/automation-rules" },
        { label: "Integrations",     href: "/settings/integrations" },
      ]}
    />
  );
}
