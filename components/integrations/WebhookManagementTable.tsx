"use client";

import type { WebhookEntry } from "@/lib/integrations/types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import StatusBadge from "@/components/ui/StatusBadge";
import type { StatusVariant } from "@/components/ui/StatusBadge";

interface Props {
  webhooks: WebhookEntry[];
}

const STATUS_MAP: Record<WebhookEntry["status"], { variant: StatusVariant; label: string }> = {
  active:   { variant: "success", label: "Active" },
  inactive: { variant: "neutral", label: "Inactive" },
  error:    { variant: "error",   label: "Error" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function WebhookManagementTable({ webhooks }: Props) {
  return (
    <SectionWrapper
      title="Webhook Management"
      description="Inbound and outbound webhooks across all configured integrations"
      actions={
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
          style={{ background: "var(--rtm-blue)" }}
        >
          + Register Webhook
        </button>
      }
    >
      <div className="space-y-3">
        {webhooks.map((webhook) => {
          const { variant, label } = STATUS_MAP[webhook.status];

          return (
            <div
              key={webhook.id}
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                      {webhook.name}
                    </p>
                    <StatusBadge variant={variant} label={label} size="sm" />
                    {webhook.errorCount > 0 && (
                      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                        {webhook.errorCount} {webhook.errorCount === 1 ? "error" : "errors"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono" style={{ color: "var(--rtm-text-muted)" }}>
                    {webhook.endpoint}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    className="text-xs font-medium px-2.5 py-1 rounded-lg border"
                    style={{
                      color: "var(--rtm-blue)",
                      borderColor: "var(--rtm-blue-light)",
                      background: "var(--rtm-blue-xlight)",
                    }}
                  >
                    Test
                  </button>
                  <button
                    className="text-xs font-medium px-2.5 py-1 rounded-lg border"
                    style={{
                      color: "var(--rtm-text-muted)",
                      borderColor: "var(--rtm-border)",
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                    Provider
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {webhook.providerName}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                    Last Event
                  </p>
                  <p className="text-xs" style={{ color: "var(--rtm-text-primary)" }}>
                    {formatDate(webhook.lastEvent)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                    Error Count
                  </p>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: webhook.errorCount > 0 ? "#DC2626" : "#059669" }}
                  >
                    {webhook.errorCount}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                    Events
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--rtm-surface-raised, #F1F5F9)",
                          color: "var(--rtm-text-secondary, #475569)",
                          border: "1px solid var(--rtm-border)",
                        }}
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
