"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import ProposalTemplatesPage from "@/app/(shell)/settings/proposal-templates/page";

export default function SalesProposalTemplatesPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Proposal Templates" />
      <ProposalTemplatesPage />
    </>
  );
}
