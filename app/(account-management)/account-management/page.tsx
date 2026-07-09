"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RoleToggle } from "@/components/am-role-toggle";
import { MASTER_CLIENTS } from "@/lib/mock/master-clients";
import type { MasterClient } from "@/lib/mock/master-clients";
import {
  ALL_CLIENTS,
  ALL_TASKS,
  ALL_ONBOARDING,
  ALL_RENEWALS,
  ALL_HEALTH,
  AM_NAMES,
  SARAH,
  getClientsByAM,
  type AMRole,
} from "@/lib/account-management/role-data";

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
  const [clients, setClients] = useState<MasterClient[]>(MASTER_CLIENTS);
  useEffect(() => {
    fetch("/api/master-clients").then((r) => r.ok ? r.json() : null).then((d: { clients: MasterClient[] } | null) => {
      if (d?.clients) setClients(d.clients);
    }).catch(() => {});
  }, []);
  const clearedClients = clients.filter((c) => c.cleared);
  const needsAssignment = clearedClients.filter(
    (c) => c.activationStatus === "AM Assignment Needed"
  ).length;
  const readyForOnboarding = clearedClients.filter(
    (c) => c.activationStatus === "Ready for Onboarding"
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
  // ── Derive urgent attention items from real data ───────────────────────────
  const criticalClients = ALL_CLIENTS.filter(
    (c) => c.healthStatus === "Critical" || c.healthStatus === "At Risk"
  );
  const overduePayments = ALL_CLIENTS.filter((c) => c.paymentStatus === "Overdue");
  const renewalsDue30 = ALL_RENEWALS.filter((r) => r.daysRemaining <= 30);
  const renewalsDue90 = ALL_RENEWALS.filter((r) => r.daysRemaining <= 90);
  const blockedTasks = ALL_TASKS.filter((t) => t.status === "Blocked");
  const overdueTasks = ALL_TASKS.filter(
    (t) =>
      t.status !== "Completed" &&
      t.dueDate <= "Jun 10" // today proxy for mock data
  );
  const revenueAtRisk = ALL_RENEWALS
    .filter((r) => r.status === "High Risk" || r.status === "At Risk")
    .reduce((sum, r) => {
      const mo = parseFloat(r.contractValue.replace(/[^0-9.]/g, "")) / 12;
      return sum + mo;
    }, 0);
  const avgHealth = Math.round(
    ALL_HEALTH.reduce((a, h) => a + h.healthScore, 0) / ALL_HEALTH.length
  );

  // ── Urgent fire-list items derived from real data ──────────────────────────
  type FireItem = {
    client: string;
    am: string;
    issue: string;
    severity: string;
    dueDate: string;
    href: string;
  };

  const fireList: FireItem[] = [];

  // Critical/At-Risk clients (from ALL_CLIENTS, deduped)
  for (const c of criticalClients) {
    const health = ALL_HEALTH.find((h) => h.client === c.name);
    const renewal = ALL_RENEWALS.find((r) => r.client === c.name);
    const issues: string[] = [];
    if (c.paymentStatus === "Overdue") issues.push("payment overdue");
    if (health?.deliverableStatus === "Blocked" || health?.deliverableStatus === "Delayed")
      issues.push("deliverables blocked");
    if (health?.reportingStatus === "Overdue") issues.push("report overdue");
    if (renewal && renewal.daysRemaining <= 30) issues.push(`renewal in ${renewal.daysRemaining}d`);
    fireList.push({
      client: c.name,
      am: c.assignedAM,
      issue:
        issues.length > 0
          ? issues.map((i) => i.charAt(0).toUpperCase() + i.slice(1)).join(" · ")
          : health?.aiRecommendation ?? "Requires attention",
      severity: c.healthStatus === "Critical" ? "Critical" : "High",
      dueDate: renewal?.renewalDate ?? c.nextCheckin,
      href: "/account-management/client-health",
    });
  }

  // Renewals due ≤ 30 days not already in list
  for (const r of renewalsDue30) {
    if (fireList.some((f) => f.client === r.client)) continue;
    fireList.push({
      client: r.client,
      am: r.assignedAM,
      issue: `Renewal in ${r.daysRemaining} days · Probability ${r.probability}%`,
      severity: r.status === "High Risk" ? "High" : "Medium",
      dueDate: r.renewalDate,
      href: "/account-management/renewals",
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
      severity: t.priority === "High" ? "High" : "Medium",
      dueDate: t.dueDate,
      href: "/account-management/tasks-central",
    });
    coveredClients.add(t.client);
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  fireList.sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));

  // ── AM Workload table ───────────────────────────────────────────────────────
  const workloadRows = AM_NAMES.map((am) => {
    const clients = getClientsByAM(am);
    const onboarding = ALL_ONBOARDING.filter((o) => o.assignedAM === am).length;
    const openT = ALL_TASKS.filter((t) => t.assignedAM === am && t.status !== "Completed").length;
    const atRiskC = clients.filter(
      (c) => c.riskLevel === "High" || c.riskLevel === "Critical"
    ).length;
    const renewals = ALL_RENEWALS.filter(
      (r) => r.assignedAM === am && r.daysRemaining <= 90
    ).length;
    const load =
      clients.length >= 4 || atRiskC >= 2
        ? "High Load"
        : clients.length >= 3
        ? "Active"
        : "Available";
    return { am, clients: clients.length, onboarding, openT, atRiskC, renewals, load };
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
        <div className="p-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Immediate Interventions Required",
              text: "Lakeview Dental: payment 45 days overdue + renewal June 30 — executive call this week is non-negotiable. Harbor Auto: payment overdue, renewal Jul 11, lead volume down 28% — payment must be resolved before renewal window closes.",
              urgency: "border-red-200 bg-white",
            },
            {
              title: "AM Load & Throughput Risk",
              text: "Sarah Chen carries 2 critical accounts simultaneously. James Park has a blocked deliverable (Summit Landscaping LSA docs) preventing department launch. Consider redistributing 1 account from Sarah to Tina in Q3 to reduce critical-client concentration.",
              urgency: "border-orange-200 bg-white",
            },
            {
              title: "Renewal Opportunities This Window",
              text: "Pinnacle HVAC (prob. 95%) — propose GBP + SEO upsell worth $1,200/mo before renewal. Apex Roofing (prob. 92%) — storm season LSA upsell at $800/mo. Both proposals should go out this week to close upsells before renewal.",
              urgency: "border-green-200 bg-white",
            },
            {
              title: "Recommended Manager Actions Today",
              text: "1) Call Lakeview Dental executive. 2) Escalate Harbor Auto payment to billing. 3) Unblock Summit Landscaping LSA docs. 4) Send upsell proposals to Pinnacle HVAC and Apex Roofing. 5) Book Pacific Dental check-in within 48 hrs.",
              urgency: "border-indigo-200 bg-white",
            },
          ].map(({ title, text, urgency }) => (
            <div key={title} className={`rounded-xl border p-4 ${urgency}`}>
              <p className="text-sm font-bold text-slate-800 mb-1.5">{title}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            </div>
          ))}
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
            sub={`of ${ALL_CLIENTS.length} active clients`}
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
            value={renewalsDue90.length}
            sub={`${renewalsDue30.length} critical (≤30 days)`}
            urgent={renewalsDue30.length > 0}
          />
          <KpiCard
            label="Revenue At Risk"
            value={`$${(revenueAtRisk / 1000).toFixed(1)}K/mo`}
            sub="from at-risk renewals"
            urgent={revenueAtRisk > 0}
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
            value={`${avgHealth}/100`}
            sub={avgHealth >= 75 ? "healthy" : avgHealth >= 60 ? "needs attention" : "at risk"}
          />
          <KpiCard
            label="Active Clients"
            value={ALL_CLIENTS.length}
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
//  ACCOUNT MANAGER VIEW  (Sarah Chen — hardcoded for demo)
// ══════════════════════════════════════════════════════════════════════════════

