/**
 * All Projects — Account Management workspace entry point.
 *
 * Thin route wrapper: renders the shared GlobalProjectsPage component that
 * lives in the global shell. The Account Management sidebar (from the
 * (account-management) layout) stays in place because this page lives inside
 * the (account-management) route group, not the (shell) group.
 *
 * All functionality (project list, task list, filters, opening a project,
 * status badges) is intact — this file adds no logic of its own.
 */

// Re-export the shared component. Next.js resolves this as the page module;
// the default export becomes the rendered page.
export { default } from "@/app/(shell)/projects/page";
