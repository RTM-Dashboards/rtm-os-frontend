// RTM OS — Bank Details API Route
//
// GET   /api/bank-details  → read the singleton row (id=1)
// PATCH /api/bank-details  → update the singleton row
//
// ── Gate ─────────────────────────────────────────────────────────────────────
//
//   requireDepartment(user, "Billing", "Manager")
//
//   This admits:
//     SystemAdmin    — any department (rank >= Executive)
//     Executive      — any department (rank >= Executive)
//     Billing Manager — department === "Billing" AND rank >= Manager
//
//   This refuses:
//     Billing Member         — rank < Manager
//     Sales Manager          — wrong department
//     Account Mgmt Manager   — wrong department
//     Manager with no dept   — department === null, condition B never matches
//     Any unauthenticated    — no session
//
// ── Why separate from company_config? ─────────────────────────────────────────
//
//   company_config holds how RTM presents itself (logo, address, legal name).
//   Its gate is Executive because Executives own the company identity.
//
//   bank_details holds how RTM gets paid. Cath (Billing Manager) maintains
//   these details. Executives and SystemAdmins also pass (they outrank the gate)
//   but the editor lives under /billing/bank-details, not /settings/organization.
//
// ── No account number in error responses ─────────────────────────────────────
//
//   Error paths never fetch the row, so there is nothing to leak.
//   Successful responses return the full row (the caller passed the gate).
//   The route does NOT log account_number at any level — no console.log, no
//   String() coercion of the row for an error message.
//
// ── Singleton enforcement ─────────────────────────────────────────────────────
//
//   The row is upserted (id=1). The CHECK constraint in the migration prevents
//   any second row at the database level.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireDepartment } from "@/lib/auth";

// ── Safe row shape returned to callers ───────────────────────────────────────

export interface BankDetailsRow {
  id:            number;
  accountHolder: string;
  bankName:      string;
  routingNumber: string;
  accountNumber: string;
  swiftCode:     string;
  updatedAt:     string;
}

function rowToRecord(row: {
  id:            number;
  accountHolder: string;
  bankName:      string;
  routingNumber: string;
  accountNumber: string;
  swiftCode:     string;
  createdAt:     string;
  updatedAt:     string;
}): BankDetailsRow {
  return {
    id:            row.id,
    accountHolder: row.accountHolder,
    bankName:      row.bankName,
    routingNumber: row.routingNumber,
    accountNumber: row.accountNumber,
    swiftCode:     row.swiftCode,
    updatedAt:     row.updatedAt,
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });

  const gate = requireDepartment(user!, "Billing", "Manager");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const row = await prisma.bankDetails.findUnique({ where: { id: 1 } });

    if (!row) {
      // No row yet — return empty defaults rather than 404 so the editor
      // renders a blank form. The PATCH upserts on save.
      const empty: BankDetailsRow = {
        id:            1,
        accountHolder: "",
        bankName:      "",
        routingNumber: "",
        accountNumber: "",
        swiftCode:     "",
        updatedAt:     "",
      };
      return NextResponse.json({ bankDetails: empty });
    }

    return NextResponse.json({ bankDetails: rowToRecord(row) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });

  const gate = requireDepartment(user!, "Billing", "Manager");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const patch = body as Partial<{
    accountHolder: string;
    bankName:      string;
    routingNumber: string;
    accountNumber: string;
    swiftCode:     string;
  }>;

  // At least one field required.
  if (
    patch.accountHolder === undefined &&
    patch.bankName      === undefined &&
    patch.routingNumber === undefined &&
    patch.accountNumber === undefined &&
    patch.swiftCode     === undefined
  ) {
    return NextResponse.json(
      { error: "Body must include at least one of: accountHolder, bankName, routingNumber, accountNumber, swiftCode." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = { updatedAt: now };
  if (patch.accountHolder !== undefined) data.accountHolder = patch.accountHolder;
  if (patch.bankName      !== undefined) data.bankName      = patch.bankName;
  if (patch.routingNumber !== undefined) data.routingNumber = patch.routingNumber;
  if (patch.accountNumber !== undefined) data.accountNumber = patch.accountNumber;
  if (patch.swiftCode     !== undefined) data.swiftCode     = patch.swiftCode;

  try {
    const updated = await prisma.bankDetails.upsert({
      where:  { id: 1 },
      create: {
        id:            1,
        accountHolder: data.accountHolder ?? "",
        bankName:      data.bankName      ?? "",
        routingNumber: data.routingNumber ?? "",
        accountNumber: data.accountNumber ?? "",
        swiftCode:     data.swiftCode     ?? "",
        createdAt:     now,
        updatedAt:     now,
      },
      update: data,
    });
    return NextResponse.json({ bankDetails: rowToRecord(updated) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
