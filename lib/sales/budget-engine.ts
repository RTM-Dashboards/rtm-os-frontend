// RTM OS — Sales Budget Engine
// ─────────────────────────────────────────────────────────────────────────────
// Pure functions only. No React. No UI imports.
// Consumes budget-config.ts → produces BudgetResult.
//
// Discount rules: applied to recurring totals only. Setup fees are never discounted.
// ─────────────────────────────────────────────────────────────────────────────

import {
  RECOMMENDATION_TO_BUDGET_MAP,
  MAX_DISCOUNT_PERCENTAGE,
  MAX_FLAT_DISCOUNT_MONTHLY,
  MAX_FLAT_DISCOUNT_SETUP,
  type BudgetServiceId,
  type BudgetServiceDefinition,
} from "./budget-config";
// BUDGET_SERVICE_CATALOG and getBudgetServiceById are intentionally NOT imported
// here at runtime. The hardcoded array is seed data only (scripts/seed-service-catalogue.ts).
// Server-side service resolution uses getServiceByIdFromDb from catalogue-db.ts;
// client-side components receive prefetched BudgetServiceDefinition[] from the DB API
// and pass it as prefetchedDef to buildLineItemFromService.
import {
  getServiceLineItems,
  getServiceById,
} from "./recommendation-config";
import type {
  ServiceLineItem,
  LineItemSelection,
  ServiceBudgetBreakdown,
  ProposalDiscount,
  DiscountedBudgetSummary,
} from "./types";

// ─── Line Item ────────────────────────────────────────────────────────────────

export interface BudgetLineItem {
  serviceId: BudgetServiceId;
  label: string;
  department: string;
  quantity: number;
  unitMonthlyPrice: number;
  setupFee: number;
  /** Computed: quantity × unitMonthlyPrice */
  monthlySubtotal: number;
  /** Computed: setupFee (flat — not multiplied by quantity) */
  setupSubtotal: number;
  isRecurring: boolean;

  // ─── Price and name snapshot ──────────────────────────────────────────────────────────────────────────────
  //
  // These three fields capture the catalogue values AT THE MOMENT the line item
  // was added to a proposal. A proposal is a document a client agrees to; it
  // must not change retroactively because someone edited the catalogue.
  //
  // Proposal and contract display surfaces read these snapshot values, NOT the
  // live service_catalog_items row. The live row is only read at the moment the
  // item is first created (inside buildLineItemFromService).
  //
  // snapshotName           — service name as it read when added (== label at creation time)
  // snapshotUnitMonthlyPrice — unit monthly price from the catalogue at that moment
  // snapshotSetupFee       — setup fee from the catalogue at that moment
  //
  // Existing line items stored before this field existed will have undefined
  // here; display code should fall back to label / unitMonthlyPrice / setupFee
  // in that case so old proposals continue to render correctly.
  snapshotName?: string;
  snapshotUnitMonthlyPrice?: number;
  snapshotSetupFee?: number;
}

// ─── Budget Result ────────────────────────────────────────────────────────────

export interface BudgetResult {
  lineItems: BudgetLineItem[];
  /** Sum of all recurring monthly subtotals */
  totalMonthlyRecurring: number;
  /** Sum of setup fees for recurring services */
  totalSetupFees: number;
  /** Sum of setup fees for non-recurring (project) services */
  totalOneTimeProjects: number;
  /** Recurring + setup + one-time (month 1) */
  grandTotalFirstMonth: number;
  /** Recurring only (month 2+) */
  grandTotalMonthly: number;
  /** Discount applied to recurring totals */
  discountAmount: number;
  /** grandTotalFirstMonth after discount on recurring portion */
  discountedFirstMonth: number;
  /** grandTotalMonthly after discount */
  discountedMonthly: number;
  serviceCount: number;
  departmentCount: number;
}

// ─── computeBudget ────────────────────────────────────────────────────────────

/**
 * Computes all totals from lineItems.
 * Discount applies to recurring totals only; setup fees are never discounted.
 */
