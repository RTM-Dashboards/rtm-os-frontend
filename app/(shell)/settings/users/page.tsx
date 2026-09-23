"use client";

// RTM OS — /settings/users
// Real working page. Replaces the ConfigPlaceholder.
//
// Visible to Manager and above. Members see an honest no-access message.
//
// Data:  GET  /api/users      → list scoped by tier
// Write: PATCH /api/users?id= → set role, status, department
//
// Sections:
//   1. Unassigned users (department null) — top, prominent. These need action.
//   2. Own-department users (or all users for SA/Exec).
//
// Controls per viewer tier:
//   SystemAdmin / Executive:
//     All role selects (all four values), all status selects (all three values),
//     all department selects (all ten values). Own row is read-only with a label.
//   Manager:
//     For null-department (unassigned) users:
//       - Role select fixed to "Member" only (claim rule).
//       - Department select fixed to own department only (claim rule).
//       - Status select shown (pending / active / disabled).
//     For own-department users:
//       - Role select shows Member only (can't promote, can't demote past Member).
//       - Status select shown.
//       - No department select (would ALWAYS fail — noise, not security).
//     Own row is read-only with a label.
//   Member:
//     Not shown controls; page renders an honest no-access message instead.
//
// Error surface: API refusal messages shown verbatim (not replaced).

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchUsers, fetchCurrentUser } from "@/lib/users/users-api";
import type { UserRecord } from "@/lib/users/users-api";
import {
  VALID_ROLES,
  VALID_STATUSES,
  VALID_DEPARTMENTS,
} from "@/lib/auth/vocab";

// ── Type aliases ──────────────────────────────────────────────────────────────

type ViewerRole = "SystemAdmin" | "Executive" | "Manager" | "Member" | null;

// ── Formatting helpers ─────────────────────────────────────────────────────────

function displayRole(role: string | null): string {
  return role ?? "No role assigned";
}

function displayDept(dept: string | null): string {
  return dept ?? "Not assigned";
}

function displayStatus(status: string): string {
  const map: Record<string, string> = {
    pending:  "Pending",
    active:   "Active",
    disabled: "Disabled",
  };
  return map[status] ?? status;
}

