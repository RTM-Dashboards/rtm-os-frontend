-- Migration: 20261016_sla_exclude_weekends
--
-- Adds four boolean "exclude weekends" flags to task_list_templates.
-- One flag per SLA day-count field, controlling whether that day count
-- should be computed in business days (weekends skipped) or plain
-- calendar days.
--
-- DEFAULT false = calendar days. Weekend exclusion is opt-in, matching
-- Teamwork behaviour.
--
-- The columns already exist in the production database (added via direct
-- ALTER TABLE in a previous run without a migration file). Using
-- ADD COLUMN IF NOT EXISTS makes this migration a no-op against the
-- current database and correct against a fresh one.

ALTER TABLE task_list_templates
  ADD COLUMN IF NOT EXISTS first_response_exclude_weekends    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS target_completion_exclude_weekends BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS due_date_offset_exclude_weekends   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS escalation_exclude_weekends        BOOLEAN NOT NULL DEFAULT false;
