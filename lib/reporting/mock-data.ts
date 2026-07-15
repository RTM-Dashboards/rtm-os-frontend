import type { ClientReport, DeptReport } from "./types";

// ── All Client Reports ─────────────────────────────────────────────────────────
export const allClientReports: ClientReport[] = [
  {
    id: "r001",
    client: "Apex Roofing",
    dept: "SEO",
    reportType: "Monthly SEO",
    reportingPeriod: "May 2025",
    owner: "Sarah M.",
    qaStatus: "Approved",
    sendStatus: "Sent",
    dueDate: "Jun 1, 2025",
    lastUpdated: "Jun 1, 2025",
    nextAction: "Archive",
    status: "Sent",
  },
  {
    id: "r002",
    client: "Pacific Dental",
    dept: "Paid Advertising",
    reportType: "Monthly Paid Ads",
    reportingPeriod: "May 2025",
    owner: "James K.",
    qaStatus: "In Review",
    sendStatus: "Pending",
    dueDate: "Jun 5, 2025",
    lastUpdated: "Jun 3, 2025",
    nextAction: "Awaiting QA Approval",
    status: "QA In Progress",
  },
  {
    id: "r003",
    client: "Harbor Auto",
    dept: "SEO",
    reportType: "Monthly SEO",
    reportingPeriod: "May 2025",
    owner: "Sarah M.",
    qaStatus: "Not Started",
    sendStatus: "Pending",
    dueDate: "Jun 7, 2025",
    lastUpdated: "Jun 2, 2025",
    nextAction: "Complete draft",
    status: "In Progress",
  },
  {
    id: "r004",
    client: "Summit Landscaping",
    dept: "GBP",
    reportType: "Monthly GBP",
    reportingPeriod: "May 2025",
    owner: "Mike T.",
    qaStatus: "Not Started",
    sendStatus: "Pending",
    dueDate: "May 28, 2025",
    lastUpdated: "May 25, 2025",
    nextAction: "Escalate — overdue",
    status: "Overdue",
  },
  {
    id: "r005",
    client: "Metro Dental",
    dept: "LSA",
    reportType: "Monthly LSA",
    reportingPeriod: "May 2025",
    owner: "Dana R.",
    qaStatus: "Not Started",
    sendStatus: "Pending",
    dueDate: "Jun 10, 2025",
    lastUpdated: "Jun 1, 2025",
    nextAction: "Add LSA lead data",
    status: "Draft",
  },
  {
    id: "r006",
    client: "Coastal Plumbing",
    dept: "Yelp",
    reportType: "Monthly Yelp",
    reportingPeriod: "May 2025",
    owner: "Tina W.",
    qaStatus: "Approved",
    sendStatus: "Sent",
    dueDate: "Jun 1, 2025",
    lastUpdated: "Jun 1, 2025",
    nextAction: "Archive",
    status: "Sent",
  },
  {
    id: "r007",
    client: "Blue Sky HVAC",
    dept: "Paid Advertising",
    reportType: "Monthly Google Ads",
    reportingPeriod: "May 2025",
    owner: "James K.",
    qaStatus: "Not Started",
    sendStatus: "Pending",
    dueDate: "Jun 8, 2025",
    lastUpdated: "Jun 3, 2025",
    nextAction: "Pull Google Ads data",
    status: "In Progress",
  },
  {
    id: "r008",
    client: "Radiance MedSpa",
    dept: "SEO",
    reportType: "Monthly SEO",
    reportingPeriod: "May 2025",
    owner: "Sarah M.",
    qaStatus: "In Queue",
    sendStatus: "Pending",
    dueDate: "Jun 6, 2025",
    lastUpdated: "Jun 4, 2025",
    nextAction: "QA review",
    status: "Ready for QA",
  },
  {
    id: "r009",
    client: "Green Thumb Landscaping",
    dept: "GBP",
    reportType: "Monthly GBP",
    reportingPeriod: "May 2025",
    owner: "Mike T.",
    qaStatus: "Approved",
    sendStatus: "Scheduled",
    dueDate: "Jun 9, 2025",
    lastUpdated: "Jun 5, 2025",
    nextAction: "Send report",
    status: "Ready to Send",
  },
  {
    id: "r010",
    client: "Premier Law Group",
    dept: "LSA",
    reportType: "Monthly LSA",
    reportingPeriod: "May 2025",
    owner: "Dana R.",
    qaStatus: "Failed",
    sendStatus: "Pending",
    dueDate: "Jun 3, 2025",
    lastUpdated: "Jun 4, 2025",
    nextAction: "Revise — QA rejected",
    status: "Needs Revision",
  },
];

