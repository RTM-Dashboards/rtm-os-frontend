"use client";

import { StatusBadge, SectionWrapper } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";
import type { RenewalItem, ClientHealthStatus } from "@/lib/am-data";

interface Props {
  renewals: RenewalItem[];
}

function healthVariant(s: ClientHealthStatus): StatusVariant {
  switch (s) {
    case "Healthy":          return "success";
    case "Needs Attention":  return "warning";
    case "At-Risk":          return "error";
    case "Critical":         return "error";
  }
}

type RenewalRisk = RenewalItem["renewalRisk"];

function riskStyle(risk: RenewalRisk): { bg: string; color: string; border: string; label: string } {
  switch (risk) {
    case "Critical": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", label: "Critical Risk" };
    case "High":     return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", label: "High Risk"     };
    case "Medium":   return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "Medium Risk"   };
    case "Low":      return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "Low Risk"      };
  }
}

export default function RenewalReportPanel({ renewals }: Props) {
  const criticalCount = renewals.filter((r) => r.renewalRisk === "Critical").length;
  const highCount     = renewals.filter((r) => r.renewalRisk === "High").length;
  const totalMrr      = renewals.reduce((sum, r) => sum + r.monthlyRevenue, 0);

  return (
    <SectionWrapper
      title="Renewal Pipeline"
      description="Upcoming contract renewals requiring proactive AM action"
      actions={
        <div className="flex items-center gap-3 text-xs">
          {criticalCount > 0 && (
            <span className="font-semibold" style={{ color: "#DC2626" }}>
              {criticalCount} critical
            </span>
          )}
          {highCount > 0 && (
            <span className="font-semibold" style={{ color: "#D97706" }}>
              {highCount} high risk
            </span>
          )}
          <span style={{ color: "var(--rtm-text-muted)" }}>
            ${totalMrr.toLocaleString()}/mo at stake
          </span>
        </div>
      }
    >
      <div className="space-y-3">
        {renewals.map((r, idx) => {
          const risk = riskStyle(r.renewalRisk);
          return (
            <div
              key={idx}
              className="rounded-xl border p-4"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {r.clientName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    AM: {r.assignedAM} · Renewal: {r.renewalDate} · ${r.monthlyRevenue.toLocaleString()}/mo
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                    style={{ background: risk.bg, color: risk.color, borderColor: risk.border }}
                  >
                    {risk.label}
                  </span>
                  <StatusBadge variant={healthVariant(r.healthStatus)} label={r.healthStatus} size="sm" />
                </div>
              </div>
              <p className="text-xs rounded-lg px-3 py-2" style={{ background: risk.bg + "80", color: risk.color }}>
                🎯 {r.actionNeeded}
              </p>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
