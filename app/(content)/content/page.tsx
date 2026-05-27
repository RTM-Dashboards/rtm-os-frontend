"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, ActivityFeed } from "@/components/ui";
import type { ActivityItem } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("content")!;

const activity: ActivityItem[] = [
  { id: "1", actor: "Alex R.",   action: "published blog post for",   target: "Summit Landscaping", timestamp: "1h ago",  type: "task",   avatarColor: "#7C3AED" },
  { id: "2", actor: "Sarah K.",  action: "submitted social calendar for", target: "Apex Roofing",  timestamp: "2h ago",  type: "report", avatarColor: "#D97706" },
  { id: "3", actor: "Jordan M.", action: "completed email newsletter for","target": "Pacific Dental",timestamp: "3h ago", type: "task",   avatarColor: "#1B4FD8" },
  { id: "4", actor: "Alex R.",   action: "started landing page copy for", target: "Metro Dental",  timestamp: "4h ago",  type: "task",   avatarColor: "#7C3AED" },
];

const quickLinks = [
  { label: "Dashboard",    href: "/content",             icon: "📊", description: "Content overview",     accent: "#7C3AED" },
  { label: "Tasks",        href: "/content/tasks",        icon: "✅", description: "Open deliverables",    accent: "#1B4FD8" },
  { label: "Work Queue",   href: "/content/queue",        icon: "📂", description: "Content work queue",   accent: "#059669" },
  { label: "Clients",      href: "/content/clients",      icon: "👥", description: "Content clients",      accent: "#0891B2" },
  { label: "Performance",  href: "/content/performance",  icon: "📈", description: "Output metrics",       accent: "#D97706" },
  { label: "Reports",      href: "/content/reports",      icon: "📋", description: "Client reports",       accent: "#059669" },
];

export default function ContentDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Blog, social, copy, media and content delivery." />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Active Deliverables" value="32"  trend="down" trendValue="4"   iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)"  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
        <KpiCard title="Clients Managed"     value="148" trend="up"   trendValue="3"   iconBg="#ECFDF5"              iconColor="#059669"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <KpiCard title="Due This Week"       value="8"   trend="up"   trendValue="2"   iconBg="#FFFBEB"              iconColor="#D97706"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="On-Time Rate"        value="94%" trend="up"   trendValue="2%"  iconBg="#F5F3FF"              iconColor="#7C3AED"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      <WorkspaceQuickLinks links={quickLinks} title="Content Workspace — Navigation" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Recent Activity" description="Latest content updates" className="lg:col-span-2">
          <ActivityFeed items={activity} />
          <div className="mt-4 flex gap-2">
            <Link href="/content/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">View Tasks →</Link>
            <Link href="/content/queue" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Work Queue →</Link>
          </div>
        </SectionWrapper>

        <SectionWrapper title="Quick Stats" description="This week">
          <div className="space-y-3">
            {[
              { label: "Blog posts written",      value: "12", color: "#7C3AED" },
              { label: "Social posts scheduled",  value: "48", color: "#2563EB" },
              { label: "Emails sent",              value: "9",  color: "#059669" },
              { label: "Copy pieces delivered",   value: "7",  color: "#D97706" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{s.label}</p>
                <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
}
