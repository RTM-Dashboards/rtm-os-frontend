"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("local-service-ads")!;

const accounts = [
  { name: "Apex Roofing",         rating: "4.9", leads: 42, budget: "$1,200", status: "success"as const, label: "Active"},
  { name: "Pacific Dental",       rating: "4.8", leads: 38, budget: "$900",   status: "success"as const, label: "Active"},
  { name: "Harbor Auto Group",    rating: "4.4", leads: 31, budget: "$800",   status: "warning"as const, label: "Watch"},
  { name: "Summit Landscaping",   rating: "4.7", leads: 29, budget: "$700",   status: "success"as const, label: "Active"},
  { name: "Blue Ridge Plumbing",  rating: "—",   leads: 0,  budget: "$500",   status: "info"as const, label: "Setting Up"},
];

const quickLinks = [
  { label: "LSA Dashboard", href: "/local-service-ads",             icon: "", description: "LSA overview",          accent: "#B45309"},
  { label: "Tasks",         href: "/local-service-ads/tasks",        icon: "", description: "LSA task queue",        accent: "#1B4FD8"},
  { label: "Clients",       href: "/local-service-ads/clients",      icon: "", description: "LSA clients",           accent: "#7C3AED"},
  { label: "Performance",   href: "/local-service-ads/performance",  icon: "", description: "Lead & budget metrics", accent: "#D97706"},
  { label: "Reports",       href: "/local-service-ads/reports",      icon: "", description: "LSA reports",           accent: "#0891B2"},
];

export default function LocalServiceAdsDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Google LSA setup, reviews and budget management."/>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Active LSA Accounts"value="24"trend="up"trendValue="3"iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>} />
        <KpiCard title="Avg. Star Rating"value="4.7"trend="up"trendValue="0.1"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>} />
        <KpiCard title="Monthly Leads"value="184"trend="up"trendValue="22"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />
        <KpiCard title="Budget Utilization"value="91%"trend="up"trendValue="3%"iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
      </div>

      <WorkspaceQuickLinks links={quickLinks} title="Local Service Ads Workspace — Navigation"/>

      <SectionWrapper title="LSA Accounts"description="Active client accounts">
        <div className="space-y-2">
          {accounts.map((a) => (
            <div key={a.name} className="flex items-center justify-between p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
              <div>
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{a.name}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                  {a.rating !== "—"? ` ${a.rating}` : "No rating yet"} · {a.leads} leads MTD · Budget: {a.budget}
                </p>
              </div>
              <StatusBadge variant={a.status} label={a.label} size="sm"/>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/local-service-ads/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Tasks →</Link>
          <Link href="/local-service-ads/performance" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Performance →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
