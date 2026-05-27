export type KpiTrend = "up" | "down" | "neutral";

export interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: KpiTrend;
  trendValue?: string;
  trendLabel?: string;
  icon?: React.ReactNode;
  /** CSS class or inline style is passed via iconBg / iconColor */
  accentColor?: string;
  iconBg?: string;
  iconColor?: string;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  trendLabel = "vs last month",
  icon,
  iconBg = "var(--rtm-blue-light)",
  iconColor,
}: KpiCardProps) {
  const trendStyle =
    trend === "up"
      ? { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" }
      : trend === "down"
        ? { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" }
        : { bg: "#F4F7FF", color: "var(--rtm-text-secondary)", border: "var(--rtm-border)" };

  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-xl border transition-shadow duration-200 hover:shadow-md"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
      }}
    >
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
            style={{ background: iconBg ?? "var(--rtm-blue-light)", color: iconColor ?? "var(--rtm-blue)" }}
          >
            {icon}
          </div>
        )}
      </div>

      {trendValue && trend && (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border"
            style={{ background: trendStyle.bg, color: trendStyle.color, borderColor: trendStyle.border }}
          >
            {trendArrow} {trendValue}
          </span>
          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}
