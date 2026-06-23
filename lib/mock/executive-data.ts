// RTM OS — Executive Command Center Mock Data
// Realistic agency-level executive data for leadership dashboards.

// ── Revenue ─────────────────────────────────────────────────────────────────

export const executiveRevenue = {
  totalRevenue:       "$2,847,320",
  mrr:                "$247,600",
  arr:                "$2,971,200",
  revenueAtRisk:      "$84,200",
  monthlyRevenue:     "$247,600",
  recurringRevenue:   "$198,400",
  setupRevenue:       "$24,800",
  expansionRevenue:   "$18,200",
  cancelledRevenue:   "$6,800",
  renewalForecast:    "$231,400",
  mrrGrowth:          "+4.2%",
  arrGrowth:          "+4.2%",
  revenueAtRiskPct:   "3.1%",
};

export const revenueHistory = [
  { month: "Jan", mrr: 218000, arr: 2616000 },
  { month: "Feb", mrr: 224000, arr: 2688000 },
  { month: "Mar", mrr: 229000, arr: 2748000 },
  { month: "Apr", mrr: 235000, arr: 2820000 },
  { month: "May", mrr: 241000, arr: 2892000 },
  { month: "Jun", mrr: 247600, arr: 2971200 },
];

// ── Client Health ────────────────────────────────────────────────────────────

export const clientHealthOverview = {
  total:    184,
  healthy:  132,
  monitor:   31,
  atRisk:    16,
  critical:   5,
};

export const atRiskClients = [
  {
    id: "c1",
    name: "Sunbelt HVAC",
    health: "critical" as const,
    mrr: "$4,200",
    owner: "Sarah K.",
    riskReason: "2 consecutive missed check-ins; NPS dropped to 4",
    lastContact: "18 days ago",
    impact: "High",
    services: ["SEO", "GBP", "PPC"],
  },
  {
    id: "c2",
    name: "Harbor Auto Group",
    health: "critical" as const,
    mrr: "$6,800",
    owner: "Jordan M.",
    riskReason: "Cancellation request submitted; save attempt in progress",
    lastContact: "3 days ago",
    impact: "High",
    services: ["Meta Ads", "PPC", "SEO"],
  },
  {
    id: "c3",
    name: "Cascade Flooring",
    health: "at-risk" as const,
    mrr: "$3,100",
    owner: "Alex R.",
    riskReason: "ROI concerns raised; billing dispute open",
    lastContact: "7 days ago",
    impact: "Medium",
    services: ["SEO", "GBP"],
  },
  {
    id: "c4",
    name: "Ridgeline Roofing",
    health: "at-risk" as const,
    mrr: "$2,900",
    owner: "Mike T.",
    riskReason: "No report delivered in 45 days; client escalated",
    lastContact: "11 days ago",
    impact: "Medium",
    services: ["Reporting", "SEO"],
  },
  {
    id: "c5",
    name: "Pacific Dental Group",
    health: "at-risk" as const,
    mrr: "$5,400",
    owner: "Sarah K.",
    riskReason: "Leadership change at client; new POC unresponsive",
    lastContact: "14 days ago",
    impact: "High",
    services: ["PPC", "Meta Ads", "SEO"],
  },
];

export const clientHealthTrend = [
  { month: "Jan", healthy: 128, monitor: 34, atRisk: 18, critical: 4 },
  { month: "Feb", healthy: 130, monitor: 33, atRisk: 17, critical: 4 },
  { month: "Mar", healthy: 131, monitor: 33, atRisk: 16, critical: 4 },
  { month: "Apr", healthy: 132, monitor: 32, atRisk: 16, critical: 4 },
  { month: "May", healthy: 133, monitor: 31, atRisk: 15, critical: 5 },
  { month: "Jun", healthy: 132, monitor: 31, atRisk: 16, critical: 5 },
];

// ── Projects ─────────────────────────────────────────────────────────────────

