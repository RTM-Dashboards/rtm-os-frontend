// RTM OS — Pending Change Requests API Route
//
// Persistence layer: Postgres table `pending_change_requests`.
// Migrated from data/pending-change-requests.json (fs.writeFileSync)
// which was silently discarded on every Vercel deploy.
//
// External shape is unchanged:
//   GET   /api/pending-change-requests → { records: PendingChangeRequest[] }
//   POST  /api/pending-change-requests → body: AddChangeRequestPayload
//                                        → { record: PendingChangeRequest }
//                                        (server assigns id, submittedDate, status,
//                                         submittedByRole, billingApprovalStatus)
//   PATCH /api/pending-change-requests → body: { id: string, billingApprovalStatus?,
//                                               status? }
//                                        → { record: PendingChangeRequest }
//
// Auth guard: getSessionUser — matches the original file-backed route.
//
// id: auto-incremented as 'am-chg-N' using MAX(id) to avoid collisions across
// multiple server instances (Postgres is authoritative, not in-memory counters).

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// ── Types (inline — do not import from client-side module) ─────────────────

export type ChangeRequestType =
  | "Budget Reallocation"
  | "Service Upgrade"
  | "Service Downgrade"
  | "Service Addition"
  | "Service Removal"
  | "Pause"
  | "Reactivation"
  | "Contract Amendment"
  | "Custom Scope Change";

export type PendingChangeRequestStatus =
  | "Submitted"
  | "Under Review"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Implemented"
  | "Cancelled";

export interface PendingChangeRequest {
  id: string;
  client: string;
  requestType: ChangeRequestType;
  description: string;
  project: string;
  requestedBy: string;
  revenueImpact: number;
  departmentsImpacted: string[];
  submittedDate: string;
  status: PendingChangeRequestStatus;
  /** Server-set — always "AM" for requests submitted through this route. */
  submittedByRole: "AM";
  /** Billing-side approval status; default "Pending" until Billing acts. */
  billingApprovalStatus: "Pending" | "Approved" | "Rejected";
  notes?: string;
}

// Payload accepted on POST — server fills in the server-managed fields.
export type AddChangeRequestPayload = Omit<
  PendingChangeRequest,
  "id" | "submittedDate" | "status" | "submittedByRole" | "billingApprovalStatus"
>;

// ── DB row type ───────────────────────────────────────────────────────────────

interface RequestRow {
  id: string;
  client: string;
  requestType: string;
  description: string;
  project: string;
  requestedBy: string;
  revenueImpact: unknown; // Prisma returns NUMERIC as Decimal object
  departmentsImpacted: string[] | unknown;
  submittedDate: string;
  status: string;
  submittedByRole: string;
  billingApprovalStatus: string;
  notes: string;
  createdAt: string;
}

function rowToRecord(row: RequestRow): PendingChangeRequest {
  const deps = Array.isArray(row.departmentsImpacted)
    ? (row.departmentsImpacted as string[])
    : [];
  return {
    id:                    row.id,
    client:                row.client,
    requestType:           row.requestType as ChangeRequestType,
    description:           row.description,
    project:               row.project,
    requestedBy:           row.requestedBy,
    // Prisma returns NUMERIC as a Decimal object; Number() coerces all variants.
    revenueImpact:         Number(row.revenueImpact) || 0,
    departmentsImpacted:   deps,
    submittedDate:         row.submittedDate,
    status:                row.status as PendingChangeRequestStatus,
    submittedByRole:       "AM",
    billingApprovalStatus: row.billingApprovalStatus as "Pending" | "Approved" | "Rejected",
    notes:                 row.notes || undefined,
  };
}

// ── Allow-list for PATCH (R3c — iterate allow-list, never the request body) ──

