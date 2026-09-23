/**
 * Workspace Roles & Permissions data.
 * Used by WorkspaceRolesPage (ten department roles pages) and
 * SeoTeamPerformanceRollup (SEO dashboard sub-team KPI rollup).
 *
 * WorkspaceProfilePage and WorkspaceTeamMembersPage now read from /api/users
 * via lib/users/users-api.ts and no longer need *Profile or *Members exports.
 *
 * What was removed: all ten *Profile WorkspaceProfileData exports and all
 * *Members TeamMemberRow[] exports EXCEPT seoLocalMembers, which is still
 * consumed by SeoTeamPerformanceRollup for sub-team (seoTeam) grouping.
 * WorkspaceProfileData was also removed. TeamMemberRow is kept for seoLocalMembers.
 */

import type { StatusVariant } from "@/components/ui";

//  Types 

export type PermLevel = "full"| "partial"| "own"| "none";

export type SeoTeam = "On-Page SEO" | "Off-Page SEO";

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
  /** SEO & Local only — which sub-team this member belongs to */
  seoTeam?: SeoTeam;
  /** SEO & Local only — marks the designated lead for their sub-team */
  isTeamLead?: boolean;
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

//  Permission level config (shared) 

export const permLevelConfig: Record<
  PermLevel,
  { icon: string; label: string; bg: string; color: string; border: string }
> = {
  full:    { icon: "",  label: "Full",    bg: "#ECFDF5",              color: "#059669",          border: "#A7F3D0"},
  partial: { icon: "",  label: "Partial", bg: "#FFFBEB",              color: "#B45309",          border: "#FDE68A"},
  own:     { icon: "⊙",  label: "Own",     bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", border: "var(--rtm-blue-light)"},
  none:    { icon: "—",  label: "None",    bg: "#F8FAFC",              color: "#CBD5E1",          border: "#E2E8F0"},
};

//  Per-workspace data 

//  Account Management 

export const accountManagementRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
    description: "Full access — owns strategy, budget, team, and all client data.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", border: "var(--rtm-blue-light)"},
    description: "Manages a pod of AMs, approves deliverables, reviews performance.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE"},
    description: "Day-to-day client ops, check-ins, task management across assigned clients.",
    memberCount: 3,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
    description: "Focused execution on specific deliverables; limited edit scope.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0"},
    description: "Read-only access to reporting, client data, and dashboards.",
    memberCount: 1,
  },
];

export const accountManagementPermissions: PermissionArea[] = [
  {
    area: "Dashboard",
    description: "View workspace dashboard & KPIs",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "Client Portfolio",
    description: "View client list and health scores",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Client Edit",
    description: "Edit client details, services, contacts",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "none"},
  },
  {
    area: "Team Members",
    description: "View team members and assignments",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Roles & Permissions",
    description: "Manage roles and access levels",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Check-ins",
    description: "Log & view client check-ins",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Tasks",
    description: "Create, assign, and complete tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "none"},
  },
  {
    area: "Reports",
    description: "Generate and send client reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "partial", Viewer: "full"},
  },
  {
    area: "Performance",
    description: "View and export performance metrics",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "full"},
  },
  {
    area: "Budget / Billing",
    description: "View & manage department budget",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
];

//  Sales 

export const salesRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
    description: "Full pipeline & team ownership, quota targets, and budget authority.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
    description: "Leads sales pod, coaches reps, reviews and approves proposals.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE"},
    description: "Manages daily lead flow, schedules demos, tracks pipeline stages.",
    memberCount: 2,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
    description: "SDR-level outreach, qualifies inbound leads, sets appointments.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0"},
    description: "Read-only access to pipeline data, proposals, and reports.",
    memberCount: 1,
  },
];

