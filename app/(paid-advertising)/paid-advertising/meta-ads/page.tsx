"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("paid-advertising")!;

const clients = [
  { name: "Harbor Auto Group",   budget: "$4,200", roas: "3.8x", leads: 28, status: "success" as const, label: "Active" },
  { name: "Pacific Dental",      budget: "$1,400", roas: "4.2x", leads: 19, status: "success" as const, label: "Active" },
  { name: "Metro Dental",        budget: "$1,200", roas: "3.1x", leads: 12, status: "warning" as const, label: "Watch"  },
  { name: "Blue Ridge Plumbing", budget: "$800",   roas: "4.8x", leads: 14, status: "success" as const, label: "Active" },
  { name: "Summit Landscaping",  budget: "$600",   roas: "5.1x", leads: 8,  status: "success" as const, label: "Active" },
];

export default function MetaAdsDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Paid Advertising</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Meta Ads Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Facebook and Instagram advertising management.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total Spend"      value="$12,400" trend="up" trendValue="6%"  iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Avg. ROAS"        value="3.9x"    trend="up" trendValue="0.2" iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <KpiCard title="Leads Generated"  value="78"      trend="up" trendValue="9"   iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <KpiCard title="Active Campaigns" value="9"       trend="up" trendValue="1"   iconBg="#F5F3FF" iconColor="#7C3AED" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>} />
      </div>

      <SectionWrapper title="Meta Ads Clients" description="Active Facebook/Instagram campaigns">
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Budget: {c.budget} · {c.leads} leads</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: "#059669" }}>{c.roas}</span>
                <StatusBadge variant={c.status} label={c.label} size="sm" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/paid-advertising/meta-ads/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Meta Tasks →</Link>
          <Link href="/paid-advertising"                 className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
