-- Migration: 0005_add_lead_stages_table
-- Adds lead_stages table for lead stage configuration.
-- Only ADDS a table. Does not touch leads, lead_statuses, opportunities,
-- ghl_webhook_logs, users, pipeline_stages, or kpi_definitions.
-- Existing data is safe.
--
-- Seeded separately from DEFAULT_LEAD_STAGES in lib/sales/lead-stages.ts
-- (the canonical 7-stage list: New Lead, Contact Attempted, Contacted,
-- Discovery Scheduled, Discovery Complete, Qualified, Disqualified).

-- CreateTable: lead_stages
-- Replaces the compile-time LEAD_STAGES / STAGE_CONFIG constants in
-- app/(sales)/sales/leads/page.tsx as the persistence layer for the lead
-- stage list.
-- GET  /api/lead-stages  reads this table (ordered by "order" asc).
-- POST /api/lead-stages  replaces all rows atomically.
CREATE TABLE "lead_stages" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "order"     INTEGER NOT NULL,
    "color"     TEXT NOT NULL DEFAULT '',
    "bg"        TEXT NOT NULL DEFAULT '',
    "border"    TEXT NOT NULL DEFAULT '',
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "lead_stages_pkey" PRIMARY KEY ("id")
);
