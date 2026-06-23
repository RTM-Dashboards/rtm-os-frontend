// ─── Account Management Operational Dashboard Data ───────────────────────────
// lib/am-data.ts — single source of truth for the AM dashboard

import type { ActivityItem } from "@/components/ui";

// ─── Onboarding / Launch Queue ─────────────────────────────────────────────────

export type LaunchReadiness =
  | "Payment Confirmed"| "Awaiting Launch"| "Ready to Launch"| "Blocked"| "In Progress";

export type DeptStatus = "Done"| "In Progress"| "Not Started"| "Blocked";

export interface OnboardingQueueItem {
  id: string;
  clientName: string;
  assignedAM: string;
  services: string[];
  paymentStatus: "Confirmed"| "Pending"| "Failed";
  launchReadiness: LaunchReadiness;
  targetLaunchDate: string;
  completedSteps: number;
  totalSteps: number;
  blockedReason?: string;
  priority: "Critical"| "High"| "Medium"| "Low";
}

export const onboardingQueue: OnboardingQueueItem[] = [
  {
    id: "oq001",
    clientName: "Blue Sky Solar Panels",
    assignedAM: "Sarah Chen",
    services: ["SEO", "Meta Ads", "Content", "Design"],
    paymentStatus: "Confirmed",
    launchReadiness: "Payment Confirmed",
    targetLaunchDate: "2025-06-12",
    completedSteps: 2,
    totalSteps: 10,
    priority: "High",
  },
  {
    id: "oq002",
    clientName: "Precision Auto Repair",
    assignedAM: "Maria Santos",
    services: ["GBP", "SEO", "Reviews"],
    paymentStatus: "Confirmed",
    launchReadiness: "Ready to Launch",
    targetLaunchDate: "2025-06-09",
    completedSteps: 8,
    totalSteps: 8,
    priority: "Critical",
  },
  {
    id: "oq003",
    clientName: "Metro Electrical Services",
    assignedAM: "James Rivera",
    services: ["PPC", "LSA", "GBP"],
    paymentStatus: "Confirmed",
    launchReadiness: "Blocked",
    targetLaunchDate: "2025-06-10",
    completedSteps: 3,
    totalSteps: 9,
    blockedReason: "Client not responding — 14 days",
    priority: "Critical",
  },
  {
    id: "oq004",
    clientName: "Elite Pet Grooming",
    assignedAM: "Maria Santos",
    services: ["GBP", "SEO", "Reviews"],
    paymentStatus: "Confirmed",
    launchReadiness: "Awaiting Launch",
    targetLaunchDate: "2025-07-03",
    completedSteps: 0,
    totalSteps: 7,
    priority: "Medium",
  },
  {
    id: "oq005",
    clientName: "Sunrise Orthodontics",
    assignedAM: "Sarah Chen",
    services: ["SEO", "PPC", "Design"],
    paymentStatus: "Confirmed",
    launchReadiness: "In Progress",
    targetLaunchDate: "2025-06-20",
    completedSteps: 4,
    totalSteps: 9,
    priority: "High",
  },
  {
    id: "oq006",
    clientName: "Mountain View Electricians",
    assignedAM: "James Rivera",
    services: ["LSA", "GBP"],
    paymentStatus: "Pending",
    launchReadiness: "Awaiting Launch",
    targetLaunchDate: "2025-06-25",
    completedSteps: 0,
    totalSteps: 6,
    priority: "Low",
  },
];

// ─── Department Launch Assignment Status ──────────────────────────────────────

export interface DeptLaunchRow {
  clientName: string;
  department: string;
  assignedTo: string;
  taskName: string;
  status: DeptStatus;
  dueDate: string;
  notes?: string;
}

