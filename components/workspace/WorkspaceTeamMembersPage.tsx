"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import TeamMembersTable from "./TeamMembersTable";
import type { WorkspaceConfig } from "@/types/workspace";
import type { TeamMemberRow } from "@/lib/workspace-people";

interface Props {
  workspace: WorkspaceConfig;
  members: TeamMemberRow[];
  rolesRoute?: string;
  profileRoute?: string;
}

export default function WorkspaceTeamMembersPage({
  workspace,
  members,
  rolesRoute,
  profileRoute,
}: Props) {
  const active   = members.filter((m) => m.status === "Active").length;
  const onLeave  = members.filter((m) => m.status === "On Leave").length;
  const inactive = members.filter((m) => m.status === "Inactive").length;

  const summaryChips = [
    {
      label: "Total Members",
      value: members.length,
      bg: `${workspace.accentColor}12`,
      color: workspace.accentColor,
    },
    {
      label: "Active",
      value: active,
      bg: "#ECFDF5",
      color: "#059669",
    },
    ...(onLeave > 0
      ? [{ label: "On Leave", value: onLeave, bg: "#FFFBEB", color: "#B45309" }]
      : []),
    ...(inactive > 0
      ? [{ label: "Inactive", value: inactive, bg: "#F8FAFC", color: "#64748B" }]
      : []),
  ];

  // Role breakdown
  const roleMap = new Map<string, number>();
  for (const m of members) {
    roleMap.set(m.role, (roleMap.get(m.role) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
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
          {members.length} team member{members.length !== 1 ? "s" : ""} · roles, access levels, and client assignments.
        </p>
      </div>

      {/* ── Summary chips ── */}
      <div className="flex flex-wrap gap-3">
        {summaryChips.map(({ label, value, bg, color }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 border"
            style={{
              background: bg,
              color,
              borderColor: "transparent",
              boxShadow: "0 1px 3px rgba(15,28,56,0.04)",
            }}
          >
            <span className="text-xl font-bold leading-none">{value}</span>
            <span className="text-sm font-medium opacity-80">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Team table ── */}
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
                background: `${workspace.accentColor}10`,
                borderColor: `${workspace.accentColor}30`,
                color: workspace.accentColor,
              }}
            >
              Roles & Permissions →
            </Link>
          ) : undefined
        }
      >
        <TeamMembersTable members={members} accentColor={workspace.accentColor} />
      </SectionWrapper>

      {/* ── Role breakdown ── */}
      <SectionWrapper
        title="Role Breakdown"
        description="Member distribution by role title"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from(roleMap.entries()).map(([role, count]) => (
            <div
              key={role}
              className="flex flex-col gap-1 p-3 rounded-lg"
              style={{
                background: "var(--rtm-bg)",
                border: "1px solid var(--rtm-border-light)",
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

      {/* ── Footer nav ── */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={workspace.dashboardRoute}
          className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-secondary)",
          }}
        >
          ← Dashboard
        </Link>
        {profileRoute && (
          <Link
            href={profileRoute}
            className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-secondary)",
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
              background: workspace.accentColor,
              borderColor: workspace.accentColor,
              color: "#fff",
            }}
          >
            Roles & Permissions →
          </Link>
        )}
      </div>
    </div>
  );
}
