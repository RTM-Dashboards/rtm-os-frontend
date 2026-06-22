"use client";

import { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("reporting")!;

// ── Types ─────────────────────────────────────────────────────────────────────
type AMReviewStatus =
  | "Pending AM Review"
  | "In Review"
  | "Approved"
  | "Revision Requested"
  | "Escalated";

type DeliveryStatus =
  | "Not Ready"
  | "Ready to Deliver"
  | "Scheduled"
  | "Delivered"
  | "Feedback Received"
  | "Follow-Up Needed";

interface AMReviewItem {
  id: string;
  report: string;
  client: string;
  reportType: string;
  period: string;
  am: string;
  reviewStatus: AMReviewStatus;
  deliveryStatus: DeliveryStatus;
  clientDeliveryDate: string;
  reviewDueDate: string;
  amNotes: string;
  reportOwner: string;
  qaApprovedDate: string;
  deliveryMethod: string;
  priority: "High" | "Normal" | "Low";
  feedbackRequired: boolean;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const amReviewItems: AMReviewItem[] = [
  {
    id: "am-001",
    report: "BlueSky HVAC — Monthly Meta Ads",
    client: "BlueSky HVAC",
    reportType: "Client Report",
    period: "May 2025",
    am: "Tom R.",
    reviewStatus: "In Review",
    deliveryStatus: "Not Ready",
    clientDeliveryDate: "Jun 8, 2025",
    reviewDueDate: "Jun 7, 2025",
    amNotes: "Checking spend allocation for June vs May. Want to confirm ROAS footnote.",
    reportOwner: "Nina P.",
    qaApprovedDate: "Jun 5, 2025",
    deliveryMethod: "Email",
    priority: "Normal",
    feedbackRequired: false,
  },
  {
    id: "am-002",
    report: "Pacific Dental — Monthly Paid Ads",
    client: "Pacific Dental",
    reportType: "Client Report",
    period: "May 2025",
    am: "Chris L.",
    reviewStatus: "Pending AM Review",
    deliveryStatus: "Not Ready",
    clientDeliveryDate: "Jun 7, 2025",
    reviewDueDate: "Jun 6, 2025",
    amNotes: "",
    reportOwner: "Mia K.",
    qaApprovedDate: "Jun 5, 2025",
    deliveryMethod: "Email + Portal",
    priority: "High",
    feedbackRequired: false,
  },
  {
    id: "am-003",
    report: "Apex Roofing — Monthly SEO",
    client: "Apex Roofing",
    reportType: "Client Report",
    period: "May 2025",
    am: "Sarah M.",
    reviewStatus: "Pending AM Review",
    deliveryStatus: "Not Ready",
    clientDeliveryDate: "Jun 9, 2025",
    reviewDueDate: "Jun 8, 2025",
    amNotes: "",
    reportOwner: "Jake T.",
    qaApprovedDate: "Jun 6, 2025",
    deliveryMethod: "Email",
    priority: "Normal",
    feedbackRequired: false,
  },
  {
    id: "am-004",
    report: "Skyline Roofing — Monthly Web Dev",
    client: "Skyline Roofing",
    reportType: "Client Report",
    period: "May 2025",
    am: "Chris L.",
    reviewStatus: "Approved",
    deliveryStatus: "Delivered",
    clientDeliveryDate: "Jun 4, 2025",
    reviewDueDate: "Jun 3, 2025",
    amNotes: "Looks great. Client will be pleased with the Core Web Vitals improvement.",
    reportOwner: "Mia K.",
    qaApprovedDate: "Jun 2, 2025",
    deliveryMethod: "Email",
    priority: "Normal",
    feedbackRequired: false,
  },
  {
    id: "am-005",
    report: "Metro Dental — Monthly LSA",
    client: "Metro Dental",
    reportType: "Client Report",
    period: "May 2025",
    am: "Sarah M.",
    reviewStatus: "Revision Requested",
    deliveryStatus: "Not Ready",
    clientDeliveryDate: "Jun 12, 2025",
    reviewDueDate: "Jun 10, 2025",
    amNotes: "Fix LSA numbers — cost per lead is showing $42 but should be $38 based on last invoice. Need reporting team to reconcile.",
    reportOwner: "Jake T.",
    qaApprovedDate: "—",
    deliveryMethod: "Client Portal",
    priority: "High",
    feedbackRequired: true,
  },
  {
    id: "am-006",
    report: "Prestige Auto — Monthly Google Ads",
    client: "Prestige Auto",
    reportType: "Client Report",
    period: "May 2025",
    am: "Dana W.",
    reviewStatus: "Pending AM Review",
    deliveryStatus: "Not Ready",
    clientDeliveryDate: "Jun 11, 2025",
    reviewDueDate: "Jun 10, 2025",
    amNotes: "",
    reportOwner: "Leo S.",
    qaApprovedDate: "—",
    deliveryMethod: "Email",
    priority: "Normal",
    feedbackRequired: false,
  },
  {
    id: "am-007",
    report: "Urban Dental — Monthly Content",
    client: "Urban Dental",
    reportType: "Client Report",
    period: "May 2025",
    am: "Sarah M.",
    reviewStatus: "Revision Requested",
    deliveryStatus: "Not Ready",
    clientDeliveryDate: "Jun 13, 2025",
    reviewDueDate: "Jun 12, 2025",
    amNotes: "Need updated blog links and confirmation of May 30 publish date. Client asked us specifically about this last call.",
    reportOwner: "Jake T.",
    qaApprovedDate: "—",
    deliveryMethod: "Email + Portal",
    priority: "Normal",
    feedbackRequired: true,
  },
  {
    id: "am-008",
    report: "Coastal Plumbing — Monthly Yelp",
    client: "Coastal Plumbing",
    reportType: "Client Report",
    period: "May 2025",
    am: "Chris L.",
    reviewStatus: "Approved",
    deliveryStatus: "Delivered",
    clientDeliveryDate: "Jun 1, 2025",
    reviewDueDate: "May 31, 2025",
    amNotes: "Simple report. Approved.",
    reportOwner: "Mia K.",
    qaApprovedDate: "May 30, 2025",
    deliveryMethod: "Client Portal",
    priority: "Low",
    feedbackRequired: false,
  },
  {
    id: "am-009",
    report: "Pacific Dental — QBR Q2",
    client: "Pacific Dental",
    reportType: "QBR Report",
    period: "Q2 2025",
    am: "Chris L.",
    reviewStatus: "Pending AM Review",
    deliveryStatus: "Scheduled",
    clientDeliveryDate: "Jun 30, 2025",
    reviewDueDate: "Jun 27, 2025",
    amNotes: "",
    reportOwner: "Mia K.",
    qaApprovedDate: "—",
    deliveryMethod: "In-Person Presentation",
    priority: "High",
    feedbackRequired: false,
  },
  {
    id: "am-010",
    report: "Metro Dental — Renewal Report",
    client: "Metro Dental",
    reportType: "Renewal Report",
    period: "Jun 2025",
    am: "Sarah M.",
    reviewStatus: "In Review",
    deliveryStatus: "Scheduled",
    clientDeliveryDate: "Jun 16, 2025",
    reviewDueDate: "Jun 14, 2025",
    amNotes: "This is a renewal risk account. I want to personally review the health score section before we send.",
    reportOwner: "Jake T.",
    qaApprovedDate: "Jun 8, 2025",
    deliveryMethod: "Email + Call",
    priority: "High",
    feedbackRequired: true,
  },
  {
    id: "am-011",
    report: "Harbor Auto — Monthly GBP",
    client: "Harbor Auto",
    reportType: "Client Report",
    period: "May 2025",
    am: "Tom R.",
    reviewStatus: "Pending AM Review",
    deliveryStatus: "Not Ready",
    clientDeliveryDate: "Jun 10, 2025",
    reviewDueDate: "Jun 9, 2025",
    amNotes: "",
    reportOwner: "Nina P.",
    qaApprovedDate: "—",
    deliveryMethod: "Email",
    priority: "Normal",
    feedbackRequired: false,
  },
];

const reviewStatusVariant: Record<AMReviewStatus, "success" | "warning" | "error" | "info" | "pending" | "neutral"> = {
  "Pending AM Review": "neutral",
  "In Review":         "info",
  "Approved":          "success",
  "Revision Requested":"warning",
  "Escalated":         "error",
};

const deliveryStatusVariant: Record<DeliveryStatus, "success" | "warning" | "error" | "info" | "pending" | "neutral"> = {
  "Not Ready":         "neutral",
  "Ready to Deliver":  "pending",
  "Scheduled":         "info",
  "Delivered":         "success",
  "Feedback Received": "success",
  "Follow-Up Needed":  "warning",
};

const amColors: Record<string, { bg: string; color: string }> = {
  "Sarah M.": { bg: "#F5F3FF", color: "#6D28D9" },
  "Chris L.": { bg: "#EFF6FF", color: "#1D4ED8" },
  "Tom R.":   { bg: "#FFF7ED", color: "#C2410C" },
  "Dana W.":  { bg: "#ECFDF5", color: "#065F46" },
};

const AMS = ["All", "Sarah M.", "Chris L.", "Tom R.", "Dana W."];

export default function AMReviewPage() {
  const [filterAM, setFilterAM] = useState("All");
  const [filterStatus, setFilterStatus] = useState<AMReviewStatus | "All">("All");
  const [selectedItem, setSelectedItem] = useState<AMReviewItem | null>(null);

  const filtered = amReviewItems.filter((r) => {
    if (filterAM !== "All" && r.am !== filterAM) return false;
    if (filterStatus !== "All" && r.reviewStatus !== filterStatus) return false;
    return true;
  });

  const kpis = {
    total: amReviewItems.length,
    pendingReview: amReviewItems.filter((r) => r.reviewStatus === "Pending AM Review").length,
    inReview: amReviewItems.filter((r) => r.reviewStatus === "In Review").length,
    approved: amReviewItems.filter((r) => r.reviewStatus === "Approved").length,
    revision: amReviewItems.filter((r) => r.reviewStatus === "Revision Requested").length,
    delivered: amReviewItems.filter((r) => r.deliveryStatus === "Delivered").length,
    readyToDeliver: amReviewItems.filter((r) => r.deliveryStatus === "Ready to Deliver").length,
  };

  const amSummary = AMS.slice(1).map((am) => {
    const items = amReviewItems.filter((r) => r.am === am);
    return {
      am,
      total: items.length,
      pending: items.filter((r) => r.reviewStatus === "Pending AM Review" || r.reviewStatus === "In Review").length,
      approved: items.filter((r) => r.reviewStatus === "Approved").length,
      revision: items.filter((r) => r.reviewStatus === "Revision Requested").length,
    };
  });

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        workspace={workspace}
        subtitle="AM review queue — track account manager sign-off and client delivery scheduling for all approved reports."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total AM Reviews" value={String(kpis.total)} subtitle="This cycle" iconBg="#EFF6FF" iconColor="#1D4ED8" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
        <KpiCard title="Pending Review" value={String(kpis.pendingReview)} subtitle="Awaiting AM action" iconBg="#F8FAFC" iconColor="#64748B" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Revision Requested" value={String(kpis.revision)} subtitle="Needs correction" iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} />
        <KpiCard title="Delivered" value={String(kpis.delivered)} subtitle="Sent to client" iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={filterAM} onChange={(e) => setFilterAM(e.target.value)} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}>
          {AMS.map((a) => <option key={a}>{a}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as AMReviewStatus | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}>
          {(["All", "Pending AM Review", "In Review", "Approved", "Revision Requested", "Escalated"] as Array<AMReviewStatus | "All">).map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{filtered.length} items</span>
        <button className="ml-auto text-xs font-semibold px-4 py-2 rounded-lg border" style={{ color: "#2563EB", background: "#2563EB15", borderColor: "#2563EB40" }}>Notify All AMs</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* AM Review Table */}
        <div className="xl:col-span-2">
          <SectionWrapper title="AM Review Queue" description="Reports awaiting account manager review, approval, and client delivery scheduling">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Report", "Client", "AM Owner", "Review Status", "Delivery Status", "Client Delivery Date", "Delivery Method", "AM Notes"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const amStyle = amColors[row.am] ?? { bg: "#F8FAFC", color: "#475569" };
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
                          <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{row.reportType} — {row.period}</div>
                        </td>
                        <td className="py-2.5 px-3 text-xs font-medium whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.client}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: amStyle.bg, color: amStyle.color }}>{row.am}</span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusBadge variant={reviewStatusVariant[row.reviewStatus]} label={row.reviewStatus} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusBadge variant={deliveryStatusVariant[row.deliveryStatus]} label={row.deliveryStatus} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-xs whitespace-nowrap font-medium" style={{ color: "var(--rtm-text-secondary)" }}>{row.clientDeliveryDate}</td>
                        <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{row.deliveryMethod}</td>
                        <td className="py-2.5 px-3 text-xs max-w-xs" style={{ color: "var(--rtm-text-muted)" }}>{row.amNotes || "—"}</td>
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
            <SectionWrapper title="Review Details" description={selectedItem.client}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{selectedItem.report}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{selectedItem.client} — {selectedItem.period}</div>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="text-sm px-1.5" style={{ color: "var(--rtm-text-muted)" }}>✕</button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <StatusBadge variant={reviewStatusVariant[selectedItem.reviewStatus]} label={selectedItem.reviewStatus} size="sm" />
                  <StatusBadge variant={deliveryStatusVariant[selectedItem.deliveryStatus]} label={selectedItem.deliveryStatus} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "AM Owner", value: selectedItem.am },
                    { label: "Report Owner", value: selectedItem.reportOwner },
                    { label: "Review Due", value: selectedItem.reviewDueDate },
                    { label: "Delivery Date", value: selectedItem.clientDeliveryDate },
                    { label: "QA Approved", value: selectedItem.qaApprovedDate },
                    { label: "Delivery Method", value: selectedItem.deliveryMethod },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg p-2.5" style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}>
                      <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</div>
                      <div className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {selectedItem.amNotes && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--rtm-text-muted)" }}>AM Notes</div>
                    <div className="text-xs p-3 rounded-lg" style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E" }}>{selectedItem.amNotes}</div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedItem.reviewStatus !== "Approved" && (
                    <button className="text-xs font-semibold px-3 py-2 rounded-lg border" style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}>AM Approve</button>
                  )}
                  <button className="text-xs font-semibold px-3 py-2 rounded-lg border" style={{ color: "#D97706", background: "#D9770615", borderColor: "#D9770640" }}>Request Revision</button>
                  {selectedItem.reviewStatus === "Approved" && selectedItem.deliveryStatus !== "Delivered" && (
                    <button className="text-xs font-semibold px-3 py-2 rounded-lg border" style={{ color: "#2563EB", background: "#2563EB15", borderColor: "#2563EB40" }}>Schedule Delivery</button>
                  )}
                  {selectedItem.deliveryStatus === "Ready to Deliver" && (
                    <button className="text-xs font-semibold px-3 py-2 rounded-lg border" style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}>Send to Client</button>
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
