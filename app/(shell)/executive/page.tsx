"use client";

import React, { useState } from "react";
import { useDeptTaskStats } from "@/lib/hooks/useDeptTaskStats";

function PreviewBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      Preview — Target State
    </span>
  );
}
import {
  KpiCard,
  SectionWrapper,
  StatusBadge,
  AISummary,
  DetailDrawer,
} from "@/components/ui";
import type { DrawerTab } from "@/components/ui";
import {
  executiveRevenue,
  clientHealthOverview,
  atRiskClients,
  projectDeliveryOverview,
  delayedProjects,
  departmentBottlenecks,
  renewalsOverview,
  upcomingRenewals,
  expansionOverview,
  cancellationOverview,
  openCancellations,
  cancellationReasons,
  escalationOverview,
  openEscalations,
  departmentPerformance,
  aiExecutiveSummary,
} from "@/lib/mock/executive-data";

// ── Inline SVG icons ──────────────────────────────────────────────────────────

const IconTrendUp = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const IconDollar = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconUsers = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconAlert = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IconFolder = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
);
const IconRefresh = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const IconX = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconExpand = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);
const IconDownload = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

// ── Health / Status helpers ───────────────────────────────────────────────────

function healthDot(h: "healthy" | "warning" | "critical") {
  if (h === "healthy") return "#10B981";
  if (h === "warning") return "#F59E0B";
  return "#DC2626";
}

function healthLabel(h: "healthy" | "warning" | "critical") {
  if (h === "healthy") return "Healthy";
  if (h === "warning") return "Warning";
  return "Critical";
}

