// ── Report Status Values ───────────────────────────────────────────────────────
export type ReportStatus =
  | "Draft"
  | "In Progress"
  | "Waiting for Department Input"
  | "Ready for QA"
  | "QA In Progress"
  | "Approved"
  | "Ready to Send"
  | "Sent"
  | "Needs Revision"
  | "Overdue";

export type ReportDept = "SEO" | "GBP" | "Yelp" | "Paid Advertising" | "LSA";

// ── Client Report Record ───────────────────────────────────────────────────────
export interface ClientReport {
  id: string;
  client: string;
  dept: ReportDept;
  reportType: string;
  reportingPeriod: string;
  owner: string;
  qaStatus: "Not Started" | "In Queue" | "In Review" | "Approved" | "Failed";
  sendStatus: "Pending" | "Scheduled" | "Sent" | "Bounced";
  dueDate: string;
  lastUpdated: string;
  nextAction: string;
  status: ReportStatus;
}

// ── Department Report Row ──────────────────────────────────────────────────────
export interface DeptReport {
  id: string;
  client: string;
  reportingPeriod: string;
  owner: string;
  status: ReportStatus;
  qaStatus: "Not Started" | "In Queue" | "In Review" | "Approved" | "Failed";
  sendStatus: "Pending" | "Scheduled" | "Sent" | "Bounced";
  dueDate: string;
  lastUpdated: string;
  nextAction: string;
}

// ── Quick Action ───────────────────────────────────────────────────────────────
export const REPORT_QUICK_ACTIONS = [
  "Generate Report",
  "Preview Report",
  "Submit for QA",
  "Mark Ready to Send",
  "Send Report",
  "Export PDF",
  "Export CSV",
] as const;

export type ReportQuickAction = typeof REPORT_QUICK_ACTIONS[number];
