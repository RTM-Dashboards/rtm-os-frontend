// =============================================================================
// RTM OS — Invoices API Client
// lib/billing/invoices-api.ts
//
// Typed helpers for reading and mutating Invoice records. All functions go
// through /api/invoices (backed by Postgres via Prisma) instead of touching
// local state directly.
//
// Mirrors the shape of lib/sales/sales-handoffs-api.ts.
//
// Used by:
//   - app/(billing)/billing/invoices/page.tsx   (create, list, patch)
// =============================================================================

import type { InvoiceRecord } from "@/app/api/invoices/route";

export type { InvoiceRecord };

// Subset of fields accepted by GET /api/invoices as query filters
export interface InvoiceFilters {
  businessId?:    string;
  clientId?:      string;
  invoiceStatus?: string;
  paymentStatus?: string;
  overdue?:       true;
}

// ── Base fetch helper ──────────────────────────────────────────────────────────

async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Invoices API ${options?.method ?? "GET"} ${url} → ${res.status}: ${text}`
    );
  }
  return res;
}

// ── Read helpers ───────────────────────────────────────────────────────────────

/**
 * Fetch all invoices, optionally filtered.
 * Returns an empty array when there are no invoices — never throws on 200.
 */
export async function fetchInvoices(filters?: InvoiceFilters): Promise<InvoiceRecord[]> {
  const params = new URLSearchParams();
  if (filters?.businessId)    params.set("businessId",    filters.businessId);
  if (filters?.clientId)      params.set("clientId",      filters.clientId);
  if (filters?.invoiceStatus) params.set("invoiceStatus", filters.invoiceStatus);
  if (filters?.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
  if (filters?.overdue)       params.set("overdue",       "true");

  const qs = params.toString();
  const res = await apiFetch(`/api/invoices${qs ? `?${qs}` : ""}`);
  const data = (await res.json()) as { invoices: InvoiceRecord[] };
  return data.invoices;
}

/**
 * Fetch a single invoice by id.
 * Returns null if the invoice is not found (404).
 */
export async function fetchInvoice(id: string): Promise<InvoiceRecord | null> {
  try {
    const res = await apiFetch(`/api/invoices?id=${encodeURIComponent(id)}`);
    const data = (await res.json()) as { invoice: InvoiceRecord };
    return data.invoice;
  } catch {
    return null;
  }
}

// ── Write helpers ──────────────────────────────────────────────────────────────

/**
 * Create a new invoice.
 * Do NOT include invoiceNumber in the body — the server generates it.
 * id must be a caller-supplied string (e.g. `inv-${Date.now()}-${random}`).
 *
 * Returns the created InvoiceRecord including the server-generated invoiceNumber.
 */
export async function createInvoice(
  invoice: Omit<InvoiceRecord, "invoiceNumber" | "createdAt" | "updatedAt">
): Promise<InvoiceRecord> {
  const res = await apiFetch("/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoice),
  });
  const data = (await res.json()) as { invoice: InvoiceRecord };
  return data.invoice;
}

/**
 * Partially update an invoice by id.
 * Omit any field you do not want to change.
 * invoiceNumber is always server-managed and cannot be patched.
 *
 * Returns the updated InvoiceRecord.
 */
export async function patchInvoice(
  id: string,
  patch: Partial<InvoiceRecord>
): Promise<InvoiceRecord> {
  const res = await apiFetch(`/api/invoices?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as { invoice: InvoiceRecord };
  return data.invoice;
}
