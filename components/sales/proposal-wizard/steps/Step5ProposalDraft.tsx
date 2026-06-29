"use client";

import React, { useEffect, useRef } from "react";
import { buildProposalWithContext } from "@/lib/sales/proposal-engine";
import type { ProposalDocument } from "@/lib/sales/proposal-engine";
import ProposalBuilderShell from "@/components/sales/proposal-builder/ProposalBuilderShell";
import type { ProposalWizardState } from "../ProposalWizard";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Step5ProposalDraftProps {
  state: ProposalWizardState;
  onUpdate: (updates: Partial<ProposalWizardState>) => void;
  onSaveDraft?: () => void;
  onComplete?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildAuditSummary(state: ProposalWizardState): string {
  const r = state.auditResult;
  if (!r) return "";
  return (
    `Overall Score: ${r.overallScore} (${r.scoringLabel})\n` +
    `Total Findings: ${r.totalFindingCount} ` +
    `(${r.criticalCount} Critical, ${r.highCount} High, ${r.mediumCount} Medium, ${r.lowCount} Low)\n` +
    `Sections Audited: ${r.activeSections.map((s) => s.label).join(", ")}`
  );
}

function buildBudgetSummary(state: ProposalWizardState): string {
  const b = state.budgetResult;
  if (!b) return "";
  return (
    `Monthly Recurring: $${b.grandTotalMonthly.toLocaleString()}/mo\n` +
    `Setup Fees: $${(b.totalSetupFees + b.totalOneTimeProjects).toLocaleString()}\n` +
    `Services: ${b.serviceCount}`
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step5ProposalDraft({
  state,
  onUpdate,
  onSaveDraft,
  onComplete,
}: Step5ProposalDraftProps) {
  const initialized = useRef(false);

  // Get approved service names from line items
  const approvedServiceNames = state.lineItems.map((li) => li.label);

  // Goal labels from selected goals
  const goalLabels = state.selectedGoals;

  const context = {
    goals: goalLabels,
    auditSummary: buildAuditSummary(state),
    recommendedServices: approvedServiceNames,
    budgetSummary: buildBudgetSummary(state),
  };

  // Build proposal document on mount if not already built
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (state.proposalDocument) return; // Resuming draft

    const doc: ProposalDocument = buildProposalWithContext(
      "standard",
      state.clientInfo.businessName || state.clientInfo.name || "Client",
      "Sales Rep",
      context
    );

    onUpdate({ proposalDocument: doc });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completionPct = state.proposalDocument?.completionPercentage ?? 0;
  const isReady = completionPct >= 80;

  if (!state.budgetResult) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#C2410C" }}>
          Complete Step 4 (Budget) before building the proposal draft.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Proposal Draft
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Sections are pre-populated from audit, recommendations, and budget data. Edit editable sections as needed.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                COMPLETION
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-28 rounded-full h-2"
                  style={{ background: "#E5E7EB" }}
                >
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${completionPct}%`,
                      background: isReady ? "#059669" : "#1D4ED8",
                    }}
                  />
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: isReady ? "#059669" : "#1D4ED8" }}
                >
                  {completionPct}%
                </span>
              </div>
            </div>
            {isReady && (
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full border"
                style={{ background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0" }}
              >
                Ready to send
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Proposal builder shell */}
      <ProposalBuilderShell
        clientName={state.clientInfo.businessName || state.clientInfo.name || "Client"}
        preparedBy="Sales Rep"
        templateId="standard"
        context={context}
      />

      {/* Actions */}
      <div
        className="rounded-xl border p-5 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {isReady ? "Proposal is ready to send." : "Continue editing the proposal sections."}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {isReady
              ? "All required sections are complete. Mark as ready to proceed to contracts."
              : `${completionPct}% complete — ${100 - completionPct}% remaining to reach the 80% threshold.`}
          </p>
        </div>
        <div className="flex gap-3">
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              className="px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all hover:opacity-90"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-secondary)",
              }}
            >
              Save as Draft
            </button>
          )}
          {onComplete && (
            <button
              type="button"
              onClick={onComplete}
              disabled={!isReady}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#059669" }}
            >
              Mark as Ready
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
