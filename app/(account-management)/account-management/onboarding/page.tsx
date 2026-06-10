"use client";

import React, { useState } from "react";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";
import { RoleToggle } from "@/components/am-role-toggle";
import {
  ALL_ONBOARDING,
  AM_NAMES,
  SARAH,
  type AMRole,
} from "@/lib/am-role-mock-data";

// ── Stage styles ──────────────────────────────────────────────────────────────

function stageBadge(stage: string) {
  switch (stage) {
    case "Intake In Progress": return "bg-sky-100 text-sky-700";
    case "Service Activation": return "bg-orange-100 text-orange-700";
    case "Department Launch": return "bg-indigo-100 text-indigo-700";
    case "Awaiting Payment": return "bg-amber-100 text-amber-700";
    case "Assigned to AM": return "bg-teal-100 text-teal-700";
    case "Onboarding Complete": return "bg-emerald-100 text-emerald-700";
    default: return "bg-slate-100 text-slate-500";
  }
}

// ── Mock intake for AM view ───────────────────────────────────────────────────

const sarahOnboarding = ALL_ONBOARDING.filter((o) => o.assignedAM === SARAH);

const intakeDefaults = {
  clientName: "Apex Roofing",
  industry: "Home Services / Roofing",
  website: "https://apexroofing.com",
  primaryContact: "Jason Mercer",
  email: "jason@apexroofing.com",
  phone: "(480) 555-0142",
  businessGoals: "Increase inbound roofing leads by 50% within 6 months.",
  clientExpectations: "Weekly lead updates. Monthly report by the 5th.",
  notes: "Upsell: Call Tracking once ads live. Owner prefers text communication.",
};

// ── Head View ─────────────────────────────────────────────────────────────────

