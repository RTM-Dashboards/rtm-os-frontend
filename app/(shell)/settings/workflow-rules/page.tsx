"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function WorkflowRulesPage() {
  return (
    <ConfigPlaceholder
      title="Workflow Rules"
      breadcrumb={["Workflow Configuration", "Workflow Rules"]}
      description="Conditional rules that modify workflow execution based on client type, service scope, or runtime conditions."
      purpose="Workflow Rules add conditional logic to workflow execution. When a workflow runs, rules evaluate conditions and modify the workflow: adding or removing tasks, re-routing stages, adjusting assignments, or triggering escalations. Departments consume rules at runtime. No conditional workflow logic should be hardcoded in department code."
      status="planned"
      fields={[
        { key: "rule_name",        type: "text",        label: "Rule Name" },
        { key: "workflow_ids",     type: "multiselect", label: "Applies To Workflows" },
        { key: "trigger_event",    type: "select",      label: "Trigger Event",     description: "Stage Start, Stage Complete, Task Overdue, Escalation, etc." },
        { key: "condition",        type: "textarea",    label: "Condition",         description: "When this rule fires." },
        { key: "action",           type: "select",      label: "Action",            description: "Add Task, Skip Stage, Reassign, Escalate, Notify, etc." },
        { key: "action_params",    type: "textarea",    label: "Action Parameters" },
        { key: "priority",         type: "number",      label: "Priority" },
        { key: "is_active",        type: "toggle",      label: "Active" },
      ]}
      consumedBy={["All Department Workspaces", "Projects & Tasks", "Automation Rules"]}
      relatedSections={[
        { label: "Workflow Templates", href: "/settings/workflow-templates" },
        { label: "Task Blueprints",    href: "/settings/task-blueprints" },
        { label: "Automation Rules",   href: "/settings/automation-rules" },
        { label: "Escalation Rules",   href: "/settings/escalation-rules" },
      ]}
    />
  );
}
