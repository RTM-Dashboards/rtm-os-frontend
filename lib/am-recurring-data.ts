// ── Mock data for Account Management recurring client dashboard ───────────────

export type PaymentStatus = "Current"| "Overdue"| "Payment Failed"| "Cancelled / Offboarding"| "Renewal Upcoming";
export type DeliverableStatus = "Not Started"| "In Progress"| "Blocked"| "Waiting for Client"| "Ready for Review"| "Completed"| "Delayed";
export type PerformanceStatus = "Healthy"| "Needs Attention"| "At Risk"| "Critical"| "Improving"| "Declining";
export type RiskStatus = "No Risk"| "Low"| "Medium"| "High"| "Critical";
export type ClientHealth = "Excellent"| "Good"| "Fair"| "Poor"| "Critical";

export type TaskStatus = DeliverableStatus;

export interface DeptTaskStatus {
  dept: string;
  status: TaskStatus;
}

export interface RecurringClient {
  id: string;
  name: string;
  industry: string;
  location: string;
  website: string;
  assignedAM: string;
  activeServices: string[];
  paymentStatus: PaymentStatus;
  deliverableStatus: DeliverableStatus;
  deptTaskStatus: DeptTaskStatus[];
  reportStatus: string;
  performanceStatus: PerformanceStatus;
  clientHealth: ClientHealth;
  riskStatus: RiskStatus;
  lastCheckin: string;
  nextCheckin: string;
  renewalDate: string;
  lastContact: string;
  nextContact: string;
  billingStatus: string;
  aiSummary: string;
  aiRisk: string;
  aiRenewalRisk: string;
  aiUpsell: string;
  aiAMAction: string;
  aiDeptAction: string;
  aiClientComm: string;
  seasonalContext: string;
  seasonalOpportunity: string;
  seasonalAction: string;
  checkinNotes: string;
  checkinType: string;
}

export const accountManagers = [
  "Sarah Chen",
  "Maria Santos",
  "James Rivera",
  "Tina Webb",
];

