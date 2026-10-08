// RTM OS — Onboarding Records API Route
//
// Persistence layer: reads/writes data/onboarding-records.json (project root).
//
// ── Auth model ────────────────────────────────────────────────────────────────
//
//   STAFF VERBS (GET list, GET by id/clientId, POST, PATCH, DELETE):
//     Require a valid session.
//     Department gate: Account Management at Member level or above.
//     Executives and SystemAdmins pass regardless of department.
//
//   CLIENT PATH (GET ?id=<id>&token=<signed-token>):
//     No session required.
//     Token must be a valid, unexpired HMAC-SHA256 token issued by
//     POST /api/onboarding-client-token.
//     The token is scoped: verifies that token.payload.recordId === ?id.
//     Returns only that one record.
//
//   CLIENT PATCH (PATCH ?id=<id>&token=<signed-token>):
//     Same token rules as client GET.
//     Only fields where defaultAssignee === "client" may be written.
//     Any attempt to write AM-owned fields is silently stripped — the client
//     cannot overwrite salesPrefill, monthlyValue, status, or any AM field.
//
//   No session + no token → 401, body unchanged.
//
// ── Route summary ─────────────────────────────────────────────────────────────
//
//   GET  /api/onboarding-records                   → { records } — STAFF ONLY
//   GET  /api/onboarding-records?id=<id>           → { record }  — STAFF ONLY
//   GET  /api/onboarding-records?clientId=<cid>    → { record }  — STAFF ONLY
//   GET  /api/onboarding-records?id=<id>&token=<t> → { record }  — CLIENT TOKEN
//   POST /api/onboarding-records                   → { record }  — STAFF ONLY (upsert)
//   PATCH /api/onboarding-records?id=<id>          → { record }  — STAFF ONLY
//   PATCH /api/onboarding-records?id=<id>&token=<t>→ { record }  — CLIENT TOKEN (restricted fields)
//   DELETE /api/onboarding-records?id=<id>         → { ok }      — STAFF ONLY

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionUser, requireDepartment } from "@/lib/auth";
import { verifyToken } from "@/lib/onboarding-token";
import {
  ONBOARDING_FIELD_SCHEMA,
} from "@/lib/mock/am-onboarding-field-schema";

// ── Types (inline to avoid importing from a client-only store module) ─────────

export type OnboardingIntakeStatus =
  | "Draft"
  | "AM In Progress"
  | "Sent to Client"
  | "Client Responded"
  | "Ready for Kickoff"
  | "Complete";

export type FieldStatus =
  | "unset"
  | "am-filling"
  | "am-filled"
  | "pending-client"
  | "client-responded";

export interface FieldAssignment {
  fieldId: string;
  status: FieldStatus;
  value: string;
  assignedAt: string;
  sentToClientAt?: string;
  clientRespondedAt?: string;
}

export interface SalesPrefillData {
  clientName: string;
  email: string;
  industry: string;
  salesOwner: string;
  referralSource?: string;
  affiliateName?: string;
  activeServices: string[];
  monthlyValue: number;
  primaryContact?: string;
  phone?: string;
  website?: string;
  location?: string;
  businessSize?: string;
  intakeSource?: string;
  selectedGoals?: string[];
  discoveryNotes?: string;
}

export interface AMOnboardingRecord {
  id: string;
  clientId: string;
  status: OnboardingIntakeStatus;
  salesPrefill: SalesPrefillData;
  fieldAssignments: Record<string, FieldAssignment>;
  createdAt: string;
  updatedAt: string;
  projectId: string | null;
}

interface RecordFile {
  records: AMOnboardingRecord[];
}

// ── Client-writable field ids ──────────────────────────────────────────────────
//
// Derived from the canonical field schema at startup. Only fields where
// defaultAssignee === "client" may be patched via a client token. This list
// is read once from the shared schema so it stays in sync with any schema
// changes without modifying this route.
//
// AM-owned fields (defaultAssignee === "am") — including salesPrefill,
// status, statusOverride, monthlyValue, assignedAM, kickoffCallDate, etc. —
// are never in this set. A client PATCH may only update fieldAssignments
// entries for client-assignee fields, and only the "value" sub-field.

const CLIENT_WRITABLE_FIELD_IDS: ReadonlySet<string> = new Set(
  ONBOARDING_FIELD_SCHEMA
    .filter((f) => f.defaultAssignee === "client")
    .map((f) => f.id)
);

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "onboarding-records.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readRecords(): AMOnboardingRecord[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as RecordFile;
    if (!Array.isArray(parsed.records)) throw new Error("bad shape");
    return parsed.records;
  } catch {
    return [];
  }
}

