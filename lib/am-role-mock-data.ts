// ── AM Role Mock Data ──────────────────────────────────────────────────────────
// Shared mock data for Account Management role-based views.
// Account Management Head sees all AMs and all clients.
// Account Manager Sarah Chen sees only her assigned clients.

export type AMRole = "head" | "am";

export const AM_NAMES = ["Sarah Chen", "Maria Santos", "James Park", "Tina Webb"] as const;
export type AMName = (typeof AM_NAMES)[number];

export const SARAH = "Sarah Chen" as const;

// ── Clients ───────────────────────────────────────────────────────────────────

export interface AMClient {
  id: string;
  name: string;
  industry: string;
  location: string;
  assignedAM: AMName;
  services: string[];
  paymentStatus: "Current" | "Overdue" | "Renewal Upcoming" | "Payment Failed";
  healthStatus: "Healthy" | "Needs Attention" | "At Risk" | "Critical";
  healthScore: number;
  renewalDate: string;
  lastCheckin: string;
  nextCheckin: string;
  riskLevel: "No Risk" | "Low" | "Medium" | "High" | "Critical";
  performanceTrend: "↑ Improving" | "→ Stable" | "↓ Declining" | "↓ Critical";
  contractValue: string;
  aiSummary: string;
}

export const ALL_CLIENTS: AMClient[] = [
  // Sarah Chen's clients
  {
    id: "c1",
    name: "Apex Roofing",
    industry: "Roofing",
    location: "Phoenix, AZ",
    assignedAM: "Sarah Chen",
    services: ["SEO", "GBP", "Google Ads"],
    paymentStatus: "Current",
    healthStatus: "Healthy",
    healthScore: 92,
    renewalDate: "Sep 1, 2025",
    lastCheckin: "Jun 2, 2025",
    nextCheckin: "Jul 2, 2025",
    riskLevel: "No Risk",
    performanceTrend: "↑ Improving",
    contractValue: "$2,800/mo",
    aiSummary: "Lead volume up 22% MoM. Storm season upsell opportunity via LSA.",
  },
  {
    id: "c2",
    name: "Harbor Auto",
    industry: "Automotive",
    location: "Seattle, WA",
    assignedAM: "Sarah Chen",
    services: ["Google Ads", "SEO"],
    paymentStatus: "Overdue",
    healthStatus: "At Risk",
    healthScore: 48,
    renewalDate: "Jul 11, 2025",
    lastCheckin: "May 15, 2025",
    nextCheckin: "Jun 10, 2025",
    riskLevel: "High",
    performanceTrend: "↓ Declining",
    contractValue: "$3,200/mo",
    aiSummary: "Overdue payment. Lead volume down 28%. Immediate intervention needed.",
  },
  {
    id: "c3",
    name: "Lakeview Dental",
    industry: "Dental",
    location: "Chicago, IL",
    assignedAM: "Sarah Chen",
    services: ["SEO", "Reporting"],
    paymentStatus: "Overdue",
    healthStatus: "Critical",
    healthScore: 22,
    renewalDate: "Jun 30, 2025",
    lastCheckin: "Apr 30, 2025",
    nextCheckin: "Jun 10, 2025",
    riskLevel: "Critical",
    performanceTrend: "↓ Critical",
    contractValue: "$1,500/mo",
    aiSummary: "Payment 45 days overdue. Renewal risk critical. Executive escalation required.",
  },
  // Maria Santos's clients
  {
    id: "c4",
    name: "Pacific Dental",
    industry: "Dental",
    location: "San Diego, CA",
    assignedAM: "Maria Santos",
    services: ["SEO", "Content", "Reporting"],
    paymentStatus: "Current",
    healthStatus: "Needs Attention",
    healthScore: 71,
    renewalDate: "Dec 1, 2025",
    lastCheckin: "May 28, 2025",
    nextCheckin: "Jun 11, 2025",
    riskLevel: "Low",
    performanceTrend: "→ Stable",
    contractValue: "$2,400/mo",
    aiSummary: "No check-in in 30 days. Report due in 3 days. Back-to-school campaign opportunity.",
  },
  {
    id: "c5",
    name: "Radiance MedSpa",
    industry: "MedSpa",
    location: "Los Angeles, CA",
    assignedAM: "Maria Santos",
    services: ["Meta Ads", "SEO", "GBP"],
    paymentStatus: "Current",
    healthStatus: "Healthy",
    healthScore: 79,
    renewalDate: "Oct 1, 2025",
    lastCheckin: "Jun 1, 2025",
    nextCheckin: "Jun 15, 2025",
    riskLevel: "Low",
    performanceTrend: "↑ Improving",
    contractValue: "$3,600/mo",
    aiSummary: "Summer laser treatment campaign opportunity. Expanding well.",
  },
  {
    id: "c6",
    name: "Metro Plumbing",
    industry: "Home Services",
    location: "Chicago, IL",
    assignedAM: "Maria Santos",
    services: ["SEO", "GBP", "Reporting"],
    paymentStatus: "Current",
    healthStatus: "Needs Attention",
    healthScore: 63,
    renewalDate: "Sep 15, 2025",
    lastCheckin: "May 25, 2025",
    nextCheckin: "Jun 8, 2025",
    riskLevel: "Medium",
    performanceTrend: "→ Stable",
    contractValue: "$1,800/mo",
    aiSummary: "Seasonal winter campaign planning needed. Satisfaction survey pending.",
  },
  // James Park's clients
  {
    id: "c7",
    name: "Summit Landscaping",
    industry: "Landscaping",
    location: "Denver, CO",
    assignedAM: "James Park",
    services: ["Meta Ads", "LSA", "Google Ads"],
    paymentStatus: "Current",
    healthStatus: "Needs Attention",
    healthScore: 58,
    renewalDate: "Aug 15, 2025",
    lastCheckin: "May 20, 2025",
    nextCheckin: "Jun 5, 2025",
    riskLevel: "Medium",
    performanceTrend: "↓ Declining",
    contractValue: "$2,100/mo",
    aiSummary: "CPL up 34%. Spring season opportunity. Deliverables delayed.",
  },
  {
    id: "c8",
    name: "Pinnacle HVAC",
    industry: "HVAC",
    location: "Phoenix, AZ",
    assignedAM: "James Park",
    services: ["Google Ads", "LSA", "Reporting"],
    paymentStatus: "Current",
    healthStatus: "Healthy",
    healthScore: 85,
    renewalDate: "Nov 1, 2025",
    lastCheckin: "Jun 3, 2025",
    nextCheckin: "Jul 3, 2025",
    riskLevel: "No Risk",
    performanceTrend: "→ Stable",
    contractValue: "$4,500/mo",
    aiSummary: "Summer heat wave = AC surge. Recommend 30% budget increase.",
  },
  // Tina Webb's clients
  {
    id: "c9",
    name: "NorthStar Dental",
    industry: "Dental",
    location: "Minneapolis, MN",
    assignedAM: "Tina Webb",
    services: ["Meta Ads", "Reporting"],
    paymentStatus: "Current",
    healthStatus: "Healthy",
    healthScore: 80,
    renewalDate: "Nov 15, 2025",
    lastCheckin: "Jun 1, 2025",
    nextCheckin: "Jul 1, 2025",
    riskLevel: "No Risk",
    performanceTrend: "↑ Improving",
    contractValue: "$3,200/mo",
    aiSummary: "Strong Meta performance. Back-to-school campaign recommended.",
  },
  {
    id: "c10",
    name: "Bright Dental Studio",
    industry: "Dental",
    location: "Austin, TX",
    assignedAM: "Tina Webb",
    services: ["SEO", "GBP", "Google Ads"],
    paymentStatus: "Renewal Upcoming",
    healthStatus: "Needs Attention",
    healthScore: 67,
    renewalDate: "Jul 20, 2025",
    lastCheckin: "May 29, 2025",
    nextCheckin: "Jun 14, 2025",
    riskLevel: "Medium",
    performanceTrend: "→ Stable",
    contractValue: "$2,200/mo",
    aiSummary: "Renewal upcoming. Upsell Content package opportunity.",
  },
];

