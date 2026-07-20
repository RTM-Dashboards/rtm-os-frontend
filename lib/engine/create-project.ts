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

import type { Project, Task, Milestone, DepartmentName, TaskBlueprint } from "./types";
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

// ── Blueprint store access ───────────────────────────────────────────────────
// Reads from /api/task-blueprints — the single source of truth for blueprints
// and the SERVICE_TO_BLUEPRINT activation mapping.
//
// Two helpers are exported for callers that need sync fallbacks or testing:
//   fetchBlueprintStore() — async fetch from the API
//   blueprintIdsForServices() — derives blueprint IDs from service names

export interface BlueprintStore {
  blueprints: TaskBlueprint[];
  serviceMapping: Record<string, string>;
}

/**
 * Fetch blueprints + serviceMapping from the file-backed API store.
 * Falls back to an empty store on fetch failure so the wizard degrades
 * gracefully rather than crashing.
 */
export async function fetchBlueprintStore(): Promise<BlueprintStore> {
  try {
    // In server context (Node.js) we read the JSON file directly to avoid
    // an HTTP round-trip to ourselves.  In browser context the absolute URL
    // is required; we derive it from NEXT_PUBLIC_BASE_URL when set.
    if (typeof window === "undefined") {
      // Server-side: direct file read (same logic as the API route)
      const fs = await import("fs");
      const path = await import("path");
      const DATA_FILE = path.join(process.cwd(), "data", "task-blueprints.json");
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Partial<BlueprintStore>;
      return {
        blueprints: (parsed.blueprints ?? []) as TaskBlueprint[],
        serviceMapping: parsed.serviceMapping ?? {},
      };
    } else {
      // Client-side: HTTP fetch
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
      const res = await fetch(`${base}/api/task-blueprints`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as BlueprintStore;
    }
  } catch (err) {
    console.error("[create-project] fetchBlueprintStore failed:", err);
    return { blueprints: [], serviceMapping: {} };
  }
}

/**
 * Derive the set of blueprint IDs for a list of contracted services.
 * bp-004 (Client Onboarding) is always included, matching wizard behaviour.
 *
 * Pass serviceMapping from fetchBlueprintStore() so the lookup uses the
 * live store rather than any hardcoded table.
 */
export function blueprintIdsForServices(
  services: string[],
  serviceMapping: Record<string, string>,
): string[] {
  const ids = new Set<string>();
  ids.add("bp-004"); // always include onboarding
  for (const svc of services) {
    const key = svc.toLowerCase().trim();
    for (const [pattern, bpId] of Object.entries(serviceMapping)) {
      if (key.includes(pattern)) {
        ids.add(bpId);
        break;
      }
    }
  }
  return Array.from(ids);
}

/**
 * Legacy sync export — kept so any existing callers that pass a mapping
 * explicitly still compile.  Prefer blueprintIdsForServices(services, mapping)
 * with a live-fetched mapping.
 * @deprecated Use blueprintIdsForServices(services, serviceMapping) instead.
 */
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
  // Load blueprints from the file-backed store (single source of truth).
  const { blueprints: liveBlueprints, serviceMapping: liveMapping } =
    await fetchBlueprintStore();
  const bpIds =
    explicitBlueprintIds ?? blueprintIdsForServices(services, liveMapping);
  for (const bpId of bpIds) {
    const bp = liveBlueprints.find((b) => b.id === bpId);
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
