// RTM OS — Import Existing Client API
//
// POST /api/account-management/import-client
//
// Creates a Client + Business + Project + categories + recurring tasks for an
// existing client being migrated from Teamwork. No invoice, no handoff, no
// contract row, no setup tasks.
//
// ── WHO CAN CALL THIS ─────────────────────────────────────────────────────────
//   requireDepartment(user, "Account Management", "Member")
//   — any active Account Management member passes.
//   — Executives and SystemAdmins pass too (condition A in requireDepartment).
//   — Billing members, Sales, etc. are refused.
//
// ── WHAT IS CREATED ───────────────────────────────────────────────────────────
//   1. Client    — contact name/email/phone, company, address.
//   2. Business  — domain (normalised, unique), monthly value, cleared=true,
//                  billingStatus="Cleared", activationStatus="active",
//                  assignedAM=<chosen id>, contractRef=<number>.
//   3. Project   — one per business, startDate=today, endDate=null,
//                  assignedAM=<chosen id> (not by workload).
//   4. ProjectCategory — one per service, department from catalogue.
//   5. Tasks     — ONLY recurring tasks from the service's template.
//                  NO setup tasks.
//
// ── WHAT IS NOT CREATED ───────────────────────────────────────────────────────
//   - No Invoice row.
//   - No SalesHandoff row.
//   - No Contract row.
//   - No setup tasks.
//
// ── DUPLICATE DOMAIN GUARD ────────────────────────────────────────────────────
//   If a Business already exists for the normalised domain, the request is
//   refused with HTTP 409 and a message naming the existing client.
//
// ── ERROR SHAPE ──────────────────────────────────────────────────────────────
//   { error: string }   — on validation or business logic failure
//   { result: ImportResult } — on success (includes partial-failure details)
//
// ── CONVENTIONS ──────────────────────────────────────────────────────────────
//   - No Zod. Validation is manual.
//   - No Prisma enums.
//   - id generation: same pattern as other routes — `prefix-${Date.now()}-${random}`.
//   - Error shape: { error: string } matching all other routes.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireDepartment } from "@/lib/auth";
import { normalizeDomain } from "@/lib/clients/domain";
import { launchProject, type LaunchResult } from "@/lib/projects/launch";

// ── Body shape ────────────────────────────────────────────────────────────────

interface ImportClientBody {
  // Client contact
  contactName:  string;
  contactEmail: string;
  contactPhone: string;
  company:      string;

  // Address (six discrete fields)
  addressStreet:  string;
  addressSuite:   string;
  addressCity:    string;
  addressState:   string;
  addressZip:     string;
  addressCountry: string;

  // Business
  domain:            string;
  monthlyValueCents: number;
  contractRef:       string;

  // Services (catalogue ids)
  serviceIds: string[];

  // AM chosen on the form (not by workload)
  assignedAMId: string;
}

// ── Response shape ────────────────────────────────────────────────────────────

export interface ImportResult {
  clientId:   string;
  businessId: string;
  launch:     LaunchResult;
}

