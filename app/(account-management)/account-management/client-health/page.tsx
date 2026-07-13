"use client";

/**
 * RTM OS — Client Health Engine
 * Route: /account-management/client-health
 *
 * DATA SOURCES (Phase 1 — real):
 *   /api/master-clients  → MasterClient records (MRR, billing status, renewal, activation)
 *   /api/engine          → Projects + Tasks per client (task completion, blocked, overdue)
 *
 * HEALTH SCORE: computed via shared computeHealth() + computeClientHealthScore()
 *   from lib/mock/master-clients.ts — NO parallel formula.
 *
 * DEFERRED (badged "Preview — Target State"):
 *   Interventions view, Executive view, Escalations tab, Call Intelligence tab,
 *   Reporting tab, Expansion tab, AI Summary tab.
 *
 * Communications tab: links out to /tasks/collaboration (Collaboration Hub).
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  MASTER_CLIENTS,
  computeHealth,
  computeClientHealthScore,
  computePriority,
  RENEWAL_URGENT_DAYS,
  type MasterClient,
  type HealthStatus,
  type TaskHealthSignals,
} from "@/lib/mock/master-clients";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Enriched view model built from real MASTER_CLIENTS + real engine task data. */
interface ClientHealthVM {
  // from MasterClient
  id: string;
  slug: string;
  clientName: string;
  industry: string;
  assignedAM: string;
  avatarColor: string;
  billingStatus: MasterClient["billingStatus"];
  paymentStatus: MasterClient["paymentStatus"];
  cancellationStatus: MasterClient["cancellationStatus"];
  activationStatus: MasterClient["activationStatus"];
  mrr: number;
  renewalDate: string;
  renewalStatus: string;
  activeServices: string[];
  cleared: boolean;
  recentEvents: MasterClient["recentEvents"];
  notes: string;
  nextRequiredAction: string;
  // computed
  health: HealthStatus;           // categorical tier
  healthScore: number;            // 0-100 numeric
  priority: MasterClient["priority"];
  daysToRenewal: number | null;
  // task signals (from engine, may be null if client has no engine project)
  taskSignals: TaskHealthSignals | null;
}

interface EngineTask {
  id: string;
  projectId: string;
  status: "Open" | "In Progress" | "Waiting" | "Completed" | string;
  dueDate?: string;
}

