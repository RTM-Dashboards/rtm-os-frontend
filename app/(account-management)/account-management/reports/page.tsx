"use client";

import { useState } from "react";
import Link from "next/link";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("account-management")!;

// ─── Mock Data ────────────────────────────────────────────────────────────────

// Report KPIs: not yet connected to a real data source.
const kpiCards = [
  { label: "Reports Due This Week",          value: "—", color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"},
  { label: "Reports Overdue",                value: "—", color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200"},
  { label: "Reports In QA",                  value: "—", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200"},
  { label: "Reports Ready To Send",          value: "—", color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200"},
  { label: "Reports Sent This Month",        value: "—", color: "text-teal-700",   bg: "bg-teal-50",   border: "border-teal-200"},
  { label: "Clients Missing Reports",        value: "—", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200"},
  { label: "Reports Waiting For Dept Input", value: "—", color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200"},
  { label: "Reports Needing AM Review",      value: "—", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200"},
];

// Client reports: not yet connected to a real data source.
const clientReports: {
  client: string; am: string; reportType: string; period: string;
  owner: string; deptSource: string; reportStatus: string; qaStatus: string;
  amReview: string; clientApproval: string; lastSent: string; nextDue: string; nextAction: string;
}[] = [];

// Pipeline stages: will be computed from real report records when wired.
const pipelineStages: { stage: string; count: number; color: string }[] = [];

// Department inputs: not yet connected to a real data source.
const deptInputs: { dept: string; waitingOn: string; contact: string; dueDate: string; status: string }[] = [];

// AM review queue: not yet connected to a real data source.
const amReviewQueue: { client: string; report: string; am: string; due: string; qaStatus: string; amStatus: string }[] = [];

const reportRisks: { risk: string; client: string; detail: string; severity: string }[] = [];

const severityStyle = (s: string) => {
  if (s === "Critical") return { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
  if (s === "High")     return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
  return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
};

const statusStyle = (s: string) => {
  if (s === "Done"|| s === "Sent"|| s === "Approved"|| s === "Ready To Send") return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
  if (s === "In Progress"|| s === "In Review"|| s === "Drafting")             return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
  if (s === "Overdue"|| s === "Critical")                                       return { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
  if (s === "Pending"|| s === "QA Review"|| s === "AM Review")               return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
  if (s === "Dept Input"|| s === "Department Input"|| s === "Data Gathering") return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountReportsPage() {
  const [filterAM, setFilterAM] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredReports = clientReports.filter((r) => {
    if (filterAM !== "All"&& r.am !== filterAM) return false;
    if (filterStatus !== "All"&& r.reportStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
          Account Management Reports
        </h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
          Reporting command center — visibility into every report, status, risk, and owner across all clients.
        </p>
      </div>

      {/* ── Section 1 — Report KPI Cards ─────────────────────────────────────── */}
      <section aria-label="Report KPI Cards">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3 text-slate-400">Report KPIs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpiCards.map(({ label, value, color, bg, border }) => (
            <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2 — Client Reports Table ─────────────────────────────────── */}
      <section aria-label="Client Reports Table"className="rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Client Reports Table</h2>
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Report status, ownership, QA, and client approval across all accounts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterAM} onChange={(e) => setFilterAM(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All AMs</option>
              {([] as string[]).map((am) => <option key={am}>{am}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All Statuses</option>
              {["Data Gathering", "Dept Input", "Drafting", "QA Review", "AM Review", "Ready To Send", "Sent", "Overdue"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead style={{ background: "var(--rtm-bg)" }}>
              <tr>
                {["Client", "Account Manager", "Report Type", "Reporting Period", "Report Owner", "Dept Source", "Report Status", "QA Status", "AM Review", "Client Approval", "Last Report Sent", "Next Report Due", "Next Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r) => (
                <tr key={r.client} className="border-t transition-colors" style={{ borderColor: "var(--rtm-border-light)" }}>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{r.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.am}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.reportType}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.period}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.owner}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.deptSource}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" style={statusStyle(r.reportStatus)}>{r.reportStatus}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" style={statusStyle(r.qaStatus)}>{r.qaStatus}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" style={statusStyle(r.amReview)}>{r.amReview}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" style={statusStyle(r.clientApproval)}>{r.clientApproval}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{r.lastSent}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-blue-700">{r.nextDue}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.nextAction}</td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr><td colSpan={13} className="px-4 py-8 text-center text-slate-400">No reports match filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">{filteredReports.length} of {clientReports.length} reports shown</p>
        </div>
      </section>

      {/* ── Section 3 — Report Status Pipeline ───────────────────────────────── */}
      <section aria-label="Report Status Pipeline">
        <div className="rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Report Status Pipeline</h2>
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Reports across every stage from data collection through client delivery.</p>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {pipelineStages.map(({ stage, count, color }) => (
              <div key={stage} className={`rounded-xl border p-3 text-center ${color}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1">{stage}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4 — Department Report Inputs ─────────────────────────────── */}
      <section aria-label="Department Report Inputs"className="rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
          <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Department Report Inputs</h2>
          <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Track input needed from each department for pending reports.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead style={{ background: "var(--rtm-bg)" }}>
              <tr>
                {["Department", "Client", "Input Needed", "Owner", "Due Date", "Status", "Blocker"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptInputs.map((d, i) => (
                <tr key={i} className="border-t transition-colors" style={{ borderColor: "var(--rtm-border-light)" }}>
                  <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">{d.dept}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{d.waitingOn}</td>
                  <td className="px-4 py-3 text-slate-600">{d.waitingOn}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{d.contact}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{d.dueDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold" style={statusStyle(d.status)}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 5 — AM Report Review Queue ───────────────────────────────── */}
      <section aria-label="AM Report Review Queue"className="rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
          <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>AM Report Review Queue</h2>
          <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Reports requiring Account Manager review before client delivery.</p>
        </div>
        <div className="space-y-3 p-5">
          {amReviewQueue.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{item.client}</p>
                  <p className="text-xs text-slate-500">{item.report} · Assigned AM: {item.am} · Due: {item.due}</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" style={statusStyle(item.qaStatus)}>QA: {item.qaStatus}</span>
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" style={statusStyle(item.amStatus)}>AM: {item.amStatus}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Review Report",    bg: "bg-blue-600 hover:bg-blue-700"},
                  { label: "Request Revision", bg: "bg-amber-500 hover:bg-amber-600"},
                  { label: "Approve Report",   bg: "bg-green-600 hover:bg-green-700"},
                  { label: "Send To Client",   bg: "bg-teal-600 hover:bg-teal-700"},
                  { label: "Add AM Notes",     bg: "bg-slate-600 hover:bg-slate-700"},
                ].map(({ label, bg }) => (
                  <button key={label} className={`${bg} rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 6 — Reporting Risk Center ────────────────────────────────── */}
      <section aria-label="Reporting Risk Center"className="rounded-2xl border border-red-200 bg-red-50 shadow-sm">
        <div className="border-b border-red-100 px-6 py-4">
          <h2 className="text-lg font-bold text-red-800">Reporting Risk Center</h2>
          <p className="text-sm text-red-600">Reports and clients with active risks requiring immediate attention.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {reportRisks.map((r, i) => (
            <div key={i} className="rounded-xl border bg-white p-4 border-slate-200">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-bold text-slate-800">{r.risk}</p>
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold" style={severityStyle(r.severity)}>{r.severity}</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-1">{r.client}</p>
              <p className="text-xs text-slate-600">{r.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 7 — Report Action Center ─────────────────────────────────── */}
      <section aria-label="Report Action Center"className="rounded-xl border px-6 py-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Report Action Center</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Generate Report",            bg: "bg-blue-600 hover:bg-blue-700"},
            { label: "Request Department Input",   bg: "bg-amber-500 hover:bg-amber-600"},
            { label: "Submit For QA",              bg: "bg-violet-600 hover:bg-violet-700"},
            { label: "Approve Report",             bg: "bg-green-600 hover:bg-green-700"},
            { label: "Send Report",                bg: "bg-teal-600 hover:bg-teal-700"},
            { label: "Create Follow-up Task",      bg: "bg-slate-600 hover:bg-slate-700"},
            { label: "Escalate Report Delay",      bg: "bg-red-600 hover:bg-red-700"},
          ].map(({ label, bg }) => (
            <button key={label} className={`${bg} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Footer Nav ───────────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href={workspace.tasksRoute}     className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
