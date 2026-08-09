-- RTM OS — Migration 0002
-- Removes the opportunityReadiness stored field from the leads table.
--
-- Reason: opportunityReadiness duplicated information already carried by
-- lead.stage and drifted out of sync with reality. "Qualified" IS the
-- readiness signal. The UI now derives PENDING / READY / CREATED from
-- lead.stage plus a lookup against the opportunities table. Nothing is stored.
--
-- Applied via: npx prisma migrate deploy

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "opportunityReadiness";
