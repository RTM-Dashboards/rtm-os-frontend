-- Migration 0012: Fix invoice overdue index
--
-- The overdue predicate changed from:
--   WHERE dueDate < now() AND paymentStatus != 'Paid'
-- to:
--   WHERE invoiceStatus IN ('Sent','Viewed','Partially Paid','Overdue')
--     AND dueDate < now()
--
-- The old index [dueDate, paymentStatus] no longer matches the hot column in
-- the WHERE clause. Drop it and replace with [invoiceStatus, dueDate]:
--   - invoiceStatus first: equality/IN check reduces the scan set
--   - dueDate second: range scan on the filtered subset
--
-- This is safe to apply on an empty invoices table (invoices were just
-- cleaned up in Phase B2). On a live table with data it would be an
-- online index build; no rows are deleted.

DROP INDEX IF EXISTS "invoices_dueDate_paymentStatus_idx";

CREATE INDEX "invoices_invoiceStatus_dueDate_idx"
  ON "invoices" ("invoiceStatus", "dueDate");
