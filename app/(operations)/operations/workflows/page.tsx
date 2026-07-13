// This file exists solely to redirect /operations/workflows to /admin/workflows,
// which is the canonical Workflow Engine route. /admin/workflows is the more
// heavily cross-linked destination (15+ inbound links from billing cancellations,
// sales pipeline, clients, notifications, etc.) and now carries the full
// honesty treatment (PreviewBadge + prototype-data banner + disabled dead CTAs).
import { redirect } from "next/navigation";

export default function OperationsWorkflowsRedirect() {
  redirect("/admin/workflows");
}
