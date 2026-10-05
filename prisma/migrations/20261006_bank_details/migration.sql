-- RTM OS — Bank Details Migration
--
-- Creates a single-row bank_details table, separate from company_config.
-- Separation is intentional: the gate differs.
--   company_config  → gated at Executive (identity/presentation)
--   bank_details    → gated at Billing Manager via requireDepartment
--                     (Executives and SystemAdmins also pass)
--
-- The reference column intentionally does not exist here: the reference on a
-- wire transfer is the invoice number, which is per-invoice and is never stored
-- in configuration.
--
-- id is fixed to 1 (singleton row, enforced by CHECK constraint).

CREATE TABLE IF NOT EXISTS bank_details (
  id               INT          PRIMARY KEY DEFAULT 1,
  account_holder   TEXT         NOT NULL DEFAULT '',
  bank_name        TEXT         NOT NULL DEFAULT '',
  routing_number   TEXT         NOT NULL DEFAULT '',
  account_number   TEXT         NOT NULL DEFAULT '',
  swift_code       TEXT         NOT NULL DEFAULT '',
  created_at       TEXT         NOT NULL DEFAULT '',
  updated_at       TEXT         NOT NULL DEFAULT '',

  CONSTRAINT bank_details_singleton CHECK (id = 1)
);

-- Seed the initial row with the bank details supplied by Fe.
-- NOTE: These details are UNCONFIRMED. Billing must verify them before any
-- invoice goes out. The seed exists so the transfer block renders immediately
-- for testing; it is not a representation of confirmed live banking data.
INSERT INTO bank_details (id, account_holder, bank_name, routing_number, account_number, swift_code, created_at, updated_at)
VALUES (
  1,
  'Real Time Marketing',
  'Wells Fargo',
  '121000248',
  '40630255962032424',
  'WFBIUS6SXXX',
  NOW()::TEXT,
  NOW()::TEXT
)
ON CONFLICT (id) DO NOTHING;
