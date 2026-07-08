// ─── RTM OS — Cancellations & Retention Engine Mock Data ─────────────────────

// ── Status & Reason Types ──────────────────────────────────────────────────────

export type CancellationStatus =
  | "Request Received"| "Under Review"| "Retention Attempt"| "Executive Review"| "Cancellation Approved"| "Cancellation Withdrawn"| "Converted To Downgrade"| "Converted To Renewal"| "Converted To Change Request"| "Moved To Offboarding";

// Locked 11-category reason list — do not change without product sign-off.
// Replaces prior 9-category list (Budget, Performance, Service Quality,
// Communication, Internal Staffing, Business Closure, Competitor,
// No Longer Needed, Other).
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
  | "Pending Client Confirmation";

export type RetentionStrategy =
  | "Budget Adjustment"| "Service Reduction"| "Service Realignment"| "Temporary Pause"| "Additional Support"| "Executive Escalation"| "Custom Retention Plan";

export type RetentionStatus =
  | "Not Started"| "In Progress"| "Client Contacted"| "Decision Pending"| "Saved"| "Lost";

export type SaveAttemptStep =
  | "Cancellation Request"| "AM Review"| "Retention Plan"| "Client Discussion"| "Decision"| "Saved"| "Cancelled";

export type RiskLevel = "Low"| "Medium"| "High"| "Critical";

// ── Core Interfaces ────────────────────────────────────────────────────────────

export interface ClientRiskProfile {
  healthScore: number;
  projectHealth: number;
  billingHealth: number;
  communicationHealth: number;
  reportingHealth: number;
  openEscalations: number;
  renewalRisk: "Low"| "Medium"| "High"| "Critical";
  expansionPotential: "None"| "Low"| "Medium"| "High";
}

export interface RetentionPlan {
  strategy: RetentionStrategy;
  description: string;
  assignedOwner: string;
  createdDate: string;
  targetDate: string;
  status: RetentionStatus;
  notes: string;
}

export interface ActivityEvent {
  date: string;
  step: SaveAttemptStep | string;
  description: string;
  actor: string;
  outcome?: string;
}

export interface AIRetentionInsight {
  cancellationRisk: number;
  reasonAnalysis: string;
  revenueImpact: string;
  retentionProbability: number;
  recommendedStrategy: RetentionStrategy;
  suggestedActions: string[];
  riskFactors: string[];
}

export interface CancellationRequest {
  id: string;
  client: string;
  accountManager: string;
  mrr: number;
  arr: number;
  reason: CancellationReason;
  reasonDetail: string;
  riskLevel: RiskLevel;
  healthScore: number;
  retentionStatus: RetentionStatus;
  status: CancellationStatus;
  requestDate: string;
  lastActionDate: string;
  riskProfile: ClientRiskProfile;
  retentionPlan: RetentionPlan | null;
  aiInsight: AIRetentionInsight;
  activityTimeline: ActivityEvent[];
  services: string[];
  industry: string;
  clientSince: string;
}

// ── Mock Data — 20 Cancellation Requests ──────────────────────────────────────