export const deptLaunchStatus: DeptLaunchRow[] = [
  {
    clientName: "Precision Auto Repair",
    department: "SEO",
    assignedTo: "Alex Kim",
    taskName: "Initial site audit + keyword mapping",
    status: "Done",
    dueDate: "2025-06-05",
  },
  {
    clientName: "Precision Auto Repair",
    department: "GBP",
    assignedTo: "Dana Wong",
    taskName: "GBP listing verification & optimisation",
    status: "In Progress",
    dueDate: "2025-06-09",
  },
  {
    clientName: "Precision Auto Repair",
    department: "Reviews",
    assignedTo: "Tom Bell",
    taskName: "Review generation setup & first outreach",
    status: "Not Started",
    dueDate: "2025-06-09",
  },
  {
    clientName: "Blue Sky Solar Panels",
    department: "Design",
    assignedTo: "Lisa Park",
    taskName: "Landing page design — v1",
    status: "Not Started",
    dueDate: "2025-06-14",
  },
  {
    clientName: "Blue Sky Solar Panels",
    department: "Meta Ads",
    assignedTo: "Tom Bell",
    taskName: "Ad account setup + creatives",
    status: "Not Started",
    dueDate: "2025-06-12",
    notes: "Awaiting brand assets from client",
  },
  {
    clientName: "Blue Sky Solar Panels",
    department: "SEO",
    assignedTo: "Alex Kim",
    taskName: "Technical SEO kickoff",
    status: "In Progress",
    dueDate: "2025-06-12",
  },
  {
    clientName: "Metro Electrical Services",
    department: "PPC",
    assignedTo: "Maria Santos",
    taskName: "Campaign structure draft",
    status: "Blocked",
    dueDate: "2025-06-10",
    notes: "Client unresponsive — access not granted",
  },
  {
    clientName: "Sunrise Orthodontics",
    department: "Design",
    assignedTo: "Lisa Park",
    taskName: "Brand kit review",
    status: "Done",
    dueDate: "2025-06-08",
  },
  {
    clientName: "Sunrise Orthodontics",
    department: "PPC",
    assignedTo: "James Rivera",
    taskName: "Google Ads account audit",
    status: "In Progress",
    dueDate: "2025-06-15",
  },
];

// ─── Cross-Department Task Oversight ──────────────────────────────────────────

export type CrossDeptTaskStatus = "On Track"| "At Risk"| "Overdue"| "Blocked"| "Complete";

export interface CrossDeptTask {
  id: string;
  clientName: string;
  taskName: string;
  ownerDept: string;
  dependsOn: string;
  assignedTo: string;
  dueDate: string;
  status: CrossDeptTaskStatus;
  blockerNote?: string;
}

export const crossDeptTasks: CrossDeptTask[] = [
  {
    id: "cd001",
    clientName: "Harbor View Realty",
    taskName: "Lead quality audit report",
    ownerDept: "Account Mgmt",
    dependsOn: "CRM / Sales",
    assignedTo: "James Rivera",
    dueDate: "2025-06-05",
    status: "Overdue",
    blockerNote: "CRM API key not provided by client",
  },
  {
    id: "cd002",
    clientName: "Bright Minds Tutoring",
    taskName: "Landing page design",
    ownerDept: "Design",
    dependsOn: "Client (assets)",
    assignedTo: "Tom Bell",
    dueDate: "2025-06-08",
    status: "Blocked",
    blockerNote: "Missing brand assets",
  },
  {
    id: "cd003",
    clientName: "CloudPath Tech Solutions",
    taskName: "Q2 executive report",
    ownerDept: "Reporting",
    dependsOn: "PPC / SEO",
    assignedTo: "Sarah Chen",
    dueDate: "2025-06-30",
    status: "On Track",
  },
  {
    id: "cd004",
    clientName: "Peak Performance HVAC",
    taskName: "Meta ads creative refresh",
    ownerDept: "Paid Media",
    dependsOn: "Design",
    assignedTo: "Tom Bell",
    dueDate: "2025-06-01",
    status: "Overdue",
    blockerNote: "Ad account access revoked",
  },
  {
    id: "cd005",
    clientName: "GreenLeaf Landscaping",
    taskName: "Q3 content calendar",
    ownerDept: "Content",
    dependsOn: "Account Mgmt",
    assignedTo: "Dana Wong",
    dueDate: "2025-06-20",
    status: "On Track",
  },
  {
    id: "cd006",
    clientName: "Summit Roofing Group",
    taskName: "Q3 PPC strategy document",
    ownerDept: "Paid Media",
    dependsOn: "Client (budget)",
    assignedTo: "Maria Santos",
    dueDate: "2025-05-25",
    status: "Overdue",
    blockerNote: "Budget not confirmed",
  },
];

// ─── Service Status Table ──────────────────────────────────────────────────────

export type ServiceStatusLevel = "Operational"| "Degraded"| "Paused"| "Launching"| "Offline";

export interface ServiceStatusRow {
  clientName: string;
  service: string;
  status: ServiceStatusLevel;
  assignedTo: string;
  lastUpdated: string;
  note?: string;
}

