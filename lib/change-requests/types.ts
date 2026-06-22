// ─────────────────────────────────────────────────────────────────────────────
// Change Request Engine — Types
// ─────────────────────────────────────────────────────────────────────────────

export type ChangeRequestType =
  | "Budget Reallocation"
  | "Service Upgrade"
  | "Service Downgrade"
  | "Service Addition"
  | "Service Removal"
  | "Pause"
  | "Reactivation"
  | "Contract Amendment"
  | "Custom Scope Change";

export type ChangeRequestStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Implemented"
  | "Cancelled";

export type ApprovalStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Not Required"
  | "In Progress";

export type RevenueDirection = "Increase" | "Decrease" | "Neutral";

export interface ApprovalStep {
  stage: string;
  assignee: string;
  status: ApprovalStatus;
  completedDate?: string;
  notes?: string;
}

export interface BudgetLine {
  service: string;
  department: string;
  currentBudget: number;
  proposedBudget: number;
  difference: number;
}

export interface ImplementationItem {
  area: string;
  status: "Pending" | "In Progress" | "Completed" | "Not Required";
  completedDate?: string;
  notes?: string;
}

export interface ActivityEvent {
  date: string;
  event: string;
  actor: string;
  note?: string;
}

export interface ChangeRequest {
  id: string;
  client: string;
  project: string;
  requestType: ChangeRequestType;
  requestedBy: string;
  requestedByRole: string;
  assignedAM: string;
  revenueImpact: number;
  revenueDirection: RevenueDirection;
  departmentsImpacted: string[];
  status: ChangeRequestStatus;
  submittedDate: string;
  effectiveDate?: string;
  description: string;

  // Client context
  clientHealthScore: number;
  clientHealthStatus: "Healthy" | "Needs Attention" | "At-Risk" | "Critical";
  renewalRisk: "Low" | "Medium" | "High" | "Critical";
  expansionOpportunity: "Low" | "Medium" | "High";
  clientMRR: number;
  clientARR: number;
  openEscalations: number;
  openProjects: number;
  lastCommunication: string;
  aiClientSummary: string;

  // Impact
  projectsImpacted: string[];
  tasksAdded: number;
  tasksRemoved: number;
  milestonesAffected: number;
  contractAmendmentRequired: boolean;
  billingApprovalStatus: ApprovalStatus;

  // Type-specific fields
  budgetLines?: BudgetLine[];
  serviceAdded?: string;
  serviceRemoved?: string;
  currentPackage?: string;
  newPackage?: string;
  pauseStartDate?: string;
  pauseEndDate?: string;
  pauseReason?: string;
  reactivationPlan?: string;
  currentContract?: string;
  proposedContract?: string;
  newDeliverables?: string[];
  removedDeliverables?: string[];
  additionalDepartments?: string[];

  // Approval workflow
  approvalWorkflow: ApprovalStep[];

  // Implementation
  implementationItems: ImplementationItem[];
  implementationStatus: "Not Started" | "In Progress" | "Completed";
  implementationCompletedDate?: string;

  // AI analysis
  aiImpactAssessment: string;
  aiRiskAssessment: string;
  aiRecommendedActions: string[];
  aiImplementationPlan: string;

  // Activity
  activityTimeline: ActivityEvent[];

  // Billing
  mrrChange: number;
  arrChange: number;
  oneTimeFees: number;
  credits: number;
  adjustments: number;
}
