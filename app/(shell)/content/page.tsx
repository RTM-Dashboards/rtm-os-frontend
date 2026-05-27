import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, ProgressBar, MiniSparkline
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction } from "@/components/ui";

interface ContentItem extends Record<string, unknown> {
  client: string;
  type: string;
  writer: string;
  dueDate: string;
  status: string;
  progress: number;
}

const items: ContentItem[] = [
  { client: "Apex Roofing", type: "Blog Post", writer: "Alex R.", dueDate: "May 22", status: "in-progress", progress: 65 },
  { client: "Harbor Auto", type: "Social Pack (10)", writer: "Lisa P.", dueDate: "May 24", status: "review", progress: 90 },
  { client: "Blue Ridge", type: "Email Campaign", writer: "Alex R.", dueDate: "May 27", status: "pending", progress: 20 },
  { client: "Pacific Dental", type: "Blog Post", writer: "Jordan M.", dueDate: "May 30", status: "pending", progress: 0 },
  { client: "Summit HVAC", type: "Video Script", writer: "Mike T.", dueDate: "Jun 1", status: "in-progress", progress: 45 },
  { client: "Cascade Flooring", type: "Social Pack (5)", writer: "Lisa P.", dueDate: "Jun 3", status: "pending", progress: 10 },
];

const columns: Column<ContentItem>[] = [
  { key: "client", header: "Client" },
  { key: "type", header: "Content Type" },
  { key: "writer", header: "Assigned To", width: "120px" },
  { key: "dueDate", header: "Due", width: "90px" },
  {
    key: "progress", header: "Progress", width: "150px",
    render: (value) => {
      const v = Number(value);
      return <ProgressBar value={v} height={5} color={v >= 80 ? "bg-emerald-500" : v >= 40 ? "bg-indigo-500" : "bg-slate-300"} showLabel />;
    },
  },
  {
    key: "status", header: "Status", width: "130px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "info" | "warning" | "pending" | "success"; label: string }> = {
        "in-progress": { variant: "info", label: "In Progress" },
        review: { variant: "warning", label: "In Review" },
        pending: { variant: "pending", label: "Pending" },
        published: { variant: "success", label: "Published" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

const sparkOutput = [70, 80, 75, 90, 85, 95, 88, 92, 98, 94, 100, 94];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "Alex R.", action: "submitted blog post for", target: "Apex Roofing — May Edition", timestamp: "2h ago", type: "task", avatarColor: "#10b981" },
  { id: "2", actor: "Lisa P.", action: "completed social pack for", target: "Harbor Auto Group", timestamp: "4h ago", type: "task", avatarColor: "#ec4899" },
  { id: "3", actor: "Jordan M.", action: "requested brief for", target: "Pacific Dental — Q2 Blog", timestamp: "6h ago", type: "task", avatarColor: "#6366f1" },
];

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "4 pieces overdue this week", description: "Pacific Dental blog and 3 social packs are past due date.", action: "Review" },
  { id: "2", severity: "info", title: "Content calendar synced for June", description: "28 new briefs queued for June production cycle.", action: "View" },
];

const quickActions: QuickAction[] = [
  { label: "New Brief", description: "Create content brief", icon: "📝", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
  { label: "Assign Writer", description: "Delegate content work", icon: "👤", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { label: "Review Queue", description: "Approve content", icon: "✓", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
  { label: "Publish Content", description: "Go live", icon: "🚀", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
];

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Departments</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Content</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Blog posts, social content, email campaigns & copy production.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">Calendar</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors">+ New Brief</button>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="In Production" value="28" trend="neutral" accentColor="bg-indigo-100 dark:bg-indigo-900/30"
          icon={<svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <KpiCard title="Published (MTD)" value="94" trend="up" trendValue="+12% MoM" accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" /></svg>}
        />
        <KpiCard title="Avg. Turnaround" value="3.2 days" trend="down" trendValue="-0.4d improved" accentColor="bg-amber-100 dark:bg-amber-900/30"
          icon={<svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard title="Overdue Items" value="4" trend="down" trendValue="-2 from last week" accentColor="bg-red-100 dark:bg-red-900/30"
          icon={<svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Output Trend" description="Pieces published per month" className="lg:col-span-2">
          <MiniSparkline data={sparkOutput} color="#6366f1" height={80} width={600} />
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

      <SectionWrapper title="Content Queue" description={`${items.length} active items`} noPadding
        actions={<button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View full queue</button>}
      >
        <DataTable columns={columns} data={items} />
      </SectionWrapper>

      <SectionWrapper title="Recent Activity" description="Team content actions">
        <ActivityFeed items={activityItems} />
      </SectionWrapper>
    </div>
  );
}
