// RTM OS — Master Clients API Route
//
// Persistence layer: Postgres table `master_clients`.
// Migrated from data/master-clients.json (fs.writeFileSync) which was silently
// discarded on every Vercel deploy.
//
// External shape is unchanged:
//   GET  /api/master-clients                → { clients: MasterClient[] }
//   GET  /api/master-clients?id=<id>        → { client: MasterClient } | 404
//   POST /api/master-clients                → body: MasterClient (upsert by id)
//                                             → { client }
//   PATCH /api/master-clients?id=<id>       → body: Partial<MasterClient>
//                                             → { client } | 404
//
// Auth guard: getSessionUser — matches the original file-backed route.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM master_clients WHERE id = $1 LIMIT 1`,
      id
    );
    if (rows.length === 0)
      return NextResponse.json({ error: "client not found" }, { status: 404 });
    return NextResponse.json({ client: rows[0] });
  }

  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT * FROM master_clients ORDER BY "createdAt" ASC`
  );
  return NextResponse.json({ clients: rows });
}

// ── POST — upsert a client record ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const body = (await req.json()) as Record<string, unknown>;
  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const now = new Date().toISOString();

  await prisma.$executeRawUnsafe(
    `INSERT INTO master_clients (
      id, slug, "clientName", industry, "assignedAM", email,
      "currentStatus", "workflowStatus", "salesStatus", "salesOwner",
      "billingStatus", "invoiceStatus", "paymentStatus",
      "cancellationStatus", "upgradeDowngradeStatus", cleared,
      "activationStatus", "onboardingStatus", "activeServices",
      "activationChecklist", "monthlyValue", "billingOwner",
      "commissionStatus", "clientHealth", priority, "avatarColor",
      "renewalDate", "renewalStatus", "affiliateName", "referralSource",
      "referralRevenue", "stripeCustomerId", "stripeSubscriptionId",
      "stripeInvoiceId", "stripeSyncStatus", "lastActivity",
      "nextRequiredAction", notes, "recentEvents", "createdAt", "updatedAt"
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
      $19::jsonb,$20::jsonb,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,
      $33,$34,$35,$36,$37,$38::jsonb,$39::jsonb,$40,$41
    )
    ON CONFLICT (id) DO UPDATE SET
      slug                     = EXCLUDED.slug,
      "clientName"             = EXCLUDED."clientName",
      industry                 = EXCLUDED.industry,
      "assignedAM"             = EXCLUDED."assignedAM",
      email                    = EXCLUDED.email,
      "currentStatus"          = EXCLUDED."currentStatus",
      "workflowStatus"         = EXCLUDED."workflowStatus",
      "salesStatus"            = EXCLUDED."salesStatus",
      "salesOwner"             = EXCLUDED."salesOwner",
      "billingStatus"          = EXCLUDED."billingStatus",
      "invoiceStatus"          = EXCLUDED."invoiceStatus",
      "paymentStatus"          = EXCLUDED."paymentStatus",
      "cancellationStatus"     = EXCLUDED."cancellationStatus",
      "upgradeDowngradeStatus" = EXCLUDED."upgradeDowngradeStatus",
      cleared                  = EXCLUDED.cleared,
      "activationStatus"       = EXCLUDED."activationStatus",
      "onboardingStatus"       = EXCLUDED."onboardingStatus",
      "activeServices"         = EXCLUDED."activeServices",
      "activationChecklist"    = EXCLUDED."activationChecklist",
      "monthlyValue"           = EXCLUDED."monthlyValue",
      "billingOwner"           = EXCLUDED."billingOwner",
      "commissionStatus"       = EXCLUDED."commissionStatus",
      "clientHealth"           = EXCLUDED."clientHealth",
      priority                 = EXCLUDED.priority,
      "avatarColor"            = EXCLUDED."avatarColor",
      "renewalDate"            = EXCLUDED."renewalDate",
      "renewalStatus"          = EXCLUDED."renewalStatus",
      "affiliateName"          = EXCLUDED."affiliateName",
      "referralSource"         = EXCLUDED."referralSource",
      "referralRevenue"        = EXCLUDED."referralRevenue",
      "stripeCustomerId"       = EXCLUDED."stripeCustomerId",
      "stripeSubscriptionId"   = EXCLUDED."stripeSubscriptionId",
      "stripeInvoiceId"        = EXCLUDED."stripeInvoiceId",
      "stripeSyncStatus"       = EXCLUDED."stripeSyncStatus",
      "lastActivity"           = EXCLUDED."lastActivity",
      "nextRequiredAction"     = EXCLUDED."nextRequiredAction",
      notes                    = EXCLUDED.notes,
      "recentEvents"           = EXCLUDED."recentEvents",
      "updatedAt"              = EXCLUDED."updatedAt"`,
    String(body.id),
    String(body.slug ?? ""),
    String(body.clientName ?? ""),
    String(body.industry ?? ""),
    String(body.assignedAM ?? ""),
    String(body.email ?? ""),
    String(body.currentStatus ?? ""),
    String(body.workflowStatus ?? ""),
    String(body.salesStatus ?? ""),
    String(body.salesOwner ?? ""),
    String(body.billingStatus ?? ""),
    String(body.invoiceStatus ?? ""),
    String(body.paymentStatus ?? ""),
    String(body.cancellationStatus ?? "None"),
    String(body.upgradeDowngradeStatus ?? "None"),
    Boolean(body.cleared ?? false),
    String(body.activationStatus ?? ""),
    String(body.onboardingStatus ?? ""),
    JSON.stringify(body.activeServices ?? []),
    JSON.stringify(body.activationChecklist ?? {}),
    String(body.monthlyValue ?? ""),
    String(body.billingOwner ?? ""),
    String(body.commissionStatus ?? ""),
    String(body.clientHealth ?? ""),
    String(body.priority ?? ""),
    String(body.avatarColor ?? ""),
    body.renewalDate != null ? String(body.renewalDate) : null,
    String(body.renewalStatus ?? ""),
    String(body.affiliateName ?? ""),
    String(body.referralSource ?? ""),
    String(body.referralRevenue ?? ""),
    body.stripeCustomerId != null ? String(body.stripeCustomerId) : null,
    body.stripeSubscriptionId != null ? String(body.stripeSubscriptionId) : null,
    body.stripeInvoiceId != null ? String(body.stripeInvoiceId) : null,
    String(body.stripeSyncStatus ?? ""),
    String(body.lastActivity ?? ""),
    String(body.nextRequiredAction ?? ""),
    JSON.stringify(body.notes ?? []),
    JSON.stringify(body.recentEvents ?? []),
    String(body.createdAt ?? now),
    now
  );

  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT * FROM master_clients WHERE id = $1 LIMIT 1`,
    String(body.id)
  );
  return NextResponse.json({ client: rows[0] });
}

