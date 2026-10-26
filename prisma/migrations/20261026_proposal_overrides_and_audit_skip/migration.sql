-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: proposal_overrides + audit-skip columns on proposals
-- Date: 2026-10-26
--
-- WHY A SEPARATE TABLE (not a JSON column on proposals):
--
--   1. Queryability — Billing and managers need "show me all proposals that
--      had a price overridden" without JSON path operators on every row.
--
--   2. Append-only integrity — a JSON column on proposals is rewritten by
--      every wizard save (the full state object is POSTed). A separate table
--      cannot be silently cleared by a wizard save bug.
--
--   3. Attribution is the control (Task 5 requirement) — an override row
--      is the permanent, non-forgeable record of who changed what and when.
--      Embedding override history inside the mutable wizard state JSON would
--      let a later save wipe it.
--
--   4. Multiple overrides on the same field — each field can be overridden
--      more than once (rep corrects themselves). The table naturally handles
--      this; a JSON key on the proposal can only hold one value per field.
--
-- AUDIT-SKIP COLUMNS on proposals (not in the overrides table):
--   noAudit, noAuditReason — the skip decision is part of the proposal
--   record itself, visible to the proposals list query without a join.
--   The skip is a proposal-level flag, not an overridden value, so it
--   belongs on the proposal row.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── proposal_overrides ────────────────────────────────────────────────────────
-- One row per overridden value per override event.
-- Multiple overrides of the same field create multiple rows (full history).

CREATE TABLE proposal_overrides (
  -- Auto-incremented surrogate key; no business meaning.
  id                BIGSERIAL     PRIMARY KEY,

  -- The proposal this override belongs to.
  -- Plain text column, no FK constraint — matches codebase pattern.
  proposal_id       TEXT          NOT NULL,

  -- Dot-notation path to the overridden field, e.g.
  --   "lineItems[serviceId=seo].unitMonthlyPrice"
  --   "lineItems[id=custom-abc].label"
  --   "clientInfo.businessName"
  -- String, not an enum, so new surfaces can be added without a migration.
  field_path        TEXT          NOT NULL,

  -- Human-readable label for display in the internal proposal view.
  -- e.g. "SEO — Monthly Price", "Manual Line Item: Custom SEO Package"
  field_label       TEXT          NOT NULL DEFAULT '',

  -- The User.id of whoever performed the override.
  -- NOT NULL — every override must have an actor (route enforces via session).
  overriding_user_id TEXT         NOT NULL,

  -- ISO-8601 timestamp of the override event.
  overridden_at     TEXT          NOT NULL,

  -- The value before this override, serialised as JSON.
  -- NULL means the field did not exist before (e.g. a new manual line item).
  prior_value       JSONB,

  -- The new value after the override, serialised as JSON.
  -- Stored so the record is self-contained even if the proposal is later modified.
  new_value         JSONB         NOT NULL DEFAULT 'null',

  -- What triggered this override.
  -- "price-override"  — rep changed a unit price
  -- "manual-line-item" — rep added a line item not from the catalogue
  -- "field-override"  — rep directly edited a computed/required field value
  override_type     TEXT          NOT NULL DEFAULT 'field-override'
);

-- Index for the most common query: all overrides for a proposal.
CREATE INDEX proposal_overrides_proposal_id_idx
  ON proposal_overrides (proposal_id);

-- Index for user-level audit: all overrides by a specific user.
CREATE INDEX proposal_overrides_user_idx
  ON proposal_overrides (overriding_user_id);

-- ── Audit-skip columns on proposals ──────────────────────────────────────────
-- noAudit:       true when the rep chose the skip path.
-- noAuditReason: required when noAudit = true; recorded reason for proceeding
--                without an audit.
-- Both are nullable: existing rows have no audit-skip state.

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS no_audit        BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_audit_reason TEXT;
