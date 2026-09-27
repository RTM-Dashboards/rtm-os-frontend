// RTM OS — Service Catalogue API Route
//
// GET  /api/sales/service-catalog
//   Returns active services only (for selection lists in new proposals).
//   Add ?all=1 to include retired services (for admin/config views).
//   → { services: ServiceCatalogRow[] }
//
// POST /api/sales/service-catalog
//   Creates a new service.
//   Body: ServiceCatalogRow (without id — generated server-side as a slug)
//   → { service: ServiceCatalogRow }
//
// Auth: requires Manager or higher. Config data is sales-sensitive.
// Error shape: { error: string } — matches all other routes.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/auth";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ServiceCatalogRow {
  id: string;
  catalogId: string;
  label: string;
  description: string;
  quantityUnit: string;
  quantityOptions: number[];
  defaultQuantity: number;
  defaultMonthlyPrice: number;
  defaultSetupFee: number;
  minMonthlyPrice: number;
  maxMonthlyPrice: number;
  setupFeeEditable: boolean;
  department: string;
  isRecurring: boolean;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

function rowToApi(r: Awaited<ReturnType<typeof prisma.serviceCatalogItem.findUnique>>): ServiceCatalogRow {
  if (!r) throw new Error("null row");
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
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const gate = requireRole(user!, "Manager");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const all = req.nextUrl.searchParams.get("all") === "1";

  try {
    const rows = await prisma.serviceCatalogItem.findMany({
      where: all ? undefined : { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ services: rows.map(rowToApi) });
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

  const b = body as Record<string, unknown>;

  // Required fields
  const label = typeof b.label === "string" ? b.label.trim() : "";
  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }
  const id = typeof b.id === "string" && b.id.trim()
    ? b.id.trim()
    : label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Price validation: default must be within [min, max] when max > 0
  const defaultMonthlyPrice = typeof b.defaultMonthlyPrice === "number" ? b.defaultMonthlyPrice : 0;
  const minMonthlyPrice = typeof b.minMonthlyPrice === "number" ? b.minMonthlyPrice : 0;
  const maxMonthlyPrice = typeof b.maxMonthlyPrice === "number" ? b.maxMonthlyPrice : 0;
  if (maxMonthlyPrice > 0 && (defaultMonthlyPrice < minMonthlyPrice || defaultMonthlyPrice > maxMonthlyPrice)) {
    return NextResponse.json(
      { error: `defaultMonthlyPrice (${defaultMonthlyPrice}) must be between minMonthlyPrice (${minMonthlyPrice}) and maxMonthlyPrice (${maxMonthlyPrice})` },
      { status: 400 }
    );
  }

  // Determine sortOrder: one past the current max
  let sortOrder = typeof b.sortOrder === "number" ? b.sortOrder : 0;
  if (!("sortOrder" in b)) {
    try {
      const max = await prisma.serviceCatalogItem.aggregate({ _max: { sortOrder: true } });
      sortOrder = (max._max.sortOrder ?? -1) + 1;
    } catch {
      sortOrder = 999;
    }
  }

  const now = new Date().toISOString();

  try {
    const existing = await prisma.serviceCatalogItem.findUnique({ where: { id } });
    if (existing) {
      return NextResponse.json({ error: `Service id "${id}" already exists` }, { status: 409 });
    }

    const created = await prisma.serviceCatalogItem.create({
      data: {
        id,
        catalogId: typeof b.catalogId === "string" ? b.catalogId : "",
        label,
        description: typeof b.description === "string" ? b.description : "",
        quantityUnit: typeof b.quantityUnit === "string" ? b.quantityUnit : "flat",
        quantityOptions: Array.isArray(b.quantityOptions) ? (b.quantityOptions as number[]) : [1],
        defaultQuantity: typeof b.defaultQuantity === "number" ? b.defaultQuantity : 1,
        defaultMonthlyPrice,
        defaultSetupFee: typeof b.defaultSetupFee === "number" ? b.defaultSetupFee : 0,
        minMonthlyPrice,
        maxMonthlyPrice,
        setupFeeEditable: typeof b.setupFeeEditable === "boolean" ? b.setupFeeEditable : false,
        department: typeof b.department === "string" ? b.department : "",
        isRecurring: typeof b.isRecurring === "boolean" ? b.isRecurring : true,
        isActive: true,
        isDefault: typeof b.isDefault === "boolean" ? b.isDefault : false,
        sortOrder,
        createdAt: now,
        updatedAt: now,
      },
    });

    return NextResponse.json({ service: rowToApi(created) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
