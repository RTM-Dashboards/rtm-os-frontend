"use client";

/**
 * OnboardingSummaryPanel — shared read-only display component for AM onboarding records.
 *
 * Renders all filled fields grouped by section. Used in:
 *   - Project Overview (as a collapsible embed, with a link to the record page)
 *   - Task Client Context tab (same embed)
 *   - /account-management/onboarding/[recordId]/record (standalone read-only page)
 *
 * Props:
 *   record    — the AMOnboardingRecord to display
 *   recordId  — used to build the "View Full Record" / "Edit in Wizard" links
 *   mode      — "embed" (default): shows "View Full Record →" link in header
 *               "standalone": hides that link (caller controls navigation)
 */

import { useState } from "react";
import Link from "next/link";
import type { AMOnboardingRecord } from "@/lib/mock/am-onboarding-store";
import { ONBOARDING_FIELD_SCHEMA, ONBOARDING_SECTIONS } from "@/lib/mock/am-onboarding-field-schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OnboardingFieldRow {
  label: string;
  value: string;
}

export interface OnboardingSectionGroup {
  id: string;
  label: string;
  description: string;
  fields: OnboardingFieldRow[];
}

// ---------------------------------------------------------------------------
// Pure helper — build section groups from a record (exported for reuse)
// ---------------------------------------------------------------------------

export function buildOnboardingSectionGroups(record: AMOnboardingRecord): OnboardingSectionGroup[] {
  return ONBOARDING_SECTIONS.map((sec) => {
    const sectionFields = ONBOARDING_FIELD_SCHEMA.filter((f) => f.section === sec.id);
    const fields: OnboardingFieldRow[] = sectionFields
      .map((f) => {
        const assignment = record.fieldAssignments[f.id];
        const value = assignment?.value ?? "";
        return { label: f.label, value };
      })
      .filter((row) => row.value.trim().length > 0);
    return { id: sec.id, label: sec.label, description: sec.description, fields };
  }).filter((sec) => sec.fields.length > 0);
}

// ---------------------------------------------------------------------------
// Status color map
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  "Draft":             { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  "AM In Progress":    { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  "Sent to Client":    { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  "Client Responded":  { bg: "#ECFEFF", color: "#0891B2", border: "#A5F3FC" },
  "Ready for Kickoff": { bg: "#F0FDF4", color: "#059669", border: "#A7F3D0" },
  "Complete":          { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface OnboardingSummaryPanelProps {
  record: AMOnboardingRecord;
  recordId: string;
  /** "embed" (default) shows a "View Full Record →" link in the header.
   *  "standalone" omits that link — the standalone page controls its own nav. */
  mode?: "embed" | "standalone";
}

export function OnboardingSummaryPanel({
  record,
  recordId,
  mode = "embed",
}: OnboardingSummaryPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(["client-basics", "engagement-setup", "am-internal"])
  );

  const sectionGroups = buildOnboardingSectionGroups(record);
  const totalFields = Object.values(record.fieldAssignments).length;
  const filledFields = Object.values(record.fieldAssignments).filter(
    (a) => a.value.trim().length > 0
  ).length;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sc = STATUS_COLORS[record.status] ?? STATUS_COLORS["Draft"];
  const recordRoute = `/account-management/onboarding/${recordId}/record`;

  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-xs font-black uppercase tracking-wide"
              style={{ color: "var(--rtm-text-secondary)" }}
            >
              Client Onboarding Record
            </p>
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border"
              style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
            >
              {record.status}
            </span>
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {filledFields} of {totalFields} fields filled · Record ID: {record.id}
          </p>
        </div>

        {mode === "embed" && (
          <Link
            href={recordRoute}
            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
            style={{ background: "#2563EB" }}
          >
            View Full Record →
          </Link>
        )}
      </div>

      {/* Section groups */}
      <div className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
        {sectionGroups.length === 0 && (
          <div className="px-5 py-4 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            No fields filled in yet.{" "}
            {mode === "embed" && (
              <Link href={recordRoute} className="text-blue-600 hover:underline">
                Open the record →
              </Link>
            )}
          </div>
        )}

        {sectionGroups.map((sec) => {
          const isOpen = expandedSections.has(sec.id);
          return (
            <div key={sec.id}>
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold"
                    style={{ color: "var(--rtm-text-primary)" }}
                  >
                    {sec.label}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                  >
                    {sec.fields.length} field{sec.fields.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sec.fields.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-lg p-3"
                      style={{
                        background: "var(--rtm-bg)",
                        border: "1px solid var(--rtm-border-light)",
                      }}
                    >
                      <div
                        className="text-[10px] font-bold uppercase tracking-wide mb-1"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        {row.label}
                      </div>
                      <div
                        className="text-sm"
                        style={{
                          color: "var(--rtm-text-primary)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
