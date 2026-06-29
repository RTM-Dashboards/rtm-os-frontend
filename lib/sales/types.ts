// RTM OS — Sales Operating System Types
// All types for the configuration-driven Sales workflow.

// ─── Settings Configuration Types ────────────────────────────────────────────

export interface IntakeQuestion {
  id: string;
  key: string;
  section: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "toggle" | "number" | "url" | "phone" | "email" | "radio";
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
  order: number;
  active: boolean;
  conditionalOn?: { key: string; value: string };
}

export interface IntakeFormSection {
  id: string;
  key: string;
  label: string;
  description?: string;
  order: number;
  questions: IntakeQuestion[];
}

export interface SalesIntakeForm {
  id: string;
  name: string;
  targetSegment: "SMB" | "Enterprise" | "All";
  isDefault: boolean;
  requiresGoals: boolean;
  version: string;
  active: boolean;
  sections: IntakeFormSection[];
}

export interface AuditGoal {
  id: string;
  key: string;
  label: string;
  description: string;
  icon?: string;
  category: string;
  order: number;
  active: boolean;
}

export interface AuditSection {
  id: string;
  key: string;
  label: string;
  description?: string;
  order: number;
  checkpoints: AuditCheckpoint[];
}

export interface AuditCheckpoint {
  id: string;
  key: string;
  label: string;
  description?: string;
  severityDefault: "Critical" | "High" | "Medium" | "Low";
  category: string;
  order: number;
}

export interface AuditTemplate {
  id: string;
  name: string;
  goalIds: string[];
  sections: AuditSection[];
  active: boolean;
}

export interface RecommendationRule {
  id: string;
  name: string;
  conditions: RecommendationCondition[];
  serviceIds: string[];
  priority: "High" | "Medium" | "Low";
  active: boolean;
}

export interface RecommendationCondition {
  field: string;
  operator: "equals" | "contains" | "gte" | "lte" | "in";
  value: string | number | string[];
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  category: string;
  department: string;
  monthlyFee: number;
  setupFee: number;
  active: boolean;
  description?: string;
  deliverables?: string[];
  estimatedHoursPerMonth?: number;
}

export interface LineItem {
  id: string;
  name: string;
  serviceId: string;
  billingCycle: "Monthly" | "One-Time" | "Quarterly" | "Annual";
  unitPrice: number;
  quantity: number;
  category: string;
  department: string;
  active: boolean;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  lineItemIds: string[];
  monthlyTotal: number;
  setupTotal: number;
  contractLengthMonths: number;
  profitabilityScore: number;
  active: boolean;
  recommended: boolean;
}

export interface PricingRule {
  id: string;
  name: string;
  type: "discount" | "markup" | "bundle" | "minimum" | "maximum";
  conditions: PricingCondition[];
  adjustment: number;
  adjustmentType: "fixed" | "percentage";
  active: boolean;
}

export interface PricingCondition {
  field: string;
  operator: string;
  value: string | number;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  sections: ProposalSectionTemplate[];
  active: boolean;
  isDefault: boolean;
}

export interface ProposalSectionTemplate {
  id: string;
  key: string;
  label: string;
  order: number;
  required: boolean;
  editable: boolean;
  hideable: boolean;
  defaultContent?: string;
}

export interface ProposalRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
}

export interface TaskBlueprint {
  id: string;
  name: string;
  serviceId: string;
  tasks: BlueprintTask[];
  active: boolean;
}

export interface BlueprintTask {
  id: string;
  title: string;
  department: string;
  estimatedHours: number;
  recurrence: "Once" | "Weekly" | "Monthly" | "Quarterly";
  order: number;
}

// ─── Sales Workflow Types ─────────────────────────────────────────────────────

export interface SalesIntakeData {
  id: string;
  leadId?: string;
  formId: string;
  status: "Draft" | "In Progress" | "Complete";
  createdAt: string;
  updatedAt: string;
  salesRep: string;
  selectedGoalIds: string[];
  answers: Record<string, string | string[] | boolean | number>;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  goalId: string;
  section: string;
  checkpoint: string;
  category: string;
  finding: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  businessImpact: string;
  opportunity: string;
  recommendation: string;
  estimatedEffort: "Low" | "Medium" | "High";
  department: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Addressed" | "Dismissed";
}

