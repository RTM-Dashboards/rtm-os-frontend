"use client";

import { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import type { ClientReport, ReportStatus } from "@/lib/reporting/types";

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

interface KPISummary {
  title: string;
  value: string | number;
  trend?: "up" | "down";
  trendValue?: string;
  iconBg: string;
  iconColor: string;
}

interface Props {
  title: string;
  description: string;
  accent: string;
  dept: string;
  reports: ClientReport[];
  kpis: KPISummary[];
  deptSourceHref: string;
  kpiSections?: React.ReactNode;
}

const QUICK_ACTIONS = [
  { label: "Generate Report" },
  { label: "Preview Report" },
  { label: "Submit for QA" },
  { label: "Mark Ready to Send" },
  { label: "Send Report" },
  { label: "Export PDF" },
  { label: "Export CSV",      icon: "" },
];

export default function ReportingWorkspaceDeptPage({
  title,
  description,
  accent,
  dept,
  reports,
  kpis,
  deptSourceHref,
  kpiSections,
}: Props) {
  const [selectedClient, setSelectedClient] = useState("All");

  const clients = ["All", ...Array.from(new Set(reports.map((r) => r.client)))];
  const filtered = reports.filter((r) => selectedClient === "All" || r.client === selectedClient);

  const stats = {
    total:     reports.length,
    sent:      reports.filter((r) => r.status === "Sent").length,
    overdue:   reports.filter((r) => r.status === "Overdue").length,
    readyForQA:reports.filter((r) => r.status === "Ready for QA").length,
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: `${accent}15`, color: accent }}>
              Reporting Workspace
            </span>
            <Link href={deptSourceHref} className="text-xs hover:underline" style={{ color: "var(--rtm-text-muted)" }}>
              ← {dept} Department Source
            </Link>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>{title}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>{description}</p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard
            key={k.title}
            title={k.title}
            value={String(k.value)}
            trend={k.trend}
            trendValue={k.trendValue}
            iconBg={k.iconBg}
            iconColor={k.iconColor}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
        ))}
      </div>

      {/* ── Dept KPI Sections ── */}
      {kpiSections}

      {/* ── Report Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",        value: stats.total,      color: "#6366F1" },
          { label: "Sent",         value: stats.sent,       color: "#059669" },
          { label: "Ready for QA", value: stats.readyForQA, color: "#D97706" },
          { label: "Overdue",      value: stats.overdue,    color: "#DC2626" },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-xl border text-center" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <SectionWrapper title="Quick Actions" description="Report workflow actions">
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all hover:shadow-sm"
              style={{ background: `${accent}08`, borderColor: `${accent}30`, color: accent }}
              onMouseEnter={(e) => (e.currentTarget.style.background = `${accent}18`)}
              onMouseLeave={(e) => (e.currentTarget.style.background = `${accent}08`)}
            >
              <span>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Report Table ── */}
      <SectionWrapper title={`${dept} Client Reports`} description="All clients — QA and delivery status">
        {/* Filter */}
        <div className="flex gap-3 mb-4">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none"
            style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}
          >
            {clients.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                {["Client", "Report Type", "Period", "Owner", "Status", "QA Status", "Send Status", "Due Date", "Last Updated", "Next Action"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{r.client}</td>
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
                  <td colSpan={10} className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Source connection ── */}
      <div className="p-4 rounded-xl border" style={{ background: `${accent}06`, borderColor: `${accent}25` }}>
        <p className="text-sm font-semibold mb-1" style={{ color: accent }}>Report Source</p>
        <p className="text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          This {dept} report data originates from the {dept} department team. Visit the department source to manage individual report submissions.
        </p>
        <Link href={deptSourceHref} className="text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors hover:opacity-80" style={{ background: accent, color: "#fff" }}>
          Go to {dept} Department Reports →
        </Link>
      </div>
    </div>
  );
}
