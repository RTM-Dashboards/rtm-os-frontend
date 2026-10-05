-- RTM OS — Company Config Migration
-- Adds a single-row table holding company-wide identity used on all
-- client-facing documents (invoices, proposals, contracts).
--
-- SINGLE-ROW GUARANTEE: a fixed id of 1 with a CHECK constraint ensures only
-- one row can ever exist. INSERT with id=1 fails with a unique violation;
-- any INSERT with id<>1 fails with the CHECK constraint. The only way to
-- change the row is PATCH (UPDATE). No application logic required to enforce
-- singularity.
--
-- logo_url stores a URL string (absolute or root-relative path).
-- Rationale: the logo already lives at /rtm-logo.png in public/; a URL
-- reference means the invoice renderer just puts it in an <img src="...">
-- without any server-side file handling. File upload is explicitly out of scope.
-- A root-relative path like /rtm-logo.png also works in production without
-- environment-specific base-URL juggling.
--
-- Applied by hand:
--   npx prisma db execute --file prisma/migrations/20261006_company_config/migration.sql --schema prisma/schema.prisma
--   npx prisma migrate resolve --applied 20261006_company_config
--   npx prisma generate

CREATE TABLE "company_config" (
  -- Fixed primary key. id=1 is the only allowed value.
  "id"                  INTEGER       PRIMARY KEY DEFAULT 1,

  -- Legal entity name printed on all client-facing documents.
  "legalName"           TEXT          NOT NULL DEFAULT '',

  -- Full mailing address (multi-line acceptable).
  "address"             TEXT          NOT NULL DEFAULT '',

  -- Primary phone number.
  "phone"               TEXT          NOT NULL DEFAULT '',

  -- Support / billing contact email.
  "supportEmail"        TEXT          NOT NULL DEFAULT '',

  -- URL or root-relative path to the company logo.
  -- e.g. "/rtm-logo.png" or "https://cdn.example.com/logo.png"
  "logoUrl"             TEXT          NOT NULL DEFAULT '',

  -- Default payment terms string printed on invoices, e.g. "Net 30".
  "defaultPaymentTerms" TEXT          NOT NULL DEFAULT '',

  -- Footer text about the card-processing fee and refund policy.
  "refundFooter"        TEXT          NOT NULL DEFAULT '',

  -- Default tax rate as a decimal (0 = 0%, 0.1 = 10%).
  -- RTM clients are currently always exempt; default is 0.
  "defaultTaxRate"      NUMERIC(6,4)  NOT NULL DEFAULT 0,

  -- Text shown on an invoice when the client is tax-exempt.
  "taxExemptionText"    TEXT          NOT NULL DEFAULT '',

  -- ISO-8601 audit timestamps (String convention matching all non-Invoice models).
  "createdAt"           TEXT          NOT NULL DEFAULT '',
  "updatedAt"           TEXT          NOT NULL DEFAULT '',

  -- Single-row guarantee: only id=1 is valid.
  CONSTRAINT "company_config_singleton" CHECK ("id" = 1)
);

-- Seed the one and only row with RTM's real values.
-- Fields with no known value from the audit are left as empty string.
INSERT INTO "company_config" (
  "id",
  "legalName",
  "address",
  "phone",
  "supportEmail",
  "logoUrl",
  "defaultPaymentTerms",
  "refundFooter",
  "defaultTaxRate",
  "taxExemptionText",
  "createdAt",
  "updatedAt"
) VALUES (
  1,
  'Real Time Marketing',
  '4700 Riverview Blvd, Bradenton, Florida 34209, United States',
  '+1 941-289-1234',
  'support@realtimemarketing.com',
  '/rtm-logo.png',
  '',
  'Note: Card transactions are subject to a 2.9% + $0.30 processing fee. This fee is non-refundable.',
  0,
  'Customer is tax exempt',
  NOW()::TEXT,
  NOW()::TEXT
);
