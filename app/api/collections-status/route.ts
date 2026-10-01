// RTM OS — Collections Status API Route
//
// Persistence layer: Postgres via Prisma (CollectionState + CollectionLog models).
//
// Replaces the former file-backed data/collections-status.json store.
// data/collections-status.json remains on disk as a dead artifact; nothing reads it.
//
// AUTH TIER: requireRole(user, "Member")
//   Collections is Billing work. Cath (Billing Manager) and Rhea (Billing Member)
//   both need full access. Member is the minimum Billing tier; Manager and above
//   also pass. SystemAdmin and Executive pass because their ranks exceed Member.
//   A lower gate (requireActive only) would allow Sales and AM staff to modify
//   collections records, which is wrong. Member is the correct floor.
//
// ACTOR RULE: actor is always taken from the verified session, never from the
//   request body. A caller cannot claim to be someone else.
//
// API CONTRACT (unchanged from file-backed version):
//   GET  /api/collections-status  → { records: CollectionsStatusRecord[] }
//   POST /api/collections-status  → { clientId, action, note?, paymentPlanDetails?,
//                                     nextFollowUp? }
//                                 → { record: CollectionsStatusRecord }
//
// The GET response serialises CollectionLog rows into the contactLog array so
// the page receives the same shape it always expected.
//
// ESCALATION NOTE (C3):
//   Collections owns escalation. The overdue filter in /api/invoices now includes
//   "Escalated" so escalated invoices stay visible in the Collections queue.
//   The Invoices page escalate action has been removed (see invoices/page.tsx).
//   Setting collectionStatus to "Escalated" here is the single escalation path.
//
// SEND REMINDER NOTE (C4):
//   The action records that the collector sent a reminder outside the system.
//   No email is sent. The label and log wording reflect that.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/auth";

// ── Types (wire contract — unchanged shape) ───────────────────────────────────

export type CollectionsAction =
  | "send-reminder"
  | "log-contact"
  | "payment-plan"
  | "escalate"
  | "resolve";

export type CollectionStatus =
  | "Pending"
  | "Reminder Sent"
  | "Contacted"
  | "Payment Arrangement"
  | "Escalated"
  | "Resolved";

export interface ContactLogEntry {
  timestamp: string; // ISO-8601
  note: string;
  actorId?: string;  // present on new rows; absent on legacy (none exist after migration)
}

export interface CollectionsStatusRecord {
  clientId: string;             // wire name unchanged; holds the invoice id
  collectionStatus: CollectionStatus;
  notes: string;
  contactLog: ContactLogEntry[];
  paymentPlanDetails: string;
  lastContactDate: string;      // YYYY-MM-DD or ""
  nextFollowUp: string;         // YYYY-MM-DD or ""
  updatedAt: string;            // ISO-8601
}

// ── Serialise a state row + its log rows into the wire record ─────────────────

