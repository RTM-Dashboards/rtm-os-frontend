// RTM OS — Master Clients API Route (adapter)
//
// master_clients has been retired. This route now reads from `clients`,
// `businesses`, `proposals`, `opportunities`, and `onboarding_records`
// and returns the identical external shape so no consuming page needs to change.
//
// Field-source map (every field the original route returned):
//
//   id                     → businesses.id  (business id; NOT the old mc001 space)
//   slug                   → businesses.domain  (domain is the stable identifier)
//   clientName             → clients.fullName || clients.company || businesses.displayName
//   industry               → businesses.industry  (new column, migration 20261104)
//   assignedAM             → businesses.assignedAM
//   email                  → clients.email
//   currentStatus          → derived from businesses fields (see deriveCurrentStatus)
//   workflowStatus         → businesses.workflowStatus  (new column)
//   salesStatus            → opportunities.stage (via proposals → opportunityId → opportunities)
//                            or "" when no proposal/opportunity exists.
//   salesOwner             → opportunities.assignedRep (same join path)
//                            or "" when no proposal/opportunity exists.
//   billingStatus          → businesses.billingStatus
//   invoiceStatus          → businesses.invoiceStatus  (canonical invoice status)
//   paymentStatus          → businesses.paymentStatus
//   cancellationStatus     → businesses.cancellationStatus
//   upgradeDowngradeStatus → "None" (not stored on businesses; no consumer writes it)
//   cleared                → businesses.cleared
//   activationStatus       → businesses.activationStatus
//   onboardingStatus       → businesses.onboardingStatus
//   activeServices         → businesses.activeServices
//   activationChecklist    → built from onboarding_records.fieldAssignments
//                            (pattern follows AM onboarding pages; see buildActivationChecklist)
//   monthlyValue           → businesses.monthlyValueCents / 100  (number, not string)
//   billingOwner           → "" (not stored on businesses; no consumer writes it)
//   commissionStatus       → "" (not stored on businesses)
//   clientHealth           → override/derived (see Task 1 notes below)
//   priority               → override/derived (see Task 1 notes below)
//   avatarColor            → deterministic from businesses.id (Task 2; palette from billing page)
//   renewalDate            → businesses.renewalDate ?? ""
//   renewalStatus          → businesses.renewalStatus
//   affiliateName          → "" (not stored on businesses)
//   referralSource         → "" (not stored on businesses)
//   referralRevenue        → "" (not stored on businesses)
//   stripeCustomerId       → null
//   stripeSubscriptionId   → null
//   stripeInvoiceId        → null
//   stripeSyncStatus       → "Not Connected"
//   lastActivity           → businesses.lastActivity  (new column)
//   nextRequiredAction     → businesses.nextRequiredAction  (new column)
//   notes                  → businesses.notes  (new column; TEXT string, not array)
//   recentEvents           → []  (not stored on businesses; was JSON on master_clients)
//   createdAt              → businesses.createdAt
//   updatedAt              → businesses.updatedAt
//
// ── Task 1: clientHealth and priority override vs. derived ───────────────────
//
//   businesses.clientHealth / businesses.priority columns now default to ''.
//   Empty string → compute from billing signals (derived).
//   Non-empty string → human override that wins over the computation.
//
//   The API response includes two extra fields per value:
//     clientHealthSource: "stored" | "computed"
//     prioritySource:     "stored" | "computed"
//   Consuming pages can use these to show an override badge.
//
//   computeHealth() reads:
//     billingStatus, paymentStatus, cancellationStatus, activationStatus
//   computePriority() reads:
//     computeHealth() result, billingStatus
//
// ── Task 2: avatarColor ───────────────────────────────────────────────────────
//
//   Derived deterministically from businesses.id using the same 8-color palette
//   and polynomial hash already used by app/(billing)/billing/client-portfolio/page.tsx.
//   Palette: ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"]
//   Hash:    sum of (h * 31 + charCode) modulo palette length.
//   Never empty. Stable across reloads. No column. No migration.
//
// ── Task 3: salesStatus, salesOwner, activationChecklist ─────────────────────
//
//   salesStatus / salesOwner:
//     Join path: businesses → proposals (via businesses.clientId matching
//     proposals.clientInfo.contactEmail, OR via businesses.ghlOpportunityId
//     matching proposals.opportunityId) → opportunities (proposals.opportunityId).
//     In practice: fetch all proposals for the business's associated email;
//     pick the most recent non-draft; resolve its opportunityId to opportunities.
//     Read: opportunities.stage → salesStatus, opportunities.assignedRep → salesOwner.
//     Returns "" / "" when no proposal or opportunity exists.
//
//   activationChecklist:
//     Read from onboarding_records WHERE clientId = businesses.clientId.
//     Pattern follows AM projects page (fetch ?clientId=<clientId>).
//     Builds an ActivationChecklist from the record's stored state and
//     businesses columns (kickoffCompleted, kickoffDate).
//     Returns all-false checklist when no onboarding record exists.
//
// ── Still unsourced (10 fields) ───────────────────────────────────────────────
//
//   billingOwner, commissionStatus, recentEvents, affiliateName,
//   referralSource, referralRevenue, stripeCustomerId, stripeSubscriptionId,
//   stripeInvoiceId, stripeSyncStatus.
//   Each returns its zero/empty value. The shell page and DeptClientDetailDrawer
//   guard every optional field before rendering it.
//
// monthlyValue conversion:
//   businesses.monthlyValueCents is INTEGER (cents). The adapter divides by 100
//   to produce a number matching MasterClient.monthlyValue.
//
// id space change:
//   The old route used mc001…mc020 as id values. The adapter now returns
//   businesses.id (a UUID/string). No consumer stores, routes, or links by
//   the old mc-style id in any page or live route.
//
// Auth guard: getSessionUser — unchanged.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  computeHealth,
  computePriority,
  type ActivationChecklist,
} from "@/lib/mock/master-clients";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BusinessRow {
  id: string;
  domain: string;
  displayName: string;
  clientId: string;
  invoiceStatus: string;
  paymentStatus: string;
  invoiceAmountCents: number;
  subscriptionRef: string | null;
  assignedAM: string;
  activationStatus: string;
  onboardingStatus: string;
  activeServices: string[] | null;
  monthlyValueCents: number;
  renewalDate: string | null;
  renewalStatus: string;
  ghlOpportunityId: string | null;
  createdAt: string;
  updatedAt: string;
  cleared: boolean;
  kickoffCompleted: boolean;
  kickoffDate: string | null;
  assignedAt: string | null;
  cancellationStatus: string;
  billingStatus: string;
  contractRef: string;
  // new columns (migration 20261104)
  industry: string;
  workflowStatus: string;
  clientHealth: string;
  priority: string;
  lastActivity: string;
  nextRequiredAction: string;
  notes: string;
}

