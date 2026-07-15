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

// ─── Line Item System Types ──────────────────────────────────────────────────

export interface ServiceLineItem {
  id: string;
  serviceId: string;
  name: string;
  unitLabel: string;
  unitPrice: number;
  defaultQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  isIncludedFlat: boolean;
  description: string;
}

export interface LineItemSelection {
  lineItemId: string;
  quantity: number;
  subtotal: number;
}

export interface ServiceBudgetBreakdown {
  serviceId: string;
  serviceName: string;
  lineItemSelections: LineItemSelection[];
  computedMonthlySubtotal: number;
  setupFee: number;
}

// ─── Discount Types ──────────────────────────────────────────────────────────

export type DiscountType =
  | "none"
  | "percentage-monthly"
  | "flat-monthly"
  | "percentage-setup"
  | "flat-setup"
  | "custom";

export interface ProposalDiscount {
  type: DiscountType;
  /** Percentage as 0-100, or flat dollar amount depending on type */
  value: number;
  /** Shown on proposal PDF, e.g. "New Client Discount" */
  label: string;
  /** Internal only — not shown on PDF, e.g. "Approved by Jordan M." */
  authorizationNote: string;
}

export interface DiscountedBudgetSummary {
  totalMonthlyRecurring: number;
  totalSetupFees: number;
  discountType: DiscountType;
  discountValue: number;
  discountLabel: string;
  discountAmountMonthly: number;
  discountAmountSetup: number;
  discountedMonthly: number;
  discountedSetup: number;
  grandTotalFirstMonth: number;
  grandTotalMonthlyOngoing: number;
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

// ─── Home Services Intake Types ────────────────────────────────────────────────

export interface CompetitorEntry {
  name: string;
  city: string;
  website?: string;
}

export interface GBPListing {
  url?: string;
  rating?: number;
  reviewCount?: number;
}

export interface MasterAddress {
  street: string;
  suite: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface AdditionalLocation {
  locationName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  gbpUrl: string;
}

export interface ListingPlatformData {
  platformId: string;
  url: string;
  nameAsListed: string;
  addressAsListed: string;
  phoneAsListed: string;
  rating: number | null;
  reviewCount: number | null;
  notes: string;
}

export interface WebsiteData {
  hasWebsite: "yes" | "no" | "in-progress";
  url: string;
  platform: string;
  hostingProvider: string;
  domainRegistrar: string;
  hasHostingAccess: "yes" | "no" | "not-sure";
  hasDomainAccess: "yes" | "no" | "not-sure";
  interestedInRedesign: "yes" | "no" | "maybe";
  lastUpdated: string;
  interestedInNewBuild: "yes" | "no" | "maybe";
  hasDomain: boolean;
  domainName: string;
  preferredPlatform: string;
  inProgressDomain: string;
  inProgressBuilder: "us" | "other-agency" | "diy";
  inProgressETA: string;
}

export interface HostingData {
  currentSituation: "managed-by-us" | "self-managed" | "other-agency" | "no-hosting" | "part-of-package";
  providerName: string;
  monthlyCost: number | null;
  interestedInManagedHosting: "yes" | "no" | "maybe";
}

export interface SectionNote {
  sectionId: string;
  note: string;
  flagForFollowUp: boolean;
}

export interface HomeServicesIntakeRecord {
  // Section 1 — Business
  businessName: string;
  tradeType: string;
  businessStructure: string;
  locationCount: number;
  serviceArea: string[];
  yearsInBusiness: number;
  licensed: boolean;
  bonded: boolean;
  phone: string;
  email: string;
  website: string;
  masterAddress: MasterAddress;
  additionalLocations: AdditionalLocation[];
  // Section 2 — Contact
  contactName: string;
  contactRole: string;
  contactPhone: string;
  contactEmail: string;
  preferredContact: string;
  bestTimeToReach: string;
  // Section 3 — Online Presence
  gbpListings: GBPListing[];
  gbpListingCount: number;
  listingPlatforms: ListingPlatformData[];
  website2: WebsiteData;
  hosting: HostingData;
  currentlyMarketing: boolean;
  currentProvider: string;
  monthlyMarketingSpend: number;
  googleAdsActive: boolean;
  googleAdsSpend: number;
  lsaActive: boolean;
  lsaSpend: number;
  lsaCostPerLead: number;
  metaAdsActive: boolean;
  metaAdsSpend: number;
  monthlyLeads: number;
  primaryLeadSource: string;
  // Section 4 — Goals
  primaryGoals: string[];
  targetBudget: string;
  timeline: string;
  seasonalConsiderations: string;
  targetCustomerType: string;
  averageJobValue: string;
  competitors: CompetitorEntry[];
  // Section 5 — Sales Context
  leadSource: string;
  assignedRep: string;
  referralSource: string;
  affiliatePartner: string;
  howHeardAboutUs: string;
  discoveryNotes: string;
  painPoints: string;
  objections: string;
  specialRequirements: string;
  internalNotes: string;
  ghlContactId: string;
  // Section Notes
  sectionNotes: SectionNote[];
  globalCustomNote: string;
  flaggedForFollowUp: boolean;
}

// ─── Intake-Based Audit Types ─────────────────────────────────────────────────

export interface NAPComparison {
  field: "name" | "address" | "phone";
  masterValue: string;
  listedValue: string;
  status: "exact" | "minor-variation" | "major-mismatch" | "not-listed";
  notes: string;
}

export interface CitationAuditResult {
  platformId: string;
  platformLabel: string;
  url: string;
  isListed: boolean;
  napComparisons: NAPComparison[];
  overallStatus: "consistent" | "inconsistent" | "not-listed" | "needs-verification";
  score: number;
  recommendations: string[];
}

export interface KeywordSuggestion {
  keyword: string;
  type: "primary" | "local" | "long-tail" | "seasonal" | "competitor";
  priority: "high" | "medium" | "low";
  rationale: string;
}

export interface CompetitorAnalysis {
  competitorName: string;
  competitorCity: string;
  competitorWebsite: string;
  notes: string;
}

export interface CurrentMarketingAssessment {
  channelId: string;
  channelLabel: string;
  isActive: boolean;
  currentSpend: number;
  assessment: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}

export interface WebsiteAssessment {
  hasWebsite: boolean;
  url: string;
  platform: string;
  lastUpdated: string;
  hasHostingAccess: boolean;
  hasDomainAccess: boolean;
  interestedInRedesign: boolean;
  interestedInNewBuild: boolean;
  recommendations: string[];
  priority: "critical" | "high" | "medium" | "low";
}

export interface IntakeFinding {
  id: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  recommendation: string;
  source: "intake" | "manual" | "system" | "ai";
}

export interface IntakeAuditResult {
  intakeId: string;
  clientName: string;
  tradeType: string;
  masterAddress: MasterAddress;
  citationAudit: CitationAuditResult[];
  citationScore: number;
  keywordSuggestions: KeywordSuggestion[];
  competitorAnalysis: CompetitorAnalysis[];
  currentMarketingAssessment: CurrentMarketingAssessment[];
  websiteAssessment: WebsiteAssessment;
  overallFindings: IntakeFinding[];
  generatedAt: string;
}

// ─── AI Audit Types ──────────────────────────────────────────────────────────────

export type AiAuditStatus = "idle" | "running" | "complete" | "error";

export interface PageSpeedResult {
  url: string;
  performanceScore: number;
  mobileScore: number;
  desktopScore: number;
  lcp: string;
  cls: string;
  fid: string;
  opportunities: string[];
  fetchedAt: string;
}

export interface AiAuditServiceResult {
  serviceId: string;
  serviceLabel: string;
  findings: IntakeFinding[];
  summary: string;
  score: number;
  scoreLabel: string;
}

export interface AiAuditResult {
  websiteUrl: string;
  pageSpeed: PageSpeedResult | null;
  serviceResults: AiAuditServiceResult[];
  allFindings: IntakeFinding[];
  overallScore: number;
  generatedAt: string;
  aiModel: string;
}

// ─── Audit Request System Types ─────────────────────────────────────────────────

export type AuditRequestMode = "ai" | "manual" | "hybrid";

export type AuditRequestStatus =
  | "pending-assignment"
  | "in-progress"
  | "ai-complete-pending-review"
  | "finalized"
  | "overdue"
  | "cancelled";

export type ReviewerFindingActionType =
  | "accepted"
  | "modified"
  | "overridden"
  | "added";

export interface ReviewerFindingAction {
  findingId: string;
  actionType: ReviewerFindingActionType;
  reviewerNote: string;
  updatedSeverity: "critical" | "high" | "medium" | "low" | null;
  updatedDescription: string | null;
  updatedRecommendation: string | null;
  actionedAt: string;
  actionedBy: string;
}

export interface DepartmentReview {
  department: string;
  assignedReviewer: string | null;
  status: AuditRequestStatus;
  slaDeadline: string;
  aiFindings: IntakeFinding[];
  reviewerActions: ReviewerFindingAction[];
  addedFindings: IntakeFinding[];
  finalizedFindings: IntakeFinding[] | null;
  finalizedAt: string | null;
  finalizedBy: string | null;
}

export interface ManualAuditRequest {
  id: string;
  opportunityId: string;
  clientName: string;
  requestedServices: string[];
  assignedReviewer: string | null;
  department: string;
  status: AuditRequestStatus;
  scorecard: Record<string, number>;
  scorecardNotes: Record<string, string>;
  submittedFindings: IntakeFinding[] | null;
  requestedBy: string;
  requestedAt: string;
  dueAt: string;
  completedAt: string | null;
}

export interface HybridAuditRequest {
  id: string;
  opportunityId: string;
  clientName: string;
  intakeAuditResult: IntakeAuditResult;
  departmentReviews: DepartmentReview[];
  requestedBy: string;
  requestedAt: string;
}

export interface HybridReadinessSummary {
  totalDepartments: number;
  finalizedCount: number;
  pendingCount: number;
  overdueCount: number;
  statusLabel: string;
  isFullyReviewed: boolean;
}

// ─── Communication Log Types ─────────────────────────────────────────────────

export type CommunicationLogEntryType =
  | "call"
  | "call-transcript"
  | "email"
  | "meeting-notes"
  | "sms"
  | "note";

export interface CommunicationLogEntry {
  id: string;
  opportunityId: string;
  type: CommunicationLogEntryType;
  title: string;
  summary: string;
  fullContent: string;
  loggedBy: string;
  loggedAt: string;
  participants: string[];
  durationMinutes: number | null;
  attachmentNote: string;
}

export interface CommunicationLog {
  opportunityId: string;
  entries: CommunicationLogEntry[];
}

// ─── Kanban / Pipeline Sub-Types ──────────────────────────────────────────────
// These types extend OpportunityRecord to support the Kanban board's richer
// display. They are stored directly on the opportunity record and never
// fabricated — each is either real data or "Not Started" / deferred defaults.

export type KanbanAuditStatus =
  | "Not Started" | "Requested" | "In Progress" | "Completed" | "Reviewed";

export type KanbanProposalStatus =
  | "Not Started" | "Drafting" | "Sent" | "Viewed" | "Approved" | "Rejected";

export type KanbanFollowUpStatus =
  | "Upcoming" | "Due Today" | "Overdue" | "Completed" | "Cancelled";

export type KanbanHandoffStatus =
  | "Not Started" | "Initiated" | "Billing Sent" | "Invoice Created" | "Activated";

export type KanbanBillingRequestStatus =
  | "Pending" | "Submitted" | "Approved" | "Rejected";

export type KanbanInvoiceStatus =
  | "Not Created" | "Drafted" | "Sent" | "Paid";

export type KanbanActivationStatus =
  | "Not Started" | "In Progress" | "Live";

export type KanbanCommissionModel =
  | "Flat Fee" | "Percentage" | "Tiered" | "None";

export type KanbanTaskStatus =
  | "Open" | "In Progress" | "Completed" | "Overdue";

export type KanbanGhlSyncStatus =
  | "Synced" | "Pending Sync" | "Sync Failed" | "Manual Override" | "Not Connected";

export type KanbanGhlOpportunityStatus =
  | "open" | "won" | "lost" | "abandoned";

export interface KanbanAuditIntegration {
  status: KanbanAuditStatus;
  assignedAuditor: string;
  dueDate: string;
  findingsSummary: string;
}

export interface KanbanProposalIntegration {
  status: KanbanProposalStatus;
  proposalValue: number;
  sentDate: string;
  viewedDate: string;
  approvalStatus: string;
}

export interface KanbanFollowUp {
  id: string;
  subject: string;
  dueDate: string;
  status: KanbanFollowUpStatus;
  owner: string;
}

export interface KanbanHandoffIntegration {
  status: KanbanHandoffStatus;
  billingRequestStatus: KanbanBillingRequestStatus;
  invoiceStatus: KanbanInvoiceStatus;
  activationStatus: KanbanActivationStatus;
}

export interface KanbanAffiliateAttribution {
  affiliateName: string;
  referralSource: string;
  referralCode: string;
  commissionModel: KanbanCommissionModel;
  potentialCommission: number;
  revenueAttribution: number;
}

export interface KanbanTask {
  id: string;
  title: string;
  status: KanbanTaskStatus;
  owner: string;
  dueDate: string;
}

export interface KanbanNotification {
  id: string;
  type: string;
  message: string;
  date: string;
  read: boolean;
}

export type KanbanWorkflowStep =
  | "Lead" | "Audit" | "Proposal" | "Negotiation" | "Approved" | "Handoff" | "Billing";

export interface KanbanWorkflowEvent {
  step: KanbanWorkflowStep;
  completedAt: string;
  completedBy: string;
  notes: string;
}

export type KanbanActivityType =
  | "Lead Created" | "Discovery Scheduled" | "Audit Requested" | "Audit Completed"
  | "Proposal Drafted" | "Proposal Sent" | "Follow Up Completed"
  | "Negotiation Updated" | "Note Added" | "Stage Changed";

export type KanbanNoteCategory =
  | "Discovery" | "Audit" | "Proposal" | "Negotiation" | "Follow-Up" | "General";

export interface KanbanActivity {
  date: string;
  type: KanbanActivityType;
  user: string;
  notes: string;
}

export interface KanbanNote {
  date: string;
  author: string;
  note: string;
  category: KanbanNoteCategory;
}

export interface KanbanNextStep {
  action: string;
  owner: string;
  dueDate: string;
  priority: string;
}

export interface KanbanGhlFields {
  ghlOpportunityId: string;
  ghlContactId: string;
  ghlPipelineId: string;
  ghlPipelineName: string;
  ghlStageId: string;
  ghlStageName: string;
  ghlAssignedUserId: string;
  ghlAssignedUserName: string;
  ghlOpportunityStatus: KanbanGhlOpportunityStatus;
  ghlMonetaryValue: number;
  ghlSource: string;
  ghlCreatedAt: string;
  ghlUpdatedAt: string;
  ghlLastActivityAt: string;
  ghlSyncStatus: KanbanGhlSyncStatus;
  ghlSyncError: string;
}

// ─── Extended Opportunity Record (Unified / Kanban-capable) ──────────────────
// Superset of OpportunityRecord that includes all Kanban display fields.
// Both the Kanban board and the Opportunities sub-tab use this single type.
// All extended fields are optional so existing lighter records remain valid.

export interface OpportunityRecord {
  // ── Core fields (Opportunities sub-tab + Leads flow) ──
  id: string;
  opportunityNumber: string;
  leadId: string | null;
  clientName: string;
  businessName: string;
  tradeType: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  leadSource: string;
  assignedRep: string;
  stage: string;
  priority: string;
  estimatedMonthlyValue: number;
  expectedCloseDate: string;
  serviceInterest: string[];
  discoveryNotes: string;
  ghlContactId: string;
  ghlSynced: boolean;
  createdAt: string;
  updatedAt: string;
  intakeRecord: Partial<HomeServicesIntakeRecord> | null;
  communicationLog: CommunicationLog;
  activeWizardId: string | null;

