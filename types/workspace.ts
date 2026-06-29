// ── Workspace Types ────────────────────────────────────────────────────────────
// Each workspace behaves like its own sub-application with dedicated nav + routes.

export interface WorkspaceNavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  group?: string;  // Optional section divider label rendered above this item
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
  /**
   * Optional: department config id(s) that this workspace surfaces.
   * Used to link workspace pages to their config-driven department dashboards.
   * A workspace may map to one or more departments (e.g. seo-local → ["seo", "gbp"]).
   */
  departmentIds?: string[];
}
