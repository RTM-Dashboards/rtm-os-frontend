// RTM OS — Users API Route
//
// GET  /api/users          → list users (scoped by caller's tier)
// PATCH /api/users?id=<id> → set role, status, and/or department
//
// ── Authorization model ───────────────────────────────────────────────────────
//
//   GET visibility:
//     SystemAdmin  → all users
//     Executive    → all users
//     Manager      → users in their own department, plus themselves
//     Member       → only themselves
//
//   PATCH rules (THE TIER MODEL — enforced server-side, no exceptions):
//
//     1. SystemAdmin may set anyone to any tier, including Executive and
//        SystemAdmin.
//     2. Executive may set anyone to Manager or Member in ANY department.
//        Executive may NOT create another Executive or a SystemAdmin.
//     3. Manager may set Members ONLY, and ONLY within their own department.
//        A Manager may not create another Manager.
//     4. Member may not set any role.
//     5. Nobody may change their own role, status or department. Not even
//        SystemAdmin. Self-modification is refused unconditionally.
//     6. Department scoping applies ONLY to Manager. SystemAdmin and Executive
//        are never restricted by department.
//     7. Nobody may set a tier above their own. Nobody may modify a user whose
//        current tier is above their own.
//
//   Status codes:
//     401 — no session
//     403 — insufficient tier, wrong department, self-modification, target
//            outranks actor
//     400 — invalid role, status, or department value
//     404 — target user not found
//
// ── Response shape ────────────────────────────────────────────────────────────
//   Only safe fields are returned. No passwords, no tokens, no invite secrets.
//   Fields: id, email, name, department, role, status, lastLoginAt,
//           roleSetBy, roleSetAt.
//
// ── Conventions ───────────────────────────────────────────────────────────────
//   - Prisma singleton: import { prisma } from "@/lib/db/prisma"
//   - Errors: { error: string } with HTTP status
//   - No Zod. No new PrismaClient().
//   - No POST or DELETE. Users are created by the auth callback on first login.
//     Deleting a user is a separate decision that has not been made.
//   - No invitedBy / invitedAt writes. Those are for the invite flow.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  VALID_ROLES,
  VALID_STATUSES,
  VALID_DEPARTMENTS,
  ROLE_RANK,
  type UserRole,
} from "@/lib/auth/vocab";

// ── Safe user shape returned to callers ──────────────────────────────────────
// Never includes anything beyond what the roster needs.

interface UserRecord {
  id:          string;
  email:       string;
  name:        string;
  department:  string | null;
  role:        string | null;
  status:      string;
  lastLoginAt: string | null;
  roleSetBy:   string | null;
  roleSetAt:   string | null;
}

// ── DB row → safe record ──────────────────────────────────────────────────────

type UserRow = {
  id:          string;
  email:       string;
  name:        string;
  department:  string | null;
  role:        string | null;
  status:      string;
  lastLoginAt: string | null;
  roleSetBy:   string | null;
  roleSetAt:   string | null;
};

function rowToRecord(row: UserRow): UserRecord {
  return {
    id:          row.id,
    email:       row.email,
    name:        row.name,
    department:  row.department ?? null,
    role:        row.role ?? null,
    status:      row.status,
    lastLoginAt: row.lastLoginAt ?? null,
    roleSetBy:   row.roleSetBy ?? null,
    roleSetAt:   row.roleSetAt ?? null,
  };
}

// ── The safe select clause — never SELECT * ───────────────────────────────────
// Keeps sensitive columns (invitedBy, invitedAt, createdAt, updatedAt) out of
// the response without requiring a post-process strip.

const USER_SELECT = {
  id:          true,
  email:       true,
  name:        true,
  department:  true,
  role:        true,
  status:      true,
  lastLoginAt: true,
  roleSetBy:   true,
  roleSetAt:   true,
} as const;

