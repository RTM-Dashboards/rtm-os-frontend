-- Migration: 0013_drop_stale_businesses_clientId_domain_key
--
-- Drops the stale index businesses_clientId_domain_key that was left behind
-- after migration 0011 dropped the constraint of the same name.
--
-- In the live Supabase/Postgres environment, DROP CONSTRAINT left the backing
-- index intact. This migration explicitly removes the orphan index.
--
-- Safe: no data is affected. The index has no schema declaration in
-- schema.prisma and is not referenced by any constraint.

DROP INDEX IF EXISTS "businesses_clientId_domain_key";
