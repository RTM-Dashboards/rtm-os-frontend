// RTM OS — Pending Change Requests API Route
//
// Persistence layer: reads/writes data/pending-change-requests.json (project root).
//
// Mirrors the pending-cancellation-requests pattern exactly so that
// AM-submitted change requests are file-backed and cross-route-group reliable.
//
// GET  /api/pending-change-requests         → { records: PendingChangeRequest[] }
// POST /api/pending-change-requests         → body: AddChangeRequestPayload
//                                             → { record: PendingChangeRequest }
//                                             (server assigns id, submittedDate, status)

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

interface RecordFile {
  records: PendingChangeRequest[];
}

// ── File path ───────────────────────────────────────────────────────────────

const DATA_FILE = path.join(
  process.cwd(),
  "data",
  "pending-change-requests.json"
);

// ── File I/O ─────────────────────────────────────────────────────────────────

function readRecords(): PendingChangeRequest[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as RecordFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: PendingChangeRequest[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

// ── Id counter (in-memory within a single server process; file is source of truth) ──

let _nextId = 1;

function nextId(existing: PendingChangeRequest[]): string {
  const max = existing.reduce((n, r) => {
    const m = r.id.match(/^am-chg-(\d+)$/);
    return m ? Math.max(n, parseInt(m[1], 10)) : n;
  }, 0);
  _nextId = Math.max(_nextId, max + 1);
  return `am-chg-${_nextId++}`;
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const records = readRecords();
  return NextResponse.json({ records });
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as AddChangeRequestPayload;
  if (
    !payload ||
    typeof payload.client !== "string" ||
    typeof payload.requestType !== "string" ||
    typeof payload.description !== "string" ||
    typeof payload.requestedBy !== "string"
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

  const records = readRecords();
  const record: PendingChangeRequest = {
    ...payload,
    id: nextId(records),
    submittedDate,
    status: "Submitted",
    submittedByRole: "AM",
    billingApprovalStatus: "Pending",
  };

  records.push(record);

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
