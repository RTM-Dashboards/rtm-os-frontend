"use client";

import { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import {
  useReports,
  reportStatusVariant as liveReportStatusVariant,
  qaStatusVariant as liveQaStatusVariant,
  amStatusVariant as liveAmStatusVariant,
  deliveryStatusVariant as liveDeliveryStatusVariant,
} from "@/lib/reporting/useReports";

const workspace = getWorkspace("reporting")!;

//  KPI mock data 
const kpiData = {
  reportsDueThisWeek:              12,
  reportsOverdue:                   4,
  reportsInProgress:                9,
  reportsWaitingForDeptInput:       6,
  reportsInQA:                      3,
  reportsWaitingForAMReview:        5,
  reportsReadyToSend:               7,
  reportsSentThisMonth:            41,
};

//  Report Queue mock data 
const reportQueueData = [
  { client: "Apex Roofing",        am: "Sarah M.",   type: "Monthly SEO",      period: "May 2025",  owner: "Jake T.",   due: "Jun 7",  status: "Drafting",                    qa: "Pending QA",       amReview: "Pending AM Review",    delivery: "Ready To Send",    next: "Submit for QA"},
  { client: "Pacific Dental",      am: "Chris L.",   type: "Monthly Paid Ads", period: "May 2025",  owner: "Mia K.",    due: "Jun 5",  status: "QA Review",                   qa: "QA In Progress",   amReview: "Pending AM Review",    delivery: "Ready To Send",    next: "Complete QA"},
  { client: "Harbor Auto",         am: "Tom R.",     type: "Monthly GBP",      period: "May 2025",  owner: "Nina P.",   due: "Jun 8",  status: "Data Gathering",              qa: "Pending QA",       amReview: "Pending AM Review",    delivery: "Ready To Send",    next: "Complete data pull"},
  { client: "Summit Landscaping",  am: "Dana W.",    type: "Monthly SEO",      period: "May 2025",  owner: "Leo S.",    due: "May 30", status: "Overdue",                     qa: "Pending QA",       amReview: "Pending AM Review",    delivery: "Ready To Send",    next: "Escalate to owner"},
  { client: "Metro Dental",        am: "Sarah M.",   type: "Monthly LSA",      period: "May 2025",  owner: "Jake T.",   due: "Jun 10", status: "Waiting For Department Input",qa: "Pending QA",       amReview: "Pending AM Review",    delivery: "Ready To Send",    next: "Chase LSA team"},
  { client: "Coastal Plumbing",    am: "Chris L.",   type: "Monthly Yelp",     period: "May 2025",  owner: "Mia K.",    due: "Jun 1",  status: "Sent",                        qa: "Approved",         amReview: "Approved By AM",       delivery: "Sent",             next: "—"},
  { client: "BlueSky HVAC",        am: "Tom R.",     type: "Monthly Meta Ads", period: "May 2025",  owner: "Nina P.",   due: "Jun 6",  status: "AM Review",                   qa: "Approved",         amReview: "In Review",            delivery: "Ready To Send",    next: "AM to approve"},
  { client: "Prestige Auto",       am: "Dana W.",    type: "Monthly Google Ads",period: "May 2025", owner: "Leo S.",    due: "Jun 9",  status: "Not Started",                 qa: "Pending QA",       amReview: "Pending AM Review",    delivery: "Ready To Send",    next: "Begin data gathering"},
  { client: "Urban Dental",        am: "Sarah M.",   type: "Monthly Content",  period: "May 2025",  owner: "Jake T.",   due: "Jun 11", status: "Needs Revision",              qa: "Issues Found",     amReview: "Revision Requested",   delivery: "Ready To Send",    next: "Apply QA revisions"},
  { client: "Skyline Roofing",     am: "Chris L.",   type: "Monthly Web Dev",  period: "May 2025",  owner: "Mia K.",    due: "Jun 4",  status: "Ready To Send",               qa: "Approved",         amReview: "Approved By AM",       delivery: "Ready To Send",    next: "Send to client"},
];

const reportStatusColor: Record<string, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Not Started":                     "neutral",
  "Data Gathering":                  "info",
  "Waiting For Department Input":    "warning",
  "Drafting":                        "info",
  "QA Review":                       "info",
  "AM Review":                       "info",
  "Ready To Send":                   "success",
  "Sent":                            "success",
  "Needs Revision":                  "error",
  "Overdue":                         "error",
};

//  Department Inputs mock data 
const deptInputsData = [
  { client: "Metro Dental",      dept: "LSA",                inputNeeded: "May performance data",  owner: "Ryan B.",    due: "Jun 5",  status: "Pending",    blocker: "API delay",           notes: "Escalated to LSA lead"},
  { client: "Apex Roofing",      dept: "SEO",                inputNeeded: "Keyword ranking export",owner: "Jake T.",    due: "Jun 6",  status: "Received",   blocker: "—",                   notes: ""},
  { client: "Harbor Auto",       dept: "GBP",                inputNeeded: "Review summary",        owner: "Nina P.",    due: "Jun 7",  status: "Pending",    blocker: "Access issue",        notes: "Pending credential fix"},
  { client: "Pacific Dental",    dept: "Paid Advertising",   inputNeeded: "Ad spend report",       owner: "Mia K.",     due: "Jun 5",  status: "Received",   blocker: "—",                   notes: ""},
  { client: "Summit Landscaping",dept: "Yelp",               inputNeeded: "Review stats",          owner: "Leo S.",     due: "May 30", status: "Overdue",    blocker: "Owner unavailable",   notes: "Overdue — chase immediately"},
  { client: "BlueSky HVAC",      dept: "Meta Ads",           inputNeeded: "Campaign metrics",      owner: "Dana W.",    due: "Jun 6",  status: "In Progress",blocker: "—",                   notes: ""},
  { client: "Prestige Auto",     dept: "Google Ads",         inputNeeded: "ROAS breakdown",        owner: "Chris L.",   due: "Jun 9",  status: "Pending",    blocker: "—",                   notes: ""},
  { client: "Urban Dental",      dept: "Content",            inputNeeded: "Blog publish proof",    owner: "Sarah M.",   due: "Jun 11", status: "Pending",    blocker: "—",                   notes: ""},
  { client: "Skyline Roofing",   dept: "Web Development",    inputNeeded: "Speed report",          owner: "Tom R.",     due: "Jun 4",  status: "Received",   blocker: "—",                   notes: ""},
  { client: "Coastal Plumbing",  dept: "Billing",            inputNeeded: "Invoice confirmation",  owner: "Dana W.",    due: "Jun 1",  status: "Received",   blocker: "—",                   notes: ""},
  { client: "Apex Roofing",      dept: "Account Management", inputNeeded: "AM notes / strategy",  owner: "Sarah M.",   due: "Jun 6",  status: "In Progress",blocker: "—",                   notes: ""},
];

