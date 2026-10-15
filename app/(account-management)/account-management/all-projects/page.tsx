/**
 * All Projects — Account Management workspace entry point.
 *
 * Thin route wrapper: renders the shared GlobalProjectsPage component that
 * lives in the global shell. The Account Management sidebar (from the
 * (account-management) layout) stays in place because this page lives inside
 * the (account-management) route group, not the (shell) group.
 *
 * basePath is set to the AM-workspace project detail route so that clicking a
 * project stays inside the Account Management workspace rather than jumping to
 * the global shell.
 *
 * All functionality (project list, task list, filters, opening a project,
 * status badges) is intact — this file adds no logic of its own.
 */

import GlobalProjectsPage from "@/app/(shell)/projects/page";

export default function AMAllProjectsPage() {
  return <GlobalProjectsPage basePath="/account-management/projects" />;
}
