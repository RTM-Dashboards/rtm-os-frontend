"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// 
// PROJECTS & DELIVERY ENGINE
// Route: /tasks   Label: Projects & Tasks
// Project-first delivery: Client → Project → Milestones → Task Lists → Tasks
// 

//  TYPES 

type ProjectStatus =
  | "Draft"| "Ready to Launch"| "Launched"| "In Progress"| "Blocked"| "Pending Client"| "Pending Department"| "Completed"| "Cancelled";

type MilestoneStatus = "Not Started"| "In Progress"| "Blocked"| "Completed";
type TaskListStatus = "Not Started"| "In Progress"| "Blocked"| "Completed";
type TaskStatus =
  | "Open"| "In Progress"| "Waiting"| "Blocked"| "Review"| "Completed"| "Cancelled";

type TaskType =
  | "One-Time"| "Recurring"| "Milestone"| "Approval"| "Review"| "Renewal"| "Offboarding";

type RecurringRule = "Weekly"| "Monthly"| "Quarterly"| "Annual"| "Custom";
type TaskPriority = "Low"| "Medium"| "High"| "Urgent";
type ProjectType =
  | "SEO Only"| "SEO + GBP"| "PPC + Landing Page"| "Full Service"| "Reporting Only"| "Website Build"| "AI Automation"| "Upsell"| "Renewal"| "Custom";

type DependencyType = "Finish-To-Start"| "Start-To-Start"| "Finish-To-Finish";
type BlockerType =
  | "Missing Client Access"| "Waiting on Client"| "Waiting on Billing"| "Waiting on AM"| "Waiting on Department"| "Dependency Not Completed"| "Approval Needed"| "Integration Issue";

type VisibilityRole =
  | "Account Manager"| "Department Head"| "Department Specialist"| "Executive";

type DeptName =
  | "SEO"| "GBP"| "PPC"| "Meta Ads"| "LSA"| "Reporting"| "Web Development"| "Creative"| "AI Automation"| "Account Management";

interface DeliveryStandard {
  lineItem: string;
  firstResponseStandard: string;
  targetCompletionDays: number;
  clientUpdateFrequency: string;
  escalationRule: string;
}

interface Blocker {
  id: string;
  type: BlockerType;
  description: string;
  addedDate: string;
  owner: string;
  resolved: boolean;
  escalated: boolean;
}

interface TaskDependency {
  id: string;
  taskId: string;
  taskName: string;
  type: DependencyType;
  direction: "blocked-by"| "blocking";
  status: TaskStatus;
}

interface ProjectTask {
  id: string;
  name: string;
  type: TaskType;
  primaryAssignee: string;
  secondaryAssignee?: string;
  reviewer?: string;
  approver?: string;
  watchers: string[];
  priority: TaskPriority;
  status: TaskStatus;
  firstResponseTimestamp?: string;
  dueDate: string;
  completionDate?: string;
  dependencies: TaskDependency[];
  recurringRule?: RecurringRule;
  notes?: string;
}

interface TaskList {
  id: string;
  name: string;
  sourceLineItem: string;
  department: DeptName;
  tasks: ProjectTask[];
  dueDate: string;
  status: TaskListStatus;
  owner: string;
}

interface Milestone {
  id: string;
  name: string;
  owner: string;
  status: MilestoneStatus;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  progress: number;
  blockedReason?: string;
  taskListIds: string[];
}

interface DepartmentSection {
  department: DeptName;
  taskListIds: string[];
  owner: string;
  delayReason?: string;
  escalationStatus: "None"| "Escalated"| "Critical";
}

interface ExecutiveSummary {
  projectHealth: "Green"| "Yellow"| "Red";
  launchRisk: "Low"| "Medium"| "High";
  departmentsDelayed: number;
  criticalBlockers: number;
  nextRequiredAction: string;
  expectedCompletion: string;
  clientImpact: string;
  revenueImpact: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  clientSlug: string;
  projectType: ProjectType;
  accountManager: string;
  projectOwner: string;
  lineItemsSold: string[];
  departmentsInvolved: DeptName[];
  milestones: Milestone[];
  taskLists: TaskList[];
  deliveryStandards: DeliveryStandard[];
  blockers: Blocker[];
  departments: DepartmentSection[];
  executiveSummary: ExecutiveSummary;
  targetLaunchDate: string;
  completionDate?: string;
  status: ProjectStatus;
  notes?: string;
  contractSummary: string;
}

//  MOCK DATA — 12 Projects 