export const projectDeliveryOverview = {
  active:     94,
  delayed:    18,
  blocked:     7,
  completed: 312,
  launchDelays: 5,
  deliveryRisk: "$38,400",
};

export const delayedProjects = [
  {
    id: "p1",
    name: "Harbor Auto — Website Redesign",
    department: "Web Development",
    owner: "Chris L.",
    daysDelayed: 14,
    riskLevel: "critical" as const,
    blockerReason: "Client asset delivery 12 days late; revised launch date TBD",
    clientImpact: "$6,800/mo",
    status: "blocked",
  },
  {
    id: "p2",
    name: "Summit Landscaping — Q2 Campaign Launch",
    department: "PPC",
    owner: "Dana W.",
    daysDelayed: 8,
    riskLevel: "at-risk" as const,
    blockerReason: "Creative assets pending approval from design team",
    clientImpact: "$3,200/mo",
    status: "delayed",
  },
  {
    id: "p3",
    name: "Blue Ridge Plumbing — GBP Optimization",
    department: "GBP",
    owner: "Lisa P.",
    daysDelayed: 6,
    riskLevel: "at-risk" as const,
    blockerReason: "Google verification hold; awaiting postcard delivery",
    clientImpact: "$1,400/mo",
    status: "delayed",
  },
  {
    id: "p4",
    name: "Pacific Dental — Monthly Reports",
    department: "Reporting",
    owner: "Jordan M.",
    daysDelayed: 19,
    riskLevel: "critical" as const,
    blockerReason: "Data integration failure from analytics platform",
    clientImpact: "$5,400/mo",
    status: "blocked",
  },
];

export const departmentBottlenecks = [
  { department: "Reporting", overdueItems: 12, severity: "critical" as const },
  { department: "Web Development", overdueItems: 9, severity: "critical" as const },
  { department: "Creative", overdueItems: 7, severity: "at-risk" as const },
  { department: "GBP", overdueItems: 5, severity: "at-risk" as const },
  { department: "SEO", overdueItems: 4, severity: "warning" as const },
];

// ── Renewals ─────────────────────────────────────────────────────────────────

export const renewalsOverview = {
  due90Days:       42,
  due60Days:       28,
  due30Days:       14,
  renewalRevenue:  "$186,400",
  renewalRisk:     "$31,200",
  renewalForecast: "$155,200",
  renewalRate:     "91.4%",
};

export const upcomingRenewals = [
  {
    id: "r1",
    client: "Apex Roofing",
    renewalDate: "2025-07-15",
    mrr: "$3,800",
    risk: "low" as const,
    owner: "Jordan M.",
    daysOut: 14,
  },
  {
    id: "r2",
    client: "Green Valley Pools",
    renewalDate: "2025-07-08",
    mrr: "$2,600",
    risk: "medium" as const,
    owner: "Sarah K.",
    daysOut: 7,
  },
  {
    id: "r3",
    client: "Cascade Flooring",
    renewalDate: "2025-07-03",
    mrr: "$3,100",
    risk: "high" as const,
    owner: "Alex R.",
    daysOut: 2,
  },
  {
    id: "r4",
    client: "Mountain View Dental",
    renewalDate: "2025-07-22",
    mrr: "$4,100",
    risk: "low" as const,
    owner: "Mike T.",
    daysOut: 21,
  },
  {
    id: "r5",
    client: "Ridgeline Roofing",
    renewalDate: "2025-07-18",
    mrr: "$2,900",
    risk: "high" as const,
    owner: "Jordan M.",
    daysOut: 17,
  },
];

// ── Expansion ────────────────────────────────────────────────────────────────

export const expansionOverview = {
  opportunities:       28,
  pipelineValue:       "$94,800",
  highConfidence:      12,
  potentialMrrIncrease: "$18,600",
  potentialArrIncrease: "$223,200",
};

