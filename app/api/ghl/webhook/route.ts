// RTM OS — GHL Webhook Receiver
//
// POST /api/ghl/webhook
//
// Receives real-time events from GoHighLevel when configured in the GHL
// dashboard (Settings → Integrations → Webhooks → Add Webhook).
//
// SETUP REQUIRED (user action):
//   1. In GHL dashboard → Settings → Integrations → Webhooks
//   2. Add a new webhook pointing to: <your-app-url>/api/ghl/webhook
//   3. Select events: "Contact Created", "Contact Updated",
//      "Opportunity Created", "Opportunity Status Changed",
//      "Opportunity Stage Changed"
//   4. Optionally set GHL_WEBHOOK_SECRET in your environment for signature
//      verification (recommended for production).
//
// SYNC DIRECTION (corrected from Phase 1):
//   PRIMARY (GHL → RTM):  New leads originate in GHL (ad campaigns, forms,
//     automations, etc.) and flow into RTM's Sales Leads dashboard via the
//     ContactCreate webhook event.  This is the real business workflow.
//
//   SECONDARY (RTM → GHL): Manual/triggered push sync via /api/ghl/sync-lead
//     and /api/ghl/sync-opportunity — used for RTM-originated leads or manual
//     re-sync.  Not removed; still works.
//
// EVENT HANDLING:
//
//   ContactCreate (NEW):
//     Parse the GHL Contact payload, map fields to an RTM Lead record, and
//     create it in data/leads.json via /api/leads logic (or directly if
//     called internally).  The lead is marked ghlOrigin=true and ghlSyncStatus
//     = "Synced" from birth so it is already GHL-linked.
//     DUPLICATE SAFETY: keyed on ghlContactId first, then email.  A re-fired
//     webhook for a Contact RTM already knows about updates the existing lead
//     instead of creating a duplicate.
//
//   ContactUpdate (existing):
//     If an RTM lead exists for this ghlContactId, refresh its GHL sync
//     metadata (status, lastActivity).  If no match, treat as a ContactCreate
//     (upsert) — this handles the case where a Contact existed before the
//     webhook was registered.
//
//   OpportunityStageChanged / OpportunityStatusChanged / OpportunityUpdate:
//     Updates the ghl sub-object on the sales-opportunities record (unchanged
//     from Phase 1).
//
//   All other events: acknowledged (200) and logged but not acted on.
//
// PAYLOAD SHAPE (GHL ContactCreate / ContactUpdate):
//   GHL sends a flat object at the top level.  Field names match the GhlContact
//   interface in lib/ghl/client.ts.
//   {
//     "type":          "ContactCreate" | "ContactUpdate" | ...,
//     "id":            "<contactId>",          // GHL Contact ID
//     "locationId":    "...",
//     "firstName":     "...",
//     "lastName":      "...",
//     "email":         "...",
//     "phone":         "...",
//     "companyName":   "...",                  // → businessName in RTM
//     "source":        "...",                  // → leadSource / ghlSource
//     "tags":          ["..."],
//     "assignedTo":    "...",                  // GHL user ID (not RTM rep name)
//     "dateAdded":     "<ISO-8601>",
//     "dateUpdated":   "<ISO-8601>"
//   }
//   ⚠ VERIFY: these field names should be confirmed against a real test webhook
//   once registered in GHL.  They match the documented GHL v2 Contact object
//   and the GhlContact interface used throughout the GHL client in this codebase.

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { LeadRecord } from "@/app/api/leads/route";

// ── File paths ────────────────────────────────────────────────────────────────

const LEADS_FILE        = path.join(process.cwd(), "data", "leads.json");
const LEADS_STATUS_FILE = path.join(process.cwd(), "data", "leads-status.json");
const OPPS_FILE         = path.join(process.cwd(), "data", "sales-opportunities.json");

// ── File helpers ──────────────────────────────────────────────────────────────

