"use client";

import Link from "next/link";
import { StatusBadge, SectionWrapper } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";
import type { ClientHealthRow, ClientHealthStatus } from "@/lib/am-data";

interface Props {
  rows: ClientHealthRow[];
}

function healthVariant(s: ClientHealthStatus): StatusVariant {
  switch (s) {
    case "Healthy":          return "success";
    case "Needs Attention":  return "warning";
    case "At-Risk":          return "error";
    case "Critical":         return "error";
  }
}

function scoreColor(score: number) {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

export default function ClientHealthTable({ rows }: Props) {
  const critical    = rows.filter((r) => r.healthStatus === "Critical").length;
  const atRisk      = rows.filter((r) => r.healthStatus === "At-Risk").length;
  const healthy     = rows.filter((r) => r.healthStatus === "Healthy").length;
  const needsAttn   = rows.filter((r) => r.healthStatus === "Needs Attention").length;

  return (
    <SectionWrapper
      title="Client Portfolio"description="Full client health overview"actions={
        <div className="flex items-center gap-3 text-xs">
          <span style={{ color: "#10B981"}}>{healthy} healthy</span>
          {needsAttn > 0 && <span style={{ color: "#D97706"}}>{needsAttn} watch</span>}
          {(atRisk + critical) > 0 && (
            <span className="font-semibold"style={{ color: "#DC2626"}}>
              {atRisk + critical} at-risk / critical
            </span>
          )}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
              {["Client", "AM", "Industry", "Health", "Score", "MRR", "Renewal", "Deliverables", "Last Contact"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                style={{ borderBottom: "1px solid var(--rtm-border-light)"}}
              >
                <td className="px-3 py-3 whitespace-nowrap text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                  {row.name}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                  {row.assignedAM}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                  {row.industry}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <StatusBadge variant={healthVariant(row.healthStatus)} label={row.healthStatus} size="sm"/>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="text-sm font-bold"style={{ color: scoreColor(row.score) }}>
                    {row.score}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>
                  ${row.monthlyRevenue.toLocaleString()}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                  {row.renewalDate}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center">
                  <span
                    className="text-xs font-semibold"style={{ color: row.openDeliverables > 3 ? "#D97706": "var(--rtm-text-secondary)"}}
                  >
                    {row.openDeliverables}
                    {row.reportsOverdue > 0 && (
                      <span className="ml-1 text-[10px]"style={{ color: "#DC2626"}}>
                        ({row.reportsOverdue} overdue)
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                  {row.lastContact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Link
          href="/account-management/clients"className="rtm-btn-secondary inline-flex items-center gap-1.5 text-xs">
          View All Clients →
        </Link>
      </div>
    </SectionWrapper>
  );
}
