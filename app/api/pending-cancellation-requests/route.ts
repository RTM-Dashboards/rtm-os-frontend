// RTM OS — Pending Cancellation Requests API Route
//
// Persistence layer: reads/writes data/pending-cancellation-requests.json (project root).
//
// This is the file-backed persistence layer for the cross-workspace
// AM → Billing cancellation signal, replacing the unreliable in-memory module
// singleton that caused cross-route-group desync between the AM Cancellations
// page ((account-management) route group) and the Billing Cancellations page
// ((billing) route group).
//
// GET  /api/pending-cancellation-requests         → { records: PendingCancellationRequest[] }
// POST /api/pending-cancellation-requests         → body: AddCancellationRequestPayload
//                                                   → { record: PendingCancellationRequest }
//                                                   (server assigns id, billingStatus, requestedBy, amOwnerNotified)

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types (inline — do not import from client-side module) ────────────────────

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

// Payload accepted on POST — server fills in the server-managed fields.
export type AddCancellationRequestPayload = Omit<
  PendingCancellationRequest,
  "id" | "billingStatus" | "requestedBy" | "amOwnerNotified"
>;

interface RecordFile {
  records: PendingCancellationRequest[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(
  process.cwd(),
  "data",
  "pending-cancellation-requests.json"
);

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): PendingCancellationRequest[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as RecordFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: PendingCancellationRequest[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

// ── Id counter (in-memory within a single server process; file is source of truth) ──

let _nextId = 1;

function nextId(existing: PendingCancellationRequest[]): string {
  // Derive a safe counter from existing ids to avoid collisions after restart.
  const max = existing.reduce((n, r) => {
    const m = r.id.match(/^am-cr-(\d+)$/);
    return m ? Math.max(n, parseInt(m[1], 10)) : n;
  }, 0);
  _nextId = Math.max(_nextId, max + 1);
  return `am-cr-${_nextId++}`;
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const records = readRecords();
  return NextResponse.json({ records });
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
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

  const records = readRecords();
  const record: PendingCancellationRequest = {
    ...payload,
    id: nextId(records),
    requestedBy: "AM",
    billingStatus: "Cancellation Requested",
    amOwnerNotified: false,
  };

  records.push(record);

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
