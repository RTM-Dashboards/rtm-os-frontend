/**
 * DRY RUN — seed-config-dry-run.ts
 *
 * Prints exactly what would be inserted into pipeline_stages and kpi_definitions.
 * Writes NOTHING. Run with:
 *   npx tsx scripts/seed-config-dry-run.ts
 *
 * Expected:
 *   - 11 pipeline stages (canonical list from lib/sales/pipeline-stages.ts)
 *   - 63 KPI definitions (from data/kpi-definitions.json)
 *
 * If the counts differ, STOP. Do not proceed to the real seed.
 */

import { DEFAULT_PIPELINE_STAGES } from "../lib/sales/pipeline-stages";
import kpiData from "../data/kpi-definitions.json";

const now = new Date().toISOString();

// ── Pipeline stages (from canonical TS list, NOT from the stale JSON) ─────────

console.log("=== PIPELINE STAGE ROWS (DRY RUN — NOT WRITTEN) ===\n");

const pipelineRows = DEFAULT_PIPELINE_STAGES.map((s) => ({
  id: s.id,
  name: s.name,
  order: s.order,
  color: s.color,
  bg: s.bg,
  border: s.border,
  createdAt: now,
  updatedAt: now,
}));

for (const row of pipelineRows) {
  console.log(JSON.stringify(row, null, 2));
}

console.log(`\nTotal pipeline stages: ${pipelineRows.length}`);

if (pipelineRows.length !== 11) {
  console.error(`\nERROR: Expected 11 pipeline stages, got ${pipelineRows.length}. STOPPING.`);
  process.exit(1);
}

// Check Lead/Discovery/Qualified are absent
const forbidden = ["Lead", "Discovery", "Qualified"];
for (const name of forbidden) {
  if (pipelineRows.some((r) => r.name === name)) {
    console.error(`\nERROR: Forbidden stage "${name}" found in seed data. STOPPING.`);
    process.exit(1);
  }
}
console.log("✓ Lead, Discovery, Qualified are NOT present.");

// ── KPI definitions (from data/kpi-definitions.json) ─────────────────────────

console.log("\n=== KPI DEFINITION ROWS (DRY RUN — NOT WRITTEN) ===\n");

const kpiRows = kpiData.definitions.map((d) => ({
  id: d.id,
  name: d.name,
  category: d.category,
  departments: d.departments,
  enabled: d.enabled,
  description: d.description ?? "",
  createdAt: now,
  updatedAt: now,
}));

for (const row of kpiRows) {
  console.log(JSON.stringify(row, null, 2));
}

console.log(`\nTotal KPI definitions: ${kpiRows.length}`);

if (kpiRows.length !== 65) {
  console.error(`\nERROR: Expected 65 KPI definitions, got ${kpiRows.length}. STOPPING.`);
  process.exit(1);
}

console.log("\n✓ Dry run complete. Both counts match expectations.");
console.log("  Run seed-config-apply.ts to write to Postgres.");
