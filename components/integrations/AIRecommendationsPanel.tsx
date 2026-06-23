"use client";

import type { AIRecommendation, Integration } from "@/lib/integrations/types";
import SectionWrapper from "@/components/ui/SectionWrapper";

interface Props {
  recommendations: AIRecommendation[];
  integrations: Integration[];
}

const TYPE_CONFIG = {
  unused: {
    label: "Unused Integration",
    color: "#94A3B8",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    icon: (
      <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
        <circle cx="12"cy="12"r="10"strokeWidth={2} />
        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M8 12h8"/>
      </svg>
    ),
  },
  redundant: {
    label: "Redundant Integration",
    color: "#B45309",
    bg: "#FFFBEB",
    border: "#FDE68A",
    icon: (
      <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
      </svg>
    ),
  },
  missing: {
    label: "Missing Connection",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: (
      <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
    ),
  },
  improvement: {
    label: "Setup Improvement",
    color: "#0369A1",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    icon: (
      <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
};

const PRIORITY_CONFIG = {
  high:   { label: "High Priority",   color: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
  medium: { label: "Medium Priority", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A"},
  low:    { label: "Low Priority",    color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0"},
};

export default function AIRecommendationsPanel({ recommendations, integrations }: Props) {
  const high   = recommendations.filter((r) => r.priority === "high");
  const medium = recommendations.filter((r) => r.priority === "medium");
  const low    = recommendations.filter((r) => r.priority === "low");

  const ordered = [...high, ...medium, ...low];

  return (
    <SectionWrapper
      title="AI Integration Recommendations"description="AI-generated analysis of unused, redundant, and missing connector configurations"actions={
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5"style={{ color: "var(--rtm-blue)", borderColor: "var(--rtm-blue-light)", background: "var(--rtm-blue-xlight)"}}
        >
          <svg className="w-3.5 h-3.5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
            <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Re-Analyze
        </button>
      }
    >
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { heading: "High Priority",   count: high.length,   ...PRIORITY_CONFIG.high },
          { heading: "Medium Priority", count: medium.length, ...PRIORITY_CONFIG.medium },
          { heading: "Low Priority",    count: low.length,    ...PRIORITY_CONFIG.low },
        ].map((item) => (
          <div
            key={item.heading}
            className="rounded-xl border p-3 text-center"style={{ background: item.bg, borderColor: item.border }}
          >
            <p className="text-2xl font-bold"style={{ color: item.color }}>{item.count}</p>
            <p className="text-xs font-semibold mt-0.5"style={{ color: item.color }}>{item.heading}</p>
          </div>
        ))}
      </div>

      {/* Recommendation cards */}
      <div className="space-y-3">
        {ordered.map((rec) => {
          const typeConf     = TYPE_CONFIG[rec.type];
          const priorityConf = PRIORITY_CONFIG[rec.priority];
          const affected     = rec.affectedIntegrationIds
            .map((id) => integrations.find((i) => i.id === id))
            .filter(Boolean) as Integration[];

          return (
            <div
              key={rec.id}
              className="rounded-xl border p-4"style={{ background: typeConf.bg, borderColor: typeConf.border }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"style={{ background: "white", color: typeConf.color, border: `1px solid ${typeConf.border}` }}
                >
                  {typeConf.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                      {rec.title}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"style={{
                          background: "white",
                          color: typeConf.color,
                          borderColor: typeConf.border,
                        }}
                      >
                        {typeConf.label}
                      </span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"style={{
                          background: priorityConf.bg,
                          color: priorityConf.color,
                          borderColor: priorityConf.border,
                        }}
                      >
                        {priorityConf.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mb-3"style={{ color: "var(--rtm-text-secondary, #475569)"}}>
                    {rec.description}
                  </p>
                  {affected.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {affected.map((integration) => (
                        <span
                          key={integration.id}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full"style={{
                            background: "white",
                            color: "var(--rtm-text-secondary, #475569)",
                            border: "1px solid var(--rtm-border)",
                          }}
                        >
                          {integration.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pl-11">
                <button
                  className="text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors"style={{
                    color: "var(--rtm-blue)",
                    borderColor: "var(--rtm-blue-light)",
                    background: "white",
                  }}
                >
                  Review
                </button>
                <button
                  className="text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors"style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)", background: "white"}}
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