export function getClientsByAM(am: AMName): AMClient[] {
  return ALL_CLIENTS.filter((c) => c.assignedAM === am);
}

export function getWorkloadSummary() {
  return AM_NAMES.map((am) => {
    const clients = getClientsByAM(am);
    const atRisk = clients.filter((c) => c.riskLevel === "High" || c.riskLevel === "Critical").length;
    const overdue = clients.filter((c) => c.paymentStatus === "Overdue").length;
    return { am, total: clients.length, atRisk, overdue };
  });
}

// ── Onboarding ────────────────────────────────────────────────────────────────

export interface OnboardingRecord {
  id: string;
  client: string;
  assignedAM: AMName;
  stage: string;
  startDate: string;
  services: string[];
  notes: string;
}

export const ALL_ONBOARDING: OnboardingRecord[] = [
  { id: "o1", client: "Apex Roofing", assignedAM: "Sarah Chen", stage: "Intake In Progress", startDate: "2025-06-20", services: ["SEO", "GBP", "Google Ads"], notes: "Discovery call scheduled Jul 1." },
  { id: "o2", client: "PeakFit Gym", assignedAM: "Maria Santos", stage: "Service Activation", startDate: "2025-06-28", services: ["SEO", "Meta Ads", "GBP"], notes: "Intake complete. Activating services." },
  { id: "o3", client: "Summit Plumbing Co.", assignedAM: "James Park", stage: "Department Launch", startDate: "2025-06-20", services: ["SEO", "GBP", "Call Tracking"], notes: "Launching SEO & Reporting depts." },
  { id: "o4", client: "Bright Dental Studio", assignedAM: "Tina Webb", stage: "Awaiting Payment", startDate: "2025-07-01", services: ["SEO", "Google Ads", "GBP"], notes: "Invoice sent. Following up Friday." },
  { id: "o5", client: "Verde Lawn & Landscape", assignedAM: "James Park", stage: "Assigned to AM", startDate: "2025-07-03", services: ["Meta Ads", "LSA", "Content"], notes: "AM intro call scheduled Jul 5." },
];