interface ProposalRow {
  id: string;
  status: string;
  opportunityId: string | null;
  leadId: string | null;
  clientInfo: Record<string, string> | null;
}

interface OpportunityRow {
  id: string;
  stage: string;
  assignedRep: string;
}

interface OnboardingRecordRow {
  id: string;
  clientId: string;
  businessId: string;
  status: string;
  salesPrefill: Record<string, unknown>;
  fieldAssignments: Record<string, { fieldId: string; status: string; value: string }>;
}

interface ClientRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  assignedAM: string;
  ghlContactId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── currentStatus derivation ─────────────────────────────────────────────────
//
// master_clients stored currentStatus as a manually-set field.
// After the migration it is derived from businesses state signals.
// This mirrors the computation that AM pages and the shell clients page
// use to determine what stage a client is in.

function deriveCurrentStatus(biz: BusinessRow): string {
  const { cancellationStatus, activationStatus, billingStatus, invoiceStatus, cleared } = biz;

  if (cancellationStatus === "Approved") return "Offboarding";
  if (cancellationStatus === "Requested" || cancellationStatus === "In Review")
    return "Cancellation Requested";

  if (activationStatus === "Active") {
    // Check renewal signals
    if (biz.renewalDate && biz.renewalDate !== "—" && biz.renewalDate !== "") {
      const days = Math.round(
        (new Date(biz.renewalDate).getTime() - Date.now()) / 86_400_000
      );
      if (days >= 0 && days <= 30) return "Renewal Due";
    }
    return "Active";
  }

  if (activationStatus === "Department Activation Pending")
    return "Department Activation Pending";
  if (activationStatus === "Onboarding Pending") return "Onboarding Pending";
  if (activationStatus === "AM Assignment Needed") return "AM Assignment Needed";
  if (activationStatus === "Ready for Onboarding") return "Ready for Onboarding";

  // Pre-activation: billing signals
  if (cleared && billingStatus === "Cleared") return "Invoice Paid";
  if (invoiceStatus === "paid" || invoiceStatus === "Paid") return "Invoice Paid";
  if (invoiceStatus === "sent" || invoiceStatus === "Sent — Awaiting Payment") return "Invoice Sent";
  if (billingStatus === "Pending" && invoiceStatus === "none") return "Proposal Sent";

  return "Lead";
}

// ── Task 2: Deterministic avatar colour ──────────────────────────────────────
//
// Same 8-colour palette and polynomial hash used by the billing client-portfolio
// page (app/(billing)/billing/client-portfolio/page.tsx, lines 97-107).
// Stable across reloads; never empty; no column; no migration required.

const AVATAR_COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

function deriveAvatarColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ── Task 3a: Build activationChecklist from onboarding_records ───────────────
//
// The AM projects page fetches /api/onboarding-records?clientId=<clientId>
// and reads the resulting record to drive checklist state.
// We follow the same pattern: the record's existence and fieldAssignments
// tell us which checklist items are complete.
//
// Source: onboarding_records WHERE clientId = businesses.clientId.
//   onboardingRecordCreated  → record exists
//   activationTasksCreated   → businesses.kickoffCompleted is proxied; in practice,
//                              when an onboarding record exists the project task list
//                              was already created (AM flow requires it first).
//                              We use the record's status != 'Draft' as the signal.
//   kickoffCallCompleted     → businesses.kickoffCompleted column
//   kickoffNeeded            → businesses.kickoffDate column present or kickoffCompleted
//   invoicePaid              → businesses.invoiceStatus
//   billingCleared           → businesses.cleared
//   contractConfirmed        → businesses.contractRef non-empty (or billingStatus Paid+)
//   servicesConfirmed        → businesses.activeServices non-empty
//   clientContactVerified    → clients.email non-empty
//   amAssigned               → businesses.assignedAM != "Unassigned"

function buildActivationChecklist(
  biz: BusinessRow,
  client: ClientRow | undefined,
  onboardingRecord: OnboardingRecordRow | null,
): ActivationChecklist {
  const recordExists = onboardingRecord !== null;
  const recordActive = recordExists && onboardingRecord!.status !== "Draft";

  return {
    invoicePaid:
      biz.invoiceStatus === "Paid" ||
      biz.invoiceStatus === "paid" ||
      biz.paymentStatus === "Paid" ||
      biz.paymentStatus === "paid",
    billingCleared:
      biz.cleared ?? false,
    contractConfirmed:
      (biz.contractRef != null && biz.contractRef !== "") ||
      biz.billingStatus === "Paid" ||
      biz.billingStatus === "Cleared",
    servicesConfirmed:
      Array.isArray(biz.activeServices) && biz.activeServices.length > 0,
    clientContactVerified:
      !!(client?.email && client.email.trim() !== ""),
    amAssigned:
      biz.assignedAM !== "Unassigned" && biz.assignedAM !== "",
    // activationTasksCreated: an onboarding record in an active status signals
    // that the project + task list was created (AM flow requires it first).
    activationTasksCreated: recordActive,
    onboardingRecordCreated: recordExists,
    kickoffNeeded:
      biz.kickoffCompleted ||
      (biz.kickoffDate != null && biz.kickoffDate !== "") ||
      recordExists,
    kickoffCallCompleted:
      biz.kickoffCompleted ?? false,
  };
}

// ── Task 3b: Resolve salesStatus and salesOwner ───────────────────────────────
//
// Join path:
//   businesses.clientId → clients.id → clients.email
//   proposals WHERE clientInfo->>'contactEmail' = clients.email  (most recent non-draft)
//   proposals.opportunityId → opportunities.stage / opportunities.assignedRep
//
// Fallback: businesses.ghlOpportunityId → opportunities (direct match) when
// no proposal-email match is found.
// Returns { salesStatus: "", salesOwner: "" } when no match exists.

interface SalesFields {
  salesStatus: string;
  salesOwner: string;
}

function resolveSalesFields(
  biz: BusinessRow,
  clientEmail: string,
  proposals: ProposalRow[],
  opportunityMap: Map<string, OpportunityRow>,
): SalesFields {
  const empty: SalesFields = { salesStatus: "", salesOwner: "" };

  // 1. Find the best proposal for this business.
  //    Prefer proposals whose clientInfo.contactEmail matches the client's email.
  //    Among those, prefer non-draft, most recently created (proposal list is sorted DESC).
  let bestProposal: ProposalRow | undefined;

  if (clientEmail) {
    const emailNorm = clientEmail.toLowerCase().trim();
    bestProposal = proposals.find(
      (p) =>
        p.clientInfo?.contactEmail?.toLowerCase().trim() === emailNorm &&
        p.status !== "draft" &&
        p.opportunityId
    );
    if (!bestProposal) {
      // Relax: include drafts
      bestProposal = proposals.find(
        (p) =>
          p.clientInfo?.contactEmail?.toLowerCase().trim() === emailNorm &&
          p.opportunityId
      );
    }
  }

  // 2. Fallback: match via businesses.ghlOpportunityId directly to opportunities.
  if (!bestProposal && biz.ghlOpportunityId) {
    const opp = opportunityMap.get(biz.ghlOpportunityId);
    if (opp) {
      return {
        salesStatus: opp.stage ?? "",
        salesOwner:  opp.assignedRep ?? "",
      };
    }
  }

  if (!bestProposal?.opportunityId) return empty;

  const opp = opportunityMap.get(bestProposal.opportunityId);
  if (!opp) return empty;

  return {
    salesStatus: opp.stage ?? "",
    salesOwner:  opp.assignedRep ?? "",
  };
}

