-- Migration: 20261201_health_priority_nullable_default
--
-- PURPOSE
--   clientHealth and priority columns were added with DEFAULT 'Good' and
--   DEFAULT 'Medium' (NOT NULL). Every row inserted without an explicit value
--   therefore looks like a manually-set override, making it impossible to
--   distinguish "operator chose Good" from "the column was never touched".
--
--   This migration changes both defaults to '' (empty string), so:
--     - empty  → compute from billing signals (derived, no override)
--     - non-empty → explicit human override that wins over the computation
--
--   Existing rows are NOT updated. The 1 row that currently carries
--   'Good' / 'Medium' from the previous default is reported below.
--
-- EXISTING ROWS CARRYING OLD DEFAULTS (reported, not changed)
--   At migration time there is 1 business row. Its clientHealth = 'Good' and
--   priority = 'Medium'. These values may have been deliberately set by an
--   operator, or they may be the previous default. Because we cannot distinguish
--   the two, we leave them in place.
--
--   Effect on that row in the API:
--     clientHealth = 'Good'  → treated as a human override (overrideSource: "stored")
--     priority = 'Medium'    → treated as a human override (overrideSource: "stored")
--
--   To mark it as derived instead, an operator can clear the column:
--     UPDATE businesses SET "clientHealth" = '', priority = '' WHERE id = '<id>';
--
-- SCHEMA CHANGE
--   Change DEFAULT from the old string value to '' for both columns.
--   The NOT NULL constraint is preserved; '' is the sentinel for "compute it".

ALTER TABLE businesses
  ALTER COLUMN "clientHealth" SET DEFAULT '',
  ALTER COLUMN priority       SET DEFAULT '';