export interface AuditReport {
  id: string;
  intakeId: string;
  goalIds: string[];
  findings: AuditFinding[];
  generatedAt: string;
  status: "Draft" | "Complete";
  overallScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface RecommendedService {
  serviceId: string;
  serviceName: string;
  priority: "High" | "Medium" | "Low";
  estimatedTimeline: string;
  estimatedHoursMonthly: number;
  expectedBusinessImpact: string;
  dependencies: string[];
  monthlyFee: number;
  setupFee: number;
  ruleId: string;
  ruleReason: string;
}

export interface RecommendationOutput {
  id: string;
  auditId: string;
  intakeId: string;
  recommendations: RecommendedService[];
  generatedAt: string;
  status: "Draft" | "Applied";
}

export interface BudgetOptimizerInput {
  monthlyBudget: number;
  oneTimeBudget: number;
  contractLengthMonths: number;
}

export interface BudgetOptimizerOutput {
  recommendedPackage: Package | null;
  recommendedServices: RecommendedService[];
  optionalServices: RecommendedService[];
  futureServices: RecommendedService[];
  removedServices: RecommendedService[];
  monthlyTotal: number;
  oneTimeTotal: number;
  budgetRemaining: number;
  totalContractValue: number;
}

export interface ProposalLineItemRow {
  id: string;
  lineItemId: string;
  serviceId: string;
  name: string;
  category: string;
  department: string;
  billingCycle: "Monthly" | "One-Time" | "Quarterly" | "Annual";
  unitPrice: number;
  quantity: number;
  discount: number;
  discountType: "fixed" | "percentage" | "none";
  subtotal: number;
  notes?: string;
  isOverride: boolean;
  isCustom: boolean;
}

export interface ProposalSection {
  id: string;
  templateSectionId: string;
  key: string;
  label: string;
  order: number;
  visible: boolean;
  content: string;
  customNotes?: string;
}

export type ProposalStatus =
  | "Draft"
  | "Internal Review"
  | "Pending Approval"
  | "Sent"
  | "Negotiation"
  | "Accepted"
  | "Rejected"
  | "Expired"
  | "Converted To Contract";

export interface SalesProposal {
  id: string;
  intakeId: string;
  auditId: string;
  recommendationId: string;
  templateId: string;
  client: string;
  proposalName: string;
  salesRep: string;
  createdAt: string;
  expirationDate: string;
  status: ProposalStatus;
  contractLengthMonths: number;
  lineItems: ProposalLineItemRow[];
  sections: ProposalSection[];
  monthlyTotal: number;
  setupTotal: number;
  totalContractValue: number;
  discountAmount: number;
  promotionCode?: string;
  terms?: string;
  assumptions?: string;
  nextSteps?: string;
  customNotes?: string;
}

export type HandoffStatus =
  | "Proposal Approved"
  | "Handoff Incomplete"
  | "Ready to Send"
  | "Sent to Billing"
  | "Billing Received"
  | "Invoice Created"
  | "Invoice Sent"
  | "Invoice Paid"
  | "Ready for Activation";

export interface BillingHandoffRecord {
  id: string;
  proposalId: string;
  client: string;
  proposalName: string;
  salesRep: string;
  dealValue: string;
  totalContractValue: number;
  status: HandoffStatus;
  checklist: HandoffChecklistItem[];
  billingNotes: string;
  billingContact: string;
  billingEmail: string;
  contractSigned: boolean;
  nextAction: string;
  createdAt: string;
  sentToBillingAt?: string;
}

export interface HandoffChecklistItem {
  key: string;
  label: string;
  completed: boolean;
  required: boolean;
}

// ─── Sales Dashboard Widget Types ────────────────────────────────────────────

export interface SalesPipelineWidget {
  stage: string;
  count: number;
  value: number;
  convRate: number;
  color: string;
}

export interface SalesDashboardMetrics {
  activeIntakes: number;
  pendingAudits: number;
  pendingRecommendations: number;
  draftProposals: number;
  pendingApproval: number;
  acceptedProposals: number;
  pipelineValue: number;
  forecastRevenue: number;
  averageDealSize: number;
  winRate: number;
}
