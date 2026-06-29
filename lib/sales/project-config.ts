// RTM OS — Sales Project Creation Configuration
// All project creation types, constants, and mappings live here only.
// Zero business literals in any .tsx file.

// ─── Status Types ─────────────────────────────────────────────────────────────

export type ProjectStatus =
  | "not-started"
  | "in-progress"
  | "on-hold"
  | "completed"
  | "cancelled";

// ─── Priority Types ───────────────────────────────────────────────────────────

export type ProjectPriority = "critical" | "high" | "medium" | "low";

// ─── Phase Types ──────────────────────────────────────────────────────────────

export type ProjectPhase =
  | "onboarding"
  | "active"
  | "review"
  | "renewal"
  | "offboarding";

// ─── Department Assignment Status ─────────────────────────────────────────────

export type DepartmentAssignmentStatus =
  | "pending"
  | "assigned"
  | "active"
  | "complete";

// ─── Service Assignment ───────────────────────────────────────────────────────

export interface ProjectServiceAssignment {
  serviceId: string;
  serviceName: string;
  department: string;
  assignedTo: string | null;
  status: DepartmentAssignmentStatus;
  startDate: string;
  estimatedCompletionDate: string;
  monthlyValue: number;
}

// ─── Project Record ───────────────────────────────────────────────────────────

export interface ProjectRecord {
  id: string;
  projectNumber: string;
  clientName: string;
  contractNumber: string;
  handoffId: string;
  proposalId: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  phase: ProjectPhase;
  services: ProjectServiceAssignment[];
  totalMonthlyValue: number;
  totalSetupFees: number;
  assignedAM: string | null;
  createdAt: string;
  startDate: string;
  estimatedLaunchDate: string;
  notes: string;
}

// ─── Phase Labels ─────────────────────────────────────────────────────────────

export const PROJECT_PHASES: Record<ProjectPhase, string> = {
  onboarding: "Client Onboarding",
  active: "Active Delivery",
  review: "Performance Review",
  renewal: "Renewal",
  offboarding: "Offboarding",
};

// ─── Status Labels ────────────────────────────────────────────────────────────

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  "on-hold": "On Hold",
  "completed": "Completed",
  "cancelled": "Cancelled",
};

// ─── Status Semantic Colors ───────────────────────────────────────────────────

export const PROJECT_STATUS_COLORS: Record<
  ProjectStatus,
  { bg: string; color: string; border: string }
> = {
  "not-started": {
    bg: "#F8FAFC",
    color: "#64748B",
    border: "#E2E8F0",
  },
  "in-progress": {
    bg: "#EFF6FF",
    color: "#1D4ED8",
    border: "#BFDBFE",
  },
  "on-hold": {
    bg: "#FFFBEB",
    color: "#B45309",
    border: "#FDE68A",
  },
  "completed": {
    bg: "#ECFDF5",
    color: "#059669",
    border: "#A7F3D0",
  },
  "cancelled": {
    bg: "#F8FAFC",
    color: "#94A3B8",
    border: "#E4E8F0",
  },
};

// ─── Priority Labels ──────────────────────────────────────────────────────────

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

// ─── Priority Semantic Colors ─────────────────────────────────────────────────

export const PROJECT_PRIORITY_COLORS: Record<
  ProjectPriority,
  { bg: string; color: string; border: string }
> = {
  critical: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  high:     { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  medium:   { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  low:      { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
};

// ─── Assignment Status Colors ─────────────────────────────────────────────────

export const ASSIGNMENT_STATUS_COLORS: Record<
  DepartmentAssignmentStatus,
  { bg: string; color: string; border: string }
> = {
  pending:  { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  assigned: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  active:   { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  complete: { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7" },
};

// ─── Duration Defaults ────────────────────────────────────────────────────────

export const DEFAULT_ONBOARDING_DURATION_DAYS: number = 14;
export const DEFAULT_LAUNCH_DURATION_DAYS: number = 30;

// ─── Department Map ───────────────────────────────────────────────────────────
// Maps service names to their fulfillment departments.

export const DEPARTMENT_MAP: Record<string, string> = {
  "SEO":                      "SEO",
  "SEO AI Search Visibility": "SEO",
  "Google Business Profile":  "GBP",
  "Google Ads / PPC":         "PPC",
  "Local Service Ads":        "LSA",
  "Meta Ads":                 "Meta Ads",
  "Website":                  "Web Development",
  "Content":                  "Content",
  "Reporting":                "Reporting",
};
