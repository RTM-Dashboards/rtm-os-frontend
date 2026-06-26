"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function SalesIntakeFormsPage() {
  return (
    <ConfigPlaceholder
      title="Sales Intake Forms"
      breadcrumb={["Forms & Templates", "Sales Intake Forms"]}
      description="Forms used during the sales intake process to collect prospect information before or during an audit."
      purpose="Sales Intake Forms capture prospect data used to qualify leads, personalize audits, and populate proposals. The Sales workspace loads the active intake form at the start of a new sales engagement. No intake questions should be hardcoded inside the Sales workspace — they must be defined here."
      status="planned"
      fields={[
        { key: "form_id",          type: "select",      label: "Form Reference",    description: "Selects a form built in the Form Builder." },
        { key: "form_name",        type: "text",        label: "Display Name" },
        { key: "target_segment",   type: "select",      label: "Target Segment",    description: "SMB, Enterprise, or All." },
        { key: "is_default",       type: "toggle",      label: "Default Intake Form", description: "Used when no segment-specific form is assigned." },
        { key: "requires_goals",   type: "toggle",      label: "Includes Goal Selection", description: "Prompts prospect to select primary goals." },
        { key: "version",          type: "text",        label: "Version" },
        { key: "is_active",        type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Sales Workspace"]}
      relatedSections={[
        { label: "Form Builder",             href: "/settings/form-builder" },
        { label: "Audit Goal Configuration", href: "/settings/audit-goal-config" },
        { label: "Intake Questions",         href: "/settings/intake-questions" },
      ]}
    />
  );
}
