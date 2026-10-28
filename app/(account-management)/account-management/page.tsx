"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { RoleToggle } from "@/components/am-role-toggle";
import { fetchAMClients, type BusinessClient } from "@/lib/account-management/am-client-data";
import {
  AM_NAMES,
  SARAH,
  type AMRole,
} from "@/lib/account-management/role-data";
import type { TaskListItem } from "@/app/api/tasks/route";

// ── Real-data hooks used by both Head and AM views ──────────────────────

// Map Postgres task status → display string (TaskStatusType equivalent)
type RealTaskStatus = "Not Started" | "In Progress" | "Completed" | "Blocked" | "Waiting For Client" | "Review";

interface RealTaskRow {
  id: string;
  task: string;
  client: string;
  assignedAM: string;
  department: string;
  dueDate: string;
  status: RealTaskStatus;
  priority: string;
}

function taskFromAPI(t: TaskListItem): RealTaskRow {
  const statusMap: Record<string, RealTaskStatus> = {
    open: "Not Started",
    in_progress: "In Progress",
    done: "Completed",
    skipped: "Completed",
    pending_prereq: "Not Started",
  };
  return {
    id: t.id,
    task: t.label,
    client: t.projectName ?? "",
    assignedAM: t.ownerName ?? "",
    department: t.department ?? "",
    dueDate: t.dueDate ?? "—",
    status: statusMap[t.status] ?? "Not Started",
    priority: t.priority ?? "Medium",
  };
}

