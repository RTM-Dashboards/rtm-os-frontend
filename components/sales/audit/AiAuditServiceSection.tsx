"use client";

import React from "react";
import type { AiAuditServiceResult } from "@/lib/sales/types";
import { AI_AUDIT_SCORE_THRESHOLDS } from "@/lib/sales/audit-config";
import { AiAuditFindingCard } from "./AiAuditFindingCard";

// ─── Score style ──────────────────────────────────────────────────────────────

function scoreStyle(score: number): { bg: string; color: string; border: string } {
  for (const threshold of Object.values(AI_AUDIT_SCORE_THRESHOLDS)) {
    if (score >= threshold.min && score <= threshold.max) {
      if (threshold.min === 0) return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
      if (threshold.min === 31) return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
      if (threshold.min === 51) return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" };
      if (threshold.min === 71) return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
      return { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" };
    }
  }
  return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AiAuditServiceSectionProps {
  serviceResult: AiAuditServiceResult;
  dismissedFindingIds: string[];
  onDismissFinding: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AiAuditServiceSection({
  serviceResult,
  dismissedFindingIds,
  onDismissFinding,
}: AiAuditServiceSectionProps) {
  const sty = scoreStyle(serviceResult.score);
  const visibleFindings = serviceResult.findings.filter(
    (f) => !dismissedFindingIds.includes(f.id)
  );
  const allDismissed =
    serviceResult.findings.length > 0 && visibleFindings.length === 0;

  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      {/* Section header */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between gap-3 flex-wrap"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {serviceResult.serviceLabel}
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border"
            style={{ background: sty.bg, color: sty.color, borderColor: sty.border }}
          >
            <span className="text-sm font-black">{serviceResult.score}</span>
            <span>{serviceResult.scoreLabel}</span>
          </span>
        </div>

        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
          style={{
            background: "var(--rtm-bg)",
            color: "var(--rtm-text-muted)",
            borderColor: "var(--rtm-border)",
          }}
        >
          {visibleFindings.length} finding{visibleFindings.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Summary */}
      {serviceResult.summary && (
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--rtm-border)" }}>
          <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
            {serviceResult.summary}
          </p>
        </div>
      )}

      {/* Findings */}
      <div className="p-4 space-y-2">
        {allDismissed ? (
          <p className="text-xs text-center py-2" style={{ color: "var(--rtm-text-muted)" }}>
            All findings reviewed for this service.
          </p>
        ) : (
          visibleFindings.map((finding) => (
            <AiAuditFindingCard
              key={finding.id}
              finding={finding}
              onDismiss={onDismissFinding}
            />
          ))
        )}
      </div>
    </div>
  );
}
