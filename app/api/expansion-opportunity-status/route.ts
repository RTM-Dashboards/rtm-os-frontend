// RTM OS — Expansion Opportunity Status API Route
//
// Persistence layer: Postgres table `expansion_opportunity_status`.
// Migrated from data/expansion-opportunity-status.json (fs.writeFileSync)
// which was silently discarded on every Vercel deploy.
//
// External shape is unchanged:
//   GET  /api/expansion-opportunity-status → { records: ExpansionOpportunityStatusRecord[] }
//   POST /api/expansion-opportunity-status → body: { opportunityId: string; status: string }
//                                            → { record: ExpansionOpportunityStatusRecord }
//                                            (server assigns/overwrites updatedAt; upsert by opportunityId)
//
// Auth guard: getSessionUser — matches the original file-backed route.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// ── Types (inline — server-only route) ───────────────────────────────────────

export interface ExpansionOpportunityStatusRecord {
  opportunityId: string;
  status: string;
  updatedAt: string; // ISO-8601
}

// ── DB row type ───────────────────────────────────────────────────────────────

interface StatusRow {
  opportunityId: string;
  status: string;
  updatedAt: string;
}

function rowToRecord(row: StatusRow): ExpansionOpportunityStatusRecord {
  return {
    opportunityId: row.opportunityId,
    status:        row.status,
    updatedAt:     row.updatedAt,
  };
}

// ── Allow-list for POST body fields ──────────────────────────────────────────

const POST_ALLOW_LIST = ["opportunityId", "status"] as const;
const POST_ALLOW_SET = new Set<string>(POST_ALLOW_LIST);

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const rows = await prisma.$queryRawUnsafe<StatusRow[]>(
    `SELECT * FROM expansion_opportunity_status ORDER BY "updatedAt" DESC`
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

  const rawBody = body as Record<string, unknown>;

  // Reject keys not on allow-list.
  const unknownKeys = Object.keys(rawBody).filter((k) => !POST_ALLOW_SET.has(k));
  if (unknownKeys.length > 0) {
    return NextResponse.json(
      { error: `Unknown field(s): ${unknownKeys.join(", ")}` },
      { status: 400 }
    );
  }

  if (
    !rawBody ||
    typeof rawBody.opportunityId !== "string" ||
    typeof rawBody.status !== "string"
  ) {
    return NextResponse.json(
      {
        error:
          "Body must include opportunityId (string) and status (string)",
      },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  // Upsert — one record per opportunityId.
  await prisma.$executeRawUnsafe(
    `INSERT INTO expansion_opportunity_status ("opportunityId", status, "updatedAt")
     VALUES ($1,$2,$3)
     ON CONFLICT ("opportunityId") DO UPDATE SET
       status      = EXCLUDED.status,
       "updatedAt" = EXCLUDED."updatedAt"`,
    rawBody.opportunityId as string,
    rawBody.status as string,
    now
  );

  const record: ExpansionOpportunityStatusRecord = {
    opportunityId: rawBody.opportunityId as string,
    status:        rawBody.status as string,
    updatedAt:     now,
  };

  return NextResponse.json({ record });
}
