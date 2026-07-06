// ─────────────────────────────────────────────────────────────────────────────
// lib/mock/master-clients.ts
//
// SINGLE SOURCE OF TRUTH for all client records across every department.
//
// FIELD OWNERSHIP TABLE
// ─────────────────────────────────────────────────────────────────────────────
// Field                         Owned / updated by
// clientName                    Admin (immutable after creation)
// billingStatus                 Billing
// invoiceStatus                 Billing
// paymentStatus                 Billing
// cancellationStatus            Billing
// upgradeDowngradeStatus        Billing
// cleared                        Billing writes → AM reads to trigger workflow (formerly greenlightedForAM)
// activeServices                Billing (source of truth — subscriptions)
// billingOwner                  Billing
// currentStatus (overall)       Computed / multi-dept read-only
// assignedAM, amStatus          Account Management (future)
// activationStatus              Account Management (future)
// onboardingStatus              Account Management (future)
// renewalDate, renewalStatus    Account Management / Renewals (future)
// clientHealth                  COMPUTED from status fields (never manually set)
// priority                      COMPUTED from health + overdue signals (never manually set)
// salesStatus, salesOwner       Sales
// ─────────────────────────────────────────────────────────────────────────────

export type ClientStatus =
  | "Lead"
  | "Proposal Sent"
  | "Invoice Sent"
  | "Invoice Paid"
  | "Ready for Onboarding"
  | "AM Assignment Needed"
  | "Onboarding Pending"
  | "Department Activation Pending"
  | "Active"
  | "Renewal Due"
  | "Cancellation Requested"
  | "Offboarding";

export type WorkflowStatus =
  | "Not Started"
  | "Pending Review"
  | "In Progress"
  | "Awaiting Client"
  | "Escalated"
  | "Complete";

// Billing-owned billing status
export type BillingStatus = "Pending" | "Paid" | "Overdue" | "Cleared" | "Closed";

// Billing-owned invoice status
export type InvoiceStatus =
  | "Not Issued"
  | "Draft"
  | "Sent — Awaiting Payment"
  | "Overdue 15d"
  | "Overdue 30d"
  | "Final invoice issued"
  | "Paid";

// Billing-owned payment status
export type PaymentStatus =
  | "Unpaid"
  | "Partial"
  | "Paid"
  | "Overdue"
  | "Confirmed"
  | "N/A";

// Billing-owned cancellation status
export type CancellationStatus =
  | "None"
  | "Requested"
  | "In Review"
  | "Approved"
  | "Cancelled";

// Billing-owned upgrade/downgrade status
export type UpgradeDowngradeStatus =
  | "None"
  | "Upgrade Requested"
  | "Downgrade Requested"
  | "Approved"
  | "Completed";

// AM-owned (future module — Billing must NOT write these)
export type ActivationStatus =
  | "Not Started"
  | "Ready for Onboarding"
  | "AM Assignment Needed"
  | "Onboarding Pending"
  | "Department Activation Pending"
  | "Active";

// Computed — never manually set by any department
export type HealthStatus = "Excellent" | "Good" | "At Risk" | "Critical";
export type Priority = "High" | "Medium" | "Low";

export interface ActivationChecklist {
  invoicePaid: boolean;
  billingCleared: boolean;
  contractConfirmed: boolean;
  servicesConfirmed: boolean;
  clientContactVerified: boolean;
  amAssigned: boolean;
  onboardingRecordCreated: boolean;
  activationTasksCreated: boolean;
  kickoffNeeded: boolean;
}

export interface RecentEvent {
  date: string;
  actor: string;
  action: string;
}

export interface MasterClient {
  id: string;
  slug: string;
  clientName: string;
  industry: string;
  email: string;
  avatarColor: string;

  // ── Sales-owned fields ───────────────────────────────────────────────────
  salesStatus: string;     // owned by Sales
  salesOwner: string;      // owned by Sales

