"use client";

import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, MiniSparkline, CampaignCard
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction, Campaign } from "@/components/ui";

interface CampaignRow extends Record<string, unknown> {
  client: string;
  campaign: string;
  platform: string;
  spend: string;
  roas: string;
  leads: number;
  cpl: string;
  status: string;
}

const campaigns: CampaignRow[] = [
  { client: "Harbor Auto", campaign: "Summer Sale — Traffic", platform: "Meta", spend: "$3,200", roas: "4.2x", leads: 124, cpl: "$25.80", status: "active" },
  { client: "Apex Roofing", campaign: "Storm Season Lead Gen", platform: "Meta + Google", spend: "$1,800", roas: "6.1x", leads: 89, cpl: "$20.22", status: "active" },
  { client: "Sunbelt HVAC", campaign: "Brand Awareness Q2", platform: "Meta", spend: "$900", roas: "2.8x", leads: 31, cpl: "$29.03", status: "paused" },
  { client: "Pacific Dental", campaign: "New Patient Promo", platform: "Google Ads", spend: "$2,100", roas: "5.4x", leads: 67, cpl: "$31.34", status: "active" },
  { client: "Summit Landscaping", campaign: "Spring Services", platform: "Meta", spend: "$650", roas: "3.6x", leads: 22, cpl: "$29.55", status: "active" },
];

const columns: Column<CampaignRow>[] = [
  { key: "client", header: "Client" },
  { key: "campaign", header: "Campaign" },
  { key: "platform", header: "Platform", width: "130px" },
  { key: "spend", header: "Spend", width: "100px" },
  { key: "roas", header: "ROAS", width: "80px",
    render: (value) => {
      const v = parseFloat(String(value));
      const color = v >= 5 ? "text-emerald-600 dark:text-emerald-400" : v >= 3 ? "text-amber-600 dark:text-amber-400" : "text-red-500";
      return <span className={`font-bold text-sm ${color}`}>{String(value)}</span>;
    },
  },
  { key: "leads", header: "Leads", width: "80px" },
  { key: "cpl", header: "CPL", width: "90px" },
  {
    key: "status", header: "Status", width: "110px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "warning" | "neutral"; label: string }> = {
        active: { variant: "success", label: "Active" },
        paused: { variant: "warning", label: "Paused" },
        ended: { variant: "neutral", label: "Ended" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

const sparkSpend = [7.2, 8.1, 7.8, 9.2, 8.9, 10.1, 9.7, 11.2, 10.8, 11.5, 12.1, 11.9];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "Mike T.", action: "launched new ad set for", target: "Harbor Auto — Summer Sale", timestamp: "1h ago", type: "campaign", avatarColor: "#8b5cf6" },
  { id: "2", actor: "System", action: "budget alert triggered for", target: "Sunbelt HVAC — 80% spent", timestamp: "3h ago", type: "alert", avatarColor: "#64748b" },
  { id: "3", actor: "Mike T.", action: "paused underperforming ads for", target: "Sunbelt HVAC Brand Campaign", timestamp: "4h ago", type: "campaign", avatarColor: "#8b5cf6" },
  { id: "4", actor: "Alex R.", action: "submitted ad copy for review —", target: "Pacific Dental New Patient", timestamp: "6h ago", type: "task", avatarColor: "#10b981" },
];

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "Sunbelt HVAC campaign underperforming", description: "ROAS 2.8x is below 3.0x target. Consider pausing or optimizing.", action: "Review" },
  { id: "2", severity: "info", title: "Apex Roofing ROAS at all-time high (6.1x)", description: "Storm season campaign exceeding targets by 52%.", action: "Scale" },
];

const quickActions: QuickAction[] = [
  { label: "New Campaign", description: "Launch paid ads", icon: "🎯", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
  { label: "Ad Creative", description: "Submit creative brief", icon: "🖼️", color: "bg-[var(--rtm-blue-xlight)] text-[var(--rtm-blue)]" },
  { label: "Budget Review", description: "Adjust spend limits", icon: "💰", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { label: "Performance Report", description: "Export campaign data", icon: "📊", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
];

const featuredCampaigns: Campaign[] = [
  {
    name: "Storm Season Lead Gen",
    client: "Apex Roofing",
    type: "Meta Ads",
    status: "success",
    statusLabel: "High Performer",
    budget: "$1,800",
    progress: 78,
    metric: "6.1x",
    metricLabel: "ROAS",
    startDate: "May 1",
    endDate: "Jun 30",
  },
  {
    name: "New Patient Promo",
    client: "Pacific Dental",
    type: "Google Ads",
    status: "info",
    statusLabel: "Active",
    budget: "$2,100",
    progress: 55,
    metric: "5.4x",
    metricLabel: "ROAS",
    startDate: "May 10",
    endDate: "Jun 15",
  },
  {
    name: "Brand Awareness Q2",
    client: "Sunbelt HVAC",
    type: "Meta Ads",
    status: "warning",
    statusLabel: "Needs Attention",
    budget: "$900",
    progress: 80,
    metric: "2.8x",
    metricLabel: "ROAS",
    startDate: "Apr 1",
    endDate: "Jun 30",
  },
];

export default function MetaAdsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Marketing</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Meta Ads & PPC</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Paid social, Google Ads & performance marketing campaigns.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">Export</button>
          <button className="px-4 py-2 rounded-lg bg-[var(--rtm-blue)] hover:bg-[var(--rtm-blue-dark)] text-white text-sm font-semibold transition-colors">+ New Campaign</button>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total Ad Spend" value="$8,650" trend="up" trendValue="+12% MoM" accentColor="bg-purple-100 dark:bg-purple-900/30"
          icon={<svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard title="Avg. ROAS" value="4.5x" trend="up" trendValue="+0.3x" accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <KpiCard title="Total Leads (MTD)" value="333" trend="up" trendValue="+42 vs last month" accentColor="bg-[var(--rtm-blue-xlight)]"
          icon={<svg className="w-5 h-5 text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <KpiCard title="Avg. CPL" value="$26.75" trend="down" trendValue="-$2.10 improved" accentColor="bg-blue-100 dark:bg-blue-900/30"
          icon={<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Ad Spend Trend" description="Monthly spend — last 12 months" className="lg:col-span-2">
          <MiniSparkline data={sparkSpend} color="#8b5cf6" height={80} width={600} />
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

      {/* Campaign spotlight */}
      <SectionWrapper title="Campaign Spotlight" description="Top campaigns this month">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCampaigns.map((c) => (
            <CampaignCard key={c.name} campaign={c} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper title="All Active Campaigns" description={`${campaigns.length} campaigns running`} noPadding
        actions={<button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline">View all</button>}
      >
        <DataTable columns={columns} data={campaigns} />
      </SectionWrapper>

      <SectionWrapper title="Recent Activity" description="Paid media team actions">
        <ActivityFeed items={activityItems} />
      </SectionWrapper>
    </div>
  );
}
