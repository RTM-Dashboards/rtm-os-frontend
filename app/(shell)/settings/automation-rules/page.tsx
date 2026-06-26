"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function AutomationRulesPage() {
  return (
    <ConfigPlaceholder
      title="Automation Rules"
      breadcrumb={["Workflow Configuration", "Automation Rules"]}
      description="Platform-wide automation triggers that fire actions without manual intervention."
      purpose="Automation Rules define time-based and event-based automations: auto-assigning tasks, sending notifications, escalating overdue items, triggering reports, or activating workflows. Departments consume automation rules — they do not define their own automation logic in workspace code."
      status="planned"
      fields={[
        { key: "rule_name",        type: "text",        label: "Rule Name" },
        { key: "trigger_type",     type: "select",      label: "Trigger Type",     description: "Time-based, Event-based, or Condition-based." },
        { key: "trigger_event",    type: "select",      label: "Trigger Event",    description: "Task Overdue, Client Health Drop, Invoice Due, Stage Complete, etc." },
        { key: "trigger_schedule", type: "text",        label: "Schedule",         description: "Cron expression or interval for time-based rules." },
        { key: "condition",        type: "textarea",    label: "Condition",        description: "Additional filter condition (optional)." },
        { key: "action_type",      type: "select",      label: "Action Type",      description: "Notify, Assign Task, Escalate, Create Task, Send Report, etc." },
        { key: "action_params",    type: "textarea",    label: "Action Parameters" },
        { key: "department_scope", type: "multiselect", label: "Department Scope" },
        { key: "is_active",        type: "toggle",      label: "Active" },
      ]}
      consumedBy={["All Workspaces", "Notifications", "Escalation Rules"]}
      relatedSections={[
        { label: "Workflow Rules",   href: "/settings/workflow-rules" },
        { label: "Notification Rules", href: "/settings/notification-rules" },
        { label: "Escalation Rules", href: "/settings/escalation-rules" },
      ]}
    />
  );
}
