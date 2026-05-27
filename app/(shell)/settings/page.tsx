"use client";

import { SectionWrapper, StatusBadge, AlertBanner } from "@/components/ui";
import type { AlertItem } from "@/components/ui";

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "2FA not enabled for all team members", description: "3 accounts have not enabled two-factor authentication.", action: "Enforce" },
];

const integrations = [
  { name: "Google Workspace", status: "connected", description: "Email, calendar & docs", icon: "🔵" },
  { name: "Slack", status: "connected", description: "Team notifications", icon: "💬" },
  { name: "Google Analytics", status: "connected", description: "Site analytics", icon: "📊" },
  { name: "Stripe", status: "connected", description: "Billing & payments", icon: "💳" },
  { name: "Meta Business Suite", status: "connected", description: "Ads & pages", icon: "📘" },
  { name: "Google Ads", status: "connected", description: "PPC campaigns", icon: "🎯" },
  { name: "Salesforce", status: "disconnected", description: "CRM sync", icon: "☁️" },
  { name: "Zapier", status: "disconnected", description: "Workflow automation", icon: "⚡" },
];

const teamMembers = [
  { name: "Jordan M.", email: "jordan@rtm.io", role: "Sr. Account Manager", status: "active", twoFa: true },
  { name: "Sarah K.", email: "sarah@rtm.io", role: "Account Manager", status: "active", twoFa: true },
  { name: "Mike T.", email: "mike@rtm.io", role: "Paid Media Lead", status: "active", twoFa: false },
  { name: "Alex R.", email: "alex@rtm.io", role: "Content Manager", status: "active", twoFa: true },
  { name: "Lisa P.", email: "lisa@rtm.io", role: "SEO Specialist", status: "active", twoFa: false },
  { name: "Chris D.", email: "chris@rtm.io", role: "Designer", status: "active", twoFa: false },
];

const notificationSettings = [
  { label: "New lead assigned", channel: "Email + Slack", enabled: true },
  { label: "Client health drops below 70", channel: "Email + Slack", enabled: true },
  { label: "Invoice overdue", channel: "Email", enabled: true },
  { label: "Report due in 2 days", channel: "Slack", enabled: true },
  { label: "Campaign ROAS drops below target", channel: "Email", enabled: false },
  { label: "New review received", channel: "Slack", enabled: true },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform configuration, team management & integrations.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[var(--rtm-blue)] hover:bg-[var(--rtm-blue-dark)] text-white text-sm font-semibold transition-colors self-start">Save Changes</button>
      </div>

      <AlertBanner alerts={alerts} />

      {/* Platform Info */}
      <SectionWrapper title="Platform" description="Real Time Marketing Operational Dashboards — Configuration">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Agency Name", value: "RTM Agency" },
            { label: "Primary Domain", value: "rtm.io" },
            { label: "Time Zone", value: "America/Denver (MST)" },
            { label: "Plan", value: "Enterprise" },
            { label: "Active Users", value: "6" },
            { label: "Billing Cycle", value: "Monthly" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Team Members */}
      <SectionWrapper title="Team Members" description={`${teamMembers.length} active users`}
        actions={<button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline">+ Invite User</button>}
      >
        <div className="space-y-2">
          {teamMembers.map((member) => (
            <div key={member.email} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-[var(--rtm-blue)]/30 dark:hover:border-[var(--rtm-blue)]/30 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: "var(--rtm-blue)" }}
                >
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email} · {member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {member.twoFa ? (
                  <StatusBadge variant="success" label="2FA On" size="sm" />
                ) : (
                  <StatusBadge variant="warning" label="No 2FA" size="sm" />
                )}
                <StatusBadge variant="success" label="Active" size="sm" />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Integrations */}
      <SectionWrapper title="Integrations" description="Connected services & platforms">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {integrations.map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[var(--rtm-blue)]/40 dark:hover:border-[var(--rtm-blue)]/40 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">{integration.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{integration.name}</p>
                  <p className="text-xs text-slate-500">{integration.description}</p>
                </div>
              </div>
              {integration.status === "connected" ? (
                <StatusBadge variant="success" label="Connected" size="sm" />
              ) : (
                <button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline px-2 py-1 rounded border border-[var(--rtm-blue)]/30 dark:border-[var(--rtm-blue)]/30 hover:bg-[var(--rtm-blue-xlight)]  transition-colors">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Notifications */}
      <SectionWrapper title="Notifications" description="Configure alert delivery">
        <div className="space-y-2">
          {notificationSettings.map((setting) => (
            <div key={setting.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{setting.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{setting.channel}</p>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center transition-colors cursor-pointer flex-shrink-0 ${setting.enabled ? "bg-indigo-600 justify-end" : "bg-slate-200 dark:bg-slate-700 justify-start"}`}>
                <div className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Danger Zone */}
      <SectionWrapper title="Danger Zone" description="Irreversible platform actions">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">Export All Data</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Download a full backup of all platform data in JSON format.</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">
              Export
            </button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
