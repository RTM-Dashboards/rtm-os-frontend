"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import RecommendationRulesPage from "@/app/(shell)/settings/recommendation-rules/page";

export default function SalesRecommendationRulesPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Recommendation Rules" />
      <RecommendationRulesPage />
    </>
  );
}
