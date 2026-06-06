// Client Health KPI Dashboard, Health Score Center, Health Table, At Risk Client Center

const kpiData = [
  { label: "Healthy Clients", value: "18", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  { label: "Needs Attention", value: "7", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  { label: "At Risk Clients", value: "4", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { label: "Critical Clients", value: "1", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  { label: "Average Health Score", value: "82", suffix: "/100", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { label: "Overdue Check-ins", value: "6", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { label: "Overdue Reports", value: "3", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  { label: "Churn Risk Clients", value: "5", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
];

// Client Health Score Center — factor breakdown per client
const healthScoreFactors = [
  "Payment Status",
  "Deliverable Status",
  "Reporting Compliance",
  "Check-in Compliance",
  "Performance Trend",
  "Client Responsiveness",
  "Review Sentiment",
  "Department Completion Status",
];

const scoreCenterClients = [
  {
    client: "Apex Roofing",
    overall: 92,
    scores: [100, 95, 90, 95, 85, 90, 88, 93],
  },
  {
    client: "Pacific Dental",
    overall: 71,
    scores: [100, 70, 65, 75, 60, 80, 72, 68],
  },
  {
    client: "Harbor Auto",
    overall: 48,
    scores: [30, 40, 35, 50, 45, 60, 55, 48],
  },
  {
    client: "Summit Landscaping",
    overall: 58,
    scores: [80, 55, 60, 65, 40, 55, 62, 50],
  },
  {
    client: "Radiance MedSpa",
    overall: 79,
    scores: [100, 80, 75, 85, 70, 85, 78, 82],
  },
];

function scoreColor(score: number) {
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 60) return "bg-yellow-100 text-yellow-700";
  if (score >= 40) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}

function overallBadge(score: number) {
  if (score >= 80) return "bg-green-600 text-white";
  if (score >= 60) return "bg-yellow-500 text-white";
  if (score >= 40) return "bg-orange-500 text-white";
  return "bg-red-600 text-white";
}

// Client Health Table
const healthTableRows = [
  {
    client: "Apex Roofing",
    am: "Sarah Chen",
    score: 92,
    payment: "Current",
    deliverables: "Completed",
    reporting: "Sent",
    trend: "↑ Improving",
    lastCheckin: "Jun 2, 2025",
    nextCheckin: "Jul 2, 2025",
    renewal: "Sep 1, 2025",
    status: "Healthy",
  },
  {
    client: "Pacific Dental",
    am: "Maria Santos",
    score: 71,
    payment: "Current",
    deliverables: "In Progress",
    reporting: "Due Soon",
    trend: "→ Stable",
    lastCheckin: "May 28, 2025",
    nextCheckin: "Jun 11, 2025",
    renewal: "Dec 1, 2025",
    status: "Needs Attention",
  },
  {
    client: "Harbor Auto",
    am: "Sarah Chen",
    score: 48,
    payment: "Overdue",
    deliverables: "Blocked",
    reporting: "Overdue",
    trend: "↓ Declining",
    lastCheckin: "May 15, 2025",
    nextCheckin: "Jun 10, 2025",
    renewal: "Jul 11, 2025",
    status: "At Risk",
  },
  {
    client: "Summit Landscaping",
    am: "James Park",
    score: 58,
    payment: "Current",
    deliverables: "Delayed",
    reporting: "Overdue",
    trend: "↓ Declining",
    lastCheckin: "May 20, 2025",
    nextCheckin: "Jun 5, 2025",
    renewal: "Aug 15, 2025",
    status: "Needs Attention",
  },
  {
    client: "Radiance MedSpa",
    am: "Maria Santos",
    score: 79,
    payment: "Current",
    deliverables: "In Progress",
    reporting: "Sent",
    trend: "↑ Improving",
    lastCheckin: "Jun 1, 2025",
    nextCheckin: "Jun 15, 2025",
    renewal: "Oct 1, 2025",
    status: "Healthy",
  },
  {
    client: "Pinnacle HVAC",
    am: "James Park",
    score: 85,
    payment: "Current",
    deliverables: "Completed",
    reporting: "Sent",
    trend: "→ Stable",
    lastCheckin: "Jun 3, 2025",
    nextCheckin: "Jul 3, 2025",
    renewal: "Nov 1, 2025",
    status: "Healthy",
  },
  {
    client: "Lakeview Dental",
    am: "Sarah Chen",
    score: 22,
    payment: "Overdue",
    deliverables: "Blocked",
    reporting: "Overdue",
    trend: "↓ Critical",
    lastCheckin: "Apr 30, 2025",
    nextCheckin: "Jun 10, 2025",
    renewal: "Jun 30, 2025",
    status: "Critical",
  },
  {
    client: "Metro Plumbing",
    am: "Maria Santos",
    score: 63,
    payment: "Current",
    deliverables: "In Progress",
    reporting: "Due Soon",
    trend: "→ Stable",
    lastCheckin: "May 25, 2025",
    nextCheckin: "Jun 8, 2025",
    renewal: "Sep 15, 2025",
    status: "Needs Attention",
  },
];

function statusBadge(status: string) {
  switch (status) {
    case "Healthy": return "bg-green-100 text-green-700 border-green-200";
    case "Needs Attention": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "At Risk": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Critical": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function paymentBadge(status: string) {
  if (status === "Current") return "text-green-700";
  if (status === "Overdue") return "text-red-600 font-semibold";
  return "text-slate-600";
}

function trendColor(trend: string) {
  if (trend.includes("Improving")) return "text-green-600";
  if (trend.includes("Stable")) return "text-blue-600";
  if (trend.includes("Declining") || trend.includes("Critical")) return "text-red-600";
  return "text-slate-600";
}

// At Risk Client Center
const atRiskRows = [
  {
    client: "Harbor Auto",
    riskReason: "Overdue payment + blocked deliverables + no check-in in 21 days",
    severity: "High",
    am: "Sarah Chen",
    department: "Paid Ads / SEO",
    dueDate: "Jun 10, 2025",
    recommendedAction: "Immediate AM call; escalate payment to billing; unblock deliverables with creative team",
    escalation: "Escalated",
  },
  {
    client: "Lakeview Dental",
    riskReason: "Payment 45 days overdue; no reporting sent; renewal in 26 days",
    severity: "Critical",
    am: "Sarah Chen",
    department: "SEO / Reporting",
    dueDate: "Jun 30, 2025",
    recommendedAction: "Executive escalation; initiate renewal conversation; prepare churn risk brief",
    escalation: "Critical",
  },
  {
    client: "Summit Landscaping",
    riskReason: "Deliverables delayed; reporting overdue; declining lead performance",
    severity: "Medium",
    am: "James Park",
    department: "Paid Ads",
    dueDate: "Jun 5, 2025",
    recommendedAction: "Schedule performance review; expedite delayed deliverables; send interim report",
    escalation: "Pending",
  },
  {
    client: "Pacific Dental",
    riskReason: "Report due in 3 days; deliverables partially complete; low check-in frequency",
    severity: "Low",
    am: "Maria Santos",
    department: "SEO / Content",
    dueDate: "Jun 11, 2025",
    recommendedAction: "Send report reminder; book next check-in; confirm deliverable timeline with content team",
    escalation: "Not Escalated",
  },
];

function severityBadge(severity: string) {
  switch (severity) {
    case "Critical": return "bg-red-600 text-white";
    case "High": return "bg-orange-500 text-white";
    case "Medium": return "bg-yellow-400 text-slate-900";
    case "Low": return "bg-blue-100 text-blue-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

function escalationBadge(status: string) {
  switch (status) {
    case "Critical": return "bg-red-100 text-red-700 border-red-200";
    case "Escalated": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Not Escalated": return "bg-slate-100 text-slate-500 border-slate-200";
    default: return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

// ── AI Client Insights mock data ──
const aiInsights = [
  {
    insight: "Lead volume down 28% — Harbor Auto",
    impact: "Paid Ads and SEO underperforming; lead pipeline shrinking for 3 consecutive weeks",
    recommendation: "Audit campaign targeting, bidding strategy, and landing page conversion rates",
    priority: "Critical",
    department: "Paid Advertising / SEO",
    amAction: "Schedule performance review call with client this week",
  },
  {
    insight: "CPL increased 34% — Summit Landscaping",
    impact: "Cost-per-lead rise eroding campaign ROI; client spend efficiency dropping",
    recommendation: "Review ad creative fatigue and audience overlap; test new ad sets",
    priority: "High",
    department: "Paid Advertising",
    amAction: "Send interim performance brief and propose optimization sprint",
  },
  {
    insight: "Reports overdue 45 days — Lakeview Dental",
    impact: "Client has no performance visibility; trust and renewal risk elevated",
    recommendation: "Expedite report delivery; attach executive summary with key wins",
    priority: "Critical",
    department: "Reporting",
    amAction: "Escalate to Reporting team today; send client ETA within 24 hours",
  },
  {
    insight: "No AM check-in in 30 days — Pacific Dental",
    impact: "Reduced client engagement increases churn risk; deliverable clarity gaps",
    recommendation: "Book check-in call within 48 hours; review open deliverables beforehand",
    priority: "Medium",
    department: "Account Management",
    amAction: "Book check-in and send agenda to client today",
  },
  {
    insight: "Client has delayed deliverables from Paid Advertising — Harbor Auto",
    impact: "Campaign launch blocked; client satisfaction at risk due to missed deadlines",
    recommendation: "Coordinate with Paid Ads team to unblock; provide client with revised timeline",
    priority: "High",
    department: "Paid Advertising",
    amAction: "Escalate internally and communicate revised ETA to client within 24 hours",
  },
  {
    insight: "Renewal approaching with declining performance — Lakeview Dental",
    impact: "Client renewal in 26 days; declining health score and overdue payment increase churn probability",
    recommendation: "Prepare renewal brief with recovery plan; initiate executive-level retention conversation",
    priority: "Critical",
    department: "Account Management / Leadership",
    amAction: "Schedule renewal strategy call; prepare churn risk brief for leadership",
  },
];

// ── Weather & Seasonal Intelligence mock data ──
const weatherRows = [
  {
    client: "Pinnacle HVAC",
    industry: "HVAC",
    location: "Phoenix, AZ",
    season: "Summer",
    weatherContext: "Extreme heat wave; temperatures 105°F+ for 3 consecutive weeks",
    businessImpact: "AC repair and installation demand at seasonal peak",
    opportunity: "Surge in emergency AC service calls and new unit installs",
    recommendedAction: "Launch emergency AC campaign; increase Paid Ads budget 30%; push urgency creative",
  },
  {
    client: "Apex Roofing",
    industry: "Roofing",
    location: "Houston, TX",
    season: "Spring",
    weatherContext: "Heavy rainfall and storm season; hail damage reports up 45% regionally",
    businessImpact: "Storm repair and insurance claim leads spiking",
    opportunity: "High-intent storm damage repair leads available at lower CPL",
    recommendedAction: "Activate storm damage landing page; retarget homeowners in affected zip codes",
  },
  {
    client: "Summit Landscaping",
    industry: "Landscaping",
    location: "Denver, CO",
    season: "Spring",
    weatherContext: "Spring thaw and mild temperatures driving homeowner outdoor spending",
    businessImpact: "Lawn care, aeration, and spring cleanup bookings historically double",
    opportunity: "Early-season spring maintenance package demand",
    recommendedAction: "Launch spring maintenance campaign; promote early-bird booking discounts",
  },
  {
    client: "Radiance MedSpa",
    industry: "MedSpa",
    location: "Los Angeles, CA",
    season: "Summer",
    weatherContext: "Summer swimsuit season driving beauty and body treatment demand",
    businessImpact: "Laser Hair Removal and body contouring bookings peak June–August",
    opportunity: "Summer Laser Hair Removal package upsell opportunity",
    recommendedAction: "Promote summer LHR specials on Meta and Google; target women 25–44",
  },
  {
    client: "Pacific Dental",
    industry: "Dental",
    location: "San Diego, CA",
    season: "Fall",
    weatherContext: "Back-to-school season; families scheduling annual dental appointments",
    businessImpact: "Pediatric and family dental appointments spike in August–September",
    opportunity: "Back-to-school dental checkup campaign for families",
    recommendedAction: "Run back-to-school dental promotion; target parents via Facebook and Google",
  },
  {
    client: "Metro Plumbing",
    industry: "Home Services",
    location: "Chicago, IL",
    season: "Winter",
    weatherContext: "Polar vortex warning; temperatures dropping to -10°F; pipe freeze risk elevated",
    businessImpact: "Emergency pipe repair and heating system calls expected to surge",
    opportunity: "Winter emergency home services demand at peak",
    recommendedAction: "Activate winter emergency campaign; increase budget for heating/plumbing keywords",
  },
];

function seasonBadge(season: string) {
  switch (season) {
    case "Summer": return "bg-orange-100 text-orange-700";
    case "Spring": return "bg-green-100 text-green-700";
    case "Fall": return "bg-yellow-100 text-yellow-800";
    case "Winter": return "bg-blue-100 text-blue-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

// ── Escalation Center mock data ──
const escalationRows = [
  {
    client: "Harbor Auto",
    escalationType: "Performance",
    severity: "High",
    assignedOwner: "Sarah Chen",
    department: "Paid Ads / SEO",
    dueDate: "Jun 10, 2025",
    status: "Escalated",
    nextAction: "Escalation call with department leads scheduled; client briefed on timeline",
  },
  {
    client: "Lakeview Dental",
    escalationType: "Renewal Risk",
    severity: "Critical",
    assignedOwner: "Sarah Chen",
    department: "Account Management / Leadership",
    dueDate: "Jun 12, 2025",
    status: "Escalated",
    nextAction: "Executive retention call; prepare churn risk brief for leadership",
  },
  {
    client: "Lakeview Dental",
    escalationType: "Payment",
    severity: "Critical",
    assignedOwner: "Sarah Chen",
    department: "Billing",
    dueDate: "Jun 10, 2025",
    status: "Waiting For Department",
    nextAction: "Billing team to confirm payment plan options by Jun 10",
  },
  {
    client: "Harbor Auto",
    escalationType: "Deliverable",
    severity: "High",
    assignedOwner: "Sarah Chen",
    department: "Paid Ads",
    dueDate: "Jun 11, 2025",
    status: "Investigating",
    nextAction: "Creative team reviewing blocked assets; revised ETA to be sent to client",
  },
  {
    client: "Summit Landscaping",
    escalationType: "Reporting",
    severity: "Medium",
    assignedOwner: "James Park",
    department: "Reporting",
    dueDate: "Jun 5, 2025",
    status: "Waiting For Department",
    nextAction: "Reporting team to deliver overdue report by Jun 5",
  },
  {
    client: "Pacific Dental",
    escalationType: "Communication",
    severity: "Low",
    assignedOwner: "Maria Santos",
    department: "Account Management",
    dueDate: "Jun 11, 2025",
    status: "Open",
    nextAction: "Schedule check-in; confirm deliverable timeline with content team",
  },
  {
    client: "Metro Plumbing",
    escalationType: "Client Satisfaction",
    severity: "Medium",
    assignedOwner: "Maria Santos",
    department: "Account Management",
    dueDate: "Jun 8, 2025",
    status: "Waiting For Client",
    nextAction: "Awaiting client response to satisfaction survey; follow up if no reply by Jun 8",
  },
  {
    client: "Apex Roofing",
    escalationType: "Performance",
    severity: "Low",
    assignedOwner: "Sarah Chen",
    department: "Paid Ads / SEO",
    dueDate: "Jun 15, 2025",
    status: "Resolved",
    nextAction: "Campaign optimization completed; performance metrics restored above target",
  },
];

function escalationStatusBadge(status: string) {
  switch (status) {
    case "Open": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Investigating": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Escalated": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Waiting For Department": return "bg-purple-100 text-purple-700 border-purple-200";
    case "Waiting For Client": return "bg-teal-100 text-teal-700 border-teal-200";
    case "Resolved": return "bg-green-100 text-green-700 border-green-200";
    default: return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

// ── Client Action Center data ──
const recentActions = [
  { action: "Scheduled check-in", client: "Pacific Dental", owner: "Maria Santos", date: "Jun 3, 2025", status: "Completed" },
  { action: "Escalated risk", client: "Harbor Auto", owner: "Sarah Chen", date: "May 15, 2025", status: "Completed" },
  { action: "Sent report", client: "Metro Plumbing", owner: "Maria Santos", date: "Jun 1, 2025", status: "Completed" },
  { action: "Opened renewal review", client: "Lakeview Dental", owner: "Sarah Chen", date: "Jun 10, 2025", status: "Completed" },
  { action: "Generated AI Summary", client: "Summit Landscaping", owner: "James Park", date: "May 20, 2025", status: "Completed" },
];

const pendingActions = [
  { action: "Assign follow-up", client: "Harbor Auto", owner: "Sarah Chen", dueDate: "Jun 10, 2025" },
  { action: "Request department update", client: "Lakeview Dental", owner: "Sarah Chen", dueDate: "Jun 12, 2025" },
  { action: "Create executive summary", client: "Lakeview Dental", owner: "Sarah Chen", dueDate: "Jun 12, 2025" },
  { action: "Schedule strategy call", client: "Summit Landscaping", owner: "James Park", dueDate: "Jun 15, 2025" },
  { action: "Review deliverables", client: "Pacific Dental", owner: "Maria Santos", dueDate: "Jun 11, 2025" },
];

// ── Future Automation Center data ──
const automations = [
  {
    name: "AI Risk Detection",
    futureStatus: "Planned",
    dependencies: "ML model training data, health score API",
    readiness: 25,
  },
  {
    name: "Seasonal Intelligence Engine",
    futureStatus: "In Design",
    dependencies: "Weather API integration, industry mapping",
    readiness: 40,
  },
  {
    name: "Weather Intelligence Engine",
    futureStatus: "In Design",
    dependencies: "Weather API, location data per client",
    readiness: 35,
  },
  {
    name: "Health Score Automation",
    futureStatus: "Planned",
    dependencies: "Billing API, reporting API, CRM sync",
    readiness: 50,
  },
  {
    name: "Escalation Automation",
    futureStatus: "Planned",
    dependencies: "Threshold rules engine, notification system",
    readiness: 30,
  },
  {
    name: "Churn Prediction",
    futureStatus: "Research",
    dependencies: "ML pipeline, historical retention data",
    readiness: 15,
  },
  {
    name: "Renewal Prediction",
    futureStatus: "Research",
    dependencies: "Contract data API, usage signals",
    readiness: 20,
  },
  {
    name: "Department Task Sync",
    futureStatus: "Planned",
    dependencies: "Project management API integration",
    readiness: 45,
  },
  {
    name: "Billing Status Sync",
    futureStatus: "In Design",
    dependencies: "Billing platform API, webhook support",
    readiness: 55,
  },
  {
    name: "Reporting Status Sync",
    futureStatus: "In Design",
    dependencies: "Reporting tool API, file delivery events",
    readiness: 50,
  },
  {
    name: "Client Sentiment Analysis",
    futureStatus: "Research",
    dependencies: "NLP model, communication history",
    readiness: 10,
  },
  {
    name: "Executive Summary Generation",
    futureStatus: "Planned",
    dependencies: "LLM integration, report data pipeline",
    readiness: 35,
  },
  {
    name: "Automatic Check-in Reminders",
    futureStatus: "In Design",
    dependencies: "Calendar API, notification system",
    readiness: 60,
  },
];

function automationStatusBadge(status: string) {
  switch (status) {
    case "In Design": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Planned": return "bg-purple-100 text-purple-700 border-purple-200";
    case "Research": return "bg-slate-100 text-slate-600 border-slate-200";
    default: return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function readinessColor(level: number) {
  if (level >= 50) return "bg-green-500";
  if (level >= 30) return "bg-yellow-400";
  return "bg-slate-300";
}

// ── Client Timeline mock data ──
const timelineRows = [
  {
    date: "Apr 1, 2025",
    client: "Radiance MedSpa",
    eventType: "Onboarding",
    owner: "Maria Santos",
    summary: "Client onboarding completed; access granted to all platforms; kickoff call held",
    nextAction: "Schedule first 30-day check-in for May 1",
  },
  {
    date: "Apr 10, 2025",
    client: "Apex Roofing",
    eventType: "Service Activation",
    owner: "Sarah Chen",
    summary: "SEO and Paid Ads campaigns activated; tracking confirmed on all landing pages",
    nextAction: "Monitor lead volume for first 2 weeks; report at May check-in",
  },
  {
    date: "Apr 22, 2025",
    client: "Harbor Auto",
    eventType: "Payment Issue",
    owner: "Sarah Chen",
    summary: "Invoice #2204 returned unpaid; client cited internal billing delay",
    nextAction: "Follow up with client finance contact by Apr 26",
  },
  {
    date: "Apr 30, 2025",
    client: "Lakeview Dental",
    eventType: "Check-in",
    owner: "Sarah Chen",
    summary: "Monthly check-in held; client expressed concern over lead volume decline",
    nextAction: "Escalate performance review; send revised strategy by May 7",
  },
  {
    date: "May 5, 2025",
    client: "Summit Landscaping",
    eventType: "Campaign Performance Alert",
    owner: "James Park",
    summary: "CPL increased 34% week-over-week; lead volume down 18% vs. prior period",
    nextAction: "Review targeting and creative; present optimization plan to client by May 12",
  },
  {
    date: "May 12, 2025",
    client: "Pacific Dental",
    eventType: "Report Sent",
    owner: "Maria Santos",
    summary: "April performance report delivered; client acknowledged receipt",
    nextAction: "Book debrief call for May 20; gather client questions in advance",
  },
  {
    date: "May 15, 2025",
    client: "Harbor Auto",
    eventType: "Escalation",
    owner: "Sarah Chen",
    summary: "Client escalated via email; frustrated with blocked deliverables and overdue reporting",
    nextAction: "Escalation call scheduled for May 17; involve department leads",
  },
  {
    date: "May 20, 2025",
    client: "Pinnacle HVAC",
    eventType: "Deliverable Completed",
    owner: "James Park",
    summary: "Summer campaign creative package delivered and approved by client",
    nextAction: "Launch campaigns June 1; confirm tracking with Paid Ads team",
  },
  {
    date: "May 28, 2025",
    client: "Pacific Dental",
    eventType: "Client Feedback",
    owner: "Maria Santos",
    summary: "Client provided positive NPS feedback; highlighted satisfaction with SEO results",
    nextAction: "Request Google review; discuss upsell for content package",
  },
  {
    date: "Jun 2, 2025",
    client: "Apex Roofing",
    eventType: "Check-in",
    owner: "Sarah Chen",
    summary: "Quarterly business review held; client satisfied with lead growth and ROI",
    nextAction: "Prepare renewal proposal for September; expand Paid Ads budget discussion",
  },
  {
    date: "Jun 10, 2025",
    client: "Lakeview Dental",
    eventType: "Renewal Event",
    owner: "Sarah Chen",
    summary: "Renewal notice sent; client contract expires Jun 30; churn risk flagged at critical level",
    nextAction: "Executive retention call to be scheduled by Jun 12; prepare recovery brief",
  },
  {
    date: "Jun 12, 2025",
    client: "Metro Plumbing",
    eventType: "Deliverable Completed",
    owner: "Maria Santos",
    summary: "New landing pages for winter plumbing services approved and deployed",
    nextAction: "Monitor conversion rate; include in next monthly report",
  },
];

function eventTypeBadge(eventType: string) {
  switch (eventType) {
    case "Onboarding": return "bg-purple-100 text-purple-700 border-purple-200";
    case "Service Activation": return "bg-green-100 text-green-700 border-green-200";
    case "Check-in": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Report Sent": return "bg-slate-100 text-slate-600 border-slate-200";
    case "Escalation": return "bg-red-100 text-red-700 border-red-200";
    case "Client Feedback": return "bg-teal-100 text-teal-700 border-teal-200";
    case "Deliverable Completed": return "bg-green-100 text-green-700 border-green-200";
    case "Renewal Event": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Payment Issue": return "bg-red-100 text-red-700 border-red-200";
    case "Campaign Performance Alert": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default: return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export default function ClientHealthPage() {
  return (
    <main className="space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Client Health</h1>
        <p className="text-sm text-slate-500">
          Monitor health scores, risks, check-ins, reporting compliance, and retention signals across all accounts.
        </p>
      </div>

      {/* ── 1. Client Health KPI Dashboard ── */}
      <section aria-label="Client Health KPI Dashboard">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">
          Client Health KPI Dashboard
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {kpiData.map(({ label, value, suffix, color, bg, border }) => (
            <div
              key={label}
              className={`rounded-2xl border ${border} ${bg} p-5 shadow-sm`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className={`mt-2 text-3xl font-bold ${color}`}>
                {value}
                {suffix && <span className="text-lg font-medium">{suffix}</span>}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Client Health Score Center ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Client Health Score Center">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">Client Health Score Center</h2>
          <p className="mt-1 text-sm text-slate-500">
            Score range: <strong>0–100</strong>. Each score reflects eight weighted health factors. Green ≥ 80 · Yellow 60–79 · Orange 40–59 · Red &lt; 40.
          </p>
        </div>

        {/* Factor legend */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3">
          {healthScoreFactors.map((f, i) => (
            <span
              key={f}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {i + 1}. {f}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-center">Overall</th>
                {healthScoreFactors.map((f) => (
                  <th key={f} className="px-3 py-3 text-center" title={f}>
                    {f.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scoreCenterClients.map((row) => (
                <tr key={row.client} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{row.client}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${overallBadge(row.overall)}`}>
                      {row.overall}
                    </span>
                  </td>
                  {row.scores.map((s, idx) => (
                    <td key={idx} className="px-3 py-3 text-center">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${scoreColor(s)}`}>
                        {s}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 3. Client Health Table ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Client Health Table">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">Client Health Table</h2>
          <p className="mt-1 text-sm text-slate-500">Full account view: payment, deliverables, reporting, check-ins, renewal dates, and health status.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                {[
                  "Client",
                  "Account Manager",
                  "Health Score",
                  "Payment Status",
                  "Deliverable Status",
                  "Reporting Status",
                  "Performance Trend",
                  "Last Check-in",
                  "Next Check-in",
                  "Renewal Date",
                  "Health Status",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {healthTableRows.map((row) => (
                <tr key={row.client} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.am}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${overallBadge(row.score)}`}>
                      {row.score}
                    </span>
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap ${paymentBadge(row.payment)}`}>{row.payment}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.deliverables}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.reporting}</td>
                  <td className={`px-4 py-3 font-medium whitespace-nowrap ${trendColor(row.trend)}`}>{row.trend}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.lastCheckin}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.nextCheckin}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.renewal}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 4. At Risk Client Center ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="At Risk Client Center">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">At Risk Client Center</h2>
          <p className="mt-1 text-sm text-slate-500">
            Clients flagged for churn risk, payment failure, or compliance issues — with recommended actions and escalation status.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                {[
                  "Client",
                  "Risk Reason",
                  "Severity",
                  "Assigned AM",
                  "Department",
                  "Due Date",
                  "Recommended Action",
                  "Escalation Status",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {atRiskRows.map((row) => (
                <tr key={row.client} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">{row.riskReason}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${severityBadge(row.severity)}`}>
                      {row.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.am}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.department}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.dueDate}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-sm">{row.recommendedAction}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${escalationBadge(row.escalation)}`}>
                      {row.escalation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. AI Client Insights ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="AI Client Insights">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">AI Client Insights</h2>
          <p className="mt-1 text-sm text-slate-500">
            AI-generated account signals surfacing risks, trends, and recommended AM actions across all clients.
          </p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {aiInsights.map((insight) => (
            <div
              key={insight.insight}
              className={`rounded-xl border p-4 shadow-sm ${
                insight.priority === "Critical"
                  ? "border-red-200 bg-red-50"
                  : insight.priority === "High"
                  ? "border-orange-200 bg-orange-50"
                  : insight.priority === "Medium"
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-slate-800">{insight.insight}</p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    insight.priority === "Critical"
                      ? "bg-red-600 text-white"
                      : insight.priority === "High"
                      ? "bg-orange-500 text-white"
                      : insight.priority === "Medium"
                      ? "bg-yellow-400 text-slate-900"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {insight.priority}
                </span>
              </div>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex gap-1">
                  <dt className="font-semibold text-slate-500">Impact:</dt>
                  <dd className="text-slate-700">{insight.impact}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="font-semibold text-slate-500">Department:</dt>
                  <dd className="text-slate-700">{insight.department}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="font-semibold text-slate-500">Recommendation:</dt>
                  <dd className="text-slate-700">{insight.recommendation}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="font-semibold text-slate-500">AM Action:</dt>
                  <dd className="font-medium text-blue-700">{insight.amAction}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Weather & Seasonal Intelligence ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Weather & Seasonal Intelligence">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">Weather &amp; Seasonal Intelligence</h2>
          <p className="mt-1 text-sm text-slate-500">
            Help Account Managers identify campaign opportunities and client risks based on seasonality and weather-related demand shifts.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                {[
                  "Client",
                  "Industry",
                  "Location",
                  "Season",
                  "Weather / Seasonal Context",
                  "Business Impact",
                  "Opportunity",
                  "Recommended Action",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weatherRows.map((row) => (
                <tr key={row.client + row.season} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.industry}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${seasonBadge(row.season)}`}>
                      {row.season}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">{row.weatherContext}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">{row.businessImpact}</td>
                  <td className="px-4 py-3 text-green-700 font-medium max-w-xs">{row.opportunity}</td>
                  <td className="px-4 py-3 text-blue-700 font-medium max-w-xs">{row.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 7. Client Timeline ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Client Timeline">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">Client Timeline</h2>
          <p className="mt-1 text-sm text-slate-500">
            Chronological log of key client events — onboarding, check-ins, reports, escalations, renewals, and performance alerts.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                {["Date", "Client", "Event Type", "Owner", "Summary", "Next Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timelineRows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold border ${eventTypeBadge(row.eventType)}`}>
                      {row.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.owner}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-sm">{row.summary}</td>
                  <td className="px-4 py-3 text-blue-700 font-medium max-w-xs">{row.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 9. Escalation Center ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Escalation Center">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">Escalation Center</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage all active client escalations across severity levels, departments, and resolution stages.
          </p>
        </div>

        {/* Escalation Summary Cards */}
        <div className="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: "Total Escalations", value: escalationRows.length, color: "text-slate-800", bg: "bg-slate-50", border: "border-slate-200" },
            { label: "High Severity", value: escalationRows.filter((r) => r.severity === "High" || r.severity === "Critical").length, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
            { label: "Open Escalations", value: escalationRows.filter((r) => r.status !== "Resolved").length, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
            { label: "Resolved", value: escalationRows.filter((r) => r.status === "Resolved").length, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`rounded-xl border ${border} ${bg} p-4 shadow-sm`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Escalation Table */}
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                {["Client", "Escalation Type", "Severity", "Assigned Owner", "Department", "Due Date", "Status", "Next Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {escalationRows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.escalationType}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${severityBadge(row.severity)}`}>
                      {row.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.assignedOwner}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.department}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.dueDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${escalationStatusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">{row.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 10. Client Action Center ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Client Action Center">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">Client Action Center</h2>
          <p className="mt-1 text-sm text-slate-500">
            Trigger account management actions, track pending items, and review completed work across all clients.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="border-b border-slate-100 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Quick Actions</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Schedule Check-in", color: "bg-blue-600 hover:bg-blue-700" },
              { label: "Create Task", color: "bg-indigo-600 hover:bg-indigo-700" },
              { label: "Escalate Risk", color: "bg-red-600 hover:bg-red-700" },
              { label: "Assign Follow-up", color: "bg-orange-500 hover:bg-orange-600" },
              { label: "Send Report", color: "bg-teal-600 hover:bg-teal-700" },
              { label: "Review Deliverables", color: "bg-purple-600 hover:bg-purple-700" },
              { label: "Open Renewal Review", color: "bg-green-600 hover:bg-green-700" },
              { label: "Generate AI Summary", color: "bg-slate-700 hover:bg-slate-800" },
              { label: "Request Department Update", color: "bg-yellow-500 hover:bg-yellow-600" },
              { label: "Create Executive Summary", color: "bg-blue-800 hover:bg-blue-900" },
              { label: "Schedule Strategy Call", color: "bg-cyan-600 hover:bg-cyan-700" },
            ].map(({ label, color }) => (
              <button key={label} className={`rounded-lg ${color} px-4 py-2 text-sm font-semibold text-white transition-colors`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Pending Actions */}
        <div className="border-b border-slate-100 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Pending Actions</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  {["Action", "Client", "Owner", "Due Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingActions.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-orange-700">{row.action}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.client}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.owner}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent / Completed Actions */}
        <div className="p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Recent Completed Actions</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  {["Action", "Client", "Owner", "Date", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentActions.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700 font-medium">{row.action}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.client}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.owner}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 11. Future Automation Center ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Future Automation Center">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">Future Automation Center</h2>
          <p className="mt-1 text-sm text-slate-500">
            Planned automations that will enhance client health monitoring, risk detection, and account management efficiency.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                {["Automation Name", "Future Status", "Dependencies", "Readiness Level"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {automations.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${automationStatusBadge(row.futureStatus)}`}>
                      {row.futureStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">{row.dependencies}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${readinessColor(row.readiness)}`}
                          style={{ width: `${row.readiness}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{row.readiness}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 12. Executive Summary ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Executive Summary">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">Executive Summary</h2>
          <p className="mt-1 text-sm text-slate-500">
            High-level portfolio overview and AI-generated executive summary for leadership reporting.
          </p>
        </div>

        {/* Executive KPI Overview */}
        <div className="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total Clients", value: "30", color: "text-slate-800", bg: "bg-slate-50", border: "border-slate-200" },
            { label: "Healthy Clients", value: "18", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
            { label: "At Risk Clients", value: "4", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
            { label: "Upcoming Renewals", value: "2", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
            { label: "Escalations", value: escalationRows.filter((r) => r.status !== "Resolved").length.toString(), color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
            { label: "Revenue At Risk", value: "$48K", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`rounded-xl border ${border} ${bg} p-4 shadow-sm`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* AI Executive Summary Card */}
        <div className="mx-5 mb-5 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 110 20A10 10 0 0112 2zm0 2a8 8 0 100 16A8 8 0 0012 4zm1 4v4.586l3.707 3.707-1.414 1.414L11 13.414V8h2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">AI Executive Summary</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Client portfolio remains healthy overall with 4 accounts requiring attention. Two renewal opportunities are approaching within
                30 days. Seasonal demand trends indicate increased HVAC and Roofing opportunities over the next quarter. Harbor Auto and
                Lakeview Dental represent the highest churn risk and require immediate executive-level intervention. Revenue at risk is
                estimated at $48K pending payment resolution and renewal outcomes. Department escalations in Paid Ads and Billing require
                resolution within the next 5 business days to protect client satisfaction scores.
              </p>
              <p className="mt-3 text-xs text-slate-400">Generated · Jun 10, 2025 · Based on live health scores, billing status, and escalation data</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
