"use client";

import React, { useState } from "react";
import type { CommunicationLogEntry, CommunicationLogEntryType } from "@/lib/sales/types";

// ─── Type display config ──────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  CommunicationLogEntryType,
  { label: string; bg: string; color: string; border: string }
> = {
  call: {
    label: "Call",
    bg: "#EFF6FF",
    color: "#1D4ED8",
    border: "#BFDBFE",
  },
  "call-transcript": {
    label: "Transcript",
    bg: "#F5F3FF",
    color: "#7C3AED",
    border: "#DDD6FE",
  },
  email: {
    label: "Email",
    bg: "#F8FAFC",
    color: "#475569",
    border: "#E2E8F0",
  },
  "meeting-notes": {
    label: "Meeting Notes",
    bg: "#F0FDF4",
    color: "#15803D",
    border: "#BBF7D0",
  },
  sms: {
    label: "SMS",
    bg: "#F8FAFC",
    color: "#64748B",
    border: "#E2E8F0",
  },
  note: {
    label: "Note",
    bg: "#FFFBEB",
    color: "#B45309",
    border: "#FDE68A",
  },
};

// ─── Relative time formatter ──────────────────────────────────────────────────

function relativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  if (isNaN(then)) return isoString;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LogEntryCardProps {
  entry: CommunicationLogEntry;
  expanded?: boolean;
}

export function LogEntryCard({ entry, expanded: defaultExpanded = false }: LogEntryCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const cfg = TYPE_CONFIG[entry.type];

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          {/* Type badge */}
          <span
            className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5"
            style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
          >
            {cfg.label}
          </span>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p
                className="text-xs font-bold leading-tight"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {entry.title}
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                {entry.durationMinutes !== null && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
                    style={{ background: "#F0F9FF", color: "#0369A1", borderColor: "#BAE6FD" }}
                  >
                    {entry.durationMinutes} min
                  </span>
                )}
                <span
                  className="text-[10px]"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {relativeTime(entry.loggedAt)}
                </span>
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                  style={{
                    color: "var(--rtm-text-muted)",
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Logged by */}
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Logged by {entry.loggedBy}
              {entry.participants.length > 0
                ? ` · ${entry.participants.join(", ")}`
                : ""}
            </p>

            {/* Summary (always visible, truncated) */}
            <p
              className="text-[11px] mt-1.5 leading-relaxed"
              style={{
                color: "var(--rtm-text-secondary)",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: expanded ? undefined : 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {entry.summary}
            </p>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (entry.fullContent || entry.attachmentNote) && (
        <div
          className="px-4 pb-4 space-y-3"
          style={{ borderTop: "1px solid var(--rtm-border)" }}
        >
          {entry.fullContent && (
            <div className="pt-3">
              <p
                className="text-[10px] font-bold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {entry.type === "call-transcript" ? "Full Transcript" : "Additional Notes"}
              </p>
              <pre
                className="text-[11px] leading-relaxed whitespace-pre-wrap font-sans rounded-lg p-3 border"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: "var(--rtm-border)",
                  color: "var(--rtm-text-secondary)",
                }}
              >
                {entry.fullContent}
              </pre>
            </div>
          )}

          {entry.attachmentNote && (
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wide mb-1"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Attachment
              </p>
              <p
                className="text-[11px] px-3 py-2 rounded-lg border"
                style={{
                  background: "#FFFBEB",
                  borderColor: "#FDE68A",
                  color: "#92400E",
                }}
              >
                {entry.attachmentNote}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
