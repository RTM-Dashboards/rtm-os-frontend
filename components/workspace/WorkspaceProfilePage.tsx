"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import type { WorkspaceConfig } from "@/types/workspace";
import type { WorkspaceProfileData } from "@/lib/workspace-people";

interface Props {
  workspace: WorkspaceConfig;
  profile: WorkspaceProfileData;
  /** Link to roles page within this workspace */
  rolesRoute?: string;
  /** Link to team-members page within this workspace */
  teamRoute?: string;
}

export default function WorkspaceProfilePage({
  workspace,
  profile,
  rolesRoute,
  teamRoute,
}: Props) {
  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
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
          My Profile
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          View and manage your account details and access settings.
        </p>
      </div>

      {/* ── Avatar Hero Card ── */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-xl border"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
          boxShadow: "0 1px 4px rgba(15,28,56,0.06)",
        }}
      >
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{
            background: `${workspace.accentColor}18`,
            color: workspace.accentColor,
            outline: `3px solid ${workspace.accentColor}30`,
            outlineOffset: "2px",
          }}
        >
          {profile.initials}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {profile.name}
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
            {profile.role} · {profile.department}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <StatusBadge variant={profile.accessVariant} label={profile.accessLevel} size="sm" />
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Last login: {profile.lastLogin}
            </span>
          </div>
        </div>

        {/* Quick-stat chips */}
        <div className="flex flex-row sm:flex-col gap-2 text-right">
          <div
            className="rounded-lg px-3 py-2 text-center"
            style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}
          >
            <p className="text-lg font-bold" style={{ color: workspace.accentColor }}>
              {profile.assignedClients.length}
            </p>
            <p className="text-[10px] font-medium" style={{ color: "var(--rtm-text-muted)" }}>
              Clients
            </p>
          </div>
          <div
            className="rounded-lg px-3 py-2 text-center"
            style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}
          >
            <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
              {profile.timezone}
            </p>
            <p className="text-[10px] font-medium" style={{ color: "var(--rtm-text-muted)" }}>
              Timezone
            </p>
          </div>
        </div>
      </div>

      {/* ── Profile Details ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main detail block */}
        <div className="lg:col-span-2">
          <SectionWrapper title="Profile Details" description="Personal and access information">
            <dl className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {(
                [
                  { label: "Full Name",     value: profile.name },
                  { label: "Email",         value: profile.email },
                  { label: "Phone",         value: profile.phone ?? "—" },
                  { label: "Department",    value: profile.department },
                  { label: "Role",          value: profile.role },
                  {
                    label: "Access Level",
                    value: <StatusBadge variant={profile.accessVariant} label={profile.accessLevel} size="sm" />,
                  },
                  { label: "Member Since",  value: profile.joinedDate },
                  { label: "Timezone",      value: profile.timezone },
                ] as { label: string; value: React.ReactNode }[]
              ).map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <dt
                    className="w-36 flex-shrink-0 text-xs font-semibold pt-0.5"
                    style={{ color: "var(--rtm-text-secondary)" }}
                  >
                    {label}
                  </dt>
                  <dd className="flex-1 text-sm" style={{ color: "var(--rtm-text-primary)" }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </SectionWrapper>
        </div>

        {/* Sidebar: Assigned Clients */}
        <div className="space-y-4">
          <SectionWrapper
            title="Assigned Clients"
            description={`${profile.assignedClients.length} active assignments`}
          >
            <div className="space-y-2">
              {profile.assignedClients.map((client, i) => (
                <div
                  key={client}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg"
                  style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: `${workspace.accentColor}18`, color: workspace.accentColor }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                    {client}
                  </span>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* Quick nav */}
          <SectionWrapper title="Quick Links">
            <div className="space-y-1">
              {[
                { label: "← Dashboard", href: workspace.dashboardRoute },
                ...(teamRoute ? [{ label: "Team Members", href: teamRoute }] : []),
                ...(rolesRoute ? [{ label: " Roles & Permissions", href: rolesRoute }] : []),
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                  style={{
                    color: "var(--rtm-text-secondary)",
                    background: "var(--rtm-bg)",
                    border: "1px solid var(--rtm-border-light)",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