  // ── Billing-owned fields ─────────────────────────────────────────────────
  billingStatus: BillingStatus;
  invoiceStatus: InvoiceStatus;
  paymentStatus: PaymentStatus;
  cancellationStatus: CancellationStatus;
  upgradeDowngradeStatus: UpgradeDowngradeStatus;
  /** Billing writes this flag to signal "ready for AM handoff" (Clearance).
   *  Once true, AM picks it up and the client leaves Billing's activation view.
   *  Formerly named greenlightedForAM. */
  cleared: boolean;
  activeServices: string[];   // subscriptions = billing records
  monthlyValue: number;       // source of truth for MRR
  billingOwner: string;

  // ── AM-owned fields (future module — Billing must never write these) ──────
  assignedAM: string;
  activationStatus: ActivationStatus;
  onboardingStatus: string;
  renewalDate: string;
  renewalStatus: string;

  // ── Computed fields (never manually set by any department) ───────────────
  /**
   * Health computation rules (keep simple):
   *   Critical  → billingStatus=Overdue AND paymentStatus=Overdue, or cancellationStatus=Requested+Escalated
   *   At Risk   → billingStatus=Overdue, or activeServices includes an "At Risk" service, or overdue invoice
   *   Excellent → billingStatus=Paid AND activationStatus=Active AND renewalDate >90 days out
   *   Good      → everything else
   */
  clientHealth: HealthStatus;
  /**
   * Priority computation rules:
   *   High   → clientHealth Critical or At Risk, or Renewal Due within 30 days
   *   Medium → clientHealth Good with pending action
   *   Low    → clientHealth Excellent, no pending billing action
   */
  priority: Priority;

  // ── Cross-dept read-only display ─────────────────────────────────────────
  currentStatus: ClientStatus;
  workflowStatus: WorkflowStatus;
  lastActivity: string;
  nextRequiredAction: string;
  notes: string;
  activationChecklist: ActivationChecklist;
  recentEvents: RecentEvent[];

