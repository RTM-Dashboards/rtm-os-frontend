// RTM OS — Recurring Task Generation Engine
//
// generateRecurringTasks(projectId)
//
// Ensures every recurring task definition in each of this project's service
// blueprints has occurrences generated through the next 90 days from today.
//
// DESIGN DECISIONS:
//
//   Lazy, not scheduled.
//     This function is called on project read and exposed as an authenticated
//     API route. It does not require a cron job and does not block read paths
//     (the route is separate). Run it on demand or on project load.
//
//   Idempotent.
//     Each generated occurrence has an occurrence_key stored in the tasks table
//     with a UNIQUE constraint. Format:
//       "<templateId>:<blueprintTaskLocalId>:<categoryId>:<dueDate>"
//     Example: "tlt-bp001:bpt-001-r1:cat-173456789:2026-11-14"
//     Running the engine twice for the same project produces no duplicates.
//
//   No backdating.
//     Occurrences are only generated for due dates >= today. Past due dates
//     are skipped and counted. The count is returned in the result and logged.
//
//   Calendar-day intervals.
//     Recurrence intervals are calendar days (not business days). Task offsets
//     inside a blueprint group use addOffsetDays (lib/dates.ts), which branches
//     on template.dueDateOffsetExcludeWeekends. Only the recurrence interval
//     (intervalDays field on the blueprint task) advances by plain calendar
//     arithmetic.
//
//   Owner continuity.
//     A new occurrence inherits the owner of the most recent prior occurrence
//     of the same blueprint task in the same category, provided that user is
//     still active AND still in the task's department. If the prior owner is
//     not eligible, pickOwner is called (same workload-routing logic as launch).
//
//   Active test.
//     The engine only runs for projects with status = "active". Planned,
//     on_hold, complete, and cancelled projects generate nothing.
//
//   Service stop condition.
//     The engine iterates over project_categories. A category with no
//     blueprint (or whose blueprint has no recurring tasks) produces nothing
//     for that category — no error, no partial failure. A category that was
//     added to a project for a service that no longer has a blueprint is
//     simply skipped. This is the effective "service removed" guard: if a
//     category exists but there is no live recurring task definition covering
//     it, nothing is generated.
//
//   Notifications.
//     createNotification (lib/notifications/send.ts) is called for each new
//     occurrence to notify the owner. It never throws. A notification failure
//     never blocks generation.
//
//   No new notification path.
//     Uses only createNotification and notifyTaskAssigned from send.ts.

import { prisma } from "@/lib/db/prisma";
import { addOffsetDays } from "@/lib/dates";
import { createNotification } from "@/lib/notifications/send";

// ── Constants ────────────────────────────────────────────────────────────────

/** Generate occurrences this many calendar days into the future from today. */
const WINDOW_DAYS = 90;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RecurringGenerationResult {
  /** projectId this ran for */
  projectId: string;
  /** false when the project is not active or not found */
  ran: boolean;
  /** reason generation was skipped entirely */
  skipReason?: string;
  /** total new task rows inserted */
  generated: number;
  /**
   * Occurrences whose due date would have fallen before today — skipped,
   * not inserted. Past occurrences are never backdated.
   */
  skippedPast: number;
  /**
   * Occurrences whose occurrence_key already existed in the table — skipped
   * because a previous run already created them (idempotency guard).
   */
  skippedDuplicate: number;
  /** per-task errors (non-fatal; generation continues after each one) */
  errors: string[];
}

// ── Blueprint recurring task shape ────────────────────────────────────────────

interface BlueprintTask {
  localId: string;
  label: string;
  department: string;
  offsetDays: number;
  intervalDays: number;   // calendar days between occurrences
  ownerRole?: string;
  estimatedHours?: number;
  priority?: string;
  description?: string;
}

interface BlueprintGroup {
  kind: "setup" | "recurring";
  heading: string;
  tasks: Array<{
    localId?: string;
    label?: string;
    department?: string;
    offsetDays?: number;
    intervalDays?: number;
    ownerRole?: string;
    estimatedHours?: number;
    priority?: string;
    description?: string;
  }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Add `days` calendar days to a YYYY-MM-DD string.
 * Uses UTC to avoid DST shifts.
 */
function addCalendarDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Compare two YYYY-MM-DD strings. Returns negative if a < b.
 */
function compareDates(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Return today's date as YYYY-MM-DD in UTC.
 * Using UTC consistently avoids timezone-dependent "today" divergence.
 */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Return today + WINDOW_DAYS as YYYY-MM-DD in UTC.
 */
function windowEndUTC(): string {
  return addCalendarDays(todayUTC(), WINDOW_DAYS);
}

// ── pickOwner (mirrors launch.ts — shared cache per call) ─────────────────────
//
// Returns the User.id of the active member of `department` with the fewest
// open tasks. Ties broken alphabetically by name.
// Returns null if no active member exists.

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
        where: { ownerId: m.id, status: { in: ["open", "in_progress"] } },
      });
      return { m, count };
    }),
  );

  taskCounts.sort((a, b) => a.count - b.count);
  const winner = taskCounts[0].m.id;
  ownerCache.set(department, winner);
  return winner;
}