export const expansionOpportunities = [
  {
    id: "e1",
    client: "Apex Roofing",
    opportunity: "Add Meta Ads + Monthly Video",
    potentialMrr: "$2,800",
    confidence: "High",
    owner: "Jordan M.",
    stage: "Proposal Sent",
  },
  {
    id: "e2",
    client: "Blue Ridge Plumbing",
    opportunity: "Upgrade to Full SEO Package",
    potentialMrr: "$1,600",
    confidence: "High",
    owner: "Alex R.",
    stage: "In Discussion",
  },
  {
    id: "e3",
    client: "Summit Landscaping",
    opportunity: "LSA Setup + Management",
    potentialMrr: "$1,200",
    confidence: "Medium",
    owner: "Dana W.",
    stage: "Identified",
  },
];

// ── Cancellations & Retention ────────────────────────────────────────────────

export const cancellationOverview = {
  openRequests:      4,
  revenueAtRisk:     "$18,200",
  saveAttempts:      6,
  clientsSaved:      3,
  cancelledRevenue:  "$6,800",
};

export const cancellationReasons = [
  { reason: "ROI concerns", count: 2 },
  { reason: "Budget reduction", count: 1 },
  { reason: "Competitor switch", count: 1 },
  { reason: "Service dissatisfaction", count: 1 },
  { reason: "Business closure", count: 1 },
];

export const openCancellations = [
  {
    id: "can1",
    client: "Harbor Auto Group",
    mrr: "$6,800",
    requestDate: "2025-06-18",
    reason: "ROI concerns",
    saveAttempt: "In Progress",
    owner: "Jordan M.",
    risk: "critical" as const,
  },
  {
    id: "can2",
    client: "Valley Pest Control",
    mrr: "$2,100",
    requestDate: "2025-06-20",
    reason: "Budget reduction",
    saveAttempt: "Scheduled",
    owner: "Sarah K.",
    risk: "at-risk" as const,
  },
  {
    id: "can3",
    client: "Desert Sun Roofing",
    mrr: "$3,400",
    requestDate: "2025-06-22",
    reason: "Competitor switch",
    saveAttempt: "Not Started",
    owner: "Alex R.",
    risk: "critical" as const,
  },
  {
    id: "can4",
    client: "Northern Lights HVAC",
    mrr: "$1,900",
    requestDate: "2025-06-24",
    reason: "Service dissatisfaction",
    saveAttempt: "Scheduled",
    owner: "Mike T.",
    risk: "at-risk" as const,
  },
];

// ── Escalations ──────────────────────────────────────────────────────────────

export const escalationOverview = {
  open:         9,
  critical:     3,
  department:   5,
  client:       4,
  revenue:      3,
  execReview:   2,
};

export const openEscalations = [
  {
    id: "esc1",
    title: "Pacific Dental — No Report Delivered 19 Days",
    client: "Pacific Dental Group",
    department: "Reporting",
    severity: "critical" as const,
    owner: "Jordan M.",
    openedDate: "2025-06-12",
    impact: "$5,400/mo MRR",
    execReview: true,
  },
  {
    id: "esc2",
    title: "Harbor Auto — Website Project Blocked",
    client: "Harbor Auto Group",
    department: "Web Development",
    severity: "critical" as const,
    owner: "Chris L.",
    openedDate: "2025-06-16",
    impact: "$6,800/mo MRR + cancellation risk",
    execReview: true,
  },
  {
    id: "esc3",
    title: "Sunbelt HVAC — Client Unresponsive 18 Days",
    client: "Sunbelt HVAC",
    department: "Account Management",
    severity: "critical" as const,
    owner: "Sarah K.",
    openedDate: "2025-06-09",
    impact: "$4,200/mo MRR",
    execReview: false,
  },
  {
    id: "esc4",
    title: "Creative Backlog — 7 Overdue Deliverables",
    client: "Multiple",
    department: "Creative",
    severity: "warning" as const,
    owner: "Dana W.",
    openedDate: "2025-06-20",
    impact: "Blocks 3 project launches",
    execReview: false,
  },
  {
    id: "esc5",
    title: "Ridgeline Roofing — Billing Dispute Unresolved",
    client: "Ridgeline Roofing",
    department: "Billing",
    severity: "warning" as const,
    owner: "Lisa P.",
    openedDate: "2025-06-17",
    impact: "$2,900/mo at risk",
    execReview: false,
  },
];

