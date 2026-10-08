-- RTM OS: Notifications table
-- One table covers both plain notifications and manual escalations.
-- Escalation-specific columns are nullable; NULL means "not an escalation".
-- emailed_at is NULL/not-emailed by default; populated when email is added later.

CREATE TABLE notifications (
  id                   TEXT        PRIMARY KEY,
  -- Who receives this notification
  recipient_id         TEXT        NOT NULL REFERENCES users(id),
  -- What kind of event created it
  type                 TEXT        NOT NULL, -- 'task_assigned' | 'concern_raised' | 'concern_escalated' | 'concern_resolved'
  -- Human-readable message
  message              TEXT        NOT NULL,
  -- Deep-link the recipient can follow to the relevant record
  link                 TEXT        NOT NULL,
  -- Read state
  read_at              TIMESTAMPTZ,
  -- Timestamps
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Email gate: NULL = not sent; populated when email is wired later
  emailed_at           TIMESTAMPTZ,

  -- ── Escalation columns (NULL when this is a plain notification) ──────────
  -- What the concern is about
  concern_about_type   TEXT,        -- 'project' | 'task' | 'client'
  concern_about_id     TEXT,        -- id of the project/task/client
  -- Who raised the original concern
  raised_by_id         TEXT REFERENCES users(id),
  -- 1 = sent to department manager, 2 = sent to executive
  escalation_level     INTEGER,
  -- For level-2 rows: points to the level-1 notification row so resolve can
  -- mark both. NULL for level-1 rows.
  escalation_parent_id TEXT REFERENCES notifications(id),
  -- Whether the escalation has been resolved
  resolved_at          TIMESTAMPTZ,
  resolved_by_id       TEXT REFERENCES users(id)
);

CREATE INDEX notifications_recipient_idx ON notifications(recipient_id);
CREATE INDEX notifications_read_at_idx   ON notifications(recipient_id, read_at);
CREATE INDEX notifications_created_idx   ON notifications(created_at DESC);
