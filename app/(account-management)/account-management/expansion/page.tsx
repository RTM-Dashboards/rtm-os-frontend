"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  EXPANSION_OPPORTUNITIES,
  type ExpansionOpportunity,
  type ExpansionStatus,
} from "@/lib/account-management/am-client-success-data";
import SubmitChangeRequestModal, {
  type PendingChangeRequest,
} from "@/components/account-management/SubmitChangeRequestModal";

// ── Status transition order ───────────────────────────────────────────────────

const ALL_STATUSES: ExpansionStatus[] = [
  "Identified",
  "Proposed",
  "In Negotiation",
  "Closed Won",
  "Declined",
];

// ── Next Action: purely status-derived — never per-record invented text ───────

const NEXT_ACTION_BY_STATUS: Record<ExpansionStatus, string> = {
  Identified: "Schedule discovery call with client",
  Proposed: "Follow up with client on proposal",
  "In Negotiation": "Finalize contract terms",
  "Closed Won": "Convert to Change Request",
  Declined: "Archive — no further action",
};

// ── Badge helpers ─────────────────────────────────────────────────────────────

function StatusBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#065F46" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Live — Status Transitions Active
    </span>
  );
}

function statusBadgeStyle(status: ExpansionStatus): React.CSSProperties {
  const map: Record<ExpansionStatus, React.CSSProperties> = {
    Identified: { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
    Proposed: { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
    "In Negotiation": { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },
    "Closed Won": { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" },
    Declined: { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" },
  };
  return (
    map[status] ?? { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" }
  );
}

function confidenceTextColor(score: number): React.CSSProperties {
  if (score >= 80) return { color: "#059669" };
  if (score >= 60) return { color: "#B45309" };
  return { color: "#DC2626" };
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color = "text-slate-800",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Merged opportunity type (mock data + persisted status override) ───────────

type MergedOpportunity = ExpansionOpportunity & {
  /** True when status has been overridden from the persisted layer. */
  _statusPersisted: boolean;
};

// ── Opportunity row with inline status control ────────────────────────────────

interface RowProps {
  opp: MergedOpportunity;
  onStatusChange: (id: string, newStatus: ExpansionStatus) => void;
  onConvertToChangeRequest: (opp: MergedOpportunity) => void;
  saving: boolean;
}

function OpportunityRow({
  opp,
  onStatusChange,
  onConvertToChangeRequest,
  saving,
}: RowProps) {
  const nextAction = NEXT_ACTION_BY_STATUS[opp.status];
  const isClosedWon = opp.status === "Closed Won";
  const isDeclined = opp.status === "Declined";

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      {/* Client */}
      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
        {opp.client}
      </td>

      {/* Opportunity */}
      <td className="px-4 py-3 text-slate-700 max-w-[180px]">
        <span className="line-clamp-2">{opp.opportunity}</span>
      </td>

      {/* Recommended Services */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {opp.recommendedServices.map((s) => (
            <span
              key={s}
              className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                background: "var(--rtm-bg)",
                color: "var(--rtm-text-secondary)",
                border: "1px solid var(--rtm-border)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </td>

      {/* Est. Revenue */}
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <span className="font-bold text-emerald-700">
          ${opp.estimatedRevenue.toLocaleString()}
        </span>
        <span className="text-xs text-slate-400">/mo</span>
      </td>

      {/* Confidence */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${opp.confidenceScore}%`,
                background: "#3B82F6",
              }}
            />
          </div>
          <span
            className="text-xs font-semibold"
            style={confidenceTextColor(opp.confidenceScore)}
          >
            {opp.confidenceScore}%
          </span>
        </div>
      </td>

      {/* Status — real dropdown */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <select
            value={opp.status}
            disabled={saving}
            onChange={(e) =>
              onStatusChange(opp.id, e.target.value as ExpansionStatus)
            }
            className="text-xs font-semibold rounded-full border px-2 py-1 pr-6 appearance-none cursor-pointer disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{
              ...statusBadgeStyle(opp.status),
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 6px center",
              minWidth: "120px",
            }}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {opp._statusPersisted && (
            <span
              className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{
                background: "#F0F9FF",
                color: "#0369A1",
                border: "1px solid #BAE6FD",
              }}
            >
              saved
            </span>
          )}
        </div>
      </td>

      {/* Owner */}
      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
        {opp.assignedOwner}
      </td>

      {/* Next Action — purely status-derived */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <span
            className="text-xs font-medium"
            style={{ color: isDeclined ? "#94A3B8" : "#334155" }}
          >
            {nextAction}
          </span>
          {isClosedWon && (
            <button
              onClick={() => onConvertToChangeRequest(opp)}
              className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap"
              style={{
                background: "#1D4ED8",
                borderColor: "#1D4ED8",
                color: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1E40AF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1D4ED8";
              }}
            >
              → Convert to CR
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

interface StatusOverride {
  opportunityId: string;
  status: string;
  updatedAt: string;
}

export default function ExpansionPage() {
  const [activeFilter, setActiveFilter] = useState<ExpansionStatus | "All">(
    "All"
  );
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, ExpansionStatus>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Convert-to-CR modal state
  const [crModalOpp, setCrModalOpp] = useState<MergedOpportunity | null>(null);
  const [lastConverted, setLastConverted] = useState<PendingChangeRequest | null>(
    null
  );

  // Fetch persisted status overrides on mount
  useEffect(() => {
    fetch("/api/expansion-opportunity-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { records: StatusOverride[] } | null) => {
        if (d?.records && Array.isArray(d.records)) {
          const map: Record<string, ExpansionStatus> = {};
          for (const rec of d.records) {
            map[rec.opportunityId] = rec.status as ExpansionStatus;
          }
          setStatusOverrides(map);
        }
      })
      .catch((err) =>
        console.error("[Expansion] Failed to load status overrides:", err)
      );
  }, []);

  // Merge mock data with persisted overrides
  const merged: MergedOpportunity[] = EXPANSION_OPPORTUNITIES.map((opp) => ({
    ...opp,
    status:
      statusOverrides[opp.id] !== undefined
        ? statusOverrides[opp.id]
        : opp.status,
    _statusPersisted: statusOverrides[opp.id] !== undefined,
  }));

  const filtered = merged.filter(
    (o) => activeFilter === "All" || o.status === activeFilter
  );

  // KPIs computed from merged (persisted) state
  const total = merged.length;
  const closedWon = merged.filter((o) => o.status === "Closed Won").length;
  const inNeg = merged.filter((o) => o.status === "In Negotiation").length;
  const proposed = merged.filter((o) => o.status === "Proposed").length;
  const identified = merged.filter((o) => o.status === "Identified").length;
  const declined = merged.filter((o) => o.status === "Declined").length;
  const totalRevPipeline = merged
    .filter((o) => o.status !== "Declined")
    .reduce((a, o) => a + o.estimatedRevenue, 0);

  const pipelineByStatus = ALL_STATUSES.map((s) => ({
    status: s,
    count: merged.filter((o) => o.status === s).length,
    revenue: merged
      .filter((o) => o.status === s)
      .reduce((a, o) => a + o.estimatedRevenue, 0),
  }));

  const topByConfidence = [...merged]
    .filter((o) => o.status !== "Declined")
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 5);

  // Status change handler — persists via API
  const handleStatusChange = useCallback(
    async (id: string, newStatus: ExpansionStatus) => {
      setSavingId(id);
      // Optimistic update
      setStatusOverrides((prev) => ({ ...prev, [id]: newStatus }));
      try {
        const res = await fetch("/api/expansion-opportunity-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opportunityId: id, status: newStatus }),
        });
        if (!res.ok) {
          console.error("[Expansion] Status save failed");
        } else {
          setLastSaved(id);
          setTimeout(() => setLastSaved(null), 2500);
        }
      } catch (err) {
        console.error("[Expansion] Status save error:", err);
      } finally {
        setSavingId(null);
      }
    },
    []
  );

  // Convert to Change Request — opens SubmitChangeRequestModal pre-filled
  function handleConvertToChangeRequest(opp: MergedOpportunity) {
    setCrModalOpp(opp);
  }

  function handleCrSubmitted(record: PendingChangeRequest) {
    setLastConverted(record);
    setCrModalOpp(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900">
          Expansion Opportunities
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge />
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Track upsell and expansion opportunities across the client portfolio.
          Status changes persist across refresh. Closed Won opportunities can
          be converted to a real Change Request.
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Note: Opportunity records are representative mock data; status
          transitions and Change Request conversion are fully real and
          persisted.
        </p>
      </div>

      {/* Conversion success notification */}
      {lastConverted && (
        <div
          className="rounded-xl border px-5 py-3 flex items-center justify-between gap-4"
          style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#065F46" }}>
            ✓ Change request{" "}
            <strong>{lastConverted.id}</strong> for{" "}
            <strong>{lastConverted.client}</strong> (
            {lastConverted.requestType}) submitted to Billing&apos;s review
            queue.
          </p>
          <button
            onClick={() => setLastConverted(null)}
            className="text-xs font-semibold px-2 py-1 rounded"
            style={{ color: "#059669" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Save confirmation */}
      {lastSaved && (
        <div
          className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
          style={{
            background: "#F0F9FF",
            borderColor: "#BAE6FD",
            color: "#0369A1",
          }}
        >
          ✓ Status saved.
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard label="Total" value={total} />
        <KpiCard label="Closed Won" value={closedWon} />
        <KpiCard label="In Negotiation" value={inNeg} />
        <KpiCard label="Proposed" value={proposed} />
        <KpiCard label="Identified" value={identified} />
        <KpiCard label="Declined" value={declined} />
        <KpiCard
          label="Pipeline / mo"
          value={`$${totalRevPipeline.toLocaleString()}`}
          sub="excl. declined"
          color="text-teal-700"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {(["All", ...ALL_STATUSES] as (ExpansionStatus | "All")[]).map((s) => (
          <button
            key={s}
            onClick={() => setActiveFilter(s)}
            className={`rounded-t-lg border border-b-0 px-3 py-2 text-xs font-semibold transition-colors ${
              activeFilter === s
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {s}
            {s !== "All" && (
              <span className="ml-1 text-[10px] text-slate-400">
                ({merged.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Client
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Opportunity
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Recommended Services
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Est. Revenue / mo
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Confidence
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Owner
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Next Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((opp) => (
              <OpportunityRow
                key={opp.id}
                opp={opp}
                onStatusChange={handleStatusChange}
                onConvertToChangeRequest={handleConvertToChangeRequest}
                saving={savingId === opp.id}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  No opportunities match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-400">
          Showing {filtered.length} of {total} opportunities
        </div>
      </div>

      {/* Pipeline Summary + Top Opportunities */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pipeline by status */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-800">
              Revenue Pipeline by Status
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Estimated monthly recurring revenue per stage (reflects persisted
              status)
            </p>
          </div>
          <div className="p-5 space-y-3">
            {pipelineByStatus.map(({ status, count, revenue }) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                    style={statusBadgeStyle(status)}
                  >
                    {status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {count} opp{count !== 1 ? "s" : ""}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    revenue > 0 ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  {revenue > 0 ? `$${revenue.toLocaleString()}/mo` : "—"}
                </span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Total Pipeline
              </span>
              <span className="text-base font-bold text-teal-700">
                ${totalRevPipeline.toLocaleString()}/mo
              </span>
            </div>
          </div>
        </div>

        {/* Top by confidence */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-800">
              Top Opportunities by Confidence
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Highest-probability expansion deals to prioritize
            </p>
          </div>
          <div className="p-5 space-y-3">
            {topByConfidence.map((opp, i) => (
              <div key={opp.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500 flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {opp.client}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {opp.opportunity}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-sm font-bold"
                    style={confidenceTextColor(opp.confidenceScore)}
                  >
                    {opp.confidenceScore}%
                  </p>
                  <p className="text-xs text-slate-400">
                    ${opp.estimatedRevenue.toLocaleString()}/mo
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Action Reference */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          Next Action Reference
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ALL_STATUSES.map((s) => (
            <div key={s} className="flex items-start gap-2">
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold flex-shrink-0 mt-0.5"
                style={statusBadgeStyle(s)}
              >
                {s}
              </span>
              <span className="text-xs text-slate-600">
                {NEXT_ACTION_BY_STATUS[s]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Convert to Change Request Modal */}
      {crModalOpp && (
        <SubmitChangeRequestModal
          onClose={() => setCrModalOpp(null)}
          onSubmitted={handleCrSubmitted}
          prefill={{
            client: crModalOpp.client,
            requestType: "Service Addition",
            description: `Expansion opportunity converted to Change Request: ${crModalOpp.opportunity}. Recommended services: ${crModalOpp.recommendedServices.join(", ")}. Estimated revenue impact: $${crModalOpp.estimatedRevenue}/mo.`,
            project: crModalOpp.recommendedServices.join(" / "),
            revenueImpact: crModalOpp.estimatedRevenue,
          }}
        />
      )}
    </div>
  );
}
