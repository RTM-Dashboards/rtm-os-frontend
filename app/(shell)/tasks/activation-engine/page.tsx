"use client";

// =============================================================================
// Activation Engine
// Route: /tasks/activation-engine
//
// ADMIN-WIDE view of the real activation pipeline.
// Data source: /api/projects/scoped (Postgres, visibility-scoped).
//
// VISIBILITY RULES (enforced by the API, not by this page):
//   Executives and SystemAdmins see everything.
//   AM Manager sees all projects.
//   AM Member sees projects where they are the assignedAM.
//   Everyone else sees projects where they own >= 1 task.
//   monthlyValueCents is absent from the API response for non-AM / non-Executive
//   callers -- it is not hidden in CSS, it is not sent at all.
//
// REMOVED FROM MOCK VERSION:
//   - "Cleared Clients Awaiting Activation" table (MASTER_CLIENTS has no
//     Postgres equivalent; Business has no `cleared` field).
//   - Project health badge, project health KPI, SLA %, milestone counts,
//     flaggedOverdue -- none of these exist in Postgres.
//   - Billing Blocked KPI -- sourced from MASTER_CLIENTS; no Postgres source.
//
// EMPTY STATE:
//   Projects are empty right now. All KPIs will be 0 and the table will
//   show "No projects yet" -- that is honest and correct.
// =============================================================================

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ScopedProjectListItem } from "@/app/api/projects/scoped/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function money(cents: number): string {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 }) + "/mo";
}

function statusStyle(s: string): React.CSSProperties {
  switch (s) {
    case "active":    return { background: "#ECFDF5", color: "#059669",  borderColor: "#A7F3D0" };
    case "planned":   return { background: "#EFF6FF", color: "#1D4ED8",  borderColor: "#BFDBFE" };
    case "on_hold":   return { background: "#FFFBEB", color: "#B45309",  borderColor: "#FDE68A" };
    case "complete":  return { background: "#F8FAFC", color: "#64748B",  borderColor: "#E2E8F0" };
    case "cancelled": return { background: "#FEF2F2", color: "#DC2626",  borderColor: "#FECACA" };
    default:          return { background: "#F8FAFC", color: "#64748B",  borderColor: "#E2E8F0" };
  }
}

function statusLabel(s: string): string {
  switch (s) {
    case "active":    return "Active";
    case "planned":   return "Planned";
    case "on_hold":   return "On Hold";
    case "complete":  return "Complete";
    case "cancelled": return "Cancelled";
    default:          return s;
  }
}

function KpiCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  highlight?: "blue" | "green" | "red" | "amber";
}) {
  const colorMap = {
    blue:  "text-blue-700",
    green: "text-emerald-600",
    red:   "text-red-600",
    amber: "text-amber-600",
  };
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: "var(--rtm-text-secondary)" }}
      >
        {label}
      </span>
      <span
        className={`text-2xl font-black ${highlight ? colorMap[highlight] : ""}`}
        style={!highlight ? { color: "var(--rtm-text-primary)" } : undefined}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ActivationEnginePage() {
  const [records, setRecords] = useState<ScopedProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/projects/scoped");
      const data = (await res.json()) as { records?: ScopedProjectListItem[]; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
      setRecords(data.records ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Derived KPIs from Postgres data
  const kpis = useMemo(() => {
    const active    = records.filter((r) => r.status === "active").length;
    const planned   = records.filter((r) => r.status === "planned").length;
    const open      = records.reduce((s, r) => s + r.openTaskCount, 0);
    const done      = records.reduce((s, r) => s + r.doneTaskCount, 0);
    const showMoney = records.some((r) => r.monthlyValueCents !== undefined);
    const mrr       = showMoney
      ? records.reduce((s, r) => s + (r.monthlyValueCents ?? 0), 0)
      : null;
    return { total: records.length, active, planned, open, done, mrr, showMoney };
  }, [records]);

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.displayName.toLowerCase().includes(q) ||
        (r.assignedAMName ?? "").toLowerCase().includes(q)
    );
  }, [records, search]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--rtm-blue)" }}
            >
              Projects &amp; Tasks
            </p>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>›</span>
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Activation Engine
            </p>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Activation Engine
          </h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--rtm-text-secondary)" }}>
            Admin-wide view of activated client projects. Data is read from Postgres and scoped to
            what you are permitted to see. Activation is performed by AM via the{" "}
            <Link
              href="/account-management/projects"
              className="font-semibold underline"
              style={{ color: "var(--rtm-blue)" }}
            >
              Projects wizard
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => void load()}
            className="px-4 py-2 text-sm font-semibold rounded-lg border"
            style={{
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
              background: "var(--rtm-surface)",
            }}
          >
            ↻ Refresh
          </button>
          <Link
            href="/account-management/projects"
            className="px-4 py-2 text-sm font-bold rounded-lg text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            Activate via AM Wizard →
          </Link>
          <Link
            href="/tasks/activation-rules"
            className="px-4 py-2 text-sm font-semibold rounded-lg border"
            style={{
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
              background: "var(--rtm-surface)",
            }}
          >
            Activation Rules
          </Link>
        </div>
      </div>

      {/* Flow indicator */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-center gap-2"
        style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE" }}
      >
        {[
          "Billing Clears Client",
          "AM Runs Wizard",
          "Project Created in Postgres",
          "Tasks Generated",
          "Depts Activated",
          "Onboarding Handoff",
        ].map((step, i, arr) => (
          <span key={step} className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white"
              style={{ color: "#1E40AF", border: "1px solid #BFDBFE" }}
            >
              {step}
            </span>
            {i < arr.length - 1 && (
              <span className="font-black" style={{ color: "#93C5FD" }}>
                →
              </span>
            )}
          </span>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiCard
          label="Total Projects"
          value={loading ? "…" : kpis.total}
          sub="visible to you"
        />
        <KpiCard
          label="Active"
          value={loading ? "…" : kpis.active}
          highlight="green"
          sub="status = active"
        />
        <KpiCard
          label="Planned"
          value={loading ? "…" : kpis.planned}
          highlight="blue"
          sub="status = planned"
        />
        <KpiCard
          label="Open / In-Progress Tasks"
          value={loading ? "…" : kpis.open}
          highlight={kpis.open > 0 ? "blue" : undefined}
          sub="across all your projects"
        />
        <KpiCard
          label="Completed Tasks"
          value={loading ? "…" : kpis.done}
          highlight="green"
          sub="status = done"
        />
        {kpis.showMoney && (
          <KpiCard
            label="Total MRR"
            value={loading ? "…" : money(kpis.mrr ?? 0)}
            highlight="green"
            sub="sum of visible projects"
          />
        )}
      </div>

      {/* Search */}
      {!loading && records.length > 0 && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
        >
          <input
            type="text"
            placeholder="Search by project name, client or AM…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg outline-none"
            style={{
              border: "1px solid var(--rtm-border)",
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-primary)",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-semibold"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Projects Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--rtm-border)" }}
        >
          <div>
            <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
              Activated Projects
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Live from Postgres — scoped to what you are permitted to see.
            </p>
          </div>
        </div>

        {loadError && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-semibold text-red-600">{loadError}</p>
            <button
              onClick={() => void load()}
              className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg border"
              style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
            >
              Retry
            </button>
          </div>
        )}

        {loading && !loadError && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading…</p>
          </div>
        )}

        {!loading && !loadError && filtered.length === 0 && (
          <div className="px-5 py-16 text-center">
            <p className="text-base font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
              {records.length === 0
                ? "No projects yet."
                : "No projects match your search."}
            </p>
            {records.length === 0 && (
              <p className="text-xs mt-2 max-w-sm mx-auto" style={{ color: "var(--rtm-text-muted)" }}>
                Projects will appear here once Account Management activates a client via the AM
                wizard. Account Management is importing real clients today.
              </p>
            )}
            {records.length === 0 && (
              <div className="mt-5">
                <Link
                  href="/account-management/projects"
                  className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg text-white"
                  style={{ background: "var(--rtm-blue)" }}
                >
                  Activate a Client via AM Wizard →
                </Link>
              </div>
            )}
          </div>
        )}

        {!loading && !loadError && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "2px solid var(--rtm-border)",
                }}
              >
                <tr>
                  {[
                    "Project / Client",
                    "AM",
                    "Status",
                    "Open Tasks",
                    "Done Tasks",
                    ...(kpis.showMoney ? ["MRR"] : []),
                    "Start",
                    "End",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--rtm-text-secondary)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="hover:bg-blue-50/20 transition-colors"
                    style={{
                      borderBottom:
                        idx < filtered.length - 1
                          ? "1px solid var(--rtm-border-light)"
                          : undefined,
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>
                        {r.displayName || r.name}
                      </div>
                      {r.domain && (
                        <div className="text-[11px] font-mono mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                          {r.domain}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                      {r.assignedAMName ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                        style={statusStyle(r.status)}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-xs font-semibold tabular-nums"
                      style={{ color: r.openTaskCount > 0 ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)" }}
                    >
                      {r.openTaskCount}
                    </td>
                    <td
                      className="px-4 py-3 text-xs font-semibold tabular-nums"
                      style={{ color: "#059669" }}
                    >
                      {r.doneTaskCount}
                    </td>
                    {kpis.showMoney && (
                      <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>
                        {r.monthlyValueCents !== undefined ? money(r.monthlyValueCents) : ""}
                      </td>
                    )}
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>
                      {r.startDate
                        ? new Date(r.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>
                      {r.endDate
                        ? new Date(r.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/projects/${r.id}`}
                        className="text-[11px] font-semibold hover:underline whitespace-nowrap"
                        style={{ color: "var(--rtm-blue)" }}
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cross-links to sibling pages */}
      {!loading && !loadError && records.length > 0 && (
        <div
          className="rounded-xl px-5 py-4 text-xs"
          style={{
            background: "var(--rtm-bg)",
            border: "1px solid var(--rtm-border)",
            color: "var(--rtm-text-muted)",
          }}
        >
          For department-level task breakdowns, see{" "}
          <Link
            href="/tasks/department-activation"
            className="font-semibold hover:underline"
            style={{ color: "var(--rtm-blue)" }}
          >
            Department Activation
          </Link>
          . For throughput and workload planning, see{" "}
          <Link
            href="/tasks/workload-planning"
            className="font-semibold hover:underline"
            style={{ color: "var(--rtm-blue)" }}
          >
            Workload Planning
          </Link>
          .
        </div>
      )}
    </div>
  );
}
