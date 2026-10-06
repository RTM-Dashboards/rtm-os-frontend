// RTM OS — Task List Templates API
//
// GET  /api/account-management/task-list-templates?serviceId=<id>
//   Returns the template for a service (or null if none exists yet).
//   → { template: TemplateRow | null }
//
// PUT  /api/account-management/task-list-templates?serviceId=<id>
//   Creates or replaces the template for a service (upsert by serviceId).
//   Body: { groups: TemplateGroup[] }
//   → { template: TemplateRow }
//   → { error: string } on cycle detected (HTTP 422)
//
// Auth: requireDepartment(user, "Account Management", "Member")
//   Any active Account Management member passes.
//   Executives and SystemAdmins pass (condition A of requireDepartment).
//   Manager of another department is denied.
//   Billing Member is denied.
//
// Error shape: { error: string } — matches all other routes.
//
// STABLE LOCAL IDs (Batch Two):
//   Each template task carries a localId — a short random string unique within
//   the template. Prerequisites reference localId values, not positions.
//   Reordering tasks never changes which task a prerequisite points at.
//
//   localId format: "t-<5 random alphanumeric chars>" generated at first save.
//   If a task arrives without a localId (old data, manual creation), one is
//   assigned by parseGroups before writing.
//
//   prereqIds replaces prereqIndices. The editor sends localId values; launch
//   reads them. prereqIndices is no longer written and is ignored on read.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireDepartment } from "@/lib/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TemplateTaskDef {
  /** Stable id unique within the template. Assigned at first save. */
  localId: string;
  label: string;
  department: string;
  offsetDays: number;
  /** "launch" = due date from project launch date.
   *  "prereq" = due date from when the last prerequisite closes. */
  offsetFrom: "launch" | "prereq";
  /** localId values of prerequisite tasks within this same group. */
  prereqIds: string[];
}

export interface TemplateGroup {
  kind: "setup" | "recurring";
  heading: string;
  tasks: TemplateTaskDef[];
}

export interface TemplateRow {
  id: string;
  serviceId: string;
  groups: TemplateGroup[];
  updatedAt: string;
}

// ── ID generation ─────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Short stable local id for a template task. Unique within a template. */
function makeLocalId(): string {
  return "t-" + Math.random().toString(36).slice(2, 7);
}

// ── Cycle detection ───────────────────────────────────────────────────────────
//
// Checks whether the prereqIds across all tasks in the groups form a cycle.
// Returns null when the graph is acyclic; returns the localIds of one cycle
// when a cycle exists.

function findCycle(groups: TemplateGroup[]): string[] | null {
  // Build adjacency: localId → set of localIds it depends on.
  const allTasks = groups.flatMap((g) => g.tasks);
  const adj = new Map<string, string[]>();
  for (const t of allTasks) {
    adj.set(t.localId, t.prereqIds ?? []);
  }

  // DFS with three-colour marking: 0=unvisited, 1=in-stack, 2=done.
  const colour = new Map<string, number>();
  const parent = new Map<string, string | null>();
  for (const t of allTasks) {
    colour.set(t.localId, 0);
    parent.set(t.localId, null);
  }

  function dfs(node: string): string[] | null {
    colour.set(node, 1); // grey — in current DFS stack
    for (const dep of adj.get(node) ?? []) {
      if (!colour.has(dep)) continue; // dangling ref — ignore
      if (colour.get(dep) === 1) {
        // Back edge found — reconstruct the cycle path.
        // Walk parent pointers from `dep` back to `dep` through `node`.
        const cycle: string[] = [dep];
        let cur: string = node;
        while (cur !== dep) {
          cycle.push(cur);
          const p = parent.get(cur);
          if (!p) break;
          cur = p;
        }
        cycle.push(dep);
        return cycle.reverse();
      }
      if (colour.get(dep) === 0) {
        parent.set(dep, node);
        const sub = dfs(dep);
        if (sub) return sub;
      }
    }
    colour.set(node, 2); // black — fully explored
    return null;
  }

  for (const t of allTasks) {
    if (colour.get(t.localId) === 0) {
      const cycle = dfs(t.localId);
      if (cycle) return cycle;
    }
  }
  return null;
}

// ── parseGroups ───────────────────────────────────────────────────────────────
//
// Normalises raw JSON into typed TemplateGroup[].
// Assigns a localId when a task lacks one (handles old data / manual rows).
// Translates legacy prereqIndices → prereqIds using the flat index mapping
// so old stored data can be migrated on next save.

