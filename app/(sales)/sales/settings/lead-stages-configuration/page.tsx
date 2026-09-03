"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import LeadStagesConfigPage from "@/app/(shell)/settings/lead-stages-config/page";

export default function SalesLeadStagesConfigurationPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Lead Stages" />
      <LeadStagesConfigPage />
    </>
  );
}
