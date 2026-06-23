"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

export default function SeoLocalPerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Local Performance</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Local visibility, map pack presence and review metrics.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Avg. Visibility"value="72%"trend="up"trendValue="4%"iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>} />
        <KpiCard title="Map Pack Appearances"value="284"trend="up"trendValue="31"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />
        <KpiCard title="Review Velocity"value="67/mo"trend="up"trendValue="12"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>} />
        <KpiCard title="GBP Views (MTD)"value="12.4k"trend="up"trendValue="8%"iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>} />
      </div>

      <SectionWrapper title="Visibility Trends"description="Chart coming soon">
        <div className="rounded-xl border flex items-center justify-center h-48"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", borderStyle: "dashed"}}>
          <div className="text-center">
            
            <p className="text-sm mt-2 font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>Local Performance Chart Placeholder</p>
            <p className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>Connect GBP and ranking data to display visibility trends.</p>
          </div>
        </div>
      </SectionWrapper>

      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        <Link href="/seo-local/health" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Client Health →</Link>
        <Link href={workspace.tasksRoute}     className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
