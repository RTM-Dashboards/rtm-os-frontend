// RTM OS — Packages API Route
//
// GET  /api/sales/packages
//   Returns all packages with their items. By default only isActive=true.
//   Add ?all=1 to include inactive packages (for admin/restore views).
//   → { packages: PackageRow[] }
//
// POST /api/sales/packages
//   Creates a new package with its items.
//   Body: PackageRow (without id — generated server-side)
//   → { package: PackageRow }
//
// Auth (GET):  requireDepartment(user, "Sales", "Member")
//   Sales Members, Managers, Executives, and SystemAdmins pass.
//   Every other department is denied.
// Auth (POST): requireDepartment(user, "Sales", "Manager")
//   Sales Managers, Executives, and SystemAdmins pass.
//   Sales Members and all other departments are denied.
//
// requireDepartment behaviour for Executive and SystemAdmin:
//   Both pass condition A (userRank >= executiveRank) regardless of department.
//   They are never denied by this gate. Quoted from lib/auth/index.ts:
//     "Condition A: Executive and above pass regardless of department."
//
// Error shape: { error: string } — matches all other routes.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireDepartment } from "@/lib/auth";
import { requireDept } from "@/lib/auth/vocab";
import type { Prisma } from "@prisma/client";

// Dept constant — throws at module load if "Sales" is ever removed from VALID_DEPARTMENTS.
const SALES = requireDept("Sales");

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PackageItemRow {
  id:        string;
  packageId: string;
  serviceId: string;
  position:  number;
  quantity:  number;
}

export interface PackageRow {
  id:               string;
  name:             string;
  code:             string;
  price:            number;
  billingFrequency: string;
  description:      string;
  recommendedFor:   string[];
  minBudget:        number;
  maxBudget:        number;
  isActive:         boolean;
  isFeatured:       boolean;
  createdAt:        string;
  updatedAt:        string;
  createdByUserId:  string | null;
  items:            PackageItemRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type PrismaPackageWithItems = Prisma.PackageGetPayload<{ include: { items: true } }>;

function rowToApi(r: PrismaPackageWithItems): PackageRow {
  return {
    id:               r.id,
    name:             r.name,
    code:             r.code,
    price:            r.price,
    billingFrequency: r.billingFrequency,
    description:      r.description,
    recommendedFor:   r.recommendedFor,
    minBudget:        r.minBudget,
    maxBudget:        r.maxBudget,
    isActive:         r.isActive,
    isFeatured:       r.isFeatured,
    createdAt:        r.createdAt,
    updatedAt:        r.updatedAt,
    createdByUserId:  r.createdByUserId,
    items:            r.items
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        id:        item.id,
        packageId: item.packageId,
        serviceId: item.serviceId,
        position:  item.position,
        quantity:  item.quantity,
      })),
  };
}

// Generate a URL-safe id from a name string.
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  // Reads require Sales department (or Executive / SystemAdmin via condition A).
  // Copied from: requireDepartment usage in lib/auth/index.ts; pattern mirrored
  // from how service-catalog applies requireRole on GET.
  const deptGate = requireDepartment(user!, SALES, "Member");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  const all = req.nextUrl.searchParams.get("all") === "1";

  try {
    const rows = await prisma.package.findMany({
      where:   all ? undefined : { isActive: true },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ packages: rows.map(rowToApi) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  // Writes require Sales Manager or higher (Executive / SystemAdmin pass via condition A).
  // Pattern copied from requireRole(user!, "Manager") in service-catalog/route.ts,
  // upgraded to requireDepartment to scope writes to the Sales department.
  const deptGate = requireDepartment(user!, SALES, "Manager");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  // ── Required fields ───────────────────────────────────────────────────────
  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const code = typeof b.code === "string" && b.code.trim()
    ? b.code.trim().toUpperCase()
    : slugify(name).toUpperCase();

  // ── Items ─────────────────────────────────────────────────────────────────
  const rawItems = Array.isArray(b.items) ? (b.items as unknown[]) : [];
  const parsedItems: { serviceId: string; position: number; quantity: number }[] = [];
  for (let i = 0; i < rawItems.length; i++) {
    const it = rawItems[i];
    if (typeof it !== "object" || it === null) {
      return NextResponse.json({ error: `items[${i}]: must be an object` }, { status: 400 });
    }
    const itObj = it as Record<string, unknown>;
    const serviceId = typeof itObj.serviceId === "string" ? itObj.serviceId.trim() : "";
    if (!serviceId) return NextResponse.json({ error: `items[${i}]: serviceId is required` }, { status: 400 });
    const quantity = typeof itObj.quantity === "number" && itObj.quantity > 0 ? itObj.quantity : 1;
    parsedItems.push({ serviceId, position: i, quantity });
  }

  // ── Validate every serviceId exists in service_catalog_items ─────────────
  if (parsedItems.length > 0) {
    const serviceIds = parsedItems.map((it) => it.serviceId);
    const found = await prisma.serviceCatalogItem.findMany({
      where:  { id: { in: serviceIds } },
      select: { id: true },
    });
    const foundSet = new Set(found.map((f) => f.id));
    const missing = serviceIds.find((sid) => !foundSet.has(sid));
    if (missing) {
      return NextResponse.json(
        { error: `serviceId "${missing}" does not exist in service_catalog_items` },
        { status: 400 }
      );
    }
  }

  // ── Duplicate code check ──────────────────────────────────────────────────
  const existing = await prisma.package.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: `Package code "${code}" already exists` }, { status: 409 });
  }

  const now = new Date().toISOString();
  const id  = `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  try {
    const created = await prisma.package.create({
      data: {
        id,
        name,
        code,
        price:            typeof b.price === "number"            ? b.price            : 0,
        billingFrequency: typeof b.billingFrequency === "string" ? b.billingFrequency : "",
        description:      typeof b.description === "string"      ? b.description      : "",
        recommendedFor:   Array.isArray(b.recommendedFor)
          ? (b.recommendedFor as string[]).filter((s) => typeof s === "string")
          : [],
        minBudget:   typeof b.minBudget === "number"  ? b.minBudget  : 0,
        maxBudget:   typeof b.maxBudget === "number"  ? b.maxBudget  : 0,
        isActive:    typeof b.isActive === "boolean"  ? b.isActive   : true,
        isFeatured:  typeof b.isFeatured === "boolean" ? b.isFeatured : false,
        createdAt:   now,
        updatedAt:   now,
        createdByUserId: user!.id,
        items: {
          create: parsedItems.map((it, idx) => ({
            id:        `pi-${id}-${idx}`,
            serviceId: it.serviceId,
            position:  it.position,
            quantity:  it.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ package: rowToApi(created) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