// ── GET — list users ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });

  const actor = user!;

  try {
    if (actor.role === "SystemAdmin" || actor.role === "Executive") {
      // Full visibility.
      const rows = await prisma.user.findMany({
        select:  USER_SELECT,
        orderBy: { email: "asc" },
      });
      return NextResponse.json({ users: rows.map(rowToRecord) });
    }

    if (actor.role === "Manager") {
      // Own department + themselves. If department is null, fall through to
      // Member behaviour (only themselves) — a Manager with no department set
      // cannot scope to a department.
      if (actor.department) {
        const rows = await prisma.user.findMany({
          where: {
            OR: [
              { department: actor.department },
              { id: actor.id },
            ],
          },
          select:  USER_SELECT,
          orderBy: { email: "asc" },
        });
        return NextResponse.json({ users: rows.map(rowToRecord) });
      }
    }

    // Member (or Manager with null department): only themselves.
    const row = await prisma.user.findUnique({
      where:  { id: actor.id },
      select: USER_SELECT,
    });
    if (!row) {
      return NextResponse.json({ error: "User record not found." }, { status: 404 });
    }
    return NextResponse.json({ users: [rowToRecord(row)] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — set role, status, and/or department ───────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  // 1. Authenticate the actor.
  const { user, error: authError, status: authStatus } = await getSessionUser(req);
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus! });

  const actor = user!;

  // 2. Member may not set any role — refuse immediately.
  if (actor.role === "Member") {
    return NextResponse.json(
      { error: "Members may not change any user's role, status, or department." },
      { status: 403 },
    );
  }

  // 3. Target id is required.
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("id");
  if (!targetId) {
    return NextResponse.json({ error: "Query param id is required." }, { status: 400 });
  }

  // 4. Self-modification is unconditionally refused.
  if (targetId === actor.id) {
    return NextResponse.json(
      {
        error:
          "You may not change your own role, status, or department. " +
          "Ask another SystemAdmin or Executive to make this change.",
      },
      { status: 403 },
    );
  }

  // 5. Parse the request body.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const patch = body as Partial<{
    role:       string;
    status:     string;
    department: string;
  }>;

  // At least one field must be supplied.
  if (
    patch.role === undefined &&
    patch.status === undefined &&
    patch.department === undefined
  ) {
    return NextResponse.json(
      { error: "Body must include at least one of: role, status, department." },
      { status: 400 },
    );
  }

  // 6. Validate supplied values before touching the database.
  if (patch.role !== undefined) {
    if (!(VALID_ROLES as readonly string[]).includes(patch.role)) {
      return NextResponse.json(
        {
          error: `"${patch.role}" is not a valid role. ` +
            `Valid roles: ${VALID_ROLES.join(", ")}.`,
        },
        { status: 400 },
      );
    }
  }

  if (patch.status !== undefined) {
    if (!(VALID_STATUSES as readonly string[]).includes(patch.status)) {
      return NextResponse.json(
        {
          error: `"${patch.status}" is not a valid status. ` +
            `Valid statuses: ${VALID_STATUSES.join(", ")}.`,
        },
        { status: 400 },
      );
    }
  }

  if (patch.department !== undefined) {
    if (!(VALID_DEPARTMENTS as readonly string[]).includes(patch.department)) {
      return NextResponse.json(
        {
          error: `"${patch.department}" is not a valid department. ` +
            `Valid departments: ${VALID_DEPARTMENTS.join(", ")}.`,
        },
        { status: 400 },
      );
    }
  }

  // 7. Fetch the target user.
  let targetRow: UserRow | null;
  try {
    targetRow = await prisma.user.findUnique({
      where:  { id: targetId },
      select: USER_SELECT,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  if (!targetRow) {
    return NextResponse.json(
      { error: `No user found with id: ${targetId}.` },
      { status: 404 },
    );
  }

  // 8. Tier-model enforcement.

  const actorRank  = ROLE_RANK[actor.role as UserRole] ?? 0;

  // Resolve target's current rank. If role is null/unrecognised, treat as 0
  // (below Member) so actors can still modify unrolemented users.
  const targetCurrentRole  = (targetRow.role ?? "") as UserRole;
  const targetCurrentRank  = ROLE_RANK[targetCurrentRole] ?? 0;

  // Rule 7a: nobody may modify a user whose CURRENT tier is above their own.
  if (targetCurrentRank > actorRank) {
    return NextResponse.json(
      {
        error:
          `You cannot modify ${targetRow.email}: their current role ` +
          `(${targetRow.role ?? "none"}) outranks your role (${actor.role}).`,
      },
      { status: 403 },
    );
  }

  // Rule 7b: nobody may set a tier above their own.
  if (patch.role !== undefined) {
    const desiredRank = ROLE_RANK[patch.role as UserRole] ?? 0;
    if (desiredRank > actorRank) {
      return NextResponse.json(
        {
          error:
            `You cannot assign the role "${patch.role}" because it outranks ` +
            `your own role (${actor.role}).`,
        },
        { status: 403 },
      );
    }
  }

  // Executive-specific limits (Rule 2): can only assign Manager or Member.
  if (actor.role === "Executive" && patch.role !== undefined) {
    if (patch.role === "Executive") {
      return NextResponse.json(
        {
          error:
            "Executives may not create another Executive. " +
            "Only a SystemAdmin can assign the Executive role.",
        },
        { status: 403 },
      );
    }
    if (patch.role === "SystemAdmin") {
      return NextResponse.json(
        {
          error:
            "Executives may not create a SystemAdmin. " +
            "Only a SystemAdmin can assign the SystemAdmin role.",
        },
        { status: 403 },
      );
    }
  }

  // Manager-specific limits (Rule 3):
  //   - May only set Members (not create Managers or above).
  //   - May only act within their own department.
  if (actor.role === "Manager") {
    // Rule 3a: target must currently be a Member (rank 1) or have no role.
    // Managers cannot demote Managers or anyone above.
    if (targetCurrentRank > 1) {
      return NextResponse.json(
        {
          error:
            `Managers may only modify Members. ${targetRow.email} currently ` +
            `holds the role "${targetRow.role}", which Managers cannot change.`,
        },
        { status: 403 },
      );
    }

    // Rule 3b: may not assign a role above Member (i.e. cannot create a Manager).
    if (patch.role !== undefined && patch.role !== "Member") {
      return NextResponse.json(
        {
          error:
            `Managers may only assign the Member role. ` +
            `Assigning "${patch.role}" is not permitted.`,
        },
        { status: 403 },
      );
    }

    // Rule 3c (& Rule 6): department scoping. Manager must have a department,
    // and the target must be in that same department.
    if (!actor.department) {
      return NextResponse.json(
        {
          error:
            "Your account has no department set. " +
            "A Manager must have a department to modify users.",
        },
        { status: 403 },
      );
    }
    if (targetRow.department !== actor.department) {
      return NextResponse.json(
        {
          error:
            `You can only modify users in your own department (${actor.department}). ` +
            `${targetRow.email} is in "${targetRow.department ?? "no department"}".`,
        },
        { status: 403 },
      );
    }
  }

  // 9. Apply the update.
  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {
    roleSetBy: actor.id,
    roleSetAt: now,
    updatedAt: now,
  };

  if (patch.role       !== undefined) data.role       = patch.role;
  if (patch.status     !== undefined) data.status     = patch.status;
  if (patch.department !== undefined) data.department = patch.department;

  try {
    const updated = await prisma.user.update({
      where:  { id: targetId },
      data,
      select: USER_SELECT,
    });
    return NextResponse.json({ user: rowToRecord(updated) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
