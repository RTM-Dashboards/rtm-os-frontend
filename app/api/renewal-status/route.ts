// RTM OS — Renewal Status API Route
//
// Persistence layer: Postgres table `renewal_status`.
// Migrated from data/renewal-status.json (fs.writeFileSync) which was
// silently discarded on every Vercel deploy.
//
// External shape is unchanged:
//   GET  /api/renewal-status → { records: RenewalStatusRecord[] }
//   POST /api/renewal-status → body: { clientId: string; decision: string; notes?: string }
//                              → { record: RenewalStatusRecord }
//                              (server assigns/overwrites updatedAt; upsert by clientId)
//
// Auth guard: getSessionUser — matches the original file-backed route.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// ── Types ─────────────────────────────────────────────────────────────────────

export type RenewalDecision =
  | "Pending"
  | "Renew"
  | "Renew with Changes"
  | "Decline";

export interface RenewalStatusRecord {
  clientId: string;
  decision: RenewalDecision;
  notes: string;
  updatedAt: string;
}

// ── DB row type ───────────────────────────────────────────────────────────────

interface StatusRow {
  clientId: string;
  decision: string;
  notes: string;
  updatedAt: string;
}

function rowToRecord(row: StatusRow): RenewalStatusRecord {
  return {
    clientId:  row.clientId,
    decision:  row.decision as RenewalDecision,
    notes:     row.notes,
    updatedAt: row.updatedAt,
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const rows = await prisma.$queryRawUnsafe<StatusRow[]>(
    `SELECT * FROM renewal_status ORDER BY "updatedAt" DESC`
  );
  return NextResponse.json({ records: rows.map(rowToRecord) });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { clientId?: unknown; decision?: unknown; notes?: unknown };

  if (
    !payload ||
    typeof payload.clientId !== "string" ||
    typeof payload.decision !== "string"
  ) {
    return NextResponse.json(
      { error: "Body must include clientId (string) and decision (string)" },
      { status: 400 }
    );
  }

  const validDecisions: RenewalDecision[] = ["Pending", "Renew", "Renew with Changes", "Decline"];
  if (!validDecisions.includes(payload.decision as RenewalDecision)) {
    return NextResponse.json(
      { error: `decision must be one of: ${validDecisions.join(", ")}` },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  await prisma.$executeRawUnsafe(
    `INSERT INTO renewal_status ("clientId", decision, notes, "updatedAt")
     VALUES ($1,$2,$3,$4)
     ON CONFLICT ("clientId") DO UPDATE SET
       decision   = EXCLUDED.decision,
       notes      = EXCLUDED.notes,
       "updatedAt" = EXCLUDED."updatedAt"`,
    payload.clientId as string,
    payload.decision as string,
    typeof payload.notes === "string" ? payload.notes : "",
    now
  );

  const record: RenewalStatusRecord = {
    clientId:  payload.clientId as string,
    decision:  payload.decision as RenewalDecision,
    notes:     typeof payload.notes === "string" ? payload.notes : "",
    updatedAt: now,
  };

  return NextResponse.json({ record });
}
