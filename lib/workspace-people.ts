/**
 * Shared mock data for workspace user management pages.
 * Used by WorkspaceProfilePage, WorkspaceTeamMembersPage, WorkspaceRolesPage.
 */

import type { StatusVariant } from "@/components/ui";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PermLevel = "full" | "partial" | "own" | "none";

export interface TeamMemberRow {
  user: string;
  initials: string;
  email: string;
  role: string;
  accessLevel: string;
  accessVariant: StatusVariant;
  status: string;
  statusVariant: StatusVariant;
  assignedClients: string[];
  lastActive: string;
  department?: string;
}

export interface RoleDef {
  name: string;
  badge: { bg: string; color: string; border: string };
  description: string;
  memberCount: number;
}

export interface PermissionArea {
  area: string;
  description: string;
  perms: Record<string, PermLevel>;
}

export interface WorkspaceProfileData {
  name: string;
  initials: string;
  email: string;
  department: string;
  role: string;
  accessLevel: string;
  accessVariant: StatusVariant;
  phone?: string;
  assignedClients: string[];
  lastLogin: string;
  joinedDate: string;
  timezone: string;
}

// ── Permission level config (shared) ─────────────────────────────────────────

export const permLevelConfig: Record<
  PermLevel,
  { icon: string; label: string; bg: string; color: string; border: string }
> = {
  full:    { icon: "✓",  label: "Full",    bg: "#ECFDF5",              color: "#059669",          border: "#A7F3D0" },
  partial: { icon: "◑",  label: "Partial", bg: "#FFFBEB",              color: "#B45309",          border: "#FDE68A" },
  own:     { icon: "⊙",  label: "Own",     bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", border: "var(--rtm-blue-light)" },
  none:    { icon: "—",  label: "None",    bg: "#F8FAFC",              color: "#CBD5E1",          border: "#E2E8F0" },
};

// ── Per-workspace data ────────────────────────────────────────────────────────

// ─── Account Management ───────────────────────────────────────────────────────

export const accountManagementProfile: WorkspaceProfileData = {
  name: "Jordan Mitchell",
  initials: "JM",
  email: "jordan.mitchell@rtm.agency",
  department: "Account Management",
  role: "Senior Account Manager",
  accessLevel: "Manager",
  accessVariant: "info",
  phone: "+1 (555) 204-8811",
  assignedClients: ["Apex Roofing", "Pacific Dental", "Summit Landscaping"],
  lastLogin: "Today at 9:14 AM",
  joinedDate: "March 12, 2022",
  timezone: "PST (UTC−8)",
};

export const accountManagementMembers: TeamMemberRow[] = [
  {
    user: "Dana Pham",
    initials: "DP",
    email: "dana.pham@rtm.agency",
    role: "Department Head",
    accessLevel: "Department Head",
    accessVariant: "error",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (All)"],
    lastActive: "Today, 9:02 AM",
  },
  {
    user: "Jordan Mitchell",
    initials: "JM",
    email: "jordan.mitchell@rtm.agency",
    role: "Senior Account Manager",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Apex Roofing", "Pacific Dental", "Summit Landscaping"],
    lastActive: "Today, 9:14 AM",
  },
  {
    user: "Sarah Kowalski",
    initials: "SK",
    email: "sarah.kowalski@rtm.agency",
    role: "Account Manager",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Sunbelt HVAC", "Metro Dental"],
    lastActive: "Today, 8:52 AM",
  },
  {
    user: "Mike Torres",
    initials: "MT",
    email: "mike.torres@rtm.agency",
    role: "Account Manager",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Harbor Auto Group"],
    lastActive: "Yesterday, 4:30 PM",
  },
  {
    user: "Alex Rivera",
    initials: "AR",
    email: "alex.rivera@rtm.agency",
    role: "Junior Account Manager",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Blue Ridge Plumbing", "Green Valley Pools"],
    lastActive: "Today, 7:45 AM",
  },
  {
    user: "Chris Nguyen",
    initials: "CN",
    email: "chris.nguyen@rtm.agency",
    role: "AM Coordinator",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "On Leave",
    statusVariant: "warning",
    assignedClients: ["Summit Landscaping"],
    lastActive: "3 days ago",
  },
  {
    user: "Priya Sharma",
    initials: "PS",
    email: "priya.sharma@rtm.agency",
    role: "Reporting Specialist",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (Read-only)"],
    lastActive: "Today, 6:58 AM",
  },
];

export const accountManagementRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
    description: "Full access — owns strategy, budget, team, and all client data.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", border: "var(--rtm-blue-light)" },
    description: "Manages a pod of AMs, approves deliverables, reviews performance.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
    description: "Day-to-day client ops, check-ins, task management across assigned clients.",
    memberCount: 3,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    description: "Focused execution on specific deliverables; limited edit scope.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
    description: "Read-only access to reporting, client data, and dashboards.",
    memberCount: 1,
  },
];

