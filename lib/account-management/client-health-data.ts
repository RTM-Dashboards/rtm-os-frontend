// ─── RTM OS — Client Health Engine Mock Data ──────────────────────────────────
// Aggregates: Projects, Tasks, Billing, Communications, Call Intelligence,
//             Reporting, Escalations, Renewals, Expansion Opportunities.

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export type HealthStatus = "Healthy" | "Monitor" | "At Risk" | "Critical";
export type RiskLevel    = "Low" | "Medium" | "High" | "Critical";
export type SentimentType = "Positive" | "Neutral" | "Negative" | "Mixed";

// ── Health Score Components ──────────────────────────────────────────────────

export interface HealthScoreBreakdown {
  projectHealth:       number; // 0-100, weight 25%
  communicationHealth: number; // 0-100, weight 20%
  billingHealth:       number; // 0-100, weight 20%
  reportingHealth:     number; // 0-100, weight 10%
  callIntelligence:    number; // 0-100, weight 10%
  escalationHealth:    number; // 0-100, weight 10%
  clientEngagement:    number; // 0-100, weight  5%
  overall:             number; // 0-100 computed weighted
}

// ── Project Health Signals ────────────────────────────────────────────────────

export interface ProjectHealthSignals {
  milestoneCompletion:   number; // % (0-100)
  taskCompletion:        number; // % (0-100)
  blockedTasks:          number;
  delayedDeliverables:   number;
  openDependencies:      number;
  projectRiskScore:      number; // 0-100 (100 = highest risk)
  departmentDelays:      string[];
  projectStatus:         "On Track" | "Monitor" | "Delayed" | "Blocked";
}

// ── Communication Health ─────────────────────────────────────────────────────

export interface CommunicationHealthSignals {
  lastContact:           string;   // ISO date
  daysSinceContact:      number;
  avgResponseTimeHours:  number;
  pendingFollowUps:      number;
  openConcerns:          number;
  meetingFrequency:      "Weekly" | "Bi-Weekly" | "Monthly" | "Infrequent" | "None";
  communicationScore:    number;   // 0-100
  communicationStatus:   "Strong" | "Good" | "Weak" | "Poor";
}

// ── Call Intelligence Signals ─────────────────────────────────────────────────

export interface CallIntelligenceSignals {
  totalCalls:            number;
  qualifiedLeads:        number;
  bookedLeads:           number;
  missedOpportunities:   number;
  complaintTrends:       number;
  serviceRequests:       number;
  renewalSignals:        number;
  upsellSignals:         number;
  callSentiment:         SentimentType;
  leadQualityTrend:      "Improving" | "Stable" | "Declining";
  callQualityScore:      number; // 0-100
}

// ── Reporting Health ──────────────────────────────────────────────────────────

export interface ReportingHealthSignals {
  reportsDelivered:      number;
  reportsMissed:         number;
  reviewStatus:          "Reviewed" | "Pending Review" | "Not Reviewed" | "Overdue";
  clientFeedback:        "Positive" | "Neutral" | "Negative" | "None";
  reportingScore:        number; // 0-100
  lastReportDate:        string;
}

// ── Billing Health ────────────────────────────────────────────────────────────

export interface BillingHealthSignals {
  outstandingInvoices:   number;
  daysOverdue:           number;
  billingHolds:          boolean;
  collectionActivity:    boolean;
  billingScore:          number; // 0-100
  billingStatus:         "Current" | "Overdue" | "At Risk" | "Failed" | "Hold";
  mrr:                   number;
  arr:                   number;
}

// ── Escalation Health ─────────────────────────────────────────────────────────

export interface EscalationHealthSignals {
  openEscalations:       number;
  escalationSeverity:    "None" | "Low" | "Medium" | "High" | "Critical";
  avgResolutionDays:     number;
  departmentsInvolved:   string[];
  escalationScore:       number; // 0-100 (100 = healthiest / no escalations)
}

// ── Client Engagement ─────────────────────────────────────────────────────────

export interface ClientEngagementSignals {
  meetingAttendance:     number; // % (0-100)
  communicationFrequency:"High" | "Medium" | "Low" | "None";
  responseRate:          number; // % (0-100)
  projectParticipation:  "Active" | "Moderate" | "Passive" | "Unresponsive";
  reviewParticipation:   "Active" | "Moderate" | "Passive" | "None";
  engagementScore:       number; // 0-100
  engagementStatus:      "High" | "Medium" | "Low" | "Unresponsive";
}

// ── Renewal Risk ──────────────────────────────────────────────────────────────

export interface RenewalRiskProfile {
  riskScore:             number; // 0-100 (100 = highest risk)
  riskLevel:             RiskLevel;
  contractEndDate:       string;
  daysToRenewal:         number;
  clientSentiment:       SentimentType;
  recommendedActions:    string[];
}

// ── Expansion Opportunity ─────────────────────────────────────────────────────

export interface ExpansionOpportunityProfile {
  opportunityScore:      number; // 0-100
  recommendedServices:   string[];
  revenuePotential:      number;
  confidenceScore:       number; // 0-100
  reason:                string;
  recommendedActions:    string[];
  hasOpportunity:        boolean;
}

// ── Intervention Item ─────────────────────────────────────────────────────────

export interface InterventionItem {
  clientId:       string;
  client:         string;
  reason:         string;
  riskLevel:      RiskLevel;
  assignedOwner:  string;
  recommendedAction: string;
  dueDate:        string;
  status:         "Open" | "In Progress" | "Resolved" | "Escalated";
}

// ── AI Summary ────────────────────────────────────────────────────────────────

export interface AISummary {
  overview:              string;
  healthAssessment:      string;
  risks:                 string[];
  growthOpportunities:   string[];
  renewalSignals:        string;
  expansionSignals:      string;
  communicationSummary:  string;
  recommendedActions:    string[];
}

// ── Communication History Entry ───────────────────────────────────────────────

export interface CommHistoryEntry {
  date:    string;
  type:    "Call" | "Email" | "Meeting" | "Note" | "Follow-Up";
  summary: string;
  by:      string;
  sentiment: SentimentType;
}

// ── Master Client Health Record ───────────────────────────────────────────────

export interface ClientHealthRecord {
  clientId:           string;
  client:             string;
  industry:           string;
  accountManager:     string;
  healthScore:        HealthScoreBreakdown;
  healthStatus:       HealthStatus;

  // Signals
  projectSignals:     ProjectHealthSignals;
  communicationSignals: CommunicationHealthSignals;
  callIntelSignals:   CallIntelligenceSignals;
  reportingSignals:   ReportingHealthSignals;
  billingSignals:     BillingHealthSignals;
  escalationSignals:  EscalationHealthSignals;
  engagementSignals:  ClientEngagementSignals;

  // Profiles
  renewalRisk:        RenewalRiskProfile;
  expansionOpportunity: ExpansionOpportunityProfile;

  // AI
  aiSummary:          AISummary;

  // History (abbreviated)
  commHistory:        CommHistoryEntry[];

  // Meta
  services:           string[];
  startDate:          string;
  location:           string;
  lastHealthReview:   string;
}

// ══════════════════════════════════════════════════════════════════════════════
// MOCK DATA — 30 CLIENTS
// ══════════════════════════════════════════════════════════════════════════════

