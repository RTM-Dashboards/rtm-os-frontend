-- Migration: 0008_add_client_business_schema
--
-- Adds four new tables: clients, businesses, points_of_contact, projects.
-- ADDITIVE ONLY. No existing table is altered or dropped.
-- No seed data. All tables start empty.

-- CreateTable: clients
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "company" TEXT NOT NULL DEFAULT '',
    "assignedAM" TEXT NOT NULL DEFAULT '',
    "ghlContactId" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable: businesses
-- domain uniqueness is scoped to (clientId, domain), not globally, because
-- the same domain can legitimately exist under two different clients
-- (acquisition, reseller, domain handover scenarios).
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '',
    "clientId" TEXT NOT NULL,
    "invoiceStatus" TEXT NOT NULL DEFAULT 'none',
    "paymentStatus" TEXT NOT NULL DEFAULT 'none',
    "invoiceAmountCents" INTEGER NOT NULL DEFAULT 0,
    "subscriptionRef" TEXT,
    "assignedAM" TEXT NOT NULL DEFAULT '',
    "activationStatus" TEXT NOT NULL DEFAULT 'inactive',
    "onboardingStatus" TEXT NOT NULL DEFAULT 'not_started',
    "activeServices" TEXT[],
    "monthlyValueCents" INTEGER NOT NULL DEFAULT 0,
    "renewalDate" TEXT,
    "renewalStatus" TEXT NOT NULL DEFAULT 'ok',
    "ghlOpportunityId" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: points_of_contact
CREATE TABLE "points_of_contact" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'Other',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "points_of_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable: projects
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "service" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'planned',
    "assignedAM" TEXT NOT NULL DEFAULT '',
    "startDate" TEXT,
    "endDate" TEXT,
    "deliverables" JSONB,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: domain lookup index
CREATE INDEX "businesses_domain_idx" ON "businesses"("domain");

-- CreateIndex: clientId lookup index
CREATE INDEX "businesses_clientId_idx" ON "businesses"("clientId");

-- CreateIndex: per-client domain uniqueness
CREATE UNIQUE INDEX "businesses_clientId_domain_key" ON "businesses"("clientId", "domain");

-- CreateIndex: businessId index on points_of_contact
CREATE INDEX "points_of_contact_businessId_idx" ON "points_of_contact"("businessId");

-- CreateIndex: businessId index on projects
CREATE INDEX "projects_businessId_idx" ON "projects"("businessId");
