"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type TaskStatus =
  | "Open"
  | "In Progress"
  | "Waiting"
  | "Blocked"
  | "Review"
  | "Completed"
  | "Cancelled";

type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

type Department =
  | "Sales"
  | "Billing"
  | "Account Management"
  | "SEO"
  | "PPC"
  | "Meta Ads"
  | "GBP"
  | "LSA"
  | "Reporting"
  | "Operations"
  | "Admin";

type RelatedModule =
  | "Sales"
  | "Billing"
  | "Activation"
  | "Account Management"
  | "Workflow"
  | "SEO"
  | "PPC"
  | "Meta Ads"
  | "GBP"
  | "LSA"
  | "Reporting"
  | "Renewals"
  | "Cancellations"
  | "Offboarding"
  | "Operations"
  | "Admin";

type DependencyType =
  | "Finish-To-Start"
  | "Start-To-Start"
  | "Finish-To-Finish";

interface TaskComment {
  id: string;
  date: string;
  author: string;
  department: Department;
  body: string;
}

interface TaskDependency {
  id: string;
  taskId: string;
  taskName: string;
  type: DependencyType;
  direction: "blocked-by" | "blocking";
  status: TaskStatus;
}

interface GlobalTask {
  id: string;
  name: string;
  description: string;
  client: string;
  clientSlug: string;
  clientStatus: "Active" | "Onboarding" | "At Risk" | "Churned";
  workflowStatus: string;
  department: Department;
  relatedModule: RelatedModule;
  assignedUser: string;
  taskOwner: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdDate: string;
  dependencies: TaskDependency[];
  comments: TaskComment[];
  linkedWorkflow?: string;
  linkedProject?: string;
  sourceWorkflow?: string;
  triggerEvent?: string;
  notes?: string;
}

type ViewMode = "queue" | "workload" | "calendar" | "templates";

// ─────────────────────────────────────────────
// MOCK DATA — 50+ tasks
// ─────────────────────────────────────────────

