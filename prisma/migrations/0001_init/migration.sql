-- RTM OS — Initial Migration (Phase 1)
-- Creates: leads, lead_statuses, opportunities
-- Generated for: PostgreSQL (Supabase)
--
-- Run via:
--   npx prisma migrate deploy
-- or (for development):
--   npx prisma migrate dev --name init

-- ── leads ────────────────────────────────────────────────────────────────────

CREATE TABLE "leads" (
    "id"                    TEXT NOT NULL,
    "name"                  TEXT NOT NULL DEFAULT '',
    "businessName"          TEXT NOT NULL DEFAULT '',
    "industry"              TEXT NOT NULL DEFAULT '',
    "website"               TEXT NOT NULL DEFAULT '',
    "email"                 TEXT NOT NULL DEFAULT '',
    "phone"                 TEXT NOT NULL DEFAULT '',
    "location"              TEXT NOT NULL DEFAULT '',
    "ghlContactId"          TEXT NOT NULL DEFAULT '',
    "ghlAssignedUser"       TEXT NOT NULL DEFAULT '',
    "ghlSource"             TEXT NOT NULL DEFAULT '',
    "ghlCreatedDate"        TEXT NOT NULL DEFAULT '',
    "ghlLastActivityDate"   TEXT NOT NULL DEFAULT '',
    "ghlContactTags"        TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "ghlContactStatus"      TEXT NOT NULL DEFAULT '',
    "ghlSyncStatus"         TEXT NOT NULL DEFAULT '',
    "ghlOrigin"             BOOLEAN NOT NULL DEFAULT false,
    "ghlLastSyncedAt"       TEXT,
    "ghlSyncError"          TEXT,
    "leadSource"            TEXT NOT NULL DEFAULT '',
    "assignedRep"           TEXT NOT NULL DEFAULT '',
    "stage"                 TEXT NOT NULL DEFAULT 'New Lead',
    "opportunityReadiness"  TEXT NOT NULL DEFAULT 'Not Ready',
    "discoveryScheduled"    BOOLEAN NOT NULL DEFAULT false,
    "discoveryDate"         TEXT NOT NULL DEFAULT '',
    "discoveryNotes"        TEXT NOT NULL DEFAULT '',
    "businessGoals"         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "painPoints"            TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "requestedServices"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "budget"                TEXT NOT NULL DEFAULT 'Unknown',
    "authority"             TEXT NOT NULL DEFAULT 'Unknown',
    "need"                  TEXT NOT NULL DEFAULT 'Low',
    "timeline"              TEXT NOT NULL DEFAULT '6+ months',
    "estimatedValue"        INTEGER NOT NULL DEFAULT 0,
    "affiliateName"         TEXT NOT NULL DEFAULT '—',
    "createdDate"           TEXT NOT NULL DEFAULT '',
    "lastActivity"          TEXT NOT NULL DEFAULT '',
    "notes"                 TEXT NOT NULL DEFAULT '',
    "disqualified"          BOOLEAN NOT NULL DEFAULT false,
    "disqualifiedReason"    TEXT,
    "createdAt"             TEXT NOT NULL DEFAULT '',
    "updatedAt"             TEXT NOT NULL DEFAULT '',

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- ── lead_statuses ─────────────────────────────────────────────────────────────

CREATE TABLE "lead_statuses" (
    "leadId"                TEXT NOT NULL,
    "stage"                 TEXT,
    "assignedRep"           TEXT,
    "discoveryScheduled"    BOOLEAN,
    "discoveryDate"         TEXT,
    "discoveryNotes"        TEXT,
    "notes"                 TEXT,
    "disqualified"          BOOLEAN,
    "disqualifiedReason"    TEXT,
    "name"                  TEXT,
    "businessName"          TEXT,
    "industry"              TEXT,
    "leadSource"            TEXT,
    "ghlContactId"          TEXT,
    "ghlSyncStatus"         TEXT,
    "ghlSyncError"          TEXT,
    "ghlLastSyncedAt"       TEXT,
    "updatedAt"             TEXT NOT NULL DEFAULT '',

    CONSTRAINT "lead_statuses_pkey" PRIMARY KEY ("leadId")
);

-- ── opportunities ─────────────────────────────────────────────────────────────

CREATE TABLE "opportunities" (
    "id"                    TEXT NOT NULL,
    "opportunityNumber"     TEXT NOT NULL DEFAULT '',
    "leadId"                TEXT,
    "clientName"            TEXT NOT NULL DEFAULT '',
    "businessName"          TEXT NOT NULL DEFAULT '',
    "tradeType"             TEXT NOT NULL DEFAULT '',
    "contactName"           TEXT NOT NULL DEFAULT '',
    "contactPhone"          TEXT NOT NULL DEFAULT '',
    "contactEmail"          TEXT NOT NULL DEFAULT '',
    "leadSource"            TEXT NOT NULL DEFAULT '',
    "assignedRep"           TEXT NOT NULL DEFAULT '',
    "stage"                 TEXT NOT NULL DEFAULT '',
    "priority"              TEXT NOT NULL DEFAULT '',
    "estimatedMonthlyValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedCloseDate"     TEXT NOT NULL DEFAULT '',
    "serviceInterest"       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "discoveryNotes"        TEXT NOT NULL DEFAULT '',
    "ghlContactId"          TEXT NOT NULL DEFAULT '',
    "ghlSynced"             BOOLEAN NOT NULL DEFAULT false,
    "industry"              TEXT,
    "website"               TEXT,
    "primaryContact"        TEXT,
    "email"                 TEXT,
    "phone"                 TEXT,
    "affiliateSource"       TEXT,
    "estimatedValue"        DOUBLE PRECISION,
    "monthlyValue"          DOUBLE PRECISION,
    "contractLength"        TEXT,
    "probability"           DOUBLE PRECISION,
    "daysInStage"           INTEGER,
    "nextAction"            TEXT,
    "closingMonth"          TEXT,
    "opportunityScore"      DOUBLE PRECISION,
    "forecastMonth"         TEXT,
    "forecastQuarter"       TEXT,
    "activeWizardId"        TEXT,
    "intakeRecord"          JSONB,
    "ghl"                   JSONB,
    "audit"                 JSONB,
    "proposal"              JSONB,
    "handoff"               JSONB,
    "affiliate"             JSONB,
    "communicationLog"      JSONB,
    "followUps"             JSONB,
    "tasks"                 JSONB,
    "notifications"         JSONB,
    "workflowEvents"        JSONB,
    "recentActivities"      JSONB,
    "notes"                 JSONB,
    "nextSteps"             JSONB,
    "createdAt"             TEXT NOT NULL DEFAULT '',
    "updatedAt"             TEXT NOT NULL DEFAULT '',

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);
