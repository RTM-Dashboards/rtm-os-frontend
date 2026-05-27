import { redirect } from "next/navigation";

// GBP now lives under SEO & Local workspace
export default function GbpRedirect() {
  redirect("/seo-local/gbp");
}
