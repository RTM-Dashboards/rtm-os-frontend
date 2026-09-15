// RTM OS — Points of Contact API Route
//
// Persistence layer: reads/writes the `points_of_contact` table in Postgres
// via Prisma. No filesystem fallback. No GHL sync. No seed import.
//
// GET  /api/points-of-contact                      → { records: PointOfContactRecord[] }
// GET  /api/points-of-contact?id=<id>              → { record: PointOfContactRecord }
// GET  /api/points-of-contact?businessId=<id>      → { records: PointOfContactRecord[] }
// POST /api/points-of-contact                      → body: PointOfContactRecord (id required)
//                                                   → { record: PointOfContactRecord } (upsert by id)
//
// A failed write returns { error: string } with HTTP 500.
// A missing record returns { error: string } with HTTP 404.
// It NEVER returns { record } on failure.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────────────────────

// Role is a plain string so the list can grow without a migration.
// Expected values: "Owner" | "Marketing" | "Billing" | "Technical" | "Other"
export interface PointOfContactRecord {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── DB row ↔ PointOfContactRecord conversion ──────────────────────────────────

type PointOfContactRow = Prisma.PointOfContactGetPayload<Record<string, never>>;

function rowToRecord(row: PointOfContactRow): PointOfContactRecord {
  return {
    id: row.id,
    businessId: row.businessId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    isPrimary: row.isPrimary,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const businessId = searchParams.get("businessId");

  if (id) {
    try {
      const row = await prisma.pointOfContact.findUnique({ where: { id } });
      if (!row) {
        return NextResponse.json(
          { error: `No point of contact found with id: ${id}` },
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
      const rows = await prisma.pointOfContact.findMany({
        where: { businessId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ records: rows.map(rowToRecord) });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  try {
    const rows = await prisma.pointOfContact.findMany({
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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as Partial<PointOfContactRecord>;
  if (!incoming || typeof incoming.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  try {
    const existing = await prisma.pointOfContact.findUnique({ where: { id: incoming.id } });

    let row: PointOfContactRow;

    if (existing) {
      row = await prisma.pointOfContact.update({
        where: { id: incoming.id },
        data: {
          businessId: incoming.businessId ?? existing.businessId,
          name:       incoming.name       ?? existing.name,
          email:      incoming.email      ?? existing.email,
          phone:      incoming.phone      ?? existing.phone,
          role:       incoming.role       ?? existing.role,
          isPrimary:  incoming.isPrimary  !== undefined ? incoming.isPrimary : existing.isPrimary,
          updatedAt:  now,
        },
      });
    } else {
      if (!incoming.businessId) {
        return NextResponse.json(
          { error: "Body must include businessId when creating a point of contact" },
          { status: 400 }
        );
      }
      row = await prisma.pointOfContact.create({
        data: {
          id:         incoming.id,
          businessId: incoming.businessId,
          name:       incoming.name      ?? "",
          email:      incoming.email     ?? "",
          phone:      incoming.phone     ?? "",
          role:       incoming.role      ?? "Other",
          isPrimary:  incoming.isPrimary ?? false,
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
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Query param id is required" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.pointOfContact.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: `No point of contact found with id: ${id}` },
        { status: 404 }
      );
    }
    await prisma.pointOfContact.delete({ where: { id } });
    return NextResponse.json({ deleted: id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
