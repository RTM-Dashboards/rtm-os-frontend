// RTM OS — KPI Definitions API Route
//
// Persistence layer: reads/writes the kpi_definitions table via Postgres/Prisma.
// Previously wrote to data/kpi-definitions.json, which silently discarded every
// write in production (Vercel's serverless filesystem is read-only).
//
// GET  /api/kpi-definitions
//   → { definitions: KpiDefinition[] }
//   Returns all KPI definitions.
//
// PATCH /api/kpi-definitions
//   body: { id: string; enabled: boolean }
//   → { definition: KpiDefinition }
//   Toggles the enabled flag for a single KPI by id.
//
// Request and response shapes are unchanged from the previous implementation.
// useEnabledKpis and KpiSettingsSection work without modification.
// useEnabledKpis still fails open: it returns true while loading and true if
// the fetch fails, so a KPI is shown rather than hidden when the system
// cannot answer. That behaviour is in the hook itself and is unaffected here.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KpiDefinition {
  id: string;
  name: string;
  category: "Campaign" | "People";
  departments: string[]; // dept slugs, or ["all"] for universal
  enabled: boolean;
  description?: string;
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await prisma.kpiDefinition.findMany({
      orderBy: { id: "asc" },
    });

    const definitions: KpiDefinition[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category as "Campaign" | "People",
      departments: r.departments,
      enabled: r.enabled,
      description: r.description || undefined,
    }));

    return NextResponse.json({ definitions });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
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

  try {
    const existing = await prisma.kpiDefinition.findUnique({
      where: { id: payload.id as string },
    });

    if (!existing) {
      return NextResponse.json(
        { error: `KPI definition '${payload.id}' not found` },
        { status: 404 }
      );
    }

    const updated = await prisma.kpiDefinition.update({
      where: { id: payload.id as string },
      data: {
        enabled: payload.enabled as boolean,
        updatedAt: new Date().toISOString(),
      },
    });

    const definition: KpiDefinition = {
      id: updated.id,
      name: updated.name,
      category: updated.category as "Campaign" | "People",
      departments: updated.departments,
      enabled: updated.enabled,
      description: updated.description || undefined,
    };

    return NextResponse.json({ definition });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
