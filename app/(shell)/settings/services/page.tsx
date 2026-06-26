"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function ServicesPage() {
  return (
    <ConfigPlaceholder
      title="Services"
      breadcrumb={["Platform Configuration", "Services"]}
      description="Define the core service types offered by the agency. Services are the foundation of the Service Catalog, Pricing Rules, and Packages."
      purpose="Service records define what the agency delivers. Every proposal, contract, and billing line item traces back to a service definition. Services must be defined here before being offered in proposals or activated in department workspaces."
      status="partial"
      fields={[
        { key: "service_name",      type: "text",        label: "Service Name",       description: "e.g. Local SEO, Google Ads Management" },
        { key: "service_code",      type: "text",        label: "Service Code",       description: "Short identifier used in billing and reporting." },
        { key: "category",          type: "select",      label: "Category",           description: "SEO, Paid Media, GBP, LSA, Web, Content, AI, etc." },
        { key: "department_id",     type: "select",      label: "Owning Department",  description: "Which department delivers this service." },
        { key: "description",       type: "textarea",    label: "Description" },
        { key: "deliverables",      type: "textarea",    label: "Deliverables",       description: "What is included in this service." },
        { key: "pricing_model",     type: "select",      label: "Pricing Model",      description: "Flat Rate, Per-Unit, Percentage of Spend, Custom." },
        { key: "base_price",        type: "number",      label: "Base Price" },
        { key: "billing_frequency", type: "select",      label: "Billing Frequency",  description: "Monthly, Quarterly, Annual, One-time." },
        { key: "is_active",         type: "toggle",      label: "Active" },
        { key: "tags",              type: "multiselect", label: "Tags" },
      ]}
      consumedBy={["Service Catalog", "Pricing Rules", "Packages & Bundles", "Sales Workspace", "Proposals", "Contracts", "Billing"]}
      relatedSections={[
        { label: "Service Catalog",   href: "/settings/service-catalog" },
        { label: "Line Items",        href: "/settings/line-items" },
        { label: "Pricing Rules",     href: "/settings/pricing-rules" },
        { label: "Packages & Bundles", href: "/settings/packages" },
      ]}
    />
  );
}
