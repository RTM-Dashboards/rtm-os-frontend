import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, ProgressBar, MiniSparkline
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction } from "@/components/ui";

interface SeoClient extends Record<string, unknown> {
  client: string;
  topKeyword: string;
  position: number;
  gbpStatus: string;
  yelpStatus: string;
  domainAuthority: number;
  monthlyImpressions: string;
}

const clients: SeoClient[] = [
  { client: "Apex Roofing Co.", topKeyword: "roof repair denver", position: 3, gbpStatus: "optimized", yelpStatus: "active", domainAuthority: 42, monthlyImpressions: "12.4K" },
  { client: "Sunbelt HVAC", topKeyword: "hvac phoenix", position: 7, gbpStatus: "needs-review", yelpStatus: "active", domainAuthority: 35, monthlyImpressions: "8.1K" },
  { client: "Pacific Dental", topKeyword: "dentist san diego", position: 2, gbpStatus: "optimized", yelpStatus: "claimed", domainAuthority: 51, monthlyImpressions: "18.2K" },
  { client: "Summit Landscaping", topKeyword: "landscaping denver", position: 5, gbpStatus: "optimized", yelpStatus: "active", domainAuthority: 38, monthlyImpressions: "6.8K" },
  { client: "Blue Ridge Plumbing", topKeyword: "plumber asheville", position: 4, gbpStatus: "needs-review", yelpStatus: "pending", domainAuthority: 29, monthlyImpressions: "4.2K" },
];

const columns: Column<SeoClient>[] = [
  { key: "client", header: "Client" },
  { key: "topKeyword", header: "Top Keyword" },
  { key: "position", header: "Rank", width: "70px",
    render: (value) => {
      const v = Number(value);
      const color = v <= 3 ? "text-emerald-600 dark:text-emerald-400" : v <= 7 ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-400";
      return <span className={`font-bold text-sm ${color}`}>#{v}</span>;
    },
  },
  { key: "monthlyImpressions", header: "Impressions", width: "120px" },
  { key: "domainAuthority", header: "DA", width: "100px",
    render: (value) => <ProgressBar value={Number(value)} max={100} height={5} color="bg-blue-500" showLabel />,
  },
  { key: "gbpStatus", header: "GBP", width: "130px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "warning"; label: string }> = {
        optimized: { variant: "success", label: "Optimized" },
        "needs-review": { variant: "warning", label: "Needs Review" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
  { key: "yelpStatus", header: "Yelp", width: "110px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "info" | "pending"; label: string }> = {
        active: { variant: "success", label: "Active" },
        claimed: { variant: "info", label: "Claimed" },
        pending: { variant: "pending", label: "Pending" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

const sparkImpressions = [8.2, 8.8, 9.1, 8.7, 9.5, 10.2, 9.8, 10.8, 11.2, 10.9, 11.8, 12.4];
const activityItems: ActivityItem[] = [
  { id: "1", actor: "Lisa P.", action: "completed GBP audit for", target: "Apex Roofing Co.", timestamp: "2h ago", type: "task", avatarColor: "#ec4899" },
  { id: "2", actor: "Jordan M.", action: "updated keyword strategy for", target: "Sunbelt HVAC", timestamp: "4h ago", type: "task", avatarColor: "#6366f1" },
  { id: "3", actor: "System", action: "detected ranking drop for", target: "Blue Ridge Plumbing — plumber asheville", timestamp: "6h ago", type: "alert", avatarColor: "#64748b" },
];

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "2 GBP profiles need review", description: "Sunbelt HVAC and Blue Ridge Plumbing profiles have outdated information.", action: "Fix" },
  { id: "2", severity: "info", title: "4 clients achieved top-3 rankings", description: "Apex Roofing, Pacific Dental, Summit Landscaping, and Blue Ridge all improved this month.", action: "View" },
];

const quickActions: QuickAction[] = [
  { label: "Run Audit", description: "Full SEO audit", icon: "🔍", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
  { label: "Update GBP", description: "Edit Google profile", icon: "📍", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { label: "Keyword Research", description: "Find opportunities", icon: "🔑", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
  { label: "Yelp Manager", description: "Manage listings", icon: "⭐", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
];

export default function SeoPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Marketing</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">SEO / GBP / Yelp</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Search rankings, Google Business Profiles & Yelp listings.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors self-start">+ Run Audit</button>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Avg. Keyword Position" value="#4.2" trend="up" trendValue="+1.3 pos" accentColor="bg-blue-100 dark:bg-blue-900/30"
          icon={<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <KpiCard title="GBP Profiles" value="148" trend="up" trendValue="+6 new" accentColor="bg-indigo-100 dark:bg-indigo-900/30"
          icon={<svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <KpiCard title="Yelp Listings Active" value="102" trend="neutral" accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
        />
        <KpiCard title="Avg. Domain Authority" value="39" trend="up" trendValue="+3 pts" accentColor="bg-purple-100 dark:bg-purple-900/30"
          icon={<svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Impressions Trend" description="Organic search impressions — last 12 months" className="lg:col-span-2">
          <MiniSparkline data={sparkImpressions} color="#3b82f6" height={80} width={600} />
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

      <SectionWrapper title="Client SEO Overview" description={`${clients.length} active clients`} noPadding
        actions={<button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Export data</button>}
      >
        <DataTable columns={columns} data={clients} />
      </SectionWrapper>

      <SectionWrapper title="Recent Activity" description="SEO team actions">
        <ActivityFeed items={activityItems} />
      </SectionWrapper>
    </div>
  );
}
