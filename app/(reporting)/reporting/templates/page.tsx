// /reporting/templates → canonical source is now the Template Library tab
// (Tab 6) on the main /reporting page.  This standalone page is superseded
// by the integrated tab; redirect to avoid two separate template systems.

import { redirect } from "next/navigation";

export default function ReportingTemplatesRedirect() {
  redirect("/reporting#templateLibrary");
}
