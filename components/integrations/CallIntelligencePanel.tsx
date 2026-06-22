"use client";

import type { CallIntelligenceMapping, Integration } from "@/lib/integrations/types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import StatusBadge from "@/components/ui/StatusBadge";

interface Props {
  mappings: CallIntelligenceMapping[];
  integrations: Integration[];
}

const TYPE_LABEL: Record<string, string> = {
  booked_call:    "Booked Call",
  qualified_lead: "Qualified Lead",
  spam:           "Spam",
  custom:         "Custom",
};

const TYPE_VARIANT: Record<string, "success" | "info" | "error" | "neutral"> = {
  booked_call:    "success",
  qualified_lead: "info",
  spam:           "error",
  custom:         "neutral",
};

export default function CallIntelligencePanel({ mappings, integrations }: Props) {
  return (
    <SectionWrapper
      title="Call Intelligence Mapping"
      description="Configure call classification for each call tracking provider"
      actions={
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
          style={{ background: "var(--rtm-blue)" }}
        >
          + Add Classification
        </button>
      }
    >
      <div className="space-y-6">
        {mappings.map((mapping) => {
          const provider = integrations.find((i) => i.id === mapping.callProviderIntegrationId);

          return (
            <div
              key={mapping.integrationId}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--rtm-border)" }}
            >
              {/* Provider header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ background: "var(--rtm-surface-raised, #F8FAFC)", borderBottom: "1px solid var(--rtm-border)" }}
              >
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                    {provider?.name ?? mapping.integrationId}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    {provider?.description} · {mapping.classifications.length} classifications
                  </p>
                </div>
                <button
                  className="text-xs font-medium px-2.5 py-1 rounded-lg border"
                  style={{
                    color: "var(--rtm-blue)",
                    borderColor: "var(--rtm-blue-light)",
                    background: "var(--rtm-blue-xlight)",
                  }}
                >
                  Edit Mappings
                </button>
              </div>

              {/* Classifications */}
              <div className="divide-y divide-slate-100">
                {mapping.classifications.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-start justify-between gap-4 px-4 py-3"
                    style={{ background: "var(--rtm-surface)" }}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <StatusBadge
                        variant={TYPE_VARIANT[cls.type]}
                        label={TYPE_LABEL[cls.type]}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                          {cls.label}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {cls.keywords.map((kw) => (
                            <span
                              key={kw}
                              className="text-[11px] px-1.5 py-0.5 rounded font-mono"
                              style={{
                                background: "var(--rtm-surface-raised, #F1F5F9)",
                                color: "var(--rtm-text-secondary, #475569)",
                                border: "1px solid var(--rtm-border)",
                              }}
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full flex items-center flex-shrink-0 cursor-pointer transition-colors ${
                        cls.enabled ? "justify-end" : "justify-start"
                      }`}
                      style={{ background: cls.enabled ? "#059669" : "#E2E8F0" }}
                    >
                      <div className="w-3.5 h-3.5 bg-white rounded-full mx-0.5 shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add custom */}
              <div
                className="px-4 py-3"
                style={{ borderTop: "1px solid var(--rtm-border-light)", background: "var(--rtm-surface-raised, #F8FAFC)" }}
              >
                <button
                  className="text-xs font-medium flex items-center gap-1.5"
                  style={{ color: "var(--rtm-blue)" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Custom Category
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