const GLOBAL_TASKS: GlobalTask[] = [
  // ── SALES ──
  {
    id: "gt-001",
    name: "Follow-up call with Horizon Dental",
    description: "Schedule discovery call following initial proposal send.",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    clientStatus: "Onboarding",
    workflowStatus: "Proposal Sent",
    department: "Sales",
    relatedModule: "Sales",
    assignedUser: "Marcus Webb",
    taskOwner: "Jessica Reyes",
    priority: "High",
    status: "Open",
    dueDate: "2025-07-28",
    createdDate: "2025-07-22",
    sourceWorkflow: "Sales Pipeline",
    triggerEvent: "Proposal Sent",
    notes: "Client expressed interest in SEO + GBP package.",
    dependencies: [],
    comments: [
      { id: "c1", date: "2025-07-22", author: "Jessica Reyes", department: "Sales", body: "Proposal sent via DocuSign. Follow up if no response by Monday." },
    ],
  },
  {
    id: "gt-002",
    name: "Prepare proposal for Summit Auto Group",
    description: "Build custom proposal covering PPC + Meta Ads + Reporting.",
    client: "Summit Auto Group",
    clientSlug: "summit-auto-group",
    clientStatus: "Active",
    workflowStatus: "Discovery Completed",
    department: "Sales",
    relatedModule: "Sales",
    assignedUser: "Jessica Reyes",
    taskOwner: "Jessica Reyes",
    priority: "Urgent",
    status: "In Progress",
    dueDate: "2025-07-25",
    createdDate: "2025-07-20",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-003",
    name: "Close deal — Maple Ridge Clinic",
    description: "Finalize contract and collect signed agreement.",
    client: "Maple Ridge Clinic",
    clientSlug: "maple-ridge-clinic",
    clientStatus: "Onboarding",
    workflowStatus: "Contract Review",
    department: "Sales",
    relatedModule: "Sales",
    assignedUser: "Marcus Webb",
    taskOwner: "Marcus Webb",
    priority: "Urgent",
    status: "Waiting",
    dueDate: "2025-07-26",
    createdDate: "2025-07-19",
    dependencies: [],
    comments: [
      { id: "c2", date: "2025-07-21", author: "Marcus Webb", department: "Sales", body: "Client legal is reviewing. Expected sign-off by Friday." },
    ],
  },

  // ── BILLING ──
  {
    id: "gt-004",
    name: "Create invoice — Horizon Dental onboarding",
    description: "Generate initial onboarding invoice for SEO + GBP package.",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    clientStatus: "Onboarding",
    workflowStatus: "Proposal Approved",
    department: "Billing",
    relatedModule: "Billing",
    assignedUser: "Sofia Castillo",
    taskOwner: "Sofia Castillo",
    priority: "High",
    status: "Open",
    dueDate: "2025-07-27",
    createdDate: "2025-07-23",
    sourceWorkflow: "Sales Pipeline",
    triggerEvent: "Proposal Approved",
    dependencies: [
      { id: "dep-1", taskId: "gt-003", taskName: "Close deal — Maple Ridge Clinic", type: "Finish-To-Start", direction: "blocked-by", status: "Waiting" },
    ],
    comments: [],
  },
  {
    id: "gt-005",
    name: "Collect payment — Summit Auto Group",
    description: "Follow up on outstanding invoice #INV-2025-0412.",
    client: "Summit Auto Group",
    clientSlug: "summit-auto-group",
    clientStatus: "Active",
    workflowStatus: "Invoice Sent",
    department: "Billing",
    relatedModule: "Billing",
    assignedUser: "Sofia Castillo",
    taskOwner: "Sofia Castillo",
    priority: "High",
    status: "Waiting",
    dueDate: "2025-07-24",
    createdDate: "2025-07-17",
    dependencies: [],
    comments: [
      { id: "c3", date: "2025-07-22", author: "Sofia Castillo", department: "Billing", body: "Second reminder sent. CC'd account manager." },
    ],
  },
  {
    id: "gt-006",
    name: "Process refund — Clearwater Spa",
    description: "Issue partial refund for cancelled PPC campaign.",
    client: "Clearwater Spa",
    clientSlug: "clearwater-spa",
    clientStatus: "Churned",
    workflowStatus: "Cancellation Approved",
    department: "Billing",
    relatedModule: "Cancellations",
    assignedUser: "Sofia Castillo",
    taskOwner: "Sofia Castillo",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2025-07-28",
    createdDate: "2025-07-21",
    sourceWorkflow: "Cancellation Workflow",
    triggerEvent: "Cancellation Approved",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-007",
    name: "Set up recurring billing — Maple Ridge Clinic",
    description: "Configure auto-charge in Stripe for monthly management fee.",
    client: "Maple Ridge Clinic",
    clientSlug: "maple-ridge-clinic",
    clientStatus: "Onboarding",
    workflowStatus: "Invoice Paid",
    department: "Billing",
    relatedModule: "Activation",
    assignedUser: "Sofia Castillo",
    taskOwner: "Sofia Castillo",
    priority: "High",
    status: "Open",
    dueDate: "2025-07-30",
    createdDate: "2025-07-24",
    sourceWorkflow: "Onboarding Workflow",
    triggerEvent: "Invoice Paid",
    dependencies: [
      { id: "dep-2", taskId: "gt-004", taskName: "Create invoice — Horizon Dental onboarding", type: "Finish-To-Start", direction: "blocked-by", status: "Open" },
    ],
    comments: [],
  },

  // ── ACCOUNT MANAGEMENT / ONBOARDING ──
  {
    id: "gt-008",
    name: "Assign Account Manager — Horizon Dental",
    description: "Assign primary AM and notify client via welcome email.",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    clientStatus: "Onboarding",
    workflowStatus: "Invoice Paid",
    department: "Account Management",
    relatedModule: "Account Management",
    assignedUser: "Priya Nair",
    taskOwner: "Priya Nair",
    priority: "Urgent",
    status: "In Progress",
    dueDate: "2025-07-25",
    createdDate: "2025-07-23",
    sourceWorkflow: "Onboarding Workflow",
    triggerEvent: "Invoice Paid",
    linkedWorkflow: "/admin/workflows",
    dependencies: [],
    comments: [
      { id: "c4", date: "2025-07-24", author: "Priya Nair", department: "Account Management", body: "Welcome email sent. Kickoff scheduled for Monday 9am." },
    ],
  },
  {
    id: "gt-009",
    name: "Schedule kickoff call — Horizon Dental",
    description: "Book 90-min onboarding kickoff with client stakeholders.",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    clientStatus: "Onboarding",
    workflowStatus: "AM Assigned",
    department: "Account Management",
    relatedModule: "Account Management",
    assignedUser: "Priya Nair",
    taskOwner: "Priya Nair",
    priority: "High",
    status: "Open",
    dueDate: "2025-07-28",
    createdDate: "2025-07-23",
    sourceWorkflow: "Onboarding Workflow",
    triggerEvent: "Assign AM",
    linkedWorkflow: "/admin/workflows",
    dependencies: [
      { id: "dep-3", taskId: "gt-008", taskName: "Assign Account Manager — Horizon Dental", type: "Finish-To-Start", direction: "blocked-by", status: "In Progress" },
    ],
    comments: [],
  },
  {
    id: "gt-010",
    name: "Complete onboarding intake form — Maple Ridge Clinic",
    description: "Client must complete business info, access credentials, and goals form.",
    client: "Maple Ridge Clinic",
    clientSlug: "maple-ridge-clinic",
    clientStatus: "Onboarding",
    workflowStatus: "Kickoff Scheduled",
    department: "Account Management",
    relatedModule: "Account Management",
    assignedUser: "Daniel Okonkwo",
    taskOwner: "Priya Nair",
    priority: "High",
    status: "Waiting",
    dueDate: "2025-07-29",
    createdDate: "2025-07-22",
    dependencies: [],
    comments: [
      { id: "c5", date: "2025-07-23", author: "Daniel Okonkwo", department: "Account Management", body: "Form link sent. Client confirmed they'll complete by Thursday." },
    ],
  },

  // ── SEO ──
  {
    id: "gt-011",
    name: "Keyword strategy — Horizon Dental",
    description: "Build initial keyword map for dental services + local modifiers.",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    clientStatus: "Onboarding",
    workflowStatus: "Kickoff Complete",
    department: "SEO",
    relatedModule: "SEO",
    assignedUser: "Aaron Park",
    taskOwner: "Aaron Park",
    priority: "High",
    status: "Open",
    dueDate: "2025-08-04",
    createdDate: "2025-07-24",
    sourceWorkflow: "Onboarding Workflow",
    triggerEvent: "Start Onboarding",
    dependencies: [
      { id: "dep-4", taskId: "gt-009", taskName: "Schedule kickoff call — Horizon Dental", type: "Finish-To-Start", direction: "blocked-by", status: "Open" },
    ],
    comments: [],
  },
  {
    id: "gt-012",
    name: "On-page optimization — Summit Auto Group",
    description: "Update title tags, meta descriptions, H1s across 8 service pages.",
    client: "Summit Auto Group",
    clientSlug: "summit-auto-group",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "SEO",
    relatedModule: "SEO",
    assignedUser: "Aaron Park",
    taskOwner: "Aaron Park",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2025-07-31",
    createdDate: "2025-07-15",
    dependencies: [],
    comments: [
      { id: "c6", date: "2025-07-20", author: "Aaron Park", department: "SEO", body: "Homepage and 3 service pages complete. 5 remaining." },
    ],
  },
  {
    id: "gt-013",
    name: "Technical SEO audit — Lakeview Orthodontics",
    description: "Run full Screaming Frog crawl, identify crawl errors, CWV issues.",
    client: "Lakeview Orthodontics",
    clientSlug: "lakeview-orthodontics",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "SEO",
    relatedModule: "SEO",
    assignedUser: "Aaron Park",
    taskOwner: "Aaron Park",
    priority: "High",
    status: "Blocked",
    dueDate: "2025-07-26",
    createdDate: "2025-07-14",
    dependencies: [
      { id: "dep-5", taskId: "gt-021", taskName: "Provide website access — Lakeview Orthodontics", type: "Finish-To-Start", direction: "blocked-by", status: "Waiting" },
    ],
    comments: [
      { id: "c7", date: "2025-07-18", author: "Aaron Park", department: "SEO", body: "Blocked — waiting on client to provide WP admin credentials." },
    ],
  },
  {
    id: "gt-014",
    name: "Monthly SEO report — Prestige Law Group",
    description: "Compile GA4, GSC, and ranking data into monthly client report.",
    client: "Prestige Law Group",
    clientSlug: "prestige-law-group",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "SEO",
    relatedModule: "Reporting",
    assignedUser: "Lily Chen",
    taskOwner: "Aaron Park",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2025-07-30",
    createdDate: "2025-07-22",
    dependencies: [],
    comments: [],
  },

  // ── PPC ──
  {
    id: "gt-015",
    name: "Launch Google Ads — Horizon Dental",
    description: "Set up and launch initial Google Ads campaigns for dental services.",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    clientStatus: "Onboarding",
    workflowStatus: "Department Activation",
    department: "PPC",
    relatedModule: "PPC",
    assignedUser: "Ryan Torres",
    taskOwner: "Ryan Torres",
    priority: "High",
    status: "Open",
    dueDate: "2025-08-05",
    createdDate: "2025-07-24",
    sourceWorkflow: "Onboarding Workflow",
    triggerEvent: "Start Onboarding",
    dependencies: [
      { id: "dep-6", taskId: "gt-010", taskName: "Complete onboarding intake form — Maple Ridge Clinic", type: "Finish-To-Start", direction: "blocked-by", status: "Waiting" },
    ],
    comments: [],
  },
  {
    id: "gt-016",
    name: "Optimize PPC campaigns — Summit Auto Group",
    description: "Review search term report, add negatives, adjust bids on underperforming ad groups.",
    client: "Summit Auto Group",
    clientSlug: "summit-auto-group",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "PPC",
    relatedModule: "PPC",
    assignedUser: "Ryan Torres",
    taskOwner: "Ryan Torres",
    priority: "High",
    status: "In Progress",
    dueDate: "2025-07-28",
    createdDate: "2025-07-21",
    dependencies: [],
    comments: [
      { id: "c8", date: "2025-07-22", author: "Ryan Torres", department: "PPC", body: "CPL increased 18% last week. Adjusting match types and reviewing Quality Scores." },
    ],
  },
  {
    id: "gt-017",
    name: "PPC budget review — Prestige Law Group",
    description: "Review monthly budget pacing and reallocate between campaigns.",
    client: "Prestige Law Group",
    clientSlug: "prestige-law-group",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "PPC",
    relatedModule: "PPC",
    assignedUser: "Ryan Torres",
    taskOwner: "Ryan Torres",
    priority: "Medium",
    status: "Open",
    dueDate: "2025-07-31",
    createdDate: "2025-07-23",
    dependencies: [],
    comments: [],
  },

  // ── META ADS ──
  {
    id: "gt-018",
    name: "Launch Meta Ads — Horizon Dental",
    description: "Create Facebook/Instagram ad campaigns for dental lead generation.",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    clientStatus: "Onboarding",
    workflowStatus: "Department Activation",
    department: "Meta Ads",
    relatedModule: "Meta Ads",
    assignedUser: "Lily Chen",
    taskOwner: "Lily Chen",
    priority: "High",
    status: "Open",
    dueDate: "2025-08-06",
    createdDate: "2025-07-24",
    sourceWorkflow: "Onboarding Workflow",
    triggerEvent: "Start Onboarding",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-019",
    name: "Creative refresh — Summit Auto Group Meta",
    description: "Design and launch new ad creatives for Q3 vehicle specials.",
    client: "Summit Auto Group",
    clientSlug: "summit-auto-group",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "Meta Ads",
    relatedModule: "Meta Ads",
    assignedUser: "Lily Chen",
    taskOwner: "Lily Chen",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2025-07-30",
    createdDate: "2025-07-18",
    dependencies: [],
    comments: [],
  },

  // ── GBP ──
  {
    id: "gt-020",
    name: "GBP setup — Horizon Dental",
    description: "Claim and fully optimize Google Business Profile for main location.",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    clientStatus: "Onboarding",
    workflowStatus: "Department Activation",
    department: "GBP",
    relatedModule: "GBP",
    assignedUser: "Daniel Okonkwo",
    taskOwner: "Daniel Okonkwo",
    priority: "High",
    status: "In Progress",
    dueDate: "2025-07-31",
    createdDate: "2025-07-24",
    sourceWorkflow: "Onboarding Workflow",
    triggerEvent: "Start Onboarding",
    dependencies: [],
    comments: [
      { id: "c9", date: "2025-07-25", author: "Daniel Okonkwo", department: "GBP", body: "Profile claimed. Working on photo uploads and service descriptions." },
    ],
  },
  {
    id: "gt-021",
    name: "Provide website access — Lakeview Orthodontics",
    description: "Client to grant WP admin + Google Analytics access.",
    client: "Lakeview Orthodontics",
    clientSlug: "lakeview-orthodontics",
    clientStatus: "Active",
    workflowStatus: "Access Pending",
    department: "Account Management",
    relatedModule: "Account Management",
    assignedUser: "Priya Nair",
    taskOwner: "Priya Nair",
    priority: "Urgent",
    status: "Waiting",
    dueDate: "2025-07-25",
    createdDate: "2025-07-18",
    dependencies: [],
    comments: [
      { id: "c10", date: "2025-07-20", author: "Priya Nair", department: "Account Management", body: "Third reminder sent. Escalating to client owner contact." },
    ],
  },

  // ── LSA ──
  {
    id: "gt-022",
    name: "LSA verification — Maple Ridge Clinic",
    description: "Complete Google Local Services Ads verification process.",
    client: "Maple Ridge Clinic",
    clientSlug: "maple-ridge-clinic",
    clientStatus: "Onboarding",
    workflowStatus: "Department Activation",
    department: "LSA",
    relatedModule: "LSA",
    assignedUser: "Ryan Torres",
    taskOwner: "Ryan Torres",
    priority: "High",
    status: "Open",
    dueDate: "2025-08-02",
    createdDate: "2025-07-24",
    sourceWorkflow: "Onboarding Workflow",
    triggerEvent: "Start Onboarding",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-023",
    name: "LSA budget optimization — Prestige Law Group",
    description: "Review lead quality scores and adjust bidding strategy.",
    client: "Prestige Law Group",
    clientSlug: "prestige-law-group",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "LSA",
    relatedModule: "LSA",
    assignedUser: "Ryan Torres",
    taskOwner: "Ryan Torres",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2025-07-29",
    createdDate: "2025-07-20",
    dependencies: [],
    comments: [],
  },

  // ── REPORTING ──
  {
    id: "gt-024",
    name: "Monthly reporting dashboard — Summit Auto Group",
    description: "Build and deliver July performance dashboard via AgencyAnalytics.",
    client: "Summit Auto Group",
    clientSlug: "summit-auto-group",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "Reporting",
    relatedModule: "Reporting",
    assignedUser: "Lily Chen",
    taskOwner: "Lily Chen",
    priority: "High",
    status: "In Progress",
    dueDate: "2025-07-31",
    createdDate: "2025-07-22",
    dependencies: [],
    comments: [
      { id: "c11", date: "2025-07-23", author: "Lily Chen", department: "Reporting", body: "PPC and Meta sections complete. SEO section pending Aaron's data pull." },
    ],
  },
  {
    id: "gt-025",
    name: "Quarterly business review prep — Lakeview Orthodontics",
    description: "Prepare 6-month performance review deck for QBR call.",
    client: "Lakeview Orthodontics",
    clientSlug: "lakeview-orthodontics",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "Reporting",
    relatedModule: "Reporting",
    assignedUser: "Lily Chen",
    taskOwner: "Priya Nair",
    priority: "High",
    status: "Open",
    dueDate: "2025-08-01",
    createdDate: "2025-07-23",
    dependencies: [],
    comments: [],
  },

  // ── RENEWALS ──
  {
    id: "gt-026",
    name: "Renewal review — Prestige Law Group",
    description: "Review account performance ahead of contract renewal date.",
    client: "Prestige Law Group",
    clientSlug: "prestige-law-group",
    clientStatus: "Active",
    workflowStatus: "Renewal Due",
    department: "Account Management",
    relatedModule: "Renewals",
    assignedUser: "Priya Nair",
    taskOwner: "Priya Nair",
    priority: "Urgent",
    status: "In Progress",
    dueDate: "2025-07-28",
    createdDate: "2025-07-20",
    sourceWorkflow: "Renewal Workflow",
    triggerEvent: "Renewal Due",
    linkedWorkflow: "/renewals",
    dependencies: [],
    comments: [
      { id: "c12", date: "2025-07-22", author: "Priya Nair", department: "Account Management", body: "Strong performance data — recommend upsell on Meta Ads." },
    ],
  },
  {
    id: "gt-027",
    name: "Prepare renewal proposal — Prestige Law Group",
    description: "Build renewal + upsell proposal with updated pricing.",
    client: "Prestige Law Group",
    clientSlug: "prestige-law-group",
    clientStatus: "Active",
    workflowStatus: "Renewal Due",
    department: "Sales",
    relatedModule: "Renewals",
    assignedUser: "Jessica Reyes",
    taskOwner: "Jessica Reyes",
    priority: "Urgent",
    status: "Open",
    dueDate: "2025-07-30",
    createdDate: "2025-07-23",
    sourceWorkflow: "Renewal Workflow",
    triggerEvent: "Renewal Due",
    dependencies: [
      { id: "dep-7", taskId: "gt-026", taskName: "Renewal review — Prestige Law Group", type: "Finish-To-Start", direction: "blocked-by", status: "In Progress" },
    ],
    comments: [],
  },
  {
    id: "gt-028",
    name: "Send renewal proposal — Prestige Law Group",
    description: "Send proposal via DocuSign and schedule follow-up call.",
    client: "Prestige Law Group",
    clientSlug: "prestige-law-group",
    clientStatus: "Active",
    workflowStatus: "Renewal Due",
    department: "Sales",
    relatedModule: "Renewals",
    assignedUser: "Jessica Reyes",
    taskOwner: "Jessica Reyes",
    priority: "High",
    status: "Open",
    dueDate: "2025-08-01",
    createdDate: "2025-07-23",
    sourceWorkflow: "Renewal Workflow",
    triggerEvent: "Renewal Due",
    dependencies: [
      { id: "dep-8", taskId: "gt-027", taskName: "Prepare renewal proposal — Prestige Law Group", type: "Finish-To-Start", direction: "blocked-by", status: "Open" },
    ],
    comments: [],
  },
  {
    id: "gt-029",
    name: "Renewal follow-up — BlueSky Roofing",
    description: "Contact client about contract renewal, address objections.",
    client: "BlueSky Roofing",
    clientSlug: "bluesky-roofing",
    clientStatus: "At Risk",
    workflowStatus: "Renewal Due",
    department: "Account Management",
    relatedModule: "Renewals",
    assignedUser: "Daniel Okonkwo",
    taskOwner: "Priya Nair",
    priority: "Urgent",
    status: "In Progress",
    dueDate: "2025-07-26",
    createdDate: "2025-07-19",
    sourceWorkflow: "Renewal Workflow",
    triggerEvent: "Renewal Due",
    dependencies: [],
    comments: [
      { id: "c13", date: "2025-07-22", author: "Daniel Okonkwo", department: "Account Management", body: "Client unhappy with LSA results. Offered a 60-day performance extension at no charge." },
    ],
  },

  // ── CANCELLATIONS ──
  {
    id: "gt-030",
    name: "Process cancellation — Clearwater Spa",
    description: "Complete cancellation workflow per client request.",
    client: "Clearwater Spa",
    clientSlug: "clearwater-spa",
    clientStatus: "Churned",
    workflowStatus: "Cancellation Approved",
    department: "Account Management",
    relatedModule: "Cancellations",
    assignedUser: "Priya Nair",
    taskOwner: "Priya Nair",
    priority: "High",
    status: "In Progress",
    dueDate: "2025-07-28",
    createdDate: "2025-07-21",
    sourceWorkflow: "Cancellation Workflow",
    triggerEvent: "Cancellation Approved",
    linkedWorkflow: "/billing/cancellations",
    dependencies: [],
    comments: [],
  },

  // ── OFFBOARDING ──
  {
    id: "gt-031",
    name: "Billing review — Clearwater Spa offboarding",
    description: "Review all outstanding invoices, credits, and refunds before account closure.",
    client: "Clearwater Spa",
    clientSlug: "clearwater-spa",
    clientStatus: "Churned",
    workflowStatus: "Offboarding",
    department: "Billing",
    relatedModule: "Offboarding",
    assignedUser: "Sofia Castillo",
    taskOwner: "Sofia Castillo",
    priority: "High",
    status: "In Progress",
    dueDate: "2025-07-29",
    createdDate: "2025-07-22",
    sourceWorkflow: "Offboarding Workflow",
    triggerEvent: "Cancellation Approved",
    dependencies: [
      { id: "dep-9", taskId: "gt-030", taskName: "Process cancellation — Clearwater Spa", type: "Finish-To-Start", direction: "blocked-by", status: "In Progress" },
    ],
    comments: [],
  },
  {
    id: "gt-032",
    name: "Department shutdown — Clearwater Spa",
    description: "Pause all active campaigns: PPC, Meta Ads, LSA.",
    client: "Clearwater Spa",
    clientSlug: "clearwater-spa",
    clientStatus: "Churned",
    workflowStatus: "Offboarding",
    department: "Operations",
    relatedModule: "Offboarding",
    assignedUser: "Marcus Webb",
    taskOwner: "Marcus Webb",
    priority: "Urgent",
    status: "In Progress",
    dueDate: "2025-07-27",
    createdDate: "2025-07-22",
    sourceWorkflow: "Offboarding Workflow",
    triggerEvent: "Cancellation Approved",
    dependencies: [],
    comments: [
      { id: "c14", date: "2025-07-23", author: "Marcus Webb", department: "Operations", body: "PPC campaigns paused. Meta and LSA shutdown in progress." },
    ],
  },
  {
    id: "gt-033",
    name: "Access removal — Clearwater Spa",
    description: "Remove team access to client GA4, GSC, GBP, and ad platforms.",
    client: "Clearwater Spa",
    clientSlug: "clearwater-spa",
    clientStatus: "Churned",
    workflowStatus: "Offboarding",
    department: "Operations",
    relatedModule: "Offboarding",
    assignedUser: "Marcus Webb",
    taskOwner: "Marcus Webb",
    priority: "High",
    status: "Open",
    dueDate: "2025-07-30",
    createdDate: "2025-07-22",
    sourceWorkflow: "Offboarding Workflow",
    triggerEvent: "Cancellation Approved",
    dependencies: [
      { id: "dep-10", taskId: "gt-032", taskName: "Department shutdown — Clearwater Spa", type: "Finish-To-Start", direction: "blocked-by", status: "In Progress" },
    ],
    comments: [],
  },
  {
    id: "gt-034",
    name: "Final report — Clearwater Spa",
    description: "Deliver final performance report and data export to client.",
    client: "Clearwater Spa",
    clientSlug: "clearwater-spa",
    clientStatus: "Churned",
    workflowStatus: "Offboarding",
    department: "Reporting",
    relatedModule: "Offboarding",
    assignedUser: "Lily Chen",
    taskOwner: "Lily Chen",
    priority: "Medium",
    status: "Open",
    dueDate: "2025-08-02",
    createdDate: "2025-07-22",
    sourceWorkflow: "Offboarding Workflow",
    triggerEvent: "Cancellation Approved",
    dependencies: [
      { id: "dep-11", taskId: "gt-033", taskName: "Access removal — Clearwater Spa", type: "Finish-To-Start", direction: "blocked-by", status: "Open" },
    ],
    comments: [],
  },

  // ── OPERATIONS ──
  {
    id: "gt-035",
    name: "Onboard new team member — PPC Specialist",
    description: "Set up platform access, slack, ClickUp, and client onboarding for new hire.",
    client: "Internal",
    clientSlug: "",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "Operations",
    relatedModule: "Operations",
    assignedUser: "Marcus Webb",
    taskOwner: "Marcus Webb",
    priority: "High",
    status: "In Progress",
    dueDate: "2025-07-28",
    createdDate: "2025-07-20",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-036",
    name: "Update SOP — Client Onboarding Checklist",
    description: "Revise and publish updated onboarding SOP with new department steps.",
    client: "Internal",
    clientSlug: "",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "Operations",
    relatedModule: "Operations",
    assignedUser: "Priya Nair",
    taskOwner: "Priya Nair",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2025-07-31",
    createdDate: "2025-07-18",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-037",
    name: "Platform audit — Google Ads MCC",
    description: "Audit all active Google Ads accounts for billing anomalies and policy flags.",
    client: "Internal",
    clientSlug: "",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "Operations",
    relatedModule: "Operations",
    assignedUser: "Ryan Torres",
    taskOwner: "Marcus Webb",
    priority: "Medium",
    status: "Open",
    dueDate: "2025-08-04",
    createdDate: "2025-07-23",
    dependencies: [],
    comments: [],
  },

  // ── ADMIN ──
  {
    id: "gt-038",
    name: "Contract renewal — Semrush agency plan",
    description: "Review usage, negotiate rate, renew or switch tools.",
    client: "Internal",
    clientSlug: "",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "Admin",
    relatedModule: "Admin",
    assignedUser: "Jessica Reyes",
    taskOwner: "Jessica Reyes",
    priority: "High",
    status: "In Progress",
    dueDate: "2025-07-30",
    createdDate: "2025-07-15",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-039",
    name: "Q3 team performance reviews",
    description: "Complete all direct report performance reviews for Q3.",
    client: "Internal",
    clientSlug: "",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "Admin",
    relatedModule: "Admin",
    assignedUser: "Priya Nair",
    taskOwner: "Priya Nair",
    priority: "Medium",
    status: "Open",
    dueDate: "2025-08-08",
    createdDate: "2025-07-22",
    dependencies: [],
    comments: [],
  },

  // ── MORE ONBOARDING TASKS ──
  {
    id: "gt-040",
    name: "Create department activation tasks — Horizon Dental",
    description: "Spin up activation tasks for SEO, PPC, Meta Ads, GBP, and Reporting.",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    clientStatus: "Onboarding",
    workflowStatus: "Kickoff Complete",
    department: "Account Management",
    relatedModule: "Activation",
    assignedUser: "Priya Nair",
    taskOwner: "Priya Nair",
    priority: "Urgent",
    status: "In Progress",
    dueDate: "2025-07-26",
    createdDate: "2025-07-24",
    sourceWorkflow: "Onboarding Workflow",
    triggerEvent: "Complete Kickoff",
    linkedWorkflow: "/billing/activation",
    dependencies: [
      { id: "dep-12", taskId: "gt-009", taskName: "Schedule kickoff call — Horizon Dental", type: "Finish-To-Start", direction: "blocked-by", status: "Open" },
    ],
    comments: [],
  },
  {
    id: "gt-041",
    name: "Reporting setup — Horizon Dental",
    description: "Configure AgencyAnalytics dashboard and connect all data sources.",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    clientStatus: "Onboarding",
    workflowStatus: "Department Activation",
    department: "Reporting",
    relatedModule: "Reporting",
    assignedUser: "Lily Chen",
    taskOwner: "Lily Chen",
    priority: "High",
    status: "Open",
    dueDate: "2025-08-07",
    createdDate: "2025-07-24",
    sourceWorkflow: "Onboarding Workflow",
    triggerEvent: "Start Onboarding",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-042",
    name: "Competitor analysis — Maple Ridge Clinic",
    description: "Research top 5 local competitors in dental space.",
    client: "Maple Ridge Clinic",
    clientSlug: "maple-ridge-clinic",
    clientStatus: "Onboarding",
    workflowStatus: "Onboarding",
    department: "SEO",
    relatedModule: "SEO",
    assignedUser: "Aaron Park",
    taskOwner: "Aaron Park",
    priority: "Medium",
    status: "Open",
    dueDate: "2025-08-01",
    createdDate: "2025-07-24",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-043",
    name: "GBP posts schedule — Summit Auto Group",
    description: "Create 30-day GBP post calendar for Q3.",
    client: "Summit Auto Group",
    clientSlug: "summit-auto-group",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "GBP",
    relatedModule: "GBP",
    assignedUser: "Daniel Okonkwo",
    taskOwner: "Daniel Okonkwo",
    priority: "Low",
    status: "Open",
    dueDate: "2025-08-01",
    createdDate: "2025-07-23",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-044",
    name: "Invoice dispute resolution — Lakeview Orthodontics",
    description: "Resolve billing discrepancy on June invoice.",
    client: "Lakeview Orthodontics",
    clientSlug: "lakeview-orthodontics",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "Billing",
    relatedModule: "Billing",
    assignedUser: "Sofia Castillo",
    taskOwner: "Sofia Castillo",
    priority: "High",
    status: "In Progress",
    dueDate: "2025-07-26",
    createdDate: "2025-07-21",
    dependencies: [],
    comments: [
      { id: "c15", date: "2025-07-22", author: "Sofia Castillo", department: "Billing", body: "Confirmed overcharge of $150. Issuing credit on next invoice." },
    ],
  },
  {
    id: "gt-045",
    name: "Meta Ads pixel audit — Prestige Law Group",
    description: "Verify Meta pixel is firing correctly on all conversion events.",
    client: "Prestige Law Group",
    clientSlug: "prestige-law-group",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "Meta Ads",
    relatedModule: "Meta Ads",
    assignedUser: "Lily Chen",
    taskOwner: "Lily Chen",
    priority: "Medium",
    status: "Review",
    dueDate: "2025-07-25",
    createdDate: "2025-07-19",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-046",
    name: "Escalate at-risk account — BlueSky Roofing",
    description: "Escalate account to senior AM due to renewal risk.",
    client: "BlueSky Roofing",
    clientSlug: "bluesky-roofing",
    clientStatus: "At Risk",
    workflowStatus: "At Risk",
    department: "Account Management",
    relatedModule: "Account Management",
    assignedUser: "Priya Nair",
    taskOwner: "Priya Nair",
    priority: "Urgent",
    status: "In Progress",
    dueDate: "2025-07-25",
    createdDate: "2025-07-22",
    dependencies: [],
    comments: [
      { id: "c16", date: "2025-07-23", author: "Priya Nair", department: "Account Management", body: "Escalated to VP of Client Services. Retention call scheduled for Friday." },
    ],
  },
  {
    id: "gt-047",
    name: "SEO reporting setup — Maple Ridge Clinic",
    description: "Add GSC, GA4, and ranking tracker to reporting dashboard.",
    client: "Maple Ridge Clinic",
    clientSlug: "maple-ridge-clinic",
    clientStatus: "Onboarding",
    workflowStatus: "Onboarding",
    department: "SEO",
    relatedModule: "SEO",
    assignedUser: "Aaron Park",
    taskOwner: "Aaron Park",
    priority: "Medium",
    status: "Open",
    dueDate: "2025-08-05",
    createdDate: "2025-07-24",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-048",
    name: "Quarterly strategy review — Summit Auto Group",
    description: "Prepare and deliver Q3 strategy review with performance insights and Q4 plan.",
    client: "Summit Auto Group",
    clientSlug: "summit-auto-group",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "Account Management",
    relatedModule: "Account Management",
    assignedUser: "Priya Nair",
    taskOwner: "Priya Nair",
    priority: "High",
    status: "Open",
    dueDate: "2025-08-08",
    createdDate: "2025-07-23",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-049",
    name: "GBP photo update — Prestige Law Group",
    description: "Upload new office photos and team headshots to GBP listing.",
    client: "Prestige Law Group",
    clientSlug: "prestige-law-group",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "GBP",
    relatedModule: "GBP",
    assignedUser: "Daniel Okonkwo",
    taskOwner: "Daniel Okonkwo",
    priority: "Low",
    status: "Completed",
    dueDate: "2025-07-20",
    createdDate: "2025-07-15",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-050",
    name: "LSA review response — Maple Ridge Clinic",
    description: "Respond to 14 new Google reviews on LSA profile.",
    client: "Maple Ridge Clinic",
    clientSlug: "maple-ridge-clinic",
    clientStatus: "Onboarding",
    workflowStatus: "Active",
    department: "LSA",
    relatedModule: "LSA",
    assignedUser: "Daniel Okonkwo",
    taskOwner: "Daniel Okonkwo",
    priority: "Low",
    status: "In Progress",
    dueDate: "2025-07-28",
    createdDate: "2025-07-22",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-051",
    name: "Cancellation save attempt — BlueSky Roofing",
    description: "Make final retention offer before processing cancellation request.",
    client: "BlueSky Roofing",
    clientSlug: "bluesky-roofing",
    clientStatus: "At Risk",
    workflowStatus: "Cancellation Requested",
    department: "Sales",
    relatedModule: "Cancellations",
    assignedUser: "Marcus Webb",
    taskOwner: "Marcus Webb",
    priority: "Urgent",
    status: "In Progress",
    dueDate: "2025-07-26",
    createdDate: "2025-07-24",
    sourceWorkflow: "Cancellation Workflow",
    triggerEvent: "Cancellation Requested",
    dependencies: [],
    comments: [],
  },
  {
    id: "gt-052",
    name: "PPC reporting — Lakeview Orthodontics",
    description: "Build July PPC performance report showing leads and cost per conversion.",
    client: "Lakeview Orthodontics",
    clientSlug: "lakeview-orthodontics",
    clientStatus: "Active",
    workflowStatus: "Active",
    department: "PPC",
    relatedModule: "Reporting",
    assignedUser: "Ryan Torres",
    taskOwner: "Ryan Torres",
    priority: "Medium",
    status: "Open",
    dueDate: "2025-07-31",
    createdDate: "2025-07-23",
    dependencies: [],
    comments: [],
  },
];

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const ALL_STATUSES: TaskStatus[] = ["Open", "In Progress", "Waiting", "Blocked", "Review", "Completed", "Cancelled"];
const ALL_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];
const ALL_DEPARTMENTS: Department[] = ["Sales", "Billing", "Account Management", "SEO", "PPC", "Meta Ads", "GBP", "LSA", "Reporting", "Operations", "Admin"];
const ALL_MODULES: RelatedModule[] = ["Sales", "Billing", "Activation", "Account Management", "Workflow", "SEO", "PPC", "Meta Ads", "GBP", "LSA", "Reporting", "Renewals", "Cancellations", "Offboarding", "Operations", "Admin"];

