// =============================================================================
// RTM OS — Users API Client
// lib/users/users-api.ts
//
// Typed helpers for reading User records. All functions go through
// /api/users (backed by Postgres via Prisma) instead of reading
// lib/workspace-people mock data.
//
// GET /api/users scopes results by the caller's tier:
//   SystemAdmin / Executive → all users
//   Manager                 → own department + themselves
//   Member                  → only themselves
//
// Mirrors the shape of lib/billing/invoices-api.ts.
//
// Used by:
//   - components/workspace/WorkspaceTeamMembersPage (department roster)
//   - lib/hooks/useCurrentUser (current-user resolution for Profile pages)
// =============================================================================

// ── Record shape (mirrors app/api/users/route.ts UserRecord) ─────────────────

export interface UserRecord {
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

// ── Base fetch helper ─────────────────────────────────────────────────────────

async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Users API ${options?.method ?? "GET"} ${url} → ${res.status}: ${text}`,
    );
  }
  return res;
}

// ── Read helpers ──────────────────────────────────────────────────────────────

/**
 * Fetch all users visible to the current session.
 * The API scopes by tier — a Manager only sees their department.
 * Returns an empty array when no users are visible.
 */
export async function fetchUsers(): Promise<UserRecord[]> {
  const res = await apiFetch("/api/users");
  const data = (await res.json()) as { users: UserRecord[] };
  return data.users;
}

/**
 * Fetch users belonging to a specific department.
 * Fetches all visible users and filters client-side, because the API has no
 * department query param. The API already scopes by tier, so a Manager will
 * only ever receive their own department — the filter is a no-op for them.
 *
 * Users with department=null are excluded from every department page.
 * They surface via fetchCurrentUser() on the Profile page.
 */
export async function fetchUsersByDepartment(department: string): Promise<UserRecord[]> {
  const all = await fetchUsers();
  return all.filter((u) => u.department === department);
}

/**
 * Fetch the current user's own record.
 * The API always includes the caller in its response, regardless of tier.
 * Uses the Supabase browser client to resolve the current Supabase user id,
 * then matches it against the API response.
 *
 * Returns null if the user is not authenticated or their record is not found.
 */
export async function fetchCurrentUser(): Promise<UserRecord | null> {
  try {
    const res = await apiFetch("/api/users");
    const data = (await res.json()) as { users: UserRecord[] };
    // The API always includes the caller. For Member/Manager it is the only
    // or first record. For SystemAdmin/Executive we must find ourselves; use
    // the Supabase session to identify the caller's id.
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    if (!supabaseUser) return null;
    return data.users.find((u) => u.id === supabaseUser.id) ?? null;
  } catch {
    return null;
  }
}
