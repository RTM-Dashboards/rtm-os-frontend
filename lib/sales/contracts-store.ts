// RTM OS — Sales Contracts Client-Side Store
//
// File-backed via /api/sales-contracts (reads/writes data/sales-contracts.json).
// Mirrors the same snapshot + async pattern used by lib/sales/handoff-store.ts.
//
// SYNC HELPERS (snapshot after hydration):
//   getAllContracts()         → last-fetched snapshot
//   hydrateContracts()        → populate snapshot from fetched records
//
// ASYNC HELPERS:
//   fetchAllContracts()       → GET /api/sales-contracts
//   fetchContractById()       → GET /api/sales-contracts?id=...
//   fetchContractByProposal() → GET /api/sales-contracts?proposalId=...
//   createContract()          → POST /api/sales-contracts
//   patchContract()           → PATCH /api/sales-contracts (partial update)
//   generateContractNumber()  → deterministic CTR-YYYY-NNNN from proposalId
//   buildContractFromProposal()→ derive a SalesContractRecord from a proposal

import type { SalesContractRecord, SalesContractStatus } from "@/app/api/sales-contracts/route";

export type { SalesContractRecord, SalesContractStatus };

// ─── Local snapshot ───────────────────────────────────────────────────────────

let _snapshot: SalesContractRecord[] = [];

export function hydrateContracts(records: SalesContractRecord[]): void {
  _snapshot = records;
}

export function getAllContracts(): SalesContractRecord[] {
  return _snapshot;
}

export function getContractById(id: string): SalesContractRecord | undefined {
  return _snapshot.find((r) => r.id === id);
}

export function getContractByProposalId(
  proposalId: string
): SalesContractRecord | undefined {
  return _snapshot.find((r) => r.proposalId === proposalId);
}

// ─── Contract Number Generation ───────────────────────────────────────────────

/**
 * Generates a stable CTR-YYYY-NNNN number seeded from the proposalId so the
 * same proposal always produces the same contract number.
 */
export function generateContractNumber(proposalId: string): string {
  const year = new Date().getFullYear();
  // Simple deterministic numeric suffix from the proposalId characters
  let hash = 0;
  for (let i = 0; i < proposalId.length; i++) {
    hash = (hash * 31 + proposalId.charCodeAt(i)) & 0xffff;
  }
  const seq = String(1000 + (hash % 9000)).padStart(4, "0");
  return `CTR-${year}-${seq}`;
}

// ─── Derive contract from a proposal record ───────────────────────────────────

export interface ProposalForContract {
  id: string;
  clientInfo: {
    name: string;
    businessName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  };
  approvedRecommendationServiceNames: string[];
  lineItems?: unknown[];
  budgetResult?: { totalMonthly?: number; totalSetup?: number } | null;
  intakeRecord?: {
    assignedRep?: string;
    targetBudget?: string;
    timeline?: string;
  } | null;
  // Proposal-page display-side fields (camelCase from the static list)
  client?: string;
  owner?: string;
  recurringTotal?: number;
  contract?: { term?: string };
}

/**
 * Build a SalesContractRecord from a proposal.
 * Handles both the wizard-state shape (clientInfo / approvedRecommendationServiceNames)
 * and the display-side shape used by the Proposals page list (client / services / recurringTotal).
 */
