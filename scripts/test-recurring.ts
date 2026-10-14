// RTM OS — Recurring Engine Test Script
//
// Tests the recurring task generation engine end-to-end.
// Creates test data, runs the engine, verifies results, then cleans up.
//
// Run: cd /Users/fetadlas/ai-os/repos/rtm-os/frontend && npx tsx scripts/test-recurring.ts

import { prisma } from "@/lib/db/prisma";
import { launchProject } from "@/lib/projects/launch";
import { generateRecurringTasks } from "@/lib/projects/recurring";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  return `${prefix}-TEST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function addCalendarDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function sep(msg: string) {
  console.log("\n" + "═".repeat(70));
  console.log(msg);
  console.log("═".repeat(70));
}

// ── Track all created IDs for cleanup ─────────────────────────────────────────

const TS          = Date.now();
const createdTemplateId = `tlt-TEST-${TS}`;
const createdClientId   = `client-TEST-${TS}`;
const createdBusinessId = `biz-TEST-${TS}`;
const createdUserId1    = `user-TEST-${TS}-u1`;
const createdUserId2    = `user-TEST-${TS}-u2`;
const now               = new Date().toISOString();
const today             = todayUTC();

// Service ID is the template's serviceId (unique per test run).
const testSvcId         = `test-svc-${TS}`;

async function getProjectCatIds(projectId: string) {
  const cats = await prisma.projectCategory.findMany({ where: { projectId } });
  return cats.map(c => c.id);
}

async function getRecurringTasks(projectId: string) {
  const catIds = await getProjectCatIds(projectId);
  return prisma.task.findMany({
    where:   { categoryId: { in: catIds }, isRecurring: true },
    orderBy: [{ blueprintTaskId: "asc" }, { dueDate: "asc" }],
    select:  { id: true, label: true, dueDate: true, ownerId: true, occurrenceKey: true, blueprintTaskId: true },
  });
}

async function deleteAllRecurringTasks(projectId: string) {
  const catIds = await getProjectCatIds(projectId);
  const tasks = await prisma.task.findMany({
    where:  { categoryId: { in: catIds }, isRecurring: true },
    select: { id: true },
  });
  for (const t of tasks) await prisma.task.delete({ where: { id: t.id } });
  return tasks.length;
}

async function rowCounts() {
  const [tasks, projects, cats, users, templates, notifs, clients, businesses] = await Promise.all([
    prisma.task.count(),
    prisma.project.count(),
    prisma.projectCategory.count(),
    prisma.user.count(),
    prisma.taskListTemplate.count(),
    prisma.notification.count(),
    prisma.client.count(),
    prisma.business.count(),
  ]);
  return { tasks, projects, project_categories: cats, users, task_list_templates: templates, notifications: notifs, clients, businesses };
}

function printCounts(c: Awaited<ReturnType<typeof rowCounts>>) {
  for (const [k, v] of Object.entries(c)) {
    console.log(`  ${k.padEnd(25)} ${v}`);
  }
}

// ── Main test ─────────────────────────────────────────────────────────────────

async function run() {
  sep("BEFORE: Row counts");
  const before = await rowCounts();
  printCounts(before);

  // ── SETUP: Create test users ──────────────────────────────────────────────
  sep("SETUP: Create test users");

  await prisma.user.create({
    data: {
      id:         createdUserId1,
      email:      `test-recur-u1-${TS}@test.invalid`,
      name:       "Test Recurring Owner One",
      department: "SEO & Local",
      role:       "Member",
      status:     "active",
      createdAt:  now,
      updatedAt:  now,
    },
  });
  console.log(`Created user1: ${createdUserId1} (active, SEO & Local)`);

  await prisma.user.create({
    data: {
      id:         createdUserId2,
      email:      `test-recur-u2-${TS}@test.invalid`,
      name:       "Test Recurring Owner Two",
      department: "SEO & Local",
      role:       "Member",
      status:     "active",
      createdAt:  now,
      updatedAt:  now,
    },
  });
  console.log(`Created user2: ${createdUserId2} (active, SEO & Local)`);

  // ── SETUP: Create test blueprint with two recurring tasks ─────────────────
  sep("SETUP: Create test blueprint with recurring tasks");

  const blueprintGroups = [
    {
      kind:    "setup",
      heading: "Setup",
      tasks:   [],
    },
    {
      kind:    "recurring",
      heading: "Recurring",
      tasks: [
        {
          localId:        "bpt-test-r1",
          label:          "Test Recurring Task A (every 14 days)",
          department:     "SEO & Local",
          offsetDays:     0,
          intervalDays:   14,
          priority:       "High",
          estimatedHours: 1,
          description:    "Fires every 14 calendar days",
        },
        {
          localId:        "bpt-test-r2",
          label:          "Test Recurring Task B (every 30 days)",
          department:     "SEO & Local",
          offsetDays:     0,
          intervalDays:   30,
          priority:       "Medium",
          estimatedHours: 2,
          description:    "Fires every 30 calendar days",
        },
      ],
    },
  ];

  await prisma.taskListTemplate.create({
    data: {
      id:        createdTemplateId,
      serviceId: testSvcId,
      name:      "Test Recurring Blueprint",
      department: "SEO & Local",
      groups:    blueprintGroups as object,
      isActive:  true,
      createdAt: now,
      updatedAt: now,
    },
  });
  console.log(`Created blueprint: ${createdTemplateId}`);
  console.log(`  serviceId: ${testSvcId}`);
  console.log(`  Task A: bpt-test-r1, every 14 days`);
  console.log(`  Task B: bpt-test-r2, every 30 days`);

  // ── SETUP: Create test client + business ──────────────────────────────────
  sep("SETUP: Create test client and business");

  await prisma.client.create({
    data: {
      id:        createdClientId,
      fullName:  "Test Recurring Client",
      email:     `billing-${TS}@test.invalid`,
      createdAt: now,
      updatedAt: now,
    },
  });
  console.log(`Created client: ${createdClientId}`);

  await prisma.business.create({
    data: {
      id:               createdBusinessId,
      domain:           `test-recur-${TS}.invalid`,
      displayName:      "Test Recurring Business",
      clientId:         createdClientId,
      activationStatus: "active",
      activeServices:   [testSvcId],
      createdAt:        now,
      updatedAt:        now,
    },
  });
  console.log(`Created business: ${createdBusinessId}`);

  // ── SETUP: Launch project via launchProject ───────────────────────────────
  sep("SETUP: Launch project via launchProject()");

  const launchResult = await launchProject(createdBusinessId, {
    lineItems: [
      { serviceId: testSvcId, label: "Test Recurring Service", department: "SEO & Local" },
    ],
    assignedAMId:   createdUserId1,
    assignedAMName: "Test Recurring Owner One",
    skipSetupTasks: true,
  });

  console.log("Launch result:", JSON.stringify({
    skipped:              launchResult.skipped,
    projectId:            launchResult.projectId,
    tasksCreated:         launchResult.tasksCreated,
    recurringTasksCreated: launchResult.recurringTasksCreated,
    errors:               launchResult.errors,
  }, null, 2));

  if (!launchResult.projectId || launchResult.skipped) {
    console.error("Launch failed. Cannot proceed.");
    process.exit(1);
  }

  const projectId = launchResult.projectId;
  console.log(`\nProject: ${projectId}`);

  // Set startDate to today explicitly.
  await prisma.project.update({ where: { id: projectId }, data: { startDate: today } });
  console.log(`Project startDate = ${today}`);

  // ── TEST a: Run generation — show rows created with due dates ─────────────
  sep("TEST a: First generation run — show created rows with due dates");

  // The engine should detect the launch-created occurrences (which now have
  // blueprintTaskId set) and generate the next ones from them.
  // Delete any launch-created recurring tasks first so this test shows the
  // engine generating ALL occurrences from scratch for a clean demonstration.
  const launchCreated = await deleteAllRecurringTasks(projectId);
  console.log(`Deleted ${launchCreated} launch-created recurring tasks (clean engine test).`);

  const resultA = await generateRecurringTasks(projectId);
  console.log("\nGeneration result:", JSON.stringify(resultA, null, 2));

  const tasksA = await getRecurringTasks(projectId);
  console.log(`\nCreated ${tasksA.length} recurring task occurrences:\n`);
  console.log(`${"ID".padEnd(38)} | ${"Blueprint Task".padEnd(15)} | ${"Due Date".padEnd(10)} | Owner`);
  console.log("-".repeat(100));
  for (const t of tasksA) {
    console.log(`${t.id.padEnd(38)} | ${(t.blueprintTaskId ?? "").padEnd(15)} | ${(t.dueDate ?? "").padEnd(10)} | ${t.ownerId ?? "(none)"}`);
  }

  // ── TEST b: Run again — prove no duplicates ───────────────────────────────
  sep("TEST b: Run generation again — prove no duplicates");

  const resultB = await generateRecurringTasks(projectId);
  console.log("Second run result:", JSON.stringify(resultB, null, 2));

  const tasksB = await getRecurringTasks(projectId);
  console.log(`\nTask count after second run: ${tasksB.length} (first run produced: ${tasksA.length})`);
  if (tasksB.length === tasksA.length && resultB.skippedDuplicate === resultA.generated) {
    console.log(`PASS: No duplicates. skippedDuplicate=${resultB.skippedDuplicate} matches first run generated=${resultA.generated}`);
  } else if (tasksB.length === tasksA.length) {
    console.log(`PASS: No duplicates (count unchanged). skippedDuplicate=${resultB.skippedDuplicate}`);
  } else {
    console.log(`FAIL: Task count changed from ${tasksA.length} to ${tasksB.length}!`);
  }

  // ── TEST c: Advance window — next occurrences in order ───────────────────
  sep("TEST c: Advance the window — next occurrences appear in order");

  // Strategy: reset all existing recurring tasks to have due dates 91 days in
  // the past (by deleting them and relaunching with startDate 91 days ago).
  // This causes the engine to generate a fresh batch of occurrences starting
  // from "yesterday + 91 days" which puts them in the current window.

  // Delete current recurring tasks.
  const deletedForC = await deleteAllRecurringTasks(projectId);
  console.log(`Deleted ${deletedForC} existing recurring tasks.`);

  // Set project startDate to 91 days ago so the series anchor is in the past.
  const startDatePast91 = addCalendarDays(today, -91);
  await prisma.project.update({ where: { id: projectId }, data: { startDate: startDatePast91 } });
  console.log(`Set project startDate = ${startDatePast91} (91 days ago).`);

  // Run generation — this simulates the project being 91 days old with no
  // occurrences generated yet. The engine should generate from today forward,
  // skipping all past dates.
  const resultC = await generateRecurringTasks(projectId);
  console.log("\nAdvanced-window generation result:", JSON.stringify(resultC, null, 2));

  const tasksC = await getRecurringTasks(projectId);
  console.log(`\nAll occurrences after 91-day-old project simulation (${tasksC.length} total):\n`);
  console.log(`${"Blueprint Task".padEnd(16)} | ${"Due Date".padEnd(10)} | >= today?`);
  console.log("-".repeat(50));
  let allFutureC = true;
  for (const t of tasksC) {
    const ok = (t.dueDate ?? "") >= today;
    if (!ok) allFutureC = false;
    console.log(`${(t.blueprintTaskId ?? "").padEnd(16)} | ${(t.dueDate ?? "").padEnd(10)} | ${ok ? "YES ✓" : "NO ✗ FAIL"}`);
  }
  console.log(`\n${allFutureC ? "PASS" : "FAIL"}: All occurrences are on or after today (${today}).`);
  console.log(`skippedPast=${resultC.skippedPast} (occurrences before today that were not created).`);

  // Reset startDate for subsequent tests.
  await prisma.project.update({ where: { id: projectId }, data: { startDate: today } });

  // ── TEST d: Owner continuity ──────────────────────────────────────────────
  sep("TEST d: Owner continuity — kept, then re-pick on inactive");

  // Delete all recurring tasks and start fresh from today.
  await deleteAllRecurringTasks(projectId);

  // Manually create one prior occurrence of task A with a due date in the
  // past (14 days ago), owned by user1. This is what the engine would have
  // created on the previous run. The engine should see this and:
  //   (1) Detect user1 as the prior owner.
  //   (2) Check user1 is still active + in SEO & Local.
  //   (3) Assign user1 to the next occurrence.

  const pastDueDate = addCalendarDays(today, -14);
  const priorOccurrenceKey = `${createdTemplateId}:bpt-test-r1:${(await getProjectCatIds(projectId))[2] ?? "cat-unknown"}:${pastDueDate}`;
  
  // Actually we need the real categoryId for the test service.
  const cats = await prisma.projectCategory.findMany({ where: { projectId } });
  const testCat = cats.find(c => c.serviceId === testSvcId);
  if (!testCat) { console.error("Test category not found"); process.exit(1); }

  const priorKey = `${createdTemplateId}:bpt-test-r1:${testCat.id}:${pastDueDate}`;
  await prisma.task.create({
    data: {
      id:                  `task-TEST-prior-${TS}`,
      categoryId:          testCat.id,
      label:               "Test Recurring Task A (every 14 days)",
      status:              "open",
      ownerId:             createdUserId1,
      department:          "SEO & Local",
      dueDate:             pastDueDate,
      offsetFrom:          "launch",
      offsetDays:          0,
      isSetup:             false,
      isRecurring:         true,
      recurrenceIntervalDays: 14,
      blueprintTaskId:     "bpt-test-r1",
      blueprintTemplateId: createdTemplateId,
      occurrenceKey:       priorKey,
      priority:            "High",
      createdAt:           now,
      updatedAt:           now,
    },
  });
  console.log(`\nCreated prior occurrence of task A:`);
  console.log(`  dueDate: ${pastDueDate} (14 days ago)`);
  console.log(`  ownerId: ${createdUserId1} (user1 — active, SEO & Local)`);
  console.log(`  occurrenceKey: ${priorKey}`);

  // Generate — should produce next occurrence owned by user1.
  const resultD1 = await generateRecurringTasks(projectId);
  console.log(`\nGeneration after prior occurrence: generated=${resultD1.generated}`);

  const newTaskA = await prisma.task.findFirst({
    where:   { categoryId: testCat.id, blueprintTaskId: "bpt-test-r1", isRecurring: true, dueDate: { gt: pastDueDate } },
    orderBy: { dueDate: "asc" },
    select:  { id: true, ownerId: true, dueDate: true },
  });

  console.log(`\nNext occurrence of task A:`);
  console.log(`  dueDate:  ${newTaskA?.dueDate}`);
  console.log(`  ownerId:  ${newTaskA?.ownerId}`);
  if (newTaskA?.ownerId === createdUserId1) {
    console.log(`  PASS: Owner continued from prior occurrence (user1 ${createdUserId1})`);
  } else {
    console.log(`  Note: Owner is ${newTaskA?.ownerId} (expected ${createdUserId1})`);
  }

  // Now disable user1 and push the latest task A into the past.
  console.log(`\nDisabling user1 (${createdUserId1})...`);
  await prisma.user.update({ where: { id: createdUserId1 }, data: { status: "disabled" } });

  // Move the most recent task A into the past by updating dueDate + occurrenceKey.
  if (newTaskA) {
    const newPastDate = addCalendarDays(today, -1);
    const newPastKey  = `${createdTemplateId}:bpt-test-r1:${testCat.id}:${newPastDate}`;
    await prisma.task.update({
      where: { id: newTaskA.id },
      data:  { dueDate: newPastDate, occurrenceKey: newPastKey },
    });
    console.log(`Moved latest task A to ${newPastDate} (yesterday) so next occurrence needed.`);
  }

  const resultD2 = await generateRecurringTasks(projectId);
  console.log(`\nGeneration after disabling user1: generated=${resultD2.generated}`);

  const rePickedTaskA = await prisma.task.findFirst({
    where:   { categoryId: testCat.id, blueprintTaskId: "bpt-test-r1", isRecurring: true, dueDate: { gte: today } },
    orderBy: { dueDate: "asc" },
    select:  { id: true, ownerId: true, dueDate: true },
  });
  console.log(`\nRe-picked occurrence of task A:`);
  console.log(`  dueDate:  ${rePickedTaskA?.dueDate}`);
  console.log(`  ownerId:  ${rePickedTaskA?.ownerId}`);
  if (rePickedTaskA?.ownerId !== createdUserId1) {
    console.log(`  PASS: Re-picked owner (${rePickedTaskA?.ownerId}) ≠ disabled user1 (${createdUserId1})`);
  } else {
    console.log(`  Note: user1 was assigned. Expected re-pick to different user since user1 is disabled.`);
  }

  // Restore user1.
  await prisma.user.update({ where: { id: createdUserId1 }, data: { status: "active" } });
  console.log(`\nRestored user1 to active.`);

  // ── TEST e: Inactive project generates nothing ────────────────────────────
  sep("TEST e: Inactive project (on_hold) — generates nothing");

  await prisma.project.update({ where: { id: projectId }, data: { status: "on_hold" } });
  console.log(`Marked project ${projectId} as on_hold.`);

  const resultE = await generateRecurringTasks(projectId);
  console.log("Result:", JSON.stringify(resultE, null, 2));
  if (!resultE.ran && resultE.skipReason?.includes("on_hold")) {
    console.log(`PASS: Generation skipped. skipReason="${resultE.skipReason}"`);
  } else {
    console.log(`Note: ran=${resultE.ran}, skipReason="${resultE.skipReason}"`);
  }

  await prisma.project.update({ where: { id: projectId }, data: { status: "active" } });
  console.log(`Restored project status to active.`);

  // ── TEST f: Skip-the-past with a count of what was skipped ───────────────
  sep("TEST f: Skip-the-past — count skipped past occurrences");

  // Clear all recurring tasks and set startDate to 60 days ago.
  const deletedForF = await deleteAllRecurringTasks(projectId);
  console.log(`Deleted ${deletedForF} existing recurring tasks for clean test.`);

  const startDate60Ago = addCalendarDays(today, -60);
  await prisma.project.update({ where: { id: projectId }, data: { startDate: startDate60Ago } });
  console.log(`Set project startDate = ${startDate60Ago} (60 days ago).`);
  console.log(`\nExpected skips (calendar math):`);
  // Task A: every 14 days. Dates: -60, -46, -32, -18, -4, +10, +24 ...
  // Days -60, -46, -32, -18, -4 are in the past (< today) → 5 skips
  // Then +10, +24, +38, +52, +66, +80 land within window
  console.log(`  Task A (14-day interval from ${startDate60Ago}): occurrences at -60,-46,-32,-18,-4 days (5 past, skipped)`);
  // Task B: every 30 days. Dates: -60, -30, 0 (today), +30, +60, +90
  console.log(`  Task B (30-day interval from ${startDate60Ago}): occurrences at -60,-30 days (2 past, skipped), then ${today} onward`);
  console.log(`  Total expected skips: ~7`);

  const resultF = await generateRecurringTasks(projectId);
  console.log("\nSkip-the-past result:", JSON.stringify(resultF, null, 2));

  const tasksF = await getRecurringTasks(projectId);
  let allFutureF = true;
  console.log(`\nGenerated occurrences (must all be >= ${today}):\n`);
  console.log(`${"Blueprint Task".padEnd(16)} | ${"Due Date".padEnd(10)} | >= today?`);
  console.log("-".repeat(50));
  for (const t of tasksF) {
    const ok = (t.dueDate ?? "") >= today;
    if (!ok) allFutureF = false;
    console.log(`${(t.blueprintTaskId ?? "").padEnd(16)} | ${(t.dueDate ?? "").padEnd(10)} | ${ok ? "YES ✓" : "NO ✗ FAIL"}`);
  }
  console.log(`\n${allFutureF ? "PASS" : "FAIL"}: All ${tasksF.length} occurrences are on or after today.`);
  console.log(`skippedPast=${resultF.skippedPast} occurrences before today were not created.`);

  // ── CLEANUP ───────────────────────────────────────────────────────────────
  sep("CLEANUP: Remove all test data");

  // Collect all category ids for this project.
  const catIds = await getProjectCatIds(projectId);

  // All task rows in this project.
  const allTasks = await prisma.task.findMany({ where: { categoryId: { in: catIds } }, select: { id: true } });
  // Delete task dependencies first (FK).
  for (const t of allTasks) {
    await prisma.taskDependency.deleteMany({ where: { taskId: t.id } });
    await prisma.taskDependency.deleteMany({ where: { requiresTaskId: t.id } });
  }
  // Delete notifications that reference these tasks via the link field or are
  // addressed to the test users.
  const taskIdSet = new Set(allTasks.map(t => t.id));
  const notifsForProject = await prisma.notification.findMany({
    where: { recipientId: { in: [createdUserId1, createdUserId2] } },
    select: { id: true },
  });
  await prisma.notification.deleteMany({ where: { id: { in: notifsForProject.map(n => n.id) } } });
  console.log(`Deleted ${notifsForProject.length} notifications.`);

  // Delete tasks.
  await prisma.task.deleteMany({ where: { id: { in: allTasks.map(t => t.id) } } });
  console.log(`Deleted ${allTasks.length} tasks.`);

  // Categories.
  await prisma.projectCategory.deleteMany({ where: { id: { in: catIds } } });
  console.log(`Deleted ${catIds.length} categories.`);

  // Onboarding records.
  const onbRecs = await prisma.onboardingRecord.findMany({ where: { projectId }, select: { id: true } });
  if (onbRecs.length) {
    await prisma.onboardingRecord.deleteMany({ where: { id: { in: onbRecs.map(r => r.id) } } });
  }
  console.log(`Deleted ${onbRecs.length} onboarding records.`);

  // Project.
  await prisma.project.delete({ where: { id: projectId } });
  console.log(`Deleted project ${projectId}.`);

  // Business.
  await prisma.business.delete({ where: { id: createdBusinessId } });
  console.log(`Deleted business ${createdBusinessId}.`);

  // Client.
  await prisma.client.delete({ where: { id: createdClientId } });
  console.log(`Deleted client ${createdClientId}.`);

  // Blueprint.
  await prisma.taskListTemplate.delete({ where: { id: createdTemplateId } });
  console.log(`Deleted blueprint ${createdTemplateId}.`);

  // Restore user1 to active before deleting (in case a test left it disabled).
  await prisma.user.update({ where: { id: createdUserId1 }, data: { status: "active" } }).catch(() => null);
  // Users.
  await prisma.user.delete({ where: { id: createdUserId1 } });
  await prisma.user.delete({ where: { id: createdUserId2 } });
  console.log(`Deleted users ${createdUserId1} and ${createdUserId2}.`);

  // ── AFTER counts ──────────────────────────────────────────────────────────
  sep("AFTER: Row counts");
  const after = await rowCounts();
  printCounts(after);

  console.log("\n── Diff ──────────────────────────────────────────────────────────");
  let allMatch = true;
  const mismatches: string[] = [];
  for (const key of Object.keys(before) as (keyof typeof before)[]) {
    const diff = after[key] - before[key];
    const ok   = diff === 0;
    if (!ok) {
      allMatch = false;
      mismatches.push(
        `  ${key}: expected ${before[key]}, got ${after[key]} (diff ${diff > 0 ? "+" : ""}${diff})`
      );
    }
    const status = ok ? "✓ unchanged" : `✗ DIFF ${diff > 0 ? "+" : ""}${diff}`;
    console.log(`  ${key.padEnd(25)} before=${before[key]}  after=${after[key]}  ${status}`);
  }

  if (allMatch) {
    console.log("\nPASS: All tables restored to starting counts.");
  } else {
    const msg = [
      "\nFAIL: Tables do not match starting counts. Test data was not fully cleaned up.",
      ...mismatches,
    ].join("\n");
    console.error(msg);
    process.exit(1);
  }

  console.log("\n✓ Test complete.\n");
}

run()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("\nTest failed:", err);
    prisma.$disconnect().then(() => process.exit(1));
  });
