// RTM OS — GoHighLevel API Client (server-side only)
//
// Implements the GHL v2 REST API using a Private Integration token.
// Private Integration tokens are long-lived and require no OAuth flow or
// token refresh — pass as a simple Bearer token.
//
// Auth:   Authorization: Bearer <GHL_PRIVATE_INTEGRATION_TOKEN>
// Header: Version: 2021-07-28  (required for all v2 calls)
// Base:   https://services.leadconnectorhq.com
//
// NEVER import this module on the client side — it reads secrets from env vars.
// All exports are async server-only functions.

// ── Credentials ───────────────────────────────────────────────────────────────

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

function getCredentials(): { token: string; locationId: string } {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!token || !locationId) {
    throw new GhlConfigError(
      "GHL credentials not configured. Set GHL_PRIVATE_INTEGRATION_TOKEN and GHL_LOCATION_ID in your environment variables."
    );
  }

  return { token, locationId };
}

// ── Error types ───────────────────────────────────────────────────────────────

export class GhlConfigError extends Error {
  readonly code = "GHL_CONFIG_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "GhlConfigError";
  }
}

export class GhlApiError extends Error {
  readonly code = "GHL_API_ERROR";
  readonly status: number;
  readonly body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "GhlApiError";
    this.status = status;
    this.body = body;
  }
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function ghlFetch<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { token } = getCredentials();
  const { params, ...fetchOptions } = options;

  let url = `${GHL_BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url = `${url}?${qs}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Version": GHL_API_VERSION,
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const msg =
      (body && typeof body === "object" && "message" in body
        ? String((body as Record<string, unknown>).message)
        : `GHL API error`) + ` (HTTP ${response.status})`;
    throw new GhlApiError(msg, response.status, body);
  }

  return body as T;
}

// ── GHL API types ─────────────────────────────────────────────────────────────

export interface GhlContact {
  id: string;
  locationId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  source?: string;
  tags?: string[];
  assignedTo?: string;
  dateAdded?: string;
  dateUpdated?: string;
  lastActivity?: string;
  contactType?: string;
  type?: string;
}

export interface GhlCreateContactInput {
  locationId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  source?: string;
  tags?: string[];
  assignedTo?: string;
}

export interface GhlUpdateContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  source?: string;
  tags?: string[];
  assignedTo?: string;
}

export interface GhlPipeline {
  id: string;
  name: string;
  stages: GhlPipelineStage[];
}

export interface GhlPipelineStage {
  id: string;
  name: string;
  position?: number;
}

export interface GhlOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  pipelineStageName?: string;
  status: "open" | "won" | "lost" | "abandoned";
  contactId?: string;
  monetaryValue?: number;
  source?: string;
  assignedTo?: string;
  locationId: string;
  createdAt?: string;
  updatedAt?: string;
  lastActivityAt?: string;
}

export interface GhlCreateOpportunityInput {
  pipelineId: string;
  locationId: string;
  name: string;
  pipelineStageId?: string;
  status?: "open" | "won" | "lost" | "abandoned";
  contactId?: string;
  monetaryValue?: number;
  source?: string;
  assignedTo?: string;
}

export interface GhlUpdateOpportunityInput {
  name?: string;
  pipelineStageId?: string;
  status?: "open" | "won" | "lost" | "abandoned";
  monetaryValue?: number;
  assignedTo?: string;
}

// ── Contact Operations ────────────────────────────────────────────────────────

/**
 * Search for a GHL Contact by email or name within the configured location.
 * Returns the first match, or null if no match found.
 */
export async function searchContact(query: string): Promise<GhlContact | null> {
  const { locationId } = getCredentials();

  const result = await ghlFetch<{ contacts: GhlContact[] }>("/contacts/search", {
    params: { q: query, locationId },
  });

  return result.contacts?.[0] ?? null;
}

/**
 * Fetch a single GHL Contact by ID.
 */
export async function getContact(contactId: string): Promise<GhlContact> {
  const result = await ghlFetch<{ contact: GhlContact }>(`/contacts/${contactId}`);
  return result.contact;
}

