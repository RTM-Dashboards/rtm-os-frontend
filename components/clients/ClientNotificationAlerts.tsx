"use client";

import Link from "next/link";
import { useMemo } from "react";
import { NOTIFICATIONS } from "@/lib/notifications";

interface Props {
  clientSlug: string;
  clientName: string;
}

const PRIORITY_CFG: Record<string, { bg: string; border: string; text: string; dot: string; badge: string }> = {
  Critical: { bg: "#FFF5F5", border: "#FECACA", text: "#B91C1C", dot: "#DC2626", badge: "#DC2626" },
  Urgent:   { bg: "#FFF7ED", border: "#FED7AA", text: "#C2410C", dot: "#F97316", badge: "#EA580C" },
  High:     { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", dot: "#F59E0B", badge: "#D97706" },
  Medium:   { bg: "#F0F9FF", border: "#BAE6FD", text: "#075985", dot: "#0EA5E9", badge: "#0284C7" },
  Low:      { bg: "#F0FDF4", border: "#BBF7D0", text: "#065F46", dot: "#22C55E", badge: "#16A34A" },
};

const TYPE_LABELS: Record<string, string> = {
  Billing:           "💳 Billing",
  Renewal:           "🔄 Renewal",
  Cancellation:      "❌ Cancellation",
  Offboarding:       "📤 Offboarding",
  Task:              "✅ Task",
  Workflow:          "⚡ Workflow",
  "Account Management": "👤 Account",
  Activation:        "🚀 Activation",
  Affiliate:         "🤝 Affiliate",
  System:            "⚙️ System",
};

export default function ClientNotificationAlerts({ clientSlug, clientName }: Props) {
  const alerts = useMemo(
    () =>
      NOTIFICATIONS.filter(
        (n) =>
          n.clientSlug === clientSlug &&
          (n.status === "Unread" || n.status === "Escalated")
      ).sort((a, b) => {
        const order = ["Critical", "Urgent", "High", "Medium", "Low"];
        return order.indexOf(a.priority) - order.indexOf(b.priority);
      }),
    [clientSlug]
  );

  if (alerts.length === 0) return null;

  const hasCritical = alerts.some((n) => n.priority === "Critical" || n.priority === "Urgent");

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: hasCritical ? "#FFFAFA" : "var(--rtm-surface)",
        borderColor: hasCritical ? "#FECACA" : "var(--rtm-border)",
        boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: hasCritical ? "#FFF0F0" : "var(--rtm-blue-xlight)",
          borderBottom: `1px solid ${hasCritical ? "#FECACA" : "var(--rtm-border-light)"}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{hasCritical ? "🔴" : "🔔"}</span>
          <div>
            <h3
              className="text-sm font-bold"
              style={{ color: hasCritical ? "#B91C1C" : "var(--rtm-text-primary)" }}
            >
              Client Alerts
            </h3>
            <p
              className="text-[11px]"
              style={{ color: hasCritical ? "#DC2626" : "var(--rtm-text-muted)" }}
            >
              {alerts.length} active alert{alerts.length !== 1 ? "s" : ""} for {clientName}
            </p>
          </div>
        </div>

        <Link
          href="/notifications"
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
          style={{
            background: hasCritical ? "#FFF0F0" : "var(--rtm-blue-light)",
            color: hasCritical ? "#B91C1C" : "var(--rtm-blue)",
            border: `1px solid ${hasCritical ? "#FECACA" : "var(--rtm-border)"}`,
          }}
        >
          View All
        </Link>
      </div>

      {/* Alert list */}
      <div className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
        {alerts.map((n) => {
          const cfg = PRIORITY_CFG[n.priority] ?? PRIORITY_CFG.Medium;
          return (
            <div
              key={n.id}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
            >
              {/* Priority dot */}
              <span
                className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cfg.dot }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-xs font-semibold leading-snug"
                    style={{ color: "var(--rtm-text-primary)" }}
                  >
                    {n.title}
                  </p>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
                  >
                    {n.priority}
                  </span>
                </div>

                <p
                  className="text-[11px] mt-0.5 line-clamp-2"
                  style={{ color: "var(--rtm-text-secondary)" }}
                >
                  {n.description}
                </p>

                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}
                  >
                    {TYPE_LABELS[n.type] ?? n.type}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {n.createdDate}
                  </span>
                  {n.status === "Escalated" && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: "#FEF2F2", color: "#B91C1C" }}
                    >
                      🔺 Escalated
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
