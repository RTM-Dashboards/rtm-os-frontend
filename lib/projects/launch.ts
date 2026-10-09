// RTM OS — Project Launch
//
// Called when Billing clears a business to Account Management.
// Creates one project per domain, categories per service sold, and setup tasks
// from each service's task list template (falling back to deliverableGroups if
// no template exists).
//
// WHAT THIS RUN DOES:
//   - Creates the project, categories, and setup tasks.
//   - Assigns the AM with the fewest open tasks among Account Management users
//     marked isMain=true. Ties broken by name (alphabetical, first wins).
//   - Routes each task to the member of the task's own department with the
//     fewest open tasks (all tasks, not just this project). Ties broken by name
//     (alphabetical, first wins — deterministic, no random).
//   - A department with no active members leaves the task unassigned; the launch
//     still succeeds. LaunchResult.emptyDepartments lists affected departments.
//   - Returns a LaunchResult describing what was created or why it was skipped.
//
//   DEPENDENCIES (Batch One + Two):
//   - Template tasks carry offsetFrom: "launch" | "prereq" and prereqIds.
//   - prereqIds: stable localId strings of prerequisite tasks within the same
//     template. Reordering tasks never changes which task a dep points at.
//   - Tasks with offsetFrom="launch" get a due date immediately (as before).
//   - Tasks with offsetFrom="prereq" get no due date at launch; the cascade
//     in /api/tasks/done fills the date when the last prerequisite closes.
//   - task_dependencies rows are inserted for each valid prereqId. A localId
//     that is not in the template is silently skipped (the task still launches;
//     the launch does not fail because a template was misconfigured).
//   - Legacy prereqIndices (Batch One format) are still accepted here as a
//     safety net; they are translated to localIds using flat-list position.
//
// WHAT THIS RUN DOES NOT DO:
//   - Recurring tasks are NOT generated. The template records whether a task
//     group is "setup" or "recurring"; only setup groups are processed here.
//   - AM workload counts open tasks in the tasks table. Tasks from this launch
//     count toward the next launch, not the current one (computed before insert).
//
// DOUBLE-LAUNCH PREVENTION:
//   A project for a businessId is only created if none exists. The check is a
//   findFirst on businessId before any write. If a project already exists,
//   LaunchResult.skipped is true and nothing is written.
//
// PARTIAL FAILURE:
//   The launch is not wrapped in a database transaction (Prisma 5's interactive
//   transactions are available but this avoids the complexity for now).
//   If the project is created and a category or task insert fails, the result
//   reports the partial state: projectId is set, categoriesCreated counts what
//   succeeded, errors lists what failed. A project with no categories is better
//   surfaced than hidden — the caller should log the result.

import { prisma } from "@/lib/db/prisma";
import { addBusinessDays } from "@/lib/dates";
import { notifyTaskAssigned, createNotification } from "@/lib/notifications/send";
import {
  ONBOARDING_FIELD_SCHEMA,
  type AMOnboardingFieldDef,
} from "@/lib/mock/am-onboarding-field-schema";

// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * Options for the import path (existing client, no handoff).
 *
 * When supplied, launchProject uses these instead of looking up a SalesHandoff:
 *   - lineItems: service line items to create categories for.
 *   - assignedAMId: AM user id chosen on the import form (not by workload).
 *   - skipSetupTasks: true — import path creates ONLY recurring tasks.
 *
 * When omitted, launchProject behaves exactly as before (Billing clearance path).
 */
export interface LaunchImportOptions {
  lineItems: Array<{ serviceId: string; label: string; department: string }>;
  assignedAMId: string;
  assignedAMName: string;
  skipSetupTasks: true;
}

export interface LaunchResult {
  /** businessId the launch ran for */
  businessId: string;
  /** true if a project already existed and nothing was written */
  skipped: boolean;
  /** existing or newly created project id */
  projectId: string | null;
  /** Account Management User.id assigned, or null if none eligible */
  assignedAMId: string | null;
  /** name of assigned AM, for reporting */
  assignedAMName: string | null;
  /** true when no Main AM was available */
  noEligibleAM: boolean;
  /** number of categories created */
  categoriesCreated: number;
  /** number of tasks created across all categories */
  tasksCreated: number;
  /** number of recurring tasks created (subset of tasksCreated) */
  recurringTasksCreated: number;
  /** departments for which no active member exists; tasks left unassigned */
  emptyDepartments: string[];
  /** id of the onboarding record created at launch, or null if creation failed */
  onboardingRecordId: string | null;
  /** any per-category or per-task errors that occurred */
  errors: string[];
  /**
   * Catalogue service ids that were sold but had no blueprint (neither by
   * direct serviceId match nor by claim). The project is still created;
   * these services get an empty category. Melissa is notified.
   */
  uncoveredServices: string[];
}

// ── BudgetLineItem (subset we need) ──────────────────────────────────────────

interface LineItem {
  serviceId: string;
  label: string;
  department: string;
}

// ── Template task shape ───────────────────────────────────────────────────────
//
// offsetFrom: "launch"  → due date = launchDate + offsetDays (default, existing behaviour)
//             "prereq"  → due date = lastPrereqCloseDate + offsetDays
//                         (no date at launch; cascade fills it later)
//
// prereqIds: stable localId strings of prerequisite tasks within the same template.
//   A localId that is not in the template is silently ignored; the task still
//   launches. This means a template with a stale prereqId (e.g. after a task
//   was removed) creates the task with no dependency row — it behaves as an
//   ordinary task.
//
//   Legacy prereqIndices are also supported here for safety; they are translated
//   using flat-list position.

