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
// TASKS — Horizon Dental (proj-001)
// ---------------------------------------------------------------------------

const horizonTasks: Task[] = [
  makeTask({ id: "tsk-p1-1", projectId: "proj-001", milestoneId: "ms-001-1", blueprintId: "bp-004", title: "Assign Account Manager",       department: "Account Management", service: "Account Management", status: "Completed", priority: "Urgent", dueDate: "2025-07-16", source: "Task Blueprint", type: "One-Time", assignedUserName: "Priya Nair", assignedUserId: "u3", estimatedHours: 0.25, clientName: "Horizon Dental", projectName: "Horizon Dental — SEO Launch", completionDate: "2025-07-16" }),
  makeTask({ id: "tsk-p1-2", projectId: "proj-001", milestoneId: "ms-001-1", blueprintId: "bp-004", title: "Send Welcome Email & Form",    department: "Account Management", service: "Account Management", status: "Completed", priority: "High",   dueDate: "2025-07-17", source: "Task Blueprint", type: "One-Time", assignedUserName: "Priya Nair", assignedUserId: "u3", estimatedHours: 0.5,  clientName: "Horizon Dental", projectName: "Horizon Dental — SEO Launch", completionDate: "2025-07-17", dependencies: [{ id: "dep-p1-1", dependsOnTaskId: "tsk-p1-1", dependsOnTaskName: "Assign Account Manager", type: "Finish-To-Start", direction: "blocked-by", status: "Completed" }] }),
  makeTask({ id: "tsk-p1-3", projectId: "proj-001", milestoneId: "ms-001-1", blueprintId: "bp-004", title: "Schedule Kickoff Call",        department: "Account Management", service: "Account Management", status: "Completed", priority: "High",   dueDate: "2025-07-19", source: "Task Blueprint", type: "One-Time", assignedUserName: "Priya Nair", assignedUserId: "u3", estimatedHours: 0.25, clientName: "Horizon Dental", projectName: "Horizon Dental — SEO Launch", completionDate: "2025-07-19" }),
  makeTask({ id: "tsk-p1-4", projectId: "proj-001", milestoneId: "ms-001-2", blueprintId: "bp-001", title: "Collect GA4 & GSC Access",     department: "Account Management", service: "SEO Management",    status: "Completed", priority: "Urgent", dueDate: "2025-07-22", source: "Task Blueprint", type: "One-Time", assignedUserName: "Priya Nair", assignedUserId: "u3", estimatedHours: 0.5,  clientName: "Horizon Dental", projectName: "Horizon Dental — SEO Launch", completionDate: "2025-07-22" }),
  makeTask({ id: "tsk-p1-5", projectId: "proj-001", milestoneId: "ms-001-2", blueprintId: "bp-001", title: "Technical SEO Audit",           department: "SEO",                service: "SEO Management",    status: "In Progress", priority: "High",  dueDate: "2025-07-28", source: "Task Blueprint", type: "One-Time", assignedUserName: "Aaron Park",  assignedUserId: "u6", estimatedHours: 4,    clientName: "Horizon Dental", projectName: "Horizon Dental — SEO Launch", dependencies: [{ id: "dep-p1-2", dependsOnTaskId: "tsk-p1-4", dependsOnTaskName: "Collect GA4 & GSC Access", type: "Finish-To-Start", direction: "blocked-by", status: "Completed" }] }),
  makeTask({ id: "tsk-p1-6", projectId: "proj-001", milestoneId: "ms-001-2", blueprintId: "bp-001", title: "Competitor Analysis",           department: "SEO",                service: "SEO Management",    status: "Open",        priority: "High",  dueDate: "2025-07-30", source: "Task Blueprint", type: "One-Time", assignedUserName: "Aaron Park",  assignedUserId: "u6", estimatedHours: 3,    clientName: "Horizon Dental", projectName: "Horizon Dental — SEO Launch" }),
  makeTask({ id: "tsk-p1-7", projectId: "proj-001", milestoneId: "ms-001-2", blueprintId: "bp-001", title: "Keyword Research & Map",        department: "SEO",                service: "SEO Management",    status: "Open",        priority: "High",  dueDate: "2025-08-04", source: "Task Blueprint", type: "One-Time", assignedUserName: "Aaron Park",  assignedUserId: "u6", estimatedHours: 4,    clientName: "Horizon Dental", projectName: "Horizon Dental — SEO Launch", dependencies: [{ id: "dep-p1-3", dependsOnTaskId: "tsk-p1-6", dependsOnTaskName: "Competitor Analysis", type: "Finish-To-Start", direction: "blocked-by", status: "Open" }] }),
  makeTask({ id: "tsk-p1-8", projectId: "proj-001", milestoneId: "ms-001-3", blueprintId: "bp-005", title: "Build Reporting Dashboard",     department: "Reporting",          service: "Monthly Reporting", status: "Open",        priority: "Medium",dueDate: "2025-08-10", source: "Task Blueprint", type: "One-Time", assignedUserName: "Lily Chen",   assignedUserId: "u7", estimatedHours: 2,    clientName: "Horizon Dental", projectName: "Horizon Dental — SEO Launch" }),
  makeTask({ id: "tsk-p1-9", projectId: "proj-001", milestoneId: "ms-001-3", blueprintId: "bp-005", title: "Monthly SEO Report Delivery",   department: "Reporting",          service: "Monthly Reporting", status: "Open",        priority: "Medium",dueDate: "2025-08-31", source: "Task Blueprint", type: "Recurring",  assignedUserName: "Lily Chen",   assignedUserId: "u7", estimatedHours: 1,    clientName: "Horizon Dental", projectName: "Horizon Dental — SEO Launch" }),
];

