// RTM OS — One-Time Database Seed Script
//
// Reads the current data/leads.json and data/sales-opportunities.json content
// and inserts it into the real Supabase database tables via Prisma.
//
// ── HOW TO RUN ───────────────────────────────────────────────────────────────
//
//   1. Make sure DATABASE_URL is set in your .env file (Prisma reads .env).
//      If you set it in .env.local instead, either copy it to .env or run:
//        DATABASE_URL="your-connection-string" npx tsx scripts/seed-db.ts
//
//   2. Make sure you have applied the migration first:
//        npx prisma migrate deploy
//      (or `npx prisma db push` for a quick push without migration history)
//
//   3. Run this script ONCE:
//        npx tsx scripts/seed-db.ts
//
// ── SAFETY ───────────────────────────────────────────────────────────────────
//
//   - Uses upsert (createMany with skipDuplicates) — safe to re-run if needed;
//     existing records are NOT overwritten.
//   - Prints a summary of inserted vs skipped counts at the end.
//   - Does NOT delete or truncate existing data.
//
// ── WHAT IT SEEDS ────────────────────────────────────────────────────────────
//
//   ✅ data/leads.json           → leads table (30 records)
//   ✅ data/leads-status.json    → lead_statuses table (0 records currently)
//   ✅ data/sales-opportunities.json → opportunities table (51 records)
//
// ── WHAT IT DOES NOT TOUCH ───────────────────────────────────────────────────
//
//   All other data/*.json stores remain file-backed; this script does not
//   migrate them.