function HeadView() {
  const [filterAM, setFilterAM] = useState("All");

  const filtered = filterAM === "All" ? ALL_ONBOARDING : ALL_ONBOARDING.filter((o) => o.assignedAM === filterAM);

  const stages = [...new Set(ALL_ONBOARDING.map((o) => o.stage))];

  return (
    <div className="space-y-6">

      {/* ── Task Management Engine Banner ── */}
      <TaskAccessCard
        context="Account Management"
        variant="banner"
        counters={{ open: 18, overdue: 4, dueToday: 7, completed: 53 }}
        createLabel="Create AM Task"
        examples={["Check-In", "QBR", "Client Follow-Up", "Renewal Prep", "Onboarding Task"]}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Onboarding Clients", value: ALL_ONBOARDING.length, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
          { label: "Ready for AM Onboarding", value: ALL_ONBOARDING.filter((o) => o.stage === "Assigned to AM").length, color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200" },
          { label: "In Progress", value: ALL_ONBOARDING.filter((o) => ["Intake In Progress", "Service Activation", "Department Launch"].includes(o.stage)).length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Awaiting Payment", value: ALL_ONBOARDING.filter((o) => o.stage === "Awaiting Payment").length, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
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
            { label: "Reassign Onboarding Owner", color: "bg-violet-600 hover:bg-violet-700" },
            { label: "Balance Workload", color: "bg-blue-600 hover:bg-blue-700" },
            { label: "Approve Assignment", color: "bg-teal-600 hover:bg-teal-700" },
            { label: "Review Unassigned Clients", color: "bg-amber-500 hover:bg-amber-600" },
            { label: "Create Manager Note", color: "bg-slate-600 hover:bg-slate-700" },
            { label: "Export View", color: "bg-slate-700 hover:bg-slate-800" },
          ].map(({ label, color }) => (
            <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Pipeline overview */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Onboarding Pipeline Overview</h2>
          <p className="text-sm text-slate-500">Stage breakdown across all Account Managers.</p>
        </div>
        <div className="flex flex-wrap gap-3 p-5">
          {stages.map((stage) => {
            const count = ALL_ONBOARDING.filter((o) => o.stage === stage).length;
            return (
              <div key={stage} className={`rounded-xl border px-4 py-3 text-center min-w-[130px] ${stageBadge(stage)}`}>
                <p className="text-xs font-semibold">{stage}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* All Onboarding Clients Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Onboarding Clients</h2>
            <p className="text-sm text-slate-500">All clients currently in onboarding across all Account Managers.</p>
          </div>
          <select value={filterAM} onChange={(e) => setFilterAM(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="All">All AMs</option>
            {AM_NAMES.map((am) => <option key={am}>{am}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Assigned AM", "Stage", "Start Date", "Services", "Notes", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{o.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{o.assignedAM}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${stageBadge(o.stage)}`}>{o.stage}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{o.startDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {o.services.map((s) => <span key={s} className="text-[10px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{s}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[200px] text-xs">{o.notes}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-xs font-semibold text-indigo-600 hover:underline">Reassign</button>
                      <button className="text-xs font-semibold text-blue-600 hover:underline">View</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No clients found for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">{filtered.length} of {ALL_ONBOARDING.length} onboarding clients shown</p>
        </div>
      </section>

      {/* AM Assignment Overview */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">AM Onboarding Assignments</h2>
          <p className="text-sm text-slate-500">Onboarding client count per Account Manager.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {AM_NAMES.map((am) => {
            const count = ALL_ONBOARDING.filter((o) => o.assignedAM === am).length;
            return (
              <div key={am} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-700">{am}</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{count}</p>
                <p className="text-xs text-slate-400 mt-1">onboarding {count === 1 ? "client" : "clients"}</p>
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
  const [intake, setIntake] = useState(intakeDefaults);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "My Onboarding Clients", value: sarahOnboarding.length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "In Progress", value: sarahOnboarding.filter((o) => o.stage === "Intake In Progress").length, color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" },
          { label: "Awaiting Assets", value: 2, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
          { label: "Ready to Launch Dept", value: 1, color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* AM Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">My Onboarding Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Update Onboarding Status", color: "bg-blue-600 hover:bg-blue-700" },
            { label: "Add Client Note", color: "bg-slate-600 hover:bg-slate-700" },
            { label: "Collect Assets", color: "bg-amber-500 hover:bg-amber-600" },
            { label: "Activate Services", color: "bg-teal-600 hover:bg-teal-700" },
            { label: "Launch Department Tasks", color: "bg-indigo-600 hover:bg-indigo-700" },
            { label: "Fill Intake Form", color: "bg-violet-600 hover:bg-violet-700" },
            { label: "Request Manager Escalation", color: "bg-red-600 hover:bg-red-700" },
          ].map(({ label, color }) => (
            <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* My Onboarding Clients */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">My Onboarding Clients</h2>
          <p className="text-sm text-slate-500">Only clients assigned to {SARAH}. Other AM onboarding records are not visible.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Stage", "Start Date", "Services", "Notes", "Update Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sarahOnboarding.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No onboarding clients assigned.</td></tr>
              ) : sarahOnboarding.map((o) => (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{o.client}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${stageBadge(o.stage)}`}>{o.stage}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{o.startDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {o.services.map((s) => <span key={s} className="text-[10px] rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-blue-700">{s}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px]">{o.notes}</td>
                  <td className="px-4 py-3">
                    <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">You can only see onboarding records assigned to you.</p>
        </div>
      </section>

      {/* Intake Form */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Client Intake Form — Apex Roofing</h2>
          <p className="text-sm text-slate-500">Complete and update intake notes for your assigned onboarding client.</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {([ ["clientName", "Client Name"], ["industry", "Industry"], ["website", "Website"], ["primaryContact", "Primary Contact"], ["email", "Email"], ["phone", "Phone"] ] as [keyof typeof intakeDefaults, string][]).map(([field, label]) => (
              <div key={field}>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</label>
                <input type="text" value={intake[field]} onChange={(e) => setIntake((p) => ({ ...p, [field]: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:bg-white outline-none" />
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {([ ["businessGoals", "Business Goals"], ["clientExpectations", "Client Expectations"], ["notes", "Internal Notes"] ] as [keyof typeof intakeDefaults, string][]).map(([field, label]) => (
              <div key={field}>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</label>
                <textarea rows={3} value={intake[field]} onChange={(e) => setIntake((p) => ({ ...p, [field]: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:bg-white outline-none resize-none" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleSave} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              {saved ? "✓ Saved" : "Save Intake Notes"}
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Request Missing Info
            </button>
          </div>
        </div>
      </section>

      {/* Asset checklist */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Asset Collection — Apex Roofing</h2>
          <p className="text-sm text-slate-500">Track and request assets needed to activate services for your client.</p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { asset: "Logo + Brand Guide", status: "Verified" },
            { asset: "Website Access", status: "Verified" },
            { asset: "GBP Access (Phoenix)", status: "Verified" },
            { asset: "GBP Access (Scottsdale)", status: "Requested" },
            { asset: "Google Ads Access", status: "In Progress" },
            { asset: "Meta Business Manager", status: "Missing" },
            { asset: "GA4 / Analytics Access", status: "Verified" },
            { asset: "Call Tracking Setup", status: "Missing" },
          ].map(({ asset, status }) => (
            <div key={asset} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${status === "Verified" ? "border-green-200 bg-green-50" : status === "Missing" ? "border-red-200 bg-red-50" : status === "Requested" ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"}`}>
              <p className="text-sm font-medium text-slate-700">{asset}</p>
              <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${status === "Verified" ? "bg-green-100 text-green-700" : status === "Missing" ? "bg-red-100 text-red-700" : status === "Requested" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccountManagementOnboardingPage() {
  const [role, setRole] = useState<AMRole>("head");

  return (
    <main className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Client Onboarding</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage each client through Sales Closed → Intake → Service Activation → Department Launch → Complete.
        </p>
      </div>

      {/* Client Lifecycle Status */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Client Lifecycle Status</p>
          <div className="flex gap-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">Sales</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-violet-50 text-violet-700 border-violet-200">Billing</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">Account Management</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {["Lead","Opportunity","Proposal","Contract","Closed Won","Sent To Billing","Invoice Sent","Awaiting Payment","Payment Confirmed","Activation Approved","Ready For Assignment","Assigned","Onboarding","Service Activation","Department Launch","Active","Renewal Triggered","QBR Scheduled","Renewal Negotiation","Renewed"].map((stage, i, arr) => {
            const amStages = ["Assigned","Onboarding","Service Activation","Department Launch","Active","Renewal Triggered","QBR Scheduled","Renewal Negotiation","Renewed"];
            const billingStages = ["Invoice Sent","Awaiting Payment","Payment Confirmed","Activation Approved","Ready For Assignment"];
            const isAM = amStages.includes(stage);
            const isBilling = billingStages.includes(stage);
            const isOnboarding = stage === "Onboarding";
            const bg = isOnboarding ? "#8B5CF6" : isAM ? "#ECFDF5" : isBilling ? "#F5F3FF" : "#EFF6FF";
            const color = isOnboarding ? "#fff" : isAM ? "#065F46" : isBilling ? "#6D28D9" : "#1D4ED8";
            const border = isOnboarding ? "#8B5CF6" : isAM ? "#A7F3D0" : isBilling ? "#DDD6FE" : "#BFDBFE";
            const opacity = isAM ? 1 : 0.45;
            return (
              <React.Fragment key={stage}>
                <div className="px-2 py-0.5 rounded text-[10px] font-semibold border" style={{ background: bg, color, borderColor: border, opacity }}>
                  {stage}
                </div>
                {i < arr.length - 1 && <span className="text-[10px] text-slate-300">→</span>}
              </React.Fragment>
            );
          })}
        </div>
        <p className="text-xs font-semibold text-indigo-700">
          ⚠️ Onboarding begins only after <strong>Ready For Assignment</strong> is confirmed by Billing.
        </p>
      </div>

      {/* Role Toggle — Account Management Head View / Account Manager View */}
      <RoleToggle role={role} onRoleChange={setRole} />

      {/* Role content */}
      {role === "head" ? <HeadView /> : <AMView />}
    </main>
  );
}