export const accountManagementPermissions: PermissionArea[] = [
  {
    area: "Dashboard",
    description: "View workspace dashboard & KPIs",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "Client Portfolio",
    description: "View client list and health scores",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Client Edit",
    description: "Edit client details, services, contacts",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "none" },
  },
  {
    area: "Team Members",
    description: "View team members and assignments",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Roles & Permissions",
    description: "Manage roles and access levels",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Check-ins",
    description: "Log & view client check-ins",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Tasks",
    description: "Create, assign, and complete tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "none" },
  },
  {
    area: "Reports",
    description: "Generate and send client reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "partial", Viewer: "full" },
  },
  {
    area: "Performance",
    description: "View and export performance metrics",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "full" },
  },
  {
    area: "Budget / Billing",
    description: "View & manage department budget",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
];

// ─── Sales ────────────────────────────────────────────────────────────────────

export const salesProfile: WorkspaceProfileData = {
  name: "Marcus Webb",
  initials: "MW",
  email: "marcus.webb@rtm.agency",
  department: "Sales",
  role: "Senior Sales Executive",
  accessLevel: "Manager",
  accessVariant: "info",
  phone: "+1 (555) 318-7422",
  assignedClients: ["New Prospects", "Northgate Dental", "SolarEdge Installs"],
  lastLogin: "Today at 8:47 AM",
  joinedDate: "July 3, 2021",
  timezone: "EST (UTC−5)",
};

export const salesMembers: TeamMemberRow[] = [
  {
    user: "Rachel Torres",
    initials: "RT",
    email: "rachel.torres@rtm.agency",
    role: "Sales Director",
    accessLevel: "Department Head",
    accessVariant: "error",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (All)"],
    lastActive: "Today, 8:35 AM",
  },
  {
    user: "Marcus Webb",
    initials: "MW",
    email: "marcus.webb@rtm.agency",
    role: "Senior Sales Executive",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["New Prospects", "Northgate Dental", "SolarEdge Installs"],
    lastActive: "Today, 8:47 AM",
  },
  {
    user: "Caitlin Park",
    initials: "CP",
    email: "caitlin.park@rtm.agency",
    role: "Sales Executive",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["TrueGreen Lawn", "FastTrack Legal"],
    lastActive: "Today, 9:01 AM",
  },
  {
    user: "Devon Hall",
    initials: "DH",
    email: "devon.hall@rtm.agency",
    role: "Sales Development Rep",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Cold Outreach"],
    lastActive: "Today, 7:58 AM",
  },
  {
    user: "Brianna Lee",
    initials: "BL",
    email: "brianna.lee@rtm.agency",
    role: "Sales Coordinator",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Pipeline Support"],
    lastActive: "Yesterday, 5:12 PM",
  },
  {
    user: "Evan Cho",
    initials: "EC",
    email: "evan.cho@rtm.agency",
    role: "Sales Analyst",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "On Leave",
    statusVariant: "warning",
    assignedClients: ["— (Read-only)"],
    lastActive: "4 days ago",
  },
];

export const salesRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
    description: "Full pipeline & team ownership, quota targets, and budget authority.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
    description: "Leads sales pod, coaches reps, reviews and approves proposals.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
    description: "Manages daily lead flow, schedules demos, tracks pipeline stages.",
    memberCount: 2,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    description: "SDR-level outreach, qualifies inbound leads, sets appointments.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
    description: "Read-only access to pipeline data, proposals, and reports.",
    memberCount: 1,
  },
];

