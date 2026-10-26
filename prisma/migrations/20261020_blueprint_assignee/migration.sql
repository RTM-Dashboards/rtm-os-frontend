-- Migration: 20261020_blueprint_assignee
-- Adds blueprint_assignee_id to tasks.
--
-- PURPOSE:
--   Each blueprint task may now name a specific user (by id) as the intended
--   owner.  When the blueprint is applied to a project, apply-blueprint.ts
--   reads this id and assigns the task directly instead of running department
--   workload routing through pickOwner.
--
--   blueprint_assignee_id carries the user id that the blueprint author
--   selected in the editor at the time the blueprint was saved.  It is written
--   once at task-creation time and never updated by the recurring engine.
--   If the named person is inactive or missing at apply-time the column is
--   left NULL and department routing is used as the fallback (the fallback is
--   recorded in apply result errors for reporting).
--
-- COLUMN CHOICE:
--   Added to tasks (not to task_list_templates) because task_list_templates
--   already carries assigneeUserId inside the groups JSONB column per task def.
--   The tasks column is the "resolved at apply-time" snapshot, separate from
--   the blueprint definition.
--
--   No FK constraint: user rows may be soft-deleted or deactivated without
--   needing to null out historical task rows.  The application layer handles
--   inactive users before writing.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS blueprint_assignee_id TEXT;
