"use client";

import ConfigPlaceholder from "@/components/settings/ConfigPlaceholder";

export default function AuditConditionsPage() {
  return (
    <ConfigPlaceholder
      title="Audit Conditions"
      breadcrumb={["Sales Configuration", "Audit Conditions"]}
      description="Logical conditions evaluated during audit scoring to trigger findings, flags, and recommendations."
      purpose="Audit Conditions define the if/then logic evaluated against audit data. When a condition is met (e.g. a page speed score below threshold), it triggers a finding that appears in the audit report and feeds into Recommendation Rules. No condition logic should be hardcoded in workspace code."
      status="planned"
      fields={[
        { key: "condition_name",    type: "text",        label: "Condition Name" },
        { key: "audit_section",     type: "select",      label: "Audit Section",      description: "SEO, GBP, Ads, Website, Reviews, LSA, etc." },
        { key: "metric",            type: "text",        label: "Metric Key",         description: "The data point being evaluated." },
        { key: "operator",          type: "select",      label: "Operator",           description: "Less than, Greater than, Equals, Contains, Missing, etc." },
        { key: "threshold",         type: "text",        label: "Threshold Value" },
        { key: "severity",          type: "select",      label: "Severity",           description: "Critical, High, Medium, Low." },
        { key: "finding_label",     type: "text",        label: "Finding Label",      description: "Short label shown in the audit report." },
        { key: "finding_detail",    type: "textarea",    label: "Finding Detail",     description: "Explanation shown in the audit report." },
        { key: "recommendation_id", type: "select",      label: "Linked Recommendation Rule" },
        { key: "is_active",         type: "toggle",      label: "Active" },
      ]}
      consumedBy={["Audit Templates", "Recommendation Rules", "Sales Workspace"]}
      relatedSections={[
        { label: "Audit Templates",      href: "/settings/audit-templates" },
        { label: "Recommendation Rules", href: "/settings/recommendation-rules" },
        { label: "Audit Goal Configuration", href: "/settings/audit-goal-config" },
      ]}
    />
  );
}
