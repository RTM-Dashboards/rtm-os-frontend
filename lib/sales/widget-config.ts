// RTM OS — Sales Dashboard Widget Configuration
// Defines which KPI cards are available on each configurable dashboard page.
// Add entries here to register new widgets; page files read from these arrays.

export type WidgetPageId = "performance" | "tasks" | "affiliates" | "leads";

export interface WidgetDefinition {
  id: string;
  pageId: WidgetPageId;
  label: string;
  description: string;
  defaultVisible: boolean;
  defaultOrder: number;
}

// ─── Performance Page Widgets ─────────────────────────────────────────────────
// Mirrors the KPI cards rendered in the "Key Performance Indicators" section
// of app/(sales)/sales/performance/page.tsx — order matches current display order.

export const PERFORMANCE_WIDGETS: WidgetDefinition[] = [
  {
    id: "perf-ghl-contacts",
    pageId: "performance",
    label: "GHL Contacts Synced",
    description: "Total contacts synced from GoHighLevel CRM.",
    defaultVisible: true,
    defaultOrder: 0,
  },
  {
    id: "perf-open-opportunities",
    pageId: "performance",
    label: "Open Opportunities",
    description: "Count of active open opportunities in the pipeline.",
    defaultVisible: true,
    defaultOrder: 1,
  },
  {
    id: "perf-pipeline-value",
    pageId: "performance",
    label: "Pipeline Value",
    description: "Total estimated value of all non-lost opportunities.",
    defaultVisible: true,
    defaultOrder: 2,
  },
  {
    id: "perf-weighted-forecast",
    pageId: "performance",
    label: "Weighted Forecast",
    description: "Probability-adjusted revenue forecast across open opportunities.",
    defaultVisible: true,
    defaultOrder: 3,
  },
  {
    id: "perf-closed-won-revenue",
    pageId: "performance",
    label: "Closed Won Revenue",
    description: "Monthly revenue generated from closed-won deals.",
    defaultVisible: true,
    defaultOrder: 4,
  },
  {
    id: "perf-closed-lost-revenue",
    pageId: "performance",
    label: "Closed Lost Revenue",
    description: "Estimated revenue lost from closed-lost opportunities.",
    defaultVisible: true,
    defaultOrder: 5,
  },
  {
    id: "perf-win-rate",
    pageId: "performance",
    label: "Win Rate",
    description: "Closed Won divided by total closed deals (Won + Lost).",
    defaultVisible: true,
    defaultOrder: 6,
  },
  {
    id: "perf-avg-sales-cycle",
    pageId: "performance",
    label: "Avg Sales Cycle",
    description: "Average number of days from lead creation to closed won.",
    defaultVisible: true,
    defaultOrder: 7,
  },
];

// ─── Tasks Page Widgets ───────────────────────────────────────────────────────
// Mirrors the KPI bar rendered in app/(sales)/sales/tasks/page.tsx.

export const TASKS_WIDGETS: WidgetDefinition[] = [
  {
    id: "tasks-total",
    pageId: "tasks",
    label: "Total Tasks",
    description: "Total count of all tasks in the Sales workspace.",
    defaultVisible: true,
    defaultOrder: 0,
  },
  {
    id: "tasks-in-progress",
    pageId: "tasks",
    label: "In Progress",
    description: "Tasks currently being worked on.",
    defaultVisible: true,
    defaultOrder: 1,
  },
  {
    id: "tasks-in-review",
    pageId: "tasks",
    label: "In Review",
    description: "Tasks that have been submitted and are awaiting review.",
    defaultVisible: true,
    defaultOrder: 2,
  },
  {
    id: "tasks-blocked",
    pageId: "tasks",
    label: "Blocked",
    description: "Tasks that cannot proceed due to a dependency or issue.",
    defaultVisible: true,
    defaultOrder: 3,
  },
  {
    id: "tasks-done",
    pageId: "tasks",
    label: "Done",
    description: "Completed tasks in the Sales workspace.",
    defaultVisible: true,
    defaultOrder: 4,
  },
];

// ─── Affiliates Page Widgets ──────────────────────────────────────────────────
// Mirrors the KPI cards rendered in app/(sales)/sales/affiliates/page.tsx.