export function computeBudget(
  lineItems: BudgetLineItem[],
  discountPercentage: number
): BudgetResult {
  let totalMonthlyRecurring = 0;
  let totalSetupFees = 0;
  let totalOneTimeProjects = 0;

  for (const item of lineItems) {
    if (item.isRecurring) {
      totalMonthlyRecurring += item.monthlySubtotal;
      totalSetupFees += item.setupSubtotal;
    } else {
      totalOneTimeProjects += item.setupSubtotal;
    }
  }

  const grandTotalFirstMonth =
    totalMonthlyRecurring + totalSetupFees + totalOneTimeProjects;
  const grandTotalMonthly = totalMonthlyRecurring;

  const clampedDiscount = Math.max(0, Math.min(100, discountPercentage));
  const discountAmount =
    clampedDiscount > 0
      ? parseFloat(((totalMonthlyRecurring * clampedDiscount) / 100).toFixed(2))
      : 0;

  const discountedMonthly = parseFloat(
    (totalMonthlyRecurring - discountAmount).toFixed(2)
  );
  const discountedFirstMonth = parseFloat(
    (discountedMonthly + totalSetupFees + totalOneTimeProjects).toFixed(2)
  );

  const departments = new Set(lineItems.map((i) => i.department));

  return {
    lineItems,
    totalMonthlyRecurring,
    totalSetupFees,
    totalOneTimeProjects,
    grandTotalFirstMonth,
    grandTotalMonthly,
    discountAmount,
    discountedFirstMonth,
    discountedMonthly,
    serviceCount: lineItems.length,
    departmentCount: departments.size,
  };
}

// ─── buildLineItemFromService ─────────────────────────────────────────────────

/**
 * Builds a BudgetLineItem from a service definition.
 *
 * IMPORTANT: prefetchedDef MUST be supplied. The hardcoded BUDGET_SERVICE_CATALOG
 * array is no longer used as a fallback — it is seed data only. Callers must
 * provide the definition fetched from service_catalog_items:
 *
 *   Server-side: await getServiceByIdFromDb(id)  → catalogue-db.ts
 *   Client-side: getCatalogServiceById(id) from the DB API fetch in BudgetOptimizerShell
 *
 * This ensures services added via the config page (not present in the seed array)
 * always resolve correctly.
 */
export function buildLineItemFromService(
  serviceId: BudgetServiceId,
  overrides?: Partial<
    Pick<BudgetLineItem, "quantity" | "unitMonthlyPrice" | "setupFee">
  >,
  prefetchedDef?: BudgetServiceDefinition
): BudgetLineItem {
  const def = prefetchedDef;
  if (!def) {
    throw new Error(
      `[budget-engine] Unknown serviceId: "${serviceId}". prefetchedDef was not supplied — ` +
      `resolve the service via getServiceByIdFromDb (server) or the DB catalog API (client) ` +
      `and pass it as the third argument.`
    );
  }

  const quantity = overrides?.quantity ?? def.defaultQuantity;
  const unitMonthlyPrice =
    overrides?.unitMonthlyPrice ?? def.defaultMonthlyPrice;
  const setupFee = overrides?.setupFee ?? def.defaultSetupFee;

  return {
    serviceId: def.id,
    label: def.label,
    department: def.department,
    quantity,
    unitMonthlyPrice,
    setupFee,
    monthlySubtotal: quantity * unitMonthlyPrice,
    setupSubtotal: setupFee,
    isRecurring: def.isRecurring,
    // Snapshot: freeze catalogue values at creation time so renaming or
    // re-pricing a service in the config page cannot alter existing proposals.
    snapshotName: def.label,
    snapshotUnitMonthlyPrice: def.defaultMonthlyPrice,
    snapshotSetupFee: def.defaultSetupFee,
  };
}

// ─── buildLineItemsFromRecommendations ────────────────────────────────────────

