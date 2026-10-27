-- RTM OS — Project Templates
-- Migration: 20261027_project_templates
--
-- A project template is a named, reusable set of task-list blueprints applied
-- to a project together.  It carries no scheduling, SLA, or assignment policy
-- of its own; those live on the blueprints and on the proposal.
--
-- Tables added:
--   project_templates
--     - id, name, description, is_active, created_at, updated_at
--
--   project_template_blueprints  (join table, ordered)
--     - id, template_id → project_templates.id, blueprint_id → task_list_templates.id
--     - position (integer, 0-based display order within the template)
--     - UNIQUE (template_id, blueprint_id) — a blueprint appears in a template at most once
--     - UNIQUE (template_id, position)    — positions are unique within a template
--
-- No FK to projects: templates are a definition; applying one records nothing
-- on the template itself.  Application results are reflected in project_categories
-- and tasks already.

-- ── project_templates ─────────────────────────────────────────────────────────
CREATE TABLE project_templates (
  id           TEXT        NOT NULL PRIMARY KEY,
  name         TEXT        NOT NULL,
  description  TEXT        NOT NULL DEFAULT '',
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TEXT        NOT NULL DEFAULT '',
  updated_at   TEXT        NOT NULL DEFAULT ''
);

-- ── project_template_blueprints ───────────────────────────────────────────────
-- Join table: one row per blueprint slot in a template.
-- blueprint_id references task_list_templates (the existing blueprint store).
CREATE TABLE project_template_blueprints (
  id           TEXT        NOT NULL PRIMARY KEY,
  template_id  TEXT        NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  blueprint_id TEXT        NOT NULL REFERENCES task_list_templates(id) ON DELETE CASCADE,
  position     INTEGER     NOT NULL DEFAULT 0,
  UNIQUE (template_id, blueprint_id),
  UNIQUE (template_id, position)
);

CREATE INDEX idx_ptb_template ON project_template_blueprints (template_id);
CREATE INDEX idx_ptb_blueprint ON project_template_blueprints (blueprint_id);