const PROJECTS: Project[] = [
  // 1. SEO-Only Project
  {
    id: "proj-001",
    name: "Horizon Dental — SEO Launch",
    client: "Horizon Dental",
    clientSlug: "horizon-dental",
    projectType: "SEO Only",
    accountManager: "Priya Nair",
    projectOwner: "Aaron Park",
    lineItemsSold: ["SEO Management", "Technical SEO Audit", "Monthly Reporting"],
    departmentsInvolved: ["SEO", "Reporting", "Account Management"],
    contractSummary: "12-month SEO retainer. $1,800/mo. Signed 2025-07-15.",
    targetLaunchDate: "2025-08-15",
    status: "In Progress",
    notes: "Client is a dental group with 3 locations. Focus on local SEO.",
    milestones: [
      { id: "ms-001-1", name: "Onboarding", owner: "Priya Nair", status: "Completed", startDate: "2025-07-15", dueDate: "2025-07-22", completionDate: "2025-07-21", progress: 100, taskListIds: ["tl-001-1"] },
      { id: "ms-001-2", name: "Technical Setup", owner: "Aaron Park", status: "In Progress", startDate: "2025-07-22", dueDate: "2025-08-05", progress: 60, taskListIds: ["tl-001-2"] },
      { id: "ms-001-3", name: "Reporting Setup", owner: "Lily Chen", status: "Not Started", startDate: "2025-08-05", dueDate: "2025-08-12", progress: 0, taskListIds: ["tl-001-3"] },
      { id: "ms-001-4", name: "Project Completion", owner: "Priya Nair", status: "Not Started", startDate: "2025-08-12", dueDate: "2025-08-15", progress: 0, taskListIds: [] },
    ],
    taskLists: [
      {
        id: "tl-001-1", name: "Onboarding Task List", sourceLineItem: "SEO Management", department: "Account Management",
        dueDate: "2025-07-22", status: "Completed", owner: "Priya Nair",
        tasks: [
          { id: "t-001-1-1", name: "Assign Account Manager", type: "One-Time", primaryAssignee: "Priya Nair", watchers: ["Marcus Webb"], priority: "Urgent", status: "Completed", dueDate: "2025-07-16", completionDate: "2025-07-16", dependencies: [] },
          { id: "t-001-1-2", name: "Schedule Kickoff Call", type: "One-Time", primaryAssignee: "Priya Nair", watchers: [], priority: "High", status: "Completed", dueDate: "2025-07-18", completionDate: "2025-07-17", dependencies: [] },
          { id: "t-001-1-3", name: "Send Welcome Package", type: "One-Time", primaryAssignee: "Priya Nair", watchers: [], priority: "Medium", status: "Completed", dueDate: "2025-07-20", completionDate: "2025-07-19", dependencies: [] },
        ],
      },
      {
        id: "tl-001-2", name: "SEO Setup Task List", sourceLineItem: "SEO Management", department: "SEO",
        dueDate: "2025-08-05", status: "In Progress", owner: "Aaron Park",
        tasks: [
          { id: "t-001-2-1", name: "Technical SEO Audit", type: "One-Time", primaryAssignee: "Aaron Park", reviewer: "Marcus Webb", watchers: [], priority: "High", status: "In Progress", dueDate: "2025-07-28", dependencies: [] },
          { id: "t-001-2-2", name: "Keyword Strategy", type: "One-Time", primaryAssignee: "Aaron Park", watchers: [], priority: "High", status: "Open", dueDate: "2025-07-31", dependencies: [{ id: "dep-a1", taskId: "t-001-2-1", taskName: "Technical SEO Audit", type: "Finish-To-Start", direction: "blocked-by", status: "In Progress"}] },
          { id: "t-001-2-3", name: "On-Page Optimization", type: "One-Time", primaryAssignee: "Aaron Park", secondaryAssignee: "Lily Chen", watchers: [], priority: "Medium", status: "Open", dueDate: "2025-08-04", dependencies: [] },
          { id: "t-001-2-4", name: "Monthly SEO Report", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Aaron Park", reviewer: "Priya Nair", watchers: ["Marcus Webb"], priority: "Medium", status: "Open", dueDate: "2025-08-31", dependencies: [] },
        ],
      },
      {
        id: "tl-001-3", name: "Reporting Setup Task List", sourceLineItem: "Monthly Reporting", department: "Reporting",
        dueDate: "2025-08-12", status: "Not Started", owner: "Lily Chen",
        tasks: [
          { id: "t-001-3-1", name: "Connect GA4 & GSC", type: "One-Time", primaryAssignee: "Lily Chen", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-06", dependencies: [] },
          { id: "t-001-3-2", name: "Build AgencyAnalytics Dashboard", type: "One-Time", primaryAssignee: "Lily Chen", watchers: [], priority: "Medium", status: "Open", dueDate: "2025-08-10", dependencies: [] },
          { id: "t-001-3-3", name: "Monthly Reporting Delivery", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Lily Chen", approver: "Priya Nair", watchers: ["Aaron Park"], priority: "Medium", status: "Open", dueDate: "2025-08-31", dependencies: [] },
        ],
      },
    ],
    deliveryStandards: [
      { lineItem: "SEO Management", firstResponseStandard: "Within 4 business hours", targetCompletionDays: 30, clientUpdateFrequency: "Monthly", escalationRule: "Escalate to Department Head if delayed >5 days"},
      { lineItem: "Monthly Reporting", firstResponseStandard: "Within 2 business hours", targetCompletionDays: 5, clientUpdateFrequency: "Monthly", escalationRule: "Escalate if report not delivered by 5th of month"},
    ],
    blockers: [],
    departments: [
      { department: "SEO", taskListIds: ["tl-001-2"], owner: "Aaron Park", escalationStatus: "None"},
      { department: "Reporting", taskListIds: ["tl-001-3"], owner: "Lily Chen", escalationStatus: "None"},
      { department: "Account Management", taskListIds: ["tl-001-1"], owner: "Priya Nair", escalationStatus: "None"},
    ],
    executiveSummary: {
      projectHealth: "Green", launchRisk: "Low", departmentsDelayed: 0, criticalBlockers: 0,
      nextRequiredAction: "Complete Technical SEO Audit by Jul 28",
      expectedCompletion: "2025-08-15", clientImpact: "Low — on track", revenueImpact: "$1,800/mo recurring",
    },
  },

  // 2. SEO + GBP Project
  {
    id: "proj-002",
    name: "Maple Ridge Clinic — SEO + GBP",
    client: "Maple Ridge Clinic",
    clientSlug: "maple-ridge-clinic",
    projectType: "SEO + GBP",
    accountManager: "Daniel Okonkwo",
    projectOwner: "Aaron Park",
    lineItemsSold: ["SEO Management", "GBP Management", "Monthly Reporting"],
    departmentsInvolved: ["SEO", "GBP", "Reporting", "Account Management"],
    contractSummary: "12-month SEO + GBP retainer. $2,200/mo. Signed 2025-07-10.",
    targetLaunchDate: "2025-08-20",
    status: "Pending Client",
    notes: "Waiting on client to provide GA4 and GBP admin access.",
    milestones: [
      { id: "ms-002-1", name: "Onboarding", owner: "Daniel Okonkwo", status: "In Progress", startDate: "2025-07-10", dueDate: "2025-07-24", progress: 70, taskListIds: ["tl-002-1"] },
      { id: "ms-002-2", name: "Access Collection", owner: "Daniel Okonkwo", status: "Blocked", startDate: "2025-07-20", dueDate: "2025-07-28", progress: 10, blockedReason: "Client has not provided GA4 or GBP access", taskListIds: ["tl-002-2"] },
      { id: "ms-002-3", name: "SEO + GBP Launch", owner: "Aaron Park", status: "Not Started", startDate: "2025-07-29", dueDate: "2025-08-15", progress: 0, taskListIds: ["tl-002-3", "tl-002-4"] },
    ],
    taskLists: [
      {
        id: "tl-002-1", name: "Onboarding Task List", sourceLineItem: "SEO Management", department: "Account Management",
        dueDate: "2025-07-24", status: "In Progress", owner: "Daniel Okonkwo",
        tasks: [
          { id: "t-002-1-1", name: "Kickoff Call Completed", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "High", status: "Completed", dueDate: "2025-07-14", completionDate: "2025-07-14", dependencies: [] },
          { id: "t-002-1-2", name: "Send Access Request Form", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "Urgent", status: "Completed", dueDate: "2025-07-16", completionDate: "2025-07-16", dependencies: [] },
          { id: "t-002-1-3", name: "Follow Up on Access", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: ["Priya Nair"], priority: "Urgent", status: "In Progress", dueDate: "2025-07-24", dependencies: [] },
        ],
      },
      {
        id: "tl-002-2", name: "Access Collection Task List", sourceLineItem: "SEO Management", department: "Account Management",
        dueDate: "2025-07-28", status: "Blocked", owner: "Daniel Okonkwo",
        tasks: [
          { id: "t-002-2-1", name: "Collect GA4 Access", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "Urgent", status: "Blocked", dueDate: "2025-07-22", dependencies: [] },
          { id: "t-002-2-2", name: "Collect GBP Admin Access", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "Urgent", status: "Blocked", dueDate: "2025-07-22", dependencies: [] },
          { id: "t-002-2-3", name: "Collect Google Search Console", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "High", status: "Blocked", dueDate: "2025-07-24", dependencies: [] },
        ],
      },
      {
        id: "tl-002-3", name: "SEO Setup Task List", sourceLineItem: "SEO Management", department: "SEO",
        dueDate: "2025-08-10", status: "Not Started", owner: "Aaron Park",
        tasks: [
          { id: "t-002-3-1", name: "Competitor Analysis", type: "One-Time", primaryAssignee: "Aaron Park", watchers: [], priority: "Medium", status: "Open", dueDate: "2025-08-01", dependencies: [{ id: "dep-b1", taskId: "t-002-2-1", taskName: "Collect GA4 Access", type: "Finish-To-Start", direction: "blocked-by", status: "Blocked"}] },
          { id: "t-002-3-2", name: "Keyword Map", type: "One-Time", primaryAssignee: "Aaron Park", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-05", dependencies: [] },
          { id: "t-002-3-3", name: "Monthly SEO Report", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Aaron Park", watchers: [], priority: "Medium", status: "Open", dueDate: "2025-08-31", dependencies: [] },
        ],
      },
      {
        id: "tl-002-4", name: "GBP Launch Task List", sourceLineItem: "GBP Management", department: "GBP",
        dueDate: "2025-08-12", status: "Not Started", owner: "Daniel Okonkwo",
        tasks: [
          { id: "t-002-4-1", name: "GBP Profile Optimization", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-03", dependencies: [{ id: "dep-b2", taskId: "t-002-2-2", taskName: "Collect GBP Admin Access", type: "Finish-To-Start", direction: "blocked-by", status: "Blocked"}] },
          { id: "t-002-4-2", name: "GBP Photo Upload", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "Medium", status: "Open", dueDate: "2025-08-06", dependencies: [] },
          { id: "t-002-4-3", name: "Monthly GBP Review", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "Low", status: "Open", dueDate: "2025-08-31", dependencies: [] },
        ],
      },
    ],
    deliveryStandards: [
      { lineItem: "SEO Management", firstResponseStandard: "Within 4 business hours", targetCompletionDays: 30, clientUpdateFrequency: "Monthly", escalationRule: "Escalate to Department Head if delayed >5 days"},
      { lineItem: "GBP Management", firstResponseStandard: "Within 2 business hours", targetCompletionDays: 7, clientUpdateFrequency: "Monthly", escalationRule: "Escalate if GBP issue not resolved within 48 hours"},
    ],
    blockers: [
      { id: "blk-002-1", type: "Missing Client Access", description: "Client has not provided GA4, GSC, or GBP admin access despite 3 requests.", addedDate: "2025-07-18", owner: "Daniel Okonkwo", resolved: false, escalated: true },
    ],
    departments: [
      { department: "SEO", taskListIds: ["tl-002-3"], owner: "Aaron Park", delayReason: "Blocked on client access", escalationStatus: "Escalated"},
      { department: "GBP", taskListIds: ["tl-002-4"], owner: "Daniel Okonkwo", delayReason: "Blocked on client access", escalationStatus: "Escalated"},
      { department: "Account Management", taskListIds: ["tl-002-1", "tl-002-2"], owner: "Daniel Okonkwo", escalationStatus: "Escalated"},
    ],
    executiveSummary: {
      projectHealth: "Red", launchRisk: "High", departmentsDelayed: 2, criticalBlockers: 1,
      nextRequiredAction: "Escalate access collection to client decision-maker",
      expectedCompletion: "2025-08-20 (at risk)", clientImpact: "High — launch delayed", revenueImpact: "$2,200/mo at risk if client churns",
    },
  },

  // 3. PPC + Landing Page
  {
    id: "proj-003",
    name: "Summit Auto Group — PPC + Landing Page",
    client: "Summit Auto Group",
    clientSlug: "summit-auto-group",
    projectType: "PPC + Landing Page",
    accountManager: "Priya Nair",
    projectOwner: "Ryan Torres",
    lineItemsSold: ["Google Ads Management", "Landing Page Build", "Monthly Reporting"],
    departmentsInvolved: ["PPC", "Web Development", "Reporting", "Account Management"],
    contractSummary: "12-month PPC + web retainer. $3,500/mo. Signed 2025-06-01.",
    targetLaunchDate: "2025-07-10",
    completionDate: undefined,
    status: "In Progress",
    milestones: [
      { id: "ms-003-1", name: "Onboarding", owner: "Priya Nair", status: "Completed", startDate: "2025-06-01", dueDate: "2025-06-10", completionDate: "2025-06-09", progress: 100, taskListIds: [] },
      { id: "ms-003-2", name: "Landing Page Build", owner: "Dev Team", status: "Completed", startDate: "2025-06-10", dueDate: "2025-06-30", completionDate: "2025-06-28", progress: 100, taskListIds: ["tl-003-1"] },
      { id: "ms-003-3", name: "PPC Launch", owner: "Ryan Torres", status: "Completed", startDate: "2025-07-01", dueDate: "2025-07-10", completionDate: "2025-07-08", progress: 100, taskListIds: ["tl-003-2"] },
      { id: "ms-003-4", name: "Monthly Management", owner: "Ryan Torres", status: "In Progress", startDate: "2025-07-10", dueDate: "2025-12-31", progress: 30, taskListIds: ["tl-003-3"] },
    ],
    taskLists: [
      {
        id: "tl-003-1", name: "Landing Page Build Task List", sourceLineItem: "Landing Page Build", department: "Web Development",
        dueDate: "2025-06-30", status: "Completed", owner: "Dev Team",
        tasks: [
          { id: "t-003-1-1", name: "Landing Page Design", type: "One-Time", primaryAssignee: "Creative Team", reviewer: "Priya Nair", approver: "Client", watchers: [], priority: "High", status: "Completed", dueDate: "2025-06-20", completionDate: "2025-06-18", dependencies: [] },
          { id: "t-003-1-2", name: "Landing Page Development", type: "One-Time", primaryAssignee: "Dev Team", watchers: [], priority: "High", status: "Completed", dueDate: "2025-06-28", completionDate: "2025-06-27", dependencies: [] },
        ],
      },
      {
        id: "tl-003-2", name: "PPC Launch Task List", sourceLineItem: "Google Ads Management", department: "PPC",
        dueDate: "2025-07-10", status: "Completed", owner: "Ryan Torres",
        tasks: [
          { id: "t-003-2-1", name: "Campaign Structure Build", type: "One-Time", primaryAssignee: "Ryan Torres", watchers: [], priority: "High", status: "Completed", dueDate: "2025-07-05", completionDate: "2025-07-04", dependencies: [] },
          { id: "t-003-2-2", name: "Ad Copy Creation", type: "One-Time", primaryAssignee: "Ryan Torres", watchers: [], priority: "High", status: "Completed", dueDate: "2025-07-08", completionDate: "2025-07-07", dependencies: [] },
          { id: "t-003-2-3", name: "Conversion Tracking Setup", type: "One-Time", primaryAssignee: "Ryan Torres", watchers: [], priority: "High", status: "Completed", dueDate: "2025-07-09", completionDate: "2025-07-08", dependencies: [] },
        ],
      },
      {
        id: "tl-003-3", name: "Monthly PPC Management Task List", sourceLineItem: "Google Ads Management", department: "PPC",
        dueDate: "2025-12-31", status: "In Progress", owner: "Ryan Torres",
        tasks: [
          { id: "t-003-3-1", name: "Monthly PPC Optimization", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Ryan Torres", reviewer: "Priya Nair", watchers: [], priority: "High", status: "In Progress", dueDate: "2025-07-31", dependencies: [] },
          { id: "t-003-3-2", name: "PPC Monthly Report", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Lily Chen", watchers: [], priority: "Medium", status: "In Progress", dueDate: "2025-07-31", dependencies: [] },
          { id: "t-003-3-3", name: "Quarterly Strategy Review", type: "Recurring", recurringRule: "Quarterly", primaryAssignee: "Ryan Torres", approver: "Priya Nair", watchers: [], priority: "High", status: "Open", dueDate: "2025-09-30", dependencies: [] },
        ],
      },
    ],
    deliveryStandards: [
      { lineItem: "Google Ads Management", firstResponseStandard: "Within 2 business hours", targetCompletionDays: 3, clientUpdateFrequency: "Weekly", escalationRule: "Escalate if CPL exceeds 150% of target for 7+ days"},
      { lineItem: "Landing Page Build", firstResponseStandard: "Within 1 business day", targetCompletionDays: 21, clientUpdateFrequency: "Weekly during build", escalationRule: "Escalate if build delayed >3 days"},
    ],
    blockers: [],
    departments: [
      { department: "PPC", taskListIds: ["tl-003-2", "tl-003-3"], owner: "Ryan Torres", escalationStatus: "None"},
      { department: "Web Development", taskListIds: ["tl-003-1"], owner: "Dev Team", escalationStatus: "None"},
    ],
    executiveSummary: {
      projectHealth: "Green", launchRisk: "Low", departmentsDelayed: 0, criticalBlockers: 0,
      nextRequiredAction: "Complete monthly PPC optimization by Jul 31",
      expectedCompletion: "2025-12-31", clientImpact: "None — performing well", revenueImpact: "$3,500/mo recurring",
    },
  },

  // 4. Full-Service Project
  {
    id: "proj-004",
    name: "Prestige Law Group — Full Service",
    client: "Prestige Law Group",
    clientSlug: "prestige-law-group",
    projectType: "Full Service",
    accountManager: "Priya Nair",
    projectOwner: "Priya Nair",
    lineItemsSold: ["SEO Management", "Google Ads Management", "LSA Management", "GBP Management", "Meta Ads Management", "Monthly Reporting"],
    departmentsInvolved: ["SEO", "PPC", "LSA", "GBP", "Meta Ads", "Reporting", "Account Management"],
    contractSummary: "24-month full-service retainer. $6,800/mo. Signed 2024-08-01.",
    targetLaunchDate: "2024-09-01",
    completionDate: undefined,
    status: "In Progress",
    milestones: [
      { id: "ms-004-1", name: "Onboarding", owner: "Priya Nair", status: "Completed", startDate: "2024-08-01", dueDate: "2024-08-15", completionDate: "2024-08-14", progress: 100, taskListIds: [] },
      { id: "ms-004-2", name: "Department Launch", owner: "Priya Nair", status: "Completed", startDate: "2024-08-15", dueDate: "2024-09-01", completionDate: "2024-08-30", progress: 100, taskListIds: [] },
      { id: "ms-004-3", name: "Ongoing Management", owner: "Priya Nair", status: "In Progress", startDate: "2024-09-01", dueDate: "2026-08-01", progress: 40, taskListIds: ["tl-004-1", "tl-004-2", "tl-004-3", "tl-004-4"] },
      { id: "ms-004-4", name: "Renewal Review", owner: "Priya Nair", status: "In Progress", startDate: "2025-07-01", dueDate: "2025-08-01", progress: 50, taskListIds: [] },
    ],
    taskLists: [
      {
        id: "tl-004-1", name: "SEO Monthly Management", sourceLineItem: "SEO Management", department: "SEO",
        dueDate: "2025-07-31", status: "In Progress", owner: "Aaron Park",
        tasks: [
          { id: "t-004-1-1", name: "Monthly On-Page Optimization", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Aaron Park", watchers: [], priority: "High", status: "In Progress", dueDate: "2025-07-31", dependencies: [] },
          { id: "t-004-1-2", name: "Monthly Link Building", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Aaron Park", watchers: [], priority: "Medium", status: "Open", dueDate: "2025-07-31", dependencies: [] },
        ],
      },
      {
        id: "tl-004-2", name: "PPC Monthly Management", sourceLineItem: "Google Ads Management", department: "PPC",
        dueDate: "2025-07-31", status: "In Progress", owner: "Ryan Torres",
        tasks: [
          { id: "t-004-2-1", name: "Monthly PPC Optimization", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Ryan Torres", watchers: [], priority: "High", status: "In Progress", dueDate: "2025-07-31", dependencies: [] },
          { id: "t-004-2-2", name: "Budget Review", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Ryan Torres", watchers: [], priority: "Medium", status: "Open", dueDate: "2025-07-31", dependencies: [] },
          { id: "t-004-2-3", name: "Quarterly Strategy Review", type: "Recurring", recurringRule: "Quarterly", primaryAssignee: "Ryan Torres", approver: "Priya Nair", watchers: [], priority: "High", status: "Open", dueDate: "2025-09-30", dependencies: [] },
        ],
      },
      {
        id: "tl-004-3", name: "LSA Monthly Management", sourceLineItem: "LSA Management", department: "LSA",
        dueDate: "2025-07-31", status: "In Progress", owner: "Ryan Torres",
        tasks: [
          { id: "t-004-3-1", name: "Monthly LSA Optimization", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Ryan Torres", watchers: [], priority: "Medium", status: "In Progress", dueDate: "2025-07-31", dependencies: [] },
        ],
      },
      {
        id: "tl-004-4", name: "Meta Ads Monthly Management", sourceLineItem: "Meta Ads Management", department: "Meta Ads",
        dueDate: "2025-07-31", status: "In Progress", owner: "Lily Chen",
        tasks: [
          { id: "t-004-4-1", name: "Monthly Meta Ads Optimization", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Lily Chen", watchers: [], priority: "High", status: "In Progress", dueDate: "2025-07-31", dependencies: [] },
          { id: "t-004-4-2", name: "Monthly Meta Pixel Audit", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Lily Chen", watchers: [], priority: "Medium", status: "Review", dueDate: "2025-07-25", dependencies: [] },
        ],
      },
    ],
    deliveryStandards: [
      { lineItem: "SEO Management", firstResponseStandard: "Within 4 business hours", targetCompletionDays: 30, clientUpdateFrequency: "Monthly", escalationRule: "Escalate if ranking drops >10 positions in 30 days"},
      { lineItem: "Google Ads Management", firstResponseStandard: "Within 2 business hours", targetCompletionDays: 3, clientUpdateFrequency: "Weekly", escalationRule: "Escalate if CPL exceeds 150% of target for 7+ days"},
      { lineItem: "LSA Management", firstResponseStandard: "Within 4 hours", targetCompletionDays: 5, clientUpdateFrequency: "Monthly", escalationRule: "Escalate if lead quality score drops below 70%"},
      { lineItem: "Meta Ads Management", firstResponseStandard: "Within 4 business hours", targetCompletionDays: 5, clientUpdateFrequency: "Weekly", escalationRule: "Escalate if ROAS drops below 2x for 14+ days"},
    ],
    blockers: [],
    departments: [
      { department: "SEO", taskListIds: ["tl-004-1"], owner: "Aaron Park", escalationStatus: "None"},
      { department: "PPC", taskListIds: ["tl-004-2"], owner: "Ryan Torres", escalationStatus: "None"},
      { department: "LSA", taskListIds: ["tl-004-3"], owner: "Ryan Torres", escalationStatus: "None"},
      { department: "Meta Ads", taskListIds: ["tl-004-4"], owner: "Lily Chen", escalationStatus: "None"},
    ],
    executiveSummary: {
      projectHealth: "Green", launchRisk: "Low", departmentsDelayed: 0, criticalBlockers: 0,
      nextRequiredAction: "Complete monthly reports by Jul 31; prepare renewal proposal",
      expectedCompletion: "2026-08-01", clientImpact: "None — performing well", revenueImpact: "$6,800/mo recurring — renewal at risk if proposal delayed",
    },
  },

  // 5. Reporting-Only Project
  {
    id: "proj-005",
    name: "Lakeview Orthodontics — Reporting Only",
    client: "Lakeview Orthodontics",
    clientSlug: "lakeview-orthodontics",
    projectType: "Reporting Only",
    accountManager: "Priya Nair",
    projectOwner: "Lily Chen",
    lineItemsSold: ["Monthly Reporting Dashboard", "QBR Preparation"],
    departmentsInvolved: ["Reporting", "Account Management"],
    contractSummary: "12-month reporting retainer. $800/mo. Signed 2025-01-10.",
    targetLaunchDate: "2025-02-01",
    status: "Blocked",
    notes: "Blocked on client access — no GA4, GSC, or ad platform access received.",
    milestones: [
      { id: "ms-005-1", name: "Access Collection", owner: "Priya Nair", status: "Blocked", startDate: "2025-01-10", dueDate: "2025-01-25", progress: 20, blockedReason: "Client IT team has not granted access", taskListIds: ["tl-005-1"] },
      { id: "ms-005-2", name: "Dashboard Setup", owner: "Lily Chen", status: "Not Started", startDate: "2025-01-26", dueDate: "2025-02-05", progress: 0, taskListIds: ["tl-005-2"] },
    ],
    taskLists: [
      {
        id: "tl-005-1", name: "Access Collection Task List", sourceLineItem: "Monthly Reporting Dashboard", department: "Account Management",
        dueDate: "2025-01-25", status: "Blocked", owner: "Priya Nair",
        tasks: [
          { id: "t-005-1-1", name: "Collect GA4 Access", type: "One-Time", primaryAssignee: "Priya Nair", watchers: [], priority: "Urgent", status: "Blocked", dueDate: "2025-01-20", dependencies: [] },
          { id: "t-005-1-2", name: "Collect GSC Access", type: "One-Time", primaryAssignee: "Priya Nair", watchers: [], priority: "Urgent", status: "Blocked", dueDate: "2025-01-20", dependencies: [] },
        ],
      },
      {
        id: "tl-005-2", name: "Reporting Setup Task List", sourceLineItem: "Monthly Reporting Dashboard", department: "Reporting",
        dueDate: "2025-02-05", status: "Not Started", owner: "Lily Chen",
        tasks: [
          { id: "t-005-2-1", name: "Build Reporting Dashboard", type: "One-Time", primaryAssignee: "Lily Chen", watchers: [], priority: "High", status: "Open", dueDate: "2025-02-03", dependencies: [{ id: "dep-c1", taskId: "t-005-1-1", taskName: "Collect GA4 Access", type: "Finish-To-Start", direction: "blocked-by", status: "Blocked"}] },
          { id: "t-005-2-2", name: "Monthly Report Delivery", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Lily Chen", watchers: [], priority: "Medium", status: "Open", dueDate: "2025-02-28", dependencies: [] },
          { id: "t-005-2-3", name: "Quarterly QBR Prep", type: "Recurring", recurringRule: "Quarterly", primaryAssignee: "Lily Chen", approver: "Priya Nair", watchers: [], priority: "High", status: "Open", dueDate: "2025-04-01", dependencies: [] },
        ],
      },
    ],
    deliveryStandards: [
      { lineItem: "Monthly Reporting Dashboard", firstResponseStandard: "Within 2 business hours", targetCompletionDays: 5, clientUpdateFrequency: "Monthly", escalationRule: "Escalate if report not delivered by 5th of month"},
    ],
    blockers: [
      { id: "blk-005-1", type: "Missing Client Access", description: "Client IT has not granted GA4, GSC or ad platform access despite multiple requests and 3 escalations.", addedDate: "2025-01-15", owner: "Priya Nair", resolved: false, escalated: true },
    ],
    departments: [
      { department: "Reporting", taskListIds: ["tl-005-2"], owner: "Lily Chen", delayReason: "Blocked on client access", escalationStatus: "Critical"},
      { department: "Account Management", taskListIds: ["tl-005-1"], owner: "Priya Nair", escalationStatus: "Critical"},
    ],
    executiveSummary: {
      projectHealth: "Red", launchRisk: "High", departmentsDelayed: 1, criticalBlockers: 1,
      nextRequiredAction: "Executive contact client decision-maker directly",
      expectedCompletion: "Unknown — blocked", clientImpact: "High — no deliverables issued since contract signed", revenueImpact: "$800/mo charged — no value delivered yet",
    },
  },

  // 6. Website Project
  {
    id: "proj-006",
    name: "BlueSky Roofing — Website Redesign",
    client: "BlueSky Roofing",
    clientSlug: "bluesky-roofing",
    projectType: "Website Build",
    accountManager: "Daniel Okonkwo",
    projectOwner: "Dev Team",
    lineItemsSold: ["Website Redesign", "SEO Setup", "Hosting Setup"],
    departmentsInvolved: ["Web Development", "Creative", "SEO", "Account Management"],
    contractSummary: "One-time website project. $8,500 flat fee. Signed 2025-06-15.",
    targetLaunchDate: "2025-09-01",
    status: "In Progress",
    milestones: [
      { id: "ms-006-1", name: "Discovery & Wireframes", owner: "Creative Team", status: "Completed", startDate: "2025-06-20", dueDate: "2025-07-05", completionDate: "2025-07-04", progress: 100, taskListIds: [] },
      { id: "ms-006-2", name: "Design Approval", owner: "Creative Team", status: "In Progress", startDate: "2025-07-05", dueDate: "2025-07-25", progress: 60, taskListIds: ["tl-006-1"] },
      { id: "ms-006-3", name: "Development", owner: "Dev Team", status: "Not Started", startDate: "2025-07-26", dueDate: "2025-08-22", progress: 0, taskListIds: ["tl-006-2"] },
      { id: "ms-006-4", name: "SEO + Launch", owner: "Aaron Park", status: "Not Started", startDate: "2025-08-22", dueDate: "2025-09-01", progress: 0, taskListIds: ["tl-006-3"] },
    ],
    taskLists: [
      {
        id: "tl-006-1", name: "Design Task List", sourceLineItem: "Website Redesign", department: "Creative",
        dueDate: "2025-07-25", status: "In Progress", owner: "Creative Team",
        tasks: [
          { id: "t-006-1-1", name: "Homepage Design Mockup", type: "One-Time", primaryAssignee: "Creative Team", reviewer: "Daniel Okonkwo", approver: "Client", watchers: [], priority: "High", status: "In Progress", dueDate: "2025-07-15", dependencies: [] },
          { id: "t-006-1-2", name: "Inner Page Designs", type: "One-Time", primaryAssignee: "Creative Team", watchers: [], priority: "Medium", status: "Open", dueDate: "2025-07-22", dependencies: [] },
          { id: "t-006-1-3", name: "Client Design Approval", type: "Approval", primaryAssignee: "Daniel Okonkwo", approver: "Client", watchers: [], priority: "High", status: "Waiting", dueDate: "2025-07-25", dependencies: [] },
        ],
      },
      {
        id: "tl-006-2", name: "Development Task List", sourceLineItem: "Website Redesign", department: "Web Development",
        dueDate: "2025-08-22", status: "Not Started", owner: "Dev Team",
        tasks: [
          { id: "t-006-2-1", name: "WordPress Setup", type: "One-Time", primaryAssignee: "Dev Team", watchers: [], priority: "High", status: "Open", dueDate: "2025-07-28", dependencies: [{ id: "dep-d1", taskId: "t-006-1-3", taskName: "Client Design Approval", type: "Finish-To-Start", direction: "blocked-by", status: "Waiting"}] },
          { id: "t-006-2-2", name: "Page Development", type: "One-Time", primaryAssignee: "Dev Team", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-15", dependencies: [] },
          { id: "t-006-2-3", name: "QA & Testing", type: "Review", primaryAssignee: "Dev Team", reviewer: "Daniel Okonkwo", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-20", dependencies: [] },
        ],
      },
      {
        id: "tl-006-3", name: "SEO Setup Task List", sourceLineItem: "SEO Setup", department: "SEO",
        dueDate: "2025-09-01", status: "Not Started", owner: "Aaron Park",
        tasks: [
          { id: "t-006-3-1", name: "On-Page SEO Implementation", type: "One-Time", primaryAssignee: "Aaron Park", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-25", dependencies: [] },
          { id: "t-006-3-2", name: "GSC & Analytics Setup", type: "One-Time", primaryAssignee: "Aaron Park", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-28", dependencies: [] },
        ],
      },
    ],
    deliveryStandards: [
      { lineItem: "Website Redesign", firstResponseStandard: "Within 1 business day", targetCompletionDays: 60, clientUpdateFrequency: "Weekly", escalationRule: "Escalate if design revision >2 rounds or build delayed >5 days"},
    ],
    blockers: [],
    departments: [
      { department: "Creative", taskListIds: ["tl-006-1"], owner: "Creative Team", escalationStatus: "None"},
      { department: "Web Development", taskListIds: ["tl-006-2"], owner: "Dev Team", escalationStatus: "None"},
      { department: "SEO", taskListIds: ["tl-006-3"], owner: "Aaron Park", escalationStatus: "None"},
    ],
    executiveSummary: {
      projectHealth: "Yellow", launchRisk: "Medium", departmentsDelayed: 0, criticalBlockers: 0,
      nextRequiredAction: "Get client design approval by Jul 25 to protect dev timeline",
      expectedCompletion: "2025-09-01", clientImpact: "Moderate — design round extending timeline", revenueImpact: "$8,500 one-time — held until launch",
    },
  },

  // 7. AI Automation Project
  {
    id: "proj-007",
    name: "National MedGroup — AI Automation",
    client: "National MedGroup",
    clientSlug: "national-medgroup",
    projectType: "AI Automation",
    accountManager: "Priya Nair",
    projectOwner: "Marcus Webb",
    lineItemsSold: ["AI Lead Response Automation", "CRM Integration", "Reporting Setup"],
    departmentsInvolved: ["AI Automation", "Reporting", "Account Management"],
    contractSummary: "6-month AI automation project. $4,200/mo. Signed 2025-07-01.",
    targetLaunchDate: "2025-08-30",
    status: "Ready to Launch",
    milestones: [
      { id: "ms-007-1", name: "Discovery & Setup", owner: "Marcus Webb", status: "In Progress", startDate: "2025-07-01", dueDate: "2025-07-31", progress: 75, taskListIds: ["tl-007-1"] },
      { id: "ms-007-2", name: "Integration & Testing", owner: "Marcus Webb", status: "Not Started", startDate: "2025-08-01", dueDate: "2025-08-20", progress: 0, taskListIds: ["tl-007-2"] },
      { id: "ms-007-3", name: "Launch", owner: "Marcus Webb", status: "Not Started", startDate: "2025-08-21", dueDate: "2025-08-30", progress: 0, taskListIds: [] },
    ],
    taskLists: [
      {
        id: "tl-007-1", name: "AI Setup Task List", sourceLineItem: "AI Lead Response Automation", department: "AI Automation",
        dueDate: "2025-07-31", status: "In Progress", owner: "Marcus Webb",
        tasks: [
          { id: "t-007-1-1", name: "Map Lead Response Workflows", type: "One-Time", primaryAssignee: "Marcus Webb", watchers: [], priority: "High", status: "Completed", dueDate: "2025-07-10", completionDate: "2025-07-09", dependencies: [] },
          { id: "t-007-1-2", name: "Build AI Prompt Templates", type: "One-Time", primaryAssignee: "Marcus Webb", reviewer: "Priya Nair", watchers: [], priority: "High", status: "In Progress", dueDate: "2025-07-25", dependencies: [] },
          { id: "t-007-1-3", name: "CRM Webhook Configuration", type: "One-Time", primaryAssignee: "Marcus Webb", watchers: [], priority: "High", status: "Open", dueDate: "2025-07-30", dependencies: [] },
        ],
      },
      {
        id: "tl-007-2", name: "Integration & Testing Task List", sourceLineItem: "CRM Integration", department: "AI Automation",
        dueDate: "2025-08-20", status: "Not Started", owner: "Marcus Webb",
        tasks: [
          { id: "t-007-2-1", name: "CRM Integration Testing", type: "One-Time", primaryAssignee: "Marcus Webb", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-10", dependencies: [] },
          { id: "t-007-2-2", name: "UAT with Client", type: "Review", primaryAssignee: "Priya Nair", approver: "Client", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-18", dependencies: [] },
        ],
      },
    ],
    deliveryStandards: [
      { lineItem: "AI Lead Response Automation", firstResponseStandard: "Within 4 business hours", targetCompletionDays: 45, clientUpdateFrequency: "Weekly during build", escalationRule: "Escalate if integration fails QA after 2 attempts"},
    ],
    blockers: [],
    departments: [
      { department: "AI Automation", taskListIds: ["tl-007-1", "tl-007-2"], owner: "Marcus Webb", escalationStatus: "None"},
    ],
    executiveSummary: {
      projectHealth: "Green", launchRisk: "Low", departmentsDelayed: 0, criticalBlockers: 0,
      nextRequiredAction: "Complete AI Prompt Templates by Jul 25",
      expectedCompletion: "2025-08-30", clientImpact: "None — on track", revenueImpact: "$4,200/mo — new revenue stream",
    },
  },

  // 8. Upsell Project
  {
    id: "proj-008",
    name: "Summit Auto Group — Meta Ads Upsell",
    client: "Summit Auto Group",
    clientSlug: "summit-auto-group",
    projectType: "Upsell",
    accountManager: "Priya Nair",
    projectOwner: "Lily Chen",
    lineItemsSold: ["Meta Ads Management"],
    departmentsInvolved: ["Meta Ads", "Account Management"],
    contractSummary: "Upsell: Meta Ads added to existing contract. +$1,200/mo. Signed 2025-07-20.",
    targetLaunchDate: "2025-08-10",
    status: "Launched",
    milestones: [
      { id: "ms-008-1", name: "Meta Ads Launch", owner: "Lily Chen", status: "In Progress", startDate: "2025-07-20", dueDate: "2025-08-10", progress: 40, taskListIds: ["tl-008-1"] },
    ],
    taskLists: [
      {
        id: "tl-008-1", name: "Meta Ads Launch Task List", sourceLineItem: "Meta Ads Management", department: "Meta Ads",
        dueDate: "2025-08-10", status: "In Progress", owner: "Lily Chen",
        tasks: [
          { id: "t-008-1-1", name: "Business Manager Setup", type: "One-Time", primaryAssignee: "Lily Chen", watchers: [], priority: "High", status: "Completed", dueDate: "2025-07-23", completionDate: "2025-07-22", dependencies: [] },
          { id: "t-008-1-2", name: "Creative Brief & Ad Copy", type: "One-Time", primaryAssignee: "Lily Chen", reviewer: "Priya Nair", watchers: [], priority: "High", status: "In Progress", dueDate: "2025-07-30", dependencies: [] },
          { id: "t-008-1-3", name: "Campaign Launch", type: "One-Time", primaryAssignee: "Lily Chen", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-10", dependencies: [] },
          { id: "t-008-1-4", name: "Monthly Meta Optimization", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Lily Chen", watchers: [], priority: "Medium", status: "Open", dueDate: "2025-08-31", dependencies: [] },
        ],
      },
    ],
    deliveryStandards: [
      { lineItem: "Meta Ads Management", firstResponseStandard: "Within 4 business hours", targetCompletionDays: 5, clientUpdateFrequency: "Weekly", escalationRule: "Escalate if ROAS drops below 2x for 14+ days"},
    ],
    blockers: [],
    departments: [
      { department: "Meta Ads", taskListIds: ["tl-008-1"], owner: "Lily Chen", escalationStatus: "None"},
    ],
    executiveSummary: {
      projectHealth: "Green", launchRisk: "Low", departmentsDelayed: 0, criticalBlockers: 0,
      nextRequiredAction: "Complete creative brief by Jul 30",
      expectedCompletion: "2025-08-10 (launch)", clientImpact: "Positive — expanding services", revenueImpact: "+$1,200/mo to existing account",
    },
  },

  // 9. Renewal Project
  {
    id: "proj-009",
    name: "Prestige Law Group — Contract Renewal",
    client: "Prestige Law Group",
    clientSlug: "prestige-law-group",
    projectType: "Renewal",
    accountManager: "Priya Nair",
    projectOwner: "Jessica Reyes",
    lineItemsSold: ["Contract Renewal", "Upsell: Meta Ads"],
    departmentsInvolved: ["Account Management"],
    contractSummary: "Renewal of 24-month full-service contract. Includes Meta Ads upsell. Due 2025-08-01.",
    targetLaunchDate: "2025-08-01",
    status: "In Progress",
    milestones: [
      { id: "ms-009-1", name: "Performance Review", owner: "Priya Nair", status: "In Progress", startDate: "2025-07-15", dueDate: "2025-07-25", progress: 80, taskListIds: ["tl-009-1"] },
      { id: "ms-009-2", name: "Renewal Proposal", owner: "Jessica Reyes", status: "Not Started", startDate: "2025-07-25", dueDate: "2025-07-31", progress: 0, taskListIds: ["tl-009-2"] },
      { id: "ms-009-3", name: "Contract Signed", owner: "Jessica Reyes", status: "Not Started", startDate: "2025-08-01", dueDate: "2025-08-05", progress: 0, taskListIds: [] },
    ],
    taskLists: [
      {
        id: "tl-009-1", name: "Renewal Review Task List", sourceLineItem: "Contract Renewal", department: "Account Management",
        dueDate: "2025-07-25", status: "In Progress", owner: "Priya Nair",
        tasks: [
          { id: "t-009-1-1", name: "Pull 12-Month Performance Data", type: "One-Time", primaryAssignee: "Lily Chen", watchers: [], priority: "High", status: "Completed", dueDate: "2025-07-18", completionDate: "2025-07-18", dependencies: [] },
          { id: "t-009-1-2", name: "Prepare Renewal Deck", type: "One-Time", primaryAssignee: "Priya Nair", watchers: [], priority: "High", status: "In Progress", dueDate: "2025-07-24", dependencies: [] },
        ],
      },
      {
        id: "tl-009-2", name: "Renewal Proposal Task List", sourceLineItem: "Contract Renewal", department: "Account Management",
        dueDate: "2025-07-31", status: "Not Started", owner: "Jessica Reyes",
        tasks: [
          { id: "t-009-2-1", name: "Build Renewal Proposal", type: "One-Time", primaryAssignee: "Jessica Reyes", watchers: [], priority: "Urgent", status: "Open", dueDate: "2025-07-28", dependencies: [{ id: "dep-e1", taskId: "t-009-1-2", taskName: "Prepare Renewal Deck", type: "Finish-To-Start", direction: "blocked-by", status: "In Progress"}] },
          { id: "t-009-2-2", name: "Send Proposal via DocuSign", type: "One-Time", primaryAssignee: "Jessica Reyes", watchers: [], priority: "High", status: "Open", dueDate: "2025-07-30", dependencies: [] },
        ],
      },
    ],
    deliveryStandards: [
      { lineItem: "Contract Renewal", firstResponseStandard: "Same business day", targetCompletionDays: 10, clientUpdateFrequency: "As needed", escalationRule: "Escalate to VP if client does not respond within 5 days of proposal"},
    ],
    blockers: [],
    departments: [
      { department: "Account Management", taskListIds: ["tl-009-1", "tl-009-2"], owner: "Priya Nair", escalationStatus: "None"},
    ],
    executiveSummary: {
      projectHealth: "Yellow", launchRisk: "Medium", departmentsDelayed: 0, criticalBlockers: 0,
      nextRequiredAction: "Send renewal proposal by Jul 30",
      expectedCompletion: "2025-08-05", clientImpact: "High — $6,800/mo renewal at stake", revenueImpact: "$6,800/mo + $1,200/mo upsell if signed",
    },
  },

  // 10. Blocked Project
  {
    id: "proj-010",
    name: "BlueSky Roofing — Full Service (BLOCKED)",
    client: "BlueSky Roofing",
    clientSlug: "bluesky-roofing",
    projectType: "Full Service",
    accountManager: "Daniel Okonkwo",
    projectOwner: "Aaron Park",
    lineItemsSold: ["SEO Management", "LSA Management", "GBP Management"],
    departmentsInvolved: ["SEO", "LSA", "GBP", "Account Management"],
    contractSummary: "12-month full-service retainer. $3,200/mo. Signed 2025-05-01. Client at risk of cancellation.",
    targetLaunchDate: "2025-06-01",
    status: "Blocked",
    notes: "Client threatened cancellation due to poor LSA results. Retention offer extended.",
    milestones: [
      { id: "ms-010-1", name: "Launched", owner: "Daniel Okonkwo", status: "Completed", startDate: "2025-05-01", dueDate: "2025-06-01", completionDate: "2025-05-30", progress: 100, taskListIds: [] },
      { id: "ms-010-2", name: "Retention & Recovery", owner: "Daniel Okonkwo", status: "Blocked", startDate: "2025-07-01", dueDate: "2025-08-01", progress: 20, blockedReason: "Waiting on client decision about retention offer", taskListIds: ["tl-010-1"] },
    ],
    taskLists: [
      {
        id: "tl-010-1", name: "Retention Task List", sourceLineItem: "SEO Management", department: "Account Management",
        dueDate: "2025-08-01", status: "Blocked", owner: "Daniel Okonkwo",
        tasks: [
          { id: "t-010-1-1", name: "Cancellation Save Attempt", type: "One-Time", primaryAssignee: "Marcus Webb", watchers: [], priority: "Urgent", status: "In Progress", dueDate: "2025-07-26", dependencies: [] },
          { id: "t-010-1-2", name: "Retention Call with Client", type: "One-Time", primaryAssignee: "Priya Nair", watchers: ["Marcus Webb"], priority: "Urgent", status: "Waiting", dueDate: "2025-07-28", dependencies: [] },
          { id: "t-010-1-3", name: "LSA Performance Review", type: "One-Time", primaryAssignee: "Ryan Torres", reviewer: "Priya Nair", watchers: [], priority: "High", status: "In Progress", dueDate: "2025-07-27", dependencies: [] },
        ],
      },
    ],
    deliveryStandards: [
      { lineItem: "SEO Management", firstResponseStandard: "Within 4 business hours", targetCompletionDays: 30, clientUpdateFrequency: "Monthly", escalationRule: "Escalate immediately if client mentions cancellation"},
      { lineItem: "LSA Management", firstResponseStandard: "Within 4 hours", targetCompletionDays: 5, clientUpdateFrequency: "Monthly", escalationRule: "Escalate if lead quality score drops below 70%"},
    ],
    blockers: [
      { id: "blk-010-1", type: "Waiting on Client", description: "Client has not responded to retention offer extended on Jul 22. Risk of cancellation is high.", addedDate: "2025-07-22", owner: "Daniel Okonkwo", resolved: false, escalated: true },
    ],
    departments: [
      { department: "SEO", taskListIds: [], owner: "Aaron Park", delayReason: "At-risk client — reduced work until retention confirmed", escalationStatus: "Critical"},
      { department: "LSA", taskListIds: [], owner: "Ryan Torres", delayReason: "Poor performance caused client complaint", escalationStatus: "Critical"},
      { department: "Account Management", taskListIds: ["tl-010-1"], owner: "Daniel Okonkwo", escalationStatus: "Critical"},
    ],
    executiveSummary: {
      projectHealth: "Red", launchRisk: "High", departmentsDelayed: 2, criticalBlockers: 1,
      nextRequiredAction: "VP must call client decision-maker directly by Jul 26",
      expectedCompletion: "Unknown — cancellation risk", clientImpact: "Critical — possible churn", revenueImpact: "$3,200/mo at immediate risk",
    },
  },

  // 11. Completed Project
  {
    id: "proj-011",
    name: "Clearwater Spa — Website Build (COMPLETED)",
    client: "Clearwater Spa",
    clientSlug: "clearwater-spa",
    projectType: "Website Build",
    accountManager: "Priya Nair",
    projectOwner: "Dev Team",
    lineItemsSold: ["Website Build", "SEO Setup"],
    departmentsInvolved: ["Web Development", "SEO", "Account Management"],
    contractSummary: "One-time website project. $6,500. Signed 2025-03-01. Completed 2025-05-15.",
    targetLaunchDate: "2025-05-15",
    completionDate: "2025-05-15",
    status: "Completed",
    milestones: [
      { id: "ms-011-1", name: "Discovery", owner: "Priya Nair", status: "Completed", startDate: "2025-03-01", dueDate: "2025-03-15", completionDate: "2025-03-14", progress: 100, taskListIds: [] },
      { id: "ms-011-2", name: "Design & Build", owner: "Dev Team", status: "Completed", startDate: "2025-03-15", dueDate: "2025-04-30", completionDate: "2025-04-28", progress: 100, taskListIds: [] },
      { id: "ms-011-3", name: "Launch", owner: "Dev Team", status: "Completed", startDate: "2025-05-01", dueDate: "2025-05-15", completionDate: "2025-05-15", progress: 100, taskListIds: [] },
    ],
    taskLists: [],
    deliveryStandards: [
      { lineItem: "Website Build", firstResponseStandard: "Within 1 business day", targetCompletionDays: 60, clientUpdateFrequency: "Weekly", escalationRule: "N/A — project complete"},
    ],
    blockers: [],
    departments: [
      { department: "Web Development", taskListIds: [], owner: "Dev Team", escalationStatus: "None"},
      { department: "SEO", taskListIds: [], owner: "Aaron Park", escalationStatus: "None"},
    ],
    executiveSummary: {
      projectHealth: "Green", launchRisk: "Low", departmentsDelayed: 0, criticalBlockers: 0,
      nextRequiredAction: "None — project complete",
      expectedCompletion: "2025-05-15", clientImpact: "None — delivered on time", revenueImpact: "$6,500 collected",
    },
  },

  // 12. Pending Client Access Project
  {
    id: "proj-012",
    name: "GreenLeaf HVAC — Full Service Onboarding",
    client: "GreenLeaf HVAC",
    clientSlug: "greenleaf-hvac",
    projectType: "Full Service",
    accountManager: "Daniel Okonkwo",
    projectOwner: "Priya Nair",
    lineItemsSold: ["SEO Management", "Google Ads Management", "GBP Management", "Monthly Reporting"],
    departmentsInvolved: ["SEO", "PPC", "GBP", "Reporting", "Account Management"],
    contractSummary: "12-month full-service retainer. $4,800/mo. Signed 2025-07-20. First invoice paid.",
    targetLaunchDate: "2025-08-25",
    status: "Pending Client",
    notes: "Waiting on client to complete onboarding form and provide platform access.",
    milestones: [
      { id: "ms-012-1", name: "Onboarding", owner: "Daniel Okonkwo", status: "In Progress", startDate: "2025-07-20", dueDate: "2025-08-01", progress: 30, taskListIds: ["tl-012-1"] },
      { id: "ms-012-2", name: "Access Collection", owner: "Daniel Okonkwo", status: "Not Started", startDate: "2025-08-01", dueDate: "2025-08-10", progress: 0, taskListIds: ["tl-012-2"] },
      { id: "ms-012-3", name: "Department Launch", owner: "Priya Nair", status: "Not Started", startDate: "2025-08-11", dueDate: "2025-08-25", progress: 0, taskListIds: ["tl-012-3", "tl-012-4", "tl-012-5"] },
    ],
    taskLists: [
      {
        id: "tl-012-1", name: "Onboarding Task List", sourceLineItem: "SEO Management", department: "Account Management",
        dueDate: "2025-08-01", status: "In Progress", owner: "Daniel Okonkwo",
        tasks: [
          { id: "t-012-1-1", name: "Assign Account Manager", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "Urgent", status: "Completed", dueDate: "2025-07-21", completionDate: "2025-07-21", dependencies: [] },
          { id: "t-012-1-2", name: "Send Welcome Email & Onboarding Form", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "High", status: "Completed", dueDate: "2025-07-22", completionDate: "2025-07-22", dependencies: [] },
          { id: "t-012-1-3", name: "Follow Up — Onboarding Form", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: ["Priya Nair"], priority: "High", status: "In Progress", dueDate: "2025-07-28", dependencies: [] },
          { id: "t-012-1-4", name: "Schedule Kickoff Call", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "High", status: "Waiting", dueDate: "2025-07-30", dependencies: [] },
        ],
      },
      {
        id: "tl-012-2", name: "Access Collection Task List", sourceLineItem: "SEO Management", department: "Account Management",
        dueDate: "2025-08-10", status: "Not Started", owner: "Daniel Okonkwo",
        tasks: [
          { id: "t-012-2-1", name: "Collect Google Analytics Access", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "Urgent", status: "Open", dueDate: "2025-08-03", dependencies: [] },
          { id: "t-012-2-2", name: "Collect Google Ads Access", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "Urgent", status: "Open", dueDate: "2025-08-03", dependencies: [] },
          { id: "t-012-2-3", name: "Collect GBP Admin Access", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-05", dependencies: [] },
        ],
      },
      {
        id: "tl-012-3", name: "SEO Setup Task List", sourceLineItem: "SEO Management", department: "SEO",
        dueDate: "2025-08-22", status: "Not Started", owner: "Aaron Park",
        tasks: [
          { id: "t-012-3-1", name: "Technical Audit", type: "One-Time", primaryAssignee: "Aaron Park", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-14", dependencies: [{ id: "dep-f1", taskId: "t-012-2-1", taskName: "Collect Google Analytics Access", type: "Finish-To-Start", direction: "blocked-by", status: "Open"}] },
          { id: "t-012-3-2", name: "Keyword Research", type: "One-Time", primaryAssignee: "Aaron Park", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-18", dependencies: [] },
          { id: "t-012-3-3", name: "Monthly SEO Report", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Aaron Park", watchers: [], priority: "Medium", status: "Open", dueDate: "2025-08-31", dependencies: [] },
        ],
      },
      {
        id: "tl-012-4", name: "PPC Launch Task List", sourceLineItem: "Google Ads Management", department: "PPC",
        dueDate: "2025-08-22", status: "Not Started", owner: "Ryan Torres",
        tasks: [
          { id: "t-012-4-1", name: "Campaign Structure Build", type: "One-Time", primaryAssignee: "Ryan Torres", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-15", dependencies: [{ id: "dep-f2", taskId: "t-012-2-2", taskName: "Collect Google Ads Access", type: "Finish-To-Start", direction: "blocked-by", status: "Open"}] },
          { id: "t-012-4-2", name: "Monthly PPC Optimization", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Ryan Torres", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-31", dependencies: [] },
        ],
      },
      {
        id: "tl-012-5", name: "GBP Launch Task List", sourceLineItem: "GBP Management", department: "GBP",
        dueDate: "2025-08-22", status: "Not Started", owner: "Daniel Okonkwo",
        tasks: [
          { id: "t-012-5-1", name: "GBP Profile Optimization", type: "One-Time", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "High", status: "Open", dueDate: "2025-08-17", dependencies: [{ id: "dep-f3", taskId: "t-012-2-3", taskName: "Collect GBP Admin Access", type: "Finish-To-Start", direction: "blocked-by", status: "Open"}] },
          { id: "t-012-5-2", name: "Monthly GBP Review", type: "Recurring", recurringRule: "Monthly", primaryAssignee: "Daniel Okonkwo", watchers: [], priority: "Low", status: "Open", dueDate: "2025-08-31", dependencies: [] },
        ],
      },
    ],
    deliveryStandards: [
      { lineItem: "SEO Management", firstResponseStandard: "Within 4 business hours", targetCompletionDays: 30, clientUpdateFrequency: "Monthly", escalationRule: "Escalate to Department Head if delayed >5 days"},
      { lineItem: "Google Ads Management", firstResponseStandard: "Within 2 business hours", targetCompletionDays: 3, clientUpdateFrequency: "Weekly", escalationRule: "Escalate if CPL exceeds 150% of target for 7+ days"},
      { lineItem: "GBP Management", firstResponseStandard: "Within 2 business hours", targetCompletionDays: 7, clientUpdateFrequency: "Monthly", escalationRule: "Escalate if GBP issue not resolved within 48 hours"},
    ],
    blockers: [
      { id: "blk-012-1", type: "Waiting on Client", description: "Client has not completed onboarding form sent on Jul 22.", addedDate: "2025-07-24", owner: "Daniel Okonkwo", resolved: false, escalated: false },
    ],
    departments: [
      { department: "SEO", taskListIds: ["tl-012-3"], owner: "Aaron Park", escalationStatus: "None"},
      { department: "PPC", taskListIds: ["tl-012-4"], owner: "Ryan Torres", escalationStatus: "None"},
      { department: "GBP", taskListIds: ["tl-012-5"], owner: "Daniel Okonkwo", escalationStatus: "None"},
      { department: "Account Management", taskListIds: ["tl-012-1", "tl-012-2"], owner: "Daniel Okonkwo", escalationStatus: "None"},
    ],
    executiveSummary: {
      projectHealth: "Yellow", launchRisk: "Medium", departmentsDelayed: 0, criticalBlockers: 0,
      nextRequiredAction: "Follow up with client on onboarding form by Jul 28",
      expectedCompletion: "2025-08-25", clientImpact: "Moderate — launch at risk if access delayed", revenueImpact: "$4,800/mo starting — first month charged",
    },
  },
];

//  STYLE CONFIGS 

const PROJECT_STATUS_CFG: Record<ProjectStatus, { bg?: string; color?: string; border: string; dot: string }> = {
  "Draft":               { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", dot: "#CBD5E1"},
  "Ready to Launch":     { bg: "#ECFEFF", color: "#0E7490", border: "#A5F3FC", dot: "#06B6D4"},
  "Launched":            { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6"},
  "In Progress":         { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A", dot: "#EAB308"},
  "Blocked":             { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444"},
  "Pending Client":      { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA", dot: "#F97316"},
  "Pending Department":  { bg: "#FAF5FF", color: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6"},
  "Completed":           { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981"},
  "Cancelled":           { bg: "#F8FAFC", color: "#9AAABB", border: "#E4E8F0", dot: "#CBD5E1"},
};

const MILESTONE_STATUS_CFG: Record<MilestoneStatus, { bg?: string; color?: string; border: string }> = {
  "Not Started": { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
  "In Progress": { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A"},
  "Blocked":     { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
  "Completed":   { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
};

const TASK_STATUS_CFG: Record<TaskStatus, { bg?: string; color?: string; border: string; dot: string }> = {
  "Open":        { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6"},
  "In Progress": { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A", dot: "#EAB308"},
  "Waiting":     { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", dot: "#94A3B8"},
  "Blocked":     { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444"},
  "Review":      { bg: "#FAF5FF", color: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6"},
  "Completed":   { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981"},
  "Cancelled":   { bg: "#F8FAFC", color: "#9AAABB", border: "#E4E8F0", dot: "#CBD5E1"},
};

const HEALTH_CFG = {
  "Green": { bg: "#ECFDF5", color: "#059669"},
  "Yellow": { bg: "#FFFBEB", color: "#D97706"},
  "Red": { bg: "#FEF2F2", color: "#DC2626"},
};

const RISK_CFG = {
  "Low": { bg: "#ECFDF5", color: "#059669"},
  "Medium": { bg: "#FFFBEB", color: "#D97706"},
  "High": { bg: "#FEF2F2", color: "#DC2626"},
};

const PRIORITY_CFG: Record<TaskPriority, { bg?: string; color?: string; border: string; icon?: string }> = {
  "Low":    { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", icon: "↓"},
  "Medium": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", icon: "→"},
  "High":   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", icon: "↑"},
  "Urgent": { bg: "#FAF5FF", color: "#7C3AED", border: "#DDD6FE"},
};

//  BADGE COMPONENTS 

function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const c = PROJECT_STATUS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap"style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  const c = MILESTONE_STATUS_CFG[status];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap"style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      {status}
    </span>
  );
}

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const c = TASK_STATUS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap"style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span className="w-1.5 h-1.5 rounded-full"style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const c = PRIORITY_CFG[priority];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap"style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span>{c.icon}</span>{priority}
    </span>
  );
}

function BlockerBadge({ count }: { count: number }) {
  if (count === 0) return <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>—</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA"}}>
       {count}
    </span>
  );
}

function DeliveryStandardBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"style={{ background: "#ECFEFF", color: "#0E7490", border: "1px solid #A5F3FC"}}>
       {label}
    </span>
  );
}

function DependencyBadge({ count }: { count: number }) {
  if (count === 0) return <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>—</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE"}}>
       {count}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split("").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#1B4FD8", "#059669", "#7C3AED", "#D97706", "#DC2626", "#0891B2", "#BE185D"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold flex-shrink-0"style={{ background: bg }}>
      {initials}
    </span>
  );
}

//  KPI CARD 

function KpiCard({ label, value, sub, color, icon }: { label: string; value: number | string; sub?: string; color?: string; icon?: string }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-secondary)"}}>{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-3xl font-black"style={{ color }}>{value}</div>
      {sub && <div className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{sub}</div>}
    </div>
  );
}

//  PROJECT DETAIL DRAWER 

function ProjectDetailDrawer({ project, onClose }: { project: Project; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<
    "overview"| "contract"| "lineitems"| "milestones"| "tasklists"| "tasks"| "departments"| "dependencies"| "standards"| "blockers"| "timeline"| "notes"| "executive">("overview");

  const tabs = [
    { id: "overview"as const, label: "Overview"},
    { id: "contract"as const, label: "Contract"},
    { id: "lineitems"as const, label: "Line Items"},
    { id: "milestones"as const, label: "Milestones"},
    { id: "tasklists"as const, label: "Task Lists"},
    { id: "tasks"as const, label: "Tasks"},
    { id: "departments"as const, label: "Departments"},
    { id: "dependencies"as const, label: "Dependencies"},
    { id: "standards"as const, label: "Delivery Standards"},
    { id: "blockers"as const, label: `Blockers${project.blockers.filter(b => !b.resolved).length > 0 ? ` (${project.blockers.filter(b => !b.resolved).length})` : ""}` },
    { id: "executive"as const, label: "Executive Summary"},
  ];

  const allTasks = project.taskLists.flatMap(tl => tl.tasks);
  const allDeps = allTasks.flatMap(t => t.dependencies);
  const openBlockers = project.blockers.filter(b => !b.resolved);

  const health = HEALTH_CFG[project.executiveSummary.projectHealth];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm"onClick={onClose} />
      <div className="w-full max-w-3xl bg-white flex flex-col shadow-2xl"style={{ borderLeft: "1px solid var(--rtm-border)"}}>
        {/* Header */}
        <div className="flex items-start justify-between p-5"style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-blue-xlight)"}}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-blue)"}}>{project.id}</span>
              <ProjectStatusBadge status={project.status} />
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"style={{ background: health.bg, color: health.color }}>
{project.executiveSummary.projectHealth} Health
              </span>
            </div>
            <h2 className="text-lg font-extrabold leading-snug"style={{ color: "var(--rtm-text-primary)"}}>{project.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs flex-wrap"style={{ color: "var(--rtm-text-secondary)"}}>
              <span>Client: <b>{project.client}</b></span>
              <span>AM: <b>{project.accountManager}</b></span>
              <span>Owner: <b>{project.projectOwner}</b></span>
              <span>Target: <b>{project.targetLaunchDate}</b></span>
            </div>
          </div>
          <button onClick={onClose} className="ml-4 p-1.5 rounded-lg hover:bg-black/5 text-gray-400 flex-shrink-0">
            <svg width="18"height="18"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0"style={{
                color: activeTab === t.id ? "var(--rtm-blue)": "var(--rtm-text-secondary)",
                borderBottom: activeTab === t.id ? "2px solid var(--rtm-blue)": "2px solid transparent",
                background: "transparent",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* OVERVIEW */}
          {activeTab === "overview"&& (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Client", value: project.client },
                  { label: "Project Type", value: project.projectType },
                  { label: "Account Manager", value: project.accountManager },
                  { label: "Project Owner", value: project.projectOwner },
                  { label: "Target Launch", value: project.targetLaunchDate },
                  { label: "Completion Date", value: project.completionDate ?? "In Progress"},
                  { label: "Departments", value: project.departmentsInvolved.join(", ") },
                  { label: "Line Items Sold", value: project.lineItemsSold.length.toString() },
                  { label: "Total Milestones", value: project.milestones.length.toString() },
                  { label: "Total Task Lists", value: project.taskLists.length.toString() },
                  { label: "Total Tasks", value: allTasks.length.toString() },
                  { label: "Open Blockers", value: openBlockers.length.toString() },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg p-3"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1"style={{ color: "var(--rtm-text-muted)"}}>{item.label}</div>
                    <div className="text-sm font-medium"style={{ color: "var(--rtm-text-primary)"}}>{item.value}</div>
                  </div>
                ))}
              </div>
              {project.notes && (
                <div className="rounded-lg p-4"style={{ background: "#FFFBEB", border: "1px solid #FDE68A"}}>
                  <div className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: "#D97706"}}>Notes</div>
                  <p className="text-sm"style={{ color: "var(--rtm-text-primary)"}}>{project.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* CONTRACT */}
          {activeTab === "contract"&& (
            <div className="rounded-xl p-5"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
              <div className="text-xs font-bold uppercase tracking-wide mb-3"style={{ color: "var(--rtm-text-secondary)"}}>Contract Summary</div>
              <p className="text-sm leading-relaxed"style={{ color: "var(--rtm-text-primary)"}}>{project.contractSummary}</p>
              <div className="mt-4 flex gap-2 flex-wrap">
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"style={{ background: "var(--rtm-blue)"}}>View Contract</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}>View Invoice</button>
              </div>
            </div>
          )}

          {/* LINE ITEMS */}
          {activeTab === "lineitems"&& (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-secondary)"}}>Line Items Sold ({project.lineItemsSold.length})</div>
              {project.lineItemsSold.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"style={{ background: "var(--rtm-blue)"}}>{i + 1}</span>
                    <span className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item}</span>
                  </div>
                  <DeliveryStandardBadge label="Has Standard"/>
                </div>
              ))}
            </div>
          )}

          {/* MILESTONES */}
          {activeTab === "milestones"&& (
            <div className="flex flex-col gap-3">
              {project.milestones.map((ms) => (
                <div key={ms.id} className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <span className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{ms.name}</span>
                    <MilestoneStatusBadge status={ms.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div><span style={{ color: "var(--rtm-text-muted)"}}>Owner: </span><b>{ms.owner}</b></div>
                    <div><span style={{ color: "var(--rtm-text-muted)"}}>Start: </span><b>{ms.startDate}</b></div>
                    <div><span style={{ color: "var(--rtm-text-muted)"}}>Due: </span><b>{ms.dueDate}</b></div>
                    {ms.completionDate && <div><span style={{ color: "var(--rtm-text-muted)"}}>Completed: </span><b style={{ color: "#059669"}}>{ms.completionDate}</b></div>}
                  </div>
                  {ms.blockedReason && (
                    <div className="text-xs p-2 rounded-lg mb-2"style={{ background: "#FEF2F2", color: "#DC2626"}}> {ms.blockedReason}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden"style={{ background: "var(--rtm-border)"}}>
                      <div className="h-full rounded-full"style={{ width: `${ms.progress}%`, background: ms.status === "Completed"? "#10B981": ms.status === "Blocked"? "#EF4444": "var(--rtm-blue)"}} />
                    </div>
                    <span className="text-xs font-bold"style={{ color: "var(--rtm-text-secondary)"}}>{ms.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TASK LISTS */}
          {activeTab === "tasklists"&& (
            <div className="flex flex-col gap-3">
              {project.taskLists.length === 0 && (
                <div className="text-center py-10 text-sm"style={{ color: "var(--rtm-text-muted)"}}>No task lists yet.</div>
              )}
              {project.taskLists.map((tl) => {
                const completed = tl.tasks.filter(t => t.status === "Completed").length;
                const blocked = tl.tasks.filter(t => t.status === "Blocked").length;
                return (
                  <div key={tl.id} className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <span className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{tl.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"style={{ background: tl.status === "Completed"? "#ECFDF5": tl.status === "Blocked"? "#FEF2F2": "#EFF6FF", color: tl.status === "Completed"? "#059669": tl.status === "Blocked"? "#DC2626": "#1D4ED8"}}>
                        {tl.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span style={{ color: "var(--rtm-text-muted)"}}>Source: </span><b>{tl.sourceLineItem}</b></div>
                      <div><span style={{ color: "var(--rtm-text-muted)"}}>Dept: </span><b>{tl.department}</b></div>
                      <div><span style={{ color: "var(--rtm-text-muted)"}}>Owner: </span><b>{tl.owner}</b></div>
                      <div><span style={{ color: "var(--rtm-text-muted)"}}>Tasks: </span><b>{tl.tasks.length}</b></div>
                      <div><span style={{ color: "var(--rtm-text-muted)"}}>Done: </span><b style={{ color: "#059669"}}>{completed}</b></div>
                      <div><span style={{ color: "var(--rtm-text-muted)"}}>Blocked: </span><b style={{ color: "#DC2626"}}>{blocked}</b></div>
                      <div><span style={{ color: "var(--rtm-text-muted)"}}>Due: </span><b>{tl.dueDate}</b></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TASKS */}
          {activeTab === "tasks"&& (
            <div className="flex flex-col gap-4">
              {project.taskLists.length === 0 && (
                <div className="text-center py-10 text-sm"style={{ color: "var(--rtm-text-muted)"}}>No tasks yet.</div>
              )}
              {project.taskLists.map((tl) => (
                <div key={tl.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black uppercase tracking-wide"style={{ color: "var(--rtm-blue)"}}>{tl.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"style={{ background: "#EFF6FF", color: "var(--rtm-blue)"}}>{tl.department}</span>
                  </div>
                  <div className="flex flex-col gap-2 mb-4">
                    {tl.tasks.map((task) => (
                      <div key={task.id} className="rounded-lg p-3"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <span className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{task.name}</span>
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold"style={{ background: "#FAF5FF", color: "#7C3AED"}}>{task.type}</span>
                            {task.recurringRule && (
                              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded font-semibold"style={{ background: "#ECFEFF", color: "#0E7490"}}> {task.recurringRule}</span>
                            )}
                          </div>
                          <TaskStatusBadge status={task.status} />
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs mt-1">
                          <span style={{ color: "var(--rtm-text-muted)"}}>Assignee: <b>{task.primaryAssignee}</b></span>
                          {task.secondaryAssignee && <span style={{ color: "var(--rtm-text-muted)"}}>Secondary: <b>{task.secondaryAssignee}</b></span>}
                          {task.reviewer && <span style={{ color: "var(--rtm-text-muted)"}}>Reviewer: <b>{task.reviewer}</b></span>}
                          {task.approver && <span style={{ color: "var(--rtm-text-muted)"}}>Approver: <b>{task.approver}</b></span>}
                          <span style={{ color: "var(--rtm-text-muted)"}}>Due: <b>{task.dueDate}</b></span>
                          <PriorityBadge priority={task.priority} />
                          {task.dependencies.length > 0 && <DependencyBadge count={task.dependencies.length} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DEPARTMENTS */}
          {activeTab === "departments"&& (
            <div className="flex flex-col gap-3">
              {project.departments.map((dept) => {
                const deptTaskLists = project.taskLists.filter(tl => dept.taskListIds.includes(tl.id));
                const openTasks = deptTaskLists.flatMap(tl => tl.tasks).filter(t => t.status !== "Completed"&& t.status !== "Cancelled").length;
                const blockedTasks = deptTaskLists.flatMap(tl => tl.tasks).filter(t => t.status === "Blocked").length;
                const completedTasks = deptTaskLists.flatMap(tl => tl.tasks).filter(t => t.status === "Completed").length;
                const escCfg = dept.escalationStatus === "Critical"? { bg: "#FEF2F2", color: "#DC2626"} : dept.escalationStatus === "Escalated"? { bg: "#FFFBEB", color: "#D97706"} : { bg: "#ECFDF5", color: "#059669"};
                return (
                  <div key={dept.department} className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                      <span className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{dept.department}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"style={escCfg}>{dept.escalationStatus === "None"? "On Track": dept.escalationStatus}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs mb-2">
                      {[
                        { label: "Task Lists", value: deptTaskLists.length, color: "#1D4ED8"},
                        { label: "Open Tasks", value: openTasks, color: "#D97706"},
                        { label: "Blocked", value: blockedTasks, color: "#DC2626"},
                        { label: "Completed", value: completedTasks, color: "#059669"},
                      ].map(m => (
                        <div key={m.label} className="rounded-lg p-2"style={{ background: "var(--rtm-surface)"}}>
                          <div className="text-lg font-black"style={{ color: m.color }}>{m.value}</div>
                          <div className="text-[10px] font-semibold"style={{ color: "var(--rtm-text-muted)"}}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>Owner: <b>{dept.owner}</b></div>
                    {dept.delayReason && (
                      <div className="text-xs mt-1 p-2 rounded-lg"style={{ background: "#FFFBEB", color: "#D97706"}}> {dept.delayReason}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* DEPENDENCIES */}
          {activeTab === "dependencies"&& (
            <div className="flex flex-col gap-3">
              {allDeps.length === 0 && (
                <div className="text-center py-10 text-sm"style={{ color: "var(--rtm-text-muted)"}}>No dependencies defined.</div>
              )}
              {allDeps.map((dep) => (
                <div key={dep.id} className="flex items-center gap-3 p-3 rounded-lg"style={{ background: dep.direction === "blocked-by"? "#FEF2F2": "#FFFBEB", border: `1px solid ${dep.direction === "blocked-by"? "#FECACA": "#FDE68A"}` }}>
                  <span className="text-sm">{dep.direction === "blocked-by"? "": ""}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{dep.taskName}</div>
                    <div className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{dep.type} · {dep.direction}</div>
                  </div>
                  <TaskStatusBadge status={dep.status} />
                </div>
              ))}
            </div>
          )}

          {/* DELIVERY STANDARDS */}
          {activeTab === "standards"&& (
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-secondary)"}}>Delivery Standards (per line item)</div>
              {project.deliveryStandards.map((std, i) => (
                <div key={i} className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="font-bold text-sm mb-3"style={{ color: "var(--rtm-text-primary)"}}>{std.lineItem}</div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: "First Response Standard", value: std.firstResponseStandard },
                      { label: "Target Completion", value: `${std.targetCompletionDays} days` },
                      { label: "Client Update Frequency", value: std.clientUpdateFrequency },
                      { label: "Escalation Rule", value: std.escalationRule },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide w-36 flex-shrink-0 mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.label}</span>
                        <span className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BLOCKERS */}
          {activeTab === "blockers"&& (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-secondary)"}}>Blockers</div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"style={{ background: "#DC2626"}}>+ Add Blocker</button>
                </div>
              </div>
              {project.blockers.length === 0 && (
                <div className="text-center py-10 text-sm"style={{ color: "var(--rtm-text-muted)"}}>No blockers. Project is clear. </div>
              )}
              {project.blockers.map((blk) => (
                <div key={blk.id} className="rounded-xl p-4"style={{ background: blk.resolved ? "#ECFDF5": "#FEF2F2", border: `1px solid ${blk.resolved ? "#A7F3D0": "#FECACA"}` }}>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <span className="font-bold text-sm"style={{ color: blk.resolved ? "#059669": "#DC2626"}}>{blk.type}</span>
                    <div className="flex gap-1.5">
                      {blk.escalated && <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"style={{ background: "#FEF2F2", color: "#DC2626"}}>Escalated</span>}
                      {blk.resolved && <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"style={{ background: "#ECFDF5", color: "#059669"}}>Resolved</span>}
                    </div>
                  </div>
                  <p className="text-xs mb-2"style={{ color: "var(--rtm-text-primary)"}}>{blk.description}</p>
                  <div className="flex items-center gap-4 text-xs mb-3"style={{ color: "var(--rtm-text-muted)"}}>
                    <span>Added: <b>{blk.addedDate}</b></span>
                    <span>Owner: <b>{blk.owner}</b></span>
                  </div>
                  {!blk.resolved && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"style={{ background: "#059669"}}>Resolve</button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border"style={{ borderColor: "#FECACA", color: "#DC2626"}}>Escalate</button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}>Assign Owner</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* EXECUTIVE SUMMARY */}
          {activeTab === "executive"&& (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Project Health", value: <span className="inline-flex items-center gap-1 text-sm font-bold"style={{ color: health.color }}>{project.executiveSummary.projectHealth}</span> },
                  { label: "Launch Risk", value: <span className="text-sm font-bold px-2 py-0.5 rounded-full"style={{ background: RISK_CFG[project.executiveSummary.launchRisk].bg, color: RISK_CFG[project.executiveSummary.launchRisk].color }}>{project.executiveSummary.launchRisk}</span> },
                  { label: "Departments Delayed", value: <span className="text-sm font-black"style={{ color: project.executiveSummary.departmentsDelayed > 0 ? "#DC2626": "#059669"}}>{project.executiveSummary.departmentsDelayed}</span> },
                  { label: "Critical Blockers", value: <span className="text-sm font-black"style={{ color: project.executiveSummary.criticalBlockers > 0 ? "#DC2626": "#059669"}}>{project.executiveSummary.criticalBlockers}</span> },
                  { label: "Expected Completion", value: project.executiveSummary.expectedCompletion },
                  { label: "Revenue Impact", value: project.executiveSummary.revenueImpact },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg p-3"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1"style={{ color: "var(--rtm-text-muted)"}}>{item.label}</div>
                    <div className="text-sm font-medium"style={{ color: "var(--rtm-text-primary)"}}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-4"style={{ background: "#FEF9C3", border: "1px solid #FDE68A"}}>
                <div className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: "#D97706"}}>Next Required Action</div>
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{project.executiveSummary.nextRequiredAction}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-lg p-3"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="text-[10px] font-bold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>Client Impact</div>
                  <p className="text-sm"style={{ color: "var(--rtm-text-primary)"}}>{project.executiveSummary.clientImpact}</p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

//  PROJECT ROW ACTIONS 

function ProjectRowActions({ project, onView }: { project: Project; onView: () => void }) {
  const [open, setOpen] = useState(false);
  const actions = [
    { label: "View Project", icon: "", action: () => { onView(); setOpen(false); } },
    { label: "Edit Project", icon: "", action: () => setOpen(false) },
    { label: "Add Blocker", action: () => setOpen(false) },
    { label: "Update Status", action: () => setOpen(false) },
    { label: "View Client", action: () => setOpen(false) },
    { label: "Export Project", icon: "", action: () => setOpen(false) },
  ];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
        <svg width="16"height="16"viewBox="0 0 24 24"fill="currentColor"><circle cx="12"cy="5"r="2"/><circle cx="12"cy="12"r="2"/><circle cx="12"cy="19"r="2"/></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40"onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-48 rounded-xl shadow-xl bg-white py-1.5"style={{ border: "1px solid var(--rtm-border)"}}>
            {actions.map(a => (
              <button key={a.label} onClick={a.action} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-gray-50 text-left"style={{ color: "var(--rtm-text-primary)"}}>
                <span className="text-base leading-none">{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

//  MAIN PAGE 

type MainView = "portfolio"| "taskqueue";

export default function ProjectsDeliveryEngine() {
  const [mainView, setMainView] = useState<MainView>("portfolio");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<ProjectType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Task queue state
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | "All">("All");
  const [taskTypeFilter, setTaskTypeFilter] = useState<TaskType | "All">("All");

  const allProjectTasks = useMemo(() =>
    PROJECTS.flatMap(p => p.taskLists.flatMap(tl => tl.tasks.map(t => ({ ...t, projectName: p.name, client: p.client, projectId: p.id })))),
    []
  );

  const filteredTasks = useMemo(() => {
    return allProjectTasks.filter(t => {
      if (taskSearch && !t.name.toLowerCase().includes(taskSearch.toLowerCase())) return false;
      if (taskStatusFilter !== "All"&& t.status !== taskStatusFilter) return false;
      if (taskTypeFilter !== "All"&& t.type !== taskTypeFilter) return false;
      return true;
    });
  }, [allProjectTasks, taskSearch, taskStatusFilter, taskTypeFilter]);

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter(p => {
      if (statusFilter !== "All"&& p.status !== statusFilter) return false;
      if (typeFilter !== "All"&& p.projectType !== typeFilter) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.client.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [statusFilter, typeFilter, searchQuery]);

  // KPIs
  const kpis = useMemo(() => {
    const allTasks = PROJECTS.flatMap(p => p.taskLists.flatMap(tl => tl.tasks));
    return {
      totalProjects: PROJECTS.length,
      activeProjects: PROJECTS.filter(p => p.status === "In Progress"|| p.status === "Launched").length,
      blockedProjects: PROJECTS.filter(p => p.status === "Blocked"|| p.status === "Pending Client").length,
      completedProjects: PROJECTS.filter(p => p.status === "Completed").length,
      totalTasks: allTasks.length,
      openTasks: allTasks.filter(t => t.status !== "Completed"&& t.status !== "Cancelled").length,
      blockedTasks: allTasks.filter(t => t.status === "Blocked").length,
      totalBlockers: PROJECTS.flatMap(p => p.blockers).filter(b => !b.resolved).length,
    };
  }, []);

  const ALL_PROJECT_STATUSES: (ProjectStatus | "All")[] = ["All", "Draft", "Ready to Launch", "Launched", "In Progress", "Blocked", "Pending Client", "Pending Department", "Completed", "Cancelled"];
  const ALL_PROJECT_TYPES: (ProjectType | "All")[] = ["All", "SEO Only", "SEO + GBP", "PPC + Landing Page", "Full Service", "Reporting Only", "Website Build", "AI Automation", "Upsell", "Renewal", "Custom"];
  const ALL_TASK_STATUSES: (TaskStatus | "All")[] = ["All", "Open", "In Progress", "Waiting", "Blocked", "Review", "Completed", "Cancelled"];
  const ALL_TASK_TYPES: (TaskType | "All")[] = ["All", "One-Time", "Recurring", "Milestone", "Approval", "Review", "Renewal", "Offboarding"];

  return (
    <div className="flex flex-col min-h-screen"style={{ background: "var(--rtm-bg)"}}>
      {/*  PAGE HEADER  */}
      <div className="px-6 pt-6 pb-4"style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)"}}>
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                
                <h1 className="text-2xl font-black"style={{ color: "var(--rtm-text-primary)"}}>Projects & Delivery Engine</h1>
              </div>
              <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>
                Manage client projects, milestones, task lists, department assignments, delivery standards, blockers, and completion tracking.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90"style={{ background: "var(--rtm-blue)"}}>
                + New Project
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border hover:bg-gray-50"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}>
                 Export
              </button>
            </div>
          </div>

          {/* Module quick links */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { label: "Task Blueprints", href: "/tasks/templates", color: "#1D4ED8", bg: "#EFF6FF"},
              { label: "Collaboration Hub", href: "/tasks/collaboration", color: "#059669", bg: "#ECFDF5"},
              { label: "Activation Rules", href: "/tasks/activation-rules", color: "#D97706", bg: "#FFFBEB"},
              { label: "Activation Engine", href: "/tasks/activation-engine", color: "#7C3AED", bg: "#FAF5FF"},
              { label: "Department Activation", href: "/tasks/department-activation", color: "#6D28D9", bg: "#F5F3FF"},
              { label: "Workload Planning", href: "/tasks/workload-planning", color: "#0891B2", bg: "#ECFEFF"},
              { label: "Analytics", href: "/tasks/analytics", color: "#C2410C", bg: "#FFF7ED"},
            ].map(m => (
              <Link key={m.href} href={m.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:opacity-80 transition-opacity"style={{ background: m.bg, color: m.color, borderColor: "transparent"}}>
{m.label}
              </Link>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-1">
            {[
              { id: "portfolio"as MainView, label: "Project Portfolio", desc: "Main view"},
              { id: "taskqueue"as MainView, label: "≡ Task Queue", desc: "Secondary view"},
            ].map(v => (
              <button key={v.id} onClick={() => setMainView(v.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-semibold transition-all"style={{
                  color: mainView === v.id ? "var(--rtm-blue)": "var(--rtm-text-secondary)",
                  background: mainView === v.id ? "var(--rtm-blue-xlight)": "transparent",
                  borderBottom: mainView === v.id ? "2px solid var(--rtm-blue)": "2px solid transparent",
                }}>
                {v.label}
                {v.id === "portfolio"&& (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white"style={{ background: "var(--rtm-blue)"}}>Primary</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/*  MAIN CONTENT  */}
      <div className="flex-1 px-6 py-5 max-w-[1600px] mx-auto w-full">

        {/*  KPI CARDS  */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          <KpiCard label="Total Projects"value={kpis.totalProjects}sub="All projects"/>
          <KpiCard label="Active"value={kpis.activeProjects}sub="In Progress / Launched"/>
          <KpiCard label="Blocked / Pending"value={kpis.blockedProjects}sub="Needs attention"/>
          <KpiCard label="Completed"value={kpis.completedProjects}sub="Delivered"/>
          <KpiCard label="Total Tasks"value={kpis.totalTasks}sub="Across all projects"/>
          <KpiCard label="Open Tasks"value={kpis.openTasks}sub="Active work"/>
          <KpiCard label="Blocked Tasks"value={kpis.blockedTasks}sub="Need unblocking"/>
          <KpiCard label="Open Blockers"value={kpis.totalBlockers}sub="Project blockers"/>
        </div>

        {/*  PROJECT PORTFOLIO  */}
        {mainView === "portfolio"&& (
          <div className="flex flex-col gap-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2"width="14"height="14"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"style={{ color: "var(--rtm-text-muted)"}}><circle cx="11"cy="11"r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search projects, clients..."className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)"}} />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold"style={{ color: "var(--rtm-text-secondary)"}}>Status:</span>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ProjectStatus | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)"}}>
                  {ALL_PROJECT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold"style={{ color: "var(--rtm-text-secondary)"}}>Type:</span>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as ProjectType | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)"}}>
                  {ALL_PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <span className="text-xs font-semibold ml-auto"style={{ color: "var(--rtm-text-muted)"}}>
                {filteredProjects.length} of {PROJECTS.length} projects
              </span>
            </div>

            {/* Project Portfolio Table */}
            <div className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1400px]">
                  <thead>
                    <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                      {["Project", "Client", "Type", "AM", "Owner", "Line Items", "Depts", "Milestones", "Open Tasks", "Blockers", "Target Launch", "Status", "Health", "Actions"].map(col => (
                        <th key={col} className="px-3 py-3 text-left text-[11px] font-black uppercase tracking-wider"style={{ color: "var(--rtm-text-secondary)"}}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project, i) => {
                      const allTasks = project.taskLists.flatMap(tl => tl.tasks);
                      const openTasks = allTasks.filter(t => t.status !== "Completed"&& t.status !== "Cancelled").length;
                      const openBlockers = project.blockers.filter(b => !b.resolved).length;
                      const health = HEALTH_CFG[project.executiveSummary.projectHealth];
                      return (
                        <tr key={project.id} className="hover:bg-blue-50/30 transition-colors"style={{ borderBottom: i < filteredProjects.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}>
                          <td className="px-3 py-3 max-w-[200px]">
                            <button onClick={() => setSelectedProject(project)} className="font-semibold text-left hover:underline leading-snug"style={{ color: "var(--rtm-blue)"}}>
                              {project.name}
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            <Link href={`/clients/${project.clientSlug}`} className="text-xs font-medium hover:underline" style={{ color: "var(--rtm-text-primary)" }}>
                              {project.client}
                            </Link>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"}}>
                              {project.projectType}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <Avatar name={project.accountManager} />
                              <span className="text-xs">{project.accountManager.split("")[0]}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{project.projectOwner.split("")[0]}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded"style={{ background: "#EFF6FF", color: "var(--rtm-blue)"}}>
                              {project.lineItemsSold.length} items
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{project.departmentsInvolved.length}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{project.milestones.length}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs font-bold"style={{ color: openTasks > 0 ? "#D97706": "#059669"}}>{openTasks}</span>
                          </td>
                          <td className="px-3 py-3">
                            <BlockerBadge count={openBlockers} />
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{project.targetLaunchDate}</span>
                          </td>
                          <td className="px-3 py-3">
                            <ProjectStatusBadge status={project.status} />
                          </td>
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"style={{ background: health.bg, color: health.color }}>{project.executiveSummary.projectHealth}</span>
                          </td>
                          <td className="px-3 py-3">
                            <ProjectRowActions project={project} onView={() => setSelectedProject(project)} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredProjects.length === 0 && (
                  <div className="text-center py-16"style={{ color: "var(--rtm-text-muted)"}}>
                    
                    <p className="text-sm font-medium">No projects match your filters.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Flow Banner */}
            <div className="rounded-xl p-5"style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE"}}>
              <div className="flex items-center gap-2 mb-3">
                
                <h3 className="text-sm font-black"style={{ color: "var(--rtm-text-primary)"}}>Primary Delivery Flow</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {["Contract Signed", "Invoice Paid", "Activation Engine", "Project Created", "Milestones Created", "Task Lists Generated", "Department Tasks Assigned", "AM Monitors Project", "Dept Heads Monitor Delivery", "Project Completed"].map((step, i, arr) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"style={{ background: "white", color: "var(--rtm-blue)", border: "1px solid #BFDBFE"}}>
                      {step}
                    </span>
                    {i < arr.length - 1 && <span className="text-xs"style={{ color: "var(--rtm-blue)"}}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Visibility Grid */}
            <div className="rounded-xl p-5"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
              <h3 className="text-sm font-black mb-4"style={{ color: "var(--rtm-text-primary)"}}> Project Visibility Rules</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {([
                  { role: "Account Managers"as VisibilityRole, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", items: ["Full project view", "All departments", "Milestones & dependencies", "Blockers & escalations", "Client communication", "Project health"] },
                  { role: "Department Heads"as VisibilityRole, color: "#7C3AED", bg: "#FAF5FF", border: "#DDD6FE", items: ["Full project overview", "Delay reasons", "Cross-dept dependencies", "Blockers & escalations", "Executive summary", "Department work"] },
                  { role: "Department Specialists"as VisibilityRole, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", items: ["Assigned task lists", "Assigned tasks", "Own deliverables", "Blockers on own tasks"] },
                  { role: "Executives"as VisibilityRole, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", items: ["Portfolio status", "Risks & delays", "Dept bottlenecks", "Revenue impact", "Client impact"] },
                ] as Array<{ role: VisibilityRole; icon?: string; color?: string; bg?: string; border: string; items: string[] }>).map(v => (
                  <div key={v.role} className="rounded-xl p-4"style={{ background: v.bg, border: `1px solid ${v.border}` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{v.icon}</span>
                      <span className="text-xs font-extrabold"style={{ color: v.color }}>{v.role}</span>
                    </div>
                    <ul className="flex flex-col gap-1">
                      {v.items.map(item => (
                        <li key={item} className="flex items-center gap-1.5 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: v.color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/*  TASK QUEUE (SECONDARY)  */}
        {mainView === "taskqueue"&& (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-4"style={{ background: "#FFFBEB", border: "1px solid #FDE68A"}}>
              <div className="flex items-center gap-2">
                <span>ℹ</span>
                <p className="text-xs font-semibold"style={{ color: "#D97706"}}>
                  Task Queue is a secondary view. Tasks belong to projects. Switch to Project Portfolio for the primary delivery view.
                </p>
              </div>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2"width="14"height="14"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"style={{ color: "var(--rtm-text-muted)"}}><circle cx="11"cy="11"r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input value={taskSearch} onChange={e => setTaskSearch(e.target.value)} placeholder="Search tasks..."className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)"}} />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold"style={{ color: "var(--rtm-text-secondary)"}}>Status:</span>
                <select value={taskStatusFilter} onChange={e => setTaskStatusFilter(e.target.value as TaskStatus | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)"}}>
                  {ALL_TASK_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold"style={{ color: "var(--rtm-text-secondary)"}}>Type:</span>
                <select value={taskTypeFilter} onChange={e => setTaskTypeFilter(e.target.value as TaskType | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)"}}>
                  {ALL_TASK_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <span className="text-xs font-semibold ml-auto"style={{ color: "var(--rtm-text-muted)"}}>
                {filteredTasks.length} tasks across {PROJECTS.length} projects
              </span>
            </div>

            <div className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead>
                    <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                      {["Task Name", "Project", "Client", "Type", "Primary Assignee", "Priority", "Status", "Due Date", "Deps"].map(col => (
                        <th key={col} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"style={{ color: "var(--rtm-text-secondary)"}}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task, i) => (
                      <tr key={task.id} className="hover:bg-blue-50/30 transition-colors"style={{ borderBottom: i < filteredTasks.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}>
                        <td className="px-4 py-3 max-w-[220px]">
                          <div>
                            <span className="font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{task.name}</span>
                            {task.recurringRule && (
                              <div className="text-[10px] font-bold"style={{ color: "#0E7490"}}> {task.recurringRule}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => { const p = PROJECTS.find(pr => pr.id === task.projectId); if (p) setSelectedProject(p); setMainView("portfolio"); }}
                            className="text-xs font-medium hover:underline"style={{ color: "var(--rtm-blue)"}}>
                            {task.projectName}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{task.client}</td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] px-1.5 py-0.5 rounded font-semibold"style={{ background: "#FAF5FF", color: "#7C3AED"}}>{task.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Avatar name={task.primaryAssignee} />
                            <span className="text-xs">{task.primaryAssignee.split("")[0]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                        <td className="px-4 py-3"><TaskStatusBadge status={task.status} /></td>
                        <td className="px-4 py-3 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{task.dueDate}</td>
                        <td className="px-4 py-3"><DependencyBadge count={task.dependencies.length} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTasks.length === 0 && (
                  <div className="text-center py-16"style={{ color: "var(--rtm-text-muted)"}}>
                    
                    <p className="text-sm font-medium">No tasks match your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/*  PROJECT DETAIL DRAWER  */}
      {selectedProject && (
        <ProjectDetailDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
