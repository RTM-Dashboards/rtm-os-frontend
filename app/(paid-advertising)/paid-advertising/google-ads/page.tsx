"use client";

import Link from "next/link";
import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, MiniSparkline, CampaignCard,
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction, Campaign } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("paid-advertising")!;

interface CampaignRow extends Record<string, unknown> {
  client: string;
  campaign: string;
  spend: string;
  roas: string;
  leads: number;
  cpl: string;
  status: string;
}

const campaigns: CampaignRow[] = [
  { client: "Apex Roofing",       campaign: "Storm Season — Search",    spend: "$1,800", roas: "5.1x", leads: 62, cpl: "$29.03", status: "active"},
  { client: "Harbor Auto Group",  campaign: "Brand Search — Auto",      spend: "$2,800", roas: "4.1x", leads: 71, cpl: "$39.44", status: "active"},
  { client: "Pacific Dental",     campaign: "New Patient — Search",     spend: "$1,000", roas: "4.8x", leads: 38, cpl: "$26.32", status: "active"},
  { client: "Summit Landscaping", campaign: "Landscaping Services",     spend: "$800",   roas: "6.2x", leads: 24, cpl: "$33.33", status: "active"},
  { client: "Metro Dental",       campaign: "Dental Implants Search",   spend: "$600",   roas: "3.4x", leads: 14, cpl: "$42.86", status: "warning"},
];

const columns: Column<CampaignRow>[] = [
  { key: "client",   header: "Client"},
  { key: "campaign", header: "Campaign"},
  { key: "spend",    header: "Spend",  width: "100px"},
  {
    key: "roas", header: "ROAS", width: "80px",
    render: (value) => {
      const v = parseFloat(String(value));
      const color = v >= 5 ? "text-emerald-600": v >= 3.5 ? "text-amber-600": "text-red-500";
      return <span className={`font-bold text-sm ${color}`}>{String(value)}</span>;
    },
  },
  { key: "leads", header: "Leads", width: "80px"},
  { key: "cpl",   header: "CPL",   width: "90px"},
  {
    key: "status", header: "Status", width: "110px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success"| "warning"| "neutral"; label: string }> = {
        active:  { variant: "success", label: "Active"},
        warning: { variant: "warning", label: "Watch"},
        paused:  { variant: "neutral", label: "Paused"},
      };
      const c = map[v] ?? { variant: "neutral"as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
    },
  },
];

const sparkSpend = [4.2, 4.8, 4.5, 5.1, 5.4, 5.8, 6.1, 6.5, 6.8, 7.0, 7.2, 7.0];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "Alex R.", action: "launched new keyword group for",  target: "Apex Roofing — Storm Season", timestamp: "2h ago",  type: "campaign", avatarColor: "#10b981"},
  { id: "2", actor: "System",  action: "Quality Score alert for",         target: "Metro Dental — Implants",     timestamp: "4h ago",  type: "alert",    avatarColor: "#64748b"},
  { id: "3", actor: "Mike T.", action: "added negative keywords for",     target: "Harbor Auto Group",            timestamp: "6h ago",  type: "task",     avatarColor: "#8b5cf6"},
  { id: "4", actor: "Alex R.", action: "submitted new ad copy for",       target: "Summit Landscaping",           timestamp: "8h ago",  type: "task",     avatarColor: "#10b981"},
];

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "Metro Dental Quality Score low", description: "Average QS below 5 on Dental Implants campaign. Review ad copy and landing pages.", action: "Review"},
  { id: "2", severity: "info",    title: "Summit Landscaping ROAS at 6.2x", description: "Top-performing Google Ads client. Consider scaling budget.", action: "Scale"},
];

const quickActions: QuickAction[] = [
  { label: "New Campaign",     description: "Launch Google Ads",      icon: "", color: "bg-blue-100 text-blue-600"},
  { label: "Keyword Research", description: "Find search terms",      icon: "", color: "bg-[var(--rtm-blue-xlight)] text-[var(--rtm-blue)]"},
  { label: "Budget Review",    description: "Adjust spend limits",    icon: "", color: "bg-emerald-100 text-emerald-600"},
  { label: "Perf. Report",     description: "Export campaign data",   icon: "", color: "bg-purple-100 text-purple-600"},
];

const featuredCampaigns: Campaign[] = [
  {
    name: "Storm Season — Search",
    client: "Apex Roofing",
    type: "Google Ads",
    status: "success",
    statusLabel: "High Performer",
    budget: "$1,800",
    progress: 72,
    metric: "5.1x",
    metricLabel: "ROAS",
    startDate: "May 1",
    endDate: "Jun 30",
  },
  {
    name: "New Patient — Search",
    client: "Pacific Dental",
    type: "Google Ads",
    status: "info",
    statusLabel: "Active",
    budget: "$1,000",
    progress: 58,
    metric: "4.8x",
    metricLabel: "ROAS",
    startDate: "May 10",
    endDate: "Jun 30",
  },
  {
    name: "Dental Implants Search",
    client: "Metro Dental",
    type: "Google Ads",
    status: "warning",
    statusLabel: "Needs Attention",
    budget: "$600",
    progress: 65,
    metric: "3.4x",
    metricLabel: "ROAS",
    startDate: "Apr 15",
    endDate: "Jun 30",
  },
];

export default function GoogleAdsDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>Paid Advertising</p>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Google Ads Dashboard</h1>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Google Search and Display campaign management.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Link href="/paid-advertising/google-ads/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Google Tasks →</Link>
          <Link href="/paid-advertising" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total Google Spend"value="$7,000"trend="up"trendValue="+5% MoM"accentColor="bg-blue-100"icon={<svg className="w-5 h-5 text-blue-600"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KpiCard title="Avg. ROAS"value="4.5x"trend="up"trendValue="+0.4x"accentColor="bg-emerald-100"icon={<svg className="w-5 h-5 text-emerald-600"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
        />
        <KpiCard title="Leads (MTD)"value="209"trend="up"trendValue="+28 vs last"accentColor="bg-[var(--rtm-blue-xlight)]"icon={<svg className="w-5 h-5 text-[var(--rtm-blue)]"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
        />
        <KpiCard title="Active Campaigns"value="9"trend="up"trendValue="+1"accentColor="bg-purple-100"icon={<svg className="w-5 h-5 text-purple-600"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Google Spend Trend"description="Monthly spend — last 12 months"className="lg:col-span-2">
          <MiniSparkline data={sparkSpend} color="#3b82f6"height={80} width={600} />
          <div className="mt-3 flex gap-2 text-xs text-slate-400">
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>
        <SectionWrapper title="Quick Actions">
          <QuickActions actions={quickActions} cols={2} />
        </SectionWrapper>
      </div>

      <SectionWrapper title="Campaign Spotlight"description="Top campaigns this month">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCampaigns.map((c) => (
            <CampaignCard key={c.name} campaign={c} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        title="All Google Campaigns"description={`${campaigns.length} campaigns`}
        noPadding
        actions={<button className="text-xs font-medium text-[var(--rtm-blue)] hover:underline">View all</button>}
      >
        <DataTable columns={columns} data={campaigns} />
      </SectionWrapper>

      <SectionWrapper title="Recent Activity"description="Google Ads team actions">
        <ActivityFeed items={activityItems} />
      </SectionWrapper>
    </div>
  );
}
