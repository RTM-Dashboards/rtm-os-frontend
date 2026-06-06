"use client";

import { useState } from "react";
import { RoleToggle } from "@/components/am-role-toggle";
import {
  ALL_HEALTH,
  AM_NAMES,
  SARAH,
  type AMRole,
} from "@/lib/am-role-mock-data";

// ── Reporting Health Mock Data ────────────────────────────────────────────────

const reportingHealthData = [
  {
    id: "rh-1",
    client: "Apex Roofing",
    assignedAM: "Jordan M.",
    lastReportSent: "Nov 5, 2024",
    nextReportDue: "Jan 20, 2025",
    reportStatus: "Drafting",
    qaStatus: "Pending",
    amReviewStatus: "Not Started",
    reportingRisk: "Low",
    healthImpact: "None — on schedule",
  },
  {
    id: "rh-2",
    client: "Pacific Dental",
    assignedAM: "Jordan M.",
    lastReportSent: "Nov 8, 2024",
    nextReportDue: "Jan 22, 2025",
    reportStatus: "QA Review",
    qaStatus: "In Review",
    amReviewStatus: "Not Started",
    reportingRisk: "Low",
    healthImpact: "None — progressing normally",
  },
  {
    id: "rh-3",
    client: "Sunbelt HVAC",
    assignedAM: "Sarah K.",
    lastReportSent: "Oct 15, 2024",
    nextReportDue: "Jan 10, 2025",
    reportStatus: "Overdue",
    qaStatus: "Not Started",
    amReviewStatus: "Not Started",
    reportingRisk: "Critical",
    healthImpact: "Report overdue — client health score reduced by 12 points",
  },
  {
    id: "rh-4",
    client: "Harbor Auto Group",
    assignedAM: "Mike T.",
    lastReportSent: "Oct 10, 2024",
    nextReportDue: "Jan 25, 2025",
    reportStatus: "AM Review",
    qaStatus: "Approved",
    amReviewStatus: "Pending",
    reportingRisk: "Medium",
    healthImpact: "AM review overdue creates client communication risk",
  },
  {
    id: "rh-5",
    client: "Metro Dental",
    assignedAM: "Sarah K.",
    lastReportSent: "Dec 5, 2024",
    nextReportDue: "Jan 18, 2025",
    reportStatus: "Ready To Send",
    qaStatus: "Approved",
    amReviewStatus: "Approved",
    reportingRisk: "None",
    healthImpact: "None — report ready",
  },
  {
    id: "rh-6",
    client: "Green Valley Pools",
    assignedAM: "Alex R.",
    lastReportSent: "Nov 20, 2024",
    nextReportDue: "Jan 15, 2025",
    reportStatus: "Dept Input",
    qaStatus: "Not Started",
    amReviewStatus: "Not Started",
    reportingRisk: "High",
    healthImpact: "Missing Meta Ads input creates reporting risk — client communication delayed",
  },
];

const riskBadge = (risk: string) => {
  if (risk === "Critical") return "bg-red-100 text-red-700 border border-red-200";
  if (risk === "High")     return "bg-orange-100 text-orange-700 border border-orange-200";
  if (risk === "Medium")   return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  if (risk === "Low")      return "bg-blue-100 text-blue-700 border border-blue-200";
  return "bg-green-100 text-green-700 border border-green-200";
};

