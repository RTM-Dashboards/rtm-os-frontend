"use client";

import { StatusBadge } from "@/components/ui";
import type { TeamMemberRow } from "@/lib/workspace-people";

interface Props {
  members: TeamMemberRow[];
  accentColor: string;
}

const COLUMNS = ["User", "Email", "Role", "Access Level", "Status", "Assigned Clients", "Last Active"];

export default function TeamMembersTable({ members, accentColor }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)"}}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((member, idx) => (
            <tr
              key={member.email}
              style={{
                borderBottom:
                  idx < members.length - 1
                    ? "1px solid var(--rtm-border-light)": undefined,
                background: idx % 2 === 0 ? "var(--rtm-surface)": "var(--rtm-bg)",
              }}
            >
              {/* User */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"style={{
                      background: `${accentColor}18`,
                      color: accentColor,
                    }}
                  >
                    {member.initials}
                  </div>
                  <span className="font-medium whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>
                    {member.user}
                  </span>
                </div>
              </td>

              {/* Email */}
              <td className="px-4 py-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                {member.email}
              </td>

              {/* Role */}
              <td className="px-4 py-3 whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>
                {member.role}
              </td>

              {/* Access Level */}
              <td className="px-4 py-3">
                <StatusBadge variant={member.accessVariant} label={member.accessLevel} size="sm"/>
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <StatusBadge variant={member.statusVariant} label={member.status} size="sm"/>
              </td>

              {/* Assigned Clients */}
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1 max-w-[220px]">
                  {member.assignedClients.map((c) => (
                    <span
                      key={c}
                      className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border"style={{
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
              <td className="px-4 py-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                {member.lastActive}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
