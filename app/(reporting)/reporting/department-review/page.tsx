"use client";

import { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import {
  useReports,
  deptReviewStatusVariant,
  type ReportRecord,
} from "@/lib/reporting/useReports";

const workspace = getWorkspace("reporting")!;

const deptColors: Record<string, { bg?: string; color?: string }> = {
  "SEO":                { bg: "#EFF6FF", color: "#1D4ED8"},
  "Paid Advertising":   { bg: "#FFF7ED", color: "#C2410C"},
  "GBP":                { bg: "#ECFDF5", color: "#065F46"},
  "Local Service Ads":  { bg: "#FFFBEB", color: "#92400E"},
  "Content":            { bg: "#F5F3FF", color: "#6D28D9"},
  "Web Development":    { bg: "#F0F9FF", color: "#0369A1"},
  "Account Management": { bg: "#FDF4FF", color: "#7E22CE"},
  "Billing":            { bg: "#F8FAFC", color: "#475569"},
  "IT & Security":      { bg: "#F1F5F9", color: "#334155"},
};

// Map reportType → rough department label for display
function deptFromReportType(reportType: string): string {
  if (reportType.includes("SEO")) return "SEO";
  if (reportType.includes("Paid Ads") || reportType.includes("Google Ads") || reportType.includes("Meta Ads")) return "Paid Advertising";
  if (reportType.includes("GBP")) return "GBP";
  if (reportType.includes("LSA")) return "Local Service Ads";
  if (reportType.includes("Content")) return "Content";
  if (reportType.includes("Web Dev")) return "Web Development";
  if (reportType.includes("Yelp")) return "Yelp";
  return "Account Management";
}

const DEPARTMENTS = ["All", "SEO", "Paid Advertising", "GBP", "Local Service Ads", "Content", "Web Development", "Account Management", "Yelp"];

type DeptReviewStatus = "Pending Assignment" | "Assigned" | "In Review" | "Approved" | "Revision Requested" | "Overdue";

export default function DepartmentReviewPage() {
  const { records, loading, updateReportStatus } = useReports();
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState<DeptReviewStatus | "All">("All");
  const [selectedItem, setSelectedItem] = useState<ReportRecord | null>(null);

  // Keep selectedItem in sync with live data
  const selectedLive = selectedItem
    ? records.find((r) => r.reportId === selectedItem.reportId) ?? selectedItem
    : null;

  const filtered = records.filter((r) => {
    const dept = deptFromReportType(r.reportType);
    if (filterDept !== "All" && dept !== filterDept) return false;
    if (filterStatus !== "All" && r.deptReviewStatus !== filterStatus) return false;
    return true;
  });

  const kpis = {
    total: records.length,
    pending: records.filter((r) => r.deptReviewStatus === "Pending Assignment" || r.deptReviewStatus === "Assigned").length,
    inReview: records.filter((r) => r.deptReviewStatus === "In Review").length,
    approved: records.filter((r) => r.deptReviewStatus === "Approved").length,
    overdue: records.filter((r) => r.deptReviewStatus === "Overdue").length,
    revisionRequested: records.filter((r) => r.deptReviewStatus === "Revision Requested").length,
  };

  const deptSummary = DEPARTMENTS.slice(1).map((dept) => {
    const items = records.filter((r) => deptFromReportType(r.reportType) === dept);
    return {
      dept,
      total: items.length,
      approved: items.filter((r) => r.deptReviewStatus === "Approved").length,
      overdue: items.filter((r) => r.deptReviewStatus === "Overdue").length,
      pending: items.filter((r) => ["Pending Assignment", "Assigned", "In Review"].includes(r.deptReviewStatus)).length,
    };
  }).filter((d) => d.total > 0);

  // Button handlers
  const handleApprove = async () => {
    if (!selectedLive) return;
    await updateReportStatus(selectedLive.reportId, { deptReviewStatus: "Approved" });
  };

  const handleRequestRevision = async () => {
    if (!selectedLive) return;
    await updateReportStatus(selectedLive.reportId, {
      deptReviewStatus: "Revision Requested",
      status: "Needs Revision",
    });
  };

  const handleEscalate = async () => {
    if (!selectedLive) return;
    await updateReportStatus(selectedLive.reportId, { deptReviewStatus: "Overdue" });
  };

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        workspace={workspace}
        subtitle="Department review queue — track data verification and sign-off from all departments before report QA and AM review."/>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
        <KpiCard title="Total Reviews" value={String(kpis.total)} subtitle="This cycle" iconBg="#EFF6FF" iconColor="#1D4ED8" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>} />
        <KpiCard title="Awaiting Review" value={String(kpis.pending)} subtitle="Not yet started" iconBg="#F8FAFC" iconColor="#64748B" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <KpiCard title="In Review" value={String(kpis.inReview)} subtitle="Active reviews" iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>} />
        <KpiCard title="Approved" value={String(kpis.approved)} subtitle="Cleared for QA" iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <KpiCard title="Overdue" value={String(kpis.overdue)} subtitle="Past due date" iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>} />
        <KpiCard title="Revision Requested" value={String(kpis.revisionRequested)} subtitle="Needs correction" iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>} />
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as DeptReviewStatus | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}>
          {(["All", "Pending Assignment", "Assigned", "In Review", "Approved", "Revision Requested", "Overdue"] as Array<DeptReviewStatus | "All">).map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{loading ? "Loading…" : `${filtered.length} reviews`}</span>
        <button className="ml-auto text-xs font-semibold px-4 py-2 rounded-lg border" style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}>Escalate All Overdue</button>
        <button className="text-xs font-semibold px-4 py-2 rounded-lg border" style={{ color: "#0F766E", background: "#0F766E15", borderColor: "#0F766E40" }}>Send Chase Reminders</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Review Table */}
        <div className="xl:col-span-2">
          <SectionWrapper title="Department Review Queue" description="All reports pending department data verification and sign-off">
            {loading ? (
              <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                      {["Report", "Client", "Department", "Report Owner", "Review Status", "Due Date", "Required For"].map((h) => (
                        <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const dept = deptFromReportType(row.reportType);
                      const deptStyle = deptColors[dept] ?? { bg: "#F8FAFC", color: "#475569" };
                      const requiredFor =
                        row.deptReviewStatus === "Approved" ? "Report QA" :
                        row.qaStatus === "Approved" ? "AM Review" : "Report Drafting";
                      return (
                        <tr
                          key={row.reportId}
                          onClick={() => setSelectedItem(row)}
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                          style={{
                            borderBottom: "1px solid var(--rtm-border-light)",
                            background: selectedLive?.reportId === row.reportId ? "var(--rtm-blue-light)" : undefined,
                          }}
                        >
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.reportName}</div>
                            <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{row.ownerId}</div>
                          </td>
                          <td className="py-2.5 px-3 text-xs font-medium whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.clientName}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: deptStyle.bg, color: deptStyle.color }}>{dept}</span>
                          </td>
                          <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.ownerId}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <StatusBadge variant={deptReviewStatusVariant[row.deptReviewStatus] ?? "neutral"} label={row.deptReviewStatus} size="sm" />
                          </td>
                          <td className="py-2.5 px-3 text-xs whitespace-nowrap font-medium" style={{ color: row.deptReviewStatus === "Overdue" ? "#DC2626" : "var(--rtm-text-secondary)" }}>{row.dueDate}</td>
                          <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-blue)" }}>{requiredFor}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionWrapper>
        </div>

        {/* Side Panels */}
        <div className="space-y-4">
          {selectedLive ? (
            <SectionWrapper title="Review Details" description={deptFromReportType(selectedLive.reportType)}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{selectedLive.reportName}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{selectedLive.clientName}</div>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="text-sm px-1.5" style={{ color: "var(--rtm-text-muted)" }}>✕</button>
                </div>

                <StatusBadge variant={deptReviewStatusVariant[selectedLive.deptReviewStatus] ?? "neutral"} label={selectedLive.deptReviewStatus} size="sm" />

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Department", value: deptFromReportType(selectedLive.reportType) },
                    { label: "Report Owner", value: selectedLive.ownerId },
                    { label: "AM", value: selectedLive.amId },
                    { label: "Due Date", value: selectedLive.dueDate },
                    { label: "QA Status", value: selectedLive.qaStatus },
                    { label: "Report Status", value: selectedLive.status },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg p-2.5" style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}>
                      <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</div>
                      <div className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => void handleApprove()}
                    className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
                    style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
                  >Approve</button>
                  <button
                    onClick={() => void handleRequestRevision()}
                    className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
                    style={{ color: "#D97706", background: "#D9770615", borderColor: "#D9770640" }}
                  >Request Revision</button>
                  <button
                    onClick={() => void handleEscalate()}
                    className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
                    style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}
                  >Escalate</button>
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
