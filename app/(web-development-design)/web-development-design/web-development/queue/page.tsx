import { redirect } from "next/navigation";

// Work Queue has been removed. Redirect to Web Development Tasks.
export default function WebDevelopmentQueueRedirect() {
  redirect("/web-development-design/web-development/tasks");
}