// ── PATCH — partial update a client record ────────────────────────────────────

// Allow-list of every patchable column in master_clients.
// Derived from the table schema (41 columns total; id, createdAt, updatedAt
// are excluded here because they are never user-settable).
// Column names must stay in sync with the migration / DB schema.
// Rationale for an explicit list rather than iterating request body keys:
//   any key from the body that is double-quoted and interpolated into raw SQL
//   can break out of identifier quoting if it contains a double-quote character
//   (e.g. `foo" = $1; DROP TABLE master_clients--`).  Using a fixed allow-list
//   means no body key ever reaches the SQL as an identifier.
// Unknown keys → 400.  Chosen over silent ignore so callers get clear signal
//   that a misspelled or unexpected key had no effect, which prevents hidden bugs.
const MASTER_CLIENT_PATCHABLE_COLS = [
  "slug",
  "clientName",
  "industry",
  "assignedAM",
  "email",
  "currentStatus",
  "workflowStatus",
  "salesStatus",
  "salesOwner",
  "billingStatus",
  "invoiceStatus",
  "paymentStatus",
  "cancellationStatus",
  "upgradeDowngradeStatus",
  "cleared",
  "activationStatus",
  "onboardingStatus",
  "activeServices",
  "activationChecklist",
  "monthlyValue",
  "billingOwner",
  "commissionStatus",
  "clientHealth",
  "priority",
  "avatarColor",
  "renewalDate",
  "renewalStatus",
  "affiliateName",
  "referralSource",
  "referralRevenue",
  "stripeCustomerId",
  "stripeSubscriptionId",
  "stripeInvoiceId",
  "stripeSyncStatus",
  "lastActivity",
  "nextRequiredAction",
  "notes",
  "recentEvents",
] as const;