// ── Assignments ───────────────────────────────────────────────────────────────

export interface AssignmentRecord {
  id: string;
  client: string;
  assignedAM: AMName | "Unassigned";
  industry: string;
  contractValue: string;
  services: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Pending" | "Assigned" | "On Hold" | "Approved";
  handoffNotes: string;
}

export const ALL_ASSIGNMENTS: AssignmentRecord[] = [
  { id: "a1", client: "Pinnacle HVAC Solutions", assignedAM: "Sarah Chen", industry: "Home Services", contractValue: "$4,500/mo", services: "SEO, GBP, Google Ads", priority: "High", status: "Approved", handoffNotes: "Strong home services background." },
  { id: "a2", client: "NorthStar Dental", assignedAM: "Tina Webb", industry: "Healthcare", contractValue: "$3,200/mo", services: "Meta Ads, Reporting", priority: "Medium", status: "Assigned", handoffNotes: "Healthcare specialist." },
  { id: "a3", client: "Summit Landscaping", assignedAM: "James Park", industry: "Home Services", contractValue: "$2,800/mo", services: "SEO, LSA", priority: "High", status: "Approved", handoffNotes: "Lowest client count; best capacity." },
  { id: "a4", client: "Radiance MedSpa", assignedAM: "Maria Santos", industry: "Healthcare", contractValue: "$5,100/mo", services: "Meta Ads, SEO, Email", priority: "Critical", status: "Assigned", handoffNotes: "Premium client; beauty industry fit." },
  { id: "a5", client: "Harbor Auto Group", assignedAM: "Unassigned", industry: "Automotive", contractValue: "$6,800/mo", services: "Google Ads, Display, Reporting", priority: "Low", status: "On Hold", handoffNotes: "Payment overdue. Hold assignment." },
];

// ── Tasks ─────────────────────────────────────────────────────────────────────

export interface TaskRecord {
  id: string;
  task: string;
  client: string;
  assignedAM: AMName;
  department: string;
  service: string;
  dueDate: string;
  status: "Not Started" | "In Progress" | "Completed" | "Blocked" | "Waiting For Client" | "Review";
  priority: "High" | "Medium" | "Low";
  notes: string;
}

