-- Migration: 0003_add_user_table
-- Adds the User table that mirrors Supabase auth.users.
-- Only ADDS a new table. Does not touch leads, lead_statuses,
-- opportunities, or ghl_webhook_logs. Existing data is safe.

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "role" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
