// ─── RTM OS — Offboarding Engine Mock Data ───────────────────────────────────
// Covers: Offboarding Projects, Checklists, Asset Transfers, Access Removal,
//         Final Billing, Knowledge Archive, AI Summary, Executive Dashboard,
//         Department Tasks, Activity Timeline.

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export type OffboardingStatus =
  | "Initiated"| "Planning"| "In Progress"| "Waiting On Client"| "Final Billing"| "Asset Transfer"| "Access Removal"| "Completed"| "Archived";

export type FinalBillingStatus =
  | "Not Started"| "Invoice Pending"| "Invoice Sent"| "Paid"| "Overdue"| "Waived"| "Write Off";

export type AssetTransferStatus =
  | "Not Started"| "In Progress"| "Waiting On Client"| "Transferred"| "Not Applicable";

export type AccessRemovalStatus =
  | "Active"| "Revoked"| "Pending Removal"| "Not Applicable";

export type ChecklistItemStatus =
  | "Not Started"| "In Progress"| "Completed"| "Blocked"| "Not Applicable";

export type DepartmentTaskStatus =
  | "Not Started"| "In Progress"| "Completed"| "Overdue"| "Blocked";

// Locked 11-category reason list — matches cancellation-queue.ts and cancellations-data.ts.
// Existing seed records use legacy values; the type is kept broad with string
// fallback in reason-breakdown rendering to avoid hard errors during the seed-data migration.
export type CancellationReason =
  | "Not Performing"
  | "Moving In-house"
  | "Unpaid Invoice"
  | "Pricing/Financial Hardship"
  | "Communication Issue"
  | "Bankruptcy"
  | "Business Acquisition"
  | "Acquired By Private Equity"
  | "Changing Provider (New Company Name)"
  | "Closing Business"
  | "Pending Client Confirmation"
  // Legacy values kept for existing seed records; new records use the locked list.
  | "Budget" | "Performance" | "Service Quality" | "Communication"
  | "Competitor" | "Business Closure" | "Internal Staffing"
  | "No Longer Needed" | "Other";

// ── Checklist Item ─────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  label: string;
  status: ChecklistItemStatus;
  owner: string;
  dueDate: string;
  notes?: string;
}

// ── Department Task ────────────────────────────────────────────────────────

export interface DepartmentTask {
  id: string;
  department: string;
  task: string;
  status: DepartmentTaskStatus;
  owner: string;
  dueDate: string;
  notes?: string;
}

// ── Asset Transfer ─────────────────────────────────────────────────────────

export interface AssetTransfer {
  id: string;
  assetType: string;
  currentOwner: string;
  recipient: string;
  status: AssetTransferStatus;
  completedDate: string | null;
  notes?: string;
}

// ── Access Removal ─────────────────────────────────────────────────────────

export interface AccessRemoval {
  id: string;
  tool: string;
  user: string;
  accessStatus: AccessRemovalStatus;
  removedDate: string | null;
  owner: string;
  notes?: string;
}

// ── Final Billing ──────────────────────────────────────────────────────────

export interface FinalBilling {
  outstandingBalance: number;
  credits: number;
  refunds: number;
  finalInvoiceAmount: number;
  finalInvoiceDate: string | null;
  collectionStatus: "Not Started"| "Pending"| "Collected"| "Overdue"| "Waived"| "Write Off";
  approvalStatus: "Pending Approval"| "Approved"| "Rejected";
  notes?: string;
}

// ── Knowledge Archive ──────────────────────────────────────────────────────

export interface KnowledgeArchive {
  finalNotes: string;
  lessonsLearned: string;
  clientHistory: string;
  projectSummary: string;
  retentionAttempts: string;
  reasonForDeparture: string;
}

// ── AI Summary ─────────────────────────────────────────────────────────────

export interface AISummary {
  clientSummary: string;
  reasonForCancellation: string;
  revenueImpact: string;
  assetsTransferred: string;
  outstandingRisks: string;
  recommendedActions: string[];
}

// ── Activity Event ─────────────────────────────────────────────────────────

export interface ActivityEvent {
  date: string;
  event: string;
  actor: string;
  description: string;
  category:
    | "Cancellation Approved"| "Offboarding Created"| "Asset Transfer"| "Access Removal"| "Final Billing"| "Archive"| "Communication"| "Completed"| "Note";
}

// ── Offboarding Record ─────────────────────────────────────────────────────

export interface OffboardingRecord {
  id: string;
  client: string;
  accountManager: string;
  offboardingOwner: string;
  cancellationDate: string;
  targetCompletionDate: string;
  actualCompletionDate: string | null;
  offboardingStatus: OffboardingStatus;
  finalBillingStatus: FinalBillingStatus;
  assetTransferStatus: AssetTransferStatus;
  accessRemovalStatus: AccessRemovalStatus;
  completionPct: number;
  mrr: number;
  arr: number;
  reason: CancellationReason;
  departmentsInvolved: string[];
  services: string[];
  checklist: ChecklistItem[];
  departmentTasks: DepartmentTask[];
  assetTransfers: AssetTransfer[];
  accessRemovals: AccessRemoval[];
  finalBilling: FinalBilling;
  knowledgeArchive: KnowledgeArchive;
  aiSummary: AISummary;
  activityTimeline: ActivityEvent[];
}

// ══════════════════════════════════════════════════════════════════════════════
// MOCK DATA — 20 OFFBOARDING RECORDS
// ══════════════════════════════════════════════════════════════════════════════

