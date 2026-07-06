"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import SalesIntakeFormsPage from "@/app/(shell)/settings/sales-intake-forms/page";

export default function SalesSalesIntakePage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Sales Intake" />
      <SalesIntakeFormsPage />
    </>
  );
}
