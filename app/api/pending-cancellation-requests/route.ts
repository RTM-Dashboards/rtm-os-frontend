// RTM OS — Pending Cancellation Requests API Route
//
// Persistence layer: Postgres table `pending_cancellation_requests`.
// Migrated from data/pending-cancellation-requests.json (fs.writeFileSync)
// which was silently discarded on every Vercel deploy.
//
// External shape is unchanged:
//   GET  /api/pending-cancellation-requests → { records: PendingCancellationRequest[] }
//   POST /api/pending-cancellation-requests → body: AddCancellationRequestPayload
//                                             → { record: PendingCancellationRequest }
//                                             (server assigns id, billingStatus,
//                                              requestedBy, amOwnerNotified)
//
// Auth guard: getSessionUser — matches the original file-backed route.
//
// id: auto-incremented as 'am-cr-N' using MAX(id) to avoid collisions across
// multiple server instances (Postgres is authoritative, not in-memory counters).

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CancellationRequestReason =
  | "Not Performing"
  | "Moving In-house"
  | "Unpaid Invoice"
  | "Pricing/Financial Hardship"
  | "Communication Issue"
  | "Bankruptcy"
  | "Business Acquisition"
  | "Acquired By Private Equity"
  | "Changing Provider (New Company Name)"
  | "Closing Business"
  | "Pending Client Confirmation";

export type BillingCancellationStatus =
  | "Cancellation Requested"
  | "Billing Review"
  | "Final Invoice Needed"
  | "Pending Balance"
  | "Approved for Offboarding"
  | "Offboarding Triggered"
  | "Billing Hold"
  | "Billing Closed"
  | "Cancelled";

export interface PendingCancellationRequest {
  id: string;
  client: string;
  reason: CancellationRequestReason;
  notes: string;
  amOwner: string;
  requestedDate: string;
  requestedBy: "AM";
  billingStatus: BillingCancellationStatus;
  mrrImpact: string;
  billingOwner: string;
  amOwnerNotified: boolean;
}

export type AddCancellationRequestPayload = Omit<
  PendingCancellationRequest,
  "id" | "billingStatus" | "requestedBy" | "amOwnerNotified"
>;

// ── DB row type ───────────────────────────────────────────────────────────────

interface RequestRow {
  id: string;
  client: string;
  reason: string;
  notes: string;
  amOwner: string;
  requestedDate: string;
  requestedBy: string;
  billingStatus: string;
  mrrImpact: string;
  billingOwner: string;
  amOwnerNotified: boolean;
  createdAt: string;
}

function rowToRecord(row: RequestRow): PendingCancellationRequest {
  return {
    id:               row.id,
    client:           row.client,
    reason:           row.reason as CancellationRequestReason,
    notes:            row.notes,
    amOwner:          row.amOwner,
    requestedDate:    row.requestedDate,
    requestedBy:      "AM",
    billingStatus:    row.billingStatus as BillingCancellationStatus,
    mrrImpact:        row.mrrImpact,
    billingOwner:     row.billingOwner,
    amOwnerNotified:  row.amOwnerNotified,
  };
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const rows = await prisma.$queryRawUnsafe<RequestRow[]>(
    `SELECT * FROM pending_cancellation_requests ORDER BY "createdAt" ASC`
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

  const payload = body as AddCancellationRequestPayload;
  if (
    !payload ||
    typeof payload.client !== "string" ||
    typeof payload.reason !== "string" ||
    typeof payload.amOwner !== "string"
  ) {
    return NextResponse.json(
      { error: "Body must include client, reason, amOwner" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  // Derive next id from the database — safe across multiple instances.
  const maxRow = await prisma.$queryRawUnsafe<{ maxn: string | null }[]>(
    `SELECT MAX(CAST(REPLACE(id, 'am-cr-', '') AS INTEGER)) AS maxn
     FROM pending_cancellation_requests
     WHERE id ~ '^am-cr-[0-9]+$'`
  );
  const maxN = parseInt(maxRow[0]?.maxn ?? "0", 10);
  const id = `am-cr-${maxN + 1}`;

  const requestedDate = payload.requestedDate ?? now;

  await prisma.$executeRawUnsafe(
    `INSERT INTO pending_cancellation_requests
       (id, client, reason, notes, "amOwner", "requestedDate", "requestedBy",
        "billingStatus", "mrrImpact", "billingOwner", "amOwnerNotified", "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    id,
    payload.client,
    payload.reason,
    payload.notes ?? "",
    payload.amOwner,
    requestedDate,
    "AM",
    "Cancellation Requested",
    payload.mrrImpact ?? "",
    payload.billingOwner ?? "",
    false,
    now
  );

  const record: PendingCancellationRequest = {
    ...payload,
    id,
    requestedDate,
    requestedBy: "AM",
    billingStatus: "Cancellation Requested",
    amOwnerNotified: false,
  };

  return NextResponse.json({ record });
}