export const AFFILIATES_WIDGETS: WidgetDefinition[] = [
  {
    id: "aff-active-affiliates",
    pageId: "affiliates",
    label: "Active Affiliates",
    description: "Count of affiliates with Active status.",
    defaultVisible: true,
    defaultOrder: 0,
  },
  {
    id: "aff-referral-leads",
    pageId: "affiliates",
    label: "Referral Leads",
    description: "Total leads submitted across all affiliates.",
    defaultVisible: true,
    defaultOrder: 1,
  },
  {
    id: "aff-qualified-referrals",
    pageId: "affiliates",
    label: "Qualified Referrals",
    description: "Referral leads that have progressed to qualified status.",
    defaultVisible: true,
    defaultOrder: 2,
  },
  {
    id: "aff-closed-won-deals",
    pageId: "affiliates",
    label: "Closed Won Deals",
    description: "Total deals won that originated from affiliate referrals.",
    defaultVisible: true,
    defaultOrder: 3,
  },
  {
    id: "aff-referral-revenue",
    pageId: "affiliates",
    label: "Referral Revenue",
    description: "Total monthly recurring revenue generated through affiliates.",
    defaultVisible: true,
    defaultOrder: 4,
  },
  {
    id: "aff-pending-commissions",
    pageId: "affiliates",
    label: "Pending Commissions",
    description: "Total commission amounts currently owed to affiliates.",
    defaultVisible: true,
    defaultOrder: 5,
  },
  {
    id: "aff-paid-commissions",
    pageId: "affiliates",
    label: "Paid Commissions",
    description: "Total commission amounts paid to affiliates to date.",
    defaultVisible: true,
    defaultOrder: 6,
  },
  {
    id: "aff-avg-affiliate-value",
    pageId: "affiliates",
    label: "Avg. Affiliate Value",
    description: "Average monthly revenue generated per closed affiliate deal.",
    defaultVisible: true,
    defaultOrder: 7,
  },
];

// ─── Leads Page Widgets ──────────────────────────────────────────────────────
// Mirrors the KPI cards rendered in app/(sales)/sales/leads/page.tsx.
// Widgets hidden by default are secondary metrics not needed in daily use.

export const LEADS_WIDGETS: WidgetDefinition[] = [
  {
    id: "leads-new",
    pageId: "leads",
    label: "New Leads",
    description: "Leads that have just entered the pipeline and not yet been contacted.",
    defaultVisible: true,
    defaultOrder: 1,
  },
  {
    id: "leads-contact-attempted",
    pageId: "leads",
    label: "Contact Attempted",
    description: "Leads where outreach has been initiated but contact not yet confirmed.",
    defaultVisible: true,
    defaultOrder: 2,
  },
  {
    id: "leads-contacted",
    pageId: "leads",
    label: "Contacted",
    description: "Leads where two-way contact has been established.",
    defaultVisible: true,
    defaultOrder: 3,
  },
  {
    id: "leads-discovery-scheduled",
    pageId: "leads",
    label: "Discovery Scheduled",
    description: "Leads with a discovery call or meeting booked.",
    defaultVisible: true,
    defaultOrder: 4,
  },
  {
    id: "leads-discovery-complete",
    pageId: "leads",
    label: "Discovery Complete",
    description: "Leads where the discovery call has been completed.",
    defaultVisible: true,
    defaultOrder: 5,
  },
  {
    id: "leads-qualified",
    pageId: "leads",
    label: "Qualified",
    description: "Leads that have met all qualification criteria and are ready for opportunity creation.",
    defaultVisible: true,
    defaultOrder: 6,
  },
  {
    id: "leads-disqualified",
    pageId: "leads",
    label: "Disqualified",
    description: "Leads that did not meet qualification criteria and have been removed from active pipeline.",
    defaultVisible: false,
    defaultOrder: 7,
  },
  {
    id: "leads-conversion",
    pageId: "leads",
    label: "Conversion Rate",
    description: "Percentage of total leads that have reached Qualified stage.",
    defaultVisible: true,
    defaultOrder: 8,
  },
  {
    id: "leads-ghl-contacts",
    pageId: "leads",
    label: "GHL Contacts",
    description: "Total GHL contacts successfully synced. Secondary metric — hidden by default.",
    defaultVisible: false,
    defaultOrder: 9,
  },
];

// ─── Lookup Helper ────────────────────────────────────────────────────────────

export function getWidgetsForPage(pageId: WidgetPageId): WidgetDefinition[] {
  switch (pageId) {
    case "performance":
      return PERFORMANCE_WIDGETS;
    case "tasks":
      return TASKS_WIDGETS;
    case "affiliates":
      return AFFILIATES_WIDGETS;
    case "leads":
      return LEADS_WIDGETS;
  }
}
