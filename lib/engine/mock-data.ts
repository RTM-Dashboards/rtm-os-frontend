// =============================================================================
// RTM OS — Global Projects & Tasks Engine v1
// lib/engine/mock-data.ts
//
// Seed data wiring together the full hierarchy:
//   Projects → Milestones → Blueprints → Tasks → Departments
// =============================================================================

import type {
  Project,
  Milestone,
  Task,
  TaskBlueprint,
  AssignedUser,
  EngineStore,
  ActivityEntry,
  ProjectDepartment,
  DepartmentName,
} from "./types";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const USERS: AssignedUser[] = [
  { id: "u1", name: "Jessica Reyes",  initials: "JR", avatarColor: "#1B4FD8", role: "Account Manager" },
  { id: "u2", name: "Marcus Webb",    initials: "MW", avatarColor: "#059669", role: "SEO Lead" },
  { id: "u3", name: "Priya Nair",     initials: "PN", avatarColor: "#7C3AED", role: "Account Manager" },
  { id: "u4", name: "Daniel Okonkwo", initials: "DO", avatarColor: "#D97706", role: "Account Manager" },
  { id: "u5", name: "Sofia Castillo", initials: "SC", avatarColor: "#DC2626", role: "Meta Ads Specialist" },
  { id: "u6", name: "Aaron Park",     initials: "AP", avatarColor: "#0891B2", role: "SEO Specialist" },
  { id: "u7", name: "Lily Chen",      initials: "LC", avatarColor: "#BE185D", role: "Reporting Analyst" },
  { id: "u8", name: "Ryan Torres",    initials: "RT", avatarColor: "#065F46", role: "PPC Specialist" },
];

function user(id: string): AssignedUser {
  return USERS.find((u) => u.id === id)!;
}

// ---------------------------------------------------------------------------
// Task Blueprints
// ---------------------------------------------------------------------------

