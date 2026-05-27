import { redirect } from "next/navigation";

// Meta Ads now lives under Paid Advertising workspace
export default function MetaAdsRedirect() {
  redirect("/paid-advertising/meta-ads");
}
