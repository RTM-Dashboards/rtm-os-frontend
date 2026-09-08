-- Migration: 0004_add_pipeline_stages_and_kpi_definitions
-- Adds two new tables for pipeline stage and KPI definition configuration.
-- Only ADDS tables. Does not touch leads, lead_statuses, opportunities,
-- ghl_webhook_logs, or users. Existing data is safe.

-- CreateTable: pipeline_stages
-- Replaces data/pipeline-stages.json as the persistence layer for the
-- pipeline stage configuration editor (/settings/pipeline-config).
-- Seeded separately from DEFAULT_PIPELINE_STAGES (11 canonical stages),
-- NOT from data/pipeline-stages.json (which holds stale 13-stage data).
CREATE TABLE "pipeline_stages" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "order"     INTEGER NOT NULL,
    "color"     TEXT NOT NULL DEFAULT '',
    "bg"        TEXT NOT NULL DEFAULT '',
    "border"    TEXT NOT NULL DEFAULT '',
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable: kpi_definitions
-- Replaces data/kpi-definitions.json as the persistence layer for the KPI
-- visibility settings editor (KpiSettingsSection / /settings/kpi-definitions).
-- Seeded separately from data/kpi-definitions.json, preserving enabled state.
CREATE TABLE "kpi_definitions" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "category"    TEXT NOT NULL,
    "departments" TEXT[],
    "enabled"     BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt"   TEXT NOT NULL DEFAULT '',
    "updatedAt"   TEXT NOT NULL DEFAULT '',

    CONSTRAINT "kpi_definitions_pkey" PRIMARY KEY ("id")
);