export const salesPermissions: PermissionArea[] = [
  {
    area: "Dashboard",
    description: "View sales dashboard & pipeline KPIs",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "Leads",
    description: "View and manage incoming leads",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Lead Assignment",
    description: "Assign leads to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Proposals",
    description: "Create, edit, and send proposals",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "none", Viewer: "full" },
  },
  {
    area: "Pipeline",
    description: "View and update deal stages",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Follow-ups",
    description: "Log and schedule follow-up actions",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "none" },
  },
  {
    area: "Performance",
    description: "View rep performance and quota data",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Team Members",
    description: "View and manage team assignments",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Roles & Permissions",
    description: "Configure role access levels",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Tasks",
    description: "Create and manage tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "none" },
  },
  {
    area: "Reports",
    description: "Export and review sales reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "full" },
  },
  {
    area: "Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
];

// ─── Billing ──────────────────────────────────────────────────────────────────

export const billingProfile: WorkspaceProfileData = {
  name: "Cassandra Hill",
  initials: "CH",
  email: "cassandra.hill@rtm.agency",
  department: "Billing",
  role: "Billing Operations Manager",
  accessLevel: "Manager",
  accessVariant: "info",
  phone: "+1 (555) 492-3301",
  assignedClients: ["Harbor Auto Group", "Pacific Dental", "Metro Dental"],
  lastLogin: "Today at 7:55 AM",
  joinedDate: "January 18, 2020",
  timezone: "CST (UTC−6)",
};

export const billingMembers: TeamMemberRow[] = [
  {
    user: "Thomas Greer",
    initials: "TG",
    email: "thomas.greer@rtm.agency",
    role: "Billing Director",
    accessLevel: "Department Head",
    accessVariant: "error",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (All)"],
    lastActive: "Today, 8:10 AM",
  },
  {
    user: "Cassandra Hill",
    initials: "CH",
    email: "cassandra.hill@rtm.agency",
    role: "Billing Operations Manager",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Harbor Auto Group", "Pacific Dental", "Metro Dental"],
    lastActive: "Today, 7:55 AM",
  },
  {
    user: "Nadia Okonkwo",
    initials: "NO",
    email: "nadia.okonkwo@rtm.agency",
    role: "Billing Specialist",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Sunbelt HVAC", "Blue Ridge Plumbing"],
    lastActive: "Today, 9:22 AM",
  },
  {
    user: "Felix Reyes",
    initials: "FR",
    email: "felix.reyes@rtm.agency",
    role: "Collections Specialist",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Apex Roofing", "Summit Landscaping"],
    lastActive: "Today, 8:33 AM",
  },
  {
    user: "Yuki Tanaka",
    initials: "YT",
    email: "yuki.tanaka@rtm.agency",
    role: "Billing Analyst",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (Analysis only)"],
    lastActive: "Yesterday, 3:45 PM",
  },
  {
    user: "Sam Butler",
    initials: "SB",
    email: "sam.butler@rtm.agency",
    role: "Finance Viewer",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "Inactive",
    statusVariant: "neutral",
    assignedClients: ["— (Read-only)"],
    lastActive: "2 weeks ago",
  },
];

export const billingRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
    description: "Full financial authority — invoices, collections, offboarding, and team.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    description: "Oversees billing operations, approves adjustments, manages escalations.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
    description: "Processes invoices, handles collections, manages service activations.",
    memberCount: 2,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    description: "Focused financial analysis, data reconciliation, and report generation.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
    description: "Read-only access to invoices, billing history, and financial reports.",
    memberCount: 1,
  },
];

export const billingPermissions: PermissionArea[] = [
  {
    area: "Dashboard",
    description: "View billing dashboard & revenue KPIs",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "Invoices",
    description: "Create, edit, and send invoices",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "partial", Viewer: "full" },
  },
  {
    area: "Invoice Approval",
    description: "Approve invoices before sending",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Active Services",
    description: "View and manage active client services",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full" },
  },
  {
    area: "Cancellations",
    description: "Process and approve cancellations",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "none", Viewer: "full" },
  },
  {
    area: "Offboarding",
    description: "Trigger and track offboarding workflows",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Collections",
    description: "Manage overdue accounts and collections",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "partial", Viewer: "none" },
  },
  {
    area: "Client Portfolio",
    description: "View client billing records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "Team Members",
    description: "View and manage team assignments",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Roles & Permissions",
    description: "Configure role access levels",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Reports",
    description: "Generate financial and billing reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "full", Viewer: "full" },
  },
  {
    area: "Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
];