export const recurringClients: RecurringClient[] = [
  {
    id: "rc001",
    name: "Apex Roofing",
    industry: "Home Services – Roofing",
    location: "Phoenix, AZ",
    website: "apexroofing.com",
    assignedAM: "Sarah Chen",
    activeServices: ["SEO", "GBP", "Meta Ads", "LSA"],
    paymentStatus: "Current",
    deliverableStatus: "Completed",
    deptTaskStatus: [
      { dept: "SEO",           status: "Completed"},
      { dept: "GBP",           status: "Completed"},
      { dept: "Meta Ads",      status: "In Progress"},
      { dept: "Google Ads",    status: "Not Started"},
      { dept: "Content",       status: "Completed"},
      { dept: "Web Dev",       status: "Not Started"},
      { dept: "Reporting",     status: "Completed"},
      { dept: "LSA",           status: "Completed"},
    ],
    reportStatus: "Sent",
    performanceStatus: "Healthy",
    clientHealth: "Excellent",
    riskStatus: "No Risk",
    lastCheckin: "Jun 2, 2025",
    nextCheckin: "Jul 2, 2025",
    renewalDate: "Sep 1, 2025",
    lastContact: "Jun 2, 2025",
    nextContact: "Jun 16, 2025",
    billingStatus: "Paid",
    aiSummary: "Apex Roofing is performing strongly across all channels. Organic leads up 18% MoM. LSA cost-per-lead improved by 12%. No churn signals.",
    aiRisk: "Minimal risk. Renewal is 3 months away — good time to begin renewal conversation.",
    aiRenewalRisk: "Low — long-term client with consistent payment and growth.",
    aiUpsell: "Consider Google Ads add-on. High seasonal storm demand predicted for Phoenix summer.",
    aiAMAction: "Schedule renewal discussion in 30 days. Present Google Ads proposal.",
    aiDeptAction: "Paid Ads team: prepare Google Ads onboarding proposal for Apex.",
    aiClientComm: "Send monthly performance summary email with positive trend highlights.",
    seasonalContext: "Phoenix, AZ — Summer 2025",
    seasonalOpportunity: "Summer storm season increases roofing demand significantly in Arizona.",
    seasonalAction: "Increase LSA budget by 20% for June–August. Add storm damage keywords to Google Ads.",
    checkinNotes: "Client happy with results. Interested in expanding. No concerns.",
    checkinType: "Monthly Video Call",
  },
  {
    id: "rc002",
    name: "Pacific Dental",
    industry: "Healthcare – Dental",
    location: "San Diego, CA",
    website: "pacificdental.com",
    assignedAM: "Maria Santos",
    activeServices: ["SEO", "Meta Ads", "Google Ads", "Content"],
    paymentStatus: "Current",
    deliverableStatus: "In Progress",
    deptTaskStatus: [
      { dept: "SEO",        status: "In Progress"},
      { dept: "GBP",        status: "Not Started"},
      { dept: "Meta Ads",   status: "Waiting for Client"},
      { dept: "Google Ads", status: "In Progress"},
      { dept: "Content",    status: "Delayed"},
      { dept: "Web Dev",    status: "Not Started"},
      { dept: "Reporting",  status: "In Progress"},
      { dept: "LSA",        status: "Not Started"},
    ],
    reportStatus: "QA In Progress",
    performanceStatus: "Needs Attention",
    clientHealth: "Fair",
    riskStatus: "Medium",
    lastCheckin: "May 28, 2025",
    nextCheckin: "Jun 11, 2025",
    renewalDate: "Dec 1, 2025",
    lastContact: "May 28, 2025",
    nextContact: "Jun 11, 2025",
    billingStatus: "Paid",
    aiSummary: "Content deliverables are delayed by 1 week. Meta Ads paused awaiting client creative approval. Performance slightly below target.",
    aiRisk: "Medium risk — creative delays compounding. Client has expressed mild frustration in last check-in.",
    aiRenewalRisk: "Medium — performance must improve before December renewal.",
    aiUpsell: "Add GBP management — Pacific Dental lacks local map pack visibility.",
    aiAMAction: "Escalate content delay to Content team. Follow up on Meta creative approval today.",
    aiDeptAction: "Content team: expedite blog post for Pacific Dental this week. Meta team: client creative needed.",
    aiClientComm: "Send proactive update email acknowledging delays with revised timeline and action plan.",
    seasonalContext: "San Diego, CA — Summer 2025",
    seasonalOpportunity: "Summer dental checkup demand peaks — ideal for back-to-school campaign.",
    seasonalAction: "Launch back-to-school dental checkup Google Ads campaign in July.",
    checkinNotes: "Client asked about content schedule. Showed mild concern about delays. Needs update.",
    checkinType: "Bi-weekly Call",
  },
  {
    id: "rc003",
    name: "Harbor Auto",
    industry: "Automotive – Repair",
    location: "Seattle, WA",
    website: "harborauto.com",
    assignedAM: "Sarah Chen",
    activeServices: ["SEO", "GBP"],
    paymentStatus: "Overdue",
    deliverableStatus: "Blocked",
    deptTaskStatus: [
      { dept: "SEO",        status: "Blocked"},
      { dept: "GBP",        status: "In Progress"},
      { dept: "Meta Ads",   status: "Not Started"},
      { dept: "Google Ads", status: "Not Started"},
      { dept: "Content",    status: "Not Started"},
      { dept: "Web Dev",    status: "Not Started"},
      { dept: "Reporting",  status: "In Progress"},
      { dept: "LSA",        status: "Not Started"},
    ],
    reportStatus: "In Progress",
    performanceStatus: "At Risk",
    clientHealth: "Poor",
    riskStatus: "High",
    lastCheckin: "May 15, 2025",
    nextCheckin: "Jun 10, 2025",
    renewalDate: "Jul 1, 2025",
    lastContact: "May 15, 2025",
    nextContact: "Jun 10, 2025",
    billingStatus: "Overdue — 12 days",
    aiSummary: "Harbor Auto has an overdue payment and a blocked SEO task awaiting client website access. Renewal is in less than 30 days. High churn risk.",
    aiRisk: "High — payment overdue, task blocked, renewal imminent. Client unresponsive to last 2 outreach attempts.",
    aiRenewalRisk: "High — renewal July 1. Must resolve payment and communication gap immediately.",
    aiUpsell: "Hold upsell until account is stabilized.",
    aiAMAction: "Escalate to AM Manager. Initiate payment follow-up call. Attempt client contact today.",
    aiDeptAction: "SEO team: hold tasks pending website access. No new work until access resolved.",
    aiClientComm: "Send formal follow-up with invoice and access request. CC AM Manager.",
    seasonalContext: "Seattle, WA — Summer 2025",
    seasonalOpportunity: "Summer driving season increases auto repair demand in Seattle.",
    seasonalAction: "Once account is stabilized, propose summer tune-up campaign.",
    checkinNotes: "Missed last two scheduled check-ins. No response to emails. Payment overdue.",
    checkinType: "Monthly Call — MISSED",
  },
  {
    id: "rc004",
    name: "Radiance MedSpa",
    industry: "Healthcare – MedSpa",
    location: "Los Angeles, CA",
    website: "radiancemedspa.com",
    assignedAM: "Tina Webb",
    activeServices: ["SEO", "Meta Ads", "Content", "GBP"],
    paymentStatus: "Current",
    deliverableStatus: "Ready for Review",
    deptTaskStatus: [
      { dept: "SEO",        status: "Ready for Review"},
      { dept: "GBP",        status: "Completed"},
      { dept: "Meta Ads",   status: "Completed"},
      { dept: "Google Ads", status: "Not Started"},
      { dept: "Content",    status: "Ready for Review"},
      { dept: "Web Dev",    status: "Not Started"},
      { dept: "Reporting",  status: "Ready for Review"},
      { dept: "LSA",        status: "Not Started"},
    ],
    reportStatus: "Ready for QA",
    performanceStatus: "Improving",
    clientHealth: "Good",
    riskStatus: "Low",
    lastCheckin: "Jun 1, 2025",
    nextCheckin: "Jul 1, 2025",
    renewalDate: "Nov 1, 2025",
    lastContact: "Jun 1, 2025",
    nextContact: "Jun 15, 2025",
    billingStatus: "Paid",
    aiSummary: "Radiance MedSpa showing strong improvement in Meta Ads performance. Summer medspa demand rising. Strong client relationship.",
    aiRisk: "Low risk. Content approval pending — minor delay possible.",
    aiRenewalRisk: "Low — client satisfied. Renewal 5 months out.",
    aiUpsell: "Propose Google Ads for competitor conquesting in LA medspa market.",
    aiAMAction: "Review pending SEO and content deliverables. Send progress update to client.",
    aiDeptAction: "SEO team: finalize monthly SEO report. Content team: submit content for client review.",
    aiClientComm: "Positive performance update email with summer campaign preview.",
    seasonalContext: "Los Angeles, CA — Summer 2025",
    seasonalOpportunity: "Summer demand for body contouring, laser treatments, and skin care peaks in LA.",
    seasonalAction: "Launch summer medspa promo campaign on Meta and Google. Target body contouring and laser keywords.",
    checkinNotes: "Client excited about recent traffic gains. Open to expanding services.",
    checkinType: "Monthly Video Call",
  },
  {
    id: "rc005",
    name: "Summit Landscaping",
    industry: "Home Services – Landscaping",
    location: "Denver, CO",
    website: "summitlandscaping.com",
    assignedAM: "James Rivera",
    activeServices: ["GBP", "SEO", "LSA"],
    paymentStatus: "Renewal Upcoming",
    deliverableStatus: "Delayed",
    deptTaskStatus: [
      { dept: "SEO",        status: "Delayed"},
      { dept: "GBP",        status: "Delayed"},
      { dept: "Meta Ads",   status: "Not Started"},
      { dept: "Google Ads", status: "Not Started"},
      { dept: "Content",    status: "Not Started"},
      { dept: "Web Dev",    status: "Not Started"},
      { dept: "Reporting",  status: "Delayed"},
      { dept: "LSA",        status: "In Progress"},
    ],
    reportStatus: "Overdue",
    performanceStatus: "Declining",
    clientHealth: "Fair",
    riskStatus: "Medium",
    lastCheckin: "May 20, 2025",
    nextCheckin: "Jun 12, 2025",
    renewalDate: "Jun 30, 2025",
    lastContact: "May 20, 2025",
    nextContact: "Jun 12, 2025",
    billingStatus: "Current — Renewal in 25 days",
    aiSummary: "Summit Landscaping has multiple delayed deliverables and an overdue report. Renewal in 25 days. Need to show value urgently.",
    aiRisk: "Medium — renewal at risk if deliverables and performance aren't improved in next 3 weeks.",
    aiRenewalRisk: "Medium-High — overdue report + delays create perception of poor service before renewal.",
    aiUpsell: "Post-renewal, propose Meta Ads for spring/summer landscaping campaigns.",
    aiAMAction: "Prioritize Summit deliverables immediately. Schedule renewal prep call before Jun 20.",
    aiDeptAction: "SEO + GBP: expedite Summit Landscaping tasks. Reporting: send overdue report by Jun 8.",
    aiClientComm: "Proactive renewal conversation email with performance highlights and next 6-month roadmap.",
    seasonalContext: "Denver, CO — Summer 2025",
    seasonalOpportunity: "Spring and summer peak season for landscaping demand in Colorado.",
    seasonalAction: "Highlight summer landscaping demand in renewal conversation. Propose seasonal LSA increase.",
    checkinNotes: "Client asked about report status. Mentioned they are evaluating other vendors.",
    checkinType: "Monthly Call",
  },
];

