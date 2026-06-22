// ── Activation & Handoff Engine Types ────────────────────────────────────────

export type ActivationStatus =
  | "Pending Contract"
  | "Pending Payment"
  | "Pending Assignment"
  | "Ready For Launch"
  | "Launching"
  | "Active"
  | "On Hold";

export type ServiceType =
  | "SEO"
  | "PPC"
  | "GBP"
  | "Hosting"
  | "Web Development"
  | "AI Automation";

export type DepartmentType =
  | "SEO"
  | "Paid Advertising"
  | "GBP"
  | "IT / Hosting"
  | "Web Development"
  | "AI Automation"
  | "Content"
  | "Account Management";

export type ContractStatus = "Pending" | "Signed" | "Expired";
export type InvoiceStatus = "Not Sent" | "Sent" | "Overdue" | "Paid";
export type PaymentStatus = "Awaiting" | "Partial" | "Confirmed" | "Failed";
export type LaunchStatus = "Upcoming" | "Launching" | "Blocked" | "Delayed" | "Onboarding" | "Active";

export interface ChecklistItem {
  key: string;
  label: string;
  completed: boolean;
}

export interface SalesHandoff {
  salesOwner: string;
  servicesSold: ServiceType[];
  lineItems: string[];
  budget: number;
  clientGoals: string;
  clientConcerns: string;
  specialRequirements: string;
  proposalNotes: string;
  communicationSummary: string;
}

export interface BillingHandoff {
  billingOwner: string;
  contractStatus: ContractStatus;
  invoiceStatus: InvoiceStatus;
  paymentStatus: PaymentStatus;
  billingNotes: string;
  recurringRevenue: number;
}

export interface AMAssignment {
  primaryAM: string;
  secondaryAM: string | null;
  executiveSponsor: string | null;
}

export interface ProjectGeneration {
  projectsCreated: number;
  departmentsAssigned: DepartmentType[];
  taskBlueprintsGenerated: number;
  milestonesGenerated: number;
  dependenciesGenerated: number;
}

export interface ActivationRecord {
  id: string;
  client: string;
  contractNumber: string;
  proposalId: string;
  revenue: number;
  servicesSold: ServiceType[];
  departmentsInvolved: DepartmentType[];
  assignedAM: string;
  activationStatus: ActivationStatus;
  launchDate: string; // ISO date string
  checklist: ChecklistItem[];
  salesHandoff: SalesHandoff;
  billingHandoff: BillingHandoff;
  amAssignment: AMAssignment;
  projectGeneration: ProjectGeneration;
  launchNotes: string;
  clientExpectations: string;
  scopeNotes: string;
  deliverables: string[];
}

export interface LaunchRecord {
  id: string;
  client: string;
  services: ServiceType[];
  departments: DepartmentType[];
  launchDate: string;
  launchStatus: LaunchStatus;
  projectManager: string;
  blockers: string[];
  completionPercent: number;
}

export interface AILaunchSummary {
  launchRisks: string[];
  missingRequirements: string[];
  pendingAssignments: string[];
  billingIssues: string[];
  recommendedActions: string[];
}

export interface ActivationAnalytics {
  avgTimeToLaunch: number; // days
  bottlenecks: { stage: string; avgDays: number; count: number }[];
  departmentDelays: { department: DepartmentType; avgDelay: number; cases: number }[];
  revenueWaitingForLaunch: number;
  pendingActivations: number;
}
