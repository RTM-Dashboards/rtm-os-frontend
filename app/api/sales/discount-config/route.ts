// RTM OS — Discount Configuration API Route
//
// GET  /api/sales/discount-config
//   Returns all discount tiers and discount type options.
//   → { tiers: DiscountTierRow[], types: DiscountTypeRow[] }
//
// POST /api/sales/discount-config
//   Replaces tiers and/or types atomically (same pattern as pipeline-stages).
//   Body: { tiers?: DiscountTierRow[], types?: DiscountTypeRow[] }
//   Omitted arrays are left unchanged.
//   → { ok: true }
//
// Auth: Manager or higher.
// Error shape: { error: string } — matches all other routes.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/auth";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface DiscountTierRow {
  id: string;
  label: string;
  percentage: number;
  sortOrder: number;
}

export interface DiscountTypeRow {
  id: string;
  value: string;
  label: string;
  description: string;
  sortOrder: number;
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const gate = requireRole(user!, "Manager");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const [tierRows, typeRows] = await Promise.all([
      prisma.discountTier.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.discountTypeOption.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

    const tiers: DiscountTierRow[] = tierRows.map((r) => ({
      id: r.id,
      label: r.label,
      percentage: r.percentage,
      sortOrder: r.sortOrder,
    }));

    const types: DiscountTypeRow[] = typeRows.map((r) => ({
      id: r.id,
      value: r.value,
      label: r.label,
      description: r.description,
      sortOrder: r.sortOrder,
    }));

    return NextResponse.json({ tiers, types });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const gate = requireRole(user!, "Manager");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as { tiers?: DiscountTierRow[]; types?: DiscountTypeRow[] };

  if (!b || typeof b !== "object") {
    return NextResponse.json({ error: "Body must be { tiers?, types? }" }, { status: 400 });
  }

  // Validate tiers if provided
  if ("tiers" in b) {
    if (!Array.isArray(b.tiers)) {
      return NextResponse.json({ error: "tiers must be an array" }, { status: 400 });
    }
    for (const t of b.tiers!) {
      if (typeof t.label !== "string" || !t.label.trim()) {
        return NextResponse.json({ error: `Tier label is required: ${JSON.stringify(t)}` }, { status: 400 });
      }
      if (typeof t.percentage !== "number" || t.percentage < 0 || t.percentage > 100) {
        return NextResponse.json({ error: `Tier percentage must be 0–100: ${JSON.stringify(t)}` }, { status: 400 });
      }
    }
  }

  // Validate types if provided
  if ("types" in b) {
    if (!Array.isArray(b.types)) {
      return NextResponse.json({ error: "types must be an array" }, { status: 400 });
    }
    for (const t of b.types!) {
      if (typeof t.value !== "string" || !t.value.trim()) {
        return NextResponse.json({ error: `Type value is required: ${JSON.stringify(t)}` }, { status: 400 });
      }
      if (typeof t.label !== "string" || !t.label.trim()) {
        return NextResponse.json({ error: `Type label is required: ${JSON.stringify(t)}` }, { status: 400 });
      }
    }
  }

  const now = new Date().toISOString();

  try {
      const hasTiers = "tiers" in b && Array.isArray(b.tiers);
    const hasTypes = "types" in b && Array.isArray(b.types);

    if (!hasTiers && !hasTypes) {
      return NextResponse.json({ error: "Body must include tiers and/or types" }, { status: 400 });
    }

    if (hasTiers) {
      const incomingTiers = b.tiers!;
      await prisma.$transaction([
        prisma.discountTier.deleteMany(),
        prisma.discountTier.createMany({
          data: incomingTiers.map((t, i) => ({
            id: t.id || `tier-${i}`,
            label: t.label.trim(),
            percentage: t.percentage,
            sortOrder: typeof t.sortOrder === "number" ? t.sortOrder : i,
            createdAt: now,
            updatedAt: now,
          })),
        }),
      ]);
    }

    if (hasTypes) {
      const incomingTypes = b.types!;
      await prisma.$transaction([
        prisma.discountTypeOption.deleteMany(),
        prisma.discountTypeOption.createMany({
          data: incomingTypes.map((t, i) => ({
            id: t.id || `dtype-${i}`,
            value: t.value.trim(),
            label: t.label.trim(),
            description: typeof t.description === "string" ? t.description : "",
            sortOrder: typeof t.sortOrder === "number" ? t.sortOrder : i,
            createdAt: now,
            updatedAt: now,
          })),
        }),
      ]);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
