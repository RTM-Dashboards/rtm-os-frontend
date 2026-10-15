/**
 * Project Detail — Account Management workspace entry point.
 *
 * Thin route wrapper: renders the shared ProjectDetailPage component that
 * lives in the global shell. The Account Management sidebar (from the
 * (account-management) layout) stays in place because this page lives inside
 * the (account-management) route group, not the (shell) group.
 *
 * backPath is set to the AM-workspace all-projects route so the "← Projects"
 * breadcrumb and back button stay inside the Account Management workspace
 * rather than jumping to the global shell.
 *
 * All functionality (overview, categories, tasks, status editing, onboarding
 * record link) is intact — this file adds no logic of its own.
 */

import ProjectDetailPage from "@/app/(shell)/projects/[id]/page";

export default function AMProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <ProjectDetailPage
      params={params}
      backPath="/account-management/all-projects"
    />
  );
}
