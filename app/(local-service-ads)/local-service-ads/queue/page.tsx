import { redirect } from "next/navigation";

// Work Queue has been removed. Redirect to Local Service Ads Tasks.
export default function LocalServiceAdsQueueRedirect() {
  redirect("/local-service-ads/tasks");
}
