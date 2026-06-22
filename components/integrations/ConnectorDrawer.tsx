"use client";

import type { Integration } from "@/lib/integrations/types";
import IntegrationStatusBadge from "./IntegrationStatusBadge";

interface Props {
  integration: Integration | null;
  onClose: () => void;
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

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default function ConnectorDrawer({ integration, onClose }: Props) {
  if (!integration) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] flex flex-col shadow-2xl overflow-y-auto"
        style={{ background: "var(--rtm-surface)", borderLeft: "1px solid var(--rtm-border)" }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--rtm-border)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <IntegrationStatusBadge status={integration.status} />
              {!integration.enabled && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                  Disabled
                </span>
              )}
            </div>
            <h2
              className="text-lg font-bold truncate"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {integration.name}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {integration.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg transition-colors flex-shrink-0"
            style={{ color: "var(--rtm-text-muted)" }}
            aria-label="Close drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-6">
          {/* Config Details */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
              Connector Configuration
            </p>
            <div className="space-y-2">
              {[
                { label: "Connector Name",    value: integration.name },
                { label: "Category",          value: integration.category },
                { label: "Auth Type",         value: integration.authType },
                { label: "API Endpoint",      value: integration.apiEndpoint },
                { label: "Owner",             value: integration.owner },
                { label: "Built-in",          value: integration.isBuiltIn ? "Yes" : "Custom (Admin-configured)" },
                { label: "Enabled",           value: integration.enabled ? "Yes" : "No" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg"
                  style={{ background: "var(--rtm-surface-raised, #F8FAFC)", border: "1px solid var(--rtm-border-light)" }}
                >
                  <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>
                    {label}
                  </span>
                  <span
                    className="text-xs font-semibold text-right break-all max-w-[280px]"
                    style={{ color: "var(--rtm-text-primary)" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Health */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
              Integration Health
            </p>
            <div
              className="rounded-xl border p-4"
              style={{
                background: HEALTH_BG[integration.healthScore],
                borderColor: "var(--rtm-border)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-sm font-bold capitalize"
                  style={{ color: HEALTH_COLOR[integration.healthScore] }}
                >
                  {integration.healthScore} — {integration.healthPercent}%
                </span>
                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  Last Sync: {formatDate(integration.lastSync)}
                </span>
              </div>
              <div className="w-full rounded-full h-2 bg-white/60 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${integration.healthPercent}%`,
                    background: HEALTH_COLOR[integration.healthScore],
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Error Count",      value: integration.errorCount },
                  { label: "Failed Requests",  value: integration.failedRequests },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-2 rounded-lg bg-white/60">
                    <p className="text-lg font-bold" style={{ color: HEALTH_COLOR[integration.healthScore] }}>
                      {value}
                    </p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Objects */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
              Data Source Mapping
            </p>
            <div className="flex flex-wrap gap-2">
              {integration.dataObjects.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No data objects mapped.</p>
              ) : (
                integration.dataObjects.map((obj) => (
                  <span
                    key={obj}
                    className="text-xs font-medium px-3 py-1 rounded-full border"
                    style={{
                      background: "var(--rtm-blue-xlight)",
                      color: "var(--rtm-blue)",
                      borderColor: "var(--rtm-blue-light)",
                    }}
                  >
                    {obj}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Departments */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
              Departments Using
            </p>
            {integration.departmentsUsing.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No departments assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {integration.departmentsUsing.map((dept) => (
                  <span
                    key={dept}
                    className="text-xs font-medium px-3 py-1 rounded-full border"
                    style={{ background: "var(--rtm-surface-raised, #F8FAFC)", color: "var(--rtm-text-secondary, #475569)", borderColor: "var(--rtm-border)" }}
                  >
                    {dept}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Clients */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
              Clients Using
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
              {integration.clientsUsing.length} {integration.clientsUsing.length === 1 ? "client" : "clients"} assigned
            </p>
          </div>

          {/* Webhook URL */}
          {integration.webhookUrl && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
                Webhook URL
              </p>
              <div
                className="p-3 rounded-lg font-mono text-xs break-all"
                style={{ background: "var(--rtm-surface-raised, #F8FAFC)", color: "var(--rtm-text-primary)", border: "1px solid var(--rtm-border)" }}
              >
                {integration.webhookUrl}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          className="px-6 py-4 flex gap-3 flex-shrink-0"
          style={{ borderTop: "1px solid var(--rtm-border)" }}
        >
          <button
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: "var(--rtm-blue)" }}
          >
            Save Configuration
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
            style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
}
