// RTM OS — GHL Webhook Receiver
//
// POST /api/ghl/webhook
//
// Receives real-time events from GoHighLevel when configured as a native
// "Webhook" action inside a GHL workflow (Settings → Workflows).
//
// PAYLOAD SHAPE — CONFIRMED REAL (GHL Webhook Action Data Format Guide)
// ─────────────────────────────────────────────────────────────────────
// GHL's native Webhook action sends a FLAT, snake_case object.
// There is NO "type" discriminator field in the body — which trigger fired
// is configured in GHL's workflow builder, not embedded in the payload.
//
// Root-level contact fields (always present when triggered by a Contact
// workflow trigger):
//   first_name, last_name, full_name, email, phone, tags,
//   address1, city, state, country, timezone, date_created, postal_code,
//   company_name, website, date_of_birth, contact_source, full_address,
//   contact_type, gclid, id  (GHL Contact ID), location_id
//   … plus any Contact Custom Fields also at root level.
//
// Nested location object (present on most webhooks):
//   location: { name, address, city, state, country, postalCode,
//               fullAddress, id }
//
// Opportunity fields — root level, ONLY when the workflow has an Opportunity
// trigger:
//   opportunity_name, status, lead_value, opportunity_source, source,
//   pipleline_stage (NOTE: exact GHL typo — "pipleline_stage", not
//   "pipeline_stage"), pipeline_id, id (opportunity id in this context),
//   pipeline_name
//
// ─────────────────────────────────────────────────────────────────────
// DESIGN: since the payload has no "type" field, this handler uses
// upsert logic based on dedup (ghlContactId → email).  A matching lead
// gets its GHL metadata refreshed; a non-matching payload creates a new
// lead.  This naturally handles both "Contact Created" and "Contact
// Updated" workflows pointing at the same URL.
//
// FIELDS NOT TOUCHED ON UPDATE (never clobbered):
//   stage, assignedRep, notes, discoveryScheduled, discoveryDate,
//   discoveryNotes, businessGoals, painPoints, requestedServices,
//   budget, authority, need, timeline, estimatedValue, affiliateName
//
// DEDUP EXCLUSIONS:
//   Mock/placeholder GHL Contact IDs ("GHL-CON-*") are skipped in the
//   dedup check (same as the /api/leads dedup logic).
//
// SYNC DIRECTION NOTE:
//   PRIMARY (GHL → RTM): This file. New contacts from GHL ad campaigns /
//     automations flow into RTM's Sales Leads dashboard.
//   SECONDARY (RTM → GHL): /api/ghl/sync-lead + /api/ghl/sync-opportunity.
//     Not modified here.

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

// ── GHL real payload shape (confirmed snake_case, no "type" field) ────────────
//
// All fields are optional at the TypeScript level because:
//   • Contact-only triggers omit opportunity_* fields entirely.
//   • Opportunity-only triggers may omit some contact fields.
//   • Custom fields vary by account.
//
// Field name note: GHL documents "pipleline_stage" (double-i) — that is the
// REAL key GHL sends.  We preserve that exact spelling here.

interface GhlWebhookPayload {
  // ── Contact identity ──────────────────────────────────────────────────────
  id?: string;               // GHL Contact ID (primary dedup key)
  location_id?: string;

  // ── Contact fields (root-level, snake_case) ───────────────────────────────
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  address1?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  date_created?: string;     // ISO-8601; used as ghlCreatedDate
  postal_code?: string;
  company_name?: string;     // → businessName in RTM
  website?: string;
  date_of_birth?: string;
  contact_source?: string;   // → leadSource mapping; NOT "source"
  full_address?: string;
  contact_type?: string;
  gclid?: string;

  // ── Nested location object ────────────────────────────────────────────────
  location?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    fullAddress?: string;
    id?: string;
  };

  // ── Opportunity fields — present ONLY on Opportunity workflow triggers ─────
  opportunity_name?: string;
  status?: string;
  lead_value?: number;
  opportunity_source?: string;
  source?: string;           // secondary source field on opportunity triggers
  pipleline_stage?: string;  // GHL's own documented typo — keep as-is
  pipeline_id?: string;
  pipeline_name?: string;

  // ── Catch-all for custom fields / future additions ────────────────────────
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
 * Find an existing RTM lead matching this GHL Contact.
 *
 * Search order (3-level, matches /api/leads dedup):
 *   1. ghlContactId exact match (skips mock/placeholder "GHL-CON-*" IDs)
 *   2. email case-insensitive match (fallback, only if email is provided)
 *
 * Returns { index, record } or { index: -1, record: null }.
 */
