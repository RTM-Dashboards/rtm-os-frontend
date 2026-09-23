"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import type { WorkspaceConfig } from "@/types/workspace";
import { fetchCurrentUser, type UserRecord } from "@/lib/users/users-api";

// ── Types ─────────────────────────────────────────────────────────────────────

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; user: UserRecord };

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  workspace:  WorkspaceConfig;
  rolesRoute?: string;
  teamRoute?:  string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatLastLogin(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Never";
  return d.toLocaleDateString("en-US", {
    year:  "numeric",
    month: "short",
    day:   "numeric",
  });
}

function statusVariant(status: string): "success" | "warning" | "neutral" {
  if (status === "active")  return "success";
  if (status === "pending") return "warning";
  return "neutral";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkspaceProfilePage({
  workspace,
  rolesRoute,
  teamRoute,
}: Props) {
  const [state, setState] = useState<LoadState>({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser()
      .then((user) => {
        if (cancelled) return;
        if (!user) {
          setState({ phase: "error", message: "Could not identify your account. Try signing out and back in." });
        } else {
          setState({ phase: "ready", user });
        }
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
  }, []);

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (state.phase === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader workspace={workspace} />
        <div
          className="flex items-center justify-center py-16 rounded-xl border"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p style={{ color: "var(--rtm-text-secondary)" }}>Loading your profile…</p>
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
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
            Could not load your profile
          </p>
          <p className="text-sm text-center max-w-sm" style={{ color: "var(--rtm-text-secondary)" }}>
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────────────

  const { user } = state;

  const quickLinks = [
    { label: "← Dashboard", href: workspace.dashboardRoute },
    ...(teamRoute  ? [{ label: "Team Members",       href: teamRoute  }] : []),
    ...(rolesRoute ? [{ label: "Roles & Permissions", href: rolesRoute }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader workspace={workspace} />

      {/* ── Avatar Hero Card ── */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-xl border"
        style={{
          background:  "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
          boxShadow:   "0 1px 4px rgba(15,28,56,0.06)",
        }}
      >
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{
            background:    `${workspace.accentColor}18`,
            color:         workspace.accentColor,
            outline:       `3px solid ${workspace.accentColor}30`,
            outlineOffset: "2px",
          }}
        >
          {initials(user.name)}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {user.name}
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
            {user.role ?? "No role assigned"} · {user.department ?? "No department"}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <StatusBadge
              variant={statusVariant(user.status)}
              label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              size="sm"
            />
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Last login: {formatLastLogin(user.lastLoginAt)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Profile Details ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main detail block */}
        <div className="lg:col-span-2">
          <SectionWrapper title="Profile Details" description="Account information">
            <dl className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {(
                [
                  { label: "Full Name",   value: user.name },
                  { label: "Email",       value: user.email },
                  { label: "Department",  value: user.department ?? "Not assigned" },
                  { label: "Role",        value: user.role ?? "No role assigned" },
                  {
                    label: "Status",
                    value: (
                      <StatusBadge
                        variant={statusVariant(user.status)}
                        label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        size="sm"
                      />
                    ),
                  },
                  { label: "Last Login",  value: formatLastLogin(user.lastLoginAt) },
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

        {/* Sidebar: Quick Links */}
        <div className="space-y-4">
          <SectionWrapper title="Quick Links">
            <div className="space-y-1">
              {quickLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                  style={{
                    color:      "var(--rtm-text-secondary)",
                    background: "var(--rtm-bg)",
                    border:     "1px solid var(--rtm-border-light)",
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

// ── Sub-components ────────────────────────────────────────────────────────────

function PageHeader({ workspace }: { workspace: WorkspaceConfig }) {
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
        My Profile
      </h1>
      <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
        View your account details and access settings.
      </p>
    </div>
  );
}
