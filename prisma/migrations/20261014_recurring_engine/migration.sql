-- RTM OS: Recurring Engine Schema
--
-- Adds three columns to the tasks table to support the recurring task
-- generation engine introduced in this run.
--
-- COLUMNS:
--
--   blueprint_task_id TEXT
--     The localId of the blueprint task this row was generated from
--     (e.g. "bpt-001-1"). Null for setup tasks and legacy recurring tasks
--     created before this migration.
--     Used by the engine to find the recurring task definition and carry
--     owner continuity from the previous occurrence.
--
--   blueprint_template_id TEXT
--     The task_list_templates.id this row came from (e.g. "tlt-bp001").
--     Null for setup tasks. Indexed: the engine queries tasks by
--     (categoryId, blueprint_template_id) to find previous occurrences.
--
--   occurrence_key TEXT UNIQUE (nullable)
--     Deterministic idempotency key for recurring occurrences.
--     Format: "<templateId>:<blueprintTaskLocalId>:<categoryId>:<dueDate>"
--     Example: "tlt-bp001:bpt-001-r1:cat-1234567890:2026-11-14"
--     Null for setup tasks. The UNIQUE constraint guarantees that running
--     generation twice never produces duplicate rows.
--
-- NOTE: No Prisma enums are used. All new columns are plain TEXT or BOOLEAN
-- with string values, consistent with the rest of this schema.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS blueprint_task_id    TEXT,
  ADD COLUMN IF NOT EXISTS blueprint_template_id TEXT,
  ADD COLUMN IF NOT EXISTS occurrence_key        TEXT;

-- Unique index on occurrence_key (partial — only for non-null values so that
-- setup tasks, which have occurrence_key = NULL, are never excluded by the
-- constraint. Two NULLs are not considered equal by UNIQUE in Postgres).
CREATE UNIQUE INDEX IF NOT EXISTS tasks_occurrence_key_unique
  ON tasks (occurrence_key)
  WHERE occurrence_key IS NOT NULL;

-- Index blueprint_template_id for the engine's "find previous occurrence"
-- query: WHERE category_id = ? AND blueprint_template_id = ? AND blueprint_task_id = ?
CREATE INDEX IF NOT EXISTS tasks_blueprint_template_idx
  ON tasks (blueprint_template_id)
  WHERE blueprint_template_id IS NOT NULL;
