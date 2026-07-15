// RTM OS — KPI Definitions API Route
//
// Persistence layer: reads/writes data/kpi-definitions.json (project root).
//
// GET  /api/kpi-definitions
//   → { definitions: KpiDefinition[] }
//   Returns all KPI definitions.
//
// PATCH /api/kpi-definitions
//   body: { id: string; enabled: boolean }
//   → { definition: KpiDefinition }
//   Toggles the enabled flag for a single KPI by id.

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KpiDefinition {
  id: string;
  name: string;
  category: "Campaign" | "People";
  departments: string[]; // dept slugs, or ["all"] for universal
  enabled: boolean;
  description?: string;
}

interface DefinitionsFile {
  definitions: KpiDefinition[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "kpi-definitions.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readDefinitions(): KpiDefinition[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DefinitionsFile;
    if (!Array.isArray(parsed.definitions)) throw new Error("bad shape");
    return parsed.definitions;
  } catch {
    return [];
  }
}

function writeDefinitions(definitions: KpiDefinition[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ definitions }, null, 2),
    "utf-8"
  );
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const definitions = readDefinitions();
  return NextResponse.json({ definitions });
}

// ── PATCH ──────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { id?: unknown; enabled?: unknown };
  if (
    !payload ||
    typeof payload.id !== "string" ||
    typeof payload.enabled !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Body must include id (string) and enabled (boolean)" },
      { status: 400 }
    );
  }

  const definitions = readDefinitions();
  const idx = definitions.findIndex((d) => d.id === payload.id);
  if (idx < 0) {
    return NextResponse.json(
      { error: `KPI definition '${payload.id}' not found` },
      { status: 404 }
    );
  }

  definitions[idx] = { ...definitions[idx], enabled: payload.enabled as boolean };

  try {
    writeDefinitions(definitions);
    return NextResponse.json({ definition: definitions[idx] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
