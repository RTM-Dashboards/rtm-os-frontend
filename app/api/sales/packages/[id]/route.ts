// RTM OS — Packages Single-Item Route
//
// GET   /api/sales/packages/:id
//   Returns one package by id, including inactive (isActive=false) packages.
//   This is the key contract for future proposal rendering: a deactivated package
//   must still resolve its id so old proposals can display its name and price.
//   → { package: PackageRow }
//
// PATCH /api/sales/packages/:id
//   Updates any subset of fields on an existing package.
//   Soft-delete: set isActive=false. Restore: set isActive=true.
//   Items may be replaced wholesale by sending an `items` array.
//   → { package: PackageRow }
//
// Auth: same department gate as the collection route.
//   GET:   requireDepartment(user, "Sales", "Member")
//   PATCH: requireDepartment(user, "Sales", "Manager")
//
// PATCH allow-list: only the named columns below are patchable.
// An unknown field in the request body returns 400. This prevents injection.
// Pattern copied directly from the patchableFields allow-list in
// app/api/sales/service-catalog/[id]/route.ts.
//
// Error shape: { error: string } — matches all other routes.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireDepartment } from "@/lib/auth";
import { requireDept } from "@/lib/auth/vocab";
import type { PackageRow, PackageItemRow } from "../route";
import type { Prisma } from "@prisma/client";

const SALES = requireDept("Sales");

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
      .map((item): PackageItemRow => ({
        id:        item.id,
        packageId: item.packageId,
        serviceId: item.serviceId,
        position:  item.position,
        quantity:  item.quantity,
      })),
  };
}

