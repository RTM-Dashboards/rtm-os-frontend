// RTM OS — Lead Stages API Route
//
// Persistence layer: reads/writes the lead_stages table via Postgres/Prisma.
// Previously the stage list lived as compile-time constants in
// app/(sales)/sales/leads/page.tsx (LEAD_STAGES / STAGE_CONFIG), which could
// not be changed at runtime.
//
// GET  /api/lead-stages       → { stages: LeadStageDefinition[] }
// POST /api/lead-stages       → body: { stages: LeadStageDefinition[] }
//                               → 200 { ok: true } | 400/500
//
// Request and response conventions match /api/pipeline-stages exactly.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export interface LeadStageDefinition {
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
    const rows = await prisma.leadStage.findMany({
      orderBy: { order: "asc" },
    });

    const stages: LeadStageDefinition[] = rows.map((r) => ({
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
      { error: "Body must be { stages: LeadStageDefinition[] }" },
      { status: 400 }
    );
  }

  const incoming = (body as { stages: LeadStageDefinition[] }).stages;

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
      prisma.leadStage.deleteMany(),
      prisma.leadStage.createMany({
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
