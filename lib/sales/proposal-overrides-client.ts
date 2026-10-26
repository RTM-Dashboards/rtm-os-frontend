// RTM OS — Proposal Overrides Client Helper
// ─────────────────────────────────────────────────────────────────────────────
// Pure async helpers for recording and fetching proposal overrides.
// No React, no UI imports. Consumed by wizard steps and the proposals view.
// ─────────────────────────────────────────────────────────────────────────────

export interface ProposalOverrideRecord {
  id: string;
  proposalId: string;
  fieldPath: string;
  fieldLabel: string;
  overridingUserId: string;
  overriddenAt: string;
  priorValue: unknown;
  newValue: unknown;
  overrideType: string;
}

/**
 * Records a field-level override. Returns the created record on success,
 * null on network or API failure. Never throws.
 *
 * overridingUserId is resolved server-side from the authenticated session;
 * callers do not supply it.
 */
export async function recordOverride(opts: {
  proposalId: string;
  fieldPath: string;
  fieldLabel: string;
  priorValue?: unknown;
  newValue: unknown;
  overrideType?: "price-override" | "manual-line-item" | "field-override";
}): Promise<ProposalOverrideRecord | null> {
  try {
    const res = await fetch("/api/proposal-overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { override?: ProposalOverrideRecord };
    return data.override ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetches all override records for a proposal. Returns an empty array on
 * network or API failure. Never throws.
 */
export async function fetchOverrides(
  proposalId: string
): Promise<ProposalOverrideRecord[]> {
  try {
    const res = await fetch(
      `/api/proposal-overrides?proposalId=${encodeURIComponent(proposalId)}`
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { overrides?: ProposalOverrideRecord[] };
    return data.overrides ?? [];
  } catch {
    return [];
  }
}
