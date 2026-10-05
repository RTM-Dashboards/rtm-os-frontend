-- RTM OS — Contract and Handoff Line Items Migration
-- Adds agreed per-service line items to Contract and SalesHandoff.
--
-- A BudgetLineItem carries: serviceId, label, department, quantity,
-- unitMonthlyPrice, setupFee, monthlySubtotal, setupSubtotal, isRecurring.
-- These are the AGREED prices from the proposal, not catalogue defaults.
-- Stored as JSONB so the existing one-row/one-PATCH API contract is preserved.
-- Schema follows the BudgetLineItem shape produced by lib/sales/budget-engine.ts.
--
-- Existing rows receive an empty array — same convention as deliverableGroups.
-- A contract or handoff with no line items shows nothing; it does not error.
--
-- Applied by hand:
--   npx prisma db execute --file prisma/migrations/20261006_contract_line_items/migration.sql --schema prisma/schema.prisma
--   npx prisma migrate resolve --applied 20261006_contract_line_items
--   npx prisma generate

ALTER TABLE "contracts"
  ADD COLUMN "lineItems" JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE "sales_handoffs"
  ADD COLUMN "lineItems" JSONB NOT NULL DEFAULT '[]'::jsonb;
