-- Migration: 0010_add_cancellation_billing_status_to_business
--
-- Adds two Billing-owned status columns to the `businesses` table.
-- ADDITIVE ONLY. No existing column is altered or dropped.
-- No existing row is broken: both new columns have NOT NULL DEFAULT values
-- so existing rows receive valid defaults immediately on ALTER.
--
-- cancellationStatus: TEXT NOT NULL DEFAULT 'None'
--                     Cancellation lifecycle for a business (domain).
--                     Billing-owned. Permitted values (enforced by application):
--                     "None" | "Requested" | "In Review" | "Approved" | "Cancelled"
--                     Stored as String, not enum, so values can be added without
--                     a schema migration.
--
-- billingStatus:      TEXT NOT NULL DEFAULT 'Pending'
--                     Billing closure status for a business (domain).
--                     Billing-owned. Permitted values (enforced by application):
--                     "Pending" | "Paid" | "Overdue" | "Cleared" | "Closed"
--                     Stored as String, not enum, so values can be added without
--                     a schema migration.
--
-- Both columns share the same production and local database.
-- The defaults ensure every existing business row gets a safe, valid starting
-- value without any backfill step.

-- AlterTable: businesses — add cancellationStatus
ALTER TABLE "businesses"
    ADD COLUMN "cancellationStatus" TEXT NOT NULL DEFAULT 'None';

-- AlterTable: businesses — add billingStatus
ALTER TABLE "businesses"
    ADD COLUMN "billingStatus" TEXT NOT NULL DEFAULT 'Pending';
