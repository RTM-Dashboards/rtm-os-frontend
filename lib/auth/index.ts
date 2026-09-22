// RTM OS — Server-Side Authorisation Helper
//
// SINGLE SOURCE OF TRUTH for role and status enforcement.
// Every Route Handler and Server Component that needs access control
// calls this module. No scattered checks.
//
// ── Role hierarchy (highest to lowest) ────────────────────────────────────────
//   SystemAdmin (4)  technical owner, can do anything
//   Executive   (3)  business leadership, all departments
//   Manager     (2)  one department only
//   Member      (1)  no role-setting ability at all
//
// ── Status gate ───────────────────────────────────────────────────────────────
//   Only "active" users pass. "pending" and "disabled" are denied.
//
// ── Fail-closed policy ────────────────────────────────────────────────────────
//   Any of the following → DENIED, never silently allowed:
//     - No Supabase session
//     - No User row in the database
//     - role is null / unrecognised
//     - status is not "active"
//
// ── Usage (Route Handler example) ─────────────────────────────────────────────
//   import { getSessionUser, requireRole, requireActive } from "@/lib/auth";
//
//   const { user, error, status } = await getSessionUser(request);
//   if (error) return NextResponse.json({ error }, { status });
//
//   const gate = requireRole(user!, "Manager");
//   if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });
//
// ── Conventions ───────────────────────────────────────────────────────────────
//   Mirrors lib/db/prisma.ts and lib/supabase/server.ts conventions:
//     - Named exports only (no default export)
//     - Async functions, no class instances
//     - Errors returned as values (not thrown), matching route error shape
//   Error shape: { error: string } with HTTP status — matches all other routes.

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

// Re-export canonical vocabulary so callers can import from one place.
export type { UserRole, UserStatus, Department } from "@/lib/auth/vocab";
export {
  VALID_ROLES,
  VALID_STATUSES,
  VALID_DEPARTMENTS,
  ROLE_RANK,
} from "@/lib/auth/vocab";

import {
  type UserRole,
  type UserStatus,
  VALID_ROLES,
  ROLE_RANK,
} from "@/lib/auth/vocab";

// ── Resolved user type ────────────────────────────────────────────────────────

export interface AuthUser {
  id:          string;
  email:       string;
  name:        string;
  role:        UserRole;
  status:      UserStatus;
  department:  string | null;
  lastLoginAt: string | null;
}

// ── AuthDenied — returned when access is denied ───────────────────────────────

export interface AuthDenied {
  error:  string;
  status: 401 | 403;
}

// ── getSessionUser ────────────────────────────────────────────────────────────
//
// Resolves the current Supabase session from the request cookies, then fetches
// the User row from the database.
//
// Returns one of:
//   { user: AuthUser, error: null, status: null }   — authenticated & authorised shape
//   { user: null,     error: string, status: 401 }  — no session
//   { user: null,     error: string, status: 403 }  — session present but access denied
//
// Fail-closed: any unexpected state (null row, null role, inactive status,
// unrecognised role/status value) is treated as access denied, not allowed.
//
// The `_request` parameter is accepted for API consistency and future use
// (e.g. extracting a bearer token). The session is currently read from cookies
// via createClient(), which is the established pattern in this codebase.

export async function getSessionUser(_request?: NextRequest): Promise<
  | { user: AuthUser; error: null;   status: null }
  | { user: null;    error: string;  status: 401 | 403 }
> {
  // 1. Resolve the Supabase session.
  let supabaseUserId: string;
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: "No active session.", status: 401 };
    }

    supabaseUserId = user.id;
  } catch {
    return { user: null, error: "Session check failed.", status: 401 };
  }

  // 2. Fetch the User row from the database.
  let row: Awaited<ReturnType<typeof prisma.user.findUnique>>;
  try {
    row = await prisma.user.findUnique({ where: { id: supabaseUserId } });
  } catch {
    return { user: null, error: "Could not verify account. Please try again.", status: 401 };
  }

  // 3. No row = never completed the upsert. Denied.
  if (!row) {
    return {
      user:   null,
      error:  "Your account has not been set up yet. Contact your manager.",
      status: 403,
    };
  }

  // 4. Role must be set and must be a recognised value. Null role = no access.
  if (!row.role || !(VALID_ROLES as readonly string[]).includes(row.role)) {
    return {
      user:   null,
      error:  "Access has not been granted yet. Contact your manager.",
      status: 403,
    };
  }

  // 5. Status must be "active".
  if (!row.status || row.status !== "active") {
    if (row.status === "disabled") {
      return {
        user:   null,
        error:  "Your account has been disabled. Contact your manager.",
        status: 403,
      };
    }
    // "pending" or any other unexpected value
    return {
      user:   null,
      error:  "Access has not been granted yet. Contact your manager.",
      status: 403,
    };
  }

  // 6. All checks passed.
  return {
    user: {
      id:          row.id,
      email:       row.email,
      name:        row.name,
      role:        row.role as UserRole,
      status:      row.status as UserStatus,
      department:  row.department ?? null,
      lastLoginAt: row.lastLoginAt ?? null,
    },
    error:  null,
    status: null,
  };
}

// ── requireActive ─────────────────────────────────────────────────────────────
//
// Returns an AuthDenied if the user is not active.
// Returns null if the check passes.
// Convenience wrapper; getSessionUser already enforces active — use this for
// explicit documentation in route handlers.

export function requireActive(user: AuthUser): AuthDenied | null {
  if (user.status !== "active") {
    return { error: "Account is not active.", status: 403 };
  }
  return null;
}

// ── requireRole ───────────────────────────────────────────────────────────────
//
// Returns an AuthDenied if the user's role is below the required minimum tier.
// Returns null if the check passes (user meets or exceeds the minimum).
//
// Example: requireRole(user, "Manager")
//   "SystemAdmin" → null (passes — outranks Manager)
//   "Executive"   → null (passes — outranks Manager)
//   "Manager"     → null (passes — meets minimum)
//   "Member"      → { error, status: 403 }

export function requireRole(user: AuthUser, minimum: UserRole): AuthDenied | null {
  const userRank    = ROLE_RANK[user.role]    ?? 0;
  const minimumRank = ROLE_RANK[minimum]      ?? 0;

  if (userRank < minimumRank) {
    return {
      error:  `Requires ${minimum} or higher. Your role: ${user.role}.`,
      status: 403,
    };
  }
  return null;
}
