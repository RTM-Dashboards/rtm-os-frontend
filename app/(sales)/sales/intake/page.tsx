// RTM OS — Sales Intake redirect
//
// Preserves the leadId query parameter when redirecting to the Proposals wizard
// so the wizard can pre-populate context from the originating lead.
//
// /sales/intake?leadId=L001  →  /sales/proposals?new=true&leadId=L001
// /sales/intake              →  /sales/proposals?new=true

import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ leadId?: string }>;
}

export default async function SalesIntakePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const leadId = params.leadId;
  if (leadId) {
    redirect(`/sales/proposals?new=true&leadId=${encodeURIComponent(leadId)}`);
  }
  redirect("/sales/proposals?new=true");
}
