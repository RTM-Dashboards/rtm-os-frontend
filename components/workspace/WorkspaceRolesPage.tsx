"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import RolePermissionsMatrix from "./RolePermissionsMatrix";
import type { WorkspaceConfig } from "@/types/workspace";
import type { RoleDef, PermissionArea } from "@/lib/workspace-people";

interface Props {
  workspace: WorkspaceConfig;
  roles: RoleDef[];
  permissionAreas: PermissionArea[];
  teamRoute?: string;
  profileRoute?: string;
}

export default function WorkspaceRolesPage({
  workspace,
  roles,
  permissionAreas,
  teamRoute,
  profileRoute,
}: Props) {
  const totalMembers = roles.reduce((sum, r) => sum + r.memberCount, 0);

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
          Roles &amp; Permissions
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          {roles.length} role levels · {totalMembers} total members · permission matrix for all workspace actions.
        </p>
      </div>

      {/* ── Role summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {roles.map((r) => (
          <div
            key={r.name}
            className="rounded-xl border p-4 flex flex-col gap-3"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              boxShadow: "0 1px 3px rgba(15,28,56,0.04)",
            }}
          >
            {/* Role badge */}
            <span
              className="self-start px-2 py-0.5 rounded-full text-[11px] font-bold border"
              style={{
                background: r.badge.bg,
                color: r.badge.color,
                borderColor: r.badge.border,
              }}
            >
              {r.name}
            </span>

            {/* Description */}
            <p
              className="text-[11px] leading-relaxed flex-1"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {r.description}
            </p>

            {/* Member count */}
            <div className="flex items-center gap-1.5 pt-1" style={{ borderTop: "1px solid var(--rtm-border-light)" }}>
              <span
                className="text-lg font-bold leading-none"
                style={{ color: r.badge.color }}
              >
                {r.memberCount}
              </span>
              <span className="text-[10px] font-medium" style={{ color: "var(--rtm-text-muted)" }}>
                {r.memberCount === 1 ? "member" : "members"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Coverage stats ── */}
      <SectionWrapper title="Access Coverage" description="How permissions break down across the team">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Full Access Areas",
              value: permissionAreas.filter((a) =>
                Object.values(a.perms).some((v) => v === "full"),
              ).length,
              color: "#059669",
              bg: "#ECFDF5",
            },
            {
              label: "Partial Access Areas",
              value: permissionAreas.filter((a) =>
                Object.values(a.perms).some((v) => v === "partial"),
              ).length,
              color: "#B45309",
              bg: "#FFFBEB",
            },
            {
              label: "Own-Only Areas",
              value: permissionAreas.filter((a) =>
                Object.values(a.perms).some((v) => v === "own"),
              ).length,
              color: "var(--rtm-blue)",
              bg: "var(--rtm-blue-xlight)",
            },
            {
              label: "Restricted Areas",
              value: permissionAreas.filter((a) =>
                Object.values(a.perms).some((v) => v === "none"),
              ).length,
              color: "#94A3B8",
              bg: "#F8FAFC",
            },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              className="flex flex-col gap-1 p-4 rounded-xl border"
              style={{ background: bg, borderColor: "transparent" }}
            >
              <span className="text-2xl font-bold" style={{ color }}>
                {value}
              </span>
              <span className="text-[11px] font-medium" style={{ color }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Permissions matrix ── */}
      <RolePermissionsMatrix roles={roles} permissionAreas={permissionAreas} />

      {/* ── Footer nav ── */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={workspace.dashboardRoute}
          className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium"
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
            className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-secondary)",
            }}
          >
            My Profile
          </Link>
        )}
        {teamRoute && (
          <Link
            href={teamRoute}
            className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-secondary)",
            }}
          >
            ← Team Members
          </Link>
        )}
      </div>
    </div>
  );
}