// ─── Content ──────────────────────────────────────────────────────────────────

export const contentProfile: WorkspaceProfileData = {
  name: "Maya Torres",
  initials: "MT",
  email: "maya.torres@rtm.agency",
  department: "Content",
  role: "Senior Content Strategist",
  accessLevel: "Manager",
  accessVariant: "info",
  phone: "+1 (555) 318-7742",
  assignedClients: ["Apex Roofing", "Summit Landscaping", "Green Valley Dental"],
  lastLogin: "Today at 8:30 AM",
  joinedDate: "July 5, 2021",
  timezone: "PST (UTC−8)",
};

export const contentMembers: TeamMemberRow[] = [
  {
    user: "Lydia Park",
    initials: "LP",
    email: "lydia.park@rtm.agency",
    role: "Content Director",
    accessLevel: "Department Head",
    accessVariant: "error",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (All)"],
    lastActive: "Today, 8:05 AM",
  },
  {
    user: "Maya Torres",
    initials: "MT",
    email: "maya.torres@rtm.agency",
    role: "Senior Content Strategist",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Apex Roofing", "Summit Landscaping", "Green Valley Dental"],
    lastActive: "Today, 8:30 AM",
  },
  {
    user: "Chris Adeyemi",
    initials: "CA",
    email: "chris.adeyemi@rtm.agency",
    role: "Content Coordinator",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Harbor Auto Group", "Pacific Dental"],
    lastActive: "Today, 9:15 AM",
  },
  {
    user: "Sofia Reyes",
    initials: "SR",
    email: "sofia.reyes@rtm.agency",
    role: "Copywriter",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Metro Dental", "Blue Ridge Plumbing"],
    lastActive: "Today, 9:00 AM",
  },
  {
    user: "Ben Okafor",
    initials: "BO",
    email: "ben.okafor@rtm.agency",
    role: "Content Reviewer",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "Inactive",
    statusVariant: "neutral",
    assignedClients: ["— (Read-only)"],
    lastActive: "3 days ago",
  },
];

export const contentRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
    description: "Full content authority — strategy, publishing, team, and client delivery.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    description: "Leads content projects, reviews deliverables, and manages assignments.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
    description: "Schedules content, coordinates with clients, tracks delivery timelines.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    description: "Produces copy, social posts, blogs, and media assets.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
    description: "Read-only access to content calendar and published assets.",
    memberCount: 1,
  },
];

export const contentPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access content workspace dashboard",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "View Clients",
    description: "See assigned client records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Manage Clients",
    description: "Add or update client content preferences",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "View Tasks",
    description: "See content tasks and work queue",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Create Tasks",
    description: "Create new content tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none" },
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and deliverables",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none" },
  },
  {
    area: "View Reports",
    description: "Access content performance reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full" },
  },
  {
    area: "Manage Reports",
    description: "Create and publish content reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
];

// ─── Web Development & Design ─────────────────────────────────────────────────

export const webDevDesignProfile: WorkspaceProfileData = {
  name: "Ethan Brooks",
  initials: "EB",
  email: "ethan.brooks@rtm.agency",
  department: "Web Development & Design",
  role: "Lead Developer",
  accessLevel: "Manager",
  accessVariant: "info",
  phone: "+1 (555) 609-4412",
  assignedClients: ["Harbor Auto Group", "Summit Landscaping", "Apex Roofing"],
  lastLogin: "Today at 9:45 AM",
  joinedDate: "September 3, 2020",
  timezone: "MST (UTC−7)",
};