// ── Department Performance ───────────────────────────────────────────────────

export interface DeptPerformance {
  name: string;
  slug: string;
  projects: number;
  openTasks: number;
  overdueTasks: number;
  escalations: number;
  kpiStatus: "on-track" | "behind" | "at-risk" | "critical";
  health: "healthy" | "warning" | "critical";
  bottleneck: string | null;
}

export const departmentPerformance: DeptPerformance[] = [
  {
    name: "Sales",
    slug: "sales",
    projects: 12,
    openTasks: 48,
    overdueTasks: 3,
    escalations: 0,
    kpiStatus: "on-track",
    health: "healthy",
    bottleneck: null,
  },
  {
    name: "Billing",
    slug: "billing",
    projects: 8,
    openTasks: 22,
    overdueTasks: 2,
    escalations: 1,
    kpiStatus: "on-track",
    health: "healthy",
    bottleneck: null,
  },
  {
    name: "Account Management",
    slug: "account-management",
    projects: 18,
    openTasks: 64,
    overdueTasks: 7,
    escalations: 3,
    kpiStatus: "behind",
    health: "warning",
    bottleneck: "3 at-risk clients need immediate outreach",
  },
  {
    name: "Operations",
    slug: "operations",
    projects: 6,
    openTasks: 18,
    overdueTasks: 1,
    escalations: 0,
    kpiStatus: "on-track",
    health: "healthy",
    bottleneck: null,
  },
  {
    name: "Reporting",
    slug: "reporting",
    projects: 22,
    openTasks: 41,
    overdueTasks: 12,
    escalations: 2,
    kpiStatus: "critical",
    health: "critical",
    bottleneck: "12 overdue reports; data integration failure blocking 4",
  },
  {
    name: "SEO",
    slug: "seo",
    projects: 31,
    openTasks: 87,
    overdueTasks: 4,
    escalations: 0,
    kpiStatus: "on-track",
    health: "healthy",
    bottleneck: null,
  },
  {
    name: "GBP",
    slug: "gbp",
    projects: 19,
    openTasks: 52,
    overdueTasks: 5,
    escalations: 0,
    kpiStatus: "behind",
    health: "warning",
    bottleneck: "5 verifications stalled by Google hold",
  },
  {
    name: "PPC",
    slug: "ppc",
    projects: 14,
    openTasks: 38,
    overdueTasks: 2,
    escalations: 0,
    kpiStatus: "on-track",
    health: "healthy",
    bottleneck: null,
  },
  {
    name: "Meta Ads",
    slug: "meta-ads",
    projects: 11,
    openTasks: 29,
    overdueTasks: 1,
    escalations: 0,
    kpiStatus: "on-track",
    health: "healthy",
    bottleneck: null,
  },
  {
    name: "LSA",
    slug: "lsa",
    projects: 9,
    openTasks: 24,
    overdueTasks: 2,
    escalations: 0,
    kpiStatus: "on-track",
    health: "healthy",
    bottleneck: null,
  },
  {
    name: "Web Development",
    slug: "web-development",
    projects: 16,
    openTasks: 61,
    overdueTasks: 9,
    escalations: 2,
    kpiStatus: "at-risk",
    health: "critical",
    bottleneck: "Harbor Auto blocked 14 days; 2 other launches delayed by assets",
  },
  {
    name: "Creative",
    slug: "creative",
    projects: 13,
    openTasks: 44,
    overdueTasks: 7,
    escalations: 1,
    kpiStatus: "at-risk",
    health: "warning",
    bottleneck: "Capacity constraint; 7 deliverables overdue blocking downstream",
  },
  {
    name: "AI Automation",
    slug: "ai-automation",
    projects: 4,
    openTasks: 11,
    overdueTasks: 0,
    escalations: 0,
    kpiStatus: "on-track",
    health: "healthy",
    bottleneck: null,
  },
  {
    name: "IT Support & Hosting",
    slug: "it-support",
    projects: 7,
    openTasks: 19,
    overdueTasks: 1,
    escalations: 0,
    kpiStatus: "on-track",
    health: "healthy",
    bottleneck: null,
  },
];

