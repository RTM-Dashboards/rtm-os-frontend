"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import ContractTemplatesPage from "@/app/(shell)/settings/contract-templates/page";

export default function SalesContractTemplatesPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Contract Templates" />
      <ContractTemplatesPage />
    </>
  );
}