const inputStatusVariant: Record<string, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Received":    "success",
  "In Progress": "info",
  "Pending":     "pending",
  "Overdue":     "error",
};

//  QA Workflow mock data 
const qaData = [
  { report: "Monthly Paid Ads",  client: "Pacific Dental",     qaOwner: "Mia K.",   qaStatus: "QA In Progress",     issues: 0, revOwner: "—",        due: "Jun 5",  approval: "Pending"},
  { report: "Monthly SEO",       client: "Apex Roofing",       qaOwner: "Jake T.",  qaStatus: "Pending QA",         issues: 0, revOwner: "—",        due: "Jun 7",  approval: "Pending"},
  { report: "Monthly Content",   client: "Urban Dental",       qaOwner: "Nina P.",  qaStatus: "Issues Found",       issues: 3, revOwner: "Jake T.",  due: "Jun 11", approval: "Pending"},
  { report: "Monthly Meta Ads",  client: "BlueSky HVAC",       qaOwner: "Leo S.",   qaStatus: "Approved",           issues: 0, revOwner: "—",        due: "Jun 6",  approval: "Approved"},
  { report: "Monthly Web Dev",   client: "Skyline Roofing",    qaOwner: "Tom R.",   qaStatus: "Approved",           issues: 0, revOwner: "—",        due: "Jun 4",  approval: "Approved"},
  { report: "Monthly Google Ads",client: "Prestige Auto",      qaOwner: "Mia K.",   qaStatus: "Pending QA",         issues: 0, revOwner: "—",        due: "Jun 9",  approval: "Pending"},
  { report: "Monthly LSA",       client: "Metro Dental",       qaOwner: "Leo S.",   qaStatus: "Revision Requested", issues: 2, revOwner: "Jake T.",  due: "Jun 10", approval: "Pending"},
];

const qaStatusVariant: Record<string, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Pending QA":           "neutral",
  "QA In Progress":       "info",
  "Issues Found":         "error",
  "Revision Requested":   "warning",
  "Approved":             "success",
  "Rejected":             "error",
};

//  AM Review mock data 
const amReviewData = [
  { client: "BlueSky HVAC",      report: "Monthly Meta Ads",   am: "Tom R.",    status: "In Review",           notes: "Checking spend allocation", due: "Jun 6",  next: "AM to approve"},
  { client: "Pacific Dental",    report: "Monthly Paid Ads",   am: "Chris L.",  status: "Pending AM Review",   notes: "",                          due: "Jun 5",  next: "Awaiting QA completion"},
  { client: "Apex Roofing",      report: "Monthly SEO",        am: "Sarah M.",  status: "Pending AM Review",   notes: "",                          due: "Jun 7",  next: "QA must approve first"},
  { client: "Skyline Roofing",   report: "Monthly Web Dev",    am: "Chris L.",  status: "Approved By AM",      notes: "Looks great",               due: "Jun 4",  next: "Send to client"},
  { client: "Metro Dental",      report: "Monthly LSA",        am: "Sarah M.",  status: "Revision Requested",  notes: "Fix LSA numbers",           due: "Jun 10", next: "Owner to revise"},
  { client: "Prestige Auto",     report: "Monthly Google Ads", am: "Dana W.",   status: "Pending AM Review",   notes: "",                          due: "Jun 9",  next: "In data gathering"},
  { client: "Urban Dental",      report: "Monthly Content",    am: "Sarah M.",  status: "Revision Requested",  notes: "Need updated blog links",   due: "Jun 11", next: "QA revision first"},
];

const amStatusVariant: Record<string, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Pending AM Review":   "neutral",
  "In Review":           "info",
  "Approved By AM":      "success",
  "Revision Requested":  "warning",
  "Ready For Client":    "success",
};

//  Client Delivery mock data 
const deliveryData = [
  { client: "Skyline Roofing",   report: "Monthly Web Dev",    method: "Email",          sent: "Jun 4",  status: "Viewed",           feedback: "Happy with results",  followUp: false },
  { client: "Coastal Plumbing",  report: "Monthly Yelp",       method: "Portal",         sent: "Jun 1",  status: "Sent",             feedback: "",                    followUp: false },
  { client: "BlueSky HVAC",      report: "Monthly Meta Ads",   method: "Email",          sent: "—",      status: "Ready To Send",    feedback: "",                    followUp: false },
  { client: "Pacific Dental",    report: "Monthly Paid Ads",   method: "Email + Portal", sent: "—",      status: "Ready To Send",    feedback: "",                    followUp: false },
  { client: "Apex Roofing",      report: "Monthly SEO",        method: "Email",          sent: "—",      status: "Ready To Send",    feedback: "",                    followUp: true },
  { client: "Metro Dental",      report: "Monthly LSA",        method: "Portal",         sent: "Jun 2",  status: "Feedback Received",feedback: "Wants call to review",followUp: true },
  { client: "Harbor Auto",       report: "Monthly GBP",        method: "Email",          sent: "May 31", status: "Follow-up Needed", feedback: "No response",         followUp: true },
];

const deliveryStatusVariant: Record<string, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Ready To Send":     "pending",
  "Sent":              "info",
  "Viewed":            "success",
  "Feedback Received": "success",
  "Follow-up Needed":  "warning",
};

