-- Migration: 0002_add_ghl_webhook_log
--
-- 1. Reconcile schema drift: add ghlLastStagePushedAt to lead_statuses if it
--    does not already exist (the column was added directly to the DB by a prior
--    run before a migration was generated).
--
-- 2. Create the ghl_webhook_logs table for raw inbound webhook payload capture.
--    Postgres only — Vercel's serverless filesystem is read-only so file-backed
--    capture silently discards every payload in production.

-- 1. Drift reconciliation: ghlLastStagePushedAt on lead_statuses
ALTER TABLE "lead_statuses"
  ADD COLUMN IF NOT EXISTS "ghlLastStagePushedAt" TEXT;

-- 2. Raw webhook payload capture table
CREATE TABLE IF NOT EXISTS "ghl_webhook_logs" (
    "id"            SERIAL          NOT NULL,
    "receivedAt"    TEXT            NOT NULL,
    "rawPayload"    JSONB           NOT NULL,
    "ghlContactId"  TEXT            NOT NULL DEFAULT '',
    "leadId"        TEXT,
    "outcome"       TEXT            NOT NULL DEFAULT '',
    "outcomeDetail" TEXT            NOT NULL DEFAULT '',

    CONSTRAINT "ghl_webhook_logs_pkey" PRIMARY KEY ("id")
);
