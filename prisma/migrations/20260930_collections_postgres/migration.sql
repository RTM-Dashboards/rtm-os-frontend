-- RTM OS — Collections Postgres Migration
--
-- Moves collections state from data/collections-status.json to two Postgres tables.
--
-- collection_states: one row per invoice in the collections queue.
-- collection_logs:   append-only contact event log, one row per log-contact action.
--
-- The stale mc016 file-backed record is NOT migrated (it is unreachable,
-- future-dated, and holds only a placeholder string).
--
-- No data to migrate: mc016 is discarded per spec.
-- No enums added: status vocabularies are plain String columns.

-- ── collection_states ─────────────────────────────────────────────────────────

CREATE TABLE collection_states (
  "invoiceId"          TEXT        NOT NULL PRIMARY KEY,
  "collectionStatus"   TEXT        NOT NULL DEFAULT 'Pending',
  "notes"              TEXT        NOT NULL DEFAULT '',
  "paymentPlanDetails" TEXT        NOT NULL DEFAULT '',
  "lastContactDate"    TEXT        NOT NULL DEFAULT '',
  "nextFollowUp"       TEXT        NOT NULL DEFAULT '',
  "lastActorId"        TEXT,
  "createdAt"          TEXT        NOT NULL DEFAULT '',
  "updatedAt"          TEXT        NOT NULL DEFAULT ''
);

-- ── collection_logs ───────────────────────────────────────────────────────────

CREATE TABLE collection_logs (
  "id"          SERIAL      NOT NULL PRIMARY KEY,
  "invoiceId"   TEXT        NOT NULL,
  "timestamp"   TEXT        NOT NULL,
  "note"        TEXT        NOT NULL DEFAULT '',
  "actorId"     TEXT        NOT NULL
);

CREATE INDEX collection_logs_invoice_id_idx ON collection_logs ("invoiceId");
