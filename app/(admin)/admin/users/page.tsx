"use client";

import { useState } from "react";
import { PageHeader, StatusBadge } from "@/components/ui";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Admin" | "Manager" | "Specialist" | "Read Only";
  department: string;
  status: "active" | "inactive" | "pending" | "offline";
  assignedClients: number;
  lastActive: string;
  avatarColor: string;
  initials: string;
}

const users: User[] = [
  { id: "1",  name: "Jordan Martinez",  email: "jordan@realtimemarketing.com", role: "Admin",        department: "Account Management", status: "active",   assignedClients: 28, lastActive: "2 min ago",  avatarColor: "#1B4FD8", initials: "JM" },
  { id: "2",  name: "Sarah Kim",        email: "sarah@realtimemarketing.com",  role: "Manager",      department: "Account Management", status: "active",   assignedClients: 24, lastActive: "15 min ago", avatarColor: "#D97706", initials: "SK" },
  { id: "3",  name: "Mike Torres",      email: "mike@realtimemarketing.com",   role: "Specialist",   department: "Paid Advertising",   status: "active",   assignedClients: 18, lastActive: "1h ago",     avatarColor: "#7C3AED", initials: "MT" },
  { id: "4",  name: "Alex Rivera",      email: "alex@realtimemarketing.com",   role: "Manager",      department: "Content",            status: "active",   assignedClients: 31, lastActive: "2h ago",     avatarColor: "#059669", initials: "AR" },
  { id: "5",  name: "Lisa Park",        email: "lisa@realtimemarketing.com",   role: "Specialist",   department: "SEO & Local",        status: "offline",  assignedClients: 22, lastActive: "1d ago",     avatarColor: "#EC4899", initials: "LP" },
  { id: "6",  name: "Daniel Chen",      email: "daniel@realtimemarketing.com", role: "Manager",      department: "Sales",              status: "active",   assignedClients: 15, lastActive: "30 min ago", avatarColor: "#0EA5E9", initials: "DC" },
  { id: "7",  name: "Priya Nair",       email: "priya@realtimemarketing.com",  role: "Specialist",   department: "Billing",            status: "active",   assignedClients: 12, lastActive: "45 min ago", avatarColor: "#F43F5E", initials: "PN" },
  { id: "8",  name: "Tom Walsh",        email: "tom@realtimemarketing.com",    role: "Specialist",   department: "Web Dev & Design",   status: "active",   assignedClients: 9,  lastActive: "3h ago",     avatarColor: "#6366F1", initials: "TW" },
  { id: "9",  name: "Rachel Moon",      email: "rachel@realtimemarketing.com", role: "Manager",      department: "Reporting",          status: "active",   assignedClients: 20, lastActive: "1h ago",     avatarColor: "#14B8A6", initials: "RM" },
  { id: "10", name: "Steve Nguyen",     email: "steve@realtimemarketing.com",  role: "Specialist",   department: "IT & Security",      status: "active",   assignedClients: 0,  lastActive: "5h ago",     avatarColor: "#64748B", initials: "SN" },
  { id: "11", name: "Amanda Foster",    email: "amanda@realtimemarketing.com", role: "Admin",        department: "Operations",         status: "pending",  assignedClients: 0,  lastActive: "Never",      avatarColor: "#A16207", initials: "AF" },
  { id: "12", name: "Chris Blake",      email: "chris@realtimemarketing.com",  role: "Read Only",    department: "Reporting",          status: "inactive", assignedClients: 0,  lastActive: "2w ago",     avatarColor: "#78716C", initials: "CB" },
];

const roleColors: Record<string, string> = {
  "Super Admin": "#1B4FD8",
  "Admin":       "#7C3AED",
  "Manager":     "#059669",
  "Specialist":  "#0EA5E9",
  "Read Only":   "#78716C",
};

const statusVariant = (s: User["status"]): "success" | "warning" | "info" => {
  if (s === "active")  return "success";
  if (s === "pending") return "warning";
  return "info";
};

export default function AdminUsersPage() {
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  const roles = ["All", "Super Admin", "Admin", "Manager", "Specialist", "Read Only"];
  const departments = ["All", ...Array.from(new Set(users.map((u) => u.department))).sort()];

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchDept = deptFilter === "All" || u.department === deptFilter;
    return matchSearch && matchRole && matchDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-blue)" }}>
            Admin · User Management
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Users
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Manage team members, roles, and client assignments.
          </p>
        </div>
        <button className="rtm-btn-primary inline-flex items-center gap-1.5 self-start">
          + Invite User
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users",    value: users.length.toString(),                                          icon: "👤" },
          { label: "Active",         value: users.filter((u) => u.status === "active").length.toString(),    icon: "🟢" },
          { label: "Pending",        value: users.filter((u) => u.status === "pending").length.toString(),   icon: "🟡" },
          { label: "Departments",    value: new Set(users.map((u) => u.department)).size.toString(),          icon: "🏢" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{k.icon}</span>
              <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>{k.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>{k.value}</p>
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
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        >
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        >
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* User roster table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-bg)" }}>
                {["User", "Role", "Department", "Status", "Assigned Clients", "Last Active", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--rtm-border-light)" : "none",
                  }}
                >
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: user.avatarColor }}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>
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
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{
                        background: `${roleColors[user.role]}18`,
                        color: roleColors[user.role],
                        border: `1px solid ${roleColors[user.role]}30`,
                      }}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                      {user.department}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge variant={statusVariant(user.status)} label={user.status === "offline" ? "Offline" : user.status.charAt(0).toUpperCase() + user.status.slice(1)} size="sm" />
                  </td>

                  {/* Assigned Clients */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center justify-center w-8 h-7 rounded-lg text-sm font-bold"
                      style={{
                        background: user.assignedClients > 0 ? "var(--rtm-blue-light)" : "var(--rtm-bg)",
                        color: user.assignedClients > 0 ? "var(--rtm-blue)" : "var(--rtm-text-muted)",
                      }}
                    >
                      {user.assignedClients}
                    </span>
                  </td>

                  {/* Last Active */}
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                      {user.lastActive}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors"
                        style={{
                          borderColor: "var(--rtm-border)",
                          color: "var(--rtm-text-secondary)",
                          background: "var(--rtm-bg)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors"
                        style={{
                          borderColor: "var(--rtm-border)",
                          color: "#EF4444",
                          background: "var(--rtm-bg)",
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

        {filtered.length === 0 && (
          <div className="py-12 text-center" style={{ color: "var(--rtm-text-muted)" }}>
            No users match your filters.
          </div>
        )}

        <div
          className="px-4 py-3 flex items-center justify-between text-xs"
          style={{ borderTop: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}
        >
          <span>Showing {filtered.length} of {users.length} users</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border" style={{ borderColor: "var(--rtm-border)" }}>Previous</button>
            <button className="px-3 py-1 rounded border" style={{ borderColor: "var(--rtm-border)" }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