// ─── PATCH allow-list ─────────────────────────────────────────────────────────
// Exactly the fields that may be patched. Any key in the request body that is
// NOT in this set causes an immediate 400. This is a fixed compile-time list;
// it never iterates the request body for column names.
// Copied from the patchableFields pattern in service-catalog/[id]/route.ts.
const PATCHABLE_FIELDS = new Set([
  "name",
  "code",
  "price",
  "billingFrequency",
  "billingfrequency",   // accept camelCase variants
  "description",
  "recommendedFor",
  "recommendedfor",
  "minBudget",
  "minbudget",
  "maxBudget",
  "maxbudget",
  "isActive",
  "isactive",
  "isFeatured",
  "isfeatured",
  "items",              // items array replacement is handled separately
]);

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const deptGate = requireDepartment(user!, SALES, "Member");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  const { id } = await params;

  try {
    // findUnique includes inactive — same contract as service-catalog/[id]/route.ts
    // so deactivated packages still resolve for future proposal rendering.
    const row = await prisma.package.findUnique({
      where:   { id },
      include: { items: true },
    });
    if (!row) return NextResponse.json({ error: `Package "${id}" not found` }, { status: 404 });
    return NextResponse.json({ package: rowToApi(row) });
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

  const deptGate = requireDepartment(user!, SALES, "Manager");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  // ── Allow-list check ─────────────────────────────────────────────────────
  // Reject immediately if the caller sent any field not on the allow-list.
  for (const key of Object.keys(b)) {
    if (!PATCHABLE_FIELDS.has(key)) {
      return NextResponse.json(
        { error: `Unknown field "${key}": PATCH only accepts named columns from the allow-list` },
        { status: 400 }
      );
    }
  }

  try {
    const existing = await prisma.package.findUnique({ where: { id }, include: { items: true } });
    if (!existing) return NextResponse.json({ error: `Package "${id}" not found` }, { status: 404 });

    const now = new Date().toISOString();
    const data: Record<string, unknown> = { updatedAt: now };

    if ("name"             in b && typeof b.name === "string")             data.name             = b.name.trim();
    if ("code"             in b && typeof b.code === "string")             data.code             = b.code.trim().toUpperCase();
    if ("price"            in b && typeof b.price === "number")            data.price            = b.price;
    if ("billingFrequency" in b && typeof b.billingFrequency === "string") data.billingFrequency = b.billingFrequency;
    if ("billingfrequency" in b && typeof b.billingfrequency === "string") data.billingFrequency = b.billingfrequency;
    if ("description"      in b && typeof b.description === "string")      data.description      = b.description;
    if ("recommendedFor"   in b && Array.isArray(b.recommendedFor))        data.recommendedFor   = (b.recommendedFor as string[]).filter((s) => typeof s === "string");
    if ("recommendedfor"   in b && Array.isArray(b.recommendedfor))        data.recommendedFor   = (b.recommendedfor as string[]).filter((s) => typeof s === "string");
    if ("minBudget"        in b && typeof b.minBudget === "number")        data.minBudget        = b.minBudget;
    if ("minbudget"        in b && typeof b.minbudget === "number")        data.minBudget        = b.minbudget;
    if ("maxBudget"        in b && typeof b.maxBudget === "number")        data.maxBudget        = b.maxBudget;
    if ("maxbudget"        in b && typeof b.maxbudget === "number")        data.maxBudget        = b.maxbudget;
    if ("isActive"         in b && typeof b.isActive === "boolean")        data.isActive         = b.isActive;
    if ("isactive"         in b && typeof b.isactive === "boolean")        data.isActive         = b.isactive;
    if ("isFeatured"       in b && typeof b.isFeatured === "boolean")      data.isFeatured       = b.isFeatured;
    if ("isfeatured"       in b && typeof b.isfeatured === "boolean")      data.isFeatured       = b.isfeatured;

    // ── Items replacement ─────────────────────────────────────────────────
    // When items is provided, validate all serviceIds then replace wholesale.
    let newItems: { serviceId: string; position: number; quantity: number }[] | null = null;
    if ("items" in b && Array.isArray(b.items)) {
      const rawItems = b.items as unknown[];
      const parsed: { serviceId: string; position: number; quantity: number }[] = [];
      for (let i = 0; i < rawItems.length; i++) {
        const it = rawItems[i];
        if (typeof it !== "object" || it === null) {
          return NextResponse.json({ error: `items[${i}]: must be an object` }, { status: 400 });
        }
        const itObj = it as Record<string, unknown>;
        const serviceId = typeof itObj.serviceId === "string" ? itObj.serviceId.trim() : "";
        if (!serviceId) return NextResponse.json({ error: `items[${i}]: serviceId is required` }, { status: 400 });
        const quantity = typeof itObj.quantity === "number" && itObj.quantity > 0 ? itObj.quantity : 1;
        parsed.push({ serviceId, position: i, quantity });
      }

      // Validate serviceIds
      if (parsed.length > 0) {
        const serviceIds = parsed.map((it) => it.serviceId);
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
      newItems = parsed;
    }

    // ── Code uniqueness check ─────────────────────────────────────────────
    if (data.code && data.code !== existing.code) {
      const conflict = await prisma.package.findUnique({ where: { code: data.code as string } });
      if (conflict) {
        return NextResponse.json({ error: `Package code "${data.code as string}" already exists` }, { status: 409 });
      }
    }

    // ── Atomic update: header + items ─────────────────────────────────────
    if (newItems !== null) {
      await prisma.$transaction(async (tx) => {
        await tx.package.update({ where: { id }, data });
        await tx.packageItem.deleteMany({ where: { packageId: id } });
        if (newItems!.length > 0) {
          await tx.packageItem.createMany({
            data: newItems!.map((it, idx) => ({
              id:        `pi-${id}-patch-${Date.now()}-${idx}`,
              packageId: id,
              serviceId: it.serviceId,
              position:  it.position,
              quantity:  it.quantity,
            })),
          });
        }
      });
    } else {
      await prisma.package.update({ where: { id }, data });
    }

    const updated = await prisma.package.findUnique({ where: { id }, include: { items: true } });
    return NextResponse.json({ package: rowToApi(updated!) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
