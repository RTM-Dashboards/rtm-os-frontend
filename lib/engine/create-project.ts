// =============================================================================
// RTM OS — Shared Engine Project Creation Logic
// lib/engine/create-project.ts
//
// Canonical, reusable implementation of "create a real engine Project from a
// MasterClient + service list".  Both the AM 2-step Activation Wizard UI and
// the backfill migration script import from here — there is no duplicate
// mechanism.
//
// Extracted from app/(account-management)/account-management/projects/page.tsx
// where this logic was originally written inline.  The wizard component now
// calls createEngineProject() from this module; the migration script also
// calls it directly (without React or a browser environment).
//
// BLUEPRINT MATCHING (mirrors the wizard's SERVICE_TO_BLUEPRINT table exactly):
//   "seo / gbp"           → bp-001 (SEO Launch Blueprint)
//   "seo"                 → bp-001
//   "gbp"                 → bp-002 (GBP Launch Blueprint)
//   "google ads" / "ppc"  → bp-003 (PPC Launch Blueprint)
//   "account management"  → bp-004 (Client Onboarding Blueprint) — always added
//   "onboarding"          → bp-004
//   "monthly reporting"   → bp-005 (Monthly Reporting Blueprint)
//   "reporting"           → bp-005
//   "meta ads" / "facebook ads" → bp-006 (Meta Ads Launch Blueprint)
//   "website build" / "website redesign" → bp-007 (Website Build Blueprint)
//
// Services without a blueprint match (e.g. "Content Writing", "Review
// Management", "LinkedIn Ads") are included in contractSummary and project
// name but do not generate blueprint tasks — identical behaviour to the wizard.
// =============================================================================

import type { Project, Task, Milestone, DepartmentName } from "./types";
import { BLUEPRINTS } from "./mock-data";
import {
  createOnboardingRecord,
  updateOnboardingRecord,
  type SalesPrefillData,
} from "@/lib/mock/am-onboarding-store";
import { MOCK_INTAKE_RECORDS } from "@/lib/sales/intake-config";
import type { MasterClient } from "@/lib/mock/master-clients";

// ── ID generation ─────────────────────────────────────────────────────────────
// Timestamp-based format matches the wizard: <prefix>-<unix-ms-hex>-<4-rnd-hex>
export function genId(prefix: string): string {
  const ts  = Date.now().toString(16);
  const rnd = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
  return `${prefix}-${ts}-${rnd}`;
}

// ── Service → Blueprint ID mapping ───────────────────────────────────────────
// Exact copy of SERVICE_TO_BLUEPRINT from the wizard page (single source of
// truth lives here; wizard page re-exports / delegates to this module).
export const SERVICE_TO_BLUEPRINT: Record<string, string> = {
  "seo / gbp":          "bp-001",
  "seo":                "bp-001",
  "gbp":                "bp-002",
  "google ads":         "bp-003",
  "ppc":                "bp-003",
  "meta ads":           "bp-006",
  "facebook ads":       "bp-006",
  "website build":      "bp-007",
  "website redesign":   "bp-007",
  "monthly reporting":  "bp-005",
  "reporting":          "bp-005",
  "account management": "bp-004",
  "onboarding":         "bp-004",
};

/** Derive the set of blueprint IDs for a list of contracted services.
 *  bp-004 (Client Onboarding) is always included, matching wizard behaviour. */
export function blueprintIdsForServices(services: string[]): string[] {
  const ids = new Set<string>();
  ids.add("bp-004"); // always
  for (const svc of services) {
    const key = svc.toLowerCase().trim();
    for (const [pattern, bpId] of Object.entries(SERVICE_TO_BLUEPRINT)) {
      if (key.includes(pattern)) {
        ids.add(bpId);
        break;
      }
    }
  }
  return Array.from(ids);
}

// ── Project name derivation ───────────────────────────────────────────────────
export function deriveProjectName(clientName: string, services: string[]): string {
  if (services.length === 0) return `${clientName} — General Services`;
  return `${clientName} — ${services.join(" / ")}`;
}

// ── Sales prefill helpers ─────────────────────────────────────────────────────

function findMatchedIntakeRecord(clientName: string) {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  const target = normalize(clientName);
  return MOCK_INTAKE_RECORDS.find((r) => {
    const candidate = normalize(r.businessName);
    return (
      target.includes(candidate) ||
      candidate.includes(target) ||
      target.split(" ").slice(0, 2).join(" ") ===
        candidate.split(" ").slice(0, 2).join(" ")
    );
  });
}

function buildSalesPrefill(client: MasterClient): SalesPrefillData {
  const intake = findMatchedIntakeRecord(client.clientName);
  return {
    clientName:    client.clientName,
    email:         client.email,
    industry:      client.industry,
    salesOwner:    client.salesOwner,
    referralSource: client.referralSource,
    affiliateName:  client.affiliateName,
    activeServices: client.activeServices,
    monthlyValue:   client.monthlyValue,
    primaryContact: intake?.primaryContact,
    phone:          intake?.phone,
    website:        intake?.website,
    location:       intake?.location,
    businessSize:   intake?.businessSize,
    intakeSource:   intake?.intakeSource,
    selectedGoals:  intake?.selectedGoals,
    discoveryNotes:
      typeof intake?.answers?.discoveryNotes === "string"
        ? intake.answers.discoveryNotes
        : undefined,
  };
}

// ── Core project creation ─────────────────────────────────────────────────────

export interface CreateProjectResult {
  project:   Project;
  tasks:     Task[];
  milestone: Milestone;
}

