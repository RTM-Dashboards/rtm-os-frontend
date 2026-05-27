export type AlertSeverity = "critical" | "warning" | "info" | "success";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  description?: string;
  action?: string;
}

const severityStyles: Record<AlertSeverity, { bg: string; border: string; text: string; icon: string }> = {
  critical: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", text: "text-red-800 dark:text-red-300", icon: "🔴" },
  warning: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-800 dark:text-amber-300", icon: "🟡" },
  info: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-800 dark:text-blue-300", icon: "🔵" },
  success: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-800 dark:text-emerald-300", icon: "🟢" },
};

interface AlertBannerProps {
  alerts: AlertItem[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  if (!alerts.length) return null;
  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const s = severityStyles[alert.severity];
        return (
          <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${s.bg} ${s.border}`}>
            <span className="text-base flex-shrink-0 mt-0.5">{s.icon}</span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${s.text}`}>{alert.title}</p>
              {alert.description && (
                <p className={`text-xs mt-0.5 opacity-80 ${s.text}`}>{alert.description}</p>
              )}
            </div>
            {alert.action && (
              <button className={`text-xs font-medium flex-shrink-0 underline underline-offset-2 ${s.text}`}>
                {alert.action}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