// ── AI Executive Summary Data ─────────────────────────────────────────────────

export const aiExecutiveSummary = {
  generatedAt: "Today, 8:30 AM",
  summary:
    "Agency performance is stable overall, with strong MRR growth of 4.2% month-over-month. However, three critical escalations require executive attention: Pacific Dental's reporting failure, Harbor Auto's blocked website project compounded by an active cancellation request, and a creative capacity constraint blocking multiple client launches. Reporting and Web Development departments are the primary bottlenecks this period.",
  topRisks: [
    { text: "Harbor Auto Group: active cancellation request + blocked website project = $6,800 MRR at risk", urgency: "critical" as const },
    { text: "Pacific Dental: 19 days without report delivery; client escalation open at exec level", urgency: "critical" as const },
    { text: "Sunbelt HVAC: 18 days without client contact; churn risk is high", urgency: "critical" as const },
    { text: "Reporting department: 12 overdue deliverables; data integration failure unresolved", urgency: "warn" as const },
  ],
  revenueRisks: [
    { text: "$84,200 total MRR at risk across 5 critical and at-risk clients", urgency: "warn" as const },
    { text: "$18,200 tied to open cancellation requests — 4 active save attempts needed", urgency: "warn" as const },
    { text: "$31,200 renewal revenue in the high-risk segment due in 90 days", urgency: "warn" as const },
  ],
  clientRisks: [
    { text: "5 clients in critical health; 16 total in at-risk range — churn curve increasing", urgency: "warn" as const },
    { text: "Pacific Dental and Harbor Auto have executive-level escalations open", urgency: "critical" as const },
  ],
  projectRisks: [
    { text: "18 delayed projects; 7 fully blocked. Creative backlog is blocking 3 downstream launches", urgency: "warn" as const },
    { text: "Web Development overdue tasks up 28% versus last month", urgency: "warn" as const },
  ],
  recommendedActions: [
    { text: "Schedule executive call with Harbor Auto Group this week — cancellation + project block", urgency: "critical" as const, category: "Immediate" },
    { text: "Escalate Pacific Dental reporting failure to department head; resolve data integration today", urgency: "critical" as const, category: "Immediate" },
    { text: "Initiate outreach to Sunbelt HVAC from senior leadership by end of day", urgency: "critical" as const, category: "Immediate" },
    { text: "Review Creative department capacity; consider contractor allocation for Q3", urgency: "warn" as const, category: "This Week" },
    { text: "Audit 14 renewal accounts due in 30 days; prioritize Cascade Flooring and Ridgeline Roofing", urgency: "warn" as const, category: "This Week" },
    { text: "Review expansion pipeline — 12 high-confidence opportunities worth $18,600 potential MRR", urgency: "info" as const, category: "This Month" },
  ],
  priorityDecisions: [
    { text: "Harbor Auto Group: approve service credit offer to save cancellation (estimated cost: $1,200)?", urgency: "critical" as const },
    { text: "Creative staffing: approve Q3 contractor budget to resolve capacity constraint?", urgency: "warn" as const },
    { text: "Reporting integration: approve emergency vendor escalation to fix data pipeline?", urgency: "critical" as const },
  ],
};
