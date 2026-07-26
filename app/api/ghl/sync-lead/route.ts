// RTM OS — GHL Lead Sync API Route
//
// POST /api/ghl/sync-lead
//
// Syncs a single RTM Lead to a GHL Contact.
// - Upserts the GHL Contact (creates if new, updates if email match found).
// - Writes back the real GHL Contact ID, sync status, and sync timestamp
//   into the leads-status overlay (data/leads-status.json) so the Leads
//   UI can reflect genuine live sync state.
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
//     // Optional — if lead already has a GHL contact ID, update instead of upsert
//     ghlContactId?: string
//   }
//
// Response (success):
//   {
//     ok:            true
//     ghlContactId:  string
//     created:       boolean  — true if a new GHL contact was created
//     contact:       GhlContact
//   }
//
// Response (error):
//   { ok: false; error: string; errorCode: string }
//
// CREDENTIALS:
//   Reads from process.env.GHL_PRIVATE_INTEGRATION_TOKEN + GHL_LOCATION_ID
//   Never exposed to the client.

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  upsertContact,
  updateContact,
  getContact,
  ghlCredentialsConfigured,
  GhlConfigError,
  GhlApiError,
} from "@/lib/ghl/client";

// ── Leads status file helpers (mirrors /api/leads-status/route.ts) ─────────

interface LeadGhlOverlay {
  leadId: string;
  ghlContactId?: string;
  ghlSyncStatus?: string;
  ghlSyncError?: string;
  ghlLastSyncedAt?: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface LeadsStatusFile {
  records: LeadGhlOverlay[];
}

const LEADS_STATUS_FILE = path.join(process.cwd(), "data", "leads-status.json");

function readLeadsStatus(): LeadGhlOverlay[] {
  try {
    const raw = fs.readFileSync(LEADS_STATUS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as LeadsStatusFile;
    return Array.isArray(parsed.records) ? parsed.records : [];
  } catch {
    return [];
  }
}

function writeLeadsStatus(records: LeadGhlOverlay[]): void {
  const dir = path.dirname(LEADS_STATUS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LEADS_STATUS_FILE, JSON.stringify({ records }, null, 2), "utf-8");
}

function upsertLeadGhlStatus(leadId: string, patch: Partial<LeadGhlOverlay>): void {
  const records = readLeadsStatus();
  const idx = records.findIndex((r) => r.leadId === leadId);
  const existing: LeadGhlOverlay = idx >= 0 ? records[idx] : { leadId, updatedAt: "" };

  const updated: LeadGhlOverlay = {
    ...existing,
    ...patch,
    leadId,
    updatedAt: new Date().toISOString(),
  };

  if (idx >= 0) {
    records[idx] = updated;
  } else {
    records.push(updated);
  }

  writeLeadsStatus(records);
}

// ── Input validation ─────────────────────────────────────────────────────────

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

// ── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Build-time safety: if credentials aren't configured, return clear error
  // (never fabricates a success result)
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

  // Build tags from industry/source
  const tags: string[] = [];
  if (input.industry) tags.push(input.industry);
  if (input.leadSource) tags.push(input.leadSource);

  try {
    let ghlContactId: string;
    let created: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let contact: any;

    if (input.ghlContactId && !input.ghlContactId.startsWith("GHL-CON-") && input.ghlContactId !== "—") {
      // Already has a real GHL Contact ID — update the existing contact
      contact = await updateContact(input.ghlContactId, {
        firstName,
        lastName,
        email: input.email,
        phone: input.phone,
        companyName: input.businessName,
        source: input.leadSource,
        tags: tags.length > 0 ? tags : undefined,
      });
      ghlContactId = input.ghlContactId;
      created = false;
    } else {
      // Upsert: search by email first, create if not found
      const result = await upsertContact({
        locationId,
        firstName,
        lastName,
        email: input.email,
        phone: input.phone,
        companyName: input.businessName,
        source: input.leadSource,
        tags: tags.length > 0 ? tags : undefined,
      });
      contact = result.contact;
      ghlContactId = result.contact.id;
      created = result.created;
    }

    // Persist the real GHL Contact ID and sync state to leads-status overlay
    upsertLeadGhlStatus(input.leadId, {
      ghlContactId,
      ghlSyncStatus: "Synced",
      ghlSyncError: "",
      ghlLastSyncedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      ghlContactId,
      created,
      contact,
    });
  } catch (err) {
    const isConfig = err instanceof GhlConfigError;
    const isApi = err instanceof GhlApiError;

    const message = err instanceof Error ? err.message : "Unknown error";
    const errorCode = isConfig ? "GHL_NOT_CONFIGURED" : isApi ? "GHL_API_ERROR" : "UNKNOWN";

    // Write the failure state back so the UI can show a real error
    upsertLeadGhlStatus(input.leadId, {
      ghlSyncStatus: "Sync Failed",
      ghlSyncError: message,
      ghlLastSyncedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { ok: false, error: message, errorCode },
      { status: isApi ? (err as GhlApiError).status >= 500 ? 502 : 400 : 503 }
    );
  }
}
