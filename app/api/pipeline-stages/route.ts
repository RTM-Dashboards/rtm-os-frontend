// RTM OS — Pipeline Stages API Route
//
// Persistence layer: reads/writes data/pipeline-stages.json (project root).
// This is the minimal persistence choice — no ORM or external DB dependency —
// because the codebase has no existing data layer. The file is gitignored-safe
// and survives server restarts.  Changes are reflected on Kanban board reload.
//
// GET  /api/pipeline-stages       → { stages: PipelineStageDefinition[] }
// POST /api/pipeline-stages       → body: { stages: PipelineStageDefinition[] }
//                                   → 200 { ok: true } | 400/500

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Resolve path relative to the Next.js project root (process.cwd())
const DATA_FILE = path.join(process.cwd(), "data", "pipeline-stages.json");

export interface PipelineStageDefinition {
  id: string;
  name: string;
  order: number;
  color: string;
  bg: string;
  border: string;
}

interface StageFile {
  stages: PipelineStageDefinition[];
}

function readStages(): PipelineStageDefinition[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StageFile;
    if (!Array.isArray(parsed.stages)) throw new Error("bad shape");
    return parsed.stages;
  } catch {
    // Return empty; caller will use defaults
    return [];
  }
}

function writeStages(stages: PipelineStageDefinition[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ stages }, null, 2), "utf-8");
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  const stages = readStages();
  return NextResponse.json({ stages });
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray((body as Record<string, unknown>).stages)
  ) {
    return NextResponse.json(
      { error: "Body must be { stages: PipelineStageDefinition[] }" },
      { status: 400 }
    );
  }

  const incoming = (body as StageFile).stages;

  // Basic validation: each stage must have id, name (non-empty string), order (number)
  for (const s of incoming) {
    if (
      typeof s.id !== "string" ||
      typeof s.name !== "string" ||
      !s.name.trim() ||
      typeof s.order !== "number"
    ) {
      return NextResponse.json(
        { error: `Invalid stage entry: ${JSON.stringify(s)}` },
        { status: 400 }
      );
    }
  }

  try {
    writeStages(incoming);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