/**
 * Accepts Recommendation Engine service label strings, maps them through
 * RECOMMENDATION_TO_BUDGET_MAP, and returns BudgetLineItem[].
 * Unmatched labels are silently skipped.
 */
export function buildLineItemsFromRecommendations(
  recommendedServiceLabels: string[],
  dbCatalog?: BudgetServiceDefinition[]
): BudgetLineItem[] {
  const items: BudgetLineItem[] = [];
  const seen = new Set<BudgetServiceId>();
  for (const label of recommendedServiceLabels) {
    const budgetId = RECOMMENDATION_TO_BUDGET_MAP[label];
    if (!budgetId) continue;
    if (seen.has(budgetId)) continue;
    seen.add(budgetId);
    try {
      const prefetched = dbCatalog?.find((s) => s.id === budgetId);
      items.push(buildLineItemFromService(budgetId, undefined, prefetched));
    } catch {
      // Skip if service is missing from catalogue
    }
  }
  return items;
}

// ─── getAvailableServices ─────────────────────────────────────────────────────

/**
 * Returns services from dbCatalog that are not in existingIds.
 *
 * dbCatalog must be the list fetched from service_catalog_items (the DB),
 * not the hardcoded seed array. On the client this comes from BudgetOptimizerShell;
 * on the server use getServiceCatalogFromDb() from catalogue-db.ts.
 */
export function getAvailableServices(
  existingIds: BudgetServiceId[],
  dbCatalog: BudgetServiceDefinition[]
): BudgetServiceDefinition[] {
  const existingSet = new Set(existingIds);
  return dbCatalog.filter((s) => !existingSet.has(s.id));
}

// ─── Line Item Engine (pure functions) ────────────────────────────────────────────────

/**
 * Computes the subtotal for a single line item given a chosen quantity.
 * Flat-included items always return their unitPrice regardless of quantity.
 */
export function computeLineItemSubtotal(
  lineItem: ServiceLineItem,
  quantity: number
): number {
  if (lineItem.isIncludedFlat) {
    return lineItem.unitPrice;
  }
  return lineItem.unitPrice * quantity;
}

/**
 * Computes the full budget breakdown for one service given a map of line item
 * quantity overrides. Any line item not in the map defaults to its
 * defaultQuantity. Quantities are clamped to [minQuantity, maxQuantity].
 *
 * The service's existing setupFee from SERVICE_CATALOG is preserved unchanged.
 * Falls back to a single implicit line item using monthlyFee when no line items
 * are defined (defensive — should not occur after full catalog population).
 */
export function computeServiceBudgetBreakdown(
  serviceId: string,
  quantities: Record<string, number>
): ServiceBudgetBreakdown {
  const catalogEntry = getServiceById(serviceId);
  const lineItemDefs = getServiceLineItems(serviceId);
  const serviceName = catalogEntry?.name ?? serviceId;
  const setupFee = catalogEntry?.setupFee ?? 0;

  // Defensive fallback: if no line items defined, treat flat monthlyFee as one item.
  if (lineItemDefs.length === 0) {
    const monthlyFee = catalogEntry?.monthlyFee ?? 0;
    const fallbackSelection: LineItemSelection = {
      lineItemId: `${serviceId}-flat`,
      quantity: 1,
      subtotal: monthlyFee,
    };
    return {
      serviceId,
      serviceName,
      lineItemSelections: [fallbackSelection],
      computedMonthlySubtotal: monthlyFee,
      setupFee,
    };
  }

  const lineItemSelections: LineItemSelection[] = lineItemDefs.map((li) => {
    const rawQty = quantities[li.id] ?? li.defaultQuantity;
    const quantity = Math.max(li.minQuantity, Math.min(li.maxQuantity, rawQty));
    const subtotal = computeLineItemSubtotal(li, quantity);
    return { lineItemId: li.id, quantity, subtotal };
  });

  const computedMonthlySubtotal = lineItemSelections.reduce(
    (sum, sel) => sum + sel.subtotal,
    0
  );

  return {
    serviceId,
    serviceName,
    lineItemSelections,
    computedMonthlySubtotal,
    setupFee,
  };
}

