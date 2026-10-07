// =============================================================================
// RTM OS — Task Blueprints API Route
// app/api/task-blueprints/route.ts
//
// Restored (RF2 run, 20261008): all blueprint-level fields, all per-task
// fields, and all 13 service mappings (via blueprint_service_aliases) are
// now persisted and returned.
//
// GET  /api/task-blueprints
//   Returns all task_list_templates rows with every field.
//   Also returns serviceMapping from blueprint_service_aliases + serviceId keys.
//   → { blueprints: BlueprintApiRecord[], serviceMapping: Record<string,string> }
//
// GET  /api/task-blueprints?id=<serviceId-or-alias>
//   Resolves via alias table first, then direct serviceId lookup.
//   → { blueprint: BlueprintApiRecord, serviceMapping: Record<string,string> }
//
// POST /api/task-blueprints
//   Body: { blueprint: NewBlueprintPayload, serviceMappings?: string[] }
//   Creates or upserts a task_list_templates row and writes aliases.
//   → { blueprint: BlueprintApiRecord, serviceMapping: Record<string,string> }
//
// PATCH /api/task-blueprints?id=<serviceId-or-alias>
//   Body: Partial<NewBlueprintPayload> & { serviceMappings?: string[] }
//   → { blueprint: BlueprintApiRecord, serviceMapping: Record<string,string> }
//
// Error shape: { error: string }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireDepartment } from "@/lib/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BlueprintTask {
  id: string;
  name: string;
  department: string;
  ownerRole: string;
  estimatedHours: number;
  priority: string;
  dependsOnId?: string;
  dueDaysOffset: number;
  description?: string;
  /** Engine fields */
  localId?: string;
  offsetFrom?: "launch" | "prereq";
  prereqIds?: string[];
  intervalDays?: number;
}

export interface TaskBlueprint {
  id: string;
  name: string;
  department: string;
  servicePackage: string;
  mappedLineItem: string;
  description: string;
  activationTrigger: string;
  estimatedTotalHours: number;
  tasks: BlueprintTask[];
  isActive: boolean;
  lastUpdated: string;
  version: string;
  groups?: TemplateGroup[];
}

export interface TemplateTaskDef {
  localId: string;
  label: string;
  department: string;
  offsetDays: number;
  offsetFrom: "launch" | "prereq";
  prereqIds: string[];
  intervalDays?: number;
  // Restored per-task fields
  ownerRole?: string;
  estimatedHours?: number;
  priority?: string;
  description?: string;
}

export interface TemplateGroup {
  kind: "setup" | "recurring";
  heading: string;
  tasks: TemplateTaskDef[];
}

// Payload accepted by POST/PATCH
export interface NewBlueprintPayload {
  id: string;
  name?: string;
  department?: string;
  servicePackage?: string;
  mappedLineItem?: string;
  description?: string;
  activationTrigger?: string;
  estimatedTotalHours?: number;
  isActive?: boolean;
  version?: string;
  groups?: TemplateGroup[];
  tasks?: Array<{
    id?: string;
    name: string;
    department: string;
    ownerRole?: string;
    estimatedHours?: number;
    priority?: string;
    dueDaysOffset?: number;
    description?: string;
    dependsOnId?: string;
    localId?: string;
    offsetFrom?: "launch" | "prereq";
    prereqIds?: string[];
    intervalDays?: number;
  }>;
}

// ── ID helpers ────────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeLocalId(): string {
  return "t-" + Math.random().toString(36).slice(2, 7);
}

// ── Cycle detection ───────────────────────────────────────────────────────────