function AMView() {
  const myClients = getClientsByAM(SARAH);
  const myTasks = ALL_TASKS.filter((t) => t.assignedAM === SARAH);
  const myRenewals = ALL_RENEWALS.filter((r) => r.assignedAM === SARAH);
  const myHealth = ALL_HEALTH.filter((h) => h.assignedAM === SARAH);

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
  const seen = new Set<string>(); // dedup by client+action key

  // 1. Critical / At-Risk clients
  const myAtRiskClients = myClients.filter(
    (c) => c.healthStatus === "Critical" || c.healthStatus === "At Risk"
  );
  for (const c of myAtRiskClients) {
    const health = myHealth.find((h) => h.client === c.name);
    const renewal = myRenewals.find((r) => r.client === c.name);
    const issues: string[] = [];
    if (c.paymentStatus === "Overdue") issues.push("payment overdue");
    if (health?.deliverableStatus === "Blocked") issues.push("deliverables blocked");
    if (health?.reportingStatus === "Overdue") issues.push("report overdue");
    if (renewal && renewal.daysRemaining <= 30)
      issues.push(`renewal in ${renewal.daysRemaining} days`);
    const key = `${c.name}-health`;
    if (!seen.has(key)) {
      seen.add(key);
      actions.push({
        client: c.name,
        actionSummary: issues.length > 0 ? issues.join(" · ") : "Client health critical",
        source: "Client Health",
        priority: c.healthStatus === "Critical" ? "Critical" : "High",
        dueDate: c.nextCheckin,
        suggestedAction: health?.aiRecommendation ?? "Review account and take action",
        href: "/account-management/client-health",
      });
    }
  }

  // 2. Renewals due ≤ 30 days not already in list
  const myUrgentRenewals = myRenewals.filter((r) => r.daysRemaining <= 30);
  for (const r of myUrgentRenewals) {
    const key = `${r.client}-renewal`;
    if (!seen.has(key)) {
      seen.add(key);
      actions.push({
        client: r.client,
        actionSummary: `Renewal in ${r.daysRemaining} days · ${r.probability}% probability`,
        source: "Renewals",
        priority: r.status === "High Risk" ? "High" : "Medium",
        dueDate: r.renewalDate,
        suggestedAction: r.nextAction,
        href: "/account-management/renewals",
      });
    }
  }

  // 3. Blocked tasks
  const myBlockedTasks = myTasks.filter((t) => t.status === "Blocked");
  for (const t of myBlockedTasks) {
    const key = `${t.client}-blocked-${t.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      actions.push({
        client: t.client,
        actionSummary: `Task blocked: "${t.task}"`,
        source: "Tasks",
        priority: t.priority === "High" ? "High" : "Medium",
        dueDate: t.dueDate,
        suggestedAction: t.notes || "Unblock this task",
        href: "/account-management/tasks-central",
      });
    }
  }

  // 4. Waiting-for-client tasks
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
        suggestedAction: t.notes || "Follow up with client",
        href: "/account-management/tasks-central",
      });
    }
  }

  // 5. Renewals due ≤ 90 days (lower urgency)
  const myRenewalsDue90 = myRenewals.filter(
    (r) => r.daysRemaining > 30 && r.daysRemaining <= 90
  );
  for (const r of myRenewalsDue90) {
    const key = `${r.client}-renewal90`;
    if (!seen.has(key)) {
      seen.add(key);
      actions.push({
        client: r.client,
        actionSummary: `Renewal due in ${r.daysRemaining} days`,
        source: "Renewals",
        priority: r.upsellOpportunity ? "Medium" : "Low",
        dueDate: r.renewalDate,
        suggestedAction: r.nextAction,
        href: "/account-management/renewals",
      });
    }
  }

  // Sort by priority
  const pOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  actions.sort((a, b) => (pOrder[a.priority] ?? 9) - (pOrder[b.priority] ?? 9));

  // ── Quick KPIs ──────────────────────────────────────────────────────────
  const myOpenTasks = myTasks.filter((t) => t.status !== "Completed").length;
  const myAtRiskCount = myAtRiskClients.length;
  const myRenewalsDue = myRenewals.filter((r) => r.daysRemaining <= 90).length;
  const myCheckinsDue = myClients.filter((c) => c.nextCheckin <= "Jun 15, 2025").length;

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
        <div className="p-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Most Urgent Right Now",
              text: "Lakeview Dental is your most critical account — payment is 45 days overdue and renewal is June 30. A missed renewal here is $18K/yr lost. Call the client today and escalate the payment to billing.",
            },
            {
              title: "Today's Must-Do Actions",
              text: "1) Call Lakeview Dental. 2) Send Harbor Auto payment reminder + escalate. 3) Prepare Lakeview renewal brief (due Jun 12). 4) Follow up on Harbor Auto GBP access request. 5) Send Apex Roofing storm season upsell proposal.",
            },
            {
              title: "Upcoming Check-ins",
              text: "Harbor Auto check-in is overdue (last contact May 15). Schedule immediately. Lakeview Dental check-in due Jun 10. Apex Roofing check-in due Jul 2 — storm season campaign should be the agenda.",
            },
            {
              title: "Upsell Opportunities",
              text: "Apex Roofing: LSA + Call Tracking ($800/mo) aligned to storm season. Harbor Auto: Display Ads expansion ($600/mo) once payment is resolved. Lakeview Dental: GBP Management add-on ($400/mo) if retained.",
            },
          ].map(({ title, text }) => (
            <div key={title} className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-sm font-bold text-slate-800 mb-1.5">{title}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            </div>
          ))}
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
            value={myRenewalsDue}
            sub={`${myRenewals.filter((r) => r.daysRemaining <= 30).length} critical (≤30d)`}
            urgent={myRenewals.filter((r) => r.daysRemaining <= 30).length > 0}
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
            const health = myHealth.find((h) => h.client === c.name);
            const renewal = myRenewals.find((r) => r.client === c.name);
            return (
              <div
                key={c.id}
                className="rounded-xl border p-4 space-y-2"
                style={{
                  background:
                    c.healthStatus === "Critical"
                      ? "#FEF2F2"
                      : c.healthStatus === "At Risk"
                      ? "#FFFBEB"
                      : "var(--rtm-surface)",
                  borderColor:
                    c.healthStatus === "Critical"
                      ? "#FECACA"
                      : c.healthStatus === "At Risk"
                      ? "#FDE68A"
                      : "var(--rtm-border)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.industry} · {c.location}</p>
                  </div>
                  <span
                    className="inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                    style={healthBadgeStyle(c.healthStatus)}
                  >
                    {c.healthStatus}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex gap-2 flex-wrap">
                    {c.services.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-500">
                    <span className="font-semibold text-slate-700">Next check-in:</span>{" "}
                    {c.nextCheckin}
                  </p>
                  {renewal && (
                    <p className="text-slate-500">
                      <span className="font-semibold text-slate-700">Renewal:</span>{" "}
                      {renewal.renewalDate}{" "}
                      <span
                        className={`font-semibold ${
                          renewal.daysRemaining <= 30
                            ? "text-red-600"
                            : renewal.daysRemaining <= 90
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        ({renewal.daysRemaining}d)
                      </span>
                    </p>
                  )}
                  {health?.aiRecommendation && (
                    <p className="text-slate-500 italic">
                      AI: {health.aiRecommendation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
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
