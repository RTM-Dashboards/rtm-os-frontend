// RTM OS — Sales Budget Engine
// ─────────────────────────────────────────────────────────────────────────────
// Pure functions only. No React. No UI imports.
// Consumes budget-config.ts → produces BudgetResult.
//
// Discount rules: applied to recurring totals only. Setup fees are never discounted.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BUDGET_SERVICE_CATALOG,
  RECOMMENDATION_TO_BUDGET_MAP,
  getBudgetServiceById,
  type BudgetServiceId,
  type BudgetServiceDefinition,
} from "./budget-config";

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
 * Looks up service from BUDGET_SERVICE_CATALOG, applies optional overrides,
 * computes monthlySubtotal and setupSubtotal, and returns a complete BudgetLineItem.
 */
export function buildLineItemFromService(
  serviceId: BudgetServiceId,
  overrides?: Partial<
    Pick<BudgetLineItem, "quantity" | "unitMonthlyPrice" | "setupFee">
  >
): BudgetLineItem {
  const def = getBudgetServiceById(serviceId);
  if (!def) {
    throw new Error(
      `[budget-engine] Unknown serviceId: "${serviceId}". Check BUDGET_SERVICE_CATALOG.`
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
  };
}

// ─── buildLineItemsFromRecommendations ────────────────────────────────────────

/**
 * Accepts Recommendation Engine service label strings, maps them through
 * RECOMMENDATION_TO_BUDGET_MAP, and returns BudgetLineItem[].
 * Unmatched labels are silently skipped.
 */
export function buildLineItemsFromRecommendations(
  recommendedServiceLabels: string[]
): BudgetLineItem[] {
  const items: BudgetLineItem[] = [];
  for (const label of recommendedServiceLabels) {
    const budgetId = RECOMMENDATION_TO_BUDGET_MAP[label];
    if (!budgetId) continue;
    try {
      items.push(buildLineItemFromService(budgetId));
    } catch {
      // Skip if service is somehow missing from catalog
    }
  }
  return items;
}

// ─── getAvailableServices ─────────────────────────────────────────────────────

/**
 * Returns services from BUDGET_SERVICE_CATALOG that are not in existingIds.
 */
export function getAvailableServices(
  existingIds: BudgetServiceId[]
): BudgetServiceDefinition[] {
  const existingSet = new Set(existingIds);
  return BUDGET_SERVICE_CATALOG.filter((s) => !existingSet.has(s.id));
}
