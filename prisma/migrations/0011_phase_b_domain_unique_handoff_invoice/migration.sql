-- Phase B: Domain uniqueness, SalesHandoff model, Invoice model, InvoiceSequence
-- 
-- B1: Replace @@unique([clientId, domain]) on businesses with a global @unique on domain.
--     clients = 0 rows and businesses = 0 rows at migration time; no backfill needed.
--
-- B2: Add sales_handoffs table (SalesHandoff model).
--
-- B3: Add invoices table (Invoice model).
--
-- B4: Add invoice_sequence table (InvoiceSequence model), seeded at lastValue=63
--     so the first generated number is INV-0064, clearing the highest mock number.

-- ── B1: Business.domain global unique ─────────────────────────────────────────

-- Drop the old composite unique constraint (clientId, domain).
-- Constraint name follows Prisma's naming convention for @@unique.
ALTER TABLE "businesses" DROP CONSTRAINT IF EXISTS "businesses_clientId_domain_key";

-- Add a global unique constraint on domain alone.
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_domain_key" UNIQUE ("domain");

-- ── B2: SalesHandoff model ────────────────────────────────────────────────────

CREATE TABLE "sales_handoffs" (
    "id"                    TEXT NOT NULL,
    "handoffNumber"         TEXT NOT NULL DEFAULT '',
    "clientName"            TEXT NOT NULL DEFAULT '',
    "contractNumber"        TEXT NOT NULL DEFAULT '',
    "contractId"            TEXT NOT NULL DEFAULT '',
    "preparedBy"            TEXT NOT NULL DEFAULT '',
    "createdAt"             TEXT NOT NULL DEFAULT '',
    "status"                TEXT NOT NULL DEFAULT 'not-started',
    "checklist"             JSONB NOT NULL DEFAULT '[]',
    "summaryFields"         JSONB NOT NULL DEFAULT '{}',
    "completionPercentage"  INTEGER NOT NULL DEFAULT 0,
    "readyToSubmit"         BOOLEAN NOT NULL DEFAULT false,
    "submittedAt"           TEXT,
    "receivedBy"            TEXT,
    "submittedToBilling"    BOOLEAN NOT NULL DEFAULT false,
    "submittedToBillingAt"  TEXT,
    "processed"             BOOLEAN NOT NULL DEFAULT false,
    "processedAt"           TEXT,
    "processedClientId"     TEXT,
    "monthlyValueCents"     INTEGER,
    "setupFeeCents"         INTEGER,
    "paymentTerms"          TEXT,
    "termLengthMonths"      INTEGER,

    CONSTRAINT "sales_handoffs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sales_handoffs_submittedToBilling_idx" ON "sales_handoffs"("submittedToBilling");
CREATE INDEX "sales_handoffs_processed_idx" ON "sales_handoffs"("processed");
CREATE INDEX "sales_handoffs_contractId_idx" ON "sales_handoffs"("contractId");

-- ── B3: Invoice model ─────────────────────────────────────────────────────────

CREATE TABLE "invoices" (
    "id"                    TEXT NOT NULL,
    "invoiceNumber"         TEXT NOT NULL,
    "businessId"            TEXT NOT NULL,
    "clientId"              TEXT NOT NULL,
    "salesHandoffId"        TEXT,
    "contractAmountCents"   INTEGER NOT NULL,
    "setupFeeCents"         INTEGER NOT NULL DEFAULT 0,
    "monthlyValueCents"     INTEGER NOT NULL DEFAULT 0,
    "invoiceStatus"         TEXT NOT NULL DEFAULT 'Draft',
    "paymentStatus"         TEXT NOT NULL DEFAULT 'N/A',
    "dueDate"               TIMESTAMP(3) NOT NULL,
    "sentAt"                TIMESTAMP(3),
    "paidAt"                TIMESTAMP(3),
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,
    "billingOwner"          TEXT NOT NULL DEFAULT '',
    "archived"              BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");
CREATE INDEX "invoices_businessId_idx" ON "invoices"("businessId");
CREATE INDEX "invoices_clientId_idx" ON "invoices"("clientId");
-- Composite index supporting overdue queries: dueDate < now() AND paymentStatus != 'Paid'
CREATE INDEX "invoices_dueDate_paymentStatus_idx" ON "invoices"("dueDate", "paymentStatus");

-- ── B4: InvoiceSequence model ─────────────────────────────────────────────────
-- Single-row counter. lastValue=63 → first generated number is INV-0064.
-- Seeded above the highest mock invoice number visible in existing seed data (INV-0063).

CREATE TABLE "invoice_sequence" (
    "id"          INTEGER NOT NULL DEFAULT 1,
    "lastValue"   INTEGER NOT NULL DEFAULT 63,

    CONSTRAINT "invoice_sequence_pkey" PRIMARY KEY ("id")
);

-- Insert the single seed row. If this migration is re-run, do nothing.
INSERT INTO "invoice_sequence" ("id", "lastValue") VALUES (1, 63) ON CONFLICT DO NOTHING;
