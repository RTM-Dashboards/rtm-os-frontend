"use client";

import { useState } from "react";
import { RoleToggle } from "@/components/am-role-toggle";
import {
  ALL_RENEWALS,
  AM_NAMES,
  SARAH,
  type AMRole,
} from "@/lib/am-role-mock-data";

// ── Helpers ───────────────────────────────────────────────────────────────────

function renewalStatusBadge(s: string) {
  switch (s) {
    case "Renewing": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "On Track": return "bg-blue-100 text-blue-700 border-blue-200";
    case "At Risk": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "High Risk": return "bg-red-100 text-red-700 border-red-200";
    case "Lost": return "bg-slate-200 text-slate-600 border-slate-300";
    default: return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

function probabilityColor(p: number) {
  if (p >= 80) return "text-green-600";
  if (p >= 60) return "text-yellow-600";
  return "text-red-600";
}

function probabilityBar(p: number) {
  if (p >= 80) return "bg-green-500";
  if (p >= 60) return "bg-yellow-400";
  return "bg-red-500";
}

// ── Head View ─────────────────────────────────────────────────────────────────

function HeadView() {
  const [filterAM, setFilterAM] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = ALL_RENEWALS.filter((r) => {
    if (filterAM !== "All" && r.assignedAM !== filterAM) return false;
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    return true;
  });

  const totalRevenue = ALL_RENEWALS.reduce((sum, r) => {
    const val = parseInt(r.contractValue.replace(/[^0-9]/g, ""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const upsellTotal = ALL_RENEWALS.reduce((sum, r) => {
    const val = parseInt(r.upsellRevenue.replace(/[^0-9]/g, ""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Renewals Tracked", value: ALL_RENEWALS.length, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "Renewal Revenue at Stake", value: `$${(totalRevenue / 1000).toFixed(0)}K/yr`, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Upsell Pipeline", value: `$${upsellTotal * 12 / 1000}K/yr`, color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
          { label: "Renewing (Confirmed)", value: ALL_RENEWALS.filter((r) => r.status === "Renewing").length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
          { label: "High Risk Renewals", value: ALL_RENEWALS.filter((r) => r.status === "High Risk").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          { label: "At Risk Renewals", value: ALL_RENEWALS.filter((r) => r.status === "At Risk").length, color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
          { label: "Due ≤ 30 Days", value: ALL_RENEWALS.filter((r) => r.daysRemaining <= 30).length, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
          { label: "Due ≤ 60 Days", value: ALL_RENEWALS.filter((r) => r.daysRemaining <= 60).length, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
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
            { label: "Review All Renewals", color: "bg-indigo-600 hover:bg-indigo-700" },
            { label: "Review All Upsells", color: "bg-violet-600 hover:bg-violet-700" },
            { label: "Review Retention Risk", color: "bg-red-600 hover:bg-red-700" },
            { label: "Create Manager Note", color: "bg-slate-600 hover:bg-slate-700" },
            { label: "Export Revenue Forecast", color: "bg-slate-700 hover:bg-slate-800" },
          ].map(({ label, color }) => (
            <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Revenue Forecast Across AM Team */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Revenue Forecast Across AM Team</h2>
          <p className="text-sm text-slate-500">Renewal revenue at stake and upsell potential per Account Manager.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {AM_NAMES.map((am) => {
            const amRenewals = ALL_RENEWALS.filter((r) => r.assignedAM === am);
            const amRevenue = amRenewals.reduce((s, r) => s + parseInt(r.contractValue.replace(/[^0-9]/g, "") || "0"), 0);
            const amUpsell = amRenewals.reduce((s, r) => s + parseInt(r.upsellRevenue.replace(/[^0-9]/g, "") || "0"), 0);
            const highRisk = amRenewals.filter((r) => r.status === "High Risk" || r.status === "At Risk").length;
            return (
              <div key={am} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800 mb-3">{am}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Renewals</span><span className="font-bold">{amRenewals.length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Revenue/yr</span><span className="font-bold text-emerald-600">${(amRevenue / 1000).toFixed(0)}K</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Upsell/mo</span><span className="font-bold text-violet-600">${amUpsell}/mo</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Retention Risk</span><span className={`font-semibold ${highRisk > 0 ? "text-red-600" : "text-green-600"}`}>{highRisk}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* All Renewals Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Renewals</h2>
            <p className="text-sm text-slate-500">Full renewal pipeline across all Account Managers.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterAM} onChange={(e) => setFilterAM(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All AMs</option>
              {AM_NAMES.map((am) => <option key={am}>{am}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option value="All">All Statuses</option>
              {["Renewing", "On Track", "At Risk", "High Risk", "Lost"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Account Manager", "Contract Value", "Services", "Renewal Date", "Days Left", "Probability", "Health", "Status", "Upsell Opportunity", "Next Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{r.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.assignedAM}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">{r.contractValue}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.services}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.renewalDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-bold ${r.daysRemaining <= 30 ? "text-red-600" : r.daysRemaining <= 60 ? "text-orange-600" : "text-slate-700"}`}>{r.daysRemaining}d</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-slate-100">
                        <div className={`h-1.5 rounded-full ${probabilityBar(r.probability)}`} style={{ width: `${r.probability}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${probabilityColor(r.probability)}`}>{r.probability}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">{r.healthScore}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${renewalStatusBadge(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{r.upsellOpportunity}</td>
                  <td className="px-4 py-3 text-blue-700 text-xs max-w-[200px]">{r.nextAction}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-slate-400">No renewals match the filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">{filtered.length} of {ALL_RENEWALS.length} renewals shown</p>
        </div>
      </section>

      {/* All Upsells */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">All Upsell Opportunities</h2>
          <p className="text-sm text-slate-500">Full upsell pipeline across the AM team.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_RENEWALS.map((r) => (
            <div key={r.id} className="rounded-xl border border-violet-100 bg-violet-50 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">{r.client}</p>
                  <p className="text-xs text-slate-500">AM: {r.assignedAM}</p>
                </div>
                <span className="text-xs font-bold text-violet-700 bg-violet-100 rounded-full px-2.5 py-0.5">{r.upsellRevenue}/mo</span>
              </div>
              <p className="text-xs font-semibold text-violet-800 mb-1">💡 {r.upsellOpportunity}</p>
              <p className="text-xs text-slate-600">{r.nextAction}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── AM View ───────────────────────────────────────────────────────────────────

function AMView() {
  const myRenewals = ALL_RENEWALS.filter((r) => r.assignedAM === SARAH);

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "My Renewals", value: myRenewals.length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "High Risk Renewals", value: myRenewals.filter((r) => r.status === "High Risk").length, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
          { label: "Due ≤ 30 Days", value: myRenewals.filter((r) => r.daysRemaining <= 30).length, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
          { label: "My Upsell Opportunities", value: myRenewals.length, color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* AM Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">My Renewal Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Start Renewal", color: "bg-blue-600 hover:bg-blue-700" },
            { label: "Add Client Note", color: "bg-slate-600 hover:bg-slate-700" },
            { label: "Request Manager Escalation", color: "bg-red-600 hover:bg-red-700" },
          ].map(({ label, color }) => (
            <button key={label} className={`${color} rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* My Renewals */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">My Renewals</h2>
          <p className="text-sm text-slate-500">Renewal records for clients assigned to {SARAH}. Other AM renewals are not visible.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "Contract Value", "Services", "Renewal Date", "Days Left", "Probability", "Status", "Next Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myRenewals.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{r.client}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">{r.contractValue}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.services}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.renewalDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-bold ${r.daysRemaining <= 30 ? "text-red-600" : r.daysRemaining <= 60 ? "text-orange-600" : "text-slate-700"}`}>{r.daysRemaining}d</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-slate-100">
                        <div className={`h-1.5 rounded-full ${probabilityBar(r.probability)}`} style={{ width: `${r.probability}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${probabilityColor(r.probability)}`}>{r.probability}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${renewalStatusBadge(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-blue-700 text-xs max-w-[200px]">{r.nextAction}</td>
                </tr>
              ))}
              {myRenewals.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No renewals assigned to you.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">You can only see renewals for your own assigned clients.</p>
        </div>
      </section>

      {/* My Upsell Opportunities */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">My Upsell Opportunities</h2>
          <p className="text-sm text-slate-500">Client-specific upsell recommendations for your accounts.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {myRenewals.map((r) => (
            <div key={r.id} className="rounded-xl border border-violet-100 bg-violet-50 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-bold text-slate-800">{r.client}</p>
                <span className="text-xs font-bold text-violet-700 bg-violet-100 rounded-full px-2.5 py-0.5">{r.upsellRevenue}/mo</span>
              </div>
              <p className="text-xs font-semibold text-violet-800 mb-1">💡 {r.upsellOpportunity}</p>
              <p className="text-xs text-slate-600">{r.nextAction}</p>
              <button className="mt-3 w-full rounded-lg bg-violet-600 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">Start Upsell Conversation</button>
            </div>
          ))}
        </div>
      </section>

      {/* My Renewal Action Items */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">My Renewal Action Items</h2>
          <p className="text-sm text-slate-500">Priority action items for your renewal pipeline.</p>
        </div>
        <div className="space-y-3 p-5">
          {myRenewals.sort((a, b) => a.daysRemaining - b.daysRemaining).map((r) => (
            <div key={r.id} className={`flex items-start justify-between gap-4 rounded-xl border px-5 py-4 ${r.status === "High Risk" ? "border-red-200 bg-red-50" : r.status === "At Risk" ? "border-yellow-200 bg-yellow-50" : "border-slate-100 bg-white"}`}>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{r.client}</p>
                <p className="text-xs text-slate-500 mt-0.5">Renewal: {r.renewalDate} · {r.daysRemaining} days</p>
                <p className="text-xs text-blue-700 font-semibold mt-2">{r.nextAction}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${renewalStatusBadge(r.status)}`}>{r.status}</span>
                <p className={`mt-1 text-sm font-bold ${probabilityColor(r.probability)}`}>{r.probability}%</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RenewalsPage() {
  const [role, setRole] = useState<AMRole>("head");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Renewals</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage renewal pipeline, upsell opportunities, and revenue forecast across the AM team.
        </p>
      </div>

      {/* Role Toggle — Account Management Head View / Account Manager View */}
      <RoleToggle role={role} onRoleChange={setRole} />

      {/* Role content */}
      {role === "head" ? <HeadView /> : <AMView />}
    </div>
  );
}