export const salesPermissions: PermissionArea[] = [
  {
    area: "Dashboard",
    description: "View sales dashboard & pipeline KPIs",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "Leads",
    description: "View and manage incoming leads",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Lead Assignment",
    description: "Assign leads to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Proposals",
    description: "Create, edit, and send proposals",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "none", Viewer: "full"},
  },
  {
    area: "Pipeline",
    description: "View and update deal stages",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Follow-ups",
    description: "Log and schedule follow-up actions",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "none"},
  },
  {
    area: "Performance",
    description: "View rep performance and quota data",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Team Members",
    description: "View and manage team assignments",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Roles & Permissions",
    description: "Configure role access levels",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Tasks",
    description: "Create and manage tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "own", Viewer: "none"},
  },
  {
    area: "Reports",
    description: "Export and review sales reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "full"},
  },
  {
    area: "Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
];

//  Billing 

export const billingRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
    description: "Full financial authority — invoices, collections, offboarding, and team.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
    description: "Oversees billing operations, approves adjustments, manages escalations.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE"},
    description: "Processes invoices, handles collections, manages service activations.",
    memberCount: 2,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
    description: "Focused financial analysis, data reconciliation, and report generation.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0"},
    description: "Read-only access to invoices, billing history, and financial reports.",
    memberCount: 1,
  },
];

export const billingPermissions: PermissionArea[] = [
  {
    area: "Dashboard",
    description: "View billing dashboard & revenue KPIs",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "Invoices",
    description: "Create, edit, and send invoices",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "partial", Viewer: "full"},
  },
  {
    area: "Invoice Approval",
    description: "Approve invoices before sending",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Active Services",
    description: "View and manage active client services",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full"},
  },
  {
    area: "Cancellations",
    description: "Process and approve cancellations",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "none", Viewer: "full"},
  },
  {
    area: "Offboarding",
    description: "Trigger and track offboarding workflows",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Collections",
    description: "Manage overdue accounts and collections",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "own", Specialist: "partial", Viewer: "none"},
  },
  {
    area: "Client Portfolio",
    description: "View client billing records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "Team Members",
    description: "View and manage team assignments",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Roles & Permissions",
    description: "Configure role access levels",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Reports",
    description: "Generate financial and billing reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "full", Viewer: "full"},
  },
  {
    area: "Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
];

//  Content 

export const contentRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE"},
    description: "Full content authority — strategy, publishing, team, and client delivery.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
    description: "Leads content projects, reviews deliverables, and manages assignments.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE"},
    description: "Schedules content, coordinates with clients, tracks delivery timelines.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
    description: "Produces copy, social posts, blogs, and media assets.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0"},
    description: "Read-only access to content calendar and published assets.",
    memberCount: 1,
  },
];

export const contentPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access content workspace dashboard",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "View Clients",
    description: "See assigned client records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Manage Clients",
    description: "Add or update client content preferences",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "View Tasks",
    description: "See content tasks and work queue",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Create Tasks",
    description: "Create new content tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none"},
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and deliverables",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none"},
  },
  {
    area: "View Reports",
    description: "Access content performance reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full"},
  },
  {
    area: "Manage Reports",
    description: "Create and publish content reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
];

//  Web Development & Design 

export const webDevDesignRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#ECFEFF", color: "#0891B2", border: "#A5F3FC"},
    description: "Full authority — project scoping, delivery, team, and client relationships.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
    description: "Leads development projects, reviews code and designs, manages sprints.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE"},
    description: "Coordinates design workflows, client feedback cycles, and revisions.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
    description: "Builds features, creates design assets, and handles technical tasks.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0"},
    description: "Read-only access to projects, tasks, and deliverables.",
    memberCount: 1,
  },
];

export const webDevDesignPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access web & design workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "View Clients",
    description: "See client project records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Manage Clients",
    description: "Update client project scope and preferences",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "View Tasks",
    description: "See development and design tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Create Tasks",
    description: "Create new project tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none"},
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to developers or designers",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and status",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none"},
  },
  {
    area: "View Reports",
    description: "Access project and performance reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full"},
  },
  {
    area: "Manage Reports",
    description: "Create and publish project reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
];

//  SEO & Local 

