// RTM OS — Canonical Pipeline Stages
//
// THIS IS THE SINGLE SOURCE OF TRUTH for pipeline stage names and ordering.
//
// All UI surfaces that display or reference pipeline stages must import from
// here (or from the API that reads data/pipeline-stages.json at runtime).
//
// DO NOT define a separate stage list in intake-config.ts, the pipeline page,
// or the Sales Settings page. Those surfaces now read from this module or
// the API route at /api/pipeline-stages.
//
// The PipelineConfigPage (at /sales/settings/pipeline-configuration) writes
// to data/pipeline-stages.json via POST /api/pipeline-stages, which makes
// the Kanban board reflect those changes on the next page load.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PipelineStageDefinition {
  id: string;
  name: string;
  order: number;
  color: string;
  bg: string;
  border: string;
}

// ─── Default Stage List ───────────────────────────────────────────────────────
// These are the compile-time defaults. At runtime the pipeline page and
// PipelineConfigPage load the live list from GET /api/pipeline-stages, so
// changes persisted through the settings UI are reflected without a redeploy.
//
// This array is used as:
//   1. The compile-time fallback when the API is unavailable during SSR/build.
//   2. The initialisation seed for data/pipeline-stages.json.

export const DEFAULT_PIPELINE_STAGES: PipelineStageDefinition[] = [
  { id: "stage-1",  name: "Lead",             order: 1,  color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
  { id: "stage-2",  name: "Discovery",        order: 2,  color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "stage-3",  name: "Qualified",        order: 3,  color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  { id: "stage-4",  name: "Audit Requested",  order: 4,  color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { id: "stage-5",  name: "Audit In Progress",order: 5,  color: "#6D28D9", bg: "#EDE9FE", border: "#C4B5FD" },
  { id: "stage-6",  name: "Proposal Draft",   order: 6,  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { id: "stage-7",  name: "Proposal Sent",    order: 7,  color: "#B45309", bg: "#FEF3C7", border: "#FCD34D" },
  { id: "stage-8",  name: "Negotiation",      order: 8,  color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
  { id: "stage-9",  name: "Verbal Approval",  order: 9,  color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  { id: "stage-10", name: "Proposal Approved",order: 10, color: "#15803D", bg: "#DCFCE7", border: "#86EFAC" },
  { id: "stage-11", name: "Sales Handoff",    order: 11, color: "#0F766E", bg: "#F0FDFA", border: "#99F6E4" },
  { id: "stage-12", name: "Closed Won",       order: 12, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  { id: "stage-13", name: "Closed Lost",      order: 13, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
];

// ─── Convenience: just the ordered stage name strings ─────────────────────────
// Useful for dropdowns, select inputs, and places that only need names.
export const DEFAULT_PIPELINE_STAGE_NAMES: string[] = DEFAULT_PIPELINE_STAGES.map(
  (s) => s.name
);
