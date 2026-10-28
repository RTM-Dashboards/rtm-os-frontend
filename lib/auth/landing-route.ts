// RTM OS — Post-login landing route
//
// Single source of truth for where a user lands after signing in (or after
// visiting the root "/").
//
// Rule:
//   Executive or SystemAdmin  → /admin        (Admin Overview)
//   Has a department           → department workspace (from DEPT_TO_HREF)
//   Otherwise                  → /projects     (Projects & Tasks)
//
// DEPT_TO_HREF mirrors the "departments" section of components/layout/Sidebar.tsx.
// Both must be kept in sync.  The mapping lives here so the auth callback and
// the root redirect can share it without importing a "use client" Sidebar module.

export const DEPT_TO_HREF: Record<string, string> = {
  "Account Management":      "/account-management",
  "Sales":                    "/sales",
  "Billing":                  "/billing",
  "Content":                  "/content",
  "Web Development & Design": "/web-development-design",
  "SEO & Local":              "/seo-local",
  "Paid Advertising":         "/paid-advertising",
  "Reporting":                "/reporting",
  "Local Service Ads":        "/local-service-ads",
  "IT & Security":            "/it-security",
};

const ADMIN_ROLES = new Set(["Executive", "SystemAdmin"]);

/**
 * Return the correct post-login route for a user.
 *
 * @param role       The user's role string (from the database).
 * @param department The user's department string, or null if unset.
 */
export function landingRoute(
  role:       string | null | undefined,
  department: string | null | undefined,
): string {
  if (role && ADMIN_ROLES.has(role)) return "/admin";
  if (department) return DEPT_TO_HREF[department] ?? "/projects";
  return "/projects";
}
