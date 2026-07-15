"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { useEnabledKpis } from "@/lib/hooks/useEnabledKpis";

const workspace = getWorkspace("local-service-ads")!;

export default function LsaPerformancePage() {
  const { isEnabled } = useEnabledKpis("local-service-ads");
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>LSA Performance</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Lead generation and budget utilization metrics.</p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isEnabled("lsa-monthly-leads") && <KpiCard title="Monthly Leads"value="184"trend="up"trendValue="22"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />}
        {isEnabled("lsa-cost-per-lead") && <KpiCard title="Cost Per Lead"value="$24"trend="down"trendValue="$3"iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />}
        {isEnabled("lsa-budget-utilization") && <KpiCard title="Budget Utilization"value="91%"trend="up"trendValue="3%"iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10"/></svg>} />}
        {isEnabled("lsa-avg-lead-quality") && <KpiCard title="Avg. Lead Quality"value="8.2"trend="up"trendValue="0.4"iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>} />}
      </div>
      <SectionWrapper title="Lead Trend"description="Chart coming soon">
        <div className="rounded-xl border flex items-center justify-center h-48"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", borderStyle: "dashed"}}>
          <div className="text-center"><span className="text-4xl">⭐</span>
            <p className="text-sm mt-2 font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>LSA Performance Chart Placeholder</p>
            <p className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>Connect LSA data to display lead and cost trends.</p>
          </div>
        </div>
      </SectionWrapper>
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href={workspace.tasksRoute}     className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