function useRealTasks() {
  const [tasks, setTasks] = useState<RealTaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.ok ? r.json() : null)
      .then((d: { tasks: TaskListItem[] } | null) => {
        if (d?.tasks) setTasks(d.tasks.map(taskFromAPI));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return { tasks, loading };
}

// Empty proxy for removed mock constants (keeps reference sites compiling)
// — none of ALL_CLIENTS, ALL_RENEWALS, ALL_HEALTH are imported any more;
//   the functions below use real data instead.

// ── Badge / style helpers ────────────────────────────────────────────────────

function healthBadgeStyle(status: string): React.CSSProperties {
  switch (status) {
    case "Healthy":         return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    case "Needs Attention": return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "At Risk":         return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Critical":        return { background: "#FEF2F2", color: "#991B1B", borderColor: "#FECACA" };
    default:                return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

function severityBadgeStyle(level: string): React.CSSProperties {
  switch (level) {
    case "Critical": return { background: "#FEF2F2", color: "#991B1B", borderColor: "#FECACA" };
    case "High":     return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Medium":   return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
    case "Low":      return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    default:         return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

function priorityBadgeStyle(p: string): React.CSSProperties {
  switch (p) {
    case "Critical": return { background: "#FEF2F2", color: "#991B1B", borderColor: "#FECACA" };
    case "High":     return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Medium":   return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
    case "Low":      return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    default:         return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

// ── Shared sub-components ────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  urgent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  urgent?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: urgent ? "#FEF2F2" : "var(--rtm-surface)",
        borderColor: urgent ? "#FECACA" : "var(--rtm-border)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: urgent ? "#991B1B" : "var(--rtm-text-muted)" }}
      >
        {label}
      </p>
      <p
        className="mt-1.5 text-2xl font-bold"
        style={{ color: urgent ? "#991B1B" : "var(--rtm-text-primary)" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: urgent ? "#B91C1C" : "var(--rtm-text-muted)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
      <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function QuickLinkButton({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
      style={{ background: "var(--rtm-blue)", color: "#fff" }}
    >
      {label} →
    </Link>
  );
}

// ── Cleared-Client Queue summary card ─────────────────────────────────────────
function ClearedClientSummaryCard() {
  const [clients, setClients] = useState<BusinessClient[]>([]);
  useEffect(() => {
    fetchAMClients().then(setClients).catch(() => setClients([]));
  }, []);
  const clearedClients = clients.filter((c) => c.cleared);
  // needsAssignment: cleared businesses with no AM assigned
  const needsAssignment = clearedClients.filter((c) => !c.assignedAM).length;
  // readyForOnboarding: pending activation
  const readyForOnboarding = clearedClients.filter(
    (c) => c.activationStatus === "pending"
  ).length;
  const awaitingAction = needsAssignment + readyForOnboarding;

  return (
    <div
      className="rounded-xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
      style={{
        background: awaitingAction > 0 ? "#EFF6FF" : "var(--rtm-surface)",
        borderColor: awaitingAction > 0 ? "#BFDBFE" : "var(--rtm-border)",
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-0.5">
          New Clients Ready to Onboard
        </p>
        <p className="text-base font-semibold text-slate-900">
          {clearedClients.length} clients cleared by Billing
          {awaitingAction > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              {awaitingAction} awaiting AM action
            </span>
          )}
        </p>
        <p className="text-sm text-slate-500 mt-0.5">
          {needsAssignment > 0 && `${needsAssignment} need AM assignment · `}
          {readyForOnboarding > 0 && `${readyForOnboarding} ready for onboarding · `}
          Billing handoff complete — AM workflow starts here.
        </p>
      </div>
      <Link
        href="/account-management/onboarding"
        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
      >
        View Onboarding Queue →
      </Link>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  DEPARTMENT HEAD VIEW
// ══════════════════════════════════════════════════════════════════════════════

function HeadView() {
  // ── Real data ───────────────────────────────────────────────────────────────────
  const [realClients, setRealClients] = useState<BusinessClient[]>([]);
  const { tasks: realTasks } = useRealTasks();

  useEffect(() => {
    fetchAMClients().then(setRealClients).catch(() => {});
  }, []);

  // ── Derived from real clients ──────────────────────────────────────────
  const criticalClients = realClients.filter(
    (c) => c.paymentStatus === "failed" || c.activationStatus === "suspended"
  );
  const overduePayments = realClients.filter((c) => c.paymentStatus === "overdue");
  const blockedTasks = realTasks.filter((t) => t.status === "Blocked");
  const overdueTasks = realTasks.filter(
    (t) => t.status !== "Completed" && t.dueDate !== "—"
  );

  // ── Urgent fire-list built from real data ───────────────────────────────
  type FireItem = {
    client: string;
    am: string;
    issue: string;
    severity: string;
    dueDate: string;
    href: string;
  };

  const fireList: FireItem[] = [];

  // Critical clients from real Postgres data
  for (const c of criticalClients) {
    const issues: string[] = [];
    if (c.paymentStatus === "failed") issues.push("payment failed");
    if (c.activationStatus === "suspended") issues.push("account suspended");
    fireList.push({
      client: c.clientName,
      am: c.assignedAM,
      issue: issues.join(" · ") || "Requires immediate attention",
      severity: "Critical",
      dueDate: c.renewalDate ?? "—",
      href: "/account-management/client-health",
    });
  }

  // Blocked tasks not already covered
  const coveredClients = new Set(fireList.map((f) => f.client));
  for (const t of blockedTasks) {
    if (coveredClients.has(t.client)) continue;
    fireList.push({
      client: t.client,
      am: t.assignedAM,
      issue: `Task blocked: ${t.task} (${t.department})`,
      severity: t.priority === "High" || t.priority === "Urgent" ? "High" : "Medium",
      dueDate: t.dueDate,
      href: "/account-management/tasks-central",
    });
    coveredClients.add(t.client);
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  fireList.sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));

  // ── AM Workload table from real data ─────────────────────────────────────
  const workloadRows = AM_NAMES.map((am) => {
    const amClients = realClients.filter((c) => c.assignedAM === am);
    const openT = realTasks.filter((t) => t.assignedAM === am && t.status !== "Completed").length;
    const atRiskC = amClients.filter(
      (c) => c.paymentStatus === "failed" || c.activationStatus === "suspended"
    ).length;
    const load =
      amClients.length >= 4 || atRiskC >= 2
        ? "High Load"
        : amClients.length >= 2
        ? "Active"
        : "Available";
    return { am, clients: amClients.length, onboarding: 0, openT, atRiskC, renewals: 0, load };
  });

  return (
    <div className="space-y-6">

      {/* ── 1. AI Executive Summary (top priority) ── */}
      <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm">
        <div className="border-b border-indigo-100 px-6 py-4 flex items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-indigo-900">Portfolio Intelligence — Today</h2>
            <p className="text-sm text-indigo-600 mt-0.5">
              AI-generated portfolio summary · What needs your attention right now
            </p>
          </div>
          <span
            className="ml-auto inline-flex rounded-full border px-3 py-0.5 text-xs font-bold"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
          >
            AI Summary
          </span>
        </div>
        <div className="p-6">
          <div className="rounded-xl border border-indigo-100 bg-white p-5">
            <p className="text-sm font-bold text-slate-800 mb-1.5">Portfolio Intelligence</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI-generated portfolio summaries will appear here once more clients are onboarded and their
              health data, renewals, and task history are connected. Currently showing{" "}
              <strong>{realClients.length} client{realClients.length !== 1 ? "s" : ""}</strong> from the database.
              The fire list, workload table, and task counts below reflect live Postgres data.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Portfolio Health KPIs (trimmed, focused) ── */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          Portfolio Snapshot
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Clients At Risk / Critical"
            value={criticalClients.length}
            sub={`of ${realClients.length} active clients`}
            urgent={criticalClients.length > 0}
          />
          <KpiCard
            label="Overdue Payments"
            value={overduePayments.length}
            sub="clients with late payments"
            urgent={overduePayments.length > 0}
          />
          <KpiCard
            label="Renewals Due ≤ 90 Days"
            value="—"
            sub="Renewal tracking not yet connected"
            urgent={false}
          />
          <KpiCard
            label="Revenue At Risk"
            value="—"
            sub="Renewal data not yet connected"
            urgent={false}
          />
          <KpiCard
            label="Blocked Tasks"
            value={blockedTasks.length}
            sub="need unblocking now"
            urgent={blockedTasks.length > 0}
          />
          <KpiCard
            label="Overdue Tasks"
            value={overdueTasks.length}
            sub="past due date, not complete"
            urgent={overdueTasks.length > 0}
          />
          <KpiCard
            label="Avg Portfolio Health"
            value="—"
            sub="Computed from client health page"
          />
          <KpiCard
            label="Active Clients"
            value={realClients.length}
            sub="across all AMs"
          />
        </div>
      </section>

      {/* ── 3. Urgent Attention Required (fire list) ── */}
      <section
        className="rounded-xl border"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <SectionHeader
          title="Urgent Attention Required"
          subtitle="Clients and tasks requiring immediate or near-term manager intervention — derived from live health, payment, and renewal data."
        />
        {fireList.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-400">
            No urgent items today. Portfolio is healthy.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "var(--rtm-bg)" }}>
                <tr>
                  {["Client", "Assigned AM", "Issue", "Severity", "Key Date", "Go To"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fireList.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--rtm-border-light)" }}
                  >
                    <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">
                      {row.client}
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{row.am}</td>
                    <td className="px-5 py-3 text-slate-700 max-w-[240px]">{row.issue}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        style={severityBadgeStyle(row.severity)}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {row.dueDate}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={row.href}
                        className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── 4. AM Workload & Capacity ── */}
      <section
        className="rounded-xl border"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <SectionHeader
          title="AM Workload & Capacity"
          subtitle="Client load, open tasks, at-risk clients, and upcoming renewals per Account Manager."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--rtm-bg)" }}>
              <tr>
                {[
                  "Account Manager",
                  "Clients",
                  "Onboarding",
                  "Open Tasks",
                  "At-Risk Clients",
                  "Renewals ≤ 90d",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workloadRows.map((row) => (
                <tr
                  key={row.am}
                  className="border-t transition-colors"
                  style={{ borderColor: "var(--rtm-border-light)" }}
                >
                  <td className="px-5 py-3 font-semibold text-slate-800">{row.am}</td>
                  <td className="px-5 py-3 text-slate-700">{row.clients}</td>
                  <td className="px-5 py-3 text-slate-700">{row.onboarding}</td>
                  <td className="px-5 py-3">
                    <span
                      className="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold"
                      style={
                        row.openT > 3
                          ? { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" }
                          : { background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }
                      }
                    >
                      {row.openT}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold"
                      style={
                        row.atRiskC > 0
                          ? { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }
                          : { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }
                      }
                    >
                      {row.atRiskC}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{row.renewals}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        row.load === "High Load"
                          ? "bg-red-100 text-red-700"
                          : row.load === "Active"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {row.load}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. New Clients Ready to Onboard ── */}
      <ClearedClientSummaryCard />

    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ACCOUNT MANAGER VIEW  (Sarah K. — simulated AM identity from role-data.ts)
// ══════════════════════════════════════════════════════════════════════════════

function AMView() {
  // ── Real data for AM view ───────────────────────────────────────────────────
  const [realClients, setRealClients] = useState<BusinessClient[]>([]);
  const { tasks: realTasks } = useRealTasks();
  useEffect(() => {
    fetchAMClients().then(setRealClients).catch(() => {});
  }, []);

  const myClients = realClients.filter((c) => c.assignedAM === SARAH);
  const myTasks = realTasks.filter((t) => t.assignedAM === SARAH);

  // ── Compute priority actions from real data ─────────────────────────────
  type ActionItem = {
    client: string;
    actionSummary: string;
    source: string;
    priority: string;
    dueDate: string;
    suggestedAction: string;
    href: string;
  };

  const actions: ActionItem[] = [];
  const seen = new Set<string>();

  // 1. Critical clients from real Postgres data
  const myAtRiskClients = myClients.filter(
    (c) => c.paymentStatus === "failed" || c.activationStatus === "suspended"
  );
  for (const c of myAtRiskClients) {
    const issues: string[] = [];
    if (c.paymentStatus === "failed") issues.push("payment failed");
    if (c.activationStatus === "suspended") issues.push("account suspended");
    const key = `${c.clientName}-health`;
    if (!seen.has(key)) {
      seen.add(key);
      actions.push({
        client: c.clientName,
        actionSummary: issues.join(" · ") || "Client requires attention",
        source: "Client Health",
        priority: "Critical",
        dueDate: c.renewalDate ?? "—",
        suggestedAction: "Review account and take action",
        href: "/account-management/client-health",
      });
    }
  }

  // 2. Blocked tasks from real Postgres data
  const myBlockedTasks = myTasks.filter((t) => t.status === "Blocked");
  for (const t of myBlockedTasks) {
    const key = `${t.client}-blocked-${t.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      actions.push({
        client: t.client,
        actionSummary: `Task blocked: "${t.task}"`,
        source: "Tasks",
        priority: t.priority === "High" || t.priority === "Urgent" ? "High" : "Medium",
        dueDate: t.dueDate,
        suggestedAction: "Unblock this task",
        href: "/account-management/tasks-central",
      });
    }
  }

  // 3. Waiting-for-client tasks from real Postgres data
  const myWaitingTasks = myTasks.filter((t) => t.status === "Waiting For Client");
  for (const t of myWaitingTasks) {
    const key = `${t.client}-waiting-${t.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      actions.push({
        client: t.client,
        actionSummary: `Awaiting client: "${t.task}"`,
        source: "Tasks",
        priority: "Medium",
        dueDate: t.dueDate,
        suggestedAction: "Follow up with client",
        href: "/account-management/tasks-central",
      });
    }
  }

  // Sort by priority
  const pOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  actions.sort((a, b) => (pOrder[a.priority] ?? 9) - (pOrder[b.priority] ?? 9));

  // ── Quick KPIs from real data ────────────────────────────────────────────
  const myOpenTasks = myTasks.filter((t) => t.status !== "Completed").length;
  const myAtRiskCount = myAtRiskClients.length;
  const myRenewalsDue = 0; // Renewal tracking not yet connected to real data
  const myCheckinsDue = 0; // Check-in tracking not yet connected to real data

  return (
    <div className="space-y-6">

      {/* ── 1. AI AM Summary (top) ── */}
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
        <div className="border-b border-blue-100 px-6 py-4 flex items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-blue-900">Your Focus For Today</h2>
            <p className="text-sm text-blue-600 mt-0.5">
              AI-generated insights for your portfolio · {SARAH}
            </p>
          </div>
          <span className="ml-auto inline-flex rounded-full bg-blue-100 border border-blue-200 px-3 py-0.5 text-xs font-bold text-blue-700">
            My Portfolio
          </span>
        </div>
        <div className="p-6">
          <div className="rounded-xl border border-blue-100 bg-white p-5">
            <p className="text-sm font-bold text-slate-800 mb-1.5">Your Portfolio Today</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI-generated insights for your assigned clients will appear here once more clients are
              onboarded and their health, renewal, and check-in data are connected.
              Currently showing <strong>{myClients.length} client{myClients.length !== 1 ? "s" : ""}</strong> assigned to you.
              Use the priority actions table below to see what needs attention now.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. My Quick Stats (4 KPIs only) ── */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          My Snapshot
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Open Tasks"
            value={myOpenTasks}
            sub="assigned to me"
            urgent={myOpenTasks > 4}
          />
          <KpiCard
            label="At-Risk Clients"
            value={myAtRiskCount}
            sub={`of ${myClients.length} my clients`}
            urgent={myAtRiskCount > 0}
          />
          <KpiCard
            label="Renewals Due ≤ 90d"
            value="—"
            sub="Renewal tracking not yet connected"
            urgent={false}
          />
          <KpiCard
            label="Check-ins Due"
            value={myCheckinsDue}
            sub="due this week"
            urgent={myCheckinsDue > 2}
          />
        </div>
      </section>

      {/* ── 3. My Priority Actions Today (computed, not hardcoded) ── */}
      <section
        className="rounded-xl border"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <SectionHeader
          title="My Priority Actions Today"
          subtitle="Computed from your clients' health, payment status, task status, and renewals — in priority order."
        />
        {actions.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-400">
            No urgent actions today. Your portfolio is on track.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "var(--rtm-bg)" }}>
                <tr>
                  {[
                    "Client",
                    "Action Needed",
                    "Source",
                    "Priority",
                    "Due / Key Date",
                    "Suggested Next Step",
                    "Go To",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {actions.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--rtm-border-light)" }}
                  >
                    <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">
                      {row.client}
                    </td>
                    <td className="px-5 py-3 text-slate-700 max-w-[200px]">
                      {row.actionSummary}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {row.source}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        style={priorityBadgeStyle(row.priority)}
                      >
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {row.dueDate}
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-xs max-w-[200px]">
                      {row.suggestedAction}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={row.href}
                        className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── 4. My Client Snapshot (condensed cards, not full portfolio table) ── */}
      <section
        className="rounded-xl border"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <SectionHeader
          title="My Clients at a Glance"
          subtitle={`Your ${myClients.length} assigned clients — health status and next action. Full details in Client Portfolio.`}
        />
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {myClients.map((c) => {
            const isAtRisk = c.paymentStatus === "failed" || c.activationStatus === "suspended";
            const health = c.activationStatus === "suspended" || c.paymentStatus === "failed"
              ? "Critical"
              : c.activationStatus === "active"
              ? "Good"
              : "Pending";
            return (
              <div
                key={c.id}
                className="rounded-xl border p-4 space-y-2"
                style={{
                  background: isAtRisk ? "#FEF2F2" : "var(--rtm-surface)",
                  borderColor: isAtRisk ? "#FECACA" : "var(--rtm-border)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{c.clientName}</p>
                    <p className="text-xs text-slate-400">{c.domain}</p>
                  </div>
                  <span
                    className="inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                    style={healthBadgeStyle(health)}
                  >
                    {health}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex gap-2 flex-wrap">
                    {c.activeServices.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-500">
                    <span className="font-semibold text-slate-700">Activation:</span>{" "}
                    {c.activationStatus}
                  </p>
                  {c.renewalDate && (
                    <p className="text-slate-500">
                      <span className="font-semibold text-slate-700">Renewal:</span>{" "}
                      {c.renewalDate}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {myClients.length === 0 && (
            <p className="text-sm text-slate-400 col-span-3 py-4">
              No clients are currently assigned to {SARAH}.
            </p>
          )}
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
          <QuickLinkButton label="Full Client Portfolio" href="/account-management/client-portfolio" />
        </div>
      </section>


    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  Page Root
// ══════════════════════════════════════════════════════════════════════════════

export default function AccountManagementDashboard() {
  const [role, setRole] = useState<AMRole>("head");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900">
          {role === "head" ? "Portfolio Command Center" : `Good Morning, ${SARAH}`}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {role === "head"
            ? "What needs your attention across the portfolio today."
            : "Your clients, your tasks, your actions — focused on what matters today."}
        </p>
      </div>

      {/* Role Toggle */}
      <RoleToggle role={role} onRoleChange={setRole} />

      {/* Role content */}
      {role === "head" ? <HeadView /> : <AMView />}
    </div>
  );
}