//  Report Template Library mock data 
const templateLibraryData = [
  { name: "SEO Monthly Report",         dept: "SEO",              sections: "Exec Summary, Keyword Rankings, Traffic, Backlinks, Completed Work, Next Steps", freq: "Monthly",   owner: "Jake T.",   status: "Active",   lastModified: "May 15, 2025"},
  { name: "GBP Monthly Report",         dept: "GBP",              sections: "Exec Summary, Review Metrics, GBP Posts, Listing Health, Recommendations",        freq: "Monthly",   owner: "Nina P.",   status: "Active",   lastModified: "May 10, 2025"},
  { name: "Yelp Monthly Report",        dept: "Yelp",             sections: "Exec Summary, Review Summary, Rating Trends, Competitor Snapshot, Next Steps",     freq: "Monthly",   owner: "Mia K.",    status: "Active",   lastModified: "May 8, 2025"},
  { name: "Paid Advertising Report",    dept: "Paid Advertising", sections: "Exec Summary, Spend Overview, ROAS, Conversions, Campaign Breakdown, Recs",        freq: "Monthly",   owner: "Leo S.",    status: "Active",   lastModified: "May 20, 2025"},
  { name: "Meta Ads Report",            dept: "Meta Ads",         sections: "Exec Summary, Impressions, CTR, CPC, Conversion Events, Creative Performance",     freq: "Monthly",   owner: "Dana W.",   status: "Active",   lastModified: "May 18, 2025"},
  { name: "Google Ads Report",          dept: "Google Ads",       sections: "Exec Summary, Quality Score, Impressions, CPC, Conversions, Campaign Health",      freq: "Monthly",   owner: "Leo S.",    status: "Active",   lastModified: "May 22, 2025"},
  { name: "LSA Report",                 dept: "LSA",              sections: "Exec Summary, Lead Volume, Cost Per Lead, Lead Quality, Disputes, Next Steps",      freq: "Monthly",   owner: "Ryan B.",   status: "Active",   lastModified: "May 12, 2025"},
  { name: "Executive Client Summary",   dept: "Multi",            sections: "Portfolio Health, Revenue Snapshot, KPI Summary, Highlights, Risks, Next Actions",  freq: "Monthly",   owner: "Sarah M.",  status: "Active",   lastModified: "May 25, 2025"},
  { name: "Multi-Service Monthly Report",dept: "Multi",           sections: "Exec Summary, All Channel KPIs, Completed Work, Open Tasks, Risks, Next Month Plan",freq: "Monthly",   owner: "Chris L.",  status: "Draft",    lastModified: "Jun 1, 2025"},
];

const templateStatusVariant: Record<string, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Active":   "success",
  "Draft":    "warning",
  "Archived": "neutral",
};

//  Report Builder mock form state 
const builderSections = [
  "Executive Summary",
  "KPI Summary",
  "Channel Performance",
  "Completed Work",
  "Open Tasks",
  "Risks / Issues",
  "Recommendations",
  "Next Month Plan",
];

//  Reporting Calendar mock data 
const calendarData = [
  { date: "Jun 4, 2025",  client: "Skyline Roofing",   type: "Monthly Web Dev",     owner: "Mia K.",    status: "Sent",           next: "—"},
  { date: "Jun 5, 2025",  client: "Pacific Dental",    type: "Monthly Paid Ads",    owner: "Mia K.",    status: "QA Review",      next: "Complete QA"},
  { date: "Jun 6, 2025",  client: "BlueSky HVAC",      type: "Monthly Meta Ads",    owner: "Nina P.",   status: "AM Review",      next: "AM to approve"},
  { date: "Jun 7, 2025",  client: "Apex Roofing",      type: "Monthly SEO",         owner: "Jake T.",   status: "Drafting",       next: "Submit for QA"},
  { date: "Jun 8, 2025",  client: "Harbor Auto",       type: "Monthly GBP",         owner: "Nina P.",   status: "Data Gathering", next: "Complete data pull"},
  { date: "Jun 9, 2025",  client: "Prestige Auto",     type: "Monthly Google Ads",  owner: "Leo S.",    status: "Not Started",    next: "Begin data gathering"},
  { date: "Jun 10, 2025", client: "Metro Dental",      type: "Monthly LSA",         owner: "Jake T.",   status: "Waiting For Dept Input", next: "Chase LSA team"},
  { date: "Jun 11, 2025", client: "Urban Dental",      type: "Monthly Content",     owner: "Jake T.",   status: "Needs Revision", next: "Apply QA revisions"},
  { date: "May 30, 2025", client: "Summit Landscaping",type: "Monthly SEO",         owner: "Leo S.",    status: "Overdue",        next: "Escalate to owner"},
  { date: "Jun 1, 2025",  client: "Coastal Plumbing",  type: "Monthly Yelp",        owner: "Mia K.",    status: "Sent",           next: "—"},
  { date: "Jun 2, 2025",  client: "Metro Dental",      type: "Monthly LSA (Apr)",   owner: "Jake T.",   status: "Sent",           next: "Follow-up call scheduled"},
];

const calendarStatusVariant: Record<string, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Sent":                    "success",
  "QA Review":               "info",
  "AM Review":               "info",
  "Drafting":                "info",
  "Data Gathering":          "info",
  "Not Started":             "neutral",
  "Waiting For Dept Input":  "warning",
  "Needs Revision":          "error",
  "Overdue":                 "error",
  "Ready To Send":           "pending",
};

//  Scheduled Reporting mock data 
const scheduledData = [
  { client: "Apex Roofing",        template: "SEO Monthly Report",          freq: "Monthly",   sendDay: "1st of month", am: "Sarah M.",  delivery: "Email",          status: "Active"},
  { client: "Pacific Dental",      template: "Paid Advertising Report",     freq: "Monthly",   sendDay: "5th of month", am: "Chris L.",  delivery: "Email + Portal", status: "Active"},
  { client: "Harbor Auto",         template: "GBP Monthly Report",          freq: "Monthly",   sendDay: "7th of month", am: "Tom R.",    delivery: "Email",          status: "Active"},
  { client: "Metro Dental",        template: "LSA Report",                  freq: "Monthly",   sendDay: "10th of month",am: "Sarah M.",  delivery: "Client Portal",  status: "Active"},
  { client: "Coastal Plumbing",    template: "Yelp Monthly Report",         freq: "Monthly",   sendDay: "1st of month", am: "Chris L.",  delivery: "Client Portal",  status: "Active"},
  { client: "BlueSky HVAC",        template: "Meta Ads Report",             freq: "Monthly",   sendDay: "6th of month", am: "Tom R.",    delivery: "Email",          status: "Active"},
  { client: "Prestige Auto",       template: "Google Ads Report",           freq: "Monthly",   sendDay: "9th of month", am: "Dana W.",   delivery: "Email",          status: "Active"},
  { client: "Summit Landscaping",  template: "SEO Monthly Report",          freq: "Monthly",   sendDay: "3rd of month", am: "Dana W.",   delivery: "Manual Send",    status: "Paused"},
  { client: "Urban Dental",        template: "Multi-Service Monthly Report",freq: "Monthly",   sendDay: "11th of month",am: "Sarah M.",  delivery: "Email + Portal", status: "Active"},
  { client: "Skyline Roofing",     template: "Executive Client Summary",    freq: "Quarterly", sendDay: "End of quarter",am: "Chris L.", delivery: "Email",          status: "Active"},
  { client: "Harbor Auto",         template: "Executive Client Summary",    freq: "Quarterly", sendDay: "End of quarter",am: "Tom R.",   delivery: "Manual Send",    status: "Active"},
];

const scheduleStatusVariant: Record<string, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Active": "success",
  "Paused": "warning",
  "Inactive": "neutral",
};

