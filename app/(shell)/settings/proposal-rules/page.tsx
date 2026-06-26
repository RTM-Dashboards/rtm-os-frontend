"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function ProposalRulesPage() {
  return (
    <ConfigPlaceholder
      title="Proposal Rules"
      breadcrumb={["Sales Configuration", "Proposal Rules"]}
      description="Rules controlling proposal generation logic: what to include, how to sequence sections, and when to apply special conditions."
      purpose="Proposal Rules define the logic that governs how proposals are assembled. They control section visibility, service inclusion conditions, discount eligibility, and presentation order. The Sales workspace executes proposal rules at generation time. No proposal assembly logic should be hardcoded in workspace code."
      status="planned"
      fields={[
        { key: "rule_name",       type: "text",        label: "Rule Name" },
        { key: "rule_type",       type: "select",      label: "Rule Type",        description: "Section Visibility, Service Inclusion, Pricing, Discount, or Sequencing." },
        { key: "trigger",         type: "textarea",    label: "Trigger Condition", description: "When this rule applies." },
        { key: "action",          type: "textarea",    label: "Action",           description: "What the rule does when triggered." },
        { key: "template_ids",    type: "multiselect", label: "Applies To Templates" },
        { key: "priority",        type: "number",      label: "Priority" },
        { key: "is_active",       type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Sales Workspace", "Proposal Templates"]}
      relatedSections={[
        { label: "Proposal Templates",   href: "/settings/proposal-templates" },
        { label: "Recommendation Rules", href: "/settings/recommendation-rules" },
        { label: "Pricing Rules",        href: "/settings/pricing-rules" },
      ]}
    />
  );
}
