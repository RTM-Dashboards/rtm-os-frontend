-- Add recurrence columns to tasks table
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_interval_days INTEGER NOT NULL DEFAULT 0;
