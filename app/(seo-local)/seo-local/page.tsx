"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge, ActivityFeed } from "@/components/ui";
import type { ActivityItem } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

const activity: ActivityItem[] = [
  { id: "1", actor: "Lisa P.",   action: "completed on-page audit for", target: "Apex Roofing",        timestamp: "1h ago",  type: "task",   avatarColor: "#2563EB" },
  { id: "2", actor: "Jordan M.", action: "updated GBP photos for",       target: "Pacific Dental",      timestamp: "2h ago",  type: "task",   avatarColor: "#1B4FD8" },
  { id: "3", actor: "Sarah K.",  action: "responded to Yelp review for", target: "Harbor Auto",         timestamp: "3h ago",  type: "report", avatarColor: "#D97706" },
  { id: "4", actor: "Alex R.",   action: "submitted keyword research for","target": "Summit Landscaping",timestamp: "4h ago",  type: "task",   avatarColor: "#059669" },
];

const clientHealth = [
  { name: "Apex Roofing",        seo: 92, gbp: 88, yelp: 84, overall: "success" as const, label: "Strong"   },
  { name: "Pacific Dental",      seo: 88, gbp: 95, yelp: 90, overall: "success" as const, label: "Strong"   },
  { name: "Harbor Auto Group",   seo: 71, gbp: 76, yelp: 65, overall: "warning" as const, label: "Watch"    },
  { name: "Summit Landscaping",  seo: 84, gbp: 80, yelp: 72, overall: "success" as const, label: "Good"     },
  { name: "Metro Dental",        seo: 63, gbp: 58, yelp: 55, overall: "error"   as const, label: "Needs Work"},
  { name: "Blue Ridge Plumbing", seo: 45, gbp: 40, yelp: 0,  overall: "info"    as const, label: "New"      },
];

const quickLinks = [
  { label: "SEO & Local Overview", href: "/seo-local",              icon: "📊", description: "Full overview",          accent: "#2563EB" },
  { label: "SEO Dashboard",        href: "/seo-local/seo",          icon: "🔍", description: "Rankings & audits",      accent: "#1B4FD8" },
  { label: "SEO Tasks",            href: "/seo-local/seo/tasks",    icon: "✅", description: "SEO task queue",         accent: "#2563EB" },
  { label: "GBP Dashboard",        href: "/seo-local/gbp",          icon: "📍", description: "Google Business Profile",accent: "#059669" },
  { label: "GBP Tasks",            href: "/seo-local/gbp/tasks",    icon: "✅", description: "GBP task queue",         accent: "#059669" },
  { label: "Yelp Dashboard",       href: "/seo-local/yelp",         icon: "⭐", description: "Yelp management",        accent: "#D97706" },
  { label: "Yelp Tasks",           href: "/seo-local/yelp/tasks",   icon: "✅", description: "Yelp task queue",        accent: "#D97706" },
  { label: "Client Health",        href: "/seo-local/health",       icon: "💚", description: "Health scores",          accent: "#059669" },
  { label: "Local Performance",    href: "/seo-local/performance",  icon: "📈", description: "Visibility metrics",     accent: "#7C3AED" },
];

export default function SeoLocalDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Search rankings, Google Business Profile, Yelp and local visibility." />

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Clients Managed"   value="42"   trend="up"   trendValue="3"    iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)"  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <KpiCard title="Avg. SEO Score"    value="81"   trend="up"   trendValue="2.4"  iconBg="#EFF6FF"              iconColor="#2563EB"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
        <KpiCard title="GBP Profiles"      value="38"   trend="up"   trendValue="4"    iconBg="#ECFDF5"              iconColor="#059669"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <KpiCard title="Open SEO Tasks"    value="28"   trend="down" trendValue="6"    iconBg="#FFFBEB"              iconColor="#D97706"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
      </div>

      {/* ── Quick Links ── */}
      <WorkspaceQuickLinks links={quickLinks} title="SEO & Local Workspace — Navigation" />

      {/* ── Client health + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Client Health" description="SEO · GBP · Yelp scores" className="lg:col-span-2">
          <div className="space-y-2">
            {clientHealth.map((c) => (
              <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    SEO: {c.seo} · GBP: {c.gbp} · Yelp: {c.yelp === 0 ? "—" : c.yelp}
                  </p>
                </div>
                <StatusBadge variant={c.overall} label={c.label} size="sm" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Link href="/seo-local/seo/tasks"  className="rtm-btn-primary text-sm inline-flex items-center gap-1">SEO Tasks →</Link>
            <Link href="/seo-local/gbp/tasks"  className="rtm-btn-secondary text-sm inline-flex items-center gap-1">GBP Tasks →</Link>
            <Link href="/seo-local/yelp/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Yelp Tasks →</Link>
            <Link href="/seo-local/health"     className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Client Health →</Link>
          </div>
        </SectionWrapper>

        <SectionWrapper title="Recent Activity" description="Latest SEO & Local updates">
          <ActivityFeed items={activity} />
        </SectionWrapper>
      </div>
    </div>
  );
}
