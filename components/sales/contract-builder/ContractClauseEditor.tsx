"use client";

import React from "react";
import type { ContractClause } from "@/lib/sales/contract-engine";
import type { ContractClauseId } from "@/lib/sales/contract-config";

interface ContractClauseEditorProps {
  clause: ContractClause;
  onUpdate: (clauseId: ContractClauseId, content: string) => void;
}

const STATUS_LABEL: Record<ContractClause["status"], string> = {
  empty: "Empty",
  draft: "Draft",
  complete: "Complete",
  locked: "Locked",
};

const STATUS_COLOR: Record<ContractClause["status"], { bg: string; color: string; border: string }> = {
  empty: { bg: "#F3F4F6", color: "#6B7280", border: "#D1D5DB" },
  draft: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  complete: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  locked: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
};

export default function ContractClauseEditor({ clause, onUpdate }: ContractClauseEditorProps) {
  const sc = STATUS_COLOR[clause.status];

  const isEditableAndUnlocked = clause.editable && !clause.legalLock;
  const isLegalLocked = clause.legalLock;
  const isAutoPopulated = !clause.editable && !clause.legalLock;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Clause header */}
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h2
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {clause.label}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
            {clause.id === "cover"
              ? "Populated from client name, date, and contract number."
              : clause.id === "services"
              ? "Auto-populated from proposal recommended services."
              : clause.id === "investment"
              ? "Auto-populated from budget optimizer output."
              : clause.id === "signatures"
              ? "Signature block with agency rep and client signatory fields."
              : "Standard contract clause."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
            style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
          >
            {STATUS_LABEL[clause.status]}
          </span>
          {isLegalLocked && (
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
              style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
            >
              Legal Lock
            </span>
          )}
          {isAutoPopulated && (
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
              style={{ background: "#F5F3FF", color: "#7C3AED", borderColor: "#DDD6FE" }}
            >
              Auto-Populated
            </span>
          )}
        </div>
      </div>

      {/* Editable clause */}
      {isEditableAndUnlocked && (
        <div className="flex flex-col flex-1 gap-2">
          <label
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Clause Content
          </label>
          <textarea
            className="flex-1 w-full rounded-lg border p-4 text-sm leading-relaxed resize-none outline-none focus:ring-2"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
              minHeight: 320,
            }}
            value={clause.content}
            onChange={(e) => onUpdate(clause.id, e.target.value)}
            placeholder="Enter clause content..."
            spellCheck
          />
          <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
            This clause is editable. Changes are saved automatically.
          </p>
        </div>
      )}

      {/* Legal lock — read-only */}
      {isLegalLocked && (
        <div className="flex flex-col flex-1 gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}
          >
            <div
              className="w-1 h-full rounded-full flex-shrink-0"
              style={{ background: "#2563EB", minHeight: 16 }}
            />
            <p className="text-xs font-semibold" style={{ color: "#2563EB" }}>
              This clause contains standard legal language and cannot be modified.
            </p>
          </div>
          <div
            className="flex-1 rounded-lg border p-4 text-sm leading-relaxed"
            style={{
              background: "#F8FAFF",
              borderColor: "#BFDBFE",
              color: "var(--rtm-text-primary)",
              whiteSpace: "pre-wrap",
              minHeight: 280,
            }}
          >
            {clause.content}
          </div>
        </div>
      )}

      {/* Auto-populated — read-only */}
      {isAutoPopulated && (
        <div className="flex flex-col flex-1 gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ background: "#FAF5FF", borderColor: "#DDD6FE" }}
          >
            <p className="text-xs font-semibold" style={{ color: "#7C3AED" }}>
              This section is auto-populated from upstream workflow data.
            </p>
          </div>
          <div
            className="flex-1 rounded-lg border p-4 text-sm leading-relaxed"
            style={{
              background: "#FAFBFF",
              borderColor: "var(--rtm-border)",
              color:
                clause.content.trim().length > 0
                  ? "var(--rtm-text-primary)"
                  : "var(--rtm-text-muted)",
              whiteSpace: "pre-wrap",
              minHeight: 280,
            }}
          >
            {clause.content.trim().length > 0
              ? clause.content
              : "No content yet. This section will be populated when upstream data is available."}
          </div>
        </div>
      )}
    </div>
  );
}
