"use client";

import { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("reporting")!;

// ── Types ─────────────────────────────────────────────────────────────────────
type ReviewStatus =
  | "Pending Assignment"
  | "Assigned"
  | "In Review"
  | "Approved"
  | "Revision Requested"
  | "Overdue";

interface DeptReviewItem {
  id: string;
  report: string;
  client: string;
  department: string;
  assignedReviewer: string;
  reviewStatus: ReviewStatus;
  dueDate: string;
  submittedDate: string;
  comments: string;
  dataSection: string;
  priority: "High" | "Normal" | "Low";
  reportOwner: string;
  completionRequiredFor: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const reviewItems: DeptReviewItem[] = [
  {
    id: "dr-001",
    report: "Apex Roofing — Monthly SEO",
    client: "Apex Roofing",
    department: "SEO",
    assignedReviewer: "Jake T.",
    reviewStatus: "In Review",
    dueDate: "Jun 7, 2025",
    submittedDate: "Jun 5, 2025",
    comments: "Reviewing keyword ranking accuracy and organic traffic attribution.",
    dataSection: "Keyword Rankings, Organic Traffic, Link Building",
    priority: "High",
    reportOwner: "Jake T.",
    completionRequiredFor: "Report QA",
  },
  {
    id: "dr-002",
    report: "Pacific Dental — Monthly Paid Ads",
    client: "Pacific Dental",
    department: "Paid Advertising",
    assignedReviewer: "Leo S.",
    reviewStatus: "Approved",
    dueDate: "Jun 5, 2025",
    submittedDate: "Jun 4, 2025",
    comments: "All Google Ads and Meta metrics verified. ROAS numbers confirmed.",
    dataSection: "Google Ads Performance, Meta Ads Performance",
    priority: "High",
    reportOwner: "Mia K.",
    completionRequiredFor: "QA Review",
  },
  {
    id: "dr-003",
    report: "Harbor Auto — Monthly GBP",
    client: "Harbor Auto",
    department: "GBP",
    assignedReviewer: "Nina P.",
    reviewStatus: "Pending Assignment",
    dueDate: "Jun 8, 2025",
    submittedDate: "—",
    comments: "",
    dataSection: "GBP Listing Performance, Review Summary",
    priority: "Normal",
    reportOwner: "Nina P.",
    completionRequiredFor: "Report Drafting",
  },
  {
    id: "dr-004",
    report: "Metro Dental — Monthly LSA",
    client: "Metro Dental",
    department: "Local Service Ads",
    assignedReviewer: "Ryan B.",
    reviewStatus: "Overdue",
    dueDate: "Jun 5, 2025",
    submittedDate: "—",
    comments: "Waiting on LSA platform data export. API delay reported.",
    dataSection: "LSA Lead Volume, Cost Per Lead, Dispute Summary",
    priority: "High",
    reportOwner: "Jake T.",
    completionRequiredFor: "Report Drafting",
  },
  {
    id: "dr-005",
    report: "BlueSky HVAC — Monthly Meta Ads",
    client: "BlueSky HVAC",
    department: "Paid Advertising",
    assignedReviewer: "Dana W.",
    reviewStatus: "Approved",
    dueDate: "Jun 6, 2025",
    submittedDate: "Jun 5, 2025",
    comments: "Meta campaign metrics verified. Conversion events confirmed.",
    dataSection: "Meta Ads Performance, Campaign Breakdown",
    priority: "Normal",
    reportOwner: "Nina P.",
    completionRequiredFor: "AM Review",
  },
  {
    id: "dr-006",
    report: "Summit Landscaping — Monthly SEO",
    client: "Summit Landscaping",
    department: "SEO",
    assignedReviewer: "Jake T.",
    reviewStatus: "Overdue",
    dueDate: "May 30, 2025",
    submittedDate: "—",
    comments: "Escalated to department lead. Owner unavailable.",
    dataSection: "Keyword Rankings, Organic Traffic",
    priority: "High",
    reportOwner: "Leo S.",
    completionRequiredFor: "Report Drafting",
  },
  {
    id: "dr-007",
    report: "Prestige Auto — Monthly Google Ads",
    client: "Prestige Auto",
    department: "Paid Advertising",
    assignedReviewer: "Leo S.",
    reviewStatus: "Assigned",
    dueDate: "Jun 9, 2025",
    submittedDate: "Jun 6, 2025",
    comments: "",
    dataSection: "Google Ads Performance, Quality Score, ROAS",
    priority: "Normal",
    reportOwner: "Leo S.",
    completionRequiredFor: "Report Drafting",
  },
  {
    id: "dr-008",
    report: "Urban Dental — Monthly Content",
    client: "Urban Dental",
    department: "Content",
    assignedReviewer: "Sarah M.",
    reviewStatus: "Revision Requested",
    dueDate: "Jun 11, 2025",
    submittedDate: "Jun 7, 2025",
    comments: "Blog post publish timestamps are missing. Need confirmation of all published URLs.",
    dataSection: "Content Published, Blog Links, Engagement Stats",
    priority: "Normal",
    reportOwner: "Jake T.",
    completionRequiredFor: "QA Review",
  },
  {
    id: "dr-009",
    report: "Skyline Roofing — Monthly Web Dev",
    client: "Skyline Roofing",
    department: "Web Development",
    assignedReviewer: "Tom R.",
    reviewStatus: "Approved",
    dueDate: "Jun 4, 2025",
    submittedDate: "Jun 3, 2025",
    comments: "Site speed report and Core Web Vitals confirmed.",
    dataSection: "Site Performance, Core Web Vitals, Completed Dev Work",
    priority: "Normal",
    reportOwner: "Mia K.",
    completionRequiredFor: "AM Review",
  },
  {
    id: "dr-010",
    report: "Pacific Dental — QBR Q2",
    client: "Pacific Dental",
    department: "Account Management",
    assignedReviewer: "Chris L.",
    reviewStatus: "Pending Assignment",
    dueDate: "Jun 28, 2025",
    submittedDate: "—",
    comments: "",
    dataSection: "Full Portfolio Summary, Revenue, Health Score",
    priority: "High",
    reportOwner: "Mia K.",
    completionRequiredFor: "AM Review",
  },
  {
    id: "dr-011",
    report: "Metro Dental — Renewal Report",
    client: "Metro Dental",
    department: "Account Management",
    assignedReviewer: "Sarah M.",
    reviewStatus: "In Review",
    dueDate: "Jun 15, 2025",
    submittedDate: "Jun 8, 2025",
    comments: "Reviewing client health score and renewal risk assessment.",
    dataSection: "Client Health, Revenue Summary, Renewal Risk",
    priority: "High",
    reportOwner: "Jake T.",
    completionRequiredFor: "AM Review",
  },
];

const statusVariant: Record<ReviewStatus, "success" | "warning" | "error" | "info" | "pending" | "neutral"> = {
  "Pending Assignment": "neutral",
  "Assigned":           "info",
  "In Review":          "info",
  "Approved":           "success",
  "Revision Requested": "warning",
  "Overdue":            "error",
};

const deptColors: Record<string, { bg: string; color: string }> = {
  "SEO":                { bg: "#EFF6FF", color: "#1D4ED8" },
  "Paid Advertising":   { bg: "#FFF7ED", color: "#C2410C" },
  "GBP":                { bg: "#ECFDF5", color: "#065F46" },
  "Local Service Ads":  { bg: "#FFFBEB", color: "#92400E" },
  "Content":            { bg: "#F5F3FF", color: "#6D28D9" },
  "Web Development":    { bg: "#F0F9FF", color: "#0369A1" },
  "Account Management": { bg: "#FDF4FF", color: "#7E22CE" },
  "Billing":            { bg: "#F8FAFC", color: "#475569" },
  "IT & Security":      { bg: "#F1F5F9", color: "#334155" },
};

const DEPARTMENTS = ["All", "SEO", "Paid Advertising", "GBP", "Local Service Ads", "Content", "Web Development", "Account Management"];

export default function DepartmentReviewPage() {
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | "All">("All");
  const [selectedItem, setSelectedItem] = useState<DeptReviewItem | null>(null);

  const filtered = reviewItems.filter((r) => {
    if (filterDept !== "All" && r.department !== filterDept) return false;
    if (filterStatus !== "All" && r.reviewStatus !== filterStatus) return false;
    return true;
  });

  const kpis = {
    total: reviewItems.length,
    pending: reviewItems.filter((r) => r.reviewStatus === "Pending Assignment" || r.reviewStatus === "Assigned").length,
    inReview: reviewItems.filter((r) => r.reviewStatus === "In Review").length,
    approved: reviewItems.filter((r) => r.reviewStatus === "Approved").length,
    overdue: reviewItems.filter((r) => r.reviewStatus === "Overdue").length,
    revisionRequested: reviewItems.filter((r) => r.reviewStatus === "Revision Requested").length,
  };

  // Group by department for the summary panel
  const deptSummary = DEPARTMENTS.slice(1).map((dept) => {
    const items = reviewItems.filter((r) => r.department === dept);
    return {
      dept,
      total: items.length,
      approved: items.filter((r) => r.reviewStatus === "Approved").length,
      overdue: items.filter((r) => r.reviewStatus === "Overdue").length,
      pending: items.filter((r) => ["Pending Assignment", "Assigned", "In Review"].includes(r.reviewStatus)).length,
    };
  }).filter((d) => d.total > 0);

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        workspace={workspace}
        subtitle="Department review queue — track data verification and sign-off from all departments before report QA and AM review."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
        <KpiCard title="Total Reviews" value={String(kpis.total)} subtitle="This cycle" iconBg="#EFF6FF" iconColor="#1D4ED8" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
        <KpiCard title="Awaiting Review" value={String(kpis.pending)} subtitle="Not yet started" iconBg="#F8FAFC" iconColor="#64748B" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="In Review" value={String(kpis.inReview)} subtitle="Active reviews" iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
        <KpiCard title="Approved" value={String(kpis.approved)} subtitle="Cleared for QA" iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Overdue" value={String(kpis.overdue)} subtitle="Past due date" iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <KpiCard title="Revision Requested" value={String(kpis.revisionRequested)} subtitle="Needs correction" iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} />
      </div>

      {/* Filters + Action */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ReviewStatus | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}>
          {(["All", "Pending Assignment", "Assigned", "In Review", "Approved", "Revision Requested", "Overdue"] as Array<ReviewStatus | "All">).map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{filtered.length} reviews</span>
        <button className="ml-auto text-xs font-semibold px-4 py-2 rounded-lg border" style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}>Escalate All Overdue</button>
        <button className="text-xs font-semibold px-4 py-2 rounded-lg border" style={{ color: "#0F766E", background: "#0F766E15", borderColor: "#0F766E40" }}>Send Chase Reminders</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Review Table */}
        <div className="xl:col-span-2">
          <SectionWrapper title="Department Review Queue" description="All reports pending department data verification and sign-off">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Report", "Client", "Department", "Assigned Reviewer", "Review Status", "Due Date", "Comments", "Required For"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const deptStyle = deptColors[row.department] ?? { bg: "#F8FAFC", color: "#475569" };
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedItem(row)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        style={{
                          borderBottom: "1px solid var(--rtm-border-light)",
                          background: selectedItem?.id === row.id ? "var(--rtm-blue-light)" : undefined,
                        }}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.report}</div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{row.reportOwner}</div>
                        </td>
                        <td className="py-2.5 px-3 text-xs font-medium whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.client}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: deptStyle.bg, color: deptStyle.color }}>{row.department}</span>
                        </td>
                        <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.assignedReviewer}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusBadge variant={statusVariant[row.reviewStatus]} label={row.reviewStatus} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-xs whitespace-nowrap font-medium" style={{ color: row.reviewStatus === "Overdue" ? "#DC2626" : "var(--rtm-text-secondary)" }}>{row.dueDate}</td>
                        <td className="py-2.5 px-3 text-xs max-w-xs" style={{ color: "var(--rtm-text-muted)" }}>{row.comments || "—"}</td>
                        <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-blue)" }}>{row.completionRequiredFor}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        </div>

        {/* Side Panels */}
        <div className="space-y-4">
          {selectedItem ? (
            <SectionWrapper title="Review Details" description={selectedItem.department}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{selectedItem.report}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{selectedItem.client}</div>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="text-sm px-1.5" style={{ color: "var(--rtm-text-muted)" }}>✕</button>
                </div>

                <StatusBadge variant={statusVariant[selectedItem.reviewStatus]} label={selectedItem.reviewStatus} size="sm" />

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Department", value: selectedItem.department },
                    { label: "Reviewer", value: selectedItem.assignedReviewer },
                    { label: "Report Owner", value: selectedItem.reportOwner },
                    { label: "Due Date", value: selectedItem.dueDate },
                    { label: "Submitted", value: selectedItem.submittedDate },
                    { label: "Required For", value: selectedItem.completionRequiredFor },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg p-2.5" style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}>
                      <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</div>
                      <div className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--rtm-text-muted)" }}>Data Section</div>
                  <div className="text-xs p-2 rounded-lg" style={{ background: "var(--rtm-bg-secondary)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border-light)" }}>{selectedItem.dataSection}</div>
                </div>

                {selectedItem.comments && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--rtm-text-muted)" }}>Reviewer Comments</div>
                    <div className="text-xs p-3 rounded-lg" style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E" }}>{selectedItem.comments}</div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button className="text-xs font-semibold px-3 py-2 rounded-lg border" style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}>Approve</button>
                  <button className="text-xs font-semibold px-3 py-2 rounded-lg border" style={{ color: "#D97706", background: "#D9770615", borderColor: "#D9770640" }}>Request Revision</button>
                  <button className="text-xs font-semibold px-3 py-2 rounded-lg border" style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}>Escalate</button>
                </div>
              </div>
            </SectionWrapper>
          ) : (
            <SectionWrapper title="Review Details" description="Select a review item for details">
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Select a review item to view details and take action.</p>
              </div>
            </SectionWrapper>
          )}

          {/* Department Summary */}
          <SectionWrapper title="By Department" description="Review completion by department">
            <div className="space-y-2">
              {deptSummary.map((d) => {
                const deptStyle = deptColors[d.dept] ?? { bg: "#F8FAFC", color: "#475569" };
                return (
                  <div
                    key={d.dept}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderColor: "var(--rtm-border-light)", background: deptStyle.bg }}
                    onClick={() => setFilterDept(d.dept)}
                  >
                    <div>
                      <div className="text-xs font-semibold" style={{ color: deptStyle.color }}>{d.dept}</div>
                      <div className="text-xs mt-0.5" style={{ color: deptStyle.color }}>{d.total} review{d.total !== 1 ? "s" : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.overdue > 0 && <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "#FEF2F2", color: "#DC2626" }}>{d.overdue} overdue</span>}
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "#ECFDF5", color: "#059669" }}>{d.approved} done</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
