// RTM OS — Company Config API Route
//
// GET  /api/company-config
//   Returns the single company config row.
//   → { config: CompanyConfigRow }
//
// PATCH /api/company-config
//   Updates any subset of the nine editable fields.
//   Body: Partial<CompanyConfigRow> (id is ignored if supplied).
//   → { config: CompanyConfigRow }
//
// Auth: requires Executive or higher. SystemAdmin passes by rank (4 > 3).
// A Manager (rank 2) is refused with 403.
// Error shape: { error: string } — matches all other routes.
//
// Single-row guarantee is enforced by the database (id=1 fixed PK + CHECK
// constraint). This route never creates a row; it only reads and updates id=1.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/auth";

// ─── Type ──────────────────────────────────────────────────────────────────────

export interface CompanyConfigRow {
  id: number;
  legalName: string;
  address: string;
  phone: string;
  supportEmail: string;
  logoUrl: string;
  defaultPaymentTerms: string;
  refundFooter: string;
  defaultTaxRate: number;
  taxExemptionText: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type PrismaRow = Awaited<ReturnType<typeof prisma.companyConfig.findUnique>>;

function rowToApi(r: NonNullable<PrismaRow>): CompanyConfigRow {
  return {
    id: r.id,
    legalName: r.legalName,
    address: r.address,
    phone: r.phone,
    supportEmail: r.supportEmail,
    logoUrl: r.logoUrl,
    defaultPaymentTerms: r.defaultPaymentTerms,
    refundFooter: r.refundFooter,
    // Prisma returns Decimal as a Decimal object; coerce to number.
    defaultTaxRate: Number(r.defaultTaxRate),
    taxExemptionText: r.taxExemptionText,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  // Executive (rank 3) or higher. SystemAdmin (rank 4) passes automatically.
  const gate = requireRole(user!, "Executive");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const row = await prisma.companyConfig.findUnique({ where: { id: 1 } });
    if (!row) {
      return NextResponse.json({ error: "Company config not found." }, { status: 404 });
    }
    return NextResponse.json({ config: rowToApi(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const gate = requireRole(user!, "Executive");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  // Build the update data from whatever the caller supplied.
  // Unknown keys are silently ignored.
  const data: Record<string, unknown> = {};

  if (typeof b.legalName === "string")           data.legalName           = b.legalName.trim();
  if (typeof b.address === "string")             data.address             = b.address.trim();
  if (typeof b.phone === "string")               data.phone               = b.phone.trim();
  if (typeof b.supportEmail === "string")        data.supportEmail        = b.supportEmail.trim();
  if (typeof b.logoUrl === "string")             data.logoUrl             = b.logoUrl.trim();
  if (typeof b.defaultPaymentTerms === "string") data.defaultPaymentTerms = b.defaultPaymentTerms.trim();
  if (typeof b.refundFooter === "string")        data.refundFooter        = b.refundFooter.trim();
  if (typeof b.taxExemptionText === "string")    data.taxExemptionText    = b.taxExemptionText.trim();

  if (typeof b.defaultTaxRate === "number") {
    if (b.defaultTaxRate < 0 || b.defaultTaxRate > 1) {
      return NextResponse.json(
        { error: "defaultTaxRate must be between 0 and 1 (e.g. 0.1 = 10%)." },
        { status: 400 }
      );
    }
    data.defaultTaxRate = b.defaultTaxRate;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No recognised fields supplied." }, { status: 400 });
  }

  data.updatedAt = new Date().toISOString();

  try {
    const updated = await prisma.companyConfig.update({
      where: { id: 1 },
      data,
    });
    return NextResponse.json({ config: rowToApi(updated) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
