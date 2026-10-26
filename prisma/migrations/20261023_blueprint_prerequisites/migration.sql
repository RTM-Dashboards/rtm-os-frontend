-- RTM OS — Blueprint Prerequisites
--
-- A blueprint (task_list_templates row) may declare zero or more prerequisite
-- blueprints. When both blueprints are applied to the same project the
-- dependent list's tasks are created in status="pending_prereq" (not
-- workable); they are unblocked when every task of the prerequisite list on
-- that project reaches a terminal state.
--
-- DESIGN DECISIONS (product owner, not to be revisited):
--   1. The prerequisite is declared on the blueprint, not on the project.
--   2. The prerequisite only binds when both blueprints exist on the same
--      project. An unbound prerequisite changes nothing.
--   3. When a list unblocks, its task due dates are recomputed from the
--      completion date of the prerequisite list, not from project launch.
--
-- TWO THINGS REFUSED AT SAVE TIME:
--   a. A cycle (direct or indirect) in the prerequisite graph.
--   b. A recurring blueprint as a prerequisite (it never completes, so
--      anything waiting on it waits forever).
--
-- TASK STATUS EXTENSION:
--   The existing Task.status column is "open" | "in_progress" | "done" |
--   "skipped". We add "pending_prereq" for tasks that are not yet startable
--   because their list-level prerequisite has not finished. This extends the
--   existing blocking concept; no second concept is introduced.
--
--   The column is plain text (no enum), so adding a new value requires no
--   DDL. The constraint enforced in the application layer is:
--     valid_task_statuses = { open, in_progress, done, skipped, pending_prereq }
--
-- ── 1. blueprint_prerequisites join table ────────────────────────────────────
--
-- One row means: blueprint_id must not start until prerequisite_id finishes.
-- Both columns reference task_list_templates.id.
-- A blueprint may have multiple prerequisites (all must finish).
-- A blueprint may be the prerequisite of multiple blueprints.

CREATE TABLE blueprint_prerequisites (
    id                  TEXT        NOT NULL,
    blueprint_id        TEXT        NOT NULL,   -- the waiting blueprint
    prerequisite_id     TEXT        NOT NULL,   -- the blueprint that must finish first
    created_at          TEXT        NOT NULL DEFAULT '',

    CONSTRAINT blueprint_prerequisites_pkey PRIMARY KEY (id),
    -- A pair can only appear once
    CONSTRAINT blueprint_prerequisites_pair_unique UNIQUE (blueprint_id, prerequisite_id),
    -- A blueprint cannot be its own prerequisite
    CONSTRAINT blueprint_prerequisites_no_self_dep CHECK (blueprint_id <> prerequisite_id)
);

CREATE INDEX blueprint_prerequisites_blueprint_idx   ON blueprint_prerequisites (blueprint_id);
CREATE INDEX blueprint_prerequisites_prerequisite_idx ON blueprint_prerequisites (prerequisite_id);

-- ── 2. project_list_prerequisite_bindings table ──────────────────────────────
--
-- When both blueprints are applied to a project the binding is recorded here.
-- This is the runtime record: "on project P, list C waits for list D".
-- depCategoryId  → the ProjectCategory whose tasks are pending_prereq
-- prereqCategoryId → the ProjectCategory that must finish first
--
-- unblocked_at: ISO-8601 string set when the prerequisite list finishes.
-- NULL = still blocked.

CREATE TABLE project_list_prereq_bindings (
    id                  TEXT        NOT NULL,
    project_id          TEXT        NOT NULL,
    dep_category_id     TEXT        NOT NULL,   -- waiting category
    prereq_category_id  TEXT        NOT NULL,   -- must-finish category
    dep_blueprint_id    TEXT        NOT NULL,   -- which blueprint declared the dep
    prereq_blueprint_id TEXT        NOT NULL,   -- which blueprint must finish
    unblocked_at        TEXT,                   -- ISO-8601; NULL = still waiting
    created_at          TEXT        NOT NULL DEFAULT '',

    CONSTRAINT project_list_prereq_bindings_pkey PRIMARY KEY (id),
    -- One dep→prereq pair per project (a list can only wait on a given prereq once)
    CONSTRAINT project_list_prereq_bindings_unique UNIQUE (project_id, dep_category_id, prereq_category_id)
);

CREATE INDEX project_list_prereq_bindings_project_idx        ON project_list_prereq_bindings (project_id);
CREATE INDEX project_list_prereq_bindings_dep_cat_idx        ON project_list_prereq_bindings (dep_category_id);
CREATE INDEX project_list_prereq_bindings_prereq_cat_idx     ON project_list_prereq_bindings (prereq_category_id);
-- Fast lookup for the unblocking path: find all bindings waiting on a given category
CREATE INDEX project_list_prereq_bindings_unblocked_at_idx   ON project_list_prereq_bindings (unblocked_at) WHERE unblocked_at IS NULL;