export function buildContractFromProposal(
  proposal: ProposalForContract
): SalesContractRecord {
  const contractNumber = generateContractNumber(proposal.id);
  const now = new Date().toISOString();

  // Client info — prefer wizard-state fields, fall back to display-side
  const clientName =
    proposal.clientInfo?.businessName ||
    proposal.clientInfo?.name ||
    proposal.client ||
    "Unknown Client";

  const businessName =
    proposal.clientInfo?.businessName || proposal.client || clientName;

  const contactName =
    proposal.clientInfo?.contactName ||
    proposal.clientInfo?.name ||
    "";

  const contactEmail = proposal.clientInfo?.contactEmail ?? "";
  const contactPhone = proposal.clientInfo?.contactPhone ?? "";

  // Services
  const services = proposal.approvedRecommendationServiceNames ?? [];

  // Monthly value
  const monthly =
    proposal.budgetResult?.totalMonthly ??
    proposal.recurringTotal ??
    0;
  const monthlyValue = monthly > 0 ? `$${monthly.toLocaleString()}/mo` : "TBD";

  // Investment summary for the contract builder
  const setup = proposal.budgetResult?.totalSetup ?? 0;
  const investmentParts: string[] = [];
  if (monthly > 0) investmentParts.push(`Monthly Retainer: $${monthly.toLocaleString()}/mo`);
  if (setup > 0) investmentParts.push(`One-Time Setup Fees: $${setup.toLocaleString()}`);
  if (investmentParts.length === 0) investmentParts.push("Investment to be determined.");
  const investmentSummary = investmentParts.join("\n");

  // Term length — convert from proposal contract term format to display string
  const rawTerm = proposal.contract?.term ?? "12 Month";
  const termLength = rawTerm === "Month-to-Month"
    ? "Month-to-Month"
    : rawTerm.includes("24")
    ? "24 months"
    : rawTerm.includes("6")
    ? "6 months"
    : "12 months";

  // Payment term — default net-30
  const paymentTerm = "net-30";

  // Assigned rep
  const assignedRep =
    proposal.intakeRecord?.assignedRep ||
    proposal.owner ||
    "Sales Representative";

  const record: SalesContractRecord = {
    id: contractNumber,
    contractNumber,
    proposalId: proposal.id,
    status: "draft",
    clientName,
    businessName,
    contactName,
    contactEmail,
    contactPhone,
    assignedRep,
    services,
    investmentSummary,
    monthlyValue,
    termLength,
    paymentTerm,
    signedDate: null,
    createdAt: now,
    updatedAt: now,
  };

  return record;
}

// ─── Async API helpers ────────────────────────────────────────────────────────

export async function fetchAllContracts(): Promise<SalesContractRecord[]> {
  const res = await fetch("/api/sales-contracts", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch contracts: ${res.status}`);
  const data = (await res.json()) as { records: SalesContractRecord[] };
  _snapshot = data.records;
  return data.records;
}

export async function fetchContractById(
  id: string
): Promise<SalesContractRecord | null> {
  const res = await fetch(`/api/sales-contracts?id=${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch contract ${id}: ${res.status}`);
  const data = (await res.json()) as { record: SalesContractRecord };
  return data.record;
}

export async function fetchContractByProposalId(
  proposalId: string
): Promise<SalesContractRecord | null> {
  const res = await fetch(
    `/api/sales-contracts?proposalId=${encodeURIComponent(proposalId)}`,
    { cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Failed to fetch contract for proposal ${proposalId}: ${res.status}`);
  const data = (await res.json()) as { record: SalesContractRecord };
  return data.record;
}

export async function createContract(
  record: SalesContractRecord
): Promise<SalesContractRecord> {
  const res = await fetch("/api/sales-contracts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: res.statusText }))) as {
      error: string;
    };
    throw new Error(`Failed to create contract: ${err.error}`);
  }
  const data = (await res.json()) as { record: SalesContractRecord };
  // Update snapshot
  const idx = _snapshot.findIndex((r) => r.id === data.record.id);
  if (idx === -1) _snapshot.push(data.record);
  else _snapshot[idx] = data.record;
  return data.record;
}

export async function patchContract(
  id: string,
  patch: Partial<SalesContractRecord>
): Promise<SalesContractRecord> {
  const res = await fetch("/api/sales-contracts", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...patch }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: res.statusText }))) as {
      error: string;
    };
    throw new Error(`Failed to patch contract ${id}: ${err.error}`);
  }
  const data = (await res.json()) as { record: SalesContractRecord };
  const idx = _snapshot.findIndex((r) => r.id === data.record.id);
  if (idx === -1) _snapshot.push(data.record);
  else _snapshot[idx] = data.record;
  return data.record;
}