// ── Main function ─────────────────────────────────────────────────────────────

/**
 * Generate recurring task occurrences for a project through the next 90 days.
 *
 * Safe to call multiple times — idempotent via occurrence_key unique constraint.
 * Only generates for active projects.
 *
 * @param projectId The Project.id to generate for.
 */
export async function generateRecurringTasks(
  projectId: string,
): Promise<RecurringGenerationResult> {
  const result: RecurringGenerationResult = {
    projectId,
    ran:              false,
    generated:        0,
    skippedPast:      0,
    skippedDuplicate: 0,
    errors:           [],
  };

  // ── 1. Load project ────────────────────────────────────────────────────────

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    result.skipReason = `Project not found: ${projectId}`;
    return result;
  }

  // Active test: only "active" projects generate recurring tasks.
  // "planned", "on_hold", "complete", and "cancelled" are all skipped.
  if (project.status !== "active") {
    result.skipReason = `Project status is "${project.status}" (must be "active")`;
    return result;
  }

  result.ran = true;

  const today     = todayUTC();
  const windowEnd = windowEndUTC();
  const now       = new Date().toISOString();

  // Per-run cache to avoid redundant department workload queries.
  const ownerCache = new Map<string, string | null>();

  // ── 2. Load categories ────────────────────────────────────────────────────

  const categories = await prisma.projectCategory.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  // ── 3. Per-category generation ────────────────────────────────────────────

  for (const category of categories) {
    try {
      // Resolve the blueprint for this category's serviceId.
      // We try direct match first, then the claim index (same as launch.ts).
      let template = await prisma.taskListTemplate.findFirst({
        where: { serviceId: category.serviceId },
      });

      if (!template && category.serviceId) {
        // Check claim index: some template may claim this serviceId.
        const claimingTemplate = await prisma.taskListTemplate.findFirst({
          where: { claimedServiceIds: { has: category.serviceId } },
        });
        if (claimingTemplate) template = claimingTemplate;
      }

      if (!template) {
        // No blueprint for this category. Skip silently (no error — this is
        // the "service removed from blueprint" stop condition).
        continue;
      }

      // Extract recurring task definitions from the blueprint.
      const groups = Array.isArray(template.groups)
        ? (template.groups as unknown as BlueprintGroup[])
        : [];

      const recurringTasks: BlueprintTask[] = [];
      for (const group of groups) {
        if (group.kind !== "recurring") continue;
        if (!Array.isArray(group.tasks)) continue;
        for (const t of group.tasks) {
          // Validate: recurring tasks must have a localId and an interval.
          if (!t.localId || typeof t.localId !== "string") continue;
          const interval =
            typeof t.intervalDays === "number" && t.intervalDays > 0
              ? t.intervalDays
              : 0;
          if (interval === 0) {
            // No interval — cannot recur. Log and skip.
            result.errors.push(
              `Blueprint task "${t.label ?? "(no label)"}" in template ${template.id} has no intervalDays; skipped`,
            );
            continue;
          }
          recurringTasks.push({
            localId:        t.localId,
            label:          t.label          ?? "",
            department:     t.department     ?? template.department ?? "",
            offsetDays:     t.offsetDays     ?? 0,
            intervalDays:   interval,
            ownerRole:      t.ownerRole,
            estimatedHours: typeof t.estimatedHours === "number" ? t.estimatedHours : undefined,
            priority:       t.priority,
            description:    t.description,
          });
        }
      }

      if (recurringTasks.length === 0) {
        // Blueprint has no recurring tasks for this category — nothing to do.
        continue;
      }

      // ── 4. Per-blueprint-task generation ────────────────────────────────────

      for (const taskDef of recurringTasks) {
        try {
          // Find the most recent existing occurrence of this blueprint task
          // in this category (by blueprintTaskId + blueprintTemplateId + categoryId).
          // We sort by dueDate descending to get the latest.
          const lastOccurrence = await prisma.task.findFirst({
            where: {
              categoryId:          category.id,
              blueprintTemplateId: template.id,
              blueprintTaskId:     taskDef.localId,
            },
            orderBy: { dueDate: "desc" },
            select: {
              id:      true,
              dueDate: true,
              ownerId: true,
            },
          });

          // Compute the anchor: the first due date in the series.
          // If no prior occurrence exists, anchor = project.startDate + offsetDays.
          // If a prior occurrence exists, anchor = lastDueDate + intervalDays.
          //
          // offsetDays branches on template.dueDateOffsetExcludeWeekends:
          //   true  → addBusinessDays (Mon–Fri only)
          //   false → addCalendarDays (plain calendar, default)
          // intervalDays always advances by calendar days (plain arithmetic).

          const excludeWknd = template.dueDateOffsetExcludeWeekends ?? false;

          let seriesAnchor: string;

          if (!lastOccurrence || !lastOccurrence.dueDate) {
            // No prior occurrence — compute from project start.
            const startDate = project.startDate ?? today;
            seriesAnchor = addOffsetDays(startDate, taskDef.offsetDays, excludeWknd);
          } else {
            // Prior occurrence found — next due date is last + intervalDays.
            seriesAnchor = addCalendarDays(lastOccurrence.dueDate, taskDef.intervalDays);
          }

          // Walk the series forward, generating occurrences in [today, windowEnd].
          let cursor = seriesAnchor;

          // Count how many past occurrences we skip before reaching today.
          let localSkippedPast = 0;

          // Advance cursor past dates before today (no backdating).
          while (compareDates(cursor, today) < 0) {
            localSkippedPast++;
            cursor = addCalendarDays(cursor, taskDef.intervalDays);
          }

          result.skippedPast += localSkippedPast;

          if (localSkippedPast > 0) {
            console.log(
              `[recurring] project=${projectId} template=${template.id} task=${taskDef.localId} ` +
              `category=${category.id}: skipped ${localSkippedPast} past occurrence(s); ` +
              `next is ${cursor}`,
            );
          }

          // Generate occurrences in [today, windowEnd].
          while (compareDates(cursor, windowEnd) <= 0) {
            const dueDate = cursor;
            const occurrenceKey = `${template.id}:${taskDef.localId}:${category.id}:${dueDate}`;

            // Idempotency: check if this occurrence already exists.
            const existing = await prisma.task.findFirst({
              where: { occurrenceKey },
              select: { id: true },
            });

            if (existing) {
              result.skippedDuplicate++;
              cursor = addCalendarDays(cursor, taskDef.intervalDays);
              continue;
            }

            // Owner continuity:
            //   Use lastOccurrence.ownerId if that user is still active and
            //   still in taskDef.department. Otherwise use pickOwner.
            let ownerId: string | null = null;

            if (lastOccurrence?.ownerId) {
              // Validate prior owner is still active + in the right department.
              const priorOwner = await prisma.user.findFirst({
                where: {
                  id:         lastOccurrence.ownerId,
                  status:     "active",
                  department: taskDef.department || undefined,
                },
                select: { id: true },
              });
              ownerId = priorOwner?.id ?? null;
            }

            // Re-pick if prior owner is not eligible.
            if (!ownerId && taskDef.department) {
              ownerId = await pickOwner(taskDef.department, ownerCache);
            }

            // Insert the occurrence.
            const taskId = makeId("task");
            await prisma.task.create({
              data: {
                id:                     taskId,
                categoryId:             category.id,
                label:                  taskDef.label,
                status:                 "open",
                ownerId,
                department:             taskDef.department || null,
                dueDate,
                offsetFrom:             "launch",
                offsetDays:             taskDef.offsetDays,
                isSetup:                false,
                isRecurring:            true,
                recurrenceIntervalDays: taskDef.intervalDays,
                ownerRole:              taskDef.ownerRole      ?? null,
                estimatedHours:         taskDef.estimatedHours ?? null,
                priority:               taskDef.priority        ?? null,
                description:            taskDef.description     ?? null,
                blueprintTaskId:        taskDef.localId,
                blueprintTemplateId:    template.id,
                occurrenceKey,
                createdAt:              now,
                updatedAt:              now,
              },
            });

            result.generated++;

            // Notify the owner. createNotification never throws; failure is
            // swallowed internally. Do not await — notification failure must
            // not block generation.
            if (ownerId) {
              createNotification({
                recipientId: ownerId,
                type:        "task_assigned",
                message:     `You have a new recurring task: "${taskDef.label}" due ${dueDate} on project ${project.name}.`,
                link:        `/tasks`,
              }).catch(() => {
                // swallowed — notification failure must never block generation
              });
            }

            // Advance cursor by intervalDays for the next occurrence.
            cursor = addCalendarDays(cursor, taskDef.intervalDays);
          }
        } catch (taskErr) {
          result.errors.push(
            `template=${template.id} task=${taskDef.localId} category=${category.id}: ` +
            (taskErr instanceof Error ? taskErr.message : String(taskErr)),
          );
          // Non-fatal: continue with the next blueprint task.
        }
      }
    } catch (categoryErr) {
      result.errors.push(
        `category=${category.id} (serviceId=${category.serviceId}): ` +
        (categoryErr instanceof Error ? categoryErr.message : String(categoryErr)),
      );
      // Non-fatal: continue with the next category.
    }
  }

  return result;
}