// ---------------------------------------------------------------------------
// TASKS — Maple Ridge Clinic (proj-002)
// ---------------------------------------------------------------------------

const mapleTasks: Task[] = [
  makeTask({ id: "tsk-p2-1", projectId: "proj-002", milestoneId: "ms-002-1", blueprintId: "bp-004", title: "Kickoff Call Completed",      department: "Account Management", service: "Account Management", status: "Completed", priority: "High",   dueDate: "2025-07-14", source: "Task Blueprint", type: "One-Time", assignedUserName: "Daniel Okonkwo", assignedUserId: "u4", estimatedHours: 1,   clientName: "Maple Ridge Clinic", projectName: "Maple Ridge Clinic — SEO + GBP", completionDate: "2025-07-14" }),
  makeTask({ id: "tsk-p2-2", projectId: "proj-002", milestoneId: "ms-002-1", blueprintId: "bp-004", title: "Send Access Request Form",    department: "Account Management", service: "Account Management", status: "Completed", priority: "Urgent", dueDate: "2025-07-16", source: "Task Blueprint", type: "One-Time", assignedUserName: "Daniel Okonkwo", assignedUserId: "u4", estimatedHours: 0.5, clientName: "Maple Ridge Clinic", projectName: "Maple Ridge Clinic — SEO + GBP", completionDate: "2025-07-16" }),
  makeTask({ id: "tsk-p2-3", projectId: "proj-002", milestoneId: "ms-002-2", blueprintId: "bp-001", title: "Collect GA4 Access",          department: "Account Management", service: "SEO Management",    status: "Blocked",   priority: "Urgent", dueDate: "2025-07-22", source: "Task Blueprint", type: "One-Time", assignedUserName: "Daniel Okonkwo", assignedUserId: "u4", estimatedHours: 0.5, clientName: "Maple Ridge Clinic", projectName: "Maple Ridge Clinic — SEO + GBP" }),
  makeTask({ id: "tsk-p2-4", projectId: "proj-002", milestoneId: "ms-002-2", blueprintId: "bp-002", title: "Collect GBP Admin Access",    department: "Account Management", service: "GBP Management",    status: "Blocked",   priority: "Urgent", dueDate: "2025-07-22", source: "Task Blueprint", type: "One-Time", assignedUserName: "Daniel Okonkwo", assignedUserId: "u4", estimatedHours: 0.5, clientName: "Maple Ridge Clinic", projectName: "Maple Ridge Clinic — SEO + GBP" }),
  makeTask({ id: "tsk-p2-5", projectId: "proj-002", milestoneId: "ms-002-3", blueprintId: "bp-001", title: "Competitor Analysis",         department: "SEO",                service: "SEO Management",    status: "Open",      priority: "Medium", dueDate: "2025-08-01", source: "Task Blueprint", type: "One-Time", assignedUserName: "Aaron Park",     assignedUserId: "u6", estimatedHours: 3,   clientName: "Maple Ridge Clinic", projectName: "Maple Ridge Clinic — SEO + GBP", dependencies: [{ id: "dep-p2-1", dependsOnTaskId: "tsk-p2-3", dependsOnTaskName: "Collect GA4 Access", type: "Finish-To-Start", direction: "blocked-by", status: "Blocked" }] }),
  makeTask({ id: "tsk-p2-6", projectId: "proj-002", milestoneId: "ms-002-3", blueprintId: "bp-002", title: "GBP Profile Optimization",    department: "GBP",                service: "GBP Management",    status: "Open",      priority: "High",   dueDate: "2025-08-03", source: "Task Blueprint", type: "One-Time", assignedUserName: "Aaron Park",     assignedUserId: "u6", estimatedHours: 3,   clientName: "Maple Ridge Clinic", projectName: "Maple Ridge Clinic — SEO + GBP", dependencies: [{ id: "dep-p2-2", dependsOnTaskId: "tsk-p2-4", dependsOnTaskName: "Collect GBP Admin Access", type: "Finish-To-Start", direction: "blocked-by", status: "Blocked" }] }),
];

