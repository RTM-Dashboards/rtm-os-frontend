"use client";

import { useState, useEffect } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import { useReports } from "@/lib/reporting/useReports";

const workspace = getWorkspace("reporting")!;

//  Types 
type ReportType = "Client Report"| "Department Report"| "Executive Report"| "QBR Report"| "Renewal Report"| "Call Analysis Report";
type GenerationStatus = "Not Started"| "Data Collection"| "AI Analysis"| "Draft Generated"| "QA Review"| "Department Review"| "AM Review"| "Ready to Deliver"| "Delivered";

interface ReportJob {
  id: string;
  name: string;
  client: string;
  reportType: ReportType;
  period: string;
  owner: string;
  assignedAM: string;
  dueDate: string;
  status: GenerationStatus;
  dataSources: string[];
  aiStatus: "Pending"| "Running"| "Complete"| "Error";
  draftReady: boolean;
  qaStatus: "Pending"| "In Review"| "Approved"| "Issues Found";
  priority: "High"| "Normal"| "Low";
  progressPct: number;
}

//  Mock Data 
const reportJobs: ReportJob[] = [
  {
    id: "rg-001",
    name: "Apex Roofing — Monthly SEO",
    client: "Apex Roofing",
    reportType: "Client Report",
    period: "May 2025",
    owner: "Jake T.",
    assignedAM: "Sarah M.",
    dueDate: "Jun 7, 2025",
    status: "AI Analysis",
    dataSources: ["GA4", "GSC", "CallRail"],
    aiStatus: "Running",
    draftReady: false,
    qaStatus: "Pending",
    priority: "High",
    progressPct: 55,
  },
  {
    id: "rg-002",
    name: "Pacific Dental — Monthly Paid Ads",
    client: "Pacific Dental",
    reportType: "Client Report",
    period: "May 2025",
    owner: "Mia K.",
    assignedAM: "Chris L.",
    dueDate: "Jun 5, 2025",
    status: "QA Review",
    dataSources: ["Google Ads", "Meta Ads", "GA4", "CallRail"],
    aiStatus: "Complete",
    draftReady: true,
    qaStatus: "In Review",
    priority: "High",
    progressPct: 75,
  },
  {
    id: "rg-003",
    name: "BlueSky HVAC — Monthly Meta Ads",
    client: "BlueSky HVAC",
    reportType: "Client Report",
    period: "May 2025",
    owner: "Nina P.",
    assignedAM: "Tom R.",
    dueDate: "Jun 6, 2025",
    status: "AM Review",
    dataSources: ["Meta Ads", "CallRail"],
    aiStatus: "Complete",
    draftReady: true,
    qaStatus: "Approved",
    priority: "Normal",
    progressPct: 88,
  },
  {
    id: "rg-004",
    name: "Harbor Auto — Monthly GBP",
    client: "Harbor Auto",
    reportType: "Client Report",
    period: "May 2025",
    owner: "Nina P.",
    assignedAM: "Tom R.",
    dueDate: "Jun 8, 2025",
    status: "Data Collection",
    dataSources: ["GBP", "CallTrackingMetrics"],
    aiStatus: "Pending",
    draftReady: false,
    qaStatus: "Pending",
    priority: "Normal",
    progressPct: 20,
  },
  {
    id: "rg-005",
    name: "Skyline Roofing — Monthly Web Dev",
    client: "Skyline Roofing",
    reportType: "Client Report",
    period: "May 2025",
    owner: "Mia K.",
    assignedAM: "Chris L.",
    dueDate: "Jun 4, 2025",
    status: "Ready to Deliver",
    dataSources: ["GA4", "GSC"],
    aiStatus: "Complete",
    draftReady: true,
    qaStatus: "Approved",
    priority: "Normal",
    progressPct: 100,
  },
  {
    id: "rg-006",
    name: "Agency — Executive Summary Q2",
    client: "Internal",
    reportType: "Executive Report",
    period: "Q2 2025",
    owner: "Sarah M.",
    assignedAM: "N/A",
    dueDate: "Jun 30, 2025",
    status: "Data Collection",
    dataSources: ["All Sources", "CRM", "Google Sheets"],
    aiStatus: "Pending",
    draftReady: false,
    qaStatus: "Pending",
    priority: "High",
    progressPct: 15,
  },
  {
    id: "rg-007",
    name: "Pacific Dental — QBR Q2",
    client: "Pacific Dental",
    reportType: "QBR Report",
    period: "Q2 2025",
    owner: "Mia K.",
    assignedAM: "Chris L.",
    dueDate: "Jun 28, 2025",
    status: "Not Started",
    dataSources: [],
    aiStatus: "Pending",
    draftReady: false,
    qaStatus: "Pending",
    priority: "Normal",
    progressPct: 0,
  },
  {
    id: "rg-008",
    name: "Metro Dental — Renewal Report",
    client: "Metro Dental",
    reportType: "Renewal Report",
    period: "Jun 2025",
    owner: "Jake T.",
    assignedAM: "Sarah M.",
    dueDate: "Jun 15, 2025",
    status: "Draft Generated",
    dataSources: ["Meta Ads", "GA4", "CallRail", "CRM"],
    aiStatus: "Complete",
    draftReady: true,
    qaStatus: "Pending",
    priority: "High",
    progressPct: 65,
  },
  {
    id: "rg-009",
    name: "Agency — Call Analysis Report May",
    client: "Internal",
    reportType: "Call Analysis Report",
    period: "May 2025",
    owner: "Jake T.",
    assignedAM: "N/A",
    dueDate: "Jun 10, 2025",
    status: "AI Analysis",
    dataSources: ["CallRail", "CallTrackingMetrics", "OpenAI"],
    aiStatus: "Running",
    draftReady: false,
    qaStatus: "Pending",
    priority: "Normal",
    progressPct: 50,
  },
  {
    id: "rg-010",
    name: "Coastal Plumbing — Monthly Yelp",
    client: "Coastal Plumbing",
    reportType: "Client Report",
    period: "May 2025",
    owner: "Mia K.",
    assignedAM: "Chris L.",
    dueDate: "Jun 1, 2025",
    status: "Delivered",
    dataSources: ["Yelp Ads", "Google Sheets"],
    aiStatus: "Complete",
    draftReady: true,
    qaStatus: "Approved",
    priority: "Normal",
    progressPct: 100,
  },
];

