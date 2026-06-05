import type { WorkspaceConfig } from "@/types/workspace";

// ── Workspace Definitions ─────────────────────────────────────────────────────
// One entry per department. navItems drive the per-workspace sidebar.
// Every workspace must expose a tasksRoute.

export const workspaces: WorkspaceConfig[] = [
  // ─── Account Management ────────────────────────────────────────────────────
  {
    slug: "account-management",
    name: "Account Management",
    description: "Client relationships, check-ins, retention and deliverables.",
    icon: "🏢",
    baseRoute: "/account-management",
    dashboardRoute: "/account-management",
    tasksRoute: "/account-management/tasks",
    accentColor: "#1B4FD8",
    role: "Account Managers",
    navItems: [
      { label: "Dashboard",          href: "/account-management",            icon: "📊" },
      { label: "Client Onboarding", href: "/account-management/onboarding", icon: "🚀" },
      { label: "Tasks",              href: "/account-management/tasks",      icon: "✅" },
      { label: "Clients",          href: "/account-management/clients",   icon: "👥" },
      { label: "Check-ins",        href: "/account-management/checkins",  icon: "📞" },
      { label: "Performance",      href: "/account-management/performance",icon: "📈" },
      { label: "Reports",          href: "/account-management/reports",   icon: "📋" },
    ],
  },

  // ─── Sales ────────────────────────────────────────────────────────────────
  {
    slug: "sales",
    name: "Sales",
    description: "Leads, proposals, pipeline and revenue forecasting.",
    icon: "📈",
    baseRoute: "/sales",
    dashboardRoute: "/sales",
    tasksRoute: "/sales/tasks",
    accentColor: "#059669",
    role: "Sales Team",
    navItems: [
      { label: "Sales Dashboard",    href: "/sales",                  icon: "📊" },
      { label: "Leads",              href: "/sales/leads",             icon: "🎯" },
      { label: "Tasks",              href: "/sales/tasks",             icon: "✅" },
      { label: "Proposal Generator", href: "/sales/proposals",         icon: "📝" },
      { label: "Pipeline",           href: "/sales/pipeline",          icon: "🔄" },
      { label: "Follow-ups",         href: "/sales/followups",         icon: "📅" },
      { label: "Performance",        href: "/sales/performance",       icon: "📈" },
    ],
  },

  // ─── Billing ─────────────────────────────────────────────────────────────
  {
    slug: "billing",
    name: "Billing",
    description: "Client services, invoices, cancellations and financial health.",
    icon: "💳",
    baseRoute: "/billing",
    dashboardRoute: "/billing",
    tasksRoute: "/billing/tasks",
    accentColor: "#D97706",
    role: "Billing Team",
    navItems: [
      { label: "Billing Dashboard",       href: "/billing",                     icon: "📊" },
      { label: "Tasks",                   href: "/billing/tasks",                icon: "✅" },
      { label: "Active Services",         href: "/billing/active-services",      icon: "⚡" },
      { label: "Client Portfolio",        href: "/billing/client-portfolio",     icon: "👥" },
      { label: "Invoices",                href: "/billing/invoices",             icon: "🧾" },
      { label: "Cancellations",           href: "/billing/cancellations",        icon: "❌" },
      { label: "Offboarding Triggers",    href: "/billing/offboarding",          icon: "🚪" },
      { label: "Dept. Activation Status", href: "/billing/activation",           icon: "🔔" },
    ],
  },

  // ─── Content ─────────────────────────────────────────────────────────────
  {
    slug: "content",
    name: "Content",
    description: "Blog, social, copy, media and content delivery.",
    icon: "✍️",
    baseRoute: "/content",
    dashboardRoute: "/content",
    tasksRoute: "/content/tasks",
    accentColor: "#7C3AED",
    role: "Content Team",
    navItems: [
      { label: "Dashboard",       href: "/content",               icon: "📊" },
      { label: "Tasks",           href: "/content/tasks",          icon: "✅" },
      { label: "Work Queue",      href: "/content/queue",          icon: "📂" },
      { label: "Clients",         href: "/content/clients",        icon: "👥" },
      { label: "Performance",     href: "/content/performance",    icon: "📈" },
      { label: "Reports",         href: "/content/reports",        icon: "📋" },
    ],
  },

  // ─── Web Development & Design ─────────────────────────────────────────────
  {
    slug: "web-development-design",
    name: "Web Development & Design",
    description: "Website builds, redesigns, and creative design work.",
    icon: "🖥️",
    baseRoute: "/web-development-design",
    dashboardRoute: "/web-development-design",
    tasksRoute: "/web-development-design/web-development/tasks",
    accentColor: "#0891B2",
    role: "Dev & Design Team",
    navItems: [
      { label: "Overview",            href: "/web-development-design",                     icon: "📊" },
      {
        label: "Web Development",
        href: "/web-development-design/web-development",
        icon: "💻",
        children: [
          { label: "WD Tasks", href: "/web-development-design/web-development/tasks" },
        ],
      },
      {
        label: "Design",
        href: "/web-development-design/design",
        icon: "🎨",
        children: [
          { label: "Design Tasks", href: "/web-development-design/design/tasks" },
        ],
      },
      { label: "Performance",     href: "/web-development-design/performance", icon: "📈" },
    ],
  },

  // ─── SEO & Local ─────────────────────────────────────────────────────────
  {
    slug: "seo-local",
    name: "SEO & Local",
    description: "Search rankings, Google Business Profile, Yelp and local visibility.",
    icon: "🔍",
    baseRoute: "/seo-local",
    dashboardRoute: "/seo-local",
    tasksRoute: "/seo-local/seo/tasks",
    accentColor: "#2563EB",
    role: "SEO & Local Team",
    navItems: [
      { label: "SEO & Local Overview", href: "/seo-local",              icon: "📊" },
      {
        label: "SEO",
        href: "/seo-local/seo",
        icon: "🔍",
        children: [
          { label: "SEO Dashboard",     href: "/seo-local/seo" },
          { label: "SEO Tasks",         href: "/seo-local/seo/tasks" },
          { label: "Performance",       href: "/seo-local/seo/performance" },
          { label: "Reports",           href: "/seo-local/seo/reports" },
        ],
      },
      {
        label: "GBP",
        href: "/seo-local/gbp",
        icon: "📍",
        children: [
          { label: "GBP Dashboard",     href: "/seo-local/gbp" },
          { label: "GBP Tasks",         href: "/seo-local/gbp/tasks" },
          { label: "Performance",       href: "/seo-local/gbp/performance" },
          { label: "Reports",           href: "/seo-local/gbp/reports" },
        ],
      },
      {
        label: "Yelp",
        href: "/seo-local/yelp",
        icon: "⭐",
        children: [
          { label: "Yelp Dashboard",    href: "/seo-local/yelp" },
          { label: "Yelp Tasks",        href: "/seo-local/yelp/tasks" },
          { label: "Performance",       href: "/seo-local/yelp/performance" },
          { label: "Reports",           href: "/seo-local/yelp/reports" },
        ],
      },
      { label: "Client Health",      href: "/seo-local/health",      icon: "💚" },
      { label: "Local Performance",  href: "/seo-local/performance",  icon: "📈" },
    ],
  },

  // ─── Paid Advertising ────────────────────────────────────────────────────
  {
    slug: "paid-advertising",
    name: "Paid Advertising",
    description: "Meta Ads, Google Ads and paid campaign management.",
    icon: "🎯",
    baseRoute: "/paid-advertising",
    dashboardRoute: "/paid-advertising",
    tasksRoute: "/paid-advertising/meta-ads/tasks",
    accentColor: "#DC2626",
    role: "Paid Media Team",
    navItems: [
      { label: "Ad Overview",    href: "/paid-advertising",             icon: "📊" },
      { label: "Reports",         href: "/paid-advertising/reports",     icon: "📋" },
      {
        label: "Meta Ads",
        href: "/paid-advertising/meta-ads",
        icon: "📱",
        children: [
          { label: "Meta Dashboard",    href: "/paid-advertising/meta-ads" },
          { label: "Meta Tasks",        href: "/paid-advertising/meta-ads/tasks" },
          { label: "Performance",       href: "/paid-advertising/meta-ads/performance" },
          { label: "Reports",           href: "/paid-advertising/meta-ads/reports" },
        ],
      },
      {
        label: "Google Ads",
        href: "/paid-advertising/google-ads",
        icon: "🔎",
        children: [
          { label: "Google Dashboard",  href: "/paid-advertising/google-ads" },
          { label: "Google Tasks",      href: "/paid-advertising/google-ads/tasks" },
          { label: "Performance",       href: "/paid-advertising/google-ads/performance" },
          { label: "Reports",           href: "/paid-advertising/google-ads/reports" },
        ],
      },
      { label: "Performance",    href: "/paid-advertising/performance", icon: "📈" },
    ],
  },

  // ─── Reporting ───────────────────────────────────────────────────────────
  {
    slug: "reporting",
    name: "Reporting",
    description: "Client reports, analytics and agency-wide insights.",
    icon: "📊",
    baseRoute: "/reporting",
    dashboardRoute: "/reporting",
    tasksRoute: "/reporting/tasks",
    accentColor: "#0F766E",
    role: "Reporting Team",
    navItems: [
      { label: "Reporting Dashboard", href: "/reporting",                    icon: "📊" },
      { label: "All Reports",          href: "/reporting/reports",            icon: "📋" },
      { label: "SEO Reports",          href: "/reporting/seo",                icon: "🔍" },
      { label: "Paid Ads Reports",     href: "/reporting/paid-advertising",   icon: "🎯" },
      { label: "LSA Reports",          href: "/reporting/lsa",                icon: "⭐" },
      { label: "GBP Reports",          href: "/reporting/gbp",                icon: "📍" },
      { label: "Yelp Reports",         href: "/reporting/yelp",               icon: "⭐" },
      { label: "Tasks",               href: "/reporting/tasks",              icon: "✅" },
      { label: "Work Queue",          href: "/reporting/queue",              icon: "📂" },
      { label: "Clients",             href: "/reporting/clients",            icon: "👥" },
      { label: "Performance",         href: "/reporting/performance",        icon: "📈" },
    ],
  },

  // ─── Local Service Ads ───────────────────────────────────────────────────
  {
    slug: "local-service-ads",
    name: "Local Service Ads",
    description: "Google LSA setup, reviews and budget management.",
    icon: "⭐",
    baseRoute: "/local-service-ads",
    dashboardRoute: "/local-service-ads",
    tasksRoute: "/local-service-ads/tasks",
    accentColor: "#B45309",
    role: "LSA Team",
    navItems: [
      { label: "LSA Dashboard",   href: "/local-service-ads",               icon: "📊" },
      { label: "Tasks",           href: "/local-service-ads/tasks",          icon: "✅" },
      { label: "Work Queue",      href: "/local-service-ads/queue",          icon: "📂" },
      { label: "Clients",         href: "/local-service-ads/clients",        icon: "👥" },
      { label: "Performance",     href: "/local-service-ads/performance",    icon: "📈" },
      { label: "Reports",         href: "/local-service-ads/reports",        icon: "📋" },
    ],
  },

  // ─── IT & Security ──────────────────────────────────────────────────────
  {
    slug: "it-security",
    name: "IT & Security",
    description: "Infrastructure, systems integrity, security and tooling.",
    icon: "🛡️",
    baseRoute: "/it-security",
    dashboardRoute: "/it-security",
    tasksRoute: "/it-security/tasks",
    accentColor: "#374151",
    role: "IT & Security Team",
    navItems: [
      { label: "IT Dashboard",    href: "/it-security",              icon: "📊" },
      { label: "Tasks",           href: "/it-security/tasks",         icon: "✅" },
      { label: "Work Queue",      href: "/it-security/queue",         icon: "📂" },
      { label: "Systems",         href: "/it-security/systems",       icon: "🖥️" },
      { label: "Security",        href: "/it-security/security",      icon: "🔒" },
      { label: "Reports",         href: "/it-security/reports",       icon: "📋" },
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
