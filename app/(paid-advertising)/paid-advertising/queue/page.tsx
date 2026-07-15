import { redirect } from "next/navigation";

// Work Queue has been removed. Redirect to Meta Ads Tasks (primary tasks entry).
export default function PaidAdvertisingQueueRedirect() {
  redirect("/paid-advertising/meta-ads/tasks");
}
