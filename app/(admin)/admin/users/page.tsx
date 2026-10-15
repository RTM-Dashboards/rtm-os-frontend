"use client";

// RTM OS — Admin · User Management
//
// Data source: GET /api/users (real users table via Prisma).
// Editing:     PATCH /api/users?id=<id> — sets role, status, department.
//
// Mock removed: the static `const users: User[]` array of twelve invented
//   people (Jordan Martinez, Sarah Kim, …) that lived in this file before
//   this rewrite has been deleted. Data now comes from the database.
//
// Role vocabulary: matches the four-tier auth model enforced by /api/users
//   and lib/auth/vocab.ts — SystemAdmin / Executive / Manager / Member.
//   The previous mock used Admin / Manager / Specialist / Read Only, which
//   did not match the enforced model.
//
// Department list: VALID_DEPARTMENTS from lib/auth/vocab.ts — the canonical
//   ten departments established by the department-normalisation commit.
//   No invented list.
//
// Assigned Clients: clients.assignedAM is a plain string (not a user-id FK).
//   No join is possible. The column renders an em dash for every user. See
//   report section "Assigned clients" for details.
//
// Status field: the real schema uses "pending" | "active" | "disabled".
//   The mock's "inactive" and "offline" values do not exist in the database.

import { useState, useEffect, useCallback } from "react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { VALID_DEPARTMENTS, VALID_ROLES } from "@/lib/auth/vocab";
import type { StatusVariant } from "@/components/ui/StatusBadge";

// ── Types ─────────────────────────────────────────────────────────────────────

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
  isMain:      boolean | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic avatar colour derived from the user's name.
// Uses the same hue-based approach as other pages in this codebase.
const AVATAR_COLORS = [
  "#1B4FD8", "#7C3AED", "#059669", "#D97706",
  "#0EA5E9", "#EC4899", "#F43F5E", "#14B8A6",
  "#6366F1", "#64748B",
];
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const roleColors: Record<string, string> = {
  SystemAdmin: "#1B4FD8",
  Executive:   "#7C3AED",
  Manager:     "#059669",
  Member:      "#0EA5E9",
};

function statusVariant(s: string): StatusVariant {
  if (s === "active")   return "active";
  if (s === "pending")  return "pending";
  if (s === "disabled") return "inactive";
  return "neutral";
}

