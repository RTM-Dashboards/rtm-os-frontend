import { redirect } from "next/navigation";

// Work Queue has been removed. Redirect to Reporting Tasks.
export default function ReportingQueueRedirect() {
  redirect("/reporting/tasks");
}
