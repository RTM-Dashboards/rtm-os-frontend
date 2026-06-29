"use client";

import React from "react";
import {
  PROPOSAL_SECTIONS,
  ProposalSectionId,
  ProposalSectionStatus,
} from "@/lib/sales/proposal-config";
import { ProposalSection } from "@/lib/sales/proposal-engine";

// ─── Status Badge ─────────────────────────────────────────────────────────────

const SECTION_STATUS_STYLES: Record<
  ProposalSectionStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  empty:    { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB", label: "Empty" },
  draft:    { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", label: "Draft" },
  complete: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", label: "Complete" },
  locked:   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", label: "Locked" },
};

function SectionStatusBadge({ status }: { status: ProposalSectionStatus }) {
  const s = SECTION_STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProposalSectionEditorProps {
  section: ProposalSection;
  onUpdate: (sectionId: ProposalSectionId, content: string) => void;
  onReorder: (sectionId: ProposalSectionId, direction: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProposalSectionEditor({
  section,
  onUpdate,
  onReorder,
}: ProposalSectionEditorProps) {
  const def = PROPOSAL_SECTIONS.find((d) => d.id === section.id);

  return (
    <div
      className="rounded-xl border flex flex-col"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        minHeight: "400px",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-start justify-between gap-3 flex-wrap"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3
              className="text-sm font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {section.label}
            </h3>
            <SectionStatusBadge status={section.status} />
            {!section.editable && (
              <span
                className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                style={{
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  borderColor: "#BFDBFE",
                }}
              >
                Auto-Populated
              </span>
            )}
          </div>
          {def && (
            <p
              className="text-xs"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {def.description}
            </p>
          )}
        </div>

        {/* Reorder controls — editable sections only */}
        {section.editable && (
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onReorder(section.id, "up")}
              className="px-2 py-1 text-[10px] font-semibold rounded-lg border transition-all hover:opacity-80"
              style={{
                background: "var(--rtm-bg)",
                color: "var(--rtm-text-secondary)",
                borderColor: "var(--rtm-border)",
              }}
              title="Move section up"
            >
              Move Up
            </button>
            <button
              onClick={() => onReorder(section.id, "down")}
              className="px-2 py-1 text-[10px] font-semibold rounded-lg border transition-all hover:opacity-80"
              style={{
                background: "var(--rtm-bg)",
                color: "var(--rtm-text-secondary)",
                borderColor: "var(--rtm-border)",
              }}
              title="Move section down"
            >
              Move Down
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-5">
        {section.editable ? (
          /* Editable content area */
          <textarea
            value={section.content}
            onChange={(e) => onUpdate(section.id, e.target.value)}
            className="w-full h-full min-h-[320px] text-sm rounded-lg border px-4 py-3 focus:outline-none resize-vertical"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
              lineHeight: "1.6",
            }}
            placeholder={`Enter content for ${section.label}…`}
          />
        ) : (
          /* Read-only locked section */
          <div className="space-y-3">
            {/* Locked notice */}
            <div
              className="rounded-lg border px-4 py-3 flex items-start gap-3"
              style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                  style={{ background: "#1D4ED8", color: "#fff" }}
                >
                  i
                </div>
              </div>
              <p className="text-xs" style={{ color: "#1D4ED8" }}>
                This section is auto-populated from upstream workflow data and
                cannot be edited manually.
              </p>
            </div>

            {/* Content display */}
            <div
              className="rounded-lg border px-4 py-4 whitespace-pre-wrap text-sm leading-relaxed"
              style={{
                background: "var(--rtm-bg)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
                minHeight: "200px",
              }}
            >
              {section.content ||
                "No data available. Complete the upstream workflow stages to populate this section."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