const STATUS_CFG: Record<TaskStatus, { bg: string; color: string; border: string; dot: string }> = {
  "Open":        { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6" },
  "In Progress": { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A", dot: "#EAB308" },
  "Waiting":     { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", dot: "#94A3B8" },
  "Blocked":     { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444" },
  "Review":      { bg: "#FAF5FF", color: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6" },
  "Completed":   { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981" },
  "Cancelled":   { bg: "#F8FAFC", color: "#9AAABB", border: "#E4E8F0", dot: "#CBD5E1" },
};

const PRIORITY_CFG: Record<TaskPriority, { bg: string; color: string; border: string; icon: string }> = {
  "Low":    { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", icon: "↓" },
  "Medium": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", icon: "→" },
  "High":   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", icon: "↑" },
  "Urgent": { bg: "#FAF5FF", color: "#7C3AED", border: "#DDD6FE", icon: "⚡" },
};

const CLIENT_STATUS_CFG: Record<string, { bg: string; color: string }> = {
  "Active":     { bg: "#ECFDF5", color: "#059669" },
  "Onboarding": { bg: "#EFF6FF", color: "#1D4ED8" },
  "At Risk":    { bg: "#FFFBEB", color: "#D97706" },
  "Churned":    { bg: "#FEF2F2", color: "#DC2626" },
};

// ─────────────────────────────────────────────
// SMALL BADGES
// ─────────────────────────────────────────────

function StatusBadge({ status }: { status: TaskStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const c = PRIORITY_CFG[priority];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
    >
      <span>{c.icon}</span>
      {priority}
    </span>
  );
}

function ClientStatusBadge({ status }: { status: string }) {
  const c = CLIENT_STATUS_CFG[status] ?? { bg: "#F8FAFC", color: "#64748B" };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}

function Avatar({ name, color }: { name: string; color?: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#1B4FD8", "#059669", "#7C3AED", "#D97706", "#DC2626", "#0891B2", "#BE185D", "#065F46"];
  const bg = color ?? colors[name.charCodeAt(0) % colors.length];
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold flex-shrink-0" style={{ background: bg }}>
      {initials}
    </span>
  );
}

// ─────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon }: { label: string; value: number | string; sub?: string; color: string; icon: string }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// TASK DETAIL DRAWER
// ─────────────────────────────────────────────

function TaskDetailDrawer({ task, onClose }: { task: GlobalTask; onClose: () => void }) {
  const [commentText, setCommentText] = useState("");
  const [subtaskText, setSubtaskText] = useState("");
  const [activeSection, setActiveSection] = useState<"details" | "comments" | "dependencies">("details");

  const sections = [
    { id: "details" as const, label: "Details" },
    { id: "comments" as const, label: `Comments (${task.comments.length})` },
    { id: "dependencies" as const, label: `Dependencies (${task.dependencies.length})` },
  ];

  const dep_blocked_by = task.dependencies.filter(d => d.direction === "blocked-by");
  const dep_blocking = task.dependencies.filter(d => d.direction === "blocking");

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="w-full max-w-2xl bg-white flex flex-col shadow-2xl overflow-hidden" style={{ borderLeft: "1px solid var(--rtm-border)" }}>
        {/* Header */}
        <div className="flex items-start justify-between p-5" style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-blue-xlight)" }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>{task.id}</span>
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
            <h2 className="text-lg font-extrabold leading-snug" style={{ color: "var(--rtm-text-primary)" }}>{task.name}</h2>
            <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>{task.description}</p>
          </div>
          <button onClick={onClose} className="ml-4 p-1.5 rounded-lg hover:bg-black/5 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className="px-5 py-3 text-sm font-semibold transition-colors"
              style={{
                color: activeSection === s.id ? "var(--rtm-blue)" : "var(--rtm-text-secondary)",
                borderBottom: activeSection === s.id ? "2px solid var(--rtm-blue)" : "2px solid transparent",
                background: "transparent",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* ── DETAILS ── */}
          {activeSection === "details" && (
            <div className="flex flex-col gap-5">
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Client", value: task.client, link: task.clientSlug ? `/clients/${task.clientSlug}` : undefined },
                  { label: "Client Status", value: <ClientStatusBadge status={task.clientStatus} /> },
                  { label: "Department", value: task.department },
                  { label: "Related Module", value: task.relatedModule },
                  { label: "Assigned User", value: (
                    <span className="flex items-center gap-2"><Avatar name={task.assignedUser} /><span>{task.assignedUser}</span></span>
                  )},
                  { label: "Task Owner", value: (
                    <span className="flex items-center gap-2"><Avatar name={task.taskOwner} /><span>{task.taskOwner}</span></span>
                  )},
                  { label: "Due Date", value: task.dueDate },
                  { label: "Created Date", value: task.createdDate },
                  { label: "Workflow Status", value: task.workflowStatus },
                  { label: "Linked Workflow", value: task.linkedWorkflow ? (
                    <Link href={task.linkedWorkflow} className="text-blue-600 underline text-xs">{task.linkedWorkflow}</Link>
                  ) : "—" },
                  { label: "Source Workflow", value: task.sourceWorkflow ?? "—" },
                  { label: "Trigger Event", value: task.triggerEvent ?? "—" },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</div>
                    <div className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                      {item.link ? <Link href={item.link} className="text-blue-600 hover:underline">{String(item.value)}</Link> : item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {task.notes && (
                <div className="rounded-lg p-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#D97706" }}>Notes</div>
                  <p className="text-sm" style={{ color: "var(--rtm-text-primary)" }}>{task.notes}</p>
                </div>
              )}

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                {["Update Status", "Assign User", "Mark Complete", "Escalate"].map(a => (
                  <button key={a} className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:opacity-80"
                    style={{ background: "var(--rtm-blue)", color: "#fff", border: "none" }}>
                    {a}
                  </button>
                ))}
              </div>

              {/* Create subtask */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Create Subtask</div>
                <div className="flex gap-2">
                  <input
                    value={subtaskText}
                    onChange={e => setSubtaskText(e.target.value)}
                    placeholder="Subtask name..."
                    className="flex-1 rounded-lg px-3 py-2 text-sm border outline-none"
                    style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                  />
                  <button className="px-3 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--rtm-blue)" }}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── COMMENTS ── */}
          {activeSection === "comments" && (
            <div className="flex flex-col gap-4">
              {task.comments.length === 0 && (
                <div className="text-center py-10 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No comments yet.</div>
              )}
              {task.comments.map(c => (
                <div key={c.id} className="rounded-xl p-4" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={c.author} />
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{c.author}</div>
                      <div className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{c.department} · {c.date}</div>
                    </div>
                    <div className="ml-auto flex gap-1">
                      <button className="text-xs px-2 py-0.5 rounded border text-gray-500 hover:bg-gray-50">Edit</button>
                      <button className="text-xs px-2 py-0.5 rounded border text-red-400 hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: "var(--rtm-text-primary)" }}>{c.body}</p>
                </div>
              ))}

              {/* Add comment */}
              <div className="rounded-xl p-4" style={{ border: "1px solid var(--rtm-border)" }}>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Add Comment</div>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows={3}
                  placeholder="Write a comment..."
                  className="w-full rounded-lg px-3 py-2 text-sm border outline-none resize-none"
                  style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                />
                <div className="flex justify-end mt-2">
                  <button className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--rtm-blue)" }}>
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── DEPENDENCIES ── */}
          {activeSection === "dependencies" && (
            <div className="flex flex-col gap-5">
              {task.dependencies.length === 0 && (
                <div className="text-center py-10 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No dependencies defined.</div>
              )}

              {dep_blocked_by.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>Blocked By</span>
                  </div>
                  {dep_blocked_by.map(d => (
                    <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg mb-2" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{d.taskName}</div>
                        <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{d.type}</div>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              )}

              {dep_blocking.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B" }} />
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>Blocking</span>
                  </div>
                  {dep_blocking.map(d => (
                    <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg mb-2" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{d.taskName}</div>
                        <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{d.type}</div>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              )}

              {/* All dependency types legend */}
              <div className="rounded-xl p-4" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
                <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-secondary)" }}>Dependency Types</div>
                <div className="flex flex-col gap-2">
                  {[
                    { type: "Finish-To-Start", desc: "Task B cannot start until Task A finishes" },
                    { type: "Start-To-Start", desc: "Task B cannot start until Task A starts" },
                    { type: "Finish-To-Finish", desc: "Task B cannot finish until Task A finishes" },
                  ].map(dt => (
                    <div key={dt.type} className="flex items-start gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>{dt.type}</span>
                      <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{dt.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create dependency */}
              <div className="rounded-xl p-4" style={{ border: "1px solid var(--rtm-border)" }}>
                <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-secondary)" }}>Create Dependency</div>
                <div className="flex flex-col gap-2">
                  <select className="rounded-lg px-3 py-2 text-sm border" style={{ borderColor: "var(--rtm-border)" }}>
                    <option>Select task...</option>
                    {GLOBAL_TASKS.filter(t => t.id !== task.id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <select className="rounded-lg px-3 py-2 text-sm border" style={{ borderColor: "var(--rtm-border)" }}>
                    {["Finish-To-Start", "Start-To-Start", "Finish-To-Finish"].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <button className="px-4 py-2 rounded-lg text-xs font-semibold text-white w-full" style={{ background: "var(--rtm-blue)" }}>
                    Create Dependency
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CREATE TASK MODAL
// ─────────────────────────────────────────────

function CreateTaskModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl bg-white overflow-hidden">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-blue-xlight)" }}>
          <h3 className="text-lg font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>Create New Task</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "Task Name *", placeholder: "Enter task name", type: "text" },
              { label: "Description", placeholder: "Describe the task...", type: "textarea" },
              { label: "Notes", placeholder: "Additional notes...", type: "textarea" },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea rows={3} placeholder={f.placeholder} className="w-full rounded-lg px-3 py-2 text-sm border outline-none resize-none" style={{ borderColor: "var(--rtm-border)" }} />
                ) : (
                  <input type="text" placeholder={f.placeholder} className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)" }} />
                )}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Client</label>
                <input type="text" placeholder="Client name" className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)" }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Department</label>
                <select className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)" }}>
                  <option value="">Select...</option>
                  {ALL_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Related Module</label>
                <select className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)" }}>
                  <option value="">Select...</option>
                  {ALL_MODULES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Assigned User</label>
                <input type="text" placeholder="Assign to..." className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)" }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Priority</label>
                <select className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)" }}>
                  {ALL_PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Status</label>
                <select className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)" }}>
                  {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Due Date</label>
                <input type="date" className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)" }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Dependencies</label>
                <select className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)" }}>
                  <option value="">None</option>
                  {GLOBAL_TASKS.map(t => <option key={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5" style={{ borderTop: "1px solid var(--rtm-border)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
            Save Draft
          </button>
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--rtm-blue)" }}>
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ASSIGN MODAL
// ─────────────────────────────────────────────

function AssignModal({ task, onClose }: { task: GlobalTask; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white overflow-hidden">
        <div className="p-5" style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-blue-xlight)" }}>
          <h3 className="text-base font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>Assign Task</h3>
          <p className="text-sm mt-0.5 truncate" style={{ color: "var(--rtm-text-secondary)" }}>{task.name}</p>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Current Assignee</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
              <Avatar name={task.assignedUser} />
              <span className="text-sm font-medium">{task.assignedUser}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>New Assignee</label>
            <input type="text" placeholder="Search team member..." className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)" }} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Notes</label>
            <textarea rows={2} placeholder="Assignment notes..." className="w-full rounded-lg px-3 py-2 text-sm border outline-none resize-none" style={{ borderColor: "var(--rtm-border)" }} />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5" style={{ borderTop: "1px solid var(--rtm-border)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border font-semibold" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Cancel</button>
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--rtm-blue)" }}>Assign Task</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STATUS UPDATE MODAL
// ─────────────────────────────────────────────

function StatusUpdateModal({ task, onClose }: { task: GlobalTask; onClose: () => void }) {
  const [newStatus, setNewStatus] = useState<TaskStatus>(task.status);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white overflow-hidden">
        <div className="p-5" style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-blue-xlight)" }}>
          <h3 className="text-base font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>Update Status</h3>
          <p className="text-sm mt-0.5 truncate" style={{ color: "var(--rtm-text-secondary)" }}>{task.name}</p>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Current Status</label>
            <div className="px-3 py-2 rounded-lg" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
              <StatusBadge status={task.status} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-secondary)" }}>New Status</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-left transition-all"
                  style={{
                    border: newStatus === s ? `2px solid ${STATUS_CFG[s].color}` : "1px solid var(--rtm-border)",
                    background: newStatus === s ? STATUS_CFG[s].bg : "var(--rtm-surface)",
                    color: newStatus === s ? STATUS_CFG[s].color : "var(--rtm-text-secondary)",
                  }}
                >
                  <StatusBadge status={s} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Completion Notes</label>
            <textarea rows={3} placeholder="Add notes about this status change..." className="w-full rounded-lg px-3 py-2 text-sm border outline-none resize-none" style={{ borderColor: "var(--rtm-border)" }} />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5" style={{ borderTop: "1px solid var(--rtm-border)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border font-semibold" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Cancel</button>
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--rtm-blue)" }}>Update Status</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROW ACTIONS DROPDOWN
// ─────────────────────────────────────────────

function RowActions({ task, onView, onAssign, onStatus }: {
  task: GlobalTask;
  onView: () => void;
  onAssign: () => void;
  onStatus: () => void;
}) {
  const [open, setOpen] = useState(false);
  const actions = [
    { label: "View Task", icon: "👁", action: () => { onView(); setOpen(false); } },
    { label: "Edit Task", icon: "✏️", action: () => { setOpen(false); } },
    { label: "Assign User", icon: "👤", action: () => { onAssign(); setOpen(false); } },
    { label: "Update Status", icon: "🔄", action: () => { onStatus(); setOpen(false); } },
    { label: "Add Comment", icon: "💬", action: () => { onView(); setOpen(false); } },
    { label: "Create Dependency", icon: "🔗", action: () => { setOpen(false); } },
    { label: "Mark Complete", icon: "✅", action: () => { setOpen(false); } },
    { label: "Escalate", icon: "⬆️", action: () => { setOpen(false); } },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-48 rounded-xl shadow-xl bg-white py-1.5 overflow-hidden" style={{ border: "1px solid var(--rtm-border)" }}>
            {actions.map(a => (
              <button
                key={a.label}
                onClick={a.action}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                <span className="text-base leading-none">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function TaskManagementPage() {
  const [view, setView] = useState<ViewMode>("queue");
  const [selectedTask, setSelectedTask] = useState<GlobalTask | null>(null);
  const [drawerMode, setDrawerMode] = useState<"view" | "assign" | "status">("view");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "All">("All");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "All">("All");
  const [filterDepartment, setFilterDepartment] = useState<Department | "All">("All");
  const [filterModule, setFilterModule] = useState<RelatedModule | "All">("All");

  const filteredTasks = useMemo(() => {
    return GLOBAL_TASKS.filter(t => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
          !t.client.toLowerCase().includes(search.toLowerCase()) &&
          !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus !== "All" && t.status !== filterStatus) return false;
      if (filterPriority !== "All" && t.priority !== filterPriority) return false;
      if (filterDepartment !== "All" && t.department !== filterDepartment) return false;
      if (filterModule !== "All" && t.relatedModule !== filterModule) return false;
      return true;
    });
  }, [search, filterStatus, filterPriority, filterDepartment, filterModule]);

  // KPIs
  const today = new Date().toISOString().split("T")[0];
  const kpis = useMemo(() => ({
    totalOpen: GLOBAL_TASKS.filter(t => t.status !== "Completed" && t.status !== "Cancelled").length,
    dueToday: GLOBAL_TASKS.filter(t => t.dueDate === today && t.status !== "Completed" && t.status !== "Cancelled").length,
    overdue: GLOBAL_TASKS.filter(t => t.dueDate < today && t.status !== "Completed" && t.status !== "Cancelled").length,
    completedWeek: GLOBAL_TASKS.filter(t => t.status === "Completed").length,
    blocked: GLOBAL_TASKS.filter(t => t.status === "Blocked").length,
    highPriority: GLOBAL_TASKS.filter(t => (t.priority === "High" || t.priority === "Urgent") && t.status !== "Completed" && t.status !== "Cancelled").length,
    createdMonth: GLOBAL_TASKS.length,
    waiting: GLOBAL_TASKS.filter(t => t.status === "Waiting").length,
  }), [today]);

  function openDrawer(task: GlobalTask, mode: "view" | "assign" | "status" = "view") {
    setSelectedTask(task);
    setDrawerMode(mode);
  }

  // Workload
  const workload = useMemo(() => {
    const map: Record<string, { open: number; completed: number; overdue: number; blocked: number }> = {};
    ALL_DEPARTMENTS.forEach(d => { map[d] = { open: 0, completed: 0, overdue: 0, blocked: 0 }; });
    GLOBAL_TASKS.forEach(t => {
      if (!map[t.department]) return;
      if (t.status === "Completed") map[t.department].completed++;
      else if (t.status === "Blocked") map[t.department].blocked++;
      else if (t.dueDate < today && t.status !== "Cancelled") map[t.department].overdue++;
      else if (t.status !== "Cancelled") map[t.department].open++;
    });
    return map;
  }, [today]);

  // Calendar buckets
  const calendarBuckets = useMemo(() => {
    const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(); monthEnd.setDate(monthEnd.getDate() + 30);
    const activeTasks = GLOBAL_TASKS.filter(t => t.status !== "Completed" && t.status !== "Cancelled");
    return {
      today: activeTasks.filter(t => t.dueDate === today),
      week: activeTasks.filter(t => t.dueDate > today && t.dueDate <= weekEnd.toISOString().split("T")[0]),
      month: activeTasks.filter(t => t.dueDate > weekEnd.toISOString().split("T")[0] && t.dueDate <= monthEnd.toISOString().split("T")[0]),
      overdue: activeTasks.filter(t => t.dueDate < today),
    };
  }, [today]);

  const VIEWS = [
    { id: "queue" as ViewMode, label: "Task Queue", icon: "≡" },
    { id: "workload" as ViewMode, label: "Workload", icon: "⊞" },
    { id: "calendar" as ViewMode, label: "Calendar", icon: "📅" },
    { id: "templates" as ViewMode, label: "Templates", icon: "⊟" },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>
      {/* ── PAGE HEADER ── */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">⚡</span>
                <h1 className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>Task Management Engine</h1>
              </div>
              <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                Centralized operational task management for Sales, Billing, Account Management, Operations, Service Delivery, Renewals, and Offboarding.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90" style={{ background: "var(--rtm-blue)" }}>
                <span>+</span> New Task
              </button>
              {[
                { label: "Bulk Assign", icon: "👥" },
                { label: "Export Tasks", icon: "⬇️" },
                { label: "Import Tasks", icon: "⬆️" },
              ].map(a => (
                <button key={a.label} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
                  <span>{a.icon}</span> {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* View tabs */}
          <div className="flex gap-1 mt-5">
            {VIEWS.map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold transition-all"
                style={{
                  color: view === v.id ? "var(--rtm-blue)" : "var(--rtm-text-secondary)",
                  background: view === v.id ? "var(--rtm-blue-xlight)" : "transparent",
                  borderBottom: view === v.id ? "2px solid var(--rtm-blue)" : "2px solid transparent",
                }}
              >
                <span>{v.icon}</span> {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 px-6 py-5 max-w-[1600px] mx-auto w-full">

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          <KpiCard label="Total Open" value={kpis.totalOpen} icon="📋" color="var(--rtm-blue)" sub="Active tasks" />
          <KpiCard label="Due Today" value={kpis.dueToday} icon="📅" color="#D97706" sub="Needs attention" />
          <KpiCard label="Overdue" value={kpis.overdue} icon="🚨" color="#DC2626" sub="Past due date" />
          <KpiCard label="Completed This Week" value={kpis.completedWeek} icon="✅" color="#059669" sub="Closed out" />
          <KpiCard label="Blocked" value={kpis.blocked} icon="🚫" color="#DC2626" sub="Needs unblocking" />
          <KpiCard label="High Priority" value={kpis.highPriority} icon="⚡" color="#7C3AED" sub="High + Urgent" />
          <KpiCard label="Waiting" value={kpis.waiting} icon="⏳" color="#64748B" sub="Awaiting action" />
          <KpiCard label="Created This Month" value={kpis.createdMonth} icon="📊" color="var(--rtm-blue)" sub="Total in system" />
        </div>

        {/* ── TASK QUEUE VIEW ── */}
        {view === "queue" && (
          <div className="flex flex-col gap-4">
            {/* Filters bar */}
            <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--rtm-text-muted)" }}>
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search tasks, clients..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
                  />
                </div>
              </div>
              {[
                { label: "Status", value: filterStatus, set: (v: string) => setFilterStatus(v as TaskStatus | "All"), options: ["All", ...ALL_STATUSES] },
                { label: "Priority", value: filterPriority, set: (v: string) => setFilterPriority(v as TaskPriority | "All"), options: ["All", ...ALL_PRIORITIES] },
                { label: "Department", value: filterDepartment, set: (v: string) => setFilterDepartment(v as Department | "All"), options: ["All", ...ALL_DEPARTMENTS] },
                { label: "Module", value: filterModule, set: (v: string) => setFilterModule(v as RelatedModule | "All"), options: ["All", ...ALL_MODULES] },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-1.5">
                  <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>{f.label}:</span>
                  <select
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    className="rounded-lg px-2 py-1.5 text-xs border outline-none font-medium"
                    style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}
                  >
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>
                {filteredTasks.length} of {GLOBAL_TASKS.length} tasks
              </span>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                      {["Task Name", "Client", "Department", "Module", "Assigned", "Owner", "Priority", "Status", "Due Date", "Deps", "Actions"].map(col => (
                        <th key={col} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--rtm-text-secondary)" }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task, i) => (
                      <tr
                        key={task.id}
                        className="group transition-colors hover:bg-blue-50/40"
                        style={{ borderBottom: i < filteredTasks.length - 1 ? "1px solid var(--rtm-border-light)" : "none" }}
                      >
                        <td className="px-4 py-3 max-w-[220px]">
                          <div>
                            <button
                              onClick={() => openDrawer(task)}
                              className="font-semibold text-left hover:underline leading-snug"
                              style={{ color: "var(--rtm-blue)" }}
                            >
                              {task.name}
                            </button>
                            {task.sourceWorkflow && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#EBF0FD", color: "var(--rtm-blue)" }}>
                                  ⚡ {task.triggerEvent}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            {task.clientSlug ? (
                              <Link href={`/clients/${task.clientSlug}`} className="font-medium hover:underline" style={{ color: "var(--rtm-text-primary)" }}>
                                {task.client}
                              </Link>
                            ) : (
                              <span className="font-medium" style={{ color: "var(--rtm-text-muted)" }}>{task.client}</span>
                            )}
                            {task.clientSlug && <div className="mt-0.5"><ClientStatusBadge status={task.clientStatus} /></div>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}>
                            {task.department}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium" style={{ color: "var(--rtm-text-secondary)" }}>{task.relatedModule}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Avatar name={task.assignedUser} />
                            <span className="text-xs font-medium whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>
                              {task.assignedUser.split(" ")[0]}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{task.taskOwner.split(" ")[0]}</span>
                        </td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${task.dueDate < today && task.status !== "Completed" && task.status !== "Cancelled" ? "text-red-600" : ""}`} style={{ color: task.dueDate < today && task.status !== "Completed" ? "#DC2626" : "var(--rtm-text-secondary)" }}>
                            {task.dueDate}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {task.dependencies.length > 0 ? (
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                              {task.dependencies.length} dep
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <RowActions
                            task={task}
                            onView={() => openDrawer(task, "view")}
                            onAssign={() => openDrawer(task, "assign")}
                            onStatus={() => openDrawer(task, "status")}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTasks.length === 0 && (
                  <div className="text-center py-16" style={{ color: "var(--rtm-text-muted)" }}>
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-sm font-medium">No tasks match your filters.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Workflow-Generated Task Banner */}
            <div className="rounded-xl p-5" style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚡</span>
                <h3 className="text-sm font-black" style={{ color: "var(--rtm-text-primary)" }}>Workflow-Generated Tasks</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "var(--rtm-blue)" }}>
                  {GLOBAL_TASKS.filter(t => t.sourceWorkflow).length} auto-created
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { trigger: "Proposal Approved", result: "Create Invoice Task", workflow: "Sales Pipeline", route: "/billing/invoices" },
                  { trigger: "Invoice Paid", result: "Assign AM Task", workflow: "Onboarding Workflow", route: "/account-management/onboarding" },
                  { trigger: "Assign AM", result: "Create Kickoff Task", workflow: "Onboarding Workflow", route: "/account-management/onboarding" },
                  { trigger: "Complete Kickoff", result: "Create Department Activation Tasks", workflow: "Onboarding Workflow", route: "/billing/activation" },
                  { trigger: "Renewal Due", result: "Create Renewal Tasks", workflow: "Renewal Workflow", route: "/renewals" },
                  { trigger: "Cancellation Approved", result: "Create Offboarding Tasks", workflow: "Offboarding Workflow", route: "/cancellations/offboarding" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white" style={{ border: "1px solid #BFDBFE" }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold" style={{ color: "var(--rtm-text-muted)" }}>TRIGGER</div>
                      <div className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.trigger}</div>
                      <div className="flex items-center gap-1 my-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--rtm-blue)" }}><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                        <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{item.result}</span>
                      </div>
                      <Link href={item.route} className="text-[10px] font-bold hover:underline" style={{ color: "var(--rtm-blue)" }}>
                        {item.workflow} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Integrations */}
            <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <h3 className="text-sm font-black mb-3" style={{ color: "var(--rtm-text-primary)" }}>🔗 Route Integrations</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Clients", href: "/clients" },
                  { label: "Workflows", href: "/admin/workflows" },
                  { label: "Invoices", href: "/billing/invoices" },
                  { label: "Activation", href: "/billing/activation" },
                  { label: "Onboarding", href: "/account-management/onboarding" },
                  { label: "Renewals", href: "/renewals" },
                  { label: "Cancellations", href: "/billing/cancellations" },
                  { label: "Offboarding", href: "/cancellations/offboarding" },
                ].map(r => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:opacity-80 transition-opacity"
                    style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)", borderColor: "#BFDBFE" }}
                  >
                    {r.label}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── WORKLOAD VIEW ── */}
        {view === "workload" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {ALL_DEPARTMENTS.map(dept => {
                const w = workload[dept];
                const total = w.open + w.completed + w.overdue + w.blocked;
                return (
                  <div key={dept} className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>{dept}</h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}>
                        {total} total
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Open", value: w.open, color: "#1D4ED8", bg: "#EFF6FF" },
                        { label: "Completed", value: w.completed, color: "#059669", bg: "#ECFDF5" },
                        { label: "Overdue", value: w.overdue, color: "#DC2626", bg: "#FEF2F2" },
                        { label: "Blocked", value: w.blocked, color: "#DC2626", bg: "#FEF2F2" },
                      ].map(m => (
                        <div key={m.label} className="rounded-lg p-3 text-center" style={{ background: m.bg }}>
                          <div className="text-2xl font-black" style={{ color: m.color }}>{m.value}</div>
                          <div className="text-[11px] font-semibold mt-0.5" style={{ color: m.color }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    {total > 0 && (
                      <div className="mt-4">
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                          {w.open > 0 && <div style={{ flex: w.open, background: "#3B82F6" }} />}
                          {w.completed > 0 && <div style={{ flex: w.completed, background: "#10B981" }} />}
                          {w.overdue > 0 && <div style={{ flex: w.overdue, background: "#EF4444" }} />}
                          {w.blocked > 0 && <div style={{ flex: w.blocked, background: "#F97316" }} />}
                        </div>
                        <div className="flex gap-3 mt-2 flex-wrap">
                          {[["Open", "#3B82F6"], ["Done", "#10B981"], ["Overdue", "#EF4444"], ["Blocked", "#F97316"]].map(([l, c]) => (
                            <span key={l} className="flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--rtm-text-muted)" }}>
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c }} />{l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CALENDAR VIEW ── */}
        {view === "calendar" && (
          <div className="flex flex-col gap-4">
            {[
              { label: "Overdue", tasks: calendarBuckets.overdue, icon: "🚨", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
              { label: "Due Today", tasks: calendarBuckets.today, icon: "📅", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
              { label: "Due This Week", tasks: calendarBuckets.week, icon: "📆", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
              { label: "Due This Month", tasks: calendarBuckets.month, icon: "🗓", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
            ].map(bucket => (
              <div key={bucket.label} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${bucket.border}` }}>
                <div className="flex items-center justify-between px-5 py-3" style={{ background: bucket.bg }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{bucket.icon}</span>
                    <h3 className="font-extrabold" style={{ color: bucket.color }}>{bucket.label}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: bucket.color }}>
                      {bucket.tasks.length}
                    </span>
                  </div>
                </div>
                {bucket.tasks.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm" style={{ color: "var(--rtm-text-muted)", background: "var(--rtm-surface)" }}>
                    No tasks in this bucket.
                  </div>
                ) : (
                  <div className="bg-white divide-y" style={{ borderTop: `1px solid ${bucket.border}` }}>
                    {bucket.tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <button onClick={() => openDrawer(task)} className="font-semibold text-left hover:underline text-sm" style={{ color: "var(--rtm-blue)" }}>
                            {task.name}
                          </button>
                          <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{task.client} · {task.department}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <PriorityBadge priority={task.priority} />
                          <StatusBadge status={task.status} />
                          <span className="text-xs font-semibold" style={{ color: task.dueDate < today ? "#DC2626" : "var(--rtm-text-muted)" }}>{task.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TEMPLATES VIEW ── */}
        {view === "templates" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>Task Templates</h2>
                <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Reusable task blueprints for common operational workflows.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Task Automation Rules</button>
                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--rtm-blue)" }}>+ New Template</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  title: "New Client Onboarding",
                  icon: "🚀",
                  color: "var(--rtm-blue)",
                  bg: "var(--rtm-blue-light)",
                  border: "#BFDBFE",
                  route: "/account-management/onboarding",
                  tasks: [
                    { name: "Assign Account Manager", dept: "Account Management" },
                    { name: "Schedule Kickoff Call", dept: "Account Management" },
                    { name: "Create Department Tasks", dept: "Operations" },
                    { name: "Launch Reporting Dashboard", dept: "Reporting" },
                  ],
                },
                {
                  title: "Department Activation",
                  icon: "⚙️",
                  color: "#7C3AED",
                  bg: "#FAF5FF",
                  border: "#DDD6FE",
                  route: "/billing/activation",
                  tasks: [
                    { name: "SEO Setup", dept: "SEO" },
                    { name: "GBP Setup", dept: "GBP" },
                    { name: "PPC Setup", dept: "PPC" },
                    { name: "Reporting Setup", dept: "Reporting" },
                  ],
                },
                {
                  title: "Renewal Process",
                  icon: "🔄",
                  color: "#059669",
                  bg: "#ECFDF5",
                  border: "#A7F3D0",
                  route: "/renewals",
                  tasks: [
                    { name: "Review Account Performance", dept: "Account Management" },
                    { name: "Prepare Renewal Proposal", dept: "Sales" },
                    { name: "Send Proposal to Client", dept: "Sales" },
                    { name: "Follow-Up & Close", dept: "Sales" },
                  ],
                },
                {
                  title: "Offboarding Process",
                  icon: "📦",
                  color: "#DC2626",
                  bg: "#FEF2F2",
                  border: "#FECACA",
                  route: "/cancellations/offboarding",
                  tasks: [
                    { name: "Billing Review", dept: "Billing" },
                    { name: "Department Shutdown", dept: "Operations" },
                    { name: "Access Removal", dept: "Operations" },
                    { name: "Deliver Final Report", dept: "Reporting" },
                  ],
                },
              ].map(template => (
                <div key={template.title} className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: `1px solid ${template.border}` }}>
                  <div className="px-5 py-4" style={{ background: template.bg }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{template.icon}</span>
                      <h3 className="font-extrabold text-sm" style={{ color: template.color }}>{template.title}</h3>
                    </div>
                    <Link href={template.route} className="text-[11px] font-semibold hover:underline" style={{ color: template.color }}>
                      {template.route} →
                    </Link>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Tasks ({template.tasks.length})</div>
                    <div className="flex flex-col gap-2">
                      {template.tasks.map((t, idx) => (
                        <div key={t.name} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ background: template.color }}>{idx + 1}</span>
                          <div className="flex-1">
                            <div className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{t.name}</div>
                            <div className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{t.dept}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 w-full px-3 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80" style={{ background: template.color }}>
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS & DRAWERS ── */}
      {selectedTask && drawerMode === "view" && (
        <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
      {selectedTask && drawerMode === "assign" && (
        <AssignModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
      {selectedTask && drawerMode === "status" && (
        <StatusUpdateModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