export const ALL_TASKS: TaskRecord[] = [
  { id: "t1", task: "SEO setup checklist", client: "Apex Roofing", assignedAM: "Sarah Chen", department: "SEO", service: "SEO", dueDate: "Jun 12", status: "In Progress", priority: "High", notes: "Keyword research drafted." },
  { id: "t2", task: "GBP access request", client: "Harbor Auto", assignedAM: "Sarah Chen", department: "GBP", service: "GBP", dueDate: "Jun 10", status: "Waiting For Client", priority: "Medium", notes: "Invite sent. Awaiting accept." },
  { id: "t3", task: "Renewal brief preparation", client: "Lakeview Dental", assignedAM: "Sarah Chen", department: "Account Management", service: "All Services", dueDate: "Jun 12", status: "Not Started", priority: "High", notes: "Renewal critical. Executive brief needed." },
  { id: "t4", task: "Meta campaign QA", client: "Pacific Dental", assignedAM: "Maria Santos", department: "Meta Ads", service: "Meta Ads", dueDate: "Jun 9", status: "Review", priority: "High", notes: "QA pass pending AM review." },
  { id: "t5", task: "Content batch review", client: "Radiance MedSpa", assignedAM: "Maria Santos", department: "Content", service: "Content", dueDate: "Jun 14", status: "In Progress", priority: "Medium", notes: "4 blog posts in draft." },
  { id: "t6", task: "LSA verification docs", client: "Summit Landscaping", assignedAM: "James Park", department: "LSA", service: "LSA", dueDate: "Jun 11", status: "Blocked", priority: "High", notes: "Missing insurance certificate." },
  { id: "t7", task: "Google Ads campaign build", client: "Pinnacle HVAC", assignedAM: "James Park", department: "Google Ads", service: "Google Ads", dueDate: "Jun 13", status: "In Progress", priority: "High", notes: "Summer AC campaign structure drafted." },
  { id: "t8", task: "Reporting dashboard setup", client: "NorthStar Dental", assignedAM: "Tina Webb", department: "Reporting", service: "Reporting", dueDate: "Jun 10", status: "Completed", priority: "Medium", notes: "GA4 + Meta connected." },
  { id: "t9", task: "Intake form review", client: "Bright Dental Studio", assignedAM: "Tina Webb", department: "Account Management", service: "All Services", dueDate: "Jul 5", status: "Not Started", priority: "Medium", notes: "Discovery call pending payment." },
];

// ── Client Health ─────────────────────────────────────────────────────────────

export interface HealthRecord {
  id: string;
  client: string;
  assignedAM: AMName;
  healthScore: number;
  paymentStatus: string;
  deliverableStatus: string;
  reportingStatus: string;
  performanceTrend: string;
  lastCheckin: string;
  nextCheckin: string;
  renewal: string;
  status: "Healthy" | "Needs Attention" | "At Risk" | "Critical";
  aiRecommendation: string;
  seasonalNote: string;
}

