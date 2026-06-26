"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function ReportTemplatesPage() {
  return (
    <ConfigPlaceholder
      title="Report Templates"
      breadcrumb={["Forms & Templates", "Report Templates"]}
      description="Standardized reporting templates for client reports, executive summaries, and department performance reviews."
      purpose="Report Templates define the structure, sections, and KPIs included in generated reports. The Reporting workspace and Report Automation engine consume these templates. No report structure should be hardcoded in workspace pages — it must be defined and versioned here."
      status="planned"
      fields={[
        { key: "template_name",   type: "text",        label: "Template Name" },
        { key: "report_type",     type: "select",      label: "Report Type",     description: "Client Report, Executive Report, Department Report, QBR, Renewal Report." },
        { key: "sections",        type: "multiselect", label: "Sections",        description: "Performance Summary, KPIs, Insights, Recommendations, Next Steps." },
        { key: "kpi_ids",         type: "multiselect", label: "KPI References",  description: "Which KPI Definitions power this report." },
        { key: "frequency",       type: "select",      label: "Default Frequency", description: "Weekly, Monthly, Quarterly." },
        { key: "branding",        type: "toggle",      label: "Apply Agency Branding" },
        { key: "includes_ai",     type: "toggle",      label: "Include AI Summary" },
        { key: "is_default",      type: "toggle",      label: "Default for Type" },
        { key: "is_active",       type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Reporting & Intelligence", "Report Automation", "Account Management"]}
      relatedSections={[
        { label: "KPI Definitions",   href: "/settings/kpi-definitions" },
        { label: "Dashboard Builder", href: "/settings/dashboard-builder" },
      ]}
    />
  );
}
