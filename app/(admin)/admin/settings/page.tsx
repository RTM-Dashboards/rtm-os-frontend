"use client";

import { useState } from "react";

type Tab = "system"| "roles"| "permissions";

const roles = [
  { name: "Super Admin", description: "Full platform access including system config, billing, and user management.", users: 1,  color: "#1B4FD8"},
  { name: "Admin",       description: "Full operational access; can manage users but cannot change system config.",  users: 2,  color: "#7C3AED"},
  { name: "Manager",     description: "Department-level access; can assign tasks and view all clients.",              users: 4,  color: "#059669"},
  { name: "Specialist",  description: "Can view and edit assigned clients and deliverables only.",                    users: 5,  color: "#0EA5E9"},
  { name: "Read Only",   description: "Can view reports and dashboards. No edit or delete access.",                   users: 1,  color: "#78716C"},
];

const permissionGroups = [
  {
    group: "Client Management",
    permissions: [
      { name: "View all clients",       roles: ["Super Admin", "Admin", "Manager", "Specialist", "Read Only"] },
      { name: "Create new client",      roles: ["Super Admin", "Admin", "Manager"] },
      { name: "Edit client profile",    roles: ["Super Admin", "Admin", "Manager", "Specialist"] },
      { name: "Archive/delete client",  roles: ["Super Admin", "Admin"] },
    ],
  },
  {
    group: "Task & Deliverable",
    permissions: [
      { name: "View all tasks",         roles: ["Super Admin", "Admin", "Manager", "Specialist", "Read Only"] },
      { name: "Create tasks",           roles: ["Super Admin", "Admin", "Manager", "Specialist"] },
      { name: "Assign tasks",           roles: ["Super Admin", "Admin", "Manager"] },
      { name: "Delete tasks",           roles: ["Super Admin", "Admin"] },
    ],
  },
  {
    group: "Reporting",
    permissions: [
      { name: "View reports",           roles: ["Super Admin", "Admin", "Manager", "Specialist", "Read Only"] },
      { name: "Generate reports",       roles: ["Super Admin", "Admin", "Manager"] },
      { name: "Export data",            roles: ["Super Admin", "Admin"] },
    ],
  },
  {
    group: "User & Access",
    permissions: [
      { name: "Invite users",           roles: ["Super Admin", "Admin"] },
      { name: "Edit user roles",        roles: ["Super Admin"] },
      { name: "Revoke access",          roles: ["Super Admin", "Admin"] },
      { name: "View audit log",         roles: ["Super Admin", "Admin"] },
    ],
  },
  {
    group: "Billing & Finance",
    permissions: [
      { name: "View billing",           roles: ["Super Admin", "Admin", "Manager", "Read Only"] },
      { name: "Edit billing",           roles: ["Super Admin", "Admin"] },
      { name: "Export invoices",        roles: ["Super Admin", "Admin"] },
    ],
  },
  {
    group: "System",
    permissions: [
      { name: "System settings",        roles: ["Super Admin"] },
      { name: "Integrations",           roles: ["Super Admin", "Admin"] },
      { name: "API keys",               roles: ["Super Admin"] },
    ],
  },
];

