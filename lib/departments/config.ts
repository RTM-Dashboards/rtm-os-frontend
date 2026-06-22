// ── Department Configuration Registry ────────────────────────────────────────
// Single source of truth for all department definitions.
// To add a new department: append a DepartmentConfig entry below.
// No page code, routing logic, or component changes are required.

import type { DepartmentConfig } from "@/types/department";

// ─── Helper: default module set ───────────────────────────────────────────────

function defaultModules(overrides: Partial<Record<string, boolean>> = {}): DepartmentConfig["modules"] {
  const defaults: { id: DepartmentConfig["modules"][number]["id"]; label: string; route: string }[] = [
    { id: "projects",        label: "Projects",       route: "/projects"       },
    { id: "tasks",           label: "Tasks",          route: "/tasks"          },
    { id: "reports",         label: "Reports",        route: "/reports"        },
    { id: "audits",          label: "Audits",         route: "/audits"         },
    { id: "escalations",     label: "Escalations",    route: "/escalations"    },
    { id: "notifications",   label: "Notifications",  route: "/notifications"  },
    { id: "workflows",       label: "Workflows",      route: "/workflows"      },
    { id: "integrations",    label: "Integrations",   route: "/integrations"   },
    { id: "knowledge-base",  label: "Knowledge Base", route: "/knowledge-base" },
  ];

  const disabledMap = overrides as Record<string, boolean>;

  return defaults.map((m) => ({
    id: m.id,
    label: m.label,
    route: m.route,
    enabled: disabledMap[m.id] !== false,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPARTMENT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

export const DEPARTMENT_CONFIGS: DepartmentConfig[] = [

  // ─── SEO ───────────────────────────────────────────────────────────────────
  {
    id: "seo",
    name: "SEO",
    description: "Organic search strategy, on-page optimization, technical SEO, and content delivery.",
    departmentType: "service",
    status: "active",
    owner: "Alex R.",
    accentColor: "#2563EB",
    baseRoute: "/departments/seo",
    workspaceSlug: "seo-local",

    modules: defaultModules({ "audits": true }),

    kpis: [
      {
        id: "seo-kpi-1",
        name: "Organic Traffic Growth",
        metricType: "percentage",
        unit: "%",
        target: "+15% / mo",
        warningThreshold: "+5%",
        criticalThreshold: "0%",
        dataSource: "GA4",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "seo-kpi-2",
        name: "Keyword Rankings (Top 10)",
        metricType: "count",
        target: "+10 / mo",
        warningThreshold: "+3",
        criticalThreshold: "0",
        dataSource: "SEMrush",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "seo-kpi-3",
        name: "Organic Leads",
        metricType: "count",
        target: "50+ / mo",
        warningThreshold: "25",
        criticalThreshold: "10",
        dataSource: "GA4",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "seo-kpi-4",
        name: "Reports Delivered On Time",
        metricType: "percentage",
        unit: "%",
        target: "100%",
        warningThreshold: "90%",
        criticalThreshold: "75%",
        dataSource: "RTM OS",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
    ],

    integrations: [
      { integrationId: "google-search-console", displayName: "Google Search Console", category: "Analytics", role: "primary"           },
      { integrationId: "ga4",                   displayName: "Google Analytics 4",    category: "Analytics", role: "required"          },
      { integrationId: "semrush",               displayName: "SEMrush",               category: "SEO",       role: "required"          },
      { integrationId: "ahrefs",                displayName: "Ahrefs",                category: "SEO",       role: "optional"          },
    ],

    reports: [
      { reportId: "seo-monthly",    displayName: "Monthly SEO Report",    frequency: "monthly",   source: "RTM OS Reporting" },
      { reportId: "seo-performance",displayName: "SEO Performance Report",frequency: "monthly",   source: "GA4 + GSC"        },
      { reportId: "seo-executive",  displayName: "Executive SEO Summary", frequency: "quarterly", source: "RTM OS Reporting" },
    ],

    workflows: [
      { workflowId: "seo-monthly-delivery", displayName: "Monthly SEO Delivery", description: "Recurring monthly task blueprint for SEO deliverables."       },
      { workflowId: "seo-qa-review",        displayName: "SEO QA Review",        description: "Quality assurance workflow before client report submission."  },
    ],

    roles: [
      { id: "seo-head",       name: "Department Head",  type: "manager",  description: "Owns SEO strategy and team delivery."          },
      { id: "seo-strategist", name: "Strategist",       type: "lead",     description: "Designs SEO roadmaps and audits."              },
      { id: "seo-specialist", name: "Specialist",       type: "member",   description: "Executes on-page and off-page SEO tasks."      },
      { id: "seo-reviewer",   name: "Reviewer",         type: "lead",     description: "QA reviews deliverables before client delivery."},
    ],
  },

  // ─── GBP ───────────────────────────────────────────────────────────────────
  {
    id: "gbp",
    name: "GBP",
    description: "Google Business Profile optimization, listing management, and local SEO.",
    departmentType: "service",
    status: "active",
    owner: "Alex R.",
    accentColor: "#059669",
    baseRoute: "/departments/gbp",
    workspaceSlug: "seo-local",

    modules: defaultModules({ "audits": true }),

    kpis: [
      {
        id: "gbp-kpi-1",
        name: "Inbound Calls",
        metricType: "count",
        target: "200+ / mo",
        warningThreshold: "100",
        criticalThreshold: "40",
        dataSource: "Google Business Profile API",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "gbp-kpi-2",
        name: "Direction Requests",
        metricType: "count",
        target: "150+ / mo",
        warningThreshold: "75",
        criticalThreshold: "25",
        dataSource: "Google Business Profile API",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "gbp-kpi-3",
        name: "Average Star Rating",
        metricType: "number",
        target: "4.5+",
        warningThreshold: "4.0",
        criticalThreshold: "3.5",
        dataSource: "Google Business Profile API",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "gbp-kpi-4",
        name: "Active Suspensions",
        metricType: "count",
        target: "0",
        warningThreshold: "1",
        criticalThreshold: "3",
        dataSource: "Google Business Profile API",
        reportingFrequency: "daily",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
    ],

    integrations: [
      { integrationId: "gbp-api",  displayName: "Google Business Profile API", category: "Local SEO", role: "primary"  },
      { integrationId: "ga4",      displayName: "Google Analytics 4",          category: "Analytics", role: "optional" },
    ],

    reports: [
      { reportId: "gbp-monthly",    displayName: "Monthly GBP Report",    frequency: "monthly",   source: "RTM OS Reporting" },
      { reportId: "gbp-performance",displayName: "GBP Performance Report",frequency: "monthly",   source: "GBP API"          },
    ],

    workflows: [
      { workflowId: "gbp-monthly-delivery",    displayName: "Monthly GBP Delivery",    description: "Monthly GBP deliverable workflow."              },
      { workflowId: "gbp-suspension-recovery", displayName: "Suspension Recovery",     description: "Escalation workflow for suspended listings."     },
    ],

    roles: [
      { id: "gbp-head",      name: "Department Head", type: "manager", description: "Leads GBP strategy and oversees listings."    },
      { id: "gbp-specialist",name: "Specialist",      type: "member",  description: "Manages and optimizes Google Business Profiles."},
    ],
  },

  // ─── PPC ───────────────────────────────────────────────────────────────────
  {
    id: "ppc",
    name: "PPC",
    description: "Google Ads PPC, shopping, display, and Performance Max campaign management.",
    departmentType: "service",
    status: "active",
    owner: "Mike T.",
    accentColor: "#DC2626",
    baseRoute: "/departments/ppc",
    workspaceSlug: "paid-advertising",

    modules: defaultModules({ "audits": true }),

    kpis: [
      {
        id: "ppc-kpi-1",
        name: "Ad Spend (MTD)",
        metricType: "currency",
        unit: "$",
        target: "On Pace",
        warningThreshold: "10% over",
        criticalThreshold: "20% over",
        dataSource: "Google Ads",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "neutral",
      },
      {
        id: "ppc-kpi-2",
        name: "Cost Per Lead",
        metricType: "currency",
        unit: "$",
        target: "<$50",
        warningThreshold: "$80",
        criticalThreshold: "$120",
        dataSource: "Google Ads",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
      {
        id: "ppc-kpi-3",
        name: "ROAS",
        metricType: "number",
        unit: "x",
        target: "4.0x+",
        warningThreshold: "2.5x",
        criticalThreshold: "1.5x",
        dataSource: "Google Ads",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "ppc-kpi-4",
        name: "CTR",
        metricType: "percentage",
        unit: "%",
        target: "5%+",
        warningThreshold: "3%",
        criticalThreshold: "1.5%",
        dataSource: "Google Ads",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
    ],

    integrations: [
      { integrationId: "google-ads-mcc",     displayName: "Google Ads MCC",     category: "Paid Advertising", role: "primary"   },
      { integrationId: "ga4",                displayName: "Google Analytics 4", category: "Analytics",        role: "required"  },
      { integrationId: "google-search-console",displayName: "Search Console",   category: "SEO",              role: "optional"  },
    ],

    reports: [
      { reportId: "ppc-monthly",    displayName: "Monthly PPC Report",    frequency: "monthly", source: "RTM OS Reporting" },
      { reportId: "ppc-performance",displayName: "PPC Performance Report",frequency: "weekly",  source: "Google Ads"       },
      { reportId: "ppc-executive",  displayName: "Executive PPC Summary", frequency: "monthly", source: "RTM OS Reporting" },
    ],

    workflows: [
      { workflowId: "ppc-launch",        displayName: "PPC Campaign Launch",       description: "Onboarding workflow for new PPC campaigns."              },
      { workflowId: "ppc-optimization",  displayName: "Monthly PPC Optimization",  description: "Recurring monthly optimization and reporting workflow."   },
      { workflowId: "ppc-review",        displayName: "PPC Performance Review",    description: "Quarterly strategic review workflow."                     },
    ],

    roles: [
      { id: "ppc-head",      name: "Department Head", type: "manager", description: "Owns PPC strategy and campaign oversight."      },
      { id: "ppc-strategist",name: "Strategist",      type: "lead",    description: "Plans and audits ad strategy."                  },
      { id: "ppc-specialist",name: "Specialist",      type: "member",  description: "Executes and optimizes campaigns daily."        },
    ],
  },

  // ─── Meta Ads ───────────────────────────────────────────────────────────────
  {
    id: "meta-ads",
    name: "Meta Ads",
    description: "Facebook and Instagram paid social advertising, retargeting, and audience management.",
    departmentType: "service",
    status: "active",
    owner: "Mike T.",
    accentColor: "#7C3AED",
    baseRoute: "/departments/meta-ads",
    workspaceSlug: "paid-advertising",

    modules: defaultModules({ "audits": false }),

    kpis: [
      {
        id: "meta-kpi-1",
        name: "Ad Spend (MTD)",
        metricType: "currency",
        unit: "$",
        target: "On Pace",
        warningThreshold: "10% over",
        criticalThreshold: "20% over",
        dataSource: "Meta Ads Manager",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "neutral",
      },
      {
        id: "meta-kpi-2",
        name: "Cost Per Lead",
        metricType: "currency",
        unit: "$",
        target: "<$40",
        warningThreshold: "$65",
        criticalThreshold: "$100",
        dataSource: "Meta Ads Manager",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
      {
        id: "meta-kpi-3",
        name: "ROAS",
        metricType: "number",
        unit: "x",
        target: "3.5x+",
        warningThreshold: "2.0x",
        criticalThreshold: "1.2x",
        dataSource: "Meta Ads Manager",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "meta-kpi-4",
        name: "CPM",
        metricType: "currency",
        unit: "$",
        target: "<$15",
        warningThreshold: "$25",
        criticalThreshold: "$40",
        dataSource: "Meta Ads Manager",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
    ],

    integrations: [
      { integrationId: "meta-business-manager", displayName: "Meta Business Manager", category: "Paid Advertising", role: "primary"  },
      { integrationId: "ga4",                   displayName: "Google Analytics 4",    category: "Analytics",        role: "optional" },
    ],

    reports: [
      { reportId: "meta-monthly",    displayName: "Monthly Meta Ads Report",    frequency: "monthly", source: "RTM OS Reporting" },
      { reportId: "meta-performance",displayName: "Meta Performance Report",    frequency: "weekly",  source: "Meta Ads Manager" },
      { reportId: "meta-executive",  displayName: "Executive Meta Summary",     frequency: "monthly", source: "RTM OS Reporting" },
    ],

    workflows: [
      { workflowId: "meta-launch",       displayName: "Meta Campaign Launch",      description: "Onboarding workflow for new Meta ad campaigns."           },
      { workflowId: "meta-optimization", displayName: "Monthly Meta Optimization", description: "Recurring monthly creative and bid optimization workflow." },
    ],

    roles: [
      { id: "meta-head",      name: "Department Head", type: "manager", description: "Leads Meta Ads strategy."       },
      { id: "meta-specialist",name: "Specialist",      type: "member",  description: "Manages Meta ad campaigns."     },
    ],
  },

  // ─── Content ────────────────────────────────────────────────────────────────
  {
    id: "content",
    name: "Content",
    description: "Blog, social media, copywriting, media production, and content delivery.",
    departmentType: "service",
    status: "active",
    owner: "Alex R.",
    accentColor: "#7C3AED",
    baseRoute: "/departments/content",
    workspaceSlug: "content",

    modules: defaultModules({ "audits": false }),

    kpis: [
      {
        id: "content-kpi-1",
        name: "Deliverables Completed",
        metricType: "count",
        target: "95%+ on time",
        warningThreshold: "80%",
        criticalThreshold: "65%",
        dataSource: "RTM OS",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "content-kpi-2",
        name: "Avg Turnaround Time",
        metricType: "duration",
        target: "<3 days",
        warningThreshold: "5 days",
        criticalThreshold: "8 days",
        dataSource: "RTM OS",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
      {
        id: "content-kpi-3",
        name: "Revision Rate",
        metricType: "percentage",
        unit: "%",
        target: "<15%",
        warningThreshold: "25%",
        criticalThreshold: "40%",
        dataSource: "RTM OS",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
      {
        id: "content-kpi-4",
        name: "Clients Managed",
        metricType: "count",
        target: "Active",
        warningThreshold: "",
        criticalThreshold: "",
        dataSource: "RTM OS",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
    ],

    integrations: [
      { integrationId: "ga4",            displayName: "Google Analytics 4", category: "Analytics",    role: "optional"          },
      { integrationId: "google-drive",   displayName: "Google Drive",       category: "Storage",      role: "required"          },
      { integrationId: "semrush",        displayName: "SEMrush",            category: "SEO",          role: "optional"          },
    ],

    reports: [
      { reportId: "content-monthly",     displayName: "Monthly Content Report",     frequency: "monthly", source: "RTM OS Reporting" },
      { reportId: "content-performance", displayName: "Content Performance Report", frequency: "monthly", source: "GA4"              },
    ],

    workflows: [
      { workflowId: "content-brief",    displayName: "Content Brief Workflow",    description: "Brief creation and approval process for new content."         },
      { workflowId: "content-delivery", displayName: "Content Delivery Workflow", description: "Monthly content delivery and client sign-off workflow."       },
    ],

    roles: [
      { id: "content-head",     name: "Department Head",   type: "manager", description: "Leads content strategy and quality standards." },
      { id: "content-writer",   name: "Content Writer",    type: "member",  description: "Creates blog posts, copy, and social content." },
      { id: "content-editor",   name: "Editor",            type: "lead",    description: "Reviews and approves content before delivery." },
    ],
  },

  // ─── Design ─────────────────────────────────────────────────────────────────
  {
    id: "design",
    name: "Design",
    description: "Graphic design, ad creative production, video, and brand asset management.",
    departmentType: "service",
    status: "active",
    owner: "Chris D.",
    accentColor: "#0891B2",
    baseRoute: "/departments/design",
    workspaceSlug: "web-development-design",

    modules: defaultModules({ "audits": false, "knowledge-base": false }),

    kpis: [
      {
        id: "design-kpi-1",
        name: "Requests Completed On Time",
        metricType: "percentage",
        unit: "%",
        target: "95%+",
        warningThreshold: "80%",
        criticalThreshold: "65%",
        dataSource: "RTM OS",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "design-kpi-2",
        name: "Avg Turnaround",
        metricType: "duration",
        target: "<3 days",
        warningThreshold: "5 days",
        criticalThreshold: "8 days",
        dataSource: "RTM OS",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
      {
        id: "design-kpi-3",
        name: "Revision Rate",
        metricType: "percentage",
        unit: "%",
        target: "<15%",
        warningThreshold: "25%",
        criticalThreshold: "40%",
        dataSource: "RTM OS",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
      {
        id: "design-kpi-4",
        name: "Active Requests",
        metricType: "count",
        target: "Healthy queue",
        warningThreshold: "",
        criticalThreshold: "",
        dataSource: "RTM OS",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "neutral",
      },
    ],

    integrations: [
      { integrationId: "figma",                 displayName: "Figma",                category: "Design",    role: "primary"  },
      { integrationId: "adobe-creative-cloud",  displayName: "Adobe Creative Cloud", category: "Design",    role: "required" },
      { integrationId: "frame-io",              displayName: "Frame.io",             category: "Review",    role: "optional" },
    ],

    reports: [
      { reportId: "design-performance", displayName: "Design Performance Report", frequency: "monthly", source: "RTM OS Reporting" },
    ],

    workflows: [
      { workflowId: "design-request",  displayName: "Creative Request Workflow",  description: "Intake and delivery workflow for new creative requests."   },
      { workflowId: "design-approval", displayName: "Creative Review & Approval", description: "Client-facing approval workflow for design deliverables."  },
    ],

    roles: [
      { id: "design-head",       name: "Department Head", type: "manager", description: "Leads creative vision and quality standards."  },
      { id: "design-designer",   name: "Designer",        type: "member",  description: "Creates visual assets and ad creatives."       },
      { id: "design-contractor", name: "Contractor",      type: "member",  description: "Freelance creative delivery."                  },
    ],
  },

  // ─── Reporting ──────────────────────────────────────────────────────────────
  {
    id: "reporting",
    name: "Reporting",
    description: "Client reporting, performance dashboards, analytics delivery, and data intelligence.",
    departmentType: "service",
    status: "active",
    owner: "Chris D.",
    accentColor: "#0F766E",
    baseRoute: "/departments/reporting",
    workspaceSlug: "reporting",

    modules: defaultModules({ "audits": false }),

    kpis: [
      {
        id: "reporting-kpi-1",
        name: "Reports Delivered On Time",
        metricType: "percentage",
        unit: "%",
        target: "100%",
        warningThreshold: "90%",
        criticalThreshold: "75%",
        dataSource: "RTM OS",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "reporting-kpi-2",
        name: "Reports Overdue",
        metricType: "count",
        target: "0",
        warningThreshold: "3",
        criticalThreshold: "8",
        dataSource: "RTM OS",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
      {
        id: "reporting-kpi-3",
        name: "QA Pass Rate",
        metricType: "percentage",
        unit: "%",
        target: "98%+",
        warningThreshold: "90%",
        criticalThreshold: "80%",
        dataSource: "RTM OS",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "reporting-kpi-4",
        name: "Avg Report Delay",
        metricType: "duration",
        target: "0 days",
        warningThreshold: "1 day",
        criticalThreshold: "3 days",
        dataSource: "RTM OS",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
    ],

    integrations: [
      { integrationId: "power-bi",       displayName: "Power BI",        category: "Reporting",  role: "primary"  },
      { integrationId: "ga4",            displayName: "GA4",             category: "Analytics",  role: "required" },
      { integrationId: "google-sheets",  displayName: "Google Sheets",   category: "Reporting",  role: "required" },
      { integrationId: "looker-studio",  displayName: "Looker Studio",   category: "Reporting",  role: "optional" },
    ],

    reports: [
      { reportId: "reporting-dept",      displayName: "Department Reporting Report",  frequency: "monthly",   source: "RTM OS"       },
      { reportId: "reporting-executive", displayName: "Executive Reports",            frequency: "monthly",   source: "RTM OS"       },
      { reportId: "reporting-client",    displayName: "Client Reports",               frequency: "monthly",   source: "RTM OS"       },
      { reportId: "reporting-performance",displayName: "Performance Reports",         frequency: "monthly",   source: "RTM OS"       },
    ],

    workflows: [
      { workflowId: "report-production", displayName: "Report Production Pipeline", description: "End-to-end report production, QA, and delivery workflow." },
      { workflowId: "report-qbr",        displayName: "QBR Report Workflow",        description: "Quarterly business review report generation."              },
    ],

    roles: [
      { id: "reporting-head",     name: "Department Head",  type: "manager", description: "Owns reporting strategy and delivery standards." },
      { id: "reporting-analyst",  name: "Analyst",          type: "member",  description: "Builds and delivers performance reports."        },
    ],
  },

  // ─── IT & Security ──────────────────────────────────────────────────────────
  {
    id: "it-security",
    name: "IT & Security",
    description: "Infrastructure, systems integrity, security policies, and access management.",
    departmentType: "core",
    status: "active",
    owner: "Chris D.",
    accentColor: "#374151",
    baseRoute: "/departments/it-security",
    workspaceSlug: "it-security",

    modules: defaultModules({ "audits": true }),

    kpis: [
      {
        id: "it-kpi-1",
        name: "System Uptime",
        metricType: "percentage",
        unit: "%",
        target: "99.9%",
        warningThreshold: "99%",
        criticalThreshold: "95%",
        dataSource: "Internal Monitoring",
        reportingFrequency: "daily",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "it-kpi-2",
        name: "Open Security Issues",
        metricType: "count",
        target: "0",
        warningThreshold: "2",
        criticalThreshold: "5",
        dataSource: "Internal",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
      {
        id: "it-kpi-3",
        name: "SSL Renewals Due",
        metricType: "count",
        target: "0",
        warningThreshold: "3",
        criticalThreshold: "7",
        dataSource: "Internal",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
      {
        id: "it-kpi-4",
        name: "Open Tickets",
        metricType: "count",
        target: "<5",
        warningThreshold: "10",
        criticalThreshold: "20",
        dataSource: "RTM OS",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "down-good",
      },
    ],

    integrations: [
      { integrationId: "1password",          displayName: "1Password",          category: "Security",          role: "required" },
      { integrationId: "google-workspace",   displayName: "Google Workspace",   category: "Productivity",      role: "primary"  },
    ],

    reports: [
      { reportId: "it-security-report",  displayName: "IT Security Report",   frequency: "monthly", source: "Internal Monitoring" },
      { reportId: "it-system-health",    displayName: "System Health Report",  frequency: "weekly",  source: "Internal Monitoring" },
    ],

    workflows: [
      { workflowId: "it-user-onboarding",  displayName: "New User Onboarding",  description: "Access provisioning workflow for new hires."       },
      { workflowId: "it-user-offboarding", displayName: "User Offboarding",     description: "Access revocation and cleanup workflow."           },
      { workflowId: "it-security-audit",   displayName: "Security Audit",       description: "Recurring security audit and compliance check."    },
    ],

    roles: [
      { id: "it-admin",    name: "IT Administrator", type: "manager", description: "Manages all tools, access, and security policies." },
      { id: "it-analyst",  name: "IT Analyst",       type: "member",  description: "Monitors systems and resolves tickets."            },
    ],
  },

  // ─── AI Automation ──────────────────────────────────────────────────────────
  {
    id: "ai-automation",
    name: "AI Automation",
    description: "AI workflow automation, voice agents, chatbot builds, and intelligent process design.",
    departmentType: "service",
    status: "active",
    owner: "Jordan M.",
    accentColor: "#6D28D9",
    baseRoute: "/departments/ai-automation",
    workspaceSlug: undefined,

    modules: defaultModules({ "audits": false }),

    kpis: [
      {
        id: "ai-kpi-1",
        name: "Active Automations",
        metricType: "count",
        target: "Growing",
        warningThreshold: "",
        criticalThreshold: "",
        dataSource: "Make.com / n8n",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "ai-kpi-2",
        name: "Call Classifications (AI)",
        metricType: "count",
        target: "500+ / mo",
        warningThreshold: "200",
        criticalThreshold: "50",
        dataSource: "VAPI / GoHighLevel",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "ai-kpi-3",
        name: "Automation Success Rate",
        metricType: "percentage",
        unit: "%",
        target: "98%+",
        warningThreshold: "90%",
        criticalThreshold: "80%",
        dataSource: "Make.com / n8n",
        reportingFrequency: "weekly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
      {
        id: "ai-kpi-4",
        name: "Est. Time Saved (hrs / mo)",
        metricType: "duration",
        target: "200+ hrs",
        warningThreshold: "100 hrs",
        criticalThreshold: "40 hrs",
        dataSource: "RTM OS",
        reportingFrequency: "monthly",
        dashboardVisible: true,
        trendDirection: "up-good",
      },
    ],

    integrations: [
      { integrationId: "openai",         displayName: "OpenAI",         category: "AI / Automation", role: "primary"  },
      { integrationId: "vapi",           displayName: "VAPI",           category: "AI / Automation", role: "required" },
      { integrationId: "twilio",         displayName: "Twilio",         category: "Communication",   role: "required" },
      { integrationId: "gohighlevel",    displayName: "GoHighLevel",    category: "CRM",             role: "required" },
      { integrationId: "make",           displayName: "Make.com",       category: "AI / Automation", role: "optional" },
      { integrationId: "n8n",            displayName: "n8n",            category: "AI / Automation", role: "optional" },
    ],

    reports: [
      { reportId: "ai-automation-report",  displayName: "AI Automation Report",    frequency: "monthly", source: "Make.com + VAPI" },
      { reportId: "ai-performance",        displayName: "Automation Performance",  frequency: "monthly", source: "RTM OS"          },
    ],

    workflows: [
      { workflowId: "ai-setup",    displayName: "AI Automation Setup",    description: "Onboarding workflow for new automation builds."         },
      { workflowId: "ai-chatbot",  displayName: "Chatbot Build & Launch", description: "End-to-end chatbot development and launch workflow."     },
      { workflowId: "ai-review",   displayName: "Automation QA Review",   description: "Quality assurance workflow for live automations."       },
    ],

    roles: [
      { id: "ai-head",       name: "Department Head",       type: "manager", description: "Leads AI product strategy and delivery."         },
      { id: "ai-specialist", name: "Automation Specialist", type: "member",  description: "Builds and manages AI workflows and automations." },
      { id: "ai-strategist", name: "Strategist",            type: "lead",    description: "Designs automation architecture and roadmaps."    },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// LOOKUP HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getDepartmentConfig(id: string): DepartmentConfig | undefined {
  return DEPARTMENT_CONFIGS.find((d) => d.id === id);
}

export function getDepartmentsByType(
  type: DepartmentConfig["departmentType"]
): DepartmentConfig[] {
  return DEPARTMENT_CONFIGS.filter((d) => d.departmentType === type);
}

export function getActiveDepartments(): DepartmentConfig[] {
  return DEPARTMENT_CONFIGS.filter((d) => d.status === "active");
}

export function getDepartmentModule(
  deptId: string,
  moduleId: DepartmentConfig["modules"][number]["id"]
): DepartmentConfig["modules"][number] | undefined {
  return getDepartmentConfig(deptId)?.modules.find((m) => m.id === moduleId);
}

export function isDepartmentModuleEnabled(deptId: string, moduleId: string): boolean {
  return getDepartmentConfig(deptId)?.modules.find((m) => m.id === moduleId)?.enabled ?? false;
}
