-- RTM OS — Projects Delivery Schema
--
-- This migration restructures the empty projects table and adds:
--   project_categories   one category per service sold, beneath the project
--   tasks                one task per deliverable, belonging to a category
--   task_list_templates  per-service task template (setup + recurring groups)
--   users.is_main        marks Account Management main-vs-support assignment
--
-- PROJECTS TABLE RESTRUCTURED
-- The existing projects table is empty. The old shape (one project per service
-- with a single `service` text column) is replaced by one project per domain.
-- The `service` column is dropped; a `deliverables` Json column is also dropped
-- because deliverables are now tasks. Everything else is preserved or renamed.
-- The API route at app/api/projects/route.ts will be rewritten in this run to
-- match the new shape.

-- 1. Drop old columns that are replaced by the new model.
--    `service` was the service-per-project identifier; replaced by categories.
--    `deliverables` was a Json blob; replaced by tasks.
ALTER TABLE "projects" DROP COLUMN IF EXISTS "service";
ALTER TABLE "projects" DROP COLUMN IF EXISTS "deliverables";

-- 2. is_main on users
--    Nullable boolean. NULL means "not applicable" (no department, or a
--    department that doesn't use Main/Support routing today).
--    TRUE = Main; FALSE = Support.
--    Only Account Management uses this today; the field is schema-level optional
--    everywhere else, as decided.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_main" BOOLEAN;

-- 3. project_categories
--    One row per service sold, belonging to a project.
--    serviceId links back to service_catalog_items.id (no FK constraint —
--    matching the codebase convention of plain string references).
--    department is denormalised here from the catalogue so a query of
--    "all categories in a department" does not need a join.
CREATE TABLE IF NOT EXISTS "project_categories" (
  "id"            TEXT        NOT NULL,
  "project_id"    TEXT        NOT NULL,
  "service_id"    TEXT        NOT NULL DEFAULT '',
  "service_label" TEXT        NOT NULL DEFAULT '',
  "department"    TEXT        NOT NULL DEFAULT '',
  "created_at"    TEXT        NOT NULL DEFAULT '',

  CONSTRAINT "project_categories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "project_categories_project_id_idx"
  ON "project_categories" ("project_id");

-- 4. task_list_templates
--    One row per service. AMs will configure this in a later run.
--    For now the table exists so the launch can attempt a lookup and fall back
--    gracefully when no template exists.
--
--    groups is a Json array of:
--      { kind: "setup" | "recurring", heading: string,
--        tasks: [{ label: string, offsetDays: number }] }
--
--    recurrenceRule is reserved for the recurring-task generation run.
--    It is nullable and unused in this run.
CREATE TABLE IF NOT EXISTS "task_list_templates" (
  "id"              TEXT        NOT NULL,
  "service_id"      TEXT        NOT NULL DEFAULT '',
  "groups"          JSONB       NOT NULL DEFAULT '[]',
  "recurrence_rule" TEXT,
  "created_at"      TEXT        NOT NULL DEFAULT '',
  "updated_at"      TEXT        NOT NULL DEFAULT '',

  CONSTRAINT "task_list_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "task_list_templates_service_id_idx"
  ON "task_list_templates" ("service_id");

-- 5. tasks
--    One row per deliverable instance. Belongs to a category.
--    owner_id is a User.id (nullable — tasks may be unassigned at creation).
--    is_setup TRUE = created at launch; FALSE = recurring (not generated yet).
--    status: "open" | "in_progress" | "done" | "skipped"
--    due_date is an ISO-8601 date string, nullable.
CREATE TABLE IF NOT EXISTS "tasks" (
  "id"          TEXT        NOT NULL,
  "category_id" TEXT        NOT NULL,
  "label"       TEXT        NOT NULL DEFAULT '',
  "status"      TEXT        NOT NULL DEFAULT 'open',
  "owner_id"    TEXT,
  "due_date"    TEXT,
  "is_setup"    BOOLEAN     NOT NULL DEFAULT TRUE,
  "created_at"  TEXT        NOT NULL DEFAULT '',
  "updated_at"  TEXT        NOT NULL DEFAULT '',

  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tasks_category_id_idx"
  ON "tasks" ("category_id");

CREATE INDEX IF NOT EXISTS "tasks_owner_id_idx"
  ON "tasks" ("owner_id");