// ── SEO Department Reports ─────────────────────────────────────────────────────
export const seoDeptReports: DeptReport[] = [
  { id: "s001", client: "Apex Roofing",          reportingPeriod: "May 2025", owner: "Sarah M.", status: "Sent",          qaStatus: "Approved", sendStatus: "Sent",    dueDate: "Jun 1, 2025",  lastUpdated: "Jun 1, 2025",  nextAction: "Archive"},
  { id: "s002", client: "Harbor Auto",            reportingPeriod: "May 2025", owner: "Sarah M.", status: "In Progress",   qaStatus: "Not Started", sendStatus: "Pending", dueDate: "Jun 7, 2025", lastUpdated: "Jun 2, 2025", nextAction: "Complete draft"},
  { id: "s003", client: "Radiance MedSpa",        reportingPeriod: "May 2025", owner: "Sarah M.", status: "Ready for QA",  qaStatus: "In Queue", sendStatus: "Pending", dueDate: "Jun 6, 2025",  lastUpdated: "Jun 4, 2025",  nextAction: "QA review"},
  { id: "s004", client: "Sunrise Orthodontics",   reportingPeriod: "May 2025", owner: "Mark D.",  status: "Draft",         qaStatus: "Not Started", sendStatus: "Pending", dueDate: "Jun 12, 2025", lastUpdated: "Jun 1, 2025", nextAction: "Add ranking data"},
  { id: "s005", client: "Peak Performance Gym",  reportingPeriod: "May 2025", owner: "Sarah M.", status: "Approved",       qaStatus: "Approved", sendStatus: "Scheduled", dueDate: "Jun 8, 2025", lastUpdated: "Jun 5, 2025", nextAction: "Send report"},
];

// ── GBP Department Reports ─────────────────────────────────────────────────────
export const gbpDeptReports: DeptReport[] = [
  { id: "g001", client: "Summit Landscaping",     reportingPeriod: "May 2025", owner: "Mike T.", status: "Overdue",        qaStatus: "Not Started", sendStatus: "Pending", dueDate: "May 28, 2025", lastUpdated: "May 25, 2025", nextAction: "Escalate — overdue"},
  { id: "g002", client: "Green Thumb Landscaping",reportingPeriod: "May 2025", owner: "Mike T.", status: "Ready to Send",  qaStatus: "Approved", sendStatus: "Scheduled", dueDate: "Jun 9, 2025",  lastUpdated: "Jun 5, 2025",  nextAction: "Send report"},
  { id: "g003", client: "City Dental",            reportingPeriod: "May 2025", owner: "Mike T.", status: "In Progress",    qaStatus: "Not Started", sendStatus: "Pending", dueDate: "Jun 10, 2025", lastUpdated: "Jun 3, 2025",  nextAction: "Add GBP metrics"},
  { id: "g004", client: "Mountain View Roofing",  reportingPeriod: "May 2025", owner: "Lisa F.", status: "Sent",           qaStatus: "Approved", sendStatus: "Sent",   dueDate: "Jun 1, 2025",   lastUpdated: "Jun 1, 2025",   nextAction: "Archive"},
];

