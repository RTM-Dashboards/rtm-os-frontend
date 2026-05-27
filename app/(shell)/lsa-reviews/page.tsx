import { redirect } from "next/navigation";

// LSA Reviews now lives under Local Service Ads workspace
export default function LsaReviewsRedirect() {
  redirect("/local-service-ads");
}
