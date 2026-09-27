-- RTM OS — Service Catalogue Migration
-- Creates three tables:
--   service_catalog_items   — Budget Optimizer service catalogue
--   discount_tiers          — Discount percentage tiers
--   discount_type_options   — Discount behaviour types
--
-- Applied by hand:
--   npx prisma db execute --file prisma/migrations/20260928_service_catalogue/migration.sql
--   npx prisma migrate resolve --applied 20260928_service_catalogue
--   npx prisma generate

CREATE TABLE "service_catalog_items" (
  "id"                  TEXT         NOT NULL,
  "catalogId"           TEXT         NOT NULL DEFAULT '',
  "label"               TEXT         NOT NULL,
  "description"         TEXT         NOT NULL DEFAULT '',
  "quantityUnit"        TEXT         NOT NULL DEFAULT 'flat',
  "quantityOptions"     INTEGER[]    NOT NULL DEFAULT '{}',
  "defaultQuantity"     INTEGER      NOT NULL DEFAULT 1,
  "defaultMonthlyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "defaultSetupFee"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "minMonthlyPrice"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "maxMonthlyPrice"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "setupFeeEditable"    BOOLEAN      NOT NULL DEFAULT false,
  "department"          TEXT         NOT NULL DEFAULT '',
  "isRecurring"         BOOLEAN      NOT NULL DEFAULT true,
  "isActive"            BOOLEAN      NOT NULL DEFAULT true,
  "isDefault"           BOOLEAN      NOT NULL DEFAULT false,
  "sortOrder"           INTEGER      NOT NULL DEFAULT 0,
  "createdAt"           TEXT         NOT NULL DEFAULT '',
  "updatedAt"           TEXT         NOT NULL DEFAULT '',
  CONSTRAINT "service_catalog_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "discount_tiers" (
  "id"          TEXT             NOT NULL,
  "label"       TEXT             NOT NULL,
  "percentage"  DOUBLE PRECISION NOT NULL DEFAULT 0,
  "sortOrder"   INTEGER          NOT NULL DEFAULT 0,
  "createdAt"   TEXT             NOT NULL DEFAULT '',
  "updatedAt"   TEXT             NOT NULL DEFAULT '',
  CONSTRAINT "discount_tiers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "discount_type_options" (
  "id"          TEXT    NOT NULL,
  "value"       TEXT    NOT NULL,
  "label"       TEXT    NOT NULL,
  "description" TEXT    NOT NULL DEFAULT '',
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TEXT    NOT NULL DEFAULT '',
  "updatedAt"   TEXT    NOT NULL DEFAULT '',
  CONSTRAINT "discount_type_options_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "discount_type_options_value_key" UNIQUE ("value")
);
