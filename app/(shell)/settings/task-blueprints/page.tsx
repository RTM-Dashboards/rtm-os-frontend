"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function TaskBlueprintsPage() {
  return (
    <ConfigPlaceholder
      title="Task Blueprints"
      breadcrumb={["Workflow Configuration", "Task Blueprints"]}
      description="Reusable task definitions that are instantiated inside workflows when client engagements are activated."
      purpose="Task Blueprints define the standard tasks performed by each department for each service. When a workflow is activated, task blueprints are instantiated as real tasks assigned to team members. Departments consume task blueprints — they do not author ad-hoc task structures in workspace code. This is the single source of truth for what gets done and by whom."
      status="partial"
      fields={[
        { key: "blueprint_name",  type: "text",        label: "Blueprint Name" },
        { key: "department_id",   type: "select",      label: "Owning Department" },
        { key: "service_ids",     type: "multiselect", label: "Associated Services" },
        { key: "role_id",         type: "select",      label: "Default Assignee Role" },
        { key: "description",     type: "textarea",    label: "Description" },
        { key: "checklist_items", type: "textarea",    label: "Checklist Items",    description: "Ordered list of sub-tasks." },
        { key: "estimated_hours", type: "number",      label: "Estimated Hours" },
        { key: "recurrence",      type: "select",      label: "Recurrence",         description: "None, Daily, Weekly, Monthly." },
        { key: "due_offset_days", type: "number",      label: "Due Date Offset",    description: "Days after activation when task is due." },
        { key: "priority",        type: "select",      label: "Default Priority",   description: "Critical, High, Medium, Low." },
        { key: "is_active",       type: "toggle",      label: "Active" },
      ]}
      consumedBy={["All Department Workspaces", "Projects & Tasks", "Workflow Templates", "Activation & Handoff"]}
      relatedSections={[
        { label: "Workflow Templates", href: "/settings/workflow-templates" },
        { label: "Workflow Rules",     href: "/settings/workflow-rules" },
        { label: "Automation Rules",   href: "/settings/automation-rules" },
      ]}
    />
  );
}