function displayLastLogin(ts: string | null): string {
  if (!ts) return "Never";
  try {
    return new Date(ts).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    active:   { background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" },
    pending:  { background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" },
    disabled: { background: "#F9FAFB", color: "#6B7280", border: "1px solid #E5E7EB" },
  };
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={styles[status] ?? styles.disabled}
    >
      {displayStatus(status)}
    </span>
  );
}

// ── Role badge ────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string | null }) {
  const styles: Record<string, React.CSSProperties> = {
    SystemAdmin: { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" },
    Executive:   { background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE" },
    Manager:     { background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" },
    Member:      { background: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" },
  };
  if (!role) {
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{ background: "#F9FAFB", color: "#9CA3AF", border: "1px solid #E5E7EB" }}>
        No role assigned
      </span>
    );
  }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={styles[role] ?? { background: "#F9FAFB", color: "#6B7280" }}>
      {role}
    </span>
  );
}

// ── Select helper ─────────────────────────────────────────────────────────────

const selectCls = "text-xs font-medium rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0";
const selectStyle: React.CSSProperties = {
  background: "var(--rtm-surface)",
  borderColor: "var(--rtm-border)",
  color: "var(--rtm-text-primary)",
};

// ── Row-level edit form ────────────────────────────────────────────────────────

interface UserRowProps {
  user: UserRecord;
  viewerRole: ViewerRole;
  viewerDept: string | null;
  viewerId: string;
  onSaved: (updated: UserRecord) => void;
}

function UserRow({ user, viewerRole, viewerDept, viewerId, onSaved }: UserRowProps) {
  const isOwnRow = user.id === viewerId;
  const isSA = viewerRole === "SystemAdmin";
  const isExec = viewerRole === "Executive";
  const isManager = viewerRole === "Manager";
  const isUnassigned = user.department === null;

  const [localRole, setLocalRole]   = useState(user.role ?? "");
  const [localStatus, setLocalStatus] = useState(user.status);
  const [localDept, setLocalDept]   = useState(user.department ?? "");
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState<string | null>(null);
  const [apiError, setApiError]     = useState<string | null>(null);

  // Reset local state when user prop changes (e.g. after a save from another row).
  useEffect(() => {
    setLocalRole(user.role ?? "");
    setLocalStatus(user.status);
    setLocalDept(user.department ?? "");
    setSuccess(null);
    setApiError(null);
  }, [user]);

  const handleSave = useCallback(async (deptOverride?: string) => {
    setApiError(null);
    setSuccess(null);
    setSaving(true);

    const effectiveDept = deptOverride !== undefined ? deptOverride : localDept;

    const patch: Record<string, string> = {};
    if (localRole !== (user.role ?? ""))           patch.role       = localRole;
    if (localStatus !== user.status)               patch.status     = localStatus;
    if (effectiveDept !== (user.department ?? "")) patch.department = effectiveDept;

    if (Object.keys(patch).length === 0) {
      setSaving(false);
      setSuccess("No changes.");
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? `HTTP ${res.status}`);
      } else {
        setSuccess("Saved.");
        onSaved(data.user as UserRecord);
      }
    } catch (err) {
      setApiError(String(err));
    } finally {
      setSaving(false);
    }
  }, [user, localRole, localStatus, localDept, onSaved]);

  // Determine what controls are visible for this viewer+row combination.
  const showRoleSelect   = !isOwnRow && (isSA || isExec || isManager);
  const showStatusSelect = !isOwnRow && (isSA || isExec || isManager);
  // Department select: SA/Exec always; Manager never (would always fail or is
  // a claim — handled via the fixed department logic for unassigned users).
  const showDeptSelect   = !isOwnRow && (isSA || isExec);

  // For Managers, role options are restricted to Member only.
  const roleOptions = isManager
    ? ["Member"]
    : (isSA ? VALID_ROLES : VALID_ROLES.filter((r) => r !== "SystemAdmin" && r !== "Executive"));

  // For Managers on unassigned users, department is locked to their own.
  // We show it as read-only text, not a select.
  const showManagerClaimDept = isManager && isUnassigned && !isOwnRow;

  const rowBg = isUnassigned
    ? { background: "#FFFBEB", borderColor: "#FDE68A" }
    : { background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" };

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3"
      style={rowBg}
    >
      {/* Top: name + email + badges */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-2">
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
              {user.name}
            </p>
            {isUnassigned && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#FEF9C3", color: "#92400E", border: "1px solid #FDE68A" }}>
                ⚡ Unassigned — needs setup
              </span>
            )}
            {isOwnRow && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
                You (read-only)
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {user.email}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center flex-shrink-0">
          <RoleBadge role={user.role} />
          <StatusBadge status={user.status} />
        </div>
      </div>

      {/* Detail row: department + last login */}
      <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <span>
          <span className="font-medium" style={{ color: "var(--rtm-text-secondary)" }}>Dept:</span>{" "}
          {displayDept(user.department)}
        </span>
        <span>
          <span className="font-medium" style={{ color: "var(--rtm-text-secondary)" }}>Last login:</span>{" "}
          {displayLastLogin(user.lastLoginAt)}
        </span>
        {user.roleSetBy && (
          <span>
            <span className="font-medium" style={{ color: "var(--rtm-text-secondary)" }}>Role set:</span>{" "}
            {user.roleSetAt ? new Date(user.roleSetAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
          </span>
        )}
      </div>

      {/* Edit controls — only shown for rows the viewer can touch */}
      {!isOwnRow && (isSA || isExec || isManager) && (
        <div className="flex flex-wrap items-end gap-3 pt-1">
          {/* Role */}
          {showRoleSelect && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--rtm-text-muted)" }}>
                Role
              </label>
              <select
                className={selectCls}
                style={selectStyle}
                value={localRole}
                onChange={(e) => setLocalRole(e.target.value)}
                disabled={saving}
              >
                <option value="">— no role —</option>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {/* Status */}
          {showStatusSelect && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--rtm-text-muted)" }}>
                Status
              </label>
              <select
                className={selectCls}
                style={selectStyle}
                value={localStatus}
                onChange={(e) => setLocalStatus(e.target.value)}
                disabled={saving}
              >
                {VALID_STATUSES.map((s) => (
                  <option key={s} value={s}>{displayStatus(s)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Department — SA/Exec full select */}
          {showDeptSelect && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--rtm-text-muted)" }}>
                Department
              </label>
              <select
                className={selectCls}
                style={selectStyle}
                value={localDept}
                onChange={(e) => setLocalDept(e.target.value)}
                disabled={saving}
              >
                <option value="">— not assigned —</option>
                {VALID_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Claim dept label for Manager on unassigned users */}
          {showManagerClaimDept && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--rtm-text-muted)" }}>
                Claim into dept
              </label>
              <div
                className="text-xs font-medium px-2 py-1 rounded-lg border"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: "var(--rtm-border)",
                  color: "var(--rtm-text-secondary)",
                  minWidth: "120px",
                }}
              >
                {viewerDept ?? "—"}
              </div>
              {/* The actual department patch is set on save from viewerDept */}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={() => {
              // For Manager claiming an unassigned user, pass their department
              // directly rather than waiting for the setLocalDept state flush.
              if (showManagerClaimDept && viewerDept) {
                handleSave(viewerDept);
              } else {
                handleSave();
              }
            }}
            disabled={saving}
            className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
            style={{
              background: saving ? "var(--rtm-border)" : "#1B4FD8",
              color: saving ? "var(--rtm-text-muted)" : "#ffffff",
              cursor: saving ? "wait" : "pointer",
              border: "none",
              height: "28px",
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>

          {/* Feedback */}
          {success && (
            <span className="text-xs" style={{ color: "#059669" }}>{success}</span>
          )}
          {apiError && (
            <span className="text-xs text-red-600 max-w-xs">{apiError}</span>
          )}
        </div>
      )}

      {/* Own row — explain why it's not editable */}
      {isOwnRow && (
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          Self-modification is not permitted. Ask another SystemAdmin or Executive to change your role or department.
        </p>
      )}
    </div>
  );
}

// ── Member gate ────────────────────────────────────────────────────────────────

function MemberGate() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <div
        className="rounded-xl border p-8"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--rtm-text-primary)" }}>
          Access Restricted
        </h2>
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
          The Users page is available to Managers, Executives, and SystemAdmins only.
          Members can view their own profile from their department workspace.
        </p>
      </div>
    </div>
  );
}

// ── Loading state ─────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border p-4 animate-pulse"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div className="h-4 w-1/3 rounded mb-2" style={{ background: "var(--rtm-border)" }} />
          <div className="h-3 w-1/2 rounded" style={{ background: "var(--rtm-border-light)" }} />
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers]           = useState<UserRecord[]>([]);
  const [viewer, setViewer]         = useState<UserRecord | null>(null);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchCurrentUser(), fetchUsers()])
      .then(([me, all]) => {
        setViewer(me);
        setUsers(all);
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(String(err));
        setLoading(false);
      });
  }, []);

  const handleSaved = useCallback((updated: UserRecord) => {
    setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
  }, []);

  // Identify viewer role/dept.
  const viewerRole = (viewer?.role ?? null) as ViewerRole;
  const viewerDept = viewer?.department ?? null;
  const viewerId   = viewer?.id ?? "";

  // ── Member gate: resolve before we have viewer if user never loaded,
  //    but do NOT gate on null (that means loading or load failure, not Member).
  if (!loading && viewer && viewerRole === "Member") {
    return <MemberGate />;
  }

  // Separate unassigned and assigned users.
  const unassigned = users.filter((u) => u.department === null);
  const assigned   = users.filter((u) => u.department !== null);

  // Stats
  const totalUsers      = users.length;
  const activeUsers     = users.filter((u) => u.status === "active").length;
  const pendingUsers    = users.filter((u) => u.status === "pending").length;
  const unassignedCount = unassigned.length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <Link href="/settings" className="hover:underline" style={{ color: "var(--rtm-text-muted)" }}>
          Settings
        </Link>
        <span>›</span>
        <span style={{ color: "var(--rtm-text-secondary)" }}>Users</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Users
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Manage user roles, departments, and account status.
            {viewerRole === "Manager" && " As a Manager, you can claim unassigned users into your department and manage your team members."}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 self-start"
          style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}
        >
          Live
        </span>
      </div>

      {/* Stats */}
      {!loading && !loadError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Users",  value: totalUsers,      color: "var(--rtm-text-primary)" },
            { label: "Active",       value: activeUsers,     color: "#059669" },
            { label: "Pending",      value: pendingUsers,    color: "#D97706" },
            { label: "Unassigned",   value: unassignedCount, color: unassignedCount > 0 ? "#DC2626" : "#6B7280" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border p-3 text-center"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Load error */}
      {loadError && (
        <div className="rounded-lg px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200">
          Failed to load users: {loadError}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Skeleton />
      ) : !loadError && (
        <div className="space-y-8">
          {/* ── Unassigned section ── */}
          {unassigned.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                  ⚡ Unassigned Users
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>
                  {unassigned.length} need{unassigned.length === 1 ? "s" : ""} setup
                </span>
              </div>
              <p className="text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
                These users have signed in but haven&apos;t been assigned a role or department yet.
                {viewerRole === "Manager"
                  ? " You can claim them into your department as Members."
                  : " Assign them a role, department, and set their status to active."}
              </p>
              <div className="space-y-3">
                {unassigned.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    viewerRole={viewerRole}
                    viewerDept={viewerDept}
                    viewerId={viewerId}
                    onSaved={handleSaved}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Assigned users section ── */}
          {assigned.length > 0 && (
            <section>
              <h2 className="text-sm font-bold mb-3" style={{ color: "var(--rtm-text-primary)" }}>
                {viewerRole === "Manager" ? "Your Department" : "All Users"}
              </h2>
              <div className="space-y-3">
                {assigned.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    viewerRole={viewerRole}
                    viewerDept={viewerDept}
                    viewerId={viewerId}
                    onSaved={handleSaved}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Empty state ── */}
          {users.length === 0 && (
            <div className="rounded-xl border py-16 text-center"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-primary)" }}>
                No users visible
              </p>
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                {viewerRole === "Manager"
                  ? "Your department has no members yet, and there are no unassigned users to claim."
                  : "No user records found."}
              </p>
            </div>
          )}

          {/* ── Viewer-only state (only themselves) ── */}
          {users.length === 1 && users[0]?.id === viewerId && (
            <div className="rounded-xl border p-4"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                You are the only user visible to you right now. Other users will appear here once they sign in and are assigned to your department.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Related */}
      <section className="rounded-xl border overflow-hidden"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
            Related Configuration
          </h2>
        </div>
        <div className="p-5 flex flex-wrap gap-2">
          {[
            { label: "Roles & Permissions", href: "/settings/roles" },
            { label: "Departments",         href: "/settings/departments" },
            { label: "Audit Conditions",    href: "/settings/audit-conditions" },
          ].map((rel) => (
            <Link key={rel.href} href={rel.href}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors hover:shadow-sm"
              style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
              {rel.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