export const webDevDesignMembers: TeamMemberRow[] = [
  {
    user: "Naomi Chen",
    initials: "NC",
    email: "naomi.chen@rtm.agency",
    role: "VP of Web & Design",
    accessLevel: "Department Head",
    accessVariant: "error",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (All)"],
    lastActive: "Today, 8:50 AM",
  },
  {
    user: "Ethan Brooks",
    initials: "EB",
    email: "ethan.brooks@rtm.agency",
    role: "Lead Developer",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Harbor Auto Group", "Summit Landscaping", "Apex Roofing"],
    lastActive: "Today, 9:45 AM",
  },
  {
    user: "Priya Nair",
    initials: "PN",
    email: "priya.nair@rtm.agency",
    role: "UI/UX Designer",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Pacific Dental", "Green Valley Dental"],
    lastActive: "Today, 10:02 AM",
  },
  {
    user: "Lucas Ferreira",
    initials: "LF",
    email: "lucas.ferreira@rtm.agency",
    role: "Front-End Specialist",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Metro Dental", "Blue Ridge Plumbing"],
    lastActive: "Today, 8:15 AM",
  },
  {
    user: "Aisha Grant",
    initials: "AG",
    email: "aisha.grant@rtm.agency",
    role: "QA Reviewer",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (Review only)"],
    lastActive: "Yesterday, 4:30 PM",
  },
];

export const webDevDesignRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#ECFEFF", color: "#0891B2", border: "#A5F3FC" },
    description: "Full authority — project scoping, delivery, team, and client relationships.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    description: "Leads development projects, reviews code and designs, manages sprints.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
    description: "Coordinates design workflows, client feedback cycles, and revisions.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    description: "Builds features, creates design assets, and handles technical tasks.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
    description: "Read-only access to projects, tasks, and deliverables.",
    memberCount: 1,
  },
];

export const webDevDesignPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access web & design workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "View Clients",
    description: "See client project records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Manage Clients",
    description: "Update client project scope and preferences",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "View Tasks",
    description: "See development and design tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Create Tasks",
    description: "Create new project tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none" },
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to developers or designers",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and status",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none" },
  },
  {
    area: "View Reports",
    description: "Access project and performance reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full" },
  },
  {
    area: "Manage Reports",
    description: "Create and publish project reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
];

// ─── SEO & Local ──────────────────────────────────────────────────────────────

export const seoLocalProfile: WorkspaceProfileData = {
  name: "Carlos Mendez",
  initials: "CM",
  email: "carlos.mendez@rtm.agency",
  department: "SEO & Local",
  role: "SEO Strategist",
  accessLevel: "Manager",
  accessVariant: "info",
  phone: "+1 (555) 720-5583",
  assignedClients: ["Pacific Dental", "Summit Landscaping", "Harbor Auto Group"],
  lastLogin: "Today at 8:00 AM",
  joinedDate: "February 14, 2021",
  timezone: "EST (UTC−5)",
};

export const seoLocalMembers: TeamMemberRow[] = [
  {
    user: "Simone Watts",
    initials: "SW",
    email: "simone.watts@rtm.agency",
    role: "SEO & Local Director",
    accessLevel: "Department Head",
    accessVariant: "error",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (All)"],
    lastActive: "Today, 7:58 AM",
  },
  {
    user: "Carlos Mendez",
    initials: "CM",
    email: "carlos.mendez@rtm.agency",
    role: "SEO Strategist",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Pacific Dental", "Summit Landscaping", "Harbor Auto Group"],
    lastActive: "Today, 8:00 AM",
  },
  {
    user: "Nia Adeyemi",
    initials: "NA",
    email: "nia.adeyemi@rtm.agency",
    role: "Local SEO Coordinator",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Apex Roofing", "Green Valley Dental"],
    lastActive: "Today, 9:30 AM",
  },
  {
    user: "Drew Holloway",
    initials: "DH",
    email: "drew.holloway@rtm.agency",
    role: "GBP Specialist",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Metro Dental", "Blue Ridge Plumbing"],
    lastActive: "Today, 8:45 AM",
  },
  {
    user: "Tasha Morris",
    initials: "TM",
    email: "tasha.morris@rtm.agency",
    role: "Reporting Viewer",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "Inactive",
    statusVariant: "neutral",
    assignedClients: ["— (Read-only)"],
    lastActive: "1 week ago",
  },
];

export const seoLocalRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
    description: "Full SEO & Local authority — strategy, team management, and client oversight.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    description: "Manages SEO campaigns, GBP profiles, and optimization strategy.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
    description: "Coordinates local listing updates, keyword research, and task tracking.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    description: "Executes on-page SEO, GBP/Yelp optimizations, and citation building.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
    description: "Read-only access to rankings, reports, and client health.",
    memberCount: 1,
  },
];

