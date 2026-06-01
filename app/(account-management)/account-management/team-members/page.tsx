"use client";

import { SectionWrapper, StatusBadge } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("account-management")!;

interface TeamMemberRow {
  user: string;
  initials: string;
  email: string;
  role: string;
  accessLevel: string;
  accessVariant: StatusVariant;
  status: string;
  statusVariant: StatusVariant;
  assignedClients: string[];
  lastActive: string;
}

const teamMembers: TeamMemberRow[] = [
  {
    user: "Jordan Mitchell",
    initials: "JM",
    email: "jordan.mitchell@rtm.agency",
    role: "Senior Account Manager",
    accessLevel: "Manager",
    accessVariant: "info",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Apex Roofing", "Pacific Dental", "Summit Landscaping"],
    lastActive: "Today, 9:14 AM",
  },
  {
    user: "Sarah Kowalski",
    initials: "SK",
    email: "sarah.kowalski@rtm.agency",
    role: "Account Manager",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Sunbelt HVAC", "Metro Dental"],
    lastActive: "Today, 8:52 AM",
  },
  {
    user: "Mike Torres",
    initials: "MT",
    email: "mike.torres@rtm.agency",
    role: "Account Manager",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Harbor Auto Group"],
    lastActive: "Yesterday, 4:30 PM",
  },
  {
    user: "Alex Rivera",
    initials: "AR",
    email: "alex.rivera@rtm.agency",
    role: "Junior Account Manager",
    accessLevel: "Specialist",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["Blue Ridge Plumbing", "Green Valley Pools"],
    lastActive: "Today, 7:45 AM",
  },
  {
    user: "Dana Pham",
    initials: "DP",
    email: "dana.pham@rtm.agency",
    role: "Department Head",
    accessLevel: "Department Head",
    accessVariant: "error",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (All)"],
    lastActive: "Today, 9:02 AM",
  },
  {
    user: "Chris Nguyen",
    initials: "CN",
    email: "chris.nguyen@rtm.agency",
    role: "AM Coordinator",
    accessLevel: "Coordinator",
    accessVariant: "pending",
    status: "On Leave",
    statusVariant: "warning",
    assignedClients: ["Summit Landscaping"],
    lastActive: "3 days ago",
  },
  {
    user: "Priya Sharma",
    initials: "PS",
    email: "priya.sharma@rtm.agency",
    role: "Reporting Specialist",
    accessLevel: "Viewer",
    accessVariant: "neutral",
    status: "Active",
    statusVariant: "success",
    assignedClients: ["— (Read-only)"],
    lastActive: "Today, 6:58 AM",
  },
];

const columns = [
  "User",
  "Email",
  "Role",
  "Access Level",
  "Status",
  "Assigned Clients",
  "Last Active",
];

export default function TeamMembersPage() {
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
          Account Management Team Members
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          {teamMembers.length} team members · roles, access levels, and client assignments.
        </p>
      </div>

      {/* ── Summary chips ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Members",  value: teamMembers.length,                                  bg: "var(--rtm-blue-xlight)",  color: "var(--rtm-blue)" },
          { label: "Active",         value: teamMembers.filter((m) => m.status === "Active").length,  bg: "#ECFDF5", color: "#059669" },
          { label: "On Leave",       value: teamMembers.filter((m) => m.status === "On Leave").length, bg: "#FFFBEB", color: "#B45309" },
        ].map(({ label, value, bg, color }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-lg px-4 py-2 border text-sm font-semibold"
            style={{ background: bg, color, borderColor: "transparent" }}
          >
            <span className="text-lg font-bold">{value}</span>
            <span className="font-medium opacity-80">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <SectionWrapper
        title="Team Members"
        description="All account management staff"
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap"
                    style={{ color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, idx) => (
                <tr
                  key={member.email}
                  style={{
                    borderBottom:
                      idx < teamMembers.length - 1
                        ? "1px solid var(--rtm-border-light)"
                        : undefined,
                  }}
                >
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: "var(--rtm-blue-light)",
                          color: "var(--rtm-blue)",
                        }}
                      >
                        {member.initials}
                      </div>
                      <span
                        className="font-medium"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {member.user}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td
                    className="px-4 py-3 whitespace-nowrap"
                    style={{ color: "var(--rtm-text-secondary)" }}
                  >
                    {member.email}
                  </td>

                  {/* Role */}
                  <td
                    className="px-4 py-3 whitespace-nowrap"
                    style={{ color: "var(--rtm-text-primary)" }}
                  >
                    {member.role}
                  </td>

                  {/* Access Level */}
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={member.accessVariant}
                      label={member.accessLevel}
                      size="sm"
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={member.statusVariant}
                      label={member.status}
                      size="sm"
                    />
                  </td>

                  {/* Assigned Clients */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {member.assignedClients.map((c) => (
                        <span
                          key={c}
                          className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border"
                          style={{
                            background: "var(--rtm-bg)",
                            borderColor: "var(--rtm-border)",
                            color: "var(--rtm-text-secondary)",
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Last Active */}
                  <td
                    className="px-4 py-3 whitespace-nowrap text-xs"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {member.lastActive}
                  </td>
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
          className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-secondary)",
          }}
        >
          ← Dashboard
        </Link>
        <Link
          href="/account-management/roles"
          className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: "var(--rtm-blue)",
            borderColor: "var(--rtm-blue)",
            color: "#fff",
          }}
        >
          Roles & Permissions →
        </Link>
      </div>
    </div>
  );
}