export const serviceStatusRows: ServiceStatusRow[] = [
  { clientName: "Coastal Plumbing Co.",    service: "SEO",       status: "Operational", assignedTo: "Alex Kim",     lastUpdated: "Jun 3"},
  { clientName: "Coastal Plumbing Co.",    service: "Meta Ads",  status: "Operational", assignedTo: "Tom Bell",     lastUpdated: "Jun 2"},
  { clientName: "Peak Performance HVAC",   service: "Meta Ads",  status: "Paused",      assignedTo: "Tom Bell",     lastUpdated: "Jun 1",  note: "Account access revoked"},
  { clientName: "Peak Performance HVAC",   service: "PPC",       status: "Degraded",    assignedTo: "James Rivera", lastUpdated: "May 31", note: "Reports 2 months behind"},
  { clientName: "Summit Roofing Group",    service: "PPC",       status: "Paused",      assignedTo: "Maria Santos", lastUpdated: "May 28", note: "Budget dispute"},
  { clientName: "Summit Roofing Group",    service: "LSA",       status: "Operational", assignedTo: "Maria Santos", lastUpdated: "Jun 2"},
  { clientName: "Luxe Dental Spa",         service: "SEO",       status: "Operational", assignedTo: "Alex Kim",     lastUpdated: "Jun 3"},
  { clientName: "Harbor View Realty",      service: "Meta Ads",  status: "Degraded",    assignedTo: "Tom Bell",     lastUpdated: "May 30", note: "Lead quality complaints"},
  { clientName: "CloudPath Tech Solutions",service: "PPC",       status: "Operational", assignedTo: "James Rivera", lastUpdated: "Jun 3"},
  { clientName: "Precision Auto Repair",   service: "GBP",       status: "Launching",   assignedTo: "Dana Wong",    lastUpdated: "Jun 4"},
  { clientName: "Blue Sky Solar Panels",   service: "Meta Ads",  status: "Launching",   assignedTo: "Tom Bell",     lastUpdated: "Jun 4"},
];

// ─── Client Health Table ───────────────────────────────────────────────────────

export type ClientHealthStatus = "Healthy"| "Needs Attention"| "At-Risk"| "Critical";

export interface ClientHealthRow {
  id: string;
  name: string;
  assignedAM: string;
  industry: string;
  healthStatus: ClientHealthStatus;
  score: number;
  monthlyRevenue: number;
  renewalDate: string;
  openDeliverables: number;
  reportsOverdue: number;
  lastContact: string;
}

export const clientHealthRows: ClientHealthRow[] = [
  { id: "c001", name: "Coastal Plumbing Co.",     assignedAM: "Sarah Chen",   industry: "Home Services",   healthStatus: "Healthy",          score: 94, monthlyRevenue: 4500, renewalDate: "2025-03-15", openDeliverables: 2, reportsOverdue: 0, lastContact: "Jun 3"},
  { id: "c002", name: "Peak Performance HVAC",    assignedAM: "James Rivera", industry: "HVAC",             healthStatus: "At-Risk",           score: 52, monthlyRevenue: 6200, renewalDate: "2025-09-01", openDeliverables: 5, reportsOverdue: 2, lastContact: "May 10"},
  { id: "c003", name: "Luxe Dental Spa",          assignedAM: "Sarah Chen",   industry: "Dental",           healthStatus: "Healthy",          score: 91, monthlyRevenue: 3800, renewalDate: "2026-01-10", openDeliverables: 1, reportsOverdue: 0, lastContact: "Jun 1"},
  { id: "c004", name: "Summit Roofing Group",     assignedAM: "Maria Santos", industry: "Roofing",          healthStatus: "Critical",         score: 38, monthlyRevenue: 5100, renewalDate: "2025-08-01", openDeliverables: 8, reportsOverdue: 3, lastContact: "Apr 22"},
  { id: "c005", name: "GreenLeaf Landscaping",    assignedAM: "James Rivera", industry: "Landscaping",      healthStatus: "Needs Attention",  score: 68, monthlyRevenue: 2900, renewalDate: "2025-10-01", openDeliverables: 3, reportsOverdue: 1, lastContact: "May 20"},
  { id: "c006", name: "Urban Fitness Studio",     assignedAM: "Maria Santos", industry: "Fitness",          healthStatus: "Healthy",          score: 88, monthlyRevenue: 3200, renewalDate: "2025-11-01", openDeliverables: 2, reportsOverdue: 0, lastContact: "Jun 2"},
  { id: "c007", name: "Bright Minds Tutoring",    assignedAM: "Sarah Chen",   industry: "Education",        healthStatus: "Needs Attention",  score: 72, monthlyRevenue: 2200, renewalDate: "2025-08-15", openDeliverables: 4, reportsOverdue: 1, lastContact: "May 15"},
  { id: "c008", name: "Harbor View Realty",       assignedAM: "James Rivera", industry: "Real Estate",      healthStatus: "At-Risk",           score: 55, monthlyRevenue: 7500, renewalDate: "2025-07-01", openDeliverables: 6, reportsOverdue: 2, lastContact: "Apr 30"},
  { id: "c009", name: "Precision Auto Repair",    assignedAM: "Maria Santos", industry: "Automotive",       healthStatus: "Healthy",          score: 82, monthlyRevenue: 1800, renewalDate: "2026-06-01", openDeliverables: 1, reportsOverdue: 0, lastContact: "Jun 1"},
  { id: "c010", name: "CloudPath Tech Solutions", assignedAM: "Sarah Chen",   industry: "Tech / SaaS",      healthStatus: "Healthy",          score: 96, monthlyRevenue: 9800, renewalDate: "2025-12-31", openDeliverables: 3, reportsOverdue: 0, lastContact: "Jun 3"},
];

