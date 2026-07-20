"use client";

/**
 * SeoTeamPerformanceRollup
 *
 * Renders per-team aggregated task metrics for SEO & Local's two sub-teams
 * (On-Page SEO and Off-Page SEO).
 *
 * Data source: the same usePersonTaskStats stats map already computed by the
 * parent page — no duplicate task computation here.
 *
 * KPI gating: respects the parent's isEnabled() for People KPI IDs, exactly
 * mirroring the existing People Performance pattern.
 *
 * Access gate: only rendered when role === "manager" — caller is responsible
 * for that guard; this component renders unconditionally when mounted.
 */

import { useMemo } from "react";
import { ProgressBar } from "@/components/ui";
import type { PersonTaskStat } from "@/lib/hooks/usePersonTaskStats";
import { seoLocalMembers } from "@/lib/workspace-people";
import type { SeoTeam } from "@/lib/workspace-people";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TeamRollup {
  team: SeoTeam;
  lead: string | null;
  memberCount: number;
  /** sum of completed tasks across all team members with engine data */
  tasksCompleted: number;
  /** average SLA compliance across members (weighted by open-task count) */
  slaCompliance: number;
  /** average utilization across members with at least 1 task */
  utilization: number;
  /** individual member stats for the expanded rows */
  members: Array<{
    name: string;
    role: string;
    isLead: boolean;
    stat: PersonTaskStat | null;
  }>;
}

interface Props {
  stats: Map<string, PersonTaskStat>;
  loading: boolean;
  isEnabled: (kpiId: string) => boolean;
}

// ── Team config derived from roster ──────────────────────────────────────────

const SEO_TEAMS: SeoTeam[] = ["On-Page SEO", "Off-Page SEO"];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Weighted-average SLA: weight each member by their open task count */
function weightedSla(members: Array<{ stat: PersonTaskStat | null }>): number {
  let totalOpen = 0;
  let weightedSum = 0;
  for (const { stat } of members) {
    if (!stat || stat.total === 0) continue;
    totalOpen += stat.open;
    weightedSum += stat.slaCompliance * stat.open;
  }
  if (totalOpen === 0) return 100; // everyone is on track with no open tasks
  return Math.round(weightedSum / totalOpen);
}

/** Average utilization across members who have at least 1 task */
function avgUtilization(members: Array<{ stat: PersonTaskStat | null }>): number {
  const withData = members.filter((m) => m.stat && m.stat.total > 0);
  if (withData.length === 0) return 0;
  const sum = withData.reduce((s, m) => s + (m.stat?.utilization ?? 0), 0);
  return Math.round(sum / withData.length);
}

// ── Metric cell ───────────────────────────────────────────────────────────────