  // ── Affiliate (Sales-managed) ─────────────────────────────────────────────
  referralSource?: string;
  affiliateName?: string;
  referralRevenue?: string;
  commissionStatus?: "Paid" | "Pending" | "Processing" | "Not Applicable";
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER CLIENT RECORDS — 20 clients
// All departments read from this list. Billing writes only billing-owned fields.
// ─────────────────────────────────────────────────────────────────────────────

export const MASTER_CLIENTS: MasterClient[] = [
  {
    id: "mc001",
    slug: "apex-roofing",
    clientName: "Apex Roofing Solutions",
    industry: "Home Services – Roofing",
    assignedAM: "Jordan M.",
    email: "david@apexroofing.com",
    currentStatus: "Active",
    workflowStatus: "In Progress",
    salesStatus: "Closed Won",
    salesOwner: "Mike T.",
    billingStatus: "Paid",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Meta Ads", "Content Writing", "Monthly Reporting"],
    monthlyValue: 5350,
    renewalDate: "2026-03-01",
    renewalStatus: "Active",
    clientHealth: "Excellent",
    priority: "High",
    billingOwner: "Lisa P.",
    lastActivity: "2025-05-28",
    nextRequiredAction: "Send June performance report",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-28", actor: "Jordan M.", action: "Sent May performance report" },
      { date: "2025-05-22", actor: "System", action: "Invoice #1042 processed – $5,350" },
    ],
    notes: "High-value client. Storm season drives spike in leads.",
    avatarColor: "#6366f1",
    referralSource: "Direct",
    commissionStatus: "Not Applicable",
  },
  {
    id: "mc002",
    slug: "sunbelt-hvac",
    clientName: "Sunbelt HVAC & Air",
    industry: "Home Services – HVAC",
    assignedAM: "Sarah K.",
    email: "linda@sunbelthvac.com",
    currentStatus: "Active",
    workflowStatus: "Escalated",
    salesStatus: "Closed Won",
    salesOwner: "Marco T.",
    billingStatus: "Overdue",
    invoiceStatus: "Overdue 30d",
    paymentStatus: "Overdue",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Review Management"],
    monthlyValue: 2000,
    renewalDate: "2025-08-01",
    renewalStatus: "At Risk",
    clientHealth: "At Risk",
    priority: "High",
    billingOwner: "Lisa P.",
    lastActivity: "2025-05-27",
    nextRequiredAction: "Escalate billing — personal outreach required",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-27", actor: "Sarah K.", action: "Flagged as at-risk — invoice 30+ days overdue" },
      { date: "2025-05-10", actor: "Sarah K.", action: "Called Linda — no answer. Left voicemail." },
    ],
    notes: "At-risk. Invoice overdue 30 days. Campaigns paused.",
    avatarColor: "#f59e0b",
    referralSource: "Affiliate",
    affiliateName: "Brandon Ellis",
    referralRevenue: "$2,000/mo",
    commissionStatus: "Paid",
  },
  {
    id: "mc003",
    slug: "pacific-dental",
    clientName: "Pacific Dental Group",
    industry: "Healthcare – Dentistry",
    assignedAM: "Jordan M.",
    email: "karen@pacificdentalgroup.com",
    currentStatus: "Renewal Due",
    workflowStatus: "Awaiting Client",
    salesStatus: "Closed Won",
    salesOwner: "Jake R.",
    billingStatus: "Paid",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Website Maintenance", "Content Writing", "Yelp Ads"],
    monthlyValue: 5150,
    renewalDate: "2025-06-15",
    renewalStatus: "Schedule Pending",
    clientHealth: "Good",
    priority: "High",
    billingOwner: "Sarah K.",
    lastActivity: "2025-05-29",
    nextRequiredAction: "Send renewal proposal — due in 16 days",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-29", actor: "System", action: "Monthly report sent to Dr. Yee" },
      { date: "2025-05-15", actor: "Jordan M.", action: "Discussed second location expansion — Q4 2025 target" },
    ],
    notes: "Long-term client. Renewal in 16 days.",
    avatarColor: "#10b981",
    referralSource: "Affiliate",
    affiliateName: "Maria Santos",
    referralRevenue: "$5,150/mo",
    commissionStatus: "Pending",
  },
  {
    id: "mc004",
    slug: "blue-ridge-plumbing",
    clientName: "Blue Ridge Plumbing Co.",
    industry: "Home Services – Plumbing",
    assignedAM: "Alex R.",
    email: "tom@blueridgeplumbing.com",
    currentStatus: "Department Activation Pending",
    workflowStatus: "In Progress",
    salesStatus: "Closed Won",
    salesOwner: "Jake R.",
    billingStatus: "Paid",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Department Activation Pending",
    onboardingStatus: "In Progress",
    activeServices: ["SEO / GBP", "Website Build"],
    monthlyValue: 1500,
    renewalDate: "2026-05-01",
    renewalStatus: "Active",
    clientHealth: "Good",
    priority: "Medium",
    billingOwner: "Lisa P.",
    lastActivity: "2025-05-28",
    nextRequiredAction: "Complete website wireframes and department activation",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: false, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-28", actor: "Casey L.", action: "Started website wireframe design" },
      { date: "2025-05-08", actor: "Alex R.", action: "Onboarding kickoff call — all access received" },
    ],
    notes: "New client — onboarded May 2025. Website build in progress.",
    avatarColor: "#3b82f6",
  },
  {
    id: "mc005",
    slug: "harbor-auto",
    clientName: "Harbor Auto Group",
    industry: "Automotive – Dealership",
    assignedAM: "Sarah K.",
    email: "frank@harborauto.com",
    currentStatus: "Active",
    workflowStatus: "Escalated",
    salesStatus: "Closed Won",
    salesOwner: "Tina W.",
    billingStatus: "Pending",
    invoiceStatus: "Sent — Awaiting Payment",
    paymentStatus: "Unpaid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["Meta Ads", "SEO / GBP"],
    monthlyValue: 6500,
    renewalDate: "2025-11-01",
    renewalStatus: "Active",
    clientHealth: "At Risk",
    priority: "High",
    billingOwner: "Sarah K.",
    lastActivity: "2025-05-26",
    nextRequiredAction: "Resolve content quality dispute — escalate to director",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-26", actor: "Sarah K.", action: "Escalation raised — content quality complaint from Frank" },
      { date: "2025-05-15", actor: "Mike T.", action: "Launched Summer Sale Meta campaign — $8k budget" },
    ],
    notes: "At-risk due to content package dispute. Ad performance strong.",
    avatarColor: "#ef4444",
  },
  {
    id: "mc006",
    slug: "greenleaf-landscaping",
    clientName: "Greenleaf Landscaping",
    industry: "Home Services – Landscaping",
    assignedAM: "Unassigned",
    email: "rob@greenleaflandscaping.com",
    currentStatus: "Lead",
    workflowStatus: "Pending Review",
    salesStatus: "Lead",
    salesOwner: "Jake R.",
    billingStatus: "Pending",
    invoiceStatus: "Not Issued",
    paymentStatus: "N/A",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: false,
    activationStatus: "Not Started",
    onboardingStatus: "Not Started",
    activeServices: [],
    monthlyValue: 0,
    renewalDate: "—",
    renewalStatus: "N/A",
    clientHealth: "Good",
    priority: "Medium",
    billingOwner: "Lisa P.",
    lastActivity: "2025-05-30",
    nextRequiredAction: "Send initial proposal",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: false, servicesConfirmed: false, clientContactVerified: true, amAssigned: false, onboardingRecordCreated: false, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-30", actor: "Mike T.", action: "Discovery call completed — strong fit for SEO + Google Ads" },
    ],
    notes: "Inbound lead from referral. Strong fit.",
    avatarColor: "#84cc16",
  },
  {
    id: "mc007",
    slug: "metro-law-group",
    clientName: "Metro Law Group",
    industry: "Legal Services",
    assignedAM: "Unassigned",
    email: "jsmith@metrolawgroup.com",
    currentStatus: "Proposal Sent",
    workflowStatus: "Awaiting Client",
    salesStatus: "Proposal Sent",
    salesOwner: "Marco T.",
    billingStatus: "Pending",
    invoiceStatus: "Not Issued",
    paymentStatus: "N/A",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: false,
    activationStatus: "Not Started",
    onboardingStatus: "Not Started",
    activeServices: [],
    monthlyValue: 0,
    renewalDate: "—",
    renewalStatus: "N/A",
    clientHealth: "Good",
    priority: "High",
    billingOwner: "Sarah K.",
    lastActivity: "2025-05-25",
    nextRequiredAction: "Follow up on proposal — 5 days no response",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: false, servicesConfirmed: false, clientContactVerified: true, amAssigned: false, onboardingRecordCreated: false, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-25", actor: "Sarah K.", action: "Sent $4,200/mo proposal — SEO + PPC + Content" },
      { date: "2025-05-20", actor: "Mike T.", action: "Second discovery call completed" },
    ],
    notes: "High-value prospect. Proposal sent. Awaiting partner sign-off.",
    avatarColor: "#8b5cf6",
  },
  {
    id: "mc008",
    slug: "bright-vision-optometry",
    clientName: "Bright Vision Optometry",
    industry: "Healthcare – Optometry",
    assignedAM: "Unassigned",
    email: "dr.patel@brightvision.com",
    currentStatus: "Invoice Sent",
    workflowStatus: "Awaiting Client",
    salesStatus: "Closed Won",
    salesOwner: "Jake R.",
    billingStatus: "Pending",
    invoiceStatus: "Sent — Awaiting Payment",
    paymentStatus: "Unpaid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: false,
    activationStatus: "Not Started",
    onboardingStatus: "Not Started",
    activeServices: [],
    monthlyValue: 2800,
    renewalDate: "—",
    renewalStatus: "N/A",
    clientHealth: "Good",
    priority: "Medium",
    billingOwner: "Lisa P.",
    lastActivity: "2025-05-29",
    nextRequiredAction: "Wait for invoice payment to trigger onboarding",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: false, onboardingRecordCreated: false, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-29", actor: "System", action: "Invoice #1110 sent — $2,800/mo SEO + GBP + Content" },
      { date: "2025-05-26", actor: "Mike T.", action: "Contract signed — services confirmed" },
    ],
    notes: "Contract signed. Invoice sent. Waiting for payment to start onboarding.",
    avatarColor: "#06b6d4",
  },
  {
    id: "mc009",
    slug: "summit-fitness",
    clientName: "Summit Fitness Studios",
    industry: "Health & Wellness – Fitness",
    assignedAM: "Unassigned",
    email: "dana@summitfitness.com",
    currentStatus: "Invoice Paid",
    workflowStatus: "In Progress",
    salesStatus: "Closed Won",
    salesOwner: "Tina W.",
    billingStatus: "Cleared",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: false,
    activationStatus: "AM Assignment Needed",
    onboardingStatus: "Not Started",
    activeServices: [],
    monthlyValue: 3200,
    renewalDate: "2026-06-01",
    renewalStatus: "N/A",
    clientHealth: "Good",
    priority: "High",
    billingOwner: "Sarah K.",
    lastActivity: "2025-05-31",
    nextRequiredAction: "Invoice cleared — ready for AM clearance",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: false, onboardingRecordCreated: false, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-31", actor: "System", action: "Invoice #1115 confirmed paid — $3,200" },
      { date: "2025-05-28", actor: "Mike T.", action: "Deal closed — Meta Ads + SEO + Content package" },
    ],
    notes: "Invoice paid. Clearance pending before AM assignment.",
    avatarColor: "#f97316",
  },
  {
    id: "mc010",
    slug: "clearwater-insurance",
    clientName: "Clearwater Insurance Agency",
    industry: "Financial Services – Insurance",
    assignedAM: "Sarah K.",
    email: "bill@clearwaterins.com",
    currentStatus: "Ready for Onboarding",
    workflowStatus: "In Progress",
    salesStatus: "Closed Won",
    salesOwner: "Chris M.",
    billingStatus: "Cleared",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Ready for Onboarding",
    onboardingStatus: "Pending",
    activeServices: [],
    monthlyValue: 4100,
    renewalDate: "2026-06-10",
    renewalStatus: "N/A",
    clientHealth: "Good",
    priority: "High",
    billingOwner: "Lisa P.",
    lastActivity: "2025-05-31",
    nextRequiredAction: "Schedule onboarding kickoff call",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: false, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-31", actor: "Sarah K.", action: "Onboarding record queued — kickoff call to be scheduled" },
      { date: "2025-05-30", actor: "System", action: "Billing cleared — ready to activate" },
    ],
    notes: "All pre-conditions met. Ready for onboarding kickoff.",
    avatarColor: "#0ea5e9",
  },
  {
    id: "mc011",
    slug: "ridgeline-construction",
    clientName: "Ridgeline Construction LLC",
    industry: "Construction",
    assignedAM: "Alex R.",
    email: "tony@ridgelineconstruction.com",
    currentStatus: "Onboarding Pending",
    workflowStatus: "In Progress",
    salesStatus: "Closed Won",
    salesOwner: "Marco T.",
    billingStatus: "Paid",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Onboarding Pending",
    onboardingStatus: "In Progress",
    activeServices: ["SEO / GBP"],
    monthlyValue: 2800,
    renewalDate: "2026-05-15",
    renewalStatus: "Active",
    clientHealth: "Good",
    priority: "Medium",
    billingOwner: "Sarah K.",
    lastActivity: "2025-05-27",
    nextRequiredAction: "Complete onboarding tasks — access credentials pending",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-27", actor: "Alex R.", action: "Waiting on client to share GBP access credentials" },
      { date: "2025-05-20", actor: "Alex R.", action: "Onboarding record created — tasks assigned to SEO team" },
    ],
    notes: "Onboarding in progress. Waiting on GBP access from client.",
    avatarColor: "#78716c",
  },
  {
    id: "mc012",
    slug: "nova-medspa",
    clientName: "Nova MedSpa & Aesthetics",
    industry: "Healthcare – MedSpa",
    assignedAM: "Jordan M.",
    email: "kim@novamedspa.com",
    currentStatus: "Active",
    workflowStatus: "Complete",
    salesStatus: "Closed Won",
    salesOwner: "Chris M.",
    billingStatus: "Paid",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Meta Ads", "Content Writing", "Google Ads"],
    monthlyValue: 7200,
    renewalDate: "2026-01-15",
    renewalStatus: "Active",
    clientHealth: "Excellent",
    priority: "High",
    billingOwner: "Lisa P.",
    lastActivity: "2025-05-30",
    nextRequiredAction: "Quarterly business review — schedule for June",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-30", actor: "Jordan M.", action: "May report delivered — all KPIs green" },
      { date: "2025-05-01", actor: "System", action: "Invoice #2088 processed — $7,200" },
    ],
    notes: "Top-performing account. Upsell opportunity: email marketing.",
    avatarColor: "#ec4899",
  },
  {
    id: "mc013",
    slug: "desert-solar",
    clientName: "Desert Solar Energy",
    industry: "Energy – Solar",
    assignedAM: "Sarah K.",
    email: "craig@desertsolar.com",
    currentStatus: "Cancellation Requested",
    workflowStatus: "Escalated",
    salesStatus: "Closed Won",
    salesOwner: "Tina W.",
    billingStatus: "Pending",
    invoiceStatus: "Sent — Awaiting Payment",
    paymentStatus: "Unpaid",
    cancellationStatus: "Requested",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Meta Ads"],
    monthlyValue: 3900,
    renewalDate: "2025-07-01",
    renewalStatus: "At Risk",
    clientHealth: "Critical",
    priority: "High",
    billingOwner: "Sarah K.",
    lastActivity: "2025-05-29",
    nextRequiredAction: "Retention call — director must be on the line",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-29", actor: "Craig W.", action: "Submitted cancellation request via portal" },
      { date: "2025-05-28", actor: "Sarah K.", action: "Escalated to director — retention required" },
    ],
    notes: "Cancellation requested. Director retention call scheduled for June 3.",
    avatarColor: "#dc2626",
  },
  {
    id: "mc014",
    slug: "lakeside-property",
    clientName: "Lakeside Property Management",
    industry: "Real Estate",
    assignedAM: "Alex R.",
    email: "mgmt@lakesideproperty.com",
    currentStatus: "Offboarding",
    workflowStatus: "In Progress",
    salesStatus: "Closed Won",
    salesOwner: "Jake R.",
    billingStatus: "Closed",
    invoiceStatus: "Final invoice issued",
    paymentStatus: "Paid",
    cancellationStatus: "Approved",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: [],
    monthlyValue: 0,
    renewalDate: "—",
    renewalStatus: "Cancelled",
    clientHealth: "Critical",
    priority: "Medium",
    billingOwner: "Lisa P.",
    lastActivity: "2025-05-26",
    nextRequiredAction: "Complete data export and access revocation",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-26", actor: "Alex R.", action: "Initiated offboarding — data export in progress" },
      { date: "2025-05-20", actor: "System", action: "Final invoice #988 issued and paid" },
    ],
    notes: "Client moving in-house. Offboarding in progress. Friendly exit.",
    avatarColor: "#94a3b8",
  },
  {
    id: "mc015",
    slug: "pinnacle-chiropractic",
    clientName: "Pinnacle Chiropractic",
    industry: "Healthcare – Chiropractic",
    assignedAM: "Jordan M.",
    email: "dr.lee@pinnaclechiro.com",
    currentStatus: "Active",
    workflowStatus: "In Progress",
    salesStatus: "Closed Won",
    salesOwner: "Chris M.",
    billingStatus: "Paid",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Google Ads", "Review Management"],
    monthlyValue: 3600,
    renewalDate: "2025-12-01",
    renewalStatus: "Active",
    clientHealth: "Good",
    priority: "Medium",
    billingOwner: "Sarah K.",
    lastActivity: "2025-05-28",
    nextRequiredAction: "Deliver June SEO performance report",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-28", actor: "Lisa P.", action: "Google Ads optimized — CPC reduced 18%" },
      { date: "2025-05-01", actor: "System", action: "Invoice #1890 processed — $3,600" },
    ],
    notes: "Stable account. Google Ads performing well.",
    avatarColor: "#14b8a6",
  },
  {
    id: "mc016",
    slug: "capital-contractors",
    clientName: "Capital Contractors Group",
    industry: "Construction – Commercial",
    assignedAM: "Sarah K.",
    email: "ops@capitalcontractors.com",
    currentStatus: "Active",
    workflowStatus: "In Progress",
    salesStatus: "Closed Won",
    salesOwner: "Marco T.",
    billingStatus: "Overdue",
    invoiceStatus: "Overdue 15d",
    paymentStatus: "Overdue",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Website Maintenance", "Monthly Reporting"],
    monthlyValue: 2400,
    renewalDate: "2025-10-01",
    renewalStatus: "Active",
    clientHealth: "At Risk",
    priority: "High",
    billingOwner: "Lisa P.",
    lastActivity: "2025-05-24",
    nextRequiredAction: "Send second billing notice — flag for collections if no response",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-24", actor: "System", action: "Second billing reminder sent — no response" },
      { date: "2025-05-10", actor: "Sarah K.", action: "Left voicemail for billing contact" },
    ],
    notes: "Invoice 15 days overdue. No contact response. Escalating.",
    avatarColor: "#854d0e",
  },
  {
    id: "mc017",
    slug: "eastside-veterinary",
    clientName: "Eastside Veterinary Clinic",
    industry: "Healthcare – Veterinary",
    assignedAM: "Alex R.",
    email: "admin@eastsidevetclinic.com",
    currentStatus: "Active",
    workflowStatus: "Complete",
    salesStatus: "Closed Won",
    salesOwner: "Chris M.",
    billingStatus: "Paid",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Content Writing"],
    monthlyValue: 2100,
    renewalDate: "2026-02-01",
    renewalStatus: "Active",
    clientHealth: "Excellent",
    priority: "Low",
    billingOwner: "Sarah K.",
    lastActivity: "2025-05-27",
    nextRequiredAction: "No immediate action needed",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-27", actor: "Alex R.", action: "May deliverables completed — client confirmed satisfaction" },
      { date: "2025-05-01", actor: "System", action: "Invoice #1777 processed — $2,100" },
    ],
    notes: "Low-maintenance, high-satisfaction account.",
    avatarColor: "#22c55e",
  },
  {
    id: "mc018",
    slug: "ironclad-security",
    clientName: "Ironclad Security Systems",
    industry: "Security Services",
    assignedAM: "Jordan M.",
    email: "sales@ironcladsecurity.com",
    currentStatus: "Renewal Due",
    workflowStatus: "Awaiting Client",
    salesStatus: "Closed Won",
    salesOwner: "Jake R.",
    billingStatus: "Paid",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Meta Ads", "Google Ads", "Monthly Reporting"],
    monthlyValue: 5800,
    renewalDate: "2025-06-30",
    renewalStatus: "Schedule Pending",
    clientHealth: "Good",
    priority: "High",
    billingOwner: "Lisa P.",
    lastActivity: "2025-05-29",
    nextRequiredAction: "Send renewal agreement — 30 days out",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-29", actor: "Jordan M.", action: "Renewal conversation started — client open to expansion" },
      { date: "2025-05-01", actor: "System", action: "Invoice #2222 processed — $5,800" },
    ],
    notes: "Renewal in 30 days. Client hinted at adding two new locations.",
    avatarColor: "#1d4ed8",
  },
  {
    id: "mc019",
    slug: "coastal-wellness",
    clientName: "Coastal Wellness Center",
    industry: "Health & Wellness – Holistic",
    assignedAM: "Sarah K.",
    email: "info@coastalwellness.com",
    currentStatus: "Active",
    workflowStatus: "In Progress",
    salesStatus: "Closed Won",
    salesOwner: "Tina W.",
    billingStatus: "Paid",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Meta Ads", "Email Marketing"],
    monthlyValue: 3300,
    renewalDate: "2025-11-15",
    renewalStatus: "Active",
    clientHealth: "Good",
    priority: "Medium",
    billingOwner: "Sarah K.",
    lastActivity: "2025-05-26",
    nextRequiredAction: "Deliver June content calendar",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-26", actor: "Sarah K.", action: "Email campaign Q2 wrap-up — 42% open rate" },
      { date: "2025-05-01", actor: "System", action: "Invoice #2011 processed — $3,300" },
    ],
    notes: "Solid retention. Email marketing exceeding benchmarks.",
    avatarColor: "#a855f7",
  },
  {
    id: "mc020",
    slug: "frontier-logistics",
    clientName: "Frontier Logistics Inc.",
    industry: "Transportation & Logistics",
    assignedAM: "Alex R.",
    email: "hr@frontierlogistics.com",
    currentStatus: "Active",
    workflowStatus: "In Progress",
    salesStatus: "Closed Won",
    salesOwner: "Jake R.",
    billingStatus: "Paid",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared: true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "LinkedIn Ads", "Content Writing", "Monthly Reporting"],
    monthlyValue: 4400,
    renewalDate: "2026-03-15",
    renewalStatus: "Active",
    clientHealth: "Excellent",
    priority: "Medium",
    billingOwner: "Lisa P.",
    lastActivity: "2025-05-28",
    nextRequiredAction: "Present Q2 results deck",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-28", actor: "Alex R.", action: "LinkedIn Ads showing 3.2x ROAS — reporting in progress" },
      { date: "2025-05-01", actor: "System", action: "Invoice #1955 processed — $4,400" },
    ],
    notes: "B2B client. LinkedIn driving strong pipeline results.",
    avatarColor: "#0891b2",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTED HELPERS
