// RTM OS — Proposal Overrides API Route
//
// Records and retrieves field-level overrides on proposals.
// Override rows are append-only: the app never updates or deletes them.
//
// GET  /api/proposal-overrides?proposalId=<id>
//        → { overrides: ProposalOverrideRecord[] }
//
// POST /api/proposal-overrides
//        → body: ProposalOverrideInput
//        → { override: ProposalOverrideRecord }
//
// A failed write returns { error: string } with HTTP 500.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ProposalOverrideRecord {
  id: string;                   // BigInt serialised as string
  proposalId: string;
  fieldPath: string;
  fieldLabel: string;
  overridingUserId: string;
  overriddenAt: string;         // ISO-8601
  priorValue: unknown;          // null when the field did not previously exist
  newValue: unknown;
  overrideType: string;
}

export interface ProposalOverrideInput {
  proposalId: string;
  fieldPath: string;
  fieldLabel?: string;
  priorValue?: unknown;
  newValue: unknown;
  overrideType?: "price-override" | "manual-line-item" | "field-override";
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const proposalId = req.nextUrl.searchParams.get("proposalId");
  if (!proposalId) {
    return NextResponse.json(
      { error: "proposalId query param is required" },
      { status: 400 }
    );
  }

  try {
    const rows = await prisma.proposalOverride.findMany({
      where: { proposalId },
      orderBy: { id: "asc" },
    });
    const overrides: ProposalOverrideRecord[] = rows.map((r) => ({
      id: r.id.toString(),
      proposalId: r.proposalId,
      fieldPath: r.fieldPath,
      fieldLabel: r.fieldLabel,
      overridingUserId: r.overridingUserId,
      overriddenAt: r.overriddenAt,
      priorValue: r.priorValue,
      newValue: r.newValue,
      overrideType: r.overrideType,
    }));
    return NextResponse.json({ overrides });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const input = body as Partial<ProposalOverrideInput>;
  if (
    !input ||
    typeof input.proposalId !== "string" ||
    typeof input.fieldPath !== "string" ||
    input.newValue === undefined
  ) {
    return NextResponse.json(
      { error: "Body must include proposalId (string), fieldPath (string), newValue" },
      { status: 400 }
    );
  }

  // overridingUserId comes from the authenticated session — never from the body.
  const overridingUserId = user!.id;
  const now = new Date().toISOString();

  try {
    const row = await prisma.proposalOverride.create({
      data: {
        proposalId: input.proposalId,
        fieldPath: input.fieldPath,
        fieldLabel: input.fieldLabel ?? "",
        overridingUserId,
        overriddenAt: now,
        priorValue: input.priorValue !== undefined && input.priorValue !== null
          ? (input.priorValue as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        newValue: input.newValue !== null
          ? (input.newValue as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        overrideType: input.overrideType ?? "field-override",
      },
    });

    const override: ProposalOverrideRecord = {
      id: row.id.toString(),
      proposalId: row.proposalId,
      fieldPath: row.fieldPath,
      fieldLabel: row.fieldLabel,
      overridingUserId: row.overridingUserId,
      overriddenAt: row.overriddenAt,
      priorValue: row.priorValue,
      newValue: row.newValue,
      overrideType: row.overrideType,
    };
    return NextResponse.json({ override });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
