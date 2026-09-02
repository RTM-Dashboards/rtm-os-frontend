// RTM OS — Pipeline Stages API Route
//
// Persistence layer: reads/writes the pipeline_stages table via Postgres/Prisma.
// Previously wrote to data/pipeline-stages.json, which silently discarded every
// write in production (Vercel's serverless filesystem is read-only).
//
// GET  /api/pipeline-stages       → { stages: PipelineStageDefinition[] }
// POST /api/pipeline-stages       → body: { stages: PipelineStageDefinition[] }
//                                   → 200 { ok: true } | 400/500
//
// Request and response shapes are unchanged from the previous implementation.
// The pipeline config editor (/settings/pipeline-config) and the Kanban board
// (/sales/pipeline) work without modification.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export interface PipelineStageDefinition {
  id: string;
  name: string;
  order: number;
  color: string;
  bg: string;
  border: string;
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await prisma.pipelineStage.findMany({
      orderBy: { order: "asc" },
    });

    const stages: PipelineStageDefinition[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      order: r.order,
      color: r.color,
      bg: r.bg,
      border: r.border,
    }));

    return NextResponse.json({ stages });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
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

  const incoming = (body as { stages: PipelineStageDefinition[] }).stages;

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
    const now = new Date().toISOString();

    // Replace all rows atomically: delete existing, insert incoming.
    // A transaction ensures the table is never left empty between the two steps.
    await prisma.$transaction([
      prisma.pipelineStage.deleteMany(),
      prisma.pipelineStage.createMany({
        data: incoming.map((s) => ({
          id: s.id,
          name: s.name,
          order: s.order,
          color: s.color ?? "",
          bg: s.bg ?? "",
          border: s.border ?? "",
          createdAt: now,
          updatedAt: now,
        })),
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
