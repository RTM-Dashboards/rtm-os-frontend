// RTM OS — Pending Offboarding Records API Route
//
// Persistence layer: reads/writes data/pending-offboarding-records.json (project root).
//
// This is the file-backed persistence layer for the cross-workspace
// Billing → AM offboarding signal, replacing the unreliable in-memory module
// singleton that caused cross-route-group desync between the Billing
// Cancellations page ((billing) route group) and the AM Offboarding page
// ((account-management) route group).
//
// GET  /api/pending-offboarding-records           → { records: OffboardingRecord[] }
// POST /api/pending-offboarding-records           → body: AddOffboardingPayload
//                                                   → { record: OffboardingRecord }
//                                                   (server runs construction logic, assigns id)

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types (inline — mirrors offboarding-data.ts; do not import from client module) ──

type OffboardingStatus =
  | "Initiated" | "Planning" | "In Progress" | "Waiting On Client"
  | "Final Billing" | "Asset Transfer" | "Access Removal"
  | "Completed" | "Archived";

type FinalBillingStatus =
  | "Not Started" | "Invoice Pending" | "Invoice Sent" | "Paid"
  | "Overdue" | "Waived" | "Write Off";

type AssetTransferStatus =
  | "Not Started" | "In Progress" | "Waiting On Client" | "Transferred" | "Not Applicable";

type AccessRemovalStatus =
  | "Active" | "Revoked" | "Pending Removal" | "Not Applicable";

type ChecklistItemStatus =
  | "Not Started" | "In Progress" | "Completed" | "Blocked" | "Not Applicable";

type DepartmentTaskStatus =
  | "Not Started" | "In Progress" | "Completed" | "Overdue" | "Blocked";

type CancellationReason =
  | "Not Performing" | "Moving In-house" | "Unpaid Invoice"
  | "Pricing/Financial Hardship" | "Communication Issue" | "Bankruptcy"
  | "Business Acquisition" | "Acquired By Private Equity"
  | "Changing Provider (New Company Name)" | "Closing Business"
  | "Pending Client Confirmation"
  | "Budget" | "Performance" | "Service Quality" | "Communication"
  | "Competitor" | "Business Closure" | "Internal Staffing"
  | "No Longer Needed" | "Other";

interface ChecklistItem {
  id: string;
  label: string;
  status: ChecklistItemStatus;
  owner: string;
  dueDate: string;
  notes?: string;
}

interface DepartmentTask {
  id: string;
  department: string;
  task: string;
  status: DepartmentTaskStatus;
  owner: string;
  dueDate: string;
  notes?: string;
}

interface AssetTransfer {
  id: string;
  assetType: string;
  currentOwner: string;
  recipient: string;
  status: AssetTransferStatus;
  completedDate: string | null;
  notes?: string;
}

interface AccessRemoval {
  id: string;
  tool: string;
  user: string;
  accessStatus: AccessRemovalStatus;
  removedDate: string | null;
  owner: string;
  notes?: string;
}

interface FinalBilling {
  outstandingBalance: number;
  credits: number;
  refunds: number;
  finalInvoiceAmount: number;
  finalInvoiceDate: string | null;
  collectionStatus: "Not Started" | "Pending" | "Collected" | "Overdue" | "Waived" | "Write Off";
  approvalStatus: "Pending Approval" | "Approved" | "Rejected";
  notes?: string;
}

interface KnowledgeArchive {
  finalNotes: string;
  lessonsLearned: string;
  clientHistory: string;
  projectSummary: string;
  retentionAttempts: string;
  reasonForDeparture: string;
}

interface AISummary {
  clientSummary: string;
  reasonForCancellation: string;
  revenueImpact: string;
  assetsTransferred: string;
  outstandingRisks: string;
  recommendedActions: string[];
}

interface ActivityEvent {
  date: string;
  event: string;
  actor: string;
  description: string;
  category:
    | "Cancellation Approved" | "Offboarding Created" | "Asset Transfer"
    | "Access Removal" | "Final Billing" | "Archive" | "Communication"
    | "Completed" | "Note";
}

export interface OffboardingRecord {
  id: string;
  client: string;
  accountManager: string;
  offboardingOwner: string;
  cancellationDate: string;
  targetCompletionDate: string;
  actualCompletionDate: string | null;
  offboardingStatus: OffboardingStatus;
  finalBillingStatus: FinalBillingStatus;
  assetTransferStatus: AssetTransferStatus;
  accessRemovalStatus: AccessRemovalStatus;
  completionPct: number;
  mrr: number;
  arr: number;
  reason: CancellationReason;
  departmentsInvolved: string[];
  services: string[];
  checklist: ChecklistItem[];
  departmentTasks: DepartmentTask[];
  assetTransfers: AssetTransfer[];
  accessRemovals: AccessRemoval[];
  finalBilling: FinalBilling;
  knowledgeArchive: KnowledgeArchive;
  aiSummary: AISummary;
  activityTimeline: ActivityEvent[];
}

