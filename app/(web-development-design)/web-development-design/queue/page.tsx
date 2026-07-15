import { redirect } from "next/navigation";

// Work Queue has been removed. Redirect to Web Development Tasks.
export default function WebDevDesignQueueRedirect() {
  redirect("/web-development-design/web-development/tasks");
}