export const CLIENT_HEALTH_RECORDS: ClientHealthRecord[] = [
  // ─── 01 Apex Roofing ────────────────────────────────────────────────────────
  {
    clientId: "ch01",
    client: "Apex Roofing",
    industry: "Roofing",
    accountManager: "Sarah Chen",
    healthStatus: "Healthy",
    services: ["SEO", "GBP", "Google Ads"],
    startDate: "2023-09-01",
    location: "Phoenix, AZ",
    lastHealthReview: "2025-06-08",
    healthScore: {
      projectHealth: 94, communicationHealth: 91, billingHealth: 100,
      reportingHealth: 88, callIntelligence: 90, escalationHealth: 100,
      clientEngagement: 93, overall: 93,
    },
    projectSignals: {
      milestoneCompletion: 92, taskCompletion: 89, blockedTasks: 0,
      delayedDeliverables: 1, openDependencies: 0, projectRiskScore: 8,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-06", daysSinceContact: 2, avgResponseTimeHours: 3,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Bi-Weekly",
      communicationScore: 91, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 84, qualifiedLeads: 62, bookedLeads: 48, missedOpportunities: 4,
      complaintTrends: 0, serviceRequests: 12, renewalSignals: 2, upsellSignals: 3,
      callSentiment: "Positive", leadQualityTrend: "Improving", callQualityScore: 90,
    },
    reportingSignals: {
      reportsDelivered: 9, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 88, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 100, billingStatus: "Current",
      mrr: 2800, arr: 33600,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 100,
    },
    engagementSignals: {
      meetingAttendance: 95, communicationFrequency: "High", responseRate: 94,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 93, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 8, riskLevel: "Low", contractEndDate: "2025-09-01",
      daysToRenewal: 85, clientSentiment: "Positive",
      recommendedActions: ["Initiate renewal conversation", "Present LSA upsell package"],
    },
    expansionOpportunity: {
      opportunityScore: 88, recommendedServices: ["LSA", "Call Tracking"],
      revenuePotential: 800, confidenceScore: 92,
      reason: "Storm season demand surge. High intent call volume. Client ready to scale.",
      recommendedActions: ["Schedule expansion review call", "Prepare LSA proposal"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Apex Roofing is a high-performing account with strong project momentum, consistent payment history, and excellent call performance. Storm season creates a clear window for revenue expansion.",
      healthAssessment: "Account is healthy across all seven signal categories. No active escalations. Billing is current and client engagement is consistently high.",
      risks: ["Renewal conversation not yet initiated — 85 days remaining", "One minor deliverable delay in SEO"],
      growthOpportunities: ["LSA expansion for storm season", "Call tracking add-on to capture ROI data"],
      renewalSignals: "Client has indicated satisfaction with results. Renewal conversation should be started this month.",
      expansionSignals: "Call volume trending up 18% month-over-month. LSA is the logical next step.",
      communicationSummary: "Client responds within hours and attends all scheduled calls. No unresolved concerns.",
      recommendedActions: ["Start renewal conversation by June 20", "Present LSA expansion proposal", "Schedule quarterly business review"],
    },
    commHistory: [
      { date: "2025-06-06", type: "Call", summary: "Monthly performance review. Client expressed satisfaction with lead volume increase.", by: "Sarah Chen", sentiment: "Positive" },
      { date: "2025-05-22", type: "Email", summary: "Sent Q2 results report. Client replied with positive feedback.", by: "Sarah Chen", sentiment: "Positive" },
      { date: "2025-05-07", type: "Meeting", summary: "Strategy session for storm season campaign planning.", by: "Sarah Chen", sentiment: "Positive" },
    ],
  },

  // ─── 02 Harbor Auto ─────────────────────────────────────────────────────────
  {
    clientId: "ch02",
    client: "Harbor Auto",
    industry: "Automotive",
    accountManager: "Sarah Chen",
    healthStatus: "At Risk",
    services: ["Google Ads", "SEO"],
    startDate: "2022-07-11",
    location: "Seattle, WA",
    lastHealthReview: "2025-06-05",
    healthScore: {
      projectHealth: 42, communicationHealth: 35, billingHealth: 28,
      reportingHealth: 55, callIntelligence: 44, escalationHealth: 50,
      clientEngagement: 32, overall: 40,
    },
    projectSignals: {
      milestoneCompletion: 48, taskCompletion: 52, blockedTasks: 3,
      delayedDeliverables: 4, openDependencies: 2, projectRiskScore: 68,
      departmentDelays: ["Paid Ads", "Design"], projectStatus: "Delayed",
    },
    communicationSignals: {
      lastContact: "2025-05-28", daysSinceContact: 11, avgResponseTimeHours: 48,
      pendingFollowUps: 3, openConcerns: 2, meetingFrequency: "Infrequent",
      communicationScore: 35, communicationStatus: "Weak",
    },
    callIntelSignals: {
      totalCalls: 41, qualifiedLeads: 14, bookedLeads: 9, missedOpportunities: 14,
      complaintTrends: 4, serviceRequests: 3, renewalSignals: 0, upsellSignals: 0,
      callSentiment: "Negative", leadQualityTrend: "Declining", callQualityScore: 44,
    },
    reportingSignals: {
      reportsDelivered: 7, reportsMissed: 1, reviewStatus: "Not Reviewed",
      clientFeedback: "Negative", reportingScore: 55, lastReportDate: "2025-05-10",
    },
    billingSignals: {
      outstandingInvoices: 2, daysOverdue: 22, billingHolds: false,
      collectionActivity: true, billingScore: 28, billingStatus: "Overdue",
      mrr: 3200, arr: 38400,
    },
    escalationSignals: {
      openEscalations: 2, escalationSeverity: "High", avgResolutionDays: 18,
      departmentsInvolved: ["Paid Ads", "Account Management"], escalationScore: 50,
    },
    engagementSignals: {
      meetingAttendance: 40, communicationFrequency: "Low", responseRate: 38,
      projectParticipation: "Passive", reviewParticipation: "Passive",
      engagementScore: 32, engagementStatus: "Low",
    },
    renewalRisk: {
      riskScore: 82, riskLevel: "High", contractEndDate: "2025-07-11",
      daysToRenewal: 32, clientSentiment: "Negative",
      recommendedActions: ["Immediate performance review call", "Resolve billing before renewal", "Prepare save presentation"],
    },
    expansionOpportunity: {
      opportunityScore: 15, recommendedServices: ["Display Ads", "Remarketing"],
      revenuePotential: 600, confidenceScore: 25,
      reason: "Low confidence due to payment issues and lead quality complaints. Flag pending resolution.",
      recommendedActions: ["Resolve escalations first", "Re-assess after billing is current"],
      hasOpportunity: false,
    },
    aiSummary: {
      overview: "Harbor Auto is at serious risk. Payment is 22 days overdue, lead quality concerns are escalating, and the renewal is 32 days away. Immediate intervention is required.",
      healthAssessment: "Account is failing across billing, communication, and engagement signals. Two active escalations with no resolution timeline.",
      risks: ["Renewal in 32 days — account not renewal-ready", "Billing 22 days overdue with collection activity", "Client unresponsive to outreach", "Lead quality complaints unresolved"],
      growthOpportunities: [],
      renewalSignals: "Client has verbally expressed dissatisfaction. Renewal at high risk without intervention.",
      expansionSignals: "No expansion signals detected. Account must stabilize before expansion is considered.",
      communicationSummary: "Last contact was 11 days ago with no response to two follow-up messages. Client is disengaged.",
      recommendedActions: ["Immediate executive retention call", "Resolve outstanding invoices", "Conduct lead quality audit", "Prepare formal save plan"],
    },
    commHistory: [
      { date: "2025-05-28", type: "Follow-Up", summary: "Second follow-up email sent. No response received.", by: "Sarah Chen", sentiment: "Neutral" },
      { date: "2025-05-19", type: "Call", summary: "Client raised lead quality concerns. Promised to investigate.", by: "Sarah Chen", sentiment: "Negative" },
      { date: "2025-05-05", type: "Email", summary: "Sent May performance report. Client did not respond.", by: "Sarah Chen", sentiment: "Neutral" },
    ],
  },

  // ─── 03 Lakeview Dental ──────────────────────────────────────────────────────
  {
    clientId: "ch03",
    client: "Lakeview Dental",
    industry: "Dental",
    accountManager: "Sarah Chen",
    healthStatus: "Critical",
    services: ["SEO", "Reporting"],
    startDate: "2022-06-30",
    location: "Chicago, IL",
    lastHealthReview: "2025-06-05",
    healthScore: {
      projectHealth: 25, communicationHealth: 18, billingHealth: 10,
      reportingHealth: 30, callIntelligence: 22, escalationHealth: 20,
      clientEngagement: 12, overall: 21,
    },
    projectSignals: {
      milestoneCompletion: 30, taskCompletion: 35, blockedTasks: 5,
      delayedDeliverables: 6, openDependencies: 3, projectRiskScore: 88,
      departmentDelays: ["SEO", "Reporting"], projectStatus: "Blocked",
    },
    communicationSignals: {
      lastContact: "2025-05-14", daysSinceContact: 25, avgResponseTimeHours: 120,
      pendingFollowUps: 4, openConcerns: 4, meetingFrequency: "None",
      communicationScore: 18, communicationStatus: "Poor",
    },
    callIntelSignals: {
      totalCalls: 18, qualifiedLeads: 4, bookedLeads: 2, missedOpportunities: 12,
      complaintTrends: 6, serviceRequests: 1, renewalSignals: 0, upsellSignals: 0,
      callSentiment: "Negative", leadQualityTrend: "Declining", callQualityScore: 22,
    },
    reportingSignals: {
      reportsDelivered: 5, reportsMissed: 3, reviewStatus: "Overdue",
      clientFeedback: "Negative", reportingScore: 30, lastReportDate: "2025-04-15",
    },
    billingSignals: {
      outstandingInvoices: 3, daysOverdue: 45, billingHolds: true,
      collectionActivity: true, billingScore: 10, billingStatus: "Hold",
      mrr: 2400, arr: 28800,
    },
    escalationSignals: {
      openEscalations: 3, escalationSeverity: "Critical", avgResolutionDays: 28,
      departmentsInvolved: ["SEO", "Reporting", "Account Management", "Finance"],
      escalationScore: 20,
    },
    engagementSignals: {
      meetingAttendance: 10, communicationFrequency: "None", responseRate: 12,
      projectParticipation: "Unresponsive", reviewParticipation: "None",
      engagementScore: 12, engagementStatus: "Unresponsive",
    },
    renewalRisk: {
      riskScore: 97, riskLevel: "Critical", contractEndDate: "2025-06-30",
      daysToRenewal: 22, clientSentiment: "Negative",
      recommendedActions: ["Director-level retention call this week", "Waive one invoice as goodwill", "Provide written recovery plan"],
    },
    expansionOpportunity: {
      opportunityScore: 0, recommendedServices: [],
      revenuePotential: 0, confidenceScore: 0,
      reason: "Account is critical. No expansion discussion until stabilization.",
      recommendedActions: ["Stabilize account before expansion consideration"],
      hasOpportunity: false,
    },
    aiSummary: {
      overview: "Lakeview Dental is in critical condition. Billing is 45 days overdue with a hold, the renewal is in 22 days, and the client has been unresponsive for 25 days. Immediate executive intervention is the only path to save this account.",
      healthAssessment: "All seven health signals are in the red. Three active critical escalations. No project progress. Renewal at critical risk.",
      risks: ["Renewal in 22 days — not renewal-ready", "Billing 45 days overdue with hold active", "Client unresponsive for 25 days", "Three missed reports", "Three critical escalations unresolved"],
      growthOpportunities: [],
      renewalSignals: "No positive renewal signals. Account may churn if executive intervention does not occur this week.",
      expansionSignals: "No expansion signals. Account stabilization is the only priority.",
      communicationSummary: "No contact in 25 days. Four unanswered follow-ups. Account manager has escalated to director.",
      recommendedActions: ["Director retention call this week", "Billing hold resolution required", "Formal recovery plan with milestones", "Weekly check-in until renewal decision"],
    },
    commHistory: [
      { date: "2025-05-28", type: "Follow-Up", summary: "Fourth unanswered follow-up. Escalated to director.", by: "Sarah Chen", sentiment: "Neutral" },
      { date: "2025-05-20", type: "Follow-Up", summary: "Third follow-up. No response.", by: "Sarah Chen", sentiment: "Neutral" },
      { date: "2025-05-14", type: "Call", summary: "Brief call. Client mentioned financial challenges. Cut call short.", by: "Sarah Chen", sentiment: "Negative" },
    ],
  },

  // ─── 04 Blue Sky Solar ───────────────────────────────────────────────────────
  {
    clientId: "ch04",
    client: "Blue Sky Solar",
    industry: "Solar",
    accountManager: "Maria Santos",
    healthStatus: "Monitor",
    services: ["SEO", "Meta Ads", "Content", "Design"],
    startDate: "2025-01-15",
    location: "San Diego, CA",
    lastHealthReview: "2025-06-07",
    healthScore: {
      projectHealth: 72, communicationHealth: 75, billingHealth: 100,
      reportingHealth: 68, callIntelligence: 70, escalationHealth: 90,
      clientEngagement: 74, overall: 78,
    },
    projectSignals: {
      milestoneCompletion: 65, taskCompletion: 72, blockedTasks: 1,
      delayedDeliverables: 2, openDependencies: 1, projectRiskScore: 28,
      departmentDelays: ["Design"], projectStatus: "Monitor",
    },
    communicationSignals: {
      lastContact: "2025-06-04", daysSinceContact: 4, avgResponseTimeHours: 12,
      pendingFollowUps: 1, openConcerns: 1, meetingFrequency: "Bi-Weekly",
      communicationScore: 75, communicationStatus: "Good",
    },
    callIntelSignals: {
      totalCalls: 52, qualifiedLeads: 34, bookedLeads: 28, missedOpportunities: 6,
      complaintTrends: 0, serviceRequests: 8, renewalSignals: 1, upsellSignals: 2,
      callSentiment: "Positive", leadQualityTrend: "Stable", callQualityScore: 70,
    },
    reportingSignals: {
      reportsDelivered: 4, reportsMissed: 0, reviewStatus: "Pending Review",
      clientFeedback: "Positive", reportingScore: 68, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 100, billingStatus: "Current",
      mrr: 5100, arr: 61200,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 90,
    },
    engagementSignals: {
      meetingAttendance: 80, communicationFrequency: "Medium", responseRate: 78,
      projectParticipation: "Active", reviewParticipation: "Moderate",
      engagementScore: 74, engagementStatus: "Medium",
    },
    renewalRisk: {
      riskScore: 22, riskLevel: "Low", contractEndDate: "2026-01-15",
      daysToRenewal: 220, clientSentiment: "Positive",
      recommendedActions: ["Maintain regular check-ins", "Deliver brand kit assets on time"],
    },
    expansionOpportunity: {
      opportunityScore: 72, recommendedServices: ["Google Ads", "Landing Pages"],
      revenuePotential: 1400, confidenceScore: 72,
      reason: "Onboarding progressing well. Strong lead volume. Ready for paid search expansion in Q3.",
      recommendedActions: ["Propose Google Ads in Q3 review", "Prepare landing page package"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Blue Sky Solar is a new client progressing well through onboarding. One brand kit delay is creating minor friction in the Design pipeline but overall trajectory is positive.",
      healthAssessment: "Account is stable across most signals. Billing is clean, communication is strong, and call performance is solid. Reporting is pending client review.",
      risks: ["Brand kit delay impacting Design deliverables", "Reporting not yet reviewed by client"],
      growthOpportunities: ["Google Ads expansion in Q3", "Landing page development package"],
      renewalSignals: "Early positive sentiment. No renewal risk signals for 220 days.",
      expansionSignals: "Strong onboarding trajectory positions this account for paid search expansion in Q3.",
      communicationSummary: "Client is engaged and responsive. One open concern regarding campaign timeline.",
      recommendedActions: ["Resolve brand kit delay", "Schedule reporting review call", "Prepare Q3 expansion proposal"],
    },
    commHistory: [
      { date: "2025-06-04", type: "Meeting", summary: "Monthly onboarding check-in. Discussed brand kit delay. Client understanding.", by: "Maria Santos", sentiment: "Positive" },
      { date: "2025-05-20", type: "Email", summary: "Sent progress update on SEO and Meta Ads setup.", by: "Maria Santos", sentiment: "Positive" },
    ],
  },

  // ─── 05 Metro Electrical ─────────────────────────────────────────────────────
  {
    clientId: "ch05",
    client: "Metro Electrical",
    industry: "Electrical",
    accountManager: "James Park",
    healthStatus: "Monitor",
    services: ["PPC", "LSA", "GBP"],
    startDate: "2023-11-20",
    location: "Dallas, TX",
    lastHealthReview: "2025-06-06",
    healthScore: {
      projectHealth: 48, communicationHealth: 50, billingHealth: 82,
      reportingHealth: 60, callIntelligence: 55, escalationHealth: 70,
      clientEngagement: 45, overall: 58,
    },
    projectSignals: {
      milestoneCompletion: 42, taskCompletion: 50, blockedTasks: 4,
      delayedDeliverables: 3, openDependencies: 2, projectRiskScore: 62,
      departmentDelays: ["LSA", "Paid Ads"], projectStatus: "Blocked",
    },
    communicationSignals: {
      lastContact: "2025-05-31", daysSinceContact: 8, avgResponseTimeHours: 36,
      pendingFollowUps: 2, openConcerns: 1, meetingFrequency: "Monthly",
      communicationScore: 50, communicationStatus: "Weak",
    },
    callIntelSignals: {
      totalCalls: 28, qualifiedLeads: 12, bookedLeads: 8, missedOpportunities: 8,
      complaintTrends: 1, serviceRequests: 4, renewalSignals: 0, upsellSignals: 1,
      callSentiment: "Neutral", leadQualityTrend: "Stable", callQualityScore: 55,
    },
    reportingSignals: {
      reportsDelivered: 6, reportsMissed: 1, reviewStatus: "Pending Review",
      clientFeedback: "Neutral", reportingScore: 60, lastReportDate: "2025-05-15",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 82, billingStatus: "Current",
      mrr: 3600, arr: 43200,
    },
    escalationSignals: {
      openEscalations: 1, escalationSeverity: "Medium", avgResolutionDays: 12,
      departmentsInvolved: ["LSA", "Account Management"], escalationScore: 70,
    },
    engagementSignals: {
      meetingAttendance: 55, communicationFrequency: "Low", responseRate: 48,
      projectParticipation: "Passive", reviewParticipation: "Passive",
      engagementScore: 45, engagementStatus: "Low",
    },
    renewalRisk: {
      riskScore: 48, riskLevel: "Medium", contractEndDate: "2025-11-20",
      daysToRenewal: 163, clientSentiment: "Neutral",
      recommendedActions: ["Resolve LSA documentation to unblock campaign", "Re-engage client on project status"],
    },
    expansionOpportunity: {
      opportunityScore: 40, recommendedServices: ["Google Ads"],
      revenuePotential: 800, confidenceScore: 40,
      reason: "LSA docs must be resolved first. Google Ads expansion possible once campaigns are live.",
      recommendedActions: ["Unblock LSA first", "Revisit expansion after campaign launch"],
      hasOpportunity: false,
    },
    aiSummary: {
      overview: "Metro Electrical's onboarding is stalled due to missing LSA documentation. PPC campaign is on hold. Client is slow to respond and engagement is low.",
      healthAssessment: "Project and communication signals are in the yellow. Billing is clean but deliverables are blocked.",
      risks: ["LSA docs missing — blocking campaign launch", "Client slow to respond", "One active escalation", "One missed report"],
      growthOpportunities: ["Google Ads expansion after campaign launch"],
      renewalSignals: "No renewal signals yet. Renewal is 163 days away.",
      expansionSignals: "Expansion not viable until current campaigns are live.",
      communicationSummary: "Client responds but with delay. Two pending follow-ups.",
      recommendedActions: ["Follow up on LSA docs with deadline", "Clear escalation", "Book status call this week"],
    },
    commHistory: [
      { date: "2025-05-31", type: "Email", summary: "Third reminder about LSA documentation. Client acknowledged, no timeline given.", by: "James Park", sentiment: "Neutral" },
      { date: "2025-05-15", type: "Call", summary: "Project update. Client frustrated with delays. Escalation opened.", by: "James Park", sentiment: "Negative" },
    ],
  },

  // ─── 06 Pinnacle HVAC ────────────────────────────────────────────────────────
  {
    clientId: "ch06",
    client: "Pinnacle HVAC",
    industry: "HVAC",
    accountManager: "James Park",
    healthStatus: "Healthy",
    services: ["GBP", "LSA", "SEO"],
    startDate: "2023-07-01",
    location: "Houston, TX",
    lastHealthReview: "2025-06-06",
    healthScore: {
      projectHealth: 90, communicationHealth: 92, billingHealth: 100,
      reportingHealth: 85, callIntelligence: 88, escalationHealth: 100,
      clientEngagement: 90, overall: 92,
    },
    projectSignals: {
      milestoneCompletion: 94, taskCompletion: 91, blockedTasks: 0,
      delayedDeliverables: 0, openDependencies: 0, projectRiskScore: 6,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-05", daysSinceContact: 3, avgResponseTimeHours: 4,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Bi-Weekly",
      communicationScore: 92, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 96, qualifiedLeads: 74, bookedLeads: 61, missedOpportunities: 3,
      complaintTrends: 0, serviceRequests: 8, renewalSignals: 3, upsellSignals: 4,
      callSentiment: "Positive", leadQualityTrend: "Improving", callQualityScore: 88,
    },
    reportingSignals: {
      reportsDelivered: 11, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 85, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 100, billingStatus: "Current",
      mrr: 4500, arr: 54000,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 100,
    },
    engagementSignals: {
      meetingAttendance: 92, communicationFrequency: "High", responseRate: 94,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 90, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 6, riskLevel: "Low", contractEndDate: "2025-07-01",
      daysToRenewal: 22, clientSentiment: "Positive",
      recommendedActions: ["Close renewal this week", "Present GBP Enhanced and Analytics upgrade"],
    },
    expansionOpportunity: {
      opportunityScore: 94, recommendedServices: ["GBP Enhanced", "Analytics Pro"],
      revenuePotential: 1200, confidenceScore: 95,
      reason: "Client verbally agreed to expansion. Strong performance across all channels.",
      recommendedActions: ["Send formal expansion proposal by June 15", "Close renewal and expansion together"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Pinnacle HVAC is one of the strongest accounts in the portfolio. Renewal is in 22 days and the client has already verbally agreed to expand services.",
      healthAssessment: "All signals are green. High engagement, clean billing, no escalations, and strong call performance.",
      risks: ["Renewal closes in 22 days — must be formalized soon"],
      growthOpportunities: ["GBP Enhanced upgrade", "Analytics Pro add-on"],
      renewalSignals: "Client has expressed positive renewal intent. Formal close expected this week.",
      expansionSignals: "Expansion proposal in final review. Close expected alongside renewal.",
      communicationSummary: "Excellent communication cadence. Client attends all calls and responds promptly.",
      recommendedActions: ["Close renewal by June 20", "Deliver expansion proposal", "Schedule QBR for Q3"],
    },
    commHistory: [
      { date: "2025-06-05", type: "Meeting", summary: "Renewal discussion. Client confirmed intent. Awaiting formal proposal.", by: "James Park", sentiment: "Positive" },
      { date: "2025-05-20", type: "Call", summary: "Performance review. Record lead volume in May.", by: "James Park", sentiment: "Positive" },
    ],
  },

  // ─── 07 Summit Landscaping ───────────────────────────────────────────────────
  {
    clientId: "ch07",
    client: "Summit Landscaping",
    industry: "Landscaping",
    accountManager: "James Park",
    healthStatus: "Monitor",
    services: ["SEO", "Content", "GBP"],
    startDate: "2023-10-15",
    location: "Denver, CO",
    lastHealthReview: "2025-06-04",
    healthScore: {
      projectHealth: 62, communicationHealth: 65, billingHealth: 88,
      reportingHealth: 58, callIntelligence: 60, escalationHealth: 82,
      clientEngagement: 58, overall: 67,
    },
    projectSignals: {
      milestoneCompletion: 68, taskCompletion: 62, blockedTasks: 1,
      delayedDeliverables: 2, openDependencies: 1, projectRiskScore: 38,
      departmentDelays: ["Content"], projectStatus: "Monitor",
    },
    communicationSignals: {
      lastContact: "2025-05-30", daysSinceContact: 9, avgResponseTimeHours: 24,
      pendingFollowUps: 1, openConcerns: 1, meetingFrequency: "Monthly",
      communicationScore: 65, communicationStatus: "Good",
    },
    callIntelSignals: {
      totalCalls: 44, qualifiedLeads: 28, bookedLeads: 20, missedOpportunities: 5,
      complaintTrends: 0, serviceRequests: 6, renewalSignals: 1, upsellSignals: 1,
      callSentiment: "Neutral", leadQualityTrend: "Stable", callQualityScore: 60,
    },
    reportingSignals: {
      reportsDelivered: 7, reportsMissed: 1, reviewStatus: "Pending Review",
      clientFeedback: "Neutral", reportingScore: 58, lastReportDate: "2025-05-18",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 88, billingStatus: "Current",
      mrr: 2900, arr: 34800,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 7,
      departmentsInvolved: [], escalationScore: 82,
    },
    engagementSignals: {
      meetingAttendance: 65, communicationFrequency: "Medium", responseRate: 62,
      projectParticipation: "Moderate", reviewParticipation: "Moderate",
      engagementScore: 58, engagementStatus: "Medium",
    },
    renewalRisk: {
      riskScore: 30, riskLevel: "Low", contractEndDate: "2025-10-15",
      daysToRenewal: 127, clientSentiment: "Neutral",
      recommendedActions: ["Improve reporting delivery", "Book check-in before October"],
    },
    expansionOpportunity: {
      opportunityScore: 55, recommendedServices: ["Google Ads"],
      revenuePotential: 700, confidenceScore: 55,
      reason: "Seasonal demand. Google Ads could capture peak season traffic.",
      recommendedActions: ["Propose Google Ads pilot for summer season"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Summit Landscaping is a stable account with moderate engagement. Content delays are creating minor friction but no escalations are active.",
      healthAssessment: "Account is in the monitor zone. Billing is clean and no escalations exist, but project progress and reporting are lagging.",
      risks: ["Content deliverable delay", "One missed report"],
      growthOpportunities: ["Google Ads for peak season"],
      renewalSignals: "Renewal is 127 days away. No immediate risk.",
      expansionSignals: "Seasonal Google Ads opportunity exists for summer.",
      communicationSummary: "Communication is adequate. Client responds within a day.",
      recommendedActions: ["Clear content delay", "Deliver overdue report", "Propose summer Google Ads"],
    },
    commHistory: [
      { date: "2025-05-30", type: "Email", summary: "Monthly check-in. Discussed content calendar update.", by: "James Park", sentiment: "Neutral" },
    ],
  },

  // ─── 08 NorthStar Dental ─────────────────────────────────────────────────────
  {
    clientId: "ch08",
    client: "NorthStar Dental",
    industry: "Dental",
    accountManager: "Tina Webb",
    healthStatus: "Healthy",
    services: ["SEO", "PPC", "Content"],
    startDate: "2023-12-01",
    location: "Minneapolis, MN",
    lastHealthReview: "2025-06-07",
    healthScore: {
      projectHealth: 86, communicationHealth: 88, billingHealth: 100,
      reportingHealth: 82, callIntelligence: 84, escalationHealth: 100,
      clientEngagement: 88, overall: 88,
    },
    projectSignals: {
      milestoneCompletion: 88, taskCompletion: 86, blockedTasks: 0,
      delayedDeliverables: 1, openDependencies: 0, projectRiskScore: 12,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-05", daysSinceContact: 3, avgResponseTimeHours: 5,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Bi-Weekly",
      communicationScore: 88, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 68, qualifiedLeads: 50, bookedLeads: 42, missedOpportunities: 4,
      complaintTrends: 0, serviceRequests: 7, renewalSignals: 2, upsellSignals: 3,
      callSentiment: "Positive", leadQualityTrend: "Improving", callQualityScore: 84,
    },
    reportingSignals: {
      reportsDelivered: 6, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 82, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 100, billingStatus: "Current",
      mrr: 3800, arr: 45600,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 100,
    },
    engagementSignals: {
      meetingAttendance: 92, communicationFrequency: "High", responseRate: 90,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 88, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 10, riskLevel: "Low", contractEndDate: "2025-12-01",
      daysToRenewal: 174, clientSentiment: "Positive",
      recommendedActions: ["Begin renewal conversation in October", "Present multi-location expansion"],
    },
    expansionOpportunity: {
      opportunityScore: 78, recommendedServices: ["SEO", "PPC", "GBP"],
      revenuePotential: 3800, confidenceScore: 78,
      reason: "Two new locations opening Q3. High expansion potential across all current services.",
      recommendedActions: ["Present multi-location proposal", "Book expansion planning session"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "NorthStar Dental is a high-value, highly engaged account with strong performance metrics and a significant multi-location expansion opportunity in Q3.",
      healthAssessment: "All signals are healthy. Clean billing, strong communication, and high engagement scores.",
      risks: ["No active risks. One minor deliverable delay."],
      growthOpportunities: ["Multi-location SEO, PPC, and GBP expansion — 2 new locations in Q3"],
      renewalSignals: "Strong positive sentiment. Early renewal conversation recommended.",
      expansionSignals: "Two new locations confirmed for Q3. This is the highest expansion priority in the portfolio.",
      communicationSummary: "Excellent engagement. Client attends all meetings and responds quickly.",
      recommendedActions: ["Present multi-location expansion proposal", "Schedule Q3 strategy session", "Initiate early renewal conversation"],
    },
    commHistory: [
      { date: "2025-06-05", type: "Meeting", summary: "Q3 planning. Client confirmed two new location openings. Expansion discussion initiated.", by: "Tina Webb", sentiment: "Positive" },
      { date: "2025-05-22", type: "Call", summary: "Performance review. Record patient bookings from PPC.", by: "Tina Webb", sentiment: "Positive" },
    ],
  },

  // ─── 09 Pacific Dental ───────────────────────────────────────────────────────
  {
    clientId: "ch09",
    client: "Pacific Dental",
    industry: "Dental",
    accountManager: "Tina Webb",
    healthStatus: "Monitor",
    services: ["SEO", "Reporting", "GBP"],
    startDate: "2023-08-10",
    location: "Sacramento, CA",
    lastHealthReview: "2025-06-03",
    healthScore: {
      projectHealth: 70, communicationHealth: 72, billingHealth: 90,
      reportingHealth: 65, callIntelligence: 68, escalationHealth: 85,
      clientEngagement: 68, overall: 74,
    },
    projectSignals: {
      milestoneCompletion: 72, taskCompletion: 70, blockedTasks: 0,
      delayedDeliverables: 1, openDependencies: 1, projectRiskScore: 24,
      departmentDelays: [], projectStatus: "Monitor",
    },
    communicationSignals: {
      lastContact: "2025-06-01", daysSinceContact: 7, avgResponseTimeHours: 18,
      pendingFollowUps: 1, openConcerns: 0, meetingFrequency: "Monthly",
      communicationScore: 72, communicationStatus: "Good",
    },
    callIntelSignals: {
      totalCalls: 48, qualifiedLeads: 32, bookedLeads: 26, missedOpportunities: 5,
      complaintTrends: 0, serviceRequests: 5, renewalSignals: 1, upsellSignals: 1,
      callSentiment: "Neutral", leadQualityTrend: "Stable", callQualityScore: 68,
    },
    reportingSignals: {
      reportsDelivered: 8, reportsMissed: 1, reviewStatus: "Pending Review",
      clientFeedback: "Neutral", reportingScore: 65, lastReportDate: "2025-05-20",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 90, billingStatus: "Current",
      mrr: 3200, arr: 38400,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 5,
      departmentsInvolved: [], escalationScore: 85,
    },
    engagementSignals: {
      meetingAttendance: 72, communicationFrequency: "Medium", responseRate: 68,
      projectParticipation: "Moderate", reviewParticipation: "Moderate",
      engagementScore: 68, engagementStatus: "Medium",
    },
    renewalRisk: {
      riskScore: 25, riskLevel: "Low", contractEndDate: "2025-08-10",
      daysToRenewal: 62, clientSentiment: "Neutral",
      recommendedActions: ["Book renewal conversation in July", "Deliver missed report"],
    },
    expansionOpportunity: {
      opportunityScore: 60, recommendedServices: ["PPC"],
      revenuePotential: 900, confidenceScore: 60,
      reason: "SEO results are strong. PPC would complement existing organic strategy.",
      recommendedActions: ["Present PPC proposal at renewal meeting"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Pacific Dental is a stable account in the monitor zone. Renewal is 62 days away and requires proactive engagement.",
      healthAssessment: "Signals are generally positive but reporting has a gap and engagement could be stronger.",
      risks: ["Renewal in 62 days — conversation not started", "One missed report"],
      growthOpportunities: ["PPC expansion alongside renewal"],
      renewalSignals: "One positive renewal signal detected. Renewal conversation should start in July.",
      expansionSignals: "PPC is a natural fit given strong SEO performance.",
      communicationSummary: "Communication is adequate. Client is moderately responsive.",
      recommendedActions: ["Deliver missed report", "Book July renewal meeting", "Present PPC proposal"],
    },
    commHistory: [
      { date: "2025-06-01", type: "Email", summary: "Monthly update sent. One pending follow-up on reporting review.", by: "Tina Webb", sentiment: "Neutral" },
    ],
  },

  // ─── 10 Radiance MedSpa ──────────────────────────────────────────────────────
  {
    clientId: "ch10",
    client: "Radiance MedSpa",
    industry: "MedSpa",
    accountManager: "Tina Webb",
    healthStatus: "Healthy",
    services: ["Meta Ads", "Design", "SEO"],
    startDate: "2023-11-01",
    location: "Miami, FL",
    lastHealthReview: "2025-06-06",
    healthScore: {
      projectHealth: 82, communicationHealth: 84, billingHealth: 100,
      reportingHealth: 78, callIntelligence: 82, escalationHealth: 100,
      clientEngagement: 84, overall: 87,
    },
    projectSignals: {
      milestoneCompletion: 84, taskCompletion: 82, blockedTasks: 0,
      delayedDeliverables: 1, openDependencies: 0, projectRiskScore: 14,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-04", daysSinceContact: 4, avgResponseTimeHours: 6,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Bi-Weekly",
      communicationScore: 84, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 62, qualifiedLeads: 46, bookedLeads: 38, missedOpportunities: 4,
      complaintTrends: 0, serviceRequests: 9, renewalSignals: 1, upsellSignals: 3,
      callSentiment: "Positive", leadQualityTrend: "Improving", callQualityScore: 82,
    },
    reportingSignals: {
      reportsDelivered: 7, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 78, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 100, billingStatus: "Current",
      mrr: 4200, arr: 50400,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 100,
    },
    engagementSignals: {
      meetingAttendance: 86, communicationFrequency: "High", responseRate: 84,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 84, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 12, riskLevel: "Low", contractEndDate: "2025-11-01",
      daysToRenewal: 144, clientSentiment: "Positive",
      recommendedActions: ["Book renewal conversation in September", "Present SMS Marketing add-on"],
    },
    expansionOpportunity: {
      opportunityScore: 84, recommendedServices: ["Meta Ads Scale", "SMS Marketing"],
      revenuePotential: 900, confidenceScore: 85,
      reason: "Summer promotions season. Client is ready for Meta Ads scale and SMS marketing.",
      recommendedActions: ["Present summer promotions campaign proposal", "Close SMS Marketing add-on"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Radiance MedSpa is a strong performer entering peak season. Expansion opportunity exists for summer promotions and SMS Marketing.",
      healthAssessment: "All signals are healthy. Strong billing, engagement, and call performance.",
      risks: ["No significant risks. One minor deliverable delay."],
      growthOpportunities: ["Summer promotions Meta Ads scale", "SMS Marketing add-on"],
      renewalSignals: "Positive sentiment. Renewal conversation should start in September.",
      expansionSignals: "Summer season creates a timely expansion window.",
      communicationSummary: "Excellent communication. Client is engaged and responsive.",
      recommendedActions: ["Present summer campaign proposal", "Close SMS Marketing add-on", "Book September renewal conversation"],
    },
    commHistory: [
      { date: "2025-06-04", type: "Meeting", summary: "Summer strategy session. Client excited about promotions campaign.", by: "Tina Webb", sentiment: "Positive" },
    ],
  },

  // ─── 11 Urban Fitness Co. ────────────────────────────────────────────────────
  {
    clientId: "ch11",
    client: "Urban Fitness Co.",
    industry: "Fitness",
    accountManager: "Sarah Chen",
    healthStatus: "Healthy",
    services: ["Meta Ads", "SEO"],
    startDate: "2023-10-20",
    location: "Austin, TX",
    lastHealthReview: "2025-06-05",
    healthScore: {
      projectHealth: 78, communicationHealth: 80, billingHealth: 95,
      reportingHealth: 72, callIntelligence: 76, escalationHealth: 92,
      clientEngagement: 78, overall: 82,
    },
    projectSignals: {
      milestoneCompletion: 80, taskCompletion: 78, blockedTasks: 0,
      delayedDeliverables: 1, openDependencies: 0, projectRiskScore: 18,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-03", daysSinceContact: 5, avgResponseTimeHours: 8,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Monthly",
      communicationScore: 80, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 55, qualifiedLeads: 38, bookedLeads: 30, missedOpportunities: 4,
      complaintTrends: 0, serviceRequests: 5, renewalSignals: 1, upsellSignals: 2,
      callSentiment: "Positive", leadQualityTrend: "Stable", callQualityScore: 76,
    },
    reportingSignals: {
      reportsDelivered: 7, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 72, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 95, billingStatus: "Current",
      mrr: 2600, arr: 31200,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 92,
    },
    engagementSignals: {
      meetingAttendance: 80, communicationFrequency: "Medium", responseRate: 78,
      projectParticipation: "Active", reviewParticipation: "Moderate",
      engagementScore: 78, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 15, riskLevel: "Low", contractEndDate: "2025-10-20",
      daysToRenewal: 132, clientSentiment: "Positive",
      recommendedActions: ["Initiate renewal in September", "Propose content add-on"],
    },
    expansionOpportunity: {
      opportunityScore: 65, recommendedServices: ["Content", "Email Marketing"],
      revenuePotential: 600, confidenceScore: 65,
      reason: "Strong social following. Content marketing would amplify Meta Ads results.",
      recommendedActions: ["Propose content package at renewal"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Urban Fitness Co. is a healthy account with steady performance and a content expansion opportunity.",
      healthAssessment: "All signals are positive. Clean billing, good communication, no escalations.",
      risks: ["No significant risks."],
      growthOpportunities: ["Content marketing and email marketing expansion"],
      renewalSignals: "One positive signal. Renewal conversation in September.",
      expansionSignals: "Content marketing is a natural fit for this brand.",
      communicationSummary: "Client is engaged and attends monthly check-ins.",
      recommendedActions: ["Propose content add-on", "Initiate renewal in September"],
    },
    commHistory: [
      { date: "2025-06-03", type: "Call", summary: "Monthly check-in. Positive results discussion.", by: "Sarah Chen", sentiment: "Positive" },
    ],
  },

  // ─── 12 Bright Dental Studio ─────────────────────────────────────────────────
  {
    clientId: "ch12",
    client: "Bright Dental Studio",
    industry: "Dental",
    accountManager: "Maria Santos",
    healthStatus: "Healthy",
    services: ["SEO", "Content", "GBP"],
    startDate: "2022-07-20",
    location: "Atlanta, GA",
    lastHealthReview: "2025-06-07",
    healthScore: {
      projectHealth: 84, communicationHealth: 86, billingHealth: 98,
      reportingHealth: 80, callIntelligence: 82, escalationHealth: 98,
      clientEngagement: 85, overall: 87,
    },
    projectSignals: {
      milestoneCompletion: 86, taskCompletion: 84, blockedTasks: 0,
      delayedDeliverables: 0, openDependencies: 0, projectRiskScore: 10,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-05", daysSinceContact: 3, avgResponseTimeHours: 5,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Bi-Weekly",
      communicationScore: 86, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 58, qualifiedLeads: 42, bookedLeads: 36, missedOpportunities: 3,
      complaintTrends: 0, serviceRequests: 6, renewalSignals: 2, upsellSignals: 2,
      callSentiment: "Positive", leadQualityTrend: "Stable", callQualityScore: 82,
    },
    reportingSignals: {
      reportsDelivered: 9, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 80, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 98, billingStatus: "Current",
      mrr: 3400, arr: 40800,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 98,
    },
    engagementSignals: {
      meetingAttendance: 88, communicationFrequency: "High", responseRate: 86,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 85, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 8, riskLevel: "Low", contractEndDate: "2025-07-20",
      daysToRenewal: 41, clientSentiment: "Positive",
      recommendedActions: ["Close renewal this month", "Present content expansion alongside renewal"],
    },
    expansionOpportunity: {
      opportunityScore: 80, recommendedServices: ["Content Scale", "Email Marketing"],
      revenuePotential: 800, confidenceScore: 80,
      reason: "Client is ready for content expansion. Budget confirmed for email marketing.",
      recommendedActions: ["Close content expansion at renewal", "Deliver email marketing proposal"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Bright Dental Studio is a long-standing, high-performing account with renewal in 41 days and confirmed expansion budget.",
      healthAssessment: "All signals are healthy. Clean billing, strong engagement, no escalations.",
      risks: ["Renewal must be closed in 41 days"],
      growthOpportunities: ["Content scale and email marketing — budget confirmed"],
      renewalSignals: "Client has expressed renewal intent. Close by July 1.",
      expansionSignals: "Email marketing expansion is confirmed. Close alongside renewal.",
      communicationSummary: "Excellent communication. Client is a long-term partner.",
      recommendedActions: ["Close renewal by July 1", "Execute content expansion", "Start email marketing program"],
    },
    commHistory: [
      { date: "2025-06-05", type: "Meeting", summary: "Renewal and expansion discussion. Client confirmed email marketing budget.", by: "Maria Santos", sentiment: "Positive" },
    ],
  },

  // ─── 13 CloudPath Tech ───────────────────────────────────────────────────────
  {
    clientId: "ch13",
    client: "CloudPath Tech",
    industry: "Technology",
    accountManager: "Maria Santos",
    healthStatus: "Healthy",
    services: ["SEO", "Content", "PPC", "Reporting"],
    startDate: "2023-01-01",
    location: "San Francisco, CA",
    lastHealthReview: "2025-06-08",
    healthScore: {
      projectHealth: 95, communicationHealth: 96, billingHealth: 100,
      reportingHealth: 94, callIntelligence: 92, escalationHealth: 100,
      clientEngagement: 96, overall: 96,
    },
    projectSignals: {
      milestoneCompletion: 96, taskCompletion: 94, blockedTasks: 0,
      delayedDeliverables: 0, openDependencies: 0, projectRiskScore: 4,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-07", daysSinceContact: 1, avgResponseTimeHours: 1,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Weekly",
      communicationScore: 96, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 112, qualifiedLeads: 88, bookedLeads: 74, missedOpportunities: 2,
      complaintTrends: 0, serviceRequests: 14, renewalSignals: 4, upsellSignals: 5,
      callSentiment: "Positive", leadQualityTrend: "Improving", callQualityScore: 92,
    },
    reportingSignals: {
      reportsDelivered: 17, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 94, lastReportDate: "2025-06-05",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 100, billingStatus: "Current",
      mrr: 9800, arr: 117600,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 100,
    },
    engagementSignals: {
      meetingAttendance: 98, communicationFrequency: "High", responseRate: 98,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 96, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 2, riskLevel: "Low", contractEndDate: "2025-12-31",
      daysToRenewal: 205, clientSentiment: "Positive",
      recommendedActions: ["Maintain excellent service", "Present LinkedIn Ads Phase 2"],
    },
    expansionOpportunity: {
      opportunityScore: 98, recommendedServices: ["LinkedIn Ads Phase 2", "Marketing Automation"],
      revenuePotential: 4800, confidenceScore: 98,
      reason: "Flagship client with approved LinkedIn Ads program. Phase 2 already in discussion.",
      recommendedActions: ["Launch LinkedIn Ads July 1", "Scope Marketing Automation for Q3"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "CloudPath Tech is the flagship account in the portfolio with near-perfect health scores and a confirmed $4,800 expansion program launching in July.",
      healthAssessment: "All signals are perfect or near-perfect. This account is the benchmark for client success.",
      risks: ["No risk signals detected."],
      growthOpportunities: ["LinkedIn Ads Phase 2 launching July 1", "Marketing Automation scoping for Q3"],
      renewalSignals: "Multiple strong renewal signals. Renewal is not at risk.",
      expansionSignals: "LinkedIn Ads confirmed and launching. Phase 2 expansion already in discussion.",
      communicationSummary: "Weekly meetings with same-day response times. Exceptional client relationship.",
      recommendedActions: ["Launch LinkedIn Ads July 1", "Scope Marketing Automation", "Present Q3 expansion roadmap"],
    },
    commHistory: [
      { date: "2025-06-07", type: "Meeting", summary: "Weekly sync. LinkedIn Ads launch confirmed for July 1. Q3 roadmap discussed.", by: "Maria Santos", sentiment: "Positive" },
      { date: "2025-05-30", type: "Meeting", summary: "Q2 results review. Record MRR quarter. Budget increase approved.", by: "Maria Santos", sentiment: "Positive" },
    ],
  },

  // ─── 14 GreenLeaf Gardens ───────────────────────────────────────────────────
  {
    clientId: "ch14",
    client: "GreenLeaf Gardens",
    industry: "Landscaping",
    accountManager: "James Park",
    healthStatus: "Monitor",
    services: ["SEO", "GBP"],
    startDate: "2024-09-05",
    location: "Portland, OR",
    lastHealthReview: "2025-06-04",
    healthScore: {
      projectHealth: 55, communicationHealth: 58, billingHealth: 78,
      reportingHealth: 50, callIntelligence: 52, escalationHealth: 80,
      clientEngagement: 50, overall: 60,
    },
    projectSignals: {
      milestoneCompletion: 55, taskCompletion: 58, blockedTasks: 1,
      delayedDeliverables: 2, openDependencies: 1, projectRiskScore: 44,
      departmentDelays: ["SEO & Local"], projectStatus: "Monitor",
    },
    communicationSignals: {
      lastContact: "2025-05-28", daysSinceContact: 11, avgResponseTimeHours: 30,
      pendingFollowUps: 2, openConcerns: 1, meetingFrequency: "Monthly",
      communicationScore: 58, communicationStatus: "Weak",
    },
    callIntelSignals: {
      totalCalls: 22, qualifiedLeads: 12, bookedLeads: 8, missedOpportunities: 5,
      complaintTrends: 0, serviceRequests: 3, renewalSignals: 0, upsellSignals: 0,
      callSentiment: "Neutral", leadQualityTrend: "Stable", callQualityScore: 52,
    },
    reportingSignals: {
      reportsDelivered: 5, reportsMissed: 2, reviewStatus: "Not Reviewed",
      clientFeedback: "None", reportingScore: 50, lastReportDate: "2025-05-05",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 78, billingStatus: "Current",
      mrr: 1800, arr: 21600,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 80,
    },
    engagementSignals: {
      meetingAttendance: 55, communicationFrequency: "Low", responseRate: 52,
      projectParticipation: "Passive", reviewParticipation: "None",
      engagementScore: 50, engagementStatus: "Low",
    },
    renewalRisk: {
      riskScore: 42, riskLevel: "Medium", contractEndDate: "2025-09-05",
      daysToRenewal: 88, clientSentiment: "Neutral",
      recommendedActions: ["Re-engage client", "Deliver missed reports before renewal", "Book check-in call"],
    },
    expansionOpportunity: {
      opportunityScore: 30, recommendedServices: ["Google Ads"],
      revenuePotential: 400, confidenceScore: 30,
      reason: "Needs engagement improvement before expansion is viable.",
      recommendedActions: ["Improve engagement first"],
      hasOpportunity: false,
    },
    aiSummary: {
      overview: "GreenLeaf Gardens is a newer account that has fallen into low engagement. Two missed reports and the client has not reviewed recent work.",
      healthAssessment: "Account is in the monitor zone with low engagement as the primary concern.",
      risks: ["Two missed reports", "Low client engagement", "Renewal in 88 days"],
      growthOpportunities: [],
      renewalSignals: "No positive signals yet. Engagement must improve before renewal conversation.",
      expansionSignals: "No expansion signals.",
      communicationSummary: "Client is slow to respond and has not attended recent check-ins.",
      recommendedActions: ["Deliver missed reports immediately", "Book re-engagement call", "Set clear renewal timeline"],
    },
    commHistory: [
      { date: "2025-05-28", type: "Email", summary: "Follow-up sent. No response to reporting review request.", by: "James Park", sentiment: "Neutral" },
    ],
  },

  // ─── 15 Harbor Eye Care ──────────────────────────────────────────────────────
  {
    clientId: "ch15",
    client: "Harbor Eye Care",
    industry: "Optometry",
    accountManager: "Tina Webb",
    healthStatus: "Monitor",
    services: ["SEO", "PPC"],
    startDate: "2023-10-05",
    location: "Boston, MA",
    lastHealthReview: "2025-06-03",
    healthScore: {
      projectHealth: 66, communicationHealth: 68, billingHealth: 85,
      reportingHealth: 62, callIntelligence: 65, escalationHealth: 82,
      clientEngagement: 64, overall: 70,
    },
    projectSignals: {
      milestoneCompletion: 68, taskCompletion: 66, blockedTasks: 0,
      delayedDeliverables: 2, openDependencies: 0, projectRiskScore: 32,
      departmentDelays: [], projectStatus: "Monitor",
    },
    communicationSignals: {
      lastContact: "2025-05-30", daysSinceContact: 9, avgResponseTimeHours: 20,
      pendingFollowUps: 1, openConcerns: 0, meetingFrequency: "Monthly",
      communicationScore: 68, communicationStatus: "Good",
    },
    callIntelSignals: {
      totalCalls: 38, qualifiedLeads: 24, bookedLeads: 19, missedOpportunities: 5,
      complaintTrends: 0, serviceRequests: 4, renewalSignals: 0, upsellSignals: 1,
      callSentiment: "Neutral", leadQualityTrend: "Stable", callQualityScore: 65,
    },
    reportingSignals: {
      reportsDelivered: 7, reportsMissed: 1, reviewStatus: "Pending Review",
      clientFeedback: "Neutral", reportingScore: 62, lastReportDate: "2025-05-15",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 85, billingStatus: "Current",
      mrr: 2800, arr: 33600,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 5,
      departmentsInvolved: [], escalationScore: 82,
    },
    engagementSignals: {
      meetingAttendance: 68, communicationFrequency: "Medium", responseRate: 64,
      projectParticipation: "Moderate", reviewParticipation: "Passive",
      engagementScore: 64, engagementStatus: "Medium",
    },
    renewalRisk: {
      riskScore: 28, riskLevel: "Low", contractEndDate: "2025-10-05",
      daysToRenewal: 117, clientSentiment: "Neutral",
      recommendedActions: ["Improve reporting", "Start renewal conversation in August"],
    },
    expansionOpportunity: {
      opportunityScore: 55, recommendedServices: ["GBP", "Reputation Management"],
      revenuePotential: 700, confidenceScore: 55,
      reason: "GBP optimization would improve local visibility for this optometry practice.",
      recommendedActions: ["Propose GBP add-on at next check-in"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Harbor Eye Care is a stable monitor account with adequate performance and a GBP expansion opportunity.",
      healthAssessment: "Account is steady. One missed report and two delayed deliverables are minor concerns.",
      risks: ["One missed report", "Two delayed deliverables"],
      growthOpportunities: ["GBP and reputation management"],
      renewalSignals: "No signals yet. Renewal is 117 days away.",
      expansionSignals: "GBP is a natural fit for local optometry.",
      communicationSummary: "Client communicates monthly. Moderate engagement.",
      recommendedActions: ["Deliver missed report", "Propose GBP add-on", "Begin renewal prep in August"],
    },
    commHistory: [
      { date: "2025-05-30", type: "Email", summary: "Monthly check-in sent. Awaiting report review.", by: "Tina Webb", sentiment: "Neutral" },
    ],
  },

  // ─── 16 Coastal Plumbing Co. ─────────────────────────────────────────────────
  {
    clientId: "ch16",
    client: "Coastal Plumbing Co.",
    industry: "Plumbing",
    accountManager: "Sarah Chen",
    healthStatus: "Healthy",
    services: ["SEO", "Meta Ads", "GBP", "LSA"],
    startDate: "2023-03-15",
    location: "Miami, FL",
    lastHealthReview: "2025-06-07",
    healthScore: {
      projectHealth: 90, communicationHealth: 91, billingHealth: 100,
      reportingHealth: 86, callIntelligence: 89, escalationHealth: 100,
      clientEngagement: 91, overall: 93,
    },
    projectSignals: {
      milestoneCompletion: 92, taskCompletion: 90, blockedTasks: 0,
      delayedDeliverables: 0, openDependencies: 0, projectRiskScore: 7,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-06", daysSinceContact: 2, avgResponseTimeHours: 3,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Bi-Weekly",
      communicationScore: 91, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 88, qualifiedLeads: 68, bookedLeads: 56, missedOpportunities: 3,
      complaintTrends: 0, serviceRequests: 10, renewalSignals: 2, upsellSignals: 3,
      callSentiment: "Positive", leadQualityTrend: "Improving", callQualityScore: 89,
    },
    reportingSignals: {
      reportsDelivered: 14, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 86, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 100, billingStatus: "Current",
      mrr: 4500, arr: 54000,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 100,
    },
    engagementSignals: {
      meetingAttendance: 92, communicationFrequency: "High", responseRate: 92,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 91, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 6, riskLevel: "Low", contractEndDate: "2026-03-15",
      daysToRenewal: 278, clientSentiment: "Positive",
      recommendedActions: ["Maintain service excellence", "Present Emergency Services Ads"],
    },
    expansionOpportunity: {
      opportunityScore: 88, recommendedServices: ["PPC Emergency", "LSA Scale"],
      revenuePotential: 1000, confidenceScore: 88,
      reason: "High-intent emergency search traffic. PPC plus LSA combo can capture more market share.",
      recommendedActions: ["Present emergency services PPC proposal", "Scale LSA budget"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Coastal Plumbing Co. is a top-performing account with exceptional engagement and strong expansion potential through emergency services advertising.",
      healthAssessment: "All signals are healthy. No risks or escalations.",
      risks: ["No risk signals detected."],
      growthOpportunities: ["Emergency Services PPC + LSA scale"],
      renewalSignals: "Renewal is 278 days away. No risk.",
      expansionSignals: "Emergency services ads is a high-confidence expansion opportunity.",
      communicationSummary: "Bi-weekly communication with excellent responsiveness.",
      recommendedActions: ["Present emergency services proposal", "Scale LSA budget"],
    },
    commHistory: [
      { date: "2025-06-06", type: "Call", summary: "Monthly review. Record lead volume. Emergency ads discussed.", by: "Sarah Chen", sentiment: "Positive" },
    ],
  },

  // ─── 17 Peak Performance HVAC ────────────────────────────────────────────────
  {
    clientId: "ch17",
    client: "Peak Performance HVAC",
    industry: "HVAC",
    accountManager: "James Park",
    healthStatus: "Critical",
    services: ["Meta Ads", "PPC", "Reporting"],
    startDate: "2022-09-01",
    location: "Phoenix, AZ",
    lastHealthReview: "2025-06-07",
    healthScore: {
      projectHealth: 38, communicationHealth: 22, billingHealth: 70,
      reportingHealth: 20, callIntelligence: 40, escalationHealth: 45,
      clientEngagement: 15, overall: 36,
    },
    projectSignals: {
      milestoneCompletion: 42, taskCompletion: 40, blockedTasks: 2,
      delayedDeliverables: 5, openDependencies: 1, projectRiskScore: 74,
      departmentDelays: ["Reporting", "Paid Ads"], projectStatus: "Delayed",
    },
    communicationSignals: {
      lastContact: "2025-05-13", daysSinceContact: 26, avgResponseTimeHours: 96,
      pendingFollowUps: 4, openConcerns: 3, meetingFrequency: "None",
      communicationScore: 22, communicationStatus: "Poor",
    },
    callIntelSignals: {
      totalCalls: 30, qualifiedLeads: 14, bookedLeads: 9, missedOpportunities: 10,
      complaintTrends: 3, serviceRequests: 2, renewalSignals: 0, upsellSignals: 0,
      callSentiment: "Negative", leadQualityTrend: "Declining", callQualityScore: 40,
    },
    reportingSignals: {
      reportsDelivered: 5, reportsMissed: 3, reviewStatus: "Overdue",
      clientFeedback: "Negative", reportingScore: 20, lastReportDate: "2025-04-01",
    },
    billingSignals: {
      outstandingInvoices: 1, daysOverdue: 8, billingHolds: false,
      collectionActivity: false, billingScore: 70, billingStatus: "Overdue",
      mrr: 6200, arr: 74400,
    },
    escalationSignals: {
      openEscalations: 2, escalationSeverity: "High", avgResolutionDays: 20,
      departmentsInvolved: ["Reporting", "Paid Ads", "Account Management"],
      escalationScore: 45,
    },
    engagementSignals: {
      meetingAttendance: 15, communicationFrequency: "None", responseRate: 18,
      projectParticipation: "Unresponsive", reviewParticipation: "None",
      engagementScore: 15, engagementStatus: "Unresponsive",
    },
    renewalRisk: {
      riskScore: 92, riskLevel: "High", contractEndDate: "2025-09-01",
      daysToRenewal: 85, clientSentiment: "Negative",
      recommendedActions: ["Immediate executive intervention call", "Deliver all overdue reports", "Create recovery plan"],
    },
    expansionOpportunity: {
      opportunityScore: 0, recommendedServices: [],
      revenuePotential: 0, confidenceScore: 0,
      reason: "Account is critical. No expansion until stabilization.",
      recommendedActions: ["Stabilize account first"],
      hasOpportunity: false,
    },
    aiSummary: {
      overview: "Peak Performance HVAC is in critical condition. No contact in 26 days, three overdue reports, two active escalations, and renewal at risk in 85 days.",
      healthAssessment: "Account is failing across communication, reporting, and engagement. Billing has a minor overdue invoice. High risk of churn.",
      risks: ["No contact in 26 days", "Three overdue reports", "Two active escalations", "Renewal at risk in 85 days", "Billing overdue"],
      growthOpportunities: [],
      renewalSignals: "No positive signals. Churn likely without immediate executive intervention.",
      expansionSignals: "No expansion signals.",
      communicationSummary: "No contact in 26 days. Four unanswered follow-ups. Account manager has escalated to director.",
      recommendedActions: ["Executive call this week — no delay", "Deliver all overdue reports", "Create formal recovery plan", "Weekly check-in until resolved"],
    },
    commHistory: [
      { date: "2025-05-28", type: "Follow-Up", summary: "Fourth unanswered follow-up. Escalated to director.", by: "James Park", sentiment: "Neutral" },
      { date: "2025-05-13", type: "Call", summary: "Brief call. Client complained about missed reports. Cut call short.", by: "James Park", sentiment: "Negative" },
    ],
  },

  // ─── 18 Elite Carpet Cleaners ────────────────────────────────────────────────
  {
    clientId: "ch18",
    client: "Elite Carpet Cleaners",
    industry: "Cleaning",
    accountManager: "Maria Santos",
    healthStatus: "Healthy",
    services: ["GBP", "SEO"],
    startDate: "2024-02-01",
    location: "Nashville, TN",
    lastHealthReview: "2025-06-04",
    healthScore: {
      projectHealth: 74, communicationHealth: 76, billingHealth: 92,
      reportingHealth: 70, callIntelligence: 72, escalationHealth: 92,
      clientEngagement: 74, overall: 78,
    },
    projectSignals: {
      milestoneCompletion: 75, taskCompletion: 74, blockedTasks: 0,
      delayedDeliverables: 1, openDependencies: 0, projectRiskScore: 22,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-01", daysSinceContact: 7, avgResponseTimeHours: 14,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Monthly",
      communicationScore: 76, communicationStatus: "Good",
    },
    callIntelSignals: {
      totalCalls: 36, qualifiedLeads: 24, bookedLeads: 20, missedOpportunities: 3,
      complaintTrends: 0, serviceRequests: 4, renewalSignals: 1, upsellSignals: 1,
      callSentiment: "Positive", leadQualityTrend: "Stable", callQualityScore: 72,
    },
    reportingSignals: {
      reportsDelivered: 4, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 70, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 92, billingStatus: "Current",
      mrr: 1600, arr: 19200,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 92,
    },
    engagementSignals: {
      meetingAttendance: 76, communicationFrequency: "Medium", responseRate: 74,
      projectParticipation: "Active", reviewParticipation: "Moderate",
      engagementScore: 74, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 18, riskLevel: "Low", contractEndDate: "2026-02-01",
      daysToRenewal: 236, clientSentiment: "Positive",
      recommendedActions: ["Maintain current service level", "Propose Google Ads trial"],
    },
    expansionOpportunity: {
      opportunityScore: 62, recommendedServices: ["Google Ads", "Reviews Management"],
      revenuePotential: 500, confidenceScore: 62,
      reason: "Strong GBP performance. Google Ads and reviews management would amplify local presence.",
      recommendedActions: ["Present Google Ads trial proposal"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Elite Carpet Cleaners is a healthy newer account with clean billing and good engagement.",
      healthAssessment: "All signals are positive. Account is on a good growth trajectory.",
      risks: ["No significant risks."],
      growthOpportunities: ["Google Ads trial", "Reviews management"],
      renewalSignals: "Renewal is 236 days away. Positive sentiment.",
      expansionSignals: "Google Ads is a natural expansion for this local service brand.",
      communicationSummary: "Monthly communication with good responsiveness.",
      recommendedActions: ["Propose Google Ads trial", "Maintain GBP optimization"],
    },
    commHistory: [
      { date: "2025-06-01", type: "Email", summary: "Monthly update. Client happy with GBP results.", by: "Maria Santos", sentiment: "Positive" },
    ],
  },

  // ─── 19 Summit Roofing Group ─────────────────────────────────────────────────
  {
    clientId: "ch19",
    client: "Summit Roofing Group",
    industry: "Roofing",
    accountManager: "Maria Santos",
    healthStatus: "Critical",
    services: ["LSA", "PPC", "GBP"],
    startDate: "2023-06-01",
    location: "Dallas, TX",
    lastHealthReview: "2025-06-06",
    healthScore: {
      projectHealth: 22, communicationHealth: 30, billingHealth: 35,
      reportingHealth: 28, callIntelligence: 30, escalationHealth: 15,
      clientEngagement: 20, overall: 26,
    },
    projectSignals: {
      milestoneCompletion: 25, taskCompletion: 28, blockedTasks: 4,
      delayedDeliverables: 5, openDependencies: 3, projectRiskScore: 90,
      departmentDelays: ["PPC", "LSA", "GBP"], projectStatus: "Blocked",
    },
    communicationSignals: {
      lastContact: "2025-06-02", daysSinceContact: 6, avgResponseTimeHours: 48,
      pendingFollowUps: 2, openConcerns: 3, meetingFrequency: "Infrequent",
      communicationScore: 30, communicationStatus: "Poor",
    },
    callIntelSignals: {
      totalCalls: 24, qualifiedLeads: 6, bookedLeads: 4, missedOpportunities: 15,
      complaintTrends: 5, serviceRequests: 2, renewalSignals: 0, upsellSignals: 0,
      callSentiment: "Negative", leadQualityTrend: "Declining", callQualityScore: 30,
    },
    reportingSignals: {
      reportsDelivered: 4, reportsMissed: 4, reviewStatus: "Overdue",
      clientFeedback: "Negative", reportingScore: 28, lastReportDate: "2025-04-01",
    },
    billingSignals: {
      outstandingInvoices: 2, daysOverdue: 30, billingHolds: false,
      collectionActivity: true, billingScore: 35, billingStatus: "Overdue",
      mrr: 5100, arr: 61200,
    },
    escalationSignals: {
      openEscalations: 3, escalationSeverity: "Critical", avgResolutionDays: 30,
      departmentsInvolved: ["PPC", "LSA", "Finance", "Account Management"],
      escalationScore: 15,
    },
    engagementSignals: {
      meetingAttendance: 20, communicationFrequency: "Low", responseRate: 22,
      projectParticipation: "Unresponsive", reviewParticipation: "None",
      engagementScore: 20, engagementStatus: "Unresponsive",
    },
    renewalRisk: {
      riskScore: 99, riskLevel: "Critical", contractEndDate: "2025-08-01",
      daysToRenewal: 53, clientSentiment: "Negative",
      recommendedActions: ["Cancellation submitted — save attempt in progress", "Director escalation required"],
    },
    expansionOpportunity: {
      opportunityScore: 0, recommendedServices: [],
      revenuePotential: 0, confidenceScore: 0,
      reason: "Cancellation submitted. No expansion consideration.",
      recommendedActions: ["Save attempt in progress"],
      hasOpportunity: false,
    },
    aiSummary: {
      overview: "Summit Roofing Group has submitted a cancellation request citing budget disputes and poor lead volume. Director intervention is in progress.",
      healthAssessment: "Account is in the worst possible state. All signals critical. Cancellation active.",
      risks: ["Cancellation submitted", "Billing 30 days overdue", "Three critical escalations", "Four missed reports", "Renewal in 53 days"],
      growthOpportunities: [],
      renewalSignals: "Cancellation submitted. Renewal is not the current priority.",
      expansionSignals: "No expansion signals.",
      communicationSummary: "Client is hostile. Three open concerns. Director is primary point of contact.",
      recommendedActions: ["Director leads save attempt", "Resolve billing immediately", "Formal remediation plan", "Weekly executive check-in"],
    },
    commHistory: [
      { date: "2025-06-02", type: "Call", summary: "Director call. Client threatened to cancel immediately. Save attempt initiated.", by: "Maria Santos", sentiment: "Negative" },
      { date: "2025-05-20", type: "Meeting", summary: "Emergency meeting. Client raised lead volume complaints and budget disputes.", by: "Maria Santos", sentiment: "Negative" },
    ],
  },

  // ─── 20 Luxe Dental Spa ──────────────────────────────────────────────────────
  {
    clientId: "ch20",
    client: "Luxe Dental Spa",
    industry: "Dental",
    accountManager: "Sarah Chen",
    healthStatus: "Healthy",
    services: ["SEO", "Content", "Design"],
    startDate: "2024-01-10",
    location: "Beverly Hills, CA",
    lastHealthReview: "2025-06-06",
    healthScore: {
      projectHealth: 88, communicationHealth: 89, billingHealth: 100,
      reportingHealth: 84, callIntelligence: 86, escalationHealth: 100,
      clientEngagement: 88, overall: 91,
    },
    projectSignals: {
      milestoneCompletion: 90, taskCompletion: 88, blockedTasks: 0,
      delayedDeliverables: 0, openDependencies: 0, projectRiskScore: 8,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-04", daysSinceContact: 4, avgResponseTimeHours: 4,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Bi-Weekly",
      communicationScore: 89, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 72, qualifiedLeads: 54, bookedLeads: 44, missedOpportunities: 3,
      complaintTrends: 0, serviceRequests: 8, renewalSignals: 2, upsellSignals: 3,
      callSentiment: "Positive", leadQualityTrend: "Improving", callQualityScore: 86,
    },
    reportingSignals: {
      reportsDelivered: 5, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 84, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 100, billingStatus: "Current",
      mrr: 3800, arr: 45600,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 100,
    },
    engagementSignals: {
      meetingAttendance: 90, communicationFrequency: "High", responseRate: 90,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 88, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 8, riskLevel: "Low", contractEndDate: "2026-01-10",
      daysToRenewal: 215, clientSentiment: "Positive",
      recommendedActions: ["Maintain service excellence", "Present PPC add-on"],
    },
    expansionOpportunity: {
      opportunityScore: 82, recommendedServices: ["PPC", "Reputation Management"],
      revenuePotential: 1200, confidenceScore: 82,
      reason: "High-end dental spa in Beverly Hills. PPC and reputation management would amplify brand.",
      recommendedActions: ["Present PPC and reputation management package"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Luxe Dental Spa is a premium account with excellent performance and strong expansion potential in PPC and reputation management.",
      healthAssessment: "All signals are healthy. Top-tier account with clean billing and high engagement.",
      risks: ["No risk signals."],
      growthOpportunities: ["PPC expansion", "Reputation management"],
      renewalSignals: "Renewal is 215 days away. Positive sentiment.",
      expansionSignals: "PPC and reputation management is a high-confidence opportunity for this premium brand.",
      communicationSummary: "Excellent communication cadence. Client is highly engaged.",
      recommendedActions: ["Present PPC expansion package", "Add reputation management"],
    },
    commHistory: [
      { date: "2025-06-04", type: "Meeting", summary: "Performance review. Record patient bookings. PPC discussed.", by: "Sarah Chen", sentiment: "Positive" },
    ],
  },

  // ─── 21 TrueGrit Construction ────────────────────────────────────────────────
  {
    clientId: "ch21",
    client: "TrueGrit Construction",
    industry: "Construction",
    accountManager: "James Park",
    healthStatus: "Monitor",
    services: ["SEO", "PPC"],
    startDate: "2023-11-30",
    location: "Charlotte, NC",
    lastHealthReview: "2025-06-04",
    healthScore: {
      projectHealth: 68, communicationHealth: 70, billingHealth: 88,
      reportingHealth: 64, callIntelligence: 66, escalationHealth: 84,
      clientEngagement: 66, overall: 72,
    },
    projectSignals: {
      milestoneCompletion: 70, taskCompletion: 68, blockedTasks: 0,
      delayedDeliverables: 2, openDependencies: 0, projectRiskScore: 30,
      departmentDelays: [], projectStatus: "Monitor",
    },
    communicationSignals: {
      lastContact: "2025-05-29", daysSinceContact: 10, avgResponseTimeHours: 22,
      pendingFollowUps: 1, openConcerns: 0, meetingFrequency: "Monthly",
      communicationScore: 70, communicationStatus: "Good",
    },
    callIntelSignals: {
      totalCalls: 42, qualifiedLeads: 28, bookedLeads: 22, missedOpportunities: 6,
      complaintTrends: 0, serviceRequests: 5, renewalSignals: 1, upsellSignals: 1,
      callSentiment: "Neutral", leadQualityTrend: "Stable", callQualityScore: 66,
    },
    reportingSignals: {
      reportsDelivered: 7, reportsMissed: 1, reviewStatus: "Pending Review",
      clientFeedback: "Neutral", reportingScore: 64, lastReportDate: "2025-05-20",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 88, billingStatus: "Current",
      mrr: 2400, arr: 28800,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 5,
      departmentsInvolved: [], escalationScore: 84,
    },
    engagementSignals: {
      meetingAttendance: 68, communicationFrequency: "Medium", responseRate: 66,
      projectParticipation: "Moderate", reviewParticipation: "Moderate",
      engagementScore: 66, engagementStatus: "Medium",
    },
    renewalRisk: {
      riskScore: 26, riskLevel: "Low", contractEndDate: "2025-11-30",
      daysToRenewal: 173, clientSentiment: "Neutral",
      recommendedActions: ["Improve reporting cadence", "Begin renewal conversation in October"],
    },
    expansionOpportunity: {
      opportunityScore: 58, recommendedServices: ["LSA"],
      revenuePotential: 700, confidenceScore: 58,
      reason: "Construction industry is well-suited for LSA. High-intent local search.",
      recommendedActions: ["Present LSA proposal"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "TrueGrit Construction is a stable monitor account with adequate performance. One missed report is the primary concern.",
      healthAssessment: "Account is steady. Billing is clean and no escalations exist.",
      risks: ["One missed report", "Two deliverable delays"],
      growthOpportunities: ["LSA expansion"],
      renewalSignals: "Renewal is 173 days away. No immediate risk.",
      expansionSignals: "LSA is a good fit for this construction company.",
      communicationSummary: "Monthly communication. Client is moderately engaged.",
      recommendedActions: ["Deliver missed report", "Present LSA proposal", "Begin renewal prep in October"],
    },
    commHistory: [
      { date: "2025-05-29", type: "Email", summary: "Monthly update sent. Pending report review follow-up.", by: "James Park", sentiment: "Neutral" },
    ],
  },

  // ─── 22 FlowState Yoga Studio ────────────────────────────────────────────────
  {
    clientId: "ch22",
    client: "FlowState Yoga Studio",
    industry: "Fitness",
    accountManager: "Tina Webb",
    healthStatus: "Healthy",
    services: ["Meta Ads", "GBP"],
    startDate: "2024-01-01",
    location: "Portland, OR",
    lastHealthReview: "2025-06-03",
    healthScore: {
      projectHealth: 80, communicationHealth: 82, billingHealth: 96,
      reportingHealth: 76, callIntelligence: 78, escalationHealth: 96,
      clientEngagement: 80, overall: 84,
    },
    projectSignals: {
      milestoneCompletion: 82, taskCompletion: 80, blockedTasks: 0,
      delayedDeliverables: 0, openDependencies: 0, projectRiskScore: 14,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-01", daysSinceContact: 7, avgResponseTimeHours: 10,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Monthly",
      communicationScore: 82, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 30, qualifiedLeads: 20, bookedLeads: 16, missedOpportunities: 3,
      complaintTrends: 0, serviceRequests: 4, renewalSignals: 1, upsellSignals: 2,
      callSentiment: "Positive", leadQualityTrend: "Stable", callQualityScore: 78,
    },
    reportingSignals: {
      reportsDelivered: 5, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 76, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 96, billingStatus: "Current",
      mrr: 1400, arr: 16800,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 96,
    },
    engagementSignals: {
      meetingAttendance: 82, communicationFrequency: "Medium", responseRate: 80,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 80, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 14, riskLevel: "Low", contractEndDate: "2026-01-01",
      daysToRenewal: 206, clientSentiment: "Positive",
      recommendedActions: ["Begin renewal conversation in November", "Propose SEO add-on"],
    },
    expansionOpportunity: {
      opportunityScore: 68, recommendedServices: ["SEO", "Content"],
      revenuePotential: 600, confidenceScore: 68,
      reason: "Growing studio with engaged community. SEO and content would build organic presence.",
      recommendedActions: ["Present SEO and content package"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "FlowState Yoga Studio is a healthy account with strong engagement and a SEO/content expansion opportunity.",
      healthAssessment: "All signals are positive. Clean billing and excellent engagement for a smaller account.",
      risks: ["No risks detected."],
      growthOpportunities: ["SEO and content marketing expansion"],
      renewalSignals: "Positive sentiment. Renewal is 206 days away.",
      expansionSignals: "SEO and content would be a natural growth path for this studio.",
      communicationSummary: "Monthly communication with good engagement.",
      recommendedActions: ["Present SEO expansion", "Maintain Meta Ads performance"],
    },
    commHistory: [
      { date: "2025-06-01", type: "Email", summary: "Monthly check-in. Client happy with class bookings from Meta Ads.", by: "Tina Webb", sentiment: "Positive" },
    ],
  },

  // ─── 23 BrightPath Tutoring ──────────────────────────────────────────────────
  {
    clientId: "ch23",
    client: "BrightPath Tutoring",
    industry: "Education",
    accountManager: "Sarah Chen",
    healthStatus: "Monitor",
    services: ["SEO", "PPC", "Content"],
    startDate: "2024-02-15",
    location: "Chicago, IL",
    lastHealthReview: "2025-06-04",
    healthScore: {
      projectHealth: 60, communicationHealth: 62, billingHealth: 84,
      reportingHealth: 56, callIntelligence: 58, escalationHealth: 78,
      clientEngagement: 58, overall: 64,
    },
    projectSignals: {
      milestoneCompletion: 62, taskCompletion: 60, blockedTasks: 1,
      delayedDeliverables: 2, openDependencies: 1, projectRiskScore: 40,
      departmentDelays: ["Content"], projectStatus: "Monitor",
    },
    communicationSignals: {
      lastContact: "2025-05-28", daysSinceContact: 11, avgResponseTimeHours: 28,
      pendingFollowUps: 1, openConcerns: 1, meetingFrequency: "Monthly",
      communicationScore: 62, communicationStatus: "Weak",
    },
    callIntelSignals: {
      totalCalls: 26, qualifiedLeads: 14, bookedLeads: 10, missedOpportunities: 6,
      complaintTrends: 0, serviceRequests: 3, renewalSignals: 0, upsellSignals: 1,
      callSentiment: "Neutral", leadQualityTrend: "Stable", callQualityScore: 58,
    },
    reportingSignals: {
      reportsDelivered: 4, reportsMissed: 1, reviewStatus: "Not Reviewed",
      clientFeedback: "Neutral", reportingScore: 56, lastReportDate: "2025-05-10",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 84, billingStatus: "Current",
      mrr: 2200, arr: 26400,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 78,
    },
    engagementSignals: {
      meetingAttendance: 62, communicationFrequency: "Low", responseRate: 58,
      projectParticipation: "Moderate", reviewParticipation: "Passive",
      engagementScore: 58, engagementStatus: "Medium",
    },
    renewalRisk: {
      riskScore: 38, riskLevel: "Medium", contractEndDate: "2025-08-15",
      daysToRenewal: 67, clientSentiment: "Neutral",
      recommendedActions: ["Book renewal conversation", "Resolve content delay", "Deliver missed report"],
    },
    expansionOpportunity: {
      opportunityScore: 48, recommendedServices: ["Email Marketing"],
      revenuePotential: 400, confidenceScore: 48,
      reason: "Educational content pipeline could support email marketing for enrollment drives.",
      recommendedActions: ["Propose email marketing at renewal"],
      hasOpportunity: false,
    },
    aiSummary: {
      overview: "BrightPath Tutoring is a monitor account with renewal approaching in 67 days. Content delays and low engagement need addressing.",
      healthAssessment: "Account is in the monitor zone. Billing is clean but reporting and engagement lag.",
      risks: ["Renewal in 67 days — conversation not started", "Content delay", "One missed report"],
      growthOpportunities: ["Email marketing for enrollment drives"],
      renewalSignals: "No signals yet. Renewal conversation needed urgently.",
      expansionSignals: "Email marketing possible after stabilization.",
      communicationSummary: "Client is slow to engage. One pending follow-up.",
      recommendedActions: ["Start renewal conversation immediately", "Resolve content delay", "Deliver missed report"],
    },
    commHistory: [
      { date: "2025-05-28", type: "Email", summary: "Follow-up sent on content delay and report review. No response.", by: "Sarah Chen", sentiment: "Neutral" },
    ],
  },

  // ─── 24 Harbor View Realty ───────────────────────────────────────────────────
  {
    clientId: "ch24",
    client: "Harbor View Realty",
    industry: "Real Estate",
    accountManager: "James Park",
    healthStatus: "At Risk",
    services: ["SEO", "Meta Ads", "Design", "Content"],
    startDate: "2023-07-01",
    location: "Seattle, WA",
    lastHealthReview: "2025-06-05",
    healthScore: {
      projectHealth: 38, communicationHealth: 42, billingHealth: 75,
      reportingHealth: 45, callIntelligence: 40, escalationHealth: 40,
      clientEngagement: 36, overall: 45,
    },
    projectSignals: {
      milestoneCompletion: 40, taskCompletion: 42, blockedTasks: 3,
      delayedDeliverables: 4, openDependencies: 2, projectRiskScore: 72,
      departmentDelays: ["Design", "Paid Ads"], projectStatus: "Blocked",
    },
    communicationSignals: {
      lastContact: "2025-05-30", daysSinceContact: 9, avgResponseTimeHours: 40,
      pendingFollowUps: 2, openConcerns: 2, meetingFrequency: "Infrequent",
      communicationScore: 42, communicationStatus: "Weak",
    },
    callIntelSignals: {
      totalCalls: 34, qualifiedLeads: 14, bookedLeads: 9, missedOpportunities: 12,
      complaintTrends: 3, serviceRequests: 3, renewalSignals: 0, upsellSignals: 0,
      callSentiment: "Negative", leadQualityTrend: "Declining", callQualityScore: 40,
    },
    reportingSignals: {
      reportsDelivered: 6, reportsMissed: 2, reviewStatus: "Pending Review",
      clientFeedback: "Negative", reportingScore: 45, lastReportDate: "2025-05-01",
    },
    billingSignals: {
      outstandingInvoices: 1, daysOverdue: 10, billingHolds: false,
      collectionActivity: false, billingScore: 75, billingStatus: "Overdue",
      mrr: 7500, arr: 90000,
    },
    escalationSignals: {
      openEscalations: 2, escalationSeverity: "High", avgResolutionDays: 15,
      departmentsInvolved: ["Design", "Paid Ads", "Account Management"],
      escalationScore: 40,
    },
    engagementSignals: {
      meetingAttendance: 38, communicationFrequency: "Low", responseRate: 36,
      projectParticipation: "Passive", reviewParticipation: "Passive",
      engagementScore: 36, engagementStatus: "Low",
    },
    renewalRisk: {
      riskScore: 80, riskLevel: "High", contractEndDate: "2025-07-01",
      daysToRenewal: 22, clientSentiment: "Negative",
      recommendedActions: ["Immediate executive call", "Resolve CRM integration blocker", "Prepare save presentation"],
    },
    expansionOpportunity: {
      opportunityScore: 10, recommendedServices: [],
      revenuePotential: 0, confidenceScore: 10,
      reason: "Account must stabilize before expansion is considered.",
      recommendedActions: ["Resolve escalations first"],
      hasOpportunity: false,
    },
    aiSummary: {
      overview: "Harbor View Realty is at serious risk. Renewal is in 22 days, the CRM integration is stalled, and a VP escalation is in progress. This is the highest MRR at-risk account.",
      healthAssessment: "Project is blocked, billing is overdue, and two active escalations have not been resolved.",
      risks: ["Renewal in 22 days — not renewal-ready", "CRM integration stalled", "VP escalation active", "Billing overdue 10 days", "Two missed reports"],
      growthOpportunities: [],
      renewalSignals: "No positive signals. Account at high risk of non-renewal.",
      expansionSignals: "No expansion signals.",
      communicationSummary: "Client is frustrated. VP is now the primary contact. Two pending follow-ups.",
      recommendedActions: ["Immediate executive call", "Resolve CRM blocker", "Create recovery plan", "Close renewal with concession"],
    },
    commHistory: [
      { date: "2025-05-30", type: "Call", summary: "VP escalation call. Client frustrated with CRM delay and lead tracking.", by: "James Park", sentiment: "Negative" },
      { date: "2025-05-15", type: "Meeting", summary: "Emergency meeting. CRM integration failure discussed. Escalation opened.", by: "James Park", sentiment: "Negative" },
    ],
  },

  // ─── 25 Precision Auto Repair ────────────────────────────────────────────────
  {
    clientId: "ch25",
    client: "Precision Auto Repair",
    industry: "Automotive",
    accountManager: "Maria Santos",
    healthStatus: "Healthy",
    services: ["GBP", "SEO", "Reviews"],
    startDate: "2024-06-01",
    location: "Nashville, TN",
    lastHealthReview: "2025-06-05",
    healthScore: {
      projectHealth: 84, communicationHealth: 85, billingHealth: 100,
      reportingHealth: 80, callIntelligence: 82, escalationHealth: 100,
      clientEngagement: 84, overall: 88,
    },
    projectSignals: {
      milestoneCompletion: 86, taskCompletion: 84, blockedTasks: 0,
      delayedDeliverables: 0, openDependencies: 0, projectRiskScore: 10,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-03", daysSinceContact: 5, avgResponseTimeHours: 7,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Monthly",
      communicationScore: 85, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 50, qualifiedLeads: 36, bookedLeads: 30, missedOpportunities: 3,
      complaintTrends: 0, serviceRequests: 5, renewalSignals: 1, upsellSignals: 2,
      callSentiment: "Positive", leadQualityTrend: "Stable", callQualityScore: 82,
    },
    reportingSignals: {
      reportsDelivered: 6, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 80, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 100, billingStatus: "Current",
      mrr: 1800, arr: 21600,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 100,
    },
    engagementSignals: {
      meetingAttendance: 85, communicationFrequency: "Medium", responseRate: 84,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 84, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 10, riskLevel: "Low", contractEndDate: "2026-06-01",
      daysToRenewal: 356, clientSentiment: "Positive",
      recommendedActions: ["Maintain service quality", "Present Google Ads add-on"],
    },
    expansionOpportunity: {
      opportunityScore: 72, recommendedServices: ["Google Ads", "Content"],
      revenuePotential: 600, confidenceScore: 72,
      reason: "Strong GBP and SEO foundation. Google Ads would capture high-intent repair searches.",
      recommendedActions: ["Present Google Ads proposal at next check-in"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Precision Auto Repair is a healthy, well-engaged account with clean billing and a Google Ads expansion opportunity.",
      healthAssessment: "All signals are healthy. Renewal is over a year away.",
      risks: ["No risk signals."],
      growthOpportunities: ["Google Ads for high-intent auto repair searches"],
      renewalSignals: "Renewal is 356 days away. No concern.",
      expansionSignals: "Google Ads is a natural next step.",
      communicationSummary: "Monthly communication with fast response times.",
      recommendedActions: ["Present Google Ads proposal", "Maintain GBP and SEO excellence"],
    },
    commHistory: [
      { date: "2025-06-03", type: "Call", summary: "Monthly check-in. Record GBP views and calls this month.", by: "Maria Santos", sentiment: "Positive" },
    ],
  },

  // ─── 26 Keystone Law Group ───────────────────────────────────────────────────
  {
    clientId: "ch26",
    client: "Keystone Law Group",
    industry: "Legal",
    accountManager: "Tina Webb",
    healthStatus: "Healthy",
    services: ["SEO", "Content", "PPC"],
    startDate: "2022-07-15",
    location: "New York, NY",
    lastHealthReview: "2025-06-06",
    healthScore: {
      projectHealth: 78, communicationHealth: 80, billingHealth: 96,
      reportingHealth: 74, callIntelligence: 76, escalationHealth: 92,
      clientEngagement: 78, overall: 82,
    },
    projectSignals: {
      milestoneCompletion: 80, taskCompletion: 78, blockedTasks: 0,
      delayedDeliverables: 1, openDependencies: 0, projectRiskScore: 18,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-04", daysSinceContact: 4, avgResponseTimeHours: 8,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Bi-Weekly",
      communicationScore: 80, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 58, qualifiedLeads: 40, bookedLeads: 32, missedOpportunities: 4,
      complaintTrends: 0, serviceRequests: 6, renewalSignals: 2, upsellSignals: 2,
      callSentiment: "Positive", leadQualityTrend: "Stable", callQualityScore: 76,
    },
    reportingSignals: {
      reportsDelivered: 14, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 74, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 96, billingStatus: "Current",
      mrr: 4800, arr: 57600,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 4,
      departmentsInvolved: [], escalationScore: 92,
    },
    engagementSignals: {
      meetingAttendance: 80, communicationFrequency: "High", responseRate: 78,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 78, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 12, riskLevel: "Low", contractEndDate: "2025-07-15",
      daysToRenewal: 36, clientSentiment: "Positive",
      recommendedActions: ["Close renewal this week", "Present Reputation Management add-on"],
    },
    expansionOpportunity: {
      opportunityScore: 70, recommendedServices: ["Reputation Management", "Reviews"],
      revenuePotential: 600, confidenceScore: 70,
      reason: "Law firm with low review count. Reputation management would build authority.",
      recommendedActions: ["Present reputation management alongside renewal"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Keystone Law Group is a long-standing healthy account with renewal in 36 days and a reputation management expansion opportunity.",
      healthAssessment: "All signals are positive. Renewal must be closed this month.",
      risks: ["Renewal in 36 days"],
      growthOpportunities: ["Reputation management and reviews"],
      renewalSignals: "Client has expressed renewal intent. Close by July 1.",
      expansionSignals: "Reputation management is a clear gap for this law firm.",
      communicationSummary: "Strong communication. Client is an engaged long-term partner.",
      recommendedActions: ["Close renewal by July 1", "Present reputation management add-on"],
    },
    commHistory: [
      { date: "2025-06-04", type: "Meeting", summary: "Renewal discussion. Client confirmed intent to renew. Reputation management discussed.", by: "Tina Webb", sentiment: "Positive" },
    ],
  },

  // ─── 27 ActiveStep Physical Therapy ─────────────────────────────────────────
  {
    clientId: "ch27",
    client: "ActiveStep Physical Therapy",
    industry: "Healthcare",
    accountManager: "Maria Santos",
    healthStatus: "Healthy",
    services: ["SEO", "GBP"],
    startDate: "2024-02-10",
    location: "Columbus, OH",
    lastHealthReview: "2025-06-04",
    healthScore: {
      projectHealth: 76, communicationHealth: 78, billingHealth: 94,
      reportingHealth: 72, callIntelligence: 74, escalationHealth: 94,
      clientEngagement: 76, overall: 80,
    },
    projectSignals: {
      milestoneCompletion: 78, taskCompletion: 76, blockedTasks: 0,
      delayedDeliverables: 0, openDependencies: 0, projectRiskScore: 18,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-01", daysSinceContact: 7, avgResponseTimeHours: 12,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Monthly",
      communicationScore: 78, communicationStatus: "Good",
    },
    callIntelSignals: {
      totalCalls: 38, qualifiedLeads: 26, bookedLeads: 22, missedOpportunities: 3,
      complaintTrends: 0, serviceRequests: 4, renewalSignals: 1, upsellSignals: 1,
      callSentiment: "Positive", leadQualityTrend: "Stable", callQualityScore: 74,
    },
    reportingSignals: {
      reportsDelivered: 5, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 72, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 94, billingStatus: "Current",
      mrr: 2100, arr: 25200,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 94,
    },
    engagementSignals: {
      meetingAttendance: 78, communicationFrequency: "Medium", responseRate: 76,
      projectParticipation: "Active", reviewParticipation: "Moderate",
      engagementScore: 76, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 16, riskLevel: "Low", contractEndDate: "2026-02-10",
      daysToRenewal: 245, clientSentiment: "Positive",
      recommendedActions: ["Maintain service excellence", "Propose PPC trial"],
    },
    expansionOpportunity: {
      opportunityScore: 64, recommendedServices: ["PPC", "Content"],
      revenuePotential: 700, confidenceScore: 64,
      reason: "Physical therapy practice with strong local demand. PPC would accelerate patient acquisition.",
      recommendedActions: ["Present PPC proposal"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "ActiveStep Physical Therapy is a healthy, growing account with clean billing and a PPC expansion opportunity.",
      healthAssessment: "All signals are positive. Good engagement for a smaller account.",
      risks: ["No risk signals."],
      growthOpportunities: ["PPC for patient acquisition", "Content for authority building"],
      renewalSignals: "Renewal is 245 days away. Positive sentiment.",
      expansionSignals: "PPC would accelerate patient acquisition significantly.",
      communicationSummary: "Monthly communication with good responsiveness.",
      recommendedActions: ["Present PPC proposal", "Maintain GBP optimization"],
    },
    commHistory: [
      { date: "2025-06-01", type: "Email", summary: "Monthly update. Client happy with new patient referrals from GBP.", by: "Maria Santos", sentiment: "Positive" },
    ],
  },

  // ─── 28 Riverstone Remodeling ─────────────────────────────────────────────────
  {
    clientId: "ch28",
    client: "Riverstone Remodeling",
    industry: "Construction",
    accountManager: "James Park",
    healthStatus: "Monitor",
    services: ["LSA", "GBP", "SEO"],
    startDate: "2023-12-15",
    location: "Phoenix, AZ",
    lastHealthReview: "2025-06-03",
    healthScore: {
      projectHealth: 64, communicationHealth: 66, billingHealth: 86,
      reportingHealth: 60, callIntelligence: 62, escalationHealth: 80,
      clientEngagement: 62, overall: 68,
    },
    projectSignals: {
      milestoneCompletion: 66, taskCompletion: 64, blockedTasks: 1,
      delayedDeliverables: 2, openDependencies: 1, projectRiskScore: 36,
      departmentDelays: ["SEO & Local"], projectStatus: "Monitor",
    },
    communicationSignals: {
      lastContact: "2025-05-30", daysSinceContact: 9, avgResponseTimeHours: 24,
      pendingFollowUps: 1, openConcerns: 0, meetingFrequency: "Monthly",
      communicationScore: 66, communicationStatus: "Good",
    },
    callIntelSignals: {
      totalCalls: 36, qualifiedLeads: 22, bookedLeads: 17, missedOpportunities: 5,
      complaintTrends: 0, serviceRequests: 4, renewalSignals: 1, upsellSignals: 1,
      callSentiment: "Neutral", leadQualityTrend: "Stable", callQualityScore: 62,
    },
    reportingSignals: {
      reportsDelivered: 6, reportsMissed: 1, reviewStatus: "Pending Review",
      clientFeedback: "Neutral", reportingScore: 60, lastReportDate: "2025-05-15",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 86, billingStatus: "Current",
      mrr: 2700, arr: 32400,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 80,
    },
    engagementSignals: {
      meetingAttendance: 65, communicationFrequency: "Medium", responseRate: 62,
      projectParticipation: "Moderate", reviewParticipation: "Moderate",
      engagementScore: 62, engagementStatus: "Medium",
    },
    renewalRisk: {
      riskScore: 30, riskLevel: "Low", contractEndDate: "2025-12-15",
      daysToRenewal: 187, clientSentiment: "Neutral",
      recommendedActions: ["Clear reporting gap", "Begin renewal conversation in October"],
    },
    expansionOpportunity: {
      opportunityScore: 58, recommendedServices: ["Google Ads"],
      revenuePotential: 700, confidenceScore: 58,
      reason: "Remodeling industry has strong search intent. Google Ads would complement LSA.",
      recommendedActions: ["Present Google Ads proposal"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Riverstone Remodeling is a stable monitor account with adequate performance and a Google Ads expansion opportunity.",
      healthAssessment: "Account is steady. One missed report and two minor deliverable delays.",
      risks: ["One missed report", "Two deliverable delays"],
      growthOpportunities: ["Google Ads expansion"],
      renewalSignals: "Renewal is 187 days away. No immediate concern.",
      expansionSignals: "Google Ads is a good fit for the remodeling industry.",
      communicationSummary: "Monthly communication with adequate responsiveness.",
      recommendedActions: ["Deliver missed report", "Present Google Ads proposal", "Begin renewal prep in October"],
    },
    commHistory: [
      { date: "2025-05-30", type: "Email", summary: "Monthly check-in. GBP update discussed.", by: "James Park", sentiment: "Neutral" },
    ],
  },

  // ─── 29 Golden Gate Urgent Care ──────────────────────────────────────────────
  {
    clientId: "ch29",
    client: "Golden Gate Urgent Care",
    industry: "Healthcare",
    accountManager: "Tina Webb",
    healthStatus: "Healthy",
    services: ["SEO", "PPC", "Reporting"],
    startDate: "2023-11-20",
    location: "San Francisco, CA",
    lastHealthReview: "2025-06-07",
    healthScore: {
      projectHealth: 82, communicationHealth: 84, billingHealth: 100,
      reportingHealth: 80, callIntelligence: 80, escalationHealth: 98,
      clientEngagement: 82, overall: 86,
    },
    projectSignals: {
      milestoneCompletion: 84, taskCompletion: 82, blockedTasks: 0,
      delayedDeliverables: 1, openDependencies: 0, projectRiskScore: 14,
      departmentDelays: [], projectStatus: "On Track",
    },
    communicationSignals: {
      lastContact: "2025-06-05", daysSinceContact: 3, avgResponseTimeHours: 6,
      pendingFollowUps: 0, openConcerns: 0, meetingFrequency: "Bi-Weekly",
      communicationScore: 84, communicationStatus: "Strong",
    },
    callIntelSignals: {
      totalCalls: 78, qualifiedLeads: 58, bookedLeads: 48, missedOpportunities: 4,
      complaintTrends: 0, serviceRequests: 9, renewalSignals: 2, upsellSignals: 2,
      callSentiment: "Positive", leadQualityTrend: "Stable", callQualityScore: 80,
    },
    reportingSignals: {
      reportsDelivered: 7, reportsMissed: 0, reviewStatus: "Reviewed",
      clientFeedback: "Positive", reportingScore: 80, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 100, billingStatus: "Current",
      mrr: 5500, arr: 66000,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 3,
      departmentsInvolved: [], escalationScore: 98,
    },
    engagementSignals: {
      meetingAttendance: 84, communicationFrequency: "High", responseRate: 82,
      projectParticipation: "Active", reviewParticipation: "Active",
      engagementScore: 82, engagementStatus: "High",
    },
    renewalRisk: {
      riskScore: 12, riskLevel: "Low", contractEndDate: "2025-11-20",
      daysToRenewal: 163, clientSentiment: "Positive",
      recommendedActions: ["Begin renewal conversation in September", "Present Telehealth program"],
    },
    expansionOpportunity: {
      opportunityScore: 75, recommendedServices: ["SEO Content", "Paid Social"],
      revenuePotential: 1500, confidenceScore: 75,
      reason: "Telehealth expansion opportunity. Client interested in building digital trust content.",
      recommendedActions: ["Present telehealth marketing proposal", "Develop content strategy"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Golden Gate Urgent Care is a strong-performing healthcare account with a significant telehealth marketing expansion opportunity.",
      healthAssessment: "All signals are healthy. Strong billing, excellent engagement, and high call performance.",
      risks: ["No significant risks. One minor deliverable delay."],
      growthOpportunities: ["Telehealth marketing program", "Paid social for brand trust"],
      renewalSignals: "Strong positive sentiment. Renewal conversation in September.",
      expansionSignals: "Telehealth is a high-growth opportunity for this urgent care brand.",
      communicationSummary: "Bi-weekly communication with strong responsiveness.",
      recommendedActions: ["Present telehealth proposal", "Schedule Q3 strategy session", "Begin renewal prep in September"],
    },
    commHistory: [
      { date: "2025-06-05", type: "Meeting", summary: "Q3 strategy session. Telehealth marketing discussed. Budget appetite confirmed.", by: "Tina Webb", sentiment: "Positive" },
    ],
  },

  // ─── 30 Apex Solar Solutions ──────────────────────────────────────────────────
  {
    clientId: "ch30",
    client: "Apex Solar Solutions",
    industry: "Solar",
    accountManager: "Sarah Chen",
    healthStatus: "Monitor",
    services: ["Meta Ads", "SEO", "Content"],
    startDate: "2023-10-01",
    location: "Las Vegas, NV",
    lastHealthReview: "2025-06-05",
    healthScore: {
      projectHealth: 72, communicationHealth: 74, billingHealth: 90,
      reportingHealth: 68, callIntelligence: 70, escalationHealth: 86,
      clientEngagement: 70, overall: 75,
    },
    projectSignals: {
      milestoneCompletion: 74, taskCompletion: 72, blockedTasks: 0,
      delayedDeliverables: 1, openDependencies: 1, projectRiskScore: 26,
      departmentDelays: [], projectStatus: "Monitor",
    },
    communicationSignals: {
      lastContact: "2025-06-03", daysSinceContact: 5, avgResponseTimeHours: 16,
      pendingFollowUps: 1, openConcerns: 0, meetingFrequency: "Monthly",
      communicationScore: 74, communicationStatus: "Good",
    },
    callIntelSignals: {
      totalCalls: 54, qualifiedLeads: 36, bookedLeads: 28, missedOpportunities: 6,
      complaintTrends: 0, serviceRequests: 6, renewalSignals: 1, upsellSignals: 2,
      callSentiment: "Neutral", leadQualityTrend: "Stable", callQualityScore: 70,
    },
    reportingSignals: {
      reportsDelivered: 8, reportsMissed: 0, reviewStatus: "Pending Review",
      clientFeedback: "Neutral", reportingScore: 68, lastReportDate: "2025-06-01",
    },
    billingSignals: {
      outstandingInvoices: 0, daysOverdue: 0, billingHolds: false,
      collectionActivity: false, billingScore: 90, billingStatus: "Current",
      mrr: 3900, arr: 46800,
    },
    escalationSignals: {
      openEscalations: 0, escalationSeverity: "None", avgResolutionDays: 0,
      departmentsInvolved: [], escalationScore: 86,
    },
    engagementSignals: {
      meetingAttendance: 72, communicationFrequency: "Medium", responseRate: 70,
      projectParticipation: "Moderate", reviewParticipation: "Moderate",
      engagementScore: 70, engagementStatus: "Medium",
    },
    renewalRisk: {
      riskScore: 24, riskLevel: "Low", contractEndDate: "2025-10-01",
      daysToRenewal: 113, clientSentiment: "Neutral",
      recommendedActions: ["Begin renewal conversation in August", "Deliver reporting review"],
    },
    expansionOpportunity: {
      opportunityScore: 68, recommendedServices: ["Google Ads", "Landing Pages"],
      revenuePotential: 1000, confidenceScore: 68,
      reason: "Solar industry has strong search demand. Google Ads would capture high-intent buyers.",
      recommendedActions: ["Present Google Ads proposal at renewal"],
      hasOpportunity: true,
    },
    aiSummary: {
      overview: "Apex Solar Solutions is a stable monitor account with clean billing and a Google Ads expansion opportunity at renewal.",
      healthAssessment: "Account is steady. Reporting is pending review and engagement could be stronger.",
      risks: ["Reporting not reviewed by client", "One deliverable delay"],
      growthOpportunities: ["Google Ads expansion for solar search demand"],
      renewalSignals: "Renewal is 113 days away. Positive signals expected once reporting is reviewed.",
      expansionSignals: "Google Ads is the right next step for solar search traffic.",
      communicationSummary: "Monthly communication with moderate engagement.",
      recommendedActions: ["Deliver reporting review", "Present Google Ads proposal", "Begin renewal prep in August"],
    },
    commHistory: [
      { date: "2025-06-03", type: "Email", summary: "Monthly check-in. Awaiting report review from client.", by: "Sarah Chen", sentiment: "Neutral" },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// INTERVENTION QUEUE
// ══════════════════════════════════════════════════════════════════════════════

export const INTERVENTION_QUEUE: InterventionItem[] = [
  {
    clientId: "ch03",
    client: "Lakeview Dental",
    reason: "Critical health score. Billing hold. No response for 25 days. Renewal June 30.",
    riskLevel: "Critical",
    assignedOwner: "Sarah Chen",
    recommendedAction: "Director retention call this week. Resolve billing hold. Provide written recovery plan.",
    dueDate: "2025-06-12",
    status: "Escalated",
  },
  {
    clientId: "ch19",
    client: "Summit Roofing Group",
    reason: "Cancellation submitted. Critical escalations. Billing 30 days overdue.",
    riskLevel: "Critical",
    assignedOwner: "Maria Santos",
    recommendedAction: "Director leads save attempt. Formal remediation plan. Resolve billing.",
    dueDate: "2025-06-11",
    status: "In Progress",
  },
  {
    clientId: "ch17",
    client: "Peak Performance HVAC",
    reason: "No contact in 26 days. Three overdue reports. Renewal risk in 85 days.",
    riskLevel: "Critical",
    assignedOwner: "James Park",
    recommendedAction: "Executive call this week. Deliver all overdue reports. Create recovery plan.",
    dueDate: "2025-06-12",
    status: "Open",
  },
  {
    clientId: "ch24",
    client: "Harbor View Realty",
    reason: "Renewal in 22 days. CRM integration stalled. VP escalation active. Highest at-risk MRR.",
    riskLevel: "High",
    assignedOwner: "James Park",
    recommendedAction: "Immediate executive call. Resolve CRM blocker. Create recovery plan.",
    dueDate: "2025-06-11",
    status: "In Progress",
  },
  {
    clientId: "ch02",
    client: "Harbor Auto",
    reason: "Renewal in 32 days. Payment overdue. Lead quality complaints unresolved.",
    riskLevel: "High",
    assignedOwner: "Sarah Chen",
    recommendedAction: "Performance review call. Resolve billing. Prepare save presentation.",
    dueDate: "2025-06-14",
    status: "In Progress",
  },
  {
    clientId: "ch05",
    client: "Metro Electrical",
    reason: "LSA docs missing. PPC on hold. Client frustrated with delays.",
    riskLevel: "Medium",
    assignedOwner: "James Park",
    recommendedAction: "Follow up on LSA docs with hard deadline. Book status call.",
    dueDate: "2025-06-13",
    status: "Open",
  },
  {
    clientId: "ch23",
    client: "BrightPath Tutoring",
    reason: "Renewal in 67 days. Low engagement. Content delay unresolved.",
    riskLevel: "Medium",
    assignedOwner: "Sarah Chen",
    recommendedAction: "Start renewal conversation. Resolve content delay.",
    dueDate: "2025-06-16",
    status: "Open",
  },
  {
    clientId: "ch14",
    client: "GreenLeaf Gardens",
    reason: "Two missed reports. Low engagement. Renewal approaching.",
    riskLevel: "Medium",
    assignedOwner: "James Park",
    recommendedAction: "Deliver missed reports. Book re-engagement call.",
    dueDate: "2025-06-16",
    status: "Open",
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// PORTFOLIO SUMMARY (for Executive Dashboard)
// ══════════════════════════════════════════════════════════════════════════════

export function computePortfolioSummary(records: ClientHealthRecord[]) {
  const total = records.length;
  const healthy  = records.filter(r => r.healthStatus === "Healthy").length;
  const monitor  = records.filter(r => r.healthStatus === "Monitor").length;
  const atRisk   = records.filter(r => r.healthStatus === "At Risk").length;
  const critical = records.filter(r => r.healthStatus === "Critical").length;
  const avgScore = Math.round(records.reduce((s, r) => s + r.healthScore.overall, 0) / total);

  const totalMRR = records.reduce((s, r) => s + r.billingSignals.mrr, 0);
  const totalARR = records.reduce((s, r) => s + r.billingSignals.arr, 0);

  const revenueAtRisk = records
    .filter(r => r.renewalRisk.riskLevel === "High" || r.renewalRisk.riskLevel === "Critical")
    .reduce((s, r) => s + r.billingSignals.mrr, 0);

  const interventionCount = INTERVENTION_QUEUE.filter(i => i.status !== "Resolved").length;

  const expansionCount   = records.filter(r => r.expansionOpportunity.hasOpportunity).length;
  const expansionRevenue = records.reduce((s, r) => s + (r.expansionOpportunity.hasOpportunity ? r.expansionOpportunity.revenuePotential : 0), 0);

  const openEscalations  = records.reduce((s, r) => s + r.escalationSignals.openEscalations, 0);

  return {
    total, healthy, monitor, atRisk, critical, avgScore,
    totalMRR, totalARR, revenueAtRisk,
    interventionCount, expansionCount, expansionRevenue,
    openEscalations,
  };
}
