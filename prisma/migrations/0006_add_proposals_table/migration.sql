-- Migration: 0006_add_proposals_table
-- Adds proposals table for sales proposal wizard persistence.
-- Only ADDS a table. Does not touch leads, lead_statuses, opportunities,
-- ghl_webhook_logs, users, pipeline_stages, lead_stages, or kpi_definitions.
-- Existing data is safe.
--
-- Replaces data/sales-proposals.json (file-backed store) which is read-only
-- in Vercel's serverless environment, causing every production write to be
-- silently discarded.
--
-- Scalar fields that callers filter or may sort by are real columns.
-- Nested objects and arrays that are always read/written as a whole are
-- JSONB columns — same pattern as the opportunities table.
-- Arbitrary extra wizard fields (wizardId, linkedOpportunityId, etc.) are
-- captured in extraFields JSONB so no data is dropped.

-- CreateTable: proposals
CREATE TABLE "proposals" (
    "id"                                TEXT        NOT NULL,
    "status"                            TEXT        NOT NULL DEFAULT 'draft',
    "opportunityId"                     TEXT,
    "leadId"                            TEXT,
    "currentStep"                       INTEGER     NOT NULL DEFAULT 1,
    "completedSteps"                    INTEGER[]   NOT NULL DEFAULT ARRAY[]::INTEGER[],
    "selectedGoals"                     TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],
    "auditMode"                         TEXT,
    "selectedAuditId"                   TEXT,
    "approvedRecommendations"           TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],
    "approvedRecommendationServiceNames" TEXT[]     NOT NULL DEFAULT ARRAY[]::TEXT[],
    "discountPercentage"                DOUBLE PRECISION NOT NULL DEFAULT 0,
    "preselectedAuditId"                TEXT,
    "preselectedAuditType"              TEXT,
    "clientInfo"                        JSONB,
    "auditResult"                       JSONB,
    "lineItems"                         JSONB,
    "discount"                          JSONB,
    "budgetResult"                      JSONB,
    "proposalDocument"                  JSONB,
    "intakeRecord"                      JSONB,
    "aiAuditResult"                     JSONB,
    "extraFields"                       JSONB,
    "lastSavedAt"                       TEXT,
    "sentAt"                            TEXT,
    "createdAt"                         TEXT        NOT NULL DEFAULT '',
    "updatedAt"                         TEXT        NOT NULL DEFAULT '',

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);
