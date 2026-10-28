-- Migration: add is_ad_hoc column to tasks
--
-- Hand-made (ad-hoc) tasks are created by an account manager for a specific
-- project category — not generated from a blueprint or recurring engine.
-- They have no blueprintTaskId, no blueprintTemplateId, and no occurrenceKey.
--
-- is_ad_hoc = true marks the row as deliberately hand-created so that:
--   1. applyBlueprintToProject excludes them from the label-match duplicate
--      guard (existingByLabel). A blueprint task named "X" should not be
--      blocked because a hand-made task also named "X" already exists.
--   2. generateRecurringTasks already ignores them (it only queries by
--      blueprintTemplateId + blueprintTaskId, which are both NULL for ad-hoc
--      tasks). No code change needed there.
--   3. UI can render ad-hoc tasks distinctly (e.g. "Ad hoc" badge).
--
-- Default false keeps all existing rows (blueprint/recurring tasks) unchanged.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS is_ad_hoc BOOLEAN NOT NULL DEFAULT FALSE;
