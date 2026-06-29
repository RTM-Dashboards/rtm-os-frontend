"use client";

import type { BlueprintSummary } from "@/lib/sales/blueprint-engine";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlueprintActivationBarProps {
  summary: BlueprintSummary;
  activated: boolean;
  assignedCount: number;
  totalCount: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlueprintActivationBar({
  summary,
  activated,
  assignedCount,
  totalCount,
}: BlueprintActivationBarProps) {
  const departmentCount = Object.keys(summary.departmentBreakdown).length;
  const assignmentProgress =
    totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0;

  const stats = [
    {
      label: "Total Tasks",
      value: summary.totalTasks,
      color: "#1D4ED8",
    },
    {
      label: "Critical Tasks",
      value: summary.criticalTasks,
      color: "#DC2626",
    },
    {
      label: "Recurring Tasks",
      value: summary.recurringTasks,
      color: "#B45309",
    },
    {
      label: "Est. Hours",
      value: `${summary.estimatedTotalHours}h`,
      color: "#059669",
    },
    {
      label: "Departments",
      value: departmentCount,
      color: "#7C3AED",
    },
  ];

  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{
        background: "var(--rtm-surface)",
        border: "1px solid var(--rtm-border)",
      }}
    >
      <div className="flex flex-wrap items-center gap-6">
        {/* Stat cells */}
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5 min-w-[80px]">
            <span
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {stat.label}
            </span>
            <span
              className="text-xl font-black"
              style={{ color: stat.color }}
            >
              {stat.value}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div
          className="hidden md:block self-stretch w-px"
          style={{ background: "var(--rtm-border)" }}
        />

        {/* Assignment progress */}
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Assignment Progress
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--rtm-text-secondary)" }}
            >
              {assignedCount} of {totalCount} assigned
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${assignmentProgress}%`,
                background: activated ? "#059669" : "#1D4ED8",
              }}
            />
          </div>
        </div>

        {/* Activated badge */}
        {activated && (
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{
              background: "#ECFDF5",
              color: "#059669",
              border: "1px solid #A7F3D0",
            }}
          >
            Blueprint Activated
          </div>
        )}
      </div>
    </div>
  );
}
