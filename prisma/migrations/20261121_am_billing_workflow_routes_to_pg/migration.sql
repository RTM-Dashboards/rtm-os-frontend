-- Migration: 20261121_am_billing_workflow_routes_to_pg
--
-- Moves four AM/Billing workflow API routes from flat-file JSON to Postgres.
-- All four files held zero records; this is a clean schema swap.
-- The JSON files remain on disk as dead artifacts (same pattern as the nine
-- routes migrated in 20261029_flat_file_routes_to_pg).
--
-- Routes converted:
--   /api/pending-change-requests        → pending_change_requests
--   /api/pending-offboarding-records    → pending_offboarding_records
--   /api/expansion-opportunity-status   → expansion_opportunity_status
--   /api/dept-report-status             → dept_report_status
--
-- Timestamp convention: TEXT ISO-8601, matching all prior migrations
-- (created_at TEXT DEFAULT now()::text).  Rationale is recorded in
-- 20261029_flat_file_routes_to_pg: Prisma returns a Date from timestamptz,
-- which would change the JSON response shape; TEXT preserves the existing
-- string serialisation and sorts correctly for ISO-8601 UTC strings.
-- Sibling table matched: pending_cancellation_requests.
--
-- Applied: psql -f (not prisma migrate dev).
-- DATABASE_URL points at the transaction pooler; all DDL uses DIRECT_URL.

-- ── 1. pending_change_requests ────────────────────────────────────────────────
--
-- Replaces data/pending-change-requests.json.
-- id is server-assigned as 'am-chg-N' (matches the existing in-process
-- nextId() generator; Postgres MAX() makes it collision-safe across instances).
-- submittedByRole and billingApprovalStatus have server-managed defaults.
-- departmentsImpacted is a free-form string array; stored as JSONB.

CREATE TABLE IF NOT EXISTS pending_change_requests (
  id                     TEXT    NOT NULL,
  client                 TEXT    NOT NULL DEFAULT '',
  "requestType"          TEXT    NOT NULL DEFAULT '',
  description            TEXT    NOT NULL DEFAULT '',
  project                TEXT    NOT NULL DEFAULT '',
  "requestedBy"          TEXT    NOT NULL DEFAULT '',
  "revenueImpact"        NUMERIC NOT NULL DEFAULT 0,
  "departmentsImpacted"  JSONB   NOT NULL DEFAULT '[]',
  "submittedDate"        TEXT    NOT NULL DEFAULT (now()::text),
  status                 TEXT    NOT NULL DEFAULT 'Submitted',
  "submittedByRole"      TEXT    NOT NULL DEFAULT 'AM',
  "billingApprovalStatus" TEXT   NOT NULL DEFAULT 'Pending',
  notes                  TEXT    NOT NULL DEFAULT '',
  "createdAt"            TEXT    NOT NULL DEFAULT (now()::text),
  CONSTRAINT pending_change_requests_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS pending_change_requests_created_at_idx
  ON pending_change_requests ("createdAt");

-- ── 2. pending_offboarding_records ────────────────────────────────────────────
--
-- Replaces data/pending-offboarding-records.json.
-- id is server-assigned as 'ob-billing-N'.
-- The OffboardingRecord type has seven deeply nested object/array fields
-- (checklist, departmentTasks, assetTransfers, accessRemovals, finalBilling,
-- knowledgeArchive, aiSummary, activityTimeline, services).  These are always
-- read and written whole; no query ever filters on a sub-field.  JSONB is
-- the right fit — same rationale as salesPrefill/fieldAssignments on
-- onboarding_records (20261009_onboarding_records).

CREATE TABLE IF NOT EXISTS pending_offboarding_records (
  id                       TEXT    NOT NULL,
  client                   TEXT    NOT NULL DEFAULT '',
  "accountManager"         TEXT    NOT NULL DEFAULT '',
  "offboardingOwner"       TEXT    NOT NULL DEFAULT '',
  "cancellationDate"       TEXT    NOT NULL DEFAULT '',
  "targetCompletionDate"   TEXT    NOT NULL DEFAULT '',
  "actualCompletionDate"   TEXT,
  "offboardingStatus"      TEXT    NOT NULL DEFAULT 'Initiated',
  "finalBillingStatus"     TEXT    NOT NULL DEFAULT 'Not Started',
  "assetTransferStatus"    TEXT    NOT NULL DEFAULT 'Not Started',
  "accessRemovalStatus"    TEXT    NOT NULL DEFAULT 'Active',
  "completionPct"          NUMERIC NOT NULL DEFAULT 0,
  mrr                      NUMERIC NOT NULL DEFAULT 0,
  arr                      NUMERIC NOT NULL DEFAULT 0,
  reason                   TEXT    NOT NULL DEFAULT '',
  "departmentsInvolved"    JSONB   NOT NULL DEFAULT '[]',
  services                 JSONB   NOT NULL DEFAULT '[]',
  checklist                JSONB   NOT NULL DEFAULT '[]',
  "departmentTasks"        JSONB   NOT NULL DEFAULT '[]',
  "assetTransfers"         JSONB   NOT NULL DEFAULT '[]',
  "accessRemovals"         JSONB   NOT NULL DEFAULT '[]',
  "finalBilling"           JSONB   NOT NULL DEFAULT '{}',
  "knowledgeArchive"       JSONB   NOT NULL DEFAULT '{}',
  "aiSummary"              JSONB   NOT NULL DEFAULT '{}',
  "activityTimeline"       JSONB   NOT NULL DEFAULT '[]',
  "createdAt"              TEXT    NOT NULL DEFAULT (now()::text),
  CONSTRAINT pending_offboarding_records_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS pending_offboarding_records_created_at_idx
  ON pending_offboarding_records ("createdAt");

-- ── 3. expansion_opportunity_status ──────────────────────────────────────────
--
-- Replaces data/expansion-opportunity-status.json.
-- One record per opportunityId (upsert semantics in the route).
-- opportunityId is the primary key — the route already does upsert-by-id.

CREATE TABLE IF NOT EXISTS expansion_opportunity_status (
  "opportunityId"  TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT '',
  "updatedAt"      TEXT NOT NULL DEFAULT (now()::text),
  CONSTRAINT expansion_opportunity_status_pkey PRIMARY KEY ("opportunityId")
);

-- ── 4. dept_report_status ─────────────────────────────────────────────────────
--
-- Replaces data/dept-report-status.json.
-- One record per reportId (upsert semantics in the route).
-- reportId is the primary key.

CREATE TABLE IF NOT EXISTS dept_report_status (
  "reportId"   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT '',
  "updatedAt"  TEXT NOT NULL DEFAULT (now()::text),
  CONSTRAINT dept_report_status_pkey PRIMARY KEY ("reportId")
);