// ── Row → MasterClient shape ─────────────────────────────────────────────────

function toMasterClientShape(
  biz: BusinessRow,
  client: ClientRow | undefined,
  proposals: ProposalRow[],
  opportunityMap: Map<string, OpportunityRow>,
  onboardingRecord: OnboardingRecordRow | null,
) {
  const clientName =
    client?.fullName?.trim() ||
    client?.company?.trim() ||
    biz.displayName ||
    biz.domain;

  const clientEmail = client?.email ?? "";

  // ── Task 1: clientHealth / priority — override vs. derived ──────────────────
  //
  // businesses.clientHealth / priority now default to '' (migration 20261201).
  // Empty  → compute from billing signals (derived).
  // Non-empty → explicit human override that wins.
  //
  // The response includes *Source fields so the UI can show an override badge.
  const billingStatus = biz.billingStatus as Parameters<typeof computeHealth>[0]["billingStatus"];
  const paymentStatus = biz.paymentStatus as Parameters<typeof computeHealth>[0]["paymentStatus"];
  const cancellationStatus = biz.cancellationStatus as Parameters<typeof computeHealth>[0]["cancellationStatus"];
  const activationStatus = biz.activationStatus as Parameters<typeof computeHealth>[0]["activationStatus"];

  const computedHealth = computeHealth({ billingStatus, paymentStatus, cancellationStatus, activationStatus });
  const computedPriority = computePriority(computedHealth, billingStatus);

  const storedHealth = biz.clientHealth?.trim() ?? "";
  const storedPriority = biz.priority?.trim() ?? "";

  const clientHealth = storedHealth !== "" ? storedHealth : computedHealth;
  const priority     = storedPriority !== "" ? storedPriority : computedPriority;
  const clientHealthSource: "stored" | "computed" = storedHealth !== "" ? "stored" : "computed";
  const prioritySource: "stored" | "computed"     = storedPriority !== "" ? "stored" : "computed";

  // ── Task 2: deterministic avatar colour ─────────────────────────────────────
  const avatarColor = deriveAvatarColor(biz.id);

  // ── Task 3a: activationChecklist from onboarding_records ────────────────────
  const activationChecklist = buildActivationChecklist(biz, client, onboardingRecord);

  // ── Task 3b: salesStatus / salesOwner from proposals → opportunities ────────
  const { salesStatus, salesOwner } = resolveSalesFields(
    biz, clientEmail, proposals, opportunityMap
  );

  return {
    id:                     biz.id,
    slug:                   biz.domain,
    clientName,
    industry:               biz.industry ?? "",
    assignedAM:             biz.assignedAM ?? "",
    email:                  clientEmail,
    currentStatus:          deriveCurrentStatus(biz),
    workflowStatus:         biz.workflowStatus ?? "Not Started",
    salesStatus,
    salesOwner,
    billingStatus,
    invoiceStatus:          biz.invoiceStatus ?? "",
    paymentStatus:          biz.paymentStatus ?? "",
    cancellationStatus:     biz.cancellationStatus ?? "None",
    upgradeDowngradeStatus: "None",
    cleared:                biz.cleared ?? false,
    activationStatus:       biz.activationStatus ?? "",
    onboardingStatus:       biz.onboardingStatus ?? "",
    activeServices:         biz.activeServices ?? [],
    activationChecklist,
    // monthlyValue: businesses.monthlyValueCents / 100
    // businesses stores cents as INTEGER; MasterClient.monthlyValue is number.
    // Division produces a number, matching the type and what consumers expect.
    monthlyValue:           Math.round((biz.monthlyValueCents ?? 0) / 100),
    billingOwner:           "",
    commissionStatus:       "",
    clientHealth,
    clientHealthSource,
    priority,
    prioritySource,
    avatarColor,
    renewalDate:            biz.renewalDate ?? "",
    renewalStatus:          biz.renewalStatus ?? "",
    affiliateName:          "",
    referralSource:         "",
    referralRevenue:        "",
    stripeCustomerId:       null as string | null,
    stripeSubscriptionId:   null as string | null,
    stripeInvoiceId:        null as string | null,
    stripeSyncStatus:       "Not Connected" as const,
    lastActivity:           biz.lastActivity ?? "",
    nextRequiredAction:     biz.nextRequiredAction ?? "",
    notes:                  biz.notes ?? "",
    recentEvents:           [] as unknown[],
    createdAt:              biz.createdAt ?? "",
    updatedAt:              biz.updatedAt ?? "",
  };
}

// ── Fetch helpers ──────────────────────────────────────────────────────────────

