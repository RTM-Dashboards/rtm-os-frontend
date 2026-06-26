"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function ProposalTemplatesPage() {
  return (
    <ConfigPlaceholder
      title="Proposal Templates"
      breadcrumb={["Forms & Templates", "Proposal Templates"]}
      description="Structured proposal document templates used by the Sales workspace to generate client-facing proposals."
      purpose="Proposal Templates define the sections, layout, and content blocks used in proposals. The Sales workspace assembles a proposal by populating a template with audit results, recommended services, and pricing. No proposal structure should be hardcoded in the Sales workspace — it must be defined here."
      status="planned"
      fields={[
        { key: "template_name",  type: "text",        label: "Template Name" },
        { key: "version",        type: "text",        label: "Version" },
        { key: "sections",       type: "multiselect", label: "Sections",        description: "Executive Summary, Audit Findings, Recommended Services, Pricing, Timeline, Terms, etc." },
        { key: "branding",       type: "toggle",      label: "Apply Agency Branding" },
        { key: "includes_audit", type: "toggle",      label: "Includes Audit Summary" },
        { key: "pricing_format", type: "select",      label: "Pricing Format",  description: "Table, Packages Only, or Itemized." },
        { key: "is_default",     type: "toggle",      label: "Default Template" },
        { key: "is_active",      type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Sales Workspace", "Proposal Rules"]}
      relatedSections={[
        { label: "Audit Templates",          href: "/settings/audit-templates" },
        { label: "Contract Templates",       href: "/settings/contract-templates" },
        { label: "Pricing Rules",            href: "/settings/pricing-rules" },
        { label: "Audit Goal Configuration", href: "/settings/audit-goal-config" },
      ]}
    />
  );
}
