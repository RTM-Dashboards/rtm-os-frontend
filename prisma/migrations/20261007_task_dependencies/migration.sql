-- RTM OS: Task Dependencies Migration
-- Batch One of Three: Schema, blocked state, cascade on close.
--
-- CHANGES:
--   1. task_dependencies: join table expressing "task_id requires requires_task_id
--      to be done before it can start". Queried from both ends.
--   2. tasks.offset_from: "launch" | "prereq". Controls how due_date is computed.
--      Existing rows default to "launch" — no behaviour change for tasks without deps.
--
-- CYCLE PREVENTION: enforced by the application (cascade uses a visited set).
-- The DB does not have a check constraint for cycles; the application refuses
-- any dependency edge that would create one before inserting.

-- ── 1. task_dependencies join table ─────────────────────────────────────────
CREATE TABLE task_dependencies (
  id               TEXT PRIMARY KEY,
  task_id          TEXT NOT NULL,       -- the task that is waiting
  requires_task_id TEXT NOT NULL,       -- the task that must be done first
  created_at       TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_task_dependencies_task_id     ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_requires_id ON task_dependencies(requires_task_id);

-- Uniqueness: a task cannot depend on the same prerequisite twice.
CREATE UNIQUE INDEX idx_task_dependencies_unique ON task_dependencies(task_id, requires_task_id);

-- ── 2. tasks.offset_from ────────────────────────────────────────────────────
-- "launch"  = due_date set at launch time (offsetDays from launchDate).
-- "prereq"  = due_date set when the last prerequisite closes (closedAt + offsetDays).
-- Default "launch" preserves all existing task behaviour.
ALTER TABLE tasks ADD COLUMN offset_from TEXT NOT NULL DEFAULT 'launch';
ALTER TABLE tasks ADD COLUMN offset_days INTEGER NOT NULL DEFAULT 0;
