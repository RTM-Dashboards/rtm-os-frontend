// =============================================================================
// RTM OS — Task Blueprints API Route
// app/api/task-blueprints/route.ts
//
// Single source of truth for TaskBlueprint data and the SERVICE_TO_BLUEPRINT
// activation mapping.  Both the Task List Templates page and the AM Activation
// Wizard (lib/engine/create-project.ts) read from this store.
//
// Persistence: data/task-blueprints.json
//
// GET  /api/task-blueprints
//   → { blueprints: TaskBlueprint[], serviceMapping: Record<string, string> }
//
// POST /api/task-blueprints
//   body: { blueprint: TaskBlueprint, serviceMappings?: string[] }
//   Creates a new blueprint and optionally appends service-mapping entries.
//   → { blueprint: TaskBlueprint, serviceMapping: Record<string, string> }
//
// PATCH /api/task-blueprints?id=<id>
//   body: Partial<TaskBlueprint> & { serviceMappings?: string[] }
//   Updates an existing blueprint and optionally extends service mapping.
//   → { blueprint: TaskBlueprint, serviceMapping: Record<string, string> }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types (mirrors lib/engine/types.ts — kept local to avoid server/client
//    bundle entanglement; keep in sync) ───────────────────────────────────────

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
}

interface BlueprintFile {
  blueprints: TaskBlueprint[];
  serviceMapping: Record<string, string>;
}

// ── File path ─────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "task-blueprints.json");

// ── File I/O ──────────────────────────────────────────────────────────────────

function readStore(): BlueprintFile {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<BlueprintFile>;
    return {
      blueprints: parsed.blueprints ?? [],
      serviceMapping: parsed.serviceMapping ?? {},
    };
  } catch {
    return { blueprints: [], serviceMapping: {} };
  }
}

function writeStore(store: BlueprintFile): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const store = readStore();
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const blueprint = store.blueprints.find((b) => b.id === id);
    if (!blueprint) {
      return NextResponse.json({ error: "blueprint not found" }, { status: 404 });
    }
    return NextResponse.json({ blueprint, serviceMapping: store.serviceMapping });
  }

  return NextResponse.json({
    blueprints: store.blueprints,
    serviceMapping: store.serviceMapping,
  });
}

// ── POST — create a new blueprint ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    blueprint: TaskBlueprint;
    /** Lowercase service-name keys that should route to this blueprint */
    serviceMappings?: string[];
  };

  if (!body.blueprint || !body.blueprint.id) {
    return NextResponse.json(
      { error: "blueprint with id required" },
      { status: 400 }
    );
  }

  const store = readStore();

  // Reject duplicate id
  if (store.blueprints.find((b) => b.id === body.blueprint.id)) {
    return NextResponse.json(
      { error: `blueprint with id '${body.blueprint.id}' already exists` },
      { status: 409 }
    );
  }

  store.blueprints.push(body.blueprint);

  // Append service mappings
  if (body.serviceMappings && body.serviceMappings.length > 0) {
    for (const key of body.serviceMappings) {
      const normalized = key.toLowerCase().trim();
      if (normalized) {
        store.serviceMapping[normalized] = body.blueprint.id;
      }
    }
  }

  writeStore(store);

  return NextResponse.json({
    blueprint: body.blueprint,
    serviceMapping: store.serviceMapping,
  });
}

// ── PATCH — update an existing blueprint ─────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "id query param required" },
      { status: 400 }
    );
  }

  const body = (await req.json()) as Partial<TaskBlueprint> & {
    serviceMappings?: string[];
  };

  const store = readStore();
  const idx = store.blueprints.findIndex((b) => b.id === id);
  if (idx === -1) {
    return NextResponse.json(
      { error: "blueprint not found" },
      { status: 404 }
    );
  }

  const { serviceMappings, ...patch } = body;
  store.blueprints[idx] = { ...store.blueprints[idx], ...patch };

  // Extend service mappings if provided
  if (serviceMappings && serviceMappings.length > 0) {
    for (const key of serviceMappings) {
      const normalized = key.toLowerCase().trim();
      if (normalized) {
        store.serviceMapping[normalized] = id;
      }
    }
  }

  writeStore(store);

  return NextResponse.json({
    blueprint: store.blueprints[idx],
    serviceMapping: store.serviceMapping,
  });
}