export const ALL_HEALTH: HealthRecord[] = [
  { id: "h1", client: "Apex Roofing", assignedAM: "Sarah Chen", healthScore: 92, paymentStatus: "Current", deliverableStatus: "Completed", reportingStatus: "Sent", performanceTrend: "↑ Improving", lastCheckin: "Jun 2, 2025", nextCheckin: "Jul 2, 2025", renewal: "Sep 1, 2025", status: "Healthy", aiRecommendation: "Launch storm damage campaign — peak season opportunity.", seasonalNote: "Summer storm season in Phoenix drives roofing demand." },
  { id: "h2", client: "Harbor Auto", assignedAM: "Sarah Chen", healthScore: 48, paymentStatus: "Overdue", deliverableStatus: "Blocked", reportingStatus: "Overdue", performanceTrend: "↓ Declining", lastCheckin: "May 15, 2025", nextCheckin: "Jun 10, 2025", renewal: "Jul 11, 2025", status: "At Risk", aiRecommendation: "Immediate payment follow-up. Escalate to billing.", seasonalNote: "Summer driving season increases auto repair demand." },
  { id: "h3", client: "Lakeview Dental", assignedAM: "Sarah Chen", healthScore: 22, paymentStatus: "Overdue", deliverableStatus: "Blocked", reportingStatus: "Overdue", performanceTrend: "↓ Critical", lastCheckin: "Apr 30, 2025", nextCheckin: "Jun 10, 2025", renewal: "Jun 30, 2025", status: "Critical", aiRecommendation: "Executive escalation required. Renewal at risk.", seasonalNote: "Back-to-school dental demand peaks in August." },
  { id: "h4", client: "Pacific Dental", assignedAM: "Maria Santos", healthScore: 71, paymentStatus: "Current", deliverableStatus: "In Progress", reportingStatus: "Due Soon", performanceTrend: "→ Stable", lastCheckin: "May 28, 2025", nextCheckin: "Jun 11, 2025", renewal: "Dec 1, 2025", status: "Needs Attention", aiRecommendation: "Book check-in within 48 hours. Report due soon.", seasonalNote: "Back-to-school dental campaign opportunity in summer." },
  { id: "h5", client: "Radiance MedSpa", assignedAM: "Maria Santos", healthScore: 79, paymentStatus: "Current", deliverableStatus: "In Progress", reportingStatus: "Sent", performanceTrend: "↑ Improving", lastCheckin: "Jun 1, 2025", nextCheckin: "Jun 15, 2025", renewal: "Oct 1, 2025", status: "Healthy", aiRecommendation: "Propose summer body contouring campaign on Meta.", seasonalNote: "Summer swimsuit season drives MedSpa demand peak." },
  { id: "h6", client: "Metro Plumbing", assignedAM: "Maria Santos", healthScore: 63, paymentStatus: "Current", deliverableStatus: "In Progress", reportingStatus: "Due Soon", performanceTrend: "→ Stable", lastCheckin: "May 25, 2025", nextCheckin: "Jun 8, 2025", renewal: "Sep 15, 2025", status: "Needs Attention", aiRecommendation: "Winter emergency campaign planning. Satisfaction survey overdue.", seasonalNote: "Winter pipe-freeze season drives emergency plumbing demand." },
  { id: "h7", client: "Summit Landscaping", assignedAM: "James Park", healthScore: 58, paymentStatus: "Current", deliverableStatus: "Delayed", reportingStatus: "Overdue", performanceTrend: "↓ Declining", lastCheckin: "May 20, 2025", nextCheckin: "Jun 5, 2025", renewal: "Aug 15, 2025", status: "Needs Attention", aiRecommendation: "Expedite delayed deliverables. Spring campaign opportunity.", seasonalNote: "Spring/summer peak landscaping season in Denver." },
  { id: "h8", client: "Pinnacle HVAC", assignedAM: "James Park", healthScore: 85, paymentStatus: "Current", deliverableStatus: "Completed", reportingStatus: "Sent", performanceTrend: "→ Stable", lastCheckin: "Jun 3, 2025", nextCheckin: "Jul 3, 2025", renewal: "Nov 1, 2025", status: "Healthy", aiRecommendation: "Increase LSA budget 30% for summer AC surge.", seasonalNote: "Extreme heat wave in Phoenix: AC demand at seasonal peak." },
  { id: "h9", client: "NorthStar Dental", assignedAM: "Tina Webb", healthScore: 80, paymentStatus: "Current", deliverableStatus: "Completed", reportingStatus: "Sent", performanceTrend: "↑ Improving", lastCheckin: "Jun 1, 2025", nextCheckin: "Jul 1, 2025", renewal: "Nov 15, 2025", status: "Healthy", aiRecommendation: "Back-to-school dental campaign recommended for August.", seasonalNote: "Back-to-school family dental checkup demand peaks in summer." },
  { id: "h10", client: "Bright Dental Studio", assignedAM: "Tina Webb", healthScore: 67, paymentStatus: "Renewal Upcoming", deliverableStatus: "In Progress", reportingStatus: "Due Soon", performanceTrend: "→ Stable", lastCheckin: "May 29, 2025", nextCheckin: "Jun 14, 2025", renewal: "Jul 20, 2025", status: "Needs Attention", aiRecommendation: "Initiate renewal conversation. Content upsell ready.", seasonalNote: "Summer dental specials opportunity for family patients." },
];

// ── Renewals ──────────────────────────────────────────────────────────────────

export interface RenewalRecord {
  id: string;
  client: string;
  assignedAM: AMName;
  contractValue: string;
  renewalDate: string;
  daysRemaining: number;
  probability: number;
  healthScore: number;
  status: "On Track" | "At Risk" | "High Risk" | "Renewing" | "Lost";
  services: string;
  upsellOpportunity: string;
  upsellRevenue: string;
  nextAction: string;
}

