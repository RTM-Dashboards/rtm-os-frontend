"use client";

import { useState, useEffect } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { useDateRangeFilter } from "@/lib/reporting/useDateRangeFilter";
import { DateRangeFilter } from "@/components/reporting/DateRangeFilter";
import {
  useReports,
  reportStatusVariant as liveReportStatusVariant,
  qaStatusVariant as liveQaStatusVariant,
  amStatusVariant as liveAmStatusVariant,
  deliveryStatusVariant as liveDeliveryStatusVariant,
} from "@/lib/reporting/useReports";
import {
  useReportInputs,
  inputStatusVariant as liveInputStatusVariant,
} from "@/lib/reporting/useReportInputs";
import {
  useReportTemplates,
  templateStatusVariant as liveTemplateStatusVariant,
  type ReportTemplate,
  type TemplateFormData,
} from "@/lib/reporting/useReportTemplates";
import {
  useReportSchedules,
  scheduleStatusVariant as liveScheduleStatusVariant,
  computeNextDueDate,
  formatNextDueDate,
  sendDayLabel,
  type ReportSchedule,
  type ScheduleFormData,
  type ScheduleFrequency,
  type ScheduleDeliveryMethod,
} from "@/lib/reporting/useReportSchedules";
import {
  useReportAutomationRules,
  ruleStatusVariant as liveRuleStatusVariant,
} from "@/lib/reporting/useReportAutomationRules";
import { REPRESENTATIVE_TOTAL_MRR, REPRESENTATIVE_TOTAL_MRR_TREND } from "@/lib/reporting/mock-mrr";

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

// Department Inputs data is now real — loaded from /api/report-inputs via useReportInputs hook

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

// AM Review mock data removed — Tab 4 now uses live useReports data
// (same source as the /reporting/am-review sub-page)

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

// Template Library data is now real — loaded from /api/report-templates via useReportTemplates hook

//  Report Builder — section list 
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

// Report Builder — empty form state
const emptyBuilderForm = {
  reportName: "",
  clientId: "",
  clientName: "",
  period: "",
  templateId: "",
  templateName: "",
  deptSources: "",
  owner: "",
  assignedAM: "",
  dueDate: "",
};

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

// Scheduled Reporting data now loaded from /api/report-schedules via useReportSchedules hook

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