// ── Derived KPIs ───────────────────────────────────────────────────────────────
export function getManagerKPIs() {
  return {
    activeRecurringClients: recurringClients.length,
    clientsAtRisk:          recurringClients.filter((c) => c.riskStatus === "High"|| c.riskStatus === "Critical").length,
    clientsLatePayments:    recurringClients.filter((c) => c.paymentStatus === "Overdue"|| c.paymentStatus === "Payment Failed").length,
    deliverablesDelayed:    recurringClients.filter((c) => c.deliverableStatus === "Delayed"|| c.deliverableStatus === "Blocked").length,
    reportsDue:             recurringClients.filter((c) => c.reportStatus === "In Progress"|| c.reportStatus === "Draft").length,
    checkinsDue:            recurringClients.filter((c) => new Date(c.nextCheckin) <= new Date("2025-06-15")).length,
    performanceIssues:      recurringClients.filter((c) => c.performanceStatus === "At Risk"|| c.performanceStatus === "Critical"|| c.performanceStatus === "Declining").length,
    renewalOpportunities:   recurringClients.filter((c) => c.paymentStatus === "Renewal Upcoming"|| c.renewalDate <= "Jul 31, 2025").length,
  };
}

export function getAMKPIs(am: string) {
  const myClients = recurringClients.filter((c) => c.assignedAM === am);
  return {
    myRecurringClients: myClients.length,
    latePayments:       myClients.filter((c) => c.paymentStatus === "Overdue"|| c.paymentStatus === "Payment Failed").length,
    deliverablesThisWeek: myClients.filter((c) => c.deliverableStatus === "Ready for Review"|| c.deliverableStatus === "In Progress").length,
    deliverablesDelayed:  myClients.filter((c) => c.deliverableStatus === "Delayed"|| c.deliverableStatus === "Blocked").length,
    reportsDue:           myClients.filter((c) => c.reportStatus === "In Progress"|| c.reportStatus === "Overdue").length,
    checkinsScheduled:    myClients.filter((c) => !!c.nextCheckin).length,
    clientsAtRisk:        myClients.filter((c) => c.riskStatus === "High"|| c.riskStatus === "Critical").length,
    renewalOpportunities: myClients.filter((c) => c.paymentStatus === "Renewal Upcoming").length,
  };
}