// ---------------------------------------------------------------------------
// TASKS — Summit Auto Group (proj-003)
// ---------------------------------------------------------------------------

const summitTasks: Task[] = [
  makeTask({ id: "tsk-p3-1", projectId: "proj-003", milestoneId: "ms-003-3", blueprintId: "bp-003", title: "Monthly PPC Optimization",    department: "PPC",      service: "Google Ads Management", status: "In Progress", priority: "High",   dueDate: "2025-07-31", source: "Task Blueprint", type: "Recurring", assignedUserName: "Ryan Torres", assignedUserId: "u8", estimatedHours: 3, clientName: "Summit Auto Group", projectName: "Summit Auto Group — PPC + Landing Page" }),
  makeTask({ id: "tsk-p3-2", projectId: "proj-003", milestoneId: "ms-003-3", blueprintId: "bp-005", title: "PPC Monthly Report",          department: "Reporting", service: "Monthly Reporting",     status: "In Progress", priority: "Medium", dueDate: "2025-07-31", source: "Task Blueprint", type: "Recurring", assignedUserName: "Lily Chen",   assignedUserId: "u7", estimatedHours: 2, clientName: "Summit Auto Group", projectName: "Summit Auto Group — PPC + Landing Page" }),
  makeTask({ id: "tsk-p3-3", projectId: "proj-003", milestoneId: "ms-003-3", blueprintId: "bp-003", title: "Quarterly Strategy Review",   department: "PPC",      service: "Google Ads Management", status: "Open",        priority: "High",   dueDate: "2025-09-30", source: "Task Blueprint", type: "Recurring", assignedUserName: "Ryan Torres", assignedUserId: "u8", estimatedHours: 2, clientName: "Summit Auto Group", projectName: "Summit Auto Group — PPC + Landing Page" }),
];

// ---------------------------------------------------------------------------
// TASKS — Prestige Law Group (proj-004) — ongoing
// ---------------------------------------------------------------------------

const prestigeTasks: Task[] = [
  makeTask({ id: "tsk-p4-1", projectId: "proj-004", blueprintId: "bp-001", title: "Monthly On-Page Optimization",  department: "SEO",       service: "SEO Management",       status: "In Progress", priority: "High",   dueDate: "2025-07-31", source: "Task Blueprint", type: "Recurring", assignedUserName: "Aaron Park",   assignedUserId: "u6", estimatedHours: 4, clientName: "Prestige Law Group", projectName: "Prestige Law Group — Full Service" }),
  makeTask({ id: "tsk-p4-2", projectId: "proj-004", blueprintId: "bp-001", title: "Monthly Link Building",         department: "SEO",       service: "SEO Management",       status: "Open",        priority: "Medium", dueDate: "2025-07-31", source: "Task Blueprint", type: "Recurring", assignedUserName: "Aaron Park",   assignedUserId: "u6", estimatedHours: 3, clientName: "Prestige Law Group", projectName: "Prestige Law Group — Full Service" }),
  makeTask({ id: "tsk-p4-3", projectId: "proj-004", blueprintId: "bp-003", title: "Monthly PPC Optimization",     department: "PPC",       service: "Google Ads Management", status: "In Progress", priority: "High",   dueDate: "2025-07-31", source: "Task Blueprint", type: "Recurring", assignedUserName: "Ryan Torres",  assignedUserId: "u8", estimatedHours: 3, clientName: "Prestige Law Group", projectName: "Prestige Law Group — Full Service" }),
  makeTask({ id: "tsk-p4-4", projectId: "proj-004", blueprintId: "bp-006", title: "Monthly Meta Ads Optimization",department: "Meta Ads",  service: "Meta Ads Management",  status: "In Progress", priority: "High",   dueDate: "2025-07-31", source: "Task Blueprint", type: "Recurring", assignedUserName: "Lily Chen",    assignedUserId: "u7", estimatedHours: 3, clientName: "Prestige Law Group", projectName: "Prestige Law Group — Full Service" }),
  makeTask({ id: "tsk-p4-5", projectId: "proj-004", blueprintId: "bp-005", title: "Monthly Reporting Package",    department: "Reporting", service: "Monthly Reporting",    status: "Open",        priority: "High",   dueDate: "2025-07-31", source: "Task Blueprint", type: "Recurring", assignedUserName: "Lily Chen",    assignedUserId: "u7", estimatedHours: 3, clientName: "Prestige Law Group", projectName: "Prestige Law Group — Full Service" }),
];

