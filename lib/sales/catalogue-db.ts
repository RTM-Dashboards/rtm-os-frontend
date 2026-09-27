// RTM OS — Database-backed service catalogue helpers
//
// Server-side only. Do not import from client components.
//
// These replace the runtime reads of BUDGET_SERVICE_CATALOG,
// getBudgetServiceById, getAvailableServices, DISCOUNT_TIERS, and
// DISCOUNT_TYPE_OPTIONS in budget-config.ts for all production code paths.
//
// The hardcoded arrays in budget-config.ts remain as the seed source only;
// no production code path reads them at request time after this module is in use.
//
// getServiceCatalogFromDb     — all active services (for selection lists)
// getServiceCatalogAllFromDb  — all services including retired (for admin)
// getServiceByIdFromDb        — single service by id, including retired
//                               (used by old-proposal rendering)
// getAvailableServicesFromDb  — active services not yet in existingIds
// getDiscountTiersFromDb      — discount percentage tiers
// getDiscountTypesFromDb      — discount behaviour types

import { prisma } from "@/lib/db/prisma";
import type { BudgetServiceDefinition, BudgetServiceId } from "./budget-config";
import type { DiscountTier, DiscountTypeOption } from "./budget-config";
import type { DiscountType } from "./types";

// ─── Row → BudgetServiceDefinition ────────────────────────────────────────────

function rowToDef(r: {
  id: string;
  catalogId: string;
  label: string;
  description: string;
  quantityUnit: string;
  quantityOptions: number[];
  defaultQuantity: number;
  defaultMonthlyPrice: number;
  defaultSetupFee: number;
  minMonthlyPrice: number;
  maxMonthlyPrice: number;
  setupFeeEditable: boolean;
  department: string;
  isRecurring: boolean;
}): BudgetServiceDefinition {
  return {
    id: r.id as BudgetServiceId,
    catalogId: r.catalogId,
    label: r.label,
    description: r.description,
    quantityUnit: r.quantityUnit as BudgetServiceDefinition["quantityUnit"],
    quantityOptions: r.quantityOptions,
    defaultQuantity: r.defaultQuantity,
    defaultMonthlyPrice: r.defaultMonthlyPrice,
    defaultSetupFee: r.defaultSetupFee,
    minMonthlyPrice: r.minMonthlyPrice,
    maxMonthlyPrice: r.maxMonthlyPrice,
    setupFeeEditable: r.setupFeeEditable,
    department: r.department,
    isRecurring: r.isRecurring,
  };
}

// ─── Service catalogue reads ───────────────────────────────────────────────────

/**
 * Returns all active services, ordered by sortOrder.
 * Use for new selection dropdowns.
 */
export async function getServiceCatalogFromDb(): Promise<BudgetServiceDefinition[]> {
  const rows = await prisma.serviceCatalogItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(rowToDef);
}

/**
 * Returns all services (active and retired), ordered by sortOrder.
 * Use for admin/config views.
 */
export async function getServiceCatalogAllFromDb(): Promise<(BudgetServiceDefinition & { isActive: boolean; isDefault: boolean; sortOrder: number })[]> {
  const rows = await prisma.serviceCatalogItem.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({ ...rowToDef(r), isActive: r.isActive, isDefault: r.isDefault, sortOrder: r.sortOrder }));
}

/**
 * Returns a single service by id, including retired services.
 *
 * Retired services must still resolve so that old proposals that reference
 * them by id can still render their line items with a name and a price.
 * Returns undefined only when the id never existed.
 */
export async function getServiceByIdFromDb(id: string): Promise<BudgetServiceDefinition | undefined> {
  const row = await prisma.serviceCatalogItem.findUnique({ where: { id } });
  if (!row) return undefined;
  return rowToDef(row);
}

/**
 * Returns active services whose id is NOT in existingIds.
 * Mirrors getAvailableServices() in budget-engine.ts but reads from the DB.
 */
export async function getAvailableServicesFromDb(
  existingIds: string[]
): Promise<BudgetServiceDefinition[]> {
  const existingSet = new Set(existingIds);
  const rows = await prisma.serviceCatalogItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.filter((r) => !existingSet.has(r.id)).map(rowToDef);
}

// ─── Discount reads ────────────────────────────────────────────────────────────

/**
 * Returns discount percentage tiers from the database.
 * Matches the DiscountTier shape from budget-config.ts.
 */
export async function getDiscountTiersFromDb(): Promise<DiscountTier[]> {
  const rows = await prisma.discountTier.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((r) => ({ label: r.label, percentage: r.percentage }));
}

/**
 * Returns discount type options from the database.
 * Matches the DiscountTypeOption shape from budget-config.ts.
 */
export async function getDiscountTypesFromDb(): Promise<DiscountTypeOption[]> {
  const rows = await prisma.discountTypeOption.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((r) => ({
    value: r.value as DiscountType,
    label: r.label,
    description: r.description,
  }));
}
