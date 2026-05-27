"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("paid-advertising")!;

export default function PaidAdPerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Ad Performance</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>ROAS, spend efficiency and lead generation metrics.</p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total Spend"       value="$24,800" trend="up"   trendValue="8%"  iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Avg. ROAS"         value="4.2x"    trend="up"   trendValue="0.3" iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <KpiCard title="Cost Per Lead"     value="$174"    trend="down" trendValue="$12" iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" /></svg>} />
        <KpiCard title="Conversion Rate"   value="6.4%"    trend="up"   trendValue="0.8%"iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>
      <SectionWrapper title="ROAS Trend" description="Chart coming soon">
        <div className="rounded-xl border flex items-center justify-center h-48" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", borderStyle: "dashed" }}>
          <div className="text-center">
            <span className="text-4xl">🎯</span>
            <p className="text-sm mt-2 font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Ad Performance Chart Placeholder</p>
            <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>Connect ad platform data to display ROAS and spend trends.</p>
          </div>
        </div>
      </SectionWrapper>
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute}                              className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href="/paid-advertising/meta-ads/tasks"          className="rtm-btn-primary   text-sm inline-flex items-center gap-1">Meta Tasks →</Link>
        <Link href="/paid-advertising/google-ads/tasks"        className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Google Tasks →</Link>
      </div>
    </div>
  );
}