// ── Yelp Department Reports ─────────────────────────────────────────────────────
export const yelpDeptReports: DeptReport[] = [
  { id: "y001", client: "Coastal Plumbing",       reportingPeriod: "May 2025", owner: "Tina W.", status: "Sent",           qaStatus: "Approved", sendStatus: "Sent",    dueDate: "Jun 1, 2025",  lastUpdated: "Jun 1, 2025",  nextAction: "Archive"},
  { id: "y002", client: "Harbor Restaurant",      reportingPeriod: "May 2025", owner: "Tina W.", status: "In Progress",    qaStatus: "Not Started", sendStatus: "Pending", dueDate: "Jun 8, 2025", lastUpdated: "Jun 3, 2025", nextAction: "Pull Yelp data"},
  { id: "y003", client: "Downtown Spa",           reportingPeriod: "May 2025", owner: "Tina W.", status: "Overdue",        qaStatus: "Not Started", sendStatus: "Pending", dueDate: "May 30, 2025", lastUpdated: "May 28, 2025", nextAction: "Escalate — overdue"},
];

// ── Paid Advertising Department Reports ───────────────────────────────────────
export const paidAdsDeptReports: DeptReport[] = [
  { id: "p001", client: "Pacific Dental",         reportingPeriod: "May 2025", owner: "James K.", status: "QA In Progress", qaStatus: "In Review", sendStatus: "Pending", dueDate: "Jun 5, 2025",  lastUpdated: "Jun 3, 2025",  nextAction: "Awaiting QA Approval"},
  { id: "p002", client: "Blue Sky HVAC",          reportingPeriod: "May 2025", owner: "James K.", status: "In Progress",    qaStatus: "Not Started", sendStatus: "Pending", dueDate: "Jun 8, 2025", lastUpdated: "Jun 3, 2025",  nextAction: "Pull Google Ads data"},
  { id: "p003", client: "Luxe Auto Detailing",   reportingPeriod: "May 2025", owner: "Ana P.",   status: "Sent",           qaStatus: "Approved", sendStatus: "Sent",    dueDate: "Jun 1, 2025",  lastUpdated: "Jun 1, 2025",  nextAction: "Archive"},
  { id: "p004", client: "Atlas Fitness",          reportingPeriod: "May 2025", owner: "James K.", status: "Draft",          qaStatus: "Not Started", sendStatus: "Pending", dueDate: "Jun 12, 2025", lastUpdated: "Jun 2, 2025",  nextAction: "Add campaign data"},
];

// ── Meta Ads Reports ───────────────────────────────────────────────────────────
export const metaAdsDeptReports: DeptReport[] = [
  { id: "m001", client: "Pacific Dental",         reportingPeriod: "May 2025", owner: "James K.", status: "QA In Progress", qaStatus: "In Review", sendStatus: "Pending", dueDate: "Jun 5, 2025",  lastUpdated: "Jun 3, 2025",  nextAction: "Awaiting QA Approval"},
  { id: "m002", client: "Radiance MedSpa",        reportingPeriod: "May 2025", owner: "Ana P.",   status: "Sent",           qaStatus: "Approved", sendStatus: "Sent",    dueDate: "Jun 1, 2025",  lastUpdated: "Jun 1, 2025",  nextAction: "Archive"},
  { id: "m003", client: "Atlas Fitness",          reportingPeriod: "May 2025", owner: "Ana P.",   status: "In Progress",    qaStatus: "Not Started", sendStatus: "Pending", dueDate: "Jun 10, 2025", lastUpdated: "Jun 3, 2025", nextAction: "Pull Meta data"},
];