function findLeadByGhl(
  records: LeadRecord[],
  ghlContactId: string,
  email: string | undefined
): { index: number; record: LeadRecord | null } {
  // 1. By real GHL Contact ID — skip mock placeholder IDs
  const isRealId =
    ghlContactId &&
    ghlContactId !== "—" &&
    !ghlContactId.startsWith("GHL-CON-");

  if (isRealId) {
    const byId = records.findIndex((r) => r.ghlContactId === ghlContactId);
    if (byId >= 0) return { index: byId, record: records[byId] };
  }

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
 * Map GHL's `contact_source` field value to an RTM leadSource literal.
 *
 * GHL sends the source as a raw string in `contact_source` (confirmed field
 * name per the Webhook Action Data Format Guide).  The mapping below covers
 * the most common documented GHL source values; anything unrecognised falls
 * back to "Direct".
 *
 * ⚠ VERIFY: confirm the exact string GHL sends for your configured sources
 *   once a real test webhook fires.  The values below match GHL's documented
 *   naming conventions but may differ for custom sources.
 */
function mapGhlSourceToLeadSource(contactSource: string | undefined): string {
  if (!contactSource) return "Direct";
  const s = contactSource.toLowerCase().replace(/[_\s]/g, "-");
  if (s.includes("google-ads") || s === "google")      return "Google Ads";
  if (s.includes("meta") || s.includes("facebook"))    return "Meta Ads";
  if (s.includes("website") || s === "web")            return "Website";
  if (s === "lsa")                                     return "LSA";
  if (s === "referral")                                return "Referral";
  if (s === "affiliate")                               return "Affiliate";
  if (s === "partner")                                 return "Partner";
  if (s === "direct")                                  return "Direct";
  if (s === "outbound")                                return "Outbound";
  if (s.includes("gbp") || s.includes("google-business")) return "GBP";
  return "Direct";
}

/**
 * Derive a human-readable location string from GHL fields.
 * Prefers full_address; falls back to city + state; then location.fullAddress.
 */
function deriveLocation(payload: GhlWebhookPayload): string {
  if (payload.full_address) return payload.full_address;
  const parts = [payload.city, payload.state].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  if (payload.location?.fullAddress) return payload.location.fullAddress;
  const locParts = [payload.location?.city, payload.location?.state].filter(Boolean);
  return locParts.join(", ");
}

/**
 * Build a new RTM LeadRecord from a GHL webhook payload.
 * Uses the REAL confirmed field names (snake_case, contact_source, etc.).
 */
function buildLeadFromGhlPayload(
  payload: GhlWebhookPayload,
  ghlContactId: string,
  now: string
): LeadRecord {
  // Name resolution: prefer explicit first/last, fall back to full_name
  const firstName = (payload.first_name ?? "").trim();
  const lastName  = (payload.last_name  ?? "").trim();
  const fullName  =
    [firstName, lastName].filter(Boolean).join(" ") ||
    (payload.full_name ?? "").trim() ||
    "Unknown Contact";

  const leadSource = mapGhlSourceToLeadSource(payload.contact_source);
  const today      = now.split("T")[0];
  const location   = deriveLocation(payload);

  return {
    id:              `LGHL${Date.now()}`,
    name:            fullName,
    businessName:    (payload.company_name ?? "").trim() || fullName,
    industry:        "Home Services",  // GHL Contact has no industry field; safe default
    website:         payload.website ?? "",
    email:           payload.email   ?? "",
    phone:           payload.phone   ?? "",
    location,
    ghlContactId,
    ghlAssignedUser: "",              // GHL native webhook doesn't include assignedTo
    ghlSource:       payload.contact_source ?? "",
    ghlCreatedDate:  payload.date_created
      ? payload.date_created.split("T")[0]
      : today,
    ghlLastActivityDate: payload.date_created
      ? payload.date_created.split("T")[0]
      : today,
    ghlContactTags:   Array.isArray(payload.tags) ? payload.tags : [],
    ghlContactStatus: "New",
    ghlSyncStatus:    "Synced",       // Already GHL-linked from birth
    leadSource,
    assignedRep:      "",
    stage:            "New Lead",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: false,
    discoveryDate:    "",
    discoveryNotes:   "",
    businessGoals:    [],
    painPoints:       [],
    requestedServices:[],
    budget:           "Unknown",
    authority:        "Unknown",
    need:             "Low",
    timeline:         "6+ months",
    estimatedValue:   0,
    affiliateName:    "—",
    createdDate:      today,
    lastActivity:     "Just now",
    notes:            `Lead created via GHL webhook. Source: ${payload.contact_source ?? "unknown"}.`,
    ghlOrigin:        true,
    ghlLastSyncedAt:  now,
    createdAt:        now,
    updatedAt:        now,
  };
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let payload: GhlWebhookPayload;
  try {
    payload = (await req.json()) as GhlWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const now = new Date().toISOString();

  // GHL native Webhook action has NO "type" field — log what we can identify
  const ghlContactId = (typeof payload.id === "string" ? payload.id : "").trim();
  const hasOpportunityFields =
    payload.opportunity_name !== undefined ||
    payload.pipeline_id      !== undefined ||
    payload.pipleline_stage  !== undefined;  // GHL's documented typo

  console.log("[GHL Webhook] Received payload", {
    id:             ghlContactId || "(none)",
    email:          payload.email,
    first_name:     payload.first_name,
    last_name:      payload.last_name,
    contact_source: payload.contact_source,
    hasOpportunity: hasOpportunityFields,
  });

  // ── Contact upsert (dedup → update or create) ─────────────────────────────
  //
  // Because GHL doesn't embed a "type" field, we always run the dedup check.
  // Match  → update GHL metadata only (never clobber user-edited RTM fields).
  // No match → create a new lead.
  //
  // We skip this path only if there is no contact id AND no email — which
  // would mean we have nothing meaningful to key on.

  const hasContactIdentifier = Boolean(ghlContactId || payload.email);

  if (hasContactIdentifier) {
    const leads = readLeads();
    const { index: existingIdx, record: existing } = findLeadByGhl(
      leads,
      ghlContactId,
      payload.email
    );

    if (existingIdx >= 0 && existing) {
      // ── UPDATE PATH ────────────────────────────────────────────────────────
      // Existing RTM lead found — refresh GHL metadata only.
      // Fields listed below are safe to refresh because they come from GHL
      // and won't conflict with manual RTM edits.
      //
      // Fields NOT touched (never clobbered):
      //   stage, assignedRep, notes, discoveryScheduled, discoveryDate,
      //   discoveryNotes, businessGoals, painPoints, requestedServices,
      //   budget, authority, need, timeline, estimatedValue, affiliateName,
      //   opportunityReadiness, industry

      console.log(
        `[GHL Webhook] Existing lead matched (RTM id: ${existing.id}, ` +
        `ghlContactId: ${ghlContactId || "n/a"}) — updating GHL metadata only.`
      );

      leads[existingIdx] = {
        ...existing,
        // GHL contact fields that may legitimately change
        email:           payload.email       ?? existing.email,
        phone:           payload.phone       ?? existing.phone,
        businessName:    payload.company_name
          ? payload.company_name.trim() || existing.businessName
          : existing.businessName,
        website:         payload.website     ?? existing.website,
        // Refresh location if we now have better data
        location:        deriveLocation(payload) || existing.location,
        // GHL sync metadata
        ghlContactId:    ghlContactId        || existing.ghlContactId,
        ghlSource:       payload.contact_source ?? existing.ghlSource,
        ghlLastActivityDate: now.split("T")[0],
        ghlContactTags:  Array.isArray(payload.tags) && payload.tags.length > 0
          ? payload.tags
          : existing.ghlContactTags,
        ghlContactStatus: existing.ghlContactStatus,  // keep; GHL webhook doesn't send this
        ghlSyncStatus:   "Synced",
        ghlLastSyncedAt: now,
        ghlSyncError:    "",
        updatedAt:       now,
      };
      writeLeads(leads);

      // Sync GHL overlay in leads-status.json
      const statusData = readJson<{ records: Array<Record<string, unknown>> }>(
        LEADS_STATUS_FILE,
        { records: [] }
      );
      const statusIdx = statusData.records.findIndex((r) => r.leadId === existing.id);
      const statusRecord =
        statusIdx >= 0 ? statusData.records[statusIdx] : { leadId: existing.id };
      const updatedStatus = {
        ...statusRecord,
        ghlContactId:    ghlContactId || existing.ghlContactId,
        ghlSyncStatus:   "Synced",
        ghlSyncError:    "",
        ghlLastSyncedAt: now,
        updatedAt:       now,
      };
      if (statusIdx >= 0) {
        statusData.records[statusIdx] = updatedStatus;
      } else {
        statusData.records.push(updatedStatus);
      }
      writeJson(LEADS_STATUS_FILE, statusData);

      return NextResponse.json({
        ok:      true,
        processed: true,
        action:  "updated",
        leadId:  existing.id,
        ghlContactId: ghlContactId || existing.ghlContactId,
      });
    }

    // ── CREATE PATH ────────────────────────────────────────────────────────
    // No existing RTM lead matched — this is a genuinely new contact.

    console.log(
      `[GHL Webhook] No existing lead found (id: ${ghlContactId || "n/a"}, ` +
      `email: ${payload.email ?? "n/a"}) — creating new RTM lead.`
    );

    const newLead = buildLeadFromGhlPayload(payload, ghlContactId, now);
    leads.unshift(newLead);
    writeLeads(leads);

    console.log(
      `[GHL Webhook] Created RTM lead ${newLead.id} for GHL Contact ` +
      `${ghlContactId} (${newLead.name} / ${newLead.businessName})`
    );

    return NextResponse.json({
      ok:          true,
      processed:   true,
      action:      "created",
      leadId:      newLead.id,
      ghlContactId,
    });
  }

  // ── Opportunity-only payload (no contact identifier) ─────────────────────
  //
  // If the payload has opportunity fields but no usable contact id or email,
  // attempt to match the opportunity record in sales-opportunities.json and
  // update it.  The RTM opportunity record is keyed on ghl.ghlOpportunityId.
  //
  // Opportunity fields (all optional, present only on Opportunity triggers):
  //   id              → ghlOpportunityId
  //   opportunity_name, status, lead_value, pipleline_stage (GHL typo),
  //   pipeline_id, pipeline_name, opportunity_source

  if (hasOpportunityFields) {
    const ghlOppId = ghlContactId || "";  // `id` doubles as opp id on opp-only payloads
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
            // pipleline_stage is GHL's own documented typo — kept as-is
            ...(payload.pipleline_stage  ? { ghlStageName:         payload.pipleline_stage  } : {}),
            ...(payload.pipeline_id      ? { ghlPipelineId:        payload.pipeline_id      } : {}),
            ...(payload.pipeline_name    ? { ghlPipelineName:      payload.pipeline_name    } : {}),
            ...(payload.status           ? { ghlOpportunityStatus: payload.status           } : {}),
            ...(payload.lead_value !== undefined
              ? { ghlMonetaryValue: payload.lead_value }
              : {}),
            ghlSyncStatus:    "Synced",
            ghlSyncError:     "",
            ghlLastActivityAt: now,
            ghlUpdatedAt:     now,
          },
          updatedAt: now,
        };
        writeJson(OPPS_FILE, oppsData);
        return NextResponse.json({ ok: true, processed: true, action: "opp-updated", ghlOppId });
      }
    }
    console.log("[GHL Webhook] Opportunity payload received but no matching RTM opportunity found.");
    return NextResponse.json({ ok: true, processed: false, note: "No matching RTM opportunity" });
  }

  // ── Nothing to act on ────────────────────────────────────────────────────
  console.log("[GHL Webhook] Payload has no contact identifier or opportunity fields — acknowledged, no action.");
  return NextResponse.json({
    ok:        true,
    processed: false,
    note:      "No actionable fields in payload",
  });
}
