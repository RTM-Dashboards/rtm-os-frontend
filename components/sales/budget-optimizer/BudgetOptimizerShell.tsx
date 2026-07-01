"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  BUDGET_VIEW_LABELS,
  getBudgetServiceById,
  type BudgetView,
  type BudgetServiceId,
  type BudgetServiceDefinition,
} from "@/lib/sales/budget-config";
import { getServiceLineItems } from "@/lib/sales/recommendation-config";
import {
  buildLineItemsFromRecommendations,
  buildLineItemFromService,
  computeBudget,
  getAvailableServices,
  computeLineItemSubtotal,
  type BudgetLineItem,
  type BudgetResult,
} from "@/lib/sales/budget-engine";
import type { ProposalDiscount } from "@/lib/sales/types";
import { ServiceAllocationTable, type LineItemQuantities } from "./ServiceAllocationTable";
import { BudgetSummaryPanel } from "./BudgetSummaryPanel";
import { BudgetTotalsBar } from "./BudgetTotalsBar";

// ─── Props ────────────────────────────────────────────────────────────────────

const DEFAULT_DISCOUNT: ProposalDiscount = {
  type: "none",
  value: 0,
  label: "",
  authorizationNote: "",
};

export interface BudgetOptimizerShellProps {
  recommendedServiceLabels?: string[];
  clientName?: string;
  discount?: ProposalDiscount;
  onDiscountChange?: (discount: ProposalDiscount) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds a default LineItemQuantities map for a single service using each
 * line item's defaultQuantity. Used when a service is first added.
 */
function buildDefaultLineItemQuantities(
  catalogId: string
): Record<string, number> {
  const lineItems = getServiceLineItems(catalogId);
  const result: Record<string, number> = {};
  for (const li of lineItems) {
    result[li.id] = li.defaultQuantity;
  }
  return result;
}

/**
 * Recomputes BudgetLineItem.monthlySubtotal for a service based on its current
 * line item quantities so the existing computeBudget engine sees up-to-date values.
 */
function applyLineItemSubtotalToBudgetItem(
  item: BudgetLineItem,
  lineItemQtys: Record<string, number>
): BudgetLineItem {
  const def = getBudgetServiceById(item.serviceId);
  const catalogId = def?.catalogId ?? "";
  const lineItemDefs = getServiceLineItems(catalogId);

  if (lineItemDefs.length === 0) return item;

  const computedMonthly = lineItemDefs.reduce((sum, li) => {
    const qty = lineItemQtys[li.id] ?? li.defaultQuantity;
    const clamped = Math.max(li.minQuantity, Math.min(li.maxQuantity, qty));
    return sum + computeLineItemSubtotal(li, clamped);
  }, 0);

  return {
    ...item,
    unitMonthlyPrice: computedMonthly,
    monthlySubtotal: computedMonthly,
  };
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function BudgetOptimizerShell({
  recommendedServiceLabels,
  clientName,
  discount: discountProp,
  onDiscountChange,
}: BudgetOptimizerShellProps) {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([]);
  const [activeView, setActiveView] = useState<BudgetView>("byService");
  // Discount: controlled when discountProp + onDiscountChange provided; internal otherwise
  const [internalDiscount, setInternalDiscount] = useState<ProposalDiscount>(
    discountProp ?? DEFAULT_DISCOUNT
  );
  const discount = discountProp ?? internalDiscount;

  /**
   * Per-service line item quantities: { [budgetServiceId]: { [lineItemId]: qty } }
   * Initialized to each line item's defaultQuantity when a service is added.
   */
  const [lineItemQuantities, setLineItemQuantities] = useState<LineItemQuantities>({});

  // Track whether the initial bootstrap from recommendations has run so we
  // do not overwrite manual edits the rep makes after the table is populated.
  const bootstrapped = useRef(false);

  // ─── Bootstrap from recommendations ───────────────────────────────────────
  // Run whenever recommendedServiceLabels becomes non-empty for the first time.
  // The empty-dep form was a bug: if the prop arrived as [] on mount (because
  // wizard state hadn't propagated yet) and then changed to a real list, the
  // table stayed permanently empty.
  useEffect(() => {
    if (bootstrapped.current) return;
    if (!recommendedServiceLabels || recommendedServiceLabels.length === 0) return;

    bootstrapped.current = true;
    const items = buildLineItemsFromRecommendations(recommendedServiceLabels);
    setLineItems(items);

    const qtys: LineItemQuantities = {};
    for (const item of items) {
      const def = getBudgetServiceById(item.serviceId);
      if (def?.catalogId) {
        qtys[item.serviceId] = buildDefaultLineItemQuantities(def.catalogId);
      }
    }
    setLineItemQuantities(qtys);
  }, [recommendedServiceLabels]);

  // ─── Effective line items with line-item-based subtotals ───────────────────
  const effectiveLineItems = useMemo<BudgetLineItem[]>(() => {
    return lineItems.map((item) => {
      const qtys = lineItemQuantities[item.serviceId] ?? {};
      return applyLineItemSubtotalToBudgetItem(item, qtys);
    });
  }, [lineItems, lineItemQuantities]);

  // ─── Derived budget result ──────────────────────────────────────────────────
  const budgetResult: BudgetResult = useMemo(
    () => computeBudget(effectiveLineItems, 0),
    [effectiveLineItems]
  );

  const availableServices: BudgetServiceDefinition[] = useMemo(
    () => getAvailableServices(lineItems.map((i) => i.serviceId)),
    [lineItems]
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleAddService(serviceId: BudgetServiceId) {
    const newItem = buildLineItemFromService(serviceId);
    setLineItems((prev) => [...prev, newItem]);

    const def = getBudgetServiceById(serviceId);
    if (def?.catalogId) {
      const defaults = buildDefaultLineItemQuantities(def.catalogId);
      setLineItemQuantities((prev) => ({
        ...prev,
        [serviceId]: defaults,
      }));
    }
  }

  function handleRemoveService(serviceId: BudgetServiceId) {
    setLineItems((prev) => prev.filter((i) => i.serviceId !== serviceId));
    setLineItemQuantities((prev) => {
      const next = { ...prev };
      delete next[serviceId];
      return next;
    });
  }

  function handleUpdateLineItem(
    serviceId: BudgetServiceId,
    changes: Partial<
      Pick<BudgetLineItem, "quantity" | "unitMonthlyPrice" | "setupFee">
    >
  ) {
    const updated = buildLineItemFromService(serviceId, changes);
    setLineItems((prev) =>
      prev.map((i) => (i.serviceId === serviceId ? updated : i))
    );
  }

  const handleLineItemQuantityChange = useCallback(
    (serviceId: BudgetServiceId, lineItemId: string, quantity: number) => {
      setLineItemQuantities((prev) => ({
        ...prev,
        [serviceId]: {
          ...(prev[serviceId] ?? {}),
          [lineItemId]: quantity,
        },
      }));
    },
    []
  );

  function handleDiscountChange(updatedDiscount: ProposalDiscount) {
    setInternalDiscount(updatedDiscount);
    onDiscountChange?.(updatedDiscount);
  }

  function handleViewToggle(view: BudgetView) {
    setActiveView(view);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-28">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--rtm-accent)" }}
          >
            Sales
          </p>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Budget Optimizer
            {clientName && (
              <span
                className="ml-3 text-base font-semibold"
                style={{ color: "var(--rtm-text-secondary)" }}
              >
                — {clientName}
              </span>
            )}
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--rtm-text-secondary)" }}
          >
            Build and refine the service budget. Click any service row to expand
            and adjust individual line item quantities.
          </p>
        </div>


      </div>



      {/* ── View Toggle ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 border rounded-lg p-1 w-fit"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        {(Object.keys(BUDGET_VIEW_LABELS) as BudgetView[]).map((view) => (
          <button
            key={view}
            onClick={() => handleViewToggle(view)}
            className="px-4 py-1.5 rounded-md text-sm font-semibold transition-all"
            style={{
              background:
                activeView === view ? "var(--rtm-accent)" : "transparent",
              color:
                activeView === view ? "#fff" : "var(--rtm-text-secondary)",
            }}
          >
            {BUDGET_VIEW_LABELS[view]}
          </button>
        ))}
      </div>

      {/* ── Service Allocation Table ──────────────────────────────────────── */}
      <ServiceAllocationTable
        lineItems={effectiveLineItems}
        lineItemQuantities={lineItemQuantities}
        onUpdate={handleUpdateLineItem}
        onRemove={handleRemoveService}
        onAdd={handleAddService}
        onLineItemQuantityChange={handleLineItemQuantityChange}
        availableServices={availableServices}
      />

      {/* ── Budget Summary Panel ──────────────────────────────────────────── */}
      <BudgetSummaryPanel
        budgetResult={budgetResult}
        activeView={activeView}
        discount={discount}
        onDiscountChange={handleDiscountChange}
      />

      {/* ── Sticky Totals Bar ─────────────────────────────────────────────── */}
      <BudgetTotalsBar budgetResult={budgetResult} />
    </div>
  );
}
