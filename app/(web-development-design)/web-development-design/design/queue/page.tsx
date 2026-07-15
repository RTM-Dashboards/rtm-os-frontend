import { redirect } from "next/navigation";

// Work Queue has been removed. Redirect to Design Tasks.
export default function DesignQueueRedirect() {
  redirect("/web-development-design/design/tasks");
}
