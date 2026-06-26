"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function IntelligenceRecommendationRulesPage() {
  return (
    <ConfigPlaceholder
      title="Recommendation Rules"
      breadcrumb={["Intelligence", "Recommendation Rules"]}
      description="AI-driven and rule-based recommendation logic for dashboards, client health summaries, and executive briefings."
      purpose="Intelligence Recommendation Rules translate KPI data, client health scores, and performance trends into actionable recommendations. These are distinct from Sales Recommendation Rules — they operate on live operational data rather than prospect audit data. Dashboard AI summaries and executive reports consume these rules."
      status="planned"
      fields={[
        { key: "rule_name",       type: "text",        label: "Rule Name" },
        { key: "context",         type: "select",      label: "Context",           description: "Client Health, Department Performance, Revenue, Escalation, Renewal Risk." },
        { key: "trigger_metric",  type: "select",      label: "Trigger KPI",       description: "Which KPI triggers this recommendation." },
        { key: "trigger_condition", type: "select",    label: "Condition",         description: "Below target, Above threshold, Declining trend, etc." },
        { key: "threshold",       type: "text",        label: "Threshold Value" },
        { key: "recommendation",  type: "textarea",    label: "Recommendation Text" },
        { key: "priority",        type: "select",      label: "Priority",          description: "Critical, High, Medium, Low." },
        { key: "is_active",       type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Dashboard Builder", "Executive Command Center", "Reporting & Intelligence", "Account Management"]}
      relatedSections={[
        { label: "KPI Definitions",  href: "/settings/kpi-definitions" },
        { label: "Scoring Rules",    href: "/settings/scoring-rules" },
        { label: "Dashboard Builder", href: "/settings/dashboard-builder" },
      ]}
    />
  );
}
