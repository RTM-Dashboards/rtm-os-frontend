import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, ProgressBar, MiniSparkline
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction } from "@/components/ui";

interface Report extends Record<string, unknown> {
  client: string;
  type: string;
  period: string;
  dueDate: string;
  assignee: string;
  status: string;
  progress: number;
}

const reports: Report[] = [
  { client: "Apex Roofing Co.", type: "Monthly Performance", period: "May 2025", dueDate: "Jun 5", assignee: "Jordan M.", status: "in-progress", progress: 70 },
  { client: "Harbor Auto Group", type: "PPC + SEO Monthly", period: "May 2025", dueDate: "Jun 5", assignee: "Mike T.", status: "in-progress", progress: 45 },
  { client: "Pacific Dental", type: "SEO Quarterly", period: "Q2 2025", dueDate: "Jun 10", assignee: "Lisa P.", status: "pending", progress: 0 },
  { client: "Summit Landscaping", type: "Monthly Performance", period: "May 2025", dueDate: "Jun 5", assignee: "Jordan M.", status: "completed", progress: 100 },
  { client: "Sunbelt HVAC", type: "Monthly Performance", period: "May 2025", dueDate: "Jun 7", assignee: "Sarah K.", status: "overdue", progress: 20 },
  { client: "Blue Ridge Plumbing", type: "Onboarding Report", period: "May 2025", dueDate: "Jun 3", assignee: "Alex R.", status: "pending", progress: 10 },
];

const columns: Column<Report>[] = [
  { key: "client", header: "Client" },
  { key: "type", header: "Report Type" },
  { key: "period", header: "Period", width: "100px" },
  { key: "assignee", header: "Writer", width: "110px" },
  { key: "dueDate", header: "Due", width: "90px" },
  {
    key: "progress", header: "Progress", width: "140px",
    render: (value) => {
      const v = Number(value);
      return <ProgressBar value={v} height={5} color={v >= 100 ? "bg-emerald-500" : v >= 50 ? "bg-indigo-500" : "bg-amber-500"} showLabel />;
    },
  },
  {
    key: "status", header: "Status", width: "120px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "info" | "pending" | "error"; label: string }> = {
        completed: { variant: "success", label: "Sent" },
        "in-progress": { variant: "info", label: "In Progress" },
        pending: { variant: "pending", label: "Pending" },
        overdue: { variant: "error", label: "Overdue" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

const sparkSent = [42, 45, 48, 44, 50, 52, 49, 54, 56, 51, 58, 61];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "Jordan M.", action: "sent monthly report to", target: "Summit Landscaping", timestamp: "2h ago", type: "report", avatarColor: "#6366f1" },
  { id: "2", actor: "Lisa P.", action: "started Q2 SEO report for", target: "Pacific Dental", timestamp: "4h ago", type: "task", avatarColor: "#ec4899" },
  { id: "3", actor: "System", action: "overdue alert — report not started for", target: "Sunbelt HVAC", timestamp: "8h ago", type: "alert", avatarColor: "#64748b" },
];

const alerts: AlertItem[] = [
  { id: "1", severity: "critical", title: "Sunbelt HVAC report is overdue", description: "May report was due Jun 5. Sarah K. needs to complete immediately.", action: "Assign" },
  { id: "2", severity: "warning", title: "8 reports due in next 5 days", description: "Ensure all writers are on track to avoid SLA breaches.", action: "Review" },
];

const quickActions: QuickAction[] = [
  { label: "New Report", description: "Start from template", icon: "📊", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
  { label: "Assign Writer", description: "Delegate work", icon: "👤", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
  { label: "Send Report", description: "Email to client", icon: "📧", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { label: "Templates", description: "Manage templates", icon: "📋", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
];

export default function ReportingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Marketing</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Reporting</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Client reports, performance analytics & monthly deliverables.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">Templates</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors">+ New Report</button>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Reports Due (30d)" value="28" trend="neutral" accentColor="bg-indigo-100 dark:bg-indigo-900/30"
          icon={<svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <KpiCard title="Sent (MTD)" value="61" trend="up" trendValue="+8 vs last month" accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" /></svg>}
        />
        <KpiCard title="Overdue" value="1" trend="down" trendValue="from 3 last month" accentColor="bg-red-100 dark:bg-red-900/30"
          icon={<svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
        />
        <KpiCard title="Avg. Open Rate" value="74%" trend="up" trendValue="+6%" accentColor="bg-blue-100 dark:bg-blue-900/30"
          icon={<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Reports Sent Trend" description="Monthly reports delivered — last 12 months" className="lg:col-span-2">
          <MiniSparkline data={sparkSent} color="#6366f1" height={80} width={600} />
          <div className="mt-3 flex gap-2 text-xs text-slate-400">
            {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"].map(m => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>
        <SectionWrapper title="Quick Actions">
          <QuickActions actions={quickActions} cols={2} />
        </SectionWrapper>
      </div>

      <SectionWrapper title="Report Queue" description={`${reports.length} reports this cycle`} noPadding
        actions={<button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>}
      >
        <DataTable columns={columns} data={reports} />
      </SectionWrapper>

      <SectionWrapper title="Recent Activity" description="Reporting team actions">
        <ActivityFeed items={activityItems} />
      </SectionWrapper>
    </div>
  );
}
