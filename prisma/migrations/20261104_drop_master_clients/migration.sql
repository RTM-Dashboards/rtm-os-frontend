-- Migration: drop master_clients table
--
-- Preconditions (verified before applying):
--   1. businesses now has the seven columns from migration
--      20261104_businesses_add_master_client_fields.
--   2. /api/master-clients has been rewritten to read from clients + businesses.
--   3. master_clients has 0 rows (confirmed at start of this run).
--
-- This migration is intentionally separate from the column-add migration so
-- that either can be reverted independently:
--   - To revert this drop: recreate master_clients from the schema in
--     migration 20261029_flat_file_routes_to_pg/migration.sql.
--   - To revert the column add: ALTER TABLE businesses DROP COLUMN for each
--     of the seven columns, then revert /api/master-clients to the original.
--
-- No FK constraints reference master_clients (verified: the prior migration
-- comment and the schema explicitly state no FK was added because the mc-id
-- space was not unified with Postgres ids).

DROP TABLE IF EXISTS master_clients;
