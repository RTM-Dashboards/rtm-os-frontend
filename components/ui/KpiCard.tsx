// RTM OS — Standard KPI Card
// Consistent sizing, spacing, typography, trend/growth/risk indicators.

import React from "react";

export type KpiTrend = "up" | "down" | "neutral";
export type KpiRisk = "healthy" | "at-risk" | "critical";

export interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: KpiTrend;
  trendValue?: string;
  trendLabel?: string;
  /** Risk indicator shown instead of trend when present */
  risk?: KpiRisk;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  /** @deprecated Use iconBg/iconColor instead. Kept for page compat. */
  accentColor?: string;
  /** Optional click handler */
  onClick?: () => void;
}

const trendStyles: Record<KpiTrend, { bg: string; color: string; border: string; arrow: string }> = {
  up:      { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", arrow: "+" },
  down:    { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", arrow: "-" },
  neutral: { bg: "#F4F7FF", color: "#64748B",  border: "#E2E8F0", arrow: "~" },
};

const riskStyles: Record<KpiRisk, { bg: string; color: string; border: string; label: string; dot: string }> = {
  healthy:  { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "Healthy",  dot: "#10B981" },
  "at-risk":{ bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "At Risk",  dot: "#F59E0B" },
  critical: { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA", label: "Critical", dot: "#DC2626" },
};

// Upward trend arrow SVG
const TrendArrowUp = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
  </svg>
);
const TrendArrowDown = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
  </svg>
);
const TrendArrowNeutral = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
  </svg>
);

function TrendArrow({ trend }: { trend: KpiTrend }) {
  if (trend === "up") return <TrendArrowUp />;
  if (trend === "down") return <TrendArrowDown />;
  return <TrendArrowNeutral />;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  trendLabel = "vs last month",
  risk,
  icon,
  iconBg = "var(--rtm-blue-light)",
  iconColor = "var(--rtm-blue)",
  onClick,
}: KpiCardProps) {
  const ts = trend ? trendStyles[trend] : null;
  const rs = risk ? riskStyles[risk] : null;

  return (
    <div
      className={`flex flex-col gap-4 p-5 rounded-xl border transition-shadow duration-200 hover:shadow-md ${onClick ? "cursor-pointer" : ""}`}
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-xs font-semibold uppercase tracking-wide truncate"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {title}
          </p>
          <p
            className="mt-1.5 text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: iconBg, color: iconColor }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Trend / Risk indicator */}
      {(trendValue && ts) || rs ? (
        <div className="flex items-center gap-2">
          {/* Risk indicator takes precedence */}
          {rs ? (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border"
              style={{ background: rs.bg, color: rs.color, borderColor: rs.border }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: rs.dot }} />
              {rs.label}
            </span>
          ) : ts && trendValue ? (
            <>
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border"
                style={{ background: ts.bg, color: ts.color, borderColor: ts.border }}
              >
                <TrendArrow trend={trend!} />
                {trendValue}
              </span>
              <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                {trendLabel}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
