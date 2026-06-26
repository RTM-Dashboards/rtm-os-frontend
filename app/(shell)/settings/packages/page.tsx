"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function PackagesPage() {
  return (
    <ConfigPlaceholder
      title="Packages & Bundles"
      breadcrumb={["Platform Configuration", "Packages & Bundles"]}
      description="Pre-configured service bundles offered as named packages with combined pricing."
      purpose="Packages are named collections of services sold together at a defined price point. They simplify proposal creation by pre-assembling common service combinations. Audit Goal Configuration maps prospect goals to recommended packages. Packages are consumed by the Sales workspace during proposal generation."
      status="planned"
      fields={[
        { key: "package_name",      type: "text",        label: "Package Name",       description: "e.g. Local Domination Package, Starter SEO Bundle" },
        { key: "package_code",      type: "text",        label: "Package Code" },
        { key: "service_ids",       type: "multiselect", label: "Included Services" },
        { key: "package_price",     type: "number",      label: "Package Price",      description: "Combined price (may be less than sum of parts)." },
        { key: "billing_frequency", type: "select",      label: "Billing Frequency" },
        { key: "description",       type: "textarea",    label: "Description" },
        { key: "recommended_for",   type: "multiselect", label: "Recommended For",    description: "Audit Goals or client types this package suits." },
        { key: "min_budget",        type: "number",      label: "Minimum Budget",     description: "Minimum client budget this package targets." },
        { key: "max_budget",        type: "number",      label: "Maximum Budget" },
        { key: "is_active",         type: "toggle",      label: "Active" },
        { key: "is_featured",       type: "toggle",      label: "Featured",           description: "Show prominently in proposal selection." },
      ]}
      consumedBy={["Sales Workspace", "Audit Goal Configuration", "Proposal Templates", "Service Catalog"]}
      relatedSections={[
        { label: "Services",          href: "/settings/services" },
        { label: "Pricing Rules",     href: "/settings/pricing-rules" },
        { label: "Audit Goal Configuration", href: "/settings/audit-goal-config" },
      ]}
    />
  );
}