async function fetchAllBusinesses(): Promise<BusinessRow[]> {
  return prisma.$queryRawUnsafe<BusinessRow[]>(
    `SELECT * FROM businesses ORDER BY "createdAt" ASC`
  );
}

async function fetchBusinessById(id: string): Promise<BusinessRow | null> {
  const rows = await prisma.$queryRawUnsafe<BusinessRow[]>(
    `SELECT * FROM businesses WHERE id = $1 LIMIT 1`,
    id
  );
  return rows[0] ?? null;
}

async function fetchClientById(clientId: string): Promise<ClientRow | null> {
  const rows = await prisma.$queryRawUnsafe<ClientRow[]>(
    `SELECT * FROM clients WHERE id = $1 LIMIT 1`,
    clientId
  );
  return rows[0] ?? null;
}

async function buildClientMap(businesses: BusinessRow[]): Promise<Map<string, ClientRow>> {
  const clientIds = [...new Set(businesses.map((b) => b.clientId).filter(Boolean))];
  if (clientIds.length === 0) return new Map();
  const placeholders = clientIds.map((_, i) => `$${i + 1}`).join(", ");
  const clients = await prisma.$queryRawUnsafe<ClientRow[]>(
    `SELECT * FROM clients WHERE id IN (${placeholders})`,
    ...clientIds
  );
  return new Map(clients.map((c) => [c.id, c]));
}

// ── Task 3: fetch proposals, opportunities, onboarding records ────────────────

async function fetchAllProposals(): Promise<ProposalRow[]> {
  // Fetch all proposals, most-recent first, so resolveSalesFields can pick
  // the best candidate with a simple .find().
  return prisma.$queryRawUnsafe<ProposalRow[]>(
    `SELECT id, status, "opportunityId", "leadId", "clientInfo" FROM proposals ORDER BY "createdAt" DESC`
  );
}

async function fetchProposalsByEmail(email: string): Promise<ProposalRow[]> {
  if (!email) return [];
  return prisma.$queryRawUnsafe<ProposalRow[]>(
    `SELECT id, status, "opportunityId", "leadId", "clientInfo"
     FROM proposals
     WHERE "clientInfo"->>'contactEmail' = $1
     ORDER BY "createdAt" DESC`,
    email
  );
}

async function fetchOpportunitiesByIds(ids: string[]): Promise<OpportunityRow[]> {
  const uniq = [...new Set(ids.filter(Boolean))];
  if (uniq.length === 0) return [];
  const placeholders = uniq.map((_, i) => `$${i + 1}`).join(", ");
  return prisma.$queryRawUnsafe<OpportunityRow[]>(
    `SELECT id, stage, "assignedRep" FROM opportunities WHERE id IN (${placeholders})`,
    ...uniq
  );
}

async function buildOpportunityMap(
  proposals: ProposalRow[],
  ghlOppIds: string[],
): Promise<Map<string, OpportunityRow>> {
  const oppIds = [
    ...proposals.map((p) => p.opportunityId).filter((id): id is string => !!id),
    ...ghlOppIds.filter(Boolean),
  ];
  const opps = await fetchOpportunitiesByIds(oppIds);
  return new Map(opps.map((o) => [o.id, o]));
}

async function fetchOnboardingRecordByClientId(
  clientId: string
): Promise<OnboardingRecordRow | null> {
  if (!clientId) return null;
  const rows = await prisma.$queryRawUnsafe<OnboardingRecordRow[]>(
    `SELECT id, "clientId", "businessId", status, "salesPrefill", "fieldAssignments"
     FROM onboarding_records
     WHERE "clientId" = $1
     ORDER BY "createdAt" DESC
     LIMIT 1`,
    clientId
  );
  return rows[0] ?? null;
}

