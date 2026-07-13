#!/usr/bin/env tsx
// =============================================================================
// RTM OS — Backfill Orphaned Client Projects
// scripts/backfill-orphaned-projects.ts
//
// BACKGROUND
// ----------
// 13 clients in MASTER_CLIENTS have activationStatus: "Active" but NO
// corresponding engine Project.  Root cause: seeded as "Active" before the
// real engine/Project system existed.  Only 3 clients were ever properly
// migrated in via the wizard (Blue Ridge Plumbing, Ridgeline Construction,
// Clearwater Insurance) plus 1 wizard-test project.
//
// WHAT THIS SCRIPT DOES
// ---------------------
// For each of the 13 orphaned clients it:
//   1. Checks whether a project already exists for that clientId (idempotent).
//   2. Calls createEngineProject() — the EXACT same function the AM wizard
//      uses — to generate blueprint-matched tasks, ProjectDepartment entries
//      with activationStatus: "Active" + activatedAt, and a milestone.
//   3. Writes the result directly to data/engine-store.json using the same
//      dedup logic the /api/engine POST route uses.
//
// The script reads and writes data/engine-store.json directly so it runs
// safely without a live Next.js dev server.
//
// NOTE ON activatedAt TIMESTAMPS
// --------------------------------
// Because no real historical activation event exists for these backfilled
// records, activatedAt is set to the migration run time (new Date().toISOString()).
// This is the most honest available value — it matches how the wizard behaves
// when a human clicks "Activate" (stamps the current moment).
//
// IDEMPOTENCY
// -----------
// Re-running this script is safe.  Any clientId that already has a project
// in engine-store.json is skipped without modification.
//
// CLIENTS INTENTIONALLY UNTOUCHED
// --------------------------------
// mc004 (Blue Ridge Plumbing), mc011 (Ridgeline Construction),
// mc010 (Clearwater Insurance), proj-wizard-9001 (wizard-test).
// These are correctly migrated and are not in ORPHANED_CLIENT_IDS.
// =============================================================================

import fs   from "fs";
import path from "path";

// ── File I/O (mirrors /api/engine POST handler exactly) ──────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "engine-store.json");

interface StoreFile {
  projects:   Record<string, unknown>[];
  milestones: Record<string, unknown>[];
  tasks:      Record<string, unknown>[];
  blueprints: Record<string, unknown>[];
  users:      Record<string, unknown>[];
}

function readStore(): StoreFile {
  try {
    const raw    = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoreFile>;
    return {
      projects:   parsed.projects   ?? [],
      milestones: parsed.milestones ?? [],
      tasks:      parsed.tasks      ?? [],
      blueprints: parsed.blueprints ?? [],
      users:      parsed.users      ?? [],
    };
  } catch {
    return { projects: [], milestones: [], tasks: [], blueprints: [], users: [] };
  }
}

function writeStore(store: StoreFile): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

// ── Shared project-creation logic (same function as AM wizard) ────────────────
import { createEngineProject, blueprintIdsForServices } from "../lib/engine/create-project";
import type { MasterClient } from "../lib/mock/master-clients";

// ── The 13 orphaned client IDs ────────────────────────────────────────────────
const ORPHANED_CLIENT_IDS = new Set([
  "mc001", "mc002", "mc003", "mc005",
  "mc012", "mc013", "mc014", "mc015",
  "mc016", "mc017", "mc018", "mc019", "mc020",
]);