export const OFFBOARDING_RECORDS: OffboardingRecord[] = [
  // ── 1. Harbor Auto Group ──────────────────────────────────────────────────
  {
    id: "ob-001",
    client: "Harbor Auto Group",
    accountManager: "Sarah Chen",
    offboardingOwner: "Sarah Chen",
    cancellationDate: "2025-05-01",
    targetCompletionDate: "2025-05-31",
    actualCompletionDate: null,
    offboardingStatus: "In Progress",
    finalBillingStatus: "Invoice Sent",
    assetTransferStatus: "In Progress",
    accessRemovalStatus: "Pending Removal",
    completionPct: 55,
    mrr: 3200,
    arr: 38400,
    reason: "Budget",
    departmentsInvolved: ["Account Management", "Paid Advertising", "SEO", "Billing"],
    services: ["Google Ads", "SEO"],
    checklist: [
      { id: "c-001-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-05-10", notes: "Final invoice sent 2025-05-08"},
      { id: "c-001-2", label: "Export Reports", status: "Completed", owner: "Sarah Chen", dueDate: "2025-05-12"},
      { id: "c-001-3", label: "Deliver Final Reports", status: "Completed", owner: "Sarah Chen", dueDate: "2025-05-14"},
      { id: "c-001-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-15"},
      { id: "c-001-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-15"},
      { id: "c-001-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-15"},
      { id: "c-001-7", label: "Transfer Analytics Access", status: "In Progress", owner: "Sarah Chen", dueDate: "2025-05-20"},
      { id: "c-001-8", label: "Transfer Ad Accounts", status: "In Progress", owner: "Paid Ads Team", dueDate: "2025-05-20"},
      { id: "c-001-9", label: "Transfer GBP Access", status: "Not Started", owner: "SEO Team", dueDate: "2025-05-22"},
      { id: "c-001-10", label: "Transfer CRM Access", status: "Not Started", owner: "IT Team", dueDate: "2025-05-22"},
      { id: "c-001-11", label: "Transfer Documentation", status: "Not Started", owner: "Sarah Chen", dueDate: "2025-05-25"},
      { id: "c-001-12", label: "Remove Internal Access", status: "Not Started", owner: "IT Team", dueDate: "2025-05-28"},
      { id: "c-001-13", label: "Archive Records", status: "Not Started", owner: "Sarah Chen", dueDate: "2025-05-31"},
    ],
    departmentTasks: [
      { id: "dt-001-1", department: "Paid Advertising", task: "Transfer Google Ads account ownership", status: "In Progress", owner: "Jake Torres", dueDate: "2025-05-20"},
      { id: "dt-001-2", department: "SEO", task: "Export keyword rankings and backlink reports", status: "Completed", owner: "Megan Ross", dueDate: "2025-05-12"},
      { id: "dt-001-3", department: "Billing", task: "Issue final invoice and reconcile account", status: "Completed", owner: "Billing Team", dueDate: "2025-05-10"},
      { id: "dt-001-4", department: "Account Management", task: "Deliver offboarding package to client", status: "In Progress", owner: "Sarah Chen", dueDate: "2025-05-25"},
      { id: "dt-001-5", department: "IT", task: "Revoke all internal tool access", status: "Not Started", owner: "IT Team", dueDate: "2025-05-28"},
    ],
    assetTransfers: [
      { id: "at-001-1", assetType: "Google Ads Account", currentOwner: "RTM OS", recipient: "Harbor Auto Group", status: "In Progress", completedDate: null },
      { id: "at-001-2", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Harbor Auto Group", status: "In Progress", completedDate: null },
      { id: "at-001-3", assetType: "Campaign Data Export", currentOwner: "RTM OS", recipient: "Harbor Auto Group", status: "Transferred", completedDate: "2025-05-14"},
      { id: "at-001-4", assetType: "SEO Audit Reports", currentOwner: "RTM OS", recipient: "Harbor Auto Group", status: "Transferred", completedDate: "2025-05-14"},
    ],
    accessRemovals: [
      { id: "ar-001-1", tool: "CRM", user: "Harbor Auto — Linda Torres", accessStatus: "Pending Removal", removedDate: null, owner: "IT Team"},
      { id: "ar-001-2", tool: "Analytics Platform", user: "Harbor Auto — Linda Torres", accessStatus: "Pending Removal", removedDate: null, owner: "IT Team"},
      { id: "ar-001-3", tool: "Google Ads Manager", user: "Harbor Auto — Linda Torres", accessStatus: "Active", removedDate: null, owner: "Paid Ads Team"},
      { id: "ar-001-4", tool: "Internal Project Portal", user: "Harbor Auto — Linda Torres", accessStatus: "Revoked", removedDate: "2025-05-15", owner: "IT Team"},
    ],
    finalBilling: {
      outstandingBalance: 3200,
      credits: 0,
      refunds: 0,
      finalInvoiceAmount: 3200,
      finalInvoiceDate: "2025-05-08",
      collectionStatus: "Pending",
      approvalStatus: "Approved",
      notes: "Net-30 payment terms. Due 2025-06-08.",
    },
    knowledgeArchive: {
      finalNotes: "Client cited budget cuts due to Q1 revenue decline. Good relationship overall — open to returning in 12-18 months.",
      lessonsLearned: "Ad performance was strong but the client needed clearer monthly ROI summaries to justify spend internally.",
      clientHistory: "2 years, 4 months. Started with Google Ads only, added SEO in month 8. Renewed once.",
      projectSummary: "Managed Google Ads and SEO for 3 dealership locations. Campaign performance exceeded industry benchmarks.",
      retentionAttempts: "AM offered 15% budget reduction. Client declined — CEO made final call to pause all marketing spend.",
      reasonForDeparture: "Budget — company-wide cost reduction initiative affecting all vendor contracts.",
    },
    aiSummary: {
      clientSummary: "Harbor Auto Group was a 2.4-year client with $3,200/mo in Google Ads and SEO services. They maintained strong campaign performance but departed due to an internal budget freeze initiated by executive leadership.",
      reasonForCancellation: "Budget reduction — executive-level decision to cut all external marketing spend. Not performance-related. AM confirmed retention attempt was made and declined.",
      revenueImpact: "$3,200/mo MRR lost. $38,400 ARR reduction. Google Ads was primary service (85% of revenue).",
      assetsTransferred: "Campaign data exported. Google Ads account transfer in progress. Analytics access pending.",
      outstandingRisks: "Final invoice outstanding — $3,200 due 2025-06-08. Google Ads account transfer not yet confirmed by client.",
      recommendedActions: [
        "Follow up on outstanding invoice before due date",
        "Confirm Google Ads account transfer completion with client",
        "Send re-engagement sequence in 90 days",
        "Flag as winback candidate when budget conditions improve",
      ],
    },
    activityTimeline: [
      { date: "2025-05-01", event: "Cancellation Approved", actor: "Director of AM", description: "Cancellation formally approved after failed retention attempt. Client moved to offboarding.", category: "Cancellation Approved"},
      { date: "2025-05-02", event: "Offboarding Created", actor: "Sarah Chen", description: "Offboarding project created. Checklist initialized. Departments notified.", category: "Offboarding Created"},
      { date: "2025-05-08", event: "Final Invoice Sent", actor: "Billing Team", description: "Final invoice for $3,200 sent to client contact Linda Torres. Net-30 terms.", category: "Final Billing"},
      { date: "2025-05-12", event: "Reports Exported", actor: "Megan Ross", description: "All SEO ranking reports and paid campaign history exported and packaged.", category: "Asset Transfer"},
      { date: "2025-05-14", event: "Campaign Data Delivered", actor: "Sarah Chen", description: "Data package delivered to client via shared drive. Confirmed by client.", category: "Asset Transfer"},
      { date: "2025-05-15", event: "Portal Access Revoked", actor: "IT Team", description: "Client portal access removed from all Harbor Auto team members.", category: "Access Removal"},
      { date: "2025-05-18", event: "Ad Account Transfer Initiated", actor: "Jake Torres", description: "Google Ads account transfer request submitted. Awaiting client acceptance.", category: "Asset Transfer"},
    ],
  },

  // ── 2. Lakeview Dental ────────────────────────────────────────────────────
  {
    id: "ob-002",
    client: "Lakeview Dental",
    accountManager: "Sarah Chen",
    offboardingOwner: "Sarah Chen",
    cancellationDate: "2025-04-15",
    targetCompletionDate: "2025-05-15",
    actualCompletionDate: "2025-05-14",
    offboardingStatus: "Completed",
    finalBillingStatus: "Paid",
    assetTransferStatus: "Transferred",
    accessRemovalStatus: "Revoked",
    completionPct: 100,
    mrr: 2400,
    arr: 28800,
    reason: "Performance",
    departmentsInvolved: ["Account Management", "SEO", "Billing"],
    services: ["SEO", "Reporting"],
    checklist: [
      { id: "c-002-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-04-25"},
      { id: "c-002-2", label: "Export Reports", status: "Completed", owner: "Sarah Chen", dueDate: "2025-04-28"},
      { id: "c-002-3", label: "Deliver Final Reports", status: "Completed", owner: "Sarah Chen", dueDate: "2025-04-30"},
      { id: "c-002-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-01"},
      { id: "c-002-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-01"},
      { id: "c-002-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-01"},
      { id: "c-002-7", label: "Transfer Analytics Access", status: "Completed", owner: "Sarah Chen", dueDate: "2025-05-05"},
      { id: "c-002-8", label: "Transfer Ad Accounts", status: "Not Applicable", owner: "Paid Ads Team", dueDate: "2025-05-05"},
      { id: "c-002-9", label: "Transfer GBP Access", status: "Completed", owner: "SEO Team", dueDate: "2025-05-07"},
      { id: "c-002-10", label: "Transfer CRM Access", status: "Completed", owner: "IT Team", dueDate: "2025-05-07"},
      { id: "c-002-11", label: "Transfer Documentation", status: "Completed", owner: "Sarah Chen", dueDate: "2025-05-10"},
      { id: "c-002-12", label: "Remove Internal Access", status: "Completed", owner: "IT Team", dueDate: "2025-05-12"},
      { id: "c-002-13", label: "Archive Records", status: "Completed", owner: "Sarah Chen", dueDate: "2025-05-14"},
    ],
    departmentTasks: [
      { id: "dt-002-1", department: "SEO", task: "Export all ranking reports and keyword history", status: "Completed", owner: "Megan Ross", dueDate: "2025-04-28"},
      { id: "dt-002-2", department: "SEO", task: "Transfer GBP ownership to client", status: "Completed", owner: "Megan Ross", dueDate: "2025-05-07"},
      { id: "dt-002-3", department: "Billing", task: "Process final payment and close account", status: "Completed", owner: "Billing Team", dueDate: "2025-04-25"},
      { id: "dt-002-4", department: "Account Management", task: "Archive client record in CRM", status: "Completed", owner: "Sarah Chen", dueDate: "2025-05-14"},
    ],
    assetTransfers: [
      { id: "at-002-1", assetType: "Google Analytics Access", currentOwner: "RTM OS", recipient: "Lakeview Dental", status: "Transferred", completedDate: "2025-05-05"},
      { id: "at-002-2", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Dr. Sharon Kim", status: "Transferred", completedDate: "2025-05-07"},
      { id: "at-002-3", assetType: "SEO Reports Archive", currentOwner: "RTM OS", recipient: "Lakeview Dental", status: "Transferred", completedDate: "2025-04-30"},
    ],
    accessRemovals: [
      { id: "ar-002-1", tool: "CRM", user: "Lakeview Dental — Dr. Sharon Kim", accessStatus: "Revoked", removedDate: "2025-05-12", owner: "IT Team"},
      { id: "ar-002-2", tool: "Analytics Platform", user: "Lakeview Dental — Dr. Sharon Kim", accessStatus: "Revoked", removedDate: "2025-05-12", owner: "IT Team"},
      { id: "ar-002-3", tool: "Internal Project Portal", user: "Lakeview Dental — Dr. Sharon Kim", accessStatus: "Revoked", removedDate: "2025-05-12", owner: "IT Team"},
    ],
    finalBilling: {
      outstandingBalance: 0,
      credits: 0,
      refunds: 0,
      finalInvoiceAmount: 2400,
      finalInvoiceDate: "2025-04-20",
      collectionStatus: "Collected",
      approvalStatus: "Approved",
    },
    knowledgeArchive: {
      finalNotes: "Client was dissatisfied with SEO results over the past 6 months. Ranking improvements were below expectations. Relationship ended on amicable terms.",
      lessonsLearned: "Should have set more realistic SEO timelines for a competitive dental market. Monthly progress calls would have helped manage expectations.",
      clientHistory: "2 years, 9 months. SEO + reporting. Decent retention — renewed once but flagged performance concerns at 18 months.",
      projectSummary: "Managed local SEO for a 2-location dental practice. GBP optimization achieved top-3 placement in one location.",
      retentionAttempts: "AM presented a revised strategy and offered a 3-month performance guarantee. Dr. Kim declined.",
      reasonForDeparture: "Performance — organic rankings in competitive Chicago market did not meet client expectations.",
    },
    aiSummary: {
      clientSummary: "Lakeview Dental was a 2.9-year client providing $2,400/mo in SEO and reporting services. Offboarding completed cleanly on schedule. All assets transferred and access removed.",
      reasonForCancellation: "Performance dissatisfaction — client felt SEO results in the Chicago dental market were insufficient. The AM made a retention attempt with a performance guarantee that was declined.",
      revenueImpact: "$2,400/mo MRR lost. $28,800 ARR reduction. Offboarding fully reconciled — no outstanding balance.",
      assetsTransferred: "Analytics, GBP admin, and SEO reports all transferred to client. Complete.",
      outstandingRisks: "None — all tasks completed. Account fully closed.",
      recommendedActions: [
        "Document performance baseline and outcome for future dental market proposals",
        "Consider this case when scoping SEO timelines for competitive local markets",
        "Archive in CRM with re-engagement flag for 18 months",
      ],
    },
    activityTimeline: [
      { date: "2025-04-15", event: "Cancellation Approved", actor: "Director of AM", description: "Client cancellation approved after performance review. Offboarding initiated.", category: "Cancellation Approved"},
      { date: "2025-04-16", event: "Offboarding Created", actor: "Sarah Chen", description: "Offboarding project created. All departments notified.", category: "Offboarding Created"},
      { date: "2025-04-20", event: "Final Invoice Sent", actor: "Billing Team", description: "Final invoice for $2,400 sent. Payment received 2025-04-22.", category: "Final Billing"},
      { date: "2025-04-28", event: "Reports Exported", actor: "Sarah Chen", description: "Full SEO and analytics history exported.", category: "Asset Transfer"},
      { date: "2025-05-05", event: "Analytics Access Transferred", actor: "Sarah Chen", description: "Google Analytics admin access transferred to Dr. Kim.", category: "Asset Transfer"},
      { date: "2025-05-07", event: "GBP Transferred", actor: "Megan Ross", description: "Google Business Profile ownership transferred to client.", category: "Asset Transfer"},
      { date: "2025-05-12", event: "All Access Revoked", actor: "IT Team", description: "All internal system access removed for Lakeview Dental.", category: "Access Removal"},
      { date: "2025-05-14", event: "Offboarding Completed", actor: "Sarah Chen", description: "All checklist items confirmed complete. Account archived.", category: "Completed"},
    ],
  },

  // ── 3. Orion Plumbing ────────────────────────────────────────────────────
  {
    id: "ob-003",
    client: "Orion Plumbing",
    accountManager: "James Park",
    offboardingOwner: "James Park",
    cancellationDate: "2025-05-10",
    targetCompletionDate: "2025-06-10",
    actualCompletionDate: null,
    offboardingStatus: "Waiting On Client",
    finalBillingStatus: "Invoice Sent",
    assetTransferStatus: "Waiting On Client",
    accessRemovalStatus: "Pending Removal",
    completionPct: 35,
    mrr: 2100,
    arr: 25200,
    reason: "Competitor",
    departmentsInvolved: ["Account Management", "SEO", "Paid Advertising", "Billing"],
    services: ["PPC", "LSA", "GBP"],
    checklist: [
      { id: "c-003-1", label: "Finalize Billing", status: "In Progress", owner: "Billing Team", dueDate: "2025-05-20"},
      { id: "c-003-2", label: "Export Reports", status: "Completed", owner: "James Park", dueDate: "2025-05-18"},
      { id: "c-003-3", label: "Deliver Final Reports", status: "In Progress", owner: "James Park", dueDate: "2025-05-22"},
      { id: "c-003-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-25"},
      { id: "c-003-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-25"},
      { id: "c-003-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-25"},
      { id: "c-003-7", label: "Transfer Analytics Access", status: "Not Started", owner: "James Park", dueDate: "2025-05-28"},
      { id: "c-003-8", label: "Transfer Ad Accounts", status: "Blocked", owner: "Paid Ads Team", dueDate: "2025-05-28", notes: "Client has not responded to Google Ads transfer request"},
      { id: "c-003-9", label: "Transfer GBP Access", status: "Not Started", owner: "SEO Team", dueDate: "2025-06-01"},
      { id: "c-003-10", label: "Transfer CRM Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-01"},
      { id: "c-003-11", label: "Transfer Documentation", status: "Not Started", owner: "James Park", dueDate: "2025-06-05"},
      { id: "c-003-12", label: "Remove Internal Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-07"},
      { id: "c-003-13", label: "Archive Records", status: "Not Started", owner: "James Park", dueDate: "2025-06-10"},
    ],
    departmentTasks: [
      { id: "dt-003-1", department: "Paid Advertising", task: "Transfer Google Ads account", status: "Blocked", owner: "Jake Torres", dueDate: "2025-05-28", notes: "Awaiting client to accept transfer invitation"},
      { id: "dt-003-2", department: "SEO", task: "Export LSA and GBP data", status: "Completed", owner: "Megan Ross", dueDate: "2025-05-18"},
      { id: "dt-003-3", department: "Billing", task: "Send final invoice", status: "In Progress", owner: "Billing Team", dueDate: "2025-05-20"},
      { id: "dt-003-4", department: "Account Management", task: "Follow up with client on transfer acceptance", status: "In Progress", owner: "James Park", dueDate: "2025-05-25"},
    ],
    assetTransfers: [
      { id: "at-003-1", assetType: "Google Ads Account", currentOwner: "RTM OS", recipient: "Orion Plumbing", status: "Waiting On Client", completedDate: null, notes: "Transfer invitation sent 2025-05-18. No response."},
      { id: "at-003-2", assetType: "LSA Campaign Data", currentOwner: "RTM OS", recipient: "Orion Plumbing", status: "In Progress", completedDate: null },
      { id: "at-003-3", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Carlos Reyes", status: "Not Started", completedDate: null },
    ],
    accessRemovals: [
      { id: "ar-003-1", tool: "CRM", user: "Orion Plumbing — Carlos Reyes", accessStatus: "Active", removedDate: null, owner: "IT Team"},
      { id: "ar-003-2", tool: "Internal Project Portal", user: "Orion Plumbing — Carlos Reyes", accessStatus: "Active", removedDate: null, owner: "IT Team"},
      { id: "ar-003-3", tool: "Ads Manager", user: "Orion Plumbing — Carlos Reyes", accessStatus: "Active", removedDate: null, owner: "Paid Ads Team"},
    ],
    finalBilling: {
      outstandingBalance: 2100,
      credits: 0,
      refunds: 0,
      finalInvoiceAmount: 2100,
      finalInvoiceDate: "2025-05-18",
      collectionStatus: "Pending",
      approvalStatus: "Approved",
    },
    knowledgeArchive: {
      finalNotes: "Client moved to a competitor offering a lower price point with a bundled website package. Relationship was positive — no service complaints.",
      lessonsLearned: "Need to bundle website + marketing services to compete with full-service competitors targeting small trades.",
      clientHistory: "1 year, 2 months. PPC, LSA, and GBP management. No renewals — short contract cycle.",
      projectSummary: "Managed PPC and LSA campaigns for a 2-crew plumbing operation. Lead volume was consistent.",
      retentionAttempts: "AM offered a 10% discount. Client had already signed with competitor.",
      reasonForDeparture: "Competitor — client accepted an offer from a bundled marketing + web provider.",
    },
    aiSummary: {
      clientSummary: "Orion Plumbing was a 14-month client generating $2,100/mo in PPC and LSA revenue. They departed to a competitor offering a bundled web + marketing package. Offboarding is delayed due to non-responsive client.",
      reasonForCancellation: "Competitor offer — client moved to a lower-cost bundled provider. No service quality issues were cited.",
      revenueImpact: "$2,100/mo MRR lost. $25,200 ARR reduction.",
      assetsTransferred: "Data exports complete. Google Ads transfer pending client acceptance. GBP transfer not started.",
      outstandingRisks: "Client is non-responsive to asset transfer requests. Final invoice outstanding. Risk of delayed closure.",
      recommendedActions: [
        "Escalate client follow-up — send formal offboarding deadline notice",
        "Set 5-day deadline for Google Ads transfer acceptance or release to client",
        "Collect final invoice payment before completing access handoff",
        "Flag competitive pricing gap in service bundling for product team",
      ],
    },
    activityTimeline: [
      { date: "2025-05-10", event: "Cancellation Approved", actor: "Director of AM", description: "Cancellation approved. Client confirmed departure to competitor.", category: "Cancellation Approved"},
      { date: "2025-05-11", event: "Offboarding Created", actor: "James Park", description: "Offboarding project created. Departments notified.", category: "Offboarding Created"},
      { date: "2025-05-18", event: "Reports Exported", actor: "Megan Ross", description: "All LSA and GBP data exported and packaged.", category: "Asset Transfer"},
      { date: "2025-05-18", event: "Final Invoice Sent", actor: "Billing Team", description: "Final invoice for $2,100 sent to client.", category: "Final Billing"},
      { date: "2025-05-18", event: "Ad Transfer Invited", actor: "Jake Torres", description: "Google Ads account transfer invitation sent. Client has not responded.", category: "Asset Transfer"},
      { date: "2025-05-22", event: "Follow-Up Sent", actor: "James Park", description: "AM sent follow-up email and left voicemail regarding pending transfer acceptance.", category: "Communication"},
    ],
  },

  // ── 4. Cascade Roofing (Completed) ────────────────────────────────────────
  {
    id: "ob-004",
    client: "Cascade Roofing",
    accountManager: "James Park",
    offboardingOwner: "James Park",
    cancellationDate: "2025-03-01",
    targetCompletionDate: "2025-03-31",
    actualCompletionDate: "2025-03-28",
    offboardingStatus: "Archived",
    finalBillingStatus: "Paid",
    assetTransferStatus: "Transferred",
    accessRemovalStatus: "Revoked",
    completionPct: 100,
    mrr: 1800,
    arr: 21600,
    reason: "Business Closure",
    departmentsInvolved: ["Account Management", "Billing", "SEO"],
    services: ["SEO", "GBP", "Content"],
    checklist: [
      { id: "c-004-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-03-10"},
      { id: "c-004-2", label: "Export Reports", status: "Completed", owner: "James Park", dueDate: "2025-03-12"},
      { id: "c-004-3", label: "Deliver Final Reports", status: "Completed", owner: "James Park", dueDate: "2025-03-14"},
      { id: "c-004-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-03-15"},
      { id: "c-004-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-03-15"},
      { id: "c-004-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-03-15"},
      { id: "c-004-7", label: "Transfer Analytics Access", status: "Completed", owner: "James Park", dueDate: "2025-03-18"},
      { id: "c-004-8", label: "Transfer Ad Accounts", status: "Not Applicable", owner: "Paid Ads Team", dueDate: "2025-03-18"},
      { id: "c-004-9", label: "Transfer GBP Access", status: "Completed", owner: "SEO Team", dueDate: "2025-03-20"},
      { id: "c-004-10", label: "Transfer CRM Access", status: "Completed", owner: "IT Team", dueDate: "2025-03-22"},
      { id: "c-004-11", label: "Transfer Documentation", status: "Completed", owner: "James Park", dueDate: "2025-03-24"},
      { id: "c-004-12", label: "Remove Internal Access", status: "Completed", owner: "IT Team", dueDate: "2025-03-26"},
      { id: "c-004-13", label: "Archive Records", status: "Completed", owner: "James Park", dueDate: "2025-03-28"},
    ],
    departmentTasks: [
      { id: "dt-004-1", department: "SEO", task: "Export all SEO history and content", status: "Completed", owner: "Megan Ross", dueDate: "2025-03-12"},
      { id: "dt-004-2", department: "Billing", task: "Close account and reconcile final balance", status: "Completed", owner: "Billing Team", dueDate: "2025-03-10"},
      { id: "dt-004-3", department: "Account Management", task: "Archive CRM record", status: "Completed", owner: "James Park", dueDate: "2025-03-28"},
    ],
    assetTransfers: [
      { id: "at-004-1", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Cascade Roofing Owner", status: "Transferred", completedDate: "2025-03-20"},
      { id: "at-004-2", assetType: "Analytics History", currentOwner: "RTM OS", recipient: "Cascade Roofing Owner", status: "Transferred", completedDate: "2025-03-18"},
      { id: "at-004-3", assetType: "Content Archive", currentOwner: "RTM OS", recipient: "Cascade Roofing Owner", status: "Transferred", completedDate: "2025-03-14"},
    ],
    accessRemovals: [
      { id: "ar-004-1", tool: "CRM", user: "Cascade Roofing — Eric Walsh", accessStatus: "Revoked", removedDate: "2025-03-26", owner: "IT Team"},
      { id: "ar-004-2", tool: "Internal Project Portal", user: "Cascade Roofing — Eric Walsh", accessStatus: "Revoked", removedDate: "2025-03-26", owner: "IT Team"},
    ],
    finalBilling: {
      outstandingBalance: 0,
      credits: 0,
      refunds: 900,
      finalInvoiceAmount: 900,
      finalInvoiceDate: "2025-03-05",
      collectionStatus: "Collected",
      approvalStatus: "Approved",
      notes: "Partial refund issued for unused services — business closure prorated.",
    },
    knowledgeArchive: {
      finalNotes: "Owner retired and closed the business. No performance issues. Very positive relationship throughout.",
      lessonsLearned: "Business closure offboardings should be expedited — client doesn't have time to manage a lengthy process.",
      clientHistory: "1 year, 8 months. SEO, GBP, and content management. Strong results throughout.",
      projectSummary: "Managed local SEO and content for a family-owned roofing company. Achieved top-3 GBP rankings.",
      retentionAttempts: "No retention attempt — business closure is a definitive exit.",
      reasonForDeparture: "Business Closure — owner retirement.",
    },
    aiSummary: {
      clientSummary: "Cascade Roofing was a 20-month client with $1,800/mo in services. Offboarding was clean and expedited due to business closure. All tasks completed 3 days ahead of schedule.",
      reasonForCancellation: "Business closure due to owner retirement. No performance or service issues.",
      revenueImpact: "$1,800/mo MRR lost. $21,600 ARR reduction. Prorated refund of $900 issued.",
      assetsTransferred: "All assets transferred including GBP, analytics, and content archive.",
      outstandingRisks: "None. Offboarding fully complete and archived.",
      recommendedActions: ["No action required — account fully closed and archived."],
    },
    activityTimeline: [
      { date: "2025-03-01", event: "Cancellation Approved", actor: "Director of AM", description: "Business closure confirmed. Expedited offboarding authorized.", category: "Cancellation Approved"},
      { date: "2025-03-02", event: "Offboarding Created", actor: "James Park", description: "Offboarding project created on expedited timeline.", category: "Offboarding Created"},
      { date: "2025-03-05", event: "Final Invoice Sent", actor: "Billing Team", description: "Prorated final invoice sent. Partial refund of $900 processed.", category: "Final Billing"},
      { date: "2025-03-14", event: "Content Archive Delivered", actor: "James Park", description: "Full content archive transferred to client.", category: "Asset Transfer"},
      { date: "2025-03-20", event: "GBP Transferred", actor: "SEO Team", description: "GBP admin access transferred to owner.", category: "Asset Transfer"},
      { date: "2025-03-26", event: "All Access Revoked", actor: "IT Team", description: "All system access removed.", category: "Access Removal"},
      { date: "2025-03-28", event: "Offboarding Archived", actor: "James Park", description: "Account archived. Offboarding complete ahead of schedule.", category: "Completed"},
    ],
  },

  // ── 5. Greenfield Landscaping ─────────────────────────────────────────────
  {
    id: "ob-005",
    client: "Greenfield Landscaping",
    accountManager: "Maria Santos",
    offboardingOwner: "Maria Santos",
    cancellationDate: "2025-05-15",
    targetCompletionDate: "2025-06-15",
    actualCompletionDate: null,
    offboardingStatus: "Planning",
    finalBillingStatus: "Not Started",
    assetTransferStatus: "Not Started",
    accessRemovalStatus: "Active",
    completionPct: 10,
    mrr: 2600,
    arr: 31200,
    reason: "Budget",
    departmentsInvolved: ["Account Management", "SEO", "Content", "Billing"],
    services: ["SEO", "Content", "GBP"],
    checklist: [
      { id: "c-005-1", label: "Finalize Billing", status: "Not Started", owner: "Billing Team", dueDate: "2025-05-28"},
      { id: "c-005-2", label: "Export Reports", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-01"},
      { id: "c-005-3", label: "Deliver Final Reports", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-03"},
      { id: "c-005-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-05"},
      { id: "c-005-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-05"},
      { id: "c-005-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-05"},
      { id: "c-005-7", label: "Transfer Analytics Access", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-07"},
      { id: "c-005-8", label: "Transfer Ad Accounts", status: "Not Applicable", owner: "Paid Ads Team", dueDate: "2025-06-07"},
      { id: "c-005-9", label: "Transfer GBP Access", status: "Not Started", owner: "SEO Team", dueDate: "2025-06-09"},
      { id: "c-005-10", label: "Transfer CRM Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-10"},
      { id: "c-005-11", label: "Transfer Documentation", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-12"},
      { id: "c-005-12", label: "Remove Internal Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-13"},
      { id: "c-005-13", label: "Archive Records", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-15"},
    ],
    departmentTasks: [
      { id: "dt-005-1", department: "SEO", task: "Prepare keyword and ranking export", status: "Not Started", owner: "Megan Ross", dueDate: "2025-06-01"},
      { id: "dt-005-2", department: "Content", task: "Package all delivered content files", status: "Not Started", owner: "Content Team", dueDate: "2025-06-03"},
      { id: "dt-005-3", department: "Billing", task: "Calculate final balance and issue invoice", status: "Not Started", owner: "Billing Team", dueDate: "2025-05-28"},
    ],
    assetTransfers: [
      { id: "at-005-1", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Greenfield Landscaping", status: "Not Started", completedDate: null },
      { id: "at-005-2", assetType: "Content Archive", currentOwner: "RTM OS", recipient: "Greenfield Landscaping", status: "Not Started", completedDate: null },
      { id: "at-005-3", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Greenfield Landscaping", status: "Not Started", completedDate: null },
    ],
    accessRemovals: [
      { id: "ar-005-1", tool: "CRM", user: "Greenfield Landscaping — James Brennan", accessStatus: "Active", removedDate: null, owner: "IT Team"},
      { id: "ar-005-2", tool: "Internal Project Portal", user: "Greenfield Landscaping — James Brennan", accessStatus: "Active", removedDate: null, owner: "IT Team"},
    ],
    finalBilling: {
      outstandingBalance: 2600,
      credits: 0,
      refunds: 0,
      finalInvoiceAmount: 2600,
      finalInvoiceDate: null,
      collectionStatus: "Not Started",
      approvalStatus: "Pending Approval",
    },
    knowledgeArchive: {
      finalNotes: "Client pausing due to seasonal revenue decline. Expressed interest in returning in Q4.",
      lessonsLearned: "Seasonal service businesses need flexible pause options to avoid full cancellations.",
      clientHistory: "11 months. SEO, content, and GBP. Growth trajectory was positive before cancellation.",
      projectSummary: "Managed digital presence for a mid-size landscaping company. GBP impressions up 180% over engagement.",
      retentionAttempts: "AM offered a temporary service pause — client preferred to fully cancel.",
      reasonForDeparture: "Budget — seasonal revenue decline in Q2.",
    },
    aiSummary: {
      clientSummary: "Greenfield Landscaping is an 11-month client generating $2,600/mo. Offboarding is in early planning phase. Client showed strong growth metrics before departure.",
      reasonForCancellation: "Budget constraint due to seasonal revenue pattern. No service quality issues.",
      revenueImpact: "$2,600/mo MRR. $31,200 ARR at risk.",
      assetsTransferred: "None yet — offboarding in planning phase.",
      outstandingRisks: "No billing initiated. No transfers started. Timeline tight — 30 days to completion.",
      recommendedActions: [
        "Initiate billing process this week",
        "Schedule client kickoff call for asset transfer coordination",
        "Set up automated re-engagement outreach for Q3",
        "Evaluate whether a service pause option should be built into contracts",
      ],
    },
    activityTimeline: [
      { date: "2025-05-15", event: "Cancellation Approved", actor: "Director of AM", description: "Cancellation approved. Budget cited as primary reason.", category: "Cancellation Approved"},
      { date: "2025-05-16", event: "Offboarding Created", actor: "Maria Santos", description: "Offboarding project created. Planning phase initiated.", category: "Offboarding Created"},
    ],
  },

  // ── 6–20: Additional Records (condensed for brevity but fully typed) ───────

  {
    id: "ob-006",
    client: "Summit Medical Group",
    accountManager: "Tina Webb",
    offboardingOwner: "Tina Webb",
    cancellationDate: "2025-04-01",
    targetCompletionDate: "2025-04-30",
    actualCompletionDate: "2025-04-29",
    offboardingStatus: "Archived",
    finalBillingStatus: "Paid",
    assetTransferStatus: "Transferred",
    accessRemovalStatus: "Revoked",
    completionPct: 100,
    mrr: 5500,
    arr: 66000,
    reason: "Internal Staffing",
    departmentsInvolved: ["Account Management", "SEO", "Paid Advertising", "Billing", "Content"],
    services: ["SEO", "PPC", "Content", "Reporting"],
    checklist: [
      { id: "c-006-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-04-10"},
      { id: "c-006-2", label: "Export Reports", status: "Completed", owner: "Tina Webb", dueDate: "2025-04-12"},
      { id: "c-006-3", label: "Deliver Final Reports", status: "Completed", owner: "Tina Webb", dueDate: "2025-04-14"},
      { id: "c-006-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-04-15"},
      { id: "c-006-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-04-15"},
      { id: "c-006-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-04-15"},
      { id: "c-006-7", label: "Transfer Analytics Access", status: "Completed", owner: "Tina Webb", dueDate: "2025-04-18"},
      { id: "c-006-8", label: "Transfer Ad Accounts", status: "Completed", owner: "Paid Ads Team", dueDate: "2025-04-20"},
      { id: "c-006-9", label: "Transfer GBP Access", status: "Completed", owner: "SEO Team", dueDate: "2025-04-22"},
      { id: "c-006-10", label: "Transfer CRM Access", status: "Completed", owner: "IT Team", dueDate: "2025-04-23"},
      { id: "c-006-11", label: "Transfer Documentation", status: "Completed", owner: "Tina Webb", dueDate: "2025-04-25"},
      { id: "c-006-12", label: "Remove Internal Access", status: "Completed", owner: "IT Team", dueDate: "2025-04-27"},
      { id: "c-006-13", label: "Archive Records", status: "Completed", owner: "Tina Webb", dueDate: "2025-04-29"},
    ],
    departmentTasks: [
      { id: "dt-006-1", department: "Paid Advertising", task: "Transfer all ad accounts to client in-house team", status: "Completed", owner: "Jake Torres", dueDate: "2025-04-20"},
      { id: "dt-006-2", department: "SEO", task: "Compile full keyword strategy documentation", status: "Completed", owner: "Megan Ross", dueDate: "2025-04-18"},
      { id: "dt-006-3", department: "Content", task: "Transfer all brand guidelines and content templates", status: "Completed", owner: "Content Team", dueDate: "2025-04-22"},
      { id: "dt-006-4", department: "Billing", task: "Finalize contract closeout", status: "Completed", owner: "Billing Team", dueDate: "2025-04-10"},
    ],
    assetTransfers: [
      { id: "at-006-1", assetType: "Google Ads Account", currentOwner: "RTM OS", recipient: "Summit Medical IT", status: "Transferred", completedDate: "2025-04-20"},
      { id: "at-006-2", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Summit Medical IT", status: "Transferred", completedDate: "2025-04-18"},
      { id: "at-006-3", assetType: "Content Templates", currentOwner: "RTM OS", recipient: "Summit Medical Marketing", status: "Transferred", completedDate: "2025-04-22"},
      { id: "at-006-4", assetType: "SEO Strategy Docs", currentOwner: "RTM OS", recipient: "Summit Medical Marketing", status: "Transferred", completedDate: "2025-04-18"},
    ],
    accessRemovals: [
      { id: "ar-006-1", tool: "CRM", user: "Summit Medical", accessStatus: "Revoked", removedDate: "2025-04-27", owner: "IT Team"},
      { id: "ar-006-2", tool: "Analytics Platform", user: "Summit Medical", accessStatus: "Revoked", removedDate: "2025-04-27", owner: "IT Team"},
      { id: "ar-006-3", tool: "Internal Project Portal", user: "Summit Medical", accessStatus: "Revoked", removedDate: "2025-04-27", owner: "IT Team"},
    ],
    finalBilling: {
      outstandingBalance: 0, credits: 0, refunds: 0, finalInvoiceAmount: 5500, finalInvoiceDate: "2025-04-05", collectionStatus: "Collected", approvalStatus: "Approved",
    },
    knowledgeArchive: {
      finalNotes: "Client hired an in-house marketing director and is bringing all services in-house. Very positive departure.",
      lessonsLearned: "High-value clients building in-house teams is a normal lifecycle. Full documentation handoff is essential.",
      clientHistory: "3 years, 1 month. Full-service engagement. Consistently renewed. Excellent health score.",
      projectSummary: "Complete digital marketing management for a multi-location medical group.",
      retentionAttempts: "AM offered hybrid model — client committed to full in-house transition.",
      reasonForDeparture: "Internal Staffing — hired in-house marketing director.",
    },
    aiSummary: {
      clientSummary: "Summit Medical Group was a 3-year, high-value client at $5,500/mo. Departure was due to strategic in-house transition, not service issues. Offboarding was exemplary.",
      reasonForCancellation: "Internal staffing — client built an in-house marketing team. Clean departure.",
      revenueImpact: "$5,500/mo MRR lost. $66,000 ARR reduction. Highest-value offboarding this quarter.",
      assetsTransferred: "All assets fully transferred. Comprehensive documentation package delivered.",
      outstandingRisks: "None. Offboarding complete and archived.",
      recommendedActions: ["Add to alumni network for referrals", "Send quarterly check-in for potential agency partnership"],
    },
    activityTimeline: [
      { date: "2025-04-01", event: "Cancellation Approved", actor: "Director of AM", description: "In-house transition confirmed. Offboarding initiated.", category: "Cancellation Approved"},
      { date: "2025-04-02", event: "Offboarding Created", actor: "Tina Webb", description: "Comprehensive offboarding plan created for full-service client.", category: "Offboarding Created"},
      { date: "2025-04-10", event: "Final Invoice Processed", actor: "Billing Team", description: "Final invoice paid. Account financially closed.", category: "Final Billing"},
      { date: "2025-04-22", event: "Asset Transfer Completed", actor: "Multiple", description: "All ad accounts, analytics, and content assets fully transferred.", category: "Asset Transfer"},
      { date: "2025-04-27", event: "All Access Revoked", actor: "IT Team", description: "All internal system access removed.", category: "Access Removal"},
      { date: "2025-04-29", event: "Offboarding Archived", actor: "Tina Webb", description: "Account archived. Comprehensive offboarding completed.", category: "Completed"},
    ],
  },

  {
    id: "ob-007",
    client: "Titan Pest Control",
    accountManager: "James Park",
    offboardingOwner: "James Park",
    cancellationDate: "2025-05-20",
    targetCompletionDate: "2025-06-20",
    actualCompletionDate: null,
    offboardingStatus: "Initiated",
    finalBillingStatus: "Not Started",
    assetTransferStatus: "Not Started",
    accessRemovalStatus: "Active",
    completionPct: 5,
    mrr: 1500,
    arr: 18000,
    reason: "Service Quality",
    departmentsInvolved: ["Account Management", "SEO", "Billing"],
    services: ["SEO", "GBP"],
    checklist: [
      { id: "c-007-1", label: "Finalize Billing", status: "Not Started", owner: "Billing Team", dueDate: "2025-06-01"},
      { id: "c-007-2", label: "Export Reports", status: "Not Started", owner: "James Park", dueDate: "2025-06-05"},
      { id: "c-007-3", label: "Deliver Final Reports", status: "Not Started", owner: "James Park", dueDate: "2025-06-07"},
      { id: "c-007-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-08"},
      { id: "c-007-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-08"},
      { id: "c-007-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-08"},
      { id: "c-007-7", label: "Transfer Analytics Access", status: "Not Started", owner: "James Park", dueDate: "2025-06-10"},
      { id: "c-007-8", label: "Transfer Ad Accounts", status: "Not Applicable", owner: "Paid Ads Team", dueDate: "2025-06-10"},
      { id: "c-007-9", label: "Transfer GBP Access", status: "Not Started", owner: "SEO Team", dueDate: "2025-06-12"},
      { id: "c-007-10", label: "Transfer CRM Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-13"},
      { id: "c-007-11", label: "Transfer Documentation", status: "Not Started", owner: "James Park", dueDate: "2025-06-15"},
      { id: "c-007-12", label: "Remove Internal Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-18"},
      { id: "c-007-13", label: "Archive Records", status: "Not Started", owner: "James Park", dueDate: "2025-06-20"},
    ],
    departmentTasks: [
      { id: "dt-007-1", department: "SEO", task: "Export all ranking and audit reports", status: "Not Started", owner: "Megan Ross", dueDate: "2025-06-05"},
      { id: "dt-007-2", department: "Billing", task: "Issue final invoice", status: "Not Started", owner: "Billing Team", dueDate: "2025-06-01"},
    ],
    assetTransfers: [
      { id: "at-007-1", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Titan Pest Control", status: "Not Started", completedDate: null },
      { id: "at-007-2", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Titan Pest Control", status: "Not Started", completedDate: null },
    ],
    accessRemovals: [
      { id: "ar-007-1", tool: "CRM", user: "Titan Pest Control", accessStatus: "Active", removedDate: null, owner: "IT Team"},
      { id: "ar-007-2", tool: "Internal Project Portal", user: "Titan Pest Control", accessStatus: "Active", removedDate: null, owner: "IT Team"},
    ],
    finalBilling: {
      outstandingBalance: 1500, credits: 0, refunds: 0, finalInvoiceAmount: 1500, finalInvoiceDate: null, collectionStatus: "Not Started", approvalStatus: "Pending Approval",
    },
    knowledgeArchive: {
      finalNotes: "Client raised multiple service quality concerns over 6 months. GBP management was inconsistent.",
      lessonsLearned: "Need clearer quality benchmarks for GBP management. Client feedback loop was missing.",
      clientHistory: "8 months. SEO and GBP only. Health score declined steadily from month 4.",
      projectSummary: "Local SEO and GBP for single-location pest control company.",
      retentionAttempts: "AM offered service improvement plan. Client declined.",
      reasonForDeparture: "Service Quality — inconsistent GBP management and missed deliverables.",
    },
    aiSummary: {
      clientSummary: "Titan Pest Control was an 8-month client at $1,500/mo. Service quality concerns led to departure. Offboarding just initiated.",
      reasonForCancellation: "Service quality — inconsistent GBP management cited as primary driver.",
      revenueImpact: "$1,500/mo MRR lost. $18,000 ARR reduction.",
      assetsTransferred: "None yet. Offboarding initiated 2025-05-20.",
      outstandingRisks: "Service quality departure — potential for negative review. Handle professionally.",
      recommendedActions: [
        "Conduct internal service quality review for GBP processes",
        "Prioritize professional and prompt offboarding to prevent negative review",
        "Initiate billing within 5 days",
      ],
    },
    activityTimeline: [
      { date: "2025-05-20", event: "Cancellation Approved", actor: "Director of AM", description: "Service quality cancellation approved. Offboarding initiated.", category: "Cancellation Approved"},
      { date: "2025-05-21", event: "Offboarding Created", actor: "James Park", description: "Offboarding project created. Departments notified.", category: "Offboarding Created"},
    ],
  },

  {
    id: "ob-008",
    client: "Blueprint Architecture",
    accountManager: "Maria Santos",
    offboardingOwner: "Maria Santos",
    cancellationDate: "2025-02-01",
    targetCompletionDate: "2025-03-01",
    actualCompletionDate: "2025-02-27",
    offboardingStatus: "Archived",
    finalBillingStatus: "Paid",
    assetTransferStatus: "Transferred",
    accessRemovalStatus: "Revoked",
    completionPct: 100,
    mrr: 3800,
    arr: 45600,
    reason: "No Longer Needed",
    departmentsInvolved: ["Account Management", "Billing", "SEO", "Paid Advertising"],
    services: ["SEO", "Meta Ads", "Reporting"],
    checklist: [
      { id: "c-008-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-02-10"},
      { id: "c-008-2", label: "Export Reports", status: "Completed", owner: "Maria Santos", dueDate: "2025-02-12"},
      { id: "c-008-3", label: "Deliver Final Reports", status: "Completed", owner: "Maria Santos", dueDate: "2025-02-14"},
      { id: "c-008-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-02-15"},
      { id: "c-008-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-02-15"},
      { id: "c-008-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-02-15"},
      { id: "c-008-7", label: "Transfer Analytics Access", status: "Completed", owner: "Maria Santos", dueDate: "2025-02-18"},
      { id: "c-008-8", label: "Transfer Ad Accounts", status: "Completed", owner: "Paid Ads Team", dueDate: "2025-02-20"},
      { id: "c-008-9", label: "Transfer GBP Access", status: "Not Applicable", owner: "SEO Team", dueDate: "2025-02-20"},
      { id: "c-008-10", label: "Transfer CRM Access", status: "Completed", owner: "IT Team", dueDate: "2025-02-22"},
      { id: "c-008-11", label: "Transfer Documentation", status: "Completed", owner: "Maria Santos", dueDate: "2025-02-23"},
      { id: "c-008-12", label: "Remove Internal Access", status: "Completed", owner: "IT Team", dueDate: "2025-02-25"},
      { id: "c-008-13", label: "Archive Records", status: "Completed", owner: "Maria Santos", dueDate: "2025-02-27"},
    ],
    departmentTasks: [
      { id: "dt-008-1", department: "Paid Advertising", task: "Transfer Meta Ads account", status: "Completed", owner: "Jake Torres", dueDate: "2025-02-20"},
      { id: "dt-008-2", department: "SEO", task: "Export reporting data archive", status: "Completed", owner: "Megan Ross", dueDate: "2025-02-14"},
      { id: "dt-008-3", department: "Billing", task: "Close account", status: "Completed", owner: "Billing Team", dueDate: "2025-02-10"},
    ],
    assetTransfers: [
      { id: "at-008-1", assetType: "Meta Ads Account", currentOwner: "RTM OS", recipient: "Blueprint Architecture", status: "Transferred", completedDate: "2025-02-20"},
      { id: "at-008-2", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Blueprint Architecture", status: "Transferred", completedDate: "2025-02-18"},
    ],
    accessRemovals: [
      { id: "ar-008-1", tool: "CRM", user: "Blueprint Architecture", accessStatus: "Revoked", removedDate: "2025-02-25", owner: "IT Team"},
      { id: "ar-008-2", tool: "Internal Project Portal", user: "Blueprint Architecture", accessStatus: "Revoked", removedDate: "2025-02-25", owner: "IT Team"},
    ],
    finalBilling: {
      outstandingBalance: 0, credits: 0, refunds: 0, finalInvoiceAmount: 3800, finalInvoiceDate: "2025-02-05", collectionStatus: "Collected", approvalStatus: "Approved",
    },
    knowledgeArchive: {
      finalNotes: "Client's business matured and they no longer needed digital marketing support at this investment level.",
      lessonsLearned: "Mature businesses sometimes scale back marketing — offering a lower-tier maintenance package could have retained some revenue.",
      clientHistory: "2 years, 5 months. Full-service. Health was consistently good.",
      projectSummary: "SEO and Meta Ads for architectural firm. Strong brand presence achieved.",
      retentionAttempts: "AM offered a reduced scope package. Client declined.",
      reasonForDeparture: "No Longer Needed — business reached natural marketing saturation.",
    },
    aiSummary: {
      clientSummary: "Blueprint Architecture was a 2.4-year client at $3,800/mo. Clean departure — no performance issues. Offboarding completed 2 days ahead of schedule.",
      reasonForCancellation: "Client no longer needed active marketing investment at current scale.",
      revenueImpact: "$3,800/mo MRR lost. $45,600 ARR reduction.",
      assetsTransferred: "All assets transferred and archived.",
      outstandingRisks: "None.",
      recommendedActions: ["Archive with strong reference flag — potential referral source", "Add to re-engagement list for Q1 next year"],
    },
    activityTimeline: [
      { date: "2025-02-01", event: "Cancellation Approved", actor: "Director of AM", description: "Departure confirmed. No service issues.", category: "Cancellation Approved"},
      { date: "2025-02-02", event: "Offboarding Created", actor: "Maria Santos", description: "Offboarding project created.", category: "Offboarding Created"},
      { date: "2025-02-20", event: "Assets Transferred", actor: "Multiple", description: "Meta Ads and analytics access transferred.", category: "Asset Transfer"},
      { date: "2025-02-25", event: "All Access Revoked", actor: "IT Team", description: "All system access removed.", category: "Access Removal"},
      { date: "2025-02-27", event: "Offboarding Archived", actor: "Maria Santos", description: "Offboarding complete and archived.", category: "Completed"},
    ],
  },

  {
    id: "ob-009",
    client: "Ironwood Construction",
    accountManager: "Sarah Chen",
    offboardingOwner: "Sarah Chen",
    cancellationDate: "2025-05-05",
    targetCompletionDate: "2025-06-05",
    actualCompletionDate: null,
    offboardingStatus: "Final Billing",
    finalBillingStatus: "Invoice Sent",
    assetTransferStatus: "In Progress",
    accessRemovalStatus: "Pending Removal",
    completionPct: 65,
    mrr: 4200,
    arr: 50400,
    reason: "Communication",
    departmentsInvolved: ["Account Management", "SEO", "Paid Advertising", "Billing"],
    services: ["SEO", "Google Ads", "GBP"],
    checklist: [
      { id: "c-009-1", label: "Finalize Billing", status: "In Progress", owner: "Billing Team", dueDate: "2025-05-15"},
      { id: "c-009-2", label: "Export Reports", status: "Completed", owner: "Sarah Chen", dueDate: "2025-05-14"},
      { id: "c-009-3", label: "Deliver Final Reports", status: "Completed", owner: "Sarah Chen", dueDate: "2025-05-16"},
      { id: "c-009-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-18"},
      { id: "c-009-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-18"},
      { id: "c-009-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-18"},
      { id: "c-009-7", label: "Transfer Analytics Access", status: "In Progress", owner: "Sarah Chen", dueDate: "2025-05-22"},
      { id: "c-009-8", label: "Transfer Ad Accounts", status: "In Progress", owner: "Paid Ads Team", dueDate: "2025-05-24"},
      { id: "c-009-9", label: "Transfer GBP Access", status: "Completed", owner: "SEO Team", dueDate: "2025-05-20"},
      { id: "c-009-10", label: "Transfer CRM Access", status: "Not Started", owner: "IT Team", dueDate: "2025-05-28"},
      { id: "c-009-11", label: "Transfer Documentation", status: "Not Started", owner: "Sarah Chen", dueDate: "2025-05-30"},
      { id: "c-009-12", label: "Remove Internal Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-02"},
      { id: "c-009-13", label: "Archive Records", status: "Not Started", owner: "Sarah Chen", dueDate: "2025-06-05"},
    ],
    departmentTasks: [
      { id: "dt-009-1", department: "Paid Advertising", task: "Transfer Google Ads account", status: "In Progress", owner: "Jake Torres", dueDate: "2025-05-24"},
      { id: "dt-009-2", department: "SEO", task: "Transfer GBP and export rankings", status: "Completed", owner: "Megan Ross", dueDate: "2025-05-20"},
      { id: "dt-009-3", department: "Billing", task: "Send and collect final invoice", status: "In Progress", owner: "Billing Team", dueDate: "2025-05-15"},
    ],
    assetTransfers: [
      { id: "at-009-1", assetType: "Google Ads Account", currentOwner: "RTM OS", recipient: "Ironwood Construction", status: "In Progress", completedDate: null },
      { id: "at-009-2", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Ironwood Construction", status: "Transferred", completedDate: "2025-05-20"},
      { id: "at-009-3", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Ironwood Construction", status: "In Progress", completedDate: null },
    ],
    accessRemovals: [
      { id: "ar-009-1", tool: "CRM", user: "Ironwood Construction", accessStatus: "Active", removedDate: null, owner: "IT Team"},
      { id: "ar-009-2", tool: "Internal Project Portal", user: "Ironwood Construction", accessStatus: "Pending Removal", removedDate: null, owner: "IT Team"},
      { id: "ar-009-3", tool: "Ads Manager", user: "Ironwood Construction", accessStatus: "Active", removedDate: null, owner: "Paid Ads Team"},
    ],
    finalBilling: {
      outstandingBalance: 4200, credits: 0, refunds: 0, finalInvoiceAmount: 4200, finalInvoiceDate: "2025-05-12", collectionStatus: "Pending", approvalStatus: "Approved",
    },
    knowledgeArchive: {
      finalNotes: "Client experienced communication gaps — reporting calls were missed twice. Decision was made at owner level.",
      lessonsLearned: "Communication accountability must be tracked. Missed calls need immediate escalation.",
      clientHistory: "1 year, 7 months. SEO, Google Ads, GBP. Mixed health scores due to communication issues.",
      projectSummary: "Digital marketing for mid-size construction company. Ad results were strong despite communication challenges.",
      retentionAttempts: "AM escalated to Director. Client had already decided to leave.",
      reasonForDeparture: "Communication — AM responsiveness and reporting consistency cited.",
    },
    aiSummary: {
      clientSummary: "Ironwood Construction was a 19-month client at $4,200/mo. Departed due to communication breakdowns. Offboarding currently in final billing and asset transfer phases.",
      reasonForCancellation: "Communication failure — missed reporting calls and inconsistent AM response times.",
      revenueImpact: "$4,200/mo MRR lost. $50,400 ARR reduction.",
      assetsTransferred: "GBP transferred. Google Ads and analytics in progress.",
      outstandingRisks: "Final invoice outstanding. Google Ads transfer pending. Handle professionally to prevent review risk.",
      recommendedActions: [
        "Complete Google Ads transfer this week",
        "Collect final invoice — escalate if no response by due date",
        "Conduct internal communication process review",
        "Document as case study for AM accountability training",
      ],
    },
    activityTimeline: [
      { date: "2025-05-05", event: "Cancellation Approved", actor: "Director of AM", description: "Communication-related cancellation approved after failed escalation.", category: "Cancellation Approved"},
      { date: "2025-05-06", event: "Offboarding Created", actor: "Sarah Chen", description: "Offboarding project created.", category: "Offboarding Created"},
      { date: "2025-05-12", event: "Final Invoice Sent", actor: "Billing Team", description: "Final invoice for $4,200 sent.", category: "Final Billing"},
      { date: "2025-05-14", event: "Reports Exported", actor: "Sarah Chen", description: "All campaign history exported.", category: "Asset Transfer"},
      { date: "2025-05-20", event: "GBP Transferred", actor: "Megan Ross", description: "GBP admin access transferred to client.", category: "Asset Transfer"},
    ],
  },

  {
    id: "ob-010",
    client: "Meridian Law Group",
    accountManager: "Tina Webb",
    offboardingOwner: "Tina Webb",
    cancellationDate: "2025-01-15",
    targetCompletionDate: "2025-02-15",
    actualCompletionDate: "2025-02-12",
    offboardingStatus: "Archived",
    finalBillingStatus: "Paid",
    assetTransferStatus: "Transferred",
    accessRemovalStatus: "Revoked",
    completionPct: 100,
    mrr: 6200,
    arr: 74400,
    reason: "Competitor",
    departmentsInvolved: ["Account Management", "SEO", "Paid Advertising", "Content", "Billing"],
    services: ["SEO", "PPC", "Content", "Design", "Reporting"],
    checklist: [
      { id: "c-010-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-01-25"},
      { id: "c-010-2", label: "Export Reports", status: "Completed", owner: "Tina Webb", dueDate: "2025-01-27"},
      { id: "c-010-3", label: "Deliver Final Reports", status: "Completed", owner: "Tina Webb", dueDate: "2025-01-29"},
      { id: "c-010-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-01-30"},
      { id: "c-010-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-01-30"},
      { id: "c-010-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-01-30"},
      { id: "c-010-7", label: "Transfer Analytics Access", status: "Completed", owner: "Tina Webb", dueDate: "2025-02-01"},
      { id: "c-010-8", label: "Transfer Ad Accounts", status: "Completed", owner: "Paid Ads Team", dueDate: "2025-02-03"},
      { id: "c-010-9", label: "Transfer GBP Access", status: "Completed", owner: "SEO Team", dueDate: "2025-02-05"},
      { id: "c-010-10", label: "Transfer CRM Access", status: "Completed", owner: "IT Team", dueDate: "2025-02-06"},
      { id: "c-010-11", label: "Transfer Documentation", status: "Completed", owner: "Tina Webb", dueDate: "2025-02-08"},
      { id: "c-010-12", label: "Remove Internal Access", status: "Completed", owner: "IT Team", dueDate: "2025-02-10"},
      { id: "c-010-13", label: "Archive Records", status: "Completed", owner: "Tina Webb", dueDate: "2025-02-12"},
    ],
    departmentTasks: [
      { id: "dt-010-1", department: "All", task: "Full asset handoff to competitor agency", status: "Completed", owner: "Tina Webb", dueDate: "2025-02-08"},
      { id: "dt-010-2", department: "Billing", task: "Finalize contract closeout", status: "Completed", owner: "Billing Team", dueDate: "2025-01-25"},
    ],
    assetTransfers: [
      { id: "at-010-1", assetType: "Google Ads Account", currentOwner: "RTM OS", recipient: "Meridian Law Group", status: "Transferred", completedDate: "2025-02-03"},
      { id: "at-010-2", assetType: "Meta Ads Account", currentOwner: "RTM OS", recipient: "Meridian Law Group", status: "Transferred", completedDate: "2025-02-03"},
      { id: "at-010-3", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Meridian Law Group", status: "Transferred", completedDate: "2025-02-01"},
      { id: "at-010-4", assetType: "Content Archive", currentOwner: "RTM OS", recipient: "Meridian Law Group", status: "Transferred", completedDate: "2025-02-08"},
    ],
    accessRemovals: [
      { id: "ar-010-1", tool: "All Internal Tools", user: "Meridian Law Group", accessStatus: "Revoked", removedDate: "2025-02-10", owner: "IT Team"},
    ],
    finalBilling: {
      outstandingBalance: 0, credits: 0, refunds: 0, finalInvoiceAmount: 6200, finalInvoiceDate: "2025-01-20", collectionStatus: "Collected", approvalStatus: "Approved",
    },
    knowledgeArchive: {
      finalNotes: "High-value competitor poach. Competitor offered a significantly lower price with an in-house creative team advantage.",
      lessonsLearned: "Enterprise legal clients should have executive-level relationships maintained, not just AM level.",
      clientHistory: "4 years, 2 months. Full-service. Largest account lost this year.",
      projectSummary: "Complete digital marketing for multi-practice law firm. Strong ROI history.",
      retentionAttempts: "Director of AM and CEO personally called — client had signed with competitor.",
      reasonForDeparture: "Competitor — aggressive pricing and in-house creative services.",
    },
    aiSummary: {
      clientSummary: "Meridian Law Group was a 4-year, high-value client at $6,200/mo. Largest single offboarding this quarter. Offboarding completed cleanly ahead of schedule.",
      reasonForCancellation: "Competitor acquisition — client moved to a lower-cost provider with in-house creative capacity.",
      revenueImpact: "$6,200/mo MRR lost. $74,400 ARR reduction. Largest single revenue loss this quarter.",
      assetsTransferred: "Complete — all ad accounts, analytics, and content transferred.",
      outstandingRisks: "None. Fully closed and archived.",
      recommendedActions: ["Flag for 12-month re-engagement", "Analyze competitive pricing gap in full-service positioning", "Establish executive-level client relationships for all accounts over $5K MRR"],
    },
    activityTimeline: [
      { date: "2025-01-15", event: "Cancellation Approved", actor: "CEO + Director of AM", description: "Competitor acquisition confirmed. Executive-level retention attempt declined.", category: "Cancellation Approved"},
      { date: "2025-01-16", event: "Offboarding Created", actor: "Tina Webb", description: "Full-service offboarding plan created.", category: "Offboarding Created"},
      { date: "2025-02-03", event: "Ad Accounts Transferred", actor: "Paid Ads Team", description: "All Google and Meta ad accounts transferred.", category: "Asset Transfer"},
      { date: "2025-02-10", event: "All Access Revoked", actor: "IT Team", description: "All tool access removed.", category: "Access Removal"},
      { date: "2025-02-12", event: "Offboarding Archived", actor: "Tina Webb", description: "Account fully archived.", category: "Completed"},
    ],
  },

  // Remaining records 11-20 (condensed structure)
  {
    id: "ob-011", client: "Pacific Wellness Center", accountManager: "Maria Santos", offboardingOwner: "Maria Santos",
    cancellationDate: "2025-05-08", targetCompletionDate: "2025-06-08", actualCompletionDate: null,
    offboardingStatus: "Access Removal", finalBillingStatus: "Paid", assetTransferStatus: "Transferred", accessRemovalStatus: "Pending Removal",
    completionPct: 80, mrr: 2900, arr: 34800, reason: "Budget",
    departmentsInvolved: ["Account Management", "SEO", "Billing"],
    services: ["SEO", "GBP", "Content"],
    checklist: [
      { id: "c-011-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-05-15"},
      { id: "c-011-2", label: "Export Reports", status: "Completed", owner: "Maria Santos", dueDate: "2025-05-18"},
      { id: "c-011-3", label: "Deliver Final Reports", status: "Completed", owner: "Maria Santos", dueDate: "2025-05-20"},
      { id: "c-011-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-20"},
      { id: "c-011-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-20"},
      { id: "c-011-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-20"},
      { id: "c-011-7", label: "Transfer Analytics Access", status: "Completed", owner: "Maria Santos", dueDate: "2025-05-22"},
      { id: "c-011-8", label: "Transfer Ad Accounts", status: "Not Applicable", owner: "Paid Ads Team", dueDate: "2025-05-22"},
      { id: "c-011-9", label: "Transfer GBP Access", status: "Completed", owner: "SEO Team", dueDate: "2025-05-24"},
      { id: "c-011-10", label: "Transfer CRM Access", status: "Completed", owner: "IT Team", dueDate: "2025-05-25"},
      { id: "c-011-11", label: "Transfer Documentation", status: "Completed", owner: "Maria Santos", dueDate: "2025-05-27"},
      { id: "c-011-12", label: "Remove Internal Access", status: "In Progress", owner: "IT Team", dueDate: "2025-05-30"},
      { id: "c-011-13", label: "Archive Records", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-08"},
    ],
    departmentTasks: [
      { id: "dt-011-1", department: "SEO", task: "Transfer GBP and export all data", status: "Completed", owner: "Megan Ross", dueDate: "2025-05-24"},
      { id: "dt-011-2", department: "IT", task: "Complete access removal", status: "In Progress", owner: "IT Team", dueDate: "2025-05-30"},
    ],
    assetTransfers: [
      { id: "at-011-1", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Pacific Wellness Center", status: "Transferred", completedDate: "2025-05-24"},
      { id: "at-011-2", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Pacific Wellness Center", status: "Transferred", completedDate: "2025-05-22"},
    ],
    accessRemovals: [
      { id: "ar-011-1", tool: "CRM", user: "Pacific Wellness Center", accessStatus: "Pending Removal", removedDate: null, owner: "IT Team"},
      { id: "ar-011-2", tool: "Internal Project Portal", user: "Pacific Wellness Center", accessStatus: "Pending Removal", removedDate: null, owner: "IT Team"},
    ],
    finalBilling: { outstandingBalance: 0, credits: 0, refunds: 0, finalInvoiceAmount: 2900, finalInvoiceDate: "2025-05-12", collectionStatus: "Collected", approvalStatus: "Approved"},
    knowledgeArchive: { finalNotes: "Budget constraints due to facility expansion costs.", lessonsLearned: "Facility investment periods can create temporary budget gaps.", clientHistory: "1 year, 4 months. SEO, GBP, and content.", projectSummary: "Digital presence management for wellness center.", retentionAttempts: "Offered reduced scope — client preferred to pause entirely.", reasonForDeparture: "Budget — capital tied up in new facility construction."},
    aiSummary: { clientSummary: "Pacific Wellness Center — 16-month client. Budget-driven departure during facility expansion.", reasonForCancellation: "Budget — capital investment in new facility.", revenueImpact: "$2,900/mo MRR lost. $34,800 ARR.", assetsTransferred: "GBP and analytics transferred. Access removal in progress.", outstandingRisks: "Access removal pending. Archive pending completion.", recommendedActions: ["Complete access removal this week", "Archive record", "Re-engage when facility opens — strong winback candidate"] },
    activityTimeline: [
      { date: "2025-05-08", event: "Cancellation Approved", actor: "Director of AM", description: "Budget-driven cancellation approved.", category: "Cancellation Approved"},
      { date: "2025-05-09", event: "Offboarding Created", actor: "Maria Santos", description: "Offboarding project created.", category: "Offboarding Created"},
      { date: "2025-05-12", event: "Final Invoice Paid", actor: "Billing Team", description: "Final invoice collected.", category: "Final Billing"},
      { date: "2025-05-24", event: "Assets Transferred", actor: "Multiple", description: "GBP and analytics transferred.", category: "Asset Transfer"},
    ],
  },

  {
    id: "ob-012", client: "Redwood Dental Associates", accountManager: "Sarah Chen", offboardingOwner: "Sarah Chen",
    cancellationDate: "2025-03-20", targetCompletionDate: "2025-04-20", actualCompletionDate: "2025-04-18",
    offboardingStatus: "Archived", finalBillingStatus: "Paid", assetTransferStatus: "Transferred", accessRemovalStatus: "Revoked",
    completionPct: 100, mrr: 3100, arr: 37200, reason: "Performance",
    departmentsInvolved: ["Account Management", "SEO", "Billing"],
    services: ["SEO", "GBP", "Reporting"],
    checklist: [
      { id: "c-012-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-03-30"},
      { id: "c-012-2", label: "Export Reports", status: "Completed", owner: "Sarah Chen", dueDate: "2025-04-02"},
      { id: "c-012-3", label: "Deliver Final Reports", status: "Completed", owner: "Sarah Chen", dueDate: "2025-04-04"},
      { id: "c-012-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-04-05"},
      { id: "c-012-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-04-05"},
      { id: "c-012-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-04-05"},
      { id: "c-012-7", label: "Transfer Analytics Access", status: "Completed", owner: "Sarah Chen", dueDate: "2025-04-08"},
      { id: "c-012-8", label: "Transfer Ad Accounts", status: "Not Applicable", owner: "Paid Ads Team", dueDate: "2025-04-08"},
      { id: "c-012-9", label: "Transfer GBP Access", status: "Completed", owner: "SEO Team", dueDate: "2025-04-10"},
      { id: "c-012-10", label: "Transfer CRM Access", status: "Completed", owner: "IT Team", dueDate: "2025-04-12"},
      { id: "c-012-11", label: "Transfer Documentation", status: "Completed", owner: "Sarah Chen", dueDate: "2025-04-14"},
      { id: "c-012-12", label: "Remove Internal Access", status: "Completed", owner: "IT Team", dueDate: "2025-04-16"},
      { id: "c-012-13", label: "Archive Records", status: "Completed", owner: "Sarah Chen", dueDate: "2025-04-18"},
    ],
    departmentTasks: [{ id: "dt-012-1", department: "All", task: "Complete offboarding package", status: "Completed", owner: "Sarah Chen", dueDate: "2025-04-18"}],
    assetTransfers: [
      { id: "at-012-1", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Redwood Dental Associates", status: "Transferred", completedDate: "2025-04-10"},
      { id: "at-012-2", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Redwood Dental Associates", status: "Transferred", completedDate: "2025-04-08"},
    ],
    accessRemovals: [{ id: "ar-012-1", tool: "All Internal Tools", user: "Redwood Dental", accessStatus: "Revoked", removedDate: "2025-04-16", owner: "IT Team"}],
    finalBilling: { outstandingBalance: 0, credits: 0, refunds: 0, finalInvoiceAmount: 3100, finalInvoiceDate: "2025-03-25", collectionStatus: "Collected", approvalStatus: "Approved"},
    knowledgeArchive: { finalNotes: "SEO performance in competitive dental market fell short of client expectations.", lessonsLearned: "Need stronger expectation-setting for competitive local markets at proposal stage.", clientHistory: "2 years. SEO, GBP, reporting.", projectSummary: "Dental SEO for 3-location practice.", retentionAttempts: "Offered 6-month performance guarantee — declined.", reasonForDeparture: "Performance — SEO results below expectation in competitive market."},
    aiSummary: { clientSummary: "Redwood Dental Associates — 2-year client. Performance-driven departure. Clean offboarding.", reasonForCancellation: "Performance dissatisfaction.", revenueImpact: "$3,100/mo MRR. $37,200 ARR.", assetsTransferred: "All assets transferred.", outstandingRisks: "None.", recommendedActions: ["Archive as performance case study", "Improve competitive market expectation-setting in sales process"] },
    activityTimeline: [
      { date: "2025-03-20", event: "Cancellation Approved", actor: "Director of AM", description: "Performance-driven cancellation approved.", category: "Cancellation Approved"},
      { date: "2025-03-21", event: "Offboarding Created", actor: "Sarah Chen", description: "Offboarding initiated.", category: "Offboarding Created"},
      { date: "2025-04-10", event: "Assets Transferred", actor: "Multiple", description: "GBP and analytics transferred.", category: "Asset Transfer"},
      { date: "2025-04-18", event: "Offboarding Archived", actor: "Sarah Chen", description: "Account archived.", category: "Completed"},
    ],
  },

  {
    id: "ob-013", client: "Skyline Property Group", accountManager: "James Park", offboardingOwner: "James Park",
    cancellationDate: "2025-05-12", targetCompletionDate: "2025-06-12", actualCompletionDate: null,
    offboardingStatus: "Asset Transfer", finalBillingStatus: "Invoice Sent", assetTransferStatus: "In Progress", accessRemovalStatus: "Pending Removal",
    completionPct: 50, mrr: 4800, arr: 57600, reason: "Internal Staffing",
    departmentsInvolved: ["Account Management", "SEO", "Paid Advertising", "Billing", "Content"],
    services: ["SEO", "Google Ads", "Meta Ads", "Content"],
    checklist: [
      { id: "c-013-1", label: "Finalize Billing", status: "In Progress", owner: "Billing Team", dueDate: "2025-05-22"},
      { id: "c-013-2", label: "Export Reports", status: "Completed", owner: "James Park", dueDate: "2025-05-20"},
      { id: "c-013-3", label: "Deliver Final Reports", status: "Completed", owner: "James Park", dueDate: "2025-05-22"},
      { id: "c-013-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-24"},
      { id: "c-013-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-24"},
      { id: "c-013-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-24"},
      { id: "c-013-7", label: "Transfer Analytics Access", status: "In Progress", owner: "James Park", dueDate: "2025-05-26"},
      { id: "c-013-8", label: "Transfer Ad Accounts", status: "In Progress", owner: "Paid Ads Team", dueDate: "2025-05-28"},
      { id: "c-013-9", label: "Transfer GBP Access", status: "Not Started", owner: "SEO Team", dueDate: "2025-05-30"},
      { id: "c-013-10", label: "Transfer CRM Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-02"},
      { id: "c-013-11", label: "Transfer Documentation", status: "Not Started", owner: "James Park", dueDate: "2025-06-05"},
      { id: "c-013-12", label: "Remove Internal Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-10"},
      { id: "c-013-13", label: "Archive Records", status: "Not Started", owner: "James Park", dueDate: "2025-06-12"},
    ],
    departmentTasks: [
      { id: "dt-013-1", department: "Paid Advertising", task: "Transfer Google Ads and Meta Ads accounts", status: "In Progress", owner: "Jake Torres", dueDate: "2025-05-28"},
      { id: "dt-013-2", department: "Content", task: "Package and transfer content templates", status: "Completed", owner: "Content Team", dueDate: "2025-05-22"},
      { id: "dt-013-3", department: "Billing", task: "Send and collect final invoice", status: "In Progress", owner: "Billing Team", dueDate: "2025-05-22"},
    ],
    assetTransfers: [
      { id: "at-013-1", assetType: "Google Ads Account", currentOwner: "RTM OS", recipient: "Skyline Property IT", status: "In Progress", completedDate: null },
      { id: "at-013-2", assetType: "Meta Ads Account", currentOwner: "RTM OS", recipient: "Skyline Property IT", status: "In Progress", completedDate: null },
      { id: "at-013-3", assetType: "Content Templates", currentOwner: "RTM OS", recipient: "Skyline Property Marketing", status: "Transferred", completedDate: "2025-05-22"},
    ],
    accessRemovals: [
      { id: "ar-013-1", tool: "CRM", user: "Skyline Property Group", accessStatus: "Active", removedDate: null, owner: "IT Team"},
      { id: "ar-013-2", tool: "Ads Manager", user: "Skyline Property Group", accessStatus: "Active", removedDate: null, owner: "Paid Ads Team"},
    ],
    finalBilling: { outstandingBalance: 4800, credits: 0, refunds: 0, finalInvoiceAmount: 4800, finalInvoiceDate: "2025-05-20", collectionStatus: "Pending", approvalStatus: "Approved"},
    knowledgeArchive: { finalNotes: "Client hired in-house marketing team. Positive departure.", lessonsLearned: "In-house transitions require full documentation handoff.", clientHistory: "2 years, 3 months. Full-service.", projectSummary: "Digital marketing for property management group.", retentionAttempts: "Offered hybrid agency/in-house model — client declined.", reasonForDeparture: "Internal Staffing — hired in-house marketing team."},
    aiSummary: { clientSummary: "Skyline Property Group — 2.3-year client. In-house transition. Asset transfer in progress.", reasonForCancellation: "Internal staffing — in-house marketing hire.", revenueImpact: "$4,800/mo MRR. $57,600 ARR.", assetsTransferred: "Content templates transferred. Ad accounts in progress.", outstandingRisks: "Final invoice outstanding. Ad account transfers pending.", recommendedActions: ["Complete ad account transfers this week", "Collect final invoice", "Flag as alumni for referrals"] },
    activityTimeline: [
      { date: "2025-05-12", event: "Cancellation Approved", actor: "Director of AM", description: "In-house transition confirmed.", category: "Cancellation Approved"},
      { date: "2025-05-13", event: "Offboarding Created", actor: "James Park", description: "Offboarding project created.", category: "Offboarding Created"},
      { date: "2025-05-20", event: "Final Invoice Sent", actor: "Billing Team", description: "Final invoice sent.", category: "Final Billing"},
      { date: "2025-05-22", event: "Content Templates Delivered", actor: "Content Team", description: "Brand and content templates transferred.", category: "Asset Transfer"},
    ],
  },

  {
    id: "ob-014", client: "Coastal Veterinary Clinic", accountManager: "Tina Webb", offboardingOwner: "Tina Webb",
    cancellationDate: "2025-04-10", targetCompletionDate: "2025-05-10", actualCompletionDate: "2025-05-08",
    offboardingStatus: "Archived", finalBillingStatus: "Paid", assetTransferStatus: "Transferred", accessRemovalStatus: "Revoked",
    completionPct: 100, mrr: 1900, arr: 22800, reason: "Business Closure",
    departmentsInvolved: ["Account Management", "Billing", "SEO"],
    services: ["SEO", "GBP"],
    checklist: [
      { id: "c-014-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-04-20"},
      { id: "c-014-2", label: "Export Reports", status: "Completed", owner: "Tina Webb", dueDate: "2025-04-22"},
      { id: "c-014-3", label: "Deliver Final Reports", status: "Completed", owner: "Tina Webb", dueDate: "2025-04-24"},
      { id: "c-014-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-04-25"},
      { id: "c-014-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-04-25"},
      { id: "c-014-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-04-25"},
      { id: "c-014-7", label: "Transfer Analytics Access", status: "Completed", owner: "Tina Webb", dueDate: "2025-04-28"},
      { id: "c-014-8", label: "Transfer Ad Accounts", status: "Not Applicable", owner: "Paid Ads Team", dueDate: "2025-04-28"},
      { id: "c-014-9", label: "Transfer GBP Access", status: "Completed", owner: "SEO Team", dueDate: "2025-04-30"},
      { id: "c-014-10", label: "Transfer CRM Access", status: "Completed", owner: "IT Team", dueDate: "2025-05-01"},
      { id: "c-014-11", label: "Transfer Documentation", status: "Completed", owner: "Tina Webb", dueDate: "2025-05-03"},
      { id: "c-014-12", label: "Remove Internal Access", status: "Completed", owner: "IT Team", dueDate: "2025-05-05"},
      { id: "c-014-13", label: "Archive Records", status: "Completed", owner: "Tina Webb", dueDate: "2025-05-08"},
    ],
    departmentTasks: [{ id: "dt-014-1", department: "All", task: "Complete offboarding", status: "Completed", owner: "Tina Webb", dueDate: "2025-05-08"}],
    assetTransfers: [
      { id: "at-014-1", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Clinic Owner", status: "Transferred", completedDate: "2025-04-30"},
      { id: "at-014-2", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Clinic Owner", status: "Transferred", completedDate: "2025-04-28"},
    ],
    accessRemovals: [{ id: "ar-014-1", tool: "All Internal Tools", user: "Coastal Veterinary", accessStatus: "Revoked", removedDate: "2025-05-05", owner: "IT Team"}],
    finalBilling: { outstandingBalance: 0, credits: 0, refunds: 950, finalInvoiceAmount: 950, finalInvoiceDate: "2025-04-15", collectionStatus: "Collected", approvalStatus: "Approved", notes: "Prorated refund — business closure."},
    knowledgeArchive: { finalNotes: "Clinic closed permanently. Veterinarian relocated out of state.", lessonsLearned: "Business closure exits should always offer prorated refunds — builds goodwill.", clientHistory: "1 year. SEO and GBP for single-location vet clinic.", projectSummary: "Local SEO and GBP for veterinary practice.", retentionAttempts: "N/A — business closure.", reasonForDeparture: "Business Closure — clinic permanently closed."},
    aiSummary: { clientSummary: "Coastal Veterinary Clinic — 1-year client. Permanent closure. Clean offboarding with prorated refund.", reasonForCancellation: "Business closure.", revenueImpact: "$1,900/mo MRR. $22,800 ARR.", assetsTransferred: "All transferred.", outstandingRisks: "None.", recommendedActions: ["No action required — archive complete"] },
    activityTimeline: [
      { date: "2025-04-10", event: "Cancellation Approved", actor: "Director of AM", description: "Business closure confirmed. Prorated refund authorized.", category: "Cancellation Approved"},
      { date: "2025-04-11", event: "Offboarding Created", actor: "Tina Webb", description: "Expedited offboarding created.", category: "Offboarding Created"},
      { date: "2025-05-05", event: "All Access Revoked", actor: "IT Team", description: "All access removed.", category: "Access Removal"},
      { date: "2025-05-08", event: "Offboarding Archived", actor: "Tina Webb", description: "Account archived.", category: "Completed"},
    ],
  },

  {
    id: "ob-015", client: "NovaBuild Contractors", accountManager: "Maria Santos", offboardingOwner: "Maria Santos",
    cancellationDate: "2025-05-18", targetCompletionDate: "2025-06-18", actualCompletionDate: null,
    offboardingStatus: "In Progress", finalBillingStatus: "Invoice Pending", assetTransferStatus: "Not Started", accessRemovalStatus: "Active",
    completionPct: 20, mrr: 3300, arr: 39600, reason: "Budget",
    departmentsInvolved: ["Account Management", "SEO", "Paid Advertising", "Billing"],
    services: ["SEO", "Google Ads", "GBP"],
    checklist: [
      { id: "c-015-1", label: "Finalize Billing", status: "In Progress", owner: "Billing Team", dueDate: "2025-05-28"},
      { id: "c-015-2", label: "Export Reports", status: "Completed", owner: "Maria Santos", dueDate: "2025-05-25"},
      { id: "c-015-3", label: "Deliver Final Reports", status: "Not Started", owner: "Maria Santos", dueDate: "2025-05-28"},
      { id: "c-015-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-30"},
      { id: "c-015-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-30"},
      { id: "c-015-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-30"},
      { id: "c-015-7", label: "Transfer Analytics Access", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-02"},
      { id: "c-015-8", label: "Transfer Ad Accounts", status: "Not Started", owner: "Paid Ads Team", dueDate: "2025-06-05"},
      { id: "c-015-9", label: "Transfer GBP Access", status: "Not Started", owner: "SEO Team", dueDate: "2025-06-07"},
      { id: "c-015-10", label: "Transfer CRM Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-10"},
      { id: "c-015-11", label: "Transfer Documentation", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-12"},
      { id: "c-015-12", label: "Remove Internal Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-15"},
      { id: "c-015-13", label: "Archive Records", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-18"},
    ],
    departmentTasks: [
      { id: "dt-015-1", department: "Billing", task: "Issue final invoice", status: "In Progress", owner: "Billing Team", dueDate: "2025-05-28"},
      { id: "dt-015-2", department: "Paid Advertising", task: "Prepare ad account for transfer", status: "Not Started", owner: "Jake Torres", dueDate: "2025-06-05"},
    ],
    assetTransfers: [
      { id: "at-015-1", assetType: "Google Ads Account", currentOwner: "RTM OS", recipient: "NovaBuild Contractors", status: "Not Started", completedDate: null },
      { id: "at-015-2", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "NovaBuild Contractors", status: "Not Started", completedDate: null },
    ],
    accessRemovals: [
      { id: "ar-015-1", tool: "CRM", user: "NovaBuild Contractors", accessStatus: "Active", removedDate: null, owner: "IT Team"},
      { id: "ar-015-2", tool: "Ads Manager", user: "NovaBuild Contractors", accessStatus: "Active", removedDate: null, owner: "Paid Ads Team"},
    ],
    finalBilling: { outstandingBalance: 3300, credits: 0, refunds: 0, finalInvoiceAmount: 3300, finalInvoiceDate: null, collectionStatus: "Not Started", approvalStatus: "Pending Approval"},
    knowledgeArchive: { finalNotes: "Construction slowdown — project pipeline dried up.", lessonsLearned: "Construction clients are cyclical — service pause options needed.", clientHistory: "9 months. SEO, Google Ads, GBP.", projectSummary: "Digital marketing for regional contractor.", retentionAttempts: "Offered pause option — client preferred to cancel.", reasonForDeparture: "Budget — project pipeline slowdown."},
    aiSummary: { clientSummary: "NovaBuild Contractors — 9-month client. Budget-driven exit during construction slowdown.", reasonForCancellation: "Budget — revenue contraction in construction market.", revenueImpact: "$3,300/mo MRR. $39,600 ARR.", assetsTransferred: "None yet.", outstandingRisks: "Billing not initiated. No transfers started. Timeline pressure.", recommendedActions: ["Issue final invoice immediately", "Schedule asset transfer coordination call", "Re-engage when construction market recovers"] },
    activityTimeline: [
      { date: "2025-05-18", event: "Cancellation Approved", actor: "Director of AM", description: "Budget cancellation approved.", category: "Cancellation Approved"},
      { date: "2025-05-19", event: "Offboarding Created", actor: "Maria Santos", description: "Offboarding initiated.", category: "Offboarding Created"},
      { date: "2025-05-25", event: "Reports Exported", actor: "Maria Santos", description: "Campaign reports exported.", category: "Asset Transfer"},
    ],
  },

  {
    id: "ob-016", client: "Ember Fitness Studios", accountManager: "Sarah Chen", offboardingOwner: "Sarah Chen",
    cancellationDate: "2025-02-15", targetCompletionDate: "2025-03-15", actualCompletionDate: "2025-03-14",
    offboardingStatus: "Archived", finalBillingStatus: "Paid", assetTransferStatus: "Transferred", accessRemovalStatus: "Revoked",
    completionPct: 100, mrr: 2200, arr: 26400, reason: "No Longer Needed",
    departmentsInvolved: ["Account Management", "SEO", "Billing"],
    services: ["SEO", "Meta Ads"],
    checklist: [
      { id: "c-016-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-02-25"},
      { id: "c-016-2", label: "Export Reports", status: "Completed", owner: "Sarah Chen", dueDate: "2025-02-27"},
      { id: "c-016-3", label: "Deliver Final Reports", status: "Completed", owner: "Sarah Chen", dueDate: "2025-03-01"},
      { id: "c-016-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-03-02"},
      { id: "c-016-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-03-02"},
      { id: "c-016-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-03-02"},
      { id: "c-016-7", label: "Transfer Analytics Access", status: "Completed", owner: "Sarah Chen", dueDate: "2025-03-04"},
      { id: "c-016-8", label: "Transfer Ad Accounts", status: "Completed", owner: "Paid Ads Team", dueDate: "2025-03-06"},
      { id: "c-016-9", label: "Transfer GBP Access", status: "Not Applicable", owner: "SEO Team", dueDate: "2025-03-06"},
      { id: "c-016-10", label: "Transfer CRM Access", status: "Completed", owner: "IT Team", dueDate: "2025-03-08"},
      { id: "c-016-11", label: "Transfer Documentation", status: "Completed", owner: "Sarah Chen", dueDate: "2025-03-10"},
      { id: "c-016-12", label: "Remove Internal Access", status: "Completed", owner: "IT Team", dueDate: "2025-03-12"},
      { id: "c-016-13", label: "Archive Records", status: "Completed", owner: "Sarah Chen", dueDate: "2025-03-14"},
    ],
    departmentTasks: [{ id: "dt-016-1", department: "All", task: "Complete offboarding package", status: "Completed", owner: "Sarah Chen", dueDate: "2025-03-14"}],
    assetTransfers: [
      { id: "at-016-1", assetType: "Meta Ads Account", currentOwner: "RTM OS", recipient: "Ember Fitness Studios", status: "Transferred", completedDate: "2025-03-06"},
      { id: "at-016-2", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Ember Fitness Studios", status: "Transferred", completedDate: "2025-03-04"},
    ],
    accessRemovals: [{ id: "ar-016-1", tool: "All Internal Tools", user: "Ember Fitness Studios", accessStatus: "Revoked", removedDate: "2025-03-12", owner: "IT Team"}],
    finalBilling: { outstandingBalance: 0, credits: 0, refunds: 0, finalInvoiceAmount: 2200, finalInvoiceDate: "2025-02-20", collectionStatus: "Collected", approvalStatus: "Approved"},
    knowledgeArchive: { finalNotes: "Studio achieved organic word-of-mouth growth and no longer needed paid marketing.", lessonsLearned: "Success-driven exits are positive — maintain alumni relationships.", clientHistory: "1 year, 6 months. SEO and Meta Ads.", projectSummary: "Digital marketing for boutique fitness studio.", retentionAttempts: "Offered reduced package — client preferred clean exit.", reasonForDeparture: "No Longer Needed — achieved natural marketing saturation."},
    aiSummary: { clientSummary: "Ember Fitness Studios — 18-month client. Clean success-driven departure. Archive complete.", reasonForCancellation: "No longer needed — organic growth sufficient.", revenueImpact: "$2,200/mo MRR. $26,400 ARR.", assetsTransferred: "All assets transferred.", outstandingRisks: "None.", recommendedActions: ["Archive with strong alumni flag — good referral source"] },
    activityTimeline: [
      { date: "2025-02-15", event: "Cancellation Approved", actor: "Director of AM", description: "Success-driven exit confirmed.", category: "Cancellation Approved"as const },
      { date: "2025-02-16", event: "Offboarding Created", actor: "Sarah Chen", description: "Offboarding project created.", category: "Offboarding Created"as const },
      { date: "2025-03-06", event: "Assets Transferred", actor: "Multiple", description: "Meta Ads and analytics transferred.", category: "Asset Transfer"as const },
      { date: "2025-03-14", event: "Offboarding Archived", actor: "Sarah Chen", description: "Account archived.", category: "Completed"as const },
    ],
  },

  {
    id: "ob-017", client: "Harborside Chiropractic", accountManager: "James Park", offboardingOwner: "James Park",
    cancellationDate: "2025-05-22", targetCompletionDate: "2025-06-22", actualCompletionDate: null,
    offboardingStatus: "Initiated", finalBillingStatus: "Not Started", assetTransferStatus: "Not Started", accessRemovalStatus: "Active",
    completionPct: 5, mrr: 1700, arr: 20400, reason: "Competitor",
    departmentsInvolved: ["Account Management", "SEO", "Billing"],
    services: ["SEO", "GBP"],
    checklist: [
      { id: "c-017-1", label: "Finalize Billing", status: "Not Started", owner: "Billing Team", dueDate: "2025-06-01"},
      { id: "c-017-2", label: "Export Reports", status: "Not Started", owner: "James Park", dueDate: "2025-06-05"},
      { id: "c-017-3", label: "Deliver Final Reports", status: "Not Started", owner: "James Park", dueDate: "2025-06-07"},
      { id: "c-017-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-08"},
      { id: "c-017-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-08"},
      { id: "c-017-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-08"},
      { id: "c-017-7", label: "Transfer Analytics Access", status: "Not Started", owner: "James Park", dueDate: "2025-06-10"},
      { id: "c-017-8", label: "Transfer Ad Accounts", status: "Not Applicable", owner: "Paid Ads Team", dueDate: "2025-06-10"},
      { id: "c-017-9", label: "Transfer GBP Access", status: "Not Started", owner: "SEO Team", dueDate: "2025-06-12"},
      { id: "c-017-10", label: "Transfer CRM Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-14"},
      { id: "c-017-11", label: "Transfer Documentation", status: "Not Started", owner: "James Park", dueDate: "2025-06-16"},
      { id: "c-017-12", label: "Remove Internal Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-19"},
      { id: "c-017-13", label: "Archive Records", status: "Not Started", owner: "James Park", dueDate: "2025-06-22"},
    ],
    departmentTasks: [
      { id: "dt-017-1", department: "SEO", task: "Export rankings and GBP history", status: "Not Started", owner: "Megan Ross", dueDate: "2025-06-05"},
      { id: "dt-017-2", department: "Billing", task: "Issue final invoice", status: "Not Started", owner: "Billing Team", dueDate: "2025-06-01"},
    ],
    assetTransfers: [
      { id: "at-017-1", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Harborside Chiropractic", status: "Not Started", completedDate: null },
      { id: "at-017-2", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Harborside Chiropractic", status: "Not Started", completedDate: null },
    ],
    accessRemovals: [
      { id: "ar-017-1", tool: "CRM", user: "Harborside Chiropractic", accessStatus: "Active", removedDate: null, owner: "IT Team"},
      { id: "ar-017-2", tool: "Internal Project Portal", user: "Harborside Chiropractic", accessStatus: "Active", removedDate: null, owner: "IT Team"},
    ],
    finalBilling: { outstandingBalance: 1700, credits: 0, refunds: 0, finalInvoiceAmount: 1700, finalInvoiceDate: null, collectionStatus: "Not Started", approvalStatus: "Pending Approval"},
    knowledgeArchive: { finalNotes: "Client received a bundled website and marketing offer from a competitor.", lessonsLearned: "Bundled offerings are a competitive vulnerability — need to address in pricing strategy.", clientHistory: "10 months. SEO and GBP.", projectSummary: "Local SEO for chiropractic practice.", retentionAttempts: "Offered price match — client committed to competitor.", reasonForDeparture: "Competitor — bundled website and marketing package."},
    aiSummary: { clientSummary: "Harborside Chiropractic — 10-month client. Competitor-driven exit. Offboarding just initiated.", reasonForCancellation: "Competitor bundled offer.", revenueImpact: "$1,700/mo MRR. $20,400 ARR.", assetsTransferred: "None yet.", outstandingRisks: "No billing or transfers started.", recommendedActions: ["Initiate billing within 3 days", "Begin asset transfer coordination", "Document competitive pricing gap"] },
    activityTimeline: [
      { date: "2025-05-22", event: "Cancellation Approved", actor: "Director of AM", description: "Competitor departure confirmed.", category: "Cancellation Approved"as const },
      { date: "2025-05-23", event: "Offboarding Created", actor: "James Park", description: "Offboarding initiated.", category: "Offboarding Created"as const },
    ],
  },

  {
    id: "ob-018", client: "Vanguard Financial Advisors", accountManager: "Tina Webb", offboardingOwner: "Tina Webb",
    cancellationDate: "2025-03-05", targetCompletionDate: "2025-04-05", actualCompletionDate: "2025-04-03",
    offboardingStatus: "Archived", finalBillingStatus: "Paid", assetTransferStatus: "Transferred", accessRemovalStatus: "Revoked",
    completionPct: 100, mrr: 4500, arr: 54000, reason: "Internal Staffing",
    departmentsInvolved: ["Account Management", "SEO", "Paid Advertising", "Content", "Billing"],
    services: ["SEO", "PPC", "Content", "Reporting"],
    checklist: [
      { id: "c-018-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-03-15"},
      { id: "c-018-2", label: "Export Reports", status: "Completed", owner: "Tina Webb", dueDate: "2025-03-18"},
      { id: "c-018-3", label: "Deliver Final Reports", status: "Completed", owner: "Tina Webb", dueDate: "2025-03-20"},
      { id: "c-018-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-03-21"},
      { id: "c-018-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-03-21"},
      { id: "c-018-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-03-21"},
      { id: "c-018-7", label: "Transfer Analytics Access", status: "Completed", owner: "Tina Webb", dueDate: "2025-03-24"},
      { id: "c-018-8", label: "Transfer Ad Accounts", status: "Completed", owner: "Paid Ads Team", dueDate: "2025-03-26"},
      { id: "c-018-9", label: "Transfer GBP Access", status: "Not Applicable", owner: "SEO Team", dueDate: "2025-03-27"},
      { id: "c-018-10", label: "Transfer CRM Access", status: "Completed", owner: "IT Team", dueDate: "2025-03-28"},
      { id: "c-018-11", label: "Transfer Documentation", status: "Completed", owner: "Tina Webb", dueDate: "2025-03-30"},
      { id: "c-018-12", label: "Remove Internal Access", status: "Completed", owner: "IT Team", dueDate: "2025-04-01"},
      { id: "c-018-13", label: "Archive Records", status: "Completed", owner: "Tina Webb", dueDate: "2025-04-03"},
    ],
    departmentTasks: [{ id: "dt-018-1", department: "All", task: "Complete full offboarding package", status: "Completed", owner: "Tina Webb", dueDate: "2025-04-03"}],
    assetTransfers: [
      { id: "at-018-1", assetType: "Google Ads Account", currentOwner: "RTM OS", recipient: "Vanguard Financial IT", status: "Transferred", completedDate: "2025-03-26"},
      { id: "at-018-2", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Vanguard Financial IT", status: "Transferred", completedDate: "2025-03-24"},
      { id: "at-018-3", assetType: "Content Archive", currentOwner: "RTM OS", recipient: "Vanguard Financial Marketing", status: "Transferred", completedDate: "2025-03-20"},
    ],
    accessRemovals: [{ id: "ar-018-1", tool: "All Internal Tools", user: "Vanguard Financial Advisors", accessStatus: "Revoked", removedDate: "2025-04-01", owner: "IT Team"}],
    finalBilling: { outstandingBalance: 0, credits: 0, refunds: 0, finalInvoiceAmount: 4500, finalInvoiceDate: "2025-03-10", collectionStatus: "Collected", approvalStatus: "Approved"},
    knowledgeArchive: { finalNotes: "Hired an in-house content and digital marketing team after a successful 2-year engagement.", lessonsLearned: "High-value clients building in-house teams require proactive relationship management.", clientHistory: "2 years, 1 month. Full digital marketing engagement.", projectSummary: "Complete digital marketing for financial advisory firm.", retentionAttempts: "Offered supplemental services to complement in-house team — client declined.", reasonForDeparture: "Internal Staffing — built in-house marketing department."},
    aiSummary: { clientSummary: "Vanguard Financial Advisors — 2-year client. Clean in-house transition. Exemplary offboarding.", reasonForCancellation: "Internal staffing — hired in-house team.", revenueImpact: "$4,500/mo MRR. $54,000 ARR.", assetsTransferred: "All assets transferred — comprehensive handoff.", outstandingRisks: "None. Fully archived.", recommendedActions: ["Add to alumni network", "Establish executive check-in cadence for potential partnership"] },
    activityTimeline: [
      { date: "2025-03-05", event: "Cancellation Approved", actor: "Director of AM", description: "In-house transition confirmed.", category: "Cancellation Approved"as const },
      { date: "2025-03-06", event: "Offboarding Created", actor: "Tina Webb", description: "Full offboarding plan created.", category: "Offboarding Created"as const },
      { date: "2025-03-26", event: "Ad Accounts Transferred", actor: "Paid Ads Team", description: "Google Ads account transferred.", category: "Asset Transfer"as const },
      { date: "2025-04-01", event: "All Access Revoked", actor: "IT Team", description: "All access removed.", category: "Access Removal"as const },
      { date: "2025-04-03", event: "Offboarding Archived", actor: "Tina Webb", description: "Account archived.", category: "Completed"as const },
    ],
  },

  {
    id: "ob-019", client: "Prestige Auto Detailing", accountManager: "Maria Santos", offboardingOwner: "Maria Santos",
    cancellationDate: "2025-05-25", targetCompletionDate: "2025-06-25", actualCompletionDate: null,
    offboardingStatus: "Planning", finalBillingStatus: "Not Started", assetTransferStatus: "Not Started", accessRemovalStatus: "Active",
    completionPct: 8, mrr: 1200, arr: 14400, reason: "Budget",
    departmentsInvolved: ["Account Management", "SEO", "Billing"],
    services: ["SEO", "GBP"],
    checklist: [
      { id: "c-019-1", label: "Finalize Billing", status: "Not Started", owner: "Billing Team", dueDate: "2025-06-04"},
      { id: "c-019-2", label: "Export Reports", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-08"},
      { id: "c-019-3", label: "Deliver Final Reports", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-10"},
      { id: "c-019-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-10"},
      { id: "c-019-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-10"},
      { id: "c-019-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-06-10"},
      { id: "c-019-7", label: "Transfer Analytics Access", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-12"},
      { id: "c-019-8", label: "Transfer Ad Accounts", status: "Not Applicable", owner: "Paid Ads Team", dueDate: "2025-06-12"},
      { id: "c-019-9", label: "Transfer GBP Access", status: "Not Started", owner: "SEO Team", dueDate: "2025-06-14"},
      { id: "c-019-10", label: "Transfer CRM Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-16"},
      { id: "c-019-11", label: "Transfer Documentation", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-18"},
      { id: "c-019-12", label: "Remove Internal Access", status: "Not Started", owner: "IT Team", dueDate: "2025-06-22"},
      { id: "c-019-13", label: "Archive Records", status: "Not Started", owner: "Maria Santos", dueDate: "2025-06-25"},
    ],
    departmentTasks: [
      { id: "dt-019-1", department: "SEO", task: "Export GBP and ranking data", status: "Not Started", owner: "Megan Ross", dueDate: "2025-06-08"},
      { id: "dt-019-2", department: "Billing", task: "Issue final invoice", status: "Not Started", owner: "Billing Team", dueDate: "2025-06-04"},
    ],
    assetTransfers: [
      { id: "at-019-1", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Prestige Auto Detailing", status: "Not Started", completedDate: null },
      { id: "at-019-2", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Prestige Auto Detailing", status: "Not Started", completedDate: null },
    ],
    accessRemovals: [
      { id: "ar-019-1", tool: "CRM", user: "Prestige Auto Detailing", accessStatus: "Active", removedDate: null, owner: "IT Team"},
      { id: "ar-019-2", tool: "Internal Project Portal", user: "Prestige Auto Detailing", accessStatus: "Active", removedDate: null, owner: "IT Team"},
    ],
    finalBilling: { outstandingBalance: 1200, credits: 0, refunds: 0, finalInvoiceAmount: 1200, finalInvoiceDate: null, collectionStatus: "Not Started", approvalStatus: "Pending Approval"},
    knowledgeArchive: { finalNotes: "Small business impacted by economic pressure. Owner expressed intent to return.", lessonsLearned: "Small accounts need low-cost entry points to prevent budget exits.", clientHistory: "7 months. SEO and GBP.", projectSummary: "Local SEO for auto detailing shop.", retentionAttempts: "Offered minimum viable plan — client could not afford even reduced scope.", reasonForDeparture: "Budget — small business revenue pressure."},
    aiSummary: { clientSummary: "Prestige Auto Detailing — 7-month small business client. Budget exit. In planning phase.", reasonForCancellation: "Budget pressure.", revenueImpact: "$1,200/mo MRR. $14,400 ARR.", assetsTransferred: "None yet.", outstandingRisks: "No billing started. Planning phase only.", recommendedActions: ["Issue billing this week", "Begin planning coordination", "Add re-engagement flag for Q4"] },
    activityTimeline: [
      { date: "2025-05-25", event: "Cancellation Approved", actor: "Director of AM", description: "Budget cancellation approved.", category: "Cancellation Approved"as const },
      { date: "2025-05-26", event: "Offboarding Created", actor: "Maria Santos", description: "Offboarding planning initiated.", category: "Offboarding Created"as const },
    ],
  },

  {
    id: "ob-020", client: "Crestwood Home Services", accountManager: "James Park", offboardingOwner: "James Park",
    cancellationDate: "2025-04-20", targetCompletionDate: "2025-05-20", actualCompletionDate: "2025-05-19",
    offboardingStatus: "Archived", finalBillingStatus: "Paid", assetTransferStatus: "Transferred", accessRemovalStatus: "Revoked",
    completionPct: 100, mrr: 2700, arr: 32400, reason: "Other",
    departmentsInvolved: ["Account Management", "SEO", "Paid Advertising", "Billing"],
    services: ["SEO", "GBP", "PPC"],
    checklist: [
      { id: "c-020-1", label: "Finalize Billing", status: "Completed", owner: "Billing Team", dueDate: "2025-04-30"},
      { id: "c-020-2", label: "Export Reports", status: "Completed", owner: "James Park", dueDate: "2025-05-02"},
      { id: "c-020-3", label: "Deliver Final Reports", status: "Completed", owner: "James Park", dueDate: "2025-05-04"},
      { id: "c-020-4", label: "Transfer Website Files", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-05"},
      { id: "c-020-5", label: "Transfer Hosting Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-05"},
      { id: "c-020-6", label: "Transfer Domain Access", status: "Not Applicable", owner: "Web Team", dueDate: "2025-05-05"},
      { id: "c-020-7", label: "Transfer Analytics Access", status: "Completed", owner: "James Park", dueDate: "2025-05-07"},
      { id: "c-020-8", label: "Transfer Ad Accounts", status: "Completed", owner: "Paid Ads Team", dueDate: "2025-05-09"},
      { id: "c-020-9", label: "Transfer GBP Access", status: "Completed", owner: "SEO Team", dueDate: "2025-05-10"},
      { id: "c-020-10", label: "Transfer CRM Access", status: "Completed", owner: "IT Team", dueDate: "2025-05-12"},
      { id: "c-020-11", label: "Transfer Documentation", status: "Completed", owner: "James Park", dueDate: "2025-05-14"},
      { id: "c-020-12", label: "Remove Internal Access", status: "Completed", owner: "IT Team", dueDate: "2025-05-17"},
      { id: "c-020-13", label: "Archive Records", status: "Completed", owner: "James Park", dueDate: "2025-05-19"},
    ],
    departmentTasks: [
      { id: "dt-020-1", department: "Paid Advertising", task: "Transfer PPC campaigns to client", status: "Completed", owner: "Jake Torres", dueDate: "2025-05-09"},
      { id: "dt-020-2", department: "SEO", task: "Transfer GBP and export rankings", status: "Completed", owner: "Megan Ross", dueDate: "2025-05-10"},
      { id: "dt-020-3", department: "Billing", task: "Close account and collect payment", status: "Completed", owner: "Billing Team", dueDate: "2025-04-30"},
    ],
    assetTransfers: [
      { id: "at-020-1", assetType: "Google Ads Account", currentOwner: "RTM OS", recipient: "Crestwood Home Services", status: "Transferred", completedDate: "2025-05-09"},
      { id: "at-020-2", assetType: "GBP Admin Access", currentOwner: "RTM OS", recipient: "Crestwood Home Services", status: "Transferred", completedDate: "2025-05-10"},
      { id: "at-020-3", assetType: "Analytics Access", currentOwner: "RTM OS", recipient: "Crestwood Home Services", status: "Transferred", completedDate: "2025-05-07"},
    ],
    accessRemovals: [{ id: "ar-020-1", tool: "All Internal Tools", user: "Crestwood Home Services", accessStatus: "Revoked", removedDate: "2025-05-17", owner: "IT Team"}],
    finalBilling: { outstandingBalance: 0, credits: 0, refunds: 0, finalInvoiceAmount: 2700, finalInvoiceDate: "2025-04-25", collectionStatus: "Collected", approvalStatus: "Approved"},
    knowledgeArchive: { finalNotes: "Owner's personal circumstances required stepping back from marketing investment. Highly amicable exit.", lessonsLearned: "Personal circumstances are unpredictable — always maintain positive relationships.", clientHistory: "1 year, 3 months. SEO, GBP, PPC.", projectSummary: "Multi-channel marketing for home services company.", retentionAttempts: "AM offered extended pause — client needed full exit.", reasonForDeparture: "Other — personal circumstances affecting business operations."},
    aiSummary: { clientSummary: "Crestwood Home Services — 15-month client. Personal circumstance exit. Clean, complete offboarding.", reasonForCancellation: "Personal/other — owner stepping back from business.", revenueImpact: "$2,700/mo MRR. $32,400 ARR.", assetsTransferred: "All assets transferred and archived.", outstandingRisks: "None.", recommendedActions: ["Send personalized follow-up — express support", "Flag for re-engagement when client is ready to return"] },
    activityTimeline: [
      { date: "2025-04-20", event: "Cancellation Approved", actor: "Director of AM", description: "Personal circumstances exit approved.", category: "Cancellation Approved"as const },
      { date: "2025-04-21", event: "Offboarding Created", actor: "James Park", description: "Offboarding project created.", category: "Offboarding Created"as const },
      { date: "2025-05-09", event: "Ad Accounts Transferred", actor: "Paid Ads Team", description: "Google Ads account transferred.", category: "Asset Transfer"as const },
      { date: "2025-05-17", event: "All Access Revoked", actor: "IT Team", description: "All access removed.", category: "Access Removal"as const },
      { date: "2025-05-19", event: "Offboarding Archived", actor: "James Park", description: "Account archived.", category: "Completed"as const },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// CROSS-WORKSPACE SIGNAL: Billing → AM Offboarding
//
// Pattern mirrors pendingSalesTasks / addPendingSalesTask in workspace-tasks.ts.
// When Billing fires "Notify AM — Billing Complete", it calls
// addPendingOffboardingRecord(). AM's Offboarding page drains this queue on
// mount so new records become visible immediately.
// TODO: replace with real database persistence when backend is wired.
//
// OWNERSHIP
//   Writer : Billing Cancellations page  (addPendingOffboardingRecord)
//   Reader : AM Offboarding page  (pendingOffboardingRecords)
// ══════════════════════════════════════════════════════════════════════════════

export const pendingOffboardingRecords: OffboardingRecord[] = [];

let _nextOffboardingId = 1;

export function addPendingOffboardingRecord(
  partial: Pick<OffboardingRecord, "client" | "accountManager" | "reason"> &
    Partial<Pick<OffboardingRecord, "mrr" | "arr" | "offboardingOwner">> & {
      billingHandoffNotes?: string;
      billingOwner?: string;
    }
): OffboardingRecord {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const targetDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const record: OffboardingRecord = {
    id: `ob-billing-${_nextOffboardingId++}`,
    client: partial.client,
    accountManager: partial.accountManager,
    offboardingOwner: partial.offboardingOwner ?? partial.accountManager,
    cancellationDate: dateStr,
    targetCompletionDate: targetDate,
    actualCompletionDate: null,
    offboardingStatus: "Initiated",
    finalBillingStatus: "Not Started",
    assetTransferStatus: "Not Started",
    accessRemovalStatus: "Active",
    completionPct: 0,
    mrr: partial.mrr ?? 0,
    arr: partial.arr ?? (partial.mrr ? partial.mrr * 12 : 0),
    reason: partial.reason,
    departmentsInvolved: ["Account Management", "Billing"],
    services: [],
    checklist: [
      { id: `c-new-1`, label: "Confirm Billing Clearance", status: "Completed", owner: partial.billingOwner ?? "Billing Team", dueDate: dateStr, notes: partial.billingHandoffNotes },
      { id: `c-new-2`, label: "AM Initial Review", status: "Not Started", owner: partial.accountManager, dueDate: targetDate },
      { id: `c-new-3`, label: "Export Reports", status: "Not Started", owner: partial.accountManager, dueDate: targetDate },
      { id: `c-new-4`, label: "Transfer Assets", status: "Not Started", owner: "Operations", dueDate: targetDate },
      { id: `c-new-5`, label: "Remove Internal Access", status: "Not Started", owner: "IT Team", dueDate: targetDate },
      { id: `c-new-6`, label: "Archive Records", status: "Not Started", owner: partial.accountManager, dueDate: targetDate },
    ],
    departmentTasks: [
      { id: `dt-new-1`, department: "Account Management", task: "Complete AM offboarding review", status: "Not Started", owner: partial.accountManager, dueDate: targetDate },
      { id: `dt-new-2`, department: "Billing", task: "Billing closed — no further action required", status: "Completed", owner: partial.billingOwner ?? "Billing Team", dueDate: dateStr },
    ],
    assetTransfers: [],
    accessRemovals: [],
    finalBilling: {
      outstandingBalance: 0,
      credits: 0,
      refunds: 0,
      finalInvoiceAmount: 0,
      finalInvoiceDate: dateStr,
      collectionStatus: "Collected",
      approvalStatus: "Approved",
      notes: partial.billingHandoffNotes ?? "Billing cleared by Billing team.",
    },
    knowledgeArchive: {
      finalNotes: "",
      lessonsLearned: "",
      clientHistory: "",
      projectSummary: "",
      retentionAttempts: "",
      reasonForDeparture: partial.reason,
    },
    aiSummary: {
      clientSummary: `${partial.client} — offboarding initiated by Billing clearance.`,
      reasonForCancellation: partial.reason,
      revenueImpact: partial.mrr ? `$${partial.mrr.toLocaleString()}/mo MRR.` : "MRR unknown.",
      assetsTransferred: "Pending.",
      outstandingRisks: "None at this time.",
      recommendedActions: ["Complete AM review", "Schedule asset transfer", "Remove internal access"],
    },
    activityTimeline: [
      {
        date: dateStr,
        event: "Offboarding Created — Billing Clearance",
        actor: partial.billingOwner ?? "Billing Team",
        description: `Billing cleared the cancellation for ${partial.client} and notified AM. Offboarding case created automatically.${
          partial.billingHandoffNotes ? ` Notes: ${partial.billingHandoffNotes}` : ""
        }`,
        category: "Offboarding Created" as const,
      },
    ],
  };

  pendingOffboardingRecords.push(record);
  return record;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPUTED HELPERS
// ══════════════════════════════════════════════════════════════════════════════

export function getActiveOffboardings(): OffboardingRecord[] {
  return [...OFFBOARDING_RECORDS, ...pendingOffboardingRecords].filter(
    (r) => r.offboardingStatus !== "Completed"&& r.offboardingStatus !== "Archived");
}

export function getCompletedOffboardings(): OffboardingRecord[] {
  return [...OFFBOARDING_RECORDS, ...pendingOffboardingRecords].filter(
    (r) => r.offboardingStatus === "Completed"|| r.offboardingStatus === "Archived");
}

export function getPendingAssetTransfers(): OffboardingRecord[] {
  return [...OFFBOARDING_RECORDS, ...pendingOffboardingRecords].filter(
    (r) => r.assetTransferStatus === "In Progress"|| r.assetTransferStatus === "Waiting On Client"|| r.assetTransferStatus === "Not Started");
}

export function getPendingAccessRemovals(): OffboardingRecord[] {
  return [...OFFBOARDING_RECORDS, ...pendingOffboardingRecords].filter(
    (r) => r.accessRemovalStatus === "Active"|| r.accessRemovalStatus === "Pending Removal");
}

export function getPendingFinalBilling(): OffboardingRecord[] {
  return [...OFFBOARDING_RECORDS, ...pendingOffboardingRecords].filter(
    (r) => r.finalBillingStatus !== "Paid"&& r.finalBillingStatus !== "Waived"&& r.finalBillingStatus !== "Write Off");
}

export function getTotalRevenueLost(): number {
  return [...OFFBOARDING_RECORDS, ...pendingOffboardingRecords].reduce((sum, r) => sum + r.mrr, 0);
}

export function getAnnualRevenueLost(): number {
  return [...OFFBOARDING_RECORDS, ...pendingOffboardingRecords].reduce((sum, r) => sum + r.arr, 0);
}

export function getReasonBreakdown(): Record<CancellationReason, number> {
  const result = {} as Record<CancellationReason, number>;
  for (const r of [...OFFBOARDING_RECORDS, ...pendingOffboardingRecords]) {
    result[r.reason] = (result[r.reason] || 0) + 1;
  }
  return result;
}

export function getStatusBreakdown(): Record<OffboardingStatus, number> {
  const result = {} as Record<OffboardingStatus, number>;
  for (const r of [...OFFBOARDING_RECORDS, ...pendingOffboardingRecords]) {
    result[r.offboardingStatus] = (result[r.offboardingStatus] || 0) + 1;
  }
  return result;
}