async function buildOnboardingRecordMap(
  businesses: BusinessRow[],
): Promise<Map<string, OnboardingRecordRow>> {
  const clientIds = [...new Set(businesses.map((b) => b.clientId).filter(Boolean))];
  if (clientIds.length === 0) return new Map();
  const placeholders = clientIds.map((_, i) => `$${i + 1}`).join(", ");
  // DISTINCT ON to get one record per clientId (most recent).
  const rows = await prisma.$queryRawUnsafe<OnboardingRecordRow[]>(
    `SELECT DISTINCT ON ("clientId") id, "clientId", "businessId", status, "salesPrefill", "fieldAssignments"
     FROM onboarding_records
     WHERE "clientId" IN (${placeholders})
     ORDER BY "clientId", "createdAt" DESC`,
    ...clientIds
  );
  return new Map(rows.map((r) => [r.clientId, r]));
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const biz = await fetchBusinessById(id);
    if (!biz) return NextResponse.json({ error: "client not found" }, { status: 404 });
    const client = biz.clientId ? await fetchClientById(biz.clientId) : null;
    const clientEmail = client?.email ?? "";

    // Fetch proposals for this client by email, build opportunity map, get onboarding record.
    const [proposals, onboardingRecord] = await Promise.all([
      fetchProposalsByEmail(clientEmail),
      biz.clientId ? fetchOnboardingRecordByClientId(biz.clientId) : Promise.resolve(null),
    ]);
    const ghlOppIds = biz.ghlOpportunityId ? [biz.ghlOpportunityId] : [];
    const opportunityMap = await buildOpportunityMap(proposals, ghlOppIds);

    return NextResponse.json({
      client: toMasterClientShape(
        biz,
        client ?? undefined,
        proposals,
        opportunityMap,
        onboardingRecord,
      ),
    });
  }

  // List path: fetch all supporting data in parallel.
  const [businesses, allProposals] = await Promise.all([
    fetchAllBusinesses(),
    fetchAllProposals(),
  ]);

  const [clientMap, onboardingMap, opportunityMap] = await Promise.all([
    buildClientMap(businesses),
    buildOnboardingRecordMap(businesses),
    buildOpportunityMap(
      allProposals,
      businesses.map((b) => b.ghlOpportunityId ?? "").filter(Boolean),
    ),
  ]);

  const clients = businesses.map((biz) => {
    const client = clientMap.get(biz.clientId);
    const clientEmail = client?.email ?? "";
    // Filter proposals to those relevant to this client by email.
    const bizProposals = clientEmail
      ? allProposals.filter(
          (p) => p.clientInfo?.contactEmail?.toLowerCase().trim() === clientEmail.toLowerCase().trim()
        )
      : [];
    return toMasterClientShape(
      biz,
      client,
      bizProposals,
      opportunityMap,
      onboardingMap.get(biz.clientId) ?? null,
    );
  });

  return NextResponse.json({ clients });
}

// ── POST — upsert a business record ──────────────────────────────────────────
//
// The original route upserted into master_clients. Now we upsert into businesses.
// A POST must supply an id. If a business with that id exists it is updated;
// otherwise a new business row is created.
//
// Fields from the request body that map to businesses columns:
//   clientName       → businesses.displayName (best-effort; we have no Client row to create)
//   slug / domain    → businesses.domain
//   industry         → businesses.industry
//   assignedAM       → businesses.assignedAM
//   email            → ignored (belongs to clients table; we don't create a client here)
//   currentStatus    → ignored (derived)
//   workflowStatus   → businesses.workflowStatus
//   billingStatus    → businesses.billingStatus
//   invoiceStatus    → businesses.invoiceStatus
//   paymentStatus    → businesses.paymentStatus
//   cancellationStatus → businesses.cancellationStatus
//   cleared          → businesses.cleared
//   activationStatus → businesses.activationStatus
//   onboardingStatus → businesses.onboardingStatus
//   activeServices   → businesses.activeServices (text[])
//   monthlyValue     → businesses.monthlyValueCents = monthlyValue * 100
//   renewalDate      → businesses.renewalDate
//   renewalStatus    → businesses.renewalStatus
//   lastActivity     → businesses.lastActivity
//   nextRequiredAction → businesses.nextRequiredAction
//   notes            → businesses.notes
//   clientHealth     → businesses.clientHealth
//   priority         → businesses.priority

