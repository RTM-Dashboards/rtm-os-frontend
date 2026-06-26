"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function KpiDefinitionsPage() {
  return (
    <ConfigPlaceholder
      title="KPI Definitions"
      breadcrumb={["Intelligence", "KPI Definitions"]}
      description="Definitions of all key performance indicators used across dashboards, reports, and department scorecards."
      purpose="KPI Definitions are the authoritative specification of what each metric means, how it is calculated, where its data comes from, and what targets to apply. Departments consume KPI definitions — they do not define their own metrics inline in workspace code. This prevents metric drift and ensures consistency across all reporting surfaces."
      status="planned"
      fields={[
        { key: "kpi_name",        type: "text",        label: "KPI Name",          description: "e.g. Organic Traffic, Cost Per Lead, Client Health Score." },
        { key: "kpi_code",        type: "text",        label: "KPI Code",          description: "Short identifier used in data queries and API." },
        { key: "category",        type: "select",      label: "Category",          description: "SEO, Paid Media, GBP, Revenue, Operations, Client Health, etc." },
        { key: "department_ids",  type: "multiselect", label: "Owning Departments" },
        { key: "data_source",     type: "select",      label: "Data Source",       description: "GA4, Google Ads, GSC, GBP, CallRail, Internal, etc." },
        { key: "calculation",     type: "textarea",    label: "Calculation",       description: "Formula or aggregation logic." },
        { key: "unit",            type: "select",      label: "Unit",              description: "Number, Percentage, Currency, Duration, Score." },
        { key: "target_value",    type: "text",        label: "Default Target",    description: "Baseline target value." },
        { key: "good_direction",  type: "select",      label: "Good Direction",    description: "Higher is better / Lower is better." },
        { key: "is_client_visible", type: "toggle",   label: "Visible to Clients" },
        { key: "is_active",       type: "toggle",      label: "Active" },
      ]}
      consumedBy={["All Department Workspaces", "Dashboard Builder", "Report Templates", "Scoring Rules"]}
      relatedSections={[
        { label: "Dashboard Builder",    href: "/settings/dashboard-builder" },
        { label: "Scoring Rules",        href: "/settings/scoring-rules" },
        { label: "Report Templates",     href: "/settings/report-templates" },
      ]}
    />
  );
}