  // ── Extended Kanban display fields (all optional) ──
  // These are populated by the seed migration and maintained on the record.
  industry?: string;
  website?: string;
  primaryContact?: string;
  email?: string;
  phone?: string;
  affiliateSource?: string;
  estimatedValue?: number;           // monthly value alias used by Kanban
  monthlyValue?: number;
  contractLength?: string;
  probability?: number;
  daysInStage?: number;
  nextAction?: string;
  closingMonth?: string;
  opportunityScore?: number;
  forecastMonth?: string;
  forecastQuarter?: string;

  // ── Sub-feature objects ──
  // audit: stored display metadata; links to /sales/audits (honestly deferred live query)
  audit?: KanbanAuditIntegration;
  // proposal: stored display metadata; links to /sales/proposals (honestly deferred live query)
  proposal?: KanbanProposalIntegration;
  // followUps: stored per-opportunity follow-up list
  followUps?: KanbanFollowUp[];
  // handoff: stored display metadata; links to /sales/handoffs
  handoff?: KanbanHandoffIntegration;
  // affiliate: stored attribution data; links to /sales/affiliates
  affiliate?: KanbanAffiliateAttribution;
  // tasks: stored task list on the opportunity record (no live query — pending-sales-tasks is empty)
  tasks?: KanbanTask[];
  // notifications: stored notification list (no real notification system exists — honestly deferred)
  notifications?: KanbanNotification[];
  // workflowEvents: stored workflow history
  workflowEvents?: KanbanWorkflowEvent[];
  // recentActivities, notes, nextSteps: stored activity/notes/steps
  recentActivities?: KanbanActivity[];
  notes?: KanbanNote[];
  nextSteps?: KanbanNextStep[];
  // ghl: GHL display fields (sync is Coming Soon across all GHL surfaces)
  ghl?: KanbanGhlFields;
}
