"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function WorkflowTemplatesPage() {
  return (
    <ConfigPlaceholder
      title="Workflow Templates"
      breadcrumb={["Workflow Configuration", "Workflow Templates"]}
      description="Reusable workflow blueprints consumed by departments when activating new client engagements."
      purpose="Workflow Templates define the standard operating procedures for service delivery. When a new client is activated for a service, the appropriate workflow template is instantiated. Departments execute workflows — they do not define them. No workflow logic should be hardcoded inside department workspace code."
      status="partial"
      fields={[
        { key: "template_name",   type: "text",        label: "Template Name" },
        { key: "service_ids",     type: "multiselect", label: "Associated Services" },
        { key: "department_ids",  type: "multiselect", label: "Owning Departments" },
        { key: "stages",          type: "textarea",    label: "Stages",            description: "Ordered list of workflow stages (JSON or visual editor)." },
        { key: "task_blueprint_ids", type: "multiselect", label: "Task Blueprints", description: "Task blueprints used in this workflow." },
        { key: "trigger",         type: "select",      label: "Trigger",           description: "Manual, Client Activation, Renewal, or Schedule." },
        { key: "estimated_days",  type: "number",      label: "Estimated Duration (days)" },
        { key: "is_default",      type: "toggle",      label: "Default for Service" },
        { key: "is_active",       type: "toggle",      label: "Active" },
        { key: "version",         type: "text",        label: "Version" },
      ]}
      consumedBy={["All Department Workspaces", "Activation & Handoff", "Projects & Tasks"]}
      relatedSections={[
        { label: "Workflow Rules",   href: "/settings/workflow-rules" },
        { label: "Task Blueprints",  href: "/settings/task-blueprints" },
        { label: "Automation Rules", href: "/settings/automation-rules" },
      ]}
    />
  );
}
