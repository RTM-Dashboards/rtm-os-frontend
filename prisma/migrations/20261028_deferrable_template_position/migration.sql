-- Migration: make project_template_blueprints(template_id, position) DEFERRABLE
--
-- Problem: swapping two blueprint positions in a single transaction is blocked
-- by the existing non-deferrable UNIQUE(template_id, position) constraint
-- because any intermediate write that touches a position that is momentarily
-- occupied violates the constraint immediately.
--
-- Fix: drop the constraint and recreate it as DEFERRABLE INITIALLY DEFERRED.
-- With this setting the uniqueness check fires at COMMIT rather than at each
-- individual statement, so a reorder written inside one transaction succeeds
-- as long as positions are unique when the transaction commits.
--
-- The UNIQUE(template_id, blueprint_id) constraint and all other constraints
-- are left unchanged.

ALTER TABLE project_template_blueprints
  DROP CONSTRAINT project_template_blueprints_template_id_position_key;

ALTER TABLE project_template_blueprints
  ADD CONSTRAINT project_template_blueprints_template_id_position_key
    UNIQUE (template_id, "position") DEFERRABLE INITIALLY DEFERRED;
