"use client";

// RTM OS — Standard AI Summary Component
// Consistent layout for: Client Summary, Project Summary, Renewal Summary,
// Call Summary, Executive Summary.

import React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AISummaryKind =
  | "client"| "project"| "renewal"| "call"| "executive"| "task"| "general";

export type AIUrgency = "info"| "warn"| "critical";
export type AIHealth  = "healthy"| "at-risk"| "critical";

export interface AIInsightItem {
  text: string;
  urgency?: AIUrgency;
  /** Optional category label */
  category?: string;
}

export interface AISummaryProps {
  kind?: AISummaryKind;
  title?: string;
  subtitle?: string;
  generatedAt?: string;
  health?: AIHealth;
  healthNote?: string;
  /** Main summary paragraph */
  summary?: string;
  /** Key insights list */
  insights?: AIInsightItem[];
  /** Recommended actions */
  actions?: AIInsightItem[];
  /** Blockers / risks */
  blockers?: AIInsightItem[];
  /** Any extra sections: { heading, items } */
  extraSections?: { heading: string; items: AIInsightItem[] }[];
  /** Show disclaimer footer */
  disclaimer?: boolean;
  /** Loading state */
  loading?: boolean;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const kindMeta: Record<AISummaryKind, { label: string }> = {
  client:    { label: "Client Summary"},
  project:   { label: "Project Summary"},
  renewal:   { label: "Renewal Summary"},
  call:      { label: "Call Summary"},
  executive: { label: "Executive Summary"},
  task:      { label: "Task Summary"},
  general:   { label: "AI Summary"},
};

const healthConfig: Record<AIHealth, { bg: string; border: string; color: string; dot: string; label: string }> = {
  healthy:  { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46", dot: "#10B981", label: "Healthy"},
  "at-risk":{ bg: "#FFFBEB", border: "#FDE68A", color: "#92400E", dot: "#F59E0B", label: "At Risk"},
  critical: { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B", dot: "#DC2626", label: "Critical"},
};

const urgencyDot: Record<AIUrgency, string> = {
  info:     "#10B981",
  warn:     "#F59E0B",
  critical: "#DC2626",
};

// ── Sub-components ────────────────────────────────────────────────────────────

const AIBrainIcon = () => (
  <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
  </svg>
);

function InsightList({ items }: { items: AIInsightItem[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"style={{ background: urgencyDot[item.urgency ?? "info"] }}
          />
          <span className="text-xs leading-relaxed"style={{ color: "var(--rtm-text-secondary)"}}>
            {item.category && (
              <span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                {item.category}:{""}
              </span>
            )}
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SectionBlock({ heading, items }: { heading: string; items: AIInsightItem[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-2"style={{ color: "var(--rtm-text-muted)"}}>
        {heading}
      </p>
      <InsightList items={items} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AISummary({
  kind = "general",
  title,
  subtitle,
  generatedAt,
  health,
  healthNote,
  summary,
  insights,
  actions,
  blockers,
  extraSections,
  disclaimer = true,
  loading = false,
}: AISummaryProps) {
  const meta = kindMeta[kind];
  const displayTitle = title ?? meta.label;
  const hc = health ? healthConfig[health] : null;

  return (
    <div
      className="rounded-xl overflow-hidden border"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-3.5"style={{
          background: "linear-gradient(135deg, var(--rtm-blue) 0%, #3B82F6 100%)",
          color: "#fff",
        }}
      >
        <div className="flex items-center gap-2">
          <AIBrainIcon />
          <div>
            <p className="text-sm font-bold leading-tight">{displayTitle}</p>
            {subtitle && (
              <p className="text-[11px] opacity-75 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {generatedAt && (
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] opacity-60">Generated</p>
            <p className="text-[11px] font-semibold opacity-90">{generatedAt}</p>
          </div>
        )}
      </div>

      {/* Health banner */}
      {hc && (
        <div
          className="flex items-center gap-2.5 px-5 py-2.5"style={{ background: hc.bg, borderBottom: `1px solid ${hc.border}` }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0"style={{ background: hc.dot }} />
          <p className="text-xs font-semibold"style={{ color: hc.color }}>
            <span className="font-bold">{hc.label}</span>
            {healthNote ? ` — ${healthNote}` : ""}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2"style={{ color: "var(--rtm-text-muted)"}}>
          <svg className="w-4 h-4 animate-spin"fill="none"viewBox="0 0 24 24">
            <circle className="opacity-25"cx="12"cy="12"r="10"stroke="currentColor"strokeWidth="4"/>
            <path className="opacity-75"fill="currentColor"d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <span className="text-xs">Generating summary...</span>
        </div>
      ) : (
        <div className="px-5 py-4 space-y-4">
          {/* Summary paragraph */}
          {summary && (
            <p className="text-sm leading-relaxed"style={{ color: "var(--rtm-text-secondary)"}}>
              {summary}
            </p>
          )}

          {blockers && <SectionBlock heading="Blockers"items={blockers} />}
          {insights  && <SectionBlock heading="Key Insights"items={insights} />}
          {actions   && <SectionBlock heading="Recommended Actions"items={actions} />}
          {extraSections?.map((s, i) => (
            <SectionBlock key={i} heading={s.heading} items={s.items} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      {disclaimer && !loading && (
        <div
          className="px-5 py-2.5 flex items-center justify-end"style={{ borderTop: "1px solid var(--rtm-border)", background: "var(--rtm-bg)"}}
        >
          <p className="text-[10px] italic"style={{ color: "var(--rtm-text-muted)"}}>
            AI-generated — verify before acting
          </p>
        </div>
      )}
    </div>
  );
}
