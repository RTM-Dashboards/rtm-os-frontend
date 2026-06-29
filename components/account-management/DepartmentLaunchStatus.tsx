"use client";

import { StatusBadge, SectionWrapper } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";
import type { DeptLaunchRow, DeptStatus } from "@/lib/account-management/dashboard-data";

interface Props {
  rows: DeptLaunchRow[];
}

function deptStatusVariant(s: DeptStatus): StatusVariant {
  switch (s) {
    case "Done":        return "success";
    case "In Progress": return "info";
    case "Not Started": return "neutral";
    case "Blocked":     return "error";
  }
}

const DEPT_COLORS: Record<string, string> = {
  SEO:          "#1B4FD8",
  GBP:          "#059669",
  "Meta Ads":   "#7C3AED",
  PPC:          "#D97706",
  LSA:          "#0891B2",
  Design:       "#EC4899",
  Content:      "#F59E0B",
  Reviews:      "#10B981",
  Reporting:    "#64748B",
};

function deptColor(dept: string) {
  return DEPT_COLORS[dept] ?? "#94A3B8";
}

export default function DepartmentLaunchStatus({ rows }: Props) {
  // group by clientName
  const grouped = rows.reduce<Record<string, DeptLaunchRow[]>>((acc, row) => {
    (acc[row.clientName] ??= []).push(row);
    return acc;
  }, {});

  return (
    <SectionWrapper
      title="Department Launch Assignment Status"description="Per-client dept task tracking for all onboarding accounts">
      <div className="space-y-5">
        {Object.entries(grouped).map(([clientName, deptRows]) => {
          const doneCount = deptRows.filter((r) => r.status === "Done").length;
          const blockedCount = deptRows.filter((r) => r.status === "Blocked").length;
          return (
            <div key={clientName}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                  {clientName}
                </p>
                <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                  {doneCount}/{deptRows.length} done
                  {blockedCount > 0 && (
                    <span className="ml-2 font-semibold"style={{ color: "#DC2626"}}>
                      · {blockedCount} blocked
                    </span>
                  )}
                </span>
              </div>
              <div className="space-y-2">
                {deptRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border p-3"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}
                  >
                    <span
                      className="mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"style={{
                        background: deptColor(row.department) + "18",
                        color: deptColor(row.department),
                      }}
                    >
                      {row.department}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>
                        {row.taskName}
                      </p>
                      <p className="text-[11px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                        {row.assignedTo} · Due {row.dueDate}
                      </p>
                      {row.notes && (
                        <p className="text-[11px] mt-1 italic"style={{ color: "#D97706"}}>
                          {row.notes}
                        </p>
                      )}
                    </div>
                    <StatusBadge variant={deptStatusVariant(row.status)} label={row.status} size="sm"/>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
