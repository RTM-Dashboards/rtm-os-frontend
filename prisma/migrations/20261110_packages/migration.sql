-- RTM OS — Package Builder
-- Migration: 20261110_packages
--
-- A package is a named, priced bundle of catalogue services. Package Builder
-- is where packages are stored and authored from scratch. It is a Sales-owned
-- feature; packages live in the Sales workspace, not Platform Configuration.
--
-- Tables added:
--   packages
--     - id, name, code (unique), price, billingFrequency, description,
--       recommendedFor (text[]), minBudget, maxBudget, isActive (soft delete),
--       isFeatured, createdAt, updatedAt, createdByUserId
--
--   package_items  (junction, one row per service in the package)
--     - id, packageId → packages.id, serviceId → service_catalog_items.id (soft ref),
--       position (ordering, 0-based), quantity (integer, default 1)
--     - UNIQUE (packageId, serviceId) — a service appears at most once per package
--     - UNIQUE (packageId, position) — positions are unique within a package
--
-- Design mirrors project_templates / project_template_blueprints exactly:
--   header record + ordered junction rows with the same unique-pair constraints.
--
-- serviceId is NOT a hard FK to service_catalog_items. The existing catalogue
-- already uses soft string references on proposals (serviceId slug stored in
-- JSON). Mirroring that pattern keeps retired services resolvable by id just as
-- retired catalogue items remain fetchable. A hard FK would block retiring a
-- service that is still part of a saved package.
--
-- quantity is the one authorised addition beyond the ConfigPlaceholder spec.
-- service_catalog_items carries quantityUnit and quantityOptions, so a bundle
-- of "three locations of Local SEO" cannot be expressed without it.
-- Per-item price overrides are NOT added; the package has one combined price.
-- Per-line-item price adjustment is a proposal-level concern (next run).

-- ── packages ──────────────────────────────────────────────────────────────────
CREATE TABLE packages (
  id                  TEXT        NOT NULL PRIMARY KEY,
  name                TEXT        NOT NULL,
  code                TEXT        NOT NULL UNIQUE,
  price               FLOAT       NOT NULL DEFAULT 0,
  billing_frequency   TEXT        NOT NULL DEFAULT '',
  description         TEXT        NOT NULL DEFAULT '',
  recommended_for     TEXT[]      NOT NULL DEFAULT '{}',
  min_budget          FLOAT       NOT NULL DEFAULT 0,
  max_budget          FLOAT       NOT NULL DEFAULT 0,
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  is_featured         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TEXT        NOT NULL DEFAULT '',
  updated_at          TEXT        NOT NULL DEFAULT '',
  created_by_user_id  TEXT
);

-- ── package_items ─────────────────────────────────────────────────────────────
-- Junction table: one row per service slot in a package.
-- serviceId is a soft reference matching service_catalog_items.id (a string slug).
-- No hard FK so retired services remain resolvable from saved packages.
CREATE TABLE package_items (
  id          TEXT        NOT NULL PRIMARY KEY,
  package_id  TEXT        NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  service_id  TEXT        NOT NULL,
  position    INTEGER     NOT NULL DEFAULT 0,
  quantity    INTEGER     NOT NULL DEFAULT 1,
  UNIQUE (package_id, service_id),
  UNIQUE (package_id, position)
);

CREATE INDEX idx_pi_package  ON package_items (package_id);
CREATE INDEX idx_pi_service  ON package_items (service_id);