//  Executive Reports mock data 
const execPortfolioData = [
  { metric: "Total Active Clients",   value: "47",    trend: "+3 MoM",   status: "Healthy"},
  { metric: "Reports Sent This Month",value: "41",    trend: "+8 MoM",   status: "Healthy"},
  { metric: "On-Time Delivery Rate",  value: "87%",   trend: "-2% MoM",  status: "Warning"},
  { metric: "Avg Report Delay",       value: "1.4d",  trend: "-0.3d MoM",status: "Healthy"},
  { metric: "QA Pass Rate",           value: "91%",   trend: "+1% MoM",  status: "Healthy"},
  { metric: "AM Approval Rate",       value: "88%",   trend: "-1% MoM",  status: "Warning"},
];

const execClientHealthData = [
  { client: "Apex Roofing",        health: "Healthy", revenue: "$4,200", renewalDate: "Sep 2025", upsell: "None",    am: "Sarah M."},
  { client: "Pacific Dental",      health: "Warning", revenue: "$6,800", renewalDate: "Jul 2025", upsell: "Yelp",    am: "Chris L."},
  { client: "Harbor Auto",         health: "Healthy", revenue: "$3,500", renewalDate: "Oct 2025", upsell: "None",    am: "Tom R."},
  { client: "Metro Dental",        health: "At Risk", revenue: "$5,100", renewalDate: "Jun 2025", upsell: "None",    am: "Sarah M."},
  { client: "BlueSky HVAC",        health: "Healthy", revenue: "$4,600", renewalDate: "Nov 2025", upsell: "LSA",     am: "Tom R."},
  { client: "Prestige Auto",       health: "Healthy", revenue: "$7,200", renewalDate: "Dec 2025", upsell: "GBP",     am: "Dana W."},
  { client: "Skyline Roofing",     health: "Healthy", revenue: "$3,800", renewalDate: "Aug 2025", upsell: "None",    am: "Chris L."},
];

const execHealthVariant: Record<string, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Healthy":  "success",
  "Warning":  "warning",
  "At Risk":  "error",
};

//  Report Automation Rules mock data 
const automationRules = [
  { rule: "Auto-Draft on Period End",          trigger: "Monthly reporting period closes",               action: "Generate draft report from template",            status: "Active"},
  { rule: "Submit to QA When Inputs Complete", trigger: "All department inputs marked Received",        action: "Automatically submit report to QA queue",        status: "Active"},
  { rule: "Notify AM on QA Approval",          trigger: "QA status set to Approved",                   action: "Send AM notification — report ready for review",  status: "Active"},
  { rule: "Mark Ready to Send on AM Approval", trigger: "AM Review status set to Approved By AM",      action: "Set delivery status to Ready To Send",           status: "Active"},
  { rule: "Create Follow-up Task on Send",     trigger: "Report delivery status set to Sent",          action: "Auto-create 7-day client follow-up task",        status: "Active"},
  { rule: "Escalate Overdue Reports",          trigger: "Report due date passes with no QA submission",action: "Flag as Overdue, notify report owner and AM",    status: "Active"},
  { rule: "Chase Dept Input After 48h",        trigger: "Dept input Pending > 48 hours past due",      action: "Send automated chase email to dept owner",      status: "Active"},
  { rule: "Disable Schedule on Pause",         trigger: "Client status set to Paused",                 action: "Suspend scheduled report generation",            status: "Active"},
];

const autoRuleStatusVariant: Record<string, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Active":   "success",
  "Inactive": "neutral",
  "Paused":   "warning",
};

//  Reporting Health Dashboard mock data 
const healthMetrics = [
  { metric: "On-Time Report Rate",            value: "87%",  target: "95%", trend: "down",  color: "#EA580C"},
  { metric: "Dept Input Completion Rate",     value: "78%",  target: "90%", trend: "up",    color: "#D97706"},
  { metric: "QA Approval Rate",               value: "91%",  target: "95%", trend: "up",    color: "#16A34A"},
  { metric: "AM Review Completion Rate",      value: "88%",  target: "95%", trend: "down",  color: "#EA580C"},
  { metric: "Client Delivery Success Rate",   value: "96%",  target: "99%", trend: "up",    color: "#059669"},
  { metric: "Average Report Delay",           value: "1.4d", target: "0d",  trend: "down",  color: "#16A34A"},
];

//  Section tab state 
type ActiveSection =
  | "queue"| "deptInputs"| "qa"| "amReview"| "delivery"| "templateLibrary"| "reportBuilder"| "calendar"| "scheduled"| "executive"| "automation"| "health";

