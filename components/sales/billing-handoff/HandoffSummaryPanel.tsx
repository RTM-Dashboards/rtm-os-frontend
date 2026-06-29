"use client";

import React from "react";
import { HANDOFF_SUMMARY_FIELDS } from "@/lib/sales/handoff-config";
import type { HandoffSummaryFieldSource } from "@/lib/sales/handoff-config";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HandoffSummaryPanelProps {
  summaryFields: Record<string, string>;
  onUpdate: (fieldId: string, value: string) => void;
}

// ─── Source Label ─────────────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<
  HandoffSummaryFieldSource,
  { label: string; bg: string; color: string; border: string }
> = {
  contract: {
    label: "Contract",
    bg: "#EFF6FF",
    color: "var(--rtm-blue)",
    border: "#BFDBFE",
  },
  budget: {
    label: "Budget",
    bg: "#ECFDF5",
    color: "#059669",
    border: "#A7F3D0",
  },
  manual: {
    label: "Manual Entry",
    bg: "#FFFBEB",
    color: "#B45309",
    border: "#FDE68A",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HandoffSummaryPanel({
  summaryFields,
  onUpdate,
}: HandoffSummaryPanelProps) {
  const contractFields = HANDOFF_SUMMARY_FIELDS.filter((f) => f.source === "contract");
  const budgetFields = HANDOFF_SUMMARY_FIELDS.filter((f) => f.source === "budget");
  const manualFields = HANDOFF_SUMMARY_FIELDS.filter((f) => f.source === "manual");

  return (
    <div className="space-y-6">
      {/* Contract Fields */}
      <FieldGroup
        title="Contract Data"
        description="Pulled from the signed contract. Read-only."
        fields={contractFields}
        summaryFields={summaryFields}
        onUpdate={onUpdate}
      />

      {/* Budget Fields */}
      <FieldGroup
        title="Budget Data"
        description="Pulled from the approved budget optimizer. Read-only."
        fields={budgetFields}
        summaryFields={summaryFields}
        onUpdate={onUpdate}
      />

      {/* Manual Fields */}
      <FieldGroup
        title="Manual Entry"
        description="Requires manual input by the sales representative."
        fields={manualFields}
        summaryFields={summaryFields}
        onUpdate={onUpdate}
      />
    </div>
  );
}

// ─── Field Group ─────────────────────────────────────────────────────────────

interface FieldGroupProps {
  title: string;
  description: string;
  fields: typeof HANDOFF_SUMMARY_FIELDS;
  summaryFields: Record<string, string>;
  onUpdate: (fieldId: string, value: string) => void;
}

function FieldGroup({
  title,
  description,
  fields,
  summaryFields,
  onUpdate,
}: FieldGroupProps) {
  if (fields.length === 0) return null;

  return (
    <div>
      {/* Group Header */}
      <div className="mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-primary)" }}>
          {title}
        </h3>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
          {description}
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {fields.map((field) => {
          const isReadOnly = field.source !== "manual";
          const sourceConfig = SOURCE_CONFIG[field.source];
          const value = summaryFields[field.id] ?? "";
          const isEmpty = !value;

          return (
            <div
              key={field.id}
              className="rounded-lg border p-3"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
              }}
            >
              {/* Field Header */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: "var(--rtm-text-secondary)" }}
                >
                  {field.label}
                </span>
                {field.required && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: "#EFF6FF", color: "var(--rtm-blue)" }}
                  >
                    Required
                  </span>
                )}
                <span
                  className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    background: sourceConfig.bg,
                    color: sourceConfig.color,
                    borderColor: sourceConfig.border,
                  }}
                >
                  {sourceConfig.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-[10px] mb-2" style={{ color: "var(--rtm-text-muted)" }}>
                {field.description}
              </p>

              {/* Read-only value or editable input */}
              {isReadOnly ? (
                <div
                  className="px-3 py-2 rounded text-xs font-semibold"
                  style={{
                    background: "var(--rtm-bg)",
                    color: isEmpty ? "var(--rtm-text-muted)" : "var(--rtm-text-primary)",
                    border: "1px solid var(--rtm-border)",
                  }}
                >
                  {isEmpty ? (
                    <span className="italic">Not provided — pull from contract</span>
                  ) : (
                    value
                  )}
                </div>
              ) : (
                <textarea
                  value={value}
                  onChange={(e) => onUpdate(field.id, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}…`}
                  rows={2}
                  className="w-full text-xs rounded px-3 py-2 resize-none transition-colors"
                  style={{
                    background: "var(--rtm-bg)",
                    color: "var(--rtm-text-primary)",
                    border: "1px solid var(--rtm-border)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--rtm-blue)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--rtm-border)";
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
