"use client";

import React, { useState, useEffect } from "react";
import {
  PROPOSAL_SECTIONS,
  PROPOSAL_TEMPLATES,
  ProposalSectionId,
  ProposalSectionStatus,
} from "@/lib/sales/proposal-config";
import {
  ProposalDocument,
  ProposalSection,
  buildProposalFromTemplate,
  buildProposalWithContext,
  updateProposalSection,
  reorderSection,
} from "@/lib/sales/proposal-engine";
import ProposalSectionEditor from "./ProposalSectionEditor";
import ProposalPreviewPanel from "./ProposalPreviewPanel";
import ProposalStatusBar from "./ProposalStatusBar";

// ─── Section Status Indicator ────────────────────────────────────────────────

const SECTION_STATUS_COLORS: Record<ProposalSectionStatus, string> = {
  empty:    "#9CA3AF",
  draft:    "#D97706",
  complete: "#15803D",
  locked:   "#1D4ED8",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProposalBuilderShellProps {
  clientName?: string;
  preparedBy?: string;
  templateId?: string;
  context?: {
    goals?: string[];
    auditSummary?: string;
    recommendedServices?: string[];
    budgetSummary?: string;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProposalBuilderShell({
  clientName = "",
  preparedBy = "",
  templateId = "standard",
  context,
}: ProposalBuilderShellProps) {
  const [proposal, setProposal] = useState<ProposalDocument | null>(null);
  const [activeSection, setActiveSection] = useState<ProposalSectionId | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateId);

  // Initialize proposal on mount
  useEffect(() => {
    const doc =
      context && Object.values(context).some((v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true))
        ? buildProposalWithContext(selectedTemplateId, clientName, preparedBy, context)
        : buildProposalFromTemplate(selectedTemplateId, clientName, preparedBy);

    setProposal(doc);
    // Default to first section
    if (doc.sections.length > 0) {
      setActiveSection(doc.sections[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleSectionSelect(sectionId: ProposalSectionId) {
    setActiveSection(sectionId);
    if (previewMode) setPreviewMode(false);
  }

  function handleSectionUpdate(sectionId: ProposalSectionId, content: string) {
    if (!proposal) return;
    setProposal(updateProposalSection(proposal, sectionId, content));
  }

  function handleReorder(sectionId: ProposalSectionId, direction: string) {
    if (!proposal) return;
    setProposal(reorderSection(proposal, sectionId, direction));
  }

  function handleTogglePreview() {
    setPreviewMode((prev) => !prev);
  }

  function handleTemplateChange(newTemplateId: string) {
    setSelectedTemplateId(newTemplateId);
    const doc =
      context && Object.values(context).some((v) => v !== undefined)
        ? buildProposalWithContext(newTemplateId, clientName, preparedBy, context ?? {})
        : buildProposalFromTemplate(newTemplateId, clientName, preparedBy);

    setProposal(doc);
    if (doc.sections.length > 0) {
      setActiveSection(doc.sections[0].id);
    }
    setPreviewMode(false);
  }

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (!proposal) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <p
          className="text-sm"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Initializing proposal builder…
        </p>
      </div>
    );
  }

  const sortedSections = [...proposal.sections].sort((a, b) => a.order - b.order);
  const activeProposalSection: ProposalSection | undefined =
    activeSection
      ? proposal.sections.find((s) => s.id === activeSection)
      : sortedSections[0];

  return (
    <div className="space-y-4">
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl border px-5 py-3 flex items-center justify-between gap-4 flex-wrap"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <p
            className="text-xs font-bold"
            style={{ color: "var(--rtm-text-secondary)" }}
          >
            Template:
          </p>
          {PROPOSAL_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTemplateChange(t.id)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
              style={{
                background:
                  selectedTemplateId === t.id ? "#1D4ED8" : "var(--rtm-bg)",
                color:
                  selectedTemplateId === t.id ? "#fff" : "var(--rtm-text-secondary)",
                borderColor:
                  selectedTemplateId === t.id ? "#1D4ED8" : "var(--rtm-border)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleTogglePreview}
          className="px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all"
          style={{
            background: previewMode ? "#1D4ED8" : "var(--rtm-bg)",
            color: previewMode ? "#fff" : "var(--rtm-text-secondary)",
            borderColor: previewMode ? "#1D4ED8" : "var(--rtm-border)",
          }}
        >
          {previewMode ? "Back to Editor" : "Preview"}
        </button>
      </div>

      {/* ── Three-Panel Layout ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4 items-start">

        {/* ── Left Panel: Section List ──────────────────────────────────────── */}
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
              Sections
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
            {sortedSections.map((section) => {
              const def = PROPOSAL_SECTIONS.find((d) => d.id === section.id);
              const isActive = section.id === activeSection && !previewMode;

              return (
                <div
                  key={section.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSectionSelect(section.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSectionSelect(section.id);
                    }
                  }}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-blue-50 cursor-pointer"
                  style={{
                    background: isActive
                      ? "#EFF6FF"
                      : "transparent",
                    borderLeft: isActive
                      ? "3px solid #1D4ED8"
                      : "3px solid transparent",
                  }}
                >
                  {/* Status dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      background: SECTION_STATUS_COLORS[section.status],
                    }}
                  />

                  {/* Section info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{
                        color: isActive
                          ? "#1D4ED8"
                          : "var(--rtm-text-primary)",
                      }}
                    >
                      {section.label}
                    </p>
                    {def && (
                      <p
                        className="text-[10px] truncate mt-0.5"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        {section.editable ? "Editable" : "Auto-Populated"}
                      </p>
                    )}
                  </div>

                  {/* Reorder controls — shown inline on hover for editable sections */}
                  {section.editable && !previewMode && (
                    <div className="flex flex-col gap-0.5 flex-shrink-0 opacity-60">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(section.id, "up");
                        }}
                        className="text-[9px] px-1 py-0.5 rounded transition-all hover:opacity-100"
                        style={{
                          background: "#F3F4F6",
                          color: "#6B7280",
                        }}
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(section.id, "down");
                        }}
                        className="text-[9px] px-1 py-0.5 rounded transition-all hover:opacity-100"
                        style={{
                          background: "#F3F4F6",
                          color: "#6B7280",
                        }}
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section count footer */}
          <div
            className="px-4 py-2 border-t"
            style={{ borderColor: "var(--rtm-border)" }}
          >
            <p
              className="text-[10px]"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {sortedSections.length} section
              {sortedSections.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* ── Center Panel: Editor or Preview ──────────────────────────────── */}
        <div>
          {previewMode ? (
            <ProposalPreviewPanel proposal={proposal} />
          ) : activeProposalSection ? (
            <ProposalSectionEditor
              section={activeProposalSection}
              onUpdate={handleSectionUpdate}
              onReorder={handleReorder}
            />
          ) : (
            <div
              className="rounded-xl border px-6 py-12 text-center"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
              }}
            >
              <p
                className="text-sm"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Select a section from the list to begin editing.
              </p>
            </div>
          )}
        </div>

        {/* ── Right Panel: Status Bar ──────────────────────────────────────── */}
        <div>
          <ProposalStatusBar
            proposal={proposal}
            onTogglePreview={handleTogglePreview}
            previewMode={previewMode}
          />
        </div>
      </div>
    </div>
  );
}
