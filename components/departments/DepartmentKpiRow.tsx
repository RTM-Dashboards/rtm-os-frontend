"use client";

// ── Department KPI Row ────────────────────────────────────────────────────────
// Renders the KPI cards for a department. Data comes from DepartmentConfig.kpis
// (Settings → Departments). No hardcoded metrics.

import KpiCard from "@/components/ui/KpiCard";
import type { DepartmentKpiDef } from "@/types/department";

interface Props {
  kpis: DepartmentKpiDef[];
  accentColor: string;
}

const METRIC_ICON_MAP: Record<string, React.ReactNode> = {
  percentage: (
    <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  ),
  currency: (
    <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  count: (
    <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
    </svg>
  ),
  number: (
    <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
    </svg>
  ),
  duration: (
    <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
};

function trendForKpi(kpi: DepartmentKpiDef): "up"| "down"| "neutral"{
  if (kpi.trendDirection === "neutral") return "neutral";
  // Up-good KPIs display an "up" trend arrow; down-good show "down"
  return kpi.trendDirection === "up-good" ? "up" : "down";
}

export default function DepartmentKpiRow({ kpis, accentColor }: Props) {
  const visible = kpis.filter((k) => k.dashboardVisible);

  if (visible.length === 0) {
    return (
      <div
        className="rounded-xl border p-6 text-center text-sm"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)", background: "var(--rtm-surface)"}}
      >
        No KPIs configured. Configure KPIs in Settings &rarr; Departments.
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${visible.length <= 2 ? "grid-cols-2": visible.length === 3 ? "grid-cols-3": "grid-cols-2 xl:grid-cols-4"}`}>
      {visible.map((kpi) => (
        <KpiCard
          key={kpi.id}
          title={kpi.name}
          value={kpi.target}
          subtitle={`Source: ${kpi.dataSource}`}
          trend={trendForKpi(kpi)}
          trendLabel={kpi.reportingFrequency}
          iconBg={`${accentColor}18`}
          iconColor={accentColor}
          icon={METRIC_ICON_MAP[kpi.metricType] ?? METRIC_ICON_MAP.number}
        />
      ))}
    </div>
  );
}
