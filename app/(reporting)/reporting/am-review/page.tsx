"use client";

import { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";
import {
  useReports,
  amStatusVariant,
  deliveryStatusVariant,
  type ReportRecord,
} from "@/lib/reporting/useReports";
import { useDateRangeFilter } from "@/lib/reporting/useDateRangeFilter";
import { DateRangeFilter } from "@/components/reporting/DateRangeFilter";

const workspace = getWorkspace("reporting")!;

const amColors: Record<string, { bg?: string; color?: string }> = {
  "Sarah M.": { bg: "#F5F3FF", color: "#6D28D9" },
  "Chris L.": { bg: "#EFF6FF", color: "#1D4ED8" },
  "Tom R.":   { bg: "#FFF7ED", color: "#C2410C" },
  "Dana W.":  { bg: "#ECFDF5", color: "#065F46" },
};

const AMS = ["All", "Sarah M.", "Chris L.", "Tom R.", "Dana W."];

type AMReviewStatus = "Pending AM Review" | "In Review" | "Approved By AM" | "Revision Requested" | "Escalated";

export default function AMReviewPage() {
  const { records, loading, updateReportStatus } = useReports();
  const [filterAM, setFilterAM] = useState("All");
  const [filterStatus, setFilterStatus] = useState<AMReviewStatus | "All">("All");
  const [selectedItem, setSelectedItem] = useState<ReportRecord | null>(null);

  // Date-range filter (filters by createdAt on real report records)
  const dateFilter = useDateRangeFilter();

  // Keep selectedItem in sync with live data
  const selectedLive = selectedItem
    ? records.find((r) => r.reportId === selectedItem.reportId) ?? selectedItem
    : null;

  const filtered = records.filter((r) => {
    if (filterAM !== "All" && r.amId !== filterAM) return false;
    if (filterStatus !== "All" && r.amStatus !== filterStatus) return false;
    if (!dateFilter.filterByDate(r.createdAt)) return false;
    return true;
  });

  const kpis = {
    total: records.length,
    pendingReview: records.filter((r) => r.amStatus === "Pending AM Review").length,
    inReview: records.filter((r) => r.amStatus === "In Review").length,
    approved: records.filter((r) => r.amStatus === "Approved By AM").length,
    revision: records.filter((r) => r.amStatus === "Revision Requested").length,
    delivered: records.filter((r) => r.deliveryStatus === "Sent").length,
    readyToDeliver: records.filter((r) => r.deliveryStatus === "Ready To Send").length,
  };

  const amSummary = AMS.slice(1).map((am) => {
    const items = records.filter((r) => r.amId === am);
    return {
      am,
      total: items.length,
      pending: items.filter((r) => r.amStatus === "Pending AM Review" || r.amStatus === "In Review").length,
      approved: items.filter((r) => r.amStatus === "Approved By AM").length,
      revision: items.filter((r) => r.amStatus === "Revision Requested").length,
    };
  });

  // Button handlers
  const handleAMApprove = async () => {
    if (!selectedLive) return;
    await updateReportStatus(selectedLive.reportId, {
      amStatus: "Approved By AM",
      deliveryStatus: "Ready To Send",
      status: "Ready To Send",
    });
  };

  const handleRequestRevision = async () => {
    if (!selectedLive) return;
    await updateReportStatus(selectedLive.reportId, {
      amStatus: "Revision Requested",
      status: "Needs Revision",
    });
  };

  const handleScheduleDelivery = async () => {
    if (!selectedLive) return;
    await updateReportStatus(selectedLive.reportId, {
      deliveryStatus: "Scheduled",
    });
  };

  const handleSendToClient = async () => {
    if (!selectedLive) return;
    await updateReportStatus(selectedLive.reportId, {
      deliveryStatus: "Sent",
      status: "Sent",
    });
  };

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        workspace={workspace}
        subtitle="AM review queue — track account manager sign-off and client delivery scheduling for all approved reports." />

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total AM Reviews" value={String(kpis.total)} subtitle="This cycle" iconBg="#EFF6FF" iconColor="#1D4ED8" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>} />
        <KpiCard title="Pending Review" value={String(kpis.pendingReview)} subtitle="Awaiting AM action" iconBg="#F8FAFC" iconColor="#64748B" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <KpiCard title="Revision Requested" value={String(kpis.revision)} subtitle="Needs correction" iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>} />
        <KpiCard title="Delivered" value={String(kpis.delivered)} subtitle="Sent to client" iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>} />
      </div>

      {/* Date range filter — applies to all AM Review records by createdAt */}
      <DateRangeFilter
        dateRange={dateFilter.dateRange}
        setDateRange={dateFilter.setDateRange}
        customStart={dateFilter.customStart}
        setCustomStart={dateFilter.setCustomStart}
        customEnd={dateFilter.customEnd}
        setCustomEnd={dateFilter.setCustomEnd}
        resultCount={loading ? undefined : filtered.length}
        totalCount={loading ? undefined : records.length}
      />

      {/* Status / AM filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={filterAM} onChange={(e) => setFilterAM(e.target.value)} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}>
          {AMS.map((a) => <option key={a}>{a}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as AMReviewStatus | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}>
          {(["All", "Pending AM Review", "In Review", "Approved By AM", "Revision Requested", "Escalated"] as Array<AMReviewStatus | "All">).map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{loading ? "Loading…" : `${filtered.length} items`}</span>
        <button className="ml-auto text-xs font-semibold px-4 py-2 rounded-lg border" style={{ color: "#2563EB", background: "#2563EB15", borderColor: "#2563EB40" }}>Notify All AMs</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* AM Review Table */}
        <div className="xl:col-span-2">
          <SectionWrapper title="AM Review Queue" description="Reports awaiting account manager review, approval, and client delivery scheduling">
            {loading ? (
              <div className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                      {["Report", "Client", "AM Owner", "Review Status", "Delivery Status", "Delivery Method", "Due Date"].map((h) => (
                        <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const amStyle = amColors[row.amId] ?? { bg: "#F8FAFC", color: "#475569" };
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
                            <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{row.reportType} — {row.period}</div>
                          </td>
                          <td className="py-2.5 px-3 text-xs font-medium whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.clientName}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: amStyle.bg, color: amStyle.color }}>{row.amId}</span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <StatusBadge variant={amStatusVariant[row.amStatus] ?? "neutral"} label={row.amStatus} size="sm" />
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <StatusBadge variant={deliveryStatusVariant[row.deliveryStatus] ?? "neutral"} label={row.deliveryStatus} size="sm" />
                          </td>
                          <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{row.deliveryMethod}</td>
                          <td className="py-2.5 px-3 text-xs whitespace-nowrap font-medium" style={{ color: "var(--rtm-text-secondary)" }}>{row.dueDate}</td>
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
            <SectionWrapper title="Review Details" description={selectedLive.clientName}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{selectedLive.reportName}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{selectedLive.clientName} — {selectedLive.period}</div>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="text-sm px-1.5" style={{ color: "var(--rtm-text-muted)" }}>✕</button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <StatusBadge variant={amStatusVariant[selectedLive.amStatus] ?? "neutral"} label={selectedLive.amStatus} size="sm" />
                  <StatusBadge variant={deliveryStatusVariant[selectedLive.deliveryStatus] ?? "neutral"} label={selectedLive.deliveryStatus} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "AM Owner", value: selectedLive.amId },
                    { label: "Report Owner", value: selectedLive.ownerId },
                    { label: "Due Date", value: selectedLive.dueDate },
                    { label: "Delivery Method", value: selectedLive.deliveryMethod },
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
                  {selectedLive.amStatus !== "Approved By AM" && (
                    <button
                      onClick={() => void handleAMApprove()}
                      className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
                      style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
                    >AM Approve</button>
                  )}
                  <button
                    onClick={() => void handleRequestRevision()}
                    className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
                    style={{ color: "#D97706", background: "#D9770615", borderColor: "#D9770640" }}
                  >Request Revision</button>
                  {selectedLive.amStatus === "Approved By AM" && selectedLive.deliveryStatus !== "Sent" && (
                    <button
                      onClick={() => void handleScheduleDelivery()}
                      className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
                      style={{ color: "#2563EB", background: "#2563EB15", borderColor: "#2563EB40" }}
                    >Schedule Delivery</button>
                  )}
                  {(selectedLive.deliveryStatus === "Ready To Send" || selectedLive.deliveryStatus === "Scheduled") && (
                    <button
                      onClick={() => void handleSendToClient()}
                      className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all hover:opacity-90"
                      style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
                    >Send to Client</button>
                  )}
                </div>
              </div>
            </SectionWrapper>
          ) : (
            <SectionWrapper title="Review Details" description="Select an item for details">
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Select a review item to view details and take action.</p>
              </div>
            </SectionWrapper>
          )}

          {/* AM Summary */}
          <SectionWrapper title="By Account Manager" description="Review completion per AM">
            <div className="space-y-2">
              {amSummary.map((am) => {
                const amStyle = amColors[am.am] ?? { bg: "#F8FAFC", color: "#475569" };
                return (
                  <div
                    key={am.am}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderColor: "var(--rtm-border-light)", background: amStyle.bg }}
                    onClick={() => setFilterAM(am.am)}
                  >
                    <div>
                      <div className="text-sm font-bold" style={{ color: amStyle.color }}>{am.am}</div>
                      <div className="text-xs mt-0.5" style={{ color: amStyle.color }}>{am.total} report{am.total !== 1 ? "s" : ""}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {am.revision > 0 && <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "#FFFBEB", color: "#D97706" }}>{am.revision} rev</span>}
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "#ECFDF5", color: "#059669" }}>{am.approved} done</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "#F8FAFC", color: "#64748B" }}>{am.pending} pending</span>
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