const reportStatusBadge = (s: string) => {
  if (s === "Overdue")        return "bg-red-100 text-red-700";
  if (s === "Dept Input")     return "bg-amber-100 text-amber-700";
  if (s === "AM Review" || s === "QA Review") return "bg-violet-100 text-violet-700";
  if (s === "Drafting")       return "bg-blue-100 text-blue-700";
  if (s === "Ready To Send")  return "bg-teal-100 text-teal-700";
  if (s === "Sent")           return "bg-green-100 text-green-700";
  return "bg-slate-100 text-slate-500";
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  switch (status) {
    case "Healthy": return "bg-green-100 text-green-700 border-green-200";
    case "Needs Attention": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "At Risk": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Critical": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

function scoreBadge(score: number) {
  if (score >= 80) return "bg-green-600 text-white";
  if (score >= 60) return "bg-yellow-500 text-white";
  if (score >= 40) return "bg-orange-500 text-white";
  return "bg-red-600 text-white";
}

function trendColor(t: string) {
  if (t.includes("Improving")) return "text-green-600";
  if (t.includes("Stable")) return "text-blue-600";
  return "text-red-600";
}

// ── Head View ─────────────────────────────────────────────────────────────────

function HeadView() {
  const [filterAM, setFilterAM] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = ALL_HEALTH.filter((h) => {
    if (filterAM !== "All" && h.assignedAM !== filterAM) return false;
    if (filterStatus !== "All" && h.status !== filterStatus) return false;
    return true;
  });

  const atRiskAll = ALL_HEALTH.filter((h) => h.status === "At Risk" || h.status === "Critical");

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Healthy Clients", value: ALL_HEALTH.filter((h) => h.status === "Healthy").length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
          { label: "Needs Attention", value: ALL_HEALTH.filter((h) => h.status === "Needs Attention").length, color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
          { label: "At Risk", value: ALL_HEALTH.filter((h) => h.status === "At Risk").length, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
          { label: "Critical", value: ALL_HEALTH.filter((h) => h.status === "Critical").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          { label: "Avg Health Score", value: Math.round(ALL_HEALTH.reduce((a, h) => a + h.healthScore, 0) / ALL_HEALTH.length), color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Total Clients Tracked", value: ALL_HEALTH.length, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "Overdue Check-ins", value: ALL_HEALTH.filter((h) => h.reportingStatus === "Overdue").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          { label: "Churn Risk Clients", value: ALL_HEALTH.filter((h) => h.status === "Critical" || h.status === "At Risk").length, color: "text-red-700", bg: "bg-rose-50", border: "border-rose-200" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Head Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Head Management Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Escalate Risk", color: "bg-red-600 hover:bg-red-700" },
            { label: "Assign Follow-up", color: "bg-orange-500 hover:bg-orange-600" },
            { label: "Compare AM Portfolio Health", color: "bg-indigo-600 hover:bg-indigo-700" },
            { label: "Review All Escalations", color: "bg-violet-600 hover:bg-violet-700" },
            { label: "Create Manager Note", color: "bg-slate-600 hover:bg-slate-700" },
            { label: "Export Health Report", color: "bg-slate-700 hover:bg-slate-800" },
          ].map(({ label, color }) => (
            <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* All Client Health Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Client Health Records</h2>
            <p className="text-sm text-slate-500">Full health record view across all Account Managers.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterAM} onChange={(e) => setFilterAM(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All AMs</option>
              {AM_NAMES.map((am) => <option key={am}>{am}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All Health Statuses</option>
              {["Healthy", "Needs Attention", "At Risk", "Critical"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Account Manager", "Score", "Payment", "Deliverables", "Reporting", "Trend", "Last Check-in", "Next Check-in", "Renewal", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.assignedAM}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreBadge(row.healthScore)}`}>{row.healthScore}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.paymentStatus}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.deliverableStatus}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.reportingStatus}</td>
                  <td className={`px-4 py-3 whitespace-nowrap font-medium text-xs ${trendColor(row.performanceTrend)}`}>{row.performanceTrend}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{row.lastCheckin}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{row.nextCheckin}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{row.renewal}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge(row.status)}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-slate-400">No records match filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">{filtered.length} of {ALL_HEALTH.length} health records shown</p>
        </div>
      </section>

      {/* All Escalations */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">All At-Risk &amp; Critical Clients</h2>
          <p className="text-sm text-slate-500">All escalations across the full AM team.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {atRiskAll.map((h) => (
            <div key={h.id} className={`rounded-xl border p-4 ${h.status === "Critical" ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{h.client}</p>
                  <p className="text-xs text-slate-500">AM: {h.assignedAM}</p>
                </div>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge(h.status)}`}>{h.status}</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Health Score</span>
                  <span className={`font-bold rounded-full px-2 py-0.5 ${scoreBadge(h.healthScore)}`}>{h.healthScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment</span>
                  <span className="font-semibold text-slate-700">{h.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Renewal</span>
                  <span className="font-semibold text-slate-700">{h.renewal}</span>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-blue-700">{h.aiRecommendation}</p>
              <button className="mt-3 w-full rounded-lg bg-red-600 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Escalate Risk</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reporting Health Section (Head View) ────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Reporting Health</h2>
          <p className="text-sm text-slate-500">
            Reporting status across all clients — how reporting health affects overall client health scores.
          </p>
        </div>

        {/* Reporting Health KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
          {[
            { label: "Reports On Track",    value: reportingHealthData.filter((r) => r.reportingRisk === "None" || r.reportingRisk === "Low").length, color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200"  },
            { label: "Reporting At Risk",   value: reportingHealthData.filter((r) => r.reportingRisk === "High" || r.reportingRisk === "Critical").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
            { label: "AM Review Pending",   value: reportingHealthData.filter((r) => r.amReviewStatus === "Pending" || r.amReviewStatus === "Not Started").length, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
            { label: "Reports Overdue",     value: reportingHealthData.filter((r) => r.reportStatus === "Overdue").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`rounded-xl border ${border} ${bg} p-3`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Reporting Health Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Account Manager", "Last Report Sent", "Next Report Due", "Report Status", "QA Status", "AM Review Status", "Reporting Risk", "Impact On Client Health"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportingHealthData.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.assignedAM}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{row.lastReportSent}</td>
                  <td className="px-4 py-3 text-blue-700 whitespace-nowrap text-xs font-semibold">{row.nextReportDue}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${reportStatusBadge(row.reportStatus)}`}>{row.reportStatus}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${reportStatusBadge(row.qaStatus)}`}>{row.qaStatus}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${reportStatusBadge(row.amReviewStatus)}`}>{row.amReviewStatus}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${riskBadge(row.reportingRisk)}`}>{row.reportingRisk}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.healthImpact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Example scenarios */}
        <div className="p-5 border-t border-slate-100">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Reporting Health Examples</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { title: "Report Overdue → Health Score Impact",       detail: "Sunbelt HVAC report is 10+ days overdue. Client health score reduced by 12 points. Client communication at risk.",           color: "border-red-200 bg-red-50"    },
              { title: "Missing Dept Input → Reporting Risk",        detail: "Green Valley Pools: Meta Ads input missing due to ad account access issue. Reporting blocked — risk flagged.",            color: "border-orange-200 bg-orange-50"},
              { title: "AM Review Overdue → Communication Risk",     detail: "Harbor Auto Group: AM review pending 5+ days. Report cannot be sent until AM approves. Client expects delivery Jan 25.",  color: "border-amber-200 bg-amber-50" },
            ].map(({ title, detail, color }) => (
              <div key={title} className={`rounded-xl border p-4 ${color}`}>
                <p className="text-xs font-bold text-slate-800 mb-1">{title}</p>
                <p className="text-xs text-slate-600">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AM Portfolio Health Comparison */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">AM Portfolio Health Comparison</h2>
          <p className="text-sm text-slate-500">Compare average health score per Account Manager.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {AM_NAMES.map((am) => {
            const amHealth = ALL_HEALTH.filter((h) => h.assignedAM === am);
            const avg = amHealth.length > 0 ? Math.round(amHealth.reduce((a, h) => a + h.healthScore, 0) / amHealth.length) : 0;
            const critical = amHealth.filter((h) => h.status === "Critical" || h.status === "At Risk").length;
            return (
              <div key={am} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800 mb-3">{am}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Clients Tracked</span>
                    <span className="font-semibold">{amHealth.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Avg Health</span>
                    <span className={`font-bold ${avg >= 80 ? "text-green-600" : avg >= 60 ? "text-yellow-600" : "text-red-600"}`}>{avg}/100</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Escalations</span>
                    <span className={`font-semibold ${critical > 0 ? "text-red-600" : "text-green-600"}`}>{critical}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 mt-1">
                    <div className={`h-1.5 rounded-full ${avg >= 80 ? "bg-green-500" : avg >= 60 ? "bg-yellow-400" : "bg-red-500"}`} style={{ width: `${avg}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ── AM View ───────────────────────────────────────────────────────────────────

function AMView() {
  const myHealth = ALL_HEALTH.filter((h) => h.assignedAM === SARAH);

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "My Clients Tracked", value: myHealth.length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Healthy", value: myHealth.filter((h) => h.status === "Healthy").length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
          { label: "At Risk / Critical", value: myHealth.filter((h) => h.status === "At Risk" || h.status === "Critical").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          { label: "My Avg Health Score", value: myHealth.length > 0 ? Math.round(myHealth.reduce((a, h) => a + h.healthScore, 0) / myHealth.length) : 0, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* AM Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">My Health Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Update Client Health", color: "bg-blue-600 hover:bg-blue-700" },
            { label: "Schedule Check-in", color: "bg-teal-600 hover:bg-teal-700" },
            { label: "Add Client Note", color: "bg-slate-600 hover:bg-slate-700" },
            { label: "Request Manager Escalation", color: "bg-red-600 hover:bg-red-700" },
            { label: "Start Renewal", color: "bg-amber-500 hover:bg-amber-600" },
          ].map(({ label, color }) => (
            <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* My Client Health Records */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">My Client Health Records</h2>
          <p className="text-sm text-slate-500">Health records for clients assigned to {SARAH}. Other AM client health data is not visible.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Score", "Payment", "Deliverables", "Reporting", "Trend", "Last Check-in", "Next Check-in", "Renewal", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myHealth.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreBadge(row.healthScore)}`}>{row.healthScore}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.paymentStatus}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.deliverableStatus}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.reportingStatus}</td>
                  <td className={`px-4 py-3 whitespace-nowrap font-medium text-xs ${trendColor(row.performanceTrend)}`}>{row.performanceTrend}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{row.lastCheckin}</td>
                  <td className="px-4 py-3 text-blue-600 whitespace-nowrap text-xs font-semibold">{row.nextCheckin}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{row.renewal}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge(row.status)}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">You can only see health records for your own assigned clients.</p>
        </div>
      </section>

      {/* ── Reporting Health Section (AM View) ─────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Reporting Health</h2>
          <p className="text-sm text-slate-500">
            Reporting status and health impact for your assigned clients.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Last Report Sent", "Next Report Due", "Report Status", "QA Status", "AM Review Status", "Reporting Risk", "Impact On Client Health"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportingHealthData.filter((r) => r.assignedAM === SARAH).map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{row.lastReportSent}</td>
                  <td className="px-4 py-3 text-blue-700 whitespace-nowrap text-xs font-semibold">{row.nextReportDue}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${reportStatusBadge(row.reportStatus)}`}>{row.reportStatus}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${reportStatusBadge(row.qaStatus)}`}>{row.qaStatus}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${reportStatusBadge(row.amReviewStatus)}`}>{row.amReviewStatus}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${riskBadge(row.reportingRisk)}`}>{row.reportingRisk}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.healthImpact}</td>
                </tr>
              ))}
              {reportingHealthData.filter((r) => r.assignedAM === SARAH).length === 0 && (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">No reporting data for your clients.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">Showing reporting health for your assigned clients only.</p>
        </div>
      </section>

      {/* My At-Risk Clients */}
      {myHealth.some((h) => h.status === "At Risk" || h.status === "Critical") && (
        <section className="rounded-2xl border border-red-200 bg-red-50 shadow-sm">
          <div className="border-b border-red-100 px-6 py-4">
            <h2 className="text-lg font-bold text-red-800">My At-Risk Clients</h2>
            <p className="text-sm text-red-600">Clients requiring immediate attention or escalation.</p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {myHealth.filter((h) => h.status === "At Risk" || h.status === "Critical").map((h) => (
              <div key={h.id} className="rounded-xl border border-red-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-sm font-bold text-slate-800">{h.client}</p>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge(h.status)}`}>{h.status}</span>
                </div>
                <p className="text-xs text-blue-700 font-semibold mb-3">💡 {h.aiRecommendation}</p>
                <p className="text-xs text-slate-500 mb-3">🌤 {h.seasonalNote}</p>
                <button className="w-full rounded-lg bg-red-600 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Request Manager Escalation</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My AI Recommendations */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">My AI Recommendations</h2>
          <p className="text-sm text-slate-500">AI-generated client insights and seasonal opportunities for your clients.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {myHealth.map((h) => (
            <div key={h.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800 mb-1">{h.client}</p>
              <p className="text-xs text-blue-700 font-semibold mb-2">🤖 {h.aiRecommendation}</p>
              <p className="text-xs text-amber-700">🌤 {h.seasonalNote}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClientHealthPage() {
  const [role, setRole] = useState<AMRole>("head");

  return (
    <main className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Client Health</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor health scores, risks, check-ins, reporting compliance, and retention signals.
        </p>
      </div>

      {/* Role Toggle — Account Management Head View / Account Manager View */}
      <RoleToggle role={role} onRoleChange={setRole} />

      {/* Role content */}
      {role === "head" ? <HeadView /> : <AMView />}
    </main>
  );
}
