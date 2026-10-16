// RTM OS — Weekend-Exclusion Flag Verification Script
//
// Verifies that dueDateOffsetExcludeWeekends is correctly consumed by
// launchProject() and generateRecurringTasks().
//
// Creates TESTWIRE- prefixed rows, runs both generation paths, reads back
// the resulting due dates, then deletes all TESTWIRE- rows.
//
// Run: cd /Users/fetadlas/ai-os/repos/rtm-os/frontend && npx tsx scripts/test-exclude-weekends.ts

import { prisma } from "@/lib/db/prisma";
import { launchProject } from "@/lib/projects/launch";
import { generateRecurringTasks } from "@/lib/projects/recurring";
import { addCalendarDays, addBusinessDays } from "@/lib/dates";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayName(dateStr: string | null): string {
  if (!dateStr) return "null";
  return new Date(dateStr + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long" });
}

function isWeekend(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const dow = new Date(dateStr + "T12:00:00Z").getUTCDay();
  return dow === 0 || dow === 6;
}

function sep(msg: string) {
  console.log("\n" + "═".repeat(70));
  console.log(msg);
  console.log("═".repeat(70));
}

// ── Constants ─────────────────────────────────────────────────────────────────

// offset=3 from today (Thu 2026-10-15 UTC):
//   addCalendarDays → 2026-10-18 (Sunday)  ← should appear when flag=false
//   addBusinessDays → 2026-10-20 (Tuesday) ← should appear when flag=true
const OFFSET_DAYS = 3;

// Recurrence interval: 7 calendar days (weekly)
const INTERVAL_DAYS = 7;

const TESTWIRE_PREFIX = "TESTWIRE";

// ── Cleanup helper ────────────────────────────────────────────────────────────

async function cleanupTestwireRows(): Promise<void> {
  // Find TESTWIRE projects by businessId (project IDs are makeId-generated, not TESTWIRE-prefixed)
  const testProjects = await prisma.project.findMany({
    where: { businessId: { contains: TESTWIRE_PREFIX } },
    select: { id: true },
  });
  const projIds = testProjects.map((p) => p.id);

  // Find categories in TESTWIRE projects
  const testCategories = projIds.length > 0
    ? await prisma.projectCategory.findMany({ where: { projectId: { in: projIds } }, select: { id: true } })
    : [];
  const catIds = testCategories.map((c) => c.id);

  // Find tasks in TESTWIRE categories
  const testTasks = catIds.length > 0
    ? await prisma.task.findMany({ where: { categoryId: { in: catIds } }, select: { id: true } })
    : [];
  const taskIds = testTasks.map((t) => t.id);

  // Delete in dependency order
  if (taskIds.length > 0) {
    await prisma.taskDependency.deleteMany({
      where: { OR: [{ taskId: { in: taskIds } }, { requiresTaskId: { in: taskIds } }] },
    });
    await prisma.task.deleteMany({ where: { id: { in: taskIds } } });
  }

  if (catIds.length > 0) {
    await prisma.projectCategory.deleteMany({ where: { id: { in: catIds } } });
  }

  if (projIds.length > 0) {
    await prisma.onboardingRecord.deleteMany({ where: { projectId: { in: projIds } } });
    await prisma.project.deleteMany({ where: { id: { in: projIds } } });
  }

  await prisma.onboardingRecord.deleteMany({ where: { businessId: { contains: TESTWIRE_PREFIX } } });
  await prisma.business.deleteMany({ where: { id: { contains: TESTWIRE_PREFIX } } });
  await prisma.taskListTemplate.deleteMany({ where: { id: { contains: TESTWIRE_PREFIX } } });

  console.log(`🧹 Cleaned up: ${projIds.length} projects, ${catIds.length} categories, ${taskIds.length} tasks`);
}

// ── Row count helper ──────────────────────────────────────────────────────────

async function rowCounts(): Promise<Record<string, number>> {
  const [users, clients, businesses, projects, tasks, taskListTemplates] = await Promise.all([
    prisma.user.count(),
    prisma.client.count(),
    prisma.business.count(),
    prisma.project.count(),
    prisma.task.count(),
    prisma.taskListTemplate.count(),
  ]);
  return { users, clients, businesses, projects, tasks, taskListTemplates };
}

// ── Blueprint factory ─────────────────────────────────────────────────────────

async function createTestwireBlueprint(excludeWeekends: boolean): Promise<{ tplId: string; svcId: string }> {
  const suffix = excludeWeekends ? "excl" : "cal";
  const tplId  = `${TESTWIRE_PREFIX}-tpl-${suffix}-${Date.now()}`;
  const svcId  = `${TESTWIRE_PREFIX}-svc-${suffix}-${Date.now()}`;

  await prisma.taskListTemplate.create({
    data: {
      id:          tplId,
      serviceId:   svcId,
      name:        `TESTWIRE Blueprint (excludeWeekends=${excludeWeekends})`,
      department:  "SEO",
      servicePackage:    "none",
      mappedLineItem:    "none",
      description:       "Verification blueprint",
      activationTrigger: "test",
      estimatedTotalHours: 0,
      isActive:    true,
      version:     "1",
      claimedServiceIds: [],
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
      // SLA day-count fields
      firstResponseDays:   1,
      targetCompletionDays: 3,
      dueDateOffsetDays:   OFFSET_DAYS,
      escalationAfterDays: 5,
      // Exclude-weekends flags — all four set consistently
      firstResponseExcludeWeekends:     excludeWeekends,
      targetCompletionExcludeWeekends:  excludeWeekends, // as required by prompt
      dueDateOffsetExcludeWeekends:     excludeWeekends, // this is what's wired
      escalationExcludeWeekends:        excludeWeekends,
      groups: [
        {
          kind: "setup",
          heading: "Setup Tasks",
          tasks: [
            {
              localId:    "tw-setup-1",
              label:      `TESTWIRE Setup Task (excl=${excludeWeekends})`,
              department: "SEO",
              offsetDays: OFFSET_DAYS,
              offsetFrom: "launch",
              prereqIds:  [],
            },
          ],
        },
        {
          kind: "recurring",
          heading: "Recurring Tasks",
          tasks: [
            {
              localId:      "tw-rec-1",
              label:        `TESTWIRE Recurring Task (excl=${excludeWeekends})`,
              department:   "SEO",
              offsetDays:   OFFSET_DAYS,
              intervalDays: INTERVAL_DAYS,
            },
          ],
        },
      ],
    },
  });

  return { tplId, svcId };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Initial cleanup of any leftover rows from previous runs
  sep("Pre-run cleanup");
  await cleanupTestwireRows();

  sep("0. Baseline row counts (after pre-run cleanup)");
  const before = await rowCounts();
  console.log("BEFORE:", before);

  const today            = todayUTC();
  const expectedCalendar = addCalendarDays(today, OFFSET_DAYS);
  const expectedBusiness = addBusinessDays(today, OFFSET_DAYS);

  console.log(`\nToday (UTC): ${today}  (${dayName(today)})`);
  console.log(`Offset: ${OFFSET_DAYS} days`);
  console.log(`Expected with excludeWeekends=false (calendar): ${expectedCalendar}  (${dayName(expectedCalendar)})`);
  console.log(`Expected with excludeWeekends=true  (business): ${expectedBusiness}  (${dayName(expectedBusiness)})`);

  // ── Test 1: excludeWeekends=TRUE ─────────────────────────────────────────

  sep("1. Test: dueDateOffsetExcludeWeekends=true → business-day dates");

  const { tplId: tplIdExcl, svcId: svcIdExcl } = await createTestwireBlueprint(true);
  console.log(`✓ Created template ${tplIdExcl} with dueDateOffsetExcludeWeekends=true`);

  const bizIdExcl = `${TESTWIRE_PREFIX}-biz-excl-${Date.now()}`;
  await prisma.business.create({
    data: {
      id:                bizIdExcl,
      domain:            "testwire-excl.example.com",
      displayName:       "TESTWIRE Excl Weekends Co",
      clientId:          "",
      onboardingStatus:  "not_started",
      monthlyValueCents: 0,
      createdAt:         new Date().toISOString(),
      updatedAt:         new Date().toISOString(),
    },
  });

  const lrExcl = await launchProject(bizIdExcl, {
    lineItems:      [{ serviceId: svcIdExcl, label: "TESTWIRE Excl Service", department: "SEO" }],
    assignedAMId:   null as unknown as string,
    assignedAMName: null as unknown as string,
    skipSetupTasks: true, // import path: no setup tasks from onboarding/reporting blueprints
  });
  console.log(`✓ Launch (excl=true): projectId=${lrExcl.projectId} tasks=${lrExcl.tasksCreated} recurring=${lrExcl.recurringTasksCreated} errors=${lrExcl.errors.length}`);
  if (lrExcl.errors.length > 0) console.log("  errors:", lrExcl.errors);

  if (lrExcl.projectId) {
    const rr = await generateRecurringTasks(lrExcl.projectId);
    console.log(`✓ Recurring engine (excl=true): generated=${rr.generated} skippedPast=${rr.skippedPast} skippedDup=${rr.skippedDuplicate}`);
    if (rr.errors.length > 0) console.log("  errors:", rr.errors);
  }

  // Read ONLY TESTWIRE tasks (filter by label prefix to exclude any reporting/onboarding tasks)
  const exclCatIds = lrExcl.projectId
    ? (await prisma.projectCategory.findMany({ where: { projectId: lrExcl.projectId, serviceId: { contains: TESTWIRE_PREFIX } }, select: { id: true } })).map((c) => c.id)
    : [];
  const tasksExcl = await prisma.task.findMany({
    where: { categoryId: { in: exclCatIds } },
    select: { label: true, dueDate: true, isRecurring: true },
    orderBy: [{ dueDate: "asc" }, { label: "asc" }],
  });

  console.log(`\n📋 TESTWIRE tasks (excludeWeekends=true — all dates must be weekdays):`);
  let exclPass = tasksExcl.length > 0;
  const exclDates: string[] = [];
  for (const t of tasksExcl) {
    const kind = t.isRecurring ? "recurring" : "setup";
    const wknd = isWeekend(t.dueDate);
    if (wknd) exclPass = false;
    const mark = wknd ? "❌ WEEKEND!" : "✓";
    if (t.dueDate) exclDates.push(t.dueDate);
    console.log(`  ${mark} [${kind}] ${t.label}: ${t.dueDate}  (${dayName(t.dueDate)})`);
  }

  // The first occurrence should be on expectedBusiness
  const firstExclDate = tasksExcl.find((t) => !t.isRecurring)?.dueDate ?? tasksExcl[0]?.dueDate;
  const correctFirstExcl = firstExclDate === expectedBusiness;
  if (!correctFirstExcl) exclPass = false;

  console.log(`\n  First date: ${firstExclDate}  expected: ${expectedBusiness}  → ${correctFirstExcl ? "✅ match" : "❌ MISMATCH"}`);
  console.log(`  excludeWeekends=true: ${exclPass ? "✅ PASS" : "❌ FAIL"}`);

  // ── Test 2: excludeWeekends=FALSE ────────────────────────────────────────

  sep("2. Test: dueDateOffsetExcludeWeekends=false → calendar dates");

  const { tplId: tplIdCal, svcId: svcIdCal } = await createTestwireBlueprint(false);
  console.log(`✓ Created template ${tplIdCal} with dueDateOffsetExcludeWeekends=false`);

  const bizIdCal = `${TESTWIRE_PREFIX}-biz-cal-${Date.now()}`;
  await prisma.business.create({
    data: {
      id:                bizIdCal,
      domain:            "testwire-cal.example.com",
      displayName:       "TESTWIRE Calendar Days Co",
      clientId:          "",
      onboardingStatus:  "not_started",
      monthlyValueCents: 0,
      createdAt:         new Date().toISOString(),
      updatedAt:         new Date().toISOString(),
    },
  });

  const lrCal = await launchProject(bizIdCal, {
    lineItems:      [{ serviceId: svcIdCal, label: "TESTWIRE Cal Service", department: "SEO" }],
    assignedAMId:   null as unknown as string,
    assignedAMName: null as unknown as string,
    skipSetupTasks: true,
  });
  console.log(`✓ Launch (excl=false): projectId=${lrCal.projectId} tasks=${lrCal.tasksCreated} recurring=${lrCal.recurringTasksCreated} errors=${lrCal.errors.length}`);
  if (lrCal.errors.length > 0) console.log("  errors:", lrCal.errors);

  if (lrCal.projectId) {
    const rrCal = await generateRecurringTasks(lrCal.projectId);
    console.log(`✓ Recurring engine (excl=false): generated=${rrCal.generated} skippedPast=${rrCal.skippedPast} skippedDup=${rrCal.skippedDuplicate}`);
    if (rrCal.errors.length > 0) console.log("  errors:", rrCal.errors);
  }

  const calCatIds = lrCal.projectId
    ? (await prisma.projectCategory.findMany({ where: { projectId: lrCal.projectId, serviceId: { contains: TESTWIRE_PREFIX } }, select: { id: true } })).map((c) => c.id)
    : [];
  const tasksCal = await prisma.task.findMany({
    where: { categoryId: { in: calCatIds } },
    select: { label: true, dueDate: true, isRecurring: true },
    orderBy: [{ dueDate: "asc" }, { label: "asc" }],
  });

  console.log(`\n📋 TESTWIRE tasks (excludeWeekends=false — calendar, may land on weekend):`);
  let calPass = tasksCal.length > 0;
  const calDates: string[] = [];
  for (const t of tasksCal) {
    const kind = t.isRecurring ? "recurring" : "setup";
    const wknd = isWeekend(t.dueDate);
    if (t.dueDate) calDates.push(t.dueDate);
    const wkndNote = wknd ? " ← weekend (expected)" : "";
    console.log(`  [${kind}] ${t.label}: ${t.dueDate}  (${dayName(t.dueDate)})${wkndNote}`);
  }

  const firstCalDate = tasksCal.find((t) => !t.isRecurring)?.dueDate ?? tasksCal[0]?.dueDate;
  const correctFirstCal = firstCalDate === expectedCalendar;
  if (!correctFirstCal) calPass = false;

  console.log(`\n  First date: ${firstCalDate}  expected: ${expectedCalendar}  → ${correctFirstCal ? "✅ match" : "❌ MISMATCH"}`);
  console.log(`  excludeWeekends=false: ${calPass ? "✅ PASS" : "❌ FAIL"}`);

  // ── Postgres verification ─────────────────────────────────────────────────

  sep("3. Postgres read-back summary");
  console.log(`Project (excl=true):  ${lrExcl.projectId}`);
  console.log(`  First due date: ${firstExclDate}  (${dayName(firstExclDate ?? null)})  — expected ${expectedBusiness} (business days)`);
  console.log(`Project (excl=false): ${lrCal.projectId}`);
  console.log(`  First due date: ${firstCalDate}  (${dayName(firstCalDate ?? null)})  — expected ${expectedCalendar} (calendar days)`);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  sep("4. Cleanup — deleting all TESTWIRE- rows");
  await cleanupTestwireRows();

  // ── Post-cleanup row counts ───────────────────────────────────────────────

  sep("5. Post-cleanup row counts");
  const after = await rowCounts();
  console.log("BEFORE:", before);
  console.log("AFTER: ", after);

  const match =
    before.users === after.users &&
    before.clients === after.clients &&
    before.businesses === after.businesses &&
    before.projects === after.projects &&
    before.tasks === after.tasks &&
    before.taskListTemplates === after.taskListTemplates;

  console.log(`\nRow counts match: ${match ? "✅ YES" : "❌ NO — MISMATCH!"}`);

  sep("FINAL RESULT");
  console.log(`excludeWeekends=true  → business-day dates: ${exclPass ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`excludeWeekends=false → calendar dates:     ${calPass  ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Row counts preserved:                       ${match    ? "✅ PASS" : "❌ FAIL"}`);

  if (!exclPass || !calPass || !match) {
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
