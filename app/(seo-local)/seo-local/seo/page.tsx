"use client";

import Link from "next/link";
import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, ProgressBar, MiniSparkline,
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

interface SeoClient extends Record<string, unknown> {
  client: string;
  topKeyword: string;
  position: number;
  domainAuthority: number;
  backlinks: number;
  monthlyImpressions: string;
  status: string;
}

const clients: SeoClient[] = [
  // No data — not yet connected to a real API source
];

const columns: Column<SeoClient>[] = [
  { key: "client",     header: "Client"},
  { key: "topKeyword", header: "Top Keyword"},
  {
    key: "position", header: "Rank", width: "70px",
    render: (value) => {
      const v = Number(value);
      const color = v <= 3 ? "text-emerald-600": v <= 7 ? "text-amber-600": "text-slate-600";
      return <span className={`font-bold text-sm ${color}`}>#{v}</span>;
    },
  },
  { key: "monthlyImpressions", header: "Impressions", width: "120px"},
  {
    key: "domainAuthority", header: "DA", width: "140px",
    render: (value) => <ProgressBar value={Number(value)} max={100} height={5}showLabel />,
  },
  { key: "backlinks", header: "Backlinks", width: "100px"},
  {
    key: "status", header: "Status", width: "130px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success"| "warning"; label: string }> = {
        "on-track":   { variant: "success", label: "On Track"},
        "needs-work": { variant: "warning", label: "Needs Work"},
      };
      const c = map[v] ?? { variant: "warning"as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
    },
  },
];

const sparkImpressions = [8.2, 8.8, 9.1, 8.7, 9.5, 10.2, 9.8, 10.8, 11.2, 10.9, 11.8, 12.4];

const activityItems: ActivityItem[] = [
  // No data — not yet connected to a real API source
];

const alerts: AlertItem[] = [
  // No data — not yet connected to a real API source
];

const quickActions: QuickAction[] = [
  { label: "Run Audit",        description: "Full SEO audit",         icon: "", color: "bg-blue-100 text-blue-600"},
  { label: "Keyword Research", description: "Find opportunities",     icon: "", color: "bg-[var(--rtm-blue-xlight)] text-[var(--rtm-blue)]"},
  { label: "Content Brief",    description: "Generate page brief",    icon: "", color: "bg-purple-100 text-purple-600"},
  { label: "Backlink Report",  description: "Domain authority check", color: "bg-emerald-100 text-emerald-600"},
];

export default function SeoPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>SEO & Local</p>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>SEO Dashboard</h1>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Search rankings, keyword strategy & domain authority.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Link href="/seo-local/seo/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">SEO Tasks →</Link>
          <Link href="/seo-local" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Avg. Keyword Position"value="#4.2"trend="up"trendValue="+1.3 pos"accentColor="bg-blue-100"icon={<svg className="w-5 h-5 text-blue-600"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
        />
        <KpiCard title="Avg. Domain Authority"value="39"trend="up"trendValue="+3 pts"accentColor="bg-purple-100"icon={<svg className="w-5 h-5 text-purple-600"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>}
        />
        <KpiCard title="Monthly Impressions"value="49.7K"trend="up"trendValue="+5.2K MoM"accentColor="bg-emerald-100"icon={<svg className="w-5 h-5 text-emerald-600"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
        />
        <KpiCard title="Clients On Track"value="3 / 5"trend="neutral"accentColor="bg-[var(--rtm-blue-xlight)]"icon={<svg className="w-5 h-5 text-[var(--rtm-blue)]"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Impressions Trend"description="Organic search impressions — last 12 months"className="lg:col-span-2">
          <MiniSparkline data={sparkImpressions}height={80} width={600} />
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

      <SectionWrapper
        title="Client SEO Overview"description={`${clients.length} active clients`}
        noPadding
        actions={<button className="text-xs font-medium text-[var(--rtm-blue)] hover:underline">Export data</button>}
      >
        <DataTable columns={columns} data={clients} />
      </SectionWrapper>

      <SectionWrapper title="Recent Activity"description="SEO team actions">
        <ActivityFeed items={activityItems} />
      </SectionWrapper>
    </div>
  );
}
