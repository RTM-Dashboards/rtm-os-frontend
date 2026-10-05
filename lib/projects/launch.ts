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
//   - Returns a LaunchResult describing what was created or why it was skipped.
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

// ── Types ──────────────────────────────────────────────────────────────────────

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
  /** any per-category or per-task errors that occurred */
  errors: string[];
}

// ── BudgetLineItem (subset we need) ──────────────────────────────────────────

interface LineItem {
  serviceId: string;
  label: string;
  department: string;
}

// ── Template task shape ───────────────────────────────────────────────────────

interface TemplateTaskDef {
  label: string;
  offsetDays: number;
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

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// ── Main launch function ───────────────────────────────────────────────────────

export async function launchProject(businessId: string): Promise<LaunchResult> {
  const now = new Date().toISOString();
  const launchDate = new Date();

  const result: LaunchResult = {
    businessId,
    skipped:        false,
    projectId:      null,
    assignedAMId:   null,
    assignedAMName: null,
    noEligibleAM:   false,
    categoriesCreated: 0,
    tasksCreated:   0,
    errors:         [],
  };

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
  // Primary: SalesHandoff.lineItems where processedClientId = business.clientId.
  // The handoff is matched by clientId (set when Billing processed it).
  // If multiple handoffs match (edge case), merge their lineItems deduped by serviceId.
  let lineItems: LineItem[] = [];

  if (business.clientId) {
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

  // ── 4. Assign AM ──────────────────────────────────────────────────────────
  // Among Account Management users with isMain=true, pick the one with the
  // fewest open tasks (status='open' or 'in_progress'). Ties broken by name
  // alphabetically (first in sort order wins — deterministic).
  const mainAMs = await prisma.user.findMany({
    where: {
      department: "Account Management",
      isMain:     true,
      status:     "active",
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  let assignedAMId: string | null = null;
  let assignedAMName: string | null = null;

  if (mainAMs.length === 0) {
    result.noEligibleAM = true;
  } else {
    // Count open tasks per AM
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

    // Sort by count (asc), then name (already sorted above — stable).
    taskCounts.sort((a, b) => a.count - b.count);
    const winner = taskCounts[0];
    assignedAMId   = winner.am.id;
    assignedAMName = winner.am.name;
  }

  result.assignedAMId   = assignedAMId;
  result.assignedAMName = assignedAMName;

  // ── 5. Create the project ─────────────────────────────────────────────────
  const projectId = makeId("proj");
  const project = await prisma.project.create({
    data: {
      id:         projectId,
      businessId: business.id,
      name:       business.displayName || business.domain,
      status:     "planned",
      assignedAM: assignedAMId ?? "",
      createdAt:  now,
      updatedAt:  now,
    },
  });

  result.projectId = project.id;

  // ── 6. Create categories and tasks ────────────────────────────────────────
  for (const item of lineItems) {
    // Resolve department from catalogue (fall back to lineItem.department)
    let department = item.department ?? "";
    let catalogLabel = item.label ?? item.serviceId;

    try {
      const catalogItem = await prisma.serviceCatalogItem.findUnique({
        where: { id: item.serviceId },
        select: { department: true, label: true, deliverableGroups: true },
      });
      if (catalogItem) {
        department   = catalogItem.department || department;
        catalogLabel = catalogItem.label      || catalogLabel;
      }

      // Create the category
      const categoryId = makeId("cat");
      await prisma.projectCategory.create({
        data: {
          id:           categoryId,
          projectId:    project.id,
          serviceId:    item.serviceId,
          serviceLabel: catalogLabel,
          department,
          createdAt:    now,
        },
      });
      result.categoriesCreated++;

      // Resolve task list template for this service
      const template = await prisma.taskListTemplate.findFirst({
        where: { serviceId: item.serviceId },
      });

      let taskDefs: Array<{ label: string; offsetDays: number }> = [];

      if (template) {
        // Use the template's setup groups
        const groups = Array.isArray(template.groups)
          ? (template.groups as unknown as TemplateGroup[])
          : [];
        for (const group of groups) {
          if (group.kind === "setup" && Array.isArray(group.tasks)) {
            for (const t of group.tasks) {
              taskDefs.push({ label: t.label, offsetDays: t.offsetDays ?? 0 });
            }
          }
        }
      } else if (catalogItem) {
        // Fall back to deliverableGroups bullets as tasks with offsetDays=0
        const deliverableGroups = Array.isArray(catalogItem.deliverableGroups)
          ? (catalogItem.deliverableGroups as unknown as DeliverableGroup[])
          : [];
        for (const group of deliverableGroups) {
          if (Array.isArray(group.bullets)) {
            for (const bullet of group.bullets) {
              taskDefs.push({ label: bullet, offsetDays: 0 });
            }
          }
        }
      }
      // If neither template nor deliverableGroups has content, taskDefs stays []
      // and the category is empty — correct per spec.

      // Create tasks
      for (const taskDef of taskDefs) {
        const dueDate = addDays(launchDate, taskDef.offsetDays);
        await prisma.task.create({
          data: {
            id:         makeId("task"),
            categoryId,
            label:      taskDef.label,
            status:     "open",
            ownerId:    assignedAMId,
            dueDate,
            isSetup:    true,
            createdAt:  now,
            updatedAt:  now,
          },
        });
        result.tasksCreated++;
      }
    } catch (err) {
      result.errors.push(
        `Service ${item.serviceId}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return result;
}
