export type KpiTrend = "up" | "down" | "neutral";

export interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: KpiTrend;
  trendValue?: string;
  trendLabel?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  trendLabel = "vs last month",
  icon,
  accentColor = "bg-indigo-100 dark:bg-indigo-900/30",
}: KpiCardProps) {
  const trendColorClass =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
      : trend === "down"
        ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
        : "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800";

  const trendArrow =
    trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`w-11 h-11 rounded-xl ${accentColor} flex items-center justify-center flex-shrink-0`}
          >
            {icon}
          </div>
        )}
      </div>

      {trendValue && trend && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trendColorClass}`}
          >
            {trendArrow} {trendValue}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}
