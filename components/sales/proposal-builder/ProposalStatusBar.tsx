"use client";

import React from "react";
import Link from "next/link";
import {
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_STATUS_COLORS,
  PROPOSAL_SECTIONS,
} from "@/lib/sales/proposal-config";
import { ProposalDocument } from "@/lib/sales/proposal-engine";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProposalStatusBarProps {
  proposal: ProposalDocument;
  onTogglePreview: () => void;
  previewMode: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProposalStatusBar({
  proposal,
  onTogglePreview,
  previewMode,
}: ProposalStatusBarProps) {
  const statusLabel = PROPOSAL_STATUS_LABELS[proposal.status];
  const statusColors = PROPOSAL_STATUS_COLORS[proposal.status];

  // Required section definitions for the checklist
  const requiredDefs = PROPOSAL_SECTIONS.filter((d) => d.required);
  const sectionMap = new Map(proposal.sections.map((s) => [s.id, s]));

  const completion = proposal.completionPercentage;
  const readyToSend = proposal.readyForSend;

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div
        className="rounded-xl border p-4"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-wide mb-2"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Proposal Status
        </p>
        <span
          className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full border"
          style={{
            background: statusColors.bg,
            color: statusColors.text,
            borderColor: statusColors.border,
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Completion Card */}
      <div
        className="rounded-xl border p-4"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Completion
          </p>
          <span
            className="text-sm font-black"
            style={{
              color:
                completion === 100
                  ? "#15803D"
                  : completion >= 50
                  ? "#C2410C"
                  : "#6B7280",
            }}
          >
            {completion}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: "#E5E7EB" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${completion}%`,
              background:
                completion === 100
                  ? "#15803D"
                  : completion >= 50
                  ? "#D97706"
                  : "#9CA3AF",
            }}
          />
        </div>
      </div>

      {/* Ready for Send Indicator */}
      <div
        className="rounded-xl border px-4 py-3 flex items-center gap-3"
        style={{
          background: readyToSend ? "#F0FDF4" : "#FFF7ED",
          borderColor: readyToSend ? "#BBF7D0" : "#FED7AA",
        }}
      >
        <div
          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{
            background: readyToSend ? "#15803D" : "#D97706",
          }}
        >
          <span
            className="text-[10px] font-black"
            style={{ color: "#fff" }}
          >
            {readyToSend ? "✓" : "!"}
          </span>
        </div>
        <div>
          <p
            className="text-xs font-bold"
            style={{ color: readyToSend ? "#15803D" : "#92400E" }}
          >
            {readyToSend ? "Ready to Send" : "Not Ready to Send"}
          </p>
          <p
            className="text-[10px] mt-0.5"
            style={{ color: readyToSend ? "#166534" : "#B45309" }}
          >
            {readyToSend
              ? "All required sections are complete."
              : "Complete all required sections to proceed."}
          </p>
        </div>
      </div>

      {/* Section Checklist */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Section Checklist
          </p>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
          {requiredDefs.map((def) => {
            const section = sectionMap.get(def.id);
            const isIncluded = !!section;
            const isComplete =
              isIncluded &&
              (section.status === "complete" || section.status === "locked");

            return (
              <div
                key={def.id}
                className="px-4 py-2.5 flex items-center gap-3"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-black"
                  style={{
                    background: isComplete
                      ? "#15803D"
                      : isIncluded
                      ? "#D97706"
                      : "#9CA3AF",
                    color: "#fff",
                  }}
                >
                  {isComplete ? "✓" : isIncluded ? "○" : "—"}
                </div>
                <p
                  className="text-xs font-semibold flex-1 min-w-0 truncate"
                  style={{
                    color: isComplete
                      ? "var(--rtm-text-primary)"
                      : "var(--rtm-text-muted)",
                  }}
                >
                  {def.label}
                </p>
                {!isIncluded && (
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: "#9CA3AF" }}
                  >
                    Not in template
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="rounded-xl border p-4 space-y-2"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-wide mb-3"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Actions
        </p>

        {/* Preview Toggle */}
        <button
          onClick={onTogglePreview}
          className="w-full px-4 py-2.5 text-xs font-semibold rounded-lg border transition-all hover:opacity-90"
          style={{
            background: previewMode ? "#1D4ED8" : "var(--rtm-bg)",
            color: previewMode ? "#fff" : "var(--rtm-text-secondary)",
            borderColor: previewMode ? "#1D4ED8" : "var(--rtm-border)",
          }}
        >
          {previewMode ? "Back to Editor" : "Preview Proposal"}
        </button>

        {/* Save Draft */}
        <button
          onClick={() => {
            // Mock — no real persistence in this stage
          }}
          className="w-full px-4 py-2.5 text-xs font-semibold rounded-lg border transition-all hover:opacity-90"
          style={{
            background: "var(--rtm-bg)",
            color: "var(--rtm-text-secondary)",
            borderColor: "var(--rtm-border)",
          }}
        >
          Save Draft
        </button>

        {/* Send for Review */}
        <button
          onClick={() => {
            // Mock — no real submission in this stage
          }}
          className="w-full px-4 py-2.5 text-xs font-semibold rounded-lg border transition-all hover:opacity-90"
          style={{
            background: "#FFF7ED",
            color: "#C2410C",
            borderColor: "#FED7AA",
          }}
        >
          Send for Review
        </button>

        {/* Send to Contract Builder */}
        <Link
          href="/sales/contracts"
          className="w-full px-4 py-2.5 text-xs font-semibold rounded-lg border transition-all hover:opacity-90 block text-center"
          style={{
            background: readyToSend ? "#F0FDF4" : "#F3F4F6",
            color: readyToSend ? "#15803D" : "#9CA3AF",
            borderColor: readyToSend ? "#BBF7D0" : "#D1D5DB",
            cursor: readyToSend ? "pointer" : "default",
            pointerEvents: readyToSend ? undefined : "none",
          }}
        >
          Send to Contract Builder
        </Link>
      </div>

      {/* Metadata */}
      <div
        className="rounded-xl border px-4 py-3 space-y-1.5"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-wide mb-2"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Proposal Info
        </p>
        {[
          { label: "Client", value: proposal.clientName || "—" },
          { label: "Prepared By", value: proposal.preparedBy || "—" },
          {
            label: "Created",
            value: new Date(proposal.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          },
          { label: "Template", value: proposal.templateId },
          { label: "Sections", value: String(proposal.sections.length) },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span
              className="text-[10px]"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {row.label}
            </span>
            <span
              className="text-[10px] font-semibold"
              style={{ color: "var(--rtm-text-secondary)" }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