// Automation rules data is now real — loaded from /api/report-automation-rules via useReportAutomationRules hook

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

  // ── Shared date-range filter ────────────────────────────────────────────────
  // One filter instance for the entire main dashboard — applies to all real,
  // timestamped tabs simultaneously (Queue, Dept Inputs, QA, AM Review,
  // Delivery, Scheduled Reporting, Automation summary).
  const dashboardDateFilter = useDateRangeFilter();

  // ── Report Builder (Tab 7) — real interactive state ───────────────────────
  const [builderForm, setBuilderForm] = useState(emptyBuilderForm);
  const [builderSaving, setBuilderSaving] = useState(false);
  const [builderSaved, setBuilderSaved] = useState<string | null>(null); // reportId after save

  async function handleBuilderSaveDraft() {
    if (!builderForm.clientId || !builderForm.reportName.trim()) return;
    setBuilderSaving(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: builderForm.clientId,
          clientName: builderForm.clientName,
          reportName: builderForm.reportName,
          reportType: builderForm.templateName || "Client Report",
          period: builderForm.period,
          ownerId: builderForm.owner,
          amId: builderForm.assignedAM,
          dueDate: builderForm.dueDate,
          deliveryMethod: "Email",
          status: "Draft",
          qaStatus: "Pending QA",
          deptReviewStatus: "Pending Assignment",
          amStatus: "Pending AM Review",
          deliveryStatus: "Not Ready",
          progressPct: 0,
          draftReady: false,
          aiStatus: "Pending",
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { record: { reportId: string } };
        setBuilderSaved(data.record.reportId);
        // Reset form after save
        setBuilderForm(emptyBuilderForm);
        setSelectedSections(builderSections);
      }
    } finally {
      setBuilderSaving(false);
    }
  }
  const { records: liveReports, loading: reportsLoading, updateReportStatus } = useReports();

  // ── Department Inputs Center (Tab 2) — real data ──────────────────────────
  const { inputs: liveInputs, loading: inputsLoading, markReceived } = useReportInputs();

  // ── Template Library (Tab 6) — real data ──────────────────────────────────
  const {
    templates: liveTemplates,
    loading: templatesLoading,
    createTemplate,
    updateTemplate,
    archiveTemplate,
    cloneTemplate,
  } = useReportTemplates();

  // Template CRUD modal state
  type TemplateModal =
    | { mode: "none" }
    | { mode: "create" }
    | { mode: "edit"; template: ReportTemplate }
    | { mode: "clone"; template: ReportTemplate }
    | { mode: "archive"; template: ReportTemplate };
  const [templateModal, setTemplateModal] = useState<TemplateModal>({ mode: "none" });

  // Shared template form state (create + edit)
  const emptyForm: TemplateFormData = {
    name: "",
    version: "v1.0",
    department: "SEO",
    sections: [],
    dataConnections: [],
    frequency: "Monthly",
    owner: "",
    status: "Draft",
    description: "",
  };
  const [templateForm, setTemplateForm] = useState<TemplateFormData>(emptyForm);
  const [templateSaving, setTemplateSaving] = useState(false);

  function openCreateModal() {
    setTemplateForm(emptyForm);
    setTemplateModal({ mode: "create" });
  }
  function openEditModal(tmpl: ReportTemplate) {
    setTemplateForm({
      name: tmpl.name,
      version: tmpl.version,
      department: tmpl.department,
      sections: [...tmpl.sections],
      dataConnections: [...tmpl.dataConnections],
      frequency: tmpl.frequency,
      owner: tmpl.owner,
      status: tmpl.status,
      description: tmpl.description,
    });
    setTemplateModal({ mode: "edit", template: tmpl });
  }
  function closeTemplateModal() {
    setTemplateModal({ mode: "none" });
    setTemplateForm(emptyForm);
  }

  async function handleTemplateSave() {
    if (!templateForm.name.trim()) return;
    setTemplateSaving(true);
    try {
      if (templateModal.mode === "create") {
        await createTemplate(templateForm);
      } else if (templateModal.mode === "edit") {
        await updateTemplate(templateModal.template.templateId, templateForm);
      }
      closeTemplateModal();
    } finally {
      setTemplateSaving(false);
    }
  }

  async function handleClone(tmpl: ReportTemplate) {
    await cloneTemplate(tmpl.templateId);
  }

  async function handleArchive(tmpl: ReportTemplate) {
    setTemplateModal({ mode: "none" });
    await archiveTemplate(tmpl.templateId);
  }

  // ── Scheduled Reporting (Tab 9) — real data ───────────────────────────────
  const {
    schedules: liveSchedules,
    loading: schedulesLoading,
    createSchedule,
    updateSchedule,
    toggleStatus: toggleScheduleStatus,
    removeSchedule,
  } = useReportSchedules();

  // ── Automation Rules (Tab 11) — real data ──────────────────────────────────
  const {
    rules: liveAutomationRules,
    loading: rulesLoading,
  } = useReportAutomationRules();

  // Lightweight client list for schedule form dropdowns
  const [liveClientsForSchedule, setLiveClientsForSchedule] = useState<
    { id: string; clientName: string }[]
  >([]);
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/master-clients", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          clients: { id: string; clientName: string; currentStatus?: string }[];
        };
        setLiveClientsForSchedule(
          data.clients
            .filter((c) => c.currentStatus !== "Inactive")
            .map((c) => ({ id: c.id, clientName: c.clientName }))
        );
      } catch {
        // fallback: leave empty
      }
    })();
  }, []);

  type ScheduleModal =
    | { mode: "none" }
    | { mode: "create" }
    | { mode: "edit"; schedule: ReportSchedule }
    | { mode: "delete"; schedule: ReportSchedule };
  const [scheduleModal, setScheduleModal] = useState<ScheduleModal>({ mode: "none" });

  const emptyScheduleForm: ScheduleFormData = {
    clientId: "",
    clientName: "",
    templateId: "",
    templateName: "",
    frequency: "Monthly",
    sendDay: "1",
    deliveryMethod: "Email",
    assignedAM: "",
    status: "Active",
    notes: "",
  };
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>(emptyScheduleForm);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  function openScheduleCreateModal() {
    setScheduleForm(emptyScheduleForm);
    setScheduleModal({ mode: "create" });
  }
  function openScheduleEditModal(sched: ReportSchedule) {
    setScheduleForm({
      clientId: sched.clientId,
      clientName: sched.clientName,
      templateId: sched.templateId,
      templateName: sched.templateName,
      frequency: sched.frequency,
      sendDay: sched.sendDay,
      deliveryMethod: sched.deliveryMethod,
      assignedAM: sched.assignedAM,
      status: sched.status,
      notes: sched.notes,
    });
    setScheduleModal({ mode: "edit", schedule: sched });
  }
  function closeScheduleModal() {
    setScheduleModal({ mode: "none" });
    setScheduleForm(emptyScheduleForm);
  }

  async function handleScheduleSave() {
    if (!scheduleForm.clientId.trim() || !scheduleForm.templateId.trim()) return;
    setScheduleSaving(true);
    try {
      if (scheduleModal.mode === "create") {
        await createSchedule(scheduleForm);
      } else if (scheduleModal.mode === "edit") {
        await updateSchedule(scheduleModal.schedule.scheduleId, scheduleForm);
      }
      closeScheduleModal();
    } finally {
      setScheduleSaving(false);
    }
  }

  async function handleScheduleDelete(sched: ReportSchedule) {
    setScheduleModal({ mode: "none" });
    await removeSchedule(sched.scheduleId);
  }

  const toggleSection = (s: string) => {
    setSelectedSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  // ── Date-filtered derived datasets ─────────────────────────────────────────
  // These are purely additive — they never fabricate or alter records, only
  // narrow which real records are displayed based on the shared date filter.
  const filteredReports  = liveReports.filter((r) => dashboardDateFilter.filterByDate(r.createdAt));
  const filteredInputs   = liveInputs.filter((inp) => dashboardDateFilter.filterByDate(inp.createdAt));
  const filteredSchedules = liveSchedules.filter((s) => dashboardDateFilter.filterByDate(s.createdAt));
  const filteredRules    = liveAutomationRules.filter((r) => dashboardDateFilter.filterByDate(r.createdAt));

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

      {/*  Shared Date-Range Filter — applies to all real-data tabs at once  */}
      <DateRangeFilter
        dateRange={dashboardDateFilter.dateRange}
        setDateRange={dashboardDateFilter.setDateRange}
        customStart={dashboardDateFilter.customStart}
        setCustomStart={dashboardDateFilter.setCustomStart}
        customEnd={dashboardDateFilter.customEnd}
        setCustomEnd={dashboardDateFilter.setCustomEnd}
      />

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
                  {filteredReports.map((row) => {
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

      {/*  Department Inputs Center — wired to real data  */}
      {activeSection === "deptInputs" && (
        <SectionWrapper title="Department Inputs Center" description="Track required data inputs from all departments for active reports">
          {inputsLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading inputs…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1100px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Client", "Linked Report", "Department", "Input Needed", "Owner", "Due Date", "Status", "Blocker", "Notes", "Action"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInputs.map((row) => {
                    const linkedReport = liveReports.find((r) => r.reportId === row.reportId);
                    return (
                      <tr key={row.inputId} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                        <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.clientName}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                          {linkedReport ? linkedReport.reportName : row.reportId}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>{row.department}</span>
                        </td>
                        <td className="py-2.5 px-3" style={{ color: "var(--rtm-text-secondary)" }}>{row.inputNeeded}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.owner}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium" style={{ color: row.status === "Overdue" ? "#DC2626" : "var(--rtm-text-secondary)" }}>{row.dueDate}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={liveInputStatusVariant[row.status] ?? "neutral"} label={row.status} size="sm" /></td>
                        <td className="py-2.5 px-3 text-xs" style={{ color: row.blocker ? "#DC2626" : "var(--rtm-text-muted)" }}>{row.blocker || "—"}</td>
                        <td className="py-2.5 px-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>{row.notes || "—"}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {row.status !== "Received" ? (
                            <button
                              onClick={() => void markReceived(row.inputId)}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                              style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
                            >
                              Mark Received
                            </button>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                              {row.receivedAt ? `Received ${new Date(row.receivedAt).toLocaleDateString()}` : "Received"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
                  {filteredReports.map((row) => (
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

      {/*  AM Review Workflow — live data, same source as /reporting/am-review sub-page  */}
      {activeSection === "amReview" && (
        <SectionWrapper
          title="AM Review Workflow"
          description="Account manager review pipeline — live data, same source as the AM Review sub-page"
        >
          {/* Link to full AM Review sub-page */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Showing {reportsLoading ? "…" : filteredReports.length}{filteredReports.length !== liveReports.length ? ` of ${liveReports.length}` : ""} reports. For filters, per-AM summary, and delivery scheduling, use the full AM Review page.
            </p>
            <a
              href="/reporting/am-review"
              className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
              style={{ color: "#6D28D9", background: "#6D28D915", borderColor: "#6D28D940", textDecoration: "none" }}
            >
              → Full AM Review
            </a>
          </div>

          {reportsLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Client", "Report", "Assigned AM", "Review Status", "Delivery Status", "Due Date", "Actions"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((row) => (
                    <tr key={row.reportId} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.clientName}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.reportName}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.amId}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge variant={liveAmStatusVariant[row.amStatus] ?? "neutral"} label={row.amStatus} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge variant={liveDeliveryStatusVariant[row.deliveryStatus] ?? "neutral"} label={row.deliveryStatus} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.dueDate}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          {row.amStatus !== "Approved By AM" && (
                            <button
                              onClick={() =>
                                void updateReportStatus(row.reportId, {
                                  amStatus: "Approved By AM",
                                  deliveryStatus: "Ready To Send",
                                  status: "Ready To Send",
                                })
                              }
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                              style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
                            >AM Approve</button>
                          )}
                          {row.amStatus !== "Revision Requested" && (
                            <button
                              onClick={() =>
                                void updateReportStatus(row.reportId, {
                                  amStatus: "Revision Requested",
                                  status: "Needs Revision",
                                })
                              }
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
                  {filteredReports.map((row) => (
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

      {/*  Report Template Library — wired to real data  */}
      {activeSection === "templateLibrary" && (
        <SectionWrapper title="Report Template Library" description="Manage reusable report templates across all departments and service lines">

          {/* Template CRUD modal (Create / Edit) */}
          {(templateModal.mode === "create" || templateModal.mode === "edit") && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.45)" }}
              onClick={(e) => { if (e.target === e.currentTarget) closeTemplateModal(); }}
            >
              <div className="rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-4" style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                    {templateModal.mode === "create" ? "Create Template" : "Edit Template"}
                  </h2>
                  <button onClick={closeTemplateModal} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Template Name", key: "name" as const, placeholder: "e.g. SEO Monthly Report" },
                    { label: "Version", key: "version" as const, placeholder: "e.g. v1.0" },
                    { label: "Owner", key: "owner" as const, placeholder: "e.g. Jake T." },
                    { label: "Description", key: "description" as const, placeholder: "Brief description of this template" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{field.label}</label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={templateForm[field.key] as string}
                        onChange={(e) => setTemplateForm((f) => ({ ...f, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Department</label>
                      <select
                        value={templateForm.department}
                        onChange={(e) => setTemplateForm((f) => ({ ...f, department: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                      >
                        {["SEO", "GBP", "Yelp", "Paid Advertising", "Meta Ads", "Google Ads", "LSA", "Content", "Web Development", "Multi"].map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Frequency</label>
                      <select
                        value={templateForm.frequency}
                        onChange={(e) => setTemplateForm((f) => ({ ...f, frequency: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                      >
                        {["Weekly", "Monthly", "Quarterly", "Annual", "On Demand"].map((f) => (
                          <option key={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Status</label>
                    <select
                      value={templateForm.status}
                      onChange={(e) => setTemplateForm((f) => ({ ...f, status: e.target.value as "Active" | "Draft" | "Archived" }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                    >
                      {["Draft", "Active", "Archived"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Sections (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Executive Summary, KPI Summary, Recommendations"
                      value={templateForm.sections.join(", ")}
                      onChange={(e) =>
                        setTemplateForm((f) => ({
                          ...f,
                          sections: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Data Connections (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. GA4, GSC, AgencyAnalytics"
                      value={templateForm.dataConnections.join(", ")}
                      onChange={(e) =>
                        setTemplateForm((f) => ({
                          ...f,
                          dataConnections: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={closeTemplateModal}
                    className="text-xs font-semibold px-4 py-2 rounded-lg border"
                    style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "transparent" }}
                  >Cancel</button>
                  <button
                    onClick={() => void handleTemplateSave()}
                    disabled={templateSaving || !templateForm.name.trim()}
                    className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
                  >
                    {templateSaving ? "Saving…" : templateModal.mode === "create" ? "Create Template" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Archive confirmation modal */}
          {templateModal.mode === "archive" && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.45)" }}
              onClick={(e) => { if (e.target === e.currentTarget) closeTemplateModal(); }}
            >
              <div className="rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4" style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}>
                <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Archive Template?</h2>
                <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                  “{templateModal.template.name}” will be archived and hidden from active use. You can restore it later.
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={closeTemplateModal} className="text-xs font-semibold px-4 py-2 rounded-lg border" style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "transparent" }}>Cancel</button>
                  <button
                    onClick={() => void handleArchive(templateModal.template)}
                    className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
                    style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}
                  >Archive Template</button>
                </div>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              {templatesLoading ? "Loading…" : `${liveTemplates.filter((t) => t.status !== "Archived").length} active templates`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={openCreateModal}
                className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
                style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
              >+ Create Template</button>
            </div>
          </div>

          {templatesLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading templates…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1200px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Template Name", "Dept", "Version", "Sections", "Connections", "Frequency", "Owner", "Status", "Uses", "Updated", "Actions"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveTemplates.map((tmpl) => (
                    <tr key={tmpl.templateId} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{tmpl.name}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>{tmpl.department}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs font-mono" style={{ color: "var(--rtm-text-muted)" }}>{tmpl.version}</td>
                      <td className="py-2.5 px-3 text-xs max-w-[180px] truncate" style={{ color: "var(--rtm-text-secondary)" }} title={tmpl.sections.join(", ")}>
                        {tmpl.sections.join(", ") || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-xs max-w-[140px] truncate" style={{ color: "var(--rtm-text-secondary)" }} title={tmpl.dataConnections.join(", ")}>
                        {tmpl.dataConnections.join(", ") || "—"}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{tmpl.frequency}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{tmpl.owner}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={liveTemplateStatusVariant[tmpl.status] ?? "neutral"} label={tmpl.status} size="sm" /></td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{tmpl.usageCount}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                        {new Date(tmpl.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEditModal(tmpl)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                            style={{ color: "var(--rtm-blue)", background: "var(--rtm-blue-light)", borderColor: "var(--rtm-blue)40" }}
                          >Edit</button>
                          <button
                            onClick={() => void handleClone(tmpl)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                            style={{ color: "#7C3AED", background: "#7C3AED15", borderColor: "#7C3AED40" }}
                          >Clone</button>
                          {tmpl.status !== "Archived" && (
                            <button
                              onClick={() => setTemplateModal({ mode: "archive", template: tmpl })}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                              style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}
                            >Archive</button>
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

      {/*  Report Builder — Tab 7, genuinely interactive  */}
      {activeSection === "reportBuilder" && (
        <SectionWrapper title="Report Builder" description="Build and configure a new client report — fill the form and Save Draft to create a real record in the Report Queue">

          {/* Success banner after Save Draft */}
          {builderSaved && (
            <div className="flex items-center gap-3 mb-4 rounded-xl border px-4 py-3" style={{ background: "#ECFDF5", borderColor: "#05966940" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#059669" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="text-xs font-bold" style={{ color: "#065F46" }}>Draft saved!</span>
                <span className="text-xs ml-1" style={{ color: "#065F46" }}>Report record created (ID: {builderSaved}) — visible in Report Queue above.</span>
              </div>
              <button onClick={() => setBuilderSaved(null)} className="ml-auto text-xs" style={{ color: "#065F46" }}>×</button>
            </div>
          )}

          {/* AI pipeline honest notice */}
          <div className="flex items-start gap-3 mb-4 rounded-xl border px-4 py-3" style={{ background: "#F0F9FF", borderColor: "#0369A140" }}>
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#0369A1" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs" style={{ color: "#0C4A6E" }}>
              <strong>Save Draft</strong> creates a real report record in the Report Queue. <strong>Generate Report</strong> and <strong>Preview Report</strong> require the AI pipeline — available when AI credentials are configured.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form Fields — all genuinely interactive */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>Report Details</h3>

              {/* Report Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Report Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Roofing — SEO May 2025"
                  value={builderForm.reportName}
                  onChange={(e) => setBuilderForm((f) => ({ ...f, reportName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Client — real dropdown from MASTER_CLIENTS */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Client</label>
                <select
                  value={builderForm.clientId}
                  onChange={(e) => {
                    const sel = e.target;
                    const opt = sel.options[sel.selectedIndex];
                    setBuilderForm((f) => ({ ...f, clientId: sel.value, clientName: opt.text }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                >
                  <option value="">Select client…</option>
                  {liveClientsForSchedule.map((c) => (
                    <option key={c.id} value={c.id}>{c.clientName}</option>
                  ))}
                </select>
              </div>

              {/* Reporting Period */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Reporting Period</label>
                <input
                  type="text"
                  placeholder="e.g. May 2025"
                  value={builderForm.period}
                  onChange={(e) => setBuilderForm((f) => ({ ...f, period: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Template — real dropdown from report-templates */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Template</label>
                <select
                  value={builderForm.templateId}
                  onChange={(e) => {
                    const sel = e.target;
                    const opt = sel.options[sel.selectedIndex];
                    setBuilderForm((f) => ({ ...f, templateId: sel.value, templateName: opt.text }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                >
                  <option value="">Select template…</option>
                  {liveTemplates
                    .filter((t) => t.status !== "Archived")
                    .map((t) => (
                      <option key={t.templateId} value={t.templateId}>{t.name}</option>
                    ))}
                </select>
              </div>

              {/* Department Sources */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Department Sources</label>
                <input
                  type="text"
                  placeholder="SEO, GBP, Paid Ads…"
                  value={builderForm.deptSources}
                  onChange={(e) => setBuilderForm((f) => ({ ...f, deptSources: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Report Owner */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Report Owner</label>
                <input
                  type="text"
                  placeholder="e.g. Jake T."
                  value={builderForm.owner}
                  onChange={(e) => setBuilderForm((f) => ({ ...f, owner: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Assigned AM */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Assigned AM</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah M."
                  value={builderForm.assignedAM}
                  onChange={(e) => setBuilderForm((f) => ({ ...f, assignedAM: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Due Date</label>
                <input
                  type="text"
                  placeholder="e.g. Jun 7, 2025"
                  value={builderForm.dueDate}
                  onChange={(e) => setBuilderForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>
            </div>

            {/* Right: Section Selector + Actions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>Report Sections</h3>
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Toggle sections to include in this report</p>
              <div className="space-y-2">
                {builderSections.map((section) => (
                  <button
                    key={section}
                    onClick={() => toggleSection(section)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-all"
                    style={{
                      borderColor: selectedSections.includes(section) ? "var(--rtm-blue)" : "var(--rtm-border-light)",
                      background: selectedSections.includes(section) ? "var(--rtm-blue-light)" : "var(--rtm-bg-secondary)",
                      color: selectedSections.includes(section) ? "var(--rtm-blue)" : "var(--rtm-text-secondary)",
                    }}
                  >
                    <span>{section}</span>
                    <span className="text-lg leading-none">{selectedSections.includes(section) ? "" : "+"}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {/* Save Draft — real: POST to /api/reports with status Draft */}
                <button
                  onClick={() => void handleBuilderSaveDraft()}
                  disabled={builderSaving || !builderForm.clientId || !builderForm.reportName.trim()}
                  className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: "#6B7280", background: "#6B728015", borderColor: "#6B728040" }}
                  title={!builderForm.clientId || !builderForm.reportName.trim() ? "Enter a report name and select a client first" : ""}
                >
                  {builderSaving ? "Saving…" : "Save Draft"}
                </button>

                {/* Generate Report — requires AI pipeline */}
                <button
                  disabled
                  className="text-xs font-semibold px-4 py-2 rounded-lg border opacity-40 cursor-not-allowed"
                  style={{ color: "#0F766E", background: "#0F766E15", borderColor: "#0F766E40" }}
                  title="Coming when AI pipeline is configured — requires AI/LLM credentials"
                >
                  Generate Report
                </button>

                {/* Preview Report — requires AI pipeline */}
                <button
                  disabled
                  className="text-xs font-semibold px-4 py-2 rounded-lg border opacity-40 cursor-not-allowed"
                  style={{ color: "#0891B2", background: "#0891B215", borderColor: "#0891B240" }}
                  title="Coming when AI pipeline is configured — requires AI/LLM credentials"
                >
                  Preview Report
                </button>

                {/* Submit For QA — only available after Save Draft */}
                <button
                  disabled={!builderSaved}
                  className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: "#16A34A", background: "#16A34A15", borderColor: "#16A34A40" }}
                  title={!builderSaved ? "Save Draft first, then submit for QA" : ""}
                >
                  Submit For QA
                </button>
              </div>
            </div>
          </div>
        </SectionWrapper>
      )}

      {/*  Reporting Calendar — Tab 8  */}
      {activeSection === "calendar" && (
        <div className="space-y-4">
          {/* Upcoming from real schedules */}
          {(() => {
            const activeSchedules = liveSchedules.filter((s) => s.status === "Active");
            const today = new Date();
            const thirtyDaysOut = new Date(today);
            thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);
            const upcoming = activeSchedules
              .map((s) => ({
                sched: s,
                nextDue: computeNextDueDate(s),
              }))
              .filter(({ nextDue }) => nextDue <= thirtyDaysOut)
              .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime());

            const dueThisWeek = upcoming.filter(({ nextDue }) => {
              const diff = Math.ceil((nextDue.getTime() - today.getTime()) / 86400000);
              return diff <= 7;
            });

            return (
              <>
                {/* Summary cards derived from real schedule data */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { label: "Active Schedules",       value: String(activeSchedules.length),    color: "#2563EB", bg: "#EFF6FF" },
                    { label: "Due Within 7 Days",       value: String(dueThisWeek.length),         color: "#D97706", bg: "#FFFBEB" },
                    { label: "Due Within 30 Days",      value: String(upcoming.length),            color: "#7C3AED", bg: "#F5F3FF" },
                    { label: "Paused Schedules",        value: String(liveSchedules.filter((s) => s.status === "Paused").length), color: "#6B7280", bg: "#F9FAFB" },
                  ].map((card) => (
                    <div key={card.label} className="rounded-xl border p-4" style={{ borderColor: "var(--rtm-border-light)", background: card.bg }}>
                      <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
                      <div className="text-xs font-medium mt-1" style={{ color: card.color }}>{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Upcoming schedule-derived dates — real data */}
                {upcoming.length > 0 && (
                  <SectionWrapper
                    title="Upcoming Report Dates (from Schedules)"
                    description="Next due dates derived from active schedule configurations — reflects real schedule data"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[800px]">
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                            {["Next Due Date", "Client", "Report Template", "Frequency", "Delivery", "Assigned AM"].map((h) => (
                              <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {upcoming.map(({ sched, nextDue }) => {
                            const diff = Math.ceil((nextDue.getTime() - today.getTime()) / 86400000);
                            const isUrgent = diff <= 3;
                            const isSoon = diff <= 7;
                            return (
                              <tr key={sched.scheduleId} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                                <td className="py-2.5 px-3 whitespace-nowrap font-medium" style={{ color: isUrgent ? "#DC2626" : isSoon ? "#D97706" : "var(--rtm-text-primary)" }}>
                                  {formatNextDueDate(nextDue)}
                                  {isUrgent && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626" }}>Urgent</span>}
                                  {!isUrgent && isSoon && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#FFFBEB", color: "#D97706" }}>Soon</span>}
                                </td>
                                <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{sched.clientName}</td>
                                <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{sched.templateName}</td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>{sched.frequency}</span>
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{sched.deliveryMethod}</td>
                                <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{sched.assignedAM || "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </SectionWrapper>
                )}
              </>
            );
          })()}

          {/* Legacy active-report-instances calendar — mock data, still useful */}
          <SectionWrapper title="Active Report Instances" description="Current report queue instances by due date (from Report Queue)">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Date", "Client", "Report Type", "Owner", "Status", "Next Action"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calendarData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium" style={{ color: row.status === "Overdue" ? "#DC2626" : "var(--rtm-text-primary)" }}>{row.date}</td>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.client}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.type}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.owner}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={calendarStatusVariant[row.status] ?? "neutral"} label={row.status} size="sm" /></td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs font-medium" style={{ color: "var(--rtm-blue)" }}>{row.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        </div>
      )}

      {/*  Scheduled Reporting — Tab 9, wired to real data  */}
      {activeSection === "scheduled" && (
        <div className="space-y-4">
          {/* ── Honest note: config only, no auto-triggering yet ───────────── */}
          <div
            className="flex items-start gap-3 rounded-xl border px-4 py-3"
            style={{ background: "#FFFBEB", borderColor: "#D9770640" }}
          >
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#D97706" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <span className="text-xs font-bold" style={{ color: "#92400E" }}>Schedule Configuration Only — No Auto-Triggering Yet</span>
              <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>
                Schedules configured here are real and persisted, but automatic report generation on schedule is
                <strong> not yet implemented</strong>. That capability depends on the Report Generation pipeline
                being complete (planned for Phase 5). Use these schedules to plan and configure delivery cadences;
                reports must still be generated and sent manually for now.
              </p>
            </div>
          </div>

          {/* Schedule Create/Edit Modal */}
          {(scheduleModal.mode === "create" || scheduleModal.mode === "edit") && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.45)" }}
              onClick={(e) => { if (e.target === e.currentTarget) closeScheduleModal(); }}
            >
              <div className="rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-4" style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                    {scheduleModal.mode === "create" ? "Create Schedule" : "Edit Schedule"}
                  </h2>
                  <button onClick={closeScheduleModal} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
                </div>

                <div className="space-y-3">
                  {/* Client selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Client</label>
                    <select
                      value={scheduleForm.clientId}
                      onChange={(e) => {
                        const sel = e.target;
                        const opt = sel.options[sel.selectedIndex];
                        setScheduleForm((f) => ({
                          ...f,
                          clientId: sel.value,
                          clientName: opt.text,
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                    >
                      <option value="">Select a client…</option>
                      {liveClientsForSchedule.map((c) => (
                        <option key={c.id} value={c.id}>{c.clientName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Template selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Report Template</label>
                    <select
                      value={scheduleForm.templateId}
                      onChange={(e) => {
                        const sel = e.target;
                        const opt = sel.options[sel.selectedIndex];
                        setScheduleForm((f) => ({
                          ...f,
                          templateId: sel.value,
                          templateName: opt.text,
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                    >
                      <option value="">Select a template…</option>
                      {liveTemplates
                        .filter((t) => t.status !== "Archived")
                        .map((t) => (
                          <option key={t.templateId} value={t.templateId}>{t.name}</option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Frequency */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Frequency</label>
                      <select
                        value={scheduleForm.frequency}
                        onChange={(e) => setScheduleForm((f) => ({ ...f, frequency: e.target.value as ScheduleFrequency }))}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                      >
                        {(["Weekly", "Bi-weekly", "Monthly", "Quarterly"] as ScheduleFrequency[]).map((f) => (
                          <option key={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {/* Send Day */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
                        {scheduleForm.frequency === "Weekly" || scheduleForm.frequency === "Bi-weekly"
                          ? "Send Weekday"
                          : "Send Day (1–31 or \"last\")"}
                      </label>
                      {scheduleForm.frequency === "Weekly" || scheduleForm.frequency === "Bi-weekly" ? (
                        <select
                          value={scheduleForm.sendDay}
                          onChange={(e) => setScheduleForm((f) => ({ ...f, sendDay: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                          style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                        >
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => (
                            <option key={d}>{d}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder='e.g. 1, 15, last'
                          value={scheduleForm.sendDay}
                          onChange={(e) => setScheduleForm((f) => ({ ...f, sendDay: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                          style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Delivery Method */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Delivery Method</label>
                      <select
                        value={scheduleForm.deliveryMethod}
                        onChange={(e) => setScheduleForm((f) => ({ ...f, deliveryMethod: e.target.value as ScheduleDeliveryMethod }))}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                      >
                        {(["Email", "Client Portal", "Email + Portal", "Manual Send"] as ScheduleDeliveryMethod[]).map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Status</label>
                      <select
                        value={scheduleForm.status}
                        onChange={(e) => setScheduleForm((f) => ({ ...f, status: e.target.value as "Active" | "Paused" }))}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                      >
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                      </select>
                    </div>
                  </div>

                  {/* Assigned AM */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Assigned AM</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah M."
                      value={scheduleForm.assignedAM}
                      onChange={(e) => setScheduleForm((f) => ({ ...f, assignedAM: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Notes (optional)</label>
                    <input
                      type="text"
                      placeholder="Any notes about this schedule…"
                      value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm((f) => ({ ...f, notes: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={closeScheduleModal}
                    className="text-xs font-semibold px-4 py-2 rounded-lg border"
                    style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "transparent" }}
                  >Cancel</button>
                  <button
                    onClick={() => void handleScheduleSave()}
                    disabled={scheduleSaving || !scheduleForm.clientId.trim() || !scheduleForm.templateId.trim()}
                    className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
                  >
                    {scheduleSaving ? "Saving…" : scheduleModal.mode === "create" ? "Create Schedule" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete confirmation modal */}
          {scheduleModal.mode === "delete" && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.45)" }}
              onClick={(e) => { if (e.target === e.currentTarget) closeScheduleModal(); }}
            >
              <div className="rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4" style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}>
                <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Delete Schedule?</h2>
                <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                  The schedule for <strong>{scheduleModal.schedule.clientName}</strong> ({scheduleModal.schedule.templateName}) will be permanently deleted.
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={closeScheduleModal} className="text-xs font-semibold px-4 py-2 rounded-lg border" style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "transparent" }}>Cancel</button>
                  <button
                    onClick={() => void handleScheduleDelete(scheduleModal.schedule)}
                    className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
                    style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}
                  >Delete Schedule</button>
                </div>
              </div>
            </div>
          )}

          <SectionWrapper title="Scheduled Reporting" description="Real schedule configurations per client — create, edit, pause/resume, or delete">
            {/* Action bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                {schedulesLoading
                  ? "Loading…"
                  : `${filteredSchedules.filter((s) => s.status === "Active").length} active / ${filteredSchedules.filter((s) => s.status === "Paused").length} paused${filteredSchedules.length !== liveSchedules.length ? ` (${filteredSchedules.length} of ${liveSchedules.length} total)` : ""}`}
              </div>
              <button
                onClick={openScheduleCreateModal}
                className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
                style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
              >+ Create Schedule</button>
            </div>

            {schedulesLoading ? (
              <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading schedules…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                      {["Client", "Report Template", "Frequency", "Send Day", "Next Due", "Assigned AM", "Delivery", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map((row) => {
                      const nextDue = computeNextDueDate(row);
                      return (
                        <tr key={row.scheduleId} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)", opacity: row.status === "Paused" ? 0.65 : 1 }}>
                          <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.clientName}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.templateName}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>{row.frequency}</span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{sendDayLabel(row.frequency, row.sendDay)}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-medium" style={{ color: row.status === "Paused" ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)" }}>
                            {row.status === "Paused" ? "—" : formatNextDueDate(nextDue)}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.assignedAM || "—"}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.deliveryMethod}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={liveScheduleStatusVariant[row.status] ?? "neutral"} label={row.status} size="sm" /></td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => openScheduleEditModal(row)}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                                style={{ color: "var(--rtm-blue)", background: "var(--rtm-blue-light)", borderColor: "var(--rtm-blue)40" }}
                              >Edit</button>
                              <button
                                onClick={() => void toggleScheduleStatus(row.scheduleId)}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                                style={{
                                  color: row.status === "Active" ? "#D97706" : "#059669",
                                  background: row.status === "Active" ? "#D9770615" : "#05966915",
                                  borderColor: row.status === "Active" ? "#D9770640" : "#05966940",
                                }}
                              >{row.status === "Active" ? "Pause" : "Resume"}</button>
                              <button
                                onClick={() => setScheduleModal({ mode: "delete", schedule: row })}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-90"
                                style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionWrapper>
        </div>
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
          <SectionWrapper title="Revenue / Billing Snapshot" description="Monthly revenue and billing health across all accounts — representative preview data">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Total MRR",          value: REPRESENTATIVE_TOTAL_MRR,       trend: REPRESENTATIVE_TOTAL_MRR_TREND, color: "#059669", bg: "#ECFDF5"},
                { label: "Invoices Sent",       value: "47",                           trend: "All clients",                  color: "#2563EB", bg: "#EFF6FF"},
                { label: "Invoices Overdue",    value: "3",                            trend: "-1 MoM",                       color: "#DC2626", bg: "#FEF2F2"},
                { label: "Renewal This Month",  value: "2",                            trend: "Jun 2025",                     color: "#D97706", bg: "#FFFBEB"},
              ].map((card) => (
                <div key={card.label} className="rounded-xl border p-4" style={{ borderColor: "var(--rtm-border-light)", background: card.bg }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: card.color }}>{card.label}</div>
                  <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
                  <div className="text-xs mt-1" style={{ color: card.color }}>{card.trend}</div>
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

      {/*  Report Automation Rules — Tab 11: live data, canonical UI at /reporting/automation  */}
      {activeSection === "automation" && (
        <SectionWrapper
          title="Report Automation Rules"
          description="Automation rule definitions — same real data as the full Automation Rules page"
        >
          {/* Deferral notice */}
          <div
            className="flex items-start gap-3 rounded-xl border px-4 py-3 mb-4"
            style={{ background: "#FFFBEB", borderColor: "#D9770640" }}
          >
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#D97706" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <span className="text-xs font-bold" style={{ color: "#92400E" }}>Rule Definitions Only — Automatic Event-Driven Execution Not Yet Implemented</span>
              <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>
                Rules below are real and persisted. Automatic triggering when events occur is not yet implemented. Use the full Automation Rules page to Create, Edit, Pause/Resume, Delete, and Run Now.
              </p>
            </div>
          </div>

          {/* Link to canonical sub-page */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Showing {rulesLoading ? "…" : filteredRules.length}{filteredRules.length !== liveAutomationRules.length ? ` of ${liveAutomationRules.length}` : ""} rules ({filteredRules.filter(r => r.category === "Workflow").length} Workflow + {filteredRules.filter(r => r.category === "Scheduled").length} Scheduled). Create, Edit, and Run actions available on the full page.
            </p>
            <a
              href="/reporting/automation"
              className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
              style={{ color: "#7C3AED", background: "#7C3AED15", borderColor: "#7C3AED40", textDecoration: "none" }}
            >
              → Full Automation Rules
            </a>
          </div>

          {rulesLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading rules…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Rule", "Category", "Trigger", "Action", "Status", "Last Run", "Runs"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((row) => (
                    <tr key={row.ruleId} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)", opacity: row.status === "Paused" ? 0.7 : 1 }}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.name}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: row.category === "Workflow" ? "#F5F3FF" : "#EFF6FF", color: row.category === "Workflow" ? "#7C3AED" : "#1D4ED8" }}>{row.category}</span>
                      </td>
                      <td className="py-2.5 px-3 text-xs max-w-[160px]" style={{ color: "var(--rtm-text-secondary)" }}>{row.trigger}</td>
                      <td className="py-2.5 px-3 text-xs max-w-[180px]" style={{ color: "var(--rtm-text-secondary)" }}>{row.action}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={liveRuleStatusVariant[row.status] ?? "neutral"} label={row.status} size="sm" /></td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>{row.lastRun || "—"}</td>
                      <td className="py-2.5 px-3 text-center text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{row.runsTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