/**
 * Create a complete engine Project (+ tasks + milestone) for a MasterClient.
 *
 * This is the SINGLE canonical implementation used by:
 *   1. The AM 2-step Activation Wizard (UI path via projects/page.tsx)
 *   2. The orphaned-client backfill migration script
 *
 * @param client              - MasterClient record
 * @param services            - contracted service names to stamp on the project
 * @param explicitBlueprintIds - optional override set (wizard uses this to
 *                              include manually-added blueprints beyond auto-match)
 */
export async function createEngineProject(
  client: MasterClient,
  services: string[],
  /** Optional explicit blueprint IDs (overrides auto-matched set when provided) */
  explicitBlueprintIds?: string[],
): Promise<CreateProjectResult> {
  const now         = new Date().toISOString();
  const today       = now.split("T")[0];
  const projectId   = genId("proj-wizard");
  const milestoneId = genId("ms-wizard");
  const projectName = deriveProjectName(client.clientName, services);

  const salesPrefill   = buildSalesPrefill(client);
  const assignedAM     = client.assignedAM !== "Unassigned" ? client.assignedAM : "";
  const onboardingRecord = await createOnboardingRecord(client.id, salesPrefill, assignedAM);
  await updateOnboardingRecord({ ...onboardingRecord, projectId });

  // ── Onboarding task (always created) ────────────────────────────────────────
  const onboardingTaskId = genId("tsk-wizard");
  const onboardingTask: Task = {
    id:               onboardingTaskId,
    projectId,
    milestoneId,
    title:            "Client Onboarding",
    description:      "Complete the onboarding intake form, collect access credentials, and conduct kickoff call.",
    type:             "One-Time",
    source:           "Manual",
    department:       "Account Management",
    service:          "Account Management",
    assignedUserName: assignedAM || "Unassigned",
    createdById:      "u3",
    createdByName:    "Activation Wizard",
    status:           "In Progress",
    priority:         "Urgent",
    dueDate:          new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    estimatedHours:   2,
    dependencies:     [],
    notes:            [],
    files:            [],
    automationHistory: [],
    linkedOnboardingId: onboardingRecord.id,
    createdAt:        now,
    updatedAt:        now,
    clientName:       client.clientName,
    projectName,
  };

  const taskIds: string[] = [onboardingTaskId];
  const tasks: Task[]     = [onboardingTask];

  // ── Blueprint tasks ──────────────────────────────────────────────────────────
  const bpIds = explicitBlueprintIds ?? blueprintIdsForServices(services);
  for (const bpId of bpIds) {
    const bp = BLUEPRINTS.find((b) => b.id === bpId);
    if (!bp) continue;
    for (const bpt of bp.tasks) {
      const tid = genId("tsk-wizard");
      taskIds.push(tid);
      tasks.push({
        id:             tid,
        projectId,
        milestoneId,
        blueprintId:    bpId,
        title:          bpt.name,
        type:           "One-Time",
        source:         "Task Blueprint",
        department:     bpt.department as DepartmentName,
        service:        bp.mappedLineItem,
        assignedUserName: "Unassigned",
        createdById:    "u3",
        createdByName:  "Activation Wizard",
        status:         "Open",
        priority:       bpt.priority,
        dueDate:        new Date(Date.now() + bpt.dueDaysOffset * 86400000).toISOString().split("T")[0],
        estimatedHours: bpt.estimatedHours,
        dependencies:   [],
        notes:          [],
        files:          [],
        automationHistory: [],
        createdAt:      now,
        updatedAt:      now,
        clientName:     client.clientName,
        projectName,
        description:    bpt.description,
      });
    }
  }

  // ── ProjectDepartment entries ────────────────────────────────────────────────
  // activationStatus: "Active" + activatedAt: now — matches the wizard exactly.
  // For backfill records the timestamp is the migration run time, which is the
  // most honest available value (no real historical activation event exists).
  const deptSet = new Set(tasks.map((t) => t.department));
  const departments = Array.from(deptSet).map((dept) => ({
    department:       dept,
    owner:            dept === "Account Management" ? (assignedAM || "Unassigned") : "Unassigned",
    taskIds:          tasks.filter((t) => t.department === dept).map((t) => t.id),
    escalationStatus: "None" as const,
    activationStatus: "Active" as const,
    activatedAt:      now,
  }));

  // ── Milestone ────────────────────────────────────────────────────────────────
  const milestone: Milestone = {
    id:          milestoneId,
    projectId,
    name:        "Service Launch",
    owner:       client.assignedAM,
    status:      "In Progress",
    startDate:   today,
    dueDate:     new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    progress:    0,
    taskIds,
    blueprintId: "bp-004",
  };

  // ── Project record ───────────────────────────────────────────────────────────
  const project: Project = {
    id:              projectId,
    name:            projectName,
    client:          client.clientName,
    clientSlug:      client.slug,
    clientId:        client.id,
    servicePackage:  "Custom",
    contractSummary: `Services: ${services.join(", ")}. Activated ${today}.`,
    owner:           client.assignedAM,
    accountManager:  client.assignedAM,
    departments,
    launchDate:      new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    status:          "In Progress",
    health:          "Green",
    priority:        "High",
    milestoneIds:    [milestoneId],
    taskIds,
    activityLog: [
      {
        id:          genId("act-wizard"),
        projectId,
        eventType:   "Project Created",
        description: `Project created via AM Activation Wizard. Services: ${services.join(", ")}.`,
        actorName:   client.assignedAM,
        timestamp:   now,
      },
    ],
    notes:     `Created by AM Activation Wizard for ${client.clientName}.`,
    createdAt: now,
    updatedAt: now,
  };

  return { project, tasks, milestone };
}
