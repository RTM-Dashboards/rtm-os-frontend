// This file exists solely to redirect the legacy /tasks root URL to /projects.
// All /tasks/* sub-routes (templates, activation-engine, department-activation,
// workload-planning, analytics, collaboration, activation-rules) remain fully
// functional and are NOT affected by this redirect.
import { redirect } from "next/navigation";

export default function TasksIndexRedirect() {
  redirect("/projects");
}
