-- Migration: 20261017_contract_end_date
--
-- Adds contractEndDate to the contracts table.
--
-- The end date is computed at the moment a contract is marked signed:
--   contractEndDate = signedDate + termLengthMonths
-- and stored as an ISO-8601 string, following the existing timestamp
-- convention in this schema (all timestamp columns are text, not DateTime).
--
-- NULL when signedDate is absent or termLengthMonths is unknown; no synthetic
-- date is ever computed from a null signedDate.
--
-- Using ADD COLUMN IF NOT EXISTS so the migration is a no-op if the column
-- was already added via a direct ALTER TABLE.

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS "contractEndDate" text;
