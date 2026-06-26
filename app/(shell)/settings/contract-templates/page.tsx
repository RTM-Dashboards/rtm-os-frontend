"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function ContractTemplatesPage() {
  return (
    <ConfigPlaceholder
      title="Contract Templates"
      breadcrumb={["Forms & Templates", "Contract Templates"]}
      description="Service agreement and contract templates generated after proposal acceptance."
      purpose="Contract Templates define the legal and service agreement structure sent to clients after proposal acceptance. They reference approved services, pricing, and terms. No contract language or structure should be hardcoded in workspace code."
      status="planned"
      fields={[
        { key: "template_name",    type: "text",        label: "Template Name" },
        { key: "contract_type",    type: "select",      label: "Contract Type",    description: "Master Service Agreement, Statement of Work, Addendum." },
        { key: "version",          type: "text",        label: "Version" },
        { key: "clauses",          type: "multiselect", label: "Included Clauses", description: "Payment Terms, Scope, Cancellation, IP, SLA, etc." },
        { key: "service_scope",    type: "multiselect", label: "Service Scope",    description: "Which services this contract covers." },
        { key: "billing_terms",    type: "select",      label: "Default Billing Terms" },
        { key: "requires_esign",   type: "toggle",      label: "Requires E-Signature" },
        { key: "is_default",       type: "toggle",      label: "Default Contract Template" },
        { key: "is_active",        type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Billing", "Activation & Handoff", "Account Management"]}
      relatedSections={[
        { label: "Proposal Templates", href: "/settings/proposal-templates" },
        { label: "Services",           href: "/settings/services" },
        { label: "Pricing Rules",      href: "/settings/pricing-rules" },
      ]}
    />
  );
}
