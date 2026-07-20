// ── Shared representative MRR constant ────────────────────────────────────────
//
// Both the Executive Reports tab (in-page) and the Business Intelligence
// sub-page display a "Total MRR" figure. This constant gives them a single
// source of truth so the two surfaces can never show contradictory values.
//
// This value is REPRESENTATIVE / PREVIEW DATA — it is computed from the
// clientTrends mock portfolio in the Business Intelligence page (10 clients,
// summing individual MRR values). Full real billing integration is Phase 6+
// scope. Changing the figure here updates both surfaces simultaneously.
//
// Portfolio breakdown (clientTrends MRR, 10 clients):
//   Apex Roofing $4,200 + Pacific Dental $6,800 + Harbor Auto $3,500 +
//   BlueSky HVAC $4,600 + Metro Dental $5,100 + Summit Landscaping $2,800 +
//   Prestige Auto $7,200 + Skyline Roofing $3,800 + Urban Dental $4,400 +
//   Coastal Plumbing $3,200 = $45,600
//
export const REPRESENTATIVE_TOTAL_MRR = "$45,600";
export const REPRESENTATIVE_TOTAL_MRR_TREND = "+$2,100 MoM";
