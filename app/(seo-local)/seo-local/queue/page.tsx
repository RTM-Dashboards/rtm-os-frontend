import { redirect } from "next/navigation";

// Work Queue has been removed. Redirect to SEO Tasks.
export default function SeoLocalQueueRedirect() {
  redirect("/seo-local/seo/tasks");
}
