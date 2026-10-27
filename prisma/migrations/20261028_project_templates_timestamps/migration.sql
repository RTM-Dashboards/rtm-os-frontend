-- Migration: give project_templates.created_at and updated_at real defaults
--
-- Problem: both columns were defined as TEXT NOT NULL DEFAULT ''::text,
-- so a row inserted without explicit values gets an empty string instead of
-- a creation timestamp.  This makes it impossible to sort, display, or
-- reason about when a template was created.
--
-- Fix: change the defaults to now()::text (ISO-8601 wall-clock string in the
-- app's existing text-timestamp convention).  The table is empty so no existing
-- rows need to be back-filled.

ALTER TABLE project_templates
  ALTER COLUMN created_at SET DEFAULT (now()::text);

ALTER TABLE project_templates
  ALTER COLUMN updated_at SET DEFAULT (now()::text);