interface TemplateTaskDef {
  label: string;
  department: string;
  offsetDays: number;
  offsetFrom?: "launch" | "prereq";  // default "launch"
  /** Stable local ids of prerequisite tasks (Batch Two format). */
  prereqIds?: string[];
  /** Legacy index-based prerequisites (Batch One format). Still accepted. */
  prereqIndices?: number[];
  /** Stable id unique within the template. */
  localId?: string;
  /**
   * Recurring tasks only. How many days after completion the next
   * occurrence should be scheduled. Zero/absent = no recurrence.
   */
  intervalDays?: number;
  // Restored per-task fields (RF2 run, 20261008)
  ownerRole?: string;
  estimatedHours?: number;
  priority?: string;
  description?: string;
}

interface TemplateGroup {
  kind: "setup" | "recurring";
  heading: string;
  tasks: TemplateTaskDef[];
}

// ── DeliverableGroup (catalogue fallback) ─────────────────────────────────────

interface DeliverableGroup {
  heading: string;
  bullets: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Calendar addDays retained for non-task-offset uses (e.g. project end-date
// estimates).  Task due-date offsets use addBusinessDays from lib/dates.ts.
function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// ── Onboarding record helpers ────────────────────────────────────────────────
//
// These are local to launch.ts so we can build and write the record without
// calling the HTTP API (which requires a session).

/** Minimal SalesPrefillData shape for the field-assignment builder. */
interface SalesPrefillData {
  clientName: string;
  email: string;
  industry: string;
  salesOwner: string;
  activeServices: string[];
  monthlyValue: number;
  primaryContact?: string;
  phone?: string;
  website?: string;
  location?: string;
  businessSize?: string;
}

/** Minimal FieldAssignment shape matching the shared type. */
interface FieldAssignment {
  fieldId: string;
  status: "unset" | "am-filling" | "am-filled" | "pending-client" | "client-responded";
  value: string;
  assignedAt: string;
  sentToClientAt?: string;
}

function getSalesPrefillValue(
  field: AMOnboardingFieldDef,
  prefill: SalesPrefillData,
): string {
  if (!field.salesPrefillKey) return "";
  const raw = (prefill as unknown as Record<string, unknown>)[field.salesPrefillKey];
  if (raw === undefined || raw === null) return "";
  if (Array.isArray(raw)) return raw.join(", ");
  if (typeof raw === "number") return raw > 0 ? String(raw) : "";
  return String(raw);
}

function buildFieldAssignments(
  prefill: SalesPrefillData,
  assignedAMName: string | null,
): Record<string, FieldAssignment> {
  const now = new Date().toISOString();
  const result: Record<string, FieldAssignment> = {};

  for (const field of ONBOARDING_FIELD_SCHEMA) {
    const prefillValue = getSalesPrefillValue(field, prefill);

    if (field.defaultAssignee === "client") {
      result[field.id] = {
        fieldId:       field.id,
        status:        "pending-client",
        value:         "",
        assignedAt:    now,
        sentToClientAt: undefined,
      };
    } else {
      const hasPrefill = prefillValue.length > 0;
      result[field.id] = {
        fieldId:    field.id,
        status:     hasPrefill ? "am-filled" : "unset",
        value:      prefillValue,
        assignedAt: now,
      };
    }
  }

  // Always prefill the assignedAM field from the chosen AM.
  if (assignedAMName) {
    result["assignedAM"] = {
      fieldId:    "assignedAM",
      status:     "am-filled",
      value:      assignedAMName,
      assignedAt: now,
    };
  }

  return result;
}

// ── Workload router ────────────────────────────────────────────────────────────
//
// Given a department name, return the id of the active member with the fewest
// open/in_progress tasks. Ties broken alphabetically by name (first in sort
// order wins — deterministic).
//
// Returns null when no active member exists in that department.
//
// The per-department member list and task counts are cached in the ownerCache
// map so repeated calls for the same department (common within a launch) do
// not re-query. The cache is local to the launch call; each launch starts fresh.

async function pickOwner(
  department: string,
  ownerCache: Map<string, string | null>,
): Promise<string | null> {
  if (ownerCache.has(department)) {
    return ownerCache.get(department) ?? null;
  }

  const members = await prisma.user.findMany({
    where: { department, status: "active" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (members.length === 0) {
    ownerCache.set(department, null);
    return null;
  }

  const taskCounts = await Promise.all(
    members.map(async (m) => {
      const count = await prisma.task.count({
        where: {
          ownerId: m.id,
          status:  { in: ["open", "in_progress"] },
        },
      });
      return { m, count };
    }),
  );

  // Sort ascending by count; name order (already sorted above) breaks ties.
  taskCounts.sort((a, b) => a.count - b.count);
  const winner = taskCounts[0].m.id;
  ownerCache.set(department, winner);
  return winner;
}

// ── Main launch function ───────────────────────────────────────────────────────

export async function launchProject(
  businessId: string,
  importOptions?: LaunchImportOptions,
): Promise<LaunchResult> {
  const now = new Date().toISOString();
  const launchDate = new Date();

  const result: LaunchResult = {
    businessId,
    skipped:              false,
    projectId:            null,
    assignedAMId:         null,
    assignedAMName:       null,
    noEligibleAM:         false,
    categoriesCreated:    0,
    tasksCreated:         0,
    recurringTasksCreated: 0,
    emptyDepartments:     [],
    onboardingRecordId:   null,
    errors:               [],
    uncoveredServices:    [],
  };

  // Per-launch cache so we query each department at most once.
  const ownerCache = new Map<string, string | null>();

  // ── 1. Double-launch guard ─────────────────────────────────────────────────
  const existingProject = await prisma.project.findFirst({
    where: { businessId },
  });
  if (existingProject) {
    result.skipped   = true;
    result.projectId = existingProject.id;
    return result;
  }

  // ── 2. Load the business ──────────────────────────────────────────────────
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });
  if (!business) {
    result.errors.push(`Business not found: ${businessId}`);
    return result;
  }

  // ── 3. Resolve services sold ──────────────────────────────────────────────
  // Import path: lineItems are supplied directly (no handoff lookup).
  // Standard path: look up the SalesHandoff by processedClientId.
  let lineItems: LineItem[] = [];

  if (importOptions) {
    // Import path — use the caller-supplied line items directly.
    lineItems = importOptions.lineItems;
  } else if (business.clientId) {
    // Standard Billing-clearance path — look up the processed handoff.
    const handoffs = await prisma.salesHandoff.findMany({
      where: { processedClientId: business.clientId },
      select: { lineItems: true },
    });

    const seen = new Set<string>();
    for (const handoff of handoffs) {
      const items = Array.isArray(handoff.lineItems)
        ? (handoff.lineItems as unknown as LineItem[])
        : [];
      for (const item of items) {
        if (item.serviceId && !seen.has(item.serviceId)) {
          seen.add(item.serviceId);
          lineItems.push(item);
        }
      }
    }
  }

  // ── 4. Assign AM to the project ───────────────────────────────────────────
  // Import path: AM is chosen on the form — not by workload.
  // Standard path: pick the Main AM with the fewest open tasks.
  let assignedAMId: string | null = null;
  let assignedAMName: string | null = null;

  if (importOptions) {
    // Import path — use the caller-supplied AM directly.
    assignedAMId   = importOptions.assignedAMId;
    assignedAMName = importOptions.assignedAMName;
    if (!assignedAMId) {
      result.noEligibleAM = true;
    }
  } else {
    // Standard Billing-clearance path — pick by workload.
    const mainAMs = await prisma.user.findMany({
      where: {
        department: "Account Management",
        isMain:     true,
        status:     "active",
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    if (mainAMs.length === 0) {
      result.noEligibleAM = true;
    } else {
      const taskCounts = await Promise.all(
        mainAMs.map(async (am) => {
          const count = await prisma.task.count({
            where: {
              ownerId: am.id,
              status:  { in: ["open", "in_progress"] },
            },
          });
          return { am, count };
        })
      );

      taskCounts.sort((a, b) => a.count - b.count);
      const winner = taskCounts[0];
      assignedAMId   = winner.am.id;
      assignedAMName = winner.am.name;
    }
  }

  result.assignedAMId   = assignedAMId;
  result.assignedAMName = assignedAMName;

  // ── 5. Create the project ─────────────────────────────────────────────────
  // startDate = today. endDate = from the handoff's termLengthMonths (standard path)
  // or null for the import path (no handoff; client is already month-to-month).
  const projectStartDate = launchDate.toISOString().slice(0, 10);
  let projectEndDate: string | null = null;

  if (!importOptions && business.clientId) {
    // Standard Billing-clearance path: derive endDate from the processed handoff.
    const handoff = await prisma.salesHandoff.findFirst({
      where: { processedClientId: business.clientId },
      select: { termLengthMonths: true },
      orderBy: { processedAt: "desc" },
    });
    if (handoff?.termLengthMonths && handoff.termLengthMonths > 0) {
      const endD = new Date(launchDate);
      endD.setMonth(endD.getMonth() + handoff.termLengthMonths);
      projectEndDate = endD.toISOString().slice(0, 10);
    }
  }
  // Import path: endDate stays null. The client is already on a running
  // engagement; there is no handoff term to reference.

  const projectId = makeId("proj");
  const project = await prisma.project.create({
    data: {
      id:         projectId,
      businessId: business.id,
      name:       business.displayName || business.domain,
      status:     "active",
      assignedAM: assignedAMId ?? "",
      startDate:  projectStartDate,
      endDate:    projectEndDate,
      createdAt:  now,
      updatedAt:  now,
    },
  });

  result.projectId = project.id;

  // ── 5b. Create the onboarding record ──────────────────────────────────────────────
  // Every project gets an onboarding record. Created here for ALL projects,
  // regardless of which services were sold. Prefilled from the handoff and
  // the client row.
  //
  // Import path: imported clients are existing clients whose setup work is done.
  // They still get an onboarding record so staff can see client context and the
  // AM has a place to capture contact details. The record starts in
  // "AM In Progress" status with no Sales handoff data (none exists for
  // imported clients); the AM fills it manually. The record is the AM's home
  // base for client context, not just a launch form.

  // Build the prefill from the handoff and client data resolved above.
  // Import path has no handoff; we use what we have from business/lineItems/AM.
  let handoffForPrefill: {
    clientName?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    domain?: string | null;
    address?: unknown;
    termLengthMonths?: number | null;
    monthlyValueCents?: number | null;
    preparedBy?: string;
  } | null = null;

  if (!importOptions && business.clientId) {
    const hof = await prisma.salesHandoff.findFirst({
      where: { processedClientId: business.clientId },
      select: {
        clientName:        true,
        contactName:       true,
        contactEmail:      true,
        contactPhone:      true,
        domain:            true,
        address:           true,
        termLengthMonths:  true,
        monthlyValueCents: true,
        preparedBy:        true,
      },
      orderBy: { processedAt: "desc" },
    });
    handoffForPrefill = hof;
  }

  // Load the client row for any fields not on the handoff.
  const clientRow = business.clientId
    ? await prisma.client.findFirst({
        where: { id: business.clientId },
        select: { fullName: true, email: true, phone: true, company: true, address: true },
      })
    : null;

  // Derive "City, State" from an address JSONB blob.
  function extractLocation(addr: unknown): string {
    if (!addr || typeof addr !== "object") return "";
    const a = addr as Record<string, unknown>;
    const city  = typeof a.city  === "string" ? a.city.trim()  : "";
    const state = typeof a.state === "string" ? a.state.trim() : "";
    if (city && state) return `${city}, ${state}`;
    return city || state;
  }

  const salesPrefill: SalesPrefillData = {
    clientName:     handoffForPrefill?.clientName   || clientRow?.company         || business.displayName || "",
    email:          handoffForPrefill?.contactEmail  || clientRow?.email           || "",
    industry:       "",  // not carried on handoff or client; AM fills manually
    salesOwner:     handoffForPrefill?.preparedBy   || "",
    activeServices: lineItems.map((li) => li.label).filter(Boolean),
    monthlyValue:   handoffForPrefill?.monthlyValueCents
                      ? handoffForPrefill.monthlyValueCents / 100
                      : (business.monthlyValueCents / 100),
    primaryContact: handoffForPrefill?.contactName   || clientRow?.fullName        || "",
    phone:          handoffForPrefill?.contactPhone   || clientRow?.phone           || "",
    website:        handoffForPrefill?.domain         || business.domain            || "",
    location:       extractLocation(handoffForPrefill?.address) ||
                    extractLocation(clientRow?.address),
  };

  const fieldAssignments = buildFieldAssignments(salesPrefill, assignedAMName);

  // Set contractTermMonths from the handoff term length if it matches a known
  // option value ("1", "3", "6", "12", "24").
  if (handoffForPrefill?.termLengthMonths && handoffForPrefill.termLengthMonths > 0) {
    const termId    = "contractTermMonths";
    const allowed   = ["1", "3", "6", "12", "24"];
    const termStr   = String(handoffForPrefill.termLengthMonths);
    if (allowed.includes(termStr)) {
      fieldAssignments[termId] = {
        fieldId:    termId,
        status:     "am-filled",
        value:      termStr,
        assignedAt: now,
      };
    }
  }

  const onboardingRecordId = makeId("onb");
  try {
    await prisma.onboardingRecord.create({
      data: {
        id:               onboardingRecordId,
        projectId:        project.id,
        businessId:       business.id,
        clientId:         business.clientId || "",
        status:           "AM In Progress",
        statusOverride:   null,
        salesPrefill:     salesPrefill as object,
        fieldAssignments: fieldAssignments as object,
        createdAt:        now,
        updatedAt:        now,
      },
    });
    result.onboardingRecordId = onboardingRecordId;
    // Update business.onboardingStatus to reflect that onboarding has started.
    await prisma.business.update({
      where: { id: business.id },
      data:  { onboardingStatus: "in_progress" },
    });
  } catch (err) {
    result.errors.push(
      `Onboarding record: ${err instanceof Error ? err.message : String(err)}`
    );
    // Non-fatal: the project is still usable. Staff can see the error.
  }

  // ── 5c. Always run the onboarding blueprint ─────────────────────────────────────
  // Every new client is onboarded. The blueprint (tlt-bp004, service id
  // "account-management") is NOT a service anyone purchases. It runs
  // unconditionally for every project, before service categories below.
  // The onboarding category is created outside the lineItems loop so that
  // the six tasks always exist regardless of which services were sold.
  //
  // "Complete Onboarding Checklist" (bpt-004-5) receives the onboarding
  // record id. That task's work IS the 25-field form. Opening it routes to
  // the onboarding record.

  const ONBOARDING_SERVICE_ID            = "account-management";
  const ONBOARDING_CHECKLIST_LOCAL_ID    = "bpt-004-5"; // Complete Onboarding Checklist

  try {
    const onbTemplate = await prisma.taskListTemplate.findFirst({
      where: { serviceId: ONBOARDING_SERVICE_ID },
    });

    if (!onbTemplate) {
      result.errors.push(
        `Onboarding blueprint not found (serviceId=${ONBOARDING_SERVICE_ID}). Six onboarding tasks were not created.`
      );
    } else {
      const onbCategoryId = makeId("cat");
      await prisma.projectCategory.create({
        data: {
          id:           onbCategoryId,
          projectId:    project.id,
          serviceId:    ONBOARDING_SERVICE_ID,
          serviceLabel: onbTemplate.name,
          department:   "Account Management",
          createdAt:    now,
        },
      });
      result.categoriesCreated++;

      // Parse setup tasks from the blueprint.
      interface OnbTemplateGroup {
        kind: "setup" | "recurring";
        tasks: TemplateTaskDef[];
      }
      const onbGroups = Array.isArray(onbTemplate.groups)
        ? (onbTemplate.groups as unknown as OnbTemplateGroup[])
        : [];
      const onbSetupTasks: TemplateTaskDef[] = [];
      for (const g of onbGroups) {
        if (g.kind === "setup" && Array.isArray(g.tasks)) {
          for (const t of g.tasks) onbSetupTasks.push(t);
        }
      }

      // localId → index map for legacy prereqIndices translation.
      const onbLocalIdByIndex = onbSetupTasks.map((t) => t.localId ?? "");

      // Create tasks; track localId → db task id.
      const onbTaskIdByLocalId = new Map<string, string | null>();

      for (const taskDef of onbSetupTasks) {
        const dept = (taskDef.department || "Account Management").trim();
        // Prefer the project's assigned AM for all onboarding tasks; fall back
        // to department workload routing if no AM was assigned.
        const ownerId = assignedAMId ?? (await pickOwner(dept, ownerCache));
        if (ownerId === null && !result.emptyDepartments.includes(dept)) {
          result.emptyDepartments.push(dept);
        }

        const hasPrereqs    = taskDef.offsetFrom === "prereq";
        const launchDateStr = launchDate.toISOString().slice(0, 10);
        const dueDate       = hasPrereqs
          ? null
          : addBusinessDays(launchDateStr, taskDef.offsetDays ?? 0);

        // The "Complete Onboarding Checklist" task carries the record id.
        const isChecklistTask = taskDef.localId === ONBOARDING_CHECKLIST_LOCAL_ID;

        try {
          const taskId = makeId("task");
          await prisma.task.create({
            data: {
              id:                     taskId,
              categoryId:             onbCategoryId,
              label:                  taskDef.label,
              status:                 "open",
              ownerId,
              department:             dept || null,
              dueDate,
              offsetFrom:             taskDef.offsetFrom ?? "launch",
              offsetDays:             taskDef.offsetDays ?? 0,
              isSetup:                true,
              isRecurring:            false,
              recurrenceIntervalDays: 0,
              ownerRole:              taskDef.ownerRole       ?? null,
              estimatedHours:         typeof taskDef.estimatedHours === "number"
                                        ? taskDef.estimatedHours
                                        : null,
              priority:               taskDef.priority        ?? null,
              description:            taskDef.description     ?? null,
              onboardingRecordId:     isChecklistTask && result.onboardingRecordId
                                        ? result.onboardingRecordId
                                        : null,
              createdAt:              now,
              updatedAt:              now,
            },
          });
          if (taskDef.localId) onbTaskIdByLocalId.set(taskDef.localId, taskId);
          result.tasksCreated++;
          // Notify the owner that this task has been assigned to them.
          // notifyTaskAssigned never throws; a failure is logged, not re-raised.
          if (ownerId) {
            notifyTaskAssigned({
              ownerId,
              taskId,
              taskLabel:   taskDef.label,
              projectId:   project.id,
              projectName: project.name,
            }).catch(() => { /* swallowed — launch must not fail on notification errors */ });
          }
        } catch (err) {
          result.errors.push(
            `Onboarding task "${taskDef.label}": ${
              err instanceof Error ? err.message : String(err)
            }`
          );
          if (taskDef.localId) onbTaskIdByLocalId.set(taskDef.localId, null);
        }
      }

      // Insert dependency rows for the onboarding tasks.
      const onbDepNow = new Date().toISOString();
      for (const taskDef of onbSetupTasks) {
        if (!taskDef.localId) continue;
        const taskId = onbTaskIdByLocalId.get(taskDef.localId);
        if (!taskId) continue;
        const prereqIds: string[] = [];
        const seenDep = new Set<string>();
        for (const id of taskDef.prereqIds ?? []) {
          if (id && !seenDep.has(id)) { prereqIds.push(id); seenDep.add(id); }
        }
        for (const idx of taskDef.prereqIndices ?? []) {
          const id = onbLocalIdByIndex[idx] ?? "";
          if (id && !seenDep.has(id)) { prereqIds.push(id); seenDep.add(id); }
        }
        for (const prereqLocalId of prereqIds) {
          if (!onbTaskIdByLocalId.has(prereqLocalId)) continue;
          const prereqTaskId = onbTaskIdByLocalId.get(prereqLocalId);
          if (!prereqTaskId) continue;
          try {
            await prisma.taskDependency.create({
              data: {
                id:             makeId("dep"),
                taskId,
                requiresTaskId: prereqTaskId,
                createdAt:      onbDepNow,
              },
            });
          } catch (err) {
            result.errors.push(
              `Onboarding dep "${prereqLocalId}"→"${taskDef.localId}": ${
                err instanceof Error ? err.message : String(err)
              }`
            );
          }
        }
      }
    }
  } catch (err) {
    result.errors.push(
      `Onboarding blueprint: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // ── 5d. Always run the Monthly Reporting blueprint ──────────────────────────
  // Like Client Onboarding, Monthly Reporting (serviceId="reporting") runs on
  // every project regardless of what was sold. Reporting is not a purchasable
  // service; it has no catalogue row. Its blueprint is tlt-bp005.

  const REPORTING_SERVICE_ID = "reporting";

  try {
    const repTemplate = await prisma.taskListTemplate.findFirst({
      where: { serviceId: REPORTING_SERVICE_ID },
    });

    if (!repTemplate) {
      result.errors.push(
        `Monthly Reporting blueprint not found (serviceId=${REPORTING_SERVICE_ID}). Reporting tasks were not created.`
      );
    } else {
      const repCategoryId = makeId("cat");
      await prisma.projectCategory.create({
        data: {
          id:           repCategoryId,
          projectId:    project.id,
          serviceId:    REPORTING_SERVICE_ID,
          serviceLabel: repTemplate.name,
          department:   repTemplate.department || "Reporting",
          createdAt:    now,
        },
      });
      result.categoriesCreated++;

      interface RepTemplateGroup {
        kind: "setup" | "recurring";
        tasks: TemplateTaskDef[];
      }
      const repGroups = Array.isArray(repTemplate.groups)
        ? (repTemplate.groups as unknown as RepTemplateGroup[])
        : [];
      const repSetupTasks: TemplateTaskDef[] = [];
      for (const g of repGroups) {
        if (g.kind === "setup" && Array.isArray(g.tasks)) {
          for (const t of g.tasks) repSetupTasks.push(t);
        }
      }

      const repLocalIdByIndex = repSetupTasks.map((t) => t.localId ?? "");
      const repTaskIdByLocalId = new Map<string, string | null>();

      for (const taskDef of repSetupTasks) {
        const dept   = (taskDef.department || "Reporting").trim();
        const ownerId = await pickOwner(dept, ownerCache);
        if (ownerId === null && !result.emptyDepartments.includes(dept)) {
          result.emptyDepartments.push(dept);
        }
        const hasPrereqs    = taskDef.offsetFrom === "prereq";
        const launchDateStr = launchDate.toISOString().slice(0, 10);
        const dueDate       = hasPrereqs ? null : addBusinessDays(launchDateStr, taskDef.offsetDays ?? 0);

        try {
          const taskId = makeId("task");
          await prisma.task.create({
            data: {
              id:                     taskId,
              categoryId:             repCategoryId,
              label:                  taskDef.label,
              status:                 "open",
              ownerId,
              department:             dept || null,
              dueDate,
              offsetFrom:             taskDef.offsetFrom ?? "launch",
              offsetDays:             taskDef.offsetDays ?? 0,
              isSetup:                true,
              isRecurring:            false,
              recurrenceIntervalDays: 0,
              ownerRole:              taskDef.ownerRole       ?? null,
              estimatedHours:         typeof taskDef.estimatedHours === "number"
                                        ? taskDef.estimatedHours
                                        : null,
              priority:               taskDef.priority        ?? null,
              description:            taskDef.description     ?? null,
              onboardingRecordId:     null,
              createdAt:              now,
              updatedAt:              now,
            },
          });
          if (taskDef.localId) repTaskIdByLocalId.set(taskDef.localId, taskId);
          result.tasksCreated++;
          if (ownerId) {
            notifyTaskAssigned({
              ownerId,
              taskId,
              taskLabel:   taskDef.label,
              projectId:   project.id,
              projectName: project.name,
            }).catch(() => { /* swallowed */ });
          }
        } catch (err) {
          result.errors.push(
            `Reporting task "${taskDef.label}": ${
              err instanceof Error ? err.message : String(err)
            }`
          );
          if (taskDef.localId) repTaskIdByLocalId.set(taskDef.localId, null);
        }
      }

      // Insert dependency rows.
      const repDepNow = new Date().toISOString();
      for (const taskDef of repSetupTasks) {
        if (!taskDef.localId) continue;
        const taskId = repTaskIdByLocalId.get(taskDef.localId);
        if (!taskId) continue;
        const prereqIds: string[] = [];
        const seenDep = new Set<string>();
        for (const id of taskDef.prereqIds ?? []) {
          if (id && !seenDep.has(id)) { prereqIds.push(id); seenDep.add(id); }
        }
        for (const idx of taskDef.prereqIndices ?? []) {
          const id = repLocalIdByIndex[idx] ?? "";
          if (id && !seenDep.has(id)) { prereqIds.push(id); seenDep.add(id); }
        }
        for (const prereqLocalId of prereqIds) {
          if (!repTaskIdByLocalId.has(prereqLocalId)) continue;
          const prereqTaskId = repTaskIdByLocalId.get(prereqLocalId);
          if (!prereqTaskId) continue;
          try {
            await prisma.taskDependency.create({
              data: {
                id:             makeId("dep"),
                taskId,
                requiresTaskId: prereqTaskId,
                createdAt:      repDepNow,
              },
            });
          } catch (err) {
            result.errors.push(
              `Reporting dep "${prereqLocalId}"→"${taskDef.localId}": ${
                err instanceof Error ? err.message : String(err)
              }`
            );
          }
        }
      }
    }
  } catch (err) {
    result.errors.push(
      `Monthly Reporting blueprint: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // ── 5e. Build claim index ───────────────────────────────────────────────────────
  // Load all blueprints that claim catalogue service ids, and build a map
  // serviceId → template.id so the line-item loop can resolve by claim.
  // This is done once before the loop so we do not re-query inside it.
  //
  // Two blueprints claiming the same service id is prevented at save time;
  // but if it happened (e.g. by direct DB edit), we take the first result.

  const claimIndex = new Map<string, string>(); // catalogueServiceId → template.serviceId
  try {
    const allTemplates = await prisma.taskListTemplate.findMany({
      select: { serviceId: true, claimedServiceIds: true },
    });
    for (const tpl of allTemplates) {
      for (const sid of tpl.claimedServiceIds) {
        if (!claimIndex.has(sid)) {
          claimIndex.set(sid, tpl.serviceId);
        }
      }
    }
  } catch (err) {
    result.errors.push(
      `Claim index load: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // ── 6. Create categories and tasks ────────────────────────────────────────
  for (const item of lineItems) {
    // Resolve department label from catalogue (for the category row).
    let categoryDept = item.department ?? "";
    let catalogLabel = item.label ?? item.serviceId;

    try {
      const catalogItem = await prisma.serviceCatalogItem.findUnique({
        where: { id: item.serviceId },
        select: { department: true, label: true, deliverableGroups: true },
      });
      if (catalogItem) {
        categoryDept = catalogItem.department || categoryDept;
        catalogLabel = catalogItem.label      || catalogLabel;
      }

      // Create the category. department here is the category-level label;
      // individual tasks have their own department from the template.
      const categoryId = makeId("cat");
      await prisma.projectCategory.create({
        data: {
          id:           categoryId,
          projectId:    project.id,
          serviceId:    item.serviceId,
          serviceLabel: catalogLabel,
          department:   categoryDept,
          createdAt:    now,
        },
      });
      result.categoriesCreated++;

      // Resolve task list template for this service.
      // Priority: direct serviceId match, then claim table.
      // A deleted-service claim (id not in catalogue) cannot break a launch —
      // findFirst simply returns null and the category is created empty/flagged.
      let template = await prisma.taskListTemplate.findFirst({
        where: { serviceId: item.serviceId },
      });

      if (!template) {
        // Try claim index: some blueprint has listed this serviceId in
        // its claimedServiceIds array.
        const claimedBlueprintServiceId = claimIndex.get(item.serviceId);
        if (claimedBlueprintServiceId) {
          template = await prisma.taskListTemplate.findFirst({
            where: { serviceId: claimedBlueprintServiceId },
          });
        }
      }

      // Flag uncovered services. The category is still created (above); it will
      // just be empty. The flag is stored on the result and on the project row.
      if (!template) {
        result.uncoveredServices.push(item.serviceId);
      }

      // ── Flatten setup tasks from template ──────────────────────────────────
      // We build a flat ordered list of all setup tasks across all setup groups.
      // Template prerequisite indices refer to positions in THIS flat list.

      interface FlatTask {
        localId: string;       // stable local id (empty string for fallback tasks)
        label: string;
        department: string;
        offsetDays: number;
        offsetFrom: "launch" | "prereq";
        /** Resolved to localId strings (may include legacy index translations). */
        prereqLocalIds: string[];
        /** True when this task came from a recurring group. */
        isRecurring: boolean;
        /**
         * Days after completion to schedule next occurrence.
         * Only meaningful when isRecurring=true and > 0.
         */
        intervalDays: number;
        // Restored per-task fields (RF2 run, 20261008)
        ownerRole: string | null;
        estimatedHours: number | null;
        priority: string | null;
        description: string | null;
      }

      const flatTasks: FlatTask[] = [];

      if (template) {
        const groups = Array.isArray(template.groups)
          ? (template.groups as unknown as TemplateGroup[])
          : [];

        // Collect setup AND recurring tasks in flat order.
        // We keep them separate by group kind so we can set isRecurring correctly.
        // Legacy index translation: indices are relative to the setup group only
        // (recurring tasks cannot have prerequisites, so indices only matter for setup).
        const setupRaw: TemplateTaskDef[] = [];
        const recurringRaw: TemplateTaskDef[] = [];
        for (const group of groups) {
          if (!Array.isArray(group.tasks)) continue;
          if (group.kind === "setup") {
            for (const t of group.tasks) setupRaw.push(t);
          } else if (group.kind === "recurring") {
            for (const t of group.tasks) recurringRaw.push(t);
          }
        }

        // Build localId→position map for legacy index translation (setup only).
        const localIdByIndex = setupRaw.map((t) => t.localId ?? "");

        // Process setup tasks (with dependency support).
        // Import path: skip setup tasks — existing clients already have their
        // setup work done. Only recurring tasks are created on import.
        const processSetup = !importOptions?.skipSetupTasks;
        for (const t of (processSetup ? setupRaw : [])) {
          const prereqLocalIds: string[] = [];
          const seen = new Set<string>();

          for (const id of t.prereqIds ?? []) {
            if (id && !seen.has(id)) { prereqLocalIds.push(id); seen.add(id); }
          }
          for (const idx of t.prereqIndices ?? []) {
            const id = localIdByIndex[idx] ?? "";
            if (id && !seen.has(id)) { prereqLocalIds.push(id); seen.add(id); }
          }

          flatTasks.push({
            localId:        t.localId ?? "",
            label:          t.label,
            department:     t.department ?? "",
            offsetDays:     t.offsetDays ?? 0,
            offsetFrom:     t.offsetFrom ?? "launch",
            prereqLocalIds,
            isRecurring:    false,
            intervalDays:   0,
            ownerRole:      t.ownerRole      ?? null,
            estimatedHours: typeof t.estimatedHours === "number" ? t.estimatedHours : null,
            priority:       t.priority       ?? null,
            description:    t.description    ?? null,
          });
        }

        // Process recurring tasks (no dependencies; intervalDays required).
        for (const t of recurringRaw) {
          const interval = typeof t.intervalDays === "number" && t.intervalDays > 0
            ? t.intervalDays
            : 0;
          // Skip recurring tasks with no interval — they cannot recur and are
          // not useful as plain one-off tasks either. Log and skip.
          if (interval === 0) {
            result.errors.push(
              `Recurring task "${t.label}" has no interval and was skipped (set a repeat interval in the task list editor)`
            );
            continue;
          }

          flatTasks.push({
            localId:        t.localId ?? "",
            label:          t.label,
            department:     t.department ?? "",
            offsetDays:     t.offsetDays ?? 0,
            offsetFrom:     "launch",   // recurring tasks always offset from launch
            prereqLocalIds: [],
            isRecurring:    true,
            intervalDays:   interval,
            ownerRole:      t.ownerRole      ?? null,
            estimatedHours: typeof t.estimatedHours === "number" ? t.estimatedHours : null,
            priority:       t.priority       ?? null,
            description:    t.description    ?? null,
          });
        }
      } else if (catalogItem) {
        // Fall back to deliverableGroups bullets as tasks.
        // No per-task department in this fallback; use the category's department.
        // Fallback tasks never have prerequisites — no template means no deps.
        const deliverableGroups = Array.isArray(catalogItem.deliverableGroups)
          ? (catalogItem.deliverableGroups as unknown as DeliverableGroup[])
          : [];
        for (const group of deliverableGroups) {
          if (Array.isArray(group.bullets)) {
            for (const bullet of group.bullets) {
              flatTasks.push({
                localId:        "",
                label:          bullet,
                department:     categoryDept,
                offsetDays:     0,
                offsetFrom:     "launch",
                prereqLocalIds: [],
                isRecurring:    false,
                intervalDays:   0,
                ownerRole:      null,
                estimatedHours: null,
                priority:       null,
                description:    null,
              });
            }
          }
        }
      }
      // If neither template nor deliverableGroups has content, flatTasks stays []
      // and the category is empty — correct per spec.

      // ── Create tasks, tracking their db ids by localId ────────────────────
      // We insert all tasks first (building a localId→dbTaskId map), then
      // insert dependency rows. This avoids ordering constraints and makes
      // reordering safe: deps reference stable localIds, not positions.

      // Map: template localId → created db task id (null if insert failed).
      const taskIdByLocalId = new Map<string, string | null>();

      for (const taskDef of flatTasks) {
        const dept = taskDef.department.trim();
        let ownerId: string | null = null;

        if (dept) {
          ownerId = await pickOwner(dept, ownerCache);
          if (ownerId === null && !result.emptyDepartments.includes(dept)) {
            result.emptyDepartments.push(dept);
          }
        }

        // A task with offsetFrom="prereq" gets no due date at launch.
        // A task with offsetFrom="launch" gets offsetDays from launchDate.
        // Recurring tasks always use offsetFrom="launch" at first occurrence.
        const hasPrerequisites = taskDef.offsetFrom === "prereq";
        const launchDateStr = launchDate.toISOString().slice(0, 10);
        const dueDate = hasPrerequisites ? null : addBusinessDays(launchDateStr, taskDef.offsetDays);

        try {
          const taskId = makeId("task");
          await prisma.task.create({
            data: {
              id:                     taskId,
              categoryId,
              label:                  taskDef.label,
              status:                 "open",
              ownerId,
              department:             dept || null,
              dueDate,
              offsetFrom:             taskDef.offsetFrom,
              offsetDays:             taskDef.offsetDays,
              isSetup:                !taskDef.isRecurring,
              isRecurring:            taskDef.isRecurring,
              recurrenceIntervalDays: taskDef.intervalDays,
              // Restored per-task fields from template (RF2 run, 20261008)
              ownerRole:      taskDef.ownerRole,
              estimatedHours: taskDef.estimatedHours,
              priority:       taskDef.priority,
              description:    taskDef.description,
              createdAt:      now,
              updatedAt:      now,
            },
          });
          if (taskDef.localId) taskIdByLocalId.set(taskDef.localId, taskId);
          result.tasksCreated++;
          if (taskDef.isRecurring) result.recurringTasksCreated++;
          // Notify the owner that this task has been assigned to them.
          // Only for setup tasks (recurring tasks fire on completion, not launch).
          // notifyTaskAssigned never throws.
          if (ownerId && !taskDef.isRecurring) {
            notifyTaskAssigned({
              ownerId,
              taskId,
              taskLabel:   taskDef.label,
              projectId:   project.id,
              projectName: project.name,
            }).catch(() => { /* swallowed — launch must not fail on notification errors */ });
          }
        } catch (err) {
          result.errors.push(
            `Task "${taskDef.label}": ${err instanceof Error ? err.message : String(err)}`
          );
          if (taskDef.localId) taskIdByLocalId.set(taskDef.localId, null);
        }
      }

      // ── Insert dependency rows ────────────────────────────────────────────
      // For each task with prereqLocalIds, insert one task_dependencies row per
      // valid localId. A localId not found in the map (stale reference after a
      // task was removed) is silently skipped — the task behaves as unrestricted.
      // A null db task id (failed task insert above) is also skipped.

      const depNow = new Date().toISOString();
      for (const taskDef of flatTasks) {
        if (!taskDef.localId) continue;
        const taskId = taskIdByLocalId.get(taskDef.localId);
        if (!taskId) continue;
        if (!taskDef.prereqLocalIds || taskDef.prereqLocalIds.length === 0) continue;

        for (const prereqLocalId of taskDef.prereqLocalIds) {
          if (!taskIdByLocalId.has(prereqLocalId)) {
            // Dangling ref (task removed from template): silently skip.
            continue;
          }
          const prereqTaskId = taskIdByLocalId.get(prereqLocalId);
          if (!prereqTaskId) continue; // prereq task failed to create; skip

          try {
            await prisma.taskDependency.create({
              data: {
                id:             makeId("dep"),
                taskId,
                requiresTaskId: prereqTaskId,
                createdAt:      depNow,
              },
            });
          } catch (err) {
            // Dep insert failure is non-fatal. The task exists; it just won't
            // be blocked properly. Report it.
            result.errors.push(
              `Dependency "${prereqLocalId}"→"${taskDef.localId}" for task "${taskDef.label}": ` +
              (err instanceof Error ? err.message : String(err))
            );
          }
        }
      }
    } catch (err) {
      result.errors.push(
        `Service ${item.serviceId}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // ── 7. Flag uncovered services ──────────────────────────────────────────────────
  // If any sold services had no blueprint, write them onto the project row so
  // they are visible without a notification, and send one notification to the
  // Account Management manager (or Executive if no manager exists).
  //
  // Notification routing:
  //   - Account Management manager (first alphabetically by name).
  //   - If no manager: any Executive (matching raiseEscalation's logic).
  //   - If no Executive: any SystemAdmin.
  //   - If none of the above: log only; launch still succeeds.
  //
  // This block must not throw. All errors go to result.errors.

  if (result.uncoveredServices.length > 0) {
    // Persist the flag on the project row.
    try {
      await prisma.project.update({
        where: { id: project.id },
        data:  { flaggedServices: result.uncoveredServices },
      });
    } catch (err) {
      result.errors.push(
        `Flag persist: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    // Find the notification recipient.
    const serviceList = result.uncoveredServices.join(", ");
    const notifMessage =
      `Project “${project.name}” was launched with services that have no task blueprint: ${serviceList}. ` +
      `Please create blueprints for these services so the work is tracked.`;
    const notifLink = `/tasks/templates`;

    try {
      let recipientId: string | null = null;

      // 1. Account Management manager.
      const amManager = await prisma.user.findFirst({
        where:   { department: "Account Management", role: "Manager", status: "active" },
        select:  { id: true },
        orderBy: { name: "asc" },
      });
      if (amManager) recipientId = amManager.id;

      // 2. Any Executive.
      if (!recipientId) {
        const exec = await prisma.user.findFirst({
          where:   { role: "Executive", status: "active" },
          select:  { id: true },
          orderBy: { name: "asc" },
        });
        if (exec) recipientId = exec.id;
      }

      // 3. Any SystemAdmin.
      if (!recipientId) {
        const sa = await prisma.user.findFirst({
          where:   { role: "SystemAdmin", status: "active" },
          select:  { id: true },
          orderBy: { name: "asc" },
        });
        if (sa) recipientId = sa.id;
      }

      if (recipientId) {
        createNotification({
          recipientId,
          type:             "uncovered_service",
          message:          notifMessage,
          link:             notifLink,
          concernAboutType: "project",
          concernAboutId:   project.id,
        }).catch(() => { /* swallowed — launch must not fail on notification errors */ });
      } else {
        result.errors.push(
          `Uncovered-service notification: no Account Management manager, Executive, or SystemAdmin found.`
        );
      }
    } catch (err) {
      result.errors.push(
        `Uncovered-service notification: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return result;
}
