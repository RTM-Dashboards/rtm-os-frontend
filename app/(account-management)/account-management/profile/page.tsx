"use client";

import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("account-management")!;

const profile = {
  name: "Jordan Mitchell",
  email: "jordan.mitchell@rtm.agency",
  department: "Account Management",
  role: "Senior Account Manager",
  accessLevel: "Manager",
  assignedClients: [
    "Apex Roofing",
    "Pacific Dental",
    "Summit Landscaping",
  ],
  lastLogin: "Today at 9:14 AM",
};

const fieldRows: { label: string; value: React.ReactNode }[] = [
  { label: "Full Name",        value: profile.name },
  { label: "Email",            value: profile.email },
  { label: "Department",       value: profile.department },
  { label: "Role",             value: profile.role },
  {
    label: "Access Level",
    value: (
      <StatusBadge variant="info" label={profile.accessLevel} size="sm" />
    ),
  },
  {
    label: "Assigned Clients",
    value: (
      <div className="flex flex-wrap gap-1.5">
        {profile.assignedClients.map((c) => (
          <span
            key={c}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border"
            style={{
              background: "var(--rtm-blue-xlight)",
              color: "var(--rtm-blue)",
              borderColor: "var(--rtm-blue-light)",
            }}
          >
            {c}
          </span>
        ))}
      </div>
    ),
  },
  { label: "Last Login",       value: profile.lastLogin },
];

export default function ProfilePage() {
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
          My Profile
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          View and manage your account details and access settings.
        </p>
      </div>

      {/* ── Avatar + name card ── */}
      <div
        className="flex items-center gap-5 p-5 rounded-xl border"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
          boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
        >
          JM
        </div>
        <div>
          <p
            className="text-lg font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {profile.name}
          </p>
          <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
            {profile.role} · {profile.department}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            Last login: {profile.lastLogin}
          </p>
        </div>
      </div>

      {/* ── Profile details ── */}
      <SectionWrapper title="Profile Details" description="Your personal and access information">
        <dl className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
          {fieldRows.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-start gap-4 py-3 first:pt-0 last:pb-0"
            >
              <dt
                className="w-40 flex-shrink-0 text-xs font-semibold pt-0.5"
                style={{ color: "var(--rtm-text-secondary)" }}
              >
                {label}
              </dt>
              <dd
                className="flex-1 text-sm"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </SectionWrapper>

      {/* ── Footer nav ── */}
      <div className="flex gap-2">
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
      </div>
    </div>
  );
}