export const CANCELLATION_REQUESTS: CancellationRequest[] = [
  // ── Budget-related examples ────────────────────────────────────────────────
  {
    id: "cr01",
    client: "Summit Roofing Group",
    accountManager: "Maria Santos",
    mrr: 5100,
    arr: 61200,
    reason: "Pricing/Financial Hardship",
    reasonDetail: "Client cited Q2 budget cuts and reduced ROI confidence. Requesting a 40% service reduction.",
    riskLevel: "Critical",
    healthScore: 31,
    retentionStatus: "In Progress",
    status: "Executive Review",
    requestDate: "2025-05-20",
    lastActionDate: "2025-06-10",
    industry: "Roofing",
    clientSince: "2022-03-01",
    services: ["SEO", "Google Ads", "GBP", "LSA"],
    riskProfile: {
      healthScore: 31,
      projectHealth: 28,
      billingHealth: 45,
      communicationHealth: 22,
      reportingHealth: 40,
      openEscalations: 3,
      renewalRisk: "Critical",
      expansionPotential: "None",
    },
    retentionPlan: {
      strategy: "Executive Escalation",
      description: "Director-level call with client. Offer restructured package at 25% discount for 6-month commitment. Review deliverable performance together.",
      assignedOwner: "Maria Santos",
      createdDate: "2025-05-24",
      targetDate: "2025-06-15",
      status: "In Progress",
      notes: "Client is open to discussion but needs tangible improvements. Director call scheduled June 14.",
    },
    aiInsight: {
      cancellationRisk: 82,
      reasonAnalysis: "Primary driver is budget pressure compounded by low communication frequency. Client has not received a performance report in 38 days.",
      revenueImpact: "$61,200 ARR at risk. Loss would reduce department revenue by 4.2%.",
      retentionProbability: 38,
      recommendedStrategy: "Executive Escalation",
      suggestedActions: [
        "Schedule director-level retention call within 48 hours",
        "Deliver overdue Q2 performance report before the call",
        "Prepare restructured service package at 20-25% budget reduction",
        "Offer 3-month performance guarantee clause",
        "Assign dedicated performance liaison for weekly reporting",
      ],
      riskFactors: [
        "38 days without a performance report delivered",
        "3 open escalations unresolved",
        "Communication health score at 22 out of 100",
        "Health score below 35 — critical threshold",
      ],
    },
    activityTimeline: [
      { date: "2025-05-20", step: "Cancellation Request", description: "Client submitted cancellation notice via email citing budget constraints.", actor: "Client", outcome: "Request logged"},
      { date: "2025-05-21", step: "AM Review", description: "Maria Santos reviewed the request and flagged for immediate escalation.", actor: "Maria Santos", outcome: "Escalated to Director"},
      { date: "2025-05-24", step: "Retention Plan", description: "Retention plan created: Executive Escalation strategy with service restructure proposal.", actor: "Maria Santos", outcome: "Plan approved"},
      { date: "2025-06-02", step: "Client Discussion", description: "Initial call with client. Client reiterated budget concerns. Agreed to review proposal.", actor: "Maria Santos", outcome: "Follow-up scheduled"},
      { date: "2025-06-10", step: "Client Discussion", description: "Director joined call. Presented restructured package. Client requested 5 business days to decide.", actor: "Director / Maria Santos", outcome: "Decision pending June 17"},
    ],
  },
  {
    id: "cr02",
    client: "Harbor Auto",
    accountManager: "Sarah Chen",
    mrr: 3200,
    arr: 38400,
    reason: "Pricing/Financial Hardship",
    reasonDetail: "Owner claims monthly retainer is too high relative to lead volume. Comparing pricing to competitors.",
    riskLevel: "High",
    healthScore: 48,
    retentionStatus: "Client Contacted",
    status: "Retention Attempt",
    requestDate: "2025-06-01",
    lastActionDate: "2025-06-09",
    industry: "Automotive",
    clientSince: "2022-07-11",
    services: ["Google Ads", "SEO"],
    riskProfile: {
      healthScore: 48,
      projectHealth: 52,
      billingHealth: 61,
      communicationHealth: 44,
      reportingHealth: 55,
      openEscalations: 1,
      renewalRisk: "High",
      expansionPotential: "Low",
    },
    retentionPlan: {
      strategy: "Budget Adjustment",
      description: "Offer a 3-month reduced rate of $2,600/mo in exchange for signed 6-month commitment. Include monthly lead audit report.",
      assignedOwner: "Sarah Chen",
      createdDate: "2025-06-03",
      targetDate: "2025-06-18",
      status: "Client Contacted",
      notes: "Client receptive to the budget adjustment. Awaiting final decision.",
    },
    aiInsight: {
      cancellationRisk: 68,
      reasonAnalysis: "Budget sensitivity is primary trigger. Lead volume has declined 18% over the past 60 days due to market seasonality, not campaign performance. Client may not be aware of the context.",
      revenueImpact: "$38,400 ARR at risk. Would reduce automotive client MRR by 100%.",
      retentionProbability: 55,
      recommendedStrategy: "Budget Adjustment",
      suggestedActions: [
        "Present seasonal lead volume comparison against industry benchmarks",
        "Offer a temporary budget adjustment for Q3",
        "Provide competitive analysis showing RTM pricing vs market",
        "Set clear lead volume KPIs for the adjusted period",
      ],
      riskFactors: [
        "Lead volume down 18% YoY due to seasonality",
        "No competitive analysis shared with client",
        "Communication health below 50",
      ],
    },
    activityTimeline: [
      { date: "2025-06-01", step: "Cancellation Request", description: "Client emailed requesting cancellation at end of billing cycle.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-02", step: "AM Review", description: "Sarah Chen reviewed account. Identified seasonality as likely factor. Prepared budget adjustment proposal.", actor: "Sarah Chen", outcome: "Retention plan created"},
      { date: "2025-06-03", step: "Retention Plan", description: "Budget adjustment plan documented: $2,600/mo for 6-month commitment.", actor: "Sarah Chen", outcome: "Plan ready"},
      { date: "2025-06-09", step: "Client Discussion", description: "Call with client. Presented seasonal data and adjusted pricing. Client open to reconsideration.", actor: "Sarah Chen", outcome: "Awaiting decision"},
    ],
  },
  {
    id: "cr03",
    client: "Lakeview Dental",
    accountManager: "Sarah Chen",
    mrr: 2400,
    arr: 28800,
    reason: "Pricing/Financial Hardship",
    reasonDetail: "Practice revenue declined due to insurance reimbursement changes. Cannot sustain current marketing spend.",
    riskLevel: "Critical",
    healthScore: 34,
    retentionStatus: "Decision Pending",
    status: "Retention Attempt",
    requestDate: "2025-06-03",
    lastActionDate: "2025-06-11",
    industry: "Dental",
    clientSince: "2022-06-30",
    services: ["SEO", "Reporting"],
    riskProfile: {
      healthScore: 34,
      projectHealth: 30,
      billingHealth: 28,
      communicationHealth: 38,
      reportingHealth: 42,
      openEscalations: 2,
      renewalRisk: "Critical",
      expansionPotential: "None",
    },
    retentionPlan: {
      strategy: "Temporary Pause",
      description: "Offer a 60-day service pause at $500/mo maintenance retainer. Resume full services when client stabilizes financially.",
      assignedOwner: "Sarah Chen",
      createdDate: "2025-06-05",
      targetDate: "2025-06-18",
      status: "Decision Pending",
      notes: "Client appreciated the pause option. Needs approval from practice administrator.",
    },
    aiInsight: {
      cancellationRisk: 78,
      reasonAnalysis: "Financial distress is genuine — not a negotiating tactic. Industry-wide insurance reimbursement cuts have impacted the dental sector significantly. A retention pause is more viable than a service reduction.",
      revenueImpact: "$28,800 ARR at risk. Client has been active for 3 years — loss represents significant LTV impact.",
      retentionProbability: 42,
      recommendedStrategy: "Temporary Pause",
      suggestedActions: [
        "Offer 60-day pause at nominal maintenance rate",
        "Structure clear reactivation criteria and timeline",
        "Maintain relationship touchpoints during pause period",
        "Present ROI case study from similar dental clients",
      ],
      riskFactors: [
        "Practice revenue declining for 2 consecutive quarters",
        "Billing health at 28 — overdue invoices present",
        "2 open escalations related to reporting delays",
      ],
    },
    activityTimeline: [
      { date: "2025-06-03", step: "Cancellation Request", description: "Client called requesting immediate cancellation. Cited practice financial challenges.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-04", step: "AM Review", description: "Sarah Chen reviewed account history. 3-year client with strong pre-2024 performance.", actor: "Sarah Chen", outcome: "Pause strategy identified"},
      { date: "2025-06-05", step: "Retention Plan", description: "Temporary pause plan created at $500/mo maintenance retainer.", actor: "Sarah Chen", outcome: "Plan created"},
      { date: "2025-06-11", step: "Client Discussion", description: "Call with Dr. Sharon Kim. Presented pause option. Client reacted positively. Awaiting admin approval.", actor: "Sarah Chen", outcome: "Decision pending"},
    ],
  },
  {
    id: "cr04",
    client: "BrightPath Tutoring",
    accountManager: "Sarah Chen",
    mrr: 2200,
    arr: 26400,
    reason: "Pricing/Financial Hardship",
    reasonDetail: "Education sector funding cuts. Director requesting 50% budget reduction or cancellation.",
    riskLevel: "High",
    healthScore: 55,
    retentionStatus: "In Progress",
    status: "Under Review",
    requestDate: "2025-06-07",
    lastActionDate: "2025-06-08",
    industry: "Education",
    clientSince: "2023-01-15",
    services: ["SEO", "Content", "GBP"],
    riskProfile: {
      healthScore: 55,
      projectHealth: 58,
      billingHealth: 70,
      communicationHealth: 60,
      reportingHealth: 52,
      openEscalations: 0,
      renewalRisk: "High",
      expansionPotential: "Low",
    },
    retentionPlan: {
      strategy: "Service Reduction",
      description: "Restructure to SEO-only package at $1,100/mo. Suspend Content and GBP services temporarily.",
      assignedOwner: "Sarah Chen",
      createdDate: "2025-06-08",
      targetDate: "2025-06-20",
      status: "In Progress",
      notes: "Client has expressed willingness to retain SEO at a reduced rate.",
    },
    aiInsight: {
      cancellationRisk: 62,
      reasonAnalysis: "Budget-driven with moderate retention potential. Client's core SEO results are solid — they value the service but cannot maintain current investment levels.",
      revenueImpact: "$26,400 ARR at risk. Service reduction to $1,100/mo would preserve $13,200 ARR.",
      retentionProbability: 60,
      recommendedStrategy: "Service Reduction",
      suggestedActions: [
        "Present SEO-only package option with preserved core deliverables",
        "Provide 6-month SEO performance timeline projection",
        "Offer to reinstate services when budget recovers",
        "Include quarterly check-in to review expansion",
      ],
      riskFactors: [
        "Budget pressure from funding cycle",
        "Reporting health at 52 — some delivery gaps",
      ],
    },
    activityTimeline: [
      { date: "2025-06-07", step: "Cancellation Request", description: "Director submitted written cancellation request. Offered to consider reduced scope.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-08", step: "AM Review", description: "Sarah Chen identified SEO retention opportunity. Creating service reduction proposal.", actor: "Sarah Chen", outcome: "Under review"},
    ],
  },

  // ── Performance-related examples ───────────────────────────────────────────
  {
    id: "cr05",
    client: "Peak Performance HVAC",
    accountManager: "James Park",
    mrr: 6200,
    arr: 74400,
    reason: "Not Performing",
    reasonDetail: "Client claims lead volume dropped 35% over Q1. No reports delivered in 25 days. Threatening immediate cancellation.",
    riskLevel: "Critical",
    healthScore: 29,
    retentionStatus: "Not Started",
    status: "Request Received",
    requestDate: "2025-06-05",
    lastActionDate: "2025-06-05",
    industry: "HVAC",
    clientSince: "2021-09-01",
    services: ["PPC", "LSA", "GBP", "SEO"],
    riskProfile: {
      healthScore: 29,
      projectHealth: 22,
      billingHealth: 72,
      communicationHealth: 18,
      reportingHealth: 15,
      openEscalations: 4,
      renewalRisk: "Critical",
      expansionPotential: "None",
    },
    retentionPlan: null,
    aiInsight: {
      cancellationRisk: 91,
      reasonAnalysis: "Critical failure state. Reporting gap of 25 days combined with lead decline and 4 open escalations represents a near-total breakdown in account management. Immediate director escalation required.",
      revenueImpact: "$74,400 ARR at highest risk. Largest single revenue exposure in current cancellation queue.",
      retentionProbability: 25,
      recommendedStrategy: "Executive Escalation",
      suggestedActions: [
        "URGENT: Director call within 24 hours — do not delay",
        "Deliver complete Q1 and Q2 performance audit before any conversation",
        "Resolve all 4 open escalations before client call",
        "Assign dedicated performance manager for 90-day remediation",
        "Prepare service credit or discount as goodwill gesture",
      ],
      riskFactors: [
        "25 days without report delivery — critical threshold breached",
        "4 open escalations — most in current portfolio",
        "Communication health at 18 — lowest in active accounts",
        "Reporting health at 15 — reporting completely stalled",
        "Cancellation request has no response for 24+ hours",
      ],
    },
    activityTimeline: [
      { date: "2025-06-05", step: "Cancellation Request", description: "Client sent formal cancellation email citing missed reports and lead decline. Copied operations director.", actor: "Client", outcome: "Request received — no response yet"},
    ],
  },
  {
    id: "cr06",
    client: "Metro Electrical",
    accountManager: "James Park",
    mrr: 3600,
    arr: 43200,
    reason: "Not Performing",
    reasonDetail: "Client frustrated with onboarding delays. Campaign not yet live after 45 days. Considering alternative agency.",
    riskLevel: "High",
    healthScore: 52,
    retentionStatus: "Client Contacted",
    status: "Retention Attempt",
    requestDate: "2025-06-04",
    lastActionDate: "2025-06-10",
    industry: "Electrical",
    clientSince: "2025-01-20",
    services: ["PPC", "LSA", "GBP"],
    riskProfile: {
      healthScore: 52,
      projectHealth: 38,
      billingHealth: 80,
      communicationHealth: 56,
      reportingHealth: 60,
      openEscalations: 2,
      renewalRisk: "High",
      expansionPotential: "Medium",
    },
    retentionPlan: {
      strategy: "Additional Support",
      description: "Dedicated onboarding specialist assigned. Revised launch timeline committed: live by June 20. Weekly status calls until launch.",
      assignedOwner: "James Park",
      createdDate: "2025-06-05",
      targetDate: "2025-06-20",
      status: "Client Contacted",
      notes: "Client calmed after additional support offer. Wants confirmation of launch date in writing.",
    },
    aiInsight: {
      cancellationRisk: 60,
      reasonAnalysis: "Onboarding failure is the root cause. Client expectations were not properly set for launch timelines. This is a service delivery issue, not a relationship issue — retention is achievable with a committed delivery plan.",
      revenueImpact: "$43,200 ARR at risk. New client with strong billing health — worth immediate remediation effort.",
      retentionProbability: 65,
      recommendedStrategy: "Additional Support",
      suggestedActions: [
        "Assign dedicated onboarding specialist immediately",
        "Provide written launch commitment with revised timeline",
        "Schedule weekly 15-minute status calls through launch",
        "Offer first-month credit as acknowledgment of delay",
      ],
      riskFactors: [
        "Campaign not live after 45 days — exceeds standard onboarding window",
        "2 open escalations related to onboarding",
        "Project health at 38 — significant concern",
      ],
    },
    activityTimeline: [
      { date: "2025-06-04", step: "Cancellation Request", description: "Client called AM directly and threatened to leave. Campaign still not live.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-05", step: "AM Review", description: "James Park escalated to operations. Identified onboarding bottleneck.", actor: "James Park", outcome: "Retention plan created"},
      { date: "2025-06-05", step: "Retention Plan", description: "Dedicated onboarding support assigned. Launch committed for June 20.", actor: "James Park", outcome: "Plan active"},
      { date: "2025-06-10", step: "Client Discussion", description: "Call with Carlos Reyes. Presented revised plan and support structure. Client cautiously positive.", actor: "James Park", outcome: "Awaiting written confirmation"},
    ],
  },
  {
    id: "cr07",
    client: "Summit Landscaping",
    accountManager: "James Park",
    mrr: 2900,
    arr: 34800,
    reason: "Not Performing",
    reasonDetail: "Client disappointed with SEO ranking improvements after 8 months. Comparing results to competitor case studies.",
    riskLevel: "Medium",
    healthScore: 62,
    retentionStatus: "Client Contacted",
    status: "Retention Attempt",
    requestDate: "2025-06-06",
    lastActionDate: "2025-06-11",
    industry: "Landscaping",
    clientSince: "2024-10-15",
    services: ["SEO", "Content", "GBP"],
    riskProfile: {
      healthScore: 62,
      projectHealth: 65,
      billingHealth: 85,
      communicationHealth: 68,
      reportingHealth: 60,
      openEscalations: 0,
      renewalRisk: "Medium",
      expansionPotential: "Medium",
    },
    retentionPlan: {
      strategy: "Service Realignment",
      description: "Realign SEO strategy toward high-intent local terms. Add GBP optimization sprint. Set explicit ranking milestones for next 90 days.",
      assignedOwner: "James Park",
      createdDate: "2025-06-07",
      targetDate: "2025-06-25",
      status: "Client Contacted",
      notes: "Client agreed to a 90-day milestone plan before making final decision.",
    },
    aiInsight: {
      cancellationRisk: 52,
      reasonAnalysis: "8-month SEO timeline is within normal range for new domains. Client may be comparing against unrealistic competitor claims. Education on SEO timeline expectations is critical.",
      revenueImpact: "$34,800 ARR at moderate risk. Good candidate for retention through expectation realignment.",
      retentionProbability: 68,
      recommendedStrategy: "Service Realignment",
      suggestedActions: [
        "Prepare detailed SEO milestone report showing 8-month progress",
        "Set clear ranking targets for next 90 days with written commitment",
        "Share industry benchmarks for SEO timeline expectations",
        "Offer GBP optimization sprint as added value",
      ],
      riskFactors: [
        "Client comparing to competitor case studies — education needed",
        "No open escalations but communication health at 68",
      ],
    },
    activityTimeline: [
      { date: "2025-06-06", step: "Cancellation Request", description: "Client submitted written notice citing slow SEO progress.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-07", step: "AM Review", description: "James Park reviewed 8-month SEO data. Performance is on track — client expectations misaligned.", actor: "James Park", outcome: "Service realignment plan created"},
      { date: "2025-06-11", step: "Client Discussion", description: "Presentation call with Eric Walsh. Showed SEO milestone progress. Client agreed to 90-day extension.", actor: "James Park", outcome: "Retention period agreed"},
    ],
  },

  // ── Saved clients ──────────────────────────────────────────────────────────
  {
    id: "cr08",
    client: "Pinnacle HVAC",
    accountManager: "James Park",
    mrr: 4500,
    arr: 54000,
    reason: "Pricing/Financial Hardship",
    reasonDetail: "Requested cancellation citing budget reallocation to internal hire. Offered budget adjustment and performance review.",
    riskLevel: "High",
    healthScore: 88,
    retentionStatus: "Saved",
    status: "Cancellation Withdrawn",
    requestDate: "2025-04-10",
    lastActionDate: "2025-04-28",
    industry: "HVAC",
    clientSince: "2023-07-01",
    services: ["GBP", "LSA", "SEO"],
    riskProfile: {
      healthScore: 88,
      projectHealth: 85,
      billingHealth: 90,
      communicationHealth: 88,
      reportingHealth: 84,
      openEscalations: 0,
      renewalRisk: "Low",
      expansionPotential: "High",
    },
    retentionPlan: {
      strategy: "Budget Adjustment",
      description: "Reduced service package to $3,800/mo for 3 months. Added dedicated reporting cadence and performance dashboard access.",
      assignedOwner: "James Park",
      createdDate: "2025-04-12",
      targetDate: "2025-04-25",
      status: "Saved",
      notes: "Client reinstated after budget adjustment and performance review call. Cancellation withdrawn on April 28.",
    },
    aiInsight: {
      cancellationRisk: 35,
      reasonAnalysis: "Budget reallocation request from a high-health client — strong candidate for retention with a minor adjustment.",
      revenueImpact: "$54,000 ARR was at risk. Retention successful at $45,600 ARR for adjusted term.",
      retentionProbability: 80,
      recommendedStrategy: "Budget Adjustment",
      suggestedActions: ["Reinstate full services after 3-month adjusted period", "Schedule expansion opportunity review at month 2"],
      riskFactors: ["Internal hire signal — monitor for reoccurrence"],
    },
    activityTimeline: [
      { date: "2025-04-10", step: "Cancellation Request", description: "Client requested cancellation to hire internal marketing coordinator.", actor: "Client", outcome: "Request logged"},
      { date: "2025-04-12", step: "AM Review", description: "James Park reviewed account. High-health client — strong retention candidate.", actor: "James Park", outcome: "Budget adjustment plan created"},
      { date: "2025-04-15", step: "Retention Plan", description: "Adjusted package at $3,800/mo for 3 months presented to client.", actor: "James Park", outcome: "Client reviewing"},
      { date: "2025-04-22", step: "Client Discussion", description: "Retention call with Rachel Moore. Client responded positively to adjusted pricing.", actor: "James Park", outcome: "Client agreed"},
      { date: "2025-04-28", step: "Saved", description: "Client formally withdrew cancellation. Signed 3-month adjusted service agreement.", actor: "Client", outcome: "Saved"},
    ],
  },
  {
    id: "cr09",
    client: "NorthStar Dental",
    accountManager: "Tina Webb",
    mrr: 3800,
    arr: 45600,
    reason: "Communication Issue",
    reasonDetail: "Client felt out of the loop — no check-ins for 6 weeks. Nearly cancelled before AM escalation.",
    riskLevel: "Medium",
    healthScore: 84,
    retentionStatus: "Saved",
    status: "Cancellation Withdrawn",
    requestDate: "2025-03-18",
    lastActionDate: "2025-04-02",
    industry: "Dental",
    clientSince: "2023-12-01",
    services: ["SEO", "PPC", "Content"],
    riskProfile: {
      healthScore: 84,
      projectHealth: 82,
      billingHealth: 88,
      communicationHealth: 70,
      reportingHealth: 80,
      openEscalations: 0,
      renewalRisk: "Low",
      expansionPotential: "High",
    },
    retentionPlan: {
      strategy: "Additional Support",
      description: "Established bi-weekly check-in cadence with Dr. Amy Lee. Added client to monthly executive report distribution. AM committed to 48-hour response SLA.",
      assignedOwner: "Tina Webb",
      createdDate: "2025-03-20",
      targetDate: "2025-04-01",
      status: "Saved",
      notes: "Client responded very positively to direct engagement commitment. No service changes needed.",
    },
    aiInsight: {
      cancellationRisk: 40,
      reasonAnalysis: "Communication gap caused by AM workload. The service itself is performing well. Easy retention win with improved contact cadence.",
      revenueImpact: "$45,600 ARR retained through communication improvement alone.",
      retentionProbability: 85,
      recommendedStrategy: "Additional Support",
      suggestedActions: ["Maintain bi-weekly check-in for 90 days", "Propose expansion review at next QBR"],
      riskFactors: ["Communication health gap — monitor closely"],
    },
    activityTimeline: [
      { date: "2025-03-18", step: "Cancellation Request", description: "Dr. Amy Lee called to cancel. Cited lack of communication as primary reason.", actor: "Client", outcome: "Request logged"},
      { date: "2025-03-20", step: "AM Review", description: "Tina Webb identified communication gap. Account is performing well.", actor: "Tina Webb", outcome: "Communication plan created"},
      { date: "2025-03-22", step: "Client Discussion", description: "Tina Webb called client. Apologized for communication gap. Committed to bi-weekly check-in.", actor: "Tina Webb", outcome: "Client open to staying"},
      { date: "2025-04-02", step: "Saved", description: "Client confirmed she will remain. Cancellation request withdrawn.", actor: "Client", outcome: "Saved"},
    ],
  },
  {
    id: "cr10",
    client: "Radiance MedSpa",
    accountManager: "Tina Webb",
    mrr: 4200,
    arr: 50400,
    reason: "Communication Issue",
    reasonDetail: "Client unhappy with Meta Ads creative quality. Requested design overhaul and campaign restructure.",
    riskLevel: "High",
    healthScore: 72,
    retentionStatus: "Saved",
    status: "Converted To Change Request",
    requestDate: "2025-05-05",
    lastActionDate: "2025-05-22",
    industry: "MedSpa",
    clientSince: "2023-11-01",
    services: ["Meta Ads", "Design", "SEO"],
    riskProfile: {
      healthScore: 72,
      projectHealth: 68,
      billingHealth: 88,
      communicationHealth: 74,
      reportingHealth: 72,
      openEscalations: 1,
      renewalRisk: "Medium",
      expansionPotential: "Medium",
    },
    retentionPlan: {
      strategy: "Service Realignment",
      description: "Full creative refresh on Meta Ads campaigns. New design templates commissioned. Monthly creative review added to account management cadence.",
      assignedOwner: "Tina Webb",
      createdDate: "2025-05-07",
      targetDate: "2025-05-22",
      status: "Saved",
      notes: "Cancellation converted to a formal change request. New creative launched May 22. Client satisfied.",
    },
    aiInsight: {
      cancellationRisk: 55,
      reasonAnalysis: "Service quality concern is specific and actionable. Client is not unhappy with the relationship — only the creative execution. Strong retention candidate with a quality-focused response.",
      revenueImpact: "$50,400 ARR retained. Cancellation converted to service improvement.",
      retentionProbability: 78,
      recommendedStrategy: "Service Realignment",
      suggestedActions: ["Conduct full creative audit", "Involve client in new creative approval process", "Set performance KPIs for new creative"],
      riskFactors: ["Creative quality gap — design team coordination needed", "1 open escalation related to ad performance"],
    },
    activityTimeline: [
      { date: "2025-05-05", step: "Cancellation Request", description: "Nicole Hart submitted cancellation citing poor Meta Ads creative.", actor: "Client", outcome: "Request logged"},
      { date: "2025-05-07", step: "AM Review", description: "Tina Webb reviewed creative quality. Identified legitimate creative gaps.", actor: "Tina Webb", outcome: "Realignment plan created"},
      { date: "2025-05-10", step: "Client Discussion", description: "Call with Nicole Hart. Committed to full creative refresh and monthly review.", actor: "Tina Webb", outcome: "Client agreed to wait for new creative"},
      { date: "2025-05-22", step: "Saved", description: "New creative launched. Client reviewed and approved. Cancellation converted to change request.", actor: "Tina Webb", outcome: "Saved — converted to CR"},
    ],
  },

  // ── Cancelled clients ──────────────────────────────────────────────────────
  {
    id: "cr11",
    client: "Greenwood Legal",
    accountManager: "Tina Webb",
    mrr: 3500,
    arr: 42000,
    reason: "Moving In-house",
    reasonDetail: "Firm hired an internal marketing director. Full in-house transition effective July 1.",
    riskLevel: "Medium",
    healthScore: 76,
    retentionStatus: "Lost",
    status: "Moved To Offboarding",
    requestDate: "2025-05-15",
    lastActionDate: "2025-06-01",
    industry: "Legal",
    clientSince: "2023-05-01",
    services: ["SEO", "Content", "PPC"],
    riskProfile: {
      healthScore: 76,
      projectHealth: 74,
      billingHealth: 82,
      communicationHealth: 80,
      reportingHealth: 76,
      openEscalations: 0,
      renewalRisk: "Low",
      expansionPotential: "Low",
    },
    retentionPlan: {
      strategy: "Custom Retention Plan",
      description: "Proposed hybrid agency-internal model. Offered consulting retainer at $800/mo. Client declined.",
      assignedOwner: "Tina Webb",
      createdDate: "2025-05-18",
      targetDate: "2025-05-30",
      status: "Lost",
      notes: "Client committed to full in-house transition. Smooth relationship maintained. Good referral candidate.",
    },
    aiInsight: {
      cancellationRisk: 95,
      reasonAnalysis: "Internal staffing hire is a non-negotiable driver. Client is not dissatisfied — this is a structural business decision.",
      revenueImpact: "$42,000 ARR lost. Client was a well-managed account — no service issues.",
      retentionProbability: 10,
      recommendedStrategy: "Custom Retention Plan",
      suggestedActions: ["Offer hybrid consulting engagement", "Ensure clean offboarding to maintain referral relationship"],
      riskFactors: ["Structural business decision — not retention-addressable"],
    },
    activityTimeline: [
      { date: "2025-05-15", step: "Cancellation Request", description: "Partner notified firm hired internal marketing director.", actor: "Client", outcome: "Request logged"},
      { date: "2025-05-18", step: "Retention Plan", description: "Hybrid agency model proposed at $800/mo consulting retainer.", actor: "Tina Webb", outcome: "Proposal sent"},
      { date: "2025-05-28", step: "Client Discussion", description: "Final call. Client confirmed full in-house transition.", actor: "Tina Webb", outcome: "Decision: cancelled"},
      { date: "2025-06-01", step: "Cancelled", description: "Cancellation confirmed. Account moved to offboarding.", actor: "System", outcome: "Moved to offboarding"},
    ],
  },
  {
    id: "cr12",
    client: "Westside Pharmacy",
    accountManager: "Maria Santos",
    mrr: 1800,
    arr: 21600,
    reason: "Closing Business",
    reasonDetail: "Owner is closing the pharmacy due to retirement. All marketing services cancelled effective immediately.",
    riskLevel: "Low",
    healthScore: 82,
    retentionStatus: "Lost",
    status: "Cancellation Approved",
    requestDate: "2025-05-28",
    lastActionDate: "2025-06-03",
    industry: "Healthcare",
    clientSince: "2023-02-01",
    services: ["GBP", "SEO"],
    riskProfile: {
      healthScore: 82,
      projectHealth: 80,
      billingHealth: 90,
      communicationHealth: 85,
      reportingHealth: 80,
      openEscalations: 0,
      renewalRisk: "Low",
      expansionPotential: "None",
    },
    retentionPlan: null,
    aiInsight: {
      cancellationRisk: 100,
      reasonAnalysis: "Business closure — no retention action applicable.",
      revenueImpact: "$21,600 ARR lost. Business dissolution is the cause.",
      retentionProbability: 0,
      recommendedStrategy: "Custom Retention Plan",
      suggestedActions: ["Process cancellation with clean offboarding", "Request referral to successor or business partner"],
      riskFactors: ["Business closure — no mitigation possible"],
    },
    activityTimeline: [
      { date: "2025-05-28", step: "Cancellation Request", description: "Owner contacted to inform of pharmacy closure and retirement.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-03", step: "Cancelled", description: "Cancellation approved. Moved to offboarding. Owner requested referral to successor.", actor: "Maria Santos", outcome: "Cancellation approved"},
    ],
  },
  {
    id: "cr13",
    client: "BlueRidge Insurance",
    accountManager: "Maria Santos",
    mrr: 2600,
    arr: 31200,
    reason: "Changing Provider (New Company Name)",
    reasonDetail: "Client received a lower price offer from a competitor agency. Despite retention offer, client chose competitor.",
    riskLevel: "High",
    healthScore: 61,
    retentionStatus: "Lost",
    status: "Moved To Offboarding",
    requestDate: "2025-05-10",
    lastActionDate: "2025-05-30",
    industry: "Insurance",
    clientSince: "2023-08-01",
    services: ["SEO", "Google Ads"],
    riskProfile: {
      healthScore: 61,
      projectHealth: 60,
      billingHealth: 75,
      communicationHealth: 58,
      reportingHealth: 62,
      openEscalations: 1,
      renewalRisk: "High",
      expansionPotential: "Low",
    },
    retentionPlan: {
      strategy: "Budget Adjustment",
      description: "Matched competitor pricing at $2,200/mo. Client declined — went with competitor regardless.",
      assignedOwner: "Maria Santos",
      createdDate: "2025-05-13",
      targetDate: "2025-05-25",
      status: "Lost",
      notes: "Price was not the only factor. Relationship had been cooling. Competitor relationship already established.",
    },
    aiInsight: {
      cancellationRisk: 88,
      reasonAnalysis: "Competitor displacement. Account health was declining for 4 months — communication health at 58 signals relationship cooling before the competitor approached.",
      revenueImpact: "$31,200 ARR lost.",
      retentionProbability: 18,
      recommendedStrategy: "Budget Adjustment",
      suggestedActions: ["Document loss reason for future proactive retention model", "Flag similar health patterns in other accounts"],
      riskFactors: ["Communication health declining trend", "Competitor outreach before retention action taken"],
    },
    activityTimeline: [
      { date: "2025-05-10", step: "Cancellation Request", description: "Client informed competitor presented lower-priced proposal.", actor: "Client", outcome: "Request logged"},
      { date: "2025-05-13", step: "Retention Plan", description: "Counter-proposal: matched competitor pricing at $2,200/mo.", actor: "Maria Santos", outcome: "Proposal sent"},
      { date: "2025-05-25", step: "Client Discussion", description: "Client declined retention offer. Committed to competitor.", actor: "Client", outcome: "Decision: cancelled"},
      { date: "2025-05-30", step: "Cancelled", description: "Cancellation confirmed. Moved to offboarding.", actor: "System", outcome: "Moved to offboarding"},
    ],
  },
  {
    id: "cr14",
    client: "Coastal Plumbing Co.",
    accountManager: "Sarah Chen",
    mrr: 2700,
    arr: 32400,
    reason: "Closing Business",
    reasonDetail: "Owner says business is slow — reducing all external spend. Not a performance complaint.",
    riskLevel: "Medium",
    healthScore: 70,
    retentionStatus: "Decision Pending",
    status: "Retention Attempt",
    requestDate: "2025-06-08",
    lastActionDate: "2025-06-11",
    industry: "Plumbing",
    clientSince: "2023-06-01",
    services: ["PPC", "LSA"],
    riskProfile: {
      healthScore: 70,
      projectHealth: 68,
      billingHealth: 78,
      communicationHealth: 72,
      reportingHealth: 66,
      openEscalations: 0,
      renewalRisk: "Medium",
      expansionPotential: "Medium",
    },
    retentionPlan: {
      strategy: "Temporary Pause",
      description: "Offer 45-day service pause at $300/mo management fee. Resume when business activity picks up.",
      assignedOwner: "Sarah Chen",
      createdDate: "2025-06-09",
      targetDate: "2025-06-20",
      status: "Decision Pending",
      notes: "Client interested in pause. Call scheduled June 14.",
    },
    aiInsight: {
      cancellationRisk: 55,
      reasonAnalysis: "Business slowdown — not a service dissatisfaction driver. Temporary pause is the optimal response to preserve the client relationship.",
      revenueImpact: "$32,400 ARR at moderate risk. Pause option preserves $3,600 ARR and future reactivation.",
      retentionProbability: 62,
      recommendedStrategy: "Temporary Pause",
      suggestedActions: ["Present pause option with nominal management fee", "Propose seasonal reactivation timeline", "Keep relationship active during pause with monthly check-in"],
      riskFactors: ["Seasonal business slowdown — timing-sensitive"],
    },
    activityTimeline: [
      { date: "2025-06-08", step: "Cancellation Request", description: "Owner called to cancel. No service complaints — just reducing spend.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-09", step: "Retention Plan", description: "Pause plan at $300/mo created.", actor: "Sarah Chen", outcome: "Plan ready"},
      { date: "2025-06-11", step: "Client Discussion", description: "Presented pause option. Client interested. Follow-up call June 14.", actor: "Sarah Chen", outcome: "Awaiting decision"},
    ],
  },
  {
    id: "cr15",
    client: "Golden Gate Urgent Care",
    accountManager: "Tina Webb",
    mrr: 4800,
    arr: 57600,
    reason: "Communication Issue",
    reasonDetail: "Client reports inaccurate GBP listing management and delayed reporting. Trust has eroded.",
    riskLevel: "Critical",
    healthScore: 38,
    retentionStatus: "In Progress",
    status: "Executive Review",
    requestDate: "2025-06-02",
    lastActionDate: "2025-06-10",
    industry: "Healthcare",
    clientSince: "2022-11-01",
    services: ["SEO", "Content", "Paid Social", "GBP"],
    riskProfile: {
      healthScore: 38,
      projectHealth: 35,
      billingHealth: 65,
      communicationHealth: 32,
      reportingHealth: 28,
      openEscalations: 3,
      renewalRisk: "Critical",
      expansionPotential: "None",
    },
    retentionPlan: {
      strategy: "Executive Escalation",
      description: "Director apology call. Full GBP audit and correction. Dedicated account supervisor assigned for 60-day remediation. Monthly executive reporting added.",
      assignedOwner: "Tina Webb",
      createdDate: "2025-06-04",
      targetDate: "2025-06-17",
      status: "In Progress",
      notes: "GBP audit completed. Errors corrected. Director call scheduled June 14.",
    },
    aiInsight: {
      cancellationRisk: 80,
      reasonAnalysis: "Service quality failure combined with reporting delays has eroded trust. GBP inaccuracies in healthcare are a compliance and reputation risk — client is right to escalate.",
      revenueImpact: "$57,600 ARR at high risk. Second largest exposure in current cancellation queue.",
      retentionProbability: 42,
      recommendedStrategy: "Executive Escalation",
      suggestedActions: [
        "Complete GBP audit and correction before director call",
        "Deliver written root-cause analysis of reporting delays",
        "Assign dedicated account supervisor for remediation period",
        "Offer service credit for the affected months",
        "Establish weekly executive reporting until trust is restored",
      ],
      riskFactors: [
        "GBP inaccuracies in healthcare — compliance risk",
        "Reporting health at 28 — critical gap",
        "3 open escalations unresolved",
        "Communication health at 32",
      ],
    },
    activityTimeline: [
      { date: "2025-06-02", step: "Cancellation Request", description: "Client submitted formal complaint and cancellation notice citing GBP errors and reporting failures.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-04", step: "AM Review", description: "Tina Webb confirmed GBP errors and reporting gaps. Escalated to director.", actor: "Tina Webb", outcome: "Executive review initiated"},
      { date: "2025-06-04", step: "Retention Plan", description: "Executive escalation plan with GBP audit, account supervisor, and monthly executive reporting.", actor: "Tina Webb", outcome: "Plan approved"},
      { date: "2025-06-10", step: "Client Discussion", description: "GBP audit completed. Errors corrected. Presented remediation plan to client.", actor: "Tina Webb", outcome: "Client agreed to await director call"},
    ],
  },
  {
    id: "cr16",
    client: "Keystone Law Group",
    accountManager: "Tina Webb",
    mrr: 4800,
    arr: 57600,
    reason: "Communication Issue",
    reasonDetail: "Senior partner frustrated with delayed responses and lack of strategic guidance from AM.",
    riskLevel: "High",
    healthScore: 58,
    retentionStatus: "Client Contacted",
    status: "Retention Attempt",
    requestDate: "2025-06-06",
    lastActionDate: "2025-06-12",
    industry: "Legal",
    clientSince: "2022-12-01",
    services: ["SEO", "PPC", "Content"],
    riskProfile: {
      healthScore: 58,
      projectHealth: 60,
      billingHealth: 82,
      communicationHealth: 42,
      reportingHealth: 58,
      openEscalations: 1,
      renewalRisk: "High",
      expansionPotential: "Medium",
    },
    retentionPlan: {
      strategy: "Additional Support",
      description: "AM replaced with senior account director. Weekly strategy sessions introduced. Dedicated Slack channel established for real-time communication.",
      assignedOwner: "Tina Webb",
      createdDate: "2025-06-08",
      targetDate: "2025-06-20",
      status: "Client Contacted",
      notes: "Senior partner responded well to AM upgrade and direct line access.",
    },
    aiInsight: {
      cancellationRisk: 65,
      reasonAnalysis: "Communication and responsiveness failure from AM side. Long-standing client with strong billing health — highly retainable with accountability and relationship repair.",
      revenueImpact: "$57,600 ARR at high risk.",
      retentionProbability: 70,
      recommendedStrategy: "Additional Support",
      suggestedActions: [
        "Assign senior account director with direct client access",
        "Establish dedicated communication channel",
        "Review and resolve the 1 open escalation immediately",
        "Schedule monthly strategic review sessions",
      ],
      riskFactors: ["AM responsiveness failure", "Communication health at 42", "1 open escalation pending"],
    },
    activityTimeline: [
      { date: "2025-06-06", step: "Cancellation Request", description: "Senior partner sent letter of intent to cancel citing AM communication failures.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-08", step: "Retention Plan", description: "AM upgraded to senior account director. Weekly sessions and dedicated channel proposed.", actor: "Tina Webb", outcome: "Plan created"},
      { date: "2025-06-12", step: "Client Discussion", description: "Call with senior partner. Presented new AM assignment and communication structure.", actor: "Tina Webb", outcome: "Partner open to staying — evaluation period agreed"},
    ],
  },
  {
    id: "cr17",
    client: "Pacific Dental",
    accountManager: "Tina Webb",
    mrr: 3200,
    arr: 38400,
    reason: "Not Performing",
    reasonDetail: "Client unhappy with GBP ranking stagnation. Competitor clinics outranking in local maps.",
    riskLevel: "Medium",
    healthScore: 65,
    retentionStatus: "In Progress",
    status: "Under Review",
    requestDate: "2025-06-09",
    lastActionDate: "2025-06-10",
    industry: "Dental",
    clientSince: "2023-08-10",
    services: ["SEO", "Reporting", "GBP"],
    riskProfile: {
      healthScore: 65,
      projectHealth: 62,
      billingHealth: 80,
      communicationHealth: 68,
      reportingHealth: 60,
      openEscalations: 0,
      renewalRisk: "Medium",
      expansionPotential: "Medium",
    },
    retentionPlan: {
      strategy: "Service Realignment",
      description: "GBP authority sprint: citation cleanup, review acceleration, competitor gap analysis, and monthly GBP health report.",
      assignedOwner: "Tina Webb",
      createdDate: "2025-06-10",
      targetDate: "2025-06-25",
      status: "In Progress",
      notes: "Retention plan in early development. Client has not yet been contacted.",
    },
    aiInsight: {
      cancellationRisk: 53,
      reasonAnalysis: "GBP ranking is a specific, measurable concern. A focused GBP authority sprint with competitive analysis can demonstrate progress within 30 days.",
      revenueImpact: "$38,400 ARR at moderate risk.",
      retentionProbability: 67,
      recommendedStrategy: "Service Realignment",
      suggestedActions: [
        "Conduct competitor GBP audit for local maps ranking gap",
        "Launch citation cleanup and review acceleration campaign",
        "Deliver weekly GBP ranking update for first 30 days",
        "Set ranking milestone targets for 30, 60, and 90 days",
      ],
      riskFactors: ["GBP stagnation — competitor activity increasing", "Reporting health at 60 — some delivery concerns"],
    },
    activityTimeline: [
      { date: "2025-06-09", step: "Cancellation Request", description: "Dr. Brian Ngo emailed requesting cancellation citing GBP ranking issues.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-10", step: "AM Review", description: "Tina Webb reviewed GBP performance. Competitor gap identified. Realignment plan drafted.", actor: "Tina Webb", outcome: "Under review"},
    ],
  },
  {
    id: "cr18",
    client: "Blue Sky Solar",
    accountManager: "Maria Santos",
    mrr: 5100,
    arr: 61200,
    reason: "Not Performing",
    reasonDetail: "Client in onboarding, frustrated with campaign setup delays. Wants results faster.",
    riskLevel: "High",
    healthScore: 60,
    retentionStatus: "Client Contacted",
    status: "Retention Attempt",
    requestDate: "2025-06-08",
    lastActionDate: "2025-06-11",
    industry: "Solar",
    clientSince: "2025-01-15",
    services: ["SEO", "Meta Ads", "Content", "Design"],
    riskProfile: {
      healthScore: 60,
      projectHealth: 48,
      billingHealth: 82,
      communicationHealth: 62,
      reportingHealth: 50,
      openEscalations: 1,
      renewalRisk: "High",
      expansionPotential: "High",
    },
    retentionPlan: {
      strategy: "Additional Support",
      description: "Dedicated launch manager assigned. Meta Ads campaign live by June 18. SEO content sprint to publish 8 pieces by end of June. Weekly progress calls.",
      assignedOwner: "Maria Santos",
      createdDate: "2025-06-09",
      targetDate: "2025-06-18",
      status: "Client Contacted",
      notes: "James Brennan agreed to give it 30 more days with the accelerated launch plan.",
    },
    aiInsight: {
      cancellationRisk: 62,
      reasonAnalysis: "New client with high expectations — onboarding pace did not match promises made during sales. Delivery acceleration is the immediate retention priority.",
      revenueImpact: "$61,200 ARR at risk. High expansion potential means LTV is significantly higher than current MRR.",
      retentionProbability: 65,
      recommendedStrategy: "Additional Support",
      suggestedActions: [
        "Launch Meta Ads within 7 days — no further delays",
        "Assign dedicated launch manager",
        "Set a 30-day performance checkpoint",
        "Review and close the 1 open escalation",
      ],
      riskFactors: ["Onboarding delay misaligned with sales promises", "Project health at 48 — critical for new client", "1 open escalation from client"],
    },
    activityTimeline: [
      { date: "2025-06-08", step: "Cancellation Request", description: "James Brennan called AM to request cancellation. Campaign still not fully launched.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-09", step: "Retention Plan", description: "Accelerated launch plan: Meta Ads live June 18, SEO sprint started.", actor: "Maria Santos", outcome: "Plan created"},
      { date: "2025-06-11", step: "Client Discussion", description: "Presented accelerated plan. Client agreed to 30-day evaluation period.", actor: "Maria Santos", outcome: "Retention period active"},
    ],
  },
  {
    id: "cr19",
    client: "Apex Roofing",
    accountManager: "Sarah Chen",
    mrr: 2800,
    arr: 33600,
    reason: "Pending Client Confirmation",
    reasonDetail: "Client acquired by a national franchise that has a preferred agency contract. Cannot continue.",
    riskLevel: "Low",
    healthScore: 92,
    retentionStatus: "Lost",
    status: "Cancellation Approved",
    requestDate: "2025-06-01",
    lastActionDate: "2025-06-08",
    industry: "Roofing",
    clientSince: "2023-09-01",
    services: ["SEO", "GBP", "Google Ads"],
    riskProfile: {
      healthScore: 92,
      projectHealth: 90,
      billingHealth: 95,
      communicationHealth: 92,
      reportingHealth: 88,
      openEscalations: 0,
      renewalRisk: "Low",
      expansionPotential: "None",
    },
    retentionPlan: null,
    aiInsight: {
      cancellationRisk: 100,
      reasonAnalysis: "Corporate acquisition with mandatory agency consolidation. No retention action applicable — client is genuinely satisfied but contractually obligated to change.",
      revenueImpact: "$33,600 ARR lost. Client was one of the healthiest in the portfolio.",
      retentionProbability: 0,
      recommendedStrategy: "Custom Retention Plan",
      suggestedActions: [
        "Offer services to the acquiring franchise where possible",
        "Request formal referral letter and case study permission",
        "Ensure clean offboarding to maintain relationship",
      ],
      riskFactors: ["Corporate mandate — not addressable through retention"],
    },
    activityTimeline: [
      { date: "2025-06-01", step: "Cancellation Request", description: "Mark Hardin notified of acquisition and preferred agency mandate.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-08", step: "Cancelled", description: "Cancellation approved. Client provided referral and authorized case study use.", actor: "Sarah Chen", outcome: "Cancellation approved — referral secured"},
    ],
  },
  {
    id: "cr20",
    client: "CloudPath Tech",
    accountManager: "Maria Santos",
    mrr: 4600,
    arr: 55200,
    reason: "Pricing/Financial Hardship",
    reasonDetail: "Startup experiencing funding gap. CFO froze all discretionary spend pending Series B close.",
    riskLevel: "High",
    healthScore: 74,
    retentionStatus: "Decision Pending",
    status: "Retention Attempt",
    requestDate: "2025-06-07",
    lastActionDate: "2025-06-11",
    industry: "Technology",
    clientSince: "2024-02-01",
    services: ["SEO", "Content", "LinkedIn Ads"],
    riskProfile: {
      healthScore: 74,
      projectHealth: 72,
      billingHealth: 60,
      communicationHealth: 78,
      reportingHealth: 74,
      openEscalations: 0,
      renewalRisk: "High",
      expansionPotential: "High",
    },
    retentionPlan: {
      strategy: "Temporary Pause",
      description: "Pause all paid services. Retain SEO retainer at $1,200/mo to maintain organic momentum. Resume full services upon Series B close.",
      assignedOwner: "Maria Santos",
      createdDate: "2025-06-09",
      targetDate: "2025-06-18",
      status: "Decision Pending",
      notes: "CFO is reviewing the pause option. Series B expected to close Q3 2025.",
    },
    aiInsight: {
      cancellationRisk: 65,
      reasonAnalysis: "Startup funding gap — temporary and external. Client is healthy and satisfied. Pause strategy preserves the relationship through the funding gap.",
      revenueImpact: "$55,200 ARR at risk. Pause preserves $14,400 ARR and full reactivation upon funding.",
      retentionProbability: 72,
      recommendedStrategy: "Temporary Pause",
      suggestedActions: [
        "Structure pause agreement with reactivation clause tied to Series B",
        "Preserve SEO retainer to maintain organic growth during pause",
        "Schedule monthly check-in during pause period",
        "Prepare expansion proposal for Series B announcement",
      ],
      riskFactors: ["Funding gap — external factor", "Billing health at 60 — invoice timing sensitive"],
    },
    activityTimeline: [
      { date: "2025-06-07", step: "Cancellation Request", description: "CFO contacted requesting cancellation. Cited funding gap and spend freeze.", actor: "Client", outcome: "Request logged"},
      { date: "2025-06-09", step: "Retention Plan", description: "Pause plan created: retain SEO at $1,200/mo, pause paid channels.", actor: "Maria Santos", outcome: "Plan created"},
      { date: "2025-06-11", step: "Client Discussion", description: "Presented pause structure to CFO. Interested in the SEO-only maintenance option.", actor: "Maria Santos", outcome: "Awaiting CFO approval"},
    ],
  },
];

