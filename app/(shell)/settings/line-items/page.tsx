"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function LineItemsPage() {
  return (
    <ConfigPlaceholder
      title="Line Items"
      breadcrumb={["Platform Configuration", "Line Items"]}
      description="Granular billing units that compose invoices, proposals, and contracts."
      purpose="Line items are the atomic billing and proposal building blocks. Each deliverable, service component, or fee is a line item. Proposals and invoices are assembled from line items. Line items reference Services and carry pricing, tax, and billing attributes."
      status="planned"
      fields={[
        { key: "line_item_name",   type: "text",   label: "Line Item Name" },
        { key: "service_id",       type: "select", label: "Service Reference" },
        { key: "sku",              type: "text",   label: "SKU / Code" },
        { key: "unit_price",       type: "number", label: "Unit Price" },
        { key: "unit_type",        type: "select", label: "Unit Type",         description: "Per Month, Per Hour, Per Asset, Flat Fee, etc." },
        { key: "taxable",          type: "toggle", label: "Taxable" },
        { key: "discount_eligible", type: "toggle", label: "Discount Eligible" },
        { key: "description",      type: "textarea", label: "Description" },
        { key: "is_active",        type: "toggle", label: "Active" },
      ]}
      consumedBy={["Proposals", "Contracts", "Invoices", "Billing"]}
      relatedSections={[
        { label: "Services",      href: "/settings/services" },
        { label: "Pricing Rules", href: "/settings/pricing-rules" },
        { label: "Packages",      href: "/settings/packages" },
      ]}
    />
  );
}