import { PrismaClient, Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";

// Prisma nullable Json columns require Prisma.JsonNull (not JS null).
function asJsonOrNull(val: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (val === null || val === undefined) return Prisma.JsonNull;
  return val as Prisma.InputJsonValue;
}

// ── Types (inline to avoid importing Next.js route files) ─────────────────

interface LeadRecord {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  ghlContactId: string;
  ghlAssignedUser: string;
  ghlSource: string;
  ghlCreatedDate: string;
  ghlLastActivityDate: string;
  ghlContactTags: string[];
  ghlContactStatus: string;
  ghlSyncStatus: string;
  ghlOrigin?: boolean;
  ghlLastSyncedAt?: string;
  ghlSyncError?: string;
  leadSource: string;
  assignedRep: string;
  stage: string;
  discoveryScheduled: boolean;
  discoveryDate: string;
  discoveryNotes: string;
  businessGoals: string[];
  painPoints: string[];
  requestedServices: string[];
  budget: string;
  authority: string;
  need: string;
  timeline: string;
  estimatedValue: number;
  affiliateName: string;
  createdDate: string;
  lastActivity: string;
  notes: string;
  disqualified?: boolean;
  disqualifiedReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LeadStatusRecord {
  leadId: string;
  stage?: string;
  assignedRep?: string;
  discoveryScheduled?: boolean;
  discoveryDate?: string;
  discoveryNotes?: string;
  notes?: string;
  disqualified?: boolean;
  disqualifiedReason?: string;
  name?: string;
  businessName?: string;
  industry?: string;
  leadSource?: string;
  ghlContactId?: string;
  ghlSyncStatus?: string;
  ghlSyncError?: string;
  ghlLastSyncedAt?: string;
  updatedAt: string;
}

// ── Prisma client ─────────────────────────────────────────────────────────────

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

// ── File paths ────────────────────────────────────────────────────────────────

const ROOT = path.join(process.cwd());
const LEADS_FILE = path.join(ROOT, "data", "leads.json");
const LEADS_STATUS_FILE = path.join(ROOT, "data", "leads-status.json");
const OPPS_FILE = path.join(ROOT, "data", "sales-opportunities.json");

// ── File reader ───────────────────────────────────────────────────────────────

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

// ── Main seed function ────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 RTM OS — Database Seed");
  console.log("=".repeat(50));

  // ── 1. Seed leads ──────────────────────────────────────────────────────────

  console.log("\n📋 Loading data/leads.json...");
  const leadsFile = readJson<{ records: LeadRecord[] }>(LEADS_FILE);
  const leads = leadsFile.records;
  console.log(`   Found ${leads.length} lead records.`);

  let leadsInserted = 0;
  let leadsSkipped = 0;

  for (const lead of leads) {
    const now = new Date().toISOString();
    try {
      await prisma.lead.upsert({
        where: { id: lead.id },
        update: {}, // do not overwrite existing; seed is idempotent
        create: {
          id: lead.id,
          name: lead.name ?? "",
          businessName: lead.businessName ?? "",
          industry: lead.industry ?? "",
          website: lead.website ?? "",
          email: lead.email ?? "",
          phone: lead.phone ?? "",
          location: lead.location ?? "",
          ghlContactId: lead.ghlContactId ?? "",
          ghlAssignedUser: lead.ghlAssignedUser ?? "",
          ghlSource: lead.ghlSource ?? "",
          ghlCreatedDate: lead.ghlCreatedDate ?? "",
          ghlLastActivityDate: lead.ghlLastActivityDate ?? "",
          ghlContactTags: lead.ghlContactTags ?? [],
          ghlContactStatus: lead.ghlContactStatus ?? "",
          ghlSyncStatus: lead.ghlSyncStatus ?? "",
          ghlOrigin: lead.ghlOrigin ?? false,
          ghlLastSyncedAt: lead.ghlLastSyncedAt ?? null,
          ghlSyncError: lead.ghlSyncError ?? null,
          leadSource: lead.leadSource ?? "",
          assignedRep: lead.assignedRep ?? "",
          stage: lead.stage ?? "New Lead",
          discoveryScheduled: lead.discoveryScheduled ?? false,
          discoveryDate: lead.discoveryDate ?? "",
          discoveryNotes: lead.discoveryNotes ?? "",
          businessGoals: lead.businessGoals ?? [],
          painPoints: lead.painPoints ?? [],
          requestedServices: lead.requestedServices ?? [],
          budget: lead.budget ?? "Unknown",
          authority: lead.authority ?? "Unknown",
          need: lead.need ?? "Low",
          timeline: lead.timeline ?? "6+ months",
          estimatedValue: lead.estimatedValue ?? 0,
          affiliateName: lead.affiliateName ?? "—",
          createdDate: lead.createdDate ?? "",
          lastActivity: lead.lastActivity ?? "",
          notes: lead.notes ?? "",
          disqualified: lead.disqualified ?? false,
          disqualifiedReason: lead.disqualifiedReason ?? null,
          createdAt: lead.createdAt ?? now,
          updatedAt: lead.updatedAt ?? now,
        },
      });
      leadsInserted++;
      process.stdout.write(".");
    } catch (err) {
      console.error(`\n   ❌ Failed to insert lead ${lead.id}:`, err);
      leadsSkipped++;
    }
  }

  console.log(`\n   ✅ Leads: ${leadsInserted} inserted, ${leadsSkipped} failed`);

  // ── 2. Seed lead statuses ─────────────────────────────────────────────────

  console.log("\n📋 Loading data/leads-status.json...");
  let statusRecords: LeadStatusRecord[] = [];
  try {
    const statusFile = readJson<{ records: LeadStatusRecord[] }>(LEADS_STATUS_FILE);
    statusRecords = statusFile.records ?? [];
  } catch {
    console.log("   (leads-status.json not found or empty — skipping)");
  }
  console.log(`   Found ${statusRecords.length} leads-status records.`);

  let statusInserted = 0;
  let statusSkipped = 0;

  for (const rec of statusRecords) {
    try {
      await prisma.leadStatus.upsert({
        where: { leadId: rec.leadId },
        update: {},
        create: {
          leadId: rec.leadId,
          stage: rec.stage ?? null,
          assignedRep: rec.assignedRep ?? null,
          discoveryScheduled: rec.discoveryScheduled ?? null,
          discoveryDate: rec.discoveryDate ?? null,
          discoveryNotes: rec.discoveryNotes ?? null,
          notes: rec.notes ?? null,
          disqualified: rec.disqualified ?? null,
          disqualifiedReason: rec.disqualifiedReason ?? null,
          name: rec.name ?? null,
          businessName: rec.businessName ?? null,
          industry: rec.industry ?? null,
          leadSource: rec.leadSource ?? null,
          ghlContactId: rec.ghlContactId ?? null,
          ghlSyncStatus: rec.ghlSyncStatus ?? null,
          ghlSyncError: rec.ghlSyncError ?? null,
          ghlLastSyncedAt: rec.ghlLastSyncedAt ?? null,
          updatedAt: rec.updatedAt ?? new Date().toISOString(),
        },
      });
      statusInserted++;
      process.stdout.write(".");
    } catch (err) {
      console.error(`\n   ❌ Failed to insert lead-status ${rec.leadId}:`, err);
      statusSkipped++;
    }
  }

  if (statusRecords.length > 0) {
    console.log(`\n   ✅ Lead statuses: ${statusInserted} inserted, ${statusSkipped} failed`);
  }

  // ── 3. Seed opportunities ─────────────────────────────────────────────────

  console.log("\n📋 Loading data/sales-opportunities.json...");
  const oppsFile = readJson<{ records: Array<Record<string, unknown>> }>(OPPS_FILE);
  const opportunities = oppsFile.records;
  console.log(`   Found ${opportunities.length} opportunity records.`);

  let oppsInserted = 0;
  let oppsSkipped = 0;
  const now = new Date().toISOString();

  for (const opp of opportunities) {
    const id = opp.id as string;
    if (!id) {
      console.warn("\n   ⚠️ Skipping record with no id:", opp);
      oppsSkipped++;
      continue;
    }

    try {
      await prisma.opportunity.upsert({
        where: { id },
        update: {},
        create: {
          id,
          opportunityNumber: (opp.opportunityNumber as string) ?? "",
          leadId: (opp.leadId as string | null) ?? null,
          clientName: (opp.clientName as string) ?? "",
          businessName: (opp.businessName as string) ?? "",
          tradeType: (opp.tradeType as string) ?? "",
          contactName: (opp.contactName as string) ?? "",
          contactPhone: (opp.contactPhone as string) ?? "",
          contactEmail: (opp.contactEmail as string) ?? "",
          leadSource: (opp.leadSource as string) ?? "",
          assignedRep: (opp.assignedRep as string) ?? "",
          stage: (opp.stage as string) ?? "",
          priority: (opp.priority as string) ?? "",
          estimatedMonthlyValue: Number(opp.estimatedMonthlyValue ?? 0),
          expectedCloseDate: (opp.expectedCloseDate as string) ?? "",
          serviceInterest: Array.isArray(opp.serviceInterest) ? (opp.serviceInterest as string[]) : [],
          discoveryNotes: (opp.discoveryNotes as string) ?? "",
          ghlContactId: (opp.ghlContactId as string) ?? "",
          ghlSynced: Boolean(opp.ghlSynced ?? false),
          industry: (opp.industry as string | undefined) ?? null,
          website: (opp.website as string | undefined) ?? null,
          primaryContact: (opp.primaryContact as string | undefined) ?? null,
          email: (opp.email as string | undefined) ?? null,
          phone: (opp.phone as string | undefined) ?? null,
          affiliateSource: (opp.affiliateSource as string | undefined) ?? null,
          estimatedValue: opp.estimatedValue !== undefined ? Number(opp.estimatedValue) : null,
          monthlyValue: opp.monthlyValue !== undefined ? Number(opp.monthlyValue) : null,
          contractLength: (opp.contractLength as string | undefined) ?? null,
          probability: opp.probability !== undefined ? Number(opp.probability) : null,
          daysInStage: opp.daysInStage !== undefined ? Number(opp.daysInStage) : null,
          nextAction: (opp.nextAction as string | undefined) ?? null,
          closingMonth: (opp.closingMonth as string | undefined) ?? null,
          opportunityScore: opp.opportunityScore !== undefined ? Number(opp.opportunityScore) : null,
          forecastMonth: (opp.forecastMonth as string | undefined) ?? null,
          forecastQuarter: (opp.forecastQuarter as string | undefined) ?? null,
          activeWizardId: (opp.activeWizardId as string | undefined) ?? null,
          intakeRecord: asJsonOrNull(opp.intakeRecord),
          // JSON sub-objects
          ghl: asJsonOrNull(opp.ghl),
          audit: asJsonOrNull(opp.audit),
          proposal: asJsonOrNull(opp.proposal),
          handoff: asJsonOrNull(opp.handoff),
          affiliate: asJsonOrNull(opp.affiliate),
          communicationLog: asJsonOrNull(opp.communicationLog),
          // JSON array fields
          followUps: asJsonOrNull(opp.followUps),
          tasks: asJsonOrNull(opp.tasks),
          notifications: asJsonOrNull(opp.notifications),
          workflowEvents: asJsonOrNull(opp.workflowEvents),
          recentActivities: asJsonOrNull(opp.recentActivities),
          notes: asJsonOrNull(opp.notes),
          nextSteps: asJsonOrNull(opp.nextSteps),
          createdAt: (opp.createdAt as string) ?? now,
          updatedAt: (opp.updatedAt as string) ?? now,
        },
      });
      oppsInserted++;
      process.stdout.write(".");
    } catch (err) {
      console.error(`\n   ❌ Failed to insert opportunity ${id}:`, err);
      oppsSkipped++;
    }
  }

  console.log(`\n   ✅ Opportunities: ${oppsInserted} inserted, ${oppsSkipped} failed`);

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Seed complete!");
  console.log(`   Leads:         ${leadsInserted}/${leads.length}`);
  console.log(`   Lead statuses: ${statusInserted}/${statusRecords.length}`);
  console.log(`   Opportunities: ${oppsInserted}/${opportunities.length}`);
  console.log("=".repeat(50));
  console.log(
    "\ndata/leads.json and data/sales-opportunities.json remain in place as backup."
  );
  console.log("No code reads from them anymore — all reads/writes now go through the DB.");
}

// ── Run ───────────────────────────────────────────────────────────────────────

main()
  .catch((err) => {
    console.error("\n💥 Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
