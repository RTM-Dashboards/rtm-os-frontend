import type { WorkspaceConfig } from "@/types/workspace";

// ── Workspace Definitions ─────────────────────────────────────────────────────
// One entry per department. navItems drive the per-workspace sidebar.
// Every workspace must expose a tasksRoute.
// Note: icon field in WorkspaceConfig is the workspace identity icon (kept for
// header display). Nav item icons are resolved by WorkspaceSidebar from labels.

export const workspaces: WorkspaceConfig[] = [
  // ─── Account Management ────────────────────────────────────────────────────
  {
    slug: "account-management",
    name: "Account Management",
    description: "Client relationships, check-ins, retention and deliverables.",
    icon: "AM",
    baseRoute: "/account-management",
    dashboardRoute: "/account-management",
    tasksRoute: "/account-management/tasks",
    accentColor: "#1B4FD8",
    role: "Account Managers",
    navItems: [
      { label: "Dashboard",               href: "/account-management"},
      { label: "Onboarding Queue",        href: "/account-management/onboarding"},
      { label: "Projects",               href: "/account-management/projects"},
      { label: "Client Portfolio",        href: "/account-management/client-portfolio"},
      { label: "Client Health",           href: "/account-management/client-health"},
      { label: "Communications",          href: "/account-management/communications"},
      { label: "Change Requests",         href: "/account-management/change-requests"},
      { label: "Renewals",                href: "/account-management/renewals"},
      { label: "Expansion Opportunities", href: "/account-management/expansion"},
      { label: "Cancellations",           href: "/account-management/cancellations"},
      { label: "Offboarding",             href: "/account-management/offboarding"},
      { label: "Account Assignments",     href: "/account-management/assignments"},
      { label: "Check-ins",               href: "/account-management/checkins"},
      { label: "My Tasks",                href: "/account-management/tasks"},
      { label: "My Reports",              href: "/account-management/reports"},
      { label: "Portfolio Performance",   href: "/account-management/performance"},
      { label: "Settings",                href: "/account-management/settings"},
    ],
  },

  // ─── Sales ────────────────────────────────────────────────────────────────
  {
    slug: "sales",
    name: "Sales",
    description: "Leads, proposals, pipeline and revenue forecasting.",
    icon: "SL",
    baseRoute: "/sales",
    dashboardRoute: "/sales",
    tasksRoute: "/sales/tasks",
    accentColor: "#059669",
    role: "Sales Team",
    navItems: [
      { label: "Dashboard",          href: "/sales" },
      { label: "Leads",              href: "/sales/leads",                   group: "PIPELINE" },
      { label: "Pipeline",           href: "/sales/pipeline",                group: "PIPELINE" },
      { label: "Audits",             href: "/sales/audits",                  group: "PIPELINE" },
      { label: "Proposals",          href: "/sales/proposals",               group: "PIPELINE" },
      { label: "Contracts",          href: "/sales/contracts",               group: "PIPELINE" },
      { label: "Handoffs",           href: "/sales/handoffs",                group: "PIPELINE" },
      { label: "Affiliates",         href: "/sales/affiliates",              group: "TEAM" },
      { label: "Tasks",              href: "/sales/tasks",                   group: "TEAM" },
      { label: "Performance",        href: "/sales/performance",             group: "TEAM" },
      { label: "Team Members",       href: "/sales/team-members",            group: "TEAM" },
      { label: "Settings",           href: "/sales/settings",                group: "TEAM" },
    ],
  },

  // ─── Billing ─────────────────────────────────────────────────────────────
  {
    slug: "billing",
    name: "Billing",
    description: "Client services, invoices, cancellations and financial health.",
    icon: "BL",
    baseRoute: "/billing",
    dashboardRoute: "/billing",
    tasksRoute: "/billing/tasks",
    accentColor: "#D97706",
    role: "Billing Team",
    navItems: [
      { label: "Dashboard",         href: "/billing" },
      { label: "Invoices",          href: "/billing/invoices",          group: "REVENUE" },
      { label: "Recurring Revenue", href: "/billing/recurring-revenue",  group: "REVENUE" },
      { label: "Revenue",           href: "/billing/revenue",           group: "REVENUE" },
      { label: "Collections",       href: "/billing/collections",       group: "REVENUE" },
      { label: "Active Services",   href: "/billing/active-services",   group: "REVENUE" },
      { label: "Activation",        href: "/billing/activation",        group: "ACTIVATION" },
      { label: "Client Portfolio",  href: "/billing/client-portfolio",  group: "CLIENTS" },
      { label: "Cancellations",     href: "/billing/cancellations",     group: "CLIENTS" },
      { label: "Tasks",             href: "/billing/tasks",             group: "TEAM" },
      { label: "Team Members",      href: "/billing/team-members",      group: "TEAM" },
      { label: "Settings",          href: "/billing/settings",          group: "TEAM" },
    ],
  },

  // ─── Content ─────────────────────────────────────────────────────────────
  {
    slug: "content",
    departmentIds: ["content"],
    name: "Content",
    description: "Blog, social, copy, media and content delivery.",
    icon: "CT",
    baseRoute: "/content",
    dashboardRoute: "/content",
    tasksRoute: "/content/tasks",
    accentColor: "#7C3AED",
    role: "Content Team",
    navItems: [
      { label: "Dashboard",    href: "/content"},
      { label: "Tasks",        href: "/content/tasks"},
      { label: "Work Queue",   href: "/content/queue"},
      { label: "Clients",      href: "/content/clients"},
      { label: "Performance",  href: "/content/performance"},
      { label: "Reports",      href: "/content/reports"},
      { label: "Team Members", href: "/content/team-members"},
      { label: "Settings",     href: "/content/settings"},
    ],
  },

  // ─── Web Development & Design ─────────────────────────────────────────────
  {
    slug: "web-development-design",
    departmentIds: ["design"],
    name: "Web Development & Design",
    description: "Website builds, redesigns, and creative design work.",
    icon: "WD",
    baseRoute: "/web-development-design",
    dashboardRoute: "/web-development-design",
    tasksRoute: "/web-development-design/web-development/tasks",
    accentColor: "#0891B2",
    role: "Dev & Design Team",
    navItems: [
      { label: "Overview", href: "/web-development-design"},
      {
        label: "Web Development",
        href: "/web-development-design/web-development",
        children: [
          { label: "WD Tasks", href: "/web-development-design/web-development/tasks"},
        ],
      },
      {
        label: "Design",
        href: "/web-development-design/design",
        children: [
          { label: "Design Tasks", href: "/web-development-design/design/tasks"},
        ],
      },
      { label: "Performance", href: "/web-development-design/performance"},
    ],
  },

  // ─── SEO & Local ─────────────────────────────────────────────────────────
  {
    slug: "seo-local",
    departmentIds: ["seo", "gbp"],
    name: "SEO & Local",
    description: "Search rankings, Google Business Profile, Yelp and local visibility.",
    icon: "SE",
    baseRoute: "/seo-local",
    dashboardRoute: "/seo-local",
    tasksRoute: "/seo-local/seo/tasks",
    accentColor: "#2563EB",
    role: "SEO & Local Team",
    navItems: [
      { label: "SEO & Local Overview", href: "/seo-local"},
      {
        label: "SEO",
        href: "/seo-local/seo",
        children: [
          { label: "SEO Dashboard", href: "/seo-local/seo"},
          { label: "SEO Tasks",     href: "/seo-local/seo/tasks"},
          { label: "Performance",   href: "/seo-local/seo/performance"},
          { label: "Reports",       href: "/seo-local/seo/reports"},
        ],
      },
      {
        label: "GBP",
        href: "/seo-local/gbp",
        children: [
          { label: "GBP Dashboard", href: "/seo-local/gbp"},
          { label: "GBP Tasks",     href: "/seo-local/gbp/tasks"},
          { label: "Performance",   href: "/seo-local/gbp/performance"},
          { label: "Reports",       href: "/seo-local/gbp/reports"},
        ],
      },
      {
        label: "Yelp",
        href: "/seo-local/yelp",
        children: [
          { label: "Yelp Dashboard", href: "/seo-local/yelp"},
          { label: "Yelp Tasks",     href: "/seo-local/yelp/tasks"},
          { label: "Performance",    href: "/seo-local/yelp/performance"},
          { label: "Reports",        href: "/seo-local/yelp/reports"},
        ],
      },
      { label: "Client Health",     href: "/seo-local/health"},
      { label: "Local Performance", href: "/seo-local/performance"},
    ],
  },

  // ─── Paid Advertising ────────────────────────────────────────────────────
  {
    slug: "paid-advertising",
    departmentIds: ["ppc", "meta-ads"],
    name: "Paid Advertising",
    description: "Meta Ads, Google Ads and paid campaign management.",
    icon: "PA",
    baseRoute: "/paid-advertising",
    dashboardRoute: "/paid-advertising",
    tasksRoute: "/paid-advertising/meta-ads/tasks",
    accentColor: "#DC2626",
    role: "Paid Media Team",
    navItems: [
      { label: "Ad Overview", href: "/paid-advertising"},
      { label: "Reports",     href: "/paid-advertising/reports"},
      {
        label: "Meta Ads",
        href: "/paid-advertising/meta-ads",
        children: [
          { label: "Meta Dashboard", href: "/paid-advertising/meta-ads"},
          { label: "Meta Tasks",     href: "/paid-advertising/meta-ads/tasks"},
          { label: "Performance",    href: "/paid-advertising/meta-ads/performance"},
          { label: "Reports",        href: "/paid-advertising/meta-ads/reports"},
        ],
      },
      {
        label: "Google Ads",
        href: "/paid-advertising/google-ads",
        children: [
          { label: "Google Dashboard", href: "/paid-advertising/google-ads"},
          { label: "Google Tasks",     href: "/paid-advertising/google-ads/tasks"},
          { label: "Performance",      href: "/paid-advertising/google-ads/performance"},
          { label: "Reports",          href: "/paid-advertising/google-ads/reports"},
        ],
      },
      { label: "Performance", href: "/paid-advertising/performance"},
      { label: "Team Members", href: "/paid-advertising/team-members"},
      { label: "Settings",    href: "/paid-advertising/settings"},
    ],
  },

  // ─── Reporting ───────────────────────────────────────────────────────────
  {
    slug: "reporting",
    departmentIds: ["reporting"],
    name: "Reporting",
    description: "Reporting Operations & Intelligence — automated data collection, call intelligence, AI classification, and report delivery.",
    icon: "RP",
    baseRoute: "/reporting",
    dashboardRoute: "/reporting",
    tasksRoute: "/reporting/tasks",
    accentColor: "#0F766E",
    role: "Reporting Team",
    navItems: [
      { label: "Dashboard",             href: "/reporting"},
      { label: "Data Sources",          href: "/reporting/data-sources"},
      { label: "Call Intelligence",     href: "/reporting/call-intelligence"},
      { label: "Report Generation",     href: "/reporting/report-generation"},
      { label: "Department Review",     href: "/reporting/department-review"},
      { label: "AM Review",             href: "/reporting/am-review"},
      { label: "Business Intelligence", href: "/reporting/business-intelligence"},
      { label: "All Reports",           href: "/reporting/reports"},
      { label: "SEO Reports",           href: "/reporting/seo"},
      { label: "Paid Ads Reports",      href: "/reporting/paid-advertising"},
      { label: "LSA Reports",           href: "/reporting/lsa"},
      { label: "GBP Reports",           href: "/reporting/gbp"},
      { label: "Yelp Reports",          href: "/reporting/yelp"},
      { label: "Tasks",                 href: "/reporting/tasks"},
      { label: "Work Queue",            href: "/reporting/queue"},
      { label: "Clients",               href: "/reporting/clients"},
      { label: "Performance",           href: "/reporting/performance"},
      { label: "Team Members",          href: "/reporting/team-members"},
      { label: "Settings",              href: "/reporting/settings"},
    ],
  },

  // ─── Local Service Ads ───────────────────────────────────────────────────
  {
    slug: "local-service-ads",
    name: "Local Service Ads",
    description: "Google LSA setup, reviews and budget management.",
    icon: "LS",
    baseRoute: "/local-service-ads",
    dashboardRoute: "/local-service-ads",
    tasksRoute: "/local-service-ads/tasks",
    accentColor: "#B45309",
    role: "LSA Team",
    navItems: [
      { label: "Dashboard",    href: "/local-service-ads"},
      { label: "Tasks",        href: "/local-service-ads/tasks"},
      { label: "Work Queue",   href: "/local-service-ads/queue"},
      { label: "Clients",      href: "/local-service-ads/clients"},
      { label: "Performance",  href: "/local-service-ads/performance"},
      { label: "Reports",      href: "/local-service-ads/reports"},
      { label: "Team Members", href: "/local-service-ads/team-members"},
      { label: "Settings",     href: "/local-service-ads/settings"},
    ],
  },

  // ─── AI Automation ─────────────────────────────────────────────────────
  {
    slug: "ai-automation",
    departmentIds: ["ai-automation"],
    name: "AI Automation",
    description: "AI workflow automation, voice agents, chatbot builds, and intelligent process design.",
    icon: "AI",
    baseRoute: "/ai-automation",
    dashboardRoute: "/ai-automation",
    tasksRoute: "/ai-automation",
    accentColor: "#6D28D9",
    role: "AI Automation Team",
    navItems: [
      { label: "Dashboard", href: "/ai-automation"},
    ],
  },

  // ─── IT & Security ──────────────────────────────────────────────────────
  {
    slug: "it-security",
    departmentIds: ["it-security"],
    name: "IT & Security",
    description: "Infrastructure, systems integrity, security and tooling.",
    icon: "IT",
    baseRoute: "/it-security",
    dashboardRoute: "/it-security",
    tasksRoute: "/it-security/tasks",
    accentColor: "#374151",
    role: "IT & Security Team",
    navItems: [
      { label: "Dashboard",    href: "/it-security"},
      { label: "Tasks",        href: "/it-security/tasks"},
      { label: "Work Queue",   href: "/it-security/queue"},
      { label: "Systems",      href: "/it-security/systems"},
      { label: "Security",     href: "/it-security/security"},
      { label: "Reports",      href: "/it-security/reports"},
      { label: "Team Members", href: "/it-security/team-members"},
      { label: "Settings",     href: "/it-security/settings"},
    ],
  },
];

// ── Lookup helpers ────────────────────────────────────────────────────────────
export function getWorkspace(slug: string): WorkspaceConfig | undefined {
  return workspaces.find((w) => w.slug === slug);
}

export function getWorkspaceByPath(pathname: string): WorkspaceConfig | undefined {
  return workspaces.find((w) => pathname === w.baseRoute || pathname.startsWith(w.baseRoute + "/"));
}
