-- Migration: add master_clients-only fields to businesses
--
-- Decision: master_clients is retired. These seven fields existed only on
-- master_clients and have no equivalent column on businesses. Moving them
-- here so one table holds all client state.
--
-- Type / default rationale for each column:
--
--   industry           TEXT NOT NULL DEFAULT ''
--     Free-form label (e.g. "Home Services – Roofing"). TEXT is correct;
--     the master_clients column was also TEXT with default ''. Keeping the
--     same convention as all other TEXT status columns on this table.
--
--   "workflowStatus"   TEXT NOT NULL DEFAULT 'Not Started'
--     Enum-like values: "Not Started" | "Pending Review" | "In Progress" |
--     "Awaiting Client" | "Escalated" | "Complete". TEXT matches the pattern
--     of every other status column (activationStatus, billingStatus, etc.).
--     Default "Not Started" matches the lowest-state value and what
--     master_clients.ts assigns to new leads.
--
--   "clientHealth"     TEXT NOT NULL DEFAULT 'Good'
--     Computed tier: "Excellent" | "Good" | "At Risk" | "Critical".
--     The adapter will compute this at read-time (computeHealth()) and may
--     optionally persist it here for future direct queries. Default "Good"
--     is the neutral non-alarming tier for a new business with no signal.
--
--   priority           TEXT NOT NULL DEFAULT 'Medium'
--     Computed tier: "High" | "Medium" | "Low". Same reasoning as
--     clientHealth — computed at read-time, default is neutral mid-tier.
--
--   "lastActivity"     TEXT NOT NULL DEFAULT ''
--     ISO date string (YYYY-MM-DD) or descriptive string. TEXT with empty
--     default matches the master_clients convention. NOT a timestamp column
--     because the project stores activity dates as TEXT strings throughout.
--     Does not default to now() because lastActivity is a human-entered or
--     event-driven field, not a row-creation timestamp.
--
--   "nextRequiredAction"  TEXT NOT NULL DEFAULT ''
--     Free-text description of the next action needed. TEXT, empty default.
--     The adapter computes this via computeNextAction(); the stored value
--     is a cache / manual override.
--
--   notes              TEXT NOT NULL DEFAULT ''
--     Free-text notes string. In master_clients this was stored as JSONB []
--     (an array), but MasterClient.notes is typed as `string` in master-clients.ts
--     and every consumer that renders it treats it as a plain string
--     (shell clients page: {client.notes}, DeptClientDetailDrawer: string?).
--     Using TEXT here aligns with the real type contract; it also eliminates
--     the existing mismatch between the JSONB column and the string type.

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS industry            TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "workflowStatus"   TEXT NOT NULL DEFAULT 'Not Started',
  ADD COLUMN IF NOT EXISTS "clientHealth"     TEXT NOT NULL DEFAULT 'Good',
  ADD COLUMN IF NOT EXISTS priority           TEXT NOT NULL DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS "lastActivity"     TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "nextRequiredAction" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes              TEXT NOT NULL DEFAULT '';