function kpiStatusBadge(s: "on-track" | "behind" | "at-risk" | "critical") {
  const map: Record<string, { bg?: string; color?: string; border: string; label: string }> = {
    "on-track": { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "On Track" },
    behind:     { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "Behind" },
    "at-risk":  { bg: "#FFF7ED", color: "#C2410C", border: "#FDBA74", label: "At Risk" },
    critical:   { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA", label: "Critical" },
  };
  const cfg = map[s];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

function riskChip(risk: "low" | "medium" | "high" | "critical" | "at-risk" | "warning") {
  const map: Record<string, { bg?: string; color?: string; border: string; label: string }> = {
    low:      { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "Low Risk" },
    medium:   { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "Medium Risk" },
    warning:  { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "Warning" },
    high:     { bg: "#FFF7ED", color: "#C2410C", border: "#FDBA74", label: "High Risk" },
    critical: { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA", label: "Critical" },
    "at-risk":{ bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "At Risk" },
  };
  const cfg = map[risk] ?? map.medium;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

// ── Metric row ────────────────────────────────────────────────────────────────

function MetricLine({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
      <span className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
      <span className={`text-sm ${bold ? "font-bold" : "font-medium"}`} style={{ color: "var(--rtm-text-primary)" }}>{value}</span>
    </div>
  );
}

// ── Action button ────────────────────────────────────────────────────────────

function ActionBtn({ label, icon, onClick, variant = "default" }: {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
}) {
  const styles = {
    default: { background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", border: "1px solid var(--rtm-border)" },
    primary: { background: "var(--rtm-blue)", color: "#fff", border: "none" },
    danger:  { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" },
  };
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
      style={styles[variant]}
      onMouseEnter={(e) => {
        if (variant === "primary") (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
        else (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-bg)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        (e.currentTarget as HTMLButtonElement).style.background = styles[variant].background;
      }}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {label}
    </button>
  );
}

// ── Drawer content builders ───────────────────────────────────────────────────

type DrawerKind =
  | { type: "at-risk-client"; id: string }
  | { type: "delayed-project"; id: string }
  | { type: "escalation"; id: string }
  | { type: "renewal"; id: string }
  | { type: "cancellation"; id: string }
  | { type: "bottleneck"; dept: string };

function buildDrawerProps(kind: DrawerKind): {
  title: string;
  subtitle: string;
  statusBadge: React.ReactNode;
  tabs: DrawerTab[];
} | null {
  if (kind.type === "at-risk-client") {
    const c = atRiskClients.find((x) => x.id === kind.id);
    if (!c) return null;
    return {
      title: c.name,
      subtitle: `At-Risk Client — Owner: ${c.owner}`,
      statusBadge: <StatusBadge variant={c.health === "critical" ? "critical" : "at-risk"} />,
      tabs: [
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>MRR</p>
                  <p className="text-lg font-bold mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{c.mrr}</p>
                </div>
                <div className="p-3 rounded-lg border" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Last Contact</p>
                  <p className="text-lg font-bold mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{c.lastContact}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Risk Reason</p>
                <p className="text-sm leading-relaxed p-3 rounded-lg" style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>{c.riskReason}</p>
              </div>
              <MetricLine label="Owner" value={c.owner} />
              <MetricLine label="Impact" value={c.impact} />
              <MetricLine label="Services" value={c.services.join(", ")} />
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Recommended Action</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>Schedule executive outreach call within 24 hours. Review all open tasks and report delivery. Offer strategic review meeting.</p>
              </div>
            </div>
          ),
        },
        {
          id: "activity",
          label: "Activity",
          content: (
            <div className="space-y-3">
              {[
                { date: "Today", note: "Risk flag auto-raised by system due to 18-day contact gap" },
                { date: "11 days ago", note: "Last check-in attempt; client did not respond" },
                { date: "18 days ago", note: "Last confirmed client communication" },
                { date: "32 days ago", note: "Monthly report delivered; no feedback received" },
              ].map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "var(--rtm-blue)" }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{a.date}</p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>{a.note}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
      ],
    };
  }

  if (kind.type === "delayed-project") {
    const p = delayedProjects.find((x) => x.id === kind.id);
    if (!p) return null;
    return {
      title: p.name,
      subtitle: `Delayed Project — ${p.department}`,
      statusBadge: <StatusBadge variant={p.riskLevel === "critical" ? "critical" : "at-risk"} />,
      tabs: [
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Days Delayed</p>
                  <p className="text-lg font-bold mt-0.5" style={{ color: "#DC2626" }}>{p.daysDelayed}</p>
                </div>
                <div className="p-3 rounded-lg border" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Client Impact</p>
                  <p className="text-lg font-bold mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{p.clientImpact}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Blocker Reason</p>
                <p className="text-sm leading-relaxed p-3 rounded-lg" style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }}>{p.blockerReason}</p>
              </div>
              <MetricLine label="Department" value={p.department} />
              <MetricLine label="Owner" value={p.owner} />
              <MetricLine label="Status" value={p.status === "blocked" ? "Blocked" : "Delayed"} />
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Recommended Action</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>Escalate to department head immediately. Set 48-hour resolution target. Communicate updated timeline to client with action plan.</p>
              </div>
            </div>
          ),
        },
      ],
    };
  }

  if (kind.type === "escalation") {
    const e = openEscalations.find((x) => x.id === kind.id);
    if (!e) return null;
    return {
      title: e.title,
      subtitle: `Escalation — ${e.department} | ${e.client}`,
      statusBadge: <StatusBadge variant={e.severity === "critical" ? "critical" : "warning"} />,
      tabs: [
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="space-y-4">
              <MetricLine label="Department" value={e.department} />
              <MetricLine label="Client" value={e.client} />
              <MetricLine label="Owner" value={e.owner} />
              <MetricLine label="Opened" value={e.openedDate} />
              <MetricLine label="Impact" value={e.impact} />
              <MetricLine label="Exec Review" value={e.execReview ? "Yes" : "No"} bold />
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Recommended Action</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
                  {e.execReview
                    ? "Requires executive decision. Schedule review call with department head and account owner within 24 hours."
                    : "Assign resolution owner and set 48-hour SLA. Update client with interim status."}
                </p>
              </div>
            </div>
          ),
        },
      ],
    };
  }

  if (kind.type === "renewal") {
    const r = upcomingRenewals.find((x) => x.id === kind.id);
    if (!r) return null;
    return {
      title: `${r.client} — Renewal`,
      subtitle: `Renewal due in ${r.daysOut} days`,
      statusBadge: riskChip(r.risk as "low" | "medium" | "high"),
      tabs: [
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="space-y-4">
              <MetricLine label="Client" value={r.client} />
              <MetricLine label="Renewal Date" value={r.renewalDate} />
              <MetricLine label="MRR" value={r.mrr} bold />
              <MetricLine label="Days Out" value={`${r.daysOut} days`} />
              <MetricLine label="Owner" value={r.owner} />
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Recommended Action</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
                  {r.risk === "high"
                    ? "High renewal risk — schedule proactive call this week. Prepare ROI summary and expansion proposal."
                    : r.risk === "medium"
                    ? "Schedule renewal outreach in next 5 days. Confirm satisfaction and review service performance."
                    : "Standard renewal process. Send renewal summary email 7 days before date."}
                </p>
              </div>
            </div>
          ),
        },
      ],
    };
  }

  if (kind.type === "cancellation") {
    const can = openCancellations.find((x) => x.id === kind.id);
    if (!can) return null;
    return {
      title: `${can.client} — Cancellation`,
      subtitle: `Cancellation Request — ${can.reason}`,
      statusBadge: <StatusBadge variant={can.risk === "critical" ? "critical" : "at-risk"} />,
      tabs: [
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="space-y-4">
              <MetricLine label="Client" value={can.client} />
              <MetricLine label="MRR at Risk" value={can.mrr} bold />
              <MetricLine label="Request Date" value={can.requestDate} />
              <MetricLine label="Reason" value={can.reason} />
              <MetricLine label="Save Attempt" value={can.saveAttempt} />
              <MetricLine label="Owner" value={can.owner} />
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Recommended Action</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
                  {can.saveAttempt === "Not Started"
                    ? "Immediately assign save attempt. Schedule discovery call to understand root cause. Prepare retention offer."
                    : "Monitor save attempt progress. Escalate to leadership if save call not scheduled within 24 hours."}
                </p>
              </div>
            </div>
          ),
        },
      ],
    };
  }

  if (kind.type === "bottleneck") {
    const dept = departmentPerformance.find((d) => d.slug === kind.dept);
    if (!dept) return null;
    return {
      title: `${dept.name} — Department Bottleneck`,
      subtitle: `${dept.overdueTasks} overdue tasks · ${dept.escalations} escalations`,
      statusBadge: (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
          style={{
            background: dept.health === "critical" ? "#FEF2F2" : "#FFFBEB",
            color: dept.health === "critical" ? "#991B1B" : "#B45309",
            borderColor: dept.health === "critical" ? "#FECACA" : "#FDE68A",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: dept.health === "critical" ? "#DC2626" : "#F59E0B" }} />
          {dept.health === "critical" ? "Critical" : "Warning"}
        </span>
      ),
      tabs: [
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="space-y-4">
              <MetricLine label="Department" value={dept.name} />
              <MetricLine label="Active Projects" value={String(dept.projects)} />
              <MetricLine label="Open Tasks" value={String(dept.openTasks)} />
              <MetricLine label="Overdue Tasks" value={String(dept.overdueTasks)} bold />
              <MetricLine label="Open Escalations" value={String(dept.escalations)} />
              {dept.bottleneck && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Bottleneck</p>
                  <p className="text-sm leading-relaxed p-3 rounded-lg" style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }}>{dept.bottleneck}</p>
                </div>
              )}
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Recommended Action</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>Review overdue task assignments with department head. Set 48-hour resolution SLA on all critical items. Reallocate resources if needed.</p>
              </div>
            </div>
          ),
        },
      ],
    };
  }

  return null;
}

