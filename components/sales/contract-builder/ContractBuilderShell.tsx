"use client";

import React, { useState, useEffect } from "react";
import {
  buildContractFromTemplate,
  buildContractWithContext,
  updateContractClause,
  updateContractTerms,
  type ContractDocument,
} from "@/lib/sales/contract-engine";
import {
  CONTRACT_TEMPLATES,
  PAYMENT_TERM_OPTIONS,
  CONTRACT_TERM_LENGTHS,
  type ContractClauseId,
  type PaymentTermOption,
  type ContractTermLength,
} from "@/lib/sales/contract-config";

import ContractClauseEditor from "./ContractClauseEditor";
import ContractPreviewPanel from "./ContractPreviewPanel";
import ContractStatusBar from "./ContractStatusBar";

interface ContractBuilderShellProps {
  clientName?: string;
  preparedBy?: string;
  templateId?: string;
  context?: {
    services?: string[];
    investmentSummary?: string;
    proposalId?: string;
  };
}

const CLAUSE_STATUS_DOT: Record<string, string> = {
  empty: "#D1D5DB",
  draft: "#D97706",
  complete: "#059669",
  locked: "#2563EB",
};

export default function ContractBuilderShell({
  clientName = "New Client",
  preparedBy = "Sales Representative",
  templateId = "standard",
  context,
}: ContractBuilderShellProps) {
  const [contract, setContract] = useState<ContractDocument | null>(null);
  const [activeClause, setActiveClause] = useState<ContractClauseId | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateId);

  // Build initial contract on mount
  useEffect(() => {
    const built =
      context && (context.services || context.investmentSummary)
        ? buildContractWithContext(selectedTemplateId, clientName, preparedBy, context)
        : buildContractFromTemplate(selectedTemplateId, clientName, preparedBy);
    setContract(built);
    setActiveClause(built.clauses[0]?.id ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!contract) return null;

  const handleClauseSelect = (clauseId: ContractClauseId) => {
    setActiveClause(clauseId);
    setPreviewMode(false);
  };

  const handleClauseUpdate = (clauseId: ContractClauseId, content: string) => {
    setContract((prev) => (prev ? updateContractClause(prev, clauseId, content) : prev));
  };

  const handleTermsUpdate = (
    updates: Partial<Pick<ContractDocument, "paymentTerm" | "termLength">>
  ) => {
    setContract((prev) => (prev ? updateContractTerms(prev, updates) : prev));
  };

  const handleTogglePreview = () => {
    setPreviewMode((prev) => !prev);
  };

  const handleTemplateChange = (newTemplateId: string) => {
    setSelectedTemplateId(newTemplateId);
    const rebuilt =
      context && (context.services || context.investmentSummary)
        ? buildContractWithContext(newTemplateId, clientName, preparedBy, context)
        : buildContractFromTemplate(newTemplateId, clientName, preparedBy);
    setContract(rebuilt);
    setActiveClause(rebuilt.clauses[0]?.id ?? null);
    setPreviewMode(false);
  };

  const activeClauseData = contract.clauses.find((c) => c.id === activeClause) ?? null;

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Contract Terms Bar */}
      <div
        className="flex flex-wrap items-center gap-4 px-5 py-3 border-b"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        {/* Template selector */}
        <div className="flex items-center gap-2">
          <label
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Template
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="text-xs font-semibold rounded-lg border px-2 py-1 outline-none"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          >
            {CONTRACT_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Payment term selector */}
        <div className="flex items-center gap-2">
          <label
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Payment
          </label>
          <select
            value={contract.paymentTerm}
            onChange={(e) =>
              handleTermsUpdate({ paymentTerm: e.target.value as PaymentTermOption })
            }
            className="text-xs font-semibold rounded-lg border px-2 py-1 outline-none"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          >
            {(Object.entries(PAYMENT_TERM_OPTIONS) as [PaymentTermOption, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label.split(" — ")[0]}
                </option>
              )
            )}
          </select>
        </div>

        {/* Term length selector */}
        <div className="flex items-center gap-2">
          <label
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Term
          </label>
          <select
            value={contract.termLength}
            onChange={(e) =>
              handleTermsUpdate({ termLength: e.target.value as ContractTermLength })
            }
            className="text-xs font-semibold rounded-lg border px-2 py-1 outline-none"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          >
            {(Object.entries(CONTRACT_TERM_LENGTHS) as [ContractTermLength, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>

        {/* Contract number badge */}
        <div className="ml-auto flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {contract.contractNumber}
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: "#F3F4F6", color: "#6B7280" }}
          >
            {contract.completionPercentage}% complete
          </span>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex flex-1 gap-0 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left panel: clause list */}
        <div
          className="flex-shrink-0 flex flex-col border-r overflow-y-auto"
          style={{
            width: 240,
            borderColor: "var(--rtm-border)",
            background: "var(--rtm-bg)",
          }}
        >
          <div
            className="px-4 py-3 border-b sticky top-0"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Clauses
            </p>
          </div>

          <div className="flex flex-col py-2">
            {contract.clauses.map((clause) => {
              const isActive = activeClause === clause.id && !previewMode;
              const dotColor = CLAUSE_STATUS_DOT[clause.status] ?? "#D1D5DB";

              return (
                <button
                  key={clause.id}
                  onClick={() => handleClauseSelect(clause.id)}
                  className="flex items-start gap-3 px-4 py-3 text-left transition-all border-l-2"
                  style={{
                    background: isActive ? "var(--rtm-surface)" : "transparent",
                    borderLeftColor: isActive ? "#2563EB" : "transparent",
                  }}
                >
                  {/* Status dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                    style={{ background: dotColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold leading-tight truncate"
                      style={{
                        color: isActive ? "var(--rtm-text-primary)" : "var(--rtm-text-secondary)",
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      {clause.order}. {clause.label}
                    </p>
                    {clause.legalLock && (
                      <p className="text-[9px] mt-0.5" style={{ color: "#2563EB" }}>
                        Legal lock
                      </p>
                    )}
                    {!clause.editable && !clause.legalLock && (
                      <p className="text-[9px] mt-0.5" style={{ color: "#7C3AED" }}>
                        Auto-populated
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center panel: editor or preview */}
        <div className="flex-1 min-w-0 overflow-y-auto p-6">
          {previewMode ? (
            <ContractPreviewPanel contract={contract} />
          ) : activeClauseData ? (
            <ContractClauseEditor
              clause={activeClauseData}
              onUpdate={handleClauseUpdate}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                Select a clause from the left panel to begin editing.
              </p>
            </div>
          )}
        </div>

        {/* Right panel: status bar */}
        <div
          className="flex-shrink-0 border-l overflow-y-auto p-4"
          style={{
            width: 280,
            borderColor: "var(--rtm-border)",
            background: "var(--rtm-bg)",
          }}
        >
          <ContractStatusBar
            contract={contract}
            onTogglePreview={handleTogglePreview}
            previewMode={previewMode}
          />
        </div>
      </div>
    </div>
  );
}
