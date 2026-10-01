// RTM OS — Service Catalogue by-department lookup
//
// GET /api/sales/service-catalog/by-department?departments=SEO,GBP
//   Returns active services whose department is in the requested list.
//   Ordered by sortOrder asc.
//   → { services: ServiceCatalogRow[] }
//
// Used by Step 3 Recommendations fallback when no audit findings exist.
// Auth: requires Manager or higher (same as the parent catalogue route).
// Error shape: { error: string }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/auth";
import type { ServiceCatalogRow, DeliverableGroup } from "../route";

function parseGroups(raw: unknown): DeliverableGroup[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((g): g is { heading: unknown; bullets: unknown } => g !== null && typeof g === "object")
    .map((g) => ({
      heading: typeof g.heading === "string" ? g.heading : "",
      bullets: Array.isArray(g.bullets)
        ? g.bullets.filter((b): b is string => typeof b === "string")
        : [],
    }));
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const gate = requireRole(user!, "Manager");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const raw = req.nextUrl.searchParams.get("departments") ?? "";
  const departments = raw
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  if (departments.length === 0) {
    return NextResponse.json({ services: [] });
  }

  try {
    const rows = await prisma.serviceCatalogItem.findMany({
      where: {
        isActive: true,
        department: { in: departments },
      },
      orderBy: { sortOrder: "asc" },
    });

    const services: ServiceCatalogRow[] = rows.map((r) => ({
      id: r.id,
      catalogId: r.catalogId,
      label: r.label,
      description: r.description,
      quantityUnit: r.quantityUnit,
      quantityOptions: r.quantityOptions,
      defaultQuantity: r.defaultQuantity,
      defaultMonthlyPrice: r.defaultMonthlyPrice,
      defaultSetupFee: r.defaultSetupFee,
      minMonthlyPrice: r.minMonthlyPrice,
      maxMonthlyPrice: r.maxMonthlyPrice,
      setupFeeEditable: r.setupFeeEditable,
      department: r.department,
      isRecurring: r.isRecurring,
      isActive: r.isActive,
      isDefault: r.isDefault,
      sortOrder: r.sortOrder,
      deliverableGroups: parseGroups(r.deliverableGroups),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json({ services });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
