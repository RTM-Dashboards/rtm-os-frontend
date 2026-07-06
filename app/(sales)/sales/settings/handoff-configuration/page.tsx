"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import WorkflowRulesPage from "@/app/(shell)/settings/workflow-rules/page";

export default function SalesHandoffConfigurationPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Handoff Configuration" />
      <WorkflowRulesPage />
    </>
  );
}
