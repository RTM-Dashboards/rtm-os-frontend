// RTM OS — Businesses API Route
//
// Persistence layer: reads/writes the `businesses` table in Postgres via Prisma.
// No filesystem fallback. No GHL sync. No seed import.
//
// Domain is stored normalised (no scheme, no www, no trailing slash, lowercased).
// Every write and every lookup normalises via lib/clients/domain.ts so that
// "HTTPS://WWW.Company-A.com/" and "company-a.com" always resolve to the same row.
//
// GET  /api/businesses                   → { records: BusinessRecord[] }
// GET  /api/businesses?id=<id>           → { record: BusinessRecord }
// GET  /api/businesses?domain=<domain>   → { record: BusinessRecord }
//        (domain input is normalised before lookup)
// GET  /api/businesses?clientId=<id>     → { records: BusinessRecord[] }
// POST /api/businesses                   → body: BusinessRecord (id required)
//                                         → { record: BusinessRecord } (upsert by id)
//
// A failed write returns { error: string } with HTTP 500.
// A missing record returns { error: string } with HTTP 404.
// It NEVER returns { record } on failure.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { normalizeDomain } from "@/lib/clients/domain";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BusinessRecord {
  id: string;
  domain: string;           // always normalised
  displayName: string;
  clientId: string;
  // Billing state
  invoiceStatus: string;
  paymentStatus: string;
  invoiceAmountCents: number;
  subscriptionRef: string | null;
  // Delivery state
  assignedAM: string;
  activationStatus: string;
  onboardingStatus: string;
  activeServices: string[];
  monthlyValueCents: number;
  renewalDate: string | null;
  renewalStatus: string;
  // Provenance — NOT an identity key, NOT a matching key
  ghlOpportunityId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── DB row ↔ BusinessRecord conversion ───────────────────────────────────────

type BusinessRow = Prisma.BusinessGetPayload<Record<string, never>>;

function rowToRecord(row: BusinessRow): BusinessRecord {
  return {
    id: row.id,
    domain: row.domain,
    displayName: row.displayName,
    clientId: row.clientId,
    invoiceStatus: row.invoiceStatus,
    paymentStatus: row.paymentStatus,
    invoiceAmountCents: row.invoiceAmountCents,
    subscriptionRef: row.subscriptionRef ?? null,
    assignedAM: row.assignedAM,
    activationStatus: row.activationStatus,
    onboardingStatus: row.onboardingStatus,
    activeServices: row.activeServices,
    monthlyValueCents: row.monthlyValueCents,
    renewalDate: row.renewalDate ?? null,
    renewalStatus: row.renewalStatus,
    ghlOpportunityId: row.ghlOpportunityId ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const domain = searchParams.get("domain");
  const clientId = searchParams.get("clientId");

  // Single record by id
  if (id) {
    try {
      const row = await prisma.business.findUnique({ where: { id } });
      if (!row) {
        return NextResponse.json(
          { error: `No business found with id: ${id}` },
          { status: 404 }
        );
      }
      return NextResponse.json({ record: rowToRecord(row) });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // Domain-first lookup — normalise the input before querying
  if (domain) {
    const normalised = normalizeDomain(domain);
    try {
      const row = await prisma.business.findFirst({
        where: { domain: normalised },
        orderBy: { createdAt: "asc" },
      });
      if (!row) {
        return NextResponse.json(
          { error: `No business found for domain: ${normalised}` },
          { status: 404 }
        );
      }
      return NextResponse.json({ record: rowToRecord(row) });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // All businesses for a client
  if (clientId) {
    try {
      const rows = await prisma.business.findMany({
        where: { clientId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ records: rows.map(rowToRecord) });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // Full list
  try {
    const rows = await prisma.business.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ records: rows.map(rowToRecord) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
// Upsert by id. Normalises domain on write.

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = body as Partial<BusinessRecord>;
  if (!incoming || typeof incoming.id !== "string") {
    return NextResponse.json(
      { error: "Body must include id (string)" },
      { status: 400 }
    );
  }

  // Normalise domain on write so the stored value is always canonical
  const normalisedDomain = incoming.domain
    ? normalizeDomain(incoming.domain)
    : undefined;

  const now = new Date().toISOString();

  try {
    const existing = await prisma.business.findUnique({ where: { id: incoming.id } });

    let row: BusinessRow;

    if (existing) {
      row = await prisma.business.update({
        where: { id: incoming.id },
        data: {
          domain:             normalisedDomain               ?? existing.domain,
          displayName:        incoming.displayName           ?? existing.displayName,
          clientId:           incoming.clientId              ?? existing.clientId,
          invoiceStatus:      incoming.invoiceStatus         ?? existing.invoiceStatus,
          paymentStatus:      incoming.paymentStatus         ?? existing.paymentStatus,
          invoiceAmountCents: incoming.invoiceAmountCents    ?? existing.invoiceAmountCents,
          subscriptionRef:    incoming.subscriptionRef !== undefined
            ? incoming.subscriptionRef
            : existing.subscriptionRef,
          assignedAM:         incoming.assignedAM            ?? existing.assignedAM,
          activationStatus:   incoming.activationStatus      ?? existing.activationStatus,
          onboardingStatus:   incoming.onboardingStatus      ?? existing.onboardingStatus,
          activeServices:     incoming.activeServices        ?? existing.activeServices,
          monthlyValueCents:  incoming.monthlyValueCents     ?? existing.monthlyValueCents,
          renewalDate:        incoming.renewalDate !== undefined
            ? incoming.renewalDate
            : existing.renewalDate,
          renewalStatus:      incoming.renewalStatus         ?? existing.renewalStatus,
          ghlOpportunityId:   incoming.ghlOpportunityId !== undefined
            ? incoming.ghlOpportunityId
            : existing.ghlOpportunityId,
          updatedAt: now,
        },
      });
    } else {
      if (!incoming.clientId) {
        return NextResponse.json(
          { error: "Body must include clientId when creating a business" },
          { status: 400 }
        );
      }
      if (!normalisedDomain) {
        return NextResponse.json(
          { error: "Body must include domain when creating a business" },
          { status: 400 }
        );
      }
      row = await prisma.business.create({
        data: {
          id:                 incoming.id,
          domain:             normalisedDomain,
          displayName:        incoming.displayName        ?? "",
          clientId:           incoming.clientId,
          invoiceStatus:      incoming.invoiceStatus      ?? "none",
          paymentStatus:      incoming.paymentStatus      ?? "none",
          invoiceAmountCents: incoming.invoiceAmountCents ?? 0,
          subscriptionRef:    incoming.subscriptionRef    ?? null,
          assignedAM:         incoming.assignedAM         ?? "",
          activationStatus:   incoming.activationStatus   ?? "inactive",
          onboardingStatus:   incoming.onboardingStatus   ?? "not_started",
          activeServices:     incoming.activeServices     ?? [],
          monthlyValueCents:  incoming.monthlyValueCents  ?? 0,
          renewalDate:        incoming.renewalDate        ?? null,
          renewalStatus:      incoming.renewalStatus      ?? "ok",
          ghlOpportunityId:   incoming.ghlOpportunityId  ?? null,
          createdAt:          now,
          updatedAt:          now,
        },
      });
    }

    return NextResponse.json({ record: rowToRecord(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Query param id is required" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: `No business found with id: ${id}` },
        { status: 404 }
      );
    }
    await prisma.business.delete({ where: { id } });
    return NextResponse.json({ deleted: id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