export const ALL_RENEWALS: RenewalRecord[] = [
  { id: "r1", client: "Apex Roofing", assignedAM: "Sarah Chen", contractValue: "$33,600/yr", renewalDate: "Sep 1, 2025", daysRemaining: 85, probability: 92, healthScore: 92, status: "On Track", services: "SEO, GBP, Google Ads", upsellOpportunity: "LSA + Call Tracking", upsellRevenue: "$800/mo", nextAction: "Prepare renewal proposal with storm season upsell." },
  { id: "r2", client: "Harbor Auto", assignedAM: "Sarah Chen", contractValue: "$38,400/yr", renewalDate: "Jul 11, 2025", daysRemaining: 34, probability: 41, healthScore: 48, status: "High Risk", services: "Google Ads, SEO", upsellOpportunity: "Display Ads", upsellRevenue: "$600/mo", nextAction: "Resolve payment first. Executive retention call needed." },
  { id: "r3", client: "Lakeview Dental", assignedAM: "Sarah Chen", contractValue: "$18,000/yr", renewalDate: "Jun 30, 2025", daysRemaining: 23, probability: 28, healthScore: 22, status: "High Risk", services: "SEO, Reporting", upsellOpportunity: "GBP Management", upsellRevenue: "$400/mo", nextAction: "Critical: churn brief ready. Executive escalation required." },
  { id: "r4", client: "Pacific Dental", assignedAM: "Maria Santos", contractValue: "$28,800/yr", renewalDate: "Dec 1, 2025", daysRemaining: 177, probability: 78, healthScore: 71, status: "At Risk", services: "SEO, Content, Reporting", upsellOpportunity: "GBP + Review Management", upsellRevenue: "$600/mo", nextAction: "Schedule check-in. Propose back-to-school campaign." },
  { id: "r5", client: "Radiance MedSpa", assignedAM: "Maria Santos", contractValue: "$43,200/yr", renewalDate: "Oct 1, 2025", daysRemaining: 114, probability: 88, healthScore: 79, status: "On Track", services: "Meta Ads, SEO, GBP", upsellOpportunity: "Email Marketing", upsellRevenue: "$900/mo", nextAction: "Propose summer campaign upsell. Renewal on track." },
  { id: "r6", client: "Metro Plumbing", assignedAM: "Maria Santos", contractValue: "$21,600/yr", renewalDate: "Sep 15, 2025", daysRemaining: 99, probability: 72, healthScore: 63, status: "At Risk", services: "SEO, GBP, Reporting", upsellOpportunity: "Call Tracking", upsellRevenue: "$300/mo", nextAction: "Winter campaign plan. Satisfaction survey follow-up." },
  { id: "r7", client: "Summit Landscaping", assignedAM: "James Park", contractValue: "$25,200/yr", renewalDate: "Aug 15, 2025", daysRemaining: 69, probability: 62, healthScore: 58, status: "At Risk", services: "Meta Ads, LSA, Google Ads", upsellOpportunity: "SEO + Content", upsellRevenue: "$700/mo", nextAction: "Resolve deliverable delays. Performance brief needed." },
  { id: "r8", client: "Pinnacle HVAC", assignedAM: "James Park", contractValue: "$54,000/yr", renewalDate: "Nov 1, 2025", daysRemaining: 146, probability: 95, healthScore: 85, status: "Renewing", services: "Google Ads, LSA, Reporting", upsellOpportunity: "GBP + SEO", upsellRevenue: "$1,200/mo", nextAction: "Propose summer budget increase. Renewal very likely." },
  { id: "r9", client: "NorthStar Dental", assignedAM: "Tina Webb", contractValue: "$38,400/yr", renewalDate: "Nov 15, 2025", daysRemaining: 160, probability: 91, healthScore: 80, status: "On Track", services: "Meta Ads, Reporting", upsellOpportunity: "SEO + GBP", upsellRevenue: "$1,100/mo", nextAction: "Back-to-school campaign. Upsell SEO bundle." },
  { id: "r10", client: "Bright Dental Studio", assignedAM: "Tina Webb", contractValue: "$26,400/yr", renewalDate: "Jul 20, 2025", daysRemaining: 43, probability: 70, healthScore: 67, status: "At Risk", services: "SEO, Google Ads, GBP", upsellOpportunity: "Content Marketing", upsellRevenue: "$500/mo", nextAction: "Initiate renewal conversation. Content upsell proposal." },
];
