-- Migration: 0014_add_user_auth_fields
-- Adds status, invitedBy, invitedAt, lastLoginAt to the users table.
-- Existing rows get status = 'pending' from the column default.
-- role and department already exist; this migration does not touch them.
-- No data is removed. Safe to apply on a live database.

ALTER TABLE "users"
  ADD COLUMN "status"      TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN "invitedBy"   TEXT,
  ADD COLUMN "invitedAt"   TEXT,
  ADD COLUMN "lastLoginAt" TEXT;
