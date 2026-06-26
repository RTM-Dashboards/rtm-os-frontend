"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function AuditTemplatesPage() {
  return (
    <ConfigPlaceholder
      title="Audit Templates"
      breadcrumb={["Forms & Templates", "Audit Templates"]}
      description="Structured audit assessment templates used by the Sales workspace to evaluate prospect websites, campaigns, and digital presence."
      purpose="Audit Templates define the sections, questions, scoring criteria, and data sources used in prospect audits. The Sales workspace loads the active audit template when an audit is initiated. Audit templates reference Audit Goal Configuration to determine which sections are relevant for each goal. No audit logic, sections, or scoring should be hardcoded in the Sales workspace."
      status="planned"
      fields={[
        { key: "template_name",     type: "text",        label: "Template Name" },
        { key: "version",           type: "text",        label: "Version" },
        { key: "sections",          type: "multiselect", label: "Audit Sections",     description: "SEO, GBP, Ads, Website, Reviews, LSA, etc." },
        { key: "scoring_model",     type: "select",      label: "Scoring Model",      description: "Weighted, Flat, or Pass/Fail." },
        { key: "data_sources",      type: "multiselect", label: "Data Sources",       description: "Which integrations power this audit." },
        { key: "goal_mappings",     type: "multiselect", label: "Goal Mappings",      description: "Which Audit Goals activate which sections." },
        { key: "is_default",        type: "toggle",      label: "Default Audit Template" },
        { key: "is_active",         type: "toggle",      label: "Active" },
        { key: "description",       type: "textarea",    label: "Description" },
      ]}
      consumedBy={["Sales Workspace", "Recommendation Rules", "Proposal Templates"]}
      relatedSections={[
        { label: "Audit Goal Configuration", href: "/settings/audit-goal-config" },
        { label: "Audit Conditions",         href: "/settings/audit-conditions" },
        { label: "Recommendation Rules",     href: "/settings/recommendation-rules" },
        { label: "Proposal Templates",       href: "/settings/proposal-templates" },
      ]}
    />
  );
}
