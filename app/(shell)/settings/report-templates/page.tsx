// /settings/report-templates → canonical source is now the Template Library
// tab (Tab 6) on the main /reporting page.  This route simply redirects there
// so no two independently-maintained template systems can diverge.

import { redirect } from "next/navigation";

export default function ReportTemplatesRedirect() {
  redirect("/reporting#templateLibrary");
}
