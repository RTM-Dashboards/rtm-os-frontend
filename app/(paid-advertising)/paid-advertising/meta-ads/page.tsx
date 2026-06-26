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
  { client: "Harbor Auto",       campaign: "Summer Sale — Traffic",   spend: "$3,200", roas: "4.2x", leads: 124, cpl: "$25.80", status: "active"},
  { client: "Apex Roofing",      campaign: "Storm Season Lead Gen",   spend: "$1,800", roas: "6.1x", leads: 89,  cpl: "$20.22", status: "active"},
  { client: "Sunbelt HVAC",      campaign: "Brand Awareness Q2",      spend: "$900",   roas: "2.8x", leads: 31,  cpl: "$29.03", status: "paused"},
  { client: "Metro Dental",      campaign: "New Patient Promo (Meta)",spend: "$1,200", roas: "3.1x", leads: 42,  cpl: "$28.57", status: "active"},
  { client: "Summit Landscaping",campaign: "Spring Services",         spend: "$650",   roas: "3.6x", leads: 22,  cpl: "$29.55", status: "active"},
];

const columns: Column<CampaignRow>[] = [
  { key: "client",   header: "Client"},
  { key: "campaign", header: "Campaign"},
  { key: "spend",    header: "Spend",  width: "100px"},
  {
    key: "roas", header: "ROAS", width: "80px",
    render: (value) => {
      const v = parseFloat(String(value));
      const color = v >= 5 ? "text-emerald-600": v >= 3 ? "text-amber-600": "text-red-500";
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
        active: { variant: "success", label: "Active"},
        paused: { variant: "warning", label: "Paused"},
        ended:  { variant: "neutral", label: "Ended"},
      };
      const c = map[v] ?? { variant: "neutral"as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
    },
  },
];

const sparkSpend = [5.1, 5.8, 5.5, 6.2, 6.1, 7.0, 6.8, 7.8, 7.5, 8.1, 8.5, 8.3];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "Mike T.",   action: "launched new ad set for",       target: "Harbor Auto — Summer Sale",    timestamp: "1h ago",  type: "campaign", avatarColor: "#8b5cf6"},
  { id: "2", actor: "System",    action: "budget alert triggered for",    target: "Sunbelt HVAC — 80% spent",     timestamp: "3h ago",  type: "alert",    avatarColor: "#64748b"},
  { id: "3", actor: "Mike T.",   action: "paused underperforming ads for",target: "Sunbelt HVAC Brand Campaign",  timestamp: "4h ago",  type: "campaign", avatarColor: "#8b5cf6"},
  { id: "4", actor: "Alex R.",   action: "submitted ad copy for review —",target: "Metro Dental New Patient",     timestamp: "6h ago",  type: "task",     avatarColor: "#10b981"},
];

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "Sunbelt HVAC campaign underperforming",   description: "ROAS 2.8x is below 3.0x target. Consider pausing or optimizing.", action: "Review"},
  { id: "2", severity: "info",    title: "Apex Roofing ROAS at all-time high (6.1x)",description: "Storm season campaign exceeding targets by 52%.", action: "Scale"},
];

const quickActions: QuickAction[] = [
  { label: "New Campaign",   description: "Launch paid ads",        icon: "", color: "bg-purple-100 text-purple-600"},
  { label: "Ad Creative",    description: "Submit creative brief",  icon: "", color: "bg-[var(--rtm-blue-xlight)] text-[var(--rtm-blue)]"},
  { label: "Budget Review",  description: "Adjust spend limits",    icon: "", color: "bg-emerald-100 text-emerald-600"},
  { label: "Perf. Report",   description: "Export campaign data",   icon: "", color: "bg-blue-100 text-blue-600"},
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
    name: "Summer Sale — Traffic",
    client: "Harbor Auto",
    type: "Meta Ads",
    status: "info",
    statusLabel: "Active",
    budget: "$3,200",
    progress: 55,
    metric: "4.2x",
    metricLabel: "ROAS",
    startDate: "May 15",
    endDate: "Jun 30",
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

export default function MetaAdsDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>Paid Advertising</p>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Meta Ads Dashboard</h1>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Facebook and Instagram advertising management.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Link href="/paid-advertising/meta-ads/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Meta Tasks →</Link>
          <Link href="/paid-advertising" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total Meta Spend"value="$12,400"trend="up"trendValue="+6% MoM"accentColor="bg-purple-100"icon={<svg className="w-5 h-5 text-purple-600"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KpiCard title="Avg. ROAS"value="3.9x"trend="up"trendValue="+0.2x"accentColor="bg-emerald-100"icon={<svg className="w-5 h-5 text-emerald-600"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
        />
        <KpiCard title="Leads (MTD)"value="308"trend="up"trendValue="+42 vs last"accentColor="bg-[var(--rtm-blue-xlight)]"icon={<svg className="w-5 h-5 text-[var(--rtm-blue)]"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
        />
        <KpiCard title="Active Campaigns"value="9"trend="up"trendValue="+1"accentColor="bg-blue-100"icon={<svg className="w-5 h-5 text-blue-600"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Meta Spend Trend"description="Monthly spend — last 12 months"className="lg:col-span-2">
          <MiniSparkline data={sparkSpend}height={80} width={600} />
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
        title="All Meta Campaigns"description={`${campaigns.length} campaigns`}
        noPadding
        actions={<button className="text-xs font-medium text-[var(--rtm-blue)] hover:underline">View all</button>}
      >
        <DataTable columns={columns} data={campaigns} />
      </SectionWrapper>

      <SectionWrapper title="Recent Activity"description="Meta Ads team actions">
        <ActivityFeed items={activityItems} />
      </SectionWrapper>
    </div>
  );
}
