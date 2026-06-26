"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function PricingRulesPage() {
  return (
    <ConfigPlaceholder
      title="Pricing Rules"
      breadcrumb={["Platform Configuration", "Pricing Rules"]}
      description="Conditional pricing logic applied to proposals, contracts, and service catalog entries."
      purpose="Pricing Rules define dynamic price adjustments based on conditions: client type, budget range, service tier, volume, or audit outcomes. Rules are evaluated at proposal generation time. The Sales workspace consumes pricing rules to auto-price proposals. No hardcoded pricing logic should exist in workspaces."
      status="planned"
      fields={[
        { key: "rule_name",         type: "text",        label: "Rule Name" },
        { key: "service_ids",       type: "multiselect", label: "Applies To Services" },
        { key: "trigger_condition", type: "select",      label: "Trigger Condition",  description: "When this rule fires: budget threshold, client type, volume, audit score." },
        { key: "condition_value",   type: "text",        label: "Condition Value",    description: "The value the condition must match or exceed." },
        { key: "adjustment_type",   type: "select",      label: "Adjustment Type",   description: "Discount, Markup, Fixed Price, or Minimum Price." },
        { key: "adjustment_value",  type: "number",      label: "Adjustment Value",  description: "Percentage or dollar amount." },
        { key: "priority",          type: "number",      label: "Priority",          description: "Lower number = higher priority when multiple rules match." },
        { key: "is_active",         type: "toggle",      label: "Active" },
        { key: "notes",             type: "textarea",    label: "Internal Notes" },
      ]}
      consumedBy={["Sales Workspace", "Proposal Templates", "Packages & Bundles"]}
      relatedSections={[
        { label: "Services",          href: "/settings/services" },
        { label: "Service Catalog",   href: "/settings/service-catalog" },
        { label: "Packages & Bundles", href: "/settings/packages" },
        { label: "Proposal Rules",    href: "/settings/proposal-rules" },
      ]}
    />
  );
}