function findCycle(groups: TemplateGroup[]): string[] | null {
  const allTasks = groups.flatMap((g) => g.tasks);
  const adj = new Map<string, string[]>();
  for (const t of allTasks) adj.set(t.localId, t.prereqIds ?? []);

  const colour = new Map<string, number>();
  const parent = new Map<string, string | null>();
  for (const t of allTasks) { colour.set(t.localId, 0); parent.set(t.localId, null); }

  function dfs(node: string): string[] | null {
    colour.set(node, 1);
    for (const dep of adj.get(node) ?? []) {
      if (!colour.has(dep)) continue;
      if (colour.get(dep) === 1) {
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
    colour.set(node, 2);
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

function labelForId(localId: string, groups: TemplateGroup[]): string {
  for (const g of groups) {
    for (const t of g.tasks) {
      if (t.localId === localId) return t.label || localId;
    }
  }
  return localId;
}

// ── parseGroups ───────────────────────────────────────────────────────────────
//
// Normalises raw JSONB from Postgres into TemplateGroup[].
// Preserves all per-task fields including restored ones.

function parseGroups(raw: unknown): TemplateGroup[] {
  if (!Array.isArray(raw)) return [];
  const result: TemplateGroup[] = [];

  for (const g of raw) {
    if (!g || typeof g !== "object") continue;
    const rec = g as Record<string, unknown>;
    const kind: "setup" | "recurring" = rec.kind === "recurring" ? "recurring" : "setup";
    const heading = typeof rec.heading === "string" ? rec.heading : (kind === "setup" ? "Setup" : "Recurring");
    const tasks: TemplateTaskDef[] = [];

    if (Array.isArray(rec.tasks)) {
      for (const t of rec.tasks) {
        if (!t || typeof t !== "object") continue;
        const td = t as Record<string, unknown>;
        const localId = typeof td.localId === "string" && td.localId ? td.localId : makeLocalId();
        const prereqIds: string[] = Array.isArray(td.prereqIds)
          ? (td.prereqIds as unknown[]).filter((v): v is string => typeof v === "string")
          : [];
        const offsetFrom: "launch" | "prereq" = td.offsetFrom === "prereq" ? "prereq" : "launch";
        const intervalDays: number | undefined =
          typeof td.intervalDays === "number" && td.intervalDays > 0 ? td.intervalDays : undefined;

        const taskDef: TemplateTaskDef = {
          localId,
          label:       typeof td.label      === "string" ? td.label      : "",
          department:  typeof td.department === "string" ? td.department : "",
          offsetDays:  typeof td.offsetDays === "number" ? td.offsetDays : 0,
          offsetFrom,
          prereqIds,
          // Restored per-task fields
          ownerRole:      typeof td.ownerRole     === "string" ? td.ownerRole     : undefined,
          estimatedHours: typeof td.estimatedHours === "number" ? td.estimatedHours : undefined,
          priority:       typeof td.priority       === "string" ? td.priority       : undefined,
          description:    typeof td.description    === "string" ? td.description    : undefined,
        };
        if (intervalDays !== undefined) taskDef.intervalDays = intervalDays;
        tasks.push(taskDef);
      }
    }

    result.push({ kind, heading, tasks });
  }
  return result;
}

// ── legacyTasksToGroups ───────────────────────────────────────────────────────

function legacyTasksToGroups(
  tasks: NonNullable<NewBlueprintPayload["tasks"]>,
): TemplateGroup[] {
  const withLocalId = tasks.map((t) => ({
    ...t,
    resolvedLocalId: t.localId ?? makeLocalId(),
  }));

  const idToLocalId = new Map<string, string>();
  for (const t of withLocalId) {
    if (t.id) idToLocalId.set(t.id, t.resolvedLocalId);
    idToLocalId.set(t.resolvedLocalId, t.resolvedLocalId);
  }

  const taskDefs: TemplateTaskDef[] = withLocalId.map((t) => {
    const prereqIds: string[] = [];
    if (t.prereqIds && t.prereqIds.length > 0) {
      for (const pid of t.prereqIds) {
        const resolved = idToLocalId.get(pid);
        if (resolved && resolved !== t.resolvedLocalId) prereqIds.push(resolved);
      }
    } else if (t.dependsOnId) {
      const resolved = idToLocalId.get(t.dependsOnId);
      if (resolved && resolved !== t.resolvedLocalId) prereqIds.push(resolved);
    }

    const offsetFrom: "launch" | "prereq" =
      t.offsetFrom ?? (prereqIds.length > 0 ? "prereq" : "launch");

    const def: TemplateTaskDef = {
      localId:       t.resolvedLocalId,
      label:         t.name ?? "",
      department:    t.department ?? "",
      offsetDays:    t.dueDaysOffset ?? 0,
      offsetFrom,
      prereqIds,
      ownerRole:      t.ownerRole      ?? undefined,
      estimatedHours: t.estimatedHours ?? undefined,
      priority:       t.priority       ?? undefined,
      description:    t.description    ?? undefined,
    };
    if (t.intervalDays && t.intervalDays > 0) def.intervalDays = t.intervalDays;
    return def;
  });

  return [
    { kind: "setup",     heading: "Setup",     tasks: taskDefs },
    { kind: "recurring", heading: "Recurring", tasks: [] },
  ];
}

// ── Full row type (after restoration) ────────────────────────────────────────

interface TltRow {
  id: string;
  serviceId: string;
  groups: unknown;
  name: string;
  department: string;
  servicePackage: string;
  mappedLineItem: string;
  description: string;
  activationTrigger: string;
  estimatedTotalHours: unknown; // Decimal or number
  isActive: boolean;
  version: string;
  updatedAt: string;
}

// ── rowToBlueprint ────────────────────────────────────────────────────────────
//
// Converts a Postgres row to BlueprintApiRecord.
// All restored fields are read from their actual columns — nothing is synthesised.

function rowToBlueprint(row: TltRow): TaskBlueprint {
  const groups = parseGroups(row.groups);
  const setupGroup = groups.find((g) => g.kind === "setup");
  const allSetupTasks = setupGroup?.tasks ?? [];

  const localIdToLabel = new Map<string, string>();
  for (const t of allSetupTasks) localIdToLabel.set(t.localId, t.label);

  const tasks: BlueprintTask[] = allSetupTasks.map((t) => {
    const dependsOnId =
      t.prereqIds.length > 0 ? (localIdToLabel.get(t.prereqIds[0]) ?? t.prereqIds[0]) : undefined;

    return {
      id:             t.localId,
      name:           t.label,
      department:     t.department,
      ownerRole:      t.ownerRole      ?? "",
      estimatedHours: t.estimatedHours ?? 0,
      priority:       t.priority       ?? "High",
      dueDaysOffset:  t.offsetDays,
      description:    t.description    ?? undefined,
      localId:        t.localId,
      offsetFrom:     t.offsetFrom,
      prereqIds:      t.prereqIds,
      ...(t.prereqIds.length > 0 ? { dependsOnId } : {}),
    };
  });

  return {
    id:                  row.serviceId,
    name:                row.name || row.serviceId,
    department:          row.department,
    servicePackage:      row.servicePackage,
    mappedLineItem:      row.mappedLineItem,
    description:         row.description,
    activationTrigger:   row.activationTrigger,
    estimatedTotalHours: Number(row.estimatedTotalHours) || 0,
    tasks,
    isActive:            row.isActive,
    lastUpdated:         row.updatedAt.slice(0, 10),
    version:             row.version,
    groups,
  };
}

// ── payloadToGroups ───────────────────────────────────────────────────────────

function payloadToGroups(body: NewBlueprintPayload): TemplateGroup[] {
  if (body.groups && body.groups.length > 0) {
    return parseGroups(body.groups);
  }
  if (body.tasks && body.tasks.length > 0) {
    return legacyTasksToGroups(body.tasks);
  }
  return [
    { kind: "setup",     heading: "Setup",     tasks: [] },
    { kind: "recurring", heading: "Recurring", tasks: [] },
  ];
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

async function authRead(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return { user: null, denied: NextResponse.json({ error }, { status: status ?? 401 }) };
  return { user: user!, denied: null };
}

async function authWrite(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return { user: null, denied: NextResponse.json({ error }, { status: status ?? 401 }) };
  const gate = requireDepartment(user!, "Account Management", "Member");
  if (gate) return { user: null, denied: NextResponse.json({ error: gate.error }, { status: gate.status }) };
  return { user: user!, denied: null };
}

// ── buildServiceMapping ───────────────────────────────────────────────────────
//
// Returns all known strings (canonical serviceIds + all aliases) → canonical serviceId.

async function buildServiceMapping(): Promise<Record<string, string>> {
  const [rows, aliases] = await Promise.all([
    prisma.taskListTemplate.findMany({ select: { serviceId: true } }),
    prisma.blueprintServiceAlias.findMany({ select: { alias: true, template: { select: { serviceId: true } } } }),
  ]);
  const map: Record<string, string> = {};
  for (const r of rows)   map[r.serviceId] = r.serviceId;
  for (const a of aliases) map[a.alias] = a.template.serviceId;
  return map;
}

// ── resolveTemplate ───────────────────────────────────────────────────────────
//
// Finds a template by serviceId (direct) or alias. Returns the full row.

async function resolveTemplate(key: string): Promise<TltRow | null> {
  // Try direct serviceId match first.
  const direct = await prisma.taskListTemplate.findFirst({ where: { serviceId: key } });
  if (direct) return direct as unknown as TltRow;

  // Try alias table.
  const aliasRow = await prisma.blueprintServiceAlias.findFirst({
    where:   { alias: key },
    include: { template: true },
  });
  if (aliasRow) return aliasRow.template as unknown as TltRow;

  return null;
}

// ── syncAliases ───────────────────────────────────────────────────────────────
//
// Upserts alias rows for a template. The canonical serviceId is NOT stored in
// the aliases table (it is the primary key on the template row itself).

async function syncAliases(templateId: string, aliasKeys: string[], canonicalServiceId: string): Promise<void> {
  const now = new Date().toISOString();
  for (const raw of aliasKeys) {
    const alias = raw.toLowerCase().trim();
    if (!alias || alias === canonicalServiceId) continue;

    const existing = await prisma.blueprintServiceAlias.findFirst({ where: { alias } });
    if (existing) {
      // If this alias points at a different template, reassign it.
      if (existing.templateId !== templateId) {
        await prisma.blueprintServiceAlias.update({
          where: { id: existing.id },
          data:  { templateId, createdAt: now },
        });
      }
      // Already correct — nothing to do.
    } else {
      await prisma.blueprintServiceAlias.create({
        data: { id: makeId("bsa"), templateId, alias, createdAt: now },
      });
    }
  }
}

// ── blueprintFields ───────────────────────────────────────────────────────────
//
// Extracts the scalar blueprint-level fields from a payload for DB write.

function blueprintFields(bp: Partial<NewBlueprintPayload>) {
  return {
    ...(bp.name                !== undefined ? { name:                bp.name                } : {}),
    ...(bp.department          !== undefined ? { department:          bp.department          } : {}),
    ...(bp.servicePackage      !== undefined ? { servicePackage:      bp.servicePackage      } : {}),
    ...(bp.mappedLineItem      !== undefined ? { mappedLineItem:      bp.mappedLineItem      } : {}),
    ...(bp.description         !== undefined ? { description:         bp.description         } : {}),
    ...(bp.activationTrigger   !== undefined ? { activationTrigger:   bp.activationTrigger   } : {}),
    ...(bp.estimatedTotalHours !== undefined ? { estimatedTotalHours: bp.estimatedTotalHours } : {}),
    ...(bp.isActive            !== undefined ? { isActive:            bp.isActive            } : {}),
    ...(bp.version             !== undefined ? { version:             bp.version             } : {}),
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { denied } = await authRead(req);
  if (denied) return denied;

  const key = req.nextUrl.searchParams.get("id");

  try {
    if (key) {
      const row = await resolveTemplate(key);
      if (!row) return NextResponse.json({ error: "blueprint not found" }, { status: 404 });
      const blueprint = rowToBlueprint(row);
      const serviceMapping = await buildServiceMapping();
      return NextResponse.json({ blueprint, serviceMapping });
    }

    const rows = await prisma.taskListTemplate.findMany({ orderBy: { updatedAt: "desc" } });
    const blueprints = rows.map((r) => rowToBlueprint(r as unknown as TltRow));
    const serviceMapping = await buildServiceMapping();
    return NextResponse.json({ blueprints, serviceMapping });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST — create or upsert a template ───────────────────────────────────────

export async function POST(req: NextRequest) {
  const { denied } = await authWrite(req);
  if (denied) return denied;

  let body: { blueprint: NewBlueprintPayload; serviceMappings?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.blueprint || !body.blueprint.id) {
    return NextResponse.json({ error: "blueprint with id required" }, { status: 400 });
  }

  const bp   = body.blueprint;
  const canonicalServiceId = bp.id.toLowerCase().trim();

  const groups = payloadToGroups(bp);
  const cycle  = findCycle(groups);
  if (cycle) {
    const names = cycle.map((id) => `"${labelForId(id, groups)}"`).join(" → ");
    return NextResponse.json({ error: `Cycle detected: ${names}` }, { status: 422 });
  }

  const now = new Date().toISOString();

  try {
    const existing = await prisma.taskListTemplate.findFirst({ where: { serviceId: canonicalServiceId } });
    let row: TltRow;

    if (existing) {
      const updated = await prisma.taskListTemplate.update({
        where: { id: existing.id },
        data:  {
          groups:    groups as object[],
          updatedAt: now,
          ...blueprintFields(bp),
        },
      });
      row = updated as unknown as TltRow;
    } else {
      const created = await prisma.taskListTemplate.create({
        data: {
          id:        makeId("tlt"),
          serviceId: canonicalServiceId,
          groups:    groups as object[],
          createdAt: now,
          updatedAt: now,
          name:                bp.name                ?? "",
          department:          bp.department          ?? "",
          servicePackage:      bp.servicePackage      ?? "",
          mappedLineItem:      bp.mappedLineItem       ?? "",
          description:         bp.description         ?? "",
          activationTrigger:   bp.activationTrigger   ?? "",
          estimatedTotalHours: bp.estimatedTotalHours ?? 0,
          isActive:            bp.isActive            ?? true,
          version:             bp.version             ?? "",
        },
      });
      row = created as unknown as TltRow;
    }

    // Sync aliases (all provided keys except the canonical serviceId).
    const allAliasKeys = [
      ...(body.serviceMappings ?? []),
    ].map((s) => s.toLowerCase().trim()).filter(Boolean);
    if (allAliasKeys.length > 0) {
      await syncAliases(row.id, allAliasKeys, canonicalServiceId);
    }

    const blueprint    = rowToBlueprint(row);
    const serviceMapping = await buildServiceMapping();
    return NextResponse.json({ blueprint, serviceMapping });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — update an existing template ──────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const { denied } = await authWrite(req);
  if (denied) return denied;

  const key = req.nextUrl.searchParams.get("id");
  if (!key) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  let body: Partial<NewBlueprintPayload> & { serviceMappings?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const existing = await resolveTemplate(key);
    if (!existing) {
      return NextResponse.json({ error: "blueprint not found" }, { status: 404 });
    }

    let groups: TemplateGroup[];
    if (body.groups && body.groups.length > 0) {
      groups = parseGroups(body.groups);
    } else if (body.tasks && body.tasks.length > 0) {
      groups = legacyTasksToGroups(body.tasks);
    } else {
      groups = parseGroups(existing.groups);
    }

    const cycle = findCycle(groups);
    if (cycle) {
      const names = cycle.map((id) => `"${labelForId(id, groups)}"`).join(" → ");
      return NextResponse.json({ error: `Cycle detected: ${names}` }, { status: 422 });
    }

    const now     = new Date().toISOString();
    const updated = await prisma.taskListTemplate.update({
      where: { id: existing.id },
      data:  {
        groups:    groups as object[],
        updatedAt: now,
        ...blueprintFields(body),
      },
    });

    // Sync additional aliases.
    if (body.serviceMappings && body.serviceMappings.length > 0) {
      const aliasKeys = body.serviceMappings.map((s) => s.toLowerCase().trim()).filter(Boolean);
      await syncAliases(existing.id, aliasKeys, existing.serviceId);
    }

    const blueprint    = rowToBlueprint(updated as unknown as TltRow);
    const serviceMapping = await buildServiceMapping();
    return NextResponse.json({ blueprint, serviceMapping });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
