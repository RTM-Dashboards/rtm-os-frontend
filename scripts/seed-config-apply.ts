/**
 * APPLY — seed-config-apply.ts
 *
 * Seeds pipeline_stages and kpi_definitions tables in Postgres.
 * Run ONLY after the dry run passes. Run with:
 *   npx tsx scripts/seed-config-apply.ts
 *
 * Pipeline stages: sourced from DEFAULT_PIPELINE_STAGES (canonical 11).
 *   NOT from data/pipeline-stages.json (stale 13-stage list).
 *
 * KPI definitions: sourced from data/kpi-definitions.json (65 rows),
 *   preserving all fields including enabled state.
 *
 * This script is idempotent: it skips rows that already exist (upsert).
 * Safe to re-run.
 */

import { prisma } from "../lib/db/prisma";
import { DEFAULT_PIPELINE_STAGES } from "../lib/sales/pipeline-stages";
import kpiData from "../data/kpi-definitions.json";

async function main() {
  const now = new Date().toISOString();

  // ── Pipeline stages ──────────────────────────────────────────────────────────
  console.log("Seeding pipeline_stages...");

  for (const s of DEFAULT_PIPELINE_STAGES) {
    await prisma.pipelineStage.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        name: s.name,
        order: s.order,
        color: s.color,
        bg: s.bg,
        border: s.border,
        createdAt: now,
        updatedAt: now,
      },
      update: {
        name: s.name,
        order: s.order,
        color: s.color,
        bg: s.bg,
        border: s.border,
        updatedAt: now,
      },
    });
    console.log(`  ✓ ${s.id}  ${s.name}`);
  }

  const pipelineCount = await prisma.pipelineStage.count();
  console.log(`\npipeline_stages row count: ${pipelineCount}`);

  if (pipelineCount !== 11) {
    console.error(`ERROR: Expected 11 pipeline stages in DB, got ${pipelineCount}. Investigate before proceeding.`);
    process.exit(1);
  }

  // Confirm Lead/Discovery/Qualified are absent
  const forbidden = ["Lead", "Discovery", "Qualified"];
  for (const name of forbidden) {
    const found = await prisma.pipelineStage.findFirst({ where: { name } });
    if (found) {
      console.error(`ERROR: Forbidden stage "${name}" found in pipeline_stages table. This should not happen.`);
      process.exit(1);
    }
  }
  console.log("✓ Lead, Discovery, Qualified are NOT in pipeline_stages.");

  // ── KPI definitions ──────────────────────────────────────────────────────────
  console.log("\nSeeding kpi_definitions...");

  for (const d of kpiData.definitions) {
    await prisma.kpiDefinition.upsert({
      where: { id: d.id },
      create: {
        id: d.id,
        name: d.name,
        category: d.category,
        departments: d.departments,
        enabled: d.enabled,
        description: d.description ?? "",
        createdAt: now,
        updatedAt: now,
      },
      update: {
        name: d.name,
        category: d.category,
        departments: d.departments,
        enabled: d.enabled,
        description: d.description ?? "",
        updatedAt: now,
      },
    });
    console.log(`  ✓ ${d.id}`);
  }

  const kpiCount = await prisma.kpiDefinition.count();
  console.log(`\nkpi_definitions row count: ${kpiCount}`);

  if (kpiCount !== 65) {
    console.error(`ERROR: Expected 65 KPI definitions in DB, got ${kpiCount}. Investigate.`);
    process.exit(1);
  }

  console.log("\n✓ Seed complete.");
  console.log(`  pipeline_stages: ${pipelineCount} rows`);
  console.log(`  kpi_definitions: ${kpiCount} rows`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
