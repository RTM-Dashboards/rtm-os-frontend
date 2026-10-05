-- RTM OS — Task Department + Template Task Department
--
-- Each task now carries the department that should do the work.
-- This comes from the template task, not from the category.
-- At launch, routing uses this column to find the right member.
--
-- Each template task also gains a department field so Melissa can specify
-- which department handles each step of a service's setup.
--
-- tasks.department: nullable text. NULL means unassigned/unknown.
--   At launch: populated from the template task's department.
--   Existing tasks (none in prod yet) remain NULL.
--
-- task_list_templates.groups already stores tasks as JSONB.
-- The department field is carried inside each task object in the JSONB array.
-- No column change to task_list_templates — only the TS/editor shape changes.
-- The groups schema becomes:
--   [{ kind: "setup"|"recurring", heading: string,
--      tasks: [{ label: string, department: string, offsetDays: number }] }]

-- Add department to tasks (nullable; empty = unassigned).
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "department" TEXT;

-- Index for workload-routing queries (count open tasks per owner per dept
-- is done in memory, but a future direct query will want this).
CREATE INDEX IF NOT EXISTS "tasks_department_idx" ON "tasks" ("department");
