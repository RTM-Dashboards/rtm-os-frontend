"use client";

import { useState } from "react";

const teamMembers = [
  { name: "Lisa P.", role: "Department Head", access: "Full Access", status: "Active", clients: 13, lastActive: "Today, 9:05 AM"},
  { name: "Omar T.", role: "Sr. SEO Strategist", access: "Edit", status: "Active", clients: 9, lastActive: "Today, 8:20 AM"},
  { name: "Brianna K.", role: "Local SEO Specialist", access: "Edit", status: "Active", clients: 6, lastActive: "Yesterday, 6:30 PM"},
  { name: "Ivan L.", role: "GBP Manager", access: "Edit", status: "Active", clients: 5, lastActive: "Today, 10:30 AM"},
  { name: "Camille B.", role: "SEO Coordinator", access: "View", status: "Inactive", clients: 0, lastActive: "6 days ago"},
];

const workspacePermissions = [
  { label: "Manage GBP Listings", enabled: true },
  { label: "Publish SEO Reports", enabled: true },
  { label: "Edit Citation Sources", enabled: true },
  { label: "Manage Yelp & Review Sites", enabled: true },
  { label: "Access Rank Tracking", enabled: true },
  { label: "Export Keyword Data", enabled: false },
];

const notificationPrefs = [
  { label: "GBP listing suspended", channel: "Email + Slack", enabled: true },
  { label: "Keyword ranking dropped 5+", channel: "Email", enabled: true },
  { label: "New client review (negative)", channel: "Email + Slack", enabled: true },
  { label: "Monthly SEO report due", channel: "Slack", enabled: true },
  { label: "Citation error detected", channel: "Email", enabled: false },
];

const defaultTaskSettings = [
  { label: "Default Priority", value: "Medium"},
  { label: "Default Assignee", value: "Local SEO Specialist"},
  { label: "Audit Cycle", value: "Monthly"},
  { label: "Report Delivery", value: "First Monday of month"},
  { label: "Task Template", value: "SEO Local Standard"},
];

const accessColors: Record<string, string> = {
  "Full Access": "#1B4FD8",
  Edit: "#059669",
  View: "#78716C",
};

export default function SeoLocalSettingsPage() {
  const [permissions, setPermissions] = useState(workspacePermissions);
  const [notifications, setNotifications] = useState(notificationPrefs);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: "var(--rtm-blue)"}}>
            SEO & Local · Settings
          </p>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
            Department Settings
          </h1>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
            Manage team members, access levels, permissions, and department defaults.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors self-start flex-shrink-0"style={{ background: "var(--rtm-blue)"}}>
          Save Changes
        </button>
      </div>

      <div className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <h3 className="text-sm font-bold mb-4"style={{ color: "var(--rtm-text-primary)"}}>Department Head / Workspace Admin</h3>
        <div className="flex items-center gap-4 p-4 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"style={{ background: "var(--rtm-blue)"}}>L</div>
          <div className="flex-1">
            <p className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}>Lisa P.</p>
            <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>lisa@rtm.io · SEO & Local Department Head</p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"style={{ background: "#1B4FD818", color: "#1B4FD8"}}>Admin</span>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <div className="px-5 py-3 flex items-center justify-between"style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)"}}>
          <div>
            <h3 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Team Members</h3>
            <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{teamMembers.length} members</p>
          </div>
          <button className="text-xs font-semibold"style={{ color: "var(--rtm-blue)"}}>+ Invite Member</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                {["Member", "Role", "Access Level", "Status", "Assigned Clients", "Last Active"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m, i) => (
                <tr key={m.name} style={{ borderBottom: i < teamMembers.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"style={{ background: "var(--rtm-blue)"}}>{m.name.charAt(0)}</div>
                      <span className="font-medium whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>{m.role}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"style={{ background: `${accessColors[m.access]}18`, color: accessColors[m.access] }}>{m.access}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"style={m.status === "Active"? { background: "#05966918", color: "#059669"} : { background: "#78716C18", color: "#78716C"}}>{m.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-center"style={{ color: "var(--rtm-text-secondary)"}}>{m.clients}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{m.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <h3 className="text-sm font-bold mb-4"style={{ color: "var(--rtm-text-primary)"}}>Workspace Permissions</h3>
        <div className="space-y-2">
          {permissions.map((perm, i) => (
            <div key={perm.label} className="flex items-center justify-between p-3 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}>
              <span className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{perm.label}</span>
              <button onClick={() => setPermissions((prev) => prev.map((p, idx) => (idx === i ? { ...p, enabled: !p.enabled } : p)))} className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"style={{ background: perm.enabled ? "#1B4FD8": "var(--rtm-border)"}}>
                <span className="inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform"style={{ transform: perm.enabled ? "translateX(18px)": "translateX(3px)"}} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <h3 className="text-sm font-bold mb-4"style={{ color: "var(--rtm-text-primary)"}}>Notification Preferences</h3>
        <div className="space-y-2">
          {notifications.map((notif, i) => (
            <div key={notif.label} className="flex items-center justify-between p-3 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}>
              <div>
                <p className="text-sm font-medium"style={{ color: "var(--rtm-text-secondary)"}}>{notif.label}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{notif.channel}</p>
              </div>
              <button onClick={() => setNotifications((prev) => prev.map((n, idx) => (idx === i ? { ...n, enabled: !n.enabled } : n)))} className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"style={{ background: notif.enabled ? "#1B4FD8": "var(--rtm-border)"}}>
                <span className="inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform"style={{ transform: notif.enabled ? "translateX(18px)": "translateX(3px)"}} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <h3 className="text-sm font-bold mb-4"style={{ color: "var(--rtm-text-primary)"}}>Default Task Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {defaultTaskSettings.map((s) => (
            <div key={s.label} className="flex items-center justify-between p-3 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}>
              <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{s.label}</span>
              <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