// seoLocalMembers is kept here for SeoTeamPerformanceRollup, which uses the
// seoTeam and isTeamLead fields to compute per-sub-team KPI rollups.
// The SEO & Local Team Members page (app/(seo-local)/seo-local/team-members/)
// no longer reads this export — it fetches from /api/users instead.
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
    seoTeam: "On-Page SEO",
    isTeamLead: true,
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
    seoTeam: "On-Page SEO",
  },
  {
    user: "Lena Okafor",
    initials: "LO",
    email: "lena.okafor@rtm.agency",
    role: "On-Page SEO Specialist",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Apex Roofing", "Sunbelt HVAC"],
    lastActive: "Today, 8:15 AM",
    seoTeam: "On-Page SEO",
  },
  {
    user: "Jordan Kim",
    initials: "JK",
    email: "jordan.kim@rtm.agency",
    role: "Local SEO Coordinator",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Blue Ridge Plumbing", "Green Valley Pools"],
    lastActive: "Yesterday, 4:45 PM",
    seoTeam: "On-Page SEO",
  },
  {
    user: "Marcus Bell",
    initials: "MB",
    email: "marcus.bell.seo@rtm.agency",
    role: "Off-Page SEO Lead",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Metro Dental", "Pacific Dental"],
    lastActive: "Today, 7:40 AM",
    seoTeam: "Off-Page SEO",
    isTeamLead: true,
  },
  {
    user: "Priya Nair",
    initials: "PN",
    email: "priya.nair@rtm.agency",
    role: "Link Building Specialist",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Summit Landscaping", "Harbor Auto Group"],
    lastActive: "Today, 9:10 AM",
    seoTeam: "Off-Page SEO",
  },
  {
    user: "Tyler Ross",
    initials: "TR",
    email: "tyler.ross@rtm.agency",
    role: "Citation & GBP Coordinator",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "On Leave",
    statusVariant: "warning",
    assignedClients: ["Northgate Dental"],
    lastActive: "5 days ago",
    seoTeam: "Off-Page SEO",
  },
  {
    user: "Dana Kim",
    initials: "DK",
    email: "dana.kim@rtm.agency",
    role: "Reporting Viewer",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "Inactive",
    statusVariant: "neutral",
    assignedClients: ["— (Read-only)"],
    lastActive: "1 week ago",
    seoTeam: "On-Page SEO",
  },
];

export const seoLocalRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE"},
    description: "Full SEO & Local authority — strategy, team management, and client oversight.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
    description: "Manages SEO campaigns, GBP profiles, and optimization strategy.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE"},
    description: "Coordinates local listing updates, keyword research, and task tracking.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
    description: "Executes on-page SEO, GBP/Yelp optimizations, and citation building.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0"},
    description: "Read-only access to rankings, reports, and client health.",
    memberCount: 1,
  },
];

export const seoLocalPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access SEO & Local workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "View Clients",
    description: "See assigned client records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Manage Clients",
    description: "Update client SEO settings and preferences",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "View Tasks",
    description: "See SEO and local tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Create Tasks",
    description: "Create new SEO or GBP tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none"},
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and completion status",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none"},
  },
  {
    area: "View Reports",
    description: "Access SEO performance and ranking reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full"},
  },
  {
    area: "Manage Reports",
    description: "Create and deliver client SEO reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
];

//  Paid Advertising 

export const paidAdvertisingRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
    description: "Full paid media authority — budgets, campaigns, team, and client strategy.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
    description: "Manages Meta and Google campaigns, budget allocation, and performance.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE"},
    description: "Coordinates ad creative, copy submissions, and campaign scheduling.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
    description: "Executes ad builds, bid management, and platform-specific optimizations.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0"},
    description: "Read-only access to campaign dashboards and performance data.",
    memberCount: 1,
  },
];

export const paidAdvertisingPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access paid advertising workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "View Clients",
    description: "See assigned client ad accounts",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Manage Clients",
    description: "Update client ad preferences and budget caps",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "View Tasks",
    description: "See campaign and ad tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Create Tasks",
    description: "Create new ad campaign tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none"},
  },
  {
    area: "Assign Tasks",
    description: "Assign campaign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Edit Tasks",
    description: "Edit ad tasks, creative, and targeting",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none"},
  },
  {
    area: "View Reports",
    description: "Access campaign performance reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full"},
  },
  {
    area: "Manage Reports",
    description: "Create and export paid media reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Settings",
    description: "Configure workspace and ad account settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
];

