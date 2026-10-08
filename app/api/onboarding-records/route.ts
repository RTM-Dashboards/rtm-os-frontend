// RTM OS — Onboarding Records API Route
//
// Persistence layer: Postgres via Prisma (onboarding_records table).
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
import { prisma } from "@/lib/db/prisma";
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
  statusOverride: OnboardingIntakeStatus | null;
  salesPrefill: SalesPrefillData;
  fieldAssignments: Record<string, FieldAssignment>;
  createdAt: string;
  updatedAt: string;
  projectId: string | null;
}

// ── Client-writable field ids ──────────────────────────────────────────────────
//
// Derived from the canonical field schema at startup. Only fields where
// defaultAssignee === "client" may be patched via a client token. This list
// is read once from the shared schema so it stays in sync with any schema
// changes without modifying this route.

const CLIENT_WRITABLE_FIELD_IDS: ReadonlySet<string> = new Set(
  ONBOARDING_FIELD_SCHEMA
    .filter((f) => f.defaultAssignee === "client")
    .map((f) => f.id)
);

// ── DB row → AMOnboardingRecord ───────────────────────────────────────────────

function rowToRecord(row: {
  id: string;
  clientId: string;
  projectId: string | null;
  status: string;
  statusOverride: string | null;
  salesPrefill: unknown;
  fieldAssignments: unknown;
  createdAt: string;
  updatedAt: string;
}): AMOnboardingRecord {
  return {
    id:               row.id,
    clientId:         row.clientId,
    projectId:        row.projectId,
    status:           row.status as OnboardingIntakeStatus,
    statusOverride:   (row.statusOverride as OnboardingIntakeStatus | null) ?? null,
    salesPrefill:     (row.salesPrefill   as SalesPrefillData) ?? {},
    fieldAssignments: (row.fieldAssignments as Record<string, FieldAssignment>) ?? {},
    createdAt:        row.createdAt,
    updatedAt:        row.updatedAt,
  };
}

