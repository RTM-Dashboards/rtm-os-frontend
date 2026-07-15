"use client";

import { useState } from "react";
import { KpiSettingsSection } from "@/components/settings/KpiSettingsSection";

function PreviewBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      Preview — Target State
    </span>
  );
}

function SaveToast({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E", maxWidth: 360 }}
    >
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="flex-1">
        <p className="font-semibold">Changes not saved</p>
        <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>This settings panel is a prototype — no data is persisted to any backend.</p>
      </div>
      <button onClick={onClose} className="ml-1 text-xs font-bold opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

const teamMembers = [
  { name: "Derek A.", role: "Department Head", access: "Full Access", status: "Active", clients: 16, lastActive: "Today, 8:35 AM"},
  { name: "Simone T.", role: "Sr. LSA Specialist", access: "Edit", status: "Active", clients: 11, lastActive: "Today, 9:25 AM"},
  { name: "Patrick H.", role: "LSA Campaign Manager", access: "Edit", status: "Active", clients: 8, lastActive: "Yesterday, 5:15 PM"},
  { name: "Yuki O.", role: "Review Coordinator", access: "Edit", status: "Active", clients: 5, lastActive: "Today, 10:00 AM"},
  { name: "Brett N.", role: "LSA Analyst", access: "View", status: "Inactive", clients: 0, lastActive: "5 days ago"},
];

const workspacePermissions = [
  { label: "Manage LSA Campaigns", enabled: true },
  { label: "Respond to Customer Reviews", enabled: true },
  { label: "Dispute Invalid Leads", enabled: true },
  { label: "Edit Budget Settings", enabled: false },
  { label: "Access Lead History", enabled: true },
  { label: "Export LSA Reports", enabled: true },
];

const notificationPrefs = [
  { label: "New LSA lead received", channel: "Email + Slack", enabled: true },
  { label: "Lead marked as invalid", channel: "Slack", enabled: true },
  { label: "New review posted", channel: "Email + Slack", enabled: true },
  { label: "Account suspended or paused", channel: "Email + Slack", enabled: true },
  { label: "Monthly LSA report ready", channel: "Slack", enabled: false },
];

const defaultTaskSettings = [
  { label: "Default Priority", value: "High"},
  { label: "Default Assignee", value: "LSA Specialist"},
  { label: "Lead Response SLA", value: "Within 1 hour"},
  { label: "Review Response Window", value: "24 hours"},
  { label: "Task Template", value: "LSA Standard"},
];

const accessColors: Record<string, string> = {
  "Full Access": "#1B4FD8",
  Edit: "#059669",
  View: "#78716C",
};

export default function LocalServiceAdsSettingsPage() {
  const [permissions, setPermissions] = useState(workspacePermissions);
  const [notifications, setNotifications] = useState(notificationPrefs);
  const [showSaveToast, setShowSaveToast] = useState(false);

  return (
    <div className="space-y-6">
      {showSaveToast && <SaveToast onClose={() => setShowSaveToast(false)} />}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: "var(--rtm-blue)"}}>
            Local Service Ads · Settings
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
              Department Settings
            </h1>
            <PreviewBadge />
          </div>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
            Manage team members, access levels, permissions, and department defaults.
          </p>
        </div>
        <button
          onClick={() => setShowSaveToast(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors self-start flex-shrink-0"
          style={{ background: "var(--rtm-blue)" }}
        >
          Save Changes
        </button>
      </div>

      <div className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <h3 className="text-sm font-bold mb-4"style={{ color: "var(--rtm-text-primary)"}}>Department Head / Workspace Admin</h3>
        <div className="flex items-center gap-4 p-4 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"style={{ background: "var(--rtm-blue)"}}>D</div>
          <div className="flex-1">
            <p className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}>Derek A.</p>
            <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>derek@rtm.io · Local Service Ads Department Head</p>
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
          <button
            disabled
            title="Not yet available"
            className="text-xs font-semibold opacity-40 cursor-not-allowed"
            style={{ color: "var(--rtm-blue)" }}
          >
            + Invite Member
          </button>
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

      <KpiSettingsSection departmentSlug="local-service-ads" />
    </div>
  );
}
