export type AlertSeverity = "critical" | "warning" | "info" | "success";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  description?: string;
  action?: string;
}

const severityMap: Record<AlertSeverity, {
  bg: string; border: string; titleColor: string; textColor: string;
  iconBg: string; icon: string;
}> = {
  critical: {
    bg: "#FEF2F2", border: "#FECACA", titleColor: "#991B1B", textColor: "#DC2626",
    iconBg: "#FEE2E2", icon: "⚠",
  },
  warning: {
    bg: "#FFFBEB", border: "#FDE68A", titleColor: "#92400E", textColor: "#B45309",
    iconBg: "#FEF3C7", icon: "!",
  },
  info: {
    bg: "var(--rtm-blue-xlight)", border: "var(--rtm-blue-light)", titleColor: "var(--rtm-blue-dark)", textColor: "var(--rtm-blue)",
    iconBg: "var(--rtm-blue-light)", icon: "i",
  },
  success: {
    bg: "#ECFDF5", border: "#A7F3D0", titleColor: "#065F46", textColor: "#059669",
    iconBg: "#D1FAE5", icon: "✓",
  },
};

interface AlertBannerProps {
  alerts: AlertItem[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  if (!alerts.length) return null;
  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const s = severityMap[alert.severity];
        return (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-3.5 rounded-xl border"
            style={{ background: s.bg, borderColor: s.border }}
          >
            {/* Icon circle */}
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
              style={{ background: s.iconBg, color: s.textColor }}
            >
              {s.icon}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: s.titleColor }}>
                {alert.title}
              </p>
              {alert.description && (
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: s.textColor, opacity: 0.85 }}>
                  {alert.description}
                </p>
              )}
            </div>

            {alert.action && (
              <button
                className="text-xs font-semibold flex-shrink-0 px-2.5 py-1 rounded-lg border transition-opacity hover:opacity-80"
                style={{ color: s.titleColor, borderColor: s.border, background: s.iconBg }}
              >
                {alert.action}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