//  Reporting 

export const reportingRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#F0FDFA", color: "#0F766E", border: "#99F6E4"},
    description: "Full reporting authority — insights strategy, team, and agency-wide analytics.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
    description: "Oversees report production, data pipelines, and client delivery.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE"},
    description: "Coordinates report scheduling, client communication, and data collection.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
    description: "Builds dashboards, runs analysis, and creates data visualizations.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0"},
    description: "Read-only access to published reports and analytics dashboards.",
    memberCount: 1,
  },
];

export const reportingPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access reporting workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "View Clients",
    description: "See client reporting records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Manage Clients",
    description: "Update client reporting preferences",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "View Tasks",
    description: "See reporting and analytics tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Create Tasks",
    description: "Create new reporting tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none"},
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and data sources",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none"},
  },
  {
    area: "View Reports",
    description: "Access all published reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "Manage Reports",
    description: "Build, edit, and publish client reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "full", Viewer: "none"},
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Settings",
    description: "Configure workspace and report settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
];

//  Local Service Ads 

export const localServiceAdsRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A"},
    description: "Full LSA authority — setup, reviews, budgets, team, and client oversight.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
    description: "Manages LSA campaigns, budget pacing, and client review processes.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE"},
    description: "Coordinates LSA setup, profile updates, and review response scheduling.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
    description: "Handles review disputes, lead quality, and LSA profile optimizations.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0"},
    description: "Read-only access to campaign data, budgets, and performance reports.",
    memberCount: 1,
  },
];

export const localServiceAdsPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access LSA workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "View Clients",
    description: "See assigned client LSA accounts",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Manage Clients",
    description: "Update client LSA profiles and budgets",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "View Tasks",
    description: "See LSA and review management tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Create Tasks",
    description: "Create new LSA tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none"},
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and lead status",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none"},
  },
  {
    area: "View Reports",
    description: "Access LSA performance reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full"},
  },
  {
    area: "Manage Reports",
    description: "Create and deliver LSA client reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Users",
    description: "Invite and manage team members",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Settings",
    description: "Configure workspace settings",
    perms: { "Department Head": "full", Manager: "partial", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
];

//  IT & Security 

export const itSecurityRoles: RoleDef[] = [
  {
    name: "Department Head",
    badge: { bg: "#F1F5F9", color: "#374151", border: "#CBD5E1"},
    description: "Full IT authority — infrastructure decisions, security policy, and team oversight.",
    memberCount: 1,
  },
  {
    name: "Manager",
    badge: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
    description: "Manages systems, access controls, and security incident response.",
    memberCount: 1,
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE"},
    description: "Coordinates security audits, access reviews, and team IT requests.",
    memberCount: 1,
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
    description: "Handles help desk, system maintenance, and tooling support.",
    memberCount: 1,
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0"},
    description: "Read-only access to system logs, audit trails, and security reports.",
    memberCount: 1,
  },
];

export const itSecurityPermissions: PermissionArea[] = [
  {
    area: "View Dashboard",
    description: "Access IT & Security workspace overview",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "full", Viewer: "full"},
  },
  {
    area: "View Clients",
    description: "See internal system and tool records",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Manage Clients",
    description: "Update internal system configs and client tech settings",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "View Tasks",
    description: "See IT and security tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "full"},
  },
  {
    area: "Create Tasks",
    description: "Create new IT or security tasks",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "none"},
  },
  {
    area: "Assign Tasks",
    description: "Assign tasks to team members",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Edit Tasks",
    description: "Edit task details and resolution status",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "own", Viewer: "none"},
  },
  {
    area: "View Reports",
    description: "Access system and security audit reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "full", Specialist: "partial", Viewer: "full"},
  },
  {
    area: "Manage Reports",
    description: "Create and publish security reports",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Users",
    description: "Provision and manage team access",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "partial", Specialist: "none", Viewer: "none"},
  },
  {
    area: "Manage Settings",
    description: "Configure workspace and system settings",
    perms: { "Department Head": "full", Manager: "full", Coordinator: "none", Specialist: "none", Viewer: "none"},
  },
];
