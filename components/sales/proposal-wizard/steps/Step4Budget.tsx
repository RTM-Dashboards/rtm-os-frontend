"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  computeBudget,
  type BudgetLineItem,
  type BudgetResult,
} from "@/lib/sales/budget-engine";
import type { ProposalDiscount } from "@/lib/sales/types";
import { BudgetOptimizerShell } from "@/components/sales/budget-optimizer/BudgetOptimizerShell";
import type { ProposalWizardState } from "../ProposalWizard";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Step4BudgetProps {
  state: ProposalWizardState;
  onUpdate: (updates: Partial<ProposalWizardState>) => void;
  /** Approved service names passed directly from ProposalWizard at render time,
   *  bypassing the React setState batching race between Step 3's onUpdate and
   *  handleNext. This prop is always current because ProposalWizard reads
   *  wizardState.approvedRecommendationServiceNames at render time. */
  approvedServiceNames?: string[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step4Budget({ state, onUpdate, approvedServiceNames }: Step4BudgetProps) {
  const initialized = useRef(false);
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>(state.lineItems);
  const [discountPercentage, setDiscountPercentage] = useState<number>(
    state.discountPercentage
  );
  const [discount, setDiscount] = useState<ProposalDiscount>(
    state.discount ?? { type: "none", value: 0, label: "", authorizationNote: "" }
  );

  // Bootstrap budget result when line items already exist (resuming a saved draft).
  // This is a one-time setup on mount; ongoing changes are handled by handleLineItemsChange.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (state.lineItems.length > 0) {
      const result = computeBudget(state.lineItems, state.discountPercentage);
      onUpdate({ budgetResult: result });
    }
    // First-visit service bootstrapping is handled inside BudgetOptimizerShellWrapper
    // via the recommendedServiceLabels prop derived from state.approvedRecommendationServiceNames.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync line items and budget result whenever they change.
  // The shell pre-computes the result using effectiveLineItems (with line-item
  // subtotals applied), so we accept it directly instead of recomputing here.
  function handleLineItemsChange(items: BudgetLineItem[], result: BudgetResult) {
    setLineItems(items);
    onUpdate({ lineItems: items, budgetResult: result });
  }

  function handleDiscountChange(pct: number) {
    setDiscountPercentage(pct);
    const result = computeBudget(lineItems, pct);
    onUpdate({ discountPercentage: pct, budgetResult: result });
  }

  function handleProposalDiscountChange(updated: ProposalDiscount) {
    setDiscount(updated);
    onUpdate({ discount: updated });
  }

  if (state.approvedRecommendations.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#C2410C" }}>
          Return to Step 3 and approve at least one recommendation to build the budget.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          Budget Optimizer
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
          Adjust services, quantities, and pricing. The budget result carries forward to the proposal draft.
        </p>
      </div>

      <BudgetOptimizerShellWrapper
        state={state}
        approvedServiceNames={approvedServiceNames}
        onLineItemsChange={handleLineItemsChange}
        onDiscountChange={handleDiscountChange}
        discount={discount}
        onProposalDiscountChange={handleProposalDiscountChange}
      />

      {state.budgetResult && (
        <div
          className="rounded-xl border p-4"
          style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
        >
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                MONTHLY RECURRING
              </p>
              <p className="text-lg font-black" style={{ color: "#1D4ED8" }}>
                ${state.budgetResult.grandTotalMonthly.toLocaleString()}/mo
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                SETUP FEES
              </p>
              <p className="text-lg font-black" style={{ color: "#C2410C" }}>
                ${(state.budgetResult.totalSetupFees + state.budgetResult.totalOneTimeProjects).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                SERVICES
              </p>
              <p className="text-lg font-black" style={{ color: "#15803D" }}>
                {state.budgetResult.serviceCount}
              </p>
            </div>
            <div className="ml-auto">
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full border"
                style={{ background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0" }}
              >
                Budget configured — ready for proposal draft
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Wrapper that bridges BudgetOptimizerShell to wizard state ────────────────

function BudgetOptimizerShellWrapper({
  state,
  approvedServiceNames,
  onLineItemsChange,
  onDiscountChange,
  discount,
  onProposalDiscountChange,
}: {
  state: ProposalWizardState;
  /** Direct prop from ProposalWizard (render-time value) — takes priority over
   *  state.approvedRecommendationServiceNames to avoid the setState batching
   *  race where Step 4 mounts before Step 3's onUpdate has been processed. */
  approvedServiceNames?: string[];
  onLineItemsChange: (items: BudgetLineItem[], result: BudgetResult) => void;
  onDiscountChange: (discount: number) => void;
  discount: ProposalDiscount;
  onProposalDiscountChange: (discount: ProposalDiscount) => void;
}) {
  // Derive the service label list that BudgetOptimizerShell uses to bootstrap
  // its Service Allocation table.
  //
  // Priority order:
  //   1. approvedServiceNames prop — passed directly from ProposalWizard at
  //      render time, always current regardless of React setState batching.
  //      This fixes the race where Step 3 calls onUpdate({ approvedRecommendationServiceNames })
  //      and then handleNext fires before that setState is processed.
  //   2. state.approvedRecommendationServiceNames — fallback when prop not provided.
  //   3. Existing lineItems labels — covers older drafts saved before
  //      approvedRecommendationServiceNames was introduced.
  //
  // The key prop on BudgetOptimizerShell forces a remount when the approved
  // set changes (e.g. rep navigated Back to Step 3, changed approvals, then
  // returned Forward to Step 4). Without the key, the shell would remain
  // mounted with stale initial labels.
  const recommendedLabels = React.useMemo(() => {
    if (approvedServiceNames && approvedServiceNames.length > 0) {
      return approvedServiceNames;
    }
    if (
      state.approvedRecommendationServiceNames &&
      state.approvedRecommendationServiceNames.length > 0
    ) {
      return state.approvedRecommendationServiceNames;
    }
    if (state.lineItems.length > 0) {
      return state.lineItems.map((li) => li.label);
    }
    return [];
  }, [approvedServiceNames, state.approvedRecommendationServiceNames, state.lineItems]);

  // Use the sorted label list as a stable key so the shell remounts only
  // when the approved service set actually changes, not on every render.
  const shellKey = recommendedLabels.slice().sort().join("|");

  return (
    <BudgetOptimizerShell
      key={shellKey}
      recommendedServiceLabels={recommendedLabels}
      clientName={state.clientInfo.businessName || state.clientInfo.name}
      discount={discount}
      onDiscountChange={onProposalDiscountChange}
      onLineItemsChange={onLineItemsChange}
    />
  );
}
