# Migration notes

## Status: resolved

Both drift items recorded during Phase B2 were resolved in Phase B3.
Migration commands are safe to run on this project.

## What was wrong

The `_prisma_migrations` table did not exist. The schema had been applied
outside Prisma's migration tracking, so `migrate status` could not be
trusted and `migrate resolve --applied` reported success while doing
nothing.

Two drift items followed from that:

1. A stale `businesses_clientId_domain_key` index. Migration 0011 dropped
   the constraint but left the backing index behind. Removed in migration
   0013.

2. Nine array columns had `DEFAULT ARRAY[]::TEXT[]` in the database but no
   `@default([])` in schema.prisma. Fixed by changing the schema to match
   the database, not the reverse.

## What was fixed

Phase B3 established the baseline by running `prisma migrate resolve
--applied` for each migration in order, which populated
`_prisma_migrations` without re-running any migration SQL.

`migrate status` and `validate` both report clean.

## Outstanding

Two migrations share the `0002_` prefix: `0002_add_ghl_webhook_log` and
`0002_drop_opportunity_readiness`. Both are marked applied and nothing is
broken, but the duplicate prefix may cause ordering ambiguity when a new
migration is generated. Worth renaming before the next schema change.

## Incident: data loss, Phase B2

`prisma migrate diff --shadow-database-url "$DATABASE_URL"` was run during
a drift investigation. Prisma treats the shadow database as disposable and
resets it, so passing the live database URL wiped every row: 38 leads, 4
opportunities, 2 proposals, 3 sales handoffs, and all config tables.

Never pass a real database URL as `--shadow-database-url`.

The project is on Supabase free tier, which has no daily backups, so there
was no restore point. Most of the data was reseeded from the repo. The four
real opportunities were not recoverable.

## Before any run that touches schema or data

Take a dump first. As of this writing neither the Supabase CLI nor pg_dump
is installed locally, so this is not yet possible. Installing the Supabase
CLI is outstanding.