// The small payload shape accepted by POST — mirrors addPendingOffboardingRecord's
// `partial` parameter in offboarding-data.ts.
export interface AddOffboardingPayload {
  client: string;
  accountManager: string;
  reason: CancellationReason;
  mrr?: number;
  arr?: number;
  offboardingOwner?: string;
  billingHandoffNotes?: string;
  billingOwner?: string;
}

interface RecordFile {
  records: OffboardingRecord[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(
  process.cwd(),
  "data",
  "pending-offboarding-records.json"
);

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): OffboardingRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as RecordFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: OffboardingRecord[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

// ── Id counter ────────────────────────────────────────────────────────────────

let _nextId = 1;

function nextId(existing: OffboardingRecord[]): string {
  const max = existing.reduce((n, r) => {
    const m = r.id.match(/^ob-billing-(\d+)$/);
    return m ? Math.max(n, parseInt(m[1], 10)) : n;
  }, 0);
  _nextId = Math.max(_nextId, max + 1);
  return `ob-billing-${_nextId++}`;
}

// ── Construction logic (mirrors addPendingOffboardingRecord in offboarding-data.ts) ──

function buildRecord(partial: AddOffboardingPayload, id: string): OffboardingRecord {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const targetDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return {
    id,
    client: partial.client,
    accountManager: partial.accountManager,
    offboardingOwner: partial.offboardingOwner ?? partial.accountManager,
    cancellationDate: dateStr,
    targetCompletionDate: targetDate,
    actualCompletionDate: null,
    offboardingStatus: "Initiated",
    finalBillingStatus: "Not Started",
    assetTransferStatus: "Not Started",
    accessRemovalStatus: "Active",
    completionPct: 0,
    mrr: partial.mrr ?? 0,
    arr: partial.arr ?? (partial.mrr ? partial.mrr * 12 : 0),
    reason: partial.reason,
    departmentsInvolved: ["Account Management", "Billing"],
    services: [],
    checklist: [
      { id: `c-new-1`, label: "Confirm Billing Clearance", status: "Completed", owner: partial.billingOwner ?? "Billing Team", dueDate: dateStr, notes: partial.billingHandoffNotes },
      { id: `c-new-2`, label: "AM Initial Review", status: "Not Started", owner: partial.accountManager, dueDate: targetDate },
      { id: `c-new-3`, label: "Export Reports", status: "Not Started", owner: partial.accountManager, dueDate: targetDate },
      { id: `c-new-4`, label: "Transfer Assets", status: "Not Started", owner: "Operations", dueDate: targetDate },
      { id: `c-new-5`, label: "Remove Internal Access", status: "Not Started", owner: "IT Team", dueDate: targetDate },
      { id: `c-new-6`, label: "Archive Records", status: "Not Started", owner: partial.accountManager, dueDate: targetDate },
    ],
    departmentTasks: [
      { id: `dt-new-1`, department: "Account Management", task: "Complete AM offboarding review", status: "Not Started", owner: partial.accountManager, dueDate: targetDate },
      { id: `dt-new-2`, department: "Billing", task: "Billing closed — no further action required", status: "Completed", owner: partial.billingOwner ?? "Billing Team", dueDate: dateStr },
    ],
    assetTransfers: [],
    accessRemovals: [],
    finalBilling: {
      outstandingBalance: 0,
      credits: 0,
      refunds: 0,
      finalInvoiceAmount: 0,
      finalInvoiceDate: dateStr,
      collectionStatus: "Collected",
      approvalStatus: "Approved",
      notes: partial.billingHandoffNotes ?? "Billing cleared by Billing team.",
    },
    knowledgeArchive: {
      finalNotes: "",
      lessonsLearned: "",
      clientHistory: "",
      projectSummary: "",
      retentionAttempts: "",
      reasonForDeparture: partial.reason,
    },
    aiSummary: {
      clientSummary: `${partial.client} — offboarding initiated by Billing clearance.`,
      reasonForCancellation: partial.reason,
      revenueImpact: partial.mrr ? `$${partial.mrr.toLocaleString()}/mo MRR.` : "MRR unknown.",
      assetsTransferred: "Pending.",
      outstandingRisks: "None at this time.",
      recommendedActions: ["Complete AM review", "Schedule asset transfer", "Remove internal access"],
    },
    activityTimeline: [
      {
        date: dateStr,
        event: "Offboarding Created — Billing Clearance",
        actor: partial.billingOwner ?? "Billing Team",
        description: `Billing cleared the cancellation for ${partial.client} and notified AM. Offboarding case created automatically.${
          partial.billingHandoffNotes ? ` Notes: ${partial.billingHandoffNotes}` : ""
        }`,
        category: "Offboarding Created",
      },
    ],
  };
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

  const payload = body as AddOffboardingPayload;
  if (
    !payload ||
    typeof payload.client !== "string" ||
    typeof payload.accountManager !== "string" ||
    typeof payload.reason !== "string"
  ) {
    return NextResponse.json(
      { error: "Body must include client, accountManager, reason" },
      { status: 400 }
    );
  }

  const records = readRecords();
  const id = nextId(records);
  const record = buildRecord(payload, id);
  records.push(record);

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
