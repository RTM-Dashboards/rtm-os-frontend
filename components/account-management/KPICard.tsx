interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    direction: "up"| "down"| "neutral";
    label: string;
  };
  variant?: "default"| "warning"| "danger"| "success"| "info";
}

const variantConfig = {
  default: {
    card: "",
    cardStyle: { background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"},
    iconStyle: { background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"},
    valueStyle: { color: "var(--rtm-text-primary)"},
  },
  warning: {
    card: "",
    cardStyle: { background: "#FFFBEB", borderColor: "#FDE68A"},
    iconStyle: { background: "#FEF3C7", color: "#B45309"},
    valueStyle: { color: "#B45309"},
  },
  danger: {
    card: "",
    cardStyle: { background: "#FEF2F2", borderColor: "#FECACA"},
    iconStyle: { background: "#FEE2E2", color: "#DC2626"},
    valueStyle: { color: "#DC2626"},
  },
  success: {
    card: "",
    cardStyle: { background: "#ECFDF5", borderColor: "#A7F3D0"},
    iconStyle: { background: "#D1FAE5", color: "#059669"},
    valueStyle: { color: "#059669"},
  },
  info: {
    card: "",
    cardStyle: { background: "var(--rtm-blue-xlight)", borderColor: "var(--rtm-blue-light)"},
    iconStyle: { background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"},
    valueStyle: { color: "var(--rtm-blue-dark)"},
  },
};

const trendColors: Record<"up"| "down"| "neutral", string> = {
  up:      "#059669",
  down:    "#DC2626",
  neutral: "var(--rtm-text-muted)",
};
const trendIcons = { up: "↑", down: "↓", neutral: "→"};

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
    <div
      className={`rounded-xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow ${config.card}`}
      style={{ ...config.cardStyle, boxShadow: "0 1px 3px rgba(15,28,56,0.05)"}}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"style={config.iconStyle}
        >
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-semibold"style={{ color: trendColors[trend.direction] }}>
            {trendIcons[trend.direction]} {trend.label}
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold"style={config.valueStyle}>{value}</div>
        <div className="text-sm font-medium mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>
          {title}
        </div>
        {subtitle && (
          <div className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
