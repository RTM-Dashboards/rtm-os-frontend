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
//   - app/(sales)/sales/leads/page.tsx (Sales rep dropdowns)
//   - app/(account-management)/account-management/clients/page.tsx (AM filter)
//   - app/(billing)/billing/invoices/page.tsx (Billing owner select)
// =============================================================================

import { useState, useEffect } from "react";

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
  isMain:      boolean | null;
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

// ── React hook: department-scoped users ──────────────────────────────────────
//
// Returns { users, loading, error } for a given department.
//
// Three states are intentionally distinct:
//   loading  = true                      → fetch in flight
//   loading  = false, error != null       → fetch failed
//   loading  = false, error == null, users = [] → fetch succeeded, no users in dept
//
// The department filter is client-side (same as fetchUsersByDepartment).
// The API tier scoping is preserved — a Manager in Sales only ever sees
// Sales users; the client-side filter is a no-op for them.
//
// Usage:
//   const { users, loading, error } = useDepartmentUsers("Sales");

export interface UseDepartmentUsersResult {
  users: UserRecord[];
  loading: boolean;
  error: string | null;
}

/**
 * Resolve a stored assignedRep / billingOwner value to a display string.
 *
 * - Matches against the provided users list by User.id.
 * - If matched: returns user.name.
 * - If not matched (stale display name like "Alex R."): returns the value
 *   suffixed with " ⚠ (stale)" so it reads as clearly outdated.
 * - Empty / "-": returns "Unassigned".
 */
export function resolveRep(value: string | undefined | null, users: UserRecord[]): string {
  if (!value || value === "-") return "Unassigned";
  const matched = users.find((u) => u.id === value);
  if (matched) return matched.name;
  return `${value} ⚠ (stale)`;
}

/**
 * React hook. Fetches users for a specific department using fetchUsersByDepartment.
 * Safe to call in Client Components; must not be used in Server Components or
 * module-level code (it imports "react" dynamically to stay SSR-safe).
 */
export function useDepartmentUsers(department: string): UseDepartmentUsersResult {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchUsersByDepartment(department)
      .then((rows) => { if (!cancelled) { setUsers(rows); setLoading(false); } })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load users.");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [department]);

  return { users, loading, error };
}
