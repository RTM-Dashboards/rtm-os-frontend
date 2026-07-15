import { redirect } from "next/navigation";

// Work Queue has been removed. Redirect to the Content Tasks page.
export default function ContentQueueRedirect() {
  redirect("/content/tasks");
}
