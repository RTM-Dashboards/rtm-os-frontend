"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function RecommendationRulesPage() {
  return (
    <ConfigPlaceholder
      title="Recommendation Rules"
      breadcrumb={["Sales Configuration", "Recommendation Rules"]}
      description="Rules that translate audit findings and prospect goals into service recommendations."
      purpose="Recommendation Rules are the engine that converts audit data and stated prospect goals into specific service recommendations. When an audit condition is met or a goal is selected, Recommendation Rules determine which services appear in the proposal. No recommendation logic should be hardcoded in the Sales workspace."
      status="planned"
      fields={[
        { key: "rule_name",          type: "text",        label: "Rule Name" },
        { key: "trigger_type",       type: "select",      label: "Trigger Type",         description: "Audit Condition met, Goal selected, Score threshold, or Manual." },
        { key: "condition_ids",      type: "multiselect", label: "Audit Conditions",     description: "Which conditions trigger this rule." },
        { key: "goal_ids",           type: "multiselect", label: "Audit Goals",          description: "Which goals trigger this rule." },
        { key: "recommended_service_ids", type: "multiselect", label: "Recommended Services" },
        { key: "recommended_package_ids", type: "multiselect", label: "Recommended Packages" },
        { key: "priority",           type: "number",      label: "Priority",             description: "Lower = higher priority when multiple rules match." },
        { key: "recommendation_text", type: "textarea",   label: "Recommendation Text",  description: "Explanation shown to the prospect in the proposal." },
        { key: "is_active",          type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Sales Workspace", "Proposal Templates", "Audit Templates"]}
      relatedSections={[
        { label: "Audit Conditions",         href: "/settings/audit-conditions" },
        { label: "Audit Goal Configuration", href: "/settings/audit-goal-config" },
        { label: "Proposal Rules",           href: "/settings/proposal-rules" },
        { label: "Service Catalog",          href: "/settings/service-catalog" },
      ]}
    />
  );
}
