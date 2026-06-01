"use client";

import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("account-management")!;

// ── Role definitions ─────────────────────────────────────────────────────────
const roles = [
  {
    name: "Department Head",
    badge: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
    description: "Full access — owns strategy, budget, team, and all client data.",
  },
  {
    name: "Manager",
    badge: { bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", border: "var(--rtm-blue-light)" },
    description: "Manages a pod of AMs, approves deliverables, reviews performance.",
  },
  {
    name: "Coordinator",
    badge: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
    description: "Day-to-day client ops, check-ins, task management across assigned clients.",
  },
  {
    name: "Specialist",
    badge: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    description: "Focused execution on specific deliverables; limited edit scope.",
  },
  {
    name: "Viewer",
    badge: { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
    description: "Read-only access to reporting, client data, and dashboards.",
  },
] as const;

type RoleName = (typeof roles)[number]["name"];

// ── Permission areas ─────────────────────────────────────────────────────────
type PermLevel = "full" | "partial" | "own" | "none";

interface PermissionArea {
  area: string;
  description: string;
  perms: Record<RoleName, PermLevel>;
}

const permissionAreas: PermissionArea[] = [
  {
    area: "Dashboard",
    description: "View workspace dashboard & KPIs",
    perms: {
      "Department Head": "full",
      Manager: "full",
      Coordinator: "full",
      Specialist: "full",
      Viewer: "full",
    },
  },
  {
    area: "Client Portfolio",
    description: "View client list and health scores",
    perms: {
      "Department Head": "full",
      Manager: "full",
      Coordinator: "own",
      Specialist: "own",
      Viewer: "full",
    },
  },
  {
    area: "Client Edit",
    description: "Edit client details, services, contacts",
    perms: {
      "Department Head": "full",
      Manager: "full",
      Coordinator: "own",
      Specialist: "own",
      Viewer: "none",
    },
  },
  {
    area: "Team Members",
    description: "View team members and assignments",
    perms: {
      "Department Head": "full",
      Manager: "full",
      Coordinator: "partial",
      Specialist: "none",
      Viewer: "none",
    },
  },
  {
    area: "Roles & Permissions",
    description: "Manage roles and access levels",
    perms: {
      "Department Head": "full",
      Manager: "partial",
      Coordinator: "none",
      Specialist: "none",
      Viewer: "none",
    },
  },
  {
    area: "Check-ins",
    description: "Log & view client check-ins",
    perms: {
      "Department Head": "full",
      Manager: "full",
      Coordinator: "own",
      Specialist: "own",
      Viewer: "full",
    },
  },
  {
    area: "Tasks",
    description: "Create, assign, and complete tasks",
    perms: {
      "Department Head": "full",
      Manager: "full",
      Coordinator: "own",
      Specialist: "own",
      Viewer: "none",
    },
  },
  {
    area: "Reports",
    description: "Generate and send client reports",
    perms: {
      "Department Head": "full",
      Manager: "full",
      Coordinator: "own",
      Specialist: "partial",
      Viewer: "full",
    },
  },
  {
    area: "Onboarding",
    description: "Manage onboarding queue and launches",
    perms: {
      "Department Head": "full",
      Manager: "full",
      Coordinator: "own",
      Specialist: "none",
      Viewer: "none",
    },
  },
  {
    area: "Performance",
    description: "View and export performance metrics",
    perms: {
      "Department Head": "full",
      Manager: "full",
      Coordinator: "partial",
      Specialist: "none",
      Viewer: "full",
    },
  },
  {
    area: "Budget / Billing",
    description: "View & manage department budget",
    perms: {
      "Department Head": "full",
      Manager: "partial",
      Coordinator: "none",
      Specialist: "none",
      Viewer: "none",
    },
  },
  {
    area: "Settings",
    description: "Configure workspace settings",
    perms: {
      "Department Head": "full",
      Manager: "partial",
      Coordinator: "none",
      Specialist: "none",
      Viewer: "none",
    },
  },
];

// ── Permission level cell ─────────────────────────────────────────────────────
const permLevelConfig: Record<
  PermLevel,
  { icon: string; label: string; bg: string; color: string; border: string }
> = {
  full:    { icon: "✓",  label: "Full",    bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  partial: { icon: "◑",  label: "Partial", bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  own:     { icon: "⊙",  label: "Own",     bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", border: "var(--rtm-blue-light)" },
  none:    { icon: "—",  label: "None",    bg: "#F8FAFC", color: "#CBD5E1", border: "#E2E8F0" },
};

function PermCell({ level }: { level: PermLevel }) {
  const cfg = permLevelConfig[level];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

export default function RolesPage() {
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
          Account Management Roles &amp; Permissions
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Permission matrix across all {roles.length} role levels.
        </p>
      </div>

      {/* ── Role summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {roles.map((r) => (
          <div
            key={r.name}
            className="rounded-xl border p-4 flex flex-col gap-2"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              boxShadow: "0 1px 3px rgba(15,28,56,0.04)",
            }}
          >
            <span
              className="self-start px-2 py-0.5 rounded-full text-[11px] font-bold border"
              style={{ background: r.badge.bg, color: r.badge.color, borderColor: r.badge.border }}
            >
              {r.name}
            </span>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--rtm-text-muted)" }}>
              {r.description}
            </p>
          </div>
        ))}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
          Legend:
        </span>
        {(Object.entries(permLevelConfig) as [PermLevel, (typeof permLevelConfig)[PermLevel]][]).map(
          ([key, cfg]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
              style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
            >
              <span>{cfg.icon}</span>
              {cfg.label}
              {key === "own" && (
                <span className="opacity-70">(assigned only)</span>
              )}
            </span>
          )
        )}
      </div>

      {/* ── Permissions matrix ── */}
      <SectionWrapper
        title="Permissions Matrix"
        description={`${permissionAreas.length} permission areas`}
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold w-48"
                  style={{ color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)" }}
                >
                  Permission Area
                </th>
                {roles.map((r) => (
                  <th
                    key={r.name}
                    className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap"
                    style={{ color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)" }}
                  >
                    <span
                      className="inline-block px-2 py-0.5 rounded-full border font-bold"
                      style={{ background: r.badge.bg, color: r.badge.color, borderColor: r.badge.border }}
                    >
                      {r.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionAreas.map((area, idx) => (
                <tr
                  key={area.area}
                  style={{
                    borderBottom:
                      idx < permissionAreas.length - 1
                        ? "1px solid var(--rtm-border-light)"
                        : undefined,
                    background:
                      idx % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-bg)",
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>
                      {area.area}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                      {area.description}
                    </p>
                  </td>
                  {roles.map((r) => (
                    <td key={r.name} className="px-4 py-3 text-center">
                      <PermCell level={area.perms[r.name]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Footer nav ── */}
      <div className="flex gap-2">
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
        <Link
          href="/account-management/team-members"
          className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-secondary)",
          }}
        >
          ← Team Members
        </Link>
      </div>
    </div>
  );
}
