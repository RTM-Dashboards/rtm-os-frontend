// RTM OS — Invoice Number Generator
// lib/billing/invoice-number.ts
//
// Generates globally-unique, sequentially-incrementing invoice numbers of the
// form INV-XXXX (zero-padded to at least 4 digits, e.g. INV-0064, INV-1000).
//
// ── Concurrency Safety ─────────────────────────────────────────────────────────
//
// The naive read-then-max-then-write pattern is a TOCTOU race: two concurrent
// requests can both read the same MAX(invoiceNumber), compute the same
// "next" value, and then both attempt to INSERT, causing a @unique collision
// on Invoice.invoiceNumber.
//
// This module eliminates the race with two complementary mechanisms:
//
//   1. SELECT ... FOR UPDATE on the InvoiceSequence row.
//      Postgres acquires an exclusive row lock when the SELECT executes.
//      Any concurrent transaction that also attempts SELECT FOR UPDATE on the
//      same row will block until the first transaction commits or rolls back.
//      This serialises all concurrent invoice-create requests at the database
//      level — no two transactions can read and increment the counter
//      simultaneously.
//
//   2. The entire operation (lock → read → increment → write InvoiceSequence →
//      write Invoice) runs inside a single $transaction block.
//      If any step fails (e.g. the Invoice INSERT violates a constraint), the
//      transaction is rolled back atomically, including the sequence increment,
//      so no sequence numbers are permanently consumed on failure.
//
// Result: invoice numbers are gapless under normal operation and collision-free
// under any level of concurrency. The @unique constraint on Invoice.invoiceNumber
// is a backstop that will surface bugs, not a substitute for the lock.

import { prisma } from "@/lib/db/prisma";

/**
 * Format an integer counter as an INV-XXXX string.
 * Zero-padded to at least 4 digits; grows naturally past 9999.
 */
export function formatInvoiceNumber(n: number): string {
  return `INV-${String(n).padStart(4, "0")}`;
}

/**
 * Allocate the next invoice number inside an existing Prisma transaction.
 *
 * MUST be called with the `tx` argument from within a `prisma.$transaction`
 * callback. The SELECT FOR UPDATE lock is only effective inside a transaction.
 *
 * @param tx  The Prisma transaction client (first arg of $transaction callback)
 * @returns   A formatted invoice number string, e.g. "INV-0064"
 *
 * Concurrency guarantee:
 *   The `SELECT ... FOR UPDATE` on the single InvoiceSequence row (id=1)
 *   serialises all concurrent callers at the Postgres level. Only one
 *   transaction can hold the row lock at a time; others queue behind it.
 */
export async function allocateInvoiceNumber(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<string> {
  // Lock the sequence row exclusively for the duration of this transaction.
  // Any concurrent transaction hitting this line will wait here until we commit.
  const rows = await tx.$queryRaw<Array<{ last_value: number }>>`
    SELECT "lastValue" AS last_value
    FROM   invoice_sequence
    WHERE  id = 1
    FOR UPDATE
  `;

  if (rows.length === 0) {
    throw new Error(
      "InvoiceSequence row (id=1) not found. Run the seed migration first."
    );
  }

  const next = rows[0].last_value + 1;

  // Persist the incremented value before we return; the lock prevents
  // any other transaction from reading the old value after this write.
  await tx.invoiceSequence.update({
    where: { id: 1 },
    data:  { lastValue: next },
  });

  return formatInvoiceNumber(next);
}
