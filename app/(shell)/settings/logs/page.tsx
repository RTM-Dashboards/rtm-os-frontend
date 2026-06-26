"use client";

import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// System Logs — Platform Activity Log Viewer
// ─────────────────────────────────────────────────────────────────────────────

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  category: string;
  message: string;
  actor?: string;
}

const LOG_ENTRIES: LogEntry[] = [
  { id: "1",  timestamp: "2025-06-25 10:42:18", level: "info",  category: "Auth",          message: "User login successful",                                    actor: "admin@realtimemarketing.com" },
  { id: "2",  timestamp: "2025-06-25 10:38:05", level: "info",  category: "Workflow",      message: "Workflow 'SEO Onboarding v2' instantiated for Client #4821" },
  { id: "3",  timestamp: "2025-06-25 10:35:12", level: "warn",  category: "Integration",   message: "Meta Ads API response time exceeded 500ms",                  actor: "system" },
  { id: "4",  timestamp: "2025-06-25 10:30:00", level: "info",  category: "Report",        message: "Monthly report generated for 14 clients",                   actor: "system" },
  { id: "5",  timestamp: "2025-06-25 10:15:44", level: "info",  category: "Config",        message: "Pricing Rule 'SMB Discount' updated",                       actor: "admin@realtimemarketing.com" },
  { id: "6",  timestamp: "2025-06-25 09:58:22", level: "error", category: "Integration",   message: "Salesforce sync failed: connection timeout",                 actor: "system" },
  { id: "7",  timestamp: "2025-06-25 09:45:11", level: "info",  category: "Auth",          message: "User role updated: Sales Rep → Sales Lead",                 actor: "admin@realtimemarketing.com" },
  { id: "8",  timestamp: "2025-06-25 09:30:00", level: "info",  category: "Notification",  message: "Daily digest sent to 6 users",                              actor: "system" },
  { id: "9",  timestamp: "2025-06-25 09:22:34", level: "warn",  category: "Task",          message: "3 tasks flagged as overdue — escalation rules evaluated",   actor: "system" },
  { id: "10", timestamp: "2025-06-25 09:00:00", level: "info",  category: "Automation",    message: "Automation rule 'Client Health Monitor' executed",           actor: "system" },
];

const LEVEL_STYLES = {
  info:  { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", label: "INFO" },
  warn:  { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "WARN" },
  error: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", label: "ERROR" },
  debug: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", label: "DEBUG" },
};

export default function LogsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <Link href="/settings" className="hover:underline" style={{ color: "var(--rtm-text-muted)" }}>Settings</Link>
        <span>›</span>
        <span style={{ color: "var(--rtm-text-secondary)" }}>Logs</span>
      </nav>

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            System Logs
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Platform activity, configuration changes, and integration events.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="text-sm px-3 py-1.5 rounded-lg border"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-secondary)",
            }}
          >
            <option>All Levels</option>
            <option>Error</option>
            <option>Warning</option>
            <option>Info</option>
          </select>
          <select
            className="text-sm px-3 py-1.5 rounded-lg border"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-secondary)",
            }}
          >
            <option>All Categories</option>
            <option>Auth</option>
            <option>Config</option>
            <option>Integration</option>
            <option>Workflow</option>
          </select>
        </div>
      </div>

      {/* Log table */}
      <section
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
                {["Timestamp", "Level", "Category", "Message", "Actor"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOG_ENTRIES.map((entry) => {
                const s = LEVEL_STYLES[entry.level];
                return (
                  <tr
                    key={entry.id}
                    style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
                  >
                    <td className="px-4 py-3 text-xs font-mono whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>
                      {entry.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                      {entry.category}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-primary)" }}>
                      {entry.message}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>
                      {entry.actor ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