export const seoLocalPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access SEO & Local workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "View Clients",
    description: "See assigned client records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Manage Clients",
    description: "Update client SEO settings and preferences",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "View Tasks",
    description: "See SEO and local tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Create Tasks",
    description: "Create new SEO or GBP tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none" },
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and completion status",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none" },
  },
  {
    area: "View Reports",
    description: "Access SEO performance and ranking reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full" },
  },
  {
    area: "Manage Reports",
    description: "Create and deliver client SEO reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
];

// ─── Paid Advertising ─────────────────────────────────────────────────────────

export const paidAdvertisingProfile: WorkspaceProfileData = {
  name: "Diana Walsh",
  initials: "DW",
  email: "diana.walsh@rtm.agency",
  department: "Paid Advertising",
  role: "Paid Media Manager",
  accessLevel: "Manager",
  accessVariant: "info",
  phone: "+1 (555) 831-2290",
  assignedClients: ["Sunbelt HVAC", "Apex Roofing", "Harbor Auto Group"],
  lastLogin: "Today at 7:40 AM",
  joinedDate: "November 9, 2020",
  timezone: "CST (UTC−6)",
};

export const paidAdvertisingMembers: TeamMemberRow[] = [
  {
    user: "Marcus Bell",
    initials: "MB",
    email: "marcus.bell@rtm.agency",
    role: "Paid Advertising Director",
    accessLevel: "Department Head",
    accessVariant: "error",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (All)"],
    lastActive: "Today, 8:20 AM",
  },
  {
    user: "Diana Walsh",
    initials: "DW",
    email: "diana.walsh@rtm.agency",
    role: "Paid Media Manager",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Sunbelt HVAC", "Apex Roofing", "Harbor Auto Group"],
    lastActive: "Today, 7:40 AM",
  },
  {
    user: "Lena Park",
    initials: "LPk",
    email: "lena.park@rtm.agency",
    role: "Meta Ads Coordinator",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Pacific Dental", "Green Valley Dental"],
    lastActive: "Today, 9:05 AM",
  },
  {
    user: "Jared Coleman",
    initials: "JC",
    email: "jared.coleman@rtm.agency",
    role: "Google Ads Specialist",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Metro Dental", "Blue Ridge Plumbing"],
    lastActive: "Today, 8:50 AM",
  },
  {
    user: "Renee Foster",
    initials: "RF",
    email: "renee.foster@rtm.agency",
    role: "Analytics Viewer",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "Inactive",
    statusVariant: "neutral",
    assignedClients: ["— (Read-only)"],
    lastActive: "2 weeks ago",
  },
];

export const paidAdvertisingRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
    description: "Full paid media authority — budgets, campaigns, team, and client strategy.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    description: "Manages Meta and Google campaigns, budget allocation, and performance.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
    description: "Coordinates ad creative, copy submissions, and campaign scheduling.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    description: "Executes ad builds, bid management, and platform-specific optimizations.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
    description: "Read-only access to campaign dashboards and performance data.",
    memberCount: 1,
  },
];

export const paidAdvertisingPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access paid advertising workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "View Clients",
    description: "See assigned client ad accounts",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Manage Clients",
    description: "Update client ad preferences and budget caps",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "View Tasks",
    description: "See campaign and ad tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Create Tasks",
    description: "Create new ad campaign tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none" },
  },
  {
    area: "Assign Tasks",
    description: "Assign campaign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Edit Tasks",
    description: "Edit ad tasks, creative, and targeting",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none" },
  },
  {
    area: "View Reports",
    description: "Access campaign performance reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full" },
  },
  {
    area: "Manage Reports",
    description: "Create and export paid media reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Settings",
    description: "Configure workspace and ad account settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
];

// ─── Reporting ────────────────────────────────────────────────────────────────

export const reportingProfile: WorkspaceProfileData = {
  name: "Alexis Turner",
  initials: "AT",
  email: "alexis.turner@rtm.agency",
  department: "Reporting",
  role: "Analytics Manager",
  accessLevel: "Manager",
  accessVariant: "info",
  phone: "+1 (555) 447-9920",
  assignedClients: ["Apex Roofing", "Pacific Dental", "Sunbelt HVAC"],
  lastLogin: "Today at 8:10 AM",
  joinedDate: "April 20, 2021",
  timezone: "EST (UTC−5)",
};

