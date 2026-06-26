"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function DashboardBuilderPage() {
  return (
    <ConfigPlaceholder
      title="Dashboard Builder"
      breadcrumb={["Intelligence", "Dashboard Builder"]}
      description="Build and configure dashboard layouts, widget selections, and data bindings consumed by department and client-facing views."
      purpose="Dashboard Builder is where all dashboard configurations are authored. Department dashboards, client-facing dashboards, and executive dashboards are defined here. The Reporting workspace and department workspaces load dashboard configurations by ID. No dashboard structure should be hardcoded in workspace page code."
      status="planned"
      fields={[
        { key: "dashboard_name",  type: "text",        label: "Dashboard Name" },
        { key: "dashboard_type",  type: "select",      label: "Dashboard Type",    description: "Department, Client, Executive, or Operations." },
        { key: "layout",          type: "select",      label: "Layout",            description: "2-col, 3-col, Grid, or Custom." },
        { key: "widgets",         type: "multiselect", label: "Widgets",           description: "KPI Cards, Charts, Tables, AI Summaries, Activity Feeds." },
        { key: "kpi_ids",         type: "multiselect", label: "KPI References",    description: "Which KPI Definitions power this dashboard." },
        { key: "data_refresh",    type: "select",      label: "Data Refresh Rate", description: "Real-time, Hourly, Daily, or On-demand." },
        { key: "service_scope",   type: "multiselect", label: "Service Scope",     description: "Which services this dashboard covers." },
        { key: "department_ids",  type: "multiselect", label: "Department Scope" },
        { key: "is_default",      type: "toggle",      label: "Default for Type" },
        { key: "is_active",       type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Reporting & Intelligence", "All Department Workspaces", "Executive Command Center", "Client Profiles"]}
      relatedSections={[
        { label: "KPI Definitions",  href: "/settings/kpi-definitions" },
        { label: "Report Templates", href: "/settings/report-templates" },
        { label: "Scoring Rules",    href: "/settings/scoring-rules" },
      ]}
    />
  );
}
