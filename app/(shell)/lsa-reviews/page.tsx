import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, MiniSparkline
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction } from "@/components/ui";

interface LsaClient extends Record<string, unknown> {
  client: string;
  lsaStatus: string;
  weeklyLeads: number;
  avgRating: number;
  reviewCount: number;
  pendingReviews: number;
  budget: string;
}

const clients: LsaClient[] = [
  { client: "Apex Roofing Co.", lsaStatus: "active", weeklyLeads: 18, avgRating: 4.9, reviewCount: 142, pendingReviews: 2, budget: "$500/wk" },
  { client: "Pacific Dental", lsaStatus: "active", weeklyLeads: 12, avgRating: 4.8, reviewCount: 89, pendingReviews: 0, budget: "$300/wk" },
  { client: "Sunbelt HVAC", lsaStatus: "paused", weeklyLeads: 0, avgRating: 4.5, reviewCount: 67, pendingReviews: 1, budget: "$400/wk" },
  { client: "Harbor Auto Group", lsaStatus: "active", weeklyLeads: 9, avgRating: 4.7, reviewCount: 113, pendingReviews: 3, budget: "$250/wk" },
  { client: "Blue Ridge Plumbing", lsaStatus: "setup", weeklyLeads: 0, avgRating: 0, reviewCount: 0, pendingReviews: 0, budget: "$200/wk" },
];

const columns: Column<LsaClient>[] = [
  { key: "client", header: "Client" },
  {
    key: "lsaStatus", header: "LSA Status", width: "120px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "warning" | "neutral" | "info"; label: string }> = {
        active: { variant: "success", label: "Active" },
        paused: { variant: "warning", label: "Paused" },
        setup: { variant: "info", label: "In Setup" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
  { key: "weeklyLeads", header: "Leads/Wk", width: "100px" },
  { key: "avgRating", header: "Rating", width: "80px",
    render: (value) => {
      const v = Number(value);
      if (!v) return <span className="text-slate-400 text-sm">—</span>;
      const color = v >= 4.8 ? "text-emerald-600 dark:text-emerald-400" : v >= 4.5 ? "text-amber-600 dark:text-amber-400" : "text-red-500";
      return <span className={`font-bold text-sm ${color}`}>⭐ {v.toFixed(1)}</span>;
    },
  },
  { key: "reviewCount", header: "Reviews", width: "90px" },
  { key: "pendingReviews", header: "Pending", width: "90px",
    render: (value) => {
      const v = Number(value);
      if (!v) return <span className="text-slate-400 text-sm">0</span>;
      return <span className="font-semibold text-amber-600 dark:text-amber-400 text-sm">{v}</span>;
    },
  },
  { key: "budget", header: "Budget", width: "100px" },
];

const sparkLeads = [28, 32, 30, 35, 38, 36, 40, 42, 39, 44, 41, 45];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "System", action: "received 3 new LSA leads for", target: "Apex Roofing Co.", timestamp: "1h ago", type: "client", avatarColor: "#64748b" },
  { id: "2", actor: "Jordan M.", action: "responded to negative review for", target: "Harbor Auto Group", timestamp: "3h ago", type: "task", avatarColor: "#6366f1" },
  { id: "3", actor: "Sarah K.", action: "paused LSA campaign for", target: "Sunbelt HVAC — Budget exhausted", timestamp: "5h ago", type: "alert", avatarColor: "#f59e0b" },
  { id: "4", actor: "Alex R.", action: "requested review from new customer —", target: "Blue Ridge Plumbing", timestamp: "7h ago", type: "task", avatarColor: "#10b981" },
];

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "3 review responses overdue for Harbor Auto", description: "Unresponded reviews older than 48 hours can hurt LSA quality score.", action: "Respond" },
  { id: "2", severity: "info", title: "Blue Ridge Plumbing LSA setup in progress", description: "Estimated activation: 5-7 business days.", action: "View" },
];

const quickActions: QuickAction[] = [
  { label: "Request Review", description: "Send to client", icon: "⭐", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
  { label: "Respond to Review", description: "Draft response", icon: "💬", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
  { label: "Adjust Budget", description: "Change weekly spend", icon: "💰", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { label: "LSA Report", description: "Performance summary", icon: "📊", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
];

export default function LsaReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Marketing</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Local Service Ads</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">LSA management, lead tracking & review response.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors self-start">+ Setup LSA</button>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="LSA Leads (MTD)" value="45" trend="up" trendValue="+12% MoM" accentColor="bg-indigo-100 dark:bg-indigo-900/30"
          icon={<svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <KpiCard title="Active LSA Clients" value="3" trend="neutral" accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard title="Avg. Review Rating" value="4.7★" trend="up" trendValue="+0.1 pts" accentColor="bg-amber-100 dark:bg-amber-900/30"
          icon={<svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
        />
        <KpiCard title="Pending Responses" value="6" trend="down" trendValue="-3 from yesterday" accentColor="bg-red-100 dark:bg-red-900/30"
          icon={<svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="LSA Lead Trend" description="Weekly leads — last 12 months" className="lg:col-span-2">
          <MiniSparkline data={sparkLeads} color="#f59e0b" height={80} width={600} />
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

      <SectionWrapper title="LSA Client Overview" description={`${clients.length} clients managed`} noPadding>
        <DataTable columns={columns} data={clients} />
      </SectionWrapper>

      <SectionWrapper title="Recent Activity" description="LSA & review team actions">
        <ActivityFeed items={activityItems} />
      </SectionWrapper>
    </div>
  );
}
