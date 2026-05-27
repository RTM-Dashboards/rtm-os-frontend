"use client";

import { StatusBadge, SectionWrapper } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";
import type { ServiceStatusRow, ServiceStatusLevel } from "@/lib/am-data";

interface Props {
  rows: ServiceStatusRow[];
}

function svcVariant(s: ServiceStatusLevel): StatusVariant {
  switch (s) {
    case "Operational": return "success";
    case "Degraded":    return "warning";
    case "Paused":      return "error";
    case "Launching":   return "info";
    case "Offline":     return "neutral";
  }
}

const SERVICE_COLORS: Record<string, string> = {
  SEO:       "#1B4FD8",
  "Meta Ads":"#7C3AED",
  PPC:       "#D97706",
  GBP:       "#059669",
  LSA:       "#0891B2",
  Reviews:   "#10B981",
  Design:    "#EC4899",
  Content:   "#F59E0B",
};

export default function ServiceStatusTable({ rows }: Props) {
  const issues = rows.filter((r) => r.status !== "Operational" && r.status !== "Launching");
  return (
    <SectionWrapper
      title="Active Service Status"
      description="Real-time campaign and service delivery status per client"
      actions={
        issues.length > 0 ? (
          <span className="text-xs font-semibold" style={{ color: "#DC2626" }}>
            {issues.length} issues
          </span>
        ) : (
          <span className="text-xs font-semibold" style={{ color: "#059669" }}>All clear</span>
        )
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
              {["Client", "Service", "Status", "Assigned To", "Updated", "Note"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
              >
                <td className="px-3 py-3 whitespace-nowrap text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                  {row.clientName}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded"
                    style={{
                      background: (SERVICE_COLORS[row.service] ?? "#94A3B8") + "18",
                      color: SERVICE_COLORS[row.service] ?? "#94A3B8",
                    }}
                  >
                    {row.service}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <StatusBadge variant={svcVariant(row.status)} label={row.status} size="sm" />
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  {row.assignedTo}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  {row.lastUpdated}
                </td>
                <td className="px-3 py-3 text-xs italic" style={{ color: row.note ? "#D97706" : "var(--rtm-text-muted)" }}>
                  {row.note ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