const allRoles = ["Super Admin", "Admin", "Manager", "Specialist", "Read Only"];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("system");

  const [systemSettings, setSystemSettings] = useState({
    agencyName:       "Real Time Marketing",
    primaryDomain:    "realtimemarketing.com",
    timezone:         "America/New_York",
    dateFormat:       "MM/DD/YYYY",
    sessionTimeout:   "30",
    twoFactorAuth:    true,
    auditLogging:     true,
    emailNotifications: true,
    slackIntegration: false,
    autoReports:      true,
    maintenanceMode:  false,
  });

  const tabs: { id: Tab; label: string; icon?: string }[] = [
    { id: "system",      label: "System Settings",    icon: ""},
    { id: "roles",       label: "Role Architecture",  icon: ""},
    { id: "permissions", label: "Permission Matrix",  icon: ""},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: "var(--rtm-blue)"}}>
          Admin · Settings
        </p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
          Settings
        </h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
          System configuration, role architecture, and permission management.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"style={
              activeTab === t.id
                ? { background: "var(--rtm-surface)", color: "var(--rtm-blue)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)"}
                : { color: "var(--rtm-text-secondary)"}
            }
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/*  System Settings  */}
      {activeTab === "system"&& (
        <div className="space-y-6">
          {/* Agency Info */}
          <div className="rounded-xl border p-6"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
            <h3 className="text-sm font-bold mb-4"style={{ color: "var(--rtm-text-primary)"}}>Agency Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "agencyName",    label: "Agency Name",    type: "text"},
                { key: "primaryDomain", label: "Primary Domain", type: "text"},
                { key: "timezone",      label: "Timezone",       type: "text"},
                { key: "dateFormat",    label: "Date Format",    type: "text"},
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1.5"style={{ color: "var(--rtm-text-muted)"}}>{f.label}</label>
                  <input
                    type={f.type}
                    value={(systemSettings as Record<string, unknown>)[f.key] as string}
                    onChange={(e) => setSystemSettings((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"style={{
                      background: "var(--rtm-bg)",
                      borderColor: "var(--rtm-border)",
                      color: "var(--rtm-text-primary)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div className="rounded-xl border p-6"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
            <h3 className="text-sm font-bold mb-4"style={{ color: "var(--rtm-text-primary)"}}>Security & Sessions</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5"style={{ color: "var(--rtm-text-muted)"}}>Session Timeout (minutes)</label>
                <input
                  type="number"value={systemSettings.sessionTimeout}
                  onChange={(e) => setSystemSettings((prev) => ({ ...prev, sessionTimeout: e.target.value }))}
                  className="w-48 px-3 py-2 rounded-lg border text-sm outline-none"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
                />
              </div>
              {[
                { key: "twoFactorAuth",  label: "Two-Factor Authentication",  description: "Require 2FA for all admin accounts."},
                { key: "auditLogging",   label: "Audit Logging",               description: "Log all user actions for compliance."},
                { key: "maintenanceMode",label: "Maintenance Mode",            description: "Restrict access to admins only."},
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between p-4 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}>
                  <div>
                    <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{s.label}</p>
                    <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{s.description}</p>
                  </div>
                  <button
                    onClick={() => setSystemSettings((prev) => ({ ...prev, [s.key]: !(prev as Record<string, unknown>)[s.key] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0`}
                    style={{ background: (systemSettings as Record<string, unknown>)[s.key] ? "#1B4FD8": "var(--rtm-border)"}}
                  >
                    <span
                      className="inline-block w-4 h-4 rounded-full bg-white transition-transform shadow"style={{ transform: (systemSettings as Record<string, unknown>)[s.key] ? "translateX(24px)": "translateX(4px)"}}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Integrations */}
          <div className="rounded-xl border p-6"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
            <h3 className="text-sm font-bold mb-4"style={{ color: "var(--rtm-text-primary)"}}>Integrations & Notifications</h3>
            <div className="space-y-3">
              {[
                { key: "emailNotifications", label: "Email Notifications", description: "Send email alerts for critical events."},
                { key: "slackIntegration",   label: "Slack Integration",    description: "Post notifications to Slack channels."},
                { key: "autoReports",        label: "Automated Reports",    description: "Auto-generate monthly client reports."},
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between p-4 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}>
                  <div>
                    <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{s.label}</p>
                    <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{s.description}</p>
                  </div>
                  <button
                    onClick={() => setSystemSettings((prev) => ({ ...prev, [s.key]: !(prev as Record<string, unknown>)[s.key] }))}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"style={{ background: (systemSettings as Record<string, unknown>)[s.key] ? "#1B4FD8": "var(--rtm-border)"}}
                  >
                    <span
                      className="inline-block w-4 h-4 rounded-full bg-white transition-transform shadow"style={{ transform: (systemSettings as Record<string, unknown>)[s.key] ? "translateX(24px)": "translateX(4px)"}}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 rounded-lg border text-sm font-medium"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}>
              Discard Changes
            </button>
            <button className="rtm-btn-primary px-4 py-2 rounded-lg text-sm font-medium">
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/*  Role Architecture  */}
      {activeTab === "roles"&& (
        <div className="space-y-4">
          {roles.map((role) => (
            <div
              key={role.name}
              className="rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"style={{ background: role.color }}
                >
                  {role.name.split("").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{role.name}</p>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"style={{ background: `${role.color}18`, color: role.color }}
                    >
                      {role.users} user{role.users !== 1 ? "s": ""}
                    </span>
                  </div>
                  <p className="text-xs mt-1"style={{ color: "var(--rtm-text-secondary)"}}>{role.description}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg)"}}
                >
                  Edit Role
                </button>
                {role.name !== "Super Admin"&& (
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium"style={{ borderColor: "var(--rtm-border)", color: "#EF4444", background: "var(--rtm-bg)"}}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button className="rtm-btn-primary px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5">
            + Create New Role
          </button>
        </div>
      )}

      {/*  Permission Matrix  */}
      {activeTab === "permissions"&& (
        <div className="space-y-4">
          {permissionGroups.map((group) => (
            <div
              key={group.group}
              className="rounded-xl border overflow-hidden"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
            >
              <div className="px-5 py-3"style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)"}}>
                <p className="text-xs font-bold uppercase tracking-wider"style={{ color: "var(--rtm-text-muted)"}}>{group.group}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                      <th className="px-4 py-3 text-left text-xs font-semibold"style={{ color: "var(--rtm-text-muted)", minWidth: "200px"}}>Permission</th>
                      {allRoles.map((r) => (
                        <th key={r} className="px-3 py-3 text-center text-xs font-semibold"style={{ color: "var(--rtm-text-muted)", minWidth: "90px"}}>{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.permissions.map((perm, i) => (
                      <tr
                        key={perm.name}
                        style={{ borderBottom: i < group.permissions.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}
                      >
                        <td className="px-4 py-3 text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{perm.name}</td>
                        {allRoles.map((r) => (
                          <td key={r} className="px-3 py-3 text-center">
                            {perm.roles.includes(r) ? (
                              <span
                                className="inline-block w-5 h-5 rounded-full text-white text-xs font-bold leading-5"style={{ background: "#10B981"}}
                              >
                                
                              </span>
                            ) : (
                              <span
                                className="inline-block w-5 h-5 rounded-full text-xs leading-5"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)", color: "var(--rtm-text-muted)"}}
                              >
                                —
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
