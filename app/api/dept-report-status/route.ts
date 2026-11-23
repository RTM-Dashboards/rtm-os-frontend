// RTM OS — Department Report Status API Route
//
// Persistence layer: Postgres table `dept_report_status`.
// Migrated from data/dept-report-status.json (fs.writeFileSync)
// which was silently discarded on every Vercel deploy.
//
// External shape is unchanged:
//   GET  /api/dept-report-status → { records: DeptReportStatusRecord[] }
//   POST /api/dept-report-status → body: { reportId: string; status: string }
//                                  → { record: DeptReportStatusRecord }
//                                  (server assigns/overwrites updatedAt; upsert by reportId)
//
// Auth guard: getSessionUser — matches the original file-backed route.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// ── Types (inline — server-only route, do not import from client modules) ─────

export interface DeptReportStatusRecord {
  reportId: string;
  status: string;
  updatedAt: string; // ISO-8601
}

// ── DB row type ───────────────────────────────────────────────────────────────

interface StatusRow {
  reportId: string;
  status: string;
  updatedAt: string;
}

function rowToRecord(row: StatusRow): DeptReportStatusRecord {
  return {
    reportId:  row.reportId,
    status:    row.status,
    updatedAt: row.updatedAt,
  };
}

// ── Allow-list for POST body fields ──────────────────────────────────────────

const POST_ALLOW_LIST = ["reportId", "status"] as const;
const POST_ALLOW_SET = new Set<string>(POST_ALLOW_LIST);

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const rows = await prisma.$queryRawUnsafe<StatusRow[]>(
    `SELECT * FROM dept_report_status ORDER BY "updatedAt" DESC`
  );
  return NextResponse.json({ records: rows.map(rowToRecord) });
}

// ── POST ───────────────────────────────────────────────────────────────────────

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
    typeof rawBody.reportId !== "string" ||
    typeof rawBody.status !== "string"
  ) {
    return NextResponse.json(
      { error: "Body must include reportId (string) and status (string)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  // Upsert — one record per reportId.
  await prisma.$executeRawUnsafe(
    `INSERT INTO dept_report_status ("reportId", status, "updatedAt")
     VALUES ($1,$2,$3)
     ON CONFLICT ("reportId") DO UPDATE SET
       status      = EXCLUDED.status,
       "updatedAt" = EXCLUDED."updatedAt"`,
    rawBody.reportId as string,
    rawBody.status as string,
    now
  );

  const record: DeptReportStatusRecord = {
    reportId:  rawBody.reportId as string,
    status:    rawBody.status as string,
    updatedAt: now,
  };

  return NextResponse.json({ record });
}