function statusLabel(s: string): string {
  if (s === "active")   return "Active";
  if (s === "pending")  return "Pending";
  if (s === "disabled") return "Disabled";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatLastActive(iso: string | null): string {
  if (!iso) return "Never";
  try {
    const d   = new Date(iso);
    const now = Date.now();
    const ms  = now - d.getTime();
    const m   = Math.floor(ms / 60_000);
    if (m < 2)   return "Just now";
    if (m < 60)  return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  } catch {
    return "—";
  }
}

// ── Edit modal ────────────────────────────────────────────────────────────────

interface EditModalProps {
  user:     UserRecord;
  onClose:  () => void;
  onSaved:  (updated: UserRecord) => void;
}

function EditModal({ user, onClose, onSaved }: EditModalProps) {
  const [role,       setRole]       = useState(user.role       ?? "");
  const [status,     setStatus]     = useState(user.status     ?? "pending");
  const [department, setDepartment] = useState(user.department ?? "");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string> = {};
      if (role)                      body.role       = role;
      if (status)                    body.status     = status;
      if (department)                body.department = department;

      const res = await fetch(`/api/users?id=${encodeURIComponent(user.id)}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const json = await res.json() as { user?: UserRecord; error?: string };
      if (!res.ok) {
        setError(json.error ?? `Error ${res.status}`);
      } else if (json.user) {
        onSaved(json.user);
        onClose();
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl border shadow-2xl p-6 space-y-5"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Edit User
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {user.name} · {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{
              background:   "var(--rtm-bg)",
              borderColor:  "var(--rtm-border)",
              color:        "var(--rtm-text-primary)",
            }}
          >
            <option value="">— no role —</option>
            {VALID_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{
              background:   "var(--rtm-bg)",
              borderColor:  "var(--rtm-border)",
              color:        "var(--rtm-text-primary)",
            }}
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{
              background:   "var(--rtm-bg)",
              borderColor:  "var(--rtm-border)",
              color:        "var(--rtm-text-primary)",
            }}
          >
            <option value="">— no department —</option>
            {VALID_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs rounded-lg px-3 py-2" style={{ background: "#FEF2F2", color: "#EF4444" }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            disabled={saving}
            className="text-sm px-4 py-2 rounded-lg border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rtm-btn-primary text-sm px-4 py-2"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Revoke confirmation modal ─────────────────────────────────────────────────

interface RevokeModalProps {
  user:    UserRecord;
  onClose: () => void;
  onSaved: (updated: UserRecord) => void;
}

function RevokeModal({ user, onClose, onSaved }: RevokeModalProps) {
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  async function handleRevoke() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/users?id=${encodeURIComponent(user.id)}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "disabled" }),
      });
      const json = await res.json() as { user?: UserRecord; error?: string };
      if (!res.ok) {
        setError(json.error ?? `Error ${res.status}`);
      } else if (json.user) {
        onSaved(json.user);
        onClose();
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl border shadow-2xl p-6 space-y-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          Revoke Access
        </h2>
        <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
          This will set <strong>{user.name}</strong>&apos;s status to{" "}
          <strong>Disabled</strong>. They will not be able to sign in. You can
          re-enable them at any time via Edit.
        </p>
        {error && (
          <p className="text-xs rounded-lg px-3 py-2" style={{ background: "#FEF2F2", color: "#EF4444" }}>
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            disabled={saving}
            className="text-sm px-4 py-2 rounded-lg border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleRevoke}
            disabled={saving}
            className="text-sm px-4 py-2 rounded-lg font-medium"
            style={{ background: "#EF4444", color: "#fff" }}
          >
            {saving ? "Revoking…" : "Revoke Access"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  // All state declarations must appear before any conditional returns.
  // (React error #310 fires in production when hooks follow an early return.)
  const [users,       setUsers]       = useState<UserRecord[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState("All");
  const [deptFilter,  setDeptFilter]  = useState("All");
  const [editTarget,  setEditTarget]  = useState<UserRecord | null>(null);
  const [revokeTarget,setRevokeTarget]= useState<UserRecord | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/users");
      const json = await res.json() as { users?: UserRecord[]; error?: string };
      if (!res.ok) {
        setFetchError(json.error ?? `Error ${res.status}`);
      } else {
        setUsers(json.users ?? []);
      }
    } catch (e) {
      setFetchError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  function handleSaved(updated: UserRecord) {
    setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
  }

  // KPI tiles — computed from real rows.
  const totalUsers   = users.length;
  const activeUsers  = users.filter((u) => u.status === "active").length;
  const pendingUsers = users.filter((u) => u.status === "pending").length;
  // Distinct non-null departments, from the canonical list only.
  const deptCount = new Set(
    users.map((u) => u.department).filter((d): d is string => !!d)
  ).size;

  // Filter options — roles from the canonical list only.
  const roles       = ["All", ...VALID_ROLES];
  const departments = ["All", ...VALID_DEPARTMENTS];

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchDept = deptFilter === "All" || u.department === deptFilter;
    return matchSearch && matchRole && matchDept;
  });

  return (
    <div className="space-y-6">
      {/* Modals */}
      {editTarget && (
        <EditModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}
      {revokeTarget && (
        <RevokeModal
          user={revokeTarget}
          onClose={() => setRevokeTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--rtm-blue)" }}
          >
            Admin · User Management
          </p>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Users
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Manage team members, roles, and department assignments.
          </p>
        </div>
        <button className="rtm-btn-primary inline-flex items-center gap-1.5 self-start">
          + Invite User
        </button>
      </div>

      {/* KPI strip — computed from real rows */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users",  value: totalUsers.toString(),   icon: "👥" },
          { label: "Active",       value: activeUsers.toString(),  icon: "✅" },
          { label: "Pending",      value: pendingUsers.toString(), icon: "⏳" },
          { label: "Departments",  value: deptCount.toString(),    icon: "🏢" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{k.icon}</span>
              <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>
                {k.label}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {loading ? "—" : k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border text-sm outline-none"
          style={{
            background:  "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color:       "var(--rtm-text-primary)",
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{
            background:  "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color:       "var(--rtm-text-primary)",
          }}
        >
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{
            background:  "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color:       "var(--rtm-text-primary)",
          }}
        >
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Error state */}
      {fetchError && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}
        >
          Failed to load users: {fetchError}
        </div>
      )}

      {/* User roster table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--rtm-border)",
                  background:   "var(--rtm-bg)",
                }}
              >
                {["User", "Role", "Department", "Status", "Assigned Clients", "Last Active", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    Loading users…
                  </td>
                </tr>
              )}
              {!loading && filtered.map((user, i) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom:
                      i < filtered.length - 1
                        ? "1px solid var(--rtm-border-light)"
                        : "none",
                  }}
                >
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: avatarColor(user.name) }}
                      >
                        {initials(user.name)}
                      </div>
                      <div>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "var(--rtm-text-primary)" }}
                        >
                          {user.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    {user.role ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{
                          background: `${roleColors[user.role] ?? "#64748B"}18`,
                          color:       roleColors[user.role] ?? "#64748B",
                          border:     `1px solid ${roleColors[user.role] ?? "#64748B"}30`,
                        }}
                      >
                        {user.role}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                    )}
                  </td>

                  {/* Department */}
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                      {user.department ?? <span style={{ color: "var(--rtm-text-muted)" }}>—</span>}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={statusVariant(user.status)}
                      label={statusLabel(user.status)}
                      size="sm"
                    />
                  </td>

                  {/* Assigned Clients
                      clients.assignedAM is a plain string (not a user-id FK).
                      No join is possible; render em dash per the spec.            */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center justify-center w-8 h-7 rounded-lg text-sm"
                      style={{
                        background: "var(--rtm-bg)",
                        color:      "var(--rtm-text-muted)",
                      }}
                    >
                      —
                    </span>
                  </td>

                  {/* Last Active */}
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                      {formatLastActive(user.lastLoginAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditTarget(user)}
                        className="text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors"
                        style={{
                          borderColor: "var(--rtm-border)",
                          color:       "var(--rtm-text-secondary)",
                          background:  "var(--rtm-bg)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setRevokeTarget(user)}
                        disabled={user.status === "disabled"}
                        className="text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          borderColor: "var(--rtm-border)",
                          color:       "#EF4444",
                          background:  "var(--rtm-bg)",
                        }}
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && !fetchError && (
          <div className="py-12 text-center" style={{ color: "var(--rtm-text-muted)" }}>
            No users match your filters.
          </div>
        )}

        <div
          className="px-4 py-3 flex items-center justify-between text-xs"
          style={{ borderTop: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}
        >
          <span>
            {loading ? "Loading…" : `Showing ${filtered.length} of ${users.length} users`}
          </span>
          {/* Pagination UI preserved as designed; not functional in this run
              (all users fit in one page). Do not remove. */}
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded border"
              style={{ borderColor: "var(--rtm-border)" }}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 rounded border"
              style={{ borderColor: "var(--rtm-border)" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