// ---------------------------------------------------------------------------
// TASKS — GreenLeaf HVAC (proj-005) — full onboarding
// ---------------------------------------------------------------------------

const greenleafTasks: Task[] = [
  makeTask({ id: "tsk-p5-1", projectId: "proj-005", milestoneId: "ms-005-1", blueprintId: "bp-004", title: "Assign Account Manager",        department: "Account Management", service: "Account Management", status: "Completed",  priority: "Urgent", dueDate: "2025-07-21", source: "Task Blueprint", type: "One-Time", assignedUserName: "Daniel Okonkwo", assignedUserId: "u4", estimatedHours: 0.25, clientName: "GreenLeaf HVAC", projectName: "GreenLeaf HVAC — Full Service Onboarding", completionDate: "2025-07-21" }),
  makeTask({ id: "tsk-p5-2", projectId: "proj-005", milestoneId: "ms-005-1", blueprintId: "bp-004", title: "Send Welcome Email & Onboarding Form", department: "Account Management", service: "Account Management", status: "Completed",  priority: "High",   dueDate: "2025-07-22", source: "Task Blueprint", type: "One-Time", assignedUserName: "Daniel Okonkwo", assignedUserId: "u4", estimatedHours: 0.5,  clientName: "GreenLeaf HVAC", projectName: "GreenLeaf HVAC — Full Service Onboarding", completionDate: "2025-07-22" }),
  makeTask({ id: "tsk-p5-3", projectId: "proj-005", milestoneId: "ms-005-1", blueprintId: "bp-004", title: "Follow Up — Onboarding Form",   department: "Account Management", service: "Account Management", status: "In Progress", priority: "High",   dueDate: "2025-07-28", source: "Task Blueprint", type: "One-Time", assignedUserName: "Daniel Okonkwo", assignedUserId: "u4", estimatedHours: 0.5,  clientName: "GreenLeaf HVAC", projectName: "GreenLeaf HVAC — Full Service Onboarding" }),
  makeTask({ id: "tsk-p5-4", projectId: "proj-005", milestoneId: "ms-005-2", blueprintId: "bp-001", title: "Collect Google Analytics Access", department: "Account Management", service: "SEO Management",    status: "Open",        priority: "Urgent", dueDate: "2025-08-03", source: "Task Blueprint", type: "One-Time", assignedUserName: "Daniel Okonkwo", assignedUserId: "u4", estimatedHours: 0.5,  clientName: "GreenLeaf HVAC", projectName: "GreenLeaf HVAC — Full Service Onboarding" }),
  makeTask({ id: "tsk-p5-5", projectId: "proj-005", milestoneId: "ms-005-2", blueprintId: "bp-003", title: "Collect Google Ads Access",      department: "Account Management", service: "Google Ads Management", status: "Open",   priority: "Urgent", dueDate: "2025-08-03", source: "Task Blueprint", type: "One-Time", assignedUserName: "Daniel Okonkwo", assignedUserId: "u4", estimatedHours: 0.5,  clientName: "GreenLeaf HVAC", projectName: "GreenLeaf HVAC — Full Service Onboarding" }),
  makeTask({ id: "tsk-p5-6", projectId: "proj-005", milestoneId: "ms-005-3", blueprintId: "bp-001", title: "Technical SEO Audit",            department: "SEO",                service: "SEO Management",    status: "Open",        priority: "High",   dueDate: "2025-08-14", source: "Task Blueprint", type: "One-Time", assignedUserName: "Aaron Park",     assignedUserId: "u6", estimatedHours: 4,    clientName: "GreenLeaf HVAC", projectName: "GreenLeaf HVAC — Full Service Onboarding", dependencies: [{ id: "dep-p5-1", dependsOnTaskId: "tsk-p5-4", dependsOnTaskName: "Collect Google Analytics Access", type: "Finish-To-Start", direction: "blocked-by", status: "Open" }] }),
  makeTask({ id: "tsk-p5-7", projectId: "proj-005", milestoneId: "ms-005-3", blueprintId: "bp-003", title: "PPC Campaign Build",             department: "PPC",                service: "Google Ads Management", status: "Open", priority: "High",   dueDate: "2025-08-15", source: "Task Blueprint", type: "One-Time", assignedUserName: "Ryan Torres",    assignedUserId: "u8", estimatedHours: 4,    clientName: "GreenLeaf HVAC", projectName: "GreenLeaf HVAC — Full Service Onboarding", dependencies: [{ id: "dep-p5-2", dependsOnTaskId: "tsk-p5-5", dependsOnTaskName: "Collect Google Ads Access", type: "Finish-To-Start", direction: "blocked-by", status: "Open" }] }),
];

