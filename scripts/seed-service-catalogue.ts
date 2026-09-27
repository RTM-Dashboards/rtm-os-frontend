// RTM OS — Seed Service Catalogue
//
// Seeds service_catalog_items, discount_tiers, and discount_type_options
// from the existing hardcoded arrays in lib/sales/budget-config.ts.
//
// Run: npx tsx scripts/seed-service-catalogue.ts
//
// Safe to run multiple times: uses upsert (createOrUpdate) so re-running
// does not duplicate rows. Values are taken verbatim from the config —
// nothing changes in the migration.

import { PrismaClient } from "@prisma/client";
import { BUDGET_SERVICE_CATALOG, DISCOUNT_TIERS, DISCOUNT_TYPE_OPTIONS } from "../lib/sales/budget-config";

const prisma = new PrismaClient();

async function main() {
  const now = new Date().toISOString();

  console.log("Seeding service_catalog_items...");
  for (let i = 0; i < BUDGET_SERVICE_CATALOG.length; i++) {
    const s = BUDGET_SERVICE_CATALOG[i];
    await prisma.serviceCatalogItem.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        catalogId: s.catalogId,
        label: s.label,
        description: s.description,
        quantityUnit: s.quantityUnit,
        quantityOptions: s.quantityOptions,
        defaultQuantity: s.defaultQuantity,
        defaultMonthlyPrice: s.defaultMonthlyPrice,
        defaultSetupFee: s.defaultSetupFee,
        minMonthlyPrice: s.minMonthlyPrice,
        maxMonthlyPrice: s.maxMonthlyPrice,
        setupFeeEditable: s.setupFeeEditable,
        department: s.department,
        isRecurring: s.isRecurring,
        isActive: true,
        isDefault: false,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      },
      update: {
        catalogId: s.catalogId,
        label: s.label,
        description: s.description,
        quantityUnit: s.quantityUnit,
        quantityOptions: s.quantityOptions,
        defaultQuantity: s.defaultQuantity,
        defaultMonthlyPrice: s.defaultMonthlyPrice,
        defaultSetupFee: s.defaultSetupFee,
        minMonthlyPrice: s.minMonthlyPrice,
        maxMonthlyPrice: s.maxMonthlyPrice,
        setupFeeEditable: s.setupFeeEditable,
        department: s.department,
        isRecurring: s.isRecurring,
        sortOrder: i,
        updatedAt: now,
      },
    });
    console.log(`  [${i}] ${s.id} — ${s.label}`);
  }

  console.log("\nSeeding discount_tiers...");
  for (let i = 0; i < DISCOUNT_TIERS.length; i++) {
    const t = DISCOUNT_TIERS[i];
    const id = `tier-${i}`;
    await prisma.discountTier.upsert({
      where: { id },
      create: { id, label: t.label, percentage: t.percentage, sortOrder: i, createdAt: now, updatedAt: now },
      update: { label: t.label, percentage: t.percentage, sortOrder: i, updatedAt: now },
    });
    console.log(`  [${i}] ${id} — ${t.label} (${t.percentage}%)`);
  }

  console.log("\nSeeding discount_type_options...");
  for (let i = 0; i < DISCOUNT_TYPE_OPTIONS.length; i++) {
    const o = DISCOUNT_TYPE_OPTIONS[i];
    const id = `dtype-${i}`;
    await prisma.discountTypeOption.upsert({
      where: { id },
      create: { id, value: o.value, label: o.label, description: o.description, sortOrder: i, createdAt: now, updatedAt: now },
      update: { value: o.value, label: o.label, description: o.description, sortOrder: i, updatedAt: now },
    });
    console.log(`  [${i}] ${id} — ${o.value} — ${o.label}`);
  }

  console.log("\nDone.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
