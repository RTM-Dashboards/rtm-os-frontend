"use client";

import React, { useState, useMemo } from "react";
import {
  OFFBOARDING_RECORDS,
  getActiveOffboardings,
  getCompletedOffboardings,
  getPendingAssetTransfers,
  getPendingAccessRemovals,
  getPendingFinalBilling,
  getTotalRevenueLost,
  getAnnualRevenueLost,
  getReasonBreakdown,
  getStatusBreakdown,
  type OffboardingRecord,
  type OffboardingStatus,
  type FinalBillingStatus,
  type AssetTransferStatus,
  type AccessRemovalStatus,
  type ChecklistItemStatus,
  type DepartmentTaskStatus,
  type CancellationReason,
} from "@/lib/account-management/offboarding-data";

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

function fmt$(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(Math.abs(n) / 1_000).toFixed(0)}K`;
  return `$${Math.abs(n)}`;
}

function offboardingStatusStyle(status: OffboardingStatus) {
  switch (status) {
    case "Initiated":        return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "Planning":         return { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" };
    case "In Progress":      return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Waiting On Client":return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Final Billing":    return { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" };
    case "Asset Transfer":   return { bg: "#EFF6FF", color: "#0369A1", border: "#BAE6FD" };
    case "Access Removal":   return { bg: "#F0FFFE", color: "#0F766E", border: "#99F6E4" };
    case "Completed":        return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Archived":         return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
  }
}

function billingStatusStyle(status: FinalBillingStatus) {
  switch (status) {
    case "Not Started":    return { bg: "#F8FAFC", color: "#64748B", border: "#CBD5E1" };
    case "Invoice Pending":return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Invoice Sent":   return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "Paid":           return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Overdue":        return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Waived":         return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
    case "Write Off":      return { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA" };
  }
}

function assetTransferStatusStyle(status: AssetTransferStatus) {
  switch (status) {
    case "Not Started":      return { bg: "#F8FAFC", color: "#64748B", border: "#CBD5E1" };
    case "In Progress":      return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Waiting On Client":return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Transferred":      return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Not Applicable":   return { bg: "#F1F5F9", color: "#94A3B8", border: "#E2E8F0" };
  }
}

function accessRemovalStatusStyle(status: AccessRemovalStatus) {
  switch (status) {
    case "Active":           return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Revoked":          return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Pending Removal":  return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Not Applicable":   return { bg: "#F1F5F9", color: "#94A3B8", border: "#E2E8F0" };
  }
}

function checklistStatusStyle(status: ChecklistItemStatus) {
  switch (status) {
    case "Not Started":    return { bg: "#F8FAFC", color: "#64748B", border: "#CBD5E1" };
    case "In Progress":    return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Completed":      return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Blocked":        return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Not Applicable": return { bg: "#F1F5F9", color: "#94A3B8", border: "#E2E8F0" };
  }
}

function deptTaskStatusStyle(status: DepartmentTaskStatus) {
  switch (status) {
    case "Not Started": return { bg: "#F8FAFC", color: "#64748B", border: "#CBD5E1" };
    case "In Progress": return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Completed":   return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Overdue":     return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Blocked":     return { bg: "#FFF7ED", color: "#9A3412", border: "#FED7AA" };
  }
}

function reasonStyle(reason: CancellationReason) {
  switch (reason) {
    case "Budget":            return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Performance":       return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Service Quality":   return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Communication":     return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "Internal Staffing": return { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" };
    case "Business Closure":  return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
    case "Competitor":        return { bg: "#FFF7ED", color: "#9A3412", border: "#FED7AA" };
    case "No Longer Needed":  return { bg: "#F0FFFE", color: "#0F766E", border: "#99F6E4" };
    default:                  return { bg: "#F8FAFC", color: "#64748B", border: "#CBD5E1" };
  }
}

function categoryColor(cat: string): string {
  switch (cat) {
    case "Cancellation Approved": return "#DC2626";
    case "Offboarding Created":   return "#1D4ED8";
    case "Asset Transfer":        return "#0369A1";
    case "Access Removal":        return "#0F766E";
    case "Final Billing":         return "#B45309";
    case "Archive":               return "#475569";
    case "Communication":         return "#6D28D9";
    case "Completed":             return "#059669";
    case "Note":                  return "#94A3B8";
    default:                      return "#64748B";
  }
}

function completionColor(pct: number): string {
  if (pct >= 80) return "#059669";
  if (pct >= 50) return "#D97706";
  if (pct >= 25) return "#EA580C";
  return "#DC2626";
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════════════

function Badge({
  label,
  bg,
  color,
  border,
  dot,
}: {
  label: string;
  bg: string;
  color: string;
  border: string;
  dot?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border whitespace-nowrap"
      style={{ background: bg, color, borderColor: border }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />}
      {label}
    </span>
  );
}

function OffboardingStatusBadge({ status }: { status: OffboardingStatus }) {
  const s = offboardingStatusStyle(status);
  return <Badge label={status} bg={s.bg} color={s.color} border={s.border} />;
}

function BillingStatusBadge({ status }: { status: FinalBillingStatus }) {
  const s = billingStatusStyle(status);
  return <Badge label={status} bg={s.bg} color={s.color} border={s.border} />;
}

function AssetStatusBadge({ status }: { status: AssetTransferStatus }) {
  const s = assetTransferStatusStyle(status);
  return <Badge label={status} bg={s.bg} color={s.color} border={s.border} />;
}

function AccessStatusBadge({ status }: { status: AccessRemovalStatus }) {
  const s = accessRemovalStatusStyle(status);
  return <Badge label={status} bg={s.bg} color={s.color} border={s.border} />;
}

function ChecklistBadge({ status }: { status: ChecklistItemStatus }) {
  const s = checklistStatusStyle(status);
  return <Badge label={status} bg={s.bg} color={s.color} border={s.border} />;
}

function DeptTaskBadge({ status }: { status: DepartmentTaskStatus }) {
  const s = deptTaskStatusStyle(status);
  return <Badge label={status} bg={s.bg} color={s.color} border={s.border} />;
}

function ReasonBadge({ reason }: { reason: CancellationReason }) {
  const s = reasonStyle(reason);
  return <Badge label={reason} bg={s.bg} color={s.color} border={s.border} />;
}

function ProgressBar({ pct, height = "h-2" }: { pct: number; height?: string }) {
  const c = completionColor(pct);
  return (
    <div className={`${height} rounded-full bg-slate-100 overflow-hidden`}>
      <div className={`${height} rounded-full transition-all`} style={{ width: `${pct}%`, background: c }} />
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
  bg = "bg-white",
  borderColor = "border-slate-200",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  bg?: string;
  borderColor?: string;
}) {
  return (
    <div className={`rounded-xl border ${borderColor} ${bg} p-5 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold" style={{ color: accent ?? "#0F172A" }}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
  accentColor = "#1B4FD8",
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  accentColor?: string;
}) {
  return (
    <div className="border-b border-slate-100 px-6 py-4">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>
          {eyebrow}
        </p>
      )}
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1: OFFBOARDING DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function OffboardingDashboard() {
  const active = getActiveOffboardings();
  const completed = getCompletedOffboardings();
  const pendingAssets = getPendingAssetTransfers();
  const pendingAccess = getPendingAccessRemovals();
  const pendingBilling = getPendingFinalBilling();
  const mrrLost = getTotalRevenueLost();
  const arrLost = getAnnualRevenueLost();
  const statusBreakdown = getStatusBreakdown();
  const reasonBreakdown = getReasonBreakdown();

  const sortedStatuses = (Object.entries(statusBreakdown) as [OffboardingStatus, number][])
    .sort((a, b) => b[1] - a[1]);

  const sortedReasons = (Object.entries(reasonBreakdown) as [CancellationReason, number][])
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          label="Active Offboardings"
          value={active.length}
          sub="in progress"
          accent="#1D4ED8"
          borderColor="border-blue-200"
          bg="bg-blue-50"
        />
        <KpiCard
          label="Pending Asset Transfers"
          value={pendingAssets.length}
          sub="not yet transferred"
          accent="#0369A1"
          borderColor="border-sky-200"
          bg="bg-sky-50"
        />
        <KpiCard
          label="Pending Access Removals"
          value={pendingAccess.length}
          sub="access still active"
          accent="#DC2626"
          borderColor="border-red-200"
          bg="bg-red-50"
        />
        <KpiCard
          label="Pending Final Billing"
          value={pendingBilling.length}
          sub="invoices outstanding"
          accent="#B45309"
          borderColor="border-amber-200"
          bg="bg-amber-50"
        />
        <KpiCard
          label="Completed Offboardings"
          value={completed.length}
          sub="archived"
          accent="#059669"
          borderColor="border-emerald-200"
          bg="bg-emerald-50"
        />
        <KpiCard
          label="Revenue Lost"
          value={fmt$(mrrLost)}
          sub={`${fmt$(arrLost)}/yr ARR`}
          accent="#475569"
          borderColor="border-slate-300"
          bg="bg-slate-50"
        />
      </div>

      {/* Revenue alert */}
      {mrrLost > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">
                {fmt$(mrrLost)}/mo in revenue lost across {OFFBOARDING_RECORDS.length} offboarding records. {fmt$(arrLost)}/yr ARR total.
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {active.length} active offboardings in progress. {pendingBilling.length} final invoices outstanding.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status breakdown + Reason breakdown */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader eyebrow="Status Overview" title="Offboardings by Status" desc="Current distribution across all offboarding stages." />
          <div className="p-5 space-y-2">
            {sortedStatuses.map(([status, count]) => {
              const pct = Math.round((count / OFFBOARDING_RECORDS.length) * 100);
              const s = offboardingStatusStyle(status);
              return (
                <div key={status} className="flex items-center justify-between rounded-lg border px-4 py-2.5" style={{ background: s.bg, borderColor: s.border }}>
                  <span className="text-sm font-semibold" style={{ color: s.color }}>{status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 rounded-full bg-white/60">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                    <span className="text-sm font-bold w-6 text-right" style={{ color: s.color }}>{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader eyebrow="Departure Analysis" title="Top Cancellation Reasons" desc="Why clients are departing — volume by reason." accentColor="#DC2626" />
          <div className="p-5 space-y-3">
            {sortedReasons.map(([reason, count]) => {
              const pct = Math.round((count / OFFBOARDING_RECORDS.length) * 100);
              const s = reasonStyle(reason);
              return (
                <div key={reason} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">{reason}</span>
                    <span className="text-xs font-bold" style={{ color: s.color }}>{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active offboarding project cards */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-800">Active Offboarding Projects</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{r.client}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.offboardingOwner}</p>
                  </div>
                  <OffboardingStatusBadge status={r.offboardingStatus} />
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">MRR Lost</span>
                    <span className="font-semibold text-red-600">{fmt$(r.mrr)}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Completion</span>
                    <span className="font-semibold text-slate-700">{r.targetCompletionDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Departments</span>
                    <span className="font-semibold text-slate-700">{r.departmentsInvolved.length}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span style={{ color: completionColor(r.completionPct) }}>{r.completionPct}%</span>
                  </div>
                  <ProgressBar pct={r.completionPct} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <ReasonBadge reason={r.reason} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2: OFFBOARDING TABLE
// ══════════════════════════════════════════════════════════════════════════════

function OffboardingTable({ onSelect }: { onSelect: (r: OffboardingRecord) => void }) {
  const [statusFilter, setStatusFilter] = useState<OffboardingStatus | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      OFFBOARDING_RECORDS.filter((r) => {
        if (statusFilter !== "All" && r.offboardingStatus !== statusFilter) return false;
        if (
          search &&
          !r.client.toLowerCase().includes(search.toLowerCase()) &&
          !r.accountManager.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [statusFilter, search]
  );

  const ALL_STATUSES: OffboardingStatus[] = [
    "Initiated", "Planning", "In Progress", "Waiting On Client",
    "Final Billing", "Asset Transfer", "Access Removal", "Completed", "Archived",
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Offboarding Pipeline" title="All Offboarding Records" desc="Complete pipeline across all clients and stages." />
      <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <input
          placeholder="Search client or AM..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-56 outline-none focus:ring-2 focus:ring-blue-100"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OffboardingStatus | "All")}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none"
        >
          <option value="All">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} of {OFFBOARDING_RECORDS.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Client", "Account Manager", "Cancellation Date", "Status", "Final Billing", "Asset Transfer", "Access Removal", "Completion", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => onSelect(r)}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="font-semibold text-slate-900">{r.client}</p>
                  <p className="text-xs text-slate-400">{fmt$(r.mrr)}/mo</p>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.accountManager}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.cancellationDate}</td>
                <td className="px-4 py-3 whitespace-nowrap"><OffboardingStatusBadge status={r.offboardingStatus} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><BillingStatusBadge status={r.finalBillingStatus} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><AssetStatusBadge status={r.assetTransferStatus} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><AccessStatusBadge status={r.accessRemovalStatus} /></td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2 w-32">
                    <ProgressBar pct={r.completionPct} />
                    <span className="text-xs font-bold w-8 text-right" style={{ color: completionColor(r.completionPct) }}>{r.completionPct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-800" onClick={(e) => { e.stopPropagation(); onSelect(r); }}>View</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-400">No offboarding records match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 px-6 py-2.5 text-xs text-slate-400">
        {filtered.length} records shown
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL: OFFBOARDING PROJECT
// ══════════════════════════════════════════════════════════════════════════════

function OffboardingProject({ record }: { record: OffboardingRecord }) {
  const doneItems = record.checklist.filter(
    (c) => c.status === "Completed" || c.status === "Not Applicable"
  ).length;
  const totalItems = record.checklist.length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Offboarding Project" title={`Project Overview — ${record.client}`} desc="Core offboarding project details, progress, and involved departments." accentColor="#1D4ED8" />
      <div className="p-6 space-y-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Client</p>
            <p className="text-sm font-bold text-slate-900">{record.client}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Offboarding Owner</p>
            <p className="text-sm font-bold text-slate-900">{record.offboardingOwner}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Target Completion</p>
            <p className="text-sm font-bold text-slate-900">{record.targetCompletionDate}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Cancellation Date</p>
            <p className="text-sm font-bold text-slate-900">{record.cancellationDate}</p>
          </div>
        </div>

        {/* Progress hero */}
        <div className="rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">Overall Progress</p>
            <span className="text-2xl font-extrabold" style={{ color: completionColor(record.completionPct) }}>
              {record.completionPct}%
            </span>
          </div>
          <ProgressBar pct={record.completionPct} height="h-3" />
          <div className="flex flex-wrap gap-3">
            <OffboardingStatusBadge status={record.offboardingStatus} />
            <ReasonBadge reason={record.reason} />
          </div>
        </div>

        {/* Departments involved */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Departments Involved</p>
          <div className="flex flex-wrap gap-2">
            {record.departmentsInvolved.map((d) => (
              <span key={d} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700">{d}</span>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Services Managed</p>
          <div className="flex flex-wrap gap-2">
            {record.services.map((s) => (
              <span key={s} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-xs font-semibold text-slate-600">{s}</span>
            ))}
          </div>
        </div>

        {/* Checklist summary */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Checklist Progress</p>
          <p className="text-sm font-semibold text-slate-700">{doneItems} of {totalItems} items complete</p>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL: CHECKLIST
// ══════════════════════════════════════════════════════════════════════════════

function OffboardingChecklist({ record }: { record: OffboardingRecord }) {
  const done = record.checklist.filter((c) => c.status === "Completed").length;
  const applicable = record.checklist.filter((c) => c.status !== "Not Applicable").length;
  const pct = applicable > 0 ? Math.round((done / applicable) * 100) : 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-0.5">Offboarding Checklist</p>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Checklist — {record.client}</h2>
          <span className="text-sm font-bold" style={{ color: completionColor(pct) }}>{pct}% complete</span>
        </div>
        <ProgressBar pct={pct} />
      </div>
      <div className="divide-y divide-slate-100">
        {record.checklist.map((item) => {
          const s = checklistStatusStyle(item.status);
          const isDone = item.status === "Completed";
          return (
            <div key={item.id} className="px-6 py-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5`}
                  style={{ borderColor: s.color, background: isDone ? s.color : "transparent" }}
                >
                  {isDone && <div className="w-2 h-2 rounded-sm bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isDone ? "line-through text-slate-400" : "text-slate-800"}`}>{item.label}</p>
                  <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-slate-400">
                    <span>{item.owner}</span>
                    <span>Due: {item.dueDate}</span>
                    {item.notes && <span className="text-amber-600 font-medium italic">{item.notes}</span>}
                  </div>
                </div>
              </div>
              <ChecklistBadge status={item.status} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL: DEPARTMENT TASKS
// ══════════════════════════════════════════════════════════════════════════════

function DepartmentTasks({ record }: { record: OffboardingRecord }) {
  const deptGroups: Record<string, typeof record.departmentTasks> = {};
  for (const t of record.departmentTasks) {
    if (!deptGroups[t.department]) deptGroups[t.department] = [];
    deptGroups[t.department].push(t);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Department Tasks" title={`Department Tasks — ${record.client}`} desc="Task assignments by department for this offboarding." accentColor="#6D28D9" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Department", "Assigned Task", "Status", "Due Date", "Owner", "Notes"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {record.departmentTasks.map((task) => (
              <tr key={task.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                  <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">{task.department}</span>
                </td>
                <td className="px-4 py-3 text-slate-700 max-w-[260px]">{task.task}</td>
                <td className="px-4 py-3 whitespace-nowrap"><DeptTaskBadge status={task.status} /></td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{task.dueDate}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{task.owner}</td>
                <td className="px-4 py-3 text-xs text-slate-400 italic">{task.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL: ASSET TRANSFER CENTER
// ══════════════════════════════════════════════════════════════════════════════

function AssetTransferCenter({ record }: { record: OffboardingRecord }) {
  const totalAssets = record.assetTransfers.length;
  const transferred = record.assetTransfers.filter((a) => a.status === "Transferred").length;
  const pct = totalAssets > 0 ? Math.round((transferred / totalAssets) * 100) : 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-0.5">Asset Transfer Center</p>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Asset Transfers — {record.client}</h2>
          <span className="text-sm font-bold" style={{ color: completionColor(pct) }}>{transferred} of {totalAssets} transferred</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Asset Type", "Current Owner", "Recipient", "Transfer Status", "Completed Date", "Notes"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {record.assetTransfers.map((asset) => (
              <tr key={asset.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{asset.assetType}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{asset.currentOwner}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{asset.recipient}</td>
                <td className="px-4 py-3 whitespace-nowrap"><AssetStatusBadge status={asset.status} /></td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{asset.completedDate ?? "Pending"}</td>
                <td className="px-4 py-3 text-xs text-slate-400 italic">{asset.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL: ACCESS REMOVAL CENTER
// ══════════════════════════════════════════════════════════════════════════════

function AccessRemovalCenter({ record }: { record: OffboardingRecord }) {
  const total = record.accessRemovals.length;
  const revoked = record.accessRemovals.filter((a) => a.accessStatus === "Revoked").length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-0.5">Access Removal Center</p>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Access Removal — {record.client}</h2>
          <span className="text-sm font-bold text-emerald-600">{revoked} of {total} revoked</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Tool / Platform", "User", "Access Status", "Removed Date", "Owner", "Notes"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {record.accessRemovals.map((ar) => (
              <tr key={ar.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{ar.tool}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{ar.user}</td>
                <td className="px-4 py-3 whitespace-nowrap"><AccessStatusBadge status={ar.accessStatus} /></td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{ar.removedDate ?? "Pending"}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{ar.owner}</td>
                <td className="px-4 py-3 text-xs text-slate-400 italic">{ar.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL: FINAL BILLING CENTER
// ══════════════════════════════════════════════════════════════════════════════

function FinalBillingCenter({ record }: { record: OffboardingRecord }) {
  const billing = record.finalBilling;
  const netDue = billing.finalInvoiceAmount - billing.credits - billing.refunds;

  const approvalStyle = {
    "Pending Approval": { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
    "Approved":         { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
    "Rejected":         { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  }[billing.approvalStatus];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Final Billing Center" title={`Final Billing — ${record.client}`} desc="Outstanding balance, credits, refunds, and invoice status." accentColor="#B45309" />
      <div className="p-6 space-y-5">
        {/* Billing summary grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-400">Outstanding Balance</p>
            <p className="text-2xl font-extrabold text-red-600 mt-1">{fmt$(billing.outstandingBalance)}</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">Credits Applied</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{fmt$(billing.credits)}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Refunds</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{fmt$(billing.refunds)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Final Invoice Amount</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{fmt$(netDue)}</p>
          </div>
        </div>

        {/* Status row */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1.5">Collection Status</p>
            <BillingStatusBadge status={record.finalBillingStatus} />
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1.5">Approval Status</p>
            <Badge label={billing.approvalStatus} bg={approvalStyle.bg} color={approvalStyle.color} border={approvalStyle.border} />
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Invoice Date</p>
            <p className="text-sm font-bold text-slate-800">{billing.finalInvoiceDate ?? "Not yet issued"}</p>
          </div>
        </div>

        {billing.notes && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Billing Notes</p>
            <p className="text-sm text-slate-600">{billing.notes}</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL: KNOWLEDGE ARCHIVE
// ══════════════════════════════════════════════════════════════════════════════

function KnowledgeArchive({ record }: { record: OffboardingRecord }) {
  const ka = record.knowledgeArchive;

  const fields = [
    { label: "Final Notes", value: ka.finalNotes, color: "#1D4ED8" },
    { label: "Lessons Learned", value: ka.lessonsLearned, color: "#6D28D9" },
    { label: "Client History", value: ka.clientHistory, color: "#0F766E" },
    { label: "Project Summary", value: ka.projectSummary, color: "#B45309" },
    { label: "Retention Attempts", value: ka.retentionAttempts, color: "#EA580C" },
    { label: "Reason For Departure", value: ka.reasonForDeparture, color: "#DC2626" },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Knowledge Archive" title={`Knowledge Archive — ${record.client}`} desc="Final notes, lessons learned, client history, and departure context." accentColor="#475569" />
      <div className="p-6 grid sm:grid-cols-2 gap-5">
        {fields.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</p>
            <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL: AI OFFBOARDING SUMMARY
// ══════════════════════════════════════════════════════════════════════════════

function AIOffboardingSummary({ record }: { record: OffboardingRecord }) {
  const ai = record.aiSummary;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="AI Offboarding Summary" title={`AI Summary — ${record.client}`} desc="AI-generated analysis of this offboarding — impact, risks, and recommended actions." accentColor="#6D28D9" />
      <div className="p-6 space-y-4">
        {/* Summary panels */}
        {[
          { label: "Client Summary", value: ai.clientSummary, color: "#1D4ED8", bgColor: "#EFF6FF", borderColor: "#BFDBFE" },
          { label: "Reason For Cancellation", value: ai.reasonForCancellation, color: "#DC2626", bgColor: "#FEF2F2", borderColor: "#FECACA" },
          { label: "Revenue Impact", value: ai.revenueImpact, color: "#B45309", bgColor: "#FFFBEB", borderColor: "#FDE68A" },
          { label: "Assets Transferred", value: ai.assetsTransferred, color: "#0369A1", bgColor: "#EFF6FF", borderColor: "#BAE6FD" },
          { label: "Outstanding Risks", value: ai.outstandingRisks, color: "#EA580C", bgColor: "#FFF7ED", borderColor: "#FED7AA" },
        ].map(({ label, value, color, bgColor, borderColor }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: bgColor, borderColor }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color }}>{label}</p>
            <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
          </div>
        ))}

        {/* Recommended actions */}
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-600">Recommended Actions</p>
          <ul className="space-y-1.5">
            {ai.recommendedActions.map((action, idx) => (
              <li key={action} className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-purple-400 mt-0.5 flex-shrink-0 w-4">{idx + 1}.</span>
                <span className="text-xs text-slate-700 leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION: EXECUTIVE OFFBOARDING DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function ExecutiveOffboardingDashboard() {
  const active = getActiveOffboardings();
  const completed = getCompletedOffboardings();
  const mrrLost = getTotalRevenueLost();
  const arrLost = getAnnualRevenueLost();
  const reasonBreakdown = getReasonBreakdown();

  const completedOnTime = completed.filter(
    (r) => r.actualCompletionDate && r.actualCompletionDate <= r.targetCompletionDate
  ).length;

  const avgCompletion =
    active.length > 0
      ? Math.round(active.reduce((s, r) => s + r.completionPct, 0) / active.length)
      : 0;

  // Department impact
  const deptMap: Record<string, number> = {};
  for (const r of OFFBOARDING_RECORDS) {
    for (const d of r.departmentsInvolved) {
      deptMap[d] = (deptMap[d] || 0) + 1;
    }
  }
  const deptRows = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);

  // Monthly trend (mock)
  const monthlyTrend = [
    { month: "Jan 2025", count: 2, mrrLost: 10400 },
    { month: "Feb 2025", count: 2, mrrLost: 8200 },
    { month: "Mar 2025", count: 3, mrrLost: 8700 },
    { month: "Apr 2025", count: 4, mrrLost: 14600 },
    { month: "May 2025", count: 9, mrrLost: 26200 },
  ];

  return (
    <div className="space-y-6">
      {/* Executive KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-400">Total Revenue Lost</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{fmt$(arrLost)}</p>
          <p className="text-xs text-slate-400 mt-0.5">ARR across all offboardings</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Active Offboardings</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{active.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">avg {avgCompletion}% complete</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Completed</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{completed.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">{completedOnTime} on or ahead of schedule</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">MRR Lost</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{fmt$(mrrLost)}/mo</p>
          <p className="text-xs text-slate-400 mt-0.5">total monthly recurring</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top cancellation reasons */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader eyebrow="Cancellation Reasons" title="Top Cancellation Reasons" desc="Revenue lost per departure driver." accentColor="#DC2626" />
          <div className="p-5 space-y-3">
            {(Object.entries(reasonBreakdown) as [CancellationReason, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([reason, count]) => {
                const pct = Math.round((count / OFFBOARDING_RECORDS.length) * 100);
                const s = reasonStyle(reason);
                const mrrFromReason = OFFBOARDING_RECORDS.filter((r) => r.reason === reason).reduce((sum, r) => sum + r.mrr, 0);
                return (
                  <div key={reason} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">{reason}</span>
                        <Badge label={`${count}`} bg={s.bg} color={s.color} border={s.border} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{fmt$(mrrFromReason)}/mo lost</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Department impact */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader eyebrow="Department Impact" title="Departments Involved" desc="Number of offboardings requiring each department." accentColor="#6D28D9" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Department", "Offboardings", "% of Total"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptRows.map(([dept, count]) => {
                  const pct = Math.round((count / OFFBOARDING_RECORDS.length) * 100);
                  return (
                    <tr key={dept} className="border-t border-slate-100">
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{dept}</td>
                      <td className="px-4 py-2.5 text-slate-600">{count}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-slate-100">
                            <div className="h-1.5 rounded-full bg-purple-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-500">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Monthly trend */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader eyebrow="Offboarding Trends" title="Monthly Offboarding Volume" desc="Number of offboardings and MRR lost per month in 2025." />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Month", "Offboardings", "MRR Lost", "Trend"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyTrend.map((row) => {
                const maxMRR = Math.max(...monthlyTrend.map((m) => m.mrrLost));
                const barPct = Math.round((row.mrrLost / maxMRR) * 100);
                return (
                  <tr key={row.month} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{row.month}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.count}</td>
                    <td className="px-4 py-2.5 font-semibold text-red-600">{fmt$(row.mrrLost)}/mo</td>
                    <td className="px-4 py-2.5">
                      <div className="w-32 h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-red-400" style={{ width: `${barPct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Completed offboardings summary */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader eyebrow="Completed" title="Completed Offboardings" desc="All closed and archived offboarding records." accentColor="#059669" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "AM", "Reason", "MRR Lost", "Completed Date", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completed.sort((a, b) => (b.actualCompletionDate ?? "").localeCompare(a.actualCompletionDate ?? "")).map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 font-semibold text-slate-800">{r.client}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.accountManager}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap"><ReasonBadge reason={r.reason} /></td>
                  <td className="px-4 py-2.5 font-semibold text-slate-500">{fmt$(r.mrr)}/mo</td>
                  <td className="px-4 py-2.5 text-slate-500">{r.actualCompletionDate ?? "—"}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap"><OffboardingStatusBadge status={r.offboardingStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pending offboardings */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader eyebrow="Pending" title="Pending Offboardings" desc="Active offboardings requiring attention." accentColor="#B45309" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Client", "AM", "Status", "Progress", "Target Date", "MRR"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.sort((a, b) => a.targetCompletionDate.localeCompare(b.targetCompletionDate)).map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 font-semibold text-slate-800">{r.client}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.accountManager}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap"><OffboardingStatusBadge status={r.offboardingStatus} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 w-28">
                      <ProgressBar pct={r.completionPct} />
                      <span className="text-xs font-bold" style={{ color: completionColor(r.completionPct) }}>{r.completionPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{r.targetCompletionDate}</td>
                  <td className="px-4 py-2.5 font-semibold text-red-600">{fmt$(r.mrr)}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL: ACTIVITY TIMELINE
// ══════════════════════════════════════════════════════════════════════════════

function ActivityTimeline({ record }: { record: OffboardingRecord }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Activity Timeline" title={`Activity Timeline — ${record.client}`} desc="Chronological history of all offboarding events." />
      <div className="p-6">
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
          <div className="space-y-6">
            {record.activityTimeline.map((event, idx) => {
              const color = categoryColor(event.category);
              return (
                <div key={`${event.date}-${idx}`} className="relative flex gap-5">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm"
                    style={{ background: color }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                  <div
                    className="flex-1 rounded-xl border p-4"
                    style={{ borderColor: color + "40", background: color + "08" }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{event.event}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{event.date}</p>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{event.actor}</span>
                    </div>
                    <p className="text-sm text-slate-700">{event.description}</p>
                    <div className="mt-1.5">
                      <Badge label={event.category} bg={color + "15"} color={color} border={color + "40"} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT DETAIL — TABBED VIEW
// ══════════════════════════════════════════════════════════════════════════════

type DetailTab =
  | "project"
  | "checklist"
  | "dept-tasks"
  | "asset-transfer"
  | "access-removal"
  | "final-billing"
  | "knowledge"
  | "ai-summary"
  | "timeline";

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: "project",        label: "Project" },
  { id: "checklist",      label: "Checklist" },
  { id: "dept-tasks",     label: "Dept Tasks" },
  { id: "asset-transfer", label: "Asset Transfer" },
  { id: "access-removal", label: "Access Removal" },
  { id: "final-billing",  label: "Final Billing" },
  { id: "knowledge",      label: "Knowledge Archive" },
  { id: "ai-summary",     label: "AI Summary" },
  { id: "timeline",       label: "Activity Timeline" },
];

function ClientDetailPanel({
  record,
  onClose,
}: {
  record: OffboardingRecord;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>("project");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Offboarding Detail</p>
          <h2 className="text-xl font-bold text-slate-900">{record.client}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <OffboardingStatusBadge status={record.offboardingStatus} />
            <ReasonBadge reason={record.reason} />
            <BillingStatusBadge status={record.finalBillingStatus} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-red-400">MRR Lost</p>
          <p className="text-lg font-extrabold text-red-600 mt-0.5">{fmt$(record.mrr)}/mo</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">ARR Lost</p>
          <p className="text-lg font-extrabold text-slate-700 mt-0.5">{fmt$(record.arr)}/yr</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Progress</p>
          <p className="text-lg font-extrabold mt-0.5" style={{ color: completionColor(record.completionPct) }}>{record.completionPct}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Target Date</p>
          <p className="text-sm font-bold text-slate-700 mt-0.5">{record.targetCompletionDate}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {DETAIL_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg border border-b-0 px-3 py-2 text-xs font-semibold transition-colors ${
              tab === t.id
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "project"        && <OffboardingProject record={record} />}
        {tab === "checklist"      && <OffboardingChecklist record={record} />}
        {tab === "dept-tasks"     && <DepartmentTasks record={record} />}
        {tab === "asset-transfer" && <AssetTransferCenter record={record} />}
        {tab === "access-removal" && <AccessRemovalCenter record={record} />}
        {tab === "final-billing"  && <FinalBillingCenter record={record} />}
        {tab === "knowledge"      && <KnowledgeArchive record={record} />}
        {tab === "ai-summary"     && <AIOffboardingSummary record={record} />}
        {tab === "timeline"       && <ActivityTimeline record={record} />}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN TABS
// ══════════════════════════════════════════════════════════════════════════════

type MainTab = "dashboard" | "records" | "executive";

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: "dashboard",  label: "Dashboard" },
  { id: "records",    label: "Offboarding Records" },
  { id: "executive",  label: "Executive Dashboard" },
];

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function OffboardingPage() {
  const [mainTab, setMainTab] = useState<MainTab>("dashboard");
  const [selectedRecord, setSelectedRecord] = useState<OffboardingRecord | null>(null);

  const mrrLost = getTotalRevenueLost();
  const active = getActiveOffboardings();
  const completed = getCompletedOffboardings();

  if (selectedRecord) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
          <h1 className="text-2xl font-bold text-slate-900">Offboarding Engine</h1>
        </div>
        <ClientDetailPanel record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
          <h1 className="text-2xl font-bold text-slate-900">Offboarding Engine</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage client exits — asset transfers, access removal, final billing, knowledge capture, and archiving.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">MRR Lost</p>
            <p className="text-lg font-extrabold text-red-600 mt-0.5">{fmt$(mrrLost)}/mo</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Active</p>
            <p className="text-lg font-extrabold text-amber-600 mt-0.5">{active.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Completed</p>
            <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{completed.length}</p>
          </div>
        </div>
      </div>

      {/* Main tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {MAIN_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setMainTab(t.id)}
            className={`rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-semibold transition-colors ${
              mainTab === t.id
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {mainTab === "dashboard"  && <OffboardingDashboard />}
        {mainTab === "records"    && <OffboardingTable onSelect={setSelectedRecord} />}
        {mainTab === "executive"  && <ExecutiveOffboardingDashboard />}
      </div>
    </div>
  );
}
