interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
  variant?: "default" | "warning" | "danger" | "success" | "info";
}

const variantConfig = {
  default: {
    card: "bg-white border-slate-200",
    icon: "bg-slate-100 text-slate-600",
    value: "text-slate-900",
  },
  warning: {
    card: "bg-amber-50 border-amber-200",
    icon: "bg-amber-100 text-amber-700",
    value: "text-amber-700",
  },
  danger: {
    card: "bg-red-50 border-red-200",
    icon: "bg-red-100 text-red-700",
    value: "text-red-700",
  },
  success: {
    card: "bg-emerald-50 border-emerald-200",
    icon: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-700",
  },
  info: {
    card: "bg-blue-50 border-blue-200",
    icon: "bg-blue-100 text-blue-700",
    value: "text-blue-700",
  },
};

const trendColors = {
  up: "text-emerald-600",
  down: "text-red-600",
  neutral: "text-slate-500",
};

const trendIcons = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
}: KPICardProps) {
  const config = variantConfig[variant];

  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-3 ${config.card}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.icon}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendColors[trend.direction]}`}>
            {trendIcons[trend.direction]} {trend.label}
          </span>
        )}
      </div>
      <div>
        <div className={`text-3xl font-bold ${config.value}`}>{value}</div>
        <div className="text-sm font-medium text-slate-600 mt-0.5">{title}</div>
        {subtitle && (
          <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