const MASTER_CLIENT_PATCHABLE_SET = new Set<string>(MASTER_CLIENT_PATCHABLE_COLS);

export async function PATCH(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  const existing = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT * FROM master_clients WHERE id = $1 LIMIT 1`,
    id
  );
  if (existing.length === 0)
    return NextResponse.json({ error: "client not found" }, { status: 404 });

  const patch = (await req.json()) as Record<string, unknown>;

  // Reject any key in the request body that is not on the allow-list.
  // This prevents unknown/attacker-controlled identifiers from ever reaching SQL.
  const unknownKeys = Object.keys(patch).filter(
    (k) => !MASTER_CLIENT_PATCHABLE_SET.has(k) && k !== "id" && k !== "createdAt" && k !== "updatedAt"
  );
  if (unknownKeys.length > 0) {
    return NextResponse.json(
      { error: `Unknown field(s): ${unknownKeys.join(", ")}` },
      { status: 400 }
    );
  }

  const row = existing[0];
  const now = new Date().toISOString();

  const JSON_COLS = new Set(["activeServices", "activationChecklist", "notes", "recentEvents"]);

  // Build the SET clause by iterating the allow-list, not the request body.
  // Column names come exclusively from MASTER_CLIENT_PATCHABLE_COLS (compile-time
  // constants), so no attacker-controlled string ever reaches the SQL identifier
  // position.  Values are bound as parameters as before.
  const setClauses: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  for (const col of MASTER_CLIENT_PATCHABLE_COLS) {
    // Only include the column if the patch supplied it, or if we need to carry
    // the existing value through for JSON deep-merge.
    if (!(col in patch) && !JSON_COLS.has(col)) continue;

    // Deep-merge for JSON object fields (e.g. activationChecklist).
    let val: unknown;
    if (JSON_COLS.has(col) && col in patch) {
      const patchVal = patch[col];
      const rowVal   = row[col];
      if (
        patchVal !== null &&
        typeof patchVal === "object" &&
        !Array.isArray(patchVal) &&
        typeof rowVal === "object" &&
        rowVal !== null &&
        !Array.isArray(rowVal)
      ) {
        val = { ...(rowVal as Record<string, unknown>), ...(patchVal as Record<string, unknown>) };
      } else {
        val = patchVal;
      }
    } else if (JSON_COLS.has(col) && !(col in patch)) {
      // JSON col not in patch — carry existing value so it isn't clobbered.
      val = row[col];
    } else {
      val = patch[col];
    }

    // col is a compile-time constant from the allow-list; quoting is safe.
    const quoted = `"${col}"`;
    if (JSON_COLS.has(col)) {
      setClauses.push(`${quoted} = $${paramIdx}::jsonb`);
      params.push(JSON.stringify(val ?? (col === "activeServices" || col === "notes" || col === "recentEvents" ? [] : {})));
    } else if (typeof val === "boolean") {
      setClauses.push(`${quoted} = $${paramIdx}`);
      params.push(val);
    } else if (val === null) {
      setClauses.push(`${quoted} = $${paramIdx}`);
      params.push(null);
    } else {
      setClauses.push(`${quoted} = $${paramIdx}`);
      params.push(String(val));
    }
    paramIdx++;
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "no patchable fields provided" }, { status: 400 });
  }

  // Always bump updatedAt
  setClauses.push(`"updatedAt" = $${paramIdx}`);
  params.push(now);
  paramIdx++;
  params.push(id);

  await prisma.$executeRawUnsafe(
    `UPDATE master_clients SET ${setClauses.join(", ")} WHERE id = $${paramIdx}`,
    ...params
  );

  const updated = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT * FROM master_clients WHERE id = $1 LIMIT 1`,
    id
  );
  return NextResponse.json({ client: updated[0] });
}
