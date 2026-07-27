// RTM OS — GHL Lead Sync API Route
//
// POST /api/ghl/sync-lead
//
// Persistence layer: previously data/leads-status.json (fs.readFileSync/writeFileSync).
// Now backed by PostgreSQL via Prisma (Supabase in production).
//
// The external API contract is UNCHANGED — same request/response shapes.
// No frontend code needs to change.
//
// Syncs a single RTM Lead to a GHL Contact.
// - Upserts the GHL Contact (creates if new, updates if email match found).
// - Writes back the real GHL Contact ID, sync status, and sync timestamp
//   into the lead_statuses table so the Leads UI reflects genuine live sync state.
//
// Body:
//   {
//     leadId:       string    — RTM lead ID (e.g. "L001")
//     name:         string    — full name of contact
//     email:        string
//     phone:        string
//     businessName: string
//     leadSource:   string
//     industry:     string
//     assignedRep:  string
//     ghlContactId?: string
//   }
//
// CREDENTIALS:
//   Reads from process.env.GHL_PRIVATE_INTEGRATION_TOKEN + GHL_LOCATION_ID

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  upsertContact,
  updateContact,
  ghlCredentialsConfigured,
  GhlConfigError,
  GhlApiError,
} from "@/lib/ghl/client";

// ── DB helper: upsert lead GHL status ─────────────────────────────────────────

async function upsertLeadGhlStatus(
  leadId: string,
  patch: {
    ghlContactId?: string;
    ghlSyncStatus?: string;
    ghlSyncError?: string;
    ghlLastSyncedAt?: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  await prisma.leadStatus.upsert({
    where: { leadId },
    update: {
      ...patch,
      updatedAt: now,
    },
    create: {
      leadId,
      ...patch,
      updatedAt: now,
    },
  });
}

// ── Input validation ──────────────────────────────────────────────────────────

interface SyncLeadInput {
  leadId: string;
  name: string;
  email?: string;
  phone?: string;
  businessName?: string;
  leadSource?: string;
  industry?: string;
  assignedRep?: string;
  ghlContactId?: string;
}

function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = (fullName ?? "").trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!ghlCredentialsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "GHL credentials not configured. Set GHL_PRIVATE_INTEGRATION_TOKEN and GHL_LOCATION_ID in environment variables.",
        errorCode: "GHL_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON", errorCode: "INVALID_JSON" }, { status: 400 });
  }

  const input = body as Partial<SyncLeadInput>;
  if (!input?.leadId) {
    return NextResponse.json(
      { ok: false, error: "leadId is required", errorCode: "MISSING_LEAD_ID" },
      { status: 400 }
    );
  }
  if (!input.name) {
    return NextResponse.json(
      { ok: false, error: "name is required", errorCode: "MISSING_NAME" },
      { status: 400 }
    );
  }

  const { firstName, lastName } = parseName(input.name);
  const locationId = process.env.GHL_LOCATION_ID!;

  const tags: string[] = [];
  if (input.industry)   tags.push(input.industry);
  if (input.leadSource) tags.push(input.leadSource);

  try {
    let ghlContactId: string;
    let created: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let contact: any;

    if (
      input.ghlContactId &&
      !input.ghlContactId.startsWith("GHL-CON-") &&
      input.ghlContactId !== "—"
    ) {
      // Already has a real GHL Contact ID — update the existing contact
      contact = await updateContact(input.ghlContactId, {
        firstName,
        lastName,
        email:       input.email,
        phone:       input.phone,
        companyName: input.businessName,
        source:      input.leadSource,
        tags:        tags.length > 0 ? tags : undefined,
      });
      ghlContactId = input.ghlContactId;
      created = false;
    } else {
      // Upsert: search by email first, create if not found
      const result = await upsertContact({
        locationId,
        firstName,
        lastName,
        email:       input.email,
        phone:       input.phone,
        companyName: input.businessName,
        source:      input.leadSource,
        tags:        tags.length > 0 ? tags : undefined,
      });
      contact      = result.contact;
      ghlContactId = result.contact.id;
      created      = result.created;
    }

    // Persist the real GHL Contact ID and sync state to lead_statuses table
    await upsertLeadGhlStatus(input.leadId, {
      ghlContactId,
      ghlSyncStatus:   "Synced",
      ghlSyncError:    "",
      ghlLastSyncedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, ghlContactId, created, contact });
  } catch (err) {
    const isConfig = err instanceof GhlConfigError;
    const isApi    = err instanceof GhlApiError;
    const message  = err instanceof Error ? err.message : "Unknown error";
    const errorCode = isConfig ? "GHL_NOT_CONFIGURED" : isApi ? "GHL_API_ERROR" : "UNKNOWN";

    // Write the failure state back so the UI can show a real error
    await upsertLeadGhlStatus(input.leadId!, {
      ghlSyncStatus:   "Sync Failed",
      ghlSyncError:    message,
      ghlLastSyncedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { ok: false, error: message, errorCode },
      { status: isApi ? (err as GhlApiError).status >= 500 ? 502 : 400 : 503 }
    );
  }
}
