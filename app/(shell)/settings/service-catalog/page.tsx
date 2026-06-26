"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function ServiceCatalogPage() {
  return (
    <ConfigPlaceholder
      title="Service Catalog"
      breadcrumb={["Platform Configuration", "Service Catalog"]}
      description="The published catalog of services available for inclusion in proposals and client engagements."
      purpose="The Service Catalog is the client-visible and proposal-visible collection of services. It controls what can be offered, at what tiers, and under what conditions. Catalog entries reference Services and apply presentation, visibility, and tier logic."
      status="partial"
      fields={[
        { key: "service_id",          type: "select",      label: "Service Reference",   description: "Links to a Service definition." },
        { key: "catalog_name",        type: "text",        label: "Catalog Display Name", description: "Override name for client-facing displays." },
        { key: "short_description",   type: "textarea",    label: "Short Description",   description: "Shown in proposals and service selection flows." },
        { key: "long_description",    type: "textarea",    label: "Full Description" },
        { key: "tier",                type: "select",      label: "Service Tier",        description: "Basic, Standard, Premium, Enterprise." },
        { key: "is_visible",          type: "toggle",      label: "Visible in Proposals" },
        { key: "requires_audit",      type: "toggle",      label: "Requires Audit",      description: "Audit must be completed before this service can be proposed." },
        { key: "recommended_goals",   type: "multiselect", label: "Recommended For Goals", description: "Which Audit Goals this service is recommended for." },
        { key: "sort_order",          type: "number",      label: "Sort Order" },
        { key: "image_url",           type: "text",        label: "Service Image URL" },
      ]}
      consumedBy={["Sales Workspace", "Proposal Templates", "Recommendation Rules", "Audit Goal Configuration"]}
      relatedSections={[
        { label: "Services",           href: "/settings/services" },
        { label: "Pricing Rules",      href: "/settings/pricing-rules" },
        { label: "Packages & Bundles", href: "/settings/packages" },
        { label: "Audit Goal Configuration", href: "/settings/audit-goal-config" },
      ]}
    />
  );
}