function parseGroups(raw: unknown): TemplateGroup[] {
  if (!Array.isArray(raw)) return [];

  // First pass: build a flat list of tasks in order so we can translate
  // any legacy prereqIndices. We collect (groupIdx, taskIdx) → localId.
  const flatLocalIds: string[] = [];
  const parsed: Array<{
    kind: "setup" | "recurring";
    heading: string;
    rawTasks: Array<{
      localId: string;
      label: string;
      department: string;
      offsetDays: number;
      offsetFrom: "launch" | "prereq";
      prereqIds: string[];
      legacyIndices: number[];
    }>;
  }> = [];

  for (const g of raw) {
    if (g === null || typeof g !== "object") continue;
    const rec = g as Record<string, unknown>;
    const kind: "setup" | "recurring" = rec.kind === "recurring" ? "recurring" : "setup";
    const heading = typeof rec.heading === "string" ? rec.heading : "";
    const rawTasks: typeof parsed[0]["rawTasks"] = [];

    if (Array.isArray(rec.tasks)) {
      for (const t of rec.tasks) {
        if (t === null || typeof t !== "object") continue;
        const td = t as Record<string, unknown>;

        // Assign localId if missing.
        const localId =
          typeof td.localId === "string" && td.localId.length > 0
            ? td.localId
            : makeLocalId();

        // prereqIds — preferred field.
        const prereqIds: string[] = Array.isArray(td.prereqIds)
          ? (td.prereqIds as unknown[]).filter((v): v is string => typeof v === "string")
          : [];

        // Legacy prereqIndices — translate to localIds after we know all
        // localIds. Collect the raw numbers for now.
        const legacyIndices: number[] = Array.isArray(td.prereqIndices)
          ? (td.prereqIndices as unknown[]).filter((v): v is number => typeof v === "number")
          : [];

        const offsetFrom: "launch" | "prereq" =
          td.offsetFrom === "prereq" ? "prereq" : "launch";

        rawTasks.push({
          localId,
          label:      typeof td.label      === "string" ? td.label      : "",
          department: typeof td.department === "string" ? td.department : "",
          offsetDays: typeof td.offsetDays === "number" ? td.offsetDays : 0,
          offsetFrom,
          prereqIds,
          legacyIndices,
        });
        flatLocalIds.push(localId);
      }
    }

    parsed.push({ kind, heading, rawTasks });
  }

  // Second pass: merge legacy indices into prereqIds.
  let flatIdx = 0;
  const result: TemplateGroup[] = [];
  for (const g of parsed) {
    const tasks: TemplateTaskDef[] = [];
    for (const rt of g.rawTasks) {
      const merged = new Set<string>(rt.prereqIds);
      for (const idx of rt.legacyIndices) {
        if (idx >= 0 && idx < flatLocalIds.length) {
          merged.add(flatLocalIds[idx]);
        }
        // Out-of-range legacy index: silently drop.
      }
      tasks.push({
        localId:    rt.localId,
        label:      rt.label,
        department: rt.department,
        offsetDays: rt.offsetDays,
        offsetFrom: rt.offsetFrom,
        prereqIds:  Array.from(merged),
      });
      flatIdx++;
    }
    result.push({ kind: g.kind, heading: g.heading, tasks });
  }
  void flatIdx;

  return result;
}

// ── rowToApi ──────────────────────────────────────────────────────────────────

function rowToApi(
  r: { id: string; serviceId: string; groups: unknown; updatedAt: string },
): TemplateRow {
  return {
    id:        r.id,
    serviceId: r.serviceId,
    groups:    parseGroups(r.groups),
    updatedAt: r.updatedAt,
  };
}

// ── labelFor ─────────────────────────────────────────────────────────────────

function labelForId(localId: string, groups: TemplateGroup[]): string {
  for (const g of groups) {
    for (const t of g.tasks) {
      if (t.localId === localId) return t.label || localId;
    }
  }
  return localId;
}

// ── Auth helper ───────────────────────────────────────────────────────────────

async function authorise(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return { user: null, denied: NextResponse.json({ error }, { status: status ?? 401 }) };
  const gate = requireDepartment(user!, "Account Management", "Member");
  if (gate) return { user: null, denied: NextResponse.json({ error: gate.error }, { status: gate.status }) };
  return { user: user!, denied: null };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { denied } = await authorise(req);
  if (denied) return denied;

  const serviceId = req.nextUrl.searchParams.get("serviceId");
  if (!serviceId) {
    return NextResponse.json({ error: "serviceId query param is required" }, { status: 400 });
  }

  try {
    const row = await prisma.taskListTemplate.findFirst({ where: { serviceId } });
    if (!row) {
      return NextResponse.json({ template: null });
    }
    return NextResponse.json({ template: rowToApi(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PUT ───────────────────────────────────────────────────────────────────────

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const { denied } = await authorise(req);
  if (denied) return denied;

  const serviceId = req.nextUrl.searchParams.get("serviceId");
  if (!serviceId) {
    return NextResponse.json({ error: "serviceId query param is required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { groups } = body as { groups?: unknown };
  if (!Array.isArray(groups)) {
    return NextResponse.json({ error: "Body must include groups (array)" }, { status: 400 });
  }

  // Parse and normalise — assigns localIds to any task that lacks one.
  const cleanGroups = parseGroups(groups);

  // Cycle check before writing.
  const cycle = findCycle(cleanGroups);
  if (cycle) {
    // Map localIds to labels for a readable message.
    const names = cycle.map((id) => `"${labelForId(id, cleanGroups)}"`).join(" → ");
    return NextResponse.json(
      { error: `Cycle detected: ${names}` },
      { status: 422 },
    );
  }

  const now = new Date().toISOString();

  try {
    const existing = await prisma.taskListTemplate.findFirst({ where: { serviceId } });

    let row;
    if (existing) {
      row = await prisma.taskListTemplate.update({
        where: { id: existing.id },
        data:  { groups: cleanGroups as object[], updatedAt: now },
      });
    } else {
      row = await prisma.taskListTemplate.create({
        data: {
          id:        makeId("tlt"),
          serviceId,
          groups:    cleanGroups as object[],
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    return NextResponse.json({ template: rowToApi(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
