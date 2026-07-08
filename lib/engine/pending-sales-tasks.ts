// =============================================================================
// RTM OS — Cross-workspace pending sales tasks signal store
//
// This module holds dynamically generated sales tasks that are pushed at
// runtime from other workspaces (e.g. Billing → Sales).
//
// It mirrors the pattern previously in lib/mock/workspace-tasks.ts so that
// billing/invoices/page.tsx can still push cross-workspace tasks without
// depending on the deleted static file.
// =============================================================================

import type { WorkspaceTask } from "@/components/workspace/WorkspaceTaskPage";

/** Mutable queue of runtime-generated sales tasks from other workspaces. */
export const pendingSalesTasks: WorkspaceTask[] = [];

/** Push a new task into the pending sales queue. */
export function addPendingSalesTask(task: WorkspaceTask): void {
  pendingSalesTasks.push(task);
}
