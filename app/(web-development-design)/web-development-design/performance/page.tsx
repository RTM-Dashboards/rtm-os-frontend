"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("web-development-design")!;

export default function WebDevDesignPerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Performance</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Project delivery metrics for Web Development & Design.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Projects Completed" value="7"    trend="up"   trendValue="2"   iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Avg. Turnaround"    value="12d"  trend="down" trendValue="2d"  iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="On-Time Rate"       value="89%"  trend="up"   trendValue="3%"  iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
        <KpiCard title="Avg. Revisions"     value="2.1x" trend="down" trendValue="0.3" iconBg="#F5F3FF" iconColor="#7C3AED" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
      </div>

      <SectionWrapper title="Delivery Trend" description="Chart coming soon">
        <div className="rounded-xl border flex items-center justify-center h-48" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", borderStyle: "dashed" }}>
          <div className="text-center">
            <span className="text-4xl">🖥️</span>
            <p className="text-sm mt-2 font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Performance Chart Placeholder</p>
            <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>Connect project data to display turnaround and delivery trends.</p>
          </div>
        </div>
      </SectionWrapper>

      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute}                                         className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        <Link href="/web-development-design/web-development/tasks"         className="rtm-btn-primary  text-sm inline-flex items-center gap-1">WD Tasks →</Link>
        <Link href="/web-development-design/design/tasks"                  className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Design Tasks →</Link>
      </div>
    </div>
  );
}