export default function ReportingDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("queue");
  const [selectedSections, setSelectedSections] = useState<string[]>(builderSections);
  const { records: liveReports, loading: reportsLoading, updateReportStatus } = useReports();

  const toggleSection = (s: string) => {
    setSelectedSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const tabs: { id: ActiveSection; label: string }[] = [
    { id: "queue",           label: "Report Queue"},
    { id: "deptInputs",      label: "Department Inputs Center"},
    { id: "qa",              label: "QA Workflow"},
    { id: "amReview",        label: "AM Review Workflow"},
    { id: "delivery",        label: "Client Delivery Workflow"},
    { id: "templateLibrary", label: "Report Template Library"},
    { id: "reportBuilder",   label: "Report Builder"},
    { id: "calendar",        label: "Reporting Calendar"},
    { id: "scheduled",       label: "Scheduled Reporting"},
    { id: "executive",       label: "Executive Reports"},
    { id: "automation",      label: "Report Automation Rules"},
    { id: "health",          label: "Reporting Health Dashboard"},
  ];

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        workspace={workspace}
        subtitle="Reporting Operations & Intelligence — automated data collection, call intelligence, AI classification, and end-to-end report delivery."/>

      {/*  Operations Hub  */}
      <SectionWrapper title="Operations Hub"description="Navigate all reporting operations and intelligence centers">
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            {
              label: "Data Sources",
              description: "Manage connectors and automated data collection.",
              href: "/reporting/data-sources",
              color: "#1D4ED8",
              bg: "#EFF6FF",
            },
            {
              label: "Call Intelligence",
              description: "AI call analysis, classification, and lead quality.",
              href: "/reporting/call-intelligence",
              color: "#065F46",
              bg: "#D1FAE5",
            },
            {
              label: "Report Generation",
              description: "Generate and track AI-assisted report production.",
              href: "/reporting/report-generation",
              color: "#0F766E",
              bg: "#CCFBF1",
            },
            {
              label: "Department Review",
              description: "Track department data verification and sign-off.",
              href: "/reporting/department-review",
              color: "#C2410C",
              bg: "#FFF7ED",
            },
            {
              label: "AM Review",
              description: "Account manager approval and delivery scheduling.",
              href: "/reporting/am-review",
              color: "#6D28D9",
              bg: "#F5F3FF",
            },
            {
              label: "Business Intelligence",
              description: "AI insights, trends, renewal signals, and upsell opportunities.",
              href: "/reporting/business-intelligence",
              color: "#0369A1",
              bg: "#F0F9FF",
            },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col gap-1.5 p-4 rounded-xl border transition-all hover:shadow-sm hover:opacity-90"style={{ background: item.bg, borderColor: `${item.color}30`, textDecoration: "none"}}
            >
              <div className="text-sm font-bold"style={{ color: item.color }}>{item.label}</div>
              <div className="text-xs leading-relaxed"style={{ color: item.color }}>{item.description}</div>
            </a>
          ))}
        </div>

        {/* Workflow Pipeline */}
        <div className="mt-4 pt-4"style={{ borderTop: "1px solid var(--rtm-border-light)"}}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-3"style={{ color: "var(--rtm-text-muted)"}}>Reporting Workflow</div>
          <div className="flex flex-wrap items-center gap-1">
            {[
              { label: "Data Sources", color: "#1D4ED8"},
              { label: "Auto Collection", color: "#7C3AED"},
              { label: "Call Intelligence", color: "#065F46"},
              { label: "AI Classification", color: "#0F766E"},
              { label: "Draft Report", color: "#D97706"},
              { label: "Reporting QA", color: "#EA580C"},
              { label: "Dept Review", color: "#C2410C"},
              { label: "AM Review", color: "#6D28D9"},
              { label: "Client Delivery", color: "#059669"},
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-1">
                <span className="text-xs font-semibold px-2 py-1 rounded"style={{ background: `${step.color}15`, color: step.color }}>{step.label}</span>
                {i < arr.length - 1 && (
                  <svg className="w-3 h-3 flex-shrink-0"fill="none"stroke="currentColor"viewBox="0 0 24 24"style={{ color: "var(--rtm-text-muted)"}}><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/*  KPI Row  */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Reports Due This Week"value={String(kpiData.reportsDueThisWeek)}
          trend="down"trendValue="2"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
        />
        <KpiCard
          title="Reports Overdue"value={String(kpiData.reportsOverdue)}
          trend="up"trendValue="1"iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
        />
        <KpiCard
          title="Reports In Progress"value={String(kpiData.reportsInProgress)}
          trend="up"trendValue="3"iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>}
        />
        <KpiCard
          title="Waiting For Dept Input"value={String(kpiData.reportsWaitingForDeptInput)}
          trend="down"trendValue="1"iconBg="#FFF7ED"iconColor="#EA580C"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
        />
        <KpiCard
          title="Reports In QA"value={String(kpiData.reportsInQA)}
          trend="up"trendValue="1"iconBg="#F0FDF4"iconColor="#16A34A"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>}
        />
        <KpiCard
          title="Waiting For AM Review"value={String(kpiData.reportsWaitingForAMReview)}
          trend="down"trendValue="2"iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
        />
        <KpiCard
          title="Reports Ready To Send"value={String(kpiData.reportsReadyToSend)}
          trend="up"trendValue="2"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KpiCard
          title="Reports Sent This Month"value={String(kpiData.reportsSentThisMonth)}
          trend="up"trendValue="8"iconBg="#EFF6FF"iconColor="#2563EB"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
        />
      </div>

      {/*  Action Center  */}
      <SectionWrapper title="Action Center"description="Quick actions for the full report production and delivery workflow">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Create Template",           color: "#7C3AED", bg: "#7C3AED15"},
            { label: "Build Report",              color: "#0F766E", bg: "#0F766E15"},
            { label: "Schedule Report",           color: "#D97706", bg: "#D9770615"},
            { label: "Generate Executive Summary",color: "#2563EB", bg: "#2563EB15"},
            { label: "Preview Client Report",     color: "#0891B2", bg: "#0891B215"},
            { label: "Send Report",               color: "#059669", bg: "#05966915"},
            { label: "Create Follow-up Task",     color: "#EA580C", bg: "#EA580C15"},
            { label: "Request Department Input",  color: "#EA580C", bg: "#EA580C15"},
            { label: "Submit For QA",             color: "#16A34A", bg: "#16A34A15"},
            { label: "Request Revision",          color: "#DC2626", bg: "#DC262615"},
            { label: "Approve Report",            color: "#059669", bg: "#05966915"},
            { label: "Send To AM",                color: "#7C3AED", bg: "#7C3AED15"},
            { label: "Send To Client",            color: "#2563EB", bg: "#2563EB15"},
          ].map((action) => (
            <button
              key={action.label}
              className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90 hover:shadow-sm"style={{ color: action.color, background: action.bg, borderColor: `${action.color}40` }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </SectionWrapper>

      {/*  Section Tabs  */}
      <div className="border-b"style={{ borderColor: "var(--rtm-border-light)"}}>
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className="whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"style={{
                borderColor: activeSection === tab.id ? "var(--rtm-blue)": "transparent",
                color: activeSection === tab.id ? "var(--rtm-blue)": "var(--rtm-text-muted)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/*  Report Queue — wired to live data  */}
      {activeSection === "queue" && (
        <SectionWrapper title="Report Queue" description="All active client reports and their current workflow status">
          {reportsLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading reports…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1400px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Client", "Account Manager", "Report Type", "Reporting Period", "Report Owner", "Due Date", "Report Status", "QA Status", "AM Review Status", "Client Delivery Status", "Next Action"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveReports.map((row) => {
                    const nextAction =
                      row.status === "Not Started" ? "Begin data gathering" :
                      row.status === "Data Gathering" ? "Complete data pull" :
                      row.status === "Waiting For Department Input" ? "Chase dept team" :
                      row.status === "Drafting" ? "Submit for QA" :
                      row.status === "QA Review" ? "Complete QA" :
                      row.status === "Needs Revision" ? "Apply QA revisions" :
                      row.status === "Overdue" ? "Escalate to owner" :
                      row.status === "AM Review" ? "AM to approve" :
                      row.status === "Ready To Send" ? "Send to client" :
                      row.status === "Sent" ? "—" : "—";
                    return (
                      <tr key={row.reportId} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                        <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.clientName}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.amId}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.reportType}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.period}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.ownerId}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium" style={{ color: row.status === "Overdue" ? "#DC2626" : "var(--rtm-text-secondary)" }}>{row.dueDate}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={liveReportStatusVariant[row.status] ?? "neutral"} label={row.status} size="sm" /></td>
                        <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={liveQaStatusVariant[row.qaStatus] ?? "neutral"} label={row.qaStatus} size="sm" /></td>
                        <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={liveAmStatusVariant[row.amStatus] ?? "neutral"} label={row.amStatus} size="sm" /></td>
                        <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={liveDeliveryStatusVariant[row.deliveryStatus] ?? "neutral"} label={row.deliveryStatus} size="sm" /></td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-xs font-medium" style={{ color: "var(--rtm-blue)" }}>{nextAction}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionWrapper>
      )}

      {/*  Department Inputs Center  */}
      {activeSection === "deptInputs"&& (
        <SectionWrapper title="Department Inputs Center"description="Track required data inputs from all departments for active reports">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                  {["Client", "Department", "Input Needed", "Owner", "Due Date", "Status", "Blocker", "Notes"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptInputsData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>{row.client}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}>{row.dept}</span>
                    </td>
                    <td className="py-2.5 px-3"style={{ color: "var(--rtm-text-secondary)"}}>{row.inputNeeded}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.owner}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium"style={{ color: row.status === "Overdue"? "#DC2626": "var(--rtm-text-secondary)"}}>{row.due}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={inputStatusVariant[row.status] ?? "neutral"} label={row.status} size="sm"/></td>
                    <td className="py-2.5 px-3 text-xs"style={{ color: row.blocker !== "—"? "#DC2626": "var(--rtm-text-muted)"}}>{row.blocker}</td>
                    <td className="py-2.5 px-3 text-xs"style={{ color: "var(--rtm-text-muted)"}}>{row.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

      {/*  QA Workflow — wired to live data  */}
      {activeSection === "qa" && (
        <SectionWrapper title="QA Workflow" description="Quality assurance tracking for all reports in review">
          {reportsLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Report", "Client", "QA Owner", "QA Status", "AM Review Status", "Due Date", "Actions"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveReports.map((row) => (
                    <tr key={row.reportId} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.reportName}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.clientName}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.ownerId}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={liveQaStatusVariant[row.qaStatus] ?? "neutral"} label={row.qaStatus} size="sm" /></td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={liveAmStatusVariant[row.amStatus] ?? "neutral"} label={row.amStatus} size="sm" /></td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.dueDate}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          {row.qaStatus !== "Approved" && (
                            <button
                              onClick={() => void updateReportStatus(row.reportId, { qaStatus: "Approved", status: "AM Review", amStatus: row.amStatus === "Approved By AM" ? row.amStatus : "Pending AM Review" })}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                              style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
                            >Approve</button>
                          )}
                          {row.qaStatus !== "Issues Found" && (
                            <button
                              onClick={() => void updateReportStatus(row.reportId, { qaStatus: "Issues Found", status: "Needs Revision" })}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                              style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}
                            >Issues Found</button>
                          )}
                          {row.qaStatus !== "Revision Requested" && (
                            <button
                              onClick={() => void updateReportStatus(row.reportId, { qaStatus: "Revision Requested", status: "Needs Revision" })}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                              style={{ color: "#D97706", background: "#D9770615", borderColor: "#D9770640" }}
                            >Request Revision</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionWrapper>
      )}

      {/*  AM Review Workflow  */}
      {activeSection === "amReview"&& (
        <SectionWrapper title="AM Review Workflow"description="Account manager review pipeline for approved QA reports">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                  {["Client", "Report", "Assigned AM", "Review Status", "AM Notes", "Due Date", "Next Action"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {amReviewData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>{row.client}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.report}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.am}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={amStatusVariant[row.status] ?? "neutral"} label={row.status} size="sm"/></td>
                    <td className="py-2.5 px-3 text-xs"style={{ color: "var(--rtm-text-muted)"}}>{row.notes || "—"}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.due}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-xs font-medium"style={{ color: "var(--rtm-blue)"}}>{row.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

      {/*  Client Delivery Workflow — wired to live data  */}
      {activeSection === "delivery" && (
        <SectionWrapper title="Client Delivery Workflow" description="Track report delivery, client feedback, and follow-up requirements">
          {reportsLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Client", "Report", "Delivery Method", "Delivery Status", "Actions"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveReports.map((row) => (
                    <tr key={row.reportId} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.clientName}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.reportName}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.deliveryMethod}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={liveDeliveryStatusVariant[row.deliveryStatus] ?? "neutral"} label={row.deliveryStatus} size="sm" /></td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          {(row.deliveryStatus === "Ready To Send" || row.status === "Ready To Send") && (
                            <button
                              onClick={() => void updateReportStatus(row.reportId, { deliveryStatus: "Sent", status: "Sent" })}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                              style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
                            >Mark Sent</button>
                          )}
                          {row.deliveryStatus === "Sent" && (
                            <button
                              onClick={() => void updateReportStatus(row.reportId, { deliveryStatus: "Viewed" })}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                              style={{ color: "#2563EB", background: "#2563EB15", borderColor: "#2563EB40" }}
                            >Mark Viewed</button>
                          )}
                          {(row.deliveryStatus === "Sent" || row.deliveryStatus === "Viewed") && (
                            <button
                              onClick={() => void updateReportStatus(row.reportId, { deliveryStatus: "Follow-up Needed" })}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                              style={{ color: "#D97706", background: "#D9770615", borderColor: "#D9770640" }}
                            >Follow-up Needed</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionWrapper>
      )}

      {/*  Report Template Library  */}
      {activeSection === "templateLibrary"&& (
        <SectionWrapper title="Report Template Library"description="Manage reusable report templates across all departments and service lines">
          <div className="flex justify-end gap-2 mb-4">
            {["Create Template", "Clone Template", "Edit Template", "Archive Template"].map((action) => (
              <button
                key={action}
                className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"style={{ color: "var(--rtm-blue)", background: "var(--rtm-blue-light)", borderColor: "var(--rtm-blue)40"}}
              >
                {action}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                  {["Template Name", "Department Source", "Included Sections", "Frequency", "Owner", "Status", "Last Modified"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {templateLibraryData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>{row.name}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}>{row.dept}</span>
                    </td>
                    <td className="py-2.5 px-3 text-xs max-w-xs"style={{ color: "var(--rtm-text-secondary)"}}>{row.sections}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.freq}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.owner}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={templateStatusVariant[row.status] ?? "neutral"} label={row.status} size="sm"/></td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{row.lastModified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

      {/*  Report Builder  */}
      {activeSection === "reportBuilder"&& (
        <SectionWrapper title="Report Builder"description="Build and configure a new client report from template with custom sections">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>Report Details</h3>
              {[
                { label: "Report Name",       placeholder: "e.g. Apex Roofing — SEO May 2025"},
                { label: "Client",            placeholder: "Select client…"},
                { label: "Reporting Period",  placeholder: "e.g. May 2025"},
                { label: "Template",          placeholder: "Select template…"},
                { label: "Department Sources",placeholder: "SEO, GBP, Paid Ads…"},
                { label: "Report Owner",      placeholder: "Select report owner…"},
                { label: "Assigned AM",       placeholder: "Select account manager…"},
                { label: "Due Date",          placeholder: "Jun 7, 2025"},
              ].map((field) => (
                <div key={field.label} className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>{field.label}</label>
                  <input
                    type="text"placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-lg border text-sm"style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)"}}
                    readOnly
                  />
                </div>
              ))}
            </div>

            {/* Right: Section Selector */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>Report Sections</h3>
              <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>Toggle sections to include in this report</p>
              <div className="space-y-2">
                {builderSections.map((section) => (
                  <button
                    key={section}
                    onClick={() => toggleSection(section)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-all"style={{
                      borderColor: selectedSections.includes(section) ? "var(--rtm-blue)": "var(--rtm-border-light)",
                      background: selectedSections.includes(section) ? "var(--rtm-blue-light)": "var(--rtm-bg-secondary)",
                      color: selectedSections.includes(section) ? "var(--rtm-blue)": "var(--rtm-text-secondary)",
                    }}
                  >
                    <span>{section}</span>
                    <span className="text-lg leading-none">{selectedSections.includes(section) ? "": "+"}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { label: "Save Draft",       color: "#6B7280", bg: "#6B728015"},
                  { label: "Generate Report",  color: "#0F766E", bg: "#0F766E15"},
                  { label: "Preview Report",   color: "#0891B2", bg: "#0891B215"},
                  { label: "Submit For QA",    color: "#16A34A", bg: "#16A34A15"},
                ].map((btn) => (
                  <button
                    key={btn.label}
                    className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"style={{ color: btn.color, background: btn.bg, borderColor: `${btn.color}40` }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>
      )}

      {/*  Reporting Calendar  */}
      {activeSection === "calendar"&& (
        <div className="space-y-4">
          {/* Calendar Summary Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
            {[
              { label: "Upcoming Reports",          value: "8",  color: "#2563EB", bg: "#EFF6FF"},
              { label: "Reports Due This Week",      value: "4",  color: "#D97706", bg: "#FFFBEB"},
              { label: "Reports Due This Month",     value: "11", color: "#7C3AED", bg: "#F5F3FF"},
              { label: "Overdue Reports",            value: "2",  color: "#DC2626", bg: "#FEF2F2"},
              { label: "Sent Reports",               value: "3",  color: "#059669", bg: "#ECFDF5"},
            ].map((card) => (
              <div key={card.label} className="rounded-xl border p-4"style={{ borderColor: "var(--rtm-border-light)", background: card.bg }}>
                <div className="text-2xl font-bold"style={{ color: card.color }}>{card.value}</div>
                <div className="text-xs font-medium mt-1"style={{ color: card.color }}>{card.label}</div>
              </div>
            ))}
          </div>

          <SectionWrapper title="Reporting Calendar"description="View all upcoming, due, overdue, and sent reports by date">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                    {["Date", "Client", "Report Type", "Owner", "Status", "Next Action"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calendarData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium"style={{ color: row.status === "Overdue"? "#DC2626": "var(--rtm-text-primary)"}}>{row.date}</td>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>{row.client}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.type}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.owner}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={calendarStatusVariant[row.status] ?? "neutral"} label={row.status} size="sm"/></td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs font-medium"style={{ color: "var(--rtm-blue)"}}>{row.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        </div>
      )}

      {/*  Scheduled Reporting  */}
      {activeSection === "scheduled"&& (
        <SectionWrapper title="Scheduled Reporting"description="Configure automatic report generation and delivery schedules per client">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                  {["Client", "Report Template", "Frequency", "Send Day", "Assigned AM", "Delivery Method", "Status"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduledData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>{row.client}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.template}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}>{row.freq}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.sendDay}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.am}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.delivery}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={scheduleStatusVariant[row.status] ?? "neutral"} label={row.status} size="sm"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Frequency Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Frequencies:</p>
            {["Weekly", "Bi-weekly", "Monthly", "Quarterly"].map((f) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full border"style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)"}}>{f}</span>
            ))}
            <p className="text-xs font-semibold ml-4"style={{ color: "var(--rtm-text-muted)"}}>Delivery Methods:</p>
            {["Email", "Client Portal", "Manual Send"].map((m) => (
              <span key={m} className="text-xs px-2 py-0.5 rounded-full border"style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)"}}>{m}</span>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/*  Executive Reports  */}
      {activeSection === "executive"&& (
        <div className="space-y-6">
          {/* Portfolio Performance Summary */}
          <SectionWrapper title="Portfolio Performance Summary"description="High-level metrics across all client accounts this period">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {execPortfolioData.map((row, i) => (
                <div key={i} className="rounded-xl border p-4"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)"}}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>{row.metric}</div>
                  <div className="text-2xl font-bold"style={{ color: row.status === "Healthy"? "#059669": "#D97706"}}>{row.value}</div>
                  <div className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>{row.trend}</div>
                  <StatusBadge variant={row.status === "Healthy"? "success": "warning"} label={row.status} size="sm"/>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* Client Health Summary */}
          <SectionWrapper title="Client Health Summary"description="Health, revenue, and renewal status across the client portfolio">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                    {["Client", "Health", "MRR", "Renewal Date", "Upsell Opportunity", "Account Manager"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {execClientHealthData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>{row.client}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={execHealthVariant[row.health] ?? "neutral"} label={row.health} size="sm"/></td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-semibold"style={{ color: "#059669"}}>{row.revenue}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.renewalDate}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {row.upsell !== "None"? <span className="text-xs font-semibold px-2 py-0.5 rounded-full"style={{ background: "#EFF6FF", color: "#2563EB"}}>{row.upsell}</span>
                          : <span style={{ color: "var(--rtm-text-muted)"}}>—</span>
                        }
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.am}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionWrapper>

          {/* Revenue / Billing Snapshot */}
          <SectionWrapper title="Revenue / Billing Snapshot"description="Monthly revenue and billing health across all accounts">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Total MRR",          value: "$35,200", trend: "+$2,100 MoM", color: "#059669", bg: "#ECFDF5"},
                { label: "Invoices Sent",       value: "47",      trend: "All clients", color: "#2563EB", bg: "#EFF6FF"},
                { label: "Invoices Overdue",    value: "3",       trend: "-1 MoM",      color: "#DC2626", bg: "#FEF2F2"},
                { label: "Renewal This Month",  value: "2",       trend: "Jun 2025",    color: "#D97706", bg: "#FFFBEB"},
              ].map((card) => (
                <div key={card.label} className="rounded-xl border p-4"style={{ borderColor: "var(--rtm-border-light)", background: card.bg }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1"style={{ color: card.color }}>{card.label}</div>
                  <div className="text-2xl font-bold"style={{ color: card.color }}>{card.value}</div>
                  <div className="text-xs mt-1"style={{ color: card.color }}>{card.trend}</div>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* Task Completion Summary */}
          <SectionWrapper title="Task Completion Summary"description="Cross-department task delivery metrics for the period">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Tasks Completed",   value: "142", trend: "+18 MoM",   color: "#059669"},
                { label: "Tasks Open",         value: "67",  trend: "-5 MoM",    color: "#2563EB"},
                { label: "Tasks Overdue",      value: "11",  trend: "+2 MoM",    color: "#DC2626"},
                { label: "Completion Rate",    value: "88%", trend: "+3% MoM",   color: "#7C3AED"},
              ].map((card) => (
                <div key={card.label} className="rounded-xl border p-4"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)"}}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>{card.label}</div>
                  <div className="text-2xl font-bold"style={{ color: card.color }}>{card.value}</div>
                  <div className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>{card.trend}</div>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* Department Performance Summary */}
          <SectionWrapper title="Department Performance Summary"description="Report delivery and on-time rates by department for the period">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                    {["Department", "Reports Delivered", "On-Time Rate", "Avg Delay", "Input Completion", "Status"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { dept: "SEO",              delivered: 12, onTime: "92%", delay: "0.8d", input: "95%", status: "Healthy"},
                    { dept: "Paid Advertising", delivered: 10, onTime: "90%", delay: "1.1d", input: "90%", status: "Healthy"},
                    { dept: "GBP",              delivered: 9,  onTime: "78%", delay: "2.1d", input: "80%", status: "Warning"},
                    { dept: "Meta Ads",         delivered: 8,  onTime: "88%", delay: "1.3d", input: "88%", status: "Healthy"},
                    { dept: "Google Ads",       delivered: 8,  onTime: "87%", delay: "1.4d", input: "85%", status: "Healthy"},
                    { dept: "LSA",              delivered: 7,  onTime: "71%", delay: "2.8d", input: "72%", status: "Warning"},
                    { dept: "Yelp",             delivered: 6,  onTime: "83%", delay: "1.7d", input: "83%", status: "Healthy"},
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>{row.dept}</td>
                      <td className="py-2.5 px-3 text-center font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{row.delivered}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-semibold"style={{ color: "#059669"}}>{row.onTime}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.delay}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.input}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={execHealthVariant[row.status] ?? "neutral"} label={row.status} size="sm"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionWrapper>

          {/* Renewal / Upsell Summary */}
          <SectionWrapper title="Renewal / Upsell Summary"description="Upcoming renewals and active upsell opportunities by account manager">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                    {["Client", "AM", "Renewal Date", "MRR", "Upsell Opportunity", "Action"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {execClientHealthData.filter((r) => r.upsell !== "None"|| r.renewalDate.includes("2025")).slice(0, 5).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>{row.client}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.am}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium"style={{ color: row.renewalDate === "Jun 2025"? "#DC2626": "var(--rtm-text-secondary)"}}>{row.renewalDate}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-semibold"style={{ color: "#059669"}}>{row.revenue}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {row.upsell !== "None"? <span className="text-xs font-semibold px-2 py-0.5 rounded-full"style={{ background: "#EFF6FF", color: "#2563EB"}}>{row.upsell}</span>
                          : <span style={{ color: "var(--rtm-text-muted)"}}>—</span>
                        }
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs font-medium"style={{ color: "var(--rtm-blue)"}}>
                        {row.upsell !== "None"? "Schedule upsell call": "Send renewal reminder"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        </div>
      )}

      {/*  Report Automation Rules  */}
      {activeSection === "automation"&& (
        <SectionWrapper title="Report Automation Rules"description="Automated triggers and actions that drive the report production workflow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                  {["Rule", "Trigger", "Action", "Status"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {automationRules.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>{row.rule}</td>
                    <td className="py-2.5 px-3 text-xs max-w-xs"style={{ color: "var(--rtm-text-secondary)"}}>{row.trigger}</td>
                    <td className="py-2.5 px-3 text-xs max-w-xs"style={{ color: "var(--rtm-text-secondary)"}}>{row.action}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={autoRuleStatusVariant[row.status] ?? "neutral"} label={row.status} size="sm"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

      {/*  Reporting Health Dashboard  */}
      {activeSection === "health"&& (
        <div className="space-y-6">
          {/* Health Metric Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {healthMetrics.map((metric, i) => (
              <div key={i} className="rounded-xl border p-5"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)"}}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}>{metric.metric}</div>
                <div className="text-3xl font-bold mb-1"style={{ color: metric.color }}>{metric.value}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>Target: {metric.target}</span>
                  <span className="text-xs font-semibold"style={{ color: metric.trend === "up"? "#059669": "#DC2626"}}>
                    {metric.trend === "up"? "↑": "↓"} {metric.trend === "up"? "Improving": "Declining"}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 rounded-full"style={{ background: "var(--rtm-border-light)"}}>
                  <div
                    className="h-full rounded-full transition-all"style={{
                      width: metric.value.includes("%") ? metric.value : "70%",
                      background: metric.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Health Summary Table */}
          <SectionWrapper title="Reporting Health Detail"description="Detailed breakdown of reporting performance indicators">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                    {["Metric", "Current Value", "Target", "Trend", "Health"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {healthMetrics.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                      <td className="py-2.5 px-3 font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{row.metric}</td>
                      <td className="py-2.5 px-3 font-bold"style={{ color: row.color }}>{row.value}</td>
                      <td className="py-2.5 px-3"style={{ color: "var(--rtm-text-secondary)"}}>{row.target}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs font-semibold"style={{ color: row.trend === "up"? "#059669": "#DC2626"}}>
                          {row.trend === "up"? "↑ Improving": "↓ Declining"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge variant={row.trend === "up"? "success": "warning"} label={row.trend === "up"? "On Track": "Needs Attention"} size="sm"/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        </div>
      )}
    </div>
  );
}
