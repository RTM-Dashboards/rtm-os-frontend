// RTM OS — GHL Webhook Receiver
//
// POST /api/ghl/webhook
//
// Persistence layer: previously data/leads.json + data/leads-status.json +
// data/sales-opportunities.json (fs.readFileSync/writeFileSync).
// Now backed by PostgreSQL via Prisma (Supabase in production).
//
// This fixes the confirmed production EROFS crash:
//   "EROFS: read-only file system, open '/var/task/data/leads.json'"
//
// The external behavior is UNCHANGED:
//   - Same GHL webhook payload shape accepted (flat snake_case, no "type" field)
//   - Same dedup logic (3-level: ghlContactId → email, skipping mock IDs)
//   - Same never-clobber-user-edited-fields behavior on updates
//   - Same CREATE path for genuinely new contacts
//   - Same opportunity-only payload handling
//
// See original route for full payload shape documentation.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Lead as PrismaLead } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { LeadRecord } from "@/app/api/leads/route";

// ── GHL real payload shape ────────────────────────────────────────────────────
//
// Confirmed snake_case, no "type" field.
// "pipleline_stage" is GHL's own documented typo — kept as-is.

interface GhlWebhookPayload {
  id?: string;
  location_id?: string;
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
  date_created?: string;
  postal_code?: string;
  company_name?: string;
  website?: string;
  date_of_birth?: string;
  contact_source?: string;
  full_address?: string;
  contact_type?: string;
  gclid?: string;
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
  opportunity_name?: string;
  status?: string;
  lead_value?: number;
  opportunity_source?: string;
  source?: string;
  pipleline_stage?: string; // GHL's own documented typo — keep as-is
  pipeline_id?: string;
  pipeline_name?: string;
  [key: string]: unknown;
}

// ── Helper: map GHL contact_source → RTM leadSource ──────────────────────────

function mapGhlSourceToLeadSource(contactSource: string | undefined): string {
  if (!contactSource) return "Direct";
  const s = contactSource.toLowerCase().replace(/[_\s]/g, "-");
  if (s.includes("google-ads") || s === "google")         return "Google Ads";
  if (s.includes("meta") || s.includes("facebook"))       return "Meta Ads";
  if (s.includes("website") || s === "web")               return "Website";
  if (s === "lsa")                                        return "LSA";
  if (s === "referral")                                   return "Referral";
  if (s === "affiliate")                                  return "Affiliate";
  if (s === "partner")                                    return "Partner";
  if (s === "direct")                                     return "Direct";
  if (s === "outbound")                                   return "Outbound";
  if (s.includes("gbp") || s.includes("google-business")) return "GBP";
  return "Direct";
}

// ── Helper: derive human-readable location ────────────────────────────────────

function deriveLocation(payload: GhlWebhookPayload): string {
  if (payload.full_address) return payload.full_address;
  const parts = [payload.city, payload.state].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  if (payload.location?.fullAddress) return payload.location.fullAddress;
  const locParts = [payload.location?.city, payload.location?.state].filter(Boolean);
  return locParts.join(", ");
}

// ── Helper: build new Lead from GHL payload ───────────────────────────────────

