"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import TeamMembersTable from "./TeamMembersTable";
import type { WorkspaceConfig } from "@/types/workspace";
import { fetchUsersByDepartment, type UserRecord } from "@/lib/users/users-api";

// ── Types ─────────────────────────────────────────────────────────────────────

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; members: UserRecord[] };

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  workspace:    WorkspaceConfig;
  rolesRoute?:  string;
  profileRoute?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkspaceTeamMembersPage({
  workspace,
  rolesRoute,
  profileRoute,
}: Props) {
  const [state, setState] = useState<LoadState>({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchUsersByDepartment(workspace.name)
      .then((members) => {
        if (!cancelled) setState({ phase: "ready", members });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            phase:   "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      });
    return () => { cancelled = true; };
  }, [workspace.name]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (state.phase === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader workspace={workspace} />
        <div
          className="flex items-center justify-center py-16 rounded-xl border"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p style={{ color: "var(--rtm-text-secondary)" }}>
            Loading team members…
          </p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────

  if (state.phase === "error") {
    return (
      <div className="space-y-6">
        <PageHeader workspace={workspace} />
        <div
          className="flex flex-col items-center justify-center gap-3 py-16 rounded-xl border"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border-error, #FCA5A5)" }}
        >
          <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
            Could not load team members
          </p>
          <p className="text-sm text-center max-w-sm" style={{ color: "var(--rtm-text-secondary)" }}>
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────────────

  const { members } = state;

  const active   = members.filter((m) => m.status === "active").length;
  const pending  = members.filter((m) => m.status === "pending").length;
  const disabled = members.filter((m) => m.status === "disabled").length;

  const summaryChips = [
    {
      label: "Total Members",
      value: members.length,
      bg:    `${workspace.accentColor}12`,
      color: workspace.accentColor,
    },
    {
      label: "Active",
      value: active,
      bg:    "#ECFDF5",
      color: "#059669",
    },
    ...(pending > 0
      ? [{ label: "Pending", value: pending, bg: "#FFFBEB", color: "#B45309" }]
      : []),
    ...(disabled > 0
      ? [{ label: "Disabled", value: disabled, bg: "#F8FAFC", color: "#64748B" }]
      : []),
  ];

  // Role breakdown (only for members with a role set)
  const roleMap = new Map<string, number>();
  for (const m of members) {
    if (m.role) roleMap.set(m.role, (roleMap.get(m.role) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <PageHeader workspace={workspace} memberCount={members.length} />

      {/* ── Summary chips ── */}
      <div className="flex flex-wrap gap-3">
        {summaryChips.map(({ label, value, bg, color }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 border"
            style={{
              background:  bg,
              color,
              borderColor: "transparent",
              boxShadow:   "0 1px 3px rgba(15,28,56,0.04)",
            }}
          >
            <span className="text-xl font-bold leading-none">{value}</span>
            <span className="text-sm font-medium opacity-80">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Team table or empty state ── */}
      <SectionWrapper
        title="All Members"
        description={`${workspace.name} team roster`}
        noPadding
        actions={
          rolesRoute ? (
            <Link
              href={rolesRoute}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
              style={{
                background:  `${workspace.accentColor}10`,
                borderColor: `${workspace.accentColor}30`,
                color:       workspace.accentColor,
              }}
            >
              Roles & Permissions →
            </Link>
          ) : undefined
        }
      >
        {members.length === 0 ? (
          <EmptyState workspace={workspace} />
        ) : (
          <TeamMembersTable members={members} accentColor={workspace.accentColor} />
        )}
      </SectionWrapper>

      {/* ── Role breakdown (only when there are members with roles) ── */}
      {roleMap.size > 0 && (
        <SectionWrapper
          title="Role Breakdown"
          description="Member distribution by role"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from(roleMap.entries()).map(([role, count]) => (
              <div
                key={role}
                className="flex flex-col gap-1 p-3 rounded-lg"
                style={{
                  background: "var(--rtm-bg)",
                  border:     "1px solid var(--rtm-border-light)",
                }}
              >
                <span
                  className="text-2xl font-bold"
                  style={{ color: workspace.accentColor }}
                >
                  {count}
                </span>
                <span
                  className="text-[11px] font-medium leading-snug"
                  style={{ color: "var(--rtm-text-secondary)" }}
                >
                  {role}
                </span>
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* ── Footer nav ── */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={workspace.dashboardRoute}
          className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background:  "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color:       "var(--rtm-text-secondary)",
          }}
        >
          ← Dashboard
        </Link>
        {profileRoute && (
          <Link
            href={profileRoute}
            className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background:  "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color:       "var(--rtm-text-secondary)",
            }}
          >
            My Profile
          </Link>
        )}
        {rolesRoute && (
          <Link
            href={rolesRoute}
            className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium"
            style={{
              background:  workspace.accentColor,
              borderColor: workspace.accentColor,
              color:       "#fff",
            }}
          >
            Roles & Permissions →
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PageHeader({
  workspace,
  memberCount,
}: {
  workspace:    WorkspaceConfig;
  memberCount?: number;
}) {
  return (
    <div>
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-1"
        style={{ color: workspace.accentColor }}
      >
        {workspace.name}
      </p>
      <h1
        className="text-2xl font-bold tracking-tight"
        style={{ color: "var(--rtm-text-primary)" }}
      >
        Team Members
      </h1>
      <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
        {memberCount !== undefined
          ? `${memberCount} team member${memberCount !== 1 ? "s" : ""} · roles and status.`
          : "Loading team roster…"}
      </p>
    </div>
  );
}

function EmptyState({ workspace }: { workspace: WorkspaceConfig }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center"
      style={{ color: "var(--rtm-text-secondary)" }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
        style={{ background: `${workspace.accentColor}12`, color: workspace.accentColor }}
      >
        {workspace.icon}
      </div>
      <div className="space-y-2 max-w-sm">
        <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
          No team members yet
        </p>
        <p className="text-sm leading-relaxed">
          Team members appear here once they have signed in to RTM OS for the
          first time. After signing in, a manager assigns their role and
          department, and they will show up on this page.
        </p>
      </div>
    </div>
  );
}
