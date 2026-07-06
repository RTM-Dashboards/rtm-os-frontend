"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import AffiliateConfigPage from "@/app/(shell)/settings/affiliate-config/page";

export default function SalesAffiliateConfigurationPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Affiliate Configuration" />
      <AffiliateConfigPage />
    </>
  );
}
