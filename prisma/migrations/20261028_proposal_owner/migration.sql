-- Migration: add created_by_user_id to proposals
-- Records the RTM rep (signed-in user) who created the proposal.
-- Nullable: existing rows will show NULL until a rep creates a new proposal.
-- No backfill: existing rows have no reliable attribution source.

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS created_by_user_id TEXT;
