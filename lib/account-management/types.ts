// ─── Account Management Types ────────────────────────────────────────────────

export type HealthScore = "Healthy"| "Needs Attention"| "At-Risk"| "Critical";
export type CampaignStatus = "Active"| "Paused"| "Pending Launch"| "Completed"| "Cancelled";
export type DeliverableStatus = "Completed"| "In Progress"| "Overdue"| "Not Started"| "Blocked";
export type EscalationStatus = "Open"| "In Progress"| "Resolved"| "Escalated";
export type BlockerStatus = "Open"| "In Review"| "Resolved"| "Awaiting Client";
export type OnboardingStatus = "Not Started"| "In Progress"| "Awaiting Assets"| "Completed"| "Stalled";
export type Priority = "Low"| "Medium"| "High"| "Critical";

export interface Client {
  id: string;
  name: string;
  industry: string;
  services: string[];
  healthScore: HealthScore;
  assignedAM: string;
  campaignStatus: CampaignStatus;
  startDate: string;
  renewalDate: string;
  monthlyRevenue: number;
  lastContact: string;
  location: string;
  reportsOverdue: number;
  openDeliverables: number;
  aiNotes: string;
}

export interface Deliverable {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  service: string;
  assignedTo: string;
  dueDate: string;
  status: DeliverableStatus;
  priority: Priority;
  description: string;
}

export interface Escalation {
  id: string;
  clientId: string;
  clientName: string;
  issue: string;
  raisedBy: string;
  assignedAM: string;
  dateRaised: string;
  status: EscalationStatus;
  priority: Priority;
  notes: string;
}

export interface Blocker {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  blockedBy: string;
  assignedAM: string;
  dateCreated: string;
  status: BlockerStatus;
  impact: string;
}

export interface OnboardingItem {
  id: string;
  clientId: string;
  clientName: string;
  assignedAM: string;
  startDate: string;
  targetCompletionDate: string;
  status: OnboardingStatus;
  completedSteps: number;
  totalSteps: number;
  pendingItems: string[];
  services: string[];
}
