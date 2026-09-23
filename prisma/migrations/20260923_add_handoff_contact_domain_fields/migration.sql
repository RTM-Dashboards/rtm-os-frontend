-- RTM OS — SalesHandoff: add domain, contact, and contractAmountCents columns
--
-- All five columns are nullable (String? / Int?) so that:
--   1. Existing rows (hof-seed-0041, 0042, 0043) continue to load without error.
--   2. A handoff created before this change, or from a contract with no website,
--      still saves. Billing sees the field missing and can enter it by hand.
--   3. Billing cannot be given a confident zero for a value that is unknown.
--
-- Applied by: npx prisma db execute --file <this file>
-- Then:       npx prisma migrate resolve --applied <migration-name>
-- Then:       npx prisma generate

ALTER TABLE sales_handoffs
  ADD COLUMN IF NOT EXISTS domain               TEXT,
  ADD COLUMN IF NOT EXISTS "contactName"        TEXT,
  ADD COLUMN IF NOT EXISTS "contactEmail"       TEXT,
  ADD COLUMN IF NOT EXISTS "contactPhone"       TEXT,
  ADD COLUMN IF NOT EXISTS "contractAmountCents" INTEGER;
