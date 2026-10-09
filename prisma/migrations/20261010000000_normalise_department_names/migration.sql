-- RTM OS — Normalise department names to the ten canonical departments
--
-- Mapping applied:
--   SEO              -> SEO & Local
--   GBP              -> SEO & Local
--   PPC              -> Paid Advertising
--   Meta Ads         -> Paid Advertising
--   LSA              -> Local Service Ads
--   Web Development  -> Web Development & Design
--   Design           -> Web Development & Design
--
-- Tables touched:
--   service_catalog_items  (department column)
--   task_list_templates    (department column + groups JSONB tasks[].department)
--   tasks                  (department column — 0 rows today; included for completeness)
--   project_categories     (department column — 0 rows today; included for completeness)
--
-- Tables NOT touched:
--   users (departments are already canonical or blank)
--
-- Run: applied with psql; _prisma_migrations row inserted directly.

-- ── 1. service_catalog_items ──────────────────────────────────────────────────

UPDATE service_catalog_items SET department = 'SEO & Local'            WHERE department = 'SEO';
UPDATE service_catalog_items SET department = 'SEO & Local'            WHERE department = 'GBP';
UPDATE service_catalog_items SET department = 'Paid Advertising'       WHERE department = 'PPC';
UPDATE service_catalog_items SET department = 'Paid Advertising'       WHERE department = 'Meta Ads';
UPDATE service_catalog_items SET department = 'Local Service Ads'      WHERE department = 'LSA';
UPDATE service_catalog_items SET department = 'Web Development & Design' WHERE department = 'Web Development';
UPDATE service_catalog_items SET department = 'Web Development & Design' WHERE department = 'Design';

-- ── 2. task_list_templates — top-level department column ──────────────────────

UPDATE task_list_templates SET department = 'SEO & Local'              WHERE department = 'SEO';
UPDATE task_list_templates SET department = 'SEO & Local'              WHERE department = 'GBP';
UPDATE task_list_templates SET department = 'Paid Advertising'         WHERE department = 'PPC';
UPDATE task_list_templates SET department = 'Paid Advertising'         WHERE department = 'Meta Ads';
UPDATE task_list_templates SET department = 'Local Service Ads'        WHERE department = 'LSA';
UPDATE task_list_templates SET department = 'Web Development & Design'  WHERE department = 'Web Development';
UPDATE task_list_templates SET department = 'Web Development & Design'  WHERE department = 'Design';

-- ── 3. task_list_templates — groups JSONB tasks[].department ─────────────────
--
-- Strategy: replace each old string inside the JSONB using regexp_replace on
-- the serialised JSON. We use exact quoted-string patterns so we never
-- accidentally replace a substring of a longer value.
--
-- Apply one mapping at a time; the order does not matter because the old
-- strings are disjoint.

-- SEO -> SEO & Local
UPDATE task_list_templates
SET groups = groups::text::jsonb
FROM (
  SELECT id, regexp_replace(
    groups::text,
    '"department"\s*:\s*"SEO"',
    '"department": "SEO & Local"',
    'g'
  )::jsonb AS new_groups
  FROM task_list_templates
  WHERE groups::text ~ '"department"\s*:\s*"SEO"'
) sub
WHERE task_list_templates.id = sub.id
  AND groups::text ~ '"department"\s*:\s*"SEO"';

-- GBP -> SEO & Local
UPDATE task_list_templates
SET groups = (
  SELECT regexp_replace(
    groups::text,
    '"department"\s*:\s*"GBP"',
    '"department": "SEO & Local"',
    'g'
  )::jsonb
  FROM task_list_templates t2
  WHERE t2.id = task_list_templates.id
)
WHERE groups::text ~ '"department"\s*:\s*"GBP"';

-- PPC -> Paid Advertising
UPDATE task_list_templates
SET groups = (
  SELECT regexp_replace(
    groups::text,
    '"department"\s*:\s*"PPC"',
    '"department": "Paid Advertising"',
    'g'
  )::jsonb
  FROM task_list_templates t2
  WHERE t2.id = task_list_templates.id
)
WHERE groups::text ~ '"department"\s*:\s*"PPC"';

-- Meta Ads -> Paid Advertising
UPDATE task_list_templates
SET groups = (
  SELECT regexp_replace(
    groups::text,
    '"department"\s*:\s*"Meta Ads"',
    '"department": "Paid Advertising"',
    'g'
  )::jsonb
  FROM task_list_templates t2
  WHERE t2.id = task_list_templates.id
)
WHERE groups::text ~ '"department"\s*:\s*"Meta Ads"';

-- LSA -> Local Service Ads
UPDATE task_list_templates
SET groups = (
  SELECT regexp_replace(
    groups::text,
    '"department"\s*:\s*"LSA"',
    '"department": "Local Service Ads"',
    'g'
  )::jsonb
  FROM task_list_templates t2
  WHERE t2.id = task_list_templates.id
)
WHERE groups::text ~ '"department"\s*:\s*"LSA"';

-- Web Development -> Web Development & Design
UPDATE task_list_templates
SET groups = (
  SELECT regexp_replace(
    groups::text,
    '"department"\s*:\s*"Web Development"',
    '"department": "Web Development & Design"',
    'g'
  )::jsonb
  FROM task_list_templates t2
  WHERE t2.id = task_list_templates.id
)
WHERE groups::text ~ '"department"\s*:\s*"Web Development"';

-- Design -> Web Development & Design
UPDATE task_list_templates
SET groups = (
  SELECT regexp_replace(
    groups::text,
    '"department"\s*:\s*"Design"',
    '"department": "Web Development & Design"',
    'g'
  )::jsonb
  FROM task_list_templates t2
  WHERE t2.id = task_list_templates.id
)
WHERE groups::text ~ '"department"\s*:\s*"Design"';

-- ── 4. tasks — department column (0 rows today; future-safe) ─────────────────

UPDATE tasks SET department = 'SEO & Local'              WHERE department = 'SEO';
UPDATE tasks SET department = 'SEO & Local'              WHERE department = 'GBP';
UPDATE tasks SET department = 'Paid Advertising'         WHERE department = 'PPC';
UPDATE tasks SET department = 'Paid Advertising'         WHERE department = 'Meta Ads';
UPDATE tasks SET department = 'Local Service Ads'        WHERE department = 'LSA';
UPDATE tasks SET department = 'Web Development & Design'  WHERE department = 'Web Development';
UPDATE tasks SET department = 'Web Development & Design'  WHERE department = 'Design';

-- ── 5. project_categories — department column (0 rows today; future-safe) ────

UPDATE project_categories SET department = 'SEO & Local'              WHERE department = 'SEO';
UPDATE project_categories SET department = 'SEO & Local'              WHERE department = 'GBP';
UPDATE project_categories SET department = 'Paid Advertising'         WHERE department = 'PPC';
UPDATE project_categories SET department = 'Paid Advertising'         WHERE department = 'Meta Ads';
UPDATE project_categories SET department = 'Local Service Ads'        WHERE department = 'LSA';
UPDATE project_categories SET department = 'Web Development & Design'  WHERE department = 'Web Development';
UPDATE project_categories SET department = 'Web Development & Design'  WHERE department = 'Design';