const PATCH_ALLOW_LIST = ["id", "billingApprovalStatus", "status"] as const;
type PatchAllowKey = (typeof PATCH_ALLOW_LIST)[number];
const PATCH_ALLOW_SET = new Set<string>(PATCH_ALLOW_LIST);

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const rows = await prisma.$queryRawUnsafe<RequestRow[]>(
    `SELECT * FROM pending_change_requests ORDER BY "createdAt" ASC`
  );
  return NextResponse.json({ records: rows.map(rowToRecord) });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export interface PatchChangeRequestPayload {
  id: string;
  billingApprovalStatus?: "Pending" | "Approved" | "Rejected";
  status?: PendingChangeRequestStatus;
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
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

  // Reject keys that are not on the allow-list.
  const unknownKeys = Object.keys(rawBody).filter((k) => !PATCH_ALLOW_SET.has(k));
  if (unknownKeys.length > 0) {
    return NextResponse.json(
      { error: `Unknown field(s): ${unknownKeys.join(", ")}` },
      { status: 400 }
    );
  }

  if (typeof rawBody.id !== "string") {
    return NextResponse.json({ error: "Body must include id" }, { status: 400 });
  }

  const existing = await prisma.$queryRawUnsafe<RequestRow[]>(
    `SELECT * FROM pending_change_requests WHERE id = $1`,
    rawBody.id
  );
  if (existing.length === 0) {
    return NextResponse.json({ error: `Record not found: ${rawBody.id}` }, { status: 404 });
  }

  // Build SET clauses by iterating allow-list, never the raw body.
  const setClauses: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  for (const key of PATCH_ALLOW_LIST as readonly PatchAllowKey[]) {
    if (key === "id") continue;
    if (!(key in rawBody)) continue;
    setClauses.push(`"${key}" = $${paramIdx}`);
    params.push(rawBody[key]);
    paramIdx++;
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ record: rowToRecord(existing[0]) });
  }

  params.push(rawBody.id);
  const sql = `UPDATE pending_change_requests SET ${setClauses.join(", ")} WHERE id = $${paramIdx} RETURNING *`;
  const updated = await prisma.$queryRawUnsafe<RequestRow[]>(sql, ...params);
  return NextResponse.json({ record: rowToRecord(updated[0]) });
}

// ── POST ──────────────────────────────────────────────────────────────────────

// Allow-list for POST body fields (all fields of AddChangeRequestPayload).
const POST_ALLOW_LIST = [
  "client",
  "requestType",
  "description",
  "project",
  "requestedBy",
  "revenueImpact",
  "departmentsImpacted",
  "notes",
] as const;
const POST_ALLOW_SET = new Set<string>(POST_ALLOW_LIST);

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
    typeof rawBody.client !== "string" ||
    typeof rawBody.requestType !== "string" ||
    typeof rawBody.description !== "string" ||
    typeof rawBody.requestedBy !== "string"
  ) {
    return NextResponse.json(
      { error: "Body must include client, requestType, description, requestedBy" },
      { status: 400 }
    );
  }

  const now = new Date();
  const submittedDate = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const createdAt = now.toISOString();

  // Derive next id from the database — safe across multiple instances.
  const maxRow = await prisma.$queryRawUnsafe<{ maxn: string | null }[]>(
    `SELECT MAX(CAST(REPLACE(id, 'am-chg-', '') AS INTEGER)) AS maxn
     FROM pending_change_requests
     WHERE id ~ '^am-chg-[0-9]+$'`
  );
  const maxN = parseInt(maxRow[0]?.maxn ?? "0", 10);
  const id = `am-chg-${maxN + 1}`;

  const departmentsImpacted = Array.isArray(rawBody.departmentsImpacted)
    ? rawBody.departmentsImpacted
    : [];
  const revenueImpact =
    typeof rawBody.revenueImpact === "number" ? rawBody.revenueImpact : 0;
  const project =
    typeof rawBody.project === "string" ? rawBody.project : "";
  const notes =
    typeof rawBody.notes === "string" ? rawBody.notes : "";

  await prisma.$executeRawUnsafe(
    `INSERT INTO pending_change_requests
       (id, client, "requestType", description, project, "requestedBy",
        "revenueImpact", "departmentsImpacted", "submittedDate", status,
        "submittedByRole", "billingApprovalStatus", notes, "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12,$13,$14)`,
    id,
    rawBody.client as string,
    rawBody.requestType as string,
    rawBody.description as string,
    project,
    rawBody.requestedBy as string,
    revenueImpact,
    JSON.stringify(departmentsImpacted),
    submittedDate,
    "Submitted",
    "AM",
    "Pending",
    notes,
    createdAt
  );

  const record: PendingChangeRequest = {
    id,
    client:                rawBody.client as string,
    requestType:           rawBody.requestType as ChangeRequestType,
    description:           rawBody.description as string,
    project,
    requestedBy:           rawBody.requestedBy as string,
    revenueImpact,
    departmentsImpacted:   departmentsImpacted as string[],
    submittedDate,
    status:                "Submitted",
    submittedByRole:       "AM",
    billingApprovalStatus: "Pending",
    notes:                 notes || undefined,
  };

  return NextResponse.json({ record });
}
