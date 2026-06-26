"use client";

import { useState } from "react";
import Link from "next/link";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("account-management")!;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const kpiCards = [
  { label: "Reports Due This Week",            value: 7,  color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"},
  { label: "Reports Overdue",                  value: 3,  color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200"},
  { label: "Reports In QA",                    value: 4,  color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200"},
  { label: "Reports Ready To Send",            value: 2,  color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200"},
  { label: "Reports Sent This Month",          value: 11, color: "text-teal-700",   bg: "bg-teal-50",   border: "border-teal-200"},
  { label: "Clients Missing Reports",          value: 2,  color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200"},
  { label: "Reports Waiting For Dept Input",   value: 5,  color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200"},
  { label: "Reports Needing AM Review",        value: 4,  color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200"},
];

const clientReports = [
  {
    client: "Apex Roofing",        am: "Jordan M.", reportType: "Monthly Summary",  period: "Dec 2024", owner: "Jordan M.", deptSource: "SEO / Paid Media",  reportStatus: "Drafting",       qaStatus: "Pending",      amReview: "Not Started", clientApproval: "Not Started", lastSent: "Nov 5, 2024",  nextDue: "Jan 20, 2025", nextAction: "Complete Draft",
  },
  {
    client: "Pacific Dental",      am: "Jordan M.", reportType: "Monthly Summary",  period: "Dec 2024", owner: "Sarah K.",  deptSource: "SEO / GBP",         reportStatus: "QA Review",      qaStatus: "In Review",    amReview: "Not Started", clientApproval: "Not Started", lastSent: "Nov 8, 2024",  nextDue: "Jan 22, 2025", nextAction: "Finish QA",
  },
  {
    client: "Sunbelt HVAC",        am: "Sarah K.",  reportType: "Monthly Summary",  period: "Dec 2024", owner: "Sarah K.",  deptSource: "Paid Advertising",  reportStatus: "Overdue",        qaStatus: "Not Started",  amReview: "Not Started", clientApproval: "Not Started", lastSent: "Oct 15, 2024", nextDue: "Jan 10, 2025", nextAction: "Escalate — Overdue",
  },
  {
    client: "Harbor Auto Group",   am: "Mike T.",   reportType: "Quarterly Review", period: "Q4 2024",  owner: "Mike T.",   deptSource: "Google Ads / LSA",  reportStatus: "AM Review",      qaStatus: "Approved",     amReview: "Pending",     clientApproval: "Not Started", lastSent: "Oct 10, 2024", nextDue: "Jan 25, 2025", nextAction: "AM Review Required",
  },
  {
    client: "Metro Dental",        am: "Sarah K.",  reportType: "Monthly Summary",  period: "Dec 2024", owner: "Alex R.",   deptSource: "SEO / Content",     reportStatus: "Ready To Send",  qaStatus: "Approved",     amReview: "Approved",    clientApproval: "Not Started", lastSent: "Dec 5, 2024",  nextDue: "Jan 18, 2025", nextAction: "Send To Client",
  },
  {
    client: "Summit Landscaping",  am: "Jordan M.", reportType: "Monthly Summary",  period: "Dec 2024", owner: "Jordan M.", deptSource: "GBP / Content",     reportStatus: "Sent",           qaStatus: "Approved",     amReview: "Approved",    clientApproval: "Received",    lastSent: "Jan 5, 2025",  nextDue: "Feb 5, 2025",  nextAction: "Schedule Q1 Report",
  },
  {
    client: "Green Valley Pools",  am: "Alex R.",   reportType: "Monthly Summary",  period: "Dec 2024", owner: "Alex R.",   deptSource: "Meta Ads",          reportStatus: "Dept Input",     qaStatus: "Not Started",  amReview: "Not Started", clientApproval: "Not Started", lastSent: "Nov 20, 2024", nextDue: "Jan 15, 2025", nextAction: "Chase Meta Ads Input",
  },
  {
    client: "Blue Ridge Plumbing", am: "Alex R.",   reportType: "Monthly Summary",  period: "Dec 2024", owner: "Alex R.",   deptSource: "Web Dev / SEO",     reportStatus: "Data Gathering", qaStatus: "Not Started",  amReview: "Not Started", clientApproval: "Not Started", lastSent: "Nov 12, 2024", nextDue: "Jan 20, 2025", nextAction: "Gather Data",
  },
];

const pipelineStages = [
  { stage: "Data Gathering",    count: 2, color: "bg-slate-100 text-slate-700 border-slate-200"},
  { stage: "Department Input",  count: 3, color: "bg-amber-100 text-amber-700 border-amber-200"},
  { stage: "Drafting",          count: 2, color: "bg-blue-100 text-blue-700 border-blue-200"},
  { stage: "QA Review",         count: 2, color: "bg-violet-100 text-violet-700 border-violet-200"},
  { stage: "AM Review",         count: 1, color: "bg-indigo-100 text-indigo-700 border-indigo-200"},
  { stage: "Ready To Send",     count: 2, color: "bg-teal-100 text-teal-700 border-teal-200"},
  { stage: "Sent",              count: 4, color: "bg-green-100 text-green-700 border-green-200"},
  { stage: "Client Feedback",   count: 1, color: "bg-pink-100 text-pink-700 border-pink-200"},
];

const deptInputs = [
  { dept: "SEO",               client: "Apex Roofing",       input: "Rankings snapshot + traffic report", owner: "Sarah K.",  due: "Jan 17", status: "In Progress", blocker: "—"},
  { dept: "GBP",               client: "Pacific Dental",     input: "GBP insights export",                owner: "Mike T.",   due: "Jan 16", status: "Done",        blocker: "—"},
  { dept: "Yelp",              client: "Harbor Auto Group",  input: "Yelp review summary",                owner: "Alex R.",   due: "Jan 18", status: "Pending",     blocker: "Platform access issue"},
  { dept: "Paid Advertising",  client: "Sunbelt HVAC",       input: "Ad spend + conversion data",         owner: "Jordan M.", due: "Jan 10", status: "Overdue",     blocker: "Missing GA4 access"},
  { dept: "Meta Ads",          client: "Green Valley Pools", input: "Campaign performance data",          owner: "Sarah K.",  due: "Jan 14", status: "Pending",     blocker: "Client ad account access"},
  { dept: "Google Ads",        client: "Harbor Auto Group",  input: "Campaign report export",             owner: "Mike T.",   due: "Jan 17", status: "In Progress", blocker: "—"},
  { dept: "LSA",               client: "Apex Roofing",       input: "Lead data + verification status",    owner: "Alex R.",   due: "Jan 18", status: "Pending",     blocker: "—"},
  { dept: "Content",           client: "Summit Landscaping", input: "Published articles list",            owner: "Sarah K.",  due: "Jan 15", status: "Done",        blocker: "—"},
  { dept: "Web Development",   client: "Blue Ridge Plumbing", input: "Site changes summary",              owner: "Mike T.",   due: "Jan 19", status: "Pending",     blocker: "Staging site still live"},
  { dept: "Billing",           client: "Metro Dental",       input: "Invoice reconciliation",             owner: "Alex R.",   due: "Jan 14", status: "Done",        blocker: "—"},
];

const amReviewQueue = [
  { client: "Harbor Auto Group",  report: "Q4 Quarterly Review",   am: "Mike T.",   due: "Jan 25", qaStatus: "Approved",  amStatus: "Pending"},
  { client: "Pacific Dental",     report: "Dec Monthly Summary",   am: "Jordan M.", due: "Jan 22", qaStatus: "In Review", amStatus: "Not Started"},
  { client: "Apex Roofing",       report: "Dec Monthly Summary",   am: "Jordan M.", due: "Jan 20", qaStatus: "Pending",   amStatus: "Not Started"},
  { client: "Green Valley Pools", report: "Dec Monthly Summary",   am: "Alex R.",   due: "Jan 15", qaStatus: "Not Started", amStatus: "Not Started"},
];

const reportingRisks = [
  { risk: "Overdue Report",              client: "Sunbelt HVAC",       detail: "Report is 10 days past due date. No dept input received.",       severity: "Critical"},
  { risk: "Missing Department Input",    client: "Green Valley Pools", detail: "Meta Ads input not submitted. Client ad account access blocked.", severity: "High"},
  { risk: "Data Issue Blocker",          client: "Yelp — Harbor Auto", detail: "Yelp platform access issue preventing data pull.",                severity: "Medium"},
  { risk: "AM Review Overdue",           client: "Harbor Auto Group",  detail: "AM review pending 5 days. Client expects report by Jan 25.",      severity: "High"},
  { risk: "Repeated Late Reports",       client: "Sunbelt HVAC",       detail: "3rd consecutive month with late delivery. Client flagged.",        severity: "Critical"},
  { risk: "Paid Ads Input Overdue",      client: "Sunbelt HVAC",       detail: "GA4 access issue — Paid Advertising dept blocked.",               severity: "High"},
];

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
              {["Jordan M.", "Sarah K.", "Mike T.", "Alex R."].map((am) => <option key={am}>{am}</option>)}
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
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{d.client}</td>
                  <td className="px-4 py-3 text-slate-600">{d.input}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{d.owner}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{d.due}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" style={statusStyle(d.status)}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{d.blocker}</td>
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
          {reportingRisks.map((r, i) => (
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