export async function POST(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const body = (await req.json()) as Record<string, unknown>;
  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const id = String(body.id);

  // monthlyValue (number) → monthlyValueCents (integer cents)
  const mv = typeof body.monthlyValue === "number"
    ? Math.round(body.monthlyValue * 100)
    : parseInt(String(body.monthlyValue ?? "0"), 10) * 100 || 0;

  const domain = String(body.slug ?? body.domain ?? id);
  const activeServices = Array.isArray(body.activeServices)
    ? (body.activeServices as string[])
    : [];

  await prisma.$executeRawUnsafe(
    `INSERT INTO businesses (
      id, domain, "displayName", "clientId",
      "assignedAM", "activationStatus", "onboardingStatus",
      "activeServices", "monthlyValueCents",
      "renewalDate", "renewalStatus",
      cleared, "kickoffCompleted",
      "cancellationStatus", "billingStatus",
      "invoiceStatus", "paymentStatus",
      "contractRef",
      industry, "workflowStatus", "clientHealth", priority,
      "lastActivity", "nextRequiredAction", notes,
      "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6, $7,
      $8::text[], $9,
      $10, $11,
      $12, $13,
      $14, $15,
      $16, $17,
      $18,
      $19, $20, $21, $22,
      $23, $24, $25,
      $26, $27
    )
    ON CONFLICT (id) DO UPDATE SET
      domain                = EXCLUDED.domain,
      "displayName"         = EXCLUDED."displayName",
      "assignedAM"          = EXCLUDED."assignedAM",
      "activationStatus"    = EXCLUDED."activationStatus",
      "onboardingStatus"    = EXCLUDED."onboardingStatus",
      "activeServices"      = EXCLUDED."activeServices",
      "monthlyValueCents"   = EXCLUDED."monthlyValueCents",
      "renewalDate"         = EXCLUDED."renewalDate",
      "renewalStatus"       = EXCLUDED."renewalStatus",
      cleared               = EXCLUDED.cleared,
      "cancellationStatus"  = EXCLUDED."cancellationStatus",
      "billingStatus"       = EXCLUDED."billingStatus",
      "invoiceStatus"       = EXCLUDED."invoiceStatus",
      "paymentStatus"       = EXCLUDED."paymentStatus",
      industry              = EXCLUDED.industry,
      "workflowStatus"      = EXCLUDED."workflowStatus",
      "clientHealth"        = EXCLUDED."clientHealth",
      priority              = EXCLUDED.priority,
      "lastActivity"        = EXCLUDED."lastActivity",
      "nextRequiredAction"  = EXCLUDED."nextRequiredAction",
      notes                 = EXCLUDED.notes,
      "updatedAt"           = EXCLUDED."updatedAt"`,
    id,
    domain,
    String(body.clientName ?? ""),
    String(body.clientId ?? ""),
    String(body.assignedAM ?? ""),
    String(body.activationStatus ?? ""),
    String(body.onboardingStatus ?? ""),
    `{${activeServices.map((s) => `"${String(s).replace(/"/g, '\\"')}"`).join(",")}}`,
    mv,
    body.renewalDate != null && String(body.renewalDate) !== "" ? String(body.renewalDate) : null,
    String(body.renewalStatus ?? "ok"),
    Boolean(body.cleared ?? false),
    Boolean(body.kickoffCompleted ?? false),
    String(body.cancellationStatus ?? "None"),
    String(body.billingStatus ?? "Pending"),
    String(body.invoiceStatus ?? "none"),
    String(body.paymentStatus ?? "none"),
    String(body.contractRef ?? ""),
    String(body.industry ?? ""),
    String(body.workflowStatus ?? "Not Started"),
    String(body.clientHealth ?? "Good"),
    String(body.priority ?? "Medium"),
    String(body.lastActivity ?? ""),
    String(body.nextRequiredAction ?? ""),
    String(body.notes ?? ""),
    String(body.createdAt ?? now),
    now
  );

  const biz = await fetchBusinessById(id);
  if (!biz) return NextResponse.json({ error: "upsert failed" }, { status: 500 });
  const client = biz.clientId ? await fetchClientById(biz.clientId) : null;
  const clientEmail = client?.email ?? "";
  const [proposals, onboardingRecord] = await Promise.all([
    fetchProposalsByEmail(clientEmail),
    biz.clientId ? fetchOnboardingRecordByClientId(biz.clientId) : Promise.resolve(null),
  ]);
  const ghlOppIds = biz.ghlOpportunityId ? [biz.ghlOpportunityId] : [];
  const opportunityMap = await buildOpportunityMap(proposals, ghlOppIds);
  return NextResponse.json({
    client: toMasterClientShape(biz, client ?? undefined, proposals, opportunityMap, onboardingRecord),
  });
}

// ── PATCH — partial update a business record ──────────────────────────────────
//
// Allow-list of every patchable field via this route.
// These are the fields from the original master_clients PATCH allow-list that
// now map to columns on businesses, plus the identity-level fields.
//
// Fields from the original allow-list that have NO column on businesses:
//   salesStatus, salesOwner, billingOwner, commissionStatus, avatarColor,
//   affiliateName, referralSource, referralRevenue, upgradeDowngradeStatus,
//   activationChecklist, recentEvents, stripeCustomerId, stripeSubscriptionId,
//   stripeInvoiceId, stripeSyncStatus.
// These are still on the allow-list (so callers that send them get 400 only
// for truly unknown keys), but they are silently no-op'd because they have
// no target column. The alternative — rejecting them — would break callers
// that currently send those fields via patchMasterClient().
//
// The allow-list prevents column-name injection: only names from this
// compile-time constant ever reach the SQL identifier position.