export const BLUEPRINTS: TaskBlueprint[] = [
  // BP-001: SEO Launch Blueprint
  {
    id: "bp-001",
    name: "SEO Launch Blueprint",
    department: "SEO",
    servicePackage: "SEO Only",
    mappedLineItem: "SEO Management",
    description: "Full SEO launch sequence: access collection, audit, keyword research, on-page, reporting setup.",
    activationTrigger: "Invoice Paid",
    estimatedTotalHours: 18,
    isActive: true,
    lastUpdated: "2025-07-01",
    version: "1.2",
    tasks: [
      { id: "bpt-001-1", name: "Collect GA4 & GSC Access",   department: "Account Management", ownerRole: "Account Manager",  estimatedHours: 0.5, priority: "Urgent", dueDaysOffset: 1,  description: "Request and collect GA4, GSC, and website admin access from client." },
      { id: "bpt-001-2", name: "Technical SEO Audit",         department: "SEO",                ownerRole: "SEO Lead",          estimatedHours: 4,   priority: "High",   dueDaysOffset: 5,  dependsOnId: "bpt-001-1", description: "Full Screaming Frog audit, Core Web Vitals, crawl errors." },
      { id: "bpt-001-3", name: "Competitor Analysis",         department: "SEO",                ownerRole: "SEO Specialist",    estimatedHours: 3,   priority: "High",   dueDaysOffset: 8,  dependsOnId: "bpt-001-1", description: "Semrush competitor gap analysis for top 3 competitors." },
      { id: "bpt-001-4", name: "Keyword Research & Map",      department: "SEO",                ownerRole: "SEO Specialist",    estimatedHours: 4,   priority: "High",   dueDaysOffset: 12, dependsOnId: "bpt-001-3", description: "Build keyword map, cluster by page, assign targets." },
      { id: "bpt-001-5", name: "On-Page Optimization",        department: "SEO",                ownerRole: "SEO Specialist",    estimatedHours: 4,   priority: "High",   dueDaysOffset: 18, dependsOnId: "bpt-001-4", description: "Meta titles, H1s, schema, internal linking." },
      { id: "bpt-001-6", name: "SEO Reporting Setup",         department: "Reporting",          ownerRole: "Reporting Analyst", estimatedHours: 2,   priority: "Medium", dueDaysOffset: 21, dependsOnId: "bpt-001-2", description: "Connect AgencyAnalytics, build monthly SEO report template." },
    ],
  },

  // BP-002: GBP Launch Blueprint
  {
    id: "bp-002",
    name: "GBP Launch Blueprint",
    department: "GBP",
    servicePackage: "SEO + GBP",
    mappedLineItem: "GBP Management",
    description: "Google Business Profile setup, optimization, and monthly management cadence.",
    activationTrigger: "Invoice Paid",
    estimatedTotalHours: 8,
    isActive: true,
    lastUpdated: "2025-07-01",
    version: "1.0",
    tasks: [
      { id: "bpt-002-1", name: "Collect GBP Admin Access",   department: "Account Management", ownerRole: "Account Manager",  estimatedHours: 0.5, priority: "Urgent", dueDaysOffset: 1 },
      { id: "bpt-002-2", name: "GBP Profile Audit",           department: "GBP",                ownerRole: "SEO Specialist",    estimatedHours: 2,   priority: "High",   dueDaysOffset: 5,  dependsOnId: "bpt-002-1" },
      { id: "bpt-002-3", name: "GBP Profile Optimization",   department: "GBP",                ownerRole: "SEO Specialist",    estimatedHours: 3,   priority: "High",   dueDaysOffset: 10, dependsOnId: "bpt-002-2" },
      { id: "bpt-002-4", name: "GBP Photo Upload",            department: "GBP",                ownerRole: "SEO Specialist",    estimatedHours: 1,   priority: "Medium", dueDaysOffset: 12, dependsOnId: "bpt-002-3" },
      { id: "bpt-002-5", name: "Monthly GBP Review Setup",   department: "GBP",                ownerRole: "SEO Lead",          estimatedHours: 1,   priority: "Low",    dueDaysOffset: 14 },
    ],
  },

  // BP-003: PPC Launch Blueprint
  {
    id: "bp-003",
    name: "PPC Launch Blueprint",
    department: "PPC",
    servicePackage: "PPC + Landing Page",
    mappedLineItem: "Google Ads Management",
    description: "Google Ads campaign build, conversion tracking, and ongoing optimization setup.",
    activationTrigger: "Invoice Paid",
    estimatedTotalHours: 14,
    isActive: true,
    lastUpdated: "2025-07-05",
    version: "2.1",
    tasks: [
      { id: "bpt-003-1", name: "Collect Google Ads Access",   department: "Account Management", ownerRole: "Account Manager",  estimatedHours: 0.5, priority: "Urgent", dueDaysOffset: 1 },
      { id: "bpt-003-2", name: "Campaign Strategy Brief",     department: "PPC",                ownerRole: "PPC Specialist",    estimatedHours: 2,   priority: "High",   dueDaysOffset: 4,  dependsOnId: "bpt-003-1" },
      { id: "bpt-003-3", name: "Campaign Structure Build",    department: "PPC",                ownerRole: "PPC Specialist",    estimatedHours: 4,   priority: "High",   dueDaysOffset: 8,  dependsOnId: "bpt-003-2" },
      { id: "bpt-003-4", name: "Ad Copy Creation",            department: "PPC",                ownerRole: "PPC Specialist",    estimatedHours: 3,   priority: "High",   dueDaysOffset: 10, dependsOnId: "bpt-003-3" },
      { id: "bpt-003-5", name: "Conversion Tracking Setup",  department: "PPC",                ownerRole: "PPC Specialist",    estimatedHours: 2,   priority: "High",   dueDaysOffset: 12, dependsOnId: "bpt-003-3" },
      { id: "bpt-003-6", name: "Campaign QA & Launch",        department: "PPC",                ownerRole: "PPC Specialist",    estimatedHours: 2,   priority: "Urgent", dueDaysOffset: 14, dependsOnId: "bpt-003-5" },
    ],
  },

  // BP-004: Client Onboarding Blueprint
  {
    id: "bp-004",
    name: "Client Onboarding Blueprint",
    department: "Account Management",
    servicePackage: "Custom",
    mappedLineItem: "Account Management",
    description: "Universal onboarding sequence fired for every new client regardless of service.",
    activationTrigger: "Contract Signed",
    estimatedTotalHours: 5,
    isActive: true,
    lastUpdated: "2025-07-10",
    version: "3.0",
    tasks: [
      { id: "bpt-004-1", name: "Assign Account Manager",        department: "Account Management", ownerRole: "Operations Lead",  estimatedHours: 0.25, priority: "Urgent", dueDaysOffset: 1 },
      { id: "bpt-004-2", name: "Send Welcome Email & Form",     department: "Account Management", ownerRole: "Account Manager",  estimatedHours: 0.5,  priority: "High",   dueDaysOffset: 1,  dependsOnId: "bpt-004-1" },
      { id: "bpt-004-3", name: "Schedule Kickoff Call",         department: "Account Management", ownerRole: "Account Manager",  estimatedHours: 0.25, priority: "High",   dueDaysOffset: 2,  dependsOnId: "bpt-004-2" },
      { id: "bpt-004-4", name: "Conduct Kickoff Call",          department: "Account Management", ownerRole: "Account Manager",  estimatedHours: 1,    priority: "High",   dueDaysOffset: 5,  dependsOnId: "bpt-004-3" },
      { id: "bpt-004-5", name: "Complete Onboarding Checklist", department: "Account Management", ownerRole: "Account Manager",  estimatedHours: 1,    priority: "Medium", dueDaysOffset: 7,  dependsOnId: "bpt-004-4" },
      { id: "bpt-004-6", name: "First 30-Day Check-In",         department: "Account Management", ownerRole: "Account Manager",  estimatedHours: 1,    priority: "Medium", dueDaysOffset: 30, dependsOnId: "bpt-004-5" },
    ],
  },

  // BP-005: Monthly Reporting Blueprint
  {
    id: "bp-005",
    name: "Monthly Reporting Blueprint",
    department: "Reporting",
    servicePackage: "Reporting Only",
    mappedLineItem: "Monthly Reporting",
    description: "Monthly reporting delivery: data pull, dashboard update, client delivery.",
    activationTrigger: "Invoice Paid",
    estimatedTotalHours: 6,
    isActive: true,
    lastUpdated: "2025-07-01",
    version: "1.1",
    tasks: [
      { id: "bpt-005-1", name: "Pull GA4 & GSC Data",        department: "Reporting",          ownerRole: "Reporting Analyst", estimatedHours: 1,   priority: "High",   dueDaysOffset: 2 },
      { id: "bpt-005-2", name: "Pull Ad Platform Data",      department: "Reporting",          ownerRole: "Reporting Analyst", estimatedHours: 1,   priority: "High",   dueDaysOffset: 2 },
      { id: "bpt-005-3", name: "Build Report Dashboard",     department: "Reporting",          ownerRole: "Reporting Analyst", estimatedHours: 2,   priority: "High",   dueDaysOffset: 4,  dependsOnId: "bpt-005-1" },
      { id: "bpt-005-4", name: "QA & Review",                department: "Reporting",          ownerRole: "Account Manager",   estimatedHours: 1,   priority: "Medium", dueDaysOffset: 5,  dependsOnId: "bpt-005-3" },
      { id: "bpt-005-5", name: "Deliver Report to Client",   department: "Reporting",          ownerRole: "Account Manager",   estimatedHours: 0.5, priority: "High",   dueDaysOffset: 5,  dependsOnId: "bpt-005-4" },
    ],
  },

  // BP-006: Meta Ads Launch Blueprint
  {
    id: "bp-006",
    name: "Meta Ads Launch Blueprint",
    department: "Meta Ads",
    servicePackage: "Custom",
    mappedLineItem: "Meta Ads Management",
    description: "Facebook/Instagram Business Manager setup, pixel, creative brief, campaign launch.",
    activationTrigger: "Invoice Paid",
    estimatedTotalHours: 12,
    isActive: true,
    lastUpdated: "2025-07-08",
    version: "1.0",
    tasks: [
      { id: "bpt-006-1", name: "Business Manager Setup",      department: "Meta Ads",           ownerRole: "Meta Ads Specialist", estimatedHours: 1, priority: "Urgent", dueDaysOffset: 2 },
      { id: "bpt-006-2", name: "Meta Pixel Installation",     department: "Meta Ads",           ownerRole: "Meta Ads Specialist", estimatedHours: 2, priority: "High",   dueDaysOffset: 4,  dependsOnId: "bpt-006-1" },
      { id: "bpt-006-3", name: "Creative Brief",              department: "Meta Ads",           ownerRole: "Meta Ads Specialist", estimatedHours: 2, priority: "High",   dueDaysOffset: 6 },
      { id: "bpt-006-4", name: "Ad Creative Production",     department: "Design",             ownerRole: "Designer",            estimatedHours: 4, priority: "High",   dueDaysOffset: 12, dependsOnId: "bpt-006-3" },
      { id: "bpt-006-5", name: "Campaign Launch & QA",       department: "Meta Ads",           ownerRole: "Meta Ads Specialist", estimatedHours: 2, priority: "Urgent", dueDaysOffset: 14, dependsOnId: "bpt-006-4" },
    ],
  },

  // BP-007: Website Build Blueprint
  {
    id: "bp-007",
    name: "Website Build Blueprint",
    department: "Web Development",
    servicePackage: "Website Build",
    mappedLineItem: "Website Redesign",
    description: "Discovery, wireframes, design, development, QA, launch.",
    activationTrigger: "Contract Signed",
    estimatedTotalHours: 60,
    isActive: true,
    lastUpdated: "2025-06-15",
    version: "2.0",
    tasks: [
      { id: "bpt-007-1", name: "Discovery & Requirements",   department: "Account Management", ownerRole: "Account Manager",   estimatedHours: 3,  priority: "High",   dueDaysOffset: 3 },
      { id: "bpt-007-2", name: "Wireframes",                 department: "Design",             ownerRole: "Designer",           estimatedHours: 8,  priority: "High",   dueDaysOffset: 10, dependsOnId: "bpt-007-1" },
      { id: "bpt-007-3", name: "Client Wireframe Approval",  department: "Account Management", ownerRole: "Account Manager",   estimatedHours: 1,  priority: "High",   dueDaysOffset: 14, dependsOnId: "bpt-007-2" },
      { id: "bpt-007-4", name: "Visual Design",              department: "Design",             ownerRole: "Designer",           estimatedHours: 12, priority: "High",   dueDaysOffset: 22, dependsOnId: "bpt-007-3" },
      { id: "bpt-007-5", name: "Client Design Approval",     department: "Account Management", ownerRole: "Account Manager",   estimatedHours: 1,  priority: "High",   dueDaysOffset: 26, dependsOnId: "bpt-007-4" },
      { id: "bpt-007-6", name: "WordPress Development",      department: "Web Development",    ownerRole: "Developer",          estimatedHours: 20, priority: "High",   dueDaysOffset: 45, dependsOnId: "bpt-007-5" },
      { id: "bpt-007-7", name: "QA & Testing",               department: "Web Development",    ownerRole: "Developer",          estimatedHours: 4,  priority: "High",   dueDaysOffset: 50, dependsOnId: "bpt-007-6" },
      { id: "bpt-007-8", name: "SEO Setup on New Site",      department: "SEO",                ownerRole: "SEO Specialist",     estimatedHours: 4,  priority: "High",   dueDaysOffset: 55, dependsOnId: "bpt-007-7" },
      { id: "bpt-007-9", name: "Site Launch",                department: "Web Development",    ownerRole: "Developer",          estimatedHours: 2,  priority: "Urgent", dueDaysOffset: 60, dependsOnId: "bpt-007-8" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper — build a task from a blueprint task
// ---------------------------------------------------------------------------

let _taskSeq = 1;
function genTaskId(): string {
  return `tsk-${String(_taskSeq++).padStart(4, "0")}`;
}

let _actSeq = 1;
function genActId(): string {
  return `act-${String(_actSeq++).padStart(4, "0")}`;
}

function makeTask(
  overrides: Partial<Task> & {
    id?: string;
    projectId: string;
    title: string;
    department: Task["department"];
    service: string;
    status: Task["status"];
    priority: Task["priority"];
    dueDate: string;
    assignedUserName?: string;
    assignedUserId?: string;
    source: Task["source"];
    type: Task["type"];
    createdById?: string;
    createdByName?: string;
    blueprintId?: string;
    milestoneId?: string;
    estimatedHours?: number;
    clientName: string;
    projectName: string;
    dependencies?: Task["dependencies"];
  }
): Task {
  return {
    id: overrides.id ?? genTaskId(),
    projectId: overrides.projectId,
    milestoneId: overrides.milestoneId,
    blueprintId: overrides.blueprintId,
    title: overrides.title,
    description: overrides.description,
    type: overrides.type,
    source: overrides.source,
    department: overrides.department,
    service: overrides.service,
    assignedUserId: overrides.assignedUserId,
    assignedUserName: overrides.assignedUserName,
    createdById: overrides.createdById ?? "u3",
    createdByName: overrides.createdByName ?? "Priya Nair",
    status: overrides.status,
    priority: overrides.priority,
    dueDate: overrides.dueDate,
    startDate: overrides.startDate,
    completionDate: overrides.completionDate,
    estimatedHours: overrides.estimatedHours ?? 1,
    dependencies: overrides.dependencies ?? [],
    notes: overrides.notes ?? [],
    files: overrides.files ?? [],
    automationHistory: overrides.automationHistory ?? [],
    createdAt: overrides.createdAt ?? "2025-07-01T08:00:00Z",
    updatedAt: overrides.updatedAt ?? "2025-07-15T08:00:00Z",
    clientName: overrides.clientName,
    projectName: overrides.projectName,
  };
}

function makeActivity(
  projectId: string,
  eventType: ActivityEntry["eventType"],
  description: string,
  actorName: string,
  timestamp: string
): ActivityEntry {
  return { id: genActId(), projectId, eventType, description, actorName, timestamp };
}

// ---------------------------------------------------------------------------
// TASKS — Blue Ridge Plumbing Co. (proj-am-mc004) — migrated from AM store
// clientId: mc004
// Project name: "Blue Ridge Plumbing Co. — SEO / GBP / Website Build"
// ---------------------------------------------------------------------------

const blueRidgeTasks: Task[] = [
  // Task #1: Onboarding task — linked to the onboarding record (seeded via am-onboarding-store seed)
  makeTask({ id: "am-mc004-t0", projectId: "proj-am-mc004", milestoneId: "ms-am-mc004-1", title: "Client Onboarding", department: "Account Management", service: "Account Management", status: "Completed", priority: "Urgent", dueDate: "2025-05-08", source: "Manual", type: "One-Time", assignedUserName: "Alex R.", estimatedHours: 2, clientName: "Blue Ridge Plumbing Co.", projectName: "Blue Ridge Plumbing Co. — SEO / GBP / Website Build", completionDate: "2025-05-08", createdAt: "2025-05-01T00:00:00Z", linkedOnboardingId: "onb-seed-mc004" }),
  makeTask({ id: "am-mc004-t1", projectId: "proj-am-mc004", milestoneId: "ms-am-mc004-1", blueprintId: "bp-001", title: "Kickoff call — SEO / GBP", department: "Account Management", service: "SEO / GBP", status: "Completed", priority: "High", dueDate: "2025-05-08", source: "Task Blueprint", type: "One-Time", assignedUserName: "Alex R.", estimatedHours: 1, clientName: "Blue Ridge Plumbing Co.", projectName: "Blue Ridge Plumbing Co. — SEO / GBP / Website Build", completionDate: "2025-05-08", createdAt: "2025-05-01T00:00:00Z" }),
  makeTask({ id: "am-mc004-t2", projectId: "proj-am-mc004", milestoneId: "ms-am-mc004-1", blueprintId: "bp-001", title: "Set up access & tracking — SEO / GBP", department: "Account Management", service: "SEO / GBP", status: "Completed", priority: "High", dueDate: "2025-05-08", source: "Task Blueprint", type: "One-Time", assignedUserName: "Alex R.", estimatedHours: 1, clientName: "Blue Ridge Plumbing Co.", projectName: "Blue Ridge Plumbing Co. — SEO / GBP / Website Build", completionDate: "2025-05-08", createdAt: "2025-05-01T00:00:00Z" }),
  makeTask({ id: "am-mc004-t3", projectId: "proj-am-mc004", milestoneId: "ms-am-mc004-1", blueprintId: "bp-007", title: "Kickoff call — Website Build", department: "Account Management", service: "Website Build", status: "Completed", priority: "High", dueDate: "2025-05-08", source: "Task Blueprint", type: "One-Time", assignedUserName: "Alex R.", estimatedHours: 1, clientName: "Blue Ridge Plumbing Co.", projectName: "Blue Ridge Plumbing Co. — SEO / GBP / Website Build", completionDate: "2025-05-08", createdAt: "2025-05-01T00:00:00Z" }),
  makeTask({ id: "am-mc004-t4", projectId: "proj-am-mc004", milestoneId: "ms-am-mc004-2", blueprintId: "bp-007", title: "Deliver wireframe/mockup — Website Build", department: "Design", service: "Website Build", status: "In Progress", priority: "High", dueDate: "2025-06-10", source: "Task Blueprint", type: "One-Time", assignedUserName: "Casey L.", estimatedHours: 8, clientName: "Blue Ridge Plumbing Co.", projectName: "Blue Ridge Plumbing Co. — SEO / GBP / Website Build", createdAt: "2025-05-01T00:00:00Z" }),
];

// ---------------------------------------------------------------------------
// TASKS — Ridgeline Construction LLC (proj-am-mc011) — migrated from AM store
// clientId: mc011
// Project name: "Ridgeline Construction LLC — SEO / GBP"
// ---------------------------------------------------------------------------

const ridgelineTasks: Task[] = [
  // Task #1: Onboarding task — linked to the onboarding record (seeded via am-onboarding-store seed)
  makeTask({ id: "am-mc011-t0", projectId: "proj-am-mc011", milestoneId: "ms-am-mc011-1", title: "Client Onboarding", department: "Account Management", service: "Account Management", status: "In Progress", priority: "Urgent", dueDate: "2025-05-22", source: "Manual", type: "One-Time", assignedUserName: "Alex R.", estimatedHours: 2, clientName: "Ridgeline Construction LLC", projectName: "Ridgeline Construction LLC — SEO / GBP", createdAt: "2025-05-15T00:00:00Z", linkedOnboardingId: "onb-seed-mc011" }),
  makeTask({ id: "am-mc011-t1", projectId: "proj-am-mc011", milestoneId: "ms-am-mc011-1", blueprintId: "bp-001", title: "Kickoff call — SEO / GBP", department: "Account Management", service: "SEO / GBP", status: "Completed", priority: "High", dueDate: "2025-05-20", source: "Task Blueprint", type: "One-Time", assignedUserName: "Alex R.", estimatedHours: 1, clientName: "Ridgeline Construction LLC", projectName: "Ridgeline Construction LLC — SEO / GBP", completionDate: "2025-05-20", createdAt: "2025-05-15T00:00:00Z" }),
  makeTask({ id: "am-mc011-t2", projectId: "proj-am-mc011", milestoneId: "ms-am-mc011-1", blueprintId: "bp-001", title: "Set up access & tracking — SEO / GBP", department: "Account Management", service: "SEO / GBP", status: "Blocked", priority: "High", dueDate: "2025-05-30", source: "Task Blueprint", type: "One-Time", assignedUserName: "Alex R.", estimatedHours: 1, clientName: "Ridgeline Construction LLC", projectName: "Ridgeline Construction LLC — SEO / GBP", createdAt: "2025-05-15T00:00:00Z" }),
  makeTask({ id: "am-mc011-t3", projectId: "proj-am-mc011", milestoneId: "ms-am-mc011-1", blueprintId: "bp-001", title: "Configure initial SEO / GBP campaign", department: "SEO", service: "SEO / GBP", status: "Open", priority: "Medium", dueDate: "2025-06-10", source: "Task Blueprint", type: "One-Time", assignedUserName: "Alex R.", estimatedHours: 2, clientName: "Ridgeline Construction LLC", projectName: "Ridgeline Construction LLC — SEO / GBP", dependencies: [{ id: "dep-rc-1", dependsOnTaskId: "am-mc011-t2", dependsOnTaskName: "Set up access & tracking — SEO / GBP", type: "Finish-To-Start", direction: "blocked-by", status: "Blocked" }], createdAt: "2025-05-15T00:00:00Z" }),
];

// ---------------------------------------------------------------------------
// Department Workspace Tasks — migrated from lib/mock/workspace-tasks.ts
//
// These tasks represent ongoing department work for clients in the pipeline.
// They are linked to placeholder projects per department group.
// proj-wt-am   = Account Management workspace
// proj-wt-sales = Sales workspace
// proj-wt-billing = Billing workspace
// proj-wt-content = Content workspace
// proj-wt-webdev = Web Development workspace
// proj-wt-design = Design workspace
// proj-wt-seo = SEO workspace
// proj-wt-gbp = GBP workspace
// proj-wt-yelp = Yelp workspace (SEO dept)
// proj-wt-meta = Meta Ads workspace
// proj-wt-ppc  = PPC/Google Ads workspace
// proj-wt-reporting = Reporting workspace
// proj-wt-lsa  = Local Service Ads workspace
// proj-wt-it   = IT & Security workspace
// ---------------------------------------------------------------------------

// ── Account Management workspace tasks ───────────────────────────────────────────────────────────────
const workspaceAmTasks: Task[] = [
  makeTask({ id: "am-1",  projectId: "proj-wt-am", milestoneId: "ms-wt-am", title: "Monthly check-in call — Apex Roofing",      department: "Account Management", service: "Account Management", status: "In Progress", priority: "High",   dueDate: "2025-06-05", source: "Task Blueprint",     type: "Recurring",  assignedUserName: "Jordan M.",  estimatedHours: 1,   clientName: "Apex Roofing",       projectName: "Apex Roofing — AM Retainer" }),
  makeTask({ id: "am-2",  projectId: "proj-wt-am", milestoneId: "ms-wt-am", title: "Send Q2 performance summary",                department: "Account Management", service: "Account Management", status: "Waiting",     priority: "High",   dueDate: "2025-06-06", source: "Workflow Automation", type: "One-Time",   assignedUserName: "Sarah K.",   estimatedHours: 1,   clientName: "Sunbelt HVAC",       projectName: "Sunbelt HVAC — AM Retainer" }),
  makeTask({ id: "am-3",  projectId: "proj-wt-am", milestoneId: "ms-wt-am", title: "Renewal discussion — Pacific Dental",         department: "Account Management", service: "Account Management", status: "Waiting",     priority: "Medium", dueDate: "2025-06-08", source: "Workflow Automation", type: "Renewal",    assignedUserName: "Jordan M.",  estimatedHours: 1,   clientName: "Pacific Dental",     projectName: "Pacific Dental — Renewal" }),
  makeTask({ id: "am-4",  projectId: "proj-wt-am", milestoneId: "ms-wt-am", title: "Onboarding checklist — Blue Ridge Plumbing",  department: "Account Management", service: "Account Management", status: "In Progress", priority: "High",   dueDate: "2025-06-05", source: "Task Blueprint",     type: "One-Time",   assignedUserName: "Alex R.",    estimatedHours: 1,   clientName: "Blue Ridge Plumbing",projectName: "Blue Ridge Plumbing — Onboarding" }),
  makeTask({ id: "am-5",  projectId: "proj-wt-am", milestoneId: "ms-wt-am", title: "Client satisfaction survey — Harbor Auto",    department: "Account Management", service: "Account Management", status: "Waiting",     priority: "Low",    dueDate: "2025-06-10", source: "Manual",             type: "One-Time",   assignedUserName: "Sarah K.",   estimatedHours: 0.5, clientName: "Harbor Auto",        projectName: "Harbor Auto — AM Retainer" }),
  makeTask({ id: "am-6",  projectId: "proj-wt-am", milestoneId: "ms-wt-am", title: "Update contact info — Metro Dental",           department: "Account Management", service: "Account Management", status: "Completed",   priority: "Low",    dueDate: "2025-06-03", source: "Manual",             type: "One-Time",   assignedUserName: "Jordan M.",  estimatedHours: 0.25,clientName: "Metro Dental",       projectName: "Metro Dental — AM Retainer",    completionDate: "2025-06-03" }),
  makeTask({ id: "am-7",  projectId: "proj-wt-am", milestoneId: "ms-wt-am", title: "At-risk review — Cascade Flooring",           department: "Account Management", service: "Account Management", status: "Blocked",     priority: "High",   dueDate: "2025-06-04", source: "Workflow Automation", type: "One-Time",   assignedUserName: "Alex R.",    estimatedHours: 1,   clientName: "Cascade Flooring",   projectName: "Cascade Flooring — Account Review" }),
];

// ── Sales workspace tasks ───────────────────────────────────────────────────────────────────────────────────
const workspaceSalesTasks: Task[] = [
  makeTask({ id: "sa-1",  projectId: "proj-wt-sales", milestoneId: "ms-wt-sales", title: "Send proposal — Summit Landscaping",                   department: "Sales", service: "Sales", status: "In Progress", priority: "High",   dueDate: "2025-06-05", source: "Workflow Automation", type: "One-Time",  assignedUserName: "Jordan M.", estimatedHours: 1,   clientName: "Summit Landscaping",   projectName: "Sales Pipeline — Q3" }),
  makeTask({ id: "sa-2",  projectId: "proj-wt-sales", milestoneId: "ms-wt-sales", title: "Follow-up call — Harbor Auto Group",                   department: "Sales", service: "Sales", status: "Waiting",     priority: "High",   dueDate: "2025-06-06", source: "Workflow Automation", type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 0.5, clientName: "Harbor Auto Group",    projectName: "Sales Pipeline — Q3" }),
  makeTask({ id: "sa-3",  projectId: "proj-wt-sales", milestoneId: "ms-wt-sales", title: "Update pipeline stage — Metro Dental",                 department: "Sales", service: "Sales", status: "Waiting",     priority: "Medium", dueDate: "2025-06-07", source: "Manual",             type: "One-Time",  assignedUserName: "Jordan M.", estimatedHours: 0.25,clientName: "Metro Dental",         projectName: "Sales Pipeline — Q3" }),
  makeTask({ id: "sa-4",  projectId: "proj-wt-sales", milestoneId: "ms-wt-sales", title: "Discovery call — Cascade Flooring",                   department: "Sales", service: "Sales", status: "In Progress", priority: "Medium", dueDate: "2025-06-05", source: "Task Blueprint",     type: "One-Time",  assignedUserName: "Sarah K.",  estimatedHours: 1,   clientName: "Cascade Flooring",     projectName: "Sales Pipeline — Q3" }),
  makeTask({ id: "sa-5",  projectId: "proj-wt-sales", milestoneId: "ms-wt-sales", title: "Contract sent — Sunstate Solar",                      department: "Sales", service: "Sales", status: "Completed",   priority: "High",   dueDate: "2025-06-01", source: "Workflow Automation", type: "One-Time",  assignedUserName: "Sarah K.",  estimatedHours: 0.5, clientName: "Sunstate Solar",        projectName: "Sales Pipeline — Q3",         completionDate: "2025-06-01" }),
  makeTask({ id: "sa-6",  projectId: "proj-wt-sales", milestoneId: "ms-wt-sales", title: "CRM data cleanup",                                     department: "Sales", service: "Sales", status: "Waiting",     priority: "Low",    dueDate: "2025-06-09", source: "Manual",             type: "One-Time",  assignedUserName: "Alex R.",   estimatedHours: 1,   clientName: "Internal",             projectName: "Sales Pipeline — Q3" }),
  makeTask({ id: "sa-7",  projectId: "proj-wt-sales", milestoneId: "ms-wt-sales", title: "Win/loss analysis — Q1",                               department: "Sales", service: "Sales", status: "Completed",   priority: "Low",    dueDate: "2025-06-02", source: "Manual",             type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 2,   clientName: "Internal",             projectName: "Sales Pipeline — Q3",         completionDate: "2025-06-02" }),
  makeTask({ id: "sa-8",  projectId: "proj-wt-sales", milestoneId: "ms-wt-sales", title: "Affiliate Follow-Up — Brandon Ellis (new referrals)", department: "Sales", service: "Sales", status: "Waiting",     priority: "High",   dueDate: "2025-06-08", source: "Workflow Automation", type: "One-Time",  assignedUserName: "Jordan M.", estimatedHours: 0.5, clientName: "Internal",             projectName: "Sales Pipeline — Q3" }),
  makeTask({ id: "sa-9",  projectId: "proj-wt-sales", milestoneId: "ms-wt-sales", title: "Commission Review — Lisa Park (Coastal Wellness Spa)",department: "Sales", service: "Sales", status: "Waiting",     priority: "Medium", dueDate: "2025-06-09", source: "Manual",             type: "One-Time",  assignedUserName: "Sarah K.",  estimatedHours: 0.5, clientName: "Coastal Wellness Spa", projectName: "Sales Pipeline — Q3" }),
  makeTask({ id: "sa-10", projectId: "proj-wt-sales", milestoneId: "ms-wt-sales", title: "Referral Verification — Tyler Nguyen lead",            department: "Sales", service: "Sales", status: "Waiting",     priority: "Medium", dueDate: "2025-06-10", source: "Manual",             type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 0.5, clientName: "Blue Ridge Plumbing",  projectName: "Sales Pipeline — Q3" }),
];

// ── Billing workspace tasks ────────────────────────────────────────────────────────────────────────────
const workspaceBillingTasks: Task[] = [
  makeTask({ id: "bi-1", projectId: "proj-wt-billing", milestoneId: "ms-wt-billing", title: "Invoice overdue — Green Valley Pools",  department: "Billing", service: "Billing", status: "Waiting",     priority: "High",   dueDate: "2025-06-05", source: "Workflow Automation", type: "One-Time",    assignedUserName: "Lisa P.",   estimatedHours: 0.5, clientName: "Green Valley Pools",  projectName: "Billing — Collections" }),
  makeTask({ id: "bi-2", projectId: "proj-wt-billing", milestoneId: "ms-wt-billing", title: "Service renewal — Apex Roofing",        department: "Billing", service: "Billing", status: "In Progress", priority: "High",   dueDate: "2025-06-06", source: "Workflow Automation", type: "Renewal",     assignedUserName: "Jordan M.", estimatedHours: 1,   clientName: "Apex Roofing",       projectName: "Billing — Renewals" }),
  makeTask({ id: "bi-3", projectId: "proj-wt-billing", milestoneId: "ms-wt-billing", title: "Cancellation processing — Harbor Auto",  department: "Billing", service: "Billing", status: "Waiting",     priority: "High",   dueDate: "2025-06-05", source: "Task Blueprint",     type: "Offboarding", assignedUserName: "Sarah K.",  estimatedHours: 1,   clientName: "Harbor Auto",        projectName: "Billing — Cancellations" }),
  makeTask({ id: "bi-4", projectId: "proj-wt-billing", milestoneId: "ms-wt-billing", title: "Billing audit — June cycle",            department: "Billing", service: "Billing", status: "Waiting",     priority: "Medium", dueDate: "2025-06-08", source: "Workflow Automation", type: "One-Time",    assignedUserName: "Lisa P.",   estimatedHours: 2,   clientName: "Internal",           projectName: "Billing — Monthly Cycle" }),
  makeTask({ id: "bi-5", projectId: "proj-wt-billing", milestoneId: "ms-wt-billing", title: "Offboarding — Sunbelt HVAC",             department: "Billing", service: "Billing", status: "Blocked",     priority: "High",   dueDate: "2025-06-04", source: "Task Blueprint",     type: "Offboarding", assignedUserName: "Sarah K.",  estimatedHours: 2,   clientName: "Sunbelt HVAC",       projectName: "Billing — Offboarding" }),
  makeTask({ id: "bi-6", projectId: "proj-wt-billing", milestoneId: "ms-wt-billing", title: "New service activation — Blue Ridge",    department: "Billing", service: "Billing", status: "Completed",   priority: "Medium", dueDate: "2025-06-03", source: "Workflow Automation", type: "One-Time",    assignedUserName: "Alex R.",   estimatedHours: 0.5, clientName: "Blue Ridge Plumbing",projectName: "Billing — Activation",       completionDate: "2025-06-03" }),
  makeTask({ id: "bi-7", projectId: "proj-wt-billing", milestoneId: "ms-wt-billing", title: "Q2 revenue reconciliation",               department: "Billing", service: "Billing", status: "Waiting",     priority: "Low",    dueDate: "2025-06-10", source: "Manual",             type: "One-Time",    assignedUserName: "Lisa P.",   estimatedHours: 2,   clientName: "Internal",           projectName: "Billing — Monthly Cycle" }),
];

// ── Content workspace tasks ────────────────────────────────────────────────────────────────────────────
const workspaceContentTasks: Task[] = [
  makeTask({ id: "co-1", projectId: "proj-wt-content", milestoneId: "ms-wt-content", title: "Write blog post — Summit Landscaping",    department: "Content", service: "Content", status: "In Progress", priority: "High",   dueDate: "2025-06-06", source: "Workflow Automation", type: "Recurring",  assignedUserName: "Alex R.",   estimatedHours: 3, clientName: "Summit Landscaping",  projectName: "Summit Landscaping — Content Retainer" }),
  makeTask({ id: "co-2", projectId: "proj-wt-content", milestoneId: "ms-wt-content", title: "Social calendar — Apex Roofing (June)",   department: "Content", service: "Content", status: "Waiting",     priority: "High",   dueDate: "2025-06-07", source: "Task Blueprint",     type: "Recurring",  assignedUserName: "Sarah K.",  estimatedHours: 2, clientName: "Apex Roofing",       projectName: "Apex Roofing — Content Retainer" }),
  makeTask({ id: "co-3", projectId: "proj-wt-content", milestoneId: "ms-wt-content", title: "Email newsletter — Pacific Dental",        department: "Content", service: "Content", status: "Waiting",     priority: "Medium", dueDate: "2025-06-08", source: "Manual",             type: "Recurring",  assignedUserName: "Jordan M.", estimatedHours: 2, clientName: "Pacific Dental",     projectName: "Pacific Dental — Content Retainer" }),
  makeTask({ id: "co-4", projectId: "proj-wt-content", milestoneId: "ms-wt-content", title: "Product description copy — Harbor Auto",  department: "Content", service: "Content", status: "Completed",   priority: "Low",    dueDate: "2025-06-02", source: "Manual",             type: "One-Time",   assignedUserName: "Alex R.",   estimatedHours: 2, clientName: "Harbor Auto",        projectName: "Harbor Auto — Content Retainer",  completionDate: "2025-06-02" }),
  makeTask({ id: "co-5", projectId: "proj-wt-content", milestoneId: "ms-wt-content", title: "Landing page copy — Metro Dental",        department: "Content", service: "Content", status: "In Progress", priority: "Medium", dueDate: "2025-06-07", source: "Workflow Automation", type: "One-Time",   assignedUserName: "Sarah K.",  estimatedHours: 3, clientName: "Metro Dental",       projectName: "Metro Dental — Content Retainer" }),
  makeTask({ id: "co-6", projectId: "proj-wt-content", milestoneId: "ms-wt-content", title: "Photo shoot brief — Blue Ridge",           department: "Content", service: "Content", status: "Waiting",     priority: "Low",    dueDate: "2025-06-10", source: "Manual",             type: "One-Time",   assignedUserName: "Alex R.",   estimatedHours: 1, clientName: "Blue Ridge Plumbing",projectName: "Blue Ridge Plumbing — Content Retainer" }),
  makeTask({ id: "co-7", projectId: "proj-wt-content", milestoneId: "ms-wt-content", title: "Content audit — Green Valley Pools",      department: "Content", service: "Content", status: "Blocked",     priority: "High",   dueDate: "2025-06-05", source: "Workflow Automation", type: "One-Time",   assignedUserName: "Jordan M.", estimatedHours: 2, clientName: "Green Valley Pools",  projectName: "Green Valley Pools — Content Retainer" }),
];

// ── Web Development workspace tasks ──────────────────────────────────────────────────────────────
const workspaceWebDevTasks: Task[] = [
  makeTask({ id: "wd-1", projectId: "proj-wt-webdev", milestoneId: "ms-wt-webdev", title: "Homepage redesign — Summit Landscaping",  department: "Web Development", service: "Web Development", status: "In Progress", priority: "High",   dueDate: "2025-06-10", source: "Task Blueprint",     type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 8,  clientName: "Summit Landscaping",  projectName: "Summit Landscaping — Web Retainer" }),
  makeTask({ id: "wd-2", projectId: "proj-wt-webdev", milestoneId: "ms-wt-webdev", title: "CRO fixes — Apex Roofing",                 department: "Web Development", service: "Web Development", status: "Waiting",     priority: "High",   dueDate: "2025-06-08", source: "Manual",             type: "One-Time",  assignedUserName: "Jordan M.", estimatedHours: 3,  clientName: "Apex Roofing",       projectName: "Apex Roofing — Web Retainer" }),
  makeTask({ id: "wd-3", projectId: "proj-wt-webdev", milestoneId: "ms-wt-webdev", title: "Site speed audit — Pacific Dental",        department: "Web Development", service: "Web Development", status: "Waiting",     priority: "Medium", dueDate: "2025-06-09", source: "Task Blueprint",     type: "One-Time",  assignedUserName: "Alex R.",   estimatedHours: 2,  clientName: "Pacific Dental",     projectName: "Pacific Dental — Web Retainer" }),
  makeTask({ id: "wd-4", projectId: "proj-wt-webdev", milestoneId: "ms-wt-webdev", title: "Contact form fix — Harbor Auto",           department: "Web Development", service: "Web Development", status: "Completed",   priority: "Low",    dueDate: "2025-06-03", source: "Manual",             type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 1,  clientName: "Harbor Auto",        projectName: "Harbor Auto — Web Retainer",        completionDate: "2025-06-03" }),
  makeTask({ id: "wd-5", projectId: "proj-wt-webdev", milestoneId: "ms-wt-webdev", title: "New service page — Metro Dental",         department: "Web Development", service: "Web Development", status: "In Progress", priority: "Medium", dueDate: "2025-06-08", source: "Workflow Automation", type: "One-Time",  assignedUserName: "Sarah K.",  estimatedHours: 4,  clientName: "Metro Dental",       projectName: "Metro Dental — Web Retainer" }),
  makeTask({ id: "wd-6", projectId: "proj-wt-webdev", milestoneId: "ms-wt-webdev", title: "WordPress migration — Blue Ridge",         department: "Web Development", service: "Web Development", status: "Blocked",     priority: "High",   dueDate: "2025-06-06", source: "Manual",             type: "One-Time",  assignedUserName: "Alex R.",   estimatedHours: 6,  clientName: "Blue Ridge Plumbing",projectName: "Blue Ridge Plumbing — Web Retainer" }),
];

// ── Design workspace tasks ───────────────────────────────────────────────────────────────────────────────────
const workspaceDesignTasks: Task[] = [
  makeTask({ id: "de-1", projectId: "proj-wt-design", milestoneId: "ms-wt-design", title: "Logo refresh — Apex Roofing",              department: "Design", service: "Design", status: "In Progress", priority: "Medium", dueDate: "2025-06-09", source: "Task Blueprint", type: "One-Time",  assignedUserName: "Lisa P.",   estimatedHours: 4,  clientName: "Apex Roofing",       projectName: "Apex Roofing — Brand Refresh" }),
  makeTask({ id: "de-2", projectId: "proj-wt-design", milestoneId: "ms-wt-design", title: "Social templates — Pacific Dental",         department: "Design", service: "Design", status: "Waiting",     priority: "High",   dueDate: "2025-06-07", source: "Manual",         type: "One-Time",  assignedUserName: "Jordan M.", estimatedHours: 3,  clientName: "Pacific Dental",     projectName: "Pacific Dental — Design" }),
  makeTask({ id: "de-3", projectId: "proj-wt-design", milestoneId: "ms-wt-design", title: "Print ad — Harbor Auto Group",              department: "Design", service: "Design", status: "Completed",   priority: "Low",    dueDate: "2025-06-02", source: "Manual",         type: "One-Time",  assignedUserName: "Lisa P.",   estimatedHours: 2,  clientName: "Harbor Auto",        projectName: "Harbor Auto — Design",            completionDate: "2025-06-02" }),
  makeTask({ id: "de-4", projectId: "proj-wt-design", milestoneId: "ms-wt-design", title: "Banner ads — Google Ads",                  department: "Design", service: "Design", status: "Waiting",     priority: "Medium", dueDate: "2025-06-08", source: "Task Blueprint", type: "One-Time",  assignedUserName: "Sarah K.",  estimatedHours: 3,  clientName: "Internal",           projectName: "Design — Internal Projects" }),
  makeTask({ id: "de-5", projectId: "proj-wt-design", milestoneId: "ms-wt-design", title: "Infographic — Summit Landscaping",          department: "Design", service: "Design", status: "Waiting",     priority: "Low",    dueDate: "2025-06-11", source: "Manual",         type: "One-Time",  assignedUserName: "Lisa P.",   estimatedHours: 4,  clientName: "Summit Landscaping",  projectName: "Summit Landscaping — Design" }),
];

// ── SEO workspace tasks ───────────────────────────────────────────────────────────────────────────────────────
const workspaceSeoTasks: Task[] = [
  makeTask({ id: "se-1", projectId: "proj-wt-seo", milestoneId: "ms-wt-seo", title: "On-page audit — Apex Roofing",              department: "SEO", service: "SEO", status: "In Progress", priority: "High",   dueDate: "2025-06-06", source: "Task Blueprint",     type: "One-Time",  assignedUserName: "Lisa P.",   estimatedHours: 3, clientName: "Apex Roofing",       projectName: "Apex Roofing — SEO Retainer" }),
  makeTask({ id: "se-2", projectId: "proj-wt-seo", milestoneId: "ms-wt-seo", title: "Keyword research — Pacific Dental",         department: "SEO", service: "SEO", status: "Waiting",     priority: "High",   dueDate: "2025-06-07", source: "Manual",             type: "One-Time",  assignedUserName: "Jordan M.", estimatedHours: 3, clientName: "Pacific Dental",     projectName: "Pacific Dental — SEO Retainer" }),
  makeTask({ id: "se-3", projectId: "proj-wt-seo", milestoneId: "ms-wt-seo", title: "Technical SEO fix — Metro Dental",          department: "SEO", service: "SEO", status: "Waiting",     priority: "Medium", dueDate: "2025-06-08", source: "Workflow Automation", type: "One-Time",  assignedUserName: "Alex R.",   estimatedHours: 2, clientName: "Metro Dental",       projectName: "Metro Dental — SEO Retainer" }),
  makeTask({ id: "se-4", projectId: "proj-wt-seo", milestoneId: "ms-wt-seo", title: "Backlink report — Harbor Auto",              department: "SEO", service: "SEO", status: "Completed",   priority: "Low",    dueDate: "2025-06-02", source: "Workflow Automation", type: "Recurring",  assignedUserName: "Sarah K.",  estimatedHours: 1, clientName: "Harbor Auto",        projectName: "Harbor Auto — SEO Retainer",      completionDate: "2025-06-02" }),
  makeTask({ id: "se-5", projectId: "proj-wt-seo", milestoneId: "ms-wt-seo", title: "Content gap analysis — Summit Landscaping", department: "SEO", service: "SEO", status: "In Progress", priority: "Medium", dueDate: "2025-06-09", source: "Manual",             type: "One-Time",  assignedUserName: "Lisa P.",   estimatedHours: 3, clientName: "Summit Landscaping",  projectName: "Summit Landscaping — SEO Retainer" }),
  makeTask({ id: "se-6", projectId: "proj-wt-seo", milestoneId: "ms-wt-seo", title: "Schema markup — Blue Ridge",               department: "SEO", service: "SEO", status: "Waiting",     priority: "Low",    dueDate: "2025-06-10", source: "Manual",             type: "One-Time",  assignedUserName: "Alex R.",   estimatedHours: 2, clientName: "Blue Ridge Plumbing",projectName: "Blue Ridge Plumbing — SEO Retainer" }),
];

// ── GBP workspace tasks ───────────────────────────────────────────────────────────────────────────────────────
const workspaceGbpTasks: Task[] = [
  makeTask({ id: "gb-1", projectId: "proj-wt-gbp", milestoneId: "ms-wt-gbp", title: "Update photos — Apex Roofing",             department: "GBP", service: "GBP", status: "Waiting",     priority: "High",   dueDate: "2025-06-06", source: "Manual",             type: "Recurring",  assignedUserName: "Sarah K.",  estimatedHours: 1, clientName: "Apex Roofing",       projectName: "Apex Roofing — GBP Management" }),
  makeTask({ id: "gb-2", projectId: "proj-wt-gbp", milestoneId: "ms-wt-gbp", title: "Respond to reviews — Pacific Dental",      department: "GBP", service: "GBP", status: "In Progress", priority: "High",   dueDate: "2025-06-05", source: "Workflow Automation", type: "Recurring",  assignedUserName: "Jordan M.", estimatedHours: 1, clientName: "Pacific Dental",     projectName: "Pacific Dental — GBP Management" }),
  makeTask({ id: "gb-3", projectId: "proj-wt-gbp", milestoneId: "ms-wt-gbp", title: "Post weekly update — Harbor Auto",         department: "GBP", service: "GBP", status: "Waiting",     priority: "Medium", dueDate: "2025-06-07", source: "Workflow Automation", type: "Recurring",  assignedUserName: "Lisa P.",   estimatedHours: 1, clientName: "Harbor Auto",        projectName: "Harbor Auto — GBP Management" }),
  makeTask({ id: "gb-4", projectId: "proj-wt-gbp", milestoneId: "ms-wt-gbp", title: "Q&A cleanup — Metro Dental",               department: "GBP", service: "GBP", status: "Completed",   priority: "Low",    dueDate: "2025-06-02", source: "Manual",             type: "One-Time",   assignedUserName: "Sarah K.",  estimatedHours: 1, clientName: "Metro Dental",       projectName: "Metro Dental — GBP Management",   completionDate: "2025-06-02" }),
  makeTask({ id: "gb-5", projectId: "proj-wt-gbp", milestoneId: "ms-wt-gbp", title: "Category audit — Summit Landscaping",      department: "GBP", service: "GBP", status: "Waiting",     priority: "Medium", dueDate: "2025-06-09", source: "Task Blueprint",     type: "One-Time",   assignedUserName: "Alex R.",   estimatedHours: 1, clientName: "Summit Landscaping",  projectName: "Summit Landscaping — GBP Management" }),
];

// ── Yelp workspace tasks (SEO dept) ───────────────────────────────────────────────────────────────────────────
const workspaceYelpTasks: Task[] = [
  makeTask({ id: "ye-1", projectId: "proj-wt-yelp", milestoneId: "ms-wt-yelp", title: "Claim profile — Blue Ridge Plumbing",     department: "SEO", service: "Yelp", status: "Waiting",     priority: "High",   dueDate: "2025-06-06", source: "Task Blueprint",     type: "One-Time",  assignedUserName: "Alex R.",   estimatedHours: 1, clientName: "Blue Ridge Plumbing",projectName: "Blue Ridge Plumbing — Yelp" }),
  makeTask({ id: "ye-2", projectId: "proj-wt-yelp", milestoneId: "ms-wt-yelp", title: "Respond to reviews — Apex Roofing",       department: "SEO", service: "Yelp", status: "In Progress", priority: "High",   dueDate: "2025-06-05", source: "Workflow Automation", type: "Recurring",  assignedUserName: "Jordan M.", estimatedHours: 1, clientName: "Apex Roofing",       projectName: "Apex Roofing — Yelp" }),
  makeTask({ id: "ye-3", projectId: "proj-wt-yelp", milestoneId: "ms-wt-yelp", title: "Update service list — Pacific Dental",    department: "SEO", service: "Yelp", status: "Waiting",     priority: "Medium", dueDate: "2025-06-08", source: "Manual",             type: "One-Time",  assignedUserName: "Sarah K.",  estimatedHours: 1, clientName: "Pacific Dental",     projectName: "Pacific Dental — Yelp" }),
  makeTask({ id: "ye-4", projectId: "proj-wt-yelp", milestoneId: "ms-wt-yelp", title: "Photo update — Harbor Auto",              department: "SEO", service: "Yelp", status: "Completed",   priority: "Low",    dueDate: "2025-06-03", source: "Manual",             type: "One-Time",  assignedUserName: "Lisa P.",   estimatedHours: 1, clientName: "Harbor Auto",        projectName: "Harbor Auto — Yelp",           completionDate: "2025-06-03" }),
];

// ── Meta Ads workspace tasks ────────────────────────────────────────────────────────────────────────────────
const workspaceMetaTasks: Task[] = [
  makeTask({ id: "ma-1", projectId: "proj-wt-meta", milestoneId: "ms-wt-meta", title: "Launch summer campaign — Harbor Auto",    department: "Meta Ads", service: "Meta Ads", status: "In Progress", priority: "High",   dueDate: "2025-06-06", source: "Task Blueprint",     type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 3, clientName: "Harbor Auto",        projectName: "Harbor Auto — Meta Ads" }),
  makeTask({ id: "ma-2", projectId: "proj-wt-meta", milestoneId: "ms-wt-meta", title: "Ad creative refresh — Apex Roofing",     department: "Meta Ads", service: "Meta Ads", status: "Waiting",     priority: "High",   dueDate: "2025-06-07", source: "Manual",             type: "One-Time",  assignedUserName: "Sarah K.",  estimatedHours: 2, clientName: "Apex Roofing",       projectName: "Apex Roofing — Meta Ads" }),
  makeTask({ id: "ma-3", projectId: "proj-wt-meta", milestoneId: "ms-wt-meta", title: "Audience update — Pacific Dental",        department: "Meta Ads", service: "Meta Ads", status: "Waiting",     priority: "Medium", dueDate: "2025-06-08", source: "Manual",             type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 1, clientName: "Pacific Dental",     projectName: "Pacific Dental — Meta Ads" }),
  makeTask({ id: "ma-4", projectId: "proj-wt-meta", milestoneId: "ms-wt-meta", title: "Budget reallocation — Metro Dental",     department: "Meta Ads", service: "Meta Ads", status: "Completed",   priority: "Low",    dueDate: "2025-06-02", source: "Manual",             type: "One-Time",  assignedUserName: "Alex R.",   estimatedHours: 1, clientName: "Metro Dental",       projectName: "Metro Dental — Meta Ads",        completionDate: "2025-06-02" }),
  makeTask({ id: "ma-5", projectId: "proj-wt-meta", milestoneId: "ms-wt-meta", title: "Pixel check — Blue Ridge",               department: "Meta Ads", service: "Meta Ads", status: "Waiting",     priority: "Medium", dueDate: "2025-06-09", source: "Workflow Automation", type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 1, clientName: "Blue Ridge Plumbing",projectName: "Blue Ridge Plumbing — Meta Ads" }),
];

// ── Google Ads (PPC) workspace tasks ───────────────────────────────────────────────────────────────────────
const workspacePpcTasks: Task[] = [
  makeTask({ id: "ga-1", projectId: "proj-wt-ppc", milestoneId: "ms-wt-ppc", title: "Negative keyword audit — Harbor Auto",   department: "PPC", service: "PPC", status: "In Progress", priority: "High",   dueDate: "2025-06-06", source: "Manual",             type: "One-Time",  assignedUserName: "Alex R.",   estimatedHours: 2, clientName: "Harbor Auto",        projectName: "Harbor Auto — Google Ads" }),
  makeTask({ id: "ga-2", projectId: "proj-wt-ppc", milestoneId: "ms-wt-ppc", title: "Bidding strategy review — Apex Roofing", department: "PPC", service: "PPC", status: "Waiting",     priority: "High",   dueDate: "2025-06-07", source: "Task Blueprint",     type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 2, clientName: "Apex Roofing",       projectName: "Apex Roofing — Google Ads" }),
  makeTask({ id: "ga-3", projectId: "proj-wt-ppc", milestoneId: "ms-wt-ppc", title: "Landing page QA — Pacific Dental",       department: "PPC", service: "PPC", status: "Waiting",     priority: "Medium", dueDate: "2025-06-08", source: "Manual",             type: "One-Time",  assignedUserName: "Sarah K.",  estimatedHours: 1, clientName: "Pacific Dental",     projectName: "Pacific Dental — Google Ads" }),
  makeTask({ id: "ga-4", projectId: "proj-wt-ppc", milestoneId: "ms-wt-ppc", title: "Ad copy test — Summit Landscaping",      department: "PPC", service: "PPC", status: "Completed",   priority: "Medium", dueDate: "2025-06-03", source: "Manual",             type: "One-Time",  assignedUserName: "Alex R.",   estimatedHours: 2, clientName: "Summit Landscaping",  projectName: "Summit Landscaping — Google Ads", completionDate: "2025-06-03" }),
  makeTask({ id: "ga-5", projectId: "proj-wt-ppc", milestoneId: "ms-wt-ppc", title: "Conversion tracking — Metro Dental",     department: "PPC", service: "PPC", status: "Waiting",     priority: "Low",    dueDate: "2025-06-10", source: "Workflow Automation", type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 2, clientName: "Metro Dental",       projectName: "Metro Dental — Google Ads" }),
];

// ── Reporting workspace tasks ──────────────────────────────────────────────────────────────────────────────
const workspaceReportingTasks: Task[] = [
  makeTask({ id: "re-1", projectId: "proj-wt-reporting", milestoneId: "ms-wt-reporting", title: "Monthly report — Apex Roofing",           department: "Reporting", service: "Reporting", status: "In Progress", priority: "High",   dueDate: "2025-06-07", source: "Workflow Automation", type: "Recurring",  assignedUserName: "Jordan M.", estimatedHours: 2, clientName: "Apex Roofing",       projectName: "Apex Roofing — Reporting" }),
  makeTask({ id: "re-2", projectId: "proj-wt-reporting", milestoneId: "ms-wt-reporting", title: "Quarterly summary — Pacific Dental",       department: "Reporting", service: "Reporting", status: "Waiting",     priority: "High",   dueDate: "2025-06-08", source: "Task Blueprint",     type: "One-Time",   assignedUserName: "Sarah K.",  estimatedHours: 3, clientName: "Pacific Dental",     projectName: "Pacific Dental — Reporting" }),
  makeTask({ id: "re-3", projectId: "proj-wt-reporting", milestoneId: "ms-wt-reporting", title: "KPI dashboard setup — Harbor Auto",        department: "Reporting", service: "Reporting", status: "Waiting",     priority: "Medium", dueDate: "2025-06-09", source: "Task Blueprint",     type: "One-Time",   assignedUserName: "Alex R.",   estimatedHours: 2, clientName: "Harbor Auto",        projectName: "Harbor Auto — Reporting" }),
  makeTask({ id: "re-4", projectId: "proj-wt-reporting", milestoneId: "ms-wt-reporting", title: "Monthly report — Metro Dental",           department: "Reporting", service: "Reporting", status: "Completed",   priority: "Medium", dueDate: "2025-06-03", source: "Workflow Automation", type: "Recurring",  assignedUserName: "Jordan M.", estimatedHours: 2, clientName: "Metro Dental",       projectName: "Metro Dental — Reporting",       completionDate: "2025-06-03" }),
  makeTask({ id: "re-5", projectId: "proj-wt-reporting", milestoneId: "ms-wt-reporting", title: "Annual review prep — Summit Landscaping", department: "Reporting", service: "Reporting", status: "Waiting",     priority: "Low",    dueDate: "2025-06-12", source: "Manual",             type: "One-Time",   assignedUserName: "Sarah K.",  estimatedHours: 3, clientName: "Summit Landscaping",  projectName: "Summit Landscaping — Reporting" }),
  makeTask({ id: "re-6", projectId: "proj-wt-reporting", milestoneId: "ms-wt-reporting", title: "Report template refresh",                   department: "Reporting", service: "Reporting", status: "Blocked",     priority: "Low",    dueDate: "2025-06-06", source: "Manual",             type: "One-Time",   assignedUserName: "Alex R.",   estimatedHours: 2, clientName: "Internal",           projectName: "Reporting — Internal Projects" }),
];

// ── Local Service Ads workspace tasks ─────────────────────────────────────────────────────────────────────
const workspaceLsaTasks: Task[] = [
  makeTask({ id: "ls-1", projectId: "proj-wt-lsa", milestoneId: "ms-wt-lsa", title: "LSA setup — Blue Ridge Plumbing",        department: "LSA", service: "LSA", status: "In Progress", priority: "High",   dueDate: "2025-06-07", source: "Task Blueprint",     type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 3, clientName: "Blue Ridge Plumbing",projectName: "Blue Ridge Plumbing — LSA Launch" }),
  makeTask({ id: "ls-2", projectId: "proj-wt-lsa", milestoneId: "ms-wt-lsa", title: "Review management — Apex Roofing",       department: "LSA", service: "LSA", status: "Waiting",     priority: "High",   dueDate: "2025-06-08", source: "Workflow Automation", type: "Recurring",  assignedUserName: "Sarah K.",  estimatedHours: 1, clientName: "Apex Roofing",       projectName: "Apex Roofing — LSA Management" }),
  makeTask({ id: "ls-3", projectId: "proj-wt-lsa", milestoneId: "ms-wt-lsa", title: "Budget review — Harbor Auto",            department: "LSA", service: "LSA", status: "Waiting",     priority: "Medium", dueDate: "2025-06-09", source: "Manual",             type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 1, clientName: "Harbor Auto",        projectName: "Harbor Auto — LSA Management" }),
  makeTask({ id: "ls-4", projectId: "proj-wt-lsa", milestoneId: "ms-wt-lsa", title: "Lead verification — Pacific Dental",     department: "LSA", service: "LSA", status: "Completed",   priority: "Medium", dueDate: "2025-06-02", source: "Manual",             type: "One-Time",  assignedUserName: "Alex R.",   estimatedHours: 1, clientName: "Pacific Dental",     projectName: "Pacific Dental — LSA Management", completionDate: "2025-06-02" }),
  makeTask({ id: "ls-5", projectId: "proj-wt-lsa", milestoneId: "ms-wt-lsa", title: "Account dispute — Summit Landscaping",   department: "LSA", service: "LSA", status: "Blocked",     priority: "High",   dueDate: "2025-06-05", source: "Manual",             type: "One-Time",  assignedUserName: "Sarah K.",  estimatedHours: 1, clientName: "Summit Landscaping",  projectName: "Summit Landscaping — LSA" }),
];

// ── IT & Security workspace tasks ─────────────────────────────────────────────────────────────────────────
const workspaceItTasks: Task[] = [
  makeTask({ id: "it-1", projectId: "proj-wt-it", milestoneId: "ms-wt-it", title: "SSL renewal — Client sites",             department: "IT & Security", service: "IT & Security", status: "Waiting",     priority: "High",   dueDate: "2025-06-06", source: "Workflow Automation", type: "Recurring",  assignedUserName: "Mike T.",   estimatedHours: 1, clientName: "Multiple Clients",   projectName: "Infrastructure — Security" }),
  makeTask({ id: "it-2", projectId: "proj-wt-it", milestoneId: "ms-wt-it", title: "Malware scan — Apex Roofing site",       department: "IT & Security", service: "IT & Security", status: "In Progress", priority: "High",   dueDate: "2025-06-05", source: "Task Blueprint",     type: "One-Time",  assignedUserName: "Jordan M.", estimatedHours: 2, clientName: "Apex Roofing",       projectName: "Apex Roofing — IT Security" }),
  makeTask({ id: "it-3", projectId: "proj-wt-it", milestoneId: "ms-wt-it", title: "Firewall rule audit",                    department: "IT & Security", service: "IT & Security", status: "Waiting",     priority: "Medium", dueDate: "2025-06-08", source: "Manual",             type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 2, clientName: "Internal",           projectName: "Infrastructure — Security" }),
  makeTask({ id: "it-4", projectId: "proj-wt-it", milestoneId: "ms-wt-it", title: "Backup verification — Client CMS",       department: "IT & Security", service: "IT & Security", status: "Completed",   priority: "Medium", dueDate: "2025-06-02", source: "Workflow Automation", type: "Recurring",  assignedUserName: "Sarah K.",  estimatedHours: 1, clientName: "Multiple Clients",   projectName: "Infrastructure — Security",      completionDate: "2025-06-02" }),
  makeTask({ id: "it-5", projectId: "proj-wt-it", milestoneId: "ms-wt-it", title: "2FA rollout — Team accounts",            department: "IT & Security", service: "IT & Security", status: "Waiting",     priority: "High",   dueDate: "2025-06-09", source: "Task Blueprint",     type: "One-Time",  assignedUserName: "Mike T.",   estimatedHours: 3, clientName: "Internal",           projectName: "Infrastructure — Security" }),
  makeTask({ id: "it-6", projectId: "proj-wt-it", milestoneId: "ms-wt-it", title: "Password manager audit",                 department: "IT & Security", service: "IT & Security", status: "Waiting",     priority: "Low",    dueDate: "2025-06-10", source: "Manual",             type: "One-Time",  assignedUserName: "Jordan M.", estimatedHours: 1, clientName: "Internal",           projectName: "Infrastructure — Security" }),
];

// ---------------------------------------------------------------------------
// All Tasks flat list
// ---------------------------------------------------------------------------

export const ALL_TASKS: Task[] = [
  ...blueRidgeTasks,
  ...ridgelineTasks,
  // Department workspace tasks
  ...workspaceAmTasks,
  ...workspaceSalesTasks,
  ...workspaceBillingTasks,
  ...workspaceContentTasks,
  ...workspaceWebDevTasks,
  ...workspaceDesignTasks,
  ...workspaceSeoTasks,
  ...workspaceGbpTasks,
  ...workspaceYelpTasks,
  ...workspaceMetaTasks,
  ...workspacePpcTasks,
  ...workspaceReportingTasks,
  ...workspaceLsaTasks,
  ...workspaceItTasks,
];

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export const MILESTONES: Milestone[] = [
  // ── Department workspace placeholder milestones (one per dept workspace project)
  { id: "ms-wt-am",        projectId: "proj-wt-am",        name: "AM Active Tasks",        owner: "Jordan M.",  status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 40, taskIds: ["am-1","am-2","am-3","am-4","am-5","am-6","am-7"] },
  { id: "ms-wt-sales",     projectId: "proj-wt-sales",     name: "Sales Active Tasks",     owner: "Jordan M.",  status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 30, taskIds: ["sa-1","sa-2","sa-3","sa-4","sa-5","sa-6","sa-7","sa-8","sa-9","sa-10"] },
  { id: "ms-wt-billing",   projectId: "proj-wt-billing",   name: "Billing Active Tasks",   owner: "Lisa P.",    status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 25, taskIds: ["bi-1","bi-2","bi-3","bi-4","bi-5","bi-6","bi-7"] },
  { id: "ms-wt-content",   projectId: "proj-wt-content",   name: "Content Active Tasks",   owner: "Alex R.",    status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 20, taskIds: ["co-1","co-2","co-3","co-4","co-5","co-6","co-7"] },
  { id: "ms-wt-webdev",    projectId: "proj-wt-webdev",    name: "Web Dev Active Tasks",    owner: "Mike T.",    status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 20, taskIds: ["wd-1","wd-2","wd-3","wd-4","wd-5","wd-6"] },
  { id: "ms-wt-design",    projectId: "proj-wt-design",    name: "Design Active Tasks",    owner: "Lisa P.",    status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 20, taskIds: ["de-1","de-2","de-3","de-4","de-5"] },
  { id: "ms-wt-seo",       projectId: "proj-wt-seo",       name: "SEO Active Tasks",       owner: "Lisa P.",    status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 30, taskIds: ["se-1","se-2","se-3","se-4","se-5","se-6"] },
  { id: "ms-wt-gbp",       projectId: "proj-wt-gbp",       name: "GBP Active Tasks",       owner: "Sarah K.",   status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 25, taskIds: ["gb-1","gb-2","gb-3","gb-4","gb-5"] },
  { id: "ms-wt-yelp",      projectId: "proj-wt-yelp",      name: "Yelp Active Tasks",      owner: "Alex R.",    status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 25, taskIds: ["ye-1","ye-2","ye-3","ye-4"] },
  { id: "ms-wt-meta",      projectId: "proj-wt-meta",      name: "Meta Ads Active Tasks",  owner: "Mike T.",    status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 25, taskIds: ["ma-1","ma-2","ma-3","ma-4","ma-5"] },
  { id: "ms-wt-ppc",       projectId: "proj-wt-ppc",       name: "PPC Active Tasks",       owner: "Alex R.",    status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 25, taskIds: ["ga-1","ga-2","ga-3","ga-4","ga-5"] },
  { id: "ms-wt-reporting", projectId: "proj-wt-reporting", name: "Reporting Active Tasks", owner: "Jordan M.",  status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 25, taskIds: ["re-1","re-2","re-3","re-4","re-5","re-6"] },
  { id: "ms-wt-lsa",       projectId: "proj-wt-lsa",       name: "LSA Active Tasks",       owner: "Mike T.",    status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 25, taskIds: ["ls-1","ls-2","ls-3","ls-4","ls-5"] },
  { id: "ms-wt-it",        projectId: "proj-wt-it",        name: "IT & Security Active",   owner: "Mike T.",    status: "In Progress", startDate: "2025-06-01", dueDate: "2025-12-31", progress: 20, taskIds: ["it-1","it-2","it-3","it-4","it-5","it-6"] },

  // Blue Ridge Plumbing Co. (proj-am-mc004)
  { id: "ms-am-mc004-1", projectId: "proj-am-mc004", name: "Service Launch", owner: "Alex R.", status: "Completed", startDate: "2025-05-01", dueDate: "2025-05-20", completionDate: "2025-05-08", progress: 100, taskIds: ["am-mc004-t0","am-mc004-t1","am-mc004-t2","am-mc004-t3"], blueprintId: "bp-004" },
  { id: "ms-am-mc004-2", projectId: "proj-am-mc004", name: "Website Build", owner: "Casey L.", status: "In Progress", startDate: "2025-05-20", dueDate: "2025-06-30", progress: 25, taskIds: ["am-mc004-t4"], blueprintId: "bp-007" },

  // Ridgeline Construction LLC (proj-am-mc011)
  { id: "ms-am-mc011-1", projectId: "proj-am-mc011", name: "Service Launch", owner: "Alex R.", status: "Blocked", startDate: "2025-05-15", dueDate: "2025-06-10", progress: 25, taskIds: ["am-mc011-t0","am-mc011-t1","am-mc011-t2","am-mc011-t3"], blueprintId: "bp-001", blockedReason: "Awaiting GBP and Search Console access credentials from client" },
];

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

function depts(...args: Array<[DepartmentName, string, string[]]>): ProjectDepartment[] {
  return args.map(([department, owner, taskIds]) => ({
    department,
    owner,
    taskIds,
    escalationStatus: "None" as const,
  }));
}

export const PROJECTS: Project[] = [
  // ---------- proj-am-mc004: Blue Ridge Plumbing Co. — SEO / GBP / Website Build ----------
  {
    id: "proj-am-mc004",
    name: "Blue Ridge Plumbing Co. — SEO / GBP / Website Build",
    client: "Blue Ridge Plumbing Co.",
    clientSlug: "blue-ridge-plumbing",
    clientId: "mc004",
    servicePackage: "Custom",
    contractSummary: "SEO / GBP + Website Build. Signed 2025-05-01.",
    owner: "Alex R.",
    accountManager: "Alex R.",
    departments: [
      { department: "Account Management", owner: "Alex R.",   taskIds: ["am-mc004-t0","am-mc004-t1","am-mc004-t2","am-mc004-t3"], escalationStatus: "None" },
      { department: "SEO",                owner: "Alex R.",   taskIds: [],                                                          escalationStatus: "None" },
      { department: "Design",             owner: "Casey L.",  taskIds: ["am-mc004-t4"],                                             escalationStatus: "None" },
      { department: "Web Development",    owner: "Casey L.",  taskIds: [],                                                          escalationStatus: "None" },
    ],
    launchDate: "2025-06-30",
    status: "In Progress",
    health: "Green",
    priority: "High",
    milestoneIds: ["ms-am-mc004-1","ms-am-mc004-2"],
    taskIds: ["am-mc004-t0","am-mc004-t1","am-mc004-t2","am-mc004-t3","am-mc004-t4"],
    activityLog: [
      makeActivity("proj-am-mc004","Project Created",   "Project activated from AM wizard. Services: SEO / GBP, Website Build.", "Alex R.",  "2025-05-01T08:00:00Z"),
      makeActivity("proj-am-mc004","Blueprint Applied", "SEO + GBP and Website Build blueprints applied.","System",  "2025-05-01T08:01:00Z"),
      makeActivity("proj-am-mc004","Task Completed",    "Onboarding and kickoff calls completed.",         "Alex R.",  "2025-05-08T17:00:00Z"),
    ],
    notes: "Blue Ridge Plumbing — website build in wireframe phase. SEO setup pending completion of build.",
    createdAt: "2025-05-01T08:00:00Z",
    updatedAt: "2025-05-28T10:00:00Z",
  },

  // ---------- proj-am-mc011: Ridgeline Construction LLC — SEO / GBP ----------
  {
    id: "proj-am-mc011",
    name: "Ridgeline Construction LLC — SEO / GBP",
    client: "Ridgeline Construction LLC",
    clientSlug: "ridgeline-construction",
    clientId: "mc011",
    servicePackage: "Custom",
    contractSummary: "SEO / GBP. Signed 2025-05-15.",
    owner: "Alex R.",
    accountManager: "Alex R.",
    departments: [
      { department: "Account Management", owner: "Alex R.", taskIds: ["am-mc011-t0","am-mc011-t1","am-mc011-t2"], escalationStatus: "Escalated", delayReason: "Awaiting client credentials" },
      { department: "SEO",                owner: "Alex R.", taskIds: ["am-mc011-t3"],                              escalationStatus: "Escalated", delayReason: "Blocked on access" },
    ],
    launchDate: "2025-06-30",
    status: "Pending Client",
    health: "Yellow",
    priority: "High",
    milestoneIds: ["ms-am-mc011-1"],
    taskIds: ["am-mc011-t0","am-mc011-t1","am-mc011-t2","am-mc011-t3"],
    activityLog: [
      makeActivity("proj-am-mc011","Project Created",  "Project activated from AM wizard. Services: SEO / GBP.", "Alex R.", "2025-05-15T08:00:00Z"),
      makeActivity("proj-am-mc011","Blueprint Applied","SEO / GBP blueprint applied — tasks generated.",         "System",  "2025-05-15T08:01:00Z"),
      makeActivity("proj-am-mc011","Task Completed",   "Kickoff call completed.",                                 "Alex R.", "2025-05-20T17:00:00Z"),
      makeActivity("proj-am-mc011","Blocker Added",    "Client has not provided GBP or Search Console access.",   "Alex R.", "2025-05-27T09:00:00Z"),
    ],
    notes: "Awaiting GBP admin access and Search Console credentials from client.",
    createdAt: "2025-05-15T08:00:00Z",
    updatedAt: "2025-05-27T09:00:00Z",
  },

  // ── Department workspace placeholder projects ──────────────────────────────────────────────────
  // These projects are structural containers for department ongoing tasks.
  // They are not billed projects — they represent the department's running task queue.
  {
    id: "proj-wt-am", name: "Account Management — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing AM department task queue.",
    owner: "Jordan M.", accountManager: "Jordan M.",
    departments: [{ department: "Account Management", owner: "Jordan M.", taskIds: ["am-1","am-2","am-3","am-4","am-5","am-6","am-7"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-am"], taskIds: ["am-1","am-2","am-3","am-4","am-5","am-6","am-7"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-sales", name: "Sales — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing Sales department task queue.",
    owner: "Jordan M.", accountManager: "Jordan M.",
    departments: [{ department: "Sales", owner: "Jordan M.", taskIds: ["sa-1","sa-2","sa-3","sa-4","sa-5","sa-6","sa-7","sa-8","sa-9","sa-10"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-sales"], taskIds: ["sa-1","sa-2","sa-3","sa-4","sa-5","sa-6","sa-7","sa-8","sa-9","sa-10"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-billing", name: "Billing — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing Billing department task queue.",
    owner: "Lisa P.", accountManager: "Lisa P.",
    departments: [{ department: "Billing", owner: "Lisa P.", taskIds: ["bi-1","bi-2","bi-3","bi-4","bi-5","bi-6","bi-7"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-billing"], taskIds: ["bi-1","bi-2","bi-3","bi-4","bi-5","bi-6","bi-7"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-content", name: "Content — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing Content department task queue.",
    owner: "Alex R.", accountManager: "Alex R.",
    departments: [{ department: "Content", owner: "Alex R.", taskIds: ["co-1","co-2","co-3","co-4","co-5","co-6","co-7"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-content"], taskIds: ["co-1","co-2","co-3","co-4","co-5","co-6","co-7"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-webdev", name: "Web Development — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing Web Development department task queue.",
    owner: "Mike T.", accountManager: "Mike T.",
    departments: [{ department: "Web Development", owner: "Mike T.", taskIds: ["wd-1","wd-2","wd-3","wd-4","wd-5","wd-6"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-webdev"], taskIds: ["wd-1","wd-2","wd-3","wd-4","wd-5","wd-6"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-design", name: "Design — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing Design department task queue.",
    owner: "Lisa P.", accountManager: "Lisa P.",
    departments: [{ department: "Design", owner: "Lisa P.", taskIds: ["de-1","de-2","de-3","de-4","de-5"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-design"], taskIds: ["de-1","de-2","de-3","de-4","de-5"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-seo", name: "SEO — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing SEO department task queue.",
    owner: "Lisa P.", accountManager: "Lisa P.",
    departments: [{ department: "SEO", owner: "Lisa P.", taskIds: ["se-1","se-2","se-3","se-4","se-5","se-6"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-seo"], taskIds: ["se-1","se-2","se-3","se-4","se-5","se-6"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-gbp", name: "GBP — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing GBP department task queue.",
    owner: "Sarah K.", accountManager: "Sarah K.",
    departments: [{ department: "GBP", owner: "Sarah K.", taskIds: ["gb-1","gb-2","gb-3","gb-4","gb-5"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-gbp"], taskIds: ["gb-1","gb-2","gb-3","gb-4","gb-5"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-yelp", name: "Yelp — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing Yelp management task queue.",
    owner: "Alex R.", accountManager: "Alex R.",
    departments: [{ department: "SEO", owner: "Alex R.", taskIds: ["ye-1","ye-2","ye-3","ye-4"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-yelp"], taskIds: ["ye-1","ye-2","ye-3","ye-4"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-meta", name: "Meta Ads — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing Meta Ads department task queue.",
    owner: "Mike T.", accountManager: "Mike T.",
    departments: [{ department: "Meta Ads", owner: "Mike T.", taskIds: ["ma-1","ma-2","ma-3","ma-4","ma-5"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-meta"], taskIds: ["ma-1","ma-2","ma-3","ma-4","ma-5"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-ppc", name: "PPC/Google Ads — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing PPC/Google Ads department task queue.",
    owner: "Alex R.", accountManager: "Alex R.",
    departments: [{ department: "PPC", owner: "Alex R.", taskIds: ["ga-1","ga-2","ga-3","ga-4","ga-5"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-ppc"], taskIds: ["ga-1","ga-2","ga-3","ga-4","ga-5"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-reporting", name: "Reporting — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing Reporting department task queue.",
    owner: "Jordan M.", accountManager: "Jordan M.",
    departments: [{ department: "Reporting", owner: "Jordan M.", taskIds: ["re-1","re-2","re-3","re-4","re-5","re-6"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-reporting"], taskIds: ["re-1","re-2","re-3","re-4","re-5","re-6"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-lsa", name: "LSA — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing Local Service Ads department task queue.",
    owner: "Mike T.", accountManager: "Mike T.",
    departments: [{ department: "LSA", owner: "Mike T.", taskIds: ["ls-1","ls-2","ls-3","ls-4","ls-5"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-lsa"], taskIds: ["ls-1","ls-2","ls-3","ls-4","ls-5"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "proj-wt-it", name: "IT & Security — Active Queue", client: "Various", clientSlug: "various",
    servicePackage: "Custom", contractSummary: "Ongoing IT & Security department task queue.",
    owner: "Mike T.", accountManager: "Mike T.",
    departments: [{ department: "IT & Security", owner: "Mike T.", taskIds: ["it-1","it-2","it-3","it-4","it-5","it-6"], escalationStatus: "None" }],
    launchDate: "2025-01-01", status: "In Progress", health: "Green", priority: "Medium",
    milestoneIds: ["ms-wt-it"], taskIds: ["it-1","it-2","it-3","it-4","it-5","it-6"],
    activityLog: [], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Engine Store (mock database)
// ---------------------------------------------------------------------------

export const ENGINE_STORE: EngineStore = {
  projects: PROJECTS,
  milestones: MILESTONES,
  blueprints: BLUEPRINTS,
  tasks: ALL_TASKS,
  users: USERS,
};