/**
 * Create a new GHL Contact.
 */
export async function createContact(input: GhlCreateContactInput): Promise<GhlContact> {
  const { locationId } = getCredentials();
  const result = await ghlFetch<{ contact: GhlContact }>("/contacts/", {
    method: "POST",
    body: JSON.stringify({ ...input, locationId }),
  });
  return result.contact;
}

/**
 * Update an existing GHL Contact.
 */
export async function updateContact(
  contactId: string,
  input: GhlUpdateContactInput
): Promise<GhlContact> {
  const result = await ghlFetch<{ contact: GhlContact }>(`/contacts/${contactId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return result.contact;
}

/**
 * Upsert a GHL Contact: search by email first, update if found, create if not.
 * Returns { contact, created: boolean }.
 */
export async function upsertContact(
  input: GhlCreateContactInput
): Promise<{ contact: GhlContact; created: boolean }> {
  // Try email-based lookup first
  if (input.email) {
    try {
      const found = await searchContact(input.email);
      if (found) {
        const updated = await updateContact(found.id, input);
        return { contact: updated, created: false };
      }
    } catch {
      // If search fails, fall through to create
    }
  }

  const contact = await createContact(input);
  return { contact, created: true };
}

// ── Pipeline Operations ───────────────────────────────────────────────────────

/**
 * List all pipelines for the configured location.
 */
export async function listPipelines(): Promise<GhlPipeline[]> {
  const { locationId } = getCredentials();
  const result = await ghlFetch<{ pipelines: GhlPipeline[] }>(
    "/opportunities/pipelines",
    { params: { locationId } }
  );
  return result.pipelines ?? [];
}

// ── Opportunity Operations ────────────────────────────────────────────────────

/**
 * Search GHL Opportunities within a pipeline.
 */
export async function searchOpportunities(
  pipelineId: string,
  opts: { q?: string; stageId?: string; limit?: number } = {}
): Promise<GhlOpportunity[]> {
  const { locationId } = getCredentials();

  const params: Record<string, string> = {
    location_id: locationId,
    pipeline_id: pipelineId,
  };
  if (opts.q) params.q = opts.q;
  if (opts.stageId) params.pipeline_stage_id = opts.stageId;
  if (opts.limit) params.limit = String(opts.limit);

  const result = await ghlFetch<{ opportunities: GhlOpportunity[] }>(
    "/opportunities/search",
    { params }
  );
  return result.opportunities ?? [];
}

/**
 * Get a single GHL Opportunity by ID.
 */
export async function getOpportunity(opportunityId: string): Promise<GhlOpportunity> {
  const result = await ghlFetch<{ opportunity: GhlOpportunity }>(
    `/opportunities/${opportunityId}`
  );
  return result.opportunity;
}

/**
 * Create a new GHL Opportunity.
 */
export async function createOpportunity(
  input: GhlCreateOpportunityInput
): Promise<GhlOpportunity> {
  const { locationId } = getCredentials();
  const result = await ghlFetch<{ opportunity: GhlOpportunity }>("/opportunities/", {
    method: "POST",
    body: JSON.stringify({ ...input, locationId }),
  });
  return result.opportunity;
}

/**
 * Update an existing GHL Opportunity.
 */
export async function updateOpportunity(
  opportunityId: string,
  input: GhlUpdateOpportunityInput
): Promise<GhlOpportunity> {
  const result = await ghlFetch<{ opportunity: GhlOpportunity }>(
    `/opportunities/${opportunityId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
  return result.opportunity;
}

// ── Credential check (non-throwing) ──────────────────────────────────────────

/**
 * Returns true if the required GHL environment variables are set.
 * Does NOT make a network call — for build-time / startup checks only.
 */
export function ghlCredentialsConfigured(): boolean {
  return !!(
    process.env.GHL_PRIVATE_INTEGRATION_TOKEN &&
    process.env.GHL_LOCATION_ID
  );
}
