// RTM OS — Client Search API Route
//
// GET /api/clients/search?q=<query>
//
// Searches the `clients` table by name and email, and the `businesses` table
// by domain. Returns every matching Client together with their existing
// Businesses so the caller can show what domains already sit under each Client.
//
// Matching rules (any of these qualifies a Client as a hit):
//   - client.fullName contains the query (case-insensitive)
//   - client.email contains the query (case-insensitive)
//   - any business.domain under that client contains the normalised query
//
// A missing or empty query returns an empty array (no full-scan).
// A failed query returns { error: string } with HTTP 500.
//
// Response shape:
//   { results: ClientSearchResult[] }
//
// ClientSearchResult:
//   {
//     client: { id, fullName, email, phone, company, ghlContactId }
//     businesses: { id, domain, displayName, invoiceStatus, paymentStatus }[]
//   }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { normalizeDomain } from "@/lib/clients/domain";

export interface ClientSearchBusiness {
  id: string;
  domain: string;
  displayName: string;
  invoiceStatus: string;
  paymentStatus: string;
}

export interface ClientSearchClient {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  ghlContactId: string | null;
}

export interface ClientSearchResult {
  client: ClientSearchClient;
  businesses: ClientSearchBusiness[];
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("q") ?? "").trim();

  if (!raw) {
    return NextResponse.json({ results: [] });
  }

  const lower = raw.toLowerCase();
  // Normalise the query as a domain in case Billing typed a URL
  const normalisedQuery = normalizeDomain(raw);

  try {
    // 1. Find clients matching by name or email directly
    const clientsByNameOrEmail = await prisma.client.findMany({
      where: {
        OR: [
          { fullName: { contains: lower, mode: "insensitive" } },
          { email:    { contains: lower, mode: "insensitive" } },
        ],
      },
    });

    // 2. Find businesses whose domain contains the normalised query,
    //    then collect the parent client ids
    const bizByDomain = await prisma.business.findMany({
      where: {
        domain: { contains: normalisedQuery, mode: "insensitive" },
      },
      select: { clientId: true },
    });
    const clientIdsByDomain = [...new Set(bizByDomain.map((b) => b.clientId))];

    // 3. Load any extra clients found via domain that weren't already matched
    const alreadyFoundIds = new Set(clientsByNameOrEmail.map((c) => c.id));
    const extraClients =
      clientIdsByDomain.length > 0
        ? await prisma.client.findMany({
            where: {
              id: {
                in: clientIdsByDomain.filter((id) => !alreadyFoundIds.has(id)),
              },
            },
          })
        : [];

    const allClients = [...clientsByNameOrEmail, ...extraClients];

    if (allClients.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // 4. For each matching client, fetch their businesses
    const allClientIds = allClients.map((c) => c.id);
    const allBusinesses = await prisma.business.findMany({
      where: { clientId: { in: allClientIds } },
      orderBy: { createdAt: "asc" },
    });

    const bizByClient = new Map<string, typeof allBusinesses>();
    for (const biz of allBusinesses) {
      if (!bizByClient.has(biz.clientId)) bizByClient.set(biz.clientId, []);
      bizByClient.get(biz.clientId)!.push(biz);
    }

    const results: ClientSearchResult[] = allClients.map((c) => ({
      client: {
        id:           c.id,
        fullName:     c.fullName,
        email:        c.email,
        phone:        c.phone,
        company:      c.company,
        ghlContactId: c.ghlContactId ?? null,
      },
      businesses: (bizByClient.get(c.id) ?? []).map((b) => ({
        id:            b.id,
        domain:        b.domain,
        displayName:   b.displayName,
        invoiceStatus: b.invoiceStatus,
        paymentStatus: b.paymentStatus,
      })),
    }));

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
