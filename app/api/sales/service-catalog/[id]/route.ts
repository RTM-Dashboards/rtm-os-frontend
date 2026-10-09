// RTM OS — Service Catalogue Single-Item Route
//
// GET   /api/sales/service-catalog/:id
//   Returns one service by id, including retired (isActive=false) services.
//   This is the key contract for old proposal rendering: a retired service
//   must still resolve its id so old line items display a name and price.
//   → { service: ServiceCatalogRow }
//
// PATCH /api/sales/service-catalog/:id
//   Updates any subset of fields on an existing service.
//   Soft-delete: set isActive=false. Restore: set isActive=true.
//   → { service: ServiceCatalogRow }
//
// Auth: Manager or higher for writes. GET is also gated (config data).
// Error shape: { error: string } — matches all other routes.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/auth";
import { VALID_DEPARTMENTS } from "@/lib/auth/vocab";
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

function rowToApi(r: NonNullable<Awaited<ReturnType<typeof prisma.serviceCatalogItem.findUnique>>>): ServiceCatalogRow {
  return {
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
  };
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const gate = requireRole(user!, "Manager");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await params;

  try {
    const row = await prisma.serviceCatalogItem.findUnique({ where: { id } });
    if (!row) {
      return NextResponse.json({ error: `Service "${id}" not found` }, { status: 404 });
    }
    return NextResponse.json({ service: rowToApi(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const gate = requireRole(user!, "Manager");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  try {
    const existing = await prisma.serviceCatalogItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: `Service "${id}" not found` }, { status: 404 });
    }

    // Price consistency check: if caller sets any of the three price fields,
    // validate the result will not create a contradictory state.
    const newDefault = typeof b.defaultMonthlyPrice === "number" ? b.defaultMonthlyPrice : existing.defaultMonthlyPrice;
    const newMin = typeof b.minMonthlyPrice === "number" ? b.minMonthlyPrice : existing.minMonthlyPrice;
    const newMax = typeof b.maxMonthlyPrice === "number" ? b.maxMonthlyPrice : existing.maxMonthlyPrice;
    if (newMax > 0 && (newDefault < newMin || newDefault > newMax)) {
      return NextResponse.json(
        { error: `defaultMonthlyPrice (${newDefault}) must be between minMonthlyPrice (${newMin}) and maxMonthlyPrice (${newMax})` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Build update data from only the keys present in the body.
    // This lets callers send partial patches (e.g. just isActive=false to retire).
    const data: Record<string, unknown> = { updatedAt: now };
    const patchableFields = [
      "catalogId", "label", "description", "quantityUnit", "quantityOptions",
      "defaultQuantity", "defaultMonthlyPrice", "defaultSetupFee",
      "minMonthlyPrice", "maxMonthlyPrice", "setupFeeEditable",
      "department", "isRecurring", "isActive", "isDefault", "sortOrder",
      "deliverableGroups",
    ];
    for (const f of patchableFields) {
      if (f in b) {
        // Validate department against canonical list when it is being patched.
        if (f === "department") {
          const d = typeof b[f] === "string" ? (b[f] as string).trim() : "";
          if (!VALID_DEPARTMENTS.includes(d as (typeof VALID_DEPARTMENTS)[number])) {
            return NextResponse.json(
              { error: `department "${d}" is not one of the ${VALID_DEPARTMENTS.length} valid departments` },
              { status: 400 },
            );
          }
          data[f] = d;
        } else {
          data[f] = b[f];
        }
      }
    }

    const updated = await prisma.serviceCatalogItem.update({ where: { id }, data });
    return NextResponse.json({ service: rowToApi(updated) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
