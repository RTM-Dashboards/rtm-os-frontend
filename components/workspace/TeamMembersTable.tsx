"use client";

import { StatusBadge } from "@/components/ui";
import type { UserRecord } from "@/lib/users/users-api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatLastActive(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Never";
  return d.toLocaleDateString("en-US", {
    year:  "numeric",
    month: "short",
    day:   "numeric",
  });
}

function roleLabel(role: string | null): string {
  return role ?? "No role assigned";
}

function statusVariant(
  status: string,
): "success" | "warning" | "neutral" {
  if (status === "active")   return "success";
  if (status === "pending")  return "warning";
  return "neutral";
}

// ── Column definitions ────────────────────────────────────────────────────────
// Access Level removed (duplicated Role, enforced nothing).
// Assigned Clients removed (no User→Client relation in schema).

const COLUMNS = ["User", "Email", "Role", "Status", "Last Active"];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  members:     UserRecord[];
  accentColor: string;
}

export default function TeamMembersTable({ members, accentColor }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
            {COLUMNS.map((col) => (
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
          {members.map((member, idx) => (
            <tr
              key={member.id}
              style={{
                borderBottom:
                  idx < members.length - 1
                    ? "1px solid var(--rtm-border-light)"
                    : undefined,
                background: idx % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-bg)",
              }}
            >
              {/* User */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: `${accentColor}18`,
                      color:      accentColor,
                    }}
                  >
                    {initials(member.name)}
                  </div>
                  <span
                    className="font-medium whitespace-nowrap"
                    style={{ color: "var(--rtm-text-primary)" }}
                  >
                    {member.name}
                  </span>
                </div>
              </td>

              {/* Email */}
              <td
                className="px-4 py-3 whitespace-nowrap text-xs"
                style={{ color: "var(--rtm-text-secondary)" }}
              >
                {member.email}
              </td>

              {/* Role */}
              <td
                className="px-4 py-3 whitespace-nowrap"
                style={{
                  color: member.role
                    ? "var(--rtm-text-primary)"
                    : "var(--rtm-text-muted)",
                  fontStyle: member.role ? "normal" : "italic",
                }}
              >
                {roleLabel(member.role)}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <StatusBadge
                  variant={statusVariant(member.status)}
                  label={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  size="sm"
                />
              </td>

              {/* Last Active */}
              <td
                className="px-4 py-3 whitespace-nowrap text-xs"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {formatLastActive(member.lastLoginAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