// ─── Renewal Report Panel ──────────────────────────────────────────────────────

export interface RenewalItem {
  clientName: string;
  assignedAM: string;
  renewalDate: string;
  monthlyRevenue: number;
  healthStatus: ClientHealthStatus;
  renewalRisk: "Low"| "Medium"| "High"| "Critical";
  actionNeeded: string;
}

export const upcomingRenewals: RenewalItem[] = [
  {
    clientName: "Summit Roofing Group",
    assignedAM: "Maria Santos",
    renewalDate: "2025-08-01",
    monthlyRevenue: 5100,
    healthStatus: "Critical",
    renewalRisk: "Critical",
    actionNeeded: "Director call — budget dispute must resolve before renewal",
  },
  {
    clientName: "Harbor View Realty",
    assignedAM: "James Rivera",
    renewalDate: "2025-07-01",
    monthlyRevenue: 7500,
    healthStatus: "At-Risk",
    renewalRisk: "High",
    actionNeeded: "Strategy session on 6/5 — lead quality remediation required",
  },
  {
    clientName: "Bright Minds Tutoring",
    assignedAM: "Sarah Chen",
    renewalDate: "2025-08-15",
    monthlyRevenue: 2200,
    healthStatus: "Needs Attention",
    renewalRisk: "Medium",
    actionNeeded: "Complete delayed deliverables before renewal conversation",
  },
  {
    clientName: "GreenLeaf Landscaping",
    assignedAM: "James Rivera",
    renewalDate: "2025-10-01",
    monthlyRevenue: 2900,
    healthStatus: "Needs Attention",
    renewalRisk: "Medium",
    actionNeeded: "Q3 content calendar — results improving",
  },
  {
    clientName: "Urban Fitness Studio",
    assignedAM: "Maria Santos",
    renewalDate: "2025-11-01",
    monthlyRevenue: 3200,
    healthStatus: "Healthy",
    renewalRisk: "Low",
    actionNeeded: "Begin upsell conversation — strong ROAS",
  },
];

// ─── Health Distribution Panel ────────────────────────────────────────────────

export const healthDistribution = [
  { label: "Healthy",          count: 4, color: "#10B981"},
  { label: "Needs Attention",  count: 2, color: "#F59E0B"},
  { label: "At-Risk",          count: 2, color: "#EF4444"},
  { label: "Critical",         count: 1, color: "#991B1B"},
];

// ─── AM Activity Feed ─────────────────────────────────────────────────────────

export const amActivityFeed: ActivityItem[] = [
  { id: "a01", actor: "Sarah Chen",   action: "completed onboarding call for", target: "Blue Sky Solar Panels",     timestamp: "20 min ago", type: "client",   avatarColor: "#1B4FD8"},
  { id: "a02", actor: "Maria Santos", action: "escalated cancellation risk for", target: "Summit Roofing Group",  timestamp: "45 min ago", type: "alert",    avatarColor: "#DC2626"},
  { id: "a03", actor: "James Rivera", action: "sent renewal proposal to",       target: "Harbor View Realty",      timestamp: "1h ago",     type: "report",   avatarColor: "#059669"},
  { id: "a04", actor: "Sarah Chen",   action: "marked check-in complete for",   target: "CloudPath Tech Solutions",timestamp: "2h ago",     type: "task",     avatarColor: "#1B4FD8"},
  { id: "a05", actor: "Alex Kim",     action: "delivered SEO report for",       target: "Coastal Plumbing Co.",    timestamp: "3h ago",     type: "report",   avatarColor: "#7C3AED"},
  { id: "a06", actor: "Tom Bell",     action: "blocked — awaiting assets from", target: "Bright Minds Tutoring",   timestamp: "3h ago",     type: "alert",    avatarColor: "#D97706"},
  { id: "a07", actor: "James Rivera", action: "logged strategy call with",      target: "Peak Performance HVAC",   timestamp: "4h ago",     type: "task",     avatarColor: "#059669"},
  { id: "a08", actor: "Maria Santos", action: "launched GBP for",               target: "Precision Auto Repair",   timestamp: "5h ago",     type: "campaign", avatarColor: "#DC2626"},
  { id: "a09", actor: "Dana Wong",    action: "submitted Q3 content plan for",  target: "GreenLeaf Landscaping",   timestamp: "6h ago",     type: "task",     avatarColor: "#0891B2"},
  { id: "a10", actor: "System",       action: "auto-flagged renewal risk for",  target: "Summit Roofing Group",    timestamp: "8h ago",     type: "system",   avatarColor: "#94A3B8"},
];