// ── Client records for the 13 orphaned clients ────────────────────────────────
// All field values sourced directly from lib/mock/master-clients.ts.
// We embed the records here rather than importing MASTER_CLIENTS to avoid
// pulling in the full Next.js module graph (which has browser/React deps).
const ORPHANED_CLIENTS: MasterClient[] = [
  {
    id:             "mc001",
    slug:           "apex-roofing",
    clientName:     "Apex Roofing Solutions",
    industry:       "Home Services – Roofing",
    assignedAM:     "Jordan M.",
    email:          "david@apexroofing.com",
    avatarColor:    "#6366f1",
    currentStatus:  "Active",
    workflowStatus: "In Progress",
    salesStatus:    "Closed Won",
    salesOwner:     "Mike T.",
    billingStatus:  "Paid",
    invoiceStatus:  "Paid",
    paymentStatus:  "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Meta Ads", "Content Writing", "Monthly Reporting"],
    monthlyValue:   5350,
    renewalDate:    "2026-03-01",
    renewalStatus:  "Active",
    clientHealth:   "Excellent",
    priority:       "High",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-28",
    nextRequiredAction: "Send June performance report",
    notes:          "High-value client. Storm season drives spike in leads.",
    activationChecklist: {
      invoicePaid: true, billingCleared: true, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    referralSource: "Direct",
    commissionStatus: "Not Applicable",
  },
  {
    id:             "mc002",
    slug:           "sunbelt-hvac",
    clientName:     "Sunbelt HVAC & Air",
    industry:       "Home Services – HVAC",
    assignedAM:     "Sarah K.",
    email:          "linda@sunbelthvac.com",
    avatarColor:    "#f59e0b",
    currentStatus:  "Active",
    workflowStatus: "Escalated",
    salesStatus:    "Closed Won",
    salesOwner:     "Marco T.",
    billingStatus:  "Overdue",
    invoiceStatus:  "Overdue 30d",
    paymentStatus:  "Overdue",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Review Management"],
    monthlyValue:   2000,
    renewalDate:    "2025-08-01",
    renewalStatus:  "At Risk",
    clientHealth:   "At Risk",
    priority:       "High",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-27",
    nextRequiredAction: "Escalate billing — personal outreach required",
    notes:          "At-risk. Invoice overdue 30 days. Campaigns paused.",
    activationChecklist: {
      invoicePaid: false, billingCleared: false, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    referralSource: "Affiliate",
    affiliateName:  "Brandon Ellis",
    referralRevenue: "$2,000/mo",
    commissionStatus: "Paid",
  },
  {
    id:             "mc003",
    slug:           "pacific-dental",
    clientName:     "Pacific Dental Group",
    industry:       "Healthcare – Dentistry",
    assignedAM:     "Jordan M.",
    email:          "karen@pacificdentalgroup.com",
    avatarColor:    "#10b981",
    currentStatus:  "Renewal Due",
    workflowStatus: "Awaiting Client",
    salesStatus:    "Closed Won",
    salesOwner:     "Jake R.",
    billingStatus:  "Paid",
    invoiceStatus:  "Paid",
    paymentStatus:  "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Website Maintenance", "Content Writing", "Yelp Ads"],
    monthlyValue:   5150,
    renewalDate:    "2025-06-15",
    renewalStatus:  "Schedule Pending",
    clientHealth:   "Good",
    priority:       "High",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-29",
    nextRequiredAction: "Send renewal proposal — due in 16 days",
    notes:          "Long-term client. Renewal in 16 days.",
    activationChecklist: {
      invoicePaid: true, billingCleared: true, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    referralSource: "Affiliate",
    affiliateName:  "Maria Santos",
    commissionStatus: "Pending",
  },
  {
    id:             "mc005",
    slug:           "harbor-auto",
    clientName:     "Harbor Auto Group",
    industry:       "Automotive – Dealership",
    assignedAM:     "Sarah K.",
    email:          "frank@harborauto.com",
    avatarColor:    "#ef4444",
    currentStatus:  "Active",
    workflowStatus: "Escalated",
    salesStatus:    "Closed Won",
    salesOwner:     "Tina W.",
    billingStatus:  "Pending",
    invoiceStatus:  "Sent — Awaiting Payment",
    paymentStatus:  "Unpaid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["Meta Ads", "SEO / GBP"],
    monthlyValue:   6500,
    renewalDate:    "2025-11-01",
    renewalStatus:  "Active",
    clientHealth:   "At Risk",
    priority:       "High",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-26",
    nextRequiredAction: "Resolve content quality dispute — escalate to director",
    notes:          "At-risk due to content package dispute. Ad performance strong.",
    activationChecklist: {
      invoicePaid: false, billingCleared: false, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    commissionStatus: "Not Applicable",
  },
  {
    id:             "mc012",
    slug:           "nova-medspa",
    clientName:     "Nova MedSpa & Aesthetics",
    industry:       "Healthcare – MedSpa",
    assignedAM:     "Jordan M.",
    email:          "kim@novamedspa.com",
    avatarColor:    "#ec4899",
    currentStatus:  "Active",
    workflowStatus: "Complete",
    salesStatus:    "Closed Won",
    salesOwner:     "Chris M.",
    billingStatus:  "Paid",
    invoiceStatus:  "Paid",
    paymentStatus:  "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Meta Ads", "Content Writing", "Google Ads"],
    monthlyValue:   7200,
    renewalDate:    "2026-01-15",
    renewalStatus:  "Active",
    clientHealth:   "Excellent",
    priority:       "High",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-30",
    nextRequiredAction: "Quarterly business review — schedule for June",
    notes:          "Top-performing account. Upsell opportunity: email marketing.",
    activationChecklist: {
      invoicePaid: true, billingCleared: true, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    commissionStatus: "Not Applicable",
  },
  {
    id:             "mc013",
    slug:           "desert-solar",
    clientName:     "Desert Solar Energy",
    industry:       "Energy – Solar",
    assignedAM:     "Sarah K.",
    email:          "craig@desertsolar.com",
    avatarColor:    "#dc2626",
    currentStatus:  "Cancellation Requested",
    workflowStatus: "Escalated",
    salesStatus:    "Closed Won",
    salesOwner:     "Tina W.",
    billingStatus:  "Pending",
    invoiceStatus:  "Sent — Awaiting Payment",
    paymentStatus:  "Unpaid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Meta Ads"],
    monthlyValue:   3900,
    renewalDate:    "2025-07-01",
    renewalStatus:  "At Risk",
    clientHealth:   "Critical",
    priority:       "High",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-29",
    nextRequiredAction: "Retention call — director must be on the line",
    notes:          "Cancellation requested. Director retention call scheduled for June 3.",
    activationChecklist: {
      invoicePaid: false, billingCleared: false, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    commissionStatus: "Not Applicable",
  },
  {
    id:             "mc014",
    slug:           "lakeside-property",
    clientName:     "Lakeside Property Management",
    industry:       "Real Estate",
    assignedAM:     "Alex R.",
    email:          "mgmt@lakesideproperty.com",
    avatarColor:    "#94a3b8",
    currentStatus:  "Offboarding",
    workflowStatus: "In Progress",
    salesStatus:    "Closed Won",
    salesOwner:     "Jake R.",
    billingStatus:  "Closed",
    invoiceStatus:  "Final invoice issued",
    paymentStatus:  "Paid",
    cancellationStatus: "Approved",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    // NOTE: mc014 is offboarding with no active services.
    // createEngineProject handles this: blueprintIdsForServices([]) = ["bp-004"],
    // deriveProjectName returns "Lakeside Property Management — General Services".
    activeServices: [],
    monthlyValue:   0,
    renewalDate:    "—",
    renewalStatus:  "Cancelled",
    clientHealth:   "Critical",
    priority:       "Medium",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-26",
    nextRequiredAction: "Complete data export and access revocation",
    notes:          "Client moving in-house. Offboarding in progress. Friendly exit.",
    activationChecklist: {
      invoicePaid: true, billingCleared: true, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    commissionStatus: "Not Applicable",
  },
  {
    id:             "mc015",
    slug:           "pinnacle-chiropractic",
    clientName:     "Pinnacle Chiropractic",
    industry:       "Healthcare – Chiropractic",
    assignedAM:     "Jordan M.",
    email:          "dr.lee@pinnaclechiro.com",
    avatarColor:    "#14b8a6",
    currentStatus:  "Active",
    workflowStatus: "In Progress",
    salesStatus:    "Closed Won",
    salesOwner:     "Chris M.",
    billingStatus:  "Paid",
    invoiceStatus:  "Paid",
    paymentStatus:  "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Google Ads", "Review Management"],
    monthlyValue:   3600,
    renewalDate:    "2025-12-01",
    renewalStatus:  "Active",
    clientHealth:   "Good",
    priority:       "Medium",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-28",
    nextRequiredAction: "Deliver June SEO performance report",
    notes:          "Stable account. Google Ads performing well.",
    activationChecklist: {
      invoicePaid: true, billingCleared: true, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    commissionStatus: "Not Applicable",
  },
  {
    id:             "mc016",
    slug:           "capital-contractors",
    clientName:     "Capital Contractors Group",
    industry:       "Construction – Commercial",
    assignedAM:     "Sarah K.",
    email:          "ops@capitalcontractors.com",
    avatarColor:    "#854d0e",
    currentStatus:  "Active",
    workflowStatus: "In Progress",
    salesStatus:    "Closed Won",
    salesOwner:     "Marco T.",
    billingStatus:  "Overdue",
    invoiceStatus:  "Overdue 15d",
    paymentStatus:  "Overdue",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Website Maintenance", "Monthly Reporting"],
    monthlyValue:   2400,
    renewalDate:    "2025-10-01",
    renewalStatus:  "Active",
    clientHealth:   "At Risk",
    priority:       "High",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-24",
    nextRequiredAction: "Send second billing notice — flag for collections if no response",
    notes:          "Invoice 15 days overdue. No contact response. Escalating.",
    activationChecklist: {
      invoicePaid: false, billingCleared: false, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    commissionStatus: "Not Applicable",
  },
  {
    id:             "mc017",
    slug:           "eastside-veterinary",
    clientName:     "Eastside Veterinary Clinic",
    industry:       "Healthcare – Veterinary",
    assignedAM:     "Alex R.",
    email:          "admin@eastsidevetclinic.com",
    avatarColor:    "#22c55e",
    currentStatus:  "Active",
    workflowStatus: "Complete",
    salesStatus:    "Closed Won",
    salesOwner:     "Chris M.",
    billingStatus:  "Paid",
    invoiceStatus:  "Paid",
    paymentStatus:  "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Content Writing"],
    monthlyValue:   2100,
    renewalDate:    "2026-02-01",
    renewalStatus:  "Active",
    clientHealth:   "Excellent",
    priority:       "Low",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-27",
    nextRequiredAction: "No immediate action needed",
    notes:          "Low-maintenance, high-satisfaction account.",
    activationChecklist: {
      invoicePaid: true, billingCleared: true, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    commissionStatus: "Not Applicable",
  },
  {
    id:             "mc018",
    slug:           "ironclad-security",
    clientName:     "Ironclad Security Systems",
    industry:       "Security Services",
    assignedAM:     "Jordan M.",
    email:          "sales@ironcladsecurity.com",
    avatarColor:    "#1d4ed8",
    currentStatus:  "Renewal Due",
    workflowStatus: "Awaiting Client",
    salesStatus:    "Closed Won",
    salesOwner:     "Jake R.",
    billingStatus:  "Paid",
    invoiceStatus:  "Paid",
    paymentStatus:  "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Meta Ads", "Google Ads", "Monthly Reporting"],
    monthlyValue:   5800,
    renewalDate:    "2025-06-30",
    renewalStatus:  "Schedule Pending",
    clientHealth:   "Good",
    priority:       "High",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-29",
    nextRequiredAction: "Send renewal agreement — 30 days out",
    notes:          "Renewal in 30 days. Client hinted at adding two new locations.",
    activationChecklist: {
      invoicePaid: true, billingCleared: true, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    commissionStatus: "Not Applicable",
  },
  {
    id:             "mc019",
    slug:           "coastal-wellness",
    clientName:     "Coastal Wellness Center",
    industry:       "Health & Wellness – Holistic",
    assignedAM:     "Sarah K.",
    email:          "info@coastalwellness.com",
    avatarColor:    "#a855f7",
    currentStatus:  "Active",
    workflowStatus: "In Progress",
    salesStatus:    "Closed Won",
    salesOwner:     "Tina W.",
    billingStatus:  "Paid",
    invoiceStatus:  "Paid",
    paymentStatus:  "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "Meta Ads", "Email Marketing"],
    monthlyValue:   3300,
    renewalDate:    "2025-11-15",
    renewalStatus:  "Active",
    clientHealth:   "Good",
    priority:       "Medium",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-26",
    nextRequiredAction: "Deliver June content calendar",
    notes:          "Solid retention. Email marketing exceeding benchmarks.",
    activationChecklist: {
      invoicePaid: true, billingCleared: true, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    commissionStatus: "Not Applicable",
  },
  {
    id:             "mc020",
    slug:           "frontier-logistics",
    clientName:     "Frontier Logistics Inc.",
    industry:       "Transportation & Logistics",
    assignedAM:     "Alex R.",
    email:          "hr@frontierlogistics.com",
    avatarColor:    "#0891b2",
    currentStatus:  "Active",
    workflowStatus: "In Progress",
    salesStatus:    "Closed Won",
    salesOwner:     "Jake R.",
    billingStatus:  "Paid",
    invoiceStatus:  "Paid",
    paymentStatus:  "Paid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    cleared:        true,
    activationStatus: "Active",
    onboardingStatus: "Completed",
    activeServices: ["SEO / GBP", "LinkedIn Ads", "Content Writing", "Monthly Reporting"],
    monthlyValue:   4400,
    renewalDate:    "2026-03-15",
    renewalStatus:  "Active",
    clientHealth:   "Excellent",
    priority:       "Medium",
    billingOwner:   "Lisa P.",
    lastActivity:   "2025-05-28",
    nextRequiredAction: "Present Q2 results deck",
    notes:          "B2B client. LinkedIn driving strong pipeline results.",
    activationChecklist: {
      invoicePaid: true, billingCleared: true, contractConfirmed: true,
      servicesConfirmed: true, clientContactVerified: true, amAssigned: true,
      onboardingRecordCreated: true, activationTasksCreated: true,
      kickoffNeeded: false, kickoffCallCompleted: false,
    },
    recentEvents: [],
    commissionStatus: "Not Applicable",
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== RTM OS: Backfill Orphaned Projects ===\n");

  const store = readStore();

  // Build set of clientIds that already have a project
  const existingClientIds = new Set(
    store.projects
      .map((p) => p.clientId as string | undefined)
      .filter(Boolean) as string[]
  );

  console.log(`engine-store.json: ${store.projects.length} projects, ${store.tasks.length} tasks, ${store.milestones.length} milestones\n`);

  let created = 0;
  let skipped = 0;
  const results: string[] = [];

  for (const client of ORPHANED_CLIENTS) {
    if (!ORPHANED_CLIENT_IDS.has(client.id)) {
      console.warn(`  WARN: ${client.id} not in ORPHANED_CLIENT_IDS — skipping`);
      continue;
    }

    if (existingClientIds.has(client.id)) {
      console.log(`  SKIP  ${client.id} (${client.clientName}) — project already exists`);
      skipped++;
      results.push(`SKIP  ${client.id} — already has project`);
      continue;
    }

    const serviceLabel = client.activeServices.length > 0
      ? client.activeServices.join(", ")
      : "(none — offboarding)";
    console.log(`  CREATE ${client.id} (${client.clientName})`);
    console.log(`         services: [${serviceLabel}]`);

    // Derive blueprint IDs exactly as the wizard does
    const bpIds = blueprintIdsForServices(client.activeServices);
    console.log(`         blueprints: [${bpIds.join(", ")}]`);

    // Call the shared project-creation function (identical to wizard)
    const { project, tasks, milestone } = await createEngineProject(
      client,
      client.activeServices,
      bpIds, // pass explicit set (auto-matched, no manual overrides for backfill)
    );

    // Dedup guard — mirrors /api/engine POST handler
    const existingProjectIds   = new Set(store.projects.map((p) => p.id as string));
    const existingMilestoneIds = new Set(store.milestones.map((m) => m.id as string));
    const existingTaskIds      = new Set(store.tasks.map((t) => t.id as string));

    if (!existingProjectIds.has(project.id)) {
      store.projects.push(project as unknown as Record<string, unknown>);
    }
    if (!existingMilestoneIds.has(milestone.id)) {
      store.milestones.push(milestone as unknown as Record<string, unknown>);
    }
    for (const task of tasks) {
      if (!existingTaskIds.has(task.id)) {
        store.tasks.push(task as unknown as Record<string, unknown>);
        existingTaskIds.add(task.id);
      }
    }

    // Mark processed so idempotency guard works on the next loop iteration
    existingClientIds.add(client.id);

    const deptNames = project.departments.map((d) => d.department).join(", ");
    console.log(`         → project ${project.id}`);
    console.log(`           tasks: ${tasks.length} | depts: ${project.departments.length} (${deptNames})`);
    console.log(`           activatedAt: ${project.departments[0]?.activatedAt ?? "n/a"}\n`);

    created++;
    results.push(`CREATE ${client.id} → ${project.id} (${tasks.length} tasks, ${project.departments.length} depts)`);
  }

  // Persist to file
  writeStore(store);

  console.log("=== Summary ===");
  console.log(`Created : ${created}`);
  console.log(`Skipped : ${skipped} (already had a project)`);
  console.log(`\nDetails:`);
  for (const r of results) console.log(`  ${r}`);
  console.log(`\nengine-store.json now has:`);
  console.log(`  projects:   ${store.projects.length}`);
  console.log(`  milestones: ${store.milestones.length}`);
  console.log(`  tasks:      ${store.tasks.length}`);
  console.log("\nDone.");
}

main().catch((err: unknown) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
