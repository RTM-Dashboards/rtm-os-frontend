import { redirect } from "next/navigation";

// SEO now lives under SEO & Local workspace
export default function SeoRedirect() {
  redirect("/seo-local/seo");
}