function writeRecords(records: AMOnboardingRecord[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

// ── Auth helpers ───────────────────────────────────────────────────────────────

/** Returns an error response if the caller does not have a staff session
 *  with Account Management access. Returns null if access is granted. */
async function requireStaffAccess(
  req: NextRequest
): Promise<NextResponse | null> {
  const { user, error, status } = await getSessionUser(req);
  if (error) {
    return NextResponse.json({ error }, { status: status ?? 401 });
  }
  const gate = requireDepartment(user!, "Account Management", "Member");
  if (gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  return null;
}

/** Verifies a client token from the URL against the expected record id.
 *  Returns a response if denied, or null if the token is valid. */
function checkClientToken(
  token: string,
  expectedRecordId: string
): NextResponse | null {
  const result = verifyToken(token);

  if (!result.ok) {
    if (result.reason === "secret-missing") {
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }
    if (result.reason === "expired") {
      return NextResponse.json(
        {
          error:
            "Your access link has expired. Please contact your account manager for a new link.",
        },
        { status: 401 }
      );
    }
    // malformed or invalid — do not distinguish to callers
    return NextResponse.json(
      {
        error:
          "This link is not valid. Please contact your account manager for a new link.",
      },
      { status: 401 }
    );
  }

  // Scope check: token must be scoped to this exact record
  if (result.payload.recordId !== expectedRecordId) {
    return NextResponse.json(
      {
        error:
          "This link is not valid for the requested record. Please use the link your account manager sent you.",
      },
      { status: 403 }
    );
  }

  return null; // valid
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const clientId = searchParams.get("clientId");
  const token = searchParams.get("token");

  // ── Client token path: GET ?id=<id>&token=<t> ──────────────────────────────
  if (id && token) {
    const denied = checkClientToken(token, id);
    if (denied) return denied;

    const records = readRecords();
    const record = records.find((r) => r.id === id);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ record });
  }

  // ── Staff path: all other GET forms require a session ─────────────────────
  const denied = await requireStaffAccess(req);
  if (denied) return denied;

  const records = readRecords();

  if (id) {
    const record = records.find((r) => r.id === id);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ record });
  }

  if (clientId) {
    const record = records.find((r) => r.clientId === clientId);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ record });
  }

  return NextResponse.json({ records });
}

// ── POST (upsert by id) ────────────────────────────────────────────────────────
// Staff only — no client token path for POST (clients never create records).

export async function POST(req: NextRequest): Promise<NextResponse> {
  const denied = await requireStaffAccess(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as AMOnboardingRecord;
  if (!incoming || typeof incoming.id !== "string" || typeof incoming.clientId !== "string") {
    return NextResponse.json({ error: "Body must be an AMOnboardingRecord with id and clientId" }, { status: 400 });
  }

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === incoming.id);
  const now = new Date().toISOString();
  const record: AMOnboardingRecord = { ...incoming, updatedAt: now };

  if (idx !== -1) {
    records[idx] = record;
  } else {
    records.push(record);
  }

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH (partial update by id) ───────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  if (!id) {
    return NextResponse.json({ error: "?id= required for PATCH" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date().toISOString();

  // ── Client token path ─────────────────────────────────────────────────────
  if (token) {
    const denied = checkClientToken(token, id);
    if (denied) return denied;

    // Restrict what the client may write.
    //
    // A client PATCH may only update fieldAssignments entries, and only for
    // fields where defaultAssignee === "client". Top-level record fields
    // (status, salesPrefill, statusOverride, projectId, createdAt, etc.) are
    // never writable by a client token.
    //
    // Allowed structure:
    //   { fieldAssignments: { [clientFieldId]: Partial<FieldAssignment> } }
    //
    // Any key outside fieldAssignments, or any fieldAssignments key that maps
    // to an AM-owned field, is silently dropped — the client cannot write it.

    const incoming = body as Record<string, unknown>;
    const incomingAssignments = (
      typeof incoming.fieldAssignments === "object" &&
      incoming.fieldAssignments !== null
        ? incoming.fieldAssignments
        : {}
    ) as Record<string, unknown>;

    // Build restricted fieldAssignments: only client-writable field ids
    const restrictedAssignments: Record<string, FieldAssignment> = {
      ...records[idx].fieldAssignments,
    };
    let wrote = 0;
    for (const [fieldId, patch] of Object.entries(incomingAssignments)) {
      if (!CLIENT_WRITABLE_FIELD_IDS.has(fieldId)) {
        // Silently drop AM-owned field writes
        continue;
      }
      const existing = restrictedAssignments[fieldId] ?? {
        fieldId,
        status: "unset" as FieldStatus,
        value: "",
        assignedAt: now,
      };
      // Allow only value and status transitions that make sense for a client:
      // they may update value, and status may move to "client-responded".
      // They may not move status to am-filled, am-filling, etc.
      const patchObj = patch as Partial<FieldAssignment>;
      const allowedStatus: FieldStatus | undefined =
        patchObj.status === "client-responded" ||
        patchObj.status === "pending-client"
          ? patchObj.status
          : undefined;

      restrictedAssignments[fieldId] = {
        ...existing,
        value: typeof patchObj.value === "string" ? patchObj.value : existing.value,
        ...(allowedStatus ? { status: allowedStatus } : {}),
        ...(patchObj.clientRespondedAt
          ? { clientRespondedAt: patchObj.clientRespondedAt }
          : {}),
      };
      wrote++;
    }

    if (wrote === 0 && Object.keys(incomingAssignments).length > 0) {
      // All submitted fields were AM-owned — refuse rather than silently succeed
      return NextResponse.json(
        {
          error:
            "None of the submitted fields are assignable by the client. Only client-assigned fields may be updated via a client link.",
        },
        { status: 403 }
      );
    }

    const record: AMOnboardingRecord = {
      ...records[idx],
      fieldAssignments: restrictedAssignments,
      updatedAt: now,
    };
    records[idx] = record;

    try {
      writeRecords(records);
      return NextResponse.json({ record });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // ── Staff path ────────────────────────────────────────────────────────────
  const denied = await requireStaffAccess(req);
  if (denied) return denied;

  const patch = body as Partial<AMOnboardingRecord>;
  const record: AMOnboardingRecord = {
    ...records[idx],
    ...patch,
    id: records[idx].id,           // never overwrite id
    clientId: records[idx].clientId, // never overwrite clientId
    updatedAt: now,
  };

  records[idx] = record;

  try {
    writeRecords(records);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── DELETE (remove by id) ──────────────────────────────────────────────────────
// Staff only — no client token path for DELETE.

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const denied = await requireStaffAccess(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "?id= required for DELETE" }, { status: 400 });
  }

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  records.splice(idx, 1);

  try {
    writeRecords(records);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
