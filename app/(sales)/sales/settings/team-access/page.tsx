"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import RolesPage from "@/app/(shell)/settings/roles/page";

export default function SalesTeamAccessPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Team and Access" />
      <RolesPage />
    </>
  );
}
