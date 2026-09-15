-- Migration: add website column to lead_statuses
-- Purpose: allow Edit Lead modal to persist website to the overlay table,
--          which is then dual-written to the leads table on every save.
-- This is an additive, non-breaking change. Existing rows get website = NULL.

ALTER TABLE "lead_statuses" ADD COLUMN IF NOT EXISTS "website" TEXT;
