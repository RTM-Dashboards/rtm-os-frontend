"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import AuditGoalConfigPage from "@/app/(shell)/settings/audit-goal-config/page";

export default function SalesAuditConfigurationPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Audit Configuration" />
      <AuditGoalConfigPage />
    </>
  );
}
