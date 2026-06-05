"use client";

import { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { allClientReports } from "@/lib/reporting/mock-data";
import type { ReportStatus, ClientReport } from "@/lib/reporting/types";

function statusVariant(s: ReportStatus): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Sent":
    case "Approved": return "success";
    case "Overdue":
    case "Needs Revision": return "error";
    case "QA In Progress":
    case "Ready for QA": return "warning";
    case "Ready to Send": return "info";
    default: return "pending";
  }
}

function qaVariant(s: ClientReport["qaStatus"]): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Approved": return "success";
    case "Failed": return "error";
    case "In Review": return "warning";
    case "In Queue": return "info";
    default: return "pending";
  }
}

function sendVariant(s: ClientReport["sendStatus"]): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Sent": return "success";
    case "Bounced": return "error";
    case "Scheduled": return "info";
    default: return "pending";
  }
}

export default function AllReportsPage() {
  const [filterDept, setFilterDept]     = useState("All");
  const [filterClient, setFilterClient] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const depts   = ["All", "SEO", "GBP", "Yelp", "Paid Advertising", "LSA"];
  const clients = ["All", ...Array.from(new Set(allClientReports.map((r) => r.client)))];
  const statuses: ("All" | ReportStatus)[] = ["All", "Draft", "In Progress", "Ready for QA", "QA In Progress", "Approved", "Ready to Send", "Sent", "Needs Revision", "Overdue"];

  const filtered = allClientReports.filter((r) => {
    if (filterDept   !== "All" && r.dept   !== filterDept)   return false;
    if (filterClient !== "All" && r.client !== filterClient) return false;
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    return true;
  });

  const kpi = {
    total:     allClientReports.length,
    inProgress:allClientReports.filter((r) => r.status === "In Progress" || r.status === "Draft").length,
    readyQA:   allClientReports.filter((r) => r.status === "Ready for QA").length,
    sent:      allClientReports.filter((r) => r.status === "Sent").length,
    overdue:   allClientReports.filter((r) => r.status === "Overdue").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>All Client Reports</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
          Complete view of all client reports across all departments — source, status, QA, and delivery.
        </p>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard title="Total Reports" value={String(kpi.total)} iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        <KpiCard title="In Progress" value={String(kpi.inProgress)} iconBg="#EFF6FF" iconColor="#2563EB" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
        <KpiCard title="Ready for QA" value={String(kpi.readyQA)} iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
        <KpiCard title="Sent" value={String(kpi.sent)} trend="up" trendValue="11" iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
        <KpiCard title="Overdue" value={String(kpi.overdue)} trend="up" trendValue="1" iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </div>

      {/* ── Table ── */}
      <SectionWrapper title="Client Report Register" description="All client reports with full status detail">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={filterDept}   onChange={(e) => setFilterDept(e.target.value)}   className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none" style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}>
            {depts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none" style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}>
            {clients.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none" style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                {["Client", "Dept Source", "Report Type", "Period", "Owner", "Status", "QA Status", "Send Status", "Due Date", "Last Updated", "Next Action"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{r.client}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: "#F1F5F9", color: "var(--rtm-text-secondary)" }}>{r.dept}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{r.reportType}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{r.reportingPeriod}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{r.owner}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge variant={statusVariant(r.status)} label={r.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge variant={qaVariant(r.qaStatus)} label={r.qaStatus} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge variant={sendVariant(r.sendStatus)} label={r.sendStatus} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>{r.dueDate}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>{r.lastUpdated}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{r.nextAction}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    No reports match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionWrapper>
    </div>
  );
}