// ── Main Page ────────────────────────────────────────────────────────────────

/**
 * Maps mock departmentPerformance[].name → real engine DepartmentName.
 * Only entries that differ need to appear here; identical names are looked up
 * directly. Departments with no engine counterpart (e.g. "Operations") are
 * not listed and will simply keep their mock task counts.
 */
const MOCK_NAME_TO_ENGINE_KEY: Record<string, string> = {
  // Mock "Creative" corresponds to engine "Design"
  "Creative":            "Design",
  // Mock "IT Support & Hosting" corresponds to engine "IT & Security"
  "IT Support & Hosting": "IT & Security",
};

export default function ExecutiveCommandCenterPage() {
  const [drawerKind, setDrawerKind] = useState<DrawerKind | null>(null);
  const { stats: liveTaskStats, loading: taskStatsLoading } = useDeptTaskStats();
  const drawerOpen = drawerKind !== null;
  const drawerProps = drawerKind ? buildDrawerProps(drawerKind) : null;

  const closeDrawer = () => setDrawerKind(null);

  // ── Client health donut data ──
  const totalClients = clientHealthOverview.total;
  const healthyPct = Math.round((clientHealthOverview.healthy / totalClients) * 100);
  const monitorPct = Math.round((clientHealthOverview.monitor / totalClients) * 100);
  const atRiskPct  = Math.round((clientHealthOverview.atRisk  / totalClients) * 100);
  const criticalPct= Math.round((clientHealthOverview.critical/ totalClients) * 100);

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold leading-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Executive Command Center
          </h1>
          <PreviewBadge />
        </div>
        <p className="text-sm max-w-2xl leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
          Monitor revenue, client health, project delivery, renewals, risks, escalations, and department performance across RTM OS.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <ActionBtn
            label="Export Summary"
            icon={<IconDownload className="w-4 h-4" />}
            variant="primary"
          />
          <ActionBtn
            label="Refresh"
            icon={<IconRefresh className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <section aria-label="Executive KPIs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Revenue" value={executiveRevenue.totalRevenue} subtitle="Year to date" trend="up" trendValue="4.2%" />
          <KpiCard title="MRR" value={executiveRevenue.mrr} subtitle="Monthly recurring" trend="up" trendValue={executiveRevenue.mrrGrowth} />
          <KpiCard title="ARR" value={executiveRevenue.arr} subtitle="Annual recurring run-rate" trend="up" trendValue={executiveRevenue.arrGrowth} />
          <KpiCard title="Revenue At Risk" value={executiveRevenue.revenueAtRisk} subtitle={`${executiveRevenue.revenueAtRiskPct} of MRR`} risk="at-risk" />
          <KpiCard title="Active Clients" value={String(clientHealthOverview.total)} subtitle="Under management" trend="neutral" trendValue="0" trendLabel="vs last month" />
          <KpiCard title="At-Risk Clients" value={String(clientHealthOverview.atRisk + clientHealthOverview.critical)} subtitle={`${clientHealthOverview.critical} critical`} risk="critical" />
          <KpiCard title="Active Projects" value={String(projectDeliveryOverview.active)} subtitle="In delivery" trend="neutral" trendValue="2" trendLabel="new this week" />
          <KpiCard title="Delayed Projects" value={String(projectDeliveryOverview.delayed)} subtitle={`${projectDeliveryOverview.blocked} fully blocked`} risk="at-risk" />
          <KpiCard title="Open Escalations" value={String(escalationOverview.open)} subtitle={`${escalationOverview.critical} critical`} risk={escalationOverview.critical >= 3 ? "critical" : "at-risk"} />
          <KpiCard title="Upcoming Renewals" value={String(renewalsOverview.due30Days)} subtitle="Due in 30 days" trend="neutral" trendValue="" trendLabel="" />
          <KpiCard title="Expansion Pipeline" value={expansionOverview.pipelineValue} subtitle={`${expansionOverview.opportunities} opportunities`} trend="up" trendValue="+8%" />
          <KpiCard title="Cancellation Risk" value={cancellationOverview.revenueAtRisk} subtitle={`${cancellationOverview.openRequests} open requests`} risk="critical" />
        </div>
      </section>

      {/* ── Revenue Overview ── */}
      <SectionWrapper
        title="Revenue Overview"
        description="Monthly breakdown of all revenue streams and forecasts"
        actions={
          <ActionBtn label="Review Revenue Risk" icon={<IconTrendUp className="w-4 h-4" />} />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: "var(--rtm-border-light)" }}>
          {[
            { label: "Monthly Revenue",   value: executiveRevenue.monthlyRevenue },
            { label: "Recurring Revenue", value: executiveRevenue.recurringRevenue },
            { label: "Setup Revenue",     value: executiveRevenue.setupRevenue },
            { label: "Expansion Revenue", value: executiveRevenue.expansionRevenue },
            { label: "Revenue At Risk",   value: executiveRevenue.revenueAtRisk, alert: true },
            { label: "Cancelled Revenue", value: executiveRevenue.cancelledRevenue, alert: true },
            { label: "Renewal Forecast",  value: executiveRevenue.renewalForecast },
            { label: "ARR",               value: executiveRevenue.arr },
          ].map((item) => (
            <div
              key={item.label}
              className="px-5 py-4 flex flex-col gap-1"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</p>
              <p
                className="text-xl font-bold"
                style={{ color: item.alert ? "#DC2626" : "var(--rtm-text-primary)" }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Client Health & Project Delivery ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Health */}
        <SectionWrapper
          title="Client Health Overview"
          description="Distribution and trend of client health across all accounts"
          actions={
            <ActionBtn label="Review At-Risk Clients" icon={<IconUsers className="w-4 h-4" />} />
          }
        >
          <div className="space-y-3">
            {/* Health bars */}
            {[
              { label: "Healthy", count: clientHealthOverview.healthy, pct: healthyPct, color: "#10B981" },
              { label: "Monitor", count: clientHealthOverview.monitor, pct: monitorPct, color: "#F59E0B" },
              { label: "At Risk", count: clientHealthOverview.atRisk,  pct: atRiskPct,  color: "#F97316" },
              { label: "Critical",count: clientHealthOverview.critical,pct: criticalPct,color: "#DC2626" },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium" style={{ color: "var(--rtm-text-secondary)" }}>{row.label}</span>
                  <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{row.count} <span style={{ color: "var(--rtm-text-muted)" }}>({row.pct}%)</span></span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--rtm-border-light)" }}>
                  <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                </div>
              </div>
            ))}

            {/* Top at-risk accounts */}
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--rtm-border-light)" }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-muted)" }}>Top At-Risk Accounts</p>
              <div className="space-y-2">
                {atRiskClients.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setDrawerKind({ type: "at-risk-client", id: c.id })}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors text-left"
                    style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-blue)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-border)"}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: healthDot(c.health === "critical" ? "critical" : "warning") }} />
                      <span className="text-sm font-medium truncate" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{c.mrr}</span>
                      {riskChip(c.health)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Project Delivery */}
        <SectionWrapper
          title="Project Delivery Overview"
          description="Active, delayed, blocked, and completed projects across all departments"
          actions={
            <ActionBtn label="Review Delayed Projects" icon={<IconFolder className="w-4 h-4" />} />
          }
        >
          <div className="space-y-3">
            {/* Summary metrics */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Active Projects",    value: projectDeliveryOverview.active,     color: "#10B981" },
                { label: "Delayed Projects",   value: projectDeliveryOverview.delayed,    color: "#F59E0B" },
                { label: "Blocked Projects",   value: projectDeliveryOverview.blocked,    color: "#DC2626" },
                { label: "Completed Projects", value: projectDeliveryOverview.completed,  color: "#0EA5E9" },
              ].map((m) => (
                <div key={m.label} className="px-4 py-3 rounded-lg border" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{m.label}</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Department bottlenecks */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-muted)" }}>Department Bottlenecks</p>
              <div className="space-y-2">
                {departmentBottlenecks.map((b) => (
                  <div key={b.department} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
                    <span className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>{b.department}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{b.overdueItems} overdue</span>
                      {riskChip(b.severity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <MetricLine label="Launch Delays" value={String(projectDeliveryOverview.launchDelays)} />
            <MetricLine label="Delivery Risk" value={projectDeliveryOverview.deliveryRisk} bold />
          </div>
        </SectionWrapper>
      </div>

      {/* ── Renewals & Expansion ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Renewals */}
        <SectionWrapper
          title="Renewals Overview"
          description="Upcoming renewal pipeline, revenue, and risk by time horizon"
          actions={
            <ActionBtn label="Review Renewal Forecast" icon={<IconRefresh className="w-4 h-4" />} />
          }
        >
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Due 90 Days", value: renewalsOverview.due90Days, color: "#0EA5E9" },
                { label: "Due 60 Days", value: renewalsOverview.due60Days, color: "#F59E0B" },
                { label: "Due 30 Days", value: renewalsOverview.due30Days, color: "#DC2626" },
              ].map((m) => (
                <div key={m.label} className="px-3 py-3 rounded-lg border text-center" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{m.label}</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
            <MetricLine label="Renewal Revenue" value={renewalsOverview.renewalRevenue} bold />
            <MetricLine label="Renewal Risk" value={renewalsOverview.renewalRisk} />
            <MetricLine label="Renewal Forecast" value={renewalsOverview.renewalForecast} />
            <MetricLine label="Renewal Rate" value={renewalsOverview.renewalRate} />

            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-muted)" }}>Upcoming Renewals</p>
              <div className="space-y-2">
                {upcomingRenewals.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setDrawerKind({ type: "renewal", id: r.id })}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors text-left"
                    style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-blue)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-border)"}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--rtm-text-primary)" }}>{r.client}</p>
                      <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{r.daysOut} days — {r.owner}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{r.mrr}</span>
                      {riskChip(r.risk as "low" | "medium" | "high")}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Expansion */}
        <SectionWrapper
          title="Expansion Overview"
          description="Identified expansion opportunities and pipeline across all accounts"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Opportunities",     value: String(expansionOverview.opportunities),  color: "var(--rtm-text-primary)" },
                { label: "High Confidence",   value: String(expansionOverview.highConfidence),  color: "#10B981" },
                { label: "Potential MRR",     value: expansionOverview.potentialMrrIncrease,    color: "var(--rtm-blue)" },
                { label: "Potential ARR",     value: expansionOverview.potentialArrIncrease,    color: "var(--rtm-blue)" },
              ].map((m) => (
                <div key={m.label} className="px-4 py-3 rounded-lg border" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{m.label}</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
            <MetricLine label="Pipeline Value" value={expansionOverview.pipelineValue} bold />
          </div>
        </SectionWrapper>
      </div>

      {/* ── Cancellations & Escalations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cancellations */}
        <SectionWrapper
          title="Cancellation & Retention Overview"
          description="Open cancellation requests, save attempts, and revenue at risk"
          actions={
            <ActionBtn label="Review Cancellation Risks" icon={<IconX className="w-4 h-4" />} variant="danger" />
          }
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Open Requests",    value: String(cancellationOverview.openRequests),   color: "#DC2626" },
                { label: "Revenue At Risk",  value: cancellationOverview.revenueAtRisk,           color: "#DC2626" },
                { label: "Save Attempts",    value: String(cancellationOverview.saveAttempts),    color: "#F59E0B" },
                { label: "Clients Saved",    value: String(cancellationOverview.clientsSaved),    color: "#10B981" },
              ].map((m) => (
                <div key={m.label} className="px-4 py-3 rounded-lg border" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{m.label}</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
            <MetricLine label="Cancelled Revenue" value={cancellationOverview.cancelledRevenue} />

            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Top Cancellation Reasons</p>
              <div className="space-y-1.5">
                {cancellationReasons.map((r) => (
                  <div key={r.reason} className="flex items-center justify-between text-sm">
                    <span style={{ color: "var(--rtm-text-secondary)" }}>{r.reason}</span>
                    <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Open Cancellation Requests</p>
              <div className="space-y-2">
                {openCancellations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setDrawerKind({ type: "cancellation", id: c.id })}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors text-left"
                    style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-blue)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-border)"}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</p>
                      <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{c.reason} — {c.saveAttempt}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{c.mrr}</span>
                      {riskChip(c.risk)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Escalations */}
        <SectionWrapper
          title="Escalation Overview"
          description="Open escalations by severity, department, and executive review status"
          actions={
            <ActionBtn label="Review Critical Escalations" icon={<IconAlert className="w-4 h-4" />} variant="danger" />
          }
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Open Escalations",    value: String(escalationOverview.open),       color: "var(--rtm-text-primary)" },
                { label: "Critical",            value: String(escalationOverview.critical),   color: "#DC2626" },
                { label: "Department",          value: String(escalationOverview.department), color: "#F59E0B" },
                { label: "Client Escalations",  value: String(escalationOverview.client),     color: "#F59E0B" },
                { label: "Revenue Escalations", value: String(escalationOverview.revenue),    color: "#DC2626" },
                { label: "Exec Review Items",   value: String(escalationOverview.execReview), color: "var(--rtm-blue)" },
              ].map((m) => (
                <div key={m.label} className="px-4 py-3 rounded-lg border" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{m.label}</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Open Escalations</p>
              <div className="space-y-2">
                {openEscalations.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setDrawerKind({ type: "escalation", id: e.id })}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors text-left"
                    style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
                    onMouseEnter={(e2) => (e2.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-blue)"}
                    onMouseLeave={(e2) => (e2.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-border)"}
                  >
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: e.severity === "critical" ? "#DC2626" : "#F59E0B" }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug" style={{ color: "var(--rtm-text-primary)" }}>{e.title}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{e.department} · {e.impact}</p>
                    </div>
                    {e.execReview && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: "var(--rtm-blue)", color: "#fff" }}>
                        Exec
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>
      </div>

      {/* ── Department Performance ── */}
      <SectionWrapper
        title="Department Performance"
        description="Projects, tasks, escalations, KPI status, and bottlenecks across all departments"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                {["Department", "Projects", "Open Tasks", "Overdue", "SLA %", "Escalations", "KPI Status", "Health", "Bottleneck"].map((h) => {
                  const isLive = h === "Open Tasks" || h === "Overdue" || h === "SLA %";
                  return (
                    <th
                      key={h}
                      className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide"
                      style={{ color: isLive ? "var(--rtm-blue)" : "var(--rtm-text-muted)" }}
                    >
                      <span className="inline-flex items-center gap-1">
                        {h}
                        {isLive && (
                          <span
                            className="px-1 py-0.5 rounded text-[9px] font-bold normal-case"
                            style={{ background: "#EFF6FF", color: "var(--rtm-blue)", border: "1px solid #BFDBFE" }}
                          >
                            Live
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {departmentPerformance.map((dept) => {
                // Resolve the engine key for this mock row (handles name mismatches)
                const engineKey = MOCK_NAME_TO_ENGINE_KEY[dept.name] ?? dept.name;
                const live = liveTaskStats.get(engineKey);
                // Use live values when available; fall back to mock while loading or for
                // departments that have no engine counterpart (e.g. "Operations").
                const openTasks    = live?.openTasks    ?? dept.openTasks;
                const overdueTasks = live?.overdueTasks ?? dept.overdueTasks;
                const slaCompliance = live?.slaCompliance ?? (dept.openTasks > 0 ? Math.round(((dept.openTasks - dept.overdueTasks) / dept.openTasks) * 100) : 100);
                const slaColor = slaCompliance < 80 ? "#DC2626" : slaCompliance < 90 ? "#D97706" : "#059669";

                return (
                  <tr
                    key={dept.slug}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                  >
                    <td className="px-3 py-3">
                      <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                        {dept.name}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{dept.projects}</span>
                    </td>
                    <td className="px-3 py-3">
                      {taskStatsLoading ? (
                        <span className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>…</span>
                      ) : (
                        <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{openTasks}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {taskStatsLoading ? (
                        <span className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>…</span>
                      ) : (
                        <span
                          className="text-sm font-semibold"
                          style={{ color: overdueTasks > 5 ? "#DC2626" : overdueTasks > 2 ? "#F59E0B" : "var(--rtm-text-secondary)" }}
                        >
                          {overdueTasks}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {taskStatsLoading ? (
                        <span className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>…</span>
                      ) : (
                        <span className="text-sm font-bold" style={{ color: slaColor }}>
                          {slaCompliance}%
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: dept.escalations > 1 ? "#DC2626" : dept.escalations > 0 ? "#F59E0B" : "var(--rtm-text-secondary)" }}
                      >
                        {dept.escalations}
                      </span>
                    </td>
                    <td className="px-3 py-3">{kpiStatusBadge(dept.kpiStatus)}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full" style={{ background: healthDot(dept.health) }} />
                        <span style={{ color: "var(--rtm-text-secondary)" }}>{healthLabel(dept.health)}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 max-w-[220px]">
                      {dept.bottleneck ? (
                        <button
                          onClick={() => setDrawerKind({ type: "bottleneck", dept: dept.slug })}
                          className="text-xs leading-snug text-left transition-colors hover:underline"
                          style={{ color: "#B45309" }}
                        >
                          {dept.bottleneck}
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Footnote clarifying which columns are live vs mock */}
        <div className="mt-3 flex items-center gap-2 px-1">
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-bold"
            style={{ background: "#EFF6FF", color: "var(--rtm-blue)", border: "1px solid #BFDBFE" }}
          >
            Live
          </span>
          <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
            Open Tasks, Overdue, and SLA % are sourced from the engine store in real time.
            Projects, Escalations, KPI Status, Health, and Bottleneck are indicative estimates — real data in a future phase.
          </span>
        </div>
      </SectionWrapper>

      {/* ── AI Executive Summary ── */}
      <AISummary
        kind="executive"
        title="AI Executive Summary"
        subtitle="Agency-wide risk, revenue, and performance analysis"
        generatedAt={aiExecutiveSummary.generatedAt}
        health="at-risk"
        healthNote="3 critical escalations require immediate executive action"
        summary={aiExecutiveSummary.summary}
        blockers={aiExecutiveSummary.priorityDecisions}
        insights={[
          ...aiExecutiveSummary.topRisks,
          ...aiExecutiveSummary.revenueRisks,
          ...aiExecutiveSummary.clientRisks,
          ...aiExecutiveSummary.projectRisks,
        ]}
        actions={aiExecutiveSummary.recommendedActions}
        extraSections={[
          { heading: "Priority Decisions Needed", items: aiExecutiveSummary.priorityDecisions },
        ]}
      />

      {/* ── Executive Action Center ── */}
      <SectionWrapper
        title="Executive Action Center"
        description="Quick access to critical executive workflows and reviews"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Review Revenue Risk",       icon: <IconDollar className="w-4 h-4" />,  desc: "Revenue at risk and MRR exposure" },
            { label: "Review At-Risk Clients",    icon: <IconUsers className="w-4 h-4" />,   desc: "Critical and at-risk accounts" },
            { label: "Review Critical Escalations",icon: <IconAlert className="w-4 h-4" />,  desc: "Executive-level open escalations" },
            { label: "Review Delayed Projects",   icon: <IconFolder className="w-4 h-4" />, desc: "Blocked and behind-schedule delivery" },
            { label: "Review Renewal Forecast",   icon: <IconRefresh className="w-4 h-4" />, desc: "30–90 day renewal pipeline" },
            { label: "Review Cancellation Risks", icon: <IconX className="w-4 h-4" />,      desc: "Open requests and save attempts" },
            { label: "Expansion Pipeline",        icon: <IconTrendUp className="w-4 h-4" />, desc: "High-confidence growth opportunities" },
            { label: "Export Executive Summary",  icon: <IconDownload className="w-4 h-4" />, desc: "Download full exec report" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-start gap-3 p-4 rounded-xl border transition-all text-left"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-blue)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(27,79,216,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rtm-border)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)" }}
              >
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{action.label}</p>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--rtm-text-muted)" }}>{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Detail Drawers ── */}
      {drawerProps && (
        <DetailDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          title={drawerProps.title}
          subtitle={drawerProps.subtitle}
          statusBadge={drawerProps.statusBadge}
          tabs={drawerProps.tabs}
          width="lg"
        />
      )}
    </div>
  );
}
