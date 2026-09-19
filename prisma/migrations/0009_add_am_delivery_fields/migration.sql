-- Migration: 0009_add_am_delivery_fields
--
-- Adds four AM delivery lifecycle columns to the `businesses` table.
-- ADDITIVE ONLY. No existing column is altered or dropped.
-- No existing row is broken: all new columns have defaults or are nullable.
--
-- cleared:          BOOLEAN NOT NULL DEFAULT false
--                   Billing's payment verification gate. Billing sets this to
--                   true after confirming payment; AM pages gate their activation
--                   workflow on this flag.
--
-- kickoffCompleted: BOOLEAN NOT NULL DEFAULT false
--                   Set to true by AM when the kickoff call with the client is done.
--
-- kickoffDate:      TEXT (nullable, ISO-8601 date string)
--                   Date the kickoff call occurred. NULL until the kickoff is complete.
--
-- assignedAt:       TEXT (nullable, ISO-8601 timestamp string)
--                   Timestamp of the most recent AM assignment or reassignment.
--                   NULL until first assignment. Follows the existing schema
--                   convention of storing timestamps as ISO-8601 strings.

-- AlterTable: businesses — add cleared
ALTER TABLE "businesses"
    ADD COLUMN "cleared" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: businesses — add kickoffCompleted
ALTER TABLE "businesses"
    ADD COLUMN "kickoffCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: businesses — add kickoffDate
ALTER TABLE "businesses"
    ADD COLUMN "kickoffDate" TEXT;

-- AlterTable: businesses — add assignedAt
ALTER TABLE "businesses"
    ADD COLUMN "assignedAt" TEXT;
