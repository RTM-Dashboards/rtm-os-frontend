/**
 * backup-and-cleanup-mocks.mjs
 *
 * STEP 1: Backup full Lead + Opportunity tables to a timestamped JSON file.
 * STEP 2: Pre-flight analysis — identify seed vs real records.
 * STEP 3: Delete ONLY confirmed-mock records (those whose IDs match the original
 *          seed files AND have no real GHL activity).
 * STEP 4: Post-deletion validation — print final table state.
 *
 * Safe to run: prints a full report before any DELETE; aborts if backup is empty.
 */

import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const prisma = new PrismaClient();

// ── 1. Original seed IDs (from data/leads.json + data/sales-opportunities.json)
function loadSeedIds() {
  const leadsRaw = JSON.parse(
    readFileSync(join(ROOT, "data", "leads.json"), "utf8")
  );
  const oppsRaw = JSON.parse(
    readFileSync(join(ROOT, "data", "sales-opportunities.json"), "utf8")
  );

  const leadIds = new Set(
    (leadsRaw.records ?? leadsRaw).map((r) => r.id)
  );
  const oppIds = new Set(
    (oppsRaw.records ?? oppsRaw).map((r) => r.id)
  );

  return { leadIds, oppIds };
}

// ── 2. Helpers
function isRealGHLRecord(record) {
  // A record is "real" (GHL-originated) if any of:
  //  - ghlOrigin: true
  //  - ghlContactId is set to a non-empty, non-placeholder value
  const ghlContactId = record.ghlContactId ?? "";
  const placeholderPatterns = [
    /^$/,              // empty
    /^mock/i,          // "mock-..."
    /^placeholder/i,
    /^test-/i,         // generic test prefix
    /^SEED/i,
    /^N\/A$/i,
  ];
  const isPlaceholderId =
    ghlContactId === "" ||
    placeholderPatterns.some((p) => p.test(ghlContactId));

  if (record.ghlOrigin === true) return true;
  if (!isPlaceholderId) return true; // real non-empty, non-placeholder GHL id

  return false;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  RTM-OS Mock Cleanup Script");
  console.log("═══════════════════════════════════════════════════════\n");

  const { leadIds: seedLeadIds, oppIds: seedOppIds } = loadSeedIds();
  console.log(`Seed file lead IDs: ${seedLeadIds.size} (L001-L030)`);
  console.log(`Seed file opportunity IDs: ${seedOppIds.size} (opp-mock-001..006, O001-O045)\n`);

  // ── STEP 1: Full table backup ──────────────────────────────────────────────
  console.log("STEP 1: Writing full database backup...");

  const allLeads = await prisma.lead.findMany();
  const allOpps = await prisma.opportunity.findMany();

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);

  const backupDir = join(ROOT, "data");
  const backupPath = join(backupDir, `backup-pre-cleanup-${timestamp}.json`);

  const backupData = {
    createdAt: new Date().toISOString(),
    leadCount: allLeads.length,
    opportunityCount: allOpps.length,
    leads: allLeads,
    opportunities: allOpps,
  };

  writeFileSync(backupPath, JSON.stringify(backupData, null, 2), "utf8");

  const backupSize = readFileSync(backupPath).length;
  if (backupSize === 0) {
    throw new Error("ABORT: Backup file is empty — something went wrong.");
  }

  console.log(`✅ Backup written: data/backup-pre-cleanup-${timestamp}.json`);
  console.log(
    `   Leads backed up: ${allLeads.length} | Opportunities backed up: ${allOpps.length} | File size: ${(backupSize / 1024).toFixed(1)} KB\n`
  );

  // ── STEP 2: Pre-flight analysis ────────────────────────────────────────────
  console.log("STEP 2: Pre-flight analysis...\n");

  // --- Leads ---
  const mockLeadsToDelete = [];
  const realLeads = [];
  const seedLeadsWithRealData = [];

  for (const lead of allLeads) {
    const isSeedId = seedLeadIds.has(lead.id);
    const hasRealGHL = isRealGHLRecord(lead);

    if (!isSeedId) {
      // Not a seed ID → real record, preserve
      realLeads.push({ reason: "non-seed-id", ...lead });
    } else if (hasRealGHL) {
      // Seed ID but has real GHL data → preserve
      seedLeadsWithRealData.push({ reason: "seed-id-but-real-ghl", ...lead });
    } else {
      // Seed ID, no real GHL activity → safe to delete
      mockLeadsToDelete.push(lead);
    }
  }

  // DB leads whose IDs are in seed but NOT found in DB at all (already gone or never seeded)
  const missingFromDb = [...seedLeadIds].filter(
    (id) => !allLeads.find((l) => l.id === id)
  );

  // --- Opportunities ---
  const mockOppsToDelete = [];
  const realOpps = [];
  const seedOppsWithRealData = [];

  for (const opp of allOpps) {
    const isSeedId = seedOppIds.has(opp.id);
    const hasRealGHL = isRealGHLRecord(opp);

    if (!isSeedId) {
      realOpps.push({ reason: "non-seed-id", ...opp });
    } else if (hasRealGHL) {
      seedOppsWithRealData.push({ reason: "seed-id-but-real-ghl", ...opp });
    } else {
      mockOppsToDelete.push(opp);
    }
  }

  // ── STEP 3: Print findings report ─────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════");
  console.log("  PRE-FLIGHT REPORT");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log(`DATABASE CURRENT STATE:`);
  console.log(`  Leads total in DB:        ${allLeads.length}`);
  console.log(`  Opportunities total in DB: ${allOpps.length}\n`);

  console.log(`LEADS ANALYSIS:`);
  console.log(
    `  Confirmed mock (seed ID, no real GHL): ${mockLeadsToDelete.length} → WILL DELETE`
  );
  console.log(
    `  Seed ID but has real GHL data:         ${seedLeadsWithRealData.length} → PRESERVE`
  );
  console.log(
    `  Non-seed-ID (genuinely new records):    ${realLeads.length} → PRESERVE`
  );
  console.log(
    `  Seed IDs not present in DB:             ${missingFromDb.length}`
  );

  if (realLeads.length > 0) {
    console.log(`\n  ── Real non-seed Leads (PRESERVE) ──`);
    for (const l of realLeads) {
      console.log(
        `    id=${l.id} | name="${l.name}" | email="${l.email}" | ghlOrigin=${l.ghlOrigin} | ghlContactId="${l.ghlContactId}"`
      );
    }
  }
  if (seedLeadsWithRealData.length > 0) {
    console.log(`\n  ── Seed Leads with real GHL data (PRESERVE) ──`);
    for (const l of seedLeadsWithRealData) {
      console.log(
        `    id=${l.id} | name="${l.name}" | email="${l.email}" | ghlOrigin=${l.ghlOrigin} | ghlContactId="${l.ghlContactId}"`
      );
    }
  }

  console.log(`\nOPPORTUNITIES ANALYSIS:`);
  console.log(
    `  Confirmed mock (seed ID, no real GHL): ${mockOppsToDelete.length} → WILL DELETE`
  );
  console.log(
    `  Seed ID but has real GHL data:         ${seedOppsWithRealData.length} → PRESERVE`
  );
  console.log(
    `  Non-seed-ID (genuinely new records):    ${realOpps.length} → PRESERVE`
  );

  if (realOpps.length > 0) {
    console.log(`\n  ── Real non-seed Opportunities (PRESERVE) ──`);
    for (const o of realOpps) {
      console.log(
        `    id=${o.id} | contactName="${o.contactName}" | contactEmail="${o.contactEmail}" | ghlContactId="${o.ghlContactId}"`
      );
    }
  }
  if (seedOppsWithRealData.length > 0) {
    console.log(`\n  ── Seed Opportunities with real GHL data (PRESERVE) ──`);
    for (const o of seedOppsWithRealData) {
      console.log(
        `    id=${o.id} | contactName="${o.contactName}" | contactEmail="${o.contactEmail}" | ghlContactId="${o.ghlContactId}"`
      );
    }
  }

  // ── Fey Thisistest check ──
  console.log(`\n  ── "Fey Thisistest" GHL test contact check ──`);
  const feyLead = allLeads.find(
    (l) =>
      l.name?.toLowerCase().includes("fey") ||
      l.name?.toLowerCase().includes("thisistest") ||
      l.email?.toLowerCase().includes("fey") ||
      l.email?.toLowerCase().includes("thisistest")
  );
  const feyOpp = allOpps.find(
    (o) =>
      o.contactName?.toLowerCase().includes("fey") ||
      o.contactName?.toLowerCase().includes("thisistest") ||
      o.contactEmail?.toLowerCase().includes("fey") ||
      o.contactEmail?.toLowerCase().includes("thisistest") ||
      o.clientName?.toLowerCase().includes("fey") ||
      o.clientName?.toLowerCase().includes("thisistest")
  );

  if (feyLead) {
    const isSeed = seedLeadIds.has(feyLead.id);
    const willDelete = mockLeadsToDelete.find((l) => l.id === feyLead.id);
    console.log(
      `  Lead: id=${feyLead.id} | name="${feyLead.name}" | ghlOrigin=${feyLead.ghlOrigin} | ghlContactId="${feyLead.ghlContactId}"`
    );
    console.log(
      `    → seed ID match: ${isSeed} | will be DELETED: ${!!willDelete} | STATUS: ${willDelete ? "⚠️ WOULD DELETE — check logic!" : "✅ PRESERVED"}`
    );
  } else {
    console.log(`  No Lead record found matching "Fey Thisistest" by name/email.`);
    console.log(
      `  (May be stored under a GHL-generated ID — checking all real leads above)`
    );
  }

  if (feyOpp) {
    const isSeed = seedOppIds.has(feyOpp.id);
    const willDelete = mockOppsToDelete.find((o) => o.id === feyOpp.id);
    console.log(
      `  Opp: id=${feyOpp.id} | contactName="${feyOpp.contactName}" | ghlContactId="${feyOpp.ghlContactId}"`
    );
    console.log(
      `    → seed ID match: ${isSeed} | will be DELETED: ${!!willDelete} | STATUS: ${willDelete ? "⚠️ WOULD DELETE — check logic!" : "✅ PRESERVED"}`
    );
  } else {
    console.log(`  No Opportunity record found matching "Fey Thisistest".`);
  }

  console.log(`\n  ── Deletion plan summary ──`);
  console.log(`  DELETE ${mockLeadsToDelete.length} leads (IDs: ${mockLeadsToDelete.map((l) => l.id).join(", ")})`);
  console.log(
    `  DELETE ${mockOppsToDelete.length} opportunities (IDs: ${mockOppsToDelete.map((o) => o.id).join(", ")})`
  );
  console.log(`  PRESERVE ${realLeads.length + seedLeadsWithRealData.length} leads`);
  console.log(`  PRESERVE ${realOpps.length + seedOppsWithRealData.length} opportunities\n`);

  // ── SAFETY GATE: abort if any "Fey" record would be deleted ──
  if (feyLead && mockLeadsToDelete.find((l) => l.id === feyLead.id)) {
    throw new Error(
      "ABORT: 'Fey Thisistest' lead would be deleted — this is wrong. Fix the logic before proceeding."
    );
  }
  if (feyOpp && mockOppsToDelete.find((o) => o.id === feyOpp.id)) {
    throw new Error(
      "ABORT: 'Fey Thisistest' opportunity would be deleted — this is wrong. Fix the logic before proceeding."
    );
  }

  // ── STEP 4: Execute deletions ──────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════");
  console.log("  STEP 4: Executing deletions...");
  console.log("═══════════════════════════════════════════════════════\n");

  // Delete opportunities first (may have FK dependency on leads)
  let deletedOpps = 0;
  if (mockOppsToDelete.length > 0) {
    const oppResult = await prisma.opportunity.deleteMany({
      where: {
        id: { in: mockOppsToDelete.map((o) => o.id) },
      },
    });
    deletedOpps = oppResult.count;
    console.log(`✅ Deleted ${deletedOpps} opportunity records.`);
  } else {
    console.log(`ℹ️  No mock opportunity records to delete.`);
  }

  let deletedLeads = 0;
  if (mockLeadsToDelete.length > 0) {
    const leadResult = await prisma.lead.deleteMany({
      where: {
        id: { in: mockLeadsToDelete.map((l) => l.id) },
      },
    });
    deletedLeads = leadResult.count;
    console.log(`✅ Deleted ${deletedLeads} lead records.`);
  } else {
    console.log(`ℹ️  No mock lead records to delete.`);
  }

  // ── STEP 5: Post-deletion validation ──────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  STEP 5: Post-deletion validation");
  console.log("═══════════════════════════════════════════════════════\n");

  const remainingLeads = await prisma.lead.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      ghlOrigin: true,
      ghlContactId: true,
    },
  });
  const remainingOpps = await prisma.opportunity.findMany({
    select: {
      id: true,
      contactName: true,
      contactEmail: true,
      clientName: true,
      ghlContactId: true,
      ghlSynced: true,
    },
  });

  console.log(`FINAL TABLE STATE:`);
  console.log(`  Leads remaining:        ${remainingLeads.length}`);
  console.log(`  Opportunities remaining: ${remainingOpps.length}\n`);

  if (remainingLeads.length > 0) {
    console.log(`  Remaining Leads:`);
    for (const l of remainingLeads) {
      console.log(
        `    id=${l.id} | name="${l.name}" | email="${l.email}" | ghlOrigin=${l.ghlOrigin} | ghlContactId="${l.ghlContactId}"`
      );
    }
  } else {
    console.log(`  (No leads remaining)`);
  }

  if (remainingOpps.length > 0) {
    console.log(`\n  Remaining Opportunities:`);
    for (const o of remainingOpps) {
      console.log(
        `    id=${o.id} | contactName="${o.contactName}" | clientName="${o.clientName}" | email="${o.contactEmail}" | ghlContactId="${o.ghlContactId}"`
      );
    }
  } else {
    console.log(`\n  (No opportunities remaining)`);
  }

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`  SUMMARY`);
  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`  Backup file: data/backup-pre-cleanup-${timestamp}.json`);
  console.log(`  Backup size: ${(backupSize / 1024).toFixed(1)} KB`);
  console.log(`  Leads deleted:        ${deletedLeads}`);
  console.log(`  Opportunities deleted: ${deletedOpps}`);
  console.log(`  Leads preserved:      ${remainingLeads.length}`);
  console.log(`  Opportunities preserved: ${remainingOpps.length}`);
  console.log(`═══════════════════════════════════════════════════════\n`);
}

main()
  .catch((e) => {
    console.error("\n⛔ SCRIPT ABORTED:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