// These functions derive Health and Priority from status fields.
// No department should manually set clientHealth or priority.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute client health from billing/status fields.
 * Rules (keep simple — no complex scoring):
 *   Critical  → cancellation requested/approved, OR billing overdue + payment overdue
 *   At Risk   → billing overdue OR payment overdue (but not cancelled)
 *   Excellent → billing Paid/Cleared AND activationStatus Active AND no cancellation
 *   Good      → everything else
 */
export function computeHealth(c: Pick<MasterClient, "billingStatus" | "paymentStatus" | "cancellationStatus" | "activationStatus">): HealthStatus {
  if (c.cancellationStatus === "Requested" || c.cancellationStatus === "Approved") return "Critical";
  if (c.billingStatus === "Overdue" && c.paymentStatus === "Overdue") return "Critical";
  if (c.billingStatus === "Overdue" || c.paymentStatus === "Overdue") return "At Risk";
  if (
    (c.billingStatus === "Paid" || c.billingStatus === "Cleared") &&
    c.activationStatus === "Active" &&
    c.cancellationStatus === "None"
  ) return "Excellent";
  return "Good";
}

/**
 * Compute priority from health.
 * Rules:
 *   High   → Critical or At Risk health
 *   Medium → Good health with some pending action
 *   Low    → Excellent health
 */
export function computePriority(health: HealthStatus, billingStatus: BillingStatus): Priority {
  if (health === "Critical" || health === "At Risk") return "High";
  if (health === "Good" && billingStatus !== "Paid" && billingStatus !== "Cleared") return "Medium";
  if (health === "Excellent") return "Low";
  return "Medium";
}