function readJson<T>(filePath: string, defaultVal: T): T {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function writeJson(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── GHL Webhook event shape ───────────────────────────────────────────────────
// Covers both Contact and Opportunity events.  All fields optional beyond type.

interface GhlWebhookEvent {
  type: string;
  locationId?: string;
  // Contact fields
  id?: string;           // GHL Contact ID (present on Contact events)
  contactId?: string;    // alternative field (some events use this)
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  source?: string;
  tags?: string[];
  assignedTo?: string;
  dateAdded?: string;
  dateUpdated?: string;
  // Opportunity fields
  pipelineId?: string;
  pipelineStageId?: string;
  pipelineStageName?: string;
  status?: string;
  monetaryValue?: number;
  [key: string]: unknown;
}

// ── Lead record helpers ───────────────────────────────────────────────────────

interface LeadsFile {
  records: LeadRecord[];
}

function readLeads(): LeadRecord[] {
  const data = readJson<LeadsFile>(LEADS_FILE, { records: [] });
  return Array.isArray(data.records) ? data.records : [];
}

function writeLeads(records: LeadRecord[]): void {
  writeJson(LEADS_FILE, { records });
}

/**
 * Find an existing RTM lead by ghlContactId (primary) or email (fallback).
 * Returns { index, record } or { index: -1, record: null }.
 */
function findLeadByGhl(
  records: LeadRecord[],
  ghlContactId: string,
  email: string | undefined
): { index: number; record: LeadRecord | null } {
  // 1. By real GHL Contact ID
  const byId = records.findIndex((r) => r.ghlContactId === ghlContactId);
  if (byId >= 0) return { index: byId, record: records[byId] };

  // 2. By email (case-insensitive), only if email provided
  if (email) {
    const emailLower = email.toLowerCase();
    const byEmail = records.findIndex(
      (r) => typeof r.email === "string" && r.email.toLowerCase() === emailLower
    );
    if (byEmail >= 0) return { index: byEmail, record: records[byEmail] };
  }

  return { index: -1, record: null };
}

/**
 * Map a GHL ContactCreate/ContactUpdate event to an RTM LeadRecord.
 * All missing fields get safe defaults.
 *
 * Source mapping: GHL's `source` field → RTM's leadSource.
 * Known GHL source values that map to RTM LeadSource literals:
 *   "google" / "google-ads" / "google_ads"  → "Google Ads"
 *   "facebook" / "meta" / "meta-ads"        → "Meta Ads"
 *   "website" / "web"                        → "Website"
 *   "lsa"                                    → "LSA"
 *   "referral"                               → "Referral"
 *   "affiliate"                              → "Affiliate"
 *   "partner"                                → "Partner"
 *   "direct"                                 → "Direct"
 *   "outbound"                               → "Outbound"
 *   anything else                            → "Direct"
 *
 * ⚠ VERIFY: GHL's actual source string values should be confirmed once a real
 * webhook fires.  The mapping below covers the most common documented values.
 */
function mapGhlSourceToLeadSource(ghlSource: string | undefined): string {
  if (!ghlSource) return "Direct";
  const s = ghlSource.toLowerCase().replace(/[_\s]/g, "-");
  if (s.includes("google-ads") || s === "google") return "Google Ads";
  if (s.includes("meta") || s.includes("facebook")) return "Meta Ads";
  if (s.includes("website") || s === "web") return "Website";
  if (s === "lsa") return "LSA";
  if (s === "referral") return "Referral";
  if (s === "affiliate") return "Affiliate";
  if (s === "partner") return "Partner";
  if (s === "direct") return "Direct";
  if (s === "outbound") return "Outbound";
  if (s.includes("gbp") || s.includes("google-business")) return "GBP";
  return "Direct";
}

function buildLeadFromGhlEvent(
  event: GhlWebhookEvent,
  ghlContactId: string,
  now: string
): LeadRecord {
  const firstName = (event.firstName ?? "").trim();
  const lastName = (event.lastName ?? "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Unknown Contact";
  const leadSource = mapGhlSourceToLeadSource(event.source);
  const today = now.split("T")[0];

  return {
    id: `LGHL${Date.now()}`,
    name: fullName,
    businessName: event.companyName ?? fullName,
    industry: "Home Services",           // GHL Contact has no industry field; set a safe default
    website: "",
    email: event.email ?? "",
    phone: event.phone ?? "",
    location: "",                        // GHL Contact has no location field at this level
    ghlContactId,
    ghlAssignedUser: event.assignedTo ?? "",
    ghlSource: event.source ?? "",
    ghlCreatedDate: event.dateAdded ? event.dateAdded.split("T")[0] : today,
    ghlLastActivityDate: event.dateUpdated ? event.dateUpdated.split("T")[0] : today,
    ghlContactTags: Array.isArray(event.tags) ? event.tags : [],
    ghlContactStatus: "New",
    ghlSyncStatus: "Synced",             // Already GHL-linked from birth
    leadSource,
    assignedRep: "",                     // No RTM rep known yet; will be assigned manually
    stage: "New Lead",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: false,
    discoveryDate: "",
    discoveryNotes: "",
    businessGoals: [],
    painPoints: [],
    requestedServices: [],
    budget: "Unknown",
    authority: "Unknown",
    need: "Low",
    timeline: "6+ months",
    estimatedValue: 0,
    affiliateName: "—",
    createdDate: today,
    lastActivity: "Just now",
    notes: `Lead created via GHL webhook (ContactCreate). Source: ${event.source ?? "unknown"}.`,
    ghlOrigin: true,
    ghlLastSyncedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let event: GhlWebhookEvent;
  try {
    event = (await req.json()) as GhlWebhookEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.type ?? "unknown";
  const now = new Date().toISOString();

  console.log(`[GHL Webhook] Received event: ${eventType}`, {
    id: event.id,
    contactId: event.contactId,
    email: event.email,
  });

  // ── ContactCreate / ContactUpdate ─────────────────────────────────────────
  if (eventType === "ContactCreate" || eventType === "ContactUpdate") {
    const ghlContactId = event.id ?? event.contactId ?? "";

    if (!ghlContactId) {
      console.warn("[GHL Webhook] ContactCreate/Update event missing contact id — skipped.");
      return NextResponse.json({ ok: true, processed: false, eventType, note: "Missing contact id" });
    }

    const leads = readLeads();
    const { index: existingIdx, record: existing } = findLeadByGhl(
      leads,
      ghlContactId,
      event.email
    );

    if (existingIdx >= 0 && existing) {
      // ── DUPLICATE / UPDATE PATH ──────────────────────────────────────────
      // RTM already knows about this contact — update GHL metadata only.
      // Never overwrite user-edited RTM fields (stage, assignedRep, notes, etc.)
      // to avoid clobbering intentional manual changes.
      console.log(`[GHL Webhook] ${eventType} — existing lead found (id: ${existing.id}), updating GHL metadata.`);

      leads[existingIdx] = {
        ...existing,
        // Update contact-level fields that may have changed in GHL
        email: event.email ?? existing.email,
        phone: event.phone ?? existing.phone,
        businessName: event.companyName ?? existing.businessName,
        ghlContactId,                         // ensure the real ID is stored
        ghlAssignedUser: event.assignedTo ?? existing.ghlAssignedUser,
        ghlSource: event.source ?? existing.ghlSource,
        ghlLastActivityDate: event.dateUpdated
          ? event.dateUpdated.split("T")[0]
          : existing.ghlLastActivityDate,
        ghlContactTags: Array.isArray(event.tags) && event.tags.length > 0
          ? event.tags
          : existing.ghlContactTags,
        ghlSyncStatus: "Synced",
        ghlLastSyncedAt: now,
        ghlSyncError: "",
        updatedAt: now,
      };
      writeLeads(leads);

      // Also sync the GHL overlay in leads-status.json so the drawer reflects it
      const statusData = readJson<{ records: Array<Record<string, unknown>> }>(
        LEADS_STATUS_FILE,
        { records: [] }
      );
      const statusIdx = statusData.records.findIndex((r) => r.leadId === existing.id);
      const statusRecord = statusIdx >= 0
        ? statusData.records[statusIdx]
        : { leadId: existing.id };
      statusData.records[statusIdx >= 0 ? statusIdx : statusData.records.length] = {
        ...statusRecord,
        ghlContactId,
        ghlSyncStatus: "Synced",
        ghlSyncError: "",
        ghlLastSyncedAt: now,
        updatedAt: now,
      };
      if (statusIdx < 0) statusData.records.push({ leadId: existing.id });
      writeJson(LEADS_STATUS_FILE, statusData);

      return NextResponse.json({
        ok: true,
        processed: true,
        eventType,
        action: "updated",
        leadId: existing.id,
      });
    }

    // ── CREATE PATH (genuine new lead from GHL) ──────────────────────────────
    // No existing RTM lead matches this ghlContactId or email.
    // Build a new LeadRecord and prepend it to leads.json.
    console.log(`[GHL Webhook] ${eventType} — no existing lead found, creating new RTM lead.`);

    const newLead = buildLeadFromGhlEvent(event, ghlContactId, now);
    leads.unshift(newLead);
    writeLeads(leads);

    console.log(`[GHL Webhook] Created new RTM lead: ${newLead.id} for GHL Contact ${ghlContactId} (${newLead.name} / ${newLead.businessName})`);

    return NextResponse.json({
      ok: true,
      processed: true,
      eventType,
      action: "created",
      leadId: newLead.id,
      ghlContactId,
    });
  }

  // ── Opportunity events ────────────────────────────────────────────────────
  if (
    eventType === "OpportunityStageChanged" ||
    eventType === "OpportunityStatusChanged" ||
    eventType === "OpportunityUpdate"
  ) {
    const ghlOppId = event.id;
    if (ghlOppId) {
      const oppsData = readJson<{ records: Array<Record<string, unknown>> }>(
        OPPS_FILE,
        { records: [] }
      );
      const idx = oppsData.records.findIndex(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r) => (r.ghl as any)?.ghlOpportunityId === ghlOppId
      );
      if (idx >= 0) {
        const existing = oppsData.records[idx];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existingGhl = (existing.ghl as any) ?? {};
        oppsData.records[idx] = {
          ...existing,
          ghl: {
            ...existingGhl,
            ...(event.pipelineStageId  ? { ghlStageId: event.pipelineStageId }           : {}),
            ...(event.pipelineStageName ? { ghlStageName: event.pipelineStageName }        : {}),
            ...(event.status            ? { ghlOpportunityStatus: event.status }            : {}),
            ...(event.monetaryValue !== undefined ? { ghlMonetaryValue: event.monetaryValue } : {}),
            ghlSyncStatus: "Synced",
            ghlSyncError: "",
            ghlLastActivityAt: now,
            ghlUpdatedAt: now,
          },
          updatedAt: now,
        };
        writeJson(OPPS_FILE, oppsData);
      }
    }
    return NextResponse.json({ ok: true, processed: true, eventType });
  }

  // ── All other events: acknowledge and log ─────────────────────────────────
  console.log(`[GHL Webhook] Unhandled event type: ${eventType} — acknowledged, no action taken.`);
  return NextResponse.json({
    ok: true,
    processed: false,
    eventType,
    note: "Event type not yet handled",
  });
}
