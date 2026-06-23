"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("reporting")!;

export default function ReportingPerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Reporting Performance</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Report delivery metrics and team output.</p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="On-Time Rate"value="96%"trend="up"trendValue="1%"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <KpiCard title="Avg. Turnaround"value="3.4d"trend="down"trendValue="0.3"iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <KpiCard title="Reports/Month"value="47"trend="up"trendValue="6"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>} />
        <KpiCard title="Client Approval"value="98%"trend="up"trendValue="1%"iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>} />
      </div>
      <SectionWrapper title="Output Trend"description="Chart coming soon">
        <div className="rounded-xl border flex items-center justify-center h-48"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", borderStyle: "dashed"}}>
          <div className="text-center">
            
            <p className="text-sm mt-2 font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>Performance Chart Placeholder</p>
            <p className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>Connect report data to display delivery trends.</p>
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