function buildLeadFromGhlPayload(
  payload: GhlWebhookPayload,
  ghlContactId: string,
  now: string
): Omit<PrismaLead, "id"> & { id: string } {
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
    id:                   `LGHL${Date.now()}`,
    name:                 fullName,
    businessName:         (payload.company_name ?? "").trim() || fullName,
    industry:             "Home Services",
    website:              payload.website ?? "",
    email:                payload.email   ?? "",
    phone:                payload.phone   ?? "",
    location,
    ghlContactId,
    ghlAssignedUser:      "",
    ghlSource:            payload.contact_source ?? "",
    ghlCreatedDate:       payload.date_created ? payload.date_created.split("T")[0] : today,
    ghlLastActivityDate:  payload.date_created ? payload.date_created.split("T")[0] : today,
    ghlContactTags:       Array.isArray(payload.tags) ? payload.tags : [],
    ghlContactStatus:     "New",
    ghlSyncStatus:        "Synced",
    ghlOrigin:            true,
    ghlLastSyncedAt:      now,
    ghlSyncError:         null,
    leadSource,
    assignedRep:          "",
    stage:                "New Lead",
    opportunityReadiness: "Not Ready",
    discoveryScheduled:   false,
    discoveryDate:        "",
    discoveryNotes:       "",
    businessGoals:        [],
    painPoints:           [],
    requestedServices:    [],
    budget:               "Unknown",
    authority:            "Unknown",
    need:                 "Low",
    timeline:             "6+ months",
    estimatedValue:       0,
    affiliateName:        "—",
    createdDate:          today,
    lastActivity:         "Just now",
    notes:                `Lead created via GHL webhook. Source: ${payload.contact_source ?? "unknown"}.`,
    disqualified:         false,
    disqualifiedReason:   null,
    createdAt:            now,
    updatedAt:            now,
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
  const ghlContactId = (typeof payload.id === "string" ? payload.id : "").trim();
  const hasOpportunityFields =
    payload.opportunity_name !== undefined ||
    payload.pipeline_id      !== undefined ||
    payload.pipleline_stage  !== undefined;

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
  // Always run dedup — GHL webhook has no "type" field.
  // Match  → update GHL metadata only (never clobber user-edited RTM fields).
  // No match → create a new lead.

  const hasContactIdentifier = Boolean(ghlContactId || payload.email);

  if (hasContactIdentifier) {
    // 3-level dedup: real ghlContactId → email (case-insensitive)
    // Skip mock/placeholder IDs ("GHL-CON-*")
    const isRealId =
      ghlContactId &&
      ghlContactId !== "—" &&
      !ghlContactId.startsWith("GHL-CON-");

    let existing: PrismaLead | null = null;

    // 1. By real GHL Contact ID
    if (isRealId) {
      existing = await prisma.lead.findFirst({
        where: { ghlContactId },
      });
    }

    // 2. By email (case-insensitive fallback)
    if (!existing && payload.email) {
      existing = await prisma.lead.findFirst({
        where: {
          email: {
            equals: payload.email,
            mode: "insensitive",
          },
        },
      });
    }

    if (existing) {
      // ── UPDATE PATH ────────────────────────────────────────────────────────
      // Existing RTM lead found — refresh GHL metadata only.
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

      await prisma.lead.update({
        where: { id: existing.id },
        data: {
          email:               payload.email      ?? existing.email,
          phone:               payload.phone      ?? existing.phone,
          businessName:        payload.company_name
            ? payload.company_name.trim() || existing.businessName
            : existing.businessName,
          website:             payload.website    ?? existing.website,
          location:            deriveLocation(payload) || existing.location,
          ghlContactId:        ghlContactId       || existing.ghlContactId,
          ghlSource:           payload.contact_source ?? existing.ghlSource,
          ghlLastActivityDate: now.split("T")[0],
          ghlContactTags:
            Array.isArray(payload.tags) && payload.tags.length > 0
              ? payload.tags
              : existing.ghlContactTags,
          // ghlContactStatus: keep existing — webhook doesn't send this
          ghlSyncStatus:       "Synced",
          ghlLastSyncedAt:     now,
          ghlSyncError:        "",
          updatedAt:           now,
        },
      });

      // Sync GHL overlay into lead_statuses table
      await prisma.leadStatus.upsert({
        where: { leadId: existing.id },
        update: {
          ghlContactId:    ghlContactId || existing.ghlContactId,
          ghlSyncStatus:   "Synced",
          ghlSyncError:    "",
          ghlLastSyncedAt: now,
          updatedAt:       now,
        },
        create: {
          leadId:          existing.id,
          ghlContactId:    ghlContactId || existing.ghlContactId,
          ghlSyncStatus:   "Synced",
          ghlSyncError:    "",
          ghlLastSyncedAt: now,
          updatedAt:       now,
        },
      });

      return NextResponse.json({
        ok:           true,
        processed:    true,
        action:       "updated",
        leadId:       existing.id,
        ghlContactId: ghlContactId || existing.ghlContactId,
      });
    }

    // ── CREATE PATH ────────────────────────────────────────────────────────
    // No existing RTM lead matched — genuinely new contact.

    console.log(
      `[GHL Webhook] No existing lead found (id: ${ghlContactId || "n/a"}, ` +
      `email: ${payload.email ?? "n/a"}) — creating new RTM lead.`
    );

    const newLead = buildLeadFromGhlPayload(payload, ghlContactId, now);
    await prisma.lead.create({ data: newLead });

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

  // ── Opportunity-only payload (no contact identifier) ──────────────────────
  //
  // Attempt to match an opportunity by ghlOpportunityId and update GHL metadata.

  if (hasOpportunityFields) {
    const ghlOppId = ghlContactId || "";
    if (ghlOppId) {
      const oppRow = await prisma.opportunity.findFirst({
        where: {
          ghl: {
            path: ["ghlOpportunityId"],
            equals: ghlOppId,
          },
        },
      });

      if (oppRow) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existingGhl = ((oppRow.ghl ?? {}) as any);
        const updatedGhl: Prisma.InputJsonValue = {
          ...existingGhl,
          ...(payload.pipleline_stage  ? { ghlStageName:         payload.pipleline_stage  } : {}),
          ...(payload.pipeline_id      ? { ghlPipelineId:        payload.pipeline_id      } : {}),
          ...(payload.pipeline_name    ? { ghlPipelineName:      payload.pipeline_name    } : {}),
          ...(payload.status           ? { ghlOpportunityStatus: payload.status           } : {}),
          ...(payload.lead_value !== undefined ? { ghlMonetaryValue: payload.lead_value }  : {}),
          ghlSyncStatus:    "Synced",
          ghlSyncError:     "",
          ghlLastActivityAt: now,
          ghlUpdatedAt:     now,
        };

        await prisma.opportunity.update({
          where: { id: oppRow.id },
          data: {
            ghl:       updatedGhl,
            updatedAt: now,
          },
        });

        return NextResponse.json({ ok: true, processed: true, action: "opp-updated", ghlOppId });
      }
    }

    console.log("[GHL Webhook] Opportunity payload received but no matching RTM opportunity found.");
    return NextResponse.json({ ok: true, processed: false, note: "No matching RTM opportunity" });
  }

  // ── Nothing to act on ─────────────────────────────────────────────────────
  console.log("[GHL Webhook] Payload has no contact identifier or opportunity fields — acknowledged, no action.");
  return NextResponse.json({
    ok:        true,
    processed: false,
    note:      "No actionable fields in payload",
  });
}

// Re-export LeadRecord for webhook type usage (mirrors original export)
export type { LeadRecord };
