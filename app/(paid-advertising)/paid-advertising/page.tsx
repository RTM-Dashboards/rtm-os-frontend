"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("paid-advertising")!;

const campaigns = [
  { client: "Harbor Auto Group",  channel: "Meta",         spend: "$4,200", roas: "3.8x", status: "success"as const, label: "Active"},
  { client: "Apex Roofing",       channel: "Google",       spend: "$1,800", roas: "5.1x", status: "success"as const, label: "Active"},
  { client: "Pacific Dental",     channel: "Google+Meta",  spend: "$2,400", roas: "4.4x", status: "success"as const, label: "Active"},
  { client: "Summit Landscaping", channel: "Google",       spend: "$800",   roas: "6.2x", status: "success"as const, label: "Active"},
  { client: "Metro Dental",       channel: "Meta",         spend: "$1,200", roas: "3.1x", status: "warning"as const, label: "Watch"},
];

const quickLinks = [
  { label: "Ad Overview",       href: "/paid-advertising",                      icon: "", description: "All campaigns",          accent: "#DC2626"},
  { label: "Meta Dashboard",    href: "/paid-advertising/meta-ads",             icon: "", description: "Facebook & Instagram",    accent: "#1B4FD8"},
  { label: "Meta Tasks",        href: "/paid-advertising/meta-ads/tasks",       icon: "", description: "Meta task queue",         accent: "#1B4FD8"},
  { label: "Google Dashboard",  href: "/paid-advertising/google-ads",           icon: "", description: "Google Ads management",   accent: "#059669"},
  { label: "Google Tasks",      href: "/paid-advertising/google-ads/tasks",     icon: "", description: "Google task queue",       accent: "#059669"},
  { label: "Clients",           href: "/paid-advertising/clients",              icon: "", description: "Ad clients",              accent: "#7C3AED"},
  { label: "Performance",       href: "/paid-advertising/performance",          icon: "", description: "ROAS & spend metrics",    accent: "#D97706"},
];

export default function PaidAdvertisingDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Meta Ads, Google Ads and paid campaign management."/>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total Ad Spend"value="$24,800"trend="up"trendValue="8%"iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <KpiCard title="Avg. ROAS"value="4.2x"trend="up"trendValue="0.3"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>} />
        <KpiCard title="Active Campaigns"value="18"trend="up"trendValue="2"iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>} />
        <KpiCard title="Leads Generated"value="142"trend="up"trendValue="18"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />
      </div>

      <WorkspaceQuickLinks links={quickLinks} title="Paid Advertising Workspace — Navigation"/>

      <SectionWrapper title="Active Campaigns"description="Client campaign performance">
        <div className="space-y-2">
          {campaigns.map((c) => (
            <div key={c.client} className="flex items-center justify-between p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
              <div>
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.client}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{c.channel} · Spend: {c.spend}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold"style={{ color: "#059669"}}>{c.roas} ROAS</span>
                <StatusBadge variant={c.status} label={c.label} size="sm"/>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/paid-advertising/meta-ads/tasks"className="rtm-btn-primary text-sm inline-flex items-center gap-1">Meta Tasks →</Link>
          <Link href="/paid-advertising/google-ads/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Google Tasks →</Link>
          <Link href="/paid-advertising/performance"className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Performance →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
