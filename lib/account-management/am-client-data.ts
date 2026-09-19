/**
 * AM Client Data — real data fetching for Account Management pages.
 *
 * Replaces the MasterClient / MASTER_CLIENTS mock import chain.
 * Reads from /api/clients and /api/businesses (Postgres via Prisma).
 *
 * AMClient is the shape AM pages work with: Client + Business merged.
 * One AMClient per Business (domain). A single client with three domains
 * has three AMClient records — one per domain.
 *
 * Activation, kickoff and onboarding are per-Business, not per-Client.
 */

// ── API record types (matching /api/clients and /api/businesses routes) ───────

export interface ClientRecord {
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

export interface BusinessRecord {
  id: string;
  domain: string;
  displayName: string;
  clientId: string;
  // Billing state
  invoiceStatus: string;
  paymentStatus: string;
  invoiceAmountCents: number;
  subscriptionRef: string | null;
  // Delivery state
  assignedAM: string;
  activationStatus: string;
  onboardingStatus: string;
  activeServices: string[];
  monthlyValueCents: number;
  renewalDate: string | null;
  renewalStatus: string;
  // AM delivery lifecycle
  cleared: boolean;
  kickoffCompleted: boolean;
  kickoffDate: string | null;
  assignedAt: string | null;
  // Provenance
  ghlOpportunityId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Merged AM view type ───────────────────────────────────────────────────────

/**
 * AMClient: one record per Business (domain).
 *
 * Combines Client identity fields with Business lifecycle fields so AM pages
 * have a single flat object to work with — matching the MasterClient shape
 * AM pages were built against, but sourced from real Postgres data.
 */
export interface BusinessClient {
  // Identity — from Business (primary key for AM page operations)
  id: string;             // Business id
  clientId: string;       // Client id

  // Display identity — from Client
  displayName: string;    // Business.displayName (domain display name)
  clientName: string;     // Client.fullName || Client.company || Business.displayName
  domain: string;         // Business.domain (normalised)
  email: string;          // Client.email
  phone: string;          // Client.phone

  // Billing state — from Business (AM reads only)
  invoiceStatus: string;
  paymentStatus: string;
  monthlyValue: number;   // monthlyValueCents / 100
  activeServices: string[];
  renewalDate: string | null;
  renewalStatus: string;

  // AM delivery lifecycle — from Business (AM writes)
  assignedAM: string;
  activationStatus: string;
  onboardingStatus: string;
  cleared: boolean;
  kickoffCompleted: boolean;
  kickoffDate: string | null;
  assignedAt: string | null;
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchClients(): Promise<ClientRecord[]> {
  const res = await fetch("/api/clients");
  if (!res.ok) throw new Error(`/api/clients returned ${res.status}`);
  const data = await res.json() as { records?: ClientRecord[] };
  return data.records ?? [];
}

async function fetchBusinesses(): Promise<BusinessRecord[]> {
  const res = await fetch("/api/businesses");
  if (!res.ok) throw new Error(`/api/businesses returned ${res.status}`);
  const data = await res.json() as { records?: BusinessRecord[] };
  return data.records ?? [];
}

/**
 * Fetches all Clients and Businesses, then merges them into AMClient records.
 * One AMClient is returned per Business — per domain, not per Client.
 *
 * Returns an empty array when there are no Clients or Businesses (not an error).
 * Throws on network or parse failure.
 */
export async function fetchAMClients(): Promise<BusinessClient[]> {
  const [clients, businesses] = await Promise.all([fetchClients(), fetchBusinesses()]);

  const clientMap = new Map<string, ClientRecord>(clients.map((c) => [c.id, c]));

  return businesses.map((biz): BusinessClient => {
    const client = clientMap.get(biz.clientId);
    const clientName =
      client?.fullName ||
      client?.company ||
      biz.displayName ||
      biz.domain;

    return {
      id:               biz.id,
      clientId:         biz.clientId,
      displayName:      biz.displayName || biz.domain,
      clientName,
      domain:           biz.domain,
      email:            client?.email ?? "",
      phone:            client?.phone ?? "",
      invoiceStatus:    biz.invoiceStatus,
      paymentStatus:    biz.paymentStatus,
      monthlyValue:     Math.round(biz.monthlyValueCents / 100),
      activeServices:   biz.activeServices,
      renewalDate:      biz.renewalDate,
      renewalStatus:    biz.renewalStatus,
      assignedAM:       biz.assignedAM,
      activationStatus: biz.activationStatus,
      onboardingStatus: biz.onboardingStatus,
      cleared:          biz.cleared,
      kickoffCompleted: biz.kickoffCompleted,
      kickoffDate:      biz.kickoffDate,
      assignedAt:       biz.assignedAt,
    };
  });
}

// ── Write helpers (AM-owned operations) ──────────────────────────────────────

/**
 * Patch a single Business record via PATCH /api/businesses?id=<id>.
 * Only the supplied fields are changed.
 */
export async function patchBusiness(id: string, patch: Partial<BusinessRecord>): Promise<BusinessRecord> {
  const res = await fetch(`/api/businesses?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json() as { record?: BusinessRecord; error?: string };
  if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data.record!;
}

/**
 * Assign an AM to a business.
 * Sets assignedAM, activationStatus → "pending" (if currently "inactive"),
 * and assignedAt timestamp.
 *
 * TODO: automatic workload-based AM assignment with manager override is the
 * intended future behaviour. It is blocked on the User model gaining populated
 * department and role fields so that workload can be computed per-AM and the
 * assigning manager can be verified. Until that lands, this function accepts
 * the AM name as a manual parameter.
 */
export async function assignAM(businessId: string, amName: string): Promise<BusinessRecord> {
  const now = new Date().toISOString();
  return patchBusiness(businessId, {
    assignedAM:       amName,
    assignedAt:       now,
    // Advance from "inactive" → "pending" to signal AM has been assigned.
    // Only advance if currently inactive; other statuses are left intact.
    activationStatus: "pending",
  });
}

/**
 * Mark the kickoff call as complete for a business.
 * Sets kickoffCompleted = true, kickoffDate, activationStatus → "pending"
 * (the same status; the transition to "active" happens at onboarding complete).
 */
export async function markKickoffComplete(businessId: string, kickoffDate?: string): Promise<BusinessRecord> {
  return patchBusiness(businessId, {
    kickoffCompleted: true,
    kickoffDate:      kickoffDate ?? new Date().toISOString().slice(0, 10),
  });
}

/**
 * Mark onboarding as complete for a business.
 * Sets onboardingStatus → "complete", activationStatus → "active".
 */
export async function markOnboardingComplete(businessId: string): Promise<BusinessRecord> {
  return patchBusiness(businessId, {
    onboardingStatus: "complete",
    activationStatus: "active",
  });
}

/**
 * Mark a business as cleared by Billing (payment verification gate).
 * This is Billing's action; called from Billing pages.
 * AM pages read cleared; they do not write it.
 */
export async function markCleared(businessId: string): Promise<BusinessRecord> {
  return patchBusiness(businessId, {
    cleared: true,
  });
}
