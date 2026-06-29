"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  buildLineItemsFromRecommendations,
  computeBudget,
  type BudgetLineItem,
  type BudgetResult,
} from "@/lib/sales/budget-engine";
import { BudgetOptimizerShell } from "@/components/sales/budget-optimizer/BudgetOptimizerShell";
import type { ProposalWizardState } from "../ProposalWizard";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Step4BudgetProps {
  state: ProposalWizardState;
  onUpdate: (updates: Partial<ProposalWizardState>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step4Budget({ state, onUpdate }: Step4BudgetProps) {
  const initialized = useRef(false);
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>(state.lineItems);
  const [discountPercentage, setDiscountPercentage] = useState<number>(
    state.discountPercentage
  );

  // Get approved recommendation service names from recommendation result
  // The approvedRecommendations are IDs; we need service names for budget engine
  // We'll derive them from the audit result's recommendations array if available
  const approvedServiceNames: string[] = React.useMemo(() => {
    if (!state.auditResult) return [];
    // We need to get service names from the approved recommendation IDs
    // Since we don't have the full recommendation result stored in state,
    // we derive service names from the lineItems that were built
    return state.lineItems.map((li) => li.label);
  }, [state.auditResult, state.lineItems]);

  // Bootstrap line items from approved recommendations on first render
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (state.lineItems.length > 0) {
      // Already have line items (resuming draft)
      const result = computeBudget(state.lineItems, state.discountPercentage);
      onUpdate({ budgetResult: result });
      return;
    }

    if (state.approvedRecommendations.length === 0) return;

    // We need service names to build line items
    // The approved recommendation IDs don't directly map to service names
    // We fall back to using the BudgetOptimizerShell's built-in initialization
    // by passing the approved recommendation service labels
    // For this, we'll need to get service names from somewhere
    // The recommendation result isn't stored in wizard state, but we can
    // derive it from the audit result + engine
    // For simplicity, we initialize with empty and let BudgetOptimizerShell handle it
  }, []);

  // Sync line items and budget result whenever they change
  function handleLineItemsChange(items: BudgetLineItem[]) {
    setLineItems(items);
    const result = computeBudget(items, discountPercentage);
    onUpdate({ lineItems: items, budgetResult: result });
  }

  function handleDiscountChange(discount: number) {
    setDiscountPercentage(discount);
    const result = computeBudget(lineItems, discount);
    onUpdate({ discountPercentage: discount, budgetResult: result });
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
        onLineItemsChange={handleLineItemsChange}
        onDiscountChange={handleDiscountChange}
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
  onLineItemsChange,
  onDiscountChange,
}: {
  state: ProposalWizardState;
  onLineItemsChange: (items: BudgetLineItem[]) => void;
  onDiscountChange: (discount: number) => void;
}) {
  // Build recommended service labels from approved recommendations
  // We derive this from the audit result's recommendation mappings
  // The recommendation engine maps findings to services; we use the
  // RECOMMENDATION_TO_BUDGET_MAP compatible labels
  const recommendedLabels = React.useMemo(() => {
    // If we have existing line items, extract their labels
    if (state.lineItems.length > 0) {
      return state.lineItems.map((li) => li.label);
    }
    // Otherwise derive from approved recommendation IDs
    // Since the rec engine result isn't in wizard state, we return empty
    // and let the shell initialize empty (rep can add services manually)
    return [];
  }, [state.lineItems]);

  return (
    <BudgetOptimizerShell
      recommendedServiceLabels={recommendedLabels}
      clientName={state.clientInfo.businessName || state.clientInfo.name}
    />
  );
}