/**
 * Sums all service breakdowns into overall monthly, setup, and grand totals.
 * Grand total formula matches the existing Budget Summary:
 *   grandTotal = totalMonthly + totalSetup
 * (equivalent to grandTotalFirstMonth in computeBudget for the recurring+setup case)
 */
export function recomputeBudgetTotals(
  serviceBreakdowns: ServiceBudgetBreakdown[]
): { totalMonthly: number; totalSetup: number; grandTotal: number } {
  const totalMonthly = serviceBreakdowns.reduce(
    (sum, b) => sum + b.computedMonthlySubtotal,
    0
  );
  const totalSetup = serviceBreakdowns.reduce(
    (sum, b) => sum + b.setupFee,
    0
  );
  const grandTotal = totalMonthly + totalSetup;
  return { totalMonthly, totalSetup, grandTotal };
}

// ─── computeDiscountedSummary ──────────────────────────────────────────────────────────

/**
 * Applies a ProposalDiscount to pre-computed totals and returns a fully
 * resolved DiscountedBudgetSummary. Pure function — never mutates inputs.
 * All monetary values are rounded to 2 decimal places.
 *
 * Clamping rules:
 *   percentage types: discount.value capped at MAX_DISCOUNT_PERCENTAGE
 *   flat-monthly: capped at MAX_FLAT_DISCOUNT_MONTHLY AND totalMonthlyRecurring
 *   flat-setup:   capped at MAX_FLAT_DISCOUNT_SETUP AND totalSetupFees
 *   custom:       capped at totalMonthlyRecurring (no negative totals)
 */
export function computeDiscountedSummary(
  totalMonthlyRecurring: number,
  totalSetupFees: number,
  discount: ProposalDiscount
): DiscountedBudgetSummary {
  const round2 = (n: number) => parseFloat(n.toFixed(2));

  let discountAmountMonthly = 0;
  let discountAmountSetup = 0;

  switch (discount.type) {
    case "none":
      break;

    case "percentage-monthly": {
      const pct = Math.min(discount.value, MAX_DISCOUNT_PERCENTAGE);
      discountAmountMonthly = totalMonthlyRecurring * (pct / 100);
      break;
    }

    case "flat-monthly": {
      const raw = Math.min(discount.value, MAX_FLAT_DISCOUNT_MONTHLY);
      discountAmountMonthly = Math.min(raw, totalMonthlyRecurring);
      break;
    }

    case "percentage-setup": {
      const pct = Math.min(discount.value, MAX_DISCOUNT_PERCENTAGE);
      discountAmountSetup = totalSetupFees * (pct / 100);
      break;
    }

    case "flat-setup": {
      const raw = Math.min(discount.value, MAX_FLAT_DISCOUNT_SETUP);
      discountAmountSetup = Math.min(raw, totalSetupFees);
      break;
    }

    case "custom": {
      discountAmountMonthly = Math.min(discount.value, totalMonthlyRecurring);
      break;
    }
  }

  discountAmountMonthly = round2(discountAmountMonthly);
  discountAmountSetup = round2(discountAmountSetup);

  const discountedMonthly = round2(totalMonthlyRecurring - discountAmountMonthly);
  const discountedSetup = round2(totalSetupFees - discountAmountSetup);
  const grandTotalFirstMonth = round2(discountedMonthly + discountedSetup);
  const grandTotalMonthlyOngoing = discountedMonthly;

  return {
    totalMonthlyRecurring: round2(totalMonthlyRecurring),
    totalSetupFees: round2(totalSetupFees),
    discountType: discount.type,
    discountValue: discount.value,
    discountLabel: discount.label,
    discountAmountMonthly,
    discountAmountSetup,
    discountedMonthly,
    discountedSetup,
    grandTotalFirstMonth,
    grandTotalMonthlyOngoing,
  };
}
