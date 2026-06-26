"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function ScoringRulesPage() {
  return (
    <ConfigPlaceholder
      title="Scoring Rules"
      breadcrumb={["Intelligence", "Scoring Rules"]}
      description="Rules that define how composite scores are calculated: Client Health Score, Renewal Risk Score, and Audit Scores."
      purpose="Scoring Rules define the weighting, thresholds, and calculation methodology for all composite scores in the platform. Client Health Scores, Renewal Risk Scores, and Audit Scores are computed by these rules. Workspaces display scores — they do not calculate them. All scoring logic lives here."
      status="planned"
      fields={[
        { key: "score_name",      type: "text",        label: "Score Name",        description: "e.g. Client Health Score, Renewal Risk Score, Audit Score." },
        { key: "score_type",      type: "select",      label: "Score Type",        description: "Composite, Weighted Average, Pass/Fail, or Index." },
        { key: "components",      type: "textarea",    label: "Score Components",  description: "KPIs and weights that compose this score." },
        { key: "scale",           type: "select",      label: "Scale",             description: "0-100, 0-10, A-F, Red/Yellow/Green." },
        { key: "thresholds",      type: "textarea",    label: "Thresholds",        description: "Score bands and their meaning (e.g. 80+ = Healthy)." },
        { key: "refresh_frequency", type: "select",   label: "Refresh Frequency" },
        { key: "is_active",       type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Account Management", "Executive Command Center", "Reporting & Intelligence", "Dashboard Builder", "Intelligence Recommendation Rules"]}
      relatedSections={[
        { label: "KPI Definitions",      href: "/settings/kpi-definitions" },
        { label: "Dashboard Builder",    href: "/settings/dashboard-builder" },
        { label: "Recommendation Rules", href: "/settings/intelligence-recommendation-rules" },
      ]}
    />
  );
}
