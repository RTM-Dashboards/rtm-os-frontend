"use client";

import { useState } from "react";
import { KpiCard, StatusBadge } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";

// 
// RTM OS — Dynamic Department Workspace Architecture
// Foundational configuration module. No code changes required to add new
// departments, roles, KPIs, integrations, dashboards, or permissions.
// 

//  Department Types 

type DepartmentType = "Core"| "Service"| "Support"| "Executive";
type DeptStatus = "Active"| "Inactive"| "Pending Setup"| "Archived";

//  Project Visibility Levels 

type ProjectVisibilityLevel = 1 | 2 | 3 | 4 | 5;

interface ProjectVisibilityConfig {
  level: ProjectVisibilityLevel;
  label: string;
  description: string;
  canViewAssignedTasksOnly: boolean;
  canViewDepartmentTasks: boolean;
  canViewDepartmentProjects: boolean;
  canViewFullProject: boolean;
  canViewPortfolio: boolean;
}

const PROJECT_VISIBILITY_LEVELS: ProjectVisibilityConfig[] = [
  {
    level: 1,
    label: "Assigned Tasks Only",
    description: "User sees only tasks directly assigned to them.",
    canViewAssignedTasksOnly: true,
    canViewDepartmentTasks: false,
    canViewDepartmentProjects: false,
    canViewFullProject: false,
    canViewPortfolio: false,
  },
  {
    level: 2,
    label: "Department Tasks",
    description: "User sees all tasks within their department.",
    canViewAssignedTasksOnly: true,
    canViewDepartmentTasks: true,
    canViewDepartmentProjects: false,
    canViewFullProject: false,
    canViewPortfolio: false,
  },
  {
    level: 3,
    label: "Department Projects",
    description: "User sees all projects belonging to their department.",
    canViewAssignedTasksOnly: true,
    canViewDepartmentTasks: true,
    canViewDepartmentProjects: true,
    canViewFullProject: false,
    canViewPortfolio: false,
  },
  {
    level: 4,
    label: "Full Project Visibility",
    description: "User sees the entire project including all departments and dependencies.",
    canViewAssignedTasksOnly: true,
    canViewDepartmentTasks: true,
    canViewDepartmentProjects: true,
    canViewFullProject: true,
    canViewPortfolio: false,
  },
  {
    level: 5,
    label: "Portfolio Visibility",
    description: "User sees all projects across all clients and departments.",
    canViewAssignedTasksOnly: true,
    canViewDepartmentTasks: true,
    canViewDepartmentProjects: true,
    canViewFullProject: true,
    canViewPortfolio: true,
  },
];

//  Role 

interface Role {
  id: string;
  name: string;
  description: string;
  projectVisibilityLevel: ProjectVisibilityLevel;
  // Permissions
  canApproveWork: boolean;
  canManageTasks: boolean;
  canManageTemplates: boolean;
  canViewFinance: boolean;
  canViewClients: boolean;
  canManageUsers: boolean;
  canConfigureDashboard: boolean;
  canManageDeliveryStandards: boolean;
  canViewReports: boolean;
  canManageIntegrations: boolean;
  // Access
  dashboardAccess: boolean;
  projectAccess: boolean;
  taskAccess: boolean;
  reportingAccess: boolean;
  status: "Active"| "Inactive";
}

//  KPI 

type MetricType = "Number"| "Percentage"| "Currency"| "Duration"| "Count";
type ReportingFrequency = "Daily"| "Weekly"| "Monthly"| "Quarterly";

interface KPI {
  id: string;
  name: string;
  metricType: MetricType;
  target: string;
  warningThreshold: string;
  criticalThreshold: string;
  dataSource: string;
  reportingFrequency: ReportingFrequency;
  dashboardVisible: boolean;
  status: "Active"| "Inactive";
}

//  Integration 

type IntegrationCategory =
  | "CRM"| "Analytics"| "SEO"| "Paid Advertising"| "AI / Automation"| "Communication"| "Reporting"| "Finance"| "Project Management"| "Other";

type IntegrationRole = "Primary System"| "Required"| "Optional"| "Reporting Only";

interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  role: IntegrationRole;
  status: "Connected"| "Disconnected"| "Pending"| "Error";
  lastSync: string;
}

//  Dashboard Config 

interface DashboardConfig {
  enabled: boolean;
  route: string;
  widgets: string[];
  metrics: string[];
  filters: string[];
  queueViewEnabled: boolean;
  projectViewEnabled: boolean;
  taskViewEnabled: boolean;
  reportingViewEnabled: boolean;
  clientViewEnabled: boolean;
}

//  Delivery Standards 

interface DeliveryStandards {
  note: string;
  firstResponseDays: number;
  targetCompletionDays: number;
  escalationAfterDays: number;
  overdueThresholdDays: number;
  priorityRules: string;
}

//  Queue Settings 

interface QueueSettings {
  queueName: string;
  queueOwner: string;
  backupOwner: string;
  status: "Active"| "Inactive";
  defaultPriority: "Critical"| "High"| "Medium"| "Low";
  autoAssignRule: string;
}

//  Project Module Config 

interface ProjectModuleConfig {
  canLaunchProjects: boolean;
  canManageProjects: boolean;
  canViewProjects: boolean;
  canViewPortfolio: boolean;
  canManageMilestones: boolean;
  canManageTaskLists: boolean;
  canManageTasks: boolean;
}

//  Task Blueprint Mapping 

interface TaskBlueprintMapping {
  id: string;
  name: string;
  type:
    | "Task Blueprint"| "Recurring Task Blueprint"| "Approval Blueprint"| "Review Blueprint"| "Renewal Blueprint"| "Offboarding Blueprint";
  steps: number;
  status: "Active"| "Inactive";
}

//  Reporting Sources 

interface ReportingSource {
  id: string;
  name: string;
  system: string;
  dataType: string;
  enabled: boolean;
}

//  Access Profile (for special role types) 

interface AccessProfile {
  label: string;
  description: string;
  canViewItems: string[];
}

const ACCOUNT_MANAGER_ACCESS: AccessProfile = {
  label: "Account Manager Access",
  description:
    "Account Managers have cross-department project visibility to serve clients effectively.",
  canViewItems: [
    "Entire Project",
    "Milestones",
    "Task Lists",
    "Tasks",
    "Departments",
    "Dependencies",
    "Client Communication",
    "Project Health",
  ],
};

const DEPARTMENT_HEAD_ACCESS: AccessProfile = {
  label: "Department Head Access",
  description:
    "Department Heads have read-heavy access to manage delivery expectations and executive visibility.",
  canViewItems: [
    "Entire Project Overview",
    "Cross-Department Dependencies",
    "Milestones",
    "Delay Reasons",
    "Blocked Items",
    "Project Timeline",
    "Executive Summary",
    "Department Work",
    "Risk Indicators",
    "Escalations",
  ],
};

const EXECUTIVE_ACCESS: AccessProfile = {
  label: "Executive Access",
  description:
    "Executives have portfolio-wide access for strategic oversight and business intelligence.",
  canViewItems: [
    "All Projects",
    "Portfolio Status",
    "Project Risks",
    "Revenue Impact",
    "Department Bottlenecks",
    "Renewals",
    "Client Health",
    "Executive Dashboards",
  ],
};

//  Activity Entry 

interface ActivityEntry {
  date: string;
  user: string;
  action: string;
}

//  Department 

interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  departmentType: DepartmentType;
  manager: string;
  backupManager: string;
  status: DeptStatus;
  createdDate: string;
  lastUpdated: string;
  usersCount: number;
  roles: Role[];
  kpis: KPI[];
  integrations: Integration[];
  dashboard: DashboardConfig;
  deliveryStandards: DeliveryStandards;
  queue: QueueSettings;
  projectModule: ProjectModuleConfig;
  blueprints: TaskBlueprintMapping[];
  reportingSources: ReportingSource[];
  notes: string;
  activity: ActivityEntry[];
}

// 
// MOCK DATA — 15 Departments
// 

