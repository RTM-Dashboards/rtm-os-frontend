"use client";

import type { Integration } from "@/lib/integrations/types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import IntegrationStatusBadge from "./IntegrationStatusBadge";

interface Props {
  integrations: Integration[];
}

const HEALTH_COLOR: Record<string, string> = {
  excellent: "#059669",
  good:      "#0369A1",
  fair:      "#B45309",
  poor:      "#DC2626",
};

const HEALTH_BG: Record<string, string> = {
  excellent: "#ECFDF5",
  good:      "#EFF6FF",
  fair:      "#FFFBEB",
  poor:      "#FEF2F2",
};

const HEALTH_BORDER: Record<string, string> = {
  excellent: "#A7F3D0",
  good:      "#BFDBFE",
  fair:      "#FDE68A",
  poor:      "#FECACA",
};

function formatDate(iso: string | null): string {
  if (!iso) return "Never synced";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function IntegrationHealthPanel({ integrations }: Props) {
  const sorted = [...integrations].sort((a, b) => a.healthPercent - b.healthPercent);
  const withIssues = sorted.filter((i) => i.healthPercent < 90 || i.status === "error" || i.errorCount > 0);
  const healthy    = sorted.filter((i) => i.healthPercent >= 90 && i.status !== "error" && i.errorCount === 0);

  return (
    <SectionWrapper
      title="Integration Health Monitor"
      description="Real-time health scores across all configured connectors"
    >
      {/* Issues first */}
      {withIssues.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#DC2626" }}>
            Requires Attention ({withIssues.length})
          </p>
          <div className="space-y-2">
            {withIssues.map((integration) => (
              <HealthRow key={integration.id} integration={integration} />
            ))}
          </div>
        </div>
      )}

      {/* Healthy */}
      {healthy.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#059669" }}>
            Healthy ({healthy.length})
          </p>
          <div className="space-y-2">
            {healthy.map((integration) => (
              <HealthRow key={integration.id} integration={integration} />
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}

function HealthRow({ integration }: { integration: Integration }) {
  return (
    <div
      className="flex items-center gap-4 p-3 rounded-xl border"
      style={{
        background: HEALTH_BG[integration.healthScore],
        borderColor: HEALTH_BORDER[integration.healthScore],
      }}
    >
      {/* Name + Category */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>
            {integration.name}
          </p>
          <IntegrationStatusBadge status={integration.status} size="sm" />
        </div>
        <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
          {integration.category} · Last sync: {formatDate(integration.lastSync)}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-32 hidden sm:block flex-shrink-0">
        <div className="w-full rounded-full h-1.5 bg-white/60 overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${integration.healthPercent}%`,
              background: HEALTH_COLOR[integration.healthScore],
            }}
          />
        </div>
        <div className="flex justify-between text-[10px]" style={{ color: HEALTH_COLOR[integration.healthScore] }}>
          <span className="capitalize font-semibold">{integration.healthScore}</span>
          <span>{integration.healthPercent}%</span>
        </div>
      </div>

      {/* Errors */}
      <div className="text-right flex-shrink-0">
        {integration.errorCount > 0 ? (
          <p className="text-sm font-bold" style={{ color: "#DC2626" }}>
            {integration.errorCount} err
          </p>
        ) : (
          <p className="text-sm font-bold" style={{ color: "#059669" }}>0 err</p>
        )}
        <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
          {integration.failedRequests} fail
        </p>
      </div>
    </div>
  );
}