const statusVariant: Record<GenerationStatus, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Not Started":        "neutral",
  "Data Collection":    "info",
  "AI Analysis":        "info",
  "Draft Generated":    "warning",
  "QA Review":          "warning",
  "Department Review":  "warning",
  "AM Review":          "info",
  "Ready to Deliver":   "success",
  "Delivered":          "success",
};

const qaStatusVariant: Record<string, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  "Pending":       "neutral",
  "In Review":     "info",
  "Approved":      "success",
  "Issues Found":  "error",
};

const priorityColor: Record<string, string> = {
  High:   "#DC2626",
  Normal: "#2563EB",
  Low:    "#64748B",
};

const reportTypeColor: Record<ReportType, { bg?: string; color?: string }> = {
  "Client Report":       { bg: "#EFF6FF", color: "#1D4ED8"},
  "Department Report":   { bg: "#F5F3FF", color: "#6D28D9"},
  "Executive Report":    { bg: "#FFF7ED", color: "#C2410C"},
  "QBR Report":          { bg: "#ECFDF5", color: "#065F46"},
  "Renewal Report":      { bg: "#FEF2F2", color: "#B91C1C"},
  "Call Analysis Report":{ bg: "#F0F9FF", color: "#0369A1"},
};

const WORKFLOW_STEPS: GenerationStatus[] = [
  "Data Collection",
  "AI Analysis",
  "Draft Generated",
  "QA Review",
  "Department Review",
  "AM Review",
  "Ready to Deliver",
  "Delivered",
];

const REPORT_TYPES: Array<ReportType | "All"> = [
  "All", "Client Report", "Department Report", "Executive Report", "QBR Report", "Renewal Report", "Call Analysis Report",
];

