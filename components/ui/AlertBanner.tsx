export type AlertSeverity = "critical" | "warning" | "info" | "success";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  description?: string;
  action?: string;
}

// Inline SVG icons for severity — no emoji
const SeverityIcons: Record<AlertSeverity, React.ReactNode> = {
  critical: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  warning: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const severityMap: Record<AlertSeverity, {
  bg: string; border: string; titleColor: string; textColor: string; iconBg: string;
}> = {
  critical: { bg: "#FEF2F2", border: "#FECACA", titleColor: "#991B1B", textColor: "#DC2626", iconBg: "#FEE2E2" },
  warning:  { bg: "#FFFBEB", border: "#FDE68A", titleColor: "#92400E", textColor: "#B45309", iconBg: "#FEF3C7" },
  info:     { bg: "var(--rtm-blue-xlight)", border: "var(--rtm-blue-light)", titleColor: "var(--rtm-blue-dark)", textColor: "var(--rtm-blue)", iconBg: "var(--rtm-blue-light)" },
  success:  { bg: "#ECFDF5", border: "#A7F3D0", titleColor: "#065F46", textColor: "#059669", iconBg: "#D1FAE5" },
};

import React from "react";

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
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: s.iconBg, color: s.textColor }}
            >
              {SeverityIcons[alert.severity]}
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