function toWireRecord(
  state: {
    invoiceId: string;
    collectionStatus: string;
    notes: string;
    paymentPlanDetails: string;
    lastContactDate: string;
    nextFollowUp: string;
    updatedAt: string;
  },
  logs: Array<{ timestamp: string; note: string; actorId: string }>
): CollectionsStatusRecord {
  return {
    clientId:          state.invoiceId,
    collectionStatus:  state.collectionStatus as CollectionStatus,
    notes:             state.notes,
    contactLog:        logs.map((l) => ({ timestamp: l.timestamp, note: l.note, actorId: l.actorId })),
    paymentPlanDetails: state.paymentPlanDetails,
    lastContactDate:   state.lastContactDate,
    nextFollowUp:      state.nextFollowUp,
    updatedAt:         state.updatedAt,
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────
//
// Returns all CollectionState rows with their log entries merged into contactLog.
// Auth: requireRole(user, "Member") — Billing Member and above.

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  const gate = requireRole(user!, "Member");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const states = await prisma.collectionState.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (states.length === 0) {
      return NextResponse.json({ records: [] });
    }

    const invoiceIds = states.map((s) => s.invoiceId);
    const logs = await prisma.collectionLog.findMany({
      where: { invoiceId: { in: invoiceIds } },
      orderBy: { timestamp: "asc" },
    });

    // Group logs by invoiceId
    const logsByInvoice = new Map<string, typeof logs>();
    for (const log of logs) {
      const arr = logsByInvoice.get(log.invoiceId) ?? [];
      arr.push(log);
      logsByInvoice.set(log.invoiceId, arr);
    }

    const records = states.map((s) =>
      toWireRecord(s, logsByInvoice.get(s.invoiceId) ?? [])
    );

    return NextResponse.json({ records });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
//
// Applies one action to the state row for the given invoiceId (clientId on the
// wire). Creates the row if it does not exist.
// Actor is taken from the session exclusively — never from the request body.

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth gate
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  const gate = requireRole(user!, "Member");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as {
    clientId?: unknown;
    action?: unknown;
    note?: unknown;
    paymentPlanDetails?: unknown;
    nextFollowUp?: unknown;
  };

  if (!payload || typeof payload.clientId !== "string") {
    return NextResponse.json(
      { error: "Body must include clientId (string)" },
      { status: 400 }
    );
  }

  const validActions: CollectionsAction[] = [
    "send-reminder",
    "log-contact",
    "payment-plan",
    "escalate",
    "resolve",
  ];

  if (
    typeof payload.action !== "string" ||
    !validActions.includes(payload.action as CollectionsAction)
  ) {
    return NextResponse.json(
      { error: `action must be one of: ${validActions.join(", ")}` },
      { status: 400 }
    );
  }

  const action     = payload.action as CollectionsAction;
  const invoiceId  = payload.clientId; // wire name is clientId; it holds the invoice id
  const actorId    = user!.id;         // ALWAYS from session — never from body
  const now        = new Date();
  const nowIso     = now.toISOString();
  const todayDate  = nowIso.slice(0, 10);

  try {
    // Fetch or initialise state
    const existing = await prisma.collectionState.findUnique({
      where: { invoiceId },
    });

    const isNew = existing === null;
    const base = existing ?? {
      invoiceId,
      collectionStatus: "Pending",
      notes:             "",
      paymentPlanDetails: "",
      lastContactDate:   "",
      nextFollowUp:      "",
      lastActorId:       null,
      createdAt:         nowIso,
      updatedAt:         nowIso,
    };

    // Fields to update
    const stateUpdate: {
      collectionStatus:   string;
      lastContactDate:    string;
      lastActorId:        string;
      updatedAt:          string;
      notes?:             string;
      paymentPlanDetails?: string;
      nextFollowUp?:      string;
    } = {
      collectionStatus: base.collectionStatus,
      lastContactDate:  todayDate,
      lastActorId:      actorId,
      updatedAt:        nowIso,
    };

    // New log entry (only for log-contact)
    let newLogEntry: { invoiceId: string; timestamp: string; note: string; actorId: string } | null = null;

    switch (action) {
      case "send-reminder":
        stateUpdate.collectionStatus = "Reminder Sent";
        // Default next follow-up to 7 days out only if currently blank
        if (!base.nextFollowUp) {
          const nf = new Date(now);
          nf.setDate(nf.getDate() + 7);
          stateUpdate.nextFollowUp = nf.toISOString().slice(0, 10);
        }
        break;

      case "log-contact": {
        stateUpdate.collectionStatus = "Contacted";
        const note =
          typeof payload.note === "string" && payload.note.trim()
            ? payload.note.trim()
            : "Contact logged.";
        newLogEntry = { invoiceId, timestamp: nowIso, note, actorId };
        if (typeof payload.nextFollowUp === "string" && payload.nextFollowUp) {
          stateUpdate.nextFollowUp = payload.nextFollowUp;
        }
        break;
      }

      case "payment-plan":
        stateUpdate.collectionStatus = "Payment Arrangement";
        if (
          typeof payload.paymentPlanDetails === "string" &&
          payload.paymentPlanDetails.trim()
        ) {
          stateUpdate.paymentPlanDetails = payload.paymentPlanDetails.trim();
        }
        if (typeof payload.nextFollowUp === "string" && payload.nextFollowUp) {
          stateUpdate.nextFollowUp = payload.nextFollowUp;
        }
        break;

      case "escalate":
        stateUpdate.collectionStatus = "Escalated";
        if (typeof payload.note === "string" && payload.note.trim()) {
          stateUpdate.notes = payload.note.trim();
        }
        break;

      case "resolve":
        stateUpdate.collectionStatus = "Resolved";
        if (typeof payload.note === "string" && payload.note.trim()) {
          stateUpdate.notes = payload.note.trim();
        }
        break;
    }

    // Write state row (upsert: create if new, update if existing)
    let savedState;
    if (isNew) {
      savedState = await prisma.collectionState.create({
        data: {
          invoiceId,
          collectionStatus:  stateUpdate.collectionStatus,
          notes:             stateUpdate.notes             ?? base.notes,
          paymentPlanDetails: stateUpdate.paymentPlanDetails ?? base.paymentPlanDetails,
          lastContactDate:   stateUpdate.lastContactDate,
          nextFollowUp:      stateUpdate.nextFollowUp      ?? base.nextFollowUp,
          lastActorId:       actorId,
          createdAt:         nowIso,
          updatedAt:         nowIso,
        },
      });
    } else {
      savedState = await prisma.collectionState.update({
        where: { invoiceId },
        data: {
          collectionStatus:  stateUpdate.collectionStatus,
          ...(stateUpdate.notes             !== undefined && { notes: stateUpdate.notes }),
          ...(stateUpdate.paymentPlanDetails !== undefined && { paymentPlanDetails: stateUpdate.paymentPlanDetails }),
          lastContactDate:   stateUpdate.lastContactDate,
          ...(stateUpdate.nextFollowUp !== undefined && { nextFollowUp: stateUpdate.nextFollowUp }),
          lastActorId:       actorId,
          updatedAt:         nowIso,
        },
      });
    }

    // Write log row for log-contact
    if (newLogEntry) {
      await prisma.collectionLog.create({ data: newLogEntry });
    }

    // Fetch all log rows for this invoice to build the full wire record
    const logs = await prisma.collectionLog.findMany({
      where: { invoiceId },
      orderBy: { timestamp: "asc" },
    });

    const record = toWireRecord(savedState, logs);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
