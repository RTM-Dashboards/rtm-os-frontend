-- Migration: move five flat-file API routes to Postgres
--
-- Routes converted (all five had fs.writeFileSync calls that silently fail on
-- Vercel's read-only filesystem):
--
--   /api/master-clients               → master_clients
--   /api/collaboration                → collab_comments, collab_replies,
--                                       collab_internal_notes, collab_client_notes,
--                                       collab_watchers
--   /api/pending-cancellation-requests → pending_cancellation_requests
--   /api/reassignment-events          → reassignment_events
--   /api/renewal-status               → renewal_status
--
-- master-clients overlap check:
--   The existing `clients` table holds CRM contact records (fullName, email,
--   phone, ghlContactId).  The `businesses` table holds one operational record
--   per domain (activationStatus, renewalDate, billingStatus, etc.) linked to
--   a client row.  master-clients.json is a cross-department aggregate that
--   adds workflowStatus, salesStatus, currentStatus, activationChecklist,
--   recentEvents, priority, avatarColor, and other roll-up fields not present
--   in either table.  Creating a third table is intentional: it is the only
--   place that holds this combination.  Future work may replace it with a view
--   once the other data sources converge.
--
-- Timestamp convention: this project stores timestamps as TEXT ISO-8601
-- strings in most existing tables (created_at TEXT DEFAULT now()::text).
-- These new tables follow the same convention for consistency.
-- createdAt / updatedAt columns use now()::text as default so server-assigned
-- timestamps are automatic and never empty.
--
-- Foreign keys: reassignment_events.client_id → businesses(id) is declared
-- as a FK because the relationship is real and the column is already a real
-- businesses primary key in callers.  collaboration tables reference task_id
-- from tasks(id) with ON DELETE CASCADE — threads are meaningless without a
-- task.  master_clients and renewal_status have no FK to clients/businesses
-- because their id/slug space is legacy ('mc001', slugs) that has not been
-- unified with the Postgres id space yet; a FK would block import of the
-- existing 20 records if the product owner decides to keep them.
-- pending_cancellation_requests uses client (TEXT name) not a FK because the
-- AM cancellation form takes a free-text client name.
--
-- Applied: psql -f (not prisma migrate dev).

-- ── 1. master_clients ─────────────────────────────────────────────────────────
--
-- Stores the per-client aggregate row that the master-clients pages read/write.
-- All status columns mirror the JSON field names exactly so the external API
-- shape is unchanged.  Free-form JSON columns (activeServices, activationChecklist,
-- recentEvents, notes) use jsonb.

CREATE TABLE IF NOT EXISTS master_clients (
  id                       TEXT        NOT NULL,
  slug                     TEXT        NOT NULL DEFAULT '',
  "clientName"             TEXT        NOT NULL DEFAULT '',
  industry                 TEXT        NOT NULL DEFAULT '',
  "assignedAM"             TEXT        NOT NULL DEFAULT '',
  email                    TEXT        NOT NULL DEFAULT '',
  "currentStatus"          TEXT        NOT NULL DEFAULT '',
  "workflowStatus"         TEXT        NOT NULL DEFAULT '',
  "salesStatus"            TEXT        NOT NULL DEFAULT '',
  "salesOwner"             TEXT        NOT NULL DEFAULT '',
  "billingStatus"          TEXT        NOT NULL DEFAULT '',
  "invoiceStatus"          TEXT        NOT NULL DEFAULT '',
  "paymentStatus"          TEXT        NOT NULL DEFAULT '',
  "cancellationStatus"     TEXT        NOT NULL DEFAULT 'None',
  "upgradeDowngradeStatus" TEXT        NOT NULL DEFAULT 'None',
  cleared                  BOOLEAN     NOT NULL DEFAULT FALSE,
  "activationStatus"       TEXT        NOT NULL DEFAULT '',
  "onboardingStatus"       TEXT        NOT NULL DEFAULT '',
  "activeServices"         JSONB       NOT NULL DEFAULT '[]',
  "activationChecklist"    JSONB       NOT NULL DEFAULT '{}',
  "monthlyValue"           TEXT        NOT NULL DEFAULT '',
  "billingOwner"           TEXT        NOT NULL DEFAULT '',
  "commissionStatus"       TEXT        NOT NULL DEFAULT '',
  "clientHealth"           TEXT        NOT NULL DEFAULT '',
  priority                 TEXT        NOT NULL DEFAULT '',
  "avatarColor"            TEXT        NOT NULL DEFAULT '',
  "renewalDate"            TEXT,
  "renewalStatus"          TEXT        NOT NULL DEFAULT '',
  "affiliateName"          TEXT        NOT NULL DEFAULT '',
  "referralSource"         TEXT        NOT NULL DEFAULT '',
  "referralRevenue"        TEXT        NOT NULL DEFAULT '',
  "stripeCustomerId"       TEXT,
  "stripeSubscriptionId"   TEXT,
  "stripeInvoiceId"        TEXT,
  "stripeSyncStatus"       TEXT        NOT NULL DEFAULT '',
  "lastActivity"           TEXT        NOT NULL DEFAULT '',
  "nextRequiredAction"     TEXT        NOT NULL DEFAULT '',
  notes                    JSONB       NOT NULL DEFAULT '[]',
  "recentEvents"           JSONB       NOT NULL DEFAULT '[]',
  "createdAt"              TEXT        NOT NULL DEFAULT (now()::text),
  "updatedAt"              TEXT        NOT NULL DEFAULT (now()::text),
  CONSTRAINT master_clients_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS master_clients_slug_idx
  ON master_clients (slug)
  WHERE slug <> '';

-- ── 2. collaboration tables ───────────────────────────────────────────────────
--
-- Replaces the collaboration-store.json { tasks: { [taskId]: { comments,
-- internalNotes, clientNotes, watchers } } } structure with four child tables.
-- task_id is a FK to tasks(id) with ON DELETE CASCADE: deleting a task removes
-- its collaboration threads.  reply parent_id FK is within collab_comments.

CREATE TABLE IF NOT EXISTS collab_comments (
  id               TEXT    NOT NULL,
  task_id          TEXT    NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  "authorId"       TEXT    NOT NULL DEFAULT '',
  "authorName"     TEXT    NOT NULL DEFAULT '',
  "authorInitials" TEXT    NOT NULL DEFAULT '',
  "authorColor"    TEXT    NOT NULL DEFAULT '',
  body             TEXT    NOT NULL,
  mentions         JSONB   NOT NULL DEFAULT '[]',
  attachments      JSONB   NOT NULL DEFAULT '[]',
  status           TEXT    NOT NULL DEFAULT 'Active',
  pinned           BOOLEAN NOT NULL DEFAULT FALSE,
  resolved         BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"      TEXT    NOT NULL DEFAULT (now()::text),
  "editedAt"       TEXT,
  CONSTRAINT collab_comments_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS collab_comments_task_id_idx ON collab_comments (task_id);

CREATE TABLE IF NOT EXISTS collab_replies (
  id               TEXT NOT NULL,
  comment_id       TEXT NOT NULL REFERENCES collab_comments(id) ON DELETE CASCADE,
  "authorId"       TEXT NOT NULL DEFAULT '',
  "authorName"     TEXT NOT NULL DEFAULT '',
  "authorInitials" TEXT NOT NULL DEFAULT '',
  "authorColor"    TEXT NOT NULL DEFAULT '',
  body             TEXT NOT NULL,
  mentions         JSONB NOT NULL DEFAULT '[]',
  "createdAt"      TEXT NOT NULL DEFAULT (now()::text),
  CONSTRAINT collab_replies_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS collab_replies_comment_id_idx ON collab_replies (comment_id);

CREATE TABLE IF NOT EXISTS collab_internal_notes (
  id               TEXT NOT NULL,
  task_id          TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  "authorId"       TEXT NOT NULL DEFAULT '',
  "authorName"     TEXT NOT NULL DEFAULT '',
  "authorInitials" TEXT NOT NULL DEFAULT '',
  "authorColor"    TEXT NOT NULL DEFAULT '',
  department       TEXT NOT NULL DEFAULT 'General',
  priority         TEXT NOT NULL DEFAULT 'Medium',
  body             TEXT NOT NULL,
  "createdAt"      TEXT NOT NULL DEFAULT (now()::text),
  CONSTRAINT collab_internal_notes_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS collab_internal_notes_task_id_idx ON collab_internal_notes (task_id);

CREATE TABLE IF NOT EXISTS collab_client_notes (
  id               TEXT NOT NULL,
  task_id          TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  "authorId"       TEXT NOT NULL DEFAULT '',
  "authorName"     TEXT NOT NULL DEFAULT '',
  "authorInitials" TEXT NOT NULL DEFAULT '',
  "authorColor"    TEXT NOT NULL DEFAULT '',
  source           TEXT NOT NULL DEFAULT 'Email',
  body             TEXT NOT NULL,
  "createdAt"      TEXT NOT NULL DEFAULT (now()::text),
  CONSTRAINT collab_client_notes_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS collab_client_notes_task_id_idx ON collab_client_notes (task_id);

CREATE TABLE IF NOT EXISTS collab_watchers (
  id               TEXT    NOT NULL,
  task_id          TEXT    NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name             TEXT    NOT NULL,
  initials         TEXT    NOT NULL DEFAULT '',
  "avatarColor"    TEXT    NOT NULL DEFAULT '',
  role             TEXT    NOT NULL DEFAULT 'Team Member',
  department       TEXT    NOT NULL DEFAULT 'General',
  watching         BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT collab_watchers_pkey PRIMARY KEY (id),
  CONSTRAINT collab_watchers_task_name_uq UNIQUE (task_id, name)
);

CREATE INDEX IF NOT EXISTS collab_watchers_task_id_idx ON collab_watchers (task_id);

-- ── 3. pending_cancellation_requests ─────────────────────────────────────────
--
-- Replaces pending-cancellation-requests.json.
-- id is auto-assigned by the server ('am-cr-N'); stored as TEXT to match the
-- existing format.  billingStatus and requestedBy are server-managed defaults.

CREATE TABLE IF NOT EXISTS pending_cancellation_requests (
  id                 TEXT    NOT NULL,
  client             TEXT    NOT NULL,
  reason             TEXT    NOT NULL,
  notes              TEXT    NOT NULL DEFAULT '',
  "amOwner"          TEXT    NOT NULL,
  "requestedDate"    TEXT    NOT NULL DEFAULT (now()::text),
  "requestedBy"      TEXT    NOT NULL DEFAULT 'AM',
  "billingStatus"    TEXT    NOT NULL DEFAULT 'Cancellation Requested',
  "mrrImpact"        TEXT    NOT NULL DEFAULT '',
  "billingOwner"     TEXT    NOT NULL DEFAULT '',
  "amOwnerNotified"  BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"        TEXT    NOT NULL DEFAULT (now()::text),
  CONSTRAINT pending_cancellation_requests_pkey PRIMARY KEY (id)
);

-- ── 4. reassignment_events ────────────────────────────────────────────────────
--
-- Replaces reassignment-events.json.
-- client_id references businesses(id) — the callers pass the Postgres
-- businesses id (e.g. "biz-XXXXXXXXX-XXXXX").  ON DELETE RESTRICT: do not
-- silently delete reassignment history when a business record is removed.

CREATE TABLE IF NOT EXISTS reassignment_events (
  id             TEXT NOT NULL,
  client_id      TEXT NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  "clientName"   TEXT NOT NULL DEFAULT '',
  "from"         TEXT NOT NULL,
  "to"           TEXT NOT NULL,
  date           TEXT NOT NULL DEFAULT (now()::text),
  reason         TEXT NOT NULL DEFAULT '',
  "handoffNote"  TEXT,
  "createdAt"    TEXT NOT NULL DEFAULT (now()::text),
  CONSTRAINT reassignment_events_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS reassignment_events_client_id_idx ON reassignment_events (client_id);

-- ── 5. renewal_status ─────────────────────────────────────────────────────────
--
-- Replaces renewal-status.json.
-- One record per clientId (upsert semantics in the route).
-- clientId TEXT with no FK: see master_clients FK rationale above.

CREATE TABLE IF NOT EXISTS renewal_status (
  "clientId"   TEXT NOT NULL,
  decision     TEXT NOT NULL DEFAULT 'Pending',
  notes        TEXT NOT NULL DEFAULT '',
  "updatedAt"  TEXT NOT NULL DEFAULT (now()::text),
  CONSTRAINT renewal_status_pkey PRIMARY KEY ("clientId")
);
