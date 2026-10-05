"use client";

// RTM OS — Project List View (DB-backed, department-scoped)
//
// Route: /projects/view
// Accessible to all authenticated users; the API scopes results per-person.
//
// WHO SEES WHAT:
//   Account Management Manager → all projects
//   Account Management Member  → projects where they are the assigned AM
//   Everyone else              → projects where they own ≥ 1 task
//   Executive / SystemAdmin    → all projects
//
// CONTRACT VALUE:
//   Shown only for Account Management and Executives/SystemAdmins.
//   Absent entirely from the API response for others — not hidden in CSS.

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ScopedProjectListItem } from "@/app/api/projects/scoped/route";

// ── Status badge helpers ──────────────────────────────────────────────────────

type BadgeVariant = "success" | "warning" | "info" | "neutral" | "error";

function statusVariant(s: string): BadgeVariant {
  switch (s) {
    case "active":    return "success";
    case "planned":   return "info";
    case "on_hold":   return "warning";
    case "complete":  return "neutral";
    case "cancelled": return "error";
    default:          return "neutral";
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

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  success: { background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" },
  warning: { background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" },
  info:    { background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" },
  neutral: { background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0" },
  error:   { background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" },
};

function Badge({ variant, label }: { variant: BadgeVariant; label: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={BADGE_STYLES[variant]}
    >
      {label}
    </span>
  );
}

// ── Table primitives ──────────────────────────────────────────────────────────

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"
      style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-alt, #F9FAFB)" }}>
      {children}
    </th>
  );
}

function Td({ children, muted }: { children?: React.ReactNode; muted?: boolean }) {
  return (
    <td className="px-3 py-2.5 text-sm border-b"
      style={{ color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}>
      {children}
    </td>
  );
}

// ── Money formatter ───────────────────────────────────────────────────────────

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectListPage() {
  const [records, setRecords] = useState<ScopedProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects/scoped");
      const data = await res.json() as { records?: ScopedProjectListItem[]; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
      setRecords(data.records ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = records.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.domain.toLowerCase().includes(q) ||
      r.displayName.toLowerCase().includes(q) ||
      (r.assignedAMName ?? "").toLowerCase().includes(q)
    );
  });

  const showMoney = records.some((r) => r.monthlyValueCents !== undefined);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--rtm-blue)" }}>
            Projects
          </p>
          <h1 className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}>
            My Projects
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Projects you own or are assigned to. Click a project to see its tasks.
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="text-sm font-semibold px-4 py-2 rounded-lg border"
          style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-surface)" }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Search */}
      {!loading && records.length > 0 && (
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by client, domain, or AM…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 max-w-sm rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
          />
          <span className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {filtered.length} of {records.length}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border-light)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client / Domain</Th>
                <Th>AM</Th>
                <Th>Status</Th>
                <Th>Open Tasks</Th>
                <Th>Done Tasks</Th>
                {showMoney && <Th>MRR</Th>}
                <Th>Start</Th>
                <Th>End</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={showMoney ? 9 : 8} className="px-4 py-12 text-center text-sm"
                    style={{ color: "var(--rtm-text-muted)" }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={showMoney ? 9 : 8} className="px-4 py-8 text-center text-sm text-red-600 font-medium">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={showMoney ? 9 : 8} className="px-4 py-16 text-center"
                    style={{ color: "var(--rtm-text-muted)" }}>
                    <p className="text-sm font-semibold mb-1">No projects yet</p>
                    <p className="text-xs">
                      {records.length === 0
                        ? "No projects are assigned to you or contain your tasks."
                        : "No projects match your search."}
                    </p>
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.map((r) => {
                const overdueOpen = r.openTaskCount > 0;
                return (
                  <tr key={r.id}
                    className="transition-colors"
                    style={{ background: "var(--rtm-bg)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg-alt, #F9FAFB)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg)"; }}
                  >
                    <Td>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>
                          {r.displayName || r.name}
                        </p>
                        {r.domain && (
                          <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                            {r.domain}
                          </p>
                        )}
                      </div>
                    </Td>
                    <Td muted>{r.assignedAMName ?? "—"}</Td>
                    <Td>
                      <Badge variant={statusVariant(r.status)} label={statusLabel(r.status)} />
                    </Td>
                    <Td>
                      <span
                        className="font-semibold tabular-nums"
                        style={{ color: r.openTaskCount > 0 ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)" }}
                      >
                        {r.openTaskCount}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-semibold tabular-nums" style={{ color: "#059669" }}>
                        {r.doneTaskCount}
                      </span>
                    </Td>
                    {showMoney && (
                      <Td>
                        {r.monthlyValueCents !== undefined ? (
                          <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                            {money(r.monthlyValueCents)}/mo
                          </span>
                        ) : null}
                      </Td>
                    )}
                    <Td muted>
                      {r.startDate
                        ? new Date(r.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </Td>
                    <Td muted>
                      {r.endDate
                        ? new Date(r.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </Td>
                    <Td>
                      <Link
                        href={`/projects/view/${r.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border whitespace-nowrap"
                        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", color: "var(--rtm-blue)", textDecoration: "none" }}
                      >
                        View →
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
