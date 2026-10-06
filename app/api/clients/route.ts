// RTM OS — Clients API Route
//
// Persistence layer: reads/writes the `clients` table in Postgres via Prisma.
// No filesystem fallback. No GHL sync. No seed import.
//
// GET  /api/clients            → { records: ClientRecord[] }
// GET  /api/clients?id=<id>    → { record: ClientRecord }
// POST /api/clients            → body: ClientRecord (id required)
//                               → { record: ClientRecord }  (upsert by id)
//
// A failed write returns { error: string } with HTTP 500.
// A missing record on GET?id returns { error: string } with HTTP 404.
// It NEVER returns { record } on failure.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { getSessionUser, requireRole } from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ClientRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  assignedAM: string;
  // Provenance only — records where this client came from in GHL.
  // NOT an identity key. NOT a matching key.
  ghlContactId: string | null;
  /**
   * Client's master business address, carried from intake → contract → handoff → client.
   * Schema: { street, suite, city, state, zip, country }.
   * Null for clients created before this migration or without an intake address.
   */
  address: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

// ── DB row ↔ ClientRecord conversion ─────────────────────────────────────────

type ClientRow = Prisma.ClientGetPayload<Record<string, never>>;

function rowToRecord(row: ClientRow): ClientRecord {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    company: row.company,
    assignedAM: row.assignedAM,
    ghlContactId: row.ghlContactId ?? null,
    address: (row.address ?? null) as Record<string, string> | null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Auth: any active user (Member or above).
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });
  void user;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    try {
      const row = await prisma.client.findUnique({ where: { id } });
      if (!row) {
        return NextResponse.json(
          { error: `No client found with id: ${id}` },
          { status: 404 }
        );
      }
      // Also return associated businesses for a single-client lookup
      const businesses = await prisma.business.findMany({
        where: { clientId: id },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({
        record: rowToRecord(row),
        businesses: businesses,
      });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  try {
    const rows = await prisma.client.findMany({
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
  // Auth: any active user (Member or above). Creating a client from an approved
  // handoff is routine Billing work — not Manager-only.
  const { user: postUser, error: postAuthError, status: postAuthStatus } = await getSessionUser(req);
  if (postAuthError) return NextResponse.json({ error: postAuthError }, { status: postAuthStatus! });
  void postUser;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as Partial<ClientRecord>;
  if (!incoming || typeof incoming.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  try {
    const existing = await prisma.client.findUnique({ where: { id: incoming.id } });

    let row: ClientRow;

    if (existing) {
      row = await prisma.client.update({
        where: { id: incoming.id },
        data: {
          fullName:     incoming.fullName     ?? existing.fullName,
          email:        incoming.email        ?? existing.email,
          phone:        incoming.phone        ?? existing.phone,
          company:      incoming.company      ?? existing.company,
          assignedAM:   incoming.assignedAM   ?? existing.assignedAM,
          ghlContactId: incoming.ghlContactId !== undefined
            ? incoming.ghlContactId
            : existing.ghlContactId,
          // address: only write when supplied; null is valid (no address).
          ...(incoming.address !== undefined
            ? { address: incoming.address as unknown as Prisma.InputJsonValue }
            : {}),
          updatedAt: now,
        },
      });
    } else {
      row = await prisma.client.create({
        data: {
          id:           incoming.id,
          fullName:     incoming.fullName     ?? "",
          email:        incoming.email        ?? "",
          phone:        incoming.phone        ?? "",
          company:      incoming.company      ?? "",
          assignedAM:   incoming.assignedAM   ?? "",
          ghlContactId: incoming.ghlContactId ?? null,
          // address: carried from handoff at client creation; null when not available.
          address:      (incoming.address ?? null) as unknown as Prisma.InputJsonValue,
          createdAt:    now,
          updatedAt:    now,
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
  // Auth: Manager or above.
  const { user: deleteUser, error: deleteAuthError, status: deleteAuthStatus } = await getSessionUser(req);
  if (deleteAuthError) return NextResponse.json({ error: deleteAuthError }, { status: deleteAuthStatus! });
  const deleteRoleGate = requireRole(deleteUser!, "Manager");
  if (deleteRoleGate) return NextResponse.json({ error: deleteRoleGate.error }, { status: deleteRoleGate.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Query param id is required" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: `No client found with id: ${id}` },
        { status: 404 }
      );
    }
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ deleted: id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
