"use client";

import React, { useState } from "react";
import { RoleToggle } from "@/components/am-role-toggle";
import {
  ALL_ASSIGNMENTS,
  AM_NAMES,
  SARAH,
  getClientsByAM,
  getWorkloadSummary,
  type AMRole,
} from "@/lib/am-role-mock-data";

// ── Helpers ───────────────────────────────────────────────────────────────────

function priorityBadge(p: string) {
  switch (p) {
    case "Critical": return "bg-red-600 text-white";
    case "High": return "bg-orange-500 text-white";
    case "Medium": return "bg-yellow-400 text-slate-900";
    case "Low": return "bg-blue-100 text-blue-700";
    default: return "bg-slate-100 text-slate-500";
  }
}

function statusBadge(s: string) {
  switch (s) {
    case "Approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Assigned": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Pending": return "bg-amber-100 text-amber-700 border-amber-200";
    case "On Hold": return "bg-slate-100 text-slate-500 border-slate-200";
    default: return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

// ── Mock assignment history ───────────────────────────────────────────────────

const ASSIGNMENT_HISTORY = [
  { client: "Apex Roofing", from: "Unassigned", to: "Sarah Chen", date: "Jun 20, 2025", reason: "Best capacity match, home services background." },
  { client: "Harbor Auto", from: "James Park", to: "Sarah Chen", date: "Jun 15, 2025", reason: "Reassigned due to load rebalancing." },
  { client: "NorthStar Dental", from: "Unassigned", to: "Tina Webb", date: "Jun 18, 2025", reason: "Healthcare industry expertise." },
  { client: "Radiance MedSpa", from: "Unassigned", to: "Maria Santos", date: "Jun 19, 2025", reason: "Premium client; beauty/health fit." },
  { client: "Summit Landscaping", from: "Unassigned", to: "James Park", date: "Jun 10, 2025", reason: "Home services, lowest load." },
];

// ── Head View ─────────────────────────────────────────────────────────────────

function HeadView() {
  const [filterAM, setFilterAM] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const workload = getWorkloadSummary();

  const filtered = ALL_ASSIGNMENTS.filter((a) => {
    if (filterAM !== "All" && a.assignedAM !== filterAM) return false;
    if (filterPriority !== "All" && a.priority !== filterPriority) return false;
    if (filterStatus !== "All" && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Account Managers", value: AM_NAMES.length, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
          { label: "Total Assignments", value: ALL_ASSIGNMENTS.length, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "Unassigned Clients", value: ALL_ASSIGNMENTS.filter((a) => a.assignedAM === "Unassigned").length, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
          { label: "Pending Approval", value: ALL_ASSIGNMENTS.filter((a) => a.status === "Pending").length, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
          { label: "Approved Assignments", value: ALL_ASSIGNMENTS.filter((a) => a.status === "Approved").length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
          { label: "Reassignment Requests", value: 3, color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
          { label: "Overloaded AMs", value: workload.filter((w) => w.total > 4).length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          { label: "Avg Accounts / AM", value: Math.round(ALL_ASSIGNMENTS.filter((a) => a.assignedAM !== "Unassigned").length / AM_NAMES.length), color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
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
            { label: "Assign Client", color: "bg-indigo-600 hover:bg-indigo-700" },
            { label: "Reassign Client", color: "bg-violet-600 hover:bg-violet-700" },
            { label: "Balance Assignments", color: "bg-blue-600 hover:bg-blue-700" },
            { label: "Review Overloaded AMs", color: "bg-red-600 hover:bg-red-700" },
            { label: "Review Unassigned Clients", color: "bg-amber-500 hover:bg-amber-600" },
            { label: "Approve Assignment", color: "bg-teal-600 hover:bg-teal-700" },
            { label: "Create Manager Note", color: "bg-slate-600 hover:bg-slate-700" },
            { label: "Export View", color: "bg-slate-700 hover:bg-slate-800" },
          ].map(({ label, color }) => (
            <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Full Assignment Queue */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Full Assignment Queue</h2>
            <p className="text-sm text-slate-500">All client assignments across all Account Managers.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterAM} onChange={(e) => setFilterAM(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All AMs</option>
              {AM_NAMES.map((am) => <option key={am}>{am}</option>)}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All Priorities</option>
              {["Critical", "High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All Statuses</option>
              {["Pending", "Assigned", "Approved", "On Hold"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Assigned AM", "Industry", "Contract Value", "Services", "Priority", "Status", "Handoff Notes", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{a.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{a.assignedAM}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{a.industry}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">{a.contractValue}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{a.services}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${priorityBadge(a.priority)}`}>{a.priority}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge(a.status)}`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[200px] text-xs">{a.handoffNotes}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-xs font-semibold text-indigo-600 hover:underline">Reassign</button>
                      <button className="text-xs font-semibold text-teal-600 hover:underline">Approve</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No assignments match the filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* AM Load Balancing */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">AM Load Balancing</h2>
          <p className="text-sm text-slate-500">Current client load per Account Manager — auto assignment recommendations.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {AM_NAMES.map((am) => {
            const clients = getClientsByAM(am);
            const pct = Math.round((clients.length / 5) * 100);
            const overloaded = clients.length > 4;
            return (
              <div key={am} className={`rounded-xl border p-4 ${overloaded ? "border-red-200 bg-red-50" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-sm font-bold text-slate-800">{am}</p>
                  {overloaded && <span className="text-xs font-bold rounded-full bg-red-100 text-red-700 px-2 py-0.5">Overloaded</span>}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Clients</span>
                    <span className="font-bold text-slate-800">{clients.length}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div className={`h-2 rounded-full ${overloaded ? "bg-red-500" : pct > 60 ? "bg-yellow-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <p className={`font-semibold ${overloaded ? "text-red-600" : "text-emerald-600"}`}>Open Tasks: {pct}% relative load</p>
                </div>
                <button className="mt-3 w-full rounded-lg border border-indigo-200 bg-indigo-50 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
                  Auto Assign Client
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Assignment History */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Assignment History</h2>
          <p className="text-sm text-slate-500">Recent assignment and reassignment log across all AMs.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "From", "To", "Date", "Reason"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASSIGNMENT_HISTORY.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.from}</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold whitespace-nowrap">{row.to}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[300px] text-xs">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ── AM View ───────────────────────────────────────────────────────────────────

function AMView() {
  const myAssignments = ALL_ASSIGNMENTS.filter((a) => a.assignedAM === SARAH);
  const myClients = getClientsByAM(SARAH);

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "My Assigned Clients", value: myClients.length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "My Assignments", value: myAssignments.length, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
          { label: "Approved", value: myAssignments.filter((a) => a.status === "Approved").length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
          { label: "Pending Handoffs", value: myAssignments.filter((a) => a.status === "Pending" || a.status === "Assigned").length, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* AM Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">My Assignment Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "View My Clients", color: "bg-blue-600 hover:bg-blue-700" },
            { label: "Add Assignment Note", color: "bg-slate-600 hover:bg-slate-700" },
            { label: "View My Onboarding Queue", color: "bg-indigo-600 hover:bg-indigo-700" },
            { label: "Request Manager Escalation", color: "bg-red-600 hover:bg-red-700" },
          ].map(({ label, color }) => (
            <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* My Assignment List (read-only) */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">My Assignment List</h2>
          <p className="text-sm text-slate-500">Read-only view of clients assigned to {SARAH}. Reassignment and assignment controls are not available in this view.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Industry", "Contract Value", "Services", "Priority", "Status", "Handoff Notes"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myAssignments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No assignments found for {SARAH}.</td></tr>
              ) : myAssignments.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{a.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{a.industry}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">{a.contractValue}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{a.services}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${priorityBadge(a.priority)}`}>{a.priority}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge(a.status)}`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[200px] text-xs">{a.handoffNotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">You cannot reassign clients in this view. Contact your manager for reassignment requests.</p>
        </div>
      </section>

      {/* My Client Handoffs */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">My Client Handoffs</h2>
          <p className="text-sm text-slate-500">Recent assignment handoffs for your clients.</p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {ASSIGNMENT_HISTORY.filter((h) => h.to === SARAH || h.from === SARAH).map((h, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800 mb-2">{h.client}</p>
              <div className="space-y-1 text-xs">
                <div className="flex gap-2">
                  <span className="text-slate-400">From:</span>
                  <span className="text-slate-700">{h.from}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-400">To:</span>
                  <span className="font-semibold text-blue-700">{h.to}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-400">Date:</span>
                  <span className="text-slate-600">{h.date}</span>
                </div>
                <p className="text-slate-500 mt-1 pt-1 border-t border-slate-100">{h.reason}</p>
              </div>
            </div>
          ))}
          {ASSIGNMENT_HISTORY.filter((h) => h.to === SARAH || h.from === SARAH).length === 0 && (
            <p className="text-sm text-slate-400 col-span-3">No handoffs found for {SARAH}.</p>
          )}
        </div>
      </section>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AssignmentsPage() {
  const [role, setRole] = useState<AMRole>("head");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Account Assignments</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage client-to-AM assignments, load distribution, and reassignment workflows.
        </p>
      </div>

      {/* Client Lifecycle Status */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Client Lifecycle Status — Assignments</p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {[
            { stage: "Ready For Assignment", owner: "Billing",            active: true,  color: "#10B981", textC: "#fff" },
            { stage: "Assigned",             owner: "Account Management", active: true,  color: "#3B82F6", textC: "#fff" },
            { stage: "Onboarding",           owner: "Account Management", active: false, color: "#ECFDF5", textC: "#065F46" },
            { stage: "Service Activation",   owner: "Account Management", active: false, color: "#ECFDF5", textC: "#065F46" },
            { stage: "Department Launch",    owner: "Account Management", active: false, color: "#ECFDF5", textC: "#065F46" },
            { stage: "Active",               owner: "Account Management", active: false, color: "#ECFDF5", textC: "#065F46" },
          ].map((s, i, arr) => (
            <React.Fragment key={s.stage}>
              <div
                className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                style={{
                  background: s.active ? s.color : "#fff",
                  color: s.active ? s.textC : "#94A3B8",
                  borderColor: s.active ? s.color : "#E2E8F0",
                }}
              >
                {s.stage}
              </div>
              {i < arr.length - 1 && <span className="text-slate-300">→</span>}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs font-semibold text-indigo-700">
          ⚠️ Assignment only occurs for clients with <strong>Ready For Assignment</strong> status (Billing-confirmed).
          Sales handoff → Billing → <strong>Ready For Assignment</strong> → AM Assignment begins here.
        </p>
      </div>

      {/* Role Toggle — Account Management Head View / Account Manager View */}
      <RoleToggle role={role} onRoleChange={setRole} />

      {/* Role content */}
      {role === "head" ? <HeadView /> : <AMView />}
    </div>
  );
}
