"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import PricingRulesPage from "@/app/(shell)/settings/pricing-rules/page";

export default function SalesBudgetOptimizerPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Budget Optimizer" />
      <PricingRulesPage />
    </>
  );
}
