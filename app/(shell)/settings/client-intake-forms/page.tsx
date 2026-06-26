"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function ClientIntakeFormsPage() {
  return (
    <ConfigPlaceholder
      title="Client Intake Forms"
      breadcrumb={["Forms & Templates", "Client Intake Forms"]}
      description="Onboarding forms used after a prospect converts to a client. Captures credentials, access, and preferences."
      purpose="Client Intake Forms are sent to new clients after contract signing. They collect access credentials, business details, goals, and preferences needed to activate services. Activation & Handoff workflows load the appropriate client intake form. No intake logic should be hardcoded in the Activation workspace."
      status="planned"
      fields={[
        { key: "form_id",         type: "select",      label: "Form Reference" },
        { key: "form_name",       type: "text",        label: "Display Name" },
        { key: "services_scope",  type: "multiselect", label: "Triggered By Services", description: "Which services trigger this intake form." },
        { key: "is_default",      type: "toggle",      label: "Default Intake Form" },
        { key: "version",         type: "text",        label: "Version" },
        { key: "is_active",       type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Activation & Handoff", "Account Management"]}
      relatedSections={[
        { label: "Form Builder",        href: "/settings/form-builder" },
        { label: "Sales Intake Forms",  href: "/settings/sales-intake-forms" },
        { label: "Workflow Templates",  href: "/settings/workflow-templates" },
      ]}
    />
  );
}
