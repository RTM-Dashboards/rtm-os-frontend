-- Migration: 0015_add_role_audit_fields
-- Adds roleSetBy and roleSetAt to the users table.
-- roleSetBy: the id of the User who last changed this row's role/status/department.
-- roleSetAt: ISO-8601 string of when that change was made.
-- Both are nullable: existing rows have no role-change history yet.
-- No data is removed. Safe to apply on a live database.

ALTER TABLE "users"
  ADD COLUMN "roleSetBy" TEXT,
  ADD COLUMN "roleSetAt" TEXT;
