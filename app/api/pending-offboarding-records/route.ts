// RTM OS — Pending Offboarding Records API Route
//
// Persistence layer: Postgres table `pending_offboarding_records`.
// Migrated from data/pending-offboarding-records.json (fs.writeFileSync)
// which was silently discarded on every Vercel deploy.
//
// External shape is unchanged:
//   GET  /api/pending-offboarding-records → { records: OffboardingRecord[] }
//   POST /api/pending-offboarding-records → body: AddOffboardingPayload
//                                           → { record: OffboardingRecord }
//                                           (server runs construction logic, assigns id)
//
// Auth guard: getSessionUser — matches the original file-backed route.
//
// id: auto-incremented as 'ob-billing-N' using MAX(id) to avoid collisions
// across multiple server instances (Postgres is authoritative).

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

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

// ── DB row type ───────────────────────────────────────────────────────────────

interface OffboardingRow {
  id: string;
  client: string;
  accountManager: string;
  offboardingOwner: string;
  cancellationDate: string;
  targetCompletionDate: string;
  actualCompletionDate: string | null;
  offboardingStatus: string;
  finalBillingStatus: string;
  assetTransferStatus: string;
  accessRemovalStatus: string;
  completionPct: unknown; // Prisma returns NUMERIC as Decimal object
  mrr: unknown;
  arr: unknown;
  reason: string;
  departmentsInvolved: unknown;
  services: unknown;
  checklist: unknown;
  departmentTasks: unknown;
  assetTransfers: unknown;
  accessRemovals: unknown;
  finalBilling: unknown;
  knowledgeArchive: unknown;
  aiSummary: unknown;
  activityTimeline: unknown;
  createdAt: string;
}

function rowToRecord(row: OffboardingRow): OffboardingRecord {
  // Prisma returns NUMERIC columns as Decimal objects; Number() coerces all variants.
  function parseNum(v: unknown): number {
    return Number(v) || 0;
  }
  function parseJson<T>(v: unknown): T {
    if (typeof v === "string") return JSON.parse(v) as T;
    return v as T;
  }
  return {
    id:                    row.id,
    client:                row.client,
    accountManager:        row.accountManager,
    offboardingOwner:      row.offboardingOwner,
    cancellationDate:      row.cancellationDate,
    targetCompletionDate:  row.targetCompletionDate,
    actualCompletionDate:  row.actualCompletionDate,
    offboardingStatus:     row.offboardingStatus as OffboardingStatus,
    finalBillingStatus:    row.finalBillingStatus as FinalBillingStatus,
    assetTransferStatus:   row.assetTransferStatus as AssetTransferStatus,
    accessRemovalStatus:   row.accessRemovalStatus as AccessRemovalStatus,
    completionPct:         parseNum(row.completionPct),
    mrr:                   parseNum(row.mrr),
    arr:                   parseNum(row.arr),
    reason:                row.reason as CancellationReason,
    departmentsInvolved:   parseJson<string[]>(row.departmentsInvolved),
    services:              parseJson<string[]>(row.services),
    checklist:             parseJson<ChecklistItem[]>(row.checklist),
    departmentTasks:       parseJson<DepartmentTask[]>(row.departmentTasks),
    assetTransfers:        parseJson<AssetTransfer[]>(row.assetTransfers),
    accessRemovals:        parseJson<AccessRemoval[]>(row.accessRemovals),
    finalBilling:          parseJson<FinalBilling>(row.finalBilling),
    knowledgeArchive:      parseJson<KnowledgeArchive>(row.knowledgeArchive),
    aiSummary:             parseJson<AISummary>(row.aiSummary),
    activityTimeline:      parseJson<ActivityEvent[]>(row.activityTimeline),
  };
}

// ── Allow-list for POST body fields (all fields of AddOffboardingPayload) ────

const POST_ALLOW_LIST = [
  "client",
  "accountManager",
  "reason",
  "mrr",
  "arr",
  "offboardingOwner",
  "billingHandoffNotes",
  "billingOwner",
] as const;
const POST_ALLOW_SET = new Set<string>(POST_ALLOW_LIST);

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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const rows = await prisma.$queryRawUnsafe<OffboardingRow[]>(
    `SELECT * FROM pending_offboarding_records ORDER BY "createdAt" ASC`
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
    typeof rawBody.client !== "string" ||
    typeof rawBody.accountManager !== "string" ||
    typeof rawBody.reason !== "string"
  ) {
    return NextResponse.json(
      { error: "Body must include client, accountManager, reason" },
      { status: 400 }
    );
  }

  // Derive next id from the database — safe across multiple instances.
  const maxRow = await prisma.$queryRawUnsafe<{ maxn: string | null }[]>(
    `SELECT MAX(CAST(REPLACE(id, 'ob-billing-', '') AS INTEGER)) AS maxn
     FROM pending_offboarding_records
     WHERE id ~ '^ob-billing-[0-9]+$'`
  );
  const maxN = parseInt(maxRow[0]?.maxn ?? "0", 10);
  const id = `ob-billing-${maxN + 1}`;

  const payload: AddOffboardingPayload = {
    client:              rawBody.client as string,
    accountManager:      rawBody.accountManager as string,
    reason:              rawBody.reason as CancellationReason,
    mrr:                 typeof rawBody.mrr === "number" ? rawBody.mrr : undefined,
    arr:                 typeof rawBody.arr === "number" ? rawBody.arr : undefined,
    offboardingOwner:    typeof rawBody.offboardingOwner === "string" ? rawBody.offboardingOwner : undefined,
    billingHandoffNotes: typeof rawBody.billingHandoffNotes === "string" ? rawBody.billingHandoffNotes : undefined,
    billingOwner:        typeof rawBody.billingOwner === "string" ? rawBody.billingOwner : undefined,
  };

  const record = buildRecord(payload, id);
  const createdAt = new Date().toISOString();

  await prisma.$executeRawUnsafe(
    `INSERT INTO pending_offboarding_records
       (id, client, "accountManager", "offboardingOwner", "cancellationDate",
        "targetCompletionDate", "actualCompletionDate", "offboardingStatus",
        "finalBillingStatus", "assetTransferStatus", "accessRemovalStatus",
        "completionPct", mrr, arr, reason, "departmentsInvolved", services,
        checklist, "departmentTasks", "assetTransfers", "accessRemovals",
        "finalBilling", "knowledgeArchive", "aiSummary", "activityTimeline", "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
             $16::jsonb,$17::jsonb,$18::jsonb,$19::jsonb,$20::jsonb,$21::jsonb,
             $22::jsonb,$23::jsonb,$24::jsonb,$25::jsonb,$26)`,
    record.id,
    record.client,
    record.accountManager,
    record.offboardingOwner,
    record.cancellationDate,
    record.targetCompletionDate,
    record.actualCompletionDate,
    record.offboardingStatus,
    record.finalBillingStatus,
    record.assetTransferStatus,
    record.accessRemovalStatus,
    record.completionPct,
    record.mrr,
    record.arr,
    record.reason,
    JSON.stringify(record.departmentsInvolved),
    JSON.stringify(record.services),
    JSON.stringify(record.checklist),
    JSON.stringify(record.departmentTasks),
    JSON.stringify(record.assetTransfers),
    JSON.stringify(record.accessRemovals),
    JSON.stringify(record.finalBilling),
    JSON.stringify(record.knowledgeArchive),
    JSON.stringify(record.aiSummary),
    JSON.stringify(record.activityTimeline),
    createdAt
  );

  return NextResponse.json({ record });
}