interface EngineProject {
  id: string;
  clientId?: string;
  name: string;
  status: string;
  health?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

function daysUntilDate(isoDate: string): number | null {
  if (!isoDate || isoDate === "—") return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  if (isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

function fmt$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#059669";
  if (score >= 60) return "#D97706";
  if (score >= 40) return "#EA580C";
  return "#DC2626";
}

function scoreBg(score: number) {
  if (score >= 80) return { bg: "#ECFDF5", border: "#A7F3D0", text: "#059669" };
  if (score >= 60) return { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309" };
  if (score >= 40) return { bg: "#FFF7ED", border: "#FED7AA", text: "#C2410C" };
  return { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" };
}

function healthStyle(h: HealthStatus) {
  switch (h) {
    case "Excellent": return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981" };
    case "Good":      return { bg: "#F0FDF9", color: "#0D9488", border: "#99F6E4", dot: "#14B8A6" };
    case "At Risk":   return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA", dot: "#F97316" };
    case "Critical":  return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444" };
  }
}

function billingStyle(s: string) {
  switch (s) {
    case "Paid":    return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Cleared": return { bg: "#F0FDF9", color: "#0D9488", border: "#99F6E4" };
    case "Pending": return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Overdue": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Closed":  return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
    default:        return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// BUILD VIEW MODEL
// ══════════════════════════════════════════════════════════════════════════════

function buildVM(
  clients: MasterClient[],
  tasksByClientId: Map<string, EngineTask[]>,
): ClientHealthVM[] {
  const today = new Date().toISOString().slice(0, 10);

  return clients.map((c) => {
    const rawTasks = tasksByClientId.get(c.id) ?? [];
    let taskSignals: TaskHealthSignals | null = null;
    if (rawTasks.length > 0) {
      const completed = rawTasks.filter((t) => t.status === "Completed").length;
      const blocked = rawTasks.filter((t) => t.status === "Waiting").length;
      const overdue = rawTasks.filter(
        (t) => t.dueDate && t.dueDate < today && t.status !== "Completed",
      ).length;
      taskSignals = {
        totalTasks: rawTasks.length,
        completedTasks: completed,
        blockedTasks: blocked,
        overdueTasks: overdue,
      };
    }

    const health = computeHealth(c, taskSignals ?? undefined);
    const healthScore = computeClientHealthScore(c, taskSignals ?? undefined);
    const priority = computePriority(health, c.billingStatus);
    const daysToRenewal = daysUntilDate(c.renewalDate);

    return {
      id: c.id,
      slug: c.slug,
      clientName: c.clientName,
      industry: c.industry,
      assignedAM: c.assignedAM,
      avatarColor: c.avatarColor,
      billingStatus: c.billingStatus,
      paymentStatus: c.paymentStatus,
      cancellationStatus: c.cancellationStatus,
      activationStatus: c.activationStatus,
      mrr: c.monthlyValue,
      renewalDate: c.renewalDate,
      renewalStatus: c.renewalStatus,
      activeServices: c.activeServices,
      cleared: c.cleared,
      recentEvents: c.recentEvents,
      notes: c.notes,
      nextRequiredAction: c.nextRequiredAction,
      health,
      healthScore,
      priority,
      daysToRenewal,
      taskSignals,
    };
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// PREVIEW BADGE
// ══════════════════════════════════════════════════════════════════════════════

function PreviewBadge({ label = "Preview — Target State" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      {label}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════════════

function Badge({
  label, bg, color, border, dot,
}: {
  label: string; bg?: string; color?: string; border: string; dot?: string;
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

function HealthBadge({ health }: { health: HealthStatus }) {
  const s = healthStyle(health);
  return <Badge label={health} bg={s.bg} color={s.color} border={s.border} dot={s.dot} />;
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const c = scoreColor(score);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
        <span className="text-xs font-bold" style={{ color: c }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "var(--rtm-border)" }}>
        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${score}%`, background: c }} />
      </div>
    </div>
  );
}

function SectionCard({
  title, children, action, badge,
}: {
  title: string; children: React.ReactNode; action?: React.ReactNode; badge?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b gap-2"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{title}</h3>
          {badge}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Stat({
  label, value, sub, valueColor,
}: {
  label: string; value: string | number; sub?: string; valueColor?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
      <span className="text-xl font-bold" style={{ color: valueColor ?? "var(--rtm-text-primary)" }}>{value}</span>
      {sub && <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{sub}</span>}
    </div>
  );
}

function DataRow({ label, value, valueEl }: { label: string; value?: string | number; valueEl?: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
      style={{ borderColor: "var(--rtm-border-light)" }}
    >
      <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{label}</span>
      {valueEl ?? <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{value}</span>}
    </div>
  );
}

function KpiCard({
  label, value, sub, accent,
}: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-2"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: accent ?? "var(--rtm-text-primary)" }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{sub}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HEALTH SCORE GAUGE
// ══════════════════════════════════════════════════════════════════════════════

function HealthScoreGauge({ score }: { score: number }) {
  const c = scoreColor(score);
  const palette = scoreBg(score);
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border p-6 gap-2"
      style={{ background: palette.bg, borderColor: palette.border }}
    >
      <span className="text-5xl font-extrabold leading-none" style={{ color: palette.text }}>{score}</span>
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: palette.text }}>Overall Health Score</span>
      <div className="w-full h-2 rounded-full mt-1" style={{ background: "rgba(0,0,0,0.08)" }}>
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${score}%`, background: c }} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BILLING TAB — REAL DATA
// ══════════════════════════════════════════════════════════════════════════════

function BillingTab({ vm }: { vm: ClientHealthVM }) {
  const bs = billingStyle(vm.billingStatus);

  const renewalStyle = () => {
    if (vm.daysToRenewal === null) return { color: "var(--rtm-text-muted)" };
    if (vm.daysToRenewal <= RENEWAL_URGENT_DAYS) return { color: "#DC2626" };
    if (vm.daysToRenewal <= 90) return { color: "#D97706" };
    return { color: "#059669" };
  };

  return (
    <SectionCard title="Billing & Revenue">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
        <Stat
          label="Monthly Value (MRR)"
          value={vm.mrr > 0 ? fmt$(vm.mrr) : "—"}
          sub={vm.mrr > 0 ? `${fmt$(vm.mrr * 12)} ARR` : "No active billing"}
          valueColor={vm.mrr > 0 ? "#059669" : "var(--rtm-text-muted)"}
        />
        <Stat label="Billing Status" value={vm.billingStatus} valueColor={bs.color} />
        <Stat label="Payment Status" value={vm.paymentStatus} />
        <Stat
          label="Renewal Date"
          value={vm.renewalDate !== "—" ? vm.renewalDate : "N/A"}
          sub={
            vm.daysToRenewal !== null
              ? `${vm.daysToRenewal >= 0 ? vm.daysToRenewal + " days away" : "Overdue"}`
              : undefined
          }
          valueColor={renewalStyle().color}
        />
        <Stat label="Renewal Status" value={vm.renewalStatus} />
        <Stat label="Cancellation" value={vm.cancellationStatus} valueColor={
          vm.cancellationStatus !== "None" ? "#DC2626" : "#059669"
        } />
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-5">
        <Badge label={vm.billingStatus} bg={bs.bg} color={bs.color} border={bs.border} />
        {vm.cancellationStatus !== "None" && (
          <Badge label={`Cancellation: ${vm.cancellationStatus}`} bg="#FEF2F2" color="#DC2626" border="#FECACA" />
        )}
        {vm.daysToRenewal !== null && vm.daysToRenewal <= RENEWAL_URGENT_DAYS && vm.daysToRenewal >= 0 && (
          <Badge label={`Renewal in ${vm.daysToRenewal}d`} bg="#FEF2F2" color="#DC2626" border="#FECACA" />
        )}
        {!vm.cleared && (
          <Badge label="Pending Billing Clearance" bg="#FFFBEB" color="#B45309" border="#FDE68A" />
        )}
      </div>

      {vm.activeServices.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Active Services</p>
          <div className="flex flex-wrap gap-2">
            {vm.activeServices.map((s) => (
              <Badge key={s} label={s} color="var(--rtm-blue)" border="var(--rtm-blue-light)" />
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROJECTS TAB — REAL ENGINE DATA
// ══════════════════════════════════════════════════════════════════════════════

function ProjectsTab({ vm, engineProjects }: { vm: ClientHealthVM; engineProjects: EngineProject[] }) {
  const ts = vm.taskSignals;

  if (engineProjects.length === 0 && !ts) {
    return (
      <SectionCard title="Projects & Tasks">
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <p className="text-sm font-medium" style={{ color: "var(--rtm-text-muted)" }}>No engine projects found for this client</p>
          <p className="text-xs text-center max-w-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Projects and task data will appear here once the client has active engine projects.
          </p>
        </div>
      </SectionCard>
    );
  }

  const completionPct = ts && ts.totalTasks > 0
    ? Math.round((ts.completedTasks / ts.totalTasks) * 100)
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Task Signal Summary */}
      {ts && (
        <SectionCard title="Task Signal Summary">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <Stat
              label="Total Tasks"
              value={ts.totalTasks}
            />
            <Stat
              label="Completed"
              value={ts.completedTasks}
              sub={completionPct !== null ? `${completionPct}% done` : undefined}
              valueColor="#059669"
            />
            <Stat
              label="Blocked (Waiting)"
              value={ts.blockedTasks}
              valueColor={ts.blockedTasks > 0 ? "#DC2626" : "#059669"}
            />
            <Stat
              label="Overdue"
              value={ts.overdueTasks}
              valueColor={ts.overdueTasks > 0 ? "#C2410C" : "#059669"}
            />
          </div>
          {completionPct !== null && (
            <ScoreBar score={completionPct} label="Task Completion Rate" />
          )}
        </SectionCard>
      )}

      {/* Engine Projects List */}
      {engineProjects.length > 0 && (
        <SectionCard title={`Active Projects (${engineProjects.length})`}>
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
            {engineProjects.map((p) => {
              const statusStyle = (() => {
                switch (p.status) {
                  case "Complete": case "Completed": return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
                  case "In Progress": return { bg: "#F0F9FF", color: "#0369A1", border: "#BAE6FD" };
                  case "On Hold": return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
                  case "Blocked": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
                  default: return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
                }
              })();
              return (
                <div key={p.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>{p.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>ID: {p.id}</p>
                  </div>
                  <Badge label={p.status} bg={statusStyle.bg} color={statusStyle.color} border={statusStyle.border} />
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMMUNICATIONS TAB — LINK OUT TO COLLABORATION HUB
// ══════════════════════════════════════════════════════════════════════════════

function CommunicationsTab({ vm }: { vm: ClientHealthVM }) {
  return (
    <SectionCard title="Communications">
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)" }}
        >
          💬
        </div>
        <div>
          <p className="text-base font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
            Task &amp; Project Communications
          </p>
          <p className="text-sm mt-1 max-w-sm" style={{ color: "var(--rtm-text-secondary)" }}>
            Message threads, task comments, and project communication context for{" "}
            <strong>{vm.clientName}</strong> are managed in the Collaboration Hub.
          </p>
        </div>
        <Link
          href={`/tasks/collaboration?client=${encodeURIComponent(vm.clientName)}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--rtm-blue)", color: "#fff" }}
        >
          Open Collaboration Hub
          <span>→</span>
        </Link>
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          Opens Task Collaboration Hub · /tasks/collaboration
        </p>
      </div>

      {/* Recent events from MASTER_CLIENTS as a lightweight activity summary */}
      {vm.recentEvents.length > 0 && (
        <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--rtm-border-light)" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--rtm-text-secondary)" }}>
            Recent Activity (from client record)
          </p>
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
            {vm.recentEvents.map((ev, i) => (
              <div key={i} className="py-2.5 flex items-start gap-3">
                <span className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{ev.date}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>{ev.actor}</p>
                  <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{ev.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HEALTH HISTORY TAB — REAL COMPUTED SCORE BREAKDOWN
// ══════════════════════════════════════════════════════════════════════════════

function HealthHistoryTab({ vm }: { vm: ClientHealthVM }) {
  const ts = vm.taskSignals;

  // Build score component breakdown for display
  const billingPts = (() => {
    if (vm.billingStatus === "Paid" || vm.billingStatus === "Cleared") return 40;
    if (vm.billingStatus === "Pending") return 28;
    if (vm.billingStatus === "Overdue" && vm.paymentStatus !== "Overdue") return 15;
    if (vm.billingStatus === "Overdue" && vm.paymentStatus === "Overdue") return 5;
    return 20;
  })();

  const taskCompPts = ts && ts.totalTasks > 0
    ? Math.round((ts.completedTasks / ts.totalTasks) * 30)
    : 20;

  const pressurePts = ts
    ? Math.round((1 - Math.min(1, (ts.overdueTasks + ts.blockedTasks * 1.5) / Math.max(1, ts.totalTasks))) * 20)
    : 18;

  const activationPts = vm.activationStatus === "Active" ? 10 : 5;

  const components = [
    { label: "Billing Health", pts: billingPts, max: 40, weight: "40 pts" },
    { label: "Task Completion", pts: taskCompPts, max: 30, weight: "30 pts", note: ts ? undefined : "No engine data — neutral" },
    { label: "Task Pressure", pts: pressurePts, max: 20, weight: "20 pts", note: ts ? undefined : "No engine data — neutral" },
    { label: "Activation", pts: activationPts, max: 10, weight: "10 pts" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="Health Score Breakdown">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <HealthScoreGauge score={vm.healthScore} />
          <div className="flex flex-col gap-4 justify-center">
            {components.map(({ label, pts, max, weight, note }) => (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{label}</span>
                    <span className="ml-1.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>({weight})</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: scoreColor(Math.round((pts / max) * 100)) }}>
                    {pts}/{max}
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--rtm-border)" }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${(pts / max) * 100}%`, background: scoreColor(Math.round((pts / max) * 100)) }}
                  />
                </div>
                {note && <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{note}</p>}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Health Signals">
        <DataRow label="Health Tier" valueEl={<HealthBadge health={vm.health} />} />
        <DataRow label="Numeric Score" value={`${vm.healthScore}/100`} />
        <DataRow label="Priority" value={vm.priority} />
        <DataRow label="Billing Status" value={vm.billingStatus} />
        <DataRow label="Payment Status" value={vm.paymentStatus} />
        <DataRow label="Cancellation Status" value={vm.cancellationStatus} />
        <DataRow label="Activation Status" value={vm.activationStatus} />
        {ts && (
          <>
            <DataRow label="Total Tasks" value={ts.totalTasks} />
            <DataRow label="Completed Tasks" value={`${ts.completedTasks} (${ts.totalTasks > 0 ? Math.round(ts.completedTasks / ts.totalTasks * 100) : 0}%)`} />
            <DataRow label="Blocked Tasks" value={ts.blockedTasks} />
            <DataRow label="Overdue Tasks" value={ts.overdueTasks} />
          </>
        )}
        {!ts && (
          <DataRow label="Task Signals" value="No engine projects — score uses billing signals only" />
        )}
      </SectionCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════════════════════════

function OverviewTab({ vm }: { vm: ClientHealthVM }) {
  const ts = vm.taskSignals;
  const completionPct = ts && ts.totalTasks > 0 ? Math.round(ts.completedTasks / ts.totalTasks * 100) : null;

  const renewalColor = (() => {
    if (vm.daysToRenewal === null) return "var(--rtm-text-muted)";
    if (vm.daysToRenewal <= RENEWAL_URGENT_DAYS) return "#DC2626";
    if (vm.daysToRenewal <= 90) return "#D97706";
    return "#059669";
  })();

  return (
    <div className="flex flex-col gap-6">
      {/* Score */}
      <SectionCard title="Health Score">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <HealthScoreGauge score={vm.healthScore} />
          <div className="flex flex-col gap-3 justify-center">
            <DataRow label="Health Tier" valueEl={<HealthBadge health={vm.health} />} />
            <DataRow label="Priority" value={vm.priority} />
            <DataRow label="MRR" value={vm.mrr > 0 ? fmt$(vm.mrr) : "—"} />
            <DataRow label="Billing" value={vm.billingStatus} />
            {vm.daysToRenewal !== null && (
              <DataRow
                label="Renewal"
                valueEl={
                  <span className="text-xs font-semibold" style={{ color: renewalColor }}>
                    {vm.daysToRenewal >= 0 ? `${vm.daysToRenewal}d away` : "Overdue"}
                  </span>
                }
              />
            )}
            {ts && (
              <DataRow
                label="Task Completion"
                valueEl={
                  <span className="text-xs font-semibold" style={{ color: completionPct !== null ? scoreColor(completionPct) : "var(--rtm-text-muted)" }}>
                    {completionPct !== null ? `${completionPct}%` : "—"} ({ts.completedTasks}/{ts.totalTasks})
                  </span>
                }
              />
            )}
            {ts && ts.blockedTasks > 0 && (
              <DataRow
                label="Blocked Tasks"
                valueEl={<span className="text-xs font-semibold text-red-600">{ts.blockedTasks}</span>}
              />
            )}
            {ts && ts.overdueTasks > 0 && (
              <DataRow
                label="Overdue Tasks"
                valueEl={<span className="text-xs font-semibold" style={{ color: "#C2410C" }}>{ts.overdueTasks}</span>}
              />
            )}
          </div>
        </div>
      </SectionCard>

      {/* Notes + Next Action */}
      <SectionCard title="Account Notes">
        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--rtm-text-secondary)" }}>
          {vm.notes || "No notes."}
        </p>
        <div className="rounded-lg border p-3" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Next Required Action
          </p>
          <p className="text-sm" style={{ color: "var(--rtm-text-primary)" }}>{vm.nextRequiredAction}</p>
        </div>
      </SectionCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT DETAIL DRAWER
// ══════════════════════════════════════════════════════════════════════════════

type DrawerTab =
  | "Overview"
  | "Health History"
  | "Billing"
  | "Projects"
  | "Communications"
  | "Escalations"
  | "AI Summary";

const DRAWER_TABS: DrawerTab[] = [
  "Overview",
  "Health History",
  "Billing",
  "Projects",
  "Communications",
  "Escalations",
  "AI Summary",
];

const DEFERRED_TABS: DrawerTab[] = ["Escalations", "AI Summary"];

function ClientDetailDrawer({
  vm,
  engineProjects,
  onClose,
}: {
  vm: ClientHealthVM;
  engineProjects: EngineProject[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("Overview");
  const ps = scoreBg(vm.healthScore);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 cursor-pointer" onClick={onClose} />
      <div
        className="w-full max-w-4xl flex flex-col h-full overflow-hidden"
        style={{ background: "var(--rtm-bg)", boxShadow: "-4px 0 40px rgba(15,28,56,0.18)" }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-6 border-b flex-shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                style={{ background: vm.avatarColor }}
              >
                {vm.clientName.charAt(0)}
              </span>
              <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>{vm.clientName}</h2>
              <HealthBadge health={vm.health} />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>AM: {vm.assignedAM}</span>
              <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{vm.industry}</span>
              <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Billing: {vm.billingStatus}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {vm.activeServices.slice(0, 4).map((s) => (
                <Badge key={s} label={s} color="var(--rtm-blue)" border="var(--rtm-blue-light)" />
              ))}
              {vm.activeServices.length > 4 && (
                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>+{vm.activeServices.length - 4} more</span>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 flex-shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-3xl font-extrabold" style={{ color: ps.text }}>{vm.healthScore}</span>
              <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Health Score</span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-lg font-bold"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-0 border-b overflow-x-auto flex-shrink-0"
          style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}
        >
          {DRAWER_TABS.map((t) => {
            const deferred = DEFERRED_TABS.includes(t);
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5"
                style={{
                  borderBottomColor: tab === t ? "var(--rtm-blue)" : "transparent",
                  color: tab === t ? "var(--rtm-blue)" : "var(--rtm-text-muted)",
                  background: "transparent",
                }}
              >
                {t}
                {deferred && (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                    style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
                  >
                    Preview
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6">
            {tab === "Overview" && <OverviewTab vm={vm} />}
            {tab === "Health History" && <HealthHistoryTab vm={vm} />}
            {tab === "Billing" && <BillingTab vm={vm} />}
            {tab === "Projects" && <ProjectsTab vm={vm} engineProjects={engineProjects} />}
            {tab === "Communications" && <CommunicationsTab vm={vm} />}

            {/* Deferred tabs */}
            {DEFERRED_TABS.includes(tab) && (
              <SectionCard
                title={tab}
                badge={<PreviewBadge />}
              >
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <p className="text-sm font-medium" style={{ color: "var(--rtm-text-muted)" }}>
                    {tab} — Preview Target State
                  </p>
                  <p className="text-xs text-center max-w-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    This view is planned for a future phase. Real data wiring is in progress.
                  </p>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT CARD (DASHBOARD VIEW)
// ══════════════════════════════════════════════════════════════════════════════

function ClientCard({ vm, onClick }: { vm: ClientHealthVM; onClick: () => void }) {
  const ps = scoreBg(vm.healthScore);
  const bs = billingStyle(vm.billingStatus);
  const renewalUrgent = vm.daysToRenewal !== null && vm.daysToRenewal <= RENEWAL_URGENT_DAYS && vm.daysToRenewal >= 0;

  return (
    <div
      className="rounded-xl border flex flex-col overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      onClick={onClick}
    >
      {/* Card header */}
      <div className="p-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: vm.avatarColor }}
          >
            {vm.clientName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="font-semibold truncate text-sm" style={{ color: "var(--rtm-text-primary)" }}>{vm.clientName}</p>
            <p className="text-xs truncate" style={{ color: "var(--rtm-text-muted)" }}>{vm.assignedAM} · {vm.industry}</p>
          </div>
        </div>
        <HealthBadge health={vm.health} />
      </div>

      {/* Score */}
      <div
        className="mx-4 mb-3 rounded-lg border py-3 flex flex-col items-center"
        style={{ background: ps.bg, borderColor: ps.border }}
      >
        <span className="text-4xl font-extrabold leading-none" style={{ color: ps.text }}>{vm.healthScore}</span>
        <span className="text-xs mt-0.5" style={{ color: ps.text, opacity: 0.8 }}>Health Score</span>
      </div>

      {/* Key metrics */}
      <div className="border-t grid grid-cols-3 divide-x" style={{ borderColor: "var(--rtm-border-light)" }}>
        <div className="px-3 py-2 flex flex-col items-center">
          <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {vm.mrr > 0 ? fmt$(vm.mrr) : "—"}
          </span>
          <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>MRR</span>
        </div>
        <div className="px-3 py-2 flex flex-col items-center">
          <span className="text-xs font-bold" style={{ color: bs.color }}>{vm.billingStatus}</span>
          <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Billing</span>
        </div>
        <div className="px-3 py-2 flex flex-col items-center">
          {renewalUrgent ? (
            <>
              <span className="text-xs font-bold text-red-600">{vm.daysToRenewal}d</span>
              <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Renewal</span>
            </>
          ) : (
            <>
              <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{vm.activationStatus === "Active" ? "Active" : "—"}</span>
              <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Status</span>
            </>
          )}
        </div>
      </div>

      {/* Task signals if available */}
      {vm.taskSignals && (
        <div className="px-4 py-2 border-t flex items-center gap-3" style={{ borderColor: "var(--rtm-border-light)" }}>
          {vm.taskSignals.blockedTasks > 0 && (
            <span className="text-[11px]" style={{ color: "#DC2626" }}>
              {vm.taskSignals.blockedTasks} blocked
            </span>
          )}
          {vm.taskSignals.overdueTasks > 0 && (
            <span className="text-[11px]" style={{ color: "#C2410C" }}>
              {vm.taskSignals.overdueTasks} overdue
            </span>
          )}
          {vm.taskSignals.blockedTasks === 0 && vm.taskSignals.overdueTasks === 0 && (
            <span className="text-[11px]" style={{ color: "#059669" }}>Tasks on track</span>
          )}
          <span className="ml-auto text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
            {vm.taskSignals.completedTasks}/{vm.taskSignals.totalTasks} done
          </span>
        </div>
      )}

      {/* Notes */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
        <p className="text-xs italic leading-snug line-clamp-2" style={{ color: "var(--rtm-text-muted)" }}>
          {vm.notes || "No notes."}
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT TABLE (ALL CLIENTS VIEW)
// ══════════════════════════════════════════════════════════════════════════════

function ClientTable({ vms, onSelect }: { vms: ClientHealthVM[]; onSelect: (v: ClientHealthVM) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)" }}>
      <table className="min-w-full text-sm">
        <thead>
          <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
            {["Client", "AM", "Score", "Health", "Billing", "MRR", "Tasks", "Renewal", "Actions"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vms.map((vm, i) => {
            const ps = scoreBg(vm.healthScore);
            const bs = billingStyle(vm.billingStatus);
            const renewalUrgent = vm.daysToRenewal !== null && vm.daysToRenewal <= RENEWAL_URGENT_DAYS && vm.daysToRenewal >= 0;

            return (
              <tr
                key={vm.id}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                style={{
                  background: i % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-bg)",
                  borderBottom: "1px solid var(--rtm-border-light)",
                }}
                onClick={() => onSelect(vm)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: vm.avatarColor }}
                    >
                      {vm.clientName.charAt(0)}
                    </span>
                    <div>
                      <p className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{vm.clientName}</p>
                      <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{vm.industry}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{vm.assignedAM}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-lg font-extrabold" style={{ color: ps.text }}>{vm.healthScore}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <HealthBadge health={vm.health} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge label={vm.billingStatus} bg={bs.bg} color={bs.color} border={bs.border} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                  {vm.mrr > 0 ? fmt$(vm.mrr) : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {vm.taskSignals ? (
                    <div className="text-xs">
                      <span style={{ color: vm.taskSignals.blockedTasks > 0 ? "#DC2626" : "var(--rtm-text-muted)" }}>
                        {vm.taskSignals.blockedTasks} blocked
                      </span>
                      {" · "}
                      <span style={{ color: vm.taskSignals.overdueTasks > 0 ? "#C2410C" : "var(--rtm-text-muted)" }}>
                        {vm.taskSignals.overdueTasks} overdue
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No engine data</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {vm.daysToRenewal !== null ? (
                    <span className="text-xs font-semibold" style={{ color: renewalUrgent ? "#DC2626" : vm.daysToRenewal <= 90 ? "#D97706" : "#059669" }}>
                      {vm.daysToRenewal >= 0 ? `${vm.daysToRenewal}d` : "Past due"}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                    style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                    onClick={(e) => { e.stopPropagation(); onSelect(vm); }}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DEFERRED VIEW PLACEHOLDER
// ══════════════════════════════════════════════════════════════════════════════

function DeferredViewPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="rounded-xl border p-12 flex flex-col items-center justify-center gap-4 text-center"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      <PreviewBadge />
      <p className="text-base font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{title}</p>
      <p className="text-sm max-w-md" style={{ color: "var(--rtm-text-secondary)" }}>{description}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

type PageView = "dashboard" | "table" | "intervention" | "executive";
type HealthFilter = "All" | HealthStatus;

const HEALTH_FILTERS: HealthFilter[] = ["All", "Excellent", "Good", "At Risk", "Critical"];

export default function ClientHealthPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [clients, setClients] = useState<MasterClient[]>(MASTER_CLIENTS);
  const [engineProjects, setEngineProjects] = useState<EngineProject[]>([]);
  const [engineTasks, setEngineTasks] = useState<EngineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PageView>("dashboard");
  const [filter, setFilter] = useState<HealthFilter>("All");
  const [search, setSearch] = useState("");
  const [selectedVM, setSelectedVM] = useState<ClientHealthVM | null>(null);

  // ── Fetch real data on mount ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [mcRes, engRes] = await Promise.all([
          fetch("/api/master-clients"),
          fetch("/api/engine"),
        ]);
        const [mcData, engData] = await Promise.all([
          mcRes.json() as Promise<{ clients: MasterClient[] }>,
          engRes.json() as Promise<{ projects: EngineProject[]; tasks: EngineTask[] }>,
        ]);
        if (cancelled) return;
        if (Array.isArray(mcData.clients) && mcData.clients.length > 0) {
          setClients(mcData.clients as MasterClient[]);
        }
        if (Array.isArray(engData.projects)) setEngineProjects(engData.projects);
        if (Array.isArray(engData.tasks)) setEngineTasks(engData.tasks);
      } catch {
        // keep MASTER_CLIENTS seed on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  // ── Build per-client task map ─────────────────────────────────────────────
  const tasksByClientId = useMemo<Map<string, EngineTask[]>>(() => {
    const projectsByClientId = new Map<string, string[]>(); // clientId → [projectId]
    for (const p of engineProjects) {
      if (p.clientId) {
        const arr = projectsByClientId.get(p.clientId) ?? [];
        arr.push(p.id);
        projectsByClientId.set(p.clientId, arr);
      }
    }
    const tasksByClientId = new Map<string, EngineTask[]>();
    for (const t of engineTasks) {
      // Find which clientId owns this task's project
      for (const [clientId, projIds] of projectsByClientId.entries()) {
        if (projIds.includes(t.projectId)) {
          const arr = tasksByClientId.get(clientId) ?? [];
          arr.push(t);
          tasksByClientId.set(clientId, arr);
          break;
        }
      }
    }
    return tasksByClientId;
  }, [engineProjects, engineTasks]);

  // ── Build engineProjectsByClientId ───────────────────────────────────────
  const engineProjectsByClientId = useMemo<Map<string, EngineProject[]>>(() => {
    const m = new Map<string, EngineProject[]>();
    for (const p of engineProjects) {
      if (p.clientId) {
        const arr = m.get(p.clientId) ?? [];
        arr.push(p);
        m.set(p.clientId, arr);
      }
    }
    return m;
  }, [engineProjects]);

  // ── Build view models ────────────────────────────────────────────────────
  const allVMs = useMemo(() => buildVM(clients, tasksByClientId), [clients, tasksByClientId]);

  const filteredVMs = useMemo(() => {
    let result = allVMs;
    if (filter !== "All") result = result.filter((v) => v.health === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.clientName.toLowerCase().includes(q) ||
          v.assignedAM.toLowerCase().includes(q) ||
          v.industry.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allVMs, filter, search]);

  // ── Portfolio summary from real VMs ───────────────────────────────────────
  const summary = useMemo(() => {
    const excellent = allVMs.filter((v) => v.health === "Excellent").length;
    const good = allVMs.filter((v) => v.health === "Good").length;
    const atRisk = allVMs.filter((v) => v.health === "At Risk").length;
    const critical = allVMs.filter((v) => v.health === "Critical").length;
    const totalMRR = allVMs.reduce((s, v) => s + v.mrr, 0);
    const atRiskMRR = allVMs.filter((v) => v.health === "At Risk" || v.health === "Critical").reduce((s, v) => s + v.mrr, 0);
    const avgScore = allVMs.length > 0 ? Math.round(allVMs.reduce((s, v) => s + v.healthScore, 0) / allVMs.length) : 0;
    const renewalsSoon = allVMs.filter((v) => v.daysToRenewal !== null && v.daysToRenewal >= 0 && v.daysToRenewal <= 90).length;
    return { excellent, good, atRisk, critical, total: allVMs.length, totalMRR, atRiskMRR, avgScore, renewalsSoon };
  }, [allVMs]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const openDrawer = (vm: ClientHealthVM) => setSelectedVM(vm);
  const closeDrawer = () => setSelectedVM(null);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen" style={{ background: "var(--rtm-bg)" }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Client Health
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
              Real health scores computed from billing, activation, and task signals.
              {loading && <span className="ml-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>Loading live data…</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(
              [
                { key: "dashboard" as const, label: "Dashboard" },
                { key: "table" as const, label: "All Clients" },
                { key: "intervention" as const, label: "Interventions", deferred: true },
                { key: "executive" as const, label: "Executive View", deferred: true },
              ] as const
            ).map(({ key, label, deferred }: { key: PageView; label: string; deferred?: boolean }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                style={{
                  background: view === key ? "var(--rtm-blue)" : "var(--rtm-surface)",
                  color: view === key ? "#fff" : "var(--rtm-text-secondary)",
                  border: "1px solid",
                  borderColor: view === key ? "var(--rtm-blue)" : "var(--rtm-border)",
                }}
              >
                {label}
                {deferred && (
                  <span
                    className="text-[9px] font-semibold px-1 py-0.5 rounded-full border"
                    style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
                  >
                    Preview
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI Row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <KpiCard label="Excellent" value={summary.excellent} sub={`${summary.total > 0 ? Math.round(summary.excellent / summary.total * 100) : 0}%`} accent="#059669" />
          <KpiCard label="Good" value={summary.good} sub={`${summary.total > 0 ? Math.round(summary.good / summary.total * 100) : 0}%`} accent="#14B8A6" />
          <KpiCard label="At Risk" value={summary.atRisk} sub={`${summary.total > 0 ? Math.round(summary.atRisk / summary.total * 100) : 0}%`} accent="#EA580C" />
          <KpiCard label="Critical" value={summary.critical} sub={`${summary.total > 0 ? Math.round(summary.critical / summary.total * 100) : 0}%`} accent="#DC2626" />
          <KpiCard label="Total MRR" value={fmt$(summary.totalMRR)} sub="Active portfolio" />
          <KpiCard label="MRR at Risk" value={fmt$(summary.atRiskMRR)} sub="At Risk + Critical" accent={summary.atRiskMRR > 0 ? "#DC2626" : "#059669"} />
          <KpiCard label="Renewals (90d)" value={summary.renewalsSoon} sub="Coming up" accent="var(--rtm-blue)" />
          <KpiCard label="Portfolio Score" value={summary.avgScore} sub="Avg health score" accent={scoreColor(summary.avgScore)} />
        </div>

        {/* ── Dashboard View ───────────────────────────────────────────────── */}
        {view === "dashboard" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 flex-wrap">
                {HEALTH_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                    style={{
                      background: filter === f ? "var(--rtm-text-primary)" : "var(--rtm-surface)",
                      color: filter === f ? "#fff" : "var(--rtm-text-secondary)",
                      border: "1px solid",
                      borderColor: filter === f ? "var(--rtm-text-primary)" : "var(--rtm-border)",
                    }}
                  >
                    {f} {f !== "All" && `(${allVMs.filter((v) => v.health === f).length})`}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search clients, managers, industries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-48 px-4 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
              />
            </div>

            {filteredVMs.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No clients match the selected filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredVMs.map((vm) => (
                  <ClientCard key={vm.id} vm={vm} onClick={() => openDrawer(vm)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Table View ──────────────────────────────────────────────────── */}
        {view === "table" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 flex-wrap">
                {HEALTH_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                    style={{
                      background: filter === f ? "var(--rtm-text-primary)" : "var(--rtm-surface)",
                      color: filter === f ? "#fff" : "var(--rtm-text-secondary)",
                      border: "1px solid",
                      borderColor: filter === f ? "var(--rtm-text-primary)" : "var(--rtm-border)",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-48 px-4 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
              />
            </div>
            <ClientTable vms={filteredVMs} onSelect={openDrawer} />
          </>
        )}

        {/* ── Deferred Views ───────────────────────────────────────────────── */}
        {view === "intervention" && (
          <DeferredViewPlaceholder
            title="Client Intervention Queue"
            description="Automated intervention tracking, risk escalation, and owner assignment will be wired to real engine data in a future phase."
          />
        )}
        {view === "executive" && (
          <DeferredViewPlaceholder
            title="Executive Dashboard"
            description="Portfolio-level health distribution, MRR-at-risk charts, department bottleneck analysis, and executive KPIs are planned for a future phase."
          />
        )}
      </div>

      {/* ── Client Detail Drawer ─────────────────────────────────────────── */}
      {selectedVM && (
        <ClientDetailDrawer
          vm={selectedVM}
          engineProjects={engineProjectsByClientId.get(selectedVM.id) ?? []}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
}