const MOCK_DEPARTMENTS: Department[] = [
  //  CORE: Sales 
  {
    id: "dept-sales",
    name: "Sales",
    slug: "sales",
    description: "New business development, pipeline management, and lead conversion.",
    departmentType: "Core",
    manager: "Jordan M.",
    backupManager: "Sarah K.",
    status: "Active",
    createdDate: "2022-01-10",
    lastUpdated: "2024-11-15",
    usersCount: 5,
    roles: [
      {
        id: "r-sales-1",
        name: "Department Head",
        description: "Leads sales strategy and oversees team performance.",
        projectVisibilityLevel: 4,
        canApproveWork: true,
        canManageTasks: true,
        canManageTemplates: true,
        canViewFinance: true,
        canViewClients: true,
        canManageUsers: true,
        canConfigureDashboard: true,
        canManageDeliveryStandards: true,
        canViewReports: true,
        canManageIntegrations: true,
        dashboardAccess: true,
        projectAccess: true,
        taskAccess: true,
        reportingAccess: true,
        status: "Active",
      },
      {
        id: "r-sales-2",
        name: "Account Executive",
        description: "Closes new deals and manages the sales pipeline.",
        projectVisibilityLevel: 3,
        canApproveWork: false,
        canManageTasks: true,
        canManageTemplates: false,
        canViewFinance: false,
        canViewClients: true,
        canManageUsers: false,
        canConfigureDashboard: false,
        canManageDeliveryStandards: false,
        canViewReports: true,
        canManageIntegrations: false,
        dashboardAccess: true,
        projectAccess: true,
        taskAccess: true,
        reportingAccess: true,
        status: "Active",
      },
      {
        id: "r-sales-3",
        name: "SDR",
        description: "Qualifies inbound and outbound leads.",
        projectVisibilityLevel: 1,
        canApproveWork: false,
        canManageTasks: false,
        canManageTemplates: false,
        canViewFinance: false,
        canViewClients: true,
        canManageUsers: false,
        canConfigureDashboard: false,
        canManageDeliveryStandards: false,
        canViewReports: false,
        canManageIntegrations: false,
        dashboardAccess: true,
        projectAccess: false,
        taskAccess: true,
        reportingAccess: false,
        status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-s1", name: "Pipeline Value", metricType: "Currency", target: "$500,000", warningThreshold: "$300,000", criticalThreshold: "$150,000", dataSource: "GoHighLevel", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-s2", name: "Close Rate", metricType: "Percentage", target: "25%", warningThreshold: "15%", criticalThreshold: "8%", dataSource: "GoHighLevel", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-s3", name: "Calls Booked", metricType: "Count", target: "40/mo", warningThreshold: "25/mo", criticalThreshold: "10/mo", dataSource: "GoHighLevel", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-s4", name: "New MRR", metricType: "Currency", target: "$25,000/mo", warningThreshold: "$12,000/mo", criticalThreshold: "$5,000/mo", dataSource: "GoHighLevel", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-s1", name: "GoHighLevel", category: "CRM", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-s2", name: "Twilio", category: "Communication", role: "Required", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-s3", name: "Stripe", category: "Finance", role: "Optional", status: "Connected", lastSync: "2024-12-12"},
    ],
    dashboard: {
      enabled: true,
      route: "/departments/sales",
      widgets: ["Pipeline", "Leads", "Close Rate", "New MRR", "Calls Booked"],
      metrics: ["MRR", "Close Rate", "Pipeline Value", "Calls Booked"],
      filters: ["Status: Open", "Assigned To: Me"],
      queueViewEnabled: true,
      projectViewEnabled: true,
      taskViewEnabled: true,
      reportingViewEnabled: true,
      clientViewEnabled: true,
    },
    deliveryStandards: {
      note: "Fallback only. Line item delivery standards take priority.",
      firstResponseDays: 1,
      targetCompletionDays: 3,
      escalationAfterDays: 2,
      overdueThresholdDays: 1,
      priorityRules: "New inbound leads receive Critical priority. Proposals within 24h.",
    },
    queue: { queueName: "Sales Queue", queueOwner: "Jordan M.", backupOwner: "Sarah K.", status: "Active", defaultPriority: "High", autoAssignRule: "Round-robin by AE"},
    projectModule: { canLaunchProjects: false, canManageProjects: false, canViewProjects: true, canViewPortfolio: false, canManageMilestones: false, canManageTaskLists: false, canManageTasks: true },
    blueprints: [
      { id: "bp-s1", name: "New Lead Onboarding", type: "Task Blueprint", steps: 8, status: "Active"},
      { id: "bp-s2", name: "Proposal Delivery", type: "Task Blueprint", steps: 5, status: "Active"},
      { id: "bp-s3", name: "Client Renewal Outreach", type: "Renewal Blueprint", steps: 6, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-s1", name: "GoHighLevel CRM", system: "GoHighLevel", dataType: "Pipeline & Lead Data", enabled: true },
      { id: "rs-s2", name: "Call Tracking", system: "Twilio", dataType: "Call Volume & Duration", enabled: true },
    ],
    notes: "Primary CRM is GoHighLevel. All lead data and pipeline management flows through GHL.",
    activity: [
      { date: "2024-11-15", user: "Admin", action: "Updated delivery standards"},
      { date: "2024-10-01", user: "Jordan M.", action: "Added SDR role"},
      { date: "2024-09-10", user: "Admin", action: "Configured GoHighLevel integration"},
    ],
  },

  //  CORE: Billing 
  {
    id: "dept-billing",
    name: "Billing",
    slug: "billing",
    description: "Invoice management, collections, payment processing, and financial tracking.",
    departmentType: "Core",
    manager: "Lisa P.",
    backupManager: "Mike T.",
    status: "Active",
    createdDate: "2022-01-10",
    lastUpdated: "2024-12-01",
    usersCount: 3,
    roles: [
      {
        id: "r-b1", name: "Department Head", description: "Oversees all billing operations and financial compliance.", projectVisibilityLevel: 4,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: true, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-b2", name: "Billing Coordinator", description: "Processes invoices and follows up on overdue accounts.", projectVisibilityLevel: 2,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: true, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: true, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: false, taskAccess: true, reportingAccess: true, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-b1", name: "MRR", metricType: "Currency", target: "$200,000", warningThreshold: "$150,000", criticalThreshold: "$100,000", dataSource: "Stripe", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-b2", name: "Overdue Invoices", metricType: "Count", target: "0", warningThreshold: "5", criticalThreshold: "15", dataSource: "QuickBooks", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-b3", name: "Collection Rate", metricType: "Percentage", target: "98%", warningThreshold: "90%", criticalThreshold: "80%", dataSource: "Stripe", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-b1", name: "Stripe", category: "Finance", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-b2", name: "QuickBooks", category: "Finance", role: "Required", status: "Connected", lastSync: "2024-12-13"},
      { id: "int-b3", name: "GoHighLevel", category: "CRM", role: "Reporting Only", status: "Connected", lastSync: "2024-12-14"},
    ],
    dashboard: {
      enabled: true, route: "/departments/billing",
      widgets: ["MRR", "Overdue Invoices", "Collections", "Churn Revenue"],
      metrics: ["MRR", "Overdue Amount", "Collection Rate"],
      filters: ["Status: Unpaid", "Due: Overdue"],
      queueViewEnabled: true, projectViewEnabled: false, taskViewEnabled: true, reportingViewEnabled: true, clientViewEnabled: true,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 2, escalationAfterDays: 1, overdueThresholdDays: 1, priorityRules: "Overdue invoices escalate to Critical automatically."},
    queue: { queueName: "Billing Queue", queueOwner: "Lisa P.", backupOwner: "Mike T.", status: "Active", defaultPriority: "High", autoAssignRule: "Assign to Billing Coordinator"},
    projectModule: { canLaunchProjects: false, canManageProjects: false, canViewProjects: false, canViewPortfolio: false, canManageMilestones: false, canManageTaskLists: false, canManageTasks: true },
    blueprints: [
      { id: "bp-b1", name: "New Client Billing Setup", type: "Task Blueprint", steps: 5, status: "Active"},
      { id: "bp-b2", name: "Contract Renewal Billing", type: "Renewal Blueprint", steps: 4, status: "Active"},
      { id: "bp-b3", name: "Client Offboarding Billing", type: "Offboarding Blueprint", steps: 6, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-b1", name: "Stripe Revenue", system: "Stripe", dataType: "Payments & Subscriptions", enabled: true },
      { id: "rs-b2", name: "QuickBooks Ledger", system: "QuickBooks", dataType: "Invoices & Expenses", enabled: true },
    ],
    notes: "Integrated with Stripe for subscriptions and QuickBooks for accounting.",
    activity: [{ date: "2024-12-01", user: "Lisa P.", action: "Updated billing blueprints"}],
  },

  //  CORE: Account Management 
  {
    id: "dept-am",
    name: "Account Management",
    slug: "account-management",
    description: "Client retention, health management, NPS, and relationship building.",
    departmentType: "Core",
    manager: "Sarah K.",
    backupManager: "Alex R.",
    status: "Active",
    createdDate: "2022-01-10",
    lastUpdated: "2024-11-20",
    usersCount: 7,
    roles: [
      {
        id: "r-am1", name: "Department Head", description: "Leads AM strategy and oversees client health.", projectVisibilityLevel: 4,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: true, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-am2", name: "Account Manager", description: "Day-to-day client management and project oversight.", projectVisibilityLevel: 4,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: true, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-am3", name: "Coordinator", description: "Supports the AM team with admin and scheduling.", projectVisibilityLevel: 2,
        canApproveWork: false, canManageTasks: false, canManageTemplates: false, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: false, taskAccess: true, reportingAccess: false, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-am1", name: "Client Health Score", metricType: "Number", target: "85+", warningThreshold: "70", criticalThreshold: "55", dataSource: "RTM OS", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-am2", name: "Churn Rate", metricType: "Percentage", target: "<2%", warningThreshold: "4%", criticalThreshold: "8%", dataSource: "RTM OS", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-am3", name: "NPS Score", metricType: "Number", target: "60+", warningThreshold: "40", criticalThreshold: "20", dataSource: "GoHighLevel", reportingFrequency: "Quarterly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-am1", name: "GoHighLevel", category: "CRM", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-am2", name: "Slack", category: "Communication", role: "Optional", status: "Connected", lastSync: "2024-12-14"},
    ],
    dashboard: {
      enabled: true, route: "/departments/account-management",
      widgets: ["Client Health", "NPS", "Churn Risk", "At-Risk Accounts", "Renewals Due"],
      metrics: ["Client Health Score", "Churn Rate", "NPS"],
      filters: ["Status: Active", "Health: At-Risk"],
      queueViewEnabled: true, projectViewEnabled: true, taskViewEnabled: true, reportingViewEnabled: true, clientViewEnabled: true,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 5, escalationAfterDays: 3, overdueThresholdDays: 2, priorityRules: "At-risk clients flagged as High priority."},
    queue: { queueName: "AM Queue", queueOwner: "Sarah K.", backupOwner: "Alex R.", status: "Active", defaultPriority: "Medium", autoAssignRule: "Assign by book of business"},
    projectModule: { canLaunchProjects: false, canManageProjects: false, canViewProjects: true, canViewPortfolio: true, canManageMilestones: false, canManageTaskLists: false, canManageTasks: true },
    blueprints: [
      { id: "bp-am1", name: "New Client Onboarding", type: "Task Blueprint", steps: 12, status: "Active"},
      { id: "bp-am2", name: "Client QBR", type: "Recurring Task Blueprint", steps: 6, status: "Active"},
      { id: "bp-am3", name: "Client Renewal Review", type: "Renewal Blueprint", steps: 5, status: "Active"},
      { id: "bp-am4", name: "Client Offboarding", type: "Offboarding Blueprint", steps: 8, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-am1", name: "GoHighLevel CRM", system: "GoHighLevel", dataType: "Client Records & Communications", enabled: true },
      { id: "rs-am2", name: "RTM OS Health Score", system: "RTM OS", dataType: "Project Health & Status", enabled: true },
    ],
    notes: "Primary client-facing department. All escalations route through Account Management.",
    activity: [
      { date: "2024-11-20", user: "Sarah K.", action: "Added Coordinator role"},
      { date: "2024-10-15", user: "Admin", action: "Updated client health KPI thresholds"},
    ],
  },

  //  CORE: IT & Security 
  {
    id: "dept-it",
    name: "IT & Security",
    slug: "it-security",
    description: "Internal IT infrastructure, tool administration, security policies, and access management.",
    departmentType: "Core",
    manager: "Chris D.",
    backupManager: "Jordan M.",
    status: "Active",
    createdDate: "2022-02-01",
    lastUpdated: "2024-12-01",
    usersCount: 2,
    roles: [
      {
        id: "r-it1", name: "IT Administrator", description: "Manages all tools, access, and security policies.", projectVisibilityLevel: 5,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: false, canViewClients: false, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-it1", name: "System Uptime", metricType: "Percentage", target: "99.9%", warningThreshold: "99%", criticalThreshold: "95%", dataSource: "Internal Monitoring", reportingFrequency: "Daily", dashboardVisible: true, status: "Active"},
      { id: "kpi-it2", name: "Open Security Issues", metricType: "Count", target: "0", warningThreshold: "2", criticalThreshold: "5", dataSource: "Internal", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-it1", name: "1Password", category: "Other", role: "Required", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-it2", name: "Google Workspace", category: "Other", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
    ],
    dashboard: {
      enabled: true, route: "/departments/it-security",
      widgets: ["System Health", "Open Tickets", "Security Alerts", "Access Requests"],
      metrics: ["Uptime", "Open Security Issues", "Pending Access Requests"],
      filters: ["Status: Open"],
      queueViewEnabled: true, projectViewEnabled: false, taskViewEnabled: true, reportingViewEnabled: true, clientViewEnabled: false,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 3, escalationAfterDays: 1, overdueThresholdDays: 1, priorityRules: "Security incidents get Critical immediately."},
    queue: { queueName: "IT Queue", queueOwner: "Chris D.", backupOwner: "Jordan M.", status: "Active", defaultPriority: "Medium", autoAssignRule: "Assign to IT Administrator"},
    projectModule: { canLaunchProjects: false, canManageProjects: false, canViewProjects: false, canViewPortfolio: false, canManageMilestones: false, canManageTaskLists: false, canManageTasks: true },
    blueprints: [
      { id: "bp-it1", name: "New User Onboarding", type: "Task Blueprint", steps: 7, status: "Active"},
      { id: "bp-it2", name: "User Offboarding", type: "Offboarding Blueprint", steps: 9, status: "Active"},
      { id: "bp-it3", name: "Security Audit", type: "Recurring Task Blueprint", steps: 12, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-it1", name: "Google Workspace Admin", system: "Google Workspace", dataType: "User & Access Logs", enabled: true },
    ],
    notes: "Manages all tool provisioning, de-provisioning, and internal security reviews.",
    activity: [{ date: "2024-12-01", user: "Chris D.", action: "Added security audit blueprint"}],
  },

  //  SERVICE: SEO 
  {
    id: "dept-seo",
    name: "SEO",
    slug: "seo",
    description: "Organic search strategy, on-page optimization, technical SEO, and content delivery.",
    departmentType: "Service",
    manager: "Alex R.",
    backupManager: "Chris D.",
    status: "Active",
    createdDate: "2022-03-01",
    lastUpdated: "2024-12-05",
    usersCount: 6,
    roles: [
      {
        id: "r-seo1", name: "Department Head", description: "Owns SEO strategy and team delivery.", projectVisibilityLevel: 4,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: false, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-seo2", name: "Strategist", description: "Designs SEO roadmaps and audits.", projectVisibilityLevel: 3,
        canApproveWork: false, canManageTasks: true, canManageTemplates: true, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: true, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-seo3", name: "Specialist", description: "Executes on-page and off-page SEO tasks.", projectVisibilityLevel: 2,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: false, status: "Active",
      },
      {
        id: "r-seo4", name: "Reviewer", description: "QA reviews deliverables before client delivery.", projectVisibilityLevel: 3,
        canApproveWork: true, canManageTasks: false, canManageTemplates: false, canViewFinance: false, canViewClients: false, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: false, projectAccess: true, taskAccess: true, reportingAccess: false, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-seo1", name: "Organic Traffic Growth", metricType: "Percentage", target: "+15%/mo", warningThreshold: "+5%/mo", criticalThreshold: "0%/mo", dataSource: "GA4", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-seo2", name: "Keyword Movements (Top 10)", metricType: "Count", target: "+10/mo", warningThreshold: "+3/mo", criticalThreshold: "0/mo", dataSource: "SEMrush", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-seo3", name: "Reports Delivered On Time", metricType: "Percentage", target: "100%", warningThreshold: "90%", criticalThreshold: "75%", dataSource: "RTM OS", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-seo1", name: "Google Search Console", category: "Analytics", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-seo2", name: "GA4", category: "Analytics", role: "Required", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-seo3", name: "SEMrush", category: "SEO", role: "Required", status: "Connected", lastSync: "2024-12-13"},
      { id: "int-seo4", name: "Ahrefs", category: "SEO", role: "Optional", status: "Connected", lastSync: "2024-12-10"},
    ],
    dashboard: {
      enabled: true, route: "/departments/seo",
      widgets: ["Rankings Overview", "Traffic Trends", "Keyword Movers", "Deliverables Queue"],
      metrics: ["Organic Traffic", "Top 10 Keywords", "On-Time Delivery"],
      filters: ["Status: Active", "Client: All"],
      queueViewEnabled: true, projectViewEnabled: true, taskViewEnabled: true, reportingViewEnabled: true, clientViewEnabled: true,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 5, escalationAfterDays: 2, overdueThresholdDays: 2, priorityRules: "New client setups get High priority."},
    queue: { queueName: "SEO Queue", queueOwner: "Alex R.", backupOwner: "Chris D.", status: "Active", defaultPriority: "Medium", autoAssignRule: "Assign to available Specialist"},
    projectModule: { canLaunchProjects: true, canManageProjects: true, canViewProjects: true, canViewPortfolio: false, canManageMilestones: true, canManageTaskLists: true, canManageTasks: true },
    blueprints: [
      { id: "bp-seo1", name: "SEO Setup", type: "Task Blueprint", steps: 10, status: "Active"},
      { id: "bp-seo2", name: "Monthly SEO Delivery", type: "Recurring Task Blueprint", steps: 7, status: "Active"},
      { id: "bp-seo3", name: "Technical SEO Audit", type: "Task Blueprint", steps: 12, status: "Active"},
      { id: "bp-seo4", name: "SEO QA Review", type: "Review Blueprint", steps: 5, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-seo1", name: "Google Search Console", system: "Google Search Console", dataType: "Impressions, Clicks, Rankings", enabled: true },
      { id: "rs-seo2", name: "GA4 Organic Traffic", system: "GA4", dataType: "Sessions, Users, Conversions", enabled: true },
      { id: "rs-seo3", name: "SEMrush Rankings", system: "SEMrush", dataType: "Keyword Position Tracking", enabled: true },
    ],
    notes: "Uses SEMrush and Ahrefs for keyword and backlink tracking.",
    activity: [
      { date: "2024-12-05", user: "Alex R.", action: "Updated monthly delivery blueprint"},
      { date: "2024-11-01", user: "Admin", action: "Added Ahrefs integration"},
    ],
  },

  //  SERVICE: GBP 
  {
    id: "dept-gbp",
    name: "GBP",
    slug: "gbp",
    description: "Google Business Profile optimization, listing management, and local SEO.",
    departmentType: "Service",
    manager: "Alex R.",
    backupManager: "Lisa P.",
    status: "Active",
    createdDate: "2022-05-01",
    lastUpdated: "2024-11-30",
    usersCount: 3,
    roles: [
      {
        id: "r-gbp1", name: "Department Head", description: "Leads GBP strategy and oversees listings.", projectVisibilityLevel: 4,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: false, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-gbp2", name: "Specialist", description: "Manages and optimizes GBP listings.", projectVisibilityLevel: 2,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: false, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-gbp1", name: "Listing Health Score", metricType: "Percentage", target: "95%+", warningThreshold: "80%", criticalThreshold: "65%", dataSource: "Google Business Profile API", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-gbp2", name: "Average Star Rating", metricType: "Number", target: "4.5+", warningThreshold: "4.0", criticalThreshold: "3.5", dataSource: "Google Business Profile API", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-gbp3", name: "Active Suspensions", metricType: "Count", target: "0", warningThreshold: "1", criticalThreshold: "3", dataSource: "Google Business Profile API", reportingFrequency: "Daily", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-gbp1", name: "Google Business Profile API", category: "Analytics", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
    ],
    dashboard: {
      enabled: true, route: "/departments/gbp",
      widgets: ["Listing Health", "Review Score", "Suspensions", "GBP Tasks"],
      metrics: ["Listing Score", "Review Count", "Avg Rating"],
      filters: ["Status: Active"],
      queueViewEnabled: true, projectViewEnabled: true, taskViewEnabled: true, reportingViewEnabled: false, clientViewEnabled: true,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 3, escalationAfterDays: 2, overdueThresholdDays: 1, priorityRules: "Suspended listings escalate to Critical."},
    queue: { queueName: "GBP Queue", queueOwner: "Alex R.", backupOwner: "Lisa P.", status: "Active", defaultPriority: "Medium", autoAssignRule: "Assign to GBP Specialist"},
    projectModule: { canLaunchProjects: true, canManageProjects: true, canViewProjects: true, canViewPortfolio: false, canManageMilestones: true, canManageTaskLists: true, canManageTasks: true },
    blueprints: [
      { id: "bp-gbp1", name: "GBP Setup", type: "Task Blueprint", steps: 8, status: "Active"},
      { id: "bp-gbp2", name: "Monthly GBP Delivery", type: "Recurring Task Blueprint", steps: 5, status: "Active"},
      { id: "bp-gbp3", name: "Suspension Recovery", type: "Approval Blueprint", steps: 6, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-gbp1", name: "Google Business Profile", system: "Google Business Profile API", dataType: "Views, Calls, Reviews", enabled: true },
    ],
    notes: "Monitors GBP listings for suspensions and review anomalies.",
    activity: [{ date: "2024-11-30", user: "Alex R.", action: "Added suspension escalation rule"}],
  },

  //  SERVICE: PPC 
  {
    id: "dept-ppc",
    name: "PPC",
    slug: "ppc",
    description: "Google Ads PPC, shopping, display, and Performance Max campaign management.",
    departmentType: "Service",
    manager: "Mike T.",
    backupManager: "Jordan M.",
    status: "Active",
    createdDate: "2022-03-01",
    lastUpdated: "2024-12-10",
    usersCount: 5,
    roles: [
      {
        id: "r-ppc1", name: "Department Head", description: "Owns PPC strategy and campaign oversight.", projectVisibilityLevel: 4,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: true, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-ppc2", name: "Strategist", description: "Plans and audits ad strategy.", projectVisibilityLevel: 3,
        canApproveWork: false, canManageTasks: true, canManageTemplates: true, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: true, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-ppc3", name: "Specialist", description: "Executes and optimizes campaigns daily.", projectVisibilityLevel: 2,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: false, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-ppc1", name: "ROAS", metricType: "Number", target: "4.0x+", warningThreshold: "2.5x", criticalThreshold: "1.5x", dataSource: "Google Ads", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-ppc2", name: "CPA", metricType: "Currency", target: "<$50", warningThreshold: "$80", criticalThreshold: "$120", dataSource: "Google Ads", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-ppc3", name: "CTR", metricType: "Percentage", target: "5%+", warningThreshold: "3%", criticalThreshold: "1.5%", dataSource: "Google Ads", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-ppc1", name: "Google Ads MCC", category: "Paid Advertising", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-ppc2", name: "GA4", category: "Analytics", role: "Required", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-ppc3", name: "Google Search Console", category: "SEO", role: "Optional", status: "Connected", lastSync: "2024-12-13"},
    ],
    dashboard: {
      enabled: true, route: "/departments/ppc",
      widgets: ["ROAS", "Spend Pacing", "Conversions", "CPA Trend"],
      metrics: ["ROAS", "CPA", "CTR", "Ad Spend"],
      filters: ["Status: Active", "Budget Pacing: Behind"],
      queueViewEnabled: true, projectViewEnabled: true, taskViewEnabled: true, reportingViewEnabled: true, clientViewEnabled: true,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 5, escalationAfterDays: 2, overdueThresholdDays: 2, priorityRules: "Budget pacing issues escalate to Critical."},
    queue: { queueName: "PPC Queue", queueOwner: "Mike T.", backupOwner: "Jordan M.", status: "Active", defaultPriority: "High", autoAssignRule: "Assign to available Specialist"},
    projectModule: { canLaunchProjects: true, canManageProjects: true, canViewProjects: true, canViewPortfolio: false, canManageMilestones: true, canManageTaskLists: true, canManageTasks: true },
    blueprints: [
      { id: "bp-ppc1", name: "PPC Launch", type: "Task Blueprint", steps: 9, status: "Active"},
      { id: "bp-ppc2", name: "Monthly PPC Optimization", type: "Recurring Task Blueprint", steps: 6, status: "Active"},
      { id: "bp-ppc3", name: "PPC Performance Review", type: "Review Blueprint", steps: 4, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-ppc1", name: "Google Ads", system: "Google Ads MCC", dataType: "Spend, Clicks, Conversions, ROAS", enabled: true },
      { id: "rs-ppc2", name: "GA4 Paid Sessions", system: "GA4", dataType: "Paid Traffic & Conversions", enabled: true },
    ],
    notes: "Google Ads MCC connected for all client accounts.",
    activity: [{ date: "2024-12-10", user: "Mike T.", action: "Updated budget pacing escalation rule"}],
  },

  //  SERVICE: Meta Ads 
  {
    id: "dept-meta",
    name: "Meta Ads",
    slug: "meta-ads",
    description: "Facebook and Instagram paid social advertising, retargeting, and audience management.",
    departmentType: "Service",
    manager: "Mike T.",
    backupManager: "Sarah K.",
    status: "Active",
    createdDate: "2022-06-01",
    lastUpdated: "2024-11-28",
    usersCount: 3,
    roles: [
      {
        id: "r-meta1", name: "Department Head", description: "Leads Meta Ads strategy.", projectVisibilityLevel: 4,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: false, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-meta2", name: "Specialist", description: "Manages Meta ad campaigns.", projectVisibilityLevel: 2,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: false, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-meta1", name: "ROAS", metricType: "Number", target: "3.5x+", warningThreshold: "2.0x", criticalThreshold: "1.2x", dataSource: "Meta Ads Manager", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-meta2", name: "CPM", metricType: "Currency", target: "<$15", warningThreshold: "$25", criticalThreshold: "$40", dataSource: "Meta Ads Manager", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-meta3", name: "Frequency", metricType: "Number", target: "<3.0", warningThreshold: "4.5", criticalThreshold: "6.0", dataSource: "Meta Ads Manager", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-meta1", name: "Meta Business Manager", category: "Paid Advertising", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-meta2", name: "GA4", category: "Analytics", role: "Optional", status: "Connected", lastSync: "2024-12-14"},
    ],
    dashboard: {
      enabled: true, route: "/departments/meta-ads",
      widgets: ["ROAS", "CPM Trend", "Reach & Frequency", "Ad Account Health"],
      metrics: ["ROAS", "CPM", "Frequency", "CPA"],
      filters: ["Status: Active"],
      queueViewEnabled: true, projectViewEnabled: true, taskViewEnabled: true, reportingViewEnabled: true, clientViewEnabled: true,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 5, escalationAfterDays: 2, overdueThresholdDays: 2, priorityRules: "Ad account flags escalate to Critical."},
    queue: { queueName: "Meta Queue", queueOwner: "Mike T.", backupOwner: "Sarah K.", status: "Active", defaultPriority: "High", autoAssignRule: "Assign to Meta Specialist"},
    projectModule: { canLaunchProjects: true, canManageProjects: true, canViewProjects: true, canViewPortfolio: false, canManageMilestones: true, canManageTaskLists: true, canManageTasks: true },
    blueprints: [
      { id: "bp-meta1", name: "Meta Campaign Launch", type: "Task Blueprint", steps: 8, status: "Active"},
      { id: "bp-meta2", name: "Monthly Meta Optimization", type: "Recurring Task Blueprint", steps: 5, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-meta1", name: "Meta Ads Manager", system: "Meta Business Manager", dataType: "Spend, Reach, ROAS, CPM", enabled: true },
    ],
    notes: "Meta Business Manager access required for all managed accounts.",
    activity: [{ date: "2024-11-28", user: "Mike T.", action: "Updated creative review process"}],
  },

  //  SERVICE: LSA 
  {
    id: "dept-lsa",
    name: "LSA",
    slug: "lsa",
    description: "Google Local Services Ads management, lead verification, and dispute resolution.",
    departmentType: "Service",
    manager: "Mike T.",
    backupManager: "Alex R.",
    status: "Active",
    createdDate: "2023-01-15",
    lastUpdated: "2024-10-20",
    usersCount: 2,
    roles: [
      {
        id: "r-lsa1", name: "Specialist", description: "Manages LSA campaigns and lead disputes.", projectVisibilityLevel: 2,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: false, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-lsa1", name: "Leads Generated", metricType: "Count", target: "30+/mo", warningThreshold: "15/mo", criticalThreshold: "5/mo", dataSource: "Google Local Services Ads", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-lsa2", name: "Booked Calls", metricType: "Count", target: "20+/mo", warningThreshold: "10/mo", criticalThreshold: "3/mo", dataSource: "Call Tracking", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-lsa3", name: "Cost Per Lead", metricType: "Currency", target: "<$40", warningThreshold: "$65", criticalThreshold: "$100", dataSource: "Google Local Services Ads", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-lsa1", name: "Google Local Services Ads", category: "Paid Advertising", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-lsa2", name: "Google Ads", category: "Paid Advertising", role: "Required", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-lsa3", name: "Google Business Profile", category: "Analytics", role: "Required", status: "Connected", lastSync: "2024-12-13"},
      { id: "int-lsa4", name: "Call Tracking", category: "Analytics", role: "Optional", status: "Connected", lastSync: "2024-12-10"},
    ],
    dashboard: {
      enabled: true, route: "/departments/lsa",
      widgets: ["Leads", "Booked Calls", "CPL Trend", "Disputed Leads"],
      metrics: ["Lead Volume", "CPL", "Disputed Leads", "Booking Rate"],
      filters: ["Status: Active"],
      queueViewEnabled: true, projectViewEnabled: true, taskViewEnabled: true, reportingViewEnabled: false, clientViewEnabled: false,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 3, escalationAfterDays: 1, overdueThresholdDays: 1, priorityRules: "Lead disputes handled within 24h."},
    queue: { queueName: "LSA Queue", queueOwner: "Mike T.", backupOwner: "Alex R.", status: "Active", defaultPriority: "Medium", autoAssignRule: "Assign to LSA Specialist"},
    projectModule: { canLaunchProjects: true, canManageProjects: true, canViewProjects: true, canViewPortfolio: false, canManageMilestones: true, canManageTaskLists: true, canManageTasks: true },
    blueprints: [
      { id: "bp-lsa1", name: "LSA Setup", type: "Task Blueprint", steps: 6, status: "Active"},
      { id: "bp-lsa2", name: "Monthly LSA Review", type: "Recurring Task Blueprint", steps: 4, status: "Active"},
      { id: "bp-lsa3", name: "Lead Dispute", type: "Approval Blueprint", steps: 3, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-lsa1", name: "Google LSA Dashboard", system: "Google Local Services Ads", dataType: "Leads, Calls, Spend, CPL", enabled: true },
    ],
    notes: "Dispute management tracked via Google LSA dashboard.",
    activity: [{ date: "2024-10-20", user: "Mike T.", action: "Updated lead dispute workflow"}],
  },

  //  SERVICE: Reporting 
  {
    id: "dept-reporting",
    name: "Reporting",
    slug: "reporting",
    description: "Client reporting, performance dashboards, and analytics delivery.",
    departmentType: "Service",
    manager: "Chris D.",
    backupManager: "Alex R.",
    status: "Active",
    createdDate: "2022-04-01",
    lastUpdated: "2024-12-08",
    usersCount: 3,
    roles: [
      {
        id: "r-rep1", name: "Department Head", description: "Owns reporting strategy and delivery standards.", projectVisibilityLevel: 4,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: false, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-rep2", name: "Analyst", description: "Builds and delivers performance reports.", projectVisibilityLevel: 2,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: true, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-rep1", name: "Reports Delivered On Time", metricType: "Percentage", target: "100%", warningThreshold: "90%", criticalThreshold: "75%", dataSource: "RTM OS", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-rep2", name: "Reports Overdue", metricType: "Count", target: "0", warningThreshold: "3", criticalThreshold: "8", dataSource: "RTM OS", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-rep1", name: "Power BI", category: "Reporting", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-rep2", name: "GA4", category: "Analytics", role: "Required", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-rep3", name: "Google Sheets", category: "Reporting", role: "Required", status: "Connected", lastSync: "2024-12-13"},
      { id: "int-rep4", name: "Looker Studio", category: "Reporting", role: "Optional", status: "Connected", lastSync: "2024-12-10"},
    ],
    dashboard: {
      enabled: true, route: "/departments/reporting",
      widgets: ["Reports Delivered", "Overdue Reports", "On-Time Rate", "Client Satisfaction"],
      metrics: ["On-Time Delivery", "Report Count", "Overdue"],
      filters: ["Status: Active", "Due: This Week"],
      queueViewEnabled: true, projectViewEnabled: true, taskViewEnabled: true, reportingViewEnabled: true, clientViewEnabled: true,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 5, escalationAfterDays: 2, overdueThresholdDays: 2, priorityRules: "Monthly report delivery escalates on the 25th."},
    queue: { queueName: "Reporting Queue", queueOwner: "Chris D.", backupOwner: "Alex R.", status: "Active", defaultPriority: "Medium", autoAssignRule: "Assign by client list"},
    projectModule: { canLaunchProjects: false, canManageProjects: false, canViewProjects: true, canViewPortfolio: false, canManageMilestones: false, canManageTaskLists: false, canManageTasks: true },
    blueprints: [
      { id: "bp-rep1", name: "Reporting Setup", type: "Task Blueprint", steps: 7, status: "Active"},
      { id: "bp-rep2", name: "Monthly Report Delivery", type: "Recurring Task Blueprint", steps: 4, status: "Active"},
      { id: "bp-rep3", name: "QBR Report", type: "Task Blueprint", steps: 6, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-rep1", name: "Power BI Workspace", system: "Power BI", dataType: "Cross-channel Performance", enabled: true },
      { id: "rs-rep2", name: "GA4 Properties", system: "GA4", dataType: "Web Analytics", enabled: true },
      { id: "rs-rep3", name: "Google Sheets Templates", system: "Google Sheets", dataType: "Custom Report Builds", enabled: true },
    ],
    notes: "Looker Studio templates maintained in shared Google Drive.",
    activity: [{ date: "2024-12-08", user: "Chris D.", action: "Updated monthly template cycle"}],
  },

  //  SERVICE: Creative 
  {
    id: "dept-creative",
    name: "Creative",
    slug: "creative",
    description: "Graphic design, ad creative production, video, and brand asset management.",
    departmentType: "Service",
    manager: "Chris D.",
    backupManager: "Sarah K.",
    status: "Active",
    createdDate: "2022-08-01",
    lastUpdated: "2024-11-25",
    usersCount: 4,
    roles: [
      {
        id: "r-cr1", name: "Department Head", description: "Leads creative vision and quality standards.", projectVisibilityLevel: 4,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: false, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-cr2", name: "Designer", description: "Creates visual assets and ad creatives.", projectVisibilityLevel: 2,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: false, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: false, status: "Active",
      },
      {
        id: "r-cr3", name: "Contractor", description: "Freelance creative delivery.", projectVisibilityLevel: 1,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: false, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: false, projectAccess: false, taskAccess: true, reportingAccess: false, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-cr1", name: "Requests Completed On Time", metricType: "Percentage", target: "95%+", warningThreshold: "80%", criticalThreshold: "65%", dataSource: "RTM OS", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-cr2", name: "Avg Turnaround", metricType: "Duration", target: "<3 days", warningThreshold: "5 days", criticalThreshold: "8 days", dataSource: "RTM OS", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-cr3", name: "Revision Rate", metricType: "Percentage", target: "<15%", warningThreshold: "25%", criticalThreshold: "40%", dataSource: "RTM OS", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-cr1", name: "Figma", category: "Other", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-cr2", name: "Adobe Creative Cloud", category: "Other", role: "Required", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-cr3", name: "Frame.io", category: "Project Management", role: "Optional", status: "Disconnected", lastSync: "—"},
    ],
    dashboard: {
      enabled: true, route: "/departments/creative",
      widgets: ["Active Requests", "Completed", "Queue Depth", "Revision Rate"],
      metrics: ["Requests Completed", "Avg Turnaround", "Revision Rate"],
      filters: ["Status: Active"],
      queueViewEnabled: true, projectViewEnabled: true, taskViewEnabled: true, reportingViewEnabled: false, clientViewEnabled: false,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 7, escalationAfterDays: 3, overdueThresholdDays: 2, priorityRules: "Ad creative urgents flagged as High."},
    queue: { queueName: "Creative Queue", queueOwner: "Chris D.", backupOwner: "Sarah K.", status: "Active", defaultPriority: "Medium", autoAssignRule: "Assign to available Designer"},
    projectModule: { canLaunchProjects: false, canManageProjects: false, canViewProjects: true, canViewPortfolio: false, canManageMilestones: false, canManageTaskLists: true, canManageTasks: true },
    blueprints: [
      { id: "bp-cr1", name: "Ad Creative Request", type: "Task Blueprint", steps: 6, status: "Active"},
      { id: "bp-cr2", name: "Brand Asset Package", type: "Task Blueprint", steps: 9, status: "Active"},
      { id: "bp-cr3", name: "Creative Review & Approval", type: "Review Blueprint", steps: 4, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-cr1", name: "RTM OS Task Data", system: "RTM OS", dataType: "Request Volume & Turnaround", enabled: true },
    ],
    notes: "Figma and Adobe CC are primary tools. Frame.io pending reconnection.",
    activity: [{ date: "2024-11-25", user: "Chris D.", action: "Updated creative request process"}],
  },

  //  SERVICE: Web Development 
  {
    id: "dept-web",
    name: "Web Development",
    slug: "web-development",
    description: "Website design, development, maintenance, and landing page services.",
    departmentType: "Service",
    manager: "Chris D.",
    backupManager: "Jordan M.",
    status: "Active",
    createdDate: "2022-07-01",
    lastUpdated: "2024-11-10",
    usersCount: 4,
    roles: [
      {
        id: "r-web1", name: "Department Head", description: "Leads web project delivery and QA.", projectVisibilityLevel: 4,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: false, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-web2", name: "Developer", description: "Builds and maintains client websites.", projectVisibilityLevel: 2,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: false, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: false, status: "Active",
      },
      {
        id: "r-web3", name: "Reviewer", description: "QA reviews sites before launch.", projectVisibilityLevel: 3,
        canApproveWork: true, canManageTasks: false, canManageTemplates: false, canViewFinance: false, canViewClients: false, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: false, projectAccess: true, taskAccess: true, reportingAccess: false, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-web1", name: "Projects Launched On Time", metricType: "Percentage", target: "90%+", warningThreshold: "75%", criticalThreshold: "60%", dataSource: "RTM OS", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-web2", name: "Open Support Tickets", metricType: "Count", target: "<5", warningThreshold: "10", criticalThreshold: "20", dataSource: "RTM OS", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-web1", name: "Webflow", category: "Other", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-web2", name: "WordPress", category: "Other", role: "Required", status: "Connected", lastSync: "2024-12-12"},
      { id: "int-web3", name: "GitHub", category: "Project Management", role: "Optional", status: "Connected", lastSync: "2024-12-14"},
    ],
    dashboard: {
      enabled: true, route: "/departments/web-development",
      widgets: ["Active Projects", "Launch Pipeline", "Open Tickets", "On-Time Rate"],
      metrics: ["Projects In Progress", "On-Time Launch Rate", "Open Tickets"],
      filters: ["Status: Active"],
      queueViewEnabled: true, projectViewEnabled: true, taskViewEnabled: true, reportingViewEnabled: false, clientViewEnabled: true,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 14, escalationAfterDays: 5, overdueThresholdDays: 3, priorityRules: "Site-down incidents escalate to Critical immediately."},
    queue: { queueName: "Web Queue", queueOwner: "Chris D.", backupOwner: "Jordan M.", status: "Active", defaultPriority: "Medium", autoAssignRule: "Assign to available Developer"},
    projectModule: { canLaunchProjects: true, canManageProjects: true, canViewProjects: true, canViewPortfolio: false, canManageMilestones: true, canManageTaskLists: true, canManageTasks: true },
    blueprints: [
      { id: "bp-web1", name: "Website Build", type: "Task Blueprint", steps: 15, status: "Active"},
      { id: "bp-web2", name: "Landing Page", type: "Task Blueprint", steps: 8, status: "Active"},
      { id: "bp-web3", name: "Website QA & Launch", type: "Review Blueprint", steps: 7, status: "Active"},
      { id: "bp-web4", name: "Monthly Maintenance", type: "Recurring Task Blueprint", steps: 5, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-web1", name: "RTM OS Projects", system: "RTM OS", dataType: "Project & Task Data", enabled: true },
    ],
    notes: "Primary platforms: Webflow and WordPress. GitHub for custom dev work.",
    activity: [{ date: "2024-11-10", user: "Chris D.", action: "Added QA Reviewer role"}],
  },

  //  SERVICE: AI Automation 
  {
    id: "dept-ai",
    name: "AI Automation",
    slug: "ai-automation",
    description: "AI workflow automation, voice agents, chatbot builds, and intelligent process design.",
    departmentType: "Service",
    manager: "Jordan M.",
    backupManager: "Mike T.",
    status: "Active",
    createdDate: "2024-01-15",
    lastUpdated: "2024-12-12",
    usersCount: 3,
    roles: [
      {
        id: "r-ai1", name: "Department Head", description: "Leads AI product strategy and delivery.", projectVisibilityLevel: 4,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: true, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-ai2", name: "Automation Specialist", description: "Builds and manages AI workflows and automations.", projectVisibilityLevel: 3,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: false, status: "Active",
      },
      {
        id: "r-ai3", name: "Strategist", description: "Designs automation architecture and roadmaps.", projectVisibilityLevel: 3,
        canApproveWork: false, canManageTasks: true, canManageTemplates: true, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: false, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: false, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-ai1", name: "Automation Success Rate", metricType: "Percentage", target: "98%+", warningThreshold: "90%", criticalThreshold: "80%", dataSource: "Make.com / n8n", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-ai2", name: "Leads Processed by AI", metricType: "Count", target: "500+/mo", warningThreshold: "200/mo", criticalThreshold: "50/mo", dataSource: "VAPI / GoHighLevel", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-ai3", name: "Avg Build Delivery Time", metricType: "Duration", target: "<10 days", warningThreshold: "15 days", criticalThreshold: "25 days", dataSource: "RTM OS", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-ai1", name: "OpenAI", category: "AI / Automation", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-ai2", name: "VAPI", category: "AI / Automation", role: "Required", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-ai3", name: "Twilio", category: "Communication", role: "Required", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-ai4", name: "GoHighLevel", category: "CRM", role: "Required", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-ai5", name: "Make.com", category: "AI / Automation", role: "Optional", status: "Connected", lastSync: "2024-12-13"},
      { id: "int-ai6", name: "n8n", category: "AI / Automation", role: "Optional", status: "Connected", lastSync: "2024-12-12"},
    ],
    dashboard: {
      enabled: true, route: "/departments/ai-automation",
      widgets: ["Active Automations", "Leads Processed", "Success Rate", "Build Pipeline"],
      metrics: ["Automation Success Rate", "Leads Processed", "Avg Build Time"],
      filters: ["Status: Active"],
      queueViewEnabled: true, projectViewEnabled: true, taskViewEnabled: true, reportingViewEnabled: true, clientViewEnabled: true,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 10, escalationAfterDays: 3, overdueThresholdDays: 2, priorityRules: "Live automation failures escalate to Critical immediately."},
    queue: { queueName: "AI Automation Queue", queueOwner: "Jordan M.", backupOwner: "Mike T.", status: "Active", defaultPriority: "High", autoAssignRule: "Assign to Automation Specialist"},
    projectModule: { canLaunchProjects: true, canManageProjects: true, canViewProjects: true, canViewPortfolio: false, canManageMilestones: true, canManageTaskLists: true, canManageTasks: true },
    blueprints: [
      { id: "bp-ai1", name: "AI Automation Setup", type: "Task Blueprint", steps: 12, status: "Active"},
      { id: "bp-ai2", name: "Chatbot Build & Launch", type: "Task Blueprint", steps: 9, status: "Active"},
      { id: "bp-ai3", name: "Monthly Automation Review", type: "Recurring Task Blueprint", steps: 5, status: "Active"},
      { id: "bp-ai4", name: "Automation QA & Approval", type: "Approval Blueprint", steps: 6, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-ai1", name: "Make.com Logs", system: "Make.com", dataType: "Workflow Runs & Errors", enabled: true },
      { id: "rs-ai2", name: "VAPI Call Logs", system: "VAPI", dataType: "Call Volume & Outcomes", enabled: true },
      { id: "rs-ai3", name: "GoHighLevel Pipeline", system: "GoHighLevel", dataType: "Lead & Conversion Data", enabled: true },
    ],
    notes: "Core stack: OpenAI, VAPI, Twilio, GoHighLevel, Make.com, n8n.",
    activity: [
      { date: "2024-12-12", user: "Jordan M.", action: "Added AI Automation Setup blueprint"},
      { date: "2024-11-01", user: "Admin", action: "Added VAPI and Twilio integrations"},
    ],
  },

  //  SUPPORT: Operations 
  {
    id: "dept-ops",
    name: "Operations",
    slug: "operations",
    description: "Internal processes, workflow optimization, documentation, and cross-team coordination.",
    departmentType: "Support",
    manager: "Sarah K.",
    backupManager: "Lisa P.",
    status: "Active",
    createdDate: "2022-01-10",
    lastUpdated: "2024-11-20",
    usersCount: 3,
    roles: [
      {
        id: "r-ops1", name: "Department Head", description: "Leads operations and internal process improvement.", projectVisibilityLevel: 5,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: true, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-ops2", name: "Coordinator", description: "Manages cross-team coordination and scheduling.", projectVisibilityLevel: 3,
        canApproveWork: false, canManageTasks: true, canManageTemplates: false, canViewFinance: false, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: true, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-ops1", name: "Process Compliance Rate", metricType: "Percentage", target: "95%+", warningThreshold: "80%", criticalThreshold: "65%", dataSource: "RTM OS", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-ops2", name: "Onboarding Time (New Hires)", metricType: "Duration", target: "<7 days", warningThreshold: "14 days", criticalThreshold: "21 days", dataSource: "Internal", reportingFrequency: "Quarterly", dashboardVisible: false, status: "Active"},
    ],
    integrations: [
      { id: "int-ops1", name: "RTM OS", category: "Project Management", role: "Primary System", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-ops2", name: "Google Workspace", category: "Other", role: "Required", status: "Connected", lastSync: "2024-12-14"},
    ],
    dashboard: {
      enabled: true, route: "/departments/operations",
      widgets: ["Active Processes", "Cross-Team Blockers", "Onboarding Status", "Ops Tasks"],
      metrics: ["Process Compliance", "Open Blockers"],
      filters: ["Status: Active"],
      queueViewEnabled: true, projectViewEnabled: true, taskViewEnabled: true, reportingViewEnabled: true, clientViewEnabled: false,
    },
    deliveryStandards: { note: "Fallback only.", firstResponseDays: 1, targetCompletionDays: 5, escalationAfterDays: 3, overdueThresholdDays: 2, priorityRules: "Cross-team blockers escalate to High."},
    queue: { queueName: "Ops Queue", queueOwner: "Sarah K.", backupOwner: "Lisa P.", status: "Active", defaultPriority: "Medium", autoAssignRule: "Assign by department impact"},
    projectModule: { canLaunchProjects: true, canManageProjects: true, canViewProjects: true, canViewPortfolio: true, canManageMilestones: true, canManageTaskLists: true, canManageTasks: true },
    blueprints: [
      { id: "bp-ops1", name: "New Employee Onboarding", type: "Task Blueprint", steps: 10, status: "Active"},
      { id: "bp-ops2", name: "Employee Offboarding", type: "Offboarding Blueprint", steps: 12, status: "Active"},
      { id: "bp-ops3", name: "Process Audit", type: "Recurring Task Blueprint", steps: 8, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-ops1", name: "RTM OS Internal", system: "RTM OS", dataType: "Task & Process Metrics", enabled: true },
    ],
    notes: "Coordinates cross-department dependencies and internal process reviews.",
    activity: [{ date: "2024-11-20", user: "Sarah K.", action: "Updated process compliance KPI"}],
  },

  //  EXECUTIVE: Leadership 
  {
    id: "dept-leadership",
    name: "Leadership",
    slug: "leadership",
    description: "Executive leadership, company strategy, portfolio oversight, and growth planning.",
    departmentType: "Executive",
    manager: "Owner",
    backupManager: "",
    status: "Active",
    createdDate: "2022-01-01",
    lastUpdated: "2024-12-01",
    usersCount: 2,
    roles: [
      {
        id: "r-exec1", name: "Executive", description: "Company owner with full portfolio and business access.", projectVisibilityLevel: 5,
        canApproveWork: true, canManageTasks: true, canManageTemplates: true, canViewFinance: true, canViewClients: true, canManageUsers: true, canConfigureDashboard: true, canManageDeliveryStandards: true, canViewReports: true, canManageIntegrations: true,
        dashboardAccess: true, projectAccess: true, taskAccess: true, reportingAccess: true, status: "Active",
      },
      {
        id: "r-exec2", name: "Approver", description: "C-level review and final approvals.", projectVisibilityLevel: 5,
        canApproveWork: true, canManageTasks: false, canManageTemplates: false, canViewFinance: true, canViewClients: true, canManageUsers: false, canConfigureDashboard: false, canManageDeliveryStandards: false, canViewReports: true, canManageIntegrations: false,
        dashboardAccess: true, projectAccess: true, taskAccess: false, reportingAccess: true, status: "Active",
      },
    ],
    kpis: [
      { id: "kpi-exec1", name: "Total MRR", metricType: "Currency", target: "$500,000+", warningThreshold: "$300,000", criticalThreshold: "$150,000", dataSource: "Stripe", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-exec2", name: "Client Retention Rate", metricType: "Percentage", target: "95%+", warningThreshold: "88%", criticalThreshold: "80%", dataSource: "RTM OS", reportingFrequency: "Monthly", dashboardVisible: true, status: "Active"},
      { id: "kpi-exec3", name: "Portfolio Health Score", metricType: "Number", target: "85+", warningThreshold: "70", criticalThreshold: "55", dataSource: "RTM OS", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
      { id: "kpi-exec4", name: "Revenue at Risk", metricType: "Currency", target: "<$10,000", warningThreshold: "$25,000", criticalThreshold: "$50,000", dataSource: "RTM OS", reportingFrequency: "Weekly", dashboardVisible: true, status: "Active"},
    ],
    integrations: [
      { id: "int-exec1", name: "Stripe", category: "Finance", role: "Reporting Only", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-exec2", name: "Power BI", category: "Reporting", role: "Reporting Only", status: "Connected", lastSync: "2024-12-14"},
      { id: "int-exec3", name: "GoHighLevel", category: "CRM", role: "Reporting Only", status: "Connected", lastSync: "2024-12-14"},
    ],
    dashboard: {
      enabled: true, route: "/executive",
      widgets: ["Total MRR", "Portfolio Health", "Revenue at Risk", "Client Retention", "Renewals Due", "Bottlenecks"],
      metrics: ["Total MRR", "Client Retention", "Portfolio Health", "Revenue at Risk"],
      filters: ["View: Executive"],
      queueViewEnabled: false, projectViewEnabled: true, taskViewEnabled: false, reportingViewEnabled: true, clientViewEnabled: true,
    },
    deliveryStandards: { note: "N/A — Executive department does not deliver client services.", firstResponseDays: 0, targetCompletionDays: 0, escalationAfterDays: 0, overdueThresholdDays: 0, priorityRules: "N/A"},
    queue: { queueName: "Executive Queue", queueOwner: "Owner", backupOwner: "", status: "Active", defaultPriority: "Critical", autoAssignRule: "Manual assignment only"},
    projectModule: { canLaunchProjects: true, canManageProjects: true, canViewProjects: true, canViewPortfolio: true, canManageMilestones: true, canManageTaskLists: true, canManageTasks: true },
    blueprints: [
      { id: "bp-exec1", name: "Strategic Initiative", type: "Task Blueprint", steps: 8, status: "Active"},
      { id: "bp-exec2", name: "Executive Review", type: "Review Blueprint", steps: 4, status: "Active"},
    ],
    reportingSources: [
      { id: "rs-exec1", name: "Executive Dashboard", system: "RTM OS", dataType: "Full Portfolio & Revenue", enabled: true },
      { id: "rs-exec2", name: "Stripe Revenue", system: "Stripe", dataType: "MRR & Revenue Metrics", enabled: true },
    ],
    notes: "Executive-level department. Portfolio-wide read access across all departments.",
    activity: [{ date: "2024-12-01", user: "Admin", action: "Updated executive KPI thresholds"}],
  },
];

// 
// HELPERS
// 

function deptStatusVariant(s: DeptStatus): StatusVariant {
  if (s === "Active") return "success";
  if (s === "Inactive") return "neutral";
  if (s === "Pending Setup") return "pending";
  return "error";
}

function integrationStatusVariant(s: Integration["status"]): StatusVariant {
  if (s === "Connected") return "success";
  if (s === "Disconnected") return "neutral";
  if (s === "Pending") return "pending";
  return "error";
}

const DEPT_TYPE_CONFIG: Record<
  DepartmentType,
  { color?: string; bg?: string; border: string; label: string }
> = {
  Core: { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", label: "Core"},
  Service: { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", label: "Service"},
  Support: { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", label: "Support"},
  Executive: { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", label: "Executive"},
};

function DeptTypeBadge({ type }: { type: DepartmentType }) {
  const cfg = DEPT_TYPE_CONFIG[type];
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

const VISIBILITY_COLORS: Record<ProjectVisibilityLevel, { bg?: string; color?: string }> = {
  1: { bg: "#F8FAFC", color: "#64748B"},
  2: { bg: "#EFF6FF", color: "#1D4ED8"},
  3: { bg: "#ECFDF5", color: "#059669"},
  4: { bg: "#FFFBEB", color: "#B45309"},
  5: { bg: "#F5F3FF", color: "#7C3AED"},
};

function VisibilityBadge({ level }: { level: ProjectVisibilityLevel }) {
  const cfg = VISIBILITY_COLORS[level];
  const label = PROJECT_VISIBILITY_LEVELS.find((v) => v.level === level)?.label ?? "—";
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"style={{ background: cfg.bg, color: cfg.color }}
    >
      L{level} · {label}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-3"style={{ color: "var(--rtm-text-muted)"}}>
      {children}
    </p>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium"style={{ color: "var(--rtm-text-muted)"}}>{label}</span>
      <span className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
        {value || <span className="text-slate-400 font-normal italic">—</span>}
      </span>
    </div>
  );
}

function DrawerCard({ children, className = ""}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border p-4 ${className}`}
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
    >
      {children}
    </div>
  );
}

function CheckIcon({ checked }: { checked: boolean }) {
  return checked ? (
    <span className="text-emerald-500 text-xs font-bold">Yes</span>
  ) : (
    <span className="text-slate-300 text-sm">—</span>
  );
}

// 
// DRAWER TAB TYPES
// 

type DrawerTab =
  | "overview"| "roles"| "kpis"| "integrations"| "dashboard"| "project-visibility"| "task-visibility"| "reporting-sources"| "delivery-standards"| "blueprints"| "permissions"| "activity";

const DRAWER_TABS: { id: DrawerTab; label: string }[] = [
  { id: "overview", label: "Overview"},
  { id: "roles", label: "Roles"},
  { id: "kpis", label: "KPIs"},
  { id: "integrations", label: "Integrations"},
  { id: "dashboard", label: "Dashboard"},
  { id: "project-visibility", label: "Project Visibility"},
  { id: "task-visibility", label: "Task Visibility"},
  { id: "reporting-sources", label: "Reporting Sources"},
  { id: "delivery-standards", label: "Delivery Standards"},
  { id: "blueprints", label: "Task Blueprint Mapping"},
  { id: "permissions", label: "Permissions"},
  { id: "activity", label: "Activity Log"},
];

// 
// DRAWER TAB PANELS
// 

function DrawerOverview({ dept }: { dept: Department }) {
  const typeCfg = DEPT_TYPE_CONFIG[dept.departmentType];
  return (
    <div className="space-y-5">
      <SectionTitle>Department Overview</SectionTitle>
      <DrawerCard>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Department Name"value={dept.name} />
          <InfoRow label="Slug"value={<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">/{dept.slug}</code>} />
          <InfoRow label="Department Type"value={<DeptTypeBadge type={dept.departmentType} />} />
          <InfoRow label="Status"value={<StatusBadge variant={deptStatusVariant(dept.status)} label={dept.status} size="sm"/>} />
          <InfoRow label="Manager"value={dept.manager} />
          <InfoRow label="Backup Manager"value={dept.backupManager} />
          <InfoRow label="Users"value={dept.usersCount} />
          <InfoRow label="Last Updated"value={dept.lastUpdated} />
        </div>
        {dept.description && (
          <div className="mt-4 pt-4 border-t"style={{ borderColor: "var(--rtm-border)"}}>
            <InfoRow label="Description"value={dept.description} />
          </div>
        )}
      </DrawerCard>

      {/* Dashboard Route */}
      <DrawerCard>
        <SectionTitle>Dynamic Dashboard Route</SectionTitle>
        <div className="flex items-center gap-3">
          <code className="text-sm bg-slate-100 px-3 py-2 rounded-lg text-slate-700 font-mono flex-1">
            {dept.dashboard.route}
          </code>
          <span
            className="text-xs px-2 py-1 rounded-full font-semibold"style={
              dept.dashboard.enabled
                ? { background: "#ECFDF5", color: "#059669"}
                : { background: "#F8FAFC", color: "#64748B"}
            }
          >
            {dept.dashboard.enabled ? "Enabled": "Not Enabled"}
          </span>
        </div>
        <p className="text-xs mt-2"style={{ color: "var(--rtm-text-muted)"}}>
          Future route: <span className="font-mono">/departments/[slug]</span> — configured here, not yet built as dynamic page.
        </p>
      </DrawerCard>

      {/* Department Type Explanation */}
      <div
        className="rounded-xl border px-4 py-3"style={{ background: typeCfg.bg, borderColor: typeCfg.border }}
      >
        <p className="text-xs font-bold uppercase tracking-wide mb-1"style={{ color: typeCfg.color }}>
          {dept.departmentType} Department
        </p>
        <p className="text-xs"style={{ color: typeCfg.color, opacity: 0.85 }}>
          {dept.departmentType === "Core"&& "Core departments are foundational business units required for operations: Sales, Billing, Account Management, IT & Security."}
          {dept.departmentType === "Service"&& "Service departments deliver client-facing services: SEO, GBP, PPC, Meta Ads, LSA, Reporting, Creative, Web Development, AI Automation."}
          {dept.departmentType === "Support"&& "Support departments enable internal functions: HR, Finance, Operations."}
          {dept.departmentType === "Executive"&& "Executive departments provide strategic oversight and portfolio visibility: Leadership, Management."}
        </p>
      </div>

      {dept.notes && (
        <DrawerCard>
          <SectionTitle>Notes</SectionTitle>
          <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{dept.notes}</p>
        </DrawerCard>
      )}
    </div>
  );
}

function DrawerRoles({ dept }: { dept: Department }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Roles ({dept.roles.length})</SectionTitle>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
        >
          + Add Role
        </button>
      </div>
      {dept.roles.map((role) => (
        <DrawerCard key={role.id}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{role.name}</p>
              <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{role.description}</p>
            </div>
            <StatusBadge variant={role.status === "Active"? "success": "neutral"} label={role.status} size="sm"/>
          </div>

          <div className="mb-3">
            <p className="text-xs font-semibold mb-1.5"style={{ color: "var(--rtm-text-muted)"}}>PROJECT VISIBILITY</p>
            <VisibilityBadge level={role.projectVisibilityLevel} />
          </div>

          <div className="mb-3">
            <p className="text-xs font-semibold mb-1.5"style={{ color: "var(--rtm-text-muted)"}}>ACCESS</p>
            <div className="flex flex-wrap gap-2">
              {role.dashboardAccess && <span className="text-xs px-2 py-0.5 rounded-full"style={{ background: "#EFF6FF", color: "#1D4ED8"}}>Dashboard</span>}
              {role.projectAccess && <span className="text-xs px-2 py-0.5 rounded-full"style={{ background: "#ECFDF5", color: "#059669"}}>Projects</span>}
              {role.taskAccess && <span className="text-xs px-2 py-0.5 rounded-full"style={{ background: "#FFFBEB", color: "#B45309"}}>Tasks</span>}
              {role.reportingAccess && <span className="text-xs px-2 py-0.5 rounded-full"style={{ background: "#F5F3FF", color: "#7C3AED"}}>Reporting</span>}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-1.5"style={{ color: "var(--rtm-text-muted)"}}>PERMISSIONS</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
              <div className="flex items-center gap-1.5"><CheckIcon checked={role.canApproveWork} /> Approve Work</div>
              <div className="flex items-center gap-1.5"><CheckIcon checked={role.canManageTasks} /> Manage Tasks</div>
              <div className="flex items-center gap-1.5"><CheckIcon checked={role.canManageTemplates} /> Manage Templates</div>
              <div className="flex items-center gap-1.5"><CheckIcon checked={role.canViewFinance} /> View Finance</div>
              <div className="flex items-center gap-1.5"><CheckIcon checked={role.canViewClients} /> View Clients</div>
              <div className="flex items-center gap-1.5"><CheckIcon checked={role.canManageUsers} /> Manage Users</div>
              <div className="flex items-center gap-1.5"><CheckIcon checked={role.canConfigureDashboard} /> Configure Dashboard</div>
              <div className="flex items-center gap-1.5"><CheckIcon checked={role.canManageDeliveryStandards} /> Delivery Standards</div>
              <div className="flex items-center gap-1.5"><CheckIcon checked={role.canViewReports} /> View Reports</div>
              <div className="flex items-center gap-1.5"><CheckIcon checked={role.canManageIntegrations} /> Manage Integrations</div>
            </div>
          </div>
        </DrawerCard>
      ))}
    </div>
  );
}

function DrawerKPIs({ dept }: { dept: Department }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>KPI Configuration ({dept.kpis.length})</SectionTitle>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
        >
          + Add KPI
        </button>
      </div>
      {dept.kpis.map((kpi) => (
        <DrawerCard key={kpi.id}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{kpi.name}</p>
              <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{kpi.metricType} · {kpi.dataSource}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {kpi.dashboardVisible && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)"}}>Dashboard</span>
              )}
              <StatusBadge variant={kpi.status === "Active"? "success": "neutral"} label={kpi.status} size="sm"/>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg px-3 py-2 text-center"style={{ background: "#ECFDF5"}}>
              <p className="text-xs font-semibold"style={{ color: "#059669"}}>Target</p>
              <p className="text-sm font-bold mt-0.5"style={{ color: "#065F46"}}>{kpi.target}</p>
            </div>
            <div className="rounded-lg px-3 py-2 text-center"style={{ background: "#FFFBEB"}}>
              <p className="text-xs font-semibold"style={{ color: "#B45309"}}>Warning</p>
              <p className="text-sm font-bold mt-0.5"style={{ color: "#92400E"}}>{kpi.warningThreshold}</p>
            </div>
            <div className="rounded-lg px-3 py-2 text-center"style={{ background: "#FEF2F2"}}>
              <p className="text-xs font-semibold"style={{ color: "#DC2626"}}>Critical</p>
              <p className="text-sm font-bold mt-0.5"style={{ color: "#991B1B"}}>{kpi.criticalThreshold}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            <span>Data Source: <span className="font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{kpi.dataSource}</span></span>
            <span>Reports: <span className="font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{kpi.reportingFrequency}</span></span>
          </div>
        </DrawerCard>
      ))}
    </div>
  );
}

function DrawerIntegrations({ dept }: { dept: Department }) {
  const roleOrder: IntegrationRole[] = ["Primary System", "Required", "Optional", "Reporting Only"];
  const sorted = [...dept.integrations].sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
  );

  const roleStyle: Record<IntegrationRole, { bg?: string; color?: string }> = {
    "Primary System": { bg: "#F5F3FF", color: "#7C3AED"},
    Required: { bg: "#EFF6FF", color: "#1D4ED8"},
    Optional: { bg: "#F8FAFC", color: "#64748B"},
    "Reporting Only": { bg: "#FFFBEB", color: "#B45309"},
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Integrations ({dept.integrations.length})</SectionTitle>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
        >
          + Add Integration
        </button>
      </div>
      {sorted.map((int) => {
        const rs = roleStyle[int.role];
        return (
          <DrawerCard key={int.id}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{int.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"style={{ background: rs.bg, color: rs.color }}>{int.role}</span>
                </div>
                <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                  {int.category} · Last sync: {int.lastSync}
                </p>
              </div>
              <StatusBadge variant={integrationStatusVariant(int.status)} label={int.status} size="sm"/>
            </div>
          </DrawerCard>
        );
      })}
    </div>
  );
}

function DrawerDashboard({ dept }: { dept: Department }) {
  const { dashboard } = dept;
  return (
    <div className="space-y-4">
      <SectionTitle>Dashboard Configuration</SectionTitle>
      <DrawerCard>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Dashboard</span>
          <StatusBadge variant={dashboard.enabled ? "success": "neutral"} label={dashboard.enabled ? "Enabled": "Disabled"} size="sm"/>
        </div>
        <InfoRow label="Route"value={<code className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{dashboard.route}</code>} />
        <div className="mt-4 pt-4 border-t"style={{ borderColor: "var(--rtm-border)"}}>
          <p className="text-xs font-semibold mb-2"style={{ color: "var(--rtm-text-muted)"}}>VIEW TOGGLES</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Queue View", value: dashboard.queueViewEnabled },
              { label: "Project View", value: dashboard.projectViewEnabled },
              { label: "Task View", value: dashboard.taskViewEnabled },
              { label: "Reporting View", value: dashboard.reportingViewEnabled },
              { label: "Client View", value: dashboard.clientViewEnabled },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                <CheckIcon checked={item.value} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </DrawerCard>

      <DrawerCard>
        <SectionTitle>Widgets</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {dashboard.widgets.map((w) => (
            <span key={w} className="text-xs px-2 py-1 rounded-lg font-semibold border"style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", borderColor: "var(--rtm-blue-light, #BFDBFE)"}}>
              {w}
            </span>
          ))}
        </div>
      </DrawerCard>

      <DrawerCard>
        <SectionTitle>Metrics</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {dashboard.metrics.map((m) => (
            <span key={m} className="text-xs px-2 py-1 rounded-lg font-semibold border"style={{ background: "#EFF6FF", color: "#3B82F6", borderColor: "#BFDBFE"}}>
              {m}
            </span>
          ))}
        </div>
      </DrawerCard>

      {dashboard.filters.length > 0 && (
        <DrawerCard>
          <SectionTitle>Default Filters</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {dashboard.filters.map((f) => (
              <span key={f} className="text-xs px-2 py-1 rounded-lg font-semibold border"style={{ background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A"}}>
                {f}
              </span>
            ))}
          </div>
        </DrawerCard>
      )}

      <p className="text-xs italic"style={{ color: "var(--rtm-text-muted)"}}>
         Dynamic route <code className="font-mono">/departments/[slug]</code> is configured here but not yet built as a dynamic page.
      </p>
    </div>
  );
}

function DrawerProjectVisibility({ dept }: { dept: Department }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Project Visibility Configuration</SectionTitle>

      {/* Visibility Level Guide */}
      <DrawerCard>
        <SectionTitle>Visibility Levels — Reference</SectionTitle>
        <div className="space-y-3">
          {PROJECT_VISIBILITY_LEVELS.map((v) => {
            const cfg = VISIBILITY_COLORS[v.level];
            return (
              <div key={v.level} className="flex items-start gap-3 py-2 border-b last:border-0"style={{ borderColor: "var(--rtm-border)"}}>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"style={{ background: cfg.bg, color: cfg.color }}>L{v.level}</span>
                <div>
                  <p className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{v.label}</p>
                  <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{v.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DrawerCard>

      {/* Roles mapped to levels */}
      <DrawerCard>
        <SectionTitle>Role Visibility Assignments</SectionTitle>
        <div className="space-y-2">
          {dept.roles.map((role) => (
            <div key={role.id} className="flex items-center justify-between py-2 border-b last:border-0"style={{ borderColor: "var(--rtm-border)"}}>
              <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{role.name}</span>
              <VisibilityBadge level={role.projectVisibilityLevel} />
            </div>
          ))}
        </div>
      </DrawerCard>

      {/* Special Access Profiles */}
      {[ACCOUNT_MANAGER_ACCESS, DEPARTMENT_HEAD_ACCESS, EXECUTIVE_ACCESS].map((profile) => (
        <DrawerCard key={profile.label}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{profile.label}</span>
          </div>
          <p className="text-xs mb-3"style={{ color: "var(--rtm-text-muted)"}}>{profile.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.canViewItems.map((item) => (
              <span key={item} className="text-xs px-2 py-0.5 rounded-full font-medium"style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)"}}>{item}</span>
            ))}
          </div>
        </DrawerCard>
      ))}
    </div>
  );
}

function DrawerTaskVisibility({ dept }: { dept: Department }) {
  return (
    <div className="space-y-4">
      <SectionTitle>Task Visibility by Role</SectionTitle>
      <DrawerCard>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border)"}}>
                <th className="text-left py-2 pr-4 font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Role</th>
                <th className="text-center py-2 px-3 font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Own Tasks</th>
                <th className="text-center py-2 px-3 font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Dept Tasks</th>
                <th className="text-center py-2 px-3 font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Dept Projects</th>
                <th className="text-center py-2 px-3 font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Full Project</th>
                <th className="text-center py-2 px-3 font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Portfolio</th>
              </tr>
            </thead>
            <tbody>
              {dept.roles.map((role) => {
                const vl = PROJECT_VISIBILITY_LEVELS.find((v) => v.level === role.projectVisibilityLevel);
                return (
                  <tr key={role.id} className="border-b last:border-0"style={{ borderColor: "var(--rtm-border)"}}>
                    <td className="py-2.5 pr-4 font-medium"style={{ color: "var(--rtm-text-secondary)"}}>{role.name}</td>
                    <td className="py-2.5 px-3 text-center"><CheckIcon checked={vl?.canViewAssignedTasksOnly ?? false} /></td>
                    <td className="py-2.5 px-3 text-center"><CheckIcon checked={vl?.canViewDepartmentTasks ?? false} /></td>
                    <td className="py-2.5 px-3 text-center"><CheckIcon checked={vl?.canViewDepartmentProjects ?? false} /></td>
                    <td className="py-2.5 px-3 text-center"><CheckIcon checked={vl?.canViewFullProject ?? false} /></td>
                    <td className="py-2.5 px-3 text-center"><CheckIcon checked={vl?.canViewPortfolio ?? false} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DrawerCard>
    </div>
  );
}

function DrawerReportingSources({ dept }: { dept: Department }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Reporting Sources ({dept.reportingSources.length})</SectionTitle>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
        >
          + Add Source
        </button>
      </div>
      <DrawerCard>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b"style={{ borderColor: "var(--rtm-border)"}}>
              <th className="text-left pb-2 text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Source</th>
              <th className="text-left pb-2 text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>System</th>
              <th className="text-left pb-2 text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Data Type</th>
              <th className="text-center pb-2 text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Enabled</th>
            </tr>
          </thead>
          <tbody>
            {dept.reportingSources.map((rs) => (
              <tr key={rs.id} className="border-b last:border-0"style={{ borderColor: "var(--rtm-border)"}}>
                <td className="py-2.5 font-medium text-sm"style={{ color: "var(--rtm-text-primary)"}}>{rs.name}</td>
                <td className="py-2.5 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{rs.system}</td>
                <td className="py-2.5 text-xs"style={{ color: "var(--rtm-text-muted)"}}>{rs.dataType}</td>
                <td className="py-2.5 text-center"><CheckIcon checked={rs.enabled} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DrawerCard>
    </div>
  );
}

function DrawerDeliveryStandards({ dept }: { dept: Department }) {
  const { deliveryStandards: ds } = dept;
  const isNA = ds.targetCompletionDays === 0;
  return (
    <div className="space-y-4">
      {/* Fallback notice */}
      <div className="rounded-xl px-4 py-3"style={{ background: "#FFF7ED", border: "1px solid #FED7AA"}}>
        <div className="flex items-center gap-2 mb-1">
          
          <span className="text-xs font-black uppercase tracking-wide"style={{ color: "#C2410C"}}>Delivery Standards — Fallback Only</span>
        </div>
        <p className="text-xs"style={{ color: "#92400E"}}>
          These are <strong>department-level fallback standards</strong>. They apply only when a line item has no delivery standard configured.
          Line item delivery standards are the primary standard and always override department fallback.
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold"style={{ color: "#C2410C"}}>
          <span className="px-2 py-0.5 rounded-full"style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #FED7AA"}}>Line Item Standards = Primary</span>
          <span>›</span>
          <span className="px-2 py-0.5 rounded-full"style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #FED7AA"}}>Department Standards = Fallback</span>
        </div>
      </div>

      <SectionTitle>Delivery Standards — {dept.name}</SectionTitle>

      {isNA ? (
        <DrawerCard>
          <p className="text-sm italic"style={{ color: "var(--rtm-text-muted)"}}>N/A — This department does not deliver client services.</p>
        </DrawerCard>
      ) : (
        <DrawerCard>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="First Response Standard"value={`${ds.firstResponseDays} business day${ds.firstResponseDays !== 1 ? "s": ""}`} />
            <InfoRow label="Target Completion"value={`${ds.targetCompletionDays} business days`} />
            <InfoRow label="Escalation Trigger"value={`After ${ds.escalationAfterDays} overdue days`} />
            <InfoRow label="Overdue Threshold"value={`${ds.overdueThresholdDays} day${ds.overdueThresholdDays !== 1 ? "s": ""}`} />
          </div>
          <div className="mt-4 pt-4 border-t"style={{ borderColor: "var(--rtm-border)"}}>
            <InfoRow label="Priority Rules"value={ds.priorityRules} />
          </div>
        </DrawerCard>
      )}

      {!isNA && (
        <DrawerCard>
          <SectionTitle>Quick Reference</SectionTitle>
          <div className="space-y-2">
            {[
              { label: "First Response", value: `${ds.firstResponseDays}d`, color: "#059669"},
              { label: "Completion Target", value: `${ds.targetCompletionDays}d`, color: "var(--rtm-blue)"},
              { label: "Escalation Trigger", value: `${ds.escalationAfterDays}d overdue`, color: "#B45309"},
              { label: "Overdue Threshold", value: `${ds.overdueThresholdDays}d past target`, color: "#DC2626"},
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0"style={{ borderColor: "var(--rtm-border)"}}>
                <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{item.label}</span>
                <span className="text-xs font-bold"style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </DrawerCard>
      )}
    </div>
  );
}

function DrawerBlueprints({ dept }: { dept: Department }) {
  const types = Array.from(new Set(dept.blueprints.map((b) => b.type)));
  const typeColors: Record<TaskBlueprintMapping["type"], { bg?: string; color?: string }> = {
    "Task Blueprint": { bg: "#EFF6FF", color: "#1D4ED8"},
    "Recurring Task Blueprint": { bg: "#ECFDF5", color: "#059669"},
    "Approval Blueprint": { bg: "#FFFBEB", color: "#B45309"},
    "Review Blueprint": { bg: "#F5F3FF", color: "#7C3AED"},
    "Renewal Blueprint": { bg: "#FFF0F9", color: "#BE185D"},
    "Offboarding Blueprint": { bg: "#FEF2F2", color: "#DC2626"},
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Task Blueprint Mapping ({dept.blueprints.length})</SectionTitle>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
        >
          + Map Blueprint
        </button>
      </div>

      {types.map((type) => {
        const items = dept.blueprints.filter((b) => b.type === type);
        const tc = typeColors[type];
        return (
          <DrawerCard key={type}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"style={{ background: tc.bg, color: tc.color }}>{type}</span>
              <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{items.length} mapped</span>
            </div>
            <div className="space-y-2">
              {items.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0"style={{ borderColor: "var(--rtm-border)"}}>
                  <div>
                    <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{b.name}</p>
                    <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{b.steps} steps</p>
                  </div>
                  <StatusBadge variant={b.status === "Active"? "success": "neutral"} label={b.status} size="sm"/>
                </div>
              ))}
            </div>
          </DrawerCard>
        );
      })}
    </div>
  );
}

function DrawerPermissions({ dept }: { dept: Department }) {
  const PERMISSIONS = [
    { key: "canApproveWork", label: "Approve Work"},
    { key: "canManageTasks", label: "Manage Tasks"},
    { key: "canManageTemplates", label: "Manage Templates"},
    { key: "canViewFinance", label: "View Finance"},
    { key: "canViewClients", label: "View Clients"},
    { key: "canManageUsers", label: "Manage Users"},
    { key: "canConfigureDashboard", label: "Configure Dashboard"},
    { key: "canManageDeliveryStandards", label: "Manage Delivery Standards"},
    { key: "canViewReports", label: "View Reports"},
    { key: "canManageIntegrations", label: "Manage Integrations"},
    { key: "dashboardAccess", label: "Dashboard Access"},
    { key: "projectAccess", label: "Project Access"},
    { key: "taskAccess", label: "Task Access"},
    { key: "reportingAccess", label: "Reporting Access"},
  ] as const;

  type PermKey = typeof PERMISSIONS[number]["key"];

  return (
    <div className="space-y-4">
      <SectionTitle>Permission Matrix</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ background: "var(--rtm-bg-secondary)"}}>
              <th className="text-left px-3 py-2.5 font-semibold border-b border-r"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)", minWidth: 180 }}>Permission</th>
              {dept.roles.map((role) => (
                <th key={role.id} className="px-3 py-2.5 font-semibold border-b text-center"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", minWidth: 110 }}>
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((perm, i) => (
              <tr key={perm.key} style={{ background: i % 2 === 0 ? "var(--rtm-surface)": "transparent"}}>
                <td className="px-3 py-2 font-medium border-r"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}>{perm.label}</td>
                {dept.roles.map((role) => (
                  <td key={role.id} className="px-3 py-2 text-center">
                    <CheckIcon checked={role[perm.key as PermKey] as boolean} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DrawerActivity({ dept }: { dept: Department }) {
  return (
    <div className="space-y-4">
      <SectionTitle>Activity Log</SectionTitle>
      <DrawerCard>
        <div className="space-y-0">
          {dept.activity.map((entry, i) => (
            <div key={i} className="flex gap-3 py-3 border-b last:border-0"style={{ borderColor: "var(--rtm-border)"}}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)"}}>
                {entry.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm"style={{ color: "var(--rtm-text-primary)"}}>
                  <span className="font-semibold">{entry.user}</span>{""}
                  <span style={{ color: "var(--rtm-text-secondary)"}}>{entry.action}</span>
                </p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{entry.date}</p>
              </div>
            </div>
          ))}
        </div>
      </DrawerCard>
    </div>
  );
}

// 
// DEPARTMENT DRAWER
// 

interface DrawerProps {
  dept: Department;
  onClose: () => void;
  activeTab: DrawerTab;
  setActiveTab: (t: DrawerTab) => void;
}

function DepartmentDrawer({ dept, onClose, activeTab, setActiveTab }: DrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end"style={{ background: "rgba(15,28,56,0.35)"}} onClick={onClose}>
      <div
        className="relative flex flex-col w-full max-w-2xl h-full overflow-hidden"style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)"}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b"style={{ borderColor: "var(--rtm-border)"}}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold"style={{ color: "var(--rtm-text-primary)"}}>{dept.name}</h2>
              <DeptTypeBadge type={dept.departmentType} />
              <StatusBadge variant={deptStatusVariant(dept.status)} label={dept.status} size="sm"/>
            </div>
            <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>/{dept.slug} · {dept.usersCount} users · {dept.roles.length} roles</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none font-bold flex-shrink-0 mt-0.5">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-3 overflow-x-auto border-b"style={{ borderColor: "var(--rtm-border)"}}>
          {DRAWER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "text-white": "hover:bg-slate-100"}`}
              style={
                activeTab === tab.id
                  ? { background: "var(--rtm-blue)", color: "#fff"}
                  : { color: "var(--rtm-text-secondary)"}
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {activeTab === "overview"&& <DrawerOverview dept={dept} />}
          {activeTab === "roles"&& <DrawerRoles dept={dept} />}
          {activeTab === "kpis"&& <DrawerKPIs dept={dept} />}
          {activeTab === "integrations"&& <DrawerIntegrations dept={dept} />}
          {activeTab === "dashboard"&& <DrawerDashboard dept={dept} />}
          {activeTab === "project-visibility"&& <DrawerProjectVisibility dept={dept} />}
          {activeTab === "task-visibility"&& <DrawerTaskVisibility dept={dept} />}
          {activeTab === "reporting-sources"&& <DrawerReportingSources dept={dept} />}
          {activeTab === "delivery-standards"&& <DrawerDeliveryStandards dept={dept} />}
          {activeTab === "blueprints"&& <DrawerBlueprints dept={dept} />}
          {activeTab === "permissions"&& <DrawerPermissions dept={dept} />}
          {activeTab === "activity"&& <DrawerActivity dept={dept} />}
        </div>

        {/* Drawer Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t"style={{ borderColor: "var(--rtm-border)"}}>
          <button className="px-3 py-2 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}>Edit Department</button>
          <button className="px-3 py-2 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}>Manage Roles</button>
          <button className="px-3 py-2 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}>Configure KPIs</button>
          <div className="flex-1"/>
          <button className="px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors"style={{ background: "var(--rtm-blue)"}}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// 
// ROW ACTIONS DROPDOWN
// 

function RowActions({ dept, onView }: { dept: Department; onView: () => void }) {
  const [open, setOpen] = useState(false);
  const actions: (null | { label: string; onClick: () => void })[] = [
    { label: "View Department", onClick: onView },
    { label: "Edit Department", onClick: () => setOpen(false) },
    { label: "Manage Roles", onClick: () => setOpen(false) },
    { label: "Configure KPIs", onClick: () => setOpen(false) },
    { label: "Configure Integrations", onClick: () => setOpen(false) },
    { label: "Configure Dashboard", onClick: () => setOpen(false) },
    { label: "Map Blueprints", onClick: () => setOpen(false) },
    { label: "Delivery Standards", onClick: () => setOpen(false) },
    null,
    { label: "Activate", onClick: () => setOpen(false) },
    { label: "Deactivate", onClick: () => setOpen(false) },
    { label: "Archive", onClick: () => setOpen(false) },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors hover:bg-slate-50"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
      >
        Actions 
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20"onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 z-30 mt-1 w-52 rounded-xl border py-1 shadow-lg"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
          >
            {actions.map((action, i) =>
              action === null ? (
                <div key={i} className="my-1 border-t"style={{ borderColor: "var(--rtm-border)"}} />
              ) : (
                <button
                  key={action.label}
                  onClick={() => { action.onClick(); setOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-colors"style={{ color: "var(--rtm-text-secondary)"}}
                >
                  {action.label}
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

// 
// MAIN PAGE
// 

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeptStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<DepartmentType | "All">("All");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("overview");

  //  Stats 
  const activeDepts = MOCK_DEPARTMENTS.filter((d) => d.status === "Active");
  const pendingDepts = MOCK_DEPARTMENTS.filter((d) => d.status === "Pending Setup");
  const inactiveDepts = MOCK_DEPARTMENTS.filter((d) => d.status === "Inactive");
  const allRoles = MOCK_DEPARTMENTS.flatMap((d) => d.roles);
  const allKpis = MOCK_DEPARTMENTS.flatMap((d) => d.kpis);
  const allIntegrations = MOCK_DEPARTMENTS.flatMap((d) => d.integrations);
  const connectedIntegrations = allIntegrations.filter((i) => i.status === "Connected");
  const dashboardReady = MOCK_DEPARTMENTS.filter((d) => d.dashboard.enabled);
  const missingManager = MOCK_DEPARTMENTS.filter((d) => !d.manager && d.status !== "Archived");
  const allBlueprints = MOCK_DEPARTMENTS.flatMap((d) => d.blueprints);

  const deptTypes: DepartmentType[] = ["Core", "Service", "Support", "Executive"];

  const filtered = MOCK_DEPARTMENTS.filter((d) => {
    const matchSearch =
      search === ""||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.slug.includes(search.toLowerCase()) ||
      d.departmentType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All"|| d.status === statusFilter;
    const matchType = typeFilter === "All"|| d.departmentType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  function openDrawer(dept: Department) {
    setSelectedDept(dept);
    setDrawerTab("overview");
  }

  const kpiCards = [
    { title: "Active Departments", value: String(activeDepts.length), iconBg: "#ECFDF5", iconColor: "#059669"},
    { title: "Pending Setup", value: String(pendingDepts.length + inactiveDepts.length), icon: "⏸", iconBg: "#FFFBEB", iconColor: "#B45309"},
    { title: "Configured Roles", value: String(allRoles.length), iconBg: "var(--rtm-blue-xlight)", iconColor: "var(--rtm-blue)"},
    { title: "KPIs Configured", value: String(allKpis.length), iconBg: "#F5F3FF", iconColor: "#7C3AED"},
    { title: "Integrations", value: String(connectedIntegrations.length), iconBg: "#ECFDF5", iconColor: "#059669"},
    { title: "Blueprints Mapped", value: String(allBlueprints.length), iconBg: "#EFF6FF", iconColor: "#1D4ED8"},
    { title: "Dashboard Ready", value: String(dashboardReady.length), iconBg: "var(--rtm-blue-xlight)", iconColor: "var(--rtm-blue)"},
    { title: "Missing Manager", value: String(missingManager.length), iconBg: "#FEF2F2", iconColor: "#DC2626"},
  ];

  return (
    <div className="space-y-6">
      {/*  Page Header  */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Settings</p>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
            Departments &amp; Roles
          </h1>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-muted)"}}>
            Dynamic department workspace. Configure types, roles, KPIs, integrations, dashboards, visibility, and blueprints without code changes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <button className="px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors"style={{ background: "var(--rtm-blue)"}}>+ New Department</button>
          <button className="px-3 py-2 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}>+ New Role</button>
          <button className="px-3 py-2 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}> Configure KPIs</button>
          <button className="px-3 py-2 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}> Configure Integrations</button>
          <button className="px-3 py-2 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}> Configure Dashboards</button>
          <button className="px-3 py-2 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}> Permission Matrix</button>
          <button className="px-3 py-2 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}> Export Configuration</button>
        </div>
      </div>

      {/*  Architecture Banner  */}
      <div className="rounded-xl border px-5 py-4 flex items-start gap-3"style={{ background: "#EFF6FF", borderColor: "#BFDBFE"}}>
        
        <div>
          <p className="text-sm font-semibold"style={{ color: "#1D4ED8"}}>RTM OS Dynamic Department Architecture</p>
          <p className="text-xs mt-0.5"style={{ color: "#3B82F6"}}>
            Departments are configuration records — not hardcoded pages. Each maps to a future dynamic route at{""}
            <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">/departments/[slug]</code>.{""}
            New services, teams, KPIs, integrations, and dashboard configurations are added here without rebuilding the platform.
          </p>
        </div>
      </div>

      {/*  KPI Cards  */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpiCards.map((card) => (
          <KpiCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={<span className="text-base">{card.icon}</span>}
            iconBg={card.iconBg}
            iconColor={card.iconColor}
          />
        ))}
      </div>

      {/*  Department Type Cards  */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {deptTypes.map((type) => {
          const cfg = DEPT_TYPE_CONFIG[type];
          const count = MOCK_DEPARTMENTS.filter((d) => d.departmentType === type).length;
          const active = MOCK_DEPARTMENTS.filter((d) => d.departmentType === type && d.status === "Active").length;
          const examples: Record<DepartmentType, string> = {
            Core: "Sales · Billing · AM · IT",
            Service: "SEO · PPC · Meta · LSA · AI",
            Support: "Operations · HR · Finance",
            Executive: "Leadership · Management",
          };
          return (
            <div
              key={type}
              className="rounded-xl border p-4 cursor-pointer transition-colors hover:shadow-sm"style={{ background: cfg.bg, borderColor: cfg.border }}
              onClick={() => setTypeFilter(typeFilter === type ? "All": type)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide"style={{ color: cfg.color }}>{type}</span>
                <span className="text-lg font-bold"style={{ color: cfg.color }}>{count}</span>
              </div>
              <p className="text-xs"style={{ color: cfg.color, opacity: 0.8 }}>{active} active</p>
              <p className="text-xs mt-1"style={{ color: cfg.color, opacity: 0.65 }}>{examples[type]}</p>
            </div>
          );
        })}
      </div>

      {/*  Filters  */}
      <div
        className="rounded-xl border px-5 py-4 flex flex-wrap items-center gap-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
      >
        <input
          type="text"placeholder="Search departments..."value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 flex-1 min-w-[200px]"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)"}}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as DepartmentType | "All")}
          className="px-3 py-2 rounded-lg border text-sm outline-none"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)"}}
        >
          <option value="All">All Types</option>
          {deptTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DeptStatus | "All")}
          className="px-3 py-2 rounded-lg border text-sm outline-none"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)"}}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending Setup">Pending Setup</option>
          <option value="Archived">Archived</option>
        </select>
        {(typeFilter !== "All"|| statusFilter !== "All"|| search !== "") && (
          <button
            onClick={() => { setTypeFilter("All"); setStatusFilter("All"); setSearch(""); }}
            className="px-3 py-2 rounded-lg border text-xs font-semibold hover:bg-slate-50 transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
          >
            Clear Filters
          </button>
        )}
        <span className="text-xs ml-auto"style={{ color: "var(--rtm-text-muted)"}}>
          {filtered.length} of {MOCK_DEPARTMENTS.length} departments
        </span>
      </div>

      {/*  Department Table  */}
      <div
        className="rounded-xl border overflow-hidden"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--rtm-bg-secondary)", borderBottom: "1px solid var(--rtm-border)"}}>
                {[
                  "Department Name",
                  "Type",
                  "Manager",
                  "Status",
                  "Roles",
                  "KPIs",
                  "Integrations",
                  "Projects Enabled",
                  "Dashboard Enabled",
                  "Users",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((dept, i) => (
                <tr
                  key={dept.id}
                  className="border-b transition-colors hover:bg-slate-50 cursor-pointer"style={{ borderColor: "var(--rtm-border)", background: i % 2 === 1 ? "transparent": undefined }}
                  onClick={() => openDrawer(dept)}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{dept.name}</p>
                    <p className="text-xs mt-0.5 truncate max-w-[180px]"style={{ color: "var(--rtm-text-muted)"}}>{dept.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <DeptTypeBadge type={dept.departmentType} />
                  </td>
                  <td className="px-4 py-3 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                    {dept.manager || <span className="italic text-amber-500">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={deptStatusVariant(dept.status)} label={dept.status} size="sm"/>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"style={{ background: "#EFF6FF", color: "#3B82F6"}}>{dept.roles.length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"style={{ background: "#F5F3FF", color: "#7C3AED"}}>{dept.kpis.length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"style={{ background: "#ECFDF5", color: "#059669"}}>{dept.integrations.length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <CheckIcon checked={dept.projectModule.canViewProjects} />
                  </td>
                  <td className="px-4 py-3">
                    {dept.dashboard.enabled ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"style={{ background: "#ECFDF5", color: "#059669"}}>Ready</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"style={{ background: "#F8FAFC", color: "#64748B"}}>Not Set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                    {dept.usersCount}
                  </td>
                  <td className="px-4 py-3"onClick={(e) => e.stopPropagation()}>
                    <RowActions dept={dept} onView={() => openDrawer(dept)} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-sm"style={{ color: "var(--rtm-text-muted)"}}>
                    No departments match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/*  Summary Footer  */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* By Type */}
        <div className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4"style={{ color: "var(--rtm-text-muted)"}}>Departments by Type</p>
          <div className="space-y-2">
            {deptTypes.map((type) => {
              const cfg = DEPT_TYPE_CONFIG[type];
              const count = MOCK_DEPARTMENTS.filter((d) => d.departmentType === type).length;
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"style={{ background: cfg.bg, color: cfg.color }}>{type}</span>
                  <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Status */}
        <div className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4"style={{ color: "var(--rtm-text-muted)"}}>Departments by Status</p>
          <div className="space-y-2">
            {(["Active", "Inactive", "Pending Setup", "Archived"] as DeptStatus[]).map((s) => {
              const count = MOCK_DEPARTMENTS.filter((d) => d.status === s).length;
              return (
                <div key={s} className="flex items-center justify-between">
                  <StatusBadge variant={deptStatusVariant(s)} label={s} size="sm"/>
                  <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Visibility Levels in use */}
        <div className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4"style={{ color: "var(--rtm-text-muted)"}}>Visibility Levels in Use</p>
          <div className="space-y-2">
            {([1, 2, 3, 4, 5] as ProjectVisibilityLevel[]).map((level) => {
              const count = MOCK_DEPARTMENTS.flatMap((d) => d.roles).filter((r) => r.projectVisibilityLevel === level).length;
              const lbl = PROJECT_VISIBILITY_LEVELS.find((v) => v.level === level)?.label ?? "";
              return (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>L{level} {lbl}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"style={{ background: VISIBILITY_COLORS[level].bg, color: VISIBILITY_COLORS[level].color }}>{count} roles</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/*  Department Detail Drawer  */}
      {selectedDept && (
        <DepartmentDrawer
          dept={selectedDept}
          onClose={() => setSelectedDept(null)}
          activeTab={drawerTab}
          setActiveTab={setDrawerTab}
        />
      )}
    </div>
  );
}