// ── Helper ───────────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth gate ──────────────────────────────────────────────────────────────
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });

  const deptGate = requireDepartment(user!, "Account Management", "Member");
  if (deptGate) return NextResponse.json({ error: deptGate.error }, { status: deptGate.status });

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Partial<ImportClientBody>;

  // ── Validate ───────────────────────────────────────────────────────────────
  if (!b.domain || typeof b.domain !== "string" || b.domain.trim() === "") {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }
  if (typeof b.monthlyValueCents !== "number" || !Number.isFinite(b.monthlyValueCents) || b.monthlyValueCents < 0) {
    return NextResponse.json({ error: "monthlyValueCents must be a non-negative number" }, { status: 400 });
  }
  if (!Array.isArray(b.serviceIds) || b.serviceIds.length === 0) {
    return NextResponse.json({ error: "At least one service must be selected" }, { status: 400 });
  }
  if (!b.assignedAMId || typeof b.assignedAMId !== "string") {
    return NextResponse.json({ error: "assignedAMId is required" }, { status: 400 });
  }
  if (!b.company || typeof b.company !== "string" || b.company.trim() === "") {
    return NextResponse.json({ error: "company (business name) is required" }, { status: 400 });
  }

  const domain = normalizeDomain(b.domain);
  if (!domain) {
    return NextResponse.json({ error: "domain normalised to empty — supply a valid domain" }, { status: 400 });
  }

  // ── Duplicate domain guard ────────────────────────────────────────────────
  // Find existing business + its client so the error message names the client.
  const existingBiz = await prisma.business.findFirst({ where: { domain } });
  if (existingBiz) {
    let existingClientName = existingBiz.displayName || domain;
    if (existingBiz.clientId) {
      const existingClient = await prisma.client.findUnique({
        where: { id: existingBiz.clientId },
        select: { fullName: true, company: true },
      });
      if (existingClient) {
        existingClientName =
          existingClient.fullName ||
          existingClient.company  ||
          existingClientName;
      }
    }
    return NextResponse.json(
      {
        error: `Domain "${domain}" is already in use by ${existingClientName} (business id: ${existingBiz.id}). Duplicate domains are not allowed.`,
      },
      { status: 409 },
    );
  }

  // ── Resolve AM name ───────────────────────────────────────────────────────
  const amUser = await prisma.user.findUnique({
    where: { id: b.assignedAMId },
    select: { id: true, name: true, department: true, status: true },
  });
  if (!amUser || amUser.status !== "active") {
    return NextResponse.json(
      { error: `Assigned AM (id: ${b.assignedAMId}) not found or not active` },
      { status: 400 },
    );
  }

  // ── Resolve service catalogue items ──────────────────────────────────────
  const catalogItems = await prisma.serviceCatalogItem.findMany({
    where: { id: { in: b.serviceIds } },
    select: { id: true, label: true, department: true },
  });

  const lineItems = b.serviceIds.map((sid) => {
    const cat = catalogItems.find((c) => c.id === sid);
    return {
      serviceId:  sid,
      label:      cat?.label      ?? sid,
      department: cat?.department ?? "",
    };
  });

  const now = new Date().toISOString();

  // ── Step 1: Create the Client ─────────────────────────────────────────────
  const clientId = makeId("client");
  try {
    await prisma.client.create({
      data: {
        id:         clientId,
        fullName:   (b.contactName?.trim()) || b.company!.trim(),
        email:      b.contactEmail?.trim()  ?? "",
        phone:      b.contactPhone?.trim()  ?? "",
        company:    b.company!.trim(),
        assignedAM: amUser.id,
        address: {
          street:  b.addressStreet?.trim()  ?? "",
          suite:   b.addressSuite?.trim()   ?? "",
          city:    b.addressCity?.trim()    ?? "",
          state:   b.addressState?.trim()   ?? "",
          zip:     b.addressZip?.trim()     ?? "",
          country: b.addressCountry?.trim() ?? "",
        },
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Client creation failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }

  // ── Step 2: Create the Business ───────────────────────────────────────────
  //
  // Field choices that keep this business OUT of every Billing queue:
  //
  //   billingStatus = "Cleared"   → isInvoiceCleared() in activation page requires
  //                                  (Cleared || (Paid && paymentStatus=Paid)) && !cleared.
  //                                  cleared=true short-circuits that predicate immediately.
  //   cleared = true              → the direct disqualifier from the activation queue.
  //   invoiceStatus = "none"      → /api/invoices?overdue=true requires invoiceStatus
  //                                  IN [Sent, Viewed, Overdue, Escalated, Partially Paid].
  //                                  "none" is excluded → Collections page never shows it.
  //   paymentStatus = "none"      → reinforces no-invoice state.
  //   activationStatus = "active" → client is already live; AM can see it as active.
  //   onboardingStatus = "complete" → client is already onboarded.
  //   activeServices              → the service ids chosen on the form.
  //
  // The business will NOT appear in:
  //   - Billing activation queue (cleared=true disqualifies it)
  //   - Collections (invoiceStatus="none" is not in the overdue filter)
  //   - Invoices page (no Invoice row exists for this business)

  const businessId = makeId("biz");
  try {
    await prisma.business.create({
      data: {
        id:                 businessId,
        domain,
        displayName:        b.company!.trim(),
        clientId,
        invoiceStatus:      "none",
        paymentStatus:      "none",
        invoiceAmountCents: 0,
        subscriptionRef:    null,
        cancellationStatus: "None",
        billingStatus:      "Cleared",
        assignedAM:         amUser.id,
        activationStatus:   "active",
        onboardingStatus:   "complete",
        activeServices:     b.serviceIds,
        monthlyValueCents:  Math.round(b.monthlyValueCents),
        renewalDate:        null,
        renewalStatus:      "ok",
        cleared:            true,
        kickoffCompleted:   true,
        kickoffDate:        null,
        assignedAt:         now,
        ghlOpportunityId:   null,
        contractRef:        b.contractRef?.trim() ?? "",
        createdAt:          now,
        updatedAt:          now,
      },
    });
  } catch (err) {
    // Clean up the client we just created so the AM can retry cleanly.
    await prisma.client.delete({ where: { id: clientId } }).catch(() => {/* best-effort */});
    return NextResponse.json(
      { error: `Business creation failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }

  // ── Step 3: Launch the project (categories + recurring tasks only) ────────
  //
  // We reuse launchProject with importOptions so the task-creation engine
  // (template lookup, recurring task logic, workload routing for task owners,
  // dep insertion) is not duplicated. importOptions instructs it to:
  //   - Use our lineItems (not handoff lookup)
  //   - Use the form-chosen AM (not workload routing for AM)
  //   - Skip setup tasks entirely
  const launchResult = await launchProject(businessId, {
    lineItems,
    assignedAMId:  amUser.id,
    assignedAMName: amUser.name,
    skipSetupTasks: true,
  });

  const result: ImportResult = {
    clientId,
    businessId,
    launch: launchResult,
  };

  return NextResponse.json({ result }, { status: 201 });
}
