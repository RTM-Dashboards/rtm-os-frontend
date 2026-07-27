// RTM OS — Prisma Client Singleton
//
// Avoids creating multiple PrismaClient instances in development due to
// Next.js hot-reloading. In production (Vercel), a single instance is
// created per function invocation — this pattern is safe for both.
//
// Usage:
//   import { prisma } from "@/lib/db/prisma";
//   const leads = await prisma.lead.findMany();

import { PrismaClient } from "@prisma/client";

// ── Global singleton for dev hot-reload safety ─────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