// ---------------------------------------------------------------------------
// All Tasks flat list
// ---------------------------------------------------------------------------

export const ALL_TASKS: Task[] = [
  ...horizonTasks,
  ...mapleTasks,
  ...summitTasks,
  ...prestigeTasks,
  ...greenleafTasks,
];

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export const MILESTONES: Milestone[] = [
  // Horizon Dental
  { id: "ms-001-1", projectId: "proj-001", name: "Kickoff",          owner: "Priya Nair",    status: "Completed",   startDate: "2025-07-15", dueDate: "2025-07-22", completionDate: "2025-07-21", progress: 100, taskIds: ["tsk-p1-1","tsk-p1-2","tsk-p1-3"], blueprintId: "bp-004" },
  { id: "ms-001-2", projectId: "proj-001", name: "SEO Setup",        owner: "Aaron Park",    status: "In Progress", startDate: "2025-07-22", dueDate: "2025-08-05", progress: 45,  taskIds: ["tsk-p1-4","tsk-p1-5","tsk-p1-6","tsk-p1-7"], blueprintId: "bp-001" },
  { id: "ms-001-3", projectId: "proj-001", name: "Reporting Setup",  owner: "Lily Chen",     status: "Not Started", startDate: "2025-08-05", dueDate: "2025-08-15", progress: 0,   taskIds: ["tsk-p1-8","tsk-p1-9"], blueprintId: "bp-005" },
  { id: "ms-001-4", projectId: "proj-001", name: "SEO Launch",       owner: "Priya Nair",    status: "Not Started", startDate: "2025-08-15", dueDate: "2025-08-20", progress: 0,   taskIds: [] },

  // Maple Ridge Clinic
  { id: "ms-002-1", projectId: "proj-002", name: "Onboarding",       owner: "Daniel Okonkwo", status: "In Progress", startDate: "2025-07-10", dueDate: "2025-07-24", progress: 70,  taskIds: ["tsk-p2-1","tsk-p2-2"], blueprintId: "bp-004" },
  { id: "ms-002-2", projectId: "proj-002", name: "Access Collection",owner: "Daniel Okonkwo", status: "Blocked",     startDate: "2025-07-20", dueDate: "2025-07-28", progress: 10,  taskIds: ["tsk-p2-3","tsk-p2-4"], blockedReason: "Client has not provided GA4 or GBP access" },
  { id: "ms-002-3", projectId: "proj-002", name: "SEO + GBP Launch", owner: "Aaron Park",     status: "Not Started", startDate: "2025-07-29", dueDate: "2025-08-15", progress: 0,   taskIds: ["tsk-p2-5","tsk-p2-6"], blueprintId: "bp-001" },

  // Summit Auto Group
  { id: "ms-003-3", projectId: "proj-003", name: "Monthly Management", owner: "Ryan Torres", status: "In Progress", startDate: "2025-07-10", dueDate: "2025-12-31", progress: 30, taskIds: ["tsk-p3-1","tsk-p3-2","tsk-p3-3"] },

  // Prestige Law Group
  { id: "ms-004-3", projectId: "proj-004", name: "Ongoing Management",  owner: "Priya Nair",   status: "In Progress", startDate: "2024-09-01", dueDate: "2026-08-01", progress: 40, taskIds: ["tsk-p4-1","tsk-p4-2","tsk-p4-3","tsk-p4-4","tsk-p4-5"] },

  // GreenLeaf HVAC
  { id: "ms-005-1", projectId: "proj-005", name: "Onboarding",         owner: "Daniel Okonkwo", status: "In Progress", startDate: "2025-07-20", dueDate: "2025-08-01", progress: 50, taskIds: ["tsk-p5-1","tsk-p5-2","tsk-p5-3"], blueprintId: "bp-004" },
  { id: "ms-005-2", projectId: "proj-005", name: "Access Collection",  owner: "Daniel Okonkwo", status: "Not Started", startDate: "2025-08-01", dueDate: "2025-08-10", progress: 0,  taskIds: ["tsk-p5-4","tsk-p5-5"] },
  { id: "ms-005-3", projectId: "proj-005", name: "Department Launch",  owner: "Priya Nair",     status: "Not Started", startDate: "2025-08-11", dueDate: "2025-08-25", progress: 0,  taskIds: ["tsk-p5-6","tsk-p5-7"], blueprintId: "bp-001" },
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
  // ---------- proj-001: Horizon Dental ----------
  {
    id: "proj-001",
    name: "Horizon Dental — SEO Launch",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    servicePackage: "SEO Only",
    contractSummary: "12-month SEO retainer. $1,800/mo. Signed 2025-07-15.",
    owner: "Aaron Park",
    accountManager: "Priya Nair",
    departments: [
      { department: "Account Management", owner: "Priya Nair",  taskIds: ["tsk-p1-1","tsk-p1-2","tsk-p1-3","tsk-p1-4"], escalationStatus: "None" },
      { department: "SEO",                owner: "Aaron Park",  taskIds: ["tsk-p1-5","tsk-p1-6","tsk-p1-7"],           escalationStatus: "None" },
      { department: "Reporting",          owner: "Lily Chen",   taskIds: ["tsk-p1-8","tsk-p1-9"],                       escalationStatus: "None" },
    ],
    launchDate: "2025-08-15",
    status: "In Progress",
    health: "Green",
    priority: "High",
    milestoneIds: ["ms-001-1","ms-001-2","ms-001-3","ms-001-4"],
    taskIds: ["tsk-p1-1","tsk-p1-2","tsk-p1-3","tsk-p1-4","tsk-p1-5","tsk-p1-6","tsk-p1-7","tsk-p1-8","tsk-p1-9"],
    activityLog: [
      makeActivity("proj-001","Project Created",      "Project created from contract signing.",                     "Priya Nair",    "2025-07-15T08:00:00Z"),
      makeActivity("proj-001","Blueprint Applied",    "Onboarding Blueprint applied — 6 tasks generated.",          "System",        "2025-07-15T08:01:00Z"),
      makeActivity("proj-001","Task Assigned",        "Aaron Park assigned to SEO Setup milestone.",                 "Priya Nair",    "2025-07-15T08:05:00Z"),
      makeActivity("proj-001","Invoice Paid",         "First invoice ($1,800) confirmed paid.",                      "Billing System","2025-07-16T10:00:00Z"),
      makeActivity("proj-001","Blueprint Applied",    "SEO Launch Blueprint applied — 6 tasks generated.",          "System",        "2025-07-16T10:01:00Z"),
      makeActivity("proj-001","Milestone Reached",    "Kickoff milestone completed.",                                "Priya Nair",    "2025-07-21T17:00:00Z"),
      makeActivity("proj-001","Task Completed",       "GA4 & GSC Access collected.",                                 "Priya Nair",    "2025-07-22T09:00:00Z"),
    ],
    notes: "Client is a dental group with 3 locations. Focus on local SEO.",
    createdAt: "2025-07-15T08:00:00Z",
    updatedAt: "2025-07-22T10:00:00Z",
  },

  // ---------- proj-002: Maple Ridge Clinic ----------
  {
    id: "proj-002",
    name: "Maple Ridge Clinic — SEO + GBP",
    client: "Maple Ridge Clinic",
    clientSlug: "maple-ridge-clinic",
    servicePackage: "SEO + GBP",
    contractSummary: "12-month SEO + GBP retainer. $2,200/mo. Signed 2025-07-10.",
    owner: "Aaron Park",
    accountManager: "Daniel Okonkwo",
    departments: [
      { department: "Account Management", owner: "Daniel Okonkwo", taskIds: ["tsk-p2-1","tsk-p2-2","tsk-p2-3","tsk-p2-4"], escalationStatus: "Escalated", delayReason: "Blocked on client access" },
      { department: "SEO",                owner: "Aaron Park",     taskIds: ["tsk-p2-5"],                                   escalationStatus: "Escalated", delayReason: "Blocked on client access" },
      { department: "GBP",                owner: "Aaron Park",     taskIds: ["tsk-p2-6"],                                   escalationStatus: "Escalated", delayReason: "Blocked on client access" },
    ],
    launchDate: "2025-08-20",
    status: "Pending Client",
    health: "Red",
    priority: "High",
    milestoneIds: ["ms-002-1","ms-002-2","ms-002-3"],
    taskIds: ["tsk-p2-1","tsk-p2-2","tsk-p2-3","tsk-p2-4","tsk-p2-5","tsk-p2-6"],
    activityLog: [
      makeActivity("proj-002","Project Created",  "Project created from contract signing.",                   "Daniel Okonkwo","2025-07-10T08:00:00Z"),
      makeActivity("proj-002","Invoice Paid",     "First invoice ($2,200) confirmed paid.",                   "Billing System","2025-07-10T10:00:00Z"),
      makeActivity("proj-002","Blueprint Applied","Onboarding Blueprint applied — 6 tasks generated.",        "System",        "2025-07-10T10:01:00Z"),
      makeActivity("proj-002","Task Completed",   "Kickoff call completed.",                                  "Daniel Okonkwo","2025-07-14T17:00:00Z"),
      makeActivity("proj-002","Blocker Added",    "Client has not provided GA4, GSC, or GBP access.",        "Daniel Okonkwo","2025-07-18T09:00:00Z"),
      makeActivity("proj-002","Status Changed",   "Status changed to Pending Client.",                        "System",        "2025-07-18T09:01:00Z"),
    ],
    notes: "Waiting on client to provide GA4 and GBP admin access.",
    createdAt: "2025-07-10T08:00:00Z",
    updatedAt: "2025-07-18T09:01:00Z",
  },

  // ---------- proj-003: Summit Auto Group ----------
  {
    id: "proj-003",
    name: "Summit Auto Group — PPC + Landing Page",
    client: "Summit Auto Group",
    clientSlug: "summit-auto-group",
    servicePackage: "PPC + Landing Page",
    contractSummary: "12-month PPC + web retainer. $3,500/mo. Signed 2025-06-01.",
    owner: "Ryan Torres",
    accountManager: "Priya Nair",
    departments: [
      { department: "PPC",      owner: "Ryan Torres", taskIds: ["tsk-p3-1","tsk-p3-3"], escalationStatus: "None" },
      { department: "Reporting",owner: "Lily Chen",   taskIds: ["tsk-p3-2"],            escalationStatus: "None" },
    ],
    launchDate: "2025-07-10",
    status: "In Progress",
    health: "Green",
    priority: "High",
    milestoneIds: ["ms-003-3"],
    taskIds: ["tsk-p3-1","tsk-p3-2","tsk-p3-3"],
    activityLog: [
      makeActivity("proj-003","Project Created",    "Project created.",                             "Priya Nair",    "2025-06-01T08:00:00Z"),
      makeActivity("proj-003","Milestone Reached",  "PPC Launch milestone completed.",              "Ryan Torres",   "2025-07-08T17:00:00Z"),
      makeActivity("proj-003","Department Activated","Monthly management phase activated.",         "System",        "2025-07-10T08:00:00Z"),
    ],
    createdAt: "2025-06-01T08:00:00Z",
    updatedAt: "2025-07-10T08:00:00Z",
  },

  // ---------- proj-004: Prestige Law Group ----------
  {
    id: "proj-004",
    name: "Prestige Law Group — Full Service",
    client: "Prestige Law Group",
    clientSlug: "prestige-law-group",
    servicePackage: "Full Service",
    contractSummary: "24-month full-service retainer. $6,800/mo. Signed 2024-08-01.",
    owner: "Priya Nair",
    accountManager: "Priya Nair",
    departments: [
      { department: "SEO",      owner: "Aaron Park",  taskIds: ["tsk-p4-1","tsk-p4-2"], escalationStatus: "None" },
      { department: "PPC",      owner: "Ryan Torres", taskIds: ["tsk-p4-3"],            escalationStatus: "None" },
      { department: "Meta Ads", owner: "Lily Chen",   taskIds: ["tsk-p4-4"],            escalationStatus: "None" },
      { department: "Reporting",owner: "Lily Chen",   taskIds: ["tsk-p4-5"],            escalationStatus: "None" },
    ],
    launchDate: "2024-09-01",
    status: "In Progress",
    health: "Green",
    priority: "Critical",
    milestoneIds: ["ms-004-3"],
    taskIds: ["tsk-p4-1","tsk-p4-2","tsk-p4-3","tsk-p4-4","tsk-p4-5"],
    activityLog: [
      makeActivity("proj-004","Project Created",    "Full service project created.",                  "Priya Nair",  "2024-08-01T08:00:00Z"),
      makeActivity("proj-004","Department Activated","All departments activated at launch.",           "System",      "2024-09-01T08:00:00Z"),
      makeActivity("proj-004","Milestone Reached",  "Department launch milestone completed.",         "Priya Nair",  "2024-09-01T17:00:00Z"),
      makeActivity("proj-004","Status Changed",     "Project moved to ongoing management phase.",     "System",      "2024-09-01T17:01:00Z"),
    ],
    createdAt: "2024-08-01T08:00:00Z",
    updatedAt: "2025-07-01T08:00:00Z",
  },

  // ---------- proj-005: GreenLeaf HVAC ----------
  {
    id: "proj-005",
    name: "GreenLeaf HVAC — Full Service Onboarding",
    client: "GreenLeaf HVAC",
    clientSlug: "greenleaf-hvac",
    servicePackage: "Full Service",
    contractSummary: "12-month full-service retainer. $4,800/mo. Signed 2025-07-20.",
    owner: "Priya Nair",
    accountManager: "Daniel Okonkwo",
    departments: [
      { department: "Account Management", owner: "Daniel Okonkwo", taskIds: ["tsk-p5-1","tsk-p5-2","tsk-p5-3","tsk-p5-4","tsk-p5-5"], escalationStatus: "None" },
      { department: "SEO",                owner: "Aaron Park",     taskIds: ["tsk-p5-6"], escalationStatus: "None" },
      { department: "PPC",                owner: "Ryan Torres",    taskIds: ["tsk-p5-7"], escalationStatus: "None" },
    ],
    launchDate: "2025-08-25",
    status: "Pending Client",
    health: "Yellow",
    priority: "High",
    milestoneIds: ["ms-005-1","ms-005-2","ms-005-3"],
    taskIds: ["tsk-p5-1","tsk-p5-2","tsk-p5-3","tsk-p5-4","tsk-p5-5","tsk-p5-6","tsk-p5-7"],
    activityLog: [
      makeActivity("proj-005","Project Created",   "Project created from contract signing.",            "Daniel Okonkwo","2025-07-20T08:00:00Z"),
      makeActivity("proj-005","Invoice Paid",       "First invoice ($4,800) confirmed paid.",           "Billing System","2025-07-20T10:00:00Z"),
      makeActivity("proj-005","Blueprint Applied",  "Onboarding Blueprint applied — 6 tasks generated.","System",        "2025-07-20T10:01:00Z"),
      makeActivity("proj-005","Task Completed",     "Account Manager assigned.",                         "Daniel Okonkwo","2025-07-21T09:00:00Z"),
      makeActivity("proj-005","Task Completed",     "Welcome email and onboarding form sent.",           "Daniel Okonkwo","2025-07-22T10:00:00Z"),
    ],
    notes: "Waiting on client to complete onboarding form sent on Jul 22.",
    createdAt: "2025-07-20T08:00:00Z",
    updatedAt: "2025-07-22T10:00:00Z",
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
