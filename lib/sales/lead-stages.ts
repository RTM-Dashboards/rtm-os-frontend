// RTM OS — Canonical Lead Stages
//
// THIS IS THE SINGLE SOURCE OF TRUTH for lead stage names, ordering, and colours.
//
// At runtime, /api/lead-stages reads from the lead_stages Postgres table.
// This module provides the compile-time defaults used as:
//   1. A fallback when the API is unavailable during SSR / build.
//   2. The initialisation seed for the lead_stages table.
//
// DO NOT define a separate stage list in leads/page.tsx, stage-tags.ts,
// or anywhere else. Those surfaces read from this module or the API route.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeadStageDefinition {
  id: string;
  name: string;
  order: number;
  color: string;
  bg: string;
  border: string;
}

// ─── Default Stage List ───────────────────────────────────────────────────────
// Colours sourced directly from STAGE_CONFIG in app/(sales)/sales/leads/page.tsx.

export const DEFAULT_LEAD_STAGES: LeadStageDefinition[] = [
  { id: "lead-stage-1", name: "New Lead",            order: 0, color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
  { id: "lead-stage-2", name: "Contact Attempted",   order: 1, color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE" },
  { id: "lead-stage-3", name: "Contacted",           order: 2, color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  { id: "lead-stage-4", name: "Discovery Scheduled", order: 3, color: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD" },
  { id: "lead-stage-5", name: "Discovery Complete",  order: 4, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  { id: "lead-stage-6", name: "Qualified",           order: 5, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { id: "lead-stage-7", name: "Disqualified",        order: 6, color: "#94A3B8", bg: "#F1F5F9", border: "#CBD5E1" },
];

// ─── Convenience: ordered name strings ────────────────────────────────────────

export const DEFAULT_LEAD_STAGE_NAMES: string[] = DEFAULT_LEAD_STAGES.map(
  (s) => s.name
);
