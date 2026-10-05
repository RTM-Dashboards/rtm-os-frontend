-- RTM OS — Invoice Data Run
-- Adds:
--   contracts.address          Json  (address carried from intake)
--   sales_handoffs.address     Json  (copied from contract at handoff creation)
--   clients.address            Json  (written by Process & Create Client)
--   invoices.line_items        Json  (copied from handoff at invoice creation)
--   invoices.period_start      Text  (nullable; nothing populates this run)
--   invoices.period_end        Text  (nullable; nothing populates this run)
--   invoices.payment_link      Text  (nullable; nothing populates this run)
--
-- Address is stored as a Json object (not structured columns) because:
--   1. The intake already holds it as a structured object; a single Json column
--      round-trips it without losing the parts.
--   2. A renderer needs each part individually — Json preserves them.
--   3. Avoids 18 nullable columns (6 fields × 3 tables).
--   4. Consistent with how lineItems and summaryFields are stored in this schema.
--
-- All columns are nullable so existing rows are unaffected.

-- contracts
ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS address JSONB;

-- sales_handoffs
ALTER TABLE sales_handoffs
  ADD COLUMN IF NOT EXISTS address JSONB;

-- clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS address JSONB;

-- invoices: line items, period, payment link
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS "lineItems"    JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "periodStart"  TEXT,
  ADD COLUMN IF NOT EXISTS "periodEnd"    TEXT,
  ADD COLUMN IF NOT EXISTS "paymentLink"  TEXT;
