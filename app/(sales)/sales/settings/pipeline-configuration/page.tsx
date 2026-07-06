"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import PipelineConfigPage from "@/app/(shell)/settings/pipeline-config/page";

export default function SalesPipelineConfigurationPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Pipeline Configuration" />
      <PipelineConfigPage />
    </>
  );
}