export const reportingMembers: TeamMemberRow[] = [
  {
    user: "Owen Price",
    initials: "OP",
    email: "owen.price@rtm.agency",
    role: "Reporting Director",
    accessLevel: "Department Head",
    accessVariant: "error",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (All)"],
    lastActive: "Today, 8:00 AM",
  },
  {
    user: "Alexis Turner",
    initials: "AT",
    email: "alexis.turner@rtm.agency",
    role: "Analytics Manager",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Apex Roofing", "Pacific Dental", "Sunbelt HVAC"],
    lastActive: "Today, 8:10 AM",
  },
  {
    user: "Dani Osei",
    initials: "DO",
    email: "dani.osei@rtm.agency",
    role: "Report Coordinator",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Harbor Auto Group", "Green Valley Dental"],
    lastActive: "Today, 9:20 AM",
  },
  {
    user: "Felix Russo",
    initials: "FR",
    email: "felix.russo@rtm.agency",
    role: "Data Analyst",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Metro Dental", "Blue Ridge Plumbing"],
    lastActive: "Today, 8:55 AM",
  },
  {
    user: "Ingrid Holm",
    initials: "IH",
    email: "ingrid.holm@rtm.agency",
    role: "Report Viewer",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "Inactive",
    statusVariant: "neutral",
    assignedClients: ["— (Read-only)"],
    lastActive: "4 days ago",
  },
];

export const reportingRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#F0FDFA", color: "#0F766E", border: "#99F6E4" },
    description: "Full reporting authority — insights strategy, team, and agency-wide analytics.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    description: "Oversees report production, data pipelines, and client delivery.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
    description: "Coordinates report scheduling, client communication, and data collection.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    description: "Builds dashboards, runs analysis, and creates data visualizations.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
    description: "Read-only access to published reports and analytics dashboards.",
    memberCount: 1,
  },
];

export const reportingPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access reporting workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "View Clients",
    description: "See client reporting records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Manage Clients",
    description: "Update client reporting preferences",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "View Tasks",
    description: "See reporting and analytics tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Create Tasks",
    description: "Create new reporting tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none" },
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and data sources",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none" },
  },
  {
    area: "View Reports",
    description: "Access all published reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "Manage Reports",
    description: "Build, edit, and publish client reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "full", Viewer: "none" },
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Settings",
    description: "Configure workspace and report settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
];

// ─── Local Service Ads ────────────────────────────────────────────────────────

export const localServiceAdsProfile: WorkspaceProfileData = {
  name: "Keisha James",
  initials: "KJ",
  email: "keisha.james@rtm.agency",
  department: "Local Service Ads",
  role: "LSA Campaign Manager",
  accessLevel: "Manager",
  accessVariant: "info",
  phone: "+1 (555) 562-8841",
  assignedClients: ["Summit Landscaping", "Sunbelt HVAC", "Blue Ridge Plumbing"],
  lastLogin: "Today at 9:00 AM",
  joinedDate: "June 11, 2021",
  timezone: "EST (UTC−5)",
};

export const localServiceAdsMembers: TeamMemberRow[] = [
  {
    user: "Victor Lane",
    initials: "VL",
    email: "victor.lane@rtm.agency",
    role: "LSA Director",
    accessLevel: "Department Head",
    accessVariant: "error",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (All)"],
    lastActive: "Today, 8:30 AM",
  },
  {
    user: "Keisha James",
    initials: "KJ",
    email: "keisha.james@rtm.agency",
    role: "LSA Campaign Manager",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Summit Landscaping", "Sunbelt HVAC", "Blue Ridge Plumbing"],
    lastActive: "Today, 9:00 AM",
  },
  {
    user: "Marcus Webb",
    initials: "MW",
    email: "marcus.webb@rtm.agency",
    role: "LSA Coordinator",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Apex Roofing", "Pacific Dental"],
    lastActive: "Today, 9:40 AM",
  },
  {
    user: "Sara Nguyen",
    initials: "SN",
    email: "sara.nguyen@rtm.agency",
    role: "Review & Dispute Specialist",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Green Valley Dental", "Harbor Auto Group"],
    lastActive: "Today, 8:00 AM",
  },
  {
    user: "Evan Tucker",
    initials: "ET",
    email: "evan.tucker@rtm.agency",
    role: "Budget Viewer",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "Inactive",
    statusVariant: "neutral",
    assignedClients: ["— (Read-only)"],
    lastActive: "5 days ago",
  },
];

