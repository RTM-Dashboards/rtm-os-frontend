// ── Workspace Types ────────────────────────────────────────────────────────────
// Each workspace behaves like its own sub-application with dedicated nav + routes.

export interface WorkspaceNavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  children?: { label: string; href: string }[];
}

export interface WorkspaceConfig {
  /** Machine-readable slug: matches the URL segment */
  slug: string;
  /** Display name shown in nav and headings */
  name: string;
  /** Short tagline / subtitle shown on the workspace dashboard */
  description: string;
  /** Emoji icon representing the workspace */
  icon: string;
  /** Base route, e.g. /workspaces/sales */
  baseRoute: string;
  /** Landing dashboard route */
  dashboardRoute: string;
  /** Tasks page route (every workspace must have one) */
  tasksRoute: string;
  /** Accent color used in the workspace header bar */
  accentColor: string;
  /** Internal navigation items shown in sidebar when inside this workspace */
  navItems: WorkspaceNavItem[];
  /** Role or team responsible for this workspace */
  role: string;
}
