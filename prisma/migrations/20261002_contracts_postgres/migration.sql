-- RTM OS — Sales Contracts table
-- Replaces data/sales-contracts.json as the persistence layer.
-- data/sales-contracts.json held zero records so there is nothing to migrate.
--
-- Design notes:
--   - services: Postgres text[] follows Business.activeServices convention.
--   - contractNumber: UNIQUE — the generator is deterministic from proposalId,
--     and a duplicate contractNumber on different contracts would be confusing.
--   - proposalId: NOT UNIQUE at DB level — the upsert pattern means the same
--     proposal can overwrite its contract; a unique constraint would race.
--   - termLengthMonths, paymentTerms: typed columns (per spec); the rest
--     match the existing String/nullable pattern in the schema.
--   - status: plain String, no enum.
--   - All timestamps: String (ISO-8601), matching every other non-Invoice model.

CREATE TABLE contracts (
  id                    TEXT        NOT NULL PRIMARY KEY,
  "contractNumber"      TEXT        NOT NULL,
  "proposalId"          TEXT        NOT NULL DEFAULT '',
  status                TEXT        NOT NULL DEFAULT 'draft',
  "clientName"          TEXT        NOT NULL DEFAULT '',
  "businessName"        TEXT        NOT NULL DEFAULT '',
  "contactName"         TEXT        NOT NULL DEFAULT '',
  "contactEmail"        TEXT        NOT NULL DEFAULT '',
  "contactPhone"        TEXT        NOT NULL DEFAULT '',
  "assignedRep"         TEXT        NOT NULL DEFAULT '',
  services              TEXT[]      NOT NULL DEFAULT '{}',
  "investmentSummary"   TEXT        NOT NULL DEFAULT '',
  "monthlyValue"        TEXT        NOT NULL DEFAULT '',
  "termLength"          TEXT        NOT NULL DEFAULT '12 months',
  "paymentTerm"         TEXT        NOT NULL DEFAULT 'net-30',
  "termLengthMonths"    INTEGER,
  "paymentTerms"        TEXT,
  domain                TEXT,
  "setupFee"            DOUBLE PRECISION,
  "contractAmountCents" INTEGER,
  "signedDate"          TEXT,
  "createdAt"           TEXT        NOT NULL DEFAULT '',
  "updatedAt"           TEXT        NOT NULL DEFAULT '',
  CONSTRAINT contracts_contract_number_key UNIQUE ("contractNumber")
);

CREATE INDEX contracts_proposal_id_idx ON contracts ("proposalId");
CREATE INDEX contracts_status_idx      ON contracts (status);
