"use client";

import React from "react";
import { ProposalDocument } from "@/lib/sales/proposal-engine";
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from "@/lib/sales/proposal-config";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProposalPreviewPanelProps {
  proposal: ProposalDocument;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProposalPreviewPanel({ proposal }: ProposalPreviewPanelProps) {
  const statusLabel = PROPOSAL_STATUS_LABELS[proposal.status];
  const statusColors = PROPOSAL_STATUS_COLORS[proposal.status];

  const sortedSections = [...proposal.sections].sort((a, b) => a.order - b.order);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
      }}
    >
      {/* Preview Header */}
      <div
        className="px-6 py-4 border-b"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Proposal Preview — Read Only
          </p>
          <span
            className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{
              background: statusColors.bg,
              color: statusColors.text,
              borderColor: statusColors.border,
            }}
          >
            {statusLabel}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Prepared For
            </p>
            <p
              className="text-sm font-bold mt-0.5"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {proposal.clientName || "—"}
            </p>
          </div>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Prepared By
            </p>
            <p
              className="text-sm font-semibold mt-0.5"
              style={{ color: "var(--rtm-text-secondary)" }}
            >
              {proposal.preparedBy || "—"}
            </p>
          </div>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Date
            </p>
            <p
              className="text-sm font-semibold mt-0.5"
              style={{ color: "var(--rtm-text-secondary)" }}
            >
              {new Date(proposal.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Section Previews */}
      <div className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
        {sortedSections.map((section, index) => {
          const isLocked = !section.editable;
          const isEmpty =
            section.status === "empty" || !section.content.trim();

          return (
            <div
              key={section.id}
              className="px-6 py-5"
              style={{
                background:
                  isLocked ? "var(--rtm-bg)" : "var(--rtm-surface)",
              }}
            >
              {/* Section label row */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border"
                  style={{
                    background: isLocked ? "#EFF6FF" : "#F0FDF4",
                    color: isLocked ? "#1D4ED8" : "#15803D",
                    borderColor: isLocked ? "#BFDBFE" : "#BBF7D0",
                  }}
                >
                  {index + 1}
                </span>
                <h4
                  className="text-sm font-bold"
                  style={{ color: "var(--rtm-text-primary)" }}
                >
                  {section.label}
                </h4>
                {isLocked && (
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      background: "#EFF6FF",
                      color: "#1D4ED8",
                      borderColor: "#BFDBFE",
                    }}
                  >
                    AUTO-POPULATED
                  </span>
                )}
              </div>

              {/* Section content */}
              {isEmpty ? (
                <p
                  className="text-xs italic"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  This section has not been completed yet.
                </p>
              ) : (
                <div
                  className="text-sm whitespace-pre-wrap leading-relaxed"
                  style={{
                    color: "var(--rtm-text-secondary)",
                    paddingLeft: "2.25rem",
                  }}
                >
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 border-t"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <p
          className="text-[10px] text-center"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          This is a proposal preview. Content reflects the current draft state.
        </p>
      </div>
    </div>
  );
}