function MetricCell({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        {label}
      </span>
      <span className="text-xl font-bold" style={{ color }}>
        {value}
      </span>
      {sub && (
        <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

// ── Progress bar with percent label ──────────────────────────────────────────

function PctBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <ProgressBar value={value} max={100} height={5} color={color} />
      <span
        className="text-xs font-bold flex-shrink-0 w-10 text-right"
        style={{ color }}
      >
        {value}%
      </span>
    </div>
  );
}

// ── Member row within the expanded table ─────────────────────────────────────

function MemberRow({
  name,
  role,
  isLead,
  stat,
  isEnabled,
}: {
  name: string;
  role: string;
  isLead: boolean;
  stat: PersonTaskStat | null;
  isEnabled: (id: string) => boolean;
}) {
  const hasData = stat && stat.total > 0;

  return (
    <tr
      style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
    >
      {/* Name + role */}
      <td className="py-2 pr-4">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{
              background: "var(--rtm-blue-xlight)",
              color: "var(--rtm-blue)",
            }}
          >
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <p
              className="text-sm font-semibold leading-none"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {name}
              {isLead && (
                <span
                  className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#FFFBEB", color: "#B45309" }}
                >
                  Lead
                </span>
              )}
            </p>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {role}
            </p>
          </div>
        </div>
      </td>

      {/* Tasks Completed */}
      {isEnabled("people-tasks-completed") && (
        <td className="py-2 pr-4">
          {hasData ? (
            <div>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {stat.completed}
              </span>
              <span
                className="text-[11px] ml-1"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                / {stat.total}
              </span>
            </div>
          ) : (
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              —
            </span>
          )}
        </td>
      )}

      {/* SLA Compliance */}
      {isEnabled("people-sla-compliance") && (
        <td className="py-2 pr-4" style={{ minWidth: "120px" }}>
          {hasData ? (
            <PctBar
              value={stat.slaCompliance}
              color={
                stat.slaCompliance >= 90
                  ? "#059669"
                  : stat.slaCompliance >= 70
                  ? "#D97706"
                  : "#DC2626"
              }
            />
          ) : (
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              —
            </span>
          )}
        </td>
      )}

      {/* Utilization */}
      {isEnabled("people-utilization-workload") && (
        <td className="py-2" style={{ minWidth: "120px" }}>
          {hasData ? (
            <PctBar
              value={stat.utilization}
              color={
                stat.utilization >= 60
                  ? "var(--rtm-blue)"
                  : "#D97706"
              }
            />
          ) : (
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              —
            </span>
          )}
        </td>
      )}
    </tr>
  );
}

// ── Team card ─────────────────────────────────────────────────────────────────

function TeamCard({
  rollup,
  isEnabled,
}: {
  rollup: TeamRollup;
  isEnabled: (id: string) => boolean;
}) {
  const slaColor =
    rollup.slaCompliance >= 90
      ? "#059669"
      : rollup.slaCompliance >= 70
      ? "#D97706"
      : "#DC2626";

  const utilizationColor =
    rollup.utilization >= 60 ? "var(--rtm-blue)" : "#D97706";

  const teamIcon = rollup.team === "On-Page SEO" ? "📄" : "🔗";

  // Only show table header columns that are enabled
  const showCompleted = isEnabled("people-tasks-completed");
  const showSla = isEnabled("people-sla-compliance");
  const showUtil = isEnabled("people-utilization-workload");

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
      }}
    >
      {/* Team header */}
      <div
        className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border-light)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{teamIcon}</span>
          <div>
            <h3
              className="text-base font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {rollup.team}
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {rollup.memberCount} member{rollup.memberCount !== 1 ? "s" : ""}
              {rollup.lead ? ` · Lead: ${rollup.lead}` : ""}
            </p>
          </div>
        </div>

        {/* Team-level rollup metrics */}
        <div className="flex flex-wrap gap-5">
          {isEnabled("people-tasks-completed") && (
            <MetricCell
              label="Tasks Completed"
              value={rollup.tasksCompleted}
              sub="team total"
              color="var(--rtm-text-primary)"
            />
          )}
          {isEnabled("people-sla-compliance") && (
            <MetricCell
              label="SLA Compliance"
              value={`${rollup.slaCompliance}%`}
              sub="weighted avg"
              color={slaColor}
            />
          )}
          {isEnabled("people-utilization-workload") && (
            <MetricCell
              label="Utilization"
              value={`${rollup.utilization}%`}
              sub="avg across team"
              color={utilizationColor}
            />
          )}
        </div>
      </div>

      {/* Member breakdown table */}
      <div className="px-5 pb-4">
        <table className="w-full mt-3 border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rtm-border)" }}>
              <th
                className="text-left pb-2 pr-4 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Member
              </th>
              {showCompleted && (
                <th
                  className="text-left pb-2 pr-4 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  Completed / Total
                </th>
              )}
              {showSla && (
                <th
                  className="text-left pb-2 pr-4 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  SLA Compliance
                </th>
              )}
              {showUtil && (
                <th
                  className="text-left pb-2 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  Utilization
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rollup.members.map((m) => (
              <MemberRow
                key={m.name}
                name={m.name}
                role={m.role}
                isLead={m.isLead}
                stat={m.stat}
                isEnabled={isEnabled}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SeoTeamPerformanceRollup({
  stats,
  loading,
  isEnabled,
}: Props) {
  const rollups = useMemo<TeamRollup[]>(() => {
    return SEO_TEAMS.map((team) => {
      // Get all roster members assigned to this team
      const rosterMembers = seoLocalMembers.filter((m) => m.seoTeam === team);

      const members = rosterMembers.map((m) => ({
        name: m.user,
        role: m.role,
        isLead: m.isTeamLead === true,
        // Match by full name against engine's assignedUserName.
        // Engine uses short forms like "Carlos M." — we try both full and short.
        stat: stats.get(m.user) ?? null,
      }));

      const lead = rosterMembers.find((m) => m.isTeamLead)?.user ?? null;

      const tasksCompleted = members.reduce(
        (s, m) => s + (m.stat?.completed ?? 0),
        0
      );

      return {
        team,
        lead,
        memberCount: rosterMembers.length,
        tasksCompleted,
        slaCompliance: weightedSla(members),
        utilization: avgUtilization(members),
        members,
      };
    });
  }, [stats]);

  // Show section regardless of loading — individual cells show "—" when no data
  const anyKpiVisible =
    isEnabled("people-tasks-completed") ||
    isEnabled("people-sla-compliance") ||
    isEnabled("people-utilization-workload");

  if (!anyKpiVisible) return null;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Team Performance Rollup
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Aggregated task metrics per sub-team — rolled up from individual
            member data.
          </p>
        </div>
        {loading && (
          <span
            className="text-xs animate-pulse"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Loading task data…
          </span>
        )}
      </div>

      {/* One card per team */}
      {rollups.map((rollup) => (
        <TeamCard key={rollup.team} rollup={rollup} isEnabled={isEnabled} />
      ))}

      {/* Footnote */}
      <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
        Metrics computed from the live task engine — completed, open, and
        overdue counts per member. SLA Compliance = (open − overdue) / open × 100,
        weighted by open task volume. Utilization = completed / total tasks.
      </p>
    </div>
  );
}
