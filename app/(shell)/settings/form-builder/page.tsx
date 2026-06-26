"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function FormBuilderPage() {
  return (
    <ConfigPlaceholder
      title="Form Builder"
      breadcrumb={["Forms & Templates", "Form Builder"]}
      description="Visual builder for creating and managing all platform forms. Forms created here are consumed by Sales, Onboarding, and Audit workflows."
      purpose="The Form Builder is the central editor for constructing intake forms, audit questionnaires, and data-collection forms. Forms are not hardcoded in workspaces — they are built here and referenced by ID. The Sales workspace loads Sales Intake Forms. Audit workflows load Audit Templates. No question lists should be defined inside workspace code."
      status="planned"
      fields={[
        { key: "form_name",       type: "text",        label: "Form Name" },
        { key: "form_type",       type: "select",      label: "Form Type",        description: "Sales Intake, Client Intake, Audit, Survey, etc." },
        { key: "description",     type: "textarea",    label: "Description" },
        { key: "fields",          type: "textarea",    label: "Field Definitions", description: "JSON schema of form fields (managed via visual editor)." },
        { key: "version",         type: "text",        label: "Version" },
        { key: "is_active",       type: "toggle",      label: "Active" },
        { key: "published_at",    type: "text",        label: "Published At" },
      ]}
      consumedBy={["Sales Workspace", "Client Intake", "Audit Workflows"]}
      relatedSections={[
        { label: "Sales Intake Forms",   href: "/settings/sales-intake-forms" },
        { label: "Client Intake Forms",  href: "/settings/client-intake-forms" },
        { label: "Audit Templates",      href: "/settings/audit-templates" },
      ]}
    />
  );
}
