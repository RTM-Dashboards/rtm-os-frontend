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
  /** Called whenever the effective line items or budget result change.
   *  Consumers (e.g. ProposalWizard Step 4) use this to sync wizard state
   *  so that validateStep(4) can correctly detect a populated budget. */
  onLineItemsChange?: (items: BudgetLineItem[], result: BudgetResult) => void;
  /** Target monthly budget for the optimizer panel (optional). When set,
   *  the shell renders a target-budget suggestion overlay. */
  targetBudget?: number | null;
  onTargetBudgetChange?: (value: number | null) => void;
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
 *
 * When a rep has manually entered a monthly price override (manualMonthlyPrice is
 * provided and non-null), the line-item-based computation is skipped and the
 * manual price is used directly, preserving the rep's custom rate.
 */
function applyLineItemSubtotalToBudgetItem(
  item: BudgetLineItem,
  lineItemQtys: Record<string, number>,
  manualMonthlyPrice?: number | null
): BudgetLineItem {
  // Rep has explicitly entered a custom monthly price — respect it, skip line-item override.
  if (manualMonthlyPrice != null) {
    return {
      ...item,
      unitMonthlyPrice: manualMonthlyPrice,
      monthlySubtotal: item.quantity * manualMonthlyPrice,
    };
  }

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
  onLineItemsChange,
  targetBudget: targetBudgetProp,
  onTargetBudgetChange,
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

  /**
   * Per-service manual monthly price overrides set by the rep.
   * When present for a service, bypasses line-item-based computation so the
   * rep's custom rate flows directly into monthlySubtotal and all totals.
   */
  const [manualMonthlyPrices, setManualMonthlyPrices] = useState<Record<string, number>>({});

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
      const manualPrice = manualMonthlyPrices[item.serviceId] ?? null;
      return applyLineItemSubtotalToBudgetItem(item, qtys, manualPrice);
    });
  }, [lineItems, lineItemQuantities, manualMonthlyPrices]);

  // ─── Derived budget result ──────────────────────────────────────────────────
  const budgetResult: BudgetResult = useMemo(
    () => computeBudget(effectiveLineItems, 0),
    [effectiveLineItems]
  );

  const availableServices: BudgetServiceDefinition[] = useMemo(
    () => getAvailableServices(lineItems.map((i) => i.serviceId)),
    [lineItems]
  );

  // ─── Propagate line items + budget result to parent ────────────────────────
  // Fires whenever effectiveLineItems or budgetResult changes, so the wizard
  // state (state.lineItems / state.budgetResult) stays current.
  const onLineItemsChangeRef = useRef(onLineItemsChange);
  onLineItemsChangeRef.current = onLineItemsChange;
  useEffect(() => {
    if (effectiveLineItems.length === 0) return;
    onLineItemsChangeRef.current?.(effectiveLineItems, budgetResult);
  }, [effectiveLineItems, budgetResult]);

  // ─── Target budget state (controlled if prop provided, else internal) ──────
  const [internalTargetBudget, setInternalTargetBudget] = useState<number | null>(
    targetBudgetProp ?? null
  );
  const targetBudget = targetBudgetProp !== undefined ? targetBudgetProp : internalTargetBudget;

  function handleTargetBudgetChange(value: number | null) {
    setInternalTargetBudget(value);
    onTargetBudgetChange?.(value);
  }

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
    // Clear any stale manual price for this service (e.g. re-added after removal)
    setManualMonthlyPrices((prev) => {
      const next = { ...prev };
      delete next[serviceId];
      return next;
    });
  }

  function handleRemoveService(serviceId: BudgetServiceId) {
    setLineItems((prev) => prev.filter((i) => i.serviceId !== serviceId));
    setLineItemQuantities((prev) => {
      const next = { ...prev };
      delete next[serviceId];
      return next;
    });
    setManualMonthlyPrices((prev) => {
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
    // Record manual monthly price override so effectiveLineItems respects it
    // instead of overwriting with line-item-based computation.
    if (changes.unitMonthlyPrice != null) {
      setManualMonthlyPrices((prev) => ({
        ...prev,
        [serviceId]: changes.unitMonthlyPrice as number,
      }));
    }
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
            type="button"
            onClick={() => handleViewToggle(view)}
            className="px-4 py-1.5 rounded-md text-sm font-semibold transition-colors outline-none focus:outline-none"
            style={{
              background:
                activeView === view ? "var(--rtm-accent)" : "transparent",
              color:
                activeView === view ? "#fff" : "var(--rtm-text-secondary)",
              boxShadow: "none",
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

      {/* ── Target Budget Optimizer ───────────────────────────────────────── */}
      <TargetBudgetPanel
        lineItems={effectiveLineItems}
        budgetResult={budgetResult}
        targetBudget={targetBudget}
        onTargetBudgetChange={handleTargetBudgetChange}
        onApplyAdjustment={(serviceIdsToKeep) => {
          setLineItems((prev) => prev.filter((i) => serviceIdsToKeep.has(i.serviceId)));
          setLineItemQuantities((prev) => {
            const next: LineItemQuantities = {};
            for (const id of serviceIdsToKeep) {
              if (prev[id]) next[id] = prev[id];
            }
            return next;
          });
        }}
      />

      {/* ── Sticky Totals Bar ─────────────────────────────────────────────── */}
      <BudgetTotalsBar budgetResult={budgetResult} />
    </div>
  );
}

// ─── TargetBudgetPanel ──────────────────────────────────────────────────────────────
//
// Given a target monthly budget, compute which services fit and which would
// need to be removed. Presents a non-destructive suggestion list with a single
// “Apply” action that removes flagged services from the live line items.
//
// Algorithm:
//   1. Sort services by priority: recurring first (ordered by monthly subtotal
//      descending — most expensive first), then one-time services last.
//   2. Greedily walk the sorted list, accumulating monthly recurring cost.
//   3. If the accumulated monthly cost exceeds the target, mark that service
//      and all subsequent recurring services as “exceeds target” (remove
//      suggestions). One-time services are shown but not counted against the
//      monthly target.
//   4. Render two lists: “Keep” and “Remove to hit target”.
//   5. "Apply" button removes only the flagged services from the live list.
// ─────────────────────────────────────────────────────────────────────────────

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface TargetBudgetPanelProps {
  lineItems: BudgetLineItem[];
  budgetResult: BudgetResult;
  targetBudget: number | null;
  onTargetBudgetChange: (value: number | null) => void;
  onApplyAdjustment: (serviceIdsToKeep: Set<BudgetServiceId>) => void;
}

interface AdjustmentSuggestion {
  item: BudgetLineItem;
  keep: boolean;
  /** Running monthly total after including this item (recurring only). */
  runningMonthly: number;
}

function computeAdjustmentSuggestions(
  lineItems: BudgetLineItem[],
  targetMonthly: number
): AdjustmentSuggestion[] {
  // Sort: recurring items ordered by monthlySubtotal descending (highest
  // priority / most expensive first so cheaper services survive), then one-time.
  // Rationale: cheaper recurring services are easier to keep under target;
  // if we want to hit a budget we drop the most expensive first.
  const recurring = lineItems
    .filter((i) => i.isRecurring)
    .sort((a, b) => b.monthlySubtotal - a.monthlySubtotal);
  const oneTime = lineItems.filter((i) => !i.isRecurring);

  const suggestions: AdjustmentSuggestion[] = [];
  let running = 0;
  let budgetExceeded = false;

  for (const item of recurring) {
    const next = running + item.monthlySubtotal;
    if (!budgetExceeded && next <= targetMonthly) {
      running = next;
      suggestions.push({ item, keep: true, runningMonthly: running });
    } else {
      budgetExceeded = true;
      suggestions.push({ item, keep: false, runningMonthly: running });
    }
  }

  // One-time services: shown informationally, always kept (not counted against monthly target)
  for (const item of oneTime) {
    suggestions.push({ item, keep: true, runningMonthly: running });
  }

  return suggestions;
}

function TargetBudgetPanel({
  lineItems,
  budgetResult,
  targetBudget,
  onTargetBudgetChange,
  onApplyAdjustment,
}: TargetBudgetPanelProps) {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  // Reset applied state when line items change
  const prevLineCountRef = useRef(lineItems.length);
  if (prevLineCountRef.current !== lineItems.length) {
    prevLineCountRef.current = lineItems.length;
    if (applied) setApplied(false);
  }

  const suggestions = useMemo<AdjustmentSuggestion[]>(() => {
    if (!targetBudget || targetBudget <= 0 || lineItems.length === 0) return [];
    return computeAdjustmentSuggestions(lineItems, targetBudget);
  }, [lineItems, targetBudget]);

  const toRemove = suggestions.filter((s) => !s.keep && s.item.isRecurring);
  const projectedMonthly = suggestions
    .filter((s) => s.keep && s.item.isRecurring)
    .reduce((sum, s) => sum + s.item.monthlySubtotal, 0);

  const alreadyWithinTarget =
    targetBudget !== null &&
    targetBudget > 0 &&
    budgetResult.totalMonthlyRecurring <= targetBudget;

  function handleApply() {
    const idsToKeep = new Set<BudgetServiceId>(
      suggestions.filter((s) => s.keep).map((s) => s.item.serviceId)
    );
    onApplyAdjustment(idsToKeep);
    setApplied(true);
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)" }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-left transition-colors hover:opacity-80"
        style={{
          background: "var(--rtm-bg)",
          borderBottom: open ? "1px solid var(--rtm-border)" : undefined,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Target Budget Optimizer
          </span>
          {targetBudget && targetBudget > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                background: alreadyWithinTarget ? "#F0FDF4" : "#FFF7ED",
                color: alreadyWithinTarget ? "#15803D" : "#C2410C",
                borderColor: alreadyWithinTarget ? "#BBF7D0" : "#FED7AA",
              }}
            >
              Target: {formatUSD(targetBudget)}/mo
              {alreadyWithinTarget ? " ✓ within target" : " — over by " + formatUSD(budgetResult.totalMonthlyRecurring - targetBudget)}
            </span>
          )}
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          {open ? "Hide" : "Set target"}
        </span>
      </button>

      {open && (
        <div className="p-5 space-y-5" style={{ background: "var(--rtm-surface)" }}>
          {/* Target input */}
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "var(--rtm-text-secondary)" }}
            >
              Target Monthly Budget
              <span
                className="ml-1 font-normal text-[11px]"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                — recurring services only; one-time fees are not counted
              </span>
            </label>
            <div className="flex items-center gap-0">
              <span
                className="px-3 py-2 rounded-l-lg border border-r-0 text-sm font-semibold"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: "var(--rtm-border)",
                  color: "var(--rtm-text-muted)",
                }}
              >
                $
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={targetBudget ?? ""}
                placeholder="e.g. 3000"
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  onTargetBudgetChange(isNaN(raw) || raw <= 0 ? null : raw);
                  setApplied(false);
                }}
                className="flex-1 px-3 py-2 border border-l-0 rounded-r-lg text-sm outline-none"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: "var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              />
              {targetBudget && targetBudget > 0 && (
                <button
                  type="button"
                  onClick={() => { onTargetBudgetChange(null); setApplied(false); }}
                  className="ml-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all hover:opacity-80"
                  style={{
                    background: "var(--rtm-bg)",
                    borderColor: "var(--rtm-border)",
                    color: "var(--rtm-text-muted)",
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* No target set */}
          {(!targetBudget || targetBudget <= 0) && (
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Enter a target monthly budget above to see which services fit and which would need to be removed.
            </p>
          )}

          {/* Already within target */}
          {alreadyWithinTarget && lineItems.length > 0 && (
            <div
              className="rounded-lg border px-4 py-3"
              style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
            >
              <p className="text-sm font-semibold" style={{ color: "#15803D" }}>
                ✓ Current budget ({formatUSD(budgetResult.totalMonthlyRecurring)}/mo) is already within your target of {formatUSD(targetBudget!)}/mo.
              </p>
              <p className="text-xs mt-1" style={{ color: "#16A34A" }}>
                No services need to be removed. You have {formatUSD(targetBudget! - budgetResult.totalMonthlyRecurring)}/mo of remaining budget capacity.
              </p>
            </div>
          )}

          {/* Suggestions list */}
          {!alreadyWithinTarget && suggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>
                  Adjustment Plan
                </p>
                <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  Projected: {formatUSD(projectedMonthly)}/mo (target: {formatUSD(targetBudget!)})
                </p>
              </div>

              {/* Keep list */}
              {suggestions.filter((s) => s.keep).length > 0 && (
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{ borderColor: "#BBF7D0" }}
                >
                  <div
                    className="px-4 py-2 border-b"
                    style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#15803D" }}>
                      Keep ({suggestions.filter((s) => s.keep).length})
                    </p>
                  </div>
                  <div className="divide-y" style={{ borderColor: "#BBF7D0" }}>
                    {suggestions.filter((s) => s.keep).map((s) => (
                      <div
                        key={s.item.serviceId}
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{ background: "#F7FFF9" }}
                      >
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "#15803D" }}>
                            {s.item.label}
                          </p>
                          {!s.item.isRecurring && (
                            <p className="text-[10px]" style={{ color: "#16A34A" }}>One-time — not counted against monthly budget</p>
                          )}
                        </div>
                        <span className="text-xs font-bold" style={{ color: "#15803D" }}>
                          {s.item.isRecurring ? formatUSD(s.item.monthlySubtotal) + "/mo" : formatUSD(s.item.setupSubtotal) + " one-time"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remove list */}
              {toRemove.length > 0 && (
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{ borderColor: "#FED7AA" }}
                >
                  <div
                    className="px-4 py-2 border-b"
                    style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#C2410C" }}>
                      Remove to hit target ({toRemove.length})
                    </p>
                  </div>
                  <div className="divide-y" style={{ borderColor: "#FED7AA" }}>
                    {toRemove.map((s) => (
                      <div
                        key={s.item.serviceId}
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{ background: "#FFFBF5" }}
                      >
                        <p className="text-xs font-semibold" style={{ color: "#C2410C" }}>
                          {s.item.label}
                        </p>
                        <span className="text-xs font-bold" style={{ color: "#C2410C" }}>
                          -{formatUSD(s.item.monthlySubtotal)}/mo
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply button */}
              {toRemove.length > 0 && !applied && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "#C2410C" }}
                >
                  Apply — Remove {toRemove.length} service{toRemove.length !== 1 ? "s" : ""} to hit {formatUSD(targetBudget!)}/mo target
                </button>
              )}
              {applied && (
                <div
                  className="rounded-lg border px-4 py-3"
                  style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
                >
                  <p className="text-sm font-semibold" style={{ color: "#15803D" }}>
                    ✓ Adjustment applied. Review the updated Service Allocation table above.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No services */}
          {targetBudget && targetBudget > 0 && lineItems.length === 0 && (
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Add services to the budget above to see adjustment suggestions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
