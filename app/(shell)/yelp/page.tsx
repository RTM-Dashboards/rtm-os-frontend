import { redirect } from "next/navigation";

// Yelp now lives under SEO & Local workspace
export default function YelpRedirect() {
  redirect("/seo-local/yelp");
}
