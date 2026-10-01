-- RTM OS — Deliverable Groups Migration
-- Adds grouped deliverables to service_catalog_items.
--
-- A deliverable group is a heading and an ordered list of bullet strings.
-- Stored as a JSONB column so the existing one-row/one-PATCH API contract is
-- preserved. Schema: [{ heading: text, bullets: text[] }, ...]
--
-- Existing rows receive an empty array. No existing data is touched.
--
-- Applied by hand:
--   npx prisma db execute --file prisma/migrations/20261002_deliverable_groups/migration.sql --schema prisma/schema.prisma
--   npx prisma migrate resolve --applied 20261002_deliverable_groups
--   npx prisma generate

ALTER TABLE "service_catalog_items"
  ADD COLUMN "deliverableGroups" JSONB NOT NULL DEFAULT '[]'::jsonb;
