"use client";

// ── Department Integrations Panel ─────────────────────────────────────────────
// Pulls integration refs from DepartmentConfig.integrations (Integration Hub).
// No providers are hardcoded — all data comes from the department configuration.

import { SectionWrapper, StatusBadge } from "@/components/ui";
import type { DepartmentIntegrationRef, IntegrationRole } from "@/types/department";

interface Props {
  integrations: DepartmentIntegrationRef[];
  accentColor: string;
}

const ROLE_STYLE: Record<IntegrationRole, { bg: string; color: string; label: string }> = {
  "primary":        { bg: "#F5F3FF", color: "#7C3AED", label: "Primary System"   },
  "required":       { bg: "#EFF6FF", color: "#1D4ED8", label: "Required"         },
  "optional":       { bg: "#F8FAFC", color: "#64748B", label: "Optional"         },
  "reporting-only": { bg: "#FFFBEB", color: "#B45309", label: "Reporting Only"   },
};

const ROLE_ORDER: IntegrationRole[] = ["primary", "required", "optional", "reporting-only"];

export default function DepartmentIntegrationsPanel({ integrations, accentColor }: Props) {
  const sorted = [...integrations].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
  );

  return (
    <SectionWrapper
      title="Integrations"
      description="Connected data sources and tools via Integration Hub"
      actions={
        <a
          href="/settings/integrations"
          className="text-xs font-medium hover:underline"
          style={{ color: accentColor }}
        >
          Manage in Integration Hub
        </a>
      }
    >
      {sorted.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
          No integrations assigned. Configure integrations in Settings &rarr; Departments.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((int) => {
            const rs = ROLE_STYLE[int.role];
            return (
              <div
                key={int.integrationId}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>
                    {int.displayName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    {int.category}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap flex-shrink-0"
                  style={{ background: rs.bg, color: rs.color }}
                >
                  {rs.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Data Sources / Workflow Connections summary */}
      {sorted.length > 0 && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--rtm-border-light)" }}>
          <div className="grid grid-cols-3 gap-3 text-center">
            {(
              [
                { label: "Connected Integrations", value: sorted.length },
                { label: "Data Sources",            value: sorted.filter((i) => i.role !== "optional").length },
                { label: "Workflow Connections",    value: sorted.filter((i) => i.role === "primary" || i.role === "required").length },
              ] as { label: string; value: number }[]
            ).map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg p-3 border"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
              >
                <p className="text-xl font-bold" style={{ color: accentColor }}>
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
