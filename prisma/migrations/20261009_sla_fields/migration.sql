-- Migration: 20261009_sla_fields
-- Adds four nullable SLA policy fields to task_list_templates.
-- All four default to NULL (not set) until Account Management fills them.
-- Units: days (integer). first_response_days and target_completion_days are
-- business days (matching the addBusinessDays usage in lib/dates.ts).
-- due_date_offset_days and escalation_after_days are calendar days.

ALTER TABLE task_list_templates
  ADD COLUMN IF NOT EXISTS first_response_days    INTEGER,
  ADD COLUMN IF NOT EXISTS target_completion_days INTEGER,
  ADD COLUMN IF NOT EXISTS due_date_offset_days   INTEGER,
  ADD COLUMN IF NOT EXISTS escalation_after_days  INTEGER;
