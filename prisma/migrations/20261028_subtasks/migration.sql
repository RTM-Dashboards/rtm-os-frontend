-- Migration: subtasks — add parent_task_id to tasks
--
-- A task may have a parent task. A subtask belongs to the same category (and
-- therefore the same project) as its parent — enforced at the API layer when
-- the subtask is created (parentTaskId's category must match the supplied
-- categoryId).
--
-- DEPTH: one level only. A subtask cannot itself have subtasks. The API layer
-- enforces this by checking that parent_task_id IS NULL on the parent row
-- before accepting the creation request.
--
-- ON DELETE: CASCADE. Deleting a parent deletes its subtasks.
--   Rationale: a subtask without a parent is orphaned work that can never be
--   found through the UI. SET NULL would silently promote subtasks to top-level
--   tasks, changing their meaning. CASCADE is the honest choice: if the parent
--   is deleted, the child work items defined under it are gone too. The same
--   semantic applies in Teamwork.
--
-- INDEX: on parent_task_id so "fetch all subtasks of task X" is fast.
--
-- No backfill needed: all existing rows have no parent (IS NULL = top-level).

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS parent_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS tasks_parent_task_id_idx
  ON tasks (parent_task_id)
  WHERE parent_task_id IS NOT NULL;
