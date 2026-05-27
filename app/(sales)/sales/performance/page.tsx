"use client";

import { KpiCard, SectionWrapper, MiniSparkline } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("sales")!;
const sparkData = [8, 11, 9, 14, 12, 18, 15, 20, 17, 22, 19, 24];
const revenueData = [42000, 48000, 45000, 53000, 58000, 62000, 60000, 67000, 72000, 75000, 80000, 87000];

export default function SalesPerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Sales</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Performance</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Sales metrics and trends over time.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Revenue (MTD)"   value="$87k"  trend="up"   trendValue="12%" iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="New Clients"     value="8"     trend="up"   trendValue="2"   iconBg="#EFF6FF" iconColor="#2563EB" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>} />
        <KpiCard title="Close Rate"      value="34%"   trend="up"   trendValue="4%"  iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
        <KpiCard title="Avg Deal Size"   value="$3.2k" trend="up"   trendValue="8%"  iconBg="#F5F3FF" iconColor="#7C3AED" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="Leads Over Time" description="Last 12 months">
          <MiniSparkline data={sparkData} color="#059669" height={80} width={500} />
          <div className="mt-2 flex gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Pipeline Value" description="Last 12 months">
          <MiniSparkline data={revenueData.map(v => v / 1000)} color="#2563EB" height={80} width={500} />
          <div className="mt-2 flex gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>
      </div>

      <div className="flex gap-2">
        <Link href="/sales/leads" className="rtm-btn-primary text-sm inline-flex items-center gap-1">View Leads →</Link>
        <Link href="/sales/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