// ── Computed Helpers ───────────────────────────────────────────────────────────

export function getOpenRequests(): CancellationRequest[] {
  return CANCELLATION_REQUESTS.filter((r) =>
    !["Cancellation Approved", "Moved To Offboarding"].includes(r.status)
  );
}

export function getSavedClients(): CancellationRequest[] {
  return CANCELLATION_REQUESTS.filter(
    (r) =>
      r.retentionStatus === "Saved"||
      r.status === "Cancellation Withdrawn"||
      r.status === "Converted To Change Request"||
      r.status === "Converted To Renewal"||
      r.status === "Converted To Downgrade");
}

export function getCancelledClients(): CancellationRequest[] {
  return CANCELLATION_REQUESTS.filter(
    (r) =>
      r.retentionStatus === "Lost"||
      r.status === "Cancellation Approved"||
      r.status === "Moved To Offboarding");
}

export function getRevenueAtRisk(): number {
  return getOpenRequests().reduce((sum, r) => sum + r.mrr, 0);
}

export function getARRAtRisk(): number {
  return getOpenRequests().reduce((sum, r) => sum + r.arr, 0);
}

export function getCancelledRevenue(): number {
  return getCancelledClients().reduce((sum, r) => sum + r.mrr, 0);
}

export function getRetentionSuccessRate(): number {
  const decided = [...getSavedClients(), ...getCancelledClients()];
  if (decided.length === 0) return 0;
  return Math.round((getSavedClients().length / decided.length) * 100);
}

export function getPendingSaveAttempts(): CancellationRequest[] {
  return CANCELLATION_REQUESTS.filter(
    (r) =>
      r.retentionPlan !== null &&
      ["Not Started", "In Progress", "Client Contacted", "Decision Pending"].includes(
        r.retentionStatus
      )
  );
}

export function getReasonBreakdown(): Record<CancellationReason, number> {
  const breakdown: Partial<Record<CancellationReason, number>> = {};
  for (const r of CANCELLATION_REQUESTS) {
    breakdown[r.reason] = (breakdown[r.reason] ?? 0) + 1;
  }
  return breakdown as Record<CancellationReason, number>;
}
