"use client";

import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, ProgressBar
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction } from "@/components/ui";

interface SecurityItem extends Record<string, unknown> {
  system: string;
  category: string;
  lastChecked: string;
  status: string;
  severity: string;
  owner: string;
}

const items: SecurityItem[] = [
  { system: "Main Gateway Server", category: "Infrastructure", lastChecked: "Today", status: "healthy", severity: "none", owner: "DevOps" },
  { system: "Cloudflare WAF", category: "Network Security", lastChecked: "Today", status: "healthy", severity: "none", owner: "DevOps" },
  { system: "Staff Email (Google Workspace)", category: "Access Control", lastChecked: "Yesterday", status: "warning", severity: "medium", owner: "IT Admin" },
  { system: "Client Portal", category: "Application", lastChecked: "Today", status: "healthy", severity: "none", owner: "DevOps" },
  { system: "Database Backups", category: "Data Protection", lastChecked: "2d ago", status: "warning", severity: "low", owner: "DevOps" },
  { system: "SSL Certificates", category: "Security", lastChecked: "Today", status: "healthy", severity: "none", owner: "DevOps" },
  { system: "Staff Devices (MDM)", category: "Endpoint Security", lastChecked: "3d ago", status: "alert", severity: "high", owner: "IT Admin" },
];

const columns: Column<SecurityItem>[] = [
  { key: "system", header: "System" },
  { key: "category", header: "Category", width: "150px" },
  { key: "owner", header: "Owner", width: "100px" },
  { key: "lastChecked", header: "Last Check", width: "110px" },
  {
    key: "severity", header: "Severity", width: "110px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "error" | "warning" | "neutral" | "success"; label: string }> = {
        high: { variant: "error", label: "High" },
        medium: { variant: "warning", label: "Medium" },
        low: { variant: "warning", label: "Low" },
        none: { variant: "success", label: "Clear" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
  {
    key: "status", header: "Status", width: "120px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "warning" | "error"; label: string }> = {
        healthy: { variant: "success", label: "Healthy" },
        warning: { variant: "warning", label: "Warning" },
        alert: { variant: "error", label: "Alert" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "System", action: "detected suspicious login attempt on", target: "Staff Email Portal", timestamp: "1h ago", type: "alert", avatarColor: "#64748b" },
  { id: "2", actor: "DevOps", action: "renewed SSL certificate for", target: "client-portal.rtm.io", timestamp: "3h ago", type: "system", avatarColor: "var(--rtm-blue)" },
  { id: "3", actor: "System", action: "completed automated backup —", target: "All databases", timestamp: "6h ago", type: "system", avatarColor: "#64748b" },
  { id: "4", actor: "IT Admin", action: "enrolled 2 new devices in MDM —", target: "Staff onboarding", timestamp: "1d ago", type: "system", avatarColor: "#10b981" },
];

const alerts: AlertItem[] = [
  { id: "1", severity: "critical", title: "MDM compliance check failed for 3 devices", description: "Staff devices running outdated OS. Security patch required immediately.", action: "Patch" },
  { id: "2", severity: "warning", title: "Email 2FA not enforced for 2 staff accounts", description: "Jordan M. and Sarah K. need to enable 2FA on Google Workspace.", action: "Enforce" },
];

const quickActions: QuickAction[] = [
  { label: "Security Scan", description: "Run full audit", icon: "🔍", color: "bg-[var(--rtm-blue-xlight)] text-[var(--rtm-blue)]" },
  { label: "Rotate Keys", description: "API key rotation", icon: "🔑", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
  { label: "Incident Report", description: "Log security event", icon: "🚨", color: "bg-red-100 dark:bg-red-900/30 text-red-600" },
  { label: "Access Review", description: "Audit permissions", icon: "🛡️", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
];

const securityScore = 87;
const scoreItems = [
  { label: "Patch Compliance", value: 72, color: "bg-amber-500" },
  { label: "Access Control", value: 91, color: "bg-emerald-500" },
  { label: "Data Protection", value: 88, color: "bg-[var(--rtm-blue)]" },
  { label: "Network Security", value: 96, color: "bg-emerald-500" },
  { label: "Endpoint Security", value: 65, color: "bg-red-500" },
];

export default function ItSecurityPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">IT & Security</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Infrastructure health, access control & security monitoring.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[var(--rtm-blue)] hover:bg-[var(--rtm-blue-dark)] text-white text-sm font-semibold transition-colors self-start">+ Run Scan</button>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Security Score" value={`${securityScore}/100`} trend="up" trendValue="+4 pts" accentColor="bg-[var(--rtm-blue-xlight)]"
          icon={<svg className="w-5 h-5 text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
        />
        <KpiCard title="Open Issues" value="3" trend="down" trendValue="from 7 last week" accentColor="bg-amber-100 dark:bg-amber-900/30"
          icon={<svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
        />
        <KpiCard title="Systems Monitored" value="7" trend="neutral" accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>}
        />
        <KpiCard title="Last Incident" value="14 days ago" trend="up" trendValue="improving" accentColor="bg-blue-100 dark:bg-blue-900/30"
          icon={<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Security Scorecard" description="Category breakdown" className="lg:col-span-2">
          <div className="space-y-4">
            {scoreItems.map((item) => (
              <ProgressBar key={item.label} value={item.value} label={item.label} showLabel color={item.color} height={8} />
            ))}
          </div>
        </SectionWrapper>
        <SectionWrapper title="Quick Actions">
          <QuickActions actions={quickActions} cols={2} />
        </SectionWrapper>
      </div>

      <SectionWrapper title="System Status" description={`${items.length} systems tracked`} noPadding>
        <DataTable columns={columns} data={items} />
      </SectionWrapper>

      <SectionWrapper title="Security Activity Log" description="Recent system events">
        <ActivityFeed items={activityItems} />
      </SectionWrapper>
    </div>
  );
}
