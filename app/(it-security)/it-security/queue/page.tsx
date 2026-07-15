import { redirect } from "next/navigation";

// Work Queue has been removed. Redirect to IT & Security Tasks.
export default function ItSecurityQueueRedirect() {
  redirect("/it-security/tasks");
}