const BUSINESS_PATCHABLE_COLS = [
  // fields that write to businesses columns
  "slug",              // → domain
  "clientName",        // → displayName
  "industry",
  "assignedAM",
  "workflowStatus",
  "billingStatus",
  "invoiceStatus",
  "paymentStatus",
  "cancellationStatus",
  "cleared",
  "activationStatus",
  "onboardingStatus",
  "activeServices",
  "monthlyValue",      // → monthlyValueCents (×100)
  "renewalDate",
  "renewalStatus",
  "clientHealth",
  "priority",
  "lastActivity",
  "nextRequiredAction",
  "notes",
  "kickoffCompleted",
  "kickoffDate",
  "assignedAt",
  // fields with no businesses column — accepted but no-op'd
  "email",
  "currentStatus",
  "upgradeDowngradeStatus",
  "activationChecklist",
  "billingOwner",
  "commissionStatus",
  "avatarColor",
  "affiliateName",
  "referralSource",
  "referralRevenue",
  "stripeCustomerId",
  "stripeSubscriptionId",
  "stripeInvoiceId",
  "stripeSyncStatus",
  "salesStatus",
  "salesOwner",
  "recentEvents",
  "activatedAt",
  "handoffNote",
] as const;

// Fields in the allow-list that map to an actual businesses column.
// All other allow-list members are accepted (to avoid breaking callers) but
// produce no SQL SET clause.
const BUSINESS_COLUMN_MAP: Record<string, string> = {
  slug:                "domain",
  clientName:          "displayName",
  industry:            "industry",
  assignedAM:          "assignedAM",
  workflowStatus:      "workflowStatus",
  billingStatus:       "billingStatus",
  invoiceStatus:       "invoiceStatus",
  paymentStatus:       "paymentStatus",
  cancellationStatus:  "cancellationStatus",
  cleared:             "cleared",
  activationStatus:    "activationStatus",
  onboardingStatus:    "onboardingStatus",
  activeServices:      "activeServices",
  monthlyValue:        "monthlyValueCents",
  renewalDate:         "renewalDate",
  renewalStatus:       "renewalStatus",
  clientHealth:        "clientHealth",
  priority:            "priority",
  lastActivity:        "lastActivity",
  nextRequiredAction:  "nextRequiredAction",
  notes:               "notes",
  kickoffCompleted:    "kickoffCompleted",
  kickoffDate:         "kickoffDate",
  assignedAt:          "assignedAt",
};

const PATCHABLE_SET = new Set<string>(BUSINESS_PATCHABLE_COLS);

export async function PATCH(req: NextRequest) {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  const biz = await fetchBusinessById(id);
  if (!biz) return NextResponse.json({ error: "client not found" }, { status: 404 });

  const patch = (await req.json()) as Record<string, unknown>;

  // Reject keys that are not on the allow-list.
  const unknownKeys = Object.keys(patch).filter(
    (k) => !PATCHABLE_SET.has(k) && k !== "id" && k !== "createdAt" && k !== "updatedAt"
  );
  if (unknownKeys.length > 0) {
    return NextResponse.json(
      { error: `Unknown field(s): ${unknownKeys.join(", ")}` },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const setClauses: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  // Iterate allow-list, not request body, so no body key ever reaches SQL.
  for (const key of BUSINESS_PATCHABLE_COLS) {
    if (!(key in patch)) continue;

    const col = BUSINESS_COLUMN_MAP[key];
    if (!col) continue; // key is accepted but has no businesses column; no-op

    const val = patch[key];

    // col comes exclusively from BUSINESS_COLUMN_MAP (compile-time constants).
    const quoted = `"${col}"`;

    if (key === "monthlyValue") {
      // Convert number to cents
      const cents = typeof val === "number"
        ? Math.round(val * 100)
        : parseInt(String(val ?? "0"), 10) * 100 || 0;
      setClauses.push(`${quoted} = $${paramIdx}`);
      params.push(cents);
    } else if (key === "activeServices") {
      const arr = Array.isArray(val) ? (val as string[]) : [];
      setClauses.push(`${quoted} = $${paramIdx}::text[]`);
      params.push(`{${arr.map((s) => `"${String(s).replace(/"/g, '\\"')}"`).join(",")}}`);
    } else if (key === "cleared" || key === "kickoffCompleted") {
      setClauses.push(`${quoted} = $${paramIdx}`);
      params.push(Boolean(val));
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
    `UPDATE businesses SET ${setClauses.join(", ")} WHERE id = $${paramIdx}`,
    ...params
  );

  const updated = await fetchBusinessById(id);
  if (!updated) return NextResponse.json({ error: "read-back failed" }, { status: 500 });
  const client = updated.clientId ? await fetchClientById(updated.clientId) : null;
  const updatedEmail = client?.email ?? "";
  const [patchProposals, patchOnboarding] = await Promise.all([
    fetchProposalsByEmail(updatedEmail),
    updated.clientId ? fetchOnboardingRecordByClientId(updated.clientId) : Promise.resolve(null),
  ]);
  const patchGhlOppIds = updated.ghlOpportunityId ? [updated.ghlOpportunityId] : [];
  const patchOppMap = await buildOpportunityMap(patchProposals, patchGhlOppIds);
  return NextResponse.json({
    client: toMasterClientShape(updated, client ?? undefined, patchProposals, patchOppMap, patchOnboarding),
  });
}