// ── Auth helpers ───────────────────────────────────────────────────────────────

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
    return NextResponse.json(
      {
        error:
          "This link is not valid. Please contact your account manager for a new link.",
      },
      { status: 401 }
    );
  }

  if (result.payload.recordId !== expectedRecordId) {
    return NextResponse.json(
      {
        error:
          "This link is not valid for the requested record. Please use the link your account manager sent you.",
      },
      { status: 403 }
    );
  }

  return null;
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id       = searchParams.get("id");
  const clientId = searchParams.get("clientId");
  const token    = searchParams.get("token");

  // ── Client token path: GET ?id=<id>&token=<t> ──────────────────────────────
  if (id && token) {
    const denied = checkClientToken(token, id);
    if (denied) return denied;

    const row = await prisma.onboardingRecord.findUnique({ where: { id } });
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ record: rowToRecord(row) });
  }

  // ── Staff path ─────────────────────────────────────────────────────────────
  const denied = await requireStaffAccess(req);
  if (denied) return denied;

  if (id) {
    const row = await prisma.onboardingRecord.findUnique({ where: { id } });
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ record: rowToRecord(row) });
  }

  if (clientId) {
    const row = await prisma.onboardingRecord.findFirst({ where: { clientId } });
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ record: rowToRecord(row) });
  }

  const rows = await prisma.onboardingRecord.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ records: rows.map(rowToRecord) });
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
    return NextResponse.json(
      { error: "Body must be an AMOnboardingRecord with id and clientId" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const row = await prisma.onboardingRecord.upsert({
    where: { id: incoming.id },
    create: {
      id:               incoming.id,
      projectId:        incoming.projectId ?? null,
      businessId:       "",   // not known from the store API; blank is safe
      clientId:         incoming.clientId,
      status:           incoming.status ?? "AM In Progress",
      statusOverride:   incoming.statusOverride ?? null,
      salesPrefill:     (incoming.salesPrefill ?? {}) as object,
      fieldAssignments: (incoming.fieldAssignments ?? {}) as object,
      createdAt:        incoming.createdAt ?? now,
      updatedAt:        now,
    },
    update: {
      projectId:        incoming.projectId ?? null,
      status:           incoming.status,
      statusOverride:   incoming.statusOverride ?? null,
      salesPrefill:     (incoming.salesPrefill ?? {}) as object,
      fieldAssignments: (incoming.fieldAssignments ?? {}) as object,
      updatedAt:        now,
    },
  });

  return NextResponse.json({ record: rowToRecord(row) });
}

// ── PATCH (partial update by id) ───────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id    = searchParams.get("id");
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

  const existingRow = await prisma.onboardingRecord.findUnique({ where: { id } });
  if (!existingRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const existing = rowToRecord(existingRow);

  // ── Client token path ─────────────────────────────────────────────────────
  if (token) {
    const denied = checkClientToken(token, id);
    if (denied) return denied;

    // Restrict what the client may write.
    // Only fieldAssignments entries for client-assignee fields may be updated.
    // Top-level record fields are never writable by a client token.

    const incoming = body as Record<string, unknown>;
    const incomingAssignments = (
      typeof incoming.fieldAssignments === "object" &&
      incoming.fieldAssignments !== null
        ? incoming.fieldAssignments
        : {}
    ) as Record<string, unknown>;

    const restrictedAssignments: Record<string, FieldAssignment> = {
      ...existing.fieldAssignments,
    };
    let wrote = 0;
    for (const [fieldId, patch] of Object.entries(incomingAssignments)) {
      if (!CLIENT_WRITABLE_FIELD_IDS.has(fieldId)) {
        continue; // silently drop AM-owned field writes
      }
      const ex = restrictedAssignments[fieldId] ?? {
        fieldId,
        status: "unset" as FieldStatus,
        value:  "",
        assignedAt: now,
      };
      const patchObj = patch as Partial<FieldAssignment>;
      const allowedStatus: FieldStatus | undefined =
        patchObj.status === "client-responded" ||
        patchObj.status === "pending-client"
          ? patchObj.status
          : undefined;

      restrictedAssignments[fieldId] = {
        ...ex,
        value:  typeof patchObj.value === "string" ? patchObj.value : ex.value,
        ...(allowedStatus ? { status: allowedStatus } : {}),
        ...(patchObj.clientRespondedAt
          ? { clientRespondedAt: patchObj.clientRespondedAt }
          : {}),
      };
      wrote++;
    }

    if (wrote === 0 && Object.keys(incomingAssignments).length > 0) {
      return NextResponse.json(
        {
          error:
            "None of the submitted fields are assignable by the client. Only client-assigned fields may be updated via a client link.",
        },
        { status: 403 }
      );
    }

    const updatedRow = await prisma.onboardingRecord.update({
      where: { id },
      data: {
        fieldAssignments: restrictedAssignments as object,
        updatedAt:        now,
      },
    });

    return NextResponse.json({ record: rowToRecord(updatedRow) });
  }

  // ── Staff path ────────────────────────────────────────────────────────────
  const denied = await requireStaffAccess(req);
  if (denied) return denied;

  const patch = body as Partial<AMOnboardingRecord>;

  const updatedRow = await prisma.onboardingRecord.update({
    where: { id },
    data: {
      // Never allow id or clientId to be overwritten via PATCH.
      ...(patch.projectId        !== undefined ? { projectId:        patch.projectId }                       : {}),
      ...(patch.status           !== undefined ? { status:           patch.status }                          : {}),
      ...(patch.statusOverride   !== undefined ? { statusOverride:   patch.statusOverride ?? null }          : {}),
      ...(patch.salesPrefill     !== undefined ? { salesPrefill:     patch.salesPrefill as object }          : {}),
      ...(patch.fieldAssignments !== undefined ? { fieldAssignments: patch.fieldAssignments as object }      : {}),
      updatedAt: now,
    },
  });

  return NextResponse.json({ record: rowToRecord(updatedRow) });
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

  const existing = await prisma.onboardingRecord.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.onboardingRecord.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