// ── Google Ads Reports ─────────────────────────────────────────────────────────
export const googleAdsDeptReports: DeptReport[] = [
  { id: "ga001", client: "Blue Sky HVAC",         reportingPeriod: "May 2025", owner: "James K.", status: "In Progress",    qaStatus: "Not Started", sendStatus: "Pending", dueDate: "Jun 8, 2025", lastUpdated: "Jun 3, 2025",  nextAction: "Pull Google Ads data"},
  { id: "ga002", client: "Luxe Auto Detailing",   reportingPeriod: "May 2025", owner: "James K.", status: "Sent",           qaStatus: "Approved", sendStatus: "Sent",    dueDate: "Jun 1, 2025",  lastUpdated: "Jun 1, 2025",  nextAction: "Archive"},
  { id: "ga003", client: "Premier Law Group",     reportingPeriod: "May 2025", owner: "Ana P.",   status: "Draft",          qaStatus: "Not Started", sendStatus: "Pending", dueDate: "Jun 12, 2025", lastUpdated: "Jun 2, 2025",  nextAction: "Add campaign data"},
];

// ── Web Development & Design Department Reports ─────────────────────────────────
export const webDevDeptReports: DeptReport[] = [
  { id: "wd001", client: "Summit Landscaping",    reportingPeriod: "May 2025", owner: "Chris L.", status: "In Progress",  qaStatus: "Not Started", sendStatus: "Pending",   dueDate: "Jun 10, 2025", lastUpdated: "Jun 3, 2025",  nextAction: "Add project milestones"},
  { id: "wd002", client: "Apex Roofing Co.",      reportingPeriod: "May 2025", owner: "Chris L.", status: "Ready for QA", qaStatus: "In Queue",    sendStatus: "Pending",   dueDate: "Jun 8, 2025",  lastUpdated: "Jun 5, 2025",  nextAction: "QA review"},
  { id: "wd003", client: "Pacific Dental",        reportingPeriod: "May 2025", owner: "Maya R.",  status: "Sent",         qaStatus: "Approved",    sendStatus: "Sent",      dueDate: "Jun 1, 2025",  lastUpdated: "Jun 1, 2025",  nextAction: "Archive"},
  { id: "wd004", client: "Harbor Auto Group",     reportingPeriod: "May 2025", owner: "Chris L.", status: "Draft",        qaStatus: "Not Started", sendStatus: "Pending",   dueDate: "Jun 12, 2025", lastUpdated: "Jun 2, 2025",  nextAction: "Add design deliverables"},
  { id: "wd005", client: "Blue Ridge Plumbing",   reportingPeriod: "May 2025", owner: "Maya R.",  status: "Overdue",      qaStatus: "Not Started", sendStatus: "Pending",   dueDate: "May 30, 2025", lastUpdated: "May 28, 2025", nextAction: "Escalate — overdue"},
];

// ── LSA Department Reports ─────────────────────────────────────────────────────
export const lsaDeptReports: DeptReport[] = [
  { id: "l001", client: "Metro Dental",           reportingPeriod: "May 2025", owner: "Dana R.", status: "Draft",           qaStatus: "Not Started", sendStatus: "Pending", dueDate: "Jun 10, 2025", lastUpdated: "Jun 1, 2025", nextAction: "Add LSA lead data"},
  { id: "l002", client: "Premier Law Group",      reportingPeriod: "May 2025", owner: "Dana R.", status: "Needs Revision",  qaStatus: "Failed",  sendStatus: "Pending",    dueDate: "Jun 3, 2025",  lastUpdated: "Jun 4, 2025",  nextAction: "Revise — QA rejected"},
  { id: "l003", client: "Apex Roofing",           reportingPeriod: "May 2025", owner: "Dana R.", status: "Sent",            qaStatus: "Approved", sendStatus: "Sent",      dueDate: "Jun 1, 2025",  lastUpdated: "Jun 1, 2025",  nextAction: "Archive"},
  { id: "l004", client: "City Plumbing Co.",      reportingPeriod: "May 2025", owner: "Dana R.", status: "In Progress",     qaStatus: "Not Started", sendStatus: "Pending", dueDate: "Jun 9, 2025",  lastUpdated: "Jun 3, 2025",  nextAction: "Add budget pacing data"},
];