export default function ReportGenerationPage() {
  const { records: liveReports, updateReportStatus } = useReports();
  const [filterType, setFilterType] = useState<ReportType | "All">("All");
  const [filterStatus, setFilterStatus] = useState<GenerationStatus | "All">("All");
  const [selectedJob, setSelectedJob] = useState<ReportJob | null>(null);
  const [activeTab, setActiveTab] = useState<"queue"| "workflow"| "new">("queue");

  // Live clients for the Generate New Report form dropdown
  const [liveClients, setLiveClients] = useState<{ id: string; clientName: string }[]>([]);
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/master-clients", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { clients: { id: string; clientName: string; currentStatus?: string }[] };
        setLiveClients(
          data.clients
            .filter((c) => c.currentStatus !== "Inactive")
            .map((c) => ({ id: c.id, clientName: c.clientName }))
        );
      } catch { /* leave empty */ }
    })();
  }, []);

  const [genDraftSaving, setGenDraftSaving] = useState(false);
  const [genDraftSaved, setGenDraftSaved] = useState<string | null>(null);

  const [builderForm, setBuilderForm] = useState({
    name: "",
    clientId: "",
    client: "",
    reportType: "Client Report" as ReportType,
    period: "",
    owner: "",
    assignedAM: "",
    dueDate: "",
    sections: [] as string[],
  });

  async function handleGenSaveDraft() {
    if (!builderForm.clientId || !builderForm.name.trim()) return;
    setGenDraftSaving(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: builderForm.clientId,
          clientName: builderForm.client,
          reportName: builderForm.name,
          reportType: builderForm.reportType,
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
        setGenDraftSaved(data.record.reportId);
        setBuilderForm({ name: "", clientId: "", client: "", reportType: "Client Report", period: "", owner: "", assignedAM: "", dueDate: "", sections: [] });
      }
    } finally {
      setGenDraftSaving(false);
    }
  }

  const allSections = [
    "Executive Summary",
    "KPI Summary",
    "Channel Performance",
    "Call Intelligence Summary",
    "Lead Quality Analysis",
    "Completed Work",
    "Open Tasks",
    "Competitor Mentions",
    "Budget Review",
    "Renewal Signal",
    "Upsell Opportunities",
    "Risks / Issues",
    "Recommendations",
    "Next Month Plan",
  ];

  const toggleSection = (s: string) => {
    setBuilderForm((prev) => ({
      ...prev,
      sections: prev.sections.includes(s) ? prev.sections.filter((x) => x !== s) : [...prev.sections, s],
    }));
  };

  const filtered = reportJobs.filter((r) => {
    if (filterType !== "All"&& r.reportType !== filterType) return false;
    if (filterStatus !== "All"&& r.status !== filterStatus) return false;
    return true;
  });

  const kpis = {
    total: reportJobs.length,
    inProgress: reportJobs.filter((r) => !["Not Started", "Delivered"].includes(r.status)).length,
    draftsReady: reportJobs.filter((r) => r.draftReady && r.status !== "Delivered").length,
    readyToDeliver: reportJobs.filter((r) => r.status === "Ready to Deliver").length,
    delivered: reportJobs.filter((r) => r.status === "Delivered").length,
  };

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        workspace={workspace}
        subtitle="Generate client, department, executive, QBR, renewal, and call analysis reports through the AI-assisted production workflow."/>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard title="Total Reports"value={String(kpis.total)} subtitle="This cycle"iconBg="#EFF6FF"iconColor="#1D4ED8"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>} />
        <KpiCard title="In Progress"value={String(kpis.inProgress)} subtitle="Active generation"iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>} />
        <KpiCard title="Drafts Ready"value={String(kpis.draftsReady)} subtitle="Awaiting QA"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>} />
        <KpiCard title="Ready to Deliver"value={String(kpis.readyToDeliver)} subtitle="AM approved"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <KpiCard title="Delivered"value={String(kpis.delivered)} subtitle="This cycle"iconBg="#F0FDF4"iconColor="#16A34A"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>} />
      </div>

      {/* Workflow Pipeline Visual */}
      <SectionWrapper title="Generation Workflow"description="Automated pipeline from data sources to client delivery">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { label: "Data Sources", count: 12, color: "#2563EB"},
            { label: "Auto Collection", count: null, color: "#7C3AED"},
            { label: "AI Analysis", count: 2, color: "#0F766E"},
            { label: "Draft Generation", count: 3, color: "#D97706"},
            { label: "Reporting QA", count: 2, color: "#EA580C"},
            { label: "Department Review", count: null, color: "#DC2626"},
            { label: "AM Review", count: 1, color: "#6D28D9"},
            { label: "Client Delivery", count: 1, color: "#059669"},
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <div
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-center min-w-[100px]"style={{ background: `${step.color}15`, color: step.color, border: `1px solid ${step.color}40` }}
                >
                  {step.label}
                  {step.count !== null && (
                    <div className="text-lg font-bold mt-0.5">{step.count}</div>
                  )}
                </div>
              </div>
              {i < arr.length - 1 && (
                <svg className="w-4 h-4 flex-shrink-0"fill="none"stroke="currentColor"viewBox="0 0 24 24"style={{ color: "var(--rtm-text-muted)"}}>
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Tabs */}
      <div className="border-b"style={{ borderColor: "var(--rtm-border-light)"}}>
        <nav className="-mb-px flex gap-1">
          {[
            { id: "queue"as const, label: "Generation Queue"},
            { id: "workflow"as const, label: "Workflow Status"},
            { id: "new"as const, label: "Generate New Report"},
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"style={{
                borderColor: activeTab === tab.id ? "#0F766E": "transparent",
                color: activeTab === tab.id ? "#0F766E": "var(--rtm-text-muted)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/*  Generation Queue  */}
      {activeTab === "queue"&& (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as ReportType | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)"}}>
              {REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as GenerationStatus | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)"}}>
              {(["All", ...WORKFLOW_STEPS] as Array<GenerationStatus | "All">).map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="text-xs font-semibold px-4 py-2 rounded-lg border ml-auto"style={{ color: "#0F766E", background: "#0F766E15", borderColor: "#0F766E40"}} onClick={() => setActiveTab("new")}>Generate New Report</button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <SectionWrapper title="Report Generation Queue"description={`${filtered.length} reports in this view`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                        {["Report", "Client", "Type", "Owner", "Due", "Priority", "Progress", "Status", "AI", "QA"].map((h) => (
                          <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedJob(row)}
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer"style={{
                            borderBottom: "1px solid var(--rtm-border-light)",
                            background: selectedJob?.id === row.id ? "var(--rtm-blue-light)": undefined,
                          }}
                        >
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}>{row.name}</div>
                            <div className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{row.period}</div>
                          </td>
                          <td className="py-2.5 px-3 text-xs whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.client}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"style={{ background: reportTypeColor[row.reportType].bg, color: reportTypeColor[row.reportType].color }}>{row.reportType}</span>
                          </td>
                          <td className="py-2.5 px-3 text-xs whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{row.owner}</td>
                          <td className="py-2.5 px-3 text-xs whitespace-nowrap font-medium"style={{ color: "var(--rtm-text-secondary)"}}>{row.dueDate}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-xs font-bold"style={{ color: priorityColor[row.priority] }}>{row.priority}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2 min-w-[80px]">
                              <div className="flex-1 h-1.5 rounded-full"style={{ background: "var(--rtm-border-light)"}}>
                                <div className="h-full rounded-full transition-all"style={{ width: `${row.progressPct}%`, background: row.progressPct === 100 ? "#059669": row.progressPct >= 60 ? "#D97706": "#2563EB"}} />
                              </div>
                              <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{row.progressPct}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <StatusBadge variant={statusVariant[row.status]} label={row.status} size="sm"/>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <StatusBadge variant={row.aiStatus === "Complete"? "success": row.aiStatus === "Running"? "info": row.aiStatus === "Error"? "error": "neutral"} label={row.aiStatus} size="sm"/>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <StatusBadge variant={qaStatusVariant[row.qaStatus]} label={row.qaStatus} size="sm"/>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionWrapper>
            </div>

            {/* Detail Panel */}
            <div>
              {selectedJob ? (
                <SectionWrapper title="Report Details"description={selectedJob.name}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{selectedJob.name}</div>
                        <div className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{selectedJob.client} — {selectedJob.period}</div>
                      </div>
                      <button onClick={() => setSelectedJob(null)} className="text-sm px-1.5"style={{ color: "var(--rtm-text-muted)"}}></button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <StatusBadge variant={statusVariant[selectedJob.status]} label={selectedJob.status} size="sm"/>
                      <span className="text-xs font-bold"style={{ color: priorityColor[selectedJob.priority] }}>{selectedJob.priority} Priority</span>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>Overall Progress</span>
                        <span className="text-xs font-bold"style={{ color: selectedJob.progressPct === 100 ? "#059669": "#2563EB"}}>{selectedJob.progressPct}%</span>
                      </div>
                      <div className="h-2 rounded-full"style={{ background: "var(--rtm-border-light)"}}>
                        <div className="h-full rounded-full transition-all"style={{ width: `${selectedJob.progressPct}%`, background: selectedJob.progressPct === 100 ? "#059669": "#2563EB"}} />
                      </div>
                    </div>

                    {/* Workflow Steps */}
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}>Workflow Progress</div>
                      <div className="space-y-1.5">
                        {WORKFLOW_STEPS.map((step) => {
                          const stepIndex = WORKFLOW_STEPS.indexOf(step);
                          const currentIndex = WORKFLOW_STEPS.indexOf(selectedJob.status);
                          const isDone = stepIndex < currentIndex;
                          const isCurrent = stepIndex === currentIndex;
                          return (
                            <div key={step} className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"style={{
                                  background: isDone ? "#059669": isCurrent ? "#2563EB": "var(--rtm-border-light)",
                                  color: isDone || isCurrent ? "white": "var(--rtm-text-muted)",
                                }}
                              >
                                {isDone ? "": stepIndex + 1}
                              </div>
                              <span className="text-xs"style={{ color: isDone ? "#059669": isCurrent ? "#2563EB": "var(--rtm-text-muted)", fontWeight: isCurrent ? 700 : 400 }}>{step}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Data Sources */}
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide mb-1.5"style={{ color: "var(--rtm-text-muted)"}}>Data Sources</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedJob.dataSources.length > 0 ? selectedJob.dataSources.map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full"style={{ background: "#EFF6FF", color: "#1D4ED8"}}>{s}</span>
                        )) : <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>Not yet configured</span>}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Owner", value: selectedJob.owner },
                        { label: "AM", value: selectedJob.assignedAM },
                        { label: "Due", value: selectedJob.dueDate },
                        { label: "AI Status", value: selectedJob.aiStatus },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg p-2.5"style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)"}}>
                          <div className="text-xs font-semibold uppercase tracking-wide mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.label}</div>
                          <div className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Actions — Submit to QA and Deliver to Client are wired; AI-dependent buttons are honestly disabled */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {!selectedJob.draftReady && (
                        <button
                          disabled
                          className="text-xs font-semibold px-3 py-2 rounded-lg border opacity-40 cursor-not-allowed"
                          style={{ color: "#7C3AED", background: "#7C3AED15", borderColor: "#7C3AED40" }}
                          title="Coming when AI pipeline is configured — requires AI/LLM credentials"
                        >Run AI Analysis</button>
                      )}
                      {selectedJob.draftReady && selectedJob.qaStatus === "Pending" && (() => {
                        // Find the matching live record to wire this button
                        const liveRec = liveReports.find(
                          (r) => r.reportName === selectedJob.name || r.clientName === selectedJob.client
                        );
                        return (
                          <button
                            className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
                            style={{ color: "#D97706", background: "#D9770615", borderColor: "#D9770640" }}
                            onClick={() => {
                              if (liveRec) {
                                void updateReportStatus(liveRec.reportId, {
                                  qaStatus: "Pending QA",
                                  status: "QA Review",
                                });
                              }
                            }}
                          >Submit to QA</button>
                        );
                      })()}
                      {selectedJob.status === "Ready to Deliver" && (() => {
                        const liveRec = liveReports.find(
                          (r) => r.reportName === selectedJob.name || r.clientName === selectedJob.client
                        );
                        return (
                          <button
                            className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
                            style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
                            onClick={() => {
                              if (liveRec) {
                                void updateReportStatus(liveRec.reportId, {
                                  deliveryStatus: "Sent",
                                  status: "Sent",
                                });
                              }
                            }}
                          >Deliver to Client</button>
                        );
                      })()}
                      <button
                        disabled
                        className="text-xs font-semibold px-3 py-2 rounded-lg border opacity-40 cursor-not-allowed"
                        style={{ color: "#2563EB", background: "#2563EB15", borderColor: "#2563EB40" }}
                        title="Coming when AI pipeline is configured — requires AI/LLM credentials"
                      >Preview Draft</button>
                    </div>
                  </div>
                </SectionWrapper>
              ) : (
                <SectionWrapper title="Report Details"description="Select a report to view details and actions">
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)"}}>
                      <svg className="w-6 h-6"fill="none"stroke="currentColor"viewBox="0 0 24 24"style={{ color: "var(--rtm-text-muted)"}}><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>Select a report to view details and take action.</p>
                  </div>
                </SectionWrapper>
              )}
            </div>
          </div>
        </div>
      )}

      {/*  Workflow Status  */}
      {activeTab === "workflow"&& (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {WORKFLOW_STEPS.map((step) => {
            const stepJobs = reportJobs.filter((r) => r.status === step);
            return (
              <div key={step} className="rounded-xl border p-4"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)"}}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{step}</span>
                  <span className="text-sm font-bold px-2 py-0.5 rounded-full"style={{ background: stepJobs.length > 0 ? "#EFF6FF": "var(--rtm-border-light)", color: stepJobs.length > 0 ? "#1D4ED8": "var(--rtm-text-muted)"}}>
                    {stepJobs.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {stepJobs.length > 0 ? stepJobs.map((job) => (
                    <div key={job.id} className="text-xs p-2 rounded-lg"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border-light)"}}>
                      <div className="font-semibold mb-0.5 truncate"style={{ color: "var(--rtm-text-primary)"}}>{job.client}</div>
                      <div style={{ color: "var(--rtm-text-muted)"}} className="truncate">{job.name.split("—")[1]?.trim() ?? job.name}</div>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="font-bold"style={{ color: priorityColor[job.priority] }}>{job.priority}</span>
                        <span style={{ color: "var(--rtm-text-muted)"}}>·</span>
                        <span style={{ color: "var(--rtm-text-muted)"}}>{job.owner}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-xs text-center py-4"style={{ color: "var(--rtm-text-muted)"}}>No reports at this stage</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/*  Generate New Report  */}
      {activeTab === "new" && (
        <div className="space-y-4">
          {/* AI pipeline honest notice */}
          <div className="flex items-start gap-3 rounded-xl border px-4 py-3" style={{ background: "#F0F9FF", borderColor: "#0369A140" }}>
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#0369A1" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs" style={{ color: "#0C4A6E" }}>
              <strong>Save Draft</strong> creates a real report record in the Report Queue (wired to the Phase 1 reports store).
              <strong> Run AI Analysis</strong> and <strong>Generate Report</strong> require AI/LLM credentials — coming when the AI pipeline is configured.
            </p>
          </div>

          {/* Draft saved confirmation */}
          {genDraftSaved && (
            <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ background: "#ECFDF5", borderColor: "#05966940" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#059669" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold" style={{ color: "#065F46" }}>Draft saved (ID: {genDraftSaved}) — visible in Report Queue on the main Reporting page.</span>
              <button onClick={() => setGenDraftSaved(null)} className="ml-auto text-xs" style={{ color: "#065F46" }}>×</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <SectionWrapper title="Report Configuration" description="Fill in the details below — Save Draft creates a real record in the Report Queue">
              <div className="space-y-4">
                {/* Report Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Report Name</label>
                  <input
                    type="text" placeholder="e.g. Apex Roofing — SEO May 2025"
                    value={builderForm.name}
                    onChange={(e) => setBuilderForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}
                  />
                </div>

                {/* Client — real dropdown */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Client</label>
                  <select
                    value={builderForm.clientId}
                    onChange={(e) => {
                      const sel = e.target;
                      const opt = sel.options[sel.selectedIndex];
                      setBuilderForm((prev) => ({ ...prev, clientId: sel.value, client: opt.text }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}
                  >
                    <option value="">Select client…</option>
                    {liveClients.map((c) => (
                      <option key={c.id} value={c.id}>{c.clientName}</option>
                    ))}
                  </select>
                </div>

                {/* Period, Owner, AM, Due Date */}
                {[
                  { label: "Reporting Period", key: "period",      placeholder: "e.g. May 2025" },
                  { label: "Report Owner",    key: "owner",       placeholder: "e.g. Jake T." },
                  { label: "Assigned AM",     key: "assignedAM",  placeholder: "e.g. Sarah M." },
                  { label: "Due Date",        key: "dueDate",     placeholder: "e.g. Jun 7, 2025" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>{field.label}</label>
                    <input
                      type="text" placeholder={field.placeholder}
                      value={(builderForm as unknown as Record<string, string>)[field.key]}
                      onChange={(e) => setBuilderForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Report Type</label>
                  <select
                    value={builderForm.reportType}
                    onChange={(e) => setBuilderForm((prev) => ({ ...prev, reportType: e.target.value as ReportType }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}
                  >
                    {(["Client Report", "Department Report", "Executive Report", "QBR Report", "Renewal Report", "Call Analysis Report"] as ReportType[]).map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionWrapper>

            {/* Section Selector + Actions */}
            <SectionWrapper title="Report Sections" description="Select sections to include in this report">
              <div className="space-y-2 mb-4">
                {allSections.map((section) => (
                  <button
                    key={section}
                    onClick={() => toggleSection(section)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-medium transition-all"
                    style={{
                      borderColor: builderForm.sections.includes(section) ? "#0F766E" : "var(--rtm-border-light)",
                      background: builderForm.sections.includes(section) ? "#0F766E15" : "var(--rtm-bg-secondary)",
                      color: builderForm.sections.includes(section) ? "#0F766E" : "var(--rtm-text-secondary)",
                    }}
                  >
                    <span>{section}</span>
                    <span>{builderForm.sections.includes(section) ? "" : "+"}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {/* Save Draft — real: wired to POST /api/reports */}
                <button
                  onClick={() => void handleGenSaveDraft()}
                  disabled={genDraftSaving || !builderForm.clientId || !builderForm.name.trim()}
                  className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: "#6B7280", background: "#6B728015", borderColor: "#6B728040" }}
                  title={!builderForm.clientId || !builderForm.name.trim() ? "Enter a report name and select a client first" : ""}
                >
                  {genDraftSaving ? "Saving…" : "Save Draft"}
                </button>

                {/* Run AI Analysis — requires AI pipeline */}
                <button
                  disabled
                  className="text-xs font-semibold px-4 py-2 rounded-lg border opacity-40 cursor-not-allowed"
                  style={{ color: "#7C3AED", background: "#7C3AED15", borderColor: "#7C3AED40" }}
                  title="Coming when AI pipeline is configured — requires AI/LLM credentials"
                >
                  Run AI Analysis
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

                {/* Submit for QA — only after draft is saved */}
                <button
                  disabled={!genDraftSaved}
                  className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: "#16A34A", background: "#16A34A15", borderColor: "#16A34A40" }}
                  title={!genDraftSaved ? "Save Draft first, then submit for QA" : ""}
                >
                  Submit for QA
                </button>
              </div>
            </SectionWrapper>
          </div>
        </div>
      )}
    </div>
  );
}
