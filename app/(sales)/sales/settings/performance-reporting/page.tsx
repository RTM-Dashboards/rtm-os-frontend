"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import KpiDefinitionsPage from "@/app/(shell)/settings/kpi-definitions/page";

export default function SalesPerformanceReportingPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Performance and Reporting" />
      <KpiDefinitionsPage />
    </>
  );
}
