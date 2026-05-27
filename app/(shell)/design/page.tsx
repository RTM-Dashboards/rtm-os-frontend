"use client";

import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, ProgressBar
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction } from "@/components/ui";

interface DesignRequest extends Record<string, unknown> {
  client: string;
  type: string;
  designer: string;
  priority: string;
  dueDate: string;
  status: string;
  progress: number;
}

const requests: DesignRequest[] = [
  { client: "Apex Roofing", type: "Brand Refresh (Full)", designer: "Chris D.", priority: "high", dueDate: "May 24", status: "in-progress", progress: 55 },
  { client: "Harbor Auto", type: "Social Templates (20)", designer: "Mia S.", priority: "medium", dueDate: "May 26", status: "review", progress: 85 },
  { client: "Blue Ridge", type: "Ad Creatives (5)", designer: "Chris D.", priority: "high", dueDate: "May 27", status: "queued", progress: 0 },
  { client: "Pacific Dental", type: "Brochure PDF", designer: "Mia S.", priority: "low", dueDate: "Jun 2", status: "in-progress", progress: 30 },
  { client: "Summit HVAC", type: "Logo Update", designer: "Chris D.", priority: "medium", dueDate: "Jun 5", status: "queued", progress: 0 },
];

const columns: Column<DesignRequest>[] = [
  { key: "client", header: "Client" },
  { key: "type", header: "Request Type" },
  { key: "designer", header: "Designer", width: "110px" },
  {
    key: "priority", header: "Priority", width: "100px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "error" | "warning" | "neutral"; label: string }> = {
        high: { variant: "error", label: "High" },
        medium: { variant: "warning", label: "Medium" },
        low: { variant: "neutral", label: "Low" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
  { key: "dueDate", header: "Due", width: "90px" },
  {
    key: "progress", header: "Progress", width: "140px",
    render: (value) => {
      const v = Number(value);
      return <ProgressBar value={v} height={5} color={v >= 80 ? "bg-emerald-500" : "bg-purple-500"} showLabel />;
    },
  },
  {
    key: "status", header: "Status", width: "120px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "info" | "warning" | "neutral" | "success"; label: string }> = {
        "in-progress": { variant: "info", label: "In Progress" },
        review: { variant: "warning", label: "In Review" },
        queued: { variant: "neutral", label: "Queued" },
        delivered: { variant: "success", label: "Delivered" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "Mia S.", action: "submitted social templates for review —", target: "Harbor Auto", timestamp: "1h ago", type: "task", avatarColor: "#ec4899" },
  { id: "2", actor: "Chris D.", action: "started brand refresh for", target: "Apex Roofing", timestamp: "3h ago", type: "task", avatarColor: "#8b5cf6" },
  { id: "3", actor: "Jordan M.", action: "approved ad creatives for", target: "Blue Ridge Plumbing", timestamp: "1d ago", type: "task", avatarColor: "var(--rtm-blue)" },
];

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "3 high-priority requests overdue", description: "Apex Roofing brand refresh and Blue Ridge ad creatives need immediate attention.", action: "Assign" },
];

const quickActions: QuickAction[] = [
  { label: "New Request", description: "Submit design brief", icon: "🎨", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
  { label: "Assign Designer", description: "Delegate work", icon: "👤", color: "bg-[var(--rtm-blue-xlight)] text-[var(--rtm-blue)]" },
  { label: "Review Assets", description: "Approve deliverables", icon: "✓", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { label: "Asset Library", description: "Browse brand files", icon: "📁", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
];

export default function DesignPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Departments</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Design</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Brand assets, creative deliverables & design requests.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[var(--rtm-blue)] hover:bg-[var(--rtm-blue-dark)] text-white text-sm font-semibold transition-colors self-start">+ Design Request</button>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Open Requests" value="17" trend="neutral" accentColor="bg-purple-100 dark:bg-purple-900/30"
          icon={<svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 012 2v1a4 4 0 01-4 4H7zm0 0V9" /></svg>}
        />
        <KpiCard title="Delivered This Week" value="11" trend="up" trendValue="+3 vs last" accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" /></svg>}
        />
        <KpiCard title="Avg. Turnaround" value="2.1 days" trend="up" trendValue="-0.2d improved" accentColor="bg-amber-100 dark:bg-amber-900/30"
          icon={<svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard title="In Review" value="3" trend="neutral" accentColor="bg-blue-100 dark:bg-blue-900/30"
          icon={<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
        />
      </div>

      <SectionWrapper title="Active Requests" description={`${requests.length} open design requests`} noPadding
        actions={<button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline">View all</button>}
      >
        <DataTable columns={columns} data={requests} />
      </SectionWrapper>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="Recent Activity">
          <ActivityFeed items={activityItems} />
        </SectionWrapper>
        <SectionWrapper title="Quick Actions">
          <QuickActions actions={quickActions} cols={2} />
        </SectionWrapper>
      </div>
    </div>
  );
}
