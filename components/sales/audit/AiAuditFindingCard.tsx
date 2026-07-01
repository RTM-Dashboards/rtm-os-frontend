"use client";

import React, { useState } from "react";
import type { IntakeFinding } from "@/lib/sales/types";

// ─── Severity helpers ─────────────────────────────────────────────────────────

function severityStyle(severity: IntakeFinding["severity"]): {
  bg: string;
  color: string;
  border: string;
} {
  switch (severity) {
    case "critical":
      return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "high":
      return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "medium":
      return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" };
    case "low":
      return { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" };
    default:
      return { bg: "#F3F4F6", color: "#374151", border: "#D1D5DB" };
  }
}

function severityLabel(severity: IntakeFinding["severity"]): string {
  const map: Record<string, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  return map[severity] ?? severity;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AiAuditFindingCardProps {
  finding: IntakeFinding;
  onDismiss: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AiAuditFindingCard({ finding, onDismiss }: AiAuditFindingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sev = severityStyle(finding.severity);

  return (
    <div
      className="rounded-lg border"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Left: severity badge */}
        <div className="flex-shrink-0 pt-0.5">
          <span
            className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ background: sev.bg, color: sev.color, borderColor: sev.border }}
          >
            {severityLabel(finding.severity)}
          </span>
        </div>

        {/* Center: content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded border"
              style={{
                background: "#EFF6FF",
                color: "#1D4ED8",
                borderColor: "#BFDBFE",
              }}
            >
              {finding.category}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded border"
              style={{
                background: "#F5F3FF",
                color: "#6D28D9",
                borderColor: "#DDD6FE",
              }}
            >
              AI
            </span>
          </div>

          <button
            type="button"
            className="text-left w-full"
            onClick={() => setExpanded((v) => !v)}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {finding.title}
            </p>
            <p
              className={`text-xs mt-0.5 ${expanded ? "" : "line-clamp-2"}`}
              style={{ color: "var(--rtm-text-secondary)" }}
            >
              {finding.description}
            </p>
          </button>

          {expanded && finding.recommendation && (
            <div
              className="mt-2 rounded-lg border px-3 py-2"
              style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wide mb-1"
                style={{ color: "#0369A1" }}
              >
                Recommendation
              </p>
              <p className="text-xs" style={{ color: "#0369A1" }}>
                {finding.recommendation}
              </p>
            </div>
          )}

          {!expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-[10px] mt-1 font-semibold hover:underline"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Show recommendation
            </button>
          )}
          {expanded && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-[10px] mt-1 font-semibold hover:underline"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Collapse
            </button>
          )}
        </div>

        {/* Right: dismiss button */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => onDismiss(finding.id)}
            className="px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all hover:opacity-80"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-muted)",
            }}
            title="Mark as not relevant"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
