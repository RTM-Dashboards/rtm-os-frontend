-- Migration: 20261009_onboarding_records
--
-- Creates the onboarding_records table.
--
-- DESIGN: fieldAssignments (25 fields × value/status/timestamps) and
-- salesPrefill are stored as JSONB.  Rationale: the field set is config-
-- driven (ONBOARDING_FIELD_SCHEMA); adding a field means updating one TS
-- file, not adding a column.  The blobs are always read and written whole
-- — no query ever filters on an individual field value — so JSONB is the
-- right fit.  The same pattern is used for lineItems and address on
-- sales_handoffs and for checklist on sales_handoffs.
--
-- Links:
--   projectId  → projects.id    (no FK; plain text like every other join here)
--   businessId → businesses.id  (no FK; matches pattern)
--   clientId   → clients.id     (no FK; matches pattern)
--
-- The task column that carries the record id lives on tasks (onboarding_record_id).
-- Added here alongside the table so both objects exist in one migration.

-- ── onboarding_records ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS onboarding_records (
  id                TEXT        NOT NULL,
  "projectId"       TEXT,
  "businessId"      TEXT        NOT NULL DEFAULT '',
  "clientId"        TEXT        NOT NULL DEFAULT '',
  status            TEXT        NOT NULL DEFAULT 'AM In Progress',
  "statusOverride"  TEXT,
  "salesPrefill"    JSONB       NOT NULL DEFAULT '{}',
  "fieldAssignments" JSONB      NOT NULL DEFAULT '{}',
  "createdAt"       TEXT        NOT NULL DEFAULT '',
  "updatedAt"       TEXT        NOT NULL DEFAULT '',

  CONSTRAINT onboarding_records_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "onboarding_records_projectId_idx"
  ON onboarding_records ("projectId");

CREATE INDEX IF NOT EXISTS "onboarding_records_clientId_idx"
  ON onboarding_records ("clientId");

CREATE INDEX IF NOT EXISTS "onboarding_records_businessId_idx"
  ON onboarding_records ("businessId");

-- ── tasks: onboarding_record_id ───────────────────────────────────────────────
-- Set at launch for the "Complete Onboarding Checklist" task (bpt-004-5).
-- Null for all other tasks and all tasks from previous launches.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS onboarding_record_id TEXT;

CREATE INDEX IF NOT EXISTS "tasks_onboarding_record_id_idx"
  ON tasks (onboarding_record_id);