export const localServiceAdsRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
    description: "Full LSA authority — setup, reviews, budgets, team, and client oversight.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    description: "Manages LSA campaigns, budget pacing, and client review processes.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
    description: "Coordinates LSA setup, profile updates, and review response scheduling.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    description: "Handles review disputes, lead quality, and LSA profile optimizations.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
    description: "Read-only access to campaign data, budgets, and performance reports.",
    memberCount: 1,
  },
];

export const localServiceAdsPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access LSA workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "View Clients",
    description: "See assigned client LSA accounts",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Manage Clients",
    description: "Update client LSA profiles and budgets",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "View Tasks",
    description: "See LSA and review management tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Create Tasks",
    description: "Create new LSA tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none" },
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and lead status",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none" },
  },
  {
    area: "View Reports",
    description: "Access LSA performance reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full" },
  },
  {
    area: "Manage Reports",
    description: "Create and deliver LSA client reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
];

// ─── IT & Security ────────────────────────────────────────────────────────────

export const itSecurityProfile: WorkspaceProfileData = {
  name: "Ravi Sharma",
  initials: "RS",
  email: "ravi.sharma@rtm.agency",
  department: "IT & Security",
  role: "Systems Administrator",
  accessLevel: "Manager",
  accessVariant: "info",
  phone: "+1 (555) 193-6670",
  assignedClients: ["— (Internal)"],
  lastLogin: "Today at 7:30 AM",
  joinedDate: "August 22, 2019",
  timezone: "PST (UTC−8)",
};

export const itSecurityMembers: TeamMemberRow[] = [
  {
    user: "Gabe Kowalski",
    initials: "GK",
    email: "gabe.kowalski@rtm.agency",
    role: "CTO / IT Director",
    accessLevel: "Department Head",
    accessVariant: "error",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (All)"],
    lastActive: "Today, 7:45 AM",
  },
  {
    user: "Ravi Sharma",
    initials: "RS",
    email: "ravi.sharma@rtm.agency",
    role: "Systems Administrator",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (Internal)"],
    lastActive: "Today, 7:30 AM",
  },
  {
    user: "Tamara Fox",
    initials: "TF",
    email: "tamara.fox@rtm.agency",
    role: "Security Coordinator",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (Internal)"],
    lastActive: "Today, 8:30 AM",
  },
  {
    user: "Noah Kim",
    initials: "NK",
    email: "noah.kim@rtm.agency",
    role: "Help Desk Specialist",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (Internal)"],
    lastActive: "Today, 9:10 AM",
  },
  {
    user: "Cleo Barnes",
    initials: "CB",
    email: "cleo.barnes@rtm.agency",
    role: "Audit Viewer",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "Inactive",
    statusVariant: "neutral",
    assignedClients: ["— (Read-only)"],
    lastActive: "1 month ago",
  },
];

export const itSecurityRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#F1F5F9", color: "#374151", border: "#CBD5E1" },
    description: "Full IT authority — infrastructure decisions, security policy, and team oversight.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    description: "Manages systems, access controls, and security incident response.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
    description: "Coordinates security audits, access reviews, and team IT requests.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    description: "Handles help desk, system maintenance, and tooling support.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
    description: "Read-only access to system logs, audit trails, and security reports.",
    memberCount: 1,
  },
];

export const itSecurityPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access IT & Security workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full" },
  },
  {
    area: "View Clients",
    description: "See internal system and tool records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Manage Clients",
    description: "Update internal system configs and client tech settings",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "View Tasks",
    description: "See IT and security tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full" },
  },
  {
    area: "Create Tasks",
    description: "Create new IT or security tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none" },
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and resolution status",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none" },
  },
  {
    area: "View Reports",
    description: "Access system and security audit reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full" },
  },
  {
    area: "Manage Reports",
    description: "Create and publish security reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Users",
    description: "Provision and manage team access",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none" },
  },
  {
    area: "Manage Settings",
    description: "Configure workspace and system settings",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "none", Specialist: "none", Viewer: "none" },
  },
];
