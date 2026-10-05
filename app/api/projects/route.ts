// RTM OS — Projects API Route
//
// Persistence layer: reads/writes the `projects` table in Postgres via Prisma.
// No filesystem fallback. No GHL sync. No seed import.
//
// One project per domain (per Business). The old shape (one project per
// service with a `service` text column and a `deliverables` Json blob) has
// been replaced. Services sold beneath a project are ProjectCategory rows;
// deliverables are Task rows. Neither is served from this route.
//
// GET  /api/projects                   → { records: ProjectRecord[] }
// GET  /api/projects?id=<id>           → { record: ProjectRecord }
// GET  /api/projects?businessId=<id>   → { records: ProjectRecord[] }
// POST /api/projects                   → body: ProjectRecord (id required)
//                                       → { record: ProjectRecord } (upsert by id)
// DELETE /api/projects?id=<id>         → { deleted: id }
//
// A failed write returns { error: string } with HTTP 500.
// A missing record returns { error: string } with HTTP 404.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────────────────────

// Valid status values: "planned" | "active" | "on_hold" | "complete" | "cancelled"
export interface ProjectRecord {
  id: string;
  businessId: string;
  name: string;
  status: string;
  assignedAM: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── DB row ↔ ProjectRecord conversion ────────────────────────────────────────

type ProjectRow = Prisma.ProjectGetPayload<Record<string, never>>;

function rowToRecord(row: ProjectRow): ProjectRecord {
  return {
    id:         row.id,
    businessId: row.businessId,
    name:       row.name,
    status:     row.status,
    assignedAM: row.assignedAM,
    startDate:  row.startDate ?? null,
    endDate:    row.endDate   ?? null,
    createdAt:  row.createdAt,
    updatedAt:  row.updatedAt,
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus ?? 401 });

  const { searchParams } = new URL(req.url);
  const id         = searchParams.get("id");
  const businessId = searchParams.get("businessId");

  if (id) {
    try {
      const row = await prisma.project.findUnique({ where: { id } });
      if (!row) {
        return NextResponse.json(
          { error: `No project found with id: ${id}` },
          { status: 404 }
        );
      }
      return NextResponse.json({ record: rowToRecord(row) });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  if (businessId) {
    try {
      const rows = await prisma.project.findMany({
        where:   { businessId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ records: rows.map(rowToRecord) });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  try {
    const rows = await prisma.project.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ records: rows.map(rowToRecord) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
// Upsert by id.

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus ?? 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as Partial<ProjectRecord>;
  if (!incoming || typeof incoming.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  try {
    const existing = await prisma.project.findUnique({ where: { id: incoming.id } });

    let row: ProjectRow;

    if (existing) {
      row = await prisma.project.update({
        where: { id: incoming.id },
        data: {
          businessId: incoming.businessId ?? existing.businessId,
          name:       incoming.name       ?? existing.name,
          status:     incoming.status     ?? existing.status,
          assignedAM: incoming.assignedAM ?? existing.assignedAM,
          startDate:  incoming.startDate !== undefined ? incoming.startDate : existing.startDate,
          endDate:    incoming.endDate   !== undefined ? incoming.endDate   : existing.endDate,
          updatedAt:  now,
        },
      });
    } else {
      if (!incoming.businessId) {
        return NextResponse.json(
          { error: "Body must include businessId when creating a project" },
          { status: 400 }
        );
      }
      row = await prisma.project.create({
        data: {
          id:         incoming.id,
          businessId: incoming.businessId,
          name:       incoming.name      ?? "",
          status:     incoming.status    ?? "planned",
          assignedAM: incoming.assignedAM ?? "",
          startDate:  incoming.startDate  ?? null,
          endDate:    incoming.endDate    ?? null,
          createdAt:  now,
          updatedAt:  now,
        },
      });
    }

    return NextResponse.json({ record: rowToRecord(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus ?? 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Query param id is required" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: `No project found with id: ${id}` },
        { status: 404 }
      );
    }
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ deleted: id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
