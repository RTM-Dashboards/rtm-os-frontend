"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function EscalationRulesPage() {
  return (
    <ConfigPlaceholder
      title="Escalation Rules"
      breadcrumb={["Notifications & Escalations", "Escalation Rules"]}
      description="Rules that automatically escalate issues, overdue tasks, and at-risk clients to senior team members."
      purpose="Escalation Rules define the conditions and routing for automatic escalations. When tasks go overdue beyond a threshold, client health drops below a score, or critical blockers are unresolved, escalation rules fire and notify the appropriate escalation path. The Escalations panel in every workspace reads from these rules."
      status="planned"
      fields={[
        { key: "rule_name",          type: "text",        label: "Rule Name" },
        { key: "trigger_type",       type: "select",      label: "Trigger Type",       description: "Task Overdue, Client Health, Invoice Overdue, Blocker Unresolved, etc." },
        { key: "delay_hours",        type: "number",      label: "Delay Before Escalation (hours)" },
        { key: "escalation_path",    type: "multiselect", label: "Escalation Path",    description: "Roles or users who receive the escalation." },
        { key: "severity",           type: "select",      label: "Severity",           description: "Critical, High, Medium, Low." },
        { key: "channels",           type: "multiselect", label: "Notification Channels" },
        { key: "message_template",   type: "textarea",    label: "Message Template" },
        { key: "re_escalate_after",  type: "number",      label: "Re-escalate After (hours)", description: "Re-fire escalation if not resolved." },
        { key: "department_scope",   type: "multiselect", label: "Department Scope" },
        { key: "is_active",          type: "toggle",      label: "Active" },
      ]}
      consumedBy={["All Workspaces", "Executive Command Center", "Account Management"]}
      relatedSections={[
        { label: "Notification Rules", href: "/settings/notification-rules" },
        { label: "Workflow Rules",     href: "/settings/workflow-rules" },
        { label: "Automation Rules",   href: "/settings/automation-rules" },
      ]}
    />
  );
}
