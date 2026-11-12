// RTM OS — Notification recipient resolver
//
// resolveNotifRecipient(assignmentValue, fallbackDept)
//
// PURPOSE
// -------
// A notification must go to the ASSIGNED person on a record, not to a
// department inbox. Only when no assignee can be identified does it fall
// back to the department's main person (or manager / executive chain).
//
// BACKGROUND — assignment field formats
// --------------------------------------
// Several tables store assignment values that may be a Postgres User.id UUID
// (e.g. "f4b4ad04-918e-4873-bbd4-3709e1c6945c") OR a legacy display name
// written directly by an old UI (e.g. "Sarah K.", "Jordan M.").
//
// resolveRep() in lib/users/users-api.ts exists to surface this to UI: it
// matches by id first, and if no match returns a "⚠ (stale)" suffix. This
// helper does the same matching but returns a recipientId for notification
// routing rather than a display string.
//
// RESOLUTION ORDER
// ----------------
// a) The value is a user id of an active user → use it.
// b) The value is a display name that matches exactly one active user → use
//    that user; LOG that resolution was by name rather than id.
// c) The value is empty, matches nobody, or matches more than one active
//    user → fall back to the department:
//      1. active user with isMain = true
//      2. active Manager in that department
//      3. active Executive or SystemAdmin (global, any department)
// d) Nothing resolves → return null; the caller must log the failure.
//
// NULL SEMANTICS
// --------------
// A null return means no recipient could be found. The CALLER is responsible
// for logging "no recipient for <record> in <dept>" and carrying on.
// This function never throws and never falls back to an arbitrary user.

import { prisma } from "@/lib/db/prisma";
import type { Department } from "@/lib/auth/vocab";

/**
 * Resolve an assignment value to a notification recipient user id.
 *
 * @param value          The stored assignment value (User.id UUID or display
 *                       name, or null / empty / "-").
 * @param fallbackDept   VALID_DEPARTMENTS member to use when value does not
 *                       resolve to a user.
 * @returns              A user id string, or null if nothing resolves.
 */
export async function resolveNotifRecipient(
  value: string | null | undefined,
  fallbackDept: Department,
): Promise<string | null> {
  // ── (a) Try as a direct user id ─────────────────────────────────────────
  if (value && value !== "-") {
    const byId = await prisma.user.findFirst({
      where: { id: value, status: "active" },
      select: { id: true },
    });
    if (byId) return byId.id;

    // ── (b) Try as a display name ───────────────────────────────────────
    const byName = await prisma.user.findMany({
      where: { name: value, status: "active" },
      select: { id: true, name: true },
    });
    if (byName.length === 1) {
      console.log(
        `[resolveNotifRecipient] resolved "${value}" by display name → ${byName[0].id}`,
      );
      return byName[0].id;
    }
    if (byName.length > 1) {
      // Ambiguous — fall through to department fallback, same as "matches nobody".
      console.warn(
        `[resolveNotifRecipient] "${value}" matched ${byName.length} active users by name — falling back to department "${fallbackDept}"`,
      );
    }
  }

  // ── (c) Department fallback ──────────────────────────────────────────────

  // c1. isMain = true in the department.
  const mainUser = await prisma.user.findFirst({
    where: { department: fallbackDept, isMain: true, status: "active" },
    select: { id: true },
    orderBy: { name: "asc" },
  });
  if (mainUser) return mainUser.id;

  // c2. Active Manager in the department.
  const deptManager = await prisma.user.findFirst({
    where: { department: fallbackDept, role: "Manager", status: "active" },
    select: { id: true },
    orderBy: { name: "asc" },
  });
  if (deptManager) return deptManager.id;

  // c3. Any active Executive (global).
  const exec = await prisma.user.findFirst({
    where: { role: "Executive", status: "active" },
    select: { id: true },
    orderBy: { name: "asc" },
  });
  if (exec) return exec.id;

  // c4. Any active SystemAdmin (global).
  const sa = await prisma.user.findFirst({
    where: { role: "SystemAdmin", status: "active" },
    select: { id: true },
    orderBy: { name: "asc" },
  });
  if (sa) return sa.id;

  // ── (d) Nothing resolved ─────────────────────────────────────────────────
  return null;
}
